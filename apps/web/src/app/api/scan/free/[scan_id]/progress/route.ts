/**
 * GET /api/scan/free/[scan_id]/progress
 *
 * Polling fallback for browsers that cannot maintain a Supabase Realtime
 * WebSocket connection (aggressive ad-blockers, corporate firewalls, etc.).
 * The frontend uses this endpoint when the Realtime subscription fails.
 *
 * ── RATE LIMIT ───────────────────────────────────────────────────────────────
 * In-memory token bucket: burst capacity 4, refill rate 4 per second, per IP.
 * This is a best-effort guard suitable for the polling pattern — the bucket
 * is not shared across serverless instances (Vercel runs multiple). For a
 * distributed guard, use the Supabase-backed checkRateLimit in rate-limit.ts.
 * Polling at ~1 req/s per browser tab is well within the burst budget.
 * Returns 429 with Retry-After: 1 when over budget.
 *
 * ── PII GUARANTEE ────────────────────────────────────────────────────────────
 * The response is sourced exclusively from `scan_progress`, which is PII-free.
 * No email, IP address, business name, website URL, or domain is returned.
 * The scan_id path param is an unguessable v4 UUID capability token — the
 * client already holds it from the POST /api/scan/free response.
 *
 * ── NOT FOUND HANDLING ───────────────────────────────────────────────────────
 * If no scan_progress row exists yet (scan was just submitted), we return 200
 * with a seeded queued ScanProgress rather than 404. This avoids a brief
 * flicker of error states in the UI during the Inngest cold-start window
 * (typically < 500 ms).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { extractIp } from '@/lib/security/rate-limit';
import type { ScanProgress, EngineProgress } from '@/lib/scan/progress';
import { DEFAULT_ENGINE_PROGRESS } from '@/lib/scan/progress';

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// Admin Supabase client (service-role — reads scan_progress which anon can
// read via RLS, but service-role is used here for consistency with other
// scan routes and to avoid any anon JWT overhead)
// ---------------------------------------------------------------------------

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

// ---------------------------------------------------------------------------
// In-memory token bucket rate limiter
//
// Burst: 4 tokens  — allows a quick burst of requests on page load
// Refill: 4/s      — steady polling at 1 req/s stays well within budget
//
// NOTE: this is per-process, not distributed. On Vercel Edge/Serverless,
// multiple instances run concurrently. The bucket provides a best-effort
// guard against runaway polling from a single browser tab.
// ---------------------------------------------------------------------------

interface TokenBucket {
  tokens: number;
  lastRefill: number; // ms timestamp
}

const BURST_CAPACITY = 4;
const REFILL_RATE = 4; // tokens per second

const buckets = new Map<string, TokenBucket>();

function consumeToken(ip: string): boolean {
  const now = Date.now();
  let bucket = buckets.get(ip);

  if (!bucket) {
    bucket = { tokens: BURST_CAPACITY, lastRefill: now };
    buckets.set(ip, bucket);
  }

  // Refill based on elapsed time
  const elapsed = (now - bucket.lastRefill) / 1000; // seconds
  bucket.tokens = Math.min(BURST_CAPACITY, bucket.tokens + elapsed * REFILL_RATE);
  bucket.lastRefill = now;

  if (bucket.tokens < 1) {
    return false; // over budget
  }

  bucket.tokens -= 1;
  return true;
}

// ---------------------------------------------------------------------------
// Seeded default when no row exists yet
// ---------------------------------------------------------------------------

function seededQueuedProgress(): ScanProgress {
  return {
    engines: DEFAULT_ENGINE_PROGRESS,
    progress: 0,
    currentQuery: null,
    done: false,
    status: 'queued',
    updated_at: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// DB row → ScanProgress mapping
// ---------------------------------------------------------------------------

interface ProgressRow {
  engines: unknown;
  progress: number | string;
  current_query: string | null;
  done: boolean;
  status: string;
  updated_at: string;
}

function rowToScanProgress(row: ProgressRow): ScanProgress {
  return {
    engines: Array.isArray(row.engines)
      ? (row.engines as EngineProgress[])
      : DEFAULT_ENGINE_PROGRESS,
    progress: typeof row.progress === 'string' ? parseFloat(row.progress) : row.progress,
    currentQuery: row.current_query,
    done: row.done,
    status: row.status as ScanProgress['status'],
    updated_at: row.updated_at,
  };
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ scan_id: string }> },
): Promise<NextResponse> {
  const ip = extractIp(request);

  // Rate-limit check
  if (!consumeToken(ip)) {
    return NextResponse.json(
      { error: 'rate_limited', message: 'Too many requests — slow down polling' },
      {
        status: 429,
        headers: { 'Retry-After': '1' },
      },
    );
  }

  const { scan_id } = await params;

  // Basic UUID format guard — prevents DB lookups on obviously invalid inputs
  const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(scan_id)) {
    return NextResponse.json(
      { error: 'invalid_scan_id', message: 'scan_id must be a valid v4 UUID' },
      { status: 400 },
    );
  }

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('scan_progress')
      .select('engines, progress, current_query, done, status, updated_at')
      .eq('scan_id', scan_id)
      .maybeSingle();

    if (error) {
      console.error('[scan/progress] DB read failed', {
        scan_id,
        error: error.message,
      });
      return NextResponse.json({ error: 'db_error' }, { status: 500 });
    }

    // No row yet — scan was just submitted, Inngest hasn't started yet.
    // Return a seeded queued state rather than 404.
    if (!data) {
      return NextResponse.json(seededQueuedProgress(), {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    const progress = rowToScanProgress(data as ProgressRow);

    return NextResponse.json(progress, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    console.error('[scan/progress] Unexpected error', {
      scan_id,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
