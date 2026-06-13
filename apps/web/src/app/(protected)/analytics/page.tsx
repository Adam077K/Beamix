/**
 * /analytics — Answer-Engine Insights deep-dive (Analytics Console)
 *
 * Phase 1B: design + mock data only. ZERO backend wiring.
 * All data from DEMO_ANALYTICS fixture (lib/demo/surfaces/analytics.ts).
 *
 * This is a READ surface (no ledger / run-control) — a coordinated viz workbench.
 * Demo users see the populated workbench. Real users see the empty state.
 *
 * State override: a `?state=` query param drives loading/empty/error/success for
 * design review, GATED behind NODE_ENV !== 'production' so prod never exposes it.
 *
 * QA tier: Full (aggregates per-engine measurement data).
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isDemoUser } from '@/lib/demo'
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

  // Demo users land on the populated workbench; real users on the empty state.
  const baseState: AnalyticsState = isDemoUser(user?.email) ? 'success' : 'empty'
  const state = override ?? baseState

  return <AnalyticsWorkbench state={state} />
}
