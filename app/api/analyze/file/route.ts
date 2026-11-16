import { NextRequest, NextResponse } from 'next/server'
import { currentUser, clerkClient } from '@clerk/nextjs/server'
import { Octokit } from 'octokit'
import { db } from '@/db'
import { users, repositories, scans, fileReviews } from '@/db/schema'
import { and, desc, eq } from 'drizzle-orm'
import { codeExcerpt } from '@/lib/ai/excerpt'
import { generateStructuredJSON } from '@/lib/ai/gemini-client'
import { LINE_ANALYSIS_PROMPT } from '@/lib/ai/prompts'
import { decrypt, encrypt } from '@/lib/crypto'

export type LineAnnotation = {
    line: number
    type: 'bug' | 'vulnerability' | 'bad_practice' | 'performance' | 'security'
    severity: 'low' | 'medium' | 'high' | 'critical'
    title: string
    explanation: string
    suggestion: string
    fixed_code: string
}

export type FileAnalysisResult = {
    status: 'approved' | 'issues_found'
    summary: string
    overall_score: number
    annotations: LineAnnotation[]
    content: string
    filePath: string
}

export async function POST(request: NextRequest) {
    try {
        const clerkUser = await currentUser()
        if (!clerkUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { repoId, filePath } = await request.json()
        if (!repoId || !filePath) {
            return NextResponse.json({ error: 'repoId and filePath are required' }, { status: 400 })
        }

        let dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, clerkUser.id) })
        if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

        // Auto-fetch GitHub token from Clerk if not stored (same as scans/start)
        if (!dbUser.githubAccessToken) {
            try {
                const client = await clerkClient()
                const tokens = await client.users.getUserOauthAccessToken(clerkUser.id, 'oauth_github')
                const rawToken = tokens.data?.[0]?.token
                if (rawToken) {
                    const [updated] = await db.update(users)
                        .set({ githubAccessToken: encrypt(rawToken) })
                        .where(eq(users.clerkId, clerkUser.id))
                        .returning()
                    dbUser = updated
                }
            } catch { /* ignore */ }
        }

        if (!dbUser.githubAccessToken) {
            return NextResponse.json({ error: 'No GitHub token found. Please sign in with GitHub.' }, { status: 400 })
        }

        // Decrypt stored token before using with Octokit
        const githubToken = decrypt(dbUser.githubAccessToken)

        const repo = await db.query.repositories.findFirst({
            where: and(eq(repositories.id, Number(repoId)), eq(repositories.userId, dbUser.id)),
        })
        if (!repo) return NextResponse.json({ error: 'Repository not found' }, { status: 404 })

        const octokit = new Octokit({ auth: githubToken })
        const [owner, repoName] = repo.fullName.split('/')

        // Fetch file content from GitHub
        const { data } = await octokit.rest.repos.getContent({ owner, repo: repoName, path: filePath })

        if (!('content' in data)) {
            return NextResponse.json({ error: 'Not a file' }, { status: 400 })
        }

        const rawContent = Buffer.from(data.content, 'base64').toString('utf-8')
        const lines = rawContent.split('\n')

        // Reuse the findings from the latest completed scan instead of analyzing the file a second time.
        const latestScan = await db.query.scans.findFirst({
            where: and(eq(scans.repoId, repo.id), eq(scans.scanStatus, 'completed')),
            orderBy: [desc(scans.createdAt)],
        })
        const review = latestScan
            ? await db.query.fileReviews.findFirst({
                where: and(eq(fileReviews.scanId, latestScan.id), eq(fileReviews.filePath, filePath)),
            })
            : null
        if (review) {
            const issues = Array.isArray(review.issuesDetected) ? review.issuesDetected : []
            const severities = ['low', 'medium', 'high', 'critical']
            const annotations: LineAnnotation[] = []
            const unplaced: string[] = []
            for (const issue of issues) {
                const line = Number.parseInt(String((issue as { line?: unknown }).line ?? ''), 10)
                const severity = String(issue.severity ?? 'low').toLowerCase()
                if (Number.isFinite(line) && line >= 1 && line <= lines.length) {
                    annotations.push({
                        line,
                        type: severity === 'critical' || severity === 'high' ? 'bug' : 'bad_practice',
                        severity: (severities.includes(severity) ? severity : 'low') as LineAnnotation['severity'],
                        title: String(issue.problem ?? 'Issue').split(/[.:]/)[0].slice(0, 80),
                        explanation: String(issue.problem ?? ''),
                        suggestion: String(issue.suggestion ?? ''),
                        fixed_code: '',
                    })
                } else if (issue.problem) {
                    unplaced.push(String(issue.problem))
                }
            }
            const summary = issues.length === 0
                ? 'No significant issues found in this file.'
                : `${issues.length} issue${issues.length === 1 ? '' : 's'} found in the latest scan.` +
                  (unplaced.length ? ` Also noted: ${unplaced.join(' ')}` : '')
            return NextResponse.json({
                status: issues.length ? 'issues_found' : 'approved',
                summary,
                overall_score: Math.max(0, Math.min(100, Math.round(Number(review.fileScore) || 0))),
                annotations,
                content: rawContent,
                filePath,
            } satisfies FileAnalysisResult)
        }

        const numberedContent = codeExcerpt(rawContent, 12000, true)

        // Run AI line analysis
        const analysis = await generateStructuredJSON<{
            status: string
            summary: string
            overall_score: number
            annotations: LineAnnotation[]
        }>(LINE_ANALYSIS_PROMPT(filePath, numberedContent))

        return NextResponse.json({
            status: (analysis.status === 'issues_found' ? 'issues_found' : 'approved') as 'approved' | 'issues_found',
            summary: analysis.summary ?? '',
            overall_score: Math.max(0, Math.min(100, Math.round(Number(analysis.overall_score) || 0))),
            annotations: (Array.isArray(analysis.annotations) ? analysis.annotations : [])
                .map((a) => ({
                    ...a,
                    line: Number.parseInt(String(a.line), 10),
                    severity: (String(a.severity ?? 'low').toLowerCase() as LineAnnotation['severity']),
                }))
                .filter((a) => Number.isFinite(a.line) && a.line >= 1 && a.line <= lines.length),
            content: rawContent,
            filePath,
        } satisfies FileAnalysisResult)
    } catch (err) {
        console.error('[analyze/file]', err)
        return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
    }
}
