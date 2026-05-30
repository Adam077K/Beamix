/**
 * Beamix — Monthly Deliverables Reset Cron
 *
 * Runs on the 1st of every month at 00:00 UTC. For each active subscription,
 * inserts a new `deliverables_per_customer_per_month` row with all counters at 0
 * for the new period.
 *
 * Idempotent: uses ON CONFLICT DO NOTHING so re-runs on the same day are safe.
 *
 * Wave 2 simplification: uses calendar month (1st of month) rather than subscription
 * anniversary day. This is intentional per the dispatch brief Group A note:
 *   "Cron: '0 0 1 * *' (1st of month, simplicity for Wave 2)"
 *
 * Per Engineering Principle #10: writes audit_log row on completion.
 */

import { createClient } from '@supabase/supabase-js';
import { inngest } from '../client';

/** Row shape for `deliverables_per_customer_per_month` insert. */
interface DeliverableInsert {
  customer_id: string;
  month_anchor: string;
  schema_pushed_count: number;
  faq_published_count: number;
  citation_submitted_count: number;
  content_published_count: number;
  outreach_email_count: number;
}

/** Returns a raw Supabase admin client (Wave 2 tables not yet in generated types). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getRawAdminClient(): ReturnType<typeof createClient<any>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error('Missing required env: NEXT_PUBLIC_SUPABASE_URL');
  if (!serviceRoleKey) throw new Error('Missing required env: SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** First-of-next-month date in UTC as `YYYY-MM-DD`. */
function nextMonthAnchor(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1; // 0-indexed → 1-indexed
  // If December, wrap to January next year
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  return `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
}

/**
 * Inngest cron function: resets deliverable counters for all active subscriptions
 * on the 1st of each month.
 */
export const resetDeliverablesMonthlyCron = inngest.createFunction(
  {
    id: 'reset-deliverables-monthly',
    name: 'Reset Deliverables Monthly',
    retries: 3,
  },
  { cron: '0 0 1 * *' },
  async ({ step }) => {
    // Step 1: Fetch all active subscriptions.
    const activeUserIds = await step.run('fetch-active-subscriptions', async () => {
      const supabase = getRawAdminClient();

      const { data, error } = await supabase
        .from('subscriptions')
        .select('user_id')
        .in('status', ['active', 'trialing']);

      if (error) {
        throw new Error(`Failed to fetch active subscriptions: ${error.message}`);
      }

      const userIds: string[] = (data ?? []).map((row: { user_id: string }) => row.user_id);
      return userIds;
    });

    if (activeUserIds.length === 0) {
      return { inserted: 0, period: nextMonthAnchor() };
    }

    // Step 2: Insert new period rows for all active customers (idempotent).
    const result = await step.run('insert-new-period-rows', async () => {
      const supabase = getRawAdminClient();
      const monthAnchor = nextMonthAnchor();

      const rows: DeliverableInsert[] = activeUserIds.map((userId: string) => ({
        customer_id: userId,
        month_anchor: monthAnchor,
        schema_pushed_count: 0,
        faq_published_count: 0,
        citation_submitted_count: 0,
        content_published_count: 0,
        outreach_email_count: 0,
      }));

      // Batch upsert in chunks of 500 to avoid request size limits.
      const CHUNK_SIZE = 500;
      let totalInserted = 0;

      for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
        const chunk = rows.slice(i, i + CHUNK_SIZE);
        const { error } = await supabase
          .from('deliverables_per_customer_per_month')
          .upsert(chunk, {
            onConflict: 'customer_id,month_anchor',
            ignoreDuplicates: true,
          });

        if (error) {
          throw new Error(`Failed to insert period rows (chunk ${i / CHUNK_SIZE}): ${error.message}`);
        }
        totalInserted += chunk.length;
      }

      return { inserted: totalInserted, period: monthAnchor };
    });

    // Step 3: Write audit_log row for observability (Principle #10).
    await step.run('write-audit-log', async () => {
      const supabase = getRawAdminClient();

      const { error } = await supabase.from('audit_log').insert({
        actor_type: 'system',
        actor_id: null,
        event_type: 'deliverables_monthly_reset',
        target_table: 'deliverables_per_customer_per_month',
        target_id: null,
        payload: {
          period: result.period,
          customers_processed: activeUserIds.length,
          rows_inserted: result.inserted,
        },
      });

      if (error) {
        // Non-fatal — audit log failure should not block the cron.
        console.error('[reset-deliverables-monthly] audit_log write failed', {
          error: error.message,
        });
      }
    });

    return result;
  },
);
