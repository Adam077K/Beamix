# AI Visibility Cartogram — Pixel Specification v1

**Feature:** F22 (PRD v3) — AI Visibility Cartogram
**Status:** Pixel-precise spec, build-ready
**Date:** 2026-04-28
**Author:** Design Lead
**Source design:** [PRD-wedge-launch-v3 §F22](2026-04-28-PRD-wedge-launch-v3.md), [DESIGN-BOARD2-CEO-SYNTHESIS §24](2026-04-28-DESIGN-BOARD2-CEO-SYNTHESIS.md), [BOARD2-tufte](2026-04-28-BOARD2-tufte.md)
**Design system source:** [DESIGN-SYSTEM-v1.md](2026-04-27-DESIGN-SYSTEM-v1.md)
**Render targets:** /scans/[scan_id] (primary), Monthly Update PDF Page 2, /scan public OG share card

---

## Premise

50 queries × 11 engines = 550 cells. Each cell is a single colored rectangle that may carry one character. The reader sees, in one glance, which queries the customer owns, which they are losing, which engines are friendly, which are hostile. This is the "John Snow cholera map of GEO." It is the only chart in Beamix that earns four reading rates simultaneously: 1-second silhouette (color blocks tell you where you live), 5-second pattern (which engine columns are blue, which are red), 30-second scan (read query labels next to red rows), 5-minute study (hover any cell, read the citation, open the source).

No animation. No legend. No gradient. Direct labels. Tufte's *Beautiful Evidence* canon.

---

## §1 — Pixel Dimensions (locked)

### 1.1 Cell

```
Cell width  = 14px
Cell height = 12px
Cell gap    = 1px (background shows through, gives the grid its tessellated reading)
```

The decision: **14×12px, not 24×24** as the original brief sketched.

The reasoning. The PRD draft proposed 24×24px cells. At 24×24, 50 rows × 24px = 1,200px tall — taller than any laptop fold. To fit on /scans/[scan_id] above the engine breakdown, the cartogram must clear ~600px of vertical real estate including labels. 50 rows × 12px cell + 50 × 1px gap = 649px of grid; with the engine label row above (32px) and bottom padding (16px) the cartogram lands at **697px tall** — fits a 1080p laptop fold with 100px page chrome to spare. Cell width of 14px gives 11 cells × 14px + 10 gaps × 1px = **164px** for the engine zone, with 80px label margin on the left = **244px wide grid + label gutter.** This leaves 636px of horizontal slack on /scans (full width 880px) — the cartogram is the page's typographic centerpiece, not edge-to-edge sprawl.

