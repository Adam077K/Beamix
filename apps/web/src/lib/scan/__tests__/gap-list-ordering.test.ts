/**
 * Unit tests for gap-list-ordering.ts.
 *
 * Coverage:
 *   (1) Only status==='absent' gaps are ranked — present/unknown/pending excluded.
 *   (2) Contrastive count drives order over impact_weight:
 *       a low-impact gap that 3 competitors have outranks a high-impact gap nobody has.
 *   (3) Tier-3 hygiene (promises_lift=false) always tails all lift-promising gaps.
 *   (4) impact_fallback mode when no audits + correct annotation on every gap.
 *   (5) Deterministic tie-break (tier ASC + factor_key ASC).
 *   (6) Evidence strings — exact FACT-class wording:
 *       - contrastive k>0: "{k} of {n} named competitors have {display_name}; you don't"
 *       - zero-competitor: "No audited competitor has {display_name} either — lower priority"
 *       - fallback:         "Ordered by impact (no competitor comparison available this scan)"
 *   (7) No banned hypothesis phrasing anywhere in evidence strings.
 *   (8) Ranks are 1-based and sequential with no gaps.
 *   (9) Empty input returns empty output.
 *   (10) splitLiftVsHygiene correctly separates lift vs hygiene.
 */

import { describe, it, expect } from 'vitest';
import { buildContrastiveGapList, splitLiftVsHygiene } from '../gap-list-ordering';
import type { GapListItem } from '../factor-catalog';
import type { CompetitorFactorAudit } from '../gap-types';

// ---------------------------------------------------------------------------
// Helpers — build minimal GapListItem and CompetitorFactorAudit fixtures
// ---------------------------------------------------------------------------

function makeGap(
  factor_key: string,
  opts: {
    status?: 'absent' | 'present' | 'unknown' | 'pending';
    tier?: number;
    impact_weight?: number;
    playbook_id?: string | null;
    promises_lift?: boolean;
    display_name?: string;
  } = {},
): GapListItem {
  return {
    factor_key,
    status: opts.status ?? 'absent',
    truth_class: 'FACT',
    evidence: `test evidence for ${factor_key}`,
    source: 'site_audit',
    detected_at: '2026-06-10T12:00:00.000Z',
    tier: opts.tier ?? 1,
    display_name: opts.display_name ?? factor_key,
    impact_weight: opts.impact_weight ?? 0.3,
    playbook_id: opts.playbook_id !== undefined ? opts.playbook_id : 'content_optimizer',
    promises_lift: opts.promises_lift !== undefined ? opts.promises_lift : true,
  };
}

function makeAudit(
  competitor_name: string,
  presentKeys: string[],
): CompetitorFactorAudit {
  return {
    competitor_name,
    domain: `${competitor_name.toLowerCase().replace(/\s+/g, '-')}.com`,
    observations: presentKeys.map((key) => ({
      factor_key: key,
      status: 'present',
      truth_class: 'FACT',
      evidence: `${competitor_name} has ${key}`,
      source: 'site_audit',
      detected_at: '2026-06-10T12:00:00.000Z',
    })),
  };
}

// ---------------------------------------------------------------------------
// (1) Only status==='absent' gaps are ranked
// ---------------------------------------------------------------------------

