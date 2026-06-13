/**
 * Tests for POST /api/scan/claim
 *
 * The route delegates all business logic to claimFreeScan() in @/lib/scan/claim.
 * This test suite covers the HTTP mapping layer only (Zod validation + status codes).
 *
 * @/lib/scan/claim is mocked — canonical logic is tested in lib/scan/claim.test.ts.
 *
 * Scenarios:
 *   1.  400 — invalid free_scan_id (not a UUID) — caught by Zod before delegation
 *   2.  400 — missing free_scan_id
 *   3.  400 — invalid JSON body
 *   4.  401 — claimFreeScan returns no_auth
 *   5.  403 — claimFreeScan returns not_yours → { error: 'not_yours' }
 *   6.  403 — claimFreeScan returns already_claimed → { error: 'already_claimed_by_other' }
 *   7.  404 — claimFreeScan returns not_found
 *   8.  500 — claimFreeScan returns internal
 *   9.  201 — claimFreeScan returns ok:true → { scan_id, business_id }
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Hoist mock factory
// ---------------------------------------------------------------------------

const { mockClaimFreeScan } = vi.hoisted(() => ({
  mockClaimFreeScan: vi.fn(),
}));

vi.mock('@/lib/scan/claim', () => ({
  claimFreeScan: mockClaimFreeScan,
}));

import { POST } from './route';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FREE_SCAN_ID = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
const SCAN_ID = 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';
const BUSINESS_ID = 'cccccccc-cccc-4ccc-cccc-cccccccccccc';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/scan/claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function makeInvalidJsonRequest(): NextRequest {
  return new NextRequest('http://localhost/api/scan/claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: 'not json {{{',
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/scan/claim', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Input validation (before delegation) ────────────────────────────────

  it('returns 400 for invalid free_scan_id (not a UUID)', async () => {
    const res = await POST(makeRequest({ free_scan_id: 'not-a-uuid' }));
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('Validation failed');
    expect(mockClaimFreeScan).not.toHaveBeenCalled();
  });

  it('returns 400 for missing free_scan_id', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    expect(mockClaimFreeScan).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid JSON body', async () => {
    const res = await POST(makeInvalidJsonRequest());
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('Invalid JSON body');
    expect(mockClaimFreeScan).not.toHaveBeenCalled();
  });

  // ─── ClaimResult → HTTP mapping ───────────────────────────────────────────

  it('returns 401 when claimFreeScan returns no_auth', async () => {
    mockClaimFreeScan.mockResolvedValue({ ok: false, code: 'no_auth' });
    const res = await POST(makeRequest({ free_scan_id: FREE_SCAN_ID }));
    expect(res.status).toBe(401);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('Not authenticated');
  });

  it('returns 403 not_yours when claimFreeScan returns not_yours', async () => {
    mockClaimFreeScan.mockResolvedValue({ ok: false, code: 'not_yours' });
    const res = await POST(makeRequest({ free_scan_id: FREE_SCAN_ID }));
    expect(res.status).toBe(403);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('not_yours');
  });

  it('returns 403 already_claimed_by_other when claimFreeScan returns already_claimed', async () => {
    mockClaimFreeScan.mockResolvedValue({ ok: false, code: 'already_claimed' });
    const res = await POST(makeRequest({ free_scan_id: FREE_SCAN_ID }));
    expect(res.status).toBe(403);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('already_claimed_by_other');
  });

  it('returns 404 when claimFreeScan returns not_found', async () => {
    mockClaimFreeScan.mockResolvedValue({ ok: false, code: 'not_found' });
    const res = await POST(makeRequest({ free_scan_id: FREE_SCAN_ID }));
    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('Free scan not found');
  });

  it('returns 500 when claimFreeScan returns internal', async () => {
    mockClaimFreeScan.mockResolvedValue({ ok: false, code: 'internal' });
    const res = await POST(makeRequest({ free_scan_id: FREE_SCAN_ID }));
    expect(res.status).toBe(500);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('Internal server error');
  });

  // ─── Success ─────────────────────────────────────────────────────────────

  it('returns 201 with scan_id and business_id on success', async () => {
    mockClaimFreeScan.mockResolvedValue({
      ok: true,
      scan_id: SCAN_ID,
      business_id: BUSINESS_ID,
    });

    const res = await POST(makeRequest({ free_scan_id: FREE_SCAN_ID }));
    expect(res.status).toBe(201);
    const body = await res.json() as { scan_id: string; business_id: string };
    expect(body.scan_id).toBe(SCAN_ID);
    expect(body.business_id).toBe(BUSINESS_ID);
  });

  it('passes free_scan_id to claimFreeScan', async () => {
    mockClaimFreeScan.mockResolvedValue({
      ok: true,
      scan_id: SCAN_ID,
      business_id: BUSINESS_ID,
    });

    await POST(makeRequest({ free_scan_id: FREE_SCAN_ID }));
    expect(mockClaimFreeScan).toHaveBeenCalledWith(FREE_SCAN_ID);
  });
});
