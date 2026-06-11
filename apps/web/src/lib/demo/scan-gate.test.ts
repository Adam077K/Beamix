import { describe, it, expect } from 'vitest'
import { isDemoScan } from './scan-gate'
import { DEMO_SCAN_ID } from './index'

describe('isDemoScan', () => {
  // ---- match: returns the fixture object ----------------------------------------

  it('returns a non-null object when called with DEMO_SCAN_ID', () => {
    const result = isDemoScan(DEMO_SCAN_ID)
    expect(result).not.toBeNull()
    expect(typeof result).toBe('object')
  })

  it('returned object has an id property equal to DEMO_SCAN_ID', () => {
    const result = isDemoScan(DEMO_SCAN_ID) as { id: string }
    expect(result.id).toBe(DEMO_SCAN_ID)
  })

  // ---- non-match: returns null --------------------------------------------------

  it('returns null for an empty string', () => {
    expect(isDemoScan('')).toBeNull()
  })

  it('returns null for a random valid-looking UUID', () => {
    expect(isDemoScan('550e8400-e29b-41d4-a716-446655440000')).toBeNull()
  })

  it('returns null for a UUID that differs from DEMO_SCAN_ID by one character (one-char-off invariant)', () => {
    // Flip the last character of DEMO_SCAN_ID to produce a near-miss.
    const lastChar = DEMO_SCAN_ID[DEMO_SCAN_ID.length - 1]
    const replacement = lastChar === '0' ? '1' : '0'
    const nearMiss =
      DEMO_SCAN_ID.slice(0, DEMO_SCAN_ID.length - 1) + replacement
    expect(nearMiss).not.toBe(DEMO_SCAN_ID) // sanity
    expect(isDemoScan(nearMiss)).toBeNull()
  })
})
