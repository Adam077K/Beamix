/**
 * Unit tests for loadDashboardOutcomes.
 *
 * Tested cases:
 *   (1)  No business row → EMPTY_OUTCOMES
 *   (2)  Business exists, no completed scans → EMPTY_OUTCOMES
 *   (3)  1 scan, 3-engine results → visibilityScores with scores, trend=null
 *   (4)  ≥2 scans → trend is computed (up/down/flat per engine)
 *   (5)  Malformed engine result row (is_mentioned undefined) → treated as not mentioned, does not throw
 *   (6)  overallTrend: ≥2 scans in different weeks → trend points oldest→newest
 *   (7)  overallTrend: all scans in same week → 1 point → overallTrend omitted (< 2 points)
 *   (8)  approvalCount reflects pending count
 *   (9)  Supabase error on scans query → EMPTY_OUTCOMES (no throw)
 *   (10) Business query error → EMPTY_OUTCOMES (no throw)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock 'server-only' (alias handled by vitest.config.ts)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Mock createServerSupabaseClient
// ---------------------------------------------------------------------------

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(),
}))

import { loadDashboardOutcomes, EMPTY_OUTCOMES } from '../load-outcomes'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// ---------------------------------------------------------------------------
// Test fixture helpers
// ---------------------------------------------------------------------------

function makeScan(id: string, completedAt: string, businessId = 'biz-1'): Record<string, unknown> {
  return {
    id,
    completed_at: completedAt,
    created_at: completedAt,
    business_id: businessId,
    status: 'complete',
  }
}

function makeEngineResult(
  scanId: string,
  engine: string,
  isMentioned: boolean,
  rankPosition: number | null = null,
): Record<string, unknown> {
  return {
    scan_id: scanId,
    engine,
    is_mentioned: isMentioned,
    rank_position: rankPosition,
    created_at: '2026-06-09T08:00:00.000Z',
  }
}

/**
 * Creates a chainable Supabase query builder mock that resolves to `result`
 * when any terminal method is called (single, maybeSingle, or an awaited chain).
 *
 * The mock supports: from → select → eq/in/not/order/limit/gt → data/error/count
 */
function makeChain(result: { data?: unknown; error?: unknown; count?: number | null }) {
  const chain: Record<string, unknown> = {}
  const methods = ['select', 'eq', 'in', 'not', 'order', 'limit', 'gt', 'gte']
  for (const method of methods) {
    chain[method] = vi.fn().mockReturnValue(chain)
  }
  chain['maybeSingle'] = vi.fn().mockResolvedValue(result)
  chain['single'] = vi.fn().mockResolvedValue(result)
  // Make the chain itself thenable (awaitable) for .select().eq()... patterns
  chain['then'] = (resolve: (v: unknown) => unknown) =>
    Promise.resolve(result).then(resolve)
  return chain
}

/**
 * Builds a mock Supabase client with per-table response configuration.
 * `tableMap` maps table name → result object.
 */
