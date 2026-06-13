---
page: /traffic — AI Traffic & Crawler Analytics
states_audited:
  - populated-desktop.png   # the ONLY state captured
  - empty-desktop.png       # NOT captured
  - error-desktop.png       # NOT captured
  - loading-desktop.png     # NOT captured
  - populated-mobile.png    # NOT captured
competitor_refs:
  - Profound dashboard onboarding (10.37.47, 10.38.02) — figure + chart + asymmetric rail
  - Profound prompts table (10.39.25) — dense data table, in-cell deltas, mono numbers
  - Otterly onboarding/loading (10.44.17, 10.45.13)
verdict: NEEDS_WORK
source: .worktrees/b25-integrate/apps/web/src/app/(protected)/traffic/
---

# traffic — UI Excellence Audit

## Screenshots
- [populated-desktop.png](screenshots/traffic/populated-desktop.png) — the only captured state (and it is cropped at ~the fold; the lower half of the page — full crawler chart, referral/bot-mix 2-up, content table — was never rendered into a screenshot).

> Only ONE screenshot exists for this surface. Empty, loading, error, and mobile states were NOT captured, and the populated shot is truncated above the 2-up + table. Findings below the fold are graded from source + the cropped image and are flagged as such. The missing-state coverage is itself a P1 audit gap.

## Verdict
**NEEDS_WORK.** The page is clearly built on the validated Console Spine and starts from a genuinely good place — earned hero asymmetry (1fr/360px), a single 64px blue mono figure, a real verdict sentence, mono numbers throughout, and an honest no-fake-data sparkline discipline. It is already more considered than the Otterly refs and sits in the same league as Profound's analytics. BUT it has not reached the competitor *finish* bar: the scope rail reads as a wall of identical blue chips (the you-vs-agents promise is muddied because blue is sprayed across non-action filter chips), the rail is under-designed with dead vertical space, the hero verdict has no Fraunces/editorial beat anywhere on the page (intentional per spec, but it leaves the page tonally flatter than the dashboard exemplar), and several depth/rhythm tells from the rubric are live. It is a strong B that needs polish to become an A — no full redesign required.

---

## P1 — must fix (looks AI / broken)

### P1-1 — The page-path AND crawler filter chips are a wall of identical blue (tell #8: blue is decoration, not spatial)
In the render, the entire left rail is a stack of solid `#EEF2FF`/`#3370FF` blue chips — every crawler (GPTBot…CCBot) and every page-path (`/emergency-dentist`…`/pediatric-dentist`) is in its blue "active" state at once. `TrafficScopeRail.tsx:71` and `PagePathFilterGroup.tsx:44` both apply `bg-[#EEF2FF] text-[#3370FF]` to *every* item because all filters default to on. Against Profound's rail (`Profound 10.39.25` left nav: one quiet accent, neutral list) and the BRAND LAW (blue = the user's ACTION, one accent per surface), a 11-item blue column makes the accent meaningless and is the single most "AI-template" thing on the screen. **Fix (M6/M8 + BRAND LAW):** the default "all-on" state should be NEUTRAL (the swatch carries the bot color; the chip text is `#374151`, ground transparent). Reserve the blue `#EEF2FF` ground for the *hover/focus* affordance and the page-path swatch dots — let the color swatches do the identity work, not a full blue fill. `TrafficScopeRail.tsx:68-73`, `PagePathFilterGroup.tsx:41-46`.

### P1-2 — The scope rail is under-designed with large dead vertical space (tell #5: bare composition)
The rail (`card-inset`, `TrafficScopeRail.tsx:51`) holds three groups then stops, leaving a tall empty column beside the much taller main content. In the render the rail ends around the hero's lower third while the main column runs far past it; the sticky rail then floats against a wide band of nothing. Profound and Otterly never leave a rail half-empty — they anchor the bottom with a summary stat, a legend, or a quiet help affordance. **Fix (M1/M12):** anchor the rail bottom — e.g. a small "Showing N of N crawlers · N pages" mono summary line above the reset anchor, or pull the violet "marks an agent action" legend into the rail as a pinned key. Tighten the inter-group rhythm (`space-y-6` is one global value — vary it: tight inside a group, wider between). `TrafficScopeRail.tsx:51, 119-129`.

