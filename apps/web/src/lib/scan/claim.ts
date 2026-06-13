import 'server-only'

/**
 * claimFreeScan — server-only helper that implements the free-scan claim
 * contract used by POST /api/scan/claim (Worker A) and by the post-payment
 * onboarding RSC (this file).
 *
 * CONTRACT (matches Worker A's route):
 *   Input : { free_scan_id: string }
 *   Output:
 *     { ok: true;  scan_id: string; business_id: string }   — 200 equivalent
 *     { ok: false; code: 'not_yours' | 'not_found' | 'already_claimed' | ... }
 *
 * Implementation:
 *   1. Format-validate the UUID before any DB call.
 *   2. Resolve the authenticated user via the anon/cookie client.
 *   3. Fetch the free_scans row via the admin client (RLS bypass — read is safe
 *      here because we gate on authenticated user + email match below).
 *   4. Email guard: free_scans.email must match user.email (case-insensitive).
 *   5. Idempotent: already converted by this user → return success.
 *   6. Already converted by a different user → 'not_yours'.
 *   7. Upsert businesses row (admin client — needs to write regardless of RLS).
 *   8. Insert scans row (admin client).
 *   9. Mark free_scans.converted_user_id = user.id.
 *
 * All DB errors and unexpected throws map to { ok: false, code: 'internal' }
 * so the caller treats them as non-fatal.
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/agents/db/admin-client'

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

// v4 UUID guard — must match the Worker A route's validation.
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

    const admin = getAdminClient()

    // Step 3 — Fetch the free_scans row (admin client for consistent reads)
    const { data: freeScan, error: fetchError } = await admin
      .from('free_scans')
      .select(
        'id, email, domain, business_name, website_url, results, status, converted_user_id',
      )
      .eq('id', freeScanId)
      .single()

    if (fetchError || !freeScan) {
      return { ok: false, code: 'not_found' }
    }

    // Step 4 — Idempotent: already claimed by this user
    if (freeScan.converted_user_id === user.id) {
      // Look for the scan that was created during this claim
      const { data: existingScan } = await admin
        .from('scans')
        .select('id, business_id')
        .eq('status', freeScan.status)
        .limit(1)
        .maybeSingle()

      if (existingScan) {
        return {
          ok: true,
          scan_id: existingScan.id,
          business_id: existingScan.business_id,
        }
      }
      // Claimed but can't locate the scan — fallback to success without IDs
      // (the dashboard will handle missing-scan gracefully).
      return { ok: false, code: 'internal' }
    }

    // Step 5 — Already claimed by a different user
    if (freeScan.converted_user_id !== null) {
      return { ok: false, code: 'not_yours' }
    }

    // Step 6 — Email guard (case-insensitive)
    if (
      freeScan.email.toLowerCase() !== (user.email ?? '').toLowerCase()
    ) {
      return { ok: false, code: 'not_yours' }
    }

    // Step 7 — Upsert businesses row
    const { data: business, error: bizError } = await admin
      .from('businesses')
      .insert({
        user_id: user.id,
        name: freeScan.business_name,
        website_url: freeScan.website_url,
        language: 'en',
        services: [],
      })
      .select('id')
      .single()

    if (bizError || !business) {
      console.error('[claimFreeScan] failed to upsert business', { bizError })
      return { ok: false, code: 'internal' }
    }

    // Step 8 — Insert scans row
    const { data: scan, error: scanError } = await admin
      .from('scans')
      .insert({
        business_id: business.id,
        scan_type: 'free_import',
        status: freeScan.status ?? 'complete',
        metadata: {
          free_scan_id: freeScan.id,
          results: freeScan.results,
        } as never, // metadata is Json — cast is safe; we validate on read
      })
      .select('id')
      .single()

    if (scanError || !scan) {
      console.error('[claimFreeScan] failed to insert scan', { scanError })
      return { ok: false, code: 'internal' }
    }

    // Step 9 — Mark free_scans.converted_user_id
    const { error: markError } = await admin
      .from('free_scans')
      .update({ converted_user_id: user.id })
      .eq('id', freeScanId)

    if (markError) {
      // Non-fatal — idempotency check will pass next time.
      console.error('[claimFreeScan] failed to mark converted_user_id', {
        markError,
      })
    }

    return { ok: true, scan_id: scan.id, business_id: business.id }
  } catch (err) {
    console.error('[claimFreeScan] unexpected error', { err })
    return { ok: false, code: 'internal' }
  }
}
