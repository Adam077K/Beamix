/**
 * Single source of truth for Wave 5 measurement types.
 * Shape/intent/run_kind literals mirror migration 20260608000002 CHECK constraints — keep in sync.
 *
 * Worker 2 (scoring layer) imports ALL types from this file.
 * Worker 1 (this file) declares types only — no scoring logic lives here.
 */

// ---------------------------------------------------------------------------
// Enum literals — must EXACTLY match migration 20260608000002 CHECK constraints
// ---------------------------------------------------------------------------

/**
 * The structural "intent category" of a probe query.
 * Mirrors: tracked_queries.intent_bucket CHECK constraint in migration 20260608000002.
 */
export type IntentBucket =
  | 'category_geo'
  | 'problem'
  | 'near_me'
  | 'branded'
  | 'comparison'
  | 'other';

/**
 * The kind of probe run that produced an observation row.
 * Mirrors: query_positions.run_kind CHECK constraint in migration 20260608000002.
 */
export type RunKind = 'daily_light' | 'weekly_deep' | 'free' | 'switchback';

/**
 * The structural shape of an engine's answer for a given probe.
 * 12 shapes — mirrors: scan_engine_results.shape CHECK constraint in migration 20260608000002.
 *
 * IMPORTANT: do NOT reorder or rename these literals without also updating the migration
 * CHECK constraint and the classifyShape() function in answer-shape.ts.
 */
export type AnswerShape =
  | 'ranked_listicle'
  | 'single_recommendation'
  | 'comparison'
  | 'negative_avoid'
  | 'cited_as_source'
  | 'passing_mention'
  | 'category_defining'
  | 'do_your_own_research'
  | 'tool_vs_service_vs_product'
  | 'local_pack'
  | 'navigational_branded'
  | 'no_answer';

/**
 * Whether the shape+detection combination is a win, partial, or loss for the business.
 * Mirrors: scan_engine_results.shape_outcome CHECK constraint in migration 20260608000002.
 *
 * IMPORTANT: outcome is an ANNOTATION only (sequencing lock §1 of SCAN-MEASUREMENT-MODEL.md).
 * It does NOT move the headline Band — it explains WHY a query is a win/partial/loss and
 * routes agency work. The headline is computed from presence/position only until shape/sentiment
 * each clear a gold-set validation.
 */
export type ShapeOutcome = 'win' | 'partial' | 'loss';

// ---------------------------------------------------------------------------
// Probe input — NO identity fields
// ---------------------------------------------------------------------------

/**
 * The ONLY input allowed into the probe builder (buildNeutralProbe).
 *
 * STRUCTURAL FIREWALL: NeutralQuery contains ZERO business-identity fields.
 * The ClientIdentity is a SEPARATE parameter used only by detection + leak-gate.
 * Never put ClientIdentity inside NeutralQuery — that would break the no-leak guarantee.
 *
 * This mirrors the SCAN-ORCHESTRATION.md §"The firewall is STRUCTURAL, not a convention".
 */
export interface NeutralQuery {
  /** The real-user query text, e.g. "best dental clinic in Tel Aviv" */
  query_text: string;
  /** Business category, e.g. "dental clinic" */
  category: string;
  /** Primary location, e.g. "Tel Aviv" or "global" */
  location: string;
  /** Intent classification of this query */
  intent_bucket: IntentBucket;
}

// ---------------------------------------------------------------------------
// Business identity — used ONLY by detection + leak-gate, never by probe builder
// ---------------------------------------------------------------------------

/**
 * Business identity tokens — used ONLY by:
 *   1. detectClient() in client-detection.ts
 *   2. checkProbeLeak() / assertProbeClean() in probe.ts (the lint-gate)
 *
 * NEVER passed to buildNeutralProbe(). Never nested inside NeutralQuery.
 */
export interface ClientIdentity {
  /** The registered business name, e.g. "Acme Dental" */
  business_name: string;
  /**
   * Full domain with protocol + optional www, e.g. "https://acme-dental.co.il" or "acme-dental.co.il".
   * The leak-gate also checks the bare registrable root (second-level label + TLD).
   */
  domain: string;
  /**
   * Additional name variants or abbreviations, e.g. ["Acme", "Acme Dental Tel Aviv"].
   * Aliases shorter than 3 characters are SKIPPED by both detection and leak-gate
   * to avoid false positives on common abbreviations. This is intentional and documented.
   */
  aliases: string[];
}

// ---------------------------------------------------------------------------
// Leak-gate result
// ---------------------------------------------------------------------------

/**
 * Result of checking whether a probe prompt leaks business identity.
 *
 * violations names the tokens that leaked, e.g.:
 *   "business_name"  — the business_name string was found
 *   "domain"         — the full domain was found
 *   "domain_root"    — the bare second-level label (e.g. "acme-dental") was found
 *   "alias:Foo"      — an alias named "Foo" was found
 */
export interface LeakCheckResult {
  ok: boolean;
  violations: string[];
}

// ---------------------------------------------------------------------------
// Detection output
// ---------------------------------------------------------------------------

/**
 * Per-engine, per-query detection of the client in the engine's raw response.
 * Computed entirely in code — no LLM involvement.
 *
 * HONESTY SPINE: when a field cannot be determined, it is null — never guessed.
 */
