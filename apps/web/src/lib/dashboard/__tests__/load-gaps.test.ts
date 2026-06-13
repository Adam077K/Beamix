/**
 * Unit tests for loadDashboardGaps and getLatestScanId (load-gaps.ts).
 *
 * Client split under test:
 *   - businesses + scans:  user-scoped anon client (createServerSupabaseClient)
 *   - free_scans:          admin client (getAdminClient — service-role)
 *
 * All DB calls are stubbed. Zero live DB calls.
 *
 * Branches covered:
 *   (1)  No business → []
 *   (2)  Business exists, no completed scans → []
 *   (3)  Scan exists but no source_free_scan_id → []
 *   (4)  Free scan read uses admin client; missing scan_v2 → []
 *   (5)  scan_v2 gap_list Zod parse fails → [] + console.error
 *   (6)  Happy path — admin client reads free_scans, returns RankedGap[] rank-ordered
 *   (7)  DB error (businesses query) → [] no throw
 *   (8)  Gap list > 8 items → capped at 8
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Hoisted mock fns — must be declared before vi.mock calls
// ---------------------------------------------------------------------------

const { mockGetAdminClient } = vi.hoisted(() => {
  const mockGetAdminClient = vi.fn()
  return { mockGetAdminClient }
})

// ---------------------------------------------------------------------------
// vi.mock calls
// ---------------------------------------------------------------------------

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(),
}))

vi.mock('@/lib/agents/db/admin-client', () => ({
  getAdminClient: mockGetAdminClient,
}))

import { loadDashboardGaps, getLatestScanId } from '../load-gaps'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import {
  HAPPY_FREE_SCAN_RESULTS,
  MISSING_SCAN_V2_RESULTS,
  CORRUPTED_SCAN_V2_RESULTS,
} from './fixtures/scan-v2-blobs'

// ---------------------------------------------------------------------------
// Chainable query mock builder
// ---------------------------------------------------------------------------

/**
 * Builds a chainable mock that resolves to `result` on any terminal await.
 * Supports: select, eq, in, not, order, limit, gt, maybeSingle.
 */
function makeChain(result: { data?: unknown; error?: unknown; count?: number | null }) {
  const chain: Record<string, unknown> = {}
  const methods = ['select', 'eq', 'in', 'not', 'order', 'limit', 'gt', 'gte']
  for (const method of methods) {
    chain[method] = vi.fn().mockReturnValue(chain)
  }
  chain['maybeSingle'] = vi.fn().mockResolvedValue(result)
  chain['single'] = vi.fn().mockResolvedValue(result)
  // Thennable for patterns that await without calling a terminal method
  chain['then'] = (resolve: (v: unknown) => unknown) =>
    Promise.resolve(result).then(resolve)
  return chain
}

// ---------------------------------------------------------------------------
// Stub builders
// ---------------------------------------------------------------------------

const USER_ID = 'user-aaaa-aaaa-aaaa-aaaa'
const BUSINESS_ID = 'biz-bbbb-bbbb-bbbb-bbbb'
const SCAN_ID = 'scan-cccc-cccc-cccc-cccc'
const FREE_SCAN_ID = 'free-dddd-dddd-dddd-dddd'

/** Anon client stub — handles businesses + scans via user-scoped RLS. */
function makeAnonStub(tableMap: Record<string, ReturnType<typeof makeChain>>) {
  return {
    from: vi.fn((table: string) => {
      return tableMap[table] ?? makeChain({ data: null, error: null })
    }),
  }
}

