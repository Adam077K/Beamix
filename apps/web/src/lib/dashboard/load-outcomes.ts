/**
 * Dashboard outcomes loader — server-only pure function.
 *
 * Fetches a non-demo user's latest scan results from Supabase and maps them
 * into the DashboardOutcomes contract. Never throws — all errors are caught,
 * logged, and return EMPTY_OUTCOMES.
 *
 * Contract (from brief):
 *   - No business / no scan → EMPTY_OUTCOMES
 *   - ≥1 scan: visibilityScores[3] = latest scan per engine {engine, score, trend, lastUpdatedAt}
 *     - score = computeBand logic: presenceRate×100 + positionBonus (capped 0–100)
 *     - trend = sign(latestScore − previousScore same engine)
 *   - approvalCount = pending approval_queue items for the business
 *   - overallTrend = last 4 weeks {weekStartIso, score=mean of 3 engines}
 *     - weekStartIso = ISO-8601 Monday of the week the scan completed_at falls in
 *
 * Engine order in visibilityScores: chatgpt → gemini → perplexity (matches DEMO_DASHBOARD).
 *
 * Dev-only Zod validation: process.env.NODE_ENV === 'development' validates the
 * return shape against DashboardOutcomesSchema. This is stripped at build time.
 */

import 'server-only'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { DashboardOutcomes, OverallTrendPoint, VisibilityScore } from '@/types/outcomes'
import type { AIEngine } from '@/types/outcomes'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ENGINES: AIEngine[] = ['chatgpt', 'gemini', 'perplexity']

const EMPTY_SCORES: VisibilityScore[] = ENGINES.map((engine) => ({
  engine,
  score: null,
  trend: null,
  lastUpdatedAt: null,
}))

export const EMPTY_OUTCOMES: DashboardOutcomes = {
  visibilityScores: EMPTY_SCORES,
  weeklyNarrative: { type: 'empty' },
  approvalCount: 0,
}

// ---------------------------------------------------------------------------
// Dev-only schema validation
// ---------------------------------------------------------------------------

const VisibilityScoreSchema = z.object({
  engine: z.enum(['chatgpt', 'gemini', 'perplexity']),
  score: z.number().nullable(),
  trend: z.enum(['up', 'down', 'flat']).nullable(),
  lastUpdatedAt: z.string().nullable(),
})

const OverallTrendPointSchema = z.object({
  weekOf: z.string(),
  score: z.number().int().min(0).max(100),
})

const DashboardOutcomesSchema = z.object({
  visibilityScores: z.array(VisibilityScoreSchema).length(3),
  weeklyNarrative: z.object({
    type: z.enum(['empty', 'wins']),
    items: z.array(z.unknown()).optional(),
  }),
  approvalCount: z.number().int().min(0),
  overallTrend: z.array(OverallTrendPointSchema).optional(),
})

// ---------------------------------------------------------------------------
// Score derivation
// ---------------------------------------------------------------------------

/**
 * Derives a 0–100 visibility score from scan_engine_results rows.
 * Mirrors the computeBand formula:
 *   point = presenceRate × 100 + positionBonus (capped at 100)
 *   positionBonus = max(0, (4 − avgPosition) / 3 × 10) when rank in 1–3
 */
function deriveScore(
  rows: Array<{ is_mentioned: boolean; rank_position: number | null }>,
): number {
  const n = rows.length
  if (n === 0) return 0

  const presenceSuccesses = rows.filter((r) => r.is_mentioned).length
  const presenceRate = presenceSuccesses / n

  // Mean rank position across rows that have a rank and are mentioned
  const rankedRows = rows.filter((r) => r.is_mentioned && r.rank_position !== null)
  const avgPosition =
    rankedRows.length > 0
      ? rankedRows.reduce((sum, r) => sum + (r.rank_position ?? 0), 0) / rankedRows.length
      : null

  let positionBonus = 0
  if (presenceSuccesses > 0 && avgPosition !== null && avgPosition >= 1 && avgPosition <= 3) {
    positionBonus = Math.max(0, ((4 - avgPosition) / 3) * 10)
  }

  return Math.min(100, Math.max(0, Math.round(presenceRate * 100 + positionBonus)))
}

/**
 * Returns the ISO-8601 date string for the Monday of the week that `date` falls in.
 */
