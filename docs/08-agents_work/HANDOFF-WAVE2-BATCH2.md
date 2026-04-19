# CEO Handoff — Wave 2 Batch 2
*Written by CEO session ceo-1-1776597527, 2026-04-19*

---

## Paste this prompt to start the next session

```
@"ceo (agent)" You are the CEO and Orchestrator. YOU are the CEO in this chat — read .agent/agents/ceo.md but do NOT deploy a CEO subagent.

Pre-flight reading (do ALL of these before delegating anything):
- CLAUDE.md
- docs/08-agents_work/HANDOFF-WAVE2-BATCH2.md  ← you are here
- docs/08-agents_work/sessions/2026-04-19-ceo-wave2-batch1.md
- .claude/memory/LONG-TERM.md
- .claude/memory/DECISIONS.md

Session context: Wave 0, Wave 1, and Wave 2 Batch 1 are complete and merged to main. Supabase migration 02 is applied. TypeScript types are regenerated. Two Wave 2 branches are ready for Adam to merge (see below). This session handles Wave 2 Batch 2.

---

## Current main branch state (as of 2026-04-19, commit ~29b7d5a)

### What's merged to main
- Turborepo + pnpm monorepo scaffold (apps/web/)
- Wave 0: DB migration (20260418_01 + 02 applied to staging), agent system (11 agents), app shell
- Wave 0.5: Shared types contract (src/lib/types/shared.ts + api.ts)
- Wave 1: 7 dashboard pages, 17 API routes, 7 Inngest functions, Paddle webhook, feature gating, 6 email templates, paywall, free-scan funnel
- Wave 2 Batch 1 code (2 branches — see below)
- Migration fixes committed to main (20260418_02 cast fix, enum fix, LANGUAGE sql CTE rewrite)
- database.types.ts regenerated (3,516 lines)

### Branches awaiting Adam's merge review
1. `feat/wave2-backend-wiring` — 3 commits:
   - Inngest agent-pipeline real body (full 5-step execution)
   - sendEmail() helper + budget/scan email sends
   - Daily cap enforcement, welcome/payment-failed/daily-digest emails, Turnstile server-verify fix, user_profiles id fix, digest dedup via email_log

2. `feat/wave2-frontend-polish` — 2 commits:
   - Turnstile widget on /scan (client-side), home empty state
   - 5 empty states: inbox, scans, automation, archive, competitors

### Supabase state
- Migration 01 applied: discover/build/scale plan_tier + 12 new agent_type values
- Migration 02 applied: 12 new tables, 10 ALTERs, 7 RPCs (LANGUAGE sql CTEs — no plpgsql vars)
- RLS: 100% on all 52 tables
- Plans: discover/build/scale active; starter/pro/business deactivated
- 4 cleanup SQL files written, pending Adam's manual apply:
  - apps/web/supabase/cleanup/0001-drop-competitor-intelligence-legacy.sql
  - apps/web/supabase/cleanup/0002-drop-retired-agent-tables.sql
  - apps/web/supabase/cleanup/0003-drop-misc-legacy.sql
  - apps/web/supabase/cleanup/0004-drop-trial-columns.sql
- After cleanup: regen types again (mcp__supabase__generate_typescript_types)

### Known lessons from last session
- Supabase SQL Editor splits $$-quoted strings on semicolons → local plpgsql DECLARE vars cause 42P01. Always use LANGUAGE sql + CTEs for migrations. (Saved to .claude/memory/feedback_supabase_plpgsql.md)
- user_profiles PK is `id` (not `user_id`) — FK to auth.users.id
- scans table has `completed_at` (not `scanned_at`)
- MCP is read-only (by design); apply migrations via Supabase SQL Editor manually

---

## Wave 2 Batch 2 — Your mission

Deploy 4-5 workers in parallel. Each has a bounded scope.

### Worker 1 — frontend-developer: Hebrew + RTL

5 core screens in Hebrew with RTL layout. Spec from docs/product-rethink-2026-04-09/05-BOARD-DECISIONS-2026-04-15.md (Hebrew section).

- `next-intl` for string extraction (already in package.json — verify)
- Heebo font for Hebrew text (paired with Inter — load via next/font)
- RTL pass using Tailwind logical properties: `ms-` `me-` `ps-` `pe-` `start-` `end-` (never `ml-` `mr-` `pl-` `pr-` `left-` `right-`)
- Set `dir="rtl"` on the html element when locale is `he`
- 5 screens to Hebraize: Home (`/home`), Scans (`/scans`), Inbox (`/inbox`), paywall modal (PaywallModal component), free-scan result page (`/scan` result view)
- Hebrew strings: score label, suggestion titles/descriptions, empty state text, CTA labels
- DO NOT translate the entire UI — just the 5 specified screens, key labels only
- Heebo is the Hebrew sister-font (visual weight parity with Inter)

Worktree: `feat/wave2-hebrew-rtl`

### Worker 2 — test-engineer: E2E Playwright (5 flows)

5 critical user flows, each as a separate Playwright test file.

Required reading: `apps/web/src/app/` route structure to understand page URLs.
Use `mcp__playwright__*` tools where available.

Flows:
1. **Free scan funnel** — land on `/scan`, fill form (URL + industry + location), submit (with Turnstile mocked in test env), poll until result, verify score + competitors appear
2. **Preview mode** — from scan result, click "Explore first", verify dashboard loads with PreviewModeBanner visible, verify agent run button triggers paywall modal
3. **Paywall flow** — click "Run Agent" anywhere in preview mode, verify PaywallModal opens with 3 tiers, Build highlighted
4. **Authenticated dashboard** — sign in as test user, verify Home loads with score hero, Inbox accessible, Scans timeline renders
5. **Kill switch** — go to `/automation`, verify kill switch button exists, click it, verify confirmation modal appears

Test config: `apps/web/playwright.config.ts` (create if missing). Base URL: `http://localhost:3000`.
Mock Turnstile in test env via env var `BYPASS_TURNSTILE=true` (already handled in scan/start route).

