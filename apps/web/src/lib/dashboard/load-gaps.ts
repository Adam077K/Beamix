/**
 * load-gaps.ts — Server-only loader for the user's priority gap list.
 *
 * Resolution chain:
 *   authenticated user → businesses (first) → latest completed scan
 *   → scans.source_free_scan_id → free_scans.results.scan_v2.gap_list
 *
 * Client split (mirrors claim.ts):
 *   - businesses + scans:  user-scoped anon client (RLS enforces ownership)
 *   - free_scans:          admin client (service-role) — free_scans has no
 *                          authenticated SELECT policy; only service_role can read.
 *                          Authorization is safe: source_free_scan_id is only set on
 *                          claim for the authenticated user, so the chain user →
 *                          business → scan → free_scan is ownership-scoped already.
 *
 * Contract:
 *   - Never throws. Returns [] on any error or missing data.
 *   - Zod-parses the gap_list JSONB defensively with .passthrough() so extra
 *     fields added to RankedGap by future schema versions survive parsing.
 *   - Caps at top 8 gaps by rank (rank is 1-based, ascending).
 *   - Structured console.error on every failure path.
 */

import 'server-only'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/agents/db/admin-client'
import type { RankedGap } from '@/lib/scan/gap-types'

// ---------------------------------------------------------------------------
// Zod schema — defensive parse of RankedGap[] from JSONB
// ---------------------------------------------------------------------------

/**
 * Parses the minimum required fields. .passthrough() lets additional JSONB
 * fields (from future RankedGap additions) survive without a Zod error.
 * Zod's inferred output type is used directly — no unsafe cast needed.
 */
const RankedGapSchema = z.object({
  factor_key: z.string(),
  display_name: z.string(),
  tier: z.number().int().min(1).max(3),
  impact_weight: z.number().min(0).max(1),
  playbook_id: z.string().nullable(),
  promises_lift: z.boolean(),
  contrastive_count: z.number().int().min(0),
  competitors_with_factor: z.array(z.string()),
  contrastive_evidence: z.string(),
  fixability: z.enum(['fast', 'medium', 'slow']),
  effort_score: z.number(),
  rank: z.number().int().min(1),
  ordering_mode: z.enum(['contrastive', 'impact_fallback']),
}).passthrough()

const GapListSchema = z.array(RankedGapSchema)

// Cap: only the top 8 gaps by rank
const GAP_LIST_CAP = 8

// ---------------------------------------------------------------------------
// getLatestScanId — exported for "View all" link to /scan/[scan_id]
// ---------------------------------------------------------------------------

/**
 * Resolves the latest completed scan ID for the user's first business.
 * Returns null when no scan exists or on any error.
 */
export async function getLatestScanId(userId: string): Promise<string | null> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: businessData, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle() as { data: { id: string } | null; error: { code: string; message: string } | null }

    if (businessError || !businessData) return null

    const { data: scanData, error: scanError } = await supabase
      .from('scans')
      .select('id')
      .eq('business_id', businessData.id)
      .eq('status', 'complete')
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle() as { data: { id: string } | null; error: { code: string; message: string } | null }

    if (scanError || !scanData) return null

    return scanData.id
  } catch (err) {
    console.error('[dashboard/load-gaps] getLatestScanId unexpected error', {
      userId,
      error: err instanceof Error ? err.message : String(err),
    })
    return null
  }
}

// ---------------------------------------------------------------------------
// loadDashboardGaps — main export
// ---------------------------------------------------------------------------

/**
 * Loads the top 8 ranked gaps for the authenticated user.
 *
 * @param userId - The authenticated user's Supabase auth.users UUID.
 * @returns RankedGap[] — always resolves, never throws. Returns [] on any failure.
 */
