/**
 * factor-detection.ts — L1 FACT-class factor detector for the Beamix diagnosis pipeline.
 *
 * Produces exactly one FactorObservation per the 16 catalog factor_keys, in canonical
 * tier order (Tier 1 → Tier 2 → Tier 3) matching factor_catalog seed order.
 *
 * HONESTY SPINE:
 *   - Every observation is FACT-class: externally verifiable, never fabricated.
 *   - Factors that require an external API not wired this wave → status 'pending',
 *     source 'external_api_pending'. Never guess — explicit pending is honest.
 *   - Tier-3 factors carry a note in evidence that they represent hygiene only.
 *   - FM-5 guard: robots.txt unavailable → ai_bot_allowlist is 'unknown', never 'absent'.
 */

import type { SiteAudit, BusinessContext, EngineRawResult } from './types';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type FactorStatus = 'present' | 'absent' | 'unknown' | 'pending';

export interface FactorObservation {
  /** One of the 16 catalog factor_key values. */
  factor_key: string;
  /**
   * present  = the business has done this (positive signal).
   * absent   = verified gap (externally checkable fact).
   * unknown  = data unavailable (e.g. robots.txt unfetchable, page down).
   * pending  = needs an external API not wired this wave.
   */
  status: FactorStatus;
  /** All observations from this module are FACT-class. */
  truth_class: 'FACT';
  /** Concrete, externally-checkable statement — never fabricated. */
  evidence: string;
  source: 'site_audit' | 'wikidata' | 'external_api_pending';
  /** ISO 8601 timestamp of when this observation was made. */
  detected_at: string;
}

export interface DetectionInput {
  siteAudit: SiteAudit;
  businessContext?: BusinessContext;
  /** Reserved for W6+ contrastive scoring; unused this wave. */
  engineResults?: EngineRawResult[];
}

// ---------------------------------------------------------------------------
// Canonical 16-key order (Tier 1 → Tier 2 → Tier 3, matches migration seed)
// ---------------------------------------------------------------------------

const CANONICAL_FACTOR_KEYS: readonly string[] = [
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
] as const;

// ---------------------------------------------------------------------------
// AI crawlers the spec requires us to check (must match site-audit.ts)
// ---------------------------------------------------------------------------

const REQUIRED_AI_CRAWLERS: readonly string[] = [
  'GPTBot',
  'Google-Extended',
  'PerplexityBot',
  'Claude-Web',
  'anthropic-ai',
];

// Basic schema types — the "standard" set for basic_schema and schema_beyond_basics.
const BASIC_SCHEMA_TYPES_LOWER = new Set([
  'organization',
  'localbusiness',
  'product',
  'faqpage',
  'review',
]);

// ---------------------------------------------------------------------------
// Detector type
// ---------------------------------------------------------------------------

type DetectorFn = (input: DetectionInput, detectedAt: string) => Promise<FactorObservation>;

// ---------------------------------------------------------------------------
// Detector: ai_bot_allowlist
//
// FM-5 guard: if robots.txt is unavailable → 'unknown' (never infer blocked).
// 'absent' (gap) if ANY of the required AI crawlers is disallowed.
// 'present' if all required crawlers are allowed.
// ---------------------------------------------------------------------------

async function detectAiBotAllowlist(input: DetectionInput, detectedAt: string): Promise<FactorObservation> {
  const { robotsTxt } = input.siteAudit;

  if (robotsTxt.fetchStatus === 'unavailable') {
    return {
      factor_key: 'ai_bot_allowlist',
      status: 'unknown',
      truth_class: 'FACT',
      evidence: 'robots.txt could not be fetched (non-200 or network error) — no data on crawler permissions (FM-5: unavailability ≠ disallowed)',
      source: 'site_audit',
      detected_at: detectedAt,
    };
  }

  const { crawlers } = robotsTxt;
  const disallowed = REQUIRED_AI_CRAWLERS.filter((ua) => crawlers[ua] === 'disallowed');

  if (disallowed.length > 0) {
    return {
      factor_key: 'ai_bot_allowlist',
      status: 'absent',
      truth_class: 'FACT',
      evidence: `robots.txt disallows the following AI crawlers: ${disallowed.join(', ')}`,
      source: 'site_audit',
      detected_at: detectedAt,
    };
  }

  return {
    factor_key: 'ai_bot_allowlist',
    status: 'present',
    truth_class: 'FACT',
    evidence: `robots.txt allows all checked AI crawlers (${REQUIRED_AI_CRAWLERS.join(', ')})`,
    source: 'site_audit',
    detected_at: detectedAt,
  };
}

