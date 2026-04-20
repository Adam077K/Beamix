# Wave 3 Rebuild Plan
*Author: Build Lead · 2026-04-20*
*Basis: HANDOFF-WAVE2-REBUILD-CONTINUE.md + 01-RESEARCH-SYNTHESIS.md + 02-VISUAL-DIRECTION.md + 03-PAGE-INVENTORY.md + live file audit*

---

## 1. Wave 2 Branch Disposition Matrix

| Branch | Files Changed | Action | Why | Conflict Risk |
|--------|---------------|--------|-----|---------------|
| `feat/rebuild-wave2-backend` | `api/internal/revalidate/route.ts`, `api/suggestions/[id]/dismiss/route.ts`, `inngest/functions/agent-pipeline.ts`, `supabase/migrations/20260419_01_rebuild_wave2_rpcs.sql` | **Merge as-is (first)** | Infrastructure-only changes. Migration contains `get_competitors_summary` RPC required by Competitors page. No UI overlap. Must land before any page worker fires. | LOW — only backend files |
| `feat/rebuild-home-v2` | 7 files: `home/page.tsx`, 6 new components (`HomeClientV2`, `KpiStripNew`, `ActivityFeedNew`, `EngineBreakdownGrid`, `ProgressRing`, `RoadmapTab`, `NextStepsSection`) | **Merge as-is** | 6 commits, all additive (new files + page.tsx swap). Does not modify existing component files — adds V2 alongside them. Consequence copy + KPI strip already in place. | LOW — additive new files |
| `feat/rebuild-inbox-workspace-v2` | 7 files: `workspace/[jobId]/page.tsx` (new route), `api/inbox/[itemId]/edit/route.ts` (streaming), `inbox/FilterRail.tsx`, 3 workspace components, `lib/types/shared.ts` | **Merge as-is, then wire** | Route and streaming API shipped. Gap: Inbox PreviewPane "Open in Workspace →" button not wired. Merge first, then Wave 3 worker W5 wires the button. `shared.ts` may conflict with automation branch. | MEDIUM — `shared.ts` touched by 2 branches; resolve by taking union of both |
| `feat/rebuild-scans-v2` | 3 files: `scans/page.tsx`, `scans/ScanDrilldown.tsx`, `scans/ScansClient.tsx` | **Rebase + fix** | Only 2 commits, partial work. `ScanDrilldown` is an interim stub missing `EngineBreakdownTable`, `QueryByQueryTable`, `SentimentHistogram`. Merge the V2 layout improvements; Wave 3 worker W6 completes the missing components on top. | LOW — only scans-specific files |
| `feat/rebuild-competitors-v2` | 8 files: `competitors/page.tsx`, `CompetitorsClient.tsx`, 5 new components, `competitors/types.ts` | **Merge as-is (after backend branch)** | 2 commits, all 6 components wired into page. Will render mock until `get_competitors_summary` RPC migration is applied. Merging this without the backend branch first = functional fallback mock, not broken. Backend branch must land first to unlock real data. Hover tooltips on SovTrendChart + EngineHeatmap missing — Wave 3 worker W7 adds them. | LOW — no shared files with other branches |
| `feat/rebuild-automation-v2` | 4 files: `automation/page.tsx`, `AutomationClient.tsx`, `AddScheduleModal.tsx`, `lib/types/shared.ts` | **Cherry-pick UI changes, resolve shared.ts manually** | 2 commits. UI improvements (projection card, denser rows, GEO agent names, AddScheduleModal) are valuable. `shared.ts` is the conflict hotspot — automation and inbox-workspace both modify it. Resolve by merging both diffs manually. DB wiring is still needed (Wave 3 worker W8). | HIGH — `shared.ts` conflict with inbox-workspace branch; resolve manually |

**Merge order (pre-Wave-3 prerequisite):**
```
1. feat/rebuild-wave2-backend       ← infrastructure + migration
2. feat/rebuild-home-v2             ← additive, no conflicts
3. feat/rebuild-inbox-workspace-v2  ← workspace route + streaming API
4. feat/rebuild-competitors-v2      ← depends on backend migration being applied
5. feat/rebuild-scans-v2            ← partial stub, workers build on top
6. feat/rebuild-automation-v2       ← resolve shared.ts conflict last
```

**Adam must do first (before any Wave 3 worker fires):**
1. Apply `supabase/migrations/20260419_01_rebuild_wave2_rpcs.sql` via Supabase SQL Editor
2. Set `INTERNAL_REVALIDATE_SECRET` env var in Vercel (32-char random string)
3. Verify `ANTHROPIC_API_KEY` in Vercel env (for streaming Workspace edit)

---

## 2. Worker Wave Schedule

### Batch 0 — Database Foundation (sequential prerequisite)
**Goal:** Create missing tables (G1 suggestions, G2 automation_schedules, G3 competitors, G4 kill switch), add missing columns, propose resolutions for all 10 PRD gaps.
**Preconditions:** Adam applies Wave 2 migration manually. Wave 2 branches merged to main.
**Gate before Batch 1:** Migration `20260420_wave3_foundation.sql` written + reviewed by Adam. Adam confirms default decisions for G1/G3/G8 (the three hard blockers).

- **W0 — database-engineer** → `feat/wave3-db-foundation`
  Files: `apps/web/supabase/migrations/20260420_wave3_foundation.sql`

---

### Batch 1 — Visual Density + Token Patch (parallel)
**Goal:** Fix the container/grid/spacing anti-patterns across all pages. These are pure UI changes with zero DB dependency.
**Preconditions:** Wave 2 branches merged to main.
**Gate before Batch 2:** `pnpm -F @beamix/web typecheck` returns 0 errors across all 4 files.

