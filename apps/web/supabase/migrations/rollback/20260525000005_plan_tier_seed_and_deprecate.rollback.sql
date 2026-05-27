-- Rollback: 20260525000005_plan_tier_seed_and_deprecate.sql
-- Reverses the agency-tier seed inserts + is_active column add + deprecated-tier UPDATE.
--
-- Safe to run as long as no subscribers reference the new plan rows (Wave 1 ships
-- without any customer signups). After first customer signup, this rollback
-- becomes data-destructive — engage CTO before executing in production.

-- Step 1: Remove new agency tier plan rows
DELETE FROM public.plans WHERE tier IN ('starter', 'growth', 'professional');

-- Step 2: Restore deprecated tiers to active (in case Paddle webhooks re-fire)
UPDATE public.plans SET is_active = true WHERE tier IN ('discover', 'build');

-- Step 3: Drop is_active column ONLY if this migration added it.
-- Check first: if other migrations rely on is_active, skip this step.
-- ALTER TABLE public.plans DROP COLUMN IF EXISTS is_active;
-- ^ Commented out intentionally — confirm column ownership before executing.

-- Step 4: enum value removal happens in 20260525000002.rollback.sql (with CTO review).
