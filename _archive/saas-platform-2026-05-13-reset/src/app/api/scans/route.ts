/**
 * GET /api/scans
 *
 * Lists paginated scans for the authenticated user.
 * Query params: ?limit=20&cursor=<ISO timestamp>
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const ScansListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().datetime().optional(),
})

export async function GET(request: Request) {
  try {
    // 1. Parse query params
    const { searchParams } = new URL(request.url)
    const queryParsed = ScansListQuerySchema.safeParse({
      limit: searchParams.get('limit') ?? undefined,
      cursor: searchParams.get('cursor') ?? undefined,
    })

    if (!queryParsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters.',
            details: queryParsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 },
      )
    }

    const { limit, cursor } = queryParsed.data

    // 2. Auth check
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

    // 3. Build query with optional cursor pagination
    let query = (supabase as any)
      .from('scans')
      .select(
        'id, status, started_at, completed_at, score, score_delta, engines_succeeded, engines_total',
      )
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(limit + 1) // fetch one extra to determine if there's a next page

    if (cursor) {
      query = query.lt('started_at', cursor)
    }

    const { data: rows, error: fetchError } = await query

    if (fetchError) {
      console.error('[scans] DB fetch error:', fetchError)
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: 'Failed to fetch scans.' } },
        { status: 500 },
      )
    }

    const scans: unknown[] = rows ?? []
    const hasMore = scans.length > limit
    const page = hasMore ? scans.slice(0, limit) : scans

    // nextCursor = started_at of the last item in the page
    const nextCursor: string | null =
      hasMore && page.length > 0
        ? ((page[page.length - 1] as Record<string, unknown>)['started_at'] as string)
        : null

    return NextResponse.json({ scans: page, nextCursor })
  } catch (err) {
    console.error('[scans] Unexpected error:', err)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } },
      { status: 500 },
    )
  }
}
