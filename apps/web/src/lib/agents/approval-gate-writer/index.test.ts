/**
 * Approval-Gate Writer — tests.
 *
 * Run with `pnpm -F @beamix/web exec vitest run src/lib/agents/approval-gate-writer`.
 *
 * Covers:
 *   - YMYL detection (medical / legal / financial keywords + negative case)
 *   - enforceYmylFraming idempotence + label override
 *   - approval_queue insert payload shape
 *   - LLM error handling + cost-alert emission
 *   - mapArtifactToKind exhaustiveness
 *   - parseApprovalCardDraft JSON / markdown-fence handling
 */

import { test, expect, vi } from 'vitest';
import type Anthropic from '@anthropic-ai/sdk';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  computeCostUsd,
  enforceYmylFraming,
  mapArtifactToKind,
  parseApprovalCardDraft,
  runApprovalGateWriter,
  RUN_COST_CEILING_USD,
  COST_ALERT_THRESHOLD_USD,
  type AnthropicLike,
  type RunApprovalGateWriterDeps,
} from './index';
import type { ApprovalGateInput } from './index';
import type { ApprovalCardDraft, ApprovalKind, ArtifactType } from './types';
import { detectYmyl } from '../shared/ymyl';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const BASE_DRAFT: ApprovalCardDraft = {
  title: 'New FAQ block: how shipping works',
  value_one_liner: 'Answers a top question in AI search, lifts mentions on ChatGPT.',
  preview: 'Q: How fast do orders ship?\nA: Most ship within 24 hours from our LA warehouse.',
  approve_label: 'Looks good — publish',
  change_label: 'Change this',
  reject_label: 'Skip this one',
};

function baseInput(overrides: Partial<ApprovalGateInput> = {}): ApprovalGateInput {
  return {
    customerId: '00000000-0000-0000-0000-000000000001',
    artifactType: 'faq',
    artifactId: '00000000-0000-0000-0000-000000000002',
    artifactPreview: 'Q: How fast do orders ship?\nA: Within 24 hours.',
    whyThisMatters: 'Lifts visibility on shipping queries — ChatGPT mentions you more.',
    publishTarget: 'your FAQ page at /faq, immediately',
    riskFlags: [],
    scheduledFor: '2026-05-30T10:00:00Z',
    ...overrides,
  };
}

interface InsertedRow {
  table: string;
  row: Record<string, unknown>;
}

interface FakeSupabaseOptions {
  brief?: {
    voice: { tone_descriptors?: string[] } | null;
    do_list: string[];
    dont_list: string[];
    requires_human_approval: boolean;
    brief_version_id: string;
  } | null;
  failInsert?: boolean;
}

function fakeSupabase(opts: FakeSupabaseOptions = {}) {
  const inserts: InsertedRow[] = [];
  const brief =
    opts.brief === undefined
      ? {
          voice: { tone_descriptors: ['direct', 'warm'] },
          do_list: ['be concrete'],
          dont_list: ['no exclamation marks'],
          requires_human_approval: false,
          brief_version_id: '00000000-0000-0000-0000-000000000099',
        }
      : opts.brief;

  // Minimal Supabase-shaped client. We hand-write only the methods used.
  const client = {
    from(table: string) {
      return {
        // brand_fingerprints lookup
        select(_cols: string) {
          return {
            eq(_col: string, _val: string) {
              return {
                async maybeSingle() {
                  if (table === 'brand_fingerprints') {
                    return { data: brief, error: null };
                  }
                  return { data: null, error: null };
                },
              };
            },
          };
        },
        // approval_queue insert
        insert(row: Record<string, unknown>) {
          inserts.push({ table, row });
          if (opts.failInsert) {
            return {
              select() {
                return {
                  async single() {
                    return { data: null, error: { message: 'insert failed' } };
                  },
                };
              },
              // Also support the audit_log case (no select chain).
              async then(resolve: (v: { error: { message: string } | null }) => void) {
                resolve({ error: { message: 'insert failed' } });
              },
            };
          }
          return {
            select(_cols: string) {
              return {
                async single() {
                  return { data: { id: 'queue-row-id-1234' }, error: null };
                },
              };
            },
            // audit_log path — supabase call awaited without select()
            async then(resolve: (v: { error: { message: string } | null }) => void) {
              resolve({ error: null });
            },
          };
        },
      };
    },
  };
  return { client: client as unknown as SupabaseClient, inserts };
}

