/**
 * Beamix Free Scan — Stage 2: Engine Queries
 *
 * Queries three AI engines via OpenRouter to determine GEO visibility.
 * Prompts are IDENTICAL across engines to ensure comparability.
 *
 * Models (approved):
 *   chatgpt    → openai/gpt-4o
 *   gemini     → google/gemini-2.0-flash  (updated from gemini-1.5-pro)
 *   perplexity → perplexity/llama-3.1-sonar-large-128k-online
 */

import { callOpenRouter } from './openrouter-client';
import { buildEnginePrompt, parseEngineResult } from './prompts';
import type { BusinessContext, EngineRawResult, ScanInput } from './types';

type Engine = EngineRawResult['engine'];

const ENGINE_MODELS: Record<Engine, string> = {
  chatgpt: 'openai/gpt-4o',
  gemini: 'google/gemini-2.0-flash',
  perplexity: 'perplexity/llama-3.1-sonar-large-128k-online',
};

/**
 * Stage 2: Query a single AI engine for GEO visibility of the business.
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
  const model = ENGINE_MODELS[engine];
  const { system, user } = buildEnginePrompt(ctx, input);

  console.log('[scan/engine] Querying engine', {
    scan_id: input.scan_id,
    engine,
    model,
    business_name: input.business_name,
  });

  const response = await callOpenRouter({
    model,
    systemPrompt: system,
    userPrompt: user,
    maxTokens: 1_000,
    temperature: 0.2,
  });

  console.log('[scan/engine] Engine query complete', {
    scan_id: input.scan_id,
    engine,
    prompt_tokens: response.prompt_tokens,
    completion_tokens: response.completion_tokens,
  });

  return parseEngineResult(response.text, engine);
}
