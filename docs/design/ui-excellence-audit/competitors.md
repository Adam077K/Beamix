---
page: /competitors (Competitor Tracker)
route: /competitors
states_audited:
  - screenshots/competitors/populated-desktop.png (the ONLY state captured — viewport-only, truncated at the fold)
states_missing:
  - empty-desktop (not captured — real-user default state, UNVERIFIED)
  - loading (not captured)
  - error (not captured)
  - populated-mobile (not captured — responsive UNVERIFIED)
  - populated-desktop full-page below the fold (gap table + co-citation map UNVERIFIED visually; reviewed from source only)
competitor_refs_used:
  - Profound-Screenshot 2026-06-12 at 10.39.25 AM.png (prompts/visibility data table — closest analogue to the gap table)
  - Profound-Screenshot 2026-06-12 at 10.39.46 AM.png (content workflow + right rail)
  - Otterly 10.44.17 / 10.45.13 / 10.45.28 (brand-monitor dashboard chrome, prompt lists)
  - Profound onboarding shots (10.37.47 / 10.38.10 / 10.38.16) for chrome/typography bar
verdict: NEEDS_WORK
---

# competitors — UI Excellence Audit

## Screenshots

- [populated-desktop.png](screenshots/competitors/populated-desktop.png) — the only captured state; viewport-only (cut off mid–Visibility-Gaps card)

> AUDIT LIMITATION: only one screenshot exists for this page, and it is a viewport-only capture (no full-page scroll). The gap table, co-citation map, history link, and ALL of empty/loading/error/mobile are UNVERIFIED visually and were reviewed from source (`CompetitorPanel.tsx`, `ShareOfVoice.tsx`) only. A code-read finding is weaker than a pixel finding — re-capture full-page + empty + 375px before treating this as final.

## Verdict

**NEEDS_WORK.** The above-the-fold render is genuinely competent — there is a real TIER-1 hero (64px mono SoV figure), a designed asymmetric chart+rail, restrained accent, and a calm header. It already sits closer to the Profound/Otterly bar than most of this product's pages. But it has not cleared the bar: the chart is the weakest, most amateur element on screen (a tiny floating 140px line that reads like a sparkline, not the page's hero data-viz, with a broken/clipped competitor line and crude axis), the SerifVerdict beat is not visibly Fraunces (reads as a plain italic — the soul move is invisible), the header leaves a large dead zone, and the entire visibility-gaps / co-citation lower half is unverified. Against Profound's dense, confident, delta-rich analytics tables, the chart here looks unfinished.

---

## P1 — must fix (looks AI / broken)

