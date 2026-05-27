-- Migration: 20260525000003_held_revenue_accounting.sql
-- Purpose: subscriptions.held_until + held_revenue_amount_cents + founding_100_cohort columns;
--          revenue_events ledger table (append-only, booked_at flipped by day-61 cron).
--          Also adds FK from refund_events.revenue_event_id → revenue_events.id
-- Source: docs/03-system-design/DATABASE_SCHEMA.md §0.2 (revenue_events + refund_events)
--         docs/08-agents_work/sessions/2026-05-23-cto-agency-pivot-wave-rescope.md (decision A4)
--
-- Rollback: see rollback/20260525000003_held_revenue_accounting.rollback.sql
--
-- Architecture notes (CTO decision A4):
--   - Day-61 hold: Revenue booked_at is NULL until 61 days after received_at
--   - ARR/MRR dashboards read from booked_at (NOT received_at) for accurate recognition
--   - revenue-booking-sweep Inngest cron flips booked_at in bulk daily
--   - revenue_events is append-only — no UPDATE/DELETE (RLS DENY in migration 04)

-- ─────────────────────────────────────────────────────────────────────────────
-- EXTEND subscriptions table
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS held_until               timestamptz,
  ADD COLUMN IF NOT EXISTS held_revenue_amount_cents int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS founding_100_cohort       boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN subscriptions.held_until IS
  'Timestamp until which new revenue from this subscription is held (not yet booked). '
  'NULL means not held. Set to received_at + 61 days on new payment. '
  'Cleared by revenue-booking-sweep cron when booked_at is written to revenue_events.';

COMMENT ON COLUMN subscriptions.held_revenue_amount_cents IS
  'Running sum of revenue_cents held but not yet booked for this subscription. '
  'Updated on each Paddle charge event. Reset to 0 when held_until passes.';

COMMENT ON COLUMN subscriptions.founding_100_cohort IS
  'True for the first 100 paying customers. Unlocks founding member pricing and perks. '
  'Set by the subscription webhook handler when cohort_number is still available.';

-- ─────────────────────────────────────────────────────────────────────────────
-- revenue_events ledger
-- Append-only. booked_at = NULL until day-61 cron flips it.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS revenue_events (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id      uuid NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,
  paddle_event_id  text NOT NULL UNIQUE,
  type             revenue_event_type NOT NULL,
  amount_cents     int NOT NULL,
  currency         text NOT NULL DEFAULT 'USD',
  received_at      timestamptz NOT NULL DEFAULT now(),
  booked_at        timestamptz,
  notes            jsonb,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_revenue_events_customer
  ON revenue_events (customer_id, received_at DESC);

CREATE INDEX IF NOT EXISTS idx_revenue_events_booked_at
  ON revenue_events (booked_at)
  WHERE booked_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_revenue_events_unbooked
  ON revenue_events (received_at)
  WHERE booked_at IS NULL;

COMMENT ON TABLE revenue_events IS
  'Append-only Paddle revenue ledger. '
  'received_at = when Paddle webhook fired. '
  'booked_at = NULL for 61 days (held-revenue model, CTO decision A4); '
  'flipped by revenue-booking-sweep Inngest cron. '
  'ARR/MRR reads WHERE booked_at IS NOT NULL. '
  'UPDATE and DELETE blocked by RLS DENY in migration 20260525000004.';

-- ─────────────────────────────────────────────────────────────────────────────
-- Add FK from refund_events.revenue_event_id → revenue_events.id
-- revenue_events is now created; safe to add constraint.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.refund_events
  ADD CONSTRAINT fk_refund_events_revenue_event
  FOREIGN KEY (revenue_event_id) REFERENCES revenue_events(id)
  ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_refund_events_revenue_event
  ON refund_events (revenue_event_id)
  WHERE revenue_event_id IS NOT NULL;
