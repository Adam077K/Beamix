import { createClient } from '@/lib/supabase/server'
import { CompetitorsClient } from '@/components/competitors/CompetitorsClient'
import type { CompetitorsSummary } from '@/components/competitors/types'

export default async function CompetitorsPage() {
  const supabase = await createClient()

  // ── Auth ──────────────────────────────────────────────────────────────────
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // Middleware handles redirect; this is a safety fallback
    return <CompetitorsClient data={null} />
  }

  // ── Business lookup ───────────────────────────────────────────────────────
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!business) {
    return <CompetitorsClient data={null} />
  }

  // ── RPC call ──────────────────────────────────────────────────────────────
  const { data, error } = await supabase.rpc('get_competitors_summary', {
    p_user_id: user.id,
    p_business_id: business.id,
  })

  if (error) {
    console.error('[competitors] RPC failed', error)
    return <CompetitorsClient data={null} />
  }

  return <CompetitorsClient data={data as CompetitorsSummary} />
}
