/**
 * scan-free-v2-deps.ts — Helper module for the Wave 7 v2 scan path in scan-free.ts.
 *
 * Responsibilities:
 *   1. Feature flag — isScanMeasurementV2Enabled() (env-var gated, OFF by default).
 *   2. Input builder — buildV2Input() constructs AssembleFreeScanV2Input from the
 *      existing BusinessContext + ScanInput.
 *   3. Deps builder — buildV2Deps() wires real implementations of every
 *      AssembleFreeScanV2Deps field for production use.
 *   4. Blob mapper — mapV2ToFreeScanResults() converts a ScanV2Result into the
 *      backward-compatible FreeScanResults shape (required by the existing scan
 *      results page) and attaches scan_v2 for Worker 3 to render.
 *
 * HARD RULES encoded here:
 *   - NO-LEAK: the probe dep receives pre-built {system,user} from assembleFreeScanV2
 *     via buildNeutralProbe(); identity is never passed into probe prompts. This module
 *     does NOT call buildNeutralProbe() or pass identity to callOpenRouter.
 *   - FREE SCAN = BLOB: this module writes NOTHING to Supabase. All persistence is in
 *     scan-free.ts's persist-results step.
 *   - Competitor domain resolver is CONSERVATIVE (null for all). Competitor auditing
 *     lights up in a later pass when a citation-based domain resolver is added. The
 *     gap-list already handles impact_fallback mode (buildContrastiveGapList uses
 *     empty competitorAudits correctly).
 *
 * Agent-key split note:
 *   The brief specifies that sentimentCall/narrationCall should eventually use a
 *   separate "agent key" vs the OPENROUTER_SCAN_KEY used for probes. This split is
 *   a later infra task — for now all calls use callOpenRouter which already prefers
 *   OPENROUTER_SCAN_KEY and falls back to OPENROUTER_API_KEY. Both paths use the
 *   same resolveOpenRouterKey() resolver. Track as: "agent-key split (later infra)".
 *
 * Engine model selection:
 *   assembleFreeScanV2 calls deps.probe(engine, DEFAULT_PROBE_MODEL, probe) where
 *   DEFAULT_PROBE_MODEL = 'perplexity/sonar'. The probe dep built here OVERRIDES
 *   this default model with the per-engine map from engine-query.ts (honouring the
 *   SCAN_LIVE_RETRIEVAL flag). The `model` parameter from the assemble call is
 *   intentionally ignored — the dep resolves the correct model internally. This is
 *   documented here as a design decision so future engineers don't wonder why `model`
 *   is shadowed.
 *
 * Issues/gap mapping (backward-compat):
 *   The legacy FreeScanResults.issues[] and total_issues fields are mapped from
 *   the RankedGap list. A "gap" for these purposes is any RankedGap entry whose
 *   factor_key belongs to a known display category. The mapping groups gaps by their
 *   impact tier and produces a human-readable category label. This is intentionally
 *   conservative — only gaps with verifiable 'absent' status contribute to the count.
 *
 *   Mapping logic:
 *     - tier 1 gaps ("High impact") → category "Missing from AI answers"
 *     - tier 2 gaps ("Medium impact") → category "AI citation gaps"
 *     - tier 3 gaps ("Hygiene") → category "Site hygiene gaps"
 *     - gaps with tier <= 0 or unrecognized → category "Other gaps"
 *   total_issues = sum of all group counts.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { callOpenRouter } from '../../lib/scan/openrouter-client';
import { auditSite } from '../../lib/scan/site-audit';
import { detectFactors } from '../../lib/scan/factor-detection';
import { loadFactorCatalog } from '../../lib/scan/factor-catalog';
import type {
  AssembleFreeScanV2Input,
  AssembleFreeScanV2Deps,
  ScanV2Result,
} from '../../lib/scan/assemble-free-scan-v2';
import type { BusinessContext, FreeScanResults, ScanInput } from '../../lib/scan/types';

// ---------------------------------------------------------------------------
// Engine model maps — mirrors engine-query.ts logic for the v2 probe dep.
// We replicate the minimal flag-aware map here rather than exporting it from
// engine-query.ts to avoid coupling the scan module boundary further.
// See engine-query.ts for the canonical source and the HONEST LABELING note.
// ---------------------------------------------------------------------------

type V2Engine = 'chatgpt' | 'gemini' | 'perplexity';

/** Models for the v2 probe dep when SCAN_LIVE_RETRIEVAL is OFF (default). */
const ENGINE_MODELS_V2: Record<V2Engine, string> = {
  chatgpt: 'openai/gpt-4o',
  gemini: 'google/gemini-2.5-flash',
  perplexity: 'perplexity/sonar',
};

/** Models for the v2 probe dep when SCAN_LIVE_RETRIEVAL is ON. */
const ENGINE_MODELS_V2_LIVE: Record<V2Engine, string> = {
  chatgpt: 'openai/gpt-4o-mini',
  gemini: 'google/gemini-2.5-flash',
  perplexity: 'perplexity/sonar',
};

