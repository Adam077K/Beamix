# Beamix Visual Design System v1
Date: 2026-04-27
Status: CANONICAL — all page-level specs and frontend implementations reference this document.
Source synthesis: Master Designer brief (9,183 words), Frame 5 v2 locked decisions, References Masterlist, Home Premium Refs.

---

## How to use this document

This is a frontend-executable spec. Every value is a pixel count, hex color, millisecond duration, or named curve. A developer should be able to build any Beamix component from this document without asking design questions. Where a decision is explained, it is explained once — in that section only. Skip explanations and read the spec tables.

---

## 1. Foundation Tokens

### 1.1 Colors

All color tokens use CSS custom properties. Dark mode values listed inline. Opacity-based borders ensure dark mode adaptation without a secondary token set.

#### Brand

| Token | Light hex | Dark hex | Use |
|---|---|---|---|
| `--color-brand` | `#3370FF` | `#5A8FFF` | The ring. The trace. Active states. Primary CTA background. The only brand accent on any chrome surface. |
| `--color-brand-deep` | `#1F4FCC` | `#3370FF` | Hover on primary CTA. Terminal node of the ring on full-cycle close. |
| `--color-brand-soft` | `rgba(51,112,255,0.06)` | `rgba(90,143,255,0.10)` | Active engine chip background. Decision card background. Active sidebar item fill. |
| `--color-brand-text` | `#2558E5` | `#7AAEFF` | Brand blue used as text color (body or inline). `#3370FF` on white fails WCAG AA for body text; use this value for inline links and labeled actions. |

#### Surface

| Token | Light hex | Dark hex | Use |
|---|---|---|---|
| `--color-paper` | `#FFFFFF` | `#0E0E10` | Primary surface. Every product chrome page. |
| `--color-paper-elev` | `#FAFAF7` | `#16161A` | Elevated surface. Sidebar. Topbar. Hover state background on list rows. Cards in a white context. Note the warm tint (3-point warm shift from pure white, not the blue-biased `#F9FAFB`). |
| `--color-paper-cream` | `#F7F2E8` | `#1A1812` | The editorial artifact register. **Reserved strictly for**: Brief background, Monthly Update PDF, /scan public hero section, email digest header strip (32px), OG share card. Never used on product UI chrome. |

#### Text

| Token | Light hex | Dark hex | Use |
|---|---|---|---|
| `--color-ink` | `#0A0A0A` | `#F5F5F2` | Primary text. Headings. The score number. All high-importance data. |
| `--color-ink-2` | `#3F3F46` | `#D4D4D8` | Secondary text. Section subheadings. Active table cell data. |
| `--color-ink-3` | `#6B7280` | `#9CA3AF` | Muted text. Status sentence. Captions. Form labels. |
| `--color-ink-4` | `#9CA3AF` | `#6B7280` | Very muted. Axis labels. Timestamps in dense tables. Placeholder text. |

#### Border

| Token | Value | Use |
|---|---|---|
| `--color-border` | `rgba(10,10,10,0.06)` | Card borders. Table dividers. Default stroke. Light mode only needs this one. |
| `--color-border-strong` | `rgba(10,10,10,0.12)` | Form field outlines. Primary action edges. Selected state ring. |
| `--color-border-dark` | `rgba(255,255,255,0.08)` | Dark mode equivalent of `--color-border`. |
| `--color-border-dark-strong` | `rgba(255,255,255,0.14)` | Dark mode equivalent of `--color-border-strong`. |

Borders are opacity-based, not hex. This is the single most important dark mode preparation decision. Never define borders as fixed hex values.

#### Semantic (data only — never on chrome)

| Token | Hex | Use |
|---|---|---|
| `--color-score-excellent` | `#06B6D4` | Score 85+. Charts. Deltas. Status tokens. Never on buttons, never on borders, never on nav. |
| `--color-score-good` | `#10B981` | Score 70–84. Positive deltas. "Healthy" status. |
| `--color-score-fair` | `#F59E0B` | Score 50–69. "Watching" state. |
| `--color-score-critical` | `#EF4444` | Score <50. Negative deltas >5. Used sparingly — Beamix doesn't yell. |
| `--color-needs-you` | `#D97706` | Action-required amber. StatusToken "NeedsYou" state. Decision card border accent. Warmer than `score-fair` — this is imperative, not informational. |
| `--color-healthy` | `#10B981` | "Healthy" StatusToken. Same hex as `score-good`, referenced by a distinct token name so usage intent is explicit. |
| `--color-acting` | `#3370FF` | "Acting" StatusToken. Reuses `--color-brand`. Agent is working. |

The brand rule: `--color-brand` (`#3370FF`) is the only color permitted on chrome (buttons, active states, the ring, the trace, the topbar dot). Every other color token lives exclusively on data surfaces. This is what separates Beamix from Notion-grade visual chaos.

---

### 1.2 Typography

Three families. Each with a defined domain. No family substitutes for another's domain.

#### Font families

| Family | CSS name | Weights loaded | Domain |
|---|---|---|---|
| InterDisplay | `'InterDisplay', sans-serif` | 500 | Hero numbers, section headings, page titles, score, KPI values |
| Inter | `'Inter', sans-serif` | 400, 500 | Body, microcopy, table cells, form fields, all running text |
| Geist Mono | `'GeistMono', monospace` | 400 | Timestamps, scan IDs, agent slugs, version numbers, code, anywhere "this is technical truth" |
| Fraunces | `'Fraunces', serif` | 300 | **Accent only on artifact surfaces.** The Brief body, Monthly Update headline, signature line, /scan public editorial copy. Never in product UI chrome. |

Fraunces is loaded with variable axes: `font-variation-settings: "SOFT" 100, "WONK" 0, "opsz" 144`. This produces the letterpress-warm optical size that justifies its inclusion. Without these axes it reads generic.

#### Italic rules

- Inter italic: never. Inter's italic is a slanted roman. Use `font-weight: 500` for emphasis instead.
- Fraunces italic: only on the signature line of an artifact (`— your crew`, 22px Fraunces 300 italic). One use, reserved like a wax seal.
- Geist Mono italic: never.

#### Feature settings

| Setting | Applied to | Effect |
|---|---|---|
| `'tnum'` | Every number that appears next to another number | Tabular width digits. Columns align. Required on score, deltas, KPI values, engine mini-scores, timestamps in dense tables. |
| `'cv11'` | InterDisplay headings and score | Single-story `g`. Warmer, less robotic. Apply to all InterDisplay usage. |
| `'ss03'` | Score display (96px only) | Straight-sided digits. Architectural quality at display size. Apply only to `--text-display`. |
| `'ss01'` | Geist Mono | Slashed zero. Distinguishes `0` from `O` in scan IDs. Apply to all Geist Mono usage. |
| `'ss01'` | Fraunces | More closed `g`, softer `a`. Letterpress texture. Apply to all Fraunces usage. |

In Tailwind config, encode these as `fontFeatureSettings` classes or extend the `font-*` utilities.

#### Type scale (10 sizes, locked)

No sizes outside this table. No `text-[14px]` one-offs. If a design calls for something between two steps, pick the smaller one.