// ---------------------------------------------------------------------------
// Detector: basic_schema
//
// 'present' if any JSON-LD type matches the basic set.
// 'absent' if page is ok but no matching types found.
// 'unknown' if page unavailable.
// ---------------------------------------------------------------------------

async function detectBasicSchema(input: DetectionInput, detectedAt: string): Promise<FactorObservation> {
  const { page } = input.siteAudit;

  if (page.fetchStatus === 'unavailable') {
    return {
      factor_key: 'basic_schema',
      status: 'unknown',
      truth_class: 'FACT',
      evidence: 'Page could not be fetched — schema types unknown',
      source: 'site_audit',
      detected_at: detectedAt,
    };
  }

  const types = page.jsonLdTypes ?? [];
  const found = types.filter((t) => BASIC_SCHEMA_TYPES_LOWER.has(t.toLowerCase()));

  if (found.length > 0) {
    return {
      factor_key: 'basic_schema',
      status: 'present',
      truth_class: 'FACT',
      evidence: `JSON-LD schema types found: ${found.join(', ')}`,
      source: 'site_audit',
      detected_at: detectedAt,
    };
  }

  return {
    factor_key: 'basic_schema',
    status: 'absent',
    truth_class: 'FACT',
    evidence: 'No Organization, LocalBusiness, Product, FAQPage, or Review JSON-LD type found',
    source: 'site_audit',
    detected_at: detectedAt,
  };
}

// ---------------------------------------------------------------------------
// Detector: schema_beyond_basics (Tier 3 — hygiene, never promises lift)
//
// 'present' if any JSON-LD type exists that is NOT in the basic set.
// 'absent' if page is ok and all types are basic (or no types).
// 'unknown' if page unavailable.
// ---------------------------------------------------------------------------

async function detectSchemaBeyondBasics(input: DetectionInput, detectedAt: string): Promise<FactorObservation> {
  const { page } = input.siteAudit;

  if (page.fetchStatus === 'unavailable') {
    return {
      factor_key: 'schema_beyond_basics',
      status: 'unknown',
      truth_class: 'FACT',
      evidence: 'Page could not be fetched — advanced schema types unknown (hygiene factor, no lift implied)',
      source: 'site_audit',
      detected_at: detectedAt,
    };
  }

  const types = page.jsonLdTypes ?? [];
  const advanced = types.filter((t) => !BASIC_SCHEMA_TYPES_LOWER.has(t.toLowerCase()));

  if (advanced.length > 0) {
    return {
      factor_key: 'schema_beyond_basics',
      status: 'present',
      truth_class: 'FACT',
      evidence: `Advanced JSON-LD schema types found (hygiene signal, no lift implied): ${advanced.join(', ')}`,
      source: 'site_audit',
      detected_at: detectedAt,
    };
  }

  return {
    factor_key: 'schema_beyond_basics',
    status: 'absent',
    truth_class: 'FACT',
    evidence: 'No advanced JSON-LD schema types found beyond the basic set (hygiene factor, no lift implied)',
    source: 'site_audit',
    detected_at: detectedAt,
  };
}

// ---------------------------------------------------------------------------
// Detector: extractable_structure
//
// Heuristic: page ok AND exactly 1 H1 AND >= 2 H2s AND >= 300 words.
// ---------------------------------------------------------------------------

async function detectExtractableStructure(input: DetectionInput, detectedAt: string): Promise<FactorObservation> {
  const { page } = input.siteAudit;

  if (page.fetchStatus === 'unavailable') {
    return {
      factor_key: 'extractable_structure',
      status: 'unknown',
      truth_class: 'FACT',
      evidence: 'Page could not be fetched — heading structure unknown',
      source: 'site_audit',
      detected_at: detectedAt,
    };
  }

  const h1 = page.h1Count ?? 0;
  const h2 = page.h2Count ?? 0;
  const words = page.wordCount ?? 0;

  const pass = h1 === 1 && h2 >= 2 && words >= 300;

  return {
    factor_key: 'extractable_structure',
    status: pass ? 'present' : 'absent',
    truth_class: 'FACT',
    evidence: `H1 count: ${h1}, H2 count: ${h2}, word count: ${words}. Required: 1 H1, ≥2 H2s, ≥300 words.`,
    source: 'site_audit',
    detected_at: detectedAt,
  };
}

// ---------------------------------------------------------------------------
// Detector: content_freshness
//
// AI citation half-life is ~4.5 weeks; we use 120 days as a generous bound.
// 'present' if dateModified found AND within 120 days of now.
// 'absent' if dateModified found but older than 120 days.
// 'unknown' if no dateModified or page unavailable.
// ---------------------------------------------------------------------------

