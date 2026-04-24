# CEO Handoff — Credibility Pass Complete, Ready for Week 2
*Written 2026-04-24 by ceo-1-1776876326. The Beamix tester demo is fully alive on production AND the 10-board audit has been executed as a 17-fix credibility pass. Design critic score: 3.8/5 (up from 2.5 baseline). The next session has a clear improvement plan and decisions to make.*

---

## Paste this to start the next session

```
@"ceo (agent)" You are the CEO. Read .agent/agents/ceo.md — do NOT spawn a CEO subagent.

Pre-flight reading (in order, stop when you have enough):
- CLAUDE.md
- docs/08-agents_work/HANDOFF-WAVE5-READY.md  ← you are here
- docs/08-agents_work/audit-board-2026-04-24/IMPROVEMENT-PLAN.md  (Week 2 medium bets are your shortlist)
- docs/08-agents_work/audit-board-2026-04-24/BOARD-SYNTHESIS.md  (the 6 convergent board findings + contradictions)
- docs/08-agents_work/audit-board-2026-04-24/after/FINAL-VERIFICATION.md  (what's shipped + what's deferred)
- .claude/memory/LONG-TERM.md + DECISIONS.md + MEMORY.md

Context: Tester demo on https://beamix.vercel.app is fully alive. All 14 seed tables populate. Board of 10 personas audited the product 2026-04-24 and surfaced 6 convergent findings + unique catches. A Week 1 "Credibility Pass" shipped 17 fixes across PRs #45/#46/#47/#48. Design critic rated the surface 3.8/5 (up from 2.5) and called it CREDIBILITY_PASS_COMPLETE.

Before picking next wave, Adam must decide:
1. **ICP first bet** — SMB / B2B SaaS marketing lead / Agency (can't optimize for all three)
2. **Hebrew posture this sprint** — real he-IL (3 days) or remove toggle with "בקרוב" (1 hr)
3. **Preview-first commitment** — "nothing auto-edits live site in v1" (yes/no)
4. **IA simplification** — 7 tabs → 4 (kill /archive, /automation, move /competitors under /scans)

Then pick Week 2 focus. Recommended: preview-first agent execution + Billing tab wire-up + CSV exports + first-accept celebration. Full menu in IMPROVEMENT-PLAN.md sections "Medium bets" and "Large bets."
```

---

## What shipped on main this session

| PR | Commit | What |
|----|--------|------|
| #42 | 4dafaea | Seed bugs + Competitors adapter (derive from scan_engine_results) |
| #43 | c8d92ed | Engine CHECK + is_favorited NOT NULL fixes (unblocked tester demo) |
| **#45** | **48896af** | **Credibility Pass bundle — 13 audit fixes across 5 branches** |
| **#46** | **7c1a845** | **Polish: `/settings/billing` href → `?tab=billing`** |
| **#47** | **98921a2** | **Polish: apply `agentTypeLabel` on inbox/automation/archive** |
| **#48** | **29d8791** | **Docs: board audit + synthesis + plan + 60+ screenshots** |

Production is commit `29d8791` — live on https://beamix.vercel.app.

### Credibility Pass — 17 shipped fixes
**Fully verified on prod (design critic PASS):**
- Engine cards show real brand-coloured initials + varied mention rates (no `??`, no uniform 70%)
- Scan rows have varied timestamps (not all `14:01`)
- Mobile sidebar hamburger under 768px with overlay drawer + focus trap + Escape
- Tabular numerals globally (`td`, `th`, `.font-mono`, number inputs)
- `dir="auto"` default on Input + Textarea (Hebrew auto-RTL)
- `lib/dates.ts` `groupByRelativeDate()` utility — fixed duplicate "EARLIER THIS WEEK" headers on /scans
- Central `constants/agents.ts` label map applied everywhere (no `schema_generator` snake_case leaks)
- Outcome-first CTAs: "Run FAQ Builder" → "Draft FAQ schema" via `agentOutcomeCta(type)`
- Central `constants/engines.ts` engine metadata map
- `/automation` page title: "Auto-pilot" → "Schedules"
- `/settings?tab=billing` URL opens Billing tab (was Profile — tab state now URL-driven)
- KPI tooltips with plain-English definitions on 4 Home labels
- Seed `action_url` paths: `/dashboard/*` → `/*` (notification clicks no longer 404)
- Login: tester button visually primary (blue tint); caption rewritten "data may be wiped" → "no signup required"
- Global `TrialBanner` component (blue tint; amber ≤3 days; Preview-mode variant for users without subscription)
- Sidebar "Upgrade to Scale" link for Build tier
- Clean competitor URL rendering (no more `https://https://...`)

