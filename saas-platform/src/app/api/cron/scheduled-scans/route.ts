import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { inngest } from '@/inngest/client'

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Find businesses due for a scan based on their plan's scan_frequency_days
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select(`
        id,
        user_id,
        name,
        website_url,
        industry,
        next_scan_at
      `)
      .lte('next_scan_at', new Date().toISOString())
      .not('next_scan_at', 'is', null)

    if (error) throw error

    const results = []
    for (const business of businesses || []) {
      // Get user's subscription to determine scan frequency based on plan_tier
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('plan_tier')
        .eq('user_id', business.user_id)
        .single()

      // Determine scan frequency from plan tier (no plans table lookup needed)
      const SCAN_FREQUENCY_BY_TIER: Record<string, number> = {
        starter: 7,   // weekly
        pro: 1,       // daily
        business: 1,  // daily (unlimited)
      }
      const scanFrequencyDays = SCAN_FREQUENCY_BY_TIER[sub?.plan_tier ?? ''] ?? 7

      // Create a new scan record
      const { data: scan, error: scanError } = await supabase
        .from('scans')
        .insert({
          business_id: business.id,
          user_id: business.user_id,
          scan_type: 'scheduled',
          status: 'pending',
        })
        .select('id')
        .single()

      if (scanError) {
        results.push({ business_id: business.id, error: scanError.message })
        continue
      }

      // Update next_scan_at
      await supabase
        .from('businesses')
        .update({
          next_scan_at: new Date(
            Date.now() + scanFrequencyDays * 24 * 60 * 60 * 1000
          ).toISOString(),
        })
        .eq('id', business.id)

      // Fire Inngest event to trigger the actual scan pipeline
      await inngest.send({
        name: 'scan/manual.started',
        data: {
          scanId: scan.id,
          userId: business.user_id,
          businessId: business.id,
        },
      })

      results.push({ business_id: business.id, scan_id: scan.id, status: 'queued' })
    }

    return NextResponse.json({
      processed: results.length,
      results,
    })
  } catch (error) {
    console.error('Scheduled scans cron error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
