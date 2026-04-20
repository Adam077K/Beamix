# CEO Handoff — Wave 2 Rebuild "Density + Workspace"
*Written 2026-04-20 by ceo-1-1776605920. Previous session hit Adam's "AI slop / half-blank / meaningless copy" critique and ran a 7-lead board + deployed 6 rebuild agents. This doc is the baton.*

---

## Paste this to start the next session

```
@"ceo (agent)" You are the CEO. Read .agent/agents/ceo.md — do NOT spawn a CEO subagent.

Pre-flight reading:
- CLAUDE.md
- docs/08-agents_work/HANDOFF-WAVE2-REBUILD-CONTINUE.md  ← you are here
- docs/08-agents_work/REFERENCES-REBUILD-WAVE2.md  (342-line SaaS reference doc)
- docs/08-agents_work/sessions/2026-04-19-*.md  (prior session files)
- .claude/memory/LONG-TERM.md + DECISIONS.md

Context: Adam's last feedback was the product still felt "AI slop, half-blank, meaningless copy" after Wave 1 polish. Ran a 7-lead board meeting — all memos captured in session files. Deployed 6 rebuild branches in Wave 2 ("v2"). This session: merge + verify + finish the gaps.
```

---

## User feedback that drove Wave 2 (VERBATIM)

- "Looks like AI slop, not a professional product"
- "Too little going on the screen"
- "The strings don't mean anything" — copy is placeholder
- "Most pages are half blank"
- "We have the Workspace where we get all the agent work and can do things to it — remember?"

**The bar:** Linear / Stripe / Ramp / Attio / Vercel density. 4-6 KPI cards + 2-3 charts above the fold on every dashboard page. Consequence-framed copy ("Customers find you — but 3 competitors rank above you"), not generic labels ("Good").

---

## What's DEPLOYED on production right now

URL: https://beamix.vercel.app · Tester login: `tester@beamix.tech` / `Tester-Beamix-2026!`

`main` branch includes (merged in the prior session):
- Wave 0 + 1 + 2 Batch 1 + Batch 2 (original)
- Auth rebuild (login/signup/forgot-password — professional quality, 4 feature proposals open: magic link, social OAuth, MFA, remember-device)
- Tester-login button (Supabase admin bootstraps user on first click)
- 4 original rebuild branches: home-archive-port, rebuild-scans-archive, rebuild-inbox, rebuild-config-surface
- Hebrew + RTL + next-intl + Heebo

**NOT yet on main (all pushed to origin, Vercel has preview deploys per branch):**
| Branch | Commits | Status |
|---|---|---|
| `feat/rebuild-home-v2` | 6 | KPI strip, engine breakdown, activity feed, consequence copy, ProgressRing, Roadmap tab |
| `feat/rebuild-inbox-workspace-v2` | 3 | FilterRail copy, `/workspace/[jobId]` route + components, streaming edit API |
| `feat/rebuild-scans-v2` | 2 | Dense rows, ScanDrilldown interim |
| `feat/rebuild-competitors-v2` | 2 | ShareOfVoice, EngineHeatmap, Win/Loss, SoV trend, Strategy aside — all wired into page |
| `feat/rebuild-automation-v2` | 2 | Projection card, denser rules, AddScheduleModal + TS fix for GEO roster names |
| `feat/rebuild-wave2-backend` | 5 | `get_competitors_summary` RPC, `content_items` length check, `/api/internal/revalidate`, Inngest callback, Next 16 `revalidateTag` typecheck fix |

---

## Pre-merge must-dos (BLOCKERS)

1. **Apply the Supabase migration manually via Supabase SQL Editor:**
   `apps/web/supabase/migrations/20260419_01_rebuild_wave2_rpcs.sql`
   Contains: `get_competitors_summary` RPC + `content_items.user_edited_content` 100k CHECK constraint.
   Competitors page will render with fallback mock data without it but will NOT ship real data until applied. MCP is read-only — Adam must run this manually.

2. **Set `INTERNAL_REVALIDATE_SECRET`** env var in Vercel production + preview environments. Generate a random 32-char string. Without it, the `/api/internal/revalidate` endpoint rejects all calls. Inngest agent-pipeline POSTs to it after content_items creation.

3. **Verify `ANTHROPIC_API_KEY`** in Vercel env — the Workspace streaming edit endpoint at `/api/inbox/[itemId]/edit` needs it. Route gracefully 503s without it, so non-critical, but Workspace editing won't work until set.

