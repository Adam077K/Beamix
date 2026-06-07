/**
 * Beamix Free Scan — Stage 2: Engine Queries
 *
 * Queries three AI engines via OpenRouter to determine GEO visibility.
 * Prompts are IDENTICAL across engines to ensure comparability.
 *
 * --- Flag: SCAN_LIVE_RETRIEVAL ---
 *
 * When SCAN_LIVE_RETRIEVAL=true (flag ON), the engine map switches to
 * free-tier "Option A" live-retrieval models:
 *
 *   perplexity → perplexity/sonar        (native live retrieval, no per-request plugin fee)
 *   chatgpt    → openai/gpt-4o-mini      (proxy via OpenRouter web_search plugin)
 *   gemini     → google/gemini-2.5-flash (parametric — not in Option A this wave;
 *                                         see GEMINI DECISION below)
 *
 * HONEST LABELING (hard rule): the chatgpt slot uses gpt-4o-mini + web plugin, which
 * is a PROXY for ChatGPT search, NOT the production ChatGPT search product.
 * This is encoded in provider_note and in the comment below. Never assert it IS ChatGPT.
 *
 * GEMINI DECISION (Wave 1): Gemini is kept parametric (no plugin) in Option A because:
 *   (a) OpenRouter's web plugin is model-agnostic (Exa-backed) and adds per-request cost
 *       with uncertain quality on Gemini vs Google's own grounding API.
 *   (b) gemini-2.5-flash does not natively ground; enabling the plugin would be a proxy
 *       rather than Gemini's actual search-grounded mode.
 *   (c) Scope limit: only perplexity (native) and chatgpt (proxy+plugin) are in Option A.
 *   Revisit in Wave 2 when Google AI Search Grounding API (Vertex) is evaluated.
 *
 * Flag OFF (default): engine map and request bodies are byte-identical to prior
 * implementation. retrieval_mode is still populated correctly from existing models.
 *
 * Models (approved — verified 2026-06-07):
 *   chatgpt    → openai/gpt-4o             (flag OFF) / openai/gpt-4o-mini+web (flag ON)
 *   gemini     → google/gemini-2.5-flash   (both states — parametric)
 *   perplexity → perplexity/sonar          (both states — live_web; native citations flag ON)
 */

import { callOpenRouter } from './openrouter-client';
import { buildEnginePrompt, parseEngineResult } from './prompts';
import type { BusinessContext, EngineRawResult, ScanInput } from './types';

type Engine = EngineRawResult['engine'];

// ---------------------------------------------------------------------------
// Flag OFF (default) — byte-identical to prior implementation
// ---------------------------------------------------------------------------

const ENGINE_MODELS: Record<Engine, string> = {
  chatgpt: 'openai/gpt-4o',
  gemini: 'google/gemini-2.5-flash',
  perplexity: 'perplexity/sonar',
};

/**
 * retrieval_mode for each engine under flag OFF state.
 * perplexity/sonar performs live web retrieval by default (it is Perplexity's
 * online model). chatgpt and gemini answer from parametric/training memory.
 */
const RETRIEVAL_MODE_FLAG_OFF: Record<Engine, EngineRawResult['retrieval_mode']> = {
  chatgpt: 'parametric_memory',
  gemini: 'parametric_memory',
  perplexity: 'live_web',
};

// ---------------------------------------------------------------------------
// Flag ON — Option A: free-tier live-retrieval engine map
// ---------------------------------------------------------------------------

/**
 * Engine model strings for Option A (SCAN_LIVE_RETRIEVAL=true).
 *
 * chatgpt: openai/gpt-4o-mini — used WITH the web_search plugin (web:true).
 *   HONEST LABELING: this is a PROXY for ChatGPT search using gpt-4o-mini +
 *   OpenRouter's Exa-backed web retrieval. It is NOT production ChatGPT search.
 *   provider_note encodes this transparently.
 *
 * gemini: google/gemini-2.5-flash — kept parametric (no plugin) this wave.
 *   See GEMINI DECISION in file header.
 *
 * perplexity: perplexity/sonar — native live retrieval, no plugin needed.
 *   Citations are available via the native top-level citations field.
 */
