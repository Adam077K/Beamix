-- Migration: 20260525000005_plan_tier_seed_and_deprecate.sql
-- Purpose: Seed the new agency-tier plan rows + add plans.is_active column +
--          mark deprecated tiers (discover/build) inactive.
--
-- Split from 20260525000002_plan_tier_rename.sql on 2026-05-27 because PostgreSQL
-- requires ALTER TYPE ADD VALUE to commit BEFORE the value can be referenced.
-- Migration 02 now holds the enum ADD VALUE statements only; this file does the
-- DML that uses those new values.
--
-- File number is 05 (after 04 rls_policies_agency) so the enum commits land before
-- this file runs. RLS in 04 does not reference the new enum values so ordering is safe.
--
-- Rollback: see rollback/20260525000005_plan_tier_seed_and_deprecate.rollback.sql
--
-- NOTE: All idempotent via ON CONFLICT DO NOTHING + IF NOT EXISTS guards.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Add plans.is_active column (used for deprecation gating below)
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'plans'
      AND column_name  = 'is_active'
  ) THEN
    ALTER TABLE public.plans ADD COLUMN is_active boolean NOT NULL DEFAULT true;
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Seed the new agency tier plan rows (Wave 1 tier rename)
-- ─────────────────────────────────────────────────────────────────────────────
-- paddle_price_id_monthly / paddle_price_id_annual are NULL here; the application
-- layer reads real price IDs from Vercel env (PADDLE_STARTER_MONTHLY_PRICE_ID etc.)
-- and references plans by tier. ON CONFLICT (tier) DO NOTHING keeps this idempotent.

INSERT INTO plans (name, tier, monthly_credits, paddle_price_id_monthly, paddle_price_id_annual)
VALUES
  ('Starter',       'starter',      0, NULL, NULL),
  ('Growth',        'growth',       0, NULL, NULL),
  ('Professional',  'professional', 0, NULL, NULL)
ON CONFLICT (tier) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Mark deprecated tiers inactive
-- ─────────────────────────────────────────────────────────────────────────────
-- 'scale' is NOT deprecated (it is the new $1,499/mo tier, reused from old enum).
-- We only deprecate 'discover' and 'build' (the $79 and $189 pre-pivot tiers).
UPDATE plans SET is_active = false WHERE tier IN ('discover', 'build');
