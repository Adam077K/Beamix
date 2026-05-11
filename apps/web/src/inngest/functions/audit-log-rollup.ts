import { inngest } from '../client';
import { createServiceRoleClient } from '@/lib/supabase/server-service-role';

// Service role required — bypasses RLS for internal observability writes.

/**
 * Nightly cron at 03:00 UTC. Aggregates yesterday's audit_log rows into
 * audit_log_daily (one row per agent per day with fires count, total_cost, failures).
 * Drops audit_log detail rows older than 90 days (the locked retention per
 * ORCHESTRATION.md §2G Q6).
 *
 * R8 FIX: T24:00:00Z was an invalid ISO 8601 time. Replaced with correct
 *   boundary: start of day-after-yesterday (exclusive upper bound).
 *   Uses '<' comparison to next-day-start, not '<= end-of-day'.
 *
 * R8 FIX: Delete guard — only delete if aggregates_written > 0 OR
 *   zero rows exist for that date (skip delete when aggregate produced nothing
 *   but rows actually exist — avoids accidental data loss).
 *
 * R8 FIX: Primary path calls audit_log_aggregate_for_date() RPC (server-side,
 *   no wire transfer of raw rows). Fallback retained if RPC is not yet deployed.
 *
 * Per Adam Q7 2026-05-08: NO Telegram alerts from this function.
 */
export const auditLogRollup = inngest.createFunction(
  { id: 'audit-log-rollup', name: 'Nightly audit_log → audit_log_daily rollup' },
  { cron: '0 3 * * *' }, // 03:00 UTC nightly
  async ({ step }) => {
    const supabase = createServiceRoleClient();

    // 1. Compute rollup date (yesterday, YYYY-MM-DD)
    const yesterday = await step.run('compute-rollup-date', () => {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - 1);
      d.setUTCHours(0, 0, 0, 0);
      return d.toISOString().slice(0, 10); // YYYY-MM-DD
    });

    // Compute the correct day boundaries:
    //   start  = yesterday at 00:00:00 UTC
    //   end    = today (day-after-yesterday) at 00:00:00 UTC  ← exclusive upper bound
    // This avoids the invalid T24:00:00Z boundary (R8 fix).
    const dayStart = `${yesterday}T00:00:00.000Z`;
    const dayAfterYesterdayDate = new Date(dayStart);
    dayAfterYesterdayDate.setUTCDate(dayAfterYesterdayDate.getUTCDate() + 1);
    const dayEnd = dayAfterYesterdayDate.toISOString(); // today at 00:00:00Z

    const aggregates = await step.run('aggregate-yesterday', async () => {
      // Primary path: call the audit_log_aggregate_for_date() RPC (R8 migration adds it).
      // Server-side aggregation avoids transferring all detail rows over the wire.
      const { data, error } = await supabase.rpc('audit_log_aggregate_for_date', {
        p_date: yesterday,
      });

      if (!error && data) return data;

      // Fallback: inline aggregation if RPC is not yet deployed.
      // Trade-off: fetches all detail rows for the day over the wire.
      // Remove once migration is confirmed applied everywhere.
      const { data: rows, error: queryError } = await supabase
        .from('audit_log')
        .select('agent, status, cost_usd')
        .gte('ts', dayStart)
        .lt('ts', dayEnd); // R8 fix: was T24:00:00Z (invalid); now < next-day-start

      if (queryError) throw queryError;

      const byAgent = new Map<string, { fires: number; total_cost: number; failures: number }>();
      for (const row of rows ?? []) {
        const acc = byAgent.get(row.agent) ?? { fires: 0, total_cost: 0, failures: 0 };
        acc.fires += 1;
        // R11 fix: wrap in Number() — numeric columns are returned as strings by Supabase
        acc.total_cost += Number(row.cost_usd ?? 0);
        if (
          ['blocked', 'timeout', 'over_budget', 'anomaly', 'rule_violation',
           'telegram_send_failed'].includes(row.status)
        ) {
          acc.failures += 1;
        }
        byAgent.set(row.agent, acc);
      }
      return Array.from(byAgent.entries()).map(([agent, v]) => ({
        date: yesterday,
        agent,
        fires: v.fires,
        total_cost_usd: v.total_cost,
        failures: v.failures,
      }));
    });

    // 2. Upsert into audit_log_daily.
    await step.run('upsert-daily', async () => {
      if (!aggregates || aggregates.length === 0) return;
      const { error } = await supabase
        .from('audit_log_daily')
        .upsert(aggregates, { onConflict: 'date,agent' });
      if (error) throw error;
    });

    const aggregates_written = aggregates?.length ?? 0;

    // 3. Drop detail rows older than 90 days.
    // R8 FIX: Only delete if aggregates_written > 0 OR zero rows exist for that date.
    // Guard prevents accidental deletion when aggregation silently produced nothing
    // but rows actually exist (e.g., RPC schema mismatch on the first deploy).
    await step.run('drop-old-details', async () => {
      if (aggregates_written === 0) {
        // Check if any rows exist for yesterday before deciding to skip delete
        const { count } = await supabase
          .from('audit_log')
          .select('id', { count: 'exact', head: true })
          .gte('ts', dayStart)
          .lt('ts', dayEnd);

        if ((count ?? 0) > 0) {
          // Rows exist but aggregation produced zero results — something is wrong.
          // Skip deletion to avoid data loss. Log and let Adam investigate.
          console.warn(
            `[audit-log-rollup] aggregates_written=0 but ${count} rows exist for ${yesterday}. Skipping 90-day delete to prevent accidental data loss.`,
          );
          return { skipped: true, reason: 'aggregates_written=0 but rows present' };
        }
        // Zero rows for yesterday is normal on quiet days — proceed to delete old data.
      }

      const cutoff = new Date();
      cutoff.setUTCDate(cutoff.getUTCDate() - 90);
      const { error } = await supabase
        .from('audit_log')
        .delete()
        .lt('ts', cutoff.toISOString());
      if (error) throw error;
      return { skipped: false };
    });

    // 4. Drop claude_progress rows older than 90 days (no aggregation; step-level noise).
    await step.run('drop-old-progress', async () => {
      const cutoff = new Date();
      cutoff.setUTCDate(cutoff.getUTCDate() - 90);
      const { error } = await supabase
        .from('claude_progress')
        .delete()
        .lt('ts', cutoff.toISOString());
      if (error) throw error;
    });

    return { date: yesterday, aggregates_written };
  },
);