**Glyph fits at 14×12.** 11px Inter caps with `font-variant-numeric: tabular-nums` measures 6.6×8px in box. Centered in a 14×12 cell that is 4px of horizontal margin on each side and 2px above + below the glyph baseline. Below 14×12, the glyph stops being legible at desk distance (24"); we held the floor here.

**Why not square cells.** A 12×12 cell loses horizontal weight and the grid reads as rows-not-columns; the engine column is the *more important reading axis* (which engines are friendly?), so columns must be visually slightly more weighted than rows. 14 wide × 12 tall achieves this without explicit grid lines.

### 1.2 Grid totals

```
Rows (queries)   = 50
Columns (engines) = 11

Grid width  = 11 × 14 + 10 × 1   = 164px
Grid height = 50 × 12 + 49 × 1   = 649px
```

### 1.3 Label gutters

**Left gutter (query labels):**

```
Width                = 280px
Padding-right        = 12px (separates label from grid)
Effective text area  = 268px
```

Query labels are 11px Inter 500 caps, `letter-spacing: 0.04em`, `--color-ink-2`, right-aligned, line-height equal to cell row pitch (13px = 12px cell + 1px gap). Each label sits at the optical center of its cell row.

At 11px Inter caps, the average glyph advance is ~6.4px. 268px ÷ 6.4 = **41 characters** before truncation. We truncate at **38 characters with single ellipsis** (room for inter-word spaces). Labels longer than 38 characters get a tooltip on hover showing the full query text in 13px Fraunces 300 italic on white card.

**Top gutter (engine labels):**

```
Height               = 32px (24px label + 8px padding-bottom above grid)
Per-engine width     = 14px (matches cell column)
Rotation             = 0° (horizontal)
```

The 11 engines fit in 164px of grid width. 164 ÷ 11 = 14.9px column pitch. At 14px column with horizontal labels we have only ~14px to render the engine name. We use **2-letter engine abbreviations**, vertically centered above each column.

**Locked engine abbreviations** (per PRD v3 acceptance criteria — legibility-tested at 11px before MVP):

| # | Engine | Abbrev |
|---|---|---|
| 1 | ChatGPT | `GP` |
| 2 | Claude | `CL` |
| 3 | Gemini | `GE` |
| 4 | Perplexity | `PX` |
| 5 | Google AI Overviews | `AO` |
| 6 | Grok (X) | `GK` |
| 7 | You.com | `YO` |
| 8 | Bing Copilot | `CP` |
| 9 | Mistral | `MI` |
| 10 | DeepSeek | `DS` |
| 11 | Llama | `LM` |

Engine labels: 11px Inter 600 caps, `letter-spacing: 0.04em`, `--color-ink-2`. On hover over an engine label, the column highlights (1px `--color-brand` outline at 40% opacity over all 50 cells in that column) and a 13px Fraunces 300 italic tooltip floats above showing the full engine name and the customer's column-aggregated citation rate ("ChatGPT — cited in 23 of 50 queries").

**Rotation decision: 0°, not 30°.** At 11px, rotation introduces sub-pixel anti-aliasing fuzz that fights the grid's clean rectangle reading. With 2-letter abbreviations, horizontal labels fit and read instantly. Rotation only earns its complexity at 4+ character labels, which we don't have.

### 1.4 Total artifact dimensions

```
Total width  = 280 (left gutter) + 12 (gap) + 164 (grid) + 12 (right padding) = 468px
Total height = 32 (top gutter) + 649 (grid) + 16 (bottom padding) = 697px
```

Centered on /scans/[scan_id] within an 880px content column gives **206px of horizontal slack on each side.** The cartogram is *intentionally not full-width.* It is the size of a printed broadsheet column. The slack is the page's intake of breath.

For Monthly Update PDF Page 2 (A4 portrait, 210mm × 297mm, content area 190mm wide), the cartogram scales to 190mm wide. That's 1.13× the screen size. The cell becomes 15.8×13.5px, and labels scale proportionally. The grid keeps the same proportions; only render resolution increases. SVG output → vector, not raster.

For OG share card (1200×630px) the simplified cartogram is 720×600px (color-only, no glyphs, no labels). See §4.3.

### 1.5 No legend

Tufte's lock from BOARD2-tufte §D: "Direct-readable. The eye should not bounce." The four cell colors are explicit enough at-a-glance that no legend is needed; in cases where the customer needs precise interpretation, hover surfaces the full citation. The competitor initial in the cell IS its own label. No legend block. The artifact stands.

The single concession: **on the OG share card** (a public surface where the reader has zero context), a 4-state mini-key sits in the right-hand 480px panel. Format: 4 vertical rows of 12×12 swatch + 13px Inter caps label. Size: 200×80px. This is the only legend in the system.

---

## §2 — Color Encoding System

### 2.1 The four states

| State | Cell background | Glyph | Glyph color |
|---|---|---|---|
| **Cited at top** (positions 1–3) | `--color-brand` (`#3370FF`) | Position number `1`, `2`, or `3` | white (`#FFFFFF`) |
| **Cited but late** (positions 4–9, or `+` for 10+) | `--color-ink-3` (`#6B7280`) | Position number `4`–`9` or `+` | white (`#FFFFFF`) |
| **Not cited, no competitor either** | `--color-paper-elev` (`#FAFAF7`) | none (cell is empty) | n/a |
| **Competitor cited instead** | `score-critical-soft` (see §2.2) | Competitor initial (`N`, `A`, `M`, `G1`…) | `--color-score-critical` (`#EF4444`) |

`score-critical-soft` is a derived token — it's not yet in the design system but should be added as part of F22 build. **Hex: `#FCE3E3`** (= `--color-score-critical` at ~12% alpha composited on white). On dark mode: `#3D1A1A`. Glyph color shifts to `#FCA5A5` on dark mode.

### 2.2 Token additions to the design system

Add these to `tokens.css` and `tailwind.config.ts` per the build-out:

```css
:root {
  --color-score-critical-soft: #FCE3E3;     /* cartogram "competitor cited" cell bg */
  --color-cartogram-grid-bg: #E5E7EB;        /* the 1px gap color (= --color-border) */
}
.dark {
  --color-score-critical-soft: #3D1A1A;
}
```

Tailwind:

```ts
'score-critical-soft': 'var(--color-score-critical-soft)',
'cartogram-grid': 'var(--color-cartogram-grid-bg)',
```

The grid container has `background: var(--color-cartogram-grid-bg)` so the 1px gap between cells reads as a soft graphite hairline, not white. This unifies the grid into one composed object rather than 550 floating chips.

### 2.3 Glyph rules

```
Font:                Inter 600
Size:                11px
Letter-spacing:      0.04em
Font-variant:        tabular-nums (so position numbers stay aligned)
Text-anchor:         middle
Vertical alignment:  optical center of cell (baseline at 8.5px from cell top)
```

**Position number rules.** When the customer is cited at position 1, 2, or 3, the cell is `brand-blue` and the glyph is the position number in white. When cited at 4–9, the cell is `ink-3` and the glyph is the position number in white. When cited at 10+, the cell is `ink-3` and the glyph is `+` (the plus sign is ASCII `0x2B`, not a Unicode em-plus — must render in tabular-nums).

**Competitor initial rules.** When a *named competitor* (one of the 5 vertical-KG-pre-populated competitors or 5 customer-added per F10) is cited *instead* of the customer at position 1–3 for that query+engine, the cell is `score-critical-soft` and the glyph is the competitor's first initial in `--color-score-critical`.

**When the cited "competitor" is generic (Wikipedia, Reddit, no specific brand): cell stays `paper-elev`, no glyph.** This is the not-cited state. We are not measuring presence-of-the-internet; we are measuring named-competitor-cited.

### 2.4 The competitor initial collision algorithm

Competitor initials must be unique within a customer's grid. The algorithm:

1. Take the list of up to 10 competitors for the customer (from F10 /competitors page).
2. Sort by frequency of citation across all 550 cells (most-cited first).
3. For each competitor, attempt: first letter of their primary brand name (`Notion` → `N`, `Airtable` → `A`, `Monday` → `M`).
4. If two competitors share an initial, the higher-frequency one keeps the unsuffixed letter; the lower-frequency one gets a numeric suffix: `N` and `N2` (e.g., Notion = `N`, Numbers = `N2`).
5. Pre-canonicalized initials for the seeded vertical lists (locked):

**SaaS vertical (5 pre-populated):**
| Competitor | Initial |
|---|---|
| Notion | `N` |
| Airtable | `A` |
| Monday | `M` |
| Linear | `L` |
| Coda | `C` |

**E-commerce vertical (5 pre-populated):**
| Competitor | Initial |
|---|---|
| Athletic Greens | `A` |
| Olipop | `O` |
| Magic Spoon | `M2` (because Monday claims `M` cross-vertical reuse) |
| Liquid I.V. | `L` |
| Kettle & Fire | `K` |

Suffix rendering: the suffix `2` renders 4pt smaller than the initial, baseline-shifted +1px (subscript-style, but with InterDisplay 500). Glyph total width fits in the 14px cell.

**When 3+ competitors share an initial.** In practice, any single grid surfaces ≤6 competitors; we have not seen 3-way collisions in pilot data. If it occurs: third gets `2`, fourth gets `3`. If it occurs in a single grid the design fails — surface a warning to ops to rename the competitor display name.

### 2.5 Glyph fallback at lower density

The design system locks 14×12 as MVP minimum cell size. **Below 14×12, glyphs are dropped — color-only encoding remains.** This applies in two places:

1. The OG share card (cell ~9×8 in 1200×630 layout) — color-only, no glyphs, no labels.
2. Mobile (375px viewport) — see §5 for the chosen pattern.

When glyphs are dropped, the four-state color encoding still tells the macro story (which engines are blue, which are red). The micro story (exact position, which competitor) is lost — but at the dropping density the cartogram is silhouette-only.

---

## §3 — Hover and Interaction Specification

Tufte's lock: hover *reveals*; default *reads at-a-glance*.

### 3.1 Cell hover

```
Trigger:     pointer-enter on cell
Delay:       100ms (prevents tooltip thrash on quick mouse traversal)
Tooltip:
  Width:           280px
  Min-height:      120px (auto-grows with content)
  Position:        8px above the cell, horizontally centered on cell
  Background:      --color-paper (white)
  Border:          1px solid --color-ink at 12% opacity (= --color-border-strong)
  Border-radius:   8px
  Shadow:          0 4px 16px rgba(10,10,10,0.08)
  Padding:         16px
  Z-index:         100
```

**Tooltip arrow:** 6×6px diamond, same fill as tooltip background, 1px ink-12 border, positioned at -3px below tooltip, centered on cell.

**Tooltip content** (top-to-bottom, left-aligned):

1. **Query** (Fraunces 300 italic, 14px, `--color-ink`, line-height 1.3): the full query text, no truncation.
2. **Engine** (Inter 500 caps, 11px, `--color-ink-2`, letter-spacing 0.04em, top-margin 8px): the full engine name (e.g., `CHATGPT`).
3. **Status row** (Inter 500, 13px, `--color-ink`, top-margin 8px):
   - Cited at top: `Position 2` (Geist Mono 14px tabular for the number).
   - Cited late: `Position 7`.
   - Not cited, no competitor: `Not cited`.
   - Competitor cited: `Notion cited at Position 1` (competitor name in `--color-score-critical`).
4. **Citation snippet** (Fraunces 300 italic, 13px, `--color-ink-3`, top-margin 8px, max 2 lines, ellipsis after 100 chars): the snippet of text the engine returned. Quoted with curly quotes. Example: *"Notion is the leading all-in-one workspace for teams…"*
5. **Click affordance** (Inter 400, 11px, `--color-ink-3`, top-margin 12px): `Click for citation source →`.

Tooltip content is rendered **server-side prefetched** — no async load on hover. Data shape includes citation snippet by default.

### 3.2 Cell click

Click opens a **right-side drawer** (480px wide, full-page-height). The drawer is the same Drawer component used in /inbox and /scans expansion (per design system).

**Drawer header (96px tall):**
- Cream paper background (`--color-paper-cream`) — this is the only point on the cartogram product surface where cream appears, and it is justified because the drawer renders the *citation as artifact*: the actual paragraph the AI engine returned, treated as a quoted document.
- Query in 18px Fraunces 300, `--color-ink`, line-height 1.3.
- Engine pill below in 11px Inter 600 caps, `letter-spacing: 0.04em`, `--color-ink-2` on `--color-paper-elev` background, 4px×8px padding, 12px border-radius.

**Drawer body (white background, scrollable):**
- **Citation source** (Geist Mono 13px, `--color-ink-3`, breakable-anywhere): the URL the engine cited. Click = open in new tab.
- **Copy URL button** (28px tall, secondary button per design system): copies the URL to clipboard.
- **Full citation paragraph** (Inter 400, 14px, `--color-ink`, line-height 1.5, max-height 240px scrolls): the full text the engine returned; the customer's brand name (or the competitor's name) highlighted with a 1px brand-blue underline.
- **Ranking history** (heading: 11px Inter caps, `letter-spacing: 0.06em`, `--color-ink-3`, "RANK HISTORY — LAST 12 SCANS"): a 360×80px sparkline showing position over the last 12 scans for this query+engine. 1.5px stroke, `--color-brand` if customer is the cited entity, `--color-score-critical` if competitor. Y-axis is position (1 at top, 10+ at bottom — inverted because rank-1 is "best"). No axis labels; the current value is direct-labeled at the right end of the line.
- **"Why this rank?" line** (Fraunces 300 italic, 13px, `--color-ink-3`, top-margin 16px): one-sentence diagnostic from the scan engine. *"Notion's pricing page has FAQPage schema. Ours does not."* This is the line that converts the cartogram from a chart into a to-do list.
- **CTA: "Fix this with Beamix"** (primary button, 36px tall, `--color-brand` background, `--color-paper` text, full-drawer-width minus padding) — links to /workspace with a pre-filled action targeting that query.

