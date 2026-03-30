import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser, clerkClient } from '@clerk/nextjs/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { encrypt } from '@/lib/crypto'

async function getGithubTokenFromClerk(clerkUserId: string): Promise<string | null> {
    try {
        const client = await clerkClient()
        const tokens = await client.users.getUserOauthAccessToken(clerkUserId, 'oauth_github')
        return tokens.data?.[0]?.token ?? null
    } catch {
        return null
    }
}

export async function GET() {
    const clerkUser = await currentUser()
    if (!clerkUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, clerkUser.id),
    })

    // Auto-create user if first visit
    if (!dbUser) {
        const [newUser] = await db
            .insert(users)
            .values({
                clerkId: clerkUser.id,
                email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
                plan: 'free',
            })
            .returning()
        dbUser = newUser
    }

    // Auto-sync GitHub token from Clerk OAuth if not yet stored
    if (!dbUser.githubAccessToken) {
        const token = await getGithubTokenFromClerk(clerkUser.id)
        if (token) {
            const [updated] = await db
                .update(users)
                .set({ githubAccessToken: encrypt(token) })
                .where(eq(users.clerkId, clerkUser.id))
                .returning()
            dbUser = updated
        }
    }

    return NextResponse.json({ user: dbUser, hasGithubToken: !!dbUser?.githubAccessToken })
}

export async function POST(request: NextRequest) {
    const clerkUser = await currentUser()
    if (!clerkUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { githubAccessToken } = body

    const existingUser = await db.query.users.findFirst({
        where: eq(users.clerkId, clerkUser.id),
    })

    if (existingUser) {
        if (githubAccessToken) {
            await db
                .update(users)
                .set({ githubAccessToken: encrypt(githubAccessToken) })
                .where(eq(users.clerkId, clerkUser.id))
        }
        return NextResponse.json({ user: existingUser })
    }

    const [user] = await db
        .insert(users)
        .values({
            clerkId: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
            plan: 'free',
            githubAccessToken: githubAccessToken ? encrypt(githubAccessToken) : null,
        })
        .returning()

    return NextResponse.json({ user })
}
