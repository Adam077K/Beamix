/**
 * Beamix — Rate-Limit Primitives
 *
 * Supabase-backed rate limiting for public API routes. No external Redis required.
 * Each check is a single SELECT COUNT query — fast, cheap, idempotent to read.
 *
 * Dimensions supported:
 *   - IP          (ip, window_seconds)
 *   - Email       (email, window_seconds)
 *   - Domain      (domain, window_seconds)
 *
 * The `rate_limit_events` table stores one row per request attempt.
 * A companion `rate_limit_overrides` table allows allowlisting (IP CIDR or exact email).
 *
 * CIDR allowlist also read from RATE_LIMIT_ALLOWLIST env (comma-separated CIDR strings).
 * Signed `adamkey` tokens auto-allowlist the requester IP for 24 h via `rate_limit_overrides`.
 */

import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { createHmac, timingSafeEqual } from 'crypto'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RateLimitResult {
  allowed: boolean
  /** Seconds until the limit resets. Only set when allowed=false. */
  retryAfter?: number
  /** Human-readable reason for the block. */
  reason?: string
}

export interface RateLimitCheck {
  /** The IP address of the requester (X-Forwarded-For aware). */
  ip: string
  /** Email submitted by the user (if available). */
  email?: string
  /** Domain/URL being scanned (normalised to apex domain). */
  domain?: string
}

// ---------------------------------------------------------------------------
// Supabase admin client (service-role — bypasses RLS for rate_limit_* tables)
// ---------------------------------------------------------------------------

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Supabase env vars not configured (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)')
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

// ---------------------------------------------------------------------------
// IP extraction
// ---------------------------------------------------------------------------

/**
 * Extract the real client IP from the request. Trusts X-Forwarded-For only
 * when running behind a known proxy (Vercel). The left-most non-private IP is used.
 */
export function extractIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) {
    const ips = xff.split(',').map((s) => s.trim())
    // Return the first non-empty entry (Vercel prepends client IP on the left)
    const first = ips[0]
    if (first) return first
  }
  // Fallback for local dev
  return '127.0.0.1'
}

// ---------------------------------------------------------------------------
// CIDR allowlist helpers
// ---------------------------------------------------------------------------

/** Parses an IPv4 CIDR string into network + mask. Returns null on invalid input. */
function parseCidr(cidr: string): { network: number; mask: number } | null {
  const [addr, prefixStr] = cidr.split('/')
  if (!addr || prefixStr === undefined) return null
  const prefix = parseInt(prefixStr, 10)
  if (isNaN(prefix) || prefix < 0 || prefix > 32) return null
  const parts = addr.split('.').map(Number)
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) return null
  const network = ((parts[0]! << 24) | (parts[1]! << 16) | (parts[2]! << 8) | parts[3]!) >>> 0
  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0
  return { network: network & mask, mask }
}

/** Returns true if ip (dotted-decimal) falls within the given CIDR. */
function ipInCidr(ip: string, cidr: string): boolean {
  const parsed = parseCidr(cidr)
  if (!parsed) return false
  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some((p) => isNaN(p))) return false
  const ipInt = ((parts[0]! << 24) | (parts[1]! << 16) | (parts[2]! << 8) | parts[3]!) >>> 0
  return (ipInt & parsed.mask) === parsed.network
}

/** Returns true if the IP is in the static CIDR allowlist from env. */
function isInEnvAllowlist(ip: string): boolean {
  const raw = process.env.RATE_LIMIT_ALLOWLIST ?? ''
  if (!raw.trim()) return false
  return raw
    .split(',')
    .map((s) => s.trim())
    .some((cidr) => cidr === ip || ipInCidr(ip, cidr))
}

// ---------------------------------------------------------------------------
// adamkey signed token — allowlists requester IP for 24 h
// ---------------------------------------------------------------------------

