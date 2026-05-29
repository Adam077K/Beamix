/**
 * POST /api/scan/free
 *
 * Public endpoint — initiates a free anonymous scan.
 *
 * Security layers (defense-in-depth):
 *   1. Cloudflare Turnstile token verification
 *   2. Honeypot field — silent 200 with bogus scan_id + audit log entry
 *   3. Rate limits: per-IP 3/24h + per-email 1/24h + per-domain 2/7d
 *   4. CIDR allowlist (RATE_LIMIT_ALLOWLIST env) + adamkey signed-token allowlist
 *   5. WHOIS age check — reject domains registered < 30 days ago (unless allowlisted)
 *
 * Returns:
 *   202  { scan_id }  — scan accepted and queued via Inngest
 *   400  validation errors
 *   429  rate limited (includes Retry-After header)
 *   500  internal error
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import {
  extractIp,
  verifyAdamkey,
  registerAdamkeyAllowlist,
  checkFreeScanRateLimit,
  normaliseDomain,
} from '@/lib/security/rate-limit'
import { isDomainTooNew } from '@/lib/security/whois'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Input schema
// ---------------------------------------------------------------------------

const FreeScanBodySchema = z.object({
  /** Business name */
  business_name: z.string().min(1).max(200),
  /** Business website URL */
  website_url: z.string().url().max(500),
  /** Requester email — used for email-based rate limiting + result delivery */
  email: z.string().email().max(254),
  /** Cloudflare Turnstile challenge response token */
  turnstile_token: z.string().min(1).max(2000),
  /**
   * Honeypot field — must be absent or empty string.
   * Bots that fill it get a silent fake 200.
   */
  website_confirm: z.string().max(0).optional(),
})

export type FreeScanBody = z.infer<typeof FreeScanBodySchema>

// ---------------------------------------------------------------------------
// Turnstile verification
// ---------------------------------------------------------------------------

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    // In development without the key, skip verification
    if (process.env.NODE_ENV !== 'production') return true
    console.error('[scan/free] TURNSTILE_SECRET_KEY not set')
    return false
  }

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token, remoteip: ip }),
    })
    if (!res.ok) return false
    const data = (await res.json()) as { success: boolean }
    return data.success === true
  } catch (err) {
    console.error('[scan/free] Turnstile verification failed', { error: String(err) })
    return false
  }
}

// ---------------------------------------------------------------------------
// Supabase admin client
// ---------------------------------------------------------------------------

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

// ---------------------------------------------------------------------------
// Honeypot audit log
// ---------------------------------------------------------------------------

async function logHoneypotTrigger(ip: string, email: string, domain: string): Promise<void> {
  try {
    const supabase = getAdminClient()
    await supabase.from('audit_log').insert({
      actor_type: 'anonymous',
      event_type: 'honeypot_triggered',
      payload: { ip, email, domain },
    })
  } catch (err) {
    console.error('[scan/free] Honeypot audit log failed', { error: String(err) })
  }
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = extractIp(request)

  // ---------------------------------------------------------------------------
  // adamkey allowlist registration — check BEFORE rate limits
  // ---------------------------------------------------------------------------
  const adamkey = request.nextUrl.searchParams.get('adamkey')
  if (adamkey && verifyAdamkey(adamkey)) {
    await registerAdamkeyAllowlist(ip)
  }

  // ---------------------------------------------------------------------------
  // Body parse + Zod validation
  // ---------------------------------------------------------------------------
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = FreeScanBodySchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { business_name, website_url, email, turnstile_token, website_confirm } = parsed.data

  // ---------------------------------------------------------------------------
  // Honeypot check — return fake 200 silently
  // ---------------------------------------------------------------------------
  if (website_confirm && website_confirm.length > 0) {
    const domain = normaliseDomain(website_url) ?? website_url
    await logHoneypotTrigger(ip, email, domain)
    // Return a plausible-looking fake scan_id to not tip off bots
    return NextResponse.json({ scan_id: crypto.randomUUID() }, { status: 200 })
  }

  // ---------------------------------------------------------------------------
  // Turnstile verification
  // ---------------------------------------------------------------------------
  const turnstileOk = await verifyTurnstile(turnstile_token, ip)
  if (!turnstileOk) {
    return NextResponse.json(
      { error: 'Bot verification failed. Please refresh and try again.' },
      { status: 400 }
    )
  }

  // ---------------------------------------------------------------------------
  // Domain normalisation + WHOIS age check
  // ---------------------------------------------------------------------------
  const domain = normaliseDomain(website_url)
  if (!domain) {
    return NextResponse.json({ error: 'Invalid website URL' }, { status: 400 })
  }

  // WHOIS check — reject if domain is < 30 days old (unless allowlisted by adamkey)
  if (!adamkey || !verifyAdamkey(adamkey)) {
    const tooNew = await isDomainTooNew(domain)
    if (tooNew) {
      return NextResponse.json(
        {
          error: 'We can only scan established domains. This domain appears to be very recently registered.',
        },
        { status: 422 }
      )
    }
  }

  // ---------------------------------------------------------------------------
  // Rate limiting
  // ---------------------------------------------------------------------------
  const rateLimitResult = await checkFreeScanRateLimit({ ip, email, domain })
  if (!rateLimitResult.allowed) {
    const headers: Record<string, string> = {}
    if (rateLimitResult.retryAfter) {
      headers['Retry-After'] = String(rateLimitResult.retryAfter)
    }

    const message =
      rateLimitResult.reason === 'already_scanned'
        ? 'We already scanned this email — check your inbox for your results.'
        : 'You have reached the daily scan limit. Please try again tomorrow.'

    return NextResponse.json({ error: message }, { status: 429, headers })
  }

  // ---------------------------------------------------------------------------
  // Create free_scan record + fire Inngest event
  // ---------------------------------------------------------------------------
  const supabase = getAdminClient()
  const scanId = crypto.randomUUID()

  const { error: insertError } = await supabase.from('free_scans').insert({
    id: scanId,
    business_name,
    website_url,
    email: email.toLowerCase(),
    domain,
    ip,
    status: 'queued',
  })

  if (insertError) {
    console.error('[scan/free] Failed to insert free_scan row', {
      scanId,
      error: insertError.message,
    })
    return NextResponse.json({ error: 'Failed to start scan. Please try again.' }, { status: 500 })
  }

  // Fire Inngest event — the scan worker picks this up
  try {
    const { inngest } = await import('@/inngest/client')
    await inngest.send({
      name: 'scan/free.requested',
      data: { scan_id: scanId, business_name, website_url, email, domain, ip },
    })
  } catch (err) {
    // Inngest send failure is non-fatal — the scan row is persisted, a fallback
    // cron can pick up queued scans. Log prominently for ops.
    console.error('[scan/free] Inngest send failed — scan queued but not triggered', {
      scanId,
      error: String(err),
    })
  }

  return NextResponse.json({ scan_id: scanId }, { status: 202 })
}
