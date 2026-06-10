/**
 * Wave 5 — Band computation, per-engine subscores, and variance gate.
 *
 * SEQUENCING LOCK (SCAN-MEASUREMENT-MODEL.md §1):
 *   The headline Band is computed from PRESENCE + POSITION only.
 *   Shape outcome and sentiment are annotations — they do NOT enter Band math.
 *
 * PER-ENGINE TRUTH (SCAN-MEASUREMENT-MODEL.md §9):
 *   scoreAllEngines() returns an array of EngineSubscore — one per engine.
 *   Engines are NEVER averaged into a single cross-engine truth.
 *   medianAcrossEngines() is provided as a clearly-labeled secondary display value only.
 *
 * WILSON CI:
 *   Applied to the presence proportion (successes / n).
 *   n < 5 → low_confidence = true (below the weekly-deep threshold, CI is unreliable).
 *   n = 0 → { low: 0, high: 1 } (maximal uncertainty — we know nothing).
 *
 * VARIANCE GATE:
 *   rerunVariance() computes population SD over repeated point scores.
 *   passesGate = SD ≤ 5 (per SCAN-ORCHESTRATION.md variance gate).
 *   IMPORTANT: callers MUST feed cache-OFF reruns only.
 *   Cached reruns produce identical scores → fake zero variance.
 */

import type {
  Band,
  ClientIdentity,
  DimensionScores,
  EngineProbeObservation,
  EngineSubscore,
  WilsonCI,
} from './measurement-types';
import { computeDimensions } from './dimensions';

// ---------------------------------------------------------------------------
// Wilson score interval
// ---------------------------------------------------------------------------

/**
 * Compute the Wilson score confidence interval for a proportion.
 *
 * Standard formula: p̃ ± (z²/2n ± z·√(p(1-p)/n + z²/4n²)) / (1 + z²/n)
 * where p̃ = (successes + z²/2) / (n + z²)
 *
 * Guards:
 *   n = 0 → { low: 0, high: 1 } (maximal uncertainty — no information).
 *   Bounds clamped to [0, 1].
 *
 * @param successes  Number of successes (e.g. observations where client is mentioned).
 * @param n          Total number of observations.
 * @param z          z-score for the confidence level. Default 1.96 (95% CI).
 */
export function wilsonInterval(successes: number, n: number, z = 1.96): WilsonCI {
  if (n === 0) {
    // No data: maximal uncertainty.
    return { low: 0, high: 1 };
  }

  const p = successes / n;
  const z2 = z * z;
  const denominator = 1 + z2 / n;
  const centre = (p + z2 / (2 * n)) / denominator;
  const margin = (z / denominator) * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n));

  const low = Math.max(0, centre - margin);
  const high = Math.min(1, centre + margin);

  return { low, high };
}

// ---------------------------------------------------------------------------
// Band computation
// ---------------------------------------------------------------------------

/**
 * Compute the headline Band from presence + position.
 *
 * WHAT THE BAND REPRESENTS:
 *   point      — Presence rate scaled to 0–100, with a bounded upward nudge
 *                when the client consistently ranks in the top 3 positions.
 *                Formula: point = presenceRate × 100 + positionBonus (capped at 100).
 *
 *                Position bonus: if position != null, bonus = max(0, (4 - position) / 3 × 10).
 *                This gives +10 for rank 1, +6.7 for rank 2, +3.3 for rank 3, 0 for rank ≥4.
 *                The bonus is presence-dominated: a 0% presence rate still yields point = 0
 *                regardless of position (there are no ranked mentions when not present).
 *
 *                The key rule: ONLY presence + position feed this formula.
 *                Shape, sentiment, and breadth are NOT included.
 *
 *   ci_low     — Wilson CI lower bound for the presence proportion, scaled ×100.
 *   ci_high    — Wilson CI upper bound for the presence proportion, scaled ×100.
 *
 *                The CI is always on the presence proportion — it does NOT incorporate the
 *                position nudge. This is intentionally conservative and honest: the CI
 *                represents what we can statistically claim about presence, not the composite
 *                point estimate.
 *
 *   sample_n   — Number of observations.
 *   low_confidence — true when sample_n < 5 (below weekly-deep threshold, CI is unreliable).
 *
 * @param presenceSuccesses  Number of observations where the client is mentioned.
 * @param n                  Total number of observations.
 * @param position           Mean rank_position across ranked observations, or null.
 */