/** Admin client stub — handles free_scans only. */
function makeAdminStub(tableMap: Record<string, ReturnType<typeof makeChain>>) {
  return {
    from: vi.fn((table: string) => {
      return tableMap[table] ?? makeChain({ data: null, error: null })
    }),
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('loadDashboardGaps', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('(1) returns [] when no business exists', async () => {
    const anonStub = makeAnonStub({
      businesses: makeChain({ data: null, error: null }),
    })
    vi.mocked(createServerSupabaseClient).mockResolvedValue(anonStub as never)
    mockGetAdminClient.mockReturnValue(makeAdminStub({}))

    const result = await loadDashboardGaps(USER_ID)
    expect(result).toEqual([])
  })

  it('(2) returns [] when business exists but no completed scans', async () => {
    const anonStub = makeAnonStub({
      businesses: makeChain({ data: { id: BUSINESS_ID }, error: null }),
      scans: makeChain({ data: null, error: null }),
    })
    vi.mocked(createServerSupabaseClient).mockResolvedValue(anonStub as never)
    mockGetAdminClient.mockReturnValue(makeAdminStub({}))

    const result = await loadDashboardGaps(USER_ID)
    expect(result).toEqual([])
  })

  it('(3) returns [] when scan has no source_free_scan_id', async () => {
    const anonStub = makeAnonStub({
      businesses: makeChain({ data: { id: BUSINESS_ID }, error: null }),
      scans: makeChain({ data: { id: SCAN_ID, source_free_scan_id: null }, error: null }),
    })
    vi.mocked(createServerSupabaseClient).mockResolvedValue(anonStub as never)
    mockGetAdminClient.mockReturnValue(makeAdminStub({}))

    const result = await loadDashboardGaps(USER_ID)
    expect(result).toEqual([])
  })

  it('(4) reads free_scans via admin client; missing scan_v2 returns []', async () => {
    const adminFromSpy = vi.fn()
    const adminStub = {
      from: adminFromSpy.mockReturnValue(
        makeChain({ data: { results: MISSING_SCAN_V2_RESULTS }, error: null }),
      ),
    }
    const anonStub = makeAnonStub({
      businesses: makeChain({ data: { id: BUSINESS_ID }, error: null }),
      scans: makeChain({ data: { id: SCAN_ID, source_free_scan_id: FREE_SCAN_ID }, error: null }),
    })
    vi.mocked(createServerSupabaseClient).mockResolvedValue(anonStub as never)
    mockGetAdminClient.mockReturnValue(adminStub)

    const result = await loadDashboardGaps(USER_ID)

    // Assert the admin client was used for free_scans, not the anon client
    expect(adminFromSpy).toHaveBeenCalledWith('free_scans')
    expect(anonStub.from).not.toHaveBeenCalledWith('free_scans')
    expect(result).toEqual([])
  })

  it('(5) returns [] and logs console.error when gap_list Zod parse fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const adminStub = makeAdminStub({
      free_scans: makeChain({ data: { results: CORRUPTED_SCAN_V2_RESULTS }, error: null }),
    })
    const anonStub = makeAnonStub({
      businesses: makeChain({ data: { id: BUSINESS_ID }, error: null }),
      scans: makeChain({ data: { id: SCAN_ID, source_free_scan_id: FREE_SCAN_ID }, error: null }),
    })
    vi.mocked(createServerSupabaseClient).mockResolvedValue(anonStub as never)
    mockGetAdminClient.mockReturnValue(adminStub)

    const result = await loadDashboardGaps(USER_ID)
    expect(result).toEqual([])
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[dashboard/load-gaps] gap_list Zod parse failed'),
      expect.objectContaining({ userId: USER_ID }),
    )

    consoleSpy.mockRestore()
  })

  it('(6) happy path — admin client reads free_scans, returns RankedGap[] rank-ordered', async () => {
    const adminFromSpy = vi.fn()
    const adminStub = {
      from: adminFromSpy.mockReturnValue(
        makeChain({ data: { results: HAPPY_FREE_SCAN_RESULTS }, error: null }),
      ),
    }
    const anonStub = makeAnonStub({
      businesses: makeChain({ data: { id: BUSINESS_ID }, error: null }),
      scans: makeChain({ data: { id: SCAN_ID, source_free_scan_id: FREE_SCAN_ID }, error: null }),
    })
    vi.mocked(createServerSupabaseClient).mockResolvedValue(anonStub as never)
    mockGetAdminClient.mockReturnValue(adminStub)

    const result = await loadDashboardGaps(USER_ID)

    // Assert admin client used for free_scans
    expect(adminFromSpy).toHaveBeenCalledWith('free_scans')
    expect(anonStub.from).not.toHaveBeenCalledWith('free_scans')

    // Rank order preserved: 1, 2, 3
    expect(result).toHaveLength(3)
    expect(result[0]!.rank).toBe(1)
    expect(result[0]!.factor_key).toBe('review_systems')
    expect(result[1]!.rank).toBe(2)
    expect(result[1]!.factor_key).toBe('faq_coverage')
    expect(result[2]!.rank).toBe(3)
    expect(result[2]!.factor_key).toBe('llms_txt')
  })

  it('(7) returns [] (does not throw) on businesses DB error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const anonStub = makeAnonStub({
      businesses: makeChain({
        data: null,
        error: { code: 'PGRST301', message: 'Connection refused' },
      }),
    })
    vi.mocked(createServerSupabaseClient).mockResolvedValue(anonStub as never)
    mockGetAdminClient.mockReturnValue(makeAdminStub({}))

    await expect(loadDashboardGaps(USER_ID)).resolves.toEqual([])
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[dashboard/load-gaps] businesses query failed'),
      expect.objectContaining({ userId: USER_ID }),
    )

    consoleSpy.mockRestore()
  })

  it('(8) caps gap list at 8 items when more are present', async () => {
    const bigGapList = Array.from({ length: 12 }, (_, i) => ({
      factor_key: `factor_${i + 1}`,
      display_name: `Factor ${i + 1}`,
      tier: 1,
      impact_weight: 0.8,
      playbook_id: null,
      promises_lift: true,
      contrastive_count: 3 - (i % 3),
      competitors_with_factor: [],
      contrastive_evidence: `Evidence for factor ${i + 1}`,
      fixability: 'fast' as const,
      effort_score: 1,
      rank: i + 1,
      ordering_mode: 'contrastive' as const,
    }))

    const adminStub = makeAdminStub({
      free_scans: makeChain({
        data: { results: { scan_v2: { gap_list: bigGapList } } },
        error: null,
      }),
    })
    const anonStub = makeAnonStub({
      businesses: makeChain({ data: { id: BUSINESS_ID }, error: null }),
      scans: makeChain({ data: { id: SCAN_ID, source_free_scan_id: FREE_SCAN_ID }, error: null }),
    })
    vi.mocked(createServerSupabaseClient).mockResolvedValue(anonStub as never)
    mockGetAdminClient.mockReturnValue(adminStub)

    const result = await loadDashboardGaps(USER_ID)
    expect(result).toHaveLength(8)
    expect(result[0]!.rank).toBe(1)
    expect(result[7]!.rank).toBe(8)
  })
})

