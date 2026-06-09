-- Migration: 20260608000001_scan_measurement_v2.sql
-- Purpose: Wave 3 — scan measurement v2. Extends query_positions, scan_engine_results,
--          tracked_queries with per-observation evidence fields, answer-shape columns,
--          and query-weight/intent fields. Adds business_contexts (L1 context cache),
--          telemetry_events (L4 passive signals), and factor_catalog (versioned impact
--          weights) with seed data from SCAN-MEASUREMENT-MODEL.md §3.
-- Rollback: see rollback/20260608000001_scan_measurement_v2.rollback.sql
-- Tier: irreversible (new tables + ALTERs) — requires QA-Lead PASS + Adam sign-off before apply

-- ─────────────────────────────────────────────────────────────────────────────
-- A. ALTER query_positions — observation ledger, evidence fields
-- ─────────────────────────────────────────────────────────────────────────────

-- Stable citation handle — narration references this, not the internal id PK.
-- Lock-safe idempotent pattern:
--   1. Add column nullable (no default) — no table rewrite, no AccessExclusiveLock on data
--   2. Backfill NULLs with gen_random_uuid()
--      Full-table UPDATE; unbatched lock window accepted given the current pre-revenue
--      (near-empty) table size. Batch via LIMIT loop if this table is ever large at apply time.
--   3. Set DEFAULT so future inserts get a value without rewriting
--   4. Set NOT NULL — NOTE: SET NOT NULL takes a brief AccessExclusiveLock + full table scan;
--      acceptable here because query_positions is empty/tiny pre-revenue. Revisit
--      (NOT VALID CHECK → VALIDATE pattern) before this table grows large.
--   5. Unique index first, then promote to constraint (idempotent via IF NOT EXISTS)
ALTER TABLE public.query_positions ADD COLUMN IF NOT EXISTS evidence_id uuid;
UPDATE public.query_positions SET evidence_id = gen_random_uuid() WHERE evidence_id IS NULL;
ALTER TABLE public.query_positions ALTER COLUMN evidence_id SET DEFAULT gen_random_uuid();
-- SET NOT NULL takes a brief AccessExclusiveLock + full table scan; acceptable here because
-- query_positions is empty/tiny pre-revenue. Revisit (NOT VALID CHECK → VALIDATE pattern)
-- before this table grows large.
ALTER TABLE public.query_positions ALTER COLUMN evidence_id SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS query_positions_evidence_id_unique
  ON public.query_positions (evidence_id);
DO $$ BEGIN
  ALTER TABLE public.query_positions
    ADD CONSTRAINT query_positions_evidence_id_unique UNIQUE
    USING INDEX query_positions_evidence_id_unique;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Number of independent observations averaged into this row.
ALTER TABLE public.query_positions
  ADD COLUMN IF NOT EXISTS sample_n int;

DO $$ BEGIN
  ALTER TABLE public.query_positions
    ADD CONSTRAINT query_positions_sample_n_check CHECK (sample_n IS NULL OR sample_n > 0);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Wilson confidence interval bounds.
ALTER TABLE public.query_positions
  ADD COLUMN IF NOT EXISTS ci_low numeric;

ALTER TABLE public.query_positions
  ADD COLUMN IF NOT EXISTS ci_high numeric;

-- ci_low/ci_high are Wilson CI bounds on a PROPORTION (presence rate) in [0,1]; aggregate score/position bands live in the read model, not this column.
-- The constraint forces the pair to be both-NULL or both-present-and-valid (prevents half-populated CI rows).
DO $$ BEGIN
  ALTER TABLE public.query_positions
    ADD CONSTRAINT query_positions_ci_bounds_check
      CHECK (
        (ci_low IS NULL) = (ci_high IS NULL)
        AND (ci_low IS NULL OR (ci_low >= 0 AND ci_high <= 1 AND ci_low <= ci_high))
      );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Pinned model id used for this observation run (traceability).