| Token | Size | Line height | Family / Weight | Feature settings | Use |
|---|---|---|---|---|---|
| `text-display` | 96px / 6rem | 96px | InterDisplay 500 | `tnum, cv11, ss03` | The score. One per page maximum. /home hero and /scan public hero only. |
| `text-h1` | 48px / 3rem | 56px / 3.5rem | InterDisplay 500 | `cv11` | Page titles on artifact surfaces (Monthly Update, Brief, /scan public). |
| `text-h2` | 32px / 2rem | 40px / 2.5rem | InterDisplay 500 | `cv11, tnum` | Above-fold KPI hero numbers (mentions count, citations count). Section headings inside artifact surfaces. |
| `text-h3` | 22px / 1.375rem | 32px / 2rem | InterDisplay 500 | `cv11` | Section headings inside product pages. Fraunces 300 at this size = lead paragraph on /home (see note below). |
| `text-lg` | 18px / 1.125rem | 28px / 1.75rem | Inter 400 | — | Status sentence on /home. Brief body. Primary editorial paragraph. |
| `text-base` | 15px / 0.9375rem | 24px / 1.5rem | Inter 400 | — | All body text. Table row content. Descriptions. Form values. |
| `text-sm` | 13px / 0.8125rem | 20px / 1.25rem | Inter 400 | — | Microcopy. Crew Trace tooltips. Secondary table data. Diff previews. |
| `text-xs` | 11px / 0.6875rem | 16px / 1rem | Inter 500 | `smcp` or manual: uppercase + `letter-spacing: 0.10em` | Labels. Eyebrow caps. Axis ticks. Attribution timestamps. Section labels ("THIS WEEK"). |
| `text-mono` | 13px / 0.8125rem | 20px / 1.25rem | Geist Mono 400 | `tnum, ss01` | Timestamps. Scan IDs. Agent slugs. Version numbers. Code snippets. |
| `text-serif-lg` | 28px / 1.75rem | 40px / 2.5rem | Fraunces 300, SOFT 100, WONK 0, opsz 144 | `ss01` | The Brief body paragraph. Monthly Update headline sentence. The signature line base size when on its own line. |

Note on Fraunces at `text-h3` size: On /home, the editorial summary line ("Your crew shipped 6 changes this week.") uses `text-h3` (22px) in Fraunces 300, not InterDisplay. This is the one product-surface Fraunces exception, and it is deliberate — this line is the editorial voice of the product speaking directly to the user, not a heading.

Letter-spacing for `text-xs` labels: `0.08em` when used as eyebrow caps. `0.10em` when used as axis ticks or attribution stamps.

---

### 1.3 Spacing

Base grid: **8px**. Micro grid: **4px**.

Permitted spacing values: `4, 8, 12, 16, 24, 48, 72, 120`. No other values. No `10`, `14`, `20`, `32`, `36`, `40`, `64`. The constraint is the system.

Two exceptions with a specific use case each:
- `6px`: pill/chip vertical padding only.
- `10px`: form field vertical padding only.

#### Component padding

| Context | Value |
|---|---|
| Card internal padding | 24px all sides |
| Pill / chip horizontal | 12px |
| Pill / chip vertical | 6px (the one exception) |
| Form field horizontal | 12px |
| Form field vertical | 10px (the one exception) |
| Table row vertical | 16px (produces 44px row height with 15px base text) |
| Section vertical gap (major) | 72px |
| Section vertical gap (subsection) | 48px |
| Section vertical gap (component-to-component) | 24px |

#### Deliberate spacing breaks

/home above-fold: 120px from top of content area to score cluster center. Section 2 starts 96px below the score cluster (not 72px). This intentional stretch is what gives /home its expensive feel — the hero floats. Every other page uses the 72px rhythm. Never apply the 96px or 120px values outside /home above-fold.

#### Page max-widths

| Surface | Max-width |
|---|---|
| /home | 1180px |
| /scans, /competitors, /crew table | 1340px |
| /inbox | 880px |
| The Brief (onboarding step 3) | 720px |
| Monthly Update permalink | 720px |
| /workspace | 1300px (sidebar included) |

#### Interactive target sizes

Minimum tappable target: 44px height. This is non-negotiable for primary and secondary actions. Enforce via `min-h-[44px]` on all interactive elements.

---

### 1.4 Elevation (shadow tokens)

Shadows use warm-biased rgba to match the paper surface's warmth. Never use cool blue-black shadows.

| Token | CSS value | Use |
|---|---|---|
| `--shadow-sm` | `0 1px 2px rgba(10,10,10,0.04), 0 1px 1px rgba(10,10,10,0.03)` | Subtle lift. Topbar. Pills. |
| `--shadow-md` | `0 4px 6px rgba(10,10,10,0.05), 0 2px 4px rgba(10,10,10,0.04)` | Card hover state. Dropdown menus. Inline popovers. |
| `--shadow-lg` | `0 10px 20px rgba(10,10,10,0.08), 0 4px 8px rgba(10,10,10,0.05)` | Modals. Drawers. The preview panel in /inbox. |
| `--shadow-focus` | `0 0 0 3px rgba(51,112,255,0.25)` | Focus ring for keyboard navigation. Applied to any focused interactive element. |

Dark mode shadows use white-biased rgba:
- `--shadow-sm` dark: `0 1px 2px rgba(0,0,0,0.20)`
- `--shadow-md` dark: `0 4px 6px rgba(0,0,0,0.28)`
- `--shadow-lg` dark: `0 10px 20px rgba(0,0,0,0.36)`

---

### 1.5 Border-radius

| Token | Value | Use |
|---|---|---|
| `--radius-card` | `12px` | Cards, drawers, modals, the Decision Card. Primary container radius. |
| `--radius-chip` | `8px` | Engine chips, status pills, form fields, secondary containers. |
| `--radius-pill` | `9999px` | PillButton (primary CTA). Full pill, not rounded-lg. |
| `--radius-sm` | `6px` | Badges, tooltip bodies, inline code blocks. |
| `--radius-full` | `50%` | Agent monogram circles. The ring (implemented as SVG, not CSS). |

---

## 2. The 4-Mark Sigil System

These four marks are Beamix's visual identity. Together they signal that Beamix is a practice, not a dashboard. They appear only where listed. Their absence on admin surfaces is as intentional as their presence elsewhere.

---

### 2.1 The Ring

**What it is.** A 2px stroke SVG arc that circles the score number. A CSS-rendered geometric arc on one side; a Rough.js hand-drawn terminus on the gap. The seam between them is the brand.

**Geometry.**
- Outer diameter: 200px (96px + ring clearance)
- Stroke width: 2px
- Color: `--color-brand` (`#3370FF`)
- Arc span: from -90° (top, 12 o'clock) clockwise to +252° (leaving a ~30° gap at top-right, ~1:30 o'clock position)
- The gap: 30° wide, terminus marked with a Rough.js dash mark (4px long, 1.5px stroke, roughness 0.8, fixed seed per user ID so it never redraws differently)

**Implementation pattern.**

```tsx
// ActivityRing.tsx — structural sketch
// SVG arc via stroke-dasharray / stroke-dashoffset on a circle
// Gap: computed from circumference, CSS handles the arc
// Rough.js draws the terminus dash at the gap endpoint
// Seed: derived from userId so the same user always sees the same jitter

interface ActivityRingProps {
  score: number;           // 0–100, drives arc span (not yet — arc is always 252°)
  isActing: boolean;       // drives pulse animation
  size?: number;           // default 200
  strokeWidth?: number;    // default 2
}
```

The arc span is always 252° regardless of score. The score lives inside the ring as a number, not as fill percentage. The ring is not a progress bar. It is a frame.

**States.**

| State | Visual |
|---|---|
| Idle (no active agents) | Static arc at full opacity. No animation. |
| Acting (any agent running) | Gap terminus pulses: opacity 0.4 → 1.0, 1200ms ease-in-out, infinite loop. Arc itself static. |
| Cycle complete (weekly scan + all fixes applied) | Arc draws to full circle (gap closes) over 800ms, holds 600ms, then re-opens at 252° with new baseline. This single closure is the weekly visual reward. |
| First load on /home | Arc draws in from 0 to 252° over 1500ms as part of the onboarding boot sequence. |

