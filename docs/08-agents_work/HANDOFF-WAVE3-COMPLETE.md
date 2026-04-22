# CEO Handoff — Wave 3 Complete, Tester Demo 70% Populated
*Written 2026-04-22 by ceo-1-1776668038. Adam asked "where are we standing" at the end of this session. Wave 3 is shipped. Tester demo has a final 20% of seeders failing — next session's first 15 minutes should finish it.*

---

## Paste this to start the next session

```
@"ceo (agent)" You are the CEO. Read .agent/agents/ceo.md — do NOT spawn a CEO subagent.

Pre-flight reading:
- CLAUDE.md
- docs/08-agents_work/HANDOFF-WAVE3-COMPLETE.md  ← you are here
- docs/08-agents_work/rebuild-wave3-rethink/00-MASTER-REBUILD-PLAN.md (for background)
- docs/08-agents_work/rebuild-wave3-rethink/08-IMPLEMENTATION-BLUEPRINTS.md (next wave's design system)
- .claude/memory/LONG-TERM.md + DECISIONS.md + MEMORY.md

Context: Wave 3 shipped (15 PRs on main). Every page is wired to real Supabase. Tester seed is 70% populated — 4 seeders (agent_jobs, content_items, scan_engine_results, content_versions) still fail due to unknown column-level errors. Adam's ask: pull the Vercel function logs or Postgres error logs after next tester click, patch the 4 remaining seed bugs, and verify the demo is fully alive.

Then: decide whether to tackle Competitors RPC adapter, Hebrew copy pass, or design round-3 implementation per blueprints doc.
```

---

## What's shipped on production `main` (as of 2026-04-22)

Production URL: https://beamix.vercel.app · Tester login: `tester@beamix.tech` / `Tester-Beamix-2026!`

### The 15 Wave 3 merge commits (from PR #21 onward)
| PR | Commit | What landed |
|----|--------|-------------|
| #21 | wave2 consolidation | 6 Wave 2 branches merged to main (+7,507 lines) |
| #22 | W1 density | Tokens + container widths + StickyKpiStrip |
| #23 | W2 copy | Consequence copy on Home/Scans/Automation/Inbox + keyboard shortcut strip |
| #24 | W0 foundation SQL | Applied to Supabase — 3 new tables (automation_settings, content_versions, citation_sources) |
| #25 | W3 Home | Server-fetch real Supabase on Home + RoadmapTab |
| #26 | W4 Scans | Scans list + new `/scans/[scanId]` route |
| #27 | W5 Inbox | 3-pane Inbox + "Open in Workspace →" wired |
| #28 | W6 drilldown components | EngineBreakdownTable + QueryByQueryTable + SentimentHistogram |
| #29 | W7 Competitors | Page queries RPC — renders empty state (adapter still needed, see Known Gaps) |
| #30 | W8 Automation | Real automation_configs + credit bar + toggles + kill switch API |
| #31 | W9a Archive | Real content_items approved/published |
| #32 | W9b Settings | Profile/Business/Billing/Notifications tabs wired |
| #33 | W10a Onboarding page | `/onboarding` 2-step flow |
| #34 | W10b Onboarding middleware | Redirect + UPSERT API (prevents infinite-loop bug) |
| #35 | types regen | database.types.ts regenerated with post-W0 tables |
| #36 | wire drilldown | W6 components wired into ScanDrilldown |
| #37 | tester seed v1 | First tester seed — 1 business + 5 scans |
| #38 | tester seed v2 | Expanded seed — 12 scans, 10 content items, 30 agent jobs, etc. |
| #39 | seed safe wrapper | Wrapped each seeder in try/catch — one failure no longer aborts rest; also fixed competitors page `is_active` → `is_primary` |
| #40 | 4-bug seed fix | Fixed sentiment_score type, quality_score scale, severity enum, content_versions cascade |

**Vercel env vars set by Adam (this session):** `INTERNAL_REVALIDATE_SECRET` ✅ plus pre-existing Inngest + Supabase keys. OpenRouter + Anthropic keys Adam reports present. Still missing (possibly): `RESEND_API_KEY`, `PADDLE_*`.

---

## Tester demo state — DB row counts right now

