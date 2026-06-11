/**
 * gap-types.ts — Type definitions for Wave 6 contrastive gap-list ordering and agent
 * playbook mapping.
 *
 * All types here are the contract between:
 *   - gap-list-ordering.ts  (producer — builds RankedGap[])
 *   - playbook-mapping.ts   (consumer — groups by PlaybookAssignment)
 *   - narration layer       (Wave 6 Worker 2 — reads RankedGap for evidence strings)
 *   - UI / W7               (reads RankedGap + PlaybookAssignment)
 *
 * Import base types from their canonical locations; do NOT redefine.
 */

// Re-export the base types used downstream so importers can get everything from one import.
export type { FactorObservation } from './factor-detection';
export type { GapListItem } from './factor-catalog';
export type { CompetitorMention } from './measurement-types';

// ---------------------------------------------------------------------------
// AgentPlaybookId — the 4 canonical agent enum values from the factor_catalog seed.
//
// These EXACTLY match the playbook_id values in migration 20260608000002.
// Spec §3: "No enum migration for MVP."
// ---------------------------------------------------------------------------

export type AgentPlaybookId =
  | 'content_optimizer'
  | 'schema_generator'
  | 'review_presence_planner'
  | 'reddit_presence_planner';

// ---------------------------------------------------------------------------
// CompetitorFactorAudit — the L1 audit result for ONE audited competitor.
//
// The actual auditing (fetching competitor sites) is wired in a later wave.
// This layer RECEIVES audits as input — the shape must be stable now so
// contrastive ordering can accept real data when wiring lands.
// ---------------------------------------------------------------------------

import type { FactorObservation } from './factor-detection';

export interface CompetitorFactorAudit {
  /** The competitor's display name as the AI engine named it, e.g. "Acme Dental" */
  competitor_name: string;
  /** Full domain with or without protocol, e.g. "acme-dental.com" */
  domain: string;
  /** One FactorObservation per factor_key for this competitor. */
  observations: FactorObservation[];
}

// ---------------------------------------------------------------------------
// RankedGap — the core gap-list unit after contrastive ordering.
//
// A RankedGap is ALWAYS a client gap (factor status === 'absent').
// Fields are flat for easy narration template substitution.
// ---------------------------------------------------------------------------

export interface RankedGap {
  /** The catalog factor_key, e.g. "review_systems" */
  factor_key: string;
  /** Human-readable name from the catalog, e.g. "Review Systems" */
  display_name: string;
  /** Catalog tier: 1 (Proven), 2 (Likely), 3 (Hygiene) */
  tier: number;
  /**
   * Catalog impact weight (0-1).
   * SECONDARY sort key only — contrastive_count is always the primary sort key.
   * Using impact_weight alone would reduce this to a "rebranded SEO checklist"
   * (SCAN-MEASUREMENT-MODEL.md §2 honesty spine).
   */
  impact_weight: number;
  /**
   * Agent playbook that can address this gap, or null when no agent covers it
   * (manual / earned media — these are the ~20% not covered by the 4 enums).
   */
  playbook_id: string | null;
  /**
   * Whether this gap's playbook promises a measurable lift.
   * Always false for Tier-3 factors (DB constraint enforces this at the source).
   * Tier-3 gaps are hygiene — they must never appear in "do this to win" head copy.
   */
  promises_lift: boolean;
  /**
   * Contrastive count: how many of the audited competitors have this factor PRESENT
   * while the client has it ABSENT.
   *
   * This is the PRIMARY ordering signal: a gap that 3 competitors have beats a gap
   * that nobody has, regardless of impact_weight.
   *
   * 0 in contrastive mode = "no audited competitor has it either" (lower priority).
   * 0 in impact_fallback mode = competitorAudits was empty (no audit available).
   */
  contrastive_count: number;
  /**
   * Names of the audited competitors that have this factor present.
   * Empty array when contrastive_count === 0.
   * Used directly in narration evidence strings.
   */
  competitors_with_factor: string[];
  /**
   * FACT-class evidence string for narration / UI display.
   *
   * Contrastive mode (k > 0): "{k} of {n} named competitors have {display_name}; you don't"
   * Contrastive mode (k = 0): "No audited competitor has {display_name} either — lower priority"
   * Impact-fallback mode:     "Ordered by impact (no competitor comparison available this scan)"
   *
   * HONESTY SPINE: HYPOTHESIS language is BANNED here. No "you're invisible BECAUSE X",
   * no "doing X WILL raise your score Y%". Only observed facts.
   */
  contrastive_evidence: string;
  /**
   * How fast/cheap this gap is to fix.
   * Derived from FIXABILITY_MAP in fixability.ts.
   * ASC effort_score is a tertiary tiebreaker so cheap wins surface on ties.
   */
  fixability: 'fast' | 'medium' | 'slow';
  /**
   * Numeric effort cost: lower = cheaper to fix.
   * fast = 1, medium = 2, slow = 3 (coarse), or a finer 1-10 scale per fixability.ts.
   * ASC tiebreaker within the same contrastive_count and impact_weight band.
   */
  effort_score: number;
  /**
   * 1-based final order after sorting.
   * rank 1 = the single most important gap to address.
   */
  rank: number;
  /**
   * Whether contrastive competitor data was available for this ordering.
   * 'contrastive'     — competitorAudits.length > 0; ordering by competitor delta.
   * 'impact_fallback' — no audits; ordering by impact_weight + effort (degraded mode).
   *
   * Narration must surface this to users when 'impact_fallback' so they understand
   * the ordering is not yet backed by competitor observations.
   */
  ordering_mode: 'contrastive' | 'impact_fallback';
}

// ---------------------------------------------------------------------------
// PlaybookAssignment — groups RankedGaps by their agent playbook.
//
// playbook_id === null = manual/earned work, no agent covers it.
// ---------------------------------------------------------------------------

export interface PlaybookAssignment {
  /**
   * Agent playbook identifier, or null for the "no agent" group.
   * null gaps are manual/earned (the ~20% not covered by the 4 enums).
   */
  playbook_id: AgentPlaybookId | null;
  /**
   * All ranked gaps assigned to this playbook, in their final rank order.
   * Ordered by best (lowest) rank ascending so the first item is the highest-priority
   * gap for that agent.
   */
  gaps: RankedGap[];
}
