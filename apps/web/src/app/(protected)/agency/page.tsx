/**
 * /agency — Agency / Pitch Workspace
 *
 * Phase 1B: design + mock data only. ZERO backend wiring.
 * All data from DEMO_AGENCY fixture (lib/demo/surfaces/agency.ts).
 *
 * The story: the AGENCY (blue = you) commissions the Beamix AGENTS (violet) to
 * generate a branded GEO audit of a PROSPECT domain in one run. The audit is the
 * hero product moment; roster, white-label config, and lead pipeline are
 * supporting tabs reached after — never front-loaded (M10 progressive disclosure).
 *
 * The blue → violet handoff is the narrative spine: you press one blue "Generate
 * audit" button; a violet PipelineLedger does the work; a branded audit lands.
 *
 * Demo users see the populated success state (a seeded prospect audit). Real
 * users see the idle Generate flow — we never fabricate an audit we haven't run.
 *
 * State can be forced via ?state= for local design review, gated behind
 * NODE_ENV !== 'production' so it never reaches users.
 *
 * QA tier: Full (new route, agent-route affordances, future audit/correction wiring).
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isDemoUser } from '@/lib/demo'
import { AgencyWorkspace, type AgencyInitialState } from './_components/AgencyWorkspace'

export const metadata = {
  title: 'Agency / Pitch Workspace — Beamix',
  description:
    'Generate a branded GEO audit for any prospect domain. Your crew runs the full audit and hands you a shareable, white-labeled report.',
}

const VALID_STATES: AgencyInitialState[] = ['idle', 'running', 'success', 'empty', 'error']

function resolveForcedState(raw: string | string[] | undefined): AgencyInitialState | null {
  if (process.env.NODE_ENV === 'production') return null
  const value = Array.isArray(raw) ? raw[0] : raw
  if (value && VALID_STATES.includes(value as AgencyInitialState)) {
    return value as AgencyInitialState
  }
  return null
}

export default async function AgencyPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string | string[] }>
}) {
  const { state: forcedRaw } = await searchParams
  const forced = resolveForcedState(forcedRaw)

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Demo users land on the seeded prospect audit; real users start at the
  // Generate flow with an empty roster.
  const resolved: AgencyInitialState = isDemoUser(user?.email) ? 'success' : 'idle'

  return <AgencyWorkspace initialState={forced ?? resolved} />
}
