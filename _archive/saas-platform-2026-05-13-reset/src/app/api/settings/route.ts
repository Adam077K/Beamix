/**
 * PATCH /api/settings
 *
 * Consolidated settings mutation endpoint.
 * Body: { tab: 'profile' | 'business' | 'notifications', data: { ... } }
 *
 * - 'profile'       → upsert user_profiles (full_name, timezone, locale)
 * - 'business'      → upsert businesses (name, website_url, industry, location, description, services)
 * - 'notifications' → upsert notification_preferences boolean columns
 *
 * RLS enforces ownership — user can only write their own rows.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// ─── Zod schemas per tab ──────────────────────────────────────────────────────

const ProfileDataSchema = z.object({
  full_name: z.string().max(200).optional(),
  timezone: z.string().max(100).optional(),
  locale: z.string().max(10).optional(),
})

const BusinessDataSchema = z.object({
  name: z.string().min(1).max(200),
  website_url: z.string().max(500).optional(),
  industry: z.string().max(100).optional(),
  location: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  services: z.array(z.string()).optional(),
})

const NotificationsDataSchema = z.object({
  inbox_ready: z.boolean().optional(),
  scan_complete: z.boolean().optional(),
  budget_alerts: z.boolean().optional(),
  competitor_movement: z.boolean().optional(),
  daily_digest_hour: z.number().int().min(0).max(23).optional(),
})

const BodySchema = z.discriminatedUnion('tab', [
  z.object({ tab: z.literal('profile'), data: ProfileDataSchema }),
  z.object({ tab: z.literal('business'), data: BusinessDataSchema }),
  z.object({ tab: z.literal('notifications'), data: NotificationsDataSchema }),
])

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function PATCH(request: NextRequest) {
  // 1. Auth
  const supabase = (await createClient()) as any
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  // 2. Parse + validate body
  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = BodySchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 422 },
    )
  }

  const { tab, data } = parsed.data

  // 3. Route to correct table
  if (tab === 'profile') {
    const { error } = await supabase
      .from('user_profiles')
      .upsert({ id: user.id, ...data, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (error) {
      console.error('[settings/profile] upsert error:', error)
      return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  }

  if (tab === 'business') {
    // upsert primary business row
    const { error } = await supabase.from('businesses').upsert(
      {
        user_id: user.id,
        is_primary: true,
        ...data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,is_primary' },
    )

    if (error) {
      console.error('[settings/business] upsert error:', error)
      return NextResponse.json({ error: 'Failed to save business' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  }

  if (tab === 'notifications') {
    const { error } = await supabase
      .from('notification_preferences')
      .upsert({ user_id: user.id, ...data, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)

    if (error) {
      console.error('[settings/notifications] upsert error:', error)
      return NextResponse.json({ error: 'Failed to save notification preferences' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown tab' }, { status: 400 })
}
