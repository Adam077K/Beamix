/**
 * GET /api/notifications
 *
 * Returns paginated notifications for the authenticated user.
 * Supports unreadOnly, limit, and cursor-based pagination.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { NotificationsListQuerySchema } from '@/lib/types/api'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const parsed = NotificationsListQuerySchema.safeParse({
      unreadOnly: url.searchParams.get('unreadOnly') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      cursor: url.searchParams.get('cursor') ?? undefined,
    })

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_INPUT',
            message: 'Invalid query',
            details: parsed.error.issues,
          },
        },
        { status: 400 },
      )
    }

    const supabase = (await createClient()) as any
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHENTICATED', message: 'Sign in required' } },
        { status: 401 },
      )
    }

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(parsed.data.limit)

    if (parsed.data.unreadOnly) {
      query = query.is('read_at', null)
    }

    if (parsed.data.cursor) {
      query = query.lt('created_at', parsed.data.cursor)
    }

    const { data: rows, error: fetchError } = await query

    if (fetchError) {
      console.error('[notifications] fetch error:', fetchError.message)
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: 'Failed to fetch notifications.' } },
        { status: 500 },
      )
    }

    const items = ((rows ?? []) as Record<string, unknown>[]).map((r) => ({
      id: r['id'] as string,
      type: r['type'] as string,
      title: r['title'] as string,
      body: (r['body'] as string | null) ?? null,
      actionUrl: (r['action_url'] as string | null) ?? null,
      payload: (r['payload'] as Record<string, unknown>) ?? {},
      readAt: (r['read_at'] as string | null) ?? null,
      createdAt: r['created_at'] as string,
    }))

    const nextCursor =
      rows && rows.length === parsed.data.limit
        ? ((rows[rows.length - 1] as Record<string, unknown>)?.['created_at'] as string | null | undefined) ?? null
        : null

    return NextResponse.json({ items, nextCursor })
  } catch (err) {
    console.error('[notifications] unexpected error:', err)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } },
      { status: 500 },
    )
  }
}
