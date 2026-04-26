# Reference Hunt 2 — Agent-at-Work Flow Visualizations
**Date:** 2026-04-25
**Researcher:** researcher-refs02 (purple)
**Goal:** Find the specific side-panel pattern where users WATCH an AI agent's step-by-step process — and design Beamix's version of it for non-technical SMB owners.
**Distinction (load-bearing):** This document is about the **runtime execution viewer** — what users see while the agent is working *right now*. It is NOT about the workflow editor (Zapier/n8n design canvas) or the post-hoc audit log.

---

## TL;DR — The Single Insight

> **The pattern that works for non-technical users does three things at once:**
> 1. Shows steps as a **vertical list of named human-language stages** with a single, persistent "current step" indicator (a soft breathing pulse, not a spinner).
> 2. Animates **transitions step-by-step** so the user's eye is always pulled forward — but never re-renders the whole list (calm, not chaotic).
> 3. Lets the user **expand any step** to peek under the hood — but never forces the technical detail on them.
>
> The thing that ruins it: a graph with edges/arrows the user has to *read* to understand, OR a stream of low-level tool calls (`fetch_url`, `parse_response`, `cross_reference`) that look like logs.

---

## TOP 5 ANCHORS for the Beamix agent-execution workspace

### Anchor 1 — Perplexity Pro Search + Deep Research (the gold standard)
**Why we copy it:** Most refined step-list pattern in production. Tested on tens of millions of non-technical users. The progressing list is the "watchable to-do list" metaphor everyone already understands.

**What to copy in 7 bullets:**
- Vertical list of **named stages** with a leading icon + plain-language label ("Understanding your question", "Searching the web", "Reading 8 sources", "Analyzing", "Synthesizing").
- **One** active step at a time, marked by a soft breathing pulse dot. All previous steps get a checkmark; future steps don't exist yet (they fade in).
- Each step is **expandable via chevron** — collapsed by default. Expansion reveals what's actually happening (the queries run, the URLs read).
- **Citations as favicon chips**: as sources are read, favicons appear in a horizontal scroll under the step. Visual proof of progress without text.
- Step labels use **gerund verbs in the user's language** ("Searching", "Reading", "Analyzing") — never noun phrases ("Source acquisition phase").
- After completion, the plan panel **collapses to a one-line summary** that can be re-expanded as an audit trail.
- Henry Modisett (Perplexity Head of Design) on what unlocked retention: *"users were more willing to wait for results if the product would display intermediate progress"* — the panel is not decoration, it's the trust mechanism.

