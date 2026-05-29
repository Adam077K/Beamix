/**
 * DigestInput — the canonical context shape consumed by the digest-writer agent.
 *
 * **Ownership note (race condition resolution, 2026-05-29):** This file is the
 * single source of truth for `DigestInput` per the W2.2 contract. The path was
 * assigned to backend-engineer (`feat/be-w2-weekly-digest`); ai-engineer
 * (`feat/ai-w2.2-digest-writer`) created this stub when the file did not yet
 * exist on either branch so the digest-writer agent could be implemented in
 * parallel. At merge time:
 *   - If backend-engineer's branch does not touch this file, this stub is the
 *     canonical definition.
 *   - If backend-engineer's branch defines `DigestInput` with the same shape,
 *     the merge is trivial — keep this file.
 *   - If the shapes diverge, reconcile against the PRD §Inputs in
 *     `docs/04-features/specs/agent-digest-writer.md` and the CMO-locked
 *     `DigestPayload` contract (template-level props expand from these inputs).
 *
 * Shape derived from `docs/04-features/specs/agent-digest-writer.md` §Inputs
 * (1–8). Any new field MUST be added here first and then plumbed into the
 * digest-writer system prompt — do not pass undeclared fields to the LLM.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Sub-schemas — small, reusable, mirrored into the system prompt's JSON spec
// ---------------------------------------------------------------------------

/** Per-engine visibility delta against the previous week + 4-week baseline. */
export const VisibilityScoreDeltaSchema = z.object({
  engine: z.string().min(1),
  /** 0–100 visibility score this week. */
  thisWeek: z.number().min(0).max(100),
  /** Score last week — null if no prior scan. */
  lastWeek: z.number().min(0).max(100).nullable(),
  /** Score 4 weeks ago — null if no prior scan. */
  fourWeeksAgo: z.number().min(0).max(100).nullable(),
  /** thisWeek - lastWeek (or null if no prior). */
  delta: z.number().nullable(),
});

/** A deliverable that landed in the customer's pipeline in the last 7 days. */
export const DeliverableSchema = z.object({
  /** `work_log.id` — used for traceability + dedup. */
  workLogId: z.string().uuid(),
  /** Deliverable kind matching the digest template's `wins[].type` enum. */
  type: z.enum(['schema', 'faq', 'citation', 'content', 'outreach']),
  /** Customer-friendly description. NEVER includes agent names. */
  description: z.string().min(1),
  /** ISO timestamp deliverable was completed. */
  completedAt: z.string().datetime(),
  /** Page/URL the deliverable applies to, if relevant. */
  targetUrl: z.string().url().optional(),
});

/** A query the customer moved from "not mentioned" → "mentioned" this week. */
export const NewlyWonQuerySchema = z.object({
  query: z.string().min(1),
  engine: z.string().min(1),
  /** ISO timestamp the engine started citing the customer. */
  firstSeenAt: z.string().datetime(),
});

/** An approval card pending customer action — fed to the digest template. */
export const OpenApprovalCardSchema = z.object({
  approvalId: z.string().uuid(),
  /** Customer-friendly title, ≤80 chars. */
  title: z.string().min(1).max(120),
  type: z.enum(['schema', 'faq', 'citation', 'content', 'outreach']),
  /** Pre-signed HMAC approve URL — passed through verbatim, NOT regenerated. */
  approveUrl: z.string().url(),
  /** 1–2 sentence preview the customer sees inline. Source text. */
  previewText: z.string().min(1),
  /** ISO deadline. Approvals sorted ascending by this field. */
  expiresAt: z.string().datetime(),
});

/**
 * "How we got this" causal trail — one entry per highlight win.
 * If the chain is incomplete, omit the entry; never invent the trail.
 */
export const CausalTrailSchema = z.object({
  /** The deliverable that started the chain. */
  triggerWorkLogId: z.string().uuid(),
  /** Customer-friendly 2-3 sentence explanation. */
  story: z.string().min(1),
  /** ISO of trigger event. */
  triggerAt: z.string().datetime(),
  /** Engine where the visibility shift was observed. */
  engine: z.string().min(1),
  /** Query that newly cited the customer. */
  query: z.string().min(1),
});

