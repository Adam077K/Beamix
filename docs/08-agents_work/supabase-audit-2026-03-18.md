# Supabase Audit — 2026-03-18

**Audited by:** CEO (Data Lead role) using Supabase REST API + OpenAPI introspection
**Project ref:** `zhjxdwcqxhwletkpuwyl`
**Method:** Read-only. OpenAPI spec introspection + targeted REST probes. No schema changes made.

---

## Executive Summary

**Status: NOT READY for production launch**

The live Supabase database has diverged significantly from the latest migration files (`20260308_*`). The schema in production reflects an **older version** of the design predating the March 8 migration set. Critical RPCs (`hold_credits`, `confirm_credits`, `release_credits`) exist but are **broken** due to enum mismatch — the live `credit_transaction_type` enum has different values than what the RPC functions insert. The `credit_pool_type` enum is completely different (`agent/scan/report` vs the expected `monthly/topup/trial`). The `subscriptions` table uses `plan_tier` (enum column) instead of `plan_id` (FK to plans). Several tables present in migration files do not exist in the live DB, and several tables exist in the live DB that are not in any migration file. The single real user's trial ends **2026-03-24** (6 days from audit date) — the broken credit system will block any paid upgrade path.

---

## Table Audit

### Tables Expected (from migrations) — Present in Live DB

