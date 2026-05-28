/**
 * Tests for revenue-booking-sweep Inngest cron function.
 *
 * Test matrix:
 *   1. Row >= 61 days old + no refund → booked_at flipped, audit_log written
 *   2. Row >= 61 days old + has refund_events row → skipped (not booked)
 *   3. No eligible rows → returns booked_count: 0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock server-only and @supabase/supabase-js before importing the module
// ---------------------------------------------------------------------------
vi.mock('server-only', () => ({}))

// Mock chain for each table
const selectMock = vi.fn()
const updateMock = vi.fn()
const auditInsertMock = vi.fn()
const refundSelectMock = vi.fn()

let currentTable = ''

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn().mockImplementation((table: string) => {
      currentTable = table
      if (table === 'audit_log') {
        return { insert: auditInsertMock.mockReturnValue({ error: null }) }
      }
      if (table === 'refund_events') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: refundSelectMock,
            }),
          }),
        }
      }
      // revenue_events
      return {
        select: selectMock,
        update: () => ({
          eq: () => ({
            is: updateMock,
          }),
        }),
      }
    }),
  })),
}))

// ---------------------------------------------------------------------------
// Inngest client mock — createFunction captures the handler
// ---------------------------------------------------------------------------
type StepFn = { run: (name: string, fn: () => Promise<unknown>) => Promise<unknown> }

let capturedHandler: ((ctx: { step: StepFn }) => Promise<unknown>) | null = null

vi.mock('../client', () => ({
  inngest: {
    createFunction: vi.fn().mockImplementation(
      (
        _meta: unknown,
        _trigger: unknown,
        handler: (ctx: { step: StepFn }) => Promise<unknown>,
      ) => {
        capturedHandler = handler
        return { id: 'revenue-booking-sweep' }
      },
    ),
  },
}))

// ---------------------------------------------------------------------------
// Env helpers
// ---------------------------------------------------------------------------

function setEnv() {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('revenue-booking-sweep', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    setEnv()
    capturedHandler = null

    // Re-import to register the function
    vi.resetModules()
    await import('./revenue-booking-sweep')
  })

  async function runStep() {
    if (!capturedHandler) throw new Error('Handler not captured — module did not load')

    const step: StepFn = {
      run: async (_name: string, fn: () => Promise<unknown>) => fn(),
    }
    return capturedHandler({ step })
  }

  it('books a 61-day-old row with no refund and writes audit_log', async () => {
    const rowId = 'rev_001'
    const customerId = 'usr_001'

    // Mock revenue_events select chain
    selectMock.mockReturnValueOnce({
      is: () => ({
        lt: () => ({
          returns: () => Promise.resolve({
            data: [
              {
                id: rowId,
                customer_id: customerId,
                amount_cents: 9900,
                currency: 'USD',
                received_at: daysAgo(61),
                paddle_event_id: 'evt_001',
              },
            ],
            error: null,
          }),
        }),
      }),
    })

    // No refund for this customer
    refundSelectMock.mockResolvedValueOnce({ data: null, error: null })

    // Update succeeds
    updateMock.mockResolvedValueOnce({ error: null })

    const result = await runStep() as { booked_count: number; booked_ids: string[] }

    expect(result.booked_count).toBe(1)
    expect(result.booked_ids).toContain(rowId)
    expect(updateMock).toHaveBeenCalledOnce()
    expect(auditInsertMock).toHaveBeenCalledOnce()
    const auditPayload = (auditInsertMock.mock.calls[0] as [Record<string, unknown>])[0] as Record<string, unknown>
    expect(auditPayload).toMatchObject({
      event_type: 'revenue.booked',
      target_id: rowId,
    })
  })

  it('skips a refunded row — booked_at NOT flipped', async () => {
    const rowId = 'rev_002'
    const customerId = 'usr_002'

    selectMock.mockReturnValueOnce({
      is: () => ({
        lt: () => ({
          returns: () => Promise.resolve({
            data: [
              {
                id: rowId,
                customer_id: customerId,
                amount_cents: 9900,
                currency: 'USD',
                received_at: daysAgo(61),
                paddle_event_id: 'evt_002',
              },
            ],
            error: null,
          }),
        }),
      }),
    })

    // This customer HAS a refund_events row
    refundSelectMock.mockResolvedValueOnce({
      data: { id: 'ref_001' },
      error: null,
    })

    const result = await runStep() as { booked_count: number; booked_ids: string[] }

    expect(result.booked_count).toBe(0)
    expect(result.booked_ids).not.toContain(rowId)
    expect(updateMock).not.toHaveBeenCalled()
    expect(auditInsertMock).not.toHaveBeenCalled()
  })

  it('returns booked_count 0 when no eligible rows', async () => {
    selectMock.mockReturnValueOnce({
      is: () => ({
        lt: () => ({
          returns: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
    })

    const result = await runStep() as { booked_count: number; booked_ids: string[] }

    expect(result.booked_count).toBe(0)
    expect(result.booked_ids).toHaveLength(0)
    expect(updateMock).not.toHaveBeenCalled()
  })
})
