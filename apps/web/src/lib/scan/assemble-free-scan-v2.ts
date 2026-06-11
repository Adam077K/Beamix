/**
 * assemble-free-scan-v2.ts — Pure, fully-injectable orchestrator for the v2 free scan.
 *
 * PIPELINE (4 stages per SCAN-ORCHESTRATION.md):
 *   Stage 1 — Context + queries       (caller provides; not this module's job)
 *   Stage 2 — Neutral engine probe    (per engine × query, with leak-gate)
 *   Stage 3 — Code extraction + score (detectClient, classifyShape, dimensions, scoring)
 *   Stage 4 — Evidence-bound narration (one LLM call, grounding check)
 *   + competitor L1 auditing          (W7 addition — auditCompetitors)
 *
 * HARD RULES (the product):
 *   NO-LEAK: every probe is built via buildNeutralProbe(NeutralQuery) and passes
 *   assertProbeClean(probe, identity) BEFORE the call. ProbeLeakError is propagated
 *   fail-closed — the scan must fail rather than leak identity into the probe prompt.
 *
 *   CODE computes every number: mention/rank/score/gap-order are never LLM-produced.
 *   The only LLM calls are: per-engine sentiment judge + single narration.
 *
 *   HONESTY: per-engine subscores are the unit of truth. headline_band is the
 *   median across engines — a LABELED secondary value, never "the truth".
 *   Tier-3 hygiene is never a "win". pending/unknown are not gaps.
 *
 *   FREE SCAN = BLOB: this orchestrator returns an in-memory ScanV2Result only.
 *   It does NOT touch Supabase tables (query_positions / scan_engine_results).
 *   All DB persistence is Worker 2's responsibility.
 *
 *   FULLY INJECTABLE: every LLM call, every site fetch, and the catalog load are
 *   injected via AssembleFreeScanV2Deps so tests run with stubs and make ZERO
 *   network calls.
 *
 * ENGINE SUCCESS THRESHOLD (≥2/3 engines):
 *   Per SCAN-ORCHESTRATION.md §"Failure modes locked":
 *     "Partial engine failure (1 of N down) → mark scan degraded/partial and gate
 *      narration behind a success threshold (e.g. ≥2/3 engines)."
 *   With N=3 engines: threshold = 2 (at least 2 must succeed).
 *   If only 1 or 0 engines succeed → meta.degraded=true AND we still attempt
 *   narration with whatever observations we have (graceful partial output).
 *   If ALL engines fail → empty observations; narration falls back to template;
 *   meta.degraded=true; scan still returns (never throws from engine failure).
 *   ProbeLeakError is the ONE exception that propagates (fail-closed).
 */

import { buildNeutralProbe, assertProbeClean } from './probe';
import { detectClient, extractCompetitors } from './client-detection';
import { classifyShape } from './answer-shape';
import { judgeSentiment } from './sentiment-judge';
import { scoreEngine, medianAcrossEngines } from './scoring';
import { buildGapList } from './factor-catalog';
import { buildContrastiveGapList } from './gap-list-ordering';
import { mapGapsToPlaybooks } from './playbook-mapping';
import { narrate } from './narration';
import { selectTopCompetitors, auditCompetitors } from './competitor-audit';
import type {
  AssembleFreeScanV2Input,
  AssembleFreeScanV2Deps,
  ScanV2Result,
} from './scan-v2-types';
import type { EngineProbeObservation } from './measurement-types';

// ---------------------------------------------------------------------------
// Default model IDs
// ---------------------------------------------------------------------------

/** Default model for engine probes (OpenRouter slot — real provider is Perplexity/GPT). */
const DEFAULT_PROBE_MODEL = 'perplexity/sonar';

/** Default model for sentiment judgment (cheap, fast). */
const DEFAULT_SENTIMENT_MODEL = 'google/gemini-flash-1.5';

/** Default model for narration (cheap, free tier). */
const DEFAULT_NARRATION_MODEL = 'google/gemini-2.5-flash';

/** Minimum engines that must succeed for a non-degraded scan (≥2/3 rule). */
const ENGINE_SUCCESS_THRESHOLD = 2;

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

/**
 * Assemble the full v2 free-scan result.
 *
 * @param input  Identity, context, queries, engines to probe.
 * @param deps   Injectable I/O — all real fetch/LLM calls are injected here.
 *               Tests must inject stubs; Worker 2 injects real implementations.
 *
 * @returns ScanV2Result — fully in-memory, never persisted by this function.
 *
 * @throws ProbeLeakError when a neutral probe is found to contain identity tokens
 *         (fail-closed — measurement validity > scan completion).
 *
 * All other failures are handled gracefully:
 *   - Per-engine probe failures → mark engine as failed, continue.
 *   - Competitor audit failures → skip competitor, continue.
 *   - Narration failure → deterministic template fallback.
 *   - Client site-audit failure → gap_list falls back to impact_fallback mode.
 */
