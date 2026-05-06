# /scans and /competitors — Design Spec v1

Date: 2026-04-27
Author: Senior Product Designer (Beamix)
Register: Data Intelligence (per Visual Design System v1, §6.3)
Source of truth tokens: `docs/08-agents_work/2026-04-27-DESIGN-SYSTEM-v1.md`
Locked frame reference: `docs/08-agents_work/2026-04-26-FRAME-5-v2-FULL-VISION.md`
Master Designer brief: `docs/08-agents_work/2026-04-26-BOARD3-seat-2-designer.md`

This document specifies two surfaces — `/scans` and `/competitors` — at the level of pixels, columns, motion, and edge cases. Tokens are referenced by name, not redefined. Both surfaces sit in the **Data Intelligence** register: clinical Stripe-table grammar with the four sigils (Ring, Trace, Seal, Margin) appearing only where earned.

---

## PART A — /scans

### A1. Page job

`/scans` is the historical record of every scan Beamix has run for this customer, plus the deep-dive surface for any single scan, plus the share permalink that turns one scan into a portable artifact.

Two users, two cadences:

- **Yossi (e-commerce ops, daily user).** Opens `/scans` after a Slack ping or a topbar dot pulse. Wants the latest row, the delta, what changed since last week, and proof of work. Reads the table, expands one row, closes the tab. Total time on page: ~90 seconds. He should never need to click into a detail page unless something is genuinely wrong.
- **Sarah (founder, monthly user).** Opens `/scans` once a month before her board call or to send a permalink to a partner. Wants the trajectory line and one specific scan she can hand to someone else. She uses the share button. She rarely scrolls the table.

Both need: the **4 work-attribute lenses (Done / Found / Researched / Changed)** as the primary mental model — every scan answers four questions in this order, and the page makes them filterable. *(2026-04-28 board lock: lenses implement as **action-classification tags** on every action — each agent action emits `lenses: string[]` array, /scans filter queries on this array. Not as agent-attribution buckets, because at MVP only 6 agents ship and 4 of the 11 referenced agents are deferred. Tag taxonomy: `done` = agent executed something / `found` = agent surfaced a gap or signal / `researched` = agent consulted external evidence / `changed` = agent modified an artifact. Actions can carry multiple tags. The tag taxonomy expands as new agents ship without UI changes.)*

This is not a logs surface. It is a record. The grammar is closer to Stripe's payments table than to a CI dashboard. Calm, dense, sortable, copyable. Default-private. Permalinks are explicit.

The page does **not** show "live activity" — that lives on `/home`. It does not show queue state — that lives on `/inbox`. It does not let you start an agent — that's `/workspace`. `/scans` is the past tense of Beamix.

---

### A2. Default Stripe-table view (1440px)

Page max-width: **1340px** (per VDS §1.3 page widths). Centered, with 24px gutter on each side. Sidebar is the standard 240px PageChrome. Topbar is standard.

#### A2.1 Top bar — the page header strip

Height: **96px**. Bottom border: 1px `--color-border`. Internal padding: 24px horizontal.

Left cluster (vertical stack):
- **Eyebrow** (SectionHeading): "SCANS" — 11px Inter 500 caps, 0.08em tracking, `--color-ink-4`.
- **Page title:** "Every scan, every engine." — 22px InterDisplay 500 (`text-h3`), `--color-ink`. Single line. No emoji, no period in the eyebrow.
- **Subtext:** "{N} scans recorded · last scan {time-ago}" — 13px Inter 400, `--color-ink-3`.

Right cluster (horizontal, 12px gaps, vertically centered):
- **Tier badge** — small pill, 22px height, 6px vertical / 12px horizontal padding, `--color-paper-elev` background, 1px `--color-border`, 11px Inter 500 caps. Reads "DISCOVER", "BUILD", or "SCALE".
- **Manual scan counter** — 13px Geist Mono, `--color-ink-3`. Reads "1/1 used this week" (Discover), "1/1 used today" (Build), or "Unlimited" (Scale).
- **PillButton primary, md size** — "+ New scan". Disabled when limit is hit, with tooltip on hover: "Discover allows 1 manual scan/week. Resets Monday." `--color-brand` background, white text. On disabled, opacity 40%, cursor not-allowed.

#### A2.2 Filter rail

Height: **56px**. Sits directly below the top bar, 0px gap. Bottom border: 1px `--color-border`. Internal padding: 16px horizontal (tighter than top bar — this is utility chrome).

Left to right:

- **Lens chips (4)** — see A3 below. Always visible. 12px gap to the next group.
- **Date range** — secondary PillButton, sm, ghost variant. Label: "Last 30 days ▾". Opens a calendar popover (Shadcn DatePicker styled with VDS tokens). Presets: 7d, 30d, 90d, this quarter, custom. 8px gap to the next.
- **Agent filter** — same pattern. Label: "All agents ▾". Multi-select dropdown of the 11 MVP-1 agent slugs. Each row: CrewMonogram sm + agent label + count.
- **Engine filter** — same pattern. Label: "All engines ▾". Locks engine chips for tiers below their access (greyed, padlock icon, tooltip: "Available on Build →").
- **Search** — right-aligned, fills remaining space. 32px height, `--radius-chip`, 1px `--color-border-strong`, 12px horizontal padding, 14px Inter 400 placeholder "Search by scan ID, URL, or finding…", `--color-ink-4` placeholder. Lucide search icon 14px on left, `--color-ink-3`. On focus: `--shadow-focus` ring.

Active filter state: chip background swaps to `--color-brand-soft`, text to `--color-brand-text`, border 1px `--color-border-strong`. A small "Clear" ghost link appears at the right end of the rail when any filter is active.

#### A2.3 Tabs

Three tabs sit directly under the filter rail, height **44px**, no background, bottom border 1px `--color-border` for the rail itself, with the active tab carrying a 2px `--color-brand` bottom border that overlaps the rail border (inset, no row growth).

- **All Scans** (default, count badge in `--color-ink-4` parens)
- **Per-Engine** — pivots the table from one row per scan to one row per engine per scan; engine becomes the leading column, scan ID secondary
- **Auto-Completed** — only scans where 100% of recommended actions were applied without user intervention; this is the Yossi proof tab

Tab labels: 14px Inter 500, `--color-ink-3` inactive, `--color-ink` active. Hover: `--color-ink-2`.

#### A2.4 The table — column-by-column

Layout: CSS grid, fixed column template. Row height: **44px** (Stripe register; VDS calls 44px the compact density and we use it deliberately here — `/scans` is meant to scan many rows fast). Row dividers: 1px `--color-border`. No alternating row stripes. No outer border on the table itself — the page chrome is the frame.

Grid template (1340px content width, minus 48px gutters = 1292px useable; **Margin column CUT 2026-04-28** — the 24px is recovered for actual data):

| Column | Width | Align |
|---|---|---|
| Scan ID | 180px | left |
| Date | 132px | left |
| Score | 64px | right |
| Δ | 56px | right |
| Engines | 120px | left |
| Found | 56px | right |
| Applied | 64px | right |
| Status | 96px | left |
| Lenses (mini-pills) | 252px | left |
| (flex) | flex | — |
| Share | 40px | right |
| Chevron | 24px | right |

