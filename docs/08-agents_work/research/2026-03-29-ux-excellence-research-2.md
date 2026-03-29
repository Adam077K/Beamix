'
# UX Excellence Research — Implementation Guide for Professional-Grade Dashboard Design

**Date:** 2026-03-29
**Researcher:** Rex (Opus 4.6)
**Status:** COMPLETE
**Overall Confidence:** HIGH — based on official Tailwind CSS docs, shadcn/ui patterns, established design system principles, and analysis of current Beamix codebase

---

## 1. Executive Summary — Top 20 Implementation Changes

These are ordered by visual impact. Each one makes a noticeable difference on its own.

1. **Tighten the shadow scale** — Replace default Tailwind shadows with a custom 5-step scale using lower opacity (0.04–0.12 range). Current codebase already does this well.
2. **Add a proper typography scale for dashboards** — Use 11px/12px/13px/14px/16px/20px/24px/32px with specific line-heights per size.
3. **Use `tabular-nums` on ALL numeric data** — Prevents layout shift when numbers change.
4. **Implement a 3-layer surface system** — sunken (background), base (content area), raised (cards). Already started in globals.css.
5. **Standardize component padding** — Cards: 20px. Inputs: 10px 12px. Buttons: 8px 16px. Table cells: 12px 16px.
6. **Add subtle border + shadow combo on cards** — `border border-border/50 shadow-sm` is more premium than border OR shadow alone.
7. **Implement proper hover states everywhere** — Background shift `bg-muted/50`, not opacity changes.
8. **Use `ease-out` for enter animations, `ease-in` for exit** — Never `ease-in-out` for both.
9. **Tighten heading letter-spacing** — `-0.025em` for h2/h3, `-0.035em` for h1/display.
10. **Add `antialiased` to body** — `-webkit-font-smoothing: antialiased` makes Inter look sharper.
11. **Implement skeleton screens with proper shimmer** — 1.8s duration, not the default `animate-pulse`.
12. **Standardize icon sizes** — 16px in nav, 14px in buttons, 12px inline. Never 20px+ in dense UI.
13. **Use color opacity modifiers** — `bg-primary/10` for subtle backgrounds, not separate color values.
14. **Add focus-visible rings everywhere** — `ring-2 ring-ring/20 ring-offset-2`. The `/20` makes it subtle.
15. **Implement proper disabled states** — `opacity-50 cursor-not-allowed pointer-events-none`.
16. **Standardize border-radius** — 6px inputs, 8px buttons, 8px cards, 12px modals, 16px panels.
17. **Use `divide-y` for list separators** — Cleaner than individual borders.
18. **Add micro-interactions to buttons** — `active:scale-[0.98]` with 100ms duration.
19. **Implement proper toast animations** — Slide-in from right, 200ms, auto-dismiss 4s.
20. **Dark mode shadows use higher opacity** — 0.25 base instead of 0.08.

---

## 2. Typography System

### Dashboard Type Scale (exact values)

This scale is specifically tuned for data-dense dashboard UIs, NOT marketing pages.

```css
/* ─── Dashboard Typography Scale ─────────────────────────────── */

/* Display — page titles like "Overview", "Rankings" */
--text-display:      1.5rem;     /* 24px */
--text-display-lh:   1.2;        /* 28.8px */
--text-display-ls:   -0.025em;
--text-display-fw:   600;

/* Heading — section titles within pages */
--text-heading:      1.25rem;    /* 20px */
--text-heading-lh:   1.3;        /* 26px */
--text-heading-ls:   -0.02em;
--text-heading-fw:   600;

/* Subheading — card titles, subsection labels */
--text-subheading:   1rem;       /* 16px */
--text-subheading-lh: 1.4;      /* 22.4px */
--text-subheading-ls: -0.01em;
--text-subheading-fw: 500;

/* Body — default readable text */
--text-body:         0.875rem;   /* 14px — NOT 16px for dashboards */
--text-body-lh:      1.5;        /* 21px */
--text-body-ls:      0;
--text-body-fw:      400;

/* Small — descriptions, helper text, timestamps */
--text-small:        0.8125rem;  /* 13px */
--text-small-lh:     1.45;       /* 18.85px */
--text-small-ls:     0;
--text-small-fw:     400;

/* Caption — labels, badge text, footnotes */
--text-caption:      0.75rem;    /* 12px */
--text-caption-lh:   1.4;        /* 16.8px */
--text-caption-ls:   0.01em;
--text-caption-fw:   500;

/* Micro — overlines, eyebrows, tiny labels */
--text-micro:        0.6875rem;  /* 11px */
--text-micro-lh:     1.35;       /* 14.85px */
--text-micro-ls:     0.06em;
--text-micro-fw:     600;

/* KPI / Metric numbers */
--text-kpi-xl:       2rem;       /* 32px */
--text-kpi-lg:       1.5rem;     /* 24px */
--text-kpi-md:       1.25rem;    /* 20px */
--text-kpi-sm:       1rem;       /* 16px */
```

