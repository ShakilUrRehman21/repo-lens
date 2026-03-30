import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
    throw new Error(
        'DATABASE_URL environment variable is not set. ' +
        'Check your .env.local file.'
    )
}

// Strip unsupported params for Neon serverless driver
const cleanUrl = connectionString.replace(/[&?]channel_binding=[^&]*/g, '')

const sql = neon(cleanUrl)
export const db = drizzle(sql, { schema })