export async function assembleFreeScanV2(
  input: AssembleFreeScanV2Input,
  deps: AssembleFreeScanV2Deps,
): Promise<ScanV2Result> {
  const { identity, queries, engines } = input;
  const now = deps.now ?? (() => new Date().toISOString());
  const sentimentModel = deps.models?.sentiment ?? DEFAULT_SENTIMENT_MODEL;
  const narrationModel = deps.models?.narration ?? DEFAULT_NARRATION_MODEL;

  // ── STAGE 2: Neutral engine probe ─────────────────────────────────────────
  //
  // For each engine × query:
  //   (a) Build neutral probe (identity-free)
  //   (b) Assert no leak (fail-closed on ProbeLeakError)
  //   (c) Call the engine via deps.probe
  //   (d) Code-extract client detection + competitors + shape
  //
  // Engine failures are caught per-engine. If an engine throws, it is marked
  // failed and we continue. ProbeLeakError is NOT caught — it propagates.
  //
  // observationsByEngine accumulates per-(engine, query) observations.
  // engineFailures tracks which engines had at least one hard failure.

  const observationsByEngine: Partial<
    Record<'chatgpt' | 'gemini' | 'perplexity', EngineProbeObservation[]>
  > = {};

  const engineFailures = new Set<string>();

  for (const engine of engines) {
    observationsByEngine[engine] = [];

    for (const query of queries) {
      // (a) Build neutral probe — identity-free
      const probe = buildNeutralProbe(query);

      // (b) Leak gate — FAIL CLOSED: propagates ProbeLeakError
      // This is the one exception we DO NOT catch — measurement validity is paramount.
      assertProbeClean(probe, identity);

      // (c) Call the engine
      let rawResult: { text: string; citations?: string[]; retrieval_mode: 'live_web' | 'parametric_memory' };
      try {
        rawResult = await deps.probe(engine, DEFAULT_PROBE_MODEL, probe);
      } catch (err) {
        // Per-engine/per-query failure: log and mark engine as failed.
        // We continue — other engines may succeed.
        console.error('[scan/assemble-v2] Engine probe failed', {
          engine,
          query: query.query_text.slice(0, 80),
          error: err instanceof Error ? err.message : String(err),
        });
        engineFailures.add(engine);
        continue;
      }

      // (d) Code extraction — ALL deterministic, no LLM
      const detection = detectClient(rawResult.text, identity);
      const competitors = extractCompetitors(rawResult.text, identity);
      const shape = classifyShape(rawResult.text, detection, competitors);

      const observation: EngineProbeObservation = {
        engine,
        retrieval_mode: rawResult.retrieval_mode,
        raw_response: rawResult.text,
        detection,
        competitors,
        shape,
        citations: rawResult.citations,
      };

      observationsByEngine[engine]!.push(observation);
    }

    // If an engine had failures on ALL queries, no observations were added.
    // Keep the (possibly empty) array in observationsByEngine so downstream
    // code handles it gracefully (empty obs → band with n=0, low_confidence).
  }

  // ── Engine success count ───────────────────────────────────────────────────
  //
  // Count engines that produced at least one successful observation.
  // An engine with zero observations (all queries failed) is a failure.
  const successfulEngines = engines.filter(
    (e) => (observationsByEngine[e]?.length ?? 0) > 0,
  );
  const engineDegraded = successfulEngines.length < ENGINE_SUCCESS_THRESHOLD;

  // Flatten all observations for competitor selection and narration.
  const allObservations: EngineProbeObservation[] = engines.flatMap(
    (e) => observationsByEngine[e] ?? [],
  );

  // ── STAGE 3a: Sentiment judgment (per engine) ──────────────────────────────
  //
  // One LLM call per engine (over the mention_snippet evidence).
  // On failure: 'unknown' (honest fallback).

  const sentimentByEngine: Partial<
    Record<'chatgpt' | 'gemini' | 'perplexity', 'positive' | 'neutral' | 'negative' | 'unknown'>
  > = {};

  for (const engine of engines) {
    const obs = observationsByEngine[engine] ?? [];
    // Find the first observation with a mention_snippet for sentiment judging.
    const firstMentioned = obs.find((o) => o.detection.mention_snippet !== null);

    if (!firstMentioned?.detection.mention_snippet) {
      sentimentByEngine[engine] = 'unknown';
    } else {
      const judgeResult = await judgeSentiment(
        firstMentioned.detection.mention_snippet,
        identity,
        {
          call: deps.sentimentCall,
          model: sentimentModel,
        },
      );
      sentimentByEngine[engine] = judgeResult.sentiment;
    }
  }

  // ── STAGE 3b: Score each engine ───────────────────────────────────────────
  //
  // scoreEngine = computeDimensions + computeBand. All code, no LLM.
  // Per-engine subscores are the unit of truth.

  const engineSubscores = engines.map((engine) => {
    const obs = observationsByEngine[engine] ?? [];
    const sentiment = sentimentByEngine[engine] ?? 'unknown';
    return scoreEngine(engine, obs, identity, sentiment);
  });

  // ── headline_band = medianAcrossEngines (LABELED secondary) ───────────────
  //
  // The median engine's point is the headline. We preserve the Band from the
  // median engine for full ci_low/ci_high fidelity — not a recomputed CI.
  //
  // If no subscores (all engines failed), produce a zero-confidence Band.

  let headlineBand = engineSubscores[0]?.band ?? {
    point: 0,
    ci_low: 0,
    ci_high: 100,
    sample_n: 0,
    low_confidence: true,
  };

  if (engineSubscores.length > 0) {
    const medianPoint = medianAcrossEngines(engineSubscores);
    // Find the engine whose band.point is closest to the median (use it verbatim).
    const medianEngine = engineSubscores.reduce((closest, curr) =>
      Math.abs(curr.band.point - medianPoint) < Math.abs(closest.band.point - medianPoint)
        ? curr
        : closest,
    );
    headlineBand = medianEngine.band;
  }

  // ── STAGE 3c: Client site audit + factor detection ────────────────────────
  //
  // Audit the client's own site for factor gaps.
  // On failure: buildGapList with empty observations → all factors are 'unknown' →
  // only absent factors become gaps → result is empty gap list (honest: no data).
  // Narration will use impact_fallback mode.

  let clientObservations: import('./factor-detection').FactorObservation[] = [];
  try {
    const clientSiteAudit = await deps.auditSite(input.ctx.website_url);
    clientObservations = await deps.detectFactors({ siteAudit: clientSiteAudit });
  } catch (err) {
    console.error('[scan/assemble-v2] Client site audit failed — gap list will be empty', {
      url: input.ctx.website_url,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  // ── Load factor catalog ────────────────────────────────────────────────────
  let catalog: import('./factor-catalog').FactorCatalogRow[] = [];
  try {
    catalog = await deps.loadCatalog();
  } catch (err) {
    console.error('[scan/assemble-v2] Failed to load factor catalog — gap list will be empty', {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  const clientGapList = buildGapList(clientObservations, catalog);

  // ── Competitor selection + auditing ───────────────────────────────────────
  //
  // selectTopCompetitors: aggregates by frequency across all engine observations.
  // auditCompetitors: injects site audit + factor detection for each competitor.
  // Errors per-competitor are swallowed (skip that competitor, continue).

  const topCompetitors = selectTopCompetitors(allObservations, identity, 3);

  let competitorAudits: import('./gap-types').CompetitorFactorAudit[] = [];
  let competitorDegraded = false;
  try {
    competitorAudits = await auditCompetitors(
      topCompetitors,
      {
        auditSite: deps.auditSite,
        detectFactors: deps.detectFactors,
        resolveDomain: deps.resolveCompetitorDomain,
      },
      3,
    );
  } catch (err) {
    // auditCompetitors itself never throws (all errors are per-competitor),
    // but guard defensively.
    console.error('[scan/assemble-v2] Competitor audit unexpectedly threw — continuing without', {
      error: err instanceof Error ? err.message : String(err),
    });
    competitorDegraded = true;
  }

  // ── Build contrastive gap list + playbooks ─────────────────────────────────
  const gapList = buildContrastiveGapList(clientGapList, competitorAudits);
  const playbooks = mapGapsToPlaybooks(gapList);

  // ── STAGE 4: Evidence-bound narration ─────────────────────────────────────
  //
  // One LLM call. On failure: deterministic template fallback.
  // NEVER throws. narration.degraded=true when fallback is used.

  const narrationResult = await narrate(
    {
      rankedGaps: gapList,
      subscores: engineSubscores,
      observations: allObservations,
      businessName: identity.business_name,
    },
    {
      call: deps.narrationCall,
      model: narrationModel,
    },
  );

  // ── Assemble meta ─────────────────────────────────────────────────────────
  const degraded = engineDegraded || competitorDegraded || narrationResult.degraded;

  const result: ScanV2Result = {
    engine_subscores: engineSubscores,
    headline_band: headlineBand,
    gap_list: gapList,
    playbooks,
    competitors: competitorAudits,
    narration: narrationResult,
    meta: {
      run_kind: 'free',
      generated_at: now(),
      model_ids: {
        sentiment: sentimentModel,
        narration: narrationModel,
      },
      degraded,
    },
  };

  return result;
}

// Re-export key types for consumers that want a single import point.
export type { ScanV2Result, AssembleFreeScanV2Input, AssembleFreeScanV2Deps } from './scan-v2-types';
export { ProbeLeakError } from './probe';

// Re-export detectFactors for Worker 2 to use without a separate import.
export { detectFactors as detectFactorsForWorker2 } from './factor-detection';
