# Imagen × Beamix — Pencil Build Spec (turnkey)
*CEO prep, 2026-06-10. Build target: Pencil (.pen). Replaces the Miro draft. Build when Pencil MCP reconnects.*

## Format
A **board of thoughts** — a single horizontal narrative canvas you walk Yarden through, NOT a slide deck. Nodes connected by a thin "spine" line, left → right, with generous whitespace and room for real charts/images. He should feel he's following a line of reasoning, not flipping slides.

## Audience & goal
Yarden, **CMO of Imagen** (imagen-ai.com — AI photo editing/culling for pro wedding/portrait photographers; rival **Aftershoot**). Goal: **advance the relationship + impress a senior, AI-native buyer** so the money conversation opens. Not a hard close.

## Quality bar
Stripe / Linear / Apple / Anthropic. Every space intentional. "Would this ship on stripe.com?"

---

## GLOBAL VISUAL SYSTEM

**Law: Beamix brand bar is authoritative.** Borrow craft techniques from `high-end-visual-design` (double-bezel nested cards, macro-whitespace py-24+, eyebrow pills, nested-icon CTAs, custom cubic-bezier easing) but DO NOT use its font bans — Beamix fonts below are locked.

**Palette**
- Background `#FFFFFF` · Surface alt `#F7F7F7` · Warm surface `#F7F6F2`
- Primary text `#0A0A0A` · Muted `#6B7280` · Card border `#E5E7EB`
- **Accent (you) blue `#3370FF`** — CTAs, your-data, active. One per node.
- **Agent violet `#6E56F0`** — agent/AI surfaces ONLY. Never a button/link.
- Sanctioned gradient `#3370FF → #6E56F0` (hero / score-reveal / AI surface only)
- Washes (bg fills only): sky `#EAF0FB`, lavender `#ECE7FB` (agent zones), mint `#E6F5EE` (positive)
- Score colors (data-viz only): Excellent `#06B6D4` 75–100 · Good `#10B981` 50–74 · Fair `#F59E0B` 25–49 · Critical `#EF4444` 0–24

**Type** (locked)
- Headings: **InterDisplay-Medium**, tight tracking. Hero 56–72px / H1 ~40 / H2 ~28 / H3 ~20
- Body: **Inter** 16–20. UI label/caption Inter 500 ~13. Eyebrow Inter 600 uppercase 12px, letter-spacing 0.2em
- **Fraunces** italic-serif: editorial accents only (title display, dark panels, the score verdict). Never in UI chrome.
- **Geist Mono**: scan data, numbers, the scorecard cells.

**Card architecture (the signature look):** double-bezel — outer shell (warm/wash fill, hairline `#E5E7EB`, ~p-2, radius ~28px) wrapping an inner core (own fill, soft inset highlight, concentric smaller radius). No generic 1px grey boxes, no harsh shadows. Soft diffused ambient shadow only.

**Spine:** a 2px `#E5E7EB` connecting line threads the nodes left→right; arrowheads in `#3370FF` at transitions. The line IS the "thinking" thread.

**Eyebrow per node:** small pill, uppercase, muted — orients without shouting.

---

## NODES (final corrected copy + layout + visuals)

### TITLE (anchor, top-left)
- Display (InterDisplay + one Fraunces italic word): **"Winning the AI answer."**
- Sub (Inter, muted): "Imagen × Beamix — GEO / AEO / SEO working session."
- VISUAL: Imagen wordmark + Beamix mark, small, monochrome. [IMG-1]

### S0 — THE SHIFT
- Eyebrow: START HERE
- H2: **"Three ways buyers find you — and which one is taking over."**
- Three nodes (double-bezel):
  - **SEO — Rank on the page.** Classic Google, ten blue links. *Measured: rank, traffic, clicks.*
  - **AEO — Be the answer.** Featured snippets, People-Also-Ask, AI Overviews. *Measured: answer-box capture.*
  - **GEO — Get cited in the AI's answer.** ChatGPT, Gemini, Perplexity, Claude. *Measured: mention rate, share of voice.*
- Band (gradient or dark): **"The shift is happening now: rank on the page → appear in the answer → get cited in the AI response."**
- VISUAL [IMG-2]: attention-migration chart — classic-search clicks trending down (grey) vs AI-answer usage trending up (blue). Area/line. Directional, label "illustrative — direction, not exact."

### P0 — THE TWO ASKS
- Eyebrow: WHY WE'RE HERE
- H2: **"Two things to solve today."**
- Hebrew line + translation (muted, smaller): the original quote, then "(You asked to focus on measuring AEO/GEO/SEO and on a tool to grow your creators.)"
- Card A (blue, "you"): **MEASURE** — "Where does Imagen show up across AI answers — and how do we track it against Aftershoot?"
- Card B (blue, "you"): **GROW CREATORS** — "Get photographer-creators making more Imagen content — and see which creators actually drive trials and paid signups." *(reframed: creators→signups, not just mentions)*
- VISUAL [IMG-3]: flywheel — 5-node loop: more creator content → more reviews & mentions → more AI visibility → more trials & signups → proof → (back to top). Caption: **"Two asks, one flywheel."** Blue nodes; the "AI visibility" node violet.