Total: 1284px + flex absorbs slack. Columns reflow proportionally below 1280px viewport (see A6 mobile).

**Margin column CUT 2026-04-28.** Per Rams + Tufte + Kare convergence, the 24px Margin strip is removed from /scans table chrome. The Margin survives only on artifact surfaces (Monthly Update PDF, Monday Digest header strip) where the agent fingerprints function as a typographic feature. The 24px of horizontal real estate is recovered for actual data: Scan ID +12px, Lenses +12px. Agent contribution data is exposed via the row expansion's Done column, not the table chrome itself.

**Scan ID.** 13px Geist Mono 400, `tnum ss01`, `--color-ink-2`. Format: `SCN-2026-04-27-0142`. Click-to-copy with a 16px Lucide copy icon revealed on row hover at `--color-ink-4`. On click, the icon morphs to a check for 1200ms (no animation — opacity swap), and a small toast slides up from bottom-right (`--shadow-md`, 8px radius, `--color-paper-elev`, "Permalink copied"). The copied URL is `beamix.tech/s/{scan_id}` — and is **default-private** (the recipient hits a 404 unless the customer has hit Share at least once).

**Date.** 14px Inter 400, `--color-ink-2`. Format: `Apr 27, 9:14am`. Older than 7 days: drops the time and shows "Apr 14". Older than 1 year: shows "Apr 14, 2025". Tooltip on hover shows full ISO timestamp in Geist Mono.

**Score.** 14px InterDisplay 500, `tnum`, `--color-ink`. The number only — no `/100`, no unit. Color stays ink; the semantic palette appears only in the Δ column. Why: the score on its own is just a number; the delta is the verdict.

**Δ (delta from previous scan).** 14px Inter 500, `tnum`, semantic color: `--color-score-good` for positive, `--color-score-critical` for negative ≤ -5, `--color-ink-3` for ±0 to ±2 (noise band). Format: `+3`, `-1`, `±0`. No arrows in the table — the sign is the arrow. Delta on the very first scan: em-dash `—` in `--color-ink-4`.

**Engines.** A 56px-wide engine micro-strip per row showing 11 columns at 4px wide × 12px max height. Each column's height encodes the engine's *delta* on this scan (0 = column floor; +12 = full height; -12 = full inverted height in --color-score-critical). Direct-readable as a sparkbar. Each column tooltipped on hover for precise engine name, current score, and delta.