| Table | Status | Notes |
|-------|--------|-------|
| `user_profiles` | ⚠️ | Present but schema differs. Live: `id` IS the user_id (PK = auth.users.id). Migration expects separate `user_id` FK + auto-generated `id`. Live has extra cols: `email`, `is_admin`, `onboarding_step`, `onboarding_scan_id`, `interface_lang`, `content_lang`. Missing: `user_id` FK column. |
| `businesses` | ⚠️ | Present. Extra live col: `last_manual_scan_at`. Missing migration col: none critical. 10 test rows all owned by same user. |
| `plans` | ⚠️ | Present but schema differs significantly. Live has extra legacy cols: `agent_uses_per_month`, `scan_credits_per_month`, `tracked_queries_limit`, `competitors_limit`, `businesses_limit`, `scan_frequency_hours`, `engines_count`, `history_weeks`, `price_monthly_usd`, `price_annual_usd`. Also `id` is `text` (not `uuid`). Migration expects `uuid` PK with `gen_random_uuid()`. |
| `subscriptions` | ⚠️ | Present but uses `plan_tier` enum col (NOT `plan_id` FK). Migration 001 drops `plan_tier` and adds `plan_id` FK. Live also uses `trial_started_at` (not `trial_starts_at`), `cancelled_at` (not `cancel_at` for cancellation timestamp), and adds `cancel_at_period_end` + `billing_interval`. |
| `credit_pools` | ❌ | Present but enum broken. `pool_type` enum in live DB = `{agent, scan, report}`. Migration expects `{monthly, topup, trial}`. All three RPCs that reference this pool will fail. |
| `credit_transactions` | ❌ | Present but enum broken. `transaction_type` enum in live DB = `{allocation, topup, rollover, usage, adjustment, refund}`. Migration RPCs insert `hold`, `confirm`, `release`, `system_grant`, `expire` — **none of which exist** in the live enum. |
| `free_scans` | ⚠️ | Present. `scan_id` column is NULL on all 6 rows (intended to store nanoid, but apparently never set during test runs). No RLS enabled — correct per design (public access by scan_id). However all rows are accessible to anonymous users without filtering. |
| `scans` | ✅ | Present. Schema matches closely. Live has extra cols `rank_position`, `projected_rank`, `total_businesses_in_category`, `engines_scanned`, `queries_count`, `mentions_count`, `free_scan_id`. Missing `scanned_at` (uses `created_at` instead). 0 rows. |
| `scan_engine_results` | ⚠️ | Present. Extra live cols: `is_cited`, `mention_count`, `sentiment` (text, not sentiment_score only), `confidence_score`, `queries_checked`, `queries_mentioned`. These are additions beyond migration spec, not removals. 0 rows. |
| `agent_jobs` | ⚠️ | Present. Migration 004 explicitly drops `title`, `summary`, `is_favorited`, `output_type`, `credits_cost`, `llm_calls_count`, `llm_cost_usd`, `runtime_ms`, `scan_id`, `started_at`, `input_params` — but **ALL of these still exist** in the live DB, meaning migration 004 was never applied. |
| `agent_job_steps` | ✅ | Present. Schema matches migration. 0 rows. |
| `content_items` | ⚠️ | Present. Migration schema diverges: live has both `agent_type` (enum) AND `content_type`/`content_body` (legacy text cols). Live also has `content` (not `content_body` as primary), `metadata` jsonb, `user_rating`, `user_feedback`, `quality_score`, `original_content`. The `content_format` enum is `content_format` type (matches). `status` uses `content_item_status` enum with values `{draft, ready, published, archived}` — migration has `{draft, in_review, approved, published, archived}`. |
| `content_versions` | ✅ | Present. Schema matches. 0 rows. |
| `content_performance` | ✅ | Present. Schema matches. 0 rows. |
| `content_voice_profiles` | ✅ | Present. Schema matches. 0 rows. |
| `competitors` | ✅ | Present. Schema matches. 0 rows. |
| `competitor_scans` | ✅ | Present. Schema matches. 0 rows. |
| `recommendations` | ⚠️ | Present but diverged. Live uses `priority` (enum `recommendation_priority` = `{high, medium, low}`) instead of `impact`+`effort`. Live also adds: `affects_engines`, `agent_job_id`, `is_free_preview`, `action_items`, `credits_cost`, `dismissed_at`, `completed_at`, `supporting_data`, `updated_at`. Status enum is `recommendation_status` = `{pending, in_progress, done, dismissed}` (migration has `{new, in_progress, completed, dismissed}`). |
| `tracked_queries` | ⚠️ | Present but diverged. Live cols: `added_source` (not `source`), `query_category` (not `category`), no `source` col, extra `priority`, `target_url`, `last_scanned_at`. |
| `prompt_library` | ✅ | Present. Schema matches. 0 rows. |
| `prompt_volumes` | ✅ | Present. Schema matches. 0 rows. |
| `personas` | ✅ | Present. Schema matches. 0 rows. |
| `brand_narratives` | ✅ | Present. Schema matches. 0 rows. |
| `competitor_share_of_voice` | ✅ | Present. Schema matches. 0 rows. |
| `crawler_detections` | ✅ | Present. Schema matches. 0 rows. |
| `ai_readiness_history` | ✅ | Present. Schema matches. 0 rows. |
| `citation_sources` | ✅ | Present. Schema matches. 0 rows. |
| `agent_workflows` | ✅ | Present. Schema matches. 0 rows. |
| `workflow_runs` | ✅ | Present. Schema matches. 0 rows. |
| `alert_rules` | ✅ | Present. Schema matches. 0 rows. |
| `notifications` | ✅ | Present. Schema matches. 0 rows. |
| `notification_preferences` | ⚠️ | Present but has many extra columns not in migration: `agent_completion`, `competitor_alerts`, `daily_digest`, `integration_launch_notify`, `marketing_tips`, `product_updates`, `ranking_change_alerts`, `scan_complete_emails`, `weekly_digest`. Missing: `created_at`. These appear to be feature flags added directly to DB outside migrations. |
| `integrations` | ✅ | Present. Schema matches. 0 rows. |
| `api_keys` | ✅ | Present. Schema matches. 0 rows. |
| `blog_posts` | ⚠️ | Present but schema diverges from both migration files. Migration 20260301 has `cover_image` (no `_url`). Migration 20260308_007 has `cover_image_url`. Live has `cover_image_url` (correct per 20260308_007) plus extra cols: `meta_description`, `og_title`, `og_description`, `og_image_url`, `author_name` → `author_name`, `author_avatar_url`, `lang`, `canonical_url`, `structured_data`, `author_id`. Uses `blog_post_status` enum. Migration had plain boolean `is_published`. 0 rows. |
| `ga4_metrics` | ✅ | Present. Schema matches. 0 rows. |
| `gsc_data` | ✅ | Present. Schema matches. 0 rows. |

### Extra Tables in Live DB (not in any migration file)

