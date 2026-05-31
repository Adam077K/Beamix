/**
 * Tests for POST /api/agents/run — agent ignition route
 *
 * External deps mocked:
 *   - next/headers (cookies)
 *   - @supabase/ssr (createServerClient — cookie-based auth.getUser only)
 *   - @/lib/agents/db/admin-client (getAdminClient — service-role writes)
 *   - @/inngest/client (inngest.send)
 *
 * Scenarios:
 *   1. 401 — no authenticated session
 *   2. 400 — Zod validation fails (bad agentType)
 *   3. 404 — IDOR: businessId belongs to a different user
 *   4. 403 — agent not available on user's plan tier
 *   5. 429 — daily cap exceeded for free agent
 *   6. 202 — happy path: agent_jobs inserted + Inngest fired
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Environment stubs — must be set before any module imports
// ---------------------------------------------------------------------------

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
process.env.INNGEST_EVENT_KEY = 'dev-dummy';

// ---------------------------------------------------------------------------
// Hoisted mocks — must use vi.hoisted so variables are available at mock-factory
// evaluation time (vi.mock factories are hoisted to the top of the file)
// ---------------------------------------------------------------------------

const { mockGetUser, mockMaybeSingle, mockInsert, mockAdminFrom, mockInngestSend } =
  vi.hoisted(() => {
    const mockGetUser = vi.fn();
    const mockMaybeSingle = vi.fn();
    const mockInsert = vi.fn().mockResolvedValue({ error: null });

    // Fluent chain shared by all admin queries
    const queryChain: Record<string, unknown> = {};
    const mockSelect = vi.fn().mockReturnValue(queryChain);
    const mockEq = vi.fn().mockReturnValue(queryChain);
    const mockIn = vi.fn().mockReturnValue(queryChain);
    const mockOrder = vi.fn().mockReturnValue(queryChain);
    const mockLimit = vi.fn().mockReturnValue(queryChain);
    queryChain.select = mockSelect;
    queryChain.eq = mockEq;
    queryChain.in = mockIn;
    queryChain.order = mockOrder;
    queryChain.limit = mockLimit;
    queryChain.maybeSingle = mockMaybeSingle;
    queryChain.insert = mockInsert;

    const mockAdminFrom = vi.fn().mockReturnValue(queryChain);
    const mockInngestSend = vi.fn().mockResolvedValue(undefined);

    return { mockGetUser, mockMaybeSingle, mockInsert, mockAdminFrom, mockInngestSend };
  });

// ---------------------------------------------------------------------------
// Mock: next/headers — cookies()
// ---------------------------------------------------------------------------

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: () => [],
    set: vi.fn(),
  }),
}));

// ---------------------------------------------------------------------------
// Mock: @supabase/ssr — createServerClient (user cookie client, auth.getUser only)
// ---------------------------------------------------------------------------

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn().mockReturnValue({
    auth: { getUser: mockGetUser },
  }),
}));

// ---------------------------------------------------------------------------
// Mock: @/lib/agents/db/admin-client — service-role queries
// ---------------------------------------------------------------------------

vi.mock('@/lib/agents/db/admin-client', () => ({
  getAdminClient: vi.fn(() => ({ from: mockAdminFrom })),
}));

// ---------------------------------------------------------------------------
// Mock: @/inngest/client — inngest.send
// ---------------------------------------------------------------------------

vi.mock('@/inngest/client', () => ({
  inngest: { send: mockInngestSend },
}));

// ---------------------------------------------------------------------------
// Import the route under test (after all vi.mock calls)
// ---------------------------------------------------------------------------

import { POST } from './route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/agents/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const VALID_BUSINESS_ID = '11111111-1111-1111-1111-111111111111';
const VALID_USER_ID = '22222222-2222-2222-2222-222222222222';
const VALID_SCAN_ID = '33333333-3333-3333-3333-333333333333';

const VALID_BODY = {
  agentType: 'query_mapper',
  businessId: VALID_BUSINESS_ID,
};

/** Simulate an active 'discover' subscription via plans join. */
const MOCK_SUBSCRIPTION_DATA = {
  plan_id: 'plan-1',
  plans: { tier: 'discover' },
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/agents/run', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-apply defaults after clearAllMocks
    mockInsert.mockResolvedValue({ error: null });
    mockInngestSend.mockResolvedValue(undefined);
  });

  // -------------------------------------------------------------------------
  // 1. 401 — no authenticated session
  // -------------------------------------------------------------------------
  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(401);
    const json = await res.json() as Record<string, unknown>;
    expect(json.error).toBe('Unauthorized');
    expect(mockAdminFrom).not.toHaveBeenCalled();
  });

  it('returns 401 when auth returns an error', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'JWT expired' },
    });

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(401);
  });

  // -------------------------------------------------------------------------
  // 2. 400 — Zod validation failure (bad agentType)
  // -------------------------------------------------------------------------
  it('returns 400 for invalid agentType', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: VALID_USER_ID } },
      error: null,
    });

    const res = await POST(makeRequest({ agentType: 'does_not_exist', businessId: VALID_BUSINESS_ID }));
    expect(res.status).toBe(400);
    const json = await res.json() as Record<string, unknown>;
    expect(json.error).toBe('Validation failed');
    expect(json.details).toBeDefined();
    // IDOR check must not be reached
    expect(mockAdminFrom).not.toHaveBeenCalled();
  });

  it('returns 400 for missing businessId', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: VALID_USER_ID } },
      error: null,
    });

    const res = await POST(makeRequest({ agentType: 'query_mapper' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for non-UUID businessId', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: VALID_USER_ID } },
      error: null,
    });

    const res = await POST(makeRequest({ agentType: 'query_mapper', businessId: 'not-a-uuid' }));
    expect(res.status).toBe(400);
  });

  // -------------------------------------------------------------------------
  // 3. 404 — IDOR: businessId does not belong to session user
  // -------------------------------------------------------------------------
  it('returns 404 when business belongs to a different user (IDOR)', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: VALID_USER_ID } },
      error: null,
    });

    // businesses query returns no row (ownership check fails)
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null });

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(404);
    const json = await res.json() as Record<string, unknown>;
    expect(json.error).toBe('Business not found');
    // Pipeline must not be triggered
    expect(mockInngestSend).not.toHaveBeenCalled();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // 4. 403 — Agent not available on user's plan tier
  //    authority_blog_strategist is NOT available on 'discover' tier
  // -------------------------------------------------------------------------
  it('returns 403 when agent is not available on the user plan tier', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: VALID_USER_ID } },
      error: null,
    });

    // Business ownership check passes, then subscriptions resolve discover tier
    mockMaybeSingle
      .mockResolvedValueOnce({ data: { id: VALID_BUSINESS_ID }, error: null }) // businesses
      .mockResolvedValueOnce({ data: MOCK_SUBSCRIPTION_DATA, error: null });    // subscriptions

    const res = await POST(makeRequest({
      agentType: 'authority_blog_strategist', // only available on build + scale
      businessId: VALID_BUSINESS_ID,
    }));

    expect(res.status).toBe(403);
    const json = await res.json() as Record<string, unknown>;
    expect(json.error).toBe('Agent not available on your current plan');
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockInngestSend).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // 5. 429 — Daily cap exceeded for free agent
  //    faq_builder is a free agent with cap: { discover: 3, build: 5, scale: 10 }
  // -------------------------------------------------------------------------
  it('returns 429 when daily cap is exceeded for a free agent', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: VALID_USER_ID } },
      error: null,
    });

    // Business ownership passes, subscriptions resolve discover tier,
    // then daily_cap_usage read returns used_today = 3 (at cap for discover)
    mockMaybeSingle
      .mockResolvedValueOnce({ data: { id: VALID_BUSINESS_ID }, error: null }) // businesses
      .mockResolvedValueOnce({ data: MOCK_SUBSCRIPTION_DATA, error: null })    // subscriptions
      .mockResolvedValueOnce({ data: { used_today: 3 }, error: null });        // daily_cap_usage

    const res = await POST(makeRequest({
      agentType: 'faq_builder',
      businessId: VALID_BUSINESS_ID,
    }));

    expect(res.status).toBe(429);
    const json = await res.json() as Record<string, unknown>;
    expect(json.error).toBe('Daily cap exceeded for this agent');
    expect(json.capStatus).toBeDefined();
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockInngestSend).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // 6. 202 — Happy path: agent_jobs row inserted + Inngest fired
  //    query_mapper has creditCost: 1, dailyCap = null → no daily_cap_usage read
  // -------------------------------------------------------------------------
  it('returns 202 and fires Inngest on the happy path', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: VALID_USER_ID } },
      error: null,
    });

    mockMaybeSingle
      .mockResolvedValueOnce({ data: { id: VALID_BUSINESS_ID }, error: null }) // businesses
      .mockResolvedValueOnce({ data: MOCK_SUBSCRIPTION_DATA, error: null });    // subscriptions
    // query_mapper dailyCap[discover] = null → checkDailyCap returns early (no DB read)

    mockInsert.mockResolvedValueOnce({ error: null });

    const res = await POST(makeRequest({
      ...VALID_BODY,
      scanId: VALID_SCAN_ID,
      customInstructions: 'Focus on Israeli market',
    }));

    expect(res.status).toBe(202);
    const json = await res.json() as Record<string, unknown>;
    expect(json.status).toBe('queued');
    expect(typeof json.jobId).toBe('string');

    // Verify agent_jobs insert was called with correct shape
    expect(mockInsert).toHaveBeenCalledOnce();
    const insertArg = mockInsert.mock.calls[0][0] as Record<string, unknown>;
    expect(insertArg.agent_type).toBe('query_mapper');
    expect(insertArg.business_id).toBe(VALID_BUSINESS_ID);
    expect(insertArg.user_id).toBe(VALID_USER_ID);
    expect(insertArg.plan_tier).toBe('discover');
    expect(insertArg.credit_cost).toBe(1);
    expect(insertArg.status).toBe('queued');
    expect(insertArg.scan_id).toBe(VALID_SCAN_ID);
    expect(insertArg.custom_instructions).toBe('Focus on Israeli market');
    expect(insertArg.id).toBe(json.jobId);

    // Verify Inngest event fired with correct payload
    expect(mockInngestSend).toHaveBeenCalledOnce();
    const inngestArg = mockInngestSend.mock.calls[0][0] as {
      name: string;
      data: Record<string, unknown>;
    };
    expect(inngestArg.name).toBe('agent/run.requested');
    expect(inngestArg.data.jobId).toBe(json.jobId);
    expect(inngestArg.data.agentType).toBe('query_mapper');
    expect(inngestArg.data.userId).toBe(VALID_USER_ID);
    expect(inngestArg.data.businessId).toBe(VALID_BUSINESS_ID);
    expect(inngestArg.data.planTier).toBe('discover');
    expect(inngestArg.data.scanId).toBe(VALID_SCAN_ID);
  });

  it('returns 202 even when Inngest send fails (non-fatal)', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: VALID_USER_ID } },
      error: null,
    });

    mockMaybeSingle
      .mockResolvedValueOnce({ data: { id: VALID_BUSINESS_ID }, error: null })
      .mockResolvedValueOnce({ data: MOCK_SUBSCRIPTION_DATA, error: null });

    mockInsert.mockResolvedValueOnce({ error: null });
    mockInngestSend.mockRejectedValueOnce(new Error('Inngest unavailable'));

    const res = await POST(makeRequest(VALID_BODY));
    // Job was inserted — Inngest failure is non-fatal
    expect(res.status).toBe(202);
    expect(mockInsert).toHaveBeenCalledOnce();
  });
});
