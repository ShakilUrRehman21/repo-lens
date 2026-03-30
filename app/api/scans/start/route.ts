import { NextRequest, NextResponse } from 'next/server'
import { currentUser, clerkClient } from '@clerk/nextjs/server'
import { db } from '@/db'
import { users, repositories, scans, usageLogs } from '@/db/schema'
import { eq, and, gte, count } from 'drizzle-orm'
import { decrypt, encrypt } from '@/lib/crypto'
import { runAnalysisPipeline } from '@/lib/ai/pipeline'

export async function POST(request: NextRequest) {
    try {
        const clerkUser = await currentUser()
        if (!clerkUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { repoId } = await request.json()
        if (!repoId) return NextResponse.json({ error: 'repoId is required' }, { status: 400 })

        let dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, clerkUser.id) })
        if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

        // Rate limit: free = 3 scans/day
        if (dbUser.plan === 'free') {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const [result] = await db
                .select({ value: count() })
                .from(usageLogs)
                .where(and(eq(usageLogs.userId, dbUser.id), gte(usageLogs.timestamp, today)))

            if ((result?.value ?? 0) >= 7) {
                return NextResponse.json(
                    { error: 'Daily scan limit reached. Upgrade to Pro for unlimited scans.' },
                    { status: 429 }
                )
            }
        }

        const repo = await db.query.repositories.findFirst({
            where: and(eq(repositories.id, repoId), eq(repositories.userId, dbUser.id)),
        })
        if (!repo) return NextResponse.json({ error: 'Repository not found' }, { status: 404 })

        // Auto-fetch GitHub token from Clerk if not stored
        if (!dbUser.githubAccessToken) {
            try {
                const client = await clerkClient()
                const tokens = await client.users.getUserOauthAccessToken(clerkUser.id, 'oauth_github')
                const token = tokens.data?.[0]?.token
                if (token) {
                    const [updated] = await db.update(users)
                        .set({ githubAccessToken: encrypt(token) })
                        .where(eq(users.clerkId, clerkUser.id))
                        .returning()
                    dbUser = updated
                }
            } catch (e) {
                console.error('Failed to fetch Clerk GitHub token:', e)
            }
        }

        if (!dbUser.githubAccessToken) {
            return NextResponse.json(
                { error: 'No GitHub token found. Please sign in with GitHub to enable scanning.' },
                { status: 400 }
            )
        }

        // Create scan record
        const [scan] = await db
            .insert(scans)
            .values({ repoId, scanStatus: 'pending', progressMessage: 'Starting analysis...' })
            .returning()

        // Log usage
        await db.insert(usageLogs).values({ userId: dbUser.id, scanType: 'full', tokensUsed: 0 })

        // Run pipeline in background (non-blocking)
        const token = decrypt(dbUser.githubAccessToken)
        runAnalysisPipeline(scan.id, repo.fullName, token).catch(console.error)

        return NextResponse.json({ scanId: scan.id, status: 'pending' })
    } catch (err) {
        console.error('[scans/start] Error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

