# CEO Handoff — Wave 2 Batch 2
*Written by CEO session ceo-1-1776597527, 2026-04-19. DB verified MVP-ready.*

---

## Paste this to start the next session

```
@"ceo (agent)" You are the CEO and Orchestrator. YOU are the CEO in this chat — read .agent/agents/ceo.md but do NOT deploy a CEO subagent.

Pre-flight reading (do ALL of these before delegating anything):
- CLAUDE.md
- docs/08-agents_work/HANDOFF-WAVE2-BATCH2.md  ← you are here
- docs/08-agents_work/sessions/2026-04-19-ceo-wave2-batch1.md
- .claude/memory/LONG-TERM.md
- .claude/memory/DECISIONS.md

Session context: Wave 0, Wave 1, and Wave 2 Batch 1 are complete and merged to main. Supabase is fully verified MVP-ready (33 tables, RLS 100%, all enums correct, 7 RPCs live, 20 legacy tables dropped). This session handles Wave 2 Batch 2. Deploy 4 workers in parallel immediately after pre-flight.
```

---

## Verified DB state (2026-04-19, confirmed by supabase-cleaner)

**33 public tables — all with RLS enabled.**

### Rethink tables (12) — all live ✅
`suggestions`, `query_runs`, `query_clusters`, `query_positions`, `submission_packages`, `automation_configs`, `page_locks`, `topic_ledger`, `performance_reports`, `inbox_item_edits`, `url_probes`, `daily_cap_usage`

### Core product tables (15) — all live ✅
`user_profiles`, `businesses`, `subscriptions`, `credit_pools`, `credit_transactions`, `scans`, `scan_engine_results`, `tracked_queries`, `competitors`, `agent_jobs`, `content_items`, `free_scans`, `notifications`, `plans`, `email_log`

### Other live tables ✅
`agent_workflows` (kept — rethink added cadence/next_run_at/paused_at), `api_keys`, `blog_posts`, `integrations`, `notification_preferences`, `recommendations`

### Legacy tables (20) — all dropped ✅
Archived in `_archive` schema (21 tables with `_2026_04_19` suffix). Retained 90 days.

### Plans ✅
- `discover` (active, 25 AI runs/mo), `build` (active, 90/mo), `scale` (active, 250/mo)
- `starter`, `pro`, `business` → `is_active = false`

