# Wave 3 Visual Direction
*Design Lead. 2026-04-20. Pencil MCP: unavailable — skipped gracefully.*

---

## 0. Design Dials for Wave 3

| Dial | Value | Rationale |
|------|-------|-----------|
| DESIGN_VARIANCE | 5 | Slight asymmetry (main+aside grid) without chaos. SaaS professionalism. |
| MOTION_INTENSITY | 5 | CSS transitions + Framer spring entry. No scroll parallax. |
| VISUAL_DENSITY | 8 | Cockpit mode: 8+ data points above fold, 1px dividers over card boxes. |

Wave 2 was VISUAL_DENSITY 4. This is the primary correction.

---

## 1. Grid + Spacing Math

| Surface | Container max-w | Main grid | Aside | Card padding | Section gap | Row height | Data pts above fold @1440 |
|---------|----------------|-----------|-------|--------------|-------------|-----------|--------------------------|
| **Home** | 1200px | `grid-cols-[1fr_300px]` gap-5 | 300px fixed | p-4 (16px) | gap-5 (20px) | — | 10+ (4 KPIs + score + 3 engine cards + 3 suggestions) |
| **Scans list** | 1100px | Full-width table | — | px-4 py-3 per row | divide-y border-border | 52px | 8+ (score badge + 5 engine pips + delta + date) per row |
| **Scan detail** | 1100px | `grid-cols-[1fr_280px]` gap-5 | 280px | p-4 | gap-4 | — | 12+ (score hero + 5 engine cards + 3 query rows) |
| **Competitors** | 1100px | `grid-cols-[1fr_260px]` gap-5 | 260px | p-4 | gap-4 | — | 14+ (SoV ring + 3 competitor rows w/ engine heatmap cells) |
| **Inbox** | Full viewport | `grid-cols-[260px_1fr_300px]` | 300px evidence | px-4 py-3 per row | divide-y | 56px list row | 6+ (list rows visible) |
| **Workspace** | 1100px | `grid-cols-[1fr_280px]` gap-5 | 280px meta | p-5 | gap-4 | — | 8+ (content body + 4 meta fields + status) |
| **Automation** | 1100px | Full-width table rows | — | px-4 py-3 | divide-y | 56px | 8+ (8 agent rows with status, cadence, last-run, next-run, toggle) |
| **Settings** | 720px centered | Single col | — | p-6 section | gap-6 | — | 5 (form fields visible) |
| **Pricing (internal)** | 900px centered | `grid-cols-3` gap-4 | — | p-5 | gap-4 | — | 9+ (3 cards × ~3 key features visible) |
| **Agent detail** | 1100px | `grid-cols-[1fr_280px]` gap-5 | 280px aside | p-4 | gap-4 | — | 8+ (chat messages + run status + cost panel) |

**Sticky KPI strip (applies to Home, Scan detail, Competitors, Automation):**
A 48px-tall `sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border` row holding 4–6 numeric KPIs. Renders above the page main grid. Disappears on mobile (≤768px) and collapses into the card grid.

**Sidebar stays at 240px** expanded, 56px collapsed. No change from current.

---

## 2. Token Diff vs Current

### Current tokens (from PRODUCT_DESIGN_SYSTEM.md)
- `--card-radius: 20px`
- Card padding: `p-6` (24px)
- Section gap: `gap-8` (32px)
- Main content max-width: `max-w-7xl` (1280px)
- Card grid gap: `gap-8` (32px)
- Background: `#F7F7F7`
- Card surface: `#FFFFFF`

### Proposed additions / changes

