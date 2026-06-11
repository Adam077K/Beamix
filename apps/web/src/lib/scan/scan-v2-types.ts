/**
 * scan-v2-types.ts — Type definitions for the Wave 7 v2 scan result.
 *
 * DESIGN RULES:
 *   - Import base types from their canonical modules; do NOT redefine here.
 *   - ScanV2Result is the in-memory result returned by assembleFreeScanV2().
 *     It is NOT persisted directly — Worker 2 (Inngest) serializes it into
 *     free_scans.results as scan_v2 (optional field on FreeScanResults).
 *   - headline_band is LABELED as a secondary display value (median across engines).
 *     Per-engine subscores are the unit of truth (SCAN-MEASUREMENT-MODEL.md §9).
 *   - The `meta.degraded` flag is true when:
 *       (a) fewer than the engine success threshold (≥2/3) engines succeeded, OR
 *       (b) any sub-stage (competitor audit, narration) had to degrade gracefully.
 *
 * Backward-compatibility note (keep in sync with FreeScanResults in types.ts):
 *   FreeScanResults.visibility_score must still be populated from
 *   ScanV2Result.headline_band.point for the existing score ring on the
 *   free-scan results page. This is documented in assembleFreeScanV2.ts.
 *   Worker 3 (frontend) reads scan_v2 directly for the richer view.
 */

// Re-export base types used downstream so importers can get all v2 types from one import.
export type {
  EngineSubscore,
  Band,
  EngineProbeObservation,
  ClientIdentity,
  NeutralQuery,
} from './measurement-types';
export type { RankedGap, CompetitorFactorAudit, PlaybookAssignment } from './gap-types';
export type { NarrationResult } from './narration';

// ---------------------------------------------------------------------------
// ScanV2Result — the orchestrated result (in-memory only)
// ---------------------------------------------------------------------------

import type { EngineSubscore, Band } from './measurement-types';
import type { RankedGap, CompetitorFactorAudit, PlaybookAssignment } from './gap-types';
import type { NarrationResult } from './narration';

/**
 * The full v2 scan result assembled by assembleFreeScanV2().
 *
 * Fields:
 *
 * engine_subscores
 *   Per-engine Band + DimensionScores. ONE per engine — NEVER merged.
 *   These are the unit of truth (SCAN-MEASUREMENT-MODEL.md §9).
 *
 * headline_band
 *   LABELED secondary display value — the median across engine_subscores.point values.
 *   This is medianAcrossEngines(engine_subscores) expressed as a Band-shaped object.
 *   It is NOT a per-engine truth. It exists for the single-number headline display only.
 *   Never replace engine_subscores with this value.
 *   NOTE: it is stored as a plain Band shape for the headline ring; ci_low/ci_high
 *   are taken from the median engine's CI (the engine whose point is the median).
 *
 * gap_list
 *   Contrastive ranked gap list (output of buildContrastiveGapList).
 *   In impact_fallback mode when no competitor audits were available.
 *
 * playbooks
 *   Gap-to-playbook groupings (output of mapGapsToPlaybooks).
 *
 * competitors
 *   Competitor factor audits from auditCompetitors.
 *   May be empty when no competitor domains could be resolved or all audits failed.
 *
 * narration
 *   Evidence-bound narration result from narrate().
 *   degraded=true when narration fell back to the deterministic template.
 *
 * meta
 *   run_kind:      always 'free' for the free-scan orchestrator.
 *   generated_at:  ISO 8601 timestamp of when the scan was assembled.
 *   model_ids:     map of stage → model used (null if stage used code/no LLM).
 *                  Keys: 'sentiment', 'narration'. (probe uses no LLM directly.)
 *   degraded:      true when meta.degraded should be surfaced to the UI
 *                  (fewer than ≥2/3 engines succeeded, OR sub-stage degradation).
 */
export interface ScanV2Result {
  engine_subscores: EngineSubscore[];
  /**
   * SECONDARY labeled headline — median across engine subscores.
   * The entire Band object is from the median engine's Band (not a recomputed CI).
   * Label this as "Overall (median across engines)" in the UI — never "your score".
   */
  headline_band: Band;
  gap_list: RankedGap[];
  playbooks: PlaybookAssignment[];
  competitors: CompetitorFactorAudit[];
  narration: NarrationResult;
  meta: {
    run_kind: 'free';
    generated_at: string;
    /**
     * Model IDs used in each LLM stage.
     * null = stage used deterministic code (no LLM).
     */
    model_ids: {
      sentiment: string | null;
      narration: string | null;
    };
    /**
     * true when the scan completed in a degraded state:
     *   (a) fewer than ≥2/3 engines succeeded (threshold: 2 of 3), OR
     *   (b) competitor audit had failures, OR
     *   (c) narration degraded (fell back to template).
     */
    degraded: boolean;
  };
}

