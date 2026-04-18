# Design System + Component Spec — Worker Reference (2026-04-17)

> **Design reference:** https://getdesign.md/vercel/design-md — Beamix brand tokens (`#3370FF`, Inter/InterDisplay) override Vercel palette.

---

## Scope

This spec is the reference for the design-lead (Wave 1 2-hour prep) and all frontend-developer workers. It defines the component inventory, motion system, layout patterns, and empty state approach for the full dashboard rebuild.

Read this before writing any component.

---

## Design Tokens

Design tokens are already defined in `saas-platform/src/app/globals.css`. Do not redefine them — reference them.

Key tokens in use:

```css
/* Colors */
--color-accent:       #3370FF;   /* primary CTA, links, active states, charts */
--color-text-primary: #0A0A0A;
--color-text-muted:   #6B7280;
--color-surface:      #FFFFFF;
--color-border:       #E5E7EB;
--color-background:   #F7F7F7;

/* Score data (do not use as UI accent) */
--color-score-excellent: #06B6D4;
--color-score-good:      #10B981;
--color-score-fair:      #F59E0B;
--color-score-critical:  #EF4444;

/* Dark mode accent */
--color-accent-dark: #5A8FFF;
```

**Typography:**
- Body: `font-sans` → Inter 400
- Headings: `font-display` → InterDisplay-Medium / Inter 500
- Serif accent (testimonials, dark sections only): `font-serif` → Fraunces 300–400
- Code: `font-mono` → Geist Mono

**Buttons:**
- Dashboard utility: `rounded-lg` (8px border-radius)
- Never use pill-shaped buttons inside the product (pill = marketing site only)

**Spacing scale:** Follow Tailwind defaults. Key spacings: `4` (16px gap), `6` (24px), `8` (32px), `12` (48px).

---

## Existing Shadcn/UI Components to Extend

These 27 components are in `src/components/ui/`. Extend them with Beamix tokens — do not replace them.

Priority extensions needed before Wave 1 frontend work starts:

| Component | Extension needed |
|-----------|-----------------|
| `Button` | Add `tier-locked` variant (muted + lock icon) |
| `Badge` | Add `impact` variant (low/medium/high with color mapping) |
| `Card` | Add `inbox-item` variant (hover lift, selected state) |
| `Dialog` | Ensure 880px max-width for paywall modal |
| `Skeleton` | Audit — confirm all async surfaces have skeleton variants |
| `Tabs` | Confirm `underline` variant exists for Settings tabs |
| `Tooltip` | Add `ymyl-warning` variant (amber, warning icon) |

---

## 14 New Components

These do not exist yet. Build them fresh. Props interfaces below are the contract.

### 1. `ScoreHero`
Home page score display.

```typescript
interface ScoreHeroProps {
  score: number;              // 0–100
  previousScore: number | null;
  sparklineData: SparklinePoint[];  // 8 weeks of {date, score}
  engineBreakdown: EngineScore[];
  isLoading?: boolean;
}

interface SparklinePoint { date: string; score: number; }
interface EngineScore { engine: string; score: number; isMentioned: boolean; }
```

Animation: score counter springs from 0 to value on mount (Framer Motion `useSpring`). Delta pill animates in 300ms after counter settles.

---

### 2. `SuggestionCard`
Home page suggestions feed item.

```typescript
interface SuggestionCardProps {
  suggestion: Suggestion;
  onApprove: (id: string) => void;
  onDismiss: (id: string) => void;
  isLocked?: boolean;         // true for Discover paywall blurring
}
```

Animation: on dismiss — card slides left + fades out, cards below spring up. On approve — card glows blue briefly, then slides out.

---

### 3. `InboxItemRow`
Inbox left-pane list item.

```typescript
interface InboxItemRowProps {
  item: InboxItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
}
```

Shows: agent type icon, title, status badge, estimated impact badge, created-at relative time. Unread state: left blue dot + bold title.

---

### 4. `EvidencePanel`
Inbox right-pane evidence display.

```typescript
interface EvidencePanelProps {
  item: InboxItem;
  researchSources?: string[];
}
```

Sections: Trigger source (rule that fired), Target queries (chip list), Research sources (linked), Brand voice refs, Impact estimate, YMYL badge (if flagged).

---

### 5. `InlineChatEditor`
Freshness Agent text rewrite surface. Only appears in Inbox when `item.agentType === 'freshness_agent'`.

```typescript
interface InlineChatEditorProps {
  content: string;
  onRewrite: (selectedText: string) => Promise<string>;  // calls Haiku API
  onAcceptDiff: (original: string, rewritten: string) => void;
  onRejectDiff: () => void;
}
```

