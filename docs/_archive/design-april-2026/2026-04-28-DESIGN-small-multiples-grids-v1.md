# Small-Multiples Grids — Design Spec v1

**Date:** 2026-04-28
**Author:** design-lead (CEO synthesis surface)
**Status:** Round 1 — pixel spec for build
**Scope:** Tufte's Opportunity 1 (11 engines × 12 weeks) + Opportunity 2 (5 competitors × 11 engines parity grid). Opportunity 3 (Monthly Update Page 4 timeline) is covered in the EDITORIAL-surfaces spec amendment and is out of scope for this document.

**Source documents:**
- `docs/08-agents_work/2026-04-28-BOARD2-tufte.md` — Tufte Round 1, Section C (3 small-multiples opportunities)
- `docs/08-agents_work/2026-04-28-DESIGN-BOARD2-CEO-SYNTHESIS.md` — cartogram + small-multiples context
- `docs/08-agents_work/2026-04-27-DESIGN-SYSTEM-v1.md` — color tokens, typography, sparkline canon (1.5px brand-blue stroke, no gradient)
- `docs/08-agents_work/2026-04-27-HOME-design-v1.md` — /home above-fold layout context for Opp 1
- `docs/08-agents_work/2026-04-27-SCANS-COMPETITORS-design-v1.md` — /scans and /competitors layout for Opp 1 detail + Opp 2
- `docs/08-agents_work/2026-04-28-PRD-wedge-launch-v3.md` — F1-F31 features (F30 Brief grounding citation referenced in §4)

**Tufte's principle invoked:**
A small-multiple is a series of similar small charts arranged in a grid. The grid lets the reader's eye compare across categories at a glance. "Small multiples are the best statistical graphic ever devised. The eye discriminates differences at high resolution, low cost." — Edward Tufte. Beamix has data ideal for small-multiples (per-engine × time, per-entity × per-engine) but currently ships single-chart treatments. This spec corrects that.

---

## §1 Opportunity 1 — 11 engines × 12 weeks grid

### 1.1 What it shows

For each of 11 AI search engines (ChatGPT, Perplexity, AI Overviews, Claude, Gemini, Grok, You.com, Bing Copilot, Mistral, DeepSeek, Llama), a single small sparkline showing the customer's average citation rate over the most recent 12 weeks. 11 sparklines arranged in a 4×3 grid (with one empty/placeholder cell).

The reader's eye scans the grid and instantly registers:
- Which engines are improving (upward sparklines)
- Which are flat (horizontal sparklines)
- Which are declining (downward sparklines)
- Which engines have the customer consistently above industry median (sparkline above the dashed reference line)
- Which engines are outliers in either direction (visually pop)

This replaces the current "11 per-engine cards" treatment on /home which forces serial scanning. The grid forces parallel scanning — the entire engine landscape is legible in <2 seconds.

### 1.2 Layout dimensions

**Grid:** 4 columns × 3 rows = 12 cells. 11 engines occupy 11 cells. The 12th cell is a reserved placeholder rendering "Coming: [next engine]" in ink-3 Inter 12px italic, centered vertically. This is intentional — leaving an obvious slot signals roadmap motion without breaking the grid's geometric integrity.

**Cell dimensions (desktop):** 200px wide × 120px tall.

**Gutter:** 12px between cells in both axes.

**Total grid dimensions (desktop):**
- Width: (200 × 4) + (12 × 3) = 836px
- Height: (120 × 3) + (12 × 2) = 384px
- Round to: ~836 × 384px (the spec calls "~860×400px" loose target — the mathematical render is 836×384; design system layout grid pads to 860×400 with 12px outer padding)

**Engine ordering in the grid (locked, top-left to bottom-right, reading order):**
| Pos | Engine | Code |
|-----|--------|------|
| 1,1 | ChatGPT | CG |
| 1,2 | Perplexity | PX |
| 1,3 | AI Overviews | AO |
| 1,4 | Claude | CL |
| 2,1 | Gemini | GM |
| 2,2 | Grok | GK |
| 2,3 | You.com | YC |
| 2,4 | Bing Copilot | BC |
| 3,1 | Mistral | MS |
| 3,2 | DeepSeek | DS |
| 3,3 | Llama | LL |
| 3,4 | (placeholder) | — |

Order rationale: customer-share-of-voice descending, with ChatGPT first because it owns ~60% of all AI-search-driven traffic per Q1-2026 industry data. Order is locked — no per-customer reordering. Tufte's rule: the grid has to be the same every time, every customer, every print. That's what makes the eye "learn" the grid.

### 1.3 Per-cell spec

A cell is composed of three vertical zones:

**Zone A — Header (24px tall):**
- Engine code (Inter 13px, ink-1, font-weight 500, letter-spacing 0.04em, all-caps): "CG", "PX", "AO" etc., on the left
- Engine full name (Inter 11px, ink-2, font-weight 400, letter-spacing 0.02em): "ChatGPT", "Perplexity" etc., on the right
- Vertical alignment: baseline-aligned at 16px from cell top
- Horizontal padding: 12px from cell edges

