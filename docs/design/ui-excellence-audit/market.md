---
page: /market — Market Intelligence & Prompt Volume
route: /market (apps/web/src/app/(protected)/market)
states_audited:
  - populated-desktop.png  (only state captured)
states_missing:
  - empty-desktop  (NOT captured — could not audit)
  - error  (NOT captured)
  - loading / skeleton  (NOT captured)
  - populated-mobile (375)  (NOT captured — responsive unverified)
competitor_refs_used:
  - Profound-Screenshot 2026-06-12 at 10.38.57 AM.png  (Answer Engine Insights: line chart + ranked asset table)
  - Profound-Screenshot 2026-06-12 at 10.39.25 AM.png  (prompts visibility table)
  - Profound-Screenshot 2026-06-12 at 10.39.46 AM.png  (content workbench)
  - otterly-Screenshot 2026-06-12 at 10.44.17 AM.png  (onboarding + ghosted dashboard preview)
verdict: NEEDS_WORK
---

# market — UI Excellence Audit

## Screenshots

- [populated-desktop.png](./screenshots/market/populated-desktop.png) — the ONLY captured state. Desktop viewport (≈1280 wide), above-the-fold only; the chart, prompt table, audience and co-citation panels below the fold were NOT captured.

> Coverage caveat: empty / error / loading / mobile states were not captured, so this audit grades only the populated desktop above-the-fold. The source confirms those states exist (MarketWorkbench.tsx:159-222) but they are unverified visually. A second capture pass is required before a PASS can be issued.

## Verdict

**NEEDS_WORK.** This is a genuinely craft-conscious build — it is NOT vibe-coded slop. The 4-step type contract is real, the Fraunces "wide-open" beat is present, numbers are Geist Mono, the scope rail is a TIER-3 inset, and the asymmetric 1fr/360px hero is correct intent. It sits credibly beside the shipped #173 dashboard. BUT it does not yet clear the Profound bar on two counts: (1) the hero violates the "one TIER-1 focal" law — the blue 48,200 figure and the donut's "20,800 UNCLAIMED" read as two co-equal hero numbers, so nothing commands (tell #1/#3, M1/M10); and (2) the hero donut renders mostly as an empty grey ring, which reads as a broken/loading chart rather than a confident data object — Profound's hero charts always read finished. Several smaller polish gaps below.

## P1 — must fix (looks AI / broken)

### 1. The hero has TWO competing focal numbers — the "one TIER-1" law is broken
**Problem:** The blue 64px mono `48,200` (MarketHeroPanel.tsx:175-177) is supposed to be the single TIER-1 focal. But the intent donut on the right renders a `20,800` figure at 26px mono + an "UNCLAIMED" eyebrow dead-center of a 168px ring (MarketHeroPanel.tsx:116-121). At arm's length these two numbers read as co-equal heroes — the eye ping-pongs and nothing wins.
**Why it reads AI/broken vs the ref:** Profound's "Visibility Score" hero (ref 10.38.57) has exactly ONE big number (`72.9%`) and the adjacent rank panel uses a small `#1` — the hierarchy is unmistakable. Here the verdict sentence even repeats `20,800` a third time (MarketHeroPanel.tsx:184), so the same number appears three times in the hero with no single dominant expression. That triple-statement of one figure is a tell-#3 (evenly-weighted) signature.
**Fix (M1 + M10):** Demote the donut's center label hard — drop it to ~16px and remove the "UNCLAIMED" eyebrow from the ring center (the legend below already labels intents). Let `48,200` be the only number above ~30px in the hero. Alternatively, restructure so the donut center is purely the donut's job (intent split) and `20,800 unclaimed` lives only in the verdict sentence as the narrative payoff.
**File:** `MarketHeroPanel.tsx:114-122`.

### 2. The hero donut renders as a mostly-empty grey ring — reads as broken/loading
**Problem:** In the render, the donut is ~75% bare grey track with only a thin blue/violet sliver filled (visible top-right of hero). The `var(--color-data-grid)` background circle (MarketHeroPanel.tsx:83-90) dominates because the colored segments are a small fraction of the visible circumference, OR the segment math is leaving most of the ring unstroked.
**Why it reads AI/broken vs the ref:** A donut that is 75% empty grey looks like a skeleton/loading placeholder, not finished data. Profound's charts (ref 10.38.57) always read complete and intentional. An almost-empty ring next to a confident 64px number is the single most "unfinished" tell on this screen.
**Fix:** Verify the segment dasharray math sums to ~100% of `CIRC` (MarketHeroPanel.tsx:91-112) — the segments should fill the full ring split by intent, not leave a grey majority. If the intent of the grey is "unclaimed share," make that explicit (a labeled grey segment), don't let it read as missing data. Confirm against the live fixture totals.
**File:** `MarketHeroPanel.tsx:70-112`.