**Sources:** [Perplexity Deep Research blog](https://www.perplexity.ai/hub/blog/introducing-perplexity-deep-research), [Perplexity case study (LangChain)](https://www.langchain.com/breakoutagents/perplexity), [NN/g UX of AI: Perplexity](https://www.nngroup.com/articles/perplexity-henry-modisett/), [Comparing Deep Research UIs](https://www.franciscomoretti.com/blog/comparing-deep-research-uis)

---

### Anchor 2 — Manus "Manus's Computer" side panel (the visible-stage pattern)
**Why we copy it:** Manus's USP is literally that it shows the work. This is the closest production analog to Beamix's "watch the agent visit the AI engines" vision.

**What to copy in 6 bullets:**
- Two-pane layout: chat/output on the left, a dedicated **"agent's workspace" on the right** showing the agent's actions in real time.
- The right panel is **labeled with the agent's name** ("Manus's Computer") — anthropomorphizes the work, makes it feel like a teammate's screen-share.
- **Visible sequence:** task definition → plan proposal → approval → execution → output. Each phase is in clearly visible, named locations.
- Users can **intervene mid-stream** — the panel exposes a clear "step in" affordance.
- Sessions are **replayable** — the runtime viewer doubles as the audit log. Slide a timeline back to watch the agent re-perform.
- Verdict from comparative analysis: *"occupies substantial screen space"* — Manus's mistake is making the panel always-prominent. Beamix should make it **collapsible** so users can focus on the output when they want.

**Sources:** [Manus product page](https://manus.im/), [WorkOS — Introducing Manus](https://workos.com/blog/introducing-manus-the-general-ai-agent), [Comparing Deep Research UIs](https://www.franciscomoretti.com/blog/comparing-deep-research-uis), [GeekChamp Manus walkthrough](https://geekchamp.com/how-to-use-manus-ai-agent-a-complete-walkthrough/)

---

### Anchor 3 — Devin Workspace (the four-tab observable agent)
**Why we copy it:** Devin's chronological time slider + "Devin is thinking…" pattern is the most refined "agent at work" UX in coding tools. The intermediate-task-as-chat-bubble pattern is exactly the kind of inline progress non-technical users absorb without effort.

**What to copy in 7 bullets:**
- Workspace on the right has **4 tabbed views** (Shell, Browser, Editor, Planner). Beamix equivalent: tabs for each AI engine being queried (ChatGPT, Gemini, Perplexity, Claude, Grok, You.com, AIO).
- A **"Following" toggle** auto-switches the visible tab as the agent moves between tools. Critical for users who want to passively watch vs. actively pin.
- **"Devin is thinking…"** appears with a pulsating UI element when no specific action is happening. Beamix variant: *"Asking ChatGPT…"*, *"Reading what ChatGPT said…"*.
- Specific task strings appear inline: *"Clicked on 'Create New Prompt' and observed the modal opening"*. Plain-language narration of every action.
- **Chronological time slider at the bottom** of the workspace — scrub backward/forward to replay. Beamix variant: a horizontal scrubber that lets the user re-watch the scan.
- Intermediate tasks display **inline within chat messages** in a "minimalist yet effective" style — not in a separate log. Conversation and action are interleaved.
- A "**pulsating UI element**" (not a spinner) is the universal indicator that the agent is working.

**Sources:** [In-Depth Product Analysis of Devin](https://ppaolo.substack.com/p/in-depth-product-analysis-devin-cognition-labs), [Devin Docs: Intro](https://docs.devin.ai/get-started/devin-intro), [Cognition Labs](https://cognition.ai/blog/introducing-devin)

---

### Anchor 4 — Linear's Agent Interaction Guidelines (the design-system spec)
**Why we copy it:** Linear is the only major SaaS to publish a formal **specification** for how agents should communicate status. Their AIG is what Beamix's status pills should mirror exactly. It's been pressure-tested on knowledge workers (the closest persona to SMB owners).

**What to copy in 6 bullets:**
- Agents have **four discrete states**: thinking, waiting for input, executing, finished. One pill, four colors. No fifth state.
- **"Thinking" indicator appears immediately** when an agent is invoked — not after first tool call. Latency-zero acknowledgment.
- **Agents are clearly badge-marked** as agents (not human users). Prevents the uncanny "is this a person?" confusion.
- **Activity feed entries** for agent actions appear inline with human actions, not in a separate stream. Same vocabulary as user actions.
- **Detail-on-demand**: collapsed activity rows show the headline; expanded rows show *"every step of the agent's thought process — reasoning, tool calls, prompts, and decision logic."*
- Design rule: *"unobtrusive notifications so users can understand agent status at a glance without technical knowledge."* This is the litmus test for every component.

**Sources:** [Linear AIG](https://linear.app/developers/aig), [Linear Changelog 2025-07-30](https://linear.app/changelog/2025-07-30-agent-interaction-guidelines-and-sdk), [Developing the Agent Interaction](https://linear.app/developers/agent-interaction)

---

### Anchor 5 — ChatGPT Agent (formerly Operator) — the collapsible expandable sheet
**Why we copy it:** ChatGPT Agent solves the "the panel takes too much space" problem better than Manus. The expandable sheet that updates live and then **collapses into a compact component within the conversation history** is the right default state for Beamix.

**What to copy in 6 bullets:**
- **Default = collapsed.** The agent shows a single-line "Working on…" pill in the conversation. Click to expand the sheet.
- When expanded, sheet displays **live-updating step list** with the running step highlighted.
- **On-screen narration**: *"User prompt → Initializing computer → New screenshot → Accessing → Click → Scrolling"* — every action gets a one-line label.
- After completion, the sheet **auto-collapses** into a compact "Did 12 things in 4 minutes" summary that can be re-expanded as audit log.
- User can **interrupt and take control** at any time — there's a persistent "take over" button.
- The progressive-disclosure pattern (collapsed → live-expanded → audit-collapsed) is what Beamix needs because SMB owners have **5-10 second attention spans** for "is it working?" and **don't want a permanent sidebar** consuming visible workspace.

**Sources:** [Introducing ChatGPT agent](https://openai.com/index/introducing-chatgpt-agent/), [ChatGPT agent help](https://help.openai.com/en/articles/11752874-chatgpt-agent), [Computer-Using Agent](https://openai.com/index/computer-using-agent/), [TechCrunch on Operator](https://techcrunch.com/2025/01/23/openai-launches-operator-an-ai-agent-that-performs-tasks-autonomously/)

---

## FULL REFERENCE LIBRARY

### 1. Perplexity Pro Search / Deep Research
- **URL:** https://www.perplexity.ai/hub/blog/introducing-perplexity-deep-research
- **Best demo:** [Storylane interactive walkthrough](https://www.storylane.io/tutorials/how-to-use-perplexity-deep-research)
- **Side-panel geometry:** No persistent side panel — steps render **inline above the answer**, in the chat column itself. ~640px wide max. Sticky to top of answer.
- **Step representation:** Vertical list of cards with icon + named stage + status pill. Cards are stackable.
- **Thinking-state pattern:** Soft breathing dot next to the running step. No percent.
- **Tool/model rep:** Favicon chips for each source as it's read. No technical model labels.
- **Transition:** New step fades in from below as previous step gets a checkmark. List grows downward.
- **Verdict:** **User-friendly.** The list-of-stages metaphor needs zero teaching.

### 2. Manus AI ("Manus's Computer")
- **URL:** https://manus.im/
- **Best demo:** [Manus walkthrough](https://geekchamp.com/how-to-use-manus-ai-agent-a-complete-walkthrough/)
- **Side-panel geometry:** Right side, ~50% of viewport when open. Always-visible by default in agent runs.
- **Step representation:** Phase labels (Plan → Execute → Output) + visible terminal/browser actions inside the panel.
- **Thinking-state pattern:** Live cursor visible in the embedded surface; running tool name shown in header.
- **Tool/model rep:** Tool name in header; embedded surface shows the actual app being used (browser, terminal, file editor).
- **Transition:** Tab-style switching between tools.
- **Verdict:** **Half user-friendly.** Brilliantly visible, but **always-on takes too much space** — non-technical users find the activity intimidating.

### 3. Devin (Cognition Labs)
- **URL:** https://cognition.ai/blog/introducing-devin
- **Best demo:** [Devin Workspace product analysis](https://ppaolo.substack.com/p/in-depth-product-analysis-devin-cognition-labs)
- **Side-panel geometry:** Right panel, 4 tabs (Shell/Browser/Editor/Planner). Adjustable width. Expandable mode.
- **Step representation:** Intermediate tasks appear **inline in the chat thread**, minimalist style.
- **Thinking-state pattern:** Pulsating UI element + "Devin is thinking…" string.
- **Tool/model rep:** Tab name shows current tool. "Following" toggle auto-pins the active tab.
- **Transition:** Tab switches; chronological time slider at bottom for replay.
- **Verdict:** **Mostly technical-looking** for non-coders (Shell tab, code diffs). The chat-with-inline-tasks pattern is the takeaway.

### 4. ChatGPT Agent (formerly OpenAI Operator)
- **URL:** https://openai.com/index/introducing-chatgpt-agent/
- **Best demo:** [Operator complete guide](https://www.toolpromptly.com/openai-operator-from-chatting-to-doing-the-complete-2026-guide/)
- **Side-panel geometry:** Expandable sheet — collapsed pill in chat → expanded right-side panel → auto-collapsed summary card.
- **Step representation:** Step list inside the expanded sheet. One-line action labels.
- **Thinking-state pattern:** On-screen narration, persistent pill.
- **Tool/model rep:** Browser viewport visible; action chips ("Click", "Scroll").
- **Transition:** Live-updating list; collapses on completion.
- **Verdict:** **User-friendly default, technical when expanded.** The progressive-disclosure pattern is the key insight.

### 5. Anthropic Claude Computer Use (Demo)
- **URL:** https://docs.claude.com/en/docs/agents-and-tools/tool-use/computer-use-tool
- **Demo repo:** https://github.com/anthropics/anthropic-quickstarts/tree/main/computer-use-demo
- **Side-panel geometry:** Combined interface at localhost:8080: chat on one side, **live desktop view** on the other (actual VNC).
- **Step representation:** Chat messages narrate cursor movements; desktop view shows real actions.
- **Thinking-state pattern:** Cursor appears to "wait", action descriptions stream in chat.
- **Tool/model rep:** None at the surface; just observed actions.
- **Transition:** Cursor moves visibly between actions; chat scrolls.
- **Verdict:** **Demo-grade, not product-grade.** Useful for proving the visible-cursor metaphor works.

### 6. Hebbia Matrix
- **URL:** https://www.hebbia.com/product
- **Best post:** [Multi-agent redesign](https://www.hebbia.com/blog/divide-and-conquer-hebbias-multi-agent-redesign)
- **Side-panel geometry:** Spreadsheet grid is the primary surface. No traditional side panel — cells fill in real-time.
- **Step representation:** Each cell shows its own progress; columns represent question types ("Investment Highlights", "Key Risks").
- **Thinking-state pattern:** Cells "fill in" as agents complete sub-tasks.
- **Tool/model rep:** Citations on hover; routed model not visible.
- **Transition:** Cell-level streaming; rows complete left-to-right.
- **Verdict:** **Brilliant for finance pros, technical-feeling for SMBs.** The **column-as-question** pattern doesn't translate to Beamix; the **cell-streaming** pattern (each engine fills in as it responds) does.

### 7. Cursor Composer / Agent Mode
- **URL:** https://cursor.com/product
- **Best post:** [Cursor 2.0 changelog](https://cursor.com/changelog/2-0)
- **Side-panel geometry:** Right sidebar; agent items as distinct cards with status indicators.
- **Step representation:** Multi-step "plans" inspectable per agent.
- **Thinking-state pattern:** Indicator + agent-mode label; parallel agents shown.
- **Tool/model rep:** Tool names visible; output logs per agent.
- **Transition:** Cards update; status pills change color.
- **Verdict:** **Coder-grade, not SMB-grade.** Status pills + "checkmark for done, arrow for in-progress" is the takeaway.

### 8. LangGraph Studio
- **URL:** https://blog.langchain.com/langgraph-studio-the-first-agent-ide/
- **Side-panel geometry:** **Graph-canvas as primary view** — nodes/edges visible. State panel on the side.
- **Step representation:** Graph nodes light up as they execute. Edges animate.
- **Thinking-state pattern:** Node highlight + state inspector.
- **Tool/model rep:** Each node IS a tool/model.
- **Transition:** Edge-following animation between nodes.
- **Verdict:** **Strongly technical.** Graphs are great for builders, terrible for SMBs — **users have to read the connections**. Beamix anti-pattern.

### 9. CrewAI Studio
- **URL:** https://crewai.com/
- **Side-panel geometry:** Visual task builder; runtime trace as expandable log.
- **Step representation:** Real-time tracing per crew member; tool calls + validation + outputs.
- **Thinking-state pattern:** Per-agent status badge.
- **Tool/model rep:** Tool calls explicit ("Calling: Web Search Tool").
- **Transition:** Log entries append.
- **Verdict:** **Engineer-grade.** Useful for structuring "crew of agents" metaphor; rendering is too log-heavy for SMBs.

### 10. AutoGen Studio (Microsoft)
- **URL:** https://devblogs.microsoft.com/agent-framework/ag-ui-multi-agent-workflow-demo/
- **Side-panel geometry:** Drag-drop canvas + run dashboard on the side.
- **Step representation:** Flow visualization; mid-execution control.
- **Thinking-state pattern:** Per-component running indicator.
- **Tool/model rep:** Component blocks.
- **Transition:** Component-level state changes.
- **Verdict:** **Builder tool, not end-user tool.** Skip for Beamix.

### 11. v0 by Vercel
- **URL:** https://v0.app/
- **Best post:** [v0 announcement](https://vercel.com/blog/announcing-v0-generative-ui)
- **Side-panel geometry:** Code panel on the right, live preview on the left/center; thinking steps inline in chat.
- **Step representation:** Plan → subtasks → progress indicators with rich UI feedback.
- **Thinking-state pattern:** "Searching the web", "Checking work", "Planning" inline labels.
- **Tool/model rep:** Tool action labels with status.
- **Transition:** Inline message appends; preview hot-reloads.
- **Verdict:** **User-friendly.** Inline-step-in-chat + live-preview-on-side is a strong pattern. The v0 pattern is essentially what Beamix wants for an SMB.

### 12. Replit Agent (Agent 4)
- **URL:** https://replit.com/agent4
- **Best post:** [Agent 4 launch](https://blog.replit.com/introducing-agent-4-built-for-creativity)
- **Side-panel geometry:** Conversational chat with progress visible across parallel agents.
- **Step representation:** **"✓" for completed, "→" for in-progress** items in plain everyday language.
- **Thinking-state pattern:** Extended thinking shows step-by-step reasoning before final result.
- **Tool/model rep:** Subtle; tool calls not surfaced raw.
- **Transition:** Items flip from → to ✓.
- **Verdict:** **User-friendly.** The ✓/→ pattern is the simplest watchable progress format known.

### 13. n8n (running view)
- **URL:** https://docs.n8n.io/workflows/executions/
- **Side-panel geometry:** Workflow canvas; nodes change color during execution.
- **Step representation:** Nodes glow + status border.
- **Thinking-state pattern:** Active node animation.
- **Tool/model rep:** Each node is a tool with name visible.
- **Transition:** Node-by-node color change.
- **Verdict:** **Technical (for ops/devs).** Anti-pattern for Beamix surface; useful as inspiration for ENGINE chips.

### 14. Zapier execution view
- **URL:** https://zapier.com/
- **Side-panel geometry:** Linear list of steps with status; canvas view secondary.
- **Step representation:** List rows with run-status pill.
- **Thinking-state pattern:** Spinning icon per row.
- **Tool/model rep:** Step name + integration logo.
- **Transition:** Row state pill flips.
- **Verdict:** **Half user-friendly.** Logo+label is a good pattern for engine identity.

### 15. Make.com running scenario
- **URL:** https://www.make.com/
- **Side-panel geometry:** Scenario canvas with bubble counts.
- **Step representation:** Each module is a circle; bubbles fly between them.
- **Thinking-state pattern:** Bubble animation on the connecting line.
- **Tool/model rep:** Module logo.
- **Transition:** **Animated bubbles traveling along edges** — closest pre-existing visual to Adam's "character carries data between AIs" vision. Note this exists.
- **Verdict:** **Inspirational for the bubble-on-edge animation.** Make.com is otherwise too technical.

### 16. Browser-Use / Browserbase (agent-browser dashboard)
- **URL:** https://www.browserbase.com/solutions/browser-agents
- **Side-panel geometry:** Local dashboard at localhost:4848 with **live viewport + command activity feed + console + network + storage tabs**.
- **Step representation:** Activity feed list of commands.
- **Thinking-state pattern:** Live cursor in viewport.
- **Tool/model rep:** Tool name in command activity.
- **Transition:** Feed appends.
- **Verdict:** **Engineer-grade.** Confirms the "live viewport + activity feed" combo as the canonical agent observability layout.

### 17. AG-UI Protocol (the open spec)
- **URL:** https://docs.ag-ui.com/concepts/events
- **Side-panel geometry:** Spec, not a UI.
- **Step representation:** Event types: `RunStarted`, `StepStarted`, `ToolCallStart`, `ToolCallEnd`, `RunFinished`.
- **Thinking-state pattern:** Spec includes a thinking event for streaming reasoning.
- **Tool/model rep:** Tool calls are first-class events.
- **Transition:** Event-driven; UI binds to event stream.
- **Verdict:** **Implementation reference.** Beamix should structure its agent runtime to emit AG-UI-style events even if we render our own UI on top.

### 18. Microsoft Agent Framework + AG-UI demo
- **URL:** https://techcommunity.microsoft.com/blog/azuredevcommunityblog/building-interactive-agent-uis-with-ag-ui-and-microsoft-agent-framework/4488249
- **Side-panel geometry:** Standard chat + tool-call cards inline.
- **Step representation:** Tool-call cards with input/output JSON expansion.
- **Thinking-state pattern:** Streaming text + tool-call cards.
- **Tool/model rep:** Tool name + args; collapsible.
- **Transition:** Cards stream in.
- **Verdict:** **Half user-friendly.** Tool-call cards + collapsible JSON is a defensible pattern when expansion is opt-in.

### 19. Linear (Agent Interaction Guidelines in production)
- **URL:** https://linear.app/docs/agents-in-linear
- **Side-panel geometry:** Activity feed on the right of an issue; agent rows interleaved with human rows.
- **Step representation:** Row entries with agent badge + action label + timestamp.
- **Thinking-state pattern:** "Thinking…" pill rendered immediately on agent assignment.
- **Tool/model rep:** Hidden by default; expandable per row.
- **Transition:** Rows append.
- **Verdict:** **Most user-friendly of the bunch.** Linear's pattern is the cleanest, most learnable; **Beamix should adopt the activity-feed + status-pill + expand-for-detail trio verbatim.**

### 20. Genspark Super Agent
- **URL:** https://www.genspark.ai/agents?type=super_agent
- **Side-panel geometry:** Multi-pane workspace; agent breakdown of subtasks.
- **Step representation:** Subtask cards.
- **Thinking-state pattern:** Card-level state.
- **Tool/model rep:** Per-tool subtask routing.
- **Transition:** Card additions.
- **Verdict:** **User-friendly-ish.** Sub-task-card metaphor is digestible.

---

## THE BEAMIX AGENT FLOW PATTERN — designed

Given the references, Adam's hand-drawn aesthetic vision, and the audience (SMB owners, Hebrew/English, mostly non-technical), here is the **specific** pattern Beamix should ship.

### Side-panel position and geometry
- **Default desktop:** Right side, fixed width **360px** (not 50%), collapsible to a **48px rail** with a vertical "Agent" label.
- **Why right, not left:** Adam's product navigation is on the left; main content (the agent's deliverable) is in the center. The runtime panel shouldn't compete with primary content for the left edge.
- **Mobile (<768px):** **Bottom drawer**, peek state shows the current step pill, swipe up reveals full step list. Critical: do NOT make it full-screen; the user wants to see the result emerging.
- **Always-on?** No. **Default = open during run, auto-collapse 8 seconds after run completes** to a compact "Did 6 steps in 47s" summary card. User can re-pin.
- **Collapsed state (rail):** Shows the breathing pulse + step name in a vertical rotated label. Click to expand.

### The hand-drawn aesthetic translation
Adam's vision is hand-drawn circles + arrows + step labels (Excalidraw / rough.js feel). Translate this into ship-able UI by:
- **Step nodes:** Circles with a slightly imperfect SVG path (use `roughjs` library or pre-rendered SVGs at design time). 56px diameter.
- **Connecting lines:** Vertical hand-drawn lines between steps, slightly wavy (not bezier-perfect). Drawn with `roughjs` or hand-traced SVG strokes at 2px with `stroke-dasharray` "wobble".
- **Icons inside circles:** Simple 1.5-stroke icons (Lucide `react-icons` swapped to a hand-drawn icon set like **Hugeicons "Stroke Rounded"** or custom SVGs from **Tabler Icons** with `stroke-linejoin: round`).
- **Engine logos:** Real, official ChatGPT / Gemini / Perplexity / Claude logos — **do NOT redraw them**. Place inside the hand-drawn circle frame. The contrast between sketchy frame and real logo is the trust signal.
- **Color:** Neutral gray hand-drawn lines + the Beamix blue (#3370FF) for the active step's pulse. Completed steps get a muted blue checkmark.
- **Font:** Use Inter for labels — do **not** use a hand-drawn font (Comic Sans / Caveat). The sketch quality lives in the strokes, not the type. Real type keeps it professional.

### Default state (before run)
- Empty panel. Header: "Agents at work" (or in HE: "סוכנים עובדים").
- Sub: "Watch the scan happen — or focus on the result, your call."
- Single primary CTA: "Start scan".

### Running state — the "watchable list"
Vertical list, top-down. Each row:
```
[ Hand-drawn circle with engine/icon ]  Step name              [ status icon ]
                                         Plain-language line
                                         expand chevron ▾
```
- **One** active step at a time. Active = breathing pulse on the circle's stroke (CSS `@keyframes` modulating `stroke-opacity` 0.5↔1 over 1400ms — the breathing rhythm of "thinking", not spinning).
- **Future steps:** Faded to 30% opacity. They are visible (the user knows what's coming), but visually receded.
- **Completed steps:** 100% opacity, a small hand-drawn checkmark inside the circle, label in muted gray.
- **Connecting line** between circles: hand-drawn vertical stroke. While step N is running, the line BELOW step N is drawn progressively (animated `stroke-dashoffset`), so you see the "stroke being drawn" toward the next step. It's the visual equivalent of "advancing".

### The "is the agent thinking" cue (without making it feel slow)
- **Three layered cues, all subtle:**
  1. The **pulse** on the active circle (breathing).
  2. The **micro-text under the step label** that swaps every ~1.5s among 3-4 plain-language messages: e.g., for "Asking ChatGPT" → "Asking…" → "Waiting for ChatGPT…" → "Reading the answer…" → "Got it." Pattern: **active verb, ellipsis, change**.
  3. **Engine logo "blink"**: when sending the request, the engine logo briefly inverts its background to blue for 200ms. Sends back tactile feedback that something happened.
- **What we DO NOT show:** spinners, percent, ETA. SMB owners don't trust ETAs that are wrong, and a spinner is the universal symbol of "stuck".

### Plain-language step labels for non-technical SMB owners
Mapping technical → plain language:
| Engineer label | Beamix label | Why |
|---|---|---|
| `query_planner` | "Planning what to ask" | Verb + intent |
| `fetch_url` | "Reading your website" | Object the user knows |
| `ask_model("gpt-4")` | "Asking ChatGPT" | Brand the user knows |
| `parse_response` | "Reading the answer" | Re-uses the metaphor |
| `cross_reference` | "Comparing what each AI said" | Plain-language outcome |
| `write_result` | "Writing your report" | User-visible deliverable |
| `tool: web_search` | "Searching the web" | Already familiar |
| `extract_citations` | "Finding what they cited" | Specific concrete object |

Rule of thumb: every step label answers the SMB owner's question *"what is the agent literally doing right now?"* in 4 words.

### Expand-on-demand detail
Each step row has a chevron. Expanded, the row reveals:
- **What it sent** (the actual prompt, summarized — e.g., *"asked ChatGPT: 'Best plumbers in Tel Aviv?'"*)
- **What it got back** (a 1-sentence summary or excerpt — *"ChatGPT said you're #4, mentioned 'Cohen Plumbing' instead"*)
- **Citations / favicons** (3-6 favicons in a horizontal row)
- **Time taken** (small, gray, e.g., "took 4.2s")

### How the user knows current vs done vs upcoming
| State | Circle | Line above | Line below | Label |
|---|---|---|---|---|
| Done | 100%, checkmark, blue | Solid | Solid | Muted gray |
| Running | 100%, breathing pulse on stroke | Solid | Drawing in (animated dashoffset) | Foreground, micro-text spinning |
| Upcoming | 30% opacity, no checkmark | Not drawn yet | Not drawn yet | 30% opacity |

### Collapse / focus mode
- The panel collapses on a single click (the rail). The rail still shows the breathing pulse + step name — so even at 48px, the user can see "yes, it's still working".
- Keyboard `Esc` collapses; `?` opens a brief explainer of "what these icons mean".

### Completion state
- Last step gets its checkmark.
- A celebratory single-line summary card slides in at the top of the panel: *"Done in 47s. Check your scan results →"* with a button to jump to the deliverable.
- After 8s, the entire panel auto-minimizes to a compact pinned card: *"Last scan: 47s, 6 steps. View timeline →"*. Re-expandable.

---

## SIX-STEP TEMPLATE FOR THE BEAMIX AGENT WORKFLOW (mock)

**Agent:** Content Optimizer (one of Beamix's MVP-1 agents)
**Trigger:** User clicks "Run Content Optimizer" in Inbox after seeing a suggestion: *"Your homepage isn't being cited by ChatGPT for 'pizza Tel Aviv'. Want me to fix it?"*

---

### Step 1 — "Reading your website"
- **Hand-drawn icon:** Hand-drawn rectangle (a "page") with a magnifying glass overlay.
- **Plain label:** "Reading your website"
- **Micro-text rotation:** "Opening your homepage…" → "Looking at your H1 and meta description…" → "Got it."
- **What user sees:** The page favicon appears next to the circle once the page is fetched. Citation chip with the URL.
- **Expand reveals:** "Read 14 pages, found 3,200 words of content. Here are the H1s I found: [list]."
- **Engine logo:** None at this step (Beamix is reading the user's site, not an AI engine).

---

### Step 2 — "Asking each AI what they say about you"
- **Hand-drawn icon:** A circle with **4 mini engine logos clustered** (ChatGPT, Gemini, Perplexity, Claude) — like a constellation.
- **Plain label:** "Asking each AI what they say about you"
- **Micro-text rotation:** "Asking ChatGPT…" → "Asking Gemini…" → "Asking Perplexity…" → "Asking Claude…" → "Got 4 answers."
- **What user sees:** Each engine logo **lights up sequentially** (200ms blink → solid blue → check). This is the most emotionally satisfying frame — Adam's "character visiting each AI" vision lives here.
- **Expand reveals:** Per-engine answer cards: *"ChatGPT didn't mention you. Gemini ranked you #3. Perplexity cited a competitor. Claude mentioned you in passing."*
- **Engine representation:** Real, official logos inside hand-drawn circles. The contrast IS the brand.

---

### Step 3 — "Comparing what each AI said"
- **Hand-drawn icon:** A small Venn-diagram of two overlapping circles, hand-drawn.
- **Plain label:** "Comparing what each AI said"
- **Micro-text rotation:** "Lining up the answers…" → "Spotting what's missing…" → "Found 3 gaps."
- **What user sees:** Three small "gap chips" appear inline: *"Missing: opening hours"* / *"Missing: vegan options"* / *"Missing: takeaway info"*.
- **Expand reveals:** A side-by-side mini-table: each engine across the top, each fact down the side, ✓ or ✗ in cells.
- **Engine logos:** Persist as small icons on the chips.

---

### Step 4 — "Writing better content for your homepage"
- **Hand-drawn icon:** A pencil, hand-drawn, with a small sparkle.
- **Plain label:** "Writing better content for your homepage"
- **Micro-text rotation:** "Drafting…" → "Adding the missing details…" → "Reading it back…" → "Polishing." 
- **What user sees:** Below the row, a small **streaming text box** shows the first 2 sentences of the new copy as it's generated. Streams character-by-character. This is the **moment of value** — the SMB owner sees the actual deliverable being born.
- **Expand reveals:** Full generated copy in a Markdown box.
- **Engine logo:** Subtle "Powered by Claude" footer chip in the expanded view.

---

### Step 5 — "Checking it sounds right"
- **Hand-drawn icon:** A pair of glasses, hand-drawn.
- **Plain label:** "Checking it sounds right"
- **Micro-text rotation:** "Reading it as a customer would…" → "Checking facts…" → "Looks good."
- **What user sees:** Three small green check chips appear: *"Sounds natural ✓"* / *"Facts match your site ✓"* / *"No competitor names ✓"*. (QA gate is **visible**, not hidden.)
- **Expand reveals:** The QA prompt and verdict.
- **Engine logo:** Tiny "Verified by Claude" chip.

---

### Step 6 — "Ready for your approval"
- **Hand-drawn icon:** A hand-drawn checkbox.
- **Plain label:** "Ready for your approval"
- **Micro-text rotation:** None — this is the terminal state.
- **What user sees:** A primary CTA: **"Review the new copy →"** + a secondary "Discard". The panel collapses to summary on click of either.
- **Expand reveals:** Side-by-side diff: old copy vs new copy.
- **Engine logo:** None — the user is now the agent.

**Total elapsed time the user watched:** ~30-60 seconds. Long enough to feel substantial; short enough not to lose attention.

---

## ANTI-PATTERNS — flow visualizations that fail non-technical users

1. **Graph layout with edges the user must read.** LangGraph Studio shows nodes connected by labeled edges. Non-technical users **don't read graphs** — they scan top-to-bottom lists. A sideways graph forces them to learn a notation. Avoid.
2. **Streaming raw tool calls / JSON.** Microsoft AG-UI's default tool-call cards expose `args: {url: "...", method: "GET"}`. SMB owners don't know what those words mean and feel "this is for engineers." If you must show JSON, hide it behind two clicks.
3. **Always-on side panel that's too wide.** Manus's 50% panel width forces the user to *choose* between watching and using. Beamix's panel is 360px — narrow enough that the deliverable is always primary.
4. **Spinners and percent ETAs.** Spinners signal "stuck" to SMB users. Percent bars that don't move feel like a lie. Replace both with a breathing pulse + named active step.
5. **Logs that scroll endlessly.** A log feed (CrewAI default) makes the user scroll to see the current state. The current state should be **pinned at top** and the log should be expand-on-demand.
6. **Step labels in nouns / engineering-ese.** "Source acquisition phase complete" vs "Read your website ✓". The verb form is universally more digestible.
7. **Hidden completion.** ChatGPT's old default of fully collapsing once done makes the user wonder "is it really finished?". Always show a **terminal celebration card** for 8 seconds before collapsing.

---

## WHAT WORKS FOR NON-TECHNICAL SMB OWNERS specifically

The 5 design moves that translate "agent technical activity" into "I can follow along":

### 1. Plain-language gerund-verb step labels.
"Reading your website" beats "Site analysis" beats "site_analysis_phase". The verb form puts the user inside the action. **This is the single most important rule.**

### 2. Real, recognizable brand logos for engines, inside hand-drawn frames.
SMB owners trust ChatGPT, Gemini, Perplexity. They don't trust unfamiliar engine names. Showing the **logos they recognize** does more for credibility than any UI animation. The hand-drawn frame around the logo is the **Beamix differentiation** — it says "we are not a generic dashboard."

### 3. Breathing, not spinning.
A soft 1400ms breathing pulse signals "alive and thinking" the way a sleeping cat's breath does. A spinner signals "frozen". This is the difference between trust and abandonment.

### 4. Progressive disclosure via the chevron.
Nothing technical is *visible by default*. Everything technical is *available within one click*. The user with no technical curiosity sees clean labels; the user who wants depth gets it instantly. This pattern is what Linear's AIG nailed.

### 5. The terminal celebration card.
Don't just go quiet when the agent finishes. Slide in a "Done in 47s. Here's what changed." card. This is the **emotional payment** the user came for. Without it, completion feels like an absence; with it, completion feels like a delivery.

---

## THE SINGLE DESIGN MOVE that most separates technical from user-friendly agent flow viz

> **Replace every node-and-edge graph with a top-down vertical list of named gerund-verb steps where exactly one step is alive (breathing pulse) at a time.**

That single substitution — graph → list, with verb-labels and a single living focus — is what turns LangGraph-grade engineer tooling into Linear-grade end-user tooling. Adam's hand-drawn circles and arrows can stay; just lay them out **vertically** with the user's eye flowing **down**, never sideways. The list is what non-technical users already understand from to-do apps, recipe steps, and shipping trackers. Use that mental model. Don't invent a new one.

---

## Sources & confidence

| Claim | Source(s) | Confidence |
|---|---|---|
| Perplexity Deep Research progress sidebar (3 phases, intermediate progress increases retention) | [Perplexity blog](https://www.perplexity.ai/hub/blog/introducing-perplexity-deep-research), [LangChain breakout case study](https://www.langchain.com/breakoutagents/perplexity), [NN/g Perplexity UX](https://www.nngroup.com/articles/perplexity-henry-modisett/) | HIGH |
| Manus "Computer View" 2-pane layout, 50% width, replayable | [WorkOS](https://workos.com/blog/introducing-manus-the-general-ai-agent), [Comparing Deep Research UIs](https://www.franciscomoretti.com/blog/comparing-deep-research-uis), [GeekChamp guide](https://geekchamp.com/how-to-use-manus-ai-agent-a-complete-walkthrough/) | HIGH |
| Devin's 4-tab workspace, Following toggle, time slider, "Devin is thinking…" pulse | [In-Depth Devin product analysis](https://ppaolo.substack.com/p/in-depth-product-analysis-devin-cognition-labs), [Devin Docs](https://docs.devin.ai/get-started/devin-intro) | HIGH |
| ChatGPT Agent expandable sheet → collapsed component pattern | [OpenAI ChatGPT Agent](https://openai.com/index/introducing-chatgpt-agent/), [Comparing Deep Research UIs](https://www.franciscomoretti.com/blog/comparing-deep-research-uis) | HIGH |
| Linear AIG: 4 agent states, immediate "thinking" pill, badge-marked agents, expand-for-detail | [Linear AIG](https://linear.app/developers/aig), [Linear Changelog](https://linear.app/changelog/2025-07-30-agent-interaction-guidelines-and-sdk) | HIGH |
| Replit Agent ✓/→ in-progress markers in everyday language | [Replit Agent 4](https://replit.com/agent4), [Replit blog](https://blog.replit.com/introducing-agent-4-built-for-creativity) | HIGH |
| AG-UI events spec: RunStarted, StepStarted, ToolCallStart/End | [AG-UI events](https://docs.ag-ui.com/concepts/events) | HIGH |
| Smashing Magazine agentic UX patterns (intent preview, action audit, confidence signal) | [Smashing — Designing Agentic AI](https://www.smashingmagazine.com/2026/02/designing-agentic-ai-practical-ux-patterns/) | HIGH |
| Logiciel agentic UX (Mission Board, Decision Ledger, Dual Timelines) | [Logiciel agentic UX](https://logiciel.io/blog/agentic-ux-oversight-confidence-control) | HIGH |
| Hebbia Matrix multi-agent, column-as-question, cell-streaming | [Hebbia multi-agent redesign](https://www.hebbia.com/blog/divide-and-conquer-hebbias-multi-agent-redesign), [Introducing Matrix](https://www.hebbia.com/blog/introducing-matrix-the-interface-to-agi) | HIGH |
| Cursor Agent sidebar with parallel agents and status indicators | [Cursor changelog 2.0](https://cursor.com/changelog/2-0), [Cursor product](https://cursor.com/product) | HIGH |
| LangGraph Studio = graph canvas of nodes/edges (Beamix anti-pattern) | [LangGraph Studio launch](https://blog.langchain.com/langgraph-studio-the-first-agent-ide/), [DataCamp guide](https://www.datacamp.com/tutorial/langgraph-studio) | HIGH |
| v0 generative UI: inline plan, side preview, step labels in chat | [v0.app](https://v0.app/), [Vercel announcing v0](https://vercel.com/blog/announcing-v0-generative-ui) | HIGH |
| Browserbase / agent-browser dashboard at localhost:4848 with live viewport + activity feed | [Browserbase agents](https://www.browserbase.com/solutions/browser-agents), [agent-browser dashboard](https://agent-browser.dev/dashboard) | HIGH |
| Anthropic Claude Computer Use combined chat+desktop demo | [Computer Use docs](https://docs.claude.com/en/docs/agents-and-tools/tool-use/computer-use-tool), [computer-use-demo repo](https://github.com/anthropics/anthropic-quickstarts/tree/main/computer-use-demo) | HIGH |
| Hand-drawn diagram aesthetic via roughjs / Excalidraw | [Excalidraw GitHub](https://github.com/excalidraw/excalidraw), [AI Excalidraw](https://github.com/ramacuy/ai-excalidraw) | HIGH |

### Gaps
- No first-person screenshots in this research (all sources were public docs/blogs/articles, not direct UI captures). Recommend Adam captures live screenshots of Perplexity Deep Research, Manus, Devin, ChatGPT Agent, Replit Agent during a real run for the design-lead handoff.
- Specific timing/easing values for breathing pulse and stroke-dashoffset animations are based on convention (1400ms breath, 600-800ms line draw) — should be tuned in Pencil/Figma against real motion-craftsman skill.

### Overall confidence: HIGH
All major patterns confirmed across 2+ official sources or product analyses; design synthesis is opinionated based on those patterns plus Beamix's known SMB-owner persona and Adam's hand-drawn aesthetic intent.

