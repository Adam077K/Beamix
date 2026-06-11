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
import type { FactorObservation } from './factor-detection';
import type { FactorCatalogRow } from './factor-catalog';
import type { CompetitorFactorAudit } from './gap-types';

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
  // PARALLELIZATION SEMANTICS:
  //   Engines run in parallel via Promise.all for ~2/3 wall-clock reduction.
  //   Two distinct failure modes are handled differently:
  //
  //   1. ProbeLeakError (HARD FAILURE — fail-closed):
  //      ProbeLeakError is re-thrown OUT of the per-engine async function.
  //      Promise.all sees a rejection and immediately rejects the whole batch.
  //      This is the DESIRED behavior: measurement validity > scan completion.
  //      The error propagates to the caller (assembleFreeScanV2), which propagates
  //      it to Inngest, which marks the scan failed. No partial result is returned.
  //
  //   2. Per-engine probe error (SOFT FAILURE — degrade, don't abort):
  //      Non-ProbeLeakError errors from deps.probe() are caught INSIDE the per-engine
  //      async function (inside the try/catch below). The engine is marked as failed
  //      (added to engineFailures) and an empty observations array is returned for it.
  //      Promise.all sees a RESOLVED value (the empty array), so a single engine's
  //      soft failure does NOT reject the whole batch. Other engines proceed normally.
  //      The ≥2/3 degraded threshold is checked after all engines complete.
  //
  //   Results are assembled in stable engine order (the `engines` array order) regardless
  //   of resolution order — the `.map()` preserves the original engine position.
  //
  // engineFailures tracks which engines had at least one hard failure (used by meta.degraded).

  const observationsByEngine: Partial<
    Record<'chatgpt' | 'gemini' | 'perplexity', EngineProbeObservation[]>
  > = {};

  const engineFailures = new Set<string>();

  // Pre-build all probes synchronously (assertProbeClean is synchronous and must
  // run before any async call so a leak causes an immediate ProbeLeakError before
  // we've dispatched any network requests).
  const probePlans: Array<{
    engine: 'chatgpt' | 'gemini' | 'perplexity';
    query: typeof queries[number];
    probe: ReturnType<typeof buildNeutralProbe>;
  }> = [];

  for (const engine of engines) {
    for (const query of queries) {
      const probe = buildNeutralProbe(query);
      // Leak gate — FAIL CLOSED: ProbeLeakError propagates immediately.
      // Do NOT catch this — it must abort the scan.
      assertProbeClean(probe, identity);
      probePlans.push({ engine, query, probe });
    }
  }

  // Initialize empty observation arrays for each engine (stable order, regardless of resolution).
  for (const engine of engines) {
    observationsByEngine[engine] = [];
  }

  /**
   * Run all probes for a single engine in sequence (queries within an engine
   * are sequential — typically there is only 1 query per free scan).
   * Returns the observations array for this engine.
   *
   * Per-engine soft errors are caught HERE so Promise.all sees a resolved value
   * (the possibly-empty observations array) for that engine, not a rejection.
   * ProbeLeakError rethrows out so Promise.all propagates it as a rejection.
   */
  async function probeEngine(
    engine: 'chatgpt' | 'gemini' | 'perplexity',
  ): Promise<EngineProbeObservation[]> {
    const engineObservations: EngineProbeObservation[] = [];
    const enginePlans = probePlans.filter((p) => p.engine === engine);

    for (const { query, probe } of enginePlans) {
      let rawResult: { text: string; citations?: string[]; retrieval_mode: 'live_web' | 'parametric_memory' };
      try {
        rawResult = await deps.probe(engine, DEFAULT_PROBE_MODEL, probe);
      } catch (err) {
        // ProbeLeakError: rethrow — fail-closed; Promise.all will propagate it.
        if (err instanceof Error && err.name === 'ProbeLeakError') {
          throw err;
        }
        // Other errors: soft failure — log and mark engine as failed.
        console.error('[scan/assemble-v2] Engine probe failed', {
          engine,
          query: query.query_text.slice(0, 80),
          error: err instanceof Error ? err.message : String(err),
        });
        engineFailures.add(engine);
        // Return what we have so far (possibly empty) — Promise.all stays resolved.
        return engineObservations;
      }

      // Code extraction — ALL deterministic, no LLM
      const detection = detectClient(rawResult.text, identity);
      const competitors = extractCompetitors(rawResult.text, identity);
      const shape = classifyShape(rawResult.text, detection, competitors);

      engineObservations.push({
        engine,
        retrieval_mode: rawResult.retrieval_mode,
        raw_response: rawResult.text,
        detection,
        competitors,
        shape,
        citations: rawResult.citations,
      });
    }

    return engineObservations;
  }

  // Run all engines in parallel. ProbeLeakError rejects the whole batch (fail-closed).
  // Per-engine soft failures resolve to an empty array (graceful degradation).
  // Results are captured in stable engine order via Promise.all(engines.map(...)).
  const parallelResults = await Promise.all(engines.map(probeEngine));

  for (let i = 0; i < engines.length; i++) {
    const engine = engines[i]!;
    observationsByEngine[engine] = parallelResults[i]!;
    // If no observations were accumulated, mark the engine as failed
    // (covers the case where all queries for an engine soft-failed but
    // engineFailures.add() was already called inside probeEngine).
  }

  // ── Engine success count ───────────────────────────────────────────────────
  //
  // Count engines that produced at least one successful observation.
  // An engine with zero observations (all queries failed) is a failure.
  // engineFailures (populated by probeEngine on soft per-engine errors) is a
  // superset indicator: it marks engines that had at least one query failure.
  // An engine in engineFailures with no observations = fully failed.
  // An engine in engineFailures with some observations = partially recovered.
  //
  // successfulEngines (observation count) is the authoritative threshold source.
  // engineFailures is read here to log partial-failure warnings and is the natural
  // source for future diagnostic metadata (it is NOT dead code).
  const successfulEngines = engines.filter(
    (e) => (observationsByEngine[e]?.length ?? 0) > 0,
  );
  const engineDegraded = successfulEngines.length < ENGINE_SUCCESS_THRESHOLD;

  if (engineFailures.size > 0) {
    // At least one engine had a soft failure. Log for observability.
    // The scan may still be non-degraded if other engines met the threshold.
    console.error('[scan/assemble-v2] Engine probe soft failures', {
      failed_engines: Array.from(engineFailures),
      successful_count: successfulEngines.length,
      threshold: ENGINE_SUCCESS_THRESHOLD,
      degraded: engineDegraded,
    });
  }

  // Flatten all observations for competitor selection and narration.
  const allObservations: EngineProbeObservation[] = engines.flatMap(
    (e) => observationsByEngine[e] ?? [],
  );

  // ── STAGE 3a: Sentiment judgment (per engine) ──────────────────────────────
  //
  // One LLM call per engine (over the mention_snippet evidence).
  // On failure: 'unknown' (honest fallback).
  //
  // PARALLELIZATION SEMANTICS (same rules as engine probes):
  //   - All sentiment calls run concurrently via Promise.all for ~2/3 wall-clock reduction.
  //   - Per-engine judgment errors are caught inside the mapped async function and resolve to
  //     'unknown' — so a single engine's LLM failure does NOT reject the whole batch.
  //   - Results are assembled in stable engine order (engines.map preserves order).

  const sentimentResults = await Promise.all(
    engines.map(async (engine) => {
      const obs = observationsByEngine[engine] ?? [];
      const firstMentioned = obs.find((o) => o.detection.mention_snippet !== null);

      if (!firstMentioned?.detection.mention_snippet) {
        return { engine, sentiment: 'unknown' as const };
      }

      try {
        const judgeResult = await judgeSentiment(
          firstMentioned.detection.mention_snippet,
          identity,
          {
            call: deps.sentimentCall,
            model: sentimentModel,
          },
        );
        return { engine, sentiment: judgeResult.sentiment };
      } catch (err) {
        console.error('[scan/assemble-v2] Sentiment judgment failed — defaulting to unknown', {
          engine,
          error: err instanceof Error ? err.message : String(err),
        });
        return { engine, sentiment: 'unknown' as const };
      }
    }),
  );

  const sentimentByEngine: Partial<
    Record<'chatgpt' | 'gemini' | 'perplexity', 'positive' | 'neutral' | 'negative' | 'unknown'>
  > = {};

  for (const { engine, sentiment } of sentimentResults) {
    sentimentByEngine[engine] = sentiment;
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

  let clientObservations: FactorObservation[] = [];
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
  let catalog: FactorCatalogRow[] = [];
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

  let competitorAudits: CompetitorFactorAudit[] = [];
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
