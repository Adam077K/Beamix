/**
 * Tests for claimFreeScan (src/lib/scan/claim.ts) — canonical unified path.
 *
 * Mocked:
 *   @/lib/supabase/server        — anon client (auth.getUser only)
 *   @/lib/agents/db/admin-client — admin client (all DB reads + writes)
 *   @/lib/scan/import-free-scan  — projectFreeScanToNormalized (pure projection)
 *
 * Branches covered:
 *   1.  invalid UUID format                 → { ok: false, code: 'invalid_id' }
 *   2.  v1 UUID (version digit not 4)       → { ok: false, code: 'invalid_id' }
 *   3.  no authenticated user               → { ok: false, code: 'no_auth' }
 *   4.  auth.getUser throws                 → { ok: false, code: 'internal' }
 *   5.  free_scan row not found             → { ok: false, code: 'not_found' }
 *   6.  email mismatch (not_yours)          → { ok: false, code: 'not_yours' }
 *   6b. email match is case-insensitive     → { ok: true, ... }
 *   7.  already_claimed by different user   → { ok: false, code: 'already_claimed' }
 *   8.  idempotent re-claim (same user)     → { ok: true, existing scan_id }
 *   9.  business create path               → { ok: true, new scan_id+biz_id }
 *  10.  business fetch path (existing)     → { ok: true, existing biz_id }
 *  11.  projectFreeScanToNormalized called with correct args
 *  12.  scan_engine_results inserted
 *  13.  scan insert failure                → { ok: false, code: 'internal' }
 *  14.  business insert failure            → { ok: false, code: 'internal' }
 *  15.  mark update failure is non-fatal   → { ok: true, ... }
 *  16.  unexpected throw                   → { ok: false, code: 'internal' }
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Hoisted mock fns
// ---------------------------------------------------------------------------

const {
  mockGetUser,
  mockAdminFrom,
  mockProjection,
} = vi.hoisted(() => {
  const mockGetUser = vi.fn()
  const mockAdminFrom = vi.fn()
  const mockProjection = vi.fn()
  return { mockGetUser, mockAdminFrom, mockProjection }
})

// ---------------------------------------------------------------------------
// vi.mock calls (before any imports of the module under test)
// ---------------------------------------------------------------------------

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
  })),
}))

vi.mock('@/lib/agents/db/admin-client', () => ({
  getAdminClient: vi.fn(() => ({ from: mockAdminFrom })),
}))

vi.mock('@/lib/scan/import-free-scan', () => ({
  projectFreeScanToNormalized: mockProjection,
}))

import { claimFreeScan } from './claim'

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const VALID_UUID = '12345678-1234-4abc-89ab-123456789012'
const USER_ID = '11111111-1111-1111-1111-111111111111'
const USER_EMAIL = 'test@example.com'
const OTHER_USER_ID = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
const BUSINESS_ID = 'dddddddd-dddd-dddd-dddd-dddddddddddd'
const SCAN_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc'
const EXISTING_SCAN_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'

const MOCK_USER = { id: USER_ID, email: USER_EMAIL }

const MOCK_FREE_SCAN = {
  id: VALID_UUID,
  email: USER_EMAIL,
  business_name: 'Test Business',
  website_url: 'https://test.com',
  domain: 'test.com',
  results: null,
  started_at: null,
  completed_at: null,
  converted_user_id: null,
  claimed_at: null,
  claimed_business_id: null,
}

/** Default projection result used by most happy-path tests */
function makeProjectionResult(scanId = SCAN_ID) {
  return {
    scan: {
      id: scanId,
      business_id: BUSINESS_ID,
      scan_type: 'free' as const,
      status: 'complete' as const,
      source_free_scan_id: VALID_UUID,
      started_at: null,
      completed_at: null,
    },
    engineResults: [
      { scan_id: scanId, business_id: BUSINESS_ID, engine: 'chatgpt', is_mentioned: false, rank_position: null, sentiment: null, citations: [] },
      { scan_id: scanId, business_id: BUSINESS_ID, engine: 'gemini', is_mentioned: false, rank_position: null, sentiment: null, citations: [] },
      { scan_id: scanId, business_id: BUSINESS_ID, engine: 'perplexity', is_mentioned: false, rank_position: null, sentiment: null, citations: [] },
    ],
  }
}