export function computeBand(
  presenceSuccesses: number,
  n: number,
  position: number | null,
): Band {
  const presenceRate = n > 0 ? presenceSuccesses / n : 0;

  // Position bonus: awarded only when ranked in top 3.
  // bonus = max(0, (4 - position) / 3 × 10), capped to avoid inflating beyond presence.
  // When not ranked (null), bonus = 0.
  let positionBonus = 0;
  if (position !== null && position >= 1 && position <= 3) {
    positionBonus = Math.max(0, ((4 - position) / 3) * 10);
  }

  const rawPoint = presenceRate * 100 + positionBonus;
  const point = Math.min(100, Math.max(0, Math.round(rawPoint)));

  // Wilson CI on the presence proportion, scaled to 0–100.
  const ci = wilsonInterval(presenceSuccesses, n);
  const ci_low = Math.round(ci.low * 100);
  const ci_high = Math.round(ci.high * 100);

  return {
    point,
    ci_low,
    ci_high,
    sample_n: n,
    low_confidence: n < 5,
  };
}

// ---------------------------------------------------------------------------
// Per-engine scoring
// ---------------------------------------------------------------------------

/**
 * Compute a single EngineSubscore for one engine's observation set.
 *
 * @param engine        The engine identifier.
 * @param observations  All observations for this engine (one engine's slice only).
 * @param identity      The client identity.
 * @param sentiment     Pre-judged sentiment for this engine (from judgeSentiment).
 *                      'unknown' when no mentions or judge could not decide.
 */
export function scoreEngine(
  engine: 'chatgpt' | 'gemini' | 'perplexity',
  observations: EngineProbeObservation[],
  identity: ClientIdentity,
  sentiment: DimensionScores['sentiment'],
): EngineSubscore {
  const n = observations.length;
  const presenceSuccesses = observations.filter((o) => o.detection.mentioned).length;

  const dims = computeDimensions(observations, identity, sentiment);
  const band = computeBand(presenceSuccesses, n, dims.position);

  return {
    engine,
    band,
    dimensions: dims,
    sample_n: n,
  };
}

/**
 * Compute per-engine subscores for all engines.
 *
 * Returns one EngineSubscore per engine — NEVER merged or averaged.
 * Each engine is independent truth.
 *
 * @param observationsByEngine  A record mapping each engine to its observations.
 * @param identity              The client identity.
 * @param sentimentByEngine     Pre-judged sentiment keyed by engine.
 */
export function scoreAllEngines(
  observationsByEngine: Partial<Record<'chatgpt' | 'gemini' | 'perplexity', EngineProbeObservation[]>>,
  identity: ClientIdentity,
  sentimentByEngine: Partial<Record<'chatgpt' | 'gemini' | 'perplexity', DimensionScores['sentiment']>>,
): EngineSubscore[] {
  const engines = Object.keys(observationsByEngine) as Array<
    'chatgpt' | 'gemini' | 'perplexity'
  >;

  return engines.map((engine) => {
    const obs = observationsByEngine[engine] ?? [];
    const sentiment = sentimentByEngine[engine] ?? 'unknown';
    return scoreEngine(engine, obs, identity, sentiment);
  });
}

// ---------------------------------------------------------------------------
// Variance gate
// ---------------------------------------------------------------------------

/**
 * Compute population standard deviation over a set of repeated point scores,
 * and determine whether the variance gate passes.
 *
 * IMPORTANT: Feed cache-OFF reruns only.
 * Cached reruns produce identical scores → fake zero variance → gate always passes.
 * (Per SCAN-ORCHESTRATION.md variance gate: "SD≤5 measured cache-OFF".)
 *
 * passesGate = SD ≤ 5.
 *
 * @param points  Array of Band.point values from cache-OFF reruns of the same query.
 */
export function rerunVariance(points: number[]): {
  sd: number;
  mean: number;
  passesGate: boolean;
} {
  if (points.length === 0) {
    return { sd: 0, mean: 0, passesGate: true };
  }

  const mean = points.reduce((sum, p) => sum + p, 0) / points.length;
  const variance =
    points.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / points.length;
  const sd = Math.sqrt(variance);

  return {
    sd,
    mean,
    passesGate: sd <= 5,
  };
}

// ---------------------------------------------------------------------------
// Optional labeled secondary
// ---------------------------------------------------------------------------

/**
 * Compute the median Band.point across all per-engine subscores.
 *
 * SECONDARY DISPLAY VALUE ONLY — NOT the cross-engine truth.
 * Per-engine subscores are the unit of truth (SCAN-MEASUREMENT-MODEL.md §9).
 * This is provided for display convenience (e.g. a single headline number in a
 * summary card). Never replace per-engine subscores with this value.
 *
 * @param subscores  Per-engine subscores from scoreAllEngines().
 */
export function medianAcrossEngines(subscores: EngineSubscore[]): number {
  if (subscores.length === 0) return 0;

  const sorted = subscores.map((s) => s.band.point).sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return Math.round(((sorted[mid - 1]!) + (sorted[mid]!)) / 2);
  }

  return sorted[mid]!;
}