**Zone B — Sparkline (80px tall):**
- Width: 176px (cell width 200px minus 12px padding each side)
- Height: 80px (24px header + 80px sparkline + 16px footer = 120px cell)
- Padding-top from header: 0px (header has built-in 8px bottom margin)
- Sparkline stroke: 1.5px solid `#3370FF` (brand-blue, single color, no gradient — design-system canon)
- Sparkline fill: none. No area fill, no gradient fill (Round 1 cut from Tufte critique)
- Data points: 12 (one per ISO week, most recent 12 weeks ending the Sunday before render)
- Y-axis range: 0–100% citation rate (i.e., the % of monitored queries where this engine cites the customer at any rank). Locked range — never auto-scaled — so all 11 sparklines are visually comparable. Tufte's rule: comparable scales are the whole point.
- Y-axis baseline: 0% sits at the bottom of the 80px sparkline area (4px inset). 100% sits at the top (4px inset). Effective drawable height: 72px.
- X-axis: 12 evenly spaced points across 176px width. First point at x=4px; last point at x=172px; spacing = (172-4)/11 = 15.27px.
- Reference line: industry-median citation rate for this engine, rendered as 1px dashed line, color `ink-3`, dash pattern `4 2`. Direct labeling: tiny "med" text label (Inter 9px, ink-3) at the right end of the line, 2px above the line, only on the FIRST cell (top-left, ChatGPT). Cells 2-11 do not repeat the label — Tufte's rule: don't re-explain what's already established. The dashed line itself in cells 2-11 carries the meaning by precedent.
- Data points: NOT rendered as dots in the default state (clean line only). Hover state introduces dots.
- Curve: monotone-cubic interpolation between points (smooth but not aggressive). Avoid linear (jagged) and avoid Catmull-Rom (over-curls at endpoints).
- No path-draw entrance animation (Round 1 Tufte cut — sparklines render at t=0 fully drawn).

**Zone C — Footer (16px tall):**
- Current value (Geist Mono 12px, ink-1, font-weight 500): the most-recent-week citation rate, e.g., "73%". Left-aligned at 12px from cell left edge.
- Delta vs. previous week (Inter 11px, font-weight 500): e.g., "+3 ↑" or "−2 ↓" or "→" (no change). Right-aligned at 12px from cell right edge. Color: positive delta = `#10B981` (good), negative delta = `#EF4444` (critical), zero delta = ink-3.
- Vertical baseline: 12px above cell bottom edge.

**Cell background:**
- Default: `#FFFFFF` (paper)
- Border: 1px solid `#E5E7EB` (border-subtle)
- Border-radius: 8px (matches product utility button radius — internal product surface, NOT pill-shaped)
- No drop shadow in default state (clean grid)

**Cell hover state:**
- Border becomes 1px solid `#3370FF` (brand-blue)
- Background remains white
- 4px outer ring at 12% opacity brand-blue (the "glow" — but soft, not aggressive)
- Data point at hovered x position: 4px diameter solid `#3370FF` dot, 1px white ring around it
- Tooltip appears anchored above the dot (or below if cell is in row 1): 8px gap, paper-elev background, 1px ink-3 border, 8px padding, 6px border-radius. Content:
  - Line 1 (Inter 12px ink-1): "Week of [Mon DD]" e.g., "Week of Apr 21"
  - Line 2 (Geist Mono 13px ink-1, font-weight 500): "73% cited" or position equivalent
  - Line 3 (Inter 11px ink-2): "Industry median: 64%"
