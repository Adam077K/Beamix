# Public Scan Permalink — Pixel-Precise Design Spec v1

**Surface:** `/scan/[scan_id]` — the unauthenticated public visitor view
**Date:** 2026-05-05
**Author:** Design Lead
**Status:** Build-ready. Source-of-truth for `apps/web/src/app/scan/[scan_id]/page.tsx` and `apps/web/src/app/scan/[scan_id]/opengraph-image.tsx`.
**Lineage:** PRD v5.1 §F1 → DESIGN-SYSTEM v1 (canonical tokens) → DESIGN-ai-visibility-cartogram-v1 (F22 §4.3 OG card; this spec extends with the public permalink) → OPTION-E-START-FLOW-SPEC (Phase 2 anonymous results state) → SCANS-COMPETITORS-design-v1 (the *inverse* authenticated counterpart) → RED-TEAM-AUDIT §8.3 (R7 — the under-spec finding this document closes) and §2.4 (the cartogram comprehension critique this document answers with progressive disclosure).
**Voice canon:** Model B. Single character externally — "Beamix" is the only name that appears anywhere on this page. No agent monograms surface here. Seal signs `— Beamix`.
**Surface partition:** Cream paper appears ONLY on Section D (the three findings) and Section F (the closer). Sections A, B, C, E render on `--color-paper` (white). This conserves the editorial register's gravity for the moments that earn it.

---

## §1 — Strategic framing

### Who this page is for

This page is for the visitor who has *never heard of Beamix*. They saw a tweet from Sarah where she posted her scan permalink — *"this is wild, my AI search visibility is 47/100, here's the actual map"* — and they clicked. They are not a Beamix customer. They are not a Beamix prospect. They are a stranger to the brand who arrived because someone they trust shared a link, and they have given Beamix exactly five seconds before they decide whether to keep reading or hit the back button.

This is the inverse use case of `/scans/[scan_id]` (the authenticated detail page, designed for the customer who already lives inside the product). The same scan data renders to both audiences. The framing is not. On the authenticated surface, the cartogram is the centerpiece because the customer already understands what query × engine means and wants the dense diagnostic. On the public surface, the cartogram is the *reward* — the visitor earns the cartogram by first being given a simple visibility number and a stacked bar that explains what 11 engines means. The progressive disclosure is the difference between "the chart is the surface" and "the chart is the artifact the surface unfurls toward."

### Why this page is the marketing flywheel

There is one acquisition channel that scales in inverse proportion to its cost: a customer's own bragging. When Sarah posts her scan to Twitter, she is not endorsing Beamix — she is showing off her data. The OG card and the permalink page are the two surfaces that turn her data flex into a Beamix impression. The viral coefficient of this page is the most leveraged number in the business. If 100 shared scans produce 3 new visitors who scan their own business, the flywheel is decorative. If 100 shared scans produce 30 visitors who scan, the flywheel is an acquisition engine. The difference is *this page*. R7 of the red-team audit named this surface as the under-specced channel with the highest leverage-to-effort ratio in the entire build plan. This document is the answer.

### The billion-dollar bar applied to a marketing surface

A marketing surface tempts toward gloss. Stripe's product pages, Linear's homepage, Anthropic's claude.ai — none of them are decorated. They are *composed*. The bar this page must clear is not "polished marketing site." It is "this looks like an artifact a serious company published, and the data inside it is genuinely interesting." Every space, every letter, every cell of the cartogram must earn its place. The cream paper register is rationed. The Fraunces italic register is rationed. The CTAs are pillar-quality, not pasted. The page reads as if Beamix wrote a one-page report about this customer and printed it for the visitor.

### The success metric

The single number this surface optimizes is: **% of visitors who click "Scan your own business" within 90 seconds of landing.** Target on launch: ≥18%. (Profound's permalink CTR is approximately 6%; Otterly's is approximately 11%; the bar is to lap them with progressive disclosure + editorial register.) Secondary metric: **share-back rate** — % of visitors who share the page they arrived at to their own audience after scanning. Target: ≥4%.

---

## §2 — The 6-section page architecture

The page is composed of 6 stacked sections. Reading time on desktop, top to bottom, no scroll-back: ~50 seconds. The total page length is approximately 4,200 px tall on desktop and 5,800 px tall on mobile. Each section is specified below at pixel-precise level for desktop (1440 px viewport), tablet (834 px), and mobile (375 px).

### Page-global frame

| Property | Value |
|---|---|
| Page max-width | 880 px content well, centered |
| Background | `--color-paper` (`#FFFFFF`) on Sections A, B, C, E. `--color-paper-cream` (`#F7F2E8`) on Sections D and F. Cream is forever-light. |
| Top padding (above Section A) | 96 px desktop, 48 px mobile |
| Bottom padding (below Section F footer rule) | 64 px desktop, 48 px mobile |
| Inter-section padding | 96 px between Sections A→B, B→C, C→D, D→E, E→F (consistent rhythm). On mobile: 64 px. |
| Sticky CTA | "Scan your own business →" pill, bottom-right of viewport on desktop after the visitor scrolls past Section A; bottom-anchored full-width on mobile. See §4. |
| Brand bar | Top-left of viewport, sticky to top, 56 px tall. Beamix Seal (24×24, `--color-ink` at 80% opacity) + 14 px Inter 500 caps wordmark `BEAMIX`, letter-spacing 0.10 em. Right side carries the primary CTA. |
| Heading hierarchy | One `<h1>` (Section A), three `<h2>` (Sections B, C, E or D depending), no skipped levels. |
| Schema | JSON-LD `Report` schema at page head: `"@type": "Report"`, `"name"`, `"author": "Beamix"`, `"datePublished"`, `"about": { "@type": "Organization", "name": "{customer_name}" }`. This is what makes the page itself indexable for "Acme Plumbing AI search visibility" type queries — the page becomes the proof for its own claim. |
| Robots | `<meta name="robots" content="index, follow">` ONLY when scan owner has explicitly published. Default is `noindex, nofollow` (per F1 acceptance — sharing requires one explicit click; the click flips the indexability flag). |
| Open Graph | See §5 — generated server-side by `apps/web/src/app/scan/[scan_id]/opengraph-image.tsx`. |

---

### Section A — Hero + headline (above the fold)

The visitor's first 5 seconds. Must answer: *what is this, who is it about, and is the number good or bad?* Answers all three without a single word of marketing copy.