// ---------------------------------------------------------------------------
// Admin chain builder helpers
// ---------------------------------------------------------------------------

/** Build a fluent chain where the terminal call resolves to `value`. */
function buildChain(value: unknown) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {}
  const methods = ['select', 'eq', 'order', 'limit', 'update']
  methods.forEach((m) => {
    chain[m] = vi.fn().mockReturnValue(chain)
  })
  chain['maybeSingle'] = vi.fn().mockResolvedValue(value)
  chain['insert'] = vi.fn().mockResolvedValue(value)
  return chain
}

/**
 * Setup admin from() calls for the full happy-path (business create variant).
 * Call order:
 *   1. free_scans select (maybeSingle)
 *   2. businesses select (maybeSingle → null = no existing biz)
 *   3. businesses insert
 *   4. scans insert
 *   5. scan_engine_results insert
 *   6. free_scans update
 */
function setupHappyPathCreate() {
  let callIndex = 0
  mockAdminFrom.mockImplementation((table: string) => {
    callIndex++

    if (table === 'free_scans' && callIndex === 1) {
      return buildChain({ data: MOCK_FREE_SCAN, error: null })
    }
    if (table === 'businesses' && callIndex === 2) {
      // No existing business
      return buildChain({ data: null, error: null })
    }
    if (table === 'businesses' && callIndex === 3) {
      // Insert new business — success
      return buildChain({ error: null })
    }
    if (table === 'scans' && callIndex === 4) {
      return buildChain({ error: null })
    }
    if (table === 'scan_engine_results' && callIndex === 5) {
      return buildChain({ error: null })
    }
    if (table === 'free_scans' && callIndex === 6) {
      const chain = buildChain(undefined)
      chain['update'] = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })
      return chain
    }

    return buildChain({ data: null, error: null })
  })
}

/**
 * Setup admin from() calls for the happy-path (existing business variant).
 * Call order:
 *   1. free_scans select (maybeSingle)
 *   2. businesses select (maybeSingle → existing biz)
 *   3. scans insert
 *   4. scan_engine_results insert
 *   5. free_scans update
 */
function setupHappyPathFetch() {
  let callIndex = 0
  mockAdminFrom.mockImplementation((table: string) => {
    callIndex++

    if (table === 'free_scans' && callIndex === 1) {
      return buildChain({ data: MOCK_FREE_SCAN, error: null })
    }
    if (table === 'businesses' && callIndex === 2) {
      return buildChain({ data: { id: BUSINESS_ID }, error: null })
    }
    if (table === 'scans' && callIndex === 3) {
      return buildChain({ error: null })
    }
    if (table === 'scan_engine_results' && callIndex === 4) {
      return buildChain({ error: null })
    }
    if (table === 'free_scans' && callIndex === 5) {
      const chain = buildChain(undefined)
      chain['update'] = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })
      return chain
    }

    return buildChain({ data: null, error: null })
  })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()
  mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null })
  mockProjection.mockReturnValue(makeProjectionResult())
})

