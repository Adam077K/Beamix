/**
 * cost-watchdog.ts — Hourly cost aggregation for the war-room burn-down.
 *
 * Per ORCHESTRATION.md §2C + TECH-STACK.md §3A.4 + Errata 4.
 *
 * Adam Q7 (2026-05-08): NO TELEGRAM ALERTS. This function ONLY:
 *   1. Reads audit_log.cost_usd rolling 1h window
 *   2. Updates audit_log_daily aggregate for today (upsert per agent)
 *   3. Writes a monthly cost summary row for the /war-room page burn-down
 *
 * All cost observation is PASSIVE — Adam reads /war-room page or the
 * monthly burn-down report. No pings, no alerts.
 *
 * R2 FIX: createServiceClient → createServiceRoleClient.
 * R11 FIX: All cost_usd reads wrapped in Number(row.cost_usd ?? 0).
 *   Supabase returns numeric columns as strings; string-concat produces NaN.
 *
 * Service role required — bypasses RLS for internal observability writes.
 */

import { inngest } from '@/inngest/client';
import { createServiceRoleClient } from '@/lib/supabase/server-service-role';

export const costWatchdog = inngest.createFunction(
  { id: 'cost-watchdog', retries: 2 },
  { cron: '0 * * * *' }, // hourly
  async ({ step }) => {
    // Step 1: Aggregate today's cost from audit_log into audit_log_daily
    const todayAggregates = await step.run('aggregate-today', async () => {
      // Service role required — bypasses RLS for internal observability writes.
      const supabase = createServiceRoleClient();
      const today = new Date().toISOString().split('T')[0]!;
      const todayStart = `${today}T00:00:00Z`;

      const { data, error } = await supabase
        .from('audit_log')
        .select('agent, cost_usd, status')
        .gte('ts', todayStart);

      if (error) throw new Error(`audit_log read failed: ${error.message}`);

      // Aggregate per agent
      const byAgent = new Map<string, { fires: number; total_cost: number; failures: number }>();
      for (const row of data ?? []) {
        const key = row.agent as string;
        const existing = byAgent.get(key) ?? { fires: 0, total_cost: 0, failures: 0 };
        existing.fires += 1;
        // R11 fix: Number() prevents string-concat NaN from Supabase numeric columns
        existing.total_cost += Number(row.cost_usd ?? 0);
        const isFailure = ['blocked', 'timeout', 'over_budget', 'anomaly', 'anthropic_error',
          'linear_api_error', 'mem0_error', 'rule_violation', 'telegram_send_failed'].includes(row.status as string);
        if (isFailure) existing.failures += 1;
        byAgent.set(key, existing);
      }

      return { date: today, aggregates: [...byAgent.entries()] };
    });

    // Step 2: Upsert audit_log_daily rows (one per agent for today)
    await step.run('upsert-daily-rows', async () => {
      if (todayAggregates.aggregates.length === 0) return;
      // Service role required — bypasses RLS for internal observability writes.
      const supabase = createServiceRoleClient();

      const rows = todayAggregates.aggregates.map(([agent, agg]) => ({
        date: todayAggregates.date,
        agent,
        fires: agg.fires,
        total_cost_usd: agg.total_cost,
        failures: agg.failures,
      }));

      const { error } = await supabase
        .from('audit_log_daily')
        .upsert(rows, { onConflict: 'date,agent' });

      if (error) throw new Error(`audit_log_daily upsert failed: ${error.message}`);
    });

    // Step 3: Compute rolling 1h window cost (for /war-room page cache)
    const rollingHour = await step.run('compute-rolling-hour', async () => {
      // Service role required — bypasses RLS for internal observability writes.
      const supabase = createServiceRoleClient();
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('audit_log')
        .select('agent, cost_usd')
        .gte('ts', oneHourAgo);

      if (error) throw new Error(`rolling hour read failed: ${error.message}`);

      // R11 fix: Number() prevents string-concat NaN from Supabase numeric columns
      const totalCost = (data ?? []).reduce((sum, r) => sum + Number(r.cost_usd ?? 0), 0);
      return { total_cost_usd: totalCost, period_start: oneHourAgo };
    });

    return {
      date: todayAggregates.date,
      agents_updated: todayAggregates.aggregates.length,
      rolling_1h_cost_usd: rollingHour.total_cost_usd,
    };
  },
);
