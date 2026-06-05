/**
 * Beamix — Deliverable Consumption Tests
 *
 * Unit tests for `consumeDeliverable` in `lib/billing/deliverables.ts`.
 * Mocks the Supabase admin client so no real DB is required.
 *
 * Run: pnpm -F @beamix/web test
 * (requires vitest — install with: pnpm -F @beamix/web add -D vitest)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Module mocks — set up BEFORE importing the module under test
// ---------------------------------------------------------------------------

/**
 * Mocked Supabase chain builder. Returns a minimal Supabase client-like object
 * whose chained methods (`from → select/upsert/update → eq → ...`) resolve to
 * the values we prime via mock state.
 *
 * We track calls so individual tests can assert on them.
 */

interface MockCallRecord {
  table: string;
  method: string;
  args: unknown[];
}

const mockCalls: MockCallRecord[] = [];

// ---------------------------------------------------------------------------
// Mock state — overridden per test
// ---------------------------------------------------------------------------

/** Result returned by the admin client `rpc('consume_deliverable', ...)` call. */
let mockRpcResult: number | null = null;
let mockRpcError: { message: string } | null = null;

/** Result for tier lookup (subscriptions join via getAdminClient().from('subscriptions')). */
let mockMaybeSingleData: Record<string, unknown> | null = null;
let mockMaybeSingleError: { message: string } | null = null;

/** Result for upsert (raw admin client — deliverables_per_customer_per_month). */
let mockUpsertError: { message: string } | null = null;

/** Result for insert (audit_log via getAdminClient()). */
let mockInsertError: { message: string } | null = null;

/**
 * Result for single-row select on deliverables_per_customer_per_month.
 * Used in:
 *   - The "over-cap read" after RPC returns null (capped path, disambiguation).
 *   - The "read current count" step (unlimited tier path).
 */
let mockSingleData: Record<string, unknown> | null = null;
let mockSingleError: { message: string } | null = null;

/** Result for update on deliverables_per_customer_per_month (unlimited tier path). */
let mockUpdateError: { message: string } | null = null;

/** Reset all mock state between tests. */
function resetMocks(): void {
  mockCalls.length = 0;
  mockRpcResult = null;
  mockRpcError = null;
  mockMaybeSingleData = null;
  mockMaybeSingleError = null;
  mockUpsertError = null;
  mockInsertError = null;
  mockSingleData = null;
  mockSingleError = null;
  mockUpdateError = null;
}

/** Build the chainable query mock for .select() chains. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeSelectChain(table: string, method: string): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chain: any = new Proxy(
    {},
    {
      get(_target, prop: string) {
        return (...args: unknown[]) => {
          mockCalls.push({ table, method: `${method}.${prop}`, args });
          if (prop === 'single')
            return Promise.resolve({ data: mockSingleData, error: mockSingleError });
          if (prop === 'maybeSingle')
            return Promise.resolve({ data: mockMaybeSingleData, error: mockMaybeSingleError });
          return chain;
        };
      },
    },
  );
  return chain;
}

// Mock `@supabase/supabase-js` createClient — used by deliverables.ts for the
// raw admin client (Wave 2 tables not yet in generated types).
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn((table: string) => ({
      upsert: vi.fn((_data: unknown, _opts: unknown) => {
        mockCalls.push({ table, method: 'upsert', args: [_data, _opts] });
        return Promise.resolve({ data: null, error: mockUpsertError });
      }),
      select: vi.fn((_cols: string) => makeSelectChain(table, 'select')),
      update: vi.fn((_data: unknown) => {
        mockCalls.push({ table, method: 'update', args: [_data] });
        return {
          eq: vi.fn((_col: string, _val: unknown) => ({
            eq: vi.fn(() => Promise.resolve({ data: null, error: mockUpdateError })),
          })),
        };
      }),
      insert: vi.fn((_data: unknown) => {
        mockCalls.push({ table, method: 'insert', args: [_data] });
        return Promise.resolve({ data: null, error: mockInsertError });
      }),
    })),
  })),
}));

// Mock `lib/agents/db/admin-client` — used by deliverables.ts for the typed
// admin client (subscriptions join, audit_log writes, and consume_deliverable RPC).
vi.mock('../agents/db/admin-client', () => ({
  getAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => ({
      select: vi.fn((_cols: string) => makeSelectChain(table, 'select')),
      insert: vi.fn((_data: unknown) => {
        mockCalls.push({ table, method: 'insert', args: [_data] });
        return Promise.resolve({ data: null, error: mockInsertError });
      }),
    })),
    rpc: vi.fn((_fn: string, _args: unknown) => {
      mockCalls.push({ table: 'rpc', method: _fn as string, args: [_args] });
      return Promise.resolve({ data: mockRpcResult, error: mockRpcError });
    }),
  })),
}));

// Mock `server-only` — not available in vitest node environment.
vi.mock('server-only', () => ({}));

// ---------------------------------------------------------------------------
// Set required env vars before module import
// ---------------------------------------------------------------------------
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

// ---------------------------------------------------------------------------
// Import module under test — AFTER mocks are registered
// ---------------------------------------------------------------------------
const { consumeDeliverable, OverTierCapError } = await import('./deliverables');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Prime the subscription join to return a specific plan tier. */
function primeTierLookup(tier: string): void {
  mockMaybeSingleData = { plan_id: 'plan-1', plans: { tier } };
  mockMaybeSingleError = null;
}

