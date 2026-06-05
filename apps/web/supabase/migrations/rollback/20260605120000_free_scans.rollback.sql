-- Rollback: 20260605120000_free_scans.sql
-- Drops the free_scans table and all dependent indexes/policies.
-- DESTRUCTIVE: permanently deletes all free scan rows and associated results.
-- Run only after confirming the forward migration has been applied and that
-- no application code is actively reading/writing free_scans.

DROP TABLE IF EXISTS public.free_scans;