### 3. The chart's "Agent promoted content" violet label floats centered and disconnected
**Problem:** The violet `ReferenceLine` label "Agent promoted content" (PromptVolumeChart.tsx:168-179) renders centered near the top of the chart, visually detached from any vertical line at W6, looking like a stray floating caption.
**Why it reads AI/broken vs the ref:** A label hovering in dead space with no clear anchor reads as a layout bug. The violet=agents promise (M6, tell #8) is supposed to be glanceable and structural; instead it currently looks like misplaced text. Profound anchors every annotation tightly to its mark.
**Fix (M6):** Anchor the label to the W6 reference line with a small violet dot/flag at the line top and `position: insideTopLeft` or a leader, so it reads as "this line = an agent run." Consider a faint `#EEEAFD` band behind the post-W6 region so the agent moment is spatial, not a floating string.
**File:** `PromptVolumeChart.tsx:167-179`.

## P2 — substantive

### 4. Hero gradient is nearly invisible — the TIER-1 card doesn't feel elevated
**Problem:** The hero uses `linear-gradient(135deg, #FFFFFF → --color-surface-warm)` (MarketHeroPanel.tsx:162-164). In the render the warm tint is so subtle the hero card is hard to distinguish from the white chart card below it; the depth-staging between TIER-1 (hero) and TIER-2 (chart) is barely felt.
**Why it matters (M1):** "3 felt tiers" requires the hero to visibly out-rank the standard cards. Right now the only differentiator is `card-console-hero`'s shadow, which is faint at this zoom. The Profound hero block sits clearly above its share-of-voice block.
**Fix:** Strengthen the warm wash a touch and ensure `--shadow-card-hero` is materially heavier than `--shadow-card`. Verify the two shadows are not near-identical.
**File:** `MarketHeroPanel.tsx:158-165`.

### 5. Region/Intent rail items are visually near-identical — five identical blue pills, no sense of selection
**Problem:** The scope-rail toggles use `bg-[#EEF2FF] text-[#3370FF]` when active (MarketScopeRail.tsx:73). In the render every region (Israel/US/UK/Germany/Global) shows as a filled blue-tint pill simultaneously, so the rail is a wall of five identical blue pills — there is no sense of which is "selected" vs "all on," and it competes with the left sidebar's active "Market" nav item which uses the same blue-tint treatment.
**Why it matters (M12 / tell #3):** Five identical filled pills is a mini N-equal pattern; nothing recedes. Profound's filter rows are quiet until interacted with.
**Fix:** Default state should be quiet (dot + label, no fill); fill only the chips a user has actively isolated, or invert (filled = excluded). Differentiate the rail's active treatment from the global nav's active treatment so they don't read as the same control.
**File:** `MarketScopeRail.tsx:57-86, 122-152`.

### 6. Timeframe segmented control active state is faint
**Problem:** The `7d / 30d / 90d / Custom` control (MarketScopeRail.tsx:90-117) shows the active "30d" with only a white bg + 1px ring inside a `#F3F4F6` track. At render this is a very low-contrast selected state — easy to miss which timeframe is active.
**Fix (M2/contrast):** Add a touch more elevation or a clearer indicator to the active segment, or darken the active label to `#0A0A0A`. Verify against WCAG non-text contrast for the selected indicator.
**File:** `MarketScopeRail.tsx:104-110`.

### 7. "Reset filters" anchor sits orphaned in dead space at the rail bottom
**Problem:** The "Reset filters" link (MarketScopeRail.tsx:155-163) renders far below the Intent group with a large gap, floating with no hairline or grouping — reads as leftover.
**Fix (M12):** Tie it to the rail with a top hairline (`border-t border-[#F0F1F3] pt-4`) so it reads as a deliberate footer action, not orphaned text.
**File:** `MarketScopeRail.tsx:155-163`.

## P3 — nice-to-have

### 8. Delta chip mixes mono + sans inside one pill — slightly busy
The `+9% vs. previous 30d` chip (MarketHeroPanel.tsx:133-144) puts mono `+9%` next to sans "vs. previous 30d" in a green pill. It works (M11 truth-in-mono) but the inline sans caption inside a status pill is a little dense. Consider moving "vs. previous 30d" outside the pill as muted caption text so the pill carries only the delta. `MarketHeroPanel.tsx:127-145`.

### 9. Verdict sentence wraps to 3 lines and slightly crowds the donut
At this width the verdict "A *wide-open* category: 20,800 of these monthly prompts cite nobody" wraps to 3 lines (max-w-540px) and runs close to the donut rail. Tighten `max-w` or rebalance the 1fr/360px split so the verdict breathes. `MarketHeroPanel.tsx:180-186`.

### 10. Chart y-axis starts with a large empty top margin
The area chart (visible bottom of capture) shows a tall empty band above the stacked areas before the "34k/26k" ticks. The `margin top:24` plus the agent-label reservation leaves a lot of dead vertical space. Consider a tighter domain so the data fills more of the 300px height. `PromptVolumeChart.tsx:139-141, 158-164`.

## Per-state notes

**populated (desktop, above-the-fold):** Audited. Core craft intent is present and correct; the two issues that keep it from PASS are the dual-hero-figure problem (P1#1) and the mostly-empty donut ring (P1#2), plus the floating agent label (P1#3). Below-the-fold (prompt table, trending panel, audience bars, co-citation, drill drawer) was NOT captured and is unaudited — the source shows strong intent (weighted 2-up grids, micro-sparklines, the Track→Tracking violet flip) but none of it is visually verified.

**empty / error / loading:** NOT captured. Source (MarketWorkbench.tsx:161-212) shows a designed two-tier empty (preview + primary pill + quiet "See a sample report" link + scan illustration) and a named-recovery error — these match M8 intent on paper but are visually unverified.

**mobile (375):** NOT captured. The hero uses `lg:grid-cols-[1fr_360px]` and tables use `lg:grid-cols-[1.5fr_1fr]`, so the single-column fallback below `lg` is plausible but unverified. Responsive correctness, the 168px donut on a narrow column, and the recharts areas at 375px are all RISK and must be captured before ship.

## Bottom line
Closest competitor analog is Profound's Answer Engine Insights (one dominant chart + ranked table, single hero number). Beamix /market is architecturally on par and stylistically warmer/more editorial — but it loses the "one number commands" discipline Profound nails, and the half-empty hero donut undercuts the finished feeling. Fix the three P1s and capture the four missing states, then re-audit.