/** Snapshot from the customer's canonical Brand Brief. */
export const BrandBriefSnapshotSchema = z.object({
  /** Plain-English description of voice tone (e.g. "direct B2B SaaS"). */
  voiceTone: z.string().min(1),
  /** Top KPIs the customer cares about, ranked. */
  kpis: z.array(z.string()).min(1),
  /** Customer's industry vertical. */
  industry: z.string().min(1),
});

/** Already-sent digest snippets — feed in to avoid repeating phrasings. */
export const HistoricalDigestSchema = z.object({
  weekOf: z.string().datetime(),
  subjectLine: z.string(),
  headline: z.string(),
});

// ---------------------------------------------------------------------------
// DigestInput — top-level
// ---------------------------------------------------------------------------

export const DigestInputSchema = z.object({
  /** UUID for this digest run — passed straight through to `DigestPayload.digestId`. */
  digestId: z.string().uuid(),
  customerId: z.string().uuid(),
  customerName: z.string().min(1),
  /** Display name used in salutations + subject lines. */
  customerDisplayName: z.string().min(1),
  /** Billing tier — controls digest depth (wins count, approval card cap). */
  customerTier: z.enum(['starter', 'growth', 'scale', 'professional']),
  /** Output language. Hebrew variant flips the prompt to HE output. */
  locale: z.enum(['en', 'he']),
  /** ISO date for the Monday (or chosen day) anchoring this week. */
  weekOf: z.string().datetime(),

  // --- Inputs 1–8 from the PRD ------------------------------------------------
  brandBrief: BrandBriefSnapshotSchema,
  deliverables: z.array(DeliverableSchema),
  visibilityDeltas: z.array(VisibilityScoreDeltaSchema),
  newlyWonQueries: z.array(NewlyWonQuerySchema),
  openApprovalCards: z.array(OpenApprovalCardSchema),
  causalTrails: z.array(CausalTrailSchema),
  historicalDigests: z.array(HistoricalDigestSchema),

  // --- URL pass-throughs — runner never regenerates ---------------------------
  /** Pre-signed "approve all" URL produced upstream. */
  approveAllUrl: z.string().url(),
  /** One-click unsubscribe URL. */
  unsubscribeUrl: z.string().url(),

  // --- Next-week preview ------------------------------------------------------
  /** Top 1–3 deliverables scheduled for next week. Thematic only, no detail. */
  upcomingDeliverables: z.array(
    z.object({
      type: z.enum(['schema', 'faq', 'citation', 'content', 'outreach']),
      description: z.string().min(1),
    }),
  ),
});

export type DigestInput = z.infer<typeof DigestInputSchema>;
export type VisibilityScoreDelta = z.infer<typeof VisibilityScoreDeltaSchema>;
export type Deliverable = z.infer<typeof DeliverableSchema>;
export type NewlyWonQuery = z.infer<typeof NewlyWonQuerySchema>;
export type OpenApprovalCard = z.infer<typeof OpenApprovalCardSchema>;
export type CausalTrail = z.infer<typeof CausalTrailSchema>;
export type BrandBriefSnapshot = z.infer<typeof BrandBriefSnapshotSchema>;
export type HistoricalDigest = z.infer<typeof HistoricalDigestSchema>;

// ---------------------------------------------------------------------------
// getMockDigestInput — deterministic fixture used in dev + smoke tests
// ---------------------------------------------------------------------------

/**
 * Build a deterministic mock `DigestInput` for the supplied customer id.
 *
 * Used by:
 *   - `/api/dev/digest-smoke` route to exercise the full pipeline
 *   - eval harness (W2 Worker 2) — must produce stable inputs across runs
 *   - digest-writer unit tests
 *
 * Designed to be representative — a 12-point visibility climb, 2 wins, 2
 * approvals, 1 clean causal trail — so the agent exercises all 5 sections
 * (visibility_delta, wins_this_week, pending_approvals, next_week_preview,
 * footer) without quiet-week path tripping.
 */
