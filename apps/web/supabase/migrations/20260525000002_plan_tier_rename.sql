-- Migration: 20260525000002_plan_tier_rename.sql
-- Purpose: Add agency-tier enum values to plan_tier; deprecate discover/build via comments.
--          Adds: 'starter', 'growth', 'professional' (scale already exists — intentional collision kept)
--          Does NOT remove existing values (safe — data integrity + historical webhook refs preserved)
-- Source: docs/03-system-design/DATABASE_SCHEMA.md §0.5
--         docs/08-agents_work/sessions/2026-05-24-cto-infra-gap-scoping.md (B5)
--
-- Current plan_tier values: 'discover', 'build', 'scale'
-- Post-migration plan_tier values: 'discover'*, 'build'*, 'scale', 'starter', 'growth', 'professional'
--   * deprecated — no longer offered to new customers; Paddle products archived.
--     Backend code must filter on active plans via plans.is_active column (not enum value).
--
-- Rollback: Cannot remove enum values in PostgreSQL without DROP + RECREATE.
--   see rollback/20260525000002_plan_tier_rename.rollback.sql for full strategy.
--
-- NOTE: ALTER TYPE ADD VALUE IF NOT EXISTS is not available before PostgreSQL 14.
--   Supabase production runs PG 15+ so IF NOT EXISTS is safe.

-- Add new agency tier values to plan_tier enum
ALTER TYPE plan_tier ADD VALUE IF NOT EXISTS 'starter';
ALTER TYPE plan_tier ADD VALUE IF NOT EXISTS 'growth';
ALTER TYPE plan_tier ADD VALUE IF NOT EXISTS 'professional';
-- 'scale' already exists — no ADD VALUE needed (collision intentional per brief)

-- Deprecate old values via comment (PostgreSQL has no native enum value deprecation)
COMMENT ON TYPE plan_tier IS
  'Plan tier enum for Beamix. '
  'Values ''discover'' and ''build'' are DEPRECATED as of 2026-05-25 (agency pivot). '
  'New values: ''starter'' ($499/mo), ''growth'' ($999/mo), ''scale'' ($1,499/mo), ''professional'' ($2,499/mo). '
  'Legacy values retained for historical Paddle webhook event compatibility. '
  'Use plans.is_active = false to gate deprecated tiers from new signups.';

-- Seed the new agency tier plan rows (sandbox prices — Adam replaces with real price IDs)
-- Using INSERT ... ON CONFLICT DO NOTHING for idempotency
-- NOTE: paddle_price_id_monthly / paddle_price_id_annual must be set by Adam (AB-3)
--       These rows are created with NULL price IDs — backend checks IS NOT NULL before checkout

INSERT INTO plans (name, tier, monthly_credits, paddle_price_id_monthly, paddle_price_id_annual)
VALUES
  ('Starter',       'starter',      0, NULL, NULL),
  ('Growth',        'growth',       0, NULL, NULL),
  ('Professional',  'professional', 0, NULL, NULL)
ON CONFLICT (tier) DO NOTHING;

-- Mark deprecated tiers inactive so they don't appear in pricing UI
-- 'scale' is NOT deprecated (it is the new $1,499/mo tier, reused from old enum)
-- We only deprecate 'discover' and 'build'
-- plans table has no is_active column yet — we add it here if not present
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

-- Deactivate old tiers
UPDATE plans SET is_active = false WHERE tier IN ('discover', 'build');

-- Add new agency agent_type values (internal only, per DATABASE_SCHEMA §0.5)
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'discovery';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'brand_brief_manager';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'approval_gate_writer';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'digest_writer';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'customer_success';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'publisher';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'strategy';
