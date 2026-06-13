---
page: /dashboard
route: /dashboard
states_audited:
  - populated-desktop.png
  - empty-desktop.png
  - populated-mobile.png
competitor_refs:
  - Profound-Screenshot 2026-06-12 at 10.36.25 AM.png (loading state)
  - Profound-Screenshot 2026-06-12 at 10.38.02 AM.png (welcome + brand-visibility trend chart)
  - Profound-Screenshot 2026-06-12 at 10.39.14 AM.png (citation-share line chart + shaded in-cell tables)
  - otterly-Screenshot 2026-06-12 at 10.44.17 AM.png (onboarding + skeleton dashboard)
  - dashboard/north-star-plausible.png (KPI ribbon + dominant chart + dense tables)
  - dashboard/dense-kpi-ribbon.webp (black KPI ribbon, oversized numbers / tiny captions)
verdict: NEEDS_WORK
---

# dashboard — UI Excellence Audit

## Screenshots

- [populated-desktop](screenshots/dashboard/populated-desktop.png)
- [empty-desktop](screenshots/dashboard/empty-desktop.png)
- [populated-mobile](screenshots/dashboard/populated-mobile.png)

> Note: all three captures are **viewport-only** (≈720px tall), not full-page. The audit covers the above-the-fold hero + crew + the top of the engine section. The wins ledger and full engine breakdown were read from source (`VisibilityScorePanel.tsx`, `WeeklyNarrative.tsx`) but not seen rendered — flagged where relevant.

## Verdict

**NEEDS_WORK.** This is the shipped craft exemplar and it shows — the code lands most of the 12 moves cleanly (one TIER-1 hero ring, the Fraunces beat on the band word, violet crew zone, mono numbers, designed empty states, reduced-motion-safe entrance). At desktop the populated state genuinely sits near the competitor bar. But it does **not** yet reach Profound/Plausible's defining strength: **the trend over time is invisible**. Profound leads every view with a full citation-share line chart; Plausible's whole dashboard is one dominant area chart. Beamix's "trend" is a single tiny 64px sparkline tucked in an engine-card corner — the one thing GEO buyers actually want to watch (am I climbing?) is the weakest element on the page. The **mobile state is the real problem**: the hero verdict wraps to 3 ragged lines, the ring is dead-center-symmetric (tell #5), and the card carries large dead vertical space. There are also two genuine render bugs (blue-as-prose in the cohort strip; clipped/whitespace empty engine card).

---

## P1 — must fix (looks AI / broken)

### 1. Mobile hero verdict wraps to 3 ragged lines — reads broken
`ScoreHeroPanel.tsx:102-122` (VerdictLine) + `:315` (flex layout)
On the 375px capture the 30px verdict renders as **"You're showing up — / *Good* — across AI / search"** — three lines, with the Fraunces italic "Good" stranded on its own line mid-sentence and an orphan "search" on line 3. The em-dashes float at line-ends. Against Profound's mobile-clean "Brand Visibility 65% +5%" this looks unfinished. **Why it reads broken:** the editorial serif beat (M5) only works *inline* in a flowing sentence; broken across 3 lines it reads like wrap garbage, not a designed moment. **Fix (M2/M5):** drop the mobile verdict to ~22–24px (`text-[22px] sm:text-[30px]`), tighten the ring-to-text stack, and/or shorten the mobile sentence so the band word never strands. Keep 30px desktop only.

### 2. Mobile hero is dead-center symmetric with heavy dead space (tell #5)
`ScoreHeroPanel.tsx:315` — `flex flex-col items-center ... gap-8 p-8`
On mobile the 200px ring sits centered with the 64px figure, then a centered text block — a bare centered ring-in-air stack, the exact AI silhouette tell #5 warns against, and there is a large empty band between the ring and the wrapped verdict. Profound and Otterly never center a giant ring with air around it on mobile; they go left-aligned and compact. **Fix (M2/M3):** on mobile shrink the ring (200 → ~140px), left-align the text, and kill `gap-8 p-8` on small screens (use `gap-5 p-5`). Reclaim the dead vertical space.