function fakeAnthropic(jsonText: string, usage = { input_tokens: 500, output_tokens: 200 }): AnthropicLike {
  return {
    messages: {
      async create(): Promise<Anthropic.Message> {
        return {
          id: 'msg_test',
          type: 'message',
          role: 'assistant',
          model: 'claude-sonnet-4-6',
          stop_reason: 'end_turn',
          stop_sequence: null,
          content: [{ type: 'text', text: jsonText, citations: null } as Anthropic.TextBlock],
          usage: {
            input_tokens: usage.input_tokens,
            output_tokens: usage.output_tokens,
            cache_creation_input_tokens: 0,
            cache_read_input_tokens: 0,
            server_tool_use: null,
            service_tier: null,
          } as unknown as Anthropic.Usage,
        } as Anthropic.Message;
      },
    },
  };
}

function jsonDraft(d: ApprovalCardDraft): string {
  return JSON.stringify(d);
}

// ---------------------------------------------------------------------------
// detectYmyl — positive + negative cases
// ---------------------------------------------------------------------------

test('detectYmyl flags medical keywords', () => {
  const m = detectYmyl('We offer treatment options for chronic pain symptoms.');
  expect(m).toBeTruthy();
  expect(m?.reason).toBe('Medical advice');
});

test('detectYmyl flags legal keywords', () => {
  const m = detectYmyl('This constitutes legal advice for your lawsuit.');
  expect(m).toBeTruthy();
  expect(m?.reason).toBe('Legal advice');
});

test('detectYmyl flags financial keywords', () => {
  const m = detectYmyl('Our portfolio allocation offers guaranteed return.');
  expect(m).toBeTruthy();
  expect(m?.reason).toBe('Financial advice');
});

test('detectYmyl flags explicit YMYL marker', () => {
  const m = detectYmyl('Heads-up: this artifact is YMYL.');
  expect(m).toBeTruthy();
  expect(m?.reason).toBe('Explicit YMYL flag');
});

test('detectYmyl negative — ordinary marketing copy', () => {
  const m = detectYmyl('Our new FAQ block explains shipping turnaround for online orders.');
  expect(m).toBeNull();
});

test('detectYmyl negative — empty corpus', () => {
  expect(detectYmyl('')).toBeNull();
});

// ---------------------------------------------------------------------------
// enforceYmylFraming
// ---------------------------------------------------------------------------

test('enforceYmylFraming adds verbatim medical prefix + confirm label', () => {
  const ymyl = detectYmyl('treatment side-effects');
  expect(ymyl).toBeTruthy();
  const out = enforceYmylFraming(BASE_DRAFT, ymyl);
  expect(out.title.startsWith('Medical claim — review carefully: ')).toBe(true);
  expect(out.value_one_liner.endsWith(' — please confirm accurate for your practice.')).toBe(true);
  expect(out.approve_label).toBe('I confirm and approve');
});

test('enforceYmylFraming adds verbatim legal prefix', () => {
  const ymyl = detectYmyl('legal advice on litigation');
  expect(ymyl).toBeTruthy();
  const out = enforceYmylFraming(BASE_DRAFT, ymyl);
  expect(out.title.startsWith('Legal advice content — review carefully: ')).toBe(true);
});

test('enforceYmylFraming is idempotent — does not double-prefix', () => {
  const ymyl = detectYmyl('treatment');
  expect(ymyl).toBeTruthy();
  const once = enforceYmylFraming(BASE_DRAFT, ymyl);
  const twice = enforceYmylFraming(once, ymyl);
  expect(once.title).toBe(twice.title);
  expect(once.value_one_liner).toBe(twice.value_one_liner);
});