**Drawer close:** Esc key, backdrop click, or close button (top-right, 16×16, `--color-ink-3`).

### 3.3 Keyboard navigation

The cartogram is a `<table role="grid">` with proper ARIA semantics. Keyboard:

- `Tab`: focus enters the grid on the first cell (row 1, column 1).
- `↑ ↓ ← →`: move focus between cells. Wrapping: at row end, focus stays (no wrap to next row — preserves spatial intuition).
- `j` / `k`: move down / up one row (vim discipline; for power users).
- `h` / `l`: move left / right one column.
- `g`: jump to first row of current column.
- `G`: jump to last row of current column.
- `Enter` / `Space`: open the click drawer for the focused cell.
- `Esc`: close the drawer; if drawer is closed, blur the cell.

**Focus ring:** 2px `--color-brand` outline, offset 2px from cell, 4px border-radius. Active focus on a cell ALSO surfaces the tooltip.

### 3.4 Print stylesheet

When the page is printed (or rendered to PDF for the Monthly Update artifact):

- All hover states removed.
- All drawers removed.
- A 4-state legend appears below the cartogram (since print = no hover affordance) — 4 horizontal rows of 12×12 swatch + 11px Inter 500 caps label.
- The grid renders as static SVG (vector), not DOM.
- Page-break-inside: avoid (the cartogram should never split across two pages).

---

## §4 — Three Placements

### 4.1 Placement 1 — /scans/[scan_id] detail page

