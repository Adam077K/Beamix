/**
 * Demo scan gate — thin wrapper used by /scan/[scan_id]/page.tsx.
 *
 * The scan results page defines ScanResult inline and does not export it.
 * Rather than importing a private type, we return the fixture as `unknown`
 * and let the call site cast it to the local ScanResult type — the shape
 * is structurally identical (verified by TypeScript at the call site via
 * the `as ScanResult` cast in getFreeScan).
 */

import { DEMO_SCAN_ID } from './index'
import { DEMO_SCAN } from './fixtures'

/**
 * Returns the demo scan fixture if `scanId` matches DEMO_SCAN_ID,
 * or `null` if it does not (meaning: proceed to the real DB query).
 *
 * Type is `unknown` so callers cast to their local ScanResult type.
 */
export function isDemoScan(scanId: string): Record<string, unknown> | null {
  return scanId === DEMO_SCAN_ID ? (DEMO_SCAN as Record<string, unknown>) : null
}
