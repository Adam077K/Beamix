/**
 * /shopping — Shopping / Ecommerce visibility (Analytics Console register)
 *
 * Phase 1B: design + mock data only. ZERO backend wiring.
 * All data from DEMO_SHOPPING fixture (lib/demo/surfaces/shopping.ts).
 *
 * Frames Bright Smile Dental's online SHOP (whitening kits, electric brushes,
 * aligner-care SKUs). The signature moment is the Attribute-Accuracy correctness
 * matrix — blue=you data, violet=agents fix-route.
 *
 * Demo users see the populated workbench. Real users see the empty state.
 *
 * State override: a `?state=` query param drives loading/empty/error/success for
 * design review, GATED behind NODE_ENV !== 'production' so prod never exposes it.
 *
 * QA tier: Full (new route; renders attribute-correctness + revenue attribution).
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isDemoUser } from '@/lib/demo'
import { ShoppingWorkbench, type ShoppingState } from './_components/ShoppingWorkbench'

export const metadata = {
  title: 'Shopping & Ecommerce — Beamix',
  description:
    'How AI answer engines recommend your products: SKU visibility, attribute accuracy, and AI-attributed revenue.',
}

const VALID_STATES: ShoppingState[] = ['loading', 'empty', 'error', 'success']

function resolveStateOverride(raw: string | undefined): ShoppingState | null {
  if (process.env.NODE_ENV === 'production') return null
  if (raw && (VALID_STATES as string[]).includes(raw)) return raw as ShoppingState
  return null
}

export default async function ShoppingPage({
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
  const baseState: ShoppingState = isDemoUser(user?.email) ? 'success' : 'empty'
  const state = override ?? baseState

  return <ShoppingWorkbench state={state} />
}
