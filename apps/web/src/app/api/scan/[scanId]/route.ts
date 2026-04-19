/**
 * GET /api/scan/[scanId]
 *
 * Returns the status and result data for a single scan.
 * Returns 404 if the scan does not exist or belongs to another user.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ scanId: string }> },
) {
  try {
    const { scanId } = await params

    // 1. Auth check
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } },
        { status: 401 },
      )
    }

    // 2. Fetch scan row owned by this user
    const { data: scan, error: fetchError } = await (supabase as any)
      .from('scans')
      .select(
        'id, status, started_at, completed_at, score, score_delta, engines_succeeded, engines_total, user_id',
      )
      .eq('id', scanId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (fetchError) {
      console.error('[scan/[scanId]] DB fetch error:', fetchError)
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: 'Failed to fetch scan record.' } },
        { status: 500 },
      )
    }

    if (!scan) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Scan not found.' } },
        { status: 404 },
      )
    }

    // 3. Return normalised shape
    return NextResponse.json({
      id: scan.id as string,
      status: scan.status as string,
      startedAt: scan.started_at as string | null,
      completedAt: (scan.completed_at as string | null) ?? null,
      score: (scan.score as number | null) ?? null,
      scoreDelta: (scan.score_delta as number | null) ?? null,
      enginesSucceeded: (scan.engines_succeeded as number | null) ?? null,
      enginesTotal: (scan.engines_total as number | null) ?? null,
    })
  } catch (err) {
    console.error('[scan/[scanId]] Unexpected error:', err)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } },
      { status: 500 },
    )
  }
}
