# Beamix Design Review — Through Edward Tufte's Lens
Date: 2026-04-28
Reviewer: Senior Designer applying Tufte's data-ink + small-multiples + sparklines + beautiful-evidence disciplines

> *"Above all else show the data."* — *The Visual Display of Quantitative Information*, p. 92.
>
> The standard against which Beamix is being measured is not Stripe and not Linear. It is Charles Joseph Minard's 1869 chart of Napoleon's Russian campaign — six variables in one image, no legend, no decoration, the death of an army legible at a glance. That is what data-design at the highest grade looks like. Beamix is closer than most SaaS, and farther than it thinks.

---

## A — Data-ink ratio surface-by-surface

The data-ink ratio is the ratio of ink that encodes data to the total ink on the page. Tufte's claim is simple: the higher, the better. Decoration is a tax the reader pays.

**`/home` above the fold — score: B+.** The lead-attribution headline is exemplary data-ink: every glyph carries information, the muted eyebrow is structurally minimal, tabular numerals are correct. The Score (96px InterDisplay, `ss03`) inside the 200px Activity Ring is high-density — the digit IS the data.

The Ring is where ink theft begins. A 2px brand-blue arc spanning 282° around 200px diameter encodes binary state via a pulse on a 30° gap — one bit of information rendered with **622 pixels of stroke**. Data-ink ratio: approximately 1 / 622. *The Ring is a logo dressed as a chart.* See Section F; the Ring's pixel budget is roughly 50× what its informational content justifies. The Decision Card carries one sentence and one button — poor ratio, but defensible (decision-architecture, not data display).

**`/home` below the fold — score: A-.** The 480×120 Score Trend sparkline (no axes, grid, or fill) is the cleanest data display in the product. The KPI Quartet hover-sparklines are also clean. Per-Engine chips and the Crew at Work strip are tolerable but pixel-heavy for what they communicate (see D and F).

**`/scans` table — score: A.** Stripe-table grammar correct: 44px rows, no alternating stripes, no outer border, page chrome IS the frame. The 4-lens mini-pills (`Done · 6`) are direct labeling at its best. The 11 engine dots at 8px diameter are dense and silent. **The best data-ink surface in Beamix.** (Margin column is the suspect element — see F.)

**`/competitors` table — score: A-.** The 200px dual-sparkline trend column is excellent. The gap column is correctly minimized. The favicon-as-monochrome decision is doctrinaire-Tufte: brand color is noise when the comparison is parity. "Last move" as a sentence is fattier than a structured cell, but defensible.

**Workflow Builder canvas — score: C+.** Per-node anatomy is over-decorated. A 24px category header strip + a 16×16 monogram + a 1px agent-color left-edge stripe + a 12×12 status token is **four redundant identifications of the same agent**. Cut three of four. The header strip alone is sufficient.

**Monthly Update PDF — score: B.** The cover (64px business-name + 28px Fraunces pull-quote on cream) is design-as-typography — Tufte permitted this (his own books are Bembo on Mohawk Superfine cream). But Page 4's 5-7 action blocks are restatements of the audit log in narrative form. **Page 4 is words about data, not data.** Missed opportunity (see G).

**`/workspace` step list — score: B-.** Step circles, output panels, substep microcopy, Geist Mono durations, a hand-drawn courier line. The courier line and walking-figure are decoration — narrative purpose, not data purpose.

**`/security` sub-processors table — score: A.** Beamix's quietest victory. 10 vendors × 5 columns, 56px rows, no animation, no Margin, no sigil. Procurement reviewers screenshot it. **The model every Beamix table should follow.**

---

## B — Sparklines done right and wrong

I invented the sparkline. The brief was: *intense, simple, word-sized graphic, data-rich enough to belong in a sentence, resolution-independent, no axes, no grid, no fill.* Beamix's sparklines are mostly correct. Where they fail, they fail by adding rather than removing.

**The 12-week score sparkline on `/home` — verdict: correct, with one violation.** 480×120, 12 points, perfect-freehand, 1.5px brand-blue, no axes, no grid, no fill. Hover crosshair + Geist Mono tooltip. Textbook.

