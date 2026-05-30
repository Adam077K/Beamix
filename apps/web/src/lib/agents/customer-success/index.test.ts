/**
 * Customer Success Agent — tests.
 *
 * Run with `pnpm -F @beamix/web exec vitest run src/lib/agents/customer-success`.
 *
 * Covers:
 *   - happy path: sends email + audit row
 *   - YMYL inbound corpus -> defers to approval_queue, NEVER sends
 *   - requires_human_approval flag -> defers to approval_queue
 *   - draft parse failure -> aborted
 *   - cost ceiling -> aborted
 */

import { test, expect, vi } from 'vitest';
import type Anthropic from '@anthropic-ai/sdk';
import type { SupabaseClient } from '@supabase/supabase-js';

// Stub the React Email template module before importing the agent.
// Vite's import-analysis chokes on the TSX (Next's jsx: preserve tsconfig),
// and the agent doesn't actually need to render the email in unit tests.
vi.mock('../../../emails/success-nudge', () => ({
  SuccessNudgeEmail: () => null,
}));

import {
  runCustomerSuccessNudge,
  type AnthropicLike,
  type CustomerSuccessInput,
  type NudgeDraft,
  type RunCustomerSuccessNudgeDeps,
} from './index';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function baseInput(overrides: Partial<CustomerSuccessInput> = {}): CustomerSuccessInput {
  return {
    customerId: '00000000-0000-0000-0000-000000000001',
    customerEmail: 'customer@example.com',
    firstName: 'Alex',
    businessName: 'Acme Co',
    trigger: 'cron_weekly',
    weeklyContext: {
      wins: ['mentioned by ChatGPT on shipping queries'],
      queued: ['new FAQ block scheduled for Tuesday'],
      concerns: [],
    },
    requiresHumanApproval: false,
    briefVersionId: '00000000-0000-0000-0000-000000000099',
    toneDescriptors: ['direct', 'warm'],
    ctaUrl: 'https://app.beamix.example/dashboard',
    ...overrides,
  };
}

const VALID_DRAFT: NudgeDraft = {
  subject: 'Acme Co — your week at a glance',
  highlights: ['ChatGPT mentioned you for shipping questions'],
  comingUp: ['new FAQ block goes live Tuesday'],
  intro: 'Quick check-in.',
};

function jsonDraft(d: NudgeDraft): string {
  return JSON.stringify({
    subject: d.subject,
    highlights: d.highlights,
    coming_up: d.comingUp,
    intro: d.intro,
  });
}

interface InsertedRow {
  table: string;
  row: Record<string, unknown>;
}

