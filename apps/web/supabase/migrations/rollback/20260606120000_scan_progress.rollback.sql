-- Rollback: 20260606120000_scan_progress.sql
-- DESTRUCTIVE: drops scan_progress table, policies, index, and Realtime publication entry.
-- Run only after confirming the forward migration has been applied and that no
-- application code is actively reading/writing scan_progress.

ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.scan_progress;

DROP POLICY IF EXISTS "scan_progress: anon select"     ON public.scan_progress;
DROP POLICY IF EXISTS "scan_progress: service_role all" ON public.scan_progress;

DROP TABLE IF EXISTS public.scan_progress;
