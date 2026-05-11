/**
 * parent-ticket-expiry-watcher.ts — 24h backstop for stalled fan-out flows.
 *
 * Per ORCHESTRATION.md §2C (Cluster 8, parent-ticket-expiry-watcher).
 *
 * Triggered by: war-room/parent-ticket.dispatched
 * Sleeps 24h. If parent ticket still has pending sub-tickets (no synth COMPLETE
 * in audit_log for this fan_in_key), fire Auto-Unblock.
 *
 * This is the Inngest-outage backstop — if fan-in-watcher never fires
 * (e.g., Inngest was down when sub-tickets closed), this catches it.
 *
 * R2 FIX: inngest.send() inside step.run() replaced with step.sendEvent().
 *   Idempotent send — safe to retry without double-firing Auto-Unblock.
 *
 * R2 FIX: createServiceClient → createServiceRoleClient.
 *
 * R8 FIX: synth completion check now looks for event_kind = 'synth_complete'
 *   instead of bare status = 'complete'. The old check matched the fan-in
 *   dispatch row itself (which also has status='complete'), masking a real
 *   incomplete synth. event_kind = 'synth_complete' is written only when
 *   the CEO synthesizer Routine actually completes, not when it is dispatched.
 *
 * Service role required — bypasses RLS for internal observability writes.
 */

import { z } from 'zod';
import { inngest } from '@/inngest/client';
import { createServiceRoleClient } from '@/lib/supabase/server-service-role';

const eventSchema = z.object({
  parent_ticket: z.string(),
  fan_in_key: z.string().uuid(),
  sub_ticket_count: z.number().int().positive(),
  dispatched_at: z.string(),
});

export const parentTicketExpiryWatcher = inngest.createFunction(
  { id: 'parent-ticket-expiry-watcher', retries: 1 },
  { event: 'war-room/parent-ticket.dispatched' as 'war-room/parent-ticket.dispatched' },
  async ({ event, step }) => {
    const data = eventSchema.parse(event.data);

    // Sleep 24 hours — the expiry window
    await step.sleep('wait-24h', '24h');

    // Check if synth COMPLETED for this fan_in_key (R8 fix: use event_kind = 'synth_complete')
    // Background: fan-in-watcher writes two rows for the same fan_in_key:
    //   1. status='complete', event_kind='synth_dispatched' — when it fires the CEO synth
    //   2. The CEO synth itself writes status='complete', event_kind='synth_complete' when done
    // We must check for (2), not (1) — otherwise we'd see the dispatch row and incorrectly
    // think the synth completed.
    const synthStatus = await step.run('check-synth-completion', async () => {
      // Service role required — bypasses RLS for internal observability writes.
      const supabase = createServiceRoleClient();

      const { data: rows, error } = await supabase
        .from('audit_log')
        .select('id, status, agent, event_kind, outcome')
        .eq('fan_in_key', data.fan_in_key)
        .eq('event_kind', 'synth_complete')
        .limit(1);

      if (error) throw new Error(`Supabase error: ${error.message}`);

      return {
        synthCompleted: (rows?.length ?? 0) > 0,
        completedRow: rows?.[0] ?? null,
      };
    });

    // If synth already completed, nothing to do
    if (synthStatus.synthCompleted) {
      return {
        status: 'ok',
        fan_in_key: data.fan_in_key,
        reason: 'synth already completed (event_kind=synth_complete found)',
      };
    }

    // Write anomaly to audit_log for the parent ticket
    await step.run('write-expiry-anomaly', async () => {
      // Service role required — bypasses RLS for internal observability writes.
      const supabase = createServiceRoleClient();
      await supabase.from('audit_log').insert({
        spec: {
          event: 'parent_ticket_expiry',
          fan_in_key: data.fan_in_key,
          sub_ticket_count: data.sub_ticket_count,
          dispatched_at: data.dispatched_at,
        },
        agent: 'parent-ticket-expiry-watcher',
        status: 'timeout',
        row_kind: 'internal_event',
        outcome: `Parent ticket ${data.parent_ticket} still has pending sub-tickets 24h after dispatch. Auto-Unblock fired.`,
        linear_ticket: data.parent_ticket,
        fan_in_key: data.fan_in_key,
      });
    });

    // Fire Auto-Unblock via step.sendEvent (idempotent — R2 fix)
    // step.sendEvent is Inngest's idempotent send primitive.
    // Unlike inngest.send() inside step.run(), it won't double-fire on retry.
    await step.sendEvent('fire-auto-unblock', {
      name: 'war-room/routine.fired' as 'war-room/routine.fired',
      data: {
        routine_id: 'auto-unblock',
        routine_name: 'auto-unblock',
        audit_log_id: '',
        linear_ticket: data.parent_ticket,
        max_runtime_minutes: 15,
        fired_at: new Date().toISOString(),
      },
    });

    return {
      status: 'auto_unblock_fired',
      parent_ticket: data.parent_ticket,
      fan_in_key: data.fan_in_key,
    };
  },
);
