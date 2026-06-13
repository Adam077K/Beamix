/**
 * Unit tests for load-sov.ts
 *
 * Coverage:
 *   (1) No business / no data → emptyAnalytics() contract shape
 *   (2) No completed scans → emptyAnalytics()
 *   (3) Populated rows → correct SoV mapping (heroSov, sovDelta, avgPositions, topicMatrix)
 *   (4) Malformed Supabase error → emptyAnalytics() (no throw)
 *   (5) Single scan → sovDelta = 0 (no previous period)
 *   (6) topicMatrix cells sorted + scoreBand derived correctly
 */

import { describe, it, expect } from 'vitest'
import { loadAnalyticsSov, emptyAnalytics } from '../load-sov'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/db/database.types'

// ---------------------------------------------------------------------------
// Helpers — minimal typed row factories
// ---------------------------------------------------------------------------

function makeScan(id: string, createdAt: string) {
  return { id, created_at: createdAt, status: 'complete', business_id: 'biz-1' }
}

function makeSer(scanId: string, engine: string, isMentioned: boolean, rankPosition: number | null = null) {
  return {
    id: `ser-${Math.random()}`,
    business_id: 'biz-1',
    scan_id: scanId,
    engine,
    is_mentioned: isMentioned,
    rank_position: rankPosition,
    citations: null,
    created_at: new Date().toISOString(),
    query_used: null,
    raw_response: null,
    sentiment: null,
  }
}

function makeQp(scanId: string, engine: string, queryText: string, position: number | null, isMentioned = true) {
  return {
    id: `qp-${Math.random()}`,
    business_id: 'biz-1',
    scan_id: scanId,
    engine,
    query_text: queryText,
    position,
    is_mentioned: isMentioned,
    query_id: null,
    created_at: new Date().toISOString(),
  }
}

function makeCr(scanId: string, competitorId: string, engine: string, isMentioned: boolean) {
  return {
    id: `cr-${Math.random()}`,
    business_id: 'biz-1',
    scan_id: scanId,
    competitor_id: competitorId,
    engine,
    is_mentioned: isMentioned,
    rank_position: null,
    citations: null,
    created_at: new Date().toISOString(),
    sentiment: null,
  }
}

// ---------------------------------------------------------------------------
// Supabase mock factory
// ---------------------------------------------------------------------------

function makeFrom(tableData: Record<string, unknown[]>) {
  return (table: string) => {
    const rows = tableData[table] ?? []
    const terminal = {
      data: rows,
      error: null,
    }

    function builder(data: unknown[]) {
      return {
        select: (_cols?: string) => builder(data),
        eq: (_col: string, _val: unknown) =>
          builder(
            data.filter((r: unknown) => {
              const row = r as Record<string, unknown>
              return row[_col] === _val
            }),
          ),
        in: (_col: string, vals: unknown[]) =>
          builder(
            data.filter((r: unknown) => {
              const row = r as Record<string, unknown>
              return vals.includes(row[_col])
            }),
          ),
        order: (_col: string, _opts?: unknown) => builder(data),
        limit: (_n: number) => builder(data.slice(0, _n)),
        then: (resolve: (v: typeof terminal) => unknown) =>
          Promise.resolve({ data, error: null }).then(resolve),
        // Supabase returns a thenable
        get data() { return data },
        get error() { return null },
      }
    }

    // Make the builder itself awaitable
    const b = builder(rows)
    Object.defineProperty(b, Symbol.toStringTag, { value: 'SupabaseQueryBuilder' })
    return b
  }
}

