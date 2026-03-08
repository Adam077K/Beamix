import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
      // Get user's subscription to determine scan frequency
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('plan_id')
        .eq('user_id', business.user_id)
        .single()

      // Get plan details for scan frequency
      let scanFrequencyDays = 7 // default
      if (sub?.plan_id) {
        const { data: plan } = await supabase
          .from('plans')
          .select('scan_frequency_days')
          .eq('id', sub.plan_id)
          .single()
        if (plan) scanFrequencyDays = plan.scan_frequency_days
      }

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

      // TODO: Send Inngest event `scan/manual.started` to trigger actual scan
      // await inngest.send({ name: 'scan/manual.started', data: { scanId: scan.id, businessId: business.id } })

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