// ~4.5-week AI citation half-life per KDD/Moz 2024 findings; 120d is the generous
// "still in consideration" window — pages older than this drop fast in AI citation rates.
const FRESHNESS_WINDOW_DAYS = 120;

async function detectContentFreshness(input: DetectionInput, detectedAt: string): Promise<FactorObservation> {
  const { page } = input.siteAudit;

  if (page.fetchStatus === 'unavailable' || !page.dateModified) {
    return {
      factor_key: 'content_freshness',
      status: 'unknown',
      truth_class: 'FACT',
      evidence: page.fetchStatus === 'unavailable'
        ? 'Page could not be fetched — content date unknown'
        : 'No dateModified or datePublished date found on page',
      source: 'site_audit',
      detected_at: detectedAt,
    };
  }

  const modifiedDate = new Date(page.dateModified);

  // Guard: unparseable date string (isNaN guard mirrors pickMostRecentDate in site-audit.ts).
  if (Number.isNaN(modifiedDate.getTime())) {
    return {
      factor_key: 'content_freshness',
      status: 'unknown',
      truth_class: 'FACT',
      evidence: `dateModified '${page.dateModified}' is not a parseable date — result unknown`,
      source: 'site_audit',
      detected_at: detectedAt,
    };
  }

  const nowMs = Date.now();
  const ageMs = nowMs - modifiedDate.getTime();

  // Guard: future-dated dateModified (CMS scheduling artifact or bad data).
  // A negative age is unreliable — treat as unknown rather than classifying as 'present'.
  if (ageMs < 0) {
    return {
      factor_key: 'content_freshness',
      status: 'unknown',
      truth_class: 'FACT',
      evidence: `dateModified '${page.dateModified}' is in the future (likely CMS scheduling or bad data) — treated as unreliable`,
      source: 'site_audit',
      detected_at: detectedAt,
    };
  }

  const windowMs = FRESHNESS_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const isRecent = ageMs <= windowMs;

  return {
    factor_key: 'content_freshness',
    status: isRecent ? 'present' : 'absent',
    truth_class: 'FACT',
    evidence: `Page dateModified: ${page.dateModified}. ${isRecent ? `Within ${FRESHNESS_WINDOW_DAYS}-day freshness window.` : `Older than ${FRESHNESS_WINDOW_DAYS}-day freshness window — AI citation half-life ~4.5 weeks.`}`,
    source: 'site_audit',
    detected_at: detectedAt,
  };
}

// ---------------------------------------------------------------------------
// Detector: llms_txt (Tier 3 — hygiene, never promises lift)
// ---------------------------------------------------------------------------

async function detectLlmsTxt(input: DetectionInput, detectedAt: string): Promise<FactorObservation> {
  const present = input.siteAudit.llmsTxt.present;

  return {
    factor_key: 'llms_txt',
    status: present ? 'present' : 'absent',
    truth_class: 'FACT',
    evidence: `/llms.txt ${present ? 'present' : 'absent'} (hygiene signal — n=300k study shows no measurable citation impact)`,
    source: 'site_audit',
    detected_at: detectedAt,
  };
}

// ---------------------------------------------------------------------------
// Detector: wikidata_entity
//
// Queries the Wikidata public search API for the business name.
// Fixed trusted host — NOT SSRF risk (host is hardcoded, not user-controlled).
// Only the search term is user-supplied and it is URL-encoded into a query param.
// Do NOT route through safeFetch (which is for attacker-controlled hosts).
// ---------------------------------------------------------------------------

const WIKIDATA_API_URL = 'https://www.wikidata.org/w/api.php';
const WIKIDATA_TIMEOUT_MS = 8_000;

