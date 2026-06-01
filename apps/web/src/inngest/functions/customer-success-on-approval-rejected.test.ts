/**
 * Tests for customer-success-on-approval-rejected Inngest function.
 *
 * Test matrix:
 *   1. fn id and event binding are correct.
 *   2. retries is 2.
 *   3. concurrency is keyed on customerId with limit 1.
 *   4. trigger passed to runCustomerSuccessNudge is 'approval_rejected'.
 *   5. emitCostAlert → step.sendEvent with 'cost.alert' and correct shape.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Env vars — must be set before module import so getRawAdminClient doesn't throw
// ---------------------------------------------------------------------------
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
vi.mock('server-only', () => ({}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      maybeSingle: vi.fn().mockResolvedValue({
        data: {
          email: 'owner@acme.com',
          full_name: 'Alex Smith',
        },
        error: null,
      }),
    }),
  }),
}));

const mockRunCustomerSuccessNudge = vi.fn();
vi.mock('../../lib/agents/customer-success/index', () => ({
  runCustomerSuccessNudge: mockRunCustomerSuccessNudge,
}));

const mockBuildWeeklyContext = vi.fn();
vi.mock('../../lib/agents/customer-success/weekly-context', () => ({
  buildWeeklyContext: mockBuildWeeklyContext,
}));

// ---------------------------------------------------------------------------
// Capture createFunction
// ---------------------------------------------------------------------------
type EventHandler = (ctx: {
  event: { data: Record<string, unknown> };
  step: {
    run: (name: string, fn: () => Promise<unknown>) => Promise<unknown>;
    sendEvent: (id: string, event: { name: string; data: unknown }) => Promise<void>;
  };
}) => Promise<unknown>;

let capturedHandler: EventHandler | null = null;
let capturedConfig: {
  id: string;
  retries?: number;
  concurrency?: { key: string; limit: number };
} | null = null;
let capturedTrigger: { event: string } | null = null;

vi.mock('../client', () => ({
  inngest: {
    createFunction: vi.fn(
      (
        config: { id: string; retries?: number; concurrency?: { key: string; limit: number } },
        trigger: { event: string },
        handler: EventHandler,
      ) => {
        capturedConfig = config;
        capturedTrigger = trigger;
        capturedHandler = handler;
        return { id: config.id };
      },
    ),
  },
}));

await import('./customer-success-on-approval-rejected');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE_EVENT = {
  approvalId: 'aq-001',
  kind: 'content_publish',
  customerId: 'cust-001',
  actedAt: new Date().toISOString(),
};

function buildStep() {
  const sendEvent = vi.fn().mockResolvedValue(undefined);
  const run = vi.fn().mockImplementation(async (_name: string, fn: () => Promise<unknown>) => fn());
  return { run, sendEvent };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('customer-success-on-approval-rejected Inngest function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRunCustomerSuccessNudge.mockResolvedValue({
      kind: 'sent',
      messageId: 'msg-1',
      costUsd: 0.01,
      draft: {},
    });
    mockBuildWeeklyContext.mockResolvedValue({
      wins: ['content piece approved'],
      queued: [],
      concerns: ['content rejected last week'],
    });
  });

  it('1. fn id is customer-success-on-approval-rejected', () => {
    expect(capturedConfig?.id).toBe('customer-success-on-approval-rejected');
  });

  it('2. event binding is approval.rejected', () => {
    expect(capturedTrigger?.event).toBe('approval.rejected');
  });

  it('3. retries is 2', () => {
    expect(capturedConfig?.retries).toBe(2);
  });

  it('4. concurrency is keyed on event.data.customerId with limit 1', () => {
    expect(capturedConfig?.concurrency).toEqual({ key: 'event.data.customerId', limit: 1 });
  });

  it('5. trigger passed to runCustomerSuccessNudge is approval_rejected', async () => {
    const step = buildStep();
    await capturedHandler!({ event: { data: BASE_EVENT }, step });

    expect(mockRunCustomerSuccessNudge).toHaveBeenCalledOnce();
    const input = mockRunCustomerSuccessNudge.mock.calls[0][0] as { trigger: string };
    expect(input.trigger).toBe('approval_rejected');
  });

  it('6. emitCostAlert dep → step.sendEvent with cost.alert shape', async () => {
    mockRunCustomerSuccessNudge.mockImplementation(
      async (
        _input: unknown,
        deps: { emitCostAlert?: (p: { customerId: string; feature: string; costUsd: number }) => void },
      ) => {
        if (deps.emitCostAlert) {
          deps.emitCostAlert({ customerId: 'cust-001', feature: 'customer_success', costUsd: 0.6 });
        }
        return { kind: 'sent', messageId: 'msg-1', costUsd: 0.6, draft: {} };
      },
    );

    const step = buildStep();
    await capturedHandler!({ event: { data: BASE_EVENT }, step });

    const alertCall = step.sendEvent.mock.calls.find(
      ([_id, evt]: [string, { name: string }]) => evt.name === 'cost.alert',
    );
    expect(alertCall).toBeDefined();
    const [, sentEvent] = alertCall as [string, { name: string; data: Record<string, unknown> }];
    expect(sentEvent.data).toEqual({
      customerId: 'cust-001',
      feature: 'customer_success',
      costUsd: 0.6,
    });
  });
});
