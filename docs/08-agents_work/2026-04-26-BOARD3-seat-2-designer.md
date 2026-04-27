# Beamix — The Master Designer's Brief

**Board 3, Seat 2.** A constructive, maximum-craft response to two boards that argued about how much restraint to apply. They were having the wrong argument. Restraint is a tool. The question is what the product *is* — and once you know that, the visual decisions stop being negotiable.

This document lays out the version of Beamix that is the most beautiful AI-Visibility product anyone has ever shipped. Not the cheapest to build. Not the safest to defend in a board. The one that, three years from now, gets photographed for an Awwwards retrospective and quoted as the moment "GEO products" became "Beamix and a list of dashboards."

Adam asked for the version that dominates through craft. Here it is.

---

## Section 1 — The Visual Identity

### 1.1 The single image

Every category-defining product has a single image people see in their head when the brand is named. Stripe is a gradient. Linear is a dot. Apple is white. Notion is a triangle disclosure. Vercel is a black diamond on white. Anthropic is a cream paper plane.

Beamix's single image is **The Activity Ring** — a thin blue arc with a small, hand-drawn break in it, pulsing softly at the gap. The arc circles a number. The number is the score. The break is the work that's still in flight.

The Activity Ring is not a progress bar. It is a *living mark*. It says: *"work is happening. Right now. On your behalf. You are not alone."* It is the only place in the product where the digital and the hand-drawn meet — a 2px geometric arc terminated by a pencil-stroke gap with three small jitter points. CSS-stroke geometry from one side; Rough.js linework from the other. The seam between them *is* the brand.

This is the screenshot. This is the favicon. This is the Twitter card. This is what gets tattooed on a designer's forearm in 2029.

But the Activity Ring is not alone. It's the *centerpiece* of a small, deliberate iconography:

- **The Ring** (above-the-fold on /home, /scan public hero, /reports cover, email digest header)
- **The Trace** — Crew Traces, faint Rough.js underlines beneath text agents have recently touched. Roughness 0.6, `#3370FF` at 28% opacity, 1.5px stroke. They appear, hold for 24h, fade.
- **The Seal** — a small wax-seal mark (Rough.js-rendered six-point star, the mark from the Beamix logo, 16×16) that appears on every artifact Beamix authors: the Brief, the Monthly Update PDF, the public scan share card. The seal is the signature.
- **The Margin** — a 24px-wide vertical strip on the left edge of any artifact (digest, scan, report) where Crew Traces, dates, and seal-marks accumulate over time. Like the ledger of a bookkeeper, the margin is where the product *remembers*.

Together, these four marks (Ring + Trace + Seal + Margin) form the **Beamix sigil system**. They are not decoration. They are the visual evidence that Beamix is a *practice*, not a dashboard. They are the moves that no competitor will copy because to copy them they'd have to adopt a worldview, not a stylesheet.

If you took every other element off the screen — typography, colors, layout — and left only the Ring, the Trace, the Seal, the Margin, a Beamix user could still identify the product. That is what visual identity *means*.

### 1.2 The typography system — full

Three families. Each used with discipline. Italics earned, never decorative.

| Family | Role | Where |
|---|---|---|
| **InterDisplay** (Rasmus Andersson, Inter Foundry) | The voice of numbers and headlines | Hero numbers, section headings, the Score, KPI tiles, navigation, page titles |
| **Inter** | The voice of substance | Body, microcopy, captions, table cells, status sentences, the entire long-form |
| **Fraunces** (Phaedra Charles + Undercase Type) | The voice of authorship | Brief paragraphs, Monthly Update headlines, the *signature line* on every artifact, the empty-state copy on emotionally significant surfaces |
| **Geist Mono** (Vercel) | The voice of mechanism | Timestamps, scan IDs, attribution lines, /crew agent names, version numbers, anywhere that says "this is technical truth" |

**Why Fraunces (not Source Serif, not Tiempos, not GT Sectra).** Fraunces is *deliberately* warm. It has axes for `softness` and `wonk` that, dialed correctly (softness 100, wonk 0, optical 144), produce a serif that reads like a hand-set typeface from a small letterpress shop. It's the only contemporary serif that reads simultaneously *editorial* and *human*. Stripe Press uses Tiempos because Tiempos is colder. Beamix uses Fraunces because Beamix's authorship is not corporate — it is *practiced*. The Brief is a letter from a person who does this work, not a contract signed in triplicate.

**The full type scale (10 sizes, locked, no exceptions):**

| Token | px | Line | Family / Weight | Feature settings | Use |
|---|---|---|---|---|---|
| `text-display` | 96 | 96 | InterDisplay 500 | `tnum, cv11, ss03` | The Score on /home and /scan public hero only. One per page max. |
| `text-h1` | 48 | 56 | InterDisplay 500 | `cv11, ss03` | Page titles on artifact surfaces (Monthly Update, Brief, /scan public). |
| `text-h2` | 32 | 40 | InterDisplay 500 | `cv11` | Above-fold section headings, KPI hero numbers (mentions, citations counts). |
| `text-h3` | 22 | 32 | InterDisplay 500 | `cv11` | Section headings inside surfaces (e.g., "This Week's Net Effect"). |
| `text-lg` | 18 | 28 | Inter 400 | default | Lead paragraphs, the Status Sentence above the fold, the Brief body. |
| `text-base` | 15 | 24 | Inter 400 | default | All body, table rows, descriptions. |
| `text-sm` | 13 | 20 | Inter 400 | default | Microcopy, Crew Trace tooltips, secondary table data. |
| `text-xs` | 11 | 16 | Inter 500 | `tnum, smcp` (or manual caps + 0.10em tracking) | Labels, eyebrow caps, axis ticks, attribution timestamps. |
| `text-mono` | 13 | 20 | Geist Mono 400 | `tnum, ss01, ss02` | Timestamps, scan IDs, `/crew` agent slugs, version numbers. |
| `text-serif-lg` | 28 | 40 | Fraunces 300, opsz 144, soft 100, wonk 0 | `ss01` | The Brief paragraph. The Monthly Update headline number-sentence. The signature line. |

**Italics rules (this is where most products fail).**
- Inter italics: never. Inter's italic is a *slanted roman*; using it for emphasis just looks like a font bug. Use weight (500) for emphasis, never italic.
- Fraunces italics: yes, but only on the *signature line* of an artifact ("— your crew" in 22px Fraunces italic 300, opsz 144). Never anywhere else. The italic is reserved like a wax seal — it means "this is signed."
- Geist Mono italics: never. Mono italic is illegible and gimmicky.

**Tabular discipline.** Every number that could appear next to another number is `font-feature-settings: 'tnum'`. The Score, the deltas, the KPI tiles, the engine chip mini-scores, the timestamps in /scans, the version numbers on the Brief. *Especially* the Score, where the user's eye is calibrated to 0.5px shifts.

