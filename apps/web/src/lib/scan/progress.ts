/**
 * Beamix — Free-scan live progress seam
 *
 * This is the SINGLE contract between the scan backend (Inngest function +
 * progress-writer) and the scan frontend (polling fallback + future Realtime
 * subscription).
 *
 * ── FIELD ADAPTER NOTE ───────────────────────────────────────────────────────
 * scan-contract.ts (the existing mock seam) uses `EngineState.queryCount` and
 * `EngineState.totalQueries`. This file matches those names exactly.
 *
 * ScanEvent (scan-contract.ts) bundles a single engine transition + all engines
 * snapshot + progress + currentQuery + done. ScanProgress (this file) is the
 * DB row shape — it flattens the same fields into a single row so Realtime
 * can push one row-level POSTGRES_CHANGES event per update. When the frontend
 * subscribes to Realtime it maps a ScanProgress row to a ScanEvent stream by
 * emitting one ScanEvent for the engine that changed since the previous row.
 *
 * Mapping (row → ScanEvent):
 *   row.engines[i]           → ScanEvent.engine (the changed engine)
 *   row.engines              → ScanEvent.engines (EngineProgress → EngineState with label)
 *   row.progress             → ScanEvent.progress
 *   row.current_query        → ScanEvent.currentQuery
 *   row.done                 → ScanEvent.done
 *
 * REALTIME_CHANNEL is the channel key used by both backend (Realtime triggers
 * on POSTGRES_CHANGES) and frontend (subscribe to the same table/filter).
 */

// ── Engine types (mirror scan-contract.ts names exactly) ──────────────────

export type EngineStatus = 'queued' | 'querying' | 'done' | 'error';
export type EngineId = 'chatgpt' | 'gemini' | 'perplexity';

/** Per-engine live progress — maps 1:1 to EngineState in scan-contract.ts. */
export interface EngineProgress {
  id: EngineId;
  /** Matches EngineState.status in scan-contract.ts. */
  status: EngineStatus;
  /** Live query count, increments while querying. Maps to EngineState.queryCount. */
  queryCount: number;
  /** Final query count when done. Maps to EngineState.totalQueries. */
  totalQueries: number;
}

/**
 * Aggregate scan progress — the shape stored in the `scan_progress` DB row
 * and returned by the polling fallback endpoint.
 *
 * All fields are PII-free by construction. The table holds NO email, IP, or
 * domain. The only identifier is scan_id (an unguessable v4 UUID).
 */
export interface ScanProgress {
  /** Per-engine progress array. Maps to ScanEvent.engines. */
  engines: EngineProgress[];
  /** 0..1 overall completion. Maps to ScanEvent.progress. */
  progress: number;
  /** Currently-running query string, null when between engines. Maps to ScanEvent.currentQuery. */
  currentQuery: string | null;
  /** True only after all engines resolve (success or error). Maps to ScanEvent.done. */
  done: boolean;
  /** Overall scan lifecycle status. */
  status: 'queued' | 'running' | 'complete' | 'failed';
  /** ISO timestamp of last progress write. */
  updated_at: string;
}

/** Channel key for Supabase Realtime subscription (POSTGRES_CHANGES on scan_progress). */
export const REALTIME_CHANNEL = (scanId: string): string =>
  `scan_progress:${scanId}`;

/** Default engine progress array — three engines all queued, zero queries run. */
export const DEFAULT_ENGINE_PROGRESS: EngineProgress[] = [
  { id: 'chatgpt', status: 'queued', queryCount: 0, totalQueries: 0 },
  { id: 'gemini', status: 'queued', queryCount: 0, totalQueries: 0 },
  { id: 'perplexity', status: 'queued', queryCount: 0, totalQueries: 0 },
];
