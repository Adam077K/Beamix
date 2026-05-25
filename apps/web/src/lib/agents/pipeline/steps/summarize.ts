/**
 * Beamix Agent System — Pipeline Step 5: SUMMARIZE
 *
 * Compresses the verified DO-step deliverable into the Inbox-card metadata:
 * `summaryText`, `triggerReason`, `targetQueries`, and `estimatedImpact`. Only runs for
 * agents whose registry `stages` includes `summarize` (5-step agents). 3-step agents
 * skip this step and the runner derives the metadata directly.
 *
 * Per `12-AGENT-BUILD-SPEC.md` §Pipeline Architecture — `steps/summarize.ts`.
 */

import { runLLMWithRetry } from '../../llm/runner';
import { resolveModel } from '../../config/models';
import { getStagePrompt } from '../../config/prompts';
import type { AgentPipelineContext } from '../../types';
import { extractJson, joinSections, type StepState } from './shared';

/** The structured Inbox-card metadata produced by the SUMMARIZE step. */
export interface SummaryResult {
  summaryText: string;
  triggerReason: string;
  targetQueries: string[];
  estimatedImpact: 'low' | 'medium' | 'high';
}

/** Raw JSON shape the SUMMARIZE prompt instructs the model to return. */
interface SummaryJson {
  summaryText?: string;
  triggerReason?: string;
  targetQueries?: string[];
  estimatedImpact?: string;
}

/** Coerce a free-form impact string to the strict `low | medium | high` union. */
function normalizeImpact(raw: string | undefined): 'low' | 'medium' | 'high' {
  return raw === 'high' || raw === 'medium' ? raw : 'low';
}

/**
 * Build a deterministic fallback summary for 3-step agents (no SUMMARIZE prompt) or
 * when the SUMMARIZE LLM output cannot be parsed. Derives `targetQueries` from the job
 * input's query cluster.
 */
export function fallbackSummary(ctx: AgentPipelineContext): SummaryResult {
  return {
    summaryText: `${ctx.config.displayName} produced a new deliverable for ${ctx.business.name}. Review it before publishing.`,
    triggerReason: `${ctx.config.displayName} run requested for ${ctx.business.name}.`,
    targetQueries: ctx.input.queryCluster ?? [],
    estimatedImpact: 'medium',
  };
}

/**
 * Run the SUMMARIZE step. Returns the Inbox-card metadata and appends one `CostEntry`.
 * For agents that do not run a summarize stage, returns `fallbackSummary()` without an
 * LLM call.
 */
export async function runSummarizeStep(
  ctx: AgentPipelineContext,
  state: StepState,
): Promise<SummaryResult> {
  if (!ctx.config.stages.includes('summarize')) {
    return fallbackSummary(ctx);
  }

  const prompt = getStagePrompt(ctx.input.agentType, 'summarize');
  const model = resolveModel(ctx.input.agentType, 'summarize');
  const deliverable = state.doOutput ?? '';

  const userPrompt = joinSections(prompt.instruction, 'COMPLETED DELIVERABLE:', deliverable);

  const result = await runLLMWithRetry({
    agentType: ctx.input.agentType,
    stage: 'summarize',
    jobId: ctx.input.jobId,
    model,
    systemPrompt: prompt.system,
    userPrompt,
  });
  state.costEntries.push(result.costEntry);

  const parsed = extractJson<SummaryJson>(result.text);
  if (!parsed) {
    return fallbackSummary(ctx);
  }

  return {
    summaryText: parsed.summaryText?.trim() || fallbackSummary(ctx).summaryText,
    triggerReason: parsed.triggerReason?.trim() || fallbackSummary(ctx).triggerReason,
    targetQueries: Array.isArray(parsed.targetQueries)
      ? parsed.targetQueries
      : (ctx.input.queryCluster ?? []),
    estimatedImpact: normalizeImpact(parsed.estimatedImpact),
  };
}