### 3. Blue used as body prose in the cohort strip (brand-law leak / tell #8)
`FoundingCohortPanel.tsx:47` — `<span className="font-medium text-accent"> — {spotsLabel}</span>`
"Founding cohort **— 100 slots remaining**" renders the slots phrase in `#3370FF` inline in a sentence (visible blue text on both desktop and mobile). Blue `#3370FF` is reserved for **your actions** (CTAs, links, active nav) — using it as decorative emphasis inside running prose dilutes the you-vs-agents signal and reads like a hyperlink that isn't one. **Why it reads AI:** accent-as-token-detail rather than spatial signal (tell #8). **Fix:** make the count `font-semibold text-[#0A0A0A]` (the mono `enrolledCount/capacity` figure on the right already carries the blue accent legitimately as the data point). Reserve blue text for true links only.

### 4. The trend over time — the buyer's #1 question — is nearly invisible
`VisibilityScorePanel.tsx` (sparkline only) + `EngineMicroSparkline.tsx:28` (`WIDTH = 64, HEIGHT = 24`)
Profound's dashboard *opens* with a full-width citation-share line chart with date axis and a +/- delta; Plausible's entire hero is one dominant area chart. Beamix's only trend visualization is a **64×24px polyline in the top-right corner of each engine card** — at arm's length it's invisible, and the overall score ring shows no history at all. For a GEO product the question "am I climbing?" is the whole point, and right now the dashboard answers it weaker than both competitors. **Why it reads under-built:** the signature detail (M4) is present but under-scaled; the dominant-chart move from the north-stars was not absorbed. **Fix (M4/M3/M10):** add ONE dominant trend element near the hero — an overall-score sparkline/area strip (last ~8 weeks) under or beside the ring, score-band colored, mono delta label. This is the single biggest gap to the competitor bar. Do not fake data — show the designed empty baseline when history < 2 points.

### 5. Empty-state focus engine card clips / leaves dead space at the fold; four "run a scan" CTAs stack
`VisibilityScorePanel.tsx:162-204` (null FocusEngineCard) — seen in empty-desktop
In the empty-desktop capture the "ChatGPT --/100 · No data yet · Run scan" focus card is cut off at the viewport bottom with its CTA half-visible, and the Gemini inset reads "Waiting on first scan" beside large empty area. Combined with the already-empty hero ("Run your first scan") and empty crew panel, the empty dashboard stacks **four** separate "run a scan" CTAs above/near the fold (hero primary, hero secondary, crew primary, engine primary) — repetitive and template-like. **Fix (M8/M10):** in the global empty state, collapse the per-engine breakdown to a single quiet "Engines report after your first scan" inset line (no per-engine CTA duplication), so the hero owns the one primary CTA. One ask, not four.

---

## P2 — substantive

### 6. Engine breakdown still reads as cards-in-a-row at a glance (tell #2 residual)
`VisibilityScorePanel.tsx:330` — `grid-cols-1 lg:grid-cols-[1fr_300px]` with stacked insets
The intentional-asymmetry move (M3) is real in code — wider focus card + narrower stacked insets — but in the populated-desktop render the GEMINI 64 and CHATGPT 71 cards read as two near-equal tiles with matching internal layout (eyebrow top-left, sparkline top-right, big number, "Updated 2 days ago"). The size delta is too subtle to feel asymmetric at arm's length, so it still pattern-matches the equal-card grid. **Fix (M3/M7):** widen the focus/inset ratio (`[1.6fr_280px]`), and differentiate the focus card harder — larger figure (push focus 36 → 44 while insets stay 26), keep the progress rail, and add a one-line "lowest — start here" lead so the eye is *told* which engine matters.

### 7. Trend signal split between a prose pill and "3/3 engines reporting"
`ScoreHeroPanel.tsx:75-96, 324-330`
The TrendBadge rounded pill sits next to "3/3 engines reporting" in plain mono and the two compete weakly. Profound pairs its number with a single colored delta ("65% +5%") that reads instantly. **Fix (M7):** fold the trend into a mono delta token next to the score (e.g. `71` with a small `▲ +4` in `--color-status-positive`) rather than a separate prose pill, matching the competitor's at-a-glance delta convention.

