import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/db'
import { users } from '@/db/schema'

const ADMIN_IDS = (process.env.ADMIN_USER_IDS ?? '').split(',').filter(Boolean)

export async function GET() {
    const clerkUser = await currentUser()
    if (!clerkUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!ADMIN_IDS.includes(clerkUser.id)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const allUsers = await db.query.users.findMany({
        orderBy: (u, { desc }) => [desc(u.createdAt)],
        limit: 100,
    })

    return NextResponse.json({ users: allUsers })
}
