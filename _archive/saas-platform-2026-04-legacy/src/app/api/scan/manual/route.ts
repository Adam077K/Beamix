import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { inngest } from '@/inngest/client'

const manualScanSchema = z.object({
  businessId: z.string().uuid(),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = manualScanSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid business ID' }, { status: 400 })
  }

  const { businessId } = parsed.data

  // Verify ownership
  const { data: business } = await supabase
    .from('businesses')
    .select('id, user_id')
    .eq('id', businessId)
    .eq('user_id', user.id)
    .single()

  if (!business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  // Enforce plan-tier scan rate limits: Starter=1/week, Pro=1/day, Business=unlimited
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan_tier')
    .eq('user_id', user.id)
    .single()

  const tier = sub?.plan_tier ?? null
  const scanLimits: Record<string, { windowMs: number; max: number }> = {
    starter:  { windowMs: 7 * 24 * 60 * 60 * 1000, max: 1 },  // 1/week
    pro:      { windowMs: 24 * 60 * 60 * 1000,      max: 1 },  // 1/day
    business: { windowMs: 0,                         max: Infinity },
  }
  const limit = scanLimits[tier ?? 'starter'] ?? scanLimits.starter

  if (limit.max !== Infinity) {
    const since = new Date(Date.now() - limit.windowMs).toISOString()
    const { count } = await supabase
      .from('scans')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('scanned_at', since)
      .neq('status', 'failed')
    if ((count ?? 0) >= limit.max) {
      return NextResponse.json(
        { error: 'Scan limit reached for your plan. Upgrade for more scans.' },
        { status: 429 }
      )
    }
  }

  // Create scan record
  const { data: scan, error: scanError } = await supabase
    .from('scans')
    .insert({
      user_id: user.id,
      business_id: businessId,
      scan_type: 'manual',
      status: 'pending',
      engines_scanned: [],
    })
    .select('id')
    .single()

  if (scanError || !scan) {
    console.error('[scan/manual] Failed to create scan:', scanError?.message)
    return NextResponse.json({ error: 'Failed to create scan' }, { status: 500 })
  }

  // Fire Inngest event for background processing
  await inngest.send({
    name: 'scan/manual.started',
    data: {
      scanId: scan.id,
      businessId,
      userId: user.id,
    },
  })

  return NextResponse.json(
    { scan_id: scan.id, status: 'pending' },
    { status: 202 },
  )
}
