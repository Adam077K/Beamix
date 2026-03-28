import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RankingsView } from '@/components/dashboard/rankings-view'

export default async function RankingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch latest scan ID first, then run remaining queries in parallel
  const latestScanRow = await supabase
    .from('scans')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const latestScanId = latestScanRow.data?.id ?? ''

  // Get business ID for competitor management
  const businessRow = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  const businessId = businessRow.data?.id ?? null

  const [scansResult, detailsResult, queriesResult, competitorsResult] = await Promise.all([
    supabase
      .from('scans')
      .select('id, overall_score, mentions_count, created_at, scan_type')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),
    latestScanId
      ? supabase
          .from('scan_engine_results')
          .select('id, scan_id, engine, is_mentioned, rank_position, sentiment')
          .eq('scan_id', latestScanId)
      : Promise.resolve({ data: null }),
    supabase
      .from('tracked_queries')
      .select('id, query_text, priority, is_active, last_scanned_at')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('priority', { ascending: true }),
    businessId
      ? supabase
          .from('competitors')
          .select('id, name, domain, source, created_at, business_id')
          .eq('business_id', businessId)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
  ])

  type MentionSentiment = 'positive' | 'neutral' | 'negative'
  type EngineDetail = {
    id: string
    scan_id: string
    engine: string
    is_mentioned: boolean
    rank_position: number | null
    sentiment: MentionSentiment | null
  }

  return (
    <RankingsView
      scans={scansResult.data ?? []}
      latestDetails={(detailsResult.data ?? []) as EngineDetail[]}
      queries={(queriesResult.data ?? []).map(q => ({ ...q, priority: Number(q.priority) || null }))}
      competitors={competitorsResult.data ?? []}
      businessId={businessId}
    />
  )
}
