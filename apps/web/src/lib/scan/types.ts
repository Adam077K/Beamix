/**
 * Beamix Free Scan — shared types.
 *
 * FreeScanResults is the EXACT shape written to free_scans.results (JSONB).
 * It must stay in sync with the FreeScanResults interface in
 * apps/web/src/app/scan/[scan_id]/page.tsx.
 *
 * Wave 7 additive extension: scan_v2 is an optional field added to carry the
 * structured v2 measurement result. All existing fields are preserved for
 * backward-compatibility with the existing scan results page (Worker 3 updates
 * page.tsx to read scan_v2 when present). The visibility_score field continues
 * to be populated from scan_v2.headline_band.point (the median across engines,
 * labeled as secondary) for the existing score ring.
 *
 * Keep in sync: when adding fields here, also update
 *   apps/web/src/app/scan/[scan_id]/page.tsx
 *   (note from the original file — Worker 3 handles the page update).
 */

// ---------------------------------------------------------------------------
// Output contract — written to free_scans.results
// ---------------------------------------------------------------------------

export interface IssueSummary {
  /** Human-readable category label, e.g. "Missing from AI answers" */
  category: string;
  /** Number of issues in this category */
  count: number;
}

/**
 * Shape persisted to free_scans.results JSONB.
 *
 * Wave 7 ADDITIVE extension:
 *   scan_v2 — optional v2 measurement result from assembleFreeScanV2().
 *             When present, Worker 3 (frontend) reads it for the richer view.
 *             When absent, the UI falls back to the v1 issues/visibility_score
 *             fields (backward-compat — legacy scan results stay readable).
 *
 *   visibility_score — ALWAYS populated, even for v2 scans:
 *             v1:  set by the old scoring logic (Gemini Flash analysis).
 *             v2:  set to scan_v2.headline_band.point (median across engines,
 *                  labeled secondary) for the existing score ring on the page.
 *             Worker 3 must NOT replace this field with a per-engine subscore
 *             without also updating the ring component that reads it.
 *
 * All REQUIRED fields (issues, total_issues, engines_checked, visibility_score)
 * must still be written for every scan — partial writes are not allowed.
 */
