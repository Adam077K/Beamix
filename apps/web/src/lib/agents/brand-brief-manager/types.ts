/**
 * Brand-Brief Manager Agent — Type Definitions
 *
 * The Brand-Brief Manager is the canonical store for every customer's voice,
 * ICP, service catalog, competitors, approval style, and hard-nos.
 * It never appears by name to customers — the customer sees "Beamix".
 */

import { z } from 'zod';
import type { BrandFingerprint } from '../discovery/types';

// ---------------------------------------------------------------------------
// ChangeSource — who/what caused a field change
// ---------------------------------------------------------------------------
export const CHANGE_SOURCE_VALUES = [
  'discovery',
  'customer_edit',
  'customer_correction_signal',
  'strategy_review',
  'adam_manual',
  'system_inferred',
] as const;

export type ChangeSource = (typeof CHANGE_SOURCE_VALUES)[number];

// ---------------------------------------------------------------------------
// FieldDiff — a single field change in a version diff
// ---------------------------------------------------------------------------
export interface FieldDiff {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  reason: string;
  changeSource: ChangeSource;
  /** Confidence score — system_inferred diffs require ≥0.85 or go to proposed_changes. */
  confidence: number;
}

// ---------------------------------------------------------------------------
// NewSignal — an incoming update signal for the Brand-Brief Manager
// ---------------------------------------------------------------------------
export type NewSignal =
  | {
      kind: 'customer_edit';
      /** Raw text or structured edit from the customer. */
      editPayload: Record<string, unknown>;
      customerId: string;
    }
  | {
      kind: 'customer_correction_signal';
      /** Rejection reason from an approval-gate item. */
      rejectionReason: string;
      /** Which content item was rejected. */
      contentItemId: string;
      customerId: string;
    }
  | {
      kind: 'strategy_review';
      /** Structured output from the Strategy Agent monthly review. */
      strategyPayload: Record<string, unknown>;
      customerId: string;
    }
  | {
      kind: 'adam_manual';
      /** Adam's direct edit to the brief. */
      editPayload: Record<string, unknown>;
      customerId: string;
    };

// ---------------------------------------------------------------------------
// BrandBrief — the canonical brief (superset of BrandFingerprint)
// Stored in brand_briefs table (Wave 2 migration). Wave 1 uses brand_fingerprints.
// ---------------------------------------------------------------------------
export interface BrandBrief {
  brandBriefId: string;
  customerId: string;
  version: number;
  status: 'draft' | 'canonical_v1' | `canonical_v${number}`;
  /** The full fingerprint data. */
  data: BrandFingerprint;
  /** Human-readable diff from the previous version. */
  diff: FieldDiff[];
  changeSource: ChangeSource;
  changedAt: string;
  /** True when any YMYL field was changed — triggers human review gate. */
  ymylFieldChanged: boolean;
  diffSynthesisFailed: boolean;
}

// ---------------------------------------------------------------------------
// ManagerOperation — what the Brand-Brief Manager did on each call
// ---------------------------------------------------------------------------
export type ManagerOperation = 'seed' | 'evolve' | 'drift_check';

// ---------------------------------------------------------------------------
// ManagerResult — structured output from evolveBrandBrief()
// ---------------------------------------------------------------------------
export interface ManagerResult {
  operation: ManagerOperation;
  brandBriefId: string;
  newVersionId: string;
  diff: FieldDiff[];
  eventsToEmit: string[];
  /** True when the diff could not be synthesised and the raw edit was stored. */
  diffSynthesisFailed: boolean;
  /** True when a YMYL field was changed — human approval required. */
  requiresHumanApproval: boolean;
}

// ---------------------------------------------------------------------------
// DiffSynthesisInput — passed to the LLM diff synthesiser
// ---------------------------------------------------------------------------
export interface DiffSynthesisInput {
  currentBrief: BrandFingerprint;
  signal: NewSignal;
}

// ---------------------------------------------------------------------------
// Zod schema for LLM diff output validation
// ---------------------------------------------------------------------------
export const DiffOutputSchema = z.object({
  diffs: z.array(
    z.object({
      field: z.string(),
      old_value: z.unknown(),
      new_value: z.unknown(),
      reason: z.string(),
      confidence: z.number().min(0).max(1),
    }),
  ),
  requires_human_approval: z.boolean(),
  summary: z.string().max(500),
});

export type DiffOutput = z.infer<typeof DiffOutputSchema>;