ALTER TABLE public.query_positions
  ADD COLUMN IF NOT EXISTS model_id text;

-- The kind of probe run that produced this row. Nullable to preserve legacy rows.
ALTER TABLE public.query_positions
  ADD COLUMN IF NOT EXISTS run_kind text;

DO $$ BEGIN
  ALTER TABLE public.query_positions
    ADD CONSTRAINT query_positions_run_kind_check
      CHECK (run_kind IN ('daily_light', 'weekly_deep', 'free', 'switchback'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- B. ALTER scan_engine_results — raw store, answer-shape columns
-- ─────────────────────────────────────────────────────────────────────────────
-- NOTE: sentiment already exists on this table (confirmed in 20260520100006_scans.sql).
--       Do NOT re-add it.

-- The structural shape of the engine's answer for this probe.
ALTER TABLE public.scan_engine_results
  ADD COLUMN IF NOT EXISTS shape text;

DO $$ BEGIN
  ALTER TABLE public.scan_engine_results
    ADD CONSTRAINT scan_engine_results_shape_check
      CHECK (shape IN (
        'ranked_listicle',
        'single_recommendation',
        'comparison',
        'negative_avoid',
        'cited_as_source',
        'passing_mention',
        'category_defining',
        'do_your_own_research',
        'tool_vs_service_vs_product',
        'local_pack',
        'navigational_branded',
        'no_answer'
      ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Whether this shape is a win / partial / loss for the business.
ALTER TABLE public.scan_engine_results
  ADD COLUMN IF NOT EXISTS shape_outcome text;

DO $$ BEGIN
  ALTER TABLE public.scan_engine_results
    ADD CONSTRAINT scan_engine_results_shape_outcome_check
      CHECK (shape_outcome IN ('win', 'partial', 'loss'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- An outcome cannot exist without its shape (prevents orphaned outcome with no shape context).
DO $$ BEGIN
  ALTER TABLE public.scan_engine_results
    ADD CONSTRAINT scan_engine_results_shape_outcome_coupling_check
      CHECK (shape_outcome IS NULL OR shape IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- C. ALTER tracked_queries — query weight + intent bucket for W5 scoring
-- ─────────────────────────────────────────────────────────────────────────────

-- Relative weight of this query in the business's visibility score.
ALTER TABLE public.tracked_queries
  ADD COLUMN IF NOT EXISTS weight numeric NOT NULL DEFAULT 1;

-- weight must be positive and bounded (feeds W5 scoring; prevents degenerate inputs).
DO $$ BEGIN
  ALTER TABLE public.tracked_queries
    ADD CONSTRAINT tracked_queries_weight_check
      CHECK (weight > 0 AND weight <= 100);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Code-ground-truth intent bucket (distinct from the existing free-text `intent`).
ALTER TABLE public.tracked_queries
  ADD COLUMN IF NOT EXISTS intent_bucket text;

DO $$ BEGIN
  ALTER TABLE public.tracked_queries
    ADD CONSTRAINT tracked_queries_intent_bucket_check
      CHECK (intent_bucket IN (
        'category_geo',
        'problem',
        'near_me',
        'branded',
        'comparison',
        'other'
      ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Branded queries are scored separately from visibility; flagged here.
ALTER TABLE public.tracked_queries
  ADD COLUMN IF NOT EXISTS is_branded boolean NOT NULL DEFAULT false;

-- ─────────────────────────────────────────────────────────────────────────────
-- C-authz. TRIGGER — enforce scoring column immutability for non-service roles
--
-- WHY THIS EXISTS:
--   The pre-existing "tracked_queries: owner write" policy (20260520100013_rls_policies.sql)
--   is FOR ALL with no column restriction. This means an authenticated owner can call:
--     UPDATE tracked_queries SET weight = 100 WHERE business_id = <theirs>
--   via the PostgREST REST API and inflate W5 visibility scoring 100×.
--
--   Supabase RLS does NOT support column-level GRANT exclusions — you cannot write
--   "FOR ALL EXCEPT (weight, intent_bucket, is_branded)" in a policy. Attempting
--   column-level GRANT with EXCLUDING is unsupported on Supabase RLS (see
--   20260525000004_rls_policies_agency.sql header note on column-level GRANT limits).
--
--   Solution: a BEFORE INSERT OR UPDATE trigger that, for any session role that is NOT
--   in the privileged allowlist (service_role, postgres, supabase_admin), enforces:
--     - On INSERT: silently normalize the 3 scoring columns to their safe defaults
--       (weight = 1, intent_bucket = NULL, is_branded = false) so the owner-create
--       path still works without error.
--     - On UPDATE: RAISE EXCEPTION with ERRCODE insufficient_privilege if the owner
--       attempts to change any of the 3 scoring columns.
--
--   PostgREST sets the active Postgres role via SET LOCAL ROLE:
--     authenticated  — for requests using the anon/service key with a valid JWT
--     service_role   — for requests using the service-role key (server-side only)
--   Migrations run as postgres (the superuser). supabase_admin is included for safety.
--
-- DECLARE-free: uses TG_OP branching in plpgsql body to avoid DECLARE variables,
-- sidestepping the Supabase SQL Editor semicolon-split bug on plpgsql DECLARE blocks.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.enforce_tracked_queries_scoring_immutable()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- service_role (probe/app writes) and the migration owner may set scoring columns freely.
  IF current_user IN ('service_role', 'postgres', 'supabase_admin') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    -- Silently normalize scoring columns to safe defaults for non-privileged sessions.
    -- Owner-create path still succeeds; any caller-supplied scoring values are dropped.
    NEW.weight       := 1;
    NEW.intent_bucket := NULL;
    NEW.is_branded   := false;
    RETURN NEW;
  END IF;

  -- TG_OP = 'UPDATE'
  -- Authenticated owners may edit query_text, intent, is_active, volume_estimate,
  -- cluster_id — but NOT the three scoring columns that feed W5 visibility scoring.
  IF NEW.weight        IS DISTINCT FROM OLD.weight
     OR NEW.intent_bucket IS DISTINCT FROM OLD.intent_bucket
     OR NEW.is_branded    IS DISTINCT FROM OLD.is_branded THEN
    RAISE EXCEPTION
      'tracked_queries scoring columns (weight, intent_bucket, is_branded) are not user-editable'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_tracked_queries_scoring_immutable ON public.tracked_queries;
CREATE TRIGGER trg_tracked_queries_scoring_immutable
  BEFORE INSERT OR UPDATE ON public.tracked_queries
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_tracked_queries_scoring_immutable();

-- ─────────────────────────────────────────────────────────────────────────────
-- D. NEW TABLE business_contexts — L1 context cache, 30-day TTL
-- ─────────────────────────────────────────────────────────────────────────────

-- Probe job runs on OPENROUTER_SCAN_KEY service role; the structural firewall
-- (probe role cannot read businesses identity columns) is enforced at the
-- role-grant level in Wave 5, not here.
CREATE TABLE IF NOT EXISTS public.business_contexts (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id         uuid        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  context             jsonb       NOT NULL,
  built_from_scan_id  uuid        REFERENCES public.scans(id) ON DELETE SET NULL,
  model_id            text,
  -- DEFAULT fires on INSERT only. The anticipated ON CONFLICT (business_id) DO UPDATE
  -- (app upsert on profile edit) MUST explicitly SET expires_at = now() + interval '30 days'.
  -- A column DEFAULT does NOT re-fire on UPDATE — omitting it on the upsert path would
  -- silently freeze the TTL, and the owner-read (expires_at > now()) filter would then hide
  -- a context that service_role is still scoring on.
  expires_at          timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (business_id)  -- one active context per business; app upserts on profile edit
);

-- NOTE: the UNIQUE (business_id) constraint above already creates a B-tree index on
-- business_id; a separate CREATE INDEX on that column is redundant and has been omitted.

CREATE INDEX IF NOT EXISTS business_contexts_expires_at_idx
  ON public.business_contexts (expires_at);

-- FK index: built_from_scan_id references scans(id). Postgres does not auto-index FK
-- columns; without this, a DELETE on scans would sequential-scan business_contexts
-- to find any rows pointing at the deleted scan (SET NULL trigger path).
CREATE INDEX IF NOT EXISTS business_contexts_built_from_scan_id_idx
  ON public.business_contexts (built_from_scan_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- E. NEW TABLE telemetry_events — L4 passive telemetry
-- ─────────────────────────────────────────────────────────────────────────────

-- Probe job runs on OPENROUTER_SCAN_KEY service role; the structural firewall
-- (probe role cannot read businesses identity columns) is enforced at the
-- role-grant level in Wave 5, not here.
CREATE TABLE IF NOT EXISTS public.telemetry_events (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  uuid        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  event_type   text        NOT NULL,
  source       text,
  url          text,
  metadata     jsonb,
  occurred_at  timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT telemetry_events_event_type_check
    CHECK (event_type IN (
      'ai_bot_crawl',
      'gsc_ai_referral',
      'referrer_hit',
      'survey_response'
    ))
);

CREATE INDEX IF NOT EXISTS telemetry_events_business_occurred_idx
  ON public.telemetry_events (business_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS telemetry_events_event_type_idx
  ON public.telemetry_events (event_type);

-- Per-tenant event-type time-range queries (dominant read path for telemetry dashboards).
CREATE INDEX IF NOT EXISTS telemetry_events_business_type_time_idx
  ON public.telemetry_events (business_id, event_type, occurred_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- F. NEW TABLE factor_catalog — versioned impact weights (config, not code)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.factor_catalog (
  id              uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  factor_key      text    NOT NULL,
  tier            int     NOT NULL,
  display_name    text    NOT NULL,
  description     text,
  impact_weight   numeric NOT NULL DEFAULT 0,
  weight_source   text    NOT NULL DEFAULT 'vendor_estimated',
  -- playbook_id maps to agent enum values (nullable where no agent covers the factor):
  --   content_optimizer | schema_generator | review_presence_planner | reddit_presence_planner
  playbook_id     text,
  -- Tier-3 rows MUST have promises_lift = false (enforced by DB constraint below + application seed).
  promises_lift   boolean NOT NULL DEFAULT true,
  version         int     NOT NULL DEFAULT 1,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT factor_catalog_factor_key_version_unique UNIQUE (factor_key, version),
  CONSTRAINT factor_catalog_tier_check CHECK (tier BETWEEN 1 AND 3),
  CONSTRAINT factor_catalog_weight_source_check
    CHECK (weight_source IN ('vendor_estimated', 'beamix_measured')),
  -- impact_weight is a non-negative numeric weight; negative weights have no defined meaning.
  CONSTRAINT factor_catalog_impact_weight_check CHECK (impact_weight >= 0),
  -- Tier-3 factors represent hygiene signals that NEVER promise lift to users.
  -- This encodes the product invariant "Tier-3 factors are hygiene only" as a DB constraint.
  CONSTRAINT factor_catalog_tier3_no_lift_check CHECK (tier <> 3 OR promises_lift = false)
);

CREATE INDEX IF NOT EXISTS factor_catalog_is_active_idx
  ON public.factor_catalog (is_active);

-- Scoring reads active factors by tier (dominant path for W5 scoring engine).
CREATE INDEX IF NOT EXISTS factor_catalog_active_tier_idx
  ON public.factor_catalog (is_active, tier);

-- ─────────────────────────────────────────────────────────────────────────────
-- F-seed. Seed factor_catalog v1 — 16 factors from SCAN-MEASUREMENT-MODEL.md §3
-- Single INSERT with VALUES (LANGUAGE-sql-safe, no plpgsql DECLARE).
-- ON CONFLICT DO NOTHING makes this idempotent on re-run.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.factor_catalog
  (factor_key, tier, display_name, description, impact_weight, weight_source, playbook_id, promises_lift, version)
VALUES
  -- ── Tier 1 — PROVEN, fast/medium fix ──────────────────────────────────────
  (
    'on_page_princeton_tactics', 1,
    'On-Page Princeton Tactics',
    'Stats, quotes, cited sources, answer-first structure — each tactic correlated +30-40% citation lift (KDD 2024)',
    0.35, 'vendor_estimated', 'content_optimizer', true, 1
  ),
  (
    'extractable_structure', 1,
    'Extractable Structure',
    'TL;DR, FAQ block, clear heading hierarchy — citations cluster in the first 30% of content',
    0.30, 'vendor_estimated', 'content_optimizer', true, 1
  ),
  (
    'content_freshness', 1,
    'Content Freshness',
    'Visible dateModified markup — AI citation half-life ~4.5 weeks; stale pages drop fast',
    0.28, 'vendor_estimated', 'content_optimizer', true, 1
  ),
  (
    'listicle_inclusion', 1,
    'Third-Party Listicle Inclusion',
    'Presence in "best X" / "top X" articles — accounts for 21-41% of commercial AI citations',
    0.32, 'vendor_estimated', NULL, true, 1
  ),
  (
    'reddit_quora_presence', 1,
    'Reddit / Quora Presence',
    'Reddit is the #1 cited domain (~40% rate); Quora also cited heavily — community visibility drives AI citation',
    0.33, 'vendor_estimated', 'reddit_presence_planner', true, 1
  ),
  (
    'review_systems', 1,
    'Review Systems',
    'Volume + recency across Google, G2, Capterra, Trustpilot — review presence correlates 3.4× citation lift',
    0.34, 'vendor_estimated', 'review_presence_planner', true, 1
  ),
  (
    'earned_media_pr', 1,
    'Earned Media / Digital PR',
    '82% of AI citations trace back to digital PR coverage; editorial mentions are the strongest signal',
    0.36, 'vendor_estimated', NULL, true, 1
  ),
  (
    'wikidata_entity', 1,
    'Wikidata Entity',
    'Verified Wikidata/Knowledge Graph entity increases trustworthiness signal for AI engines',
    0.25, 'vendor_estimated', NULL, true, 1
  ),
  (
    'ai_bot_allowlist', 1,
    'AI Bot Allowlist',
    'robots.txt not blocking GPTBot, PerplexityBot, ClaudeBot, Google-Extended — blocked = invisible to those engines',
    0.40, 'vendor_estimated', 'content_optimizer', true, 1
  ),
  -- ── Tier 2 — LIKELY, moderate impact ──────────────────────────────────────
  (
    'topical_authority_cluster', 2,
    'Topical Authority Cluster',
    'Depth of coverage on core topic cluster — breadth of related pages signals topical expertise to AI engines',
    0.20, 'vendor_estimated', 'content_optimizer', true, 1
  ),
  (
    'linkedin_presence', 2,
    'LinkedIn Presence',
    'Company page completeness and post activity — LinkedIn is a trusted source AI engines pull from',
    0.18, 'vendor_estimated', NULL, true, 1
  ),
  (
    'youtube_presence', 2,
    'YouTube Presence',
    'Video content on YouTube — Perplexity ranks YouTube as its #1 cited video source',
    0.17, 'vendor_estimated', NULL, true, 1
  ),
  (
    'basic_schema', 2,
    'Basic Schema Markup',
    'Organization, Product, FAQ, Review schema types — baseline structured data for engine parsing',
    0.19, 'vendor_estimated', 'schema_generator', true, 1
  ),
  -- ── Tier 3 — hygiene, NEVER promise lift ──────────────────────────────────
  (
    'llms_txt', 3,
    'llms.txt File',
    'llms.txt presence — n=300k study shows no measurable citation impact; hygiene only',
    0.02, 'vendor_estimated', NULL, false, 1
  ),
  (
    'schema_beyond_basics', 3,
    'Schema Beyond Basics',
    'Advanced schema types beyond Organization/FAQ/Product — minimal measurable AI citation impact',
    0.03, 'vendor_estimated', 'schema_generator', false, 1
  ),
  (
    'backlinks_dr', 3,
    'Backlinks / Domain Rating',
    'Traditional SEO link metrics — 3× weaker than direct mentions for AI citation; do NOT repackage as GEO',
    0.04, 'vendor_estimated', NULL, false, 1
  )
ON CONFLICT (factor_key, version) DO NOTHING;

-- Seed integrity guard: fail fast if any of the expected 16 v1 rows are missing.
-- Uses < 16 (not <> 16) so that pre-existing extra rows from re-seeding do not cause false failures.
DO $$ BEGIN
  IF (SELECT COUNT(*) FROM public.factor_catalog WHERE version = 1) < 16 THEN
    RAISE EXCEPTION 'factor_catalog v1 seed count drift: expected at least 16, got %',
      (SELECT COUNT(*) FROM public.factor_catalog WHERE version = 1);
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- G. RLS — 3 new tables
-- Patterns match 20260520100013_rls_policies.sql exactly.
-- ─────────────────────────────────────────────────────────────────────────────

-- TABLE: business_contexts  (Pattern B — via businesses.user_id)
-- SECURITY NOTE: The "owner write" policy has been intentionally OMITTED.
-- business_contexts.context is a JSONB blob consumed by the service-role probe/scoring job.
-- Allowing authenticated clients to write this column is a prompt-injection + cache-DoS vector:
-- a malicious user could inject adversarial context that corrupts their own scan scoring, or
-- trigger expensive cache invalidations at will. All writes go through service_role
-- (the app already uses the service key for context generation and invalidation).
ALTER TABLE public.business_contexts ENABLE ROW LEVEL SECURITY;

-- expires_at filter: the REST API must never surface context past its 30-day TTL to clients.
-- The service_role probe job reads and writes via its own bypass; the TTL filter only applies
-- to the user-facing owner-read policy.
DO $$ BEGIN
  CREATE POLICY "business_contexts: owner read"
    ON public.business_contexts FOR SELECT
    USING (
      expires_at > now()
      AND business_id IN (
        SELECT id FROM public.businesses WHERE user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "business_contexts: service_role all"
    ON public.business_contexts FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- TABLE: telemetry_events  (Pattern B — via businesses.user_id)
ALTER TABLE public.telemetry_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "telemetry_events: owner read"
    ON public.telemetry_events FOR SELECT
    USING (
      business_id IN (
        SELECT id FROM public.businesses WHERE user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "telemetry_events: service_role all"
    ON public.telemetry_events FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- TABLE: factor_catalog  (Pattern P — public read config table, service_role all)
-- Global config: readable by any role including anon (e.g., free-scan pre-auth surfaces);
-- only service_role can write. Matches the pattern used for `plans` and `feature_flags`.
ALTER TABLE public.factor_catalog ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "factor_catalog: public read"
    ON public.factor_catalog FOR SELECT
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "factor_catalog: service_role all"
    ON public.factor_catalog FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- H. Additional performance indexes
-- ─────────────────────────────────────────────────────────────────────────────

-- Dominant W5 scoring path: active non-branded queries per business per intent bucket.
CREATE INDEX IF NOT EXISTS tracked_queries_active_nonbranded_idx
  ON public.tracked_queries (business_id, intent_bucket)
  WHERE is_active = true AND is_branded = false;

-- Probe-kind trend queries: fetch positions by business, run_kind, recency.
CREATE INDEX IF NOT EXISTS query_positions_business_run_kind_idx
  ON public.query_positions (business_id, run_kind, created_at DESC);
