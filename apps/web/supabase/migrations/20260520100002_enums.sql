-- Migration: 20260520_02_enums.sql
-- Purpose: Authoritative enum definitions for Beamix v2 (clean schema, no legacy values)
-- Note: plan_tier has ONLY discover/build/scale — no starter/pro/business values
-- Rollback: DROP TYPE plan_tier, agent_type, agent_job_status, pipeline_stage,
--           inbox_status, suggestion_status, notification_type, subscription_status CASCADE;

CREATE TYPE plan_tier AS ENUM ('discover', 'build', 'scale');

CREATE TYPE agent_type AS ENUM (
  'query_mapper',
  'content_optimizer',
  'freshness_agent',
  'faq_builder',
  'schema_generator',
  'offsite_presence_builder',
  'review_presence_planner',
  'entity_builder',
  'authority_blog_strategist',
  'performance_tracker',
  'reddit_presence_planner'
);

CREATE TYPE agent_job_status AS ENUM (
  'queued',
  'running',
  'qa_failed',
  'succeeded',
  'failed',
  'cancelled'
);

CREATE TYPE pipeline_stage AS ENUM ('plan', 'research', 'do', 'qa', 'summarize');

CREATE TYPE inbox_status AS ENUM (
  'draft',
  'review',
  'approved',
  'archived',
  'rejected',
  'failed'
);

CREATE TYPE suggestion_status AS ENUM (
  'pending',
  'running',
  'dismissed',
  'converted'
);

CREATE TYPE notification_type AS ENUM (
  'item_ready',
  'scan_complete',
  'budget_75',
  'budget_100',
  'competitor_alert',
  'suggestion_generated',
  'day1_ready',
  'run_failed'
);

CREATE TYPE subscription_status AS ENUM (
  'trialing',
  'active',
  'past_due',
  'paused',
  'cancelled'
  -- Note: UK spelling 'cancelled' per project convention (memory feedback_supabase_plpgsql.md)
);