async function detectWikidataEntity(input: DetectionInput, detectedAt: string): Promise<FactorObservation> {
  const businessName = input.businessContext?.business_name;

  if (!businessName) {
    return {
      factor_key: 'wikidata_entity',
      status: 'unknown',
      truth_class: 'FACT',
      evidence: 'No business name provided — Wikidata lookup skipped',
      source: 'wikidata',
      detected_at: detectedAt,
    };
  }

  try {
    const url = `${WIKIDATA_API_URL}?action=wbsearchentities&format=json&language=en&type=item&limit=1&search=${encodeURIComponent(businessName)}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), WIKIDATA_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'Beamix/1.0 (https://beamixai.com; hello@beamixai.com)' },
      });
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      return {
        factor_key: 'wikidata_entity',
        status: 'unknown',
        truth_class: 'FACT',
        evidence: `Wikidata API returned HTTP ${response.status} — result unknown`,
        source: 'wikidata',
        detected_at: detectedAt,
      };
    }

    const data = await response.json() as {
      search?: Array<{ id: string; label?: string; description?: string }>;
    };

    const results = data.search ?? [];

    if (results.length > 0) {
      const match = results[0];
      return {
        factor_key: 'wikidata_entity',
        status: 'present',
        truth_class: 'FACT',
        evidence: `Wikidata entity found: ${match.id}${match.label ? ` "${match.label}"` : ''}${match.description ? ` — ${match.description}` : ''}`,
        source: 'wikidata',
        detected_at: detectedAt,
      };
    }

    return {
      factor_key: 'wikidata_entity',
      status: 'absent',
      truth_class: 'FACT',
      evidence: `No Wikidata entity found for '${businessName}'`,
      source: 'wikidata',
      detected_at: detectedAt,
    };
  } catch {
    return {
      factor_key: 'wikidata_entity',
      status: 'unknown',
      truth_class: 'FACT',
      evidence: 'Wikidata lookup failed (network error, timeout, or parse error) — result unknown',
      source: 'wikidata',
      detected_at: detectedAt,
    };
  }
}

// ---------------------------------------------------------------------------
// Pending-factory — factors that need external APIs not wired this wave
// ---------------------------------------------------------------------------

function makePending(factor_key: string, apiNote: string, detectedAt: string): FactorObservation {
  return {
    factor_key,
    status: 'pending',
    truth_class: 'FACT',
    evidence: `requires ${apiNote} — not wired this wave`,
    source: 'external_api_pending',
    detected_at: detectedAt,
  };
}

// ---------------------------------------------------------------------------
// Detector registry — maps each factor_key to its detector function.
// Pending factories are inlined as async lambdas for uniformity.
// ---------------------------------------------------------------------------

type Registry = Record<string, DetectorFn>;

function buildRegistry(): Registry {
  return {
    // ── Fully implemented (deterministic from SiteAudit or Wikidata) ──────────
    ai_bot_allowlist: detectAiBotAllowlist,
    basic_schema: detectBasicSchema,
    schema_beyond_basics: detectSchemaBeyondBasics,
    extractable_structure: detectExtractableStructure,
    content_freshness: detectContentFreshness,
    llms_txt: detectLlmsTxt,
    wikidata_entity: detectWikidataEntity,

    // ── Pending — require search / third-party APIs, gated on budget ──────────
    on_page_princeton_tactics: (_i, dt) =>
      Promise.resolve(makePending('on_page_princeton_tactics', 'NLP-based page analysis (content scoring pipeline)', dt)),
    listicle_inclusion: (_i, dt) =>
      Promise.resolve(makePending('listicle_inclusion', 'web search API to scan third-party "best X" articles', dt)),
    reddit_quora_presence: (_i, dt) =>
      Promise.resolve(makePending('reddit_quora_presence', 'Reddit API + Quora search integration', dt)),
    review_systems: (_i, dt) =>
      Promise.resolve(makePending('review_systems', 'Google Places API + G2/Capterra/Trustpilot integrations', dt)),
    earned_media_pr: (_i, dt) =>
      Promise.resolve(makePending('earned_media_pr', 'web search API to detect editorial media coverage', dt)),
    topical_authority_cluster: (_i, dt) =>
      Promise.resolve(makePending('topical_authority_cluster', 'sitemap + content crawl to measure topic cluster depth', dt)),
    linkedin_presence: (_i, dt) =>
      Promise.resolve(makePending('linkedin_presence', 'LinkedIn company page API', dt)),
    youtube_presence: (_i, dt) =>
      Promise.resolve(makePending('youtube_presence', 'YouTube Data API', dt)),
    backlinks_dr: (_i, dt) =>
      Promise.resolve(makePending('backlinks_dr', 'backlink/DR data API (Ahrefs/Moz/Semrush)', dt)),
  };
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

/**
 * Detects all 16 catalog factors for the given input.
 *
 * Returns EXACTLY 16 observations in canonical tier order.
 * Never throws — all errors are captured inside individual detectors.
 */
export async function detectFactors(input: DetectionInput): Promise<FactorObservation[]> {
  const detectedAt = new Date().toISOString();
  const registry = buildRegistry();

  const observations = await Promise.all(
    CANONICAL_FACTOR_KEYS.map((key) => {
      const detector = registry[key];
      if (!detector) {
        // Safety net — should never happen while CANONICAL_FACTOR_KEYS matches registry.
        return Promise.resolve(makePending(key, 'unknown — detector not registered', detectedAt));
      }
      return detector(input, detectedAt);
    }),
  );

  return observations;
}
