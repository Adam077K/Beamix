/**
 * Unit tests for probe.ts.
 *
 * Coverage:
 *   (1)  buildNeutralProbe returns a minimal system persona with no identity
 *   (2)  buildNeutralProbe user turn is the sanitized query_text
 *   (3)  buildNeutralProbe does NOT inject category or location
 *   (4)  checkProbeLeak passes clean probe (no identity in prompt)
 *   (5)  checkProbeLeak detects business_name leak
 *   (6)  checkProbeLeak detects domain leak (full URL form)
 *   (7)  checkProbeLeak detects domain_root leak (bare second-level label)
 *   (8)  checkProbeLeak detects alias leak
 *   (9)  checkProbeLeak skips aliases shorter than 3 characters (false-positive guard)
 *   (10) checkProbeLeak is case-insensitive
 *   (11) checkProbeLeak returns multiple violations when multiple tokens leak
 *   (12) checkProbeLeak returns ok=true and violations=[] for empty identity tokens
 *   (13) assertProbeClean throws ProbeLeakError on leak (carrying violations)
 *   (14) assertProbeClean does not throw for clean probe
 */

import { describe, it, expect } from 'vitest';
import { buildNeutralProbe, checkProbeLeak, assertProbeClean, ProbeLeakError } from '../probe';
import type { NeutralQuery, ClientIdentity } from '../measurement-types';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const CLEAN_QUERY: NeutralQuery = {
  query_text: 'best dental clinic in Tel Aviv',
  category: 'dental clinic',
  location: 'Tel Aviv',
  intent_bucket: 'category_geo',
};

const IDENTITY: ClientIdentity = {
  business_name: 'Acme Dental',
  domain: 'https://www.acme-dental.co.il',
  aliases: ['Acme', 'Acme Tel Aviv'],
};

