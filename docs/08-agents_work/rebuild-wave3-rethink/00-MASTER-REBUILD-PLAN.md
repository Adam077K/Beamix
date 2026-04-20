# Wave 3 — Master Rebuild Plan
*CEO synthesis · 2026-04-20 · Produced by a 7-lead board (research, design, product, build, business, growth) + 5 worker agents*

---

## TL;DR (read this first)

**What Adam actually gets from this doc:** an approved-if-signed blueprint to rebuild every product page to Linear/Vercel/Notion density with real Supabase data and consequence-framed copy — replacing the current "AI slop, half-blank, meaningless copy" state.

**The one-sentence diagnosis:** every one of the 7 protected pages in `apps/web` is **100% mock data**. Zero Supabase queries execute on any dashboard page. That is why the product feels fake — it literally is.

**The plan:** merge the 6 Wave 2 branches (already built, not on main) → apply one foundation migration → fire 11 tightly-scoped workers (W0–W10) in 5 sequential batches → end Wave 3 with every page wired to real data, densified to 8+ data points above fold, and copy rewritten to delta/consequence framing.

**Effort:** 1 migration + 11 worker briefs. Each worker ≤35 turns / ≤5 files. Parallelism within batches maximizes speed. Estimated 2-3 real-time hours of agent work if batches fire cleanly.

**Bar:** Linear issue detail + Ramp transactions + Attio contact record + Notion page + Vercel dashboard. 4-6 KPI cards + 2-3 charts above fold on every dashboard page. Delta/consequence copy on every label.

---

## What Adam must approve before W0 fires

### 🔒 Hard blockers (cannot start without these)

1. **Merge Wave 2 to main** in this order: `rebuild-wave2-backend` → `rebuild-home-v2` → `rebuild-inbox-workspace-v2` → `rebuild-competitors-v2` → `rebuild-scans-v2` → `rebuild-automation-v2`. Expect ONE manual merge conflict in `lib/types/shared.ts` (inbox-workspace + automation both touched it — take the union).
2. **Apply Wave 2 migration** manually via Supabase SQL Editor: `apps/web/supabase/migrations/20260419_01_rebuild_wave2_rpcs.sql`. MCP is read-only; only you can run it.
3. **Set `INTERNAL_REVALIDATE_SECRET`** env var in Vercel (prod + preview). 32-char random string.
4. **Verify `ANTHROPIC_API_KEY`** already in Vercel env.
5. **Approve Wave 3 foundation migration** when W0 writes it (creates `suggestions`, `automation_schedules`, `competitors`, `automation_settings`, `content_versions`, `citation_sources` tables). Another manual Supabase SQL Editor apply.

### 🧭 PRD gap decisions (can be answered in one message)

| Gap | Question | Recommended default | Status if you don't decide |
|---|---|---|---|
| **G1** | Is `suggestions` a separate table or a derived view? | **Option A — separate table** | W0 ships Option A. Changeable later. |
| **G3** | Is `competitors` a standalone table or inline strings? | **Option A — standalone table** | W0 ships Option A. RPC already returns names from scan data. |
| **G8** | How is "preview account" state stored? | **Option C — absence of `subscriptions` row = preview** | W10 ships Option C. No new column. |
| G2, G4, G5, G6, G7, G9, G10 | — | All `[SHIP_ITERATE]` — plan has safe defaults | proceed with defaults |

**If you reply "go with defaults"** I'll dispatch W0 the moment prerequisites 1-4 are confirmed.

---

## The 6 deliverables behind this plan

| # | File | Author | Pages | What's in it |
|---|------|--------|-------|--------------|
| 01 | [RESEARCH-SYNTHESIS.md](01-RESEARCH-SYNTHESIS.md) | research-lead | 263 | Deep teardown of Notion / Vercel / Ahrefs Brand Radar + Profound. Beamix insight: competitors only monitor; Beamix's Workspace is category-unique. |
| 02 | [VISUAL-DIRECTION.md](02-VISUAL-DIRECTION.md) | design-lead | 360 | Grid math table per page, token diff (card-radius 20→12, p-6→p-4, gap-8→gap-5, max-w-4xl→1200px), 8 page blueprints, 10 missing patterns, 10 anti-patterns with file+line. |
| 03 | [PAGE-INVENTORY.md](03-PAGE-INVENTORY.md) | product-lead | 444 | Every route, JTBD, data contract, tier visibility, RICE-scored cut/merge/replace, 10 PRD gaps. Flags "100% mock data" bombshell. |
| 04 | [REBUILD-PLAN.md](04-REBUILD-PLAN.md) | build-lead | 581 | Wave 2 branch disposition, 11-worker schedule (W0–W10), per-worker briefs with exact file scopes, merge order, risk register, PRD gap resolutions. |
| 05 | [METRICS-BY-PAGE.md](05-METRICS-BY-PAGE.md) | business-lead | 432 | Per-tier north stars, KPI strip per page, upgrade hook placement map, ROI math per tier, 5 metric anti-patterns to kill. |
| 06 | [COPY-SYSTEM.md](06-COPY-SYSTEM.md) | growth-lead | 654 | Voice rules, 40+ label library EN+HE, 16 empty states, error/loading/CTA/tier-lock copy. **All strings [HYPOTHESIS]** pending USER-INSIGHTS interviews. |

