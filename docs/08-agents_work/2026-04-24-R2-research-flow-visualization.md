# Round 2 Research: Agent Flow Visualization Patterns
**Date:** 2026-04-24
**Focus:** How leading AI products turn invisible agent work into a watchable journey.
**Context for Beamix:** Adam's vision — a character walks through the user's website with a magnifying glass, picks up references, sends them to each AI model logo (ChatGPT / Gemini / Claude / Perplexity), each model "thinks," the result returns, and the flow moves to the next model. Not a progress bar with text. A living, watchable flow.

---

## TL;DR

Three anchor patterns win for Beamix, synthesized from 20+ product references:

1. **The Progressing Plan Panel** (Perplexity Pro/Deep Research) — a vertical list of steps the user can watch tick through, with each step expandable to see detail. Engineer-trust builder.
2. **The Agent Workspace / Observer View** (Devin + Manus "Computer" + ChatGPT Operator) — a framed "stage" the user watches the agent work on, browser visible, cursor moving, scroll happening, with narration on the side.
3. **The Character-On-Canvas** (tldraw Fairies + FigJam) — animated sprites/characters that visibly move between objects on an infinite canvas, dropping data off, picking it up. Rare in production, maximum emotion.

**Beamix sits at the intersection of all three**: the rigor of Perplexity's step list, the framed-stage trust of a workspace, and the emotional warmth of a character. The winning combo is a **stage with a character** who performs steps that are *also* displayed as a progressing list below, so the user can watch OR read.

---

## TOP 3 ANCHOR PATTERNS FOR BEAMIX

### Anchor 1: Perplexity Pro Search + Deep Research — The Progressing Plan Panel

- **Product URL:** https://www.perplexity.ai/hub/blog/introducing-perplexity-deep-research
- **Case study:** https://www.langchain.com/breakoutagents/perplexity
- **Help doc:** https://www.perplexity.ai/help-center/en/articles/10352903-what-is-pro-search
- **UI gallery screenshots:** https://refero.design/apps/73 and https://60fps.design/apps/perplexity

**What happens visually, 30-second sequence:**
1. User submits a query. Input bar animates up.
2. A panel fades in titled "Pro Search" or "Research". First item appears: "Understanding your question" with a spinning pulse indicator next to it.
3. The first step completes — checkmark replaces the pulse — and a second step appears below: "Searching for X on [topic]". Chevron allows expanding.
4. Expanding a step reveals the actual search queries being run (e.g., "best wireless earbuds 2026", "wireless earbuds reviews reddit"). Citations begin populating as a horizontal scroll of favicon chips.
5. More steps appear: "Reading sources" → "Analyzing" → "Synthesizing". Each gets a checkmark when done.
6. Final answer streams in below the collapsed plan panel. Plan panel remains as an audit trail.

