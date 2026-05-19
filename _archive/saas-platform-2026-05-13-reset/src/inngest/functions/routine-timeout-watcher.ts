/**
 * routine-timeout-watcher.ts — Detect stalled Routines and fire Auto-Unblock.
 *
 * Per ORCHESTRATION.md §2C.
 *
 * Triggered by: war-room/routine.fired event.
 * Sleeps for max_runtime_minutes. If the Routine hasn't written a
 * 'complete' / 'blocked' / 'over_budget' status to audit_log within
 * that window, fires Auto-Unblock and marks audit_log as 'timeout'.
 *
 * R2 FIX: inngest.send() inside step.run() replaced with step.sendEvent().
 *   Idempotent send — safe to retry without double-firing Auto-Unblock.
 *
 * R2 FIX: createServiceClient → createServiceRoleClient.
 *
 * Q5 LOCKED — Auto-Unblock cascade depth guard:
 *   Count cascade depth via parent_audit_log_id chain.
 *   If depth >= 3: write over_budget + fire Telegram incident alert.
 *   This is Adam-approved: 3× cascade = structural problem, not a cost spike.
 *   // Q5 EXCEPTION: Adam-approved incident escalation, NOT a cost alert.
 *
 * Service role required — bypasses RLS for internal observability writes.
 */

import { z } from 'zod';
import { inngest } from '@/inngest/client';
import { createServiceRoleClient } from '@/lib/supabase/server-service-role';

const eventSchema = z.object({
  routine_id: z.string(),
  routine_name: z.string(),
  audit_log_id: z.string(),
  linear_ticket: z.string().nullable(),
  max_runtime_minutes: z.number().int().positive(),
  fired_at: z.string(),
});

const TERMINAL_STATUSES = new Set([
  'complete',
  'blocked',
  'timeout',
  'over_budget',
  'anomaly',
  'rule_violation',
  'anthropic_error',
  'linear_api_error',
  'mem0_error',
]);

/** Maximum Auto-Unblock cascade depth before incident escalation (Q5 LOCKED). */
const MAX_UNBLOCK_CASCADE_DEPTH = 3;

/**
 * Walk the parent_audit_log_id chain to measure cascade depth.
 * Returns the number of ancestors found (0 = root-level row).
 * Stops at MAX_UNBLOCK_CASCADE_DEPTH + 1 to avoid unbounded queries.
 */
async function measureCascadeDepth(
  auditLogId: string,
  supabase: ReturnType<typeof createServiceRoleClient>,
): Promise<number> {
  let depth = 0;
  let currentId: string | null = auditLogId;

  while (depth <= MAX_UNBLOCK_CASCADE_DEPTH && currentId !== null) {
    const { data: row } = await supabase
      .from('audit_log')
      .select('parent_audit_log_id')
      .eq('id', currentId)
      .maybeSingle();

    currentId = row?.parent_audit_log_id ?? null;
    if (currentId !== null) depth++;
  }

  return depth;
}

