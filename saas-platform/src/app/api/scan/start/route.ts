import { NextResponse } from 'next/server'
import { scanStartSchema } from '@/lib/scan/validation'
import { createServiceClient } from '@/lib/supabase/server'
import { runMockScan } from '@/lib/scan/mock-engine'
import type { Json } from '@/lib/types/database.types'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = scanStartSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { url, business_name, sector, location } = parsed.data
    const scanId = crypto.randomUUID()

    const supabase = await createServiceClient()

    // Insert into free_scans as processing
    const { error: insertError } = await supabase
      .from('free_scans')
      .insert({
        scan_token: scanId,
        website_url: url,
        business_name,
        sector,
        location,
        ip_address: request.headers.get('x-forwarded-for') ?? null,
        status: 'processing',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })

    if (insertError) {
      console.error('Failed to insert free_scan:', insertError)
      return NextResponse.json(
        { error: 'Failed to start scan' },
        { status: 500 }
      )
    }

    // Run mock scan asynchronously (don't await — respond immediately)
    // Using an IIFE to run in background without blocking response
    void (async () => {
      try {
        const results = await runMockScan(scanId, business_name, sector)
        const serviceClient = await createServiceClient()
        await serviceClient
          .from('free_scans')
          .update({
            status: 'completed',
            overall_score: results.visibility_score,
            results_data: JSON.parse(JSON.stringify(results)) as Json,
          })
          .eq('scan_token', scanId)
      } catch (err) {
        console.error('Mock scan failed:', err)
        const serviceClient = await createServiceClient()
        await serviceClient
          .from('free_scans')
          .update({ status: 'failed' })
          .eq('scan_token', scanId)
      }
    })()

    return NextResponse.json(
      {
        scan_id: scanId,
        status: 'processing',
        estimated_time_seconds: 5,
      },
      { status: 202 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