**Stylistic sets (the invisible 5,000 decisions).**
- `cv11` on InterDisplay → a single-story `g`. Reads warmer, less robotic.
- `ss03` on the Score → straight-sided digits. Gives the number an architectural quality at 96px.
- `ss01` on Geist Mono → a 0 with a slash. So `0` and `O` are distinguishable in scan IDs.
- `ss01` on Fraunces → a more closed `g` and softer `a`. Reads more "letterpress" than "magazine."

These five feature-setting decisions, applied consistently, are the difference between *Inter on a page* and *Beamix*. Most products skip them because the design lead doesn't know they exist. We don't.

### 1.3 The color system

Light mode is locked. Dark mode is *not* a flip — it's a separate composition we'll address in 1.3.4.

#### 1.3.1 Primary palette

| Token | Hex | Use |
|---|---|---|
| `brand-blue` | `#3370FF` | The Ring. The Trace. Active state. The CTA primary. The signature accent. |
| `brand-blue-deep` | `#1F4FCC` | Hover state on primary CTA. The terminal node of the Ring on full-cycle close. |
| `brand-blue-soft` | `rgba(51,112,255,0.06)` | The wash behind active engine chips. The Decision Card background. |
| `ink` | `#0A0A0A` | All primary text. The Score. Headings. |
| `ink-2` | `#3F3F46` | Secondary text. Section subheadings. Active table data. |
| `ink-3` | `#6B7280` | Muted text. The status sentence. Captions. |
| `ink-4` | `#9CA3AF` | Very muted. Axis labels. Timestamps in dense tables. |
| `paper` | `#FFFFFF` | Primary surface. |
| `paper-elev` | `#FAFAF7` | Elevated surface. **Note the warm tint** — slightly cream-ward, not the bluish `#F9FAFB` of generic Tailwind. The 3-point warmth shift is the difference between *paper* and *digital chrome*. |
| `paper-cream` | `#F7F2E8` | The cream-paper register. Used ONLY on artifacts: Brief background, Monthly Update PDF, /scan public hero, email digest header strip. Never on UI chrome. |
| `border` | `rgba(10,10,10,0.06)` | Card borders, table dividers. Opacity-based so it survives dark-mode flip. |
| `border-strong` | `rgba(10,10,10,0.12)` | Form fields, primary action edges. |

#### 1.3.2 Semantic palette (for data, not for chrome)

| Token | Hex | Use |
|---|---|---|
| `score-excellent` | `#06B6D4` | Score 85+. The cyan only appears on data, never on chrome. |
| `score-good` | `#10B981` | Score 70-84. Positive deltas. |
| `score-fair` | `#F59E0B` | Score 50-69. The "watching" state. |
| `score-critical` | `#EF4444` | Score <50. Negative deltas of >5. Used sparingly — Beamix doesn't yell. |
| `needs-you` | `#D97706` | The amber in Status Tokens and Decision Cards. Notably warmer than `score-fair` — this is action-required, not data. |

**The discipline:** the brand blue (`#3370FF`) is the *only* color that appears on chrome. Every other color is reserved for data. If a button is colored, it's blue. If a chart line is colored, it picks from semantic. If a pill is colored, it's a status token (one of three semantic states). This is how Stripe and Linear stay clean while Notion and Asana feel chaotic.

#### 1.3.3 The cream-paper register

The cream (`#F7F2E8`) is Beamix's editorial voice. It signals: *this is an artifact you can hold*. It appears on:
- The Brief (the 1-paragraph onboarding contract)
- The Monthly Update (1-page email + permalink)
- The /reports white-label PDF
- The public scan share card (the OG-image variant)
- The /scan public result hero (locked)
- The Monday Digest email header strip (32px tall band at top of email)

It does *not* appear on /home, /scans, /inbox, /competitors, /crew, /schedules, /settings. The product surface is bright paper white. The artifact surface is cream. That's how you know which one you're on without reading.

This is the *single* most copied move competitors will attempt and fail at. They'll pick the cream as a chrome color. They'll wash the dashboard in it. It will look like an old Mac OS theme. The discipline — cream *only* on artifacts — is what makes it work.

#### 1.3.4 Dark mode (composition, not flip)

Dark mode is not "invert the colors." It's a separate composition with its own warmth.

| Token | Light | Dark |
|---|---|---|
| `paper` | `#FFFFFF` | `#0E0E10` (warm near-black, not pure black) |
| `paper-elev` | `#FAFAF7` | `#16161A` |
| `paper-cream` | `#F7F2E8` | `#1A1812` (a deep warm brown — the artifact still feels paper-y, dimmed) |
| `ink` | `#0A0A0A` | `#F5F5F2` (warm off-white, never pure white) |
| `brand-blue` | `#3370FF` | `#5A8FFF` (lifted for legibility on dark backgrounds) |
| `border` | `rgba(10,10,10,0.06)` | `rgba(255,255,255,0.08)` |

The dark mode is *evening light*, not *theater dark*. Same warmth, dimmed. This is what Linear and Stripe Atlas do well. Notion's dark mode reads cold; ours doesn't.

### 1.4 Spacing rhythm

**Base grid: 8px. Micro: 4px.** Six allowable spacing values: `4, 8, 12, 16, 24, 48`. Two further allowed for vertical rhythm: `72, 120`. Nothing else. No `10`, no `14`, no `20`, no `32`. The discipline is the design.

**Component padding:**
- Card internal: 24px
- Pill/chip internal: 12px horizontal, 6px vertical (the one allowed `6` exception, used only here)
- Form field internal: 12px horizontal, 10px vertical (the one `10` exception)
- Table row vertical: 16px (44px row height with text)
- Section vertical gap: 72px between major sections, 48px between subsections