Worktree: `feat/wave2-e2e-tests`

### Worker 3 — backend-developer: Sentry + ESLint

**Sentry wiring** (`@sentry/nextjs` already installed):
- Create `apps/web/sentry.client.config.ts` — browser SDK, `NEXT_PUBLIC_SENTRY_DSN`, 10% sample rate, Replay integration
- Create `apps/web/sentry.server.config.ts` — Node SDK, `SENTRY_DSN`, 10% sample rate
- Create `apps/web/sentry.edge.config.ts` — Edge SDK, `SENTRY_DSN`
- Create or update `apps/web/instrumentation.ts` — call `register()` routing to server/edge config by `NEXT_RUNTIME`
- Update `apps/web/next.config.ts` — wrap with `withSentryConfig(config, { silent: true, hideSourceMaps: true })`
- Add `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT` to `apps/web/.env.example`

**ESLint flat-config fix** (Next.js 16 + ESLint 9 incompatibility with `next/core-web-vitals`):
- Check current ESLint config (`eslint.config.js` or `.eslintrc.*`)
- Fix so `pnpm -F @beamix/web lint` exits without crashing (config error resolved)
- Do NOT fix pre-existing lint errors in app code — just make the config valid
- If using flat-config: import `@next/eslint-plugin-next` directly rather than the legacy `next/core-web-vitals` preset

Worktree: `feat/wave2-sentry-lint`

### Worker 4 — frontend-developer: Command palette + mobile QA

**Command palette (⌘K)**:
- Global keyboard shortcut ⌘K (or Ctrl+K) opens a modal command palette
- Built with `cmdk` package (verify installed, add if not)
- Commands: navigate to Home, Inbox, Scans, Automation, Archive, Competitors, Settings
- Show as: icon + label + keyboard shortcut hint
- Close on Escape or click outside
- Mount in `DashboardShell` layout so it's available on all protected pages
- Style: dark overlay, white/neutral card, search input at top, results below

**Mobile layout QA pass** (all 7 dashboard pages):
- Check each page renders without horizontal overflow on 375px width (iPhone SE)
- Sidebar collapses to hamburger menu on mobile (or hidden with drawer — check what exists)
- Tables/grids stack vertically on mobile
- Fix any obvious mobile breakages (text overflow, buttons too small, hidden content)
- No full redesign — just fix regressions

Worktree: `feat/wave2-cmd-palette-mobile`

---

## Security requirements (include in every worker brief)

Per board decisions (10 security requirements):
1. Turnstile already wired on /scan ✅
2. SSRF validator in `src/lib/security/ssrf.ts` ✅ — workers must use it for any URL inputs
3. Paddle webhook HMAC verification ✅
4. RLS on all tables ✅
5. `rehype-sanitize` on markdown renders ✅
6. Rate limiting in `src/lib/security/rate-limit.ts` ✅ — apply to new API routes
7. Prompt injection sanitization — agents sanitize user content before LLM calls ✅
8. Credit locking (hold/confirm/release) ✅
9. Cost circuit breaker in budget-guard ✅
10. npm audit — run before final merge, 0 critical CVEs

---

## QA gate (mandatory before any merge)

Every worktree must pass before merge:
- `pnpm -F @beamix/web typecheck` → 0 errors
- `pnpm -F @beamix/web build` → compiles
- QA Lead PASS (Security Engineer + Test Engineer in parallel)
- Adam reviews PR before merge

---

## After Batch 2 merges — Wave 2 Batch 3

- Agent eval suite — 20+ golden test cases per Deep-6 agent (Query Mapper, Content Optimizer, Blog Strategist, Performance Tracker, FAQ Builder, Off-Site Presence Builder), 5+ per Lighter-5
- Production migration apply + smoke test + rollback plan
- Go/no-go criteria check (see docs/product-rethink-2026-04-09/11-EXECUTION-PLAN.md)

---

## Team leads to use

- `build-lead` for all code orchestration (deploys the 4 workers above)
- `qa-lead` before any merge
- `devops-lead` when production migration is ready

Do NOT use `design-lead` for Batch 2 — no new design work, only implementation of existing specs.

Main repo root: `/Users/adamks/VibeCoding/Beamix`
CEO worktree detection: run `git worktree list` first, use main repo root for child worktree creation.
```
