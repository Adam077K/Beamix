/**
 * /market — Market Intelligence & Prompt Volume (Analytics Console)
 *
 * Phase 1B: design + mock data only. ZERO backend wiring.
 * All data from DEMO_MARKET fixture (lib/demo/surfaces/market.ts).
 *
 * This is a READ surface (no ledger / run-control) — the only ACTION-bearing
 * analytics surface, via the per-row Track → Tracking flip (mock/optimistic).
 * Demo users see the populated workbench. Real users see the empty state.
 *
 * State override: a `?state=` query param drives loading/empty/error/success for
 * design review, GATED behind NODE_ENV !== 'production' so prod never exposes it.
 *
 * QA tier: Full (aggregates category-level measurement data).
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isDemoUser } from '@/lib/demo'
import { MarketWorkbench, type MarketState } from './_components/MarketWorkbench'

export const metadata = {
  title: 'Market Intelligence & Prompt Volume — Beamix',
  description:
    "Estimated monthly query volume across your vertical, who gets cited, and the prompts nobody owns yet.",
}

const VALID_STATES: MarketState[] = ['loading', 'empty', 'error', 'success']

function resolveStateOverride(raw: string | undefined): MarketState | null {
  if (process.env.NODE_ENV === 'production') return null
  if (raw && (VALID_STATES as string[]).includes(raw)) return raw as MarketState
  return null
}

export default async function MarketPage({
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
  const baseState: MarketState = isDemoUser(user?.email) ? 'success' : 'empty'
  const state = override ?? baseState

  return <MarketWorkbench state={state} />
}