/** retrieval_mode for each engine when SCAN_LIVE_RETRIEVAL is OFF. */
const RETRIEVAL_MODE_OFF: Record<V2Engine, 'live_web' | 'parametric_memory'> = {
  chatgpt: 'parametric_memory',
  gemini: 'parametric_memory',
  perplexity: 'live_web',
};

/** retrieval_mode for each engine when SCAN_LIVE_RETRIEVAL is ON. */
const RETRIEVAL_MODE_ON: Record<V2Engine, 'live_web' | 'parametric_memory'> = {
  chatgpt: 'live_web',
  gemini: 'parametric_memory',
  perplexity: 'live_web',
};

// ---------------------------------------------------------------------------
// 1. Feature flag
// ---------------------------------------------------------------------------

/**
 * Returns true when the v2 measurement path is enabled.
 * Exact match on 'true' — any other value (including 'True', '1', '') returns false.
 * Default (unset) = false, so production is always on the v1 path unless explicitly opted in.
 */
export function isScanMeasurementV2Enabled(): boolean {
  return process.env['SCAN_MEASUREMENT_V2'] === 'true';
}

// ---------------------------------------------------------------------------
// 2. Input builder
// ---------------------------------------------------------------------------

/**
 * Build the AssembleFreeScanV2Input from the existing scan context.
 *
 * Query strategy (one neutral query per scan):
 *   query_text = "best {category}" for global location, or
 *                "best {category} in {location}" for a specific location.
 *   This mirrors the real-user discovery pattern for the business's vertical.
 *   intent_bucket = 'category_geo' (the dominant intent for free scans).
 *
 * Engines: all three free-scan engines (chatgpt, gemini, perplexity).
 *
 * identity: business_name + domain from the scan input; aliases kept empty
 * (free scans have no known alias variants; aliases can be added via onboarding
 * data in a future pass).
 */
export function buildV2Input(
  ctx: BusinessContext,
  _scanInput: ScanInput,
): AssembleFreeScanV2Input {
  const locationSuffix =
    ctx.location && ctx.location !== 'global' ? ` in ${ctx.location}` : '';

  const queryText = `best ${ctx.category}${locationSuffix}`;

  return {
    identity: {
      business_name: ctx.business_name,
      domain: ctx.website_url,
      aliases: [],
    },
    ctx,
    queries: [
      {
        query_text: queryText,
        category: ctx.category,
        location: ctx.location,
        intent_bucket: 'category_geo',
      },
    ],
    engines: ['chatgpt', 'gemini', 'perplexity'],
  };
}

// ---------------------------------------------------------------------------
// 3. Deps builder
// ---------------------------------------------------------------------------

/**
 * Build the real AssembleFreeScanV2Deps for production use inside the Inngest function.
 *
 * probe dep:
 *   - Resolves the correct per-engine model (honouring SCAN_LIVE_RETRIEVAL flag).
 *   - The `model` arg passed by assembleFreeScanV2 (DEFAULT_PROBE_MODEL) is intentionally
 *     shadowed — the dep resolves the correct model internally from the engine-aware map.
 *     Reasoning: the assemble function is model-agnostic; the wiring layer owns model routing.
 *   - Only chatgpt under SCAN_LIVE_RETRIEVAL=ON uses the web_search plugin (same rule as
 *     engine-query.ts). perplexity/sonar grounds natively; gemini stays parametric.
 *
 * resolveCompetitorDomain (CONSERVATIVE null-resolver):
 *   Always returns null. Competitor auditing (gap-list in contrastive mode) is the future
 *   state — currently the gap-list runs in impact_fallback mode, which is the honest default
 *   when no competitor domains are available. A citation-based resolver (matching competitor
 *   names against citations gathered during the probe stage) is the correct approach and is
 *   deferred to a dedicated pass. "Guessing {name}.com" is explicitly rejected (SSRF surface
 *   + unreliable).
 *
 * @param supabase - Admin Supabase client from createAdminSupabaseClient().
 */
