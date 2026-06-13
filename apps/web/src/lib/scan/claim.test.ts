/**
 * Tests for claimFreeScan (src/lib/scan/claim.ts).
 *
 * Mocked:
 *   @/lib/supabase/server     — anon client (auth.getUser only)
 *   @/lib/agents/db/admin-client — admin client (all DB reads + writes)
 *
 * Branches covered:
 *   1. invalid UUID format          → { ok: false, code: 'invalid_id' }
 *   2. no authenticated user        → { ok: false, code: 'no_auth' }
 *   3. auth.getUser throws          → { ok: false, code: 'no_auth' }
 *   4. free_scan row not found      → { ok: false, code: 'not_found' }
 *   5. claimed by different user    → { ok: false, code: 'not_yours' }
 *   6. email mismatch               → { ok: false, code: 'not_yours' }
 *   7. business insert failure      → { ok: false, code: 'internal' }
 *   8. scan insert failure          → { ok: false, code: 'internal' }
 *   9. happy path (full claim)      → { ok: true, scan_id, business_id }
 *  10. mark update failure is non-fatal → { ok: true, scan_id, business_id }
 *  11. unexpected throw             → { ok: false, code: 'internal' }
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Hoisted mock fns — defined before vi.mock calls so closures work.
// ---------------------------------------------------------------------------

const mockGetUser = vi.fn()
const mockFreeScanFetch = vi.fn()   // .from('free_scans').select…single()
const mockFreeScanMark = vi.fn()    // .from('free_scans').update…eq()
const mockBizInsert = vi.fn()       // .from('businesses').insert…single()
const mockScanInsert = vi.fn()      // .from('scans').insert…single()

// ---------------------------------------------------------------------------
// Admin client mock — routes by table name
// ---------------------------------------------------------------------------

function makeAdminFrom(table: string) {
  if (table === 'free_scans') {
    return {
      select: () => ({
        eq: () => ({
          single: () => mockFreeScanFetch(),
        }),
      }),
      update: () => ({
        eq: () => mockFreeScanMark(),
      }),
    }
  }
  if (table === 'businesses') {
    return {
      insert: () => ({
        select: () => ({
          single: () => mockBizInsert(),
        }),
      }),
    }
  }
  if (table === 'scans') {
    return {
      insert: () => ({
        select: () => ({
          single: () => mockScanInsert(),
        }),
      }),
      select: () => ({
        eq: () => ({
          limit: () => ({
            maybeSingle: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
      }),
    }
  }
  return {}
}

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
  })),
}))

vi.mock('@/lib/agents/db/admin-client', () => ({
  getAdminClient: vi.fn(() => ({
    from: (table: string) => makeAdminFrom(table),
  })),
}))

import { claimFreeScan } from './claim'

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const VALID_UUID = '12345678-1234-4abc-89ab-123456789012'
const USER_ID = 'user-uuid-001'
const USER_EMAIL = 'test@example.com'
const BUSINESS_ID = 'biz-uuid-001'
const SCAN_ID = 'scan-uuid-001'

const MOCK_USER = { id: USER_ID, email: USER_EMAIL }

const MOCK_FREE_SCAN = {
  id: VALID_UUID,
  email: USER_EMAIL,
  domain: 'example.com',
  business_name: 'Example Corp',
  website_url: 'https://example.com',
  results: null,
  status: 'complete',
  converted_user_id: null,
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('claimFreeScan', () => {
  it('returns invalid_id for a non-UUID string', async () => {
    const result = await claimFreeScan('not-a-uuid')
    expect(result).toEqual({ ok: false, code: 'invalid_id' })
  })

  it('returns invalid_id for a v1 UUID (version digit is not 4)', async () => {
    const result = await claimFreeScan('12345678-1234-1abc-89ab-123456789012')
    expect(result).toEqual({ ok: false, code: 'invalid_id' })
  })

  it('returns no_auth when getUser returns no user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    const result = await claimFreeScan(VALID_UUID)
    expect(result).toEqual({ ok: false, code: 'no_auth' })
  })

  it('returns no_auth when getUser returns an error', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('jwt expired') })
    const result = await claimFreeScan(VALID_UUID)
    expect(result).toEqual({ ok: false, code: 'no_auth' })
  })

  it('returns not_found when the free_scans row does not exist', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null })
    mockFreeScanFetch.mockResolvedValue({ data: null, error: { message: 'not found' } })

    const result = await claimFreeScan(VALID_UUID)
    expect(result).toEqual({ ok: false, code: 'not_found' })
  })

  it('returns not_yours when the row is claimed by a different user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null })
    mockFreeScanFetch.mockResolvedValue({
      data: { ...MOCK_FREE_SCAN, converted_user_id: 'other-user-id' },
      error: null,
    })

    const result = await claimFreeScan(VALID_UUID)
    expect(result).toEqual({ ok: false, code: 'not_yours' })
  })

  it('returns not_yours when the email does not match (case-insensitive check)', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { ...MOCK_USER, email: 'different@example.com' } },
      error: null,
    })
    mockFreeScanFetch.mockResolvedValue({ data: MOCK_FREE_SCAN, error: null })

    const result = await claimFreeScan(VALID_UUID)
    expect(result).toEqual({ ok: false, code: 'not_yours' })
  })

  it('email match is case-insensitive', async () => {
    // User email is uppercase; free_scan email is lowercase — should still succeed
    mockGetUser.mockResolvedValue({
      data: { user: { ...MOCK_USER, email: 'TEST@EXAMPLE.COM' } },
      error: null,
    })
    mockFreeScanFetch.mockResolvedValue({ data: MOCK_FREE_SCAN, error: null })
    mockBizInsert.mockResolvedValue({ data: { id: BUSINESS_ID }, error: null })
    mockScanInsert.mockResolvedValue({ data: { id: SCAN_ID }, error: null })
    mockFreeScanMark.mockResolvedValue({ error: null })

    const result = await claimFreeScan(VALID_UUID)
    expect(result).toEqual({ ok: true, scan_id: SCAN_ID, business_id: BUSINESS_ID })
  })

  it('returns internal when the business insert fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null })
    mockFreeScanFetch.mockResolvedValue({ data: MOCK_FREE_SCAN, error: null })
    mockBizInsert.mockResolvedValue({ data: null, error: { message: 'insert failed' } })

    const result = await claimFreeScan(VALID_UUID)
    expect(result).toEqual({ ok: false, code: 'internal' })
  })

  it('returns internal when the scan insert fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null })
    mockFreeScanFetch.mockResolvedValue({ data: MOCK_FREE_SCAN, error: null })
    mockBizInsert.mockResolvedValue({ data: { id: BUSINESS_ID }, error: null })
    mockScanInsert.mockResolvedValue({ data: null, error: { message: 'scan insert failed' } })

    const result = await claimFreeScan(VALID_UUID)
    expect(result).toEqual({ ok: false, code: 'internal' })
  })

  it('returns ok:true with scan_id and business_id on successful claim', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null })
    mockFreeScanFetch.mockResolvedValue({ data: MOCK_FREE_SCAN, error: null })
    mockBizInsert.mockResolvedValue({ data: { id: BUSINESS_ID }, error: null })
    mockScanInsert.mockResolvedValue({ data: { id: SCAN_ID }, error: null })
    mockFreeScanMark.mockResolvedValue({ error: null })

    const result = await claimFreeScan(VALID_UUID)
    expect(result).toEqual({ ok: true, scan_id: SCAN_ID, business_id: BUSINESS_ID })
  })

  it('returns ok:true even when the converted_user_id update fails (non-fatal)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null })
    mockFreeScanFetch.mockResolvedValue({ data: MOCK_FREE_SCAN, error: null })
    mockBizInsert.mockResolvedValue({ data: { id: BUSINESS_ID }, error: null })
    mockScanInsert.mockResolvedValue({ data: { id: SCAN_ID }, error: null })
    mockFreeScanMark.mockResolvedValue({ error: { message: 'update failed' } })

    const result = await claimFreeScan(VALID_UUID)
    expect(result).toEqual({ ok: true, scan_id: SCAN_ID, business_id: BUSINESS_ID })
  })

  it('returns internal on an unexpected throw inside the function', async () => {
    // Make getUser throw at the network level
    mockGetUser.mockRejectedValue(new Error('network error'))

    const result = await claimFreeScan(VALID_UUID)
    expect(result).toEqual({ ok: false, code: 'internal' })
  })
})
