# /home — Detailed Design Spec v1
**Date:** 2026-04-27
**Owner:** Senior Product Designer (this doc)
**Status:** Implementation-ready. Tokens cite Master Designer's seat-2 spec (`2026-04-26-BOARD3-seat-2-designer.md`). Strategy cites Frame 5 v2 (`2026-04-26-FRAME-5-v2-FULL-VISION.md`).
**Surface:** `/home` — the most-visited surface in Beamix product. The daily glance. The implicit renewal-decision page.

---

## 1. The page job + the 5-second test

### What `/home` is FOR

`/home` is not a dashboard. It is **the renewal-decision surface**, viewed in micro-doses. Every visit, the user is implicitly asking: *"is Beamix worth $189/month this month?"* The page must answer that question before they finish their first sip of coffee.

The answer has three load-bearing parts, in order:

1. **Lead attribution** — *"Beamix produced 23 calls and 8 form submissions this month."* This is the renewal mechanic locked at Frame 5 v2. The phone rang or it didn't. Everything else is supporting evidence.
2. **Score + delta + Activity Ring** — *"You're at 78, +5 since last week, and Beamix is working right now."* The Ring is the ambient signal that the product is alive on the user's behalf even when they aren't looking.
3. **One decision, conditional** — *"One thing needs you. ~30 seconds."* Most days this slot is empty. When it appears, it is calm, specific, and quick.

Everything below the fold is the **proof shelf** — the receipts, the trend, the per-engine breakdown, the chronological log. It exists for the visit-once-a-month CFO who scrolls, and for Yossi who scans it like a Bloomberg terminal.

### The 5-second test

In 5 seconds, an unfamiliar but motivated user (Sarah, post-coffee, Tuesday) must learn:

> *"Beamix made me 23 calls and 8 form submissions this month. My score went up 5. There's nothing on fire. I can leave."*

That's it. No charts read. No tabs clicked. No scrolling. The headline + score + delta + status sentence + (sometimes) one decision card. **Five elements, one second of eye-tracking each.**

If the user has to read more than a sentence to know if Beamix is winning, the page has failed.

### Two personas served simultaneously

**Sarah — SaaS founder, B2B vertical, 3 minutes/week.** Visits Monday after the digest email. Reads the lead-attribution number. Glances at the score delta. Approves nothing this week. Leaves. The page must respect her time and reward her with calm. **For Sarah, the page is a billboard.**

**Yossi — agency operator, 5 sessions/day, 30 min total, 20 client accounts (Scale tier).** Toggles between client `/home` pages all day. Lives below the fold. Reads the Receipts list, hovers KPI cards for sparklines, watches the Activity Ring pulse to confirm work is in flight. Wants density. Tolerates jargon. **For Yossi, the page is an instrument.**

The design discipline: **the same page serves both without compromise**. Sarah only reads above the fold. Yossi reads everything. The information architecture must reward depth without punishing surface.

---

## 2. Above-the-fold layout

### Viewport and content frame (1440×900 desktop)

- **Viewport:** 1440×900 (the design canvas)
- **Topbar (global, not part of /home):** 56px tall, sticky, contains Beamix sigil mark (24×24) on the left, search field, ambient status dot, account switcher right
- **Content area:** centered, **max-width 1180px** per Master Designer §1.4
- **Top padding from topbar to first content element:** **120px** — the deliberate stretch per Master Designer §1.4 ("the breath above the Score is intentional"). This is unique to /home; every other page is 72px.
- **Side gutters:** 24px minimum on viewports < 1228px

The fold sits at ~840px below viewport top (900 − 56 topbar − ~scrollbar). With 120px breath + ~520px above-fold cluster, the fold falls cleanly *below* the Decision Card and *above* the start of "This Week's Net Effect."

### Element order, top to bottom

1. Lead-attribution headline
2. Score cluster (Score + Activity Ring + delta + status sentence)
3. Tier badge (right-aligned, baseline-aligned with status sentence)
4. Decision Card (conditional)
5. Evidence Strip (3 cards desktop, 5 on Scale)
6. *Fold*
7. Section 2 ("This Week's Net Effect") peeks 36px above the fold to hint at depth

### 2.1 Lead-attribution headline (THE most important element)

This is the headline of the page. It is the renewal mechanic rendered. It supersedes the score in the visual hierarchy because *the phone ringing* is more important than *a score going up*.

**Copy template:**
> **This month: 23 calls + 8 form submissions through Beamix.** Up 4× vs March.

**Specs:**
- **Position:** 120px from top of content area, full content width (1180px), left-aligned
- **Typography (primary clause — "23 calls + 8 form submissions through Beamix"):**
  - Font: **InterDisplay 500** (Master Designer §1.2)
  - Size: **32px / line-height 40px** (token: `text-h2`)
  - Color: `ink` (`#0A0A0A`)
  - Feature settings: `'tnum', 'cv11'` — tabular nums on the count, single-story g
- **Typography (eyebrow phrase — "This month:"):**
  - Same line, same size, same family, but color `ink-3` (`#6B7280`)
  - This creates a visual disclosure: muted label, loud number
- **Typography (secondary clause — "Up 4× vs March."):**
  - Font: **Inter 400**
  - Size: **18px / line-height 28px** (token: `text-lg`)
  - Color: `ink-3`
  - Sits on its own line, **8px below** the primary clause
  - The "4×" itself is **Inter 500** (one weight up) for emphasis without italic — per Master Designer §1.2 ("Inter italics: never. Use weight (500) for emphasis")
- **The numbers (`23`, `8`, `4`)** all carry `font-feature-settings: 'tnum'`. They are the calibrated points of the headline.
- **Hover state:** none. This is a headline, not a control.
- **Click state:** the entire headline is a link to `/reports/lead-attribution` (the deep view). On click, no animation — instant nav per Master Designer (the product does not perform).
- **Cursor:** `cursor: pointer` only on the hover; underline does not appear (no visual chrome change). The whole block is the affordance.
- **Crew Trace:** under the noun "23 calls" if attribution data updated in the last 24h. Rough.js underline, 1.5px, 28% opacity, brand-blue, roughness 0.6. Triggered by `motion/trace-fade`.
- **Empty / pre-attribution state:** *"Lead attribution starts collecting data 24 hours after you connect a tracked phone number."* Same typographic shell, eyebrow `ink-3` says "Lead attribution:" and a `Connect a number →` link in `brand-blue`. Never an empty number — never `0 calls + 0 form submissions`. That reads as failure.

### 2.2 Score cluster (Score + Activity Ring + delta + status sentence)

**Position:** **48px below** the lead-attribution headline (note: 48 not 72 — these two are a *cluster*; 72 would feel like separation).

**Layout:** horizontal flex, baseline-aligned at the score's bottom edge. Three sub-elements left-to-right with 24px gaps:

```
[ Ring + Score ]    [ +5 ]    ──── Healthy and gaining
   200×200          32px           (separator + sentence)
```

#### 2.2.1 The Activity Ring

This is the single image of Beamix. Master Designer §1.1.

- **Outer diameter:** 200px
- **Stroke:** 2px, `brand-blue` (`#3370FF`)
- **Geometry:** SVG `<circle>` rendered as an arc using `stroke-dasharray` + `stroke-dashoffset`
  - Full circumference: `2 * π * 99 = 622.04px`
  - Arc spans **-90° (top) clockwise to +252°** — gap is at top-right, ~30° wide (51.84px arc)
