import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/db'
import { users, repositories } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { decrypt } from '@/lib/crypto'
import { Octokit } from 'octokit'
import { generateStructuredJSON } from '@/lib/ai/gemini-client'
import { PR_REVIEW_PROMPT } from '@/lib/ai/prompts'
import { pullRequestReviews } from '@/db/schema'

type PRResult = {
    risk_score: number
    breaking_change_probability: number
    summary: string
    issues: { file: string; problem: string; severity: string; suggestion: string }[]
    pr_comment: string
}

export async function POST(request: NextRequest) {
    const clerkUser = await currentUser()
    if (!clerkUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { repoId, prNumber } = await request.json()
    if (!repoId || !prNumber) return NextResponse.json({ error: 'repoId and prNumber required' }, { status: 400 })

    const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, clerkUser.id) })
    if (!dbUser?.githubAccessToken) return NextResponse.json({ error: 'No GitHub token' }, { status: 400 })

    const repo = await db.query.repositories.findFirst({
        where: (r, { and, eq }) => and(eq(r.id, repoId), eq(r.userId, dbUser.id)),
    })
    if (!repo) return NextResponse.json({ error: 'Repository not found' }, { status: 404 })

    const token = decrypt(dbUser.githubAccessToken)
    const octokit = new Octokit({ auth: token })
    const [owner, repoName] = repo.fullName.split('/')

    const [prData, diffResponse] = await Promise.all([
        octokit.rest.pulls.get({ owner, repo: repoName, pull_number: prNumber }),
        octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
            owner, repo: repoName, pull_number: prNumber,
            headers: { accept: 'application/vnd.github.v3.diff' },
        }),
    ])

    const diff = typeof diffResponse.data === 'string' ? diffResponse.data : ''
    const result = await generateStructuredJSON<PRResult>(
        PR_REVIEW_PROMPT(diff, prData.data.title)
    )

    const [review] = await db.insert(pullRequestReviews).values({
        repoId,
        prNumber,
        prTitle: prData.data.title,
        riskScore: result.risk_score,
        breakingChangeProbability: result.breaking_change_probability,
        reviewSummary: result.summary,
        issues: result.issues as import('@/db/schema').Issue[],
    }).returning()

    return NextResponse.json({ review: { ...review, issues: result.issues as import('@/db/schema').Issue[] } })
}