### P1-3 — Missing state coverage: empty / loading / error / mobile never validated (broken-until-proven)
Only `populated-desktop` was captured. The empty state (`TrafficWorkbench.tsx:178-206`) uses a `WorkbenchPreview` ghost + two-tier CTA which is on-spec, but it was never rendered, and the ghost preview's literal `90 - i*18`% bars (`TrafficWorkbench.tsx:86`) and `card-console-hero` ghost have not been visually checked for the "bare/AI placeholder" tell. The mobile single-column collapse (`TrafficLayout.tsx:42`, `grid-cols-1`) and the 5-column content table (`ContentPerformanceTable.tsx:50`, `grid-cols-[minmax(0,1fr)_88px_88px_140px_72px]`) at 375px are completely unverified — a 5-col fixed-width grid is a prime mobile-overflow risk. **Fix:** capture all four states + mobile and re-audit. This is a hard gate before PASS.

### P1-4 — The 64px hero figure and the 30px verdict both repeat "1,284" — the figure is robbed of its TIER-1 singularity (M2/M10)
`TrafficHeroPanel.tsx:140` renders the figure `1,284`, and the verdict at line 148 immediately re-states "AI engines sent you **1,284** sessions and 98 conversions this month." The eye reads the same number twice in 2 lines, which deflates the 64px focal (the whole point of STEP-1 is that the figure *is* the headline, not a preamble to it). In the render the doubling is conspicuous. **Fix (M2):** drop the number from the verdict sentence — "AI engines sent you sessions and 98 conversions this month" reads wrong, so re-cast the verdict to carry the *second* fact: e.g. headline figure `1,284` → verdict "…and turned 98 of them into conversions this month." One number per type-step. `TrafficHeroPanel.tsx:144-150`.

---

## P2 — substantive

### P2-1 — Uniform card depth across the whole viz family (tell #1)
Every instrument below the hero is the same `card-console` at the same `p-6` with the same shadow: `CrawlerActivityChart.tsx:109`, `ReferralAttributionPanel.tsx:29`, `BotMixPanel.tsx:63`, `ContentPerformanceTable.tsx:39`. The spec calls for *felt* tiers — the hero is correctly `card-console-hero`, but everything after it flattens into one TIER-2 plane. The 2-up is "weighted" by width (1.5fr/1fr) but not by depth, so the page reads as hero + a uniform deck. **Fix (M1):** let the dominant crawler chart sit one notch heavier (or give the lighter BotMix/rail-adjacent surfaces `card-inset` TIER-3 treatment) so the eye steps down, not across a flat shelf.

### P2-2 — No Fraunces beat anywhere — page is tonally flatter than the dashboard exemplar (tell #6)
`TrafficWorkbench.tsx:24-25` explicitly opts out of the serif beat ("serif budget = MAX one, spent elsewhere"). That is a defensible *system* decision, but the consequence is real: next to the shipped #173 dashboard (which carries a Fraunces verdict word), `/traffic` reads more clinical/templated. **Fix (judgment call, route to design-lead):** if the page-level serif budget genuinely belongs to the dashboard, leave it — but then the hero verdict at `TrafficHeroPanel.tsx:144` must earn its warmth another way (tighter editorial phrasing, a confident one-word lead-in). Do NOT add Fraunces in chrome. Flagging so the omission is a *decision*, not drift.

### P2-3 — Crawler chart axis label gutter is visibly off (`margin left: -16`) (M12 / alignment)
`CrawlerActivityChart.tsx:129` uses `margin={{ ... left: -16 }}` to pull the Y axis flush. Combined with `YAxis width={44}` this commonly clips or crowds the first Y tick and leaves the area fills bleeding to the card's inner padding edge inconsistently with the X gutter. In the cropped render the chart's left edge does not align with the eyebrow/title above it. **Fix:** align the plot's left edge to the card content inset (eyebrow at `p-6` → plot should start at the same x), not a negative margin hack.