UX: user selects text → floating capsule appears with "Rewrite" button → Haiku call → diff shown (original strikethrough / new text green) → accept/reject buttons.

---

### 6. `PaywallModal`
Conversion modal. 880px centered. Opens on any gated action.

```typescript
interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerContext?: string;    // e.g., "You were about to run Content Optimizer"
  initialTier?: PlanTier;
}
```

Layout: 3-column plan cards (Discover / Build / Scale). Build has "Most popular" badge. Annual/monthly toggle. "Get started" → Paddle checkout. 14-day money-back guarantee badge.

---

### 7. `PaywallGate`
Wrapper component. Renders children normally if user has access; renders children with paywall treatment if not.

```typescript
interface PaywallGateProps {
  feature: string;             // feature key for canAccess() check
  children: React.ReactNode;
  blurContent?: boolean;       // blur children instead of hiding (default: false)
}
```

---

### 8. `PreviewBanner`
Persistent top banner for preview mode users. Lives in `DashboardShell` layout.

```typescript
interface PreviewBannerProps {
  onUpgradeClick: () => void;
}
```

Fixed position below nav. Blue background (`#3370FF`). Text: "You're exploring Beamix — upgrade to unlock agents." Dismiss not allowed (persistent).

---

### 9. `NotificationBell`
Sidebar notification bell with dropdown panel.

```typescript
interface NotificationBellProps {
  notifications: NotificationItem[];
  unreadCount: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}
```

Dropdown: "Today" group + "Earlier" group. Each item: icon (per type), title, body, relative time, link. Unread items have blue dot. Bell icon shows red badge count when unread > 0.

---

### 10. `AgentScheduleCard`
Automation page agent schedule display.

```typescript
interface AgentScheduleCardProps {
  agentType: AgentType;
  cadence: 'daily' | 'weekly' | 'monthly' | 'on_demand';
  lastRunAt: string | null;
  nextRunAt: string | null;
  isActive: boolean;
  isLocked: boolean;            // tier-lock
  onToggle: (active: boolean) => void;
  onCadenceChange: (cadence: string) => void;
}
```

---

### 11. `CreditBudgetBar`
Automation page credit usage display.

```typescript
interface CreditBudgetBarProps {
  used: number;
  total: number;
  alertThreshold?: number;   // default 75
  isAutoPaused?: boolean;
}
```

Bar fills blue to alertThreshold, then amber. Above 100% → red + "Auto-paused" badge.

---

### 12. `ScanTimelineItem`
Scans page history row.

```typescript
interface ScanTimelineItemProps {
  scan: ScanSummary;
  isSelected: boolean;
  onSelect: (scanId: string) => void;
}

interface ScanSummary {
  scanId: string;
  completedAt: string;
  score: number;
  previousScore: number | null;
  engineCount: number;
}
```

---

### 13. `EngineResultCard`
Scan drilldown per-engine result.

```typescript
interface EngineResultCardProps {
  engine: string;
  isMentioned: boolean;
  rankPosition: number | null;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  mentionSnippet?: string;
  competitors: string[];
}
```

---

### 14. `EmptyState`
Generic empty state. Every page uses this component — not custom per-page empty states.

```typescript
interface EmptyStateProps {
  page: 'home' | 'inbox' | 'scans' | 'automation' | 'archive' | 'competitors';
  variant: 'no_data' | 'day_one' | 'locked' | 'loading_failed';
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
}
```

Illustration: SVG per `page + variant` combination. Day-one variant gets animated "Setting up your workspace..." treatment. Locked variant gets upgrade CTA wired to PaywallGate.

---

## Layout Patterns

### DashboardShell

The root layout for all `(protected)/*` routes. Extends the existing shell — do not replace the entire file.

```
┌──────────────────────────────────────────────────────────┐
│  PreviewBanner (conditional — only in preview mode)      │
├────────────┬─────────────────────────────────────────────┤
│            │                                             │
│  Sidebar   │  <main>                                     │
│  (240px)   │    {children}                               │
│            │                                             │
│  7 nav     │                                             │
│  items     │                                             │
│  + bell    │                                             │
│  + user    │                                             │
│            │                                             │
└────────────┴─────────────────────────────────────────────┘
```

Sidebar width: 240px fixed (desktop). Collapses to icon-only rail (56px) on ≤1024px. Zustand controls collapse state.

### ThreePaneLayout

Used by Inbox. Three columns with defined widths.

