import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { db } from '@/db'
import { repositories, users, pullRequestReviews } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { decrypt } from '@/lib/crypto'
import { Octokit } from 'octokit'
import { generateStructuredJSON } from '@/lib/ai/gemini-client'
import { PR_REVIEW_PROMPT } from '@/lib/ai/prompts'

type PRResult = {
    risk_score: number
    breaking_change_probability: number
    summary: string
    issues: { file: string; problem: string; severity: string; suggestion: string }[]
    pr_comment: string
}

function verifySignature(payload: string, signature: string, secret: string): boolean {
    const hash = `sha256=${crypto.createHmac('sha256', secret).update(payload).digest('hex')}`
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature))
}

export async function POST(request: NextRequest) {
    const body = await request.text()
    const signature = request.headers.get('x-hub-signature-256') ?? ''
    const event = request.headers.get('x-github-event') ?? ''

    const secret = process.env.GITHUB_WEBHOOK_SECRET
    if (secret && !verifySignature(body, signature, secret)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    if (event !== 'pull_request') {
        return NextResponse.json({ ignored: true })
    }

    const payload = JSON.parse(body)
    if (!['opened', 'synchronize'].includes(payload.action)) {
        return NextResponse.json({ ignored: true })
    }

    const githubRepoId = payload.repository.id.toString()
    const prNumber = payload.number
    const prTitle = payload.pull_request.title

    // Find repo in our DB
    const repo = await db.query.repositories.findFirst({
        where: eq(repositories.githubRepoId, githubRepoId),
    })
    if (!repo) return NextResponse.json({ ignored: true })

    const dbUser = await db.query.users.findFirst({
        where: eq(users.id, repo.userId),
    })
    if (!dbUser?.githubAccessToken) return NextResponse.json({ ignored: true })

        // Run async — don't block the webhook response
        ; (async () => {
            try {
                const token = decrypt(dbUser.githubAccessToken!)
                const octokit = new Octokit({ auth: token })
                const [owner, repoName] = repo.fullName.split('/')

                const diffResponse = await octokit.request(
                    'GET /repos/{owner}/{repo}/pulls/{pull_number}',
                    { owner, repo: repoName, pull_number: prNumber, headers: { accept: 'application/vnd.github.v3.diff' } }
                )

                const diff = typeof diffResponse.data === 'string' ? diffResponse.data : ''
                const result = await generateStructuredJSON<PRResult>(PR_REVIEW_PROMPT(diff, prTitle))

                const [review] = await db.insert(pullRequestReviews).values({
                    repoId: repo.id,
                    prNumber,
                    prTitle,
                    riskScore: result.risk_score,
                    breakingChangeProbability: result.breaking_change_probability,
                    reviewSummary: result.summary,
                    issues: result.issues as import('@/db/schema').Issue[],
                }).returning()

                // Auto-comment on PR
                if (result.pr_comment) {
                    await octokit.rest.issues.createComment({
                        owner, repo: repoName, issue_number: prNumber,
                        body: result.pr_comment,
                    })
                    await db.update(pullRequestReviews)
                        .set({ postedToGitHub: 'true' })
                        .where(eq(pullRequestReviews.id, review.id))
                }
            } catch (err) {
                console.error('[Webhook] PR analysis failed:', err)
            }
        })()

    return NextResponse.json({ received: true })
}
