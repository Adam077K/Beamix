/**
 * Tests for /approvals/quick/[token] — POST handler
 *
 * Covers P1-1, P1-2, P1-3 fixes:
 *   P1-1: Already-actioned/replayed token → 410 (goneResponse), not 500
 *   P1-2: Successful POST fires 'approval.approved' Inngest event with correct data
 *   P1-3: audit_log failure is non-fatal and loudly logged
 *
 * External deps mocked:
 *   - @supabase/supabase-js (createClient)
 *   - @/lib/approvals/signed-token (verifyApprovalToken)
 *   - @/inngest/client (inngest)
 *   - server-only (stubbed in vitest.config.ts)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Environment stubs
// ---------------------------------------------------------------------------

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key'

// ---------------------------------------------------------------------------
// Mock: @/lib/approvals/signed-token
// ---------------------------------------------------------------------------

const mockVerifyApprovalToken = vi.fn()

vi.mock('@/lib/approvals/signed-token', () => ({
  verifyApprovalToken: mockVerifyApprovalToken,
}))

// ---------------------------------------------------------------------------
// Mock: @/inngest/client
// ---------------------------------------------------------------------------

const mockInngestSend = vi.fn().mockResolvedValue(undefined)

vi.mock('@/inngest/client', () => ({
  inngest: { send: mockInngestSend },
}))

// ---------------------------------------------------------------------------
// Mock: @supabase/supabase-js
//
// The POST handler calls getAdminClient() TWICE:
//   Call 1 (lookup block): from('approval_queue').select(...).eq(...).single()
//   Call 2 (update block): from('approval_queue').update(...).eq(...).eq(...).select(...).maybeSingle()
//                          from('audit_log').insert(...)
//
// We build two separate client mocks and make createClient return them in order.
// ---------------------------------------------------------------------------

// ---- Client 1: lookup SELECT ----
const mockLookupSingle = vi.fn()
const mockLookupEq = vi.fn()
const mockLookupSelect = vi.fn()

// chain: .select().eq().single()
mockLookupSingle.mockResolvedValue({ data: null, error: null })
mockLookupEq.mockReturnValue({ single: mockLookupSingle, eq: mockLookupEq })
mockLookupSelect.mockReturnValue({ eq: mockLookupEq })

const mockLookupFrom = vi.fn().mockReturnValue({ select: mockLookupSelect })
const mockLookupClient = { from: mockLookupFrom }

// ---- Client 2: update + audit ----
const mockMaybeSingle = vi.fn()
const mockUpdateSelect = vi.fn()
const mockUpdateEq = vi.fn()
const mockUpdate = vi.fn()
const mockInsert = vi.fn().mockResolvedValue({ error: null })

// chain: .update(...).eq(...).eq(...).select(...).maybeSingle()
mockMaybeSingle.mockResolvedValue({ data: null, error: null })
mockUpdateSelect.mockReturnValue({ maybeSingle: mockMaybeSingle })
mockUpdateEq.mockReturnValue({ eq: mockUpdateEq, select: mockUpdateSelect })
mockUpdate.mockReturnValue({ eq: mockUpdateEq })

const mockUpdateFrom = vi.fn().mockImplementation((table: string) => {
  if (table === 'approval_queue') return { update: mockUpdate }
  return { insert: mockInsert }
})
const mockUpdateClient = { from: mockUpdateFrom }

// createClient returns client1 first, client2 second (then repeats client2)
let createClientCallCount = 0
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockImplementation(() => {
    createClientCallCount++
    // Call 1 = lookup, Call 2+ = update/audit
    return createClientCallCount === 1 ? mockLookupClient : mockUpdateClient
  }),
}))

// ---------------------------------------------------------------------------
// Import SUT after mocks
// ---------------------------------------------------------------------------

const { POST } = await import('./route')

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'
const CUSTOMER_UUID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
const VALID_PAYLOAD = {
  approvalId: VALID_UUID,
  expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
}

const MOCK_UPDATED_ROW = {
  id: VALID_UUID,
  kind: 'content_publish',
  customer_id: CUSTOMER_UUID,
}

function buildRequest(token: string): Request {
  return new Request(`http://localhost/approvals/quick/${token}`, { method: 'POST' })
}

// ---------------------------------------------------------------------------
// Helpers — configure mocks per test
// ---------------------------------------------------------------------------

function setupValidToken() {
  mockVerifyApprovalToken.mockReturnValue(VALID_PAYLOAD)
}

function setupInvalidToken() {
  mockVerifyApprovalToken.mockReturnValue(null)
}

function setupLookupPending() {
  mockLookupSingle.mockResolvedValue({
    data: {
      id: VALID_UUID,
      state: 'pending',
      expires_at: new Date(Date.now() + 3600_000).toISOString(),
    },
    error: null,
  })
}

function setupLookupAlreadyActioned() {
  mockLookupSingle.mockResolvedValue({
    data: {
      id: VALID_UUID,
      state: 'approved',
      expires_at: new Date(Date.now() + 3600_000).toISOString(),
    },
    error: null,
  })
}

function setupUpdateReturnsRow() {
  mockMaybeSingle.mockResolvedValue({ data: MOCK_UPDATED_ROW, error: null })
}

function setupUpdateReturnsNull() {
  mockMaybeSingle.mockResolvedValue({ data: null, error: null })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /approvals/quick/[token]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createClientCallCount = 0

    // Restore lookup chain
    mockLookupSingle.mockResolvedValue({ data: null, error: null })
    mockLookupEq.mockReturnValue({ single: mockLookupSingle, eq: mockLookupEq })
    mockLookupSelect.mockReturnValue({ eq: mockLookupEq })
    mockLookupFrom.mockReturnValue({ select: mockLookupSelect })

    // Restore update chain
    mockMaybeSingle.mockResolvedValue({ data: null, error: null })
    mockUpdateSelect.mockReturnValue({ maybeSingle: mockMaybeSingle })
    mockUpdateEq.mockReturnValue({ eq: mockUpdateEq, select: mockUpdateSelect })
    mockUpdate.mockReturnValue({ eq: mockUpdateEq })
    mockInsert.mockResolvedValue({ error: null })
    mockUpdateFrom.mockImplementation((table: string) => {
      if (table === 'approval_queue') return { update: mockUpdate }
      return { insert: mockInsert }
    })

    mockInngestSend.mockResolvedValue(undefined)
  })

  // ---------------------------------------------------------------------------
  // P1-1: invalid token → 410
  // ---------------------------------------------------------------------------

  it('returns 410 when token is invalid or expired', async () => {
    setupInvalidToken()

    const res = await POST(buildRequest('bad-token') as never, {
      params: Promise.resolve({ token: 'bad-token' }),
    })

    expect(res.status).toBe(410)
  })

  // ---------------------------------------------------------------------------
  // P1-1: race — UPDATE returns null (already actioned between lookup and update)
  // ---------------------------------------------------------------------------

  it('returns 410 (not 500) when UPDATE returns null — replayed/already-actioned token', async () => {
    setupValidToken()
    setupLookupPending()
    setupUpdateReturnsNull()

    const res = await POST(buildRequest('valid-token') as never, {
      params: Promise.resolve({ token: 'valid-token' }),
    })

    expect(res.status).toBe(410)
    // Inngest must NOT fire when update returns null
    expect(mockInngestSend).not.toHaveBeenCalled()
  })

  // ---------------------------------------------------------------------------
  // P1-2: successful POST fires approval.approved event with correct data shape
  // ---------------------------------------------------------------------------

  it('fires approval.approved Inngest event with correct data on success', async () => {
    setupValidToken()
    setupLookupPending()
    setupUpdateReturnsRow()

    const res = await POST(buildRequest('valid-token') as never, {
      params: Promise.resolve({ token: 'valid-token' }),
    })

    // Should redirect to /approvals?approved=1
    expect([302, 307, 308]).toContain(res.status)

    expect(mockInngestSend).toHaveBeenCalledOnce()
    const sentEvent = mockInngestSend.mock.calls[0][0] as {
      name: string
      data: { approvalId: string; kind: string; customerId: string; actedAt: string }
    }
    expect(sentEvent.name).toBe('approval.approved')
    expect(sentEvent.data.approvalId).toBe(VALID_UUID)
    expect(sentEvent.data.kind).toBe('content_publish')
    expect(sentEvent.data.customerId).toBe(CUSTOMER_UUID)
    expect(typeof sentEvent.data.actedAt).toBe('string')
  })

  // ---------------------------------------------------------------------------
  // P1-2: Inngest failure is non-fatal — request still succeeds
  // ---------------------------------------------------------------------------

  it('does NOT fail the request if Inngest dispatch throws', async () => {
    setupValidToken()
    setupLookupPending()
    setupUpdateReturnsRow()
    mockInngestSend.mockRejectedValue(new Error('Inngest unavailable'))

    const res = await POST(buildRequest('valid-token') as never, {
      params: Promise.resolve({ token: 'valid-token' }),
    })

    // Still redirects successfully despite Inngest failure
    expect([302, 307, 308]).toContain(res.status)
  })

  // ---------------------------------------------------------------------------
  // P1-3: audit_log failure is non-fatal
  // ---------------------------------------------------------------------------

  it('does NOT crash the request when audit_log insert throws', async () => {
    setupValidToken()
    setupLookupPending()
    setupUpdateReturnsRow()
    // Make audit_log insert reject
    mockInsert.mockRejectedValueOnce(new Error('DB timeout'))

    const res = await POST(buildRequest('valid-token') as never, {
      params: Promise.resolve({ token: 'valid-token' }),
    })

    // Should still redirect (not 500)
    expect([302, 307, 308]).toContain(res.status)
  })

  // ---------------------------------------------------------------------------
  // Already-actioned redirect from the initial lookup
  // ---------------------------------------------------------------------------

  it('redirects to /approvals?already_actioned=1 when state is not pending in initial lookup', async () => {
    setupValidToken()
    setupLookupAlreadyActioned()

    const res = await POST(buildRequest('valid-token') as never, {
      params: Promise.resolve({ token: 'valid-token' }),
    })

    expect([302, 307, 308]).toContain(res.status)
    const location = res.headers.get('location') ?? ''
    expect(location).toContain('already_actioned=1')
  })
})
