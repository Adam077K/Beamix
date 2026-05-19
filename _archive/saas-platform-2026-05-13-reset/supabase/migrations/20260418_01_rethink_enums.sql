-- ============================================================
-- Migration: 20260418_01_rethink_enums.sql
-- Purpose: Phase 1 of 2 for the 2026-04-15 rethink.
--          Enum value additions ONLY. Must run standalone because
--          ALTER TYPE ... ADD VALUE cannot run inside a transaction
--          that also contains DDL referencing the new values.
-- Board decisions: docs/product-rethink-2026-04-09/05-BOARD-DECISIONS-2026-04-15.md
-- Audit note: split from the original 20260415_rethink_schema.sql per
--             15-EXPERT-AUDIT.md (DevOps) — 2-phase deploy.
-- ============================================================


-- ──────────────────────────────────────────────────────────────
-- New agent_type values (11 MVP-1 + 1 MVP-2)
-- ──────────────────────────────────────────────────────────────
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'query_mapper';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'content_optimizer';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'freshness_agent';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'faq_builder';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'schema_generator';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'offsite_presence_builder';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'review_presence_planner';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'entity_builder';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'authority_blog_strategist';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'performance_tracker';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'reddit_presence_planner';
ALTER TYPE agent_type ADD VALUE IF NOT EXISTS 'video_seo_agent';


-- ──────────────────────────────────────────────────────────────
-- New plan_tier values (Discover / Build / Scale)
-- Old values (starter / pro / business) remain until Phase 3 cleanup
-- which will not ship until all rows are migrated and verified.
-- ──────────────────────────────────────────────────────────────
ALTER TYPE plan_tier ADD VALUE IF NOT EXISTS 'discover';
ALTER TYPE plan_tier ADD VALUE IF NOT EXISTS 'build';
ALTER TYPE plan_tier ADD VALUE IF NOT EXISTS 'scale';


-- ──────────────────────────────────────────────────────────────
-- content_item_status: add 'rejected' for Inbox state machine
-- Must live here (standalone, no transaction) so migration 02
-- can safely reference 'rejected' in function bodies.
-- ──────────────────────────────────────────────────────────────
ALTER TYPE content_item_status ADD VALUE IF NOT EXISTS 'rejected';
