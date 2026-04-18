import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error('[CRON:content-refresh-check] CRON_SECRET not configured')
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
    // Find published content items that haven't been checked in 30+ days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const { data: staleContent, error } = await supabase
      .from('content_items')
      .select('id, business_id, user_id, title, content_type, updated_at')
      .eq('status', 'published')
      .lt('updated_at', thirtyDaysAgo)
      .limit(50)

    if (error) throw error

    // Create recommendations for stale content
    const recommendations = (staleContent || []).map((item) => ({
      business_id: item.business_id,
      user_id: item.user_id,
      title: `Refresh: ${item.title}`,
      description: `This ${item.content_type} hasn't been updated in over 30 days. Refreshing it may improve your AI search visibility.`,
      recommendation_type: 'content',
      impact: 'medium',
      effort: 'low',
      suggested_agent: 'content_refresh',
      status: 'new',
      evidence: `Last updated: ${item.updated_at}`,
    }))

    if (recommendations.length > 0) {
      const { error: insertError } = await supabase
        .from('recommendations')
        .insert(recommendations)

      if (insertError) throw insertError
    }

    return NextResponse.json({
      success: true,
      stale_content_found: staleContent?.length || 0,
      recommendations_created: recommendations.length,
    })
  } catch (error) {
    console.error('Content refresh check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