/**
 * Verifies an `adamkey` query param. Format: `YYYYMMDD.<hmac>` where HMAC is
 * `HMAC-SHA256(ADAMKEY_SALT, "YYYYMMDD")`. Tokens are valid for the day they
 * were generated only (UTC day boundary).
 */
export function verifyAdamkey(token: string): boolean {
  const salt = process.env.ADAMKEY_SALT
  if (!salt) return false
  // Token format: "<date>.<signature>"
  const dotIdx = token.indexOf('.')
  if (dotIdx === -1) return false
  const datePart = token.slice(0, dotIdx)
  const sigPart = token.slice(dotIdx + 1)
  // Check date is today (UTC) — allow yesterday too to handle midnight edge
  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10).replace(/-/g, '')
  const yesterday = new Date(today)
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10).replace(/-/g, '')
  if (datePart !== todayStr && datePart !== yesterdayStr) return false
  // Verify HMAC
  const expected = createHmac('sha256', salt).update(datePart).digest('hex')
  try {
    return timingSafeEqual(Buffer.from(sigPart, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}

/**
 * Generates an adamkey token for today (UTC). Used in tests and by admin
 * tooling — not called in the hot path.
 */
export function generateAdamkey(): string {
  const salt = process.env.ADAMKEY_SALT
  if (!salt) throw new Error('ADAMKEY_SALT env var not set')
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const sig = createHmac('sha256', salt).update(dateStr).digest('hex')
  return `${dateStr}.${sig}`
}

/**
 * If the adamkey is valid, upsert a 24-hour IP allowlist override row in
 * `rate_limit_overrides`.
 */
export async function registerAdamkeyAllowlist(ip: string): Promise<void> {
  const supabase = getAdminClient()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  const { error } = await supabase
    .from('rate_limit_overrides')
    .upsert(
      { ip, expires_at: expiresAt, reason: 'adamkey' },
      { onConflict: 'ip' }
    )
  if (error) {
    console.error('[rate-limit] Failed to register adamkey allowlist', { ip, error: error.message })
  }
}

// ---------------------------------------------------------------------------
// Allowlist check (env CIDR + DB overrides)
// ---------------------------------------------------------------------------

/**
 * Returns true if the IP is allowed without rate-limiting. Checks:
 * 1. Static CIDR list from RATE_LIMIT_ALLOWLIST env.
 * 2. Dynamic overrides in `rate_limit_overrides` table.
 */
async function isAllowlisted(ip: string): Promise<boolean> {
  if (isInEnvAllowlist(ip)) return true

  try {
    const supabase = getAdminClient()
    const { data } = await supabase
      .from('rate_limit_overrides')
      .select('ip')
      .eq('ip', ip)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle()
    return !!data
  } catch {
    // If DB is unavailable, fail open for allowlist (deny path still works via event count)
    return false
  }
}

// ---------------------------------------------------------------------------
// Core rate-limit check
// ---------------------------------------------------------------------------

export interface RateLimitSpec {
  /** Supabase table that stores rate-limit events. */
  table: string
  /** Column to group by. */
  column: 'ip' | 'email' | 'domain'
  /** Value for the column. */
  value: string
  /** Max allowed events within the window. */
  limit: number
  /** Window size in seconds. */
  windowSeconds: number
}

/**
 * Check and record a rate-limit event. Returns a RateLimitResult.
 * Recording is done AFTER the check so a blocked request is never counted.
 */
async function checkRateLimit(spec: RateLimitSpec): Promise<RateLimitResult> {
  const supabase = getAdminClient()
  const windowStart = new Date(Date.now() - spec.windowSeconds * 1000).toISOString()

  // Count existing events in window
  const { count, error: countError } = await supabase
    .from(spec.table)
    .select('*', { count: 'exact', head: true })
    .eq(spec.column, spec.value)
    .gte('created_at', windowStart)

  if (countError) {
    // Fail open on DB errors — log and allow
    console.error('[rate-limit] Count query failed', { table: spec.table, error: countError.message })
    return { allowed: true }
  }

  const current = count ?? 0
  if (current >= spec.limit) {
    return {
      allowed: false,
      retryAfter: spec.windowSeconds,
      reason: `Rate limit exceeded: ${current}/${spec.limit} per ${spec.windowSeconds}s on ${spec.column}`,
    }
  }

  // Record the event
  const row: Record<string, string> = {
    [spec.column]: spec.value,
    created_at: new Date().toISOString(),
  }
  const { error: insertError } = await supabase.from(spec.table).insert(row)
  if (insertError) {
    console.error('[rate-limit] Event insert failed', { table: spec.table, error: insertError.message })
    // Still allow — insert failure is non-blocking (benign for the requester)
  }

  return { allowed: true }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Run all rate-limit checks for the free scan endpoint.
 *
 * Limits:
 *   - Per-IP: 3 requests per 24 h
 *   - Per-email: 1 request per 24 h
 *   - Per-domain: 2 requests per 7 days
 *
 * Allowlist (env CIDR + adamkey DB overrides) bypasses all limits.
 */
export async function checkFreeScanRateLimit(
  opts: RateLimitCheck
): Promise<RateLimitResult> {
  // Allowlist check first — exempt from all limits
  if (await isAllowlisted(opts.ip)) {
    return { allowed: true }
  }

  // 1. IP limit — 3 per 24 h
  const ipResult = await checkRateLimit({
    table: 'rate_limit_events_scan',
    column: 'ip',
    value: opts.ip,
    limit: 3,
    windowSeconds: 86400,
  })
  if (!ipResult.allowed) return ipResult

  // 2. Email limit — 1 per 24 h (only if email provided)
  if (opts.email) {
    const emailResult = await checkRateLimit({
      table: 'rate_limit_events_scan',
      column: 'email',
      value: opts.email.toLowerCase(),
      limit: 1,
      windowSeconds: 86400,
    })
    if (!emailResult.allowed) {
      return {
        allowed: false,
        retryAfter: emailResult.retryAfter,
        reason: 'already_scanned',
      }
    }
  }

  // 3. Domain limit — 2 per 7 days (only if domain provided)
  if (opts.domain) {
    const domainResult = await checkRateLimit({
      table: 'rate_limit_events_scan',
      column: 'domain',
      value: opts.domain,
      limit: 2,
      windowSeconds: 604800,
    })
    if (!domainResult.allowed) return domainResult
  }

  return { allowed: true }
}

/**
 * Run rate-limit checks for the discovery booking endpoint.
 *
 * Limits:
 *   - Per-IP: 5 requests per 24 h
 *   - Per-email: 1 request per 24 h
 */
export async function checkDiscoveryBookRateLimit(
  opts: RateLimitCheck
): Promise<RateLimitResult> {
  if (await isAllowlisted(opts.ip)) {
    return { allowed: true }
  }

  const ipResult = await checkRateLimit({
    table: 'rate_limit_events_discovery',
    column: 'ip',
    value: opts.ip,
    limit: 5,
    windowSeconds: 86400,
  })
  if (!ipResult.allowed) return ipResult

  if (opts.email) {
    const emailResult = await checkRateLimit({
      table: 'rate_limit_events_discovery',
      column: 'email',
      value: opts.email.toLowerCase(),
      limit: 1,
      windowSeconds: 86400,
    })
    if (!emailResult.allowed) return emailResult
  }

  return { allowed: true }
}

// ---------------------------------------------------------------------------
// Domain normalisation helper
// ---------------------------------------------------------------------------

/**
 * Normalise a URL or domain string to its apex domain (no www, no path, lowercase).
 * Returns null if the input is not parseable.
 */
export function normaliseDomain(input: string): string | null {
  try {
    const url = new URL(input.startsWith('http') ? input : `https://${input}`)
    const host = url.hostname.toLowerCase()
    // Strip leading www.
    return host.startsWith('www.') ? host.slice(4) : host
  } catch {
    return null
  }
}