### 1. The SoV line chart reads as a broken sparkline, not the hero's data-viz — the worst element on the page
**Problem:** The chart (`ShareOfVoice.tsx:41–185`, `H = 140`, `W = 480` rendered into a `1fr` column ~560px wide) floats as a tiny ~140px-tall line in a huge white field. In the render: the blue "you" line is a near-flat diagonal sitting LOW in the frame; the violet competitor line is a dashed horizontal that is **clipped against the top edge** of the plot area and hangs in dead space far above the blue line with a massive empty gap between them; only ONE "25%" gridline label renders (the auto-range `gridLines` filter at `:66` killed the rest), so there is no readable scale; the `23%` end-callout (`:171`) sits right at the chart's right edge with `+6` offset and risks clipping. Net: it looks like a rendering bug, not a designed chart.
**Why it reads AI/broken vs ref:** Profound's analytics (10.39.25) fills its data region edge-to-edge with a confident grid, multiple labeled gridlines, and clear series separation. This chart has one orphan gridline, a clipped series, and acres of dead vertical space inside its own card. It is the single biggest "unfinished" tell on the page.
**Fix (M1 + M4 + M11):** Make the chart actually own its TIER-1 real estate. (a) Raise `H` to ~200–220 and let the SVG fill the column height; (b) fix the range math so 3–4 gridlines always render with labels (don't filter to near-empty); (c) ensure both polylines + the end-callout sit inside `PAD`-safe bounds (the competitor dashed line is clipping at `toY` near `maxVal`); (d) add subtle area-fill under the "you" line (data-1 at ~8% opacity) so it reads as a filled trend, the Beamix signature, not a bare stroke. File: `ShareOfVoice.tsx:48–182`.

### 2. SerifVerdict "narrowing" is not visibly Fraunces — the one editorial soul beat (M5) is invisible
**Problem:** In the render the word "narrowing" in the subtitle is a plain italic, indistinguishable from `<em>` on Inter. The CRAFT-SYSTEM explicitly logs a turbopack-dev font blocker (`--font-family-display`/Fraunces falls back to Inter Tight / fails to load locally). `SerifVerdict.tsx:20` sets `font-[var(--font-serif)]` + `italic` — if `--font-serif` isn't loading, the entire M5 move (tell #6: "serif beat absent") is silently failing.
**Why it reads AI/broken vs ref:** The Fraunces italic-on-a-verdict-word is THE warm-minimal signature that separates Beamix from a generic dashboard. If it renders as plain italic Inter, the page has zero serif beat and reads as a template (tell #6).
**Fix:** Verify Fraunces actually loads on the audited surface (capture against prod or `next dev` without `--turbopack`, per CRAFT-SYSTEM §Blocker). If it still falls back, that is a P1 build blocker to route to CTO — the audit cannot confirm M5 is satisfied. File: `SerifVerdict.tsx:19–25` + font config.

### 3. Empty state is the REAL default for paying users and is completely unverified
**Problem:** `page.tsx:32` ships the **empty** state to every non-demo (i.e. real) user. That is the state actual customers see first. It was never captured. The empty composition (`CompetitorPanelEmpty`, `CompetitorPanel.tsx:186–235`) relies on `EmptyState illustration="competitors"` + a ghost-preview scrim — none of which is visually confirmed. If the illustration is a bare centered icon-in-circle, that is tell #5 and an M8 fail.
**Why it matters vs ref:** Otterly/Profound first-run screens are richly art-directed. A bare or broken empty state is what 100% of real users hit on day one.
**Fix:** Capture `empty-desktop` + `empty-mobile` and re-audit. Confirm M8 two-tier recovery (titled context + specific next step + primary blue pill + quiet secondary link + warm glyph, NOT a bare centered icon). File: `CompetitorPanel.tsx:186–235`, `EmptyState` component.

### 4. Header leaves a large dead zone — no `action` slot, short subtitle, asymmetry unresolved
**Problem:** `PageHeader` supports an `action` right-slot (`page-header.tsx`), but `CompetitorPanelSuccess` (`CompetitorPanel.tsx:512–523`) passes none. The result in the render: the title + 2-line subtitle occupy the left ~55%, and the entire right half of the header band is empty white. The page's only top-level action ("Add competitor") is buried inside the TIER-3 inset chip row below, not promoted.
**Why it reads AI vs ref:** Profound/Otterly headers anchor a primary control (export, date range, "Create draft") top-right, balancing the band. The bare header here is dead-center-ish weight with an unresolved right gutter (tell #5 — dead space / mis-weighted asymmetry).
**Fix (M3):** Promote a primary action into the header `action` slot — a date-range / "Last 5 weeks" selector or the "Add competitor" CTA — so the header reads as an intentional dominant-left / control-right split rather than text trailing into white. File: `CompetitorPanel.tsx:512–523`.

---

## P2 — substantive

### 5. The global app search bar in the chrome is empty/ghosted and reads unfinished
**Problem:** Top-left of the content area shows a faint "Search" pill with a magnifier, visibly lower-contrast than everything else, floating with no placeholder treatment that matches the page (`#9CA3AF` on near-white). It looks like a disabled/half-wired control. (This is page-shell chrome, not the dev badge — it is real UI.)
**Fix:** Give the search field a defined resting border + placeholder weight consistent with the input system, or remove it from surfaces where it isn't wired. Confirm it isn't a dead stub.

### 6. Engine-rail bars and the chart legend use two different visual languages for the same "you vs competitor" comparison
**Problem:** The chart encodes you/competitor as solid-blue vs dashed-violet lines; the rail (`ShareOfVoice.tsx:191–240`) encodes the same relationship as two stacked horizontal bars (solid blue / 50%-opacity violet). Two different metaphors for one comparison, side by side, adds cognitive load and reads less considered.
**Why vs ref:** Profound keeps one consistent encoding per metric across a view.
**Fix:** Unify — either give the rail bars the same dashed/solid treatment cue, or add a tiny inline legend tying the rail's violet to the chart's competitor line so the eye connects them. Reinforce M6 (violet = the tracked competitor, consistently). File: `ShareOfVoice.tsx:191–240`.

### 7. "By engine" rail: competitor name truncates and the hierarchy between "you" and competitor is muddy
**Problem:** In the render, under ChatGPT/Gemini/Perplexity, "Smile Center 39%", "Smile Center 31%", "Dental Plus 26%" — the competitor row uses `text-[#9CA3AF]` label + violet number at the same size as the "you" row, and the bars are 1.5px vs 1px. The intended you-dominant hierarchy (M7) is barely felt; the two rows look like equal siblings.
**Fix (M7):** Push the "you" figure up in weight/size and recede the competitor row harder (smaller, lighter), so each engine cell has obvious number-over-label dominance rather than two near-equal rows. File: `ShareOfVoice.tsx:198–238`.

### 8. Gap table + co-citation map unverified against the Profound table bar (source-only review)
**Problem:** From source (`CompetitorPanel.tsx:331–498`) the gap table is well-structured (asymmetric `[1fr_180px_90px_80px_140px]`, mono count, hover hairline, engine badges). But it is NOT visually confirmed, and two craft risks are visible in source: (a) every gap row's Action is a blue `EEF2FF` pill (`:419`) — five+ identical blue pills stacked in a column risks reading as a repetitive blue ladder rather than a calm table (Profound keeps row actions quiet/hover-revealed); (b) the engine badges (`EngineBadge`, `:80`) are all the same blue `#EEF2FF` ground regardless of engine, so the "Engines" column is a wall of identical blue chips.
**Fix:** Capture full-page. Consider making the row Action hover-revealed or a quiet text-link (reserve the filled blue pill for the single primary action), and confirm the engine column doesn't become a monotone blue block. File: `CompetitorPanel.tsx:409–425`.

### 9. Numbers in the header narrative are NOT mono (M11 leak)
**Problem:** The subtitle "Smile Center leads at 34%, you are at 23%" (`CompetitorPanel.tsx:515–522`) renders those percentages in Inter body, not Geist Mono tabular-nums. M11 requires every real number in mono. The big `23%` hero and chart labels are correctly mono, but the prose figures are not.
**Fix:** Wrap the inline percentages in the mono/tabular class, or accept prose-mono mixing only if it's a deliberate documented exception. File: `CompetitorPanel.tsx:515–522`.

---

## P3 — nice-to-have

### 10. Chart end-callout `23%` can collide with the card's right padding
**Problem:** `ShareOfVoice.tsx:171–181` places the callout at `toX(last)+6` with no right reservation; at the rightmost data point it sits flush to the plot edge.
**Fix:** Reserve ~28px right padding in the chart `PAD.right` or right-anchor the final label.

### 11. Co-citation "shared queries" stat lacks the signature micro-sparkline (M4)
**Problem:** M4's engine micro-sparkline is the product's signature detail; the co-citation rows (`CompetitorPanel.tsx:474–480`) show a bare mono number. A tiny sparkline of co-citation trend would transfer the signature here.
**Fix:** Optional — add the 24×64 sparkline to co-citation rows for cross-surface consistency.

### 12. Entrance stagger uses fixed `craft-enter-N` classes capped at 8 — later gap rows get no stagger
**Problem:** `CompetitorPanel.tsx:386` caps the stagger index at 8; tables with >4 gaps lose the choreography on later rows. Minor.
**Fix:** Drive stagger via CSS `--index` var instead of fixed classes so it scales.

---

## Per-state notes

**populated-desktop (captured, viewport-only):** Strongest part of the page is the SoV hero card — real TIER-1 depth, correct 64px mono figure, `+5% this week` in green mono, clean eyebrow. Weakest is the chart inside it (P1 #1). Header has an unresolved right dead zone (P1 #4). Accent discipline is good — blue is on links/chips/CTAs only, violet only on the competitor series (M6 respected at a glance). The tracked-competitor chip row correctly recedes as a TIER-3 inset. Everything below "Visibility gaps" (the `7` count is visible at the very bottom edge) is cut off and unverified.

**empty (NOT captured — this is the real-user default, P1 #3):** Unverified. Highest-risk omission since it ships to all non-demo users.

**loading (NOT captured):** Skeleton exists in source and matches layout shape (`CompetitorPanel.tsx:122–180`) — looks well-formed in code but unverified.

**error (NOT captured):** `ErrorState` with `onRetry` wired in source (`:585–595`); copy names a recovery. Unverified.

**mobile 375px (NOT captured):** Table collapses to single-column via `sm:` breakpoints in source; the chart is `viewBox`-scaled so should fit; the header stacks. All UNVERIFIED — responsive is a known blind spot here.
