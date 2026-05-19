-- Fix overly permissive RLS policies that use FOR ALL USING (true) without TO service_role
-- These policies from 20260318_reconciliation.sql effectively disable RLS for writes
-- because any authenticated user can match the USING (true) clause.
-- Fix: restrict to service_role only.

-- email_log
DROP POLICY IF EXISTS "Service role manages email logs" ON public.email_log;
CREATE POLICY "Service role manages email logs" ON public.email_log
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- scan_queries
DROP POLICY IF EXISTS "Service role manages scan queries" ON public.scan_queries;
CREATE POLICY "Service role manages scan queries" ON public.scan_queries
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- scan_mentions
DROP POLICY IF EXISTS "Service role manages scan mentions" ON public.scan_mentions;
CREATE POLICY "Service role manages scan mentions" ON public.scan_mentions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- competitor_content_snapshots
DROP POLICY IF EXISTS "Service role manages competitor snapshots" ON public.competitor_content_snapshots;
CREATE POLICY "Service role manages competitor snapshots" ON public.competitor_content_snapshots
  FOR ALL TO service_role USING (true) WITH CHECK (true);