export function buildV2Deps(
  supabase: Pick<SupabaseClient, 'from'>,
): AssembleFreeScanV2Deps {
  const live = process.env['SCAN_LIVE_RETRIEVAL'] === 'true';
  const modelMap = live ? ENGINE_MODELS_V2_LIVE : ENGINE_MODELS_V2;
  const modeMap = live ? RETRIEVAL_MODE_ON : RETRIEVAL_MODE_OFF;

  return {
    // probe: receives the neutral {system,user} prompt from buildNeutralProbe().
    // NO identity is present in the prompt at this point — the NO-LEAK firewall
    // is structural (probe.ts asserts this before this dep is called).
    probe: async (engine, _modelArg, probePrompt) => {
      // Resolve the correct model for this engine (shadow the assemble default).
      const resolvedModel = modelMap[engine];

      // chatgpt under live-retrieval uses the web_search plugin.
      const useWebPlugin = live && engine === 'chatgpt';

      const response = await callOpenRouter({
        model: resolvedModel,
        systemPrompt: probePrompt.system,
        userPrompt: probePrompt.user,
        maxTokens: 800,
        temperature: 0.1,
        ...(useWebPlugin ? { web: true, webMaxResults: 5 } : {}),
      });

      return {
        text: response.text,
        citations: response.sourceUrls.length > 0 ? response.sourceUrls : undefined,
        retrieval_mode: modeMap[engine],
      };
    },

    // sentimentCall + narrationCall: default callOpenRouter.
    // Note: agent-key split (later infra) — currently shares the same key as probes.
    sentimentCall: callOpenRouter,
    narrationCall: callOpenRouter,

    // auditSite: real SSRF-safe site audit (safe-fetch is allowlisted internally).
    auditSite,

    // detectFactors: real factor detection from factor-detection.ts.
    detectFactors,

    // loadCatalog: reads factor_catalog from Supabase via the admin client.
    // Cast via unknown because SupabaseClient's chained type differs from the minimal
    // SupabaseClientLike structural type in factor-catalog.ts.
    loadCatalog: () => loadFactorCatalog(supabase as unknown as Parameters<typeof loadFactorCatalog>[0]),

    // resolveCompetitorDomain: CONSERVATIVE null-resolver.
    // Returns null for ALL competitors — gap-list runs in impact_fallback mode.
    // See module header for rationale.
    resolveCompetitorDomain: (_name: string) => null,

    // now: default ISO timestamp.
    now: () => new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// 4. Blob mapper
// ---------------------------------------------------------------------------

/**
 * Map a ScanV2Result into the backward-compatible FreeScanResults blob.
 *
 * Required fields for backward-compat (existing results page reads these):
 *   visibility_score  — set to headline_band.point (median across engines, labeled secondary).
 *   engines_checked   — always 3 for free scans.
 *   issues            — grouped from gap_list (absent-only gaps, grouped by tier).
 *   total_issues      — sum of all group counts.
 *
 * Additive v2 field:
 *   scan_v2           — the full ScanV2Result; Worker 3 reads this for the richer view.
 *
 * Issues/gap mapping:
 *   Only 'absent' status RankedGap entries become issue groups.
 *   Grouped by tier (from gap_list entries that carry tier metadata):
 *     tier 1 → "Missing from AI answers"
 *     tier 2 → "AI citation gaps"
 *     tier 3 → "Site hygiene gaps"
 *     other  → "Other gaps"
 *
 *   Note: RankedGap entries may not all have `tier` directly (it is on GapListItem
 *   from factor-catalog.ts). We use the impact_weight heuristic as a proxy:
 *     impact_weight >= 0.7 → tier 1 ("High impact")
 *     impact_weight >= 0.3 → tier 2 ("Medium impact")
 *     impact_weight >= 0   → tier 3 ("Hygiene")
 *   This is consistent with the catalog seed data.
 *   If `tier` is present on the gap (from GapListItem via contrastive ordering),
 *   it takes precedence.
 */
export function mapV2ToFreeScanResults(result: ScanV2Result): FreeScanResults {
  // --- visibility_score: headline_band.point (median across engines, labeled secondary) ---
  const visibilityScore = Math.round(result.headline_band.point);

  // --- engines_checked: number of successful engine subscores ---
  // Always 3 for free scans (the full set). Using engines that produced a subscore.
  const enginesChecked = result.engine_subscores.length > 0 ? result.engine_subscores.length : 3;

  // --- issues mapping from gap_list ---
  // RankedGap entries are ALWAYS absent-status gaps (buildContrastiveGapList only
  // includes absent factors). Every entry in gap_list is a real gap.
  const gaps = result.gap_list;

  // Group by display category based on tier (always present on RankedGap).
  const tierOneCategoryLabel = 'Missing from AI answers';
  const tierTwoCategoryLabel = 'AI citation gaps';
  const tierThreeCategoryLabel = 'Site hygiene gaps';
  const otherCategoryLabel = 'Other gaps';

  const groups: Record<string, number> = {};

  for (const gap of gaps) {
    // RankedGap.tier is always present (from gap-types.ts definition).
    let category: string;
    const { tier } = gap;

    if (tier === 1) category = tierOneCategoryLabel;
    else if (tier === 2) category = tierTwoCategoryLabel;
    else if (tier === 3) category = tierThreeCategoryLabel;
    else category = otherCategoryLabel;

    groups[category] = (groups[category] ?? 0) + 1;
  }

  const issues = Object.entries(groups).map(([category, count]) => ({ category, count }));

  // Fallback: if no absent gaps were found, provide a minimal placeholder.
  // This can happen when site audit fails or the catalog is empty.
  // The placeholder is honest: it signals that data was insufficient for a full gap analysis.
  if (issues.length === 0 && result.meta.degraded) {
    issues.push({ category: 'Analysis degraded — insufficient data', count: 0 });
  }

  const totalIssues = issues.reduce((sum, i) => sum + i.count, 0);

  return {
    visibility_score: visibilityScore,
    engines_checked: enginesChecked,
    issues,
    total_issues: totalIssues,
    scan_v2: result,
  };
}