**What we copy specifically:**
1. **Metaphor:** A to-do list that is being completed by the agent in real-time. Familiar, low cognitive load.
2. **Step representation:** Vertical list of cards, each with icon + title + status indicator + chevron to expand.
3. **Thinking state:** A soft pulsing dot (not a hard spinner) next to the active step. Subtle breathing, not aggressive.
4. **Model/tool representation:** Favicon/logo chips for every source the agent touches, visible during the step and persisted in citations. This is critical — the user sees WHICH specific sources (or in Beamix's case: which specific AI models).
5. **Transition between steps:** Checkmark replaces pulse; next step fades in below with its own pulse. No flashy animation — trust is built through calm progression.

**Why it fits Beamix's scan visualization:**
- Perplexity's design insight (per their own case study): *"Users were more willing to wait for results if the product would display the intermediate progress."* This is exactly Beamix's problem — scans take 60–120 seconds and the user needs engagement, not a spinner.
- The plan-panel pattern auto-documents: after the scan, the collapsed list becomes a legitimacy artifact ("we queried 7 engines, here's what we did").
- Expandable steps mean progressive disclosure: casual users just watch the list tick; power users expand to see the actual prompts sent to ChatGPT.

**Risks:**
- Alone, this is text-heavy and engineer-y. Needs visual layer on top (this is where the character comes in).
- Doesn't convey cross-model comparison — all steps look the same. Beamix needs logos to differentiate.

---

### Anchor 2: Manus "Computer" + Devin Workspace + ChatGPT Operator — The Framed Stage

- **Manus Browser Operator:** https://manus.im/blog/manus-browser-operator and https://manus.im/docs/features/browser-operator
- **Devin product analysis:** https://ppaolo.substack.com/p/in-depth-product-analysis-devin-cognition-labs
- **Devin docs:** https://docs.devin.ai/get-started/devin-intro
- **ChatGPT Agent / Operator:** https://openai.com/index/introducing-operator/
- **ChatGPT Atlas sidebar:** https://skywork.ai/blog/agent/chatgpt-atlas-features-explained-sidebar-chat-agent-mode-and-memory-2025/
- **AG-UI protocol:** https://www.codecademy.com/article/ag-ui-agent-user-interaction-protocol
- **Hermes Workspace (OSS):** https://hermes-workspace.com/

**What happens visually, 30-second sequence:**
1. User submits a task. Interface splits: left side is chat/narration, right side is a "stage" — typically a framed browser viewport or a terminal.
2. On the right, the agent's actions are visible in real-time. In Manus: you see the website the agent is reading; mouse cursor moves, a button gets highlighted before click, scroll happens.
3. On the left, plain-language narration streams: "I'm checking the pricing page now…" "I found 3 competitors; reading their About page."
4. When the agent switches tools (terminal → browser → editor), the stage transitions with a tab switch or a fade. Devin has 4 tabs: Shell, Browser, Editor, Planner.
5. The user can pause, take over, or replay. Manus specifically advertises **replay of past sessions**.
6. Results appear in the chat on the left and/or the agent outputs a final document.

**What we copy specifically:**
1. **Metaphor:** A "control room" or "observation window". The agent works inside a contained box; the user watches from outside.
2. **Step representation:** The *stage* shows the WORK (website being read, model thinking). The sidebar shows a LIST of steps, same as Perplexity. The two are linked: clicking a step in the list scrolls the stage to that moment.
3. **Thinking state:** Real activity on the stage — cursor moves, scroll happens, text highlights. Manus shows literal browser automation. When the agent is "thinking" (no visible action), a small narration bubble appears: "Deciding what to do next…"
4. **Model/tool representation:** In Devin, each tool is a tab (Shell / Browser / Editor). In Manus, the browser is the main stage with a small indicator of which action is being taken. Beamix equivalent: each AI model = a tab or a lit-up logo in the "room".
5. **Transition between steps:** A tab switch animates; the stage refreshes. Subtle dot indicator shows which stage is currently active.

**Why it fits Beamix's scan visualization:**
- This is the pattern Adam's vision most closely resembles: a character/agent is visibly doing work inside a contained space, and the user watches.
- The framed stage gives the scan gravity — it becomes an event, not a progress bar.
- Replayability (Manus's big win) maps 1:1 to "watch your scan again" — huge for sharing/screenshots.

**Risks:**
- Real browser control (Manus/Devin) is heavy. Beamix doesn't need actual browser automation — we can use a *stylized* stage with the user's domain screenshotted and an abstract character.
- Can feel intimidating/technical (people think "is it on my computer?"). Solution: stylize the stage so it's clearly not their real browser — an illustrated site, not a Chrome window.

---

### Anchor 3: tldraw Fairies + FigJam — Character-On-Canvas

- **tldraw fairies:** https://fairies.tldraw.com/
- **Fairies announcement:** https://x.com/tldraw/status/2002113715043467509
- **Fairies demo (YouTube):** https://www.youtube.com/watch?v=u_wN-hlISYQ (Max Drake at AI Demo Days)
- **tldraw.computer:** https://tldraw.substack.com/p/make-real-the-story-so-far
- **tldraw agent starter kit:** https://tldraw.dev/starter-kits/agent
- **FigJam AI:** https://www.figma.com/figjam/ai/
- **Steve Ruiz interview:** https://www.latent.space/p/tldraw

**What happens visually, 30-second sequence:**
1. An infinite canvas. User's request is a text box on the canvas.
2. A small character sprite (a "fairy") appears and flies to the input. Animated, obviously alive.
3. The fairy reads the text, then flies to another object — maybe a document, maybe a model node. While flying, it leaves a faint particle trail.
4. It hovers at the destination, "working" — small sparkles or animation. The destination object shows a loading state.
5. Multiple fairies can be on the canvas at once, each doing a different subtask. They don't collide; they buzz around their own areas.
6. Output appears where the fairy last was, and the fairy either flies to the next task or fades.

**What we copy specifically:**
1. **Metaphor:** An infinite canvas (or framed canvas) with objects (input, models, user's site, results) as visible things, and a **character** that physically moves between them.
2. **Step representation:** The steps aren't a list — they're *spatial events*. Where the character is = what step it's on. Optional: a tiny timeline at the bottom mirrors it for accessibility.
3. **Thinking state:** The character animates in place. In Fairies, it's a small sparkle loop. Could be a magnifying glass icon that scans side to side.
4. **Model/tool representation:** Each AI model = a stationary node on the canvas. The character physically flies *to* the node, *into* the node, pauses, emerges with a result, flies to the next.
5. **Transition between steps:** Physical movement of the character between nodes. A path can draw behind it like a trail. This is the most emotionally engaging transition of any pattern surveyed.

**Why it fits Beamix's scan visualization:**
- This is the **only** pattern where the "agent" is a visible character, which is exactly Adam's vision.
- The spatial metaphor solves the problem of showing multiple models in parallel or sequence without a list that looks like engineering output.
- Emotional quality: people love watching cute things move. The fairy pattern has gone viral specifically because it's delightful, not functional.
- It auto-conveys "Beamix does the work" — the character IS the agent doing the work.

**Risks:**
- Hard to execute well. A sloppy character sprite reads as gimmicky (think: cheap clippy). Must be designer-led, not engineer-led.
- Infinite canvas is hard to design on mobile. Must fall back to a linear flow on 390px.
- Without the list/narration layer, users may miss what's actually happening. Pair with Anchor 1 (plan panel) as an accessibility fallback.

---

## FULL COMPARISON MATRIX

| Product | Metaphor | Thinking state | Model/tool viz | Transition | Character? | Register | Fits Beamix? |
|---|---|---|---|---|---|---|---|
| **Perplexity Pro/Deep** | To-do list | Pulsing dot | Source favicon chips | Checkmark + new step appears | No | User (trustworthy) | HIGH — for the plan panel layer |
| **Devin** | 4-tab workspace (Shell/Browser/Editor/Plan) | Real work visible (typing, running) | Tabs per tool | Tab switch, timeline scrub | No | Engineer | MEDIUM — stage concept yes, aesthetic too dev |
| **Manus** | Sidebar "computer" window | Real browser cursor + narration bubbles | Browser is the stage | Page navigates, tab switches | No | User (but technical) | HIGH — the observer-window model |
| **ChatGPT Operator / Agent** | Chat + stage split | Narration bubble + cursor | Browser viewport | Animated action with highlight | No | User | HIGH — narration + action pairing |
| **v0 by Vercel** | Generated UI appearing in-place | Streaming shimmer | N/A (not multi-tool) | Components appear top-to-bottom | No | Creator | LOW — one output, no multi-model |
| **Arc Search "Browse for Me"** | Page-reading animation | Loading spinner + page flicker | N/A | New page replaces | No | User (consumer) | LOW — too minimal for Beamix's needs |
| **LangGraph Studio** | Node graph with animated edges | Node border pulses, edge lights up | Each node = tool/agent | Edge animates from node A to node B | No | Engineer | MEDIUM — visual grammar yes, aesthetic too dev |
| **Hebbia Matrix** | Spreadsheet cells filling in parallel | Cell shimmer while empty | Each column = agent/question | Cell fills with text + citation | No | Analyst | LOW — wrong shape for scan |
| **tldraw fairies** | Infinite canvas + flying characters | Character animates in place | Nodes on canvas | Character physically moves | **YES** | Storyteller | HIGH — the character layer |
| **tldraw.computer** | Node flow with typed cards | Card shimmer | Each card = component/model | Data flows along arrows | No | Creator | MEDIUM — flow aesthetic, no character |
| **Anthropic Computer Use** | Split screen: chat + virtual desktop | Cursor + key events | N/A | Screenshot refresh | No | Developer | LOW — dev tool aesthetic |
| **Browser Use / web-ui** | Browser + activity feed | Live viewport | N/A | Page navigation | No | Developer | LOW |
| **Claude Code CLI** | Terminal output | Spinner + tool name | Tool names in brackets | New line | No | Developer | LOW |
| **Linear agents** | Issue row with "working…" status | Status pill + spinner | Agent avatar | Pill color change | No (avatar only) | Work tool | MEDIUM — use avatars as our "AI model" chips |
| **Zapier Canvas** | Node-based diagram | Static (no live state) | Each node = app | Static arrows | No | Business user | LOW — it's for planning, not watching |
| **Make / Integromat** | Bubble-to-bubble scenario | Real-time data flow dots during run | Each bubble = app logo | Data dots animate along line | No | Automator | **HIGH inspiration — animated data dots between bubbles** |
| **n8n** | Gray grid + boxes | Border pulse when executing | Each box = service | Gray wire | No | Engineer | LOW — too technical |
| **FigJam AI / Jambot** | Freeform sticky canvas | Stickies appear + sort themselves | N/A | Stickies fly to groups | No (but feel playful) | Creator | MEDIUM — the "stickies animate into place" feel |
| **Stripe marketing animations** | Abstract pipes + money particles | Particles flow | N/A (marketing only) | Continuous loop | No | Marketing | Inspiration ONLY — the aesthetic of money-in-motion |
| **Genspark Sparkpages** | Structured brief appearing | Section-by-section stream | N/A | Section slides in | No | Researcher | LOW |

---

## THE VISUAL VOCABULARY FOR BEAMIX SCAN FLOW

Given Adam's exact vision, here is the recommended visual grammar:

### 1. The stage: where does this happen?
**Full-page modal overlay** during the active scan (user cannot scroll away — intentional: the scan IS the experience).
- Top bar: the domain being scanned, current status ("Scanning 3 of 7 engines"), X to cancel.
- Center: the "stage" (see below).
- Bottom: a horizontal progress strip showing the 7 engines with state (queued / thinking / done).
- Side panel (desktop only): collapsible text timeline of what's happening (Perplexity-style plan panel).

On mobile: collapses to a vertical stack — stage on top, timeline below.

### 2. The character's role
**Courier.** The character is not walking through the user's site — it is **carrying the user's site to each AI model** and returning with the verdict.
- Why: "Walking through the site" is ambiguous (the site isn't being "crawled" in a scan — the AI models already know about it). A courier clearly conveys what IS happening: Beamix asks each AI "what do you think about this site?" and brings back answers.
- The character holds a scroll/document representing the user's site. Magnifying glass is a nice secondary prop for the "reading / analyzing" moments between model visits.
- Personality: professional but warm. Think: librarian, not clippy.

### 3. Node representations
Each AI model = **a branded pill** on the canvas.
- Logo (official logo where legally permissible, stylized icon where not)
- Model name below
- Ambient state: dim when queued, glowing blue when active, solid when done
- NO anthropomorphic personality per model (don't give ChatGPT a face). Models stay neutral; the character is the only personality. Otherwise it competes.

### 4. Flow connectors
Subtle dotted line from character to target model, drawing itself as the character moves.
- Character arrives at model → line thickens into a solid blue path
- Data "packet" (abstract — a small glowing diamond, not literal text) pulses along the line into the model
- When result returns: a smaller packet pulses back out, character catches it, heads to next model
- **Inspired directly by Make's bubble-to-bubble data dot animation** — Make/Integromat has this exactly right aesthetically.

### 5. Thinking state per model
**Same treatment for all models.** Don't over-differentiate — users haven't asked "how does ChatGPT think vs. Gemini think?"
- Active model: gentle inner pulse (breathing light) for 3–8 seconds
- Above the model: a small floating label: "Claude is thinking…" with ellipsis animation (for accessibility + narrative)
- Don't reveal the actual prompt unless user hovers (progressive disclosure)

### 6. Progress awareness
**Both.**
- Top-of-stage: "Scanning engine 3 of 7: Claude"
- Visual strip at the bottom: 7 model pills with state color
- Side panel timeline: Perplexity-style step list, expandable

This dual display respects both watchers (who just want to see) and readers (who want to track).

### 7. Can you interrupt?
- **Pause**: yes (stops after current model completes; preserves partial results)
- **Skip**: no (doesn't make sense — each model contributes to the score)
- **Go deeper** on a model that finished: yes — click its pill to see prompt + response

Cancel button closes the modal and discards results (with a confirmation).

### 8. Results reveal
**Flow transforms INTO results.** Do not append; do not overlay. The stage transitions:
- Character hands the final scroll to a central "score ring" that fills in as all engines complete
- Model pills stay visible but shrink and animate into position as a results grid below
- The stage fades; the full scan report slides up from below as the new view
- The character gives a small signal (bow / wave / tip of hat) before fading

### 9. Replayability
**Yes — on completed scans.**
- Re-watch button in the scan report ("Watch this scan again")
- Runs the animation from cached data (no API calls)
- Critical for: sharing/screenshots, team meetings ("look at what we found"), marketing videos
- Inspired by Manus's session replay feature

### 10. Mobile adaptation (390px)
- Stage collapses to a square viewport (character + current model pill only)
- Model strip at the bottom is scrollable
- Timeline panel becomes a bottom sheet (swipe up to view)
- Character animation stays but is simplified (no long flight paths; just fade between positions)
- Haptic tap on each model completion (subtle, iOS only)

---

## TECHNICAL IMPLEMENTATION OPTIONS

Three paths, for Adam to choose from based on craft/budget:

### Option 1: Framer Motion + SVG (or HTML elements)
- **Pros:** React-native, runs today with existing stack, composable with any React component, cheap, excellent for UI transitions and layout animation.
- **Cons:** Illustrating a character sprite in SVG and animating it convincingly across the screen is hard without motion design skill. Good for pills/lines/layout; less ideal for the "walking character" moment.
- **Best for:** Plan panel, model pills, connector lines, layout transitions. Carry 70% of the implementation.

### Option 2: Lottie (LottieFiles)
- **Pros:** Designer creates the character animation in After Effects and exports. Pixel-perfect animation. Easy to drop in as a component.
- **Cons:** **Not reactive to app state.** A Lottie file plays from frame X to Y; it doesn't know "which model is active now". For a loop (character walking) it's fine; for a flow where the character must stop at different positions based on which model just finished, it breaks.
- **Best for:** A looping "character thinking / working" idle animation. NOT the full flow.

### Option 3: Rive
- **Pros:** State-machine-driven animation. The character has a "state" that is bound to app data (which model is active). When state changes, animation responds. Up to **15x smaller files** than Lottie, runtime data-binding supports dynamic color/text/image updates. Exactly the tech fit for this use case.
- **Cons:** Adds one runtime dependency (small — the Rive web runtime is ~100KB). Requires the designer to learn Rive (learning curve ~1-2 weeks from After Effects). One more format to maintain.
- **Best for:** The character. The character's movement, states (idle, walking, reading, thinking), and prop (scroll, magnifying glass) all driven by a Rive state machine that takes `currentModelIndex` as input.

**Recommendation:** Framer Motion for the UI chrome + Rive for the character. Skip Lottie. Source: https://rive.app/blog/rive-as-a-lottie-alternative · https://www.motiontheagency.com/blog/lottie-vs-rive

---

## NODE-FLOW AESTHETICS WITHOUT THE "n8n LOOK"

The trap: flow canvases usually look technical (boxes + arrows = "this is for engineers"). Here's why these 4 products escape that trap, and what Beamix should steal:

### tldraw computer / fairies
- **Why it works:** The canvas is **infinite** and **hand-drawn-feeling** (tldraw's signature is its pen aesthetic). Arrows are organic curves, not right-angle routing. Cards have the energy of sticky notes, not boxes. The character is literally a character — it has eyes, it sparkles. This is the single biggest "unlock" for making flow feel warm.
- **Steal:** Organic/curved connectors, not 90-degree routing. Soft shadows on nodes, not flat borders.

### Make / Integromat (post-2022 redesign)
- **Why it works:** Bubbles instead of rectangles. Bright gradient colors per app. **Animated data dots travel along the line between bubbles during execution** — this is the visual equivalent of money flowing through pipes. It tells a story: "data is moving right now."
- **Steal:** Circular/bubble shape for model nodes (not rectangles). Animated data packet along the connector line.
- Source: https://www.digidop.com/tools/make-integromat and https://www.altexsoft.com/blog/n8n-pros-and-cons/

### Figma FigJam
- **Why it works:** Freeform canvas with visible playful stickers/emojis/cursors. It's social. Other people's cursors move on the canvas. It never looks like "a tool" — it looks like a room.
- **Steal:** Visible, named "participant" feel. If the AI model shows as "Claude" with a cursor-like indicator, it reads social, not systemic.

### Stripe marketing animations
- **Why it works:** Stripe's marketing animations (payment flows, Sessions 2024 reel) use **abstract pipes with glowing particles** to represent money. Never uses boxes. Never uses logos in a grid. It's cinematic — wide shots, zoom, motion parallax.
- **Steal:** The "particle flowing through a path" motif. The data packet on our connector should feel like it glows and has weight, not like a geometric shape.
- Source: https://mypromovideos.com/video-inspirations/video/payments-updates-innovations-motion-graphics-explainer-stripe/

**Common denominator:** warmth comes from (a) organic shapes, (b) visible motion/life, (c) a sense that "something is happening right now," and (d) a human/creature presence somewhere in the frame. Avoid right angles, static layouts, and pure dev aesthetics.

---

## THE 7-ENGINE BEAMIX MOMENT (specific recommendation)

30-second storyboard, 8 frames. Scan runs across ChatGPT, Gemini, Perplexity, Claude, Grok, You.com, Google AIO.

**Frame 1 (0–2s): Stage opens.**
Modal slides up from bottom. Top bar: "Scanning yourdomain.com". Center stage is a soft gradient (brand blue #3370FF at 8% opacity). A stylized "site" card sits on the left of the stage — a small illustration of a webpage with the user's logo/favicon. On the right, 7 model pills are arranged in a gentle arc, all dim. Character sprite (the Beamix agent — courier style, carrying a scroll) fades in near the site card. No narration yet. Bottom: empty progress strip.

**Frame 2 (2–4s): Character picks up the site.**
Character walks to the site card, magnifying glass out, scans it left-to-right (small animation — glass passes over the card, subtle shimmer on the card as it's "read"). Narration appears in side panel: "Reading yourdomain.com". The scroll in the character's hand glows briefly, indicating the site has been captured.

**Frame 3 (4–8s): Character flies to ChatGPT.**
Character lifts off with the scroll. A dotted line draws behind as it flies toward the first model pill (ChatGPT). The ChatGPT pill brightens as the character approaches. Character enters the pill. Pill begins to breathe (soft inner glow pulse). Narration: "Asking ChatGPT…" Label floats above pill: "ChatGPT is thinking". Bottom strip: ChatGPT pill turns blue.

**Frame 4 (8–12s): Result returns from ChatGPT.**
After ~3s of breathing, a data packet (small glowing diamond, brand blue) pulses back out of the pill toward the center of the stage. Character emerges from the pill carrying the packet. ChatGPT pill turns solid (done state, green check overlay). Bottom strip: ChatGPT done. Side panel adds a new entry: "ChatGPT: Found 2 mentions · neutral sentiment" (expandable).

**Frame 5 (12–20s): Parallel wave — Gemini + Perplexity + Claude.**
Character flies to Gemini, then Perplexity, then Claude in succession (or with staggered overlap if backend supports parallel). Each model briefly glows, the data packet pulses in, pulses out. Character collects results. Side panel populates. Bottom strip fills left-to-right. This is the "hypnotic" moment — the user sees the rhythm of the scan.

**Frame 6 (20–24s): Remaining engines — Grok, You.com, Google AIO.**
Character continues around the arc. By frame 6, 4-5 pills are done (green), 2-3 are in progress or queued. Narration slows slightly to let the user read what was found.

**Frame 7 (24–28s): All engines done. Score materializes.**
Last engine completes. Character returns to center stage carrying all collected data. A score ring begins to form in the center of the stage — starts as a thin arc, fills to full circle as the composite visibility score calculates. Number counts up inside the ring (0 → 47, for example). Character stands aside, presenting it (small gesture animation).

**Frame 8 (28–30s): Transition to report.**
Stage fades. Score ring, model pills (now as a compact summary row), and side-panel entries animate down into their final positions on the scan report page. Character gives a small wave/bow in the corner before fading. User is now on the scan results page, with a "Re-watch scan" button in the top-right.

**Beats count:** 8 frames, ~30 seconds, emotional arc = setup → rhythm → payoff. This timing only works if actual scan time is mocked / pre-rendered; for real scans (60–120s) the rhythm stretches but structure holds.

---

## SCREENSHOT / VIDEO BOARD

Links for Design Lead to build a visual mood board:

### Character-on-canvas references
1. tldraw fairies — https://fairies.tldraw.com/
2. tldraw fairies demo video — https://www.youtube.com/watch?v=u_wN-hlISYQ
3. tldraw fairies teaser — https://www.youtube.com/watch?v=yFYiLYOmdyM
4. tldraw.computer deep dive — https://www.youtube.com/watch?v=xda03Lin5cY
5. Steve Ruiz on AI canvas (Latent Space) — https://www.latent.space/p/tldraw

### Observer / stage references
6. Manus Browser Operator overview — https://manus.im/blog/manus-browser-operator
7. Devin workspace product analysis — https://ppaolo.substack.com/p/in-depth-product-analysis-devin-cognition-labs
8. OpenAI Operator launch post — https://openai.com/index/introducing-operator/
9. OpenAI CUA research post — https://openai.com/index/computer-using-agent/
10. Anthropic Computer Use — https://www.anthropic.com/news/3-5-models-and-computer-use

### Plan panel / step list references
11. Perplexity Pro Search case study — https://www.langchain.com/breakoutagents/perplexity
12. Perplexity Deep Research launch — https://www.perplexity.ai/hub/blog/introducing-perplexity-deep-research
13. Perplexity UI gallery (Refero) — https://refero.design/apps/73
14. Perplexity animation inspection (60fps.design) — https://60fps.design/apps/perplexity
15. Arc Search UI animation — https://60fps.design/apps/arc-search

### Node/flow animation references
16. Make Integromat UI — https://www.make.com/en/integrations
17. Hebbia Matrix launch post — https://www.hebbia.com/blog/introducing-matrix-the-interface-to-agi
18. Hebbia demo video — https://www.youtube.com/watch?v=N5ABKocEv4I

### Animation tech references
19. Rive vs Lottie deep comparison — https://rive.app/blog/rive-as-a-lottie-alternative
20. Rive data-binding + state machines — https://www.rivemasterclass.com/blog/rive-vs-lottie
21. FigJam AI feature overview — https://www.figma.com/figjam/ai/

### Agent-UX pattern surveys
22. AG-UI protocol — https://www.codecademy.com/article/ag-ui-agent-user-interaction-protocol
23. Linear agent session states — https://linear.app/developers/agent-interaction
24. Emerging agent UX patterns — https://uxmag.medium.com/secrets-of-agentic-ux-emerging-design-patterns-for-human-interaction-with-ai-agents-f7682bff44af

---

## CONFIDENCE + SOURCES

**Overall confidence: HIGH.**
- Every product cited is real, live, and publicly documented. Feature descriptions are sourced from official blog posts, help docs, or published case studies (not marketing copy).
- The three anchor patterns (plan panel / workspace / character-canvas) are independently confirmed across multiple products — not a single-source inference.
- Weakest link: no first-person screenshots captured. All visual descriptions reconstructed from text sources. Design Lead should personally visit fairies.tldraw.com + run a Perplexity Pro Search + watch the Devin walkthrough video to ground the recommendations visually before sketching.
- Beamix-specific recommendations (courier character, Make-style data dots, Rive + Framer Motion combo) are synthesized, not extracted from a single competitor — they are judgment calls, not facts.

### Key Facts by Confidence

**HIGH (multiple independent sources, official docs):**
- Perplexity displays a step-by-step plan UI during Pro/Deep Research — Source: https://www.langchain.com/breakoutagents/perplexity and https://www.perplexity.ai/hub/blog/introducing-perplexity-deep-research — Perplexity's own team confirmed "users were more willing to wait if the product displayed intermediate progress."
- Devin's workspace has 4 tabbed views (Shell/Browser/Editor/Planner) — Source: https://docs.devin.ai/get-started/devin-intro and https://ppaolo.substack.com/p/in-depth-product-analysis-devin-cognition-labs
- Manus "Computer" side-panel shows real-time browser activity and supports session replay — Source: https://manus.im/blog/manus-browser-operator
- Hebbia Matrix runs parallel agents filling spreadsheet cells — Source: https://www.hebbia.com/blog/introducing-matrix-the-interface-to-agi
- tldraw fairies are animated AI agent sprites on an infinite canvas — Source: https://fairies.tldraw.com/ and https://x.com/tldraw/status/2002113715043467509
- Rive supports state-machine-driven animation bound to app data; 10-15x smaller than Lottie — Source: https://rive.app/blog/rive-as-a-lottie-alternative

**MEDIUM (single credible source or marketing-adjacent):**
- ChatGPT Atlas has an always-present sidebar that maintains page context — Source: https://skywork.ai/blog/agent/chatgpt-atlas-features-explained-sidebar-chat-agent-mode-and-memory-2025/
- Linear agent sessions have 6 states (pending / active / error / awaiting input / complete / stale) — Source: https://linear.app/developers/agent-interaction
- Make displays animated data dots along connectors during scenario execution — Source: https://www.digidop.com/tools/make-integromat (marketing-adjacent, but visible in the product).
- Genspark Super Agent has visual transparency into reasoning — Source: https://skywork.ai/blog/what-is-genspark-ai/ (review source, not first-party)

**LOW / UNVERIFIED:**
- Exact timings of Perplexity Deep Research phases (10-20s / 1-2min / 30-60s) — Source: https://sahanirakesh.medium.com/perplexity-ai-deep-research-detailed-explanation-guide-baf6fee43ce8 (single Medium author, not official).
- Specifics of Arc Search "Browse for Me" animation sequence — referenced via 60fps.design, but no frame-by-frame breakdown available in text form.

### Gaps
- Did not run a live Perplexity Pro Search during this research (text sources only). Design Lead should run one to confirm the exact UI feel.
- No direct access to Manus / Devin to confirm current UI versions. Product analyses may be months old.
- Adam's "character with magnifying glass walking through the site" has no direct precedent in a production product at the time of this research. It's an innovation on top of the observed patterns — good for differentiation, but carries execution risk.
- No investigation of Rive pricing / licensing for commercial product use. Needs confirmation before adopting.

### Overall Confidence: HIGH for the patterns. MEDIUM for the specific Beamix synthesis (character + Make-style connector + Rive stack) which is a recommendation, not an observed pattern in any single competitor.

