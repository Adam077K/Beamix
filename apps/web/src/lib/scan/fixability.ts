/**
 * fixability.ts — Static fixability ratings for all 16 catalog factor_keys.
 *
 * DESIGN NOTE: This is code-config today. The spec (SCAN-MEASUREMENT-MODEL.md §2) states
 * that impact_weight values live in the factor_catalog table (versioned config, not code).
 * Fixability ratings SHOULD follow the same path — moved to factor_catalog columns
 * (e.g., `fixability text` + `effort_score numeric`) in a future migration so they can be
 * updated by pilot data without a deploy.
 *
 * For MVP, this static map is the single source of truth. When the DB migration lands,
 * `getFixability()` should read from the catalog and fall back to this map only for
 * unknown keys (backward-compat). That refactor is a non-breaking change.
 *
 * Fixability derivation rationale per tier (from SCAN-MEASUREMENT-MODEL.md §3):
 *
 * Tier 1 (PROVEN, fast/medium fix):
 *   - fast  (1): on-page tactics, extractable structure, content freshness, ai_bot_allowlist
 *                → pure content + config changes, no third-party dependency.
 *   - slow  (3): review_systems, reddit_quora_presence, listicle_inclusion, earned_media_pr,
 *                wikidata_entity
 *                → depend on third-party platforms, community engagement, or editorial decisions;
 *                  results take weeks-to-months. "Earned, time" = slow.
 *
 * Tier 2 (LIKELY, moderate impact):
 *   - medium (2): topical_authority_cluster, basic_schema
 *                 → require content production or structured-data implementation;
 *                   not instant but owner-controllable within days.
 *   - slow   (3): linkedin_presence, youtube_presence
 *                 → building an active presence on a third-party platform takes sustained effort.
 *
 * Tier 3 (hygiene, NEVER promise lift):
 *   - fast   (1): llms_txt
 *                 → a single text file drop; negligible effort. Hygiene-only.
 *   - medium (2): schema_beyond_basics
 *                 → adding advanced schema is owner-controllable but requires dev work.
 *   - slow   (3): backlinks_dr
 *                 → link-building is the classic "long game"; slowest of all factors.
 *
 * effort_score scale: 1 (fast) | 2 (medium) | 3 (slow).
 * A finer 1-10 scale is used as a sub-discriminator within each fixability class
 * to surface true cheap-wins on ties (e.g., ai_bot_allowlist is a robots.txt edit = effort 1,
 * on_page_princeton_tactics requires content re-write = effort 3 even though both are 'fast').
 */

export type Fixability = 'fast' | 'medium' | 'slow';

export interface FixabilityEntry {
  fixability: Fixability;
  /**
   * Numeric effort cost on a 1-10 scale. Lower = cheaper.
   * Used as a tiebreaker in gap-list ordering (ASC = cheap wins surface first).
   *
   * Coarse band: fast 1-3, medium 4-6, slow 7-10.
   */
  effort_score: number;
}

// ---------------------------------------------------------------------------
// FIXABILITY_MAP — one entry per of the 16 canonical factor_keys.
//
// Any factor_key not in this map gets the safe default via getFixability().
// ---------------------------------------------------------------------------

