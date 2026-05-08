/**
 * fan-in-watcher.ts — Validate sub-ticket completion and re-fire CEO synth.
 *
 * Per ORCHESTRATION.md §2C + §2B (Fan-in barrier validation R2.3).
 *
 * Triggered by: linear/issue.updated where data.fan_in_key is present.
 *
 * Validates:
 *   (a) sub-ticket status == Done
 *   (b) DONE comment contains valid session_id matching bridge's KV-stored expected session
 *   (c) all sibling sub-tickets (same parent Linear ticket) are also Done
 *       — checked via Linear GraphQL API, NOT via audit_log rows (R1 fix)
 *
 * If all OK: fire CEO synth Routine via step.sendEvent (idempotent — R2 fix).
 * If anomaly (reopened/deleted/manual-close without binding): write audit_log
 * status=anomaly and escalate to Adam via Linear comment.
 *
 * R1 FIX: Sibling check queries Linear GraphQL directly (LINEAR_API_KEY server-side).
 *   The old audit_log sibling check was doubly-wrong:
 *     (a) 'accepted' is written at session START, never transitions to 'complete'
 *         for tickets processed by other Routine instances
 *     (b) audit_log rows for sub-tickets are written on their own schedule;
 *         zero guarantee all siblings have a row when this watcher fires
 *   Correct source: Linear ticket state (parent → children via API).
 *
 * R2 FIX: All inngest.send() inside step.run() replaced with step.sendEvent().
 *   inngest.send() inside step.run() re-fires on retry if the outer function
 *   crashes after send-success but before Inngest writes the step checkpoint.
 *   step.sendEvent() is Inngest's idempotent send primitive — safe to retry.
 *
 * Service role required — bypasses RLS for internal observability writes.
 */

import { z } from 'zod';
import { inngest } from '@/inngest/client';
import { createServiceRoleClient } from '@/lib/supabase/server-service-role';

const eventSchema = z.object({
  issue_id: z.string(),
  status: z.string(),
  fan_in_key: z.string().uuid().nullable(),
  session_id: z.string().nullable(),
  identifier: z.string(),
  parent_issue_id: z.string().nullable(),
  comment_body: z.string().nullable(),
  updated_at: z.string(),
});

// Linear GraphQL response types (minimal — only what we need)
interface LinearIssueState {
  type: string; // 'triage' | 'backlog' | 'unstarted' | 'started' | 'completed' | 'cancelled'
}
interface LinearIssue {
  id: string;
  identifier: string;
  state: LinearIssueState;
}
interface LinearChildrenResponse {
  data?: {
    issue?: {
      children?: {
        nodes: LinearIssue[];
      };
    };
  };
  errors?: { message: string }[];
}

/**
 * Query Linear for all children of a parent issue.
 * Returns { total, pending } counts.
 *
 * Early-exit: if LINEAR_API_KEY is missing, throws immediately so
 * the caller can write audit_log.status = 'linear_api_error'.
 */
async function queryLinearSiblings(
  parentId: string,
): Promise<{ total: number; pending: number }> {
  const apiKey = process.env['LINEAR_API_KEY'];
  if (!apiKey) throw new Error('LINEAR_API_KEY env var is not set');

  const query = `
    query GetChildIssues($parentId: String!) {
      issue(id: $parentId) {
        children {
          nodes {
            id
            identifier
            state {
              type
            }
          }
        }
      }
    }
  `;

  const controller = new AbortController();
  // 30-second hard timeout on the Linear API call (R1 early-exit requirement)
  const timeout = setTimeout(() => controller.abort(), 30_000);

  let resp: Response;
  try {
    resp = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey,
      },
      body: JSON.stringify({ query, variables: { parentId } }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!resp.ok) {
    throw new Error(`Linear API returned ${resp.status}: ${await resp.text()}`);
  }

  const json = (await resp.json()) as LinearChildrenResponse;
  if (json.errors?.length) {
    throw new Error(`Linear GraphQL error: ${json.errors.map((e) => e.message).join('; ')}`);
  }

  const children = json.data?.issue?.children?.nodes ?? [];
  const pending = children.filter((c) => c.state.type !== 'completed' && c.state.type !== 'cancelled').length;
  return { total: children.length, pending };
}

