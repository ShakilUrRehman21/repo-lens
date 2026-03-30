import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { db } from '@/db'
import { scans, repositories } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { currentUser } from '@clerk/nextjs/server'

export async function POST(
    _req: NextRequest,
    { params }: { params: { scanId: string } }
) {
    const clerkUser = await currentUser()
    if (!clerkUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const scanId = parseInt(params.scanId)
    const scan = await db.query.scans.findFirst({ where: eq(scans.id, scanId) })
    if (!scan) return NextResponse.json({ error: 'Scan not found' }, { status: 404 })

    // Reuse existing token or create a new one
    const token = scan.shareToken ?? crypto.randomBytes(16).toString('hex')

    if (!scan.shareToken) {
        await db.update(scans).set({ shareToken: token }).where(eq(scans.id, scanId))
    }

    const url = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/share/${token}`
    return NextResponse.json({ url, token })
}

export async function GET(
    _req: NextRequest,
    { params }: { params: { scanId: string } }
) {
    try {
        // params.scanId is actually the token when called from /share/[token]
        const token = params.scanId

        const scan = await db.query.scans.findFirst({
            where: eq(scans.shareToken, token),
            with: {
                repository: true,
            },
        })

        if (!scan) return NextResponse.json({ error: 'Invalid or expired share link' }, { status: 404 })

        // Don't expose sensitive scan data
        const { shareToken: _token, ...publicScan } = scan
        return NextResponse.json({ scan: publicScan })
    } catch (err) {
        console.error('[share/GET]', err)
        return NextResponse.json({ error: 'Failed to load report' }, { status: 500 })
    }
}