- **W1 — frontend-developer** → `feat/wave3-token-grid-patch`
  Files: `apps/web/src/app/globals.css` (token patch), `apps/web/src/components/home/HomeClientV2.tsx` (container fix), `apps/web/src/components/competitors/CompetitorsClient.tsx` (container fix), `apps/web/src/components/ui/sticky-kpi-strip.tsx` (new shared component)

- **W2 — frontend-developer** → `feat/wave3-consequence-copy`
  Files: `apps/web/src/components/home/HomeClientV2.tsx`, `apps/web/src/components/scans/ScansClient.tsx`, `apps/web/src/components/automation/AutomationClient.tsx`, `apps/web/src/components/inbox/InboxClient.tsx` (consequence copy + keyboard shortcut strip)

---

### Batch 2 — DB Wiring: Home + Scans (parallel)
**Goal:** Replace all mock data on Home and Scans list with real Supabase queries.
**Preconditions:** Batch 0 gate passed (foundation migration applied). Wave 2 branches on main.
**Gate before Batch 3:** Home renders real GEO score, sparkline, and suggestions from DB. Scans list renders real scan history grouped by date.

- **W3 — backend-developer** → `feat/wave3-home-db-wiring`
  Files: `apps/web/src/app/(protected)/home/page.tsx`, `apps/web/src/components/home/HomeClientV2.tsx`, `apps/web/src/components/home/RoadmapTab.tsx`

- **W4 — backend-developer** → `feat/wave3-scans-db-wiring`
  Files: `apps/web/src/app/(protected)/scans/page.tsx`, `apps/web/src/components/scans/ScansClient.tsx`, `apps/web/src/app/(protected)/scans/[scanId]/page.tsx` (new), `apps/web/src/components/scans/ScanDrilldown.tsx`

---

### Batch 3 — DB Wiring: Inbox + Workspace + Competitors (parallel)
**Goal:** Wire Inbox 3-pane to real content_items. Complete Workspace PreviewPane → button link. Wire Competitors to real RPC data.
**Preconditions:** Batch 1 + 2 gates passed. Wave 2 branches on main.
**Gate before Batch 4:** Inbox shows real content items from Supabase. Workspace route opens from Inbox. Competitors page renders real data from get_competitors_summary RPC.

- **W5 — frontend-developer** → `feat/wave3-inbox-workspace-wire`
  Files: `apps/web/src/components/inbox/PreviewPane.tsx`, `apps/web/src/components/inbox/InboxClient.tsx`, `apps/web/src/app/(protected)/inbox/page.tsx`

- **W6 — frontend-developer** → `feat/wave3-scan-drilldown-components`
  Files: `apps/web/src/components/scans/EngineBreakdownTable.tsx` (new), `apps/web/src/components/scans/QueryByQueryTable.tsx` (new), `apps/web/src/components/scans/SentimentHistogram.tsx` (new), `apps/web/src/components/scans/ScanDrilldown.tsx` (compose new components)

- **W7 — backend-developer** → `feat/wave3-competitors-db-wire`
  Files: `apps/web/src/app/(protected)/competitors/page.tsx`, `apps/web/src/components/competitors/CompetitorsClient.tsx`, `apps/web/src/components/competitors/SovTrendChart.tsx` (add hover tooltips), `apps/web/src/components/competitors/EngineHeatmap.tsx` (add hover tooltips)

---

### Batch 4 — DB Wiring: Automation + Archive + Settings (parallel)
**Goal:** Wire the three remaining mock pages to real Supabase data.
**Preconditions:** Batch 0 foundation migration applied (automation_schedules + automation_settings tables exist).
**Gate before Batch 5:** Automation shows real schedule rows. Archive shows real approved content. Settings Profile/Business tabs save and reload correctly.

- **W8 — backend-developer** → `feat/wave3-automation-db-wire`
  Files: `apps/web/src/app/(protected)/automation/page.tsx`, `apps/web/src/components/automation/AutomationClient.tsx`, `apps/web/src/components/automation/AddScheduleModal.tsx`, `apps/web/src/app/api/automation/schedules/route.ts`

- **W9 — backend-developer** → `feat/wave3-archive-settings-db-wire`
  Files: `apps/web/src/app/(protected)/archive/page.tsx`, `apps/web/src/app/(protected)/settings/page.tsx`, `apps/web/src/app/api/archive/[itemId]/publish/route.ts` (new)

---

### Batch 5 — Onboarding Route (sequential, final)
**Goal:** Create the `/onboarding` route missing from apps/web entirely.
**Preconditions:** All Batch 4 gates passed. Foundation migration applied (businesses + user_profiles + integrations tables exist).
**Gate (final):** pnpm typecheck + build pass. Onboarding flow completes without infinite redirect.

- **W10 — frontend-developer** → `feat/wave3-onboarding-route`
  Files: `apps/web/src/app/(protected)/onboarding/page.tsx` (new), `apps/web/src/components/onboarding/OnboardingClient.tsx` (new), `apps/web/src/app/api/onboarding/complete/route.ts` (already exists — verify it handles new schema)

---

## 3. Per-Worker Brief Templates

### W0 — Database Engineer: Foundation Migration

**Worker type:** database-engineer
**Branch:** `feat/wave3-db-foundation`
**Turn budget:** 35

**Reads first:**
1. `apps/web/supabase/migrations/20260418_02_rethink_schema.sql` — understand existing tables
2. `docs/08-agents_work/rebuild-wave3-rethink/03-PAGE-INVENTORY.md` §6 — PRD gaps G1–G10
3. `apps/web/supabase/migrations/20260419_01_rebuild_wave2_rpcs.sql` — see pattern for RPCs
4. `.claude/memory/DECISIONS.md` — locked architecture decisions