**Layout (desktop):**
- Total height: 720 px (matches a 1080 p laptop viewport's ~700 px useful fold above browser chrome)
- Left column: 540 px wide, contains all type
- Right column: 280 px wide, contains the score number visualization (Ring + score)
- 60 px gap between columns

**Brand bar (sticky, top-left, 56 px tall):**
- Beamix Seal (24×24 SVG, `--color-ink` at 80% opacity) at `padding-left: 24 px`
- 12 px gap
- "BEAMIX" wordmark, 14 px Inter 500 caps, `--color-ink`, `letter-spacing: 0.10em`
- Bar bottom border: 1 px `--color-border` (rgba(10,10,10,0.06))
- Background: `--color-paper` with `backdrop-filter: blur(8px)` — when the page scrolls, the bar maintains visual hierarchy without becoming a marketing nav

**Hero left column (top to bottom, vertical center within the 720 px hero):**

1. **Eyebrow** (11 px Inter 500 caps, `--color-ink-3`, `letter-spacing: 0.10em`, 24 px below brand bar)
   - Content: `AI SEARCH VISIBILITY · APRIL 28, 2026`
   - The date is in Geist Mono 11 px tnum, inline with the eyebrow caps; visually distinct as "this is when the data was captured"
2. **H1** (24 px gap below eyebrow)
   - Font: Fraunces 300, 56 px / 64 px line-height, letter-spacing -0.01 em
   - Color: `--color-ink`
   - Italic: yes (Fraunces italic for a single editorial line; this is one of the rationed Fraunces moments)
   - Content: *"{customer_name}'s AI search visibility."*
   - Variable: `customer_name` is the resolved business name (e.g., "Acme Plumbing"). Truncated at 32 chars with no ellipsis (the resolution should already be a short business name; if longer, the layout wraps to 2 lines naturally).
3. **Sub-line** (16 px gap below H1)
   - Font: Inter 400, 18 px / 28 px line-height
   - Color: `--color-ink-3`
   - Max-width: 480 px (4 of the 9-grid columns)
   - Content: *"Scanned by Beamix across 11 AI engines on {scan_date}. {N} queries, {M} citations, {K} competitor mentions."*
   - Variables: `scan_date` (e.g., "April 28"), `N` (typically 50), `M` (range 0–550, but typically 80–250), `K` (range 0–550).
4. **One-sentence headline insight** (32 px gap below sub-line)
   - Font: Fraunces 300 italic, 22 px / 32 px line-height
   - Color: `--color-ink`
   - Max-width: 540 px
   - Content: *"{customer_name} is cited by AI engines on {percentage}% of queries about their industry."*
   - Variables: `percentage = (queries_with_any_citation / total_queries) × 100`, rounded to integer.
   - Alternative copy when percentage <10%: *"{customer_name} appears in fewer than 1 in 10 AI answers about their industry."* When percentage ≥80%: *"{customer_name} is cited by AI engines on {percentage}% of queries — they own their category."*
5. **Spacer** (auto-flex; no fixed height — pushes CTA to vertical center alignment with score)
6. **(no CTA in left column)** — the primary CTA lives in the brand bar (sticky) and at the foot of Section B. Section A's job is statement, not action.

**Hero right column (centered vertically in the 720 px hero):**

1. **The Score Ring + score number.** Per F22 §1.4 and design-system §2.1:
   - Ring outer diameter: 200 px
   - Stroke: 2 px, `--color-brand` (`#3370FF`), arc span 252°, hand-drawn Rough.js terminus dash at the gap
   - Static — no entrance animation, no pulse (the Ring is a frame, not a progress bar)
   - Score number lives inside the ring: 96 px / 96 px line-height InterDisplay 500, `font-feature-settings: 'tnum', 'cv11', 'ss03'`, `--color-ink`
   - Format: integer 0–100, no decimal, no `/100` suffix (the Ring is the suffix)
2. **Score label** (16 px below ring)
   - Font: 11 px Inter 500 caps, `letter-spacing: 0.10em`, `--color-ink-3`
   - Content: `OUT OF 100`
3. **Vertical benchmark delta** (8 px below score label)
   - Font: 13 px Inter 400, `--color-ink-2`
   - Content: *"Below average for B2B SaaS"* / *"Above average for plumbing"* / *"On par with home services"* — copy varies by `score - vertical_benchmark` delta:
     - Delta < −15: *"Well below the average for {vertical}."*
     - Delta in [−15, −5): *"Below average for {vertical}."*
     - Delta in [−5, +5]: *"On par with the average for {vertical}."*
     - Delta in (+5, +15]: *"Above average for {vertical}."*
     - Delta > +15: *"Top decile for {vertical}."*
   - This is the only place benchmarks are surfaced; do not repeat them in Sections B–D.

**Hero typography lock — accessibility:**
- H1 hierarchy: visible H1 is the customer-name editorial line. Screen-reader-only `<h1 class="sr-only">AI search visibility report for {customer_name}</h1>` precedes it for assistive tech (the editorial H1 is decorative-with-meaning; the SR H1 is structural).
- Color contrast: Fraunces 300 italic 56 px on `--color-paper` is `--color-ink` (`#0A0A0A`) which yields 19.85:1 contrast — passes AAA at any size.
- Reading order: brand bar → eyebrow → H1 → sub-line → headline insight → score → score label → benchmark.

**Hero motion:**
- Score Ring: static at full geometry on `t=0`. No draw-in. Tufte canon (cartogram surfaces no motion).
- H1 + sub-line + headline insight: each fades from `opacity: 0` to `opacity: 1` over 280 ms, with `translateY(8 px) → 0`, on a stagger of 80 ms (H1 at `t=0`, sub-line at `t=80 ms`, headline insight at `t=160 ms`). Reduced-motion: instant render.
- Score number: no count-up animation. The number is on screen at full value the moment the page paints. (Permalink is *post-scan artifact* — the journey of the count happened during the scan ceremony at `/start` Phase 1; the visitor here is reading the final result, not living the build.)

**Mobile (375 px):**
- Total height: 560 px (no second column; score sits below H1)
- Brand bar: 48 px tall, same content
- Eyebrow → H1 → sub-line → headline insight stack vertically
- H1 scales to 36 px / 44 px line-height, max-width 100% of content well minus 24 px gutters
- Sub-line and headline insight scale proportionally
- Score Ring: 160 px diameter, score number 64 px / 64 px InterDisplay 500
- Score label and benchmark line stack centered below the ring

**Tablet (834 px):**
- Total height: 640 px
- Two-column layout retained but proportions shift: left column 480 px, right column 240 px, gap 40 px
- Score Ring: 180 px diameter, score number 80 px

---

### Section B — Visibility breakdown (the cartogram on-ramp)

The cartogram comprehension fix in physical form. Before the visitor sees 550 cells, they see 11 segments — one bar that summarizes which engines cited them, which cited competitors, which mentioned no one. This is the gist that lets the cartogram (Section C) read as deep dive rather than overwhelm.

**Layout (desktop):**
- Total height: 320 px
- Section eyebrow (11 px Inter 500 caps, `letter-spacing: 0.10em`, `--color-ink-3`, top of section): `THE BREAKDOWN`
- 16 px gap
- H2: 32 px / 40 px InterDisplay 500, `--color-ink`, content: *"Across 11 engines, here's who got cited."* Max 1 line desktop, 2 lines mobile.
- 24 px gap
- The stacked bar: 880 px wide × 120 px tall (full content well width, centered)
- 16 px gap
- One-line caption below the bar
- 32 px gap
- Inline CTA repeat: "Scan your own business →" pill (see §4)

**The stacked bar (specs):**

This is *not* one continuous stacked bar. It is **11 vertical segments side-by-side**, one per engine. Each segment is itself a stacked column showing how that engine's queries broke down for this customer.

```
Width per segment: (880 - 10 × 8) / 11 = 72.7 ≈ 73 px (rounded)
Gap between segments: 8 px
Total: 11 × 73 + 10 × 8 = 883 px (rounds to 880 px content well via 1 px stroke optical adjustment)
Height per segment: 120 px
```

**Each segment composition (top to bottom):**
- Engine label (28 px tall): 11 px Inter 600 caps, centered, `--color-ink-2`, `letter-spacing: 0.06em`. Content: full engine name (`CHATGPT`, `CLAUDE`, `GEMINI`, `PERPLEXITY`, `AI OVERVIEWS`, `GROK`, `YOU.COM`, `COPILOT`, `MISTRAL`, `DEEPSEEK`, `LLAMA`). At 73 px width, full names fit at 11 px caps for the shorter names; the longer names (`PERPLEXITY`, `AI OVERVIEWS`) are abbreviated to `PERPLEX.` and `AI OVRVS` if they exceed 64 px optical width. The 2-letter abbreviations from F22 §1.3 are *not* used here — Section B is the explanation; full names build trust before the cartogram earns the abbreviation.
- 8 px gap
- The bar itself (84 px tall): a single vertical stack of three colored fills, top to bottom:
  - **Cited (this customer)** — `--color-brand` (`#3370FF`) — fill height = `cited_count / total_queries × 84 px`
  - **Competitor cited** — `--color-score-critical-soft` (`#FCE3E3`) with 1 px dotted `--color-score-critical` border (color-blind safety per F22 §6.4) — fill height = `competitor_count / total_queries × 84 px`
  - **Nobody cited** — `--color-paper-elev` (`#FAFAF7`) — fill height = remainder
  - Bar background: `--color-border` (1 px stroke around the entire 84 px column for clean edges)
  - Bar radius: 4 px on top and bottom (the column reads as a unit)

**Caption below the bar:**
- 13 px Inter 400, `--color-ink-2`, centered, max-width 720 px
- Content: *"{cited_pct}% of queries cite {customer_name}. {competitor_pct}% cite competitors. {nobody_pct}% mention nobody."*
- Variables: percentages computed from the 11-engine aggregate.
- Example: *"47% of queries cite Acme Plumbing. 23% cite competitors. 30% mention nobody."*

**Why this works (the comprehension fix in detail):**

The visitor lands. The hero gave them one number (47/100) and one editorial sentence. Section B gives them three numbers (47% / 23% / 30%) and an 11-segment shape that visually says *"there are 11 engines, and they don't all behave the same way."* They can already see — without any explanation — that some columns are mostly blue (engines where this customer wins) and some are mostly red (engines where competitors win). They learned the chart's grammar in 3 seconds. When they reach Section C (the cartogram), they already know what 11 engines means, what blue means, and what red means. The cartogram becomes a deep dive into a chart they already partially understand. The R7 critique about "550 cells without context" is answered: there is now context.

**Hover (desktop):**
- Hovering any segment surfaces a 240×100 px tooltip 8 px above the segment, centered:
  - Engine full name in 14 px Inter 500 caps, `letter-spacing: 0.06em`, `--color-ink`
  - 8 px gap
  - 13 px Inter 400, `--color-ink-2`, line-height 1.5: *"Cited {N} of {T} queries · Competitors cited in {K} · Nobody in {M}."*
  - Tooltip background: `--color-paper`, 1 px `--color-border-strong`, 8 px radius, `--shadow-md`

**Mobile (375 px):**
- Section B becomes a horizontal scroll: 11 segments at 56 px wide × 100 px tall, 6 px gaps, with a soft right-edge fade indicating more content
- Caption stacks vertically below: each percentage on its own line for legibility
- Inline CTA repeat: full-width pill below caption

**A11y:**
- Each segment is a `<div role="img" aria-label="...">` with the format: `"ChatGPT: cited Acme Plumbing in 23 of 50 queries; competitors cited in 12; nobody in 15."`
- The H2 carries the section's screen reader anchor.
- Color encodings paired with text in the caption — color is decorative, not load-bearing for screen readers.

**Motion:**
- Each segment's bar fills bottom-up over 600 ms `cubic-bezier(0.25, 0.46, 0.45, 0.94)`, with a stagger of 60 ms left-to-right across the 11 segments. The fill is a single transform animation; the colors do not crossfade.
- This is one of three motion moments on the entire page. It earns its place because it is *rhythmic information* — each segment finishing in turn lets the eye take the 11-engine reading sequentially before the gestalt resolves.
- Reduced-motion: instant render at full state.

---

### Section C — The cartogram (550 cells, full Tufte glory)

The reward. Now that the visitor understands what 11 engines means and what the four states mean, the cartogram opens up as a dense, beautifully-composed map.

**Reference:** This section renders the cartogram per **F22 §1 (pixel dimensions), §2 (color encoding), §3 (hover and click)**, with three modifications for the public surface (per F22 §8.5):

1. The drawer's "Fix this with Beamix" CTA changes to **"Sign up to fix this →"** which routes to `/start?phase=results&scan_id={scan_id}` (carries the scan ID into the signup flow per F1 free scan import). This is the conversion drawer.
2. The drawer's "Why this rank?" diagnostic line is hidden. (Internal-feeling line; on public surfaces we keep the chart as evidence, not the prescription.)
3. The cartogram footer caption changes from the F22 product copy to: *"Hover any cell to see which engine cited what — and where {customer_name} is winning or losing."*

**Layout (desktop):**
- Section eyebrow: `THE MAP` (11 px Inter 500 caps, `--color-ink-3`)
- 16 px gap
- H2: 32 px / 40 px InterDisplay 500, `--color-ink`: *"How 11 engines see {customer_name} across 50 questions."* Max 2 lines.
- 24 px gap
- Cartogram (468 × 697 px, centered in 880 px content well — 206 px of slack on each side per F22 §1.4)
- 16 px gap
- Micro-caption: 13 px Inter 400, `--color-ink-3`, centered: *"Each cell is one query asked of one engine. Hover to read the citation."*
- 24 px gap
- A 4-state mini-legend strip (this is a deviation from F22 §1.5's "no legend" rule and is justified on the public surface for the same reason F22 §1.5 grants the OG card a legend: the visitor has zero context, and the legend pre-empts confusion in the same way Section B did. The product surface keeps no-legend; the public surface, like the OG card, has one.)

**The mini-legend strip:**
- 880 px wide, 32 px tall, centered horizontally, 4 inline cells
- Layout: `[swatch] [label]   [swatch] [label]   [swatch] [label]   [swatch] [label]` with 32 px between groups
- Swatch: 12×12 px, 2 px radius
- Label: 11 px Inter 500 caps, `--color-ink-2`, `letter-spacing: 0.06em`
- Content (left to right):
  - `[blue swatch] CITED AT TOP   [grey swatch] CITED LATE   [paper swatch] NOT CITED   [red swatch] COMPETITOR CITED`

**Hover and click:** per F22 §3 with the modifications listed above. The drawer is *the conversion moment* — when a visitor clicks a red cell and sees `"Notion cited at Position 1"` plus `"Sign up to fix this →"`, the page is asking them, in plain language, to claim the result.

**Loading state:**
- The page is server-rendered. The cartogram renders at full state on first paint. No skeleton, no shimmer.
- Cartogram cells fade in over 400 ms with a stagger of 1 ms per cell (550 ms total stagger; visually reads as a smooth wash from top-left to bottom-right). Reduced-motion: instant.

**Mobile (375 px):**
- Per F22 §5 — the engine-summary digest pattern. The 11-row engine summary renders as the primary cartogram surface. A "View full grid →" link below opens a full-screen modal with horizontal-scrollable desktop-fidelity cartogram.
- One modification for public surface: the modal's close button reads "Done" instead of "Close" to match the public visitor mental model (this is a presentation, not a tool).

**Tablet (834 px):**
- Cartogram renders at full 468×697 px (no scaling). Content well shrinks to 720 px (834 – 24 × 2 – 70 px slack). Cartogram still has 126 px of slack on each side.

**A11y:** per F22 §6 — `<table role="grid">` with full ARIA semantics, keyboard navigation, screen reader summary, color-blind dotted-border on competitor-cited cells. The "Skip to summary" link is critical here because public visitors are more likely to be using assistive tech without prior context; the SR summary is the same 4-bullet text described in F22 §6.2.

---

### Section D — The 3 specific findings (the "tell")

This is the cream-paper section. The page background flips from `--color-paper` to `--color-paper-cream` for this single section, framed by 64 px of cream above and below the type. The flip is the editorial register saying *these are the words Beamix wrote about your business.*

**Layout (desktop):**
- Total height: ~720 px (depends on copy length; the section breathes)
- Background: `--color-paper-cream` (`#F7F2E8`)
- Edge transition: clean color swap at section boundary; no gradient, no fade. The cream is a hard register change.
- Top padding (above eyebrow): 96 px
- Bottom padding (below the third clause): 96 px

**Section eyebrow:**
- 11 px Inter 500 caps, `letter-spacing: 0.10em`, `--color-ink-3` (cream-paper-safe variant: same hex, slightly higher contrast vs cream than vs white — passes AA), centered
- Content: `THE THREE FINDINGS`

**H2:**
- 32 px gap below eyebrow
- 32 px / 40 px InterDisplay 500, `--color-ink`, centered, max-width 720 px
- Content: *"What Beamix found in {customer_name}'s scan."*

**The three clauses:**
- 64 px gap below H2
- Three editorial paragraphs, each ~50 words, stacked vertically with 64 px gap between them
- Each clause: 22 px / 36 px line-height Fraunces 300 italic, `--color-ink`, max-width 720 px, left-aligned (not centered — editorial register reads left-aligned, like a Stripe Press paragraph)
- Letter-spacing: -0.005 em (Fraunces at 22 px benefits from a hair of negative tracking for optical density)
- The `customer_name`, `competitor_name`, and engine names within each clause are rendered in `--color-ink` weight 400 (semibold via Fraunces 400 if loaded; else Fraunces 300 with `font-feature-settings: 'salt'` for a slightly heavier salt-stylistic alternate). This is a typographic distinction inside the running italic, not a color change.
- Each clause is preceded by a numbered marker: `01.` / `02.` / `03.` in 13 px Geist Mono, `--color-ink-3`, `letter-spacing: 0.06em`, sitting on its own line above the clause with 12 px gap.

**Clause copy templates** (Beamix-generated narrative; resolved by the recommendations engine):

```
01.
"ChatGPT cites {customer_name} confidently for {top_topic_cluster} questions —
but Perplexity prefers {dominant_competitor}, who has FAQ schema markup that
{customer_name} doesn't. Adding FAQPage schema to the {customer_url}/faq page
would close this gap."

02.
"Google AI Overviews mentions {customer_name} on only {N} of 50 queries — the
fewest of any engine in this scan. The pattern suggests {customer_name}'s site
lacks the kind of structured citation paragraph Overviews looks for. The first
fix is a one-page Trust File at {customer_url}/about that names what
{customer_name} does in plain English."

03.
"{dominant_competitor} appears in {customer_name}'s place on {K} queries across
{M} engines. Most of these are queries where {dominant_competitor} has direct
landing pages and {customer_name} does not. Three new pages — {topic_a},
{topic_b}, and {topic_c} — would likely shift the rankings within 4 weeks."
```

These are *not* templates the customer reads. These are templates the recommendations engine fills in based on the actual scan data, so each visitor sees specific, named, actionable findings about the actual business they're looking at. The credibility lives in the specificity. Generic findings ("your visibility could be improved") would invalidate the entire register.

**Why three clauses, why this length:**
- Three is the magic number — fewer feels thin, more starts to read as a content marketing list
- ~50 words per clause is the editorial paragraph (Fraunces register reads naturally at 40–60 words; below that it feels like a label, above 70 it feels like a body paragraph and loses its weight as a *finding*)
- Italic Fraunces at 22 px is the most expensive font moment on the entire page — it appears here and on the headline insight in Section A. Total italic-Fraunces-22-px word count on the page: ~170 words. The economy of the register is its weight.

**Inline CTA below the third clause:**
- 64 px gap below the third clause
- Centered
- Pill button: `[ Scan your own business → ]` 56 px tall, 320 px wide, `--color-brand`, white text 16 px Inter 500, 9999 px radius
- Below the button (16 px gap): 13 px Geist Mono `--color-ink-3` centered: `60 SECONDS · NO CREDIT CARD · 14-DAY MONEY-BACK`

**Mobile (375 px):**
- Same vertical rhythm with reduced gaps: 64 px → 48 px, 96 px → 64 px
- Clauses scale to 18 px / 28 px line-height
- Numbered markers stay at 13 px Geist Mono

**A11y:**
- Each clause is a `<p>` inside a `<section aria-labelledby="findings-h2">`
- The numbered markers are visually-only (rendered as `<span aria-hidden="true">`) — screen readers read clauses 1, 2, 3 from the implicit DOM order
- Color contrast on cream paper: `--color-ink` on `#F7F2E8` is 19.34:1 — passes AAA

**Motion:**
- Each clause fades in on scroll (IntersectionObserver, threshold 0.4) with `opacity 0 → 1` over 400 ms and `translateY(12 px) → 0`. Stagger of 120 ms between clauses. Reduced-motion: instant.

---

### Section E — Social proof + Beamix self-scan

The credibility section. Plausible-style transparency: Beamix scans itself and publishes the result. Plus a small line of customer logos (placeholder for MVP — these populate as Beamix earns logos).

**Layout (desktop):**
- Total height: 240 px
- Background: `--color-paper` (back to white from cream)
- Section eyebrow (centered): `WHO ELSE BEAMIX SCANS`
- 16 px gap
- H2 (centered): 24 px / 32 px InterDisplay 500, `--color-ink`: *"We scan ourselves, too."*
- 24 px gap
- Beamix self-scan card (centered, 720 × 96 px, 1 px `--color-border`, 12 px radius, `--color-paper`, internal padding 24 px):
  - Left: Beamix Seal 32×32, `--color-ink` at 80% opacity
  - 16 px gap
  - Middle (text column): two lines stacked
    - Top line: 14 px Inter 500, `--color-ink`: `Beamix's own AI search visibility`
    - Bottom line: 13 px Inter 400, `--color-ink-3`: `Last scan: {date} · Score: {score} / 100`
  - Right: 13 px Inter 500 `--color-brand-text`: `View our scan →` (linked to `/scan/beamixai.com`)
- 32 px gap
- Logo strip (centered, 720 × 48 px, single row of 4 logos at 96 × 32 px each, 24 px gaps, all rendered at `--color-ink-3` opacity 60% — Stripe-style trust strip):
  - Above the logo row, in 11 px Inter 500 caps `--color-ink-4` `letter-spacing: 0.10em`: `TRUSTED BY FOUNDERS BUILDING IN`
  - Logos: rotating set of 4 vertical category labels at MVP (e.g., `B2B SAAS`, `E-COMMERCE`, `LOCAL SERVICES`, `MEDIA`) rendered as 14 px Inter 500 caps `--color-ink-3` text-only labels (no logo files yet) with vertical separators between them
  - When logos exist: replace the text labels with monochrome SVGs at 96 × 32 px

**Why this section earns its place:**
The visitor needs one third-party signal that Beamix is real. Two patterns work for early-stage products with few logos: (1) self-scan transparency (Plausible's own analytics public, GitHub's status page), and (2) category-trust labels (Stripe's "Trusted by businesses in 100+ countries"). Section E uses both at minimal vertical real estate.

**Mobile (375 px):**
- Self-scan card: 100% width minus gutters, padding 16 px, internal layout becomes vertical stack (Seal + name on top row, "View →" link on bottom row)
- Logo strip: scales to 4 × 64 px wide labels, 16 px gap, single row (still fits at 343 px content width)

**A11y:**
- Self-scan card is `<a>` wrapping the entire card; entire card clickable
- Logo strip is `<ul role="list">` with `<li>` per label
- "View our scan →" link has aria-label expanded: `"View Beamix's own AI search visibility scan"`

**Motion:**
- Section E does not animate. It is a quiet pause in the page's rhythm — between the heavy editorial cream of Section D and the closer of Section F.

---

### Section F — The closer + share affordances

The last screen. The visitor has read 4,000 px of artifact. This is the closer: one more shot at the CTA, plus the share affordances that make the page reproduce itself.

**Layout (desktop):**
- Total height: 480 px
- Background: `--color-paper-cream` (`#F7F2E8`) — the second cream paper section, framing the page's two artifact moments (the findings and the closing)
- Top padding: 96 px (matches Section D)

**Closer headline:**
- Section eyebrow: `START FREE`
- 16 px gap
- H2: 40 px / 48 px InterDisplay 500, `--color-ink`, centered, max-width 720 px
- Content: *"Scan your own business. See what AI search says."*
- 16 px gap
- Sub-line: 18 px / 28 px Inter 400, `--color-ink-2`, centered, max-width 540 px
- Content: *"60 seconds. 11 engines. Free, no credit card. Beamix builds you a Brief and shows you the gaps."*

**Primary CTA pill:**
- 32 px gap below sub-line, centered
- 64 px tall, 360 px wide, `--color-brand`, white text 18 px Inter 500, 9999 px radius
- Content: `Scan my business →`
- Click: smooth-scroll to top, focus the URL input on the brand bar (which slides down a single-row form for the URL); Enter submits to `/start?phase=enter-url&domain={input}` — see §4

**Money-back reassurance:**
- 16 px gap below CTA, centered
- 13 px Geist Mono, `--color-ink-3`: `14-DAY MONEY-BACK · NO CREDIT CARD TO START`

**Share row:**
- 64 px gap below money-back line
- Centered, 720 px wide, 56 px tall
- Composition (left to right, with 16 px gaps):
  - 11 px Inter 500 caps, `letter-spacing: 0.10em`, `--color-ink-3`: `SHARE THIS SCAN`
  - Copy-link button (40×40 px, 1 px `--color-border-strong`, 8 px radius, `--color-paper`, 18 × 18 link icon `--color-ink-2`); on click, copies `https://beamixai.com/scan/{scan_id}` to clipboard with a 2 s toast: *"Link copied."*
  - X / Twitter share button (40×40 px, same treatment, X glyph): opens `https://twitter.com/intent/tweet?text={share_text}&url={page_url}` in a new tab
  - LinkedIn share button (40×40 px, same treatment, in glyph): opens `https://www.linkedin.com/sharing/share-offsite/?url={page_url}` in a new tab
- `share_text` template: `"{customer_name} just scanned their AI search visibility — {score}/100. See the full map:"`
- `page_url` is the canonical permalink: `https://beamixai.com/scan/{scan_id}`

**Brief binding line (per F31 spec):**
- 64 px gap below share row
- Single line, centered, 18 px Fraunces 300, `--color-ink-2`, italic
- Content: rotating Brief binding clause, drawn from the F31 binding-line set. Examples:
  - *"This map is part of the Brief — Beamix's working instructions for the agents."*
  - *"Every cell here is evidence. The Brief is the instruction."*
  - *"The agents read this map every cycle."*
- The chosen line is deterministic per `scan_id` (hashed) so a given permalink always shows the same line.

**Footer:**
- 48 px gap below the binding line
- 1 px `--color-border` rule across full content well width
- 24 px gap below the rule
- Footer composition (3 columns at desktop, stacked on mobile):
  - **Left column (240 px):** Beamix Seal 24×24 `--color-ink-3` + 12 px gap + `BEAMIX` 14 px Inter 500 caps `--color-ink-2`. Below: 11 px Geist Mono `--color-ink-4`: `BEAMIXAI.COM`
  - **Middle column (240 px, centered text):** Stacked links (one per line), 13 px Inter 400 `--color-ink-3`, hover `--color-brand-text`:
    - `How Beamix works →` (links to `/how-it-works` on the marketing site)
    - `Trust → /trust` (links to `/trust`)
    - `Security → /security` (links to `/security`)
  - **Right column (240 px, right-aligned):** 11 px Geist Mono `--color-ink-4`: `SCAN_ID · {scan_id}` and below: `RUN AT {scan_timestamp_iso}`. Below those: 11 px Inter 500 caps `--color-ink-4` `letter-spacing: 0.06em`: `— BEAMIX` (the signature; matches the Voice Canon Model B seal)

**Mobile (375 px):**
- All elements stack centered
- CTA pill scales to 100% width minus 24 px gutters, 56 px tall
- Share row: copy-link + X + LinkedIn buttons stack horizontally with 12 px gaps; the eyebrow label stacks above
- Footer columns stack vertically with 32 px gaps between them; right column right-aligns its content but otherwise the rhythm is identical

**A11y:**
- The closer H2 is the section's `<h2>`
- Each share button has an `aria-label`: `"Copy permalink to clipboard"`, `"Share scan on X (Twitter)"`, `"Share scan on LinkedIn"`
- The Brief binding line is decorative-with-meaning (`<p>`), not in any heading hierarchy
- Footer links are wrapped in `<nav aria-label="Page navigation">`

**Motion:**
- Section F slides into view on scroll (IntersectionObserver) with the same 400 ms / `translateY(12 px) → 0` pattern as Section D
- The CTA pill has the same hover behavior as the brand-bar CTA: `--color-brand-deep` on hover, 100 ms ease-out

---

## §3 — Progressive disclosure spec (the cartogram comprehension fix)

The R7 critique: *550 cells without context confuses anonymous visitors.* The plan answers it with three layered comprehension steps before the cartogram appears, plus a legend on the cartogram itself.

**Layer 1: Section A — the score.**
The visitor sees one number — 47 / 100. That number plus a 1-sentence editorial line is enough to understand "this is a measure, the higher the better, and this number is the headline." 5 seconds. No charts.

**Layer 2: Section B — the stacked-bar breakdown.**
The visitor sees 11 segments. Each segment is one engine. Each segment is colored proportionally — blue for "this customer cited," red for "competitor cited," paper for "nobody." 3 numbers (47% / 23% / 30%) summarize the aggregate. The visitor learns the chart's *grammar* (what 11 engines means, what blue/red means, what proportions mean) on a chart that is simple enough to read in 3 seconds.

**Layer 3: Section C — the cartogram.**
With grammar acquired, the visitor reaches 550 cells. Each cell uses the *same* color encoding as Section B (this is critical — the visual translation is one-to-one). Each cell is now one query × one engine. The visitor knows immediately which engines are friendly (blue columns from Section B → blue regions of Section C) and where they're losing (red columns from Section B → red regions of Section C). The cartogram is now a deep-dive tool, not an entry-level chart.

**Layer 4: Section D — the prescriptive narrative.**
The visitor has seen the data three ways. Now they need to know what to *do* about it. Section D is three Fraunces editorial clauses, each ~50 words, that name specific findings ("Notion has FAQ schema; you don't") and specific fixes ("Add FAQPage schema to your /faq page"). The cartogram becomes a to-do list translated into editorial English. This is what converts the cartogram from a chart into a sales argument.

**The Tufte rule:** at every layer, the visitor learns one new thing. Layer 1: there's a number. Layer 2: there are 11 engines and three states. Layer 3: there are 50 queries × 11 engines and the data has texture. Layer 4: here's what to do. Each layer compounds; none repeats. This is progressive disclosure as Tufte intended — easy → medium → dense → actionable.

**The empirical test:**
Before launch, run a 5-non-technical-SMB-owner usability test (per F22 acceptance §7.5). Show the page to each. Ask: *"In 30 seconds, can you tell me which AI engine likes this business the most, and which one likes it the least?"* Pass = ≥4 of 5 give correct answers. If pass rate <80%, Section B's grammar is failing and needs revision before launch.

---

## §4 — The "Scan your own business" CTA (the conversion moment)

This is the single most-important interactive element on the page. It appears in 5 places.

### 4.1 — Where it appears

| # | Location | Treatment | When visible |
|---|---|---|---|
| 1 | **Brand bar (top-right, sticky)** | Pill, 36 px tall, 12 px horizontal pad, brand-blue, white text 13 px Inter 500. Becomes sticky on scroll past Section A's H1. | Always (sticks on scroll) |
| 2 | **End of Section B** | Pill, 56 px tall × 280 px wide, brand-blue, white text 16 px Inter 500. Centered horizontally. | Inline, on scroll into view |
| 3 | **End of Section D** | Pill, 56 px tall × 320 px wide, brand-blue, white text 16 px Inter 500. Centered. With money-back reassurance line below. | Inline, on scroll into view |
| 4 | **Section F (closer)** | Pill, 64 px tall × 360 px wide, brand-blue, white text 18 px Inter 500. Centered. Largest treatment. | Inline, the page's final CTA |
| 5 | **Mobile bottom-anchored sticky** | Full-width minus 24 px gutters, 56 px tall, brand-blue, white text 16 px Inter 500. Pinned to viewport bottom on scroll. | Mobile only, after Section A scrolls out |

### 4.2 — Click behavior

When the visitor clicks any CTA:

1. **Smooth-scroll to top** (if not already there). 600 ms `cubic-bezier(0.25, 0.46, 0.45, 0.94)` — the page returns to the brand bar.
2. **The brand bar slides down a 56 px URL-input drawer.** The drawer renders below the bar (just below the bar's 1 px border) for 0–48 px tall states; it expands to 88 px when the input is focused, revealing the form helper text below the input.
3. **The URL input is auto-focused.** Placeholder: `yourbusiness.com`. Inline left icon: 16 px globe glyph `--color-ink-4`. Right side: a `Scan →` button (40 px tall, brand-blue, 16 px Inter 500 white). Inline right helper: 11 px Geist Mono `--color-ink-4`: `https:// added automatically`.
4. **Enter or click `Scan →` submits.** The form posts to `/start?phase=enter-url&domain={value}`. The visitor is routed to Phase 0 of the `/start` flow with their domain pre-filled (the Phase 0 spec from OPTION-E §2 already accepts this query param; no spec change needed there). Phase 0 immediately transitions to Phase 1 once the visitor confirms their domain by tapping `Continue`.
5. **Esc or click outside dismisses the drawer.** The brand bar collapses back to its 56 px state.

### 4.3 — Mobile bottom-anchored CTA behavior

On mobile, the bottom-anchored sticky CTA appears once the visitor has scrolled past Section A. Tapping it:
1. Opens a bottom sheet (rises from `translateY(100%)` to `translateY(0)` over 280 ms ease-out)
2. The sheet content is the URL-input form: 64 px Beamix Seal + wordmark header, 16 px gap, then a single 56 px tall input field, then a 56 px `Scan →` button, then the `https:// added automatically` helper, then the money-back reassurance line
3. The sheet has a 16 px top radius, `--color-paper` background, `--shadow-lg`
4. Tapping outside the sheet or swiping down dismisses it; the sticky bottom CTA returns

### 4.4 — Visual treatment

All pill CTAs share these properties:
- Background: `--color-brand` (`#3370FF`)
- Hover: `--color-brand-deep` (`#1F4FCC`), 100 ms ease-out
- Active (pressed): `--color-brand-deep` with `transform: translateY(1px)` and reduced shadow
- Focus: `--shadow-focus` (`0 0 0 3px rgba(51,112,255,0.25)`) per design system §1.4
- Text: white, Inter 500, no italic, no underline
- Radius: 9999 px (full pill per design system §1.5)
- Min-tap-target: 44 px (per design system §1.3) — all CTAs exceed
- Reduced-motion: hover transition removed; focus ring still appears

### 4.5 — Conversion analytics

Each CTA fires a distinct analytics event:
- `scan_permalink_cta_clicked` with `cta_position: 'brand_bar' | 'section_b' | 'section_d' | 'section_f' | 'mobile_sticky'`
- `scan_permalink_url_submitted` with `domain_entered: string` (when the form submits)
- `scan_permalink_share_clicked` with `share_channel: 'copy' | 'x' | 'linkedin'`
- `scan_permalink_drawer_clicked` with `cell_state: 'cited-top' | 'cited-late' | 'not-cited' | 'competitor-cited'` (when a cartogram cell is clicked, opening the conversion drawer)

These five events define the conversion funnel that this page exists to optimize.

---

## §5 — The OG share card

The OG card is the page's distribution surface. When Sarah pastes her permalink into Twitter, this is what 10,000 timeline visitors see *before* they click. It must answer "what is this" in one glance, look like an artifact a serious company published, and make the click obvious.

**Format:** 1200 × 630 px PNG. Generated server-side via `@vercel/og` JSX template. Cached at edge with cache key `cartogram:{scan_id}:og:v2` (v2 distinguishes the public-permalink card from the F22 §4.3 product OG card).

**Render path:** `apps/web/src/app/scan/[scan_id]/opengraph-image.tsx` — Next.js 16 App Router opengraph-image convention. The route exports a default function returning a JSX template; Next.js handles the rendering.

**Layout (60/40 split, mirrors F22 §4.3 with copy adjusted for the public surface):**

**Left panel: 720 × 630 px, the simplified cartogram + summary.**
- Background: `--color-paper-cream` (`#F7F2E8`) — the editorial register, OG card is artifact
- Padding: 64 px on left, top, bottom; 32 px on right (the OG card is one canvas, no inner border between panels)
- Top of panel: 24 px Fraunces 300 italic, `--color-ink`, centered: *"AI search visibility map."*
- 32 px gap
- The simplified cartogram: 10 × 10 px cells, 1 px gap, no glyphs, no labels (per F22 §2.5 — below 14 × 12 px, glyphs are dropped)
- Cartogram dimensions: 11 × 10 + 10 = 120 px wide × 50 × 10 + 49 = 549 px tall — fits within 720 × 630 panel with margin
- Cartogram is positioned vertically center-of-panel
- 24 px Fraunces 300 caption below: *"50 questions × 11 engines."*

**Right panel: 480 × 630 px, brand identity + score.**
- Background: `--color-paper-cream` (same canvas)
- Padding: 48 px all sides

**Right panel composition (top to bottom):**
1. **Beamix Seal + wordmark header** (top, 64 px tall):
   - 32 × 32 Beamix Seal, `--color-ink` at 80% opacity
   - 12 px gap
   - `BEAMIX` 24 px Inter 500 caps `--color-ink`, `letter-spacing: 0.08em`
2. **Spacer 64 px**
3. **Customer name** (Fraunces 300 italic, 36 px / 44 px line-height, `--color-ink`, max 2 lines, left-aligned):
   - Content: `{customer_name}`
4. **Customer domain** (Geist Mono 14 px tnum, `--color-ink-3`, top-margin 8 px):
   - Content: `{customer_domain}`
5. **Spacer 32 px**
6. **The Score** (centered horizontally within right panel):
   - Score number: 96 px InterDisplay 500, `font-feature-settings: 'tnum', 'cv11', 'ss03'`, `--color-ink`. Format: integer, no `/100` suffix.
   - 8 px gap
   - Score label: 11 px Inter 500 caps, `letter-spacing: 0.10em`, `--color-ink-3`: `OUT OF 100`
7. **Spacer 32 px**
8. **The 4-state mini-key** (per F22 §1.5 — the OG card carries a legend because the visitor has zero context):
   - 4 vertical rows
   - Each row: 12 × 12 swatch + 8 px gap + 11 px Inter 600 caps label, `--color-ink-2`, `letter-spacing: 0.06em`
   - Rows: `[blue] CITED AT TOP   [grey] CITED LATE   [paper] NOT CITED   [red] COMPETITOR CITED`
9. **Spacer flex** (pushes seal to bottom)
10. **Bottom block:**
    - 14 px Geist Mono caps, `letter-spacing: 0.10em`, `--color-ink-3`: `SCAN YOURS AT BEAMIXAI.COM`
    - 8 px gap
    - 11 px Geist Mono, `--color-ink-4`: `— BEAMIX`

**Color spec for OG card:**
- Cream paper hex: `#F7F2E8` (per design system Tier 0 lock)
- Score number, customer name, header text: `--color-ink` (`#0A0A0A`)
- Domain, captions, mini-key labels: `--color-ink-2` / `--color-ink-3`
- Cartogram cells: same 4 tokens as on-page (per F22 §2.1)

**Why the OG card differs from the page:**
The OG card is a single still image. It cannot use progressive disclosure — there is no "scroll to see more." The card must answer *what is this, who is it about, what's the score, and where do I go to make my own* in one glance. The brand identity, score, and "scan yours at beamixai.com" CTA are loaded into the right panel; the cartogram is the visual evidence in the left panel. The reader gets gist + brand + CTA in 2 seconds, which is what social-feed scrolling allows.

**Twitter/X card type:** `summary_large_image` (declared in `<meta name="twitter:card">` on the permalink page).
**Open Graph type:** `article` (declared as `<meta property="og:type" content="article">`).

**Cache invalidation:**
- The OG card is regenerated when the underlying scan is re-run (Inngest event `scan.completed` invalidates `cartogram:{scan_id}:og:v2`)
- 24 h CDN TTL with `Cache-Control: public, max-age=86400, stale-while-revalidate=604800`

**Test fixtures for QA:**
- Score = 0 (all-paper-elev cartogram, "out of 100" reads correctly with score `0`)
- Score = 100 (all-blue cartogram)
- Customer name = 64 chars (truncates with ellipsis at line 2)
- Customer name in Hebrew (RTL — see §7)

---

## §6 — Mobile (375 px) treatment

Mobile is the *primary* form factor for this page — the majority of social-link clicks come from a phone. The mobile layout is not a "responsive degradation" of the desktop; it is the design's default form, with desktop treated as the wider expression.

### 6.1 Section-by-section mobile spec

**Section A — Hero:**
- Total height: 560 px
- Single column (no left/right split)
- Brand bar: 48 px tall
- Eyebrow: same 11 px caps treatment, scaled down to 10 px on tight viewports (375 → 320)
- H1: 36 px / 44 px Fraunces 300 italic, max-width 100% minus 24 px gutters, naturally wraps to 2–3 lines
- Sub-line: 16 px / 24 px Inter 400, max-width 100% minus 24 px gutters
- Headline insight: 18 px / 26 px Fraunces 300 italic
- Score Ring: 160 px diameter (vs 200 px on desktop), score number 64 px / 64 px InterDisplay 500
- Score label and benchmark: stack centered below the ring

**Section B — Visibility breakdown:**
- Stacked bar becomes a horizontal-scroll strip
- Per segment: 56 px wide × 100 px tall (vs 73 × 120 desktop)
- Right-edge fade indicator: 32 px wide gradient from `transparent` → `--color-paper` to signal "more to scroll"
- Caption stacks vertically, each percentage on its own line
- Inline CTA (full-width pill at end of section)

**Section C — Cartogram:**
- Per F22 §5: the engine-summary digest pattern as primary surface
- 11 horizontal rows, each 56 px tall, 1 row per engine
- Each row: 20 × 20 px engine 2-letter abbrev pill (Inter 600 caps, `--color-ink` on `--color-paper-elev`), 8 px gap, 96 px engine name, flex-1 spacer, 220 × 16 px horizontal stacked score bar (using same 4 colors as cartogram), 12 px gap, 32 px count label `23/50` in Geist Mono 13 px tnum
- Tap any row: opens the engine-column drawer (full-screen modal per F22 §3.2)
- Below 11 rows: `View full grid →` link in 13 px Inter 500 `--color-brand-text` — tap opens horizontally-scrollable full-fidelity cartogram modal

**Section D — Three findings:**
- Cream paper section, padding 64 px top + bottom (vs 96 px desktop)
- Three clauses stack vertically with 48 px gaps (vs 64 px)
- Each clause: 18 px / 28 px Fraunces 300 italic, full-width minus 24 px gutters, left-aligned
- Numbered markers stay 13 px Geist Mono
- Inline CTA pill: full-width minus 24 px gutters, 56 px tall

**Section E — Social proof:**
- Self-scan card: 100% width minus gutters, internal layout becomes vertical stack (Seal + wordmark on top row, "View →" link on bottom row)
- Logo strip: scales to 4 × 64 px wide labels, 16 px gap, single row

**Section F — Closer:**
- Cream paper, padding 64 px top + bottom
- All elements stack centered
- CTA pill: 56 px tall, 100% width minus 24 px gutters
- Share row: copy-link + X + LinkedIn buttons stack horizontally with 12 px gaps; eyebrow label stacks above
- Footer columns stack vertically with 32 px gaps

**Sticky bottom CTA:**
- Full-width pinned to bottom of viewport on scroll past Section A
- 56 px tall + 16 px bottom safe-area-inset (for notched devices)
- Background `--color-paper` with `--shadow-md` from above, 1 px top border `--color-border`
- Pill content: brand-blue 56 px tall × full content width pill, 16 px Inter 500 white text
- Tap: opens bottom-sheet URL form (per §4.3)

### 6.2 Mobile-specific decisions

- **Section order is identical across mobile and desktop.** The progressive disclosure depends on this ordering; rearranging would break the comprehension-build.
- **Cream paper sections retain their register on mobile.** Mobile cream-paper transitions are sometimes deprecated for performance, but Beamix's quality bar requires the artifact-vs-chrome distinction to survive on mobile. The cream-paper register is the editorial signal, and on mobile it is *more* important because mobile readers are even more skim-prone.
- **Touch targets ≥56 px** for primary actions (per WCAG 2.2 §2.5.5 Target Size — the 44 px floor is exceeded for primaries; secondaries hit 44 px minimum).
- **No hover affordances on mobile.** All cartogram cell hover content moves to tap-to-open drawer. The drawer pattern is identical to desktop click behavior.

---

## §7 — Hebrew RTL treatment

All sections support `dir="rtl"` for Hebrew users. The flip is comprehensive — type, layout, micro-typography — but four elements remain LTR for canonical reasons.

### 7.1 What flips

- **Page direction:** `<html dir="rtl">` set at the document level when the user's locale is Hebrew or Arabic
- **Brand bar:** Beamix Seal + wordmark move to top-right; primary CTA moves to top-left
- **Section A hero:** the right-column score moves to the left column; the left-column type moves to the right
- **Section B stacked bar:** segments still render left-to-right (chart axes don't flip — the engine order is canonical), but the section eyebrow, H2, and caption flip to RTL
- **Section C cartogram:** query labels become left-aligned (queries are now in Hebrew RTL); engine labels stay horizontal at the top of the grid; the grid itself does not flip (the 11-engine left-to-right order is canonical, not language-bound)
- **Section D clauses:** Fraunces is replaced with **Heebo 300 italic** at 22 px / 36 px line-height (per Q2 lock — Heebo is the Hebrew counterpart for the Fraunces register); numbered markers stay LTR (Geist Mono is technical-truth canon)
- **Section E social proof:** layout mirrors; text flows RTL
- **Section F closer + share row:** layout mirrors; share buttons stack right-to-left; "Scan my business →" arrow flips to right-to-left arrow `←`

### 7.2 What stays LTR

- **The brand "Beamix" wordmark** stays Latin-script (per Voice Canon Model B — single character externally, single script externally)
- **Geist Mono caps labels** (`SCAN_ID`, `RUN AT`, `OUT OF 100`) stay LTR — technical-truth canon
- **URLs** stay LTR within their containers (URLs are always LTR even in RTL contexts; input fields use `dir="ltr"` on the field with `dir="rtl"` on the wrapper)
- **The cartogram grid** stays left-to-right at the engine axis — the 11 engines are canonical-ordered (ChatGPT first, Llama last) and that ordering is not a Hebrew/English thing

### 7.3 Hebrew-specific copy

The customer-name resolution and the editorial clauses must be machine-translated or hand-translated based on customer locale. At MVP, hand-translated templates exist for the three Section D clauses (Beamix's Hebrew translator owns these). The clauses use the same `{customer_name}`, `{competitor_name}`, `{N}`, `{M}` variable structure but with Hebrew copy.

The headline insight in Section A has a Hebrew variant: *"{customer_name} מצוטטת על ידי מנועי חיפוש של בינה מלאכותית ב-{percentage}% מהשאילתות בתעשייה שלהם."* (Italic Heebo 300 at 22 px.)

The CTAs are hand-translated:
- `Scan your own business →` → `סרוק את העסק שלך ←`
- `Sign up to fix this →` → `הירשם כדי לתקן את זה ←`
- `View our scan →` → `צפה בסריקה שלנו ←`

### 7.4 Mobile Hebrew RTL

All mobile rules from §6 apply, with the same RTL flips. The bottom-anchored CTA flips its content but maintains its bottom-of-viewport anchor.

---

## §8 — Privacy + sharing controls

The default-private rule is canonical: **scan permalinks are private by default; sharing requires one explicit click** (per F1 acceptance and Voice Canon Model B). This section spells out the public-vs-private states, how a visitor experiences a private scan, and the SEO implications.

### 8.1 The privacy states

| State | Who can view | What renders | What the OG card shows | Indexable |
|---|---|---|---|---|
| **Private (default)** | Only the scan owner (when authenticated) | Full permalink page with `<meta name="robots" content="noindex, nofollow">` and a "This scan is private. The owner has not made it public." banner above the hero IF an unauthenticated visitor reaches the URL | OG card returns a 404 image; social cards show a generic Beamix card | No |
| **Public** | Anyone with the URL | Full permalink page as specified in §2; `<meta name="robots" content="index, follow">` | Full OG card per §5 | Yes |
| **Public-but-unindexed** | Anyone with the URL | Full permalink page, but `<meta name="robots" content="noindex, follow">` (rel=follow lets backlinks count without indexing the page itself) | Full OG card per §5 | No |
| **Anonymous-public** | Anyone with the URL (no scan owner exists yet because the scan came from an unauthenticated `/start` Phase 0 entry) | Full permalink page; same as public; routing to `/start?phase=results&scan_id=...` for the "Claim this scan" CTA | Full OG card per §5 | No (not indexed until the scan is *claimed* by a signing-up customer; this avoids indexing scans that the owner doesn't know exist) |

### 8.2 What the visitor sees on a private scan

When an unauthenticated visitor lands on `/scan/{scan_id}` for a private scan:

- The page returns HTTP 404 (not 403). This is the canonical behavior per F1 acceptance and confirms with the visitor that the URL doesn't exist publicly. Search engines see 404 and de-index. The 404 page is the standard Beamix 404 with a contextual message: *"This scan exists but is private. Try scanning your own business — it's free."* + the `Scan my business →` CTA. This converts a 404 from a dead end to a continued funnel.
- (Internal logic: the 404 is conditionally returned from the route handler. If the scan owner is the requesting authenticated user, the page renders normally. If the scan is public, the page renders normally. Otherwise, 404.)

### 8.3 The privacy-control flow (post-signup)

After signup (Phase 8 of `/start` flow completes), the customer's /scans/[scan_id] detail page (the *authenticated* counterpart) carries a privacy control:

- A toggle: "Public permalink" with three states (off / public-unindexed / public-indexed)
- Default: off (private)
- Clicking on → public-unindexed: requires a 1-click confirmation modal: *"This scan will be visible to anyone with the URL. We won't list it on Google. You can switch back to private anytime."*
- Clicking on → public-indexed: requires a 2-step confirmation: *"Make this scan visible to anyone with the URL AND list it on Google search results."* This is rarely the right choice — most customers want to share to specific people, not to the open web.

### 8.4 SEO implications

- **rel=canonical:** the public permalink page declares `<link rel="canonical" href="https://beamixai.com/scan/{scan_id}">`. This prevents duplicate-content issues if the scan is shared on multiple platforms.
- **Sitemap:** indexed scans appear in `/sitemap-scans.xml` (a separate sitemap file generated nightly). Unindexed scans never appear.
- **robots.txt:** `/scan/*` paths are NOT blocked at robots.txt. The blocking is per-page via `<meta>` tags so individual scans can opt in.
- **Structured data:** every public permalink emits JSON-LD `Report` schema with `"author": "Beamix"` and `"about": Organization` for the customer. This enables rich snippets in search results.

### 8.5 The scan-archival rule

Public scans expire after 12 months unless re-run. The page renders with a banner above the hero: *"This scan is from {N} months ago. Run a fresh scan?"* + a `Run fresh scan →` CTA that routes the customer to `/scan` (the scan input page) with the domain pre-filled. This balances permalink longevity with data freshness.

---

## §9 — Implementation notes

### 9.1 File path

```
apps/web/src/app/scan/[scan_id]/
├── page.tsx                  // server-rendered; fetches scan data + privacy state
├── opengraph-image.tsx       // server-rendered OG card via @vercel/og
├── twitter-image.tsx         // identical to opengraph-image.tsx (optional symlink)
└── not-found.tsx             // private-scan 404 page (per §8.2)
```

### 9.2 Data fetching

```ts
// apps/web/src/app/scan/[scan_id]/page.tsx
export default async function PublicScanPage({
  params,
}: {
  params: Promise<{ scan_id: string }>;
}) {
  const { scan_id } = await params;
  const scan = await getPublicScan(scan_id); // returns null if private
  if (!scan) notFound(); // triggers not-found.tsx

  return <PublicScanLayout scan={scan} />;
}

export async function generateMetadata({ params }) {
  const { scan_id } = await params;
  const scan = await getPublicScan(scan_id);
  if (!scan) return { robots: { index: false, follow: false } };
  return {
    title: `${scan.customer_name}'s AI Search Visibility — ${scan.score}/100`,
    description: `${scan.customer_name} is cited by AI engines on ${scan.cited_pct}% of queries about their industry. Scanned by Beamix across 11 AI engines on ${scan.scan_date}.`,
    openGraph: {
      type: 'article',
      images: [{ url: `/scan/${scan_id}/opengraph-image`, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image' },
    robots: { index: scan.is_indexable, follow: scan.is_indexable },
    alternates: { canonical: `https://beamixai.com/scan/${scan_id}` },
  };
}
```

### 9.3 Server vs client components

- `page.tsx` is a server component. All scan data is fetched server-side and passed as props.
- The cartogram is a server-rendered component (HTML grid). The hover tooltip and click drawer are client components, hydrated only when the cartogram is interacted with — not on initial paint. This keeps the initial JS payload <50 KB gzipped.
- The Section B animated stacked bar uses CSS `@property` and `transform` animations — no JS layout calc.
- The sticky brand-bar URL drawer uses a small client island (~5 KB) for the URL submission form.

### 9.4 Performance budget

- LCP (Largest Contentful Paint): <1.8 s on 4G — the score number in Section A is the LCP target
- CLS (Cumulative Layout Shift): <0.05 — fixed dimensions on cartogram, hero, and all sections prevent shift
- TTI (Time to Interactive): <2.5 s on 4G
- Total page weight: <250 KB gzipped (HTML + CSS + JS, excluding images and fonts)
- Fonts: Inter (subset 400, 500, 600), InterDisplay (500 only), Fraunces (300 only with variable axes), Geist Mono (400 only). Total font weight: ~120 KB woff2.
- Cartogram: 550 cells render in ~12–16 ms paint (per F22 §7.3 measurements).
- The OG card is generated server-side and cached 24 h; it does not affect page load.

### 9.5 Caching

- The page itself: `Cache-Control: public, max-age=300, s-maxage=86400, stale-while-revalidate=604800`. CDN caches for 24 h; revalidates in background.
- On scan re-run (Inngest event), the page cache is purged via a tag-based invalidation: `revalidateTag(`scan:${scan_id}`)`.
- Private scans bypass the CDN cache entirely (server-side check on every request).

### 9.6 The 6 surfaces this spec composes

This page is one of six surfaces that render the same scan data. The data shape is shared (per F22 §7.2 `CartogramData` type plus permalink-specific fields like `customer_name`, `vertical`, `is_public`, `is_indexable`, `score`, `cited_pct`, `competitor_pct`, `nobody_pct`, `findings: [string, string, string]`). The renderers diverge:

| Surface | Path | Use case |
|---|---|---|
| `/scan/[scan_id]` (public permalink) | `apps/web/src/app/scan/[scan_id]/page.tsx` | THIS SPEC — visitor view |
| OG share card (1200×630) | `apps/web/src/app/scan/[scan_id]/opengraph-image.tsx` | Social share preview |
| `/scans/[scan_id]` (authenticated detail) | `apps/web/src/app/(app)/scans/[scan_id]/page.tsx` | Customer's own scan view |
| `/start?phase=results&scan_id=...` | `apps/web/src/app/start/page.tsx` (Phase 2) | Anonymous post-scan results in `/start` flow |
| Monthly Update PDF Page 2 | `apps/web/src/lib/pdf/monthly-update.tsx` | Monthly artifact |
| `/scan/beamixai.com` (Beamix self-scan) | Same path as public permalink | Beamix's own permanent permalink |

This spec governs surfaces 1, 2, and 6. Surfaces 3 and 4 have their own specs. Surface 5 is governed by F22 §4.2.

---

## §10 — Test cases + edge cases

### 10.1 Scan exists but is private (visitor is not the owner)

- Server returns HTTP 404
- `not-found.tsx` renders with copy: *"This scan exists but is private. Try scanning your own business — it's free."* + `Scan my business →` CTA
- OG image returns the generic Beamix 404 OG card (a static asset, not the scan-specific card)

### 10.2 Scan is from 6+ months ago

- Page renders normally with all 6 sections
- A banner appears above Section A (between the brand bar and the hero):
  - 96 px tall, full content well width, `--color-needs-you` at 8% alpha (`#FEF3E0`) background, 1 px solid `--color-needs-you` (`#D97706`) border, 8 px radius
  - 14 px Inter 500, `--color-ink`: *"This scan is from {N} months ago."*
  - 13 px Inter 400, `--color-ink-2`: *"AI engines change fast. The data below may not reflect today's results."*
  - 13 px Inter 500 `--color-brand-text` link: *"Run a fresh scan →"* (routes to `/scan` with the customer's domain pre-filled)

### 10.3 Visitor is already authenticated as a Beamix customer

- Server detects the auth session
- A "Welcome back" banner appears above Section A (instead of the 6-month banner if both apply, the auth banner takes precedence):
  - 56 px tall, full content well width, `--color-brand-soft` background, 8 px radius
  - Left: 14 px Inter 500, `--color-ink`: *"Welcome back, {customer_first_name}."*
  - Right: 13 px Inter 500 `--color-brand-text` link: *"Go to your home →"* (routes to `/home`)
- The page still renders normally because the customer might be returning to share the link with someone

### 10.4 Visitor is a search engine crawler (Googlebot, Bingbot, GPTBot, etc.)

- Server detects the User-Agent
- All hover and click affordances are still rendered (crawlers don't fire JS, but the cartogram cells include their `aria-label` text which crawlers parse)
- The cartogram is rendered server-side as a `<table>` with full ARIA semantics; crawlers index the structured data
- The `<script type="application/ld+json">` Report schema is parsed
- No bot-specific copy or layout changes — what crawlers see is what visitors see

### 10.5 Visitor is on iOS Safari with reduced-motion enabled

- All entrance animations are removed (instant render)
- Score Ring renders at full geometry on `t=0`
- Section B stacked bars render at full state on `t=0` (no fill animation)
- Cartogram cells render at full state on `t=0` (no stagger)
- Section D clauses appear in viewport without `translateY` animation

### 10.6 Visitor is on a small Android (320 px viewport)

- All sections still render at 320 px content width minus 24 px gutters = 272 px
- Type scales down further: H1 to 32 px, headline insight to 16 px
- Cartogram engine-summary digest: per row 56 px tall × 272 px wide
- Sticky bottom CTA: 100% width minus 16 px gutters (tighter on 320 px)
- The page still meets WCAG 2.2 AA at 320 px

### 10.7 Visitor's connection drops mid-scan-load

- The page is server-rendered — full HTML arrives in one round trip
- Cartogram cells, hero, and Section B all render from server HTML; no client fetch needed
- Hover tooltips and click drawer are client-only; if JS fails, they degrade to no-op (the cell still renders, but hover/click does nothing). The `aria-label` is still present so screen readers can read the cell content.
- The CTA forms degrade to a regular `<form action="/start" method="GET">` — even with no JS, the visitor can still submit a domain and proceed to `/start`

### 10.8 Customer name contains special characters

- Apostrophes, accents, em-dashes: pass through as Unicode (Inter, InterDisplay, Fraunces, and Geist Mono all support full Latin Extended-A)
- HTML entities: server-side escaped before render
- Hebrew or Arabic characters: see §7
- Emoji: stripped from the customer name (per Voice Canon: emoji do not appear on artifact surfaces)

### 10.9 Cartogram has 0 cells in any of the 4 states

- Section B's caption adapts: *"100% of queries cite {customer_name}. 0% cite competitors. 0% mention nobody."* (only renders the populated states with appropriate copy)
- Section C's empty-state banner (per F22 §8.4) appears if the customer has 0 cited cells

### 10.10 The `customer_name` is unknown (scan was anonymous, no sign-up)

- Section A H1 falls back to: *"Your AI search visibility."* (drops the possessive)
- Headline insight: *"This domain is cited by AI engines on {percentage}% of queries about its industry."*
- OG card customer name: rendered as `{customer_domain}` (e.g., `acme-plumbing.com`) instead of the resolved business name

---

## §11 — A/B test plan (post-MVP+30)

After 50 customers and at least 200 shared permalinks, run a series of A/B tests to optimize the page's conversion funnel. Three high-leverage tests:

### 11.1 Variant A vs B vs C — the cartogram comprehension experiment

| Variant | Section order | Hypothesis |
|---|---|---|
| **A (control)** | Hero → Stacked bar → Cartogram → Findings | The progressive disclosure baseline — what this spec ships |
| **B** | Hero → Cartogram → Stacked bar (as legend) → Findings | The cartogram-first hypothesis — visitors might not need the on-ramp if the cartogram is the artifact |
| **C** | Hero → Stacked bar → Findings → "View full grid" cartogram (collapsed by default) | The cartogram-as-tease hypothesis — the dense view is gated behind a click, increasing curiosity-driven engagement |

Run for 4 weeks, 50 visitors per arm minimum. Primary metric: % of visitors who click "Scan your own business" within 90 seconds. Secondary: scroll depth, drawer open rate.

### 11.2 Variant — "Sign up to fix this" vs "See what Beamix would do"

The cartogram cell drawer's CTA copy. Test:
- Variant A: `Sign up to fix this →`
- Variant B: `See what Beamix would do →`

Variant B reduces commitment language; the hypothesis is that "see what Beamix would do" reads as less of a commit (it implies a peek, not a contract).

### 11.3 Variant — Section D order

Test whether the three findings should be ordered (a) most-impactful-first, (b) most-actionable-first, or (c) in the order the cartogram presents them visually. Hypothesis: most-actionable-first wins because actionability drives conversion more than impact.

---

## §12 — What this spec does NOT cover

- The authenticated `/scans/[scan_id]` detail page (covered in `2026-04-27-SCANS-COMPETITORS-design-v1.md`)
- The `/scan` input form (covered in PRD v5.1 §F1 + OPTION-E §2 Phase 0)
- The Phase 2 anonymous results state in the `/start` flow (covered in OPTION-E §2 Phase 2)
- The Monthly Update PDF Page 2 (covered in F22 §4.2)
- The Beamix Brain MOC navigation
- Accessibility deeper than per-section ARIA (the design-system §6 wcag-audit-patterns skill covers this in depth)
- Marketing site pages on Framer (separate project)
- Email digest design (covered in `2026-04-27-EDITORIAL-surfaces-design-v1.md`)

---

## §13 — Build sequencing (suggested)

A build-lead reading this spec to plan implementation should sequence:

1. **Day 1 — page scaffold + data layer.** Create the route file, the `getPublicScan(scan_id)` data function, the `not-found.tsx`, and the metadata generation. Stub the layout with placeholder sections.
2. **Day 1 — Hero + brand bar.** Section A complete with Score Ring (reuse existing `<ActivityRing>` component from /home), H1, sub-line, headline insight, brand bar with sticky behavior.
3. **Day 2 — Section B stacked bar.** New component `<EngineBreakdownBar>` taking the 11-engine aggregate data. Hover tooltip via existing `<Tooltip>` component. Animation via CSS `@property` or framer-motion.
4. **Day 2 — Section C cartogram.** Reuse the existing `<Cartogram>` component from `/scans/[scan_id]` with the public-surface modifications (drawer copy swap, hidden "Why this rank?" line, public footer caption). Wire the mini-legend as a sub-component.
5. **Day 3 — Section D findings.** Three editorial clauses. Cream-paper section. New component `<FindingClause>` taking a numbered template + variables. Server-side variable resolution from scan data.
6. **Day 3 — Section E social proof.** Self-scan card + logo strip. Static at MVP; logos populate later.
7. **Day 3 — Section F closer + share row.** CTA pill + share buttons. Brief binding line via `<BriefBindingLine>` component (reuses F31 component). Footer.
8. **Day 4 — OG image route.** `opengraph-image.tsx` with `@vercel/og` JSX template. Test fixtures for score = 0, score = 100, long customer name, Hebrew customer name.
9. **Day 4 — Mobile responsive pass.** Test 320 px, 375 px, 414 px, 834 px, 1024 px, 1440 px viewports. Sticky bottom CTA. Engine-summary digest pattern for cartogram.
10. **Day 5 — A11y pass.** Keyboard nav, screen reader, color-blind simulation, reduced-motion. Run axe and Lighthouse.
11. **Day 5 — Privacy controls + edge cases.** Private 404, 6-month-old banner, authenticated visitor banner, archival rule, JSON-LD schema, robots meta.
12. **Day 5 — Performance pass.** Lighthouse audit. Optimize bundle. Verify <250 KB gzipped, <1.8 s LCP on 4G simulated.

Total: ~5 person-days at the build-lead's typical pace, parallel with the cartogram component work that already exists for `/scans/[scan_id]`.

---

## Appendix — Open items requiring lock before build

1. **Cream paper hex Tier 0 lock** — the OG card and Sections D/F all depend on the final cream value. Default `#F7F2E8` ships if Tier 0 lock not resolved.
2. **Heebo italic at 22 px** — confirm the Hebrew Fraunces analog renders correctly with optical-size axis equivalents. Test with 5 Hebrew sample passages before MVP.
3. **The 3 Section D clause templates** — recommendations engine output format. Confirm the `{customer_name}`, `{competitor_name}`, `{topic}` variables resolve consistently across the 3 clauses without repetition. Templates need a content review by the copywriting skill before shipping.
4. **A/B test plan launch criteria** — when does the experiment harness launch? Default: 50 paying customers + 200 shared permalinks. Confirm with growth-lead.
5. **Engine name expansion for Section B** — `PERPLEXITY` truncates to `PERPLEX.` at 73 px column; alternative: change column width to 80 px and reduce the gap to 6 px to fit `PERPLEXITY` full. Decide based on the legibility test described in F22 §7.5.
6. **The Beamix self-scan permalink (`/scan/beamixai.com`)** — its initial population at MVP. Per PRD v5.1 §F49, the Beamix domain runs as an internal account scanned weekly; the permalink exists at MVP unindexed. Coordinate with build-lead on the migration to indexed at MVP+30.
7. **The Brief binding line set for permalink** — the rotating set per `scan_id` hash. Source the 5–7 binding lines from F31 spec; pick the deterministic rotation algorithm.

---

*End of spec. Ship.*
