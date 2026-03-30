import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/db'
import { users, repositories } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
    const clerkUser = await currentUser()
    if (!clerkUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, clerkUser.id) })
    if (!dbUser) return NextResponse.json({ repos: [] })

    const repos = await db.query.repositories.findMany({
        where: eq(repositories.userId, dbUser.id),
        orderBy: (r, { desc }) => [desc(r.createdAt)],
    })

    return NextResponse.json({ repos })
}
