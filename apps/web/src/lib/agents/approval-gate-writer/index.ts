/**
 * Approval-Gate Writer Agent — Wave 2.
 *
 * Consumes the Inngest event `gated_publish.requested` and produces a 1-click
 * approve/reject card for the customer's approval queue.
 *
 * Responsibilities (per docs/04-features/specs/agent-approval-gate-writer.md):
 *   1. Drafts the card framing (title, value_one_liner, preview, action labels)
 *      using Anthropic Sonnet 4.6.
 *   2. Loads the customer's brand_fingerprint for voice + the
 *      `requires_human_approval` flag and `brief_version_id`.
 *   3. Defence-in-depth YMYL check: scans both inbound context AND generated
 *      draft. Any YMYL match → forces YMYL framing on the card (verbatim
 *      "Medical claim — review carefully" / "Legal advice content — review
 *      carefully" prefix etc.) AND records `late_ymyl_catch=true` if not
 *      flagged upstream.
 *   4. INSERTs a row into `approval_queue` with state='pending', kind mapped
 *      from artifactType, evidence={draft, provenance, source_event, risk_flags},
 *      expires_at = now() + 7 days (default; outreach kinds use 48h).
 *   5. Fires Inngest event `approval.created` for the email handler
 *      (Group C.1) to consume.
 *   6. audit_log row on every draft and every queue insert.
 *   7. Cost-instrumented: emit `cost.alert` when per-run cost > $0.50.
 *
 * Architecture per CLAUDE.md:
 *   - Direct Anthropic SDK (NOT Vercel AI SDK)
 *   - Sonnet 4.6 (`claude-sonnet-4-6`)
 *   - System prompt cached with cache_control:ephemeral
 *   - Voice Canon Model B — card is Beamix-voice; outreach email body is
 *     customer-voice (preserved verbatim).
 */

import Anthropic from '@anthropic-ai/sdk';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { detectYmyl, type YmylMatch } from '../shared/ymyl';
import { logAudit, type AuditClient } from '../shared/audit';
import {
  buildApprovalGateSystemPrompt,
  buildApprovalGateUserPrompt,
} from './prompt';
import type {
  ApprovalCardDraft,
  ApprovalGateOutcome,
  ApprovalKind,
  ArtifactType,
  GatedPublishRequestedEvent,
  RiskFlag,
} from './types';

// ---------------------------------------------------------------------------
// Config — Sonnet 4.6 + cost ceilings
// ---------------------------------------------------------------------------
const MODEL = 'claude-sonnet-4-6';

const COST_PER_1M_INPUT = 3.0;
const COST_PER_1M_OUTPUT = 15.0;
const COST_PER_1M_CACHE_READ = 0.3;

/** Hard ceiling — refuse if a single run costs more than this. */
export const RUN_COST_CEILING_USD = 1.0;
/** Cost alert threshold — emit `cost.alert` above this. */
export const COST_ALERT_THRESHOLD_USD = 0.5;

/** Per-artifact-type expiry windows — outreach = 48h, everything else = 7 days. */
const EXPIRY_HOURS_BY_TYPE: Record<ArtifactType, number> = {
  blog_post: 24 * 7,
  faq: 24 * 7,
  outreach_email: 48,
  schema_change: 24 * 7,
  citation_outreach: 48,
  listing_update: 24 * 7,
};

// ---------------------------------------------------------------------------
// Public input types
// ---------------------------------------------------------------------------

/** Re-export the event payload as the agent input. */
export type ApprovalGateInput = GatedPublishRequestedEvent;

// ---------------------------------------------------------------------------
// Cost helpers
// ---------------------------------------------------------------------------