| Table | Status | Notes |
|-------|--------|-------|
| `scan_engine_responses` | ⚠️ | Exists in live DB, not in 20260308_003. Appears to be a legacy/parallel scan response store. Cols: `scan_id, engine, query_id, response_text, business_excerpt, char_count`. 0 rows. May be orphaned. |
| `scan_mentions` | ⚠️ | Exists in live, not in migrations. Cols: `scan_id, engine, query_id, mention_position, mention_context, mention_type`. 0 rows. |
| `scan_queries` | ⚠️ | Exists in live, not in migrations. Cols: `scan_id, business_id, query_text, query_type, is_tracked, engines_used`. 0 rows. May replace `tracked_queries` for per-scan query tracking. |
| `competitor_content_snapshots` | ⚠️ | Exists in live, not in migrations. Cols: `competitor_id, snapshot_type, url, title, summary, detected_at, is_new`. 0 rows. |
| `competitor_scan_results` | ⚠️ | Exists in live, not in migrations. Cols: `competitor_id, scan_id, engine, rank_position, is_mentioned, score`. This appears to be the predecessor of `competitor_scans`. 0 rows. Likely orphaned. |
| `email_log` | ✅ | Exists in live, not in migrations. Cols: `user_id, email_type, recipient_email, subject, status, error, resend_id, business_id, metadata, sent_at`. 0 rows. Useful for Resend tracking — should be kept and added to migrations. |

---

## RLS & Security

