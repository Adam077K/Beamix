import { NextResponse } from 'next/server'
import { scanStartSchema } from '@/lib/scan/validation'
import { createServiceClient } from '@/lib/supabase/server'
import { inngest } from '@/inngest/client'

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

    const supabase = await createServiceClient()

    // SEC-1: IP-based rate limiting — max 3 scans per IP per hour
    // Prefer x-real-ip (set by Vercel from the connecting IP, not spoofable)
    // over x-forwarded-for (can be appended to by upstream proxies/clients).
    const ip =
      request.headers.get('x-real-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
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

    // Insert into free_scans — id is auto-generated, sector maps to industry column
    const { data: insertedScan, error: insertError } = await supabase
      .from('free_scans')
      .insert({
        website_url: url,
        business_name,
        industry: sector,
        location,
        ip_address: ip,
        status: 'pending',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select('id')
      .single()

    if (insertError || !insertedScan) {
      console.error('Failed to insert free_scan:', insertError)
      return NextResponse.json(
        { error: 'Failed to start scan' },
        { status: 500 }
      )
    }

    const scanId = insertedScan.id

    // Fire Inngest event — scan runs async via scan-free function
    await inngest.send({
      name: 'scan/free.started',
      data: {
        scanId,
        businessName: business_name,
        websiteUrl: url,
        industry: sector,
        location: location ?? undefined,
        language: 'en',
      },
    })

    // Return 202 immediately — client polls for results using scan_id
    return NextResponse.json(
      { scan_id: scanId, status: 'processing' },
      { status: 202 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
