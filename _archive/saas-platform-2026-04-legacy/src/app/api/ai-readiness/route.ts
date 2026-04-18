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

  return NextResponse.json(
    { status: 'coming_soon', message: 'AI Readiness Audit is coming soon.' },
    { status: 200 }
  )
}
