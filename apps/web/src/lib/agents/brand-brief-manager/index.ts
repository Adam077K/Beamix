/**
 * Brand-Brief Manager Agent — Main Entry Point
 *
 * Exports `evolveBrandBrief()` — an async function that accepts the current
 * canonical BrandBrief and an incoming NewSignal, runs LLM diff synthesis
 * (Haiku 4.5 — structured comparison, not creative), validates diffs against
 * business rules, and returns an updated BrandBrief + ManagerResult.
 *
 * Architecture:
 *   - Anthropic SDK (non-streaming) with Haiku 4.5
 *   - Stable system prompt cached with cache_control: ephemeral
 *   - YMYL detection: any YMYL signal or blocked YMYL diff → requires_human_approval
 *   - Cost alert: console.error when call exceeds $2.00
 *   - Never names the agent in output content; customer-facing voice is "Beamix"
 *
 * Wave 1: persistence (brand_briefs table) is handled by the caller.
 *         This module returns the computed BrandBrief — it does NOT write to DB.
 */

import Anthropic from '@anthropic-ai/sdk';
import { randomUUID } from 'crypto';
import { buildBriefManagerSystemPrompt, buildDiffUserPrompt } from './prompt';
import { validateDiffs, applyDiffs, generateVersionId, buildEvolutionLogEntry } from './diff';
import {
  DiffOutputSchema,
  type BrandBrief,
  type ManagerResult,
  type NewSignal,
  type ChangeSource,
  type FieldDiff,
} from './types';

// Re-export BrandSignal as the canonical alias the brief refers to
export type BrandSignal = NewSignal;
export type { BrandBrief, ManagerResult };

// ---------------------------------------------------------------------------
// Model + cost constants — Haiku 4.5 for structured diff synthesis
// ---------------------------------------------------------------------------
const MODEL = 'claude-haiku-4-5';
// Haiku 4.5 pricing per 1M tokens
const COST_PER_1M_INPUT = 1.0;
const COST_PER_1M_OUTPUT = 5.0;
const COST_PER_1M_CACHE_READ = 0.1; // ~10% of input rate
const COST_ALERT_THRESHOLD_USD = 2.0;

/** Compute USD cost for a single Anthropic response. */
function computeCostUsd(
  inputTokens: number,
  outputTokens: number,
  cacheReadTokens: number,
): number {
  return (
    (inputTokens / 1_000_000) * COST_PER_1M_INPUT +
    (outputTokens / 1_000_000) * COST_PER_1M_OUTPUT +
    (cacheReadTokens / 1_000_000) * COST_PER_1M_CACHE_READ
  );
}

// ---------------------------------------------------------------------------
// YMYL keyword detection — mirrors discovery agent pattern
// ---------------------------------------------------------------------------
const YMYL_PATTERNS: Array<[RegExp, string]> = [
  [/medical|diagnosis|treatment|prescription|drug|medication|symptom/, 'Medical advice'],
  [/legal advice|lawsuit|attorney|shall not be liable|court order/, 'Legal advice'],
  [
    /financial advice|investment|securities|portfolio|stock|crypto|tax advice/,
    'Financial advice',
  ],
  [/health claim|cure|prevent|treat|diagnose/, 'Health claim'],
];

function detectYmyl(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [pattern, reason] of YMYL_PATTERNS) {
    if (pattern.test(lower)) return reason;
  }
  return null;
}

/** Map signal kind to ChangeSource. */
function signalKindToChangeSource(kind: NewSignal['kind']): ChangeSource {
  switch (kind) {
    case 'customer_edit':
      return 'customer_edit';
    case 'customer_correction_signal':
      return 'customer_correction_signal';
    case 'strategy_review':
      return 'strategy_review';
    case 'adam_manual':
      return 'adam_manual';
    default: {
      // Exhaustive — TypeScript will catch any new kinds at compile time
      const _exhaustive: never = kind;
      return 'system_inferred';
    }
  }
}

