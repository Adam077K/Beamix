import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendWeeklyDigestEmail } from '@/lib/email/events'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error('[CRON:weekly-digest] CRON_SECRET not configured')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServiceClient()

  // Get active users with weekly report enabled
  const { data: users, error: usersError } = await supabase
    .from('user_profiles')
    .select(`
      id,
      email,
      full_name,
      notification_preferences!inner(email_weekly_report)
    `)
    // NOTE: This embedded join relies on PostgREST detecting the implicit FK via
    // user_profiles.id <-> notification_preferences.user_id. If this query fails
    // at runtime, refactor to separate queries like trial-nudges approach.
    .not('onboarding_completed_at', 'is', null)

  if (usersError) {
    console.error('[CRON:weekly-digest] Failed to fetch users:', usersError)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }

  const eligibleUsers = (users ?? []).filter((u) => {
    const prefs = u.notification_preferences as unknown as { email_weekly_report: boolean } | null
    return prefs?.email_weekly_report !== false
  })

  let sent = 0
  let failed = 0

  // TODO(perf): N+1 query pattern — each user triggers 4 sequential DB queries
  // (businesses, scans, recommendations, content_items + tracked_queries).
  // Acceptable for MVP with low user counts. When user base grows, refactor to batch
  // queries using .in('user_id', userIds) similar to trial-nudges approach.
  for (const user of eligibleUsers) {
    // Get user's primary business
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single()

    if (!business) continue

    // Get scan result stats for the past week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const { data: recentScans } = await supabase
      .from('scans')
      .select('overall_score')
      .eq('user_id', user.id)
      .eq('business_id', business.id)
      .gte('created_at', oneWeekAgo.toISOString())
      .order('created_at', { ascending: false })

    const { count: newRecsCount } = await supabase
      .from('recommendations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', oneWeekAgo.toISOString())

    const { count: contentCount } = await supabase
      .from('content_items')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', oneWeekAgo.toISOString())

    // Get top tracked query
    const { data: topQuery } = await supabase
      .from('tracked_queries')
      .select(`
        query_text,
        scans(overall_score)
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('last_scanned_at', { ascending: false })
      .limit(1)
      .single()

    const latestScore = recentScans?.[0]?.overall_score ?? 0
    const previousScore = recentScans?.[recentScans.length - 1]?.overall_score ?? latestScore
    const rankChange = latestScore - previousScore

    const topQueryScans = topQuery?.scans as unknown as Array<{ overall_score: number | null }> | undefined
    const topQueryScore = topQueryScans?.[0]?.overall_score ?? 0

    if (!user.email) continue

    const result = await sendWeeklyDigestEmail(user.email, {
      name: user.full_name ?? 'there',
      rankChange,
      newRecommendations: newRecsCount ?? 0,
      contentUpdates: contentCount ?? 0,
      topQuery: topQuery?.query_text ?? '',
      topQueryScore,
    })

    if (result.success) {
      sent++
    } else {
      failed++
      console.error(`[CRON:weekly-digest] Failed for ${user.email}:`, result.error)
    }
  }

  return NextResponse.json({
    sent,
    failed,
    total: eligibleUsers.length,
  })
}