export function getMockDigestInput(customerId: string): DigestInput {
  const now = new Date('2026-05-25T08:00:00.000Z');
  const lastWeek = new Date('2026-05-18T08:00:00.000Z');
  const fourWeeks = new Date('2026-04-27T08:00:00.000Z');
  const tuesday = new Date('2026-05-19T14:00:00.000Z');
  const thursday = new Date('2026-05-21T14:00:00.000Z');

  return {
    digestId: '11111111-1111-4111-8111-111111111111',
    customerId,
    customerName: 'Northstar Dental',
    customerDisplayName: 'Dr. Maya',
    customerTier: 'growth',
    locale: 'en',
    weekOf: now.toISOString(),

    brandBrief: {
      voiceTone: 'warm, plain English, no jargon — small private dental clinic',
      kpis: ['new-patient inquiries', 'AI search citations', 'review velocity'],
      industry: 'Dental — private practice',
    },

    deliverables: [
      {
        workLogId: '22222222-2222-4222-8222-222222222222',
        type: 'schema',
        description: 'Added FAQ schema to the pricing page covering insurance + payment plans.',
        completedAt: tuesday.toISOString(),
        targetUrl: 'https://northstardental.com/pricing',
      },
      {
        workLogId: '33333333-3333-4333-8333-333333333333',
        type: 'citation',
        description: 'Landed a citation in two regional AI search responses for "Bay Area cosmetic dentist".',
        completedAt: thursday.toISOString(),
      },
    ],

    visibilityDeltas: [
      {
        engine: 'ChatGPT',
        thisWeek: 68,
        lastWeek: 56,
        fourWeeksAgo: 41,
        delta: 12,
      },
      {
        engine: 'Perplexity',
        thisWeek: 72,
        lastWeek: 70,
        fourWeeksAgo: 52,
        delta: 2,
      },
      {
        engine: 'Gemini',
        thisWeek: 54,
        lastWeek: 50,
        fourWeeksAgo: 33,
        delta: 4,
      },
    ],

    newlyWonQueries: [
      {
        query: 'enterprise SaaS pricing tiers',
        engine: 'Perplexity',
        firstSeenAt: thursday.toISOString(),
      },
    ],

    openApprovalCards: [
      {
        approvalId: '44444444-4444-4444-8444-444444444444',
        title: 'New FAQ page draft — insurance & payment plans',
        type: 'faq',
        approveUrl: 'https://app.beamixai.com/approvals/44444444?token=mock-signed-token-1',
        previewText: 'Six common patient questions about insurance acceptance + payment-plan eligibility, written in plain English.',
        expiresAt: new Date('2026-05-28T17:00:00.000Z').toISOString(),
      },
      {
        approvalId: '55555555-5555-4555-8555-555555555555',
        title: 'Outreach: guest-post pitch to BayArea Living blog',
        type: 'outreach',
        approveUrl: 'https://app.beamixai.com/approvals/55555555?token=mock-signed-token-2',
        previewText: 'A 120-word pitch positioning Dr. Maya as a local expert on family dental care; outlet has 18k local monthly readers.',
        expiresAt: new Date('2026-05-30T17:00:00.000Z').toISOString(),
      },
    ],

    causalTrails: [
      {
        triggerWorkLogId: '22222222-2222-4222-8222-222222222222',
        story:
          'On Tuesday we added FAQ schema to the pricing page. By Thursday Perplexity began citing the page for "enterprise SaaS pricing tiers" — a query the practice had not won before.',
        triggerAt: tuesday.toISOString(),
        engine: 'Perplexity',
        query: 'enterprise SaaS pricing tiers',
      },
    ],

    historicalDigests: [
      {
        weekOf: lastWeek.toISOString(),
        subjectLine: 'Northstar Dental — 1 new citation last week',
        headline: 'One new citation, two approvals queued',
      },
      {
        weekOf: fourWeeks.toISOString(),
        subjectLine: 'Northstar Dental — quiet week. Here is what is queued.',
        headline: 'A quiet week — three deliverables in flight',
      },
    ],

    approveAllUrl: 'https://app.beamixai.com/approvals?token=mock-approve-all-token',
    unsubscribeUrl: 'https://app.beamixai.com/u/mock-unsub-token',

    upcomingDeliverables: [
      {
        type: 'content',
        description: 'Authority blog post on dental insurance eligibility for self-employed patients.',
      },
      {
        type: 'schema',
        description: 'Service-level schema rollout across the four treatment landing pages.',
      },
    ],
  };
}