// ---------------------------------------------------------------------------
// getLatestScanId tests (uses anon client only — no admin client needed)
// ---------------------------------------------------------------------------

describe('getLatestScanId', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null when no business exists', async () => {
    const anonStub = makeAnonStub({
      businesses: makeChain({ data: null, error: null }),
    })
    vi.mocked(createServerSupabaseClient).mockResolvedValue(anonStub as never)

    const result = await getLatestScanId(USER_ID)
    expect(result).toBeNull()
  })

  it('returns null when no completed scan exists', async () => {
    const anonStub = makeAnonStub({
      businesses: makeChain({ data: { id: BUSINESS_ID }, error: null }),
      scans: makeChain({ data: null, error: null }),
    })
    vi.mocked(createServerSupabaseClient).mockResolvedValue(anonStub as never)

    const result = await getLatestScanId(USER_ID)
    expect(result).toBeNull()
  })

  it('returns scan id when a completed scan exists', async () => {
    const anonStub = makeAnonStub({
      businesses: makeChain({ data: { id: BUSINESS_ID }, error: null }),
      scans: makeChain({ data: { id: SCAN_ID }, error: null }),
    })
    vi.mocked(createServerSupabaseClient).mockResolvedValue(anonStub as never)

    const result = await getLatestScanId(USER_ID)
    expect(result).toBe(SCAN_ID)
  })
})
