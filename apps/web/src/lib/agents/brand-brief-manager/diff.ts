/**
 * Brand-Brief Manager Agent — Diff Helper
 *
 * Utilities for computing, validating, and applying brand brief diffs.
 * The brief_evolution_log table lands in Wave 2 — this module is the
 * foundation that Wave 2 will wire to Supabase.
 *
 * Key rules enforced here:
 * - YMYL fields can only be changed by customer_edit or adam_manual sources.
 * - system_inferred diffs require confidence ≥ 0.85.
 * - Customer/Adam intent cannot be overwritten by system_inferred.
 */

import { randomUUID } from 'crypto';
import type { FieldDiff, ChangeSource } from './types';
import type { BrandFingerprint } from '../discovery/types';

// ---------------------------------------------------------------------------
// YMYL-protected field paths — system inference is BLOCKED for these
// ---------------------------------------------------------------------------
const YMYL_PROTECTED_FIELDS: ReadonlySet<string> = new Set([
  'approval_style.ymyl_override',
  'hard_nos.topics',
  'hard_nos.claims',
  'hard_nos.competitors_to_never_compare',
]);

// ---------------------------------------------------------------------------
// Minimum confidence for system_inferred diffs
// ---------------------------------------------------------------------------
const SYSTEM_INFERRED_MIN_CONFIDENCE = 0.85;

// ---------------------------------------------------------------------------
// Source priority — higher means stronger intent protection
// ---------------------------------------------------------------------------
const SOURCE_PRIORITY: Record<ChangeSource, number> = {
  adam_manual: 4,
  customer_edit: 3,
  strategy_review: 2,
  customer_correction_signal: 2,
  system_inferred: 1,
  discovery: 0,
};

export interface DiffValidationResult {
  /** Diffs that passed validation and can be applied. */
  approved: FieldDiff[];
  /** Diffs blocked by YMYL or intent protection — queued for human review. */
  blocked: Array<{ diff: FieldDiff; reason: string }>;
  /** Whether human approval is required for any blocked diff. */
  requiresHumanApproval: boolean;
}

/**
 * Validate a set of proposed diffs against business rules.
 * Returns approved diffs and blocked diffs with reasons.
 */
export function validateDiffs(
  diffs: FieldDiff[],
  currentBrief: BrandFingerprint,
  incomingSource: ChangeSource,
): DiffValidationResult {
  const approved: FieldDiff[] = [];
  const blocked: Array<{ diff: FieldDiff; reason: string }> = [];

  for (const diff of diffs) {
    // Rule 1: YMYL fields — only customer_edit or adam_manual
    if (YMYL_PROTECTED_FIELDS.has(diff.field) && incomingSource === 'system_inferred') {
      blocked.push({
        diff,
        reason: `YMYL-protected field "${diff.field}" cannot be changed by system_inferred source`,
      });
      continue;
    }

    // Rule 2: system_inferred confidence floor
    if (incomingSource === 'system_inferred' && diff.confidence < SYSTEM_INFERRED_MIN_CONFIDENCE) {
      blocked.push({
        diff,
        reason: `system_inferred confidence ${diff.confidence} below minimum ${SYSTEM_INFERRED_MIN_CONFIDENCE} for field "${diff.field}"`,
      });
      continue;
    }

    // Rule 3: Customer/Adam intent protection
    // Check if the current brief field was last set by a higher-priority source.
    // We use the evidence_links map as a proxy for the last source.
    // A full implementation tracks source-per-field in a metadata column.
    const lastSource = getLastKnownSourceForField(diff.field, currentBrief);
    if (
      lastSource &&
      SOURCE_PRIORITY[lastSource] > SOURCE_PRIORITY[incomingSource]
    ) {
      blocked.push({
        diff,
        reason: `Field "${diff.field}" was last set by "${lastSource}" (priority ${SOURCE_PRIORITY[lastSource]}) — cannot overwrite with "${incomingSource}" (priority ${SOURCE_PRIORITY[incomingSource]})`,
      });
      continue;
    }

    approved.push(diff);
  }

  const requiresHumanApproval = blocked.length > 0;

  return { approved, blocked, requiresHumanApproval };
}

/**
 * Apply a set of approved diffs to a brief, returning a new brief object.
 * Does NOT write to the database — the caller (index.ts) handles persistence.
 */
export function applyDiffs(
  currentBrief: BrandFingerprint,
  diffs: FieldDiff[],
  newVersionId: string,
): BrandFingerprint {
  // Deep clone to avoid mutation
  const updated = JSON.parse(JSON.stringify(currentBrief)) as BrandFingerprint;

  for (const diff of diffs) {
    // Set nested field by dot-path (e.g. "voice.tone_descriptors")
    setNestedField(updated, diff.field, diff.newValue);
  }

  // Always update brief_version_id on any change
  updated.brief_version_id = newVersionId;

  return updated;
}

/**
 * Generate a new version ID for a brief update.
 */
export function generateVersionId(): string {
  return randomUUID();
}

/**
 * Build a human-readable evolution log entry.
 * Wave 2 will insert this into the brief_evolution_log table.
 */
export interface EvolutionLogEntry {
  id: string;
  customerId: string;
  oldVersionId: string;
  newVersionId: string;
  diffs: FieldDiff[];
  changeSource: ChangeSource;
  changedAt: string;
  requiresHumanApproval: boolean;
}

export function buildEvolutionLogEntry(
  customerId: string,
  oldVersionId: string,
  newVersionId: string,
  diffs: FieldDiff[],
  changeSource: ChangeSource,
  requiresHumanApproval: boolean,
): EvolutionLogEntry {
  return {
    id: randomUUID(),
    customerId,
    oldVersionId,
    newVersionId,
    diffs,
    changeSource,
    changedAt: new Date().toISOString(),
    requiresHumanApproval,
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Attempt to determine the last known source for a field.
 * Uses evidence_links as a proxy. Returns null if unknown.
 */
function getLastKnownSourceForField(
  fieldPath: string,
  brief: BrandFingerprint,
): ChangeSource | null {
  const topLevel = fieldPath.split('.')[0];
  const evidenceValue = brief.evidence_links[fieldPath] ?? brief.evidence_links[topLevel ?? ''];

  if (!evidenceValue) return null;

  // Map evidence source prefixes to ChangeSource values
  if (evidenceValue.startsWith('customer_edit:')) return 'customer_edit';
  if (evidenceValue.startsWith('adam_manual:')) return 'adam_manual';
  if (evidenceValue.startsWith('strategy_review:')) return 'strategy_review';
  if (evidenceValue.startsWith('system_inferred:')) return 'system_inferred';
  if (evidenceValue.startsWith('transcript:')) return 'discovery';

  return null;
}

/**
 * Set a value at a dot-path in an object, mutating in place.
 * Handles up to 3 levels deep (e.g. "voice.tone_descriptors").
 */
function setNestedField(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.');
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (!key) continue;
    if (
      current[key] === null ||
      current[key] === undefined ||
      typeof current[key] !== 'object'
    ) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }

  const lastKey = parts[parts.length - 1];
  if (lastKey) {
    current[lastKey] = value;
  }
}
