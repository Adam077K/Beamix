/**
 * Beamix Agent System — Pipeline Orchestrator
 *
 * `runAgentPipeline()` runs the full agent pipeline: PLAN → RESEARCH → DO → QA →
 * SUMMARIZE for 5-step agents, PLAN → DO → QA for free 3-step agents. It owns the
 * cross-cutting concerns the individual steps must not:
 *
 *   - Credit hold / confirm / release (paid agents).
 *   - Daily-cap check / increment (free agents).
 *   - Page-lock acquire before DO, released in a `finally` so it ALWAYS frees.
 *   - Topic-ledger registration after a successful topic-producing run.
 *   - One QA-driven DO retry, then a hard `QAFailedError`.
 *   - Persistence: `agent_jobs` status transitions, `agent_costs` rows,
 *     `agent_job_outputs`, and the `inbox_items` draft.
 *
 * Per `12-AGENT-BUILD-SPEC.md` §Pipeline Architecture — `pipeline/runner.ts`.
 */

import { getAdminClient } from '../db/admin-client';
import { holdCredits, confirmCredits, releaseCredits } from '../credits/guard';
import { checkDailyCap, incrementDailyCap } from '../credits/daily-cap';
import { lockPage, unlockPage } from '../coordination/page-locks';
import { registerTopic } from '../coordination/topic-ledger';
import { AgentError, QAFailedError, PageLockedError } from '../errors';
import type { AgentJobInput, AgentJobOutput, AgentType, CostEntry, PipelineStage, QAResult } from '../types';
import { buildPipelineContext } from './context';
import { newStepState, type StepState } from './steps/shared';
import { runPlanStep } from './steps/plan';
import { runResearchStep } from './steps/research';
import { runDoStep } from './steps/do';
import { runQAStep } from './steps/qa';
import { runSummarizeStep, type SummaryResult } from './steps/summarize';

/** Map the agent's deliverable to the `agent_job_outputs.content_format` value. */
function resolveContentFormat(agentType: AgentType): AgentJobOutput['contentFormat'] {
  switch (agentType) {
    case 'schema_generator':
      return 'json_ld';
    case 'performance_tracker':
    case 'query_mapper':
      return 'structured_report';
    default:
      return 'markdown';
  }
}

/** Sum the USD cost across every LLM call made during the run. */
function totalCost(entries: CostEntry[]): number {
  const sum = entries.reduce((acc, e) => acc + e.costUsd, 0);
  return Math.round(sum * 1_000_000) / 1_000_000;
}

/** Transition the `agent_jobs` row to a new stage + status. */
async function updateJobStage(
  jobId: string,
  status: 'running' | 'qa_failed' | 'succeeded' | 'failed',
  stage: PipelineStage,
): Promise<void> {
  await getAdminClient()
    .from('agent_jobs')
    .update({ status, stage, updated_at: new Date().toISOString() })
    .eq('id', jobId);
}

