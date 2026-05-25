/**
 * Beamix Agent System — Pipeline Step 3: DO
 *
 * Generates the primary deliverable — a page rewrite, FAQ page, strategy document,
 * schema block, etc. This is the step whose output becomes `AgentJobOutput.primaryContent`.
 * The DO step also runs once more on a QA-recommended retry (see the runner).
 *
 * Per `12-AGENT-BUILD-SPEC.md` §Pipeline Architecture — `steps/do.ts`.
 */

import { runLLMWithRetry } from '../../llm/runner';
import { resolveModel } from '../../config/models';
import { getStagePrompt } from '../../config/prompts';
import type { AgentPipelineContext, QAResult } from '../../types';
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
 * Run the DO step. Reads `state.planOutput` and `state.researchOutput`, writes
 * `state.doOutput`, and appends one `CostEntry`.
 *
 * @param priorQa When set, this is a QA-driven retry — the prior QA `issues` are
 *                injected so the model can correct the specific failures.
 */
export async function runDoStep(
  ctx: AgentPipelineContext,
  state: StepState,
  priorQa?: QAResult,
): Promise<void> {
  const prompt = getStagePrompt(ctx.input.agentType, 'do');
  const model = resolveModel(ctx.input.agentType, 'do');

  const planSection = state.planOutput
    ? ['APPROVED PLAN:', state.planOutput].join('\n')
    : '';
  const researchSection = state.researchOutput
    ? ['RESEARCH EVIDENCE (cite from this — every statistic and quote must be real):', state.researchOutput].join(
        '\n',
      )
    : '';
  const retrySection = priorQa
    ? [
        'QA REJECTED THE PREVIOUS DRAFT. Fix every issue below before producing this revision:',
        ...priorQa.issues.map((i) => `- ${i}`),
      ].join('\n')
    : '';

  const userPrompt = joinSections(
    prompt.instruction,
    renderBusinessBlock(ctx.business),
    renderScanBlock(ctx.scanData),
    renderTargetUrl(ctx),
    renderTargetContent(ctx),
    renderQueryCluster(ctx),
    planSection,
    researchSection,
    renderCustomInstructions(ctx),
    renderYmylBlock(ctx),
    retrySection,
  );

  const result = await runLLMWithRetry({
    agentType: ctx.input.agentType,
    stage: 'do',
    jobId: ctx.input.jobId,
    model,
    systemPrompt: prompt.system,
    userPrompt,
  });

  state.doOutput = result.text;
  state.costEntries.push(result.costEntry);
}