- **Gap terminus:** a Rough.js dash mark
  - 4px long, 1.5px stroke, color `brand-blue`
  - Roughness: 0.8
  - Seed: stable per session (deterministic per user_id so it doesn't re-jitter each render)
  - 3 jitter points along the dash
  - Rendered as a separate SVG `<path>` overlaid at the gap's terminal coordinate
- **Pulse state (when system is acting):**
  - Animation: `motion/ring-pulse` — gap opacity 0.4 → 1.0 → 0.4
  - Curve: `cubic-bezier(0.4, 0, 0.6, 1)` (sine-like)
  - Duration: 1200ms, infinite
  - Only the **last 30° arc segment** + the Rough.js terminus pulse (use a separate `<path>` for this segment so the rest of the ring stays static at 1.0 opacity)
- **Idle state (system not acting):** static. Gap terminus visible at 1.0 opacity. No motion.
- **Cycle-close moment** (weekly scan + auto-fixes complete): `motion/ring-close` — the arc closes for 800ms (gap opacity → 0; arc completes), then re-opens to a fresh cycle. Curve: `cubic-bezier(0.4, 0, 0.2, 1)`. This fires once per week.
- **Inner circle:** invisible (no fill). The score sits inside.
- **Accessibility:** `<svg role="img" aria-label="Visibility score 78 of 100. Beamix is working.">` (or "...idle" when not acting). The role and label are computed server-side based on state.

#### 2.2.2 The Score (number inside the Ring)

- **Size:** 96px (token: `text-display`)
- **Family:** **InterDisplay 500**
- **Feature settings:** `'tnum', 'cv11', 'ss03'` (Master Designer §1.2 — `ss03` gives architectural straight-sided digits at hero scale)
- **Color:** `ink` (`#0A0A0A`)
- **Line-height:** 96px (matches size — the digit cap-to-baseline fills the space exactly)
- **Position:** centered horizontally and vertically inside the 200px Ring (math: x=100, y=100, dominant-baseline middle, text-anchor middle)
- **Tabular discipline:** 78, 9, 100 must all sit on the same horizontal axis. `tnum` enforces this.
- **Hover:** none. The Score is not interactive.
- **First-load animation:** `motion/score-fill` — counts up 0 → final value
  - Duration: 800ms
  - Curve: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo)
  - Implementation: `requestAnimationFrame` with eased lerp; render integer values only (no decimal flicker)
  - Triggers ONCE per session (use sessionStorage flag)

#### 2.2.3 The Delta

- **Position:** baseline-aligned to the bottom of the Score number, **24px to the right** of the Ring's outer edge
- **Size:** **32px / line-height 40px** (token: `text-h2`)
- **Family:** InterDisplay 500
- **Feature settings:** `'tnum'`
- **Color (positive):** `score-good` (`#10B981`) — for `+5`, `+12`, etc.
- **Color (negative):** `score-critical` (`#EF4444`) — for `-3`, `-8`, etc. Used sparingly per Master Designer §1.3.2 ("Beamix doesn't yell")
- **Color (neutral / 0):** `ink-3`. Display as `0` (no `±` prefix)
- **Format:** signed integer (e.g., `+5`, `-3`, `0`)
- **No animation:** the delta is rendered at final value once the score-fill completes (same 800ms timing)

#### 2.2.4 The Status Sentence

- **Position:** baseline-aligned to the delta, **24px to the right** of the delta
- **Size:** **18px / line-height 28px** (token: `text-lg`)
- **Family:** Inter 400
- **Color:** `ink-3` (`#6B7280`)
- **Separator:** before the sentence, a 24px-wide horizontal dash glyph (`────`) at `ink-4` (`#9CA3AF`), centered on the text baseline
- **Copy variants** (server-determined, one of):
  - `Healthy and gaining.` — score ≥70, delta ≥0
  - `Holding steady.` — score ≥70, delta = 0
  - `Working on three things.` — system acting, no decision pending (replaces "three" with the live count)
  - `One thing needs you.` — Decision Card present
  - `Score dipped 4 points.` — delta < -3 (anti-anxiety state — see §4.5)
  - `Watching for impact.` — score 50-69
- **Crew Traces:** under the noun ("three things") if any of those things were updated in the last 24h. Same Rough.js spec as headline.

### 2.3 Tier badge

- **Position:** **top-right** of the content area, baseline-aligned with the **lead-attribution headline's primary clause** (not with the score). Effectively floats at y=120px, x=right-edge.
- **Style:** a pill-shaped chip
  - Height: 32px
  - Padding: 12px horizontal, 6px vertical (the one allowed `6` exception per Master Designer §1.4)
  - Background: `paper-elev` (`#FAFAF7`)
  - Border: 1px `border` (`rgba(10,10,10,0.06)`)
  - Border-radius: 16px (full pill)
- **Typography:** **13px Inter 500** (token: `text-sm` upweighted)
  - Color: `ink-2` (`#3F3F46`)
  - Letter-spacing: 0.02em
- **Copy template:** *"Build plan · 6 engines · 8 agents"* (interpunct separators)
- **Hover:** background lifts to `paper`, border darkens to `border-strong` (`rgba(10,10,10,0.12)`), 100ms linear (token: `motion/row-hover` reused)
- **Click:** opens `/settings/billing` in same tab. No animation; instant nav.
- **Tier-specific copy:**
  - Discover: `Discover plan · 3 engines · 4 agents`
  - Build: `Build plan · 6 engines · 8 agents`
  - Scale: `Scale plan · 11 engines · 18 agents` (and a tiny gold dot in the badge — 4px brand-blue circle prefix)
- **Free tier (pre-paid):** the badge reads `Free scan · Upgrade to activate crew →` with the arrow as part of the chip text, brand-blue. Hover slightly raises.

### 2.4 Decision Card (conditional)

This appears only when there is **one thing that needs the user**. Most days, it is absent. When it is absent, no skeleton or placeholder remains — the next element (Evidence Strip) simply moves up.

**Conditions for appearance:**
- A `/inbox` item is flagged `requires_user` AND has been waiting < 48h
- Maximum **one** Decision Card on /home at a time. Multiple pending items → show the highest-priority one with a `+2 more in your Inbox` micro-link

**Position:** 32px below the score cluster

**Specs:**
- **Width:** 100% of content area (1180px)
- **Height:** 96px (fixed; if copy overflows, truncate with ellipsis on the subtitle)
- **Background:** `brand-blue-soft` (`rgba(51,112,255,0.06)`)
- **Border:** 1px `brand-blue` at 24% opacity (`rgba(51,112,255,0.24)`)
- **Border-radius:** 12px
- **Padding:** 24px horizontal, 20px vertical
- **Layout:** horizontal flex, content left, button right (24px gap)

**Content (left):**
- **Title:** *"One thing needs you →"*
  - 18px Inter 500 (`text-lg` at 500 weight)
  - Color: `ink`
  - The `→` glyph is part of the title, same color, 4px before
- **Subtitle:** *"Approve a homepage hero rewrite. ~30 seconds."*
  - 14px Inter 400 (`text-sm` at base)
  - Color: `ink-3`
  - 4px below the title
  - Single line; ellipsis on overflow

**Button (right):**
- Text: `Review`
- Size: 40px tall, 96px wide
- Background: `brand-blue`
- Text: white, 14px Inter 500, no letter-spacing
- Border-radius: 8px (Master Designer §1.4 — product utility, not pill)
- Hover: background → `brand-blue-deep` (`#1F4FCC`), 100ms linear
- Active: 1px translate-y down, no shadow change
- A tiny **Rough.js seal mark** (16×16) appears 8px to the *left* of the button text on hover, drawing itself in 200ms (`motion/seal-draw` shortened) — foreshadowing the artifact the user is about to author. This is the §2.2 /inbox Approve-button move pulled forward to /home.

**First-load entrance animation:**
- Token: `motion/card-entrance`
- translate-y: 6px → 0
- opacity: 0 → 1
- Duration: 200ms
- Curve: `cubic-bezier(0.34, 1.56, 0.64, 1)` (mild back-out)
- Triggers at 1100ms in the 1.6s orchestration

**Click:**
- Routes to `/inbox?item={id}` with the preview panel pre-opened
- Page transition: instant (no fade)

**Multiple-pending state (rare):**
- Same card, same copy
- Below the subtitle, a 12px Inter 400 `ink-3` line: *"+2 more in your Inbox"*
- Card height grows to 116px

### 2.5 Evidence Strip

Three cards (Discover and Build) or five cards (Scale) showing **what Beamix did** in the past 24-48 hours. Timestamp + verb + object. This is the *receipts above the fold*.