### P1 — HOW AI ENGINES WORK
- Eyebrow: THE MACHINERY
- H2: **"Different engines, different plumbing — four levers move them all."**
- Four engine cards (CONSISTENT neutral `#F7F7F7` cards, monochrome logo, ONE thin accent rule — not four hot fills):
  - **ChatGPT** — GPT-5.5 (Instant) + Bing live search. Leans Wikipedia + Reddit. *(FIXED: was GPT-5)*
  - **Gemini + AI Overviews** — Gemini 3.x + Google index + Knowledge Graph. Passage-level; E-E-A-T gate.
  - **Perplexity** — RAG; Bing + own crawler. Reddit-heavy (~24–47% of sources). Reads llms.txt.
  - **Claude** — Opus + native web_search (Brave a common MCP option). Cites conservatively; honors robots.txt. *(FIXED: dropped false "Anthropic confirmed llms.txt"; softened Brave)*
- Dark panel (the takeaway hero): **THE FOUR UNIVERSAL LEVERS** — 1 Be an entity (Wikipedia / Wikidata / Knowledge Graph) · 2 Win Reddit + community · 3 Earn third-party authority (review sites, listicles, press) · 4 Write for AI retrieval (self-contained answers, schema, credibility signals).
- VISUAL [IMG-4]: citation-source-mix donut — Reddit ~40% / Wikipedia ~26% / YouTube ~24% (label "~ directional, 2026"). Logos [IMG-5].

### P2 — IMAGEN SCORECARD (THE PUNCH)
- Eyebrow: WHERE IMAGEN STANDS — LIVE  *(removed presenter note "in front of Yarden")*
- H2: **"Imagen in AI answers, right now."**
- Two hero metrics (Geist Mono numerals, score-color):
  - **AI Visibility** — big ring gauge, [ __ ] placeholder for Adam's manual-test + scan result. [IMG-6]
  - **Share of Voice vs Aftershoot** — [ __% ]. [IMG-7]
