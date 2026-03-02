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

    // SEC-1: IP-based rate limiting — max 3 scans per IP per hour
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await supabase
      .from('free_scans')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .gte('created_at', oneHourAgo)

    if ((count ?? 0) >= 3) {
      return NextResponse.json(
        { error: 'Too many scans. Please try again in an hour.' },
        { status: 429 }
      )
    }

    // Insert into free_scans as processing
    const { error: insertError } = await supabase
      .from('free_scans')
      .insert({
        scan_token: scanId,
        website_url: url,
        business_name,
        sector,
        location,
        ip_address: ip,
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

    // MED-1: Run scan synchronously before responding (mock completes quickly).
    // The void IIFE pattern gets killed on Vercel after the response returns.
    let finalStatus: 'completed' | 'failed' = 'completed'
    try {
      const results = await runMockScan(scanId, business_name, sector)
      const { error: updateError } = await supabase
        .from('free_scans')
        .update({
          status: 'completed',
          overall_score: results.visibility_score,
          results_data: JSON.parse(JSON.stringify(results)) as Json,
        })
        .eq('scan_token', scanId)
      if (updateError) {
        console.error('Failed to update scan results:', updateError)
        finalStatus = 'failed'
      }
    } catch (err) {
      console.error('Mock scan failed:', err)
      finalStatus = 'failed'
      await supabase
        .from('free_scans')
        .update({ status: 'failed' })
        .eq('scan_token', scanId)
    }

    return NextResponse.json(
      {
        scan_id: scanId,
        status: finalStatus,
      },
      { status: finalStatus === 'completed' ? 200 : 500 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
