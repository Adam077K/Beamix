/**
 * Tests for POST /api/webhooks/paddle
 *
 * Test matrix:
 *   1. Valid HMAC + transaction.completed → inserts revenue_events row
 *   2. Invalid HMAC → 400, no insert
 *   3. Missing Paddle-Signature header → 400
 *   4. Duplicate event_id → no insert (idempotency via ON CONFLICT)
 *   5. Unhandled event types → 200 + writes audit_log
 *   6. transaction.refunded → writes refund_events row
 *   7. subscription.cancelled → updates subscriptions.status
 *   8. toCents with NaN amount → throws, returns 500 (no zero insert)
 *   9. Stale timestamp (> 5 min) → 400 replay guard
 */

import { describe, it, expect, vi, beforeEach, type MockedFunction } from 'vitest'
import { createHmac } from 'crypto'
import { NextRequest } from 'next/server'

// ---------------------------------------------------------------------------
// Mock `server-only` to avoid Next.js server constraint in test runner
// ---------------------------------------------------------------------------
vi.mock('server-only', () => ({}))

// ---------------------------------------------------------------------------
// Mock @supabase/supabase-js
// ---------------------------------------------------------------------------
const mockInsert = vi.fn()
const mockAuditInsert = vi.fn()
const mockRefundInsert = vi.fn()
const mockSubUpdate = vi.fn()
const mockRevenueSelect = vi.fn()
const mockSubSelect = vi.fn()

const mockFromChain = (table: string) => {
  if (table === 'audit_log') {
    return { insert: mockAuditInsert.mockReturnValue({ error: null }) }
  }
  if (table === 'refund_events') {
    return { insert: mockRefundInsert }
  }
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
  if (table === 'revenue_events') {
    return {
      insert: mockInsert,
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
  // fallback
  return {
    insert: mockInsert,
  }
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn().mockImplementation(mockFromChain),
  })),
}))

// ---------------------------------------------------------------------------
// Mock env vars
// ---------------------------------------------------------------------------
const WEBHOOK_SECRET = 'test-paddle-secret'
const SUPABASE_URL = 'https://test.supabase.co'
const SERVICE_ROLE_KEY = 'test-service-role-key'

