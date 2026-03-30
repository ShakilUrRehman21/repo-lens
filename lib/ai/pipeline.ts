import { Octokit } from 'octokit'
import { generateStructuredJSON } from './gemini-client'
import {
    FILE_ANALYSIS_PROMPT,
    ARCHITECTURE_PROMPT,
    SECURITY_PROMPT,
    SCALABILITY_PROMPT,
    DEBT_PROMPT,
} from './prompts'
import { calculateOverallScore } from './scoring'
import { db } from '@/db'
import { scans, fileReviews, repositories } from '@/db/schema'
import { eq } from 'drizzle-orm'
import type { Issue } from '@/db/schema'

const SKIP_DIRS = ['node_modules', 'dist', 'build', 'coverage', '.git', '.next', 'out', '__pycache__']
const SKIP_EXTS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.mp3', '.pdf', '.zip', '.lock']
const MAX_FILE_SIZE = 200 * 1024 // 200KB

type FileAnalysisResult = {
    file_score: number
    risk_level: string
    issues: Issue[]
}

type ArchitectureResult = {
    architecture_score: number
    pattern: string
    coupling: string
    summary: string
    issues: Issue[]
}

type SecurityResult = {
    security_score: number
    summary: string
    issues: Issue[]
}

type ScalabilityResult = {
    scalability_score: number
    performance_score: number
    summary: string
    issues: Issue[]
}

type DebtResult = {
    technical_debt_index: number
    maintainability_score: number
    high_risk_files: string[]
    urgency_score: number
    refactor_priority: { file: string; reason: string; estimated_effort: string }[]
    summary: string
}

async function updateScanProgress(scanId: number, message: string) {
    await db
        .update(scans)
        .set({ progressMessage: message, scanStatus: 'processing' })
        .where(eq(scans.id, scanId))
}