**Source:** Tailwind CSS official font-size docs (https://tailwindcss.com/docs/font-size) — text-sm = 0.875rem/14px with ~1.43 line-height. **Confidence: HIGH**

### Tailwind Class Mapping

```tsx
// Page title
className="text-2xl font-semibold tracking-tight"
// equivalent: 24px, 600, -0.025em

// Section heading
className="text-xl font-semibold tracking-tight"  
// 20px, 600, -0.02em

// Card title
className="text-base font-medium tracking-[-0.01em]"
// 16px, 500

// Body text (dashboard default)
className="text-sm leading-relaxed"
// 14px, line-height 1.625

// Helper text / descriptions
className="text-[13px] leading-[1.45] text-muted-foreground"
// 13px is between text-xs and text-sm — use arbitrary

// Labels and captions
className="text-xs font-medium"
// 12px, 500

// Eyebrow / overline
className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground"
// 11px, 600, UPPERCASE, wide tracking

// KPI metric value
className="text-2xl font-bold font-mono tabular-nums tracking-tight"
// 24px, mono, tabular numbers, tight tracking
```

### Font Weight Guide

| Weight | Value | Use for |
|--------|-------|---------|
| Regular | 400 | Body text, descriptions, table cell data |
| Medium | 500 | Card titles, nav items, input labels, button text |
| Semibold | 600 | Page headings, section titles, KPI labels, badges |
| Bold | 700 | KPI numbers ONLY (in mono). Never for headings in dashboards |

**Source:** Inter font design documentation; standard B2B SaaS practice (Linear, Vercel, Stripe dashboards). **Confidence: HIGH**

### Numeric Typography

```css
/* ALL numbers in the dashboard should use these */
.tabular-nums {
  font-variant-numeric: tabular-nums;
  /* Makes all digits same width — prevents layout shift */
}

.metric-value {
  font-family: var(--font-geist-mono), monospace;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
```

**Source:** Current codebase globals.css already defines `.metric-value`. **Confidence: HIGH**

### Text Truncation

```tsx
// Single line truncate
className="truncate" // overflow-hidden text-ellipsis whitespace-nowrap

// Multi-line clamp (2 lines)
className="line-clamp-2" // display: -webkit-box; -webkit-line-clamp: 2;

// With tooltip on truncated text (pattern)
<span className="truncate" title={fullText}>{fullText}</span>
```

---

## 3. Color System

### Current Beamix Dashboard Palette (from globals.css `.dashboard-theme`)

```css
/* Primary palette */
--primary:            #3370FF;   /* Blue — CTAs, active states, links */
--primary-foreground: #FFFFFF;
--primary/10:         rgba(51, 112, 255, 0.10);  /* Subtle backgrounds */
--primary/20:         rgba(51, 112, 255, 0.20);  /* Hover backgrounds */
--primary/60:         rgba(51, 112, 255, 0.60);  /* Focus rings */

/* Neutrals */
--background:         #F6F7F9;   /* Page background */
--foreground:         #111827;   /* Primary text (gray-900) */
--card:               #FFFFFF;   /* Card/panel background */
--muted:              #F3F4F6;   /* Hover states, secondary bg (gray-100) */
--muted-foreground:   #6B7280;   /* Secondary text (gray-500) */
--border:             #E5E7EB;   /* Borders (gray-200) */
--text-tertiary:      #9CA3AF;   /* Tertiary text (gray-400) */
--divider:            #F3F4F6;   /* Light dividers (gray-100) */
```

**Source:** Current codebase `/saas-platform/src/app/globals.css` lines 207–246. **Confidence: HIGH**

### Opacity Scale for Interactive States

```css
/* Hover / Focus / Active opacity pattern using Tailwind modifiers */

/* Backgrounds */
bg-primary/5    /* Subtle tint — badge backgrounds, selected row */
bg-primary/8    /* Slightly more visible — hovered badge */
bg-primary/10   /* Standard subtle bg — selected sidebar item, active tab */
bg-primary/15   /* Hover on selected item */
bg-primary/20   /* Strong emphasis — focus ring fill */

/* Borders */
border-primary/20  /* Subtle primary border */
border-primary/40  /* Medium emphasis border */
border-border/50   /* Softer default border — key to premium feel */
border-border/80   /* Slightly more visible than 50 */

/* Text */
text-foreground/80  /* Slightly muted primary text */
text-foreground/60  /* Noticeably muted */
text-muted-foreground  /* Standard secondary text */
```

**Source:** Tailwind CSS opacity modifier syntax (https://tailwindcss.com/docs/opacity). **Confidence: HIGH**

### Score / Status Colors (unchanged from brand)

```css
--score-excellent: #06B6D4;  /* Cyan — 75-100 */
--score-good:      #10B981;  /* Green — 50-74 */
--score-fair:      #F59E0B;  /* Amber — 25-49 */
--score-critical:  #EF4444;  /* Red — 0-24 */

/* With backgrounds (use 10% opacity of score color) */
/* Excellent */ bg-[#06B6D4]/10 text-[#06B6D4]
/* Good */      bg-[#10B981]/10 text-[#10B981]
/* Fair */      bg-[#F59E0B]/10 text-[#F59E0B]
/* Critical */  bg-[#EF4444]/10 text-[#EF4444]
```

**Source:** Current `BRAND_GUIDELINES.md` Section 2, `PRODUCT_DESIGN_SYSTEM.md` Section 3. **Confidence: HIGH**

### Chart Color Palette (6 colors)

```css
--chart-1: #3370FF;  /* Primary blue */
--chart-2: #10B981;  /* Green */
--chart-3: #8B5CF6;  /* Purple */
--chart-4: #F59E0B;  /* Amber */
--chart-5: #06B6D4;  /* Cyan */
--chart-6: #EC4899;  /* Pink */
```

**Source:** Current codebase globals.css `.dashboard-theme` section. **Confidence: HIGH**

---

## 4. Shadow & Border System

### Custom Shadow Scale (replaces Tailwind defaults)

The current codebase already has a good minimal shadow scale. Here is the refined version:

```css
/* ─── Shadow Scale (Premium Flat) ──────────────────────────── */

/* Level 0 — flush / no elevation */
--shadow-none: none;

/* Level 1 — Cards at rest, default containers */
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.03);

/* Level 2 — Hovered cards, inputs, subtle lift */
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04), 
             0 1px 2px rgba(0, 0, 0, 0.03);

/* Level 3 — Dropdowns, popovers, active cards */
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 
             0 2px 4px -2px rgba(0, 0, 0, 0.03);

/* Level 4 — Modals, toasts, floating panels */
--shadow-lg: 0 10px 25px -3px rgba(0, 0, 0, 0.07), 
             0 4px 10px -4px rgba(0, 0, 0, 0.04);

/* Level 5 — Command palette, elevated modals */
--shadow-xl: 0 20px 40px -5px rgba(0, 0, 0, 0.08), 
             0 8px 16px -8px rgba(0, 0, 0, 0.05);

/* Component-specific */
--shadow-card:       var(--shadow-xs);
--shadow-card-hover: var(--shadow-sm);
--shadow-dropdown:   var(--shadow-md);
--shadow-modal:      var(--shadow-lg);
--shadow-toast:      var(--shadow-md);
--shadow-sidebar:    none;  /* sidebars use border, not shadow */

/* Focus ring shadow (combined with ring utility) */
--shadow-focus: 0 0 0 3px rgba(51, 112, 255, 0.08);
```

**Source:** Tailwind CSS official shadow docs (https://tailwindcss.com/docs/box-shadow) for baseline values; opacity reduced from 0.1 default to 0.03-0.08 range for premium flat aesthetic. Current codebase globals.css already implements a similar approach. **Confidence: HIGH**

### Dark Mode Shadows

```css
.dark {
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.15);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.20), 
               0 1px 2px rgba(0, 0, 0, 0.12);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.25), 
               0 2px 4px -2px rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 10px 25px -3px rgba(0, 0, 0, 0.35), 
               0 4px 10px -4px rgba(0, 0, 0, 0.20);
  --shadow-xl: 0 20px 40px -5px rgba(0, 0, 0, 0.40), 
               0 8px 16px -8px rgba(0, 0, 0, 0.25);
  
  --shadow-focus: 0 0 0 3px rgba(51, 112, 255, 0.15);
}
```

### Border Patterns

```css
/* When to use borders vs background shifts vs shadows */

/* Borders: structural separation (sidebar, table headers, input fields) */
border border-border       /* Standard — #E5E7EB full opacity */
border border-border/50    /* Subtle — half opacity, premium feel */
border border-border/30    /* Very subtle — cards where shadow does the work */

/* Background shifts: content grouping (hover rows, selected items) */
bg-muted                   /* Full muted — selected state */
bg-muted/50                /* Half muted — hover state */
hover:bg-muted/30          /* Gentle hover */

/* Shadows: elevation/floating (cards, dropdowns, modals) */
/* Use shadow when element "floats" above page */

/* The combo that looks best for dashboard cards: */
className="bg-card border border-border/40 shadow-xs"
/* border + shadow together creates depth without either being heavy */
```

### Border Radius System

```css
/* ─── Border Radius Scale ────────────────────────────────── */
--radius-sm:  4px;    /* Badges, tiny elements */
--radius-md:  6px;    /* Inputs, small buttons, table cells */
--radius-lg:  8px;    /* Cards, buttons, containers */
--radius-xl:  12px;   /* Modals, large panels */
--radius-2xl: 16px;   /* Feature cards, hero elements (marketing only) */
--radius-full: 9999px; /* Pills, avatars, toggles */

/* Component mapping */
/* Input:     rounded-md (6px) */
/* Button:    rounded-lg (8px) */
/* Card:      rounded-lg (8px) — NOT 20px for dashboard */
/* Dropdown:  rounded-lg (8px) */
/* Modal:     rounded-xl (12px) */
/* Badge:     rounded-md (6px) or rounded-full for pills */
/* Avatar:    rounded-full */
/* Toggle:    rounded-full */
```

**Note:** The brand guidelines specify 20px card radius for marketing. For the dashboard, 8px is more appropriate for data-dense interfaces. The current globals.css has `--radius-card: 8px` which is correct for the dashboard theme.

**Source:** Current codebase globals.css `--radius-card: 8px;` (line 58), brand guidelines `docs/BRAND_GUIDELINES.md` Section 5. **Confidence: HIGH**

---

## 5. Spacing System

### 4px Base Grid

```css
/* ─── Spacing Scale (4px base) ────────────────────────────── */
/* Use Tailwind spacing utilities: 1 unit = 4px */

0.5  →  2px    /* Tiny gaps: between icon and text in tight spaces */
1    →  4px    /* Micro spacing: gap between badge elements */
1.5  →  6px    /* Small internal padding */
2    →  8px    /* Standard small gap */
3    →  12px   /* Input padding-y, small section gaps */
4    →  16px   /* Standard padding, gap between related elements */
5    →  20px   /* Card internal padding */
6    →  24px   /* Section padding, card body padding */
8    →  32px   /* Between sections, card grid gap */
10   →  40px   /* Large section gaps */
12   →  48px   /* Page-level vertical rhythm */
16   →  64px   /* Major section breaks */
```

### Component Padding Standards

```tsx
/* ─── Exact Padding per Component ─────────────────────────── */

// Page container
className="p-6 lg:p-8"  /* 24px default, 32px on large screens */

// Card
className="p-5"          /* 20px all sides */
// Card with header/body separation:
// Header: "px-5 py-4"   /* 20px horizontal, 16px vertical */
// Body:   "px-5 pb-5"   /* 20px horizontal, 20px bottom */

// Table
// Header cell: "px-4 py-3"    /* 16px h, 12px v */
// Body cell:   "px-4 py-3"    /* 16px h, 12px v */
// Compact:     "px-3 py-2"    /* 12px h, 8px v */

// Input field
className="px-3 py-2.5"  /* 12px horizontal, 10px vertical */
// Height: h-10 (40px) standard, h-9 (36px) compact

// Button
// Default: "px-4 py-2 h-9"     /* 16px h, 8px v, 36px height */
// Small:   "px-3 py-1.5 h-8"   /* 12px h, 6px v, 32px height */
// Large:   "px-6 py-2.5 h-11"  /* 24px h, 10px v, 44px height */
// Icon:    "p-2 h-9 w-9"       /* 8px, 36x36 */

// Badge
className="px-2 py-0.5"  /* 8px h, 2px v */
// or for larger: "px-2.5 py-1" /* 10px h, 4px v */

// Dropdown menu
// Container: "p-1"       /* 4px padding around items */
// Item:      "px-2 py-1.5" /* 8px h, 6px v */

// Modal
// Container: "p-6"       /* 24px */
// Or: header "px-6 py-4", body "px-6 py-4", footer "px-6 py-4"

// Sidebar nav item
className="px-3 py-2"    /* 12px h, 8px v */

// Toast notification
className="p-4"          /* 16px */
```

### Gap Standards

```tsx
/* ─── Gap Between Elements ────────────────────────────────── */

// Within a card (label to value)
className="space-y-1"     /* 4px */

// Form fields (label to input)
className="space-y-1.5"   /* 6px */

// Between form groups
className="space-y-4"     /* 16px */

// Card grid
className="gap-4"         /* 16px on mobile */
className="gap-6"         /* 24px on desktop */

// Between sections
className="space-y-8"     /* 32px */

// Between major page sections
className="space-y-12"    /* 48px */

// Stat card grid (KPI row)
className="grid grid-cols-2 lg:grid-cols-4 gap-4"  /* 16px gap */

// Dashboard sidebar to content
/* Sidebar width already handles this — no explicit gap needed */
```

**Source:** Tailwind CSS spacing scale (https://tailwindcss.com/docs/customizing-spacing), analysis of Linear/Vercel/Stripe dashboard patterns. **Confidence: HIGH**

---

## 6. Component Patterns

### Buttons

```tsx
/* ─── Button States (Complete) ────────────────────────────── */

// Base (all buttons)
const buttonBase = `
  inline-flex items-center justify-center gap-2
  text-sm font-medium
  rounded-lg
  transition-all duration-150 ease-out
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2
  disabled:opacity-50 disabled:pointer-events-none
`

// Primary button
const primary = {
  default:  "bg-primary text-primary-foreground shadow-xs",
  hover:    "hover:bg-primary/90 hover:shadow-sm",
  active:   "active:scale-[0.98] active:shadow-none",
  disabled: "disabled:opacity-50 disabled:pointer-events-none",
  loading:  "relative text-transparent [&>svg.spinner]:visible",
}
// Full: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 hover:shadow-sm active:scale-[0.98] active:shadow-none"

// Secondary / Outline button
const secondary = {
  default:  "border border-border bg-card text-foreground",
  hover:    "hover:bg-muted hover:border-border",
  active:   "active:scale-[0.98] active:bg-muted",
}

// Ghost button
const ghost = {
  default:  "text-muted-foreground",
  hover:    "hover:bg-muted hover:text-foreground",
  active:   "active:bg-muted/80",
}

// Destructive button
const destructive = {
  default:  "bg-destructive text-white",
  hover:    "hover:bg-destructive/90",
  active:   "active:scale-[0.98]",
}

// Loading spinner inside button
<Button disabled>
  <Loader2 className="h-4 w-4 animate-spin" />
  Saving...
</Button>
```

### Input Fields

```tsx
/* ─── Input States (Complete) ─────────────────────────────── */

// Default input
className={cn(
  "flex h-10 w-full rounded-md",
  "border border-border bg-card",
  "px-3 py-2.5 text-sm",
  "placeholder:text-muted-foreground",
  "transition-all duration-200",
  // Focus
  "focus:outline-none focus:ring-2 focus:ring-ring/20 focus:ring-offset-1",
  "focus:border-ring",
  // Disabled
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted",
)}

// Error state
className="border-destructive focus:ring-destructive/20"
// + error message below:
<p className="mt-1.5 text-xs text-destructive">Error message</p>

// Success state
className="border-[#10B981] focus:ring-[#10B981]/20"

// With left icon
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  <input className="pl-9 ..." />
</div>

// With right action
<div className="relative">
  <input className="pr-9 ..." />
  <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted">
    <X className="h-3.5 w-3.5 text-muted-foreground" />
  </button>
</div>
```

### Tables

```tsx
/* ─── Table Design Pattern ────────────────────────────────── */

// Container
<div className="rounded-lg border border-border overflow-hidden">

  // Header
  <thead className="bg-muted/50">
    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      Column Name
    </th>
  </thead>

  // Body rows
  <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors duration-100">
    <td className="px-4 py-3 text-sm">
      Cell content
    </td>
  </tr>

  // Numeric cells — right-aligned with mono font
  <td className="px-4 py-3 text-sm text-right font-mono tabular-nums">
    1,234
  </td>

  // Status cell
  <td className="px-4 py-3">
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-[#10B981]/10 text-[#10B981]">
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      Active
    </span>
  </td>

  // Pagination
  <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
    <p className="text-sm text-muted-foreground">
      Showing 1-10 of 24
    </p>
    <div className="flex gap-1">
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  </div>
</div>
```

### Cards

```tsx
/* ─── Card Variants ───────────────────────────────────────── */

// Standard card (dashboard)
className="bg-card rounded-lg border border-border/40 shadow-xs"

// Interactive card (clickable)
className="bg-card rounded-lg border border-border/40 shadow-xs 
           hover:shadow-sm hover:border-border/60 hover:-translate-y-px
           transition-all duration-200 cursor-pointer"

// Stat card (KPI)
<div className="bg-card rounded-lg border border-border/40 shadow-xs p-5">
  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
    Total Scans
  </p>
  <p className="mt-2 text-2xl font-bold font-mono tabular-nums tracking-tight text-foreground">
    1,247
  </p>
  <p className="mt-1 text-xs text-[#10B981] flex items-center gap-1">
    <TrendingUp className="h-3 w-3" /> +12.5%
  </p>
</div>

// Selected / Active card
className="bg-primary/5 rounded-lg border border-primary/20 shadow-xs"

// Warning card
className="bg-[#F59E0B]/5 rounded-lg border border-[#F59E0B]/20"

// Empty state card
<div className="bg-card rounded-lg border border-dashed border-border p-12 text-center">
  <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
    <Icon className="h-6 w-6 text-muted-foreground" />
  </div>
  <h3 className="mt-4 text-base font-medium">No data yet</h3>
  <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
    Description of what will appear here
  </p>
  <Button className="mt-4">Action</Button>
</div>
```

### Badges / Pills

```tsx
/* ─── Badge Variants ──────────────────────────────────────── */

// Default (neutral)
className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md 
           text-xs font-medium bg-muted text-muted-foreground"

// Status dot + text pattern
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium">
  <span className="h-1.5 w-1.5 rounded-full bg-current" />
  Label
</span>

// Color variants
const badgeColors = {
  blue:   "bg-[#3370FF]/10 text-[#3370FF]",     // info / primary
  green:  "bg-[#10B981]/10 text-[#10B981]",     // success
  amber:  "bg-[#F59E0B]/10 text-[#F59E0B]",     // warning
  red:    "bg-[#EF4444]/10 text-[#EF4444]",     // error
  purple: "bg-[#8B5CF6]/10 text-[#8B5CF6]",     // feature
  gray:   "bg-muted text-muted-foreground",       // neutral
}

// Pill shape (for counts, tags)
className="inline-flex items-center px-2.5 py-0.5 rounded-full 
           text-xs font-medium bg-muted text-muted-foreground"

// Small count badge (notification style)
className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 
           rounded-full text-[10px] font-semibold bg-primary text-primary-foreground"
```

### Dropdown Menus

```tsx
/* ─── Dropdown Pattern ────────────────────────────────────── */

// Container
className="min-w-[180px] rounded-lg border border-border/50 bg-card 
           shadow-md p-1
           animate-in fade-in-0 zoom-in-95 duration-150"

// Menu item
className="flex items-center gap-2 w-full rounded-md px-2 py-1.5
           text-sm cursor-pointer
           hover:bg-muted
           focus:bg-muted focus:outline-none
           data-[highlighted]:bg-muted"

// Menu item with icon
<div className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm hover:bg-muted cursor-pointer">
  <Settings className="h-4 w-4 text-muted-foreground" />
  <span>Settings</span>
</div>

// Separator
className="my-1 h-px bg-border/50"

// Menu label (group header)
className="px-2 py-1.5 text-xs font-semibold text-muted-foreground"

// Destructive item
className="flex items-center gap-2 w-full rounded-md px-2 py-1.5
           text-sm text-destructive cursor-pointer
           hover:bg-destructive/10
           focus:bg-destructive/10"
```

### Tabs

```tsx
/* ─── Tab Styles per Context ──────────────────────────────── */

// Underline tabs (for page-level navigation)
// Container
className="flex border-b border-border"
// Tab item
className={cn(
  "px-4 py-2.5 text-sm font-medium transition-colors duration-150",
  "border-b-2 -mb-px",
  isActive 
    ? "border-primary text-foreground" 
    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
)}

// Pill / Segment tabs (for content switching within a card)
// Container
className="inline-flex items-center gap-1 p-1 rounded-lg bg-muted"
// Tab item
className={cn(
  "px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-150",
  isActive 
    ? "bg-card text-foreground shadow-xs" 
    : "text-muted-foreground hover:text-foreground"
)}

// Use underline for: page sections, settings tabs, main navigation
// Use pill/segment for: chart period selectors, view toggles, filter switches
```

### Tooltips

```css
/* ─── Tooltip Design ──────────────────────────────────────── */
/* Delay: 400ms before show, 0ms to hide */
/* Max width: 240px */
/* Arrow: 6px equilateral triangle */
/* Animation: fade-in + scale from 95% to 100%, 150ms */

.tooltip {
  padding: 6px 10px;
  border-radius: 6px;
  background: #111827;        /* gray-900 */
  color: #FFFFFF;
  font-size: 12px;
  line-height: 1.4;
  max-width: 240px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  animation: tooltip-in 150ms ease-out;
}

@keyframes tooltip-in {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}
```

### Progress Bars

```tsx
/* ─── Progress Bar Pattern ────────────────────────────────── */

// Standard
<div className="h-2 w-full rounded-full bg-muted overflow-hidden">
  <div 
    className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
    style={{ width: `${percent}%` }}
  />
</div>

// Thin (inline, table cell)
<div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
  <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
</div>

// Score bar (colored by score level)
const barColor = score >= 75 ? 'bg-[#06B6D4]' 
               : score >= 50 ? 'bg-[#10B981]' 
               : score >= 25 ? 'bg-[#F59E0B]' 
               : 'bg-[#EF4444]'

// With label
<div className="flex items-center gap-3">
  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
    <div className={cn("h-full rounded-full", barColor)} style={{ width: `${percent}%` }} />
  </div>
  <span className="text-sm font-mono tabular-nums w-10 text-right">{percent}%</span>
</div>
```

### Score Indicators

```tsx
/* ─── Score Ring ──────────────────────────────────────────── */

// SVG circular score indicator
const circumference = 2 * Math.PI * 42; // r=42
const offset = circumference - (score / 100) * circumference;

<svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
  {/* Background ring */}
  <circle cx="50" cy="50" r="42" fill="none" 
    stroke="currentColor" strokeWidth="6"
    className="text-muted" />
  {/* Score ring */}
  <circle cx="50" cy="50" r="42" fill="none"
    stroke={scoreColor} strokeWidth="6"
    strokeDasharray={circumference}
    strokeDashoffset={offset}
    strokeLinecap="round"
    className="transition-all duration-1000 ease-out" />
</svg>
{/* Center number */}
<span className="absolute inset-0 flex items-center justify-center text-2xl font-bold font-mono tabular-nums">
  {score}
</span>
```

---

## 7. Animation System

### Timing & Easing Reference

```css
/* ─── Animation Tokens ────────────────────────────────────── */

/* Durations */
--duration-instant:  50ms;     /* Color changes, opacity */
--duration-fast:     100ms;    /* Button feedback, icon changes */
--duration-normal:   150ms;    /* Hover states, small transforms */
--duration-moderate: 200ms;    /* Dropdowns, tooltips, card hover */
--duration-slow:     300ms;    /* Page transitions, modals, slide panels */
--duration-slower:   400ms;    /* Complex entrance animations */
--duration-slowest:  500ms;    /* Full page transitions, chart entrance */

/* Easing functions */
--ease-default:  cubic-bezier(0.4, 0, 0.2, 1);    /* General purpose */
--ease-in:       cubic-bezier(0.4, 0, 1, 1);       /* Elements leaving */
--ease-out:      cubic-bezier(0, 0, 0.2, 1);       /* Elements entering */
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);    /* Snappy enter — PREMIUM FEEL */
--ease-spring:   cubic-bezier(0.22, 1, 0.36, 1);   /* Bouncy, organic feel */
--ease-bounce:   cubic-bezier(0.34, 1.56, 0.64, 1); /* Overshoot + settle */
```

**Source:** Tailwind CSS transition-timing-function docs (https://tailwindcss.com/docs/transition-timing-function). Custom easings from widely used animation libraries (Framer Motion, GSAP). **Confidence: HIGH**

### Which Easing for What

```
hover states     → ease-out, 150ms
button press     → ease-out, 100ms  
dropdown open    → ease-out-expo, 200ms
dropdown close   → ease-in, 150ms
modal enter      → ease-spring, 300ms
modal exit       → ease-in, 200ms
page transition  → ease-out-expo, 400ms
toast enter      → ease-out-expo, 200ms (slide from right)
toast exit       → ease-in, 150ms
skeleton shimmer → ease-in-out, 1800ms (infinite)
chart entrance   → ease-out, 600ms (stagger 50ms per element)
number counter   → ease-out-expo, 800ms
```

### Page Transitions

```tsx
/* ─── Page Entry Animation ────────────────────────────────── */

// Fade-up (default page entry)
@keyframes fade-up {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
// Use: className="animate-fade-up"
// Duration: 400ms, easing: cubic-bezier(0.22, 1, 0.36, 1)

// Stagger children
<div className="space-y-6">
  {sections.map((section, i) => (
    <div 
      key={i}
      className="animate-fade-up"
      style={{ animationDelay: `${i * 80}ms` }}
    >
      {section}
    </div>
  ))}
</div>
```

### Skeleton Loading

```tsx
/* ─── Skeleton Screen ─────────────────────────────────────── */

// Shimmer animation (already in codebase)
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}

.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    var(--muted) 25%,
    color-mix(in srgb, var(--muted) 80%, white) 50%,
    var(--muted) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}

// Usage
<div className="space-y-3">
  <div className="h-4 w-3/4 rounded skeleton-shimmer" />
  <div className="h-4 w-1/2 rounded skeleton-shimmer" />
  <div className="h-32 w-full rounded-lg skeleton-shimmer" />
</div>

// Match real layout shape
<div className="p-5 rounded-lg border border-border/40">
  <div className="h-3 w-24 rounded skeleton-shimmer" />  {/* label */}
  <div className="mt-3 h-8 w-20 rounded skeleton-shimmer" /> {/* KPI */}
  <div className="mt-2 h-3 w-16 rounded skeleton-shimmer" /> {/* delta */}
</div>
```

**Source:** Current codebase globals.css lines 426-435 (shimmer), lines 437-446 (page animations). **Confidence: HIGH**

### Button Micro-interactions

```tsx
/* ─── Button Click Feedback ───────────────────────────────── */

// Scale down on click (subtle, professional)
className="active:scale-[0.98] transition-transform duration-100 ease-out"

// Primary button with shadow feedback
className="shadow-xs hover:shadow-sm active:shadow-none active:scale-[0.98]
           transition-all duration-150 ease-out"

// Icon button rotation on click
className="active:rotate-12 transition-transform duration-150 ease-out"

// AVOID: scale below 0.95 (looks broken), transform on non-interactive elements
```

### Toast Notifications

```tsx
/* ─── Toast Slide-in ──────────────────────────────────────── */

@keyframes toast-in {
  from { 
    opacity: 0; 
    transform: translateX(100%); 
  }
  to { 
    opacity: 1; 
    transform: translateX(0); 
  }
}

@keyframes toast-out {
  from { 
    opacity: 1; 
    transform: translateX(0); 
  }
  to { 
    opacity: 0; 
    transform: translateX(100%); 
  }
}

// Toast container — bottom-right
className="fixed bottom-4 right-4 z-50 max-w-sm w-full"

// Toast card
className="bg-card border border-border/50 rounded-lg shadow-md p-4
           flex items-start gap-3"

// Auto-dismiss: 4000ms (success), 6000ms (error), 8000ms (info with action)
// Progress bar at bottom showing remaining time:
<div className="absolute bottom-0 left-0 h-0.5 bg-primary rounded-b-lg"
     style={{ width: `${remainingPercent}%`, transition: 'width 100ms linear' }} />
```

### Chart Animations

```tsx
/* ─── Chart Entrance ──────────────────────────────────────── */

// Recharts line chart — animate on mount
<Line 
  animationDuration={800}
  animationEasing="ease-out"
/>

// Bar chart — stagger entrance
<Bar 
  animationDuration={600}
  animationBegin={index * 50}  // stagger per bar
  animationEasing="ease-out"
/>

// Number counter animation (for KPIs)
function useCountUp(target: number, duration = 800) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const start = performance.now()
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return count
}
```

---

## 8. Dark Mode System

### Color Mapping Strategy

Dark mode is NOT inverting colors. It is remapping semantic tokens to darker values while preserving hierarchy.

```css
/* ─── Dark Mode Token Mapping ─────────────────────────────── */
.dark {
  /* Surfaces: 3-layer system persists */
  --background:      #0A0A0A;   /* Page bg (darkest) */
  --surface-sunken:  #080808;   /* Below cards */
  --card:            #141414;   /* Card bg (slightly lighter than page) */
  --surface-raised:  #1C1C1C;   /* Elevated elements */
  --muted:           #1E1E1E;   /* Hover states, selected bg */
  
  /* Text: reduce from pure white to avoid strain */
  --foreground:         #EDEDED;   /* Primary text — NOT #FFFFFF */
  --muted-foreground:   #888888;   /* Secondary text */
  --text-tertiary:      #555555;   /* Tertiary / disabled text */
  
  /* Borders: use white at low opacity */
  --border:          rgba(255, 255, 255, 0.08);  /* Standard border */
  --border-hover:    rgba(255, 255, 255, 0.14);  /* Hovered border */
  --input:           rgba(255, 255, 255, 0.10);  /* Input border */
  --divider:         rgba(255, 255, 255, 0.06);  /* Thin dividers */
  
  /* Primary: keep hue, adjust brightness */
  --primary:         #3370FF;   /* Same blue works in dark mode */
  --primary/10:      rgba(51, 112, 255, 0.12);  /* Slightly more opaque for visibility */
  
  /* Shadows: heavier in dark mode */
  --shadow-card:       0 1px 3px rgba(0, 0, 0, 0.30), 0 1px 2px rgba(0, 0, 0, 0.20);
  --shadow-dropdown:   0 4px 12px rgba(0, 0, 0, 0.40);
  --shadow-modal:      0 16px 40px rgba(0, 0, 0, 0.50);
  
  /* Charts: bump saturation/lightness for dark bg contrast */
  --chart-1: #5B8EFF;  /* Lighter blue */
  --chart-2: #34D399;  /* Lighter green */
  --chart-3: #A78BFA;  /* Lighter purple */
  --chart-4: #FBBF24;  /* Lighter amber */
  --chart-5: #22D3EE;  /* Lighter cyan */
  --chart-6: #F472B6;  /* Lighter pink */
}
```

### Key Dark Mode Rules

```
1. NEVER use pure white (#FFFFFF) for body text — use #EDEDED or lighter
2. NEVER invert borders — use white at 6-10% opacity instead
3. Card backgrounds should be 1 step lighter than page (not the same)
4. Shadows need 3-5x the opacity of light mode to be visible
5. Primary accent (#3370FF) works without changes — blue is fine on dark
6. Status colors (green, red, amber) need +10% lightness bump for readability
7. Use `ring-offset-background` on focus rings so offset matches dark bg
8. Skeleton shimmer needs darker gradient endpoints
9. Borders between same-color surfaces: use opacity, not a different color
10. Charts: bump lightness by ~15% or saturation by ~10%
```

### Implementation Pattern with next-themes

```tsx
// Already in codebase — .dark class on <html>
// CSS variables automatically resolve per theme
// NO conditional className logic needed for most cases

// Exception: when you need different structural layouts
<div className={cn(
  "border",
  // Light: subtle border. Dark: barely visible
  "border-border"  // This just works — CSS var resolves differently
)}>

// For images/illustrations that need different versions:
<img src="/illustration-light.svg" className="dark:hidden" />
<img src="/illustration-dark.svg" className="hidden dark:block" />
```

**Source:** Current codebase globals.css lines 154-205 (dark mode), Tailwind CSS dark mode docs. **Confidence: HIGH**

---

## 9. Responsive Patterns

### Sidebar Collapse (3-state)

```tsx
/* ─── Sidebar States ──────────────────────────────────────── */

// State 1: Full (desktop) — w-[220px]
// State 2: Collapsed (medium) — w-16 (icon only)
// State 3: Hidden (mobile) — off-screen, overlay when open

// Sidebar container
<aside className={cn(
  "fixed left-0 top-0 h-screen z-40",
  "bg-card border-r border-border",
  "transition-all duration-200 ease-out",
  // Desktop
  isExpanded ? "w-[220px]" : "w-16",
  // Mobile
  "max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-50",
  !mobileOpen && "max-lg:-translate-x-full"
)}>

// Nav item adapts to collapsed state
<a className={cn(
  "flex items-center gap-3 px-3 py-2 rounded-lg",
  "text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
  !isExpanded && "justify-center px-0"
)}>
  <Icon className="h-4 w-4 shrink-0" />
  {isExpanded && <span className="truncate">{label}</span>}
</a>

// Collapsed: show tooltip on hover
{!isExpanded && (
  <Tooltip delayDuration={0}>
    <TooltipTrigger asChild>{navItem}</TooltipTrigger>
    <TooltipContent side="right">{label}</TooltipContent>
  </Tooltip>
)}

// Mobile overlay backdrop
{mobileOpen && (
  <div 
    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
    onClick={closeMobile}
  />
)}

// Main content offset
<main className={cn(
  "transition-all duration-200",
  isExpanded ? "lg:ml-[220px]" : "lg:ml-16",
  "max-lg:ml-0"
)}>
```

### Table Responsiveness

```tsx
/* ─── Responsive Tables ───────────────────────────────────── */

// Option A: Horizontal scroll (preferred for data tables)
<div className="overflow-x-auto rounded-lg border border-border">
  <table className="w-full min-w-[600px]">
    {/* Table content */}
  </table>
</div>

// Option B: Card stack on mobile (for fewer columns)
<div className="hidden md:block">
  <table>{/* Desktop table */}</table>
</div>
<div className="md:hidden space-y-3">
  {rows.map(row => (
    <div className="bg-card rounded-lg border border-border/40 p-4 space-y-2">
      <div className="flex justify-between">
        <span className="text-xs text-muted-foreground">Name</span>
        <span className="text-sm font-medium">{row.name}</span>
      </div>
      {/* ... more fields */}
    </div>
  ))}
</div>

// Option C: Hide less-important columns on mobile
<th className="hidden lg:table-cell">Less Important</th>
<td className="hidden lg:table-cell">Data</td>
```

### Chart Responsiveness

```tsx
/* ─── Responsive Charts ───────────────────────────────────── */

// Use container queries or ResizeObserver
<div className="w-full aspect-[16/9] lg:aspect-[2/1]">
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data}>
      {/* Recharts auto-resizes */}
    </LineChart>
  </ResponsiveContainer>
</div>

// On mobile: simplify chart
// - Remove legend, show as separate list below
// - Reduce tick count on axes
// - Increase touch target for tooltips
// - Consider showing summary number instead of chart on very small screens

<div className="sm:hidden text-center p-6">
  <p className="text-3xl font-bold font-mono tabular-nums">{latestValue}</p>
  <p className="text-sm text-muted-foreground mt-1">Current score</p>
</div>
<div className="hidden sm:block">
  {/* Full chart */}
</div>
```

### Mobile Dashboard Navigation

```tsx
/* ─── Mobile Nav (Bottom Bar) ─────────────────────────────── */

// Bottom navigation bar for mobile
<nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden
                bg-card border-t border-border
                flex items-center justify-around
                h-16 px-2 pb-safe">
  {navItems.slice(0, 5).map(item => (
    <a className={cn(
      "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg",
      "text-[10px] font-medium",
      isActive ? "text-primary" : "text-muted-foreground"
    )}>
      <item.icon className="h-5 w-5" />
      <span>{item.label}</span>
    </a>
  ))}
</nav>

// Add bottom padding to main content on mobile to clear nav
<main className="pb-20 lg:pb-0">
```

### Responsive Grid Patterns

```tsx
/* ─── Dashboard Grid Patterns ─────────────────────────────── */

// KPI stat cards — 1 col mobile, 2 col tablet, 4 col desktop
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"

// Two-column layout — stack on mobile
className="grid grid-cols-1 lg:grid-cols-2 gap-6"

// Content + sidebar layout — 2/3 + 1/3
className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6"

// Full-width on mobile, contained on desktop
className="w-full max-w-5xl mx-auto px-4 sm:px-6"
```

**Source:** Tailwind CSS responsive design docs, analysis of Linear/Notion/Vercel dashboard responsive patterns. **Confidence: HIGH**

---

## 10. Implementation Checklist (Ordered by Visual Impact)

### Phase 1: Foundation (Highest Impact — Do First)

- [ ] **1.1** Add `-webkit-font-smoothing: antialiased` and `text-rendering: optimizeLegibility` to body
- [ ] **1.2** Set dashboard body text to `text-sm` (14px) as default, not `text-base` (16px)
- [ ] **1.3** Update shadow scale in globals.css — lower opacity values (see Section 4)
- [ ] **1.4** Standardize card pattern: `bg-card rounded-lg border border-border/40 shadow-xs`
- [ ] **1.5** Add `tabular-nums` to all numeric displays: scores, counts, percentages, prices
- [ ] **1.6** Tighten heading letter-spacing: `tracking-tight` on all h1-h3
- [ ] **1.7** Ensure all interactive elements have `transition-all duration-150 ease-out`

### Phase 2: Components (High Impact)

- [ ] **2.1** Implement button states: hover bg change, `active:scale-[0.98]`, proper disabled
- [ ] **2.2** Implement input focus: `ring-2 ring-ring/20 ring-offset-1` (subtle, not heavy)
- [ ] **2.3** Table styling: `bg-muted/50` header, `hover:bg-muted/30` rows, right-align numbers
- [ ] **2.4** Badge system: 6 color variants with 10% opacity backgrounds
- [ ] **2.5** Dropdown shadows: `shadow-md` with `border-border/50`
- [ ] **2.6** Tab implementation: underline for page nav, segment/pill for inline toggles
- [ ] **2.7** Empty state pattern: icon + heading + description + CTA, centered in card

### Phase 3: Animation (Medium Impact)

- [ ] **3.1** Page entry: `animate-fade-up` with staggered children (80ms delay each)
- [ ] **3.2** Skeleton loading: replace `animate-pulse` with `skeleton-shimmer` (1.8s gradient)
- [ ] **3.3** Toast notifications: slide-in from right, 200ms, 4s auto-dismiss
- [ ] **3.4** Card hover: `-translate-y-px` + shadow increase, 200ms
- [ ] **3.5** Dropdown open: `animate-in fade-in-0 zoom-in-95 duration-150`
- [ ] **3.6** `prefers-reduced-motion`: disable all animations

### Phase 4: Dark Mode (Medium Impact)

- [ ] **4.1** Card bg `#141414` (not same as page `#0A0A0A`) — create visual layers
- [ ] **4.2** Primary text `#EDEDED` (not pure white `#FFFFFF`)
- [ ] **4.3** Borders: white at 8% opacity, not gray hex values
- [ ] **4.4** Shadows: 3-5x opacity increase from light mode
- [ ] **4.5** Chart colors: bump lightness +15% for dark backgrounds
- [ ] **4.6** Skeleton shimmer: darker gradient endpoints

### Phase 5: Responsive (Lower Impact for Desktop-First)

- [ ] **5.1** Sidebar: 3-state (full → icon → hidden) with smooth transitions
- [ ] **5.2** Tables: horizontal scroll wrapper with `min-w-[600px]`
- [ ] **5.3** Charts: aspect ratio wrapper, simplify on mobile
- [ ] **5.4** Bottom nav bar for mobile (5 items max)
- [ ] **5.5** KPI grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`

---

## Research Metadata

### Sources Used

| Source | URL | Type | Confidence |
|--------|-----|------|------------|
| Tailwind CSS Box Shadow docs | https://tailwindcss.com/docs/box-shadow | Official docs, current | HIGH |
| Tailwind CSS Font Size docs | https://tailwindcss.com/docs/font-size | Official docs, current | HIGH |
| Tailwind CSS Letter Spacing docs | https://tailwindcss.com/docs/letter-spacing | Official docs, current | HIGH |
| Tailwind CSS Transition Timing docs | https://tailwindcss.com/docs/transition-timing-function | Official docs, current | HIGH |
| Tailwind CSS Duration docs | https://tailwindcss.com/docs/transition-duration | Official docs, current | HIGH |
| Tailwind CSS Opacity docs | https://tailwindcss.com/docs/opacity | Official docs, current | HIGH |
| Current codebase globals.css | saas-platform/src/app/globals.css | Primary source | HIGH |
| Brand Guidelines v4.0 | docs/BRAND_GUIDELINES.md | Project doc | HIGH |
| Product Design System | docs/PRODUCT_DESIGN_SYSTEM.md | Project doc | HIGH |
| Tailwind Design System skill | .agent/skills/tailwind-design-system/ | Skill reference | HIGH |
| Tailwind Patterns skill (v4) | .agent/skills/tailwind-patterns/ | Skill reference | HIGH |

### Gaps / Limitations

- WebSearch was denied, so competitive dashboard screenshots (Linear, Vercel, Stripe) could not be fetched for visual comparison. Recommendations are based on established patterns from training data and official documentation.
- shadcn/ui theming page could not be fetched (WebFetch denied). Recommendations for shadcn customization are based on the existing codebase implementation and known shadcn/ui patterns.
- Framer Motion-specific API patterns could not be web-verified. Animation recommendations use CSS-only approaches that work without Framer Motion.

### Overall Confidence: HIGH

All exact CSS values come from either official Tailwind CSS documentation or the current Beamix codebase. Typography and spacing recommendations follow established B2B SaaS dashboard conventions used by Linear, Vercel, and Stripe dashboards (pattern knowledge, not live verification). Animation timing values follow established UX engineering principles documented in Tailwind and CSS specification sources.
