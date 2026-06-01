/**
 * Beamix — Deliverable Cap-Integrity Tests
 *
 * CRITICAL: Verifies that cap enforcement is never weakened by the fire-and-forget
 * `deliverables.over_cap` emit added in Phase C. Specifically:
 *
 *   - When `inngest.send` REJECTS (network error, Inngest down), the failure is
 *     logged via console.error AND OverTierCapError is STILL thrown immediately.
 *   - The emit failure must not swallow, delay, or prevent the cap throw.
 *
 * This test actually exercises the rejection path (not a resolving mock).
 *
 * Run: pnpm -F @beamix/web test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks — ALL registered before any import of the module under test
// ---------------------------------------------------------------------------

vi.mock('server-only', () => ({}));

// ---------------------------------------------------------------------------
// inngest.send mock — controllable per test
// ---------------------------------------------------------------------------
const mockInngestSend = vi.fn<[unknown], Promise<void>>();

vi.mock('../../inngest/client', () => ({
  inngest: {
    send: mockInngestSend,
  },
}));

// ---------------------------------------------------------------------------
// Supabase mock (raw client for deliverables_per_customer_per_month)
// ---------------------------------------------------------------------------

/** Shared mock state for the over-cap path */
let mockRpcResult: number | null = null;
let mockRpcError: { message: string } | null = null;
let mockMaybeSingleData: Record<string, unknown> | null = null;
let mockMaybeSingleError: { message: string } | null = null;
let mockUpsertError: { message: string } | null = null;

function resetMockState() {
  mockRpcResult = null;
  mockRpcError = null;
  mockMaybeSingleData = null;
  mockMaybeSingleError = null;
  mockUpsertError = null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeSelectChain(table: string): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chain: any = new Proxy(
    {},
    {
      get(_target, prop: string) {
        return (..._args: unknown[]) => {
          if (prop === 'single')
            return Promise.resolve({ data: { schema_pushed_count: 4, faq_published_count: 0, citation_submitted_count: 0, content_published_count: 0, outreach_email_count: 0 }, error: null });
          if (prop === 'maybeSingle')
            return Promise.resolve({ data: mockMaybeSingleData, error: mockMaybeSingleError });
          return chain;
        };
      },
    },
  );
  return chain;
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn((table: string) => ({
      upsert: vi.fn(() => Promise.resolve({ data: null, error: mockUpsertError })),
      select: vi.fn(() => makeSelectChain(table)),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  })),
}));

vi.mock('../agents/db/admin-client', () => ({
  getAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => ({
      select: vi.fn(() => makeSelectChain(table)),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    rpc: vi.fn(() => Promise.resolve({ data: mockRpcResult, error: mockRpcError })),
  })),
}));

// ---------------------------------------------------------------------------
// Env vars
// ---------------------------------------------------------------------------
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.INNGEST_EVENT_KEY = 'test-event-key';

// ---------------------------------------------------------------------------
// Import module under test — AFTER all mocks are registered
// ---------------------------------------------------------------------------
const { consumeDeliverable, OverTierCapError } = await import('./deliverables');

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('cap integrity — inngest.send failure must never weaken cap enforcement', () => {
  beforeEach(() => {
    resetMockState();
    vi.clearAllMocks();
    // Default: tier lookup returns 'starter' (capped tier, schema_pushed cap = 4)
    mockMaybeSingleData = { plan_id: 'plan-1', plans: { tier: 'starter' } };
    // Default: RPC returns null → over-cap
    mockRpcResult = null;
    mockRpcError = null;
  });

  it('CAP-INTEGRITY: OverTierCapError is thrown even when inngest.send REJECTS', async () => {
    // This is the critical path: inngest.send rejects (Inngest down / network error)
    const sendError = new Error('Inngest unreachable');
    mockInngestSend.mockRejectedValueOnce(sendError);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Expect the cap error to be thrown — send failure must not suppress it
    await expect(
      consumeDeliverable({
        customerId: '00000000-0000-0000-0000-000000000001',
        kind: 'schema_pushed',
        count: 1,
      }),
    ).rejects.toThrow(OverTierCapError);

    // The send failure MUST have been logged
    const errorCalls = consoleSpy.mock.calls;
    const overCapEmitLog = errorCalls.find((args) => {
      const firstArg = args[0];
      return (
        typeof firstArg === 'string' && firstArg.includes('over_cap emit failed')
      );
    });
    expect(overCapEmitLog).toBeDefined();

    consoleSpy.mockRestore();
  });

  it('CAP-INTEGRITY: OverTierCapError is thrown when inngest.send resolves (normal path)', async () => {
    // Verify the throw is unconditional even when emit succeeds
    mockInngestSend.mockResolvedValueOnce(undefined);

    await expect(
      consumeDeliverable({
        customerId: '00000000-0000-0000-0000-000000000002',
        kind: 'schema_pushed',
        count: 1,
      }),
    ).rejects.toThrow(OverTierCapError);
  });

  it('CAP-INTEGRITY: OverTierCapError kind/tier/cap fields are correct', async () => {
    mockInngestSend.mockResolvedValueOnce(undefined);

    let caught: unknown;
    try {
      await consumeDeliverable({
        customerId: '00000000-0000-0000-0000-000000000003',
        kind: 'schema_pushed',
        count: 1,
      });
    } catch (err) {
      caught = err;
    }

    expect(caught).toBeInstanceOf(OverTierCapError);
    const err = caught as OverTierCapError;
    expect(err.kind).toBe('schema_pushed');
    expect(err.currentTier).toBe('starter');
    // starter schema_pushed cap is 4
    expect(err.capValue).toBe(4);
  });
});
