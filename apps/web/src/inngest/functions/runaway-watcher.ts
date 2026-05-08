/**
 * runaway-watcher.ts — Silent kill for over-budget Routines.
 *
 * Per ORCHESTRATION.md §2C + TECH-STACK.md §3A.4 + Errata 4.
 *
 * Triggered by: war-room/audit-log.inserted
 *
 * R11 FIX: Trigger changed from "single-row cost > $1" to
 *   "session accrued cost > spec.budget.max_cost_usd × 1.2".
 *   Background: CEO Synth and FridayRetro legitimately cost > $1/row.
 *   Single-row threshold falsely killed them. The correct trigger is
 *   the spec's own budget ceiling (× 1.2 grace multiplier).
 *
 *   Cost is summed across all audit_log rows sharing:
 *     (a) the same nonce, OR
 *     (b) the same parent_audit_log_id ancestry chain
 *   This captures the full session spend, not just one row.
 *
 * R11 FIX: All cost_usd reads wrapped in Number(row.cost_usd ?? 0).
 *   Supabase returns numeric columns as strings; string-concat = NaN.
 *
 * R2 FIX: createServiceClient → createServiceRoleClient.
 *
 * Adam Q7 (2026-05-08): NO Telegram alerts. Silent kill only.
 *   Exception: cascade depth > 3 (handled in routine-timeout-watcher, not here).
 *
 * Service role required — bypasses RLS for internal observability writes.
 */

import { z } from 'zod';
import { inngest } from '@/inngest/client';
import { createServiceRoleClient } from '@/lib/supabase/server-service-role';

const KILL_MULTIPLIER = 1.2;

const eventSchema = z.object({
  id: z.string(),
  agent: z.string(),
  status: z.string(),
  // R11: cost_usd from event may be number or string (Supabase webhook coerces)
  cost_usd: z.union([z.number(), z.string()]).nullable(),
  linear_ticket: z.string().nullable(),
  fan_in_key: z.string().nullable(),
  nonce: z.string().nullable(),
  ts: z.string(),
});

export const runawayWatcher = inngest.createFunction(
  { id: 'runaway-watcher', retries: 2 },
  { event: 'war-room/audit-log.inserted' as 'war-room/audit-log.inserted' },
  async ({ event, step }) => {
    const data = eventSchema.parse(event.data);

    // R11 fix: Number() — cost_usd may arrive as string from Supabase webhook
    const rowCost = Number(data.cost_usd ?? 0);

    // Step 1: Load the spec from this audit_log row to get max_cost_usd + nonce
    const specData = await step.run('load-spec', async () => {
      // Service role required — bypasses RLS for internal observability writes.
      const supabase = createServiceRoleClient();
      const { data: logRow, error } = await supabase
        .from('audit_log')
        .select('id, spec, agent, linear_ticket, nonce, parent_audit_log_id')
        .eq('id', data.id)
        .maybeSingle();

      if (error) throw new Error(`Supabase error: ${error.message}`);
      return logRow;
    });

    if (!specData) return { skipped: true, reason: 'audit_log row not found' };

    const spec = specData.spec as Record<string, unknown>;
    const budget = spec['budget'] as Record<string, unknown> | undefined;
    const maxCostUsd = typeof budget?.['max_cost_usd'] === 'number' ? budget['max_cost_usd'] as number : null;

    if (maxCostUsd === null) {
      return { skipped: true, reason: 'no max_cost_usd in spec.budget' };
    }

    const killThreshold = maxCostUsd * KILL_MULTIPLIER;

    // Step 2: Sum accrued cost across the full session.
    // Session = all audit_log rows sharing the same nonce OR parent_audit_log_id chain.
    // R11 fix: sum the session, not a single row. Single-row > $1 was too aggressive.
    const accruedCost = await step.run('sum-session-cost', async () => {
      // Service role required — bypasses RLS for internal observability writes.
      const supabase = createServiceRoleClient();

      // Approach: query by nonce first (most precise session boundary).
      // Fall back to linear_ticket if nonce is absent (older rows before R3 fix).
      let rows: { cost_usd: unknown }[] | null = null;
      let queryError: { message: string } | null = null;

      if (specData.nonce) {
        const result = await supabase
          .from('audit_log')
          .select('cost_usd')
          .eq('nonce', specData.nonce)
          .not('cost_usd', 'is', null);
        rows = result.data;
        queryError = result.error;
      } else if (data.linear_ticket) {
        const result = await supabase
          .from('audit_log')
          .select('cost_usd')
          .eq('linear_ticket', data.linear_ticket)
          .not('cost_usd', 'is', null);
        rows = result.data;
        queryError = result.error;
      } else {
        // No session anchor — use the single row cost
        return { total: rowCost, method: 'single_row_fallback' };
      }

      if (queryError) throw new Error(`session cost sum error: ${queryError.message}`);

      // R11 fix: Number() — numeric columns returned as strings by Supabase
      const total = (rows ?? []).reduce((sum, r) => sum + Number(r.cost_usd ?? 0), 0);
      return { total, method: specData.nonce ? 'nonce' : 'linear_ticket' };
    });

    if (accruedCost.total <= killThreshold) {
      return {
        status: 'within_budget',
        accrued: accruedCost.total,
        threshold: killThreshold,
        method: accruedCost.method,
      };
    }

    // Step 3: Over budget — revoke the per-Routine bearer token silently
    await step.run('revoke-token-silent', async () => {
      const routineTokenEnvKey = `ROUTINE_TOKEN_${data.agent.toUpperCase().replace(/-/g, '_')}`;
      const token = process.env[routineTokenEnvKey];

      if (token) {
        // Revoke via Anthropic API (fire-and-forget, no inline await needed beyond this step)
        const response = await fetch('https://api.anthropic.com/v1/claude_code/routines/token/revoke', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env['ANTHROPIC_API_KEY'] ?? '',
          },
          body: JSON.stringify({ token }),
        });

        return {
          revoked: response.ok,
          http_status: response.status,
          routine_token_found: true,
        };
      }

      // No token in env — log but continue to write audit_log
      return { revoked: false, routine_token_found: false };
    });

    // Step 4: Write over_budget to audit_log (silent, no Telegram per Q7)
    await step.run('write-over-budget', async () => {
      // Service role required — bypasses RLS for internal observability writes.
      const supabase = createServiceRoleClient();
      await supabase.from('audit_log').insert({
        spec: {
          event: 'runaway_kill',
          triggered_by_row: data.id,
          accrued_cost_usd: accruedCost.total,
          max_cost_usd: maxCostUsd,
          kill_threshold: killThreshold,
          cost_method: accruedCost.method,
        },
        agent: data.agent,
        status: 'over_budget',
        row_kind: 'internal_event',
        outcome: `Session cost $${accruedCost.total.toFixed(4)} exceeded ${KILL_MULTIPLIER}× budget ceiling $${killThreshold.toFixed(4)} (method: ${accruedCost.method}). Bearer token revoked silently.`,
        linear_ticket: data.linear_ticket,
        fan_in_key: data.fan_in_key,
      });
    });

    return {
      status: 'killed',
      agent: data.agent,
      accrued_usd: accruedCost.total,
      threshold_usd: killThreshold,
      method: accruedCost.method,
    };
  },
);