**When to use the Ring.** /home above-fold (primary, live, pulsing). /scan public hero (draws during reveal, then static). Monthly Update PDF header (static, cycle-snapshot). OG share card (static). Marketing site hero (CSS animation).

**When NOT to use the Ring.** Anywhere inside product chrome except /home. Never in table rows, never in cards, never in the sidebar, never in /inbox items.

---

### 2.2 The Trace

**What it is.** A faint hand-drawn underline beneath text that Beamix has modified within the past 24 hours. Rough.js path, roughness 0.6, color `--color-brand` at 28–30% opacity, stroke 1.5px. Ambient evidence that work happened here.

**Technical spec.**

```
roughjs config for Trace:
  roughness: 0.6
  strokeWidth: 1.5
  stroke: rgba(51, 112, 255, 0.28)
  seed: hash(text_content + timestamp_day) — consistent within a day, differs day-to-day
  fill: none
  bowing: 0.5
  
Placement: 2px below text baseline, full text width + 4px overhang each side
```

**Behavior.** The Trace appears on text in /home (recent activity paragraph, crew activity rows), /competitors (Rivalry Strip editorial summary), /inbox filter label when an agent just acted, /workspace step output. It persists for 24 hours after the agent action, then fades out over 2 hours (opacity 0.28 → 0, 7200000ms — the slow fade is itself an ambient signal of recency). On initial appearance, fade-in over 300ms.

**When NOT to use the Trace.** Never in /settings, /schedules, /scans table data (data is clinical — no ambient marks on clinical surfaces), never on headings, never on UI chrome (labels, nav items, buttons).

---

### 2.3 The Seal

**What it is.** A small Rough.js-rendered mark derived from the Beamix logo star/cross shape, 16×16 to 32×32 depending on context. Appears at moments of completion, approval, or authorship. The product's signature.

**Sizes by context.**

| Context | Size | Notes |
|---|---|---|
| Monthly Update PDF top (header) | 24×24 | Static, ink-3 color |
| Monthly Update PDF bottom (closing) | 32×32 | Static, ink color — the closing seal is always bigger, broadsheet tradition |
| Brief completion (onboarding step 3) | 24×24 | Animated draw on approval |
| Inbox approve button hover | 16×16 | Foreshadowing — draws while user hovers, complete on click |
| OG share card corner | 24×24 | Static |
| /scan public artifact footer | 20×20 | Static |
| Monthly Update email header | 20×20 | Static |

**Animation (seal-draw).**

```
trigger: user clicks "Approve" on Brief or Inbox item
curve: cubic-bezier(0.4, 0, 0.2, 1)
duration: 800ms
method: stroke-dashoffset from full path length → 0 (draws the outline)
follow: on completion (800ms), scale from 1.0 → 1.05 → 1.0 over 50ms (a tiny settle)
color: --color-ink at 80% opacity, not brand-blue — the seal is authorship, not action
```

**Implementation note.** Export the Beamix logo star/cross as an SVG path. Total path length via `element.getTotalLength()`. Animate `stroke-dasharray: [length]` and `stroke-dashoffset: [length → 0]`. Use `will-change: stroke-dashoffset`.

**When NOT to use the Seal.** Never in navigation, never on data charts, never on buttons as a state indicator, never as a decoration. The seal means "Beamix has signed this artifact." If there is no artifact being signed or completed, no seal.

---

### 2.4 The Margin

**What it is.** A 24px-wide vertical strip on the left edge of artifact surfaces (digests, scan rows, reports, /workspace). Over time, Rough.js agent-fingerprint marks accumulate here — small drawn circles in each agent's color, one per action. The margin is the product's memory made visible.

**Visual spec.**

```
Width: 24px
Background: same as the artifact surface (transparent over paper/cream)
Marks: 12–16px Rough.js circles, roughness 0.8, each agent has a fixed color
  Schema Doctor: #6366F1
  Citation Fixer: #10B981
  FAQ Agent: #F59E0B
  Competitor Watch: #EF4444
  Trend Spotter: #8B5CF6
  Brand Voice Guard: #EC4899
  Content Refresher: #0EA5E9
  (remaining agents: use the semantic palette cycling through remaining hues)
Mark spacing: 8px vertical between marks
```

**Where the Margin appears.** /scans table rows (each row's left 24px). /workspace step list (each step's left 24px). Monthly Update PDF (full-height left margin of the document). Monday Digest email (full-height left strip). /home "Receipts" section rows. /competitors table rows.

**CrewMonogram vs. Margin mark.** The Margin mark is 12–16px, ambient, accumulated. The CrewMonogram component (see Section 4) is 16–96px, prominent, labeled. Different tools for different contexts.

---

## 3. Motion Vocabulary

12 tokens. All implementation-ready. Reduced-motion fallback designed first — the animation is the enhancement, not the default.

Global rule: never repeat entrance animations within the same session. Once the score has counted up, it stays at the final value on subsequent navigations. Motion communicates state transitions, not presence.

---

### 3.1 Token table

| Token | Trigger | Property animated | Curve | Duration | Reduced-motion fallback |
|---|---|---|---|---|---|
| `motion/score-fill` | First page load per session | `counter` from 0 to current value (use `CountUp` or CSS counter animation) | `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo) | 800ms | Score appears instantly at final value |
| `motion/ring-draw` | Onboarding step 5 boot, /scan public reveal | `stroke-dashoffset` full length → 0 | `cubic-bezier(0.4, 0, 0.2, 1)` | 1500ms | Arc appears fully drawn |
| `motion/ring-pulse` | Continuous while any agent active | Gap mark `opacity` 0.4 → 1.0 → 0.4, infinite | `cubic-bezier(0.4, 0, 0.6, 1)` (sine-like ease-in-out) | 1200ms | Static gap at full opacity |
| `motion/ring-close` | Weekly cycle complete | `stroke-dashoffset` to close the gap over 800ms | `cubic-bezier(0.4, 0, 0.2, 1)` | 800ms, hold 600ms, reopen | Arc redraws at new baseline on next refresh |
| `motion/path-draw` | First page load per session (sparklines + score trend) | `clip-path: inset(0 100% 0 0)` → `clip-path: inset(0 0% 0 0)` | `cubic-bezier(0.4, 0, 0.2, 1)` | 1000ms | Sparkline appears fully drawn |
| `motion/trace-fade` | Trace enters viewport, or on first /home load at 600ms | `opacity` 0 → 0.28 | `linear` | 300ms | Trace appears at final opacity |
| `motion/pill-spring` | Status change on StatusToken | `scale` 0.96 → 1.04 → 1.0 | `cubic-bezier(0.34, 1.56, 0.64, 1)` (back-out, mild overshoot) | 280ms | Token appears at final state |
| `motion/card-entrance` | Decision Card becomes visible (conditional on /home) | `translateY` 6px → 0, `opacity` 0 → 1 | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 200ms | Card appears in place |
| `motion/seal-draw` | Brief approval, Inbox approve click, Monthly Update render | `stroke-dashoffset` path length → 0, then scale 1.0 → 1.05 → 1.0 | `cubic-bezier(0.4, 0, 0.2, 1)` | 800ms draw + 50ms settle | Seal appears complete |
| `motion/signature-stroke` | Brief approval, fires after `motion/seal-draw` completes | Fraunces "— your crew" text `opacity` 0 → 1 + a left-to-right clip-path reveal | `cubic-bezier(0.4, 0, 0.2, 1)` | 600ms (starts 800ms after seal begins) | Signature appears in place |
| `motion/microcopy-rotate` | Continuous on active step in /workspace | Substep text `opacity` 1 → 0, new text `opacity` 0 → 1 (cross-fade) | `linear` for opacity | 200ms cross-fade, 800ms hold per string | Static "Working..." text |
| `motion/topbar-status` | Continuous while any agent active | Topbar dot `opacity` 0.6 → 1.0 → 0.6, infinite | `cubic-bezier(0.4, 0, 0.6, 1)` | 1600ms (deliberately slower than ring-pulse) | Static dot at full opacity |
| `motion/row-hover` | Table or list row `mouseenter` | Row background `opacity` 0 → 0.03 (applies `--color-ink` at 3% opacity) | `linear` | 100ms | Instant background change |

### 3.2 /home first-load orchestration (1.6s total budget)

```
0ms     Skeleton renders — Ring static, score at 0, sparkline empty, traces absent
100ms   motion/score-fill begins (800ms)
100ms   motion/path-draw begins (1000ms)
600ms   motion/trace-fade begins across all visible traces, staggered 50ms each
900ms   score-fill ends, score lands at final value
1100ms  path-draw ends
1100ms  motion/card-entrance fires if Decision Card is present (200ms)
1100ms  motion/ring-pulse begins (continuous if acting)
1100ms  motion/topbar-status begins (continuous if acting)
1300ms  card-entrance ends
1600ms  all entrance motion complete
```

After 1600ms the page is static except for ring-pulse and topbar-status (continuous when system is active) and cursor interactions.

### 3.3 Suppression rules

- All entrance animations (score-fill, ring-draw, path-draw, card-entrance, trace-fade) fire once per session per page. If user navigates away and back, they see the final state instantly.
- `prefers-reduced-motion: reduce` → apply all reduced-motion fallbacks from the token table. Implement via `@media (prefers-reduced-motion: reduce)` in global CSS, not in component logic.
- Never run `motion/ring-pulse` or `motion/topbar-status` when the system is idle. The pulse means something. A pulsing product that is not acting is lying.

---

## 4. Component Primitives

Each component is specified to the level of props, states, and visual implementation. No design questions should remain after reading a component's entry.

---

### 4.1 StatusToken

Three states. Each is a pill with a colored dot + label text.

```tsx
type StatusState = 'Healthy' | 'Acting' | 'NeedsYou';

