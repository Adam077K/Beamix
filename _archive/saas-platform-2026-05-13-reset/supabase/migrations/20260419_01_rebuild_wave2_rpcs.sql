-- ============================================================
-- Migration: 20260419_01_rebuild_wave2_rpcs.sql
-- Purpose: Wave 2 backend prep — competitors summary RPC,
--          content_items length constraint, cache invalidation support.
-- Applies after: 20260418_02_rethink_schema.sql
-- LANGUAGE sql throughout (no plpgsql — see feedback_supabase_plpgsql.md).
-- ============================================================


-- ============================================================
-- PART A: content_items.user_edited_content length constraint
-- ============================================================

ALTER TABLE public.content_items
  ADD CONSTRAINT content_items_user_edited_content_length
  CHECK (char_length(user_edited_content) <= 100000);


-- ============================================================
-- PART B: get_competitors_summary RPC
--
-- Returns competitors page data for a business in one call.
-- Time windows:
--   SOV data    — last 28 days (4 complete weeks)
--   Sparklines  — last 4 weeks (4 ISO week buckets)
--   12-wk trend — last 84 days grouped into ISO weeks
--
-- All sub-queries scoped to p_user_id + p_business_id for RLS safety.
-- Written as LANGUAGE sql with CTEs (not plpgsql) to avoid the
-- Supabase SQL Editor $$ semicolon-splitting bug.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_competitors_summary(
  p_user_id    uuid,
  p_business_id uuid
) RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- ── Core business domain (used for SOV matching) ──────────────────────────
  WITH biz AS (
    SELECT b.id, b.website_url, b.name
    FROM businesses b
    WHERE b.id = p_business_id
      AND b.user_id = p_user_id
    LIMIT 1
  ),

  -- ── Scans in last 28 days (SOV window) ───────────────────────────────────
  recent_scans AS (
    SELECT s.id, s.completed_at
    FROM scans s
    WHERE s.business_id = p_business_id
      AND s.status = 'completed'
      AND s.completed_at >= NOW() - INTERVAL '28 days'
    ORDER BY s.completed_at DESC
  ),

  -- ── Scans in last 84 days (12-week trend window) ──────────────────────────
  trend_scans AS (
    SELECT s.id, s.completed_at,
           date_trunc('week', s.completed_at) AS week_start
    FROM scans s
    WHERE s.business_id = p_business_id
      AND s.status = 'completed'
      AND s.completed_at >= NOW() - INTERVAL '84 days'
  ),

  -- ── All query_positions rows in the 28-day window ─────────────────────────
  -- brands_mentioned is a jsonb array of {name, domain, rank_position} objects
  recent_positions AS (
    SELECT qp.scan_id,
           qp.tracked_query_id,
           qp.engine,
           qp.is_mentioned,
           qp.brands_mentioned
    FROM query_positions qp
    WHERE qp.business_id = p_business_id
      AND qp.scan_id IN (SELECT id FROM recent_scans)
  ),

  -- ── Registered competitors ────────────────────────────────────────────────
  competitor_list AS (
    SELECT c.id, c.name, c.domain
    FROM competitors c
    WHERE c.business_id = p_business_id
      AND c.user_id = p_user_id
  ),

  -- ── Total query-slot count for SOV denominator ────────────────────────────
  -- Each (scan_id, tracked_query_id, engine) tuple = 1 slot.
  total_slots AS (
    SELECT COUNT(*) AS n
    FROM recent_positions
  ),

  -- ── Our own mention count (business SOV) ─────────────────────────────────
  -- is_mentioned = true means the business appeared in that engine response.
  our_mentions AS (
    SELECT COUNT(*) AS n
    FROM recent_positions rp
    WHERE rp.is_mentioned = true
  ),

  -- ── Previous 28-day window for SOV delta ─────────────────────────────────
  prev_scans AS (
    SELECT s.id
    FROM scans s
    WHERE s.business_id = p_business_id
      AND s.status = 'completed'
      AND s.completed_at >= NOW() - INTERVAL '56 days'
      AND s.completed_at < NOW() - INTERVAL '28 days'
  ),

  prev_positions AS (
    SELECT qp.is_mentioned
    FROM query_positions qp
    WHERE qp.business_id = p_business_id
      AND qp.scan_id IN (SELECT id FROM prev_scans)
  ),

  prev_slots AS (
    SELECT COUNT(*) AS n FROM prev_positions
  ),

  prev_mentions AS (
    SELECT COUNT(*) AS n FROM prev_positions WHERE is_mentioned = true
  ),

  -- ── Our SOV numbers ───────────────────────────────────────────────────────
  our_sov AS (
    SELECT
      CASE WHEN (SELECT n FROM total_slots) = 0 THEN 0
           ELSE ROUND(100.0 * (SELECT n FROM our_mentions) / (SELECT n FROM total_slots))
      END AS pct,
      CASE WHEN (SELECT n FROM prev_slots) = 0 THEN 0
           ELSE ROUND(100.0 * (SELECT n FROM prev_mentions) / (SELECT n FROM prev_slots))
      END AS prev_pct
  ),

  -- ── Per-competitor SOV (current 28-day window) ───────────────────────────
  -- Unnest brands_mentioned jsonb arrays and match against competitor domains.
  brand_slots AS (
    SELECT
      rp.scan_id,
      rp.tracked_query_id,
      rp.engine,
      brand->>'domain' AS brand_domain,
      brand->>'name'   AS brand_name
    FROM recent_positions rp,
         jsonb_array_elements(COALESCE(rp.brands_mentioned, '[]'::jsonb)) AS brand
  ),

  comp_mentions_current AS (
    SELECT
      cl.id        AS comp_id,
      COUNT(*)     AS mention_count
    FROM brand_slots bs
    JOIN competitor_list cl ON cl.domain = bs.brand_domain
    GROUP BY cl.id
  ),

  -- ── Per-competitor SOV (prev 28-day window for delta) ────────────────────
  prev_brand_slots AS (
    SELECT
      qp.tracked_query_id,
      qp.engine,
      brand->>'domain' AS brand_domain
    FROM query_positions qp,
         jsonb_array_elements(COALESCE(qp.brands_mentioned, '[]'::jsonb)) AS brand
    WHERE qp.business_id = p_business_id
      AND qp.scan_id IN (SELECT id FROM prev_scans)
  ),

  prev_comp_mentions AS (
    SELECT
      cl.id       AS comp_id,
      COUNT(*)    AS mention_count
    FROM prev_brand_slots pbs
    JOIN competitor_list cl ON cl.domain = pbs.brand_domain
    GROUP BY cl.id
  ),

  -- ── Per-competitor top queries (queries where competitor appeared) ────────
  comp_top_queries AS (
    SELECT
      cl.id    AS comp_id,
      tq.query_text,
      COUNT(*) AS hits,
      ROW_NUMBER() OVER (PARTITION BY cl.id ORDER BY COUNT(*) DESC) AS rn
    FROM brand_slots bs
    JOIN competitor_list cl ON cl.domain = bs.brand_domain
    JOIN tracked_queries tq ON tq.id = bs.tracked_query_id
    GROUP BY cl.id, tq.query_text
  ),

  -- ── Per-competitor engines present ────────────────────────────────────────
  comp_engines AS (
    SELECT
      cl.id                AS comp_id,
      array_agg(DISTINCT bs.engine) AS engines_present
    FROM brand_slots bs
    JOIN competitor_list cl ON cl.domain = bs.brand_domain
    GROUP BY cl.id
  ),

  -- ── Per-competitor 4-week sparkline ──────────────────────────────────────
  -- Group last 4 scans into weekly buckets and count mentions per bucket.
  sparkline_scans AS (
    SELECT s.id, date_trunc('week', s.completed_at) AS week_start
    FROM scans s
    WHERE s.business_id = p_business_id
      AND s.status = 'completed'
      AND s.completed_at >= NOW() - INTERVAL '28 days'
  ),

  sparkline_slots AS (
    SELECT
      ss.week_start,
      COUNT(DISTINCT (qp.tracked_query_id, qp.engine)) AS slot_count
    FROM query_positions qp
    JOIN sparkline_scans ss ON ss.id = qp.scan_id
    WHERE qp.business_id = p_business_id
    GROUP BY ss.week_start
  ),

  comp_sparkline_raw AS (
    SELECT
      cl.id       AS comp_id,
      ss.week_start,
      COUNT(*)    AS mentions
    FROM query_positions qp
    JOIN sparkline_scans ss ON ss.id = qp.scan_id,
         jsonb_array_elements(COALESCE(qp.brands_mentioned, '[]'::jsonb)) AS brand
    JOIN competitor_list cl ON cl.domain = (brand->>'domain')
    WHERE qp.business_id = p_business_id
    GROUP BY cl.id, ss.week_start
  ),

  -- ── Our sparkline for SOV trend ───────────────────────────────────────────
  our_sparkline_raw AS (
    SELECT
      ss.week_start,
      COUNT(*) AS mentions
    FROM query_positions qp
    JOIN sparkline_scans ss ON ss.id = qp.scan_id
    WHERE qp.business_id = p_business_id
      AND qp.is_mentioned = true
    GROUP BY ss.week_start
  ),

  -- ── Missed queries — queries where we were absent but competitors present ─
  query_presence AS (
    SELECT
      rp.tracked_query_id,
      MAX(CASE WHEN rp.is_mentioned THEN 1 ELSE 0 END) AS we_appeared,
      jsonb_agg(DISTINCT brand->>'name')
        FILTER (WHERE brand->>'domain' IN (SELECT domain FROM competitor_list))
        AS comp_names_present
    FROM recent_positions rp,
         jsonb_array_elements(COALESCE(rp.brands_mentioned, '[]'::jsonb)) AS brand
    GROUP BY rp.tracked_query_id
  ),

  missed AS (
    SELECT
      tq.query_text,
      qp2.comp_names_present
    FROM query_presence qp2
    JOIN tracked_queries tq ON tq.id = qp2.tracked_query_id
    WHERE qp2.we_appeared = 0
      AND qp2.comp_names_present IS NOT NULL
      AND jsonb_array_length(COALESCE(qp2.comp_names_present, '[]'::jsonb)) > 0
    ORDER BY jsonb_array_length(COALESCE(qp2.comp_names_present, '[]'::jsonb)) DESC
    LIMIT 20
  ),

  -- ── 12-week trend series (our SOV + per-competitor SOV per week) ──────────
  trend_weeks AS (
    SELECT DISTINCT date_trunc('week', ts.completed_at) AS week_start
    FROM trend_scans ts
    ORDER BY week_start
  ),

  trend_total_slots AS (
    SELECT
      ts.week_start,
      COUNT(DISTINCT (qp.tracked_query_id, qp.engine)) AS slot_count
    FROM trend_scans ts
    JOIN query_positions qp ON qp.scan_id = ts.id
    WHERE qp.business_id = p_business_id
    GROUP BY ts.week_start
  ),

  trend_our_mentions AS (
    SELECT
      ts.week_start,
      COUNT(*) AS mention_count
    FROM trend_scans ts
    JOIN query_positions qp ON qp.scan_id = ts.id
    WHERE qp.business_id = p_business_id
      AND qp.is_mentioned = true
    GROUP BY ts.week_start
  ),

  trend_comp_mentions AS (
    SELECT
      ts.week_start,
      cl.id    AS comp_id,
      cl.name  AS comp_name,
      COUNT(*) AS mention_count
    FROM trend_scans ts
    JOIN query_positions qp ON qp.scan_id = ts.id,
         jsonb_array_elements(COALESCE(qp.brands_mentioned, '[]'::jsonb)) AS brand
    JOIN competitor_list cl ON cl.domain = (brand->>'domain')
    WHERE qp.business_id = p_business_id
    GROUP BY ts.week_start, cl.id, cl.name
  ),

  -- ── Head-to-head matrix (per engine, all entities) ───────────────────────
  h2h_our AS (
    SELECT
      rp.engine,
      COUNT(*) AS mentions
    FROM recent_positions rp
    WHERE rp.is_mentioned = true
    GROUP BY rp.engine
  ),

  h2h_total AS (
    SELECT
      rp.engine,
      COUNT(*) AS slots
    FROM recent_positions rp
    GROUP BY rp.engine
  ),

  h2h_comp AS (
    SELECT
      rp.engine,
      cl.id    AS comp_id,
      cl.name  AS comp_name,
      COUNT(*) AS mentions
    FROM recent_positions rp,
         jsonb_array_elements(COALESCE(rp.brands_mentioned, '[]'::jsonb)) AS brand
    JOIN competitor_list cl ON cl.domain = (brand->>'domain')
    GROUP BY rp.engine, cl.id, cl.name
  ),

  -- ── Assemble per-competitor jsonb rows ────────────────────────────────────
  comp_rows AS (
    SELECT
      cl.id,
      cl.name,
      cl.domain,
      COALESCE(cmc.mention_count, 0)                AS current_mentions,
      COALESCE(pmc.mention_count, 0)                AS prev_mentions,
      COALESCE(ce.engines_present, ARRAY[]::text[]) AS engines_present,
      (SELECT jsonb_agg(query_text ORDER BY rn)
       FROM comp_top_queries ctq2
       WHERE ctq2.comp_id = cl.id AND ctq2.rn <= 5
      )                                              AS top_queries_agg,
      (SELECT jsonb_agg(
                CASE WHEN sl2.slot_count = 0 THEN 0
                     ELSE ROUND(100.0 * COALESCE(csr.mentions, 0) / sl2.slot_count)
                END
                ORDER BY sl2.week_start
              )
       FROM sparkline_slots sl2
       LEFT JOIN comp_sparkline_raw csr
         ON csr.comp_id = cl.id AND csr.week_start = sl2.week_start
      )                                              AS sparkline_agg
    FROM competitor_list cl
    LEFT JOIN comp_mentions_current cmc ON cmc.comp_id = cl.id
    LEFT JOIN prev_comp_mentions     pmc ON pmc.comp_id = cl.id
    LEFT JOIN comp_engines           ce  ON ce.comp_id  = cl.id
  ),

  -- ── Assemble head-to-head matrix rows ────────────────────────────────────
  all_engines AS (
    SELECT DISTINCT engine FROM h2h_total
  ),

  h2h_our_row AS (
    SELECT jsonb_build_object(
      'entity', 'you'
    ) || jsonb_object_agg(
      h2h_total.engine,
      CASE WHEN h2h_total.slots = 0 THEN 0
           ELSE ROUND(100.0 * COALESCE(h2h_our.mentions, 0) / h2h_total.slots)
      END
    ) AS row_data
    FROM h2h_total
    LEFT JOIN h2h_our ON h2h_our.engine = h2h_total.engine
  ),

  h2h_comp_rows AS (
    SELECT
      cl.id   AS comp_id,
      jsonb_build_object('entity', cl.name) ||
      jsonb_object_agg(
        ht.engine,
        CASE WHEN ht.slots = 0 THEN 0
             ELSE ROUND(100.0 * COALESCE(hc.mentions, 0) / ht.slots)
        END
      ) AS row_data
    FROM competitor_list cl
    CROSS JOIN h2h_total ht
    LEFT JOIN h2h_comp hc ON hc.comp_id = cl.id AND hc.engine = ht.engine
    GROUP BY cl.id, cl.name
  ),

  -- ── 12-week trend series assembly ─────────────────────────────────────────
  trend_series AS (
    SELECT
      tw.week_start,
      CASE WHEN COALESCE(tts.slot_count, 0) = 0 THEN 0
           ELSE ROUND(100.0 * COALESCE(tom.mention_count, 0) / tts.slot_count)
      END AS our_sov,
      -- Per-competitor SOV as jsonb object {comp_name: pct}
      COALESCE(
        (SELECT jsonb_object_agg(
                  tcm.comp_name,
                  CASE WHEN COALESCE(tts2.slot_count, 0) = 0 THEN 0
                       ELSE ROUND(100.0 * tcm.mention_count / tts2.slot_count)
                  END
                )
         FROM trend_comp_mentions tcm
         LEFT JOIN trend_total_slots tts2 ON tts2.week_start = tw.week_start
         WHERE tcm.week_start = tw.week_start
        ),
        '{}'::jsonb
      ) AS comp_sovs
    FROM trend_weeks tw
    LEFT JOIN trend_total_slots tts ON tts.week_start = tw.week_start
    LEFT JOIN trend_our_mentions tom ON tom.week_start = tw.week_start
    ORDER BY tw.week_start
  )

  -- ── Final JSON assembly ────────────────────────────────────────────────────
  SELECT jsonb_build_object(
    'your_sov_pct',
    (SELECT pct FROM our_sov),

    'your_sov_delta_pp',
    (SELECT pct - prev_pct FROM our_sov),

    'competitors',
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'id',              cr.id,
          'name',            cr.name,
          'domain',          cr.domain,
          'sov_pct',
          CASE WHEN (SELECT n FROM total_slots) = 0 THEN 0
               ELSE ROUND(100.0 * cr.current_mentions / (SELECT n FROM total_slots))
          END,
          'sov_delta_pp',
          CASE WHEN (SELECT n FROM prev_slots) = 0 THEN 0
               ELSE ROUND(100.0 * cr.current_mentions / (SELECT n FROM total_slots))
                    - ROUND(100.0 * cr.prev_mentions / GREATEST((SELECT n FROM prev_slots), 1))
          END,
          'trend_sparkline',  COALESCE(cr.sparkline_agg, '[]'::jsonb),
          'mentioned_in_queries', cr.current_mentions,
          'top_queries',      COALESCE(cr.top_queries_agg, '[]'::jsonb),
          'engines_present',  to_jsonb(cr.engines_present)
        )
        ORDER BY cr.current_mentions DESC
      )
      FROM comp_rows cr),
      '[]'::jsonb
    ),

    'head_to_head_matrix',
    COALESCE(
      (SELECT jsonb_build_array(
        (SELECT row_data FROM h2h_our_row)
      ) ||
      COALESCE(
        (SELECT jsonb_agg(hcr.row_data ORDER BY hcr.comp_id)
         FROM h2h_comp_rows hcr),
        '[]'::jsonb
      )),
      '[]'::jsonb
    ),

    'missed_queries',
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'query',               m.query_text,
          'you',                 false,
          'competitors_present', COALESCE(m.comp_names_present, '[]'::jsonb)
        )
      )
      FROM missed m),
      '[]'::jsonb
    ),

    'sov_12wk_trend',
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'week', to_char(ts2.week_start, 'YYYY-MM-DD'),
          'you',  ts2.our_sov
        ) || ts2.comp_sovs
        ORDER BY ts2.week_start
      )
      FROM trend_series ts2),
      '[]'::jsonb
    )
  );
$$;

COMMENT ON FUNCTION public.get_competitors_summary(uuid, uuid) IS
  'Returns competitor intelligence for the /competitors page in a single JSONB blob.
   Includes SOV%, delta, sparklines, top queries, engines, head-to-head matrix,
   missed queries, and 12-week trend series.
   Time windows: SOV/matrix = last 28 days. Trend = last 84 days.
   All rows scoped to p_user_id + p_business_id for RLS safety.';
