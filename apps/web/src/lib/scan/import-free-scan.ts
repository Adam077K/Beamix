/**
 * import-free-scan.ts — pure projection of a free_scans row into normalized tables.
 *
 * Projects free_scans.results JSONB into:
 *   - One `scans` row  (status='complete', source_free_scan_id, business_id, completed_at)
 *   - Three `scan_engine_results` rows (one per engine: chatgpt, gemini, perplexity)
 *
 * Two input paths:
 *   v2: results.scan_v2 present — project per-engine data from engine_subscores
 *   v1: legacy results blob — emit a lossy fallback row per engine (is_mentioned=false)
 *
 * Invariants:
 *   - Never throws. Returns null on unrecoverable error.
 *   - Zod-parses scan_v2 for safety; falls back to v1 lossy path on parse failure.
 *   - The caller (claim route) owns all DB writes; this function is pure projection.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Output types — the normalized rows the caller will INSERT
// ---------------------------------------------------------------------------

export interface ScansInsertData {
  /** uuid — the caller provides a pre-generated ID */
  id: string;
  business_id: string;
  scan_type: 'free';
  /** MUST be 'complete' for imported free scans */
  status: 'complete';
  source_free_scan_id: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface ScanEngineResultInsertData {
  scan_id: string;
  business_id: string;
  engine: 'chatgpt' | 'gemini' | 'perplexity';
  is_mentioned: boolean;
  rank_position: number | null;
  sentiment: string | null;
  citations: string[];
}

export interface ImportFreeScanResult {
  scan: ScansInsertData;
  engineResults: ScanEngineResultInsertData[];
}

// ---------------------------------------------------------------------------
// Zod schemas for scan_v2 projection (defensive — never trust JSONB directly)
// ---------------------------------------------------------------------------

const FREE_SCAN_ENGINES = ['chatgpt', 'gemini', 'perplexity'] as const;
type FreeScanEngine = (typeof FREE_SCAN_ENGINES)[number];

/**
 * Minimal projection of one engine_subscores entry.
 * Only the fields we need for scan_engine_results are extracted.
 */
const EngineSubscoreMinimalSchema = z.object({
  engine: z.enum(FREE_SCAN_ENGINES),
  /**
   * point: the visibility score 0–100.
   * Not written to scan_engine_results but used for is_mentioned heuristic.
   */
  point: z.number().optional(),
  /**
   * probes: per-probe observations. We pull is_mentioned + rank_position
   * + sentiment + citations from the first probe that has them.
   */
  probes: z
    .array(
      z.object({
        is_mentioned: z.boolean().optional(),
        rank_position: z.number().nullable().optional(),
        sentiment: z.enum(['positive', 'neutral', 'negative']).nullable().optional(),
        citations: z.array(z.string()).optional(),
      }),
    )
    .optional(),
});

/**
 * Minimal projection of the scan_v2 blob.
 * Only engine_subscores is required; everything else is optional for resilience.
 */
