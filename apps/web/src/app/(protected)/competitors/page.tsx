import { createClient } from '@/lib/supabase/server'
import { CompetitorsClient } from '@/components/competitors/CompetitorsClient'
import { deriveCompetitorsData } from './derive'

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

  const competitorsRes = await supabase
    .from('competitors')
    .select('id, name, website_url, domain, latest_score')
    .eq('business_id', business.id)
    .eq('is_active', true)
  const competitorRows = (competitorsRes.data ?? []) as unknown as Array<{
    id: string
    name: string
    website_url: string | null
    domain: string | null
    latest_score: number | null
  }>

  // All scan_engine_results for this business, joined to scan completion time.
  const resultsRes = await supabase
    .from('scan_engine_results')
    .select('scan_id, engine, prompt_text, is_mentioned, competitors_mentioned, scans!inner(completed_at)')
    .eq('business_id', business.id)
  type RawResultRow = {
    scan_id: string | null
    engine: string | null
    prompt_text: string | null
    is_mentioned: boolean | null
    competitors_mentioned: string[] | null
    scans: { completed_at: string | null } | { completed_at: string | null }[] | null
  }
  const rawRows = (resultsRes.data ?? []) as unknown as RawResultRow[]
  const scanResults = rawRows.map((r) => {
    const scanJoin = Array.isArray(r.scans) ? r.scans[0] : r.scans
    return {
      scan_id: r.scan_id,
      engine: r.engine,
      prompt_text: r.prompt_text,
      is_mentioned: r.is_mentioned,
      competitors_mentioned: r.competitors_mentioned,
      scan_completed_at: scanJoin?.completed_at ?? null,
    }
  })

  if (competitorRows.length === 0 || scanResults.length === 0) {
    return <CompetitorsClient {...EMPTY_PROPS} />
  }

  const derived = deriveCompetitorsData(competitorRows, scanResults)

  return <CompetitorsClient {...derived} />
}
