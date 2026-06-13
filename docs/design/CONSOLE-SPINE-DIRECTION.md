# Console Spine — Self-Serve Surface Design Direction (Phase 1, LOCKED)

**Status:** CANONICAL for the Phase 1 self-serve build. Converged via T5 design workflow `wf_2480bcdc-168` (2026-06-12), 5 directions explored + scored by design-critic, Opus synthesis.
**Parent:** `MANUAL-MODE-MODEL.md` · `docs/design/DESIGN-VISION.md` · `docs/design/CRAFT-SYSTEM.md`. Craft-parity bar = the shipped #173 dashboard.
**Scope:** Phase 1 = design + full mock data, ZERO backend wiring.

## Winning angle
**Calm Editorial Console** — white-canvas editorial restraint as the frame, with three ideas grafted from runners-up:
- **Behavioral mode toggle** (from Data-Dense Cockpit): the toggle changes what the page *does*, not just its color.
- **Progressive input collapse** (from Guided/progressive): input panel auto-collapses to a 44px summary bar after a run.
- **Editorial type contract carries organization** (from Editorial-Led): type + mono do the structural lifting, not chrome.

Rejected: pure Data-Dense Cockpit (row-density on every surface breaks "calm density / one focal"; over-indexes for power users when the buyer is a dentist) and pure Guided (too narrow for Prompt Explorer + Competitor Tracker, which ARE data tables and earn density). Density is allowed ONLY where the surface's data demands it (Prompts/Competitors/Archive tables).

---

## A. The Tool-Page Skeleton — "the Console Spine" (5 zones + history, identical across all 9)

Container: `max-w-[880px]` single-column focused document, centered in the existing `DashboardShell` main area. NOT a multi-pane cockpit. Vertical rhythm = M12 (header→input 32px, input→run 24px, run→ledger 32px, ledger→output 40px). Never a global `space-y-8`.

**Depth staging (M1, three felt tiers):** TIER-1 hero (one/page) = the populated Output card (`--shadow-card-hero`) OR the Live Ledger while running. TIER-2 = Input Panel (`--shadow-card`). TIER-3 recede = Context Header micro-stats + collapsed input summary (`.card-inset`, surface-warm, 1px border, no shadow).

**Type contract (M2, visibly stepped):** STEP-1 = 64px Geist Mono -0.03em tabular, the single hero figure/page. STEP-2 = 30px InterDisplay-Medium -0.02em tool-purpose heading. STEP-3 = 12px Inter-600 uppercase tracking-[0.08em] #9CA3AF eyebrow (business name). STEP-4 = 15px Inter #6B7280 body. M11: every real number is Geist Mono tabular-nums; all prose Inter.

**Asymmetry (M3):** spine is single-column; asymmetry lives WITHIN zones (Context Header weighted 2-up; Output tables = dominant column + rail). Kill all N-equal grids.

- **Zone 1 — Context Header** (TIER-3 inset, neutral/your-territory): left dominant = eyebrow (business) + tool-purpose heading + one-line "what this does for you"; right narrow rail = the single tool-relevant visibility signal as a micro-stat (STEP-1 mono number + label + M4 micro-sparkline, last ~5 runs, flat baseline when null — never fake data). Neutral = level 1 of the 3-level color education.
- **Zone 2 — Input Panel** (TIER-2): agent inputs PRE-FILLED + fully editable, per surface. Page-lock / tier-lock indicators inline. GRAFT: after a successful run, auto-collapse to a 44px TIER-3 summary bar ("Optimized 3 pages · ChatGPT, Gemini · Change inputs"), re-expand on click.
- **Zone 3 — Run Control** (signature primitive): the `<ModeToggle>` directly above the Run button — "who runs this → go" as one spatial unit. Level 2 of color education. States: enabled / cap-exhausted (disabled + quiet routing to violet mode) / tier-locked.
- **Zone 4 — Live Pipeline Ledger** (agent engine room, VIOLET STRUCTURE M6): THE signature kinetic moment, the ONLY animated set-piece/page. Reuse shipped scan-ledger language: `ScanningLedger+EngineRow → PipelineLedger+StageRow`. Stages (plan→research→do→qa→summarize or plan→do→qa) render as hairline-divided rows (no per-row card boxes), state glyph per row (DONE = filled VIOLET check, ACTIVE = spinning violet ring + live mono substep + shimmer, QUEUED = hollow grey dimmed, ERROR = "couldn't reach X"). Rows fade-up 40ms stagger (M9), reduced-motion fallback. Zone reads violet at arm's length (`--color-agent-tint #EEEAFD` ground + `rgba(110,86,240,0.12)` hairline + violet top-accent). Live substep stream line underneath (mono cross-fade). On completion: 250ms hold → lift-out → hand to Zone 5 (reuse shipped clearing/onCleared pattern).
- **Zone 5 — Output Zone** (TIER-1 when populated, neutral review territory): routes by agent type — GATED (Content, Blog) = markdown diff/long-form editor → blue "Send to approvals" → EXISTING `/approvals`; AUTO-PUBLISH (Schema) = JSON-LD preview + validity + Copy/Download/Inject → show what+where published; INTERNAL-REPORT (Prompts, Competitors, Archive) = inline table+drawer. M5 serif beat: exactly one Fraunces italic on the verdict WORD only.
- **Zone 6 — History link** (persistent): quiet "View in Run History →" to `/archive`.

