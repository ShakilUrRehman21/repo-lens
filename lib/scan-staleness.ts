import { and, eq, inArray } from 'drizzle-orm'
import { db } from '@/db'
import { scans } from '@/db/schema'

/** A scan that has not finished within this window is treated as dead. */
export const SCAN_TIMEOUT_MS = 12 * 60 * 1000

type ScanLike = { id: number; scanStatus: string; createdAt: Date | string }

export function isStale(scan: ScanLike): boolean {
    if (scan.scanStatus !== 'pending' && scan.scanStatus !== 'processing') return false
    return Date.now() - new Date(scan.createdAt).getTime() > SCAN_TIMEOUT_MS
}

/** Marks a stuck scan as failed so the UI stops waiting on it. Returns the scan as it should be shown. */
export async function expireIfStale<T extends ScanLike>(scan: T): Promise<T> {
    if (!isStale(scan)) return scan
    const progressMessage = 'Scan timed out before finishing. Please start a new scan.'
    await db
        .update(scans)
        .set({ scanStatus: 'failed', progressMessage })
        .where(and(eq(scans.id, scan.id), inArray(scans.scanStatus, ['pending', 'processing'])))
    return { ...scan, scanStatus: 'failed', progressMessage }
}