function weekStartIso(date: Date): string {
  const d = new Date(date)
  const day = d.getUTCDay() // 0=Sun, 1=Mon, ...
  const diff = (day === 0 ? -6 : 1 - day) // offset to Monday
  d.setUTCDate(d.getUTCDate() + diff)
  return d.toISOString().slice(0, 10)
}

// ---------------------------------------------------------------------------
// Raw DB types (matching database.types.ts exactly)
// ---------------------------------------------------------------------------

interface ScanRow {
  id: string
  completed_at: string | null
  created_at: string
  business_id: string
}

interface ScanEngineResultRow {
  scan_id: string
  engine: string
  is_mentioned: boolean
  rank_position: number | null
  created_at: string
}

// ---------------------------------------------------------------------------
// loadDashboardOutcomes
// ---------------------------------------------------------------------------

/**
 * Loads real DashboardOutcomes for the authenticated user.
 *
 * @param userId - The authenticated user's Supabase auth.users UUID.
 * @returns DashboardOutcomes — always resolves, never throws.
 */
export async function loadDashboardOutcomes(userId: string): Promise<DashboardOutcomes> {
  try {
    const supabase = await createServerSupabaseClient()

    // ------------------------------------------------------------------
    // 1. Resolve user → business (first business for the user)
    // ------------------------------------------------------------------
    const { data: businessData, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle() as { data: { id: string } | null; error: { code: string; message: string } | null }

    if (businessError) {
      console.error('[dashboard/load-outcomes] businesses query failed', {
        userId,
        code: businessError.code,
        message: businessError.message,
      })
      return EMPTY_OUTCOMES
    }

    if (!businessData) {
      // No business yet — legitimately empty state
      return EMPTY_OUTCOMES
    }

    const businessId = businessData.id

    // ------------------------------------------------------------------
    // 2. Fetch last 4 completed scans (newest first) for overallTrend + latest
    // ------------------------------------------------------------------
    const { data: scansData, error: scansError } = await supabase
      .from('scans')
      .select('id, completed_at, created_at, business_id')
      .eq('business_id', businessId)
      .eq('status', 'complete')
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(8) // fetch extra to ensure we can build ≤4 weekly points

    if (scansError) {
      console.error('[dashboard/load-outcomes] scans query failed', {
        userId,
        businessId,
        code: scansError.code,
        message: scansError.message,
      })
      return EMPTY_OUTCOMES
    }

    const scans = (scansData ?? []) as ScanRow[]

    if (scans.length === 0) {
      // Business exists but no completed scans yet
      return EMPTY_OUTCOMES
    }

    // ------------------------------------------------------------------
    // 3. Fetch scan_engine_results for all fetched scan IDs
    // ------------------------------------------------------------------
    const scanIds = scans.map((s) => s.id)

    const { data: engineResultsData, error: engineResultsError } = await supabase
      .from('scan_engine_results')
      .select('scan_id, engine, is_mentioned, rank_position, created_at')
      .in('scan_id', scanIds)

    if (engineResultsError) {
      console.error('[dashboard/load-outcomes] scan_engine_results query failed', {
        userId,
        businessId,
        code: engineResultsError.code,
        message: engineResultsError.message,
      })
      return EMPTY_OUTCOMES
    }

    const engineResults = (engineResultsData ?? []) as ScanEngineResultRow[]

    // ------------------------------------------------------------------
    // 4. Index engine results by scan_id for fast lookup
    // ------------------------------------------------------------------
    const resultsByScan = new Map<string, ScanEngineResultRow[]>()
    for (const row of engineResults) {
      const existing = resultsByScan.get(row.scan_id) ?? []
      existing.push(row)
      resultsByScan.set(row.scan_id, existing)
    }

    // ------------------------------------------------------------------
    // 5. Build visibilityScores from the latest scan
    //    trend = sign(latest engine score − previous scan same engine)
    // ------------------------------------------------------------------
    const latestScan = scans[0]! // guaranteed non-empty (checked above)
    const previousScan = scans.length >= 2 ? scans[1] : null

    const latestResults = resultsByScan.get(latestScan.id) ?? []
    const previousResults = previousScan ? (resultsByScan.get(previousScan.id) ?? []) : []

    const visibilityScores: VisibilityScore[] = ENGINES.map((engine) => {
      const latestRows = latestResults.filter((r) => r.engine === engine)

      if (latestRows.length === 0) {
        return { engine, score: null, trend: null, lastUpdatedAt: null }
      }

      const score = deriveScore(latestRows)
      const lastUpdatedAt = latestScan.completed_at ?? latestScan.created_at

      // Compute trend vs previous scan
      let trend: VisibilityScore['trend'] = null
      if (previousScan) {
        const prevRows = previousResults.filter((r) => r.engine === engine)
        if (prevRows.length > 0) {
          const prevScore = deriveScore(prevRows)
          if (score > prevScore) trend = 'up'
          else if (score < prevScore) trend = 'down'
          else trend = 'flat'
        }
      }

      return { engine, score, trend, lastUpdatedAt }
    })

    // ------------------------------------------------------------------
    // 6. Count pending approvals for this business
    // ------------------------------------------------------------------
    let approvalCount = 0
    try {
      const { count, error: countError } = await supabase
        .from('approval_queue')
        .select('id', { count: 'exact', head: true })
        .eq('customer_id', userId)
        .eq('state', 'pending')
        .gt('expires_at', new Date().toISOString())

      if (countError) {
        console.error('[dashboard/load-outcomes] approval_queue count failed', {
          userId,
          code: countError.code,
          message: countError.message,
        })
        // Non-fatal — continue with 0
      } else {
        approvalCount = count ?? 0
      }
    } catch (approvalErr) {
      // approval_queue may not be in the typed schema — catch schema-drift errors gracefully
      console.error('[dashboard/load-outcomes] approval_queue unexpected error', {
        userId,
        error: approvalErr instanceof Error ? approvalErr.message : String(approvalErr),
      })
    }

    // ------------------------------------------------------------------
    // 7. Build overallTrend: last 4 distinct ISO weeks, oldest → newest
    //    One data point per week (use the newest scan within that week).
    // ------------------------------------------------------------------
    const overallTrend: OverallTrendPoint[] = []

    // Group scans by week start ISO date (newest scan wins within the week)
    const weekMap = new Map<string, ScanRow>()
    for (const scan of scans) {
      const ts = scan.completed_at ?? scan.created_at
      const week = weekStartIso(new Date(ts))
      if (!weekMap.has(week)) {
        // First occurrence = newest scan in that week (scans ordered newest-first)
        weekMap.set(week, scan)
      }
    }

    // Take the newest 4 distinct weeks, then sort oldest→newest for rendering
    const sortedWeeks = [...weekMap.keys()]
      .sort((a, b) => b.localeCompare(a)) // newest first
      .slice(0, 4)
      .sort((a, b) => a.localeCompare(b)) // back to oldest first

    for (const week of sortedWeeks) {
      const scan = weekMap.get(week)!
      const rows = resultsByScan.get(scan.id) ?? []

      const engineScores = ENGINES.map((engine) => {
        const engineRows = rows.filter((r) => r.engine === engine)
        return engineRows.length > 0 ? deriveScore(engineRows) : null
      }).filter((s): s is number => s !== null)

      if (engineScores.length === 0) continue

      const mean = Math.round(engineScores.reduce((sum, s) => sum + s, 0) / engineScores.length)
      overallTrend.push({ weekOf: week, score: mean })
    }

    // ------------------------------------------------------------------
    // 8. Assemble and validate result
    // ------------------------------------------------------------------
    const result: DashboardOutcomes = {
      visibilityScores,
      weeklyNarrative: { type: 'empty' },
      approvalCount,
      ...(overallTrend.length >= 2 ? { overallTrend } : {}),
    }

    // Dev-only: validate return shape with Zod to catch contract drift early
    if (process.env.NODE_ENV === 'development') {
      const parsed = DashboardOutcomesSchema.safeParse(result)
      if (!parsed.success) {
        console.error('[dashboard/load-outcomes] DEV shape validation failed', {
          issues: parsed.error.issues,
        })
      }
    }

    return result
  } catch (err) {
    console.error('[dashboard/load-outcomes] Unexpected error — returning EMPTY_OUTCOMES', {
      userId,
      error: err instanceof Error ? err.message : String(err),
    })
    return EMPTY_OUTCOMES
  }
}
