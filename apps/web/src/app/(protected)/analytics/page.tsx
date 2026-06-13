/**
 * /analytics — Answer-Engine Insights deep-dive (Analytics Console)
 *
 * Data routing:
 *   - Demo users: DEMO_ANALYTICS fixture passed explicitly as `data` prop.
 *   - Real users: loadAnalyticsSov() fetches from scan_engine_results +
 *     query_positions + competitor_results, maps to the DemoAnalytics contract,
 *     and is passed as `data` prop to AnalyticsWorkbench → WorkbenchBody.
 *     Empty scans → 'empty' state (WorkbenchPreview; data prop not consumed).
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
import { DEMO_ANALYTICS } from '@/lib/demo/surfaces'
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
  // Demo branch — passes DEMO_ANALYTICS explicitly so the default is
  // explicit and the demo path is byte-for-byte identical to before.
  // ------------------------------------------------------------------
  if (isDemoUser(user?.email)) {
    const state = override ?? 'success'
    return <AnalyticsWorkbench state={state} data={DEMO_ANALYTICS} />
  }

  // ------------------------------------------------------------------
  // Real-user branch — fetch from DB, derive state from data presence,
  // and pass the real DemoAnalytics-shaped object to WorkbenchBody.
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

  const realData = businessId ? await loadAnalyticsSov(supabase, businessId) : null

  // Determine state: success if we have visibility trend data, else empty.
  const hasData = (realData?.visibilityTrend.length ?? 0) > 0
  const baseState: AnalyticsState = hasData ? 'success' : 'empty'
  const state = override ?? baseState

  // Pass realData when present (success); omit (default=DEMO_ANALYTICS) when
  // empty — the empty state renders WorkbenchPreview not WorkbenchBody so it
  // doesn't matter, but defaulting is safe and avoids a null cast.
  return <AnalyticsWorkbench state={state} data={realData ?? undefined} />
}