**Implements:**
- `apps/web/supabase/migrations/20260420_wave3_foundation.sql` containing:
  - `suggestions` table: `(id uuid PK, business_id uuid FK businesses, rule_id text, impact_score integer, agent_type text, status text CHECK('pending','dismissed','accepted'), created_at timestamptz, updated_at timestamptz)` — resolves G1 with option A
  - `automation_schedules` table: `(id uuid PK, user_id uuid FK auth.users, business_id uuid FK businesses, agent_type text, cadence text CHECK('daily','weekly','monthly'), next_run_at timestamptz, last_run_at timestamptz, is_paused boolean DEFAULT false, created_at timestamptz)` — resolves G2
  - `competitors` table: `(id uuid PK, business_id uuid FK businesses, name text NOT NULL, url text, created_at timestamptz)` — resolves G3 with option A
  - `automation_settings` table: `(id uuid PK, user_id uuid FK auth.users UNIQUE, automation_paused boolean DEFAULT false, credit_cap integer, created_at timestamptz, updated_at timestamptz)` — resolves G4 with combined A+B
  - `content_versions` table: `(id uuid PK, content_item_id uuid FK content_items, version_number integer, content_body text, edited_by uuid, change_summary text, created_at timestamptz)` — for Workspace version history
  - `citation_sources` table: `(id uuid PK, business_id uuid FK businesses, source_domain text, mention_count integer DEFAULT 0, engines text[], updated_at timestamptz)` — for Scan drilldown
  - RLS policies on all new tables: user_id-based row isolation
  - Supabase `LANGUAGE sql` + CTEs pattern throughout (no plpgsql DECLARE vars — see memory feedback on SQL Editor bug)

**Does NOT touch:** Any TypeScript files. Any existing migration files.

**Acceptance checks:**
- SQL file is valid `LANGUAGE sql` with no plpgsql DECLARE sections
- All new tables have RLS enabled + user_id-scoped SELECT/INSERT/UPDATE policies
- `suggestions` table has `impact_score` and `status` columns
- `automation_schedules` matches the schema described in G2 resolution
- `competitors` table created (not just `competitor_mentions` text array)
- All foreign keys reference correct parent tables from existing schema

---

### W1 — Frontend Developer: Token + Grid Patch

**Worker type:** frontend-developer
**Branch:** `feat/wave3-token-grid-patch`
**Turn budget:** 30

**Reads first:**
1. `apps/web/src/app/globals.css` — current token values (card-radius 20px, etc.)
2. `docs/08-agents_work/rebuild-wave3-rethink/02-VISUAL-DIRECTION.md` §2 Token Diff + §5 Anti-Patterns 1–5
3. `apps/web/src/components/home/HomeClientV2.tsx` — current container class (`max-w-4xl`)
4. `apps/web/src/components/competitors/CompetitorsClient.tsx` — current container class (`max-w-5xl`)

**Implements:**
- `apps/web/src/app/globals.css`: change `--card-radius` from 20px to 12px; add `--card-padding-dense: 1rem`; add `--section-gap-dense: 1rem`
- `apps/web/src/components/home/HomeClientV2.tsx`: change `max-w-4xl` → `max-w-[1200px]`; change `gap-8` → `gap-5`; add `grid-cols-[1fr_300px]` aside layout if not present
- `apps/web/src/components/competitors/CompetitorsClient.tsx`: change `max-w-5xl` → `max-w-[1100px]`; add `grid-cols-[1fr_260px]` aside layout
- `apps/web/src/components/ui/sticky-kpi-strip.tsx` (new): `StickyKpiStrip` component — `sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border h-12` with `StatCell` sub-component for 4–6 KPI values. TypeScript props: `{ cells: { label: string; value: string | number; delta?: string; deltaPositive?: boolean }[] }`

**Does NOT touch:** Any backend files. Any Supabase queries. Any page.tsx files. Any components not listed.

**Acceptance checks:**
- `globals.css` has `--card-radius: 12px` (not 20px)
- `HomeClientV2.tsx` container class is `max-w-[1200px]`
- `CompetitorsClient.tsx` container class is `max-w-[1100px]`
- `StickyKpiStrip` renders 4 stat cells in a flex row at 48px height
- `mcp__ide__getDiagnostics` returns 0 TypeScript errors before commit

---

### W2 — Frontend Developer: Consequence Copy

**Worker type:** frontend-developer
**Branch:** `feat/wave3-consequence-copy`
**Turn budget:** 25

**Reads first:**
1. `docs/08-agents_work/rebuild-wave3-rethink/02-VISUAL-DIRECTION.md` §4 Critical Patterns #3 (consequence empty states) + #8 (delta copy) + §5 Anti-Patterns #7 (text-gray-400 empty states)
2. `docs/08-agents_work/rebuild-wave3-rethink/03-PAGE-INVENTORY.md` §5 RICE item #4 (copy replacement) + #11 (empty states)
3. `apps/web/src/components/home/HomeClientV2.tsx` — find all neutral copy strings
4. `apps/web/src/components/inbox/InboxClient.tsx` — find keyboard shortcuts location

**Implements:**
- `apps/web/src/components/home/HomeClientV2.tsx`: Replace neutral labels. Examples: `"Good"` → `"Customers find you — but check Perplexity"`, `"Nothing waiting for review"` → `"No drafts yet — accept a suggestion to queue your first agent"`, `"Score: 71"` → `"Score 71 — 3 competitors rank above you on Perplexity"`
- `apps/web/src/components/scans/ScansClient.tsx`: `"No scans yet"` → `"Run your first scan to see how AI engines describe your business"`. Score badge labels: `"Good"` → show numeric score only (no adjective). Delta `+4` → `"↑ +4 since last scan"`
- `apps/web/src/components/automation/AutomationClient.tsx`: `"Paused"` → `"Off — not running"`. `"Active"` → `"Running"`. Empty state `"No automations"` → `"No agents scheduled — add a schedule to start improving your visibility automatically"`
- `apps/web/src/components/inbox/InboxClient.tsx`: Add keyboard shortcut strip at bottom of list pane: `text-xs text-muted-foreground` — `j/k navigate · e edit · a approve · x dismiss`
- All pages: `"Loading..."` placeholder → skeleton components (use existing Skeleton from shadcn)

