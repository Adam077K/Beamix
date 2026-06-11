/**
 * Unit tests for fixability.ts.
 *
 * Coverage:
 *   (1) All 16 canonical factor_keys have entries in FIXABILITY_MAP.
 *   (2) getFixability returns the correct entry for each known key.
 *   (3) getFixability returns a safe medium/2 default for unknown keys.
 *   (4) effort_score is within the expected band for each fixability class.
 *   (5) Tier-3 hygiene factors have the documented ratings.
 *   (6) Tier-1 fast factors are fast.
 */

import { describe, it, expect } from 'vitest';
import { FIXABILITY_MAP, getFixability } from '../fixability';
import type { FixabilityEntry } from '../fixability';

// ---------------------------------------------------------------------------
// The canonical 16 factor_keys from factor-detection.ts (Tier 1 → 2 → 3)
// ---------------------------------------------------------------------------

const TIER_1_KEYS = [
  'on_page_princeton_tactics',
  'extractable_structure',
  'content_freshness',
  'listicle_inclusion',
  'reddit_quora_presence',
  'review_systems',
  'earned_media_pr',
  'wikidata_entity',
  'ai_bot_allowlist',
] as const;

const TIER_2_KEYS = [
  'topical_authority_cluster',
  'linkedin_presence',
  'youtube_presence',
  'basic_schema',
] as const;

const TIER_3_KEYS = [
  'llms_txt',
  'schema_beyond_basics',
  'backlinks_dr',
] as const;

const ALL_KEYS = [...TIER_1_KEYS, ...TIER_2_KEYS, ...TIER_3_KEYS] as const;

// ---------------------------------------------------------------------------
// (1) All 16 canonical keys are present in FIXABILITY_MAP
// ---------------------------------------------------------------------------

