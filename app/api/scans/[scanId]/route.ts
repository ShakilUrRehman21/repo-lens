import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/db'
import { expireIfStale } from '@/lib/scan-staleness'
import { requireOwnedScan } from '@/lib/scan-access'
import { scans, repositories } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
    _request: NextRequest,
    { params }: { params: { scanId: string } }
) {
    const clerkUser = await currentUser()
    if (!clerkUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const access = await requireOwnedScan(params.scanId)
    if ('error' in access) return access.error
    const scanId = access.scanId
    const scan = await db.query.scans.findFirst({
        where: eq(scans.id, scanId),
        with: {
            fileReviews: true,
        },
    })

    if (!scan) {
        return NextResponse.json({ error: 'Scan not found' }, { status: 404 })
    }

    return NextResponse.json({ scan: await expireIfStale(scan) })
}