test('enforceYmylFraming is no-op when no YMYL match', () => {
  const out = enforceYmylFraming(BASE_DRAFT, null);
  expect(out).toEqual(BASE_DRAFT);
});

// ---------------------------------------------------------------------------
// mapArtifactToKind — covers every ArtifactType
// ---------------------------------------------------------------------------

test('mapArtifactToKind covers every artifact type', () => {
  const expected: Record<ArtifactType, ApprovalKind> = {
    blog_post: 'content_publish',
    faq: 'content_publish',
    outreach_email: 'email_as_them',
    schema_change: 'schema_push',
    citation_outreach: 'outreach',
    listing_update: 'listing_update',
  };
  for (const [artifact, kind] of Object.entries(expected) as [ArtifactType, ApprovalKind][]) {
    expect(mapArtifactToKind(artifact)).toBe(kind);
  }
});

// ---------------------------------------------------------------------------
// parseApprovalCardDraft — JSON + fence handling + reject-invalid
// ---------------------------------------------------------------------------

test('parseApprovalCardDraft accepts plain JSON', () => {
  const out = parseApprovalCardDraft(jsonDraft(BASE_DRAFT));
  expect(out).toBeTruthy();
  expect(out?.title).toBe(BASE_DRAFT.title);
});

test('parseApprovalCardDraft strips markdown fences', () => {
  const fenced = '```json\n' + jsonDraft(BASE_DRAFT) + '\n```';
  const out = parseApprovalCardDraft(fenced);
  expect(out).toBeTruthy();
});

test('parseApprovalCardDraft returns null on missing fields', () => {
  const bad = JSON.stringify({ title: 'only a title' });
  expect(parseApprovalCardDraft(bad)).toBeNull();
});

test('parseApprovalCardDraft returns null on non-JSON', () => {
  expect(parseApprovalCardDraft('not json')).toBeNull();
});

// ---------------------------------------------------------------------------
// computeCostUsd — sanity check
// ---------------------------------------------------------------------------

test('computeCostUsd uses Sonnet 4.6 pricing', () => {
  // 1M input + 1M output should be $3 + $15 = $18
  expect(computeCostUsd(1_000_000, 1_000_000, 0)).toBe(18);
  // Cache reads at 10% of input price
  expect(computeCostUsd(0, 0, 1_000_000)).toBe(0.3);
});

// ---------------------------------------------------------------------------
// runApprovalGateWriter — integration with mocked deps
// ---------------------------------------------------------------------------

test('runApprovalGateWriter queues a card with the right shape', async () => {
  const { client, inserts } = fakeSupabase();
  const emitApprovalCreated = vi.fn<(payload: Record<string, unknown>) => Promise<void>>(() =>
    Promise.resolve(),
  );
  const deps: RunApprovalGateWriterDeps = {
    anthropic: fakeAnthropic(jsonDraft(BASE_DRAFT)),
    supabase: client,
    emitApprovalCreated,
  };

  const outcome = await runApprovalGateWriter(baseInput(), deps);
  expect(outcome.kind).toBe('queued');
  if (outcome.kind !== 'queued') return;

  // approval_queue row shape
  const queueInsert = inserts.find((i) => i.table === 'approval_queue');
  expect(queueInsert).toBeTruthy();
  const row = queueInsert!.row;
  expect(row.kind).toBe('content_publish');
  expect(row.state).toBe('pending');
  expect(typeof row.approval_token === 'string' && (row.approval_token as string).length > 10).toBe(true);
  expect(row.evidence && typeof row.evidence === 'object').toBeTruthy();
  const evidence = row.evidence as Record<string, unknown>;
  expect(evidence.draft).toBeTruthy();
  expect(evidence.provenance).toBeTruthy();
  const provenance = evidence.provenance as Record<string, unknown>;
  expect(provenance.generated_by).toBe('approval_gate_writer');
  expect(provenance.source_event).toBe('gated_publish.requested');
  expect(provenance.brief_version_id).toBe('00000000-0000-0000-0000-000000000099');

  // approval.created emitted
  expect(emitApprovalCreated).toHaveBeenCalledTimes(1);
  const firstCall = emitApprovalCreated.mock.calls[0];
  expect(firstCall).toBeTruthy();
  const call = firstCall[0] as Record<string, unknown> | undefined;
  expect(call?.approvalQueueId).toBe('queue-row-id-1234');
  expect(call?.ymyl).toBe(false);
});

