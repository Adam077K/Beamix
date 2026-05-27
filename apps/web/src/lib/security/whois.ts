/**
 * WHOIS age-check helper.
 *
 * Shared across free scan and signup domain verification.
 * Uses whoisxmlapi.com to fetch the domain creation date and determine
 * whether the domain is newer than 30 days.
 *
 * Fail-open on any provider error — never block on WHOIS API unavailability.
 */

import 'server-only'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WhoisResult {
  /** Whether the domain was registered less than `minAgeDays` days ago. */
  tooNew: boolean
  /** Age of the domain in days, if determinable. */
  ageDays?: number
  /** Whether the result was determined from live WHOIS data (vs. a fallback). */
  fromLiveData: boolean
}

// ---------------------------------------------------------------------------
// Core check
// ---------------------------------------------------------------------------

/**
 * Returns `true` if the domain appears to be < `minAgeDays` days old.
 *
 * On any WHOIS API error or timeout, logs a warning and returns
 * `{ tooNew: false, fromLiveData: false }` (fail-open).
 */
export async function checkDomainAge(
  domain: string,
  minAgeDays = 30
): Promise<WhoisResult> {
  const apiKey = process.env.WHOIS_API_KEY ?? ''

  // Without a key we cannot make a meaningful check — fail open.
  if (!apiKey) {
    console.warn('[whois] WHOIS_API_KEY not set — skipping age check (fail-open)', { domain })
    return { tooNew: false, fromLiveData: false }
  }

  let controller: AbortController | undefined
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  try {
    controller = new AbortController()
    timeoutId = setTimeout(() => controller!.abort(), 5_000)

    const url =
      `https://www.whoisxmlapi.com/whoisserver/WhoisService` +
      `?apiKey=${encodeURIComponent(apiKey)}` +
      `&domainName=${encodeURIComponent(domain)}` +
      `&outputFormat=JSON`

    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)
    timeoutId = undefined

    if (!res.ok) {
      console.warn('[whois] Non-OK response from WHOIS API — fail-open', {
        domain,
        status: res.status,
      })
      return { tooNew: false, fromLiveData: false }
    }

    const data = (await res.json()) as {
      WhoisRecord?: {
        createdDate?: string
        registryData?: { createdDate?: string }
      }
    }

    const createdStr =
      data.WhoisRecord?.createdDate ??
      data.WhoisRecord?.registryData?.createdDate

    if (!createdStr) {
      // No creation date in response — could be a private/gated TLD; fail open.
      console.warn('[whois] No createdDate in WHOIS response — fail-open', { domain })
      return { tooNew: false, fromLiveData: false }
    }

    const created = new Date(createdStr)
    if (isNaN(created.getTime())) {
      console.warn('[whois] Unparseable createdDate — fail-open', { domain, createdStr })
      return { tooNew: false, fromLiveData: false }
    }

    const ageMs = Date.now() - created.getTime()
    const ageDays = ageMs / (1_000 * 60 * 60 * 24)

    return { tooNew: ageDays < minAgeDays, ageDays, fromLiveData: true }
  } catch (err) {
    // AbortError from timeout, or any network failure.
    if (timeoutId !== undefined) clearTimeout(timeoutId)
    console.warn('[whois] WHOIS API call failed — fail-open', {
      domain,
      error: String(err),
    })
    return { tooNew: false, fromLiveData: false }
  }
}

// ---------------------------------------------------------------------------
// Legacy adapter — preserves the existing call-site in scan/free/route.ts
// ---------------------------------------------------------------------------

/**
 * @deprecated Prefer `checkDomainAge(domain)` directly.
 * Retained as a thin wrapper so existing callers in scan/free/route.ts do not
 * need to change until the route is refactored.
 */
export async function isDomainTooNew(domain: string): Promise<boolean> {
  const result = await checkDomainAge(domain)
  return result.tooNew
}
