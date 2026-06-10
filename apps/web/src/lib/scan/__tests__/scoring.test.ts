/**
 * Unit tests for scoring.ts.
 *
 * Coverage:
 *   Wilson CI:
 *     (1)  Known values: 4/5 successes.
 *     (2)  0/5 → CI biased high (0 successes, low confidence).
 *     (3)  5/5 → CI biased low (all successes, low confidence).
 *     (4)  n=0 → maximal uncertainty { low:0, high:1 }.
 *     (5)  CI widens at small n (monotonic property).
 *     (6)  Bounds clamped to [0,1].
 *
 *   computeBand:
 *     (7)  Presence-only drives point (position null).
 *     (8)  low_confidence=true when n<5.
 *     (9)  low_confidence=false when n≥5.
 *    (10)  CI is present and ordered (ci_low ≤ point ≤ ci_high is not guaranteed,
 *           but ci_low ≤ ci_high always).
 *    (11)  position null handled gracefully (no bonus applied).
 *    (12)  position rank 1 gives higher point than position null at same presence.
 *
 *   computeDimensions / scoreEngine / scoreAllEngines:
 *    (13)  scoreEngine returns correct engine label.
 *    (14)  scoreAllEngines returns one subscore per engine, never merged.
 *    (15)  Two engines with different data stay distinct (no cross-engine averaging).
 *    (16)  Per-engine array — sample_n matches observation count.
 *
 *   rerunVariance:
 *    (17)  SD≤5 → passesGate=true.
 *    (18)  SD>5 → passesGate=false.
 *    (19)  Empty array → {sd:0, mean:0, passesGate:true}.
 *    (20)  Identical points → sd=0.
 *
 *   medianAcrossEngines:
 *    (21)  Odd count → middle value.
 *    (22)  Even count → average of two middle values.
 *    (23)  Empty → 0.
 */

import { describe, it, expect } from 'vitest';
import {
  wilsonInterval,
  computeBand,
  scoreEngine,
  scoreAllEngines,
  rerunVariance,
  medianAcrossEngines,
} from '../scoring';
import type { ClientIdentity, EngineProbeObservation } from '../measurement-types';

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

const IDENTITY: ClientIdentity = {
  business_name: 'Acme Dental',
  domain: 'https://www.acme-dental.co.il',
  aliases: ['Acme'],
};

function makeObs(overrides: {
  mentioned?: boolean;
  rank?: number | null;
  citations?: string[];
  competitorCount?: number;
  outcome?: 'win' | 'partial' | 'loss';
  engine?: 'chatgpt' | 'gemini' | 'perplexity';
}): EngineProbeObservation {
  const {
    mentioned = false,
    rank = null,
    citations = [],
    competitorCount = 0,
    outcome = 'loss',
    engine = 'chatgpt',
  } = overrides;

  const competitors = Array.from({ length: competitorCount }, (_, i) => ({
    name: `Competitor ${i + 1}`,
    rank: i + 1,
  }));

  return {
    engine,
    retrieval_mode: 'live_web',
    raw_response: 'raw',
    detection: {
      mentioned,
      rank_position: rank ?? null,
      matched_text: mentioned ? 'Acme Dental' : null,
      mention_snippet: mentioned ? 'Acme Dental snippet' : null,
    },
    competitors,
    shape: { shape: 'ranked_listicle', outcome },
    citations,
  };
}

// ---------------------------------------------------------------------------
// Wilson CI tests
// ---------------------------------------------------------------------------