test('runApprovalGateWriter enforces YMYL framing on late catch', async () => {
  const { client, inserts } = fakeSupabase();
  const outcome = await runApprovalGateWriter(
    baseInput({
      artifactPreview: 'Our treatment helps with chronic pain symptoms.',
      whyThisMatters: 'More people find your medical practice.',
    }),
    {
      anthropic: fakeAnthropic(jsonDraft(BASE_DRAFT)), // LLM produced a NON-YMYL framed draft
      supabase: client,
    },
  );

  expect(outcome.kind).toBe('queued');
  if (outcome.kind !== 'queued') return;
  expect(outcome.late_ymyl_catch).toBe(true);

  const queueInsert = inserts.find((i) => i.table === 'approval_queue');
  expect(queueInsert).toBeTruthy();
  const resource = (queueInsert!.row.resource ?? {}) as Record<string, unknown>;
  // Title must have been prefixed
  expect(
    typeof resource.title === 'string' &&
      (resource.title as string).startsWith('Medical claim — review carefully: '),
  ).toBe(true);
  expect(resource.approve_label).toBe('I confirm and approve');

  // risk_flags must include 'ymyl'
  const evidence = queueInsert!.row.evidence as Record<string, unknown>;
  expect(Array.isArray(evidence.risk_flags)).toBe(true);
  expect((evidence.risk_flags as string[]).includes('ymyl')).toBe(true);
});

test('runApprovalGateWriter aborts on missing brief', async () => {
  const { client } = fakeSupabase({ brief: null });
  const outcome = await runApprovalGateWriter(baseInput(), {
    anthropic: fakeAnthropic(jsonDraft(BASE_DRAFT)),
    supabase: client,
  });
  expect(outcome.kind).toBe('aborted');
  if (outcome.kind === 'aborted') {
    expect(outcome.reason).toBe('missing_brief');
    expect(outcome.costUsd).toBe(0);
  }
});

test('runApprovalGateWriter aborts on invalid LLM JSON', async () => {
  const { client } = fakeSupabase();
  const outcome = await runApprovalGateWriter(baseInput(), {
    anthropic: fakeAnthropic('not json at all'),
    supabase: client,
  });
  expect(outcome.kind).toBe('aborted');
  if (outcome.kind === 'aborted') {
    expect(outcome.reason).toBe('draft_invalid');
  }
});

test('runApprovalGateWriter applies 48h expiry for outreach kinds', async () => {
  const { client, inserts } = fakeSupabase();
  const fixedNow = new Date('2026-06-01T12:00:00Z');
  await runApprovalGateWriter(baseInput({ artifactType: 'outreach_email' }), {
    anthropic: fakeAnthropic(jsonDraft(BASE_DRAFT)),
    supabase: client,
    now: () => fixedNow,
  });
  const queueInsert = inserts.find((i) => i.table === 'approval_queue');
  expect(queueInsert).toBeTruthy();
  const expiresAt = queueInsert!.row.expires_at as string;
  // 48h after 2026-06-01T12:00:00Z = 2026-06-03T12:00:00Z
  expect(expiresAt).toBe('2026-06-03T12:00:00.000Z');
  expect(queueInsert!.row.kind).toBe('email_as_them');
});

