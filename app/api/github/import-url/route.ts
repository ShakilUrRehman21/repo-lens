import { NextRequest, NextResponse } from 'next/server'
import { currentUser, clerkClient } from '@clerk/nextjs/server'
import { db } from '@/db'
import { users, repositories } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { Octokit } from 'octokit'
import { decrypt, encrypt } from '@/lib/crypto'

function parseGithubUrl(url: string): { owner: string; repo: string } | null {
    try {
        const clean = url.replace(/\.git$/, '').trim()
        const match = clean.match(/(?:github\.com\/)?([^/?#\s]+)\/([^/?#\s]+)/)
        if (match) return { owner: match[1], repo: match[2] }
    } catch { }
    return null
}

export async function POST(request: NextRequest) {
    try {
        const clerkUser = await currentUser()
        if (!clerkUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const { url } = body
        if (!url) return NextResponse.json({ error: 'GitHub URL required' }, { status: 400 })

        const parsed = parseGithubUrl(url)
        if (!parsed) {
            return NextResponse.json(
                { error: 'Invalid GitHub URL. Use format: https://github.com/owner/repo' },
                { status: 400 }
            )
        }

        const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, clerkUser.id) })

        // Get GitHub token — from DB or fresh from Clerk OAuth
        let githubToken: string | null = null
        if (dbUser?.githubAccessToken) {
            githubToken = decrypt(dbUser.githubAccessToken)
        } else {
            try {
                const client = await clerkClient()
                const tokens = await client.users.getUserOauthAccessToken(clerkUser.id, 'oauth_github')
                githubToken = tokens.data?.[0]?.token ?? null
            } catch (e) {
                console.error('Failed to get Clerk OAuth token:', e)
            }
        }

        if (!githubToken) {
            return NextResponse.json(
                { error: 'No GitHub access token found. Please sign in with GitHub.' },
                { status: 400 }
            )
        }

        const octokit = new Octokit({ auth: githubToken })

        let repoData
        try {
            const { data } = await octokit.rest.repos.get({ owner: parsed.owner, repo: parsed.repo })
            repoData = data
        } catch (err: any) {
            if (err.status === 404) {
                return NextResponse.json(
                    { error: `Repository "${parsed.owner}/${parsed.repo}" not found or is private with no access.` },
                    { status: 404 }
                )
            }
            return NextResponse.json({ error: 'Failed to fetch repository from GitHub.' }, { status: 500 })
        }

        // Ensure user row exists in DB
        let userId = dbUser?.id
        if (!dbUser) {
            const [newUser] = await db.insert(users).values({
                clerkId: clerkUser.id,
                email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
                plan: 'free',
                githubAccessToken: githubToken ? encrypt(githubToken) : null,
            }).returning()
            userId = newUser.id
        }

        // Check if already imported
        const existing = await db.query.repositories.findFirst({
            where: and(
                eq(repositories.userId, userId!),
                eq(repositories.githubRepoId, repoData.id.toString())
            ),
        })

        if (existing) {
            return NextResponse.json({ repo: existing, alreadyImported: true })
        }

        const [repo] = await db.insert(repositories).values({
            userId: userId!,
            githubRepoId: repoData.id.toString(),
            repoName: repoData.name,
            fullName: repoData.full_name,
            description: repoData.description ?? null,
            defaultBranch: repoData.default_branch,
            language: repoData.language ?? null,
            isPrivate: repoData.private ? 'true' : 'false',
        }).returning()

        return NextResponse.json({ repo })
    } catch (err) {
        console.error('[import-url] Unhandled error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