The violation: the **1000ms `motion/path-draw` entrance animation.** Sparklines are static reading instruments — glanceable BEFORE the reader is conscious of looking, like small numbers in a financial table. Animation creates a "wait for the chart to finish" moment exactly contrary to their purpose. If a Stripe table painted column-by-column, every reader would perceive theatre. **Cut the path-draw.** Render at full state at t=0. The page informs; it does not impress.

**The KPI card hover-sparklines — verdict: nearly perfect.** Hover-summoned, no entrance animation, 36% opacity behind card content. **The canonical Tufte sparkline implementation.** The chart is a secondary reading, summoned by the user, not pushed at them.

**Per-engine mini-sparklines on `/scans` detail — verdict: configurationally suspect.** They "fade from `--color-ink-4` to `--color-brand` over time" — color encodes recency. **Data theft of the line.** The x-axis already encodes time; encoding it AGAIN in stroke color is double-encoding — *moiré of meaning*. Cut the gradient. Single 1.5px brand-blue stroke.

**Rivalry Strip dual-sparkline — verdict: ambitious, mostly correct, one violation.** Two lines (yours brand-blue, theirs ink-2 at 40%), gap polygon at 12% semantic opacity, perfect-freehand with per-domain seeded jitter. **The polygon-recolors-at-crossover detail is genuinely beautiful** — "they overtook us in week 6" legible at a glance. Tufte-grade.

The violation: the 80ms stagger ("your line first"). The dual-sparkline's purpose is **comparison**. Comparison wants the lines simultaneous so the eye reads them as a system. 80ms of stagger creates hierarchy where there should be parity. *The data is the parity; do not impose authorial preference on top of it.* Cut the stagger AND the 1200ms path-draw. Both lines render together, instantly, static. The polygon resolves immediately. The verdict pill follows.

**On "perfect-freehand" jitter — verdict: earned at 2%, chartjunk above 3%.** Jitter at 2% on a 1.5px stroke is the *minimum* perceptible departure from a plotted line. It signals "drawn, not generated." Handcraft is data discipline at the level of medium; decoration is data-ink theft. Jitter survives iff the line is plotted from real data otherwise — Beamix's is. At sparkline resolution, 2% jitter is below the noise floor of the reader's eye for trend-direction. **A permitted texture, not chart-junk.** Hold the line at 2%; cross 3% and it becomes illustration.

---

## C — Small multiples opportunities Beamix is missing

The single most powerful idea in *Envisioning Information* is small multiples: the same chart, at small size, repeated, with one variable changing. The eye reads pattern across the multiples that no single chart can show. Beamix is leaving three of these on the table.

**Opportunity 1: The 11 engines × 12 weeks small-multiples grid.** This is the most important missing chart in Beamix. Currently, `/home` shows one large 480×120 sparkline of the *aggregated* score across 11 engines. This is a lossy aggregation. The customer wants to know — and the renewal mechanic depends on knowing — *which engines are moving and which are stuck.*

Proposed design: **11 small sparklines, each 96×40px, in a 4×3 grid with one cell empty (or housing a "summary" line).** Each sparkline carries the engine's score over the past 12 weeks. Each is direct-labeled with the engine name in 11px Inter caps above the line, the current score and delta below in Geist Mono. No axes. No grid. Same brand-blue stroke (1.5px, perfect-freehand) on every cell. Total footprint: ~480×180px (smaller than the current single-aggregate sparkline) **carrying 11× the information.**

The pattern reading the customer gets: "ChatGPT and Perplexity are climbing; Gemini is flat; Claude dipped; Grok dropped 6 points last week." That is a sentence the customer cannot construct from one aggregate line. *That sentence is the renewal mechanic, rendered in chart form.*

Place this on `/home` Section 4 (currently a single 480×120 sparkline) and on `/scans/[scan_id]` detail page (currently a single trajectory chart). One pattern. Two surfaces. Maximum legibility.

