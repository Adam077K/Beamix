/**
 * /sentiment — Sentiment & Brand Integrity surface
 *
 * Phase 1B: design + mock data only. ZERO backend wiring.
 * All data from DEMO_SENTIMENT fixture (lib/demo/surfaces/sentiment.ts).
 *
 * This page carries the emotional weight of the product: the owner reads their
 * own situation in the AI engines' own words, then sees a quiet violet path to
 * correct any false claim. It holds the single Fraunces beat (hero verdict word).
 *
 * Demo users see the populated success state. Real users see the honest empty
 * state — we never fabricate model quotes when we haven't heard the engines yet.
 *
 * State can be forced via ?state= for local design review, gated behind
 * NODE_ENV !== 'production' so it never reaches users.
 *
 * QA tier: Full (aggregates measurement + sentiment data).
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isDemoUser } from '@/lib/demo'
import { SentimentPanel, type SentimentPanelState } from './_components/SentimentPanel'

export const metadata = {
  title: 'Sentiment & Brand Integrity — Beamix',
  description:
    'See the exact words AI engines use about your brand — and correct any false claims before they spread.',
}

const VALID_STATES: SentimentPanelState[] = ['loading', 'empty', 'error', 'success']

function resolveForcedState(raw: string | string[] | undefined): SentimentPanelState | null {
  if (process.env.NODE_ENV === 'production') return null
  const value = Array.isArray(raw) ? raw[0] : raw
  if (value && VALID_STATES.includes(value as SentimentPanelState)) {
    return value as SentimentPanelState
  }
  return null
}

export default async function SentimentPage({
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

  // Demo users see the populated brand-integrity story.
  // Real users (Phase 1) see the honest empty state — no engine data captured yet.
  const resolved: SentimentPanelState = isDemoUser(user?.email) ? 'success' : 'empty'

  return <SentimentPanel state={forced ?? resolved} />
}