**Position:** 32px below the Decision Card if present, or 48px below the score cluster if absent.

**Layout:** horizontal flex with 16px gaps, full content width.
- **Discover / Build (3 cards):** each 374.67px wide × 120px tall (1180 − 2*16 / 3)
- **Scale (5 cards):** each 220.8px wide × 120px tall (1180 − 4*16 / 5) — denser

**Card specs:**
- Background: `paper` (`#FFFFFF`)
- Border: 1px `border`
- Border-radius: 12px
- Padding: 20px
- **Margin column** on the left edge of each card: 4px-wide vertical strip in the agent's color (subtle — agent identity without naming the agent externally; Master Designer §2.4 Margin treatment compressed)

**Card content (top to bottom):**
1. **Timestamp:** 11px Geist Mono `ink-4`, uppercase, e.g., `2 HOURS AGO`. (Token: `text-xs` family-overridden to mono)
2. **Verb (action):** 14px Inter 500 `ink`, e.g., *"Added FAQ schema"*
3. **Object (target):** 13px Inter 400 `ink-3`, e.g., *"to /services/emergency-plumbing"* — single line, ellipsis
4. **Footer (delta + signature):** 11px caps `ink-4`, tracking 0.06em, e.g., `+0.4 SCORE · BEAMIX`

**Hover state:**
- Border darkens to `border-strong`
- Background remains `paper`
- A faint sparkline (the impact on score over time) ghosts in at 24% opacity, drawn behind the card content, contained to the card. 200ms fade-in. Same `perfect-freehand` rendering as Section 6's main sparkline.
- Cursor: pointer

**Click:**
- Routes to `/scans/{action_id}` — opens the artifact drawer with full provenance
- Per Master Designer §2.4, the drawer has the seal at the top

**Mobile fallback:** scrolls horizontally, snap-aligned, with 12px gaps. First card 24px from left edge, last card 24px from right edge.

**Empty state (rare — first-day user):** instead of three cards, a single 1180px-wide card with a Rough.js illustration on the left (Beamix sigil being assembled, 96×96, ink-3 stroke) and copy on the right: *"Your crew is assembling. First evidence appears within 6 hours."* — 18px Inter 400 ink-3, no timestamp.

**First-load animation:**
- Token: stagger-fade, 50ms between cards
- Each card: opacity 0 → 1, translate-y 4px → 0
- Curve: `cubic-bezier(0.4, 0, 0.2, 1)` (ease-out)
- Duration: 200ms each
- Begins at 800ms in the 1.6s orchestration (after status sentence renders)

### 2.6 Above-the-fold totals

Vertical math from top of content area:
```
0px      ─ top of content area (56px below topbar)
120px    ─ lead-attribution headline begins (font baseline at 152px)
202px    ─ headline secondary line ends
250px    ─ score cluster begins (top of Ring)
450px    ─ score cluster ends (bottom of Ring)
482px    ─ Decision Card begins (if present)
578px    ─ Decision Card ends
610px    ─ Evidence Strip begins
730px    ─ Evidence Strip ends
802px    ─ Section 2 ("This Week's Net Effect") H3 begins (peeks 36px above 838px fold)
840px    ─ FOLD (at 1440×900 viewport with 56px topbar)
```

If the Decision Card is absent, everything below it shifts up by 128px (96 card + 32 gap), and the Evidence Strip ends at 602px — well above the fold.

### 2.7 Responsive: 1024px tablet

- Content max-width: 944px (24px gutters)
- Top breath: 96px (reduced from 120px)
- Lead-attribution headline: same typography
- Score cluster: same; the cluster is **flex-wrap: nowrap**
- Tier badge: stays top-right, may sit *below* the headline if it would collide. At 1024px it still fits beside the headline.
- Evidence Strip: still 3 cards (Discover/Build) at 304px each. Scale tier shows **3 cards + a "see 2 more" chip** at the right edge — Scale's 5-card density requires desktop.
- Decision Card: full width

---

## 3. Below-the-fold sections

The depth scroll. Each section earns its place. Section gaps: **72px** (Master Designer §1.4). Sub-section gaps within: 48px.

### 3.1 Section 2 — This Week's Net Effect

**Position:** 72px below the Evidence Strip
**Width:** content max 720px, left-aligned within the 1180px frame (giving 460px right gutter — the *editorial column* feel)

**Section header:**
- *"This Week's Net Effect"*
- 22px InterDisplay 500 (`text-h3`)
- Color: `ink`
- Below it, 4px gap, an 11px caps tracking 0.10em `ink-4` eyebrow: `WEEK OF APR 21 — APR 27`

**Body paragraph (24px below header):**
- **18px Inter 400** (`text-lg`)
- Line-height: 28px
- Color: `ink-2`
- Max-width: 720px
- Plain English, written by the Reporter agent. Example:

> *"ChatGPT now cites you on 4 new emergency-plumbing queries. Schema Doctor resolved 3 structured-data errors on /pricing. Citation Fixer added 11 FAQ entries that match how Perplexity asks questions, not how brochures answer them."*

- **Crew Traces** under nouns Beamix touched in the last 24h ("4 new emergency-plumbing queries", "3 structured-data errors", "11 FAQ entries"). Same Rough.js spec.
- **Trailing line:** 16px below the paragraph, in 14px Inter 400 `ink-3` italic-equivalent (use weight 400, not italic, per the no-Inter-italic rule), with a brand-blue arrow: *"See all 14 changes →"* — links to `/scans?lens=changed&week=current`

### 3.2 Section 3 — KPI Quartet

**Position:** 72px below Section 2
**Layout:** 4 cards in a row, 16px gaps, full content width (1180px)
**Each card:** 286px wide × 132px tall

**Card specs:**
- Background: `paper`
- Border: 1px `border`
- Border-radius: 12px
- Padding: 24px

**Card content:**
1. **Eyebrow label:** 11px caps Inter 500 `ink-4`, tracking 0.10em — `MENTIONS`, `CITATIONS`, `COMPETITOR DELTA`, `ENGINE COVERAGE`
2. **Hero number:** 32px InterDisplay 500 tabular `ink` (`text-h2`) — e.g., `38`, `127`, `+3`, `6 / 11`
3. **Secondary line:** 4px below hero, 12px Inter 400 `ink-3` — e.g., *"38 this week, +6"*, *"127 across 6 engines"*, *"You ahead of Profound by 3"*, *"6 of 11 active on Build"*

**Hover state:**
- A `perfect-freehand`-rendered sparkline (the metric over the past 12 weeks) draws into the card, contained to the bottom 60px of the card, at 36% opacity in `brand-blue`. Card content remains in front.
- 240ms fade-in / 240ms fade-out on mouse leave
- Border lifts to `border-strong`
- Cursor: pointer

**Click:**
- Mentions → `/scans?lens=found&filter=mentions`
- Citations → `/scans?lens=found&filter=citations`
- Competitor Delta → `/competitors`
- Engine Coverage → `/scans?group=engine`

**Tier-aware:**
- **Discover:** Engine Coverage shows `3 / 11` and the card has a faint `brand-blue` ring on hover with a tooltip: *"Activate 8 more engines on Build →"*
- **Build:** `6 / 11`, no upsell hover
- **Scale:** `11 / 11`, the card shows a small filled brand-blue dot prefix on the hero number (status indicator)

### 3.3 Section 4 — Score Trend (12-week sparkline)

