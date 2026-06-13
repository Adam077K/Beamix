import 'server-only'

/**
 * claimFreeScan — server-only canonical implementation of the free-scan claim
 * contract. Called by both:
 *   - POST /api/scan/claim (route.ts delegates here after auth/Zod at the edge)
 *   - post-payment onboarding RSC (page.tsx calls directly — auth resolved via cookies)
 *
 * CONTRACT:
 *   Input : freeScanId (UUID string)
 *   Output: ClaimResult discriminated union
 *     { ok: true;  scan_id: string; business_id: string }   — created or idempotent
 *     { ok: false; code: 'not_yours' | 'not_found' | 'already_claimed' |
 *                        'no_auth' | 'invalid_id' | 'internal' }
 *
 * Implementation:
 *   1. Format-validate the UUID before any DB call.
 *   2. Resolve the authenticated user via cookie-based anon client.
 *   3. Fetch the free_scans row via admin client (RLS bypass — read is safe here
 *      because we gate on authenticated user + email match below).
 *   4. Authorization: free_scans.email must match user.email (case-insensitive).
 *   5. Already claimed by a different user → 'not_yours' (403).
 *   6. Idempotent: already claimed by THIS user → return existing scan via
 *      source_free_scan_id lookup.
 *   7. Create-or-fetch the user's businesses row (admin client).
 *   8. Project free_scan results → normalized scans + scan_engine_results via
 *      projectFreeScanToNormalized().
 *   9. Insert scans row; handle unique-constraint race (23505) idempotently.
 *  10. Insert scan_engine_results (non-fatal on failure — scan row already exists).
 *  11. Mark free_scans claimed (claimed_at, claimed_business_id, converted_user_id).
 *
 * All DB errors and unexpected throws map to { ok: false, code: 'internal' }
 * so the caller treats them as non-fatal.
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/agents/db/admin-client'
import { projectFreeScanToNormalized } from '@/lib/scan/import-free-scan'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ClaimResult =
  | { ok: true; scan_id: string; business_id: string }
  | {
      ok: false
      code:
        | 'not_yours'
        | 'not_found'
        | 'already_claimed'
        | 'no_auth'
        | 'invalid_id'
        | 'internal'
    }

// v4 UUID guard
const UUID_V4_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// ---------------------------------------------------------------------------
// Main function
// ---------------------------------------------------------------------------

export async function claimFreeScan(freeScanId: string): Promise<ClaimResult> {
  // Step 1 — Format guard
  if (!UUID_V4_RE.test(freeScanId)) {
    return { ok: false, code: 'invalid_id' }
  }

  try {
    // Step 2 — Resolve authenticated user (cookie-based, anon client)
    const anonClient = await createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await anonClient.auth.getUser()

    if (authError || !user) {
      return { ok: false, code: 'no_auth' }
    }

    const userId = user.id
    const userEmail = user.email

    if (!userEmail) {
      return { ok: false, code: 'no_auth' }
    }

    const admin = getAdminClient()

    // Step 3 — Fetch the free_scans row (admin client for consistent reads)
    const { data: freeScan, error: fetchError } = await admin
      .from('free_scans')
      .select(
        'id, email, business_name, website_url, domain, results, started_at, completed_at, converted_user_id, claimed_at, claimed_business_id',
      )
      .eq('id', freeScanId)
      .maybeSingle()

    if (fetchError) {
      console.error('[claimFreeScan] failed to fetch free_scan', {
        freeScanId,
        error: fetchError.message,
      })
      return { ok: false, code: 'internal' }
    }

    if (!freeScan) {
      return { ok: false, code: 'not_found' }
    }

    // Step 4 — Authorization: email must match (case-insensitive)
    const scanEmail = freeScan.email.toLowerCase().trim()
    const authEmail = userEmail.toLowerCase().trim()

    if (scanEmail !== authEmail) {
      return { ok: false, code: 'not_yours' }
    }

    // Step 5 — Already claimed by a DIFFERENT user — block
    if (freeScan.converted_user_id && freeScan.converted_user_id !== userId) {
      return { ok: false, code: 'already_claimed' }
    }

    // Step 6 — Idempotent: already claimed by THIS user
    if (freeScan.converted_user_id === userId && freeScan.claimed_business_id) {
      const { data: existingScan, error: existingScanError } = await admin
        .from('scans')
        .select('id')
        .eq('source_free_scan_id', freeScanId)
        .maybeSingle()

      if (existingScanError) {
        console.error('[claimFreeScan] idempotency check failed', {
          freeScanId,
          error: existingScanError.message,
        })
        return { ok: false, code: 'internal' }
      }

      if (existingScan) {
        return {
          ok: true,
          scan_id: existingScan.id,
          business_id: freeScan.claimed_business_id,
        }
      }
      // Scan row missing despite claimed state — fall through to re-create
    }

    // Step 7 — Create-or-fetch the user's businesses row
    let businessId: string

    const { data: existingBusiness, error: existingBusinessError } = await admin
      .from('businesses')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (existingBusinessError) {
      console.error('[claimFreeScan] failed to query existing businesses', {
        userId,
        error: existingBusinessError.message,
      })
      return { ok: false, code: 'internal' }
    }

    if (existingBusiness) {
      businessId = existingBusiness.id
    } else {
      const newBusinessId = crypto.randomUUID()
      const { error: businessInsertError } = await admin.from('businesses').insert({
        id: newBusinessId,
        user_id: userId,
        name: freeScan.business_name,
        website_url: freeScan.website_url,
      })

      if (businessInsertError) {
        console.error('[claimFreeScan] failed to create business row', {
          userId,
          freeScanId,
          error: businessInsertError.message,
        })
        return { ok: false, code: 'internal' }
      }

      businessId = newBusinessId
    }

    // Step 8 — Project free_scan results → normalized rows
    const newScanId = crypto.randomUUID()

    const { scan: scanData, engineResults } = projectFreeScanToNormalized({
      free_scan_id: freeScanId,
      new_scan_id: newScanId,
      business_id: businessId,
      results: freeScan.results,
      started_at: freeScan.started_at ?? null,
      completed_at: freeScan.completed_at ?? null,
    })

    // Step 9 — Insert scans row
    const { error: scanInsertError } = await admin.from('scans').insert({
      id: scanData.id,
      business_id: scanData.business_id,
      scan_type: scanData.scan_type,
      status: scanData.status,
      source_free_scan_id: scanData.source_free_scan_id,
      started_at: scanData.started_at,
      completed_at: scanData.completed_at,
    })

    if (scanInsertError) {
      // Handle unique constraint race on source_free_scan_id (23505)
      if (scanInsertError.code === '23505') {
        const { data: raceWinner } = await admin
          .from('scans')
          .select('id')
          .eq('source_free_scan_id', freeScanId)
          .maybeSingle()

        if (raceWinner) {
          return { ok: true, scan_id: raceWinner.id, business_id: businessId }
        }
      }

      console.error('[claimFreeScan] failed to insert scan row', {
        freeScanId,
        newScanId,
        error: scanInsertError.message,
      })
      return { ok: false, code: 'internal' }
    }

    // Step 10 — Insert scan_engine_results (non-fatal)
    if (engineResults.length > 0) {
      const { error: engineInsertError } = await admin
        .from('scan_engine_results')
        .insert(engineResults)

      if (engineInsertError) {
        console.error('[claimFreeScan] failed to insert scan_engine_results', {
          freeScanId,
          newScanId,
          error: engineInsertError.message,
        })
        // Non-fatal: scan row created. Log and continue.
      }
    }

    // Step 11 — Mark free_scan as claimed
    const { error: updateError } = await admin
      .from('free_scans')
      .update({
        converted_user_id: userId,
        claimed_at: new Date().toISOString(),
        claimed_business_id: businessId,
      })
      .eq('id', freeScanId)

    if (updateError) {
      // Non-fatal — idempotency check will pass next time.
      console.error('[claimFreeScan] failed to mark free_scan claimed', {
        freeScanId,
        userId,
        error: updateError.message,
      })
    }

    return { ok: true, scan_id: newScanId, business_id: businessId }
  } catch (err) {
    console.error('[claimFreeScan] unexpected error', { err })
    return { ok: false, code: 'internal' }
  }
}
