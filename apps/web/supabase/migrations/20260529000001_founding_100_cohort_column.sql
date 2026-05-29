-- Migration: 20260529000001_founding_100_cohort_column.sql
-- Purpose: Idempotent confirmation of subscriptions.founding_100_cohort column for W2.5
--          founding-100 cohort tracking. This migration is a defensive no-op that pins
--          the W2.5 contract — the column was originally added by
--          20260525000003_held_revenue_accounting.sql (line 23).
-- Source: docs/08-agents_work/sessions/ (CEO Wave 2 dispatch, W2.5 brief)
--         docs/03-system-design/DATABASE_SCHEMA.md §subscriptions
--
-- Rollback: see rollback/20260529000001_founding_100_cohort_column.rollback.sql
--           NOTE: rollback MUST NOT drop this column — it is owned by
--           20260525000003_held_revenue_accounting.sql. See rollback file.
--
-- Architecture notes (W2.5):
--   - founding_100_cohort tracks the first 100 paying customers cohort.
--   - Column set to TRUE by the Paddle webhook handler when cohort_number ≤ 100.
--   - Cohort metrics are computed by the `founding-100-metrics` Inngest daily cron
--     (see src/inngest/functions/founding-100-metrics.ts).
--   - Threshold trigger + Telegram notification are OUT OF SCOPE for this PR — see W2.5
--     full spec lines 69-77.
--   - The daily cron skeleton (W2.5) writes to audit_log; full refund-rate calc requires
--     W2.3 held-revenue tables (needs_followup: wire refund-rate calc post-W2.3).

-- ─────────────────────────────────────────────────────────────────────────────
-- Idempotent confirmation — ADD COLUMN IF NOT EXISTS is a no-op when the
-- column already exists (added by 20260525000003). This migration exists to
-- formally pin the W2.5 schema contract and ensure the column is documented
-- in the migration history at the wave that consumes it.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS founding_100_cohort BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.subscriptions.founding_100_cohort IS
  'True for the first 100 paying customers (founding-100 cohort). '
  'Unlocks founding member pricing and perks. '
  'Set by the Paddle subscription webhook handler when cohort slot is still available. '
  'Originally added by 20260525000003_held_revenue_accounting.sql. '
  'This W2.5 confirmation migration pins the column contract for the founding-100-metrics cron.';
