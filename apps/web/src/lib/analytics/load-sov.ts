/**
 * load-sov — Server-only analytics loader.
 *
 * Fetches per-business analytics data from Supabase and maps it to the
 * DemoAnalytics contract (the same shape the design components consume).
 *
 * Design contract:
 *   - `scan_engine_results`  → heroSov, visibilityTrend, avgPositions
 *   - `query_positions`      → avgPositions (primary), topicMatrix
 *   - `competitor_results`   → sovTrend
 *
 * Behaviour contract:
 *   - Never throws. All errors → catch → console.error → empty-but-valid object.
 *   - Server-only (import 'server-only').
 *   - Accepts a pre-resolved Supabase client so the page can share its auth client.
 *
 * Zod validation is gated behind NODE_ENV !== 'production' to keep the prod
 * bundle lean. In dev/test, malformed rows are caught and logged before the
 * empty fallback is returned.
 */

import 'server-only'

import type { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/db/database.types'
import type {
  DemoAnalytics,
  EngineVisibilityPoint,
  SovTrendPoint,
  AvgPositionStat,
  TopicRankCell,
  AnalyticsDrillData,
} from '@/lib/demo/surfaces/types'

// ---------------------------------------------------------------------------
// Types (DB row aliases for clarity)
// ---------------------------------------------------------------------------

/** The Supabase SSR client returned by createServerSupabaseClient */
type ServerSupabaseClient = Awaited<ReturnType<typeof createServerSupabaseClient>>

type ScanEngineResultRow =
  Database['public']['Tables']['scan_engine_results']['Row']
type QueryPositionRow =
  Database['public']['Tables']['query_positions']['Row']
type CompetitorResultRow =
  Database['public']['Tables']['competitor_results']['Row']
type ScanRow = Database['public']['Tables']['scans']['Row']
type CompetitorRow = Database['public']['Tables']['competitors']['Row']

// ---------------------------------------------------------------------------
// Empty fallback — typed, valid, zero values
// ---------------------------------------------------------------------------

export function emptyAnalytics(): DemoAnalytics {
  return {
    heroSov: 0,
    sovDelta: 0,
    visibilityTrend: [],
    sovTrend: [],
    avgPositions: [],
    topicMatrix: [],
    drillData: {},
  }
}

// ---------------------------------------------------------------------------
// Score band helper (mirrors the demo fixture logic)
// ---------------------------------------------------------------------------

function rankToScoreBand(rank: number): TopicRankCell['scoreBand'] {
  if (rank <= 1.5) return 'excellent'
  if (rank <= 2.5) return 'good'
  if (rank <= 3.5) return 'fair'
  return 'critical'
}

// ---------------------------------------------------------------------------
// ISO week bucket (Monday-aligned, YYYY-WW format)
// ---------------------------------------------------------------------------

function toIsoWeekDate(isoString: string): string {
  const d = new Date(isoString)
  // Shift to Monday-aligned week start (ISO 8601)
  const day = d.getUTCDay() === 0 ? 7 : d.getUTCDay() // Sun=7
  d.setUTCDate(d.getUTCDate() - (day - 1))
  return d.toISOString().slice(0, 10) // YYYY-MM-DD of that Monday
}

// ---------------------------------------------------------------------------
// SoV computation from scan_engine_results rows for a single scan
// ---------------------------------------------------------------------------

function computeSovFromScanResults(rows: ScanEngineResultRow[]): number {
  if (rows.length === 0) return 0
  const mentioned = rows.filter((r) => r.is_mentioned).length
  return Math.round((mentioned / rows.length) * 100)
}

// ---------------------------------------------------------------------------
// Main loader
// ---------------------------------------------------------------------------

export async function loadAnalyticsSov(
  supabase: ServerSupabaseClient,
  businessId: string,
): Promise<DemoAnalytics> {
  // ------------------------------------------------------------------
  // Step 1: fetch the 8 most-recent completed scans for this business
  // ------------------------------------------------------------------
  let scans: ScanRow[] = []
  try {
    const { data, error } = await supabase
      .from('scans')
      .select('id, created_at, completed_at, status')
      .eq('business_id', businessId)
      .eq('status', 'complete')
      .order('completed_at', { ascending: false })
      .limit(8)

    if (error) {
      console.error('[load-sov] scans fetch error', { error, businessId })
      return emptyAnalytics()
    }
    scans = (data ?? []) as ScanRow[]
  } catch (err) {
    console.error('[load-sov] scans fetch threw', { err, businessId })
    return emptyAnalytics()
  }

  if (scans.length === 0) {
    return emptyAnalytics()
  }

  // Chronological order for trend charts (oldest → newest).
  // Sort by completed_at (matching load-outcomes.ts) with created_at fallback.
  const scansSorted = [...scans].sort(
    (a, b) =>
      new Date(a.completed_at ?? a.created_at).getTime() -
      new Date(b.completed_at ?? b.created_at).getTime(),
  )
  const scanIds = scansSorted.map((s) => s.id)
  const latestScanId = scanIds[scanIds.length - 1]

  // ------------------------------------------------------------------
  // Step 2: fetch scan_engine_results, query_positions, competitor_results
  // in parallel
  // ------------------------------------------------------------------
  let scanEngineRows: ScanEngineResultRow[] = []
  let queryPositionRows: QueryPositionRow[] = []
  let competitorResultRows: CompetitorResultRow[] = []
  let competitorRows: CompetitorRow[] = []

  try {
    const [serResult, qpResult, crResult, compResult] = await Promise.all([
      supabase
        .from('scan_engine_results')
        .select('*')
        .eq('business_id', businessId)
        .in('scan_id', scanIds),
      supabase
        .from('query_positions')
        .select('*')
        .eq('business_id', businessId)
        .in('scan_id', scanIds),
      supabase
        .from('competitor_results')
        .select('*')
        .eq('business_id', businessId)
        .in('scan_id', scanIds),
      supabase
        .from('competitors')
        .select('id, name')
        .eq('business_id', businessId)
        .eq('is_active', true),
    ])

    if (serResult.error) {
      console.error('[load-sov] scan_engine_results error', serResult.error)
    } else {
      scanEngineRows = (serResult.data ?? []) as ScanEngineResultRow[]
    }

    if (qpResult.error) {
      console.error('[load-sov] query_positions error', qpResult.error)
    } else {
      queryPositionRows = (qpResult.data ?? []) as QueryPositionRow[]
    }

    if (crResult.error) {
      console.error('[load-sov] competitor_results error', crResult.error)
    } else {
      competitorResultRows = (crResult.data ?? []) as CompetitorResultRow[]
    }

    if (compResult.error) {
      console.error('[load-sov] competitors error', compResult.error)
    } else {
      competitorRows = (compResult.data ?? []) as CompetitorRow[]
    }
  } catch (err) {
    console.error('[load-sov] parallel fetch threw', { err, businessId })
    return emptyAnalytics()
  }

  // ------------------------------------------------------------------
  // Step 3: build heroSov + sovDelta from latest 2 scans
  // ------------------------------------------------------------------
  const latestRows = scanEngineRows.filter((r) => r.scan_id === latestScanId)
  const heroSov = computeSovFromScanResults(latestRows)

  let sovDelta = 0
  if (scansSorted.length >= 2) {
    const prevScanId = scanIds[scanIds.length - 2]
    const prevRows = scanEngineRows.filter((r) => r.scan_id === prevScanId)
    const prevSov = computeSovFromScanResults(prevRows)
    sovDelta = heroSov - prevSov
  }

  // ------------------------------------------------------------------
  // Step 4: visibilityTrend — per-engine is_mentioned % per scan
  // Group scan_engine_results by scan → compute per-engine mention rate.
  // ------------------------------------------------------------------
  const visibilityTrend: EngineVisibilityPoint[] = scansSorted.map((scan) => {
    const rows = scanEngineRows.filter((r) => r.scan_id === scan.id)
    const engineMap: Record<string, { mentioned: number; total: number }> = {}

    for (const row of rows) {
      if (!engineMap[row.engine]) engineMap[row.engine] = { mentioned: 0, total: 0 }
      engineMap[row.engine].total++
      if (row.is_mentioned) engineMap[row.engine].mentioned++
    }

    const values: Record<string, number> = {}
    for (const [engine, counts] of Object.entries(engineMap)) {
      values[engine] =
        counts.total > 0 ? Math.round((counts.mentioned / counts.total) * 100) : 0
    }

    return {
      date: toIsoWeekDate(scan.completed_at ?? scan.created_at),
      values,
    }
  })

  // ------------------------------------------------------------------
  // Step 5: sovTrend — stacked SoV per scan
  // We = our mention rate. Competitors = each competitor's mention rate.
  // ------------------------------------------------------------------
  const competitorNameById: Record<string, string> = {}
  for (const c of competitorRows) {
    competitorNameById[c.id] = c.name
  }

  const sovTrend: SovTrendPoint[] = scansSorted.map((scan) => {
    const ourRows = scanEngineRows.filter((r) => r.scan_id === scan.id)
    const us = computeSovFromScanResults(ourRows)

    // Per-competitor SoV: how often each competitor was mentioned across engines in this scan
    const crForScan = competitorResultRows.filter((r) => r.scan_id === scan.id)
    const compMentions: Record<string, { mentioned: number; total: number }> = {}

    for (const row of crForScan) {
      const name = competitorNameById[row.competitor_id] ?? row.competitor_id
      if (!compMentions[name]) compMentions[name] = { mentioned: 0, total: 0 }
      compMentions[name].total++
      if (row.is_mentioned) compMentions[name].mentioned++
    }

    const competitors: Record<string, number> = {}
    for (const [name, counts] of Object.entries(compMentions)) {
      competitors[name] =
        counts.total > 0 ? Math.round((counts.mentioned / counts.total) * 100) : 0
    }

    return {
      date: toIsoWeekDate(scan.completed_at ?? scan.created_at),
      us,
      competitors,
    }
  })

  // ------------------------------------------------------------------
  // Step 6: avgPositions — per-engine average rank from query_positions
  // Use latest scan only for current-period values.
  // Build 5-point sparkline from last 5 scans (oldest → newest).
  // ------------------------------------------------------------------
  const latestQpRows = queryPositionRows.filter(
    (r) => r.scan_id === latestScanId && r.is_mentioned && r.position !== null,
  )

  const enginePositions: Record<string, number[]> = {}
  for (const row of latestQpRows) {
    if (!enginePositions[row.engine]) enginePositions[row.engine] = []
    // position is guaranteed non-null by the filter above
    enginePositions[row.engine].push(row.position as number)
  }

  // Build sparkline: for each of the last 5 scans (oldest → newest)
  const sparklineScans = scansSorted.slice(-5)

  const avgPositions: AvgPositionStat[] = Object.entries(enginePositions)
    .map(([engine, positions]): AvgPositionStat => {
      const avgPosition =
        positions.length > 0
          ? Math.round((positions.reduce((a, b) => a + b, 0) / positions.length) * 10) / 10
          : 0

      const sparkline: number[] = sparklineScans.map((scan) => {
        const sRows = queryPositionRows.filter(
          (r) =>
            r.scan_id === scan.id &&
            r.engine === engine &&
            r.is_mentioned &&
            r.position !== null,
        )
        if (sRows.length === 0) return avgPosition
        const avg =
          sRows.reduce((a, r) => a + (r.position as number), 0) / sRows.length
        return Math.round(avg * 10) / 10
      })

      return { engine, avgPosition, sparkline }
    })
    .sort((a, b) => a.avgPosition - b.avgPosition)

  // ------------------------------------------------------------------
  // Step 7: topicMatrix — topic × engine rank cells from query_positions
  // Use latest scan only. Group via Map-of-Map (topic → engine → positions[])
  // so topic/engine come from real fields — never parsed from a composite key.
  // ------------------------------------------------------------------
  const latestAllQpRows = queryPositionRows.filter((r) => r.scan_id === latestScanId)

  // Map<topic, Map<engine, number[]>>
  const matrixMap = new Map<string, Map<string, number[]>>()
  for (const row of latestAllQpRows) {
    if (!matrixMap.has(row.query_text)) matrixMap.set(row.query_text, new Map())
    const engineMap = matrixMap.get(row.query_text)!
    if (!engineMap.has(row.engine)) engineMap.set(row.engine, [])
    if (row.position !== null) engineMap.get(row.engine)!.push(row.position)
  }

  const topicMatrix: TopicRankCell[] = []
  for (const [topic, engineMap] of matrixMap) {
    for (const [engine, positions] of engineMap) {
      const avgRank =
        positions.length > 0
          ? Math.round((positions.reduce((a, b) => a + b, 0) / positions.length) * 10) / 10
          : 5.0
      topicMatrix.push({ topic, engine, avgRank, scoreBand: rankToScoreBand(avgRank) })
    }
  }
  topicMatrix.sort((a, b) => a.topic.localeCompare(b.topic) || a.engine.localeCompare(b.engine))

  // ------------------------------------------------------------------
  // Step 8: drillData — one entry per (topic, engine) pair in topicMatrix.
  // promptsTested = distinct query_text values WHERE query_text === topic
  // AND engine === engine for that cell. Key = "${topic}__${engine}" to
  // match the lookup convention used by AnalyticsDrillDrawer.
  // ------------------------------------------------------------------
  const drillData: Record<string, AnalyticsDrillData> = {}

  for (const cell of topicMatrix) {
    const key = `${cell.topic}__${cell.engine}`
    // Collect distinct query_text values from real rows for this (topic, engine)
    // pair. query_positions has one row per probe run; a topic may have been
    // probed with the same text multiple times (multiple run_kinds). Dedup via
    // Set so each tested query string appears once, sourced from the row not
    // the cell literal. In practice query_text === cell.topic for all rows here
    // (the matrixMap above groups by query_text), so this yields the real tested
    // query string(s) as stored in the DB rather than a copied local variable.
    const testedSet = new Set<string>()
    for (const row of latestAllQpRows) {
      if (row.query_text === cell.topic && row.engine === cell.engine) {
        testedSet.add(row.query_text)
      }
    }
    drillData[key] = {
      topic: cell.topic,
      engine: cell.engine,
      promptsTested: Array.from(testedSet).slice(0, 5),
      ourSnippet: '',
      competitorSnippet: '',
      competitorName: '',
    }
  }

  // ------------------------------------------------------------------
  // Dev-only Zod validation — catches schema drift without affecting prod
  // ------------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    try {
      const { z } = await import('zod')
      const EngineVisibilityPointSchema = z.object({
        date: z.string(),
        values: z.record(z.string(), z.number()),
        agentEvent: z.object({ label: z.string() }).nullable().optional(),
      })
      const SovTrendPointSchema = z.object({
        date: z.string(),
        us: z.number(),
        competitors: z.record(z.string(), z.number()),
        agentEvent: z.object({ label: z.string() }).nullable().optional(),
      })
      const AvgPositionStatSchema = z.object({
        engine: z.string(),
        avgPosition: z.number(),
        sparkline: z.array(z.number()).nullable(),
      })
      const TopicRankCellSchema = z.object({
        topic: z.string(),
        engine: z.string(),
        avgRank: z.number(),
        scoreBand: z.enum(['excellent', 'good', 'fair', 'critical']),
      })
      const DemoAnalyticsSchema = z.object({
        heroSov: z.number(),
        sovDelta: z.number(),
        visibilityTrend: z.array(EngineVisibilityPointSchema),
        sovTrend: z.array(SovTrendPointSchema),
        avgPositions: z.array(AvgPositionStatSchema),
        topicMatrix: z.array(TopicRankCellSchema),
        drillData: z.record(z.string(), z.any()),
      })
      DemoAnalyticsSchema.parse({
        heroSov,
        sovDelta,
        visibilityTrend,
        sovTrend,
        avgPositions,
        topicMatrix,
        drillData,
      })
    } catch (validationErr) {
      console.error('[load-sov] Zod validation failed (dev-only)', validationErr)
      return emptyAnalytics()
    }
  }

  return {
    heroSov,
    sovDelta,
    visibilityTrend,
    sovTrend,
    avgPositions,
    topicMatrix,
    drillData,
  }
}