**Does NOT touch:** Any data queries, props types, or component structure. Only string literals and inline copy. Does not touch backend or db files.

**Acceptance checks:**
- Zero uses of the word `"Good"` as a standalone score label in any file touched
- `"Nothing"` and `"No items"` empty state strings replaced with actionable framing
- Keyboard shortcut strip rendered in InboxClient
- `mcp__ide__getDiagnostics` returns 0 TypeScript errors

---

### W3 — Backend Developer: Home DB Wiring

**Worker type:** backend-developer
**Branch:** `feat/wave3-home-db-wiring`
**Turn budget:** 35

**Reads first:**
1. `docs/08-agents_work/rebuild-wave3-rethink/03-PAGE-INVENTORY.md` §4 Home data contract (exact SQL queries)
2. `apps/web/src/app/(protected)/home/page.tsx` — current server component / data fetching pattern
3. `apps/web/src/components/home/HomeClientV2.tsx` — props it expects
4. `apps/web/src/components/home/RoadmapTab.tsx` — what data it needs
5. `apps/web/supabase/migrations/20260308_004_agents_content.sql` — content_items + agent_jobs schema

**Implements:**
- `apps/web/src/app/(protected)/home/page.tsx`: Replace mock data with server-side Supabase queries. Use `createServerClient` pattern (check existing pages for import). Fetch: latest scan score + delta, 8-week sparkline, engine breakdown (scan_engine_results GROUP BY engine), top 3 suggestions (from `suggestions` table if W0 migration applied, else fallback empty array), inbox preview (content_items), credits (credit_pools), next scheduled run (automation_schedules.next_run_at)
- `apps/web/src/components/home/HomeClientV2.tsx`: Accept real data props. Remove all mock/hardcoded values. Implement 4 loading/error/empty/populated states. Score ring shows `--` with "Run your first scan" when no scans exist.
- `apps/web/src/components/home/RoadmapTab.tsx`: Wire to real agent_jobs + content_items data. Completed = `content_items WHERE status='approved'`. In Progress = `agent_jobs WHERE status IN ('running','pending')`. Up Next = `suggestions WHERE status='pending' LIMIT 3`.

**Does NOT touch:** Any competitor, inbox, or scans components. Auth pages. Any migration files.

**Acceptance checks:**
- Home page renders without errors when user has 0 scans (empty state, not crash)
- GEO score number is pulled from `scans.overall_score` (not hardcoded 62)
- Credits usage fraction comes from `credit_pools` query
- RoadmapTab renders real agent_jobs and content_items (not mock arrays)
- `mcp__ide__getDiagnostics` 0 errors before commit

---

### W4 — Backend Developer: Scans DB Wiring + Drilldown Route

**Worker type:** backend-developer
**Branch:** `feat/wave3-scans-db-wiring`
**Turn budget:** 35

**Reads first:**
1. `docs/08-agents_work/rebuild-wave3-rethink/03-PAGE-INVENTORY.md` §4 Scans + Scan Drilldown data contracts
2. `apps/web/src/app/(protected)/scans/page.tsx` — current state (Wave 2 partial)
3. `apps/web/src/components/scans/ScansClient.tsx` — current client component
4. `apps/web/supabase/migrations/20260308_003_scan.sql` — scans + scan_engine_results schema
5. `apps/web/src/components/scans/ScanDrilldown.tsx` — interim stub to understand its shape

**Implements:**
- `apps/web/src/app/(protected)/scans/page.tsx`: Server component fetches `scans WHERE business_id=$bid ORDER BY scanned_at DESC`. Group rows client-side by date (TODAY / YESTERDAY / LAST WEEK). Tier-gate manual re-scan CTA.
- `apps/web/src/components/scans/ScansClient.tsx`: Accept real scan rows. Render 52px `divide-y` rows with: score badge (ScoreBadge component), delta (TrendBadge), engine pips (5 filled/empty circles per scan_engine_results), date (relative time). Link each row to `/scans/[scanId]`.
- `apps/web/src/app/(protected)/scans/[scanId]/page.tsx` (new): Server component. Fetch scan by id + all scan_engine_results for that scan + previous scan for comparison (Build/Scale). Pass to ScanDrilldown client component.
- `apps/web/src/components/scans/ScanDrilldown.tsx`: Update to accept real scan data props. Remove mock data. Render StickyKpiStrip (reuse from W1) with: Score, Prev Score, Delta, Engines queried, Query count.

**Does NOT touch:** EngineBreakdownTable, QueryByQueryTable, SentimentHistogram (those are W6). Automation, Competitors, Home components. Migration files.

**Acceptance checks:**
- Scans list page shows real scan rows grouped by date from Supabase
- `/scans/[scanId]` route renders without crash when scanId is valid
- Engine pips in list rows reflect actual `scan_engine_results` presence per engine
- Manual re-scan CTA is hidden for Discover tier
- `mcp__ide__getDiagnostics` 0 errors

---

### W5 — Frontend Developer: Inbox → Workspace Wire

**Worker type:** frontend-developer
**Branch:** `feat/wave3-inbox-workspace-wire`
**Turn budget:** 30

**Reads first:**
1. `docs/08-agents_work/rebuild-wave3-rethink/03-PAGE-INVENTORY.md` §4 Inbox data contract + Workspace route spec
2. `apps/web/src/components/inbox/PreviewPane.tsx` — where "Open in Workspace" button needs to go
3. `apps/web/src/components/inbox/InboxClient.tsx` — 3-pane layout state
4. `apps/web/src/app/(protected)/inbox/page.tsx` — current server page
5. `apps/web/src/components/workspace/WorkspaceClient.tsx` — what it expects (from Wave 2 branch, now on main)