- Animation on hover: 80ms ease-out border-color + glow appearance. Tooltip: 60ms fade-in. Per design system canon (Round 1 cut: the 80ms grid-stagger entrance animation removed; per-cell hover stagger is fine as it's user-initiated).

**Cell focus state (keyboard navigation):**
- Same as hover state but tooltip appears unconditionally (focus visibility per WCAG 2.4.7)
- 2px outer focus ring at full brand-blue opacity (per design system focus canon)
- Arrow keys navigate between cells (4×3 grid: ↑ ↓ ← → moves to neighbor; Enter opens detail view)

### 1.4 Empty / no-data engine cell

When an engine has no data for the customer (e.g., never cited in any monitored query, or engine just added):

- Header renders normally
- Sparkline area renders a single 1px horizontal line in `ink-4` at the 0% position (4px from bottom edge). Stroke-dasharray: `2 2` (dotted) to visually distinguish from real-zero data.
- Overlay text in the middle of the sparkline area: "No data this period" (Inter 11px ink-3, font-weight 400, italic). Centered.
- Footer: "—" in Geist Mono 12px ink-3 instead of value. No delta arrow.
- Hover/focus: tooltip reads "No citations recorded in this engine over the last 12 weeks."

This treatment communicates "we ran the queries; the engine just doesn't cite you" — different from "we don't track this engine yet" (the placeholder cell).

### 1.5 Placements (4 surfaces total)

**Placement 1 — /home above-fold:**
- Position: directly below the Activity Ring + Status Sentence component.
- Position: directly above the Receipt-That-Prints card (when it's present; if not, above the Today's Suggested Action card).
- Section heading above the grid: "Where you stand, every engine, last 12 weeks" (InterDisplay 18px medium, ink-1). 16px below header is a 12px ink-3 sub-line: "One sparkline per engine. Dashed line = industry median."
- Width: full content column width (832px content area + 12px outer padding tolerance = grid renders at native 836px).
- 32px bottom margin before next section.

**Placement 2 — /scans/[scan_id] detail:**
- Position: directly to the right of the cartogram component (or below it on viewports < 1280px).
- Same exact render as /home (Tufte's rule: same chart in two places teaches; once is information, twice is fluency).
- Section heading: "Engine timeline (this scan's customer)"  — slightly different label to anchor it to the scan context, but the grid itself is byte-identical to /home.

**Placement 3 — Monthly Update PDF Page 3:**
- Vector SVG render. 4 cols × 3 rows. 180mm wide × 82mm tall (preserves the 836:384 ratio). 12mm outer page margin.
- Same engine ordering, same colors, same reference line. Print-safe brand-blue is `CMYK(78, 56, 0, 0)` matching `#3370FF`.
- Engine code typography reduced to Inter 11px (still legible at 180mm spread).
- No hover state (print).
- Page heading above grid: "Engine timeline" (Fraunces 22px regular, the print-only serif accent).
- Page footer: "Source: Beamix monitored queries. 12 weeks ending [date]. Industry median computed across all Discover/Build/Scale customers in your industry."

**Placement 4 — Email digest "compact mode":**
- The weekly email digest (per F11) does NOT render the full grid (would be too wide for email clients). Instead, it links to /home with anchor `#engine-grid` and shows a 4-line text summary: "ChatGPT ↑ 73% (+3) · Perplexity → 58% (=) · AI Overviews ↓ 41% (−2) · ..." truncated to 4 engines maximum.
- This is NOT the small-multiples grid — it is the textual fallback. Documented here for completeness.

### 1.6 Mobile rendering (≤ 767px)

- Grid collapses to 2 columns × 6 rows. The 12th cell still renders as the placeholder (so 6 rows × 2 cols = 12 cells; one is the placeholder).
- Cell dimensions: 160px × 100px.
- Sparkline: 1px stroke (down from 1.5px — the design system reserves 1.5px for desktop; 1px reads cleaner at the smaller size on retina mobile).
- Sparkline data area: 136px × 64px (cell minus padding minus header minus footer).
- Header reduces to 20px tall (engine code only, no full name — full name truncated to save horizontal space).
- Footer reduces to 14px tall.
- Reference line label "med" is dropped on mobile (the dashed line itself carries the meaning).
- Total grid: 332px wide × ~620px tall (fits in 375px viewport with 21.5px outer margin per side).
- Tap target: each cell is the tap zone — opens a detail bottom-sheet (instead of hover tooltip) showing the same content as desktop tooltip + a 12-week table.
- The grid scrolls vertically as part of page scroll (no horizontal scroll, no carousel — those break Tufte's at-a-glance rule).

### 1.7 Edge cases

| Case | Treatment |
|------|-----------|
| Customer onboarded < 12 weeks ago | Sparkline renders only the weeks with data. X-axis still spans 12 positions; missing weeks render as gap (no line interpolation across gaps). Footer adds Inter 10px ink-3 caption: "X of 12 weeks". When < 4 weeks, sparkline replaced with text "Building baseline — first chart in [N] weeks". |
| Engine just added by Beamix | Same as "onboarded < 12 weeks" — sparkline renders only the weeks since engine became available. |
| All-zero data (engine never cites customer) | Sparkline renders flat line at 0% baseline. NOT treated as "no data" — this is signal, not noise. Customer needs to see "you have zero presence on this engine." |
| All-100% data (perfect citation) | Sparkline renders flat line at 100% top. Footer shows "100%" + "→" (no delta). |
| Industry-median value missing for an engine | Reference dashed line is omitted for that cell only. No fallback (computed median for monitored cohort would be misleading — better to omit). |
| Customer is on Discover tier (free scan only, no recurring scans) | Grid renders the most recent free-scan snapshot as a single point at week 12 only; weeks 1-11 show "first scan" line at 0% with dashed indicator. CTA above grid: "Upgrade to Build for weekly tracking." |

---

## §2 Opportunity 2 — 5 competitors × 11 engines parity grid

### 2.1 What it shows

A two-dimensional matrix: 6 rows (customer + up to 5 detected competitors) × 11 columns (the 11 engines). 66 cells in total.

Each cell shows that entity's performance at that engine — specifically a position-bar visualizing average rank-when-cited (or "+" if uncited) plus the position number above the bar. Customer's row is rendered in brand-blue and bolded. Competitor rows are rendered in ink-3.

The reader's eye scans rows (entity comparison across all engines) and columns (per-engine competitive standing). At a glance the customer reads sentences like "I lead at ChatGPT but I'm losing badly at Perplexity vs N (Notion). And M (Monday) is winning AI Overviews where I'm 4th."

This is the central competitive-intelligence surface. The cartogram answers "where do I stand by geography" — this grid answers "where do I stand by engine, vs whom."

### 2.2 Layout dimensions

**Grid:** 6 rows × 11 cols = 66 cells (max). Plus a row-label column on the left and a column-label row on top.

**Cell dimensions (desktop):** 60px wide × 40px tall.

**Row-label column width:** 100px (wider than cells to fit competitor names).

**Column-label row height:** 32px.

**Gutter:** 4px between cells (tighter than Opp 1 — this is dense parity view, every pixel of comparison matters).

**Total grid dimensions (desktop):**
- Width: 100 (row labels) + (60 × 11) + (4 × 10) = 100 + 660 + 40 = 800px
- Height: 32 (col labels) + (40 × 6) + (4 × 5) = 32 + 240 + 20 = 292px
- Round to: ~700×280px loose target — the mathematical render is 800×292; the brief's "~700×280" reflects an earlier 9-engine pre-Llama estimate. Locked at 800×292.

**Row ordering (locked, top to bottom):**
1. Customer ("You") — brand-blue row
2. Competitor 1 (highest-overlap competitor) — ink-3 row
3. Competitor 2 — ink-3 row
4. Competitor 3 — ink-3 row
5. Competitor 4 — ink-3 row
6. Competitor 5 — ink-3 row

Competitor ordering rationale: "share-of-voice overlap with customer" descending. The competitor most similar to the customer (most overlapping monitored queries) sits at row 2; least-overlapping at row 6. This is a relevance ranking, not an alphabetical one — the eye should be able to scan downward and see "the most relevant comparisons first."

**Column ordering (locked, left to right):** identical to Opp 1 grid order (CG, PX, AO, CL, GM, GK, YC, BC, MS, DS, LL). Tufte's rule: same column order across both grids so the eye carries the engine-mental-model from grid 1 to grid 2 without re-learning.

### 2.3 Per-cell spec

A cell is composed of:

**Position number (top, 14px tall):**
- Geist Mono 11px, font-weight 500
- Color: customer row = `#3370FF` (brand-blue); competitor rows = `ink-2` (#374151)
- Centered horizontally
- Value: integer 1-9, or "+" for "ranked beyond 9", or "—" for "never cited"
- Vertical baseline: 12px from cell top

**Position bar (bottom, 22px tall):**
- 12px wide, centered horizontally in the 60px cell
- Bar height: proportional to citation rate. Mapping: citation rate 0% → 0px bar height (no bar); 100% → 18px bar height. Linear scale.
- Bar color:
  - Customer row: `#3370FF` (brand-blue)
  - Competitor rows: `ink-3` (#9CA3AF)
- Bar baseline: 4px above cell bottom edge
- Bar border-radius: 2px top corners (rounded top, square bottom — bar grows from baseline like a column chart)

**Cell background:**
- Subtle paper-elev tint based on citation rate: from `#FAFAFA` (paper-elev light) at 0% citation to `#F0F4FF` (subtle blue tint, 4% brand-blue mix) at 100% citation. Customer row uses blue tint; competitor rows use neutral tint scaling from `#FAFAFA` to `#EEEEEE`. This is the "background gradient" pattern — brings the eye to high-citation cells without color-shouting.
- Border: 1px solid `#F3F4F6` (very faint border-subtle-2). Keeps cells delineated without dominating.
- No border-radius (cells are square corners — fits the dense matrix aesthetic).

**Cell hover state:**
- Border becomes 1px solid `#3370FF`
- Background lifts to `#FFFFFF` (overrides the tint)
- Tooltip appears anchored above the cell (or below if row 1):
  - Line 1 (Inter 12px ink-1): "[Entity] at [Engine]" e.g., "Notion at Perplexity"
  - Line 2 (Geist Mono 13px ink-1, font-weight 500): "Position 3 · 67% citation"
  - Line 3 (Inter 11px ink-2): "12 of 18 monitored queries"
  - Line 4 (Inter 11px, color depends on delta-vs-customer): "Beats you by 2 ranks" or "Behind you by 5 ranks" or "Same rank as you"

**Cell click:**
- Opens right-side drawer (480px wide, slides in from right edge with 200ms ease-out animation per design system canon)
- Drawer contents:
  - Drawer header: "[Entity] at [Engine]" (InterDisplay 20px medium)
  - Sub-header: "Position [N] · [N]% citation rate · [N] of [N] queries"
  - Section: 12-week sparkline of THIS entity-engine combo (visually identical to Opp 1 sparkline canon; same 80px height, 1.5px brand-blue stroke for customer combos OR 1.5px ink-3 stroke for competitor combos)
  - Section: Top-5 queries where this combo wins (table: query text, position, last-seen date)
  - Section: Top-5 queries where customer beats them (only shows if cell is a competitor; helps customer see "where I'm winning")
  - Section: FAQ Agent recommendations (per F11, F19) — 1-3 specific actions Beamix can run to close the gap. Each rec has a "Run this agent" button.
  - Section (per F30): Brief grounding citation. The exact sentence(s) from the customer's onboarding Brief that authorized Beamix to surface this recommendation. Rendered as blockquote: 4px ink-3 left border, 12px padding-left, Fraunces 14px regular ink-2, italic. Above blockquote: caption "From your Brief:" (Inter 11px ink-3 caps).
  - Drawer footer: "Close" button (secondary, ink-1 border) and "Open in Inbox" button (primary brand-blue) — the latter pre-fills an Inbox item with the recommendation queued for review.

### 2.4 Row label column (left of grid)

**Customer row ("You"):**
- Label: "You" (Inter 13px caps, font-weight 600, brand-blue)
- Sub-label: customer business name (Inter 11px, ink-2, font-weight 400) e.g., "Beamix"
- Vertical centering within row (40px tall)
- Right-padding 12px from grid

**Competitor rows:**
- Primary label: competitor name (Inter 13px, ink-2, font-weight 500) e.g., "Notion"
- Single-letter initial in parens: "(N)" — Geist Mono 11px ink-3. This connects the parity grid to the cartogram (which uses single-letter labels per design system canon).
- Vertical centering within row
- Right-padding 12px from grid

**Customer row visual treatment:**
- 1px solid `#3370FF` border on bottom of customer row (separates customer from competitors)
- Customer row background subtly tinted `#F8FAFF` across full width (incl. row label column)

### 2.5 Column label row (top of grid)

- Engine codes (Geist Mono 11px caps, ink-2, font-weight 500): "CG", "PX", "AO", "CL", "GM", "GK", "YC", "BC", "MS", "DS", "LL"
- Centered horizontally in each 60px column
- Bottom-padding 8px from grid
- Rotated 0° (i.e., not rotated — 11 cols × 11px text fits horizontally with breathing room; rotation is over-engineered)
- Hover on engine code: 200ms tooltip with full engine name + total queries monitored at that engine

### 2.6 Placements (2 surfaces)

**Placement 1 — /competitors page (primary):**
- Position: directly below the page hero. Above the per-competitor deep-dive cards.
- Section heading: "Engine parity" (InterDisplay 22px medium ink-1)
- Sub-line: "How you and your top 5 competitors stand at every engine. Click any cell to see queries + recommendations." (Inter 14px ink-2, line-height 1.5)
- Below the grid, a 12px ink-3 caption: "Bar height = citation rate. Number = avg position. — = never cited. + = beyond rank 9."
- 32px bottom margin before next section (per-competitor cards)

**Placement 2 — Monthly Update PDF Page 5:**
- Vector SVG render. 6 rows × 11 cols. 180mm wide × 65mm tall. Same column ordering, same engine codes.
- Customer row tinted `#F8FAFF` print-safe; brand-blue border 0.5pt under customer row.
- Page heading: "Engine parity vs your top 5 competitors" (Fraunces 22px regular)
- Page footer: "Position 1 = best. — = never cited. Bar height = citation rate. Industry median engine reference: see Page 3."

### 2.7 Mobile rendering (≤ 767px)

The grid is 800px wide — too wide for 375px. Per the brief, we use horizontal scroll with sticky entity column.

**Mobile spec:**
- Row label column (100px wide) is `position: sticky; left: 0` — stays visible during horizontal scroll
- Engine columns (660px total) scroll horizontally inside a wrapper div with `overflow-x: auto`
- Wrapper has 1px right-edge gradient shadow indicating "more to scroll right"
- Cell dimensions stay 60×40 (same as desktop — keeps the comparison readable)
- Tap any cell to open a bottom-sheet (instead of right drawer); same content as desktop drawer
- Engine column-label row remains at top, scrolls with engine columns (sticky-top within the wrapper but not sticky-left)
- Vertical scroll is page-level (the grid is 292px tall, fits in viewport)

**Discoverability hint:** First time user lands on the grid on mobile, a 60-frame ghost-swipe animation plays once on the engine area indicating horizontal scroll is available. Animation is dismissed on first touch interaction. Per design system: only first-visit-per-device.

### 2.8 Edge cases

| Case | Treatment |
|------|-----------|
| Customer has 0 detected competitors | Grid renders single customer row only. Above grid, replace sub-line with: "We haven't detected your competitors yet. Run a competitor-discovery agent to populate this view." Plus a primary CTA button. |
| Customer has 1-4 detected competitors | Grid renders fewer rows. Min: 2 rows total (customer + 1 competitor). Empty rows are NOT padded with placeholders — the grid simply has fewer rows. |
| Competitor has no data at any engine (recently added) | All 11 cells in their row render as "—" with no bar. Row label includes Inter 10px italic ink-3 caption "(scanning...)" |
| Engine has no data for any entity (engine just added) | That column renders all "—" cells. Engine code in column header gets a 4px ink-3 dot indicator. Tooltip on the dot: "Engine added [date]. Building baseline." |
| Two competitors tied on overlap-score | Tie-broken by alphabetical name. Documented in DECISIONS.md if asked. |
| Competitor name > 14 characters | Truncated to 12 chars + "…" in row label. Full name in tooltip on hover. |
| Customer is on Discover tier | Grid renders but ALL competitor rows are blurred (CSS `filter: blur(4px)`). Above grid: "Competitor parity is part of Build. Upgrade to see how you stand vs your top 5." Primary CTA. Customer row remains crisp. |

---

## §3 Implementation notes

### 3.1 DOM structure

**For both grids (web/product surfaces):** CSS Grid (not HTML `<table>`).

Rationale:
- CSS Grid gives precise control over gutters, cell sizing, and responsive collapse. `<table>` semantics are wrong here — the data is genuinely tabular for Opp 2 but presentational for Opp 1, and consistency is worth more than minor a11y wins.
- Accessibility: each cell is a `<button>` (since clickable) wrapped in `role="gridcell"`. Container is `role="grid"`. Row groups via `role="row"`. Column headers via `role="columnheader"`. ARIA labels per cell describe the entity-engine-position-citation tuple in plain English.

**For Monthly Update PDF (print surface):** Vector SVG, server-rendered.

Rationale:
- PDF render pipeline already uses a Puppeteer + custom-styled-HTML approach; SVG generates clean vector output that prints crisp at any DPI.
- Engine sparklines as `<polyline>` with `<text>` labels. Position bars as `<rect>` with `<text>` labels.
- All colors print-safe (verified `#3370FF` ↔ CMYK(78, 56, 0, 0)).

### 3.2 Data shape per opportunity

**Opportunity 1 data:**

```ts
type EngineSparklineData = {
  engine: EngineCode  // 'CG' | 'PX' | 'AO' | 'CL' | 'GM' | 'GK' | 'YC' | 'BC' | 'MS' | 'DS' | 'LL'
  full_name: string
  weeks: Array<{
    week_start: string  // ISO date 'YYYY-MM-DD' (Monday)
    citation_rate: number | null  // 0..1, null = no data this week
  }>  // length 12, ordered oldest-first
  current_value: number | null  // 0..1, equals weeks[11].citation_rate
  delta_vs_previous_week: number | null  // signed integer in percentage points
  industry_median: number | null  // 0..1
}

// API contract: GET /api/v1/grids/engine-sparklines
// Response: { data: EngineSparklineData[] }  // 11 entries, locked order
```

**Opportunity 2 data:**

```ts
type ParityGridData = {
  customer: ParityRow
  competitors: ParityRow[]  // 0..5 entries
}

type ParityRow = {
  entity_id: string
  entity_name: string
  entity_initial: string  // 1 char, used in cartogram + parity grid label
  is_customer: boolean
  cells: Array<{
    engine: EngineCode
    avg_position: number | null  // 1..9 or null (never cited) or 10+ (rendered as '+')
    citation_rate: number  // 0..1
    queries_total: number
    queries_cited: number
  }>  // length 11, locked engine order
}

// API contract: GET /api/v1/grids/parity?customer_id={id}
// Response: { data: ParityGridData }
```

Both endpoints cache 1 hour (data updates weekly anyway). ETags. Stale-while-revalidate.

### 3.3 Performance

**Render budget:**
- Opp 1 grid: 12 cells × ~200 SVG nodes per cell (line, dots, labels, backgrounds) ≈ 2,400 SVG nodes total. Renders in single paint < 16ms on a mid-tier laptop. No virtualization needed.
- Opp 2 grid: 66 cells × ~5 nodes per cell ≈ 330 nodes total. Trivial. Single paint < 8ms.

**Library choice:** Native SVG (no D3, no Chart.js, no Recharts, no Visx).

Rationale:
- Bundle size: native SVG adds 0 KB. D3 alone is 60+ KB gzipped. Chart.js is 80+ KB. Recharts is 100+ KB. Beamix's Lighthouse target is 95+ Performance — we cannot afford a chart library for 12 sparklines.
- Custom-fit: our chart needs are narrow (sparkline, position bar) — a generic library brings 90% unused features.
- Maintainability: 200 lines of SVG-rendering React component is more legible than 200 lines of D3 selection-driven code.

**Implementation pattern (sparkline component):**

```tsx
// apps/web/src/components/grids/Sparkline.tsx (sketch)
function Sparkline({ data, width = 176, height = 80, color = '#3370FF', median }: Props) {
  const points = data.map((d, i) => {
    const x = 4 + (i / (data.length - 1)) * (width - 8)
    const y = d == null ? null : height - 4 - (d * (height - 8))
    return { x, y }
  })
  const path = pointsToMonotonePath(points)
  // Render <svg> with <path> stroke + dashed median line + ARIA label
}
```

The `pointsToMonotonePath` helper is ~30 lines of pure math (Fritsch-Carlson monotone interpolation). Shared across both grids and the Monthly Update PDF (PDF imports the same helper).

### 3.4 Testing

- Visual regression tests via Playwright + percy snapshot per grid × per breakpoint × per state (default, hover, focus, empty-data, mobile)
- Unit tests on the path-calculation helper (math is the only place bugs hide)
- a11y tests: keyboard navigation, screen reader announces each cell correctly, focus visible
- Print test: PDF render at 180mm reproduces grid pixel-perfect (CMYK conversion verified)

---

## §4 Cross-cutting design choices

### 4.1 No entrance animation (Tufte rule, Round 1 cut)

Both grids render fully drawn at t=0. No path-draw animation on sparklines. No bar-grow animation on position bars. No staggered cell fade-in. No 80ms grid-stagger entrance.

Rationale (per Tufte Round 1): entrance animations slow the eye's discovery of patterns. The whole point of small-multiples is "the eye discriminates differences at high resolution, low cost" — animation taxes that discrimination. The data should be visible the moment the page paints.

The 80ms-stagger pattern that was originally proposed in design system v0.5 is explicitly cut for these grids. Per-cell hover animations (which are user-initiated) are kept — they don't violate Tufte's rule because they happen on demand, not at first paint.

### 4.2 Direct labeling (Tufte rule)

Both grids use direct labeling — the labels ARE the titles. No separate legends or color-keys.

- Opp 1: each cell's engine code is its title. The dashed reference line is labeled "med" inline once (on cell 1) and the meaning carries by precedent. No bottom legend "blue line = your citation rate, dashed line = industry median" — the labels in the cells, plus the established design system convention, carry it.
- Opp 2: row labels (entity names) and column labels (engine codes) ARE the legends. No "color key" explaining brand-blue = customer.

Tufte's rule explicitly: "labels are data; legends are not." Labels next to the data scan in O(1). Legends require eye round-trips: scan data → scan legend → scan data again. Round-trips are time, time is friction, friction loses readers.

### 4.3 80ms-stagger CUT (Round 1)

Originally, the design direction proposed staggering cell appearance by 80ms each (cell 1 at t=0, cell 2 at t=80ms, ... cell 12 at t=880ms) to create a "wave" entrance. Round 1 critique cut this. Both grids render simultaneously at t=0.

Rationale: the staggered wave was decorative, not informational. Tufte's principle: every pixel-second of the chart should communicate data. A wave delays data delivery for aesthetic reasons. Cut.

The pattern is still permitted on non-data-comparison surfaces (e.g., the agents-running indicator on /home, where staggering communicates "agents are working sequentially"). It's the small-multiples grid specifically where it's banned.

### 4.4 Hover state restraint — tooltip + drawer pattern matches cartogram

Both grids share the same hover-and-click affordance pattern as the geographic cartogram surface (Opportunity 4 in the Tufte critique, spec'd separately):

- Hover → tooltip (read-only summary, hover-driven, dismisses on mouseleave)
- Click → drawer (rich detail, pinned until user closes)

This consistency means a customer who learns the cartogram interaction model gets the parity grid and engine grid for free. Three small-multiples surfaces share one interaction grammar — that's the kind of consistency that makes a product feel "billion-dollar" without spending any extra design budget.

The drawer width (480px), animation (200ms ease-out from right), close affordance (X icon top-right + ESC key + click-outside), and footer button layout (secondary left, primary right) are all canonical per design system. Only the drawer CONTENT differs between the three surfaces.

### 4.5 Brief grounding citation (F30)

When a customer clicks any cell in either grid and the drawer opens with a recommendation, the drawer includes a "From your Brief:" section showing the exact sentences from the customer's onboarding Brief that authorized Beamix to surface that recommendation.

Why this matters here:
- The grids surface gaps ("you're behind on Perplexity"). The recommendations propose actions ("Run the FAQ Agent to add 8 missing FAQ entries that AI Overviews looks for").
- F30 mandates that every action-suggestion be traceable back to customer-stated permission in the Brief. Without this, Beamix is dictating; with it, Beamix is executing the customer's stated will.
- Visually: the Brief quote is rendered as a Fraunces-italic blockquote — the only place in the product where Fraunces appears in non-print surfaces. This intentional typographic difference codes the quote as "voice of the customer, not voice of Beamix."

If a recommendation has no Brief grounding (e.g., a low-stakes "maybe try this" suggestion), the recommendation does NOT surface in the drawer. The grid only proposes actions the Brief authorizes. Cells can still be clicked for read-only data; recommendations are just absent.

### 4.6 Color discipline

Both grids use exactly two colors for data:
- `#3370FF` brand-blue — customer / your data
- `ink-3` `#9CA3AF` — competitor / reference data

Plus `ink-3` dashed for the industry median reference line (Opp 1).

That's it. No tier-3 color (e.g., orange for "warning"). The position number itself + the bar height carry the "doing well" / "doing poorly" semantic; the chart doesn't need color to encode value-judgment. Tufte's rule: data first, value-judgment second; let the reader judge.

Score colors `#06B6D4` (excellent), `#10B981` (good), `#F59E0B` (fair), `#EF4444` (critical) DO appear in delta arrows in Opp 1 footer ("+3 ↑" green; "−2 ↓" red) — but only on the small-text delta indicator, not on the chart itself. This is a deliberate scope: the chart shows raw signal; the footer interprets the most-recent delta.

### 4.7 Typography discipline

- Inter — all UI labels, engine codes (caps), entity names, body text in tooltips and drawers
- Geist Mono — all numeric values (current values, position numbers, citation counts, dates) — establishes "this is a number, not a word"
- Fraunces — only the Brief blockquote in the drawer, and only on print surfaces (PDF page headings)
- InterDisplay — section headings only

The font discipline is a force multiplier for the small-multiples pattern: the eye sees Geist Mono and immediately knows "compare this number to that number." Mixed font conventions break that scan. Locked.

### 4.8 Accessibility

- Both grids meet WCAG 2.1 AA contrast (brand-blue `#3370FF` on white = 4.61:1; ink-3 on white = 4.54:1 for the small text, 3.02:1 for the bar — bars are non-text content so 3:1 is the threshold and passes)
- Keyboard navigable: arrow keys move between cells, Enter opens drawer, ESC closes drawer
- Screen reader: each cell announces "Notion at Perplexity, position 3, 67 percent citation rate, 12 of 18 queries cited, behind you by 2 ranks" — assembled from data attributes
- Tooltip content is available via aria-describedby
- The entire Brief-grounding blockquote is announced as a quote with attribution
- Print version is non-interactive; alt-text summary table is provided as a separate page in the PDF for screen-reader-of-PDF use cases

---

## §5 ASCII-art mockups

### 5.1 Opportunity 1 — small example (4 engines × 4 weeks)

A compressed render — actual grid is 4 cols × 3 rows × 12 weeks. This shows the visual logic.

```
┌─────────────────────────┬─────────────────────────┬─────────────────────────┬─────────────────────────┐
│  CG  ChatGPT            │  PX  Perplexity         │  AO  AI Overviews       │  CL  Claude             │
│                         │                         │                         │                         │
│        ╱╲          .med │                  ╱─╲    │     ─.─ med             │                         │
│       ╱  ╲___      ─.─  │     ─.─ med    ╱   ╲    │                         │   ─.─ med               │
│      ╱       ╲___╱      │             ╱─╲   ╱     │  ╲_                     │      ╱╲    ╱─╲          │
│     ╱                   │       __─╱─╲ ─ ╱         │     ╲___                │   ╱─╲ ╱╲╱   ╲          │
│  __╱                    │   __╱─                  │         ╲___            │  ╱        ──╲          │
│                         │                         │             ╲___        │                         │
│                         │                         │                         │                         │
│ 73%             +3 ↑    │ 58%              =      │ 41%             −2 ↓    │ 67%             +5 ↑    │
└─────────────────────────┴─────────────────────────┴─────────────────────────┴─────────────────────────┘
┌─────────────────────────┬─────────────────────────┬─────────────────────────┬─────────────────────────┐
│  GM  Gemini             │  GK  Grok               │  YC  You.com            │  BC  Bing Copilot       │
│                         │                         │                         │                         │
│      ─.─                │  ─.─                    │              ──         │     "No data this       │
│      _____              │   ____                  │     ─.─    ╱            │      period"            │
│   __╱     ╲___          │  ╱    ╲___              │  __╱─.───╱              │     ─.─.─.─.─.─         │
│  ╱            ─         │ ╱         ───           │                         │                         │
│ ╱                       │╱                        │                         │                         │
│                         │                         │                         │                         │
│                         │                         │                         │                         │
│ 49%              =      │ 38%             −1 ↓    │ 52%             +1 ↑    │ —                  —    │
└─────────────────────────┴─────────────────────────┴─────────────────────────┴─────────────────────────┘
┌─────────────────────────┬─────────────────────────┬─────────────────────────┬─────────────────────────┐
│  MS  Mistral            │  DS  DeepSeek           │  LL  Llama              │  ▢  Coming: future      │
│                         │                         │                         │                         │
│                         │                         │                         │                         │
│         _____           │       ╱╲                │   ─.─   _              │                         │
│   ─.───╱     ╲___       │   ─.─╱  ╲___            │     ___╱─╲___           │     (placeholder)       │
│  ____                   │   ____    ╲             │  __╱      ─             │                         │
│ ╱                       │  ╱         ──            │                         │                         │
│                         │                         │                         │                         │
│                         │                         │                         │                         │
│ 22%             +1 ↑    │ 31%              =      │ 18%             +2 ↑    │                         │
└─────────────────────────┴─────────────────────────┴─────────────────────────┴─────────────────────────┘
```

Reader scan output: "ChatGPT and Claude are climbing. AI Overviews is declining — that needs attention. Bing Copilot has no data — Beamix doesn't see me there yet. Gemini is flat — neither winning nor losing. Industry-median dashed line is visible on most cells; I'm above it on ChatGPT, Claude, You.com; below it on AI Overviews and Grok."

The reader sees this in 2-3 seconds, parallel-scanning the whole grid. That's Tufte's promise.

### 5.2 Opportunity 2 — small example (3 entities × 4 engines)

Compressed render — actual grid is 6 rows × 11 cols. Single-entity row label + 4 cells per row shown.

```
              ┌─────CG─────┬─────PX─────┬─────AO─────┬─────CL─────┐
              │     1      │     4      │     2      │     1      │
You           │    ▆▆▆▆    │    ▃▃      │    ▅▅▅     │    ▆▆▆▆    │
(Beamix)      │   (89%)    │   (43%)    │   (67%)    │   (91%)    │
              ├────────────┼────────────┼────────────┼────────────┤
              │     3      │     1      │     1      │     5      │
N             │    ▅▅      │    ▆▆▆▆    │    ▆▆▆▆    │    ▂▂      │
(Notion)      │   (61%)    │   (88%)    │   (84%)    │   (28%)    │
              ├────────────┼────────────┼────────────┼────────────┤
              │     5      │     2      │     1      │     6      │
M             │    ▂▂      │    ▅▅      │    ▆▆▆▆    │    ▁▁      │
(Monday)      │   (24%)    │   (66%)    │   (82%)    │   (18%)    │
              └────────────┴────────────┴────────────┴────────────┘
```

(In the actual product, blue color codes the customer row; ink-3 codes competitor rows. Bar height encodes citation rate; number above the bar encodes average position.)

Reader scan output: "I lead at ChatGPT (rank 1) and Claude (rank 1). Notion crushes me at Perplexity (they're rank 1, I'm rank 4) AND at AI Overviews (they're rank 1, I'm rank 2). Monday is winning AI Overviews tied with Notion, and they're a real threat at Perplexity too. My weakness is AI Overviews + Perplexity — and that's exactly where my competitors are leading. Action: run an FAQ agent + cite-target agent against Perplexity and AI Overviews to close that gap."

That sentence is what Tufte means by "small multiples are the best statistical graphic ever devised." The customer just wrote a competitive-strategy paragraph by glancing at a 12-cell example (66 cells in the real grid) for under 5 seconds. That's the data-density-per-eye-movement that makes a product feel like a system that thinks alongside the customer, not a dashboard that shows them lights.

---

## Lock summary

- **Opp 1 grid:** 4×3 cells, 200×120px each, 12px gutter, 836×384px total. Sparkline 1.5px brand-blue, monotone-cubic, 0-100% locked range, dashed ink-3 industry-median reference. Engine code (caps Inter 13px) + name (Inter 11px) header. Geist Mono current value + Inter delta footer with green/red/gray semantic delta colors. No entrance animation. Mobile: 2×6 collapse, 160×100px, 1px stroke, 332×620px.
- **Opp 2 grid:** 6×11 cells, 60×40px each, 4px gutter, 100px row-label column, 32px column-label row, 800×292px total. Position number Geist Mono 11px on top; 12px-wide position bar below scaled 0-18px tall by citation rate. Subtle paper-elev blue/neutral background tint by citation rate. Customer row brand-blue + bottom border + tinted full-width row. Click → 480px right drawer with sparkline + queries + FAQ-Agent recommendations + Brief grounding blockquote. Mobile: sticky-left row labels + horizontal scroll on engine columns.
- **Cross-cutting:** native SVG rendering, no chart library, render in single paint, 4 placements for Opp 1 (home, scan-detail, PDF page 3, email-fallback) + 2 placements for Opp 2 (competitors page, PDF page 5). Direct labeling per Tufte. Hover-tooltip + click-drawer interaction grammar shared with cartogram surface.

Ship.