describe('buildContrastiveGapList — status filtering', () => {
  it('excludes present, unknown, pending — includes only absent', () => {
    const gaps = [
      makeGap('factor_a', { status: 'absent' }),
      makeGap('factor_b', { status: 'present' }),
      makeGap('factor_c', { status: 'unknown' }),
      makeGap('factor_d', { status: 'pending' }),
    ];

    const result = buildContrastiveGapList(gaps, []);
    expect(result).toHaveLength(1);
    expect(result[0].factor_key).toBe('factor_a');
  });

  it('pending gaps with absent status would be included — but pending itself is excluded', () => {
    const gaps = [
      makeGap('factor_a', { status: 'pending' }),
      makeGap('factor_b', { status: 'absent' }),
    ];
    const result = buildContrastiveGapList(gaps, []);
    expect(result).toHaveLength(1);
    expect(result[0].factor_key).toBe('factor_b');
  });

  it('empty input → empty output', () => {
    expect(buildContrastiveGapList([], [])).toHaveLength(0);
  });

  it('all non-absent → empty output', () => {
    const gaps = [
      makeGap('a', { status: 'present' }),
      makeGap('b', { status: 'unknown' }),
    ];
    expect(buildContrastiveGapList(gaps, [])).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// (2) Contrastive count drives order over impact_weight
// ---------------------------------------------------------------------------

describe('buildContrastiveGapList — contrastive ordering', () => {
  it('low-impact gap with 3 competitors outranks high-impact gap nobody has', () => {
    const gaps = [
      // High impact, nobody has it
      makeGap('high_impact_no_competitor', {
        impact_weight: 0.40,
        promises_lift: true,
        tier: 1,
      }),
      // Low impact, 3 competitors have it
      makeGap('low_impact_3_competitors', {
        impact_weight: 0.20,
        promises_lift: true,
        tier: 1,
      }),
    ];

    const audits = [
      makeAudit('Competitor A', ['low_impact_3_competitors']),
      makeAudit('Competitor B', ['low_impact_3_competitors']),
      makeAudit('Competitor C', ['low_impact_3_competitors']),
    ];

    const result = buildContrastiveGapList(gaps, audits);
    expect(result[0].factor_key).toBe('low_impact_3_competitors');
    expect(result[0].contrastive_count).toBe(3);
    expect(result[0].rank).toBe(1);

    expect(result[1].factor_key).toBe('high_impact_no_competitor');
    expect(result[1].contrastive_count).toBe(0);
    expect(result[1].rank).toBe(2);
  });

  it('more competitors = higher rank: 2 > 1 > 0', () => {
    const gaps = [
      makeGap('gap_zero', { impact_weight: 0.3, tier: 1 }),
      makeGap('gap_one', { impact_weight: 0.3, tier: 1 }),
      makeGap('gap_two', { impact_weight: 0.3, tier: 1 }),
    ];

    const audits = [
      makeAudit('C1', ['gap_one', 'gap_two']),
      makeAudit('C2', ['gap_two']),
    ];

    const result = buildContrastiveGapList(gaps, audits);
    expect(result[0].factor_key).toBe('gap_two');   // 2 competitors
    expect(result[1].factor_key).toBe('gap_one');    // 1 competitor
    expect(result[2].factor_key).toBe('gap_zero');   // 0 competitors
  });

  it('impact_weight is the tiebreak when contrastive_count is equal', () => {
    const gaps = [
      makeGap('low_weight', { impact_weight: 0.20, tier: 1 }),
      makeGap('high_weight', { impact_weight: 0.35, tier: 1 }),
    ];

    const audits = [makeAudit('C1', ['low_weight', 'high_weight'])];

    const result = buildContrastiveGapList(gaps, audits);
    // Both have contrastive_count=1, so impact_weight breaks the tie
    expect(result[0].factor_key).toBe('high_weight');
    expect(result[1].factor_key).toBe('low_weight');
  });

  it('competitors_with_factor lists the correct names', () => {
    const gaps = [makeGap('review_systems', { impact_weight: 0.34, tier: 1 })];
    const audits = [
      makeAudit('Alpha Corp', ['review_systems']),
      makeAudit('Beta LLC', ['review_systems']),
    ];

    const result = buildContrastiveGapList(gaps, audits);
    expect(result[0].competitors_with_factor).toEqual(
      expect.arrayContaining(['Alpha Corp', 'Beta LLC']),
    );
    expect(result[0].competitors_with_factor).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// (3) Tier-3 hygiene always tails
// ---------------------------------------------------------------------------

describe('buildContrastiveGapList — Tier-3 hygiene tail', () => {
  it('hygiene gaps tail even when they have high contrastive_count', () => {
    const gaps = [
      // Tier-3 hygiene, 3 competitors have it
      makeGap('llms_txt', {
        tier: 3,
        promises_lift: false,
        impact_weight: 0.02,
        playbook_id: null,
      }),
      // Tier-1 lift, 0 competitors have it
      makeGap('ai_bot_allowlist', {
        tier: 1,
        promises_lift: true,
        impact_weight: 0.40,
        playbook_id: 'content_optimizer',
      }),
    ];

    const audits = [
      makeAudit('C1', ['llms_txt']),
      makeAudit('C2', ['llms_txt']),
      makeAudit('C3', ['llms_txt']),
    ];

    const result = buildContrastiveGapList(gaps, audits);
    // Lift-promising gap comes first regardless
    expect(result[0].factor_key).toBe('ai_bot_allowlist');
    expect(result[0].promises_lift).toBe(true);

    // Hygiene gap tails despite having 3 competitors with it
    expect(result[1].factor_key).toBe('llms_txt');
    expect(result[1].promises_lift).toBe(false);
    expect(result[1].contrastive_count).toBe(3);
  });

  it('hygiene gaps are ordered among themselves by the same comparator', () => {
    const gaps = [
      makeGap('llms_txt', {
        tier: 3, promises_lift: false, impact_weight: 0.02, playbook_id: null,
      }),
      makeGap('schema_beyond_basics', {
        tier: 3, promises_lift: false, impact_weight: 0.03, playbook_id: 'schema_generator',
      }),
    ];

    const audits = [makeAudit('C1', ['llms_txt'])];

    const result = buildContrastiveGapList(gaps, audits);
    // Both hygiene; llms_txt has 1 competitor = higher contrastive → lower rank in tail
    const hygieneGaps = result.filter((g) => !g.promises_lift);
    expect(hygieneGaps[0].factor_key).toBe('llms_txt');
    expect(hygieneGaps[1].factor_key).toBe('schema_beyond_basics');
  });
});

// ---------------------------------------------------------------------------
// (4) impact_fallback mode
// ---------------------------------------------------------------------------

describe('buildContrastiveGapList — impact_fallback mode', () => {
  it('uses ordering_mode=impact_fallback when no audits provided', () => {
    const gaps = [makeGap('review_systems', { impact_weight: 0.34 })];
    const result = buildContrastiveGapList(gaps, []);

    expect(result[0].ordering_mode).toBe('impact_fallback');
  });

  it('every gap gets ordering_mode=impact_fallback with empty audits', () => {
    const gaps = [
      makeGap('factor_a', { impact_weight: 0.30 }),
      makeGap('factor_b', { impact_weight: 0.20 }),
    ];
    const result = buildContrastiveGapList(gaps, []);

    expect(result.every((g) => g.ordering_mode === 'impact_fallback')).toBe(true);
  });

  it('fallback mode orders by impact_weight DESC', () => {
    const gaps = [
      makeGap('low_impact', { impact_weight: 0.15, tier: 1 }),
      makeGap('high_impact', { impact_weight: 0.38, tier: 1 }),
    ];
    const result = buildContrastiveGapList(gaps, []);

    expect(result[0].factor_key).toBe('high_impact');
    expect(result[1].factor_key).toBe('low_impact');
  });

  it('fallback mode contrastive_count is always 0', () => {
    const gaps = [makeGap('factor_a', { impact_weight: 0.30 })];
    const result = buildContrastiveGapList(gaps, []);

    expect(result[0].contrastive_count).toBe(0);
    expect(result[0].competitors_with_factor).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// (5) Deterministic tie-break
// ---------------------------------------------------------------------------

describe('buildContrastiveGapList — deterministic tie-break', () => {
  it('equal contrastive_count + equal impact_weight → sorted by effort_score ASC', () => {
    // ai_bot_allowlist: effort=1 (from FIXABILITY_MAP)
    // extractable_structure: effort=2
    const gaps = [
      makeGap('extractable_structure', { impact_weight: 0.30, tier: 1 }),
      makeGap('ai_bot_allowlist', { impact_weight: 0.30, tier: 1 }),
    ];

    const audits = [makeAudit('C1', ['extractable_structure', 'ai_bot_allowlist'])];

    const result = buildContrastiveGapList(gaps, audits);
    // Same contrastive_count, same impact_weight → effort_score ASC
    expect(result[0].factor_key).toBe('ai_bot_allowlist');  // effort=1
    expect(result[1].factor_key).toBe('extractable_structure');  // effort=2
  });

  it('equal everything → sorted by factor_key ASC (fully deterministic)', () => {
    // Use fake keys to control all values; inject matching FIXABILITY_MAP by using
    // two real keys with the same effort_score path won't work easily, so use real keys
    // where we can control only factor_key differs.
    // Use 'reddit_quora_presence' vs 'review_systems' — both slow/8 from the map.
    const gaps = [
      makeGap('review_systems', {
        impact_weight: 0.34, tier: 1, promises_lift: true,
      }),
      makeGap('reddit_quora_presence', {
        impact_weight: 0.34, tier: 1, promises_lift: true,
      }),
    ];

    // Both audited competitors have both factors — same contrastive_count
    const audits = [
      makeAudit('C1', ['review_systems', 'reddit_quora_presence']),
    ];

    const result = buildContrastiveGapList(gaps, audits);
    // Same contrastive_count, same impact_weight, same effort_score (both slow/8),
    // same tier → factor_key ASC breaks the tie.
    // 'reddit_quora_presence' < 'review_systems' lexicographically
    expect(result[0].factor_key).toBe('reddit_quora_presence');
    expect(result[1].factor_key).toBe('review_systems');
  });

  it('same inputs produce same ordering on repeated calls (idempotent)', () => {
    const gaps = [
      makeGap('factor_a', { impact_weight: 0.3, tier: 1 }),
      makeGap('factor_b', { impact_weight: 0.3, tier: 1 }),
    ];
    const audits = [makeAudit('C1', ['factor_a'])];

    const r1 = buildContrastiveGapList(gaps, audits);
    const r2 = buildContrastiveGapList(gaps, audits);
    expect(r1.map((g) => g.factor_key)).toEqual(r2.map((g) => g.factor_key));
  });
});

// ---------------------------------------------------------------------------
// (6) Evidence strings — exact FACT-class wording
// ---------------------------------------------------------------------------

describe('buildContrastiveGapList — evidence strings', () => {
  it('contrastive k>0: exact wording "{k} of {n} named competitors have {display_name}; you don\'t"', () => {
    const gaps = [
      makeGap('review_systems', {
        display_name: 'Review Systems',
        impact_weight: 0.34,
        tier: 1,
      }),
    ];
    const audits = [
      makeAudit('Alpha', ['review_systems']),
      makeAudit('Beta', ['review_systems']),
    ];

    const result = buildContrastiveGapList(gaps, audits);
    expect(result[0].contrastive_evidence).toBe(
      "2 of 2 named competitors have Review Systems; you don't",
    );
  });

  it('zero-competitor in contrastive mode: "No audited competitor has {display_name} either — lower priority"', () => {
    const gaps = [
      makeGap('wikidata_entity', {
        display_name: 'Wikidata Entity',
        impact_weight: 0.25,
        tier: 1,
      }),
    ];
    // 1 competitor exists but they don't have wikidata_entity
    const audits = [makeAudit('C1', ['review_systems'])];

    const result = buildContrastiveGapList(gaps, audits);
    expect(result[0].contrastive_evidence).toBe(
      'No audited competitor has Wikidata Entity either — lower priority',
    );
  });

  it('impact_fallback: "Ordered by impact (no competitor comparison available this scan)"', () => {
    const gaps = [makeGap('review_systems', { display_name: 'Review Systems' })];
    const result = buildContrastiveGapList(gaps, []);

    expect(result[0].contrastive_evidence).toBe(
      'Ordered by impact (no competitor comparison available this scan)',
    );
  });

  it('evidence uses display_name not factor_key', () => {
    const gaps = [
      makeGap('ai_bot_allowlist', {
        display_name: 'AI Bot Allowlist',
        tier: 1,
      }),
    ];
    const audits = [makeAudit('C1', ['ai_bot_allowlist'])];

    const result = buildContrastiveGapList(gaps, audits);
    expect(result[0].contrastive_evidence).toContain('AI Bot Allowlist');
    expect(result[0].contrastive_evidence).not.toContain('ai_bot_allowlist');
  });
});

// ---------------------------------------------------------------------------
// (7) No banned hypothesis phrasing
// ---------------------------------------------------------------------------

describe('buildContrastiveGapList — honesty spine (no hypothesis language)', () => {
  const BANNED_PHRASES = [
    "you're invisible because",
    "you are invisible because",
    "doing x will raise",
    "will raise your score",
    "will increase your",
    "because you",
    "this will",
    "guaranteed",
  ];

  it('no evidence string contains banned hypothesis phrasing', () => {
    const gaps = [
      makeGap('review_systems', { display_name: 'Review Systems', tier: 1 }),
      makeGap('llms_txt', { display_name: 'llms.txt File', tier: 3, promises_lift: false, playbook_id: null }),
      makeGap('ai_bot_allowlist', { display_name: 'AI Bot Allowlist', tier: 1 }),
    ];
    const audits = [
      makeAudit('C1', ['review_systems', 'ai_bot_allowlist']),
    ];

    const contrastiveResult = buildContrastiveGapList(gaps, audits);
    const fallbackResult = buildContrastiveGapList(gaps, []);

    for (const result of [contrastiveResult, fallbackResult]) {
      for (const gap of result) {
        const lower = gap.contrastive_evidence.toLowerCase();
        for (const banned of BANNED_PHRASES) {
          expect(lower).not.toContain(banned);
        }
      }
    }
  });
});

// ---------------------------------------------------------------------------
// (8) Ranks are 1-based and sequential
// ---------------------------------------------------------------------------

describe('buildContrastiveGapList — rank assignment', () => {
  it('ranks are 1-based', () => {
    const gaps = [
      makeGap('a', { tier: 1 }),
      makeGap('b', { tier: 1 }),
      makeGap('c', { tier: 1 }),
    ];
    const result = buildContrastiveGapList(gaps, []);

    expect(result[0].rank).toBe(1);
    expect(result[1].rank).toBe(2);
    expect(result[2].rank).toBe(3);
  });

  it('ranks are sequential with no gaps (1, 2, 3, ...)', () => {
    const gaps = Array.from({ length: 5 }, (_, i) =>
      makeGap(`factor_${i}`, { tier: 1, impact_weight: 0.3 }),
    );
    const result = buildContrastiveGapList(gaps, []);

    const ranks = result.map((g) => g.rank);
    expect(ranks).toEqual([1, 2, 3, 4, 5]);
  });
});

// ---------------------------------------------------------------------------
// (10) splitLiftVsHygiene
// ---------------------------------------------------------------------------

describe('splitLiftVsHygiene', () => {
  it('correctly splits lift vs hygiene by promises_lift', () => {
    const gaps = [
      makeGap('review_systems', { promises_lift: true, tier: 1 }),
      makeGap('llms_txt', { promises_lift: false, tier: 3, playbook_id: null }),
      makeGap('ai_bot_allowlist', { promises_lift: true, tier: 1 }),
      makeGap('backlinks_dr', { promises_lift: false, tier: 3, playbook_id: null }),
    ];
    const audits = [makeAudit('C1', ['review_systems'])];
    const ranked = buildContrastiveGapList(gaps, audits);

    const { lift, hygiene } = splitLiftVsHygiene(ranked);

    expect(lift.every((g) => g.promises_lift)).toBe(true);
    expect(hygiene.every((g) => !g.promises_lift)).toBe(true);
    expect(lift).toHaveLength(2);
    expect(hygiene).toHaveLength(2);
  });

  it('empty ranked list → empty lift and hygiene', () => {
    const { lift, hygiene } = splitLiftVsHygiene([]);
    expect(lift).toHaveLength(0);
    expect(hygiene).toHaveLength(0);
  });

  it('all lift → hygiene is empty', () => {
    const gaps = [makeGap('review_systems', { promises_lift: true })];
    const ranked = buildContrastiveGapList(gaps, []);
    const { lift, hygiene } = splitLiftVsHygiene(ranked);
    expect(lift).toHaveLength(1);
    expect(hygiene).toHaveLength(0);
  });

  it('preserves rank order within each bucket', () => {
    const gaps = [
      makeGap('a', { promises_lift: true, tier: 1, impact_weight: 0.4 }),
      makeGap('b', { promises_lift: true, tier: 1, impact_weight: 0.3 }),
      makeGap('c', { promises_lift: false, tier: 3, impact_weight: 0.03, playbook_id: null }),
    ];
    const ranked = buildContrastiveGapList(gaps, []);
    const { lift } = splitLiftVsHygiene(ranked);

    // Ranks preserved: 'a' has higher impact so should be rank 1
    expect(lift[0].factor_key).toBe('a');
    expect(lift[1].factor_key).toBe('b');
    // Confirm lift ranks are ordered correctly
    expect(lift[0].rank).toBeLessThan(lift[1].rank);
  });
});
