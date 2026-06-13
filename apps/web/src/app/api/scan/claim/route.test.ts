/**
 * Tests for POST /api/scan/claim
 *
 * External deps mocked:
 *   - @/lib/supabase/server (createServerSupabaseClient — auth.getUser)
 *   - @supabase/supabase-js (createClient — admin service-role client)
 *   - @/lib/scan/import-free-scan (projectFreeScanToNormalized)
 *
 * Scenarios:
 *   1. 401 — no authenticated session
 *   2. 400 — invalid free_scan_id (not a UUID)
 *   3. 404 — free_scan not found
 *   4. 403 — email mismatch (not_yours)
 *   5. 403 — already claimed by different user
 *   6. 200 — idempotent re-claim by same user → returns existing scan_id
 *   7. 201 — happy path: business create-or-fetch, projection, insert → scan_id
 *   8. 201 — happy path when user already has a business (fetch existing)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Environment stubs — before any module imports
// ---------------------------------------------------------------------------

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const USER_ID = '11111111-1111-1111-1111-111111111111';
const USER_EMAIL = 'user@example.com';
const FREE_SCAN_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const EXISTING_SCAN_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const NEW_SCAN_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const BUSINESS_ID = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
const OTHER_USER_ID = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

// ---------------------------------------------------------------------------
// Mock factories — hoisted
// ---------------------------------------------------------------------------

const {
  mockGetUser,
  mockAdminFrom,
  mockProjection,
} = vi.hoisted(() => {
  const mockGetUser = vi.fn();

  // ── Admin client chain ───────────────────────────────────────────────────
  // We need a flexible chain: from(table).select(...).eq(...).maybeSingle()
  // and from(table).insert(...)
  // We use a factory approach: each `from()` call returns a fresh chain
  // controlled by mockAdminFrom which we can configure per test.
  const mockAdminFrom = vi.fn();

  // ── Projection mock ─────────────────────────────────────────────────────
  const mockProjection = vi.fn();

  return { mockGetUser, mockAdminFrom, mockProjection };
});

// ---------------------------------------------------------------------------
// vi.mock calls
// ---------------------------------------------------------------------------

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
  })),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ from: mockAdminFrom })),
}));

vi.mock('@/lib/scan/import-free-scan', () => ({
  projectFreeScanToNormalized: mockProjection,
}));

// ---------------------------------------------------------------------------
// Import route under test (after all vi.mock calls)
// ---------------------------------------------------------------------------

import { POST } from './route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/scan/claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/** Build a mock chain builder — returns an object that simulates the Supabase fluent API */
function buildChain(resolve: unknown) {
  const chain: Record<string, unknown> = {};
  const methods = ['select', 'eq', 'order', 'limit', 'insert', 'update'];
  methods.forEach((m) => {
    chain[m] = vi.fn().mockReturnValue(chain);
  });
  (chain['maybeSingle'] as ReturnType<typeof vi.fn>) = vi.fn().mockResolvedValue(resolve);
  return chain;
}

/** Minimal free_scan row fixture */
function makeFreeScan(overrides?: Partial<Record<string, unknown>>) {
  return {
    id: FREE_SCAN_ID,
    email: USER_EMAIL,
    business_name: 'Test Business',
    website_url: 'https://test.com',
    domain: 'test.com',
    results: null,
    started_at: null,
    completed_at: null,
    converted_user_id: null,
    claimed_at: null,
    claimed_business_id: null,
    ...overrides,
  };
}

