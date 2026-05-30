-- Rollback: 20260529000007_atomic_consume_deliverable.rollback.sql
-- Purpose: Drop the atomic consume_deliverable RPC added in 20260529000007.

DROP FUNCTION IF EXISTS public.consume_deliverable(uuid, date, text, integer);