**Position on page.** The cartogram sits below the scan summary header (which contains: scan date, score, score delta, engines-scanned count, queries-scanned count) and above the engine-by-engine breakdown table. It is the *first* major data artifact on the page.

**Layout context.** Page width 880px. The cartogram is 468px wide and centered, leaving 206px of slack on each side. The slack is important: it lets the cartogram *breathe* and signals "this is the artifact, not the dashboard." A 24px Fraunces 300 italic caption sits 16px above the cartogram, left-aligned to the cartogram's left edge (i.e., at x=206px from page edge). Caption: *"Your AI search visibility, query by query, engine by engine. Hover any cell to read the citation."*

A 13px Inter 400 micro-caption sits 8px below the cartogram, same alignment: `Last scan: April 28, 2026 — 2:14pm. 50 queries × 11 engines.`

**Brief binding line (per F31).** Below the micro-caption, separated by 24px and a horizontal hairline rule (`--color-border` 1px), the page's Brief binding line per F31 spec.

**Hover & click fully wired.** Per §3.

**Loading state.** Cell-by-cell skeleton: 550 `--color-paper-elev` cells, no shimmer (per design system anti-pattern §1050), no animation. Labels render at full opacity. Total skeleton: ~16ms paint. Customer sees the *shape* of the cartogram before the data lands, which is itself information ("there will be 11 engines, 50 queries — here is your map"). Cells fill in as the scan completes (server-side; cells become final state on initial render — this is not a streaming surface).

**Empty state.** If no scan has run yet: see §8.

### 4.2 Placement 2 — Monthly Update PDF Page 2

**Format.** A4 portrait, 210mm × 297mm. Content area: 190mm wide (10mm margins each side), 270mm tall (10mm margin top, 17mm margin bottom for footer).

