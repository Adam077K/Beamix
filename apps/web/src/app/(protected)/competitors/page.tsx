import { createClient } from '@/lib/supabase/server'
import { CompetitorsClient } from '@/components/competitors/CompetitorsClient'
import type { CompetitorsData } from '@/components/competitors/types'

// Empty-state props for CompetitorsClient when RPC fails or no data exists.
// CompetitorsClient expects 7 separate prop fields — a full adapter from
// get_competitors_summary RPC output to these fields is a follow-up task.
const EMPTY_PROPS = {
  competitors: [] as never[],
  yourSoV: 0,
  yourSoVTrend: [] as number[],
  yourEngineRates: {},
  trackedQueries: [] as never[],
  sovTrend: [] as never[],
  missedQueries: [] as string[],
}

export default async function CompetitorsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <CompetitorsClient {...EMPTY_PROPS} />
  }

  // Business lookup — use 'any' cast because Database types inference is
  // collapsing to 'never' for this query in the current Supabase SDK setup.
  const businessRes = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_primary', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  const business = businessRes.data as { id: string } | null

  if (!business) {
    return <CompetitorsClient {...EMPTY_PROPS} />
  }

  // RPC call — the result shape doesn't map 1:1 to CompetitorsClientProps,
  // so we log it for future adapter work and fall back to empty props today.
  const { data, error } = await (supabase.rpc as unknown as (fn: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>)(
    'get_competitors_summary',
    { p_user_id: user.id, p_business_id: business.id },
  )

  if (error) {
    console.error('[competitors] RPC failed', error)
    return <CompetitorsClient {...EMPTY_PROPS} />
  }

  // TODO: adapter from RPC CompetitorsData → CompetitorsClientProps fields
  void (data as CompetitorsData | null)

  return <CompetitorsClient {...EMPTY_PROPS} />
}
