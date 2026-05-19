/**
 * board.ts — Zod schemas for board-meeting JSON outputs.
 *
 * Per ORCHESTRATION.md §2F (4 rounds, 6 personas).
 * WS2 R6.3: source_persona_round traceability — Synthesizer cannot
 * fabricate decisions that no persona stated. Validator rejects
 * any locked_decision.source_persona_round not found in input set.
 *
 * Adam hard rule: no timelines. deadline field is literal string.
 */

import { z } from 'zod';

// ─── Enums ────────────────────────────────────────────────────────────────────

/**
 * The 7 personas: 6 regular + Aria (vendor decisions) / broad-adversary
 * (strategic decisions). CEO dispatches the right Adversary flavor per
 * decision_type field in the topic statement (Q7 2026-05-07).
 */
export const Persona = z.enum([
  'visionary',
  'strategist',
  'architect',
  'risk-modeler',
  'customer-voice',
  'aria',
  'broad-adversary',
]);
export type PersonaType = z.infer<typeof Persona>;

export const Round = z.enum(['0', '1', '2', '3']);
export type RoundType = z.infer<typeof Round>;

// ─── Round 1 — Independent ────────────────────────────────────────────────────
// Each persona returns this after receiving the de-anchored framing (Round 0).

export const Round1Output = z.object({
  persona: Persona,
  round: z.literal(1),
  topic_id: z.string(),
  verdict: z.enum(['ship', 'hold', 'reframe', 'kill']),
  rationale: z.string(),
  risks: z.array(z.string()),
  alternatives_considered: z.array(z.string()),
  recommendation: z.string(),
  confidence: z.enum(['high', 'med', 'low']),
});
export type Round1OutputType = z.infer<typeof Round1Output>;

// ─── Round 2 — Cross-critique ─────────────────────────────────────────────────
// Each persona reads the OTHER 5 outputs, responds with updates.

export const Round2Output = z.object({
  persona: Persona,
  round: z.literal(2),
  topic_id: z.string(),
  changed_mind_on: z.array(z.string()),
  doubled_down_on: z.array(z.string()),
  /** Keyed by persona name, value is the critique text. */
  peer_critiques: z.record(z.string(), z.string()),
  remaining_dissent: z.string().optional(),
  updated_recommendation: z.string(),
});
export type Round2OutputType = z.infer<typeof Round2Output>;

// ─── Round 3 — Synthesizer ────────────────────────────────────────────────────
// Receives all 12 outputs (6×R1 + 6×R2). Returns locked decisions.
// source_persona_round is REQUIRED and validated against actual inputs (R6.3).

const LockedDecision = z.object({
  key: z.string(),
  value: z.string(),
  reason: z.string(),
  /**
   * R6.3 — mechanical anti-hallucination.
   * Format: "<persona>-r<round>" e.g. "visionary-r1" or "strategist-r2".
   * Validator rejects values not matching any input persona+round combination.
   */
  source_persona_round: z.string(),
  reversibility: z.enum(['easy', 'medium', 'hard']),
});

const PreservedDissent = z.object({
  persona: Persona,
  dissent: z.string(),
  why_overruled: z.string(),
});

export const SynthesizerOutput = z.object({
  topic_id: z.string(),
  locked_decisions: z.array(LockedDecision),
  open_questions: z.array(z.string()),
  preserved_dissents: z.array(PreservedDissent),
  next_action: z.object({
    owner: z.string(),
    action: z.string(),
    /** Hard rule from Adam: no timeline estimates in agent outputs. */
    deadline: z.literal('no-timelines per Adam rule'),
  }),
});
export type SynthesizerOutputType = z.infer<typeof SynthesizerOutput>;

// ─── Validation helper — R6.3 mechanical anti-hallucination ──────────────────
//
// Takes the 12 persona outputs (6 R1 + 6 R2) and the Synthesizer output.
// Rejects if any locked_decision.source_persona_round is not in the valid set
// derived from the actual inputs.
//
// Valid format: "<persona>-r<1|2>"
// e.g. "visionary-r1", "risk-modeler-r2", "broad-adversary-r1"

export function validateSynthesizerTraceability(
  round1Outputs: Round1OutputType[],
  round2Outputs: Round2OutputType[],
  synthOutput: SynthesizerOutputType,
): { ok: boolean; reason?: string } {
  // Build the set of valid source_persona_round values from actual inputs.
  const validSources = new Set<string>();
  for (const r1 of round1Outputs) {
    validSources.add(`${r1.persona}-r1`);
  }
  for (const r2 of round2Outputs) {
    validSources.add(`${r2.persona}-r2`);
  }

  for (const decision of synthOutput.locked_decisions) {
    if (!validSources.has(decision.source_persona_round)) {
      return {
        ok: false,
        reason: `locked_decision key="${decision.key}" references source_persona_round="${decision.source_persona_round}" which is not present in the input set. Valid values: ${[...validSources].join(', ')}`,
      };
    }
  }

  return { ok: true };
}
