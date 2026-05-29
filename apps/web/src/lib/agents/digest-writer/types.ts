/**
 * Digest-Writer Agent — Output Contract
 *
 * `DigestPayload` is the typed output the digest-writer agent returns. It maps
 * 1:1 to the CMO-locked weekly-digest email template props (`WeeklyDigestProps`).
 *
 * Source of truth for the field set: W2.2 brief (2026-05-29, CMO added
 * `previewText`, `narrativeLine`, `approvalIntroLine` on top of the base shape).
 *
 * Field constraints below match the system prompt's length-cap rules so that
 * Zod validation acts as a final guard against the model over-shooting caps.
 */

import { z } from 'zod';
import { DigestInputSchema, type DigestInput } from '../../digest/mock-input';

// ---------------------------------------------------------------------------
// Re-export DigestInput (single import surface for callers of the agent)
// ---------------------------------------------------------------------------
export { DigestInputSchema, type DigestInput };

// ---------------------------------------------------------------------------
// Shared enums — mirror the template's prop enums exactly
// ---------------------------------------------------------------------------

/**
 * Deliverable kind. Matches the `wins[].type` enum on the CMO-locked template
 * and the same enum on `pendingApprovals[].type`.
 */
export const DigestDeliverableTypeSchema = z.enum([
  'schema',
  'faq',
  'citation',
  'content',
  'outreach',
]);

export type DigestDeliverableType = z.infer<typeof DigestDeliverableTypeSchema>;

/** Billing tier — must match the input. */
export const DigestCustomerTierSchema = z.enum([
  'starter',
  'growth',
  'scale',
  'professional',
]);

export type DigestCustomerTier = z.infer<typeof DigestCustomerTierSchema>;

// ---------------------------------------------------------------------------
// Sub-schemas — wins + approvals match the template props 1:1
// ---------------------------------------------------------------------------

export const DigestWinSchema = z.object({
  /** Customer-friendly win title. NEVER includes agent names. */
  title: z.string().min(1).max(80),
  type: DigestDeliverableTypeSchema,
  /** ISO timestamp the deliverable landed. */
  publishedAt: z.string().datetime(),
});

export type DigestWin = z.infer<typeof DigestWinSchema>;

export const DigestApprovalSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(80),
  type: DigestDeliverableTypeSchema,
  /**
   * Pre-signed HMAC approve URL — passed through verbatim from the input.
   * SECURITY: must be https (defence vs hallucinated http:// link injection).
   * Caller additionally pins this value byte-for-byte against the input in
   * `runDigestWriter` — the model may not invent or modify URLs.
   */
  approveUrl: z.string().url().regex(/^https:\/\//, 'must be https'),
  /** Customer-facing 1–2 sentence preview, ≤120 chars. */
  previewSnippet: z.string().min(1).max(120),
});

export type DigestApproval = z.infer<typeof DigestApprovalSchema>;

// ---------------------------------------------------------------------------
// DigestPayload — top-level output contract
// ---------------------------------------------------------------------------

export const DigestPayloadSchema = z.object({
  digestId: z.string().uuid(),
  customerId: z.string().uuid(),
  customerName: z.string().min(1),
  customerTier: DigestCustomerTierSchema,

  /** ISO date for the Monday anchoring this week. Passed through from input. */
  weekOf: z.string().datetime(),

  /** 0–100 overall visibility score this week (cross-engine average). */
  visibilityScore: z.number().min(0).max(100),
  /** Signed delta vs last week. */
  visibilityDelta: z.number(),
  /** Number of engines included in the score. */
  enginesTracked: z.number().int().min(1),

  /** Highlighted wins. Tier-capped: starter≤1, growth≤2, scale≤3, professional≤all. */
  wins: z.array(DigestWinSchema),

  /** Inline approval cards, ordered by deadline asc. Tier-capped per PRD. */
  pendingApprovals: z.array(DigestApprovalSchema),

  /**
   * Pre-signed "approve all" URL — passed through from input.
   * SECURITY: must be https. Also pinned byte-for-byte in `runDigestWriter`.
   */
  approveAllUrl: z.string().url().regex(/^https:\/\//, 'must be https'),

  /**
   * 2–3 sentence thematic preview of next week's queued work.
   * No detail, no agent names, ≤240 chars.
   */
  nextWeekPreview: z.string().min(1).max(240),

  /**
   * One-click unsubscribe URL — passed through from input.
   * SECURITY: must be https. Also pinned byte-for-byte in `runDigestWriter`.
   */
  unsubscribeUrl: z.string().url().regex(/^https:\/\//, 'must be https'),

  /**
   * Email subject line. ≤60 chars. Includes customer business name.
   * Never emoji, never ALL CAPS, never identical to last 2 weeks' subjects.
   */
  subjectLine: z.string().min(1).max(60),

  /** Hero headline shown above the visibility card, ≤80 chars. */
  headline: z.string().min(1).max(80),

  // --- CMO additions, 2026-05-29 ---------------------------------------------
  /** Inbox preview text (between subject and body). ≤90 chars per Resend guidance. */
  previewText: z.string().min(1).max(90),
  /**
   * "How we got this" narrative — 2–3 sentence causal trail surfacing the
   * clearest 1–3 wins. ≤480 chars total. If no clean trail, model returns
   * an honest "we don't have enough data yet" line.
   */
  narrativeLine: z.string().min(1).max(480),
  /**
   * One-line intro that opens the approvals section in the customer's voice.
   * ≤160 chars. Skipped when pendingApprovals is empty (model returns empty string).
   */
  approvalIntroLine: z.string().max(160),
});

export type DigestPayload = z.infer<typeof DigestPayloadSchema>;

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

// SECURITY: never carry raw LLM completion text on this error — it contains
// customer PII that will leak via any standard error logger.
/**
 * Thrown when the LLM output fails Zod validation twice (initial call + 1 retry
 * with the validation error appended to the user prompt), OR when the model
 * returns a URL that does not byte-for-byte match the input (security-critical
 * tampering — no retry). Caller surfaces as a fallback digest send + emits
 * `digest.fallback_sent` per the PRD.
 *
 * SECURITY: never carry raw LLM completion text on this error — it contains
 * customer PII (customerName, brand-brief voice tone, deliverable descriptions,
 * historical digest subject lines) that will leak via any standard error logger
 * (Sentry, Datadog, console.error → Vercel logs). The `issues` array contains
 * only Zod paths + canned messages, which is PII-safe.
 */
export class DigestWriterValidationError extends Error {
  override readonly name = 'DigestWriterValidationError';

  constructor(
    message: string,
    /** Structured Zod issue paths, for log triage. PII-safe. */
    public readonly issues: Array<{ path: string; message: string }>,
  ) {
    super(message);
  }
}
