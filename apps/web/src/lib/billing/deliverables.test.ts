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
 * the values we prime via `mockQueryResult`.
 *
 * We track calls so individual tests can assert on them.
 */

interface MockCallRecord {
  table: string;
  method: string;
  args: unknown[];
}

const mockCalls: MockCallRecord[] = [];

// Default row returned by `.single()` / `.maybeSingle()` — overridden per test.
let mockSingleData: Record<string, unknown> | null = null;
let mockSingleError: { message: string } | null = null;
let mockMaybeSingleData: Record<string, unknown> | null = null;
let mockMaybeSingleError: { message: string } | null = null;
let mockUpsertError: { message: string } | null = null;
let mockUpdateError: { message: string } | null = null;
let mockInsertError: { message: string } | null = null;

/** Reset all mock state between tests. */
function resetMocks(): void {
  mockCalls.length = 0;
  mockSingleData = null;
  mockSingleError = null;
  mockMaybeSingleData = null;
  mockMaybeSingleError = null;
  mockUpsertError = null;
  mockUpdateError = null;
  mockInsertError = null;
}

/** Build the chainable query mock. */
function makeChain(table: string, method: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chain: any = new Proxy(
    {},
    {
      get(_target, prop: string) {
        return (...args: unknown[]) => {
          mockCalls.push({ table, method: `${method}.${prop}`, args });
          if (prop === 'single') return Promise.resolve({ data: mockSingleData, error: mockSingleError });
          if (prop === 'maybeSingle') return Promise.resolve({ data: mockMaybeSingleData, error: mockMaybeSingleError });
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
      select: vi.fn((_cols: string) => {
        const chain = makeChain(table, 'select');
        return chain;
      }),
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
// admin client (subscriptions join, audit_log writes).
vi.mock('../agents/db/admin-client', () => ({
  getAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => ({
      select: vi.fn((_cols: string) => makeChain(table, 'select')),
      insert: vi.fn((_data: unknown) => {
        mockCalls.push({ table, method: 'insert', args: [_data] });
        return Promise.resolve({ data: null, error: mockInsertError });
      }),
    })),
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

/** Prime the mock Supabase read chain to return a deliverable row. */
function primeDeliverableRow(row: Record<string, unknown>): void {
  mockSingleData = row;
  mockSingleError = null;
}

/** Prime the subscription join to return a specific plan tier. */
function primeTierLookup(tier: string): void {
  mockMaybeSingleData = { plan_id: 'plan-1', plans: { tier } };
  mockMaybeSingleError = null;
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

  describe('happy path', () => {
    it('increments schema_pushed_count for a starter customer below cap', async () => {
      primeTierLookup('starter'); // starter cap: schema_pushed = 4
      primeDeliverableRow({ ...zeroRow(), schema_pushed_count: 1 }); // 1 used

      await expect(
        consumeDeliverable({ customerId: '00000000-0000-0000-0000-000000000001', kind: 'schema_pushed', count: 1 }),
      ).resolves.toBeUndefined();

      // Expect at least one update call on the deliverables table
      const updateCall = mockCalls.find(
        (c) => c.table === 'deliverables_per_customer_per_month' && c.method === 'update',
      );
      expect(updateCall).toBeDefined();
    });

    it('succeeds for a professional customer with unlimited cap (null)', async () => {
      primeTierLookup('professional'); // professional caps: all null = unlimited
      primeDeliverableRow({ ...zeroRow(), content_published_count: 999 });

      await expect(
        consumeDeliverable({ customerId: '00000000-0000-0000-0000-000000000002', kind: 'content_published', count: 1 }),
      ).resolves.toBeUndefined();
    });

    it('defaults count to 1 when count is omitted', async () => {
      primeTierLookup('growth'); // growth cap: faq_published = 6
      primeDeliverableRow({ ...zeroRow(), faq_published_count: 3 });

      await expect(
        // @ts-expect-error — testing default value: omitting `count`
        consumeDeliverable({ customerId: '00000000-0000-0000-0000-000000000003', kind: 'faq_published' }),
      ).resolves.toBeUndefined();
    });
  });

  describe('cap enforcement', () => {
    it('throws OverTierCapError when starter schema cap (4) is already at limit', async () => {
      primeTierLookup('starter'); // starter cap: schema_pushed = 4
      primeDeliverableRow({ ...zeroRow(), schema_pushed_count: 4 }); // already at cap

      await expect(
        consumeDeliverable({ customerId: '00000000-0000-0000-0000-000000000004', kind: 'schema_pushed', count: 1 }),
      ).rejects.toThrow(OverTierCapError);
    });

    it('OverTierCapError carries correct customerMessage without agent names', async () => {
      primeTierLookup('starter');
      primeDeliverableRow({ ...zeroRow(), faq_published_count: 2 }); // at cap (starter faq cap = 2)

      let caught: unknown;
      try {
        await consumeDeliverable({ customerId: '00000000-0000-0000-0000-000000000005', kind: 'faq_published', count: 1 });
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
      primeDeliverableRow({ ...zeroRow() });

      await expect(
        consumeDeliverable({ customerId: '00000000-0000-0000-0000-000000000006', kind: 'outreach_email', count: 1 }),
      ).rejects.toThrow(OverTierCapError);
    });

    it('does NOT throw for professional when outreach_email cap is null (unlimited)', async () => {
      primeTierLookup('professional');
      primeDeliverableRow({ ...zeroRow() }); // 0 used, unlimited cap

      await expect(
        consumeDeliverable({ customerId: '00000000-0000-0000-0000-000000000007', kind: 'outreach_email', count: 1 }),
      ).resolves.toBeUndefined();
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
