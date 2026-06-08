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
ALTER TABLE public.query_positions
  ADD COLUMN IF NOT EXISTS evidence_id uuid NOT NULL DEFAULT gen_random_uuid();

-- UNIQUE constraint on evidence_id (named so rollback can drop it cleanly).
-- The UNIQUE index it creates doubles as the lookup index; no separate index needed.
ALTER TABLE public.query_positions
  ADD CONSTRAINT query_positions_evidence_id_unique UNIQUE (evidence_id);

-- Number of independent observations averaged into this row.
ALTER TABLE public.query_positions
  ADD COLUMN IF NOT EXISTS sample_n int;

-- Wilson confidence interval bounds.
ALTER TABLE public.query_positions
  ADD COLUMN IF NOT EXISTS ci_low numeric;

ALTER TABLE public.query_positions
  ADD COLUMN IF NOT EXISTS ci_high numeric;

-- Pinned model id used for this observation run (traceability).
ALTER TABLE public.query_positions
  ADD COLUMN IF NOT EXISTS model_id text;

-- The kind of probe run that produced this row. Nullable to preserve legacy rows.
ALTER TABLE public.query_positions
  ADD COLUMN IF NOT EXISTS run_kind text;

ALTER TABLE public.query_positions
  ADD CONSTRAINT query_positions_run_kind_check
    CHECK (run_kind IN ('daily_light', 'weekly_deep', 'free', 'switchback'));

-- ─────────────────────────────────────────────────────────────────────────────
-- B. ALTER scan_engine_results — raw store, answer-shape columns
-- ─────────────────────────────────────────────────────────────────────────────
-- NOTE: sentiment already exists on this table (confirmed in 20260520100006_scans.sql).
--       Do NOT re-add it.

-- The structural shape of the engine's answer for this probe.
ALTER TABLE public.scan_engine_results
  ADD COLUMN IF NOT EXISTS shape text;

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

-- Whether this shape is a win / partial / loss for the business.
ALTER TABLE public.scan_engine_results
  ADD COLUMN IF NOT EXISTS shape_outcome text;

ALTER TABLE public.scan_engine_results
  ADD CONSTRAINT scan_engine_results_shape_outcome_check
    CHECK (shape_outcome IN ('win', 'partial', 'loss'));

-- ─────────────────────────────────────────────────────────────────────────────
-- C. ALTER tracked_queries — query weight + intent bucket for W5 scoring
-- ─────────────────────────────────────────────────────────────────────────────

-- Relative weight of this query in the business's visibility score.
ALTER TABLE public.tracked_queries
  ADD COLUMN IF NOT EXISTS weight numeric NOT NULL DEFAULT 1;

-- Code-ground-truth intent bucket (distinct from the existing free-text `intent`).
ALTER TABLE public.tracked_queries
  ADD COLUMN IF NOT EXISTS intent_bucket text;

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

-- Branded queries are scored separately from visibility; flagged here.
ALTER TABLE public.tracked_queries
  ADD COLUMN IF NOT EXISTS is_branded boolean NOT NULL DEFAULT false;

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
  -- App sets expires_at = now() + interval '30 days' on upsert.
  -- The DEFAULT here is a safety floor in case the app omits it.
  expires_at          timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (business_id)  -- one active context per business; app upserts on profile edit
);

CREATE INDEX IF NOT EXISTS business_contexts_business_id_idx
  ON public.business_contexts (business_id);

CREATE INDEX IF NOT EXISTS business_contexts_expires_at_idx
  ON public.business_contexts (expires_at);

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
  -- Tier-3 rows MUST have promises_lift = false (enforced by application seed + audit).
  promises_lift   boolean NOT NULL DEFAULT true,
  version         int     NOT NULL DEFAULT 1,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT factor_catalog_factor_key_version_unique UNIQUE (factor_key, version),
  CONSTRAINT factor_catalog_tier_check CHECK (tier BETWEEN 1 AND 3),
  CONSTRAINT factor_catalog_weight_source_check
    CHECK (weight_source IN ('vendor_estimated', 'beamix_measured'))
);

CREATE INDEX IF NOT EXISTS factor_catalog_is_active_idx
  ON public.factor_catalog (is_active);

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

-- ─────────────────────────────────────────────────────────────────────────────
-- G. RLS — 3 new tables
-- Patterns match 20260520100013_rls_policies.sql exactly.
-- ─────────────────────────────────────────────────────────────────────────────

-- TABLE: business_contexts  (Pattern B — via businesses.user_id)
ALTER TABLE public.business_contexts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "business_contexts: owner read"
  ON public.business_contexts FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "business_contexts: owner write"
  ON public.business_contexts FOR ALL
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "business_contexts: service_role all"
  ON public.business_contexts FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- TABLE: telemetry_events  (Pattern B — via businesses.user_id)
ALTER TABLE public.telemetry_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "telemetry_events: owner read"
  ON public.telemetry_events FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "telemetry_events: service_role all"
  ON public.telemetry_events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- TABLE: factor_catalog  (Pattern P — public read config table, service_role write)
-- Global config: authenticated users read; only service_role can write.
-- Matches the pattern used for `plans` and `feature_flags`.
ALTER TABLE public.factor_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "factor_catalog: authenticated read"
  ON public.factor_catalog FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "factor_catalog: service_role all"
  ON public.factor_catalog FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
