import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const createAlertRuleSchema = z.object({
  business_id: z.string().uuid(),
  alert_type: z.enum([
    'visibility_drop', 'visibility_improvement', 'new_competitor',
    'competitor_overtake', 'sentiment_shift', 'credit_low',
    'content_performance', 'scan_complete', 'agent_complete', 'trial_ending'
  ]),
  threshold: z.record(z.string(), z.unknown()),
  channels: z.array(z.string()).min(1).default(['inapp']),
  cooldown_hours: z.number().int().positive().optional().default(24),
})

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('alert_rules')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch alert rules', details: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
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

  const parsed = createAlertRuleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  // Verify the business belongs to the user
  const { data: business, error: bizError } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', parsed.data.business_id)
    .eq('user_id', user.id)
    .single()

  if (bizError || !business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insertData: any = {
    user_id: user.id,
    business_id: parsed.data.business_id,
    alert_type: parsed.data.alert_type,
    threshold: parsed.data.threshold,
    channels: parsed.data.channels,
    cooldown_hours: parsed.data.cooldown_hours,
  }
  const { data: rule, error: insertError } = await supabase
    .from('alert_rules')
    .insert(insertData)
    .select('*')
    .single()

  if (insertError) {
    return NextResponse.json(
      { error: 'Failed to create alert rule', details: insertError.message },
      { status: 500 }
    )
  }

  return NextResponse.json(rule, { status: 201 })
}
