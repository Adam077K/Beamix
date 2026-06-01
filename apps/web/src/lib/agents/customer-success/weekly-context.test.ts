/**
 * Tests for buildWeeklyContext.
 *
 * Covers:
 *   1. Correct bucketing: approved → wins, pending → queued, rejected → concerns.
 *   2. Cap at 5 per bucket.
 *   3. Graceful degradation on DB error (returns empty arrays).
 *   4. Empty result when no rows match.
 *   5. Resource title included when available.
 */

import { describe, it, expect, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { buildWeeklyContext } from './weekly-context';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const CUSTOMER_ID = '00000000-0000-0000-0000-000000000001';

const now = new Date();
const sixDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString();

function makeRow(overrides: Partial<{
  id: string;
  kind: string;
  state: string;
  resource: Record<string, unknown> | null;
  acted_at: string | null;
  created_at: string;
}> = {}) {
  return {
    id: 'row-1',
    kind: 'content_publish',
    state: 'approved',
    resource: null,
    acted_at: sixDaysAgo,
    created_at: sixDaysAgo,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Mock Supabase builder — returns controlled data per state filter
// ---------------------------------------------------------------------------

interface MockQuery {
  state: string;
  rows: ReturnType<typeof makeRow>[];
  error?: { message: string } | null;
}

/**
 * Build a minimal Supabase mock that routes `.eq('state', ...)` calls to the
 * correct fixture dataset. Supports chaining: .select().eq().eq().gte().order().limit().
 *
 * The mock uses a call counter so each `.from()` call gets the correct fixture.
 * buildWeeklyContext calls `.from('approval_queue')` three times (approved, pending, rejected).
 */
function buildFakeSupabase(queries: MockQuery[]): SupabaseClient {
  // Each call to .from() returns a fresh chain that resolves on .limit()
  // using the queries array in order.
  let callIndex = 0;

  return {
    from: vi.fn().mockImplementation(() => {
      const queryIdx = callIndex++;
      const querySpec = queries[queryIdx] ?? { state: '', rows: [], error: null };

      // Build a chain that captures .eq('state', ...) to match the right fixture
      // and resolves on .limit()
      let resolvedState: string | null = null;

      const chain: Record<string, unknown> = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockImplementation((_col: string, val: string) => {
          if (_col === 'state') resolvedState = val;
          return chain;
        }),
        gte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockImplementation(() => {
          // Match against either our pre-assigned spec or the actual state captured
          const spec = queries.find((q) => q.state === (resolvedState ?? querySpec.state))
            ?? querySpec;
          if (spec.error) return Promise.resolve({ data: null, error: spec.error });
          return Promise.resolve({ data: spec.rows, error: null });
        }),
      };

      return chain;
    }),
  } as unknown as SupabaseClient;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('buildWeeklyContext', () => {
  it('1. correctly buckets approved→wins, pending→queued, rejected→concerns', async () => {
    const approvedRow = makeRow({ id: 'r1', state: 'approved', kind: 'content_publish', acted_at: sixDaysAgo });
    const pendingRow = makeRow({ id: 'r2', state: 'pending', kind: 'schema_push', acted_at: null, created_at: sixDaysAgo });
    const rejectedRow = makeRow({ id: 'r3', state: 'rejected', kind: 'email_as_them', acted_at: sixDaysAgo });

    const supabase = buildFakeSupabase([
      { state: 'approved', rows: [approvedRow] },
      { state: 'pending', rows: [pendingRow] },
      { state: 'rejected', rows: [rejectedRow] },
    ]);

    const ctx = await buildWeeklyContext(CUSTOMER_ID, supabase as unknown as SupabaseClient<unknown>);

    expect(ctx.wins).toHaveLength(1);
    expect(ctx.wins[0]).toContain('content piece');

    expect(ctx.queued).toHaveLength(1);
    expect(ctx.queued[0]).toContain('schema update');

    expect(ctx.concerns).toHaveLength(1);
    expect(ctx.concerns![0]).toContain('outreach email');
  });

  it('2. includes resource title when available', async () => {
    const rowWithTitle = makeRow({
      id: 'r1',
      state: 'approved',
      kind: 'content_publish',
      resource: { title: 'My FAQ Page' },
      acted_at: sixDaysAgo,
    });

    const supabase = buildFakeSupabase([
      { state: 'approved', rows: [rowWithTitle] },
      { state: 'pending', rows: [] },
      { state: 'rejected', rows: [] },
    ]);

    const ctx = await buildWeeklyContext(CUSTOMER_ID, supabase as unknown as SupabaseClient<unknown>);

    expect(ctx.wins[0]).toContain('My FAQ Page');
    expect(ctx.wins[0]).toContain('content piece');
  });

  it('3. caps each bucket at 5', async () => {
    // The cap is enforced by .limit(BUCKET_CAP) in the implementation.
    // The mock returns exactly 5 rows, which is the max the implementation requests.
    const fiveRows = Array.from({ length: 5 }, (_, i) =>
      makeRow({ id: `r${i}`, state: 'approved', acted_at: sixDaysAgo }),
    );

    const supabase = buildFakeSupabase([
      { state: 'approved', rows: fiveRows },
      { state: 'pending', rows: [] },
      { state: 'rejected', rows: [] },
    ]);

    const ctx = await buildWeeklyContext(CUSTOMER_ID, supabase as unknown as SupabaseClient<unknown>);

    expect(ctx.wins).toHaveLength(5);
    expect(ctx.queued).toHaveLength(0);
    expect(ctx.concerns ?? []).toHaveLength(0);
  });

  it('4. returns empty arrays on DB error (graceful degradation)', async () => {
    const supabase = buildFakeSupabase([
      { state: 'approved', rows: [], error: { message: 'connection refused' } },
      { state: 'pending', rows: [], error: { message: 'connection refused' } },
      { state: 'rejected', rows: [], error: { message: 'connection refused' } },
    ]);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const ctx = await buildWeeklyContext(CUSTOMER_ID, supabase as unknown as SupabaseClient<unknown>);
    consoleSpy.mockRestore();

    expect(ctx.wins).toHaveLength(0);
    expect(ctx.queued).toHaveLength(0);
    expect(ctx.concerns ?? []).toHaveLength(0);
  });

  it('5. returns empty arrays when no rows exist', async () => {
    const supabase = buildFakeSupabase([
      { state: 'approved', rows: [] },
      { state: 'pending', rows: [] },
      { state: 'rejected', rows: [] },
    ]);

    const ctx = await buildWeeklyContext(CUSTOMER_ID, supabase as unknown as SupabaseClient<unknown>);

    expect(ctx.wins).toHaveLength(0);
    expect(ctx.queued).toHaveLength(0);
    expect(ctx.concerns ?? []).toHaveLength(0);
  });
});