**Implements:**
- `apps/web/src/app/(protected)/inbox/page.tsx`: Server component fetches `content_items WHERE status IN ('draft','awaiting_review') ORDER BY created_at DESC` via Supabase. Pass items + total unread count to InboxClient.
- `apps/web/src/components/inbox/InboxClient.tsx`: Accept real content_items data. Render true 3-pane layout: `grid-cols-[260px_1fr_300px]`. FilterRail tabs wire to status filter (All/Pending/Approved/Rejected). Realtime subscription on `content_items` INSERT to update list live. Keyboard shortcuts J/K/A/X/E functional via `useEffect` keydown listener.
- `apps/web/src/components/inbox/PreviewPane.tsx`: Add "Open in Workspace →" button. Route: `/workspace/[content_item.agent_job_id]`. Show button only if `content_item.agent_job_id` is not null. Tier-gate: Discover = button renders but shows upgrade modal onclick.

**Does NOT touch:** WorkspaceClient, WorkspaceEditor, any scans or home components. API routes. Migration files.

**Acceptance checks:**
- Inbox shows real `content_items` rows (not 3 hardcoded items)
- 3-pane layout renders at 1440px: 260px list | flex-1 preview | 300px evidence
- "Open in Workspace →" button navigates to `/workspace/[jobId]` correctly
- J/K keyboard navigation selects prev/next item in list
- Unread badge count reflects real `awaiting_review` count from Supabase
- `mcp__ide__getDiagnostics` 0 errors

---

### W6 — Frontend Developer: Scan Drilldown Components

**Worker type:** frontend-developer
**Branch:** `feat/wave3-scan-drilldown-components`
**Turn budget:** 35

**Reads first:**
1. `docs/08-agents_work/rebuild-wave3-rethink/02-VISUAL-DIRECTION.md` §3.3 Scan Detail blueprint
2. `docs/08-agents_work/rebuild-wave3-rethink/01-RESEARCH-SYNTHESIS.md` §3.5 Patterns P1 (per-engine breakdown) + P3 (query drilldown table)
3. `apps/web/src/components/scans/ScanDrilldown.tsx` — current stub (shape of props it receives from W4)
4. `apps/web/src/components/ui/` — available Shadcn primitives (Table, Badge, etc.)

**Implements:**
- `apps/web/src/components/scans/EngineBreakdownTable.tsx` (new): 5 engine cards in `grid-cols-3` then `grid-cols-2` layout (2+3 split per spec). Each card: engine name + icon, mention status badge (`Mentioned` / `Not mentioned` / `Cited`), rank position (`font-mono tabular-nums`), sentiment dot (Positive=green / Neutral=gray / Negative=red). Props: `{ results: ScanEngineResult[] }`.
- `apps/web/src/components/scans/QueryByQueryTable.tsx` (new): Shadcn `Table` base. Columns: query text | engine | result (mention status badge) | rank (`font-mono`) | sentiment dot. 5 visible rows at 44px each. `text-sm`. Props: `{ rows: ScanEngineResult[] }`.
- `apps/web/src/components/scans/SentimentHistogram.tsx` (new): Simple bar chart using inline SVG (no Recharts). 3 bars: Positive / Neutral / Negative with count labels. 80px tall. Props: `{ positive: number; neutral: number; negative: number }`.
- `apps/web/src/components/scans/ScanDrilldown.tsx`: Compose the 3 new components. Wrap in `grid-cols-[1fr_280px]` layout per spec. Aside: scan metadata (date, duration, business name, engines queried) as `<dl>` + PDF export button (placeholder — renders but shows "Coming soon" tooltip since API returns 404).

**Does NOT touch:** Any page.tsx files. Scans list. Home. Any DB queries. Migration files.

**Acceptance checks:**
- EngineBreakdownTable renders 5 engine cards in 2+3 grid
- QueryByQueryTable renders rows with `font-mono tabular-nums` rank column
- SentimentHistogram renders 3 bars without crashing on 0 values
- ScanDrilldown composes all 3 components at correct grid layout
- `mcp__ide__getDiagnostics` 0 errors

---

### W7 — Backend Developer: Competitors DB Wiring + Tooltips

**Worker type:** backend-developer
**Branch:** `feat/wave3-competitors-db-wire`
**Turn budget:** 30

**Reads first:**
1. `docs/08-agents_work/rebuild-wave3-rethink/03-PAGE-INVENTORY.md` §4 Competitors data contract
2. `apps/web/src/app/(protected)/competitors/page.tsx` — current page (from Wave 2 branch, now on main)
3. `apps/web/src/components/competitors/CompetitorsClient.tsx` — current client component
4. `apps/web/supabase/migrations/20260419_01_rebuild_wave2_rpcs.sql` — get_competitors_summary RPC definition

**Implements:**
- `apps/web/src/app/(protected)/competitors/page.tsx`: Replace mock data with `get_competitors_summary` RPC call via `supabase.rpc('get_competitors_summary', { p_business_id: businessId })`. Pass real data to CompetitorsClient. Handle RPC-not-applied graceful fallback (catch error → return empty data with explanatory message).
- `apps/web/src/components/competitors/CompetitorsClient.tsx`: Accept real RPC data. Render StickyKpiStrip with: YourSoV%, Leader + their SoV%, Gap (pp difference), Tracked competitor count.
- `apps/web/src/components/competitors/SovTrendChart.tsx`: Add Recharts `Tooltip` component with date + SoV% label on hover. Currently pure SVG / no tooltip.
- `apps/web/src/components/competitors/EngineHeatmap.tsx`: Add title attribute tooltip on each cell showing engine name + percentage. 1-line addition per cell.

**Does NOT touch:** Any migration files. Home, Inbox, or Scans components. Any other pages.

