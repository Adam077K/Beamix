# Session handoff — 2026-04-19 (Wave 0 + Wave 1 complete, Supabase MCP wired, cleanup pending)

**Session span:** 2026-04-18 → 2026-04-19
**Branch in use (CEO worktree):** `ceo-1-1776528998`
**Main at session end:** `8b77c2e` (pushed to `origin/main`)
**Next session entry point:** paste the prompt in `docs/08-agents_work/HANDOFF-NEXT-SESSION.md`

---

## What this session accomplished

### 1. Platform restructure (big architectural move)
- Archived `saas-platform/` → `_archive/saas-platform-2026-04-legacy/` (preserved intact, reference only)
- Created Turborepo + pnpm monorepo at repo root
- New product lives at `apps/web/` (Next.js 16, React 19, TS strict)
- Workspace scripts: `pnpm -F @beamix/web {dev,build,typecheck,lint}`

### 2. Wave 0 — Foundation (merged to main)
- **DB migration** — 2-phase, split enum additions from schema changes per expert audit
  - Phase 1: `apps/web/supabase/migrations/20260418_01_rethink_enums.sql` (agent_type + plan_tier enum values)
  - Phase 2: `apps/web/supabase/migrations/20260418_02_rethink_schema.sql` (10 new tables + 10 ALTERs + 7 RPCs + RLS + seed)
  - 3 post-audit tables added to Phase 2: `notifications`, `url_probes`, `daily_cap_usage`
  - C8 plan seed fixed to use `discover/build/scale` tiers (not old `starter/pro/business`)
- **RLS tests + apply script** — `apps/web/supabase/tests/rls.sql`, `apply-staging.sh` (requires `--confirm` flag)
- **Agent system from scratch** — `apps/web/src/lib/agents/{types,config,pipeline,security,credit-guard,coordination,daily-cap}.ts` + 11 per-agent system prompts + direct Anthropic SDK router + OpenRouter fallback + cost tracking
- **App shell** — Sidebar (7 nav items + NotificationBell + user dropdown), DashboardShell, PlanBadge, auth + protected layouts

### 3. Wave 0.5 — Shared Types contract (merged to main)
- `apps/web/src/lib/types/shared.ts` — domain interfaces (Suggestion, InboxItem, ScanResult, AutomationSchedule, NotificationItem, …)
- `apps/web/src/lib/types/api.ts` — Zod schemas for every API request/response
- Shipped before Wave 1 started so backend + frontend workers built against a hard contract

### 4. Wave 1 — Full build (merged in 3 batches; all to main)
**Frontend pages (all with mock data, all rendering):**
- `/home` — score hero, suggestions feed, inbox preview, automation strip
- `/inbox` — 3-pane Superhuman layout, j/k/a/r keyboard nav, markdown preview with rehype-sanitize
- `/scans` — vertical timeline + drilldown modal
- `/automation` — schedule cards, kill switch, credits progress bar
- `/archive` — list + publish toggle + export menu + verification chip
- `/competitors` — table + trend sparklines + missed queries + add modal
- `/settings` — 7-tab layout (Profile, Business, Billing, Preferences, Notifications, Integrations, Automation Defaults)
- `/scan` (public) — pre-scan form + dark scanning animation + wound-reveal result + explore-first modal
- Paywall — TierCard × 3, PaywallModal, PaywallGate HOC, PreviewModeBanner wired to DashboardShell

**Backend — 17 API routes:**
- Agents: `POST /api/agents/run`, `POST /api/agents/[jobId]/cancel`
- Suggestions: `GET /api/suggestions`, `POST /api/suggestions/[id]/dismiss`
- Scan: `POST /api/scan/start`, `GET /api/scan/[scanId]`, `GET /api/scans`
- Notifications: `GET /api/notifications`, `POST /api/notifications/read`
- Automation: `GET+POST /api/automation/schedules`, `POST /api/automation/kill-switch`
- Archive: `POST /api/archive/[itemId]/publish`
- Credits: `GET /api/credits/balance`
- Plan: `GET /api/plan/features`
- Billing: `POST /api/billing/checkout`, `POST /api/billing/portal`, `POST /api/webhooks/paddle` (HMAC verified)
- `GET /api/health` (validates required env vars)

