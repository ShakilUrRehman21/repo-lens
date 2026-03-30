import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/db'
import { users, repositories, scans, fileReviews } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
    try {
        const clerkUser = await currentUser()
        if (!clerkUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, clerkUser.id) })
        if (!dbUser) return NextResponse.json({ scan: null })

        const userRepos = await db.query.repositories.findMany({
            where: eq(repositories.userId, dbUser.id),
        })
        if (!userRepos.length) return NextResponse.json({ scan: null })

        const repoIds = userRepos.map(r => r.id)

        // Get the most recent completed scan across all repos
        const latestScans = await db.query.scans.findMany({
            where: (s, { inArray }) => inArray(s.repoId, repoIds),
            orderBy: (s, { desc }) => [desc(s.createdAt)],
            limit: 20,
        })

        const completedScan = latestScans.find(s => s.scanStatus === 'completed')
        if (!completedScan) return NextResponse.json({ scan: null })

        const reviews = await db.query.fileReviews.findMany({
            where: eq(fileReviews.scanId, completedScan.id),
        })

        return NextResponse.json({
            scan: {
                ...completedScan,
                fileReviews: reviews,
                repository: userRepos.find(r => r.id === completedScan.repoId) ?? null,
            }
        })
    } catch (err) {
        console.error('[scans/latest] Error:', err)
        return NextResponse.json({ scan: null })
    }
}
