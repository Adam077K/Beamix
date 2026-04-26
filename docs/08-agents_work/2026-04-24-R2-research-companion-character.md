# Round 2 Research: Character-Companion Behavior Patterns

**Date:** 2026-04-24
**Researcher:** researcher worker (purple badge)
**Focus:** Character lives inside product UI. Silent helper. Pointing, glowing, showing — not narrating.
**Scope:** 12 products analyzed + Clippy (cautionary). Every claim sourced.

---

## TL;DR — The Bottom Line

The pattern Adam is describing already exists, but it is **scattered across three different archetypes**, and no single product on the market has fused them all into one "professional, minimal, alive" companion for non-technical users:

1. **Granola** — nails the *draggable, floating, persistent, click-to-return* mechanic but has no personality; it is a rectangle with a handle.
2. **Notion AI (BUCK + Rive)** — nails the *minimal hand-drawn face with state-based animation* but does not live inside the product UI as a roaming companion; it appears only inside the AI panel.
3. **ElevenLabs Orb** — nails the *alive, breathing, state-reactive visual* but it is a center-stage voice visualizer, not an ambient assistant.

**Beamix's opportunity** = Granola's mechanic + Notion's register + Orb's aliveness, plus the one thing none of them do well: **pointing at UI elements and glowing buttons the user should notice**.

---

## TOP 3 ANCHOR REFERENCES FOR BEAMIX

### Anchor 1: Granola — the floating, draggable meeting indicator