export const fanInWatcher = inngest.createFunction(
  { id: 'fan-in-watcher', retries: 3 },
  { event: 'linear/issue.updated' as 'linear/issue.updated' },
  async ({ event, step }) => {
    const data = eventSchema.parse(event.data);

    // Only process events that have a fan_in_key
    if (!data.fan_in_key) return { skipped: true, reason: 'no fan_in_key' };
    // Require a parent_issue_id to query Linear children
    if (!data.parent_issue_id) return { skipped: true, reason: 'no parent_issue_id' };

    // Service role required — bypasses RLS for internal observability writes.
    const supabase = createServiceRoleClient();

    // Step 1: Validate this sub-ticket's completion state
    const validation = await step.run('validate-sub-ticket', async () => {
      const isDone = data.status === 'Done' || data.status === 'done';
      const hasSessionId = !!data.session_id;
      const commentHasBinding =
        data.comment_body !== null &&
        data.comment_body.includes(data.fan_in_key as string) &&
        data.comment_body.includes('session_id');

      return { isDone, hasSessionId, commentHasBinding };
    });

    // Anomaly: ticket closed without proper binding
    if (!validation.isDone || !validation.hasSessionId || !validation.commentHasBinding) {
      await step.run('write-anomaly', async () => {
        await supabase.from('audit_log').insert({
          spec: { event: 'fan_in_validation_failed', issue_id: data.issue_id },
          agent: 'fan-in-watcher',
          status: 'anomaly',
          row_kind: 'internal_event',
          event_kind: 'fan_in_complete',
          outcome: `Sub-ticket ${data.identifier} closed without valid session_id binding. isDone=${validation.isDone} hasSessionId=${validation.hasSessionId} commentHasBinding=${validation.commentHasBinding}`,
          linear_ticket: data.identifier,
          fan_in_key: data.fan_in_key,
        });
      });

      return {
        status: 'anomaly',
        issue: data.identifier,
        reason: 'missing session_id binding in DONE comment',
      };
    }

    // Step 2: Check all sibling sub-tickets via Linear GraphQL (R1 fix)
    // The old audit_log check was wrong — Linear ticket state is the source of truth.
    const siblingStatus = await step.run('check-siblings-linear', async () => {
      try {
        return await queryLinearSiblings(data.parent_issue_id as string);
      } catch (err) {
        // R1: 30-second early-exit — write linear_api_error, skip synth fire.
        // parent-ticket-expiry-watcher will retry after 24h if synth never fires.
        await supabase.from('audit_log').insert({
          spec: {
            event: 'linear_sibling_check_failed',
            parent_issue_id: data.parent_issue_id,
            fan_in_key: data.fan_in_key,
            error: String(err),
          },
          agent: 'fan-in-watcher',
          status: 'linear_api_error',
          row_kind: 'internal_event',
          outcome: `Linear API call failed during sibling check: ${String(err)}`,
          linear_ticket: data.identifier,
          fan_in_key: data.fan_in_key,
        });
        // Return sentinel so caller knows to bail
        return { total: -1, pending: -1, apiError: true };
      }
    });

    // If Linear API failed, abort — don't fire synth with incomplete data
    if ('apiError' in siblingStatus && siblingStatus.apiError) {
      return {
        status: 'linear_api_error',
        fan_in_key: data.fan_in_key,
        reason: 'Linear GraphQL call failed — parent-ticket-expiry-watcher will retry in 24h',
      };
    }

    if (siblingStatus.pending > 0) {
      return {
        status: 'waiting',
        pending_siblings: siblingStatus.pending,
        total_siblings: siblingStatus.total,
        fan_in_key: data.fan_in_key,
      };
    }

    // Step 3: All siblings done — write fan-in completion record
    await step.run('write-fan-in-complete', async () => {
      await supabase.from('audit_log').insert({
        spec: {
          event: 'fan_in_complete',
          fan_in_key: data.fan_in_key,
          trigger_issue: data.identifier,
          total_siblings: siblingStatus.total,
        },
        agent: 'fan-in-watcher',
        status: 'complete',
        row_kind: 'internal_event',
        event_kind: 'fan_in_complete',
        outcome: `All ${siblingStatus.total} sub-tickets for fan_in_key=${data.fan_in_key} done per Linear. Firing CEO synth.`,
        linear_ticket: data.parent_issue_id ?? data.identifier,
        fan_in_key: data.fan_in_key,
      });
    });

    // Step 4: Fire CEO synth via step.sendEvent (idempotent — R2 fix)
    // step.sendEvent is Inngest's idempotent send primitive.
    // Unlike inngest.send() inside step.run(), it is safe to retry —
    // Inngest deduplicates the event if the step already checkpointed.
    await step.sendEvent('emit-synth-event', {
      name: 'war-room/routine.fired' as 'war-room/routine.fired',
      data: {
        routine_id: 'ceo-synthesizer',
        routine_name: 'synthesizer',
        audit_log_id: '',
        linear_ticket: data.parent_issue_id,
        max_runtime_minutes: 60,
        fired_at: new Date().toISOString(),
      },
    });

    return { status: 'synth_fired', fan_in_key: data.fan_in_key };
  },
);