/**
 * Prime the RPC mock for a SUCCESSFUL consume (returns new count).
 * Used for capped tiers where capValue != null.
 */
function primeRpcSuccess(newCount: number): void {
  mockRpcResult = newCount;
  mockRpcError = null;
}

/**
 * Prime the RPC mock for an OVER-CAP response (returns null).
 * Used for capped tiers when current count >= cap.
 */
function primeRpcOverCap(): void {
  mockRpcResult = null;
  mockRpcError = null;
}

/**
 * Prime the single-row read mock used after RPC returns null (disambiguation)
 * or in the unlimited-tier read path.
 */
function primeDeliverableRow(row: Record<string, unknown>): void {
  mockSingleData = row;
  mockSingleError = null;
}

/** A zeroed deliverable row for the current period. */
function zeroRow(): Record<string, unknown> {
  return {
    schema_pushed_count: 0,
    faq_published_count: 0,
    citation_submitted_count: 0,
    content_published_count: 0,
    outreach_email_count: 0,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('consumeDeliverable', () => {
  beforeEach(() => {
    resetMocks();
  });

  describe('happy path — capped tier', () => {
    it('calls consume_deliverable RPC for a starter customer below cap', async () => {
      primeTierLookup('starter'); // starter cap: schema_pushed = 4
      primeRpcSuccess(2);         // RPC returns new count = 2

      await expect(
        consumeDeliverable({
          customerId: '00000000-0000-0000-0000-000000000001',
          kind: 'schema_pushed',
          count: 1,
        }),
      ).resolves.toBeUndefined();

      const rpcCall = mockCalls.find((c) => c.table === 'rpc' && c.method === 'consume_deliverable');
      expect(rpcCall).toBeDefined();
    });

    it('defaults count to 1 when count is omitted', async () => {
      primeTierLookup('growth'); // growth cap: faq_published = 6
      primeRpcSuccess(4);

      await expect(
        // @ts-expect-error — testing default value: omitting `count`
        consumeDeliverable({ customerId: '00000000-0000-0000-0000-000000000003', kind: 'faq_published' }),
      ).resolves.toBeUndefined();

      const rpcCall = mockCalls.find((c) => c.table === 'rpc' && c.method === 'consume_deliverable');
      expect(rpcCall).toBeDefined();
    });
  });

  describe('happy path — unlimited tier', () => {
    it('succeeds for a professional customer with unlimited cap (null) — uses direct update', async () => {
      primeTierLookup('professional'); // professional caps: all null = unlimited
      // Unlimited path reads current count then writes. Prime the select mock.
      primeDeliverableRow({ ...zeroRow(), content_published_count: 999 });

      await expect(
        consumeDeliverable({
          customerId: '00000000-0000-0000-0000-000000000002',
          kind: 'content_published',
          count: 1,
        }),
      ).resolves.toBeUndefined();

      // Must NOT call the RPC for unlimited tiers
      const rpcCall = mockCalls.find((c) => c.table === 'rpc' && c.method === 'consume_deliverable');
      expect(rpcCall).toBeUndefined();

      // Must call update on the deliverables table
      const updateCall = mockCalls.find(
        (c) => c.table === 'deliverables_per_customer_per_month' && c.method === 'update',
      );
      expect(updateCall).toBeDefined();
    });

    it('does NOT throw for professional when outreach_email cap is null (unlimited)', async () => {
      primeTierLookup('professional');
      primeDeliverableRow({ ...zeroRow() }); // 0 used, unlimited cap

      await expect(
        consumeDeliverable({
          customerId: '00000000-0000-0000-0000-000000000007',
          kind: 'outreach_email',
          count: 1,
        }),
      ).resolves.toBeUndefined();
    });
  });

  describe('cap enforcement', () => {
    it('throws OverTierCapError when RPC returns null (over-cap)', async () => {
      primeTierLookup('starter'); // starter cap: schema_pushed = 4
      primeRpcOverCap();          // RPC returns null — already at cap
      // Prime the disambiguation read: row exists with count at cap
      primeDeliverableRow({ ...zeroRow(), schema_pushed_count: 4 });

      await expect(
        consumeDeliverable({
          customerId: '00000000-0000-0000-0000-000000000004',
          kind: 'schema_pushed',
          count: 1,
        }),
      ).rejects.toThrow(OverTierCapError);
    });

    it('OverTierCapError carries correct customerMessage without agent names', async () => {
      primeTierLookup('starter');
      primeRpcOverCap();
      // Starter faq cap = 2; prime row as if at cap
      primeDeliverableRow({ ...zeroRow(), faq_published_count: 2 });

      let caught: unknown;
      try {
        await consumeDeliverable({
          customerId: '00000000-0000-0000-0000-000000000005',
          kind: 'faq_published',
          count: 1,
        });
      } catch (err) {
        caught = err;
      }

      expect(caught).toBeInstanceOf(OverTierCapError);
      const err = caught as OverTierCapError;
      // Message must not contain agent names (Principle #9)
      expect(err.customerMessage).not.toMatch(/agent|faq builder|schema generator/i);
      // Must mention the tier display name
      expect(err.customerMessage).toContain('Starter');
      // Must mention the kind label
      expect(err.customerMessage).toContain('FAQ pages');
      // Must include upgrade hint for non-professional tiers
      expect(err.customerMessage).toContain('Growth');
    });

    it('throws OverTierCapError when outreach_email is 0 for starter (cap = 0)', async () => {
      primeTierLookup('starter'); // starter outreach_email cap = 0
      primeRpcOverCap();          // RPC returns null — cap is 0, anything >= 0 fails
      primeDeliverableRow({ ...zeroRow() }); // 0 used

      await expect(
        consumeDeliverable({
          customerId: '00000000-0000-0000-0000-000000000006',
          kind: 'outreach_email',
          count: 1,
        }),
      ).rejects.toThrow(OverTierCapError);
    });
  });

  describe('input validation', () => {
    it('throws ZodError for invalid customerId (not UUID)', async () => {
      await expect(
        consumeDeliverable({ customerId: 'not-a-uuid', kind: 'schema_pushed', count: 1 }),
      ).rejects.toThrow();
    });

    it('throws ZodError for unknown kind', async () => {
      await expect(
        // @ts-expect-error — testing runtime validation with invalid kind
        consumeDeliverable({ customerId: '00000000-0000-0000-0000-000000000008', kind: 'unknown_kind', count: 1 }),
      ).rejects.toThrow();
    });
  });

  describe('concurrency — atomic cap enforcement', () => {
    /**
     * P1 race condition test: two parallel consumeDeliverable calls when used = cap - 1.
     *
     * Before the fix, both calls would read used=cap-1, both pass the check, both write:
     * cap bypassed. After the fix, the atomic RPC ensures only one succeeds.
     *
     * We simulate this by having the RPC mock return success for the first call and
     * null (over-cap) for the second — reflecting the atomic DB behavior where the
     * first UPDATE succeeds (used goes from cap-1 to cap) and the second fails
     * (used >= cap now, conditional UPDATE returns no rows).
     */
    it('exactly one of two concurrent calls succeeds when used = cap - 1', async () => {
      primeTierLookup('starter'); // starter cap: schema_pushed = 4

      // Prime disambiguation read for the over-cap call
      primeDeliverableRow({ ...zeroRow(), schema_pushed_count: 4 });

      let rpcCallCount = 0;

      // Override the rpc mock to return success on first call, over-cap on second.
      // We achieve this by resetting mockRpcResult between invocations using a counter.
      const { getAdminClient } = await import('../agents/db/admin-client');
      const mockedGetAdminClient = vi.mocked(getAdminClient);
      mockedGetAdminClient.mockImplementation(() => ({
        from: vi.fn((table: string) => ({
          select: vi.fn((_cols: string) => makeSelectChain(table, 'select')),
          insert: vi.fn((_data: unknown) => {
            mockCalls.push({ table, method: 'insert', args: [_data] });
            return Promise.resolve({ data: null, error: mockInsertError });
          }),
        })),
        rpc: vi.fn((_fn: string, _args: unknown): Promise<{ data: number | null; error: null }> => {
          rpcCallCount++;
          mockCalls.push({ table: 'rpc', method: _fn as string, args: [_args] });
          // First call succeeds (increments used from cap-1 to cap); second call gets null (over-cap)
          const result = rpcCallCount === 1 ? 4 : null;
          return Promise.resolve({ data: result, error: null });
        }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any);

      const customerId = '00000000-0000-0000-0000-000000000009';

      // Run both calls concurrently (simulating two agent runs at the same time)
      const [result1, result2] = await Promise.allSettled([
        consumeDeliverable({ customerId, kind: 'schema_pushed', count: 1 }),
        consumeDeliverable({ customerId, kind: 'schema_pushed', count: 1 }),
      ]);

      const successes = [result1, result2].filter((r) => r.status === 'fulfilled');
      const failures = [result1, result2].filter((r) => r.status === 'rejected');

      // Exactly one succeeds
      expect(successes).toHaveLength(1);
      // Exactly one fails with OverTierCapError
      expect(failures).toHaveLength(1);
      const failReason = (failures[0] as PromiseRejectedResult).reason;
      expect(failReason).toBeInstanceOf(OverTierCapError);

      // The RPC was called exactly twice (once per concurrent invocation)
      expect(rpcCallCount).toBe(2);
    });
  });
});

describe('OverTierCapError', () => {
  it('has correct name property', () => {
    const err = new OverTierCapError({
      kind: 'schema_pushed',
      currentTier: 'starter',
      capValue: 4,
      usedCount: 4,
    });
    expect(err.name).toBe('OverTierCapError');
  });

  it('includes upgrade hint for all non-professional tiers', () => {
    const tiers = ['starter', 'growth', 'scale'] as const;
    for (const tier of tiers) {
      const err = new OverTierCapError({
        kind: 'content_published',
        currentTier: tier,
        capValue: 10,
        usedCount: 10,
      });
      expect(err.nextTier).not.toBeNull();
      expect(err.customerMessage).toContain('Upgrade to');
    }
  });

  it('has no upgrade hint for professional tier', () => {
    const err = new OverTierCapError({
      kind: 'content_published',
      currentTier: 'professional',
      capValue: null as unknown as number, // professional cap is null
      usedCount: 0,
    });
    expect(err.nextTier).toBeNull();
    expect(err.customerMessage).not.toContain('Upgrade to');
  });
});
