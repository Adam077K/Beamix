/**
 * /builder — Workflow / Agent Builder (Console Spine, Batch 3)
 *
 * Phase 1B: design + mock data only. ZERO backend wiring.
 * All data from DEMO_BUILDER fixture (lib/demo/surfaces/builder.ts).
 *
 * This is a COMPOSITION surface — a spatial node canvas, NOT the Analytics
 * Console. blue = your structure/inputs/triggers; violet = the agent nodes that
 * do the work + the dry-run ledger.
 *
 * Template-first progressive disclosure: the page opens as a weighted template
 * gallery and reveals the full canvas only once a template (or "Start blank")
 * is chosen.
 *
 * The ONE signature moment: the dry-run ledger overlay — hit "Dry run" and the
 * canvas dims while a violet PipelineLedger streams each agent node's would-be
 * execution (real step counts, real estimated cost in Geist Mono) — proving the
 * workflow honestly before a single credit is spent. Same grammar as /ask's
 * thinking state.
 *
 * State override: a `?state=` query param drives empty/success/error for design
 * review, GATED behind NODE_ENV !== 'production' so prod never exposes it.
 *
 * QA tier: Lite (isolated design surface, mock data, no API/DB/auth).
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isDemoUser } from '@/lib/demo'
import { BuilderSurface, type BuilderState } from './_components/BuilderSurface'

export const metadata = {
  title: 'Workflow Builder — Beamix',
  description:
    'Compose and sequence your agent crew into reusable workflows. Dry-run before you spend a credit.',
}

const VALID_STATES: BuilderState[] = ['empty', 'success', 'error']

function resolveStateOverride(raw: string | undefined): BuilderState | null {
  if (process.env.NODE_ENV === 'production') return null
  if (raw && (VALID_STATES as string[]).includes(raw)) return raw as BuilderState
  return null
}

export default async function BuilderPage({
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

  // Demo users land on a populated workflow canvas; real users on the template
  // gallery (which IS the empty state — never a bare dotted void).
  const baseState: BuilderState = isDemoUser(user?.email) ? 'success' : 'empty'
  const state = override ?? baseState

  return <BuilderSurface state={state} />
}