export async function runAnalysisPipeline(
    scanId: number,
    repoFullName: string,
    githubToken: string
) {
    const octokit = new Octokit({ auth: githubToken })

    try {
        // ── Stage 1: Fetch repo tree ──────────────────────────────
        await updateScanProgress(scanId, 'Fetching repository structure...')

        const [owner, repo] = repoFullName.split('/')
        const { data: treeData } = await octokit.rest.git.getTree({
            owner,
            repo,
            tree_sha: 'HEAD',
            recursive: 'true',
        })

        const codeFiles = treeData.tree.filter((item) => {
            if (item.type !== 'blob') return false
            if (!item.path) return false
            const parts = item.path.split('/')
            if (parts.some((p) => SKIP_DIRS.includes(p))) return false
            if (SKIP_EXTS.some((ext) => item.path!.endsWith(ext))) return false
            if ((item.size ?? 0) > MAX_FILE_SIZE) return false
            return true
        })

        const structureText = treeData.tree
            .filter((i) => i.type === 'tree')
            .map((i) => i.path)
            .join('\n')

        // ── Stage 2: Architecture Analysis ───────────────────────
        await updateScanProgress(scanId, 'Analyzing architecture patterns...')

        const archResult = await generateStructuredJSON<ArchitectureResult>(
            ARCHITECTURE_PROMPT(structureText)
        )

        // ── Stage 3: Fetch file contents (limit to 30 most relevant) ──
        await updateScanProgress(scanId, 'Scanning individual files...')

        const filesToAnalyze = codeFiles.slice(0, 30)
        const fileContents: { path: string; content: string }[] = []

        await Promise.allSettled(
            filesToAnalyze.map(async (file) => {
                try {
                    const { data } = await octokit.rest.repos.getContent({
                        owner,
                        repo,
                        path: file.path!,
                    })
                    if ('content' in data && data.content) {
                        const content = Buffer.from(data.content, 'base64').toString('utf-8')
                        fileContents.push({ path: file.path!, content })
                    }
                } catch {
                    // Skip files that can't be fetched
                }
            })
        )

        // ── Stage 4: File-Level Analysis (sequential batches to avoid rate limits) ──
        await updateScanProgress(scanId, 'Performing file-level code analysis...')

        const BATCH_SIZE = 3
        const BATCH_DELAY_MS = 1500

        const fileReviewsData: {
            scanId: number
            filePath: string
            fileScore: number
            issuesDetected: Issue[]
            riskLevel: string
        }[] = []

        for (let i = 0; i < fileContents.length; i += BATCH_SIZE) {
            const batch = fileContents.slice(i, i + BATCH_SIZE)
            const batchResults = await Promise.allSettled(
                batch.map((f) =>
                    generateStructuredJSON<FileAnalysisResult>(
                        FILE_ANALYSIS_PROMPT(f.path, f.content)
                    )
                )
            )
            batchResults.forEach((result, j) => {
                if (result.status === 'fulfilled') {
                    fileReviewsData.push({
                        scanId,
                        filePath: batch[j].path,
                        fileScore: result.value.file_score,
                        issuesDetected: result.value.issues ?? [],
                        riskLevel: result.value.risk_level ?? 'low',
                    })
                }
            })
            // Throttle between batches (except after the last one)
            if (i + BATCH_SIZE < fileContents.length) {
                await new Promise(r => setTimeout(r, BATCH_DELAY_MS))
            }
        }


        // Store file reviews in DB
        if (fileReviewsData.length > 0) {
            await db.insert(fileReviews).values(fileReviewsData)
        }

        // ── Stage 5: Security Scan ────────────────────────────────
        await updateScanProgress(scanId, 'Scanning for security vulnerabilities...')

        const securityFiles = fileContents.slice(0, 15)
        const secResult = await generateStructuredJSON<SecurityResult>(
            SECURITY_PROMPT(securityFiles)
        )

        // ── Stage 6: Scalability Review ───────────────────────────
        await updateScanProgress(scanId, 'Evaluating scalability and performance...')

        const scaleResult = await generateStructuredJSON<ScalabilityResult>(
            SCALABILITY_PROMPT(fileContents.slice(0, 15))
        )

        // ── Stage 7: Technical Debt Index ─────────────────────────
        await updateScanProgress(scanId, 'Calculating technical debt index...')

        const fileScoreInputs = fileReviewsData.map((f) => ({
            path: f.filePath,
            score: f.fileScore ?? 50,
            issues: f.issuesDetected?.length ?? 0,
        }))

        const debtResult = await generateStructuredJSON<DebtResult>(
            DEBT_PROMPT(fileScoreInputs)
        )

        // ── Stage 8: Aggregate & Store Final Score ────────────────
        const scores = {
            architectureScore: archResult.architecture_score,
            securityScore: secResult.security_score,
            maintainabilityScore: debtResult.maintainability_score,
            scalabilityScore: scaleResult.scalability_score,
            performanceScore: scaleResult.performance_score,
        }

        const overallScore = calculateOverallScore(scores)

        await db
            .update(scans)
            .set({
                scanStatus: 'completed',
                progressMessage: 'Analysis complete',
                overallScore,
                architectureScore: scores.architectureScore,
                securityScore: scores.securityScore,
                maintainabilityScore: scores.maintainabilityScore,
                scalabilityScore: scores.scalabilityScore,
                performanceScore: scores.performanceScore,
                technicalDebtIndex: debtResult.technical_debt_index,
                architectureSummary: archResult.summary,
                securitySummary: secResult.summary,
                improvementSummary: debtResult.summary,
            })
            .where(eq(scans.id, scanId))

        // Update repository's lastScannedAt so the repos page shows the correct date
        const scan = await db.query.scans.findFirst({ where: eq(scans.id, scanId) })
        if (scan?.repoId) {
            await db
                .update(repositories)
                .set({ lastScannedAt: new Date() })
                .where(eq(repositories.id, scan.repoId))
        }

        return { success: true, overallScore }
    } catch (error) {
        await db
            .update(scans)
            .set({
                scanStatus: 'failed',
                progressMessage: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            })
            .where(eq(scans.id, scanId))
        throw error
    }
}
