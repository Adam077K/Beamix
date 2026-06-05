# Design Board 2 — CEO Synthesis of Round 1 Legends
Date: 2026-04-28
Status: Comprehensive change matrix from Rams + Ive + Tufte + Kare reviews. Round 2 (Linear, Stripe, Vercel) and Round 3 (Arc, Notion) blocked on org usage limit — surfaced separately.

---

## How the legends voted on each design move

Format: legend name → position. **Bold = my CEO recommendation.** Voting is informal — 3+ converging legends becomes a strong decision; 2 + supporting context becomes a recommendation; contested splits surface as Adam-decisions.

---

## STRONG CONVERGENCES (3-4 legends agree → CEO recommends action)

### 1. CUT: The Margin column on /scans rows, /workspace steps, /home receipts, /competitors rows
- **Rams:** "vestigial organ. Cut it."
- **Tufte:** "chartjunk. The data is already in the row expansion. Cut the Margin column. Recover 24px for actual data."
- **Kare:** "not a mark. It is a layout slot pretending to be a member of the sigil family. Demote to host/stage."
- **Ive:** nuanced — keeps it but says "needs temporal decay (last week's actions full opacity, last month's at 20%, archived at 6%)"

**CEO call:** **Cut the Margin column from /scans, /workspace, /home Receipts, /competitors rows.** Recover 24px of horizontal real estate per row. Keep the Margin as a *typographic edge* (printer's margin) on Monthly Update PDF + Monday Digest header strip — these are artifacts where the agent fingerprints DO function as a typographic feature. With Ive's temporal decay applied: full opacity for current week, 20% for prior month, 6% archived. **The Margin survives only on artifact surfaces, never on product chrome.**

### 2. CUT: Three motion tokens (ring-pulse, score-fill on returning sessions, microcopy-rotate)
- **Rams:** cut ring-pulse (TopbarStatus dot is enough); cut score-fill (theatre — calculation already completed); cut microcopy-rotate (personality dressed as feedback); cut signature-stroke after seal-draw
- **Tufte:** cut path-draw entrance on sparklines (sparklines are static reading instruments)
- **Ive:** "5 motions share same `cubic-bezier(0.4, 0, 0.2, 1)` curve — fix curves before cuts"
- **Kare:** silent on motion broadly

**CEO call:** **Cut these three:**
- `motion/ring-pulse` → TopbarStatus dot is the canonical "agent acting" signal. Ring stays still.
- `motion/score-fill` on returning sessions only. First-scan-ever keeps the count-up moment.
- `motion/microcopy-rotate` in /workspace → replace with one static "Working." or step-verb-noun summary per step.
- `motion/path-draw` entrance on sparklines → render at full state at t=0.
- `motion/signature-stroke` (the "— Beamix" pen-stroke after seal-draw) → static signature line, opacity-fade only (300ms).

**Keep but re-curve (Ive's fix):**
- `motion/seal-draw` → currently 800ms slow-trace. **Invert to 540ms stamping curve** per Kare's recommendation (path 240ms fast → 100ms hold → 200ms ink-bleed). A seal is stamped, not drawn.
- The 5 motions sharing one easing curve → assign distinct curves per moment (the Seal is signing; the Ring is breathing; the score is landing; the path is drawing; the card is entering — each gets a deliberate curve, not the same shared one).

### 3. KILL: The /onboarding Seal + signature-stroke double ceremony
- **Rams:** cut both motions; keep static seal + static signature
- **Ive:** cut the pen-stroke ("the same gesture twice — like pressing send and then pressing send"); the Seal IS the signature
- **Kare:** invert seal animation to stamping (540ms not 800ms)

**CEO call:** **One ceremony, not two.** The Seal stamps (540ms re-curved per Kare). After it lands, "— Beamix" appears in 300ms opacity fade — no stroke-draw, no letter-by-letter pen-stroke. The Seal is the signature; the typed wordmark is the read-back.

### 4. CUT: The /inbox approve-button-hover Seal foreshadowing
- **Rams:** "the seal is announcing itself before authorship has occurred. Theatre. Cut."
- **Kare:** "foreshadowing-on-hover is precious. Animate on the click, not the hover."

**CEO call:** **Cut.** Seal-draw fires on click (the moment of authorship), never on hover. Two legends explicit; no defenders.

### 5. RENAME: Engine abbreviation "AI" → "AO"
- **Kare:** "AI Overviews → AI is a category-name collision in a product literally about AI. 30-second fix prevents 6 months of support tickets."

**CEO call:** **Rename.** Also audit CG (ChatGPT) vs GR (Grok) at 11px — Kare suggests CG → GP (or CT). MS (Bing Copilot) → CP. Render all 11 side by side at 11px and confirm legibility before lock.

### 6. CUT: Per-engine sparkline color-fade-from-ink-4-to-brand on /scans detail
- **Tufte:** "double-encodes time. Moiré of meaning. The x-axis already encodes time."

**CEO call:** **Cut the gradient.** Single 1.5px brand-blue stroke on every per-engine mini-sparkline.

### 7. CUT: The 80ms stagger on Rivalry Strip dual-sparkline
- **Tufte:** "creates hierarchy where there should be parity. The data is the parity."

**CEO call:** **Cut.** Both lines render simultaneously, instantly, static.

### 8. CUT: Workflow Builder agent node redundant identifications
- **Tufte:** "24px category header + 16×16 monogram + 1px agent-color stripe + 12×12 status token = four redundant identifications of the same agent. Cut three of four."

**CEO call:** **Keep header strip (color-coded by category — agent/trigger/action) + status token. Cut the 1px agent-color left stripe AND the 16×16 monogram inside the body** — header carries the identity; status carries the state.

### 9. TIGHTEN: Workflow Builder node dimensions 240×88 → 220×72
- **Kare:** "240×88 reads as form-field, not symbol. Compare to React Flow exemplars (Retool, Make, n8n at their best): ~180-200×56-64px."

**CEO call:** **Tighten to 220×72.** Drop the config-summary line into the inspector (already truncated; user clicks into inspector anyway).

### 10. FIX: Connection handles visible at low priority always
- **Kare:** "A handle invisible until hover is a discoverability bug, not a design choice. n8n got this right; copy n8n. 1px ink-4 ring, 6×6 always; brighten to brand-blue dot on hover."

**CEO call:** **Visible at low priority always.**

### 11. ENGINES STAY CLEAN — no Rough.js on engine bubbles in /scan storyboard
- **Kare:** "We drew our crew; we did not draw OpenAI. Hand-drawn discipline is reserved for Beamix's actors. Engines wear clean rectangles, no jitter, no per-engine seed."

**CEO call:** **Engines clean.** /scan Frame 4 engine bubbles → 96px clean circles (no Rough.js). EngineChip stays clean rectangle. **Hand-drawn = Beamix-internal only.**

### 12. AGENT MONOGRAMS: Lock 2-letter MVP + 18 unique glyphs by month 6
- **Kare:** "Three of your 18 agents start with C. Schema Doctor S, Citation Fixer C, Content Refresher C, Competitor Watch C. Single-letter is collision. Lock 2-letter (SD, CF, CR, CW) for MVP scaffolding. Commit to 18 unique hand-drawn glyphs by month 6 — otherwise scaffolding calcifies into Slack-avatar territory."

**CEO call:** **Lock 2-letter monograms across all surfaces, InterDisplay 500 caps, same Rough.js-circle-with-deterministic-seed treatment.** Below 16px, drop letters → color disc only (color does the work at small scale). Add to roadmap: 18 unique glyphs by month 6 — this becomes a real design project post-MVP.

### 13. LOCK: All 18 agent colors NOW (no more "cycle through palette")
- **Kare:** "Eleven agents have arbitrary leftover colors. Lock all 18 with cultural-readability test on cream paper at 12px."

**CEO call:** **Lock all 18 colors before MVP.** Test at 12px on cream paper to confirm discrimination. Document in design system as canon. Test pairs adjacent on Margin column for color-blob risk.

### 14. SIZE-CONDITIONAL MONOGRAM RENDERING
- **Kare:** Three sizes, three treatments, no hybrid: under 16px = color disc only; 16-32px = 2-letter monogram; above 48px = 2-letter + name label below.

**CEO call:** **Lock the size table.** Document as a design system rule.

---

## TWO-LEGEND CONVERGENCES (CEO leans yes)

### 15. CUT: Activity Ring's 1500ms ring-draw entrance animation on /home boot
- **Rams:** "1.5 seconds is fashion, not communication. An image that survives 50 years does not perform on entrance."
- **Ive:** "Ring is the photograph, not the performance. Customers screenshot it because it's calm, not because it animates."
- **Tufte:** Ring is chartjunk regardless

**CEO call:** **Cut the entrance animation.** Ring renders at full geometry at t=0. **Combined with #2 above (cut ring-pulse), the Ring becomes a still photograph.**

### 16. KEEP cream paper on /security (reverses my earlier surface read)
- **Ive:** "white-paper-island on cream is the typographic equivalent of a glass case in a wood-panelled room. Cream does emotional work; white does factual. Stripe doesn't do this. Vercel doesn't do this. It's Beamix's, and it's right."
- **Tufte:** "Cream signals register, not data. Permitted."
- **Rams:** "Cut to white. Aria reads facts faster on white."

**CEO call:** **KEEP cream paper on /security.** 2-of-3 legends defend it. Rams' position is principled but minoritarian. The Ive insight — cream does emotional work, white does factual — is the right architectural defense.

**IMPROVE:** Per Ive, **redo the cream paper hex selection.** Don't ship #F7F2E8 as a guess. Print 3 swatches (#F7F2E8, #F4ECD8 — Stripe Press's actual cream — and one between), photograph under 3 light conditions, view on 3 displays. Lock the chosen hex. The MOST consequential color in the system; deserves the work.

### 17. KEEP cream paper + Fraunces on Workflow Builder Brief grounding cell
- **Ive:** "the closest thing in the system to a moment of poetry. The iPhone-unlock-animation of this product."
- **Tufte:** "Defended IF held to the Inspector only. Singularity creates weight."
- **Rams:** "Cut to 1px brand-blue rule + Inter italic. 30% of the visual cost."

**CEO call:** **KEEP the cream + Fraunces 300 italic Brief grounding cell.** 2-of-3 defend — and they defend it specifically because it's the *only* register-shift inside Admin Utility, which makes it carry weight. Rams' alternative (1px rule + Inter italic) preserves structural commitment but loses the constitutional weight.

**IMPROVE:** Per Ive — **first-time-per-session moment is different.** First selection: cell fades in over 400ms with one-time Trace under the clause. Subsequent selections: 120ms fade. The constitution feels invoked, not routine.

### 18. ADD: Brief grounding inline citation on every action (the structural commitment)
- **Rams:** Champion move. "Every node, every recommendation, every published change, every Inbox row carries an inline citation back to the Brief clause that authorized it. 1px brand-blue rule + label + Inter italic quoted clause + 'clause 2 of 4 · Edit Brief →'. Uncopyable not because it is a graphic treatment but because it is a structural commitment."
- **Ive:** Distinct but related — "Give the Brief a binding. A small Fraunces line, 13px italic, anchored to the bottom of every product page rotating daily through clauses."

**CEO call:** **SHIP BOTH** — they're complementary, not redundant.
- **Rams' move:** Every agent action everywhere (Inbox row, /workspace step, /scans Done lens, Workflow Builder node) carries inline `Authorized by your Brief: "[clause text]" — clause N · Edit Brief →` in the visual treatment Adam picks (cream cell only in Workflow Builder Inspector per #17 above; 1px rule + Inter italic everywhere else).
- **Ive's move:** Every product page bottom carries a small Fraunces 300 italic line rotating daily through the four Brief clauses. *Silent furniture, not a notification.*
- Combined: the Brief becomes ubiquitous + grounded. Constitutional doctrine made visible everywhere.

### 19. CUT: Trace surfaces from 9 → 4
- **Rams:** "Reduce to 4 surfaces: /home recent-activity, /competitors editorial summary, /workspace step output, Monday Digest header."
- **Kare:** "Trace is a *behavior*, not a member of the sigil family. Demote it from mark to behavior."

**CEO call:** **Reduce Trace to 4 surfaces** (per Rams). **Demote Trace in design system from "mark" to "behavior of text Beamix touched ≤24h"** (per Kare). The 4-mark sigil family becomes 3 marks (Ring, Seal, Monogram) + 1 behavior (Trace) + 1 host (Margin). Cleaner typology.

### 20. SCALE: Favicon = Seal, NOT Ring
- **Kare:** "At 16×16, the gap collapses, the terminus dot disappears. The favicon is not the Ring; the favicon is the Seal at 16×16."
- **Rams:** consistent with discipline at small sizes

**CEO call:** **Lock: favicon and topbar 24px sigil mark = the Seal, not the Ring.** Document the size table. Ring is reserved for /home above-fold + /scan public + Monthly Update PDF (96px+).

### 21. LOCK: Seal geometry this week (currently under-specified)
- **Kare:** "The most important mark in the system and the least specified. Lock total path length, stroke width per size, corner roundness, gap proportion, optical center. The Seal at 16×16 is a separately-tuned 16×16 version, not the 32×32 scaled down."

**CEO call:** **Tier 0 design task:** spec the Seal geometry per size (16, 20, 24, 32, 48). Test static (no animation) at each size on white paper, cream paper, and PDF. Cultural-readability audit: not Star of David (six-pointed), not Christian cross — lock as **4-pointed asterisk OR chamfered plus sign**. Document in brand guidelines explicitly.

### 22. CUT: Seal contexts from 7 → 5
- **Kare:** "Drop /inbox approve-hover (it's animation theatre — see #4) and /scan public artifact footer (a permalink page, not an artifact being signed). Keep: PDF top, PDF bottom, Brief approval, OG share card, Monthly Update email header."

**CEO call:** **Cut to 5 contexts.** Scarcity is what makes a seal carry weight.

---

## SINGLE-LEGEND PROPOSALS WORTH SHIPPING (CEO recommends)

### 23. The deterministic seed-per-agent fingerprint as a function-spine
**Kare's MoMA-grade move:** `seed(agentUuid) → path` is one function generating each agent's fingerprint everywhere — monogram, Margin mark, Trace path, PDF signature, OG card, email header. The same drawn shape recurs across every surface for that agent. Document the function in the brand spec, not the codebase. **The brand becomes the function.** Copying the function = copying the company.

**CEO call:** **SHIP.** This is the most uncopyable move surfaced in this round. Kare argues this is the move that lands in MoMA in 30 years — a small, consistent, generative system that compounds across every surface. Three locks required:
1. The seed-to-path function is brand canon, not codebase. Changing it across versions is forbidden the way changing the Apple logo is forbidden.
2. The fingerprint appears at every scale, in every register. The 96px hero monogram is the same path as the 12px Margin mark — same seed, scaled.
3. The set is not 18 monograms; it is the *function*. Don't design 18 monograms one-by-one. Design *one rule* that produces 18 fingerprints from 18 UUIDs.

### 24. The AI Visibility Cartogram (Tufte's John Snow move)
**Tufte's Beautiful-Evidence-canon move:** A 50-queries × 11-engines = 550-cell grid. Each cell color-coded (brand-blue = customer cited top position, ink-3 = cited but late, paper-elev = not cited, score-critical-soft = competitor cited instead) + 1-character glyph (position number or competitor initial). Total ~880×600px, single-page artifact.

**Reader scans the cartogram and sees in one image: which queries you own, which you're losing, which engines are friendly, which are hostile.** Currently no GEO product ships this. Currently Beamix doesn't either. The "John Snow cholera map of GEO."

Place: /scans/[scan_id] detail, Monthly Update Page 2, public OG image.

**CEO call:** **SHIP.** This is potentially category-defining. The data is already collected (every scan captures per-engine per-query rank). The renderer is a 550-cell HTML grid with conditional formatting. Implementation cost: low. Strategic effect: the cartogram becomes the page Sarah and Yossi screenshot and tweet. Add to PRD v2 as F22.

### 25. The Cycle-Close Bell (Ive's intentional moment)
When the weekly scan completes and all auto-fixes have shipped, the Activity Ring closes its 30° gap over 800ms, holds 600ms, and re-opens. **What Ive adds:** at cycle-close, the surrounding KPI sparklines briefly settle to final positions (200ms ease) AND the status sentence rewrites once: *"Healthy and gaining" → "Cycle closed. {N} changes shipped this week."* The page becomes, for two seconds, a closing curtain. Equivalent of Apple Watch's haptic acknowledgment when you close your rings.

**CEO call:** **SHIP.** Costs ~2 days of frontend work. Earns customer attention every Monday morning forever.

### 26. The Brief Re-Reading (Ive's quarterly moment)
Once per quarter, when customer logs in for the first time on Monday, Beamix opens — for three seconds — to the Brief, not /home. Cream paper, Fraunces clauses, one editorial line: *"It's been three months. Anything to update?"* Click "Looks good" → Brief gets fresh date stamp; quarter starts. Click "Edit Brief" → enters editing flow. Most quarters: customer clicks "Looks good" in 1.5 seconds.

**CEO call:** **SHIP.** Closer to LoveFrom royal cypher than to any SaaS interaction. Constitution stays alive. Costs ~3 days of work.

### 27. The Receipt That Prints (Ive's morning-of moment)
On the morning the Monthly Update is generated, /home shows a single new element above the Evidence Strip — small cream-paper card 96px tall, Rough.js fold mark down its centre, date stamp in Geist Mono, one Fraunces 300 italic line: *"Your Monthly Update is ready."* Animates in once with 600ms paper-fold motion (clip-path mimicking sheet sliding). Stays for 24 hours, then files itself into /reports.

**CEO call:** **SHIP.** Apple-Watch-birthday-confetti for SaaS. The day-of moment.

### 28. The Print-Once-As-Gift artifact (Ive's $14 move)
Month 6: one printed Monthly Update arrives at customer's office, unannounced. Heavyweight cream paper, same Fraunces typesetting, wax seal letterpressed (real, not Rough.js). Beamix bookmark inside. **Costs $14. Earns a tweet that costs $0 to acquire.** Apple did this with "Designed by Apple in California" book.

**CEO call:** **SHIP at month-6 milestone (post-MVP).** Add to growth/retention experiments. This is the move that converts a customer into an evangelist.

### 29. Print-the-Brief button at end of onboarding
**Ive:** "When the Brief is signed at end of onboarding, offer — once, never again — a 'Print this Brief' button. Single A4 page, cream-paper editorial register. Most customers won't click. The 7% who do will pin it to a wall."

**CEO call:** **SHIP.** Zero engineering cost — React-PDF infrastructure exists for Monthly Update. Smallest move in the list, highest return per pixel.

### 30. The "What Beamix Did NOT Do" line on Monthly Update
**Rams:** One line near closing seal: *"Beamix considered 14 changes this month and rejected 6. Rejection log: [link]."*

**CEO call:** **SHIP.** Converts restraint into a visible product feature. One line of Inter; massive trust signal.

### 31. The printable A4 ops card in /settings
**Rams:** A single sub-page that, when printed at A4 portrait, produces a one-page card: Truth File essentials, active workflows, active agents, next 3 fire times. Geist Mono, ink, no decoration.

**CEO call:** **SHIP.** Yossi will print one per client. Marcus will pin one. Total cost: one page, one print stylesheet.

### 32. Replace Workflow Builder dot grid with cream paper canvas
**Ive:** "Delete the dot grid. Replace with cream paper at 30% over paper-default. The canvas becomes a sheet of paper on which workflows are composed. With the dot grid it is a competent DAG editor; without it, it is the only DAG editor that feels like writing."

**CEO call:** **SHIP.** Single change makes Workflow Builder unmistakably Beamix's. Zero engineering cost (background change). **Rejects** the prior Designer's "Admin Utility = clinical canvas" position. Adam decision needed if you want to honor the original Designer's call — but Ive's version is sharper.

### 33. Replace /workspace walking figure with execution-as-narration column
**Tufte:** "Walking figure is decorative theatre. Cut."
**Ive:** "Each node, while executing, briefly pushes a sentence of plain English to a reading column on the right — replacing the inspector temporarily. *'Schema Doctor is reading /pricing for FAQPage schema. 2.3 seconds.'* The execution becomes narration."

**CEO call:** **CUT walking figure (Tufte) + ADD narration column (Ive).** The narration replaces the figure. Honors Adam's stated vision (agents at work, visible) without the chartjunk. Costs ~3 days less than building the walking gait animation.

**Note:** This contradicts Adam's earlier directive on the courier-flow visual. **Surfacing for Adam's lock.**

### 34. Voice canon polish: "refuses to publish" → "cannot publish" (/security §9)
**Ive:** "Refuses is volitional and slightly defensive; cannot is mechanical and final. Aria forwards 'cannot.' He hesitates over 'refuses.'"

**CEO call:** **SHIP.** One word change. Massive trust signal.

### 35. Visual register count: 4 → 3
**Rams:** "Editorial Artifact + Journey Canvas overlap by 80%. Collapse to: **Artifact** (cream, signed), **Working** (white product chrome), **Disclosure** (white, clinical, dateline-stamped — /security, /legal, /pricing receipts)."

**CEO call:** **Collapse to 3.** Document in design system as canon. Cleaner typology; fewer rule-bending exceptions.

### 36. Monthly Update Page 4 redesign as small-multiples action timeline
**Tufte:** "Currently 5-7 prose action blocks. Words about data, not data. Replace with one row per agent action: date + monogram + 13px verb-noun sentence + **48×16px micro-bar showing score impact**, all bars zero-aligned on same x-scale. The reader scans the bar column and sees in 3 seconds which actions moved the needle."

**CEO call:** **SHIP.** Massive density gain on the renewal-anchor artifact.

### 37. Engine micro-strip per /scans row replacing 11 colored dots
**Tufte:** "11 engine dots at 8px diameter color-encoded by score band — invisible legend, the worst kind. Replace with 56px-wide engine micro-strip per row showing 11 columns at 4px wide, each column's height (0-12px) encoding the engine's *delta* on this scan. Direct-readable as a sparkbar. Hans Rosling at table-row scale."

**CEO call:** **SHIP.** Eliminates legend lookup; turns row-level data from "color band of unknown engine" to "delta vector across 11 engines." Massive readability gain.

---

## CONTESTED — ADAM DECISION REQUIRED

### A. The Score+Ring conflict (Tufte's sharpest critique)
- **Tufte:** "The Ring is a logo dressed as a chart. 622px of stroke encoding 1 bit. Either drop the digit out of the Ring or drop the Ring. Currently the worst of both."
- **Ive:** Defends — "Ring is a frame, not a measurement. The arc says *the work continues*; the number says *where the work has gotten to*. Frame and figure, separated."
- **Rams:** Keeps geometry but cuts entrance animations
- **Kare:** Keeps Ring at hero scale only; calls it "the strongest of the four" sigils

**Tension:** 3-of-4 keep the Ring with refinements. Tufte is the lone strong-cut voice. **My recommendation: KEEP** the Ring as frame + drop ring-pulse + drop ring-draw entrance animation (per #2 + #15). Accept Tufte's data-ink-ratio critique as a tension we live with — the Ring's purpose is identity, not chart. **Need your lock.**

### B. The single-character "Beamix" voice canon vs LoveFrom-style ceremonial
**Original Designer's position (locked at board):** Voice Canon Model B — "Beamix" externally; agents named in product surfaces.

**Ive's challenge in his Section G:** Build a "binding" — a Brief clause anchored to the bottom of every product page. This implicitly questions whether the single-character voice should be the only canon, or whether the constitution (Brief) deserves co-equal voice presence.

**My read:** Ive isn't actually breaking voice canon — he's saying the Brief deserves more visual presence. **The two are complementary, not contradictory.** Recommendation: ship Ive's binding (#18) WITHOUT changing voice canon. Voice = "Beamix"; constitution = "your Brief" with the actual clause text. Different roles.

**Need your lock if you read the tension differently.**

### C. The Workflow Builder dot grid vs cream-paper canvas
- **Original Designer:** dot grid (Admin Utility = clinical canvas)
- **Ive:** cut dot grid, replace with cream paper at 30% (canvas-as-page)

**My recommendation: Ive's version.** But this contradicts the original spec and the locked "Admin Utility = clinical" register rule. Adam decision.

### D. The walking figure on /workspace (your stated vision vs board cut)
- **Adam's earlier directive:** "agent like a team member walking around with tools" — courier-flow animation
- **Tufte:** kill walking figure (decorative theatre)
- **Ive:** replace with execution-as-narration column

**My read:** I'd kill the walking figure and add the narration column (Ive's version). The narration honors the spirit of your vision (agents-at-work visible, attributed, real) without the chartjunk problem. **But this is a personal Adam directive.** Need your lock.

### E. Rough.js per-render variance (Ive) vs deterministic seed (Kare)
- **Ive:** "Either commit to per-render variance and let the seam be alive, or remove Rough.js entirely. The middle position is theatre."
- **Kare:** "The seed-to-path function is part of the brand spec, not the codebase. Make it the spine of the system. Same fingerprint per agent forever."

**Direct contradiction.** Kare's MoMA move (#23) requires deterministic seeds. Ive says deterministic seeds are theater.

**My recommendation: Kare's deterministic-seed-per-agent.** Reasoning: Ive's per-render variance argument applies when the marks would be cheap and disposable. Kare's argument is that *brand recognition* requires consistency — Schema Doctor's specific scribble being the same across 3,000 sightings is what makes it a fingerprint. Ive's logic is more aesthetically pure; Kare's is more strategically powerful. For a product trying to disrupt a category, fingerprint > variance.

**But this is a real choice. Need your lock.**

---

## ADD TO PRD v2 / NEXT BUILD

The following items become new acceptance criteria or feature additions:

| ID | Item | Priority | Effort |
|---|---|---|---|
| F22 | AI Visibility Cartogram | MVP | ~5 person-days (renderer + Monthly Update integration + OG card) |
| F23 | Cycle-Close Bell | MVP | ~2pd |
| F24 | Brief Re-Reading (quarterly) | MVP | ~3pd |
| F25 | Receipt That Prints (morning-of card) | MVP | ~1pd |
| F26 | Print-Once-As-Gift (month 6) | Post-MVP | ~$14/customer + logistics |
| F27 | Print-the-Brief button at onboarding end | MVP | <1pd |
| F28 | "What Beamix Did NOT Do" Monthly Update line | MVP | <1pd |
| F29 | Printable A4 ops card in /settings | MVP | <1pd |
| F30 | Brief grounding inline citation everywhere (Rams' structural commitment) | MVP | ~3pd (per-action citation rendering) |
| F31 | Brief binding line on every product page (Ive's ambient brand) | MVP | ~1pd |

---

## SURFACE-BY-SURFACE CHANGE SUMMARY

| Surface | Major changes |
|---|---|
| **/home** | Cut ring-pulse + ring-draw entrance + score-fill on returning sessions. Drop Margin column from Receipts. Ring becomes still photograph. Add Cycle-Close Bell on Mondays. Add Brief binding line at page bottom. Add Receipt-That-Prints card on Monthly Update day. Replace single aggregate sparkline with 11-engine small-multiples grid (potentially). |
| **/scans** | Cut Margin column → recover 24px. Replace 11 engine dots with engine micro-strip (sparkbar). Add small-multiples grid in row expansion. Cut path-draw animations on per-engine sparklines + cut color gradient. |
| **/competitors** | Cut 80ms stagger on Rivalry Strip. Cut path-draw entrance animation. Add small-multiples grid for drill-down (5 competitors × 11 engines = 55 dual-sparklines). |
| **/workspace** | Kill walking figure. Add execution-as-narration column on right. Cut microcopy-rotate. |
| **/inbox** | Cut Seal-on-hover foreshadowing (animate on click only). Reduce Trace surfaces. |
| **/onboarding** | One ceremony, not two. Re-curve seal-draw to 540ms stamp. Cut signature-stroke pen-stroke; replace with 300ms opacity fade. Add "Print this Brief" button at end. Add escape hatch on Step 3 (already locked). |
| **/security** | KEEP cream paper register. REDO the cream hex selection properly. Apply Ive's word change ("cannot publish"). |
| **/crew** | Lock 2-letter monograms across all surfaces. Lock 18 colors. Demote Margin from sigil to host. Tighten Workflow Builder agent nodes 240×88 → 220×72. Make connection handles always-visible at low priority. Add Brief binding line. |
| **Workflow Builder** | KEEP cream Brief grounding cell + first-time-different mechanic. Replace dot grid with cream paper canvas. Cut redundant agent identifiers in node anatomy. Add execution narration during dry-run. |
| **Multi-client switcher** | Add Brief binding line at footer. Engine abbreviation rename "AI" → "AO". |
| **Monthly Update PDF** | Page 2 redesign: lead-attribution headline + 4 micro-charts row + 11-engine small-multiples grid. Page 3 redesign: action timeline as small-multiples (date + monogram + verb-noun + 48×16 micro-bar). Page 4 NEW: 5 competitors × 4 strategic engines parity grid. Add "What Beamix Did NOT Do" line at closing seal. Margin (typographic edge) survives here with temporal decay. |
| **Monday Digest email** | Margin (typographic edge) survives with temporal decay. |
| **Design System** | Visual registers: 4 → 3 (collapse Editorial Artifact + Journey Canvas to "Artifact"). Sigil family: 4 → 3+1+1 (Ring, Seal, Monogram + Trace as behavior + Margin as host). Lock seal geometry per size. Lock 18 agent colors. Lock 2-letter monogram system. Cut motion tokens: ring-pulse, score-fill on returning, microcopy-rotate, signature-stroke after seal, path-draw entrance on sparklines. Re-curve seal-draw to 540ms stamping. Document deterministic-seed-per-agent function as brand canon. |

---

## WHAT'S MISSING — THE 3 LOST VOICES (Round 2 + 3 blocked)

Worth surfacing what we couldn't get:

- **Linear (Karri Saarinen) lens** — speed audit, keyboard discipline, density vs whitespace, dark mode pressure-test (Beamix deferred dark mode; Linear ships parity), the missing /changelog as canon
- **Stripe lens** — direct comparison of /security vs stripe.com/security, Monthly Update PDF as Stripe Press, the long-form artifact missing at MVP, gradient-as-brand audit
- **Vercel/Rauno lens** — distinct curves per motion moment, walking figure defense or alternative, Workflow Builder canvas physics, bundle craft audit, Geist + typography stack pressure-test
- **Arc / Browser Company** — pressure-test the voice canon Model B; *"what if Beamix were character-led, not single-character?"*
- **Notion / Ivan Zhao** — pressure-test the page-set spine; *"what if Beamix were composable like blocks, not pages?"*

When the org usage limit refreshes, run these. Three reasons:
1. **Stripe specifically** would change /security materially (they're THE exemplar; Rams + Ive + Tufte all referenced Stripe but only as memory)
2. **Vercel/Rauno specifically** would resolve the motion vocabulary surgery — they're the only voice that's lived inside motion-as-product-language
3. **Arc + Notion** are the alternative-vision voices — they're the only ones who'd push past current frame entirely

---

## TOP 5 TAKEAWAYS

1. **The Margin is not earned — cut from product chrome, keep on artifacts only with temporal decay.** Three legends explicit. Frees ~24px per row across /scans, /workspace, /home, /competitors.

2. **The deterministic seed-per-agent fingerprint as a function-spine is the single most uncopyable craft move.** Kare's MoMA-grade move. Ship it: one function, every agent's fingerprint everywhere, brand canon not codebase.

3. **The AI Visibility Cartogram is the category-defining Beautiful Evidence move.** Tufte's John Snow comparison is real. 550-cell grid showing every business's entire AI search visibility frontier in one image. No GEO competitor has shipped this. Ship it.

4. **Motion vocabulary needs surgery — cut 3 tokens, re-curve 5+.** ring-pulse, score-fill (returning), microcopy-rotate, sparkline path-draw, signature-stroke pen-stroke all cut. Seal-draw re-curved to 540ms stamping.

5. **Add 5 intentional moments that cost almost nothing and earn evangelism:** Cycle-Close Bell (Monday-morning curtain-close), Brief Re-Reading (quarterly), Receipt-That-Prints card, "What Beamix Did NOT Do" line, Print-the-Brief button. Plus the month-6 $14 unsolicited printed Monthly Update for a single tweet-magnet moment.

---

*End of CEO synthesis. Decision-ready for Adam's confirmations + the 5 contested locks (Score+Ring, voice/Brief tension, dot grid vs cream canvas, walking figure, Rough.js variance vs determinism).*