| Token | Current | Proposed | Rationale |
|-------|---------|----------|-----------|
| `--card-radius` | 20px | **12px** | 20px is marketing radius. Product cards at high density should read as UI, not landing-page bubbles. Linear/Ramp/Stripe use 8–12px. |
| `--card-padding-dense` | (none) | **p-4** (16px) | New token for data-dense cards. Keep `p-6` only for settings forms and onboarding. |
| `--section-gap-dense` | (none) | **gap-4** (16px) | Dense page layout gap. Current `gap-8` leaves half-blank screen. |
| `--section-gap-default` | gap-8 | **gap-5** (20px) | Default gap for main content areas. |
| `--container-product` | max-w-7xl (1280px) | **max-w-[1200px]** | Tighter container keeps aside visible at 1280 viewport. |
| `--row-divide` | (none) | **divide-y divide-border** | Table rows use dividers, not individual card boxes. Reduces visual noise. |
| `--kpi-strip-height` | (none) | **h-12** (48px) | Sticky KPI strip height. |
| `--kpi-strip-bg` | (none) | **bg-background/95 backdrop-blur-sm** | Frosted strip on scroll. |
| `--mono-data` | (none) | **font-mono text-sm tabular-nums** | All numeric data in tables uses Geist Mono for alignment. Already in brand, not enforced in product. |
| `--aside-width` | (none) | **w-[280px] shrink-0** | Standardize aside width across all detail pages. |
| `--surface-inset` | (none) | **bg-muted/40** (≈ #F1F2F3) | Inset surfaces inside cards (e.g., code blocks, evidence panels). |

**Colors: no changes.** `#3370FF` accent, `#0A0A0A` text, `#F7F7F7` background all locked.

**Shadow policy update:** Dense UI cards use `shadow-none border border-border` only. Reserve `shadow-sm` for floating elements (modals, dropdowns). Remove card hover shadow — use `bg-muted/40` background change instead (cheaper GPU op).

---

## 3. Component Blueprints Per Page Type

### 3.1 Home

**Above-fold composition @ 1440px:**
```
┌─ sticky KPI strip: 48px ────────────────────────────────────────────────┐
│  [Score: 71 ▲+4]  [Citations: 23]  [Engine Coverage: 4/5]  [Rank: #2]  │
└─────────────────────────────────────────────────────────────────────────┘
┌─ main (flex-1) ──────────────────┐ ┌─ aside 300px ───────────────────┐
│  ScoreHero                       │ │  Inbox preview (3 rows)          │
│  [ring 96px] [sparkline 160px]   │ │  divide-y rows                   │
│  [engine breakdown 5 chips]      │ │  ─────────────────────────────── │
│                                  │ │  Automation status               │
│  KPI card row (4 cards × p-4)    │ │  Credits bar + next run          │
│                                  │ │                                   │
│  Suggestions (3 items, compact)  │ │  Activity feed                   │
│                                  │ │  (last 5 events, 36px rows)      │
└──────────────────────────────────┘ └─────────────────────────────────┘
```

**Components:**
- `KpiCardRow` (existing) — 4 cards, `p-4`, `rounded-xl`, `border border-border`, no shadow
- `ScoreHero` (existing) — reduce internal padding from `p-6` to `p-4`
- `SuggestionsFeed` (existing) — compact variant: 48px row height, `divide-y`
- `TrendChart` (existing) — keep, reduce height to 80px inside hero
- `ActivityFeed` (existing) — 36px rows, `divide-y`, no card wrapper
- `StickyKpiStrip` (new, simple) — `sticky top-0 z-10`, flex row of 4 `<StatCell>` components

**States:** loading (skeleton strip + skeleton grid), empty (NoScanYet centered), partial (score + no suggestions), full

**Density target:** 10 data points above fold, 4 KPI cards, 1 score ring, 5 engine chips, 3 suggestion rows

**Reference:** Wave 2 board memo — Design Lead cited "8+ data points per viewport target." Also: Ramp dashboard (sticky totals bar + feed layout). Research doc §Home: "KPI strip + activity feed + aside status panel."

---

### 3.2 Scans List

**Above-fold composition @ 1440px:**
```
┌─ page header: "Scans" + [Run new scan] button + date filter ───────────┐
┌─ scan history table ────────────────────────────────────────────────────┐
│ TODAY                                                                    │
│ ──────────────────────────────────────────────────────────────────────  │
│ [date] [score badge] [▲+4] [engine pips: ●●●○●] [3 queries matched]    │ 52px
│ [date] [score badge] [▼-2] [engine pips: ●●●●●] [5 queries matched]    │ 52px
│ YESTERDAY                                                                │
│ [date] [score badge] [▲+7] [engine pips: ●●●●○] [2 queries matched]    │ 52px
└─────────────────────────────────────────────────────────────────────────┘
```

**Components:**
- `ScanTimelineItem` (existing spec) — 52px row, `divide-y`, engine pips inline
- `ScoreBadge` (existing `ui/score-badge.tsx`)
- `TrendBadge` (existing `ui/trend-badge.tsx`)
- Date group header (`text-xs font-medium text-muted-foreground uppercase tracking-wide py-2`)
- No card wrappers — full-width table pattern, `divide-y divide-border`
- `Button` variant="default" size="sm" for "Run new scan" — top right

**States:** loading (5 skeleton rows), empty (`EmptyState page="scans"`), populated

**Density target:** 7 data points per row × 8 visible rows = 56 data points in viewport

**Reference:** Linear issue list (dense, grouped, 48px rows). Ahrefs Brand Radar scan history.

---

### 3.3 Scan Detail

**Above-fold composition @ 1440px:**
```
┌─ sticky KPI strip: [Score: 71] [Prev: 67] [Delta: +4] [Engines: 4/5] [Queries: 12] ──┐
┌─ main ────────────────────────────────────────────────────────┐ ┌─ aside 280px ──────┐
│  Engine breakdown: 5 cards in 2+3 grid                        │ │  Scan metadata     │
│  [ChatGPT ●] [Gemini ●] [Perplexity ●]  (row 1, 3 cols)      │ │  Date, duration    │
│  [Claude ●] [Grok ○]  (row 2, 2 cols)                        │ │  Business name     │
│                                                                │ │  ─────────────── │
│  QueryByQueryTable (5 visible rows, 44px each)                │ │  Download PDF btn  │
│  query | result | rank | sentiment                            │ │                    │
└────────────────────────────────────────────────────────────── ┘ └────────────────────┘
```

**Components:**
- `EngineResultCard` (existing spec) — `p-4 rounded-xl border border-border`, engine icon top-left, mention badge
- `StickyKpiStrip` (reuse from Home)
- `QueryByQueryTable` — new, Shadcn `Table` base, `text-sm`, `font-mono` for rank column
- Scan metadata aside — static `dl` list, `text-sm`, `divide-y`
- `Button` variant="outline" for PDF export

**States:** loading (skeleton grid + skeleton table), no engine data (fallback mock copy per engine), full

**Density target:** 5 engine cards + 5 query rows + 5 KPI strip = 15+ data points

---

### 3.4 Competitors

**Above-fold composition @ 1440px:**
```
┌─ sticky KPI strip: [Your SoV: 34%] [Leader: CompetitorA 41%] [Gap: -7pp] [Tracked: 3/3] ─┐
┌─ main ─────────────────────────────────────────────────────────┐ ┌─ aside 260px ──────────┐
│  SovTrendChart (12-week line, 160px tall)                      │ │  Strategy aside         │
│                                                                 │ │  "3 competitors above   │
│  Competitor table: 3 rows × engine heatmap cells               │ │  you on Perplexity"     │
│  [name] [SoV%] [ChatGPT●] [Gemini●] [Perplexity●] [trend↑]   │ │  ─────────────────────  │
│  44px rows, divide-y                                           │ │  Win/Loss summary       │
│                                                                 │ │  W:12 L:8 Tied:3       │
│  MissedQueriesList (top 5, compact chips)                      │ │                         │
└──────────────────────────────────────────────────────────────── ┘ └─────────────────────────┘
```

**Components:**
- `SovTrendChart` — Recharts `LineChart`, existing in wave 2 branches
- `EngineHeatmap` cells — SVG circle, existing
- `CompetitorTable` (existing) — reduce row padding to `py-3 px-4`
- `MissedQueriesList` (existing)
- Strategy aside — `text-sm` prose + `text-primary` CTA link, no card

**States:** loading, empty (`EmptyState page="competitors"`), partial (1-2 competitors), full (3)

**Density target:** 4 KPI strip + chart + 3 competitor rows × 5 engine cells = 19+ data points

---

### 3.5 Inbox

**Above-fold composition @ 1440px:**
```
┌─ list 260px ──────┐ ┌─ content preview flex-1 ──────────────┐ ┌─ evidence 300px ──┐
│ FilterRail (tabs)  │ │ PreviewPane                            │ │ EvidencePanel      │
│ All / Pending /    │ │ [agent badge] [title] [status]         │ │ Trigger source    │
│ Approved / Draft   │ │ ─────────────────────────────────────  │ │ Target queries    │
│ ──────────────────  │ │ Content body (scrollable)              │ │ Research sources  │
│ Item rows 56px     │ │                                        │ │ Impact estimate   │
│ [●] [icon] [title] │ │ [Approve] [Request edit] [Dismiss]     │ │ ───────────────── │
│ [status] [impact]  │ │                                        │ │ Keyboard hints    │
└────────────────────┘ └────────────────────────────────────────┘ └───────────────────┘
```

**Components:**
- `FilterRail` (existing) — tabs variant, `text-xs`
- `ItemList` / `InboxItemRow` (existing) — 56px rows, unread blue dot
- `PreviewPane` (existing) — action bar bottom-docked
- `EvidencePanel` (existing) — right pane, `text-sm`, `divide-y` sections
- Keyboard hint strip — `text-xs text-muted-foreground` — `j/k navigate · e edit · a approve · x dismiss`

**States:** loading, empty (`EmptyState page="inbox"`), single item selected, multi-select

**Density target:** 6 list rows visible + full content + 4 evidence fields = 10+ data points

---

### 3.6 Workspace

**Above-fold composition @ 1440px:**
```
┌─ breadcrumb: Inbox / [Job title] ──────────────────────────────────────────────────────┐
┌─ main flex-1 ──────────────────────────────────────────────────────┐ ┌─ aside 280px ──┐
│  Content editor (prose, min-h-[400px])                              │ │  Job metadata  │
│  [Agent type badge] [last edited: 2m ago]                           │ │  Agent: FAQ    │
│  ─────────────────────────────────────────────────────────────────  │ │  Status: Draft │
│  [Textarea or rendered markdown]                                    │ │  Created: Apr19│
│                                                                     │ │  ──────────── │
│  Diff view (when editing): old strikethrough / new green            │ │  [Approve]     │
│  [Accept] [Reject] action bar                                       │ │  [Request edit]│
└─────────────────────────────────────────────────────────────────── ┘ └────────────────┘
```

**Components:**
- `Textarea` (Shadcn) — unstyled inside content area, `font-sans text-sm leading-relaxed`
- Diff view — `<del>` `text-red-500 line-through` / `<ins>` `text-green-600 no-underline` — no extra library
- Aside `dl` list — `text-sm`, `divide-y divide-border`
- `Button` for approve/reject — use existing `Button variant="default"` + `variant="outline"`

**States:** loading, viewing (read-only), editing (diff visible), approved (read-only + green status)

---

### 3.7 Automation

**Above-fold composition @ 1440px:**
```
┌─ header: "Automation" + [Kill switch] + CreditBudgetBar ─────────────────────────────┐
│  Credits: 34/100 used  ████████░░░░░░░  Next reset: May 1                             │
┌─ agent schedules table ───────────────────────────────────────────────────────────────┐
│ Agent name         │ Status │ Cadence     │ Last run      │ Next run  │ Actions       │
│ ─────────────────── ─────── ────────────  ────────────── ──────────  ─────────────── │
│ Content Optimizer  │ ● Live │ Weekly ▾    │ 2d ago        │ In 5d     │ [toggle] [⋯]  │ 56px
│ FAQ Agent          │ ● Live │ Daily  ▾    │ 6h ago        │ In 18h    │ [toggle] [⋯]  │ 56px
│ Freshness Agent    │ ○ Off  │ Monthly ▾   │ Never         │ —         │ [toggle] [⋯]  │ 56px
│ [8 agents total]   │                                                                   │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

**Components:**
- `CreditBudgetBar` (existing spec) — render above table, not inside card
- `AutomationClient` table rows (existing) — reduce from card to `divide-y` table
- `Select` (Shadcn) for cadence inline
- `Switch` (Shadcn) for toggle — existing
- `DropdownMenu` for `⋯` actions — existing
- Sparkline per row (new, simple): 24×24px inline SVG path from last 4 runs — `path` only, no Recharts overhead

**States:** loading, empty (`EmptyState page="automation"`), some-off (mixed), all-paused (kill switch active)

**Density target:** 8 agent rows × 5 data points per row = 40 data points, credits bar above

---

### 3.8 Settings

**Above-fold composition @ 1440px:**
```
┌─ max-w-[720px] centered ───────────────────────────────────┐
│  Tabs: Business | Billing | Preferences | Integrations      │
│  ─────────────────────────────────────────────────────────  │
│  [Form: Business profile]                                   │
│  Business name ___________________________________________  │
│  Website URL  ___________________________________________   │
│  Industry     [Select ▾]                                   │
│  Description  [Textarea]                                   │
│                                                             │
│  [Save changes]                                             │
└─────────────────────────────────────────────────────────────┘
```

**Components:**
- `SettingsClient` (existing) — container stays `max-w-[720px]`
- `Tabs` (Shadcn) — `variant="underline"` existing
- `SettingsField` (existing) — label above, helper below
- `Button` variant="default" for save

**States:** loading (skeleton form), saved (toast), error (inline field error)

**Density target:** Settings is low-density by design. This is correct. Do not force data.

---

## 4. Critical Patterns Beamix Is Missing

| # | Pattern | Page(s) it goes on | Why |
|---|---------|-------------------|-----|
| 1 | **Sticky KPI strip** | Home, Scan detail, Competitors, Automation | Linear/Ramp pattern: 4–5 headline numbers locked to top, always visible on scroll. Currently zero pages have this. |
| 2 | **Sparkline inline in table row** | Automation, Scans list | One 24×24px SVG trend line per row. Used by Stripe, Ramp, PostHog. Communicates trajectory without a modal. Current rows: no trend at all. |
| 3 | **Consequence-framed empty states** | All pages | "Nothing to review" is neutral. "Your agents haven't surfaced anything — they run nightly" is actionable. Linear / Notion empty states always explain the system, not just absence. |
| 4 | **Inset engine heatmap chips** | Competitors, Scan detail | Small 12×12px filled/empty circles per engine inline in every data row. Otterly and Profound both do this. Instantly shows cross-engine coverage without drilling. |
| 5 | **Evidence aside panel** | Inbox, Workspace | Cursor/Linear sidebar showing "why this action was suggested." Source query, competitive gap, research citation. Builds trust with the suggestion. Currently not rendered. |
| 6 | **Activity feed in home aside** | Home | Ramp + Linear: right rail shows "Agent ran · 3 suggestions queued · Score ▲2." Makes dashboard feel alive. Current home aside is static inbox preview + credits only. |
| 7 | **Keyboard shortcut strip** | Inbox | Superhuman bottom bar: `j/k navigate · e edit · a approve · x dismiss`. One line, `text-xs text-muted-foreground`. Zero implementation cost, dramatically signals quality. |
| 8 | **Consequence-framed delta copy** | Home KPI strip, Scan detail | "Rank #2 — 3 competitors above you on Perplexity" instead of "Score: 71/100 (Good)". Every KPI pairs a number with its competitive implication. |
| 9 | **Inline cadence selector in table row** | Automation | Zapier/Make pattern: cadence is a `<Select>` right in the row, not behind a modal. Reduces clicks from 3 to 1. |
| 10 | **Roadmap/pipeline column in home** | Home | Workspace tab on Home: Completed / In Progress / Up Next. Ramp shows "pipeline health." Wave 2 added this but it's mock. Needs real data from `agent_jobs + content_items`. |

---

## 5. Anti-Patterns Beamix MUST Kill

| # | Anti-pattern | File path | Reason |
|---|-------------|-----------|--------|
| 1 | **`max-w-4xl` on Home** | `apps/web/src/components/home/HomeClient.tsx:83` | 896px container on a 1440px screen = ~280px white margins each side. Half-blank. Change to `max-w-[1200px]` with main+aside grid. |
| 2 | **`max-w-5xl` on Competitors** | `apps/web/src/components/competitors/CompetitorsClient.tsx:37` | 1024px container wastes 200px. Same fix. |
| 3 | **`gap-8` section spacing throughout Home** | `apps/web/src/components/home/HomeClient.tsx:85` | 32px gaps between every section makes the page feel half-empty. Reduce to `gap-5`. |
| 4 | **Card `rounded-[20px]`** | `apps/web/src/app/globals.css` (--card-radius) | 20px card radius is landing-page aesthetic. Dashboard cards at density 8 should use 12px. Looks consumer-app, not enterprise SaaS. |
| 5 | **Card `p-6` (24px) inside dense tables** | `apps/web/src/components/home/HomeClient.tsx:119,146` | Cards with `p-5`/`p-6` contain 2-3 lines of content — 80% of the card is whitespace. Change to `p-4` for data cards. |
| 6 | **Standalone card box per inbox item** | `apps/web/src/components/inbox/ItemList.tsx` | Inbox items should be `divide-y` rows, not individually boxed cards. Shadcn Card per row = AI slop hallmark. |
| 7 | **`text-gray-400` for empty states** | `apps/web/src/components/home/HomeClient.tsx:136` | "Nothing waiting for review." in muted text is consequence-free. Replace with actionable framing. |
| 8 | **No `font-mono tabular-nums` on numeric data** | All table components | Score numbers, rank numbers, percentages in proportional Inter = columns don't align. Every number in a table must be `font-mono tabular-nums`. |
| 9 | **Section gap `gap-8` between `<motion.section>` blocks** | `apps/web/src/components/home/HomeClient.tsx:84–112` | 32px gaps stack to 96px+ of empty vertical space. Combined with `max-w-4xl`, the page feels like a blog post. |
| 10 | **`min-h-[400px]` centered empty on Home** | `apps/web/src/components/home/HomeClient.tsx:57` | Full-height centered empty is 2020 SaaS. Replace with the main+aside layout that renders with 0-state content (setup checklist, onboarding steps, first-scan CTA) in the left column and a populated aside. |

---

## 6. Implementation Priority Order

Wave 3 workers should implement in this order (highest density gain first):

1. **Container + grid fix** — Home `max-w-4xl` → main+aside grid. Single-file change, maximum visual impact.
2. **Sticky KPI strip component** — 80 lines, reusable across 4 pages.
3. **Token patch** — `card-radius: 20px → 12px`, section `gap-8 → gap-5`, card `p-6 → p-4`.
4. **Scans list density** — `divide-y` table rows, engine pips, mono numbers.
5. **Automation density** — full-width table, inline cadence select, sparklines.
6. **Consequence copy pass** — swap all neutral labels for outcome-framed strings.
7. **Competitors container fix** — `max-w-5xl → max-w-[1100px]` + aside grid.
8. **Inbox keyboard strip** — 4-line addition to `InboxClient.tsx`.

---

*Cross-reference: patterns 1, 2, 4, 6, 8 above correspond to Research findings in Wave 2 board memo (Design Lead + Research Lead memos, 2026-04-19). Pattern 10 directly implements the "Workspace as Roadmap" spec from the Product Lead RICE table (RICE 113, Workspace/Roadmap tab).*
