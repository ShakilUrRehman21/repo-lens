import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { users, scans, repositories } from '@/db/schema'

type ScanAccess =
    | { error: NextResponse }
    | { scanId: number; userId: number }

/** Confirms the signed-in user owns the repository that the scan belongs to. */
export async function requireOwnedScan(rawScanId: string): Promise<ScanAccess> {
    const clerkUser = await currentUser()
    if (!clerkUser) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

    const scanId = Number.parseInt(rawScanId, 10)
    if (!Number.isFinite(scanId)) return { error: NextResponse.json({ error: 'Invalid scan id' }, { status: 400 }) }

    const notFound = { error: NextResponse.json({ error: 'Scan not found' }, { status: 404 }) }
    const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, clerkUser.id) })
    if (!dbUser) return notFound

    const scan = await db.query.scans.findFirst({ where: eq(scans.id, scanId), columns: { id: true, repoId: true } })
    if (!scan || scan.repoId == null) return notFound

    const repo = await db.query.repositories.findFirst({
        where: and(eq(repositories.id, scan.repoId), eq(repositories.userId, dbUser.id)),
        columns: { id: true },
    })
    if (!repo) return notFound

    return { scanId, userId: dbUser.id }
}
