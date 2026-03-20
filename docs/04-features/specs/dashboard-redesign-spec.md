# Beamix Dashboard — Complete Visual Redesign Specification

**Version:** 1.0
**Date:** 2026-03-17
**Author:** Design Lead
**Audience:** Frontend developers implementing the redesign. Read every section before touching a single file.
**Status:** Implementation-ready

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Visual Language](#2-visual-language)
3. [Component Redesign Specs](#3-component-redesign-specs)
4. [Animation Specifications](#4-animation-specifications)
5. [UX Improvements](#5-ux-improvements)
6. [CSS Utilities to Create](#6-css-utilities-to-create)
7. [Implementation Priority](#7-implementation-priority)
8. [Accessibility Constraints](#8-accessibility-constraints)
9. [RTL Support](#9-rtl-support)

---

## 1. Design Philosophy

### The Reference Bar

The Beamix dashboard should feel like it was built by the same team that made these products. Study them before implementing anything:

| Product | What to steal |
|---------|--------------|
| **Linear** | Sidebar density, keyboard-first feel, status indicators, monospace data values |
| **Vercel** | Clean deployment-state cards, subtle background textures, header treatment |
| **Raycast** | Command palette aesthetic, icon quality, surface depth via glass |
| **Arc Browser** | Color usage as meaning, not decoration; sidebar hierarchy |
| **Stripe Dashboard** | Data density without overwhelm, chart quality, empty state warmth |

### What "Premium" Means for This Product

Premium for Beamix is NOT:
- Bleeding-edge glassmorphism everywhere (that reads as a template, not a product)
- Dark mode only with neon accents (tech-bro, not Israeli SMB)
- Heavy animations that delay perception of data (the user wants answers, not a show)
- 3D cards, parallax, or scroll-jacking

Premium for Beamix IS:
- **Purposeful depth**: One level of glass on cards above a subtle page texture. Maximum two depth layers visible at any time.
- **Data feels alive**: Numbers count up on entry. Charts draw in. Score rings fill. But all within 600ms total.
- **Orange as signal, not decoration**: `#FF3C00` only on things that demand attention — the score, active states, CTAs. Never background fills of large areas.
- **Warmth through typography**: Fraunces serif for the score label or a testimonial-style insight message. Not for headings or body.
- **Whitespace as confidence**: Don't fill every pixel. Cards breathe. The layout trusts the user.

### The Emotional Design Contract

Every session the user opens the dashboard, they need to answer three questions in under 5 seconds:

1. **Am I getting better?** — Answered by the score + delta in the hero card.
2. **What do I do next?** — Answered by the top recommendation card, unmissable.
3. **Is anything wrong?** — Answered by the critical alerts (red), if any.

Every redesign decision must serve this hierarchy. Decorative elements that compete with this hierarchy must be removed.

---

## 2. Visual Language

### 2.1 Color System Refinements

**Keep the exact existing token names and hex values.** Do not introduce new primary or secondary colors. Enrich the system with glass overlays and gradient definitions built from the existing palette.

#### Enriched Light Mode Palette (additive — no breaking changes)

```css
/* Existing tokens — no change */
--background: #F7F7F7;
--card: #FFFFFF;
--primary: #FF3C00;
--border: #E5E7EB;

/* New glass overlay tokens */
--glass-bg: rgba(255, 255, 255, 0.72);
--glass-bg-strong: rgba(255, 255, 255, 0.88);
--glass-border: rgba(255, 255, 255, 0.6);
--glass-border-subtle: rgba(229, 231, 235, 0.5);

/* New surface depth tokens */
--surface-raised: #FFFFFF;
--surface-base: #F7F7F7;
--surface-sunken: #F0F0F0;

/* Primary glow (orange — for score cards, CTAs) */
--glow-primary: rgba(255, 60, 0, 0.12);
--glow-primary-strong: rgba(255, 60, 0, 0.20);

/* Score glow tokens (score-specific halo effects) */
--glow-excellent: rgba(6, 182, 212, 0.12);
--glow-good: rgba(16, 185, 129, 0.12);
--glow-fair: rgba(245, 158, 11, 0.12);
--glow-critical: rgba(239, 68, 68, 0.12);

/* Warm gradient system (cards, banners — not backgrounds) */
--gradient-warm-subtle: linear-gradient(135deg, rgba(255,60,0,0.04) 0%, rgba(255,60,0,0.01) 100%);
--gradient-warm-card: linear-gradient(135deg, #FFF5F2 0%, #FFFAF8 100%);
--gradient-orange-glow: radial-gradient(ellipse at top, rgba(255,60,0,0.08) 0%, transparent 70%);
```

#### Enriched Dark Mode Palette (additive)

```css
/* Existing tokens — no change */
--background: #0A0A0A;
--card: #171717;
--border: rgba(255,255,255,0.1);

/* New dark glass overlay tokens */
--glass-bg: rgba(23, 23, 23, 0.80);
--glass-bg-strong: rgba(23, 23, 23, 0.92);
--glass-border: rgba(255, 255, 255, 0.12);

/* Dark surface depth */
--surface-raised: #1C1C1C;
--surface-base: #0A0A0A;
--surface-sunken: #080808;

/* Primary glow (same orange — persists in dark) */
--glow-primary: rgba(255, 60, 0, 0.15);
--glow-primary-strong: rgba(255, 60, 0, 0.25);
```

### 2.2 Glassmorphism Specification

Glass is used on exactly three component types: the sidebar (subtle), modal overlays, and the score hero card. Nowhere else by default.

**Rules:**
- Glass only works when there is something behind it to blur. If the element sits directly on a flat `#F7F7F7` background with no texture, skip glass — it adds nothing.
- Backdrop-blur values: `8px` for subtle (sidebar), `16px` for medium (cards), `24px` for strong (modals).
- Always pair glass with a border: `1px solid var(--glass-border)`.
- Never apply glass to text containers. Text must be sharp.

```css
/* Levels of glass — use these class names */

.glass-subtle {
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--glass-border-subtle);
}

.glass-medium {
  background: var(--glass-bg-strong);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
}

.glass-strong {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--glass-border);
}

/* Dark mode overrides */
.dark .glass-subtle {
  background: rgba(23, 23, 23, 0.72);
  border-color: rgba(255, 255, 255, 0.08);
}
.dark .glass-medium {
  background: rgba(23, 23, 23, 0.85);
  border-color: rgba(255, 255, 255, 0.12);
}
.dark .glass-strong {
  background: rgba(23, 23, 23, 0.95);
  border-color: rgba(255, 255, 255, 0.15);
}
```

**Reduced-motion compliance**: All glass elements must degrade gracefully. The blur is visual enhancement only — never used to hide content.

### 2.3 Shadow System

The current shadow system is too flat (single-layer, low contrast). Replace with a layered approach that creates genuine depth.

```css
/* Shadow scale — add to @theme inline in globals.css */
--shadow-xs:    0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-sm:    0 1px 3px rgba(0, 0, 0, 0.08),  0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-md:    0 4px 12px rgba(0, 0, 0, 0.08),  0 2px 4px rgba(0, 0, 0, 0.04);
--shadow-lg:    0 10px 30px rgba(0, 0, 0, 0.10), 0 4px 8px rgba(0, 0, 0, 0.04);
--shadow-xl:    0 20px 48px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.06);

/* Component-specific */
--shadow-card:       var(--shadow-sm);
--shadow-card-hover: var(--shadow-lg);
--shadow-sidebar:    2px 0 16px rgba(0, 0, 0, 0.06);
--shadow-modal:      var(--shadow-xl);
--shadow-toast:      var(--shadow-lg);

/* Glow shadows (score cards only) */
--shadow-score-excellent: 0 0 48px rgba(6, 182, 212, 0.15),  0 8px 24px rgba(0, 0, 0, 0.06);
--shadow-score-good:      0 0 48px rgba(16, 185, 129, 0.15), 0 8px 24px rgba(0, 0, 0, 0.06);
--shadow-score-fair:      0 0 48px rgba(245, 158, 11, 0.15), 0 8px 24px rgba(0, 0, 0, 0.06);
--shadow-score-critical:  0 0 48px rgba(239, 68, 68, 0.15),  0 8px 24px rgba(0, 0, 0, 0.06);

/* Dark mode: reduce ambient shadow, increase directional shadow */
.dark {
  --shadow-card:       0 1px 3px rgba(0, 0, 0, 0.25), 0 1px 2px rgba(0, 0, 0, 0.15);
  --shadow-card-hover: 0 10px 30px rgba(0, 0, 0, 0.40), 0 4px 8px rgba(0, 0, 0, 0.20);
}
```

### 2.4 Gradient System (Product — Not Marketing)

These are for cards and section accents within the product, not the full-bleed marketing gradients from Framer.

```css
/* Product gradient definitions */

/* Score hero card: warm orange radial emanating from top */
.gradient-score-hero {
  background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(255,60,0,0.07) 0%, transparent 70%);
}

/* Pro upgrade banner inside sidebar/product */
.gradient-upgrade-card {
  background: linear-gradient(135deg, #FFF5F2 0%, #FFF0E8 50%, #FFFAF8 100%);
}
.dark .gradient-upgrade-card {
  background: linear-gradient(135deg, rgba(255,60,0,0.12) 0%, rgba(255,60,0,0.06) 100%);
}

/* Positive delta badge: subtle green wash */
.gradient-positive {
  background: linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.04) 100%);
}

/* Critical/warning badge wash */
.gradient-critical {
  background: linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(239,68,68,0.04) 100%);
}

/* Recommendation card: priority glow */
.gradient-action-cta {
  background: linear-gradient(135deg, rgba(255,60,0,0.06) 0%, transparent 60%);
  border: 1px solid rgba(255,60,0,0.15);
}
```

### 2.5 Typography Refinements

**No changes to fonts or the base scale.** Only add usage context for Fraunces and tighten heading spacing.

```css
/* Product-specific type utilities to add */

/* Score insight message — the human line below the score number */
.score-insight {
  font-family: var(--font-fraunces), Georgia, serif;
  font-weight: 300;
  font-size: 1rem;       /* 16px */
  line-height: 1.5;
  font-style: italic;
  color: var(--muted-foreground);
}

/* Page section eyebrow (already in system — keep) */
.section-eyebrow {
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: 0.6875rem;  /* 11px */
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted-foreground);
}

/* Metric value — large numbers in KPI cards */
.metric-value {
  font-family: var(--font-geist-mono), monospace;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
```

**Where Fraunces is allowed in the product:**
- The one-line "warm message" beneath the score number (max 12 words)
- Pull-quote style insight in the empty state for a first scan
- Section label on dark-bg CTA banners only (e.g. upgrade nudge)
- Nowhere else

---

## 3. Component Redesign Specs

### 3.1 Sidebar

**Current problem:** Flat white card, no depth, no personality. Active item feels like a colored text, not a selection indicator.

**Target:** Linear-style sidebar — tight, dense, with a surface that feels elevated from the page background. Active state has a pill shape with a subtle glow, not just a border.

**File:** `saas-platform/src/components/dashboard/sidebar.tsx`

#### Structure Changes

```tsx
/* Container — from flat bg-card to subtle glass on a slightly textured bg */
className={cn(
  'flex h-screen flex-col transition-all duration-300 ease-in-out',
  'bg-white/95 dark:bg-[#111111]/95',
  'border-e border-[#E5E7EB] dark:border-white/8',
  'shadow-[2px_0_16px_rgba(0,0,0,0.04)]',  /* subtle right-edge shadow */
  effectiveCollapsed ? 'w-16' : 'w-60',
)}
```

#### Logo Zone

```tsx
/* Logo header — slight height increase to 56px for better breathing room */
<div className="flex h-14 items-center justify-between border-b border-border px-4">
  {!effectiveCollapsed && (
    <Link href="/dashboard" className="flex items-center gap-1.5 group">
      {/* Orange dot mark — placeholder until real logo files arrive */}
      <span className="h-5 w-5 rounded-[4px] bg-primary flex-shrink-0
                       shadow-[0_0_0_3px_rgba(255,60,0,0.15)]
                       group-hover:shadow-[0_0_0_4px_rgba(255,60,0,0.2)]
                       transition-shadow duration-200" />
      <span className="font-sans text-[17px] font-semibold tracking-[-0.02em] text-foreground">
        Beam<span className="text-primary">ix</span>
      </span>
    </Link>
  )}
  {/* Collapse button — unchanged functionality, new style */}
  <button
    onClick={() => setCollapsed(!collapsed)}
    className="hidden rounded-md p-1.5 text-muted-foreground
               hover:bg-muted hover:text-foreground
               transition-colors duration-150 md:flex"
    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
  >
    {collapsed ? <ChevronsRight className="h-3.5 w-3.5" /> : <ChevronsLeft className="h-3.5 w-3.5" />}
  </button>
</div>
```

#### Trial Banner

```tsx
/* Trial banner — warmer, more actionable */
{trialDaysLeft !== null && trialDaysLeft > 0 && !effectiveCollapsed && (
  <div className="mx-3 mt-3 rounded-xl
                  bg-gradient-to-br from-[#FFF5F2] to-[#FFFAF8]
                  dark:from-[#FF3C00]/12 dark:to-[#FF3C00]/6
                  border border-[#FFCFC4] dark:border-[#FF3C00]/20
                  p-3 shadow-[0_2px_8px_rgba(255,60,0,0.06)]">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Crown className="h-3.5 w-3.5 text-primary flex-shrink-0" />
        <span className="text-xs font-semibold text-foreground">
          {trialDaysLeft}d left
        </span>
      </div>
      <Link
        href="/dashboard/settings"
        className="text-[10px] font-semibold text-primary
                   bg-primary/10 rounded-full px-2 py-0.5
                   hover:bg-primary/15 transition-colors duration-150"
      >
        Upgrade
      </Link>
    </div>
    {/* Progress bar for trial days */}
    <div className="mt-2 h-1 w-full rounded-full bg-border overflow-hidden">
      <div
        className="h-full rounded-full bg-primary transition-all duration-500"
        style={{ width: `${Math.min(100, (trialDaysLeft / 7) * 100)}%` }}
        aria-label={`${trialDaysLeft} of 7 trial days remaining`}
      />
    </div>
  </div>
)}
```

#### Navigation Items

```tsx
/* Active state — pill with orange glow, not left-border */
isActive
  ? cn(
      'relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium',
      'bg-primary/8 dark:bg-primary/12 text-primary',
      /* subtle inner shadow creates pressed/selected feel */
      'shadow-[inset_0_0_0_1px_rgba(255,60,0,0.15)]',
      'transition-all duration-150',
    )
  : cn(
      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium',
      'text-muted-foreground',
      'hover:bg-muted hover:text-foreground',
      'transition-all duration-150',
    )
```

**Collapsed state improvements:**
- Show tooltip on hover with item label (use `title` attribute — already implemented)
- Active collapsed icon: orange dot indicator `2px` below icon (absolute positioned)

#### Footer

```tsx
/* Footer — add user avatar, improve sign-out */
<div className="border-t border-border p-3 space-y-1">
  {!effectiveCollapsed && (
    <div className="flex items-center gap-2.5 mb-2 px-1">
      {/* Avatar placeholder */}
      <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
        <span className="text-[10px] font-semibold text-primary uppercase">
          {businessName.charAt(0)}
        </span>
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-foreground">{businessName}</p>
        <p className="text-[10px] text-muted-foreground capitalize">{planTier} plan</p>
      </div>
    </div>
  )}
  <button
    onClick={handleSignOut}
    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm
               text-muted-foreground transition-colors duration-150
               hover:bg-red-50 hover:text-red-600
               dark:hover:bg-red-950/50 dark:hover:text-red-400"
  >
    <LogOut className="h-4 w-4 shrink-0" />
    {!effectiveCollapsed && <span>Sign out</span>}
  </button>
</div>
```

---

### 3.2 Dashboard Shell

**Current problem:** The `bg-background` (#F7F7F7) flat gray background has no depth. Content area feels like a form document, not a premium SaaS product.

**Target:** Subtle noise texture + radial gradient at top to create environmental depth without being distracting.

**File:** `saas-platform/src/components/dashboard/dashboard-shell.tsx`

#### Background Treatment

Add to `globals.css` — a CSS noise texture layer:

```css
/* Page background with very subtle noise + orange warmth at top */
.dashboard-bg {
  background-color: #F7F7F7;
  background-image:
    radial-gradient(ellipse 120% 40% at 60% -5%, rgba(255,60,0,0.025) 0%, transparent 60%),
    url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.025'/%3E%3C/svg%3E");
  background-size: auto, 256px 256px;
}

.dark .dashboard-bg {
  background-color: #0A0A0A;
  background-image:
    radial-gradient(ellipse 100% 30% at 50% -10%, rgba(255,60,0,0.04) 0%, transparent 60%),
    url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
}
```

Apply on the `<main>` element:

```tsx
<main className="flex-1 overflow-y-auto pt-14 md:pt-0 dashboard-bg">
  <div className="max-w-7xl mx-auto p-6 lg:p-8">
    {children}
  </div>
</main>
```

#### Mobile Top Bar

```tsx
/* Mobile top bar — glassmorphism header */
<div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between px-4 md:hidden
                glass-medium border-b border-border/50">
```

---

### 3.3 Cards

**Current problem:** Single-layer flat white cards. The `.card-hover` lift exists but is subtle. Cards look identical — no visual hierarchy between hero cards and secondary info cards.

**Target:** Three card variants with distinct depth levels. All cards use `rounded-[20px]` (already defined). Hover states are more dramatic.

#### Card Variant Definitions

```tsx
/* Variant 1: Standard card — most content */
const cardBase = cn(
  'bg-card rounded-[20px] border border-border',
  'shadow-[var(--shadow-card)]',
  'transition-all duration-200 ease-out',
)

/* Variant 2: Interactive card — clickable, navigates somewhere */
const cardInteractive = cn(
  cardBase,
  'cursor-pointer',
  'hover:shadow-[var(--shadow-card-hover)]',
  'hover:-translate-y-1',
  'hover:border-border/80',
  /* Subtle gradient border on hover */
  'hover:before:absolute hover:before:inset-0 hover:before:rounded-[20px]',
)

/* Variant 3: Hero card — score display, primary KPI */
const cardHero = cn(
  'relative overflow-hidden',
  'bg-card rounded-[20px]',
  'border border-border',
  /* Layered shadow: ambient + directional */
  'shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_8px_24px_rgba(0,0,0,0.05)]',
)

/* Variant 4: Accent card — upgrade banner, CTAs */
const cardAccent = cn(
  'rounded-[20px] border border-[#FFCFC4] dark:border-[#FF3C00]/20',
  'bg-gradient-to-br from-[#FFF5F2] to-[#FFFAF8]',
  'dark:from-[#FF3C00]/10 dark:to-[#FF3C00]/5',
  'shadow-[0_2px_12px_rgba(255,60,0,0.08)]',
)
```

#### Hover Lift — Tailwind Classes to Apply

```tsx
/* Apply to any interactive card wrapping element */
className="group transition-all duration-200 ease-out hover:-translate-y-1
           hover:shadow-[0_10px_30px_rgba(0,0,0,0.10),_0_4px_8px_rgba(0,0,0,0.04)]
           cursor-pointer"
```

**Rule:** Only apply hover lift if the card navigates somewhere or opens a modal. Read-only stat cards should NOT lift — only content cards and agent cards.

---

### 3.4 Score Display

**Current problem:** Score is a large monospace number with a text color. No visual container, no ring, no sense of "this is the most important number."

**Target:** Animated circular progress ring around the score number. Ring fills on page entry. Score number counts up from 0. Below the number: a one-line Fraunces italic insight message.

#### Score Ring Component

**New file:** `saas-platform/src/components/ui/score-ring.tsx`

```tsx
'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface ScoreRingProps {
  score: number | null
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animate?: boolean
  className?: string
}

/*
  SVG-based circular progress ring.
  - Size sm: 80px (sidebar compact display)
  - Size md: 120px (rankings cards)
  - Size lg: 160px (hero score on overview)
*/

const SIZE_MAP = {
  sm:  { outer: 80,  stroke: 6,  fontSize: 'text-xl' },
  md:  { outer: 120, stroke: 8,  fontSize: 'text-3xl' },
  lg:  { outer: 160, stroke: 10, fontSize: 'text-5xl' },
}

function getScoreColor(score: number | null): string {
  if (score === null) return '#E5E7EB'
  if (score >= 75) return '#06B6D4'  /* score-excellent */
  if (score >= 50) return '#10B981'  /* score-good */
  if (score >= 25) return '#F59E0B'  /* score-fair */
  return '#EF4444'                    /* score-critical */
}

function getScoreGlowClass(score: number | null): string {
  if (score === null) return ''
  if (score >= 75) return 'drop-shadow-[0_0_12px_rgba(6,182,212,0.40)]'
  if (score >= 50) return 'drop-shadow-[0_0_12px_rgba(16,185,129,0.40)]'
  if (score >= 25) return 'drop-shadow-[0_0_12px_rgba(245,158,11,0.40)]'
  return 'drop-shadow-[0_0_12px_rgba(239,68,68,0.40)]'
}

export function ScoreRing({
  score,
  size = 'lg',
  showLabel = true,
  animate = true,
  className,
}: ScoreRingProps) {
  const progressRef = useRef<SVGCircleElement>(null)
  const config = SIZE_MAP[size]
  const radius = (config.outer / 2) - (config.stroke / 2) - 4
  const circumference = 2 * Math.PI * radius
  const normalized = score !== null ? Math.max(0, Math.min(100, score)) : 0
  const strokeDashoffset = circumference - (normalized / 100) * circumference

  useEffect(() => {
    if (!animate || !progressRef.current) return
    /* Start from full offset (empty ring), animate to target */
    const el = progressRef.current
    el.style.strokeDashoffset = String(circumference)
    el.style.transition = 'none'
    /* Force reflow */
    el.getBoundingClientRect()
    el.style.transition = 'stroke-dashoffset 1200ms cubic-bezier(0.22, 1, 0.36, 1)'
    el.style.strokeDashoffset = String(strokeDashoffset)
  }, [score, circumference, strokeDashoffset, animate])

  const cx = config.outer / 2
  const cy = config.outer / 2
  const color = getScoreColor(score)

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: config.outer, height: config.outer }}
    >
      <svg
        width={config.outer}
        height={config.outer}
        viewBox={`0 0 ${config.outer} ${config.outer}`}
        className={cn(
          '-rotate-90',  /* Start ring at top */
          animate && score !== null ? getScoreGlowClass(score) : '',
        )}
        aria-hidden="true"
      >
        {/* Track ring */}
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.stroke}
          className="text-border opacity-40"
        />
        {/* Progress ring */}
        <circle
          ref={progressRef}
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={config.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animate ? circumference : strokeDashoffset}
          style={!animate ? { transition: 'none' } : undefined}
        />
      </svg>

      {/* Score number — centered inside ring */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {score !== null ? (
          <>
            <CountUpNumber
              value={score}
              className={cn('font-mono font-bold tabular-nums', config.fontSize)}
              style={{ color }}
            />
            {showLabel && (
              <span className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                /100
              </span>
            )}
          </>
        ) : (
          <span className={cn('font-mono font-bold tabular-nums text-muted-foreground/40', config.fontSize)}>
            --
          </span>
        )}
      </div>
    </div>
  )
}

/* Simple count-up animation component */
function CountUpNumber({
  value,
  className,
  style,
}: { value: number; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const start = 0
    const end = value
    const duration = 1000 /* ms — matches ring animation */
    const startTime = performance.now()

    function update(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      /* Ease-out cubic */
      const eased = 1 - Math.pow(1 - progress, 3)
      el.textContent = String(Math.round(start + (end - start) * eased))
      if (progress < 1) requestAnimationFrame(update)
    }

    requestAnimationFrame(update)
  }, [value])

  return <span ref={ref} className={className} style={style}>{value}</span>
}
```

**Usage in DashboardOverview:**

```tsx
/* Replace the raw monospace number block with: */
<ScoreRing score={score} size="lg" animate={true} />

/* Below the ring, the Fraunces warm message */
{scoreInfo && (
  <p className="score-insight text-center mt-3 max-w-[200px]">
    {warmMessage}
  </p>
)}
```

---

### 3.5 Charts

**Current problem:** Area charts use default Recharts styling. Lines are thin, no gradient fill, tooltips are basic.

**Target:** Gradient-filled area charts, animated entry, custom tooltip with brand styling.

#### Chart Gradient Fills (add to globals.css)

```css
/* Referenced as linearGradient id in SVG defs */
/* Each chart that uses AreaChart must include these SVG defs */
```

#### Chart Component Pattern

```tsx
/* Gradient fill definition — include inside <AreaChart> as children */
<defs>
  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
    <stop offset="5%"  stopColor="#FF3C00" stopOpacity={0.15} />
    <stop offset="95%" stopColor="#FF3C00" stopOpacity={0}    />
  </linearGradient>
  <linearGradient id="mentionGradient" x1="0" y1="0" x2="0" y2="1">
    <stop offset="5%"  stopColor="#10B981" stopOpacity={0.12} />
    <stop offset="95%" stopColor="#10B981" stopOpacity={0}    />
  </linearGradient>
</defs>

/* Area with gradient */
<Area
  type="monotone"
  dataKey="score"
  stroke="#FF3C00"
  strokeWidth={2.5}
  fill="url(#scoreGradient)"
  dot={false}
  activeDot={{ r: 4, fill: '#FF3C00', stroke: 'white', strokeWidth: 2 }}
  isAnimationActive={true}
  animationDuration={800}
  animationEasing="ease-out"
/>
```

#### Custom Chart Tooltip

```tsx
/* Branded tooltip — replace default Recharts tooltip */
function BrandedTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  return (
    <div className={cn(
      'rounded-xl border border-border bg-card px-3 py-2',
      'shadow-[0_8px_24px_rgba(0,0,0,0.10)]',
      'text-xs font-medium text-foreground',
      'backdrop-blur-[8px]',
    )}>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full flex-shrink-0"
            style={{ background: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold tabular-nums">{entry.value}</span>
        </div>
      ))}
      {label && <div className="mt-1 text-[10px] text-muted-foreground">{label}</div>}
    </div>
  )
}
```

#### Chart Axis Styling

```tsx
/* Consistent axis styling across all charts */
const axisProps = {
  tick:  { fontSize: 11, fill: '#6B7280', fontFamily: 'var(--font-inter)' },
  axisLine: false,
  tickLine: false,
}

<XAxis {...axisProps} dataKey="date" />
<YAxis {...axisProps} domain={[0, 100]} tickCount={5} />
<CartesianGrid
  strokeDasharray="3 3"
  stroke="currentColor"
  className="text-border/50"
  vertical={false}
/>
```

---

### 3.6 Action Queue (Recommendations)

**Current problem:** Recommendations are a list of cards with colored badges. The top recommendation doesn't feel like "the one thing to do." Priority is indicated by color but not by visual weight.

**Target:** Top recommendation is a full-width hero card with an orange gradient edge, prominent CTA button, and a single-action UI. Secondary recommendations are a compact list with inline priority indicators.

#### Top Recommendation Card

```tsx
/* Top recommendation — hero treatment */
<div className={cn(
  'relative overflow-hidden rounded-[20px]',
  'border border-[#FFCFC4] dark:border-[#FF3C00]/20',
  'bg-white dark:bg-card',
  /* Left orange accent bar */
  'before:absolute before:inset-y-0 before:start-0',
  'before:w-1 before:rounded-s-[20px]',
  'before:bg-gradient-to-b before:from-[#FF3C00] before:to-[#FF3C00]/50',
  'ps-6 pe-5 py-5',
  /* Subtle inner glow */
  'shadow-[inset_4px_0_12px_rgba(255,60,0,0.04),_0_4px_16px_rgba(0,0,0,0.06)]',
)}>
  {/* Priority badge */}
  <div className="flex items-center gap-2 mb-3">
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full px-2 py-0.5',
      'text-[10px] font-bold uppercase tracking-wider',
      priorityStyles[topRec.priority].badge,
    )}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {topRec.priority}
    </span>
    {topRec.suggested_agent && (
      <span className="text-xs text-muted-foreground">
        — {AGENT_LABELS[topRec.suggested_agent] ?? topRec.suggested_agent}
      </span>
    )}
  </div>

  {/* Title + description */}
  <h3 className="text-base font-semibold text-foreground leading-snug mb-1.5">
    {topRec.title}
  </h3>
  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
    {topRec.description}
  </p>

  {/* CTA */}
  <div className="flex items-center gap-3">
    <Button
      size="sm"
      className="rounded-lg bg-primary text-white
                 hover:bg-[#e63600] active:scale-[0.98]
                 transition-all duration-150
                 shadow-[0_2px_8px_rgba(255,60,0,0.25)]
                 hover:shadow-[0_4px_16px_rgba(255,60,0,0.35)]"
    >
      <Sparkles className="me-1.5 h-3.5 w-3.5" />
      Run Agent
    </Button>
    {topRec.credits_cost !== null && (
      <span className="text-xs text-muted-foreground">
        {topRec.credits_cost} {topRec.credits_cost === 1 ? 'credit' : 'credits'}
      </span>
    )}
  </div>
</div>
```

#### Secondary Recommendations (compact list)

```tsx
/* Compact list for rest of recommendations */
<div className="space-y-2 mt-4">
  {restRecs.map((rec) => (
    <div key={rec.id} className={cn(
      'flex items-start gap-3 rounded-xl px-4 py-3',
      'border border-border hover:border-border/80',
      'bg-card hover:bg-muted/30',
      'transition-all duration-150 cursor-pointer',
      'group',
    )}>
      {/* Priority dot */}
      <span className={cn(
        'mt-1 h-2 w-2 rounded-full flex-shrink-0',
        rec.priority === 'critical' ? 'bg-[#EF4444]' :
        rec.priority === 'high'     ? 'bg-[#FF3C00]' :
        rec.priority === 'medium'   ? 'bg-[#F59E0B]' : 'bg-[#10B981]',
      )} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{rec.title}</p>
        {rec.suggested_agent && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {AGENT_LABELS[rec.suggested_agent]}
          </p>
        )}
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0
                               group-hover:text-muted-foreground
                               group-hover:translate-x-0.5
                               transition-all duration-150" />
    </div>
  ))}
</div>
```

---

### 3.7 Engine Breakdown

**Current problem:** Engine results are generic colored badges. No sense of per-engine personality.

**Target:** Per-engine cards with consistent brand color coding, rank badge (1/2/3 podium style), and a mention indicator.

#### Engine Card

```tsx
const ENGINE_META = {
  chatgpt:    { label: 'ChatGPT',    color: '#10A37F', bg: 'rgba(16,163,127,0.08)',  border: 'rgba(16,163,127,0.15)' },
  gemini:     { label: 'Gemini',     color: '#4285F4', bg: 'rgba(66,133,244,0.08)',  border: 'rgba(66,133,244,0.15)' },
  perplexity: { label: 'Perplexity', color: '#7C3AED', bg: 'rgba(124,58,237,0.08)',  border: 'rgba(124,58,237,0.15)' },
  claude:     { label: 'Claude',     color: '#FF3C00', bg: 'rgba(255,60,0,0.08)',     border: 'rgba(255,60,0,0.15)'   },
  grok:       { label: 'Grok',       color: '#0A0A0A', bg: 'rgba(10,10,10,0.06)',     border: 'rgba(10,10,10,0.12)'   },
}

/* Engine card — used in rankings page and overview engine strip */
<div className={cn(
  'flex items-center gap-3 rounded-xl px-4 py-3',
  'border transition-all duration-150',
)}
style={{
  background: meta.bg,
  borderColor: meta.border,
}}>
  {/* Engine color dot */}
  <span
    className="h-3 w-3 rounded-full flex-shrink-0 shadow-[0_0_6px_currentColor]"
    style={{ background: meta.color, color: meta.color }}
  />

  <span className="text-sm font-medium text-foreground flex-1">{meta.label}</span>

  {/* Rank badge */}
  {rankPosition !== null ? (
    <span className={cn(
      'inline-flex h-6 w-6 items-center justify-center rounded-full',
      'text-xs font-bold tabular-nums',
      rankPosition === 1 ? 'bg-[#F59E0B]/15 text-[#F59E0B]' :
      rankPosition === 2 ? 'bg-muted text-muted-foreground' :
      rankPosition === 3 ? 'bg-[#CD7F32]/15 text-[#CD7F32]' :
                           'bg-muted text-muted-foreground',
    )}>
      {rankPosition}
    </span>
  ) : (
    <span className="text-xs text-muted-foreground">Not ranked</span>
  )}

  {/* Mention indicator */}
  <span className={cn(
    'text-xs font-medium rounded-full px-2 py-0.5',
    isMentioned
      ? 'bg-green-50 text-[#10B981] dark:bg-green-950/50'
      : 'bg-muted text-muted-foreground',
  )}>
    {isMentioned ? 'Mentioned' : 'Not mentioned'}
  </span>
</div>
```

---

### 3.8 Agent Cards

**Current problem:** Agent cards on the hub page are simple cards with a title and description. No status, no last-run context.

**Target:** Cards show agent "personality" through icons, display last run status as a subtle badge, and reveal detail on hover.

#### Agent Card

```tsx
/* Agent hub card — full component spec */
<div className={cn(
  'group relative rounded-[20px] border border-border bg-card p-5',
  'shadow-[var(--shadow-card)]',
  'hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1',
  'transition-all duration-200 ease-out cursor-pointer',
  /* On hover: reveal run button */
  'overflow-hidden',
)}>
  {/* Agent icon + status indicator */}
  <div className="flex items-start justify-between mb-3">
    <div className={cn(
      'h-10 w-10 rounded-xl flex items-center justify-center',
      'bg-primary/8 text-primary',
      'transition-all duration-200',
      'group-hover:bg-primary/15 group-hover:scale-105',
    )}>
      <AgentIcon className="h-5 w-5" />
    </div>
    {lastRunStatus && (
      <span className={cn(
        'text-[10px] font-medium rounded-full px-2 py-0.5',
        lastRunStatus === 'completed' ? 'bg-green-50 text-[#10B981]' :
        lastRunStatus === 'running'   ? 'bg-[#FFF5F2] text-primary' :
        lastRunStatus === 'failed'    ? 'bg-red-50 text-[#EF4444]'  :
                                        'bg-muted text-muted-foreground',
      )}>
        {lastRunStatus === 'running' && (
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse me-1" />
        )}
        {lastRunStatus}
      </span>
    )}
  </div>

  {/* Agent name + description */}
  <h3 className="text-sm font-semibold text-foreground mb-1">{agent.name}</h3>
  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
    {agent.description}
  </p>

  {/* Credits cost */}
  <div className="mt-3 flex items-center gap-2">
    <span className="text-xs text-muted-foreground">
      <span className="font-medium text-foreground">{agent.creditsCost}</span> credit{agent.creditsCost !== 1 ? 's' : ''}
    </span>
  </div>

  {/* Run button — revealed on hover via transform */}
  <div className={cn(
    'absolute bottom-0 inset-x-0 px-5 py-4',
    'bg-gradient-to-t from-card via-card/95 to-transparent',
    'translate-y-full group-hover:translate-y-0',
    'transition-transform duration-200 ease-out',
  )}>
    <Button size="sm" className="w-full rounded-lg bg-primary text-white
                                  hover:bg-[#e63600] text-xs">
      <Sparkles className="me-1.5 h-3 w-3" />
      Run Agent
    </Button>
  </div>
</div>
```

---

### 3.9 Chat Interface (Agent Execution)

**Current problem:** The agent chat at `/dashboard/agent/[id]` is a basic message list. Lacks the premium feel of modern AI chat UIs.

**Target:** Streaming-aware, bubble-style conversation UI with typing indicators, distinct styling for user vs agent messages, and output saved as a card below.

#### Chat Layout

```tsx
/* Two-panel layout for /dashboard/agents/[jobId] */
<div className="flex h-[calc(100vh-theme(spacing.14))] gap-4 md:h-screen md:gap-6">

  {/* Left: Agent info + context panel — fixed 280px */}
  <aside className="hidden md:flex md:w-[280px] flex-col gap-4">
    {/* Agent identity card */}
    <div className="rounded-[20px] border border-border bg-card p-5">
      <div className="h-12 w-12 rounded-xl bg-primary/8 flex items-center justify-center mb-3">
        <AgentIcon className="h-6 w-6 text-primary" />
      </div>
      <h2 className="text-base font-semibold text-foreground">{agentName}</h2>
      <p className="text-sm text-muted-foreground mt-1">{agentDescription}</p>
    </div>
    {/* Job status */}
    {/* Input/context used */}
  </aside>

  {/* Right: Chat panel — flex-1 */}
  <main className="flex flex-1 flex-col rounded-[20px] border border-border bg-card overflow-hidden">

    {/* Messages */}
    <div className="flex-1 overflow-y-auto p-5 space-y-4">
      {messages.map((msg) => (
        <ChatBubble key={msg.id} message={msg} />
      ))}
      {isStreaming && <TypingIndicator />}
    </div>

    {/* Input bar */}
    <div className="border-t border-border p-4">
      <div className="flex gap-3 items-end">
        <textarea
          className="flex-1 resize-none rounded-xl border border-border bg-muted/30
                     px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground
                     focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1
                     transition-all duration-200 min-h-[44px] max-h-[120px]"
          placeholder="Guide the agent..."
          rows={1}
        />
        <Button
          size="icon"
          className="h-11 w-11 rounded-xl bg-primary text-white flex-shrink-0
                     hover:bg-[#e63600] transition-all duration-150
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </main>
</div>
```

#### Chat Bubble

```tsx
/* User message — right-aligned, orange */
const userBubble = cn(
  'max-w-[75%] ms-auto',
  'rounded-[16px] rounded-te-[4px]',  /* top-end corner reduced for "tail" feel */
  'bg-primary text-white px-4 py-3',
  'text-sm leading-relaxed',
)

/* Agent message — left-aligned, card style */
const agentBubble = cn(
  'max-w-[85%]',
  'rounded-[16px] rounded-ts-[4px]',
  'bg-muted/60 dark:bg-muted/30 text-foreground px-4 py-3',
  'text-sm leading-relaxed',
  'border border-border/50',
)
```

#### Typing Indicator

```tsx
function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce"
            style={{ animationDelay: `${i * 150}ms`, animationDuration: '1s' }}
          />
        ))}
      </div>
      <span className="text-xs">Agent is thinking...</span>
    </div>
  )
}
```

---

### 3.10 Forms and Inputs

**Current problem:** Inputs look like bare Shadcn defaults. Focus state is a thin ring. No icon color transitions.

**Target:** Focus triggers a subtle glow expansion. Icons transition from muted to foreground on focus. Validation feedback is immediate and non-jarring.

#### Input Focus Treatment

```css
/* Add to globals.css @layer components */
.input-enhanced {
  @apply rounded-lg border border-border bg-background px-3 py-2;
  @apply text-sm text-foreground placeholder:text-muted-foreground;
  @apply transition-all duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-ring/60 focus:ring-offset-1;
  @apply focus:border-ring/80;
  /* Subtle glow on focus */
  @apply focus:shadow-[0_0_0_4px_rgba(255,60,0,0.08)];
}

.input-enhanced.error {
  @apply border-destructive focus:ring-destructive/60;
  @apply focus:shadow-[0_0_0_4px_rgba(239,68,68,0.08)];
}

.input-enhanced.success {
  @apply border-[#10B981] focus:ring-[#10B981]/60;
}
```

#### Input with Icon Container

```tsx
/* Use this pattern for all icon-left inputs */
<div className="relative group">
  <Mail
    className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2
               text-muted-foreground
               group-focus-within:text-primary
               transition-colors duration-200"
  />
  <Input
    className="ps-10 input-enhanced"
    {...rest}
  />
</div>
```

---

### 3.11 Buttons

**Current problem:** Hover states are color shifts only. No depth on the primary button.

**Target:** Primary button has a shadow that lifts on hover. Press feels like a physical click via scale-down.

```tsx
/* Primary button — add shadow + press effect */
className="bg-primary text-white rounded-lg
           shadow-[0_2px_8px_rgba(255,60,0,0.20)]
           hover:bg-[#e63600]
           hover:shadow-[0_4px_16px_rgba(255,60,0,0.30)]
           hover:-translate-y-[1px]
           active:translate-y-0 active:scale-[0.98]
           active:shadow-[0_1px_4px_rgba(255,60,0,0.15)]
           transition-all duration-150 ease-out"

/* Loading state — in addition to disabled opacity */
{isLoading && (
  <Loader2 className="me-2 h-4 w-4 animate-spin" aria-hidden="true" />
)}

/* Ghost button — improved hover */
className="text-muted-foreground rounded-lg
           hover:bg-muted hover:text-foreground
           active:scale-[0.98]
           transition-all duration-150"
```

---

### 3.12 Navigation

**Breadcrumbs** — Add to all sub-pages of the dashboard.

```tsx
/* Page header with breadcrumb */
<div className="flex flex-col gap-1 mb-6">
  {/* Breadcrumb */}
  <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
    <Link href="/dashboard" className="hover:text-foreground transition-colors duration-150">
      Dashboard
    </Link>
    <ChevronRight className="h-3 w-3" aria-hidden="true" />
    <span className="text-foreground font-medium">{currentPageLabel}</span>
  </nav>
  {/* Page title */}
  <h1 className="text-2xl font-medium text-foreground tracking-tight">{pageTitle}</h1>
</div>
```

**Page transitions** — Wrap page content in an entry animation container:

```tsx
/* Wrap page-level content (not the shell) */
<div className="animate-fade-up">
  {children}
</div>
```

---

### 3.13 Empty States

**Current problem:** Empty states are text + icon. No warmth, no real CTA prominence.

**Target:** Centered card with a larger illustrated icon area, a warm Fraunces italic line, and a prominent orange CTA.

```tsx
function EmptyState({
  icon: Icon,
  title,
  description,
  cta,
  ctaHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center
                    text-center py-16 px-8 max-w-sm mx-auto">
      {/* Icon container — large, orange-wash */}
      <div className={cn(
        'h-16 w-16 rounded-2xl mb-5',
        'bg-gradient-to-br from-[#FFF5F2] to-[#FFFAF8]',
        'dark:from-[#FF3C00]/10 dark:to-[#FF3C00]/5',
        'border border-[#FFCFC4]/60 dark:border-[#FF3C00]/15',
        'flex items-center justify-center',
        'shadow-[0_2px_8px_rgba(255,60,0,0.08)]',
      )}>
        <Icon className="h-7 w-7 text-primary" />
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>

      {/* Fraunces italic description for warmth */}
      <p className="score-insight mb-6">{description}</p>

      {cta && ctaHref && (
        <Link href={ctaHref}>
          <Button
            className="rounded-lg bg-primary text-white
                       shadow-[0_2px_8px_rgba(255,60,0,0.20)]
                       hover:bg-[#e63600] hover:shadow-[0_4px_16px_rgba(255,60,0,0.30)]
                       transition-all duration-150"
          >
            {cta}
            <ArrowRight className="ms-2 h-4 w-4" />
          </Button>
        </Link>
      )}
    </div>
  )
}
```

---

### 3.14 Loading States

**Current problem:** Skeleton elements use `animate-pulse bg-muted`. They are accurate in shape but feel mechanical.

**Target:** Shimmer animation instead of pulse. Skeletons match exact component shapes.

#### Shimmer Keyframe

```css
/* Add to globals.css */
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
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
```

#### Skeleton Component Pattern

```tsx
/* Replace animate-pulse with skeleton-shimmer */
<div className="skeleton-shimmer rounded-lg h-4 w-3/4" />

/* Score ring skeleton */
<div className="skeleton-shimmer rounded-full h-[160px] w-[160px]" />

/* Card skeleton — matches card shape exactly */
<div className="rounded-[20px] border border-border bg-card p-6 space-y-3">
  <div className="skeleton-shimmer rounded-lg h-4 w-1/3" />
  <div className="skeleton-shimmer rounded-lg h-10 w-1/2" />
  <div className="skeleton-shimmer rounded-lg h-3 w-full" />
  <div className="skeleton-shimmer rounded-lg h-3 w-4/5" />
</div>
```

---

### 3.15 Toast Notifications

**Current problem:** No custom toast system spec defined. Shadcn's default sonner or Toaster.

**Target:** Top-right slide-in toasts with type icons, orange accent for success actions.

#### Toast Variants

```tsx
/* Use sonner (already in project via shadcn) with custom styling */

/* Success toast */
toast.success('Agent completed successfully', {
  description: 'Content saved to your library.',
  icon: <CheckCircle2 className="h-4 w-4 text-[#10B981]" />,
  duration: 4000,
  style: {
    borderLeft: '3px solid #10B981',
  },
})

/* Error toast */
toast.error('Scan failed', {
  description: 'Check your settings and try again.',
  icon: <XCircle className="h-4 w-4 text-[#EF4444]" />,
  duration: 6000,
  style: {
    borderLeft: '3px solid #EF4444',
  },
})

/* Info / action toast */
toast('Agent running', {
  description: 'Results will appear in a few moments.',
  icon: <Loader2 className="h-4 w-4 text-primary animate-spin" />,
  duration: Infinity, /* dismiss on completion */
  style: {
    borderLeft: '3px solid #FF3C00',
  },
})
```

**Toast position:** top-right on desktop. Bottom-center on mobile (thumb reach zone).

```tsx
/* In layout.tsx */
<Toaster
  position="top-right"
  toastOptions={{
    style: {
      borderRadius: '12px',
      border: '1px solid var(--border)',
      background: 'var(--card)',
      color: 'var(--foreground)',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.10)',
    },
  }}
/>
```

---

### 3.16 Login / Auth Pages

**Current problem:** Login card is centered on a plain `#F7F7F7` background. Feels generic.

**Target:** Two-panel layout on desktop (brand left, form right). Mobile: single column with brand accent at top.

#### Login Page Layout

```tsx
/* src/app/(auth)/login/page.tsx */
<div className="min-h-screen flex">

  {/* Left panel — brand statement, desktop only */}
  <div className="hidden lg:flex lg:w-[480px] xl:w-[560px]
                  flex-col justify-between
                  bg-[#0A0A0A] text-white p-12">
    {/* Logo */}
    <div className="flex items-center gap-2">
      <span className="h-5 w-5 rounded-[4px] bg-primary" />
      <span className="font-sans text-lg font-semibold">
        Beam<span className="text-primary">ix</span>
      </span>
    </div>

    {/* Brand statement — Fraunces italic */}
    <div>
      <p className="font-[var(--font-fraunces)] text-3xl font-light italic leading-snug text-white/90 mb-4">
        "Stop being invisible to AI search."
      </p>
      <p className="text-sm text-white/50">
        Scan. Diagnose. Fix. Repeat.
      </p>
    </div>

    {/* Social proof snippet */}
    <div className="text-xs text-white/30">
      Trusted by 400+ SMBs
    </div>
  </div>

  {/* Right panel — form */}
  <div className="flex flex-1 flex-col items-center justify-center
                  bg-background px-6 py-12">
    {/* Mobile logo (hidden on lg+) */}
    <div className="lg:hidden mb-8 text-center">
      <span className="font-sans text-2xl font-semibold text-foreground">
        Beam<span className="text-primary">ix</span>
      </span>
    </div>

    <div className="w-full max-w-[400px]">
      <LoginForm />
    </div>
  </div>
</div>
```

---

## 4. Animation Specifications

All animations must respect `prefers-reduced-motion: reduce`. Wrap all animation values in a hook:

```tsx
/* src/hooks/use-reduced-motion.ts */
import { useEffect, useState } from 'react'

export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return prefersReduced
}
```

### Page Entry Animation

**Applied to:** The outermost `<div>` in every dashboard page.

```css
/* In globals.css */
@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}

@keyframes draw-ring {
  from { stroke-dashoffset: var(--ring-circumference); }
  to   { stroke-dashoffset: var(--ring-offset); }
}

.animate-fade-up {
  animation: fade-up 400ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.animate-fade-in {
  animation: fade-in 300ms ease-out both;
}

.animate-scale-in {
  animation: scale-in 250ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* Staggered children — apply delay via style prop */
/* e.g. style={{ animationDelay: `${index * 60}ms` }} */

@media (prefers-reduced-motion: reduce) {
  .animate-fade-up,
  .animate-fade-in,
  .animate-scale-in {
    animation: none;
  }
}
```

### Animation Timing Reference

| Interaction | Duration | Easing | Notes |
|-------------|----------|--------|-------|
| Page entry | 400ms | `cubic-bezier(0.22, 1, 0.36, 1)` | Whole page fade-up |
| Card stagger | 60ms per child | Same | Max 6 children staggered |
| Score ring fill | 1200ms | `cubic-bezier(0.22, 1, 0.36, 1)` | Score is the star |
| Score count-up | 1000ms | Ease-out cubic | Matches ring |
| Card hover lift | 200ms | `ease-out` | translateY(-4px) |
| Card hover shadow | 200ms | `ease-out` | Shadow expansion |
| Button hover | 150ms | `ease-out` | Color + shadow |
| Button press | 100ms | `ease-in` | scale(0.98) |
| Button release | 150ms | `ease-out` | Back to normal |
| Sidebar collapse | 300ms | `ease-in-out` | Width transition |
| Toast enter | 280ms | `cubic-bezier(0.22, 1, 0.36, 1)` | Slide from right |
| Toast exit | 200ms | `ease-in` | Fade out |
| Input focus glow | 200ms | `ease-out` | Box-shadow expansion |
| Chart draw-in | 800ms | `ease-out` | Recharts isAnimationActive |
| Typing indicator | Infinite | `ease-in-out` | Each dot 1s, staggered |
| Skeleton shimmer | 1800ms | `ease-in-out` | Infinite |
| Modal enter | 200ms | `cubic-bezier(0.22, 1, 0.36, 1)` | Scale-in |
| Dropdown open | 150ms | `ease-out` | Fade + scale from origin |

---

## 5. UX Improvements

### 5.1 "Am I Getting Better?" — Making the Answer Unmissable

**Current state:** The score number exists but has no contextual anchor. No week-over-week movement is visible at a glance.

**Changes:**
1. The score ring (Section 3.4) makes the number feel like a gauge, not a stat.
2. The delta badge (`+7 since last scan`) is now positioned directly under the number inside the ring container — never off to the side.
3. Color of the ring itself communicates level: cyan for excellent, green for good, amber for fair, red for critical. Users learn this in one session.
4. The warm Fraunces message below the ring gives an emotional anchor: "Growing steadily. Keep it up."
5. The sparkline trend chart moves to the right of the score ring, same card — the visual connection is immediate.

**Layout spec for the hero card:**

```
┌─────────────────────────────────────────────────────────────────┐
│  [Score Ring 160px]   │   Sparkline (28 days)                   │
│  Score: 74            │   ~~~~~~~~                              │
│  +7 since last scan   │                                         │
│  "Growing steadily."  │   3 scans | Last: 2 days ago            │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 "What Do I Do Next?" — Making the CTA Unmissable

**Current state:** Recommendations are a section of cards. The top recommendation is not visually distinguished from the others.

**Changes:**
1. The top recommendation card (Section 3.6) has a 4px orange left border, an orange inner glow, and the "Run Agent" button is primary-colored and shadowed.
2. The credit cost is shown inline — no friction to knowing the cost.
3. On mobile, the top recommendation card is placed immediately below the score hero card, before any other content.
4. A badge reading "Top action" or "Critical" replaces the generic priority label.

### 5.3 Weekly Ritual Design

The dashboard should feel like something worth opening. Design decisions:

1. **Scan history cadence**: If the user hasn't scanned in 7+ days, show a gentle nudge banner below the score card: "Your last scan was 12 days ago — run a fresh scan to see your current position." Warm, not alarming.

2. **Agent activity feed**: Instead of a list of recent agent runs, show a feed with time context: "Content Writer ran 3 days ago — view result." This makes the dashboard feel alive and connected.

3. **Progress anchoring**: Show a 4-week score chart (not just a sparkline) in a collapsible section. The longer view helps users see progress even when weekly deltas are small.

### 5.4 Emotional Design

**Celebrating wins:**
```tsx
/* Show when scoreDelta > 0 and score crosses a threshold */
{scoreDelta > 0 && didCrossThreshold && (
  <div className="rounded-xl bg-green-50 dark:bg-green-950/30
                  border border-green-100 dark:border-green-900/50
                  px-4 py-3 flex items-center gap-3 mb-4">
    <Sparkles className="h-5 w-5 text-[#10B981] flex-shrink-0" />
    <div>
      <p className="text-sm font-semibold text-foreground">
        Your score crossed {nextThreshold}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">
        You moved from {previousLevel} to {newLevel} visibility.
      </p>
    </div>
  </div>
)}
```

**Encouraging on drops:**
```tsx
{scoreDelta !== null && scoreDelta < -3 && (
  <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30
                  border border-amber-100 dark:border-amber-900/50
                  px-4 py-3 flex items-center gap-3 mb-4">
    <AlertTriangle className="h-5 w-5 text-[#F59E0B] flex-shrink-0" />
    <div>
      <p className="text-sm font-semibold text-foreground">
        Slight dip — easy to recover
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">
        Run the Content Writer agent to push visibility back up.
      </p>
    </div>
  </div>
)}
```

### 5.5 Progressive Disclosure

**Rule:** Never show more than 5 recommendations on the overview page. Show a "See all {n} actions" link to `/dashboard/recommendations`.

**Rule:** Charts are collapsed by default on mobile. Tap to expand. On desktop they are always visible.

**Rule:** Engine breakdown on the overview shows only the 3 most important engines by default. A "See all engines" chevron expands the rest inline without navigation.

---

## 6. CSS Utilities to Create

Add the following to `globals.css` under `@layer components`:

### Glass Utilities

```css
@layer components {
  /* Glass card variants */
  .glass-subtle {
    background: rgba(255, 255, 255, 0.72);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.6);
  }
  .glass-medium {
    background: rgba(255, 255, 255, 0.88);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.6);
  }
  .dark .glass-subtle {
    background: rgba(23, 23, 23, 0.72);
    border-color: rgba(255, 255, 255, 0.08);
  }
  .dark .glass-medium {
    background: rgba(23, 23, 23, 0.85);
    border-color: rgba(255, 255, 255, 0.12);
  }

  /* Glow utilities */
  .glow-primary {
    box-shadow: 0 0 20px rgba(255, 60, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06);
  }
  .glow-primary-strong {
    box-shadow: 0 0 40px rgba(255, 60, 0, 0.20), 0 8px 24px rgba(0, 0, 0, 0.08);
  }
  .glow-excellent {
    box-shadow: 0 0 40px rgba(6, 182, 212, 0.15), 0 8px 24px rgba(0, 0, 0, 0.06);
  }
  .glow-good {
    box-shadow: 0 0 40px rgba(16, 185, 129, 0.15), 0 8px 24px rgba(0, 0, 0, 0.06);
  }
  .glow-fair {
    box-shadow: 0 0 40px rgba(245, 158, 11, 0.15), 0 8px 24px rgba(0, 0, 0, 0.06);
  }
  .glow-critical {
    box-shadow: 0 0 40px rgba(239, 68, 68, 0.15), 0 8px 24px rgba(0, 0, 0, 0.06);
  }

  /* Score insight typography */
  .score-insight {
    font-family: var(--font-fraunces), Georgia, serif;
    font-weight: 300;
    font-size: 1rem;
    line-height: 1.5;
    font-style: italic;
    color: var(--muted-foreground);
  }

  /* Section eyebrow */
  .section-eyebrow {
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted-foreground);
  }

  /* Metric value (monospace KPI numbers) */
  .metric-value {
    font-family: var(--font-geist-mono), monospace;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  /* Dashboard page background */
  .dashboard-bg {
    background-color: #F7F7F7;
    background-image:
      radial-gradient(ellipse 120% 40% at 60% -5%, rgba(255,60,0,0.025) 0%, transparent 60%);
  }
  .dark .dashboard-bg {
    background-color: #0A0A0A;
    background-image:
      radial-gradient(ellipse 100% 30% at 50% -10%, rgba(255,60,0,0.04) 0%, transparent 60%);
  }

  /* Input enhanced */
  .input-enhanced {
    @apply rounded-lg border border-border bg-background px-3 py-2;
    @apply text-sm text-foreground placeholder:text-muted-foreground;
    @apply transition-all duration-200;
    @apply focus:outline-none focus:ring-2 focus:ring-ring/60 focus:ring-offset-1;
    @apply focus:border-ring/80;
    @apply focus:shadow-[0_0_0_4px_rgba(255,60,0,0.08)];
  }

  /* Skeleton shimmer */
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
}
```

### Keyframe Definitions (add to end of globals.css)

```css
@keyframes fade-up {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0);    }
}

@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1);    }
}

@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}

@keyframes count-up {
  /* handled via JS requestAnimationFrame — no CSS keyframe needed */
}

@keyframes bounce-dot {
  0%, 80%, 100% { transform: translateY(0);   }
  40%           { transform: translateY(-6px); }
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-up,
  .animate-fade-in,
  .animate-scale-in,
  .skeleton-shimmer {
    animation: none !important;
  }
  * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```

---

## 7. Implementation Priority

### Phase 1 — Highest Visual Impact (implement first, 1-2 sessions)

These changes create the biggest "before/after" perception improvement with the least risk:

| # | Change | File(s) | Impact |
|---|--------|---------|--------|
| 1 | `globals.css` — add all new CSS utilities, keyframes, shimmer, glass, glow | `globals.css` | Foundational — unlocks everything |
| 2 | `dashboard-shell.tsx` — `dashboard-bg` class on `<main>` | `dashboard-shell.tsx` | Immediate ambient depth on every page |
| 3 | Score Ring component — new file, wire into `dashboard-overview.tsx` | `score-ring.tsx`, `dashboard-overview.tsx` | The score IS the product — make it sing |
| 4 | Top Recommendation card — hero treatment | `dashboard-overview.tsx` | Answers "what do I do next" instantly |
| 5 | Button improvements — shadow + press states | `globals.css` or button variants | Every button feels better |

### Phase 2 — Structural Improvements (parallelize across 2 developers)

**Track A (Sidebar + Shell):**
| # | Change | File(s) |
|---|--------|---------|
| 6 | Sidebar redesign — new active state, trial banner, footer with avatar | `sidebar.tsx` |
| 7 | Login page — two-panel layout | `login/page.tsx`, `login-form.tsx` |
| 8 | Mobile top bar — glass treatment | `dashboard-shell.tsx` |

**Track B (Cards + Data):**
| # | Change | File(s) |
|---|--------|---------|
| 9 | Chart improvements — gradients, custom tooltip, axis styling | `dashboard-overview.tsx`, chart components |
| 10 | Skeleton shimmer — replace all `animate-pulse` | All pages with loading states |
| 11 | Engine card redesign | `dashboard-overview.tsx`, rankings page |

### Phase 3 — Polish (after Phase 1+2 are verified)

| # | Change | File(s) |
|---|--------|---------|
| 12 | Page entry animations — `animate-fade-up` wrapper | All dashboard pages |
| 13 | Agent cards — hover-reveal run button | `agents` page |
| 14 | Chat interface — bubble styling, typing indicator | `agents/[jobId]` page |
| 15 | Toast system — custom styling, border-left accent | `layout.tsx`, toast calls |
| 16 | Empty states — Fraunces italic, icon wash | `EmptyState` component |
| 17 | Input enhanced — focus glow, icon color transition | All form inputs |
| 18 | Onboarding — match new visual language | `onboarding-flow.tsx` |

### Dependencies

```
globals.css (Phase 1, item 1)
  └── Required by: dashboard-bg, glass-*, glow-*, skeleton-shimmer, input-enhanced
      └── Required by: all other components

score-ring.tsx (Phase 1, item 3)
  └── No external dependencies
  └── Required by: dashboard-overview.tsx, rankings page

Phase 2 Track A and Track B: fully parallel — no shared dependencies
Phase 3: requires Phase 2 complete
```

---

## 8. Accessibility Constraints

These are non-negotiable. All components must pass WCAG 2.1 AA before shipping.

### Color Contrast

| Text | Background | Ratio | Standard |
|------|-----------|-------|---------|
| `#0A0A0A` | `#F7F7F7` | 19.6:1 | AAA |
| `#0A0A0A` | `#FFFFFF` | 21:1 | AAA |
| `#FF3C00` | `#FFFFFF` | 4.6:1 | AA (large text/UI) |
| `#6B7280` | `#FFFFFF` | 4.6:1 | AA |
| White `#FFFFFF` | `#FF3C00` | 4.6:1 | AA (button text) |
| `#F7F7F7` | `#0A0A0A` | 19.6:1 | AAA (dark mode) |

**Glass elements**: Ensure the actual visible contrast ratio (accounting for blur) still meets 4.5:1. Test on both solid-color and gradient backgrounds.

**Score colors** (`#06B6D4`, `#10B981`, `#F59E0B`, `#EF4444`): These are used for large score numbers (24px+) and UI components, not body text. They pass AA at large size. **Never use them for small body text (under 18px).**

### Keyboard Navigation

- All interactive elements: visible focus ring using `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- Score ring: must have `role="meter"` with `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-label="Visibility score"`
- Agent cards with hover-reveal button: button must be focusable without hover (CSS reveal should also trigger on `:focus-within`)
- Chat input: `Enter` sends message, `Shift+Enter` newline
- Sidebar collapse: keyboard triggerable, announces state change via `aria-expanded`

### ARIA Labels

```tsx
/* Score ring */
<div role="meter" aria-valuenow={score ?? 0} aria-valuemin={0} aria-valuemax={100}
     aria-label={`AI visibility score: ${score ?? 'not yet scanned'} out of 100`}>

/* Engine sparkline */
<div role="img" aria-label={`Score trend over ${sparklineData.length} recent scans`}>

/* Sidebar nav */
<nav aria-label="Main navigation">

/* Trial progress bar */
<div role="progressbar" aria-valuenow={trialDaysLeft ?? 0} aria-valuemin={0}
     aria-valuemax={7} aria-label={`Trial: ${trialDaysLeft} of 7 days remaining`}>
```

---

## 9. RTL Support

The product supports Hebrew (RTL). All components must work in both LTR and RTL modes.

### Rules

1. **Never use `left`/`right` in Tailwind for logical-flow properties.** Use `start`/`end` (logical properties):
   - `ps-` instead of `pl-`
   - `pe-` instead of `pr-`
   - `ms-` instead of `ml-`
   - `me-` instead of `mr-`
   - `border-s-` instead of `border-l-`
   - `rounded-ts-` / `rounded-te-` for top-start/end corners

2. **Chat bubble corners** (Section 3.9): Use `rounded-ts-[4px]` for agent bubbles, `rounded-te-[4px]` for user bubbles — these automatically flip in RTL.

3. **Score ring**: The SVG circle animation starts at the top (`-rotate-90`). In RTL, the ring fills clockwise regardless. No change needed — the visual meaning is the same.

4. **Sidebar**: In RTL, the sidebar must appear on the right side. The `border-e` class (logical border-end) handles this — it becomes the left border in RTL.

5. **Arrow icons**: `ArrowRight` / `ChevronRight` must be flipped in RTL. Use:
   ```tsx
   <ArrowRight className="h-4 w-4 rtl:rotate-180 transition-transform" />
   ```

6. **The `dir` attribute**: Applied at the HTML level via the language setting. All logical properties cascade correctly from there.

### Component RTL Audit Checklist

Before shipping any component:
- [ ] No hardcoded `left`/`right` in Tailwind position or padding classes
- [ ] Arrow/chevron icons have `rtl:rotate-180`
- [ ] Text alignment: use `text-start`/`text-end` for text that should align to reading direction
- [ ] Border indicators (active sidebar item): use `border-s-2` not `border-l-2`
- [ ] Absolute positioning that anchors to a reading edge: use `inset-inline-start` or Tailwind `start-0`

---

## Appendix: File Change Summary

| File | Change Type | Priority |
|------|------------|----------|
| `saas-platform/src/app/globals.css` | Add new utilities + keyframes | Phase 1 |
| `saas-platform/src/components/dashboard/dashboard-shell.tsx` | `dashboard-bg` on main | Phase 1 |
| `saas-platform/src/components/dashboard/dashboard-overview.tsx` | Score ring, top rec hero | Phase 1 |
| `saas-platform/src/components/ui/score-ring.tsx` | New file | Phase 1 |
| `saas-platform/src/components/ui/empty-state.tsx` | Restyle — Fraunces + icon wash | Phase 3 |
| `saas-platform/src/components/dashboard/sidebar.tsx` | New active state + footer | Phase 2 |
| `saas-platform/src/components/dashboard/dashboard-shell.tsx` | Mobile glass header | Phase 2 |
| `saas-platform/src/app/(auth)/login/login-form.tsx` | Two-panel layout wrapper | Phase 2 |
| `saas-platform/src/app/(auth)/login/page.tsx` | Two-panel layout | Phase 2 |
| `saas-platform/src/app/layout.tsx` | Toaster config | Phase 3 |
| All dashboard page components | `animate-fade-up` wrapper | Phase 3 |
| Agent hub page | Agent card hover-reveal | Phase 3 |
| Agent chat page | Bubble + typing indicator | Phase 3 |

---

*Spec complete. Hand to frontend-developer with this file path as the sole design reference.*
*WCAG audit required before any PR merges (QA Lead gate).*
