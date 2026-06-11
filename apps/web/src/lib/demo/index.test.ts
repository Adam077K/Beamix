import { describe, it, expect } from 'vitest'
import { isDemoUser, DEMO_EMAILS, DEMO_SCAN_ID } from './index'

describe('isDemoUser', () => {
  // ---- exact-match truthy cases ------------------------------------------------

  it('returns true for the canonical demo email', () => {
    expect(isDemoUser('demo@beamixai.com')).toBe(true)
  })

  it('normalises ALL CAPS to lowercase before comparing', () => {
    expect(isDemoUser('DEMO@BEAMIXAI.COM')).toBe(true)
  })

  it('normalises mixed case to lowercase before comparing', () => {
    expect(isDemoUser('Demo@BeamixAI.com')).toBe(true)
  })

  // ---- null / empty guard -------------------------------------------------------

  it('returns false for null', () => {
    expect(isDemoUser(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isDemoUser(undefined)).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isDemoUser('')).toBe(false)
  })

  // ---- real-user email ----------------------------------------------------------

  it('returns false for a normal user email', () => {
    expect(isDemoUser('jane@acme.com')).toBe(false)
  })

  // ---- evil-domain / substring cases -------------------------------------------
  // These lock the exact-match contract so a future DEMO_EMAILS refactor can't
  // silently widen the gate via a prefix/suffix/substring match.

  it('returns false for a different local-part at the same domain (notdemo@beamixai.com)', () => {
    expect(isDemoUser('notdemo@beamixai.com')).toBe(false)
  })

  it('returns false for an evil subdomain that contains the exact string (demo@beamixai.com.evil.com)', () => {
    expect(isDemoUser('demo@beamixai.com.evil.com')).toBe(false)
  })

  it('returns false for a TLD that merely starts with the real TLD (demo@beamixai.coma)', () => {
    expect(isDemoUser('demo@beamixai.coma')).toBe(false)
  })

  it('returns false when the email has a leading space (" demo@beamixai.com")', () => {
    expect(isDemoUser(' demo@beamixai.com')).toBe(false)
  })
})

// Sanity export — DEMO_EMAILS and DEMO_SCAN_ID are exported from the same module
describe('DEMO_EMAILS constant', () => {
  it('contains exactly one entry', () => {
    expect(DEMO_EMAILS).toHaveLength(1)
  })

  it('entry matches the canonical demo email', () => {
    expect(DEMO_EMAILS[0]).toBe('demo@beamixai.com')
  })
})

describe('DEMO_SCAN_ID constant', () => {
  it('is a non-empty string', () => {
    expect(typeof DEMO_SCAN_ID).toBe('string')
    expect(DEMO_SCAN_ID.length).toBeGreaterThan(0)
  })
})