### Enums ✅
- `plan_tier`: discover, build, scale (+ legacy starter/pro/business retained — can't drop without table rewrite)
- `agent_type`: all 12 new GEO agents present
- `content_item_status`: rejected added

### RPCs (7) ✅
`get_inbox_items`, `get_due_automations`, `get_query_trend`, `get_home_summary`, `acquire_page_lock`, `release_page_lock`, `check_topic_duplicate`

### Cleanup helpers (3) ✅
`expire_old_suggestions`, `clean_expired_locks`, `clean_expired_topics`

---

## Code state on main (2026-04-19, commit 1fa0572)

### What's merged
- **Wave 0**: DB migration, 11-agent system, app shell
- **Wave 0.5**: Shared types (`src/lib/types/shared.ts` + `api.ts`)
- **Wave 1**: 7 dashboard pages, 17 API routes, 7 Inngest functions, Paddle webhook, feature gating, 6 email templates, paywall, free-scan funnel
- **Wave 2 Batch 1 backend** (`feat/wave2-backend-wiring` — merged):
  - Inngest `agent-pipeline.ts` — full 5-step pipeline body
  - `sendEmail()` helper (`src/lib/resend/send.ts`)
  - Budget/scan/welcome/payment-failed/daily-digest email sends
  - Daily cap enforcement in `POST /api/agents/run`
  - Turnstile server-side verify on `POST /api/scan/start`
  - `user_profiles` id fix in Paddle webhook + daily-digest
  - Digest deduplication via `email_log` table
- **Wave 2 Batch 1 frontend** (`feat/wave2-frontend-polish` — merged):
  - Turnstile widget on `/scan` free-scan form
  - Home empty state ("Setting up your workspace...")
  - Empty states on inbox, scans, automation, archive, competitors

### Key file paths
| What | Path |
|------|------|
| Agent system | `apps/web/src/lib/agents/` |
| Inngest functions | `apps/web/src/inngest/functions/` |
| Email templates | `apps/web/src/lib/resend/templates/` |
| API routes | `apps/web/src/app/api/` |
| Dashboard pages | `apps/web/src/app/(protected)/` |
| Public pages | `apps/web/src/app/(public)/` |
| DB migrations | `apps/web/supabase/migrations/` |
| Cleanup SQL | `apps/web/supabase/cleanup/` |
| Shared types | `apps/web/src/lib/types/` |

### Important schema facts (burn these in — prevent repeat bugs)
- `user_profiles` PK is `id` (FK to `auth.users.id`) — NOT `user_id`
- `scans` uses `completed_at` — NOT `scanned_at`
- `content_items.status` is enum `content_item_status` — always cast to `::text` in SQL comparisons against text params
- Supabase SQL Editor splits `$$` blocks on semicolons → never use `LANGUAGE plpgsql` with local `DECLARE` variables in migrations; use `LANGUAGE sql` + CTEs instead (see `.claude/memory/feedback_supabase_plpgsql.md`)
- MCP is read-only (by design); apply migrations via Supabase SQL Editor manually

---

## Wave 2 Batch 2 — Deploy these 4 workers in parallel

Main repo root: `/Users/adamks/VibeCoding/Beamix`
Worktree creation: `git -C /Users/adamks/VibeCoding/Beamix worktree add /Users/adamks/VibeCoding/Beamix/.worktrees/[name] -b feat/[name]`

---

### Worker 1 — frontend-developer: Hebrew + RTL
Worktree: `feat/wave2-hebrew-rtl`

5 screens in Hebrew with RTL layout. Spec: `docs/product-rethink-2026-04-09/05-BOARD-DECISIONS-2026-04-15.md` (Hebrew section).

- Install/verify `next-intl` for string extraction
- Load Heebo font via `next/font/google` (Hebrew sister-font to Inter)
- RTL: use Tailwind logical properties only — `ms-` `me-` `ps-` `pe-` `start-` `end-` (never `ml-` `mr-` `pl-` `pr-`)
- Set `dir="rtl"` on html element when locale is `he`
- 5 screens: Home (`/home`), Scans (`/scans`), Inbox (`/inbox`), PaywallModal component, free-scan result page
- Translate key labels only (score, suggestions, CTA buttons, empty states)
- Israeli directory seed list: d.co.il, Easy.co.il, Rest.co.il, Bizmap/B144, Zap.co.il (for Off-Site agent reference strings)

---

### Worker 2 — test-engineer: E2E Playwright (5 flows)
Worktree: `feat/wave2-e2e-tests`

5 critical user journey tests. Create `apps/web/playwright.config.ts` if missing. Base URL: `http://localhost:3000`. Mock Turnstile via `BYPASS_TURNSTILE=true` env var (already handled in `scan/start/route.ts` — dev mode skips verify).

Flows:
1. **Free scan** — fill `/scan` form, submit, poll `GET /api/scan/[scanId]` until completed, assert score visible
2. **Preview mode** — from result, click "Explore first", assert `PreviewModeBanner` renders, click "Run Agent", assert `PaywallModal` opens
3. **Paywall modal** — assert 3 tiers shown, Build highlighted, annual toggle works
4. **Authenticated dashboard** — sign in as test user (use Supabase test credentials from env), assert `/home` loads score hero, `/inbox` accessible, `/scans` timeline renders
5. **Kill switch** — navigate to `/automation`, assert kill switch button present, click, assert confirmation modal

---

### Worker 3 — backend-developer: Sentry + ESLint
Worktree: `feat/wave2-sentry-lint`

**Sentry** (`@sentry/nextjs` already installed — check `apps/web/package.json`):
- `apps/web/sentry.client.config.ts` — browser SDK, `NEXT_PUBLIC_SENTRY_DSN`, 10% tracesSampleRate, Replay integration
- `apps/web/sentry.server.config.ts` — Node SDK, `SENTRY_DSN`, 10% tracesSampleRate
- `apps/web/sentry.edge.config.ts` — Edge SDK, `SENTRY_DSN`
- `apps/web/instrumentation.ts` — `register()` routing to server/edge config by `NEXT_RUNTIME`
- `apps/web/next.config.ts` — wrap export with `withSentryConfig(config, { silent: true, hideSourceMaps: true })`
- Add `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT` to `apps/web/.env.example`

**ESLint** (Next.js 16 + ESLint 9 flat-config compatibility issue):
- Check `apps/web/eslint.config.js` or `.eslintrc.*`
- Goal: `pnpm -F @beamix/web lint` exits without crashing
- If flat-config: import `@next/eslint-plugin-next` directly, not legacy `next/core-web-vitals` preset
- Do NOT fix pre-existing lint errors in app code — just fix the config

---

### Worker 4 — frontend-developer: Command palette + mobile QA
Worktree: `feat/wave2-cmd-palette-mobile`

**Command palette (⌘K)**:
- Install `cmdk` if not present (`pnpm -F @beamix/web add cmdk`)
- Global ⌘K / Ctrl+K shortcut opens modal palette
- Commands: navigate to Home, Inbox, Scans, Automation, Archive, Competitors, Settings
- Show icon + label + shortcut hint per item
- Mount in `DashboardShell` layout (`apps/web/src/app/(protected)/layout.tsx` or shell component)
- Close on Escape, close on click outside
- Style: dark overlay, neutral card, search input at top

**Mobile QA** (all 7 dashboard pages at 375px):
- Check each page for horizontal overflow, broken layouts, unreadable text
- Verify sidebar collapses on mobile (hamburger or drawer)
- Fix obvious breakages only — no full redesigns
- Pages: `/home`, `/inbox`, `/scans`, `/automation`, `/archive`, `/competitors`, `/settings`

---

## QA gate (mandatory before any merge)

Every worker branch before merge:
1. `pnpm -F @beamix/web typecheck` → 0 errors
2. `pnpm -F @beamix/web build` → compiles
3. QA Lead PASS (Security Engineer + Test Engineer in parallel)
4. Adam reviews and approves

---

## After Batch 2 merges — Wave 2 Batch 3

- Agent eval suite: 20+ golden test cases per Deep-6 agent, 5+ per Lighter-5
- Production Supabase project creation + migration apply + smoke test
- Go/no-go criteria check: `docs/product-rethink-2026-04-09/11-EXECUTION-PLAN.md`
- Inngest Pro upgrade ($75/mo) — free tier breaks at 10-15 users
- Paddle sandbox products creation (7 price IDs needed)
- Resend domain warm-up: `notify.beamix.tech` DNS (2-4 week lead time — start now)