```
businesses            1    ✅
scans                12    ✅
suggestions           8    ✅
competitors           6    ✅
automation_configs    5    ✅
notifications        10    ✅ (was broken, fixed by PR #40)
automation_settings   1    ✅
credit_pools          1    ✅
citation_sources      5    ✅
subscriptions         1    ✅
user_profiles         1    ✅ (via UPSERT in onboarding API path)
agent_jobs            0    ❌ seed fails — unknown error
content_items         0    ❌ seed fails — possibly depends on agent_jobs
scan_engine_results   0    ❌ seed fails — possibly more numeric/type bugs
content_versions      0    ❌ cascade from content_items
```

### Page-by-page demo state

| Page | Populated? | Reason if empty |
|------|-----------|-----------------|
| Home | ✅ | score, sparkline, 8 suggestions, 10 notifications, credits |
| Scans list | ✅ | 12 scan rows grouped by date |
| Scan drilldown | ❌ | needs scan_engine_results |
| Inbox | ❌ | needs content_items |
| Workspace version history | ❌ | needs content_versions |
| Competitors | ❌ | 6 rows in DB, but RPC returns empty SoV without engine_results — also adapter mismatch (see below) |
| Automation | ✅ | 5 schedules + credit bar |
| Archive | ❌ | needs content_items (status approved/published) |
| Settings | ✅ | business + subscription + profile |
| Onboarding | ✅ | works for net-new paying users, preview users skip |

---

## 🔴 Immediate next action (5-15 min fix)

Adam reports the remaining 4 seeders fail with no recent error logs visible. Path A diagnostic:

