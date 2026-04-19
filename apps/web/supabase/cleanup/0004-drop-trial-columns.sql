-- cleanup/0004-drop-trial-columns.sql
-- Author: supabase-cleaner agent, reviewed by Adam on 2026-04-19
-- Context: The 7-day trial model was killed in the 2026-04-15 rethink.
--          Replaced by a 14-day money-back guarantee — no DB tracking needed.
--          Two columns on public.subscriptions are now dead freight:
--            trial_started_at  TIMESTAMPTZ NULL
--            trial_ends_at     TIMESTAMPTZ NULL
--          At audit time (2026-04-19): 1 row in subscriptions has non-null
--          values (dev-era record: trial_started_at=2026-03-30, trial_ends_at=2026-04-06).
--          No real customer data — this is a dev test row.
-- Risk: LOW — 1 dev-era row. No code in apps/web/src references these columns
--       post-rethink. Archived below before drop.
-- Rollback: Column types documented below. Can be re-added with ALTER TABLE ADD COLUMN.

-- ============================================================
-- STEP 1 — PRE-FLIGHT (run first, inspect the counts, confirm intent)
-- ============================================================
SELECT
  id,
  user_id,
  trial_started_at,
  trial_ends_at
FROM public.subscriptions
WHERE trial_started_at IS NOT NULL OR trial_ends_at IS NOT NULL;
-- Expected: 1 row (dev-era record, user created 2026-03-30, trial expired 2026-04-06)
-- Confirm this is not a real paying customer before proceeding.

-- Also check total subscription count for context:
SELECT
  COUNT(*)                                                     AS total_subscriptions,
  COUNT(*) FILTER (WHERE trial_started_at IS NOT NULL)         AS with_trial_started,
  COUNT(*) FILTER (WHERE trial_ends_at IS NOT NULL)            AS with_trial_ends
FROM public.subscriptions;

-- ============================================================
-- STEP 2 — ARCHIVE (safe, additive)
-- Capture the full subscriptions snapshot before column removal.
-- ============================================================

-- Create _archive schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS _archive;

-- Archive the full subscriptions table (preserves trial column data)
CREATE TABLE IF NOT EXISTS _archive.subscriptions_pretrial_drop_2026_04_19
  AS SELECT * FROM public.subscriptions;
-- NOTE: At archive time, subscriptions had 1 row with trial column data
--       (trial_started_at: 2026-03-30, trial_ends_at: 2026-04-06, dev-era only).

-- ============================================================
-- STEP 3 — DROP COLUMNS (destructive, run only after STEP 1 confirmed + STEP 2 applied)
-- ============================================================
ALTER TABLE public.subscriptions
  DROP COLUMN IF EXISTS trial_started_at,
  DROP COLUMN IF EXISTS trial_ends_at;

-- ============================================================
-- ROLLBACK NOTE
-- ============================================================
-- Column types (both were TIMESTAMPTZ NULL):
--   trial_started_at  TIMESTAMPTZ NULL
--   trial_ends_at     TIMESTAMPTZ NULL
--
-- To restore (adds back as nullable, no data — archive holds the 1 dev-era row):
--   ALTER TABLE public.subscriptions
--     ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ NULL,
--     ADD COLUMN IF NOT EXISTS trial_ends_at    TIMESTAMPTZ NULL;
--
-- To restore with the archived dev-era data:
--   UPDATE public.subscriptions s
--   SET
--     trial_started_at = a.trial_started_at,
--     trial_ends_at    = a.trial_ends_at
--   FROM _archive.subscriptions_pretrial_drop_2026_04_19 a
--   WHERE s.id = a.id;
