import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { decrypt } from '@/lib/crypto'
import { Octokit } from 'octokit'

export async function GET(request: NextRequest) {
    const clerkUser = await currentUser()
    if (!clerkUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, clerkUser.id),
    })

    if (!dbUser?.githubAccessToken) {
        return NextResponse.json({ error: 'No GitHub token', repos: [] }, { status: 200 })
    }

    try {
        const token = decrypt(dbUser.githubAccessToken)
        const octokit = new Octokit({ auth: token })

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') ?? '1')

        const { data } = await octokit.rest.repos.listForAuthenticatedUser({
            sort: 'updated',
            per_page: 30,
            page,
            type: 'owner',
        })

        const repos = data.map((r) => ({
            id: r.id.toString(),
            name: r.name,
            fullName: r.full_name,
            description: r.description,
            language: r.language,
            isPrivate: r.private,
            defaultBranch: r.default_branch,
            stargazersCount: r.stargazers_count,
            updatedAt: r.updated_at,
            htmlUrl: r.html_url,
        }))

        return NextResponse.json({ repos })
    } catch (error) {
        console.error('GitHub repos error:', error)
        return NextResponse.json({ error: 'Failed to fetch repos' }, { status: 500 })
    }
}
