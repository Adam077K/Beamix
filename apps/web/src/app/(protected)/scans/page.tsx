/**
 * /scans — Server Component
 *
 * Fetches real scan rows for the authenticated user's business
 * and passes them to ScansClient for rendering.
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ScansClient } from '@/components/scans/ScansClient'
import type { ScanRow } from '@/components/scans/ScansClient'

export default async function ScansPage() {
  const supabase = (await createClient()) as any

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch the user's primary business
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_primary', true)
    .maybeSingle()

  // Fetch plan tier for tier-gating the manual re-scan CTA
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan_id')
    .eq('user_id', user.id)
    .maybeSingle()

  const planTier = ((sub?.plan_id as string | undefined) ?? null) as
    | 'discover'
    | 'build'
    | 'scale'
    | null

  let scans: ScanRow[] = []

  if (business?.id) {
    const { data: rows } = await supabase
      .from('scans')
      .select(
        'id, overall_score, started_at, completed_at, status, engines_queried, engines_scanned, scan_type',
      )
      .eq('business_id', business.id)
      .order('started_at', { ascending: false })
      .limit(50)

    if (rows) {
      scans = (rows as Array<Record<string, unknown>>).map((row) => ({
        id: row.id as string,
        overallScore: (row.overall_score as number | null) ?? null,
        // score_delta_vs_prev is not stored in DB — computed at display time via prev scan comparison
        scoreDelta: null,
        startedAt: (row.started_at as string | null) ?? new Date().toISOString(),
        completedAt: (row.completed_at as string | null) ?? null,
        status: (row.status as 'running' | 'completed' | 'failed') ?? 'failed',
        enginesQueried: (row.engines_queried as string[] | null) ?? [],
        enginesScanned: (row.engines_scanned as string[]) ?? [],
        scanType: (row.scan_type as 'initial' | 'manual' | 'scheduled') ?? 'manual',
      }))
    }
  }

  return <ScansClient scans={scans} planTier={planTier} />
}