**Acceptance checks:**
- Page calls `get_competitors_summary` RPC (verifiable in component props or server component)
- StickyKpiStrip shows real SoV% (not `34%` hardcoded)
- SovTrendChart tooltip shows on hover (Recharts Tooltip rendered)
- EngineHeatmap cells have title attribute
- Graceful fallback when RPC not yet applied (no unhandled errors)
- `mcp__ide__getDiagnostics` 0 errors

---

### W8 — Backend Developer: Automation DB Wiring

**Worker type:** backend-developer
**Branch:** `feat/wave3-automation-db-wire`
**Turn budget:** 35

**Reads first:**
1. `docs/08-agents_work/rebuild-wave3-rethink/03-PAGE-INVENTORY.md` §4 Automation data contract
2. `apps/web/src/app/(protected)/automation/page.tsx` — current page (Wave 2 branch, now on main)
3. `apps/web/src/components/automation/AutomationClient.tsx` — current mock client
4. `apps/web/src/app/api/automation/schedules/route.ts` — current API route (verify it accepts `{agent_type, trigger, frequency}`)
5. `apps/web/supabase/migrations/20260420_wave3_foundation.sql` — automation_schedules + automation_settings schema (from W0)

**Implements:**
- `apps/web/src/app/(protected)/automation/page.tsx`: Server component fetches `automation_schedules WHERE user_id=$uid` + `credit_pools` + `agent_jobs` for sparklines (last 30 days, grouped by agent_type + date). Pass to AutomationClient.
- `apps/web/src/components/automation/AutomationClient.tsx`: Accept real schedule rows. Remove hardcoded mock agents. Render 56px `divide-y` rows per schedule. Toggle switch → `PATCH /api/automation/schedules/[id]` to set `is_paused`. Kill switch → `UPDATE automation_settings SET automation_paused = true`. CreditBudgetBar shows real `used_amount / (base_allocation + rollover_amount + topup_amount)`. Run-history sparklines: render from passed agent_jobs data as 24×24px inline SVG path.
- `apps/web/src/app/api/automation/schedules/route.ts`: Verify POST accepts `{agent_type, trigger, frequency}`. Add PATCH handler for toggle (accepts `{is_paused: boolean}`). Return 400 on invalid agent_type.
- `apps/web/src/components/automation/AddScheduleModal.tsx`: Wire POST to `/api/automation/schedules`. Enforce tier limit (Build = max 3 schedules: show error if `schedules.length >= 3`; Scale = unlimited).

**Does NOT touch:** Home, Inbox, Scans, Competitors components. Any migration files.

**Acceptance checks:**
- Automation page shows real schedule rows from Supabase (not 4 hardcoded rows)
- Toggle switch triggers PATCH to correct API route
- CreditBudgetBar shows real credit fractions
- AddScheduleModal POST returns 201 on success
- Tier limit enforced: Build users cannot add >3 schedules
- `mcp__ide__getDiagnostics` 0 errors

---

### W9 — Backend Developer: Archive + Settings DB Wiring

**Worker type:** backend-developer
**Branch:** `feat/wave3-archive-settings-db-wire`
**Turn budget:** 35

**Reads first:**
1. `docs/08-agents_work/rebuild-wave3-rethink/03-PAGE-INVENTORY.md` §4 Archive + Settings data contracts
2. `apps/web/src/app/(protected)/archive/page.tsx` — current mock page
3. `apps/web/src/app/(protected)/settings/page.tsx` — current mock settings
4. `apps/web/supabase/migrations/20260308_001_core_identity.sql` — user_profiles + businesses schema
5. `apps/web/supabase/migrations/20260308_002_billing.sql` — subscriptions + plans schema

**Implements:**
- `apps/web/src/app/(protected)/archive/page.tsx`: Server component fetches `content_items WHERE status IN ('approved','published') ORDER BY updated_at DESC`. Pass to ArchiveClient.
- Archive client component (inline or separate): Render rows with title, agent_type badge, status badge (`Approved` / `Published`), `published_url` if set, copy-content button (clipboard API). "Mark as published" → POST to `/api/archive/[itemId]/publish`.
- `apps/web/src/app/api/archive/[itemId]/publish/route.ts` (new): Accepts `{url}`. Updates `content_items SET status='published', published_url=$url`. Fires Inngest `archive.published` event (deferred URL probe — note in code comment that URL probe Inngest function is G7 deferred).
- `apps/web/src/app/(protected)/settings/page.tsx`: Server component fetches `user_profiles`, `businesses WHERE is_primary=true`, `subscriptions JOIN plans`, `notification_preferences`. Pass to existing SettingsClient or create SettingsPageClient.
- Settings Profile tab: wire name + timezone + locale to Supabase UPSERT via existing `/api/settings/profile` route (verify route exists).
- Settings Business tab: wire business name/url/industry/description to Supabase UPSERT via existing `/api/settings/business` route.
- Settings Billing tab: replace hardcoded plan name with real `subscriptions.plan_tier`. Paddle portal link remains client-side stub.
- Settings Notifications tab: wire `notification_preferences` toggles to Supabase UPDATE.

**Does NOT touch:** Automation, Competitors, Home, Inbox. Migration files.

**Acceptance checks:**
- Archive page shows real approved/published content_items (not 5 hardcoded items)
- "Mark as published" POST works and sets `status='published'`
- Settings Profile tab saves successfully (no silent no-op)
- Settings Business tab loads current values from DB on mount
- Settings Billing tab shows real plan name
- `mcp__ide__getDiagnostics` 0 errors

---

### W10 — Frontend Developer: Onboarding Route

**Worker type:** frontend-developer
**Branch:** `feat/wave3-onboarding-route`
**Turn budget:** 35

**Reads first:**
1. `docs/08-agents_work/rebuild-wave3-rethink/03-PAGE-INVENTORY.md` §2c Onboarding route spec + G8 preview account routing
2. `apps/web/src/app/api/onboarding/complete/route.ts` — existing API route (verify it handles new schema)
3. `apps/web/src/middleware.ts` — current middleware routing logic
4. `apps/web/src/app/(protected)/layout.tsx` — shell layout, where onboarding redirect check should go
5. `apps/web/supabase/migrations/20260302_signup_trigger.sql` — handle_new_user trigger pattern

