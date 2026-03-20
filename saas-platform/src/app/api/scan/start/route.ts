import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
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

    const { url, business_name, sector, location, email } = parsed.data

    const supabase = await createServiceClient()

    // SEC-1: IP-based rate limiting — max 3 scans per IP per hour
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

    const scanIdToken = nanoid(12)

    const { data: insertedScan, error: insertError } = await supabase
      .from('free_scans')
      .insert({
        website_url: url,
        business_name,
        industry: sector,
        location,
        ip_address: ip,
        status: 'pending',
        scan_id: scanIdToken,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        ...(email ? { email } : {}),
      })
      .select('id, scan_id')
      .single()

    if (insertError || !insertedScan) {
      console.error('Failed to insert free_scan:', insertError)
      return NextResponse.json(
        { error: 'Failed to start scan' },
        { status: 500 }
      )
    }

    const scanId = insertedScan.id

    // Try Inngest first
    const useInngest = !!(process.env.INNGEST_EVENT_KEY || process.env.INNGEST_SIGNING_KEY)

    if (useInngest) {
      try {
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
        return NextResponse.json(
          { scan_id: scanId, status: 'processing' },
          { status: 202 }
        )
      } catch (inngestError) {
        console.warn('[scan/start] Inngest send failed:', inngestError)
      }
    }

    // No Inngest — fire-and-forget to the process endpoint
    // This triggers a separate serverless invocation that processes the scan
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

    fetch(`${appUrl}/api/scan/${scanId}/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_name,
        url,
        sector,
        location,
        secret: process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 16),
      }),
    }).catch((err) => {
      console.error('[scan/start] Failed to trigger process endpoint:', err)
    })

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
