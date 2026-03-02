import { NextResponse } from 'next/server'
import { z } from 'zod/v4'
import { createClient } from '@/lib/supabase/server'

const preferencesSchema = z.object({
  language: z.enum(['en', 'he']).optional(),
  timezone: z.string().min(1).max(50).optional(),
  email_weekly_report: z.boolean().optional(),
  email_scan_complete: z.boolean().optional(),
  email_recommendations: z.boolean().optional(),
  email_agent_complete: z.boolean().optional(),
})

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
    language,
    timezone,
    email_weekly_report,
    email_scan_complete,
    email_recommendations,
    email_agent_complete,
  } = parsed.data

  // Update user profile (language, timezone)
  const userUpdates: Record<string, string> = {}
  if (language !== undefined) userUpdates.language = language
  if (timezone !== undefined) userUpdates.timezone = timezone

  if (Object.keys(userUpdates).length > 0) {
    userUpdates.updated_at = new Date().toISOString()
    const { error: userError } = await supabase
      .from('users')
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
  if (email_weekly_report !== undefined) notifUpdates.email_weekly_report = email_weekly_report
  if (email_scan_complete !== undefined) notifUpdates.email_scan_complete = email_scan_complete
  if (email_recommendations !== undefined) notifUpdates.email_recommendations = email_recommendations
  if (email_agent_complete !== undefined) notifUpdates.email_agent_complete = email_agent_complete

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
