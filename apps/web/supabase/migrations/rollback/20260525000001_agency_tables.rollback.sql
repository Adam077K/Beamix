-- Rollback: 20260525000001_agency_tables.sql
-- Reverses all DDL from the Wave 1 agency tables migration.
-- DESTRUCTIVE: drops 7 tables + 5 enums + 2 trigger functions.
-- Run only after confirming NO production data in these tables.
--
-- Execution order: reverse of creation (drop dependent tables first).

-- Drop triggers and trigger function
DROP TRIGGER IF EXISTS refund_events_no_delete ON public.refund_events;
DROP TRIGGER IF EXISTS refund_events_no_update ON public.refund_events;
DROP FUNCTION IF EXISTS public.refund_events_immutable();

-- Drop FK from approval_queue → weekly_digests (added by ALTER TABLE in migration)
ALTER TABLE public.approval_queue
  DROP CONSTRAINT IF EXISTS fk_approval_queue_digest;

-- Drop FK from refund_events → revenue_events (added by migration 03)
-- NOTE: if migration 03 has not been rolled back yet, this FK may still exist.
-- Migration 03 rollback must be run first to drop revenue_events, which will
-- cascade-drop the FK from refund_events.revenue_event_id.

-- Drop tables in dependency order (children before parents)
DROP TABLE IF EXISTS public.founding_100_cohort;
DROP TABLE IF EXISTS public.refund_events;
DROP TABLE IF EXISTS public.weekly_digests;
DROP TABLE IF EXISTS public.publishing_credentials;
DROP TABLE IF EXISTS public.deliverables_per_customer_per_month;
DROP TABLE IF EXISTS public.approval_queue;
DROP TABLE IF EXISTS public.brand_fingerprints;

-- Drop enums (safe only after tables are dropped)
DROP TYPE IF EXISTS publishing_credential_status;
DROP TYPE IF EXISTS publishing_platform;
DROP TYPE IF EXISTS revenue_event_type;
DROP TYPE IF EXISTS approval_kind;
DROP TYPE IF EXISTS approval_state;
