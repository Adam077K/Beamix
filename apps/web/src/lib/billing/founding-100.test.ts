/**
 * Unit tests for getFoundingCohortStatus
 *
 * Run manually:  pnpm -F @beamix/web exec vitest run src/lib/billing/founding-100.test.ts
 */

// @ts-expect-error -- vitest is a devDependency; add it to run these tests
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Env stubs — required before the module loads (env guards in getUntypedAdminClient)
// createClient is mocked so these values are never sent to Supabase.
// ---------------------------------------------------------------------------
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'

// ---------------------------------------------------------------------------
// Mock @supabase/supabase-js BEFORE importing the module under test
// ---------------------------------------------------------------------------

const mockFrom = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
  })),
}))

// Mock server-only (Next.js server-only guard — not applicable in test env)
vi.mock('server-only', () => ({}))

// Import AFTER mocking
import { getFoundingCohortStatus } from './founding-100'

// ---------------------------------------------------------------------------
// Helper builders — avoids shared mutable closure state (callIndex anti-pattern)
// ---------------------------------------------------------------------------

/**
 * Build a mockFrom implementation that handles exactly 1 query (no userId):
 *   call 1 → count query result
 */
function buildCountOnlyMock(countResult: { count: number | null; error: { message: string } | null }) {
  return vi.fn().mockReturnValue({
    select: vi.fn().mockResolvedValue(countResult),
  })
}

/**
 * Build a mockFrom implementation that handles 2 queries (with userId):
 *   call 1 (first from()) → count query
 *   call 2 (second from()) → per-user row query chain: .select().eq().maybeSingle()
 */
function buildCountAndMemberMock(
  countResult: { count: number | null; error: { message: string } | null },
  memberRow: { customer_id: string; cohort_number: number | null } | null,
  memberError: { message: string } | null = null,
) {
  let callCount = 0
  return vi.fn().mockImplementation(() => {
    callCount++
    if (callCount === 1) {
      // First from() call — count query
      return {
        select: vi.fn().mockResolvedValue(countResult),
      }
    }
    // Second from() call — per-user query
    return {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: memberRow,
            error: memberError,
          }),
        }),
      }),
    }
  })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getFoundingCohortStatus', () => {
  it('returns enrolledCount and capacity=100 for a non-member user (no userId)', async () => {
    mockFrom.mockImplementation(buildCountOnlyMock({ count: 42, error: null }))

    const result = await getFoundingCohortStatus()

    expect(result.capacity).toBe(100)
    expect(result.enrolledCount).toBe(42)
    expect(result.isCustomerFounding).toBe(false)
    expect(result.cohortNumber).toBeNull()
  })

  it('returns isCustomerFounding=true when userId is enrolled', async () => {
    const userId = 'user-uuid-founding'

    mockFrom.mockImplementation(
      buildCountAndMemberMock(
        { count: 5, error: null },
        { customer_id: userId, cohort_number: 7 },
      ),
    )

    const result = await getFoundingCohortStatus(userId)

    expect(result.enrolledCount).toBe(5)
    expect(result.capacity).toBe(100)
    expect(result.isCustomerFounding).toBe(true)
    // P1 regression: cohortNumber must be the member's slot, NOT enrolledCount
    expect(result.cohortNumber).toBe(7)
  })

  // P1 regression — guards the cohort_number bug specifically
  it('[P1 regression] returns cohortNumber from membership row, not from enrolledCount', async () => {
    const userId = 'user-slot-5'

    // 37 total enrolled, but this member's slot is #5
    mockFrom.mockImplementation(
      buildCountAndMemberMock(
        { count: 37, error: null },
        { customer_id: userId, cohort_number: 5 },
      ),
    )

    const result = await getFoundingCohortStatus(userId)

    expect(result.enrolledCount).toBe(37)
    expect(result.cohortNumber).toBe(5)
    // The two must differ — that's the whole point of the fix
    expect(result.cohortNumber).not.toBe(result.enrolledCount)
  })

  it('returns cohortNumber=null when membership row has null cohort_number', async () => {
    const userId = 'user-null-cohort'

    mockFrom.mockImplementation(
      buildCountAndMemberMock(
        { count: 10, error: null },
        { customer_id: userId, cohort_number: null },
      ),
    )

    const result = await getFoundingCohortStatus(userId)

    expect(result.isCustomerFounding).toBe(true)
    expect(result.cohortNumber).toBeNull()
  })

  it('returns isCustomerFounding=false when userId is not enrolled', async () => {
    const userId = 'user-not-founding'

    mockFrom.mockImplementation(
      buildCountAndMemberMock({ count: 20, error: null }, null),
    )

    const result = await getFoundingCohortStatus(userId)

    expect(result.enrolledCount).toBe(20)
    expect(result.isCustomerFounding).toBe(false)
    expect(result.cohortNumber).toBeNull()
  })

  it('returns safe defaults when count query errors', async () => {
    mockFrom.mockImplementation(
      buildCountOnlyMock({
        count: null,
        error: { message: 'relation "founding_100_cohort" does not exist' },
      }),
    )

    const result = await getFoundingCohortStatus('some-user')

    expect(result.enrolledCount).toBe(0)
    expect(result.capacity).toBe(100)
    expect(result.isCustomerFounding).toBe(false)
    expect(result.cohortNumber).toBeNull()
  })
})