interface StatusTokenProps {
  state: StatusState;
  label?: string;  // defaults: 'Healthy' | 'Acting' | 'Needs you'
  size?: 'sm' | 'md';
}
```

| State | Dot color | Pill background | Text color | Label (default) |
|---|---|---|---|---|
| Healthy | `--color-healthy` (#10B981) | `rgba(16,185,129,0.08)` | `--color-healthy` | "Healthy" |
| Acting | `--color-acting` (#3370FF) | `--color-brand-soft` | `--color-brand-text` | "Acting" |
| NeedsYou | `--color-needs-you` (#D97706) | `rgba(217,119,6,0.08)` | `--color-needs-you` | "Needs you" |

Sizing: `md` = 28px height, 8px horizontal padding, 11px caps text, 6px dot. `sm` = 22px height, 6px horizontal padding, 10px caps text, 5px dot.

On state change: `motion/pill-spring` (scale 0.96 → 1.04 → 1.0, 280ms back-out curve).

Border-radius: `--radius-pill` (9999px).

---

### 4.2 DecisionCard

Conditional above-fold component on /home. Only renders when system state is "NeedsYou". Contains a single pending action requiring user decision.

```tsx
interface DecisionCardProps {
  title: string;          // "Approve a homepage hero rewrite"
  subtitle: string;       // "~30 seconds."
  primaryLabel: string;   // "Review now"
  onPrimary: () => void;
  secondaryLabel?: string;  // optional "Remind me Monday"
  onSecondary?: () => void;
}
```

Visual spec:
- Background: `--color-brand-soft` (`rgba(51,112,255,0.06)`)
- Border: 1px `--color-border-strong`
- Border-radius: `--radius-card` (12px)
- Height: 96px (fixed)
- Width: 100% of content area
- Internal padding: 24px horizontal, 0 vertical (vertically centered content)
- Left: `→` glyph (16px Inter 500, `--color-brand`) + title (18px Inter 500, `--color-ink`) on one line
- Below title: subtitle (14px Inter 400, `--color-ink-3`)
- Right: primary button (14px Inter 500, white on `--color-brand` background, `--radius-chip`, 36px height, 16px horizontal padding) + optional secondary (14px Inter 400, `--color-brand-text`, ghost)

Entrance animation: `motion/card-entrance` (translateY 6px → 0, opacity 0 → 1, 200ms back-out).

---

### 4.3 PillButton

Primary CTA component. Used for primary and secondary actions across product.

```tsx
interface PillButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size: 'sm' | 'md' | 'lg';
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;  // Lucide icon, prepended
}
```

Size specs:

| Size | Height | Horizontal padding | Font size / weight |
|---|---|---|---|
| sm | 32px | 12px | 13px Inter 500 |
| md | 40px | 16px | 14px Inter 500 |
| lg | 48px | 24px | 15px Inter 500 |

Variant specs:

| Variant | Background | Text | Border | Hover background |
|---|---|---|---|---|
| primary | `--color-brand` | white | none | `--color-brand-deep` |
| secondary | `--color-paper-elev` | `--color-ink` | 1px `--color-border-strong` | `rgba(10,10,10,0.04)` |
| ghost | transparent | `--color-brand-text` | none | `--color-brand-soft` |
| destructive | `rgba(239,68,68,0.08)` | `#EF4444` | 1px `rgba(239,68,68,0.20)` | `rgba(239,68,68,0.14)` |

Border-radius: `--radius-pill` (9999px) for all variants in marketing contexts. In product utility contexts (settings forms, table actions), use `--radius-chip` (8px) on secondary and ghost variants. Primary CTAs always use the full pill radius.

Hover interaction: 150ms ease-out background transition. No transform on hover for secondary/ghost. Primary button: no transform (reserved for spring when state changes).

Loading state: replace label with a 14px animated dots sequence (opacity pulse, not a spinner). Button disabled during loading.

---

### 4.4 CardSurface

The default container for all card content.

```tsx
interface CardSurfaceProps {
  padding?: 'sm' | 'md' | 'lg';     // 16px / 24px / 32px
  elevated?: boolean;                // uses --color-paper-elev background
  interactive?: boolean;             // adds hover lift on hover
  children: React.ReactNode;
}
```

Visual defaults:
- Background: `--color-paper`
- Border: 1px `--color-border`
- Border-radius: `--radius-card` (12px)
- Box-shadow: none at rest

Interactive state (when `interactive={true}`):
- On hover: `box-shadow: --shadow-md`, `translateY(-1px)`, 150ms ease-out

---

### 4.5 TableRow

Standard row for all Beamix tables (/scans, /competitors, /crew, /inbox, /schedules).

Height: 56px standard, 44px compact (use compact only in /inbox list where density is intentional).

Columns use a CSS grid layout, never flexbox, so columns align across rows.

Hover: background transition from transparent to `rgba(10,10,10,0.025)` over 100ms (`motion/row-hover`).

Click/active: background `rgba(10,10,10,0.04)`, no transition.

Left border accent on selected row: 2px `--color-brand` left border, inset (does not expand row width).

---

### 4.6 EvidenceCard

Compact card representing a single Beamix action from the activity log.

```tsx
interface EvidenceCardProps {
  agentType: AgentType;             // determines Margin mark color
  verb: string;                      // "Added", "Fixed", "Monitored", "Generated"
  object: string;                    // "11 FAQ entries to /services/..."
  timestamp: string;                 // ISO string, rendered in Geist Mono
  hasTrace?: boolean;                // shows Trace under object text if true
}
```

Visual: 56px height, 16px horizontal padding, left Margin strip (24px, agent color mark). Verb in 14px Inter 500, `--color-ink`. Object in 14px Inter 400, `--color-ink-2`. Timestamp right-aligned, 13px Geist Mono, `--color-ink-4`.

