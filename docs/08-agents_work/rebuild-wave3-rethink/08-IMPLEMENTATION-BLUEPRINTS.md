# Wave 3 Implementation Blueprints
*Design Lead · 2026-04-20 · Round 2 — grounded in reference DESIGN.md measurements*
*Merges 02-VISUAL-DIRECTION.md (grid math) + 07-DESIGN-VARIANTS.md (direction choices)*

Direction per page: **Direction A (Monochrome Command)** for 7 pages, **Direction C (Warm Document)** for Workspace, **Direction A + blue credit bar** for Automation. This is final — not up for renegotiation per Round 1 recommendation.

---

## 1. Token Layer — `apps/web/src/app/globals.css`

Paste the entire `@layer base { :root { ... } }` block below, replacing the existing tokens.

Sources cited per token: `[V]` = Vercel DESIGN.md · `[L]` = Linear DESIGN.md · `[N]` = Notion DESIGN.md · `[S]` = Stripe DESIGN.md

```css
@layer base {
  :root {
    /* ─── Color: Core ─────────────────────────────────────────── */
    /* Beamix brand lock — never replace */
    --color-accent:       #3370FF;           /* primary interactive, CTAs, active nav */
    --color-accent-hover: #2558E8;           /* darken 8% on hover */
    --color-accent-muted: rgba(51,112,255,0.08); /* tint surface for active states */

    /* Text scale — sourced from [V] "near-black" principle */
    --color-text-primary:  #0A0A0A;          /* headings, body */
    --color-text-secondary:#6B7280;          /* captions, muted labels */
    --color-text-tertiary: #9CA3AF;          /* timestamps, placeholder */
    --color-text-disabled: #D1D5DB;          /* disabled inputs */
    --color-text-inverse:  #FFFFFF;          /* text on accent/dark bg */

    /* Backgrounds */
    --color-bg:            #FFFFFF;          /* page canvas */
    --color-bg-subtle:     #F7F7F7;          /* sidebar, section alt [V] #fafafa equiv */
    --color-bg-inset:      #F3F4F6;          /* code blocks, evidence panels */
    --color-bg-hover:      rgba(0,0,0,0.03); /* row hover, [L] luminance-step model */
    --color-bg-active:     rgba(51,112,255,0.06); /* selected row */

    /* Borders — shadow-as-border from [V] §2 "Shadows & Depth" */
    --color-border:        rgba(0,0,0,0.08); /* standard card/row border value */
    --color-border-solid:  #E5E7EB;          /* brand locked: Card Border token */
    --color-border-strong: rgba(0,0,0,0.15); /* active/hover border */
    --color-border-focus:  #3370FF;          /* focus ring (matches accent) */

    /* Semantic — Score colors (data viz only — never buttons) */
    --color-score-excellent: #06B6D4;        /* 75–100 */
    --color-score-good:      #10B981;        /* 50–74 */
    --color-score-fair:      #F59E0B;        /* 25–49 */
    --color-score-critical:  #EF4444;        /* 0–24 */

    /* State: success / warning / error */
    --color-success:  #10B981;
    --color-warning:  #F59E0B;
    --color-error:    #EF4444;
    --color-info:     #3370FF;

    /* ─── Shadows — [V] shadow-as-border philosophy ───────────── */
    /* Level 1: shadow replaces CSS border on cards/inputs */
    --shadow-border:   rgba(0,0,0,0.08) 0px 0px 0px 1px;
    /* Level 2: card with minimal lift [V] "Subtle Card" */
    --shadow-card:     rgba(0,0,0,0.08) 0px 0px 0px 1px,
                       rgba(0,0,0,0.04) 0px 2px 2px;
    /* Level 3: full card with inner glow [V] "Full Card" — modals only */
    --shadow-card-full:rgba(0,0,0,0.08) 0px 0px 0px 1px,
                       rgba(0,0,0,0.04) 0px 2px 2px,
                       rgba(0,0,0,0.04) 0px 8px 8px -8px,
                       #fafafa 0px 0px 0px 1px;
    /* Level 4: floating elements (dropdowns, tooltips) */
    --shadow-float:    rgba(0,0,0,0.12) 0px 8px 24px,
                       rgba(0,0,0,0.06) 0px 2px 6px;
    /* Accessibility: focus ring */
    --shadow-focus:    0 0 0 2px #FFFFFF, 0 0 0 4px #3370FF;

    /* ─── Typography ──────────────────────────────────────────── */
    /* Beamix brand fonts — locked */
    --font-sans:       'Inter', system-ui, sans-serif;
    --font-display:    'InterDisplay', 'Inter', system-ui, sans-serif;
    --font-serif:      'Fraunces', 'Georgia', serif;    /* Workspace only */
    --font-mono:       'Geist Mono', 'Menlo', monospace;

    /* Size scale — [V] §3 table as reference, adapted to Beamix Inter */
    --text-display:    clamp(28px, 2.5vw, 32px); /* page H1 */
    --text-section:    20px;                       /* section headings */
    --text-card-title: 15px;                       /* card/table section labels */
    --text-body:       14px;                       /* primary reading text */
    --text-button:     13px;                       /* buttons, nav */
    --text-caption:    12px;                       /* metadata, timestamps */
    --text-mono-data:  13px;                       /* Geist Mono numbers in tables */
    --text-micro:      11px;                       /* uppercase labels, hints */

    /* Weight scale — [V] "three weights, strict roles" */
    --weight-regular:  400;    /* body, data */
    --weight-medium:   500;    /* section labels, interactive */
    --weight-semibold: 600;    /* page headings only */

    /* Letter spacing — [V] "Compression as identity" adapted for Inter */
    --tracking-display: -0.5px;   /* H1 page titles */
    --tracking-section: -0.25px;  /* section headings */
    --tracking-label:   0.04em;   /* uppercase micro labels (positive, [L] §3) */
    --tracking-mono:    0;        /* Geist Mono — never space tabular numbers */

    /* Line height */
    --leading-tight:   1.2;   /* display/section headings */
    --leading-normal:  1.5;   /* body copy */
    --leading-relaxed: 1.6;   /* Workspace/Fraunces prose */
    --leading-mono:    1.4;   /* mono data rows */

    /* ─── Spacing — 8px base, [V] §5 scale ───────────────────── */
    --space-1:   4px;
    --space-2:   8px;
    --space-3:   12px;
    --space-4:   16px;
    --space-5:   20px;
    --space-6:   24px;
    --space-8:   32px;
    --space-10:  40px;
    --space-12:  48px;
    --space-16:  64px;

    /* ─── Border Radius — [V] §5 scale ────────────────────────── */
    --radius-micro:   2px;    /* inline code, tiny badges */
    --radius-sm:      4px;    /* score/trend badges */
    --radius-md:      6px;    /* buttons (product utility) */
    --radius-lg:      8px;    /* cards, table sections [V] "Comfortable" */
    --radius-xl:      12px;   /* modals, evidence panels */
    --radius-pill:    9999px; /* status pills, filter chips */

    /* ─── Layout constants ────────────────────────────────────── */
    --container-product:  1200px;   /* max-width, replaces max-w-7xl */
    --container-settings: 720px;    /* settings/forms */
    --container-workspace: 840px;   /* Workspace editor column */
    --aside-width:        280px;    /* all detail pages */
    --aside-width-home:   300px;    /* home/automation wider */
    --sidebar-expanded:   240px;    /* left nav */
    --sidebar-collapsed:  56px;
    --kpi-strip-height:   48px;     /* sticky data bar */

    /* ─── Z-index scale ──────────────────────────────────────── */
    --z-base:      0;
    --z-sticky:    10;   /* KPI strip */
    --z-sidebar:   20;   /* left nav */
    --z-dropdown:  30;   /* menus, tooltips */
    --z-modal:     40;   /* dialogs */
    --z-toast:     50;   /* notifications */
  }
}

/* OpenType features on all Inter text — [L] principle "cv01, ss03 as identity" */
/* Beamix equivalent: cv01 (alternate a), kern, liga */
* { font-feature-settings: "kern" 1, "liga" 1; }
code, pre, [class*="font-mono"] {
  font-feature-settings: "kern" 0, "liga" 0, "tnum" 1;
}
```

