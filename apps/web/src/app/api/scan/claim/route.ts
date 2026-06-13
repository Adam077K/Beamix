/**
 * POST /api/scan/claim
 *
 * Authenticated endpoint. Converts an anonymous free_scan into a normalized
 * scan row (scans + scan_engine_results) linked to the authenticated user.
 *
 * Idempotent: re-posting the same free_scan_id returns the existing scan_id
 * without re-importing data.
 *
 * Request body (Zod-validated):
 *   { free_scan_id: string (UUID) }
 *
 * Authorization:
 *   - Requires a valid Supabase session (cookie-based).
 *   - The free_scan.email must match the authenticated user's email.
 *
 * Responses:
 *   200  { scan_id }  — already claimed; returns existing scan_id
 *   201  { scan_id }  — freshly claimed; normalized rows created
 *   400  validation error
 *   401  not authenticated
 *   403  not_yours | already_claimed_by_other
 *   404  free_scan not found
 *   500  internal error
 */

import 'server-only';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { projectFreeScanToNormalized } from '@/lib/scan/import-free-scan';
import type { Database } from '@/lib/db/database.types';

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// Input schema
// ---------------------------------------------------------------------------

const ClaimBodySchema = z.object({
  free_scan_id: z.string().uuid({ message: 'free_scan_id must be a valid UUID' }),
});

// ---------------------------------------------------------------------------
// Admin Supabase client — service-role for all writes
// ---------------------------------------------------------------------------

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  if (!serviceRoleKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');

  return createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── Auth: get authenticated user ──────────────────────────────────────────
  let userClient: Awaited<ReturnType<typeof createServerSupabaseClient>>;
  try {
    userClient = await createServerSupabaseClient();
  } catch (err) {
    console.error('[scan/claim] Failed to create server Supabase client', {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  const { data: { user }, error: userError } = await userClient.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const userId = user.id;
  const userEmail = user.email;

  if (!userEmail) {
    // Should not happen with email/password auth but guard defensively
    return NextResponse.json({ error: 'User email not available' }, { status: 401 });
  }

  // ── Body parse + Zod validation ───────────────────────────────────────────
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = ClaimBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { free_scan_id } = parsed.data;

  // ── Fetch the free_scan row (admin client — RLS Pattern C) ────────────────
  const admin = createAdminClient();

  const { data: freeScan, error: freeScanError } = await admin
    .from('free_scans')
    .select(
      'id, email, business_name, website_url, domain, results, started_at, completed_at, converted_user_id, claimed_at, claimed_business_id',
    )
    .eq('id', free_scan_id)
    .maybeSingle();

  if (freeScanError) {
    console.error('[scan/claim] Failed to fetch free_scan', {
      free_scan_id,
      error: freeScanError.message,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  if (!freeScan) {
    return NextResponse.json({ error: 'Free scan not found' }, { status: 404 });
  }

  // ── Authorization: email must match ───────────────────────────────────────
  const scanEmail = freeScan.email.toLowerCase().trim();
  const authEmail = userEmail.toLowerCase().trim();

  if (scanEmail !== authEmail) {
    return NextResponse.json({ error: 'not_yours' }, { status: 403 });
  }

  // ── Already claimed by a DIFFERENT user — block ───────────────────────────
  if (freeScan.converted_user_id && freeScan.converted_user_id !== userId) {
    return NextResponse.json({ error: 'already_claimed_by_other' }, { status: 403 });
  }

  // ── Idempotency: if already claimed by THIS user, return existing scan_id ─
  if (freeScan.converted_user_id === userId && freeScan.claimed_business_id) {
    // Find the existing scan row via source_free_scan_id
    const { data: existingScan, error: existingScanError } = await admin
      .from('scans')
      .select('id')
      .eq('source_free_scan_id', free_scan_id)
      .maybeSingle();

    if (existingScanError) {
      console.error('[scan/claim] Idempotency check failed — could not fetch existing scan', {
        free_scan_id,
        error: existingScanError.message,
      });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    if (existingScan) {
      return NextResponse.json({ scan_id: existingScan.id }, { status: 200 });
    }
    // Scan row missing despite claimed state — fall through to re-create
  }

  // ── Create or fetch the user's businesses row ─────────────────────────────
  let businessId: string;

  // First, check for an existing business owned by this user
  const { data: existingBusiness, error: existingBusinessError } = await admin
    .from('businesses')
    .select('id')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existingBusinessError) {
    console.error('[scan/claim] Failed to query existing businesses', {
      userId,
      error: existingBusinessError.message,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  if (existingBusiness) {
    businessId = existingBusiness.id;
  } else {
    // Create the business row from free_scan data
    const newBusinessId = crypto.randomUUID();

    const { error: businessInsertError } = await admin.from('businesses').insert({
      id: newBusinessId,
      user_id: userId,
      name: freeScan.business_name,
      website_url: freeScan.website_url,
    });

    if (businessInsertError) {
      console.error('[scan/claim] Failed to create business row', {
        userId,
        free_scan_id,
        error: businessInsertError.message,
      });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    businessId = newBusinessId;
  }

  // ── Project free_scan → normalized rows ───────────────────────────────────
  const newScanId = crypto.randomUUID();

  const { scan: scanData, engineResults } = projectFreeScanToNormalized({
    free_scan_id,
    new_scan_id: newScanId,
    business_id: businessId,
    results: freeScan.results,
    started_at: freeScan.started_at,
    completed_at: freeScan.completed_at,
  });

  // ── Insert scans row ──────────────────────────────────────────────────────
  const { error: scanInsertError } = await admin.from('scans').insert({
    id: scanData.id,
    business_id: scanData.business_id,
    scan_type: scanData.scan_type,
    status: scanData.status,
    source_free_scan_id: scanData.source_free_scan_id,
    started_at: scanData.started_at,
    completed_at: scanData.completed_at,
  });

  if (scanInsertError) {
    // Check for unique constraint violation (idempotency guard at DB level)
    if (scanInsertError.code === '23505') {
      // Unique violation on source_free_scan_id — another concurrent claim won
      const { data: raceWinner } = await admin
        .from('scans')
        .select('id')
        .eq('source_free_scan_id', free_scan_id)
        .maybeSingle();

      if (raceWinner) {
        return NextResponse.json({ scan_id: raceWinner.id }, { status: 200 });
      }
    }

    console.error('[scan/claim] Failed to insert scan row', {
      free_scan_id,
      newScanId,
      error: scanInsertError.message,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  // ── Insert scan_engine_results ────────────────────────────────────────────
  if (engineResults.length > 0) {
    const { error: engineInsertError } = await admin
      .from('scan_engine_results')
      .insert(engineResults);

    if (engineInsertError) {
      console.error('[scan/claim] Failed to insert scan_engine_results', {
        free_scan_id,
        newScanId,
        error: engineInsertError.message,
      });
      // Non-fatal: scan row is created. Log and continue so the claim succeeds.
      // The engine rows can be back-filled by an ops job.
    }
  }

  // ── Mark free_scan as claimed ─────────────────────────────────────────────
  const { error: updateError } = await admin
    .from('free_scans')
    .update({
      converted_user_id: userId,
      claimed_at: new Date().toISOString(),
      claimed_business_id: businessId,
    })
    .eq('id', free_scan_id);

  if (updateError) {
    console.error('[scan/claim] Failed to mark free_scan as claimed', {
      free_scan_id,
      userId,
      error: updateError.message,
    });
    // Non-fatal: the scans row is already created. Log and continue.
  }

  return NextResponse.json({ scan_id: newScanId }, { status: 201 });
}
