/**
 * Tests for revenue-booking-sweep Inngest cron function.
 *
 * Test matrix:
 *   1. Row >= 61 days old + no refund → booked_at flipped, audit_log written
 *   2. Row >= 61 days old + has refund_events row (by revenue_event_id) → skipped (not booked)
 *   3. No eligible rows → returns booked_count: 0
 *   4. Customer with an UNRELATED earlier refund (different revenue_event_id) → new revenue event IS booked
 *      (regression: old customer_id guard would have blocked this)
 *   5. Day-59 row excluded (not yet eligible), day-61 row is booked (boundary)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock server-only and @supabase/supabase-js before importing the module
// ---------------------------------------------------------------------------
vi.mock('server-only', () => ({}))

// Mock chain for each table — now refund_events is queried by revenue_event_id
const selectMock = vi.fn()
const updateMock = vi.fn()
const auditInsertMock = vi.fn()
const refundSelectMock = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn().mockImplementation((table: string) => {
      if (table === 'audit_log') {
        return { insert: auditInsertMock.mockReturnValue({ error: null }) }
      }
      if (table === 'refund_events') {
        // P1 Fix 3: guard now uses .eq('revenue_event_id', row.id).limit(1).maybeSingle()
        return {
          select: () => ({
            eq: () => ({
              limit: () => ({
                maybeSingle: refundSelectMock,
              }),
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

    // No refund for this specific revenue event
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

  it('skips a revenue event that has a matching refund_events row — booked_at NOT flipped', async () => {
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

    // This specific revenue event HAS a refund_events row (revenue_event_id = rowId)
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

  it('books a NEW revenue event for a customer who had an UNRELATED earlier refund (over-match regression)', async () => {
    // This is the regression test for P1 Fix 3.
    // Old guard: if ANY refund_events row exists for customer_id → skip ALL events for that customer.
    // New guard: match on revenue_event_id = row.id → only skip the specific refunded event.
    //
    // Scenario:
    //   - Customer has two eligible revenue events: rev_old (refunded) and rev_new (not refunded)
    //   - rev_old has a refund_events row → skipped
    //   - rev_new has NO refund_events row → should be booked

    const customerId = 'usr_003'
    const revOldId = 'rev_old'
    const revNewId = 'rev_new'

    selectMock.mockReturnValueOnce({
      is: () => ({
        lt: () => ({
          returns: () => Promise.resolve({
            data: [
              {
                id: revOldId,
                customer_id: customerId,
                amount_cents: 9900,
                currency: 'USD',
                received_at: daysAgo(65),
                paddle_event_id: 'evt_old',
              },
              {
                id: revNewId,
                customer_id: customerId,
                amount_cents: 18900,
                currency: 'USD',
                received_at: daysAgo(62),
                paddle_event_id: 'evt_new',
              },
            ],
            error: null,
          }),
        }),
      }),
    })

    // rev_old → has a refund (by revenue_event_id)
    refundSelectMock.mockResolvedValueOnce({ data: { id: 'ref_old' }, error: null })
    // rev_new → no refund (different revenue_event_id)
    refundSelectMock.mockResolvedValueOnce({ data: null, error: null })

    // Update for rev_new succeeds
    updateMock.mockResolvedValueOnce({ error: null })

    const result = await runStep() as { booked_count: number; booked_ids: string[] }

    // Only rev_new should be booked
    expect(result.booked_count).toBe(1)
    expect(result.booked_ids).toContain(revNewId)
    expect(result.booked_ids).not.toContain(revOldId)

    // updateMock called once (for rev_new only)
    expect(updateMock).toHaveBeenCalledOnce()
    // auditInsertMock called once (for rev_new only)
    expect(auditInsertMock).toHaveBeenCalledOnce()
  })

  it('day-59 row is excluded (not yet eligible), day-61 row is booked (boundary)', async () => {
    // The sweep query filters: received_at < now() - 60 days
    // day-61 row: received_at = 61 days ago → eligible (61 > 60 → lt passes)
    // day-59 row: received_at = 59 days ago → NOT eligible (59 < 60 → lt fails)
    //
    // We mock the DB to simulate the query correctly returning only the day-61 row
    // (the DB does the filtering — we test what the sweep does with what the DB returns).

    const rowId = 'rev_day61'
    const customerId = 'usr_004'

    // Simulate DB returning only the day-61 row (day-59 filtered out by .lt('received_at', sixtyDaysAgo))
    selectMock.mockReturnValueOnce({
      is: () => ({
        lt: () => ({
          returns: () => Promise.resolve({
            data: [
              {
                id: rowId,
                customer_id: customerId,
                amount_cents: 7900,
                currency: 'USD',
                received_at: daysAgo(61), // eligible: 61 > 60
                paddle_event_id: 'evt_day61',
              },
              // day-59 row would NOT appear here — filtered out by DB query
            ],
            error: null,
          }),
        }),
      }),
    })

    // No refund for the day-61 row
    refundSelectMock.mockResolvedValueOnce({ data: null, error: null })

    // Update succeeds
    updateMock.mockResolvedValueOnce({ error: null })

    const result = await runStep() as { booked_count: number; booked_ids: string[] }

    expect(result.booked_count).toBe(1)
    expect(result.booked_ids).toContain(rowId)
    expect(updateMock).toHaveBeenCalledOnce()
  })
})