**All four states on every surface** (loading skeletons that read as the real shape; empty = M8 two-tier recovery with warm character glyph; error always names a real recovery action; populated). Mock data extends DEMO_DAY1 and must feel FULL.

## B. The Mode Toggle (shared `<ModeToggle>` — category-defining primitive)
Two-segment inline pill (~rounded-lg, ~40px). Inactive = neutral ground / #6B7280. ACTIVE segment fill encodes WHO works:
- Left "Run it myself" ACTIVE → blue `#3370FF` fill/inset ring + ink text. Consequence: Zone 2 stays expanded, Zone 3 shows the blue Run button. Copy: "You drive. Review and approve every step."
- Right "Let Beamix handle it" ACTIVE → violet-tint `#EEEAFD` fill + violet `#6E56F0` inset ring + ink text (VIOLET IS NEVER A SOLID BUTTON). Consequence: Run button REPLACED by quiet "Configure schedule →" + allotment explainer ("Beamix runs this weekly · 6 of 10 autonomous runs left"). Done-for-you tier → "uncapped · concierge".

The Automation Center reuses the SAME `<ModeToggle>` per agent row.

## C. Nav / IA (no sidebar bloat)
Add exactly ONE collapsible "Tools" disclosure group in `sidebar.tsx` (between top-level items and Settings). Group header links to `/automation` (the Mode Hub); chevron expands children: Prompts(`/prompts`), Content(`/content`), Schema(`/schema`), Competitors(`/competitors`), Off-Site(`/offsite`), Blog Studio(`/blog-studio`), Run History(`/archive`). Collapsed icon-rail = single Tools glyph. Active state unchanged (`bg-[#EFF4FF]` + blue text). +1 nav section, zero restructuring.

## D. The 9 surfaces on the spine
1. **Prompt/Query Explorer** `/prompts` (NEW, internal-report): tracked-prompt table + per-prompt drawer (fan-out TREE = its data signature + intent + co-citation) + uncited gap list. Density allowed. Biggest "feels empty" fix.
2. **Content Editor** `/content` (NEW, gated): 3 tabs (Optimize/Refresh/FAQ) + page-lock → markdown DIFF editor → Send to approvals.
3. **Schema Generator** `/schema` (NEW, auto-publish): URL + type → JSON-LD + validity (STEP-1 mono figure) + Copy/Download/Inject.
4. **Run History** `/archive` (stub→real, internal): run table (agent·mode·status·timestamp·cost·snippet) + filters + re-openable drawer (ledger replays as trace) + "Run again".
5. **Competitor Tracker** `/competitors` (stub→real, internal): add/track competitors + chips, Share-of-Voice per engine over time, gap table, co-citation; gap click → deep-link to tool page.
6. **Automation Center** `/automation` (stub→real): THE MODE HUB — agent rows (agent·mode·`<ModeToggle>`·allotment·schedule·Open tool→·3-mode explainer). Not the 5-zone spine; a coherent sibling.
7. **Citation/Off-Site Manager** `/offsite` (NEW): 5 tabs (Citations/Directories/Entities/Reputation/Community) collapsing 4 hidden agents; tables, click-to-track, run-to-act.
8. **Blog Studio** `/blog-studio` (NEW, gated): topic input + Discover tier-lock → long-form markdown editor → Send to approvals.
9. **Dashboard/Outcomes** (#173, SHIPPED): DO NOT redesign. The spine sits beside it at equal craft, reusing its exact vocabulary.

## E. Craft-parity / de-AI checklist (design-critic enforces per surface)
One TIER-1 focal + one Fraunces beat + one signature detail/page; 4-step type contract visibly stepped; NO N-equal grid; violet zone glanceable + violet never a solid button; all 4 states with two-tier recovery; every number mono; entrance fade-up 40ms stagger ≤200ms behind `prefers-reduced-motion`; the 8 AI tells all absent. Screenshots against PROD (demo account) or local **webpack** dev (turbopack-dev font blocker, CRAFT-SYSTEM §⚠️).
