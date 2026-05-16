# Board Member 6 — Design Fidelity

## Verdict: **DESIGN LOST IN TRANSLATION** (will ship at ~40-50% of the April vision)

Wave briefs reference `13-DESIGN-SYSTEM-SPEC.md` (the thin token doc, 463 lines) but **never reference `2026-04-25-HOME-DESIGN-SPEC.md` (1,271 lines), `PER-PAGE-ANIMATION-STRATEGY.md` (488 lines), `REFERENCES-MASTERLIST.md` (767 lines), or any of the 30+ design artifacts from April 24-28.** Zero hits on grep for: "HOME-DESIGN-SPEC", "PER-PAGE-ANIMATION", "Fraunces", "tabular", "Rauno", "3-act / three act", "warm canvas", "#F5F3EE", "frequency-aware". The wave briefs are functionally correct but design-blind. Workers will read `13-DESIGN-SYSTEM-SPEC` and `04-EMPTY-STATES` and ship Shadcn-vanilla with a blue accent.

## Design work from April that's at risk of NOT shipping (top 5)

1. **HOME-DESIGN-SPEC.md entirely.** Frame-by-frame entrance choreography (1.85s, 17 timed events, sessionStorage flag, reduced-motion fallback), 3-act vertical structure (State/Detail/Context, 8 sections), Fraunces serif diagnosis line, tabular numerals on every digit, 4-LCH-point sidebar dimming, warm-canvas `#F5F3EE` background — **none of this is in FE-1 brief.** FE-1 says "ScoreHero (animated counter, 8-week sparkline, delta pill)" — that's the Shadcn-template version. The Stripe/Linear/Anthropic-grade version is unreferenced.
2. **Per-page animation budget tiers (Rauno frequency-aware rule).** Tier 1/2/3 mapping (skeleton-draw on `/scan` + `/onboarding` only; daily pages = instant render after first session; `/crew` first-visit-only sketch-in) is the spine of the motion system. Wave briefs don't mention it. Workers will either over-animate Tier 3 (contempt by 5th visit) or under-animate Tier 1 (lose the wedge).
3. **Wound-reveal choreography.** FE-2 brief says "Wound-reveal result (score, 3 visible fixes, 8 blurred)" — one line. The actual 10-frame REFS-03 narrative (hand-drawn URL frame, score arc count-up, 15-17s reveal) is the public-acquisition conversion crux. FE-2 will ship a static blurred-card grid.
4. **Signature primitives lost.** "Run all — N AI Runs" pill is in FE-1 brief but with no spring-overshoot timing, no copy ladder, no hover treatment. Numbered step progression (board April-18 "guided step-by-step path") gets one paragraph; the horizontal progress bar advancement animation between steps is undefined. SuggestionCard dismiss/approve animations are in `13-DESIGN-SYSTEM-SPEC` but the per-page choreography hooking them together is not.
5. **Hebrew/RTL parity, Refero/Stitch reference sourcing, hand-drawn restraint discipline.** RTL is a "parallel design" per the spec (Rubik+Heebo+Frank Ruhl Libre swap on `dir="rtl"`, microcopy transcreated). Wave 1 briefs are silent. Wave 1 design-lead prep says "Use Refero/Stitch MCPs to source 2-3 visual references" — for Inbox + Score-hero only, not the other 5 pages.

## Design work that's well-specced and will ship

- **Design tokens** (`#3370FF`, Inter, Fraunces, spacing scale) — in globals.css per Wave 0.
- **27 Shadcn primitives + 14 new component prop interfaces** — Wave 0 Worker 3 has the contract.
- **Empty states** (9 illustration variants, failure cards, score-drop empathy) — `04-EMPTY-STATES.md` is well-integrated.
- **Sidebar + ⌘K command palette + 7-route nav** — explicit in Wave 0.
- **Paywall modal 880px, annual toggle, tier-locked variant** — FE-3 brief has it.

## Wave 0 design-lead prep — is 2 hours + 1 doc enough?

**No.** The prep produces `_patterns.md` from `13-DESIGN-SYSTEM-SPEC.md` only (463 lines). The 4,000+ lines of HOME/ANIMATION/REFERENCES/PAGES-DESIGN-MOVES specs are not read. `_patterns.md` will document motion-preset names and shared prop interfaces — not the 17-event entrance choreography, not the 3-act structure, not the per-page tier budgets, not the Fraunces/tabular/LCH-dimming details. Two hours can't carry that vision; six to eight hours can, but only if the input set is widened.

## Adam-approval gate before frontend workers spawn — is it specced?