**Position:** 72px below KPI Quartet
**Width:** 720px (left column, mirrors Section 2's editorial column width)
**Right gutter (460px):** holds Section 5 (Per-Engine Strip header preview / continuation) — but in v1 we keep this column empty for breath. Future v2 may dock a small "engine selector" here.

**Header:**
- *"Score Trend"* — 22px InterDisplay 500 (`text-h3`) `ink`
- Eyebrow: `12-WEEK TREND` — 11px caps `ink-4`, 4px below

**Sparkline:**
- Dimensions: **480px wide × 120px tall**
- 24px below the eyebrow
- Renderer: `perfect-freehand`
  - thinning: 0.5
  - 2% jitter
  - base stroke: 1.5px
  - color: `brand-blue`
- 12 data points (1 per week), evenly spaced
- No axes. No grid. No baseline.
- Below the line: 11px caps `ink-4`, tracking 0.10em — `12-WEEK TREND` (yes, repeats the eyebrow at the bottom — this is editorial caption discipline, signals "the chart is the thing")

**Hover (on the sparkline):**
- Vertical crosshair line: 1px `ink-4`, dashed (4-2 pattern)
- Tooltip: 8px above the data point, anchored to crosshair
  - Background: `ink` (`#0A0A0A`)
  - Text: white, 13px Geist Mono tabular
  - Padding: 8px 12px
  - Border-radius: 6px
  - Content: `Apr 18 · 73 (+2)`
  - Arrow: 6px triangle below the box, pointing to data point
- Crosshair + tooltip fade in 80ms, fade out 120ms

**First-load animation:**
- Token: `motion/path-draw`
- `clip-path: inset(0 100% 0 0)` → `inset(0 0 0 0)`
- Duration: 1000ms
- Curve: `cubic-bezier(0.4, 0, 0.2, 1)`
- Triggers at 100ms in orchestration (parallel to score-fill)

### 3.4 Section 5 — Per-Engine Quick-Strip

**Position:** 72px below Score Trend
**Width:** full content (1180px)

**Header:**
- *"Per-Engine Visibility"* — 22px InterDisplay 500 `ink`
- Eyebrow: 11px caps `ink-4` — `11 ENGINES TRACKED · 6 ACTIVE` (tier-aware count)

**Engine chips row:**
- 11 chips, 16px gaps, wrapping if narrow (3 rows on 1180px)
- Each chip: **56px tall**, **min-width 144px** (variable based on engine name length), 12px horizontal padding, 6px vertical padding (the allowed exception)
- Border-radius: 12px

**Chip content (left to right):**
1. Engine icon: 16×16, color matches engine brand (ChatGPT green, Perplexity teal, Gemini gradient, Claude orange, etc.)
2. Engine name: 12px Inter 500 caps, 0.06em tracking, `ink-2`
3. Mini-score: 18px InterDisplay 500 tabular `ink` (e.g., `82`)
4. Mini-delta: 12px Inter 500 with semantic color (`+3` `score-good`, `-1` `score-critical`)

**Active chip (engine is enabled for this user's tier):**
- Background: `brand-blue-soft` (`rgba(51,112,255,0.06)`)
- Border: 1px `border`
- Hover: border → `brand-blue` at 24% opacity, background unchanged

**Gated chip (engine requires a higher tier):**
- Background: `paper-elev`
- Border: 1px `border`, dashed (4-2)
- Opacity: 40%
- A small padlock glyph (12×12) appears in place of the engine icon, color `ink-3`
- Hover: opacity → 100%; tooltip appears below the chip:
  - Background: `ink`
  - Text: white, 12px Inter 500
  - Content: *"ChatGPT requires Build →"* (or appropriate tier)
  - 8px padding, 6px radius, 8px below chip, fades in 120ms
- Click: routes to `/settings/billing?utm=home_engine_gate`

**Click on active chip:** routes to `/scans?engine={slug}` — the filtered scan history per engine

**Mobile fallback:** chips wrap into a vertical stack at full width.

### 3.5 Section 6 — Crew at Work strip

**Position:** 72px below Per-Engine Strip
**Width:** full content (1180px)

**Header:**
- *"Crew at Work"* — 22px InterDisplay 500 `ink`
- Eyebrow: 11px caps `ink-4` — `18 AGENTS · 4 ACTIVE NOW`

**Strip:**
- A horizontal row of **18 monogram circles** (Master Designer §2.6 specifies these are Rough.js circles, agent's color, but at /home scale we use a smaller 32×32 variant)
- 32px diameter each
- 12px gaps
- Total row width: 18 × 32 + 17 × 12 = 780px (fits inside 1180px content with 200px right room)
- Each monogram: a 2-letter abbreviation in 12px InterDisplay 500, white text, on the agent's color background, drawn with Rough.js (roughness 0.6, deterministic seed per agent — so Schema Doctor's monogram always looks the same)
- **Active agent:** the monogram has a 1.5px brand-blue ring (1px gap from monogram, 1.5px stroke), pulsing softly (`motion/ring-pulse` reused at 0.6 → 1.0 amplitude). 2-3 agents active typical, max 6.
- **Idle agent:** static, no ring, monogram at 80% opacity

**Hover (per monogram):**
- Tooltip appears above:
  - Background: `ink`
  - Text: white, 12px Inter 500, with a 11px Geist Mono `ink-4` second line
  - Content (active): *"Schema Doctor"* / *"Validating /pricing schema..."*
  - Content (idle): *"Schema Doctor"* / *"Last active 6h ago"*
  - 8px padding, 6px radius, fades in 120ms

**Click:** routes to `/crew/{agent_slug}` — per Master Designer §2.6 the agent profile page

**Tier-aware:**
- Discover: only 4 monograms shown; the rest are placeholder dotted-circle outlines (not real agents — gated)
- Build: 8 monograms active, 10 placeholder
- Scale: all 18 monograms

**Note on the single-character externally rule:** the Crew at Work strip is the *only* place on /home where individual agent identities are surfaced — and only as visual marks (monograms), no names until hover. This respects the Frame 5 v2 lock ("18 agents only on /crew") by hovering names instead of inlining them.

### 3.6 Section 7 — Recent Crew Activity feed

**Position:** 72px below Crew at Work
**Width:** 880px (slightly wider than the 720px editorial column; this is a list, not prose)

**Header:**
- *"Recent Activity"* — 22px InterDisplay 500 `ink`
- Eyebrow: 11px caps `ink-4` — `LAST 5 EVENTS`
- Right-aligned at the header's baseline: a 14px Inter 500 brand-blue link *"See full history →"* routing to `/scans`

**List:**
- 5 rows (10 on Scale tier per the dense-display rule)
- Each row: 56px tall, full 880px wide
- 24px horizontal padding (left edge has the 24px Margin per Master Designer §2.4, but compressed: just a 4px-wide colored strip in the agent's color)

**Row content:**
- Left: 16×16 Rough.js monogram circle (agent's color)
- Center: 14px Inter 400 (`text-base`) `ink` action sentence — *"Schema Doctor added FAQ schema to /services/emergency-plumbing"*
  - Crew Traces under "FAQ schema" if updated <24h
  - Note: the externally-facing sentence is signed *"Beamix"* — but on /crew-adjacent surfaces (the Crew at Work strip and Recent Activity feed) the agent name is allowed since this is one click from /crew. Sentences read *"Beamix added FAQ schema..."* in single-character mode by default, with a settings toggle (`/settings/preferences`) to enable agent-named mode for power users (Yossi).
- Right: 13px Geist Mono `ink-4` timestamp (right-aligned), e.g., `2H AGO`

**Hover:**
- Background: `rgba(10,10,10,0.03)`
- 100ms linear (token: `motion/row-hover`)
- Cursor: pointer

**Click:** routes to `/inbox?item={id}` if pending, `/scans/{id}` if completed

### 3.7 Section 8 — The Receipts list (House Memory rendered)

**Position:** 72px below Recent Activity
**Width:** 880px

**Header:**
- *"The Receipts"* — 22px InterDisplay 500 `ink`
- Eyebrow: 11px caps `ink-4` — `DIGESTS · SCANS · MONTHLY UPDATES`

**List structure:**
- Reverse-chronological
- Show last 12 entries by default; *"Load earlier"* link at the bottom
- Each row: 48px tall

**Row layout (24px Margin column on left, like /scans):**
- Margin column (24px wide): a small Rough.js seal mark (12×12) — the seal of the artifact's author (Beamix)
- Date column (88px): 13px Geist Mono `ink-3` tabular — `APR 21`
- Title column (flex): 14px Inter 400 `ink` — e.g., *"Monday Digest — Week of April 21"*, *"Monthly Update — March 2026"*, *"Weekly Scan Report"*
- Permalink icon column (32px, right-aligned): 14×14 chain-link glyph at `ink-4`. Hover → `brand-blue`. Click copies permalink to clipboard with a 200ms toast (*"Permalink copied"*).

**Hover (whole row):**
- Background: `rgba(10,10,10,0.03)`
- Cursor: pointer

**Click:** opens artifact in its native register
- Digest → opens the digest in a side drawer (cream-paper register, Master Designer §2.11 grade)
- Scan → opens scan permalink (`/scans/{id}`)
- Monthly Update → opens `/reports/{id}` (cream-paper PDF render)

### 3.8 Section 9 — Goal Track (Brief progress)

**Position:** 72px below Receipts
**Width:** 720px (editorial column)

**Header:**
- *"Goal Track"* — 22px InterDisplay 500 `ink`
- Eyebrow: 11px caps `ink-4` — `PROGRESS TOWARD YOUR BRIEF`

**Body:**
- Lists 3-5 Brief clauses (depending on Brief content)
- Each clause: a vertical stack
  - Clause text: 14px Inter 400 `ink-2` — e.g., *"Show up for emergency plumbing queries on ChatGPT and Perplexity"*
  - Progress bar: full-width (720px), 4px tall, `paper-elev` background, `brand-blue` fill
  - Progress %: 13px Geist Mono `ink-3` tabular, right-aligned, 4px above the bar — e.g., `64%`
  - Sub-line below the bar: 12px Inter 400 `ink-3` — *"4 of 7 query patterns now cited"*
- 16px gap between clauses

**Hover (on a clause):**
- Background: `rgba(10,10,10,0.03)`
- Tiny right-arrow appears at row-end → routes to `/inbox?brief_clause={id}` (filtered Inbox view)

### 3.9 Section 10 — Next Up

**Position:** 72px below Goal Track, with an extra 24px (96 total) — a deliberate "close the page" breath
**Width:** full content
**Style:** a single line

- 13px Inter 400 `ink-3`
- *"Next scan: Friday 9am · Next digest: Monday 7am · Next Monthly Update: May 1"* (interpunct separators)
- Each fragment is a link (hover: `brand-blue`, no underline)
- Clicks route to `/schedules` (with the relevant row scrolled into view)

**Page bottom padding:** 120px below this line (matches the top breath — the page bookends itself).

### 3.10 Below-the-fold totals

Approximate total page height (above-fold + all sections):
- Above-fold: 730px content + 120px top breath = 850px
- Sections 2-10 with 72px gaps between: ~1850px additional
- Bottom padding: 120px
- **Total: ~2820px** — a comfortable scroll, dense but not overwhelming

---

## 4. States

### 4.1 Empty / first-ever-visit state

The user has just completed onboarding. They've signed the Brief. They've landed on /home for the first time. There is no historical data. There are no decisions pending yet.

**Above-fold treatment:**
- **Lead-attribution headline:** *"Lead attribution is collecting data. First numbers in 24 hours."* — same typographic shell, eyebrow `ink-3` says "Welcome:". A `Connect a tracked phone number →` link sits below the secondary clause at 14px Inter 500 brand-blue.
- **Score:** the score *from the most recent /scan* (this carries over from onboarding). The Activity Ring renders, but the gap is *closed* (full arc) for the first 6 hours — a "your crew is just starting" affordance. After 6 hours, the gap appears.
- **Delta:** absent (no previous score to compare). Replace with a 16px Inter 400 `ink-3` line: *"First measurement"*
- **Status sentence:** *"Your crew is assembling."*
- **Decision Card:** present, with a special copy: *"Your Brief is approved. We'll surface decisions here as they appear. ~No action needed today."* — the button reads `Tour your Inbox` and routes to `/inbox` with an empty-state illustration.
- **Evidence Strip:** the special "Your crew is assembling" single-card variant (§2.5)

**Below-fold treatment:**
- KPI Quartet: numbers render as `—` (em dash), eyebrow says `COLLECTING`. No hover sparkline.
- Score Trend: a single dot at the right edge of the 480×120 frame. A 14px Inter `ink-3` caption next to it: *"12 weeks of data unlocks the trend."*
- Per-Engine Strip: chips render but with em-dash scores. Active chips still styled active.
- Crew at Work: monograms render. 1-2 agents active (Schema Doctor + Citation Fixer typically run first).
- Recent Activity: a single "Onboarding completed" row + (after a few hours) the first agent action.
- Receipts: a single row — the Brief itself, with date and seal.
- Goal Track: full Brief clauses, all at 0%.
- Next Up: same as steady state.

**The hand-drawn empty-state illustration:** does NOT appear on /home (Master Designer §1.6 reserves it for /inbox empty and /workspace, not /home). /home stays composed; the empty state is signaled through copy and progress, not illustration.

### 4.2 Loading state

Per Master Designer's discipline ("no skeleton-shimmer; the product does not perform"):

- **No skeleton screens.** No shimmering rectangles.
- The page renders the **last cached state** instantly (from localStorage / SWR cache) — even if stale by hours.
- A 6px brand-blue dot in the topbar (the topbar status pulse, `motion/topbar-status`) signals revalidation in progress.
- When fresh data arrives (typically <800ms): values **cross-fade** at 200ms linear opacity. No layout shift. No flicker.
- For a first-ever load (no cache): the page renders empty backgrounds for 200ms (max), then everything appears with the orchestrated 1.6s motion. No spinner, no progress bar.
- If the load takes >1500ms (rare — slow connection): a **single line** appears at the top of the content area: 13px Inter 400 `ink-3` *"Loading your latest..."* — fades out when content arrives. No spinner, no progress.

### 4.3 Error state

Three error tiers:

**Tier 1 — Stale data (most common):** the page is fully usable; a single line appears below the topbar: *"Last updated 2 hours ago. Refreshing..."* in 12px Inter 400 `ink-3`. Same line as loading. Auto-recovers.

**Tier 2 — Partial failure (one section failed to load):** the failed section shows its empty/em-dash state with a tiny 12px `ink-3` caption: *"Couldn't load. Retrying..."* — auto-retries every 30s. After 3 fails, the caption becomes *"Try again →"* with a click handler.

**Tier 3 — Full failure (auth lost, network down, server 5xx):**
- Full-page replaces with a centered card (480×280) at the top of the content area
- Background: `paper-cream` (`#F7F2E8`) — yes, cream paper, because the artifact register includes "we're being honest with you" moments
- A small Rough.js seal at the top-left of the card
- Headline (24px Fraunces 300, opsz 144, `ink`): *"We can't reach your crew."*
- Body (15px Inter 400 `ink-2`): *"This is on our side. We're already alerted. Try refreshing in a minute, or:"*
- Two buttons:
  - `Retry now` (brand-blue primary)
  - `Status page →` (ghost, links to `status.beamix.tech`)
- Signature line at the bottom (14px Fraunces italic 300 `ink-3`): *"— your crew"* (yes, even the error page is signed)

This is the **only** moment cream paper appears in product chrome. It is justified because an error page IS an artifact — Beamix is communicating with the user, not running the product.

### 4.4 Active scan-running state

When a scheduled or manual scan is mid-run (typically 30-90 seconds):

- **Activity Ring:** pulses (`motion/ring-pulse`)
- **Score:** unchanged (the score doesn't update until the scan completes; mid-scan, the displayed score is the previous one)
- **Status sentence:** changes to *"Scanning 6 engines now..."* (the 6 reflects the user's tier)
- **Topbar status dot:** pulses (`motion/topbar-status` at 1600ms — slower than ring, ambient)
- **Crew at Work strip:** more monograms become active (the Trust File Auditor, Citation Predictor, etc. all activate during a scan)
- **Recent Activity:** a new row appears at the top with a brand-blue active dot prefix: *"Scanning ChatGPT for emergency plumbing queries..."* — the substep text rotates every 800ms (per `motion/microcopy-rotate`) with the engine being scanned

When the scan completes:
- **Activity Ring:** if the cycle is closing (last scan in the weekly cycle + all auto-fixes done), it triggers `motion/ring-close`
- **Score:** count-up animates from old → new (`motion/score-fill`, 800ms)
- **Delta:** updates with `motion/pill-spring` overshoot
- **Status sentence:** crossfades to the new sentence
- **Evidence Strip:** the new evidence cards push in from the left, oldest card pushes off the right (200ms slide)

### 4.5 Score-drop state (the anti-anxiety pattern)

When the delta is < -3 (a real, meaningful drop):

- **Status sentence:** *"Score dipped 4 pts — Beamix is acting on it. Expected recovery in 2 weeks."*
- **A small 14px Inter 400 `ink-3` line** appears below the score cluster, between the cluster and the Decision Card: *"Cause: ChatGPT updated its citation algorithm. Affects all customers."* — this is the *external attribution* that defuses the user's anxiety. They see "this isn't your fault, and Beamix knows."
- **Decision Card:** ALWAYS appears in this state, even if no user action is required. Copy: *"We're recalibrating your FAQ schema for the new algorithm. ~No action needed."* The button reads `See the plan` (not `Review`) and routes to `/inbox?cause={cause_id}` showing the full remediation plan.
- **Activity Ring:** pulses urgently — the pulse amplitude shifts from `0.4 → 1.0` to `0.6 → 1.0` (more visible). Same 1200ms duration. This is the **ONLY** state where the ring's pulse changes; subtle but signal-rich.
- **Color discipline:** the delta number is `score-critical` (`#EF4444`) — but it's the **only** red on the page. No surrounding alarm chrome.

The principle: a score drop is information, not alarm. The page communicates the cause, the response, and the timeline. The user leaves reassured, not anxious.

### 4.6 Review-debt warning state

Per Frame 5 v2 lock: "review-debt counter is visible somewhere (probably above-the-fold or in /inbox)". On /home, we surface it **in the Decision Card slot** when triggered.

**Trigger 1 — 3-4 items un-reviewed for >3 days:**
- Decision Card appears (even if no urgent decision exists)
- Background: `brand-blue-soft` shifts to a warmer tint — **`rgba(217,119,6,0.06)`** (the `needs-you` amber at 6% opacity)
- Border: 1px `needs-you` (`#D97706`) at 24% opacity
- Title: *"3 items waiting for your review →"*
- Subtitle: *"They've been waiting since Tuesday. ~2 minutes total."*
- Button: `Review all` — routes to `/inbox?filter=needs_you`

**Trigger 2 — 5+ items un-reviewed for >5 days (auto-pause active):**
- Decision Card stays in the same warmer state
- Title: *"Auto-pause is active until you catch up."*
- Subtitle: *"5 items waiting. We've stopped pushing new approvals."*
- Button: `Catch up` (links to `/inbox?filter=needs_you`)
- A small **14px Inter 400 `ink-3` line** appears below the score cluster: *"Auto-pause: Beamix won't queue new decisions until your Inbox is current. This protects your Brief."*

This is the **trust mechanism** rendered. The user sees that Beamix throttles itself when they fall behind — a cue that the system is accountable, not a runaway.

---

## 5. Motion choreography

The 1.6-second first-load orchestration on /home, exact timing.

### 5.1 The orchestrated timeline

```
0ms     ─ Page mount. Skeleton renders:
            • Ring SVG static (full opacity)
            • Score number renders at 0
            • Sparkline empty (clip-path: inset(0 100% 0 0))
            • Crew Traces present in DOM at opacity 0
            • Decision Card present in DOM at opacity 0, translate-y 6px
            • Evidence cards at opacity 0, translate-y 4px each

100ms   ─ motion/score-fill begins (800ms, ease-out-expo)
            • 0 → 78 (or final value)
            • requestAnimationFrame, integer values only

100ms   ─ motion/path-draw begins (1000ms, ease-out)
            • Sparkline clip-path: inset(0 100% 0 0) → inset(0 0 0 0)

600ms   ─ motion/trace-fade begins, staggered 50ms
            • Traces 1-6 fade 0 → 28% opacity over 300ms each
            • All traces complete by 1100ms

800ms   ─ Status sentence fades in (200ms linear)

800ms   ─ Evidence cards stagger-fade begins, 50ms between each
            • Card 1: 800ms → 1000ms
            • Card 2: 850ms → 1050ms
            • Card 3: 900ms → 1100ms
            • Each: opacity 0 → 1, translate-y 4px → 0, ease-out

900ms   ─ motion/score-fill ends. Number lands at final value.

1100ms  ─ motion/path-draw ends.

1100ms  ─ motion/card-entrance fires (Decision Card, if present)
            • translate-y 6px → 0, opacity 0 → 1
            • 200ms, back-out (cubic-bezier(0.34, 1.56, 0.64, 1))

1100ms  ─ motion/ring-pulse begins (continuous, infinite)
            • If system is acting; otherwise ring stays static

1300ms  ─ Decision Card lands.

1600ms  ─ All entrance motion complete.
            • Page is static except: ring pulse (if acting), topbar dot pulse.
```

### 5.2 Reduced-motion fallback

Each animation has a **first-class static composition** (Master Designer §1.5):

- `score-fill` → score appears at final value at 0ms
- `path-draw` → sparkline appears fully drawn at 0ms
- `trace-fade` → traces appear at 28% opacity at 0ms
- `card-entrance` → Decision Card appears in place at 0ms (no translate-y)
- `ring-pulse` → ring is static at full opacity (gap visible, no opacity oscillation)
- `pill-spring`, `seal-draw`, `microcopy-rotate` → all static final states
- `row-hover` → instant background change (0ms)

The reduced-motion page is **fully composed at first paint**. No staggering, no fading. Identical layout, identical hierarchy, identical typography. Only the temporal dimension is removed.

Implementation: `@media (prefers-reduced-motion: reduce)` wraps every animation block. CSS custom properties for durations/easings allow the same component code to render both modes.

### 5.3 Subsequent visits in same session

- **No entrance animations.** Page renders at final state instantly.
- Ring pulse continues (per session state).
- Hover animations (KPI sparkline, Decision Card seal-draw, row hover) all still active.
- This is critical: the product **does not perform for the user every time they visit**. The motion is a greeting on first arrival, not a routine.

Implementation: `sessionStorage.setItem('home_animated', '1')` on first load; subsequent loads check this flag and skip the orchestration.

### 5.4 New-data-arrival animation (mid-session)

When the user is on /home and new data arrives (a scan completes, a new evidence card appears):

- **Score:** if changed, `motion/score-fill` re-runs (800ms)
- **Delta:** `motion/pill-spring` — scale 0.96 → 1.04 → 1.0 over 280ms
- **New Evidence card:** slides in from the left edge (translate-x -20px → 0, opacity 0 → 1, 240ms ease-out). The oldest card slides out the right edge (240ms).
- **Status sentence:** crossfades (200ms linear) if the sentence changes.

These are *event responses*, not first-load orchestration. They trigger anytime, never block, never overlap badly.

---

## 6. Mobile (375px)

The mobile fold is dramatically less generous. Every element competes for the first 600px (above-fold on a typical 375×667 iPhone screen with 56px topbar + 80px bottom-nav).

### 6.1 Priority order (top to bottom)

1. **Lead-attribution headline** (collapsed)
2. **Score + delta** (smaller, no visible status sentence above fold)
3. **Decision Card** (if present — pushes the score out of fold but earns its place)
4. *Fold*
5. Evidence Strip (1 card visible, horizontal scroll)
6. Status sentence (moves below fold on mobile)
7. Below-fold sections (collapsed; some hidden)

### 6.2 Element specs at 375px

**Top breath:** 32px (reduced from 120px; mobile is dense)

**Lead-attribution headline:**
- Primary clause: 22px InterDisplay 500 (`text-h3`), 2-line wrap allowed
- Secondary clause: 14px Inter 400 (`text-sm`)
- Eyebrow color discipline preserved (`ink-3` on "This month:")

**Score cluster:**
- Ring: 144px diameter (down from 200px)
- Score: 64px InterDisplay (down from 96px)
- Delta: 22px InterDisplay (down from 32px), positioned **below** the ring (not beside) on mobile, centered
- Status sentence: 14px Inter 400 `ink-3`, **below** the delta, centered
- The whole cluster is centered horizontally on mobile (left-aligned on desktop)

**Tier badge:**
- Moves to **above** the lead-attribution headline (top-right of content area, separate row)
- Size unchanged

**Decision Card:**
- Width: 327px (375 − 24 × 2 gutters)
- Height: 96px → grows to 116px if the subtitle wraps
- Button moves below the title/subtitle (full-width, 40px tall)

**Evidence Strip:**
- Horizontal scroll, snap-aligned
- 1 card visible at a time (~280px wide)
- Snap to card edges
- Scroll indicator: 3 dots below the strip (or 5 on Scale), brand-blue active dot

**Below-fold sections — adjusted for mobile:**
- KPI Quartet → KPI 2x2 grid (each card full-width-half, 159.5px wide × 120px tall)
- Score Trend → 327×88 sparkline
- Per-Engine Strip → vertical stacked chips (full-width each, 56px tall)
- Crew at Work → horizontal scroll (all 18 monograms scrollable), no wrap
- Recent Activity → identical layout, just narrower
- Receipts → identical, narrower
- Goal Track → identical, narrower
- Next Up → wraps to 3 lines

### 6.3 Bottom-nav target (mobile-only)

A 64px-tall bottom navigation appears on mobile (not on desktop). Five tabs: Home (active), Inbox, Crew, Scans, More. /home's tab icon is a 24×24 brand-blue active state (a small Activity Ring monogram), with a 4px brand-blue dot above the icon if unread items exist in inbox or recent activity.

---

## 7. Tier-aware variations

The same page renders differently per tier. The discipline: **never hide a section entirely** (that creates a cliff at upgrade). Instead, sections gray out gated content with hover-revealed upsells.

### 7.1 Discover ($79/mo)

- **Lead-attribution headline:** present (Twilio numbers come with all paid tiers)
- **Score cluster:** unchanged
- **Tier badge:** *"Discover plan · 3 engines · 4 agents"*
- **Decision Card:** unchanged
- **Evidence Strip:** 3 cards
- **KPI Quartet:** Engine Coverage shows `3 / 11` with hover upsell
- **Score Trend:** 12 weeks visible (no gating; trend is core)
- **Per-Engine Strip:** 3 active chips (ChatGPT, Perplexity, Gemini), 8 gated chips
- **Crew at Work:** 4 monograms active, 14 placeholder dotted-circle outlines. Hovering a placeholder shows tooltip: *"Activate {agent_name} on Build →"*
- **Recent Activity:** 5 rows
- **Receipts:** 12 entries default
- **Goal Track:** 3-5 clauses (depends on Brief)
- **Next Up:** unchanged
- **Hidden on Discover:** none. (Everything is visible; gated content is just gray.)

### 7.2 Build ($189/mo)

- **Tier badge:** *"Build plan · 6 engines · 8 agents"*
- **Per-Engine Strip:** 6 active, 5 gated
- **Crew at Work:** 8 monograms active, 10 placeholder
- **All other sections:** identical to Discover

### 7.3 Scale ($499/mo)

- **Tier badge:** *"Scale plan · 11 engines · 18 agents"* with a small brand-blue dot prefix in the badge (Scale identifier)
- **Evidence Strip: 5 cards** instead of 3 (the dense-display rule)
- **Per-Engine Strip:** 11 active, 0 gated
- **Crew at Work:** all 18 monograms active (no placeholders)
- **Recent Activity:** 10 rows instead of 5
- **A new section appears between Receipts and Goal Track:** *"Per-Client View"* — for agency operators (Yossi). A horizontal strip of client-account cards with their scores. Click → switches the entire /home context to that client. This is Scale-only and replaces the multi-tab flow most agency tools force.

### 7.4 Free (post-scan, pre-paid)

The user has run a free /scan but hasn't paid yet. They land on /home in a heavily gated mode:

- **Lead-attribution headline:** replaced with *"Activate your crew to start collecting lead attribution."* (no number; instead an inline CTA)
- **Score cluster:** present, score from the free scan, no delta, no Activity Ring (just a static circle outline — the ring is the "crew is working" sigil; without a paid crew, no ring)
- **Tier badge:** *"Free scan · Upgrade to activate crew →"* — entire badge brand-blue
- **Decision Card:** *"Upgrade to start fixing what we found."* with `Choose plan` button routing to `/pricing`
- **Evidence Strip:** replaced with a 3-card "what your crew would do" preview (Schema Doctor, Citation Fixer, FAQ Agent example actions, marked "preview"). Hover shows the upsell.
- **All below-fold sections:** rendered with em-dash values and a faint overlay: 24% white-paper wash with a centered CTA card (*"See your full crew at work — Activate from $79/mo"*). The data is technically there (from the free scan) but production-quality presentation is gated.

---

## 8. Edge cases + accessibility

### 8.1 prefers-reduced-motion

Covered in §5.2. Every animation has a static composition. The reduced-motion /home is fully designed, not degraded.

### 8.2 prefers-color-scheme: dark

Per Master Designer §1.3.4, dark mode is *not a flip* but a separate composition. **For v1, /home is light-mode only.** Dark mode is a v2 deliverable. Implementation now should use CSS custom properties for all color tokens so the v2 dark mode is a token-swap, not a redesign.

Token mapping for v2 (per Master Designer):
- `paper` → `#0E0E10`
- `paper-elev` → `#16161A`
- `ink` → `#F5F5F2`
- `brand-blue` → `#5A8FFF` (lifted)
- `border` → `rgba(255,255,255,0.08)`

### 8.3 Keyboard navigation

- **Tab order:** lead-attribution headline → tier badge → Decision Card button (if present) → Evidence Strip cards (1, 2, 3) → KPI cards (1-4) → Score Trend (focusable, with arrow keys to scrub the crosshair) → Per-Engine chips → Crew at Work monograms → Recent Activity rows → Receipts rows → Goal Track clauses → Next Up links
- **Focus styles:** 2px brand-blue outline, 2px offset, 6px border-radius. Same on every focusable element.
- **Skip-to-content link:** standard A11y practice; appears on tab when topbar is focused.
- **Score Trend keyboard interaction:** Left/Right arrow keys move the crosshair through data points. Tooltip updates in real-time. Enter key opens the data point's detail in a modal.
- **Activity Ring:** focusable. Aria-label updates dynamically.

### 8.4 Screen reader semantics

- **Page landmark structure:**
  - `<header>` for topbar
  - `<main aria-labelledby="home-heading">` for content
  - `<h1 id="home-heading" class="sr-only">Home</h1>` (visually hidden, semantic anchor)
  - Each section is `<section aria-labelledby="...">` with its `<h2>` as the labeled element
- **Activity Ring:** `<svg role="img" aria-label="Visibility score 78 of 100. Beamix is currently working on three things.">` — the label updates whenever the state changes.
- **Score number:** wrapped in `<span aria-live="polite">` so screen readers announce score changes mid-session.
- **Decision Card:** `<aside aria-labelledby="decision-title" role="complementary">` so it's announced as a complementary region but not interruptive.
- **Crew Traces:** the underline is purely decorative; the underlying text carries no extra aria-label. (Crew Traces are *ambient* — they don't need announcement.)
- **Evidence Strip:** each card is `<article aria-labelledby="...">` with the verb + object as the labeled element.
- **Sparkline:** `<svg role="img" aria-label="Score over 12 weeks. Trending up from 65 in February to 78 in late April.">` — auto-generated narrative.

### 8.5 Long-content edge cases

- **Very long Brief clauses on Goal Track:** clauses wrap to max 2 lines, ellipsis after. Hover/focus reveals the full clause in a tooltip.
- **Very many evidence cards on Scale tier:** capped at 5 cards. If more events occurred, the 5th card includes a `+12 more →` link in its footer that routes to `/scans?lens=changed&hours=48`.
- **Long agent names on Crew at Work tooltips:** wrap to 2 lines max in the tooltip.
- **Score = 100:** renders as `100` (3 digits). Tabular discipline ensures it doesn't visually crowd. Position math accounts for the 3-digit edge case (the score is centered, not left-aligned, so width changes are absorbed).
- **Score = 0 or single digit:** still rendered at 96px. The Ring's gap remains visible.
- **No Brief approved yet (impossible state if onboarding completed, but defensive):** Goal Track shows a single CTA card *"Approve your Brief to set goals →"* routing to `/onboarding/brief`.

### 8.6 RTL (Hebrew) support

Beamix UI is English-only at MVP per Master Designer's notes, but the typographic system is RTL-ready:
- Margin column flips to right edge on RTL
- Tier badge moves to top-left
- Right-arrows in copy flip
- Geist Mono numbers stay LTR (numbers are LTR even in RTL contexts)
- Activity Ring gap moves to top-left (mirror)

For v1: ship LTR only. RTL is a token-swap layer for v2.

### 8.7 Color blindness

- The delta uses both color (green/red) and a sign (`+`/`-`) — never color alone
- The score-state colors (excellent/good/fair/critical) are reinforced with copy ("Healthy", "Watching", etc.) — never color alone
- The Activity Ring's "acting" state is reinforced with the pulsing animation — color is not the only signal
- The Engine Coverage gating is reinforced with the padlock glyph — gray-out is not the only signal

---

## 9. Frontend implementation notes

### 9.1 Component breakdown

Components new to /home (candidate primitives for the design system):

- `<ActivityRing score={78} state="acting" pulse={true} />` — NEW; SVG arc + Rough.js terminus. **Candidate for design system v1 core.**
- `<ScoreCluster score delta status />` — composes ActivityRing + score number + delta + sentence. **/home-specific composition.**
- `<LeadAttributionHeadline calls={23} forms={8} comparison="4× vs March" />` — NEW. **/home-specific.**
- `<EvidenceCard timestamp verb object delta agent />` — NEW. Reusable on /scans with minor variation. **Candidate primitive.**
- `<EvidenceStrip cards={3 | 5} />` — wraps EvidenceCard in horizontal flex. **/home-specific.**
- `<DecisionCard variant="default" | "review_debt" | "score_drop" />` — NEW. Reusable on /inbox. **Candidate primitive.**
- `<KPICard label hero secondary metric={key} />` — NEW. With hover sparkline. **Candidate primitive.**
- `<Sparkline data weeks=12 width height />` — using `perfect-freehand`. **Candidate primitive — used everywhere.**
- `<EngineChip engine score delta state="active" | "gated" />` — NEW. Reusable on /scans, /competitors. **Candidate primitive.**
- `<CrewMonogram agent size={32} active={false} />` — NEW. Rough.js render. Reusable on /crew, /inbox, /scans. **Candidate primitive.**
- `<TierBadge tier="build" engines={6} agents={8} />` — NEW. **Reusable on settings, billing.**
- `<GoalProgress clause percent secondary />` — NEW. **Reusable on /settings/brief.**
- `<CrewTrace>` — wrapper component that renders a Rough.js underline beneath children. Activated by `lastModified` prop. **Candidate primitive — used everywhere.**

### 9.2 Existing primitives reused

From the in-progress Visual Design System v1:
- Button (with brand-blue primary, ghost variants)
- Tooltip
- Toast
- LinkArrow (the brand-blue text link with `→` glyph)
- Section / SectionHeader
- IconButton

### 9.3 Data and state

- **Data fetching:** SWR (`useSWR`) with stale-while-revalidate. Cache key: `/api/home?user_id={id}`. Revalidate on focus, on 60s interval.
- **First-load detection:** `sessionStorage.getItem('home_animated')` flag for orchestration.
- **Active scan state:** WebSocket subscription to `/api/scans/active?user_id={id}` for the topbar dot pulse and Ring pulse. Falls back to polling at 10s if WS unavailable.
- **Score animation:** custom hook `useScoreCountUp(target, { duration: 800, easing: easeOutExpo })`.
- **Crew Trace `lastModified` source:** each entity in API response carries `last_modified_at`. CrewTrace component checks `Date.now() - lastModified < 24*60*60*1000`.

### 9.4 Performance budget

- **Initial JS payload for /home:** ≤80kb compressed (per Master Designer's question to Engineer in §6 Q2)
- **First Contentful Paint:** ≤1200ms on 4G mid-tier laptop
- **Largest Contentful Paint:** ≤1800ms (the Score lands at ~900ms in the orchestration; LCP is the headline)
- **Cumulative Layout Shift:** 0 (the page renders skeleton first; values fill in without shifting layout)
- **All animations target 60fps** on a 2018 MacBook Air baseline. CI check via Playwright + Chrome DevTools Protocol on every PR.
- **Rough.js renders cached:** the agent monogram seeds are deterministic per agent_id, so the rendered SVG paths are computed once and stored in localStorage. Only re-renders on agent color/identity changes (rare).

### 9.5 Files for the dev

- `apps/web/app/(authed)/home/page.tsx` — the route
- `apps/web/app/(authed)/home/components/` — local /home compositions (LeadAttributionHeadline, ScoreCluster, EvidenceStrip, etc.)
- `apps/web/components/primitives/` — shared primitives (ActivityRing, Sparkline, CrewTrace, EvidenceCard, DecisionCard, KPICard, EngineChip, CrewMonogram, TierBadge, GoalProgress)
- `apps/web/lib/motion/tokens.ts` — the 12 motion tokens as named CSS custom properties
- `apps/web/lib/design/tokens.ts` — color, spacing, typography tokens (sourced from the Visual Design System v1)
- `apps/web/lib/hooks/useScoreCountUp.ts`, `useReducedMotion.ts`, `useSessionFlag.ts`

### 9.6 Items to flag for design system v2

These are introduced in /home v1 but should be re-reviewed once the system catalog is settled:

- The **Margin column** treatment (compressed 4px on cards vs. full 24px on tables) — needs a system-wide spec for "Margin in dense vs. spacious contexts"
- The **Decision Card** color variants (`default` brand-blue-soft / `review_debt` amber / `score_drop` amber) — confirm these don't multiply uncontrollably
- The **Evidence Strip's 3 vs 5 card density rule** — should this be a global tier-aware density token?
- The **error-state cream-paper card** — first time cream paper enters product chrome. Master Designer's principle is "cream is for artifacts only." Argument: an error message IS an artifact (Beamix communicating with the user, not running the product). **Flag for Master Designer review.**
- The **Crew at Work strip's hover-name behavior** — Master Designer's "single character externally" rule says agent names appear only on /crew. /home shows them on hover (one click from /crew anyway). Confirm this is acceptable or revise to monogram-only with no name reveal.

---

## End of /home v1 spec

This is the implementation-ready, pixel-precise design for /home — the daily glance, the renewal-decision surface, the page that gets screenshotted. It honors the Master Designer's locks: the Activity Ring sigil, the 4-mark system, the 10-size type scale with stylistic-set discipline, the 12 motion tokens with reduced-motion compositions designed first, the cream-paper register reserved for artifacts, the single-character externally with hover-revealed agent identity on /home only.

It serves Sarah's 3-minute Tuesday and Yossi's 30-second-five-times-a-day. It is dense without being cramped. It breathes at 120px from the top because /home is the front door and the front door deserves air.

The next deliverables to unblock /home build:
1. Visual Design System v1 token export (in progress, design-lead)
2. ActivityRing component prototype (frontend-developer)
3. Sparkline + perfect-freehand integration spike (frontend-developer)
4. Rough.js Crew Trace primitive (frontend-developer)
5. Lead-attribution data API contract (build-lead)
6. Brief clause → Goal Track data shape (build-lead + product-lead)

— *the senior product designer*
