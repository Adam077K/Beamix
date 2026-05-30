/**
 * Approval Signed-Token Helper
 *
 * HMAC-SHA256 tokens for email-linked 1-click approval links.
 * Tokens encode { approvalId, expiresAt } and are signed with APPROVAL_SIGNING_SECRET.
 *
 * Security design:
 *   - timingSafeEqual used for comparison — prevents timing-oracle attacks.
 *   - expiry is embedded in the payload (not just the approval_queue.expires_at)
 *     so the token self-expires even if the DB row is somehow mutated.
 *   - APPROVAL_SIGNING_SECRET must be >= 32 bytes. Validated at module load in production.
 */

import 'server-only'
import { createHmac, timingSafeEqual } from 'crypto'
import { z } from 'zod'

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

function requireSigningSecret(): string {
  const secret = process.env.APPROVAL_SIGNING_SECRET
  if (!secret || secret.trim().length < 32) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        '[approvals/signed-token] APPROVAL_SIGNING_SECRET must be at least 32 characters'
      )
    }
    // Dev fallback — never reaches production due to guard above
    return 'dev-signing-secret-do-not-use-in-production-pad'
  }
  return secret.trim()
}

// ---------------------------------------------------------------------------
// Payload schema
// ---------------------------------------------------------------------------

const TokenPayloadSchema = z.object({
  approvalId: z.string().uuid(),
  expiresAt: z.string().datetime(),
})

export type TokenPayload = z.infer<typeof TokenPayloadSchema>

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function computeHmac(data: string): string {
  const secret = requireSigningSecret()
  return createHmac('sha256', secret).update(data).digest('hex')
}

// ---------------------------------------------------------------------------
// signApprovalToken
// ---------------------------------------------------------------------------

/**
 * Signs an approval token embedding `approvalId` and `expiresAt`.
 * Returns a URL-safe base64 string: `<base64(payload)>.<hmac_hex>`
 */
export function signApprovalToken(payload: TokenPayload): string {
  const parsed = TokenPayloadSchema.safeParse(payload)
  if (!parsed.success) {
    throw new Error(
      `[approvals/signed-token] Invalid payload: ${parsed.error.errors.map((e) => e.message).join(', ')}`
    )
  }

  const { approvalId, expiresAt } = parsed.data
  const payloadJson = JSON.stringify({ approvalId, expiresAt })
  const payloadB64 = Buffer.from(payloadJson).toString('base64url')
  const signature = computeHmac(payloadB64)

  return `${payloadB64}.${signature}`
}

// ---------------------------------------------------------------------------
// verifyApprovalToken
// ---------------------------------------------------------------------------

/**
 * Verifies a signed approval token.
 * Returns the decoded payload, or null if:
 *   - the token is malformed
 *   - the HMAC signature is invalid (constant-time comparison)
 *   - the token has expired
 */
export function verifyApprovalToken(token: string): TokenPayload | null {
  const parts = token.split('.')
  if (parts.length !== 2) {
    return null
  }

  const [payloadB64, receivedSig] = parts as [string, string]

  // Constant-time comparison — prevents timing oracle
  const expectedSig = computeHmac(payloadB64)
  let signaturesMatch = false
  try {
    signaturesMatch = timingSafeEqual(
      Buffer.from(receivedSig, 'hex'),
      Buffer.from(expectedSig, 'hex')
    )
  } catch {
    // timingSafeEqual throws if buffers differ in length (i.e. hex decode mismatch)
    return null
  }

  if (!signaturesMatch) {
    return null
  }

  // Decode and validate payload
  let payloadJson: string
  try {
    payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf8')
  } catch {
    return null
  }

  let raw: unknown
  try {
    raw = JSON.parse(payloadJson)
  } catch {
    return null
  }

  const parsed = TokenPayloadSchema.safeParse(raw)
  if (!parsed.success) {
    return null
  }

  // Check expiry
  if (new Date(parsed.data.expiresAt) < new Date()) {
    return null
  }

  return parsed.data
}