function setEnv() {
  process.env.PADDLE_WEBHOOK_SECRET = WEBHOOK_SECRET
  process.env.NEXT_PUBLIC_SUPABASE_URL = SUPABASE_URL
  process.env.SUPABASE_SERVICE_ROLE_KEY = SERVICE_ROLE_KEY
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildSignature(rawBody: string, secret: string, tsOverride?: number): string {
  const ts = (tsOverride ?? Math.floor(Date.now() / 1000)).toString()
  const signedPayload = `${ts}:${rawBody}`
  const hash = createHmac('sha256', secret).update(signedPayload).digest('hex')
  return `ts=${ts};h1=${hash}`
}

function makeRequest(body: string, signatureHeader: string | null): NextRequest {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (signatureHeader !== null) {
    headers['Paddle-Signature'] = signatureHeader
  }
  return new NextRequest('http://localhost/api/webhooks/paddle', {
    method: 'POST',
    headers,
    body,
  })
}

const validTransactionPayload = JSON.stringify({
  event_id: 'evt_test_001',
  event_type: 'transaction.completed',
  occurred_at: '2026-05-28T12:00:00Z',
  data: {
    id: 'txn_001',
    customer_id: 'ctm_001',
    currency_code: 'USD',
    details: {
      totals: {
        total: '99.00',
      },
    },
    subscription_id: 'sub_001',
    custom_data: {
      user_id: '00000000-0000-0000-0000-000000000001',
    },
  },
})

const validRefundPayload = JSON.stringify({
  event_id: 'evt_refund_001',
  event_type: 'transaction.refunded',
  occurred_at: '2026-05-28T14:00:00Z',
  data: {
    id: 'txn_refund_001',
    customer_id: 'ctm_001',
    currency_code: 'USD',
    details: {
      totals: {
        total: '99.00',
      },
    },
    subscription_id: 'sub_001',
    custom_data: {
      user_id: '00000000-0000-0000-0000-000000000001',
    },
  },
})

const validCancelPayload = JSON.stringify({
  event_id: 'evt_cancel_001',
  event_type: 'subscription.cancelled',
  occurred_at: '2026-05-28T15:00:00Z',
  data: {
    id: 'sub_paddle_001',
    customer_id: 'ctm_001',
    custom_data: {
      user_id: '00000000-0000-0000-0000-000000000001',
    },
  },
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/webhooks/paddle', () => {
  let POST: (req: NextRequest) => Promise<Response>

  beforeEach(async () => {
    vi.resetModules()
    vi.clearAllMocks()
    setEnv()

    // Re-import to get fresh module after resetModules
    const mod = await import('./route')
    POST = mod.POST
  })

  it('returns 200 and inserts revenue_events on valid HMAC + transaction.completed', async () => {
    const body = validTransactionPayload
    const sig = buildSignature(body, WEBHOOK_SECRET)

    mockInsert.mockReturnValue({ error: null })

    const req = makeRequest(body, sig)
    const res = await POST(req)

    expect(res.status).toBe(200)
    const json = await res.json() as { received: boolean }
    expect(json.received).toBe(true)
    expect(mockInsert).toHaveBeenCalledOnce()
    const insertCall = mockInsert.mock.calls[0] as [unknown]
    const inserted = insertCall[0] as Record<string, unknown>
    expect(inserted).toMatchObject({
      paddle_event_id: 'evt_test_001',
      amount_cents: 9900,
      currency: 'USD',
      booked_at: null,
    })
  })

  it('returns 400 on invalid HMAC and does NOT insert', async () => {
    const body = validTransactionPayload
    const sig = buildSignature(body, 'wrong-secret')

    const req = makeRequest(body, sig)
    const res = await POST(req)

    expect(res.status).toBe(400)
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('returns 400 when Paddle-Signature header is missing', async () => {
    const body = validTransactionPayload
    const req = makeRequest(body, null)
    const res = await POST(req)
    expect(res.status).toBe(400)
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('returns 200 on duplicate event_id (idempotency — no-op)', async () => {
    const body = validTransactionPayload
    const sig = buildSignature(body, WEBHOOK_SECRET)

    // Simulate unique_violation (23505)
    mockInsert.mockReturnValue({
      error: { code: '23505', message: 'duplicate key value violates unique constraint' },
    })

    const req = makeRequest(body, sig)
    const res = await POST(req)

    // Should still return 200 — duplicate is a no-op, not an error
    expect(res.status).toBe(200)
    expect(mockInsert).toHaveBeenCalledOnce()
  })

  it('returns 200 for unhandled event types and writes audit_log (observability)', async () => {
    const body = JSON.stringify({
      event_id: 'evt_test_002',
      event_type: 'subscription.paused',
      occurred_at: '2026-05-28T12:00:00Z',
      data: {},
    })
    const sig = buildSignature(body, WEBHOOK_SECRET)
    const req = makeRequest(body, sig)
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json() as { received: boolean; handled: boolean }
    expect(json.handled).toBe(false)
    // P2: audit_log should be written for unhandled-but-verified events
    expect(mockAuditInsert).toHaveBeenCalled()
    const auditCall = (mockAuditInsert.mock.calls[0] as [Record<string, unknown>])[0] as Record<string, unknown>
    expect(auditCall).toMatchObject({
      event_type: 'paddle.unhandled_event_type',
    })
  })

  it('transaction.refunded — writes refund_events row', async () => {
    const body = validRefundPayload
    const sig = buildSignature(body, WEBHOOK_SECRET)

    // revenue_events lookup for revenue_event_id FK (best-effort)
    mockRevenueSelect.mockResolvedValue({ data: [{ id: 'rev_001' }], error: null })

    mockRefundInsert.mockReturnValue({ error: null })

    const req = makeRequest(body, sig)
    const res = await POST(req)

    expect(res.status).toBe(200)
    // refund_events insert was called
    expect(mockRefundInsert).toHaveBeenCalledOnce()
    const refundCall = (mockRefundInsert.mock.calls[0] as [Record<string, unknown>])[0] as Record<string, unknown>
    expect(refundCall).toMatchObject({
      customer_id: '00000000-0000-0000-0000-000000000001',
      paddle_event_id: 'evt_refund_001',
      amount_cents: 9900,
      reason: 'paddle_admin_refund',
    })

    // audit_log should also be written
    expect(mockAuditInsert).toHaveBeenCalled()
    const auditCalls = mockAuditInsert.mock.calls as [Record<string, unknown>][][]
    const refundAudit = auditCalls.find(
      (call) => (call[0] as Record<string, unknown>)['event_type'] === 'revenue.transaction_refunded',
    )
    expect(refundAudit).toBeDefined()
  })

  it('subscription.cancelled — updates subscriptions.status to cancelled', async () => {
    const body = validCancelPayload
    const sig = buildSignature(body, WEBHOOK_SECRET)

    mockSubUpdate.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })

    const req = makeRequest(body, sig)
    const res = await POST(req)

    expect(res.status).toBe(200)
    // subscriptions update was called
    expect(mockSubUpdate).toHaveBeenCalledOnce()
    // audit_log should also be written
    expect(mockAuditInsert).toHaveBeenCalled()
  })

  it('toCents NaN amount → returns 500 (no zero-amount insert)', async () => {
    // A transaction.completed event with a non-numeric amount should throw → 500 → Paddle retry
    const body = JSON.stringify({
      event_id: 'evt_nan_001',
      event_type: 'transaction.completed',
      occurred_at: '2026-05-28T12:00:00Z',
      data: {
        id: 'txn_nan',
        customer_id: 'ctm_001',
        currency_code: 'USD',
        details: {
          totals: {
            total: 'not-a-number',
          },
        },
        custom_data: {
          user_id: '00000000-0000-0000-0000-000000000001',
        },
      },
    })
    const sig = buildSignature(body, WEBHOOK_SECRET)
    const req = makeRequest(body, sig)
    const res = await POST(req)

    // Should return 500 so Paddle retries — never silently insert amount_cents: 0
    expect(res.status).toBe(500)
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('stale timestamp (> 5 min old) → 400 replay guard', async () => {
    const body = validTransactionPayload
    // Build a signature with a timestamp from 10 minutes ago
    const staleTs = Math.floor(Date.now() / 1000) - 600 // 10 min ago
    const sig = buildSignature(body, WEBHOOK_SECRET, staleTs)

    const req = makeRequest(body, sig)
    const res = await POST(req)

    expect(res.status).toBe(400)
    expect(mockInsert).not.toHaveBeenCalled()
  })
})