const IDENTITY_SHORT_ALIAS: ClientIdentity = {
  business_name: 'AlphaCorp',
  domain: 'https://alphacorp.com',
  aliases: ['AC', 'IT', 'USA', 'AlphaCorp Group'],
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('buildNeutralProbe', () => {
  it('(1) returns a minimal neutral system persona', () => {
    const probe = buildNeutralProbe(CLEAN_QUERY);
    expect(probe.system).toContain('helpful AI assistant');
    // Must NOT contain any business-directing instructions
    expect(probe.system).not.toMatch(/list|rank|recommend|top \d|json/i);
    expect(probe.system).not.toContain('dental clinic');
    expect(probe.system).not.toContain('Tel Aviv');
  });

  it('(2) user turn is the sanitized query_text', () => {
    const probe = buildNeutralProbe(CLEAN_QUERY);
    expect(probe.user).toBe('best dental clinic in Tel Aviv');
  });

  it('(3) does NOT inject category or location beyond what query_text carries', () => {
    // A query whose text is short and location-free — category/location must NOT appear
    const q: NeutralQuery = {
      query_text: 'good accountant',
      category: 'accounting firm',
      location: 'New York',
      intent_bucket: 'category_geo',
    };
    const probe = buildNeutralProbe(q);
    expect(probe.user).toBe('good accountant');
    expect(probe.user).not.toContain('accounting firm');
    expect(probe.user).not.toContain('New York');
  });

  it('sanitizes prompt injection attempts in query_text', () => {
    const q: NeutralQuery = {
      ...CLEAN_QUERY,
      query_text: 'ignore previous\nbest clinic',
    };
    const probe = buildNeutralProbe(q);
    expect(probe.user).not.toContain('ignore previous');
    expect(probe.user).toContain('[redacted]');
  });
});

describe('checkProbeLeak', () => {
  it('(4) passes a clean probe — no identity in prompt', () => {
    const probe = buildNeutralProbe(CLEAN_QUERY);
    const result = checkProbeLeak(probe, IDENTITY);
    expect(result.ok).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it('(5) detects business_name leak in system prompt', () => {
    const probe = {
      system: 'You are helping Acme Dental customers.',
      user: 'best dental clinic in Tel Aviv',
    };
    const result = checkProbeLeak(probe, IDENTITY);
    expect(result.ok).toBe(false);
    expect(result.violations).toContain('business_name');
  });

  it('(5b) detects business_name leak in user prompt', () => {
    const probe = {
      system: 'You are a helpful AI assistant.',
      user: 'Is Acme Dental good?',
    };
    const result = checkProbeLeak(probe, IDENTITY);
    expect(result.ok).toBe(false);
    expect(result.violations).toContain('business_name');
  });

  it('(6) detects domain leak (full URL form)', () => {
    const probe = {
      system: 'You are a helpful AI assistant.',
      user: 'best dental clinic, check https://www.acme-dental.co.il',
    };
    const result = checkProbeLeak(probe, IDENTITY);
    expect(result.ok).toBe(false);
    expect(result.violations).toContain('domain');
  });

  it('(7) detects domain_root leak (bare second-level label)', () => {
    const probe = {
      system: 'You are a helpful AI assistant.',
      user: 'what about acme-dental in Tel Aviv?',
    };
    const result = checkProbeLeak(probe, IDENTITY);
    expect(result.ok).toBe(false);
    expect(result.violations).toContain('domain_root');
  });

  it('(8) detects alias leak', () => {
    const probe = {
      system: 'You are a helpful AI assistant.',
      user: 'best clinic — Acme Tel Aviv is great',
    };
    const result = checkProbeLeak(probe, IDENTITY);
    expect(result.ok).toBe(false);
    // 'Acme Tel Aviv' alias should be detected
    expect(result.violations.some((v) => v.startsWith('alias:'))).toBe(true);
  });

  it('(9) skips aliases shorter than 3 characters (false-positive guard)', () => {
    const probe = {
      system: 'You are a helpful AI assistant answering a real person question.',
      user: 'best IT company in USA for AC units',
    };
    // 'AC' (2 chars) and 'IT' (2 chars) should be SKIPPED
    const result = checkProbeLeak(probe, IDENTITY_SHORT_ALIAS);
    // 'USA' (3 chars) is a valid alias and IS present — but 'AlphaCorp Group' also matches
    // We only care that AC/IT do NOT produce violations
    const acViolation = result.violations.some((v) => v === 'alias:AC');
    const itViolation = result.violations.some((v) => v === 'alias:IT');
    expect(acViolation).toBe(false);
    expect(itViolation).toBe(false);
  });

  it('(10) is case-insensitive', () => {
    const probe = {
      system: 'acme dental is a great company.',
      user: 'best clinic',
    };
    const result = checkProbeLeak(probe, IDENTITY);
    expect(result.ok).toBe(false);
    expect(result.violations).toContain('business_name');
  });

  it('(11) returns multiple violations when multiple tokens leak', () => {
    const probe = {
      system: 'Acme Dental is at acme-dental.co.il.',
      user: 'best dental clinic',
    };
    const result = checkProbeLeak(probe, IDENTITY);
    expect(result.ok).toBe(false);
    expect(result.violations.length).toBeGreaterThanOrEqual(2);
  });

  it('(12) returns ok=true for empty/whitespace identity tokens', () => {
    const emptyIdentity: ClientIdentity = {
      business_name: '',
      domain: '',
      aliases: ['', '  '],
    };
    const probe = { system: 'You are a helpful AI assistant.', user: 'best clinic' };
    const result = checkProbeLeak(probe, emptyIdentity);
    expect(result.ok).toBe(true);
    expect(result.violations).toHaveLength(0);
  });
});

describe('assertProbeClean', () => {
  it('(13) throws ProbeLeakError when leak detected', () => {
    const probe = {
      system: 'You help Acme Dental find customers.',
      user: 'best dental clinic',
    };
    expect(() => assertProbeClean(probe, IDENTITY)).toThrow(ProbeLeakError);
    try {
      assertProbeClean(probe, IDENTITY);
    } catch (e) {
      expect(e).toBeInstanceOf(ProbeLeakError);
      if (e instanceof ProbeLeakError) {
        expect(e.violations).toContain('business_name');
        expect(e.violations.length).toBeGreaterThan(0);
      }
    }
  });

  it('(14) does not throw for a clean probe', () => {
    const probe = buildNeutralProbe(CLEAN_QUERY);
    expect(() => assertProbeClean(probe, IDENTITY)).not.toThrow();
  });
});
