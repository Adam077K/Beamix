/**
 * LinkedIn Business-Domain Match — STUB implementation.
 *
 * Returns a low-confidence placeholder so the verification pipeline
 * can run end-to-end today. Real LinkedIn API integration is deferred
 * to MVP+90 once we have an approved LinkedIn Developer Application.
 *
 * TODO (MVP+90): Replace this stub with a real LinkedIn API call.
 *   - Endpoint: GET https://api.linkedin.com/v2/organizations?q=vanityName&...
 *   - Auth: OAuth 2.0 with `r_organization_social` scope
 *   - Cross-reference: `organization.websiteUrl` against the submitted domain
 *   - Store result in `domain_verification_cache` table (24 h TTL)
 */

import 'server-only'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LinkedInConfidence = 'high' | 'medium' | 'low'

export interface LinkedInVerifyResult {
  /** Whether a LinkedIn business profile was found for this domain. */
  verified: boolean
  /** Confidence in the match result. */
  confidence: LinkedInConfidence
  /** Source of the result — 'stub' until real impl lands. */
  source: 'linkedin_api' | 'stub'
  /** LinkedIn organisation URL, if resolved. */
  linkedInUrl?: string
}

// ---------------------------------------------------------------------------
// Stub implementation
// ---------------------------------------------------------------------------

/**
 * Checks whether the given business domain matches a LinkedIn company page.
 *
 * STUB — always returns `{ verified: true, confidence: 'low', source: 'stub' }`.
 * The stub is intentionally permissive so it never blocks signups.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function verifyLinkedInDomain(domain: string): Promise<LinkedInVerifyResult> {
  console.warn('[linkedin-stub] LinkedIn verification stub — real impl post-MVP', { domain })

  return {
    verified: true,
    confidence: 'low',
    source: 'stub',
  }
}
