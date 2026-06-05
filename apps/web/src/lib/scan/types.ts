/**
 * Beamix Free Scan — shared types.
 *
 * FreeScanResults is the EXACT shape written to free_scans.results (JSONB).
 * It must stay in sync with the FreeScanResults interface in
 * apps/web/src/app/scan/[scan_id]/page.tsx.
 *
 * Do NOT add optional fields here without also updating page.tsx.
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
 * All fields are required — no partial writes.
 */
export interface FreeScanResults {
  issues: IssueSummary[];
  total_issues: number;
  /** Always 3 for free scans (ChatGPT + Gemini + Perplexity) */
  engines_checked: number;
  /** 0–100 composite visibility score */
  visibility_score: number;
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