const ScanV2MinimalSchema = z.object({
  engine_subscores: z.array(EngineSubscoreMinimalSchema),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Derive per-engine row fields from a single engine_subscores entry.
 * Reads the first probe's observations as the representative result.
 */
function deriveFromSubscore(subscoreRaw: z.infer<typeof EngineSubscoreMinimalSchema>): {
  is_mentioned: boolean;
  rank_position: number | null;
  sentiment: string | null;
  citations: string[];
} {
  const probe = subscoreRaw.probes?.[0];
  if (!probe) {
    // No probe data — fall back to not-mentioned
    return { is_mentioned: false, rank_position: null, sentiment: null, citations: [] };
  }

  return {
    is_mentioned: probe.is_mentioned ?? false,
    rank_position: probe.rank_position ?? null,
    sentiment: probe.sentiment ?? null,
    citations: probe.citations ?? [],
  };
}

/**
 * Build a lossy fallback row for one engine when v2 data is unavailable
 * or v1 legacy results are used.
 */
function buildLossyEngineRow(
  engine: FreeScanEngine,
  scan_id: string,
  business_id: string,
): ScanEngineResultInsertData {
  return {
    scan_id,
    business_id,
    engine,
    is_mentioned: false,
    rank_position: null,
    sentiment: null,
    citations: [],
  };
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Input: the raw free_scans row (only the fields we need).
 */
export interface FreeScanRowProjectionInput {
  /** The free_scans.id (UUID) */
  free_scan_id: string;
  /** Pre-generated UUID for the new scans row */
  new_scan_id: string;
  /** Target businesses.id */
  business_id: string;
  /** free_scans.results JSONB — may be null or legacy v1 shape */
  results: unknown;
  /** free_scans.started_at */
  started_at: string | null;
  /** free_scans.completed_at */
  completed_at: string | null;
}

/**
 * Project a free_scans row into normalized scans + scan_engine_results data.
 *
 * Never throws. Returns null only if business_id is missing (caller contract error).
 *
 * Path selection:
 *   1. results.scan_v2 present + Zod-parseable → project per-engine from engine_subscores
 *   2. Otherwise (v1 legacy, null, or parse failure) → lossy fallback (3 rows, is_mentioned=false)
 */
export function projectFreeScanToNormalized(
  input: FreeScanRowProjectionInput,
): ImportFreeScanResult {
  const { free_scan_id, new_scan_id, business_id, results, started_at, completed_at } = input;

  const scan: ScansInsertData = {
    id: new_scan_id,
    business_id,
    scan_type: 'free',
    status: 'complete',
    source_free_scan_id: free_scan_id,
    started_at: started_at ?? null,
    completed_at: completed_at ?? null,
  };

  // ── Try v2 path ─────────────────────────────────────────────────────────────
  const engineResults = tryProjectV2(new_scan_id, business_id, results);
  if (engineResults !== null) {
    return { scan, engineResults };
  }

  // ── Lossy v1 fallback ────────────────────────────────────────────────────────
  const lossyRows: ScanEngineResultInsertData[] = FREE_SCAN_ENGINES.map((engine) =>
    buildLossyEngineRow(engine, new_scan_id, business_id),
  );

  return { scan, engineResults: lossyRows };
}

/**
 * Attempt to project engine results from scan_v2.
 * Returns null on any failure (caller falls back to lossy path).
 */
function tryProjectV2(
  scan_id: string,
  business_id: string,
  results: unknown,
): ScanEngineResultInsertData[] | null {
  try {
    if (!results || typeof results !== 'object') return null;

    // Check scan_v2 is present in the results blob
    const resultsObj = results as Record<string, unknown>;
    if (!resultsObj['scan_v2']) return null;

    const parsed = ScanV2MinimalSchema.safeParse(resultsObj['scan_v2']);
    if (!parsed.success) {
      console.error('[import-free-scan] scan_v2 Zod parse failed — using lossy fallback', {
        scan_id,
        error: parsed.error.message,
      });
      return null;
    }

    const { engine_subscores } = parsed.data;

    // Build a map for quick lookup; handle duplicate engine entries gracefully
    const scoreMap = new Map<FreeScanEngine, z.infer<typeof EngineSubscoreMinimalSchema>>();
    for (const subscoreRaw of engine_subscores) {
      if (!scoreMap.has(subscoreRaw.engine)) {
        scoreMap.set(subscoreRaw.engine, subscoreRaw);
      }
    }

    const rows: ScanEngineResultInsertData[] = FREE_SCAN_ENGINES.map((engine) => {
      const subscoreRaw = scoreMap.get(engine);
      if (!subscoreRaw) {
        // Engine not present in scan_v2 — emit lossy row
        return buildLossyEngineRow(engine, scan_id, business_id);
      }

      const derived = deriveFromSubscore(subscoreRaw);
      return {
        scan_id,
        business_id,
        engine,
        ...derived,
      };
    });

    return rows;
  } catch (err) {
    console.error('[import-free-scan] Unexpected error during v2 projection', {
      scan_id,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}
