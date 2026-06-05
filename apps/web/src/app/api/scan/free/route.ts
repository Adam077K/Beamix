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
 *   6. Budget guard: kill-switch + daily/hourly scan volume caps (SCAN_FREE_DAILY_BUDGET,
 *      SCAN_FREE_HOURLY_BUDGET). Daily cap breach auto-activates the kill switch.
 *   7. Email plus-stripping: plus addressing (+alias) cannot bypass per-email rate limit.
 *
 * Returns:
 *   202  { scan_id }  — scan accepted and queued via Inngest
 *   400  validation errors
 *   429  rate limited (includes Retry-After header)
 *   500  internal error
 *   503  scanning temporarily paused (kill switch active or budget exceeded)
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
// Budget defaults
// ---------------------------------------------------------------------------

const SCAN_FREE_DAILY_BUDGET = parseInt(
  process.env.SCAN_FREE_DAILY_BUDGET ?? '500',
  10,
)
const SCAN_FREE_HOURLY_BUDGET = parseInt(
  process.env.SCAN_FREE_HOURLY_BUDGET ?? '60',
  10,
)

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
// Email normalisation — strip plus addressing before rate-limit dedup
// ---------------------------------------------------------------------------

/**
 * Normalise an email address for rate-limit dedup and storage.
 * Plus-addressing (user+alias@domain) maps to user@domain so that
 * e.g. attacker+1@gmail.com and attacker+2@gmail.com share a rate-limit bucket.
 */
function normaliseEmail(email: string): string {
  return email.toLowerCase().replace(/\+[^@]*@/, '@')
}

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
// Budget guard
// ---------------------------------------------------------------------------

/**
 * Budget check result.
 * - allowed: true if within budget
 * - reason: 'kill_switch' | 'daily_cap' | 'hourly_cap' — only set if !allowed
 */
interface BudgetCheckResult {
  allowed: boolean
  reason?: 'kill_switch' | 'daily_cap' | 'hourly_cap'
}

/**
 * Check the system kill switch and scan volume budgets.
 * - Reads system_kill_switch (id=1); paused_until in the future → blocked.
 * - Counts free_scans in the last 24h; >= SCAN_FREE_DAILY_BUDGET → auto-activates
 *   the kill switch and returns blocked.
 * - Counts free_scans in the last 1h; >= SCAN_FREE_HOURLY_BUDGET → blocked (no
 *   kill-switch flip for hourly — it's transient).
 */
async function checkBudget(supabase: ReturnType<typeof getAdminClient>): Promise<BudgetCheckResult> {
  // 1. Kill-switch check
  try {
    const { data: ksRow } = await supabase
      .from('system_kill_switch')
      .select('paused_until')
      .eq('id', 1)
      .maybeSingle()

    if (ksRow?.paused_until && new Date(ksRow.paused_until) > new Date()) {
      return { allowed: false, reason: 'kill_switch' }
    }
  } catch (err) {
    // Fail open — don't block scans on a read error
    console.error('[scan/free] Kill-switch read failed', { error: String(err) })
  }

  // 2. Daily budget — count scans in last 24h
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  try {
    const { count: dailyCount, error: dailyErr } = await supabase
      .from('free_scans')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since24h)

    if (!dailyErr && dailyCount !== null && dailyCount >= SCAN_FREE_DAILY_BUDGET) {
      console.error('[scan/free] Daily budget exceeded — activating kill switch', {
        count: dailyCount,
        budget: SCAN_FREE_DAILY_BUDGET,
      })
      // Auto-activate kill switch for 24h
      const pausedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      await supabase
        .from('system_kill_switch')
        .upsert({
          id: 1,
          paused_until: pausedUntil,
          reason: 'daily_free_scan_budget_exceeded',
          updated_at: new Date().toISOString(),
        })
      return { allowed: false, reason: 'daily_cap' }
    }
  } catch (err) {
    console.error('[scan/free] Daily budget check failed', { error: String(err) })
  }

  // 3. Hourly budget — count scans in last 1h
  const since1h = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  try {
    const { count: hourlyCount, error: hourlyErr } = await supabase
      .from('free_scans')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since1h)

    if (!hourlyErr && hourlyCount !== null && hourlyCount >= SCAN_FREE_HOURLY_BUDGET) {
      console.error('[scan/free] Hourly budget exceeded', {
        count: hourlyCount,
        budget: SCAN_FREE_HOURLY_BUDGET,
      })
      return { allowed: false, reason: 'hourly_cap' }
    }
  } catch (err) {
    console.error('[scan/free] Hourly budget check failed', { error: String(err) })
  }

  return { allowed: true }
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

  const { business_name, website_url, turnstile_token, website_confirm } = parsed.data

  // Normalise email — strip plus addressing for rate-limit + storage dedup
  const email = normaliseEmail(parsed.data.email)

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
  // Rate limiting (per-IP + per-email + per-domain)
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
  // Budget guard (kill switch + daily/hourly volume cap)
  // Placed AFTER per-IP/email rate limits to skip DB reads for already-blocked
  // clients. BEFORE the free_scans insert so we never create a row we won't
  // process.
  // ---------------------------------------------------------------------------
  const supabase = getAdminClient()
  const budget = await checkBudget(supabase)
  if (!budget.allowed) {
    console.error('[scan/free] Budget guard blocked scan', {
      reason: budget.reason,
      ip,
      domain,
    })
    return NextResponse.json(
      { error: 'Scanning is temporarily paused. Please try again later.' },
      { status: 503 }
    )
  }

  // ---------------------------------------------------------------------------
  // Create free_scan record + fire Inngest event
  // ---------------------------------------------------------------------------
  const scanId = crypto.randomUUID()

  const { error: insertError } = await supabase.from('free_scans').insert({
    id: scanId,
    business_name,
    website_url,
    // Store normalised email (plus-stripped, lowercased)
    email,
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
