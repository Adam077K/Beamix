# HANDOFF — Next Design / Planning / UX Team
Date: 2026-04-26
Branch: `ceo-1-1777040289` (pushed to origin)
PR: https://github.com/Adam077K/Beamix/pull/new/ceo-1-1777040289

---

## Open this conversation with the prompt below

Copy-paste this verbatim into a new Claude Code session as your first message:

---

> Iris, I'm continuing the Beamix product design + UI/UX rethink. This is the most important strategic work in the project. Read these in this exact order before doing anything:
>
> **Memory (loaded automatically — verify):**
> 1. `~/.claude/projects/-Users-adamks-VibeCoding-Beamix/memory/MEMORY.md` — index. Especially:
>    - `project_quality_bar_billion_dollar.md` — quality bar is **non-negotiable**
>    - `project_vision_company_not_tool.md` — vision: company, not tool
>    - `project_beamie_deferred.md` — persistent character DEFERRED, animations YES
>    - `project_framer_marketing_after_product.md` — marketing site DEFERRED
>    - `feedback_no_timeline_planning.md` — NO timelines / weeks / sprints in plans (Adam ships with agent army)
>
> **The locked decisions (read before designing anything):**
> 2. `docs/08-agents_work/2026-04-25-PAGE-LIST-LOCKED.md` — 8 sidebar pages + 2 flow surfaces + Scale-tier /reports + 4 chrome elements
> 3. `docs/08-agents_work/2026-04-25-ANIMATION-STRATEGY-LOCKED.md` — per-page skeleton-draw decisions + 7-entry cross-page motion vocabulary
> 4. `docs/08-agents_work/2026-04-25-DECISIONS-CAPTURED.md` — Adam's full decision log
>
> **The current open work:**
> 5. `docs/08-agents_work/2026-04-26-PAGES-DESIGN-MOVES.md` — 804-line per-page integrated decisions for the 10 remaining pages. **There are 7 open questions at the bottom Adam needs to answer to lock the page-level design language.** Start by surfacing these.
>
> **The /home reference:**
> 6. `docs/08-agents_work/2026-04-25-HOME-DESIGN-SPEC.md` — 1,271-line section-by-section spec for /home. Sections 1-3 are locked from prior conversation. Section 4 was overhauled (hand-drawn metric illustrations replace sparklines, dynamic hero KPI for most-moved metric). Sections 5-8 accepted-as-proposed.
>
> **The reference library:**
> 7. `docs/08-agents_work/2026-04-25-REFERENCES-MASTERLIST.md` — 767-line canonical visual library (7 anchor products: Claude.ai, Excalidraw+Rough.js, Linear, Perplexity, Notion+Notion AI, Stripe Dashboard, Wix; locked stacks for typography/color/animation tech)
> 8. `docs/08-agents_work/2026-04-25-HOME-PREMIUM-REFS.md` — 12 "expensive" patterns + 8 anti-patterns from premium SaaS dashboards
>
> **The next move:**
> Surface the 7 open questions from `PAGES-DESIGN-MOVES.md` to me first. After I answer, we walk page-by-page through the integrated moves (like the /home walkthrough already done in prior session) and lock each. After all 10 pages locked, we move to the visual design system: colors, palettes, fonts, sizes, spaces, components, micro-animations. Then implementation by frontend-developer workers in dependency order (no timelines).
>
> **Quality bar reminder:** Adam rejected "default Stripe pattern" KPI cards on /home Section 4 because they were too generic. Quality bar is "real billion-dollar company designed this." Every page must clear that smell test. When in doubt, escalate to me — don't ship generic.

---

## What was accomplished in the prior session(s)

### Session 1 (2026-04-24) — Vision rethink
- 5 R2 reference researchers (companion character, agent flow viz, GEO competitor audit, motion+PMF, plus existing baseline) → REFERENCES-MASTERLIST
- BEAMIX-VISION.md v1 (423 lines, framework — superseded by per-page work)

### Session 2 (2026-04-24/25) — Pressure-testing the vision
- 7-seat board meeting (Reductionist, Storyteller, Executor, Advocate, Motion Craftsman, Futurist, Moat Strategist)
- BOARD-MEETING-MINUTES synthesis with 5 ship-stoppers caught (WCAG AA contrast, Hebrew typography blocker, missing streaming API, internal contradictions, May launch impossible)
- Adam locked: company-not-tool, Beamie deferred, no timelines, Hebrew first-class, past-MVP framing

