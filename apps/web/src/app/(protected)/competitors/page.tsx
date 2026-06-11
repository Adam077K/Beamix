/**
 * /competitors — Competitor Tracker page
 *
 * Phase 1: design + mock data only. ZERO backend wiring.
 * All data from DEMO_COMPETITORS fixture (lib/demo/surfaces/competitors.ts).
 *
 * This is an internal-report variant surface (not gated, not agent-run).
 * Demo mode: populated state.
 * Real users: empty state (no competitors configured yet).
 *
 * QA tier: Full (aggregates measurement data).
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isDemoUser } from '@/lib/demo'
import { CompetitorPanel } from './_components/CompetitorPanel'

export const metadata = {
  title: 'Competitor Tracker — Beamix',
  description:
    'Track competitor share of voice, identify visibility gaps, and dispatch targeted fixes.',
}

export default async function CompetitorsPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Demo users see the populated state with rich Ramat Gan dental fixture data.
  // Real users see the empty state (no competitors tracked yet in Phase 1).
  const state = isDemoUser(user?.email) ? 'success' : 'empty'

  return <CompetitorPanel state={state} />
}