---

## What the 10-board audit said

Read `BOARD-SYNTHESIS.md` for full detail. Here's the hit-list the next session should reference.

**6 convergent findings (multiple voices):** ✅ all addressed in Week 1 credibility pass.

**Unique catches not yet addressed (big bets for Weeks 2-4):**
1. **Priya (P0)** — zero multi-business/agency layer. No workspace switcher, no white-label, no bulk actions, no team roles. Agency GMV is off the table.
2. **Daniel (P0)** — Hebrew toggle is a no-op. Real he-IL wiring required or remove the option.
3. **Marcus (big bet)** — without GSC/CMS connectors, Beamix is "a prettier Profound at 38% price." Integrations tab is ghost UX.
4. **Chris (big bet)** — no paywall in UI, no upgrade flow, no shareable artifacts (public scan page would be viral).
5. **Jordan/Marcus** — preview-first agent execution is the trust-earning moat vs Profound/Otterly.
6. **Sarah (big bet)** — Local Business mode (GBP, Maps, "near me") = 10× SMB TAM vs SaaS, ignored by competitors.
7. **Raj (IA)** — kill `/archive` + `/automation` routes; ship V1 with 4 tabs (Home/Inbox/Scans/Settings).
8. **Elena (model)** — rebuild around one noun: "Fix" with states (drafted/awaiting/live) + outcome.
9. **Nina (big bet)** — ship `@beamix/tokens` package + 12-component Storybook.

---

## What's deferred (known issues, non-blocking)

- **React #418 hydration errors** (~25 on /home, appear on all protected pages). Pre-existing; likely SSR/client date or count divergence. Needs debug-lead investigation. Does not break rendering but floods Sentry.
- **Favicon 404** — missing `app/favicon.ico` or `app/icon.png`. 30-second fix.
- **NotificationBell fetch error** — fires before user context is ready. "fetch error for user: undefined". Needs proper auth guard.
- **Engine sparkline + weeklyDelta = 0 on /home** — the engine_results query only pulls latest scan. Computed `mentionRate` (the main fix) works correctly per engine; sparkline/delta are cosmetic and need a wider query to cover last-8-scans.
- **Scan drilldown per-engine aggregation** — smoke test flagged the drilldown shows per-prompt rows at 100% instead of per-engine aggregated rates.

All small, well-scoped, would fit in a Week 2 bundled "bugfix pass" PR (~4 hours total).

---

## Week 2 priority stack (from IMPROVEMENT-PLAN.md)

Next session should pick ≤3 of these and ship as one integration PR. Each is a separate worker.

### A-tier (high leverage)
- **A1 — Preview-first agent execution** (3 days): every agent run opens a diff modal before anything happens. Trust moat.
- **A2 — Real Billing tab wire-up** (2 days): Paddle integration for plan/receipts/cancel. Ship with upgrade CTA + soft paywall at 70% quota.
- **A3 — CSV export** on /scans + /competitors + /inbox (2 days). CFO-grade evidence. Unblocks Marcus persona.
- **A4 — Kill `/archive` route** → fold as Inbox filter (1 day). Simplification.
- **A5 — First-accept celebration toast** (1 day). Activation moment — currently cold.

### B-tier (polish bets)
- **B1 — "Share your score" OG card generator** (2 days). Viral loop.
- **B2 — Empty-state-as-sales-pitch pass** (2 days). Turn silent billboards into conversion surfaces.
- **B3 — First-run 3-dot tour** (3 days). Activation clarity.
- **B4 — Help launcher + Cmd+K palette** (3 days). Stuck-user recovery.
- **B5 — Hebrew locale real wiring** (3 days) OR remove toggle (1 hr). Daniel's P0.

### Bugfix pass (should bundle, ~4 hours)
- Fix React #418 hydration on /home
- Add favicon
- Guard NotificationBell against null user
- Widen engine_results query for sparkline data
- Fix scan drilldown per-engine aggregation

---

## Decisions Adam still owes (blocking scoping)