function fakeSupabase() {
  const inserts: InsertedRow[] = [];
  const client = {
    from(table: string) {
      return {
        insert(row: Record<string, unknown>) {
          inserts.push({ table, row });
          return {
            select(_cols: string) {
              return {
                async single() {
                  return { data: { id: 'queue-id-9999' }, error: null };
                },
              };
            },
            // audit_log path
            async then(resolve: (v: { error: { message: string } | null }) => void) {
              resolve({ error: null });
            },
          };
        },
      };
    },
  };
  return {
    client: client as unknown as SupabaseClient,
    inserts,
  };
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

function fakeSender(opts: { ok?: boolean } = {}) {
  const calls: Array<{ to: string; subject: string }> = [];
  const fn = async (input: { to: string; subject: string; react: unknown; text?: string }) => {
    calls.push({ to: input.to, subject: input.subject });
    if (opts.ok === false) {
      return { ok: false as const, error: 'send failed' };
    }
    return { ok: true as const, messageId: 'resend-id-42' };
  };
  return { sender: fn, calls };
}

// ---------------------------------------------------------------------------
// Happy path
// ---------------------------------------------------------------------------

test('customer-success: happy path sends email + writes audit row', async () => {
  const { client, inserts } = fakeSupabase();
  const { sender, calls } = fakeSender();
  const deps: RunCustomerSuccessNudgeDeps = {
    anthropic: fakeAnthropic(jsonDraft(VALID_DRAFT)),
    supabase: client,
    sendEmail: sender,
  };

  const outcome = await runCustomerSuccessNudge(baseInput(), deps);
  expect(outcome.kind).toBe('sent');
  if (outcome.kind !== 'sent') return;
  expect(outcome.messageId).toBe('resend-id-42');
  expect(calls.length).toBe(1);
  expect(calls[0].to).toBe('customer@example.com');

  // audit row with event_type 'customer_success.nudge_sent'
  const auditRows = inserts.filter((i) => i.table === 'audit_log');
  expect(
    auditRows.some((r) => r.row.event_type === 'customer_success.nudge_sent'),
  ).toBe(true);
});

// ---------------------------------------------------------------------------
// YMYL hard-gate
// ---------------------------------------------------------------------------

test('customer-success: YMYL inbound -> defers, never sends', async () => {
  const { client, inserts } = fakeSupabase();
  const { sender, calls } = fakeSender();
  const ymylInput = baseInput({
    weeklyContext: {
      wins: ['Our medical treatment helped 50 new patients last week'],
      queued: ['running a clinical trial outreach'],
      concerns: [],
    },
  });
  const outcome = await runCustomerSuccessNudge(ymylInput, {
    anthropic: fakeAnthropic(jsonDraft(VALID_DRAFT)),
    supabase: client,
    sendEmail: sender,
  });
  expect(outcome.kind).toBe('deferred_approval');
  if (outcome.kind === 'deferred_approval') {
    expect(outcome.reason).toBe('ymyl');
    expect(outcome.approvalQueueId).toBe('queue-id-9999');
  }
  // NEVER sent
  expect(calls.length).toBe(0);
  // approval_queue insert with kind=email_as_them + risk_flags includes ymyl
  const queueRow = inserts.find((i) => i.table === 'approval_queue');
  expect(queueRow).toBeTruthy();
  expect(queueRow!.row.kind).toBe('email_as_them');
  const evidence = queueRow!.row.evidence as Record<string, unknown>;
  expect(Array.isArray(evidence.risk_flags)).toBe(true);
  expect((evidence.risk_flags as string[]).includes('ymyl')).toBe(true);
  // ymyl_deferred audit row
  const auditRows = inserts.filter((i) => i.table === 'audit_log');
  expect(auditRows.some((r) => r.row.event_type === 'customer_success.ymyl_deferred')).toBe(true);
});

// ---------------------------------------------------------------------------
// requires_human_approval flag
// ---------------------------------------------------------------------------

test('customer-success: requires_human_approval -> defers, never sends', async () => {
  const { client, inserts } = fakeSupabase();
  const { sender, calls } = fakeSender();
  const outcome = await runCustomerSuccessNudge(
    baseInput({ requiresHumanApproval: true }),
    { anthropic: fakeAnthropic(jsonDraft(VALID_DRAFT)), supabase: client, sendEmail: sender },
  );
  expect(outcome.kind).toBe('deferred_approval');
  if (outcome.kind === 'deferred_approval') {
    expect(outcome.reason).toBe('requires_human_approval');
  }
  expect(calls.length).toBe(0);
  const auditRows = inserts.filter((i) => i.table === 'audit_log');
  expect(auditRows.some((r) => r.row.event_type === 'customer_success.approval_deferred')).toBe(true);
});

// ---------------------------------------------------------------------------
// Invalid draft
// ---------------------------------------------------------------------------

test('customer-success: aborts on invalid LLM JSON', async () => {
  const { client } = fakeSupabase();
  const { sender, calls } = fakeSender();
  const outcome = await runCustomerSuccessNudge(baseInput(), {
    anthropic: fakeAnthropic('not json'),
    supabase: client,
    sendEmail: sender,
  });
  expect(outcome.kind).toBe('aborted');
  if (outcome.kind === 'aborted') expect(outcome.reason).toBe('draft_invalid');
  expect(calls.length).toBe(0);
});

// ---------------------------------------------------------------------------
// Cost ceiling
// ---------------------------------------------------------------------------

test('customer-success: aborts above cost ceiling', async () => {
  const { client } = fakeSupabase();
  const { sender, calls } = fakeSender();
  // 500k input * $3/1M = $1.50 > $1 ceiling
  const outcome = await runCustomerSuccessNudge(baseInput(), {
    anthropic: fakeAnthropic(jsonDraft(VALID_DRAFT), {
      input_tokens: 500_000,
      output_tokens: 0,
    }),
    supabase: client,
    sendEmail: sender,
  });
  expect(outcome.kind).toBe('aborted');
  if (outcome.kind === 'aborted') {
    expect(outcome.reason).toBe('cost_ceiling');
    expect(outcome.costUsd > 1.0).toBe(true);
  }
  expect(calls.length).toBe(0);
});

test('customer-success: emits cost alert above threshold but below ceiling', async () => {
  const { client } = fakeSupabase();
  const { sender } = fakeSender();
  const emitCostAlert = vi.fn(() => Promise.resolve());
  const outcome = await runCustomerSuccessNudge(baseInput(), {
    anthropic: fakeAnthropic(jsonDraft(VALID_DRAFT), {
      input_tokens: 200_000,
      output_tokens: 0,
    }),
    supabase: client,
    sendEmail: sender,
    emitCostAlert,
  });
  expect(outcome.kind).toBe('sent');
  expect(emitCostAlert).toHaveBeenCalledTimes(1);
});