### P2-4 — `ContentPerformanceTable` "Top bot" column is presentation-only fiction dressed as data (honesty / M11)
`ContentPerformanceTable.tsx:29-33` `topBotFor(index)` assigns a top bot by row index (`BOT_ORDER[index % len]`), not by real data, while every other number on the page is honest. The rubric's whole thesis is "never fake data"; a column that *looks* like a measured dimension but is `index % n` is exactly the kind of tell that erodes trust on close read. **Fix:** either wire it to the real dominant bot per page, or drop the column until it is real (the sparkline column already correctly renders the null baseline — follow that discipline here).

### P2-5 — Every data row's trend sparkline is the flat null baseline (M4 signature is invisible in the table)
`ContentPerformanceTable.tsx:111` passes `points={null}` for every row, so the entire Trend column is identical flat 1px lines — the M4 signature detail (the thing meant to make the table feel alive and bespoke) is dead weight in the table. It only lives in BotMixPanel. Honest, but a full column of identical flat lines reads as "unfinished." **Fix:** if per-page history is not wired, drop the Trend column from the table for now (don't ship a column of identical placeholders); keep the live sparkline where it has real data (BotMix).

### P2-6 — Hero right rail (crawl-volume bars) and the BotMix panel show nearly the same information twice
Hero `CrawlVolumeBars` (`TrafficHeroPanel.tsx:59-103`) renders per-bot total hits as horizontal bars; `BotMixPanel` (`BotMixPanel.tsx:73-104`) renders per-bot total hits as a list + sparkline. The crawl-volume right-rail and the bot-mix panel are two views of "hits per bot." On one screen that's redundant and makes the 2-up feel like filler. **Fix (M10):** differentiate — the hero rail could become share-of-voice vs. a benchmark, or BotMix could pivot to new-vs-returning bot behavior, so the two surfaces answer different questions.

---

## P3 — nice-to-have

- **P3-1** Delta chip uses `text-[12px]` with a `font-sans` "vs. previous 30d" tail inside a mono number chip (`TrafficHeroPanel.tsx:50-54`) — the mixed mono+sans inside one pill is slightly fussy; consider moving "vs. previous 30d" out of the pill as quiet caption below.
- **P3-2** `WorkbenchPreview` ghost bars at `90 - i*18`% (`TrafficWorkbench.tsx:86`) are a deterministic descending ramp — reads a touch too tidy/AI; jitter the widths so the ghost feels like real data shape.
- **P3-3** Empty-state secondary CTA "See a sample report" links to `/scans` (`TrafficWorkbench.tsx:197`) — verify that lands on something that actually demonstrates traffic value, else the recovery promise is hollow.
- **P3-4** Error state centers a generic block (`ErrorState`, `TrafficWorkbench.tsx:213`) — confirm it is not a bare-centered icon-in-circle (tell #5) once captured.
- **P3-5** `CrawlerActivityChart` agent ReferenceLine labels are `font-sans` violet text positioned `top` (`CrawlerActivityChart.tsx:164-170`) — with multiple agent events they can collide/overlap at the top edge; verify spacing once the full chart renders.
- **P3-6** Hero gradient `linear-gradient(135deg, #FFFFFF → surface-warm)` (`TrafficHeroPanel.tsx:127`) is very subtle — confirm it actually reads as warmth and isn't just noise; otherwise commit to a flat warm surface.

---

## Per-state notes
- **populated-desktop (captured, cropped):** Strong top — hero asymmetry, blue figure, verdict, delta chip, crawl bars all land. Problems concentrate in the rail (P1-1 blue wall, P1-2 dead space) and the number-doubling (P1-4). The full crawler chart, the referral/bot-mix 2-up, and the content table are below the captured fold and graded from source only — re-capture full-height.
- **empty (NOT captured):** Source is on-spec (titled context, ghost preview, two-tier CTA, scan illustration) but unrendered — must verify the ghost doesn't read as a bare AI placeholder.
- **loading (NOT captured):** `TrafficSkeleton` unrendered — verify skeleton matches the real layout footprint, not generic blocks.
- **error (NOT captured):** verify against tell #5 (no bare centered icon).
- **mobile 375 (NOT captured):** HIGH RISK — the 5-column fixed-width content table grid (`ContentPerformanceTable.tsx:50`) and the hero `grid-cols-[1fr_360px]` collapse are unverified; fixed `88px/88px/140px/72px` columns + a 1fr path will almost certainly overflow or crush at 375px. Capture and audit before PASS.
