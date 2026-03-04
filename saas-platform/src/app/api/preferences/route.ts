import { NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { createClient } from '@/lib/supabase/server'

const preferencesSchema = z.object({
  interface_lang: z.enum(['en', 'he']).optional(),
  content_lang: z.enum(['en', 'he']).optional(),
  timezone: z.string().min(1).max(50).optional(),
  weekly_digest: z.boolean().optional(),
  scan_complete_emails: z.boolean().optional(),
  competitor_alerts: z.boolean().optional(),
  agent_completion: z.boolean().optional(),
})

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [profileResult, notifResult] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('interface_lang, content_lang, timezone')
      .eq('id', user.id)
      .single(),
    supabase
      .from('notification_preferences')
      .select('weekly_digest, scan_complete_emails, competitor_alerts, agent_completion')
      .eq('user_id', user.id)
      .single(),
  ])

  return NextResponse.json({
    interface_lang: profileResult.data?.interface_lang ?? 'en',
    content_lang: profileResult.data?.content_lang ?? 'en',
    timezone: profileResult.data?.timezone ?? 'Asia/Jerusalem',
    weekly_digest: notifResult.data?.weekly_digest ?? true,
    scan_complete_emails: notifResult.data?.scan_complete_emails ?? true,
    competitor_alerts: notifResult.data?.competitor_alerts ?? false,
    agent_completion: notifResult.data?.agent_completion ?? true,
  })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = preferencesSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: z.prettifyError(parsed.error) },
      { status: 400 }
    )
  }

  const {
    interface_lang,
    content_lang,
    timezone,
    weekly_digest,
    scan_complete_emails,
    competitor_alerts,
    agent_completion,
  } = parsed.data

  // Update user profile (language, timezone)
  const userUpdates: Record<string, string> = {}
  if (interface_lang !== undefined) userUpdates.interface_lang = interface_lang
  if (content_lang !== undefined) userUpdates.content_lang = content_lang
  if (timezone !== undefined) userUpdates.timezone = timezone

  if (Object.keys(userUpdates).length > 0) {
    userUpdates.updated_at = new Date().toISOString()
    const { error: userError } = await supabase
      .from('user_profiles')
      .update(userUpdates)
      .eq('id', user.id)

    if (userError) {
      return NextResponse.json(
        { error: 'Failed to update user preferences', details: userError.message },
        { status: 500 }
      )
    }
  }

  // Update notification preferences
  const notifUpdates: Record<string, boolean | string> = {}
  if (weekly_digest !== undefined) notifUpdates.weekly_digest = weekly_digest
  if (scan_complete_emails !== undefined) notifUpdates.scan_complete_emails = scan_complete_emails
  if (competitor_alerts !== undefined) notifUpdates.competitor_alerts = competitor_alerts
  if (agent_completion !== undefined) notifUpdates.agent_completion = agent_completion

  if (Object.keys(notifUpdates).length > 0) {
    notifUpdates.updated_at = new Date().toISOString()
    const { error: notifError } = await supabase
      .from('notification_preferences')
      .update(notifUpdates)
      .eq('user_id', user.id)

    if (notifError) {
      return NextResponse.json(
        { error: 'Failed to update notification preferences', details: notifError.message },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ success: true })
}
