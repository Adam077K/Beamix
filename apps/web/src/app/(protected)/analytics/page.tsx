/**
 * /analytics — Answer-Engine Insights deep-dive (Analytics Console)
 *
 * Data routing:
 *   - Demo users: DEMO_ANALYTICS fixture (unchanged; WorkbenchBody reads from it
 *     directly inside the locked _components surface).
 *   - Real users: loadAnalyticsSov() fetches from scan_engine_results +
 *     query_positions + competitor_results and maps to the DemoAnalytics contract.
 *     State is derived from whether real scan data exists. The loader result is
 *     available for future wiring into the workbench components.
 *
 * This is a READ surface (no ledger / run-control) — a coordinated viz workbench.
 *
 * State override: a `?state=` query param drives loading/empty/error/success for
 * design review, GATED behind NODE_ENV !== 'production' so prod never exposes it.
 *
 * QA tier: Full (aggregates per-engine measurement data).
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isDemoUser } from '@/lib/demo'
import { loadAnalyticsSov } from '@/lib/analytics/load-sov'
import { AnalyticsWorkbench, type AnalyticsState } from './_components/AnalyticsWorkbench'

export const metadata = {
  title: 'Answer-Engine Insights — Beamix',
  description:
    'Per-engine AI search visibility, share of voice, and where your agents moved the needle.',
}

const VALID_STATES: AnalyticsState[] = ['loading', 'empty', 'error', 'success']

function resolveStateOverride(raw: string | undefined): AnalyticsState | null {
  if (process.env.NODE_ENV === 'production') return null
  if (raw && (VALID_STATES as string[]).includes(raw)) return raw as AnalyticsState
  return null
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>
}) {
  const { state: rawState } = await searchParams
  const override = resolveStateOverride(rawState)

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ------------------------------------------------------------------
  // Demo branch — unchanged. WorkbenchBody reads DEMO_ANALYTICS fixture
  // directly inside the locked _components surface.
  // ------------------------------------------------------------------
  if (isDemoUser(user?.email)) {
    const state = override ?? 'success'
    return <AnalyticsWorkbench state={state} />
  }

  // ------------------------------------------------------------------
  // Real-user branch — fetch from DB, derive state from data presence.
  // loadAnalyticsSov returns the DemoAnalytics-shaped object ready for
  // future prop-injection when _components wiring is scheduled.
  // ------------------------------------------------------------------

  // Resolve businessId for this authenticated user
  let businessId: string | null = null
  if (user?.id) {
    const { data: bizData } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()
    // bizData is typed as the businesses Row or null; access id safely
    businessId = (bizData as { id: string } | null)?.id ?? null
  }

  // _realData is populated and typed to DemoAnalytics contract; available for
  // the next wave when WorkbenchBody accepts an analyticsData prop.
  const _realData = businessId ? await loadAnalyticsSov(supabase, businessId) : null

  // Determine state: success if we have visibility trend data, else empty.
  const hasData = (_realData?.visibilityTrend.length ?? 0) > 0
  const baseState: AnalyticsState = hasData ? 'success' : 'empty'
  const state = override ?? baseState

  return <AnalyticsWorkbench state={state} />
}
