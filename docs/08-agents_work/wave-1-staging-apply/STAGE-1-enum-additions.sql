-- ============================================================================
-- Wave 1 Staging Apply — STAGE 1 of 2
-- ============================================================================
-- ALL enum ADD VALUE statements must run BEFORE any use of the new values.
-- PostgreSQL requires the ALTER TYPE to commit before the value is referenced.
--
-- Run this script alone in Supabase SQL Editor. Wait for "Success".
-- THEN run STAGE-2-everything-else.sql.
-- ============================================================================

-- plan_tier — agency-pivot tier rename (Wave 1)
ALTER TYPE plan_tier ADD VALUE IF NOT EXISTS 'starter';
ALTER TYPE plan_tier ADD VALUE IF NOT EXISTS 'growth';
ALTER TYPE plan_tier ADD VALUE IF NOT EXISTS 'professional';

-- agent_type — 7 new customer-facing agents (Wave 1 fleet)
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'discovery';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'brand_brief_manager';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'approval_gate_writer';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'digest_writer';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'customer_success';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'publisher';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'strategy';

COMMENT ON TYPE plan_tier IS
  'Wave 1 (2026-05-25): added starter/growth/professional. discover and build deprecated. Filter active plans via plans.is_active.';

COMMENT ON TYPE agent_type IS
  'Wave 1 (2026-05-25): added 7 agency-pivot customer-facing agents (discovery, brand_brief_manager, approval_gate_writer, digest_writer, customer_success, publisher, strategy).';
