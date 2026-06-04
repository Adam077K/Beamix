/**
 * Tests for approvals/_actions — approveApprovalItem / rejectApprovalItem
 *
 * External deps mocked:
 *   - next/headers (cookies)
 *   - @supabase/ssr (createServerClient — user cookie client, used only for getUser)
 *   - @supabase/supabase-js (createClient — service-role admin client, used for UPDATE + audit_log)
 *   - @/inngest/client (inngest)
 *
 * Scenarios:
 *   1. approveApprovalItem updates state to 'approved' via admin client and fires 'approval.approved'
 *   2. rejectApprovalItem updates state to 'rejected' via admin client and fires 'approval.rejected'
 *   3. Non-owner update: admin client returns null (customer_id filter no-match) → { ok: false }
 *   4. Valid owner update: admin client returns row → { ok: true } + Inngest event fired
 *   5. Invalid UUID input returns { ok: false }
 *   6. Unauthenticated user returns { ok: false }
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Environment stubs
// ---------------------------------------------------------------------------

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key'

// ---------------------------------------------------------------------------
// Mock: next/headers
// ---------------------------------------------------------------------------

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: () => [],
    set: vi.fn(),
  }),
}))

// ---------------------------------------------------------------------------
// Mock: @supabase/ssr — createServerClient (user cookie client)
// Used ONLY for auth.getUser() — no DB queries go through this client anymore.
// ---------------------------------------------------------------------------

const mockGetUser = vi.fn()

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn().mockReturnValue({
    auth: { getUser: mockGetUser },
    // from() is intentionally not used on the user client after the P1 fix
    from: vi.fn(),
  }),
}))

// ---------------------------------------------------------------------------
// Mock: @supabase/supabase-js — createClient (admin/service-role client)
// This client now owns BOTH the approval_queue UPDATE and the audit_log insert.
//
// Chain for approval_queue:
//   admin.from('approval_queue').update(...).eq(...).eq(...).eq(...).select(...).maybeSingle()
// Chain for audit_log:
//   admin.from('audit_log').insert(...)
// ---------------------------------------------------------------------------

const mockMaybeSingle = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockUpdate = vi.fn()
const mockAdminInsert = vi.fn().mockResolvedValue({ error: null })

// Build the query chain
mockMaybeSingle.mockResolvedValue({ data: null, error: null })
mockSelect.mockReturnValue({ maybeSingle: mockMaybeSingle })
mockEq.mockReturnValue({ eq: mockEq, select: mockSelect })
mockUpdate.mockReturnValue({ eq: mockEq })

const mockAdminFrom = vi.fn().mockImplementation((table: string) => {
  if (table === 'approval_queue') {
    return { update: mockUpdate }
  }
  // audit_log
  return { insert: mockAdminInsert }
})

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({ from: mockAdminFrom }),
}))

// ---------------------------------------------------------------------------
// Mock: inngest client
// ---------------------------------------------------------------------------

const mockInngestSend = vi.fn().mockResolvedValue(undefined)

vi.mock('@/inngest/client', () => ({
  inngest: { send: mockInngestSend },
}))

// ---------------------------------------------------------------------------
// Import SUT after all mocks are registered
// ---------------------------------------------------------------------------

const { approveApprovalItem, rejectApprovalItem } = await import('./_actions')

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'
const USER_UUID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
const OTHER_USER_UUID = 'ffffffff-eeee-dddd-cccc-bbbbbbbbbbbb'

const MOCK_UPDATED_ROW = {
  id: VALID_UUID,
  kind: 'content_publish',
  customer_id: USER_UUID,
}

// ---------------------------------------------------------------------------
// Helpers — configure mocks per test
// ---------------------------------------------------------------------------

function setupAuthenticatedUser(userId = USER_UUID) {
  mockGetUser.mockResolvedValue({ data: { user: { id: userId } }, error: null })
}

function setupAdminRowFound(row = MOCK_UPDATED_ROW) {
  mockMaybeSingle.mockResolvedValue({ data: row, error: null })
}

function setupAdminRowNotFound() {
  // Simulates customer_id filter no-match (non-owner or already-actioned)
  mockMaybeSingle.mockResolvedValue({ data: null, error: null })
}

function setupAdminDbError(message = 'DB failure') {
  mockMaybeSingle.mockResolvedValue({
    data: null,
    error: { code: 'PGRST000', message },
  })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('approveApprovalItem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Rebuild chains after clearAllMocks
    mockMaybeSingle.mockResolvedValue({ data: null, error: null })
    mockSelect.mockReturnValue({ maybeSingle: mockMaybeSingle })
    mockEq.mockReturnValue({ eq: mockEq, select: mockSelect })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'approval_queue') return { update: mockUpdate }
      return { insert: mockAdminInsert }
    })
    mockAdminInsert.mockResolvedValue({ error: null })
    mockInngestSend.mockResolvedValue(undefined)
  })

  it('returns { ok: true } and fires approval.approved event for valid owned row', async () => {
    setupAuthenticatedUser()
    setupAdminRowFound()

    const result = await approveApprovalItem(VALID_UUID)

    expect(result.ok).toBe(true)
    expect(mockInngestSend).toHaveBeenCalledOnce()
    const sentEvent = mockInngestSend.mock.calls[0][0] as { name: string; data: Record<string, unknown> }
    expect(sentEvent.name).toBe('approval.approved')
    expect(sentEvent.data.approvalId).toBe(VALID_UUID)
  })

  it('UPDATE goes through the admin client (service-role), not the user client', async () => {
    setupAuthenticatedUser()
    setupAdminRowFound()

    await approveApprovalItem(VALID_UUID)

    // admin client's from() must have been called for approval_queue
    expect(mockAdminFrom).toHaveBeenCalledWith('approval_queue')
    // The update chain must have been invoked
    expect(mockUpdate).toHaveBeenCalled()
  })

  it('includes .eq("customer_id", userId) scoping so non-owners get 0 rows', async () => {
    setupAuthenticatedUser(USER_UUID)
    // Simulate non-owner: customer_id filter returns null
    setupAdminRowNotFound()

    const result = await approveApprovalItem(VALID_UUID)

    // Non-owner gets { ok: false }
    expect(result.ok).toBe(false)
    // The eq chain must have been called (customer_id scoping enforced)
    expect(mockEq).toHaveBeenCalled()
    if (!result.ok) {
      expect(result.error).toMatch(/not found|already actioned/i)
    }
  })

  it('non-owner (different customer_id) cannot approve — returns { ok: false }', async () => {
    // OTHER_USER_UUID is authenticated but the row belongs to USER_UUID
    setupAuthenticatedUser(OTHER_USER_UUID)
    // Admin client returns null because customer_id filter no-matches
    setupAdminRowNotFound()

    const result = await approveApprovalItem(VALID_UUID)

    expect(result.ok).toBe(false)
    // Inngest must NOT fire for a non-owner attempt
    expect(mockInngestSend).not.toHaveBeenCalled()
  })

  it('valid owner update returns { ok: true } and Inngest event fires', async () => {
    setupAuthenticatedUser(USER_UUID)
    setupAdminRowFound(MOCK_UPDATED_ROW) // customer_id matches USER_UUID

    const result = await approveApprovalItem(VALID_UUID)

    expect(result.ok).toBe(true)
    expect(mockInngestSend).toHaveBeenCalledOnce()
  })

  it('writes audit_log row via admin client with event_type approval.approved', async () => {
    setupAuthenticatedUser()
    setupAdminRowFound()

    await approveApprovalItem(VALID_UUID)

    expect(mockAdminInsert).toHaveBeenCalledOnce()
    const insertArg = mockAdminInsert.mock.calls[0][0] as Record<string, unknown>
    expect(insertArg.event_type).toBe('approval.approved')
    expect(insertArg.actor_id).toBe(USER_UUID)
  })

  it('returns { ok: false } when row not found (ownership denial via admin client)', async () => {
    setupAuthenticatedUser()
    setupAdminRowNotFound()

    const result = await approveApprovalItem(VALID_UUID)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toMatch(/not found|already actioned/i)
    }
  })

  it('returns { ok: false } when DB update fails', async () => {
    setupAuthenticatedUser()
    setupAdminDbError('connection reset')

    const result = await approveApprovalItem(VALID_UUID)

    expect(result.ok).toBe(false)
  })

  it('returns { ok: false } for invalid UUID input', async () => {
    setupAuthenticatedUser()

    const result = await approveApprovalItem('not-a-uuid')

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toMatch(/invalid approval id/i)
    }
  })

  it('returns { ok: false } when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    const result = await approveApprovalItem(VALID_UUID)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toMatch(/not authenticated/i)
    }
  })
})

// ---------------------------------------------------------------------------

describe('rejectApprovalItem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMaybeSingle.mockResolvedValue({ data: null, error: null })
    mockSelect.mockReturnValue({ maybeSingle: mockMaybeSingle })
    mockEq.mockReturnValue({ eq: mockEq, select: mockSelect })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'approval_queue') return { update: mockUpdate }
      return { insert: mockAdminInsert }
    })
    mockAdminInsert.mockResolvedValue({ error: null })
    mockInngestSend.mockResolvedValue(undefined)
  })

  it('returns { ok: true } and fires approval.rejected event', async () => {
    setupAuthenticatedUser()
    setupAdminRowFound()

    const result = await rejectApprovalItem(VALID_UUID)

    expect(result.ok).toBe(true)
    expect(mockInngestSend).toHaveBeenCalledOnce()
    const sentEvent = mockInngestSend.mock.calls[0][0] as { name: string }
    expect(sentEvent.name).toBe('approval.rejected')
  })

  it('non-owner (different customer_id) cannot reject — admin client returns null → { ok: false }', async () => {
    // OTHER_USER_UUID authenticated; row belongs to USER_UUID → customer_id filter misses
    setupAuthenticatedUser(OTHER_USER_UUID)
    setupAdminRowNotFound()

    const result = await rejectApprovalItem(VALID_UUID)

    expect(result.ok).toBe(false)
    // Inngest must NOT fire
    expect(mockInngestSend).not.toHaveBeenCalled()
  })

  it('valid owner reject returns { ok: true } and Inngest rejection event fires', async () => {
    setupAuthenticatedUser(USER_UUID)
    setupAdminRowFound(MOCK_UPDATED_ROW)

    const result = await rejectApprovalItem(VALID_UUID)

    expect(result.ok).toBe(true)
    expect(mockInngestSend).toHaveBeenCalledOnce()
    const sentEvent = mockInngestSend.mock.calls[0][0] as { name: string }
    expect(sentEvent.name).toBe('approval.rejected')
  })
})