**The deliberate inconsistency.** The above-the-fold of /home breaks the 72px section rhythm. The Score sits 120px from the top of the content area, and the Section 2 (This Week's Net Effect) starts 96px below the score-cluster — not 72, not 48. This *deliberate stretch* is what gives /home its expensive feel: the hero is *floating*, not *placed*. Every other page conforms to the rhythm. /home gets the breath because /home is the front door.

This is the move Apple makes constantly and most products miss: the rhythm is strict everywhere except the one place where breaking it is the design. The breath above the Score is intentional. It is not whitespace — it is *air*.

**Page max-widths:**
- /home content: 1180px
- /scans, /competitors, /crew table: 1340px (data-dense, wider canvas)
- /inbox: 880px (focus on the queue)
- The Brief: 640px (single-column reading)
- Monthly Update permalink: 720px

### 1.5 Motion language (philosophy)

Section 4 covers the full vocabulary. The philosophy here:

**Motion communicates state. It never decorates static states.** Every animation in Beamix has a *meaning*. The Score counts up because it was *calculated*. The Ring pulses because work is *in flight*. The Brief signature pen-strokes itself because the customer *just signed*. Motion is the product talking back.

**One animation per surface per visit.** A user opening /home sees: Score count-up (1×), sparkline path-draw (1×), Crew Traces fade-in (1×), Decision Card spring entrance (1×, conditional). After that, the page is static. Subsequent loads in the same session: no replays. The product does not perform for the user.

**Motion budget: 1.6 seconds total per page load.** That's the sum of all simultaneous animations. Anything over 1.6s feels like waiting; anything under 0.8s feels like flickering. The Score count-up alone is 800ms; the sparkline draw is 1000ms; they overlap. The total is right.

**Reduced motion is not a fallback — it's a *first-class composition*.** Every animated element has a designed static state. The Ring is still a ring with a gap. The Score still appears, just instantly. The sparkline still draws, just at frame zero. We design `prefers-reduced-motion: reduce` first, then layer the motion as enhancement.

### 1.6 The hand-drawn register — exact placement

Frame 5's board called this craft, not moat. They were wrong. The hand-drawn register is the *only* visual differentiator Beamix has from Profound, Otterly, Surfer, and every other GEO tool. Strip it and we're a less-featured Profound at 3x the price. Keep it and we're a category.

**Where the hand-drawn lives (and where it doesn't):**

| Surface | Hand-drawn? | What |
|---|---|---|
| /home above-fold | Yes | The Activity Ring gap (Rough.js terminus on a CSS-arc geometry) |
| /home below-fold | Yes | Crew Traces under recently-modified text |
| /inbox empty state | Yes | One 96×96 illustration: a closed laptop with a small leaf (calm + finished) |
| /workspace | Yes | Step markers (Rough.js circles, roughness 0.8, consistent seed per agent) |
| /scan public | Yes | Strikethrough-and-rewrite mechanic (locked storyboard) |
| Brief (onboarding step) | Yes | The signature line ("— your crew") and the wax-seal Beamix mark |
| Monthly Update | Yes | The seal at the bottom; a small Rough.js sparkline accent |
| Email digest header | Yes | A 32px cream strip with one Rough.js sigil mark |
| /scans table | No | Stripe table grammar. Clinical. |
| /competitors table | No | Clinical intelligence. Data first. |
| /crew | Restrained | Each agent's profile gets ONE Rough.js mark — their monogram, drawn — but the surface chrome is clean |
| /schedules | No | Admin grammar. |
| /settings | No | Stripe replica. |

The principle: **hand-drawn appears where the product is showing its work; absent where the user is doing administrative work.** The register maps to meaning.

The Frame 5 board cut the Ring and Traces because they're "craft, not moat." That's the wrong frame. Craft *is* moat — but only when it's coupled to the product's purpose. The Ring is craft *because* it shows live work. The Trace is craft *because* it marks recent change. Strip them and we're a dashboard. Keep them and we're a *practice*.

---

## Section 2 — Page-by-page maximum craft

### 2.1 /home

This is the front door. It must do three things in the user's first 2 seconds: make them feel *cared for* (work is happening), *informed* (the answer is right here), and *unhurried* (nothing is on fire that they don't already know about).

**Above the fold (1440×900 viewport, content area 1180px × ~520px):**

Top edge to score-cluster: 120px breath.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   [120px breath]                                                │
│                                                                 │
│              ╭─────╮                                            │
│             ╱       ╲                                           │
│            │   78    │   +5  ──── Healthy and gaining           │
│            │         │                                          │
│             ╲       ╱                                           │
│              ╰─ ─ ─╯                                            │
│                                                                 │
│   Your crew shipped 6 changes this week.                        │
│   ─────────────────────────────────────                         │
│                                                                 │
│   ┌─────────────────────────────────────────────────┐           │
│   │  One thing needs you →                           │           │
│   │  Approve a homepage hero rewrite. ~30 seconds.   │           │
│   └─────────────────────────────────────────────────┘           │
│                                                                 │
│   [96px breath]                                                 │
│ ─ This Week's Net Effect ─ ─ ─ ─ (Section 2 peeks 36px) ─ ─    │
└─────────────────────────────────────────────────────────────────┘
```

**Element specs:**

- **The Score**: `text-display` (96px InterDisplay 500, tabular, ss03). Color `ink`. Sits inside the Ring's interior. Centered horizontally on a 200px column at the left of the cluster.
- **The Ring**: 200px outer diameter, 2px stroke, color `brand-blue`. SVG arc from -90° (top) clockwise to +252° (so the gap is at top-right, ~30° wide). The gap terminus has a tiny Rough.js dash mark — 4px long, 1.5px thick, slight jitter. The gap pulses (opacity 0.4 → 1.0, 1200ms ease-in-out, infinite) when the system is acting. Static when idle. On cycle complete (weekly scan finishes + all auto-fixes applied), the gap closes (the arc completes) for 800ms, then re-opens at the new cycle baseline. This single moment — the brief closure — is the visual reward of the week.
- **The Delta**: 32px (text-h2) InterDisplay 500, tabular. To the right of the Ring at the score's baseline. `+5` colored `score-good`, `-3` colored `score-critical`. No "+/-" prefix on neutral.
- **The Status Sentence**: 18px (text-lg) Inter 400, color `ink-3`. Same baseline as delta. Reads "Healthy and gaining." or "Working on three things." or "One thing needs you." Dash-separator (`──── `) between delta and sentence at `ink-4`, 24px wide.
- **The lead paragraph**: 22px Fraunces 300 (text-serif-lg) — *yes, Fraunces, here* — directly below the score-cluster, 48px gap. "Your crew shipped 6 changes this week." This is the only place on /home where Fraunces appears, and it's reserved for the *editorial summary line*. Crew Traces appear under specific nouns ("6 changes") if recent.
- **Decision Card** (conditional, only when "Needs You" state): 24px below the Fraunces line. 96px tall, 100% content-width. `paper-elev` background with `border` stroke, 12px radius. Title: 18px Inter 500 with a `→` glyph; subtitle 14px Inter 400 ink-3. Right-aligned button: 14px Inter 500, brand-blue background, white text, 8px radius. Spring entrance: 200ms, translate-y 6px → 0, opacity 0 → 1.

**Below the fold (sections in order, 72px gaps):**

**Section 2 — This Week's Net Effect.** A single paragraph, 18px Inter 400 (text-lg), max-width 720px, line-height 28px. Plain English: *"ChatGPT now cites you on 4 new emergency-plumbing queries. Schema Doctor resolved 3 structured-data errors on /pricing. Citation Fixer added 11 FAQ entries that match how Perplexity asks questions, not how brochures answer them."* Crew Traces appear under nouns from the past 24 hours.

**Section 3 — Score Trend.** A 480×120 sparkline, `perfect-freehand` rendering (thinning 0.5, 2% jitter, 1.5px base stroke), 12 weeks of data. `brand-blue` line. No axes, no grid. Below the line, in 11px Inter caps with 0.10em tracking, ink-4: `12-WEEK TREND`. Hover: vertical crosshair with a single tooltip — 13px tabular Inter, "Apr 18 · 73 (+2)". Path-draws on first session load (1000ms ease-out clip-path).

**Section 4 — Engine Quick-Strip.** Up to 11 chips in a horizontal row, wrapping if narrow. Each chip: 56px tall, 12px horizontal padding. Engine name (12px Inter 500 caps, 0.06em tracking), mini-score (18px InterDisplay tabular), mini-delta (12px Inter 500 with semantic color). Active engines: `brand-blue-soft` background, `border` stroke. Gated engines: 40% opacity with a faint padlock glyph, hover reveals "Available on Build →". Click any chip → /scans filtered to that engine.

**Section 5 — Recent Crew Activity.** A 5-row list, 56px row height. Each row: agent monogram (16×16 Rough.js circle, agent's color), 14px Inter 400 (text-base) with the action sentence, 13px Geist Mono ink-4 timestamp right-aligned. Hover background `rgba(10,10,10,0.03)`. Click → /inbox filtered to that item. Crew Traces appear under nouns from the past 24h.

**Section 6 — KPI Quartet.** Four cards in a row. Each: 24px padding, 12px radius, `border`. Top label 11px caps tracking; hero number 32px InterDisplay tabular (Mentions / Citations / Engine Coverage / Competitor Delta); below the number, 12px Inter ink-3 secondary line ("38 this week, +6"). On hover: a faint sparkline appears in the card, drawn to fit, lasting until mouse-out.

**Section 7 — Receipts (House Memory rendered).** A reverse-chronological list of past digests, scans, and Monthly Updates. 13px Geist Mono date column on the left (24px Margin), 14px Inter 400 main column with the artifact title and the seal mark. Click any row → opens that artifact in its native register (digest, scan permalink, Monthly Update PDF).

**Section 8 — Next Up.** A single line at the bottom. *"Next scan: Friday 9am · Next digest: Monday 7am."* 13px Inter ink-3. Click → /schedules.

Total /home content: ~1,520px tall. The fold is at 900px (mobile breakpoint considered). The product is *full*, not sparse. Every element earned its place.

**Motion choreography on first session load (1.6s budget):**
- 0ms: page renders static skeleton (Ring static, score 0, sparkline empty)
- 100ms: Score count-up begins (800ms ease-out)
- 100ms: Sparkline path-draw begins (1000ms ease-out, clip-path left)
- 600ms: Crew Traces fade in across the page (300ms each, staggered 50ms)
- 800ms: Status pill renders text
- 1100ms: Decision Card spring entrance (if applicable)
- 1100ms: Activity Ring begins its first pulse cycle

After 1.6s, the page is static except for the Ring's continuous pulse (when acting) and the cursor.

**The distinctive moves no other product has:**
1. The Activity Ring's pencil-mark gap (CSS arc + Rough.js terminus seam)
2. Crew Traces (post-action ambient evidence)
3. Fraunces editorial summary line embedded in a SaaS dashboard

### 2.2 /inbox

The consent surface. Beamix proposes; the user approves, rejects, or modifies. This page is where trust is built or lost.

**The fold:**

Three columns. Left (240px): filter rail. Center (560px): item list. Right (340px): preview panel.

**Filter rail (left):**
- Pinned at top: review-debt counter. 22px Fraunces (italics) "3 items waiting since Tuesday." Pulsing amber 6px dot if past threshold.
- Below: filter list — All / Needs you / Auto-pending / Brief exceptions. 14px Inter 400, 36px row height, active state has a 2px brand-blue left border.
- Below: agent filter list — 11 agents, monogram + name, badge with count. Click filters by agent.

**Item list (center):**
Each item card: 96px tall, full-width, 16px padding. Layout:
- Top row: agent monogram (Rough.js, 16×16) · 14px Inter 500 agent name · 13px Geist Mono ink-4 timestamp · status pill (right-aligned, 12px Inter caps, brand-blue-soft for "proposed", needs-you for "needs you", neutral for "auto-pending")
- Headline: 16px Inter 500 ink, single line, ellipsis. Example: *"Add FAQ schema to /services/emergency-plumbing"*
- Diff preview: 13px Geist Mono ink-3, 2 lines max. Example: `+ 11 FAQ entries · 0 errors · est. +0.4 score`
- Hover: card lifts 1px (translate-y), border darkens to `border-strong`.

Click → preview panel opens on the right with full diff.

**Preview panel (right):**
- Top: full agent name + monogram + Brief clause reference ("references your Brief: 'show up for emergency plumbing queries'")
- Middle: the actual diff — code-style, monospace, with green/red gutters for additions/removals
- Bottom: three-button row — `Approve` (brand-blue), `Modify` (ghost), `Reject` (ghost with red text). 44px tall buttons. The `Approve` button has a tiny Rough.js seal-mark next to it that draws on hover (foreshadowing the artifact you're authorizing).
- A `Why this matters` expandable below — 14px Inter, contains the agent's reasoning ("Perplexity asks 'who can come now?' more than 'who's licensed?'; we phrased the FAQ accordingly")

**Empty state:** the canonical "everything's handled" illustration. 96×96 closed laptop with a single leaf, Rough.js, ink-3 stroke. Caption in 22px Fraunces 300: *"Nothing needs you. Your crew is working on three things."* Below the caption: a 14px Inter ink-3 secondary line: "Recent: Schema Doctor approved a /pricing fix · 14 minutes ago"

**Distinctive moves:**
- The review-debt counter in *Fraunces italics* — it whispers, doesn't shout
- The Approve button drawing a seal on hover (you're about to author an artifact)
- The "Brief clause reference" — every approval ties back to the Brief the user signed; this is the *constitutional grounding* that no Profound or Otterly has

### 2.3 /workspace

The agent-at-work surface. Demoted from primary; reachable via "watch what your crew is doing" link. The job here is to make a 90-second runtime feel *worth watching*.

**Layout:**
- Left rail (320px): agent list. Active agents at top with a pulsing brand-blue dot. Idle agents below at 60% opacity.
- Center (700px): the active agent's *journey* — a vertical step list with Rough.js circles for step markers (30px diameter, roughness 0.8, consistent seed per agent).
- Right rail (280px): the current step's *output* — what the agent is producing right now, rendered live.

**The journey (center):**

This is the page-as-cinematography moment. Each step is a Rough.js circle connected by a hand-drawn vertical line (1.5px, 28% opacity brand-blue). The current step's circle pulses at 1200ms. Steps that are done have a small filled center mark. Steps that are pending are hollow.

To the right of each step: the step name (14px Inter 500), the substep currently running (13px Inter 400 ink-3, *rotating every 800ms* with a 200ms cross-fade — this is one of Beamix's signature motion moves: the micro-text rotation under the active step). Example sequence on a "Schema Doctor: fix /pricing schema" task:
- Step 3 active: "Validating against schema.org spec..." → "Checking for Profound's recent additions..." → "Running PageSpeed lighthouse..." → "Estimating CTR impact..."

This rotating microcopy sells the *depth* of agent work. The user feels: *something serious is happening here, this is not a wrapper*.

**The output (right):**

Live-rendered preview of the agent's work-in-progress. For Schema Doctor: the JSON-LD it's drafting, with green-highlighted additions appearing as it generates. For Citation Fixer: the FAQ entries appearing one at a time, the cursor blinking at the end of the current sentence. For Competitor Watch: the live diff between competitor pages.

**The micro-text rotation curve:** `cubic-bezier(0.4, 0.0, 0.2, 1)` (Material's "standard"), 200ms cross-fade. *Never* a wipe or slide. Always opacity-only. This is what separates "feels alive" from "feels gimmicky."

**Distinctive moves:**
- The Rough.js step markers on a journey (no other SaaS does this — most use circles or icons; we use *drawn marks*)
- The rotating substep microcopy
- The live-output panel that *actually shows the work being done* (Devin pioneered this; we apply it to GEO)

### 2.4 /scans

Historical record + 4 lenses. The job: feel as crisp as a Stripe transactions table while letting the user *time-travel* through their AI visibility.

**Layout:**

Top toolbar: search field (320px) · filter chips (engine, agent, status, date range) · sort dropdown · `Export` ghost button. 60px tall, separated by 1px `border` bottom.

Lens tabs (sticky below toolbar): `All · Done · Found · Researched · Changed`. 14px Inter 500 caps, 0.06em tracking, 12px vertical padding. Active tab has a 2px brand-blue underline. The 4 lenses are filters on the same data, not different surfaces.

Table:
- Columns: Date (Geist Mono) · Agent (monogram + name) · What (sentence) · Engine (chip) · Status (pill) · Score impact (signed number, tabular) · Share icon
- Row height 56px, alternating background `paper` / `paper-elev`
- Click any row → drawer opens from the right (520px wide) showing the full scan detail with the artifact's seal at the top
- The Share icon: a small chain-link glyph; on click opens "Generate share link" dialog (default-private, explicit share)

**The Margin column.** On the left edge (24px wide), every scan row has a vertical strip with a small Rough.js mark — agent's monogram in their color. Over time, the Margin reads as the *fingerprint* of who has been working. Yossi loves this. Sarah ignores it but absorbs it subliminally.

**Distinctive moves:**
- Lens tabs as filters on a single table (not 4 separate pages — discipline)
- The Margin column as ambient agent-fingerprint
- The artifact drawer with the seal at the top (every scan is a potentially shareable artifact)

### 2.5 /competitors

The Rivalry Strip + clinical depth.

**Above the fold:**

The **Rivalry Strip** — a horizontal band, 280px tall, showing you and your top 3 competitors as parallel sparklines on the same axis. Each line is `perfect-freehand` rendered with the agent-color of the competitor. Your line is brand-blue, 2px stroke. Competitors are 1.5px in their assigned colors. The strip animates a subtle horizontal scroll (4-week window) on hover, showing the time evolution. Below the strip, in 22px Fraunces 300: *"You pulled even with Profound this Tuesday."* This editorial summary is auto-written by Competitor Watch and refreshes weekly.

**Below the fold:**

A clinical table.
- Columns: Competitor · Their score · Your delta · Citations they have you don't · Last move (timestamp + Geist Mono) · Their Brief-clause-impact
- Each row references the Brief clause that named the competitor (e.g., "named in your Brief: 'three local rivals on emergency plumbing'")

Click a competitor → drawer with full intelligence: their recent FAQ additions, schema changes, content updates. *This* is the depth that makes /competitors feel like *intelligence*, not a leaderboard.

**Why this doesn't feel like Profound:** Profound's competitor view is a flat ranked list with bar charts. Beamix's is a *narrated rivalry*: the Rivalry Strip's editorial summary, the Brief-clause grounding, the Margin column with agent-fingerprints. Same data; entirely different *register*.

### 2.6 /crew (power-user surface)

The one place the 11-agent architecture is fully visible. Designed for Yossi (agency operator) but visited once by Sarah out of curiosity.

**Layout:**

A 3-column roster grid. Each agent is a card, 320px wide × 240px tall, 24px padding, 12px radius, `border`.

Card contents:
- Top: agent monogram (Rough.js, 32×32, agent's color), name (18px InterDisplay 500), role (13px Inter ink-3, e.g., "schema specialist")
- Middle: this week's activity in *agent first-person*, 14px Inter 400 — *"I added 11 FAQ entries this week. Three of them landed in Perplexity's top citations within 6 hours."* Crew Traces under specifics.
- Bottom: a 4-tab strip showing the agent's *Done · Found · Researched · Changed* counts. 11px caps. Click any tab → opens the agent's full profile page with the lens filtered.
- Hover: card border shifts to brand-blue at 24% opacity; a tiny "Tune autonomy →" link appears bottom-right (Yossi's affordance).

**Agent profile page (when clicked):**

Hero: large monogram (96×96 Rough.js), agent name in 48px InterDisplay, role in 22px Fraunces 300. Below: a 4-lens tab bar (Done / Found / Researched / Changed). The selected lens shows a chronological list of that agent's work in that mode.

**Distinctive moves:**
- The 11 monograms become the visual roster — each with its own color and Rough.js seed, each a tiny portrait
- Agent first-person voice on the cards (Devin posts in Slack like this)
- The 4-lens tab on each profile (the lenses survive Frame 5's cuts because they're how Yossi *operates*)

### 2.7 /schedules

Admin. Calm, almost severe.

A single Stripe-style table. Columns: Job · Agent · Frequency · Next run · Last run · Status. No decoration. No Rough.js. The only color is `brand-blue` on the row's status pill when active.

The discipline is the point. /schedules is where Sarah configures the operational rhythm of her crew. It needs to feel like a calendar tool — Cron, Crontab.guru, GitHub Actions schedules. Distinctive there would be a bug.

**One distinctive move:** the row has a subtle expandable. Click the chevron and you see the next 5 scheduled runs as a tiny inline timeline — Geist Mono dates, 11px caps, with the brand-blue dot for "today." This is the only craft on the page, and it's the *right* one.

### 2.8 /settings

Stripe-replica. Tabbed left rail. Each tab is a form.

**Three deviations from generic Stripe:**
1. The **Brief tab** — full edit view of the Brief with version history (each version has its seal mark, date, and change summary). This is where the Brief becomes a *living constitution* over time.
2. The **Truth File tab** — the canonical-facts editor. Field-by-field (hours, services, key claims, brand voice). Each field has a Rough.js mark in the Margin showing which agent last consulted it. This is the trust mechanism made visible.
3. The **Phone numbers tab** (lead-attribution) — issued tracked numbers with call counts. A Geist Mono table. Boring, intentional.

Otherwise: clinical. Form fields exactly Stripe-grade. No animations.

### 2.9 /scan public (locked storyboard, augmented)

Public, unauthenticated. The acquisition surface. The viral mechanic.

The locked 10-frame storyboard (strikethrough-and-rewrite) survives. **Augmentations:**

1. **The Ring appears for the user's score reveal.** When the scan completes and the score lands, the Activity Ring draws around it (1500ms full-arc draw) with the gap at top-right. *This is the user's first encounter with the brand sigil.* They will see it again on /home if they sign up. The repetition is the binding.

2. **The Margin column persists down the entire public scan page.** Every finding has a Rough.js mark in the Margin attributing it to an agent. Even before the user knows what an agent is, they're absorbing *"this scan was done by people, plural, named, accountable."*

3. **The share card.** When the user clicks "Share this scan" → an OG-image is generated. Cream paper background, the user's domain in 32px Fraunces, the Score in 96px InterDisplay, the Ring drawn around it, the Beamix seal at the bottom-right corner. *This is the image that appears on Twitter and LinkedIn shares.* It is the most beautiful Twitter card any GEO product has.

4. **The signup CTA is signed.** Below the scan results: *"Run weekly. Fix automatically. — your crew."* The italic-Fraunces signature line. The same signature that appears on the Brief. The repetition is *deliberate continuity*.

### 2.10 /onboarding (Brief approval, magic moment)

5 steps. Total time target: 4 minutes.

**Step 1 — Confirm the basics (30s).** Pre-filled from /scan public. Clean form. No decoration. This is admin.

**Step 2 — Phone numbers / form tags (30s, optional).** Skippable. Clean form. The numbers are issued live; the user sees them appear with a 200ms fade-in each.

**Step 3 — Approve your Brief (90s).** *This is the magic moment.*

The screen renders the Brief on cream paper (`paper-cream`) at 720px max-width, centered. The text appears typed character-by-character at 32 chars/sec (300ms total per line, 5 lines, ~1.5s) — but only on first render. The text is in 22px Fraunces 300 (text-serif-lg), 40px line-height. Reads:

> *"Beamix recommends focusing on emergency plumbing queries on ChatGPT and Perplexity. Your homepage doesn't have FAQ schema; we'll add it. Three competitors are cited more often than you on these queries; we'll respond. Don't change your brand voice without asking."*

Click any sentence → it becomes editable inline (chips appear for each named entity). User edits if they disagree.

Below the Brief: a single button — `Approve and start` — 56px tall, brand-blue. On click: the Rough.js Beamix seal *draws itself* over 800ms in the bottom-right corner of the Brief, and the signature line — *"— your crew"* in 22px Fraunces italic — pen-strokes itself onto the page over 600ms. The seal lands with a tiny 50ms scale-overshoot.

The user has just *signed a contract* with their crew. The pen-stroke is the cinematography of the moment.

**Step 4 — Truth File (60s).** Mandatory. A clean form. Fields: hours, services, locations, key claims, brand voice (3-word descriptor). Each field saves on blur (200ms confirmation tick).

**Step 5 — Magic moment (instant).** Page transitions to /home. The Score *counts up* from 0 to the scan score (1200ms ease-out — slightly slower than the daily count-up to feel ceremonial). The Ring draws (1500ms). The Decision Card slides up: *"Beamix is fixing 3 schema errors right now. We'll send you a Monday digest."* The first Crew Trace appears under "3 schema errors" 800ms later.

**The cinematography of onboarding:**
- Steps 1, 2, 4 are clean admin (fast, low decoration)
- Step 3 is *the moment* — cream paper, Fraunces, typed-in text, animated seal, pen-strokes the signature
- Step 5 is the reveal — the user's personal /home boots up with their score, their crew, their first action already in motion

This is the equivalent of Linear's onboarding ("press / to see what's available") moment, but more *editorial*. It's the equivalent of Figma's first-cursor-moves moment but more *narrative*. It's the moment users tell their friends about.

### 2.11 /reports / Monthly Update (the artifact)

Stripe-Press-grade. The forwarded-to-the-CEO artifact.

**Format:** 1-page HTML email + permalink + downloadable PDF. Rendered at 720px wide on web; A4 letter on PDF.

**Cream paper (`paper-cream`) background. Fraunces typography throughout.**

Layout:

```
┌────────────────────────────────────────────────────┐
│                                                    │
│  [seal mark, 24×24]                                │
│                                                    │
│  Monthly Update                                    │ <- 11px caps tracking 0.10em
│  March 2026 · Acme Plumbing                        │ <- 13px Geist Mono ink-3
│                                                    │
│  ─────                                             │
│                                                    │
│  This month: 47 calls and 12 form submissions     │ <- 32px Fraunces 300, opsz 144
│  came in through Beamix-attributed channels.       │
│  That's up from 23 calls last month.               │
│                                                    │
│  ─────                                             │
│                                                    │
│  [240px wide sparkline, 12-week, perfect-freehand] │
│  Score over the past 12 weeks                      │ <- 11px caps, ink-4
│                                                    │
│  ─────                                             │
│                                                    │
│  What we did                                       │ <- 14px caps, tracking
│                                                    │
│  We added 23 FAQ entries across your site,         │ <- 16px Inter 400, line-height 28
│  responding to the way Perplexity asks about       │
│  emergency plumbing in Tel Aviv. Eight of them     │
│  are now cited by ChatGPT.                         │
│                                                    │
│  We fixed 5 structured-data errors that were       │
│  preventing your business hours from showing up    │
│  in AI Overviews.                                  │
│                                                    │
│  We monitored Profound, Otterly, and Surfer.       │
│  Profound published 12 comparison pages this       │
│  month; we drafted 4 responses, awaiting your      │
│  approval in your Inbox.                           │
│                                                    │
│  ─────                                             │
│                                                    │
│  What's next                                       │
│                                                    │
│  We'll continue adding FAQ entries — we have       │
│  18 drafts queued. Schema Doctor will validate     │
│  the new entries against your Truth File before    │
│  publishing.                                       │
│                                                    │
│  ─────                                             │
│                                                    │
│              [larger seal mark, 32×32]             │
│                                                    │
│              — your crew                           │ <- 22px Fraunces italic 300
│                                                    │
└────────────────────────────────────────────────────┘
```

**Why this dominates:** every other GEO tool's monthly report is a PDF dump of charts. Beamix's Monthly Update is a *letter*. It is signed. It is paper. It reads like correspondence. The CEO who receives it forwards it to the board because *it's beautiful enough to forward*. That's the distribution mechanic.

**Stripe-Press grade specifics:**
- Margins: 96px on web, 1.25" on print
- Hyphenation enabled (Adobe-style word break)
- Optical kerning (`font-kerning: normal`)
- No widows or orphans (CSS `widows: 2; orphans: 2`)
- Numerals tabular throughout
- The seal at top is 24px; the seal at bottom is 32px (the closing seal is *bigger* — a typesetting tradition from broadsheet newspapers)

This is the artifact. This is what Beamix is.

---

## Section 3 — Cross-surface integrations

Beamix lives across 7 surfaces. The job: make them feel like one designer made all of them, while letting each surface speak its native register.

**The 7 surfaces:**
1. The marketing website (Framer, separate project)
2. The product app (this codebase)
3. The /scan public surface
4. The Monday Digest email
5. The Monthly Update PDF + permalink
6. The event-triggered brief email
7. The shared scan card (Twitter/LinkedIn OG image)

**What's shared across all 7:**

- The **Beamix sigil system**: Ring, Trace, Seal, Margin appear in their native form on each surface
- The **typography**: Inter / InterDisplay / Fraunces / Geist Mono. Same families, same feature settings
- The **color discipline**: brand-blue is the only chrome accent. Cream-paper is the artifact register. Semantic colors only on data.
- The **signature line**: every artifact ends *"— your crew"* in 22px Fraunces italic. This is the brand's verbal seal.
- The **Brief-clause grounding**: any place where Beamix proposes work, it references the Brief clause that authorized it. This is the *constitutional thread* across surfaces.

**Surface-specific decisions:**

| Surface | Register | Distinctive treatment |
|---|---|---|
| Marketing site (Framer) | Editorial; cream + paper alternating sections | Hero is the Ring drawn around a Score, Fraunces lead, brand-blue CTAs. The marketing site looks like the product's *introduction letter*. |
| Product app | Bright paper white; clinical with editorial accents | The Ring on /home, the Margin on tables, Crew Traces ambient |
| /scan public | Cream-paper background; full hand-drawn register | The strikethrough-rewrite mechanic + Ring + Margin + Seal |
| Monday Digest email | Bright paper body, 32px cream strip header | Header has one Rough.js sigil; body in Inter; signature line in Fraunces italic |
| Monthly Update | Cream paper throughout; full editorial | The artifact format (Section 2.11) |
| Event-triggered brief | Bright paper body, no cream | Terser; "your crew flagged something" subject; signed |
| Shared scan card (OG) | Cream paper; minimal | Domain + Score + Ring + Seal — the most beautiful share card in GEO |

**The continuity test:** if you took a screenshot of any element from any surface and put it in front of a designer, they should be able to identify it as Beamix in 1.5 seconds. The Ring is the most identifiable; the seal is second; the Fraunces signature line is third. Even a Crew Trace alone — a faint 1.5px Rough.js underline at 28% brand-blue — is identifiable.

**The connection moves:**

1. **The seal travels.** The same Rough.js seal mark appears at: the bottom of the Brief, the bottom of every Monthly Update, the bottom-right of the OG share card, the corner of every PDF Beamix authors. It's a 16-32px mark depending on context. The seal is the brand's *signature*.

2. **The signature line travels.** *"— your crew"* in Fraunces italic appears on: every digest, every Monthly Update, every event-triggered brief, the Brief itself, the marketing site footer, the /scan public CTA. Same typeface, same weight, same italic, every time. This is *brand discipline at the level of a single line of type*.

3. **The Activity Ring travels.** Drawn on /home (live, pulsing), drawn on /scan public (during reveal), drawn on the Monthly Update header (static, cycle-snapshot), drawn on the OG share card (static), drawn on the marketing site hero (CSS animation). Same geometry, same pencil-mark gap, every time.

4. **Crew Traces travel.** Inside /home, inside the Monday Digest body (under nouns the agents acted on), inside the Monthly Update's "What we did" section, inside the email digests. Same Rough.js, same 28% opacity, same 1.5px stroke.

5. **The Margin travels.** Vertical 24px strip on the left of every artifact (digests, scans, reports). Accumulates Rough.js agent-fingerprints over time. The Margin is the *shared edge* of every Beamix surface — visible on the product, the email, the PDF, the public scan.

These five travel-moves are what make Beamix *feel like a place*, not a stack of tools. Most SaaS companies have a logo that travels. Beamix has a *system* that travels. That is the difference between Stripe (system) and most other fintechs (logo).

---

## Section 4 — The motion language (full vocabulary)

12 motion tokens. Each defined: what animates, the curve, the duration, the meaning. This is the complete vocabulary.

| Token | Animates | Curve | Duration | Trigger | Meaning |
|---|---|---|---|---|---|
| `motion/score-fill` | Score number 0 → current value | `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo) | 800ms | First page load per session | "This number was *calculated*, not fetched." |
| `motion/ring-pulse` | Activity Ring gap opacity 0.4 → 1.0 → 0.4 | `cubic-bezier(0.4, 0, 0.6, 1)` (ease-in-out, sine-like) | 1200ms infinite | Continuous while system acting | "Work is in flight, *right now*." |
| `motion/ring-close` | Activity Ring gap → arc full | `cubic-bezier(0.4, 0, 0.2, 1)` | 800ms | On cycle complete (weekly scan + fixes) | "A cycle just completed. Brief moment of completion." |
| `motion/path-draw` | Sparkline `clip-path` from left | `cubic-bezier(0.4, 0, 0.2, 1)` | 1000ms | First page load per session | "This is a trend, not a snapshot." |
| `motion/trace-fade` | Crew Trace opacity 0 → 0.28 | linear | 300ms | When trace enters viewport | "Something here was just touched." |
| `motion/pill-spring` | Status pill scale 0.96 → 1.04 → 1.0 | `cubic-bezier(0.34, 1.56, 0.64, 1)` (back-out, mild overshoot) | 280ms | On status change | "State *just* changed." |
| `motion/card-entrance` | Decision Card translate-y 6 → 0, opacity 0 → 1 | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 200ms | When card appears | "This needs you." |
| `motion/seal-draw` | Rough.js seal stroke-dashoffset → 0 | `cubic-bezier(0.4, 0, 0.2, 1)` | 800ms | On Brief approval, on Monthly Update render, on share-card generation | "Beamix has just *signed* this." |
| `motion/signature-stroke` | Fraunces "— your crew" stroke-dashoffset on the dash glyph | `cubic-bezier(0.4, 0, 0.2, 1)` | 600ms (after seal completes) | Brief approval | "And here is the crew's hand." |
| `motion/microcopy-rotate` | Substep text on /workspace cross-fade | linear opacity, 200ms | 200ms cross-fade, 800ms hold | Continuous on active step | "The agent is *thinking through layers*." |
| `motion/topbar-status` | Topbar 6px status dot opacity pulse | `cubic-bezier(0.4, 0, 0.6, 1)` | 1600ms infinite (slower than ring) | Continuous when system acting | "Ambient background presence." |
| `motion/row-hover` | Table row background opacity 0 → 0.03 | linear | 100ms | Hover | "You're targeting this row." |

