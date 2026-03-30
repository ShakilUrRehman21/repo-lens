import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

const ADMIN_IDS = (process.env.ADMIN_USER_IDS ?? '').split(',').filter(Boolean)

export async function POST(
    _request: NextRequest,
    { params }: { params: { userId: string } }
) {
    const clerkUser = await currentUser()
    if (!clerkUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!ADMIN_IDS.includes(clerkUser.id)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const userId = parseInt(params.userId)

    // Delete the user (cascades to repos, scans, etc.)
    await db.delete(users).where(eq(users.id, userId))

    return NextResponse.json({ success: true })
}
