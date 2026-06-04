/**
 * Beamix — approval-gate-writer Inngest Function
 *
 * Consumes `gated_publish.requested` and drives the approval-gate-writer agent,
 * which drafts the approval card and inserts a row into `approval_queue`.
 *
 * Architecture:
 *   - Concurrency keyed on customerId (limit 1): prevents two gated drafts for the
 *     same customer racing on approval_queue inserts.
 *   - retries: 2 — covers transient LLM 429/529 and Supabase blips.
 *   - emitCostAlert + emitApprovalCreated collect pending sends; step.sendEvent is
 *     called at the top level (outside step.run) since step.* cannot nest.
 *
 * Per docs/04-features/specs/agent-approval-gate-writer.md.
 */

import { inngest } from '../client';
import {
  runApprovalGateWriter,
  mapArtifactToKind,
} from '../../lib/agents/approval-gate-writer/index';
import type { ArtifactType } from '../../lib/agents/approval-gate-writer/types';

/** Collected by dep callbacks during the agent run — flushed after step.run completes. */
interface PendingEvent {
  kind: 'cost.alert' | 'approval.created';
  payload: Record<string, unknown>;
}

export const approvalGateWriter = inngest.createFunction(
  {
    id: 'approval-gate-writer',
    retries: 2,
    // One in-flight run per customer — prevents racing approval_queue inserts.
    concurrency: { key: 'event.data.customerId', limit: 1 },
  },
  { event: 'gated_publish.requested' },
  async ({ event, step }) => {
    const data = event.data;

    // ── Step 1: Run the approval-gate-writer agent ────────────────────────
    // Dep callbacks accumulate pending events; step.sendEvent is called outside
    // step.run because Inngest does not support nested step.* calls.
    const pendingEvents: PendingEvent[] = [];

    const outcome = await step.run('run-approval-gate-writer', async () => {
      return runApprovalGateWriter(data, {
        emitCostAlert: (payload) => {
          pendingEvents.push({
            kind: 'cost.alert',
            payload: {
              customerId: payload.customerId,
              feature: payload.feature,
              costUsd: payload.costUsd,
            },
          });
        },
        emitApprovalCreated: (payload) => {
          // Map the agent's richer payload to the canonical ApprovalCreatedData shape.
          pendingEvents.push({
            kind: 'approval.created',
            payload: {
              approvalId: payload.approvalQueueId,
              kind: mapArtifactToKind(payload.artifactType as ArtifactType),
              customerId: payload.customerId,
              createdAt: new Date().toISOString(),
            },
          });
        },
      });
    });

    // ── Step 2: Flush downstream events ──────────────────────────────────
    for (const pending of pendingEvents) {
      if (pending.kind === 'cost.alert') {
        await step.sendEvent('emit-cost-alert', {
          name: 'cost.alert',
          data: pending.payload as { customerId: string; feature: string; costUsd: number },
        });
      } else if (pending.kind === 'approval.created') {
        await step.sendEvent('emit-approval-created', {
          name: 'approval.created',
          data: pending.payload as {
            approvalId: string;
            kind: string;
            customerId: string;
            createdAt: string;
          },
        });
      }
    }

    return {
      customerId: data.customerId,
      artifactId: data.artifactId,
      outcome,
    };
  },
);
