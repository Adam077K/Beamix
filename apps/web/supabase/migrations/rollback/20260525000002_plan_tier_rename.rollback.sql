-- Rollback: 20260525000002_plan_tier_rename.sql
-- WARNING: PostgreSQL cannot remove enum values added with ALTER TYPE ADD VALUE.
-- Reversing an enum ADD VALUE requires DROP TYPE + RECREATE + ALTER TABLE ... USING.
-- This is a DATA-DESTRUCTIVE operation if any rows use the new values.
--
-- Strategy:
--   1. Remove the seed plan rows for the new tiers (safe — no subscriber rows yet).
--   2. Restore deprecated tiers to is_active = true (business-level undo).
--   3. Remove the is_active column (if added by this migration).
--   4. Remove new agent_type values — same constraint: cannot drop enum values.
--      Document the risk; enum removal requires table rewrite.
--
-- PARTIAL ROLLBACK (safe):
--   The steps below achieve business-level rollback without the dangerous DROP TYPE.
--   Full enum rollback (removing the values 'starter','growth','professional') is
--   NOT safe while any data references those values.
--   If a full structural rollback is required, engage the CTO before executing.

-- Step 1: Remove new agency tier plan rows
DELETE FROM public.plans WHERE tier IN ('starter', 'growth', 'professional');

-- Step 2: Restore deprecated tiers to active (in case Paddle webhooks re-fire)
UPDATE public.plans SET is_active = true WHERE tier IN ('discover', 'build');

-- Step 3: Drop is_active column ONLY if this migration added it.
-- Check first: if other migrations rely on is_active, skip this step.
-- ALTER TABLE public.plans DROP COLUMN IF EXISTS is_active;
-- ^ Commented out intentionally — confirm column ownership before executing.

-- Step 4: ENUM VALUE REMOVAL — NOT AUTOMATICALLY REVERSIBLE.
-- To fully remove 'starter', 'growth', 'professional' from plan_tier:
--   a. Ensure zero rows in plans/subscriptions use these values.
--   b. Run the recreate script below (manually, in a transaction):
--
--   BEGIN;
--   ALTER TYPE plan_tier RENAME TO plan_tier_old;
--   CREATE TYPE plan_tier AS ENUM ('discover', 'build', 'scale');
--   ALTER TABLE plans ALTER COLUMN tier TYPE plan_tier USING tier::text::plan_tier;
--   ALTER TABLE subscriptions ALTER COLUMN plan TYPE plan_tier USING plan::text::plan_tier;
--   DROP TYPE plan_tier_old;
--   COMMIT;
--
-- Step 5: AGENT_TYPE ENUM REMOVAL — same constraint; same manual approach required.
-- New values: 'discovery','brand_brief_manager','approval_gate_writer','digest_writer',
--             'customer_success','publisher','strategy'
-- Cannot be rolled back here. CTO must oversee.

-- Reset type comment
COMMENT ON TYPE plan_tier IS
  'Plan tier enum for Beamix. Values: discover, build, scale.';