### 8. "View scans" header button is a lone outline button competing with the hero CTA
`page.tsx:74-80` via `PageHeader`
On desktop the only header action is a single ghost/outline "View scans" button, far from the hero's "Run scan" primary — two scan entry points with unclear hierarchy. On mobile it drops under the title as a lone bordered pill with air around it (populated-mobile). **Fix:** either remove it from the header (the hero "Run scan" + engine history links already cover navigation) or demote it to a quiet text link to reduce competing-CTA noise.

### 9. Founding cohort progress bar at 0% reads like a stalled loader
`FoundingCohortPanel.tsx:59-63` — empty progress at `pct = 0`
With `pct = 0` the bar is an empty grey track and the copy is "0% filled · 100 slots remaining" — a zero-progress bar at the very top of a fresh dashboard reads like something failed to load, not a scarcity signal. **Fix:** when `pct === 0`, suppress the bar (or render a single filled pip) and lead with the scarcity line; a 0% bar is worse than no bar.

### 10. Crew panel repeats an identical Sparkles avatar + "ready" pill on every row
`AgentActivityPanel.tsx:152-174`
Three rows each with an identical violet Sparkles avatar + identical "ready" pill = within-panel uniformity (tell #1/#4 at row level). Linear's activity logs vary the leading glyph by action type. **Fix (M4/M7):** vary the row glyph by fix type (FAQ / rewrite / competitor) and let the "ready" pill be the only repeated element, or replace the pill with a relative timestamp ("2h ago") in mono for log density closer to Profound's agent-analytics rows.

---

## P3 — nice-to-have

### 11. Hero card gradient is imperceptible (effectively a no-op)
`ScoreHeroPanel.tsx:67` — `linear-gradient(135deg, #FFFFFF 0%, var(--color-surface-warm) 100%)`
`#FFFFFF → #F7F6F2` is a ~4-unit shift; at the rendered size it's invisible and the card reads flat white. Either commit to a felt warm wash or drop the gradient (currently it adds code without a visible result).

### 12. Sparklines self-scale per card, so slope is dishonest
`EngineMicroSparkline.tsx:62-72` — min/max auto-scaled per engine
Each sparkline scales to its own min/max, so a 70→72 move looks as dramatic as 20→80. **Fix (M11 truth):** scale all sparklines to a shared 0–100 domain (or a fixed band) so the slope is comparable and honest across engines.

### 13. Relative time uses day-rounding
`VisibilityScorePanel.tsx:136-144, 265-275`
Day-rounding means a 30h-old and a 44h-old scan both say "2 days ago." Minor; Profound shows exact dates on its axis. Acceptable for now.

### 14. Wins ledger and full engine grid unseen in render
`WeeklyNarrative.tsx`, lower `VisibilityScorePanel.tsx`
Source looks correct (divide-y rows, hover `#F4F6FA`, mono win count, designed empty) but was not captured below the fold. Recommend a full-page screenshot pass before sign-off to confirm the M12 rhythm (40px/48px gaps) reads and the wins empty state isn't a third near-identical "run a scan" block.

---

## Per-state notes

**populated-desktop** — The strongest state and genuinely near the bar. One clear TIER-1 ring hero (71, green band), Fraunces "*Good*" beat inline, violet crew zone glanceable at arm's length with the breathing dot, mono numbers throughout, real depth ramp between hero/crew/engine cards. Main gaps: no dominant trend chart (P1-4), engine tiles read near-equal (P2-6), cohort blue-prose leak (P1-3).

**empty-desktop** — A real designed empty state (dashed ring + "?", "Your first scan sets the baseline", "The crew is watching"), well above the typical bare-centered-icon empty. But it stacks four "run a scan" CTAs near the fold and the focus engine card clips at the viewport bottom (P1-5). Otterly's empty (skeleton-glyph dashboard behind onboarding) feels more premium-while-empty because it implies the shape of the populated view; Beamix could echo that with a single ghosted trend strip instead of repeating CTAs.

**populated-mobile** — The weakest state. Verdict wraps to 3 ragged lines with the serif beat stranded (P1-1); the 200px ring is dead-center with heavy dead vertical space (P1-2); the cohort blue-prose leak is more prominent on the narrow column (P1-3); the lone "View scans" outline button floats under the title (P2-8). Needs a dedicated mobile pass — shrink the ring, left-align and resize the verdict, compress padding.
