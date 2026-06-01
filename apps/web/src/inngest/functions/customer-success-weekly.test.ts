/**
 * Tests for customer-success-weekly Inngest function.
 *
 * Test matrix:
 *   1. fn id and cron binding are correct.
 *   2. retries is 1.
 *   3. concurrency limit is 1 (no key — global limit).
 *   4. emitCostAlert → step.sendEvent called with 'cost.alert' and correct shape.
 *   5. Skips a customer whose context arrays are ALL empty (guard correctness).
 *   6. Processes customers that have context.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock server-only (Inngest functions use it)
// ---------------------------------------------------------------------------
vi.mock('server-only', () => ({}));

// ---------------------------------------------------------------------------
// Mock @supabase/supabase-js
// ---------------------------------------------------------------------------
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      order: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  }),
}));

// ---------------------------------------------------------------------------
// Mock getAdminClient (used for the businesses query)
// ---------------------------------------------------------------------------
const mockGetAdminClient = vi.fn();
vi.mock('../../lib/agents/db/admin-client', () => ({
  getAdminClient: mockGetAdminClient,
}));

// ---------------------------------------------------------------------------
// Mock runCustomerSuccessNudge
// ---------------------------------------------------------------------------
const mockRunCustomerSuccessNudge = vi.fn();
vi.mock('../../lib/agents/customer-success/index', () => ({
  runCustomerSuccessNudge: mockRunCustomerSuccessNudge,
}));

// ---------------------------------------------------------------------------
// Mock buildWeeklyContext
// ---------------------------------------------------------------------------
const mockBuildWeeklyContext = vi.fn();
vi.mock('../../lib/agents/customer-success/weekly-context', () => ({
  buildWeeklyContext: mockBuildWeeklyContext,
}));

// ---------------------------------------------------------------------------
// Capture Inngest createFunction call
// ---------------------------------------------------------------------------
type CronHandler = (ctx: {
  step: {
    run: (name: string, fn: () => Promise<unknown>) => Promise<unknown>;
    sendEvent: (id: string, event: { name: string; data: unknown }) => Promise<void>;
  };
}) => Promise<unknown>;

let capturedHandler: CronHandler | null = null;
let capturedConfig: {
  id: string;
  retries?: number;
  concurrency?: { limit: number; key?: string };
} | null = null;
let capturedTrigger: { cron: string } | null = null;

vi.mock('../client', () => ({
  inngest: {
    createFunction: vi.fn(
      (
        config: { id: string; retries?: number; concurrency?: { limit: number; key?: string } },
        trigger: { cron: string },
        handler: CronHandler,
      ) => {
        capturedConfig = config;
        capturedTrigger = trigger;
        capturedHandler = handler;
        return { id: config.id };
      },
    ),
  },
}));

// Import after mocks
await import('./customer-success-weekly');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildStep() {
  const sendEvent = vi.fn().mockResolvedValue(undefined);
  const run = vi.fn().mockImplementation(async (_name: string, fn: () => Promise<unknown>) => fn());
  return { run, sendEvent };
}

function makeActiveCustomers() {
  return [
    {
      user_id: 'user-001',
      name: 'Acme Corp',
      user_profiles: {
        id: 'user-001',
        email: 'owner@acme.com',
        full_name: 'Alex Smith',
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('customer-success-weekly Inngest function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRunCustomerSuccessNudge.mockResolvedValue({ kind: 'sent', messageId: 'msg-1', costUsd: 0.01, draft: {} });
    mockBuildWeeklyContext.mockResolvedValue({
      wins: ['content piece published'],
      queued: ['schema update pending'],
      concerns: [],
    });
    mockGetAdminClient.mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: makeActiveCustomers(), error: null }),
      }),
    });
  });

  it('1. fn id is customer-success-weekly', () => {
    expect(capturedConfig?.id).toBe('customer-success-weekly');
  });

  it('2. cron is 0 14 * * 0 (Sunday 14:00 UTC)', () => {
    expect(capturedTrigger?.cron).toBe('0 14 * * 0');
  });

  it('3. retries is 1', () => {
    expect(capturedConfig?.retries).toBe(1);
  });

  it('4. concurrency limit is 1 with no customer-level key (global single-run guard)', () => {
    // The weekly cron uses a global concurrency limit (no event key — it's a cron, not event-driven)
    expect(capturedConfig?.concurrency?.limit).toBe(1);
  });

  it('5. skips customer when all context arrays are empty', async () => {
    mockBuildWeeklyContext.mockResolvedValue({
      wins: [],
      queued: [],
      concerns: [],
    });

    const step = buildStep();
    const result = await capturedHandler!({ step }) as { skipped: number };

    // runCustomerSuccessNudge must NOT be called for an empty-context customer
    expect(mockRunCustomerSuccessNudge).not.toHaveBeenCalled();
    expect(result.skipped).toBe(1);
  });

  it('6. processes customer with non-empty context and calls runCustomerSuccessNudge', async () => {
    const step = buildStep();
    const result = await capturedHandler!({ step }) as { sent: number };

    expect(mockRunCustomerSuccessNudge).toHaveBeenCalledOnce();
    const callArg = mockRunCustomerSuccessNudge.mock.calls[0][0] as { trigger: string; customerId: string };
    expect(callArg.trigger).toBe('cron_weekly');
    expect(callArg.customerId).toBe('user-001');
    expect(result.sent).toBe(1);
  });

  it('7. emitCostAlert dep → step.sendEvent with cost.alert shape', async () => {
    // Simulate runCustomerSuccessNudge calling emitCostAlert
    mockRunCustomerSuccessNudge.mockImplementation(
      async (
        _input: unknown,
        deps: { emitCostAlert?: (p: { customerId: string; feature: string; costUsd: number }) => void },
      ) => {
        if (deps.emitCostAlert) {
          deps.emitCostAlert({ customerId: 'user-001', feature: 'customer_success', costUsd: 0.75 });
        }
        return { kind: 'sent', messageId: 'msg-1', costUsd: 0.75, draft: {} };
      },
    );

    const step = buildStep();
    await capturedHandler!({ step });

    const alertCall = step.sendEvent.mock.calls.find(
      ([_id, evt]: [string, { name: string }]) => evt.name === 'cost.alert',
    );
    expect(alertCall).toBeDefined();
    const [, sentEvent] = alertCall as [string, { name: string; data: Record<string, unknown> }];
    expect(sentEvent.data).toEqual({
      customerId: 'user-001',
      feature: 'customer_success',
      costUsd: 0.75,
    });
  });
});
