import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/db'
import { users, repositories } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(request: NextRequest) {
    const clerkUser = await currentUser()
    if (!clerkUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { githubRepoId, repoName, fullName, description, defaultBranch, language, isPrivate } = body

    if (!githubRepoId || !repoName || !fullName) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, clerkUser.id),
    })
    if (!dbUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if already imported
    const existing = await db.query.repositories.findFirst({
        where: and(
            eq(repositories.userId, dbUser.id),
            eq(repositories.githubRepoId, githubRepoId.toString())
        ),
    })

    if (existing) {
        return NextResponse.json({ repo: existing, alreadyImported: true })
    }

    const [repo] = await db
        .insert(repositories)
        .values({
            userId: dbUser.id,
            githubRepoId: githubRepoId.toString(),
            repoName,
            fullName,
            description,
            defaultBranch: defaultBranch ?? 'main',
            language,
            isPrivate: isPrivate ? 'true' : 'false',
        })
        .returning()

    return NextResponse.json({ repo })
}