**Implements:**
- `apps/web/src/app/(protected)/onboarding/page.tsx` (new): Server component. Checks `user_profiles.onboarding_completed_at` — if set, redirect to `/home`. Otherwise render OnboardingClient.
- `apps/web/src/components/onboarding/OnboardingClient.tsx` (new): 2-step flow. Step 1: Business profile form (name, website, industry, location, description). Step 2: Connect integrations (GA4/GSC — skippable with "Skip for now" link). Final CTA: "Go to dashboard" → POST to `/api/onboarding/complete` → fires Inngest `onboarding.complete` event → redirect to `/home`. Progress dots at top showing step 1 of 2.
- `apps/web/src/app/api/onboarding/complete/route.ts`: Verify it handles `automation_settings` upsert (insert default row for new user). Verify it sets `user_profiles.onboarding_completed_at = NOW()`. If not, patch accordingly.
- `apps/web/src/middleware.ts`: Add check: if user is authenticated AND `onboarding_completed_at IS NULL` AND path is NOT `/onboarding` AND NOT `/api/` → redirect to `/onboarding`. Use option C for preview account (G8): absence of `subscriptions` row = preview → skip redirect to onboarding, land on `/home` with banner.
- `apps/web/src/app/(protected)/layout.tsx`: Add `has_completed_onboarding` prop or banner for preview accounts (status 'trialing' without onboarding).

**Does NOT touch:** Any existing page except middleware + layout for routing only. Any database migration files. Any other components.

**Acceptance checks:**
- New user (no `onboarding_completed_at`) is redirected to `/onboarding` by middleware
- Completing onboarding sets `user_profiles.onboarding_completed_at` and redirects to `/home`
- Infinite redirect loop does NOT occur (the bug from memory)
- Step 2 "Skip for now" bypasses GA4/GSC and completes onboarding
- Preview user (no subscriptions row) lands on `/home` directly
- `mcp__ide__getDiagnostics` 0 errors

---

## 4. Integration / Merge Order

### Pre-Wave-3 (Adam does manually)
1. Apply `apps/web/supabase/migrations/20260419_01_rebuild_wave2_rpcs.sql` via Supabase SQL Editor
2. Set `INTERNAL_REVALIDATE_SECRET` env var in Vercel
3. Merge Wave 2 branches in disposition order (§1 above)

### Wave 3 branch merge order
```
Batch 0 completes first:
  1. feat/wave3-db-foundation       ← foundation migration, no UI conflicts

Batch 1 (can merge in parallel):
  2. feat/wave3-token-grid-patch    ← globals.css + HomeClientV2 container
  3. feat/wave3-consequence-copy    ← copy strings only, minimal conflict

Batch 2 (after batch 1):
  4. feat/wave3-home-db-wiring      ← home/page.tsx + HomeClientV2 props
  5. feat/wave3-scans-db-wiring     ← scans/page.tsx + ScansClient + new [scanId] route

Batch 3 (after batch 2):
  6. feat/wave3-inbox-workspace-wire ← inbox/page.tsx + PreviewPane + InboxClient
  7. feat/wave3-scan-drilldown-components ← 3 new components, no page.tsx conflict
  8. feat/wave3-competitors-db-wire  ← competitors/page.tsx + RPC + tooltips

Batch 4 (after batch 3):
  9. feat/wave3-automation-db-wire   ← automation/page.tsx + schedules API
  10. feat/wave3-archive-settings-db-wire ← archive + settings pages

Batch 5 (after batch 4, final):
  11. feat/wave3-onboarding-route    ← new route + middleware change (touches layout.tsx)
```

**Expected conflict hotspots:**

| Hotspot | Branches | Resolution |
|---------|----------|------------|
| `apps/web/src/lib/types/shared.ts` | inbox-workspace-v2 + automation-v2 (Wave 2) | Take union of both type additions during Wave 2 merge |
| `apps/web/src/components/home/HomeClientV2.tsx` | W1 (container) + W2 (copy) + W3 (DB props) | Merge in order: W1 → W2 → W3. Each touches distinct lines. |
| `apps/web/src/app/(protected)/layout.tsx` | W10 (middleware/layout) | Last to merge — confirm no other worker touched layout |
| `apps/web/src/middleware.ts` | W10 only | No conflict expected — only W10 touches middleware |

---

## 5. Risk Register

| # | Risk | Probability | Impact | Mitigation |
|---|------|-------------|--------|------------|
| R1 | **Worker death at 25-35 tool uses** | HIGH | HIGH | ≤35 turn budget per worker. Each worker implements ≤5 files. Incremental commits per logical chunk (not one big commit at end). CEO commits disk state if worker dies. |
| R2 | **Foundation migration (W0) not applied before Batch 2 workers fire** | MEDIUM | HIGH | Hard gate: Batch 2 workers brief says "Precondition: W0 migration applied." Build Lead verifies `20260420_wave3_foundation.sql` exists and Adam confirms applied before dispatching W3/W4. |
| R3 | **Wave 2 `shared.ts` conflict on merge** | HIGH | MEDIUM | Two Wave 2 branches (inbox-workspace-v2, automation-v2) both modified `lib/types/shared.ts`. Resolve manually during Wave 2 merge step — take union of both type additions. Document resolved version before Wave 3 workers touch it. |
| R4 | **Inngest auth / ANTHROPIC_API_KEY missing** | MEDIUM | MEDIUM | Wave 2 handoff flags this. Workspace streaming edit route already 503s gracefully without key. Automation route fires events but won't execute LLM if key missing. Build Lead confirms env vars set before Batch 3 (W5 Workspace wiring). |
| R5 | **Supabase RLS gaps on new tables** | MEDIUM | HIGH | W0 brief explicitly requires RLS policies on every new table using `LANGUAGE sql` + CTEs (not plpgsql DECLARE — see MEMORY.md bug note). W0 acceptance check validates RLS enabled. |
| R6 | **Suggestions table not ready when W3 fires** | MEDIUM | MEDIUM | W3 (Home DB wiring) handles this with a try/catch fallback: if `suggestions` table doesn't exist or returns error, render Home with empty suggestions section (not a crash). "No suggestions yet — your first scan generates them" empty state. |
| R7 | **Streaming edit API cost overrun (Haiku)** | LOW | LOW | Workspace streaming API already uses Haiku (not Sonnet/Opus). W5 does not change the API route. No cost risk from Wave 3 wiring. Monitor via Anthropic usage dashboard post-launch. |
| R8 | **Onboarding infinite redirect loop (W10)** | MEDIUM | HIGH | This exact bug occurred before (MEMORY.md — handle_new_user trigger). W10 brief: explicitly check that `onboarding_completed_at` is set BEFORE redirecting, verify UPSERT not UPDATE in API route. Acceptance check: "Infinite redirect loop does NOT occur." The `20260302_signup_trigger.sql` migration that fixes the trigger must be applied. |

