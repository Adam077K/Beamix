/**
 * /reports — Reports & Exports (compose-and-share console)
 *
 * Phase 1B: design + mock data only. ZERO backend wiring.
 * All data from DEMO_REPORTS fixture (lib/demo/surfaces/reports.ts).
 *
 * Job = COMPOSE + SHARE + EXPORT, not browse. A three-zone shell:
 *   [Left rail: block library] | [Center: report canvas] | [Right drawer: export/share/schedule]
 *
 * Demo users land on the populated composer; real users on the first-run
 * "build your first report" empty state.
 *
 * State override: a `?state=` query param drives loading/empty/error/success for
 * design review, GATED behind NODE_ENV !== 'production' so prod never exposes it.
 *
 * QA tier: Lite (isolated design surface, no API/DB/auth touched beyond the
 * standard demo-gate read).
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isDemoUser } from '@/lib/demo'
import { ReportsConsole, type ReportsState } from './_components/ReportsConsole'

export const metadata = {
  title: 'Reports & Exports — Beamix',
  description:
    'Compose a custom report from your visibility data and agent activity, then export, schedule, or share it.',
}

const VALID_STATES: ReportsState[] = ['loading', 'empty', 'error', 'success']

function resolveStateOverride(raw: string | undefined): ReportsState | null {
  if (process.env.NODE_ENV === 'production') return null
  if (raw && (VALID_STATES as string[]).includes(raw)) return raw as ReportsState
  return null
}

export default async function ReportsPage({
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

  // Demo users see the populated composer with the Bright Smile Dental story.
  // Real users see the first-run composer (empty) until they build a report.
  const baseState: ReportsState = isDemoUser(user?.email) ? 'success' : 'empty'
  const state = override ?? baseState

  return <ReportsConsole state={state} />
}
