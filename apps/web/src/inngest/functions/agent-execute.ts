/**
 * Beamix — Agent Execute Inngest Function
 *
 * Consumes `agent/run.requested` and drives one agent job through the 5-step pipeline
 * via `runAgentPipeline()`. The orchestrator owns every cross-cutting concern — credit
 * hold/confirm/release, daily-cap, page-locks, persistence — so this function is a thin
 * wrapper: it translates the event payload into an `AgentJobInput`, runs the pipeline,
 * and lets typed errors propagate.
 *
 * Concurrency: keyed on `businessId` so two jobs for the SAME business never run in
 * parallel (they would contend on page-locks and the topic ledger). Jobs for different
 * businesses run concurrently up to the global `limit`.
 *
 * Per `12-AGENT-BUILD-SPEC.md` §Integration Points — `src/inngest/functions/agent-execute.ts`.
 */

import { NonRetriableError } from 'inngest';
import { inngest } from '../client';
import { runAgentPipeline } from '../../lib/agents';
import {
  CapExceededError,
  InsufficientCreditsError,
  QAFailedError,
  UnsafeInputError,
} from '../../lib/agents/errors';
import { OverTierCapError } from '../../lib/billing/deliverables';
import type { AgentJobInput } from '../../lib/agents/types';

/**
 * `agent-execute` — runs one agent pipeline per `agent/run.requested` event.
 *
 * `retries: 2` covers transient provider failures (the LLM runner also retries 429/529
 * internally). Deterministic failures — cap exceeded, insufficient credits, unsafe
 * input, QA fail after retry — are re-thrown as `NonRetriableError` so Inngest does not
 * burn retries on a job that will never succeed.
 */
export const agentExecute = inngest.createFunction(
  {
    id: 'agent-execute',
    retries: 2,
    // One in-flight job per business — prevents page-lock / topic-ledger contention.
    concurrency: { key: 'event.data.businessId', limit: 1 },
  },
  { event: 'agent/run.requested' },
  async ({ event, step }) => {
    const data = event.data;

    const input: AgentJobInput = {
      jobId: data.jobId,
      agentType: data.agentType,
      userId: data.userId,
      businessId: data.businessId,
      planTier: data.planTier,
      targetUrl: data.targetUrl,
      targetContent: data.targetContent,
      queryCluster: data.queryCluster,
      customInstructions: data.customInstructions,
      scanId: data.scanId,
    };

    const result = await step.run('run-agent-pipeline', async () => {
      try {
        const output = await runAgentPipeline(input);
        return {
          jobId: output.jobId,
          status: 'succeeded' as const,
          totalCostUsd: output.totalCostUsd,
          durationMs: output.durationMs,
        };
      } catch (err) {
        // Deterministic failures must not be retried — the pipeline has already
        // marked the `agent_jobs` row terminally failed.
        if (
          err instanceof CapExceededError ||
          err instanceof InsufficientCreditsError ||
          err instanceof UnsafeInputError ||
          err instanceof QAFailedError ||
          err instanceof OverTierCapError
        ) {
          throw new NonRetriableError(err.message, { cause: err });
        }
        // Transient / unknown failures propagate so Inngest retries.
        throw err;
      }
    });

    return result;
  },
);
