import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/db'
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

    const scanId = parseInt(params.scanId)
    const scan = await db.query.scans.findFirst({
        where: eq(scans.id, scanId),
        with: {
            fileReviews: true,
        },
    })

    if (!scan) {
        return NextResponse.json({ error: 'Scan not found' }, { status: 404 })
    }

    return NextResponse.json({ scan })
}
