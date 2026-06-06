/**
 * Beamix — scan_progress writer
 *
 * Writes per-engine scan progress to the `scan_progress` table so anonymous
 * browsers can subscribe via Supabase Realtime (or poll the fallback endpoint).
 *
 * ── PII CONTRACT ─────────────────────────────────────────────────────────────
 * This module ONLY writes to `scan_progress`. It NEVER references `free_scans`
 * columns that contain PII (email, ip, business_name, website_url, domain).
 * The only identifier written is `scan_id`, which is a v4 UUID capability token.
 *
 * ── BEST-EFFORT WRITES ───────────────────────────────────────────────────────
 * Progress writes are best-effort. If a write fails, the scan continues — the
 * worst outcome is a stale progress indicator for the user. Every error is
 * logged via console.error with a structured payload; the caller never sees an
 * exception from this module.
 *
 * ── STATUS REGRESSION GUARD ──────────────────────────────────────────────────
 * An engine already in 'done' or 'error' state MUST NOT revert to 'querying'
 * or 'queued'. This guard protects against Inngest step replays where an engine
 * step is re-entered after a prior retry already marked it done.
 */

import { createClient } from '@supabase/supabase-js';
import type { EngineProgress, ScanProgress } from './progress';
import { DEFAULT_ENGINE_PROGRESS } from './progress';

// ---------------------------------------------------------------------------
// Admin client — mirrors the pattern in scan-free.ts
// ---------------------------------------------------------------------------

function createAdminSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

// ---------------------------------------------------------------------------
// Status regression guard
// ---------------------------------------------------------------------------

/** Terminal engine statuses — once reached, an engine must not regress. */
const TERMINAL_ENGINE_STATUSES = new Set<EngineProgress['status']>(['done', 'error']);

/**
 * Merges `next` engine state into `existing` engine state.
 * If `existing` is already in a terminal state ('done' | 'error'), the merge
 * is a no-op for that engine — the existing terminal value is preserved.
 */
function mergeEngine(existing: EngineProgress, next: EngineProgress): EngineProgress {
  if (TERMINAL_ENGINE_STATUSES.has(existing.status)) {
    // Regression guard: terminal status must not revert.
    return existing;
  }
  return { ...existing, ...next };
}

/**
 * Deep-merges incoming engine array into the existing engine array.
 * Matching is by engine id. Engines not in `incoming` are left unchanged.
 * Seeded defaults ensure all three engines are always present.
 */
function mergeEngines(
  existing: EngineProgress[],
  incoming: Partial<EngineProgress>[],
): EngineProgress[] {
  // Start from existing (or seeded defaults if empty)
  const base: EngineProgress[] =
    existing.length > 0 ? existing : [...DEFAULT_ENGINE_PROGRESS];

  const result = base.map((e) => {
    const update = incoming.find((u) => u.id === e.id);
    if (!update) return e;
    // Cast is safe: update.id matches e.id so EngineProgress shape is complete
    return mergeEngine(e, { ...e, ...update } as EngineProgress);
  });

  return result;
}

// ---------------------------------------------------------------------------
// Partial write shape — callers need only supply what changed
// ---------------------------------------------------------------------------

export interface ProgressUpdate {
  /** Engine updates — only supply engines with changed state. */
  engines?: Partial<EngineProgress>[];
  /** 0..1 overall progress. Omit to leave unchanged. */
  progress?: number;
  /** Currently-running query string. Pass null to clear. Omit to leave unchanged. */
  currentQuery?: string | null;
  /** True on terminal event (all engines resolved). */
  done?: boolean;
  /** Overall scan lifecycle status. */
  status?: ScanProgress['status'];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Upsert progress for a scan into `scan_progress`.
 *
 * - UPSERT on conflict (scan_id): INSERT on first call, UPDATE on subsequent.
 * - Deep-merges engines by id; incoming state wins except for regression guard.
 * - Seeds default three-engine array on first call if no engines provided.
 * - Stamps updated_at = now().
 * - NEVER throws — all errors are caught and logged.
 *
 * @param scanId  The free scan's UUID (capability token, not PII).
 * @param next    Partial progress update — only supply changed fields.
 */
export async function writeProgress(scanId: string, next: ProgressUpdate): Promise<void> {
  try {
    const supabase = createAdminSupabaseClient();

    // Read current row to enable deep-merge of engines
    const { data: current, error: readError } = await supabase
      .from('scan_progress')
      .select('engines, progress, current_query, done, status')
      .eq('scan_id', scanId)
      .maybeSingle();

    if (readError) {
      console.error('[progress-writer] Failed to read current progress', {
        scan_id: scanId,
        error: readError.message,
      });
      // Continue with defaults — best-effort
    }

    // Determine base state (existing row or clean defaults)
    const existingEngines: EngineProgress[] =
      Array.isArray(current?.engines) ? (current.engines as EngineProgress[]) : [];

    const mergedEngines = mergeEngines(existingEngines, next.engines ?? []);

    // Build the upsert row — only include fields the caller provided
    const row: Record<string, unknown> = {
      scan_id: scanId,
      engines: mergedEngines,
      updated_at: new Date().toISOString(),
    };

    if (next.progress !== undefined) row['progress'] = next.progress;
    if ('currentQuery' in next) row['current_query'] = next.currentQuery;
    if (next.done !== undefined) row['done'] = next.done;
    if (next.status !== undefined) row['status'] = next.status;

    // If this is the first write, seed sensible defaults for fields not yet set
    if (!current) {
      if (row['progress'] === undefined) row['progress'] = 0;
      if (row['current_query'] === undefined) row['current_query'] = null;
      if (row['done'] === undefined) row['done'] = false;
      if (row['status'] === undefined) row['status'] = 'queued';
    }

    const { error: upsertError } = await supabase
      .from('scan_progress')
      .upsert(row, { onConflict: 'scan_id' });

    if (upsertError) {
      console.error('[progress-writer] Upsert failed', {
        scan_id: scanId,
        error: upsertError.message,
      });
    }
  } catch (err) {
    // Never throw — progress writes are best-effort.
    console.error('[progress-writer] Unexpected error', {
      scan_id: scanId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
