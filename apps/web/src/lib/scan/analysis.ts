/**
 * Beamix Free Scan — Stage 3: Gemini Flash Analysis
 *
 * Reads all three engine results and produces a structured AnalysisResult
 * via Gemini Flash (google/gemini-2.5-flash — approved model, verified 2026-06-07).
 *
 * Returns FreeScanResults — the exact shape written to free_scans.results JSONB.
 */

import { callOpenRouter } from './openrouter-client';
import { buildAnalysisPrompt, parseAnalysisResult } from './prompts';
import type { BusinessContext, EngineRawResult, FreeScanResults } from './types';

const ANALYSIS_MODEL = 'google/gemini-2.5-flash';

/**
 * Stage 3: Analyse the three engine results and produce a FreeScanResults blob.
 *
 * @param results - Raw results from Stage 2 (all three engines)
 * @param ctx - Business context from Stage 1
 * @param scanId - For logging
 */
export async function analyse(
  results: EngineRawResult[],
  ctx: BusinessContext,
  scanId: string,
): Promise<FreeScanResults> {
  const { system, user } = buildAnalysisPrompt(results, ctx);

  console.log('[scan/analysis] Starting analysis', {
    scan_id: scanId,
    engines: results.map((r) => r.engine),
    mentioned_count: results.filter((r) => r.is_mentioned).length,
    model: ANALYSIS_MODEL,
  });

  const response = await callOpenRouter({
    model: ANALYSIS_MODEL,
    systemPrompt: system,
    userPrompt: user,
    maxTokens: 1_000,
    temperature: 0.1,
  });

  console.log('[scan/analysis] Analysis complete', {
    scan_id: scanId,
    prompt_tokens: response.prompt_tokens,
    completion_tokens: response.completion_tokens,
  });

  const parsed = parseAnalysisResult(response.text);

  return {
    issues: parsed.issues,
    // total_issues is always computed from ground truth — never trust LLM value
    total_issues: parsed.total_issues,
    engines_checked: 3,
    visibility_score: parsed.overall_score,
  };
}