Total: **2,734 lines of synthesized direction.** Every Wave 3 worker reads the sections relevant to their scope.

---

## The 11 workers (W0–W10)

Each worker is capped at ≤35 tool uses / ≤5 files to dodge the worker-death pattern observed in Wave 2. Each worker works in an isolated git worktree on branch `feat/wave3-[scope]`.

| Batch | Worker | Type | Scope | Branch |
|-------|--------|------|-------|--------|
| **0** | W0 | database-engineer | Foundation migration (6 new tables + RLS) | `feat/wave3-db-foundation` |
| **1** (parallel) | W1 | frontend-developer | Token patch + StickyKpiStrip component + container fixes | `feat/wave3-token-grid-patch` |
| | W2 | frontend-developer | Consequence copy replacement + keyboard shortcut strip | `feat/wave3-consequence-copy` |
| **2** (parallel) | W3 | backend-developer | Home page Supabase wiring (real score, sparkline, suggestions) | `feat/wave3-home-db-wiring` |
| | W4 | backend-developer | Scans list + new `/scans/[scanId]` route + server data | `feat/wave3-scans-db-wiring` |
| **3** (parallel) | W5 | frontend-developer | Inbox 3-pane + "Open in Workspace →" wire | `feat/wave3-inbox-workspace-wire` |
| | W6 | frontend-developer | EngineBreakdownTable + QueryByQueryTable + SentimentHistogram | `feat/wave3-scan-drilldown-components` |
| | W7 | backend-developer | Competitors RPC wiring + SoV trend tooltips | `feat/wave3-competitors-db-wire` |
| **4** (parallel) | W8 | backend-developer | Automation schedules + credit bar + kill switch | `feat/wave3-automation-db-wire` |
| | W9 | backend-developer | Archive wiring + Settings tabs (Profile/Business/Billing/Notifs) | `feat/wave3-archive-settings-db-wire` |
| **5** (final) | W10 | frontend-developer | `/onboarding` route + middleware redirect + layout banner | `feat/wave3-onboarding-route` |

**Gates between batches:** `pnpm typecheck` must return 0 errors before next batch fires. Adam approves each batch's PRs before the next fires (or turns on autopilot merge).

---

## Top 5 highest-RICE changes (synthesized from product + growth + business)

| # | Change | RICE | Where |
|---|--------|------|-------|
| 1 | **Consequence copy across 7 pages** ("Good" → "3 competitors rank above you") | 360 | W2 (all pages) |
| 2 | **Merge Workspace + wire "Open in Workspace" button** | 204 | Wave 2 merge + W5 |
| 3 | **Wire `/home` to real Supabase data** (kill 100% mock) | 180 | W3 |
| 4 | **Ship `/onboarding` route** (missing entirely → Day-1 dead dashboard) | 180 | W10 |
| 5 | **Wire public `/scan` to real Inngest** (kill 4s fake timer) | 160 | [Wave 4 — not in this plan] |

---

## 3 upgrade hooks (from business-lead)

| ID | Trigger moment | Location | Tier |
|----|---------------|----------|------|
| **H1** | Home GEO score drops (negative delta) | `StickyKpiStrip` conditional slot | Discover → Build |
| **A1** | Automation credits hit 80% mid-month | `CreditBudgetBar` upgrade banner | Build → Scale |
| **S1** | Ghost cards for locked engines (Claude/AI Overviews/Grok) | `EngineResultCard` on Scan drilldown | Discover → Build |

These are surgical — not banner spam. They fire when a real limit is encountered.

---

## Top 8 risks

