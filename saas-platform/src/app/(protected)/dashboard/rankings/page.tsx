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
    .from('scan_results')
    .select('id')
    .eq('user_id', user.id)
    .order('scanned_at', { ascending: false })
    .limit(1)
    .single()

  const latestScanId = latestScanRow.data?.id ?? ''

  const [scansResult, detailsResult, queriesResult] = await Promise.all([
    supabase
      .from('scan_results')
      .select('id, overall_score, mention_count, avg_position, scanned_at, scan_type')
      .eq('user_id', user.id)
      .order('scanned_at', { ascending: false })
      .limit(20),
    latestScanId
      ? supabase
          .from('scan_result_details')
          .select('id, scan_result_id, llm_provider, is_mentioned, mention_position, sentiment, mention_context')
          .eq('scan_result_id', latestScanId)
      : Promise.resolve({ data: null }),
    supabase
      .from('tracked_queries')
      .select('id, query_text, priority, is_active, last_scanned_at')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('priority', { ascending: true }),
  ])

  return (
    <RankingsView
      scans={scansResult.data ?? []}
      latestDetails={detailsResult.data ?? []}
      queries={queriesResult.data ?? []}
    />
  )
}
