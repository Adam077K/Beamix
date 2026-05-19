/**
 * POST /api/notifications/read
 *
 * Marks one notification (by id) or all unread notifications as read.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { NotificationReadRequestSchema } from '@/lib/types/api'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const parsed = NotificationReadRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Provide id or all' } },
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

    const now = new Date().toISOString()
    let query = supabase
      .from('notifications')
      .update({ read_at: now })
      .eq('user_id', user.id)
      .is('read_at', null)

    if (parsed.data.id) {
      query = query.eq('id', parsed.data.id)
    }

    const { error: updateError } = await query

    if (updateError) {
      console.error('[notifications/read] update error:', updateError.message)
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: 'Failed to mark notifications as read.' } },
        { status: 500 },
      )
    }

    return NextResponse.json({ ok: true, readAt: now })
  } catch (err) {
    console.error('[notifications/read] unexpected error:', err)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } },
      { status: 500 },
    )
  }
}
