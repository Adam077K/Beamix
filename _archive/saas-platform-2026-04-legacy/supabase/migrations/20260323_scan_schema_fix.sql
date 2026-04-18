-- =============================================================================
-- Scan Schema Fix + Redesign Columns
-- Fixes drift between code and DDL, adds columns for scan architecture redesign
--
-- Rollback:
--   ALTER TABLE scan_engine_results DROP COLUMN IF EXISTS is_cited;
--   ALTER TABLE scan_engine_results DROP COLUMN IF EXISTS mention_count;
--   ALTER TABLE scan_engine_results DROP COLUMN IF EXISTS queries_checked;
--   ALTER TABLE scan_engine_results DROP COLUMN IF EXISTS queries_mentioned;
--   ALTER TABLE scan_engine_results DROP COLUMN IF EXISTS sentiment;
--   ALTER TABLE scan_engine_results DROP COLUMN IF EXISTS query_type;
--   ALTER TABLE scan_engine_results DROP COLUMN IF EXISTS cited_by_name;
--   ALTER TABLE scan_engine_results DROP COLUMN IF EXISTS confidence;
--   ALTER TABLE scan_engine_results DROP COLUMN IF EXISTS response_excerpt;
--   ALTER TABLE scan_engine_results DROP COLUMN IF EXISTS cited_urls;
--   ALTER TABLE scan_engine_results ALTER COLUMN prompt_text DROP DEFAULT;
--   ALTER TABLE scans DROP COLUMN IF EXISTS mentions_count;
--   ALTER TABLE scans DROP COLUMN IF EXISTS engines_scanned;
--   ALTER TABLE scans DROP COLUMN IF EXISTS mock_engines;
--   ALTER TABLE free_scans DROP COLUMN IF EXISTS overall_score;
--   ALTER TABLE free_scans DROP COLUMN IF EXISTS expires_at;
--   ALTER TABLE free_scans DROP COLUMN IF EXISTS mock_engines;
-- =============================================================================

-- -----------------------------------------------------------------------------
-- scan_engine_results: fix schema drift + add redesign columns
-- -----------------------------------------------------------------------------

-- Columns that scan-manual.ts writes but DDL lacks:
ALTER TABLE public.scan_engine_results ADD COLUMN IF NOT EXISTS is_cited boolean DEFAULT false;
ALTER TABLE public.scan_engine_results ADD COLUMN IF NOT EXISTS mention_count integer DEFAULT 0;
ALTER TABLE public.scan_engine_results ADD COLUMN IF NOT EXISTS queries_checked integer DEFAULT 0;
ALTER TABLE public.scan_engine_results ADD COLUMN IF NOT EXISTS queries_mentioned integer DEFAULT 0;
-- Note: existing DDL has sentiment_score (integer 0-100). This adds a separate
-- text sentiment column used by the scan engine adapter for categorical output.
ALTER TABLE public.scan_engine_results ADD COLUMN IF NOT EXISTS sentiment text CHECK (sentiment IN ('positive', 'neutral', 'negative'));

-- prompt_text is NOT NULL with no default — code doesn't always supply it:
ALTER TABLE public.scan_engine_results ALTER COLUMN prompt_text SET DEFAULT '';

-- New columns for scan redesign:
ALTER TABLE public.scan_engine_results ADD COLUMN IF NOT EXISTS query_type text;
ALTER TABLE public.scan_engine_results ADD COLUMN IF NOT EXISTS cited_by_name boolean DEFAULT false;
ALTER TABLE public.scan_engine_results ADD COLUMN IF NOT EXISTS confidence real DEFAULT 1.0;
ALTER TABLE public.scan_engine_results ADD COLUMN IF NOT EXISTS response_excerpt text;
ALTER TABLE public.scan_engine_results ADD COLUMN IF NOT EXISTS cited_urls jsonb DEFAULT '[]';

-- -----------------------------------------------------------------------------
-- scans: fix schema drift
-- -----------------------------------------------------------------------------

-- Columns that scan-manual.ts writes but DDL lacks:
-- Note: existing DDL has engines_queried (text[]). engines_scanned is a separate
-- column tracking which engines completed successfully (subset of engines_queried).
ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS mentions_count integer DEFAULT 0;
ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS engines_scanned text[] DEFAULT '{}';

-- New column for mock tracking (which engines returned mocked data):
ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS mock_engines text[] DEFAULT '{}';

-- -----------------------------------------------------------------------------
-- free_scans: fix schema drift
-- -----------------------------------------------------------------------------

-- Columns that scan/start route.ts writes but DDL lacks:
ALTER TABLE public.free_scans ADD COLUMN IF NOT EXISTS overall_score integer CHECK (overall_score >= 0 AND overall_score <= 100);
ALTER TABLE public.free_scans ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- New column for mock tracking:
ALTER TABLE public.free_scans ADD COLUMN IF NOT EXISTS mock_engines text[] DEFAULT '{}';

-- Index: free_scans expiry cleanup (used by cron to purge expired anonymous scans)
CREATE INDEX IF NOT EXISTS idx_free_scans_expires ON public.free_scans(expires_at)
  WHERE expires_at IS NOT NULL;
