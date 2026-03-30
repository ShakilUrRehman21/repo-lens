import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/db'
import { users, scans, usageLogs } from '@/db/schema'
import { count, sum, eq } from 'drizzle-orm'

const ADMIN_IDS = (process.env.ADMIN_USER_IDS ?? '').split(',').filter(Boolean)

export async function GET() {
    const clerkUser = await currentUser()
    if (!clerkUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!ADMIN_IDS.includes(clerkUser.id)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const [
        [{ value: totalUsers }],
        [{ value: totalScans }],
        [{ value: completedScans }],
        [{ value: failedScans }],
        [{ value: totalTokensUsed }],
    ] = await Promise.all([
        db.select({ value: count() }).from(users),
        db.select({ value: count() }).from(scans),
        db.select({ value: count() }).from(scans).where(eq(scans.scanStatus, 'completed')),
        db.select({ value: count() }).from(scans).where(eq(scans.scanStatus, 'failed')),
        db.select({ value: sum(usageLogs.tokensUsed) }).from(usageLogs),
    ])

    return NextResponse.json({
        stats: {
            totalUsers,
            totalScans,
            completedScans,
            failedScans,
            totalTokensUsed: Number(totalTokensUsed ?? 0),
        },
    })
}
