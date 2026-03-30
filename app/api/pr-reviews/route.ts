import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/db'
import { users, pullRequestReviews, repositories } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { decrypt } from '@/lib/crypto'
import { Octokit } from 'octokit'
import { generateStructuredJSON } from '@/lib/ai/gemini-client'
import { PR_REVIEW_PROMPT } from '@/lib/ai/prompts'

type PRResult = {
    risk_score: number
    breaking_change_probability: number
    overall_quality: string
    summary: string
    issues: { file: string; problem: string; severity: string; suggestion: string }[]
    pr_comment: string
}

export async function GET() {
    const clerkUser = await currentUser()
    if (!clerkUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, clerkUser.id) })
    if (!dbUser) return NextResponse.json({ reviews: [] })

    const userRepos = await db.query.repositories.findMany({ where: eq(repositories.userId, dbUser.id) })
    if (!userRepos.length) return NextResponse.json({ reviews: [] })

    const repoIds = userRepos.map(r => r.id)
    const reviews = await db.query.pullRequestReviews.findMany({
        where: (pr, { inArray }) => inArray(pr.repoId, repoIds),
        orderBy: (pr, { desc }) => [desc(pr.createdAt)],
        limit: 20,
    })

    return NextResponse.json({ reviews })
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

    // Fetch PR details and diff
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

    // Store review
    const [review] = await db.insert(pullRequestReviews).values({
        repoId,
        prNumber,
        prTitle: prData.data.title,
        riskScore: result.risk_score,
        breakingChangeProbability: result.breaking_change_probability,
        reviewSummary: result.summary,
        issues: result.issues as import('@/db/schema').Issue[],
    }).returning()

    // Post comment to PR (if Pro plan)
    if (dbUser.plan === 'pro' && result.pr_comment) {
        try {
            await octokit.rest.issues.createComment({
                owner, repo: repoName, issue_number: prNumber,
                body: result.pr_comment,
            })
            await db.update(pullRequestReviews)
                .set({ postedToGitHub: 'true' })
                .where(eq(pullRequestReviews.id, review.id))
        } catch { /* Post failure is non-fatal */ }
    }

    return NextResponse.json({ review: { ...review, issues: result.issues as import('@/db/schema').Issue[] } })
}