describe('FIXABILITY_MAP coverage', () => {
  it('has all 16 canonical factor_keys', () => {
    expect(ALL_KEYS).toHaveLength(16);
    for (const key of ALL_KEYS) {
      expect(FIXABILITY_MAP).toHaveProperty(key);
    }
  });

  it('has no entry with undefined fixability or effort_score', () => {
    for (const key of ALL_KEYS) {
      const entry = FIXABILITY_MAP[key] as FixabilityEntry;
      expect(['fast', 'medium', 'slow']).toContain(entry.fixability);
      expect(typeof entry.effort_score).toBe('number');
      expect(entry.effort_score).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// (2) getFixability returns correct entries for known keys
// ---------------------------------------------------------------------------

describe('getFixability — known keys', () => {
  it('ai_bot_allowlist → fast, effort_score=1 (cheapest fix)', () => {
    const result = getFixability('ai_bot_allowlist');
    expect(result.fixability).toBe('fast');
    expect(result.effort_score).toBe(1);
  });

  it('extractable_structure → fast', () => {
    expect(getFixability('extractable_structure').fixability).toBe('fast');
  });

  it('content_freshness → fast', () => {
    expect(getFixability('content_freshness').fixability).toBe('fast');
  });

  it('on_page_princeton_tactics → fast', () => {
    expect(getFixability('on_page_princeton_tactics').fixability).toBe('fast');
  });

  it('review_systems → slow (earned, time)', () => {
    expect(getFixability('review_systems').fixability).toBe('slow');
  });

  it('reddit_quora_presence → slow (community, time)', () => {
    expect(getFixability('reddit_quora_presence').fixability).toBe('slow');
  });

  it('listicle_inclusion → slow (editorial, time)', () => {
    expect(getFixability('listicle_inclusion').fixability).toBe('slow');
  });

  it('earned_media_pr → slow, effort_score=10 (hardest)', () => {
    const result = getFixability('earned_media_pr');
    expect(result.fixability).toBe('slow');
    expect(result.effort_score).toBe(10);
  });

  it('wikidata_entity → slow', () => {
    expect(getFixability('wikidata_entity').fixability).toBe('slow');
  });

  it('basic_schema → medium', () => {
    expect(getFixability('basic_schema').fixability).toBe('medium');
  });

  it('topical_authority_cluster → medium', () => {
    expect(getFixability('topical_authority_cluster').fixability).toBe('medium');
  });

  it('linkedin_presence → slow', () => {
    expect(getFixability('linkedin_presence').fixability).toBe('slow');
  });

  it('youtube_presence → slow', () => {
    expect(getFixability('youtube_presence').fixability).toBe('slow');
  });
});

// ---------------------------------------------------------------------------
// (3) getFixability returns safe default for unknown keys
// ---------------------------------------------------------------------------

describe('getFixability — unknown key fallback', () => {
  it('returns medium/2 for a completely unknown key', () => {
    const result = getFixability('future_unknown_factor_xyz');
    expect(result.fixability).toBe('medium');
    expect(result.effort_score).toBe(2);
  });

  it('returns medium/2 for empty string', () => {
    const result = getFixability('');
    expect(result.fixability).toBe('medium');
    expect(result.effort_score).toBe(2);
  });

  it('returns medium/2 for a near-miss key name', () => {
    // Ensure no accidental substring match
    const result = getFixability('ai_bot');
    expect(result.fixability).toBe('medium');
    expect(result.effort_score).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// (4) effort_score bands match fixability class
// ---------------------------------------------------------------------------

describe('effort_score bands', () => {
  it('fast entries have effort_score 1-3', () => {
    for (const key of ALL_KEYS) {
      const entry = getFixability(key);
      if (entry.fixability === 'fast') {
        expect(entry.effort_score).toBeGreaterThanOrEqual(1);
        expect(entry.effort_score).toBeLessThanOrEqual(3);
      }
    }
  });

  it('medium entries have effort_score 4-6', () => {
    for (const key of ALL_KEYS) {
      const entry = getFixability(key);
      if (entry.fixability === 'medium') {
        expect(entry.effort_score).toBeGreaterThanOrEqual(4);
        expect(entry.effort_score).toBeLessThanOrEqual(6);
      }
    }
  });

  it('slow entries have effort_score 7-10', () => {
    for (const key of ALL_KEYS) {
      const entry = getFixability(key);
      if (entry.fixability === 'slow') {
        expect(entry.effort_score).toBeGreaterThanOrEqual(7);
        expect(entry.effort_score).toBeLessThanOrEqual(10);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// (5) Tier-3 hygiene factors have documented ratings
// ---------------------------------------------------------------------------

describe('Tier-3 hygiene factors', () => {
  it('llms_txt → fast/1 (trivial file drop)', () => {
    const entry = getFixability('llms_txt');
    expect(entry.fixability).toBe('fast');
    expect(entry.effort_score).toBe(1);
  });

  it('schema_beyond_basics → medium', () => {
    expect(getFixability('schema_beyond_basics').fixability).toBe('medium');
  });

  it('backlinks_dr → slow/10 (slowest, never repackage as GEO win)', () => {
    const entry = getFixability('backlinks_dr');
    expect(entry.fixability).toBe('slow');
    expect(entry.effort_score).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// (6) Tier-1 fast factors are all classified 'fast'
// ---------------------------------------------------------------------------

describe('Tier-1 fast factors', () => {
  const tier1FastKeys = [
    'on_page_princeton_tactics',
    'extractable_structure',
    'content_freshness',
    'ai_bot_allowlist',
  ];

  it('on-page content + config factors are fast', () => {
    for (const key of tier1FastKeys) {
      expect(getFixability(key).fixability).toBe('fast');
    }
  });

  it('ai_bot_allowlist is the cheapest fix (effort_score=1)', () => {
    // Cheapest because it is a single robots.txt config edit.
    expect(getFixability('ai_bot_allowlist').effort_score).toBe(1);
  });
});
