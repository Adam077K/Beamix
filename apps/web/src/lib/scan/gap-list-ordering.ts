/**
 * gap-list-ordering.ts — Contrastive gap-list ordering for Wave 6.
 *
 * Core contract (SCAN-MEASUREMENT-MODEL.md §2 — the honesty spine):
 *
 *   CONTRASTIVE ORDERING: a gap ranks higher when AUDITED COMPETITORS have the factor
 *   PRESENT and the client has it ABSENT. contrastive_count is the PRIMARY sort key.
 *   Ordering by impact_weight alone = "rebranded SEO checklist" — explicitly forbidden.
 *
 *   HONESTY SPINE: every gap's ranking reason is FACT/OBSERVATION class.
 *   BANNED language: "you're invisible BECAUSE X", "doing X WILL raise your score Y%".
 *   All evidence strings state observed facts only.
 *
 *   TIER-3 HYGIENE TAIL: factors with promises_lift=false (llms_txt, schema_beyond_basics,
 *   backlinks_dr) always sort BELOW all lift-promising gaps regardless of contrastive_count
 *   or impact_weight. They are hygiene, never "do this to win".
 *
 *   HONEST FALLBACK: when competitorAudits is empty (no audits available), ordering falls
 *   back to impact_weight × fixability and annotates every gap with ordering_mode='impact_fallback'.
 *   No fake contrastive signal is generated.
 *
 *   pending/unknown ≠ gap: only status==='absent' is a real gap. present/unknown/pending
 *   are excluded before any ordering.
 */

import type { GapListItem } from './factor-catalog';
import type { CompetitorFactorAudit, RankedGap } from './gap-types';
import { getFixability } from './fixability';

// ---------------------------------------------------------------------------
// buildContrastiveGapList
// ---------------------------------------------------------------------------

/**
 * Builds a contrastively-ordered ranked gap list from the client's absent factors
 * and the audited competitor observations.
 *
 * @param clientGaps       - Output of buildGapList() from factor-catalog.ts.
 *                           May contain any status; only 'absent' rows become RankedGaps.
 * @param competitorAudits - One CompetitorFactorAudit per audited competitor.
 *                           Empty array = honest fallback mode (no contrastive signal).
 * @param opts.now         - ISO 8601 timestamp override for deterministic tests.
 *                           Defaults to new Date().toISOString().
 */