```
┌──────────────┬──────────────────────────┬───────────────┐
│ List pane    │ Content preview          │ Evidence      │
│ 280px        │ flex-1                   │ 300px         │
│              │                          │               │
└──────────────┴──────────────────────────┴───────────────┘
```

On tablet (≤1280px): evidence panel collapses behind a toggle button. On mobile: single column, list → tap → full-screen preview.

### FeedLayout

Used by Home page.

```
┌────────────────────────────┬──────────────────┐
│ Main feed (flex-1)         │ Sidebar (320px)   │
│                            │                   │
│ ScoreHero                  │ Inbox preview     │
│ Suggestions (top 3)        │ Automation status │
│ Signals                    │                   │
└────────────────────────────┴──────────────────┘
```

On ≤1024px: sidebar stacks below main feed.

### FormLayout

Used by Settings tabs and onboarding steps. Single column, max-width 640px, centered.

### TableLayout

Used by Scans, Archive, Competitors. Full-width table with sticky header. On mobile: cards (one row per card, key data only).

---

## Framer Motion Spring Presets

Define in `src/lib/motion.ts`. All animations use springs — no `duration`-based tweens.

```typescript
import { type Spring } from 'framer-motion';

export const springs = {
  // Quick snap — used for badge counts, status changes
  snappy: { type: 'spring', stiffness: 400, damping: 30 } satisfies Spring,

  // Standard UI transitions — used for modals, dropdowns, card enter/exit
  standard: { type: 'spring', stiffness: 300, damping: 25 } satisfies Spring,

  // Gentle — used for page transitions, large element entries
  gentle: { type: 'spring', stiffness: 200, damping: 20 } satisfies Spring,

  // Bouncy — used for score counter settle, success states
  bouncy: { type: 'spring', stiffness: 260, damping: 15 } satisfies Spring,
} as const;

// Reusable variants
export const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: springs.gentle },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: springs.standard },
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: springs.standard },
};

export const cardHover = {
  rest: { scale: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  hover: { scale: 1.01, boxShadow: '0 4px 12px rgba(0,0,0,0.10)', transition: springs.snappy },
};
```

**Rules:**
- Never use `animate={{ transition: { duration: N } }}` directly — always use a spring preset
- Score counter uses `useSpring` from Framer Motion, not `animate`
- Page transitions: `AnimatePresence` + `fadeInUp` at the route segment level
- Loading skeletons: Tailwind `animate-pulse` (CSS, no Framer Motion needed)

---

## Empty State Approach

One `EmptyState` component handles all pages. This prevents inconsistent empty state designs scattered across the codebase.

Per-page variants:

| Page | `no_data` message | `day_one` message | `locked` message |
|------|-------------------|-------------------|-----------------|
| home | "No scan yet — run your first scan to see your score" | "Setting up your workspace..." | — |
| inbox | "Nothing to review — your agents will drop drafts here" | "Your first agent run will appear here" | "Upgrade to see agent drafts" |
| scans | "No scans yet — run your first scan" | — | — |
| automation | "No schedules active — add your first automation" | — | "Upgrade to enable automation" |
| archive | "No approved items yet — approve content from your Inbox" | — | — |
| competitors | "No competitors tracked — add up to 3 competitors" | — | — |

Day-one treatment on Home: animated sequence — spinning indicator → "Connecting your workspace" → "Running first scan" → data appears. Driven by real scan status polling, not fake timer.

---

## Design-Lead Deliverable Format

The 2-hour Wave 1 prep produces one document (not a PR, just a shared doc or markdown file):

```
docs/08-agents_work/sessions/[date]-design-lead-component-patterns.md
```

Contents:
1. Confirmed spring presets (motion.ts values — verify they feel right at runtime)
2. Any Shadcn extension decisions made
3. Empty state illustration approach (SVG source decision — inline, file, or library)
4. Typography hierarchy decisions (h1 size on Home, card title size, etc.)
5. Any component API changes from this spec (document deviations)

Frontend workers read this doc before starting their worktrees. It is the final word on component patterns — this spec is the brief, the design-lead's output is the implementation decision.

---

## What Workers MUST NOT Do

- Do not create custom button variants outside of Shadcn `Button` extensions
- Do not use `duration`-based animations — springs only
- Do not use orange, navy, or cyan as UI accents — `#3370FF` only
- Do not use pill-shaped buttons in the product — `rounded-lg` only
- Do not hardcode colors in component styles — use CSS variables from `globals.css`
- Do not add TipTap or Lexical — markdown editing is `textarea` + `react-markdown` only
- Do not create page-specific empty state components — use the single `EmptyState` component
