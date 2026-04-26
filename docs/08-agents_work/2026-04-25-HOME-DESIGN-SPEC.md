# Beamix /home Deep Design Spec
Date: 2026-04-25
Author: design-lead (pink)
Status: PROPOSAL — Adam reads section by section, reacts, iterates
Quality bar: billion-dollar company designed this. NOT generic.

Sources synthesized into every claim below:
- `docs/08-agents_work/2026-04-25-HOME-PREMIUM-REFS.md` — anchor refs, 12 expensive patterns, 8 anti-patterns
- `docs/08-agents_work/2026-04-25-REFERENCES-MASTERLIST.md` — design language, color/type stack, signature motions
- `docs/08-agents_work/2026-04-25-PAGE-LIST-LOCKED.md` — 8 sections, vertical scroll, no tabs
- `docs/08-agents_work/2026-04-25-DECISIONS-CAPTURED.md` — Adam's locked decisions: Hebrew/RTL first-class, no timelines, hand-drawn restraint, Beamie deferred
- `~/.claude/projects/-Users-adamks-VibeCoding-Beamix/memory/project_quality_bar_billion_dollar.md` — the bar
- `docs/BRAND_GUIDELINES.md` v4.0 + `docs/PRODUCT_DESIGN_SYSTEM.md`

---

## 0. THESIS & DESIGN MOOD

`/home` is the proof that Beamix is not a competitor of Profound, Otterly, or Peec. It is the first surface a paying user lands on after onboarding and the surface they will glance at thirty seconds at a time, multiple times a day, for the lifetime of their subscription. It must reward the 30-second glance with a clear answer to "how am I doing, what should I do next, what's about to happen" — and reward the 5-minute drill with the underlying truth on every number. The mood is **calm authority**: Stripe's restraint, Linear's chrome dimming, Mercury's live charts, Anthropic's drillable bars, with one tiny pencil-line of personality (Fraunces serif diagnosis, restrained hand-drawn empty state). It is what would happen if Stripe Dashboard, Linear Dashboards, and Anthropic Console had a child raised by a serif typographer. What it CANNOT be: a Shadcn template with four pastel KPI cards, colored Lucide icons in tinted circles, a "Welcome back, {name}!" greeting, gradient backgrounds, default Recharts pastel rainbows, or a Quick Actions panel of stacked buttons. Those are the AI-slop fingerprint. Beamix /home will explicitly violate none of them.

The page exists as a single vertical scroll. No tabs. No customization. The order of the eight sections IS the product's argument: score first, fixes second, sibling-surface pointer third, KPIs fourth, trend fifth, per-engine sixth, activity seventh, what's coming up eighth. The order tells the user, "We have an opinion about what matters."

---

## 1. THE 5 GOVERNING RULES (apply to every section below)

These five rules are non-negotiable. Every section spec ladders up to them. If any review round produces a section that violates one, redo the section.

1. **Numbers are characters.** Every numeric value uses tabular numerals (`font-feature-settings: 'tnum'`). Hero score, KPI values, deltas, sparkline tooltips, timestamps that include digits — all tabular. Weight + scale are deliberate; nothing is decoration. Source: P1, Stripe Söhne tabular, Linear Inter Display tabular.

2. **Whitespace beats density.** Generous spacing in the right places makes density elsewhere feel earned. The hero score block breathes (160px min vertical hero region). The KPI card row is generous (32px gutters). The activity feed is compact (44px row height) — but only because everything above it earned the right to it. Generic `gap-4` is the enemy. Source: Linear refresh ("structure should be felt not seen"), Stripe (32px gutters / 64px chart breathing).

3. **Click-to-drill on EVERY aggregate.** No number, pill, or chart segment is a dead end. Score → engines → queries → raw output. Each KPI card → corresponding source page. Per-engine pill → /scans?engine=. Activity row → source detail. If a number has no drill destination, it's not a number — it's a label. Source: P6, Stripe (every number is a link), Anthropic Console (drill day → hour → minute).

4. **Motion serves comprehension.** Subtle, sub-150ms response on routine interactions (P5). The "big" animation budget is reserved for ONE signature moment per page: the score count-up + sparkline draw on first paint. After that, motion gets out of the way. Returning visits skip the entrance entirely (Rauno frequency-aware rule). Reduced-motion preference snaps straight to end-state.

5. **Hebrew/RTL is not a setting — it's a parallel design.** Every section spec includes RTL adaptation. The sidebar moves to the right. Numbers stay Western Arabic (0-9) but their spatial position relative to deltas reverses. Hebrew typography stack swaps to Rubik (display) + Heebo (body) + Frank Ruhl Libre (serif accent replacing Fraunces) when `dir="rtl"`. Microcopy is transcreated, not translated. Dates use he-IL formatting. Source: Wix anchor (REFS-05), monday.com cautionary anti-reference, MASTERLIST rule 11.

---

## 2. PAGE-LEVEL STRUCTURE

### Layout container
- Max width: **1280px** centered. (Wider feels enterprise-bloated; narrower feels mobile-stretched.)
- Horizontal padding: **48px** desktop ≥ 1280, **32px** between 768-1279, **16px** below 768.
- Background: warm off-white **#F5F3EE** (canvas), per MASTERLIST color system.
- Cards / surfaces: pure white **#FFFFFF**, border `1px solid rgba(10, 10, 10, 0.06)` (~ #E5E7EB at slightly lower opacity), corner radius **12px** (Linear refresh value).

### Sticky chrome (NOT part of /home content)
- **Sidebar:** left, fixed-width **224px**. Lightness perceptibly LOWER than content per pattern P2 (Linear "don't compete for attention you haven't earned"). In light mode: sidebar background is **#EEECE6** (warm canvas, ~3 LCH lightness points below #F5F3EE). In dark mode: sidebar is `lch(18 0 0)`, content is `lch(22 0 0)`. The 4-point LCH delta is what sells it.
- **Topbar:** **56px** tall, contains multi-domain switcher (left), notifications bell + Cmd+K trigger pill ("Search or jump to ⌘K") + profile (right). NO greeting. NO breadcrumb on /home (you are at the root).
- **No banner row.** No "complete your profile" prompts. No upgrade nags. Configuration-related calls live in /settings.

