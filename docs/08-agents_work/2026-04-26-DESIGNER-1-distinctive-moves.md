# Designer 1 — Distinctive Moves Per Page (Beamix)
Date: 2026-04-26
Author: Senior Product Designer 1 — distinctive-moves advocate
Counter: Senior Product Designer 2 — restraint advocate
Status: PROPOSAL — for two-designer board review

Quality bar (Adam, locked, 2026-04-25): "Real billion-dollar company designed this. Something they never seen before. Super super super expensive look." Source: `~/.claude/projects/-Users-adamks-VibeCoding-Beamix/memory/project_quality_bar_billion_dollar.md`.

This document is the per-page argument for the **distinctive Beamix-only move** that earns the bar. Every page below has at least one move no Otterly / Profound / Peec / Shadcn-template dashboard ships. /home's distinctive moves (hand-drawn metric illustrations, hero score hierarchy, Fraunces editorial diagnosis line, the score count-up + sparkline path-draw signature) are NOT replicated here — those are /home's signature alone, and replicating them on other pages would dilute /home's status as the brand-promise surface.

Skills loaded: `kpi-dashboard-design`, `frontend-design`, `ui-ux-designer`.

References cross-cited throughout:
- `2026-04-25-HOME-DESIGN-SPEC.md` (the page-by-page spec template I'm extending in voice and structure)
- `2026-04-25-HOME-PREMIUM-REFS.md` (the 5 anchors and 4 anti-references)
- `2026-04-25-REFERENCES-MASTERLIST.md` (the 12 design rules, 7 anchor products, 5 signature motions)
- `2026-04-25-ANIMATION-STRATEGY-LOCKED.md` (the cross-page motion vocabulary)
- `2026-04-25-PAGE-LIST-LOCKED.md` (the page list and per-page Sarah/Yossi frequency)

---

## SUMMARY TABLE — 10 PAGES, ONE-LINE DISTINCTIVE MOVES

| # | Page | Headline distinctive move (1 line) |
|---|------|-----------------------------------|
| 1 | `/inbox` | The **Reasoning Receipt** — every selected Inbox item types in a hand-typed first-person rationale card from the agent that did the work. |
| 2 | `/workspace` | **Courier flow IS the page** — no chrome around it; the hand-drawn agent journey occupies the entire content area, not boxed in a card. |
| 3 | `/scans` | **Scan-as-receipt-tape** — historical scans render as a continuous vertical paper-tape ribbon with serrated tear-perforations and ledger-monospace serial numbers. |
| 4 | `/competitors` | **The Rivalry Strip** — competitor parity rendered as horizontal racing-stripe rows, you-vs-them as twin sparklines with a shaded gap, not a matrix. |
| 5 | `/crew` | **Card backs** — every agent card flips on click to reveal a hand-written field-notes back: their philosophy, their tells, their quirks. |
| 6 | `/schedules` | **The Sentence Builder** — schedules are configured as one English sentence with each token a tap-to-edit chip, not a cron-style form. |
| 7 | `/settings` | **The Letter** — Profile tab opens as a typed letter on warm cream paper with form fields inline in the prose, not stacked rows. |
| 8 | `/scan` (public) | **Self-correcting handwriting** — the auto-detected company name is written in handwritten ink, and corrections are visible strikethrough-and-rewrite. |
| 9 | `/onboarding` | **The Wrap-Around horizon** — the 4 steps are a single horizontal horizon line that the page travels along, not a 4-dot stepper. |
| 10 | `/reports` | **Cover Page Press** — every generated PDF gets a Stripe-Press-tier custom cover, and the export button is "**Press**" with a flip-to-artifact animation. |

---

# 1. /inbox

## What makes THIS page distinctive (the headline move)
**The Reasoning Receipt.** When Yossi (or Sarah) selects an Inbox item in the right preview pane, the body of the preview is NOT a JSON-ish "before/after" diff like Otterly, NOT a markdown-rendered card like Linear, and NOT a fancy collapsible nested tree like a code review tool. It is a **hand-typed rationale card** — a small off-white index-card surface (cream texture #F5F3EE, ~1px Rough.js outline at roughness 0.6, ~16px padding, Excalifont 13px body) — that explains *in one paragraph, in plain English, in the agent's first-person voice*, exactly why the agent did what it did:

> "I noticed the FAQ schema on your homepage was missing two questions about pricing. ChatGPT was being asked them and surfacing your competitor instead. I added them; here's what I added; here's why I phrased them this way."

Below the card sits the technical diff (collapsed by default, click-to-expand) for Yossi-mode deep inspection. The Reasoning Receipt is what no competitor ships — they ship JSON or markdown. **Beamix ships paper.**

## Signature animation
The Reasoning Receipt **types itself in** when the item is selected — Excalifont, ~30 chars/sec, total ~1.5s for an 80-word card. The cursor that does the typing is a real text caret blinking at 530ms cycle (system spec, not a CSS hack). Not on every selection — only the **first** selection per session, then static. (Frequency-aware Rauno rule from MASTERLIST §12 + ANIMATION-STRATEGY §Returning users.) Subsequent selections render the card instantly with a 100ms fade. This single 1.5s animation is the page's whole motion budget; everything else (J/K nav, multi-select with Cmd, approve toast, reject toast, request-changes toast) is sub-150ms responses with no decoration.

## Hand-drawn surface
**Yes — restricted to the Reasoning Receipt body and its outline only.** The 3-pane chrome (filters left, list center, ActionBar right) stays crisp, geometric, Linear-Triage. The agent rationale is the ONE warm surface in an otherwise clinical layout. This is the Anthropic discipline (REFS-01 §1, MASTERLIST rule 1) — Claude.ai uses hand-drawn for the *content artifacts* (the thinking, the sketched preview), never the Console chrome. /inbox follows that exactly. The triage pane chrome could pass for a Linear page; the Receipt makes it Beamix.

## Layout move that's NON-default
**Linear-Triage with an asymmetric right pane.** Linear's default 3-pane is filters (~240px) / list (~520px) / preview (~360px). Beamix's preview pane is **40% of viewport width on desktop**, not Linear's typical 360px. The Reasoning Receipt needs to breathe. Center list compresses to ~440px. This is asymmetric in Linear's terms; intentional in Beamix's. A 40% preview pane is what makes the agent's reasoning the protagonist of the page rather than a sidebar.

The other non-default: **the score chip in top-right is a tilted 3-degree paper sticker** that's pinned to the top of the right pane, NOT a chrome breadcrumb. Per PAGE-LIST-LOCKED §/inbox structure, "Score chip in top-right is passive reference (NOT chrome, NOT a banner)." I'm interpreting "passive reference" as a literal sticker — small, ~64×24px, slightly off-axis (3 degrees clockwise rotation), with a subtle shadow projection. Once-per-page personality.

## Component or interaction with personality
**The "Approve & save the why" keystroke combo.** Standard `A` approves an item and dismisses the receipt with a 200ms collapse + strikethrough fade (the locked optimistic-UI pattern from ANIMATION-STRATEGY-LOCKED §Cross-page motion vocabulary 6). **`Shift+A`** approves AND keeps the Reasoning Receipt as a "saved learning" pinned to a tiny sidecar at the right edge of the page, persistently. Over weeks Yossi accumulates a stack of receipts — visualizable as a small "Why I do this" page (linked from /crew/[agent-id]/why-i-do-this — same component, cross-page coherent). No competitor has anything like this. The Receipts file is the user's gradually-accumulating mental model of why the agent does what it does, owned by the user, exportable as PDF, sharable with their accountant or their consultant.

## Microcopy register
**Editorial first-person, agent voice.** Receipts are written in the agent's first-person voice. Not "FAQ Agent identified missing schema." → "I noticed your homepage was missing FAQ schema. ChatGPT keeps getting asked pricing questions; without the schema, it answered with your competitor's pricing twice this week."

3 examples (3 different agents — voices distinct, see /crew §5):
- FAQ Agent (meticulous): "I rewrote the H1 on your services page. The old one buried 'AI consulting' under 'we help businesses'; AI engines were missing it."
- Citation Fixer (dogged): "I added 4 FAQ entries. They're phrased the way Perplexity asks the question, not the way you'd write them on the website. That's intentional — Perplexity reads more literally than Google."
- Schema Doctor (dry-clinical): "I skipped the schema on your blog index. It's a list page, not a Q&A page; schema there would dilute the homepage's signal."

Hebrew register: same first-person voice in Hebrew, **never** male-imperative ("עשיתי", "הוספתי" — first-person past, gender-neutral by being the agent's voice). Per REFS-05 rule 5: gender-neutral defaults via infinitives or plural-you. Hebrew Receipts use Heebo body type, not Excalifont (no Hebrew glyphs), but the *register* and *card metaphor* persist.

## Where I would push back on Designer 2
Designer 2 will say: "First-person rationale cards are a luxury. Yossi wants throughput. Make the preview pane a clinical diff, ship it, move on. The 1.5s typing animation will feel slow on the 47th item."

My pre-rebuttal: **the Reasoning Receipt is the trust-building moment of the entire product**. Yossi's billing concern with Beamix isn't "is the work done?" — it's "do I trust this agent enough to let it write to a client's site?". A diff doesn't answer that. A first-person rationale does. Without it, Beamix is Otterly-with-a-blue-accent. The 1.5s typing animation is **first-selection-per-session only**, not on every item — the 47th item renders instantly. I've already absorbed Designer 2's frequency concern in the spec. The trust register is what justifies the $189/mo Build tier above Otterly's $29/mo. The Receipt pays for itself in conversion-from-trial-to-paid by week 2.

---

# 2. /workspace

## What makes THIS page distinctive (the headline move)
**Courier flow IS the page, not a card on the page.** Otterly / Profound / Linear-AIG-pattern would render an agent run as a panel: header, status pill, step list inside a bounded card, output box below. Beamix's /workspace **dissolves the card surface entirely**. The hand-drawn courier line (per MASTERLIST §The 5 Beamix Signature Motions / Motion 2 — Agent Step List) starts at the top of the content area, runs down the full vertical axis, and the steps are stations on the line. There is no surrounding card. The page IS the journey. The active step's circle pulses with a 1400ms breathing rhythm (CSS keyframes modulating `stroke-opacity` 0.5 ↔ 1, "breathing rhythm of thinking, not spinning"). The line below it draws progressively (animated `stroke-dashoffset`) as the step advances. Output text materializes to the right of each completed station, not in a separate output panel.

This is the hand-drawn-courier-flow already approved in REFS-02. The distinctive move I'm advocating BEYOND that approval: **dissolve the card.** No bounded panel. The courier line lives on the canvas itself. This is what makes /workspace **not a card-with-a-flow-inside**.

## Signature animation
**The line-drawing-as-progress.** The vertical courier line is the progress bar. Where it has been drawn = where the agent has been. Where it hasn't = where it's going. The line below the active step uses `stroke-dashoffset` animation timed to the actual step duration (variable — could be 400ms for "Reading homepage" or 6s for "Querying Perplexity"). Real-time progress, not a fake progress bar. This is the page's whole motion identity. (The Cross-page motion vocabulary item 3 from ANIMATION-STRATEGY-LOCKED — Path-Draw — but here it's the entire page surface, not a small sparkline embedded in a card.)

The other recurring motion: **micro-text rotation under the active step label**, every ~1.5s, 3-4 plain-language messages. From MASTERLIST Motion 2: "Asking…" → "Waiting for ChatGPT…" → "Reading the answer…" → "Got it." This is the same Claude "ruminating / lollygagging / sketching" pattern. Status copy IS the animation; the visual element doesn't need to do all the work alone.

## Hand-drawn surface
**Yes — the entire courier flow is hand-drawn.** Step circles are Rough.js (roughness 1.2, fixed seed per agent-run, 32px diameter, stroke-width 1.5px). The connecting line is perfect-freehand (thinning 0.5, 3-7% stroke jitter, color #6B7280 muted for past, #3370FF for active, #2558E5 at 60% for future-faded). Checkmarks are sketched with Excalidraw-style endpoints (small variation on rotation per checkmark, fixed seed). The engine logo frames are real ChatGPT/Perplexity/Claude logos inside hand-drawn circles — the contrast IS the brand (MASTERLIST rule 5).

Output text stays Inter regular — the *output* is product data, not personality. The *journey* is personality. This is the discipline rule that keeps /workspace from feeling like a cartoon.

## Layout move that's NON-default
**Vertical, asymmetric, single-column.** No 3-pane Linear layout. No card grid. Just the courier line down the middle-left of the page (~30% from left edge in LTR, mirrored in RTL via CSS logical properties), with output text streaming to the right of each completed station. Total content width caps at ~720px. This page reads like a **field journal**, not a dashboard. The "I'm watching the agent work" feeling is exactly what no competitor offers — they show you a spinner and a final result.

The other non-default: **scrollable vertical journey, not fixed-height with internal scroll.** As steps complete, the page grows. You scroll the page itself. The active step auto-scrolls into view as it activates (`scrollIntoView({ behavior: 'smooth', block: 'center' })`). This means you're physically traveling down the journey as you watch it. Brutally direct.

The third non-default: **no top-bar status pill.** Standard agent runners (Linear AIG, Devin, Manus) put a state pill at the top of the panel: "Thinking" / "Waiting for input" / "Executing" / "Finished." Beamix's state lives at the courier line itself — the active step's circle IS the state pill. The topbar asterisk (per ANIMATION-STRATEGY-LOCKED §Cross-page motion vocabulary 7) handles persistent global state. /workspace doesn't repeat it locally.

## Component or interaction with personality
**The completion seal.** When the entire run finishes, a hand-drawn **stamp** sketches itself at the bottom of the courier line — 3 brief Rough.js strokes forming a circular monogram with the agent name and timestamp, like a postal stamp on a letter. ~600ms to draw with stagger. It's the closing punctuation of the journey. After 8 seconds the courier flow auto-collapses to a "Did 6 steps in 47s" summary card (per MASTERLIST Motion 2), but the stamp stays — it becomes the summary card's left-side icon. Visual continuity between the live and the archived. The completed run lives in /scans as a tape segment (cross-page coherence — see /scans §3); its left-side icon is the same stamp.

## Microcopy register
**Gerund verbs + present continuous + warm-clinical.** Per MASTERLIST rule 3, REFS-02 Anchor 1.

3 examples per active-step micro-text rotation:
- "Reading your homepage…" → "Found the FAQ section…" → "Comparing it to what ChatGPT expects…" → "Ready to draft the rewrite."
- "Asking Perplexity 4 sample questions…" → "Waiting for the third answer…" → "Got all 4 — analyzing what you ranked for." → "Done."
- "Drafting the rewrite…" → "Checking it against your tone-of-voice…" → "Polishing." → "Ready for your review."

Hebrew: same gerund-continuous structure transcreated ("קורא את דף הבית שלך…", "שואל את Perplexity 4 שאלות…", "ממתין לתשובה השלישית…").

## Where I would push back on Designer 2
Designer 2 will say: "Dissolving the card surface is a usability risk. Users expect bounded UI. Put the flow in a panel like Linear AIG. The auto-scroll is a vertigo risk on long runs."

Pre-rebuttal: Linear AIG is the **agent-as-collaborator-in-an-issue-tracker** pattern. /workspace is the **agent-doing-work-on-your-business** pattern. Different gravity. The courier flow needs to feel like watching a delivery being made — that requires the page to BE the journey, not contain it. The Linear pattern is right for Linear. For Beamix, where the agent's work is the entire product value, the page must dissolve into the work. This is the moment Beamix earns its premium price.

On vertigo: the auto-scroll is `behavior: 'smooth', block: 'center'` and only fires on step *transition*, not continuously. In a typical 47s agent run with 6 steps, that's 5 auto-scrolls — once per ~8s. Not vertigo-level. We respect `prefers-reduced-motion: reduce` by snapping scroll to instant.

---

# 3. /scans

## What makes THIS page distinctive (the headline move)
**Scan-as-receipt-tape.** The default tab "All Scans" doesn't render as a Stripe-table or a card grid (which is what Otterly, Profound, Peec all do). It renders as a **continuous vertical paper-tape ribbon** down the center of the page (max-width 560px), with each scan a torn-perforation segment. Each segment shows: timestamp in ledger-ink Geist Mono, score in tabular Inter (large, set against the tape's natural cream tone), per-engine pills inline, a single-line diagnosis below. The whole tape can be exported as PDF for Yossi's clients — and the **export IS the page's visual treatment, not a separate report layout.** **The page's UI is the deliverable.** This is the cross-coherence with /reports — the receipt-tape format is the *language of artifacts* in Beamix.

No competitor ships this; they all show grids.

## Signature animation
**Tape unfurling on first paint.** First load only (sessionStorage flag, identical pattern to /home), the tape rolls down from the top of the viewport — `clip-path: inset(0 0 100% 0)` animates to `inset(0 0 0% 0)` over 800ms ease-out, simulating tape feeding from a printer. The score numerals on each segment **type in** with Geist Mono tabular at ~25 chars/sec, sequenced top-to-bottom with 80ms stagger. Total perceived duration ~1.4s for 8 scans visible above fold. Subsequent visits in the same session: instant render. (ANIMATION-STRATEGY-LOCKED-compliant — /scans is "NO" for full skeleton-draw, but this is **content-level** motion at the data level, not chrome-level skeleton-draw — same exception that lets sparklines path-draw on /home.)

The other recurring motion: **inline expand on tape-segment click**, animated height 0 → auto over 200ms ease-out. Anthropic Console drill pattern (REFS-MASTERLIST Anchor 5).

## Hand-drawn surface
**Yes, but minimally.** The horizontal tear-perforation between tape segments is a Rough.js zigzag stroke (roughness 0.8, fixed seed per scan, ~1px ink color #6B7280). That's it. The text on the tape stays crisp Geist Mono for timestamps and tabular Inter for scores. The personality is the **format**, not the strokes. Hand-drawn would over-claim warmth on a data history page; the tear-perforation alone signals "this is a paper artifact."

The "Completed Items" tab (which absorbs /archive — see PAGE-LIST-LOCKED §/scans structure) has one extra hand-drawn touch: completed items get a small **inkstamp "DONE"** in faded blue (#2558E5 at 50% opacity), tilted 8 degrees, Rough.js block letters. Like a wet stamp on receipts. ~24×16px, top-right of each completed-item segment.

## Layout move that's NON-default
**Center-aligned narrow ribbon, not full-width table.** Most of the viewport is empty cream canvas (#F5F3EE). The ribbon is the focal element. This violates the "fill the screen with data" reflex of every analytics dashboard. The wager: it makes the data feel **valuable**, not abundant. Mercury's Transactions page is wider but still uses center-anchored cashflow charts above its table — Beamix takes that further.

The other non-default: **the per-scan deep dive opens INLINE on tape-segment click**, expanding that segment vertically (height 0 → auto, 200ms ease-out) to show the full per-engine breakdown. Other segments dim to 30% opacity but stay visible — you don't lose context. This is Anthropic Console's drill-day-to-hour pattern, applied to a paper-tape metaphor. Click again to collapse.

The third non-default: **the tabs at the top are the only horizontal elements on the page.** "All Scans" / "Completed Items" / "Per-Engine" tabs sit ~24px below the topbar, in 12px caps weight 500 letter-spacing 0.04em (the same cap-label treatment from /home Section labels — typographic coherence with /home). Below the tabs: pure tape ribbon. Aggressive reduction.

## Component or interaction with personality
**The serial number.** Each scan tape segment carries a small monospace serial number in the top-left of the segment, format `SCN-2026-04-26-0017` (zero-padded, ledger-style). Click the serial number → URL deep-links to that scan; right-click → "Copy permalink." Serial numbers feel *bookkeeperly*, not *databasey*. They imply "we keep records the way an accountant does." Trust signal masquerading as a UI ornament. Yossi can reference scans by serial number in client conversations: "I saw a regression on SCN-2026-04-26-0017 — let me pull it up."

## Microcopy register
**Ledger-clinical.** Timestamps in he-IL or en-US format depending on locale. Diagnoses are one-sentence, declarative, no exclamation. "Down 3, FAQ schema regression on homepage." NOT "Uh oh — your score dropped!"

3 examples:
- "Scan complete. 73 → 78. ChatGPT now cites you on 4 queries (was 2)."
- "No change in score. Perplexity dropped 1 query; Gemini gained 1. Net zero."
- "Manual re-scan. Triggered by Citation Fixer at 14:32. Score unchanged — fixes need 24-72h to propagate."

Hebrew (transcreated, ledger-clinical preserved): "הסריקה הסתיימה. 73 ← 78. ChatGPT מצטט אותך כעת ב-4 שאילתות (מ-2)."

## Where I would push back on Designer 2
Designer 2 will say: "Receipt-tape is gimmicky. Scans are tabular data; ship a Stripe table; users will scan it faster. Center-narrow ribbon wastes screen real estate."

Pre-rebuttal: tables are a *commodity treatment*. Otterly has a table. Profound has a table. Peec has a table. The receipt-tape is what makes /scans feel like a *Yossi-grade artifact* — something he can show his clients as proof of work. The export-as-PDF use case literally relies on the tape being the visual format. If /scans renders as a generic table, /reports has nothing distinctive to inherit either. Both pages need this format. It's not a gimmick; it's the **deliverable shape of the product**.

On wasted real estate: the empty cream canvas IS the design move. It's the Stripe-Press / luxury-magazine register applied to data history. Filling the page would make Beamix feel like every other tool. The whitespace is what reads as "expensive."

---

# 4. /competitors

## What makes THIS page distinctive (the headline move)
**The Rivalry Strip.** Competitor intelligence pages are notoriously matrix-shaped — Otterly does a comparison table, Profound does a multi-row chart, Peec does a bar chart per engine, Generic-Shadcn-template does a 4-column grid of percentage cards. Beamix abandons the matrix entirely. Each competitor gets a **horizontal racing-stripe row**, full-width, ~96px tall: on the left, your domain's score over the last 12 weeks as a single sparkline; on the right, the competitor's score over the same 12 weeks as a parallel sparkline; the gap between the two sparklines is **shaded** in semantic green (you ahead) or semantic red (them ahead). The rivalry is the negative space between two lines. No table. No matrix. No bar chart.

This is not just a different chart type — it's a different *visual rhetoric*. Tables answer "what is the current state?" Strips answer "what is the trajectory?" The trajectory is the story.

## Signature animation
**Path-draw race.** On first load (and on engine-tab change), both sparklines (yours and theirs) draw simultaneously from left-to-right, 1200ms ease-out — like two horses leaving the gate. The shaded gap fills in **as the lines diverge**, frame-by-frame, so the eye watches the rivalry develop. Stagger: yours starts at 0ms, theirs at 80ms (subtle "you went first" cue). Subsequent visits in the same session: instant draw. RTL flips direction (right-to-left race, ANIMATION-STRATEGY-LOCKED §Follow-up answers A5 — flip path-draw direction globally).

The other recurring motion: **engine-tab switch causes all 5 strips to reproject simultaneously**. Old data lines fade-out (200ms), then new data lines path-draw (1000ms). Mercury's chart-responds-to-filter pattern (REFS-MASTERLIST Anchor 3, move 2), but applied to 5 charts at once. The visual effect: the page reorients itself to a new dimension.

## Hand-drawn surface
**No.** This is a clinical, data-dense intelligence page. Hand-drawn would soften an interaction that needs to feel ruthless. The Rivalry Strip is the personality move — geometric, sharp, but **shaped by an opinion** (the shaded gap). Anthropic Console discipline (REFS-01 §1, MASTERLIST rule 1): data tables and bar charts stay crisp, hand-drawn lives on artifact / thinking surfaces. /competitors gets none.

This is the honest concession: /competitors uses a different visual register than the rest of the product. Crisp lines, semantic colors, no Excalifont, no Rough.js. The continuity comes from the **chip mechanic** (verdict pills click into Reasoning Receipts — see Component below) and from the cross-page color system, not from hand-drawn texture.

## Layout move that's NON-default
**Stacked horizontal strips, not a matrix.** Each competitor takes a full-width row. With 5 competitors (default; Build tier shows 5, Scale shows up to 20), the page has 5 horizontal strips. You scroll vertically through the rivalries. Each strip has its own y-axis context — your scale of 0-100 anchors at the row's baseline, their scale anchors above. The visual rhetoric: **each competitor is a self-contained battle**, not a cell in a comparison spreadsheet.

The other non-default: **engines are not the columns.** Engines are tabs above the entire strip stack. Click "ChatGPT" → all 5 strips reproject to ChatGPT-only data, sparklines redraw. This is Mercury's chart-responds-to-filter pattern (REFS-04 Anchor 3). The dimension switch is at the page level, not the row level. Yossi compares like-for-like at speed.

The third non-default: **competitor names are set in InterDisplay-Medium 18px**, not 12-13px label-treatment. The competitors are characters (like agents in /crew), not row labels. Each competitor name has a tiny favicon to its left, 14×14px, NOT in a tinted circle (anti N1).

## Component or interaction with personality
**The verdict pill.** At the right edge of each strip, a small pill chip declares the verdict: "**You lead by 12 ↑**" or "**Behind by 4 ↓**" or "**Tied**". Pill background is semantic color at 8% opacity, text at full saturation, 12px caps weight 500. Click the pill → opens a Reasoning Receipt (the same component from /inbox — cross-page coherence) explaining *why* the gap is what it is, in agent first-person voice. The Receipt slides in from the right edge as a 360px-wide panel, NOT as a popover. ("They have FAQ schema; you don't. ChatGPT extracts their answers and ignores yours on those queries.")

This is a major cross-page move: the **Reasoning Receipt** lives on /inbox primarily, but it's the same component on /competitors verdict explanations, /workspace step output, /home Section 7 (when an activity-feed row is clicked). Single component, multiple pages, single mental model. **Beamix's "explanations" are a unified surface.**

## Microcopy register
**Sportscaster-clinical hybrid.** The verdict pills use bold short statements; the explanatory Receipt below uses agent first-person.

3 examples:
- Verdict: "You lead by 12 ↑" → Receipt: "You're ahead because ChatGPT cites your services page directly on 6 of 8 queries; their site requires more clicks. The structured data on your homepage is doing the work."
- Verdict: "Behind by 4 ↓" → Receipt: "They publish weekly Q&A blog posts. Perplexity prefers fresh content for time-sensitive queries; that's the gap. I'd recommend running the Content Optimizer with a weekly cadence."
- Verdict: "Tied" → Receipt: "Both of you appear in roughly half of relevant queries on this engine. Differentiation here is content quality, not visibility. Focus on the queries where they outrank you, not the ones where you're equal."

Hebrew: verdicts transcreate to `+12 לטובתך ↑` / `-4 לרעתך ↓` / `שוויון`.

## Where I would push back on Designer 2
Designer 2 will say: "Side-by-side sparklines are hard to read precisely. Use a comparison bar chart — it's a solved pattern. Stacked-strip layout with one row per competitor doesn't scale to Yossi's 20-competitor view."

Pre-rebuttal: a bar chart shows you the *current state*. The Rivalry Strip shows you the *trajectory*. For an agency like Yossi's, the trajectory IS the story he tells the client — "We've been gaining on this competitor for 8 weeks." That story doesn't exist in a bar chart. It exists in two parallel lines and a shaded gap that's growing or shrinking. The strip is a *narrative* visualization; the matrix is a *snapshot* visualization. Beamix is a narrative product (we tell you what changed and why), so /competitors must visualize like a narrative.

On scaling to 20 competitors: at Scale tier we add a "filter to top 5 / 10 / 20" chip. Most days Yossi looks at his top 5. The 20-competitor view is a once-a-quarter audit, not a daily flow. The Rivalry Strip handles 5; the 20-row variant gets a denser strip variant (~64px tall instead of 96px) — same mechanic, tighter.

---

# 5. /crew

## What makes THIS page distinctive (the headline move)
**Card backs.** /crew shows the 11 agents as a 3-column grid of cards (responsive: 4-col at >1440, 3-col at 1024-1440, 2-col at 768-1024, 1-col at <768). Each card front shows: agent monogram (custom hand-drawn icon, NOT Lucide), agent name in InterDisplay-Medium 18px, one-line role description in Inter 14px muted, "credits used this month" tabular number, "last run" timestamp. **Click the card** → it flips on a Y-axis 3D rotation (~600ms cubic-bezier(0.4, 0, 0.2, 1), `transform: rotateY(180deg)`, `backface-visibility: hidden`) and reveals the **back**: a hand-written field-notes surface in Excalifont, ~14px, on cream texture, that describes the agent's *philosophy and quirks* in first-person voice. ("I'm picky about FAQ phrasing. I'd rather skip a question than write it badly. Here's how I think about it…") The back also has a tiny "Adjust how I work →" link to the agent's settings.

**Trading-card / baseball-card mechanic** in a B2B SaaS dashboard. No competitor ships this; they all ship icon grids.

## Signature animation
**First-visit skeleton-draw, locked.** Per ANIMATION-STRATEGY-LOCKED, /crew is one of TWO pages (along with /reports) that gets the first-visit-only skeleton draw — outline of the 11 agent monograms sketches in (Rough.js path-draw, 1200ms total, 80ms stagger between cards, ~120ms each card's outline), then content fades into each card (200ms staggered fade). localStorage flag `beamix.crew.firstVisitShown=true` prevents repeat. After first visit: instant render.

The **card flip** is the recurring per-page motion. Y-axis rotation, 600ms cubic-bezier(0.4, 0, 0.2, 1), with shadow projection rising during the transition (max shadow at 90deg rotation, returning to flat at 180deg). Multiple cards can be flipped simultaneously — Yossi might compare two agents back-to-back. The flip preserves card position; only the front-back face changes.

The third motion: **monogram path-draw on hover** (subtle). When the user hovers a card, the agent monogram redraws its strokes (Rough.js path-draw, 400ms ease-out). Per-card seed is fixed, so the redraw lands on the same shape. This is the page's "the agents are alive" tell. Frequency-aware: only fires once per card per session.

## Hand-drawn surface
**Yes — restricted to two surfaces:**
1. **Agent monograms (front of card).** 11 custom-illustrated marks, Rough.js + perfect-freehand, ~48×48px, fixed per-agent seed. Each agent gets a distinct shape — a quill for Content Optimizer, a magnifier for Citation Fixer, a wrench for Schema Doctor, a pencil-with-bracket for FAQ Agent, a small antenna for Competitor Intelligence, etc. NOT Lucide icons. NOT colored circles. Custom marks. This is the page's identity.
2. **Card back (field-notes surface).** Excalifont body text on cream paper (#F5F3EE), with occasional hand-drawn underlines (rough-notation library) on key phrases. The "field notebook" register.

The card front (other than the monogram) stays crisp — name, role, stats are Inter and InterDisplay. Hand-drawn lives at the *art* and the *voice*, not the data. This is the discipline rule that keeps /crew from feeling like a children's book.

## Layout move that's NON-default
**Card grid with deliberate negative space.** Most agent grids cram the cards (Stripe Connect's Apps gallery, Vercel's Projects, Notion's Templates). Beamix uses 3 columns at 1280px, with 32px horizontal gap and 40px vertical gap. With 11 agents, the bottom row has 2 cards — and that asymmetry is preserved (no centering, no padding). The hole at the bottom-right is intentional. It's where the **"Suggest a new agent" empty card** lives — a single hand-drawn dashed-outline placeholder card with a quiet "+" inside. It's an invitation, not a feature. (The dashed outline is a Rough.js stroke at roughness 1.5, color #6B7280 muted.)

The other non-default: **no search bar at the top.** With only 11 cards, search is unnecessary; visual scanning is faster. The page trusts the user to look. Yossi visits weekly; he learns the grid. Sarah visits 1-2x/month; she's not searching, she's exploring.

## Component or interaction with personality
**The "Adjust how I work" letter.** Inside each agent's per-agent settings page (linked from the card back's bottom right), the configuration surface is **a typed letter to that agent**, not a settings form. Form fields appear inline in the prose:

> "**Run me** every [Monday] at [9am] unless I'm scheduled for [vacation]. **Skip me** if my recommendation would touch [pricing pages]. **Notify me** by [email] when I'm done unless I finished in under [60 seconds]."

Each bracket is a tap-to-edit chip. This is the SAME pattern as /schedules's Sentence Builder and /settings's Profile Letter and /reports's white-label override letter — cross-page mechanic for configuration. Single mental model: **configuring is writing.** This is the strongest cross-page coherence move in the entire product, and /crew's per-agent letter is the place where it pays off most viscerally because the user is literally writing instructions to a *named character*.

## Microcopy register
**Agent first-person, with a distinct voice per agent.** Each of the 11 agents gets a personality flavor that propagates across the whole product (in /workspace courier output, in /inbox Reasoning Receipts, in /competitors verdict Receipts, in /crew card backs, in /home recent activity feed):

- FAQ Agent — meticulous, slightly pedantic
- Citation Fixer — dogged, persistent, slightly competitive
- Schema Doctor — dry, clinical, factual
- Content Optimizer — editorial, opinionated about voice
- Competitor Intelligence — analyst-detached, sportscaster-edges
- Visibility Auditor — thorough, slightly anxious
- Query Researcher — curious, asking-questions register
- Onboarding Guide — warm, simple-language
- Schema Doctor (separately listed as a different specialty) — TBD
- Translation Agent — bilingual, pragmatic
- Topic Map Agent — structural, architectural

The 11 voices are consistent across all surfaces. This is the rare brand investment that compounds: every time the user encounters an agent's voice, it reinforces the agent's identity. After 3 weeks, the user has parasocial relationships with 11 named professionals. **No competitor is even attempting this.**

3 examples (3 different agent voices, card-back excerpts):
- FAQ Agent: "I write FAQ entries the way Perplexity asks the question, not the way you'd write them on the website. That's intentional — Perplexity reads more literally than Google. If you'd rather I write them in your house style, you can switch me to 'mirror your tone' in my settings."
- Citation Fixer: "If a competitor cites you, I want to know about it. If a major outlet cites them and not you, I'll find a way in. Email outreach is part of my job description; I'm proud of my reply rate."
- Schema Doctor: "JSON-LD only. No microdata. No RDFa. The schema graph is FAQPage > Question > Answer, period. I won't add Organization schema unless your homepage has the data to back it up; I refuse to lie to Google."

## Where I would push back on Designer 2
Designer 2 will say: "Card flips are 2010 skeuomorphism. The field-notes back is sentimental. Use a click-to-expand panel like Linear. 11 distinct agent voices is a writing budget you can't sustain."

Pre-rebuttal on flips: Linear's expand-in-place is the right pattern for an issue-tracker because issues are interchangeable units of work. Beamix's agents are *characters* — they each have their own job, voice, and history. The card flip is a **ritual gesture** that says "I'm getting to know this team member." The field-notes back is the trust-building artifact. Without it, /crew is an icon grid; with it, /crew is a roster of named professionals. The brand promise of the product is *agents, not endpoints*. The card flip is the page's contract with that promise.

Pre-rebuttal on writing budget: 11 agent voices, ~80 words each on the card back = ~900 words of brand writing. We refresh quarterly. That's 4 hours of writer-time per quarter. Vs. a gain of "every agent feels named and personal." 4 hours per quarter is the easiest writing investment in the product.

---

# 6. /schedules

## What makes THIS page distinctive (the headline move)
**The Sentence Builder.** Every cron-config UI in the world is a form: dropdowns for frequency, time pickers, cluster of checkboxes for days-of-week (Inngest's UI, Airflow's UI, GitHub Actions' YAML-form, Stripe's webhook scheduler). Beamix's /schedules abandons the form entirely. Each schedule is rendered as a **single English (or Hebrew) sentence** with tap-to-edit chips:

> **Run** [the FAQ Agent] **every** [Monday] **at** [9am] **unless** [I'm on vacation], **and notify me** [by email] **when it's done.**

Each bracket is a chip; tap → inline editor (dropdown, time picker, toggle, multi-select depending on the chip type). The sentence reflows live as you edit. Schedules are added with a "**Add a new sentence**" button at the bottom. **Linguistic, not formy.** No competitor does this; cron-config is universally form-shaped.

## Signature animation
**Chip-edit reflow.** When a chip is tapped, it pops up into an inline editor (250ms ease-out, the chip transforms into the editor — width animates from chip width to editor width, height animates from chip height to editor height, the editor surface grows from chip dimensions and "blooms" into the dropdown / picker). When the user commits the change, the editor collapses back into the chip with the new value, and the rest of the sentence **reflows** (CSS Grid / Flex with `transition: all 200ms`). Words physically move to make room. The motion is the proof that the sentence is alive.

The reflow uses `prefers-reduced-motion: reduce` correctly — snap-instant on user preference.

## Hand-drawn surface
**No, but with one exception.** The page chrome is crisp — Inter sentences, no doodles, no Excalifont (which would over-claim warmth on a configuration page). But the **"Add a new sentence" button** at the bottom is a hand-drawn dashed-outline placeholder bar (Rough.js, roughness 1.0, fixed seed, full-width of the sentence column at ~720px max, ~56px tall, with a centered "+ Add a schedule" in Excalifont 15px). This is the invitation register — the same family as /crew's empty card placeholder. **Cross-page coherence: hand-drawn lives at *invitations to action*, not at the actions themselves.** Same vocabulary, different page.

## Layout move that's NON-default
**Single-column, narrow, prose-formatted.** Max width 720px, centered (in LTR; right-aligned to chrome in RTL via CSS logical properties). Each sentence sits on its own line with 32px vertical gap between sentences. No table. No card. No grid. The page reads top-to-bottom like a list of meeting notes. The vertical rhythm is a literary one, not a data one. **Configuration becomes a literary act, not a clerical act.**

The other non-default: **no save button.** Edits commit immediately on chip-blur. The page is always saved. (Optimistic UI with toast confirm if save fails.) This is the hidden Stripe pattern — when you have nothing to save, you have nothing to mistake.

The third non-default: **active vs paused schedules use TYPOGRAPHY, not chrome.** Active schedules render in #0A0A0A primary text. Paused schedules render in #6B7280 muted with a subtle strikethrough-by-default (`text-decoration-style: dotted`, `text-decoration-color: #6B7280`). Hover a paused schedule → "Resume" chip appears. No status pills. No pause/play icons. The text style IS the state. This is the typographic discipline applied at full strength.

## Component or interaction with personality
**The "next run" hint.** Below each sentence, in 12px muted Inter italic, sits a one-line forecast: "Next run: Monday April 28, 9:00am Israel time (in 4 days)." Live-computed. It's the page's quiet way of saying "I understand what you wrote." Like a calendar app showing "in 2 hours" next to an event. Subtle but high-trust.

For conditional schedules ("every time my Schema score drops below 80"), the hint becomes "Next run: when triggered. Last triggered 6 days ago." Same register, different content.

## Microcopy register
**Conversational, structurally rigid.** The sentence template is fixed across schedules ("Run [agent] every [cadence] at [time] unless [exception], and notify me [channel] when it's done.") so the page reads as parallel prose. Variables fill in; structure stays.

3 schedule examples:
- "Run [the Citation Fixer] every [Wednesday] at [2pm] unless [I'm on vacation], and notify me [in Slack] when it's done."
- "Run [a full Beamix scan] every [first day of the month] at [8am] and notify me [by email]."
- "Run [the Schema Doctor] every [time my Schema score drops below 80] and notify me [immediately]." (← conditional schedules; chip "every [event]" instead of "every [cadence]")

Hebrew (transcreated, NOT translated):
- "**הריצי** [את ה-Citation Fixer] **בכל** [יום רביעי] **ב-**[14:00] **אלא אם** [אני בחופשה], **ותעדכני אותי** [ב-Slack] **כשתסיימי.**" (Hebrew uses 2nd person feminine to address the agent — gender-locked because the agent is *one* persona being addressed; this is fine, unlike instructing the user.)
- "**הריצי** [סריקת Beamix מלאה] **בכל** [תחילת חודש] **ב-**[8:00] **ותעדכני אותי** [במייל]."

## Where I would push back on Designer 2
Designer 2 will say: "Sentence Builder is cute but unscalable. Power users with 30 schedules will hate it. Use a table."

Pre-rebuttal: even Yossi running 20 domains has *fewer* total schedules than 30 — schedules are top-level configurations, not per-task-units. The realistic upper bound is ~12 schedules for a Scale-tier agency (one or two per domain, not one per task). At that scale, prose remains scannable. AND the SAME mental model is used in /crew's "Adjust how I work" letter and /settings Profile Letter — meaning Yossi already knows the pattern when he hits this page. **Cross-page coherence pays the unit cost.** A table would be an *external mental model* (cron) imported into Beamix; sentences are an *internal mental model* (Beamix's own grammar).

---

# 7. /settings

## What makes THIS page distinctive (the headline move)
**The Letter.** Settings pages are universally boring — Stripe's, Linear's, Vercel's, Notion's, Anthropic Console's all use the same "stacked rows of label-input-help text" pattern. Beamix's /settings Profile tab opens as a **typed letter on warm cream paper** (Excalifont 16px body, generous line-height 1.7, max-width 560px, paper texture is the canvas color #F5F3EE plus a 1px grain noise at 2% opacity rendered as an SVG `<feTurbulence>` filter). Form fields appear **inline in the prose**:

> Your business is called [**Acme Bakery**], based in [**Tel Aviv**]. You sell [**artisan sourdough and pastries**] to [**local cafés and walk-in customers**]. People search for you mainly in [**Hebrew**] and [**English**]. We'll tune the agents to your tone, which is [**warm but professional**].

Each bracket is a tap-to-edit chip — same mechanic as /schedules and /crew. **Cross-page coherence at maximum strength.** The page reads like a profile written *by* the user, not a form filled *out by* the user. **The boring page that nobody makes special — Beamix makes it special with one move.**

## Signature animation
**No entrance animation.** This is /settings — visited 2x/year by Sarah, monthly by Yossi. Per ANIMATION-STRATEGY-LOCKED, /settings gets NO skeleton-draw and NO entrance choreography. Content renders instantly. The only motion: chip-edit reflow on tap (same as /schedules), 200ms ease-out, identical mechanic. The discipline matters here — the page should feel utility-grade efficient, not theatrical.

## Hand-drawn surface
**No, with one exception.** The Profile tab is the letter — Excalifont type, but no Rough.js shapes, no doodles. The chip editors are crisp. The other 4 tabs (Billing, Language, Domains, Notifications) are even more clinical — no Excalifont, just Inter, since they're operational not introductory. **Honestly: hand-drawn doesn't fit /settings beyond the Profile letter.** The discipline is more valuable than the personality moment elsewhere on this page.

The single exception beyond Profile: the **"Domains" tab (Yossi-only)** uses the receipt-tape format from /scans for the list of 20 domains. Each domain is a tape segment with the same monospace serial number style, the same ledger typography, the same tear-perforation between segments. Cross-page coherence — Yossi's data artifacts share a visual register. (The Domains tab is invisible to Sarah's account; she never sees it.)

## Layout move that's NON-default
**Tabs in a left rail, not above the content.** Standard settings UI puts tabs at the top of a content area. Beamix puts tabs in a left rail (~200px wide), and **the tab name re-appears as the H1 inside the content area** as the *first sentence of the letter*. ("**Profile.** Your business is called…") The tab label and the page H1 are the same words and the same prose — the tab is a wayfinder, the H1 is the start of the document.

The other non-default: **right rail "this is what changes" preview.** When you edit a chip in the Profile letter, the right rail (~280px wide) shows a tiny live preview of *how this affects the agents*: e.g., changing "warm but professional" to "playful and irreverent" updates a sample agent rewrite below in real-time. The right rail is small and quiet — but it's the proof that settings *do* something. This violates the "settings have no consequence visible until later" pattern of every other product.

The third non-default: **the cream paper background only appears on the Profile tab content area.** The other 4 tabs render on the standard #FFFFFF surface. The cream is the visual cue that "this tab is the letter; the others are operational." Subtle but consistent.

## Component or interaction with personality
**The signature.** At the bottom of the Profile letter, in Fraunces 14px italic, the page closes with a quiet phrase: "*— configured by [Adam K], last updated [April 26, 2026].*" An em-dash, the user's name, a date. Like a signed letter. Click → reveals the change history (sessionStorage flag for the panel; persisted server-side for full audit; last 10 changes shown with diffs). Tiny detail, billion-dollar care. Mercury / Stripe ship change-audits but never show them as a signed letter — they're a hidden admin surface. Beamix surfaces it as a signature.

In Hebrew: "*— הוגדר על ידי [אדם ק], עודכן לאחרונה [26 באפריל 2026].*" Frank Ruhl Libre instead of Fraunces (no Hebrew glyphs in Fraunces).

## Microcopy register
**Editorial-conversational, second-person, present tense.** Letters about *you* written *by* the product. Never imperative. Never "Click here." Never "Settings." Never "Welcome to your settings page!"

3 examples:
- Profile letter: "Your business is called [Acme Bakery], based in [Tel Aviv]. You sell [artisan sourdough] to [local cafés]."
- Notifications tab (also a letter, shorter): "Email me when [an agent finishes a job], when [my score changes by more than 5 points], and never on [weekends]."
- Billing tab (clinical, NOT letter — operational): "You're on the [Build] plan, billed [annually] at [$151/month]. Your next invoice is on [May 26]."

Notice: **Notifications is also a letter** (because it's about preferences, like Profile). **Billing is clinical stacked rows** (because it's about state, not preferences). This is the rule: letters for self-presentation; rows for state. Language tab is a single dropdown (not a letter). Domains tab (Yossi) is the receipt-tape format. **5 tabs, 3 visual registers, consistent rule.**

Hebrew (Profile): "העסק שלך נקרא [אקמי בייקרי], מבוסס ב-[תל אביב]. אתה מוכר [לחם מחמצת] ל-[בתי קפה מקומיים]."

## Where I would push back on Designer 2
Designer 2 will say: "/settings is visited twice a year by 80% of users. Don't waste design budget on it. Use Stripe's settings pattern — stacked label-input rows, ship it. The Letter is precious."

Pre-rebuttal: the Profile tab is the *one* settings tab that is visited NOT for utility but for *self-presentation* — the user telling Beamix who they are. That tab IS the brand promise of "this product knows me." Stripe's settings are about *operations* (reset password, change billing email); Beamix's Profile is about *identity*. Different gravity. The other 4 tabs (Billing, Language, Domains, Notifications) get their own appropriate treatments — clinical rows for Billing, dropdown for Language, receipt-tape for Domains, letter for Notifications. **The Letter is one tab, not five.** The cost is bounded; the brand return is large. The Profile letter is the only place in the product where the user explicitly tells the system "this is who I am" — it must feel like writing, not filling out a form.

---

# 8. /scan (public)

## What makes THIS page distinctive (the headline move)
**Self-correcting handwriting.** The /scan public reveal already has the locked 15-17s storyboard (10 frames, REFS-03). The distinctive Beamix-only move BEYOND that storyboard: in **Frame 3**, when the company name auto-detected from the URL is written in handwritten ink (per the locked storyboard), if the detection is wrong (e.g., wrong business at that URL, weird subdomain, parent company vs subsidiary), the user can **click the handwritten name** and a Rough.js scribble strikethrough animates across it (~400ms), then the corrected name is rewritten in ink letter-by-letter (Excalifont, ~25 chars/sec). This is **never** done by competitors — they show "Detected: Acme Bakery [edit]" with a pencil icon and a form input. Beamix's correction IS handwritten. **The metaphor commits all the way through the surface.**

## Signature animation
The storyboard is locked (REFS-03 §The Beamix First Scan Reveal — 10-Frame Storyboard). Beyond that, the **strikethrough-and-rewrite** is the page's distinctive recurring motion if the user makes any correction. Same mechanic for: correcting the detected industry, correcting the detected language, correcting the suggested target queries (if shown). Each correction is a strikethrough scribble + handwritten rewrite. ~400ms strikethrough, ~variable rewrite (depends on string length). The page's vocabulary is **ink-on-paper**, including its corrections.

The other locked motion: the **score arc count-up** (REFS-03 Frame 7), which is shared across /home and /reports — single product-wide motion vocabulary item.

## Hand-drawn surface
**Yes — the entire page during Frames 1-7.** This is the one surface where Beamix is allowed to lean fully into the hand-drawn idiom because the audience hasn't signed up yet — they're being *seduced*, not *served*. Per REFS-03 / MASTERLIST, /scan is the brand surface for the product. Frames 1-7 are entirely hand-drawn (URL pencil-stroke, Rough.js bracket around URL, scribbled engine bubbles, sketched score arc). Frame 8 onwards transitions to data-rendered crisp typography for the result blocks. **The hand-drawn-to-crisp transition IS the moment the user crosses from "demo" to "real product."** The metaphor of "we're sketching it for you" gives way to "here's the real data." This is the storyboard's most important emotional beat.

## Layout move that's NON-default
**Blank-canvas-first, no chrome.** Unlike every competitor's scan landing (Otterly, Profound, Peec all have chrome — header, nav, footer — even on the public scan), Beamix /scan is **chromeless during Frames 1-7**. No header. No footer. No marketing nav. Just the canvas (#F5F3EE) + the URL input. The chrome fades in only at Frame 10 (the sticky bottom bar with "Save these results"). For 11 seconds, the page is **just the work**. This is Stripe-Press-tier confidence — putting the user inside the experience rather than around it.

The other non-default: **the URL input is centered, large, and the cursor blinks before the user clicks.** Per Arc browser's "any keystroke triggers search" pattern (REFS-MASTERLIST §12). The user lands on /scan, the cursor is already in the input, and any character typed appears in the URL field. **No tab-to-input. No click-to-input.** The input is implicit. This is the highest confidence move on the entire surface.

## Component or interaction with personality
**The proof-receipt at the end.** After the score arc completes (Frame 7), before the results cascade in (Frame 8), a small **"Scanned at [HH:MM:SS], [date], [N seconds]"** stamp materializes in the bottom-left corner — Geist Mono, 11px, muted #6B7280. Like a timestamp on a Polaroid. It's the page saying "this happened, you watched it." Permanent visual proof that the scan was real and synchronous, not a cached mock. Click → copies the scan permalink to clipboard with a quiet toast confirmation. Persists in the saved results when the user signs up — the permalink format is `/scan/[scan_id]` (per project memory, naming locked as `scan_id`). The receipt is also visible in the user's email if they choose to email-self the results.

## Microcopy register
**Casual-direct, second-person, present tense.** No marketing speak. No "Discover…" "Unlock…" "Powerful…". Per MASTERLIST.

3 examples (URL input prompt, scan-running narration, completion):
- "Type a website URL. We'll check how AI sees it." (NOT "Discover your AI visibility score!")
- During scan: "Reading your homepage…" → "Asking ChatGPT what it knows about you…" → "Comparing what each AI said…" (per MASTERLIST Motion 2 narration register)
- After scan: "73 out of 100. Stronger on ChatGPT, weakest on Perplexity. Top fix is FAQ schema." (← Fraunces italic on the diagnosis line, per /home Section 1 typographic register — cross-page coherence)

Hebrew (URL prompt): "הקלידי כתובת אתר. נבדוק איך הבינה המלאכותית רואה אותו."

## Where I would push back on Designer 2
Designer 2 will say: "The strikethrough-and-rewrite correction is overkill. Just use a pencil-icon edit pattern; ship it. The blank-canvas chromeless approach is risky for SEO and analytics."

Pre-rebuttal on correction: /scan is the **acquisition wedge**. It's the only surface 99% of leads will see before deciding whether Beamix is worth $79/mo. A pencil-icon edit looks like every other SaaS form. The strikethrough-and-rewrite is what makes /scan the **referral-share moment** — the thing the user screenshots and posts on X/LinkedIn ("look what this site did when I corrected the detection"). The conversion-attributable distinctive move is exactly here. Skipping it ships /scan as a free version of Otterly. This is where Beamix's marketing budget compounds.

Pre-rebuttal on chrome: the page has metadata (title, og:image, structured data) at the document level for SEO/analytics. The visual chrome absence is a *design* choice, not a *technical* choice. Mercury's marketing pages, Stripe Press, Linear's product pages — none of them have visible chrome on their hero surfaces. They all have full structured data. We do the same.

---

# 9. /onboarding

## What makes THIS page distinctive (the headline move)
**The Wrap-Around horizon.** /onboarding has 4 steps (per project memory: 4-step full product flow, NOT a 3-step MVP). Standard onboarding UI puts a stepper at the top: 4 dots, current one filled, completed ones checked, future ones empty. Beamix's onboarding is a **single horizontal horizon line** that the page scroll travels along — sketched faintly ahead (Rough.js dashed line, low opacity #6B7280 at 30%) and solidly behind (path-drawn solid line in #2558E5 brand-blue text-safe). Each "step" is a station on the horizon. Progress isn't an abstract dot count; it's the line itself unfolding as the user travels through the onboarding.

**Visual metaphor: you're crossing terrain, not filling out a wizard.** The horizon implies destination, not steps.

## Signature animation
**Path-draw on horizon advance.** When the user completes Step 1 and moves to Step 2, the dashed-faint section between Stations 1 and 2 **draws solid** — `pathLength` 0→1 over 600ms ease-out — turning future-faded into past-real. Subtle progress feedback at the page level, not the stepper level. Per ANIMATION-STRATEGY-LOCKED, /onboarding gets light per-step flourishes ≤500ms each — this fits the budget at 600ms (slight indulgence for the page's most important moment). NOT /scan-grade theater; just one path-draw per step transition.

The other recurring motion: **the active station's circle breathes** (1400ms cycle, identical to /workspace's active step pattern — cross-page coherence). The breath is the active-state signal everywhere in the product.

## Hand-drawn surface
**Yes — the horizon line itself, plus station markers.** The horizon is perfect-freehand stroke (thinning 0.5, 3-7% jitter, ~1.5px stroke-width), color shift between past (#2558E5 60% opacity), present (#3370FF 100%), and future (#6B7280 30%). Station markers are small Rough.js circles (28×28px, roughness 1.0, fixed seed per station). Active station's circle is filled with brand blue #3370FF and breathes (1400ms cycle). Completed stations have a hand-drawn checkmark inside (Rough.js, slight rotation variation per station for handcraft feel). Future stations are 30% opacity, dashed-only outline.

The 4 step content surfaces themselves (the actual forms / questions) stay crisp Inter — only the navigation/progress visualization is hand-drawn. Discipline rule: hand-drawn lives at the **journey**, crisp lives at the **work**.

## Layout move that's NON-default
**The horizon spans the full top of the viewport, ~120px tall, sticky.** As the user scrolls within a step (some steps have multiple fields), the horizon stays visible at the top — it's the constant context. The 4 station markers don't move; the page content scrolls beneath. This is *un*-Linear, *un*-Stripe — it's a deliberate piece of theater. But it's bounded (one element, one moment), so it pays.

The other non-default: **the active step's content opens as a single full-width prose block**, not a card. The content is **the page** during that step — same dissolve-the-card pattern as /workspace. Each step is a chapter, not a panel. ~720px max width, generous vertical breathing (64px above the H1, 48px between fields).

The third non-default: **no "Back" button in the bottom-right.** Standard onboarding has Back/Next pairs at the bottom of every step. Beamix puts Next as the only forward action; **clicking on a previous station marker on the horizon** goes back. The horizon IS the navigation. This requires the user to know the horizon is interactive, but the breathing active-station circle plus hover states make it discoverable in <2 seconds.

## Component or interaction with personality
**The skip-but-stay button.** On any step, the user can choose "Skip — I'll do this later" → the station marker fades to a dashed empty circle (not a checkmark, not absent — *deferred*). The horizon line advances normally, but the station shows visually that it's pending. The signal: **Beamix knows you'll come back; we won't pretend you finished what you didn't.** This is honest in a way no other onboarding is. Most onboardings either force completion or silently mark skipped steps as done.

When the user later returns to /onboarding (or the system surfaces a banner-free reminder on /home), the skipped station glows briefly (~3 second breathing animation, ~1400ms cycle) — pulling the eye to the unfinished business. Soft re-engagement, not a nag.

## Microcopy register
**Direct-conversational, second-person, no exclamation, no "welcome".** Per MASTERLIST. Each step's H1 is one sentence, lowercase only on articles, NOT title case (typographic discipline).

3 examples (step H1s):
- Step 1: "Tell us about your business."
- Step 2: "Pick the language your customers use."
- Step 3: "Try your first agent — pick one we'll run while you finish."
- Step 4: "Set how many credits you want a month, and we're done."

Hebrew (transcreated):
- "ספרי לנו על העסק שלך." (gender-neutral via plural-you would also work: "ספרו לנו על העסק שלכם.")
- "בחרי את השפה שהלקוחות שלך משתמשים בה."
- "נסי את הסוכן הראשון שלך — בחרי אחד שנריץ בזמן שאת מסיימת."
- "קבעי כמה קרדיטים את רוצה בחודש, וסיימנו."

## Where I would push back on Designer 2
Designer 2 will say: "Horizon line is decorative. A standard top-stepper with 4 dots is universally legible; ship that. The horizon-as-navigation is non-discoverable for non-technical users."

Pre-rebuttal: standard 4-dot steppers are a category convention because nobody invests in onboarding visualization. Beamix's onboarding is the user's **first real product moment after paying** (post-Paddle). It needs to feel like the start of a relationship, not a setup wizard. The horizon costs little (one Rough.js line, one path-draw animation, 4 station markers — all already in the motion vocabulary) and signals "this product was designed by someone who cared about your first 90 seconds." A 4-dot stepper signals "this product was assembled from parts."

On non-discoverable navigation: the breathing active-station circle is a strong attentional cue, and station markers have hover state (cursor changes to pointer, tooltip "Step 1 — Tell us about your business" appears). Users discover the horizon is interactive within 2 seconds. The skip-but-stay state explicitly demonstrates that stations are addressable. The DFII (impact + fit + feasibility - consistency-risk) on the horizon line scores ~12 — Excellent: Execute fully.

---

# 10. /reports

## What makes THIS page distinctive (the headline move)
**Cover Page Press.** Yossi's white-label exports are the entire reason /reports exists (Scale-tier, $499/mo, gated feature). Standard report-export UIs (Stripe Reports, Mixpanel exports, Google Analytics scheduled exports) generate utilitarian PDFs — landscape data tables with title bars in 18px helvetica. Beamix's /reports generates **a Stripe-Press-tier cover page** for every PDF: full-bleed cream paper (#F5F3EE), the client's domain set in **InterDisplay 64-72px** as a display title, a single Fraunces 18px italic editorial subtitle, a single hand-drawn underline (rough-notation library) under one key word, the date in Geist Mono 13px ledger-style, and a tiny Beamix monogram in the bottom-left corner.

**The PDF cover IS the artifact.** Yossi sends this to his clients; the cover page is the brand handshake. The client opens the PDF, sees the cover, and thinks "this looks like a $5K/month consultancy's deliverable, not a tool's CSV export."

## Signature animation
**First-visit unlock celebration, locked.** Per ANIMATION-STRATEGY-LOCKED, /reports gets first-visit-only skeleton-draw, **once per account** (Yossi's 20 domains share one celebration moment, not 20). On first-ever visit: the cover-page preview sketches itself in (Rough.js outline of the cover layout draws over ~1500ms, then content cascades in — title types in Excalifont then **morphs** into InterDisplay over 300ms, subtitle fades in, underline draws via rough-notation, monogram path-draws). One-time. localStorage flag.

**The Excalifont-to-InterDisplay morph is the page's signature moment.** It's the visual metaphor: the agent sketches your report; the press finishes it. Hand-drawn becomes published. Same emotional beat as /scan's Frame 8 transition (handwritten to crisp data) — cross-page coherence at the most emotionally important moment.

After first visit: instant render. Each new report generated triggers a small "new report ready" toast — but no ceremony. The first time WAS the ceremony.

## Hand-drawn surface
**Yes, restrained.** The cover page has ONE hand-drawn element: the rough-notation underline beneath a single key word in the editorial subtitle (e.g., "AI visibility report — quarterly **review**" with "review" underlined in a sketchy stroke, Rough.js, color #2558E5 brand-blue text-safe, ~1px stroke-width, fixed seed per report). Elsewhere, crisp typography and clean layout. The hand-drawn element is the **editorial accent** — the way a magazine layout uses one circle or one underline as the only piece of personality on a cover. New York Times / Stripe Press / Bloomberg discipline.

The /reports product UI itself (not the PDF cover preview) is mostly crisp — list of generated reports, "Generate new" CTA, schedule-recurring-report config (which uses the Sentence Builder mechanic from /schedules — cross-page coherence). The hand-drawn element is reserved for the *artifact*, not the *interface that makes the artifact*.

## Layout move that's NON-default
**The /reports page is a 2-pane preview-and-export, not a list page.** Left pane (60%): live preview of the next-to-generate cover page, in print-accurate proportions (~A4 / Letter aspect ratio, scaled to fit). Right pane (40%): the configuration — which domain, which timeframe, which sections to include, white-label branding overrides. Edits in the right pane reflow the left pane's preview in real-time. This is **Notion / Pitch's editor pattern** applied to report generation.

The other non-default: **the export button isn't called "Export" or "Download."** It's called "**Press**" — as in printing-press, as in "press a copy". Bottom-right of the preview pane, large pill (height 48px, padding 0 32px, border-radius 999px, brand blue #3370FF background, white text 16px medium). Click → the cover page preview "**flips**" forward (a Y-axis rotation, ~600ms — same motion grammar as /crew card flip — cross-page coherence) and behind it the user sees a stack of pages forming the full PDF body, then the PDF download fires. **The action IS the artifact-making metaphor.**

The third non-default: **the list of past-generated reports doesn't live on this page.** It lives at `/reports/history`, accessible from a small link "View past reports →" at the bottom of the right pane. The /reports page's job is to **make the next report**, not to manage the back catalogue. Aggressive separation of "create" from "manage" — same rule that puts /home in front of /scans (state vs history).

## Component or interaction with personality
**The white-label override letter.** When Yossi configures white-label branding (his agency's logo + colors instead of Beamix's), the UI is a **letter to Beamix** — the same letter mechanic from /settings Profile. ("**Replace the Beamix monogram** with [the agency's logo]. **Use** [these brand colors] instead of Beamix blue. **Sign the report from** [Yossi Cohen] of [Cohen Digital].") Cross-page coherence: configuration is letter-writing, here, in /settings, in /schedules, in /crew. **The user has learned the pattern in three places before reaching this one.**

This compounding mental model is the single biggest design payoff in the product. /reports is the 4th place the user encounters the chip-in-prose pattern. By now it's instinctive.

## Microcopy register
**Editorial-clinical, third-person on the cover, second-person in the UI.** The PDF cover reads as a published artifact ("AI visibility report — Q2 2026, prepared for [Client Name]"). The product UI reads as a personal letter ("Press a copy of [this report] for [Acme Bakery] dated [today].").

3 examples (cover titles + UI prose):
- Cover: "AI visibility report — quarterly **review**. Prepared April 2026."
- Cover: "Six-week competitive **audit**. Prepared for Acme Bakery."
- UI: "Press a copy of this report for Acme Bakery, dated today."
- Recurring config: "Generate this report every [first Monday of the month] and email it to [client@acme.com]."

Hebrew (cover): "דו"ח נראות AI — **סקירה** רבעונית. הוכן באפריל 2026." (Hebrew uses Frank Ruhl Libre serif to substitute for Fraunces, MASTERLIST locked stack.)

## Where I would push back on Designer 2
Designer 2 will say: "Generated PDFs don't need a Stripe-Press cover. Use a clean header bar. Yossi cares about the data; the cover is decorative. 'Press' as a button label is gimmicky and SEO-poor."

Pre-rebuttal on cover: Yossi cares about the **handshake with his client**. The data inside the PDF is the *substance*; the cover is the *reputation*. When Yossi emails this PDF to his client, the cover is the first impression. That impression is what makes Yossi look like he's running a $5K/month agency, not a $500/month freelancer. Beamix's job at /reports is to make Yossi look senior. The cover does that. A clean header bar makes him look like he's using "any tool"; the Press-tier cover makes him look like he's **using something his client doesn't know about**. That's the Scale-tier brand promise made visible. The cover is exactly the move that earns the $499/mo price.

Pre-rebuttal on "Press": SEO doesn't matter on a Scale-tier gated page. The button label is for Yossi's mental model, not for Google. "Press" reinforces the artifact metaphor; "Export" reinforces the data-tool metaphor. Beamix is sided with artifact, not data-tool, because Beamix is sold as agents-doing-the-work, not as analytics-software. The button label is a small piece of brand framing; cumulative across the product, brand framing is what justifies the price.

---

# THE 3 MOST AGGRESSIVE DISTINCTIVE MOVES (where Designer 2 will fight hardest)

These are the moves I expect the most pushback on, where the discipline-advocate will argue "skip it, ship a default":

1. **/workspace dissolves the card surface entirely.** No bounded panel; the courier flow IS the page. Designer 2 will say this is a usability risk because users expect bounded UI, and the auto-scroll on long runs creates vertigo. I argue this is the moment Beamix earns its premium price — the agent's work IS the product, so the page must dissolve into the work, not contain it. Linear AIG is right for issue-tracker contexts; wrong for agent-doing-work contexts. The vertigo concern is mitigated by `prefers-reduced-motion` and the smooth-center-block scroll that fires once per step transition, not continuously.

2. **/scan strikethrough-and-rewrite for corrections.** Hand-drawn correction mechanic that goes deeper than any competitor's pencil-icon edit. Designer 2 will call this overkill for a public scan and argue a pencil-icon edit ships faster. I argue this is the referral-share moment — the thing the user screenshots and posts on X/LinkedIn — and the conversion-attributable distinctive move at the top of the funnel. The cost is bounded (one Rough.js scribble + one Excalifont rewrite, both reusing existing motion vocabulary). The brand return is enormous because /scan is the page 99% of leads see before deciding to pay.

3. **/reports replaces "Export" with "Press" + flip-to-PDF animation + Stripe-Press cover.** Designer 2 will call this gimmick on three counts: the button name, the flip animation, and the cover-page treatment. I argue all three are the Scale-tier brand promise made visible. Yossi pays $499/mo specifically because the artifact looks like Stripe-Press, not like Mixpanel CSV. The action IS the artifact-making metaphor; the cover IS the reputation-handshake. Removing any of the three reduces Beamix to a tool with a CSV export. Keeping all three makes Beamix the senior consultant Yossi presents himself as.

---

# THE 3 PAGES WHERE THE DISTINCTIVE MOVE IS HARDEST TO FIND

Honest concessions — pages where leaning into a distinctive move risks contrivance, and where I'd grant Designer 2's discipline-argument significant ground:

1. **/settings.** Only the Profile tab gets The Letter; the other 4 tabs (Billing, Language, Domains, Notifications) get appropriate clinical treatments (rows for Billing, dropdown for Language, receipt-tape for Domains-Yossi, letter for Notifications). Hand-drawn doesn't fit /settings beyond the Profile letter. The Letter is a single concentrated move; expanding it across all 5 tabs would be precious. Anthropic Console discipline: settings stay clinical. I'm conceding 4 of 5 tabs to Designer 2's restraint argument.

2. **/competitors.** The Rivalry Strip is distinctive, but it's a layout / data-treatment move, not a hand-drawn / typographic move. It doesn't draw on Beamix's signature register (paper, ink, prose, courier flow). It's distinctive *for the category* but uses a different visual language than the rest of the product. There's a small coherence cost. The compensating move is the verdict pill → Reasoning Receipt cross-page mechanic, which carries the brand register. But the page itself is more "competitive intelligence done right" than "uniquely Beamix."

3. **/schedules.** The Sentence Builder is great but isn't unique to Beamix — Things 3, Linear, and Notion have flirted with sentence-style configuration. Beamix's version is more committed (no fallback form, optimistic save, conditional schedules) and cross-page-coherent (same chip mechanic in /crew, /settings, /reports), but the *base idea* isn't novel. The novelty is in the cross-page consistency, not in /schedules itself. The page earns its keep through pattern-compounding, not through a singular hero move.

---

**File path:** `/Users/adamks/VibeCoding/Beamix/.worktrees/ceo-1-1777040289/docs/08-agents_work/2026-04-26-DESIGNER-1-distinctive-moves.md`

**End of Designer 1 deliverable.** Designer 2 (restraint advocate) will respond next. Adam reads both, picks moves, locks per-page distinctive direction.