### Session 3 (2026-04-25) — Page architecture
- 2 agents (Customer Journey Architect + IA Critic) audited the 10-page proposal
- 2 product designers fought (Overview Maximalist vs Action-First Minimalist)
- Adam locked: Path C (Hybrid), 8 sidebar pages, /archive absorbs into /scans Completed Items tab, /crew + /reports added, /automation→/schedules

### Session 4 (2026-04-25) — /home deep dive
- HOME-PREMIUM-REFS hunt (5 anchors, 12 patterns, 8 anti-patterns)
- HOME-DESIGN-SPEC (1,271 lines, 8 sections + 5-min QA test)
- Section-by-section walkthrough — sections 1, 2, 3, 5, 6 locked
- **Section 4 overhauled** after Adam pushback: hand-drawn metric illustrations + dynamic hero KPI replace generic sparklines

### Session 5 (2026-04-25) — Animation strategy
- Per-page skeleton-outline-drawing decision matrix (PM-led)
- 7-entry cross-page motion vocabulary locked
- 5 follow-up calls: localStorage flags, once-per-account flags, 5 distinct empty-state illustrations, every-page topbar asterisk, RTL-flips path-draw globally

### Session 6 (2026-04-26) — Remaining 10 pages
- 2 product designers (Distinctive Moves vs Shipping Discipline) covered all 10 remaining pages
- PAGES-DESIGN-MOVES synthesis (804 lines) with per-page integrated final moves
- 3 D1 wins (/competitors, /scan, /reports), 3 D2 wins (/schedules, /settings, /workspace completion), 4 blends
- **7 open questions** still need Adam's answers

---

## The 10-page integrated moves at a glance

| # | Page | Final Move (1 line) |
|---|---|---|
| 1 | `/inbox` | Reasoning Receipt typed-in on first selection per session, Linear 3-pane chrome verbatim |
| 2 | `/workspace` | Courier flow dissolves the card surface entirely; quiet "Done. 47s." completion (no stamp, no ceremony) |
| 3 | `/scans` | Receipt-tape ribbon on All Scans tab, Stripe table on Per-Engine + Completed Items tabs |
| 4 | `/competitors` | Rivalry Strip — dual sparklines + shaded gap + verdict pill (D1 outright win) |
| 5 | `/crew` | Grid + click-to-flip card backs (hand-written field notes) + first-visit skeleton-draw. NO mascots. |
| 6 | `/schedules` | Sentence Builder primary + table-view toggle for power users |
| 7 | `/settings` | Letter on Profile tab only. 4 other tabs: Stripe-replica forms, no decoration |
| 8 | `/scan` (public) | Strikethrough-and-rewrite for auto-detected name corrections in Frame 3 |
| 9 | `/onboarding` | Horizon path-draw as visual progress; standard back-button for navigation |
| 10 | `/reports` | "Press" button + flip-to-PDF + Stripe-Press-tier cover page; config pane stays workmanlike |

---

## The 7 open questions Adam still needs to answer

Surface these first in the new session:

1. **/crew card flip vs expand panel** — flip is ritual, expand panel is safer/faster
2. **/scans receipt-tape width** — 560px centered (luxury) vs wider for Yossi data density
3. **The Letter on /settings Profile tab** — keep or cut (settings should be "uniformly boring and trustworthy"?)
4. **`/reports` "Press" + flip — both or neither** (designed together, half a bet doesn't work)
5. **/onboarding horizon navigation** — visual-only (safe) or navigable (more distinctive, non-discoverability risk for Sarah)
6. **/schedules Sentence Builder vs table primary** — chip mechanic's cross-page payoff depends on this
7. **/onboarding step 4 content** — locked spec says "credits you want a month" but plan-based model may not need this; what is user actually choosing?

---

## The visual design system work (after page-by-page locks)

In Adam's stated order, after pages are locked:

1. **Colors / palettes** — confirm or refine #3370FF brand + #2558E5 text-safe + #F5F3EE canvas + semantic. Possibly add LCH derivations for Excellent/Good/Fair/Critical at uniform perceptual lightness.
2. **Fonts / sizes** — confirm InterDisplay + Inter + Geist Mono + Fraunces accent + Excalifont (animation accent only) + Rubik + Heebo + Frank Ruhl Libre (Hebrew stacks). Lock the type scale (hero 64-72px down to 11px micro caps).
3. **Spaces** — vertical rhythm, section gaps, card padding asymmetries (4px left bias), grid widths
4. **Micro-animations** — codify the 7-entry cross-page motion vocabulary into reusable components (Score Gauge Fill, Path-Draw, Card Hover Lift, Pill button spring, Empty state Rough.js, Optimistic UI Approve, Topbar asterisk)
5. **Components** — Cards, Pills, Buttons, ActionBar, RecommendationCard, EnginePill, KPICard, ScoreDisplay, EmptyState, etc. Each Beamix-specific (NOT default Shadcn).
6. **UX consistency** — keyboard shortcuts (Cmd+K, ?, J/K, R/A/X, G+S/G+I/G+C), focus rings, hover states, active states, error/loading/empty discipline, RTL parity

---

## The implementation order (post visual-system)

Per locked dependency:
1. Foundation: Typography load (InterDisplay STILL not loaded in `apps/web/src/app/layout.tsx` per audit) + Color tokens + RTL plumbing + Animation primitives
2. `/scan` (public) — proves the design language under acquisition pressure
3. Signup + `/onboarding`
4. `/home`
5. `/workspace`
6. `/inbox`
7. `/scans`
8. `/competitors`
9. `/crew`
10. `/schedules`
11. `/settings`
12. `/reports` (Scale-tier)

NO timelines. Ship in dependency order.

---

## What's deferred (architect for, ship without)

- Beamie persistent character (post-base-product)
- Memory layer (Beamie-dependent)
- Marketing site unification (post-product-validation)
- Dark mode (post-launch)
- Public GEO Index `beamix.tech/check-my-site` (architect for, ship later)
- State of GEO newsletter
- Shareable Scan Card (PNG + permalink + Twitter thread + auto-GIF)
- Multi-domain switcher infrastructure (chrome element — but Yossi's pricing model question still open)

---

## Critical context the next CEO/team must hold

1. **Adam doesn't want timelines.** Plan by scope + dependency + quality bar only.
2. **Adam rejected /home Section 4's first draft** because it was the default Stripe pattern. He said "this design is too simple and not special." Quality bar is real billion-dollar company.
3. **Adam wants animations + drawings throughout the product** but NOT a persistent companion character (Beamie deferred).
4. **Hebrew/RTL is first-class.** Inter Display has NO Hebrew glyphs — must swap to Rubik/Heebo on `dir="rtl"`. CSS logical properties everywhere (`margin-inline-start` not `margin-left`).
5. **The 5 hand-drawn empty-state slots are already allocated** — /home, /inbox, /scans, /crew, /competitors. Don't add more. Restraint is the discipline.
6. **The signature pill button** ("Run all — N credits") repeats on /home, /inbox, /scans, /workspace, /reports. Verb adapts, shape stays. This IS Beamix's Magic Plus equivalent.
7. **Sarah / Yossi paradigm** — same surface serves both. NO Pro mode toggle. Depth via clicking, not via settings.

---

## Where to NOT freelance

These are locked and shouldn't be relitigated without Adam's explicit say-so:

- The 8-sidebar-pages-list (Path C Hybrid)
- Beamie deferred
- Animation strategy (per-page skeleton-draw yes/no)
- Quality bar (billion-dollar feel)
- Anti-patterns (no tinted-square icons, no gradient backgrounds, no skeleton-shimmer, no "Welcome back" greetings, no confetti, no looping animations on dashboards, no Pro-mode toggle, no per-engine logos in pills)
- The 7-entry cross-page motion vocabulary
- The hero score numeral color (#0A0A0A neutral ink, not brand blue)
- /scans absorbs /archive (not in /inbox)
- /automation renamed /schedules
- /crew + /reports as new pages

---

## End of handoff

Branch `ceo-1-1777040289` is pushed to origin with all 50+ docs.

The next CEO/team picks up by:
1. Verifying memory loaded
2. Reading the 8 numbered files above
3. Surfacing the 7 open questions from PAGES-DESIGN-MOVES to Adam
4. Walking page-by-page through the integrated moves
5. Then visual design system
6. Then implementation by frontend-developer workers
