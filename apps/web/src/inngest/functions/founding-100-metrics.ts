/**
 * Beamix — Founding-100 Metrics Cron (W2.5 skeleton)
 *
 * Runs daily at 02:00 UTC to compute and record founding-100 cohort health metrics
 * into the audit_log. This is a W2.5 skeleton — the actual refund-rate and churn
 * calculations are pending W2.3 held-revenue tables.
 *
 * // TODO: implement refund-rate calc (W2.3 held-revenue tables required).
 * //       Threshold trigger + Telegram intentionally out of scope for this PR —
 * //       see W2.5 lines 69-77.
 *
 * NOTE on brief vs schema naming mismatch:
 *   The CTO brief used `event_kind` and `spec.*` as payload field names.
 *   The actual audit_log table (20260520100004_audit_feature_flags.sql) uses:
 *     - `event_type` (not `event_kind`)
 *     - `payload` (not `spec`)
 *   This function uses the real schema column names.
 *
 * Per `docs/08-agents_work/sessions/ (CEO Wave 2 dispatch, W2.5 brief)`.
 */

import 'server-only';
import { inngest } from '../client';
import { getAdminClient } from '../../lib/agents/db/admin-client';

/**
 * `founding-100-metrics` — daily cron skeleton that writes a cohort metrics audit entry.
 *
 * Fires at 02:00 UTC every day. Once W2.3 held-revenue tables are live, replace the
 * hardcoded-zero placeholders with real queries against `revenue_events` and
 * `refund_events`. Add the threshold trigger and Telegram notification at that point
 * per the full W2.5 spec (lines 69-77).
 */
export const foundingHundredMetrics = inngest.createFunction(
  {
    id: 'founding-100-metrics',
    // No concurrency key needed for a singleton daily cron.
  },
  { cron: '0 2 * * *' },
  async ({ step }) => {
    const result = await step.run('write-metrics-audit', async () => {
      const db = getAdminClient();

      // ISO month anchor: e.g. "2026-05" for May 2026.
      const monthAnchor = new Date().toISOString().slice(0, 7);

      // TODO (W2.3): replace these zeros with real queries once held-revenue tables
      // and refund_events are confirmed live in production.
      //
      // Sketch of future implementation:
      //   cohort_size   = SELECT COUNT(*) FROM subscriptions WHERE founding_100_cohort = TRUE
      //   refund_count  = SELECT COUNT(*) FROM refund_events
      //                   JOIN revenue_events USING (revenue_event_id)
      //                   WHERE subscriptions.founding_100_cohort = TRUE
      //   churn_count   = SELECT COUNT(*) FROM subscriptions
      //                   WHERE founding_100_cohort = TRUE AND subscription_status = 'cancelled'
      //   refund_rate   = refund_count / GREATEST(cohort_size, 1)

      const { error } = await db.from('audit_log').insert({
        event_type: 'founding_100_metrics',
        actor_type: 'system',
        actor_id: null,
        target_table: 'subscriptions',
        target_id: null,
        payload: {
          cohort_size: 0,
          refund_rate_to_date: 0,
          refund_count: 0,
          churn_count: 0,
          month_anchor: monthAnchor,
          status: 'skeleton_pending_w2_3',
        },
      });

      if (error) {
        console.error('[founding-100-metrics] audit_log insert failed', {
          code: error.code,
          message: error.message,
          month_anchor: monthAnchor,
        });
        throw new Error(`audit_log insert failed: ${error.message}`);
      }

      return { month_anchor: monthAnchor, status: 'skeleton_pending_w2_3' };
    });

    return result;
  },
);
