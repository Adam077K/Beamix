import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error('[CRON:cleanup] CRON_SECRET not configured')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const results: Record<string, number> = {}

    // 1. Delete free scans older than 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { count: expiredScans } = await supabase
      .from('free_scans')
      .delete({ count: 'exact' })
      .lt('created_at', thirtyDaysAgo)
      .is('converted_user_id', null) // Only delete unconverted scans
    results.expired_free_scans = expiredScans || 0

    // 2. Delete read notifications older than 90 days
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
    const { count: oldNotifications } = await supabase
      .from('notifications')
      .delete({ count: 'exact' })
      .eq('is_read', true)
      .lt('created_at', ninetyDaysAgo)
    results.old_notifications = oldNotifications || 0

    // 3. Clean up failed agent jobs older than 7 days (clear large output_data)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { count: failedJobs } = await supabase
      .from('agent_jobs')
      .update({ output_data: null })
      .eq('status', 'failed')
      .lt('created_at', sevenDaysAgo)
    results.cleaned_failed_jobs = failedJobs || 0

    // 4. Expire credit pools past their period_end
    const now = new Date().toISOString()
    const { count: expiredPools } = await supabase
      .from('credit_pools')
      .delete({ count: 'exact' })
      .lt('period_end', now)
      .eq('held_amount', 0)
    results.expired_credit_pools = expiredPools || 0

    return NextResponse.json({
      success: true,
      cleaned: results,
    })
  } catch (error) {
    console.error('Cleanup cron error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
