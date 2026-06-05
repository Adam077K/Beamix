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
 * Stage 1: Research the business using Perplexity's online model.
 * Returns a structured BusinessContext for use in Stage 2 engine queries.
 *
 * Never throws — on failure, returns a minimal context derived from scan input.
 */
export async function researchBusiness(input: ScanInput): Promise<BusinessContext> {
  const { system, user } = buildResearchPrompt(input);

  console.log('[scan/research] Starting business research', {
    scan_id: input.scan_id,
    business_name: input.business_name,
    model: RESEARCH_MODEL,
  });

  const response = await callOpenRouter({
    model: RESEARCH_MODEL,
    systemPrompt: system,
    userPrompt: user,
    maxTokens: 800,
    temperature: 0.1,
  });

  console.log('[scan/research] Research complete', {
    scan_id: input.scan_id,
    prompt_tokens: response.prompt_tokens,
    completion_tokens: response.completion_tokens,
  });

  return parseBusinessContext(response.text, input);
}