1. **ICP priority:** SMB / B2B SaaS marketer / Agency. See IMPROVEMENT-PLAN.md Big Rock #5.
2. **Hebrew posture** (A1 or remove).
3. **Preview-first public commitment** (Jordan+Marcus's moat).
4. **IA simplification** (Raj's 4-tab proposal).
5. **Agency tier pricing** go/no-go on marketing-site waitlist.
6. **ILS pricing display** for `.il` visitors.
7. **Public scan URL moat** — commit to sharable pages as marketing surface?
8. **"Run" → "Draft" terminology** — we shipped in the outcome CTA but the word "Run" still appears elsewhere. Audit + commit to the rename language-wide?

---

## Patterns that worked this session (keep using)

### Worker-death salvage
Workers consistently die at 25-35 tool uses. Pattern:
1. Brief workers for **≤12 turns** per task ("Ultra-tight. ≤10 turns. ONE file fix.") — survival rate jumped from ~20% to ~75%.
2. Commit **incrementally per numbered sub-task** — when workers die, CEO can salvage uncommitted work via `git add + git commit`.
3. When a worker dies mid-task with useful uncommitted changes, CEO salvages (commits + finishes in the worker's worktree).
4. After 2-3 worker deaths on the same task, CEO does it directly with Opus reliability instead.

### Micro-workers over big workers
W4 (one worker, 3 fixes) died. W4a/W4b/W4c (three micro-workers, ≤12 turns each) all finished clean. Split big scopes into ≤2-task bundles.

### Shared Playwright contention
When dispatching 5+ agents all using Playwright MCP, the browser session is shared. Agents hijack each other's navigation. Mitigation:
- Brief agents: "re-navigate before each observation"
- Use `mcp__playwright__browser_snapshot` (accessibility tree) which renders reliably even during concurrent state
- Don't rely on screenshots for between-turn state continuity

### Direct-merge authorization
Adam authorized `gh pr merge --admin` for this session. CEO can merge PRs without Adam clicking. Check memory (`LONG-TERM.md`) at session start to see if this authorization carries over.

### Production DB changes still need explicit OK
`mcp__supabase__apply_migration` is harness-blocked for DROP CONSTRAINT etc. Workaround: commit migration file, provide SQL snippet, ask Adam to paste in Supabase SQL Editor.

---

## Team composition patterns (what to dispatch for each task type)

| Task type | Agent | Budget | Example |
|-----------|-------|--------|---------|
| One-file TS/React change | `frontend-developer` | 8-12 turns | Settings deep-link, KPI tooltip, copy rename |
| One-file seed/adapter | `backend-developer` | 10-15 turns | Double-https fix, seed jitter |
| Multi-file feature | `build-lead` (orchestrates) | 30+ turns | Preview-first agent modal, TrialBanner |
| Design review | `design-critic` | 20 turns | Screenshot + critique loop |
| Code review | `code-reviewer` | 15 turns | Pre-merge diff review |
| Playwright smoke | `general-purpose` | 15 turns | Post-deploy functional verification |
| Parallel research | `research-lead` | (unchanged from prior waves) | Research before major pivots |

**Don't use:** `design-lead` without an explicit Playwright/Pencil MCP need; `research-lead` for small single-question research.

---

## File map — where things live

### New in this session
- `apps/web/src/constants/agents.ts` — central agent label map (`agentTypeLabel`, `agentOutcomeCta`)
- `apps/web/src/constants/engines.ts` — engine metadata (`ENGINE_CONFIG`, `getEngineLabel`)
- `apps/web/src/lib/dates.ts` — `groupByRelativeDate()` bucket utility
- `apps/web/src/components/layout/TrialBanner.tsx` — global trial strip
- `docs/08-agents_work/audit-2026-04-24/` — CEO audit + 9 screenshots
- `docs/08-agents_work/audit-board-2026-04-24/` — 10 board reports + synthesis + plan + 60 screenshots + after/ verification
- `docs/08-agents_work/HANDOFF-WAVE5-READY.md` — this file

### Key existing files
- `apps/web/src/lib/seed/tester-demo.ts` — tester seed (1,950 lines)
- `apps/web/src/app/(protected)/home/page.tsx` — server-side home data aggregation
- `apps/web/src/components/home/HomeClientV2.tsx` — home main client
- `apps/web/src/app/(protected)/competitors/page.tsx` + `derive.ts` — Competitors derived from scan_engine_results
- `apps/web/src/components/shell/Sidebar.tsx` — sidebar with mobile drawer + upgrade link
- `apps/web/src/app/(auth)/login/page.tsx` — login page

---

## Bottom line for the next CEO

**The product finally looks like a product and not an AI-slop prototype.** Design critic went from 2.5/5 to 3.8/5. All 6 convergent board findings are fixed. The tester demo renders real data across every page.

The next wave is about **earning the next 10 points of trust**:
- Preview-first agent execution (Jordan+Marcus's moat)
- Billing tab + upgrade path (Chris's "no conversion = no revenue")
- Exports (Marcus's CFO story)
- Activation celebration (Chris's activation event)

Before spending any of that, get Adam to commit to an ICP. The product today tries to serve SMB + B2B SaaS + Agency. Pick one or the Week 2 work scatters.

**Don't restart. Don't re-audit. Build on the foundation.**