**Curve rationale:**
- `ease-out-expo` for the score: feels *settled* at the end. The number lands.
- `back-out` for the pill and decision card: tiny overshoot communicates *life*. Linear's secret.
- `ease-in-out sine` for the ring pulse: breath-like. This is critical — a linear pulse feels mechanical; a sine pulse feels *alive*.
- Linear curves only on opacity changes. Linear on transform feels robotic.

**Reduced-motion compositions** (each animation has a designed static state):
- score-fill → score appears at final value
- ring-pulse → ring is static at full opacity
- ring-close → arc redraws on next refresh
- path-draw → sparkline appears at full
- trace-fade → trace appears at final opacity
- pill-spring → pill appears at final state
- card-entrance → card appears in place
- seal-draw → seal appears finished
- signature-stroke → signature appears in place
- microcopy-rotate → static "Working..." text
- topbar-status → static dot
- row-hover → no transition; instant background change

**The 1.6-second budget on /home first load (orchestrated):**

```
0ms     ─ skeleton renders (static everything)
100ms   ─ score-fill begins (800ms)
100ms   ─ path-draw begins (1000ms)
600ms   ─ trace-fade begins, 50ms stagger across 4-6 traces (300ms each)
900ms   ─ score-fill ends, lands
1100ms  ─ path-draw ends; card-entrance fires if applicable (200ms)
1100ms  ─ ring-pulse begins (continuous)
1300ms  ─ card-entrance ends
1600ms  ─ all entrance motion complete; page is static except ring + topbar dot
```

