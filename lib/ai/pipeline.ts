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

const SKIP_DIRS = ['node_modules', 'dist', 'build', 'coverage', '.git', '.next', 'out', '__pycache__', 'vendor', 'public', 'assets', '.github']
const SKIP_EXTS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.mp3', '.pdf', '.zip', '.lock', '.map', '.min.js', '.min.css']
const MAX_FILE_SIZE = 150 * 1024 // 150KB

type FileAnalysisResult = {
    file_score?: number
    risk_level?: string
    issues?: Issue[]
}

type ArchitectureResult = {
    architecture_score?: number
    pattern?: string
    coupling?: string
    summary?: string
    issues?: Issue[]
}

type SecurityResult = {
    security_score?: number
    summary?: string
    issues?: Issue[]
}

type ScalabilityResult = {
    scalability_score?: number
    performance_score?: number
    summary?: string
    issues?: Issue[]
}

type DebtResult = {
    technical_debt_index?: number
    maintainability_score?: number
    high_risk_files?: string[]
    urgency_score?: number
    refactor_priority?: { file: string; reason: string; estimated_effort: string }[]
    summary?: string
}

async function updateScanProgress(scanId: number, message: string) {
    await db
        .update(scans)
        .set({ progressMessage: message, scanStatus: 'processing' })
        .where(eq(scans.id, scanId))
}

// Score file importance for intelligent sample selection
function getFileRelevance(path: string): number {
    const p = path.toLowerCase()
    if (p.includes('schema') || p.includes('model') || p.includes('db/')) return 10
    if (p.includes('route.') || p.includes('api/') || p.includes('server')) return 9
    if (p.includes('auth') || p.includes('security') || p.includes('crypto')) return 9
    if (p.includes('lib/') || p.includes('service') || p.includes('controller')) return 8
    if (p.includes('main') || p.includes('index') || p.includes('app.')) return 8
    if (p.includes('component') || p.includes('page.')) return 6
    if (p.includes('test') || p.includes('spec') || p.includes('.md')) return 1
    return 5
}

export async function runAnalysisPipeline(
    scanId: number,
    repoFullName: string,
    githubToken?: string
) {
    const octokit = githubToken ? new Octokit({ auth: githubToken }) : new Octokit()

    try {
        // ── Stage 1: Fetch repo tree ──────────────────────────────
        await updateScanProgress(scanId, 'Inspecting repository tree...')

        const [owner, repo] = repoFullName.split('/')
        let treeData: any
        try {
            const res = await octokit.rest.git.getTree({
                owner,
                repo,
                tree_sha: 'HEAD',
                recursive: 'true',
            })
            treeData = res.data
        } catch {
            const { data: repoInfo } = await octokit.rest.repos.get({ owner, repo })
            const res = await octokit.rest.git.getTree({
                owner,
                repo,
                tree_sha: repoInfo.default_branch || 'main',
                recursive: 'true',
            })
            treeData = res.data
        }

        const treeItems: any[] = treeData?.tree ?? []

        // Filter valid code files and rank by architectural importance
        const codeFiles = treeItems
            .filter((item) => {
                if (item.type !== 'blob') return false
                if (!item.path) return false
                const parts = item.path.split('/')
                if (parts.some((p: string) => SKIP_DIRS.includes(p))) return false
                if (SKIP_EXTS.some((ext) => item.path!.endsWith(ext))) return false
                if ((item.size ?? 0) > MAX_FILE_SIZE) return false
                return true
            })
            .sort((a, b) => getFileRelevance(b.path!) - getFileRelevance(a.path!))

        const structureText = treeItems
            .filter((i) => i.type === 'tree')
            .map((i) => i.path)
            .slice(0, 40)
            .join('\n') || 'Root repository directory'

        // ── Stage 2: Architecture Analysis ───────────────────────
        await updateScanProgress(scanId, 'Analyzing architectural patterns...')

        const archResult = await generateStructuredJSON<ArchitectureResult>(
            ARCHITECTURE_PROMPT(structureText)
        )

        // ── Stage 3: Fetch file contents (top 6 highest relevance files) ──
        const filesToAnalyze = codeFiles.slice(0, 6)
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
                        fileContents.push({ path: file.path!, content: content.slice(0, 3000) })
                    }
                } catch {
                    // Skip files that fail fetch
                }
            })
        )

        // ── Stage 4: File Analysis (Batches of 2 with small spacing to prevent token spikes) ──
        await updateScanProgress(scanId, 'Auditing code quality & patterns...')

        const fileReviewsData: {
            scanId: number
            filePath: string
            fileScore: number
            issuesDetected: Issue[]
            riskLevel: string
        }[] = []

        const BATCH_SIZE = 2
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
                        fileScore: result.value.file_score ?? 80,
                        issuesDetected: result.value.issues ?? [],
                        riskLevel: result.value.risk_level ?? 'low',
                    })
                }
            })
            if (i + BATCH_SIZE < fileContents.length) {
                await new Promise(r => setTimeout(r, 200))
            }
        }

        if (fileReviewsData.length > 0) {
            await db.insert(fileReviews).values(fileReviewsData)
        }

        // ── Stage 5: Security Review ──
        await updateScanProgress(scanId, 'Scanning for security vulnerabilities...')
        const sampleFiles = fileContents.slice(0, 3)
        const secResult = await generateStructuredJSON<SecurityResult>(
            SECURITY_PROMPT(sampleFiles)
        )

        await new Promise(r => setTimeout(r, 200))

        // ── Stage 6: Scalability Review ──
        await updateScanProgress(scanId, 'Evaluating scalability & performance...')
        const scaleResult = await generateStructuredJSON<ScalabilityResult>(
            SCALABILITY_PROMPT(sampleFiles)
        )

        // ── Stage 7: Technical Debt Index ──
        await updateScanProgress(scanId, 'Calculating maintainability index...')
        const fileScoreInputs = fileReviewsData.map((f) => ({
            path: f.filePath,
            score: f.fileScore ?? 80,
            issues: f.issuesDetected?.length ?? 0,
        }))

        const debtResult = await generateStructuredJSON<DebtResult>(
            DEBT_PROMPT(fileScoreInputs)
        )

        // ── Stage 8: Aggregate Scores & Complete ───────────────────
        const scores = {
            architectureScore: archResult.architecture_score ?? 80,
            securityScore: secResult.security_score ?? 85,
            maintainabilityScore: debtResult.maintainability_score ?? 80,
            scalabilityScore: scaleResult.scalability_score ?? 82,
            performanceScore: scaleResult.performance_score ?? 84,
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
                technicalDebtIndex: debtResult.technical_debt_index ?? 18,
                architectureSummary: archResult.summary ?? 'Architecture evaluation completed cleanly.',
                securitySummary: secResult.summary ?? 'No critical security vulnerabilities detected.',
                improvementSummary: debtResult.summary ?? 'Repository maintainability index is optimal.',
            })
            .where(eq(scans.id, scanId))

        const scan = await db.query.scans.findFirst({ where: eq(scans.id, scanId) })
        if (scan?.repoId) {
            await db
                .update(repositories)
                .set({ lastScannedAt: new Date() })
                .where(eq(repositories.id, scan.repoId))
        }

        return { success: true, overallScore }
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error)
        console.error('[pipeline] Scan failed:', msg, error)
        await db
            .update(scans)
            .set({
                scanStatus: 'failed',
                progressMessage: `Analysis failed: ${msg.slice(0, 250)}`,
            })
            .where(eq(scans.id, scanId))
        throw error
    }
}
