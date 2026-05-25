/**
 * Beamix Agent System — Pipeline Step 2: RESEARCH
 *
 * Pulls fresh, citable evidence — current statistics, credible sources, expert
 * commentary — via Perplexity Sonar. Only runs for agents whose registry `stages`
 * includes `research` (5-step agents). 3-step free agents skip this step entirely.
 *
 * Per `12-AGENT-BUILD-SPEC.md` §Pipeline Architecture — `steps/research.ts`.
 */

import { runLLMWithRetry } from '../../llm/runner';
import { resolveModel } from '../../config/models';
import { getStagePrompt } from '../../config/prompts';
import type { AgentPipelineContext } from '../../types';
import {
  joinSections,
  renderBusinessBlock,
  renderQueryCluster,
  renderScanBlock,
  renderTargetUrl,
  type StepState,
} from './shared';

/**
 * Run the RESEARCH step. Reads `state.planOutput` for direction, writes
 * `state.researchOutput`, and appends one `CostEntry`. Returns immediately (no-op) for
 * agents that do not run a research stage.
 */
export async function runResearchStep(
  ctx: AgentPipelineContext,
  state: StepState,
): Promise<void> {
  if (!ctx.config.stages.includes('research')) return;

  const prompt = getStagePrompt(ctx.input.agentType, 'research');
  const model = resolveModel(ctx.input.agentType, 'research');

  const planSection = state.planOutput
    ? ['APPROVED PLAN (research must support this plan):', state.planOutput].join('\n')
    : '';

  const userPrompt = joinSections(
    prompt.instruction,
    renderBusinessBlock(ctx.business),
    renderScanBlock(ctx.scanData),
    renderTargetUrl(ctx),
    renderQueryCluster(ctx),
    planSection,
  );

  const result = await runLLMWithRetry({
    agentType: ctx.input.agentType,
    stage: 'research',
    jobId: ctx.input.jobId,
    model,
    systemPrompt: prompt.system,
    userPrompt,
  });

  state.researchOutput = result.text;
  state.costEntries.push(result.costEntry);
}
