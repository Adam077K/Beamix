/**
 * /team — Team & Roles (the calmest Settings-family surface)
 *
 * Phase 1B: design + mock data only. ZERO backend wiring.
 * All data from DEMO_TEAM fixture (lib/demo/surfaces/team.ts).
 *
 * The calm contract: no hero card, no sparkline, no violet (no agent surface
 * lives here). Just a Settings-shell table + forms. The single signature moment
 * is the seat-meter pill-bar, with exactly one editorial serif verdict beat
 * (Fraunces italic "workspace" in the Members subtitle). Restraint IS the design.
 *
 * Demo users see the populated team. Real users see the designed empty state
 * ("It's just you for now") with an invite-first composer.
 *
 * State override: a `?state=` query param drives loading/empty/error/success for
 * design review, GATED behind NODE_ENV !== 'production' so prod never exposes it.
 *
 * QA tier: Full (RBAC writes on /team touch auth/data once wired in Phase 2).
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isDemoUser } from '@/lib/demo'
import { DEMO_TEAM } from '@/lib/demo/surfaces'
import { TeamConsole, type TeamState } from './_components/TeamConsole'

export const metadata = {
  title: 'Team & Roles — Beamix',
  description: 'Invite your team and control what each person can do.',
}

const VALID_STATES: TeamState[] = ['loading', 'empty', 'error', 'success']

function resolveStateOverride(raw: string | undefined): TeamState | null {
  if (process.env.NODE_ENV === 'production') return null
  if (raw && (VALID_STATES as string[]).includes(raw)) return raw as TeamState
  return null
}

export default async function TeamPage({
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

  // Demo users land on the populated team; real users on the designed empty state.
  const baseState: TeamState = isDemoUser(user?.email) ? 'success' : 'empty'
  const state = override ?? baseState

  return <TeamConsole state={state} data={DEMO_TEAM} />
}
