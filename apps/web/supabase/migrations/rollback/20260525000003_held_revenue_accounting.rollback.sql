-- Rollback: 20260525000003_held_revenue_accounting.sql
-- Reverses held_revenue_accounting migration.
-- DESTRUCTIVE: drops revenue_events table and removes 3 columns from subscriptions.
-- Run only after confirming NO production revenue_events rows exist.
--
-- Dependencies:
--   - Migration 01 added refund_events.revenue_event_id FK → revenue_events.id
--     That FK must be dropped BEFORE revenue_events can be dropped.
--   - If migration 01 rollback was already run, skip the FK step.

-- Step 1: Drop FK from refund_events → revenue_events
ALTER TABLE public.refund_events
  DROP CONSTRAINT IF EXISTS refund_events_revenue_event_id_fkey;

-- Step 2: Drop revenue_events table
DROP TABLE IF EXISTS public.revenue_events;

-- Step 3: Remove columns added to subscriptions
ALTER TABLE public.subscriptions
  DROP COLUMN IF EXISTS held_until,
  DROP COLUMN IF EXISTS held_revenue_amount_cents,
  DROP COLUMN IF EXISTS founding_100_cohort;
