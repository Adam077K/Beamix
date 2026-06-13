---
title: UI Excellence — Master Consolidation + Polish Plan
date: 2026-06-12
author: ceo-ui-excellence
inputs: 27 per-page findings docs + 5 group syntheses (WF-1..WF-5)
branch: feat/phase1b-b25-intelligence (PR #183), full source in worktree b25-integrate
reference bar: docs/design/references/competitor (Profound + Otterly) + #173 dashboard exemplar + CRAFT-SYSTEM (8 tells / 12 moves)
status: design-only, mock data, ZERO backend wiring
---

# Verdict at a glance

27 pages audited against the rendered screenshots + competitor refs + rubric. **Every page is NEEDS_WORK or CRITICAL_ISSUES** — none PASS the excellence bar yet. The gap is overwhelmingly **uniformity** (the rubric's thesis): the right tokens applied flatly, no felt depth, dead-center-in-a-void layouts, the signature sparkline rendering as a glitch, the blue=you/violet=agents promise invisible at arm's length, and the one Fraunces beat spent nowhere.

The single most important finding: **the craft gap is mostly SHARED.** A handful of shared components/tokens, fixed once, cascade craft to every page. Foundation-first is therefore mandatory, not optional.

# The 6 systemic tells (cross-surface, ranked by blast radius)

1. **Dead-center / single-column-in-a-void** (tell #5) — 6+ pages float content in `max-w-Nxl` columns or centered cards with vast empty gutters instead of `[1fr_rail]` asymmetry. Root causes: shell `<main>` has zero horizontal padding (`dashboard-shell.tsx:80-82`) so every page reinvents its frame and they disagree; `ToolPage.tsx:79` `max-w-[880px]` off-centers tool pages; auth/onboarding/scan-free centered stacks.
2. **Signature micro-sparkline renders as a glitch** (tell #4) — `EngineMicroSparkline.tsx` has no visible baseline / min size for null/short series and accepts fake points; renders as a stranded stroke or invisible flat line on schema/offsite/content/market/competitors/blog-studio. The one craft detail actively reads as broken.
3. **Flat uniform depth** (tells #1/#3) — `--shadow-card` vs `--shadow-card-hero` and `.card-console` vs `.card-inset` deltas too small to read; N-equal full-weight cards/rows everywhere; some pages INVERT tiers (blog-studio recede header outweighs the work card).
4. **blue=you / violet=agents invisible at arm's length** (tell #8) — `--color-agent-tint #EEEAFD` used as a thin segment tint not a zone ground; violet hairlines/dots at /30–/40 read grey; `#3370FF` ACTION accent leaks into data-viz and collides with active-nav blue. The product's core promise doesn't read.
5. **Fraunces serif beat absent/wasted** (tell #6) — most data pages opt out "deferring to another page", or the beat is body-grey/undersized. **CAVEAT: may be partly a dev-renderer font fallback (turbopack/dev) — must verify Fraunces actually loads in a clean webpack/prod build before treating as a content gap.** Several "generic heading" findings on team/settings are likely the same false positive.
6. **Numbers not in Geist Mono tabular-nums** (M11) — figures rendered in Inter on agency/reports/settings/shopping/competitors; biggest divergence from the #173 exemplar. No shared `<Stat>` primitive.

Plus over-weighted full-bleed `#3370FF` CTA slabs (tell #5) from `RunControl.tsx` and auto-stretch buttons (`ui/button.tsx`), bare-centered single-CTA empty/error states (`error-state.tsx`, violates M8), and absent entrance choreography (M9) on list pages.

# Real bugs (distinct from craft) — design-layer only

- **/agency success state reads broken** — orphaned full-width "Generate audit" CTA above an already-generated audit + two identical 64px "31" heroes colliding. (component logic, in scope)
- **/reports export drawer clipped** at viewport edge — 320px third zone has no room in `max-w-[1200px]`. (layout, in scope)
- **/digests verdict headline truncated** to "Perplexity pi…" — the loudest object on the page. (layout/truncation, in scope)
- **/content + /traceability duplicate rows** — byte-identical fixture rows read as AI filler. **These are MOCK FIXTURE dupes (design data), fixable in fixtures — NOT a backend/DB change.**
- **CAPTURE/ENV ARTIFACTS (not design failures):** `/approvals` rendered its error state on both shots because the `approval_queue` table is absent from the preview DB; `/discovery` only showed its env-missing fallback (`NEXT_PUBLIC_CALCOM_DISCOVERY_LINK` unset). The real happy-path UIs were never rendered. **Action: re-capture with the table seeded / env set (preview-only), then re-audit — do NOT redesign off the error state.** The shared `error-state.tsx` M8 fix still applies.

# Coverage gap (process, blocks PASS certification)

Most pages have only `populated-desktop` captured. `empty / loading / error / mobile-375` and several pages' **declared signature moments** (builder dry-run ledger + template gallery, ask grounding-ledger morph, blog-studio success editor, shopping attribute-accuracy matrix) were never rendered. **A second capture pass (all states + signature moments + mobile, on a clean webpack build) is required before any page can be certified PASS.** The polish workers re-capture their own page; the re-critic gate consumes the new shots.

---

# Polish execution plan — disjoint ownership, wave-sequenced

Rate-limit discipline (learned this session): **never burst >~4 image-heavy Opus agents.** Run workers in batches of 2–3 concurrent. All workers on OPUS. All branch worktrees from `origin/feat/phase1b-b25-intelligence` (the full tip). Atomic commits + commit-and-report stall failsafe. `next build` green is the gate (`SKIP_ENV_VALIDATION=1` + dummy envs, `pnpm -F @beamix/web build`).

## WAVE 1 — Foundation (MUST land + merge first; page workers rebase on it)

Four disjoint-file workers, run 2 at a time, merged into one `feat/ui-excellence-foundation` branch, build-verified:

- **F1 — Global tokens + app shell.** `apps/web/src/app/globals.css` (depth-step tokens so 3 tiers are FELT; status-pill TEXT to AA ≥#067A55; `--color-agent-tint` as a real zone ground + solid violet hairline; data-viz series tokens distinct from `#3370FF`; hero shadow + warm-canvas tone) + `apps/web/src/components/dashboard-shell.tsx` (shared `<main>` content frame `mx-auto max-w-[1200px] px-6 sm:px-8` + full-bleed opt-out prop; finish or remove the Search pill stub). **FIRST gate: verify Fraunces + InterDisplay load in the webpack build and document it (resolves the serif false-positive question for every downstream worker).**
- **F2 — Shared UI primitives.** `ui/button.tsx` (disabled = neutral bordered-ghost not washed-accent; never auto-stretch primary full-width), `ui/input.tsx` (fillable border contrast), NEW `ui/stat.tsx` (Geist Mono tabular-nums numeric primitive), `components/error-state.tsx` (M8 two-tier recovery, left-anchored framed panel), auth `layout.tsx` + `AuthCard` (texture/wordmark/figure-ground; you-surface = no violet).
- **F3 — Console data/verdict/filter primitives.** `EngineMicroSparkline.tsx` (visible baseline + min 64×24 + endpoint dot + trend delta + reject fake points), `SerifVerdict.tsx` (min size/ink + verdict-word contract), NEW `console/FilterChip.tsx` + refactor its 4 call sites (`analytics/_components/AnalyticsScopeRail.tsx` + `TopicFilterGroup.tsx`, `traffic/_components/TrafficScopeRail.tsx` + `PagePathFilterGroup.tsx`: neutral default, swatch carries engine color, blue only on hover/focus), `ContextStat.tsx`.
- **F4 — Tool-page shell + run cluster.** `components/tools/ToolPage.tsx` (left-anchor/content-width column, stop pushing zone-5 below fold, earn-the-width right-rail recipe, TIER-2 work vs TIER-3 context fix), `tools/RunControl.tsx` (size-to-content + left-anchor CTA, cluster with ModeToggle under one ground), `tools/ModeToggle.tsx` (equal-width centered segments, violet agent ground).

> After Wave 1 merges + builds green: **re-capture the full surface** (all states + mobile + signature moments, webpack build) and quick-re-critic 3–4 representative pages to measure the cascade lift before committing to the long tail.

## WAVE 2 — Pages (branch off the foundation branch; disjoint files; batches of 3)

Page owners do NOT touch any Wave-1 shared file (they consume them). Redesign vs polish per the group syntheses:

REDESIGN (heaviest briefs): **builder** (canvas: kill dead-center 5-node spine, promote DO node to TIER-1, earn the right 40% as inspector/cost rail), **traceability** (forensic-receipt hero: 64px proof-number, kill 3 identical rows, fill the 55% dead canvas), **onboarding-post-payment** (fill the void, 60% → hero figure), **agency** (success-state CTA suppression + dual-hero fix).

HEAVY-POLISH: dashboard (add dominant score-trend strip — the #1 competitor gap; mobile hero fixes; un-blue prose), market (un-blue the 48,200 data figure → mono; fix donut; single TIER-1), analytics (donut center + section rhythm; consumes FilterChip), traffic (rail anchor + verdict de-dup; consumes FilterChip; verify 375px table), prompts (kill off-center column via shell; denser output table), content (fixture de-dup; real sparkline; single-page hero), competitors (fix broken SoV chart; empty state), offsite (un-glitch sparkline; un-blue importance bar; remove dev DEMO-STATES strip; dead canvas), schema (quota-as-hero → value signal; dead lower 40%), settings (depth + violet on agent tabs + mono + serif), reports (drawer clip), digests (verdict truncation + dead gutter), blog-studio (un-invert depth tiers), ask (focal metric in hero answer; composer crop bug), automation (violet zone + row texture), scan-free (frame-fill the centered column), shopping (re-capture-gated; matrix).

LIGHT-POLISH: sentiment (demote one surface; raise hero verdict to 30px), team (remove local max-w pin → shell frame; promote members table), login (re-capture states; wordmark/texture from F2), signup (figure/ground from F2).

DATA/CAPTURE PREREQ pages: approvals + discovery — re-capture with seeded table / set env (preview-only) BEFORE design polish; then treat as heavy-polish.

## WAVE 3 — Re-check loop

Re-screenshot each polished page (all states), re-run the Opus design-critic against the same refs + rubric, loop polish→critic until each page is PASS (no AI tells, one TIER-1 focal, earned asymmetry, felt depth, real motion, all 4 states clean, mono numbers, one serif beat). Integrate per group, `next build` green, PR stacked on #183 with before/after screenshots.
