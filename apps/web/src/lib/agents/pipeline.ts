/**
 * pipeline.ts — 5-step agent pipeline orchestrator.
 *
 * Orchestrates: daily-cap check -> credit hold -> page lock -> step loop
 * (plan / research / do / qa / summarize) -> credit confirm -> cap increment.
 *
 * Each step calls the LLM router. The cost circuit breaker is checked before
 * every step to abort early if spend is running away.
 *
 * Per-agent prompt construction lives outside this file (in prompts/).
 * This module is the control-flow skeleton.
 */

import type {
  AgentJobInput,
  AgentJobOutput,
  AgentPipelineContext,
  CostEntry,
  GEOSignalChecklist,
  PipelineStep,
  QAResult,
} from './types';
import { AGENT_REGISTRY } from './config';
import { callLLM } from '@/lib/llm/router';
import { costCircuitBreaker, sanitizeUserInput } from './security';
import { acquirePageLock, releasePageLock } from './coordination';
import { checkDailyCap, incrementDailyCap } from './daily-cap';
import { holdCredits, confirmCredits, releaseCredits } from './credit-guard';

// ─── Helpers ──────────────────────────────────────────────────────────────

const EMPTY_GEO_SIGNALS: GEOSignalChecklist = {
  hasStatistics: false,
  hasCitations: false,
  hasExpertQuotes: false,
  hasFreshData: false,
  hasLocalContext: false,
};

function buildSkippedOutput(
  input: AgentJobInput,
  reason: string,
  costLog: CostEntry[],
): AgentJobOutput {
  return {
    jobId: input.jobId,
    agentType: input.agentType,
    primaryContent: '',
    contentFormat: 'plain_text',
    summaryText: reason,
    targetQueries: [],
    geoSignals: EMPTY_GEO_SIGNALS,
    ymylFlagged: false,
    ymylRefused: false,
    estimatedImpact: 'low',
    costEntries: costLog,
    totalCostUsd: costLog.reduce((s, c) => s + c.costUsd, 0),
    durationMs: 0,
  };
}

// ─── Main pipeline ────────────────────────────────────────────────────────

export async function runPipeline(
  ctx: AgentPipelineContext,
): Promise<AgentJobOutput> {
  const { input, config, plan, user, budget } = ctx;
  const cfg = config ?? AGENT_REGISTRY[input.agentType];
  const costLog: CostEntry[] = [];
  const startMs = Date.now();

  // 1. Daily cap gate
  const cap = await checkDailyCap(user.userId, input.agentType, plan);
  if (!cap.allowed) {
    return buildSkippedOutput(
      input,
      `daily cap reached (${cap.cap})`,
      costLog,
    );
  }

  // 2. Credit hold
  const heldResult = await holdCredits(
    user.userId,
    input.agentType,
    input.jobId,
    cfg.creditCost,
  );
  if (!heldResult.held) {
    return buildSkippedOutput(
      input,
      heldResult.reason ?? 'credit hold failed',
      costLog,
    );
  }

  // 3. Page lock (optional)
  let lockedUrl: string | null = null;
  if (input.targetUrl && cfg.requiresPageLock) {
    const locked = await acquirePageLock(
      input.targetUrl,
      input.agentType,
      input.jobId,
    );
    if (!locked) {
      await releaseCredits(input.jobId);
      return buildSkippedOutput(
        input,
        'page locked by another agent',
        costLog,
      );
    }
    lockedUrl = input.targetUrl;
  }

  // 4. Step loop
  try {
    const steps = cfg.steps;
    let stepPayload: string = JSON.stringify({
      ...input,
      customInstructions: input.customInstructions
        ? sanitizeUserInput(input.customInstructions)
        : undefined,
    });
    let qaResult: QAResult | null = null;
    let primaryContent = '';

    for (const step of steps) {
      // Cost circuit breaker — check before every step
      const runningCost = costLog.reduce((s, c) => s + c.costUsd, 0);
      const cb = costCircuitBreaker(runningCost, plan);
      if (cb.abort) {
        await releaseCredits(input.jobId);
        return {
          ...buildSkippedOutput(input, cb.reason ?? 'cost breaker tripped', costLog),
          durationMs: Date.now() - startMs,
        };
      }

      const model = cfg.stepModels[step];
      if (!model) continue; // step not configured for this agent

      // Call LLM. Per-step prompt construction is intentionally thin here —
      // production prompts will be loaded from prompts/[agentType]/[step].ts
      const res = await callLLM({
        model,
        messages: [
          {
            role: 'system' as const,
            content: `Pipeline step: ${step}. Agent: ${input.agentType}. Business: ${input.businessId}.`,
            cache: true,
          },
          { role: 'user' as const, content: stepPayload },
        ],
        step,
        jobId: input.jobId,
      });

      costLog.push(res.costEntry);
      stepPayload = res.content;

      if (step === 'do') {
        primaryContent = res.content;
      }

      if (step === 'qa') {
        // TODO: Parse structured QA response from LLM output
        qaResult = {
          pass: true,
          issues: [],
          geoSignals: EMPTY_GEO_SIGNALS,
          ymylFlagged: false,
          citationsVerified: [],
          retryRecommended: false,
          costEntries: [res.costEntry],
        };
      }
    }

    // 5. Confirm credits + increment daily cap
    await confirmCredits(input.jobId);
    await incrementDailyCap(user.userId, input.agentType);

    const totalCostUsd = costLog.reduce((s, c) => s + c.costUsd, 0);

    return {
      jobId: input.jobId,
      agentType: input.agentType,
      primaryContent,
      contentFormat: 'markdown',
      summaryText: stepPayload, // last step output (summarize) becomes summary
      targetQueries: input.queryCluster ?? [],
      geoSignals: qaResult?.geoSignals ?? EMPTY_GEO_SIGNALS,
      ymylFlagged: qaResult?.ymylFlagged ?? false,
      ymylRefused: false,
      estimatedImpact: 'medium',
      costEntries: costLog,
      totalCostUsd,
      durationMs: Date.now() - startMs,
    };
  } catch (err) {
    await releaseCredits(input.jobId);
    throw err;
  } finally {
    if (lockedUrl) await releasePageLock(lockedUrl);
  }
}