**Token count: 47 CSS custom properties across 7 groups.**

---

## 2. Component Specs

### Button

**Props:**
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}
```

| Variant | Classes | Hover | Focus |
|---------|---------|-------|-------|
| primary | `bg-[#3370FF] text-white text-[13px] font-medium rounded-md px-3 py-1.5` | `hover:bg-[#2558E8]` | `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2` |
| secondary | `bg-transparent text-[#0A0A0A] text-[13px] font-medium rounded-md px-3 py-1.5 shadow-[rgba(0,0,0,0.08)_0px_0px_0px_1px]` | `hover:bg-[#F7F7F7]` | same ring |
| ghost | `bg-transparent text-[#6B7280] text-[13px] font-medium rounded-md px-3 py-1.5` | `hover:text-[#0A0A0A] hover:bg-[rgba(0,0,0,0.03)]` | same ring |
| destructive | `bg-[#EF4444] text-white text-[13px] font-medium rounded-md px-3 py-1.5` | `hover:bg-[#DC2626]` | ring in red |

Size modifiers: `sm` = `px-2 py-1 text-[12px]` · `lg` = `px-4 py-2 text-[14px]`
Loading state: replace children with `<Spinner className="size-3.5 animate-spin" />`, `pointer-events-none opacity-70`
Source: [V] §4 buttons, radius 6px, padding philosophy

---

### Card

**Default variant (data card):**
```
bg-white rounded-lg shadow-[rgba(0,0,0,0.08)_0px_0px_0px_1px] p-4
```
No `border` CSS property — shadow IS the border per [V] philosophy.

```typescript
interface CardProps {
  variant: 'default' | 'inset' | 'flat';
  padding?: 'dense' | 'default' | 'form';  // p-4 | p-4 | p-6
}
```

| Variant | Classes |
|---------|---------|
| default | `bg-white rounded-lg shadow-[rgba(0,0,0,0.08)_0px_0px_0px_1px] p-4` |
| inset | `bg-[#F3F4F6] rounded-lg p-3` (evidence panels, code blocks) |
| flat | `bg-transparent p-4` (table sections — no visual card) |

Hover: `hover:shadow-[rgba(0,0,0,0.08)_0px_0px_0px_1px,rgba(0,0,0,0.04)_0px_2px_2px]`

---

### Table / DividerRow

The fundamental pattern for Direction A. All list views use this.

```
<div className="divide-y divide-[#E5E7EB]">
  <div className="flex items-center gap-3 px-4 py-3 hover:bg-[rgba(0,0,0,0.02)] cursor-pointer">
    {/* row content */}
  </div>
</div>
```

Row height: `py-3` = 48px effective with 14px text. Dense rows: `py-2` = 40px.
Section date headers: `text-[11px] font-medium text-[#6B7280] uppercase tracking-[0.04em] px-4 py-2`

---

### Badge

```typescript
type BadgeVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'error';
interface BadgeProps { variant: BadgeVariant; children: React.ReactNode; }
```

| Variant | Classes |
|---------|---------|
| neutral | `inline-flex items-center rounded-sm bg-[#F3F4F6] text-[#6B7280] text-[11px] font-medium px-1.5 py-0.5` |
| primary | `... bg-[rgba(51,112,255,0.1)] text-[#3370FF]` |
| success | `... bg-[rgba(16,185,129,0.1)] text-[#059669]` |
| warning | `... bg-[rgba(245,158,11,0.1)] text-[#D97706]` |
| error | `... bg-[rgba(239,68,68,0.1)] text-[#DC2626]` |

Radius `rounded-sm` (4px) per [V] "Micro (4px)" for small badges. Pills use `rounded-full`.

---

### ScoreBadge

Existing component — spec alignment:

```typescript
interface ScoreBadgeProps { score: number; size?: 'sm' | 'md'; }
```

Score → color map uses brand tokens: `≥75` → `bg-[rgba(6,182,212,0.1)] text-[#0891B2]` · `50-74` → good · `25-49` → warning · `<25` → error.
Font: `font-mono tabular-nums text-[13px] font-medium`
Source: Brand Guidelines §2 Score Colors

---

### TrendBadge

```typescript
interface TrendBadgeProps { delta: number; unit?: 'pts' | 'pp' | '%'; }
```

Classes: `inline-flex items-center gap-0.5 text-[12px] font-mono tabular-nums`
Positive: `text-[#059669]` + `↑` arrow · Negative: `text-[#DC2626]` + `↓` · Zero: `text-[#6B7280]`
Never use colored backgrounds — text-only per Direction A.

---

### KpiCard

```typescript
interface KpiCardProps {
  label: string;      // UPPERCASE micro label
  value: string;      // Geist Mono number
  delta?: number;     // optional trend
  consequence?: string; // "3 competitors above you on Perplexity"
}
```

```
<div className="flex flex-col gap-0.5">
  <span className="text-[11px] font-medium text-[#6B7280] uppercase tracking-[0.04em]">{label}</span>
  <span className="font-mono text-[22px] font-semibold tabular-nums text-[#0A0A0A]">{value}</span>
  {delta !== undefined && <TrendBadge delta={delta} />}
  {consequence && <span className="text-[11px] text-[#6B7280] leading-tight mt-0.5">{consequence}</span>}
</div>
```

Source: [V] §4 "Metric Cards" — large tabular number, description below.

---

### StickyKpiStrip

```typescript
interface StickyKpiStripProps {
  items: Array<{ label: string; value: string; delta?: number; consequence?: string }>;
}
```

```
<div className="sticky top-0 z-10 h-12 bg-white/95 backdrop-blur-sm
                border-b border-[#E5E7EB] flex items-center px-6 gap-8">
  {items.map(item => <KpiCard key={item.label} {...item} />)}
</div>
```

Dividers between cells: `divide-x divide-[#E5E7EB]` with `px-8` per cell.
Max 5 cells. On `≤768px`: collapse to 2 cells (score + rank), hide strip at `sm:hidden`.

---

### EngineHeatmap

Inline cells used in Competitors table and Scans list row.

```typescript
interface EngineHeatmapProps {
  engines: Array<{ name: string; status: 'cited' | 'mentioned' | 'absent' }>;
  size?: 'sm' | 'md';  // 10px | 12px dot
}
```

```
<div className="flex items-center gap-1">
  {engines.map(e => (
    <span key={e.name} title={e.name}
      className={cn("inline-block rounded-full",
        size === 'sm' ? "size-2.5" : "size-3",
        e.status === 'cited' ? "bg-[#3370FF]"
        : e.status === 'mentioned' ? "bg-[#10B981]"
        : "bg-[#E5E7EB]"
      )} />
  ))}
</div>
```

Colors: cited=accent blue · mentioned=success green · absent=border gray
No text label in-row — tooltip on hover shows engine name.

---

### Sparkline

24×24px SVG inline trend. Used in Automation rows and Scans list.

```typescript
interface SparklineProps {
  data: number[];   // 4–6 values
  color?: string;   // default #3370FF
  width?: number;   // default 48
  height?: number;  // default 20
}
```

Implementation: Pure SVG `<polyline>` from min-max normalized `data`. No Recharts. `stroke-width=1.5 fill=none`. Background: transparent. Source: [V] §4 "Metric Cards" inline trend pattern.

---

### DividerRow (date group header)

```
<div className="flex items-center gap-3 px-4 py-2">
  <span className="text-[11px] font-medium text-[#6B7280] uppercase tracking-[0.04em]">
    {label}
  </span>
  <div className="flex-1 h-px bg-[#E5E7EB]" />
</div>
```

---

### EvidencePanel

Right pane in Inbox. `min-w-[280px] max-w-[300px] border-l border-[#E5E7EB] p-4 flex flex-col gap-4`

Sections (each `<dl>` with `divide-y divide-[#E5E7EB]`):
- Trigger query (source + query text)
- Target engines (EngineHeatmap)
- Impact estimate (`+8 pts` in TrendBadge)
- Research citations (max 3 links, `text-[12px] text-[#3370FF]`)

Section labels: `text-[11px] uppercase tracking-[0.04em] text-[#6B7280] mb-1`

---

### EmptyState

```typescript
interface EmptyStateProps {
  page: 'home' | 'inbox' | 'scans' | 'competitors' | 'automation' | 'workspace';
  action?: { label: string; href: string };
}
```

Pattern (Direction A): centered in content area, no full-height centering.
```
<div className="flex flex-col items-center gap-3 py-16 text-center">
  <p className="text-[14px] text-[#0A0A0A] font-medium">{headline}</p>
  <p className="text-[13px] text-[#6B7280] max-w-[280px]">{consequence}</p>
  {action && <Button variant="secondary" size="sm">{action.label}</Button>}
</div>
```

Consequence copy template: `"[system explanation] — [what will happen next]"`
Example: "Your agents haven't surfaced anything yet — they run every night and will queue items here."

---

### InboxItemRow

```typescript
interface InboxItemRowProps {
  item: { id: string; title: string; agentType: string; status: 'pending'|'approved'|'dismissed'; impact: number; createdAt: string; unread: boolean; };
  selected: boolean;
  onSelect: () => void;
}
```

```
<div onClick={onSelect}
  className={cn(
    "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors",
    "hover:bg-[rgba(0,0,0,0.02)]",
    selected && "bg-[rgba(51,112,255,0.06)] border-l-2 border-[#3370FF]",
    !selected && "border-l-2 border-transparent"
  )}>
  {/* unread dot */}
  <span className={cn("mt-1.5 size-1.5 rounded-full shrink-0",
    item.unread ? "bg-[#3370FF]" : "bg-transparent")} />
  <div className="flex-1 min-w-0">
    <p className="text-[13px] font-medium text-[#0A0A0A] truncate">{item.title}</p>
    <p className="text-[11px] text-[#6B7280] mt-0.5">{item.agentType} · {item.createdAt}</p>
  </div>
  <span className="text-[12px] font-mono text-[#10B981] shrink-0">+{item.impact} pts</span>
</div>
```

Row height: 56px. Keyboard: `j/k` navigation, `a` approve, `e` edit, `x` dismiss — handled in parent via `keydown` listener.

---

### WorkspaceEditor

Direction C applies here only.

```typescript
interface WorkspaceEditorProps {
  content: string;
  onChange: (v: string) => void;
  mode: 'view' | 'edit' | 'diff';
  agentType: string;
  lastEdited: string;
}
```

View mode: render as `<article>` with `font-[Fraunces] text-[16px] font-light leading-relaxed max-w-[840px]`
Edit mode: `<textarea className="w-full min-h-[400px] font-sans text-[14px] leading-relaxed resize-none outline-none p-0 bg-transparent">`
Diff mode: `<del>` with `line-through text-[#DC2626] opacity-60` · `<ins>` with `no-underline text-[#059669]`

Source: [N] §4 "Inputs & Forms" clean textarea pattern · Fraunces 300 for agent output per 07-DESIGN-VARIANTS.md §Workspace.

---

### Composer / AgentChat

```typescript
interface ComposerProps {
  messages: Array<{ role: 'user'|'agent'; content: string; timestamp: string }>;
  onSend: (message: string) => void;
  streaming?: boolean;
}
```

Message bubble: agent = `bg-[#F3F4F6] rounded-lg p-3` · user = `bg-[rgba(51,112,255,0.08)] rounded-lg p-3`
Input bar: `border-t border-[#E5E7EB] p-3 sticky bottom-0 bg-white`
Textarea: single-line that grows to multi-line, `text-[14px]`, `Enter` to send, `Shift+Enter` newline.

---

## 3. Per-Page Recipe

### HOME (Direction A)

```
Container: max-w-[1200px] mx-auto px-6
Shell:
  <StickyKpiStrip items={[score, citations, coverage, rank]} />
  <div className="grid grid-cols-[1fr_300px] gap-5 mt-5">
    <main>{/* ScoreHero, EngineBreakdown, Suggestions */}</main>
    <aside>{/* InboxPreview, AutomationStatus, ActivityFeed */}</aside>
  </div>
```

**Component stack (ordered):**
1. `StickyKpiStrip` — [GEO Score | Citations | Coverage | Rank], consequence copy on each
2. `ScoreHero` (main) — score number in `font-mono text-[64px] font-semibold tabular-nums`, delta below in `TrendBadge`, `text-[11px] text-[#6B7280]` label above: "GEO SCORE · {date}"
3. `EngineBreakdownList` — 5 rows, `divide-y`, engine name left + `#N` rank right in `font-mono`
4. `SuggestionsFeed` — 3 items `divide-y`, title + `+N pts` right-aligned in `font-mono text-[#3370FF]`
5. `InboxPreviewWidget` (aside) — section label + 3 `InboxItemRow` compact, link to `/inbox`
6. `AutomationStatusWidget` (aside) — `3/11 running` + `34/100 runs · resets May 1` in plain text, no bar
7. `ActivityFeed` (aside) — 5 events, `divide-y`, 36px rows, mono timestamps

**Tokens used:** `--container-product`, `--aside-width-home`, `--kpi-strip-height`, `--text-mono-data`, `--space-5`

**Data bindings:** `dashboard_summary` RPC → score, delta, citations, coverage, rank. `content_items WHERE status='pending' LIMIT 3` → suggestions. `agent_jobs ORDER BY created_at DESC LIMIT 5` → activity.

---

### INBOX (Direction A — Superhuman layout)

```
Container: full viewport height, overflow hidden
Shell:
  <div className="flex h-[calc(100vh-var(--sidebar-expanded))] overflow-hidden">
    <ListPane className="w-[260px] border-r border-[#E5E7EB] flex flex-col" />
    <PreviewPane className="flex-1 flex flex-col overflow-hidden" />
    <EvidencePanel className="w-[300px] border-l border-[#E5E7EB]" />
  </div>
```

**Component stack:**
1. `FilterRail` (list pane top) — `All | Pending | Approved | Dismissed` tabs, `text-[12px]`, underline active
2. `InboxItemRow` × N — `divide-y`, 56px rows, left `border-l-2` unread indicator
3. `PreviewPane` — agent badge + title + status chip, scrollable content body, bottom-docked action bar
4. `EvidencePanel` — trigger query, engine heatmap, impact estimate, citations
5. Keyboard strip — `text-[11px] text-[#9CA3AF] font-mono px-4 py-2 border-t border-[#E5E7EB]` — `j/k · e · a · x`

**Empty state:** ListPane shows `EmptyState page="inbox"` centered in the pane area.

---

### WORKSPACE (Direction C — Warm Document)

```
Container: max-w-[1200px] mx-auto px-6
Shell:
  <div className="grid grid-cols-[1fr_280px] gap-5">
    <main className="max-w-[840px]">{/* editor */}</main>
    <aside>{/* metadata, actions */}</aside>
  </div>
```

**Component stack:**
1. Breadcrumb — `Inbox / {jobTitle}` — `text-[12px] text-[#6B7280]` with `/` separator
2. Agent type badge — `Badge variant="primary"` — appears above editor
3. `WorkspaceEditor` — Fraunces 300 16px in view/diff mode, Inter 14px in edit mode
4. Action bar — `[Approve] [Request Edit]` — bottom of editor, `border-t border-[#E5E7EB] pt-4`
5. Aside `<dl>` — Agent, Status, Created, Word count — `divide-y divide-[#E5E7EB] text-[13px]`
6. Aside actions — `Button variant="primary"` Approve + `Button variant="ghost"` Request Edit

**Fraunces application:** `font-serif text-[16px] font-light leading-relaxed text-[#0A0A0A]` — applied to `<article>` wrapper only in view mode. This is the only location in the product where Fraunces renders.

---

### SCANS LIST (Direction A)

```
Container: max-w-[1100px] mx-auto px-6
Shell: full-width table — no aside
```

**Component stack:**
1. Page header — `text-[20px] font-display font-semibold tracking-[-0.5px]` + `Button variant="primary"` "Run scan" right-aligned
2. Date `DividerRow` (TODAY, YESTERDAY, etc.)
3. `ScanTimelineItem` rows — `divide-y`, 52px, columns:
   - date `text-[12px] text-[#6B7280] font-mono w-[100px]`
   - `ScoreBadge` score
   - `TrendBadge` delta
   - `EngineHeatmap` 5 dots
   - query count `text-[13px] text-[#0A0A0A] font-mono`
   - chevron right `text-[#D1D5DB]`

**Hover:** `hover:bg-[rgba(0,0,0,0.02)]` on row. Cursor: pointer. Click → `/scans/[id]`

---

### SCANS DRILLDOWN (Direction A)

```
Container: max-w-[1100px] mx-auto px-6
Shell: StickyKpiStrip + grid-cols-[1fr_280px] gap-5
```

**Component stack:**
1. `StickyKpiStrip` — [Score | Prev | Delta | Engines | Queries]
2. `EngineBreakdownTable` (main) — single `divide-y` table, columns: Engine | Rank | Cited | Mentioned | Sentiment
   - All values in `font-mono tabular-nums text-[13px]`
   - Rank rendered as `#N` · Cited/Mentioned as `●` / `○` glyphs (screen-reader: `aria-label`)
   - Sentiment as `Badge` tiny
3. `QueryByQueryTable` — `Table` (Shadcn), query text `max-w-[40ch] truncate`, rank `font-mono`, sentiment `Badge`
4. Aside `<dl>` — scan metadata (date, duration, business, queries run)
5. `Button variant="outline"` Export PDF

---

### COMPETITORS (Direction A)

```
Container: max-w-[1100px] mx-auto px-6
Shell: StickyKpiStrip + grid-cols-[1fr_260px] gap-5
```

**Component stack:**
1. `StickyKpiStrip` — [Your SoV% | Market Leader | Gap | Engines Tracked]
2. `SovTrendChart` — Recharts `LineChart` 160px tall, `#3370FF` your line, `#E5E7EB` competitor lines, no fill areas, no axis labels except Y numbers in `font-mono text-[11px]`
3. `CompetitorTable` — `divide-y`, 44px rows, columns: Name | SoV% | `EngineHeatmap` | Trend
   - Your brand row: `font-medium` weight — NO color highlight, position signals it
4. `MissedQueriesList` — max 5 pills `Badge variant="neutral"` compact
5. Aside prose — `text-[13px] text-[#6B7280] leading-relaxed` + `text-[#3370FF] text-[12px]` CTA link

---

### AUTOMATION (Direction A + blue credits bar)

```
Container: max-w-[1100px] mx-auto px-6
Shell: header section + full-width table
```

**Component stack:**
1. Page header row — "Automation" title + `Switch` kill switch ("Emergency Stop" label) right-aligned
2. `CreditBudgetBar` — full-width `bg-[#F3F4F6] rounded-lg p-4` containing:
   - `text-[12px] text-[#6B7280] uppercase tracking-[0.04em]` label: "AGENT RUNS THIS MONTH"
   - Progress bar: `h-1.5 bg-[#E5E7EB] rounded-full` track · `bg-[#3370FF] h-full rounded-full` fill · width = `${(used/total)*100}%`
   - `font-mono text-[13px]` value: `34/100 · resets May 1`
3. Agent table — `divide-y`, 56px rows, columns: Name | Status dot | Cadence `Select` | Last run | Next run | `Switch` | `DropdownMenu`
   - Status dot: `size-2 rounded-full` — `bg-[#10B981]` live · `bg-[#E5E7EB]` off
   - Last run: `font-mono text-[12px] text-[#6B7280]`
   - Sparkline: 48×20px SVG inline in row

Note: Blue fill progress bar is the **only** Direction B element. Everything else stays Direction A.

---

### SETTINGS (Direction A)

```
Container: max-w-[720px] mx-auto px-6
Shell: single column, Tabs at top
```

**Component stack:**
1. `Tabs` (Shadcn underline variant) — Business | Billing | Preferences | Integrations
2. Tab content: `<section className="pt-6 flex flex-col gap-5">`
3. Form fields — label above, input, helper text below
4. `Button variant="primary"` save — right-aligned in form footer

No sticky strip. No aside. Density: low by design.

---

## 4. Dark Mode Proposal

**Recommendation: (C) Skip dark mode for Wave 3.**

Rationale:
- Direction A is philosophically light-mode-native: `#0A0A0A` on `#FFFFFF` is a statement, not a limitation. Dark mode would require a full second token set and 100+ component overrides.
- The brand is light-mode-first (Brand Guidelines v4.0 — no dark palette defined).
- Beamix's primary user (Israeli SMB owner) is in a dashboard during business hours, not late-night terminal mode. The "cockpit in daylight" metaphor is correct.
- Wave 3 objective is density and signal quality, not theme coverage. Dark mode is Wave 5+ work.

If dark mode is added later, the shadow-as-border pattern from [V] collapses gracefully into `rgba(255,255,255,0.08)` borders per [L] §2 — the architecture supports it without rework.

---

## 5. Hebrew / RTL Notes

All layout decisions with RTL impact. Implement when Hebrew UI is activated (Wave 4+).

| Pattern | LTR | RTL fix |
|---------|-----|---------|
| `border-l-2` unread indicator (InboxItemRow) | left blue border | `border-s-2` (logical) |
| `pl-4` / `pr-4` side padding | directional | `ps-4` / `pe-4` |
| `flex-row` action bars | left→right | `flex-row-reverse` not needed — use `ms-auto` for right-push |
| `text-left` table cells | left-align | `text-start` |
| KPI strip `gap-8` left-to-right | — | unchanged — flex direction flips automatically with `dir="rtl"` |
| Aside position (right side) | `grid-cols-[1fr_280px]` | Swap to `grid-cols-[280px_1fr]` in RTL context using `[dir=rtl]` selector |
| Chevron direction in scan rows | `→` | `←` — use `rotate-180` in RTL |
| `tracking-[0.04em]` on uppercase | — | Hebrew uppercase labels don't exist — remove tracking on `lang="he"` |
| Sparkline left-to-right time | oldest left | oldest right — reverse `data` array for RTL |

RTL strategy: Apply `[dir="rtl"]` CSS selector for structural flips. Use Tailwind logical properties (`ms-`, `me-`, `ps-`, `pe-`, `border-s-`) throughout — do not use `ml-`, `mr-`, `pl-`, `pr-` for spacing that changes direction. Source: Tailwind docs v3.3+ logical properties.

---

## 6. Worker Brief Index

| Component / Page | Wave 3 Worker | Worktree Branch | Notes |
|---|---|---|---|
| Token patch (globals.css) + container fix + StickyKpiStrip | **W1** | `feat/wave3-token-grid-patch` | Paste token block from §1. New `sticky-kpi-strip.tsx`. |
| Consequence copy pass | **W2** | `feat/wave3-consequence-copy` | Copy EmptyState strings from §2. Keyboard strip in Inbox. |
| Home DB wiring | **W3** | `feat/wave3-home-db-wiring` | Home recipe from §3. ScoreHero, KpiCard, ActivityFeed. |
| Scans list + drilldown DB wiring | **W4** | `feat/wave3-scans-db-wiring` | ScanTimelineItem, DividerRow, QueryByQueryTable, EngineBreakdownTable. |
| Inbox + Workspace wire | **W5** | `feat/wave3-inbox-workspace-wire` | InboxItemRow, EvidencePanel, WorkspaceEditor, Fraunces application. |
| Scans drilldown components | **W6** | `feat/wave3-scans-drilldown` | Missing: EngineBreakdownTable, QueryByQueryTable, SentimentHistogram. |
| Competitors hover tooltips + SoV chart | **W7** | `feat/wave3-competitors-polish` | Add tooltip on EngineHeatmap cells. SovTrendChart class recipe from §3. |
| Automation DB wiring + CreditBudgetBar | **W8** | `feat/wave3-automation-wire` | CreditBudgetBar with blue fill from §3. Sparkline SVG per §2. |
| Settings (if needed) | **W8** (secondary) | same branch | Settings recipe from §3 is simple — bundle with automation. |

**Components NOT covered by current W1–W8 briefs — need new or extended briefs:**
| Component | Gap | Recommendation |
|---|---|---|
| `EvidencePanel` (full implementation) | W5 brief mentions Inbox wire but evidence panel details are sparse | Extend W5 brief with §2 EvidencePanel spec |
| `Sparkline` (SVG component) | No existing implementation | Bundle into W8 brief — 30 lines, self-contained |
| `WorkspaceEditor` diff mode | W5 gets view mode; diff needs explicit `<del>`/`<ins>` spec | Extend W5 brief with §2 WorkspaceEditor diff spec |
| `AgentChat / Composer` | Not assigned to any Wave 3 worker | New brief needed if `/dashboard/agent/[id]` is in scope for Wave 3 |

---

*Cross-reference: §1 tokens implement 02-VISUAL-DIRECTION.md §2 "Token Diff". §3 page recipes implement 07-DESIGN-VARIANTS.md §2 per-page table. Component specs in §2 replace 02-VISUAL-DIRECTION.md §3 "Component Blueprints" with precise Tailwind classes. Worker index in §6 maps to 04-REBUILD-PLAN.md §2 worker schedule.*