export function computeCostUsd(
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
// approval_kind mapping
// ---------------------------------------------------------------------------

/**
 * Map our artifact taxonomy to the SQL enum approval_kind. The enum is
 * defined in migration 20260525000001_agency_tables.sql.
 */
export function mapArtifactToKind(artifactType: ArtifactType): ApprovalKind {
  switch (artifactType) {
    case 'blog_post':
    case 'faq':
      return 'content_publish';
    case 'outreach_email':
      return 'email_as_them';
    case 'citation_outreach':
      return 'outreach';
    case 'schema_change':
      return 'schema_push';
    case 'listing_update':
      return 'listing_update';
  }
}

// ---------------------------------------------------------------------------
// YMYL → title prefix mapping
// ---------------------------------------------------------------------------

const YMYL_PREFIX_BY_REASON: Record<string, string> = {
  'Medical advice': 'Medical claim — review carefully: ',
  'Health claim': 'Medical claim — review carefully: ',
  'Legal advice': 'Legal advice content — review carefully: ',
  'Financial advice': 'Financial advice content — review carefully: ',
  'Explicit YMYL flag': 'Review carefully: ',
};

function ymylTitlePrefix(match: YmylMatch | null): string | null {
  if (!match) return null;
  return YMYL_PREFIX_BY_REASON[match.reason] ?? 'Review carefully: ';
}

// ---------------------------------------------------------------------------
// Brand-brief loader
// ---------------------------------------------------------------------------

interface BriefDigest {
  briefVersionId: string;
  requiresHumanApproval: boolean;
  toneDescriptors: string[];
  doList: string[];
  dontList: string[];
}

async function loadBriefDigest(
  client: SupabaseClient,
  customerId: string,
): Promise<BriefDigest | null> {
  const { data, error } = await client
    .from('brand_fingerprints')
    .select('voice, do_list, dont_list, requires_human_approval, brief_version_id')
    .eq('customer_id', customerId)
    .maybeSingle();
  if (error || !data) {
    return null;
  }
  // Cast to a known shape — Supabase types not codegen'd in this worker context.
  const row = data as {
    voice: { tone_descriptors?: string[] } | null;
    do_list: string[] | null;
    dont_list: string[] | null;
    requires_human_approval: boolean;
    brief_version_id: string;
  };
  return {
    briefVersionId: row.brief_version_id,
    requiresHumanApproval: row.requires_human_approval,
    toneDescriptors: row.voice?.tone_descriptors ?? [],
    doList: row.do_list ?? [],
    dontList: row.dont_list ?? [],
  };
}

// ---------------------------------------------------------------------------
// Supabase admin client (lazy)
// ---------------------------------------------------------------------------
function getAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      '[approval-gate-writer] Supabase env vars not configured (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)',
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

// ---------------------------------------------------------------------------
// Anthropic client surface (overridable for tests)
// ---------------------------------------------------------------------------
export interface AnthropicLike {
  messages: {
    create: (
      params: Anthropic.MessageCreateParamsNonStreaming,
    ) => Promise<Anthropic.Message>;
  };
}

function defaultAnthropic(): AnthropicLike {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

// ---------------------------------------------------------------------------
// Draft parsing
// ---------------------------------------------------------------------------

export function parseApprovalCardDraft(raw: string): ApprovalCardDraft | null {
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null) return null;
  const obj = parsed as Record<string, unknown>;
  const title = typeof obj.title === 'string' ? obj.title : null;
  const value = typeof obj.value_one_liner === 'string' ? obj.value_one_liner : null;
  const preview = typeof obj.preview === 'string' ? obj.preview : null;
  const approveLabel = typeof obj.approve_label === 'string' ? obj.approve_label : null;
  const changeLabel = typeof obj.change_label === 'string' ? obj.change_label : null;
  const rejectLabel = typeof obj.reject_label === 'string' ? obj.reject_label : null;
  if (!title || !value || !preview || !approveLabel || !changeLabel || !rejectLabel) {
    return null;
  }
  if (title.length === 0 || title.length > 200) return null;
  if (value.length === 0 || value.length > 280) return null;
  return {
    title,
    value_one_liner: value,
    preview,
    approve_label: approveLabel,
    change_label: changeLabel,
    reject_label: rejectLabel,
  };
}

// ---------------------------------------------------------------------------
// YMYL post-enforcement — guarantees the prefix + label even if the LLM strips it
// ---------------------------------------------------------------------------

export function enforceYmylFraming(
  draft: ApprovalCardDraft,
  ymyl: YmylMatch | null,
): ApprovalCardDraft {
  if (!ymyl) return draft;
  const prefix = ymylTitlePrefix(ymyl);
  if (!prefix) return draft;

  const needsPrefix = !draft.title.startsWith(prefix);
  const titleWithPrefix = needsPrefix ? `${prefix}${draft.title}` : draft.title;
  // 200-char ceiling kept; truncate if prefix push us over (rare in practice).
  const title =
    titleWithPrefix.length > 200 ? titleWithPrefix.slice(0, 197) + '...' : titleWithPrefix;

  const ymylTail = ' — please confirm accurate for your practice.';
  const value = draft.value_one_liner.endsWith(ymylTail)
    ? draft.value_one_liner
    : `${draft.value_one_liner.replace(/[.!?]\s*$/u, '')}${ymylTail}`;

  return {
    ...draft,
    title,
    value_one_liner: value,
    approve_label: 'I confirm and approve',
  };
}

// ---------------------------------------------------------------------------
// approval_queue insert
// ---------------------------------------------------------------------------

interface InsertApprovalQueueParams {
  customerId: string;
  draft: ApprovalCardDraft;
  artifactType: ArtifactType;
  artifactId: string;
  whyThisMatters: string;
  publishTarget: string;
  scheduledFor: string | null;
  riskFlags: RiskFlag[];
  ymyl: YmylMatch | null;
  briefVersionId: string;
  expiresAt: Date;
  client: SupabaseClient;
}

interface ApprovalQueueRowInsertResult {
  id: string;
  approvalToken: string;
}

async function insertApprovalQueueRow(
  params: InsertApprovalQueueParams,
): Promise<ApprovalQueueRowInsertResult> {
  const approvalToken = randomUUID();
  const evidence = {
    draft: params.draft,
    provenance: {
      source_event: 'gated_publish.requested',
      brief_version_id: params.briefVersionId,
      artifact_id: params.artifactId,
      artifact_type: params.artifactType,
      generated_by: 'approval_gate_writer',
    },
    risk_flags: params.riskFlags,
    ymyl: params.ymyl
      ? { matched: params.ymyl.pattern, reason: params.ymyl.reason }
      : null,
    publish_target: params.publishTarget,
    scheduled_for: params.scheduledFor,
  };
  const row = {
    customer_id: params.customerId,
    kind: mapArtifactToKind(params.artifactType),
    state: 'pending' as const,
    resource: {
      kind: 'approval_card',
      artifact_type: params.artifactType,
      artifact_id: params.artifactId,
      title: params.draft.title,
      value_one_liner: params.draft.value_one_liner,
      preview: params.draft.preview,
      approve_label: params.draft.approve_label,
      change_label: params.draft.change_label,
      reject_label: params.draft.reject_label,
    },
    evidence,
    approval_token: approvalToken,
    expires_at: params.expiresAt.toISOString(),
  };
  const { data, error } = await params.client
    .from('approval_queue')
    .insert(row)
    .select('id')
    .single();
  if (error) {
    throw new Error(
      `[approval-gate-writer] approval_queue insert failed: ${error.message}`,
    );
  }
  const id = (data as { id?: string } | null)?.id;
  if (!id) {
    throw new Error('[approval-gate-writer] approval_queue insert returned no id');
  }
  return { id, approvalToken };
}

// ---------------------------------------------------------------------------
// Main entry — runApprovalGateWriter
// ---------------------------------------------------------------------------

export interface RunApprovalGateWriterDeps {
  /** Defaults to a new Anthropic client backed by ANTHROPIC_API_KEY. */
  anthropic?: AnthropicLike;
  /** Defaults to the Supabase service-role client. */
  supabase?: SupabaseClient;
  /** Defaults to logAudit against the same Supabase client. */
  auditClient?: AuditClient;
  /**
   * Cost-alert emitter — receives one call when the per-run cost crosses
   * COST_ALERT_THRESHOLD_USD. The wrapping Inngest function should map this
   * to `inngest.send({ name: 'cost.alert', ... })`.
   */
  emitCostAlert?: (payload: {
    customerId: string;
    feature: 'approval_gate_writer';
    costUsd: number;
  }) => Promise<void> | void;
  /**
   * `approval.created` emitter — receives one call after a successful
   * approval_queue insert so the email handler (Group C.1) can dispatch
   * the 1-click digest email. The wrapping Inngest function maps this to
   * `inngest.send({ name: 'approval.created', ... })`.
   */
  emitApprovalCreated?: (payload: {
    approvalQueueId: string;
    approvalToken: string;
    customerId: string;
    artifactType: ArtifactType;
    artifactId: string;
    ymyl: boolean;
    expiresAt: string;
  }) => Promise<void> | void;
  /** Test seam — defaults to `() => new Date()`. */
  now?: () => Date;
}

/**
 * Run one approval-gate session. Returns an outcome the caller can fan out on.
 */
export async function runApprovalGateWriter(
  input: ApprovalGateInput,
  deps: RunApprovalGateWriterDeps = {},
): Promise<ApprovalGateOutcome> {
  const anthropic = deps.anthropic ?? defaultAnthropic();
  const supabase = deps.supabase ?? getAdminClient();
  // Supabase's `.from().insert()` is awaitable at runtime even though its type
  // is PostgrestFilterBuilder rather than Promise. Cast through unknown to
  // satisfy the minimal AuditClient surface.
  const auditClient: AuditClient =
    deps.auditClient ?? ({ from: supabase.from.bind(supabase) } as unknown as AuditClient);
  const now = deps.now ?? (() => new Date());

  const sessionId = randomUUID();

  // -------------------------------------------------------------------------
  // 1. Load brand brief (voice + version + requires_human_approval).
  //    Missing brief => hard abort. Cards MUST be traceable to a brief version.
  // -------------------------------------------------------------------------
  const brief = await loadBriefDigest(supabase, input.customerId);
  if (!brief) {
    await logAudit(auditClient, {
      actor_type: 'agent',
      event_type: 'approval_gate_writer.missing_brief',
      target_id: input.customerId,
      target_table: 'brand_fingerprints',
      payload: {
        artifact_type: input.artifactType,
        artifact_id: input.artifactId,
        session_id: sessionId,
      },
    });
    return { kind: 'aborted', reason: 'missing_brief', costUsd: 0 };
  }

  // -------------------------------------------------------------------------
  // 2. Up-front YMYL check on inbound corpus (artifact + why-this-matters).
  // -------------------------------------------------------------------------
  const inboundCorpus = [
    input.artifactPreview,
    input.whyThisMatters,
    input.recipientContext ?? '',
  ].join('\n');
  const inboundYmyl = detectYmyl(inboundCorpus);
  const upstreamFlaggedYmyl = input.riskFlags.some((f) => f.startsWith('ymyl'));

  // -------------------------------------------------------------------------
  // 3. LLM call — Sonnet 4.6, cache_control ephemeral on system prompt.
  // -------------------------------------------------------------------------
  let llm: Anthropic.Message;
  try {
    llm = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 700,
      temperature: 0.3,
      system: [
        {
          type: 'text',
          text: buildApprovalGateSystemPrompt(),
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: buildApprovalGateUserPrompt({
            artifactType: input.artifactType,
            artifactPreview: input.artifactPreview,
            whyThisMatters: input.whyThisMatters,
            publishTarget: input.publishTarget,
            riskFlags: input.riskFlags,
            recipientContext: input.recipientContext,
            customerBriefDigest: {
              toneDescriptors: brief.toneDescriptors,
              doList: brief.doList,
              dontList: brief.dontList,
            },
          }),
        },
      ],
    });
  } catch (err: unknown) {
    const error = err as { status?: number; message?: string };
    console.error(
      JSON.stringify({
        event: 'llm_error',
        feature: 'approval_gate_writer',
        session_id: sessionId,
        customer_id: input.customerId,
        status: error.status ?? null,
        message: error.message ?? 'unknown',
      }),
    );
    if (error.status === 429) {
      throw new Error(
        `[approval-gate-writer] LLM rate limit — retry with backoff: ${error.message ?? 'unknown'}`,
      );
    }
    if (error.status === 529) {
      throw new Error(
        `[approval-gate-writer] LLM overload — fail gracefully: ${error.message ?? 'unknown'}`,
      );
    }
    return { kind: 'aborted', reason: 'llm_error', costUsd: 0 };
  }

  // -------------------------------------------------------------------------
  // 4. Cost log + per-run ceiling check
  // -------------------------------------------------------------------------
  const inputTokens = llm.usage.input_tokens;
  const outputTokens = llm.usage.output_tokens;
  const cacheReadTokens =
    (llm.usage as { cache_read_input_tokens?: number }).cache_read_input_tokens ?? 0;
  const costUsd = computeCostUsd(inputTokens, outputTokens, cacheReadTokens);

  console.log(
    JSON.stringify({
      event: 'llm_call',
      model: MODEL,
      feature: 'approval_gate_writer',
      session_id: sessionId,
      customer_id: input.customerId,
      artifact_type: input.artifactType,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cache_read_tokens: cacheReadTokens,
      cost_usd: costUsd,
    }),
  );

  if (costUsd > RUN_COST_CEILING_USD) {
    console.error(
      JSON.stringify({
        event: 'cost_ceiling_exceeded',
        feature: 'approval_gate_writer',
        customer_id: input.customerId,
        cost_usd: costUsd,
        ceiling: RUN_COST_CEILING_USD,
      }),
    );
    await logAudit(auditClient, {
      actor_type: 'agent',
      event_type: 'approval_gate_writer.aborted_cost_ceiling',
      target_id: input.customerId,
      target_table: 'user_profiles',
      payload: {
        cost_usd: costUsd,
        ceiling: RUN_COST_CEILING_USD,
        artifact_type: input.artifactType,
        artifact_id: input.artifactId,
      },
    });
    return { kind: 'aborted', reason: 'cost_ceiling', costUsd };
  }

  if (costUsd > COST_ALERT_THRESHOLD_USD && deps.emitCostAlert) {
    await deps.emitCostAlert({
      customerId: input.customerId,
      feature: 'approval_gate_writer',
      costUsd,
    });
  }

  // -------------------------------------------------------------------------
  // 5. Parse the draft
  // -------------------------------------------------------------------------
  const block = llm.content[0];
  if (!block || block.type !== 'text') {
    return { kind: 'aborted', reason: 'draft_invalid', costUsd };
  }
  const rawDraft = parseApprovalCardDraft(block.text);
  if (!rawDraft) {
    return { kind: 'aborted', reason: 'draft_invalid', costUsd };
  }

  // -------------------------------------------------------------------------
  // 6. Post-generation YMYL scan + enforcement
  //    Late catch = inbound corpus / draft has YMYL but upstream didn't flag.
  // -------------------------------------------------------------------------
  const draftCorpus = [
    rawDraft.title,
    rawDraft.value_one_liner,
    rawDraft.preview,
  ].join('\n');
  const draftYmyl = detectYmyl(draftCorpus);
  const ymyl = inboundYmyl ?? draftYmyl;
  const lateYmylCatch = ymyl !== null && !upstreamFlaggedYmyl;

  // If YMYL detected, ensure the risk flag is recorded and the framing is enforced.
  const finalRiskFlags: RiskFlag[] = ymyl
    ? Array.from(new Set<RiskFlag>([...input.riskFlags, 'ymyl']))
    : input.riskFlags;
  const draft = enforceYmylFraming(rawDraft, ymyl);

  // -------------------------------------------------------------------------
  // 7. Audit the draft generation
  // -------------------------------------------------------------------------
  await logAudit(auditClient, {
    actor_type: 'agent',
    event_type: 'approval_gate_writer.draft_generated',
    target_id: input.artifactId,
    target_table: 'approval_queue',
    payload: {
      customer_id: input.customerId,
      artifact_type: input.artifactType,
      cost_usd: costUsd,
      brief_version_id: brief.briefVersionId,
      ymyl: ymyl ? ymyl.reason : null,
      late_ymyl_catch: lateYmylCatch,
      requires_human_approval_flag: brief.requiresHumanApproval,
      session_id: sessionId,
    },
  });

  // -------------------------------------------------------------------------
  // 8. Insert approval_queue row.
  //    Outreach (email_as_them, outreach) get 48h expiry; others 7d.
  // -------------------------------------------------------------------------
  const expiryHours = EXPIRY_HOURS_BY_TYPE[input.artifactType];
  const expiresAt = new Date(now().getTime() + expiryHours * 60 * 60 * 1000);

  let inserted: ApprovalQueueRowInsertResult;
  try {
    inserted = await insertApprovalQueueRow({
      customerId: input.customerId,
      draft,
      artifactType: input.artifactType,
      artifactId: input.artifactId,
      whyThisMatters: input.whyThisMatters,
      publishTarget: input.publishTarget,
      scheduledFor: input.scheduledFor ?? null,
      riskFlags: finalRiskFlags,
      ymyl,
      briefVersionId: brief.briefVersionId,
      expiresAt,
      client: supabase,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error(
      JSON.stringify({
        event: 'approval_queue_insert_failed',
        feature: 'approval_gate_writer',
        customer_id: input.customerId,
        artifact_id: input.artifactId,
        error: message,
      }),
    );
    return { kind: 'aborted', reason: 'draft_invalid', costUsd };
  }

  await logAudit(auditClient, {
    actor_type: 'agent',
    event_type: 'approval_gate_writer.queued',
    target_id: inserted.id,
    target_table: 'approval_queue',
    payload: {
      customer_id: input.customerId,
      artifact_type: input.artifactType,
      artifact_id: input.artifactId,
      kind: mapArtifactToKind(input.artifactType),
      cost_usd: costUsd,
      brief_version_id: brief.briefVersionId,
      ymyl: ymyl ? ymyl.reason : null,
      late_ymyl_catch: lateYmylCatch,
      expires_at: expiresAt.toISOString(),
      session_id: sessionId,
    },
  });

  // -------------------------------------------------------------------------
  // 9. Fire `approval.created` for the email handler (Group C.1).
  // -------------------------------------------------------------------------
  if (deps.emitApprovalCreated) {
    await deps.emitApprovalCreated({
      approvalQueueId: inserted.id,
      approvalToken: inserted.approvalToken,
      customerId: input.customerId,
      artifactType: input.artifactType,
      artifactId: input.artifactId,
      ymyl: ymyl !== null,
      expiresAt: expiresAt.toISOString(),
    });
  }

  return {
    kind: 'queued',
    approvalQueueId: inserted.id,
    approvalToken: inserted.approvalToken,
    draft,
    costUsd,
    late_ymyl_catch: lateYmylCatch,
  };
}

// Re-export types for callers
export type {
  ApprovalCardDraft,
  ApprovalGateOutcome,
  ApprovalKind,
  ArtifactType,
  GatedPublishRequestedEvent,
  RiskFlag,
} from './types';
