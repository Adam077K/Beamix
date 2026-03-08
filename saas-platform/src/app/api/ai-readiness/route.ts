import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's primary business
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!business) {
    return NextResponse.json(null)
  }

  const { data, error } = await supabase
    .from('ai_readiness_history')
    .select('*')
    .eq('business_id', business.id)
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json(null)
    }
    return NextResponse.json(
      { error: 'Failed to fetch AI readiness', details: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json(data)
}

export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: business, error: bizError } = await supabase
    .from('businesses')
    .select('id, website_url')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (bizError || !business) {
    return NextResponse.json({ error: 'No business found. Complete onboarding first.' }, { status: 404 })
  }

  // TODO: Replace with real AI readiness audit logic
  const { data: entry, error: insertError } = await supabase
    .from('ai_readiness_history')
    .insert({
      business_id: business.id,
      score: 0,
      score_breakdown: {
        crawlability: { score: 0, description: 'Audit in progress...' },
        schema_markup: { score: 0, description: 'Audit in progress...' },
        content_quality: { score: 0, description: 'Audit in progress...' },
        faq_coverage: { score: 0, description: 'Audit in progress...' },
        llms_txt: { score: 0, description: 'Audit in progress...' },
      },
    })
    .select('id')
    .single()

  if (insertError) {
    return NextResponse.json(
      { error: 'Failed to start audit', details: insertError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ id: entry?.id, status: 'started' }, { status: 201 })
}