This orchestration is what makes /home feel *composed*. The motion tells the user the page assembled itself thoughtfully, then settled into a working rhythm. Every other GEO product just renders. Beamix *arrives*.

---

## Section 5 — The 3 distinctive design moves no competitor will ship

### Move 1 — The Activity Ring with the Rough.js terminus

**What it is.** A 2px CSS-rendered SVG arc with a small Rough.js dash mark at the gap terminus, pulsing softly when the system is acting.

**Why competitors won't ship it.** Two reasons. First: it requires a designer who is willing to mix two rendering paradigms (SVG geometric arcs + Rough.js hand-drawn linework) in the same 200×200 element. Most design leads will resist this — it feels "messy." It is precisely the messiness that makes it human. Second: the ring is anchored to a *runtime concept* (the work cycle) that requires backend instrumentation. Profound, Otterly, and Surfer all run on a "scan once a week" model where there's no continuous "in flight" state to visualize. To build the Ring, they'd have to rearchitect their backend to expose a real-time work-cycle signal. That's a 6-month engineering investment for a visual signature they'd be the second to ship.

The Ring is the Beamix moat at the level of *visual + technical co-design*.

### Move 2 — The cream-paper artifact register, with Fraunces and the Seal

**What it is.** A complete, rigorously executed editorial register — cream paper, Fraunces typography, hand-drawn seal, signature line — applied uniformly across the Brief, the Monthly Update, the /reports PDF, the /scan public, and the OG share card.