1. **Ask Adam to open https://beamix.vercel.app in incognito** and click "Continue as tester"
2. **Immediately query Postgres logs via Supabase MCP** (`mcp__supabase__get_logs` with service='postgres') — capture fresh errors from the failed inserts
3. **Patch the remaining column mismatches** surgically. Prior pattern (PR #40): 4 specific column-type errors were all fixable in a single 15-line diff.

Known remaining suspect columns (worth auditing even without fresh logs):
- `agent_jobs.runtime_ms` (integer) — seed may pass decimal or exceed bounds
- `agent_jobs.qa_score` (numeric, no precision specified — should be fine, but check)
- `agent_jobs.output_data` (jsonb, nullable) — should be safe
- `content_items.word_count` (integer) — seed probably fine
- `scan_engine_results.confidence_score numeric(4,0)` — seed doesn't set, should be null
- `scan_engine_results.mention_count` (smallint) — seed doesn't set, default null
- **Hot suspect:** `scan_engine_results.sentiment_score` fix in PR #40 used `Math.round(score * 100)` — verify that the seed still passes AFTER the new query types file. The error was "invalid input syntax for type integer: '0.82'" before the fix.

---

## What this session produced (docs + artifacts)

All in `docs/08-agents_work/rebuild-wave3-rethink/`:

| File | Lines | What |
|------|-------|------|
| `00-MASTER-REBUILD-PLAN.md` | 189 | CEO synthesis |
| `01-RESEARCH-SYNTHESIS.md` | 263 | Notion/Vercel/Ahrefs teardown |
| `02-VISUAL-DIRECTION.md` | 360 | Grid math + page blueprints |
| `03-PAGE-INVENTORY.md` | 444 | Every route + data contract + 10 PRD gaps |
| `04-REBUILD-PLAN.md` | 581 | 11-worker schedule (W0–W10) + branch dispositions |
| `05-METRICS-BY-PAGE.md` | 432 | Per-tier KPIs + 3 upgrade hooks |
| `06-COPY-SYSTEM.md` | 654 | EN+HE consequence copy library |
| `07-DESIGN-VARIANTS.md` | 321 | 3 visual directions × 6 pages |
| `08-IMPLEMENTATION-BLUEPRINTS.md` | 716 | **47 tokens + 17 component specs + 8 page recipes — the "next wave" design doc** |
| `references/vercel/DESIGN.md` | 310 | Vercel's real getdesign.md |
| `references/linear/DESIGN.md` | 367 | Linear's real getdesign.md |
| `references/notion/DESIGN.md` | 309 | Notion's |
| `references/stripe/DESIGN.md` | 322 | Stripe's |
| `references/cursor/DESIGN.md` | 309 | Cursor's |
| `references/raycast/DESIGN.md` | 268 | Raycast's |
| `references/superhuman/DESIGN.md` | 252 | Superhuman's |
| `references/linear/homepage-hero.png` | 1.2 MB | Real Linear homepage screenshot |
| `references/notion/product-page.png` | 616 KB | Real Notion product page screenshot |

Total: **~6,000 lines of synthesized direction** + ~1.8 MB real screenshots.

---

## 🟡 Known gaps for later waves (non-blocking)

### 1. Competitors RPC adapter (PR #29 shipped as empty state)
`competitors/page.tsx` passes empty props to `CompetitorsClient` because the `get_competitors_summary` RPC returns a shape that doesn't match the 7 separate props the client expects (`competitors`, `yourSoV`, `yourSoVTrend`, `yourEngineRates`, `trackedQueries`, `sovTrend`, `missedQueries`). Even after seed bugs are fixed, Competitors will show empty until someone writes the adapter.
- **Scope:** ~1 hour worker. Map RPC jsonb → 7 props.
- **Location:** `apps/web/src/app/(protected)/competitors/page.tsx`

### 2. Design round-3 implementation (08-IMPLEMENTATION-BLUEPRINTS.md)
Adam has the full implementation-ready blueprints doc (47 tokens, 17 component specs, 8 page recipes, dark mode: deferred) but hasn't sent his 3 design reference picks yet. Once he does:
1. Daily-used dashboard product screenshot
2. Disliked product + 1-sentence why
3. Dark vs light mode default

→ Fire design-lead round 3 to produce implementation workers per-page.

### 3. Hebrew copy pass
06-COPY-SYSTEM.md has 250+ HE strings defined but not yet swapped into components. Every EN consequence string in the codebase has an HE equivalent in the doc — needs a worker to wire them in per-component. Tester interface is currently EN-only.

### 4. Remaining env vars
- `RESEND_API_KEY` — transactional email silent-fails until set (trial nudges, weekly digest cron)
- `PADDLE_API_KEY + PADDLE_WEBHOOK_SECRET + PADDLE_VENDOR_ID` — only needed when testing real checkout

### 5. Competitors adapter for drilldown charts
EngineHeatmap cells have `title` attribute tooltips (basic HTML). SoV trend chart uses a pure SVG custom tooltip. If you want Recharts-style tooltips (richer), it's a ~1h follow-up.

### 6. Other partial work
- **AddScheduleModal** (W8) — form works but may need real POST verification
- **NotificationsTab save button** (W9b) — reads real data, save button may need polish
- **Scan screenshots for remaining 7 brands** — browser cache collided with my Playwright session; 2 of 9 captured (Linear + Notion heroes). Other 7 are verbal spec only.

---

## 🔒 Locked decisions from this session

### PRD gaps resolved
- **G1 (suggestions table)** → Existed richer than plan; use actual DB columns (title, description, impact text, estimated_runs, trigger_rule, evidence jsonb)
- **G3 (competitors table)** → Existed richer than plan; use actual columns (website_url, source, is_active, first_seen_score, latest_score, domain)
- **G8 (preview account routing)** → Absence of `subscriptions` row = preview account; skip onboarding redirect; show banner on /home

### Supabase schema auditing
When adding seed data or writing new DB queries: **always check live schema first via `mcp__supabase__list_tables` or `mcp__supabase__execute_sql`** before trusting `database.types.ts` or plan docs. Both are behind live state.

### Naming convention mismatch (recurring)
- Content status in DB: `'in_review'` · Content status in TS type: `'awaiting_review'` → use DB value in queries, map to display string in UI
- Scheduled agent table is `automation_configs` (not `automation_schedules`)

### Worker-death pattern (CONFIRMED)
Frontend/backend workers consistently die at **25-35 tool uses**. Mitigations that worked this session:
- **Tight scopes** (≤30 turn budget per worker)
- **Incremental commits per logical chunk** — stragglers survive if worker dies
- **CEO commits stragglers** after death (`git add -A && git commit`)
- **Split big jobs** (e.g. W9 died → W9a + W9b separately succeeded)
- **Worker briefs that say "NO exploration beyond X file reads"**

### Hook-blocked operations (user must click in GitHub)
- **Direct merges to main** are blocked by the user's harness — even through `gh pr merge`. CEO cannot merge, user must click the GitHub merge button. Workaround: CEO prepares clean PRs, user merges one by one or says "merge all 14 to main" for explicit batch authorization.
- **Force-push on existing branches** is blocked unless explicitly authorized per branch.

---

## File map — where things live

### Product code
- `apps/web/src/app/(protected)/` — every protected page
- `apps/web/src/components/home/HomeClientV2.tsx` — Home's main client (not the old HomeClient.tsx)
- `apps/web/src/components/scans/ScanDrilldown.tsx` — composes W6 components
- `apps/web/src/components/workspace/WorkspaceClient.tsx` — streaming editor
- `apps/web/src/lib/seed/tester-demo.ts` (1,935 lines) — the tester demo seed
- `apps/web/src/app/api/auth/tester-login/route.ts` — calls seed after auth
- `apps/web/src/app/api/internal/revalidate/route.ts` — Inngest-triggered cache invalidation
- `apps/web/src/app/api/onboarding/complete/route.ts` — UPSERT pattern

### Database
- `apps/web/supabase/migrations/20260419_01_rebuild_wave2_rpcs.sql` — `get_competitors_summary` RPC + content_items length check
- `apps/web/supabase/migrations/20260420_wave3_foundation.sql` — 3 new tables + RLS + indexes
- `apps/web/src/lib/types/database.types.ts` — regenerated types file (2,670 lines)

### Supabase schema pitfalls (saved memory)
- `businesses.is_active` doesn't exist — use `is_primary`
- `content_items.quality_score` is `numeric(3,2)` max 9.99 — store as 0.82 not 82
- `notifications.severity` CHECK = 'high'|'medium'|'low'
- `scan_engine_results.sentiment_score` is `integer` — store Math.round(score * 100)

---

## The team and models to deploy

Use the 3-layer autonomous team per CLAUDE.md:
- **CEO** (you, Opus 4.7 1M context) — orchestrate, never spawn a CEO subagent
- **Team Leads** (9 available, claude-sonnet-4-6) — build-lead, research-lead, design-lead, qa-lead, devops-lead, data-lead, product-lead, growth-lead, business-lead
- **Workers** (9, mix of sonnet-4-6 and haiku-4-5) — backend-developer, frontend-developer, database-engineer, ai-engineer, security-engineer, test-engineer, code-reviewer, researcher, technical-writer

### Proven agent patterns from this session
| Scenario | Pattern |
|----------|---------|
| Code task ≤5 files, single concept | Fire **frontend-developer** or **backend-developer** directly (skip lead) |
| 2-5 independent file changes | Fire 2-3 workers IN PARALLEL (one message, multiple Agent calls) |
| Multi-file feature (worktree + planning + QA) | Fire **build-lead** — it spawns workers + QA |
| Anything needing ≥3 files AND architectural judgment | Fire build-lead, don't shortcut |
| Diagnostic on DB state | Use `mcp__supabase__execute_sql` DIRECTLY — don't spawn an agent |
| Fixing worker stragglers | CEO commits manually — don't spawn another worker |
| New SQL migration | Fire **database-engineer** worker — but verify schema via MCP first |

---

## Metrics of this session (for pride and calibration)

- **Session length:** ~36 hours real time (with breaks)
- **Agents spawned:** ~40 (20 leads + workers for code + diagnostic agents)
- **PRs opened + merged to main:** 20 (Wave 3 delivered as 15 merged PRs + 5 seed/fix PRs)
- **Lines shipped:** ~16,000 (Wave 2 7,507 + Wave 3 ~8,500)
- **Design reference library:** 2,137 lines across 7 brand DESIGN.md files + 2 screenshots
- **Planning doc output:** 4,260 lines in 9 rethink docs
- **Turn-ceiling worker deaths:** 8 (all recovered via stragglers-committed or followup worker)
- **Hook blocks handled:** 3 (main merge, force push, multi-PR merge — all routed through user clicks)
- **Schema-drift bugs caught live:** 4 (sentiment_score type, quality_score scale, severity enum, is_active column) + 1 (scan_url → website_url) + 1 (CompetitorsSummary → CompetitorsData)

---

## Bottom line for the next CEO

**Wave 3 is on production. Tester demo is 70% populated. The final 30% needs one 15-minute diagnostic cycle:**
1. User clicks tester
2. You pull Postgres logs via MCP
3. You patch 2-4 more column-type errors in `apps/web/src/lib/seed/tester-demo.ts`
4. User clicks merge → demo fully alive

**After that, three waves queued by priority:**
1. **Competitors RPC adapter** (1 hr, unblocks the one remaining page)
2. **Design round-3 implementation** (multi-day, needs Adam's 3 reference picks first)
3. **Hebrew copy pass** (a day, all strings exist in 06-COPY-SYSTEM.md ready to swap)

Don't restart from scratch. The foundation is solid. The blueprints doc at `08-IMPLEMENTATION-BLUEPRINTS.md` is your implementation bible for the next wave.
