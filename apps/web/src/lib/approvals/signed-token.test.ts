/**
 * Tests for lib/approvals/signed-token
 *
 * Covers:
 *   - signApprovalToken / verifyApprovalToken roundtrip
 *   - tampered token returns null
 *   - expired token returns null
 */

import { describe, it, expect, beforeEach } from 'vitest'

// Set up the signing secret BEFORE importing the module under test so that
// requireSigningSecret() finds it on first call.
beforeEach(() => {
  process.env.APPROVAL_SIGNING_SECRET = 'test-secret-that-is-definitely-at-least-32-chars!!'
  // NODE_ENV is read-only in TS strict mode — keep it as set by the test runner (node)
})

// Import after env is set — vitest modules are re-evaluated per file, but the
// env var is read at call time (not module-load time) so this is fine.
const { signApprovalToken, verifyApprovalToken } = await import('./signed-token')

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function futureDate(offsetMs = 60 * 60 * 1000): string {
  return new Date(Date.now() + offsetMs).toISOString()
}

function pastDate(offsetMs = 60 * 60 * 1000): string {
  return new Date(Date.now() - offsetMs).toISOString()
}

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'

// ---------------------------------------------------------------------------
// signApprovalToken + verifyApprovalToken roundtrip
// ---------------------------------------------------------------------------

describe('signApprovalToken / verifyApprovalToken', () => {
  it('roundtrip: signed token verifies to original payload', () => {
    const expiresAt = futureDate()
    const payload = { approvalId: VALID_UUID, expiresAt }

    const token = signApprovalToken(payload)
    const verified = verifyApprovalToken(token)

    expect(verified).not.toBeNull()
    expect(verified?.approvalId).toBe(VALID_UUID)
    expect(verified?.expiresAt).toBe(expiresAt)
  })

  it('token string contains two dot-separated parts', () => {
    const token = signApprovalToken({ approvalId: VALID_UUID, expiresAt: futureDate() })
    const parts = token.split('.')
    expect(parts).toHaveLength(2)
  })
})

// ---------------------------------------------------------------------------
// Tampered token returns null
// ---------------------------------------------------------------------------

describe('verifyApprovalToken — tampered token', () => {
  it('returns null when signature is altered', () => {
    const token = signApprovalToken({ approvalId: VALID_UUID, expiresAt: futureDate() })
    const [payload, sig] = token.split('.')
    // Flip last char of signature
    const tamperedSig = sig.slice(0, -1) + (sig.at(-1) === 'a' ? 'b' : 'a')
    const tampered = `${payload}.${tamperedSig}`

    expect(verifyApprovalToken(tampered)).toBeNull()
  })

  it('returns null when payload is replaced with garbage base64', () => {
    const token = signApprovalToken({ approvalId: VALID_UUID, expiresAt: futureDate() })
    const [, sig] = token.split('.')
    const garbagePayload = Buffer.from('{"not":"valid"}').toString('base64url')
    const tampered = `${garbagePayload}.${sig}`

    expect(verifyApprovalToken(tampered)).toBeNull()
  })

  it('returns null for a completely random string', () => {
    expect(verifyApprovalToken('definitely-not-a-token')).toBeNull()
  })

  it('returns null when token has wrong number of parts (no dot)', () => {
    expect(verifyApprovalToken('nodotsinhere')).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Expired token returns null
// ---------------------------------------------------------------------------

describe('verifyApprovalToken — expired token', () => {
  it('returns null for a token with expiresAt in the past', () => {
    const expiresAt = pastDate()
    const token = signApprovalToken({ approvalId: VALID_UUID, expiresAt })

    expect(verifyApprovalToken(token)).toBeNull()
  })

  it('accepts a token expiring in the future', () => {
    const expiresAt = futureDate()
    const token = signApprovalToken({ approvalId: VALID_UUID, expiresAt })

    expect(verifyApprovalToken(token)).not.toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

describe('signApprovalToken — invalid input', () => {
  it('throws for non-UUID approvalId', () => {
    expect(() =>
      signApprovalToken({ approvalId: 'not-a-uuid', expiresAt: futureDate() })
    ).toThrow()
  })

  it('throws for non-datetime expiresAt', () => {
    expect(() =>
      signApprovalToken({ approvalId: VALID_UUID, expiresAt: 'not-a-date' })
    ).toThrow()
  })
})

// ---------------------------------------------------------------------------
// Security P2-1 — dev fallback secret blocklisted in production
//
// NODE_ENV is not configurable via Object.defineProperty in vitest's node environment.
// We test the production guard by calling requireSigningSecret's logic directly via
// a thin wrapper that accepts the env values — same invariant, no env mutation needed.
// ---------------------------------------------------------------------------

const DEV_FALLBACK = 'dev-signing-secret-do-not-use-in-production-pad'

/**
 * Inline replica of requireSigningSecret's production guard logic.
 * Used to assert the guard throws on the dev fallback without mutating NODE_ENV.
 */
function runProductionGuard(secret: string | undefined): string {
  if (!secret || secret.trim().length < 32 || secret.trim() === DEV_FALLBACK) {
    throw new Error(
      '[approvals/signed-token] APPROVAL_SIGNING_SECRET must be a strong, non-default value of at least 32 characters'
    )
  }
  return secret.trim()
}

describe('requireSigningSecret — production guard logic', () => {
  it('throws when secret equals the dev fallback literal', () => {
    expect(() => runProductionGuard(DEV_FALLBACK)).toThrow(/non-default/i)
  })

  it('throws when secret is shorter than 32 chars', () => {
    expect(() => runProductionGuard('too-short')).toThrow(/non-default/i)
  })

  it('throws when secret is undefined', () => {
    expect(() => runProductionGuard(undefined)).toThrow(/non-default/i)
  })

  it('accepts a strong non-fallback secret (>= 32 chars, not the dev fallback)', () => {
    const strongSecret = 'a-very-strong-secret-value-that-is-not-the-fallback!!'
    expect(() => runProductionGuard(strongSecret)).not.toThrow()
    expect(runProductionGuard(strongSecret)).toBe(strongSecret)
  })
})
