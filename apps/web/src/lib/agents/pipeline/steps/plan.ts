/**
 * Beamix Agent System — Pipeline Step 1: PLAN
 *
 * Decomposes the agent task: identifies GEO weaknesses, maps target queries, and
 * selects a sub-strategy. For topic-producing agents (Authority Blog Strategist, FAQ
 * Builder) the covered-topics ledger is injected so the plan steers clear of duplicates.
 *
 * Per `12-AGENT-BUILD-SPEC.md` §Pipeline Architecture — `steps/plan.ts`.
 */

import { runLLMWithRetry } from '../../llm/runner';
import { resolveModel } from '../../config/models';
import { getStagePrompt } from '../../config/prompts';
import { getCoveredTopics } from '../../coordination/topic-ledger';
import type { AgentPipelineContext } from '../../types';
import {
  joinSections,
  renderBusinessBlock,
  renderCustomInstructions,
  renderQueryCluster,
  renderScanBlock,
  renderTargetContent,
  renderTargetUrl,
  renderYmylBlock,
  type StepState,
} from './shared';

/**
 * Run the PLAN step. Writes `state.planOutput` and appends one `CostEntry`. The plan
 * text is fed forward into RESEARCH and DO as the strategy the agent commits to.
 */
export async function runPlanStep(
  ctx: AgentPipelineContext,
  state: StepState,
): Promise<void> {
  const prompt = getStagePrompt(ctx.input.agentType, 'plan');
  const model = resolveModel(ctx.input.agentType, 'plan');

  let coveredBlock = '';
  if (ctx.config.requiresTopicLedger) {
    const covered = await getCoveredTopics(ctx.business.businessId);
    coveredBlock =
      covered.length > 0
        ? ['ALREADY-COVERED TOPICS (do not duplicate these):', ...covered.map((t) => `- ${t}`)].join(
            '\n',
          )
        : 'ALREADY-COVERED TOPICS: none yet — this is fresh ground.';
  }

  const userPrompt = joinSections(
    prompt.instruction,
    renderBusinessBlock(ctx.business),
    renderScanBlock(ctx.scanData),
    renderTargetUrl(ctx),
    renderTargetContent(ctx),
    renderQueryCluster(ctx),
    coveredBlock,
    renderCustomInstructions(ctx),
    renderYmylBlock(ctx),
  );

  const result = await runLLMWithRetry({
    agentType: ctx.input.agentType,
    stage: 'plan',
    jobId: ctx.input.jobId,
    model,
    systemPrompt: prompt.system,
    userPrompt,
  });

  state.planOutput = result.text;
  state.costEntries.push(result.costEntry);
}
