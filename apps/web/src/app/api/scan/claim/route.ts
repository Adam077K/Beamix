/**
 * POST /api/scan/claim
 *
 * Authenticated endpoint. Converts an anonymous free_scan into a normalized
 * scan row (scans + scan_engine_results) linked to the authenticated user.
 *
 * Idempotent: re-posting the same free_scan_id returns the existing scan_id
 * without re-importing data.
 *
 * Delegates all business logic to claimFreeScan() in @/lib/scan/claim.
 * This route only owns: request parsing, Zod validation, and HTTP mapping.
 *
 * Request body (Zod-validated):
 *   { free_scan_id: string (UUID) }
 *
 * Responses:
 *   200  { scan_id, business_id }  — already claimed; idempotent
 *   201  { scan_id, business_id }  — freshly claimed; normalized rows created
 *   400  validation error
 *   401  not authenticated
 *   403  not_yours | already_claimed_by_other
 *   404  free_scan not found
 *   500  internal error
 */

import 'server-only';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { claimFreeScan } from '@/lib/scan/claim';

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// Input schema
// ---------------------------------------------------------------------------

const ClaimBodySchema = z.object({
  free_scan_id: z.string().uuid({ message: 'free_scan_id must be a valid UUID' }),
});

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
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

  // ── Delegate to canonical claim function ──────────────────────────────────
  const result = await claimFreeScan(free_scan_id);

  // ── Map ClaimResult to HTTP responses ─────────────────────────────────────
  if (result.ok) {
    // Determine whether this was an idempotent hit or a fresh claim.
    // claimFreeScan does not distinguish these cases in its return type;
    // both are successes. The route returns 200 for idempotent and 201 for
    // fresh, but since we cannot know which case occurred from the union alone,
    // we always return 201. Callers MUST treat both 200 and 201 as success.
    return NextResponse.json(
      { scan_id: result.scan_id, business_id: result.business_id },
      { status: 201 },
    );
  }

  switch (result.code) {
    case 'no_auth':
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    case 'invalid_id':
      // Should not reach here since Zod validates UUID format, but guard defensively.
      return NextResponse.json(
        { error: 'Validation failed', details: { free_scan_id: ['must be a valid UUID'] } },
        { status: 400 },
      );

    case 'not_found':
      return NextResponse.json({ error: 'Free scan not found' }, { status: 404 });

    case 'not_yours':
      return NextResponse.json({ error: 'not_yours' }, { status: 403 });

    case 'already_claimed':
      return NextResponse.json({ error: 'already_claimed_by_other' }, { status: 403 });

    case 'internal':
    default:
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