4. **`USER-INSIGHTS.md` is still empty** — all copy across Wave 2 is hypothesis-based. Growth Lead flagged this as the single highest-leverage week-1 action. Run 5 Israeli SMB discovery interviews before finalizing copy. Every headline + CTA + error state is built on hypothesis until then.

---

## Suggested merge order (when you're ready)

Merge in this order to minimize conflict risk:

```bash
git checkout main
git merge --no-ff feat/rebuild-wave2-backend         # infrastructure first
git merge --no-ff feat/rebuild-home-v2
git merge --no-ff feat/rebuild-inbox-workspace-v2
git merge --no-ff feat/rebuild-scans-v2
git merge --no-ff feat/rebuild-competitors-v2
git merge --no-ff feat/rebuild-automation-v2
pnpm -F @beamix/web typecheck  # expect 0 errors on each step
pnpm -F @beamix/web build      # expect compiles on each step
git push origin main
```

Home v2 touches `HomeClient.tsx` which Inbox+Workspace also references. Expect small conflicts in shared shell files — resolve keeping Home v2's changes and re-integrating Workspace links afterward.

---

## Gaps in Wave 2 (unfinished — next session can fire workers for these)

### Home
- Roadmap tab lives on page but is currently **mock data only** — no real query against `suggestions` + `content_items` status. Wire `get_home_summary` extension or a new RPC that returns the Completed/In Progress/Up Next arrays.
- KPI strip's "Citations Earned This Month" + "Est. Monthly AI Impressions Added" are mocked — real query needs `citation_sources` + query-volume estimates.

### Inbox + Workspace
- Workspace route + streaming edit API shipped but **NOT yet wired into Inbox's "Open in Workspace →" button**. Inbox PreviewPane still shows the old pane, not a link to /workspace/[jobId].
- `inbox_item_edits` append-only audit table insert isn't happening server-side after stream completes — add that in `/api/inbox/[itemId]/edit/route.ts`.
- Keyboard shortcut modal (?) not verified working; j/k/e/x/r/a navigation exists from Wave 2 Batch 1 but may have regressed.

### Scans
- Per-scan drilldown at `/scans/[scanId]` has interim rebuild but missing: EngineBreakdownTable, QueryByQueryTable, SentimentHistogram (worker died before creating those components).
- PDF export button placeholder `/api/scans/[scanId]/pdf` not created — returns 404 currently.

### Competitors
- All 6 components wired into page. Will render fallback mock until `get_competitors_summary` RPC is applied.
- SovTrendChart + EngineHeatmap cells currently pure-SVG — works but no hover tooltips.

### Automation
- AddScheduleModal POST to `/api/automation/schedules` is wired but route may not support all fields. Verify route accepts `{agent_type, trigger, frequency}` body.
- Run-history sparklines per row are static mock — real data needs `agent_jobs` query by agent_type.

### Backend
- `revalidateTag` wired on suggestion dismiss + Inngest callback, but NOT on: suggestion accept, agent completion in-place, content approval in inbox. Add those next session.

---

## Board memo TL;DRs (all 7 memos captured in session files dated 2026-04-19)

**Product Lead** — 5 RICE items: (1) progress counter RICE 600, (2) per-engine breakdown RICE 360, (3) competitor score delta RICE 272, (4) Workspace/Roadmap RICE 113, (5) PDF scan report RICE 102. Workspace = sequential project arc: Completed / In Progress / Up Next / Future. 15 copy replacements specified.

**Design Lead** — "Container max-w-[1100px] + grid-cols-[1fr_320px] main+aside. p-4 cards not p-6. Section gap-4 not gap-8. 8+ data points per viewport target. The Workspace IS the Inbox detail pane, done properly." 3 reference screens: Linear issue detail, Ramp transactions, Attio contact record.

**Research Lead** — Industry bar is 4-6 KPI cards + 2-3 charts above fold (Stripe, Ramp, PostHog, Profound, Otterly, Ahrefs Brand Radar). 84% abandon on blank first-session states. Inbox-only is a dead-end archetype — Superhuman Auto Drafts + Cursor inline diffs + ChatGPT Canvas are the models.

**Growth Lead** — "Good" → "Customers find you — but 3 competitors rank above you." Activity feed makes dashboard feel alive. Delta-framed copy on every row. Contextual upgrade prompts at friction moments, not banners. **USER-INSIGHTS.md still empty — biggest copy blocker.**