/** Mark the `agent_jobs` row terminally failed with an error message. */
async function markJobFailed(jobId: string, message: string): Promise<void> {
  await getAdminClient()
    .from('agent_jobs')
    .update({
      status: 'failed',
      error_message: message.slice(0, 2000),
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId);
}

/** Persist one `agent_costs` row per LLM call made during the run. */
async function persistCosts(
  jobId: string,
  userId: string,
  entries: CostEntry[],
): Promise<void> {
  if (entries.length === 0) return;
  const rows = entries.map((e) => ({
    job_id: jobId,
    user_id: userId,
    stage: e.stage,
    model: e.model,
    provider: e.provider,
    prompt_tokens: e.promptTokens,
    completion_tokens: e.completionTokens,
    cost_usd: e.costUsd,
  }));
  const { error } = await getAdminClient().from('agent_costs').insert(rows);
  if (error) {
    // Cost rows are observability, not correctness — log and continue.
    console.error(`agent_costs insert failed for job ${jobId}: ${error.message}`);
  }
}

/**
 * Persist the deliverable to `agent_job_outputs` and create the `inbox_items` draft.
 * The two writes are sequential — the inbox row references the job, not the output row.
 */
async function persistOutput(
  output: AgentJobOutput,
  summary: SummaryResult,
  businessId: string,
  userId: string,
): Promise<void> {
  const client = getAdminClient();

  const { error: outputError } = await client.from('agent_job_outputs').insert({
    job_id: output.jobId,
    primary_content: output.primaryContent,
    content_format: output.contentFormat,
    summary_text: output.summaryText,
    target_queries: output.targetQueries,
    // `geo_signals` is a `Json` column — the flat boolean checklist serializes directly.
    geo_signals: { ...output.geoSignals },
    estimated_impact: output.estimatedImpact,
    ymyl_flagged: output.ymylFlagged,
  });
  if (outputError) {
    throw new Error(`agent_job_outputs insert failed for job ${output.jobId}: ${outputError.message}`);
  }

  const { error: inboxError } = await client.from('inbox_items').insert({
    user_id: userId,
    business_id: businessId,
    job_id: output.jobId,
    agent_type: output.agentType,
    status: 'draft',
    title: summary.triggerReason.slice(0, 200),
    preview_text: summary.summaryText.slice(0, 500),
  });
  if (inboxError) {
    throw new Error(`inbox_items insert failed for job ${output.jobId}: ${inboxError.message}`);
  }
}

/**
 * Run the full agent pipeline for one job. Returns the assembled `AgentJobOutput`.
 *
 * Failure handling:
 *   - Any thrown error releases held credits and the page lock, marks the job failed,
 *     persists whatever cost rows accrued, and re-throws.
 *   - A QA fail triggers exactly one DO retry; a second QA fail throws `QAFailedError`.
 *
 * The page lock is acquired before DO and released in a `finally` block that runs on
 * every exit path — success, QA failure, or any thrown error.
 */
export async function runAgentPipeline(input: AgentJobInput): Promise<AgentJobOutput> {
  const startedAt = Date.now();
  const state: StepState = newStepState();

  const ctx = await buildPipelineContext(input);
  const { config, business } = ctx;

  // Free agents are gated by the daily cap; paid agents by the credit pool.
  // Both checks throw (`CapExceededError` / `InsufficientCreditsError`) before any
  // LLM call is made, so a rejected job costs nothing.
  if (config.isFree) {
    await checkDailyCap(input.userId, input.agentType, input.planTier, input.jobId);
  } else {
    await holdCredits(input.userId, input.agentType, input.jobId);
    ctx.holdId = input.jobId;
  }

  const lockUrl = config.requiresPageLock ? input.targetUrl : undefined;
  let pageLocked = false;

  try {
    await updateJobStage(input.jobId, 'running', 'plan');
    await getAdminClient()
      .from('agent_jobs')
      .update({ started_at: new Date().toISOString() })
      .eq('id', input.jobId);

    // ---- PLAN -------------------------------------------------------------
    await runPlanStep(ctx, state);

    // ---- RESEARCH (5-step agents only) -----------------------------------
    if (config.stages.includes('research')) {
      await updateJobStage(input.jobId, 'running', 'research');
      await runResearchStep(ctx, state);
    }

    // ---- Page lock — acquired before DO, released in `finally` -----------
    if (lockUrl) {
      pageLocked = await lockPage(lockUrl, input.jobId, business.businessId, input.agentType);
      if (!pageLocked) {
        throw new PageLockedError(input.agentType, input.jobId, lockUrl);
      }
    }

    // ---- DO + QA (one retry on QA fail) ----------------------------------
    await updateJobStage(input.jobId, 'running', 'do');
    await runDoStep(ctx, state);

    await updateJobStage(input.jobId, 'running', 'qa');
    let qa: QAResult = await runQAStep(ctx, state);

    if (!qa.passed && qa.retryRecommended) {
      // Single retry — re-run DO with the QA issues injected, then re-QA.
      await updateJobStage(input.jobId, 'running', 'do');
      await runDoStep(ctx, state, qa);
      await updateJobStage(input.jobId, 'running', 'qa');
      qa = await runQAStep(ctx, state);
    }

    if (!qa.passed) {
      await updateJobStage(input.jobId, 'qa_failed', 'qa');
      throw new QAFailedError(input.agentType, input.jobId, qa);
    }

    // ---- SUMMARIZE -------------------------------------------------------
    if (config.stages.includes('summarize')) {
      await updateJobStage(input.jobId, 'running', 'summarize');
    }
    const summary: SummaryResult = await runSummarizeStep(ctx, state);

    // ---- Assemble output -------------------------------------------------
    const output: AgentJobOutput = {
      jobId: input.jobId,
      agentType: input.agentType,
      primaryContent: state.doOutput ?? '',
      contentFormat: resolveContentFormat(input.agentType),
      summaryText: summary.summaryText,
      targetQueries: summary.targetQueries,
      geoSignals: qa.geoSignals,
      ymylFlagged: qa.ymylFlagged,
      estimatedImpact: summary.estimatedImpact,
      costEntries: state.costEntries,
      totalCostUsd: totalCost(state.costEntries),
      durationMs: Date.now() - startedAt,
    };

    // ---- Persist + finalize ----------------------------------------------
    await persistCosts(input.jobId, input.userId, state.costEntries);
    await persistOutput(output, summary, business.businessId, input.userId);

    // Topic-producing agents register their topic so siblings avoid duplication.
    if (config.requiresTopicLedger) {
      await registerTopic(business.businessId, summary.triggerReason, input.agentType, input.jobId);
    }

    if (config.isFree) {
      await incrementDailyCap(input.userId, input.agentType, input.planTier);
    } else {
      await confirmCredits(input.jobId, input.agentType);
    }

    await getAdminClient()
      .from('agent_jobs')
      .update({
        status: 'succeeded',
        stage: 'summarize',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.jobId);

    return output;
  } catch (err) {
    // Release credits for paid agents — the run did not complete.
    if (!config.isFree) {
      await releaseCredits(input.jobId, input.agentType).catch(() => undefined);
    }
    // Persist whatever cost rows accrued before the failure for accurate accounting.
    await persistCosts(input.jobId, input.userId, state.costEntries).catch(() => undefined);

    const message = err instanceof Error ? err.message : 'unknown pipeline error';
    if (err instanceof QAFailedError) {
      // The QA-fail status was already written; only set the error message.
      await getAdminClient()
        .from('agent_jobs')
        .update({
          error_message: `QA failed: ${qaIssuesSummary(err)}`,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.jobId)
        .then(() => undefined, () => undefined);
    } else {
      await markJobFailed(input.jobId, message).catch(() => undefined);
    }
    throw err;
  } finally {
    // The page lock ALWAYS releases — success, QA failure, or thrown error.
    if (lockUrl && pageLocked) {
      await unlockPage(lockUrl, input.jobId).catch(() => undefined);
    }
  }
}

/** Compact, log-safe summary of QA issues for the `agent_jobs.error_message` column. */
function qaIssuesSummary(err: QAFailedError): string {
  return err.qaResult.issues.slice(0, 5).join('; ').slice(0, 1500);
}

/** Re-thrown as-is so callers can branch on the typed error hierarchy. */
export { AgentError };
