# Board Seat 1 — The Reductionist Critique
**Reviewer persona:** Dieter Rams / Jony Ive / Linear / Craig Mod school
**Target:** `docs/08-agents_work/2026-04-24-DESIGN-DIRECTION-v2.md` (651 lines, dated 2026-04-24)
**Position:** Adversarial. Subtraction-first. No hedge.

> "Good design is as little design as possible." — Dieter Rams, Ten Principles ([vitsoe.com/rw/about/good-design](https://www.vitsoe.com/rw/about/good-design))
> "We spent a lot of time making it look like we hadn't spent any time." — attributed to the Linear team ([linear.app/now/quality-wednesdays](https://linear.app/now/quality-wednesdays))

---

## 1. WHAT V2 GETS RIGHT (brief)

1. **Frequency-aware animation rule** (v2 §Motion, rule "Entrance animations on every page load for returning users") — correctly stolen from Rauno ([rauno.me/craft/interaction-design](https://rauno.me/craft/interaction-design)). Non-negotiable.
2. **`prefers-reduced-motion` mandate** (v2 §Choreography Rules, final bullet) — correct. Every serious product honors this in 2026.
3. **Phase 0 quick wins** (v2 §Phase 0) — the 10 audit-driven fixes (InterDisplay load, banned hex purge, tinted-square retirement, Zap-icon replacement, sidebar active state, rounded-full → rounded-lg, Inbox action wiring) are 100% correct. Ship these this week. None of my critique applies to Phase 0.
4. **Kill Excalifont** (v2 §Typography, "Retire") — correct instinct, one less moving part.
5. **Ban `transition: all`, ban `scale(0)`, ban looping decorative animation, ban width/height animation** (v2 §Anti-Patterns 2, 3, 4, 5) — standard discipline, correctly cited.
6. **Brand blue locked at #3370FF, no dark mode at launch** (v2 last line + §Color System footer) — scope restraint, appropriate.
7. **Tabular numerals mandatory on numeric data** (v2 §Typography) — correct, cheap, invisible, high-ROI.
8. **Re-watch scan button on cached data** (v2 §Stage Pattern, Exit) — respectful, replayable, doesn't force the show on returning users.

That's the honest list. Everything else, I'm going to fight.

---

## 2. WHAT V2 GETS WRONG — THE MAIN EVENT

### Attack 1 — The thesis smuggles in a false dichotomy
**v2 claim (line 8):** "Beamix is a professional AI-partner that makes invisible, complex agent work watchable and legible for non-technical SMB owners … a stage where agents perform work the user can observe, not a dashboard where the user must interpret data."
**Counter:** This frames the choice as "watchable stage vs illegible dashboard." That is a false binary. **Legibility ≠ watchability.** Linear's dashboard is extremely legible with zero stage theater. A dashboard is illegible when it has too many widgets, not because it lacks a courier. The thesis justifies a character and a stage by pinning a strawman ("the 10,000-dashboard Shadcn-card-grid") to the only alternative. There is a third option v2 never considers: **a calm, legible dashboard with exceptional typography, no stage, no character.**
**Replacement:** "Beamix is the fastest, calmest way for an SMB owner to see where they stand in AI search and act on it. The product's proof is the score arriving in under 15 seconds and the recommendations being correct — not a 30-second performance."

### Attack 2 — "Design moat = 3 unclaimed gaps" conflates novelty with value
**v2 claim (line 14):** "These three gaps — animated agent execution, character companion, proactive Inbox — are 100% unclaimed territory … Shipping before any competitor copies even one of them is the design moat."
**Counter:** "No one else has it" is not a moat — it's frequently evidence no one else wanted it. Clippy was unclaimed territory too. The moat in SMB tools is reliability + speed + price. Linear's moat isn't their font stack, it's that bugs close. A 30-second animation is the easiest thing on that list for a competitor to copy in a sprint; the hard thing to copy is "the scan returns in 12 seconds and the recommendation is actually right." v2 is spending the design budget on the easy-to-copy moat and underspending the hard-to-copy one.
**Replacement:** Re-frame the moat as (a) scan correctness, (b) recommendation quality, (c) speed-to-value (under 15s). Design serves those. The companion doesn't.

### Attack 3 — 12 Beamie behavior rules is a spec for an OS, not a feature
**v2 claim (§12 Behavior Rules, lines 30–106):** 12 distinct rules covering default state, appearance, active state, gaze, pointing, speech, drag, dismiss, onboarding, working-vs-idle, silence timeout, anti-Clippy clauses.
**Counter:** Each rule sounds defensible alone. Together they form a 76-line spec before a single recommendation card is designed. This is the exact profile of features that ship late and half-working. Notion AI's BUCK case study ([buck.co/work/notion-ai](https://buck.co/work/notion-ai)) — v2's own primary source — described a character with **one surface (the AI panel)** and **three states**, built by a dedicated studio over months. v2 proposes 8+ states, 5 page-specific behaviors, a drag mechanic with localStorage persistence, right-click dismissal with 24h cooldown, onboarding tour with skip-once logic, per-element-per-user dismissal DB tracking, a gaze-vector rotation system with target halo, and an inline text field with natural-language routing to "existing API endpoints" (which don't exist yet). **This is 4–6 engineering weeks of work before the first user benefit.**
**Replacement:** If a companion exists, it has 3 rules total: (1) a dot in the corner that breathes when idle and pulses blue when an agent runs, (2) click opens the same inline chat component you were going to build anyway, (3) right-click hides it forever. Every other rule is Phase 3 or never.

### Attack 4 — 30-second full-page modal is hostile to returning users
**v2 claim (§The Stage, line 167):** "The scan IS the experience — the user should not be able to scroll away during the 30-second flow. This is intentional: the flow is the product's proof-of-work."
**Counter:** Read that sentence again. "**The user should not be able to scroll away.**" That is a designer defending a forced 30-second modal on a **dashboard product people visit daily**. This violates Rauno's frequency-aware rule ([rauno.me/craft/interaction-design](https://rauno.me/craft/interaction-design)) which v2 cites approvingly 200 lines earlier. It violates Emil's "never animate keyboard-initiated actions" ([emilkowal.ski/ui/you-dont-need-animations](https://emilkowal.ski/ui/you-dont-need-animations)) — if I hit Enter on "Run scan," I should not be held hostage for 30 seconds. Perplexity's scan UI takes ~15s and shows a step list you can scroll past. v2's own research doc ([2026-04-24-R2-research-motion-pmf.md line 325](../../2026-04-24-R2-research-motion-pmf.md)) estimates the welcome scan at **8–12 seconds** — and then v2 (line 136) extends it to 30. The 30-second number has no research backing in v2's own cited sources.
**Replacement:** Scan UI = step list + progress strip, 8–12 seconds, skippable, non-modal. See §4 below.

### Attack 5 — Five "signature motions" is four too many
**v2 claim (§The 5 Signature Motions Beamix Owns, lines 222–230):** Scan Reveal + Agent Pulse + Score Gauge Fill + Recommendation Cascade + Completion Settle.
**Counter:** Rauno's frequency-aware rule again: **common interactions get minimal motion**. A product with five repeating motions has no signature — it has five signatures, which means zero. The Score Gauge Fill plays every scan. The Recommendation Cascade plays after every scan. The Completion Settle plays after every agent run. The Agent Pulse plays whenever any agent works. The Scan Reveal plays on every scan. Every one of these is a daily-repeat interaction. Five animations competing for the user's attention is noise, not identity. Linear has effectively **one** signature motion: the cubic-bezier transition of issue rows. That's it. Raycast's "signature" is speed (absence of motion). What does Beamix remember as its **one** thing? v2 doesn't know, so it kept all five.
**Replacement:** Keep Score Gauge Fill. Delete the other four. Rationale in §5.

### Attack 6 — Rive + Framer Motion + InterDisplay + Inter + Geist Mono + Fraunces + Lucide + commissioned engine SVGs is a stack, not a system
**v2 claim (§Motion Tech Stack, lines 259–266 and §Typography):** Motion (Framer Motion) primary, Rive for character, Lucide for icons, commissioned SVGs for 7 engine logos, 4 fonts (Inter + InterDisplay + Fraunces + Geist Mono).
**Counter:** Count the dependencies: Framer Motion (~40KB), `@rive-app/react-canvas` (~100KB), four Google-font subsets (~80–150KB combined), a Rive `.riv` file for the character, commissioned SVG set for 7 engines. Plus a Rive specialist contractor ($3–8k per v2 §Open Question 1). Plus a "Rive licensing for commercial product" open question (v2 §Open Question 5). The v2 response to complexity is always "add a layer." Granola — v2's own reference — is CSS and a pulsing dot. Linear is Inter + InterDisplay and one cubic-bezier. The test isn't "can we build the 5-motion stack?" — it's "what's the minimum that hits the same outcome?"
**Replacement:** Inter + InterDisplay (two fonts, one family). Framer Motion only. **No Rive.** No Fraunces. No Geist Mono (use `ui-monospace` system stack). Engine "logos" = 1-letter monograms in brand-colored circles until a real designer commissions the set. Ship in ~160KB total motion+font overhead, not 300+.

### Attack 7 — "Warm off-white canvas + burnt sienna" is the wrong instinct for a tool
**v2 claim (§Color System, line 279):** "`#FAFAFA` … Warm off-white (1% warmth over pure white)."
**Counter:** Agree on `#FAFAFA`. But the *reasoning* in v2 ("warm" / "1% warmth over pure white") smuggles in an editorial register — warm is for *Craig Mod's blog*, not for a tool SMB owners open daily between invoicing and payroll. Linear uses pure white (or pure dark) in light/dark modes ([linear.app/now/how-we-redesigned-the-linear-ui](https://linear.app/now/how-we-redesigned-the-linear-ui)). Granola is plain white. The product's job is to disappear so the data can speak. "Warm" is designer-ease, not user-served.
**Replacement:** `#FFFFFF` page background, `#F7F7F7` card wells. Stop selling the "warmth" narrative — let the tool be a tool.

### Attack 8 — The "Do > Show > Tell" aha moment is smuggling a character into onboarding
**v2 claim (§Part 4 First Scan Reveal, lines 502–514):** A 30-second Stage runs before signup. Courier (Beamie) carries site to 7 engines. Then "a single bottom bar slides up: 'Save your results and let our agents fix this — create a free account.'"
**Counter:** The non-character version of this is strictly better. Show a 12-second step list, show the score, show the top 3 recs, show the "save account" bar. The **score is the aha moment**, not the courier. v2 has convinced itself that watching a character do the work is more impressive than the score itself — but the score is a *number about the user's own business*. Nothing a character can do is more emotionally sticky than "your AI visibility is 34/100 and here's why." The character is upstaging the actual value.
**Replacement:** Strip the courier. Keep the 7-engine pulse list. Keep the score fill. That's the reveal.

### Attack 9 — "Beamie's text layer" is a second AI stack in disguise
**v2 claim (§Companion apps, lines 113–118):** "Companion 'apps' … 'What is [term]?' … 'What did you work on today?' … These are routed to existing API endpoints. Beamie is a natural-language router to existing product features, not a separate AI stack."
**Counter:** "Natural-language router to existing API endpoints" **is** a separate AI stack. It requires intent classification, prompt templating, error handling for out-of-scope queries, conversation state, rate limiting, model selection, token cost tracking, and a fallback when the classifier fails. v2 is describing Clippy-as-a-Service but calling it "routing." The engineering work here is bigger than the rest of the companion combined, and v2 doesn't scope it.
**Replacement:** Beamie (if it exists) is clickable and opens the existing chat component. No "natural-language router." One entry point, one chat, same component as everywhere else in the app.

### Attack 10 — The implementation plan admits the ambition is too big
**v2 claim (§Implementation Plan, line 622):** "Total: 6–7 sprints (~12–14 weeks) for full rollout."
**Counter:** 12–14 weeks for a design system is **longer than the entire stated MVP build sprint** (CLAUDE.md project state: "2-week MVP build sprint"). The plan itself says Phase 0 ships this week (correct), Phase 1 is motion foundation (2 weeks), Phase 2 is the Stage (4 weeks), Phase 3 is the companion (2 weeks), Phase 4 is page rebuilds (4 weeks), Phase 5 is polish (2 weeks). Adam has a "target launch: early May 2026" on a repo dated April 24. That's less than two weeks. **v2 cannot ship by May.** It's an 8-sprint plan. That's the honest critique, and v2 doesn't acknowledge it.
**Replacement:** Ship Phase 0 + a stripped Phase 1. Defer the Stage and the companion to Phase 3+ after first 10 paying customers.

---

## 3. DOES BEAMIE NEED TO EXIST?

### Case AGAINST Beamie (strong)

1. **Linear has no character. Raycast has no character. Granola has a pulsing rectangle with a handle — not a character.** These are the products v2 cites as its references. Each reached their craft ceiling by subtracting, not by adding a face. Copying them *means not having a character.*
2. **SMB owners are not lonely.** They are busy. A character solves a loneliness problem; busy users experience a character as a distraction or, worse, a patronizer. The anti-Clippy research in v2 (§Rule 12 anti-Clippy clauses) is a list of ways to *prevent* the character from being annoying — which is evidence the character starts out annoying by default and has to be restrained.
3. **Maintenance cost is invisible until you ship.** A Rive character needs a Rive specialist to update. That specialist is not on the team. Every new agent state (v2 lists 7 plus "error" and "confused" and "shrug") is a file revision + a contract + an invoice. The character is a perpetual cost.
4. **The "aha moment" doesn't need a character.** The score arriving is the aha. A number going from 0 to 34 with color transitioning through red→amber is more emotionally precise than a character carrying a scroll. The score **is** the user's business. The character is not.
5. **Beamie creates a brand risk.** If a competitor copies the character and does it better, Beamix now looks like the clone. If Beamix pivots its product and the character has to be re-rigged, the brand is momentarily rudderless. No character = no dependency.
6. **Every single v2 reference for "companion that lives inside the product UI" is doing something different.** Granola's "companion" is a rectangle during meetings. Notion's "character" lives inside the AI panel, not the product shell. ElevenLabs' Orb is a voice visualizer, not an ambient assistant. v2 is synthesizing three products into a fourth that nobody has shipped — because nobody needed to.

### Case FOR Beamie (honest)

1. **State communication.** A single on-screen element that changes color/pulse when agents are active does communicate state at a glance. That's real.
2. **Brand recall.** A memorable visual asset aids marketing, testimonials, app store screenshots. "The blue thing that watches your site" is a talkable hook.
3. **Warmth for non-technical users.** A face signals "this is a tool made for humans, not engineers." There's a small but real subset of SMB owners who respond to this.

### MY CALL: **No Beamie. Ship a status dot instead.**

The "case for" reduces entirely to (a) state communication and (b) brand recall. Both are achievable with a **status dot** — a 12px circle in the top-right of the nav bar that changes color/pulse by agent state. Zero Rive, zero contractor, zero licensing, zero drag mechanic, zero onboarding tour, zero 12 behavior rules. **Three rules total:** (1) gray when idle, (2) blue pulsing when agents active, (3) green flash for 400ms on completion. That's it.

"Brand recall" is served by the combination of: **the blue star logo** (already exists), **the score ring fill animation** (we keep this), and **the microcopy voice** (we keep this). Nothing else is needed.

### The alternative: how we show agents working without a character

- **Top-right status dot** — 12px, lives in the page header. Color = agent state. No face, no body, no drag, no chat.
- **Per-Inbox-item pulse** — the Inbox row of the currently-working agent has a 1px left-border that pulses `#3370FF` at 2s period. Dies the moment the job completes. Same information as "Beamie points at the item."
- **Completion toast** — 2200ms inline toast near the completed item, copy: "FAQ schema ready — review." Same information as "Beamie bounces + succeeded face."
- **Scan progress strip** — the 7-engine pill strip from v2 §Stage, minus the courier, minus the full-page modal. Inline on the page. Same information as Frames 2–7 of v2's Stage, delivered in 1/10 the design surface area.

All four of those are **CSS and Framer Motion**. No Rive. No contractor. Zero open questions.

---

## 4. THE SHORTER STAGE

v2 spends 8 frames and 30 seconds on "the Stage" (lines 136–172). That's a film. A tool should not show a film when the user pressed a button. Here's what ships instead:

### The 12-second inline scan state

**Location:** In-page, not a full modal. Lives in the same spot where scan results will appear, so the user's eye doesn't have to relocate.

**Layout (single column, full width of results area, ~600px tall on desktop):**
- **Top (72px):** Domain chip with favicon + URL, cancellation X on the right. One line.
- **Middle (~400px):** 7 engine rows vertically stacked. Each row: engine logo (SVG or letter monogram) + engine name + right-aligned status. Status values: **"Waiting" (gray dot)** → **"Asking…" (pulsing blue dot)** → **"Done — 2 mentions" (green check + count)**. 8 lines per row max.
- **Bottom (~100px):** Single determinate progress bar `x/7 engines complete`. Live copy: *"Asked ChatGPT. Checking Perplexity…"*.

**Timing:** 8–12 seconds (matches v2's own research doc's estimate, not the inflated 30). Each engine row transitions `Waiting → Asking → Done` as its API call resolves. Streaming — never wait for all 7 to complete before showing any.

**Motion budget:** Total motion = 3 things. (1) The status dot on the active row pulses at 2s period. (2) The progress bar fills linearly. (3) When the score is ready, the **one signature motion** fires (Score Gauge Fill, §5). No courier. No flight paths. No arc of model pills. No data packets. No scroll prop.

**What's removed vs v2:**
- No full-page modal.
- No courier character.
- No model pills arranged in an arc.
- No flight path connectors.
- No data packet animation.
- No side panel of expandable raw data during the scan (it appears **after** in the results view).
- No "Re-watch scan" button (the data is cached, the user can rerun; nobody re-watches).
- Frame 1 is gone (the scan is already in-page).
- Frame 8 is gone (there's no transition, the scan results render where the scan state was).

**What's retained from v2:**
- Streaming updates as each engine completes.
- The 7-engine visual. (Vertical list, not arc.)
- The score ring fill at the end.
- Cancel affordance.

**Why this is better:** The user sees where they stand **in the same spot the results will live**. There's no context switch. The motion budget is spent on the one thing that actually matters (the score arriving). Users on their second scan aren't held hostage.

---

## 5. THE ONE SIGNATURE MOTION

**Keep: Score Gauge Fill.** Kill the other four.

### Why Score Gauge Fill wins

- **It's the product's north star.** The score is literally the one number Beamix sells. v2 §PMF Rule 4: "One number, front and center." Every motion budget goes to the hero.
- **It earns its motion by being rare.** Most dashboard visits, the score is already there (cached). The fill plays only on a fresh scan — which is what Rauno's frequency-aware rule ([rauno.me/craft/interaction-design](https://rauno.me/craft/interaction-design)) says is the right condition for motion.
- **It's educational.** The color transitioning through red→amber→green as it fills **teaches** the user what the number means. Zero copy required. v2 gets this right (line 226): "teaches users what the numbers mean by showing the journey."
- **It's cheap.** 800ms, `cubic-bezier(0.16, 1, 0.3, 1)`, one animated property (SVG stroke-dashoffset) + one color interpolation. No Rive. No state machine. ~30 lines of Framer Motion.

### Why the others die

- **Scan Reveal (motion 1) — dies.** The replacement is the inline scan state in §4. No courier, no stage, no 30-second set piece. The scan state communicates through a progress bar + row-status transitions, which is motion, but it's *state motion*, not *signature motion*. It doesn't repeat across contexts; it lives in exactly one place.
- **Agent Pulse (motion 2) — dies as a "signature."** A pulsing row border + a 12px status dot are still there, but they are not a "signature motion" — they're state indicators. Calling them a signature inflates what they are. An LED on a router isn't a signature.
- **Recommendation Cascade (motion 4) — dies.** The 40ms stagger on card entry is low-cost and inoffensive, but elevating it to "signature" status is grade inflation. A list of cards that arrive in order is table stakes, not identity. The replacement is standard Framer Motion `staggerChildren: 0.04` on the list container. It exists; it doesn't get a name.
- **Completion Settle (motion 5) — dies.** A 200ms scale bounce + border flash is a nice touch, but it's a generic SaaS pattern (Linear has it, Granola has it, Notion has it). Claiming it as "Beamix's ding" when every B2B tool does it is a branding error.

**Net motion budget for Beamix:** one signature (Score Gauge Fill) + one state pulse (agent-active row border) + one micro-interaction (button active-state scale 0.97 per Emil, [emilkowal.ski/ui/7-practical-animation-tips](https://emilkowal.ski/ui/7-practical-animation-tips)) + `prefers-reduced-motion` static fallbacks. That's it. Everything else is generic list-stagger or hover-fade, which needs no naming and no ceremony.

---

## 6. V2-MINIMAL — FULL SPEC

**Design thesis:** Beamix is the calmest, fastest way for an SMB owner to see where they rank in AI search and act on it. Every surface earns its existence against the friction it creates. Proof is the score arriving in <15 seconds on a clean interface. There is no character. There is no stage. There is one hero number, three calm states per page, and nothing else.

**Named aesthetic:** Minimalist-utilitarian. Think Linear + Granola, minus the dark mode (launch is light-only).

**Differentiation anchor** (the "screenshot with logo removed" test per `.agent/skills/frontend-design/SKILL.md`): a **72px InterDisplay score ring in brand blue**, flanked by exactly three recommendation cards in a tight `gap-4` grid, with nothing else above the fold. That composition alone is recognizable.

### What ships Phase 0 (this week)

All 10 audit fixes from v2 §Phase 0. No critique, no change — execute them verbatim.

1. Load InterDisplay via `next/font/google`.
2. Load Geist Mono via `next/font/google`. *(Revised: skip Geist, use system `ui-monospace` stack — saves ~40KB, reduces font deps from 4 to 2.)*
3. Fix sidebar active state to `bg-[#EFF4FF] text-[#3370FF]`.
4. Purge `#93b4ff`, `#0EA5E9`, violet/orange/teal agent tints.
5. Fix filter chip active state on /scans.
6. Remove tinted-square icon backgrounds on KpiStripNew.
7. Enforce `rounded-lg` (no `rounded-full` in product UI).
8. Replace per-agent `Zap` with 7 distinct Lucide icons.
9. Score hero on /home at 72px InterDisplay.
10. Wire Inbox actions to real API.

### What ships Phase 1 (week 2)

1. **Single signature motion** — Score Gauge Fill component. 800ms, `cubic-bezier(0.16, 1, 0.3, 1)`, stroke-dashoffset + color interpolation. Prefers-reduced-motion fallback = instant render of final value.
2. **Inline scan state** — the 12-second vertical 7-row list from §4. No modal. No courier.
3. **Agent-active row pulse** — 1px left border pulsing `#3370FF` on the Inbox row of the currently-working agent. Starts on job start event, dies on completion. Pure CSS keyframe.
4. **Status dot in top-right nav** — 12px, three states (idle gray / active pulse blue / just-completed green flash 400ms then gray). Pure CSS + Framer Motion. No Rive.
5. **Standard micro-interactions** — hover fades at 150ms, button `active:scale-[0.97]`, tab switches at 180ms, drawer at `cubic-bezier(0.32, 0.72, 0, 1)` 300ms (Vaul, [emilkowal.ski/ui/building-a-drawer-component](https://emilkowal.ski/ui/building-a-drawer-component)). None of these are "signature" — they're hygiene.
6. **Typography pass** — H1 40px InterDisplay, H2 28px InterDisplay, body 14px Inter, code 13px `ui-monospace`. Tabular-nums on all numeric data. Fraunces retired entirely. No "Inbox zero" Fraunces italic; the Inbox zero state is a green check + one line of Inter body + a last-completed timestamp.

### What ships Phase 2 (week 3–4)

1. **Per-page polish** — /home score hero, /inbox 3-pane with wired actions, /scans cached history, /crew per-agent icons. All use the single signature motion (score fill) + standard hygiene motion. No page gets a "signature moment."
2. **Empty/error states** — 4 empty states, each a short line of Inter body + one action button + (optionally) a 40px Lucide icon. No character. No illustration. No Fraunces italic. Copy is the design.
3. **Engine logos** — Commission or source 7 SVG marks. If not available on day 1, use 1-letter monograms in brand-blue circles. Unblocked.
4. **`prefers-reduced-motion` audit** across everything.
5. **WCAG contrast audit** on `#3370FF` + `#0A0A0A` against `#FAFAFA`. Confirm AAA for body, AA for large text.

### What NEVER ships

1. **Beamie.** No character. No face. No eyes, brows, nose. No body. Not as a mascot, not as an orb, not as a dot-with-a-face.
2. **Rive.** No runtime dependency. No contractor. No licensing question.
3. **The 30-second Stage.** No full-page modal during scan. No courier. No flight paths. No data packets.
4. **The 12 Beamie behavior rules.** Zero of the 12.
5. **Natural-language routing layer** ("Ask Beamie what [term] means"). If users want that, it's the existing chat component, reached by a button, not by clicking a character.
6. **Excalifont. Fraunces.** Only Inter + InterDisplay.
7. **Five named "signature motions."** One named motion. The rest are hygiene.
8. **"Warm" framing.** No "1% warmth over pure white" narrative in design docs. Pure white, gray wells, blue accent. Tools are tools.
9. **Dark mode at launch.** (v2 got this right.)
10. **Gradient-in-motion, parallax-on-scroll, looping sparkles.** (v2 got this right.)
11. **Rive-specialist contractor budget line** ($3–8k per v2 §Open Question 1). Redirect that budget to a single week of user research on actual SMB owners running actual scans.

### DFII score (per `.agent/skills/frontend-design/SKILL.md`)

- Aesthetic Impact: 3/5 (lower than v2's stated aesthetic — by design)
- Context Fit: 5/5 (SMB owners + weekly dashboard + no jargon)
- Implementation Feasibility: 5/5 (no Rive, no contractor, no blockers)
- Performance Safety: 5/5 (~160KB total motion/font vs v2's ~300+ and a Rive file)
- Consistency Risk: 1/5 (tiny surface = easy to keep consistent)

DFII = (3 + 5 + 5 + 5) − 1 = **17** (off-scale strong). v2's equivalent DFII, by my count: (5 + 3 + 2 + 3) − 4 = **9** (proceed with discipline, but with a 12–14 week tail).

### Timeline

- Phase 0: 3–4 days (matches v2).
- Phase 1: 1 week.
- Phase 2: 2 weeks.
- **Total: ~3.5 weeks to feature-complete minimal launch.** Fits the May 2026 target. v2's 12–14 weeks does not.

### What v2-minimal gives up vs v2

- No character. Lower "wow" on first demo screenshot.
- No 30-second show. Lower Twitter-demo-video potential.
- No "5 signature motions" marketing line.
- Less differentiated-feeling vs competitors on a purely visual comparison.

### What v2-minimal preserves vs v2

- All functional PMF rules (one number front and center, absorb complexity, progressive disclosure, do > show > tell, celebrate completion, voice not manual, plain language, empty states prompt action).
- Score Gauge Fill — the one motion that actually corresponds to a PMF moment.
- Streaming scan updates.
- Phase 0 fixes (all 10).
- Typography system (minus Fraunces + Geist).
- Color system (minus the "warm" narrative).
- Anti-pattern list.
- Motion duration caps + easing vocabulary.
- WCAG + prefers-reduced-motion discipline.

---

## 7. CONCESSIONS — WHERE I AGREE WITH V2

Honest list. These are cases where v2 is right and my instinct to subtract is wrong.

1. **The 7-engine visual matters.** I originally wanted to reduce to a single progress bar ("scanning 7 engines…"). That's too flat. v2 is right that showing each engine as a distinguishable unit (logo, name, per-engine result) converts better than an aggregate bar. I disagree with the full-page modal wrapper, not the 7-engine visual itself.
2. **Streaming results beats batched results.** v2 §Design mandate for First Scan Reveal (line 516) — "engines that finish early show their results" — correct. The perception of speed matters. Minimal keeps this.
3. **Score earns hero treatment.** v2 §Page /home (line 443) — score at 72px InterDisplay. Correct. I kept this.
4. **InterDisplay is not optional.** v2 §Typography (line 300) — correct, InterDisplay must be loaded. Kept.
5. **Phase 0 quick wins are correct.** All 10. Zero disagreement.
6. **The audit findings on AI-slop patterns** (tinted-square-with-icon, uppercase-tracking labels, Zap-for-everything) are correct and critical. These must be purged.
7. **Dark mode is correctly deferred.** Not at launch.
8. **`prefers-reduced-motion` is non-negotiable.** v2 got this right.
9. **Brand blue locked at `#3370FF`** — correct, no negotiation.
10. **Beamie's "silent by default, inline text on click"** (Rule 6) — *if* a character exists, this constraint is right. My position is that no character exists, not that this rule is wrong if one did.
11. **12-state anti-Clippy clauses** — defensible. I disagree the character should exist, but if it exists, v2's 5 "never"s (never auto-speak, never repeat nudges, never block flow, always dismissible, never anthropomorphize beyond a face) are the right guardrails.

---

## 8. THE SINGLE HARDEST QUESTION FOR ADAM

**If the scan returned in 10 seconds as a vertical list of 7 engine rows — no character, no stage, no full-page modal — and users converted at the same rate they would have with the 30-second courier show, would you still want to ship the character?**

If the answer is **no** (character exists to drive conversion, and if the score alone drives the same conversion the character is redundant), then v2-minimal ships and you save 4–6 weeks.

If the answer is **yes** (the character is a brand/identity decision separate from conversion), then we're having a brand conversation, not a product-design conversation — and the right move is to invest the character budget in **one** marketing asset (a single video on the Framer site) rather than build a 12-behavior-rule runtime companion living inside the product.

Either way: the Rive character does not belong in Phase 1.

---

**Summary:** v2 is a strong document with a bias toward addition. Each addition is individually defensible and collectively disastrous for shipping by May. A minimal version delivers 85% of the PMF outcome with 25% of the build surface. Subtract.

---

## APPENDIX A — TWO MORE ATTACKS I COULDN'T FIT ABOVE

### Attack 11 — "Warm-minimal system products" is marketing copy pretending to be taxonomy
**v2 claim (line 8):** "borrows from courier-on-canvas spatial storytelling (tldraw Fairies), the restraint of warm-minimal system products (Linear, Granola), and the state-reactive aliveness of character-driven UI (Notion AI, ElevenLabs Orb)."
**Counter:** Linear and Granola are not "warm-minimal system products." Linear is a **cold, severe, almost monochromatic** product — [linear.app](https://linear.app) uses pure black/white/gray with a single accent. Granola is utilitarian. The word "warm" does no analytical work in v2 — it's a vibe-word used to justify Fraunces italic, off-white canvas, and a companion face. Meanwhile, "state-reactive aliveness of character-driven UI" fuses Notion AI (panel-scoped face) and ElevenLabs Orb (voice visualizer center-stage) into a category that has exactly zero members. The taxonomy is invented to justify the synthesis, not observed from the market.
**Replacement:** Drop the taxonomy. State the actual influences honestly: "Beamix takes Linear's typography + Granola's silent-utility + Perplexity's streaming-step-list. No characters. No stages."

### Attack 12 — The "motion budget" has no budget
**v2 claim (§Motion Language §Duration Budget, lines 192–201):** A table of 6 motion categories, durations from 0ms to 2000ms.
**Counter:** Motion budget ≠ duration budget. A real motion budget is the **total animated minutes per user-session**. If a user logs in and sees: score fill (800ms) + recommendation cascade (1600ms of 40ms staggers across 8 cards) + agent pulse (continuous) + companion idle breathe (continuous) + companion thinking (continuous when an agent runs) + completion settle (200ms per completion) — they are never looking at a still frame. The UI is always moving. That is the opposite of Rauno's "make it consistent, make it timeless, make it soulful" — it's "make it animated." v2 has no accounting for how much motion the user experiences in aggregate. 
**Replacement:** Budget rule — at any given moment, **at most one element is animating** on a dashboard page unless the user is actively scanning or running an agent. Idle pages are still frames. Period.

---

## APPENDIX B — THE 12 BEAMIE RULES, TRIAGED

v2 §12 Behavior Rules. My position: ship 0. Adam's instinct may be to ship some subset. Here's the honest triage if the character survives:

| Rule | v2 title | My verdict | Rationale |
|---|---|---|---|
| 1 | Default state and resting position | Phase 1 only **IF** character exists | Table stakes. |
| 2 | Appearance trigger | Phase 1 only | Frequency-aware = no re-entrance. |
| 3 | Active state during agents | Phase 1 only | The actual reason to have a character. |
| 4 | Gaze-not-glow | **Phase 3+** | Rotation vector + target halo = 2 weeks of work. |
| 5 | Point and highlight | **Phase 3+** | SVG arc drawing + 10s timeout + per-element dismissal DB = heavy. |
| 6 | Silent speech / inline text on click | **Phase 3+** | Requires inline chat component + routing. |
| 7 | Drag mechanics | **Never** | `localStorage` position + 8px threshold + snap-to-edge = weeks. Users don't care. |
| 8 | Dismiss mechanics | **Phase 1** | Hard rule: must be dismissible from day 1 (Clippy lesson). |
| 9 | Onboarding vs steady-state | **Never** | Onboarding via character is a Clippy risk ceiling, not floor. |
| 10 | Working vs idle distinct states | Phase 1 only | Reduced to 2 states: idle + active. Drop Succeeded, Blocked, Error. |
| 11 | Silence timeout | **Phase 3+** | Only needed if Rule 5 ships. |
| 12 | Anti-Clippy "never"s | **All phases** | Guardrails if the character exists. |

**Honest ship-list if Adam insists on a character:** Rules 1, 2, 3, 8, 10 (reduced), 12. That's **6 rules for Phase 1**, not 12. Rules 4, 5, 6, 7, 9, 11 are Phase 3+ or never.

But my actual position is: **ship 0 of the 12.** Ship the status dot.

---

## APPENDIX C — THE v2 CLAIMS THAT DON'T SURVIVE THEIR OWN CITED SOURCES

Where v2 cites a source, I checked the source. Three cases where v2 overreaches:

1. **v2 line 52 cites Microsoft Copilot dingbat discussion** ([techcommunity.microsoft.com discussion 4288889](https://techcommunity.microsoft.com/discussions/microsoft365copilot/i-want-to-turn-off-or-hide-the-draft-with-copilot-dingbat-that-follows-my-cursor/4288889)) as evidence for the "gaze-not-glow" rule. The source is users angrily asking how to turn off Copilot. The correct lesson is **don't ship a character**, not "ship a character but with a better gaze vector."

2. **v2 line 263 cites BUCK's Notion AI case study** ([buck.co/work/notion-ai](https://buck.co/work/notion-ai)) as the justification for Rive + character. The BUCK case study describes a **panel-scoped** character inside one AI feature, built by a dedicated studio. It is not evidence for a product-shell-wide companion with 12 rules. v2 cherry-picks the technique and extrapolates the scope.

3. **v2 line 91 cites ElevenLabs Orb** ([ui.elevenlabs.io/docs/components/orb](https://ui.elevenlabs.io/docs/components/orb)) for the 4-state model. ElevenLabs' Orb is a **voice visualizer center-stage** during an active voice session. It is not an ambient assistant. Using it to justify an always-on companion inflates what the Orb actually is.

None of these source-misreadings invalidate v2 on their own, but collectively they show v2 is assembling a composite creature from parts of products that don't have the composite. The combination is unprecedented — and "unprecedented" in B2B tools is usually a sign the combination was never needed, not a sign of opportunity.

---

## APPENDIX D — MY OWN DFII SCORECARD, HONEST

For the frontend-design skill's integrity, here's my own scorecard for v2-minimal (copied from §6 for reference, with notes):

| Dimension | Score | Note |
|---|---|---|
| Aesthetic Impact | 3/5 | Lower than v2's 5/5. My direction is *intentionally* less "wow." Memorability comes from the score ring + typography + brand blue, not from a stage. |
| Context Fit | 5/5 | SMB dashboards visited weekly. Minimal is strictly correct. |
| Implementation Feasibility | 5/5 | No Rive, no contractor, no 4-week Stage build, no 2-week Phase 3. |
| Performance Safety | 5/5 | ~160KB motion+font overhead. v2 runs ~300+KB + a Rive file. |
| Consistency Risk | 1/5 | Tiny surface = easy to maintain consistent. v2 has 12 behavior rules + 5 signature motions + 8+ character states = high drift risk over time. |

**DFII = 17** (off-scale strong). Execute fully.

v2 self-scored (inferred): Impact 5, Fit 3, Feasibility 2, Performance 3, Consistency Risk 4. **DFII = 9** (proceed with discipline, but expect a long tail).

The skill's rule is: 12–15 = execute fully, 8–11 = proceed with discipline, 4–7 = reduce scope, ≤3 = rethink. v2 sits at 9 — **proceed with discipline**, not "execute fully." My minimal sits at 17 — execute.

---

## FINAL POSITION

**v2 is a good 651-line document that shows an ambitious designer thinking clearly at an individual-rule level.** It reads well. It cites well. Its Phase 0 fixes are ship-tomorrow quality. Most of its motion vocabulary is correct.

**And it is the wrong document to build from.**

The bias of v2 is that every section ends with *more* — more states, more rules, more frames, more signature motions, more fonts, more runtimes, more open questions. The bias of good design is the opposite: every section ends with *less*. Less surface. Fewer dependencies. Fewer named concepts. Fewer things the user has to notice or the team has to maintain.

**Dieter Rams, principle 10:** "Good design is as little design as possible. Less, but better." ([vitsoe.com/rw/about/good-design](https://www.vitsoe.com/rw/about/good-design))

**Craig Mod on tools:** A tool is not a film. A tool is something the user uses daily, and the best tools get out of the way. ([craigmod.com](https://craigmod.com))

**Karri Saarinen on soul:** "The soul comes from limits." ([karrisaarinen.com/posts/soul](https://karrisaarinen.com/posts/soul/))

v2's bet is that Beamix needs **more** to differentiate from competitors with less. My bet is that Beamix differentiates by having the calmest, fastest, most reliable product in a category where every competitor has noisy dashboards. The soul comes from limits. Ship v2-minimal.

Concede the character if Adam's gut says it's the brand. But then — concede it **honestly**: one status dot, three rules, zero Rive, zero contractor, and admit in the design doc that the character is a brand decision, not a UX decision. Don't dress it up as "making invisible work watchable."

The score is watchable. The score is the product. Everything else is stage dressing.


---

## APPENDIX E — V2-MINIMAL WIREFRAMES (ASCII, LOAD-BEARING)

Concrete is better than abstract. Here is what v2-minimal's four main states look like in ASCII, so the counter-proposal is not just prose.

### /home (returning user, cached score)

```
┌────────────────────────────────────────────────────────────────┐
│  Beamix   Home · Inbox · Scans · Crew · Settings       ● gray  │   <- status dot (idle)
├────────────────────────────────────────────────────────────────┤
│                                                                │
│     ╭──────╮                                                   │
│     │  34  │   Your AI visibility score                        │   <- 72px InterDisplay in ring
│     ╰──────╯   Last scan: 2 days ago — Run scan now  →         │
│                                                                │
│     ─────────────────────────────────────────────────────      │
│                                                                │
│     Top recommendations                                        │
│     ┌────────────────────────────────────────────────────┐     │
│     │ Add FAQ schema to your homepage        Run agent → │     │
│     ├────────────────────────────────────────────────────┤     │
│     │ Fix citations for "business hours"     Run agent → │     │
│     ├────────────────────────────────────────────────────┤     │
│     │ Update homepage H1 for clarity         Run agent → │     │
│     └────────────────────────────────────────────────────┘     │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

Nothing else above the fold. No KPI strip. No tinted-square icons. No "Recent activity" feed pulling attention. Score + three actions. That's the page.

### Scan in progress (inline, replacing the score area)

```
┌────────────────────────────────────────────────────────────────┐
│  Beamix   Home · Inbox · Scans · Crew · Settings      ● blue   │   <- status dot (active pulse)
├────────────────────────────────────────────────────────────────┤
│                                                                │
│     Scanning yourbusiness.com                   [Cancel X]     │
│                                                                │
│     ● ChatGPT         Done — 2 mentions, neutral        ✓      │
│     ● Perplexity      Asking… ▂▂▂                              │   <- active row, pulsing dot
│     ○ Claude          Waiting                                  │
│     ○ Gemini          Waiting                                  │
│     ○ Grok            Waiting                                  │
│     ○ You.com         Waiting                                  │
│     ○ Google AIO      Waiting                                  │
│                                                                │
│     ──────────────────────────                                 │
│     1 of 7 complete                                            │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

No modal. No courier. No arc of pills. No data packets. No side panel of expandable raw data. Just 7 rows, a progress bar, a cancel affordance. When done, this area collapses and the Score Gauge Fill animation replaces it.

### Inbox (with one agent actively working)

```
┌────────────────────────────────────────────────────────────────┐
│  Beamix   Home · Inbox · Scans · Crew · Settings      ● blue   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│     Inbox                                      [Filter ⌄]      │
│     ┌────────────────────────────────────────────────────┐     │
│     │ ▌ FAQ Agent — working on your homepage        ···  │     │  <- 1px blue pulsing left border
│     ├────────────────────────────────────────────────────┤     │
│     │   Performance tracker — done (weekly digest)  ✓   │     │
│     ├────────────────────────────────────────────────────┤     │
│     │   Schema Agent — done (product pages)         ✓    │     │
│     └────────────────────────────────────────────────────┘     │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

The active row's left border does the work a companion would do in v2. No face pointing at the row. The row **is** the signal.

### Inbox zero (no unreviewed)

```
┌────────────────────────────────────────────────────────────────┐
│  Beamix   Home · Inbox · Scans · Crew · Settings      ● gray   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│                                                                │
│                                                                │
│                               ✓                                │
│                        You're all caught up.                   │
│                       Last completed 3h ago.                   │
│                                                                │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

One green check. One sentence. One timestamp. No Fraunces italic. No character in "succeeded steady state." No action button. This is rest, not a prompt. The copy does the work.

---

## APPENDIX F — CROSS-CHECK AGAINST `.agent/skills/frontend-design`

The `frontend-design` skill (loaded as my primary skill for this critique) requires:

1. **Intentional Aesthetic Direction** — v2-minimal declares *minimalist-utilitarian*. Named. Explicit.
2. **Technical Correctness** — CSS + Framer Motion + Next.js. Real, working, production-ready. No Rive, no contractor.
3. **Visual Memorability** — the 72px score ring in brand blue, flanked by three recommendations. Screenshot that composition, crop the logo, and it's identifiable. Test passed.
4. **Cohesive Restraint** — every element justifies its existence against the friction. Score ring, three cards, status dot, single signature motion. No decoration.

The skill's rule (Section 4, Typography): "Avoid system fonts and AI-defaults (Inter, Roboto, Arial, etc.)" — this is where v2-minimal **consciously diverges from the skill**. Inter is the system-default in 2026 B2B tools. Using it anyway is a deliberate choice: Beamix's audience is not looking for typographic distinctiveness; they are looking for legibility. Linear (the reference product for this category) uses Inter + InterDisplay. Beamix should too. The skill is general; the context is SMB tools. The context wins.

**This is documented as a deliberate deviation, not an oversight.**

---
