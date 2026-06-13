# WF-2 UI Excellence Audit — Synthesis

**Date:** 2026-06-12
**Scope:** 6 Console-Spine tool surfaces — market, prompts, content, schema, competitors, offsite
**Bar:** Profound / Otterly editorial-density data surfaces
**Aggregate verdict:** 6 of 6 NEEDS_WORK. 0 redesigns required — the bones (Console Spine, type contract, blue/violet roles, two-tier empty states) are correct on every page. Every failure is a **shared-component polish gap** or a **coverage gap**, not a structural one.

> Path note: the audited tool surfaces live on the WF feature branch, not yet merged to this worktree. File paths + line numbers below are quoted from the per-page findings docs (authoritative). All `ContextStat.tsx`, `ToolPage.tsx`, `RunControl.tsx`, `EngineMicroSparkline.tsx`, `ModeToggle.tsx`, `EmptyState.tsx`, `SerifVerdict.tsx` references resolve to the shared `components/tools/` (+ `components/dashboard/`) layer once that branch lands.

---

## 1. Systemic patterns (fix once → cascades to many pages)

These are NOT six separate bugs. They are a handful of shared-component / shared-token defects that surface on every page that consumes them. Fixing the shared file fixes every page at once.

### S1 — The signature M4 micro-sparkline renders as a stranded stroke / invisible baseline on EVERY hero rail
The single craft detail meant to make these surfaces feel designed actively reads as a rendering glitch.
- **schema**: idle `currentScore=null` → flat 1px `#E5E7EB` line, indistinguishable from nothing; bare number floating (P1#2).
- **offsite**: stranded green diagonal pen-stroke, no baseline/anchor — "stray mark" (P1.1).
- **content**: fed hardcoded fake points `[28,31,30,34,avgScore]` — violates M4 "never fake data" (P2-3).
- **Shared cause:** `EngineMicroSparkline.tsx:40-59` (null/short-series rendering has no visible baseline + no min size) consumed via `ContextStat.tsx:42-47` on every tool hero.

### S2 — `ToolPage.tsx` centered `max-w-[880px] mx-auto` produces dead gutters / off-center "broken layout" on EVERY page
The shared page shell is the single most-cited P1 across the set.
- **prompts**: whole column floats center-right against a dead left gutter — "reads as a layout bug" (P1-1).
- **offsite**: lower-right third + lower third of the 1440 canvas is empty white (P1.3).
- **content**: lower ~30% dead white gutter below the run button, no Zone 5 (P1-4).
- **schema**: bottom ~40% dead whitespace, EmptyState shoved below fold (P1#3).
- **Shared cause:** `ToolPage.tsx:79` (`mx-auto w-full max-w-[880px]`) + the idle composition pushing Zone 5 below the fold via `mt-10` (`ToolPage.tsx:143`).

### S3 — The full-width solid `#3370FF` run button is an over-weighted full-bleed slab on EVERY page (tell #5)
- **prompts** (P1-4), **content** (P1-2), **schema** (P2#9/#5 orphaned-CTA), **offsite/market** (run-control weighting). Same `RunControl.tsx:90-98` default `Button variant=default w-full`.
- **Shared cause:** `RunControl.tsx:90-98` ships a full-bleed CTA; should size-to-content + left-anchor, clustered with the ModeToggle as ONE "who runs this → go" unit.

### S4 — Run-control is two disconnected rows, not one cluster (M1/M12) on EVERY page
ModeToggle pill + full-width CTA separated by the same `gap-4` used between unrelated blocks → no enclosure, no shared ground.
- **schema** (P2#5), **prompts** (P2-1), **content/offsite** (cluster). **Shared cause:** `RunControl.tsx:48-98`.

### S5 — `#3370FF` ACTION accent leaks into data-viz / nav-collision (brand law) across pages
- **offsite**: ImportanceBar filled `#3370FF` for ≥75 — named anti-pattern (P1.2).
- **competitors**: gap-table Action pill + all engine badges share one blue ground → monotone blue wall (P2#8).
- **market**: scope-rail five identical blue-tint pills collide with global-nav active-blue (P2#5).
- **Shared cause:** accent token used as a data/decoration fill instead of score-band / data-series tokens.

### S6 — The you-vs-agents (blue-vs-violet) split is invisible at arm's length (M6 / tell #8)
The agent side carries no violet structure (no `#EEEAFD` ground / hairline), so the spatial signal collapses to flat.
- **prompts** ModeToggle agent side (P2-1), **market** agent band on chart (P1#3), **schema/offsite/content** agent panels. **Shared cause:** `ModeToggle.tsx` agent segment + chart agent-band styling.

### S7 — Missing / silently-failing Fraunces serif beat (M5 / tell #6) across pages
- **content** (P2-1: none in idle), **schema** (P2#4: none anywhere), **competitors** (P1#2: SerifVerdict "narrowing" not visibly Fraunces — possible turbopack-dev font fallback). **Shared cause:** `SerifVerdict.tsx:19-25` font load + leads not placing a beat in idle. CRAFT-SYSTEM already logs a turbopack-dev font blocker — **this may be a real font-loading bug, not per-page omission.**

### S8 — Geist Mono used for prose / `tabular-nums` on strings (M11 leak)
- **prompts** EngineChip in mono (P1-3), **competitors** narrative % in Inter instead of mono (P2#9), **offsite** domain string with `tabular-nums` (P3#12). **Shared cause:** EngineChip + figure-vs-prose type contract not enforced.

### S9 — Quota / cap stated 2–3 times in conflicting framings (M12 "say each true thing once")
- **schema** (3 framings: "17 RUNS LEFT TODAY" / "3 of 20 used" / "17 runs left today" — P1#1, P2#7), **prompts/content** echo. Hero figure is a rate-limit counter, not a value signal (M10 — eye lands on least-important fact). **Shared cause:** ContextStat hero fed quota; RunControl + input cap-line duplication.

### S10 — SYSTEMIC COVERAGE GAP — 1 of 6 states captured on every page (blocks PASS)
Only `populated-desktop.png` exists per page (and schema's is mislabeled — it's the idle state). empty / loading / error / success / mobile-375 are unverified everywhere. Fixed-px grid columns (`grid-cols-[1fr_140px_80px_100px]`, offsite OffsiteTabs.tsx:215) will overflow at 375px. **No page can earn a PASS until all 6 states + mobile-375 are captured from a prod/preview build (not turbopack-dev).**

---

## 2. Worst pages — ranked worst-first by craft gap

1. **offsite** — 6 P1s, the most of any page. Stranded sparkline glitch + brand-law data-viz violation + two-system Score column + dead canvas + dev-debug-strip captured in chrome + 5 unverified states. Widest gap to the Profound dense-table bar.
2. **prompts** — 4 P1s, but the worst single structural read: the whole content column looks mis-centered/broken (S2 at its most severe), plus a quantitatively thin output table vs Profound's 110-prompt table, mono engine names, and the over-weighted CTA slab.
3. **content** — 4 P1s including a true data bug: two byte-identical "Teeth Whitening" picker rows (dedup bug reading as AI filler), a single-page "average" hero that equals the row below it, fake sparkline points, dead lower gutter.
4. **competitors** — 4 P1s: SoV hero chart reads as a broken sparkline (range math + clipped competitor line + one orphan gridline), possible silent Fraunces font failure, empty-state ships to all real users and was never captured, header right dead-zone.
5. **market** — 3 P1s: dual-hero focal (blue 48,200 vs donut 20,800) breaks one-TIER-1 law, donut renders ~75% empty grey ring (reads as loading skeleton), floating disconnected chart ReferenceLine label.
6. **schema** — 3 P1s and explicitly "polish gap, not redesign": quota-as-hero (stated twice), invisible sparkline, dead lower 40% with EmptyState below fold. Cleanest bones of the six.

---

## 3. Shared-component fixes (concrete paths — each cascades to multiple pages)

| Fix | File (on WF branch / `apps/web/src/components/...`) | Cascades to | Systemic |
|-----|------|-------------|----------|
| Add visible 1px `#E5E7EB` baseline; enforce min 64×24px; never render a bare flat line for null/short series; reject fake-point fallback | `components/dashboard/EngineMicroSparkline.tsx:40-59` + `ContextStat.tsx:42-47` | schema, offsite, content, market, prompts | S1 |
| Left-anchor or content-width the working column; stop pushing Zone 5 below the fold; widen for table-dense tabs | `ToolPage.tsx:79` + `ToolPage.tsx:143` (`mt-10`) | ALL 6 | S2 |
| Size run button to content + left-anchor; cluster CTA with ModeToggle under one shared ground (enclosure, tight gap) | `RunControl.tsx:48-98, 90-98` | ALL 6 | S3, S4 |
| Give the agent (violet) segment a `#EEEAFD` ground + hairline so blue/violet reads at arm's length | `ModeToggle.tsx` (agent segment) | prompts, schema, content, offsite, market | S6 |
| Verify Fraunces actually loads on the audited surface (turbopack-dev fallback suspected); make beat mandatory in idle | `SerifVerdict.tsx:19-25` + font config | content, schema, competitors | S7 |
| Switch data-viz fills off the `#3370FF` accent to score-band / data-series tokens; reserve accent for CTA + active nav only | `ImportanceBar` (offsite OffsiteTabs.tsx:115-119); competitors gap-table CompetitorPanel.tsx:409-425; market MarketScopeRail.tsx:57-86 | offsite, competitors, market | S5 |
| EngineChip → Inter 500 (not Geist Mono); drop `tabular-nums` on alpha strings; enforce mono=numbers / Inter=prose | `EngineChip` (prompts PromptTable.tsx:27); competitors CompetitorPanel.tsx:515-522; offsite OffsiteTabs.tsx:264 | prompts, competitors, offsite | S8 |
| Capture all 6 states + mobile-375 from prod/preview (no turbopack); fix fixed-px grids for 375px | screenshot pipeline + `OffsiteTabs.tsx:215` grid | ALL 6 | S10 |

**Ownership rule for shared fixes:** S1, S2, S3/S4, S6, S8 touch files every page imports. They MUST be done in a dedicated **shared-components worktree FIRST and merged**, before per-page polish workers start — otherwise parallel workers collide on `ToolPage.tsx` / `RunControl.tsx` / `EngineMicroSparkline.tsx`. The per-page plan below assumes the shared pass has landed and only lists page-LOCAL files.

---

## 4. Polish plan — disjoint per-page ownership

**Sequencing:** Wave A (shared-spine) runs alone and merges first. Wave B (six page workers) runs fully parallel — each owns only its page-local component file(s) listed below, so no two workers touch the same file. The screenshot/coverage worker runs last against merged output.

### Wave A — shared-spine (must merge before Wave B)
- **owner:** `wf2-shared-spine`
- **files (exclusive):** `EngineMicroSparkline.tsx`, `ContextStat.tsx`, `ToolPage.tsx`, `RunControl.tsx`, `ModeToggle.tsx`, `SerifVerdict.tsx`
- **fixes:** S1 (sparkline baseline/min-size/no-fake), S2 (column anchor + Zone-5 placement), S3+S4 (CTA size + run-control cluster), S6 (violet agent ground), S7 (Fraunces font load).

### Wave B — six parallel page workers (page-local files only)
Each fixes residual page-specific P1s + applies the page-local half of any data-viz/type leak.

1. **offsite** — heavy-polish. Owns `OffsiteTabs.tsx`. P1.2 (data-viz off accent → score-band tokens), P1.4 (unify Score/Status to one chip language), P1.5 (remove dev DEMO-STATES from captured chrome / capture prod), P1.3 (earn lower canvas via activity strip). S1/S2/S3 inherited from Wave A.
2. **prompts** — heavy-polish. Owns `PromptTable.tsx` + page-local prompts `page.tsx`. P1-2 (thicken table: engine micro-sparkline + number-over-label + trend chip), P1-3 (EngineChip → Inter 500), P2-2 (verdict line to STEP-2 30px InterDisplay). S2/S3 inherited.
3. **content** — heavy-polish. Owns `ContentTabs.tsx` + `content.ts` fixture. P1-1 (collapse duplicate "Teeth Whitening" rows — real dedup bug), P1-3 (re-label single-page "average" hero or make portfolio metric w/ delta+band), P2-3 (sparkline real history not fake points — coordinate w/ Wave A S1), P1-4 (idle Zone 5 ghost preview), P2-1 (idle Fraunces beat).
4. **competitors** — heavy-polish. Owns `ShareOfVoice.tsx` + `CompetitorPanel.tsx`. P1#1 (fix SoV range math + raise height + area-fill so it stops reading as a broken sparkline), P1#4 (promote a top-right primary control, kill header dead-zone), P2#8 (quiet hover actions, break monotone blue wall), P2#9 (narrative % → Geist Mono). P1#2 Fraunces verify inherited from Wave A S7; P1#3 empty-state capture → coverage worker.
5. **market** — light-polish. Owns `MarketHeroPanel.tsx` + `MarketScopeRail.tsx` + `PromptVolumeChart.tsx`. P1#1 (demote donut-center to ~16px + drop eyebrow → one TIER-1 focal), P1#2 (fix donut dasharray so the grey ring isn't an empty/loading read, or label it "unclaimed"), P1#3 (anchor agent ReferenceLine label to the line + faint `#EEEAFD` band), P2#5 (scope-rail single-selection state, off the all-blue pattern).
6. **schema** — light-polish. Owns schema-local `page.tsx` + `JsonLdPreview.tsx`. P1#1 (hero = validity signal not quota; state cap once — M10/M2), P1#3 (remove redundant below-fold EmptyState OR fold guidance into primed input — one focal), S9 quota-dedupe (page-local). S1 invisible-sparkline inherited from Wave A.

### Wave C — coverage (runs against merged Wave A+B)
- **owner:** `wf2-coverage`
- **scope:** capture all 6 states + mobile-375 for every page from a **prod/preview build (no turbopack)**; fix the fixed-px grid `grid-cols-[1fr_140px_80px_100px]` (OffsiteTabs.tsx:215) at 375px → stacked/card mobile layout; verify success-state surfaces don't introduce a second TIER-1 hero (M1). No page earns PASS until this completes (S10).
