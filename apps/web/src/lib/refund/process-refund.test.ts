/**
 * Tests for processRefund
 *
 * Test matrix:
 *   1. Happy path → inserts refund_events with correct schema columns, calls Paddle cancel
 *   2. Refund INSERT writes correct schema columns (paddle_event_id + amount_cents + revenue_event_id)
 *   3. Duplicate processRefund → second call is idempotent (no second Paddle cancel, no error)
 *   4. processRefund inserts refund_events even when Paddle cancel fails
 *   5. processRefund returns error when refund_events INSERT fails (non-23505)
 *   6. processRefund returns SUBSCRIPTION_NOT_FOUND when sub does not exist
 *   7. processRefund returns REVENUE_NOT_FOUND when no unbooked revenue_events found
 *   8. Validation error on empty subscriptionId
 *   9. Profile lookup hard DB error is logged but non-fatal
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
vi.mock('server-only', () => ({}))

// Supabase mock state
const mockSubSelect = vi.fn()
const mockProfileSelect = vi.fn()
const mockRevenueSelect = vi.fn()
const mockRefundInsert = vi.fn()
const mockSubUpdate = vi.fn()
const mockAuditInsert = vi.fn()

// Tracks the last inserted refund_events payload for assertion
let lastRefundInsertPayload: Record<string, unknown> | null = null

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn().mockImplementation((table: string) => {
      if (table === 'subscriptions') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: mockSubSelect,
            }),
          }),
          update: () => ({
            eq: mockSubUpdate,
          }),
        }
      }
      if (table === 'user_profiles') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: mockProfileSelect,
            }),
          }),
        }
      }
      if (table === 'revenue_events') {
        // revenue_events: select().eq().is().order().limit().returns()
        return {
          select: () => ({
            eq: () => ({
              is: () => ({
                order: () => ({
                  limit: () => ({
                    returns: mockRevenueSelect,
                  }),
                }),
              }),
            }),
          }),
        }
      }
      if (table === 'refund_events') {
        return {
          insert: (payload: Record<string, unknown>) => {
            lastRefundInsertPayload = payload
            return {
              select: () => ({
                single: mockRefundInsert,
              }),
            }
          },
        }
      }
      if (table === 'audit_log') {
        return { insert: mockAuditInsert.mockReturnValue({ error: null }) }
      }
      return {}
    }),
  })),
}))

// Email mock — always succeeds
vi.mock('@/lib/email/client', () => ({
  sendEmail: vi.fn().mockResolvedValue({ ok: true, messageId: 'msg_001' }),
}))

// Refund confirmation email template mock
vi.mock('./refund-confirmation-email', () => ({
  RefundConfirmationEmail: vi.fn().mockReturnValue(null),
}))

// ---------------------------------------------------------------------------
// Global fetch mock for Paddle REST calls
// ---------------------------------------------------------------------------
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setEnv() {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
  process.env.PADDLE_API_KEY = 'test-paddle-key'
}

const SUBSCRIPTION_ID = 'sub_db_001'
const PADDLE_SUB_ID = 'sub_paddle_001'
const USER_ID = '00000000-0000-0000-0000-000000000001'
const REVENUE_EVENT_ID = 'rev_001'
const AMOUNT_CENTS = 9900

function setupHappyPath() {
  mockSubSelect.mockResolvedValue({
    data: {
      id: SUBSCRIPTION_ID,
      user_id: USER_ID,
      paddle_subscription_id: PADDLE_SUB_ID,
      status: 'active',
    },
    error: null,
  })

  mockProfileSelect.mockResolvedValue({
    data: { email: 'test@example.com', full_name: 'Test User' },
    error: null,
  })

  mockRevenueSelect.mockResolvedValue({
    data: [{ id: REVENUE_EVENT_ID, amount_cents: AMOUNT_CENTS, paddle_event_id: 'evt_original' }],
    error: null,
  })

  mockRefundInsert.mockResolvedValue({
    data: { id: 'ref_001' },
    error: null,
  })

  mockSubUpdate.mockReturnValue({
    eq: vi.fn().mockResolvedValue({ error: null }),
  })

  mockFetch.mockResolvedValue({
    ok: true,
    status: 200,
    text: async () => '{}',
  })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('processRefund', () => {
  let processRefund: (input: { subscriptionId: string; reason: string }) => Promise<unknown>

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    lastRefundInsertPayload = null
    setEnv()

    const mod = await import('./process-refund')
    processRefund = mod.processRefund
  })

  it('happy path — inserts refund_events, calls Paddle cancel, writes audit_log', async () => {
    setupHappyPath()

    const result = await processRefund({
      subscriptionId: SUBSCRIPTION_ID,
      reason: '14-day money-back guarantee',
    }) as { ok: boolean; refundEventId: string; paddleCancelled: boolean; emailSent: boolean }

    expect(result.ok).toBe(true)
    expect(result.refundEventId).toBe('ref_001')
    expect(result.paddleCancelled).toBe(true)
    expect(result.emailSent).toBe(true)

    // Paddle cancel was called
    expect(mockFetch).toHaveBeenCalledOnce()
    const fetchCall = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(fetchCall[0]).toContain(PADDLE_SUB_ID)
    expect(fetchCall[1].method).toBe('POST')

    // audit_log was written
    expect(mockAuditInsert).toHaveBeenCalledOnce()
    const auditPayload = (mockAuditInsert.mock.calls[0] as [Record<string, unknown>])[0] as Record<string, unknown>
    expect(auditPayload).toMatchObject({
      event_type: 'refund.processed',
      target_table: 'refund_events',
      target_id: 'ref_001',
    })
  })

  it('refund INSERT writes correct schema columns (paddle_event_id + amount_cents + revenue_event_id)', async () => {
    // This test would have caught the schema drift that caused NOT NULL violations in prod.
    setupHappyPath()

    await processRefund({
      subscriptionId: SUBSCRIPTION_ID,
      reason: 'schema-drift-regression-test',
    })

    expect(lastRefundInsertPayload).not.toBeNull()
    const inserted = lastRefundInsertPayload as Record<string, unknown>

    // Required columns per actual schema (20260525000001_agency_tables.sql §6)
    expect(inserted).toHaveProperty('paddle_event_id')
    expect(typeof inserted['paddle_event_id']).toBe('string')
    expect((inserted['paddle_event_id'] as string).length).toBeGreaterThan(0)

    expect(inserted).toHaveProperty('amount_cents', AMOUNT_CENTS)
    expect(typeof inserted['amount_cents']).toBe('number')

    expect(inserted).toHaveProperty('revenue_event_id', REVENUE_EVENT_ID)

    expect(inserted).toHaveProperty('customer_id', USER_ID)
    expect(inserted).toHaveProperty('reason')

    // Columns NOT in the actual schema — must NOT be present
    expect(inserted).not.toHaveProperty('subscription_id')
    expect(inserted).not.toHaveProperty('paddle_subscription_id')
    expect(inserted).not.toHaveProperty('status')
  })

  it('duplicate processRefund → second call is idempotent (no second Paddle cancel, no error)', async () => {
    setupHappyPath()

    // First call — fresh insert
    const firstResult = await processRefund({
      subscriptionId: SUBSCRIPTION_ID,
      reason: '14-day money-back guarantee',
    }) as { ok: boolean }
    expect(firstResult.ok).toBe(true)

    // Second call — simulate 23505 unique violation (paddle_event_id already exists)
    vi.clearAllMocks()
    // Re-setup subscription + profile + revenue mocks (cleared above)
    setupHappyPath()
    mockRefundInsert.mockResolvedValue({
      data: null,
      error: { message: 'duplicate key value violates unique constraint', code: '23505' },
    })

    const secondResult = await processRefund({
      subscriptionId: SUBSCRIPTION_ID,
      reason: '14-day money-back guarantee',
    }) as { ok: boolean; idempotent?: boolean }

    // Should succeed idempotently
    expect(secondResult.ok).toBe(true)
    expect(secondResult.idempotent).toBe(true)

    // Paddle cancel must NOT be called a second time
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('inserts refund_events even when Paddle cancel fails', async () => {
    setupHappyPath()

    // Override fetch to fail
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    })

    const result = await processRefund({
      subscriptionId: SUBSCRIPTION_ID,
      reason: 'test',
    }) as { ok: boolean; refundEventId: string; paddleCancelled: boolean }

    // Refund row still created
    expect(result.ok).toBe(true)
    expect(result.refundEventId).toBe('ref_001')
    // Paddle cancel failed
    expect(result.paddleCancelled).toBe(false)

    // audit_log still written
    expect(mockAuditInsert).toHaveBeenCalledOnce()
  })

  it('returns INSERT_FAILED when refund_events insert fails (non-23505)', async () => {
    setupHappyPath()

    mockRefundInsert.mockResolvedValue({
      data: null,
      error: { message: 'constraint violation', code: '23000' },
    })

    const result = await processRefund({
      subscriptionId: SUBSCRIPTION_ID,
      reason: 'test',
    }) as { ok: boolean; code: string }

    expect(result.ok).toBe(false)
    expect(result.code).toBe('INSERT_FAILED')
    // Paddle was NOT called — we bail before it
    expect(mockFetch).not.toHaveBeenCalled()
    // audit_log NOT written — we bail before it
    expect(mockAuditInsert).not.toHaveBeenCalled()
  })

  it('returns SUBSCRIPTION_NOT_FOUND when subscription does not exist', async () => {
    mockSubSelect.mockResolvedValue({ data: null, error: null })

    const result = await processRefund({
      subscriptionId: 'sub_does_not_exist',
      reason: 'test',
    }) as { ok: boolean; code: string }

    expect(result.ok).toBe(false)
    expect(result.code).toBe('SUBSCRIPTION_NOT_FOUND')
    expect(mockRefundInsert).not.toHaveBeenCalled()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('returns REVENUE_NOT_FOUND when no unbooked revenue_events row exists', async () => {
    mockSubSelect.mockResolvedValue({
      data: {
        id: SUBSCRIPTION_ID,
        user_id: USER_ID,
        paddle_subscription_id: PADDLE_SUB_ID,
        status: 'active',
      },
      error: null,
    })

    mockProfileSelect.mockResolvedValue({
      data: { email: 'test@example.com', full_name: 'Test User' },
      error: null,
    })

    // No revenue_events rows for this customer
    mockRevenueSelect.mockResolvedValue({ data: [], error: null })

    const result = await processRefund({
      subscriptionId: SUBSCRIPTION_ID,
      reason: 'test',
    }) as { ok: boolean; code: string }

    expect(result.ok).toBe(false)
    expect(result.code).toBe('REVENUE_NOT_FOUND')
    expect(mockRefundInsert).not.toHaveBeenCalled()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('returns VALIDATION_ERROR on empty subscriptionId', async () => {
    const result = await processRefund({
      subscriptionId: '',
      reason: 'test',
    }) as { ok: boolean; code: string }

    expect(result.ok).toBe(false)
    expect(result.code).toBe('VALIDATION_ERROR')
    expect(mockSubSelect).not.toHaveBeenCalled()
  })

  it('continues with no email when profile lookup returns a hard DB error', async () => {
    mockSubSelect.mockResolvedValue({
      data: {
        id: SUBSCRIPTION_ID,
        user_id: USER_ID,
        paddle_subscription_id: PADDLE_SUB_ID,
        status: 'active',
      },
      error: null,
    })

    // Hard DB error on profile lookup
    mockProfileSelect.mockResolvedValue({
      data: null,
      error: { message: 'connection error', code: 'PGRST001' },
    })

    mockRevenueSelect.mockResolvedValue({
      data: [{ id: REVENUE_EVENT_ID, amount_cents: AMOUNT_CENTS, paddle_event_id: 'evt_original' }],
      error: null,
    })

    mockRefundInsert.mockResolvedValue({
      data: { id: 'ref_001' },
      error: null,
    })

    mockSubUpdate.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => '{}',
    })

    const result = await processRefund({
      subscriptionId: SUBSCRIPTION_ID,
      reason: 'test',
    }) as { ok: boolean; emailSent: boolean }

    // Refund should still succeed — profile error is non-fatal
    expect(result.ok).toBe(true)
    // Email not sent (no email available due to profile error)
    expect(result.emailSent).toBe(false)
  })
})
