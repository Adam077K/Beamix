# Database Migration Plan — Hard Reset Strategy

Resolves **P0-4 / P0-6** in `../10-PRE-BUILD-AUDIT.md`. With Adam's 2026-05-13 hard-reset decision, the migration strategy simplifies: the new Supabase project ships a clean schema with `plan_tier ∈ ('discover','build','scale')` only. No starter/pro/business values are ever created.

---

## Strategy: Fresh Schema, Not In-Place Rewrite

Two Supabase projects in play during cutover:

1. **`beamix-legacy`** (current production project) — current pre-reset DB. Retains 20+ existing migrations through `20260420_wave3_foundation.sql`.
2. **`beamix-v2`** (new project, created in Adam's manual checklist) — fresh project with one consolidated migration file representing the rethink end-state.

The new product points at `beamix-v2`. The legacy project is retained read-only for 60 days for audit, then archived.

This means we do NOT run `ALTER TYPE plan_tier DROP VALUE 'starter'` (Postgres doesn't support enum value removal anyway). We get a clean enum natively.

---

## Migration File Structure (Wave 0 Worker 1 deliverable)

```
apps/web/supabase/migrations/
  20260520_01_extensions.sql         # pg_trgm, uuid-ossp, pgcrypto
  20260520_02_enums.sql              # plan_tier, agent_type, etc — final values only
  20260520_03_core_tables.sql        # auth, businesses, user_profiles, subscriptions
  20260520_04_credits.sql            # credit_pools, credit_transactions, hold_credits RPC
  20260520_05_scans.sql              # scans, scan_engine_results, query_positions, query_clusters, tracked_queries
  20260520_06_agents.sql             # agent_jobs, agent_outputs, page_locks, topic_ledger, daily_cap_usage
  20260520_07_inbox.sql              # inbox_items, archive_items, content_items
  20260520_08_automation.sql         # automation_schedules, suggestions, kill_switch
  20260520_09_signals.sql            # notifications, url_probes, competitor_data
  20260520_10_seed_plans.sql         # seed Paddle price_id mappings + default credit allocations
  20260520_11_rls_policies.sql       # all RLS policies — single file, indexed by table
  20260520_12_rpcs.sql               # hold/confirm/release_credits, daily_cap helpers
```

**Naming convention:** `YYYYMMDD_NN_<scope>.sql`. Sequential by date + numeric prefix. Wave 0 Worker 1 generates a single `database.types.ts` once all 12 files apply cleanly.

---

## Authoritative Enum Definitions

```sql
-- 02-enums.sql
CREATE TYPE plan_tier AS ENUM ('discover','build','scale');

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
  'queued','running','qa_failed','succeeded','failed','cancelled'
);

CREATE TYPE pipeline_stage AS ENUM ('plan','research','do','qa','summarize');

CREATE TYPE inbox_status AS ENUM (
  'draft','review','approved','archived','rejected','failed'
);

CREATE TYPE suggestion_status AS ENUM (
  'pending','running','dismissed','converted'
);

CREATE TYPE notification_type AS ENUM (
  'item_ready','scan_complete','budget_75','budget_100',
  'competitor_alert','suggestion_generated','day1_ready','run_failed'
);

CREATE TYPE subscription_status AS ENUM (
  'trialing','active','past_due','paused','cancelled'
);
-- Note UK spelling 'cancelled' — matches existing convention (memory feedback_supabase_plpgsql.md)
```

Reasoning for collapsing into a single migration set: enum ordering, dependency order across tables/RPCs, and a single consistent point-in-time. Migrations are versioned and tracked normally — they just all carry the same logical date (2026-05-20 placeholder; Wave 0 Worker 1 may set the actual application date).

---

## Tables (Final List for MVP)

Required tables, sourced from `../05-BOARD-DECISIONS-2026-04-15.md` + `../08-UX-ARCHITECTURE.md` + `../12-AGENT-BUILD-SPEC.md` + `02-AUTOMATION-RULES.md`:

| Group | Tables |
|-------|--------|
| Auth/Identity | `user_profiles` (with `day1_state`, `day1_completed_at`, **`timezone text NOT NULL DEFAULT 'UTC'`** — IANA timezone identifier, used for tz-aware daily-cap reset per Wave 1 BE-3 W10 fix; default `'Asia/Jerusalem'` on new accounts whose signup referrer is `.il` or whose chosen `business.language === 'he'`, otherwise `'UTC'`), `businesses` |
| Subscriptions | `subscriptions`, `plans` (seed), `paddle_webhook_events` |
| Credits | `credit_pools`, `credit_transactions`, `credit_holds` |
| Scans | `scans`, `scan_engine_results`, `query_clusters`, `tracked_queries`, `query_positions` |
| Agents | `agent_jobs`, `agent_job_outputs`, `agent_costs`, `page_locks`, `topic_ledger`, `daily_cap_usage` |
| Content lifecycle | `inbox_items`, `archive_items`, `content_items` (canonical body store) |
| Automation | `automation_schedules`, `suggestions`, `system_kill_switch` (service_role-only global pause; per-user pause lives on `user_profiles.kill_switch_until timestamptz`) |
| Signals | `notifications`, `url_probes`, `competitors`, `competitor_results`, `citation_signals` (board April-17 — feeds the Home Leading-Indicator Panel; columns: `id uuid pk`, `business_id uuid fk`, `engine text`, `query_text text`, `cited_url text`, `detected_at timestamptz`; RLS by `business_id`) |
| System | `audit_log`, `feature_flags` |

Wave 0 Worker 1 spec'd to deliver these. Schema details are in `../12-AGENT-BUILD-SPEC.md` types section (mirrors DB columns).

### D4 — `suggestions.visible_at` (Day-1 staggered visibility)

Add the column on the `suggestions` table:

```sql
ALTER TABLE suggestions
  ADD COLUMN visible_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX suggestions_business_visible_idx
  ON suggestions (business_id, visible_at);
```

Day-1 Step E sets `visible_at = NOW()` for the top-1 suggestion and `NOW() + interval '60 seconds'` for the next 2 (per `03-DAY-1-FLOW.md` Step E). Home page query filters `WHERE visible_at <= NOW()`. Refresh-safe — no client-side timer.

### F8 — Retention rules for ledger / lock tables

Both `page_locks` and `topic_ledger` grow without bound under default behavior. Apply explicit retention:

**`page_locks` — 2-hour TTL** (auto-expire stale locks left by crashed pipelines):

```sql
CREATE OR REPLACE FUNCTION cleanup_page_locks() RETURNS void
LANGUAGE sql AS $$
  DELETE FROM page_locks
  WHERE locked_at < now() - interval '2 hours';
$$;

-- Schedule: pg_cron every 15 min OR Inngest cron `cleanup-page-locks` every 15 min.
-- Wave 0 Worker 1 picks one; document the choice in the migration comment.
```

**`topic_ledger` — 365-day retention with archive**. Topics older than 365 days move to `topic_ledger_archive` via a monthly Inngest cron `archive-old-topics`:

```sql
CREATE TABLE topic_ledger_archive (LIKE topic_ledger INCLUDING ALL);

-- Monthly cron (1st of each month):
INSERT INTO topic_ledger_archive
SELECT * FROM topic_ledger WHERE registered_at < now() - interval '365 days';

DELETE FROM topic_ledger WHERE registered_at < now() - interval '365 days';
```

`isTopicCovered()` reads only from `topic_ledger` — after 1 year, a topic may be re-covered (acceptable: content lifecycle exceeds annual cadence).

RLS on `topic_ledger_archive`: identical to `topic_ledger` (owner read on business_id, service-role full).

---

## RPCs

Per `../12-AGENT-BUILD-SPEC.md`:

```sql
hold_credits(p_user_id uuid, p_amount int, p_job_id uuid) RETURNS void
confirm_credits(p_job_id uuid) RETURNS void
release_credits(p_job_id uuid) RETURNS void
allocate_monthly_credits(p_user_id uuid, p_plan_id uuid) RETURNS void
check_daily_cap(p_user_id uuid, p_agent_type agent_type) RETURNS json
increment_daily_cap(p_user_id uuid, p_agent_type agent_type) RETURNS void
```

**Language rule (from memory `feedback_supabase_plpgsql.md`):** All RPCs use `LANGUAGE sql` with CTEs, not `LANGUAGE plpgsql` with `DECLARE` blocks. Supabase SQL Editor splits on semicolons inside `$$`; local plpgsql DECLARE vars become table lookups → 42P01. Hard rule. Wave 0 Worker 1 verifies.

---

## RLS Policies — prescriptive (B5)

**Every table in §Tables (plus any added by fix agents) gets `ENABLE RLS` + at least one policy.** No exceptions. Worker 1's smoke test enumerates `information_schema.tables WHERE table_schema = 'public'`, asserts `rowsecurity = true` on every row — fail PR otherwise. Smoke also inserts two test users, gives each a business, attempts cross-user SELECT/UPDATE/DELETE on every tenant-keyed table, asserts 0 rows / 0 affected.

Pattern A — tenant-owned table (has `user_id` FK):
```sql
ALTER TABLE inbox_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own inbox"
  ON inbox_items FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users mutate own inbox"
  ON inbox_items FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role full access"
  ON inbox_items FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');
```

Pattern B — business-scoped table (has `business_id` FK only):
```sql
ALTER TABLE url_probes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own business probes"
  ON url_probes FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Service role full access"
  ON url_probes FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');
```

Pattern C — service-role-only table (no tenant FK):
```sql
ALTER TABLE paddle_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only"
  ON paddle_webhook_events FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');
```

Pattern D — append-only audit (M8):
```sql
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role insert only"
  ON audit_log FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role select"
  ON audit_log FOR SELECT
  USING (auth.jwt()->>'role' = 'service_role');

-- DENY UPDATE/DELETE for ALL roles including service_role
CREATE FUNCTION audit_log_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
  BEGIN RAISE EXCEPTION 'audit_log is append-only'; END;
$$;
CREATE TRIGGER audit_log_block_update_delete
  BEFORE UPDATE OR DELETE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION audit_log_immutable();
```
(plpgsql is acceptable inside trigger functions — the `feedback_supabase_plpgsql.md` rule applies to RPCs called from the SQL Editor / app layer.)

### Per-table assignment (every table in §Tables)

| Table | Pattern | Notes |
|-------|---------|-------|
| `user_profiles` | A | Includes columns added by fix swarm: `kill_switch_until`, `disclosure_acknowledged_at`, `deleted_at`, **`timezone`** (W10, IANA TZ string, defaults `'UTC'`/`'Asia/Jerusalem'` per IL-referrer rule). |
| `businesses` | A | `user_id` FK. |
| `subscriptions` | A | `user_id` FK. |
| `plans` | C | Seed table; service_role write. Anon SELECT acceptable IF RLS-enabled with `SELECT-only` policy. |
| `paddle_webhook_events` | C | Append-only via service_role; no anon access. |
| `credit_pools`, `credit_transactions`, `credit_holds` | A | `user_id` FK on each. |
| `scans`, `scan_engine_results`, `query_clusters`, `tracked_queries`, `query_positions` | B | `business_id` FK chain. |
| `agent_jobs`, `agent_job_outputs`, `agent_costs` | A or B | Whichever FK exists. |
| `page_locks`, `topic_ledger`, `topic_ledger_archive`, `daily_cap_usage` | B | `business_id` FK. |
| `inbox_items`, `archive_items`, `content_items` | A | `user_id` FK. |
| `automation_schedules`, `suggestions` | A | `user_id` FK. |
| `system_kill_switch` | C | Global pause; service_role only. |
| `notifications` | A | `user_id` FK. |
| `url_probes` | B | PK `(business_id, url, queued_at)` (H8). |
| `competitors`, `competitor_results` | B | `business_id` FK. |
| `citation_signals` | B | Added by Fix Agent 1; `business_id` FK. |
| `audit_log` | D | Append-only with `prev_hash text` column (M8). |
| `feature_flags` | C | Service-role-only. |
| `llm_cost_events` | A | `user_id` FK. PII-scrubbed schema (no `prompt_text`/`completion_text`/`customInstructions`/`targetContent` columns). |

### `paddle_webhook_events` — full spec (B1)

```sql
CREATE TABLE paddle_webhook_events (
  event_id    text PRIMARY KEY,
  event_type  text NOT NULL,
  payload     jsonb NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX paddle_webhook_events_received_at_idx ON paddle_webhook_events (received_at);
```

RPC (called from Wave 1 BE-2 webhook handler):
```sql
CREATE FUNCTION record_webhook_event(
  p_event_id text, p_event_type text, p_payload jsonb
) RETURNS uuid LANGUAGE sql AS $$
  WITH inserted AS (
    INSERT INTO paddle_webhook_events (event_id, event_type, payload)
    VALUES (p_event_id, p_event_type, p_payload)
    ON CONFLICT (event_id) DO NOTHING
    RETURNING event_id
  )
  SELECT gen_random_uuid() FROM inserted;
  -- One row on insert; zero rows on duplicate. Caller treats zero rows as "duplicate → HTTP 200".
$$;
```

### `allocate_monthly_credits` — new idempotent signature (B1)

```sql
CREATE FUNCTION allocate_monthly_credits(
  p_user_id uuid, p_plan_id uuid, p_billing_period_start timestamptz
) RETURNS void LANGUAGE sql AS $$
  INSERT INTO credit_pools (user_id, plan_id, billing_period_start, base_allocation, used_amount)
  SELECT p_user_id, p_plan_id, p_billing_period_start, plans.monthly_credits, 0
  FROM plans WHERE plans.id = p_plan_id
  ON CONFLICT (user_id, plan_id, billing_period_start) DO NOTHING;
$$;
```
Requires `credit_pools` unique constraint `(user_id, plan_id, billing_period_start)`.

### `hold_credits` — TOCTOU-safe (H1)

```sql
CREATE FUNCTION hold_credits(
  p_user_id uuid, p_amount int, p_job_id uuid, p_agent_type agent_type
) RETURNS json LANGUAGE sql AS $$
  WITH
  pool_lock AS (
    SELECT id,
      base_allocation + COALESCE(rollover_amount,0) + COALESCE(topup_amount,0) - used_amount AS available
    FROM credit_pools
    WHERE user_id = p_user_id
    ORDER BY billing_period_start DESC
    LIMIT 1
    FOR UPDATE
  ),
  cap_lock AS (
    SELECT used_today, daily_cap
    FROM daily_cap_usage
    WHERE user_id = p_user_id AND agent_type = p_agent_type AND usage_date = current_date
    FOR UPDATE
  ),
  decision AS (
    SELECT
      (SELECT available FROM pool_lock) >= p_amount AS has_credits,
      COALESCE((SELECT used_today < daily_cap FROM cap_lock), TRUE) AS under_cap
  ),
  inserted_hold AS (
    INSERT INTO credit_holds (job_id, user_id, amount, agent_type, held_at, expires_at)
    SELECT p_job_id, p_user_id, p_amount, p_agent_type, now(), now() + interval '30 minutes'
    FROM decision WHERE has_credits AND under_cap
    RETURNING job_id
  )
  SELECT json_build_object(
    'held', EXISTS (SELECT 1 FROM inserted_hold),
    'reason', CASE
      WHEN NOT (SELECT has_credits FROM decision) THEN 'insufficient_credits'
      WHEN NOT (SELECT under_cap FROM decision) THEN 'daily_cap_reached'
      ELSE NULL
    END
  );
$$;
```
LANGUAGE sql with CTEs only — no plpgsql DECLARE (per project memory). `credit_holds.expires_at` enables a cron sweep that releases stuck holds older than 30 min (Wave 1 BE-1's `retention-sweep.ts`).

**Gate:** Wave 0 Worker 1 runs `mcp__supabase__get_advisors` after applying the migration set. All advisor warnings must be resolved or explicitly waived in a comment before PR merge.

---

## Staging Gate (P0-6)

Process Wave 0 Worker 1 follows — non-negotiable:

```
1. Apply all 12 migration files to staging project (beamix-v2-staging)
   via mcp__supabase__apply_migration, in numeric order.

2. Run mcp__supabase__get_advisors → resolve every advisor finding
   before proceeding.

3. Run a smoke pack of SELECTs via mcp__supabase__execute_sql to confirm:
   - Every table exists and has expected columns
   - Every enum has correct values
   - Every RPC is callable
   - RLS denies cross-user access (test by inserting two test users and
     attempting cross-account reads as one of them)

4. Run mcp__supabase__generate_typescript_types → commit database.types.ts
   to apps/web/src/lib/db/database.types.ts

5. Open PR with migrations + database.types.ts. QA Lead reviews.

6. Production apply happens in Wave 2 devops-lead (NOT Wave 0).
   Same migration files, applied to beamix-v2 production project.
```

No worker in Wave 1 begins until step 4 (database.types.ts committed) completes and Wave 0.5 (shared types contract) merges.

---

## Cutover plan (legacy → v2)

Production cutover happens AFTER Wave 2 ships and passes Go/No-Go criteria.

```
T-7d   Spin up beamix-v2 production project (clone of staging schema).
T-3d   DNS / env vars staged: NEXT_PUBLIC_SUPABASE_URL points to v2 project.
T-1d   Soft-freeze: legacy app receives a banner "We're upgrading on
       {{date}} — your account will be migrated".
T-0    Production deploy of new apps/web/ pointing at beamix-v2.
       Legacy project remains live but read-only.
T+1h   Smoke test: run E2E suite against production.
T+24h  Communicate cutover to existing customers via email.
T+30d  Begin pulling residual data if needed (no automated migration —
       existing users will re-sign-up on v2 since the product is materially
       different and pricing changed). Refund any pre-existing annual subs.
T+60d  Archive beamix-legacy project (downgrade to free tier; data retained).
```

**Customer migration policy:** existing legacy customers are not auto-migrated because product, pricing, and data model are materially different. Adam reaches out personally to existing paying customers with a complimentary 30-day Build trial on v2. Refund any active subscriptions.

---

## Rollback plan

If Wave 0 migration set has a critical bug discovered post-merge:
- Drop the entire `beamix-v2-staging` schema and re-apply from scratch (cheap — no production data yet)
- For production rollback (post-cutover): the legacy project is the rollback target. DNS / env vars revert. Any data created on v2 post-cutover is lost — accept this risk because the v2 cutover is gated on extensive QA.

This rollback strategy is documented in Wave 2 devops-lead brief.

---

## Why not in-place

In-place migration of the legacy DB would require:
- `ALTER TYPE plan_tier RENAME VALUE` (doesn't exist in stock Postgres)
- Workaround: create new enum, swap columns, drop old enum — multi-step, error-prone
- 20+ existing migrations to reconcile against the rethink schema
- Risk of half-state if a step fails

Fresh project gives a clean slate, matches the hard-reset philosophy, and decouples production cutover from build velocity.

---

## April-18 board 3-phase enum migration — superseded by hard reset

The April-18 board minute mandated a "3-phase enum migration (not single file)" for the legacy `plan_tier` rename (`starter/pro/business` → `discover/build/scale`). That mandate assumed an in-place migration on the existing `beamix-legacy` project. The 2026-05-13 hard-reset decision makes the 3-phase migration moot: the new `beamix-v2` project ships a clean `plan_tier ENUM ('discover','build','scale')` from migration 02 with no legacy values to rename. The 3-phase plan is documented here only so QA Lead does not flag its absence as a board-mandate violation. If a future feature requires renaming an enum value on `beamix-v2`, follow the standard 3-phase pattern (add new value → migrate writes → drop old value via column-swap).