**Why competitors won't ship it.** This requires *editorial discipline* most product companies don't have. Building this means:
- Hiring (or developing) a designer who's spent time on print/editorial, not just dashboards
- Licensing or selecting Fraunces and tuning its axes (most teams will default to a free serif)
- Building Rough.js into the artifact pipeline (most teams will use a flat icon)
- Maintaining the discipline that cream paper *only* appears on artifacts, not on UI chrome — a discipline that breaks the first time a PM asks "could we put this badge on cream so it stands out?"

The cream-paper register is the *Stripe Press* move applied to a SaaS product. Notion has approached it but uses the editorial register inconsistently. Linear refuses to do editorial at all (their craft is geometric). Beamix lives in the gap: a product that takes itself seriously as a *publication*, not a tool.

This requires a worldview a product team must adopt as a *commitment*, not a feature. That's why competitors won't copy it — they'd have to become a different kind of company.

### Move 3 — The Brief-as-living-constitution + Seal-on-Approval

**What it is.** Every approval the user makes traces back to the Brief clause that authorized it. Approving a /inbox item draws a small Rough.js seal next to the action — *the user is signing*. The Brief itself is editable, version-controlled, and visibly referenced across every surface.

**Why competitors won't ship it.** The Brief-as-constitution requires a *philosophical commitment to the user as the principal*. Profound's frame is: the user is a passive viewer of an analytics platform. Otterly's frame is: the user is configuring an SEO tool. Beamix's frame is: the user is the principal who has hired a crew and signed a constitutional document; everything the crew does derives its authority from that document.