// ---------------------------------------------------------------------------
// AssembleFreeScanV2Input — input to the orchestrator
// ---------------------------------------------------------------------------

/**
 * Input to assembleFreeScanV2().
 *
 * identity   — Client identity tokens (business name, domain, aliases).
 *              Used for client detection and competitor exclusion.
 *              NEVER passed into probe prompts (structural firewall).
 *
 * ctx        — Business context (category, location, etc.) for query building.
 *
 * queries    — Neutral queries to probe. Minimum 1.
 *              The orchestrator probes each query × each engine.
 *              If only one query is provided, per-query results still compute
 *              correctly (low sample_n → low_confidence=true on the Band).
 *
 * engines    — Which engines to probe. All three for a full free scan.
 */
import type { ClientIdentity, NeutralQuery } from './measurement-types';
import type { BusinessContext } from './types';

export interface AssembleFreeScanV2Input {
  identity: ClientIdentity;
  ctx: BusinessContext;
  queries: NeutralQuery[];
  engines: Array<'chatgpt' | 'gemini' | 'perplexity'>;
}

// ---------------------------------------------------------------------------
// AssembleFreeScanV2Deps — fully injectable I/O
// ---------------------------------------------------------------------------

import type { SiteAudit } from './types';
import type { FactorObservation } from './factor-detection';
import type { FactorCatalogRow } from './factor-catalog';
import type { OpenRouterRequest, OpenRouterResponse } from './openrouter-client';

/**
 * All I/O injected into assembleFreeScanV2.
 *
 * Every external call is injectable so tests make ZERO network calls.
 * Worker 2 (Inngest scan function) supplies the real implementations.
 *
 * probe
 *   Sends one neutral probe to one engine. Receives the raw text response +
 *   optional citations and retrieval_mode indicator.
 *   Worker 2 supplies: the SSRF-safe OpenRouter call using OPENROUTER_SCAN_KEY.
 *
 * sentimentCall
 *   Optional override for the sentiment judge LLM call.
 *   Default: callOpenRouter from openrouter-client.ts.
 *   Override in tests with a stub.
 *
 * narrationCall
 *   Optional override for the narration LLM call.
 *   Default: callOpenRouter from openrouter-client.ts.
 *   Override in tests with a stub.
 *
 * auditSite
 *   Site audit function (SSRF-safe — Worker 2 supplies).
 *   Must never perform a real fetch in tests.
 *
 * detectFactors
 *   Factor detection function (from factor-detection.ts).
 *
 * loadCatalog
 *   Loads the factor catalog (once per scan). Returns FactorCatalogRow[].
 *   Worker 2 supplies: loadFactorCatalog(supabaseClient).
 *
 * resolveCompetitorDomain
 *   Given a competitor name, returns a URL/domain string or null.
 *   null = no URL available → competitor skipped in audit.
 *   Worker 2 may supply a simple heuristic or a Perplexity lookup.
 *
 * now
 *   Returns the current ISO 8601 timestamp. Override in tests for determinism.
 *   Default: () => new Date().toISOString()
 *
 * models
 *   Model ID overrides for each LLM stage. All optional.
 *   Used by Worker 2 to route paid-tier scans to better models.
 */
export interface AssembleFreeScanV2Deps {
  probe: (
    engine: 'chatgpt' | 'gemini' | 'perplexity',
    model: string,
    probe: { system: string; user: string },
  ) => Promise<{
    text: string;
    citations?: string[];
    retrieval_mode: 'live_web' | 'parametric_memory';
  }>;
  sentimentCall?: (req: OpenRouterRequest) => Promise<OpenRouterResponse>;
  narrationCall?: (req: OpenRouterRequest) => Promise<OpenRouterResponse>;
  auditSite: (url: string) => Promise<SiteAudit>;
  detectFactors: (input: {
    siteAudit: SiteAudit;
    businessContext?: BusinessContext;
    engineResults?: import('./types').EngineRawResult[];
  }) => Promise<FactorObservation[]>;
  loadCatalog: () => Promise<FactorCatalogRow[]>;
  resolveCompetitorDomain?: (name: string) => string | null;
  now?: () => string;
  models?: {
    sentiment?: string;
    narration?: string;
  };
}
