/**
 * Tests for POST /api/webhooks/paddle
 *
 * Test matrix:
 *   1. Valid HMAC + transaction.completed → inserts revenue_events row
 *   2. Invalid HMAC → 400, no insert
 *   3. Duplicate event_id → no insert (idempotency via ON CONFLICT)
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
const mockSingle = vi.fn()
const mockAuditInsert = vi.fn()

const mockFromChain = (table: string) => {
  if (table === 'audit_log') {
    return { insert: mockAuditInsert.mockReturnValue({ error: null }) }
  }
  // revenue_events
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

function buildSignature(rawBody: string, secret: string): string {
  const ts = Math.floor(Date.now() / 1000).toString()
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

  it('returns 200 for unhandled event types (Paddle retry prevention)', async () => {
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
    expect(mockInsert).not.toHaveBeenCalled()
  })
})