**Business Lead** — 5 ROI KPIs: Citation Wins, Est. Reach Gained, Content→Citation Pipeline, Competitor Gaps Closed, Time Saved. Competitors page spec: head-to-head engine table + per-query win/loss grid + 12-wk SoV + strategy delta. Workspace tier-gated Build+Scale for retention.

**Data Lead** — "The schema is rich (33 tables, indexed, realtime-ready). The gap is entirely on the frontend — pages are not querying data that exists." Exact SQL queries provided per widget. 3 Supabase Realtime subscriptions = alive dashboard at zero infra cost: `agent_jobs`, `content_items`, `notifications`.

**Build Lead** — Suspense + streaming at route segment level (not useEffect). Polling (not WebSockets) on Vercel serverless. Workspace at `/workspace/[jobId]` using existing `content_items.user_edited_content` column (no new table). `revalidateTag` on cache-tagged fetches required. 3 risks: stale-data without cache-invalidation, unbounded user-edit length (fixed with 100k CHECK), competitors query slow past 6mo without RPC.

---

## Reference artifact

`docs/08-agents_work/REFERENCES-REBUILD-WAVE2.md` — 342 lines, 12 companies (Linear, Vercel, Ramp, Superhuman, Missive, Cursor 3, Notion, Ahrefs Brand Radar, Otterly, SparkToro, Zapier, Retool) covering 6 Beamix page categories with pixel values, grid ratios, microcopy voice, anti-patterns. Every future rebuilder should read the section matching their page.

---

## What the next CEO should do FIRST

1. **Read this doc + the 7 board memos** in session files dated 2026-04-19
2. **Ask Adam:** apply the migration + set env vars? Or smoke-test a specific preview URL first?
3. **Decide merge strategy:** serial (safer, shows Adam progress page-by-page) or bulk (faster, one big production deploy)
4. **Verify on a preview URL** before merging anything — each feat branch has its own Vercel preview auto-deployed
5. **If merging:** apply Supabase migration FIRST, then merge in the order above, then run full typecheck + build after each merge
6. **If continuing build first:** fire workers for the gaps listed above (Roadmap real data, Workspace wired into Inbox PreviewPane, Scans drilldown components, run-history sparkline data)
7. **ALWAYS: commit stragglers** if workers die (they consistently die around 25-35 tool uses). Pattern proven in this session — workers make ~20-30 edits then terminate; CEO commits what's on disk to preserve work.

---

## Recurring worker-failure pattern (BURN INTO MEMORY)

Frontend/backend worker agents silently terminate around 25-35 tool uses, regardless of brief specificity. Mitigations that worked:
- **Tight scopes** (≤40 tool uses budget per worker)
- **Incremental commits per logical chunk** (if they die, committed work survives)
- **CEO commits stragglers** after death (`git add && git commit`)
- **Inline reference patterns** instead of mandatory Playwright research (research burns the budget before code is written)
- **Split multi-scope tasks** into per-file workers with zero overlap

**Two workers consistently committed to `main` instead of their worktree branch.** Recovery pattern: cherry-pick from main to correct branch, then `git reset --hard origin/main && git clean -fd` (requires explicit user approval per Beamix rules, but nothing is lost because work is preserved in feat branches first).

---

## Open feature proposals needing board review (from auth rebuild)

1. Magic link / passwordless login (Linear-style)
2. Social OAuth — "Continue with Google" above email/password
3. MFA / TOTP second factor (requires Supabase MFA enablement + /auth/mfa page)
4. "Remember this device" session persistence checkbox

Adam: decide which to build, then fire workers.

---

## Session file pointers

- `docs/08-agents_work/sessions/2026-04-19-ceo-wave2-batch2-and-polish.md`
- `docs/08-agents_work/sessions/2026-04-19-auth-rebuild-exec.md`
- `docs/08-agents_work/sessions/2026-04-19-tester-login-button.md` (tester-login details)
- `docs/08-agents_work/sessions/2026-04-19-rebuild-wave2-backend.md` (backend RPC + migration instructions for Adam)
- Each v2 branch has its own session file at `docs/08-agents_work/sessions/2026-04-19-rebuild-*-exec.md` (may be partial if worker died)
- `docs/08-agents_work/REFERENCES-REBUILD-WAVE2.md` (342-line SaaS reference)

---

**Bottom line for the next session:** Wave 2 shipped ~6,500 lines of rebuild code across 6 branches. Density + Workspace + real data + consequence copy are on their branches, not on main. Merge + apply migration + set env vars = production unlock. Then fire small targeted workers for the 5-6 listed gaps. Don't restart from scratch — the foundation is there.
