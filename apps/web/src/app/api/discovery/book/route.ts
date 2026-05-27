/**
 * POST /api/discovery/book
 *
 * Captures email + scan_id intent for a discovery call booking.
 * This endpoint is called BEFORE the user is redirected to Cal.com, so we can
 * associate the booking intent with the free scan and apply rate limiting.
 *
 * Rate limits (per INFRA-GAP-SCOPING B6):
 *   - Per-IP:    5 requests per 24 h
 *   - Per-email: 1 request per 24 h
 *
 * Returns:
 *   200  { booking_url }  — Cal.com redirect URL with pre-filled params
 *   400  validation error
 *   429  rate limited (Retry-After header set)
 *   500  internal error
 */

import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  extractIp,
  checkDiscoveryBookRateLimit,
  verifyAdamkey,
  registerAdamkeyAllowlist,
} from '@/lib/security/rate-limit'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Input schema
// ---------------------------------------------------------------------------

const DiscoveryBookBodySchema = z.object({
  /** Attendee email — pre-filled in Cal.com embed + used for rate limiting */
  email: z.string().email().max(254),
  /**
   * Optional — ID of the free scan that drove the booking.
   * Passed through to Cal.com notes field so the webhook can correlate.
   */
  scan_id: z.string().uuid().optional(),
})

export type DiscoveryBookBody = z.infer<typeof DiscoveryBookBodySchema>

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = extractIp(req)

  // adamkey allowlist — check before rate limits
  const adamkey = req.nextUrl.searchParams.get('adamkey')
  if (adamkey && verifyAdamkey(adamkey)) {
    await registerAdamkeyAllowlist(ip)
  }

  // Parse + validate body
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = DiscoveryBookBodySchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { email, scan_id } = parsed.data

  // Rate limiting
  const rateLimitResult = await checkDiscoveryBookRateLimit({ ip, email })
  if (!rateLimitResult.allowed) {
    const headers: Record<string, string> = {}
    if (rateLimitResult.retryAfter) {
      headers['Retry-After'] = String(rateLimitResult.retryAfter)
    }
    return NextResponse.json(
      { error: 'You have already requested a discovery call. Please check your calendar invite.' },
      { status: 429, headers }
    )
  }

  // Build the Cal.com booking URL with pre-filled fields
  const calcomLink = process.env.NEXT_PUBLIC_CALCOM_DISCOVERY_LINK
  if (!calcomLink) {
    console.error('[discovery/book] NEXT_PUBLIC_CALCOM_DISCOVERY_LINK not configured')
    return NextResponse.json(
      { error: 'Booking is temporarily unavailable. Please try again shortly.' },
      { status: 500 }
    )
  }

  const bookingUrl = buildBookingUrl(calcomLink, { email, scanId: scan_id })

  return NextResponse.json({ booking_url: bookingUrl }, { status: 200 })
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildBookingUrl(
  calcomLink: string,
  opts: { email: string; scanId?: string }
): string {
  const base = calcomLink.startsWith('http')
    ? calcomLink
    : `https://cal.com/${calcomLink}`

  const url = new URL(base)
  url.searchParams.set('email', opts.email)
  if (opts.scanId) {
    url.searchParams.set('notes', `scan_id:${opts.scanId}`)
  }
  return url.toString()
}