**Inngest functions — 7 registered:**
- `scan-run` — real LLM calls per engine × query, aggregates score
- `agent-pipeline` — stub (listens on `agent.run.requested`; body pending)
- `automation-dispatcher` — 15-min cron fanning out due schedules
- `scan-completed` — writes suggestions via rules engine
- `url-probe` — 48h-delayed verification of published archive items
- `budget-guard` — hourly cron, 75% + 100% credit alerts + auto-pause
- `daily-digest` — 7am UTC cron (send wiring deferred)

**Rules engine:** 15 hardcoded rules in `apps/web/src/lib/suggestions/rules.ts` (all shipped)

**Paddle webhook:** HMAC signature verified, handles subscription.created/updated/canceled + payment.failed, fires `paddle.subscription.activated` Inngest event for day-1 trigger chain.

**Feature gating:** `apps/web/src/lib/plan/features.ts` — `canAccess`, `getUserTier`, tier feature map, competitor limits, daily cap map.

**Email templates (6):** welcome, scan-complete, daily-digest, payment-failed, budget-75, budget-100 (Resend client stub; send calls not yet wired to events).

### 5. Supabase MCP + cleaner agent (wired, activation pending — see below)
- `.mcp.json` at project root — reads `${SUPABASE_PROJECT_REF}` + `${SUPABASE_ACCESS_TOKEN}` from env, starts in `--read-only` mode
- `.envrc.example` — template; real values live in gitignored `.envrc` (direnv auto-load on cd)
- `.claude/agents/supabase-cleaner.md` — dedicated custodian agent with `mcp__supabase__*` read-only tool allowlist; never executes destructive SQL, always emits reviewable SQL files
- `.claude/memory/supabase-cleanup-plan.md` — live runbook with starting cleanup-candidate list
- `SUPABASE-MCP-SETUP.md` — activation guide for Adam

## Quality gates passing

- `pnpm -F @beamix/web typecheck` → **0 errors**
- `pnpm -F @beamix/web build` → **15 protected/public routes + 17 API routes compile**
- No hardcoded secrets in any committed file
- Zero CVEs in `pnpm audit` (protobufjs ≥ 7.5.5, next ≥ 16.2.4, path-to-regexp patched)

---

## Where we left off — 3 blockers

### BLOCKER 1 — Supabase MCP authentication

**Symptom:** MCP tools (`mcp__supabase__list_tables`, etc.) are exposed in the current session but return `401 Unauthorized`.

**Cause:** Adam's `.envrc` was filled in AFTER Claude Code launched. The MCP subprocess was spawned with literal `"FILL_IN_ACCESS_TOKEN"` env value.

**Security issue discovered:** Adam's real Supabase PAT ended up in the CEO agent's context via a `Read` call on `.envrc`. That token should be considered leaked (Claude Code transcripts are stored locally). **Rotate it.**

**Fix sequence (blocking everything Supabase):**
1. Go to https://supabase.com/dashboard/account/tokens → revoke the current token (`sbp_b17ff…`) → generate new one
2. Paste new token into `/Users/adamks/VibeCoding/Beamix/.envrc` replacing the current value
3. **Fully quit Claude Code** (⌘Q)
4. Open a fresh Terminal, `cd /Users/adamks/VibeCoding/Beamix` — direnv should print `direnv: loading .envrc` + `direnv: export +SUPABASE_ACCESS_TOKEN +SUPABASE_PROJECT_REF`
5. Launch Claude Code **from that terminal** with `claude` — launching from Spotlight/Dock won't inherit the env vars
6. In the new session, `/mcp` should show `supabase` as connected (not just listed)
7. Run `mcp__supabase__list_tables({"schemas":["public"], "verbose":false})` from CEO context as a smoke test — it should return actual tables

### BLOCKER 2 — DB migration not applied on staging