test('runApprovalGateWriter applies 7d expiry for blog_post', async () => {
  const { client, inserts } = fakeSupabase();
  const fixedNow = new Date('2026-06-01T12:00:00Z');
  await runApprovalGateWriter(baseInput({ artifactType: 'blog_post' }), {
    anthropic: fakeAnthropic(jsonDraft(BASE_DRAFT)),
    supabase: client,
    now: () => fixedNow,
  });
  const queueInsert = inserts.find((i) => i.table === 'approval_queue');
  expect(queueInsert).toBeTruthy();
  const expiresAt = queueInsert!.row.expires_at as string;
  expect(expiresAt).toBe('2026-06-08T12:00:00.000Z');
});

test('runApprovalGateWriter emits cost.alert above threshold', async () => {
  const { client } = fakeSupabase();
  // 200k input tokens at $3/1M = $0.60 (above $0.50 alert threshold, below $1 ceiling)
  const emitCostAlert = vi.fn<(payload: Record<string, unknown>) => Promise<void>>(() =>
    Promise.resolve(),
  );
  const outcome = await runApprovalGateWriter(baseInput(), {
    anthropic: fakeAnthropic(jsonDraft(BASE_DRAFT), {
      input_tokens: 200_000,
      output_tokens: 0,
    }),
    supabase: client,
    emitCostAlert,
  });
  expect(outcome.kind).toBe('queued');
  expect(emitCostAlert).toHaveBeenCalledTimes(1);
  const alertCall = emitCostAlert.mock.calls[0];
  expect(alertCall).toBeTruthy();
  const args = alertCall[0] as Record<string, unknown>;
  expect(args.feature).toBe('approval_gate_writer');
  expect((args.costUsd as number) > COST_ALERT_THRESHOLD_USD).toBe(true);
});

test('runApprovalGateWriter aborts above cost ceiling', async () => {
  const { client } = fakeSupabase();
  // 500k input tokens at $3/1M = $1.50 (above $1 ceiling)
  const outcome = await runApprovalGateWriter(baseInput(), {
    anthropic: fakeAnthropic(jsonDraft(BASE_DRAFT), {
      input_tokens: 500_000,
      output_tokens: 0,
    }),
    supabase: client,
  });
  expect(outcome.kind).toBe('aborted');
  if (outcome.kind === 'aborted') {
    expect(outcome.reason).toBe('cost_ceiling');
    expect(outcome.costUsd > RUN_COST_CEILING_USD).toBe(true);
  }
});

test('runApprovalGateWriter rethrows on LLM rate-limit (429)', async () => {
  const { client } = fakeSupabase();
  const anthropic: AnthropicLike = {
    messages: {
      async create() {
        const err = new Error('rate limited') as Error & { status: number };
        err.status = 429;
        throw err;
      },
    },
  };
  await expect(
    runApprovalGateWriter(baseInput(), { anthropic, supabase: client }),
  ).rejects.toThrow(/rate limit/);
});

test('runApprovalGateWriter rethrows on LLM overload (529)', async () => {
  const { client } = fakeSupabase();
  const anthropic: AnthropicLike = {
    messages: {
      async create() {
        const err = new Error('overloaded') as Error & { status: number };
        err.status = 529;
        throw err;
      },
    },
  };
  await expect(
    runApprovalGateWriter(baseInput(), { anthropic, supabase: client }),
  ).rejects.toThrow(/overload/);
});

test('runApprovalGateWriter returns aborted on generic LLM error', async () => {
  const { client } = fakeSupabase();
  const anthropic: AnthropicLike = {
    messages: {
      async create() {
        const err = new Error('bad request') as Error & { status: number };
        err.status = 400;
        throw err;
      },
    },
  };
  const outcome = await runApprovalGateWriter(baseInput(), { anthropic, supabase: client });
  expect(outcome.kind).toBe('aborted');
  if (outcome.kind === 'aborted') expect(outcome.reason).toBe('llm_error');
});