**The cartogram on Page 2.**
- Width: 190mm (full content width)
- Cell width scales: 14.6mm grid width ÷ 11 cols = 13.27px-equivalent at 96dpi. We render the cartogram-grid at 190mm wide → cell becomes ~15.8×13.5px equivalent.
- Cells render as SVG `<rect>` elements; glyphs as SVG `<text>`. Total SVG ~5KB gzipped.
- Direct labels lock — **no legend on Page 2.** (The PDF is a permanent artifact; the customer reads it in 30 seconds of forwarding-velocity. A legend introduces a beat that doesn't earn itself. Tufte: the cartogram is self-explanatory at this scale.)

**Page 2 layout (top to bottom):**

1. **Page header** (top 12mm): page number "2" right-aligned in 11px Geist Mono, `--color-ink-3`. Customer name on left in 13px Inter 500 caps, `--color-ink-2`, letter-spacing 0.06em.
2. **Section eyebrow** (top of page content): "AI VISIBILITY MAP" in 11px Inter 600 caps, `--color-ink-3`, letter-spacing 0.08em.
3. **Page headline** (24mm below eyebrow): "Where you're cited — and where Notion is" (or competitor-of-record) in 24pt Fraunces 300, `--color-ink`, max 2 lines.
4. **Cartogram** (centered, 190mm wide, ~109mm tall = grid + labels). Top edge sits 8mm below headline.
5. **Narrative copy** (8mm below cartogram, left-aligned, 130mm wide, Fraunces 300 italic, 13pt, `--color-ink-2`, line-height 1.45). **≤80 words.** The Page 2 narrative is the editorial register's commentary on the cartogram. It is read by the same person who reads the chart, in the next breath.

**Page 2 narrative copy template (per Voice Canon Model B — "Beamix" on emails/PDFs):**

> *"The blue cells are where you're cited at the top of the answer. The grey cells are where you're cited but later than ideal. The red cells — these are where {competitor_name} appears in your place. {top_engine} is your friend; {weakest_engine} is not. {strongest_query} is your strongest claim — own it. This map is part of your Brief — Beamix's working instructions for the agents. The agents read this every cycle."*

Variables resolved at render time:
- `{competitor_name}`: most-frequently-cited named competitor
- `{top_engine}`: engine where customer is cited most often at top position
- `{weakest_engine}`: engine where customer is cited least
- `{strongest_query}`: query where customer is cited most consistently across engines

The closing sentence "This map is part of your Brief — Beamix's working instructions for the agents. The agents read this every cycle." is the rotating Brief binding clause for Page 2 (per F31). It binds the cartogram to the Brief — the cartogram is the *evidence* the Brief is correctly oriented.

6. **Footer** (bottom 17mm of page, 11px Geist Mono, `--color-ink-4`): scan timestamp, page number "Page 2 of 6," and the standard Monthly Update footer-rule.

**Print quality.** Vector SVG only, embedded via `@react-pdf/renderer`'s `<Svg>` component. No raster. Glyphs render in InterDisplay (the InterDisplay subset embedded in the PDF). Cell colors render in CMYK with the print-locked cream paper hex (Decision A in design system — a Tier 0 lock pending; default `#F7F2E8`).

**Margin (typographic edge) survives on PDF with temporal decay** (per BOARD2-tufte synthesis): the 24px Margin column appears to the left of the cartogram in PDF only — a Rough.js mark per query row indicating which agent has touched that query. Full opacity for current-cycle queries, 20% for prior-month, 6% for archived. **Note:** this is the *Margin sigil* (per design system §3 sigil family), not a literal page margin. It is decorative-with-meaning; on the PDF it earns its place because the PDF is an artifact, not chrome.

### 4.3 Placement 3 — Public OG share card

**Format.** 1200×630px PNG. Rendered server-side via `@vercel/og`. Cached at edge with cache key `cartogram:{scan_id}:og:v1`.

**Layout (60/40 split).**

**Left panel: 720×630px, simplified cartogram.**

```
Background:  --color-paper-cream (#F7F2E8) — this is the editorial register, OG card is artifact
Cell width:  10px
Cell height: 10px
Cell gap:    1px
Grid width:  11 × 10 + 10 = 120px
Grid height: 50 × 10 + 49 = 549px
Glyph:       NONE (cells too small for legible glyphs at 10px)
Engine labels: 9px Inter caps, `--color-ink-2`, horizontal — fits 2-letter abbrev
Query labels: 9px Inter caps, `--color-ink-2`, right-aligned, max 26 chars truncated
```

The left panel is centered both horizontally and vertically within the 720×630 area, with 80px padding on left and right of the cartogram. The cartogram alone occupies ~440×590px; the panel hosts the cartogram plus a 24px Fraunces 300 caption above: *"AI search visibility map."*

**Right panel: 480×630px, brand identity column.**

```
Background:  --color-paper-cream (same as left, single canvas)
Padding:     48px all sides
Content (top to bottom):
  - Beamix logomark    (32×32 brand-blue mark, top-left of panel)
  - Beamix wordmark    (28px Inter 500 caps, --color-ink, beside logomark)
  - Spacer 64px
  - Customer name      (40px Fraunces 300, --color-ink, line-height 1.1, max 2 lines)
  - Customer domain    (16px Geist Mono, --color-ink-3, top-margin 8px)
  - Spacer 32px
  - Headline           (24px Inter 500, --color-ink, line-height 1.3, max 3 lines)
  - 4-state legend     (top-margin 32px) — see legend block below
  - Spacer flex
  - Seal               (32×32 Beamix Seal at bottom, --color-ink at 80% opacity)
  - Seal caption       ("— Beamix" 14px Inter 400, --color-ink-2, baseline of seal)
```

**Legend block (200×100px):** 4 vertical rows. Each row: 12×12 colored swatch + 8px gap + 11px Inter 600 caps label.

```
[blue swatch]    CITED AT TOP
[grey swatch]    CITED LATE
[paper swatch]   NOT CITED
[red swatch]     COMPETITOR CITED
```

**Headline template (Voice Canon Model B):**

> *"{customer_name}'s AI search visibility — {N} queries scanned across 11 engines."*

Where `{N}` is the actual queries scanned (could be ≤50 if customer added fewer queries).

**Cream paper hex.** Pending Tier 0 lock per design system §1 (3 swatches: `#F7F2E8`, `#F4ECD8`, one between, photographed under 3 lights). For MVP we ship `#F7F2E8` (current locked value). The OG card hex follows whatever the Tier 0 lock resolves to; build the cream as a CSS variable so the change is single-source.

**Render path.** `/api/og/cartogram/[scan_id]` → `@vercel/og` JSX template → PNG → CDN cache → social platforms.

**The OG card is opt-in.** Per F1 acceptance criteria, the customer must explicitly click "Generate share link" before any public surface is generated. The OG card is rendered only when the public share permalink is resolved.

---

## §5 — Mobile (375px viewport) Rendering Decision

The trade-off space:

| Option | Pros | Cons |
|---|---|---|
| **A: Horizontal scroll** — render at desktop dimensions, pan horizontally | Preserves the artifact integrity. Customer sees the same cartogram. Tufte-correct (no information loss). | Discoverability is bad — customer doesn't know to scroll. Pan-on-touch fights with vertical page scroll (gesture ambiguity). |
| **B: Cell-resize** — cells become 6×4px, glyphs drop, color-only | Fits 375px viewport (550 cells × ~6px ÷ 11 cols ≈ 264px wide grid + 80px label gutter = 344px — fits). | Glyphs lost; tooltip is the only path to micro detail; visual bloom too dense — cells become indistinguishable noise. |
| **C: Engine-summary view + dedicated full-screen cartogram** — mobile shows 11-row engine summary; "Tap to see full grid" opens horizontally-scrolled full-fidelity cartogram | Macro story still tells (which engines are friendly). Micro story available on explicit gesture. Discoverability solved by explicit CTA. | Two views to maintain; "click to expand" is a beat the artifact didn't have. |

**Decision: Option C, with refinement.**

The mobile experience renders an **engine-summary digest** as the primary cartogram surface, with a "View full map →" link that opens a full-screen modal with the desktop-fidelity cartogram horizontally scrollable.

**Engine summary (11 rows, default mobile view):**

```
Width:       full viewport (375px), 16px gutters → 343px content
Height:      auto, ~620px total

Per row:
  Height:        56px
  Layout (L→R):  20px engine 2-letter abbrev pill (Inter 600 caps, ink on paper-elev)
                 8px gap
                 96px engine name (Inter 500, 13px, ink)
                 flex-1 spacer
                 220×16 horizontal score bar showing % of 50 queries the customer is cited at
                          top position (filled = brand-blue) vs late (filled ink-3) vs
                          not-cited (paper-elev background) vs competitor-cited (red)
                 12px gap
                 32px count label (Geist Mono 13px, ink) — "23/50"

  Tap row:       opens engine column drill-down (same drawer as desktop click,
                 but full-screen on mobile)
```

The 11 rows tell the story "which engines are friendly" in 5 seconds. The 220px stacked bar uses the same 4 colors as the cartogram cells, which makes the visual translation between mobile and desktop instant.

Below the 11 rows, a **"View full grid →"** link in 13px Inter 500, `--color-brand-text`. Tap → opens a full-screen modal with the desktop-fidelity cartogram (468×697px). The modal has a horizontal scroll affordance baked into the design (subtle right-edge fade on first render with arrow indicator). Customer pinch-zooms or pans horizontally; tap on cell opens the cell drawer.

**Why C wins.** The macro story (engine friendliness, which is the renewal mechanic — *"is Beamix moving the needle on Perplexity?"*) is preserved without compromise on mobile. The micro story (per-query, per-engine cell detail) is accessible via one gesture. Option A loses discoverability; Option B loses information; Option C loses one tap. One tap is the cheapest cost.

---

## §6 — Accessibility

### 6.1 Screen reader semantics

The cartogram is a `<table>` element with `role="grid"`. Structure:

```html
<table role="grid" aria-label="AI visibility map: 50 queries by 11 engines">
  <caption class="sr-only">
    Each cell shows your citation status for one query on one engine.
    Blue cells: cited at top position. Grey cells: cited but later. Empty cells: not cited.
    Red cells: competitor cited instead. Use arrow keys to navigate; Enter to view details.
  </caption>
  <thead>
    <tr role="row">
      <th></th>
      <th role="columnheader" abbr="ChatGPT">GP</th>
      <th role="columnheader" abbr="Claude">CL</th>
      ...
    </tr>
  </thead>
  <tbody>
    <tr role="row">
      <th role="rowheader">Best workspace tool for SaaS teams</th>
      <td role="gridcell" tabindex="0"
          aria-label="Query: Best workspace tool for SaaS teams. Engine: ChatGPT. Position: 2. No competitor cited.">
      </td>
      ...
    </tr>
  </tbody>
</table>
```

**Per-cell aria-label format:**

```
"Query: {query_text}. Engine: {engine_full_name}. Position: {N | 'not cited'}. Competitor: {name | 'none'}."
```

Examples:
- Customer cited at position 2: `"Query: Best workspace tool. Engine: ChatGPT. Position: 2. Competitor: none."`
- Not cited: `"Query: Best workspace tool. Engine: Gemini. Position: not cited. Competitor: none."`
- Competitor cited: `"Query: Best workspace tool. Engine: Perplexity. Position: not cited. Competitor: Notion at position 1."`

### 6.2 Skip link

A "Skip to summary" link sits before the cartogram (visible on focus, screen-reader-readable). It links to a `<section aria-labelledby="cartogram-summary">` block below the cartogram containing a 4-bullet text summary:

- "You are cited at top position in {N} of 550 query/engine combinations."
- "Your strongest engine is {top_engine} ({M}/50 queries)."
- "Your weakest engine is {weakest_engine} ({K}/50 queries)."
- "{competitor_name} is cited in your place {Q} times."

This summary is rendered ALWAYS for screen readers, hidden visually (`sr-only` class). Sighted users see the cartogram; SR users hear the summary first, then can drill into cells.

### 6.3 Keyboard

Per §3.3.

### 6.4 Color-blind safety

Test results (checked against ColorOracle and Sim Daltonism):

| Color pair | Deuteranopia | Protanopia | Tritanopia |
|---|---|---|---|
| `--color-brand` (#3370FF) vs `--color-score-critical-soft` (#FCE3E3) | ✅ pass — blue→grey-blue, soft red→pink. Distinguishable. | ✅ pass — blue holds; soft red shifts toward pink, holds. | ✅ pass. |
| `--color-brand` vs `--color-ink-3` (#6B7280) | ✅ pass — blue holds against neutral grey. | ✅ pass. | ✅ pass. |
| `--color-paper-elev` (#FAFAF7) vs `--color-score-critical-soft` (#FCE3E3) | ⚠️ marginal — both very light, low saturation. Distinguishable but reduced contrast. | ⚠️ marginal. | ✅ pass. |

The marginal pairing is `paper-elev` vs `score-critical-soft` — both are pale. **Mitigation: add a 1px dotted border to `score-critical-soft` cells.** A 1px dotted `--color-score-critical` border on the cell ensures color-blind users distinguish "competitor cited" from "not cited" via texture, not color alone. The dotted border is invisible at desk distance (24"+) for normal-vision users; deuteranopes/protanopes read it as a faint pattern signal.

The 1px dotted border is the secondary signal. Glyph (competitor initial) is the tertiary signal. Three encodings; one accessible chart.

### 6.5 WCAG ratios

- `--color-brand` background with white glyph: 4.51:1 — passes AA at 11px+.
- `--color-ink-3` background with white glyph: 5.74:1 — passes AAA.
- `--color-score-critical-soft` background with `--color-score-critical` glyph: 4.69:1 — passes AA at 11px+.
- `--color-paper-elev` background (no glyph) — N/A.

Engine labels and query labels (`--color-ink-2` on white): 11.94:1 — passes AAA.

### 6.6 Motion-reduced

Per `prefers-reduced-motion: reduce`: tooltip appears with no transition (vs default 100ms fade-in). Drawer appears with no slide-in (vs default 240ms slide). Focus ring appears with no transition (vs default 100ms). Cartogram itself has no entrance animation in any mode (Tufte's lock).

---

## §7 — Implementation Notes

### 7.1 Render strategy

**Product surface (/scans/[scan_id]):** HTML grid via CSS Grid. Not canvas. Not SVG.

```css
.cartogram {
  display: grid;
  grid-template-columns: 280px 12px repeat(11, 14px);
  grid-template-rows: 32px repeat(50, 12px);
  gap: 1px;
  background: var(--color-cartogram-grid-bg);
  padding: 0;
}
.cartogram .cell {
  background: var(--color-paper-elev);
  position: relative;
  cursor: pointer;
}
.cartogram .cell.cited-top { background: var(--color-brand); }
.cartogram .cell.cited-late { background: var(--color-ink-3); }
.cartogram .cell.competitor-cited {
  background: var(--color-score-critical-soft);
  border: 1px dotted var(--color-score-critical);
}
.cartogram .glyph {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font: 600 11px/1 'Inter', sans-serif;
  letter-spacing: 0.04em;
  font-variant-numeric: tabular-nums;
}
.cartogram .cell.cited-top .glyph,
.cartogram .cell.cited-late .glyph {
  color: white;
}
.cartogram .cell.competitor-cited .glyph {
  color: var(--color-score-critical);
}
```

**Why not canvas/SVG.** DOM accessibility wins. Native `<table role="grid">` with arrow-key navigation, ARIA labels, keyboard focus, screen-reader semantics — all free. Canvas would re-implement these from scratch and lose. SVG is a worse middle ground (DOM-but-not-semantic). 550 cells in CSS Grid paints in ~12-16ms on a 2019 MacBook Pro per profiling — well within 60fps budget. No optimization needed.

**PDF (Monthly Update Page 2):** `@react-pdf/renderer` with `<Svg>` element. Server-side render. SVG `<rect>` per cell, `<text>` per glyph. 550 + glyphs ≈ 1,100 SVG elements. ~5KB gzipped on the wire.

**OG card:** `@vercel/og` JSX template. 550 cells rendered as flexbox children (no glyphs at this scale). PNG output. Cached at edge.

### 7.2 Data shape

Server returns:

```ts
type CartogramData = {
  scan_id: string;
  scan_completed_at: string; // ISO timestamp
  customer_id: string;
  queries: Array<{
    id: string;
    text: string; // full query
    truncated: string; // truncated to 38 chars + ellipsis if needed
  }>; // length 50
  engines: Array<{
    id: string;
    name: string; // full name
    abbrev: string; // 2-letter abbrev
    order: number; // 1-11
  }>; // length 11
  cells: Array<{
    query_id: string;
    engine_id: string;
    state: 'cited-top' | 'cited-late' | 'not-cited' | 'competitor-cited';
    position?: number; // 1-10+, only when cited
    competitor?: {
      id: string;
      name: string;
      initial: string; // resolved per §2.4
      position: number;
    };
    citation_url?: string;
    citation_snippet?: string; // ≤200 chars
    rank_history?: number[]; // last 12 scans, position values
    why_this_rank?: string; // ≤120 chars diagnostic
  }>; // length 550
};
```

Server pre-resolves competitor initials per §2.4 algorithm before sending — client renders deterministically. Cells with no competitor initial collision get the unsuffixed letter; collisions resolve to suffixed forms.

Endpoint: `GET /api/scans/{scan_id}/cartogram` → returns the above. Cached for 1 hour (scan results don't change retroactively).

### 7.3 Performance

- Initial paint: ~12-16ms (550 DOM nodes, no images, no async).
- Lazy render: not needed below 5K cells. The cartogram fits in viewport on desktop.
- Hover tooltip: CSS-only positioning (no JS layout calc). 100ms delay before show, 0ms hide.
- Drawer open: 240ms slide-in (`cubic-bezier(0.25, 0.46, 0.45, 0.94)` per design system motion).
- React re-render budget: cartogram is a `useMemo`-wrapped component. Cells render once on mount; only the focused-cell state and tooltip state cause re-renders, both scoped to single elements.

### 7.4 Build estimate

Per PRD v3: ~5 person-days total.
- Cell renderer + grid layout + label gutters: 1.5 pd
- Hover tooltip + click drawer: 1 pd
- Keyboard navigation + ARIA + screen reader summary: 0.5 pd
- PDF version (`@react-pdf/renderer` SVG): 1 pd
- OG card version (`@vercel/og`): 0.5 pd
- Mobile engine-summary view + full-grid modal: 0.5 pd

### 7.5 Test plan (Tier 0 acceptance)

- Pilot readability (per F22 acceptance): show 10 customers and confirm they can identify "which engines are friendly" in under 10 seconds without instruction. If pass rate <80%, the cartogram fails its primary acceptance — it isn't readable at-a-glance.
- Engine abbreviation legibility: render all 11 abbreviations side-by-side at 11px on white and on cream — confirm all distinguishable to 5 reviewers. Done before MVP per PRD v3 §F1 acceptance.
- Color-blind simulation: render the cartogram in Sim Daltonism (deuteranopia, protanopia, tritanopia) — confirm the 4 states distinguishable in all 3 modes.
- Performance: paint time <16ms on 2019 MacBook Pro baseline.
- Print preview: print to PDF; verify cells render at full vector quality, no rasterization, page-break-inside honored.

---

## §8 — Edge Cases

### 8.1 Customer with fewer than 50 queries

The grid still renders 50 rows. The customer's actual queries fill rows 1 through N (where N < 50). Rows N+1 through 50 render with:

- Empty query label (no text in left gutter).
- All 11 cells in the row use `--color-paper-elev` background (same as not-cited) but with **0.4 opacity** (visually fades the row).
- A 1px dashed `--color-border` separator line between row N and row N+1 — hairline, optical center.
- A persistent CTA below the cartogram: `+ Add {50 - N} more queries` — links to /settings/queries. 13px Inter 500, `--color-brand-text`, top-margin 16px.

The faded rows tell the visual story: "you have unfilled capacity." It is not chartjunk — it's *information about what's missing.* Tufte-acceptable: shows the absence as data.

### 8.2 Customer with 50 queries but no scan data yet

Pre-first-scan state. The cartogram skeleton renders (50 rows × 11 cols × `paper-elev` cells), labels are present at full opacity. Below the cartogram, a 96px tall cream-paper card per the design system's editorial register:

```
Heading (Fraunces 300, 18px, --color-ink): "Your map appears after the first scan."
Subtext (Inter 400, 13px, --color-ink-3, top-margin 8px): "Beamix scans 50 queries across
  11 engines. The first scan completes in 2 minutes."
CTA (primary button, 32px tall): "Run first scan →"
```

No skeleton-shimmer. The empty cartogram itself is the silhouette of what's coming.

### 8.3 Engine returns no data for a scan

If one engine fails (timeout, rate limit, API outage), that engine's column shows a **diagonal hatch pattern** (`background-image: repeating-linear-gradient(45deg, var(--color-paper-elev), var(--color-paper-elev) 2px, var(--color-ink-4) 2px, var(--color-ink-4) 3px)`). Tooltip on any cell in the column: *"No data — {engine_name} didn't respond on this scan. Will retry next cycle."*

Engine label still renders normally (no greying). The column is visually distinct from "not cited" — striped, not solid.

### 8.4 Customer has zero citations across all 550 cells

This is the "we have a problem" moment. Every cell is `paper-elev` or `score-critical-soft`. The customer is invisible.

**Above the cartogram, a soft-yellow banner:**

```
Background: --color-needs-you at 8% alpha (#FEF3E0)
Border:     1px solid --color-needs-you (#D97706)
Border-radius: 8px
Padding:    16px
Width:      full cartogram width (468px)
Margin-bottom: 16px (separates from cartogram)

Content:
  Heading (14px Inter 500, --color-ink): "Your visibility is in the foundation phase."
  Body (13px Inter 400, --color-ink-2, line-height 1.5):
    "You're not yet cited for any of your tracked queries. Beamix's first 30 days
    are designed to fix this — Schema Doctor and FAQ Agent run automatically every
    cycle. Your first cited query usually appears within 14 days."
  CTA (13px, --color-brand-text, top-margin 8px):
    "See what Beamix is doing → /workspace"
```

This banner appears ONLY when 0 cells are in `cited-top` or `cited-late` state. As soon as the customer has even one citation, the banner retires and never re-appears. This is the only moment the cartogram surfaces a coaching message — it earns the interruption because the chart-on-its-own would feel like failure rather than diagnosis.

### 8.5 Cartogram on a permalink (public unauthed view)

Per F1 acceptance criteria, the public scan permalink is private by default; sharing requires explicit opt-in. When the customer opts in and shares, an unauthenticated visitor reaches /scan/[scan_id] (public route). On that route, the cartogram renders identically to the authenticated /scans/[scan_id] view — cells, labels, hover, drawer — with three changes:

- The drawer's "Fix this with Beamix" CTA changes to "Sign up to fix this" → routes to `/signup?scan_id={scan_id}` (carries the scan ID into the signup flow per F1 free scan import).
- The drawer's "Why this rank?" diagnostic line is hidden (it's an internal-feeling line; on public surfaces we keep the chart as evidence, not the prescription).
- The page footer shows the cream-paper Seal + "— Beamix" attribution (matching /scan public hero spec).

The cartogram itself is unchanged. The same artifact reads to both audiences.

### 8.6 Cartogram on Monthly Update PDF when customer has only run 1 scan

Page 2's narrative copy template assumes 12 weeks of historical context (`{strongest_query}` is statistically valid only with multiple scans). **First-month variation:** The narrative copy substitutes a first-month variant:

> *"This is your first month's map. The blue cells are where Beamix has already moved you to top position. The grey cells are where you're cited but late — these are the next 30 days' work. The red cells are where {competitor_name} stands in your place. This map is part of your Brief. The agents read it every cycle."*

The variant is rendered when `scan_count_total < 4` (fewer than 4 scans = less than 4 weeks of history).

### 8.7 Cell with both customer AND competitor cited at top

The customer is cited at position 2; a competitor is cited at position 1. **Customer-state wins for cell encoding** — the cell renders as `cited-top` (blue) with the customer's position number `2`. The competitor is surfaced in the hover tooltip's status row: *"Position 2. Notion at Position 1."* This avoids the false "you're losing" red signal when the customer is in fact cited; the competitor information is preserved in the micro layer.

### 8.8 Engine label collision (two engines abbreviated the same)

The locked 2-letter abbreviations are unique per the table in §1.3. If a future engine is added that would collide (e.g., a hypothetical "Grok" and "Groq"), the design system gates engine additions on a 2-letter abbreviation lock — engines without unique 2-letter abbrevs use 3-letter abbrevs and the cartogram column widens to 16px for that column only (asymmetric column widths are permitted; the grid uses CSS Grid with `repeat()` modified to explicit per-column widths). MVP ships 11 unique abbrevs; this case is forward-compatibility scaffolding.

---

## §9 — ASCII Mockup (5 queries × 5 engines sanity-check render)

The full cartogram is 50×11. A condensed 5×5 illustrative slice — each cell shows its color state and glyph — to confirm the visual logic before pixel-build.

Legend for ASCII:
```
[1] [2] [3]  = blue cell, customer cited at top position (1, 2, or 3)
[5] [+]      = grey cell, customer cited at late position (4-9, or "+" for 10+)
[ . ]        = paper-elev, not cited
[ N ] [ A ]  = soft-red cell, competitor cited (N = Notion, A = Airtable, M = Monday)
```

```
                              GP    CL    GE    PX    AO
                              ─────────────────────────────
Best workspace for SaaS...   [ 2 ] [ 1 ] [ N ] [ 1 ] [ . ]
Project management tool ...  [ N ] [ N ] [ N ] [ 4 ] [ . ]
Notion alternatives 2026     [ 1 ] [ 2 ] [ N ] [ 1 ] [ 3 ]
Best note-taking app for ... [ 5 ] [ . ] [ N ] [ 7 ] [ . ]
Wiki for engineering teams   [ 3 ] [ 1 ] [ N ] [ 2 ] [ 1 ]
```

Reading the mockup at-a-glance:
- The customer **owns** Claude (CL) — three top-position cites in the slice.
- The customer **owns** Perplexity (PX) for 4 of 5 queries.
- The customer is **getting hammered on Gemini (GE)** by Notion — 5 of 5 query/engine cells are red with `N`.
- AI Overviews (AO) is **silent** for this customer on most queries (3 of 5 not cited).
- ChatGPT (GP) is mixed — top-position twice, late twice, competitor-cited once.

The narrative the cartogram tells in 4 seconds: *"Notion owns your Gemini result. Claude is your friend. AI Overviews doesn't know you exist."*

That's the John Snow moment. The chart tells the customer where the agents need to go next month, before any words are spoken.

---

## Appendix — Open items for build kickoff

1. **Cream paper hex Tier 0 lock** (per design system §1) — the OG card and Monthly Update Page 2 cream both depend on this. Default `#F7F2E8` ships if Tier 0 lock not resolved.
2. **Engine abbreviation legibility test** (per F1 acceptance) — render all 11 at 11px side-by-side; confirm with 5 reviewers. Lock or revise before MVP.
3. **Pilot readability validation** (per F22 acceptance) — 10 customers, "which engines are friendly?" in 10 seconds. Required before launch.
4. **`score-critical-soft` token addition** — add to `tokens.css`, `tailwind.config.ts`, design system v1.1.
5. **Competitor initial canonicalization seeds** — per §2.4, lock the 5 SaaS + 5 e-commerce vertical seed competitors and their initials before MVP. Locked above; verify with research-lead.
6. **`cartogram-grid-bg` token addition** — `--color-border` (`#E5E7EB`) is the de-facto default; alias as `--color-cartogram-grid-bg` for semantic clarity.
7. **Engine-summary mobile view design lock** — §5 specs the layout; build-lead to confirm pixel-precise component spec before frontend kickoff.

---

*End of pixel specification. Build-ready. The cartogram is a single 550-cell HTML grid with conditional formatting; the SVG version is the same data, server-rendered. The data exists. The renderer is the only new code. Ship.*