export interface FreeScanResults {
  issues: IssueSummary[];
  total_issues: number;
  /** Always 3 for free scans (ChatGPT + Gemini + Perplexity) */
  engines_checked: number;
  /**
   * 0–100 composite visibility score.
   * v2 scans: populated from ScanV2Result.headline_band.point (the median
   * across engines, a clearly-labeled secondary value). The existing score
   * ring on the page reads this field — keep it populated for backward-compat.
   */
  visibility_score: number;
  /**
   * ADDITIVE (Wave 7): optional v2 measurement result.
   * Present for scans run through assembleFreeScanV2(). Absent for legacy scans.
   * Worker 3 reads this for the richer per-engine subscore + gap-list view.
   *
   * Type: ScanV2Result from scan-v2-types.ts. Declared as unknown here to avoid
   * a circular import chain (types.ts is imported by modules that scan-v2-types.ts
   * itself imports). Worker 3 imports ScanV2Result directly from scan-v2-types.ts
   * and casts/validates at the read site.
   *
   * IMPORTANT: Do not add optional fields here without also updating page.tsx
   * (original note preserved — Worker 3 handles that update).
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  scan_v2?: any;
}

// ---------------------------------------------------------------------------
// Internal pipeline types
// ---------------------------------------------------------------------------

/**
 * Structured business context returned by Stage 1 (Perplexity research).
 * Used as enriched input for Stage 2 engine queries.
 */
export interface BusinessContext {
  business_name: string;
  website_url: string;
  business_summary: string;
  key_services: string[];
  target_audience: string;
  /** Inferred category/vertical, e.g. "dental clinic" */
  category: string;
  /** Inferred primary location, e.g. "Tel Aviv" or "New York" */
  location: string;
}

/**
 * Raw result from a single AI engine query (Stage 2).
 * Stored for analysis — not written to the DB directly for free scans
 * (free scans write only the aggregated FreeScanResults JSONB).
 */
export interface EngineRawResult {
  engine: 'chatgpt' | 'gemini' | 'perplexity';
  is_mentioned: boolean;
  /** 1-based rank position, null if not mentioned */
  rank_position: number | null;
  /** null if not mentioned */
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  raw_response: string;
  /**
   * Whether this result came from a live web retrieval or from the model's
   * parametric (training-data) memory.
   * - 'live_web'          — model queried the web at request time (e.g. Perplexity Sonar,
   *                         or gpt-4o-mini via OpenRouter web_search plugin).
   * - 'parametric_memory' — model answered from training data only (no web grounding).
   */
  retrieval_mode: 'live_web' | 'parametric_memory';
  /**
   * Human-readable label for honest labeling on the results surface.
   * Set when the engine is a proxy or uses a non-production model, e.g.
   * 'proxy:gpt-4o-mini+web' when the ChatGPT slot is filled via the
   * web_search plugin rather than the production ChatGPT search product.
   */
  provider_note?: string;
  /**
   * Source URLs extracted from the model's citation annotations (Wave 2 consumer).
   * Populated additively when the underlying model returns grounding citations
   * (e.g. Perplexity native citations or OpenRouter annotation objects).
   * Wave 1 plumbs the field; downstream consumers are added in Wave 2.
   */
  citations?: string[];
  /**
   * Top competitors returned by the engine's recommendations[] array (Wave 2).
   * Parsed from the engine prompt's `recommendations` field — each entry was
   * already requested by buildEnginePrompt() but previously discarded.
   *
   * undefined  = parse was skipped or failed (no signal — do not treat as empty list)
   * []         = model returned an empty recommendations array explicitly
   */
  competitors?: { rank: number; name: string; why?: string }[];
}

/**
 * Analysis result from Stage 3 (Gemini Flash).
 * Mapped to FreeScanResults before persistence.
 */
export interface AnalysisResult {
  /** 0–100 composite visibility score */
  overall_score: number;
  issues: IssueSummary[];
  total_issues: number;
}

/** Minimal input needed by the scan pipeline (subset of the Inngest event payload). */
export interface ScanInput {
  scan_id: string;
  business_name: string;
  website_url: string;
  domain: string;
}

// ---------------------------------------------------------------------------
// Site audit — structured observation (additive, log-only, no scoring/UI/DB)
// ---------------------------------------------------------------------------

/**
 * Structured result of a site audit run against a target URL.
 *
 * FM-5 GUARD: robotsTxt.fetchStatus='unavailable' means the fetch did not return
 * a clean HTTP 200 — network error, timeout, 4xx, 5xx. In this case the crawlers
 * map is OMITTED. Never infer "blocked" from the absence of a robots.txt response.
 */
export type SiteAudit = {
  /** The target URL that was audited. */
  url: string;
  /** ISO 8601 timestamp of when the audit was performed. */
  fetchedAt: string;
  /** HTML page metadata parsed from the target URL. */
  page: {
    fetchStatus: 'ok' | 'unavailable';
    title?: string;
    metaDescription?: string;
    h1Count?: number;
    h2Count?: number;
    h3Count?: number;
    wordCount?: number;
    /** @type values found in JSON-LD scripts, e.g. ["LocalBusiness", "Organization"] */
    jsonLdTypes?: string[];
    /**
     * Most recent content freshness date found on the page, as an ISO 8601 string.
     * Sources checked (in preference order):
     *   1. JSON-LD dateModified (preferred) or datePublished on any node
     *   2. <meta property="article:modified_time">
     *   3. <meta itemprop="dateModified">
     * Omitted when no valid date is found or page is unavailable.
     */
    dateModified?: string;
  };
  /**
   * robots.txt status and per-crawler permissions.
   *
   * When fetchStatus='unavailable', the crawlers map is absent — we have no data.
   * When fetchStatus='ok', crawlers is present for all checked AI crawlers.
   */
  robotsTxt:
    | { fetchStatus: 'unavailable' }
    | { fetchStatus: 'ok'; crawlers: Record<string, 'allowed' | 'disallowed'> };
  /** Whether /sitemap.xml was present (HTTP 200). */
  sitemapXml: { present: boolean };
  /** Whether /llms.txt was present (HTTP 200). */
  llmsTxt: { present: boolean };
};
