/**
 * agent-pipeline.ts — Inngest function stub for agent.run.requested events.
 *
 * Handles the queued job lifecycle. The real runPipeline() wiring lands in a
 * follow-up task once the full pipeline is ready.
 */

import { inngest } from '../client';

export const agentPipeline = inngest.createFunction(
  { id: 'agent-pipeline', retries: 2 },
  { event: 'agent.run.requested' },
  async ({ event, step }) => {
    const { jobId, userId, businessId, agentType } = event.data;

    // Stub pipeline — real runPipeline() wiring lands in a follow-up.
    // For now, just mark the job as "would run" and return.
    await step.run('would-run-pipeline', async () => ({
      jobId,
      userId,
      businessId,
      agentType,
      note: 'agent-pipeline stub — runPipeline() wiring pending',
    }));

    return { jobId, status: 'stubbed' };
  },
);