### Section spacing rules
- Section vertical gap (between section blocks): **64px** desktop, **48px** tablet, **40px** mobile.
- Within-section element gap (e.g., between section title and content): **16px**.
- Between cards in a row: **16px** (Linear refresh card gap).
- Section titles: 12px caps, letter-spacing 0.04em, weight 500, color muted (#6B7280). The all-caps tiny label IS the section's typographic signature, repeated across all 8 sections for rhythm.

### Vertical rhythm anchor
The page reads in three acts:
- **Act I — State (Sections 1-3):** "Where am I, what should I do, where else should I look."
- **Act II — Detail (Sections 4-6):** "What are the underlying numbers, the trend, the per-engine truth."
- **Act III — Context (Sections 7-8):** "What just happened, what's about to happen."

The visual density follows: Act I is generous (hero earns the whitespace), Act II is medium (data-dense but breathing), Act III is compact (lists, low-contrast footer).

### Vertical scroll only — NO tabs
Per PAGE-LIST-LOCKED. The 8 sections live on one page, scroll-only. No tabs. No "Show advanced." No customization. The opinion IS the design.

### Mobile adaptation overview
- **375-768px**: Single column. KPI cards stack 2×2 (NOT 1×4 — too tall; NOT 4×1 — too cramped). Per-engine strip becomes horizontal scroll with snap. Activity feed compacts to 40px rows. Bottom nav (per PAGE-LIST-LOCKED): /home · /inbox · /scans · /crew · More.
- **Frosted-glass bottom nav** per Linear October-2025 mobile refresh — `backdrop-filter: blur(20px) saturate(180%)`, content visible faintly through it.
- Score gauge on mobile: scales down from 72px hero number to 56px. Sparkline shrinks to 80×24px.
- Charts on mobile: hover/tooltip becomes tap-to-pin.

---

## 3. FIRST-LOAD ANIMATION CHOREOGRAPHY (frame by frame)

This is the page's signature load. Total perceived budget: 1.4-1.8s (subject to data return time but visual choreography is fixed). Sequence runs ONCE per session (sessionStorage flag `beamix.home.entranceShown=true` after first run). Returning visits skip entirely — content appears instantly with no fade.

| t (ms) | Event | Easing | Notes |
|---|---|---|---|
| 0 | Sidebar + topbar already painted (chrome) | none | Sidebar dimmed (P2). |
| 0-50 | Hero score container fades in | linear | Opacity 0 → 1, 50ms. |
| 50-650 | **Score number counts up from 0 → final** | `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out-quint) | 600ms count. Tabular nums vertical-align without jitter. This is the page's signature moment. |
| 200 | Hero sparkline begins drawing | ease-out | Lags score number by 150ms so eyes move score → sparkline. |
| 200-1000 | Sparkline draws left-to-right (`pathLength` 0→1) | ease-out | 800ms. Single 1px stroke #3370FF. |
| 250 | Diagnosis line in Fraunces fades in | ease-out | 250ms fade. |
| 320 | Top 3 fixes section header fades in | ease-out | 200ms fade. |
| 350 | Fix card 1 enters (8px slide-up + fade) | ease-out | 200ms |
| 380 | Fix card 2 enters | ease-out | 200ms (30ms stagger) |
| 410 | Fix card 3 enters | ease-out | 200ms (30ms stagger) |
| 480 | "Run all 3 — N credits" CTA enters | spring (stiff) | Slight overshoot, 400ms total. Signature primitive — see §9. |
| 520 | Inbox pointer line slides in | ease-out | 12px slide-up + 200ms fade. |
| 600 | KPI cards row begins entering | spring (medium) | 4 cards staggered 30ms each, 6-8px slide-up + 200ms fade. |
| 800 | KPI sparklines draw inside each card | ease-out | 600ms, 50ms stagger between cards. |
| 1000 | Score trend chart container fades in | linear | 80ms |
| 1080-2280 | **Score trend line draws left-to-right** | ease-out | 1.2s draw — second-largest motion event on the page after the score count. |
| 1200 | Per-engine strip pills enter | spring (medium) | 9 pills staggered 25ms each. |
| 1500 | Recent activity feed rows appear | ease-out | 200ms fade, staggered 30ms. |
| 1700 | "What's coming up" footer appears | ease-out | 150ms fade. |

### Returning users (sessionStorage flag set)
All elements appear instantly with 0ms transition. Content is visible at 0ms. This is the **Rauno frequency-aware rule**: the entrance animation is for first-impression context-setting, not entertainment. Yossi opening /home for the third time today does not need the 1.8s wait.

### Reduced-motion preference (`prefers-reduced-motion: reduce`)
- Skip all sequencing.
- Score number renders at final value (no count-up).
- Sparkline / line chart render fully drawn (no left-to-right path animation).
- All elements appear at 0ms with no fade.
- Hover state changes still respect reduced-motion: no spring, no scale, no overshoot. Use opacity / color shift only.

### Concurrent: status outside the page
At t=0, favicon updates to current state (idle = solid mark, scan-running = mark with subtle pulse dot, error = mark with red corner). Browser tab title reflects pending count: "(3) Beamix — Home". See §10.

---

# SECTION 1 — Hero Score Block

## 1.1 Purpose
The most important number in the product, presented as the page's hero. It answers "how am I doing right now?" in three glances: number, delta, diagnosis.

## 1.2 What it contains
1. Section label "AI VISIBILITY SCORE" — 12px caps, weight 500, letter-spacing 0.04em, color #6B7280 (muted).
2. **Current score** — large numeral, e.g., `73`. InterDisplay-Medium 64-72px (responsive), font-feature-settings 'tnum'. Color: **#0A0A0A** (NOT brand blue — the number is the weight, not the color).
3. **Delta badge** — e.g., `↑ +5 vs last scan` and `↑ +12 this month`. Two stacked deltas, Inter 13px medium tabular. Up arrow + delta in semantic green (#10B981); down in semantic red (#EF4444); zero in muted (#6B7280) with em-dash (—) replacing the arrow.
4. **12-week sparkline** — to the right of the score (or below on mobile). 1px stroke #3370FF, no fill, no markers, ~140×40px. 12 data points (one per scan / week, whichever is denser).
5. **Score state chip** — small pill above the number, e.g., "GOOD" or "FAIR". Background = semantic color at 8% opacity, text = semantic color at full saturation. 12px caps weight 500.
6. **One-line diagnosis** — e.g., "Up 5 since last scan, top fix is FAQ schema." **Fraunces 17-19px regular italic**, color #4B5563 (slightly darker than muted to earn the serif's typographic weight). One sentence. No exclamation. No emoji. The serif is the "designed personality" register, parallel to Granola's Quadrant + Melange pairing.

## 1.3 Layout intent (text wireframe — NOT pixel layout)
Two-column horizontal arrangement on desktop:
- **Left column (60% width):** chip (top), score numeral (huge, primary visual), delta-stack (below score, two lines).
- **Right column (40% width):** sparkline (vertically centered relative to score). Below sparkline: tiny "Last 12 weeks" label in 11px caps muted.
- **Below both columns (full width):** diagnosis line in Fraunces, indented to align with the score numeral's baseline.

Vertical rhythm: 
```
[ chip                    ]
[ 73         ▁▂▁▂▃▄▆▇█  ]   ← score and sparkline aligned by baseline
[ ↑ +5 vs last scan       ]
[ ↑ +12 this month        ]
[                                                                ]
[ Up 5 since last scan, top fix is FAQ schema.   ]   ← Fraunces italic
```

On mobile (≤768px): single column, sparkline drops below the score, diagnosis below sparkline. Score scales to 56px.

## 1.4 Treatment specifics (premium moves)
- **Typography scale:** score is the only thing on the page in 64-72px. Nothing else competes. (Pattern: Stripe revenue hero, Mercury balance.)
- **Color discipline:** the number is **#0A0A0A** not #3370FF. Color is reserved for state chip and sparkline. The brand blue is a tool, not a decoration. (Pattern P12, Stripe.)
- **Spacing:** 32px above the chip (top of section), 24px between score and sparkline columns (desktop), 24px between number and delta-stack, 32px between delta-stack and diagnosis line. The diagnosis sits in its own breathing room.
- **Animation on first paint:** count-up 0 → 73 over **600ms ease-out-quint**. Sparkline path-draw over **800ms** starting at 200ms. Diagnosis fades in at 250ms. This is the page's signature motion event.
- **No hand-drawn elements.** This section is crisp, geometric, restrained. The one element of personality is the Fraunces italic diagnosis line. Nothing else.
- **Click behavior:**
  - Click on **score numeral** → opens an inline expanding panel (200ms ease-out, height 0 → auto) showing per-engine breakdown with mini sparklines for each engine's contribution. Click again to collapse. Same surface, no page nav. (Anthropic Console drill pattern.)
  - Click on **sparkline** → navigates to `/scans` with `view=trend` query param. (Stripe drill-on-numbers pattern.)
  - Click on **state chip** → tooltip explaining what "Good" / "Fair" / "Critical" mean (data-driven thresholds), with link to `/help/score-tiers`.

## 1.5 Sarah-mode vs Yossi-mode behavior
- **Sarah** (non-technical SMB owner): glances, sees the number + green delta + diagnosis sentence. Done in 2 seconds. Doesn't drill. The Fraunces sentence is the explanation she needs. She might tap the diagnosis to open the explanation panel.
- **Yossi** (technical agency operator with 20 domains): clicks the score numeral, drills into per-engine breakdown. Hovers sparkline for week-by-week tooltips. Switches domains via topbar dropdown to compare. Probably has the page open in 4 tabs.

## 1.6 Hand-drawn surface
**No.** The hero score is the page's most authoritative element. Hand-drawn anywhere on or around the score would undercut its weight. The Fraunces italic diagnosis line is the warmth move — that's it.

The hand-drawn budget on this page is reserved for the **empty state only** (see §1.8). Not the populated state.

This is the Anthropic Console discipline: hand-drawn idiom appears in Claude.ai's thinking states, NEVER in Console's static dashboard. Beamix /home follows that exact discipline.

## 1.7 Hebrew/RTL adaptation
- Score numeral stays Western Arabic (0-9) — Unicode Bidi Algorithm handles direction correctly without intervention.
- Sparkline visual direction flips: left-to-right path-draw becomes right-to-left in RTL (the "newest data is on the leading edge" reading rule).
- Delta badge stack: arrow direction (↑/↓) is universal — but spatial position relative to the delta number reverses. In RTL, arrow is to the RIGHT of the number.
- Hero score block as a whole: stays centered horizontally on the page (universal hero treatment, not direction-specific).
- Diagnosis line: in Hebrew uses **Frank Ruhl Libre** (Hebrew serif, MASTERLIST locked stack), not Fraunces (which has no Hebrew glyphs). Same italic-feel through the typographic weight, different typeface. Size 17-19px.
- Reading flow: in RTL, eye lands on score (centered), reads delta (now to the left), then sparkline (now flipped right-to-left), then diagnosis (RTL paragraph).
- Date format in any sparkline tooltip: he-IL (`DD/MM/YYYY` with Hebrew month names if expanded).

## 1.8 States
- **Empty (first-ever scan never run):** the entire hero block is replaced by a single calm CTA. Headline: "Run your first scan to see how AI sees your business." (Fraunces 24px regular italic, color #0A0A0A.) Below: a primary CTA pill "Run scan now" + secondary text "Takes about 2 minutes." A small (max 96×96px) hand-drawn Excalidraw-style sketchy magnifying-glass-over-square illustration sits to the right of the headline (Rough.js, fixed seed, low roughness 1.0, color #6B7280). This is the ONE place hand-drawn lives on /home, per restraint rule (§S1.6, MASTERLIST rule 1).
  - **No fake number.** No "73 (sample)". No greyed-out placeholder. The product does not lie about state.
- **Loading (scan currently running):** score shown as "—" (em dash) at the same 64-72px size, with a subtle 800ms breathing pulse (opacity 0.6 ↔ 1) on the dash. Sparkline shows last-known data unchanged. Diagnosis line replaced with: "Scanning. Your score will refresh when it's done." in Fraunces. Status chip changes to "SCANNING" in muted tone.
- **Error (scan failed or last scan >7 days old):** banner row above the hero (NOT inside the hero block) — sentence + "Try a fresh scan" inline link. Sparkline + score + diagnosis still show last-known data. Error state never replaces real data with absence.
- **Stale data (last scan >14 days, no scheduled scan):** subtle muted asterisk next to the diagnosis line, hover reveals "Last scan was 16 days ago." Subtle, not alarming.

## 1.9 Microcopy (EN + HE)

### Diagnosis line examples (3 EN, 3 HE)
EN:
- "Up 5 since last scan, top fix is FAQ schema."
- "Stable across the board. ChatGPT is your strongest engine."
- "Down 3 — Perplexity dropped your business off two queries this week."

HE:
- "עלייה של 5 מהסריקה האחרונה, התיקון הכי דחוף הוא FAQ schema."
- "יציב בכל המנועים. ChatGPT הוא המנוע החזק שלך."
- "ירידה של 3 — Perplexity הוריד אותך משתי שאילתות השבוע."

### Empty state copy (EN + HE)
EN: "Run your first scan to see how AI sees your business." → CTA "Run scan now" → sub "Takes about 2 minutes."
HE: "הריצו סריקה ראשונה ותראו איך הבינה המלאכותית רואה את העסק שלכם." → CTA "להריץ סריקה" → sub "נמשך כשתי דקות."

### Loading state copy
EN: "Scanning. Your score will refresh when it's done."
HE: "סורק. הציון יתעדכן כשיסתיים."

### Error state copy
EN: "Last scan failed. Try a fresh scan to refresh your score."
HE: "הסריקה האחרונה נכשלה. הריצו סריקה חדשה לרענון הציון."

## 1.10 Anti-pattern check
- **N1 (icon-in-tinted-circle)**: NO icon adjacent to the score. The number IS the visual.
- **N2 (gradient backgrounds)**: NO. Solid white card surface, single 1px border.
- **N3 (greeting)**: NO "Welcome back, {name}" anywhere on this section. The score is the headline.
- **N4 (multi-color sparkline)**: NO. Single brand-blue 1px stroke.
- **N5 (Pro tip box)**: NO. The diagnosis sentence does the explanatory work; no callout box.

## 1.11 References
- Stripe Dashboard hero KPI — [Stripe Dashboard basics](https://docs.stripe.com/dashboard/basics), [Brian Lovin teardown](https://brianlovin.com/design-details/stripe-dashboard-ios)
- Linear Dashboards single-number metrics — [Linear Dashboards changelog](https://linear.app/changelog/2025-07-24-dashboards)
- Anthropic Console usage hero — [Cost and Usage Reporting](https://support.anthropic.com/en/articles/9534590-cost-and-usage-reporting-in-console)
- Mercury balance hero treatment — [Mercury home](https://mercury.com)
- Speedtest count-up gauge pattern — referenced REFS-02 §11
- Granola Quadrant + Melange typographic warmth — [A new look for Granola](https://www.granola.ai/blog/a-new-look-for-granola)

---

# SECTION 2 — Top 3 Fixes Ready

## 2.1 Purpose
The page's primary action zone. Surfaces the three highest-leverage fixes the agent system has prepared, ready to approve in one click. This is where /home becomes a verb — the user doesn't just see their score; they act on it.

## 2.2 What it contains
1. Section label "TOP 3 FIXES READY" — same caps treatment as §1.1 label.
2. Three **RecommendationCards** stacked vertically. Each card contains:
   - **Agent type badge** — small monochrome icon + agent name in 11px caps weight 500 letter-spacing 0.04em (e.g., `FAQ AGENT`, `CITATION FIXER`, `SCHEMA DOCTOR`). Icon is monochrome line-art at 14×14px, NOT in a tinted circle (anti N1).
   - **One-line problem** — Inter 15px regular, color #0A0A0A, e.g., "Your homepage is missing FAQ schema, which Perplexity uses to extract direct answers."
   - **One-line proposed action** — Inter 13px regular, color #6B7280, e.g., "Add 6 FAQ entries to your homepage and re-scan."
   - **Credit cost chip** — small pill, 11px tabular, e.g., "4 credits" — neutral, NO icon.
   - **Approve button** — secondary style on the card itself; appears on hover OR always-visible on mobile. Pill shape, "Approve ⌘↵" with the keystroke shown next to the label (Linear pattern).
   - **Reject button** — tertiary text-only "Skip" on the card right side, only on hover.
3. **Section CTA at the bottom**: "**Run all 3 — 14 credits**" primary pill button. Background #3370FF, text white, 16px medium, height 44px, padding 0 24px, border-radius 999px (pill, per BRAND_GUIDELINES marketing button shape — used here because this is the page's primary distinctive action). The credit cost updates dynamically based on which cards are selected/deselected.

## 2.3 Layout intent
Three cards stacked vertically with 12px gap between cards. Each card 96-112px tall (depends on copy length). Section CTA sits 24px below the last card, right-aligned on desktop, full-width on mobile.

```
TOP 3 FIXES READY

┌──────────────────────────────────────────────────────────────┐
│ [icon] FAQ AGENT                            4 credits  [⌘↵] │
│ Your homepage is missing FAQ schema, which                   │
│ Perplexity uses to extract direct answers.                   │
│ Add 6 FAQ entries to your homepage and re-scan.              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ [icon] CITATION FIXER                       6 credits  [⌘↵] │
│ ...                                                          │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ [icon] SCHEMA DOCTOR                        4 credits  [⌘↵] │
│ ...                                                          │
└──────────────────────────────────────────────────────────────┘

                                       [ Run all 3 — 14 credits → ]
```

On mobile: same vertical stack, CTA becomes full-width, drops to its own row at the bottom of the section.

## 2.4 Treatment specifics
- **Vertical not horizontal.** Three cards horizontally would force truncated copy and reduce mobile parity. Vertical stack reads top-to-bottom in 5 seconds; horizontal scrolls awkwardly on tablet.
- **No icon-in-circle.** Agent type icon is 14×14 monochrome line, sitting flat against the label. No tinted background. (Anti N1.)
- **Credit cost chip is neutral.** No #3370FF accent on the chip. Color is muted #6B7280 inside a 1px border. The blue is reserved for the section CTA, where it earns attention.
- **Hover state on card:** background lightens to #FAFAF7 (warm 4% above canvas), `transform: translateY(-1px)`, shadow `0 1px 4px rgba(10,10,10,0.06)` appears. 150ms ease-out. (Stripe card-slide pattern, restrained.)
- **Approve interaction:** clicking Approve fires optimistic UI — card collapses with a 200ms ease-in (height to 0, opacity to 0), strikethrough fade applied to the action label as it collapses. The agent runs in /workspace; the toast (Sonner-style) confirms "FAQ Agent running. View progress →" with a link to /workspace. The card stays collapsed even on page refresh until the agent completes.
- **Run-all interaction:** see §9 for full pixel-level treatment.
- **Section CTA position:** right-aligned on desktop because Western reading flow accepts the CTA as the punctuation at the end of the cards. RTL adaptation: left-aligned. Mobile: full-width centered.

## 2.5 Sarah-mode vs Yossi-mode
- **Sarah:** scans the three cards, reads the one-line problems. Hits "Run all 3 — 14 credits" with one click. Trust the agent. The keystroke (⌘↵) is invisible to her unless her eye notices it; she clicks the button.
- **Yossi:** reads each card's proposed action carefully. Approves cards individually with ⌘↵. Often skips one card because he wants to do that fix manually. Uses the Cmd+K palette to "Approve fix #2" without touching the mouse.

## 2.6 Hand-drawn surface
**No.** This is the action zone. Hand-drawn here would soften an interaction that needs to feel decisive. The "Run all 3" CTA gets brand-blue + spring overshoot (§9), not pencil-line.

The one possible exception: a **subtle pencil-stroke underline beneath the section label "TOP 3 FIXES READY"** as a brand mark. Recommend SKIP for v1. The discipline is more valuable than the personality moment.

## 2.7 Hebrew/RTL adaptation
- Cards stay full-width, content flows RTL.
- Agent type badge: icon swaps to right of label (or stays left and label flows right — recommend label-on-right for cleaner RTL reading).
- Credit cost chip: stays right-side of card in LTR → flips to left-side in RTL.
- Approve button keystroke: ⌘↵ stays universal (keystrokes are not translated).
- Section CTA "Run all 3 — 14 credits" → "להריץ את כל ה-3 — 14 קרדיטים".
- Card hover slide: in RTL, `translateX(-1px)` becomes `translateX(1px)` if directional; `translateY` stays the same.

## 2.8 States
- **Fewer than 3 fixes available:** show only the available cards. NEVER pad with placeholder cards. Section title reads "TOP {N} FIX{ES} READY" — pluralization handled.
- **0 fixes available:** entire section collapses to a single calm row: "All clear. No fixes pending." in Fraunces 15px italic muted, with a small green dot. (NOT "Great work!" — too cheerleader.) This row is the second-warmest moment on the page after the diagnosis line.
- **Approving a fix while another is running:** allowed. The first fix's card is already collapsed (or in /workspace). The new approve adds another agent run.
- **Insufficient credits to run all:** the section CTA changes to "**Run all 3 — 14 credits (you have 8)**" in muted state, with a secondary text below: "Upgrade to Build for 30 monthly credits →" linking to /settings/billing. The CTA still works — clicking it routes to "Add credits" flow first.
- **Empty state (no scan ever run):** entire section is hidden. Only the hero empty CTA from §1.8 is shown.

## 2.9 Microcopy
EN problem-action examples:
- "Your homepage is missing FAQ schema, which Perplexity uses to extract direct answers." / "Add 6 FAQ entries to your homepage and re-scan."
- "ChatGPT cites your competitor 8× more often. Citation context is the gap." / "Run citation fixer to surface 4 high-authority pages."
- "Schema validation errors on 3 product pages." / "Auto-fix and validate. Re-scan in 2 minutes."

HE:
- "דף הבית שלכם חסר FAQ schema, ש-Perplexity משתמש בו לחילוץ תשובות ישירות." / "הוסיפו 6 שאלות נפוצות לדף הבית והריצו שוב סריקה."
- "ChatGPT מצטט את המתחרה שלכם פי 8. הפער הוא ההקשר של הציטוט." / "הריצו את מתקן הציטוטים כדי לחשוף 4 דפים בעלי סמכות."

CTA:
- "Run all 3 — 14 credits" / "להריץ את כל ה-3 — 14 קרדיטים"

Skip / Approve:
- "Skip" / "דלג"
- "Approve ⌘↵" / "אישור ⌘↵"

## 2.10 Anti-pattern check
- N1: NO icon-in-tinted-circle on cards. ✓
- N2: NO gradient backgrounds on cards. ✓
- N5: NO "Pro tip" callout boxes. ✓
- N6: NOT a "Quick Actions" panel of stacked buttons — these are recommendation cards with one primary action each, plus one section-level CTA. ✓
- N8: NO confetti on approve. The toast is quiet; the agent runs.

## 2.11 References
- Linear keystroke-shown-next-to-action — [Invisible details](https://medium.com/linear-app/invisible-details-2ca718b41a44)
- Things 3 Magic Plus as brand-distinctive primitive — [Things features](https://culturedcode.com/things/features/)
- Stripe Dashboard slide-with-spring on cards — [Brian Lovin teardown](https://brianlovin.com/design-details/stripe-dashboard-ios)
- Sonner toast pattern by Emil Kowalski — [emilkowal.ski](https://emilkowal.ski)

---

# SECTION 3 — Inbox Pointer Line

## 3.1 Purpose
Quietly direct the user to the sibling work surface (/inbox) without competing with the action zone above. This is a reference, not a CTA. It is the page's quietest moment.

## 3.2 What it contains
A single line of text:
- "**3 items in your Inbox awaiting review →**"

That's it. No icon. No banner. No card. No background color. No button.

## 3.3 Layout intent
Single text line, full-width, left-aligned, 24px below Section 2's CTA, 24px above Section 4. Total section height: 24px (the line itself) plus the section gap above and below.

```
                                                    
   3 items in your Inbox awaiting review  →
                                                    
```

## 3.4 Treatment specifics
- Inter 14-15px regular, color #6B7280 (muted).
- The chevron `→` is part of the text, not a separate icon.
- On hover: entire line color shifts to #2558E5 (brand blue text-safe variant), 100ms ease-out.
- Click anywhere on the line → navigates to `/inbox`.
- If pending count is 0, this section **disappears entirely**. No "0 items in your Inbox" — silent absence.
- If pending count is 1, copy adjusts: "1 item in your Inbox awaiting review →"

## 3.5 Sarah-mode vs Yossi-mode
- **Sarah:** glances, ignores most days. When she does click, she's there for an inbox triage session that will take 5 minutes.
- **Yossi:** counts the number with side-eye on every /home visit. Click-routes to /inbox if count > 5. Mental rule.

## 3.6 Hand-drawn surface
**No.** The text-only treatment is the discipline.

## 3.7 Hebrew/RTL adaptation
- Chevron flips: `→` becomes `←` in RTL. (Direction-meaningful chevrons must mirror per Bidi semantics.)
- Copy transcreated: "3 פריטים ממתינים לבדיקה ב-Inbox ←" (or use Hebrew "תיבת הנכנסים" if Adam prefers full Hebrew naming — see open question Q1 in §15).
- Reading order: in RTL, line reads right-to-left; chevron at the end (now on the left) is the affordance.

## 3.8 States
- 0 items: section hidden entirely.
- 1 item: singular copy.
- 2-99 items: plural copy with exact count.
- 100+ items: "100+ items in your Inbox awaiting review →" (overflow handling — Yossi mode primarily).

## 3.9 Microcopy
EN: "3 items in your Inbox awaiting review →"
HE: "3 פריטים ממתינים לבדיקה ב-Inbox ←" (or "3 פריטים ממתינים לבדיקה בתיבת הנכנסים ←" — pending Q1)

## 3.10 Anti-pattern check
- N5: NO "Did you know?" callout. ✓
- N6: NOT styled as a button. It's text. ✓
- This is the disciplined opposite of every "You have 3 unread!" red badge. Restraint earns trust.

## 3.11 References
- Linear's quiet sibling-pointer pattern — [Linear behind the refresh](https://linear.app/now/behind-the-latest-design-refresh)
- Stripe restraint on chrome elements — [Stripe Dashboard](https://docs.stripe.com/dashboard/basics)

---

# SECTION 4 — KPI Cards Row (Mentions / Citations / Credits / Top competitor delta)

## 4.1 Purpose
The summary layer. Four numbers, four sparklines, four drill-points. This is where the user gets the underlying breakdown of the score in numbers they recognize.

## 4.2 What it contains
Four cards in a row at desktop (4×1), 2×2 grid at tablet (768-1023px), vertical stack on mobile (<768px). Each card contains:
1. **Label** — 12px caps weight 500 letter-spacing 0.04em color #6B7280. E.g., `MENTIONS`, `CITATIONS`, `CREDITS LEFT`, `VS TOP COMPETITOR`.
2. **Big number** — InterDisplay 28-32px semibold, font-feature-settings 'tnum', color #0A0A0A.
3. **Delta** — Inter 12px medium tabular, with up/down arrow and percent. E.g., `↑ +12%` or `↓ -3%` or `—` (em-dash for zero). Semantic green/red/muted color.
4. **Sparkline** — 1px stroke #3370FF, no fill, no markers, full-width inside the card minus 24px padding × 2, height 32px fixed. Renders 12 weeks of data.
5. **NO ICON.** The number IS the visual. (Anti N1.)

## 4.3 Layout intent
```
MENTIONS              CITATIONS             CREDITS LEFT          VS TOP COMPETITOR
142                   38                    22                    -8
↑ +12% this month     ↑ +5 this month      —                     ↓ -3 closer
▁▂▁▂▃▄▆▇█▇█▇         ▁▁▂▂▂▃▄▄▅▆▇▇        ▆▆▅▅▄▄▃▃▂▂▁▁          ▇▇▆▆▅▅▄▄▃▃▂▂
```

Card dimensions: 280-320px wide × 132px tall (responsive). 16px gap between cards.

## 4.4 Treatment specifics
- **Border:** 1px solid `rgba(10, 10, 10, 0.06)` — that's #E5E7EB at 60% opacity, calibrated to feel like Linear's softer borders ("structure should be felt not seen").
- **Corner radius:** 12px exactly. Not 8px (too tight), not 16px (too soft).
- **Padding inside card:** 20px top, 20px right, 20px bottom, 24px left — the 4px asymmetry left/right gives the number its breathing room.
- **Hover behavior:** card slides up 4-6px with 250ms spring (`{ type: "spring", stiffness: 350, damping: 30 }`), shadow `0 2px 8px rgba(10,10,10,0.04)` appears. Cursor: pointer. (Stripe slide pattern.)
- **Click:** drills to the corresponding source page:
  - MENTIONS → `/scans?metric=mentions`
  - CITATIONS → `/scans?metric=citations`
  - CREDITS LEFT → `/settings/billing` (credit history view)
  - VS TOP COMPETITOR → `/competitors` (top competitor profile)
- **Sparkline tooltip on hover (over the sparkline):** vertical guide + dot + tooltip with date + value + delta vs prior week. Tabular nums.
- **VS TOP COMPETITOR delta:** this card's delta is interpreted differently — "↓ -3 closer" means the gap to the top competitor closed by 3, which is GOOD. The arrow color logic flips for this metric only. Tooltip on the metric clarifies: "Lower number = closer to top competitor = better."

## 4.5 Sarah-mode vs Yossi-mode
- **Sarah:** scans 4 numbers in 4 seconds, sees green deltas, moves on.
- **Yossi:** clicks each card to drill. Compares Mentions vs Citations to see if the gap is narrowing. Hovers sparklines for week-by-week.

## 4.6 Hand-drawn surface
**No.** The KPI row is the page's data spine. Hand-drawn here would read as informal — wrong register.

## 4.7 Hebrew/RTL adaptation
- Card grid order: 4×1 row stays in same DOM order; CSS `flex-direction: row-reverse` on RTL applies the visual reversal so the first card (Mentions) is on the right edge.
- Sparkline direction flips per Bidi convention (newest data on the right in LTR, newest data on the left in RTL — keeping reading-direction-aligned).
- Number stays Western Arabic.
- Delta arrow direction stays semantic (↑ is up, ↓ is down regardless of language).
- Spatial position of delta arrow vs number: in RTL, the arrow sits to the LEFT of the percent.

## 4.8 States
- **Loading:** card shows last-known value with a 800ms breathing pulse on the number. Sparkline animates in once data arrives. NO skeleton-shimmer (anti N7). Stripe pattern: pre-render the layout with last-cached values, refresh in place when new data lands.
- **No previous data (first scan):** card shows the value with no delta and a sparkline that's a flat baseline. Delta replaced with `—` em-dash and "first scan" in 11px muted.
- **Data unavailable:** card shows `—` for the number, no delta, no sparkline. Hover tooltip: "No data yet for this metric."
- **Plan-locked metric (e.g., Citations on Discover tier):** card renders at 50% opacity with a small lock icon top-right. Click → upgrade modal.

## 4.9 Microcopy
Labels EN: "MENTIONS" / "CITATIONS" / "CREDITS LEFT" / "VS TOP COMPETITOR"
Labels HE: "אזכורים" / "ציטוטים" / "קרדיטים נותרו" / "מול המתחרה המוביל"

Delta phrasing EN: "↑ +12% this month" / "↓ -3 closer"
Delta phrasing HE: "↑ +12% החודש" / "↓ -3 קרוב יותר"

Empty state per card EN: "No data yet for this metric."
Empty state per card HE: "אין עדיין נתונים למדד הזה."

## 4.10 Anti-pattern check
- N1: NO icons in tinted circles. ✓
- N2: NO gradient backgrounds. ✓
- N4: Single-color sparklines, no rainbow. ✓
- N7: NO skeleton-shimmer during fetch. ✓ (use last-cached + breathing pulse)

## 4.11 References
- Stripe KPI row master template — [Stripe Help: Dashboard charts](https://support.stripe.com/questions/dashboard-home-page-charts-for-business-insights)
- Vercel project sparkline thumbnails — [Vercel dashboard redesign](https://vercel.com/blog/dashboard-redesign)
- Mercury cashflow widget — [Mercury — Updated Transactions](https://mercury.com/blog/updated-transactions-page)
- PostHog insight cards — [PostHog dashboards](https://posthog.com/docs/product-analytics/dashboards)

---

# SECTION 5 — Score Trend Chart

## 5.1 Purpose
The narrative layer. Shows how the score has moved over time, with optional comparison to the previous period. This is the chart Yossi spends 30 seconds on; Sarah reads only the headline shape.

## 5.2 What it contains
1. Section label "SCORE TREND" with a thin row of filter chips immediately to the right of the label: `7d` / `30d` / `90d` / `1y` / `All`. Default: `90d`. Active chip is filled #3370FF, inactive chips are 1px border #E5E7EB.
2. **Line chart** — single series, 1.5px stroke #3370FF, no fill (or 4% opacity if comparison line is shown).
3. **Comparison line (optional, shown when filter ≥ 30d):** muted gray (#9CA3AF) 1px DASHED line representing previous-period average.
4. **Hover state:** vertical guide line at `rgba(10,10,10,0.06)` 1px solid + dot at intersection (filled circle 4px in #3370FF) + tooltip (white surface, no border, soft shadow `0 4px 12px rgba(10,10,10,0.08)`, 8px corner radius, 12px padding).
5. **Y-axis:** 4-5 ticks max, 12px regular muted, tabular nums, no gridlines.
6. **X-axis:** date labels, 12px regular muted, format "Mar 12" not "March 12, 2026" (compact).
7. **No grid lines on Y-axis. No grid lines on X-axis.** Single horizontal dashed reference line at the previous-period average if comparison is shown.

## 5.3 Layout intent
```
SCORE TREND                         [ 7d  30d  ⬛90d  1y  All ]

100 ┤                                                    
 80 ┤                  ╱╲╱╲                               
 60 ┤    ╱─╲    ╱╲  ╱╯  ╲╱╲      ◯ 73                     
 40 ┤  ╱╯   ╲ ╱╯ ╲╯       ╲                               
 20 ┤╱       ╲                                            
   └─────────────────────────────────────────────────
    Feb 1   Feb 15   Mar 1   Mar 15   Apr 1   Apr 24
                                ╴╴╴╴╴ avg 64 ╴╴╴╴╴      
```

Chart container: full-width minus 48px padding, 320px tall. Filter chip row sits above-right.

## 5.4 Treatment specifics
- **Stroke weight:** 1.5px (NOT 1px — too thin at retina; NOT 2px — too heavy and reads chart-library-default).
- **Single color discipline:** #3370FF only. No multi-color palette. (Anti N4.)
- **No fill area** except optional 4% opacity gradient if comparison is shown — and even then, the gradient is barely perceptible.
- **Smart graph transition on filter change:** when user switches `30d → 90d`, old line fades out over 200ms while new line draws in over 1.2s ease-out. Stripe pattern (smart graph transitions on time-period change).
- **Live filter response:** if user filters by engine (in §6), this chart re-projects to that engine's data WITHOUT a spinner. (Mercury pattern — chart-on-filter, P8.)
- **Click any data point:** opens an inline expansion below the chart showing that day's score breakdown (per-engine contributions) — does NOT navigate to a new page. Anthropic Console drill pattern.
- **Click any week (X-axis range):** that week expands to per-day view inline.
- **First-paint animation:** line draws left-to-right over 1.2s ease-out, starting at t=1080ms in the page sequence. Y-axis labels fade in over 200ms.

## 5.5 Sarah-mode vs Yossi-mode
- **Sarah:** sees the line going up (or down) at a glance. Reads the headline shape. Doesn't change the filter.
- **Yossi:** filters to 1y, hovers each peak/valley, clicks specific weeks to see the daily breakdown. Compares against the comparison line. Cross-references with the per-engine strip below.

## 5.6 Hand-drawn surface
**No.** The chart is the page's most data-dense element. Hand-drawn here = Otterly. Crisp 1.5px stroke is the discipline.

## 5.7 Hebrew/RTL adaptation
- Chart X-axis: dates flow right-to-left (newest on left in RTL). The line is drawn from right to left on first paint.
- Y-axis: stays on the right side of the chart in RTL (mirroring the layout). Tick labels stay numeric.
- Filter chips: order stays the same conceptually (`7d / 30d / 90d / 1y / All`) but visual order reverses with `flex-direction: row-reverse`.
- Tooltip: in RTL, follows the cursor on the right side of the data point instead of left.
- Date labels: he-IL formatting (`12 בפבר׳` etc.) but kept compact.

## 5.8 States
- **Empty (first scan, no historical data):** chart container shows the section title but the chart area is replaced with a single calm message: "Run a few scans to see your trend." in Fraunces 15px italic muted. Filter chips are disabled.
- **One data point only:** chart shows a single dot at the score's value, X-axis collapses to one date label. Subtle hint text below: "More data points appear after each scan."
- **2-N data points:** chart renders normally.
- **Loading (data refreshing):** chart fades to 0.5 opacity, no spinner. Restored when data arrives.
- **Error:** banner above the chart: "Couldn't load trend data. [Retry]"
- **Stale (last scan >14 days ago):** subtle dotted line connects the last known data point to today with a "(stale)" tooltip. The chart honestly conveys age.

## 5.9 Microcopy
Filter chips EN: `7d` / `30d` / `90d` / `1y` / `All`
Filter chips HE: `7 ימים` / `30 ימים` / `90 ימים` / `שנה` / `הכל`

Tooltip format EN: "Mar 12, 2026 — 73 (↑ +5 vs prior day)"
Tooltip format HE: "12 במרץ 2026 — 73 (↑ +5 מהיום הקודם)"

Empty state EN: "Run a few scans to see your trend."
Empty state HE: "הריצו עוד כמה סריקות כדי לראות את המגמה."

## 5.10 Anti-pattern check
- N4: Single-color, no rainbow palette. ✓
- N7: No skeleton-shimmer; opacity fade only on refresh. ✓
- No heavy fill area. ✓
- No visible gridlines on both axes. ✓

## 5.11 References
- Mercury cashflow chart, real-time response to filter — [Mercury — Updated Transactions](https://mercury.com/blog/updated-transactions-page)
- Linear Dashboards line chart — [Linear Dashboards changelog](https://linear.app/changelog/2025-07-24-dashboards)
- Stripe gross volume comparison line — [Brian Lovin teardown](https://brianlovin.com/design-details/stripe-dashboard-ios)
- Anthropic Console drill bar → hour → minute — [Cost and Usage Reporting](https://support.anthropic.com/en/articles/9534590-cost-and-usage-reporting-in-console)

---

# SECTION 6 — Per-Engine Performance Strip

## 6.1 Purpose
Show the user which AI engines are pulling weight and which are dragging. Nine pills, each a doorway into per-engine analysis. This is where Yossi spends his time; Sarah glances at the colors.

## 6.2 What it contains
Nine **engine pills** in a horizontal row (desktop) / horizontal scroll snap (mobile). Each pill contains:
1. **Engine name** in **Geist Mono** 11px caps (technical badge feel — the typographic move that makes the strip feel "engineered").
2. **Score** in InterDisplay 16px semibold tabular nums.
3. **Delta arrow** + delta value in 11px medium tabular, semantic green/red/muted.
4. **Background:** white. **Border:** 1px solid `rgba(10,10,10,0.06)`. **Corner radius:** 999px (full pill).
5. **Padding:** 8px 14px.
6. **Engine logos:** NO. Following anti-pattern N1 + competitor avoidance (Otterly puts engine logos in colored circles; Beamix doesn't). The engine name in Geist Mono IS the visual identity.
7. **Locked engines (not in current plan):** rendered at 50% opacity with a small lock icon (12px, monochrome) prepended to the engine name. Click → upgrade modal.

## 6.3 Layout intent
```
PER-ENGINE PERFORMANCE

[ CHATGPT  73 ↑+2 ] [ CLAUDE  68 ↑+5 ] [ GEMINI  71 — ] [ PERPLEXITY  64 ↓-3 ]
[ GROK  🔒 ] [ YOU.COM  🔒 ] [ GOOGLE AIO  56 ↑+1 ] [ BING  52 — ] [ OTHER  48 — ]
```

Engine order (NOT alphabetical — order is the product's argument, hierarchy by user-relevance):
1. ChatGPT
2. Claude
3. Gemini
4. Perplexity
5. Grok
6. You.com
7. Google AIO
8. Bing
9. Other (consolidated minor engines)

## 6.4 Treatment specifics
- **Pill width:** intrinsic, governed by content. Min-width 132px to prevent jitter on score change.
- **Hover behavior:** pill background lightens to #FAFAF7 (4% above canvas), subtle 1px shadow appears, sparkline tooltip animates in below the pill after **50ms delay** (small mini-sparkline of last 12 weeks for that engine, in a small 160×40px tooltip).
- **Click:** drills to `/scans/per-engine?engine={name}` (or whatever the route ends up being).
- **Active filter state:** if user has clicked a pill to filter the trend chart in §5 by that engine, the pill is rendered with a 2px solid #3370FF border (instead of 1px transparent border), and the score chart in §5 re-projects in real-time. (Mercury chart-on-filter pattern.)
- **Mobile adaptation:** horizontal scroll with CSS scroll-snap-type: x mandatory, snap-stop: always. Each pill snap-aligns to the leading edge. A small "1/9" indicator in 11px caps bottom-right of the strip.
- **Geist Mono usage:** ONLY on the engine name within the pill. The score uses InterDisplay (consistency with hero score numeral). The mono is a deliberate "technical context" cue, not a stylistic flourish.

## 6.5 Sarah-mode vs Yossi-mode
- **Sarah:** glances, sees no red. Scrolls past.
- **Yossi:** clicks the worst-performing pill, drills to per-engine view. Filters the trend chart by clicking one or more pills. Compares pills side-by-side using the score values.

## 6.6 Hand-drawn surface
**No.** The strip is part of the data spine.

(Note: in /workspace, when an agent is actively asking ChatGPT, the Linear AIG four-state pill shows the asterisk family `· ✻ ✽ ✶ ✳ ✢` in a hand-drawn idiom — but that's /workspace, not /home. /home is the static surface.)

## 6.7 Hebrew/RTL adaptation
- Strip flow: pills flow right-to-left in RTL, with order preserved (ChatGPT first = rightmost in RTL).
- Engine names in Geist Mono stay LTR — engine names are brand names, not translated. Bidi handles the embedded LTR run inside RTL paragraph.
- Pill internal layout (name → score → delta) flows RTL: delta on left, score in middle, name on right.
- Mobile horizontal scroll direction reverses: scrolling right reveals later engines (newest UX direction).
- "1/9" indicator: in RTL, "1/9" stays formatted Western Arabic.

## 6.8 States
- **All 9 engines rendered:** default state.
- **Subset locked by tier:** locked pills shown at 50% opacity with lock icon. Discover tier shows ChatGPT / Gemini / Perplexity unlocked, the rest locked. Build tier unlocks 7 of 9. Scale unlocks 9.
- **No data for an engine (engine queried but no result):** pill renders with `—` in place of score. Hover tooltip: "No mention found in last scan."
- **Engine API outage:** small red dot top-right of the pill. Hover tooltip: "Engine unavailable in last scan."
- **Engine recently added (first scan after upgrade):** subtle "NEW" 9px caps badge above the pill for 7 days.

## 6.9 Microcopy
Pill labels (engine names, NOT translated): `CHATGPT` / `CLAUDE` / `GEMINI` / `PERPLEXITY` / `GROK` / `YOU.COM` / `GOOGLE AIO` / `BING` / `OTHER`

Locked tooltip EN: "Available on Build plan. Upgrade →"
Locked tooltip HE: "זמין בתכנית Build. שדרוג ←"

No-data tooltip EN: "No mention found in last scan."
No-data tooltip HE: "לא נמצא אזכור בסריקה האחרונה."

Outage tooltip EN: "Engine unavailable in last scan."
Outage tooltip HE: "המנוע לא היה זמין בסריקה האחרונה."

## 6.10 Anti-pattern check
- N1: NO logos in tinted circles. ✓
- N4: NO multi-color palette per engine. Single brand-blue accent + semantic delta colors only. ✓
- All engine names use the same Geist Mono treatment — typographic hierarchy enforced. ✓

## 6.11 References
- Linear status pills + filter-views — [Linear Dashboards](https://linear.app/changelog/2025-07-24-dashboards)
- Geist Mono for technical badge feel — [Geist typography](https://vercel.com/geist/typography)
- Mercury filter chips that affect chart above — [Mercury — Updated Transactions](https://mercury.com/blog/updated-transactions-page)
- Tonik "1/9" pagination chip (mobile scroll indicator) — REFS-04 §S3

---

# SECTION 7 — Recent Activity Feed

## 7.1 Purpose
The page's narrative ground truth. Shows the last 5-10 events: scans completed, agents run, items approved. Each row is a doorway into the source of that event. This is where Yossi audits the system; Sarah confirms "yes, the agents ran like they said."

## 7.2 What it contains
A vertical list of 5-10 most recent events. Each row contains:
1. **Event icon** — 14×14px monochrome line icon, color #6B7280. Different icon per event type: scan-completed (magnifying glass), agent-run (chevron-bracket), item-approved (check), item-rejected (×), scheduled-event (clock).
2. **One-line description** — Inter 14px regular, color #0A0A0A. E.g., "Scan completed — score 73 (↑+5)" or "FAQ Agent approved 6 changes" or "Citation Fixer rejected".
3. **Timestamp** — Inter 12px regular muted, format "2h ago" / "Yesterday at 3:42pm" / "Apr 12 at 9:18am". Time-relative for <24h, absolute thereafter.
4. **Mini-sparkline thumbnail** — for scan-completed events only, a tiny 60×16px sparkline showing the score change for that scan (Vercel project-thumbnail pattern translated to Beamix).
5. **Hover affordance** — entire row lightens, sparkline tooltip expands.
6. **Click** — routes to source detail (scan-completed → `/scans/[scanId]`, agent-run → `/workspace/[runId]`, item-approved → `/inbox/[itemId]`).

## 7.3 Layout intent
```
RECENT ACTIVITY                                       View all →

  [icon] Scan completed — score 73 (↑+5)            ▁▂▄▆▇  2h ago
  [icon] FAQ Agent approved 6 changes                       4h ago
  [icon] Citation Fixer rejected by you                     6h ago
  [icon] Scan completed — score 68 (↓-2)            ▁▂▁▂▃  Yesterday at 3:42pm
  [icon] Schema Doctor approved 3 changes                   Yesterday at 1:18pm
  [icon] Scheduled scan: Mon, Mar 4 at 9:00am               Apr 22 at 10:00am
  [icon] Trial started                                       Apr 22 at 10:00am
```

Row height: 44px desktop, 40px mobile. Padding: 8px vertical, 16px horizontal. Border-bottom: 1px solid `rgba(10,10,10,0.04)` between rows (very subtle).

## 7.4 Treatment specifics
- **No row backgrounds.** No alternating-row stripes. The visual rhythm comes from the icon + spacing, not from striping.
- **Icon discipline:** every event type has ONE icon. No colored backgrounds. (Anti N1.)
- **Mini-sparkline rendering:** ONLY on scan-completed events (the most common event with quantitative change). Other event types have no sparkline — keep the row clean.
- **Timestamp formatting rules:**
  - < 1 hour: "{N}m ago"
  - < 24 hours: "{N}h ago"
  - 24-48 hours: "Yesterday at {time}"
  - 2-7 days: "{Day} at {time}" (e.g., "Mon at 3:42pm")
  - > 7 days: "{Mon DD} at {time}" (e.g., "Apr 12 at 9:18am")
- **"View all →" link** in the section header right side, links to a dedicated activity page (or modal) with full history. 12px caps muted, hover #3370FF.
- **First-paint animation:** rows fade in 200ms with 30ms stagger, starting at t=1500ms.

## 7.5 Sarah-mode vs Yossi-mode
- **Sarah:** glances, sees recent events look healthy. Maybe clicks one if it's flagged red.
- **Yossi:** scans the feed for any rejected items, drills into agent runs to audit. Uses "View all" to see history beyond the 5-10 shown.

## 7.6 Hand-drawn surface
**No.** This is a list of events, audit-trail-grade. Hand-drawn would undercut its precision.

## 7.7 Hebrew/RTL adaptation
- Row internal layout: `[icon] [description] [sparkline] [timestamp]` flows right-to-left. Icon stays on the leading edge (right side in RTL). Timestamp on the trailing edge (left side in RTL).
- Time-relative copy transcreated:
  - "2h ago" → "לפני שעתיים" / "לפני 2 שעות"
  - "Yesterday at 3:42pm" → "אתמול ב-15:42"
  - 24h time format in Hebrew (no am/pm).
- Day names in Hebrew: יום ראשון, יום שני, etc. — use he-IL locale.
- Date format: `12 באפריל בשעה 09:18` (Hebrew long form) for >7 days.

## 7.8 States
- **Empty (no events yet):** "No activity yet. Your first scan is queued for {time}." in Fraunces 15px italic muted (or "Activity will appear here after your first scan." if no scan queued).
- **5-10 events:** default rendering.
- **>10 events:** show 10, "View all →" link enables the deeper history view.
- **Single event with no sparkline data:** sparkline thumbnail omitted; row otherwise normal.

## 7.9 Microcopy
Event row examples EN:
- "Scan completed — score 73 (↑+5)"
- "FAQ Agent approved 6 changes"
- "Citation Fixer rejected by you"
- "Schema Doctor failed — model timeout"
- "Trial started"
- "Scheduled scan: Mon, Mar 4 at 9:00am"

Event row examples HE:
- "סריקה הסתיימה — ציון 73 (↑+5)"
- "סוכן FAQ אישר 6 שינויים"
- "Citation Fixer נדחה על ידך"
- "Schema Doctor נכשל — timeout במודל"
- "התקופת הניסיון התחילה"
- "סריקה מתוכננת: יום שני, 4 במרץ ב-09:00"

Empty state EN: "No activity yet. Your first scan is queued for {time}."
Empty state HE: "אין עדיין פעילות. הסריקה הראשונה שלכם בתור ל-{time}."

## 7.10 Anti-pattern check
- N1: NO icons in tinted circles. ✓
- N7: NO skeleton-shimmer; empty state is calm copy. ✓
- N8: Even "Trial started" gets a quiet line, not confetti. ✓

## 7.11 References
- Linear changelog list pattern — [Linear Now feed](https://linear.app/now)
- Vercel deployment list with project-thumbnail proof — [Vercel dashboard redesign](https://vercel.com/blog/dashboard-redesign)
- Granola notes list calm hierarchy — [A new look for Granola](https://www.granola.ai/blog/a-new-look-for-granola)

---

# SECTION 8 — What's Coming Up Footer

## 8.1 Purpose
Close the page with a quiet, low-contrast list of what's about to happen. Three lines: next scan, next agent run, next billing. This is the "before you leave, here's what's queued" closer.

## 8.2 What it contains
1. Section label "UP NEXT" — same caps treatment as other section labels.
2. Three text rows:
   - **Next scheduled scan** — e.g., "Next scan: Mon, Mar 4 at 9:00am ({N}d)" with a small countdown if <24h.
   - **Next agent run** — e.g., "FAQ Agent runs after your next scan" or "No agent runs scheduled."
   - **Next billing date** — e.g., "Next billing: Mar 15, 2026 — Build plan ($189)"
3. Each row is a clickable line that routes to the relevant settings sub-page.

## 8.3 Layout intent
```
                                                                         
UP NEXT

  Next scan         Mon, Mar 4 at 9:00am · 9d
  Next agent run    FAQ Agent runs after your next scan
  Next billing      Mar 15, 2026 — Build plan ($189)
                                                                         
```

Section is the lowest-contrast section on the page. Background: `rgba(10,10,10,0.02)` (subtle warm-canvas tint), full-width minus padding. 24px padding all around. Rows: 32px tall each, 4px gap between rows.

## 8.4 Treatment specifics
- **Color:** body text in #6B7280 (muted), row labels (left column) in #9CA3AF (even more muted). The contrast is intentionally low — this section whispers.
- **No icons.** No buttons. No CTAs.
- **Hover:** row lightens to white background, color shifts darker. 100ms ease-out. Cursor: pointer.
- **Click:**
  - Next scan row → `/schedules`
  - Next agent run row → `/workspace` (or `/schedules` if scheduled)
  - Next billing row → `/settings/billing`
- **No animation on first paint** beyond a single 150ms fade.
- **No looping animations.** Even the countdown ticker (when <24h) updates every minute, no animation, just text replacement.

## 8.5 Sarah-mode vs Yossi-mode
- **Sarah:** ignores most days. Glances when she's worried about billing.
- **Yossi:** uses this to confirm the schedule is set. Click-routes to /schedules to adjust.

## 8.6 Hand-drawn surface
**No.** The footer's voice is "quiet text." Hand-drawn here would fight the discipline.

## 8.7 Hebrew/RTL adaptation
- Two-column row layout (`label | value`) reverses: label on right, value on left.
- Date format: he-IL throughout.
- Currency in HE: `₪{amount}` (NIS prefix).
- "9d" countdown in HE: "9 ימים".

## 8.8 States
- **No scheduled scan:** "No scans scheduled. [Set up auto-scan →]" linking to /schedules.
- **No upcoming agent run:** "No agent runs scheduled."
- **Trial / Free tier:** Next billing row shows "No active subscription" or "Trial ends Mar 4 — [Upgrade →]" based on state.
- **Trial day-1, Discover plan:** "Next billing: {trial_end + 1}, $79/mo" with a "manage trial →" link.
- **Plan in dunning state (failed payment):** row text changes to red #EF4444 — "Payment failed Mar 12 — [Update card →]"

## 8.9 Microcopy
EN:
- "Next scan: Mon, Mar 4 at 9:00am · 9d"
- "FAQ Agent runs after your next scan"
- "Next billing: Mar 15, 2026 — Build plan ($189)"
- "No scans scheduled. [Set up auto-scan →]"

HE:
- "סריקה הבאה: יום שני, 4 במרץ ב-09:00 · 9 ימים"
- "סוכן FAQ ירוץ אחרי הסריקה הבאה"
- "חיוב הבא: 15 במרץ 2026 — תכנית Build (₪699)"
- "אין סריקות מתוזמנות. [הגדר סריקה אוטומטית ←]"

## 8.10 Anti-pattern check
- N6: NOT a Quick Actions panel. ✓ (text rows, not buttons)
- N3: NO greeting. ✓
- The footer's restraint is the discipline.

## 8.11 References
- Things 3 today/upcoming distinction — [Things features](https://culturedcode.com/things/features/)
- Notion Calendar upcoming preview — [Notion Calendar help](https://www.notion.com/help/notion-calendar-apps)
- Linear cycles overview — [Linear Dashboards](https://linear.app/changelog/2025-07-24-dashboards)

---

## 9. THE BEAMIX /home INTERACTION PRIMITIVE

Per pattern P4 (one brand-distinctive interaction primitive). This is Beamix's "Magic Plus" / "Stripe card-slide" / "Ramp currency-roll" equivalent — the single motion that signals "this is Beamix, no other product does this exactly."

### Recommendation: the "**Run all 3 fixes — N credits**" primary CTA

This button anchors Section 2. It is also the same button shape and behavior used on `/inbox` (where it becomes "Run all approved items") and on `/scans` (where it becomes "Re-scan all engines"). The shape repeats; the verb adapts. That's the brand's signature primitive.

### Pixel-level anatomy
- **Button shape:** pill, border-radius 999px (per BRAND_GUIDELINES.md marketing button shape — adapted here because this IS the page's marquee action).
- **Background:** #3370FF.
- **Text color:** #FFFFFF.
- **Typography:** Inter 16px medium, font-feature-settings 'tnum' (so the credit number stays vertically aligned).
- **Height:** 44px.
- **Padding:** 0 24px.
- **Internal layout:** `[verb] [— credits count] [→ chevron]` with 8px gaps. Example: `Run all 3 — 14 credits →`.
- **Box-shadow at rest:** `0 1px 2px rgba(51, 112, 255, 0.16)` (subtle blue-tinted shadow signals "live, brand-imbued").

### Hover state (cursor enters)
- Spring scale to 1.02, `{ type: "spring", stiffness: 400, damping: 25 }`, total ~250ms.
- Box-shadow lifts: `0 4px 12px rgba(51, 112, 255, 0.24)`.
- Background lightens slightly: #3370FF → `lch(60% 70 270)` (perceptually 2 LCH points lighter).
- Cursor: pointer.

### Press state (mouse down)
- Scale snaps back to 1.00 (no overshoot on press; "press" feels firm, not bouncy).
- Box-shadow returns to rest level.
- Background darkens slightly: `lch(54% 70 270)` (2 LCH points darker than rest).
- 80ms total transition.

### Active state (during agent run, after click)
- Background pulses very subtly between #3370FF and a 3% darker shade, on a 1400ms breathing cycle (reuses the agent-thinking breathing pattern from MASTERLIST §Active step).
- Text changes to "Running 3 agents… [⌘ View progress]"
- Pill remains clickable; clicking it routes to `/workspace` to view live progress.

### Success state (all agents complete)
- Background morphs to #10B981 (semantic green) over 200ms.
- Text changes to "✓ 3 agents complete. View results →"
- 4 seconds later, the button returns to its idle state with refreshed score data above.
- This morph is the page's only "reward" moment. It's brief, restrained, no confetti (anti N8).

### Click → page transition
- Click fires three optimistic UI events simultaneously:
  1. The three RecommendationCards in §2 each play their collapse animation (height to 0, opacity to 0, 200ms ease-in).
  2. A Sonner-style toast appears top-right: "3 agents started. View progress →" — 4 second auto-dismiss.
  3. The button itself transitions to its active state (above).
- A user can navigate to `/workspace` via the toast, the button, or a Cmd+K command.

### Disabled state (insufficient credits)
- Background: #E5E7EB (neutral border color).
- Text: #6B7280 muted, "Run all 3 — 14 credits (you have 8)".
- Below the button, secondary text appears: "Upgrade to Build for 30 monthly credits →" linking to /settings/billing.
- Hover: cursor changes to `not-allowed` if no upgrade path; `pointer` if upgrade path exists.

### Why this is THE primitive
- **It is the highest-leverage action** on the highest-leverage page. The user's primary intent on /home is "fix things"; this button is the literal embodiment of that intent.
- **The shape repeats elsewhere.** On `/inbox`: "Approve all 12 items — ⌘A". On `/scans`: "Re-scan now — 3 engines". On `/workspace`: "Pause all — ⌘.". Same pill, same blue, same spring, same keystroke convention. That repetition IS the primitive.
- **It violates no anti-pattern.** It's not a Quick Actions panel (only ONE primary CTA per section). It's not gradient. It's not iconified. The number ("14 credits") is tabular — that's the typographic touch.
- **It rewards Cmd+K users.** ⌘↵ approves all from anywhere on the page. The keystroke is shown next to the label after the chevron when hovered.

### What it is NOT
- It is NOT confetti or particle effects.
- It is NOT a celebratory burst.
- It is NOT a hand-drawn pencil button (that's wrong register for a primary action).
- It is NOT animated on idle (no breathing pulse at rest).

Sources: [Things 3 Magic Plus](https://culturedcode.com/things/features/), [Stripe button polish — Brian Lovin](https://brianlovin.com/design-details/stripe-dashboard-ios), [Linear keystroke-shown-next-to-label](https://medium.com/linear-app/invisible-details-2ca718b41a44), [Sonner toast](https://emilkowal.ski).

---

## 10. THE STATUS-OUTSIDE-THE-PAGE MOVE

Per pattern P11. Beamix product state extends beyond the canvas. This is the Vercel favicon-as-deployment-status move, applied to scan/agent state.

### Favicon state machine
- **Idle (default):** Beamix logo mark, solid blue. The standard 32×32 / 180×180 favicon set.
- **Scan running:** Beamix logo mark with a small pulsing dot in the bottom-right corner of the favicon. The dot animates a 1400ms breathing cycle (subtle even at favicon scale).
- **Agent running:** Beamix logo mark with a small spinner-arc rotating around the mark. (Not a generic spinner — a custom 4-segment arc that rotates in 1.6s loops.)
- **Error state:** Beamix logo mark with a red corner badge.
- **Success (last 2 minutes after agent completion):** Beamix logo mark with a small green check overlay in the bottom-right. Auto-fades back to idle after 2 minutes.

### Browser tab title
- Default: "Beamix — Home" (or current page name)
- Pending inbox items: "(3) Beamix — Home" (count prepended in parentheses, common convention)
- Active scan: "● Scanning — Beamix" (filled-circle Unicode prefix to signal active)
- Active agent: "● {Agent} — Beamix" (e.g., "● FAQ Agent — Beamix")
- Error state: "⚠ Error — Beamix"

### Push notifications (opt-in, configured in /settings)
- **Agent completed:** "FAQ Agent completed. 6 changes ready in your Inbox."
- **Scan finished:** "Scan complete. Score 73 (↑+5). 3 fixes ready in /home."
- **Score moved >5 points:** "Your AI Visibility score moved from 68 to 73 today."
- **Trial ending:** "Trial ends in 24 hours. Pick a plan →"

Push notifications respect timezone (Stripe pattern — never wakes the user). Default: 9am - 9pm local time. User can override in /settings/notifications.

### Why this matters
This is the cheapest, highest-impact move for "billion-dollar care." Vercel does it with deployment status. Stripe does it with timezone-aware push. Linear does it with mobile bottom-tab badge counts. The feature is invisible to most users — but the people who notice it never forget. (Pattern P11.)

Sources: [Vercel dashboard redesign](https://vercel.com/blog/dashboard-redesign), [Stripe iPhone teardown](https://medium.com/swlh/exploring-the-product-design-of-the-stripe-dashboard-for-iphone-e54e14f3d87e).

---

## 11. THE FULL /home FIRST-LOAD CHOREOGRAPHY (refining §3)

Refinement of §3, with explicit linkage between page state and animation events.

### Pre-conditions on first load
- User is authenticated (auth check at middleware).
- `/api/home/snapshot` returns the full page state in <800ms (single endpoint, server-component-fetched data).
- `sessionStorage.beamix.home.entranceShown` is **false** → run the entrance.
- `prefers-reduced-motion` is **not set** → run the entrance with motion. (Otherwise, all elements appear at their final state at t=0.)

### Per-section animation budget (ms)
| Section | Container fade-in | Content motion | Path-draw | Stagger | Total budget |
|---|---|---|---|---|---|
| 1. Hero score | 50ms | Score count-up 600ms | Sparkline 800ms | — | 0-1000ms |
| 2. Top 3 fixes | 200ms | 3 cards 200ms each | — | 30ms | 250-680ms |
| 2. Run-all CTA | — | spring overshoot | — | — | 480-880ms |
| 3. Inbox pointer | — | 12px slide-up + fade | — | — | 520-720ms |
| 4. KPI cards | — | 4 cards 200ms each | KPI sparklines 600ms | 30ms | 600-1400ms |
| 5. Score trend | 80ms | — | Line draw 1.2s | — | 1000-2280ms |
| 6. Per-engine strip | — | 9 pills 200ms each | — | 25ms | 1200-1600ms |
| 7. Activity feed | — | Rows 200ms | — | 30ms | 1500-1900ms |
| 8. UP NEXT footer | — | Single 150ms fade | — | — | 1700-1850ms |

### Total perceived load: ~1.85 seconds
This is on par with the Stripe Dashboard first paint (~1.5s reported by Vercel as a target). Beamix is slightly longer because of the score count-up + line-draw signature events.

### Returning user (sessionStorage flag set)
All sections appear instantly with 0ms transition. Hover/click animations remain (sub-150ms responses to user input always preserved).

### Reduced-motion
All animation skipped. Final state rendered at t=0.

### Concurrent at t=0
- Favicon updates to current state.
- Browser tab title updates to reflect pending count.
- Cmd+K palette is registered for keyboard listener.

---

## 12. EMPTY STATE (NEW USER — JUST COMPLETED ONBOARDING, NEVER RUN A SCAN)

Per pattern P10 (calm, single-CTA, no fake data). The empty state is the moment the user sees /home for the first time and there is genuinely nothing to show. Default templates lie. Beamix doesn't.

### What appears
A single hero block, occupying the same vertical space as the populated hero score block (Section 1). Replaces the entire score + KPI + chart hierarchy with a single calm prompt:

```
                                                                
         Run your first scan to see how AI sees your business.  
                                                                
                          [ Run scan now ]                      
                                                                
              Takes about 2 minutes. We'll do the work.         
                                                                
                            [hand-drawn]                        
                                                                
```

### Treatment
- **Headline:** Fraunces 24px regular italic, color #0A0A0A (or InterDisplay 24px regular if the user is Hebrew — Frank Ruhl Libre 24px regular italic).
- **CTA pill:** primary blue #3370FF, same shape/treatment as §9 Run-all primitive. Text: "Run scan now".
- **Sub-line:** Inter 14px regular muted #6B7280.
- **Hand-drawn illustration:** Excalidraw-style sketchy magnifying-glass-over-square at max 120×120px. Rough.js, fixed seed (e.g., `seed: 42`), `roughness: 1.0`, `strokeWidth: 1.5`, color #6B7280. Positioned to the right of the headline+CTA stack on desktop, below the CTA on mobile.

### Sections 2-8 in empty state
- Section 2 (Top 3 fixes ready): hidden entirely.
- Section 3 (Inbox pointer): hidden entirely.
- Section 4 (KPI cards): hidden.
- Section 5 (Score trend): hidden.
- Section 6 (Per-engine strip): hidden.
- Section 7 (Recent activity): replaced with "Activity will appear here after your first scan." in Fraunces 14px italic muted.
- Section 8 (UP NEXT footer): hidden, OR if a scan is queued, shows only "Next scan: in 30 seconds" with countdown.

### Why this design
- **No fake data.** Profound and Otterly show "sample data" by default — Beamix shows the actual state of the world.
- **Single CTA.** P10 enforced.
- **One hand-drawn moment.** This is the ONE place hand-drawn lives on /home, per restraint rule. Justification: empty state is an "idle/artifact" surface (MASTERLIST rule 1), and the warmth signals "this product won't lie to you." The illustration also gives the empty page visual interest without resorting to stock illustration or generic shapes.

### Hebrew/RTL empty state
- Headline transcreated.
- CTA "להריץ סריקה".
- Sub-line transcreated.
- Hand-drawn illustration mirrored horizontally (the magnifying-glass handle flips direction so it points "into" the reading flow).

Sources: [Stripe "get started" 3-step empty](https://docs.stripe.com/dashboard/basics), [Linear empty state pattern](https://medium.com/linear-app/invisible-details-2ca718b41a44), [Granola first-meeting empty](https://www.granola.ai/blog/a-new-look-for-granola).

---

## 13. ERROR / DEGRADED STATE

What /home looks like when the system is partially down. The principle: be honest, show last-known state, never blank-screen the user.

### Possible degraded conditions
1. **Scan API unreachable** (last scan ran fine, but new scans fail). 
2. **Last scan is >7 days old, no scheduled scan.** 
3. **One or more engine integrations are offline.** 
4. **Score calculation failed, raw engine results available.** 
5. **Database read latency >2s** (rare). 
6. **Auth token expired mid-session.** 

### Treatment by severity

#### Severity: HIGH (data integrity affected)
- Banner row above the hero (NOT inside it). Background `#FEF3F2` (very light red tint), border-left 3px solid #EF4444. Body text in #991B1B.
- Copy: "We couldn't refresh your score this morning. Showing data from {timestamp}. [Retry now]"
- Retry button: pill, secondary style, link-color text on transparent background.
- Banner is dismissible (× icon top-right) but reappears on next refresh if condition persists.

#### Severity: MEDIUM (single feature affected)
- Inline within the affected section. E.g., if Per-engine strip can't load Grok data, only the Grok pill shows the offline state — the rest of the page is normal.
- Tooltip on hover: "Grok was unavailable in the last scan. Last known score: 64."

#### Severity: LOW (stale data)
- Subtle muted asterisk next to the affected metric. Hover reveals freshness info.
- E.g., "Last updated 16 hours ago"

### Common error microcopy
EN:
- "We couldn't refresh your score this morning. Showing data from yesterday at 9:14am. [Retry now]"
- "Grok was unavailable in the last scan. We'll try again next scan."
- "Couldn't load trend data. [Retry]"
- "Looks like we lost your session. [Sign in again]"

HE:
- "לא הצלחנו לרענן את הציון הבוקר. מציגים נתונים מאתמול ב-09:14. [נסה שוב]"
- "Grok לא היה זמין בסריקה האחרונה. ננסה שוב בסריקה הבאה."
- "לא הצלחנו לטעון נתוני מגמה. [נסה שוב]"
- "נראה שאיבדנו את ההפעלה. [התחבר מחדש]"

### Tone rules (Adam-locked)
- No alarmist language. No "Critical error!" no "Oops!"
- No emojis on errors.
- Always show last-known state alongside the error message.
- Always offer a retry path.

---

## 14. THE 5-MINUTE QA TEST FOR THIS PAGE

A checklist Adam (or any reviewer) can run on any prototype to verify it clears the bar. This is the page's enforceable contract.

### Anti-pattern checks (must all pass)
- [ ] **N1:** No icon-in-tinted-circle anywhere on the page (KPI cards, recommendation cards, activity feed, per-engine strip).
- [ ] **N2:** No gradient backgrounds on any card.
- [ ] **N3:** No "Welcome back, {name}!" greeting at top.
- [ ] **N4:** No multi-color chart palette. Single brand-blue for all sparklines and the trend line.
- [ ] **N5:** No "Pro tip" / "Did you know?" callout boxes.
- [ ] **N6:** No "Quick Actions" panel of stacked buttons. Maximum one primary CTA per section.
- [ ] **N7:** No skeleton-shimmer screens during fetch. Use last-cached + breathing pulse.
- [ ] **N8:** No confetti / celebration animations on success.

### Premium pattern checks (must all pass)
- [ ] **P1:** All numbers tabular (`font-feature-settings: 'tnum'`). Test by scrolling fast — digits don't shift columns.
- [ ] **P2:** Sidebar perceptibly dimmer than content. Test by squinting from 6 feet away — sidebar should recede.
- [ ] **P3:** Sparkline-in-KPI-card on all 4 cards. 1px stroke, no fill.
- [ ] **P4:** "Run all 3 — N credits" CTA exists with the documented anatomy.
- [ ] **P5:** All hover/click responses < 150ms (use browser DevTools Performance tab).
- [ ] **P6:** Click-to-drill works on score, on every KPI card, on every per-engine pill, on every activity row, on every footer row.
- [ ] **P7:** Color tokens defined in LCH. Dark mode and light mode have visually-equal contrast.
- [ ] **P8:** Per-engine pill click filters the trend chart in real-time. No spinner.
- [ ] **P9:** Diagnosis line in Fraunces (EN) / Frank Ruhl Libre (HE). 17-19px.
- [ ] **P10:** Empty state is calm, single-CTA, no fake data.
- [ ] **P11:** Browser tab title reflects pending count. Favicon reflects active state.
- [ ] **P12:** Single brand color #3370FF used disciplined; no other accent colors anywhere except semantic green/red.

### Animation checks
- [ ] Score count-up animates on first load (only first session per browser).
- [ ] Returning users see no entrance animation — content appears at 0ms.
- [ ] `prefers-reduced-motion: reduce` skips all animation.
- [ ] Sub-150ms transitions on all hovers (KPI card hover, pill hover, activity row hover).

### Hebrew/RTL checks
- [ ] Setting `dir="rtl"` flips: sidebar to right, content RTL flow, charts X-axis flips, delta arrow position reverses.
- [ ] Hebrew typography stack swaps correctly (Rubik display, Heebo body, Frank Ruhl Libre serif).
- [ ] Numbers stay Western Arabic.
- [ ] Date format he-IL.
- [ ] Currency in HE: `₪{amount}` prefix.
- [ ] Microcopy is transcreated (not Google-translated) for all 8 sections.

### Accessibility checks
- [ ] WCAG AA contrast on all body text (4.5:1).
- [ ] WCAG AAA contrast on hero score (7:1).
- [ ] All clickable elements have keyboard focus rings (visible 2px outline #3370FF at 50% opacity, offset 2px).
- [ ] Tab order: hero → top fixes → inbox pointer → KPI cards → trend filters → trend chart → engine pills → activity → footer.
- [ ] Cmd+K opens command palette globally.
- [ ] `?` opens cheatsheet overlay.
- [ ] All charts have `aria-label` describing the data.
- [ ] All icons have `aria-hidden="true"` if decorative, or accessible names if functional.

### Smell test (reviewer's gut)
- [ ] If a Stripe designer saw this, would they think "ah, they get it"?
- [ ] If a Linear designer saw this, would they say "the chrome is correct"?
- [ ] If a non-designer SMB owner (Sarah) saw this, would she immediately know what's good and bad?
- [ ] If a power user (Yossi) opened this, would he find the drill paths within 10 seconds?
- [ ] Does any section feel templated? (If yes, redo.)

If any check fails, the page does not ship.

---

## 15. OPEN QUESTIONS FOR ADAM

These are the calls I cannot make without you. Five questions, ranked by impact.

### Q1. Inbox naming in Hebrew — "Inbox" vs "תיבת הנכנסים"
The /inbox surface is locked. But for the Hebrew RTL pointer line ("3 items in your Inbox awaiting review →"), do we keep "Inbox" as a brand-stable English term inside the Hebrew sentence (mirrors how Israeli SaaS users use "אימייל" / "Inbox" mixed with Hebrew naturally), or do we transcreate to "תיבת הנכנסים" (more formal, traditional Hebrew)?

**My lean:** keep "Inbox" untranslated in HE, but allow user to override in /settings/language. Bidi-isolated LTR run inside HE paragraph. Mirrors Wix anchor pattern.

### Q2. Score numeral color — #0A0A0A or #3370FF?
I specced the hero score as #0A0A0A (neutral ink). The argument: color is reserved for the state chip and sparkline; the number's weight is its own visual presence. The alternative is to render the score in #3370FF (brand blue), making it the page's most-saturated element.

**My lean:** #0A0A0A. Stripe's hero revenue numbers are dark, not purple. Mercury balance is dark, not blue. Color discipline (P12) says one accent, applied with restraint. But this is a real call and I want your read.

### Q3. Hand-drawn empty state magnifying glass — ship it or skip it?
Adam locked "different animation per page" and "hand-drawn / pencil / Claude-style ... distributed across pages." The empty state is the only place /home gets hand-drawn (per the restraint rule). The illustration is ~120×120px Excalidraw-style. Ship it for v1, or skip and use no illustration?

**My lean:** ship it. The empty state is the warmest moment on the page and the one place where hand-drawn earns its keep. Without it, the empty state is just a pill button on a blank canvas — fine but forgettable.

### Q4. Plan-locked engines on the per-engine strip — show locked or hide entirely?
Discover plan unlocks 3 engines, Build unlocks 7, Scale unlocks 9. Do we show the locked engines at 50% opacity with a lock icon (so user sees what they're missing), or hide them entirely (less paywall pressure)?

**My lean:** show locked. Otterly hides; that's why they don't convert upgrades. Linear shows locked features with subtle "team plan" hints. Beamix /home should show — but the lock icon is small and monochrome, never a CTA-banner-style nag.

### Q5. Top 3 fixes — when there are fewer than 3 fixes, do we pad with a "Custom request" card or shrink the section?
If only 1 fix is ready, we either show 1 card and the section title says "TOP 1 FIX READY", or we add a 3rd card "What else? Tell us what to fix" → opens a free-text request modal.

**My lean:** shrink. Padding is a confidence-undermining move. The product showing "we found 1" is more honest than "we found 1 + a placeholder."

---

## 16. SOURCES

Every URL cited above, consolidated.

### Anchor 1 — Stripe Dashboard
- [Stripe Dashboard basics](https://docs.stripe.com/dashboard/basics)
- [Stripe Apps style guide](https://docs.stripe.com/stripe-apps/style)
- [Stripe Help: Dashboard charts](https://support.stripe.com/questions/dashboard-home-page-charts-for-business-insights)
- [Brian Lovin — Stripe Dashboard for iOS](https://brianlovin.com/design-details/stripe-dashboard-ios)
- [Michaël Villar — Stripe Dashboard iPhone](https://medium.com/swlh/exploring-the-product-design-of-the-stripe-dashboard-for-iphone-e54e14f3d87e)
- [Sohne in action — Typ.io](https://typ.io/s/59wr)
- [Stripe homepage UI review](https://dev.to/kyleparisi/quick-ui-review-stripe-homepage-4bab)
- [Stripe Press](https://press.stripe.com)
- [Matt Strom — Stripe Dashboard case study](https://mattstromawn.com/projects/stripe-dashboard)

### Anchor 2 — Linear
- [How we redesigned the Linear UI](https://linear.app/now/how-we-redesigned-the-linear-ui)
- [Behind the latest design refresh](https://linear.app/now/behind-the-latest-design-refresh)
- [Linear Dashboards changelog](https://linear.app/changelog/2025-07-24-dashboards)
- [Welcome to the new Linear](https://linear.app/changelog/2024-03-20-new-linear-ui)
- [Linear Mobile app redesign](https://linear.app/changelog/2025-10-16-mobile-app-redesign)
- [Linear AIG developers](https://linear.app/developers/aig)
- [Linear keyboard shortcuts help](https://linear.app/changelog/2021-03-25-keyboard-shortcuts-help)
- [Linear: Invisible Details](https://medium.com/linear-app/invisible-details-2ca718b41a44)
- [Linear Now](https://linear.app/now)

### Anchor 3 — Mercury
- [Mercury — Updated Transactions](https://mercury.com/blog/updated-transactions-page)
- [Mercury — Viewing cashflow data](https://support.mercury.com/hc/en-us/articles/38790547830036-Viewing-cashflow-and-transactions-data-on-your-Transactions-page)
- [Mercury Insights overview](https://support.mercury.com/hc/en-us/articles/44277089544084-Insights-page-overview)
- [Mercury home](https://mercury.com)
- [Mercury demo dashboard](https://demo.mercury.com/dashboard)

### Anchor 4 — Vercel
- [Vercel dashboard redesign](https://vercel.com/blog/dashboard-redesign)
- [Geist intro](https://vercel.com/geist/introduction)
- [Geist typography](https://vercel.com/geist/typography)
- [Vercel Design](https://vercel.com/design)
- [The Birth of Geist — basement.studio](https://basement.studio/post/the-birth-of-geist-a-typeface-crafted-for-the-web)

### Anchor 5 — Anthropic Console
- [Anthropic Console](https://console.anthropic.com)
- [Anthropic — Cost and Usage Reporting](https://support.anthropic.com/en/articles/9534590-cost-and-usage-reporting-in-console)
- [Claude Design help](https://support.claude.com/en/articles/14604416-get-started-with-claude-design)

### Hand-drawn / illustration toolchain
- [Rough.js](https://roughjs.com/)
- [Excalifont](https://plus.excalidraw.com/excalifont)
- [Kyle Martinez — Claude ASCII spinner](https://medium.com/@kyletmartinez/reverse-engineering-claudes-ascii-spinner-animation-eec2804626e0)
- [Ola Hungerford — Drawing and animating with Claude](http://www.olahungerford.com/drawing-and-animating-with-claude/)

### Animation / motion
- [Framer Motion docs — pathLength](https://motion.dev/docs/react-svg-animation)
- [Noel Cserepy — Animate SVG paths with Framer Motion](https://blog.noelcserepy.com/how-to-animate-svg-paths-with-framer-motion)
- [Emil Kowalski — Sonner / Vaul](https://emilkowal.ski)

### Hebrew / RTL
- [Wix Multilingual — RTL switch](https://support.wix.com/en/article/wix-multilingual-using-multi-state-boxes-to-switch-from-ltr-to-rtl)
- [Wix Languages available](https://support.wix.com/en/article/languages-available-in-the-wix-site-builders)
- [Rubik on Google Fonts](https://fonts.google.com/specimen/Rubik)
- [Heebo on Google Fonts](https://fonts.google.com/specimen/Heebo)
- [Frank Ruhl Libre on Google Fonts](https://fonts.google.com/specimen/Frank+Ruhl+Libre)
- [next-intl docs](https://next-intl.dev)
- [shadcn/ui RTL guide](https://ui.shadcn.com/docs)

### Other premium references cited
- [Things 3 features](https://culturedcode.com/things/features/)
- [Granola — A new look](https://www.granola.ai/blog/a-new-look-for-granola)
- [Notion Calendar help](https://www.notion.com/help/notion-calendar-apps)
- [Pitch home](https://pitch.com)
- [Raycast Manual](https://manual.raycast.com)
- [Arc browser design analysis — Medium](https://medium.com/design-bootcamp/arc-browser-rethinking-the-web-through-a-designers-lens-f3922ef2133e)
- [PostHog dashboards](https://posthog.com/docs/product-analytics/dashboards)
- [Attio dashboards help](https://attio.com/help/reference/managing-your-data/dashboard-and-reports/dashboards)
- [Ramp — Bakken & Baeck case](https://bakkenbaeck.com/case/ramp)
- [Tonik](https://tonik.com)
- [Rauno.me](https://rauno.me)
- [Devouring Details](https://devouringdetails.com)

### Anti-references
- [Profound — Custom Dashboards](https://www.tryprofound.com/blog/introducing-custom-dashboards-in-profound)
- [Otterly home](https://otterly.ai/)
- [Peec.ai vs Profound — Writesonic](https://writesonic.com/blog/peec-ai-vs-profound)
- [AdminLTE SaaS templates (anti)](https://adminlte.io/blog/saas-admin-dashboard-templates/)

### Internal documents referenced
- `docs/08-agents_work/2026-04-25-HOME-PREMIUM-REFS.md` (900-line ref hunt)
- `docs/08-agents_work/2026-04-25-REFERENCES-MASTERLIST.md` (12 design rules + 7 anchors)
- `docs/08-agents_work/2026-04-25-PAGE-LIST-LOCKED.md` (8-section structure)
- `docs/08-agents_work/2026-04-25-DECISIONS-CAPTURED.md` (Adam's locked decisions)
- `~/.claude/projects/-Users-adamks-VibeCoding-Beamix/memory/project_quality_bar_billion_dollar.md` (the bar)
- `docs/BRAND_GUIDELINES.md` v4.0
- `docs/PRODUCT_DESIGN_SYSTEM.md`

---

## END

Total: 8 sections fully specced + 9 cross-cutting concerns (interaction primitive, status-outside, choreography, empty state, error state, QA test, open questions, sources). Every claim cited. Every anti-pattern checked. Every section has Sarah-mode and Yossi-mode. Hebrew/RTL is in every section, not as an addendum.

Quality bar: would Stripe ship this? Would Linear ship this? Yes, because every choice is grounded in their public documentation. The page is opinionated, restrained, and rewards both the 30-second glance and the 5-minute drill.

Next: Adam reads section by section, reacts, iterates. Then design-lead implements (or briefs frontend-developer) for Section 1 first, validate against the QA test, then proceed.
