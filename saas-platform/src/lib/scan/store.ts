import type { ScanResults, ScanStatus } from '@/lib/types'

export interface ScanRecord {
  scan_id: string
  website_url: string
  business_name: string
  sector: string
  location: string
  status: ScanStatus
  results: ScanResults | null
  created_at: string
}

/**
 * In-memory scan store for mock mode.
 * Data is lost on server restart — this is intentional for MVP.
 * In production, this is replaced by the Supabase `free_scans` table.
 */
const scanStore = new Map<string, ScanRecord>()

export function getScan(scanId: string): ScanRecord | undefined {
  return scanStore.get(scanId)
}

export function setScan(scanId: string, record: ScanRecord): void {
  scanStore.set(scanId, record)
}

export function updateScan(
  scanId: string,
  updates: Partial<ScanRecord>
): ScanRecord | undefined {
  const existing = scanStore.get(scanId)
  if (!existing) return undefined
  const updated = { ...existing, ...updates }
  scanStore.set(scanId, updated)
  return updated
}
