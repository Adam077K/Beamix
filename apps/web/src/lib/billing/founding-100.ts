import 'server-only'

import { createClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FoundingCohortStatus {
  /** Number of customers currently enrolled as founding members (0–100). */
  enrolledCount: number
  /** Hard capacity — always 100. */
  capacity: 100
  /** Whether the given userId holds a founding membership. False when no userId supplied. */
  isCustomerFounding: boolean
  /**
   * This member's slot number (1–100). Only populated when `isCustomerFounding` is true.
   * Null when the user is not a founding member, or when the row lacks a cohort_number.
   */
  cohortNumber: number | null
}

// ---------------------------------------------------------------------------
// Inline admin client
// We cannot use getAdminClient() from lib/agents/db/admin-client because that
// client is typed against database.types.ts which does not yet include the
// `founding_100_cohort` table (Wave 1 migrations not reflected in types).
// Using an untyped SupabaseClient here avoids the type-system conflict.
// TODO: regenerate database.types.ts after migrations are applied, then switch
//       back to getAdminClient().
// ---------------------------------------------------------------------------

function getUntypedAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  if (!key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

// ---------------------------------------------------------------------------
// Read-only helper — F.1 (Wave 2)
// Insertion logic is F.2, deferred until ToS + insurance are complete.
//
// Queries:
//   1. COUNT(*) FROM founding_100_cohort (one row per enrolled member)
//   2. (Optional) SELECT customer_id FROM founding_100_cohort WHERE customer_id = $userId
//
// The `founding_100_cohort` TABLE was created in migration
//   20260525000001_agency_tables.sql (Wave 1 DB). It has cohort_number 1–100 and
//   uses customer_id as the PK. This is the authoritative source for enrollment count.
// ---------------------------------------------------------------------------

/**
 * Returns the current founding-100 cohort status.
 *
 * - `enrolledCount` — how many active founding members exist (reads `founding_100_cohort` table).
 * - `capacity`      — always 100.
 * - `isCustomerFounding` — true only when `userId` is provided AND that user has
 *   a row in `founding_100_cohort`.
 *
 * This function is READ-ONLY. No inserts or updates are performed here.
 * Enrollment logic lives in the Group C signup route (F.2, deferred).
 *
 * @param userId Optional Supabase auth user ID. When omitted, `isCustomerFounding` is false.
 */
export async function getFoundingCohortStatus(
  userId?: string,
): Promise<FoundingCohortStatus> {
  const db = getUntypedAdminClient()

  // Query 1: total enrolled count — count rows in founding_100_cohort table
  // One row = one founding member, cohort_number constrained to 1–100.
  const { count, error: countError } = await db
    .from('founding_100_cohort')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    // Non-fatal: log and return safe defaults rather than crashing the dashboard.
    console.error('[founding-100] Failed to fetch enrolled count:', countError.message)
    return { enrolledCount: 0, capacity: 100, isCustomerFounding: false, cohortNumber: null }
  }

  const enrolledCount = count ?? 0

  // Query 2: per-user membership check (only when userId is provided)
  let isCustomerFounding = false
  let cohortNumber: number | null = null
  if (userId) {
    const { data, error: userError } = await db
      .from('founding_100_cohort')
      .select('customer_id, cohort_number')
      .eq('customer_id', userId)
      .maybeSingle()

    if (userError) {
      console.error('[founding-100] Failed to fetch user founding status:', userError.message)
      // Non-fatal: keep isCustomerFounding as false, cohortNumber as null
    } else if (data !== null) {
      isCustomerFounding = true
      cohortNumber = (data as { customer_id: string; cohort_number: number | null }).cohort_number ?? null
    }
  }

  return {
    enrolledCount,
    capacity: 100,
    isCustomerFounding,
    cohortNumber,
  }
}
