/**
 * Beamix Free Scan — Stage 1: Perplexity Research
 *
 * Queries the online Perplexity model via OpenRouter to gather structured
 * business context before running the three-engine GEO queries.
 *
 * Model: perplexity/llama-3.1-sonar-large-128k-online
 * This is an online model — it searches the web in real-time.
 */

import { callOpenRouter } from './openrouter-client';
import { buildResearchPrompt, parseBusinessContext } from './prompts';
import type { BusinessContext, ScanInput } from './types';

const RESEARCH_MODEL = 'perplexity/llama-3.1-sonar-large-128k-online';

/**
 * Minimal fallback BusinessContext when research fails.
 * Allows the pipeline to continue with reduced quality rather than abort.
 */
function minimalContext(input: ScanInput): BusinessContext {
  return {
    business_name: input.business_name,
    website_url: input.website_url,
    business_summary: '',
    key_services: [],
    target_audience: '',
    category: 'business',
    location: 'global',
  };
}

/**
 * Stage 1: Research the business using Perplexity's online model.
 * Returns a structured BusinessContext for use in Stage 2 engine queries.
 *
 * Never throws — on any failure (network, API error, parse error), returns a
 * minimal context derived from scan input so the pipeline can continue.
 */
export async function researchBusiness(input: ScanInput): Promise<BusinessContext> {
  const { system, user } = buildResearchPrompt(input);

  console.log('[scan/research] Starting business research', {
    scan_id: input.scan_id,
    business_name: input.business_name,
    model: RESEARCH_MODEL,
  });

  let response: { text: string; prompt_tokens: number; completion_tokens: number };
  try {
    response = await callOpenRouter({
      model: RESEARCH_MODEL,
      systemPrompt: system,
      userPrompt: user,
      maxTokens: 800,
      temperature: 0.1,
    });
  } catch (err) {
    console.error('[scan/research] Research call failed — using minimal context fallback', {
      scan_id: input.scan_id,
      error: err instanceof Error ? err.message : String(err),
    });
    return minimalContext(input);
  }

  console.log('[scan/research] Research complete', {
    scan_id: input.scan_id,
    prompt_tokens: response.prompt_tokens,
    completion_tokens: response.completion_tokens,
  });

  return parseBusinessContext(response.text, input);
}