This replaces the prior 11-dot color-encoded design (Tufte critique 2026-04-28: invisible legend, double-encoded color, eyes don't bounce. The micro-strip is direct-readable.)

Column order is fixed: ChatGPT, Perplexity, Gemini, Claude, Copilot, Grok, You.com, Mistral, AIO, Brave, DuckDuckGo. Engines not queried that scan render as empty 4×12 cells in `--color-paper-elev`. Discover tier shows only the first column populated; the rest render as empty cells.

**Found.** Count of items the scan surfaced. 14px Inter 400, `tnum`, `--color-ink-2`. Click on the cell: opens the row's Found section directly (not the whole expansion).

**Applied.** Count of actions Beamix executed automatically. Same styling as Found. Visually tied to Found by the column adjacency — at 56px / 64px widths they read as a pair.

**Status.** A StatusToken sm. Three states (mapping the VDS StatusToken):
- **Healthy** — green dot, "Clean" label. Scan completed, all engines responded, no critical drops.
- **Acting** — blue dot, "Running" label. The scan is still in flight (rare on `/scans`; means the user navigated here mid-scan).
- **NeedsYou** — amber dot, "Review" label. The scan surfaced something requiring approval; the row in `/inbox` is referenced.

**Lenses (mini-pills).** A horizontal cluster of up to four 22px-tall chips, each carrying a count: `Done · 6`, `Found · 11`, `Researched · 4`, `Changed · 2`. Padding 6/8. 11px Inter 500. Background `--color-paper-elev`, 1px `--color-border`. If a lens has count 0, the chip is rendered at 30% opacity. The pill ordering is locked: Done, Found, Researched, Changed — left to right, matching the lens chips at the top of the page. Click any lens chip: scrolls expansion open and jumps to that section.

**Share.** 32×32 ghost icon button. Lucide `share-2` icon, 16px, `--color-ink-3`. Hover: `--color-ink-2`. Click: opens the Share modal (A5). The Share button on a row is **always visible** — but the URL it generates is always default-private until the user explicitly clicks "Make this public" inside the modal. Until then, hitting Share copies the customer-facing private dashboard URL (auth-walled).

**Chevron.** 16px Lucide `chevron-down`, `--color-ink-4`, 24×24 click target. Indicates the row is expandable. Rotates 180° on expand (150ms ease-out — this is the only motion on the row beyond hover).

#### A2.5 Row interaction

Two paths — both supported, neither preferred — and we use behavior to teach the user which they want:

- **Inline expand (default for daily flow).** Click anywhere on the row except Share or Scan ID. The row expands in place to ~360px height, animating max-height over 240ms ease-out, revealing the four lens sections (A4 condensed inline; see A2.6). The chevron rotates. A 1px `--color-border-strong` left border replaces the standard left border for the duration of expansion (a "you are here" mark). Only one row expanded at a time — opening another collapses the first. Esc collapses.
- **Navigate to detail page (deep dive).** Click the Scan ID directly, or click the chevron's right edge, or `cmd+click` anywhere on the row → navigates to `/scans/[scan_id]` (A4).

The two paths are intentional. Inline expansion is "I just want a peek." Detail page is "I'm going to read this carefully or share it."

Hover state: row background animates from transparent to `rgba(10,10,10,0.025)` over 100ms (`motion/row-hover` from VDS). The Margin marks gain 10% opacity. The copy icon next to Scan ID fades in. No transform on the row itself.

#### A2.6 Inline expansion content

When expanded, the row reveals a 4-column grid below itself, full row width, 24px internal padding, `--color-paper-elev` background, 1px `--color-border` (top only — visually continues the row), 12px gap between columns:

- **Done** column: bullet list of agent actions Beamix executed, max 5 visible with a "+N more" link to the detail page. Each bullet: CrewMonogram sm + verb + object (14px Inter 400 verb in ink, object in ink-2). Recent entries (≤24h) get the Trace under the object string.
- **Found** column: bullet list of findings (gaps, mentions, ranking shifts). 5 max + "+N more". Each item starts with a 4px square indicator in semantic color (`--color-score-fair` for warnings, `--color-score-critical` for regressions, `--color-score-good` for wins).
- **Researched** column: bullet list of queries Beamix ran or evidence it consulted. 5 max + "+N more". Each item: Geist Mono 13px source URL or query string, ink-3.
- **Changed** column: bullet list of artifact changes (schema, copy, FAQ). 5 max + "+N more". Each item: verb (14px Inter 500) + diff preview (13px Geist Mono, single line truncated).

Below the grid, a 12px gap, then a single 32px-tall row with three ghost actions: "Open detail page →" / "Copy permalink" / "Re-run with updated brief". Each is a sm ghost PillButton.

#### A2.7 Crew Trace appearance on rows

Per VDS §2.2 — a Trace appears under any text in the expanded row whose underlying action happened ≤24h ago. We do **not** put traces on closed table rows themselves — the table's job is clinical scanning, and traces on every recent row would feel like highlighter spam. Traces live in the expansion only.

#### A2.8 Default-private permalinks — the lock

The page never auto-publishes a scan. The Share button in the row generates a permalink, but the permalink resolves to:
- **The owning customer (signed in):** the private detail page, full data, no marketing chrome.
- **Anyone else:** 404, until the customer hits "Make this public" inside the Share modal (A5). After that, the same URL resolves to the cream-paper public artifact page.

Per Adam's lock: explicit-share is a deliberate act, not a default.

---

### A3. The 4 work-attribute lenses

The four lenses are the conceptual spine of `/scans`. They are filter chips at the top of the table, sitting at the leftmost edge of the filter rail. They double as scroll anchors inside row expansions and detail pages.

Each chip is a sm StatusToken-shaped pill, 28px height, 6/12 padding, with a count badge.

| Lens | Question it answers | Default chip label | Default sort when active |
|---|---|---|---|
| **Done** | What did Beamix execute? | `Done · {count}` | By scan date desc, then by agent count desc |
| **Found** | What did Beamix surface? | `Found · {count}` | By severity desc (critical → fair → good), then by date |
| **Researched** | What evidence did Beamix consult? | `Researched · {count}` | By source authority desc (Beamix's internal source-quality score), then by date |
| **Changed** | What artifacts did Beamix modify? | `Changed · {count}` | By artifact impact desc (homepage > category > leaf), then by date |

Inactive chip visual: `--color-paper-elev` background, 1px `--color-border`, label in `--color-ink-2`, count in `--color-ink-4`. Active: `--color-brand-soft` background, 1px `--color-border-strong`, label in `--color-brand-text`, count in `--color-ink-2`. Multi-select allowed — clicking another lens adds it. The chips are an OR filter, not AND, because the lenses are categories of the same scan, not nested predicates.

**Which agents contribute to which lens (anchored to current 11 MVP-1 roster):**

- **Done:** all execution agents — Schema Doctor, Citation Fixer, FAQ Agent, Content Refresher, Brand Voice Guard.
- **Found:** all observation agents — Competitor Watch, Trend Spotter, Visibility Monitor, Mention Tracker.
- **Researched:** Trend Spotter (queries), Competitor Watch (deep dives), Citation Fixer (source verification), and the cross-cutting House Memory consults from any agent.
- **Changed:** any agent whose action produced a versioned artifact diff — Schema Doctor (JSON-LD), Content Refresher (page copy), FAQ Agent (FAQ entries), Brand Voice Guard (microcopy).

**Empty states per lens (when filter active and zero rows match):**

- **Done empty:** EmptyState component, no illustration. Headline (Fraunces 22px): "No work executed in this range." Subtext: "Try widening the date range or removing engine filters." Action: ghost PillButton "Clear filters".
- **Found empty:** "Nothing surfaced. Quiet week." Subtext: "Beamix found no new gaps or shifts in this range." No action.
- **Researched empty:** "No external research on file." Subtext: "Beamix didn't need to consult new sources for this range. Try the Done lens instead." Action: "Switch to Done".
- **Changed empty:** "No artifact changes." Subtext: "Findings without changes usually mean approval is pending. Check Inbox." Action: "Open Inbox →".

---

### A4. Per-scan detail page — `/scans/[scan_id]`

The detail page is the page Sarah hands to a partner and Yossi reads when something looks wrong. Page max-width 1340px, with the central content column at **880px** (per VDS — narrow column for readability, side rails at 230px each for trajectory mini-chart and audit log).

#### A4.1 Hero strip

Height: **240px**. `--color-paper` background. Bottom border 1px `--color-border`. Internal vertical padding 48px, horizontal 24px from page edges (within the 880px column).

Left cluster (vertical stack, ~520px wide):
- **Eyebrow:** Geist Mono `SCN-2026-04-27-0142` 13px, `--color-ink-3`. Click-to-copy.
- **Page title:** "Weekly visibility scan." 32px InterDisplay 500 (`text-h2`). One line.
- **Date:** "Sunday, April 27 · 9:14am" 15px Inter 400, `--color-ink-3`.
- **Score row (32px tall):** number (32px InterDisplay 500, `tnum cv11`) + 24px space + Δ (24px Inter 500, semantic color, `tnum`) + 24px space + status sentence ("Healthy and gaining." 18px Inter 400, `--color-ink-3`).

Right cluster (~280px wide):
- **Engines covered** as a 4×3 grid of EngineChips, sm size, condensed (40px tall). Each chip carries the engine's mini-score and delta for this specific scan.
- Below the grid, a single line of 11px caps text: "11 of 11 engines responded" / "9 of 11 — Grok timed out".

Far right (~60px wide):
- **Share button stack:** primary PillButton md "Share" with Lucide `share-2` 14px icon. Below it, 8px gap, a 13px Geist Mono link "Copy permalink" in `--color-brand-text`.

Below the hero, a 48px gap, then the **12-week trajectory mini-chart**:
- Width: full 880px column. Height: 96px.
- A perfect-freehand sparkline of the score across the last 12 scans (this scan is the rightmost dot, slightly larger and `--color-brand`; all prior dots are 4px `--color-ink-4`).
- Y-axis: implicit (no axis labels). X-axis: 11px caps date labels at 4 positions (12 weeks ago, 8w, 4w, today), `--color-ink-4`.
- Hover: crosshair vertical line + tooltip with date, score, delta. Click any prior dot: navigates to that scan's detail page.

#### A4.2 The four lens sections

Below the trajectory chart, 72px gap. Then four sections in order: **Done, Found, Researched, Changed.** Each section is its own sub-page; section vertical gap is 48px.

Each section starts with a SectionHeading eyebrow ("WHAT BEAMIX DID THIS SCAN" / "WHAT BEAMIX FOUND" / "WHAT BEAMIX RESEARCHED" / "WHAT BEAMIX CHANGED" — same lock as the table).

Below the eyebrow, an h3 lead line in 22px Inter 500 (NOT Fraunces — this is a product page, not an artifact): "Beamix executed 6 actions across 3 agents." / "Beamix surfaced 11 findings — 2 critical." etc.

Below the lead, the section body.

**Done section body:** A vertical list of EvidenceCards (VDS §4.6). Each card 56px tall, full column width, 24px Margin strip on left with the agent's color mark, then verb + object + Geist Mono timestamp. Cards within ≤24h carry Trace under the object string. Approximately 8–20 cards per scan; if more, a "Show {N} more" ghost button at the bottom expands.

**Found section body:** A 2-column grid of finding cards. Each card 120px tall, `--color-paper-elev` background, 1px `--color-border`, `--radius-card`. Card structure: 4px square severity indicator (top-left), then in 16px InterDisplay 500 the finding headline ("Schema missing on 4 service pages"), then in 14px Inter 400 the finding body (one or two lines), then a footer row: Geist Mono evidence link + "Approve fix →" ghost button if the finding is actionable. Sorted by severity desc.

**Researched section body:** A vertical list of source rows. Each row 44px tall: source favicon (monochrome), source name in 14px Inter 500, source URL in 13px Geist Mono `--color-ink-3`, "queried by {Agent}" in 11px caps, timestamp right-aligned. Click a row: opens the source in a new tab with a small `↗` glyph appearing on hover.

**Changed section body:** A vertical list of diff cards. Each card 144px tall — top half is the metadata strip (artifact name, agent, timestamp, "View artifact →" link), bottom half is a 13px Geist Mono diff preview, two lines max with "Show full diff" expansion. The diff preview uses `--color-score-good` / `--color-score-critical` left-edge bars (2px) for added/removed lines; no full GitHub-style diff coloring (too noisy in this register).

#### A4.3 Engine-by-engine breakdown

Below the four lens sections, 72px gap. SectionHeading: "BY ENGINE".

A table, full 880px width, one row per engine (up to 11). Columns: Engine, Score, Δ, Mentioned (Y/N + count), Citations (count), First-position queries (count), Last-position queries (count). Row height 56px (slightly taller than the main scans table because density isn't the goal here — readability is). Each row carries an inline 80px-wide perfect-freehand sparkline of the engine's score across the last 8 weeks. **Single 1.5px brand-blue stroke** — no gradient, no fade. Renders at full state at t=0; no entrance animation. Sparklines are static reading instruments. *(Updated 2026-04-28 per Tufte: cut path-draw entrance animation; cut color-fade-from-ink-4-to-brand gradient. "Double-encodes time. Moiré of meaning. The x-axis already encodes time.")*

Click an engine row: opens an engine-specific filter on `/scans` for the trailing 90 days, returning the user to the table view filtered to that engine.

#### A4.3.5 11-engine small-multiples grid (Tufte's Section C, Opportunity 1 — added 2026-04-28)

Replace the prior single aggregated-trend sparkline on /scans/[scan_id] with an 11-engine small-multiples grid:

- 11 sparklines, each 96×40px
- Layout: 4×3 grid with one cell empty (or housing a "summary" line that aggregates all 11)
- Each sparkline carries the engine's score over the past 12 weeks
- Direct-labeled with engine name in 11px Inter caps above the line
- Below: current score and delta in 11px Geist Mono
- Same brand-blue stroke (1.5px, perfect-freehand) on every cell
- No axes, no grid, no fill — Tufte-canonical sparklines
- Total footprint: ~480×180px (smaller than the single-aggregate sparkline it replaces) carrying 11× the information

Pattern reading: the customer reads "ChatGPT and Perplexity climbing; Gemini flat; Claude dipped; Grok dropped 6 points last week" in one glance.

#### A4.4 Audit log (right rail or bottom section)

At ≥1280px viewport: a sticky right rail at 230px wide, beginning at the hero bottom and scrolling with content. At <1280px: a full-width section after Engine-by-engine, 72px gap.

Contents: full provenance envelope per agent action. Each entry is a small row with:
- Geist Mono 11px timestamp (HH:mm:ss.SSS — full precision because audit log is technical truth)
- CrewMonogram sm
- 13px Inter 400 verb + object snippet
- Right-aligned: a 12px Lucide info icon that expands a popover with the agent's input → tools called → output, the model used, the cache key, and a hash of the source artifact.

The audit log is the page's contract with serious users: every action is sourceable down to the model invocation. The popover is the only place this depth is exposed; the table view never shows it.

#### A4.5 Permalink share button (top right)

At the top of the hero strip, far-right corner, a primary PillButton md with the label "Share scan" and a Lucide `share-2` icon. This is the same button as the row-level Share but more prominent. Click → A5 modal.

If the scan is already public (the customer hit Share + Make Public previously), the button label changes to "Manage sharing" and shows a 6px green `--color-healthy` dot to its left, signaling published state.

---

### A5. Share-this-scan public page

The customer hits Share inside the modal, ticks "Make this public" (checkbox, default off), then clicks "Get shareable link". The product generates a unique signed URL of the form:

```
beamix.tech/s/{scan_id}?k={share_key}
```

The `share_key` is a 16-char nonce. Anyone with the URL sees the public artifact page; without `k`, the URL 404s.

**Modal layout** (Shadcn Dialog styled with VDS tokens):
- Width: 480px. Height: auto.
- Header: 24px Inter 500 "Share this scan."
- Body: a checkbox row "Make this public" (default unchecked, with copy "Anyone with the link can view scan results, including engine scores and findings. Customer data is excluded."), a URL display field (14px Geist Mono, copyable), an "Anyone with link" expiry row (default never; options: 7d, 30d, never), and a "What's included" expandable row.
- Footer: ghost "Cancel" + primary "Get shareable link" PillButton.
- On link generation: the modal animates the URL field — the path's `{share_key}` portion does a 600ms `motion/path-draw` style reveal — and the button label changes to "Copy link".

**Public page (the artifact):**

Register: **Editorial Artifact** (per VDS §6.1). This is the one place `/scans` leaves the Data Intelligence register.

- Background: `--color-paper-cream` (#F7F2E8) — full page.
- Top: 32px cream header strip with 20px Beamix wordmark in `--color-ink`, the brand mark glyph, and the SealMark 20px on the right per VDS Move 1.
- Hero, centered, 720px column: ScoreDisplay component at "report" size (120px Ring), with score and delta and status sentence, then below it, a 18px Fraunces 300 lead: "Beamix's weekly visibility scan for {brand-domain}, dated {date}."
- 12-week trajectory chart (same as A4.1, 720px wide, on cream).
- The four lens sections, condensed: each section's lead line (22px Fraunces 300 on cream) + the top 5 items only. No audit log on the public page.
- Engine-by-engine table, condensed to 5 columns (Engine, Score, Δ, Mentioned, Citations).
- Footer CTA strip: cream-paper, 96px tall, "Run your own scan →" 22px Inter 500 + a brand PillButton lg "Scan my site" (links to `beamix.tech/scan` — the public free-scan landing). Then 24px gap, then the Beamix wordmark + signature line "— your crew" in 22px Fraunces 300 italic.
- SealMark 20px at the very bottom-right of the footer (per VDS Move 1).

**Mobile public page:** stacks vertically. Score cluster collapses to centered Ring (96px) + score number above the Ring on the left, delta + status below. Engine table becomes a card list. Lens sections each become a single column.

---

### A6. States, tier variations, mobile

#### Empty (first-ever — user has never scanned)

EmptyState component, centered in the page content area, 720px wide.

- **Illustration:** the only place on `/scans` where Rough.js illustration appears. A 96×120px hand-drawn motif: a stack of three sheets of paper (each at slight roughness 0.8, fixed seed). The top sheet is blank; the second carries a single 4px line of "data"; the third is half-folded as if filed away. Stroke `--color-ink-3`, no fill.
- Headline (Fraunces 300, 22px): "No scans yet."
- Subtext (Inter 400, 14px, `--color-ink-3`): "Run your first scan and Beamix will start the record."
- Action: primary PillButton lg "Run my first scan" — links to `/workspace/new-scan`.

#### Loading

The page renders **instantly**. The top bar, filter rail, tabs, and table chrome all render synchronously. Rows render with skeleton placeholders — 44px tall, `--color-paper-elev` static fill (no shimmer; per VDS anti-pattern §7). Up to 12 skeleton rows at first paint. Real rows replace skeletons as data arrives. No spinner, no progress bar.

When the table is fully loaded, the trajectory mini-chart on the detail page (and the per-engine sparklines) animate via `motion/path-draw` once per session.

#### Per-tier variations

- **Discover** ($79/mo): Engines column shows only the first dot (ChatGPT) populated; the rest render as outlined empty 8px circles in `--color-ink-4`. The engine filter dropdown shows ChatGPT active and the remaining 10 engines locked with a padlock icon and the tooltip "Available on Build →". Manual scan button is rate-limited to 1/week. The top bar tier badge reads "DISCOVER".
- **Build** ($189/mo): Engines column shows up to 6 populated dots (ChatGPT, Perplexity, Gemini, Claude, Copilot, Grok). The remaining 5 engines locked. Manual scan button is rate-limited to 1/day.
- **Scale** ($499/mo): All 11 engines populated. Manual scan button reads "Unlimited". Top bar tier badge reads "SCALE".

The table shape is identical across tiers — the unlock is in the data density, not the layout. This is intentional: a Discover user looking at the table sees what they could have at higher tiers, but never feels the tier as a UI penalty.

#### Mobile (<720px)

The table converts to a card list. Each card 100% width, 16px horizontal margin, 16px vertical gap, 16px internal padding, `--color-paper` background, 1px `--color-border`, `--radius-card`.

Card structure (top to bottom):
- Row 1: Date (left) + Score + Δ (right). 14px Inter 400 / 18px InterDisplay 500.
- Row 2: Scan ID (Geist Mono 13px, `--color-ink-3`).
- Row 3: Lens chips (horizontal scroll if overflow).
- Row 4: Status pill + Share icon button (right).

Tap card → full detail page (`/scans/[scan_id]`). Inline expand is dropped on mobile (no horizontal real estate to make it useful). The filter rail collapses behind a single "Filters" button that opens a bottom sheet.

The Margin strip is dropped on mobile — at 24px wide on a 320px screen it eats too much space. The agent contribution information moves to the card footer as a horizontal stack of CrewMonogram sm circles.

---

## PART B — /competitors

### B1. Page job

`/competitors` is the competitive parity tracker. Yossi opens it daily after morning Slack to check overnight movement. Sarah opens it monthly to see how the gap is trending against the 2 or 3 competitors that actually matter to her board.

The Rivalry Strip — the dual-sparkline depth view — is the **locked craft moment** of this page. But it is **never the headline**. The headline is the table, calm and parity-focused. The Rivalry Strip earns attention only when a row is clicked.

This is the parity surface. It does not show absolute rankings (those are on `/scans` per-engine). It does not run agents (those are on `/workspace`). It does not pitch upgrades. It tracks who is winning what, where, and what they did this week.

The page is a **Build**-tier feature and above. Discover sees a preview only.

---

### B2. Default clean-table view

Page max-width: **1340px** (same as `/scans`). Sidebar + topbar standard.

#### B2.1 Top bar

Height: **96px**. Same structure as `/scans`.

Left cluster:
- Eyebrow: "COMPETITORS"
- Title: "Who's beating you, where, and what they did this week." (22px InterDisplay 500)
- Subtext: "{N} competitors tracked · last update {time-ago}"

Right cluster:
- Tier badge (BUILD or SCALE)
- Add competitor button — primary PillButton md "+ Add competitor". Opens the Add Competitor modal (B4).

#### B2.2 Engine tab nav

Directly below the top bar, height **48px**. A horizontal strip of engine tabs — one per engine the customer's tier has access to, plus an "All engines" summary tab on the far left (default selected).

Each tab: 14px Inter 500, 12px horizontal padding, 48px height. Active tab gets a 2px `--color-brand` bottom border (inset). Inactive tabs `--color-ink-3`, hover `--color-ink-2`, active `--color-ink`. The tab strip is horizontally scrollable on mobile and at <1280px viewport.

The engine tabs determine which engine the table reads from — the gap, the verdict, the trend column all change when you switch tabs. **Switching tabs reprints all rows simultaneously** with `motion/path-draw` on each row's trend sparkline at 800ms (faster than the first-load 1200ms because this is a re-read, not a discovery).

#### B2.3 Filter chip rail

Height: **56px**. Below the engine tabs, 0px gap. 1px `--color-border` bottom.

Left: four filter chips, default "All" selected (multi-select-OR pattern, same as `/scans` lenses):
- `Leading · {n}` (you outscore them)
- `Behind · {n}` (they outscore you)
- `Tied · {n}` (within ±2 points — the noise band)
- `All · {N}` (default; clicking deselects the others)

Right: a 32px-tall search field, "Search competitors…" placeholder, same styling as `/scans` search.

#### B2.4 The table

Page content width 1340px – 48px gutters = 1292px. Row height: **56px** (slightly taller than `/scans` because this table carries more visual weight per row — favicons, dual scores, sparklines).

| Column | Width | Align |
|---|---|---|
| Margin (sigil) | 24px | — |
| Competitor | 240px | left |
| Their score | 88px | right |
| Your score | 88px | right |
| Gap | 88px | center |
| Trend | 200px | left |
| Last move | flex (~440px) | left |
| Brief ref | 32px | center |
| Chevron | 24px | right |

**Margin strip.** As `/scans`. Marks here represent which agents have observed or acted on this competitor (Competitor Watch is the primary contributor; Trend Spotter and Citation Fixer secondary).

**Competitor.** A horizontal cluster: 24×24 monochrome favicon (rendered server-side, converted to grayscale, 90% opacity, `--color-ink` overlay for any pure-white logos so they remain visible on `--color-paper`) + 8px gap + brand name (15px Inter 500, `--color-ink`) + 4px gap + domain (13px Geist Mono, `--color-ink-4`). Hover competitor cell: 12px Lucide `external-link` icon fades in at the right edge — click opens their domain in a new tab.

We use monochrome favicons because per VDS §7 we don't want competitor brand color competing with Beamix's chrome accent. Calm > chaotic.

**Their score & your score.** Both 16px InterDisplay 500, `tnum cv11`, `--color-ink`. No semantic coloring on the numbers themselves — the numbers are neutral. Side-by-side at 88px each they read as a pair; the gap column makes the verdict.

**Gap.** Center-aligned. 14px Inter 500, `tnum`. Format: `+12` if you lead, `-4` if you trail, `±0` if tied. Color: `--color-score-good` (you lead), `--color-score-critical` (you trail by ≥5), `--color-ink-3` (within ±2). The single most-scanned column on the page; sort default.

**Trend.** A 200px-wide perfect-freehand dual-sparkline rendered inline. Two lines: yours `--color-brand`, theirs `--color-ink-2` at 50% opacity. Last 8 weeks. No fills. No axis labels. Hover reveals an inline crosshair tooltip showing both values + date. The trend line is the table's preview of the Rivalry Strip — it's a teaser of the depth view, not a replacement.

**Last move.** A natural-language sentence describing the most recent observed change for this competitor, ≤56 chars: "Added 11 service pages · 3d ago" / "Schema rewrite on /pricing · 6h ago" / "No moves in 14d." 13px Inter 400, `--color-ink-2` (recent ≤24h gets a subtle Trace under the noun phrase per VDS §2.2). Geist Mono timestamp at the end in `--color-ink-4`.

**Brief ref.** A 16px Lucide `bookmark` icon if this competitor is named in the customer's Brief (the onboarding-step-3 artifact). Filled icon in `--color-brand` if so, omitted otherwise. Hover: tooltip "Mentioned in your Brief — {agent} consults this regularly." This is the page's bridge to House Memory.

**Chevron.** 16px Lucide `chevron-right`, `--color-ink-4`. Indicates the row opens a panel (not an inline expansion — the depth view is too rich to inline).

#### B2.5 Sort options

Default sort: **Gap desc** (your biggest losses on top). The user, especially Sarah, comes here to find what's hurting; we put it first.

Other sort options exposed via a small "Sort: Gap ▾" dropdown in the filter chip rail, right of the filters:
- **Gap** (default — most negative first, then most positive)
- **Trend** (steepest negative slope first)
- **Last move recency** (most recent move first)
- **Competitor name** (A–Z)

Sort change reorders rows with a 240ms ease-out FLIP animation (Framer Motion's `layout` prop). No sound. No flash.

#### B2.6 Row click — opens Rivalry Strip

Click anywhere on a row except the favicon link or the Brief icon → opens the Rivalry Strip slide-in panel from the right (B3). The clicked row gets a 2px `--color-brand` left border (inset) and remains highlighted for the duration of the panel. Click another row — the panel reanimates with the new competitor's data; the previous row's highlight transfers.

---

### B3. The Rivalry Strip depth view — the locked craft moment

This is the page's signature. Read this section twice.

#### B3.1 Container

A slide-in panel from the right at ≥1440px viewport. Width: **560px**. Slides in from off-screen-right over **320ms** with `cubic-bezier(0.4, 0, 0.2, 1)`. Closes back over 240ms. Drop shadow `--shadow-lg`. Background `--color-paper`. The page content behind the panel does not dim — Beamix doesn't yell — but a subtle 1px `--color-border-strong` left edge separates the panel from the page.

At <1440px viewport, the panel becomes a full-screen modal: 100vw, 100vh, slides up from the bottom over 320ms. On mobile, the close affordance is a 44px tap target at the top-left. ESC closes on any breakpoint.

Internal padding: 32px horizontal, 24px vertical.

#### B3.2 Header strip

Height: ~120px.

Top row (32px): close button (16px Lucide `x`, 32×32 ghost) on the right, and on the left, the eyebrow "RIVALRY" in 11px caps + 8px gap + the Geist Mono ID `RVL-{competitor-domain}-{engine}`.

Middle row: brand cluster — 32×32 monochrome favicon + 12px gap + competitor name (22px InterDisplay 500) + domain below (13px Geist Mono, `--color-ink-3`).

Bottom row (40px tall): three numbers in a horizontal cluster, separated by 24px ──── dashes in `--color-ink-4`:
- "Their score: **74**" (label 11px caps, value 22px InterDisplay 500)
- "Your score: **62**"
- A verdict StatusToken-shaped pill on the right end. Three states (locked language):
  - **Leading** (green, "You lead by 12 ↑" — green dot, label, ↑ glyph in `--color-score-good`)
  - **Behind** (amber-leaning red, "Behind by 4 ↓" — `--color-score-critical` dot)
  - **Tied** (ink-3, "Tied within 2 pts" — neutral)

The pill is the page's verdict — it's the sentence Sarah quotes in her board call.

#### B3.3 The dual-sparkline (the moment)

Below the header, 32px gap. The strip itself.

- Width: 496px (560px panel – 32px×2 padding).
- Height: 200px.
- Background: `--color-paper`, no gridlines, no axis labels except 4 timestamps along the bottom (11px Geist Mono caps, `--color-ink-4`: "12w ago", "8w ago", "4w ago", "now").
- **Your line:** `--color-brand` (#3370FF), 2px stroke, perfect-freehand with `thinning: 0.5, jitter: 0.02, size: 1.5`. The line reads as drawn, not plotted.
- **Their line:** `--color-ink-2` (#3F3F46) at **40% opacity**, 2px stroke, same perfect-freehand settings but with `seed` derived from the competitor's domain hash so each competitor has a slightly distinct hand.
- **Gap shading:** the polygon between the two lines is filled with a semantic color at **12% opacity**:
  - `--color-score-good` (#10B981) at 12% if your line is above theirs (you lead)
  - `--color-score-critical` (#EF4444) at 12% if their line is above yours (you trail)
  - The polygon recolors per-segment when lines cross — green-soft when your line is winning, red-soft when their line is winning, neutral-soft at parity. This crossover behavior is Tufte-grade and ships at MVP despite the engineering complexity (custom geometry helper to compute polygon segments between two perfect-freehand lines and split at crossovers). Adam's lock 2026-04-28.

#### B3.4 Path-draw race animation — CUT 2026-04-28

**Both lines (yours brand-blue, theirs ink-2 at 40%) render simultaneously, instantly, static. The polygon resolves at the same time. No stagger, no path-draw entrance.** *(Cut per Tufte: "creates hierarchy where there should be parity. The data is the parity." The 80ms stagger and 1200ms path-draw entrance are both removed.)*

The verdict pill still appears via `motion/pill-spring` (280ms back-out) on first open of the panel — that's a one-shot status-change motion, not a sparkline animation.

**Engine-tab switch (panel open, user clicks a different engine).** Both lines re-render instantly at full state. No animation. No stagger.

**Reduced-motion fallback** (`prefers-reduced-motion: reduce`): both lines render fully drawn, instantly. The gap polygon renders at final state. The verdict pill appears in place. The 80ms stagger is suppressed. No loss of information — the entire strip's data is conveyed by the static state; the animation is the enhancement, never the meaning.

#### B3.5 Engine tabs above the strip

Between the header bottom and the strip, an engine tab strip — 36px tall, horizontal scroll on overflow. Same visual language as the page-level engine tabs (B2.2) but smaller. Default selected: whichever engine the page-level tab was on when the row was clicked. Selecting a different engine here re-animates the strip per the rules above.

There's a small "All engines" tab on the far left that aggregates — when active, the lines show the average across the customer's tier-accessible engines.

#### B3.6 Below the strip — competitor's recent moves timeline

24px gap below the strip. SectionHeading: "THEIR RECENT MOVES".

A vertical list of timeline rows. Each row 56px tall, 16px horizontal padding (within the 496px content width).

Row structure:
- **Date column (88px):** Geist Mono 13px, `--color-ink-3`. Format: "Apr 24" or "6h ago" if ≤48h.
- **Verb + object (flex):** 14px Inter 400. Examples: "Added 11 FAQ entries to /services/." / "Rewrote homepage hero." / "Lost 3 citations on Perplexity."
- **Engine pill (right):** sm chip, 22px tall, 11px caps. Carries the engine name where Beamix observed the move.

Recent moves (≤24h) carry a Trace under the verb phrase per VDS §2.2.

If there are >5 moves in the last 30 days, a "Show all moves →" ghost link at the bottom expands a longer view.

Empty state for this section: "No observed moves in the last 30 days. They've gone quiet." in 14px Inter 400, `--color-ink-3`. No illustration.

#### B3.7 "Explain this gap" CTA

Below the moves timeline, 32px gap. A single CTA strip.

- 96px tall, full content width. `--color-paper-cream` background — **this is the one place in `/competitors` where we use cream**, signaling "what comes next is editorial, not table-row data."
- Left: 22px Fraunces 300 lead "Why is the gap {direction}?" (e.g., "Why is the gap widening?"). Below it, 14px Inter 400, `--color-ink-3`: "Beamix can write you a one-paragraph reasoning note from the move history."
- Right: primary PillButton md "Explain this gap →".

Click → opens the **Reasoning panel** as a second-stage drawer that pushes the Rivalry Strip panel left by 240px (creating a side-by-side read). Reasoning panel:
- Width 480px.
- Cream paper background (Editorial Artifact register — full register swap, including the Margin strip on the left edge with marks per agent that contributed evidence).
- Body: 18px Fraunces 300 paragraph (~80–120 words) reasoning about the gap. Uses Beamix voice (direct, specific, no weasel words). Cites moves from the timeline by inline 13px Geist Mono date stamps.
- Signature: 22px Fraunces 300 italic "— your crew" at the bottom.
- SealMark 20px in the bottom-right corner.

The Reasoning panel is read-only. There is no "regenerate" button — Beamix's voice is consistent, not stochastic. If the customer wants a fresh reasoning note, they re-trigger after the next scan.

#### B3.8 Panel footer actions

At the very bottom of the Rivalry Strip panel, a 64px footer strip with 1px `--color-border` top.

- Ghost "Add to Brief" — adds this competitor to the customer's Brief if not already present. Idempotent.
- Ghost "Set alert" — opens an alert config (notify me when gap moves by ≥{N} points).
- Ghost "Open detail page →" — `/competitors/{competitor-id}` — for power users; the panel covers 95% of cases.

---

### B4. Empty states + Add Competitor + tier variations

#### B4.1 Empty state — no competitors tracked

Centered in the page content area, 720px wide.

- **Illustration:** Rough.js drawing, 96×120px. Two stick-figure profiles, side by side, one slightly taller than the other. Roughness 1.0, `--color-ink-3`. Fixed seed. Reads as "you and them," abstracted, not literal. The figure on the left has a small `--color-brand` dot at chest height (you).
- Headline (Fraunces 300, 22px): "No competitors yet."
- Subtext: "Add up to {tier_max} competitors to see who's beating you and what they did this week. Start with one — your top rival."
- Action: primary PillButton lg "Add a competitor" — opens the Add Competitor modal.
- Below the action, 16px gap, a 13px Inter 400 example link: "Try `competitor-domain.com`" — clicking pre-fills the modal.

#### B4.2 Tier preview — Discover (locked)

Discover users do not have `/competitors` — but they see the page in the sidebar and can click through. When they hit the page, the entire content area renders as a single preview card.

Card spec:
- Width: 720px, centered. Height: ~480px. `--color-paper-elev` background, 1px `--color-border`, `--radius-card`. 32px padding.
- Top: a static, screenshot-style render of a sample table — 4 ghost rows with placeholder competitor names ("Acme Co.", "Bright Inc.", "Castle LLC.", "Dune Group" — VDS allows generic names in placeholder visuals as long as they don't appear in shipped data; these are illustration), placeholder scores, a single sample dual-sparkline. Rendered at 60% opacity. No interaction.
- Below the static table, a divider, then a 22px Fraunces 300 lead: "See who's beating you, on every engine."
- Subtext (15px Inter 400, `--color-ink-3`): "Track up to 10 competitors. See their moves week-by-week. Get reasoning notes when the gap moves."
- Action: primary PillButton lg "Upgrade to Build →" — links to `/settings/billing` with the Build tier highlighted.

The preview is honest — it shows what Build delivers, not a gated mock. The blur-and-CTA pattern is forbidden (per VDS §7 anti-patterns sense — no shimmer, no fakery).

#### B4.3 Add Competitor modal

Width: 480px. Shadcn Dialog, VDS-tokenized.

- Header: 24px Inter 500 "Add a competitor."
- Body, vertical stack (12px gap between fields):
  - **Domain field.** 14px Inter 400 label "Their domain". Input 40px tall, 12px horizontal padding, 1px `--color-border-strong`, `--radius-chip`. Placeholder: `competitor.com`. On valid input (debounced 600ms), Beamix fetches the page title and favicon.
  - **Auto-detected name** (read-only field, populates after domain validates). 14px Inter 400 label "Name we'll use". Value renders in 14px Inter 400, `--color-ink-2`, with an inline Pencil edit affordance to override.
  - **What's special about them?** (optional). 14px Inter 400 label, 13px caption "(optional, but it teaches Beamix what to watch for)". Textarea, 96px tall, `--color-paper-elev` background, 1px `--color-border`, 14px Inter 400. Placeholder: "e.g., they're our biggest threat on Perplexity for 'best CRM for X'." This text feeds House Memory and is consulted by Competitor Watch on every scan. Char limit 280.
- Footer: ghost "Cancel" + primary "Add competitor" PillButton md.

On submit:
- Modal closes with 180ms fade.
- The new row appears in the table with `motion/card-entrance` (translateY 6px → 0, opacity 0 → 1, 200ms back-out).
- The page-level competitor count increments. No toast — the appearance of the row is the confirmation.
- A backend job kicks off to seed the competitor's first 8-week trend; the row's trend column shows a "Building trend… first scan in {N}h" placeholder until the seeding completes.

#### B4.4 Tier variations — Build vs Scale

- **Build** ($189/mo): track up to **10 competitors**, all engines accessible to Build (6 engines). The "+ Add competitor" button is disabled at 10 with the tooltip "Build tier covers 10 competitors. Upgrade to Scale for unlimited."
- **Scale** ($499/mo): unlimited competitors, all 11 engines. The button is always enabled.

Engine tabs render only the engines the tier has access to — locked engines are not visible on `/competitors` (unlike `/scans` where they render as outlined empty dots). Why the difference: on `/scans` the engine grid is a coverage map; on `/competitors` the engine tabs are a navigation primitive. Hiding locked tabs keeps the nav rail clean.

---

### B5. Mobile

Below 720px:

The table converts to a card list. Each card 100% width, 16px horizontal margin, 16px vertical gap, 16px padding, `--color-paper`, 1px `--color-border`, `--radius-card`.

Card structure:
- Row 1: Favicon + competitor name + domain (Geist Mono).
- Row 2: "Their {their} · You {your}" + Gap pill (verdict color, 22px height).
- Row 3: Inline 80px-wide dual-sparkline trend.
- Row 4: Last move (truncated to 64 chars, 13px Inter 400) + timestamp.

Tap card → full-screen Rivalry Strip (slides up from bottom, 100vw × 100vh).

Engine tabs: horizontal scroll strip, sticky to top of the page below the topbar. Filter chips: collapse into a "Filter" sheet button. Sort dropdown: stays in the top bar.

The Rivalry Strip on mobile:
- Header strip: same content, stacked vertically on narrow widths. Verdict pill goes to its own row.
- Dual-sparkline: full-width minus 32px padding. Height 200px on tablet, 160px on phone.
- Engine tabs above strip: horizontal scroll.
- Recent moves: same vertical list.
- "Explain this gap" CTA: full-width, 96px tall, cream paper, button stacks below the lead text on phone widths.
- Reasoning panel on mobile: replaces the Rivalry Strip panel rather than pushing it (a single-stack history navigated via a back chevron).

---

### B6. States + edge cases

**Loading.** Engine tabs render instantly. Filter rail renders instantly. The table renders 8 skeleton rows (`--color-paper-elev` static, 56px tall). Skeletons replace as data arrives. The trend sparklines animate via `motion/path-draw` once per session on first load.

**Engine-tab switch.** Per B2.2: rows re-print with sparkline `motion/path-draw` at 800ms (slightly faster than first-load 1200ms — this is a re-read, not discovery).

**Error — competitor cannot be reached.** The competitor's row renders with the favicon at 40% opacity, the scores in `--color-ink-4` showing "—" (em-dash), the trend column shows a 13px Inter 400 message: "Couldn't reach {domain} on this scan. Retrying next cycle." The row is **not** removed — staying visible signals to the user that Beamix is still tracking, just temporarily blind.

**Many competitors (>20 on Scale).** The page virtualizes the table at >20 rows (TanStack Virtual). Filter chips and engine tabs stay above the virtualized region. Sort still works across the full set. No pagination — Beamix doesn't paginate within a single context; the table scrolls.

**Brief reference badge — competitor not in Brief but customer wants it there.** The Rivalry Strip footer's "Add to Brief" action handles this; the badge appears on the row immediately after.

**Engine in tab but the engine never returned data for this competitor.** The trend sparkline shows a single horizontal dotted line at the y-midpoint with the message "No data on this engine yet" in 11px caps in the trend column. No chart is rendered. Gap and scores show "—".

**Competitor goes inactive** (their domain returns 404 or hasn't responded for 14 days). Row gains a small 4px square `--color-score-fair` indicator in the Margin strip and a 11px caps "INACTIVE" tag next to the domain in `--color-ink-3`. The row remains in the table for 30 days, then auto-archives with a notification. Customers can manually archive earlier from the Rivalry Strip footer.

---

## PART C — Cross-surface coherence

Both `/scans` and `/competitors` live in the **Data Intelligence** register. They share the following tokens with `/home` and `/workspace`, ensuring the system reads as one product:

- **Page chrome:** identical sidebar (240px) + topbar (TopbarStatus dot) + 1340px content max-width. Section gap 72px between major sections, 48px between subsections, 24px between components.
- **Table grammar:** TableRow component with Margin strip on the left, hover `motion/row-hover` (100ms linear), inset 2px `--color-brand` left border on selected/expanded rows. Used on `/scans`, `/competitors`, `/crew`, `/inbox`, `/schedules` — the unified Stripe-table register.
- **The four sigils travel:**
  - **The Ring** does not appear on `/scans` table or `/competitors` table — it lives on `/home` and the public `/scan` artifact. On `/scans/[scan_id]` detail page's hero, the ScoreDisplay component is used at "report" size (120px) which contains a smaller Ring; this is the only Ring instance on `/scans`.
  - **The Trace** appears under recent (≤24h) text in row expansions on `/scans`, in the Rivalry Strip moves timeline on `/competitors`, on `/home` activity rows, and on `/workspace` output. Same Rough.js config (roughness 0.6, 28% brand opacity, 1.5px stroke) everywhere. Same fade-in (300ms) and 24h auto-fade-out everywhere.
  - **The Seal** appears only on artifact surfaces. On `/scans`, the Seal lives on the public share page (footer 20px). On `/competitors`, the Seal lives on the Reasoning panel (bottom-right 20px). Never on table chrome.
  - **The Margin** travels on both pages — same 24px width, same agent color palette, same Rough.js circle config (roughness 0.8, fixed seed per agent type). The Margin is the page's connective tissue: a customer scanning `/scans` and `/competitors` reads the same agent palette in the same position on both, and recognizes "the schema doctor was here" without needing labels.
- **Motion vocabulary.** Both pages use only the 12 VDS motion tokens. No bespoke easings, no bespoke durations. `motion/row-hover` for hover, `motion/path-draw` for sparklines, `motion/card-entrance` for new rows, `motion/pill-spring` for status changes.
- **Type ramp.** Page titles use `text-h3` (22px InterDisplay 500). Section eyebrows use SectionHeading (11px caps, 0.08em). Table cells use `text-base` (15px Inter 400) for primary text, `text-sm` (13px) for secondary, `text-mono` for IDs and timestamps. Detail-page hero uses `text-h2` (32px). The score on the detail page hero uses 32px InterDisplay 500 — never the 96px display size, which is reserved for `/home` and `/scan` public.
- **Color discipline.** `--color-brand` (#3370FF) appears only on chrome accent — selected row left borders, primary CTAs, sigils. The semantic palette appears only on data — deltas, severity squares, gap pills, score-band engine dots. `--color-paper-cream` appears only at the editorial moments — the public scan page (full register), the Reasoning panel inside the Rivalry Strip (full register), the "Explain this gap" CTA strip (a single 96px nudge that the next click leads into editorial).

What does **not** travel: register swaps. `/scans` and `/competitors` never become Editorial Artifact register on the table chrome — that would break the clinical contract. Cream paper is the doorway, not the floor.

---

## End of spec

Word count: ~6,050.

For implementation: every value in this document maps to a token in `docs/08-agents_work/2026-04-27-DESIGN-SYSTEM-v1.md`. Where a value is specified here that is not already in the design system (e.g., the 80ms stagger on the Rivalry Strip race, the 200px panel push for the Reasoning side-by-side, the engine tab 36px sub-strip), treat this document as the canonical source and back-port the value into the next design system revision.