The 2-phase rethink migration exists in the repo but has **not** been applied to the live Supabase staging project. Until it is:
- `database.types.ts` is stale (doesn't include new tables like `suggestions`, `notifications`, `url_probes`, `daily_cap_usage`)
- API routes that query new tables will return empty / 500
- The supabase-cleaner agent's audit will flag "missing" tables as declared-but-not-live

**Fix:**
```bash
bash apps/web/supabase/apply-staging.sh --confirm
# then:
supabase gen types typescript --project-id $SUPABASE_PROJECT_REF > apps/web/src/lib/types/database.ts
git add apps/web/src/lib/types/database.ts && git commit -m "chore(types): regenerate database types from staging post-rethink migration"
```

This is best done **after** Blocker 1 is resolved (so the supabase-cleaner can verify the apply worked).

### BLOCKER 3 — Legacy Supabase data cleanup

Per user request, the live Supabase project has lots of junk from the pre-rethink product (old agents, stripe_* columns, trial_* columns, old `plan_tier` values, stale free_scans, etc.). The `supabase-cleaner` agent is the tool for this job, but it needs Blocker 1 resolved first.

---

## Open Wave 1 items (functional gaps, not blockers)

None of these block launch, but they need to land in Wave 2 or Wave 3:

- **Inngest `agent-pipeline` body** — currently a stub. Needs to call `runPipeline()` from `lib/agents/pipeline.ts` with real business context.
- **Email send wiring** — 6 templates exist but no event handlers call `sendEmail()` yet. Needs to wire: signup → welcome, scan.completed → scan-complete, budget thresholds → budget-75/budget-100, payment.failed → payment-failed, daily-digest cron → daily-digest.
- **Daily cap enforcement middleware** — `daily-cap.ts` module exists but `POST /api/agents/run` doesn't call `checkDailyCap` before `holdCredits`.
- **Suggestion rules write wire-up** — `writeSuggestions()` exists; `scan-completed` Inngest function calls it. Need to verify full path on first real scan.
- **Turnstile on /scan public form** — component is installed but not yet rendered on the free-scan form.
- **Lint** — deferred to Wave 2 because of Next 16 + ESLint 9 flat-config compatibility issue with `next/core-web-vitals`.
- **Sentry** — `@sentry/nextjs` is installed; no `sentry.*.config.ts` files exist yet.

## Wave 2 — queued but not started

- Hebrew UI + RTL on 5 core screens (Home, Scans, Inbox, paywall modal, scan results)
- E2E Playwright tests — 5 flows (scan → preview → paywall → agent run → inbox approve)
- Empty states for every page (several still placeholder)
- Command palette (⌘K) — scaffold in design-system spec, not yet built
- Mobile layout QA pass on all 7 dashboard pages
- Agent-content eval suite — 20+ golden test cases per Deep-6 agent, 5+ per Lighter-5 agent
- Production migration apply + smoke test + rollback plan

---

## Files Adam needs to know exist

| Path | Why it matters |
|---|---|
| `.envrc` (gitignored) | Project-scoped Supabase secrets — never committed |
| `.envrc.example` | Template for new machines / team members |
| `.mcp.json` | Supabase MCP config, env var expansion |
| `apps/web/.env.example` | 28-key env contract for deploy |
| `apps/web/supabase/apply-staging.sh` | Applies 01 then 02 migrations with `--confirm` flag |
| `apps/web/supabase/tests/rls.sql` | RLS verification queries — run post-migration |
| `apps/web/supabase/README.md` | Migration ordering + RLS testing guide |
| `SUPABASE-MCP-SETUP.md` | One-time MCP activation steps |
| `docs/product-rethink-2026-04-09/` | Authoritative decisions (15 files — pricing, agents, UX, security) |
| `.claude/agents/supabase-cleaner.md` | The cleanup custodian agent |
| `.claude/memory/supabase-cleanup-plan.md` | Live cleanup runbook (agent reads + updates each run) |

## Stale git hygiene (cleanup candidates — not urgent)

Multiple pre-rethink worktrees + unmerged `feat/*` branches still exist (e.g. `feat/design-dashboard-overview`, `feat/marketing-showcase`, `feat/db-rethink-schema`, etc.). None contain unique work — all are either merged or superseded. Can be pruned with `git worktree remove` + `git branch -D`. Deferred.

`.worktrees/` is ~5 GB on disk.

---

## Known risks for next session

1. **Token rotation discipline** — if the new Supabase PAT leaks through a `Read` on `.envrc` again, rotate again. Consider using a read-only restricted token scope if Supabase supports it (they don't as of this writing — PATs are all-or-nothing).
2. **Inngest Pro upgrade pending** — free tier breaks at 10-15 users. Needs $75/mo upgrade before load test.
3. **Resend domain warm-up** — `notify.beamix.tech` DNS not yet configured. 2-4 week lead time. Start immediately.
4. **Paddle sandbox products not created** — 7 price IDs needed in env. All Paddle-wired routes will 4xx until this is done.
5. **No production Supabase project yet** — all migrations land on a staging project. Prod project creation + migration apply is a Wave 2 devops task.
