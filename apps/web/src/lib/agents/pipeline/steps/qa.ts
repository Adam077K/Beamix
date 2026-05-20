/**
 * Beamix Agent System — Pipeline Step 4: QA
 *
 * Validates the DO-step deliverable against the GEO signal checklist (statistics,
 * citations, expert quotes, freshness, local context), checks YMYL risk, and decides
 * pass / fail. For Content Optimizer, Authority Blog Strategist, and FAQ Builder it
 * additionally runs a Perplexity Sonar citation-verification probe — an independent
 * second LLM call that checks the cited claims against live sources.
 *
 * Per `12-AGENT-BUILD-SPEC.md` §Pipeline Architecture — `steps/qa.ts`.
 */

import { runLLMWithRetry } from '../../llm/runner';
import {
  resolveModel,
  CITATION_VERIFICATION_MODEL,
  CITATION_VERIFICATION_AGENTS,
} from '../../config/models';
import { getStagePrompt } from '../../config/prompts';
import type {
  AgentPipelineContext,
  CitationVerificationResult,
  GEOSignalChecklist,
  QAResult,
} from '../../types';
import { emptyGeoSignals, extractJson, joinSections, type StepState } from './shared';

/** Raw JSON shape the QA prompt instructs the model to return. */
interface QAJson {
  passed?: boolean;
  geoSignals?: Partial<GEOSignalChecklist>;
  ymylFlagged?: boolean;
  issues?: string[];
  retryRecommended?: boolean;
}

/** Raw JSON shape the Sonar citation-verification probe is instructed to return. */
interface CitationJson {
  verified?: boolean;
  unverifiedClaims?: string[];
  checkedClaimCount?: number;
}

/** Coerce a partial GEO checklist from the model into a fully-populated one. */
function normalizeGeoSignals(partial: Partial<GEOSignalChecklist> | undefined): GEOSignalChecklist {
  const base = emptyGeoSignals();
  if (!partial) return base;
  return {
    hasStatistics: partial.hasStatistics === true,
    hasCitations: partial.hasCitations === true,
    hasExpertQuotes: partial.hasExpertQuotes === true,
    hasFreshData: partial.hasFreshData === true,
    hasLocalContext: partial.hasLocalContext === true,
  };
}

/**
 * The Sonar citation-verification probe. Asks Perplexity Sonar to corroborate the cited
 * statistics and quotes in the deliverable against live web sources. Returns the
 * verification result, or a conservative `verified: false` if the probe output cannot
 * be parsed. Costs one `CostEntry` (appended to `state`).
 */
async function runCitationVerification(
  ctx: AgentPipelineContext,
  state: StepState,
  deliverable: string,
): Promise<CitationVerificationResult> {
  const systemPrompt = [
    'You are a citation-verification analyst. You are given a piece of marketing or',
    'editorial content. Using live web search, check whether the statistics, studies,',
    'and expert quotes cited in the content correspond to real, locatable sources.',
    'Do not evaluate writing quality — only the truthfulness of the cited evidence.',
    'Respond with strict JSON: {"verified": boolean, "unverifiedClaims": string[],',
    '"checkedClaimCount": number}. "verified" is true only if every checked claim was',
    'corroborated. List each claim you could not corroborate in "unverifiedClaims".',
  ].join('\n');

  const userPrompt = [
    'Verify the cited evidence in the following content:',
    '',
    deliverable,
  ].join('\n');

  const result = await runLLMWithRetry({
    agentType: ctx.input.agentType,
    stage: 'qa',
    jobId: ctx.input.jobId,
    model: CITATION_VERIFICATION_MODEL,
    systemPrompt,
    userPrompt,
  });
  state.costEntries.push(result.costEntry);

  const parsed = extractJson<CitationJson>(result.text);
  if (!parsed) {
    return { verified: false, unverifiedClaims: ['citation probe output unparseable'], checkedClaimCount: 0 };
  }
  return {
    verified: parsed.verified === true,
    unverifiedClaims: Array.isArray(parsed.unverifiedClaims) ? parsed.unverifiedClaims : [],
    checkedClaimCount: typeof parsed.checkedClaimCount === 'number' ? parsed.checkedClaimCount : 0,
  };
}

/**
 * Run the QA step against the current `state.doOutput`. Returns a `QAResult`. Appends
 * one `CostEntry` for the QA LLM call, plus a second for the Sonar citation probe when
 * the agent is in `CITATION_VERIFICATION_AGENTS`.
 */
export async function runQAStep(
  ctx: AgentPipelineContext,
  state: StepState,
): Promise<QAResult> {
  const deliverable = state.doOutput ?? '';
  const prompt = getStagePrompt(ctx.input.agentType, 'qa');
  const model = resolveModel(ctx.input.agentType, 'qa');

  const userPrompt = joinSections(prompt.instruction, 'DELIVERABLE TO REVIEW:', deliverable);

  const result = await runLLMWithRetry({
    agentType: ctx.input.agentType,
    stage: 'qa',
    jobId: ctx.input.jobId,
    model,
    systemPrompt: prompt.system,
    userPrompt,
  });
  state.costEntries.push(result.costEntry);

  const parsed = extractJson<QAJson>(result.text);
  // Unparseable QA output is treated as a fail with a retry recommendation — the
  // pipeline must never pass content it could not verify.
  if (!parsed) {
    return {
      passed: false,
      geoSignals: emptyGeoSignals(),
      ymylFlagged: ctx.business.ymylCategory,
      issues: ['QA output could not be parsed as JSON'],
      retryRecommended: true,
    };
  }

  const geoSignals = normalizeGeoSignals(parsed.geoSignals);
  const issues = Array.isArray(parsed.issues) ? parsed.issues : [];
  let passed = parsed.passed === true;
  let retryRecommended = parsed.retryRecommended === true;

  // Citation verification — independent Sonar probe for content-publishing agents.
  let citationVerification: CitationVerificationResult | undefined;
  if (CITATION_VERIFICATION_AGENTS.has(ctx.input.agentType) && deliverable.trim().length > 0) {
    citationVerification = await runCitationVerification(ctx, state, deliverable);
    if (!citationVerification.verified) {
      // Unverified citations are a hard QA fail — fabricated evidence cannot ship.
      passed = false;
      retryRecommended = true;
      issues.push(
        ...citationVerification.unverifiedClaims.map(
          (claim) => `Unverified citation: ${claim}`,
        ),
      );
    }
  }

  return {
    passed,
    geoSignals,
    ymylFlagged: parsed.ymylFlagged === true || ctx.business.ymylCategory,
    issues,
    retryRecommended,
    citationVerification,
  };
}