export const routineTimeoutWatcher = inngest.createFunction(
  { id: 'routine-timeout-watcher', retries: 1 },
  { event: 'war-room/routine.fired' as 'war-room/routine.fired' },
  async ({ event, step }) => {
    const data = eventSchema.parse(event.data);

    // Sleep for the Routine's declared max runtime
    await step.sleep(`wait-${data.routine_id}`, `${data.max_runtime_minutes}m`);

    // Check if the Routine has completed
    const outcome = await step.run('check-completion', async () => {
      // Service role required — bypasses RLS for internal observability writes.
      const supabase = createServiceRoleClient();
      const { data: logRow, error } = await supabase
        .from('audit_log')
        .select('id, status')
        .eq('id', data.audit_log_id)
        .maybeSingle();

      if (error) throw new Error(`Supabase error: ${error.message}`);
      return logRow;
    });

    // If no row found or status is already terminal, nothing to do
    if (!outcome) return { skipped: true, reason: 'audit_log row not found' };
    if (TERMINAL_STATUSES.has(outcome.status)) {
      return { skipped: true, reason: `routine already in terminal status: ${outcome.status}` };
    }

    // Q5 LOCKED: Measure cascade depth before firing another Auto-Unblock
    const cascadeDepth = await step.run('measure-cascade-depth', async () => {
      // Service role required — bypasses RLS for internal observability writes.
      const supabase = createServiceRoleClient();
      return measureCascadeDepth(data.audit_log_id, supabase);
    });

    // Q5: If cascade depth >= 3, stop recursion and escalate to Adam
    if (cascadeDepth >= MAX_UNBLOCK_CASCADE_DEPTH) {
      await step.run('write-cascade-overflow', async () => {
        // Service role required — bypasses RLS for internal observability writes.
        const supabase = createServiceRoleClient();
        await supabase.from('audit_log').insert({
          spec: {
            event: 'auto_unblock_max_attempts',
            cascade_depth: cascadeDepth,
            root_audit_log_id: data.audit_log_id,
            routine: data.routine_name,
          },
          agent: 'routine-timeout-watcher',
          status: 'over_budget',
          row_kind: 'internal_event',
          event_kind: 'auto_unblock_max_attempts',
          outcome: `Auto-Unblock cascade depth ${cascadeDepth} >= ${MAX_UNBLOCK_CASCADE_DEPTH} under ${data.linear_ticket ?? data.routine_name}. Manual intervention required.`,
          linear_ticket: data.linear_ticket,
        });
      });

      // Q5 EXCEPTION: Adam-approved incident escalation, NOT a cost alert.
      // This is the only Telegram alert path in WS4 (all others are Q7-silent).
      // Fires only when Auto-Unblock has cascaded 3× — structural problem requiring
      // Adam's manual intervention. Approved by Adam on 2026-05-08.
      await step.run('telegram-cascade-escalation', async () => {
        const bridgeUrl = process.env['CLOUDFLARE_BRIDGE_URL'];
        if (!bridgeUrl) {
          // Bridge URL not configured — log only, don't throw
          console.error('[routine-timeout-watcher] CLOUDFLARE_BRIDGE_URL not set; cannot send Telegram escalation');
          return { sent: false, reason: 'CLOUDFLARE_BRIDGE_URL not set' };
        }

        const resp = await fetch(`${bridgeUrl}/telegram/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `🚨 Auto-Unblock cascaded 3× under ${data.linear_ticket ?? data.routine_name}. Manual intervention required.`,
            kind: 'incident_escalation', // Q5 EXCEPTION: incident, not cost alert
          }),
        });

        return { sent: resp.ok, http_status: resp.status };
      });

      return {
        status: 'cascade_overflow',
        routine: data.routine_name,
        cascade_depth: cascadeDepth,
        action: 'escalated_to_adam_via_telegram',
      };
    }

    // Routine timed out — write timeout status and fire Auto-Unblock
    await step.run('write-timeout', async () => {
      // Service role required — bypasses RLS for internal observability writes.
      const supabase = createServiceRoleClient();
      await supabase
        .from('audit_log')
        .update({
          status: 'timeout',
          outcome: `Routine ${data.routine_name} did not complete within ${data.max_runtime_minutes} minutes. Auto-Unblock fired.`,
        })
        .eq('id', data.audit_log_id);
    });

    // Fire Auto-Unblock Routine via step.sendEvent (idempotent — R2 fix)
    // step.sendEvent is Inngest's idempotent send primitive.
    // Unlike inngest.send() inside step.run(), it won't double-fire on retry.
    await step.sendEvent('fire-auto-unblock', {
      name: 'war-room/routine.fired' as 'war-room/routine.fired',
      data: {
        routine_id: 'auto-unblock',
        routine_name: 'auto-unblock',
        audit_log_id: data.audit_log_id, // pass parent id for cascade depth tracking
        linear_ticket: data.linear_ticket,
        max_runtime_minutes: 15,
        fired_at: new Date().toISOString(),
      },
    });

    return {
      status: 'timeout_detected',
      routine: data.routine_name,
      audit_log_id: data.audit_log_id,
      cascade_depth: cascadeDepth,
    };
  },
);