The Trace appears under the object string if `hasTrace` is true and the action is <24h old.

---

### 4.7 EngineChip

Represents a single AI engine (ChatGPT, Perplexity, Gemini, etc.) with its mini-score and delta.

```tsx
interface EngineChipProps {
  name: string;           // "ChatGPT"
  score: number;          // 0–100
  delta: number;          // signed, e.g. +3 or -1
  status: 'active' | 'inactive' | 'locked';
  tier?: 'discover' | 'build' | 'scale';  // for locked state messaging
  onClick?: () => void;
}
```

Sizing: 56px height, 12px horizontal padding, 16px minimum width.

States:

| Status | Background | Opacity | Border | Hover |
|---|---|---|---|---|
| active | `--color-brand-soft` | 100% | 1px `--color-border` | border darkens to `--color-border-strong` |
| inactive | `--color-paper-elev` | 100% | 1px `--color-border` | same as active hover |
| locked | `--color-paper-elev` | 40% | 1px `--color-border` | opacity 60%, tooltip "Available on Build →" |

Content layout (vertical stack, centered):
- Engine name: 11px Inter 500, uppercase, 0.06em letter-spacing, `--color-ink-3`
- Score: 18px InterDisplay 500, `tnum`, `--color-ink`
- Delta: 11px Inter 500, `tnum`, color from semantic palette (`--color-score-good` / `--color-score-critical`)

Locked state: shows a 12px padlock Lucide icon at top-right corner at 60% opacity.

---

### 4.8 ScoreDisplay

The hero score cluster on /home and /scan public. The Ring wraps this component.

```tsx
interface ScoreDisplayProps {
  score: number;          // 0–100
  delta: number;          // signed
  statusLabel: string;    // "Healthy and gaining."
  isActing: boolean;      // drives ring pulse
  size?: 'hero' | 'report';  // hero = 200px ring, report = 120px ring
}
```

Layout: horizontal cluster. Left: Ring (200px diameter) containing score number at center. Right of ring: delta (32px InterDisplay, `tnum`, semantic color) at score baseline, then status label (18px Inter 400, `--color-ink-3`) at same baseline, separated by a 24px `──── ` dash in `--color-ink-4`.

Score number inside ring: 96px InterDisplay 500, `tnum, cv11, ss03`, `--color-ink`. Centered within the ring using absolute positioning.

On first load: `motion/score-fill` (0 → final value, 800ms ease-out-expo).

---

### 4.9 Sparkline

Inline trend chart for score trend, engine mini-charts, KPI card sparklines.

```tsx
interface SparklineProps {
  data: number[];           // ordered array of values
  width: number;
  height: number;
  color?: string;           // default: --color-brand
  strokeWidth?: number;     // default: 1.5 (KPI card inline) or 2 (trend chart)
  animated?: boolean;       // triggers motion/path-draw on mount
  tooltip?: boolean;        // shows date + value on hover
}
```

Rendering: `perfect-freehand` library. Settings: `thinning: 0.5`, `jitter: 0.02` (2%), `size: 1.5`. This produces a line that reads as drawn, not plotted.

No axes. No grid lines. No fill. The line is the data.

Animated variant: `clip-path: inset(0 100% 0 0)` → `clip-path: inset(0 0% 0 0)` over 1000ms standard curve. Fires via `motion/path-draw` on mount.

Hover tooltip: single crosshair line (1px `--color-border-strong`) + tooltip with `text-mono` date and value, `--shadow-md`, 8px border-radius.

---

### 4.10 EmptyState

Displayed when a list, table, or surface has no content.

