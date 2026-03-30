import { NextRequest, NextResponse } from 'next/server'
import { currentUser, clerkClient } from '@clerk/nextjs/server'
import { Octokit } from 'octokit'
import { db } from '@/db'
import { users, repositories } from '@/db/schema'
import { eq } from 'drizzle-orm'
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
            where: eq(repositories.id, repoId),
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
        const numberedContent = lines.map((l, i) => `${i + 1}: ${l}`).join('\n')

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
            overall_score: analysis.overall_score ?? 100,
            annotations: (analysis.annotations ?? []).filter(a => a.line >= 1 && a.line <= lines.length),
            content: rawContent,
            filePath,
        } satisfies FileAnalysisResult)
    } catch (err) {
        console.error('[analyze/file]', err)
        return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
    }
}
