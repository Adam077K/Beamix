/**
 * /ask — "Ask Beamix" — a cited, grounded conversation OVER the customer's own
 * GEO data. A document-like thread, NOT a chatbot.
 *
 * Phase 1B: design + mock data only. ZERO backend wiring.
 * All data from DEMO_ASK fixture (lib/demo/surfaces/ask.ts).
 *
 * Every Beamix answer links back to real scans / prompts / competitors / pages
 * via inline citation chips. The "thinking" state is the violet PipelineLedger
 * grammar — it names the exact scans + prompts being read, then morphs into the
 * cited answer. That morph is the page's one signature moment.
 *
 * Demo users land on the populated thread; real users on the suggested-question
 * empty state (we never fabricate an answer before we've grounded one).
 *
 * State can be forced via ?state= for local design review, gated behind
 * NODE_ENV !== 'production' so it never reaches users.
 *
 * QA tier: Lite (isolated design surface, no API/DB/auth touched beyond the
 * existing protected layout's session read).
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isDemoUser } from '@/lib/demo'
import { AskThread, type AskState } from './_components/AskThread'

export const metadata = {
  title: 'Ask Beamix — Beamix',
  description:
    'Ask Beamix anything about your AI search visibility and get a cited answer grounded in your own scans, prompts and competitors.',
}

const VALID_STATES: AskState[] = ['loading', 'empty', 'error', 'success']

function resolveForcedState(raw: string | string[] | undefined): AskState | null {
  if (process.env.NODE_ENV === 'production') return null
  const value = Array.isArray(raw) ? raw[0] : raw
  if (value && VALID_STATES.includes(value as AskState)) {
    return value as AskState
  }
  return null
}

export default async function AskPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string | string[] }>
}) {
  const { state: rawState } = await searchParams
  const forced = resolveForcedState(rawState)

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Demo users see the seeded grounded thread; real users see the empty state.
  const baseState: AskState = isDemoUser(user?.email) ? 'success' : 'empty'
  const state = forced ?? baseState

  return <AskThread state={state} />
}
