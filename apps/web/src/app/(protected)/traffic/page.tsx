/**
 * /traffic — AI Traffic & Crawler Analytics deep-dive (Analytics Console)
 *
 * Phase 1B: design + mock data only. ZERO backend wiring.
 * All data from DEMO_TRAFFIC fixture (lib/demo/surfaces/traffic.ts).
 *
 * This is a READ surface (no ledger / run-control) — a coordinated viz workbench
 * that inherits the validated Console Spine from /analytics. Demo users see the
 * populated workbench; real users see the empty state.
 *
 * State override: a `?state=` query param drives loading/empty/error/success for
 * design review, GATED behind NODE_ENV !== 'production' so prod never exposes it.
 *
 * QA tier: Full (aggregates per-bot measurement data).
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isDemoUser } from '@/lib/demo'
import { TrafficWorkbench, type TrafficState } from './_components/TrafficWorkbench'

export const metadata = {
  title: 'AI Traffic & Crawler Analytics — Beamix',
  description:
    'AI-crawler activity per bot, the sessions and conversions answer engines refer, and which of your pages get cited most.',
}

const VALID_STATES: TrafficState[] = ['loading', 'empty', 'error', 'success']

function resolveStateOverride(raw: string | undefined): TrafficState | null {
  if (process.env.NODE_ENV === 'production') return null
  if (raw && (VALID_STATES as string[]).includes(raw)) return raw as TrafficState
  return null
}

export default async function TrafficPage({
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
  const baseState: TrafficState = isDemoUser(user?.email) ? 'success' : 'empty'
  const state = override ?? baseState

  return <TrafficWorkbench state={state} />
}
