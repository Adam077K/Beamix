# Beamix MVP Execution Plan — Final

## Context

Beamix completed a full product rethink (April 2026). All decisions are documented in `docs/product-rethink-2026-04-09/` (14 files). This plan covers the MVP build from scratch — production-grade quality, shipped in waves at Adam's pace.

**Team:** Adam + AI agent workforce (no human devs)
**Review model:** Per-PR — each worktree creates a PR, Adam reviews before merge
**Manual tasks (Adam):** Paddle products, DNS, staging migration — run parallel with Wave 0

---

## Build Philosophy: FROM SCRATCH, HIGH QUALITY

The existing codebase is NOT the starting point. Most current code is low-quality and won't be reused. We build a true SaaS product from scratch — production-grade, not patched stubs.

**What we KEEP:**
- Supabase project + auth (works, no reason to rebuild)
- Paddle SDK integration (checkout + webhooks — works)
- Inngest client setup (works, we add new functions)
- Shadcn/UI primitives (27 components — clean by design)
- Next.js 16 + TypeScript + Tailwind config
- OpenRouter gateway (`openrouter.ts` — extend, don't rewrite)
- Middleware (auth protection — works)

**What we BUILD FRESH:**
- All 7 dashboard pages — from scratch, not refactoring stubs
- Agent system — new 5-step pipeline, new config, new prompts. Old execute.ts is reference only.
- Scan pipeline — rebuild with Query Mapper + dual-text queries. Old scan-core.ts is reference only.
- All dashboard components — fresh, production-grade. Old components are reference for patterns, not reuse.
- Inngest functions — all new (automation dispatcher, agent pipeline, rules engine, day-1 trigger)
- Email system — fresh Resend integration, new templates
- Content workspace — new (inline editor, GEO sidebar)
- Free scan UX — completely new (dark animation, wound reveal, preview mode)

**Quality target: Notion.** Warm, flexible, rich editing, content-creation focused. Block-style content, smooth transitions, real depth in every interaction. Not cold/minimal — Beamix is a creative tool for non-technical users.

**Route structure: RESTRUCTURED.** No `/dashboard/*` prefix.
```
(protected)/
  home/          → score + suggestions + inbox preview
  inbox/         → 3-pane review queue
  scans/         → timeline + drilldown
  automation/    → schedules + budget + kill switch
  archive/       → approved content history
  competitors/   → tracking + movement alerts
  settings/      → 7-tab settings
```
Old `/dashboard/*` routes are deleted entirely. Clean URL structure for a premium product.

**Design reference:** https://getdesign.md/vercel/design-md — Vercel's design system as the visual baseline. All design-lead + frontend-developer agents must read this before building. Beamix brand tokens (`#3370FF`, Inter/InterDisplay) override Vercel's palette.

**Quality bar:** Vercel's polish + Notion's warmth. No stubs. No TODOs. Real animations (springs, not linear), real error handling, real empty states, real keyboard shortcuts. Content-first layout.

---

## Execution Model: CEO-Led Teams

Each wave is executed by a CEO agent who reads the wave brief, assembles the right team (leads + workers), delegates tasks to parallel worktrees, and manages PRs. Adam reviews each PR before merge.

**No fixed timeline.** Waves execute when Adam is ready. Each wave starts when the previous one's PRs are merged. Adam controls the pace.

```
Adam gives wave brief to CEO agent
  → CEO reads brief + all rethink docs
  → CEO deploys team leads (build-lead, design-lead, qa-lead)
  → Team leads spawn workers (frontend-developer, backend-developer, ai-engineer, etc.)
  → Workers build in isolated worktrees
  → CEO collects PRs, runs QA gate
  → Adam reviews + merges
  → Next wave begins
```

Each wave brief below is written as a CEO handoff — ready to paste into a new CEO session.

---

## Pre-Build: Adam's Manual Checklist

Complete these before starting Wave 0. Some can run in parallel with Wave 0 execution.

- [ ] Create Paddle products: Discover monthly/annual, Build monthly/annual, Scale monthly/annual, $19 top-up
- [ ] Get all 7 Paddle price IDs → add to `.env.local` and Vercel env vars
- [ ] Configure DNS: `notify.beamix.tech` → Resend (SPF, DKIM, DMARC records)
- [ ] Run DB migration on Supabase staging → verify tables and RLS
- [ ] Run `supabase gen types typescript` → commit `database.types.ts`
- [ ] Set up Sentry project → get DSN → add to env vars
- [ ] Verify OpenRouter API keys have sufficient credits ($500+ buffer)

---

## Wave 0 — Foundation ⛔ BLOCKS EVERYTHING

Nothing in Wave 1 or 2 can start until Wave 0 is merged. Three workers in parallel.

### CEO Brief for Wave 0:

> You are building the foundation that every other wave depends on. Nothing else can start until this merges. Deploy 3 workers in parallel worktrees. Quality bar: production-grade, zero shortcuts.
>
> **Required reading before starting:** All docs in `docs/product-rethink-2026-04-09/`, especially `05-BOARD-DECISIONS-2026-04-15.md`, `07-AGENT-ROSTER-V2.md`, `08-UX-ARCHITECTURE.md`, `10-PRE-BUILD-AUDIT.md`, `12-AGENT-BUILD-SPEC.md`.
> **Design reference:** https://getdesign.md/vercel/design-md
>
> **Worker 1 — database-engineer:** Full DB migration. 10 new tables, ALTER 10 existing, new enums (discover/build/scale + 11 agent types), 7 RPCs, RLS on all new tables. Run `supabase gen types typescript`. Deactivate old plan rows. See the migration already drafted in worktree `feat/db-rethink-schema`. Add: `notifications` table (for in-app notification center), `page_locks` table, `topic_ledger` table, `daily_cap_usage` table, `url_probes` table (for off-site verification loop).
>
> **Worker 2 — ai-engineer (Opus):** Agent system from scratch. New `src/lib/agents/` with: config registry (11 agents), 5-step pipeline (plan→research→do→QA→summarize), per-agent system prompts, model routing (Haiku/Sonnet/Sonar per stage), Sonar citation verification in QA, credit cost mapping (1/2/3 runs), cross-agent coordination (page_locks + topic_ledger utilities), daily cap enforcement helpers. Read `12-AGENT-BUILD-SPEC.md` for full file structure and TypeScript types. Read `07-AGENT-ROSTER-V2.md` for business context. NO AI disclosure in any prompt.
>
> **Worker 3 — frontend-developer:** App shell from scratch. New route structure: `(protected)/home/`, `/inbox/`, `/scans/`, `/automation/`, `/archive/`, `/competitors/`, `/settings/`. Delete old `/dashboard/*` routes. New sidebar component (7 items + notification bell). Command palette (⌘K) with new routes. DashboardShell rebuilt with Vercel-quality layout. Read `08-UX-ARCHITECTURE.md` §2 for sidebar spec.
>
> **Merge order:** Worker 1 first (types needed by all), then Worker 2 + Worker 3 (no conflict between agent lib and frontend shell).
> **PR count:** 3. Adam reviews each before merge.

---

### Wave 0.5 — Shared Types (after DB merge, before Wave 1)

After Worker 1's DB migration merges and `database.types.ts` is generated, one backend-developer creates the shared type contract. Wave 1 cannot start until this merges.

**Worker: backend-developer, ~2–4 hours**

**Deliverables:**

`src/lib/types/shared.ts` — all cross-worker interfaces:
```typescript
InboxItem
Suggestion
AgentConfig
AgentJobInput
AgentJobOutput
AgentPipelineContext
ScanResult
BusinessContext
PlanTier          // 'discover' | 'build' | 'scale'
QAResult
CostEntry
NotificationItem
DailyCapStatus
VerificationStatus
```

`src/lib/types/api.ts` — Zod schemas for every API request/response shape. This is the CONTRACT between backend and frontend workers. Frontend builds against these types; backend implements to them. Mismatches caught at compile time, not runtime.

**This file is the contract.** Must merge before any Wave 1/2 work begins.

---

## Wave 1 — Full Build (backend + frontend in parallel)

Wave 0.5 is merged. Backend and frontend work in parallel. Frontend builds against shared types from `src/lib/types/`. Backend delivers real APIs.

### CEO Brief for Wave 1:

> Wave 0 is merged. Shared types exist. Now build everything in parallel — 3 backend workers and 3 frontend workers running simultaneously. Frontend uses shared types to build against the API contract. Backend delivers the real implementations.
>
> **Required reading:** `05-BOARD-DECISIONS-2026-04-15.md`, `07-AGENT-ROSTER-V2.md`, `08-UX-ARCHITECTURE.md`, `12-AGENT-BUILD-SPEC.md`, `13-DESIGN-SYSTEM-SPEC.md`, `14-SCAN-UX-SPEC.md`.

---

#### Backend Team (3 workers)

All API routes are owned by backend workers — not frontend.

**Backend Worker 1 — backend-developer: Inngest automation engine**
- Automation dispatcher cron (every 15 min fan-out)
- Agent pipeline Inngest function (5-step execution, reads from `12-AGENT-BUILD-SPEC.md`)
- Rules engine: 15 hardcoded rules in `src/lib/suggestions/rules.ts` (fire on `scan.completed`)
- Suggestion generator (fires on scan.completed, writes to `suggestions` table)
- Day-1 auto-trigger chain: Paddle webhook → Query Mapper → scan → rules → first agents
- Kill switch: global + per-agent pause logic
- Credit budget enforcement: 75% alert + 100% auto-pause
- Cross-agent coordination: `page_locks` util (lock/unlock URL for an agent), `topic_ledger` util (check/register topic before blog generation)
- Off-site verification loop: URL probe Inngest job (fires +48h after `published_at` set), updates `url_probes` table, checked at next scan cycle

API routes owned by Worker 1:
- `POST /api/agents/run` — enqueue agent job
- `POST /api/agents/[jobId]/cancel` — cancel in-flight job
- `GET /api/suggestions` — ranked suggestions list
- `POST /api/suggestions/[id]/dismiss` — dismiss suggestion
- `GET /api/automation/schedules` — user's active schedules
- `POST /api/automation/schedules` — create/update schedule
- `POST /api/automation/kill-switch` — global pause toggle

**Backend Worker 2 — backend-developer: Scan pipeline + billing + feature gating**
- Scan pipeline rebuild: Query Mapper integration (reads `tracked_queries`, fallback to templates), dual-text query model (`scan_text` vs `target_text`), `brands_mentioned` extraction in `scan_engine_results`, post-scan materializer → `query_positions`
- Tier-based scan scheduling (rate limits per plan)
- Billing from scratch: new Paddle webhook handler for discover/build/scale, plan seed data + credit allocations (25/90/250), $19 top-up pack
- Feature-gating utility: `canAccess(userId, feature)` — used everywhere
- Upgrade flow for existing subscribers: Paddle Customer Portal redirect + in-app plan comparison modal (not just new subscriber flow)
- Remove all trial logic (no trial in v2 — 14-day money-back guarantee instead)

API routes owned by Worker 2:
- `POST /api/scan/start` — fire Inngest scan job, return 202
- `GET /api/scan/[scanId]` — poll scan status
- `GET /api/scans` — scan history for user
- `POST /api/billing/checkout` — create Paddle checkout session
- `POST /api/billing/portal` — redirect to Paddle customer portal
- `POST /api/webhooks/paddle` — handle all Paddle webhook events
- `GET /api/plan/features` — feature entitlement map for current user

**Backend Worker 3 — backend-developer: Email + notifications + daily caps**
- Email system: Wire Resend to send from `notify.beamix.tech`. 6 priority templates: welcome, scan-complete, daily-digest, payment-failed, budget-75%, budget-100%. Daily digest aggregation cron (7am, max 1 email/day per user)
- In-app notification center: insert to `notifications` table on all key events, read endpoint with pagination, mark-read endpoint
- Daily cap enforcement: middleware check on agent run routes reads `daily_cap_usage` table; increments on each run; resets at midnight UTC
- Credit budget alerts: 75% threshold → instant email + notification insert; 100% → email + notification + auto-pause all schedules

API routes owned by Worker 3:
- `GET /api/notifications` — paginated notification list
- `POST /api/notifications/read` — mark one or all read
- `GET /api/credits/balance` — current pool balance + daily cap status
- `POST /api/archive/[itemId]/publish` — mark item published, queue URL probe

---

#### Frontend Team (3 workers + design-lead)

**Step 1 — design-lead (2-hour prep before frontend workers start):**
Read `13-DESIGN-SYSTEM-SPEC.md`. Define: motion.ts spring presets, shared component props interfaces, empty state illustrations, loading skeleton patterns. Output: a 1-page component patterns doc that all 3 frontend workers reference. Use Stitch MCP if available.

**Frontend Worker 1 — frontend-developer: Home + Inbox**

Home (`/home`):
- Score hero: animated counter (spring), 8-week sparkline with pulse dot, delta pill (↑↓)
- Suggestions feed: top 3 cards, approve/dismiss with spring animation, estimated impact badge
- Inbox preview: 3-row compact view, unread indicator
- Automation status strip: next scheduled run, credit bar
- Signals feed: competitor movements, new queries
- "Setting up workspace..." empty state for day-1 (before first scan)
- Tier differences: Discover sees score + 1 suggestion, rest blurred + paywall prompt

Inbox (`/inbox`):
- 3-pane Superhuman layout from scratch (list · preview · evidence)
- Filters rail: All / Draft / Awaiting Review / Approved / Archived
- Markdown preview with `react-markdown` (no TipTap)
- Approve / Reject / Archive actions with auto-advance to next item
- Keyboard nav: J/K navigate · A approve · R reject · E edit · ⌘K command palette
- Inline chat editor for Freshness Agent only: select text → floating capsule → Haiku rewrite → accept/reject diff
- Evidence panel: trigger source, target queries, research citations, impact estimate, YMYL badge if flagged
- Supabase Realtime subscription on `inbox_items` table → unread badge updates live
- Tier differences: Discover sees 1 locked item blurred. Scale gets bulk-approve.
- Reference `08-UX-ARCHITECTURE.md` §6

**Frontend Worker 2 — frontend-developer: Scans + Automation + Free scan UX**

Scans (`/scans`):
- Vertical timeline (date · score · delta pill)
- Scan drilldown: per-engine result cards, mention snippets, query coverage map
- Re-scan button with rate-limit countdown display
- Diff view: this scan vs previous (score delta, new/lost queries)

Automation (`/automation`):
- Projection header: credits used / cap bar
- Agent schedule cards (2-col grid): name, cadence selector, last run, next run, status
- Per-agent pause toggle
- Kill switch (top of page): confirmation modal, global pause
- Tier-lock badges on Scale-only features
- Soft page-cap warning dialog when >5 rules fire simultaneously

Free scan UX (`/scan` public page):
- Read `14-SCAN-UX-SPEC.md` — this is the conversion funnel, every detail matters
- Pre-scan form with progressive reveal
- Dark scanning animation (real Inngest job, polling)
- Wound-reveal result page
- "Explore first" path → preview mode transition

**Frontend Worker 3 — frontend-developer: Archive + Competitors + Settings + Preview mode + Paywall**

Archive (`/archive`):
- Approved items list: date approved, agent, target page, estimated impact
- Self-reported publish status toggle ("Mark as published")
- Verification status chip (Pending probe / Verified / Unverified)
- Export: copy MD / HTML per item. Scale tier: CSV/JSON bulk export.
- Rich empty state for new accounts

Competitors (`/competitors`):
- Competitor appearance rate by engine (table)
- "Queries where they appear, you don't" section with query list
- Add-competitor modal (URL input + validation)
- 4-week mention trend per competitor
- Movement alerts: "MovingTLV appeared in 3 new queries" banner
- Tier-lock: Discover sees page freely (3 competitors). Scale gets daily refresh.

Settings (`/settings`):
- 7 tabs from scratch: Profile, Business, Billing, Preferences, Notifications, Integrations, Automation Defaults
- Billing tab wired to Paddle portal link + invoice history
- Notifications tab: per-event toggles, daily digest time selector, push opt-in
- Integrations tab: GA4 / GSC connect (optional, stubs are acceptable for MVP)

Preview mode + Paywall:
- Preview account auto-creation (email capture → Supabase auth magic link)
- Persistent top banner in `DashboardShell` layout: "Preview mode — upgrade to unlock agents"
- `PaywallGate` component: wraps any action that requires a paid plan → triggers paywall modal
- Paywall modal (880px): Build highlighted, all 3 tiers shown, annual toggle, → Paddle checkout
- Post-payment redirect to `/onboarding/post-payment` with webhook polling
- One free FAQ Builder run per preview account (result in Inbox, approve triggers paywall)
- Upgrade flow for existing subscribers: in-app plan comparison modal + Paddle portal redirect (not just new users)

---

### 5 Previously Missing Features — Added to Wave 1

These were specified in the board decisions but not in the original execution plan. All are assigned to Wave 1 backend workers.

1. **Daily cap enforcement** — Backend Worker 3 adds middleware check on `POST /api/agents/run` + `daily_cap_usage` DB table read/increment. Per-agent caps from `07-AGENT-ROSTER-V2.md` Cost Classification table (e.g., Schema: 20/20/20, FAQ: 3/5/10).

2. **Off-site verification loop** — Backend Worker 1 adds Inngest URL-probe job (fires +48h after `published_at` set on Archive item). Probes URL for content presence. Result written to `url_probes` table. Next scheduled scan reads probe result and marks `verification_status` on Archive item.

3. **Cross-agent coordination** (`page_locks`, `topic_ledger`) — Backend Worker 1 adds to automation engine. `page_locks` prevents Content Optimizer + Freshness Agent + Blog Strategist from editing the same URL simultaneously. `topic_ledger` prevents Blog Strategist + FAQ Builder from generating duplicate topic coverage.

4. **In-app notification center** — Backend Worker 3 builds: `notifications` table insert on all key events (item ready, budget alert, competitor alert, scan complete). `GET /api/notifications` endpoint. Frontend Worker 1 adds bell icon in sidebar with unread count badge + dropdown panel (Today / Earlier groups), wired to the API.

5. **Upgrade flow for existing subscribers** — Backend Worker 2 adds to billing: Paddle Customer Portal redirect for plan changes (not just cancellation). Frontend Worker 3 adds in-app plan comparison modal in Settings Billing tab that existing subscribers can use to upgrade without going through the full checkout flow.

---

## Wave 2 — Polish + Launch

Everything is built. Now make it production-grade and launch-ready.

### CEO Brief for Wave 2:

> All features are built and merged. Wave 2 makes everything launch-ready. Deploy QA lead + 4 parallel workers.
>
> **Worker 1 — frontend-developer:** Hebrew + RTL. 5 core screens in Hebrew (Home, Scans, Inbox, paywall modal, scan results). RTL pass on ALL new pages using Tailwind logical properties (`ms-`, `me-`, `ps-`, `pe-`). `next-intl` string extraction. Heebo font for Hebrew text.
>
> **Worker 2 — qa-lead:** Full quality pass. Error boundaries on every page. Loading skeletons for every async op. 5 E2E Playwright flows (scan → preview → paywall → agent → inbox). Mobile QA on all 7 pages. Credit system unit tests (hold/confirm/release cycle). Daily cap enforcement tests.
>
> **Worker 3 — devops-lead:** Launch setup. Production migration. All env vars audited + documented. Sentry wired + alert rules set. LLM cost logging (OpenRouter usage events). Credit reconciliation cron. Vercel deployment verified. Rollback plan documented.
>
> **Worker 4 — frontend-developer:** Empty states for every page. Mobile layout QA on all 7 pages. Command palette completeness check. Keyboard shortcut audit (J/K/A/R in Inbox). Animation spring tuning pass.
>
> **PR count:** 4. QA lead reviews all before final merge.

---

## Go/No-Go Criteria

Ship when ALL are true:

- [ ] Free scan → result page → signup → dashboard works end-to-end on staging
- [ ] At least 8/11 agents produce non-empty output on golden test cases
- [ ] Paddle checkout → webhook → credits allocated → agent run → Inbox item (full flow)
- [ ] Kill switch stops all scheduled runs within 15 minutes
- [ ] Resend delivers welcome + scan-complete + budget-75% emails to test inbox
- [ ] Daily cap enforcement blocks runs after cap hit (verified in test)
- [ ] Off-site verification loop queues and resolves on staging
- [ ] Cross-agent page_locks prevent concurrent edits in test scenario
- [ ] In-app notification bell shows unread count and clears on read
- [ ] Upgrade flow works for an existing Discover subscriber moving to Build
- [ ] Production migration applied without data loss
- [ ] No P0 Sentry errors in 1-hour staging soak test

---

## Verification

- Run 5 E2E flows on staging with real Paddle sandbox checkout
- 1-hour soak test: leave agents running, verify credit reconciliation and daily cap reset
- Test with 2–3 invited Israeli SMBs before opening to all invitees
- Hebrew: visual QA on 5 core screens with RTL layout
- Notification center: verify all 6 event types appear correctly in bell dropdown

---

## Reference Specs for Workers

Workers must read the relevant spec before starting. These are the authoritative sources.

| Spec | Audience | What it covers |
|------|----------|---------------|
| `07-AGENT-ROSTER-V2.md` | ai-engineer, backend-developer | Agent business logic, cost classification, daily caps, cross-agent coordination |
| `08-UX-ARCHITECTURE.md` | frontend-developer, design-lead | All 7 pages spec, free scan flow, notification system, automation model |
| `10-PRE-BUILD-AUDIT.md` | All workers | What exists, what's broken, what to delete |
| `12-AGENT-BUILD-SPEC.md` | ai-engineer (Wave 0 Worker 2) | Agent system file structure, TypeScript types, 5-step pipeline, model router |
| `13-DESIGN-SYSTEM-SPEC.md` | design-lead, frontend-developer | Component inventory, motion system, layout patterns, design tokens |
| `14-SCAN-UX-SPEC.md` | frontend-developer (Wave 1 Frontend Worker 2) | Free scan route structure, animation, wound-reveal, preview mode transition |

---

## Key Risk Mitigations

- DB migration runs on Supabase staging before any code touches production
- Shared types file (`src/lib/types/`) created in Wave 0.5 before any Wave 1 worker starts — prevents interface drift between backend and frontend
- All API routes owned by backend workers — no frontend worker writes API routes
- All 11 agent prompts eval'd against 5 golden cases before merge (see `07-AGENT-ROSTER-V2.md` Pre-Launch Evaluation Criteria)
- Paddle sandbox checkout verified before production price IDs go live
- Inngest concurrency limits set per-user to prevent fan-out overload
- page_locks and topic_ledger prevent agent collision on shared content targets
- Daily cap enforcement tested before launch — prevents runaway cost from power users
- Off-site verification loop is async and non-blocking — URL probe failure doesn't break Archive
- Upgrade flow for existing subscribers tested with real Paddle sandbox plan change
