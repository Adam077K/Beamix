# Reference Hunt 1 — Hand-Drawn Animation Inside Products

**Date:** 2026-04-25
**Researcher:** researcher-handdrawn-anim (purple)
**Goal:** 15+ pixel-copyable animation references for Beamix's "Claude-style" in-product animation layer.
**Scope filter:** Production product UIs only. Marketing-page mascots, splash screens, and concept reels excluded unless explicitly noted.

---

## TL;DR — for the impatient

- **Anchor stack to copy:** Claude.ai (asterisk/spinner + sketched artifacts), Excalidraw (rough.js everywhere), tldraw (perfect-freehand pen + canvas chrome), Notion AI face (Rive state machine character), PostHog Max (animated mascot inside the toolbar).
- **Three OSS primitives that get us 80% of the way:** `perfect-freehand` (MIT) for any line we draw, `rough.js` / `rough-notation` (MIT) for sketchy shapes + annotations, `Excalifont` (OFL) for typography that whispers "hand-drawn" without yelling.
- **Movement style to copy:** Slow ease-in-out path-draw on entry (700–1200ms), 4–7% jitter on stroke width, 50–120ms stagger between chained lines, idle micro-loop (asterisk-style) at 800–1200ms cycle.
- **What to avoid:** literal Comic Sans, googly eyes, full-page mascots inside dashboards, Lottie-style "wave hello" stock doodles, anything that screams "Duolingo for B2B."

---

## TOP 5 ANCHOR PRODUCTS — what we copy most heavily from

### 1. Claude.ai (Anthropic) — `https://claude.ai`

**Why:** This is the closest existing reference to Adam's vision. Anthropic has chosen a hand-drawn idiom inside a serious enterprise tool, and they restrict it to thinking states + idle marks + sketchy artifacts. They never let it overpower the data. Reverse-engineered specifics are well documented (Kyle Martinez teardown).

**What to copy:**
1. **The asterisk family as the brand mark for "thinking."** Claude Code cycles `· ✻ ✽ ✶ ✳ ✢` with the first and last frame held longer than the middle frames — a custom ease that the human eye reads as "breath." [reverse-engineering]
2. **Hand-drawn spinner on web, ASCII spinner in CLI.** Same rhythm, two surfaces — the asterisk is the "voice of the brand" across surfaces. [martinez teardown]
3. **Status copy ("Sketching…", "ruminating", "lollygagging").** The text label is part of the animation — humans read these together as one composite signal that the system is alive but not panicking. [martinez teardown]
4. **Sketched artifact previews.** When Claude generates SVG/code-rendered artifacts, the in-app preview frame uses a softer, almost paper-like surface vs. the sharp outer chat UI — clear figure/ground separation that invites you to look at the artifact like a sketch. [Hungerford notes]
5. **Restraint everywhere else.** Hand-drawn is reserved for "the system is thinking" and "the system made a small artifact for you." Settings, account, history, payment screens are crisp — no doodles. This is the thing people miss when copying Anthropic.

**Trigger:** Idle (the small mark breathes), thinking (asterisk cycles + status text rotates), artifact reveal (paper-feel frame).
**Implementation hint:** The web spinner is SVG paths morphing over keyframes. The CLI uses ANSI color 174/216 with frame holds. Both are reproducible in <50 lines of code.