**Opportunity 2: 5 competitors × 11 engines = 55 sparklines.** The `/competitors` page currently shows one row per competitor with a single trend column (200×56px dual-sparkline, the customer's line vs theirs, on a single engine selected via tab). To switch engines, the customer clicks a tab and watches all rows re-animate. This is sequential interrogation of a multi-dimensional space. Tufte would call it *fracturing the comparison*.

Proposed design: a **drill-down small-multiples grid**, opened from any competitor row. 11 small dual-sparklines in a 4×3 grid (one cell empty), each 120×60px, each showing your line vs theirs on one engine, gap polygon shaded, no axes. Above each cell: the engine name. Below each cell: the current gap (`+12` / `-4` / `±0`) in 11px tabular Geist Mono.

The customer reading this grid in 5 seconds knows: *which engines we are winning on, which we are losing on, and where the gap is widening or closing.* Currently impossible without 11 tab clicks and 11 mental snapshots. This is the highest-value small-multiples chart Beamix could ship.

**Opportunity 3: Monthly Update Page 4 redesign as small multiples.** Currently Page 4 is 5-7 narrative action blocks ("Beamix added 23 FAQ entries to /services/emergency-plumbing"). Each block is a paragraph of prose with a date eyebrow and a permalink.

Proposed design: a **timeline of small-multiple bars**. One row per agent action. Each row: 11px Geist Mono date, agent monogram (16px), 13px verb+object sentence, and a **48×16px micro-bar showing the score impact attributed to that action.** All bars on the same x-scale (zero-aligned). The reader scans the column of bars and sees, in 3 seconds, *which actions moved the needle and which were noise*. Currently Page 4 is impossible to skim — each block is a paragraph. With micro-bars, Page 4 becomes the most data-dense page of the entire artifact.

A subtler small-multiples opportunity: the per-agent action history on `/crew/[agent]`. Each agent gets a 12-week sparkline of "actions taken per week." 18 sparklines = 18 distinct rhythms of work. The reader reads workstyle. Defer to v2.

---

## D — Direct labeling vs legend lookups

A chart that requires a legend forces the reader's eye to bounce between chart and legend. The bounce costs ~300ms per lookup. *A great chart is read without bouncing.* Direct labels — the label sits next to the line, the dot, the bar — eliminate the bounce.

**The 11 engine dots on `/scans` rows — failure.** Eight pixels diameter, color-encoded by score band (`excellent`, `good`, `fair`, `critical`). To know which dot is ChatGPT vs Perplexity vs Gemini, the reader must (a) know the spec-locked positional order (ChatGPT first, Perplexity second, etc.) — which no real customer learns — or (b) hover each dot for a tooltip. **This is a legend without a printed legend, which is the worst kind: invisible labor.** Cut the dots. Replace with a 56px-wide engine micro-strip per row showing 11 columns, each column 4px wide, the column's height (0-12px) encoding the engine's *delta* on this scan. Direct-readable as a sparkbar. Each column tooltipped on hover for the precise engine name and score. **This is the Hans Rosling move applied at table-row scale.**

**The agent monogram colors — partial failure.** Schema Doctor #6366F1, Citation Fixer #10B981, FAQ Agent #3370FF (the brand color, on top of an agent — that is doubly wrong; brand-blue belongs to chrome accent only, per your own anti-pattern §7). The reader must learn 18 colors. They do not, ever. They hover, get a tooltip, move on. The colors are vestigial.

The direct-labeling fix: monograms with **letters, not colors.** SD for Schema Doctor, CF for Citation Fixer, FA for FAQ Agent. White text on `--color-ink` background, 12px InterDisplay 500. The letter IS the label. Color survives only on the `/crew` page where the agents are introduced. Everywhere else: monograms are letters. The reader learns abbreviations in 3-4 sightings; they never learn 18 colors. **Drop the agent color palette; it is a legend masquerading as a system.**

**The 4-lens pills (`Done · 6` / `Found · 11` / `Researched · 4` / `Changed · 2`) — pristine.** Text + count + dot. The label sits next to the data. No legend. No lookup. Tufte-correct. *This is what every other label on `/home` should aspire to.*

**The `/home` tier badge ("Build · 6 engines · 6 agents") — pristine.** It is direct-labeling at its purest: the tier name, the engine count, the agent count, three facts in one chip with interpunct separators. Indirect would be: a pill that says "Build" and requires the reader to remember what Build includes. Direct is what shipped. Hold the line.

The cumulative call: **Beamix has half-learned direct labeling.** Where it sits next to text (lenses, tier badge, KPI eyebrows), it is correct. Where it sits next to charts (engine dots, agent monograms), it has reverted to color-as-legend. Reverse this. The eye should not bounce.

---

## E — Macro/micro reading rates

A great information graphic supports two reading rates simultaneously: the 5-second glance and the 5-minute study. Tufte called this the macro/micro reading. It is the *defining property* of the John Snow cholera map — at a glance, a cluster of dots near the Broad Street pump; up close, every death geo-coded and every pump enumerated. Same image. Two reading rates.

**`/home` above-fold vs below-fold — score: A.** Beamix's clearest macro/micro success. Above the fold: 5-second read for Sarah (headline + score + delta + status + tier). Below the fold: 5-minute read for Yossi (8 sections of receipts, sparklines, engine breakdown, activity). Same page, both rates, no compromise. The 36px-peek of "This Week's Net Effect" above the fold is the bridge.

**`/scans` table compact rows vs row expansion — score: A.** 44px rows for the macro; click → 360px inline expansion revealing the 4 lenses. *Exactly the move Tufte praised in railroad timetables: the same row reads at index level (city, departure) and at detail level (stops, gauge, locomotive).* The detail page is the third rate. Three rates, one architecture.

**Monthly Update PDF — score: C+.** Cover is macro (30-second forwarding read). Page 5 is micro (Fraunces narrative). Both work.

**The failure is between macro and micro.** Pages 2-4 occupy a middle ground that serves neither rate. Page 2 is half-headline, half-table. Page 3 is one chart and 11 chips. Page 4 is paragraphs of prose. **Too dense to skim, too sparse to study.** Fix: redesign Pages 2-3 as a high-density 2-page spread (small-multiples engine grid + action timeline — see G). Recover Pages 4-5 for narrative.

**`/workspace` step list — score: B-.** Title strip is macro; streaming output is micro. The courier line and walking figure are **decoration occupying the macro/micro bridge.** Cut.

---

## F — Chartjunk audit

Tufte coined the word *chartjunk* in 1983. The definition is precise: chartjunk is graphical decoration that is not data, that the reader could remove without losing information. The test is conservative: would the chart be more legible without this element? If yes, it is chartjunk.

**The Activity Ring (200px, 2px stroke, Rough.js terminus) — chartjunk.** The Ring encodes state via pulse on a 30° gap — one bit of information rendered with a 200px-diameter glyph. *Approximately the same data-ink ratio as a 1980s PowerPoint pie chart with three slices in 36-point Comic Sans.* The defense ("it is identity, not chart") fails because the Ring contains a 96px digit at its center — pretending to be both. **Drop the digit out of the Ring** or drop the Ring. Either it is a chart that should encode multiple variables, or it is a logo that should not contain a digit. Currently it is the worst of both.

**Cream paper on Monthly Update + `/security` — not chartjunk.** Cream signals register, not data. *To Beamix what Bembo on Mohawk Superfine is to my books — seriousness, not decoration.* Permitted.

**Rough.js sigils — mixed.** The **Trace** under recent text is earned material truth: it signals "updated <24h" inline. Tufte-compatible. The **Seal** at artifact close is identity, not chart — permitted on artifact surfaces (broadsheet typesetting tradition). The **Margin** (24px-wide colored circles per `/scans` row) is **chartjunk**: it encodes "which agents touched this row" in colors the reader does not know (see D). The data is already in the row expansion. **Cut the Margin column** and recover 24px for actual data.

**The Brief grounding cell (Fraunces 300 on cream inside Admin Utility) — defended.** The argument *singularity creates weight* survives — it is the only register-shift inside Admin Utility, and it surfaces the constitutional Brief inside the workflow surface that answers to it. Hold it to the Inspector only. If it ever migrates to a second context, it becomes mannerism.

**The walking-figure animation on `/workspace` — chartjunk.** A figure that walks from step to step carrying an emoji prop is narrative theatre, not data. The step circles, line, pulse, and streaming output encode the work. The figure encodes nothing. *Delight that obscures the data is condescension.* Cut it.

The cumulative chartjunk index: **medium-high.** Beamix is data-dense in places but cluttered with sigils and animations that survive on craft argument rather than data argument.

---

## G — Beautiful evidence: the Monthly Update redesign

*Beautiful Evidence* (2006) is a book-length argument that evidence presentation should be **beautiful because it is truthful**, not in spite of it. Galileo's drawings of Saturn (1610) are beautiful because they show what Galileo saw, with nothing added and nothing removed. The Monthly Update is Beamix's most important data artifact — the 6-page PDF Sarah forwards to her CEO to justify $189-499/mo — and it is currently neither beautiful nor evidence in the strict sense. It is editorial writing about evidence, with one chart per page.

**The current spec, audited:**
- **Page 1 (cover):** business name 64px Fraunces, pull-quote 28px Fraunces italic, static Activity Ring 96px with score 48px. Word count: ~30. Charts: 0. **Verdict: identity page, defensible.**
- **Page 2 (lead attribution):** headline-sentence ("47 calls and 12 form submissions"), 16px context paragraph, 11-row attribution table. Charts: 0. Tables: 1. **Verdict: half-empty.**
- **Page 3 (score + trajectory + engine breakdown):** score 96px Fraunces, delta 32px Geist Mono, single 480×120 sparkline with 2 annotations, 11 engine chips. Charts: 1. **Verdict: under-loaded.**
- **Page 4 (what we did):** 5-7 action blocks of prose. Charts: 0. **Verdict: prose about data, not data.**
- **Page 5 (what changed — narrative):** 1-2 paragraphs Fraunces 300 narrative. Charts: 0. **Verdict: editorial — defensible as one editorial page.**
- **Page 6 (what's next + signature):** forward-looking sentences, seal, signature. Charts: 0. **Verdict: closing flourish.**

Total chart count across 6 pages: **one.** Total table count: **one.** This is a 6-page editorial letter that signs itself "evidence" without delivering evidence at the chart-density a CFO expects.

**Beautiful Evidence redesign — the proposal:**

**Page 1 (cover) — keep.** The cover is identity. It earns its sparseness. Hold the design.

**Page 2 (the data spread).** Lead-attribution headline + a horizontal row of 4 micro-charts (calls/day-30d, forms/day-30d, score/week-12w, citations/week-12w), each 120×80px. Below: the **11-engine small-multiples grid** from Section C, Opportunity 1 — 11 sparklines in a 4×3 arrangement, direct-labeled. Page 2 chart count: **15.**

**Page 3 (action timeline as small multiples)** — per Section C, Opportunity 3. One row per agent action: date, monogram (letter, no color), 13px verb+object, **48×16px micro-bar showing score impact**, all bars zero-aligned on the same x-scale. The CFO scans the bar column and sees in 3 seconds which actions moved the score.

**Page 4 (competitor parity small multiples) — new page.** 5 competitors × 4 strategic engines = 20 dual-sparklines, each 120×40px, in a 5×4 grid. Each cell: your line vs theirs over 12 weeks with the gap polygon shaded. Direct-labeled with competitor (left margin) and engine (top margin). **This page does not currently exist.**

**Page 5 (narrative — keep).** Editorial Fraunces 300 is defensible at one page after Page 4's density. The eye needs rest.

**Page 6 (signature — keep).**

**The result:** chart count goes from 1 to ~60 across 6 pages. The artifact becomes evidence in the strict sense. The CFO's 30-second forwarding read becomes "47 calls, 4.2× vs March, climbing on 8 of 11 engines, beating 3 of 5 competitors, 24 actions shipped, +4 points." Renewal-defensible at $499. The current Monthly Update is not.

A typographic discipline to ship alongside: **Geist Mono is the data font, Fraunces is the prose font, Inter is the structural font.** The reader learns the alphabet in 3 sightings: roman = Beamix's voice, mono = the world's facts, italic = an assertion of value.

**The Minard borrow:** design Pages 2-3 to be readable as a single 2-page spread, the way the 1869 Russian campaign chart is designed for one unfolded view. The CFO at 67% zoom sees both pages side-by-side; the small-multiples grids should align across the gutter. *That is Beautiful Evidence-grade.*

---

## H — Direct response to other designer voices

The Master Designer claims "craft IS moat when coupled to product purpose." I am not opposed. I am stricter.

Craft is a *moat* when craft is the medium of the truth. Galileo's drawings of Saturn are craft — careful pencil and ink — but the craft serves the observation. The Bembo-on-cream of my own books is craft, but the craft serves the argument's legibility. The seam-stitched terminus of the Activity Ring, the seeded jitter of the perfect-freehand sparkline, the cream paper of the Monthly Update — these can be craft-as-moat, but only if each one survives the test: *if I removed this craft detail, would the data become harder to read or easier?*

The Trace (Rough.js underline on text updated <24h): if removed, the data ("this thing changed recently") would be harder to read. **Craft as moat.** Keep.

The Margin (Rough.js circles on every table row in agent colors): if removed, nothing of legibility is lost — the data is in the row expansion. **Craft as mannerism.** Cut.

The Seal at artifact close: if removed, the artifact loses identity but no data. *Identity is not data, but identity is part of evidence — Galileo signed his drawings.* Permitted.

The walking-figure animation on `/workspace`: if removed, nothing of legibility is lost. **Craft as mannerism.** Cut.

The position is: *craft survives iff it carries data weight or identity weight at the artifact level.* Decorative craft, however beautiful, is theft from the reader's attention. The Master Designer's claim survives in the strict form. It does not justify the loose form.

---

## I — The Tufte-canonical move Beamix should ship

The move that, if Beamix shipped it, would be cited in the next edition of *The Visual Display of Quantitative Information*:

**The "AI Visibility Cartogram" — a single image that shows, for any business, every AI engine's citation pattern as a small-multiples grid of citations-vs-queries, with the customer's brand and competitors plotted as positions in each cell.**

The mechanic:
- Beamix tracks ~50 priority queries per business (the queries the Brief authorizes).
- For each query, on each of the 11 engines, Beamix knows: was the customer cited? in what position? was a competitor cited instead? in what position?
- The cartogram is a **50 queries × 11 engines = 550-cell grid**, each cell 24×24px (total ~880×600px, single-page artifact).
- Each cell is color-coded: **brand-blue if the customer is cited in a top position, ink-3 if cited but late, paper-elev if not cited, score-critical-soft if a competitor is cited instead.**
- The cell additionally carries a 1-character glyph: position number (1-3) or competitor initial.

The reader scans the cartogram and sees, in one image: *which queries you own, which queries you're losing, which engines are friendly, which engines are hostile.* That is the AI search visibility frontier in one chart. Currently no GEO product in the world ships this. Currently Beamix doesn't either.

The Tufte ancestor: **John Snow's 1854 cholera map.** One image. Every death geo-coded. The Broad Street pump cluster is legible at first glance. Up close, each death is enumerated. Snow's map is the canonical example of macro/micro information design. The AI Visibility Cartogram is the same logic applied to a different epidemic — the disappearance of small businesses from AI search results.

The implementation cost is low. The data is already collected (every scan captures per-engine per-query rank). The renderer is a 550-cell HTML grid with conditional formatting. The SVG can be inlined in the Monthly Update PDF.

The strategic effect: *the cartogram becomes the page Sarah and Yossi screenshot and tweet*. It becomes the page procurement reviewers cite ("this vendor showed me the data in one image"). It becomes the page that survives the forward — when Sarah's CEO opens the email, the cartogram is the first chart they see, and they understand the entire competitive position in 5 seconds.

If Beamix ships this single chart, well-rendered, in the Monthly Update and on `/scans/[scan_id]` and as a public OG image: the product moves from "another GEO dashboard" into the Beautiful Evidence canon. **The cartogram is the Tufte-canonical move.**

---

## Closing — the data Beamix is failing to show

Beamix collects per-engine, per-query, per-week, per-action data — millions of small facts that, when arranged in small multiples, would render the AI search visibility landscape with a clarity no competitor offers. Currently Beamix arranges these facts as one aggregated sparkline, one narrative paragraph, and a Rough.js sigil. The cure is mechanical: cut the sigils that don't carry data weight, drop the path-draw entrance animations, and ship the small-multiples charts the data already supports. *Beamix is one pricing tier away from being the John Snow of GEO; the only thing standing between is the courage to delete decoration and let the data show itself.*