Building this requires:
- The Brief as a structured, version-controlled object (not a free-text settings field)
- Every agent action carrying a `brief_clause_id` reference (a backend schema constraint)
- Every UI approval rendering the clause reference
- A seal-drawing animation on every approval (the cinematography of consent)

This is *governance design* applied to SaaS. It requires the company to think of itself as accountable to the user in a constitutional way — not a feature ("we have settings") but a worldview ("you author; we execute"). Most SaaS companies organize around features, not governance. This is the move that separates Beamix from every competitor at the level of *what the product means*, not what it does.

---

## Section 6 — Three questions for the other three board seats

### To the Strategist (Seat 1):

**The Frame 5 board cut the Ring and Crew Traces as "craft, not moat." I argue the opposite — the Ring and the cream-paper artifact register are precisely the moat, because they require organizational discipline competitors lack. Where do you stand on craft-as-moat, and if you accept it, what's the maximum craft investment that's defensible at MVP-1 scope without slowing the lead-attribution loop and 4 safety mechanisms?**

### To the Engineer / Operator (Seat 3):

**The motion-orchestrated /home first-load (1.6s budget across 6 simultaneous animations, with reduced-motion compositions designed first) requires real performance discipline. Are we willing to build a measurable motion-budget enforcement (Lighthouse-grade animation perf testing, 60fps guarantee on mid-tier laptops, ≤80kb of motion JS) into the CI pipeline from day one? Or do we ship the motion as best-effort and accept that some users will see janky pulses?**