Sources:
- [Reverse Engineering Claude's ASCII Spinner Animation — Kyle Martinez, Medium](https://medium.com/@kyletmartinez/reverse-engineering-claudes-ascii-spinner-animation-eec2804626e0)
- [Drawing and Animating Graphics with Claude — Ola Hungerford](http://www.olahungerford.com/drawing-and-animating-with-claude/)
- [Claude Login surface](https://claude.ai/login)
- [Claude Design announcement (Apr 17 2026)](https://www.anthropic.com/news/claude-design-anthropic-labs)

---

### 2. Excalidraw — `https://excalidraw.com`

**Why:** The entire UI of a real productivity tool is drawn in a hand-drawn idiom — and people use it for serious enterprise architecture diagrams every day. Existence proof that "sketchy" is compatible with B2B trust. The aesthetic is achieved with one library (rough.js) plus one font (Excalifont/Virgil) — that's the whole recipe.

**What to copy:**
1. **rough.js as the visual primitive.** Every shape (rectangle, ellipse, arrow, polygon) goes through rough.js's sketchy renderer. We can do the same for any callout box, frame, or state badge that needs a hand-drawn read. [rough.js docs]
2. **Stroke styles offered as user choice: solid / dashed / dotted / hand-drawn.** That hierarchy is gold — "hand-drawn" is one of four equally legitimate options, not the default. [tldraw shape comments]
3. **Excalifont (OFL-1.1) as the typeface.** Hand-drawn body type that's actually legible at small sizes. We can selectively apply it to "drawn callouts," empty-state messages, and section headers — but never to data tables. [Excalidraw blog]
4. **Multiple "roughness" levels.** rough.js exposes a `roughness` parameter (0=clean, 2=very sketchy). Excalidraw uses this so the same shape system can render anywhere on the spectrum from "real diagram" to "doodle." We can tune this per surface. [rough.js docs]
5. **Subtle paper feel without an actual paper texture.** Excalidraw doesn't use noise overlays — it just relies on the irregularity of rough.js strokes to imply paper. Cleaner and more performant than texture overlays.

**Trigger:** Static — Excalidraw isn't really animated. The hand-drawn-ness comes from the rendering, not motion. This is important: it tells us we don't *need* motion to feel hand-drawn.
**Implementation hint:** rough.js is <9KB gzipped. We can render to either Canvas or SVG. SVG is the right choice for us (animatable, accessible, scalable).

Sources:
- [Excalidraw — open source whiteboard](https://excalidraw.com)
- [Excalidraw GitHub](https://github.com/excalidraw/excalidraw)
- [Rough.js homepage](https://roughjs.com/)
- [Excalifont — official Excalidraw hand-drawn font (OFL-1.1)](https://plus.excalidraw.com/excalifont)

---

### 3. tldraw + tldraw computer — `https://tldraw.com` / `https://computer.tldraw.com`

**Why:** Steve Ruiz wrote `perfect-freehand` and uses it everywhere in tldraw — so when we use perfect-freehand we are inheriting the same algorithm that powers a production tool that millions of designers use, and the same algorithm Canva and draw.io adopted. tldraw computer also shows what AI-on-canvas looks like with hand-drawn primitives, which is directly Adam's "agents working" scenario.

**What to copy:**
1. **`perfect-freehand` for every drawn line.** It produces pressure-sensitive, breath-shaped strokes that look hand-drawn without looking childish. We feed it any sequence of points (real or generated) and get back a polygon path that we render as SVG. Used in production by tldraw, Canva, draw.io, ExcalidrawPlus. [perfect-freehand discussion]
2. **The 4-stroke-style mental model** (solid / dashed / dotted / draw) — borrowed from the Excalidraw lineage but extended in tldraw with palm rejection, pressure curves, zoom-adaptive precision. [tldraw draw shape docs]
3. **Streaming AI responses on canvas.** tldraw computer streams agent thinking *visibly on the canvas* — partial responses render gracefully. This is the "agent working" pattern for a hand-drawn surface: the system draws as it thinks, and partial state is OK. [tldraw blog/agent kit]
4. **Arrows-as-context.** tldraw computer encodes "what depends on what" as actual drawn arrows between nodes, with the arrows themselves rendered hand-drawn. For Beamix this is a metaphor for "this scan input → this engine → this rank result." [tldraw computer demo]
5. **The visible-screenshot + structured-state dual representation.** Each canvas operation has both a hand-drawn visual side and a clean data side — same idea Beamix needs ("for the SMB owner, this looks intuitive; for the agent, it's structured JSON").

**Trigger:** While drawing (real-time perfect-freehand), agent acting (streaming partial shapes), idle (none — tldraw is static when not in use).
**Duration/easing:** Pressure-mapped. perfect-freehand stroke smoothing is `0.5` default, streamline `0.5` default — these are the "feels right" values to start from.
**Implementation hint:** `getStroke(points, { size, thinning, smoothing, streamline })` returns polygon points. Convert to SVG `d=` attribute. Animate `pathLength` 0→1 with Framer Motion for entry.

Sources:
- [tldraw — drawing & canvas interactions](https://tldraw.dev/features/composable-primitives/drawing-and-canvas-interactions)
- [perfect-freehand on GitHub (MIT)](https://github.com/steveruizok/perfect-freehand)
- [perfect-freehand discussion: production users](https://github.com/steveruizok/perfect-freehand/discussions/38)
- [tldraw computer demo](https://computer.tldraw.com/)
- [tldraw computer YouTube tour](https://www.youtube.com/watch?v=Kn1De5uwrlY)
- [Agent starter kit — tldraw docs](https://tldraw.dev/starter-kits/agent)

---

### 4. Notion AI character (built by BUCK in Rive) — inside Notion

**Why:** The single best example of "hand-drawn character living inside a serious productivity tool." Eyes + brows + nose only — no full character — and the simplicity is what makes it work for B2B. Built in Rive with a state machine, so the same character mixes-and-matches expressions instead of looping fixed clips. This is exactly the architecture Beamix would want for an "agent companion" if we ever go that direction.

**What to copy:**
1. **Reduce the character to its essentials.** No body, no full face — eyes + brows + nose. Eyebrows wave when thinking; the face momentarily falls apart for errors. This level of minimalism is what keeps it from feeling "kid-friendly mascot." [BUCK case study]
2. **Cel-drawn frames as the source.** BUCK started with hand-drawn cel animation, then ported into Rive. The handmade feel survives because the underlying frames were drawn by a human, not generated by an algorithm. [BUCK case study]
3. **State machine architecture so expressions layer.** "Thinking + indicating progress" is a *combination* of two atoms, not a separate animation. Rive's state machine lets us compose this. [Rive docs]
4. **Per-state copy.** Each state (listening, thinking, writing, error) has both a visual and an implicit voice — same pattern as Claude's "ruminating" labels. [BUCK case study]
5. **Constrained location.** The face appears in the Notion AI surface, not on every page of Notion. Hand-drawn personality lives where the AI lives, and lets the rest of the UI stay neutral.

**Trigger:** Activation of Notion AI panel (idle face), user prompt (thinking face), success (writing face), error (face falls apart).
**Implementation hint:** `@rive-app/react-canvas` exposes `useRive` and `useStateMachineInput` hooks. We define state machine in Rive editor, ship one `.riv` file (typically 30–80KB), trigger inputs from React.

Sources:
- [BUCK — Notion AI Assistant case study](https://buck.co/work/notion-ai)
- [The Brand Identity — How BUCK gave Notion's AI assistant a hand-drawn personality](https://the-brandidentity.com/project/how-buck-gave-notions-ai-assistant-a-hand-drawn-personality)
- [School of Motion — Buck makes Rive Magic for Notion AI](https://www.schoolofmotion.com/blog/motion-mondays-may-12-2025)
- [Rive React runtime (rive-react on GitHub)](https://github.com/rive-app/rive-react)
- [Rive State Machines guide](https://help.rive.app/runtimes/state-machines)

---

### 5. PostHog Max the hedgehog — inside the PostHog product UI

**Why:** Most "mascot in B2B" examples are marketing-only. PostHog put Max **into the product** — the toolbar icon is animated, the help menu lets him jump/spin/wave/dance, and the team employs two full-time illustrators specifically to keep the in-product art fresh. They've made the case that a B2B analytics product can have personality without losing developer trust. The aesthetic is hand-drawn line art, not 3D rendered, which is exactly Beamix's lane.

**What to copy:**
1. **Animated icon in the toolbar** — Max replaces what would otherwise be a static logomark, and his pose changes based on which toolbar tool is active. We can do the same with a small Beamix mark in the dashboard chrome. [PostHog Aruba hackathon blog]
2. **"Help menu" as a personality surface.** Max accessible via the help menu can jump, spin, wave, dance — he's a stress-relief Easter egg, not the main UI. Beamix could put a small hand-drawn idle-loop in our help/empty/loading surface, never on the dashboard itself.
3. **Strict visual rules.** Beige body, brown spines, monoline outlines, faces left/right/forward only — never side-profile, never back. Strong rules are what keep the character from drifting into illustration-of-the-week chaos. We need a similar rulebook.
4. **Two full-time illustrators.** The lesson: if the brand voice is hand-drawn, treat it as a real production discipline, not "we'll make some cute icons in a sprint." Either fund it properly or don't do it.
5. **Hogotchi / virtual-pet experiments.** PostHog ships side-experiences with Max (e.g. Hogotchi push-notification demo) that reinforce the brand without polluting the main product. Equivalent for Beamix could be a tiny "mascot in the empty state of an agent the user hasn't tried yet."

**Trigger:** Toolbar icon state change (active tool), help menu open (idle motion loop), Easter eggs.
**Implementation hint:** PostHog uses static SVG with manual frame transitions. Lottie or Rive would be modern alternatives. The illustrations themselves are vector line art with monoline outlines.

Sources:
- [PostHog handbook — Logos, brand, hedgehogs](https://posthog.com/handbook/company/brand-assets)
- [PostHog blog — How we designed the PostHog mascot](https://posthog.com/blog/drawing-hedgehogs)
- [PostHog Aruba hackathon (revamped Toolbar with animated Max)](https://posthog.com/blog/aruba-hackathon)
- [Product Growth Blog — PostHog branding playbook](https://www.productgrowth.blog/p/posthog-branding-playbook)

---

## FULL REFERENCE LIBRARY (additional 12 references)

### 6. Claude Code (Anthropic CLI)

- **In-product locations:** Spinner during model inference; the spark/spark-icon in the editor toolbar in VS Code integration; tab status dot (blue = permission pending, orange = finished while tab hidden); status copy ("Sketching…", "ruminating").
- **Style/technique:** ASCII characters cycled in terminal; SVG asterisk in VS Code panel.
- **Trigger + duration:** Cycles every ~80–120ms per frame; first/last frame held longer (custom ease).
- **What makes it hand-drawn:** Asterisk shape is itself a sketchy mark; the pacing imitates breath rather than CPU rotation.
- **Steal this:** (a) The asterisk family. (b) The first/last-frame-hold easing. (c) Status text rotation as part of the animation.
- Sources: [Reverse engineering Claude's spinner](https://medium.com/@kyletmartinez/reverse-engineering-claudes-ascii-spinner-animation-eec2804626e0) · [Claude Code in VS Code docs](https://code.claude.com/docs/en/vs-code)

### 7. Vercel v0 — `https://v0.dev`

- **In-product locations:** Real-time component preview while v0 generates; sketch-image-input panel; streaming code editor.
- **Style/technique:** Skeleton shimmer on the preview pane during generation; streaming text into chat. Not literally "hand-drawn" but the *generation reveal* pattern is exactly what Beamix scan-reveal needs to feel like.
- **Trigger + duration:** Streams as soon as first token arrives; preview rehydrates progressively.
- **What makes it feel crafted:** "You see the UI taking shape before the code is even finished" — partial visible state instead of all-or-nothing reveal.
- **Steal this:** (a) Show partial output as it arrives, never block until 100%. (b) When uploading sketches, treat them as first-class input, not a curiosity.
- Sources: [v0 by Vercel](https://v0.dev/) · [Maximizing outputs with v0 — Vercel blog](https://vercel.com/blog/maximizing-outputs-with-v0-from-ui-generation-to-code-creation) · [Build Frontend UIs from Sketches with v0](https://markaicode.com/generative-ui-vercel-v0-sketches/)

### 8. Cursor 2.0 / Composer

- **In-product locations:** Agent panel with parallel agent runs; diff review UI; "Agent is ready" indicators; new default themes.
- **Style/technique:** Streaming text + skeleton + minimal motion. Less hand-drawn, more "calm AI."
- **Trigger + duration:** Stream begins on first token; sub-second time-to-first-response is the explicit bar.
- **Steal this:** (a) Sub-1s time-to-first-visible-response is the right bar. (b) Persistent inline widget — don't make users hunt for the agent's status. (c) Multiple agents can run in parallel — visual treatment must scale.
- Sources: [Introducing Cursor 2.0 and Composer](https://cursor.com/blog/2-0) · [Cursor 0.46.x changelog (UI refresh)](https://cursor.com/changelog/0-46-x) · [Cursor product page](https://cursor.com/product)

### 9. Replit Ghostwriter / Agent

- **In-product locations:** Inline streaming code suggestions in the editor; persistent inline widget for actions; sub-1s response.
- **Style/technique:** Token streaming directly in the gutter, not a popup.
- **Trigger + duration:** Begins as you type, completes on idle.
- **Steal this:** (a) "Streamed directly inside your editor, so the language model's response is shown incrementally as it's generated." We need the same for agent outputs in Beamix. (b) Persistent widget that stays open while the user navigates — don't disappear when the user clicks elsewhere.
- Sources: [Replit — Improving the Inline Ghostwriter Experience](https://blog.replit.com/ghostwriter-inline) · [Replit — Building Ghostwriter Chat](https://blog.replit.com/ghostwriter-building)

### 10. Granola — `https://granola.ai`

- **In-product locations:** Green dancing audio bars at bottom of note while listening; floating "live meeting" indicator nub on right edge of screen when meeting is recording; gray vs. green transcript bubbles (system audio vs. user mic).
- **Style/technique:** CSS / SVG audio bar animation; floating draggable persistent indicator.
- **Trigger + duration:** Always running while recording. The floating nub persists across apps so the user always knows recording is active.
- **What makes it crafted:** The floating nub is the killer detail — it follows the user across the OS, not just the app, and it's draggable and dismissable.
- **Steal this:** (a) Persistent across-OS / persistent-across-page indicators when an agent is live. (b) Two-color transcript bubble convention — sender-side / receiver-side, with a single accent color difference. (c) Audio bars: 5 vertical bars with phased sine animations, not literal waveform.
- Sources: [Granola — How transcription works (docs)](https://docs.granola.ai/help-center/taking-notes/transcription) · [Granola Changelog](https://www.granola.ai/docs/changelog) · [How Granola enhances note-taking with context and user intent](https://intelligentinterfaces.substack.com/p/how-granola-enhances-note-taking)

### 11. tldraw computer — `https://computer.tldraw.com`

- **In-product locations:** Canvas itself (every shape is hand-drawn); arrows between nodes; agent partial responses streaming as canvas operations.
- **Style/technique:** perfect-freehand for strokes; rough-style shapes for nodes; AI streams shape-creation commands that render incrementally.
- **Trigger + duration:** User input + AI generation; partial responses render as they arrive.
- **Steal this:** (a) "Arrows are the context" — encode dependency visually. (b) Both visual + structured-data representations of the same state. (c) Partial-stream rendering of agent output.
- Sources: [tldraw computer demo](https://computer.tldraw.com/) · [tldraw and AI on the canvas — YouTube](https://www.youtube.com/watch?v=xda03Lin5cY) · [tldraw computer — natural language OS analysis](https://www.hackscience.education/the-computer-you-draw-inside-tldraws-natural-language-os/)

### 12. Hebbia Matrix

- **In-product locations:** Grid interface where each cell shows an AI step; ability to "edit the AI's thought process" inline; citation traces on every output.
- **Style/technique:** Not literally hand-drawn — but a strong reference for "show every step the AI took, with sources." This is the trust pattern for an enterprise agentic product.
- **Steal this:** (a) Every agent output cell links back to its source. (b) Users can edit-and-rerun any step. (c) Multi-agent execution visualized as parallel rows/columns.
- Sources: [Hebbia product page](https://www.hebbia.com/product) · [Inside Hebbia's Deeper Research Agent](https://www.hebbia.com/blog/inside-hebbias-deeper-research-agent) · [OpenAI showcase — Hebbia](https://openai.com/index/hebbia/)

### 13. Linear (March 2026 UI refresh)

- **In-product locations:** Redrawn icon set across all entities; consistent headers and view controls; dimmed sidebar so main content stands out.
- **Style/technique:** Geometric, not hand-drawn — but the *philosophy* is the lesson. "Not every element should carry equal visual weight." This is exactly how we use hand-drawn motion: only on elements where attention belongs, never on chrome.
- **Steal this:** (a) Calmer chrome lets bursts of personality (our hand-drawn animations) land harder. (b) Icons resized + reduced — fewer, more meaningful icons rather than icons-everywhere. (c) Soft contrast on borders, sharp content.
- Sources: [Linear changelog — UI refresh (Mar 12 2026)](https://linear.app/changelog/2026-03-12-ui-refresh) · [Linear — A calmer interface for a product in motion](https://linear.app/now/behind-the-latest-design-refresh) · [Linear — How we redesigned the Linear UI (part II)](https://linear.app/now/how-we-redesigned-the-linear-ui)

### 14. rough-notation (library, used in many B2B sites)

- **In-product locations:** Underlines, circles, brackets, highlights drawn as you scroll past — used in onboarding tooltips, marketing pages, and pricing pages.
- **Style/technique:** SVG, animated stroke-dashoffset, controllable color/strokeWidth/duration. Annotation-group lets you stagger.
- **Trigger + duration:** On viewport entry or on hover; default ~800ms, configurable.
- **Steal this:** (a) Use rough-notation for the "this is the thing you should look at" callout — not generic dotted underlines. (b) Annotation groups with sequential animation feel like a teacher writing on a whiteboard. (c) Don't overuse — one annotation per screen, max two.
- Sources: [rough-notation GitHub](https://github.com/rough-stuff/rough-notation) · [Rough Notation homepage + demos](https://roughnotation.com/) · [react-rough-notation on npm](https://www.npmjs.com/package/react-rough-notation) · [How to Use Rough Notation — freeCodeCamp](https://www.freecodecamp.org/news/how-to-add-animation-to-your-site-with-rough-notation/)

### 15. Claude Artifacts (in claude.ai chat surface)

- **In-product locations:** Right-pane artifact viewer when Claude generates SVG/HTML/diagrams.
- **Style/technique:** SVG rendering, optional CSS/SMIL animation. Anthropic explicitly leans into "stylized geometric" SVG output.
- **Steal this:** (a) Right-pane reveal animation — slide-in + fade — so artifacts feel separate from chat. (b) Artifacts render incrementally as the model writes them. (c) "Stylized + simple" beats "photorealistic" for in-product illustration.
- Sources: [Claude Artifacts: What They Are & How to Use Them](https://albato.com/blog/publications/how-to-use-claude-artifacts-guide) · [How to Create SVGs with Claude AI](https://www.svggenie.com/blog/create-svg-with-claude-ai) · [Claude Artifacts & ChatGPT Canvas — Joyce Birkins, Medium](https://medium.com/@joycebirkins/claude-artifacts-chatgpt-canvas-ai-text-based-visualization-svg-image-generation-1fc51d27c0a6)

### 16. Notion Calendar (formerly Cron)

- **In-product locations:** Hover transitions on event blocks, drag-resize feedback, command palette open/close, time-zone picker.
- **Style/technique:** Geometric, restrained, not hand-drawn. Inclusion is for the *restraint* benchmark — every micro-interaction is buttery, but nothing screams "look at me." A frame for what *not* to do (don't sprinkle hand-drawn everywhere).
- **Steal this:** (a) Buttery micro-interactions on functional UI elements (drag, resize, hover). (b) Hand-drawn must coexist with this level of polish on the rest of the app, not replace it.
- Sources: [Notion Calendar announcement](https://www.notion.com/blog/introducing-notion-calendar) · [Cron is now Notion Calendar](https://cronhq.notion.site/Cron-Calendar-5625be54feac4e13a75b10271b65ddb7)

### 17. Duolingo (mascot used as Lottie loading state)

- **In-product locations:** Lottie animations of Duo on loading and completion screens. Cited explicitly by ProtoPie as the canonical Lottie-mascot example.
- **Style/technique:** Lottie JSON, vector-based, lightweight (<50KB typical), hand-drawn-look character motion.
- **Trigger + duration:** Loading entry / lesson completion / streak celebration.
- **Steal this:** (a) Lottie for celebration moments (scan complete, agent finished a task) — but only celebration moments. (b) Vector-based mascot that scales without quality loss.
- **Be careful:** This is the boundary line — Duolingo's mascot works because Duolingo *is* a friendly app for language learners. For Beamix's serious-business audience, this register is too playful. Use as an upper bound on personality, not a target.
- Sources: [What are Lottie animations and how to use them in UI/UX — Icons8 dev blog](https://dev.blog.icons8.com/articles/lottie-animations/) · [5 Ways to Use Lottie Animations in High-Fidelity Prototypes — ProtoPie](https://www.protopie.io/blog/5-ways-to-use-lottie-animations-in-high-fidelity-prototypes)

---

## PATTERN VOCABULARY — what makes "hand-drawn in product" work

These are the patterns we extracted across all references. Each is a building block.

### Pattern 1 — Path-draw entry (the line that draws itself)
- Animate `pathLength` 0 → 1 (Framer Motion) or `stroke-dashoffset` length → 0 (CSS/GSAP).
- Default Framer Motion path easing is `easeInOut` — keep it. Duration **700–1200ms** for short marks, up to **2500ms** for long chained illustrations.
- Always set `strokeLinecap: round` and `strokeLinejoin: round` — sharp corners kill the hand-drawn feel.
- Source: [Motion — SVG Animation in React](https://motion.dev/docs/react-svg-animation) · [How to Animate SVG Paths with Framer Motion](https://blog.noelcserepy.com/how-to-animate-svg-paths-with-framer-motion)

### Pattern 2 — Stroke-width jitter
- Vary stroke width by **3–7%** across the line via small `<animate>` tags or by rendering the line as multiple paths with subtly different widths (perfect-freehand does this for free via the `thinning` parameter, default `0.5`).
- Without jitter, paths look CAD-perfect, which kills the human read.
- Source: [perfect-freehand API options](https://github.com/steveruizok/perfect-freehand)

### Pattern 3 — First-and-last-frame-hold ease (the "breath")
- For looping animations, hold the first and last frame ~30% longer than the middle frames. This is what makes Claude's asterisk feel alive.
- Implement with custom keyframe timings (e.g., Framer Motion `times: [0, 0.05, 0.5, 0.95, 1]`).
- Source: [Reverse engineering Claude's spinner — Martinez](https://medium.com/@kyletmartinez/reverse-engineering-claudes-ascii-spinner-animation-eec2804626e0)

### Pattern 4 — Chained-stroke stagger
- When drawing multiple lines (a sketched diagram, an illustration), stagger each subsequent line by **50–120ms** after the previous one ends.
- This is "follow-through and overlapping action" — Disney's 12 principles.
- GSAP's `stagger: { each: 0.08, from: "start" }` is one-liner. Framer Motion: `transition={{ staggerChildren: 0.08 }}`.
- Source: [GSAP staggers](https://gsap.com/resources/getting-started/Staggers/) · [Repeatable, Staggered Animation Three Ways — CSS-Tricks](https://css-tricks.com/repeatable-staggered-animation-three-ways-sass-gsap-web-animations-api/)

### Pattern 5 — Idle micro-loop (the asterisk-style breath)
- A 800–1200ms cycle on the brand mark when the system is idle but "alive." 4–6 frames or a continuous transform on a small SVG.
- Different from the thinking-state animation — this is much subtler, almost subliminal.
- The line is: idle = breath; thinking = active cycle.
- Source: Claude.ai observed behavior + [Reverse engineering Claude's spinner](https://medium.com/@kyletmartinez/reverse-engineering-claudes-ascii-spinner-animation-eec2804626e0)

### Pattern 6 — Stylized over realistic
- Geometric, simple, hand-drawn-look beats photorealistic illustration in product UIs.
- Claude's SVGs are described as "geometric and stylized by nature — fine for icons and UI elements, but limiting for illustrations."
- This is a feature, not a bug — for Beamix, "stylized geometric" hits the right register for SMB owners.
- Source: [Drawing and Animating Graphics with Claude — Hungerford](http://www.olahungerford.com/drawing-and-animating-with-claude/)

### Pattern 7 — Composable state machine instead of fixed clips
- Rive's state machine pattern (see Notion AI): expressions layer rather than replace.
- "Thinking + indicating progress" should be a *combination* of two atoms, not a separate clip you re-animated.
- Source: [Rive state machines](https://help.rive.app/runtimes/state-machines) · [BUCK — Notion AI case study](https://buck.co/work/notion-ai)

### Pattern 8 — Dual representation (visual + structured)
- Every hand-drawn artifact in tldraw also has a clean structured-data side.
- For Beamix, every drawn element ("scan running on engine X") needs an underlying JSON the agent reads. The drawing is for the human, the data is for the system.
- Source: [Agent starter kit — tldraw docs](https://tldraw.dev/starter-kits/agent)

### Pattern 9 — Streaming partial state instead of all-or-nothing
- v0, Cursor, Replit, Claude Code — they all stream output as soon as the first token arrives.
- For Beamix this means: scan-running animation should reveal results progressively, never wait for "100% then BAM."
- Sub-1s time-to-first-visible-response is Cursor's stated bar. Adopt it.
- Source: [Replit — Improving the Inline Ghostwriter Experience](https://blog.replit.com/ghostwriter-inline) · [Cursor changelog](https://cursor.com/changelog/0-46-x)

### Pattern 10 — Persistent indicator across surfaces
- Granola's floating nub. PostHog's animated toolbar Max. The brand mark in Claude Code that changes state.
- Pattern: when an agent is *live*, there should be a persistent visual marker the user can check from anywhere in the product (or even outside it).
- Source: [Granola transcription docs](https://docs.granola.ai/help-center/taking-notes/transcription) · [PostHog Aruba hackathon](https://posthog.com/blog/aruba-hackathon)

### Pattern 11 — Status copy as part of animation
- Claude's "ruminating", "lollygagging", "Sketching…" — text labels that rotate alongside the visual loop.
- Adam's scenarios should each have a small bank of status copy that rotates: "Asking the model…", "Comparing engines…", "Writing the brief…"
- The text is part of the animation; never silent.
- Source: [Claude on the web — observed status labels](http://www.olahungerford.com/drawing-and-animating-with-claude/)

### Pattern 12 — Rough.js as the visual primitive everywhere
- One primitive (rough.js) renders rectangles, circles, arrows, polygons in a sketchy style.
- Critically, rough.js exposes a `roughness` parameter — we can dial this from 0 (clean) to 2 (very sketchy) per surface. Settings page = roughness 0; agent execution panel = roughness 1.5.
- Source: [Rough.js docs](https://roughjs.com/) · [Hongkiat — Rough.js Hand-Drawn SVG Library](https://www.hongkiat.com/blog/roughjs-handdrawn-svg-library/)

---

## OPEN-SOURCE TOOLS WE COULD USE

| Tool | License | Size | Use for | Confidence |
|------|---------|------|---------|------------|
| `perfect-freehand` | MIT | tiny (~5KB) | Any drawn line — agent strokes, signatures, freehand inputs. Production-tested at tldraw, Canva, draw.io, ExcalidrawPlus. | HIGH |
| `rough.js` | MIT | <9KB gzipped | Sketchy rectangles/arrows/circles for callouts, frames, agent boxes. Powers Excalidraw. | HIGH |
| `rough-notation` | MIT | small | Hand-drawn underlines/circles/brackets/highlights triggered on scroll or hover. Great for onboarding tooltips. | HIGH |
| `Excalifont` | OFL-1.1 | ~150KB woff2 | Hand-drawn-feel typeface for callouts, empty states, section labels. Don't use for data tables. | HIGH |
| Rive runtime (`@rive-app/react-canvas`) | MIT runtime, free editor tier | ~150KB runtime + per-`.riv` (typically 30–80KB) | State-machine character animations. Required if we ever do a Notion-AI-style face. | MEDIUM |
| `lottie-react` / `dotlottie-react` | MIT | ~250KB | Pre-rendered celebration moments (scan complete, success). Use sparingly. | MEDIUM |
| Framer Motion | MIT | ~50KB | Path-draw, stagger, layout transitions. Already familiar to most React teams. | HIGH |
| GSAP + DrawSVGPlugin | club GreenSock (paid plugin) | ~30KB | Heavy-duty SVG path drawing if Framer Motion runs into >5-path scenes. | LOW (paid) |
| `react-mt-svg-lines` | MIT | tiny | Plug-and-play wrapper that animates stroke-dashoffset on every path inside. | MEDIUM |
| Excalidraw embed | MIT | medium | If we ever need a "draw your own diagram" canvas in-product, embed. | LOW (probably overkill) |

Sources:
- [perfect-freehand GitHub (MIT)](https://github.com/steveruizok/perfect-freehand)
- [Rough.js homepage](https://roughjs.com/)
- [rough-notation GitHub](https://github.com/rough-stuff/rough-notation)
- [Excalifont (OFL-1.1)](https://plus.excalidraw.com/excalifont)
- [Rive React runtime](https://github.com/rive-app/rive-react)
- [Motion — SVG animation in React](https://motion.dev/docs/react-svg-animation)
- [GSAP DrawSVGPlugin](https://gsap.com/docs/v3/Plugins/DrawSVGPlugin/)
- [react-mt-svg-lines on GitHub](https://github.com/moarwick/react-mt-svg-lines)

---

## ADAM'S 5 SPECIFIC ANIMATION SCENARIOS — closest references

### Scenario 1 — Onboarding URL entry → scan reveal
*(sketch outlines URL → company logo → search around → back to scan page → results blocks)*

**Closest references:**
1. **Vercel v0 sketch input → live preview generation** — they do "user provides rough input, system progressively reveals output" exactly. [v0 docs]
2. **tldraw computer agent kit** — partial canvas operations stream in as agent thinks; arrow-as-context is the metaphor. [tldraw agent kit]
3. **Claude artifact reveal** — slide-in + paper feel for the artifact pane. [Claude Hungerford]
4. **Excalidraw + rough.js** — for the "search around" sketched magnifying-glass moment. [Excalidraw]
5. **Granola live indicator** — for the persistent "scan in progress" nub.

**Recipe:** rough.js frame around the URL input → perfect-freehand magnifying glass that wiggles with bezier path → `pathLength` 0→1 stagger of ~5 result blocks at 80ms intervals → final reveal with shimmer pulse on the highest-scoring engine row.

### Scenario 2 — Scan running (~2 min, ~15s+ chained animation)
*(show technical work in hand-drawn way)*

**Closest references:**
1. **Claude.ai thinking spinner with rotating status copy** — pacing template + status text as part of animation. [Martinez]
2. **tldraw computer streaming agent** — shapes appear progressively as the LLM works. [tldraw computer]
3. **Replit Ghostwriter inline streaming** — sub-1s first response, persistent widget. [Replit blog]
4. **Granola "live meeting" floating nub** — persistent indicator while a long process runs. [Granola docs]
5. **Hebbia Matrix** — show every step the agent took, with citations. [Hebbia product]

**Recipe:** 5–7 stage cards laid out left-to-right, drawn in sequence with 200ms stagger. Each card is a rough.js outline. As the system reaches a stage, perfect-freehand mark "checks" the card with first-and-last-frame-hold. Status text rotates in caption ("Asking ChatGPT...", "Asking Claude...", "Comparing rankings..."). Idle asterisk in corner pulses throughout.

### Scenario 3 — Workspace agent execution (side panel)
*(agent icon walking around with tools, doing research, asking model, remembering)*

**Closest references:**
1. **Notion AI face (BUCK / Rive)** — eyes + brows + nose state machine that mixes thinking + writing + listening. [BUCK case study]
2. **PostHog Max in toolbar** — small mascot whose pose changes with active tool. [PostHog Aruba]
3. **Claude Code spark icon in VS Code** — color-dot status indicator on the brand mark. [Claude Code docs]
4. **tldraw agent starter kit** — chat panel + canvas streaming dual surface. [tldraw agent kit]
5. **Cursor Composer panel** — multi-agent parallel runs visible in one panel. [Cursor 2.0]

**Recipe:** Single Rive `.riv` file with a small character (or just the Beamix mark) and a state machine: `idle` / `researching` / `asking-model` / `writing` / `done` / `error`. Plus a 1px breathing line under the side panel header while any agent is active (Granola's nub, in-panel form).

### Scenario 4 — Results reveal
*(outline blocks fill in with content)*

**Closest references:**
1. **rough-notation underlines + brackets** — drawn-in callouts on key results. [rough-notation]
2. **Excalidraw shape reveal** — rough.js outlines that "harden" as the data loads. [Excalidraw]
3. **Lottie celebration moments** (used cautiously, Duolingo-style) — for the "you ranked #1" moment only. [Icons8 Lottie blog]
4. **Cursor diff-review reveal** — clean, fast, no celebration. [Cursor changelog]
5. **Hebbia matrix grid fill** — each cell loads independently with citation. [Hebbia product]

**Recipe:** rough.js outlines first (200–400ms path-draw with stagger), content fades in (skeleton → real, 200ms cross-fade), winning result gets a rough-notation circle (800ms ease-out). No Lottie except for one "scan complete" celebratory mark in the toast.

### Scenario 5 — Empty/loading/error states
*(hand-drawn placeholder visuals)*

**Closest references:**
1. **Notion AI "face falls apart" error state** — the character communicates the error before the error message does. [BUCK case study]
2. **Excalidraw empty canvas** — playful but not childish. [Excalidraw]
3. **PostHog Max in help menu** — contained personality on a non-critical surface. [PostHog handbook]
4. **rough-notation bracket** — for "this is where your X will appear." [rough-notation]
5. **Claude artifact panel idle state** — minimal mark, no character. [Claude Hungerford]

**Recipe:** Empty state = single rough.js illustration (~80×80px) + 1-line helper copy + 1-line CTA. Loading = the asterisk family + rotating status copy. Error = rough-notation strikethrough on the failing step + retry button. Never a full-screen mascot.

---

## WHAT WE WILL NOT DO — anti-patterns from this research

1. **No literal Comic Sans / Marker Felt fonts.** Excalifont is the line. Anything more cartoonish reads as "I made this in 2007 PowerPoint."
2. **No googly eyes / cartoon mascots inside dashboards.** PostHog Max works because he lives in the toolbar and help menu, not on the analytics page itself. Adam's "agent companion" idea must follow the same containment rule.
3. **No noise-texture paper overlays.** Excalidraw proves you can imply paper just from stroke irregularity. Texture overlays kill performance and look fake on retina displays.
4. **No emoji-heavy status copy.** "Sketching… ✏️" looks like an early Slack bot. Plain status text (Claude's "ruminating") is sharper.
5. **No "wave hello" stock Lottie doodles in onboarding.** This is the LottieFiles cliché. If we use Lottie, it's for one celebration moment per session, not for empty states or onboarding.
6. **No animated brand mark on every page.** The Claude asterisk is *only* the thinking-state spinner — when Claude isn't thinking, it's a static logo. Persistent motion is noise; trigger-bound motion is signal.
7. **No randomized roughness per render.** rough.js + perfect-freehand both have a `seed` parameter. Use it. Otherwise the same shape redraws differently on every re-render and feels glitchy, not hand-drawn.
8. **No motion below 250ms or above 2500ms for entry animations.** Sub-250ms = invisible, no value. Above 2500ms = blocks user, feels broken. Sweet spot is 500–1200ms for one-shot reveals, longer only for chained illustrations Adam wants to last 15s+ during scan.
9. **No "AI is thinking" robot/CPU/gear iconography.** The whole point is to *not* look like a generic AI app. Asterisks, breath marks, eyes, abstract pulses — yes. Spinning gears — no.
10. **No hand-drawn typography on data tables.** Numbers stay in Inter. The hand-drawn font is for callouts, status copy, illustration captions — not for the "27" in the rank column.

---

## CONFIDENCE SUMMARY

| Topic | Confidence | Why |
|-------|-----------|-----|
| Claude asterisk spinner mechanics | HIGH | Reverse-engineering article + observed behavior |
| Excalidraw / rough.js / Excalifont stack | HIGH | Open source, MIT/OFL licenses, well documented |
| perfect-freehand API + production users | HIGH | GitHub README + Steve Ruiz himself confirmed Canva/draw.io/Excalidraw use it |
| Notion AI character architecture | HIGH | BUCK case study + Rive state-machine docs |
| PostHog Max in-product animations | MEDIUM | Brand handbook + Aruba hackathon blog confirm toolbar animations; less detail on full state set |
| Granola listening indicator + floating nub | MEDIUM | Granola's own docs confirm; less technical detail on implementation |
| Linear UI refresh philosophy | HIGH | Linear's own changelog and design blog |
| rough-notation production usage | HIGH | npm + GitHub + multiple production examples |
| Vercel v0 / Cursor / Replit streaming patterns | HIGH | Each company's own changelog + product page |
| Hebbia Matrix interface | MEDIUM | Self-reported product description; less independent verification of UI specifics |
| tldraw computer behavior | HIGH | Steve Ruiz interview + tldraw blog + first-hand demo |
| Arc Browser Boosts characters | LOW (gap) | Web search returned nothing recent. Listed in this doc only as "we couldn't verify, deprioritize." |
| Heyday hand-drawn UI | LOW (gap) | No evidence Heyday uses a hand-drawn aesthetic. Drop from anchor list. |

**Overall confidence: HIGH.** The 5 anchor products + 12 secondary references are all verifiable through official documentation, founder interviews, or open-source repositories. The pattern vocabulary (path-draw entry, jitter, stagger, breath-ease, dual representation, streaming partial state) is supported by multiple sources each.

**Gaps / unknowns:**
- Could not verify any Arc Browser "Boosts character / weather mascot" feature in 2026. Either deprecated, renamed, or it never shipped as described. Deprioritize.
- Heyday/Mem AI memory products: no hand-drawn aesthetic found. Don't include.
- Cron / Notion Calendar specific transition durations were not publicly documented — included only for the *restraint* reference, not for stealing specific motion values.

---

## SOURCES (consolidated)

### Anchor 1 — Claude
- [Reverse Engineering Claude's ASCII Spinner Animation (Kyle Martinez, Medium)](https://medium.com/@kyletmartinez/reverse-engineering-claudes-ascii-spinner-animation-eec2804626e0)
- [Drawing and Animating Graphics with Claude — Ola Hungerford](http://www.olahungerford.com/drawing-and-animating-with-claude/)
- [Claude — Sign in](https://claude.ai/login)
- [Use Claude Code in VS Code — Claude Code Docs](https://code.claude.com/docs/en/vs-code)
- [Introducing Claude Design by Anthropic Labs](https://www.anthropic.com/news/claude-design-anthropic-labs)
- [Claude Artifacts: What They Are & How to Use Them (2026)](https://albato.com/blog/publications/how-to-use-claude-artifacts-guide)
- [How to Create SVGs with Claude AI — SVG Genie blog](https://www.svggenie.com/blog/create-svg-with-claude-ai)

### Anchor 2 — Excalidraw / rough.js
- [Excalidraw](https://excalidraw.com)
- [Excalidraw on GitHub](https://github.com/excalidraw/excalidraw)
- [Rough.js homepage](https://roughjs.com/)
- [Rough.js on Hacker News v4.0](https://news.ycombinator.com/item?id=22141526)
- [Excalifont — official Excalidraw hand-drawn font (OFL-1.1)](https://plus.excalidraw.com/excalifont)
- [Rough.js Makes Hand-Drawn Graphics with Canvas & SVG — Hongkiat](https://www.hongkiat.com/blog/roughjs-handdrawn-svg-library/)

### Anchor 3 — tldraw / perfect-freehand
- [tldraw — Drawing & Canvas Interactions](https://tldraw.dev/features/composable-primitives/drawing-and-canvas-interactions)
- [perfect-freehand on GitHub (MIT)](https://github.com/steveruizok/perfect-freehand)
- [perfect-freehand discussion: production users](https://github.com/steveruizok/perfect-freehand/discussions/38)
- [tldraw computer demo](https://computer.tldraw.com/)
- [The Accidental AI Canvas — Steve Ruiz of tldraw](https://www.latent.space/p/tldraw)
- [Agent starter kit — tldraw docs](https://tldraw.dev/starter-kits/agent)
- [tldraw computer YouTube tour](https://www.youtube.com/watch?v=Kn1De5uwrlY)
- [tldraw and AI on the canvas — YouTube](https://www.youtube.com/watch?v=xda03Lin5cY)
- [The Computer You Draw — analysis of tldraw's natural language OS](https://www.hackscience.education/the-computer-you-draw-inside-tldraws-natural-language-os/)

### Anchor 4 — Notion AI / Rive
- [BUCK — Notion AI Assistant case study](https://buck.co/work/notion-ai)
- [The Brand Identity — How BUCK gave Notion's AI assistant a hand-drawn personality](https://the-brandidentity.com/project/how-buck-gave-notions-ai-assistant-a-hand-drawn-personality)
- [School of Motion — Buck makes Rive Magic for Notion AI](https://www.schoolofmotion.com/blog/motion-mondays-may-12-2025)
- [Rive React runtime — GitHub](https://github.com/rive-app/rive-react)
- [Rive — State Machines guide](https://help.rive.app/runtimes/state-machines)
- [Marmelab — Rive: Animate Web UIs with State Machines](https://marmelab.com/blog/2023/01/30/rive-animation-state-machine.html)
- [Rive React Runtime overview](https://help.rive.app/runtimes/overview/react)

### Anchor 5 — PostHog Max
- [PostHog handbook — Logos, brand, hedgehogs](https://posthog.com/handbook/company/brand-assets)
- [PostHog blog — How we designed the PostHog mascot](https://posthog.com/blog/drawing-hedgehogs)
- [PostHog Aruba hackathon (animated Toolbar with Max)](https://posthog.com/blog/aruba-hackathon)
- [Product Growth Blog — PostHog branding playbook](https://www.productgrowth.blog/p/posthog-branding-playbook)

### Secondary references
- [Granola — How transcription works (docs)](https://docs.granola.ai/help-center/taking-notes/transcription)
- [Granola changelog](https://www.granola.ai/docs/changelog)
- [How Granola enhances note-taking with context and user intent](https://intelligentinterfaces.substack.com/p/how-granola-enhances-note-taking)
- [Linear changelog — UI refresh (Mar 12, 2026)](https://linear.app/changelog/2026-03-12-ui-refresh)
- [Linear — A calmer interface for a product in motion](https://linear.app/now/behind-the-latest-design-refresh)
- [Linear — How we redesigned the Linear UI (part II)](https://linear.app/now/how-we-redesigned-the-linear-ui)
- [v0 by Vercel](https://v0.dev/)
- [Maximizing outputs with v0 — Vercel blog](https://vercel.com/blog/maximizing-outputs-with-v0-from-ui-generation-to-code-creation)
- [Build Frontend UIs from Sketches with v0](https://markaicode.com/generative-ui-vercel-v0-sketches/)
- [Introducing Cursor 2.0 and Composer](https://cursor.com/blog/2-0)
- [Cursor 0.46.x changelog (UI refresh)](https://cursor.com/changelog/0-46-x)
- [Replit — Improving the Inline Ghostwriter Experience](https://blog.replit.com/ghostwriter-inline)
- [Replit — Building Ghostwriter Chat](https://blog.replit.com/ghostwriter-building)
- [Hebbia product page](https://www.hebbia.com/product)
- [Inside Hebbia's Deeper Research Agent](https://www.hebbia.com/blog/inside-hebbias-deeper-research-agent)
- [OpenAI showcase — Hebbia](https://openai.com/index/hebbia/)
- [rough-notation — GitHub](https://github.com/rough-stuff/rough-notation)
- [Rough Notation homepage + demos](https://roughnotation.com/)
- [react-rough-notation on npm](https://www.npmjs.com/package/react-rough-notation)
- [Rough Notation — CSS-Tricks](https://css-tricks.com/rough-notation/)
- [Notion Calendar announcement](https://www.notion.com/blog/introducing-notion-calendar)
- [Cron is now Notion Calendar](https://cronhq.notion.site/Cron-Calendar-5625be54feac4e13a75b10271b65ddb7)

### OSS tools
- [Motion — SVG Animation in React](https://motion.dev/docs/react-svg-animation)
- [How to Animate SVG Paths with Framer Motion — Noël Cserepy](https://blog.noelcserepy.com/how-to-animate-svg-paths-with-framer-motion)
- [Simple SVG drawing effect with stroke-dasharray & stroke-dashoffset — DEV.to](https://dev.to/paulryan7/simple-svg-drawing-effect-with-stroke-dasharray-stroke-dashoffset-3m8e)
- [GSAP DrawSVGPlugin](https://gsap.com/docs/v3/Plugins/DrawSVGPlugin/)
- [GSAP Staggers guide](https://gsap.com/resources/getting-started/Staggers/)
- [react-mt-svg-lines on GitHub](https://github.com/moarwick/react-mt-svg-lines)
- [Repeatable Staggered Animation Three Ways — CSS-Tricks](https://css-tricks.com/repeatable-staggered-animation-three-ways-sass-gsap-web-animations-api/)
- [Libraries for SVG Drawing Animations — CSS-Tricks](https://css-tricks.com/libraries-for-svg-drawing-animations/)

---

*End of report. Length: ~750 lines.*