| R | Risk | Mitigation |
|---|------|------------|
| R1 | Worker dies at 25-35 turns | ≤35 turn budget, ≤5 files each, incremental commits, CEO commits stragglers |
| R2 | Foundation migration not applied → Batch 2 fires on missing tables | Hard gate — CEO verifies `20260420_wave3_foundation.sql` applied before dispatching W3/W4 |
| R3 | `shared.ts` conflict on Wave 2 merge | Manual resolve — take union of both type additions |
| R4 | `ANTHROPIC_API_KEY` missing → Workspace edit 503s silently | Verify env BEFORE Batch 3; W5 does not change the API |
| R5 | Supabase RLS gaps on new tables | W0 acceptance check validates RLS enabled on all 6 new tables |
| R6 | `suggestions` table empty on first render | W3 has try/catch fallback → "No suggestions yet — your first scan generates them" empty state |
| R7 | Onboarding infinite redirect loop | Known bug from 2026-03-02. W10 reuses UPSERT pattern from `signup_trigger.sql` + explicit acceptance check |
| R8 | `[HYPOTHESIS]` copy ships unvalidated | **Highest-leverage week-1 action:** 5 Israeli SMB discovery interviews. USER-INSIGHTS.md still empty. Every headline+CTA is guesswork until then. |

---

## The copy bar (what changes on every page)

| Before | After |
|--------|-------|
| "Good" (score tier label) | "Score 71 — 3 competitors rank above you on Perplexity" |
| "Nothing waiting for review" | "No drafts yet — accept a suggestion to queue your first agent" |
| "No scans yet" | "Run your first scan to see how AI engines describe your business" |
| "Paused" / "Active" | "Off — not running" / "Running" |
| "Credits: 28/90" | "28/90 AI Runs used (31%) — resets May 1" |
| "Mentioned" / "Not mentioned" | "Cited — appears in response" / "Not found — [engine] didn't mention you" |
| "Loading..." | Skeleton components + specific verbs ("Scanning ChatGPT...") |

---

## Execution — what happens when you approve

### Option A — "Go with defaults" (fastest path)

You say: *go with defaults*. I:
1. Wait for you to merge Wave 2 + apply migration + set env vars (manual).
2. Dispatch W0. You approve the foundation migration SQL it produces.
3. You apply the foundation migration manually.
4. I dispatch Batch 1 (W1 + W2 parallel). Review + merge.
5. Dispatch Batch 2. Review + merge.
6. Dispatch Batch 3. Review + merge.
7. Dispatch Batch 4. Review + merge.
8. Dispatch Batch 5. Review + merge.
9. Final typecheck + build verify. Wave 3 complete.

Each batch: I review worker returns, commit stragglers if they die, spawn qa-lead before merge, hand you the PR link. No code touches `main` without your merge.

### Option B — "Answer PRD gaps first, then go"

You answer G1/G3/G8 with your preferences. I adjust W0 DDL. Then path A.

### Option C — "Preview Wave 2 branches first"

I give you 6 Vercel preview URLs (one per Wave 2 branch). You smoke-test. You tell me what feels wrong. I adjust Wave 3 worker briefs before dispatching W0.

**My recommendation: Option A.** The Wave A-B board agreed on defaults. Wave 2 work is solid per the session audits. Ship it.

---

## What's explicitly NOT in this plan

- **Public `/scan` page rebuild** (marketing-adjacent, still uses mock timer — Wave 4)
- **Paddle billing integration polish** (billing tab shows real plan name in W9, but checkout flow not touched)
- **URL probe Inngest function** (48h verification check for Archive — Wave 4, G7 deferred)
- **Magic link / Social OAuth / MFA** (4 auth proposals open from Wave 2 — separate decision)
- **Framer marketing site** (separate project, not this repo)

Each is explicitly deferred with reasoning — not forgotten.

---

## Bottom line for Adam

The product is a blueprint with no plumbing. Wave 3 adds the plumbing — every page queries real Supabase data, every label carries weight, every viewport shows 8+ data points. Agents are lined up. Migrations are drafted. Branches are in the queue.

**Your two decisions:**
1. "Go with defaults" OR "Answer G1/G3/G8 first"
2. "Proceed to merge Wave 2" OR "Smoke-test previews first"

Everything else I can run autonomously with status reports per batch.

---

*Cross-index:*
- `.claude/memory/sessions/2026-04-20-ceo-wave3-rethink.md` — session log (pending)
- `docs/08-agents_work/HANDOFF-WAVE2-REBUILD-CONTINUE.md` — prior state
- `docs/08-agents_work/REFERENCES-REBUILD-WAVE2.md` — 342-line reference doc (basis for 01-RESEARCH-SYNTHESIS)
