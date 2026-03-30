import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/db'
import { users, scans, repositories } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET() {
    const clerkUser = await currentUser()
    if (!clerkUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, clerkUser.id) })
    if (!dbUser) return NextResponse.json({ scans: [] })

    // Get all repos for user
    const userRepos = await db.query.repositories.findMany({
        where: eq(repositories.userId, dbUser.id),
    })
    const repoIds = userRepos.map(r => r.id)
    if (repoIds.length === 0) return NextResponse.json({ scans: [] })

    // Get all scans across those repos
    const allScans = await db.query.scans.findMany({
        where: (s, { inArray }) => inArray(s.repoId, repoIds),
        orderBy: (s, { desc }) => [desc(s.createdAt)],
        limit: 50,
    })

    return NextResponse.json({ scans: allScans })
}