function makeMockSupabase(
  tableMap: Record<string, { data?: unknown; error?: unknown; count?: number | null }>,
) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
    },
    from: vi.fn().mockImplementation((table: string) => {
      const result = tableMap[table] ?? { data: [], error: null }
      return makeChain(result)
    }),
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('loadDashboardOutcomes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // (1) No business row
  it('returns EMPTY_OUTCOMES when no business exists', async () => {
    const mockClient = makeMockSupabase({
      businesses: { data: null, error: null },
    })
    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockClient as ReturnType<typeof makeMockSupabase>)

    const result = await loadDashboardOutcomes('user-1')
    expect(result).toEqual(EMPTY_OUTCOMES)
  })

  // (2) Business exists, no completed scans
  it('returns EMPTY_OUTCOMES when business has no completed scans', async () => {
    const mockClient = makeMockSupabase({
      businesses: { data: { id: 'biz-1' }, error: null },
      scans: { data: [], error: null },
    })
    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockClient as ReturnType<typeof makeMockSupabase>)

    const result = await loadDashboardOutcomes('user-1')
    expect(result).toEqual(EMPTY_OUTCOMES)
  })

  // (3) 1 scan, 3-engine results → scores populated, trend null
  it('populates visibilityScores from 1 scan (trend is null, no previous)', async () => {
    const scan = makeScan('scan-1', '2026-06-09T08:00:00.000Z')
    const engineResults = [
      makeEngineResult('scan-1', 'chatgpt', true, 2),
      makeEngineResult('scan-1', 'chatgpt', true, 1),
      makeEngineResult('scan-1', 'gemini', false),
      makeEngineResult('scan-1', 'perplexity', true, null),
    ]

    const mockClient = makeMockSupabase({
      businesses: { data: { id: 'biz-1' }, error: null },
      scans: { data: [scan], error: null },
      scan_engine_results: { data: engineResults, error: null },
      approval_queue: { count: 2, error: null },
    })
    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockClient as ReturnType<typeof makeMockSupabase>)

    const result = await loadDashboardOutcomes('user-1')

    expect(result.visibilityScores).toHaveLength(3)

    const chatgpt = result.visibilityScores.find((s) => s.engine === 'chatgpt')!
    expect(chatgpt.score).not.toBeNull()
    expect(chatgpt.score).toBeGreaterThan(0)
    expect(chatgpt.trend).toBeNull() // no previous scan

    const gemini = result.visibilityScores.find((s) => s.engine === 'gemini')!
    // 0% presence → score should be 0
    expect(gemini.score).toBe(0)
    expect(gemini.trend).toBeNull()

    const perplexity = result.visibilityScores.find((s) => s.engine === 'perplexity')!
    expect(perplexity.score).not.toBeNull()
    expect(perplexity.trend).toBeNull()

    expect(result.approvalCount).toBe(2)
    // Only 1 scan → overallTrend should be omitted (needs ≥2 distinct weeks)
    expect(result.overallTrend).toBeUndefined()
  })

  // (4) ≥2 scans → trend computed per engine
  it('computes trend up/down/flat by comparing latest vs previous scan', async () => {
    const scan1 = makeScan('scan-1', '2026-05-26T08:00:00.000Z') // older
    const scan2 = makeScan('scan-2', '2026-06-09T08:00:00.000Z') // newer

    // Previous scan (scan-1): chatgpt 50% (1/2), gemini 100% (2/2), perplexity 0%
    // Latest scan  (scan-2): chatgpt 100% (2/2), gemini 50% (1/2), perplexity 0%
    // → chatgpt: up, gemini: down, perplexity: flat (both 0)
    const engineResults = [
      // scan-1
      makeEngineResult('scan-1', 'chatgpt', true),
      makeEngineResult('scan-1', 'chatgpt', false),
      makeEngineResult('scan-1', 'gemini', true),
      makeEngineResult('scan-1', 'gemini', true),
      makeEngineResult('scan-1', 'perplexity', false),
      // scan-2
      makeEngineResult('scan-2', 'chatgpt', true),
      makeEngineResult('scan-2', 'chatgpt', true),
      makeEngineResult('scan-2', 'gemini', true),
      makeEngineResult('scan-2', 'gemini', false),
      makeEngineResult('scan-2', 'perplexity', false),
    ]

    const mockClient = makeMockSupabase({
      businesses: { data: { id: 'biz-1' }, error: null },
      // newest first (as Supabase would return with order desc)
      scans: { data: [scan2, scan1], error: null },
      scan_engine_results: { data: engineResults, error: null },
      approval_queue: { count: 0, error: null },
    })
    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockClient as ReturnType<typeof makeMockSupabase>)

    const result = await loadDashboardOutcomes('user-1')

    const chatgpt = result.visibilityScores.find((s) => s.engine === 'chatgpt')!
    const gemini = result.visibilityScores.find((s) => s.engine === 'gemini')!
    const perplexity = result.visibilityScores.find((s) => s.engine === 'perplexity')!

    expect(chatgpt.trend).toBe('up')
    expect(gemini.trend).toBe('down')
    expect(perplexity.trend).toBe('flat')
  })

  // (5) Malformed row (is_mentioned coerced to falsy) → does not throw
  it('handles malformed engine result rows gracefully', async () => {
    const scan = makeScan('scan-1', '2026-06-09T08:00:00.000Z')
    const engineResults = [
      // missing is_mentioned → treated as false
      { scan_id: 'scan-1', engine: 'chatgpt', is_mentioned: undefined, rank_position: null, created_at: '2026-06-09T08:00:00.000Z' },
      makeEngineResult('scan-1', 'gemini', true),
    ]

    const mockClient = makeMockSupabase({
      businesses: { data: { id: 'biz-1' }, error: null },
      scans: { data: [scan], error: null },
      scan_engine_results: { data: engineResults, error: null },
      approval_queue: { count: 0, error: null },
    })
    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockClient as ReturnType<typeof makeMockSupabase>)

    // Should not throw
    const result = await loadDashboardOutcomes('user-1')
    expect(result.visibilityScores).toHaveLength(3)

    const chatgpt = result.visibilityScores.find((s) => s.engine === 'chatgpt')!
    expect(chatgpt.score).toBe(0) // undefined is_mentioned → 0% presence
  })

  // (6) ≥2 scans in different weeks → overallTrend populated oldest→newest
  it('builds overallTrend with points oldest→newest for scans in different weeks', async () => {
    const scan1 = makeScan('scan-1', '2026-05-26T08:00:00.000Z') // Week of May 25
    const scan2 = makeScan('scan-2', '2026-06-09T08:00:00.000Z') // Week of Jun 9

    const engineResults = [
      makeEngineResult('scan-1', 'chatgpt', true),
      makeEngineResult('scan-1', 'gemini', true),
      makeEngineResult('scan-1', 'perplexity', true),
      makeEngineResult('scan-2', 'chatgpt', true),
      makeEngineResult('scan-2', 'gemini', true),
      makeEngineResult('scan-2', 'perplexity', false),
    ]

    const mockClient = makeMockSupabase({
      businesses: { data: { id: 'biz-1' }, error: null },
      scans: { data: [scan2, scan1], error: null },
      scan_engine_results: { data: engineResults, error: null },
      approval_queue: { count: 0, error: null },
    })
    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockClient as ReturnType<typeof makeMockSupabase>)

    const result = await loadDashboardOutcomes('user-1')

    expect(result.overallTrend).toBeDefined()
    expect(result.overallTrend!.length).toBe(2)
    // Oldest point first
    // 2026-05-26 is a Tuesday → Monday is 2026-05-25
    // 2026-06-09 is a Tuesday → Monday is 2026-06-08
    expect(result.overallTrend![0]!.weekOf).toBe('2026-05-25')
    expect(result.overallTrend![1]!.weekOf).toBe('2026-06-08')
    expect(result.overallTrend![0]!.score).toBeGreaterThanOrEqual(0)
    expect(result.overallTrend![1]!.score).toBeGreaterThanOrEqual(0)
  })

  // (7) All scans in same week → 1 point → overallTrend omitted
  it('omits overallTrend when all scans fall in the same ISO week', async () => {
    const scan1 = makeScan('scan-1', '2026-06-09T08:00:00.000Z') // Mon Jun 9
    const scan2 = makeScan('scan-2', '2026-06-11T08:00:00.000Z') // Wed Jun 11 — same week

    const engineResults = [
      makeEngineResult('scan-1', 'chatgpt', true),
      makeEngineResult('scan-2', 'chatgpt', true),
    ]

    const mockClient = makeMockSupabase({
      businesses: { data: { id: 'biz-1' }, error: null },
      scans: { data: [scan2, scan1], error: null },
      scan_engine_results: { data: engineResults, error: null },
      approval_queue: { count: 0, error: null },
    })
    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockClient as ReturnType<typeof makeMockSupabase>)

    const result = await loadDashboardOutcomes('user-1')

    // Only 1 distinct week → overallTrend omitted
    expect(result.overallTrend).toBeUndefined()
  })

  // (8) approvalCount from pending count
  it('passes approvalCount from approval_queue pending count', async () => {
    const scan = makeScan('scan-1', '2026-06-09T08:00:00.000Z')

    const mockClient = makeMockSupabase({
      businesses: { data: { id: 'biz-1' }, error: null },
      scans: { data: [scan], error: null },
      scan_engine_results: { data: [makeEngineResult('scan-1', 'chatgpt', true)], error: null },
      approval_queue: { count: 7, error: null },
    })
    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockClient as ReturnType<typeof makeMockSupabase>)

    const result = await loadDashboardOutcomes('user-1')
    expect(result.approvalCount).toBe(7)
  })

  // (9) Supabase scans query error → EMPTY_OUTCOMES (no throw)
  it('returns EMPTY_OUTCOMES when scans query errors', async () => {
    const mockClient = makeMockSupabase({
      businesses: { data: { id: 'biz-1' }, error: null },
      scans: { data: null, error: { code: 'PGRST116', message: 'query error' } },
    })
    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockClient as ReturnType<typeof makeMockSupabase>)

    // Should not throw
    const result = await loadDashboardOutcomes('user-1')
    expect(result).toEqual(EMPTY_OUTCOMES)
  })

  // (10) Business query error → EMPTY_OUTCOMES (no throw)
  it('returns EMPTY_OUTCOMES when businesses query errors', async () => {
    const mockClient = makeMockSupabase({
      businesses: { data: null, error: { code: 'PGRST116', message: 'db error' } },
    })
    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockClient as ReturnType<typeof makeMockSupabase>)

    const result = await loadDashboardOutcomes('user-1')
    expect(result).toEqual(EMPTY_OUTCOMES)
  })
})