/** Serialise a signal to a JSON string for the user prompt. */
function serialiseSignal(signal: NewSignal): string {
  // Strip the kind field from the payload so the LLM sees clean data
  return JSON.stringify(signal, null, 2);
}

// ---------------------------------------------------------------------------
// Main exported function
// ---------------------------------------------------------------------------

/**
 * Evolve a BrandBrief in response to a new signal.
 *
 * Steps:
 * 1. Run LLM diff synthesis (Haiku 4.5) to compute proposed field-level diffs.
 * 2. Validate diffs against business rules (YMYL, confidence floors, intent protection).
 * 3. Apply approved diffs to produce a new BrandBrief version.
 * 4. Return the new BrandBrief + ManagerResult (caller handles DB persistence).
 *
 * @param currentBrief  The current canonical BrandBrief.
 * @param newSignal     The incoming signal that may trigger changes.
 * @returns             New BrandBrief + structured ManagerResult.
 */
export async function evolveBrandBrief(
  currentBrief: BrandBrief,
  newSignal: NewSignal,
): Promise<{ brief: BrandBrief; result: ManagerResult }> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const changeSource = signalKindToChangeSource(newSignal.kind);
  const newVersionId = generateVersionId();
  const sessionId = randomUUID();

  // -------------------------------------------------------------------------
  // YMYL gate on the incoming signal payload — check before calling LLM
  // -------------------------------------------------------------------------
  const signalJson = serialiseSignal(newSignal);
  const signalYmyl = detectYmyl(signalJson);

  // -------------------------------------------------------------------------
  // LLM diff synthesis — single non-streaming call with cache_control
  // -------------------------------------------------------------------------
  const systemPrompt = buildBriefManagerSystemPrompt();
  const userPrompt = buildDiffUserPrompt(
    JSON.stringify(currentBrief.data, null, 2),
    newSignal.kind,
    signalJson,
  );

  let llmResponse: Anthropic.Message;

  try {
    llmResponse = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      temperature: 0, // Deterministic diff synthesis
      system: [
        {
          type: 'text',
          text: systemPrompt,
          // Stable block — cached after first call. Subsequent calls at ~10% input cost.
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: userPrompt }],
    });
  } catch (err: unknown) {
    const error = err as { status?: number; message?: string };
    if (error.status === 429) {
      throw new Error(
        `LLM call failed (rate limit — retry with backoff): ${error.message ?? 'Unknown error'}`,
      );
    }
    if (error.status === 529) {
      throw new Error(
        `LLM call failed (API overload — fail gracefully): ${error.message ?? 'Unknown error'}`,
      );
    }
    throw new Error(`LLM call failed: ${error.message ?? 'Unknown error'}`);
  }

  // -------------------------------------------------------------------------
  // Cost logging — required on every LLM call
  // -------------------------------------------------------------------------
  const inputTokens = llmResponse.usage.input_tokens;
  const outputTokens = llmResponse.usage.output_tokens;
  const cacheReadTokens =
    (llmResponse.usage as { cache_read_input_tokens?: number }).cache_read_input_tokens ?? 0;
  const callCostUsd = computeCostUsd(inputTokens, outputTokens, cacheReadTokens);

  console.log(
    JSON.stringify({
      event: 'llm_call',
      model: MODEL,
      feature: 'brand-brief-manager',
      session_id: sessionId,
      customer_id: newSignal.customerId,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cache_read_tokens: cacheReadTokens,
      cost_usd: callCostUsd,
      signal_kind: newSignal.kind,
    }),
  );

  if (callCostUsd > COST_ALERT_THRESHOLD_USD) {
    console.error(
      JSON.stringify({
        event: 'cost_alert',
        feature: 'brand-brief-manager',
        session_id: sessionId,
        customer_id: newSignal.customerId,
        cost_usd: callCostUsd,
        threshold: COST_ALERT_THRESHOLD_USD,
        message: `Brand-brief-manager LLM call exceeded $${COST_ALERT_THRESHOLD_USD} threshold`,
      }),
    );
  }

  // -------------------------------------------------------------------------
  // Parse + validate LLM output
  // -------------------------------------------------------------------------
  let diffSynthesisFailed = false;
  let parsedDiffs: FieldDiff[] = [];
  let llmRequiresHumanApproval = false;

  const rawContent = llmResponse.content[0];
  if (!rawContent || rawContent.type !== 'text') {
    diffSynthesisFailed = true;
  } else {
    try {
      // Strip markdown fences if the model wraps with them despite instructions
      const cleaned = rawContent.text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(cleaned) as unknown;
      const validated = DiffOutputSchema.parse(parsed);

      llmRequiresHumanApproval = validated.requires_human_approval;

      parsedDiffs = validated.diffs.map((d) => ({
        field: d.field,
        oldValue: d.old_value,
        newValue: d.new_value,
        reason: d.reason,
        changeSource,
        confidence: d.confidence,
      }));
    } catch {
      diffSynthesisFailed = true;
    }
  }

  // -------------------------------------------------------------------------
  // Business-rule validation (YMYL, confidence floor, intent protection)
  // -------------------------------------------------------------------------
  const { approved, blocked, requiresHumanApproval: blockedRequiresApproval } =
    diffSynthesisFailed || parsedDiffs.length === 0
      ? { approved: [], blocked: [], requiresHumanApproval: false }
      : validateDiffs(parsedDiffs, currentBrief.data, changeSource);

  // YMYL check: if signal payload contained YMYL content, gate regardless
  const ymylFieldChanged = !!signalYmyl || blocked.some((b) =>
    b.reason.includes('YMYL'),
  );

  const requiresHumanApproval =
    llmRequiresHumanApproval ||
    blockedRequiresApproval ||
    ymylFieldChanged ||
    diffSynthesisFailed;

  // -------------------------------------------------------------------------
  // Apply approved diffs to produce the new BrandFingerprint
  // -------------------------------------------------------------------------
  const updatedData =
    approved.length > 0
      ? applyDiffs(currentBrief.data, approved, newVersionId)
      : { ...currentBrief.data, brief_version_id: newVersionId };

  const newVersion =
    typeof currentBrief.version === 'number' ? currentBrief.version + 1 : 1;

  const newBrief: BrandBrief = {
    ...currentBrief,
    brandBriefId: randomUUID(),
    version: newVersion,
    status: `canonical_v${newVersion}`,
    data: updatedData,
    diff: approved,
    changeSource,
    changedAt: new Date().toISOString(),
    ymylFieldChanged,
    diffSynthesisFailed,
  };

  // -------------------------------------------------------------------------
  // Build ManagerResult (caller decides what events to emit)
  // -------------------------------------------------------------------------
  const eventsToEmit: string[] = [];

  if (approved.length > 0) {
    eventsToEmit.push('beamix/brand_brief.evolved');
  }
  if (requiresHumanApproval) {
    eventsToEmit.push('beamix/brand_brief.human_approval_required');
  }
  if (diffSynthesisFailed) {
    eventsToEmit.push('beamix/brand_brief.diff_synthesis_failed');
  }

  // Build evolution log (Wave 2 will persist to brief_evolution_log table)
  buildEvolutionLogEntry(
    newSignal.customerId,
    currentBrief.brandBriefId,
    newVersionId,
    approved,
    changeSource,
    requiresHumanApproval,
  );

  const managerResult: ManagerResult = {
    operation: 'evolve',
    brandBriefId: newBrief.brandBriefId,
    newVersionId,
    diff: approved,
    eventsToEmit,
    diffSynthesisFailed,
    requiresHumanApproval,
  };

  return { brief: newBrief, result: managerResult };
}