/** Default projection result */
function makeProjectionResult(scanId = NEW_SCAN_ID) {
  return {
    scan: {
      id: scanId,
      business_id: BUSINESS_ID,
      scan_type: 'free',
      status: 'complete',
      source_free_scan_id: FREE_SCAN_ID,
      started_at: null,
      completed_at: null,
    },
    engineResults: [
      { scan_id: scanId, business_id: BUSINESS_ID, engine: 'chatgpt', is_mentioned: false, rank_position: null, sentiment: null, citations: [] },
      { scan_id: scanId, business_id: BUSINESS_ID, engine: 'gemini', is_mentioned: false, rank_position: null, sentiment: null, citations: [] },
      { scan_id: scanId, business_id: BUSINESS_ID, engine: 'perplexity', is_mentioned: false, rank_position: null, sentiment: null, citations: [] },
    ],
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/scan/claim', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: authenticated user
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_ID, email: USER_EMAIL } }, error: null });
    // Default: projection returns a valid result
    mockProjection.mockReturnValue(makeProjectionResult());
  });

  // ─── 401 — Not authenticated ─────────────────────────────────────────────

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const res = await POST(makeRequest({ free_scan_id: FREE_SCAN_ID }));
    expect(res.status).toBe(401);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('Not authenticated');
  });

  // ─── 400 — Validation ────────────────────────────────────────────────────

  it('returns 400 for invalid free_scan_id (not a UUID)', async () => {
    const res = await POST(makeRequest({ free_scan_id: 'not-a-uuid' }));
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('Validation failed');
  });

  it('returns 400 for missing free_scan_id', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  // ─── 404 — Free scan not found ───────────────────────────────────────────

  it('returns 404 when free_scan does not exist', async () => {
    // free_scans maybeSingle returns null
    const freeScanChain = buildChain({ data: null, error: null });
    mockAdminFrom.mockReturnValue(freeScanChain);

    const res = await POST(makeRequest({ free_scan_id: FREE_SCAN_ID }));
    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('Free scan not found');
  });

  // ─── 403 — Email mismatch ────────────────────────────────────────────────

  it('returns 403 not_yours when scan email does not match user email', async () => {
    const freeScanChain = buildChain({
      data: makeFreeScan({ email: 'someone.else@example.com' }),
      error: null,
    });
    mockAdminFrom.mockReturnValue(freeScanChain);

    const res = await POST(makeRequest({ free_scan_id: FREE_SCAN_ID }));
    expect(res.status).toBe(403);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('not_yours');
  });

  // ─── 403 — Already claimed by different user ─────────────────────────────

  it('returns 403 already_claimed_by_other when claimed by a different user', async () => {
    const freeScanChain = buildChain({
      data: makeFreeScan({ converted_user_id: OTHER_USER_ID, claimed_business_id: BUSINESS_ID }),
      error: null,
    });
    mockAdminFrom.mockReturnValue(freeScanChain);

    const res = await POST(makeRequest({ free_scan_id: FREE_SCAN_ID }));
    expect(res.status).toBe(403);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('already_claimed_by_other');
  });

  // ─── 200 — Idempotent re-claim ───────────────────────────────────────────

  it('returns 200 with existing scan_id on idempotent re-claim', async () => {
    // Simulate: free_scan already claimed by THIS user
    let callCount = 0;
    mockAdminFrom.mockImplementation((table: string) => {
      callCount++;
      if (table === 'free_scans' && callCount === 1) {
        return buildChain({
          data: makeFreeScan({ converted_user_id: USER_ID, claimed_business_id: BUSINESS_ID }),
          error: null,
        });
      }
      // Second call: scans table → returns existing scan row
      return buildChain({ data: { id: EXISTING_SCAN_ID }, error: null });
    });

    const res = await POST(makeRequest({ free_scan_id: FREE_SCAN_ID }));
    expect(res.status).toBe(200);
    const body = await res.json() as { scan_id: string };
    expect(body.scan_id).toBe(EXISTING_SCAN_ID);
  });

  // ─── 201 — Happy path: new business created ──────────────────────────────

  it('returns 201 with new scan_id on fresh claim (business created)', async () => {
    let tableCallIndex = 0;
    mockAdminFrom.mockImplementation((table: string) => {
      tableCallIndex++;
      // Call 1: free_scans — not yet claimed
      if (table === 'free_scans' && tableCallIndex === 1) {
        return buildChain({ data: makeFreeScan(), error: null });
      }
      // Call 2: businesses — no existing business
      if (table === 'businesses' && tableCallIndex === 2) {
        return buildChain({ data: null, error: null });
      }
      // Call 3: businesses insert
      if (table === 'businesses' && tableCallIndex === 3) {
        const chain = buildChain(undefined);
        (chain['insert'] as ReturnType<typeof vi.fn>).mockResolvedValue({ error: null });
        return chain;
      }
      // Call 4: scans insert
      if (table === 'scans' && tableCallIndex === 4) {
        const chain = buildChain(undefined);
        (chain['insert'] as ReturnType<typeof vi.fn>).mockResolvedValue({ error: null });
        return chain;
      }
      // Call 5: scan_engine_results insert
      if (table === 'scan_engine_results' && tableCallIndex === 5) {
        const chain = buildChain(undefined);
        (chain['insert'] as ReturnType<typeof vi.fn>).mockResolvedValue({ error: null });
        return chain;
      }
      // Call 6: free_scans update (mark claimed)
      if (table === 'free_scans' && tableCallIndex === 6) {
        const chain = buildChain(undefined);
        (chain['update'] as ReturnType<typeof vi.fn>).mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        });
        return chain;
      }
      // Fallback
      return buildChain({ data: null, error: null });
    });

    const res = await POST(makeRequest({ free_scan_id: FREE_SCAN_ID }));
    expect(res.status).toBe(201);
    const body = await res.json() as { scan_id: string };
    expect(typeof body.scan_id).toBe('string');
    expect(body.scan_id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  // ─── 201 — Happy path: existing business fetched ─────────────────────────

  it('returns 201 using existing business when user already has one', async () => {
    let tableCallIndex = 0;
    mockAdminFrom.mockImplementation((table: string) => {
      tableCallIndex++;
      // Call 1: free_scans — not yet claimed
      if (table === 'free_scans' && tableCallIndex === 1) {
        return buildChain({ data: makeFreeScan(), error: null });
      }
      // Call 2: businesses — existing business found
      if (table === 'businesses' && tableCallIndex === 2) {
        return buildChain({ data: { id: BUSINESS_ID }, error: null });
      }
      // Call 3: scans insert
      if (table === 'scans' && tableCallIndex === 3) {
        const chain = buildChain(undefined);
        (chain['insert'] as ReturnType<typeof vi.fn>).mockResolvedValue({ error: null });
        return chain;
      }
      // Call 4: scan_engine_results insert
      if (table === 'scan_engine_results' && tableCallIndex === 4) {
        const chain = buildChain(undefined);
        (chain['insert'] as ReturnType<typeof vi.fn>).mockResolvedValue({ error: null });
        return chain;
      }
      // Call 5: free_scans update (mark claimed)
      if (table === 'free_scans' && tableCallIndex === 5) {
        const chain = buildChain(undefined);
        (chain['update'] as ReturnType<typeof vi.fn>).mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        });
        return chain;
      }
      return buildChain({ data: null, error: null });
    });

    const res = await POST(makeRequest({ free_scan_id: FREE_SCAN_ID }));
    expect(res.status).toBe(201);

    // Verify the projection was called with the EXISTING business_id
    expect(mockProjection).toHaveBeenCalledWith(
      expect.objectContaining({
        business_id: BUSINESS_ID,
        free_scan_id: FREE_SCAN_ID,
      }),
    );
  });
});
