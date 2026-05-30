/**
 * Unit tests for getFoundingCohortStatus
 *
 * Run manually:  pnpm -F @beamix/web exec vitest run src/lib/billing/founding-100.test.ts
 */

// @ts-expect-error -- vitest is a devDependency; add it to run these tests
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Env stubs — required before the module loads (env guards in getUntyedAdminClient)
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
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getFoundingCohortStatus', () => {
  it('returns enrolledCount and capacity=100 for a non-member user', async () => {
    // Arrange: 42 rows enrolled, no userId provided
    mockFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnValueOnce(
        // Count query (head: true)
        Promise.resolve({ count: 42, error: null }),
      ),
    }))

    const result = await getFoundingCohortStatus()

    expect(result.capacity).toBe(100)
    expect(result.enrolledCount).toBe(42)
    expect(result.isCustomerFounding).toBe(false)
  })

  it('returns isCustomerFounding=true when userId is enrolled', async () => {
    const userId = 'user-uuid-founding'
    let callIndex = 0

    mockFrom.mockImplementation(() => ({
      select: vi.fn().mockImplementation(() => {
        callIndex++
        if (callIndex === 1) {
          // Count query (head: true)
          return Promise.resolve({ count: 5, error: null })
        }
        // Per-user row query
        return {
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { customer_id: userId },
              error: null,
            }),
          }),
        }
      }),
    }))

    const result = await getFoundingCohortStatus(userId)

    expect(result.enrolledCount).toBe(5)
    expect(result.capacity).toBe(100)
    expect(result.isCustomerFounding).toBe(true)
  })

  it('returns safe defaults when count query errors', async () => {
    mockFrom.mockImplementation(() => ({
      select: vi.fn().mockResolvedValue({
        count: null,
        error: { message: 'relation "founding_100_cohort" does not exist' },
      }),
    }))

    const result = await getFoundingCohortStatus('some-user')

    expect(result.enrolledCount).toBe(0)
    expect(result.capacity).toBe(100)
    expect(result.isCustomerFounding).toBe(false)
  })
})