export function buildContrastiveGapList(
  clientGaps: GapListItem[],
  competitorAudits: CompetitorFactorAudit[],
  opts?: { now?: string },
): RankedGap[] {
  // Unused in v1 but reserved for future TTL / staleness checks on audits.
  void opts?.now;

  // ── Step 1: Filter to real gaps only (status === 'absent') ─────────────────
  //
  // pending = "we haven't checked yet, not a confirmed gap"
  // unknown = "data unavailable, cannot confirm"
  // present = not a gap
  // Only 'absent' = externally-verified, FACT-class gap.
  const absentGaps = clientGaps.filter((g) => g.status === 'absent');

  if (absentGaps.length === 0) {
    return [];
  }

  // ── Step 2: Determine ordering mode ────────────────────────────────────────
  const orderingMode: 'contrastive' | 'impact_fallback' =
    competitorAudits.length > 0 ? 'contrastive' : 'impact_fallback';

  // ── Step 3: Build a competitor-presence index ───────────────────────────────
  //
  // competitorPresence[factor_key] = names of competitors with status==='present'
  // We compute this once up-front to avoid O(n²) inner loops.
  const competitorPresence = new Map<string, string[]>();

  if (orderingMode === 'contrastive') {
    for (const audit of competitorAudits) {
      for (const obs of audit.observations) {
        if (obs.status === 'present') {
          const existing = competitorPresence.get(obs.factor_key) ?? [];
          existing.push(audit.competitor_name);
          competitorPresence.set(obs.factor_key, existing);
        }
      }
    }
  }

  // ── Step 4: Enrich each gap with contrastive + fixability data ──────────────
  const enriched = absentGaps.map((gap) => {
    const competitorsWithFactor = competitorPresence.get(gap.factor_key) ?? [];
    const contrastiveCount = competitorsWithFactor.length;
    const totalAudited = competitorAudits.length;
    const { fixability, effort_score } = getFixability(gap.factor_key);

    // Contrastive evidence string — FACT-class only, no hypothesis language.
    let contrastiveEvidence: string;
    if (orderingMode === 'impact_fallback') {
      // No audit data available at all — explicit degraded mode annotation.
      contrastiveEvidence = `Ordered by impact (no competitor comparison available this scan)`;
    } else if (contrastiveCount === 0) {
      // Contrastive mode but no audited competitor has it either.
      // Honest: don't imply this is important just because we audited competitors.
      contrastiveEvidence = `No audited competitor has ${gap.display_name} either — lower priority`;
    } else {
      // The primary signal: k of n competitors have it and you don't.
      // State observed facts only: "{k} of {n} named competitors have {display_name}; you don't"
      contrastiveEvidence = `${contrastiveCount} of ${totalAudited} named competitors have ${gap.display_name}; you don't`;
    }

    return {
      gap,
      contrastiveCount,
      competitorsWithFactor,
      contrastiveEvidence,
      fixability,
      effort_score,
    };
  });

  // ── Step 5: Sort ────────────────────────────────────────────────────────────
  //
  // TIER-3 HYGIENE TAIL RULE (applied first in comparator, before everything else):
  //   All Tier-3 (promises_lift===false) gaps sort AFTER all lift-promising gaps.
  //   Within the hygiene tail, the same contrastive/impact ordering applies.
  //
  // CONTRASTIVE MODE sort order (within lift-promises / hygiene buckets):
  //   1. Primary:   contrastive_count DESC (more competitors with it = more important gap)
  //   2. Secondary: impact_weight DESC (tiebreak by catalog-estimated signal strength)
  //   3. Tertiary:  effort_score ASC (cheap wins surface on ties — same delta, easier fix)
  //   4. Stable:    tier ASC, factor_key ASC (deterministic; no ordering surprises)
  //
  // IMPACT_FALLBACK MODE sort order (same bucket rules, no contrastive signal):
  //   1. Primary:   impact_weight DESC
  //   2. Secondary: effort_score ASC
  //   3. Stable:    tier ASC, factor_key ASC
  //
  // WHY THIS ORDER:
  //   - Contrastive count is the product's core claim. A low-impact gap that 3 competitors
  //     have is more actionable than a high-impact gap nobody has — it's an observed delta,
  //     not a vendor estimate.
  //   - impact_weight is a secondary tiebreak because it provides a reasonable prior when
  //     two gaps have the same contrastive signal.
  //   - effort_score as tertiary surfaces "same gap, cheaper fix" — rational for agents.
  //   - Deterministic tie-break (tier + factor_key) ensures tests are stable.

  enriched.sort((a, b) => {
    // Rule 1: hygiene tail — promises_lift=false always after promises_lift=true.
    const aIsHygiene = !a.gap.promises_lift;
    const bIsHygiene = !b.gap.promises_lift;
    if (aIsHygiene !== bIsHygiene) {
      return aIsHygiene ? 1 : -1; // hygiene sinks to tail
    }

    if (orderingMode === 'contrastive') {
      // Rule 2a: contrastive_count DESC
      if (b.contrastiveCount !== a.contrastiveCount) {
        return b.contrastiveCount - a.contrastiveCount;
      }
    }

    // Rule 2b (impact_fallback) / Rule 3 (contrastive tiebreak): impact_weight DESC
    if (b.gap.impact_weight !== a.gap.impact_weight) {
      return b.gap.impact_weight - a.gap.impact_weight;
    }

    // Rule 4: effort_score ASC (cheaper fix surfaces first on ties)
    if (a.effort_score !== b.effort_score) {
      return a.effort_score - b.effort_score;
    }

    // Rule 5: tier ASC (lower tier = more proven = prefer first)
    if (a.gap.tier !== b.gap.tier) {
      return a.gap.tier - b.gap.tier;
    }

    // Rule 6: factor_key ASC (lexicographic — fully deterministic)
    return a.gap.factor_key.localeCompare(b.gap.factor_key);
  });

  // ── Step 6: Assign 1-based rank and build RankedGap[] ──────────────────────
  return enriched.map((item, idx): RankedGap => ({
    factor_key: item.gap.factor_key,
    display_name: item.gap.display_name,
    tier: item.gap.tier,
    impact_weight: item.gap.impact_weight,
    playbook_id: item.gap.playbook_id,
    promises_lift: item.gap.promises_lift,
    contrastive_count: item.contrastiveCount,
    competitors_with_factor: item.competitorsWithFactor,
    contrastive_evidence: item.contrastiveEvidence,
    fixability: item.fixability,
    effort_score: item.effort_score,
    rank: idx + 1,
    ordering_mode: orderingMode,
  }));
}

// ---------------------------------------------------------------------------
// splitLiftVsHygiene
// ---------------------------------------------------------------------------

/**
 * Splits a ranked gap list into lift-promising gaps and hygiene-only gaps.
 *
 * lift    = promises_lift === true  (Tier 1 + Tier 2 factors)
 * hygiene = promises_lift === false (Tier 3 factors: llms_txt, schema_beyond_basics, backlinks_dr)
 *
 * Ranks are preserved from the input. The split is deterministic and purely
 * based on promises_lift — it does NOT re-rank.
 *
 * Intended consumers:
 *   - UI: separate "fix these to win" section from "hygiene checklist"
 *   - Narration (Worker 2): generate different copy for each bucket
 *   - Agent dispatch: only lift gaps are sent to agent playbooks as priority work
 */
export function splitLiftVsHygiene(ranked: RankedGap[]): {
  lift: RankedGap[];
  hygiene: RankedGap[];
} {
  const lift: RankedGap[] = [];
  const hygiene: RankedGap[] = [];

  for (const gap of ranked) {
    if (gap.promises_lift) {
      lift.push(gap);
    } else {
      hygiene.push(gap);
    }
  }

  return { lift, hygiene };
}
