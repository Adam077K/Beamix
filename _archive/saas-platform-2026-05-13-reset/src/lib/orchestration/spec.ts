/**
 * spec.ts — Zod schema for the WS2 trust-mode spec contract.
 *
 * Per ORCHESTRATION.md §2D (security-hardened async-spec-trust mode).
 * All fields locked in WS2 R3.x. Discriminated unions per issued_by.kind.
 *
 * This schema is used by:
 *   - Cloudflare bridge (validate inbound spec from Linear sentinel)
 *   - Receiving Routines (validate HMAC-signed spec before trusting any field)
 *   - Inngest fan-in-watcher (validate child spec before re-firing CEO synth)
 *
 * R12: IssuedBy now carries telegram_chat_id alongside linear_user_id.
 * Telegram-sourced fires populate telegram_chat_id; linear_user_id stays null.
 * At least one of the two must be non-null (.refine enforces this).
 */

import { z } from 'zod';

// ─── Scope ────────────────────────────────────────────────────────────────────

const ScopeSchema = z.object({
  intent: z.enum(['ship', 'research', 'design', 'fix', 'refactor', 'review', 'board']),
  domain: z.enum(['backend', 'frontend', 'infra', 'data', 'ai', 'growth', 'brand', 'research']),
  constraints: z.array(z.string()),
  definition_of_done: z.string(),
  /** R3.5: must have at least 1 entry. Bridge enforces child ⊇ parent. */
  out_of_scope: z.array(z.string()).min(1, 'out_of_scope must have at least 1 entry'),
});

// ─── Budget ───────────────────────────────────────────────────────────────────

const BudgetSchema = z.object({
  max_cost_usd: z.number().positive(),
  max_runtime_minutes: z.number().int().positive(),
  max_tool_calls: z.number().int().positive(),
});

// ─── Escalation ───────────────────────────────────────────────────────────────

const EscalationSchema = z.object({
  channel: z.enum(['telegram', 'linear-comment', 'github-pr-comment']),
  format: z.enum(['binary-ping', 'freeform']),
  blocker_threshold_minutes: z.number().int().positive(),
});

// ─── Audit ────────────────────────────────────────────────────────────────────

const AuditSchema = z.object({
  session_file_required: z.boolean(),
  decisions_md_entry_required: z.boolean(),
  audit_log_table: z.literal('audit_log'),
});

// ─── issued_by ────────────────────────────────────────────────────────────────
// R3.1: bridge verifies linear_user_id against ALLOWED_ISSUERS env.
// R12: telegram_chat_id field added. Telegram-sourced fires populate this field;
//      linear_user_id stays null. At least one must be non-null (.refine).
//
// "adam" kind: session_file + agent_session_id are optional (ad-hoc fires).
// all agent kinds: session_file + agent_session_id are required for traceability.

const IssuedByAdam = z
  .object({
    kind: z.literal('adam'),
    linear_user_id: z.string().nullable(),
    telegram_chat_id: z.string().nullable(),
    agent_session_id: z.string().optional(),
    session_file: z.string().optional(),
  })
  .refine(
    (v) => v.linear_user_id !== null || v.telegram_chat_id !== null,
    {
      message:
        'issued_by (adam) must have at least one of linear_user_id or telegram_chat_id non-null',
    }
  );

const IssuedByCeo = z.object({
  kind: z.literal('ceo'),
  linear_user_id: z.string().nullable(),
  telegram_chat_id: z.string().nullable(),
  agent_session_id: z.string(),
  session_file: z.string(),
});

const IssuedByCsuite = z.object({
  kind: z.literal('c_suite'),
  linear_user_id: z.string().nullable(),
  telegram_chat_id: z.string().nullable(),
  agent_session_id: z.string(),
  session_file: z.string(),
});

const IssuedByStandingRoutine = z.object({
  kind: z.literal('standing_routine'),
  linear_user_id: z.string().nullable(),
  telegram_chat_id: z.string().nullable(),
  agent_session_id: z.string().optional(),
  session_file: z.string().optional(),
});

const IssuedBySchema = z.discriminatedUnion('kind', [
  IssuedByAdam,
  IssuedByCeo,
  IssuedByCsuite,
  IssuedByStandingRoutine,
]);

// ─── TrustSpecV1 ──────────────────────────────────────────────────────────────

export const TrustSpecV1 = z.object({
  spec_version: z.literal('1.0'),
  trust_mode: z.boolean(),

  /** R3.4: single-use UUID; KV-tracked with TTL = expires_at - issued_at. */
  nonce: z.string().uuid(),
  issued_at: z.string().datetime(),
  expires_at: z.string().datetime(),

  issued_by: IssuedBySchema,

  linear_ticket: z.string(),
  parent_ticket: z.string().optional(),

  /** Fan-in barrier UUID shared across all sub-tickets in a Full-tier dispatch. */
  fan_in_key: z.string().uuid().optional(),

  scope: ScopeSchema,
  memory_pre_loads: z.array(z.string()).optional(),
  budget: BudgetSchema,
  escalation: EscalationSchema,
  audit: AuditSchema,

  /** HMAC-SHA256 over the spec body, set by the Cloudflare bridge (BRIDGE_HMAC_SECRET). */
  _signature: z.string(),
});

export type TrustSpec = z.infer<typeof TrustSpecV1>;

// ─── Scope guard: validateChildScope ─────────────────────────────────────────
// R3.5 enforcement — arithmetic, NOT LLM-judged.
//
// Rules:
//   1. child.out_of_scope must be a superset of parent.out_of_scope
//   2. child.max_cost_usd must be <= remaining parent budget
//      (caller supplies remaining_parent_budget from accrued audit_log rows)
//
// R11 F12: guard against negative remaining budget at the top of the function.

export function validateChildScope(
  parentSpec: TrustSpec,
  childSpec: TrustSpec,
  remaining_parent_budget_usd: number,
): { ok: boolean; reason?: string } {
  // R11 F12: reject if remaining budget is negative (caller computation error)
  if (remaining_parent_budget_usd < 0) {
    throw new Error(
      `validateChildScope called with negative remaining_parent_budget_usd (${remaining_parent_budget_usd}). This indicates a budget computation error in the caller.`
    );
  }

  // Rule 1: child.out_of_scope ⊇ parent.out_of_scope
  const parentOutOfScope = new Set(parentSpec.scope.out_of_scope);
  const childOutOfScope = new Set(childSpec.scope.out_of_scope);
  for (const item of parentOutOfScope) {
    if (!childOutOfScope.has(item)) {
      return {
        ok: false,
        reason: `child.out_of_scope is missing "${item}" from parent.out_of_scope (R3.5 violation)`,
      };
    }
  }

  // Rule 2: child.max_cost_usd <= remaining parent budget
  if (childSpec.budget.max_cost_usd > remaining_parent_budget_usd) {
    return {
      ok: false,
      reason: `child.budget.max_cost_usd (${childSpec.budget.max_cost_usd}) exceeds remaining parent budget (${remaining_parent_budget_usd}) (R3.5 violation)`,
    };
  }

  return { ok: true };
}
