/**
 * /scans/[scanId] — Server Component
 *
 * Fetches a single scan + its engine results from Supabase.
 * Passes real data to ScanDrilldown for rendering.
 * Returns 404 if the scan does not exist or does not belong to the user.
 */

import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ScanPageScan, ScanPageEngineResult, ScanPagePrevScan } from '@/components/scans/ScanDrilldown'
import { ScanDrilldown } from '@/components/scans/ScanDrilldown'

interface ScanDetailPageProps {
  params: Promise<{ scanId: string }>
}

export default async function ScanDetailPage({ params }: ScanDetailPageProps) {
  const { scanId } = await params

  const supabase = (await createClient()) as any

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch the scan — RLS ensures user can only access their own records
  const { data: scan, error: scanError } = await supabase
    .from('scans')
    .select('*')
    .eq('id', scanId)
    .eq('user_id', user.id)
    .single()

  if (scanError || !scan) {
    notFound()
  }

  // Fetch all engine results for this scan
  const { data: engineResultsRaw } = await supabase
    .from('scan_engine_results')
    .select(
      'id, engine, is_mentioned, rank_position, sentiment_score, mention_context, competitors_mentioned, queries_checked, queries_mentioned',
    )
    .eq('scan_id', scanId)

  const engineResults: ScanPageEngineResult[] = (engineResultsRaw ?? []).map(
    (row: Record<string, unknown>) => ({
      id: row.id as string,
      engine: row.engine as string,
      isMentioned: row.is_mentioned as boolean,
      rankPosition: (row.rank_position as number | null) ?? null,
      sentimentScore: (row.sentiment_score as number | null) ?? null,
      mentionContext: (row.mention_context as string | null) ?? null,
      competitorsMentioned: (row.competitors_mentioned as string[] | null) ?? [],
      queriesChecked: (row.queries_checked as number) ?? 0,
      queriesMentioned: (row.queries_mentioned as number) ?? 0,
    }),
  )

  // Fetch the previous scan for comparison (most recent scan before this one)
  let prevScan: ScanPagePrevScan | null = null
  if (scan.started_at) {
    const { data: prevRow } = await supabase
      .from('scans')
      .select('id, overall_score, started_at')
      .eq('business_id', scan.business_id)
      .eq('user_id', user.id)
      .lt('started_at', scan.started_at)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (prevRow) {
      prevScan = {
        id: prevRow.id as string,
        overallScore: (prevRow.overall_score as number | null) ?? null,
        startedAt: prevRow.started_at as string,
      }
    }
  }

  const scanData: ScanPageScan = {
    id: scan.id as string,
    businessId: scan.business_id as string,
    overallScore: (scan.overall_score as number | null) ?? null,
    startedAt: (scan.started_at as string | null) ?? scan.created_at as string,
    completedAt: (scan.completed_at as string | null) ?? null,
    status: (scan.status as 'running' | 'completed' | 'failed') ?? 'completed',
    enginesQueried: (scan.engines_queried as string[] | null) ?? [],
    enginesScanned: (scan.engines_scanned as string[]) ?? [],
    scanType: (scan.scan_type as 'initial' | 'manual' | 'scheduled') ?? 'manual',
    mentionsCount: (scan.mentions_count as number) ?? 0,
  }

  return (
    <ScanDrilldown
      scan={scanData}
      engineResults={engineResults}
      prevScan={prevScan}
    />
  )
}