```tsx
interface EmptyStateProps {
  illustration?: 'laptop-leaf' | 'none';   // Rough.js illustration option
  headline: string;                         // Fraunces 300 22px
  subtext?: string;                         // Inter 400 14px --color-ink-3
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

The `laptop-leaf` illustration: 96×96 SVG, Rough.js rendered. A closed laptop with a single small leaf resting on it. Roughness 1.0, stroke `--color-ink-3`, fill none, fixed seed. Represents "done, calm, at rest." Used on /inbox empty state only. Other empty states use `illustration='none'` unless specifically designed.

Headline: 22px Fraunces 300, `--color-ink-2`. This is the one place on a non-artifact product surface where Fraunces appears — empty states are emotionally significant moments.

Subtext: 14px Inter 400, `--color-ink-3`. Max one sentence.

Action: ghost PillButton `md` size.

Vertical layout: illustration (if present) → 24px gap → headline → 8px gap → subtext → 16px gap → action.

---

### 4.11 CrewMonogram

Circle representing an agent. Used in /crew roster, /workspace step list, /inbox filter rail, EvidenceCard.

```tsx
interface CrewMonogramProps {
  agentType: AgentType;
  size: 'sm' | 'md' | 'lg' | 'hero';  // 16 / 32 / 48 / 96px
}
```

Size map:

| Size token | Diameter | Font size | Use |
|---|---|---|---|
| sm | 16px | 8px | EvidenceCard, table row inline |
| md | 32px | 14px | /crew card top-left, /inbox agent filter |
| lg | 48px | 20px | /workspace agent list |
| hero | 96px | 40px | /crew agent profile page |

Rendering: Rough.js circle, roughness 0.8, fixed seed per `agentType`. Each agent has a fixed color from the Margin color table (see Section 2.4). The agent's initial or glyph is centered in the circle.

`roughness: 0.8` means the circle reads slightly organic, slightly drawn. The fixed seed means the same agent always has the same circle — their "portrait."

---

### 4.12 TopbarStatus

A single 6px dot in the topbar chrome showing system activity state.

```tsx
interface TopbarStatusProps {
  isActing: boolean;
}
```

Dot specs:
- Diameter: 6px
- Color: `--color-brand` (#3370FF)
- Border-radius: 50%
- Transition: opacity 0.6 → 1.0 → 0.6 via `motion/topbar-status` (1600ms sine-in-out, infinite) when `isActing` is true
- When idle: static dot at 40% opacity (the subtle presence — Beamix is here, watching, not working)

Position: right-aligned in topbar, to the left of the profile icon, 12px right padding.

---

### 4.13 SectionHeading

Eyebrow label for section starts.

```tsx
interface SectionHeadingProps {
  label: string;     // "THIS WEEK'S NET EFFECT"
  className?: string;
}
```

Visual: 11px Inter 500, uppercase, `letter-spacing: 0.08em`, `--color-ink-4`. No icons, no decorations. Just the text. The restraint is the style.

---

### 4.14 MutedSubtext

Secondary explanatory text beneath a primary value or heading.

Visual: 12–13px Inter 400, `--color-ink-3`, line-height 1.5. Use 12px under dense KPI cards; 13px under standalone headings.

---

## 5. Cross-Surface Design System (5 Travel Moves)

Seven surfaces. Five moves that bind them into one system.

**The 7 surfaces:** Marketing website (Framer), Product app (Next.js), /scan public, Monday Digest email, Monthly Update PDF + permalink, Event-triggered email, OG share card.

---

### Move 1 — The Seal travels

The Rough.js Beamix seal mark appears on every surface that carries a completed artifact or Beamix authorship:

| Surface | Seal size | Position | State |
|---|---|---|---|
| Brief (product) | 24px | Bottom-right of the Brief container | Animated on signing |
| Monthly Update PDF | 24px top, 32px bottom | Top header region, bottom closing region | Static |
| OG share card | 24px | Bottom-right corner | Static |
| /scan public footer | 20px | Below CTA | Static |
| Monday Digest email header | 20px | Right of "Beamix" wordmark | Static |
| Event-triggered email | 16px | Next to from-line | Static |

The seal is always the same Rough.js path. The size varies. The roughness is 0.6 and the seed is fixed (the brand seed, not user-derived). The seal is always `--color-ink` at 80% opacity — it reads as authorship ink, not as a colorful brand badge.

### Move 2 — The signature line travels

`"— your crew"` in 22px Fraunces 300 italic appears at the end of every artifact Beamix authors. Verbatim, no variations.

| Surface | Size | Placement |
|---|---|---|
| Brief (product, onboarding) | 22px | Below Brief text, after seal appears |
| Monthly Update PDF | 22px | Final line, after closing paragraph |
| Monday Digest email | 18px | Last line before unsubscribe footer |
| Event-triggered email | 18px | Last line |
| /scan public CTA section | 22px | Below "Run weekly. Fix automatically." |
| Marketing site footer | 18px | Final footer line |

### Move 3 — The Activity Ring travels

The same Ring geometry (200px, 2px stroke, `--color-brand`, 30° gap at 1:30 position) appears across surfaces, in its contextually appropriate state:

| Surface | Ring state | Size |
|---|---|---|
| /home | Live, pulsing when acting | 200px |
| /scan public (during reveal) | Draws from 0 to 252° as score appears | 200px |
| Monthly Update PDF | Static, cycle-snapshot | 120px |
| OG share card | Static | 96px |
| Marketing site hero | Animated (CSS, perpetual slow rotation of the gap mark) | Variable |

### Move 4 — Crew Traces travel

The Rough.js underline trace (roughness 0.6, 28% opacity, 1.5px stroke, `--color-brand`) appears under recently-touched text on multiple surfaces:

| Surface | Where traces appear |
|---|---|
| /home | Editorial summary line, activity rows, KPI labels |
| Monday Digest email | Nouns the agents acted on in the past 24h |
| Monthly Update "What we did" | Specific numbers and entity names |
| /workspace | Output panel: text the agent just generated |

### Move 5 — The Margin travels

The 24px left-edge vertical strip with accumulated Rough.js agent-fingerprint marks appears on every artifact:

| Surface | Margin presence |
|---|---|
| /scans table | Each row's left 24px |
| /workspace step list | Step connector area |
| Monthly Update PDF | Full-height left margin |
| Monday Digest email | Full-height left strip (16px on email, screen narrower) |
| /home "Receipts" | Row-level margin marks |

---

### What is surface-specific (does NOT travel)

| Surface | What is unique to it |
|---|---|
| Product app chrome | White paper surface, clinical tables, full component library |
| /scan public | Cream paper (`--color-paper-cream`), full Fraunces body, strikethrough-and-rewrite mechanic |
| Monthly Update PDF | Cream paper throughout, full Stripe-Press-grade margins, print typography settings |
| Monday Digest email | 32px cream header strip, white body |
| OG share card | Cream paper, Fraunces domain name in h1, Ring at 96px, no product chrome |
| Marketing site (Framer) | Cream and white alternating sections, marketing-pill buttons (full radius on all), hero animations |

---

## 6. The 4 Visual Registers

Every surface belongs to exactly one register. The register determines which tokens apply and which feel applies.

---

### Register 1 — Editorial Artifact

**Surfaces:** /scan public, Brief (onboarding step 3), Monthly Update PDF, email digest header (32px strip), OG share card.

**When it applies:** Any surface that is an artifact the user could hold, print, or share. Not product chrome.

**Token swaps:**
- Background: `--color-paper-cream` (#F7F2E8)
- Primary body font: Fraunces 300 (instead of Inter)
- Heading font: still InterDisplay for large numbers, but Fraunces for prose headings
- Border: none on the artifact itself (the paper edge is the border)
- Shadow: `--shadow-lg` on the artifact container in a product context

**Distinctive treatments:**
- Hyphenation: enabled (`hyphens: auto`)
- Optical kerning: `font-kerning: normal`
- No widows or orphans: `widows: 2; orphans: 2`
- Margins: 96px web, 1.25in print
- The Margin strip is present
- The Seal is present
- The signature line is present

---

### Register 2 — Journey Canvas

**Surfaces:** /workspace.

**When it applies:** When Beamix is actively executing a multi-step task and the user is watching.

**Token swaps:**
- Background: `--color-paper` (white — not cream; cream is for artifacts, not execution)
- Rough.js step markers: roughness 0.8
- Hand-drawn step connector lines: 1.5px, 28% opacity `--color-brand`
- Active step pulse: `motion/ring-pulse` timing applied to the step circle
- Microcopy rotation: `motion/microcopy-rotate` on active substep

**Distinctive treatments:**
- No horizontal dividers between steps — the hand-drawn connector line is the structure
- Live output panel on the right renders the actual work being produced
- SectionHeading is absent — the journey is self-evident

---

### Register 3 — Data Intelligence

**Surfaces:** /home, /competitors, /scans.

**When it applies:** The primary data-facing product surfaces. The user is reading intelligence, not watching execution, not reviewing an artifact.

**Token swaps:**
- All standard tokens apply, no swaps
- Tabular numerals enforced on every data element
- Rough.js restricted to Crew Traces and Margin marks only
- Clinical table grammar on /scans and /competitors
- InterDisplay used for KPI hero numbers; Inter for everything else

**Distinctive treatments:**
- Per-engine strip uses `EngineChip` components
- Score cluster uses `ScoreDisplay` component
- Activity feed uses `EvidenceCard` components with Traces
- KPI cards use `CardSurface` with hover sparkline (sparkline appears on hover, fades on mouseout, no animation on hover sparkline — instant)

---

### Register 4 — Admin Utility

**Surfaces:** /inbox chrome (filter rail, list, action buttons), /crew chrome, /schedules, /settings.

**When it applies:** The user is configuring, administrating, or reviewing structured operational data. Minimum craft, maximum clarity.

**Token swaps:**
- No Rough.js (except: /crew agent profiles each get one Rough.js monogram mark)
- No Fraunces (except: /inbox empty state headline, /inbox review-debt counter)
- No Crew Traces
- No Seal (except: /inbox Approve button hover — foreshadowing the approval ceremony)
- Base font size steps down to 14px (text-base at 14px, labels at 11px) in dense list contexts

**Distinctive treatments:**
- /schedules: Stripe-replica severity. The one craft move is the inline schedule-timeline on row expand (5 upcoming runs in Geist Mono, 11px caps, `--color-brand` dot for today)
- /settings: Stripe-replica form grammar. Three deviations: Brief tab (full Brief with version history), Truth File tab (field-by-field editor with Margin marks showing which agent last consulted each field), Phone numbers tab (Geist Mono table)

---

## 7. Anti-Patterns (Banned Moves)

These design choices must not appear in Beamix under any circumstances. The list is specific. "We thought it looked nice" is not an exception.

### Visual anti-patterns

- **Gradient backgrounds on cards.** No gradient fills on any card surface. Cards are flat paper. Gradients on cards read AI-generated.
- **Skeleton-shimmer loading states.** No animated gradient shimmer on loading skeletons. Loading skeletons use `--color-paper-elev` static fill, matching the exact layout they will fill. The shimmer is a cheap tell.
- **Generic 3-column card grids.** The default "three cards across a row" layout is forbidden unless explicitly specified in a page design. Most data at Beamix is better served by a table, a list, or a purpose-built KPI row.
- **Cream as a chrome color.** `--color-paper-cream` is reserved for artifacts only (Section 1.1). Putting cream on product chrome (sidebar, topbar, cards) breaks the artifact signal and makes everything look like an old Mac OS theme.
- **Colored icons.** Icons are `--color-ink-3` by default. Active state icons: `--color-ink`. Never brand-blue icons — blue is reserved for the ring, the trace, and brand CTAs. Multi-colored icon sets are forbidden.
- **AI-purple.** No `#6366F1`, no `#8B5CF6` as a brand accent. These were retired in BRAND_GUIDELINES v4.0. The only accent is `#3370FF`.
- **Drop shadows on text.** Never. Not on headings, not on score numbers, not on labels.
- **Per-engine logos in engine pills.** Engine chips do not use ChatGPT, Google, or Perplexity logos. They use the engine name in 11px caps with a Geist Mono feel. Including real brand logos creates trademark risk, visual noise, and makes locked-tier states visually inconsistent.
- **Illustration-heavy empty states.** Only /inbox uses the `laptop-leaf` illustration. All other empty states use the headline-only variant. Illustrations are earned, not default.