export interface ClientDetection {
  /** Whether the client is mentioned in the response (name / domain / alias match) */
  mentioned: boolean;
  /**
   * 1-based rank position when mentioned inside a numbered/ordered list.
   * null when: (a) not mentioned, OR (b) mentioned but not inside an enumerable list.
   * "Mentioned but unranked" is an honest and distinct state.
   */
  rank_position: number | null;
  /** The actual matched token (business_name, domain root, or alias value) */
  matched_text: string | null;
  /**
   * A ~200-char substring window centered on the first mention.
   * Preserved as evidence for Worker 2's sentiment judge (Haiku/Sonnet LLM call).
   * null when not mentioned.
   */
  mention_snippet: string | null;
}

// ---------------------------------------------------------------------------
// Competitor mention
// ---------------------------------------------------------------------------

/**
 * A named competitor that the engine surfaced in its response.
 * Extracted from ordered/bulleted list items, excluding the client.
 *
 * rank is the list-position rank where available (1-based), null when the engine
 * named the competitor outside a ranked list.
 */
export interface CompetitorMention {
  name: string;
  rank: number | null;
}

// ---------------------------------------------------------------------------
// Shape classification
// ---------------------------------------------------------------------------

/**
 * The answer-shape classification for a single engine response.
 * Both fields are computed deterministically in code (answer-shape.ts).
 *
 * ANNOTATION ONLY — see ShapeOutcome for the sequencing lock note.
 */
export interface ShapeClassification {
  shape: AnswerShape;
  outcome: ShapeOutcome;
}

// ---------------------------------------------------------------------------
// Per-engine observation row
// ---------------------------------------------------------------------------

/**
 * One observation row: the result of running one NeutralQuery against one engine.
 * This is the core unit Worker 2 aggregates into Bands, Profiles, and Gap-lists.
 *
 * Multiple observations per (business, engine, query) are expected — weekly-deep runs
 * N≥5 repetitions for Wilson CI computation.
 */
export interface EngineProbeObservation {
  engine: 'chatgpt' | 'gemini' | 'perplexity';
  retrieval_mode: 'live_web' | 'parametric_memory';
  /** The full raw engine response, preserved for narration evidence checks */
  raw_response: string;
  /** Client detection result (code-extracted, no LLM) */
  detection: ClientDetection;
  /** Named competitors the engine surfaced (code-extracted, no LLM) */
  competitors: CompetitorMention[];
  /** Shape annotation (code-classified, no LLM) */
  shape: ShapeClassification;
  /** Source citation URLs when the engine returned grounding citations */
  citations?: string[];
}

// ---------------------------------------------------------------------------
// Worker 2 type stubs — declared here so Worker 2 imports from one place
// ---------------------------------------------------------------------------

/**
 * Wilson score confidence interval for a proportion (presence rate).
 * Bounds are in [0, 1].
 *
 * Declared here for Worker 2 to implement against.
 * Logic lives in Worker 2's scoring module.
 */
export interface WilsonCI {
  low: number;
  high: number;
}

/**
 * A scored band: the headline presence/position range with a real confidence interval.
 * Shown as e.g. "27 (22–31)" — NEVER as a bare point.
 *
 * low_confidence is true when sample_n is below the threshold for reliable CI (Worker 2 sets the threshold).
 *
 * Declared here for Worker 2 to implement against.
 */
export interface Band {
  /** P50 point estimate (0–100 scale) */
  point: number;
  /** Wilson CI lower bound (0–100 scale) */
  ci_low: number;
  /** Wilson CI upper bound (0–100 scale) */
  ci_high: number;
  /** Number of independent observations this band is based on */
  sample_n: number;
  /**
   * true when sample_n is below a minimum threshold for a reliable CI.
   * Worker 2 determines the threshold (suggested: n < 5).
   * When true, the UI should show "low confidence" label.
   */
  low_confidence: boolean;
}

/**
 * The six measurement dimensions per SCAN-MEASUREMENT-MODEL.md §1.
 *
 * HONESTY SPINE: sentiment is the ONE allowed LLM-judge call (Worker 2, over the
 * mention_snippet evidence). It is explicitly nullable here so callers must handle
 * the "sentiment unknown" case — never default to 'neutral'.
 *
 * Declared here for Worker 2 to implement against.
 */
export interface DimensionScores {
  /** Presence rate (0–1): named at all across the query set */
  presence: number;
  /**
   * Average rank position when mentioned (lower = better).
   * null when never mentioned in a ranked list across the observation set.
   */
  position: number | null;
  /** Rate of cited-as-source appearances (0–1): domain appears as a cited source URL */
  cited_as_source: number;
  /** Share-of-voice (0–1): mentions vs. total competitor mentions in the same query set */
  share_of_voice: number;
  /** Breadth (0–1): fraction of intent buckets + shapes where the client wins or partials */
  breadth: number;
  /**
   * Sentiment verdict over the observation set.
   * LLM-judged (Worker 2) over preserved mention_snippet evidence.
   * 'unknown' when no mentions exist or the LLM judge could not determine sentiment.
   * NEVER default to 'neutral' — 'unknown' is the honest fallback.
   */
  sentiment: 'positive' | 'neutral' | 'negative' | 'unknown';
}

/**
 * Per-engine sub-score: band + dimensions for one engine across the query set.
 *
 * Declared here for Worker 2 to implement against.
 * Note: do NOT average across engines — per-engine subscores are the unit of truth
 * (SCAN-MEASUREMENT-MODEL.md §9: "engines averaged → per-engine subscores").
 */
export interface EngineSubscore {
  engine: 'chatgpt' | 'gemini' | 'perplexity';
  band: Band;
  dimensions: DimensionScores;
  /** Number of observations this subscore is based on */
  sample_n: number;
}