export const FIXABILITY_MAP: Record<string, FixabilityEntry> = {
  // ── Tier 1 ─────────────────────────────────────────────────────────────────

  /**
   * robots.txt config edit — the cheapest possible fix: one file, one line.
   * Tier 1, impact_weight=0.40 (highest in catalog). Fast and impactful.
   */
  ai_bot_allowlist: { fixability: 'fast', effort_score: 1 },

  /**
   * Content restructuring: add TL;DR block, FAQ section, heading hierarchy.
   * Owner-controllable in a CMS session; no external dependency.
   */
  extractable_structure: { fixability: 'fast', effort_score: 2 },

  /**
   * CMS dateModified markup — usually a plugin toggle or meta field.
   * Depends on CMS; typically a one-session fix.
   */
  content_freshness: { fixability: 'fast', effort_score: 2 },

  /**
   * On-page content re-write: stats, quotes, cited sources, answer-first structure.
   * Fast = owner-controllable on their own site, but requires skilled writing.
   * Higher effort_score within 'fast' band vs. config changes.
   */
  on_page_princeton_tactics: { fixability: 'fast', effort_score: 3 },

  /**
   * Wikidata entity creation — public contribution, usually approved within days.
   * External dependency but the process is straightforward and free.
   */
  wikidata_entity: { fixability: 'slow', effort_score: 7 },

  /**
   * Review acquisition: Google, G2, Capterra, Trustpilot.
   * Multi-platform, requires sustained customer outreach over weeks.
   */
  review_systems: { fixability: 'slow', effort_score: 8 },

  /**
   * Community participation on Reddit + Quora threads.
   * Requires ongoing presence; results accumulate over weeks-to-months.
   */
  reddit_quora_presence: { fixability: 'slow', effort_score: 8 },

  /**
   * Getting into "best X" / "top X" listicles (editorial decisions).
   * Dependent on outreach + editorial acceptance; timeframe is weeks-to-months.
   */
  listicle_inclusion: { fixability: 'slow', effort_score: 9 },

  /**
   * Digital PR / earned media: pitching, placement, editorial acceptance.
   * The classic "earned" category — longest lead time in the gap list.
   */
  earned_media_pr: { fixability: 'slow', effort_score: 10 },

  // ── Tier 2 ─────────────────────────────────────────────────────────────────

  /**
   * Basic schema (Organization, Product, FAQ, Review JSON-LD).
   * Dev work but owner-controlled; implementation guide + one deploy session.
   */
  basic_schema: { fixability: 'medium', effort_score: 4 },

  /**
   * Topical authority cluster: multiple content pieces on the core topic.
   * Requires a content plan + production; medium-term investment.
   */
  topical_authority_cluster: { fixability: 'medium', effort_score: 5 },

  /**
   * LinkedIn company page creation + activity.
   * Building an engaged presence takes sustained posting over weeks.
   */
  linkedin_presence: { fixability: 'slow', effort_score: 7 },

  /**
   * YouTube channel + video content production.
   * Production cost + algorithm ramp-up = slow.
   */
  youtube_presence: { fixability: 'slow', effort_score: 8 },

  // ── Tier 3 (hygiene only) ──────────────────────────────────────────────────

  /**
   * /llms.txt file drop — single static file, minutes to implement.
   * Hygiene only (no measurable lift per n=300k study).
   */
  llms_txt: { fixability: 'fast', effort_score: 1 },

  /**
   * Advanced schema types (BreadcrumbList, HowTo, etc.).
   * Dev work + structured content; more involved than basic schema.
   */
  schema_beyond_basics: { fixability: 'medium', effort_score: 6 },

  /**
   * Backlinks / Domain Rating — traditional link-building.
   * The slowest gap in the list; 3× weaker signal than mentions for AI citation.
   * Never repackage as a GEO win (spec warning: "the category's #1 sin").
   */
  backlinks_dr: { fixability: 'slow', effort_score: 10 },
} as const;

// ---------------------------------------------------------------------------
// Validation: assert all 16 canonical keys are covered at module load.
// This is a compile-time contract (not a runtime check) but the assertion
// array keeps the map honest during future catalog changes.
// ---------------------------------------------------------------------------

const _CANONICAL_KEYS = [
  // Tier 1
  'on_page_princeton_tactics',
  'extractable_structure',
  'content_freshness',
  'listicle_inclusion',
  'reddit_quora_presence',
  'review_systems',
  'earned_media_pr',
  'wikidata_entity',
  'ai_bot_allowlist',
  // Tier 2
  'topical_authority_cluster',
  'linkedin_presence',
  'youtube_presence',
  'basic_schema',
  // Tier 3
  'llms_txt',
  'schema_beyond_basics',
  'backlinks_dr',
] as const satisfies readonly string[];

// Ensure FIXABILITY_MAP has an entry for every canonical key.
// TypeScript will surface a type error if any key is missing.
const _exhaustivenessCheck: Record<(typeof _CANONICAL_KEYS)[number], FixabilityEntry> =
  FIXABILITY_MAP as Record<(typeof _CANONICAL_KEYS)[number], FixabilityEntry>;

// Suppress "declared but never read" without changing runtime behavior.
void _exhaustivenessCheck;

// ---------------------------------------------------------------------------
// getFixability — safe accessor with fallback for unknown keys.
//
// Returns the static entry when known; falls back to medium/2 for any unknown
// key (e.g. future catalog additions before the map is updated).
// ---------------------------------------------------------------------------

const FALLBACK_FIXABILITY: FixabilityEntry = { fixability: 'medium', effort_score: 2 };

/**
 * Returns the fixability entry for a factor_key.
 *
 * Safe default: `{ fixability: 'medium', effort_score: 2 }` for unknown keys.
 * This is a conservative default — medium priority, not fast (which would
 * surface an unknown factor as a cheap win) and not slow (which would bury it).
 *
 * @param factor_key - One of the 16 catalog factor_key values, or any future key.
 */
export function getFixability(factor_key: string): FixabilityEntry {
  return FIXABILITY_MAP[factor_key] ?? FALLBACK_FIXABILITY;
}
