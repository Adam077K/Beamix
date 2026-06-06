/**
 * EntryForm logic tests — node environment (no DOM rendering).
 *
 * Tests the pure logic units extracted from EntryForm:
 *   1. Domain validation regex
 *   2. Email validation regex
 *   3. Domain normalization (strips protocol + www)
 *   4. Submit guard: disabled when any field missing
 *   5. Payload shape when all fields valid
 *
 * The vitest config uses 'node' environment. DOM rendering requires jsdom +
 * @testing-library/react which are not installed. Component integration
 * tests belong in the E2E suite (Playwright).
 */

import { describe, it, expect } from 'vitest'

// ── Mirror the exact validation logic from EntryForm ──────────────────────────

const DOMAIN_RE = /^([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizeDomain(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/.*$/, '')
    .toLowerCase()
}

/** Mirrors the canSubmit guard in EntryForm. */
function canSubmit(
  domain: string,
  email: string,
  turnstileToken: string | null,
): boolean {
  const normalized = normalizeDomain(domain)
  const domainValid = DOMAIN_RE.test(normalized)
  const emailValid = EMAIL_RE.test(email.trim())
  return domainValid && emailValid && turnstileToken !== null
}

// ── Domain validation ─────────────────────────────────────────────────────────

describe('Domain validation', () => {
  it('accepts plain domain', () => {
    expect(DOMAIN_RE.test('testclinic.com')).toBe(true)
  })

  it('accepts subdomain', () => {
    expect(DOMAIN_RE.test('app.testclinic.com')).toBe(true)
  })

  it('accepts two-char TLD', () => {
    expect(DOMAIN_RE.test('example.co')).toBe(true)
  })

  it('rejects domain without TLD', () => {
    expect(DOMAIN_RE.test('notadomain')).toBe(false)
  })

  it('rejects domain with single-char TLD', () => {
    expect(DOMAIN_RE.test('test.c')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(DOMAIN_RE.test('')).toBe(false)
  })
})

// ── Domain normalization ──────────────────────────────────────────────────────

describe('normalizeDomain', () => {
  it('strips https:// prefix', () => {
    expect(normalizeDomain('https://testclinic.com')).toBe('testclinic.com')
  })

  it('strips http:// prefix', () => {
    expect(normalizeDomain('http://testclinic.com')).toBe('testclinic.com')
  })

  it('strips www. prefix', () => {
    expect(normalizeDomain('www.testclinic.com')).toBe('testclinic.com')
  })

  it('strips both protocol and www', () => {
    expect(normalizeDomain('https://www.testclinic.com/page?q=1')).toBe(
      'testclinic.com',
    )
  })

  it('lowercases the result', () => {
    expect(normalizeDomain('TestClinic.COM')).toBe('testclinic.com')
  })

  it('strips path', () => {
    expect(normalizeDomain('testclinic.com/about/team')).toBe('testclinic.com')
  })

  it('trims whitespace', () => {
    expect(normalizeDomain('  testclinic.com  ')).toBe('testclinic.com')
  })
})

// ── Email validation ──────────────────────────────────────────────────────────

describe('Email validation', () => {
  it('accepts standard email', () => {
    expect(EMAIL_RE.test('owner@testclinic.com')).toBe(true)
  })

  it('accepts plus-addressed email', () => {
    expect(EMAIL_RE.test('owner+alias@testclinic.com')).toBe(true)
  })

  it('rejects email without @', () => {
    expect(EMAIL_RE.test('notanemail')).toBe(false)
  })

  it('rejects email without domain', () => {
    expect(EMAIL_RE.test('user@')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(EMAIL_RE.test('')).toBe(false)
  })
})

// ── Submit guard (canSubmit) ──────────────────────────────────────────────────

describe('canSubmit guard', () => {
  it('returns false when all fields empty', () => {
    expect(canSubmit('', '', null)).toBe(false)
  })

  it('returns false when domain valid but email and token missing', () => {
    expect(canSubmit('testclinic.com', '', null)).toBe(false)
  })

  it('returns false when domain and email valid but token null', () => {
    expect(canSubmit('testclinic.com', 'owner@testclinic.com', null)).toBe(false)
  })

  it('returns false when email invalid but domain and token valid', () => {
    expect(canSubmit('testclinic.com', 'not-an-email', 'cf-token')).toBe(false)
  })

  it('returns true when domain + email + token all valid', () => {
    expect(canSubmit('testclinic.com', 'owner@testclinic.com', 'cf-token')).toBe(true)
  })

  it('returns true with https:// prefix in domain (normalizes correctly)', () => {
    expect(
      canSubmit('https://www.testclinic.com', 'owner@testclinic.com', 'token'),
    ).toBe(true)
  })
})

// ── Payload construction ──────────────────────────────────────────────────────

describe('Payload construction', () => {
  it('constructs correct payload from raw inputs', () => {
    const domain = 'https://www.testclinic.com/about'
    const businessName = 'Fortucci Dental'
    const email = '  owner@testclinic.com  '
    const turnstileToken = 'cf-real-token'

    const payload = {
      domain: normalizeDomain(domain),
      businessName: businessName.trim() || undefined,
      email: email.trim(),
      turnstileToken,
    }

    expect(payload.domain).toBe('testclinic.com')
    expect(payload.businessName).toBe('Fortucci Dental')
    expect(payload.email).toBe('owner@testclinic.com')
    expect(payload.turnstileToken).toBe('cf-real-token')
  })

  it('omits businessName when blank', () => {
    const businessName = '   '
    const payload = {
      domain: 'testclinic.com',
      businessName: businessName.trim() || undefined,
      email: 'owner@testclinic.com',
      turnstileToken: 'token',
    }
    expect(payload.businessName).toBeUndefined()
  })
})