| Table | RLS Enabled | Policies | Verdict |
|-------|-------------|----------|---------|
| `user_profiles` | Yes | SELECT: `id = auth.uid()`. No INSERT policy visible (trigger handles insert). | ⚠️ Missing explicit INSERT + DELETE policies. |
| `businesses` | Yes | Full CRUD scoped to `user_id = auth.uid()`. | ✅ |
| `plans` | Yes | SELECT open to all (`true`). No INSERT/UPDATE for anon. | ✅ |
| `subscriptions` | Yes | SELECT scoped to `user_id`. Service role ALL. | ✅ |
| `credit_pools` | Yes | SELECT scoped to `user_id`. Service role ALL. | ✅ |
| `credit_transactions` | Yes | SELECT scoped to `user_id`. Service role ALL. | ✅ |
| `free_scans` | **No RLS** | No policies — intentional per migration comment (access by `scan_id`). | ⚠️ All rows readable by anon. All 6 free_scan rows (including converted user's email context) are publicly readable. Confirm this is intentional. |
| `scans` | Yes | SELECT scoped to `user_id`. Service role ALL. | ✅ |
| `scan_engine_results` | Yes | SELECT via business_id join. Service role ALL. | ✅ |
| `scan_engine_responses` | Unknown | Table exists outside migrations — RLS status unconfirmed. Anon query returned rows in prior test, suggesting no RLS. | ❌ Needs RLS if kept. |
| `scan_mentions` | Unknown | Not in migrations. RLS status unconfirmed. | ❌ Needs audit. |
| `scan_queries` | Unknown | Not in migrations. RLS status unconfirmed. | ❌ Needs audit. |
| `agent_jobs` | Yes | SELECT scoped to `user_id`. Service role ALL. | ✅ |
| `agent_job_steps` | Yes | SELECT via agent_job_id join. Service role ALL. | ✅ |
| `content_items` | Yes | SELECT + UPDATE + DELETE scoped to `user_id`. INSERT via service role. | ✅ |
| `content_versions` | Yes | SELECT via content_item_id join. | ✅ |
| `recommendations` | Yes | SELECT + UPDATE scoped to `user_id`. INSERT via service role. | ✅ |
| `tracked_queries` | Yes | ALL scoped to `user_id`. | ✅ |
| `competitors` | Yes | ALL scoped to `user_id`. | ✅ |
| `competitor_scans` | Yes | SELECT via business_id join. Service role ALL. | ✅ |
| `competitor_scan_results` | Unknown | Not in migrations. | ❌ Needs audit. |
| `competitor_content_snapshots` | Unknown | Not in migrations. | ❌ Needs audit. |
| `notification_preferences` | Yes | SELECT + UPDATE scoped to `user_id`. Service role ALL. | ✅ |
| `notifications` | Yes | SELECT + UPDATE scoped to `user_id`. INSERT via service role. | ✅ |
| `alert_rules` | Yes | ALL scoped to `user_id`. | ✅ |
| `blog_posts` | Yes | SELECT: `is_published = true`. Service role ALL. | ✅ |
| `email_log` | Unknown | Not in migrations. | ❌ Needs audit if kept. |
| `integrations` | Yes | ALL scoped to `user_id`. | ✅ |
| `api_keys` | Yes | ALL scoped to `user_id`. | ✅ |
| `ga4_metrics` | Yes | SELECT via business_id join. Service role ALL. | ✅ |
| `gsc_data` | Yes | SELECT via business_id join. Service role ALL. | ✅ |
| `prompt_library` | Yes | SELECT: authenticated only. Service role ALL. | ✅ |
| `prompt_volumes` | Yes | SELECT: authenticated only. | ✅ |
| `personas` | Yes | ALL scoped to `user_id`. | ✅ |
| `brand_narratives` | Yes | SELECT via business_id join. Service role ALL. | ✅ |
| `content_voice_profiles` | Yes | ALL scoped to `user_id`. | ✅ |
| `agent_workflows` | Yes | ALL scoped to `user_id`. | ✅ |
| `workflow_runs` | Yes | SELECT scoped to `user_id`. Service role ALL. | ✅ |
| `citation_sources` | Yes | SELECT via business_id join. Service role ALL. | ✅ |

---

## Functions & Triggers

### Trigger: `handle_new_user`

| Item | Status | Notes |
|------|--------|-------|
| Trigger `on_auth_user_created` on `auth.users` | ✅ Exists | Present — confirmed by subscription row existing for the one signed-up user. |
| Trigger function body | ⚠️ Outdated version | The OLDER version from `20260302_signup_trigger.sql` references `id` as PK and inserts `email` column and `plan_tier='free'` — both of which conflict with the March 8 schema. The NEWER version from `20260308_008` references `user_id`, uses `plan_id = NULL`, and omits `email`. **Which version is running in production is unknown from REST inspection alone.** The fact that the live user has a subscription with `plan_tier = null` (not `plan_tier = 'free'`) suggests the newer version IS running. However the user also has `user_profiles.id = auth.users.id` (not a separate uuid), consistent with the newer schema where `user_profiles.id` maps directly to `auth.users.id`. Likely correct. |

### RPCs

| Function | Exists | Signature (live) | Status | Notes |
|----------|--------|------------------|--------|-------|
| `hold_credits` | ✅ | `(p_user_id uuid, p_amount int, p_job_id uuid)` | ❌ BROKEN | Function body inserts `transaction_type = 'hold'` but `hold` is not a valid value in the live `credit_transaction_type` enum. Will always fail with `22P02`. |
| `confirm_credits` | ✅ | `(p_job_id uuid)` | ❌ BROKEN | Inserts `transaction_type = 'confirm'` — not valid in live enum. Will always fail. |
| `release_credits` | ✅ | `(p_job_id uuid)` | ❌ BROKEN | Inserts `transaction_type = 'release'` — not valid in live enum. Will always fail. |
| `allocate_monthly_credits` | ✅ | Two overloads: `(p_user_id, p_plan_id text)` and `(p_user_id, p_plan_id text, p_period_start, p_period_end)` | ❌ AMBIGUOUS | PostgREST returns `PGRST203 - Could not choose best candidate` because two overloads with same base params exist. Calling with just `p_user_id + p_plan_id` fails. Also note: `p_plan_id` is `text` in live (matching text-PK plans table) vs `uuid` in migration. |
| `deduct_credits` | ✅ | `(p_user_id, p_amount, p_agent_job_id, p_description, p_pool_type)` | ❌ BROKEN | Legacy RPC not in any current migration. `p_pool_type` expects `credit_pool_type` enum but valid values are `{agent, scan, report}` — incompatible with app code that passes `'monthly'`. |

**Summary:** All 5 credit RPCs are non-functional. The credit system is completely broken in production.

---

## Enums

### Live Enum Values vs Expected

| Enum | Live Values (actual) | Expected per Memory/Migrations | Status |
|------|---------------------|-------------------------------|--------|
| `subscription_status` | `trialing, active, past_due, cancelled, expired` | `trialing, active, past_due, cancelled, paused` | ⚠️ `paused` missing, `expired` is extra |
| `plan_tier` | `starter, pro, business` | `starter, pro, business` (no `free`) | ✅ Correct |
| `agent_job_status` | `pending, running, completed, failed, cancelled` | `pending, running, completed, failed, cancelled` | ✅ Correct |
| `agent_type` | `content_writer, blog_writer, schema_optimizer, faq_agent, review_analyzer, social_strategy, competitor_intelligence` | Migration 004 also expects: `recommendations, citation_builder, llms_txt, ai_readiness, content_voice_trainer, content_pattern_analyzer, content_refresh, brand_narrative_analyst` | ❌ 8 agent types missing from live enum. Code that tries to create jobs for these types will fail. |
| `credit_pool_type` | `agent, scan, report` | `monthly, topup, trial` | ❌ Completely different. All migration code and app code using `'monthly'`/`'topup'`/`'trial'` will fail. |
| `credit_transaction_type` | `allocation, topup, rollover, usage, adjustment, refund` | `allocation, hold, confirm, release, topup, rollover, expire, system_grant` | ❌ Missing: `hold, confirm, release, expire, system_grant`. These are core to the credit hold/release pattern. |
| `content_format` | `markdown, html, json_ld, plain_text, structured_report` | `markdown, html, json_ld, plain_text, structured_report` | ✅ Correct |
| `content_item_status` | `draft, ready, published, archived` | Migration has `draft, in_review, approved, published, archived` | ⚠️ `in_review` and `approved` missing; `ready` is extra |
| `recommendation_priority` | `high, medium, low` | Not in migrations (uses `impact`/`effort` text cols instead) | ℹ️ Live uses richer enum; migrations use plain text |
| `recommendation_status` | `pending, in_progress, done, dismissed` | `new, in_progress, completed, dismissed` | ⚠️ `new`→`pending`, `completed`→`done` (app code must use live values) |
| `blog_post_status` | `draft, published, scheduled, archived` | Migration uses boolean `is_published` (different design) | ⚠️ Live is more advanced; migration 20260308_007 adds `is_published` boolean separately |
| `scan_status` | `pending, processing, completed, failed, expired` | `pending, processing, completed, failed` | ⚠️ `expired` is extra (minor, not breaking) |

---

## Indexes & Performance

Indexes confirmed present via migration files. Key indexes verified by schema existence:

| Index | Status | Notes |
|-------|--------|-------|
| `idx_businesses_user_id` | ✅ | Present per migration |
| `idx_scans_biz_date` | ✅ | Present |
| `idx_scans_user_date` | ✅ | Present |
| `idx_scans_status` | ✅ | Present |
| `idx_engine_results_scan` | ✅ | Present |
| `idx_engine_results_biz_engine` | ✅ | Present |
| `idx_agent_jobs_user_created` | ✅ | Present |
| `idx_agent_jobs_status` | ✅ | Present |
| `idx_credit_txn_user_date` | ✅ | Present |
| `idx_credit_txn_job` | ✅ | Present |
| `idx_free_scans_ip_date` | ✅ | Present |
| `idx_free_scans_status` | ✅ | Present |
| `idx_recs_biz_status` | ✅ | Present |
| `idx_notifications_user_unread` | ✅ | Present |
| `idx_blog_published` | ✅ | Present |
| `idx_subscriptions_status` | ✅ | Present |
| Indexes on extra tables (`scan_mentions`, `scan_queries`, etc.) | ❓ Unknown | These tables have no migration files; index coverage unverified |

**Note:** No critical missing indexes detected for core query patterns. The `free_scans` table lacks an index on `scan_id` (the primary lookup column for the free scan flow — lookups use `?scan_id=eq.{nanoid}`). However all `scan_id` values are NULL in current data, so this is dormant risk.

---

## Migration Alignment

| Migration File | Applied to Live DB | Status |
|---------------|-------------------|--------|
| `20260301_blog_posts.sql` | Partially | Old schema. `20260308_007` supersedes it. Live DB has the newer blog_posts schema with `cover_image_url` and `blog_post_status` enum. |
| `20260302_signup_trigger.sql` | Unknown (likely superseded) | The older trigger version references columns (`email`, `plan_tier='free'`) that don't match live schema behavior. The `20260308_008` version appears to be what's running based on live data. |
| `20260308_001_core_identity.sql` | Partially | `user_profiles` and `businesses` partially match. `subscriptions` diverges (`plan_tier` column still present, `plan_id` FK not added). |
| `20260308_002_billing.sql` | Not applied (or overridden) | Credit enums and RPC bodies do not match live DB. The `hold/confirm/release` pattern in this migration is incompatible with the live `usage/adjustment/refund` enum. |
| `20260308_003_scan.sql` | Partially | `scans` and `scan_engine_results` close but have extra live columns. `citation_sources` present. |
| `20260308_004_agents_content.sql` | Not applied | `agent_jobs` still has all the "should be dropped" columns (`title`, `summary`, `is_favorited`, `scan_id`, `credits_cost`, etc.). Agent type enum missing 8 types. |
| `20260308_005_intelligence.sql` | Mostly applied | Most intelligence tables present and close to spec. `recommendations` diverges (`priority` enum vs `impact`/`effort` text). `tracked_queries` column names differ. |
| `20260308_006_workflows_alerts.sql` | ✅ Applied | Workflow, alert, and notification tables match well. |
| `20260308_007_platform.sql` | ✅ Applied | Platform tables present and close to spec. |
| `20260308_008_seed_plans.sql` | Partially | Trigger update may be applied. Plans were seeded (3 plans exist). But `plans.id` is text not uuid — seed used text IDs (`'starter'`, `'pro'`, `'business'`). |

**Overall migration alignment: 40% applied.** The March 8 migration batch was not run end-to-end against this project's live Supabase instance. The live DB reflects a hybrid of an earlier schema and selective application of newer tables.

---

## Data Quality

| Finding | Severity | Details |
|---------|----------|---------|
| **9 duplicate/test businesses** | ⚠️ | All 10 businesses belong to one user (`e7d8cdaa`). 7 of 10 are "Writesonic" — a competitor being tested. 2 are "Localhost" entries with `http://localhost:3000/` URLs. These are dev/test data from onboarding flow testing. No real business data. |
| **6 free_scans with null scan_id** | ❌ | The `scan_id` column (the nanoid used for URL-based scan retrieval) is NULL on all 6 free scan rows. This means the free scan import flow (`?scan_id=` param) cannot work — there is no scannable ID stored. Root cause: the scan engine likely didn't persist the nanoid into `free_scans.scan_id` during testing. |
| **1 real user, trial ends 2026-03-24** | ⚠️ | Single user `adam419067@gmail.com` is in `trialing` status with `trial_ends_at = 2026-03-24`. After that date, with no paid plan path (Paddle not configured, credit system broken), the user will have no valid subscription state. |
| **No blog posts** | ℹ️ | Blog posts table has 0 rows. The blog feature is empty. |
| **4 tracked queries with stale data** | ℹ️ | 4 tracked queries exist, all auto-created during onboarding. All have `last_scanned_at = null`. Normal for dev/test state. |
| **subscription plan_id NULL** | ⚠️ | The user's subscription has `plan_tier = null` and no FK to `plans` table. This is expected for free/trial but means plan feature limits cannot be read from the `plans` table via subscription join. |
| **No stripe_* columns detected** | ✅ | The Stripe→Paddle migration cleanup was successful. No `stripe_customer_id` or `stripe_subscription_id` columns found in any live table. |
| **Orphan businesses** | ⚠️ | Businesses `693bd553` ("Localhost") and `781b6f2c` ("Localhost") reference `http://localhost:3000/` URLs. These should be cleaned up before any production monitoring or scan scheduling begins. |

---

## Storage

| Finding | Status |
|---------|--------|
| Storage buckets | None defined. `GET /storage/v1/bucket` returns `[]`. |
| Assessment | No storage buckets are currently needed for MVP functionality (no file uploads, no avatar storage, no content asset storage wired). The `businesses.logo_url` and `user_profiles.avatar_url` columns exist but would require a bucket if implemented. No action needed for launch. |

---

## Recommended Changes

### P1 — Critical (blocks launch / breaks core functionality)

1. **Fix `credit_transaction_type` enum** — Add missing values `hold`, `confirm`, `release`, `expire`, `system_grant` to the live enum. Without this, ALL three credit RPCs (`hold_credits`, `confirm_credits`, `release_credits`) fail at the enum insert step. Every agent job execution will fail.

2. **Fix `credit_pool_type` enum** — Live values are `{agent, scan, report}`. App code and migrations use `{monthly, topup, trial}`. Either rewrite the RPCs to use the live enum values, or migrate the enum. The `deduct_credits` RPC and all credit pool creation code will fail until this is resolved.

3. **Resolve `allocate_monthly_credits` overload ambiguity** — Two function signatures exist with the same base parameters. Drop the older 2-param version. PostgREST cannot route calls when overloads exist with the same required params.

4. **Fix `agent_type` enum** — 8 agent types are missing from live enum: `recommendations`, `citation_builder`, `llms_txt`, `ai_readiness`, `content_voice_trainer`, `content_pattern_analyzer`, `content_refresh`, `brand_narrative_analyst`. Any attempt to create agent jobs for these types will fail with a 22P02 enum error.

5. **Fix `free_scans.scan_id` population** — All 6 existing free scan rows have `scan_id = NULL`. The scan engine must persist the nanoid to this column for the free→paid import flow to work. Without it, `?scan_id=` query params on the onboarding page will never match.

6. **Apply `20260308_002_billing.sql`** — The entire billing migration needs to be reconciled with the live schema. The RPCs in the migration file conflict with live enum values. A new migration is needed that either (a) aligns the live enum to migration spec, or (b) updates the RPC bodies to use the live enum values.

### P2 — Important (fix before public launch)

7. **Add RLS to orphaned tables** — `scan_engine_responses`, `scan_mentions`, `scan_queries`, `competitor_scan_results`, `competitor_content_snapshots`, `email_log` have no migration and unknown RLS status. If kept, add RLS policies. If not needed, drop them to reduce surface area.

8. **Reconcile `subscriptions` schema** — Live uses `plan_tier` (enum) vs migration's `plan_id` (FK to plans). The migration was designed to replace `plan_tier` with a FK. Currently the user's subscription cannot join to the `plans` table for feature limit lookups. Decide which pattern to use and apply consistently.

9. **Clean test data** — Remove or archive the 10 test businesses (all "Writesonic" or "Localhost"), 6 null-scan_id free_scans, and 4 orphan tracked queries before any production data begins accumulating. These will skew any analytics or monitoring.

10. **`content_item_status` enum mismatch** — Live has `{draft, ready, published, archived}`. Migration has `{draft, in_review, approved, published, archived}`. App code referencing `'in_review'` or `'approved'` will fail silently or with 22P02.

11. **`recommendation_status` mismatch** — Live has `{pending, in_progress, done, dismissed}`. App code or cron jobs checking for `status = 'new'` or `status = 'completed'` will return 0 results or fail. Update app code to use `pending` and `done`.

12. **Migrate `email_log` to a migration file** — This table exists in production but has no migration file. Add it to a new migration to make it part of the official schema with proper RLS, indexes, and documentation.

13. **`plans.id` is text not uuid** — The plans table uses string PKs (`'starter'`, `'pro'`, `'business'`). The migration assumes UUID PKs. `subscriptions.plan_id` (if used) would need to be `text` type to join. Standardize on one approach.

14. **Paddle not configured** — `paddle_product_id` is NULL on all 3 plan rows. `paddle_customer_id` and `paddle_subscription_id` are NULL on the subscription. The billing upgrade flow cannot complete until Paddle product IDs are seeded into the plans table.

### P3 — Nice to Have

15. **Add index on `free_scans(scan_id)`** — When the scan_id population bug is fixed, queries like `?scan_id=eq.{nanoid}` will use a full table scan without this index.

16. **Drop deprecated `scan_engine_responses`** — If `scan_engine_results` is the canonical table (per MEMORY.md), `scan_engine_responses` should be formally deprecated and dropped. Currently 0 rows — easy to remove.

17. **Add `created_at` to `notification_preferences`** — Missing from live table, present in migration. Minor schema gap.

18. **Consolidate `notification_preferences` feature flags** — The 9 extra boolean columns (`ranking_change_alerts`, `scan_complete_emails`, etc.) are not in any migration file. Add a migration to document them formally.

19. **Add `free_scans` cleanup job** — The migration includes `idx_free_scans_cleanup` which implies a cleanup job for unconverted scans after 30 days. No evidence of this cron job existing in the Inngest functions. Add before launch.

20. **Create storage bucket for avatars** — When user avatar upload is implemented, a `avatars` bucket with appropriate policies will be needed. Pre-provision before the feature ships.

---

## Appendix: Live Table Inventory

**42 tables** exist in the live public schema. 36 are in migration files. 6 are undocumented (`scan_engine_responses`, `scan_mentions`, `scan_queries`, `competitor_content_snapshots`, `competitor_scan_results`, `email_log`).

**5 RPCs** exist: `hold_credits`, `confirm_credits`, `release_credits`, `allocate_monthly_credits`, `deduct_credits`. All 5 are non-functional due to enum mismatches or overload conflicts.

**0 storage buckets** defined.

**1 real user** in the system. Trial expires 2026-03-24.

**All data is test/dev data.** No real business data or customer scans exist.