### To the Customer / Voice (Seat 4):

**Sarah, the SMB owner, will not consciously notice 80% of the design moves I've specified — the `cv11` glyphs, the warm-neutral grays, the 96px breath above the score, the Fraunces axes. She'll subliminally absorb them as "this feels expensive and trustworthy" — or she won't, and the design budget was wasted. Yossi, the agency operator, *will* notice and will tell other agencies. Should we design primarily for Yossi's consciousness (with Sarah benefiting subliminally) or for Sarah's gut (with Yossi getting the architecture for free)? My instinct: design every move to land on Yossi's conscious eye and let Sarah's gut absorb the result. But this is a primary-user trade-off you should rule on.**

---

## Closing

Frame 5 was a *correct response to a wrong board*. The first board picked at density. The second board attacked structure. Both were having useful arguments at the wrong scale.

The actual question Adam asked was: *what does the maximum-craft Beamix look like?* This document is the answer. It is not the cheapest version. It is not the safest. It is the version that, three years from now, gets quoted as the moment a category formed around a single product.

The Activity Ring. The Crew Traces. The cream-paper Brief. The Fraunces signature line. The Seal that travels across every artifact. The Margin that accumulates fingerprints. The 12-token motion vocabulary with reduced-motion compositions designed first. The 10-size type scale with stylistic-set discipline. The cross-surface continuity tested at the level of a single underlined word.

These are not features. They are *commitments*. Together they make Beamix the kind of product a designer in 2029 will reverse-engineer in a Figma file labeled "how Beamix did it."

That is the version Adam asked for. That is the version that dominates.

— *the master designer*
