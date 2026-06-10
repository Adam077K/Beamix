/**
 * Tests for POST /api/agents/run — agent ignition route
 *
 * External deps mocked:
 *   - @/lib/supabase/server (createServerSupabaseClient — user-scoped: auth.getUser + businesses IDOR check)
 *   - @/lib/agents/db/admin-client (getAdminClient — subscriptions read + agent_jobs write)
 *   - @/inngest/client (inngest.send)
 *
 * Scenarios:
 *   1. 401 — no authenticated session
 *   2. 400 — Zod validation fails (bad agentType, missing businessId, non-UUID)
 *   3. 400 — targetUrl with private/cloud-metadata IP rejected (SSRF guard)
 *   4. 404 — IDOR: businessId belongs to a different user
 *   5. 403 — agent not available on user's plan tier
 *   6. 429 — daily cap exceeded for free agent
 *   7. 500 — agent_jobs INSERT fails
 *   8. 502 — Inngest send fails → job updated to 'failed' → 502 returned
 *   9. 202 — happy path: agent_jobs inserted + Inngest fired
 *  10. queryCluster in Inngest event but NOT in agent_jobs insert (no column)
 *
 * Security (#4): asserts BOTH .eq('id', businessId) AND .eq('user_id', sessionUserId)
 * are called so the IDOR filter is never silently dropped.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Environment stubs — before any module imports
// ---------------------------------------------------------------------------

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
process.env.INNGEST_EVENT_KEY = 'dev-dummy';

// ---------------------------------------------------------------------------
// Hoisted mocks
// Two separate Supabase client shapes:
//   userClient  — from createServerClient (@supabase/ssr); owns auth.getUser + businesses query
//   adminClient — from getAdminClient (@/lib/agents/db/admin-client); owns subscriptions + agent_jobs
// ---------------------------------------------------------------------------

const {
  mockGetUser,
  // user-client mocks
  mockUserFrom,
  mockUserEq,
  mockUserMaybeSingle,
  // admin-client mocks
  mockAdminFrom,
  mockAdminEq,
  mockAdminMaybeSingle,
  mockAdminInsert,
  mockAdminUpdate,
  mockAdminUpdateEq,
  // inngest
  mockInngestSend,
} = vi.hoisted(() => {
  // ---- user client -------------------------------------------------------
  const mockGetUser = vi.fn();
  const mockUserMaybeSingle = vi.fn();
  const mockUserEq = vi.fn();
  const mockUserSelect = vi.fn();

  // user query chain: from('businesses').select(...).eq(...).eq(...).maybeSingle()
  const userChain = {
    select: mockUserSelect,
    eq: mockUserEq,
    maybeSingle: mockUserMaybeSingle,
  };
  mockUserSelect.mockReturnValue(userChain);
  mockUserEq.mockReturnValue(userChain);

  const mockUserFrom = vi.fn().mockReturnValue(userChain);

  // ---- admin client -------------------------------------------------------
  const mockAdminMaybeSingle = vi.fn();
  const mockAdminInsert = vi.fn().mockResolvedValue({ error: null });
  const mockAdminUpdateEq = vi.fn().mockResolvedValue({ error: null });
  const mockAdminUpdate = vi.fn().mockReturnValue({ eq: mockAdminUpdateEq });
  const mockAdminEq = vi.fn();
  const mockAdminIn = vi.fn();
  const mockAdminOrder = vi.fn();
  const mockAdminLimit = vi.fn();
  const mockAdminSelect = vi.fn();

  // admin query chain — used for subscriptions (select/eq/in/order/limit/maybeSingle)
  // and agent_jobs (insert, update/eq)
  const adminChain = {
    select: mockAdminSelect,
    eq: mockAdminEq,
    in: mockAdminIn,
    order: mockAdminOrder,
    limit: mockAdminLimit,
    maybeSingle: mockAdminMaybeSingle,
    insert: mockAdminInsert,
    update: mockAdminUpdate,
  };
  mockAdminSelect.mockReturnValue(adminChain);
  mockAdminEq.mockReturnValue(adminChain);
  mockAdminIn.mockReturnValue(adminChain);
  mockAdminOrder.mockReturnValue(adminChain);
  mockAdminLimit.mockReturnValue(adminChain);

  const mockAdminFrom = vi.fn().mockReturnValue(adminChain);

  // ---- inngest ------------------------------------------------------------
  const mockInngestSend = vi.fn().mockResolvedValue(undefined);

  return {
    mockGetUser,
    mockUserFrom,
    mockUserEq,
    mockUserMaybeSingle,
    mockAdminFrom,
    mockAdminEq,
    mockAdminMaybeSingle,
    mockAdminInsert,
    mockAdminUpdate,
    mockAdminUpdateEq,
    mockInngestSend,
  };
});

// ---------------------------------------------------------------------------
// vi.mock calls (factories run hoisted — all vars above are available)
// ---------------------------------------------------------------------------

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: mockUserFrom,
  })),
}));

vi.mock('@/lib/agents/db/admin-client', () => ({
  getAdminClient: vi.fn(() => ({ from: mockAdminFrom })),
}));

vi.mock('@/inngest/client', () => ({
  inngest: { send: mockInngestSend },
}));

// ---------------------------------------------------------------------------
// Import route under test (after all vi.mock calls)
// ---------------------------------------------------------------------------

import { POST } from './route';

// ---------------------------------------------------------------------------
// Test helpers
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

    // Re-establish mock return values wiped by clearAllMocks.
    // The chain references are stable objects so we just need to re-wire
    // the methods on them.
    mockAdminInsert.mockResolvedValue({ error: null });
    mockAdminUpdateEq.mockResolvedValue({ error: null });
    mockAdminUpdate.mockReturnValue({ eq: mockAdminUpdateEq });
    mockInngestSend.mockResolvedValue(undefined);

    // Rebuild user chain returns
    const userChain = {
      select: vi.fn().mockReturnThis(),
      eq: mockUserEq,
      maybeSingle: mockUserMaybeSingle,
    };
    mockUserFrom.mockReturnValue(userChain);
    mockUserEq.mockReturnValue(userChain);

    // Rebuild admin chain returns
    const adminChain = {
      select: vi.fn().mockReturnThis(),
      eq: mockAdminEq,
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: mockAdminMaybeSingle,
      insert: mockAdminInsert,
      update: mockAdminUpdate,
    };
    mockAdminFrom.mockReturnValue(adminChain);
    mockAdminEq.mockReturnValue(adminChain);
  });

  // -------------------------------------------------------------------------
  // 1. 401 — unauthenticated
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
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'JWT expired' } });
    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(401);
  });

  // -------------------------------------------------------------------------
  // 2. 400 — Zod validation failures
  // -------------------------------------------------------------------------
  it('returns 400 for invalid agentType', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: VALID_USER_ID } }, error: null });
    const res = await POST(makeRequest({ agentType: 'does_not_exist', businessId: VALID_BUSINESS_ID }));
    expect(res.status).toBe(400);
    const json = await res.json() as Record<string, unknown>;
    expect(json.error).toBe('Validation failed');
    expect(json.details).toBeDefined();
    expect(mockAdminFrom).not.toHaveBeenCalled();
  });

  it('returns 400 for missing businessId', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: VALID_USER_ID } }, error: null });
    const res = await POST(makeRequest({ agentType: 'query_mapper' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for non-UUID businessId', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: VALID_USER_ID } }, error: null });
    const res = await POST(makeRequest({ agentType: 'query_mapper', businessId: 'not-a-uuid' }));
    expect(res.status).toBe(400);
  });

  // -------------------------------------------------------------------------
  // 3. 400 — SSRF guard: targetUrl with private/cloud-metadata hosts rejected
  // -------------------------------------------------------------------------
  it('returns 400 for targetUrl pointing to AWS metadata endpoint (169.254.169.254)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: VALID_USER_ID } }, error: null });
    const res = await POST(makeRequest({
      agentType: 'query_mapper',
      businessId: VALID_BUSINESS_ID,
      targetUrl: 'http://169.254.169.254/',
    }));
    expect(res.status).toBe(400);
    const json = await res.json() as Record<string, unknown>;
    expect(json.error).toBe('Validation failed');
    // No DB queries reached
    expect(mockAdminFrom).not.toHaveBeenCalled();
  });

  it('returns 400 for targetUrl using file:// scheme', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: VALID_USER_ID } }, error: null });
    const res = await POST(makeRequest({
      agentType: 'query_mapper',
      businessId: VALID_BUSINESS_ID,
      targetUrl: 'file:///etc/passwd',
    }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for targetUrl pointing to localhost', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: VALID_USER_ID } }, error: null });
    const res = await POST(makeRequest({
      agentType: 'query_mapper',
      businessId: VALID_BUSINESS_ID,
      targetUrl: 'http://localhost:8080/admin',
    }));
    expect(res.status).toBe(400);
  });

  it('accepts a valid public https targetUrl', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: VALID_USER_ID } }, error: null });
    mockUserMaybeSingle.mockResolvedValueOnce({ data: { id: VALID_BUSINESS_ID }, error: null });
    mockAdminMaybeSingle.mockResolvedValueOnce({ data: MOCK_SUBSCRIPTION_DATA, error: null });
    mockAdminInsert.mockResolvedValueOnce({ error: null });

    const res = await POST(makeRequest({
      agentType: 'query_mapper',
      businessId: VALID_BUSINESS_ID,
      targetUrl: 'https://example.com/blog/article',
    }));
    expect(res.status).toBe(202);
  });

  // -------------------------------------------------------------------------
  // 4. 404 — IDOR: business not owned by session user
  //    Assert BOTH eq filters applied on the user-scoped client
  // -------------------------------------------------------------------------
  it('returns 404 when business belongs to a different user (IDOR)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: VALID_USER_ID } }, error: null });
    // User-scoped businesses query returns no row
    mockUserMaybeSingle.mockResolvedValueOnce({ data: null, error: null });

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(404);
    const json = await res.json() as Record<string, unknown>;
    expect(json.error).toBe('Business not found');

    // Pipeline must not be triggered
    expect(mockInngestSend).not.toHaveBeenCalled();
    expect(mockAdminInsert).not.toHaveBeenCalled();

    // Security: verify businesses was queried on the user-scoped client
    expect(mockUserFrom).toHaveBeenCalledWith('businesses');
    // Verify BOTH .eq filters were applied (id + user_id)
    const eqCalls = mockUserEq.mock.calls as Array<[string, string]>;
    const eqKeys = eqCalls.map(([k]) => k);
    expect(eqKeys).toContain('id');
    expect(eqKeys).toContain('user_id');
    // The user_id filter must carry the actual session user id (not any other value)
    const userIdFilter = eqCalls.find(([k]) => k === 'user_id');
    expect(userIdFilter?.[1]).toBe(VALID_USER_ID);
  });

  // -------------------------------------------------------------------------
  // 5. 403 — Agent not available on plan tier
  //    authority_blog_strategist requires build or scale
  // -------------------------------------------------------------------------
  it('returns 403 when agent is not available on the user plan tier', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: VALID_USER_ID } }, error: null });
    mockUserMaybeSingle.mockResolvedValueOnce({ data: { id: VALID_BUSINESS_ID }, error: null });
    mockAdminMaybeSingle.mockResolvedValueOnce({ data: MOCK_SUBSCRIPTION_DATA, error: null });

    const res = await POST(makeRequest({
      agentType: 'authority_blog_strategist',
      businessId: VALID_BUSINESS_ID,
    }));
    expect(res.status).toBe(403);
    const json = await res.json() as Record<string, unknown>;
    expect(json.error).toBe('Agent not available on your current plan');
    expect(mockAdminInsert).not.toHaveBeenCalled();
    expect(mockInngestSend).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // 6. 429 — Daily cap exceeded (faq_builder, discover tier cap = 3)
  // -------------------------------------------------------------------------
  it('returns 429 when daily cap is exceeded for a free agent', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: VALID_USER_ID } }, error: null });
    mockUserMaybeSingle.mockResolvedValueOnce({ data: { id: VALID_BUSINESS_ID }, error: null });
    mockAdminMaybeSingle
      .mockResolvedValueOnce({ data: MOCK_SUBSCRIPTION_DATA, error: null })  // subscriptions
      .mockResolvedValueOnce({ data: { used_today: 3 }, error: null });      // daily_cap_usage

    const res = await POST(makeRequest({ agentType: 'faq_builder', businessId: VALID_BUSINESS_ID }));
    expect(res.status).toBe(429);
    const json = await res.json() as Record<string, unknown>;
    expect(json.error).toBe('Daily cap exceeded for this agent');
    expect(json.capStatus).toBeDefined();
    expect(mockAdminInsert).not.toHaveBeenCalled();
    expect(mockInngestSend).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // 7. 500 — agent_jobs INSERT fails
  // -------------------------------------------------------------------------
  it('returns 500 when agent_jobs INSERT fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: VALID_USER_ID } }, error: null });
    mockUserMaybeSingle.mockResolvedValueOnce({ data: { id: VALID_BUSINESS_ID }, error: null });
    mockAdminMaybeSingle.mockResolvedValueOnce({ data: MOCK_SUBSCRIPTION_DATA, error: null });
    mockAdminInsert.mockResolvedValueOnce({ error: { message: 'DB write failed' } });

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(500);
    const json = await res.json() as Record<string, unknown>;
    expect(json.error).toBe('Failed to queue agent job');
    expect(mockInngestSend).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // 8. 502 — Inngest send fails → row updated to 'failed' → 502 returned
  // -------------------------------------------------------------------------
  it('returns 502 and marks job failed when Inngest send throws', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: VALID_USER_ID } }, error: null });
    mockUserMaybeSingle.mockResolvedValueOnce({ data: { id: VALID_BUSINESS_ID }, error: null });
    mockAdminMaybeSingle.mockResolvedValueOnce({ data: MOCK_SUBSCRIPTION_DATA, error: null });
    mockAdminInsert.mockResolvedValueOnce({ error: null });
    mockInngestSend.mockRejectedValueOnce(new Error('Inngest unavailable'));
    // Update to 'failed' succeeds
    mockAdminUpdateEq.mockResolvedValueOnce({ error: null });

    const res = await POST(makeRequest(VALID_BODY));

    // Must be 502, NOT 202
    expect(res.status).toBe(502);
    const json = await res.json() as Record<string, unknown>;
    expect(typeof json.error).toBe('string');

    // The agent_jobs row must have been updated to status='failed'
    expect(mockAdminUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'failed' }),
    );
    const updatePayload = mockAdminUpdate.mock.calls[0][0] as Record<string, unknown>;
    expect(updatePayload.status).toBe('failed');
    expect(typeof updatePayload.error_message).toBe('string');
    expect((updatePayload.error_message as string).length).toBeGreaterThan(0);
  });

  // -------------------------------------------------------------------------
  // 9. 202 — Happy path: INSERT + Inngest fired
  // -------------------------------------------------------------------------
  it('returns 202 and fires Inngest on the happy path', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: VALID_USER_ID } }, error: null });
    mockUserMaybeSingle.mockResolvedValueOnce({ data: { id: VALID_BUSINESS_ID }, error: null });
    mockAdminMaybeSingle.mockResolvedValueOnce({ data: MOCK_SUBSCRIPTION_DATA, error: null });
    mockAdminInsert.mockResolvedValueOnce({ error: null });

    const res = await POST(makeRequest({
      ...VALID_BODY,
      scanId: VALID_SCAN_ID,
      customInstructions: 'Focus on Israeli market',
    }));

    expect(res.status).toBe(202);
    const json = await res.json() as Record<string, unknown>;
    expect(json.status).toBe('queued');
    expect(typeof json.jobId).toBe('string');

    // Verify agent_jobs insert shape
    expect(mockAdminInsert).toHaveBeenCalledOnce();
    const insertArg = mockAdminInsert.mock.calls[0][0] as Record<string, unknown>;
    expect(insertArg.agent_type).toBe('query_mapper');
    expect(insertArg.business_id).toBe(VALID_BUSINESS_ID);
    expect(insertArg.user_id).toBe(VALID_USER_ID);
    expect(insertArg.plan_tier).toBe('discover');
    expect(insertArg.credit_cost).toBe(1);
    expect(insertArg.status).toBe('queued');
    expect(insertArg.scan_id).toBe(VALID_SCAN_ID);
    expect(insertArg.custom_instructions).toBe('Focus on Israeli market');
    expect(insertArg.id).toBe(json.jobId);

    // Verify Inngest event payload
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

  // -------------------------------------------------------------------------
  // 10. queryCluster in Inngest event but NOT in agent_jobs insert (no DB column)
  // -------------------------------------------------------------------------
  it('passes queryCluster in the Inngest event but omits it from the agent_jobs insert', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: VALID_USER_ID } }, error: null });
    mockUserMaybeSingle.mockResolvedValueOnce({ data: { id: VALID_BUSINESS_ID }, error: null });
    mockAdminMaybeSingle.mockResolvedValueOnce({ data: MOCK_SUBSCRIPTION_DATA, error: null });
    mockAdminInsert.mockResolvedValueOnce({ error: null });

    const cluster = ['how to rank on ChatGPT', 'best dentist near me'];

    await POST(makeRequest({ ...VALID_BODY, queryCluster: cluster }));

    // queryCluster must NOT appear in the DB insert (no column exists)
    const insertArg = mockAdminInsert.mock.calls[0][0] as Record<string, unknown>;
    expect(Object.keys(insertArg)).not.toContain('query_cluster');
    expect(Object.keys(insertArg)).not.toContain('queryCluster');

    // queryCluster MUST appear in the Inngest event data
    const inngestArg = mockInngestSend.mock.calls[0][0] as {
      name: string;
      data: Record<string, unknown>;
    };
    expect(inngestArg.data.queryCluster).toEqual(cluster);
  });
});