function buildSupabaseMock(tableData: Record<string, unknown[]>): SupabaseClient<Database> {
  return {
    from: makeFrom(tableData),
  } as unknown as SupabaseClient<Database>
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('emptyAnalytics', () => {
  it('returns a valid DemoAnalytics shape with zero values', () => {
    const empty = emptyAnalytics()
    expect(empty.heroSov).toBe(0)
    expect(empty.sovDelta).toBe(0)
    expect(empty.visibilityTrend).toEqual([])
    expect(empty.sovTrend).toEqual([])
    expect(empty.avgPositions).toEqual([])
    expect(empty.topicMatrix).toEqual([])
    expect(empty.drillData).toEqual({})
  })
})

describe('loadAnalyticsSov', () => {
  const BIZ_ID = 'biz-1'

  it('returns emptyAnalytics when scans table returns error', async () => {
    const supabase = {
      from: (table: string) => {
        if (table === 'scans') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  order: () => ({
                    limit: () => Promise.resolve({ data: null, error: { message: 'db error' } }),
                  }),
                }),
              }),
            }),
          }
        }
        return makeFrom({})(table)
      },
    } as unknown as SupabaseClient<Database>

    const result = await loadAnalyticsSov(supabase, BIZ_ID)
    expect(result).toEqual(emptyAnalytics())
  })

  it('returns emptyAnalytics when there are no completed scans', async () => {
    const supabase = buildSupabaseMock({
      scans: [],
      scan_engine_results: [],
      query_positions: [],
      competitor_results: [],
      competitors: [],
    })
    const result = await loadAnalyticsSov(supabase, BIZ_ID)
    expect(result).toEqual(emptyAnalytics())
  })

  it('returns correct heroSov and zero sovDelta for a single scan', async () => {
    const scan = makeScan('scan-1', '2026-06-09T10:00:00Z')
    // 3 out of 4 engines mentioned → 75%
    const serRows = [
      makeSer('scan-1', 'ChatGPT', true),
      makeSer('scan-1', 'Gemini', true),
      makeSer('scan-1', 'Perplexity', true),
      makeSer('scan-1', 'Claude', false),
    ]
    const supabase = buildSupabaseMock({
      scans: [scan],
      scan_engine_results: serRows,
      query_positions: [],
      competitor_results: [],
      competitors: [],
    })
    const result = await loadAnalyticsSov(supabase, BIZ_ID)
    expect(result.heroSov).toBe(75)
    expect(result.sovDelta).toBe(0) // single scan → no delta
  })

  it('computes sovDelta correctly across two scans', async () => {
    const scan1 = makeScan('scan-1', '2026-06-02T10:00:00Z')
    const scan2 = makeScan('scan-2', '2026-06-09T10:00:00Z')
    // scan-1: 2/4 = 50%; scan-2: 3/4 = 75% → delta = +25
    const serRows = [
      makeSer('scan-1', 'ChatGPT', true),
      makeSer('scan-1', 'Gemini', true),
      makeSer('scan-1', 'Perplexity', false),
      makeSer('scan-1', 'Claude', false),
      makeSer('scan-2', 'ChatGPT', true),
      makeSer('scan-2', 'Gemini', true),
      makeSer('scan-2', 'Perplexity', true),
      makeSer('scan-2', 'Claude', false),
    ]
    const supabase = buildSupabaseMock({
      scans: [scan1, scan2],
      scan_engine_results: serRows,
      query_positions: [],
      competitor_results: [],
      competitors: [],
    })
    const result = await loadAnalyticsSov(supabase, BIZ_ID)
    expect(result.heroSov).toBe(75)
    expect(result.sovDelta).toBe(25)
  })

  it('maps query_positions to avgPositions correctly', async () => {
    const scan = makeScan('scan-1', '2026-06-09T10:00:00Z')
    // ChatGPT: positions 1, 2, 3 → avg 2.0; Gemini: position 4 → avg 4.0
    const qpRows = [
      makeQp('scan-1', 'ChatGPT', 'dentist near me', 1),
      makeQp('scan-1', 'ChatGPT', 'teeth whitening', 2),
      makeQp('scan-1', 'ChatGPT', 'dental implants', 3),
      makeQp('scan-1', 'Gemini', 'dentist near me', 4),
    ]
    const supabase = buildSupabaseMock({
      scans: [scan],
      scan_engine_results: [makeSer('scan-1', 'ChatGPT', true)],
      query_positions: qpRows,
      competitor_results: [],
      competitors: [],
    })
    const result = await loadAnalyticsSov(supabase, BIZ_ID)
    const chatgpt = result.avgPositions.find((p) => p.engine === 'ChatGPT')
    const gemini = result.avgPositions.find((p) => p.engine === 'Gemini')
    expect(chatgpt?.avgPosition).toBe(2)
    expect(gemini?.avgPosition).toBe(4)
    // Sorted ascending by avgPosition: ChatGPT first
    expect(result.avgPositions[0].engine).toBe('ChatGPT')
  })

  it('builds topicMatrix cells with correct scoreBand', async () => {
    const scan = makeScan('scan-1', '2026-06-09T10:00:00Z')
    const qpRows = [
      makeQp('scan-1', 'ChatGPT', 'emergency dentist', 1.0),   // excellent
      makeQp('scan-1', 'Gemini', 'emergency dentist', 2.0),    // good
      makeQp('scan-1', 'Perplexity', 'teeth whitening', 3.5),  // fair
      makeQp('scan-1', 'Claude', 'dental implants', 4.0),      // critical
    ]
    const supabase = buildSupabaseMock({
      scans: [scan],
      scan_engine_results: [makeSer('scan-1', 'ChatGPT', true)],
      query_positions: qpRows,
      competitor_results: [],
      competitors: [],
    })
    const result = await loadAnalyticsSov(supabase, BIZ_ID)

    const emergencyChatgpt = result.topicMatrix.find(
      (c) => c.topic === 'emergency dentist' && c.engine === 'ChatGPT',
    )
    const emergencyGemini = result.topicMatrix.find(
      (c) => c.topic === 'emergency dentist' && c.engine === 'Gemini',
    )
    const whitening = result.topicMatrix.find(
      (c) => c.topic === 'teeth whitening' && c.engine === 'Perplexity',
    )
    const implants = result.topicMatrix.find(
      (c) => c.topic === 'dental implants' && c.engine === 'Claude',
    )

    expect(emergencyChatgpt?.scoreBand).toBe('excellent')
    expect(emergencyGemini?.scoreBand).toBe('good')
    expect(whitening?.scoreBand).toBe('fair')
    expect(implants?.scoreBand).toBe('critical')
  })

  it('populates sovTrend competitors from competitor_results + competitors names', async () => {
    const scan = makeScan('scan-1', '2026-06-09T10:00:00Z')
    const competitors = [
      { id: 'comp-1', name: 'Smile Center', business_id: BIZ_ID, website_url: '', created_at: '', updated_at: '', is_active: true },
    ]
    // comp-1 mentioned in 2 of 4 engine rows → 50%
    const crRows = [
      makeCr('scan-1', 'comp-1', 'ChatGPT', true),
      makeCr('scan-1', 'comp-1', 'Gemini', true),
      makeCr('scan-1', 'comp-1', 'Perplexity', false),
      makeCr('scan-1', 'comp-1', 'Claude', false),
    ]
    const supabase = buildSupabaseMock({
      scans: [scan],
      scan_engine_results: [makeSer('scan-1', 'ChatGPT', true)],
      query_positions: [],
      competitor_results: crRows,
      competitors,
    })
    const result = await loadAnalyticsSov(supabase, BIZ_ID)
    expect(result.sovTrend).toHaveLength(1)
    expect(result.sovTrend[0].competitors['Smile Center']).toBe(50)
  })

  it('drillData keys match topicMatrix cells', async () => {
    const scan = makeScan('scan-1', '2026-06-09T10:00:00Z')
    const qpRows = [
      makeQp('scan-1', 'ChatGPT', 'emergency dentist', 1),
      makeQp('scan-1', 'Gemini', 'teeth whitening', 2),
    ]
    const supabase = buildSupabaseMock({
      scans: [scan],
      scan_engine_results: [makeSer('scan-1', 'ChatGPT', true)],
      query_positions: qpRows,
      competitor_results: [],
      competitors: [],
    })
    const result = await loadAnalyticsSov(supabase, BIZ_ID)
    for (const cell of result.topicMatrix) {
      const key = `${cell.topic}__${cell.engine}`
      expect(result.drillData[key]).toBeDefined()
      expect(result.drillData[key].topic).toBe(cell.topic)
      expect(result.drillData[key].engine).toBe(cell.engine)
    }
  })

  // Regression: query_text containing '__' must NOT corrupt the engine field
  it('topic containing __ does not corrupt engine in topicMatrix', async () => {
    const scan = makeScan('scan-1', '2026-06-09T10:00:00Z')
    // query_text has a double-underscore — old split('__') would produce wrong engine
    const qpRows = [
      makeQp('scan-1', 'ChatGPT', 'teeth__whitening__special', 2),
    ]
    const supabase = buildSupabaseMock({
      scans: [scan],
      scan_engine_results: [makeSer('scan-1', 'ChatGPT', true)],
      query_positions: qpRows,
      competitor_results: [],
      competitors: [],
    })
    const result = await loadAnalyticsSov(supabase, BIZ_ID)
    expect(result.topicMatrix).toHaveLength(1)
    // topic must be the full original query_text, engine must be 'ChatGPT'
    expect(result.topicMatrix[0].topic).toBe('teeth__whitening__special')
    expect(result.topicMatrix[0].engine).toBe('ChatGPT')
  })

  // Regression: drillData promptsTested must not leak across topics for same engine
  it('drillData promptsTested contains only the cell topic, not other topics on same engine', async () => {
    const scan = makeScan('scan-1', '2026-06-09T10:00:00Z')
    // ChatGPT has two distinct topics; each cell must only see its own topic
    const qpRows = [
      makeQp('scan-1', 'ChatGPT', 'emergency dentist', 1),
      makeQp('scan-1', 'ChatGPT', 'teeth whitening', 2),
    ]
    const supabase = buildSupabaseMock({
      scans: [scan],
      scan_engine_results: [makeSer('scan-1', 'ChatGPT', true)],
      query_positions: qpRows,
      competitor_results: [],
      competitors: [],
    })
    const result = await loadAnalyticsSov(supabase, BIZ_ID)

    const emergencyKey = 'emergency dentist__ChatGPT'
    const whiteningKey = 'teeth whitening__ChatGPT'

    expect(result.drillData[emergencyKey]).toBeDefined()
    expect(result.drillData[whiteningKey]).toBeDefined()

    // No cross-topic leak: emergency dentist cell must NOT include 'teeth whitening'
    expect(result.drillData[emergencyKey].promptsTested).not.toContain('teeth whitening')
    // Symmetrical: whitening cell must NOT include 'emergency dentist'
    expect(result.drillData[whiteningKey].promptsTested).not.toContain('emergency dentist')
  })
})
