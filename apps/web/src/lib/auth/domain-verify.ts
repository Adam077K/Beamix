/**
 * Business Domain Verification
 *
 * Combines WHOIS age check + LinkedIn business-domain match into a single
 * `verifyBusinessDomain` call that can be used at signup time.
 *
 * Signal policy:
 *   - WHOIS too-new  → hard reject (ok: false)
 *   - LinkedIn stub  → soft signal only (does not block today; logged for analytics)
 *
 * All results are written to `audit_log` for security analytics and compliance.
 *
 * Error surface:
 *   - Invalid input → throws `DomainVerifyError` with reason 'invalid_input'
 *   - WHOIS rejection → ok: false, reason: 'domain_too_new'
 *   - Provider errors → fail-open, ok: true with degraded signals
 */

import 'server-only'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { normaliseDomain } from '@/lib/security/rate-limit'
import { checkDomainAge, type WhoisResult } from '@/lib/security/whois'
import { verifyLinkedInDomain, type LinkedInVerifyResult } from '@/lib/auth/linkedin-stub'

// ---------------------------------------------------------------------------
// Input schema
// ---------------------------------------------------------------------------

export const VerifyBusinessDomainInputSchema = z.object({
  /** Email address of the signing-up user. Used to derive domain if `domain` not provided. */
  email: z.string().email().max(254),
  /**
   * Explicit business domain to check (e.g. "acme.com").
   * If omitted, derived from the email address.
   */
  domain: z.string().min(1).max(253).optional(),
})

export type VerifyBusinessDomainInput = z.infer<typeof VerifyBusinessDomainInputSchema>

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export interface DomainVerifySignals {
  whois: WhoisResult
  linkedin: LinkedInVerifyResult
}

export interface DomainVerifyResult {
  /** Whether the domain passed all hard checks (WHOIS age). */
  ok: boolean
  /**
   * Machine-readable reason for rejection.
   * Only set when ok === false.
   */
  reason?: 'domain_too_new' | 'invalid_input' | 'cannot_derive_domain'
  /** Human-readable message suitable for returning to the user. */
  message?: string
  /** Raw signals from each sub-check. Always present for logging. */
  signals: DomainVerifySignals
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class DomainVerifyError extends Error {
  constructor(
    message: string,
    public readonly reason: NonNullable<DomainVerifyResult['reason']>
  ) {
    super(message)
    this.name = 'DomainVerifyError'
  }
}

// ---------------------------------------------------------------------------
// Supabase admin client
// ---------------------------------------------------------------------------

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      'Supabase env vars not configured (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)'
    )
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

// ---------------------------------------------------------------------------
// Audit log helper
// ---------------------------------------------------------------------------

async function logVerification(params: {
  email: string
  domain: string
  result: DomainVerifyResult
}): Promise<void> {
  try {
    const supabase = getAdminClient()
    await supabase.from('audit_log').insert({
      actor_type: 'anonymous',
      event_type: 'domain_verification',
      payload: {
        email: params.email,
        domain: params.domain,
        ok: params.result.ok,
        reason: params.result.reason ?? null,
        signals: {
          whois_too_new: params.result.signals.whois.tooNew,
          whois_age_days: params.result.signals.whois.ageDays ?? null,
          whois_from_live_data: params.result.signals.whois.fromLiveData,
          linkedin_verified: params.result.signals.linkedin.verified,
          linkedin_confidence: params.result.signals.linkedin.confidence,
          linkedin_source: params.result.signals.linkedin.source,
        },
      },
    })
  } catch (err) {
    // Non-fatal — audit log failure must never block signups.
    console.error('[domain-verify] Failed to write audit_log entry', {
      email: params.email,
      domain: params.domain,
      error: String(err),
    })
  }
}

// ---------------------------------------------------------------------------
// Main function
// ---------------------------------------------------------------------------

/**
 * Verifies that the business domain associated with a new user account is
 * legitimate (not freshly registered) and optionally has a LinkedIn presence.
 *
 * @param input  Validated via Zod at entry; throws `DomainVerifyError` on invalid input.
 * @returns      Resolved `DomainVerifyResult` — never throws on provider errors (fail-open).
 */
export async function verifyBusinessDomain(
  input: VerifyBusinessDomainInput
): Promise<DomainVerifyResult> {
  // Validate input at the boundary.
  const parsed = VerifyBusinessDomainInputSchema.safeParse(input)
  if (!parsed.success) {
    throw new DomainVerifyError(
      `Invalid input: ${parsed.error.flatten().formErrors.join(', ')}`,
      'invalid_input'
    )
  }

  const { email } = parsed.data

  // Derive domain: explicit param takes precedence; fall back to email domain.
  let domain: string
  if (parsed.data.domain) {
    domain = parsed.data.domain.toLowerCase().trim()
  } else {
    const atIndex = email.lastIndexOf('@')
    const emailDomain = atIndex !== -1 ? email.slice(atIndex + 1) : null
    if (!emailDomain) {
      throw new DomainVerifyError(
        'Cannot derive domain from email address',
        'cannot_derive_domain'
      )
    }
    // Normalise through the same pipeline used in the scan funnel.
    const normalised = normaliseDomain(`https://${emailDomain}`)
    if (!normalised) {
      throw new DomainVerifyError(
        `Cannot normalise domain derived from email: ${emailDomain}`,
        'cannot_derive_domain'
      )
    }
    domain = normalised
  }

  // Run both checks in parallel — they are independent.
  const [whoisResult, linkedInResult] = await Promise.all([
    checkDomainAge(domain),
    verifyLinkedInDomain(domain),
  ])

  const signals: DomainVerifySignals = {
    whois: whoisResult,
    linkedin: linkedInResult,
  }

  let result: DomainVerifyResult

  if (whoisResult.tooNew) {
    result = {
      ok: false,
      reason: 'domain_too_new',
      message:
        'We can only verify established business domains. ' +
        'This domain appears to have been registered very recently — please try again in a few weeks.',
      signals,
    }
  } else {
    // LinkedIn is a soft signal only; it does not block signups in the stub phase.
    result = { ok: true, signals }
  }

  // Persist to audit_log for security analytics.
  await logVerification({ email, domain, result })

  return result
}
