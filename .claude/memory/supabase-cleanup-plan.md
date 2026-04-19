# Supabase Cleanup Runbook

Live tracking doc for the `supabase-cleaner` agent. Read on every run; update on every pass.

## Status legend

- `proposed` — candidate identified, no SQL file written yet, waiting on Adam's yes/no
- `queued` — Adam said yes, SQL file written to `apps/web/supabase/cleanup/`, pending Adam's manual apply
- `applied-staging` — SQL run against staging, verified, pending production
- `applied-prod` — SQL run against production, verified, complete

## Current state

**Project:** Beamix (project-ref set via `SUPABASE_PROJECT_REF` env var)
**MCP mode:** `--read-only` (by design — agent surveys + plans, never mutates)
**Declared schema source of truth:** `apps/web/supabase/migrations/*.sql`
**Last audit:** not yet run

## Rethink context (2026-04-15)

The April 2026 rethink retired a lot of the pre-2026-03 product surface. The
cleanup agent's job is to remove what's safely removable from the live DB
without breaking historical references. See
`docs/product-rethink-2026-04-09/05-BOARD-DECISIONS-2026-04-15.md` for the
full list. The short version:

- 7 old agents retired, 11 new GEO agents ship in MVP-1 (+ 1 MVP-2)
- Pricing tiers went from `starter/pro/business` → `discover/build/scale`
- Trial model was killed — `trial_*` columns are dead freight
- Stripe was removed on 2026-03-02 — `stripe_*` columns are dead freight
- n8n orchestration was never wired — `n8n_*` anything is a ghost
- Old `Content Refresher` agent renamed to `Freshness Agent` — migrate rows, don't drop them
- Onboarding flow simplified in rethink — review `onboarding_*` tables for stale

Always archive before drop. Archive tables live in schema `_archive` with
date suffix: `_archive.<original_table>_YYYY_MM_DD`. Keep them 90 days.

## Audit log

(empty — agent appends YAML entries after each run)

---

## Known cleanup candidates (starting list — agent refines on first audit)

These are starting hypotheses from the rethink decision docs. The agent
validates each one against live DB state before proposing to Adam.

### Tables — likely retire (confirm each)
- `social_strategy_plans`, `social_post_templates` — Social Strategy agent retired
- `llms_txt_documents` — llms.txt generator retired
- Any `trial_*` table — trial model killed
- Any `stripe_*` table — Stripe removed

### Columns — likely retire (confirm each)
- `subscriptions.trial_ends_at`, `subscriptions.trial_started_at` — no trials now
- `subscriptions.stripe_customer_id`, `subscriptions.stripe_subscription_id`, `subscriptions.stripe_price_id` — Stripe gone
- `user_profiles.trial_agent_uses`, `user_profiles.trial_completed_at` — trial columns
- Any `n8n_*` column — n8n never shipped

### Enum values — deactivate, don't drop (PostgreSQL limitation)
- `plan_tier`: `'starter'`, `'pro'`, `'business'` — retired but keep for historical FK integrity
  - Instead: ensure `plans` rows with these tiers are `is_active = false`
- `agent_type`: legacy values (`content_writer`, `blog_writer`, `social_strategy`, `competitor_intelligence` old-version, `review_analyzer`, `schema_optimizer`, `llms_txt_generator`)
  - Keep enum values (removal requires type recreation), but verify no new rows use them

### Data — stale records
- `free_scans` older than 60 days where `converted_user_id IS NULL` — expired anonymous scans
- `agent_jobs` older than 90 days with `status IN ('failed', 'cancelled')` — historical noise
- `scan_engine_results` older than 180 days — retention policy
- `notifications` older than 30 days that are `read_at IS NOT NULL` — clutter

### RLS — verify coverage
- Every `public.*` table must have `rowsecurity = true`
- Every new rethink table (notifications, url_probes, daily_cap_usage, suggestions, query_runs, query_clusters, query_positions, submission_packages, automation_configs, page_locks, topic_ledger, performance_reports, inbox_item_edits) must have owner-scoped policy

## How Adam uses this

1. "Supabase cleaner, audit staging" — agent runs read-only audit, lists candidates, asks yes/no per item
2. Adam says yes to specific items
3. Agent writes numbered SQL files to `apps/web/supabase/cleanup/`
4. Adam reviews each file, runs STEP 1 (pre-flight SELECT) in Supabase SQL Editor
5. If counts look right, Adam runs STEP 2 (archive) + STEP 3 (drop)
6. Adam pings agent: "0001 applied on staging, please verify"
7. Agent re-queries state, confirms, marks runbook entry as `applied-staging`
8. After staging soak period, Adam says "apply 0001 on prod"
9. Agent confirms production scope, re-verifies, Adam runs on prod
10. Agent marks as `applied-prod`
