# WF-1 UI Excellence Audit — Synthesis

**Scope:** dashboard · analytics · sentiment · traffic (all four shipped Console-Spine product pages).
**Headline:** All four verdict NEEDS_WORK, none NEEDS_REDESIGN. The Console Spine bones are genuinely strong (asymmetric hero, 64px mono figure, real verdict sentence, TIER plan). The product fails the competitor *finish* bar on three repeated, shared-component-rooted defects — fix those once and the whole product steps up.

P1 count by page: dashboard 5 · analytics 4 · traffic 4 · sentiment 4.

---

## 1. SYSTEMIC PATTERNS (fix once → cascades)

### S1 — The "wall of identical blue chips" bug (BRAND-LAW leak, tell #8) — TOP PRIORITY
The single most "AI-template" defect in the product, and it is a literal correctness bug, not a taste call. Every filter chip in a scope rail renders its *active* state as `bg-[#EEF2FF] text-[#3370FF]`, and because all filters **default to on**, the entire rail is a solid blue column. The five-engine / N-crawler color-identity system collapses into one flat blue stripe, and blue (BRAND LAW: blue = the user's ACTION, one accent per surface) becomes meaningless decoration.

Appears on: **analytics** (P1.1, engines + topics), **traffic** (P1-1, crawlers + page-paths). Same pattern, same fix.
- `apps/web/src/components/console/AnalyticsScopeRail.tsx:101-106`
- `apps/web/src/app/(protected)/analytics/_components/TopicFilterGroup.tsx:36-41`
- `apps/web/src/app/(protected)/traffic/_components/TrafficScopeRail.tsx:68-73`
- `apps/web/src/app/(protected)/traffic/_components/PagePathFilterGroup.tsx:41-46`

**The fix is one rule:** active/default-on chip = neutral label (`#374151` / `#0A0A0A`), transparent ground, the **color swatch carries the engine/bot identity**. Reserve the `#EEF2FF` blue ground for hover/focus only. This is identical logic in 4 files — extract a shared `<FilterChip>` primitive so it can never drift again (see S1-fix below).

### S2 — Engine/bot color swatch is sub-legible (8px dot on a tinted ground)
The one signal that distinguishes engines is `h-2 w-2` (8px) sitting on the blue active ground — reads as a faint speck, dies at a glance. Directly compounds S1: once the chip ground goes neutral, the swatch must also grow (10px / `h-2.5 w-2.5` or a 3px colored left-edge bar) to actually carry identity. Same files as S1 (`AnalyticsScopeRail.tsx:108-113`, `TrafficScopeRail.tsx`). Bundle the swatch bump into the same `<FilterChip>` extraction.

### S3 — Flat uniform card depth (tell #1) — depth is told in class names, not felt in pixels
Every page lays its instruments out as near-identical full-width `card-console p-6` surfaces on one global `space-y-8` / `space-y-6`. The TIER-1→TIER-3 staircase exists in comments but not in rendered shadow/inset. The eye reads "hero + a flat deck," never stepping down.

Appears on: **analytics** (P1.3), **sentiment** (P1#1), **traffic** (P2-1), **dashboard** (P2-6 residual). The shared fix is the same move everywhere: demote at least one secondary surface per page to TIER-3 `.card-inset`, and replace the single global gap token with relationship-driven gaps (tight to a proof, wide between sections). The `.card-console` / `.card-inset` *tokens* are shared; the per-page *application* (which surface to demote) is owned per-page — so it splits cleanly across polish workers.

### S4 — Missing-state coverage (broken-until-proven) — a hard PASS gate, not a polish item
Only populated-desktop was reliably captured; several pages have no empty/loading/error/mobile screenshots at all, and the *empty* state is the production default for every real new user. This is a process/QA gap, not a per-component bug, but it blocks PASS on every page.
- **sentiment** P1#4 — only success captured; empty is the real default (`page.tsx:56`).
- **traffic** P1-3 — only populated captured; 5-col fixed-width table (`ContentPerformanceTable.tsx:50`) is a HIGH-RISK mobile-overflow that is totally unverified.
- **analytics** — empty/loading/error + below-fold not rendered.
- **dashboard** — empty + mobile captured (best coverage of the four).

### S5 — No Fraunces serif beat on the data pages (tell #6) — needs a global DECISION, not drift
analytics, traffic, and sentiment each *individually* opt out of the serif beat in a per-file comment, each deferring it to "another page." Net result: the serif budget is never actually spent on a data screen, so the rubric's "one serif beat per screen" is satisfied nowhere and reads as the serif being forgotten. This must become an explicit DESIGN-VISION note (either "data pages are deliberately serif-free, hero earns warmth via phrasing" OR "each screen gets one Fraunces verdict word"), not four independent file comments. Owner: design-lead, one ruling, then each page complies.

### S6 — "DeltaChip" mixes mono + sans in one 12px pill (minor, but shared)
The same fussy pattern (mono delta + sans "vs. previous 30d" crammed in one pill) recurs: analytics P3-10 (`SovHeroPanel.tsx:104-122`), traffic P3-1 (`TrafficHeroPanel.tsx:50-54`). If a shared `DeltaChip` component exists, fix once; if duplicated, dedupe. Low priority.

---

## 2. WORST PAGES — ranked worst-first by craft gap vs competitor bar

1. **dashboard** — 5 P1. Worst because the gap is *strategic*, not cosmetic: the trend-over-time (the one thing a GEO buyer watches — "am I climbing?") is an invisible 64px corner sparkline, so the flagship view answers the core question weaker than both Profound and Plausible (both lead with a dominant trend chart). Also carries two mobile-hero layout breaks (ragged 3-line wrap, dead vertical space) and a blue-as-prose brand leak. Highest-traffic page + biggest competitor gap = rank 1.
2. **analytics** — 4 P1, but the most structurally ambitious page and the most damaged by S1/S2 (two correctness-grade bugs: all-blue chips + invisible swatches) plus the grey donut-center contradicting its own blue arc/label (reads like you're losing). High blast radius, mostly mechanical fixes.
3. **traffic** — 4 P1. Same S1 blue-wall bug, plus an under-designed rail with dead vertical space, a hero figure duplicated verbatim in its own verdict (robs TIER-1 singularity), and the worst unverified-state risk (5-col fixed table at 375px). Honest but unfinished.
4. **sentiment** — 4 P1. Strongest architecture of the four; the gap is purely "depth told not felt" (flat tier, under-weighted 18px hero verdict vs 30px rubric, uniform right-rail tiles) plus the empty-state-never-rendered gate. No shared blue-wall bug (no scope-rail filter chips). Closest to PASS.

---

## 3. SHARED-COMPONENT FIXES (concrete paths, cascades to many pages)

- **S1+S2 — extract `apps/web/src/components/console/FilterChip.tsx`** (new shared primitive): neutral default/active label, transparent ground, hover/focus-only blue, 10px (or left-edge-bar) color swatch. Refactor all four call sites to use it: `AnalyticsScopeRail.tsx`, `TopicFilterGroup.tsx`, `TrafficScopeRail.tsx`, `PagePathFilterGroup.tsx`. Kills the most AI-template defect across analytics + traffic in one change and prevents future drift. **Do this FIRST, before per-page polish, so polish workers branch off a clean chip.**
- **S3 — depth tokens** in the global stylesheet / `.card-console` + `.card-inset` definitions (`apps/web/src/app/globals.css` or the console design-token file): confirm `.card-inset` reads as a genuine TIER-3 recede (lighter/inset, not just a class name). The *token* is shared; the per-page *application* (which surface to demote) is owned per-page.
- **S6 — `DeltaChip`**: if a shared component exists under `apps/web/src/components/console/`, fix the mono/sans split once; otherwise dedupe the two inline copies. Low priority.

---

## 4. POLISH PLAN — disjoint per-page ownership

**Ordering constraint:** the shared `FilterChip` extraction (S1+S2) lands FIRST as its own change (own worktree, own owner), because analytics-polish and traffic-polish both consume it. After it merges, the four page-polish workers run in parallel on fully disjoint file sets — no two workers touch the same file.

- **shared-filterchip** (heavy-polish, blocker): create `console/FilterChip.tsx`, refactor `AnalyticsScopeRail.tsx`, `TopicFilterGroup.tsx`, `TrafficScopeRail.tsx`, `PagePathFilterGroup.tsx`. Fixes S1 + S2 globally. Must merge before analytics/traffic polish.
- **dashboard** (heavy-polish): owns `ScoreHeroPanel.tsx`, `FoundingCohortPanel.tsx`, `VisibilityScorePanel.tsx`, `EngineMicroSparkline.tsx`. Fix P1-1 (mobile verdict wrap → ~22px), P1-2 (mobile ring shrink + left-align + compress padding), P1-3 (blue prose → `#0A0A0A`), P1-4 (add dominant score-trend strip near hero — biggest competitor gap), P1-5 (collapse empty-state engines to one quiet line). Most work of the four; near-redesign of the hero+trend region.
- **analytics** (heavy-polish): owns `SovHeroPanel.tsx`, `AnalyticsWorkbench.tsx` (consumes shared FilterChip — does NOT edit rail/chip files). Fix P1.3 (vary gaps + demote avg-position to `.card-inset`), P1.4 (tint donut center `#3370FF` or make you-arc dominate). P1.1/P1.2 handled by shared-filterchip. Capture missing states.
- **traffic** (heavy-polish): owns `TrafficHeroPanel.tsx`, `TrafficWorkbench.tsx`, `ContentPerformanceTable.tsx` (consumes shared FilterChip — does NOT edit rail/chip files). Fix P1-2 (anchor rail bottom with mono summary/legend, vary rhythm), P1-4 (recast verdict so 1,284 isn't doubled). P1-1 handled by shared-filterchip. P1-3: capture all states + verify 5-col table at 375px (likely needs a mobile table redesign — escalate if overflow confirmed).
- **sentiment** (light-polish): owns `SentimentPanel.tsx`, `SentimentThemes.tsx`, `HallucinationList.tsx`, `RecoveryTimeline.tsx`, `ThemeRail.tsx`, `SentimentBadge.tsx`. Fix P1#1 (demote one surface to `.card-inset`), P1#2 (raise verdict to 30px + heavier hero shadow), P1#3 (right-rail internal hierarchy, vary heights, cap count), P1#4 (capture empty/loading/error). No FilterChip dependency — can start immediately, parallel with shared-filterchip.

**S5 (Fraunces ruling)** is a design-lead decision, not a worktree — resolve before analytics/traffic/sentiment polish so each page complies with the same call.