describe('wilsonInterval', () => {
  it('(4) n=0 → maximal uncertainty {low:0, high:1}', () => {
    const ci = wilsonInterval(0, 0);
    expect(ci.low).toBe(0);
    expect(ci.high).toBe(1);
  });

  it('(1) 4/5 → CI is reasonable (bounds in [0,1], low < high)', () => {
    const ci = wilsonInterval(4, 5);
    expect(ci.low).toBeGreaterThanOrEqual(0);
    expect(ci.high).toBeLessThanOrEqual(1);
    expect(ci.low).toBeLessThan(ci.high);
    // 4/5 = 80% — expect interval roughly around [0.45, 0.97] for 95% CI at small n
    expect(ci.low).toBeGreaterThan(0.3);
    expect(ci.high).toBeGreaterThan(0.8);
  });

  it('(2) 0/5 → CI biased toward low end, high < 1', () => {
    const ci = wilsonInterval(0, 5);
    expect(ci.low).toBe(0);
    expect(ci.high).toBeLessThan(0.6); // at n=5, Wilson for 0/5 gives high ≈ 0.52
    expect(ci.high).toBeGreaterThan(0);
  });

  it('(3) 5/5 → CI biased toward high end, low > 0', () => {
    const ci = wilsonInterval(5, 5);
    expect(ci.high).toBe(1);
    expect(ci.low).toBeGreaterThan(0.4); // at n=5, Wilson for 5/5 gives low ≈ 0.48
    expect(ci.low).toBeLessThan(1);
  });

  it('(5) CI widens at small n (monotonic widening)', () => {
    // Same proportion 3/5 vs 30/50 — smaller n should have wider CI
    const ci5 = wilsonInterval(3, 5);
    const ci50 = wilsonInterval(30, 50);
    const width5 = ci5.high - ci5.low;
    const width50 = ci50.high - ci50.low;
    expect(width5).toBeGreaterThan(width50);
  });

  it('(6) bounds clamped to [0,1]', () => {
    // Extreme case: 1/1 at z=3 might overflow without clamping
    const ci = wilsonInterval(1, 1, 3);
    expect(ci.low).toBeGreaterThanOrEqual(0);
    expect(ci.high).toBeLessThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// computeBand tests
// ---------------------------------------------------------------------------

describe('computeBand', () => {
  it('(7) presence-only drives point when position null', () => {
    // 3/5 presence → point = 60, no position bonus
    const band = computeBand(3, 5, null);
    expect(band.point).toBe(60);
  });

  it('(8) low_confidence=true when n<5', () => {
    const band = computeBand(2, 4, null);
    expect(band.low_confidence).toBe(true);
  });

  it('(9) low_confidence=false when n≥5', () => {
    const band = computeBand(3, 5, null);
    expect(band.low_confidence).toBe(false);
  });

  it('(10) CI present and ordered (ci_low ≤ ci_high)', () => {
    const band = computeBand(3, 10, null);
    expect(band.ci_low).toBeLessThanOrEqual(band.ci_high);
    expect(band.ci_low).toBeGreaterThanOrEqual(0);
    expect(band.ci_high).toBeLessThanOrEqual(100);
  });

  it('(11) position null handled gracefully (no bonus)', () => {
    const band = computeBand(4, 4, null);
    // presenceRate = 1.0, no position bonus → point = 100
    expect(band.point).toBe(100);
  });

  it('(12) position rank 1 gives higher point than position null at same presence', () => {
    const bandNoPos = computeBand(3, 5, null);
    const bandRank1 = computeBand(3, 5, 1);
    // Rank 1 should provide a positive bonus, increasing point
    expect(bandRank1.point).toBeGreaterThan(bandNoPos.point);
  });

  it('position rank 4+ gives no bonus', () => {
    const bandNoPos = computeBand(3, 5, null);
    const bandRank4 = computeBand(3, 5, 4);
    // Rank ≥4 → bonus = 0, same point as no position
    expect(bandRank4.point).toBe(bandNoPos.point);
  });

  it('band.sample_n matches n', () => {
    const band = computeBand(3, 7, null);
    expect(band.sample_n).toBe(7);
  });
});

// ---------------------------------------------------------------------------
// scoreEngine / scoreAllEngines tests
// ---------------------------------------------------------------------------

describe('scoreEngine', () => {
  it('(13) returns correct engine label', () => {
    const obs = [makeObs({ engine: 'gemini', mentioned: true, rank: 2, outcome: 'win' })];
    const subscore = scoreEngine('gemini', obs, IDENTITY, 'positive');
    expect(subscore.engine).toBe('gemini');
  });

  it('(16) sample_n matches observation count', () => {
    const obs = [makeObs({}), makeObs({}), makeObs({ mentioned: true, rank: 1, outcome: 'win' })];
    const subscore = scoreEngine('chatgpt', obs, IDENTITY, 'unknown');
    expect(subscore.sample_n).toBe(3);
  });

  it('sentiment annotation flows through without affecting band point', () => {
    const obs = [makeObs({ mentioned: true, rank: 1, outcome: 'win' })];
    const posSubscore = scoreEngine('chatgpt', obs, IDENTITY, 'positive');
    const negSubscore = scoreEngine('chatgpt', obs, IDENTITY, 'negative');
    // Band point must be identical regardless of sentiment (sequencing lock)
    expect(posSubscore.band.point).toBe(negSubscore.band.point);
    // But dimensions.sentiment differs
    expect(posSubscore.dimensions.sentiment).toBe('positive');
    expect(negSubscore.dimensions.sentiment).toBe('negative');
  });
});

describe('scoreAllEngines', () => {
  it('(14) returns one subscore per engine, never merged', () => {
    const chatgptObs = [makeObs({ engine: 'chatgpt', mentioned: true, rank: 1, outcome: 'win' })];
    const geminiObs = [makeObs({ engine: 'gemini', mentioned: false, outcome: 'loss' })];

    const subscores = scoreAllEngines(
      { chatgpt: chatgptObs, gemini: geminiObs },
      IDENTITY,
      { chatgpt: 'positive', gemini: 'unknown' },
    );

    expect(subscores).toHaveLength(2);
    const engines = subscores.map((s) => s.engine);
    expect(engines).toContain('chatgpt');
    expect(engines).toContain('gemini');
  });

  it('(15) two engines with different data stay distinct', () => {
    // chatgpt: all mentions; gemini: no mentions
    const chatgptObs = [
      makeObs({ engine: 'chatgpt', mentioned: true, rank: 1, outcome: 'win' }),
      makeObs({ engine: 'chatgpt', mentioned: true, rank: 2, outcome: 'win' }),
      makeObs({ engine: 'chatgpt', mentioned: true, rank: 1, outcome: 'win' }),
      makeObs({ engine: 'chatgpt', mentioned: true, rank: 2, outcome: 'win' }),
      makeObs({ engine: 'chatgpt', mentioned: true, rank: 1, outcome: 'win' }),
    ];
    const geminiObs = [
      makeObs({ engine: 'gemini', mentioned: false, outcome: 'loss' }),
      makeObs({ engine: 'gemini', mentioned: false, outcome: 'loss' }),
      makeObs({ engine: 'gemini', mentioned: false, outcome: 'loss' }),
      makeObs({ engine: 'gemini', mentioned: false, outcome: 'loss' }),
      makeObs({ engine: 'gemini', mentioned: false, outcome: 'loss' }),
    ];

    const subscores = scoreAllEngines(
      { chatgpt: chatgptObs, gemini: geminiObs },
      IDENTITY,
      { chatgpt: 'positive', gemini: 'unknown' },
    );

    const chatgptScore = subscores.find((s) => s.engine === 'chatgpt')!;
    const geminiScore = subscores.find((s) => s.engine === 'gemini')!;

    // chatgpt: 100% presence → band.point 100
    expect(chatgptScore.dimensions.presence).toBe(1);
    // gemini: 0% presence → band.point 0
    expect(geminiScore.dimensions.presence).toBe(0);
    expect(geminiScore.band.point).toBe(0);

    // They must remain distinct — no averaging
    expect(chatgptScore.band.point).toBeGreaterThan(geminiScore.band.point);
  });
});

// ---------------------------------------------------------------------------
// rerunVariance tests
// ---------------------------------------------------------------------------

describe('rerunVariance', () => {
  it('(17) SD≤5 → passesGate=true', () => {
    const result = rerunVariance([60, 62, 61, 63, 60]);
    expect(result.sd).toBeLessThanOrEqual(5);
    expect(result.passesGate).toBe(true);
  });

  it('(18) SD>5 → passesGate=false', () => {
    const result = rerunVariance([20, 80, 20, 80, 20]);
    expect(result.sd).toBeGreaterThan(5);
    expect(result.passesGate).toBe(false);
  });

  it('(19) empty array → {sd:0, mean:0, passesGate:true}', () => {
    const result = rerunVariance([]);
    expect(result).toEqual({ sd: 0, mean: 0, passesGate: true });
  });

  it('(20) identical points → sd=0, passesGate=true', () => {
    const result = rerunVariance([50, 50, 50, 50]);
    expect(result.sd).toBe(0);
    expect(result.mean).toBe(50);
    expect(result.passesGate).toBe(true);
  });

  it('mean is computed correctly', () => {
    const result = rerunVariance([10, 20, 30]);
    expect(result.mean).toBeCloseTo(20);
  });
});

// ---------------------------------------------------------------------------
// medianAcrossEngines tests
// ---------------------------------------------------------------------------

describe('medianAcrossEngines', () => {
  it('(23) empty → 0', () => {
    expect(medianAcrossEngines([])).toBe(0);
  });

  it('(21) odd count → middle value', () => {
    // Build 3 subscores with points 30, 50, 70
    const subscores = [30, 50, 70].map((point, _i) => ({
      engine: 'chatgpt' as const,
      band: { point, ci_low: point - 5, ci_high: point + 5, sample_n: 5, low_confidence: false },
      dimensions: {
        presence: 0.5,
        position: null,
        cited_as_source: 0,
        share_of_voice: 0,
        breadth: 0,
        sentiment: 'unknown' as const,
      },
      sample_n: 5,
    }));
    // Rename engines to avoid duplicates (doesn't matter for median)
    subscores[0]!.engine = 'chatgpt';
    subscores[1]!.engine = 'gemini';
    subscores[2]!.engine = 'perplexity';

    expect(medianAcrossEngines(subscores)).toBe(50);
  });

  it('(22) even count → rounded average of two middle values', () => {
    const subscores = [20, 40].map((point) => ({
      engine: 'chatgpt' as const,
      band: { point, ci_low: 0, ci_high: 100, sample_n: 5, low_confidence: false },
      dimensions: {
        presence: 0.5,
        position: null,
        cited_as_source: 0,
        share_of_voice: 0,
        breadth: 0,
        sentiment: 'unknown' as const,
      },
      sample_n: 5,
    }));
    subscores[1]!.engine = 'gemini';
    expect(medianAcrossEngines(subscores)).toBe(30);
  });
});
