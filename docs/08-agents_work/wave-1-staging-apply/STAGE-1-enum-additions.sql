-- ============================================================================
-- Wave 1 Staging Apply — STAGE 1 of 2  (rebuilt 2026-05-28 from post-PR-#95 main)
-- ============================================================================
-- Adds the new enum VALUES (plan_tier + agent_type) and updates the COMMENTs.
--
-- PostgreSQL requires ALTER TYPE ADD VALUE to commit BEFORE the new values
-- can be referenced. Paste this script ALONE in Supabase SQL Editor, click
-- Run, wait for "Success", THEN paste STAGE-2-everything-else.sql.
-- ============================================================================

-- Migration: 20260525000002_plan_tier_rename.sql
-- Purpose: Add new enum VALUES ONLY (plan_tier + agent_type for agency pivot).
--          Seed inserts + ALTER TABLE + UPDATE statements that REFERENCE these
--          new enum values live in 20260525000005_plan_tier_seed_and_deprecate.sql
--          because PostgreSQL requires ALTER TYPE ADD VALUE to commit BEFORE the
--          new value can be used in the same transaction.
--
-- Source: docs/03-system-design/DATABASE_SCHEMA.md §0.5
--         docs/08-agents_work/sessions/2026-05-24-cto-infra-gap-scoping.md (B5)
--         Bug surfaced 2026-05-27 staging apply — split into 02 + 05.
--
-- Current plan_tier values: 'discover', 'build', 'scale'
-- Post-migration plan_tier values: 'discover'*, 'build'*, 'scale', 'starter', 'growth', 'professional'
--   * deprecated — no longer offered to new customers; Paddle products archived.
--     Deprecation enforcement lives in migration 05 (plans.is_active column + UPDATE).
--
-- Rollback: Cannot remove enum values in PostgreSQL without DROP + RECREATE.
--   see rollback/20260525000002_plan_tier_rename.rollback.sql for full strategy.
--
-- NOTE: ALTER TYPE ADD VALUE IF NOT EXISTS requires PostgreSQL 12+.
--   Supabase production runs PG 15+ so IF NOT EXISTS is safe.

-- ─────────────────────────────────────────────────────────────────────────────
-- plan_tier — agency pivot tier additions
-- ─────────────────────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────────────────────
-- agent_type — 7 new customer-facing agency-pivot agents
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'discovery';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'brand_brief_manager';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'approval_gate_writer';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'digest_writer';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'customer_success';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'publisher';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'strategy';

COMMENT ON TYPE agent_type IS
  'Wave 1 (2026-05-25): added 7 agency-pivot customer-facing agents — discovery, brand_brief_manager, approval_gate_writer, digest_writer, customer_success, publisher, strategy.';