- Benchmark bar (aria's fix — make the number mean something): Imagen vs **Aftershoot vs Narrative vs Evoto** — "the AI shelf." [IMG-8]
- Scorecard table (Geist Mono): Engine | Imagen shown? | Beats Aftershoot? | How they describe Imagen. Rows: ChatGPT 5.5 / Gemini 3.x / Perplexity / Claude / Google AI Overview / Beamix full scan. Colored Yes/Partial/No chips.
- Caption (audience-facing): "Run live during the call." *(was a presenter cue — reworded)*

### P3 — MEASURE → DIAGNOSE → FIX
- Eyebrow: WHAT BEAMIX DOES
- H2: **"Everyone else gives you a dashboard. Beamix does the work."**
- Three steps, spine-connected:
  - **1 Measure** (blue) — scan every engine on real buyer queries; SOV vs Aftershoot, sentiment, citations.
  - **2 Diagnose** (blue) — why you're not cited: no Wikipedia entity, thin Reddit, missing review-site presence, weak passages.
  - **3 Fix** (violet — agent surface) — *(concrete, answers "hand-wavy" critique)* agents draft the comparison content, deploy schema, seed review-site + community presence, then **re-scan to verify lift. Every artifact human-reviewed before publish.**
- Banner: **"Everyone else stops at the dashboard. Beamix runs the fixes — and proves the lift."**
- VISUAL [IMG-9]: agent-run mini-timeline + a before/after visibility-delta bar (violet→blue).

### P4 — DASHBOARDS vs DOERS (+ PRICING)
- Eyebrow: WHY NOT JUST A DASHBOARD
- H2: **"Why a dashboard alone won't move your numbers."**
- LEFT (dashboards, neutral): Profound **$399–custom (enterprise-only)** · Peec €85–425 · Otterly $29–989 · Athena $245+ · Knowatoa $59–199 · Semrush/Ahrefs add-ons $99–199. Tag: *"Measurement only — you still do the work."* *(FIXED Profound; no $99 tier)*
- RIGHT (doers, blue): **Daydream** — does the work, but **$15k/mo + sales call**, agency. **Beamix** — done-for-you, accessible.
- PRICING strip (agency tiers, the decided pricing): **$499 · $999 · $1,499 · $2,499 /mo** done-for-you ladders · **60-day money-back**. Positioned: between cheap dashboards and $15k agencies — "the work, without the $15k."
- Banner (cmo rewrite): **"Imagine a mechanic who runs the full diagnostic, prints what's broken — then refuses to touch the engine. That's the category. Beamix touches the engine."**
- VISUAL [IMG-10]: 2×2 positioning map. X = *just measures → does the work*. Y = *enterprise-only → accessible*. Cheap dashboards cluster bottom-left; Daydream top-right (does-work but inaccessible); **Beamix alone in the does-work + accessible quadrant.**

### P5 — HOW WE MEASURE SUCCESS
- Eyebrow: PROVING IT WORKED
- H2: **"Old SEO measured clicks. AI answers are zero-click — the metrics have to change too."**
- Ladder (4 ascending rungs, blue gradient light→dark):
  1 **Presence** — do you appear at all?
  2 **Share of voice** — you vs Aftershoot in answers.
  3 **Sentiment / recommendation** — how the AI describes you.
  4 **AI-influenced trials & signups** — the business outcome.
- Attribution note (aria's fix — make it falsifiable): *"How we attribute: post-signup 'how did you hear about us' + AI-referral patterns + assisted-conversion lift. Honest leading→lagging chain, not black-box."*
- Open question (audience-facing, not a presenter cue): **"The question that anchors everything — what are you measuring today?"**
- VISUAL [IMG-11]: ascending 4-step ladder/step chart; small zero-click stat callout.

### P6 — YOUR SECOND ASK (CREATORS)
- Eyebrow: YOUR SECOND ASK
- H2 (reframed to the outcome he asked for): **"Tie creators to signups — and measure what actually moves."**
- LEFT (recommend, don't build): grow activity with **impact.com · PartnerStack · GRIN · Upfluence**. *Photo norm: 15–50% commission via impact.com (e.g. ImagineArt). Creators live on YouTube + Instagram.*
- RIGHT (the wedge): "These track clicks & referral revenue. **None tie creator content to your AI-search visibility — the new top of funnel.** Beamix closes that loop: which creators moved your mentions *and* your signups." *(AI-visibility = leading indicator, signups = outcome)*
- Banner: **"Whatever activation tool you pick — Beamix shows which creators actually moved your visibility, and your signups."**
- LAYOUT: different from P4 (per design-critic) — a left→right attribution **flow strip**, not a 50/50 split.
- VISUAL [IMG-12]: creator → content → AI mention → trial/signup attribution flow, with a measured "lift" callout.

---

## IMAGE / GRAPH SHOT-LIST (consolidated)

| ID | Node | Type | Content | Style |
|----|------|------|---------|-------|
| IMG-1 | Title | Logo lockup | Imagen × Beamix marks | Monochrome, small |
| IMG-2 | S0 | Line/area chart | Classic clicks ↓ vs AI answers ↑ | Blue (AI) vs grey; "directional" |
| IMG-3 | P0 | Flywheel diagram | 5-node loop creators→…→signups | Blue nodes, violet "AI visibility" node |
| IMG-4 | P1 | Donut | Citation source mix Reddit/Wiki/YouTube ~% | Pastel data-viz, "~ directional" |
| IMG-5 | P1 | Logos | ChatGPT/Gemini/Perplexity/Claude | Monochrome marks |
| IMG-6 | P2 | Ring gauge | AI Visibility score (placeholder) | Score-color ring, Geist Mono numeral |
| IMG-7 | P2 | Bar | Share of voice vs Aftershoot | Blue vs grey |
| IMG-8 | P2 | Grouped bars | Imagen/Aftershoot/Narrative/Evoto "AI shelf" | Blue = Imagen, grey rivals |
| IMG-9 | P3 | Timeline + delta | Agent run steps + before/after lift | Violet→blue delta |
| IMG-10 | P4 | 2×2 scatter | Positioning map; Beamix in open quadrant | Beamix dot blue, large |
| IMG-11 | P5 | Step chart | 4-rung ascending ladder | Blue gradient |
| IMG-12 | P6 | Flow | Creator→content→mention→signup + lift | Blue flow, violet AI node |

All charts: pastel/desaturated multi-band, grid `#EAEAEA`, accent blue for "you," violet only for AI/agent. Numbers in Geist Mono. Placeholder data clearly marked where Adam fills real results.

---

## PENCIL EXECUTION NOTES (when MCP reconnects)
1. `get_editor_state(include_schema:true)` + `get_guidelines` first.
2. `get_variables` — map Beamix tokens above to Pencil variables (set if missing via `set_variables`).
3. Build the spine + title, then nodes left→right (S0→P6). Double-bezel component once, reuse.
4. Use real frames/auto-layout for the cards; image placeholders (named per shot-list) where charts go.
5. `get_screenshot` after each cluster to self-verify against this spec; loop with design-critic.

## Carryover
- Miro draft (board uXjVG-VqbO4, x≥3000) left intact as the content source — not deleted. Pencil supersedes it as the deliverable.
- Manual AI test sheet (20 runs) unchanged — feeds IMG-6/7/8 + the scorecard table.