---

## 6. PRD Gap Resolutions (G1–G10)

Each gap resolved with a default path that does NOT block shipping. Marked `[ADAM_CONFIRM]` where a decision is needed before a worker proceeds; `[SHIP_ITERATE]` where the proposed default is safe to ship without confirmation.

### G1 — Suggestions Table
**Resolution:** `[ADAM_CONFIRM]` → Propose **Option A**: separate `suggestions` table. DDL in W0 brief above. If Adam confirms Option B (derived view), W0 writes the view instead and W3 adjusts query. **Default:** Option A. Unblock path: W3 handles missing table gracefully (empty array, not crash).

**DDL (Option A):**
```sql
CREATE TABLE suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  rule_id text NOT NULL,
  impact_score integer CHECK (impact_score BETWEEN 0 AND 100),
  agent_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','dismissed','accepted')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own business suggestions"
  ON suggestions FOR ALL
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));
```

### G2 — Automation Schedules Table
**Resolution:** `[SHIP_ITERATE]` — Schema confirmed by PRD description. DDL in W0 brief. No Adam confirmation needed.

### G3 — Competitors Table
**Resolution:** `[ADAM_CONFIRM]` → Propose **Option A**: standalone `competitors` table (not just strings in scan_engine_results). DDL:
```sql
CREATE TABLE competitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own business competitors"
  ON competitors FOR ALL
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));
```
**Unblock path:** W7 (Competitors wiring) uses `get_competitors_summary` RPC which returns competitor names from scan data — page renders even without competitors table. Table needed only for "Add competitor" flow.

### G4 — Global Kill Switch Storage
**Resolution:** `[SHIP_ITERATE]` — **Option B+A combined**: `automation_settings` table with `automation_paused boolean` column (see W0 DDL). Single row per user. Kill switch = UPDATE automation_settings SET automation_paused = true WHERE user_id = $uid. W8 implements.

### G5 — Workspace Tier Gate (Discover)
**Resolution:** `[SHIP_ITERATE]` — Default: **Discover = upgrade modal on Workspace route visit** (full paywall, not read-only). Rationale: Workspace is the "do the work" surface — giving Discover a read-only view creates confusion and reduces upgrade motivation. W5 implements: Discover users clicking "Open in Workspace →" in PreviewPane see `<PaywallModal feature="workspace" />`.

### G6 — Re-scan Rate Limit Enforcement
**Resolution:** `[SHIP_ITERATE]` — Implement via `scans` table query: `SELECT COUNT(*) FROM scans WHERE business_id=$bid AND scan_type='manual' AND scanned_at > NOW() - INTERVAL '1 day'`. If count >= 1 AND plan = 'build', disable re-scan button with tooltip "1 manual scan per day on Build plan." W4 implements.

### G7 — Archive URL Probe
**Resolution:** `[SHIP_ITERATE]` — **Deferred.** W9 implements "Mark as published" → sets status + URL + Inngest event fire only. Inngest URL probe function (48h check) is Wave 4 work. Archive shows "Pending verification" for newly published items. This is not misleading if labeled "Verification runs within 48 hours." Code comment in route marks it as deferred.

### G8 — Preview Account Routing
**Resolution:** `[SHIP_ITERATE]` — **Option C**: Absence of `subscriptions` row = preview account. Middleware checks: `IF auth.user exists AND subscriptions IS NULL → skip onboarding → land on /home WITH banner "You're in preview mode — upgrade to unlock agents."` W10 implements. No new column needed.

### G9 — Content Item Inbox vs Archive Split
**Resolution:** `[SHIP_ITERATE]` — Clarified routing: **Inbox** shows `status IN ('draft', 'awaiting_review')`. **Archive** shows `status IN ('approved', 'published')`. "Approved" items move OUT of Inbox once approved (no overlap). The status transition is: `draft → awaiting_review → approved → published`. Reconcile `'in_review'` (DB) vs `'awaiting_review'` (types): use DB value `'in_review'` in queries, map to display string `'Awaiting review'` in UI. W5 (Inbox) and W9 (Archive) both follow this convention.

### G10 — Scan Score Scale (0-10 vs 0-100)
**Resolution:** `[SHIP_ITERATE]` — DB schema confirms `overall_score integer CHECK (0-100)`. Score is 0-100. `WoundRevealResult` component currently renders `6.7` (0-10 mock). W4 does not touch the public scan page — that is a separate worker scope. Add a note in W4 acceptance: "Ensure score display in ScansClient uses integer (0-100), not decimal." Public `/scan` page fix is Wave 4 scope (lower priority than authenticated pages).

---

*End of Wave 3 Rebuild Plan.*