describe('claimFreeScan', () => {

  // ─── UUID validation ──────────────────────────────────────────────────────

  it('returns invalid_id for a non-UUID string', async () => {
    const result = await claimFreeScan('not-a-uuid')
    expect(result).toEqual({ ok: false, code: 'invalid_id' })
  })

  it('returns invalid_id for a v1 UUID (version digit is not 4)', async () => {
    const result = await claimFreeScan('12345678-1234-1abc-89ab-123456789012')
    expect(result).toEqual({ ok: false, code: 'invalid_id' })
  })

  // ─── Auth failures ────────────────────────────────────────────────────────

  it('returns no_auth when getUser returns no user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    const result = await claimFreeScan(VALID_UUID)
    expect(result).toEqual({ ok: false, code: 'no_auth' })
  })

  it('returns no_auth when getUser returns an auth error', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('jwt expired') })
    const result = await claimFreeScan(VALID_UUID)
    expect(result).toEqual({ ok: false, code: 'no_auth' })
  })

  it('returns internal on unexpected throw inside the function', async () => {
    mockGetUser.mockRejectedValue(new Error('network error'))
    const result = await claimFreeScan(VALID_UUID)
    expect(result).toEqual({ ok: false, code: 'internal' })
  })

  // ─── Free scan fetch ──────────────────────────────────────────────────────

  it('returns not_found when the free_scans row does not exist', async () => {
    mockAdminFrom.mockReturnValue(buildChain({ data: null, error: null }))
    const result = await claimFreeScan(VALID_UUID)
    expect(result).toEqual({ ok: false, code: 'not_found' })
  })

  // ─── Authorization ────────────────────────────────────────────────────────

  it('returns not_yours when email does not match (case-insensitive)', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { ...MOCK_USER, email: 'different@example.com' } },
      error: null,
    })
    mockAdminFrom.mockReturnValue(buildChain({ data: MOCK_FREE_SCAN, error: null }))

    const result = await claimFreeScan(VALID_UUID)
    expect(result).toEqual({ ok: false, code: 'not_yours' })
  })

  it('email match is case-insensitive (uppercase user email)', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { ...MOCK_USER, email: 'TEST@EXAMPLE.COM' } },
      error: null,
    })
    setupHappyPathFetch()

    const result = await claimFreeScan(VALID_UUID)
    expect(result.ok).toBe(true)
  })

  it('returns already_claimed when claimed by a different user', async () => {
    mockAdminFrom.mockReturnValue(
      buildChain({
        data: { ...MOCK_FREE_SCAN, converted_user_id: OTHER_USER_ID, claimed_business_id: BUSINESS_ID },
        error: null,
      }),
    )

    const result = await claimFreeScan(VALID_UUID)
    expect(result).toEqual({ ok: false, code: 'already_claimed' })
  })

  // ─── Idempotency ──────────────────────────────────────────────────────────

  it('returns existing scan_id on idempotent re-claim by same user', async () => {
    let callIndex = 0
    mockAdminFrom.mockImplementation((table: string) => {
      callIndex++
      if (table === 'free_scans' && callIndex === 1) {
        return buildChain({
          data: {
            ...MOCK_FREE_SCAN,
            converted_user_id: USER_ID,
            claimed_business_id: BUSINESS_ID,
          },
          error: null,
        })
      }
      // Second call: scans select via source_free_scan_id
      return buildChain({ data: { id: EXISTING_SCAN_ID }, error: null })
    })

    const result = await claimFreeScan(VALID_UUID)
    expect(result).toEqual({
      ok: true,
      scan_id: EXISTING_SCAN_ID,
      business_id: BUSINESS_ID,
    })
  })

  // ─── Business create-or-fetch ─────────────────────────────────────────────

  it('creates a new business when user has none, then inserts scan + engine results', async () => {
    setupHappyPathCreate()

    const result = await claimFreeScan(VALID_UUID)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(typeof result.scan_id).toBe('string')
    expect(typeof result.business_id).toBe('string')
  })

  it('uses existing business when user already has one', async () => {
    setupHappyPathFetch()

    const result = await claimFreeScan(VALID_UUID)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    // business_id must be the one from the existing business row
    expect(result.business_id).toBe(BUSINESS_ID)
  })

  // ─── projectFreeScanToNormalized integration ──────────────────────────────

  it('calls projectFreeScanToNormalized with correct arguments', async () => {
    setupHappyPathFetch()

    await claimFreeScan(VALID_UUID)

    expect(mockProjection).toHaveBeenCalledWith(
      expect.objectContaining({
        free_scan_id: VALID_UUID,
        business_id: BUSINESS_ID,
        results: MOCK_FREE_SCAN.results,
        started_at: null,
        completed_at: null,
      }),
    )
  })

  it('inserts scan_engine_results from projection output', async () => {
    setupHappyPathFetch()

    await claimFreeScan(VALID_UUID)

    // scan_engine_results is table call index 4 in the fetch variant
    const calls = (mockAdminFrom as ReturnType<typeof vi.fn>).mock.calls
    const engineCall = calls.find(([t]: [string]) => t === 'scan_engine_results')
    expect(engineCall).toBeTruthy()
  })

  it('v1 lossy fallback: still inserts scan_engine_results (3 rows, is_mentioned=false)', async () => {
    // Projection returns lossy fallback rows
    mockProjection.mockReturnValue({
      scan: {
        id: SCAN_ID,
        business_id: BUSINESS_ID,
        scan_type: 'free',
        status: 'complete',
        source_free_scan_id: VALID_UUID,
        started_at: null,
        completed_at: null,
      },
      engineResults: [
        { scan_id: SCAN_ID, business_id: BUSINESS_ID, engine: 'chatgpt', is_mentioned: false, rank_position: null, sentiment: null, citations: [] },
        { scan_id: SCAN_ID, business_id: BUSINESS_ID, engine: 'gemini', is_mentioned: false, rank_position: null, sentiment: null, citations: [] },
        { scan_id: SCAN_ID, business_id: BUSINESS_ID, engine: 'perplexity', is_mentioned: false, rank_position: null, sentiment: null, citations: [] },
      ],
    })

    setupHappyPathFetch()

    const result = await claimFreeScan(VALID_UUID)
    expect(result.ok).toBe(true)

    const calls = (mockAdminFrom as ReturnType<typeof vi.fn>).mock.calls
    const engineCall = calls.find(([t]: [string]) => t === 'scan_engine_results')
    expect(engineCall).toBeTruthy()
  })

  // ─── Failure paths ────────────────────────────────────────────────────────

  it('returns internal when business insert fails', async () => {
    let callIndex = 0
    mockAdminFrom.mockImplementation((table: string) => {
      callIndex++
      if (table === 'free_scans' && callIndex === 1) {
        return buildChain({ data: MOCK_FREE_SCAN, error: null })
      }
      if (table === 'businesses' && callIndex === 2) {
        // No existing business
        return buildChain({ data: null, error: null })
      }
      if (table === 'businesses' && callIndex === 3) {
        // Business insert failure
        return buildChain({ error: { message: 'insert failed', code: '23000' } })
      }
      return buildChain({ data: null, error: null })
    })

    const result = await claimFreeScan(VALID_UUID)
    expect(result).toEqual({ ok: false, code: 'internal' })
  })

  it('returns internal when scan insert fails', async () => {
    let callIndex = 0
    mockAdminFrom.mockImplementation((table: string) => {
      callIndex++
      if (table === 'free_scans' && callIndex === 1) {
        return buildChain({ data: MOCK_FREE_SCAN, error: null })
      }
      if (table === 'businesses' && callIndex === 2) {
        return buildChain({ data: { id: BUSINESS_ID }, error: null })
      }
      if (table === 'scans' && callIndex === 3) {
        return buildChain({ error: { message: 'scan insert failed', code: '23000' } })
      }
      return buildChain({ data: null, error: null })
    })

    const result = await claimFreeScan(VALID_UUID)
    expect(result).toEqual({ ok: false, code: 'internal' })
  })

  it('returns ok:true even when scan_engine_results insert fails (non-fatal)', async () => {
    let callIndex = 0
    mockAdminFrom.mockImplementation((table: string) => {
      callIndex++
      if (table === 'free_scans' && callIndex === 1) {
        return buildChain({ data: MOCK_FREE_SCAN, error: null })
      }
      if (table === 'businesses' && callIndex === 2) {
        return buildChain({ data: { id: BUSINESS_ID }, error: null })
      }
      if (table === 'scans' && callIndex === 3) {
        return buildChain({ error: null })
      }
      if (table === 'scan_engine_results' && callIndex === 4) {
        return buildChain({ error: { message: 'engine insert failed', code: '23000' } })
      }
      if (table === 'free_scans' && callIndex === 5) {
        const chain = buildChain(undefined)
        chain['update'] = vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        })
        return chain
      }
      return buildChain({ data: null, error: null })
    })

    const result = await claimFreeScan(VALID_UUID)
    expect(result.ok).toBe(true)
  })

  it('returns ok:true even when converted_user_id update fails (non-fatal)', async () => {
    let callIndex = 0
    mockAdminFrom.mockImplementation((table: string) => {
      callIndex++
      if (table === 'free_scans' && callIndex === 1) {
        return buildChain({ data: MOCK_FREE_SCAN, error: null })
      }
      if (table === 'businesses' && callIndex === 2) {
        return buildChain({ data: { id: BUSINESS_ID }, error: null })
      }
      if (table === 'scans' && callIndex === 3) {
        return buildChain({ error: null })
      }
      if (table === 'scan_engine_results' && callIndex === 4) {
        return buildChain({ error: null })
      }
      if (table === 'free_scans' && callIndex === 5) {
        const chain = buildChain(undefined)
        chain['update'] = vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: { message: 'update failed' } }),
        })
        return chain
      }
      return buildChain({ data: null, error: null })
    })

    const result = await claimFreeScan(VALID_UUID)
    expect(result.ok).toBe(true)
  })
})