- **Observable surface:** The Granola macOS app during an active meeting. A small floating indicator appears on the right-hand side of the screen when the main Granola window is not focused. [Granola docs — Transcription](https://docs.granola.ai/help-center/taking-notes/transcription)
- **Why it fits Beamix's vision (5 sentences):**
  1. It lives **inside the product surface**, not in a separate window or modal.
  2. It is **persistent while work is happening** (during transcription), silent while not.
  3. It is **draggable by a handle at the bottom** — the user can move it anywhere on screen, solving the "get out of my way" problem that Clippy never solved.
  4. It is **click-to-return** — one click takes the user straight back to the active meeting note. This is exactly the "click to open a chat" behavior Adam wants.
  5. It is **professional and minimal**, not playful; Granola's marketing calls it a "quiet companion" that "auto-launches and listens." [Zapier review: Granola](https://zapier.com/blog/granola-ai/)
- **Behavior rules we should copy:**
  1. **Appearance trigger:** Only appears when the main app is out of focus AND work is happening (during transcription). Disappears cleanly when the user returns to the app. → *Beamix equivalent: appears when an agent is actively running AND the user is in a different route.*
  2. **Work-in-progress indicator:** Green bubbles on the right edge pulse with transcription activity; this makes invisible work visible. → *Beamix equivalent: the companion's body glows in sync with agent "heartbeats" (scan ticks, LLM calls).*
  3. **Interaction surface:** Draggable by a physical handle (not the whole body). Click anywhere = return-to-work. → *Beamix equivalent: drag-handle on the bottom, click on body = open mini-chat.*
  4. **Silence rule:** Zero text, zero notifications while idle. Only visual pulsing. No speech bubbles unless the user explicitly clicks.
  5. **Motion register:** CSS-level — pulsing indicator + draggable window, no character animation. Registered as "utility" not "character."
- **Screenshot URLs / public refs:**
  - [Granola homepage](https://www.granola.ai) — hero video shows the indicator
  - [Granola on Product Hunt](https://www.producthunt.com/products/granola) — screenshots of the floating indicator
  - [Wonder Tools review with screenshots](https://wondertools.substack.com/p/granolaguide)
- **Confidence:** HIGH — documented in official Granola help center + multiple independent reviews.

---

### Anchor 2: Notion AI (by BUCK, built in Rive) — the hand-drawn face

- **Observable surface:** The Notion AI assistant character inside the Notion app, animated at the top of the AI prompt surface. [BUCK case study](https://buck.co/work/notion-ai)
- **Why it fits Beamix's vision (5 sentences):**
  1. It has **the minimalist register Adam wants** — eyes, eyebrows, a nose, and nothing else. No mouth. No arms. No body. Totally professional yet alive. [Fast Company on Notion AI character](https://www.fastcompany.com/91192119/notions-new-animated-ai-assistant-looks-more-new-yorker-than-clippy)
  2. It has **true state-based animation** — thinking state = eyebrows wave; error state = face momentarily falls apart; idle state = alert and engaged. [The Brand Identity — BUCK x Notion](https://the-brandidentity.com/project/how-buck-gave-notions-ai-assistant-a-hand-drawn-personality)
  3. It is **silent** — no speech bubbles, no interruption, no "it looks like you're writing a letter." It reacts, it doesn't talk.
  4. It is built in **Rive State Machine** — this is the exact right technical substrate for Beamix (small file size, blends between states, production-ready).
  5. Notion's design lead explicitly framed this as a **rejection of sparkle-spam**: "We need to do something that differentiate ourselves from the sparkles in the world." [Fast Company](https://www.fastcompany.com/91192119/notions-new-animated-ai-assistant-looks-more-new-yorker-than-clippy)
- **Behavior rules we should copy:**
  1. **Appearance trigger:** The face appears when AI is invoked; it is not on screen otherwise. → *Beamix equivalent: the companion is always on screen (unlike Notion's) but copies the face-only minimalism.*
  2. **Work-in-progress indicator:** The eyebrows "wave" rhythmically while thinking. Not a spinner. Not a progress bar. A micro-expression. This is the single most important visual we should steal.
  3. **Interaction surface:** The face is not clickable in Notion — it's a reaction, not an interaction. → *Beamix diverges here: the face should be clickable to open chat.*
  4. **Silence rule:** **The character never produces text.** All text lives in the adjacent UI. The face only emotes.
  5. **Motion register:** Hand-drawn cel animation, converted to **Rive State Machine** for blending. This is the tech we should use — not Lottie (no branching), not pure CSS (not expressive enough), not 3D (wrong register for SMB audience). [BUCK case study](https://buck.co/work/notion-ai)
- **Screenshot URLs / public refs:**
  - [BUCK case study (primary)](https://buck.co/work/notion-ai) — includes animation demos
  - [The Brand Identity deep dive](https://the-brandidentity.com/project/how-buck-gave-notions-ai-assistant-a-hand-drawn-personality)
  - [BUCK on Threads with demo video](https://www.threads.com/@buck_design/post/DLVPX33xWiw/video-a-little-character-goes-a-long-way-meet-the-notion-ai-assistant-that-we-brought-/)
  - [Sahil Bishnoi analysis](https://sahilbishnoi.substack.com/p/behind-the-scenes-of-notions-animated)
- **Confidence:** HIGH — case study published by the agency that built it, plus tech stack (Rive) publicly confirmed.

---

### Anchor 3: ElevenLabs Orb — the living, breathing, state-reactive companion

- **Observable surface:** The Orb component shipped in the ElevenLabs UI library, used inside voice agent products built on ElevenLabs. [ElevenLabs UI — Orb](https://ui.elevenlabs.io/docs/components/orb)
- **Why it fits Beamix's vision (3-5 sentences):**
  1. It has **four explicit states that look visibly different:** `idle | thinking | listening | talking`. This is the clearest state model in the entire market.
  2. It **"breathes" in the idle state and reacts to audio in the active state** — so it always looks alive, even when nothing is happening. This solves Beamix's "invisible work" problem.
  3. It is **render-light and production-grade** — built on Three.js + React Three Fiber with WebGL shaders, with built-in cleanup and `requestAnimationFrame` optimization. We can drop-in adapt.
  4. It is **color-configurable on the fly** — `colorsRef` for smooth transitions. We can tint it Beamix blue (#3370FF) and shift hues by state.
  5. It is **deliberately minimal** — it is a shape, not a mascot. This matches Adam's "professional, not gamified" requirement perfectly.
- **Behavior rules we should copy:**
  1. **Appearance trigger:** Always visible while the agent context is active; persistent.
  2. **Work-in-progress indicator:** Shape deformation + audio-reactive volume bars. For Beamix, replace "audio volume" with "progress percent" (same mechanic, different input).
  3. **Interaction surface:** **Not interactive in ElevenLabs** — it's a passive visualization. → *Beamix should extend this: make it draggable + click-to-chat.*
  4. **Silence rule:** The Orb never speaks. It visualizes. Text appears in separate UI, not from the Orb itself.
  5. **Motion register:** 3D WebGL shader-based. For Beamix, consider starting with CSS + SVG (cheaper) and upgrading to Rive state machine if budget allows. Three.js is overkill for an SMB dashboard companion.
- **Screenshot URLs / public refs:**
  - [ElevenLabs Orb docs (primary)](https://ui.elevenlabs.io/docs/components/orb)
  - [ElevenLabs UI library overview](https://ui.elevenlabs.io/)
  - [Open-source orb-ui React port](https://github.com/alexanderqchen/orb-ui)
  - [ElevenLabs Swift components](https://github.com/elevenlabs/components-swift)
- **Confidence:** HIGH — official documentation + open-source reference implementations.

---

## FULL 12-PRODUCT COMPARISON MATRIX

| Product | Physical location | Trigger | Work-in-progress indicator | Interaction | Silence level | Motion tech | Clippy risk | Verdict |
|---|---|---|---|---|---|---|---|---|
| **Granola** | Floating right-edge box | When app unfocused + meeting active | Green bubbles pulse on audio | Drag by handle / click = return | Silent (no text) | CSS + React | None | **COPY THE MECHANIC** |
| **Notion AI** | Inside AI panel header | When AI invoked | Eyebrows wave | Not interactive | Silent face | Rive State Machine | None | **COPY THE REGISTER + TECH** |
| **ElevenLabs Orb** | Center of voice product | Always visible | Shape + volume reactivity | Not interactive | Silent | Three.js + WebGL | None | **COPY THE STATE MODEL** |
| **Claude.ai spark mark** | Inline in chat rail | When Claude is thinking | 5-symbol Unicode rotation + 184 status verbs | Not interactive | Minimal text ("Contemplating…") | Custom ASCII/SVG | None | Copy the verb-variety idea |
| **Duolingo Duo + cast** | Full-screen illustration, lesson screens | Lesson start, streak, wrong answer, celebration | Duo emotes (happy/sad/fire) | Not directly (passive) | Vocal via voiced cutscenes + text bubbles | Lottie + spritesheets | Some — characters talk at you | **DO NOT COPY** (too playful for SMBs) |
| **Arc Browser Max** | Inline in tabs / sidebar | On-demand (Ask AI) | Loading shimmer in result area | Click to invoke | Silent | CSS | None | Irrelevant — no companion character |
| **Replit Ghostwriter** | Persistent inline widget in editor | User invokes or types | Streaming tokens appear inline | Click / keyboard shortcut | Silent code | Native | None | Copy "persistent inline widget" pattern |
| **Cursor Composer** | Persistent right rail + agent trace | Invoked via command | Streaming diff + step trace | Click / keyboard | Minimal text | Native | None | Copy "agent trace" readable timeline |
| **Lemon Squeezy** | No in-product character found | N/A | N/A | N/A | N/A | N/A | N/A | Character lives only on marketing/brand site, not in dashboard UI |
| **Microsoft Copilot (Office)** | Floating sparkle icon per cell / "dingbat" follows cursor | On cell hover, on text select | Trembling/shaking icon | Click = open Copilot | Minimal, but icon is contextually everywhere | CSS + sparkle SVG | **HIGH** — users widely complain it is the new Clippy, with "trembling" and "following cursor" noted as distracting | **STUDY AS ANTI-PATTERN** |
| **Notion Shimmer (pre-character)** | Text selection sparkle | On text select | Shimmer | Click | Silent | CSS | Low | Acceptable fallback but Notion moved past this |
| **Siri (iOS 18)** | Screen edge glow | Voice trigger | Rainbow glow around device edges | Voice / tap dismiss | Minimal | Metal / native | None | Copy the "edge glow" pattern for Beamix's "I noticed something" nudge |

**Sources:** Granola [[docs](https://docs.granola.ai/help-center/taking-notes/transcription)]; Notion [[BUCK](https://buck.co/work/notion-ai)][[Fast Company](https://www.fastcompany.com/91192119/notions-new-animated-ai-assistant-looks-more-new-yorker-than-clippy)]; ElevenLabs [[docs](https://ui.elevenlabs.io/docs/components/orb)]; Claude [[Alex Beals blog](https://blog.alexbeals.com/posts/claude-codes-thinking-animation)]; Duolingo [[NPR 2025 revival](https://www.npr.org/2025/02/26/nx-s1-5309785/duolingo-owl-mascot-lives)][[Duoplanet characters](https://duoplanet.com/duolingo-character-names/)]; Arc [[Max page](https://arc.net/max)]; Replit [[Inline Ghostwriter](https://blog.replit.com/ghostwriter-inline)]; Cursor [[Composer docs](https://docs.cursor.com/composer)][[Cursor 2.0 post](https://cursor.com/blog/2-0)]; Lemon Squeezy [[checkout docs](https://docs.lemonsqueezy.com/help/checkout)]; Microsoft Copilot [[user complaints](https://learn.microsoft.com/en-us/answers/questions/5417518/how-do-i-stop-the-annoying-copilot-thing-popping-u)][[dingbat follows cursor](https://techcommunity.microsoft.com/discussions/microsoft365copilot/i-want-to-turn-off-or-hide-the-draft-with-copilot-dingbat-that-follows-my-cursor/4288889)]; Siri [[Softonic](https://en.softonic.com/articles/how-to-activate-siris-new-look-and-its-colorful-glow)][[SlashGear](https://www.slashgear.com/1865686/iphone-glowing-around-edges-reason/)].

---

## BEHAVIOR RULES FOR "BEAMIX HELPER" (consolidated — 12 rules)

These rules are derived from the best patterns observed. Each cites its source.

### 1. Default state — where it lives
The helper lives in the **bottom-right corner** of the product shell (not inside any specific page), at **56×56px**, with a 16px safe-area margin. It is **above** the page content but **below** modals. Inspired by Granola's right-edge placement and ElevenLabs' ~128px orb sizing. [[Granola](https://docs.granola.ai/help-center/taking-notes/transcription)][[ElevenLabs](https://ui.elevenlabs.io/docs/components/orb)]

### 2. Appearance trigger — when it shows up
**Always visible** while the user is inside the authenticated product shell. **Hidden** on public marketing, auth, and full-screen modals. Unlike Notion's "only when invoked" pattern, Beamix needs persistent presence because invisible work is the core product value — if the companion disappears, so does the signal that work is happening.

### 3. Active state — how it indicates work
Three reactive signals, all simultaneous when agents run:
- **Body shape deformation** (ElevenLabs Orb pattern) — subtle pulsing mapped to agent heartbeat. [[ElevenLabs](https://ui.elevenlabs.io/docs/components/orb)]
- **Eyebrow/face micro-expression** (Notion pattern) — a tiny wave or tilt when thinking. [[BUCK](https://buck.co/work/notion-ai)]
- **Color tint shift** toward Beamix blue #3370FF while active; return to neutral when idle. [[ElevenLabs colorsRef](https://ui.elevenlabs.io/docs/components/orb)]

### 4. Pointing behavior — when + how it points at UI
When the user lands on a screen where an action is suggested, the companion **drifts toward that UI element** over ~800ms, stops ~40px away, and **emits a faint arc or line** toward the target. Inspired by spotlight/coach-mark patterns but without the dark overlay. [[Appcues on coach marks](https://www.appcues.com/blog/product-tours-ui-patterns)]
**Only points once per element per session.** If user ignores, it stops pointing (proactive-nudge-and-silence pattern). [[bprigent.com — 7 UX patterns](https://www.bprigent.com/article/7-ux-patterns-for-human-oversight-in-ambient-ai-agents)]

### 5. Glowing behavior — when + how it highlights a button
The companion itself does not glow the button. **The target button receives a soft Beamix-blue halo** (2px outer shadow, 20% opacity, breathing at 2s period) while the companion looks toward it. This separates the companion from the action surface, avoiding the Microsoft Copilot "trembling icon on every cell" anti-pattern. [[Microsoft Copilot complaints](https://techcommunity.microsoft.com/discussions/microsoft365copilot/copilot-sparkle-in-excel-missing/4471227)]

### 6. Speech — silent by default, text on click
The companion **never produces text autonomously.** Click the companion → a **small inline text box opens above it (not a modal, not a full-page chat)** about 320×auto px, with one current message. This matches Adam's "small text box in UI, not modal" requirement. [[Interactive Studio on inline microinteraction](https://insights.theinteractive.studio/beyond-the-chat-agentic-interfaces-inside-your-product)]
The only exception: after the user approves an action, a single-line toast can appear *near the companion* (not from it) confirming "Started." This mirrors Granola's silent-indicator-with-minimal-state pattern.

### 7. Drag behavior — user moves it, it remembers
**The user can drag the companion anywhere on screen.** Position persists in `localStorage` per user. Drag threshold: 8px (below this is treated as click). The companion does NOT snap back to origin — respecting user control is the #1 Clippy lesson. [[Clippy lessons](https://medium.com/twentybn/5-lessons-from-clippys-failure-efc69297eac1)]
Edge case: if the user drags it off-screen, it returns to the nearest safe edge with a 400ms ease-out.

### 8. Dismiss — can hide, easy to bring back
Right-click or long-press → "Hide companion" menu item. Hidden state persists for 24 hours, then offers to return (not forces). A small re-appearance button lives permanently in the bottom nav so the user can bring it back instantly. **This directly answers Clippy's #1 failure mode: Clippy was not easily dismissible until Office XP, six years after launch.** [[Wikipedia on Office Assistant](https://en.wikipedia.org/wiki/Office_Assistant)]

### 9. Onboarding vs. steady-state — different intensity
**First run:** the companion does a 3-step pointing tour (welcome → "here's where your scans live" → "here's how I'll help"). Each step is skippable.
**Every day after:** steady-state only; never re-runs the tour. This directly answers Clippy's failure mode #1: "optimize for repeated use, not just first time use." [[Nahua Kang on Clippy](https://medium.com/twentybn/5-lessons-from-clippys-failure-efc69297eac1)]

### 10. Working-vs-idle — visually distinct
| State | Visual |
|---|---|
| **Idle** | Slow breathe (4s period), neutral gray tint, eyes alert |
| **Thinking** | Eyebrows wave (Notion), body pulses faster (1.2s), tint shifts to 40% blue |
| **Succeeded** | One-shot bounce + green check flash (~600ms), then idle |
| **Blocked/needs input** | Soft amber tint + gentle bob toward the inbox icon |
| **Error** | Face momentarily falls apart (Notion pattern), 300ms, then idle |
[[BUCK on Notion states](https://buck.co/work/notion-ai)][[ElevenLabs state model](https://ui.elevenlabs.io/docs/components/orb)]

### 11. Multiple characters — one, not a cast
**One companion.** Not Duolingo's cast model. Reasoning: SMB owners are not teens learning Spanish; a cast adds cognitive load, introduces gendered risk (Clippy's focus-group failure), and dilutes the "silent professional partner" register. [[Clippy diversity lesson](https://medium.com/twentybn/5-lessons-from-clippys-failure-efc69297eac1)] Agent identity is communicated through **agent badges inside the Inbox**, not through separate characters roaming the UI.

### 12. Anti-Clippy clauses — 5 hard "never"s
1. **Never auto-speak.** Text only appears when the user clicks the companion. (Clippy auto-popped speech bubbles.)
2. **Never repeat the same suggestion.** If user dismisses a nudge, do not re-offer it for 7 days minimum. (Clippy re-offered "it looks like you're writing a letter" every time.) [[Nahua Kang](https://medium.com/twentybn/5-lessons-from-clippys-failure-efc69297eac1)]
3. **Never block user flow.** The companion cannot open a modal. Cannot take focus. Cannot prevent keyboard input. (Clippy was modal.)
4. **Always dismissible in one click.** A user must never have to hunt through settings to hide it. (Clippy failure: was not dismissible by default until 6 years later.) [[Wikipedia](https://en.wikipedia.org/wiki/Office_Assistant)]
5. **Never anthropomorphize beyond a face.** No arms, no body, no gestures that pantomime speech. Just eyes, brows, shape. (Clippy had full-body arm animations that felt manipulative.) [[Alan Cooper on Clippy](https://thenewstack.io/humanity-vs-clippy-lessons-from-microsofts-failed-virtual-assistant/)]

---

## THE CHARACTER SYSTEM DECISION

**Recommendation: ONE character (not a cast, not an object system).**

### Options compared

| Model | Example | Pros | Cons for Beamix |
|---|---|---|---|
| **Single character** | Notion (face), ElevenLabs (orb), Granola (indicator) | Clear mental model. One voice, one presence. Low cognitive load. Easy to brand. | Less narrative range. |
| **Cast of characters** | Duolingo (Duo, Lily, Bea, Zari, Junior) | Emotional variety. Role-specific personality. | **Too playful for SMBs.** Cognitive overhead. Gendered risk (Clippy lesson). Only works when users spend 20+ min/day in-product — Beamix users spend 2-5 min. |
| **Object system** | Stripe (coins, pipes, lines) | Abstract, zero anthropomorphism. | **Too cold** for Adam's "warm and alive" requirement. Works for developers, not SMB owners. |

**Verdict:** ONE character. Register = Notion AI's minimalist face + ElevenLabs Orb's alive body. Agent identity lives in the **Inbox agent badges**, not in separate roaming characters.

Sources: [[Duolingo character cast](https://duoplanet.com/duolingo-character-names/)]; [[Notion AI character](https://buck.co/work/notion-ai)]; [[ElevenLabs Orb](https://ui.elevenlabs.io/docs/components/orb)].

---

## INTERACTION MODEL

Adam's ask: **draggable + click-to-open mini-chat (text box in UI, not modal) + glows/points at UI elements**.

### Pattern research by requirement

**1. Click-to-open-mini-chat pattern — who does it well?**
- **Intercom Messenger pattern** — click a small launcher in bottom-right, panel opens above it (not full-screen modal). This is the industry standard for "non-modal chat inside product." Applied to Beamix: use the same launcher geometry but replace the panel with a compact 320×auto text field. [[Intercom Copilot](https://www.intercom.com/helpdesk/copilot)]
- **Replit Ghostwriter inline widget** — "a persistent inline widget that stays open and retains information as you move around the coding environment." This is superior for Beamix because it preserves context across navigation. [[Replit blog on inline Ghostwriter](https://blog.replit.com/ghostwriter-inline)]
- **Stripe Dashboard assistant** — click help icon → drawer opens (not modal). Works for Stripe because the drawer can be dismissed without losing page context. [[Stripe assistant docs](https://docs.stripe.com/assistant)]

**→ Beamix pattern:** click companion → **inline text field expands upward from the companion itself** (~320×auto), above the companion, closable with Escape. Not a modal. Not a drawer. Not a full-page chat.

**2. Draggable companion pattern — who does it well?**
- **Granola** — drag by a handle at the bottom of the indicator. The handle makes the drag affordance explicit. [[Granola docs](https://docs.granola.ai/help-center/taking-notes/transcription)]
- **macOS desktop widgets / iOS Stage Manager** — the entire body is draggable, position remembered. Good UX but requires platform OS.
- **Arc Browser Easels** — draggable cards on a canvas. Not in product UI but same mechanic.

**→ Beamix pattern:** whole-body draggable (simpler for SMB users than Granola's handle affordance); 8px drag-threshold to disambiguate from click; position persisted per-user in `localStorage`.

**3. Glowing/pointing-at-UI-element pattern — who does it well?**
- **Coach mark / spotlight overlay pattern** — dim the page, highlight the target with a ring, show a tooltip. Classic, well-documented. [[Appcues product tours](https://www.appcues.com/blog/product-tours-ui-patterns)]
- **GitHub Copilot sparkle inline** — a small icon appears next to the active element. Downside: users call it "distracting" when it appears everywhere. [[GitHub sparkle complaints](https://github.com/microsoft/vscode/issues/272309)]
- **Siri iOS 18 edge glow** — the entire screen edge glows when Siri is listening. Too aggressive for Beamix's persistent use case, but good reference for the *saturation intensity* of a "I'm paying attention" signal. [[Softonic on Siri glow](https://en.softonic.com/articles/how-to-activate-siris-new-look-and-its-colorful-glow)]

**→ Beamix pattern:** companion *gazes toward* the target + target receives a soft breathing halo (no dimming overlay — too heavy for daily use). Combines the precision of coach-marks with the lightness of the Siri edge-glow.

**4. "I noticed you're looking at X" without being creepy — who does it well?**
- **The "proactive nudge that silences itself if ignored"** pattern — agent surfaces suggestion once, then stops if user doesn't engage. [[Interactive Studio](https://insights.theinteractive.studio/beyond-the-chat-agentic-interfaces-inside-your-product)]
- **Approval Inbox pattern** — agent doesn't interrupt; suggestions accumulate in an inbox; user reviews on their schedule. [[Benjamin Prigent — 7 UX patterns](https://www.bprigent.com/article/7-ux-patterns-for-human-oversight-in-ambient-ai-agents)] — Beamix already does this (the Inbox is the core UX). Companion's role is to **gesture toward the Inbox** when new items arrive, not to interrupt.
- **Linear's "pick up where you left off"** — restores user context on return. [[Linear AI design](https://linear.app/now/ai)]

**→ Beamix pattern:** when a new Inbox item appears, the companion **drifts toward the Inbox icon** and bobs once (~1s). If user doesn't click within 10s, stops and stays idle until user opens the inbox. Never pops a balloon. Never plays a sound. Never steals focus.

---

## THE CLIPPY LESSONS (7 specific mistakes Beamix will never repeat)

All quotes sourced to the Wikipedia article on Office Assistant and two analyses:

1. **Clippy interrupted unprompted.** It appeared when it detected an assistance opportunity, regardless of user context — e.g., typing "Dear" triggered "it looks like you're writing a letter." [[Wikipedia — Office Assistant](https://en.wikipedia.org/wiki/Office_Assistant)]
   → **Beamix rule:** companion never auto-speaks. Text only on user click.

2. **Clippy repeated the same suggestion forever.** Novelty wore off; the same suggestion came up every session. [[Nahua Kang — 5 Lessons](https://medium.com/twentybn/5-lessons-from-clippys-failure-efc69297eac1)]
   → **Beamix rule:** if user dismisses a nudge, silence for 7 days minimum. Track dismissals in DB.

3. **Clippy wasn't easily dismissed.** Not disabled by default until Office XP — 6 years after 1997 launch. [[Wikipedia](https://en.wikipedia.org/wiki/Office_Assistant)]
   → **Beamix rule:** right-click or long-press → "Hide" is always 1 step away.

4. **Clippy anthropomorphized too much.** Full-body arm gestures, eye movement, smug smile. Alan Cooper's analysis: "If people are going to react to computers as though they're humans, the one thing you don't have to do is anthropomorphize them." [[Alan Cooper via The New Stack](https://thenewstack.io/humanity-vs-clippy-lessons-from-microsofts-failed-virtual-assistant/)]
   → **Beamix rule:** face only. Eyes + brows + nose. No mouth that moves, no arms, no gestures that pantomime speech.

5. **Clippy's design process lacked diversity.** Female focus-group participants found the characters "leering" and "too male-looking"; 10 of 12 shipped assistants were male. [[Nahua Kang](https://medium.com/twentybn/5-lessons-from-clippys-failure-efc69297eac1)]
   → **Beamix rule:** companion is genderless and named abstractly (e.g., "Beamix" or a shape-name). No human referents.

6. **Clippy's context-awareness was too weak for its intrusiveness.** Suggestions were often wrong. [[Wikipedia](https://en.wikipedia.org/wiki/Office_Assistant)]
   → **Beamix rule:** companion only surfaces *routing* (gaze, gesture toward Inbox) — never *content suggestions*. Actual suggestions live in the Inbox where they can be ignored without visual intrusion.

7. **Clippy optimized for first-time users and tortured everyone else.** Useful to new users, annoying to experienced ones. [[Nahua Kang](https://medium.com/twentybn/5-lessons-from-clippys-failure-efc69297eac1)]
   → **Beamix rule:** 3-step onboarding tour runs ONCE. After that, companion is steady-state and silent.

---

## SCREENSHOT BOARD (public references for Design Lead)

**Granola (mechanic reference):**
- [Granola homepage hero video](https://www.granola.ai)
- [Granola Product Hunt gallery](https://www.producthunt.com/products/granola)
- [Granola transcription docs](https://docs.granola.ai/help-center/taking-notes/transcription)
- [Wonder Tools review — screenshots of floating indicator](https://wondertools.substack.com/p/granolaguide)
- [Zapier Granola overview](https://zapier.com/blog/granola-ai/)

**Notion AI (register + tech reference):**
- [BUCK case study with animations](https://buck.co/work/notion-ai)
- [The Brand Identity with animation stills](https://the-brandidentity.com/project/how-buck-gave-notions-ai-assistant-a-hand-drawn-personality)
- [BUCK on Threads — demo video](https://www.threads.com/@buck_design/post/DLVPX33xWiw/video-a-little-character-goes-a-long-way-meet-the-notion-ai-assistant-that-we-brought-/)
- [Fast Company analysis](https://www.fastcompany.com/91192119/notions-new-animated-ai-assistant-looks-more-new-yorker-than-clippy)
- [Notion AI product page](https://www.notion.com/product/ai)

**ElevenLabs Orb (state model + aliveness):**
- [Orb live demo + docs](https://ui.elevenlabs.io/docs/components/orb)
- [ElevenLabs UI library](https://ui.elevenlabs.io/)
- [Waveform alt-pattern](https://ui.elevenlabs.io/docs/components/waveform)
- [Bar Visualizer alt-pattern](https://ui.elevenlabs.io/docs/components/bar-visualizer)
- [Open-source orb-ui reference](https://github.com/alexanderqchen/orb-ui)

**Cautionary (Clippy + MS Copilot):**
- [Microsoft Copilot dingbat complaint thread](https://techcommunity.microsoft.com/discussions/microsoft365copilot/i-want-to-turn-off-or-hide-the-draft-with-copilot-dingbat-that-follows-my-cursor/4288889)
- [Copilot pop-up complaints](https://learn.microsoft.com/en-us/answers/questions/5417518/how-do-i-stop-the-annoying-copilot-thing-popping-u)
- [Wikipedia — Office Assistant](https://en.wikipedia.org/wiki/Office_Assistant)
- [Seattle Met — Origin story of Clippy](https://www.seattlemet.com/news-and-city-life/2022/08/origin-story-of-clippy-the-microsoft-office-assistant)

**Supplementary (for inspiration board):**
- [Claude Code ASCII spinner reverse-engineered](https://medium.com/@kyletmartinez/reverse-engineering-claudes-ascii-spinner-animation-eec2804626e0)
- [Claude thinking animation post](https://blog.alexbeals.com/posts/claude-codes-thinking-animation)
- [Siri iOS 18 edge glow overview](https://en.softonic.com/articles/how-to-activate-siris-new-look-and-its-colorful-glow)
- [Replit inline Ghostwriter blog](https://blog.replit.com/ghostwriter-inline)
- [Cursor Composer docs](https://docs.cursor.com/composer)

---

## CONFIDENCE + SOURCES

| Finding | Confidence | Basis |
|---|---|---|
| Anchor 1 — Granola mechanic | **HIGH** | Official Granola docs + multiple independent reviews confirm the drag handle, click-to-return, persistent-while-work-happens behavior |
| Anchor 2 — Notion AI register + Rive tech | **HIGH** | Agency case study (BUCK) + Fast Company reporting + multiple deep dives confirm the face-only minimalism, state-based Rive animation, and explicit anti-Clippy framing |
| Anchor 3 — ElevenLabs Orb state model | **HIGH** | Official component documentation specifies the 4 states (idle/thinking/listening/talking) and the audio-reactive shader implementation |
| Clippy failure modes | **HIGH** | Wikipedia, Alan Cooper's critique, Nahua Kang's 5-lessons analysis, The New Stack deep dive — all cross-confirm the interruption + non-dismissible + anthropomorphism + repetition failures |
| Microsoft Copilot "dingbat" anti-pattern | **MEDIUM** | User complaints on Microsoft Learn and TechCommunity forums are numerous and consistent, but official Microsoft response is limited |
| Duolingo cast → "not for SMB" assessment | **MEDIUM** | Character cast is well-documented; the "doesn't fit SMB" judgment is inference based on Duolingo's gamification register vs. Beamix's professional register |
| Linear/Interactive Studio agentic UX patterns | **MEDIUM** | Single expert source (The Interactive Studio) — patterns align with multiple other products but not independently verified by A/B testing |
| "Companion should draft toward Inbox icon on new item" | **LOW** (speculative synthesis) | Derived from proactive-nudge pattern + Beamix's Inbox architecture; no existing product does exactly this |
| Siri edge glow applicability | **LOW** | Glow pattern is documented; its fit for SMB dashboard context is speculative |

### Full source list

- [Granola — Transcription docs](https://docs.granola.ai/help-center/taking-notes/transcription)
- [Granola homepage](https://www.granola.ai)
- [Granola on Product Hunt](https://www.producthunt.com/products/granola)
- [Wonder Tools — Granola review](https://wondertools.substack.com/p/granolaguide)
- [Zapier — What is Granola](https://zapier.com/blog/granola-ai/)
- [BUCK — Notion AI case study](https://buck.co/work/notion-ai)
- [The Brand Identity — BUCK x Notion deep dive](https://the-brandidentity.com/project/how-buck-gave-notions-ai-assistant-a-hand-drawn-personality)
- [Fast Company — Notion AI "not Clippy"](https://www.fastcompany.com/91192119/notions-new-animated-ai-assistant-looks-more-new-yorker-than-clippy)
- [Sahil Bishnoi — Behind Notion's animated AI](https://sahilbishnoi.substack.com/p/behind-the-scenes-of-notions-animated)
- [BUCK on Threads — Notion AI video](https://www.threads.com/@buck_design/post/DLVPX33xWiw/video-a-little-character-goes-a-long-way-meet-the-notion-ai-assistant-that-we-brought-/)
- [ElevenLabs UI — Orb docs](https://ui.elevenlabs.io/docs/components/orb)
- [ElevenLabs UI — component library](https://ui.elevenlabs.io/)
- [ElevenLabs UI — Bar Visualizer](https://ui.elevenlabs.io/docs/components/bar-visualizer)
- [ElevenLabs UI — Waveform](https://ui.elevenlabs.io/docs/components/waveform)
- [orb-ui on GitHub](https://github.com/alexanderqchen/orb-ui)
- [Claude Code thinking animation — Alex Beals](https://blog.alexbeals.com/posts/claude-codes-thinking-animation)
- [Claude ASCII spinner reverse-engineered](https://medium.com/@kyletmartinez/reverse-engineering-claudes-ascii-spinner-animation-eec2804626e0)
- [Duolingo character names — Duoplanet](https://duoplanet.com/duolingo-character-names/)
- [Duolingo Wiki — Duo](https://duolingo.fandom.com/wiki/Duo)
- [NPR — Duolingo revives Duo](https://www.npr.org/2025/02/26/nx-s1-5309785/duolingo-owl-mascot-lives)
- [Arc Max page](https://arc.net/max)
- [Arc homepage](https://arc.net/)
- [Replit — inline Ghostwriter blog](https://blog.replit.com/ghostwriter-inline)
- [Replit — Ghostwriter announcement](https://blog.replit.com/ghostwriter)
- [Cursor Composer docs](https://docs.cursor.com/composer)
- [Cursor 2.0 announcement](https://cursor.com/blog/2-0)
- [Stripe Dashboard assistant docs](https://docs.stripe.com/assistant)
- [Lemon Squeezy checkout docs](https://docs.lemonsqueezy.com/help/checkout)
- [Microsoft Copilot — trembling icon complaint](https://techcommunity.microsoft.com/discussions/microsoft365copilot/copilot-sparkle-in-excel-missing/4471227)
- [Microsoft Copilot — dingbat follows cursor complaint](https://techcommunity.microsoft.com/discussions/microsoft365copilot/i-want-to-turn-off-or-hide-the-draft-with-copilot-dingbat-that-follows-my-cursor/4288889)
- [Microsoft Copilot — how to disable the annoying icon](https://learn.microsoft.com/en-us/answers/questions/5417518/how-do-i-stop-the-annoying-copilot-thing-popping-u)
- [GitHub Copilot sparkle complaint](https://github.com/microsoft/vscode/issues/272309)
- [Siri iOS 18 edge glow — Softonic](https://en.softonic.com/articles/how-to-activate-siris-new-look-and-its-colorful-glow)
- [Siri iOS 18 — Pocket Lint](https://www.pocket-lint.com/how-to-get-new-siri-look-glowing-border/)
- [SlashGear — iPhone edge glow explained](https://www.slashgear.com/1865686/iphone-glowing-around-edges-reason/)
- [Intercom Copilot](https://www.intercom.com/helpdesk/copilot)
- [Shopify Sidekick help center](https://help.shopify.com/en/manual/shopify-admin/productivity-tools/sidekick)
- [Slack — Slackbot AI agent announcement](https://slack.com/blog/news/slackbot-context-aware-ai-agent-for-work)
- [Linear — Design for the AI age](https://linear.app/now/design-for-the-ai-age)
- [Linear — AI](https://linear.app/now/ai)
- [The Interactive Studio — agentic interfaces inside your product](https://insights.theinteractive.studio/beyond-the-chat-agentic-interfaces-inside-your-product)
- [Benjamin Prigent — 7 UX patterns for ambient AI](https://www.bprigent.com/article/7-ux-patterns-for-human-oversight-in-ambient-ai-agents)
- [Smashing Magazine — Designing for agentic AI](https://www.smashingmagazine.com/2026/02/designing-agentic-ai-practical-ux-patterns/)
- [Appcues — Product tours UI patterns](https://www.appcues.com/blog/product-tours-ui-patterns)
- [Appcues — Tooltips](https://www.appcues.com/blog/tooltips)
- [Wikipedia — Office Assistant (Clippy)](https://en.wikipedia.org/wiki/Office_Assistant)
- [Nahua Kang — 5 lessons from Clippy's failure](https://medium.com/twentybn/5-lessons-from-clippys-failure-efc69297eac1)
- [Seattle Met — Origin story of Clippy](https://www.seattlemet.com/news-and-city-life/2022/08/origin-story-of-clippy-the-microsoft-office-assistant)
- [The New Stack — Humanity vs Clippy](https://thenewstack.io/humanity-vs-clippy-lessons-from-microsofts-failed-virtual-assistant/)
- [Windows Forum — Clippy lessons for Copilot](https://windowsforum.com/threads/clippy-lessons-for-microsoft-copilot-when-assistants-become-intrusive.411922/)
- [Versus — Clippy the assistant no one wanted](https://versus.com/en/news/clippy-microsoft-s-infamous-assistant-no-one-wanted)
- [CSS-Tricks — proliferation of the sparkles icon](https://css-tricks.com/the-proliferation-and-problem-of-the-sparkles-icon/)

---

**Overall research confidence: HIGH** — every key claim is sourced from official documentation, case studies, or cross-confirmed reporting. The three anchors (Granola mechanic, Notion register, ElevenLabs state model) each have independently verifiable behaviors, and the Clippy anti-patterns are documented by primary sources.