export async function loadDashboardGaps(userId: string): Promise<RankedGap[]> {
  try {
    const supabase = await createServerSupabaseClient()

    // ------------------------------------------------------------------
    // 1. Resolve user → business via user-scoped client (RLS enforces ownership)
    // ------------------------------------------------------------------
    const { data: businessData, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle() as { data: { id: string } | null; error: { code: string; message: string } | null }

    if (businessError) {
      console.error('[dashboard/load-gaps] businesses query failed', {
        userId,
        code: businessError.code,
        message: businessError.message,
      })
      return []
    }

    if (!businessData) {
      // No business yet — legitimately empty state
      return []
    }

    const businessId = businessData.id

    // ------------------------------------------------------------------
    // 2. Fetch latest completed scan via user-scoped client (RLS enforces ownership)
    // ------------------------------------------------------------------
    const { data: scanData, error: scanError } = await supabase
      .from('scans')
      .select('id, source_free_scan_id')
      .eq('business_id', businessId)
      .eq('status', 'complete')
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle() as {
        data: { id: string; source_free_scan_id: string | null } | null
        error: { code: string; message: string } | null
      }

    if (scanError) {
      console.error('[dashboard/load-gaps] scans query failed', {
        userId,
        businessId,
        code: scanError.code,
        message: scanError.message,
      })
      return []
    }

    if (!scanData) {
      // Business exists but no completed scans yet
      return []
    }

    if (!scanData.source_free_scan_id) {
      // Scan exists but not sourced from a free scan — no gap_list available yet
      return []
    }

    const freeScanId = scanData.source_free_scan_id

    // ------------------------------------------------------------------
    // 3. Fetch free_scans.results via ADMIN client (service-role).
    //    free_scans has no authenticated SELECT RLS policy — only service_role
    //    can read it. Authorization is safe: freeScanId was set on the scan row
    //    only when the user claimed the free scan (claim.ts step 11), so the
    //    ownership chain user → business → scan → free_scan is already enforced
    //    by the user-scoped queries above.
    // ------------------------------------------------------------------
    const admin = getAdminClient()
    const { data: freeScanData, error: freeScanError } = await admin
      .from('free_scans')
      .select('results')
      .eq('id', freeScanId)
      .maybeSingle() as {
        data: { results: unknown } | null
        error: { code: string; message: string } | null
      }

    if (freeScanError) {
      console.error('[dashboard/load-gaps] free_scans query failed', {
        userId,
        businessId,
        freeScanId,
        code: freeScanError.code,
        message: freeScanError.message,
      })
      return []
    }

    if (!freeScanData) {
      return []
    }

    // ------------------------------------------------------------------
    // 4. Extract scan_v2.gap_list from the JSONB blob
    // ------------------------------------------------------------------
    const results = freeScanData.results
    if (!results || typeof results !== 'object') {
      return []
    }

    const resultsObj = results as Record<string, unknown>
    const scanV2 = resultsObj['scan_v2']

    if (!scanV2 || typeof scanV2 !== 'object') {
      // scan_v2 missing — free scan is pre-v2 or incomplete
      return []
    }

    const scanV2Obj = scanV2 as Record<string, unknown>
    const rawGapList = scanV2Obj['gap_list']

    if (!rawGapList) {
      return []
    }

    // ------------------------------------------------------------------
    // 5. Zod-parse gap_list defensively
    // ------------------------------------------------------------------
    const parsed = GapListSchema.safeParse(rawGapList)
    if (!parsed.success) {
      console.error('[dashboard/load-gaps] gap_list Zod parse failed', {
        userId,
        businessId,
        freeScanId,
        error: parsed.error.message,
        issues: parsed.error.issues,
      })
      return []
    }

    // ------------------------------------------------------------------
    // 6. Sort by rank ascending, cap at top 8
    // ------------------------------------------------------------------
    const sorted = [...parsed.data].sort((a, b) => a.rank - b.rank)
    // parsed.data is z.infer<typeof GapListSchema> which satisfies RankedGap[]
    // because .passthrough() preserves all required fields at runtime.
    return sorted.slice(0, GAP_LIST_CAP) as RankedGap[]
  } catch (err) {
    console.error('[dashboard/load-gaps] Unexpected error — returning []', {
      userId,
      error: err instanceof Error ? err.message : String(err),
    })
    return []
  }
}