### Motion anti-patterns

- **Looping animations on idle dashboards.** When no agent is acting, nothing loops. A pulsing topbar dot on an idle product is a lie. Reserve all continuous animations for acting state only.
- **Simultaneous entrance animations on multiple unrelated elements.** Every element on /home enters on a choreographed schedule (see Section 3.2). Ad-hoc animations added to individual components must not fire independently of the orchestration.
- **Wipe or slide transitions on microcopy rotation.** The `/workspace` microcopy rotation uses opacity cross-fade only — never a slide. A text slide feels like a marquee sign. An opacity cross-fade feels like a thought changing.
- **Confetti or celebratory particle effects.** At any scale, in any context. Not on approval. Not on first scan. Not on first attribution. Beamix's celebration is the Ring closing for 800ms. That is enough.
- **Page transition animations between product routes.** Navigation is instant. No full-page wipes, fades, or slides on route change. Motion lives at the component level, not the route level.

### Copy anti-patterns

- **"Welcome back, [Name]"** as a greeting on /home. The score is the greeting.
- **"Magic," "discover," "unlock," "powerful," "game-changer"** in any microcopy. Beamix's voice is direct and specific. These words are weasel words.
- **Placeholder data.** Never "John Doe," "99.99%," "Company Name," or "example.com" in any shipped UI component. If real data is unavailable, use a specifically designed empty state.
- **"AI" as a label on outputs.** Agent output reads as Beamix output. No "AI-generated" labels, no "Powered by ChatGPT" attribution on individual outputs. The Brief tab in /settings may note the agent architecture generally; no output-level labels.
- **Exclamation points.** In UI copy. In status messages. In notifications. Beamix never shouts.
- **"Pro mode" toggles or "Advanced" checkboxes.** Progressive disclosure via chevron and drill-down, not mode toggles. The /crew surface is the power-user surface. There is no "pro mode" toggle on other surfaces.

---

## 8. Frontend Implementation Notes

### 8.1 Stack

```
Next.js 16 (App Router)
React 19
TypeScript (strict mode)
Tailwind CSS
Shadcn/UI (for primitives: dialogs, dropdowns, tooltips)
Rough.js (^4.6) — hand-drawn elements: Ring terminus, Traces, Seal, Margin marks, step markers, illustrations
perfect-freehand — sparklines, Rivalry Strip dual-sparkline
```

Shadcn/UI provides accessible primitive behavior (focus management, ARIA, keyboard navigation). The visual layer is entirely custom. Never use Shadcn/UI default visual styles without overriding them with design system tokens.

### 8.2 File organization

```
apps/web/
  src/
    design-system/
      tokens.css          — all CSS custom properties (colors, spacing, shadows, radii)
      typography.css      — font-face declarations, font-feature-settings classes
      animations.css      — all @keyframes + motion token classes
      
    components/
      primitives/
        StatusToken.tsx
        DecisionCard.tsx
        PillButton.tsx
        CardSurface.tsx
        TableRow.tsx
        EvidenceCard.tsx
        EngineChip.tsx
        ScoreDisplay.tsx
        Sparkline.tsx
        EmptyState.tsx
        CrewMonogram.tsx
        TopbarStatus.tsx
        SectionHeading.tsx
        MutedSubtext.tsx
        
      sigils/
        ActivityRing.tsx
        CrewTrace.tsx        — wrapper that applies Rough.js underline to children
        SealMark.tsx
        MarginStrip.tsx      — the 24px vertical strip container
        
      layout/
        PageChrome.tsx       — sidebar + topbar wrapper
        ArtifactContainer.tsx  — cream-paper wrapper for editorial register
        
    lib/
      rough-utils.ts       — shared Rough.js config factories (getSeed, getTraceConfig, getSealConfig)
      motion.ts            — framer-motion variants for each motion token
      
    styles/
      globals.css          — imports tokens.css, typography.css, animations.css
```

### 8.3 Tailwind config mapping

Extend `tailwind.config.ts` to map all tokens:

```ts
// tailwind.config.ts (extension keys — values reference CSS vars)
theme: {
  extend: {
    colors: {
      brand: 'var(--color-brand)',
      'brand-deep': 'var(--color-brand-deep)',
      'brand-soft': 'var(--color-brand-soft)',
      'brand-text': 'var(--color-brand-text)',
      paper: 'var(--color-paper)',
      'paper-elev': 'var(--color-paper-elev)',
      'paper-cream': 'var(--color-paper-cream)',
      ink: 'var(--color-ink)',
      'ink-2': 'var(--color-ink-2)',
      'ink-3': 'var(--color-ink-3)',
      'ink-4': 'var(--color-ink-4)',
      border: 'var(--color-border)',
      'border-strong': 'var(--color-border-strong)',
      'score-excellent': 'var(--color-score-excellent)',
      'score-good': 'var(--color-score-good)',
      'score-fair': 'var(--color-score-fair)',
      'score-critical': 'var(--color-score-critical)',
      'needs-you': 'var(--color-needs-you)',
    },
    fontFamily: {
      display: ['InterDisplay', 'sans-serif'],
      sans: ['Inter', 'sans-serif'],
      mono: ['GeistMono', 'monospace'],
      serif: ['Fraunces', 'serif'],
    },
    fontSize: {
      'display': ['6rem', { lineHeight: '6rem', letterSpacing: '0' }],
      'h1': ['3rem', { lineHeight: '3.5rem' }],
      'h2': ['2rem', { lineHeight: '2.5rem' }],
      'h3': ['1.375rem', { lineHeight: '2rem' }],
      'lg': ['1.125rem', { lineHeight: '1.75rem' }],
      'base': ['0.9375rem', { lineHeight: '1.5rem' }],
      'sm': ['0.8125rem', { lineHeight: '1.25rem' }],
      'xs': ['0.6875rem', { lineHeight: '1rem' }],
    },
    borderRadius: {
      card: '12px',
      chip: '8px',
      pill: '9999px',
      sm: '6px',
    },
    boxShadow: {
      sm: 'var(--shadow-sm)',
      md: 'var(--shadow-md)',
      lg: 'var(--shadow-lg)',
      focus: 'var(--shadow-focus)',
    },
    spacing: {
      // Only the 8px-grid values — enforced via custom spacing scale
      // 4, 8, 12, 16, 24, 48, 72, 120 + the exceptions 6, 10
    },
  }
}
```

### 8.4 CSS custom properties file

All tokens declared in `:root` with `[data-theme="dark"]` overrides:

```css
/* design-system/tokens.css */
:root {
  --color-brand: #3370FF;
  --color-brand-deep: #1F4FCC;
  --color-brand-soft: rgba(51,112,255,0.06);
  --color-brand-text: #2558E5;
  
  --color-paper: #FFFFFF;
  --color-paper-elev: #FAFAF7;
  --color-paper-cream: #F7F2E8;
  
  --color-ink: #0A0A0A;
  --color-ink-2: #3F3F46;
  --color-ink-3: #6B7280;
  --color-ink-4: #9CA3AF;
  
  --color-border: rgba(10,10,10,0.06);
  --color-border-strong: rgba(10,10,10,0.12);
  
  --color-score-excellent: #06B6D4;
  --color-score-good: #10B981;
  --color-score-fair: #F59E0B;
  --color-score-critical: #EF4444;
  --color-needs-you: #D97706;
  --color-healthy: #10B981;
  --color-acting: #3370FF;
  
  --shadow-sm: 0 1px 2px rgba(10,10,10,0.04), 0 1px 1px rgba(10,10,10,0.03);
  --shadow-md: 0 4px 6px rgba(10,10,10,0.05), 0 2px 4px rgba(10,10,10,0.04);
  --shadow-lg: 0 10px 20px rgba(10,10,10,0.08), 0 4px 8px rgba(10,10,10,0.05);
  --shadow-focus: 0 0 0 3px rgba(51,112,255,0.25);
}

[data-theme="dark"] {
  --color-brand: #5A8FFF;
  --color-brand-deep: #3370FF;
  --color-brand-soft: rgba(90,143,255,0.10);
  --color-brand-text: #7AAEFF;
  
  --color-paper: #0E0E10;
  --color-paper-elev: #16161A;
  --color-paper-cream: #1A1812;
  
  --color-ink: #F5F5F2;
  --color-ink-2: #D4D4D8;
  --color-ink-3: #9CA3AF;
  --color-ink-4: #6B7280;
  
  --color-border: rgba(255,255,255,0.08);
  --color-border-strong: rgba(255,255,255,0.14);
  
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.20);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.28);
  --shadow-lg: 0 10px 20px rgba(0,0,0,0.36);
}
```

### 8.5 Rough.js integration

```ts
// lib/rough-utils.ts

import rough from 'roughjs';

// Consistent seeds: user-derived for Traces (so the same user sees the same mark),
// agent-derived for Monograms (same agent always same circle),
// brand-fixed for Seal (always the same mark)
export function getTraceSeed(userId: string, content: string, day: string): number {
  const str = userId + content + day;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export const TRACE_CONFIG = {
  roughness: 0.6,
  strokeWidth: 1.5,
  stroke: 'rgba(51, 112, 255, 0.28)',
  fill: 'none',
  bowing: 0.5,
};

export const SEAL_SEED = 42;  // brand-fixed
export const SEAL_CONFIG = {
  roughness: 0.6,
  strokeWidth: 1.5,
  stroke: 'rgba(10,10,10,0.80)',
  fill: 'none',
};

export const STEP_MARKER_CONFIG = {
  roughness: 0.8,
  strokeWidth: 1.5,
  fill: 'none',
};

// Monogram configs per agent
export const AGENT_COLORS: Record<AgentType, string> = {
  schema_doctor: '#6366F1',
  citation_fixer: '#10B981',
  faq_agent: '#F59E0B',
  competitor_watch: '#EF4444',
  trend_spotter: '#8B5CF6',
  brand_voice_guard: '#EC4899',
  content_refresher: '#0EA5E9',
  // remaining agents cycle through remaining palette
};
```

### 8.6 Motion implementation

Use Framer Motion for the 12 motion tokens. Define variants once in `lib/motion.ts`, import in components.

```ts
// lib/motion.ts — variant definitions (structural)
export const motionVariants = {
  cardEntrance: {
    hidden: { translateY: 6, opacity: 0 },
    visible: {
      translateY: 0,
      opacity: 1,
      transition: { duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }
    }
  },
  pillSpring: {
    initial: { scale: 0.96 },
    animate: { scale: [0.96, 1.04, 1.0] },
    transition: { duration: 0.28, ease: [0.34, 1.56, 0.64, 1] }
  },
  traceEntrance: {
    hidden: { opacity: 0 },
    visible: { opacity: 0.28, transition: { duration: 0.3, ease: 'linear' } }
  },
  // ... remaining tokens
};
```

Apply `prefers-reduced-motion` globally:

```css
/* animations.css */
@media (prefers-reduced-motion: reduce) {
  /* All Framer Motion animations are suppressed via the hook below.
     Non-JS animations suppressed here: */
  .animate-ring-pulse,
  .animate-topbar-status {
    animation: none !important;
    opacity: 1 !important;
  }
}
```

In React, gate all Framer Motion animations with `useReducedMotion()` from Framer Motion. When true, skip variant-driven animations and render the final state directly.

### 8.7 Naming conventions

| Type | Convention | Example |
|---|---|---|
| CSS custom property | `--color-[name]`, `--shadow-[size]`, `--radius-[name]` | `--color-brand`, `--shadow-md` |
| Tailwind extension | kebab-case matching CSS var name | `bg-brand-soft`, `text-ink-3` |
| Motion token | `motion/[name]` in docs, `motionVariants.[camelCase]` in code | `motionVariants.cardEntrance` |
| Component file | PascalCase, descriptive | `ScoreDisplay.tsx`, `ActivityRing.tsx` |
| Agent type enum | snake_case | `'schema_doctor'`, `'citation_fixer'` |

### 8.8 WCAG requirements

All text/background combinations must meet WCAG 2.2 AA minimum (4.5:1 for body text, 3:1 for large text and UI components).

Critical checks:
- `--color-brand-text` (#2558E5) on `--color-paper` white: passes AA for body text. Do not use `--color-brand` (#3370FF) directly as body text color — it fails AA.
- `--color-ink-3` (#6B7280) on `--color-paper`: 4.6:1 — passes AA at 15px. At 11–12px, use `--color-ink-2` instead.
- `--color-score-critical` (#EF4444) on white: 3.9:1 — passes large text, fails body text. Do not use as body text. Supplement critical state with an icon or label, not color alone.
- Focus ring `--shadow-focus` (3px `rgba(51,112,255,0.25)`) must have a fallback solid outline for high-contrast mode: `outline: 2px solid #3370FF` on `:focus-visible`.

All interactive elements carry visible focus indicators. No `outline: none` without a custom focus style replacement.

---

## Appendix — Quick Reference

**Brand blue:** `#3370FF` (chrome accent) / `#2558E5` (text)
**Cream artifact:** `#F7F2E8` (never on chrome)
**Primary surface:** `#FFFFFF` / elevated `#FAFAF7`
**Ink:** `#0A0A0A` / muted `#6B7280` / very muted `#9CA3AF`
**Borders:** `rgba(10,10,10,0.06)` default / `rgba(10,10,10,0.12)` strong
**Type: score** InterDisplay 500 96px `tnum cv11 ss03`
**Type: heading** InterDisplay 500 22–48px `cv11`
**Type: body** Inter 400 15px lh 24px
**Type: mono** Geist Mono 400 13px `tnum ss01`
**Type: artifact** Fraunces 300 22–28px SOFT 100 WONK 0 opsz 144
**Spacing grid:** 4px micro / 8px base. Allowed: 4 8 12 16 24 48 72 120
**Card radius:** 12px / chip: 8px / pill CTA: 9999px
**Motion budget /home:** 1600ms total
**Score count-up:** 800ms `cubic-bezier(0.16,1,0.3,1)`
**Ring pulse:** 1200ms `cubic-bezier(0.4,0,0.6,1)` infinite (acting only)
**Path draw:** 1000ms `cubic-bezier(0.4,0,0.2,1)`
**Seal draw:** 800ms `cubic-bezier(0.4,0,0.2,1)`
**Card entrance:** 200ms `cubic-bezier(0.34,1.56,0.64,1)`
**Rough.js Trace:** roughness 0.6, 1.5px stroke, 28% brand-blue opacity
**Rough.js Seal:** roughness 0.6, 1.5px stroke, 80% ink opacity
**Rough.js Monogram:** roughness 0.8, fixed seed per agent type