**No.** Wave 1 brief §Design-Lead Prep says "After design-lead returns, all 6 Wave 1 workers may spawn in parallel." There is no Adam-review-of-`_patterns.md` step. The Wave 0 Adam-Pre-Spawn-Gate is for env-var/manual prereqs, not design intent. Result: workers spawn against a design-lead doc Adam never read. First time Adam sees the design IS in QA verdict screenshots after the worker is done — too late to course-correct cheaply.

## What to add to Wave 1 design-lead prep brief BEFORE spawn

1. **Required reading list expansion.** Add: `2026-04-25-HOME-DESIGN-SPEC.md`, `2026-04-25-PER-PAGE-ANIMATION-STRATEGY.md`, `2026-04-25-REFERENCES-MASTERLIST.md`, `2026-04-25-PAGE-ARCHITECTURE.md`, `2026-04-26-PAGES-DESIGN-MOVES.md`, `2026-04-27-HOME-design-v1.md`, `2026-04-27-INBOX-WORKSPACE-design-v1.md`, `2026-04-27-SCANS-COMPETITORS-design-v1.md`, `2026-04-27-ONBOARDING-design-v1.md`, `2026-04-27-DESIGN-SYSTEM-v1.md`. Time-box: 6 hours, not 2.
2. **Per-page choreography pack.** `_patterns.md` extends with 7 sections — one per protected route — each spec'ing: entrance behavior (first-of-session vs repeat), 1-3 signature animations with timing tables, explicit NO-animations, reduced-motion fallback, RTL adaptation. Pull from PER-PAGE-ANIMATION-STRATEGY table verbatim.
3. **Frequency-tier directive.** Worker briefs must include "this page is Tier N — motion budget X" sentence. FE-1 = Tier 3 daily. FE-2 `/scan` = Tier 1, `/scans` + `/automation` = Tier 3. FE-3 mixed.
4. **Reference-anchor required per page.** Each worker brief lists 2-3 specific competitor UIs to mimic: Home → Stripe Dashboard + Linear + Mercury; Inbox → Superhuman 3-pane + Linear triage; Scans → Anthropic Console drill; Automation → Linear cycles. Sourced via Refero/Stitch MCPs.
5. **Adam-approval gate (new).** Insert between design-lead return and FE worker spawn: CEO posts `_patterns.md` + 3 reference screenshots per page (Refero output) → Adam reviews → "Design approved, spawn FE workers" message required. Without it, workers spawn blind and Adam first sees output at QA time. Skipping this gate is the single highest-leverage 30-min insertion.
6. **Dark mode decision.** Spec is silent. Either ship light-only MVP and document, or instruct Wave 0 to scaffold the dark token set and Wave 1 to honor `prefers-color-scheme`. Don't leave it as "workers will figure it out."
7. **Microinteraction inventory.** `_patterns.md` enumerates: hover-lift values, button-press scale, toast slide-in/out, success-glow color/duration, error shake amplitude, focus-ring spec, skeleton shimmer easing. Without it every worker invents their own.
8. **Logo + brand mark.** Wave 0 must drop the actual Beamix mark SVG into `public/` and reference it in the sidebar/topbar component. Brief is silent — placeholder will ship.

---

## 250-word summary

**Top 3 design-loss risks:**
1. The 1,271-line HOME-DESIGN-SPEC (3-act structure, 17-event entrance choreography, Fraunces, tabular nums, warm canvas, LCH-dimmed sidebar) is not referenced anywhere in Wave 0 or Wave 1 — FE-1 will ship the Shadcn-template version of Home.
2. The PER-PAGE-ANIMATION-STRATEGY (Rauno frequency tiers, Tier 1/2/3 motion budgets, per-page choreography) is not referenced — workers will either over- or under-animate every surface.
3. No Adam-approval gate between design-lead's 2-hour `_patterns.md` and the 6-worker frontend spawn — Adam first sees design intent in QA screenshots, too late to course-correct without re-running workers.

**Verdict:** DESIGN LOST IN TRANSLATION. The build-prep wave briefs treat design as "13-DESIGN-SYSTEM-SPEC + empty states + Shadcn = done." They are functionally complete and design-illiterate. The 4,000+ lines of April design thinking are stranded in `docs/08-agents_work/2026-04-25-*.md` with no bridge into the workers' required reading.

**Will this look like the designs Adam approved?** No — it will look like a competent Shadcn dashboard with `#3370FF` accents and Inter. The Stripe/Linear/Mercury-grade craft Adam locked into the "billion-dollar quality bar" memory will not survive Wave 1 without (a) expanding design-lead's required reading to the full April pack, (b) widening prep to 6+ hours, (c) inserting an Adam-approval gate before FE spawn, and (d) putting per-page Tier + reference-anchor directives into each FE worker brief.
