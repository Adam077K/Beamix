-- Migration: 20260520_10_seed_plans.sql
-- Purpose: Seed Paddle price_id mappings + default credit allocations for 3 plan tiers
-- Pricing: Discover $79 / Build $189 / Scale $499 (locked April 15, 2026)
-- Note: paddle_price_id_* values are placeholders — Wave 1 BE-2 updates with real Paddle IDs
--       via env var substitution or direct update. placeholder_ prefix signals "not yet wired".
-- Rollback: DELETE FROM plans WHERE tier IN ('discover','build','scale');

INSERT INTO plans (id, name, tier, monthly_credits, paddle_price_id_monthly, paddle_price_id_annual)
VALUES
  (
    gen_random_uuid(),
    'Discover',
    'discover',
    50,   -- 50 agent credits/mo
    'placeholder_discover_monthly',  -- Wave 1 BE-2 updates to real Paddle price ID
    'placeholder_discover_annual'
  ),
  (
    gen_random_uuid(),
    'Build',
    'build',
    150,  -- 150 agent credits/mo
    'placeholder_build_monthly',     -- Wave 1 BE-2 updates to real Paddle price ID
    'placeholder_build_annual'
  ),
  (
    gen_random_uuid(),
    'Scale',
    'scale',
    500,  -- 500 agent credits/mo
    'placeholder_scale_monthly',     -- Wave 1 BE-2 updates to real Paddle price ID
    'placeholder_scale_annual'
  )
ON CONFLICT (tier) DO NOTHING;