const ENGINE_MODELS_LIVE: Record<Engine, string> = {
  chatgpt: 'openai/gpt-4o-mini',
  gemini: 'google/gemini-2.5-flash',
  perplexity: 'perplexity/sonar',
};

const RETRIEVAL_MODE_FLAG_ON: Record<Engine, EngineRawResult['retrieval_mode']> = {
  chatgpt: 'live_web',
  gemini: 'parametric_memory',
  perplexity: 'live_web',
};

// ---------------------------------------------------------------------------
// Flag resolver
// ---------------------------------------------------------------------------

/** Returns true when SCAN_LIVE_RETRIEVAL env var is exactly 'true'. */
function isLiveRetrievalEnabled(): boolean {
  return process.env['SCAN_LIVE_RETRIEVAL'] === 'true';
}

// ---------------------------------------------------------------------------
// Engine query
// ---------------------------------------------------------------------------

/**
 * Stage 2: Query a single AI engine for GEO visibility of the business.
 *
 * When SCAN_LIVE_RETRIEVAL=true:
 *   - chatgpt uses gpt-4o-mini + web_search plugin (proxy, not production ChatGPT).
 *   - perplexity uses sonar with native citations surfaced via sourceUrls.
 *   - gemini remains parametric (see GEMINI DECISION in file header).
 *
 * When SCAN_LIVE_RETRIEVAL is unset/false/anything else:
 *   - Uses existing ENGINE_MODELS map with byte-identical request bodies.
 *   - retrieval_mode is still set correctly per engine.
 *
 * @param engine - Which engine to query
 * @param ctx - Business context from Stage 1
 * @param input - Scan input (scan_id, business_name, website_url, domain)
 */
export async function queryEngine(
  engine: Engine,
  ctx: BusinessContext,
  input: ScanInput,
): Promise<EngineRawResult> {
  const live = isLiveRetrievalEnabled();

  const model = live ? ENGINE_MODELS_LIVE[engine] : ENGINE_MODELS[engine];
  const retrievalMode = live ? RETRIEVAL_MODE_FLAG_ON[engine] : RETRIEVAL_MODE_FLAG_OFF[engine];

  // Only chatgpt under flag ON gets the web_search plugin.
  // perplexity/sonar grounds natively — no plugin needed (and adding it would
  // double-charge for retrieval). gemini stays parametric this wave.
  const useWebPlugin = live && engine === 'chatgpt';

  const { system, user } = buildEnginePrompt(ctx, input);

  console.log('[scan/engine] Querying engine', {
    scan_id: input.scan_id,
    engine,
    model,
    retrieval_mode: retrievalMode,
    web_plugin: useWebPlugin,
    business_name: input.business_name,
  });

  const response = await callOpenRouter({
    model,
    systemPrompt: system,
    userPrompt: user,
    maxTokens: 1_000,
    temperature: 0.2,
    ...(useWebPlugin ? { web: true, webMaxResults: 5 } : {}),
  });

  console.log('[scan/engine] Engine query complete', {
    scan_id: input.scan_id,
    engine,
    prompt_tokens: response.prompt_tokens,
    completion_tokens: response.completion_tokens,
    source_url_count: response.sourceUrls.length,
  });

  // parseEngineResult defaults retrieval_mode to 'parametric_memory'; override here.
  const parsed = parseEngineResult(response.text, engine);

  const result: EngineRawResult = {
    ...parsed,
    retrieval_mode: retrievalMode,
    // Plumb citations through additively. Wave 2 consumers process them.
    ...(response.sourceUrls.length > 0 ? { citations: response.sourceUrls } : {}),
    // Honest provider labeling for the chatgpt proxy slot under flag ON.
    // IMPORTANT: gpt-4o-mini + web plugin is NOT production ChatGPT search.
    ...(live && engine === 'chatgpt'
      ? { provider_note: 'proxy:gpt-4o-mini+web' }
      : {}),
  };

  return result;
}
