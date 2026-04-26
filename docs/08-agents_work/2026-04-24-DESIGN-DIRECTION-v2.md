# Beamix Design Direction v2 — 2026-04-24
Status: PROPOSAL — replaces v1 (which was anchored on PostHog analytics-dashboard aesthetic, rejected by Adam)

---

## THE THESIS

Beamix is a professional AI-partner that makes invisible, complex agent work watchable and legible for non-technical SMB owners. The visual language is motion-first: the interface is a stage where agents perform work the user can observe, not a dashboard where the user must interpret data. The design vocabulary borrows from courier-on-canvas spatial storytelling (tldraw Fairies), the restraint of warm-minimal system products (Linear, Granola), and the state-reactive aliveness of character-driven UI (Notion AI, ElevenLabs Orb) — then fuses all three into a product language that belongs to no existing category. What we are leaving behind: the 10,000-dashboard Shadcn-card-grid template aesthetic, the PostHog-inspired analytics-first framing, and every visual pattern that treats agent AI as a configurable workflow instead of an observable, trusted partner doing work on your behalf.

---

## THE GAP WE OWN

All 15 competitors audited share the same design vocabulary: a static dashboard with a run-button. None has shipped a live agent-flow visualization that makes the scan feel like a watchable event. None has a companion character that lives inside the product shell, routes user attention, and communicates competence through behavior rather than text. None has operationalized a proactive Inbox model where suggestions arrive autonomously and the user reviews rather than configures. These three gaps — animated agent execution, character companion, proactive Inbox — are 100% unclaimed territory as of the audit date. Beamix is the first GEO tool with all three. Shipping before any competitor copies even one of them is the design moat.

Sources: `2026-04-24-R2-competitor-audit.md` (15 competitors audited, 0 have any of the three).

---

# PART 1 — THE BEHAVIOR LAYER

## THE COMPANION ("Beamie" — placeholder name for Adam's final call)

### Who Beamie Is

One character. Minimalist face: eyes, brows, nose — no mouth, no arms, no body gestures. Genderless and named abstractly. Silver/warm-neutral body base that accepts the brand blue `#3370FF` as an ambient tint shift when agents are active. Built entirely in Rive state machine — not Lottie (not state-reactive), not CSS keyframes (not expressive enough for the face micro-expressions). Size: 56×56px fixed, 16px safe-area margin from nearest edge. Z-layer: above page content, below modals and overlays.

Sources: Notion AI register via BUCK case study (https://buck.co/work/notion-ai); Rive state machine justification via https://rive.app/blog/rive-as-a-lottie-alternative; ElevenLabs Orb state model via https://ui.elevenlabs.io/docs/components/orb.

### 12 Behavior Rules (Enforceable)

**Rule 1 — Default state and resting position.**
Beamie lives in the bottom-right corner of the authenticated product shell, always. 56×56px. Slow breathing animation: scale 1.0 → 1.03 → 1.0 at 4-second period, spring physics, low stiffness. Eyes are alert (open), tint is neutral silver-gray. Beamie is not hidden or minimized by default — invisible work is the core product value, and a persistent presence signals that agents are always potentially active. Hidden only on: public marketing pages, auth flows, and full-screen modal overlays.

Source: Granola's persistent-while-work-happens pattern (https://docs.granola.ai/help-center/taking-notes/transcription); ElevenLabs Orb persistent-visible approach (https://ui.elevenlabs.io/docs/components/orb).

**Rule 2 — Appearance trigger.**
Beamie is always visible inside the authenticated shell. First-time arrival: fades in from scale(0.8) → scale(1.0) over 400ms with `cubic-bezier(0.16, 1, 0.3, 1)` — a warm arrival, not a pop. Returning users: Beamie is already present when the page renders, no entrance animation (frequency-aware motion rule from Rauno Freiberg — returning users should not re-watch entrance animations).

Source: https://rauno.me/craft/interaction-design — frequency-aware animation.

**Rule 3 — Active state when agents are running.**
Three simultaneous reactive signals:
- Body shape: subtle deformation/pulse mapped to agent heartbeat ticks. Pulse period drops from 4s (idle) to 1.2s (active).
- Face: eyebrows perform a slow wave motion (the Notion AI "thinking" micro-expression). Not frantic — one wavelength every 2 seconds.
- Color tint: body shifts toward `#3370FF` at 40% opacity. The shift is gradual (800ms ease-in-out), not a snap.
All three resolve back to idle state over 1200ms when the agent finishes.

Source: Notion AI eyebrow-wave during thinking (https://buck.co/work/notion-ai); ElevenLabs colorsRef tint-shift pattern (https://ui.elevenlabs.io/docs/components/orb).

**Rule 4 — Gaze-not-glow rule (the anti-Clippy core).**
When Beamie routes attention to a UI element, Beamie's face rotates/tilts toward that element (a gaze vector). The TARGET element receives a soft breathing halo — 2px outer shadow, `#3370FF` at 20% opacity, 2-second breathing period. Beamie itself does NOT glow. The companion is the attention router. The UI element is the action surface. This separation prevents the Microsoft Copilot "trembling icon on every cell" failure mode where the character and the target blur together into visual noise.

Source: Microsoft Copilot anti-pattern documented at https://techcommunity.microsoft.com/discussions/microsoft365copilot/i-want-to-turn-off-or-hide-the-draft-with-copilot-dingbat-that-follows-my-cursor/4288889.

**Rule 5 — Point and highlight (the nudge pattern).**
When the user lands on a screen where a suggested action exists (e.g., a new Inbox item has arrived), Beamie drifts toward the relevant nav icon or UI element over ~800ms. Arrives ~40px away. Emits a faint arc toward the target (drawn SVG line, 1px, `#3370FF` at 40% opacity, dashes animated to suggest movement). Holds for 10 seconds. If user does not engage, Beamie stops pointing, line fades, Beamie returns to idle position. Does NOT point again at the same element for the remainder of that session. The point is offered once, not repeated.

Source: Proactive-nudge-and-silence pattern from https://www.bprigent.com/article/7-ux-patterns-for-human-oversight-in-ambient-ai-agents; Appcues coach-mark spatial concept from https://www.appcues.com/blog/product-tours-ui-patterns.

**Rule 6 — Speech (silent by default, inline text on click).**
Beamie never produces text autonomously. Never. Clicking Beamie opens an inline text field anchored above Beamie — 320px wide, auto height, no modal, no drawer, no full-page chat. It is small, closable with Escape, and positioned above the companion in the same floating layer. The field shows a single context-aware message (e.g., "3 recommendations are ready in your Inbox" or "The FAQ agent is working on your homepage") plus a text input for user questions. One exception: after a user approves an agent action, a single-line confirmation toast appears near (but not from) Beamie for 2200ms: "Agent started." This mirrors Granola's minimal-state confirmation pattern.

Source: Intercom Messenger launcher geometry (https://www.intercom.com/helpdesk/copilot); Replit inline widget pattern (https://blog.replit.com/ghostwriter-inline); Granola silent-indicator + minimal-state (https://zapier.com/blog/granola-ai/).

**Rule 7 — Drag mechanics.**
Whole-body draggable — no separate handle (simpler for SMB users than Granola's handle-only pattern). Drag threshold: 8px of pointer movement before drag activates (below 8px = treated as a click). Position persists in `localStorage` keyed by user ID across sessions. Beamie does NOT snap back to its origin when released — it stays wherever the user placed it. If dragged to within 4px of the viewport edge, it snaps to the nearest safe position (16px from edge) with a 400ms `cubic-bezier(0.32, 0.72, 0, 1)` settle animation. Cannot be dragged off-screen.

Source: Granola drag-by-handle pattern (https://docs.granola.ai/help-center/taking-notes/transcription); Clippy's #1 failure: user control was ignored (https://en.wikipedia.org/wiki/Office_Assistant).

**Rule 8 — Dismiss mechanics.**
Right-click Beamie OR long-press (500ms on touch) → small context menu appears with one item: "Hide Beamie." Hidden state persists for 24 hours, then Beamie offers to return via a 32px re-appearance button in the bottom-right (a small blue dot with a face icon — not intrusive). A permanent "Show companion" option also lives in Settings → Preferences so users who dismissed can restore it without waiting 24 hours. One click = always findable. This directly addresses Clippy's failure: not easily dismissible for 6 years.

Source: https://en.wikipedia.org/wiki/Office_Assistant — Office Assistant not dismissible by default until Office XP (2001), 6 years after launch.

**Rule 9 — Onboarding vs steady-state intensity.**
First hour of use: Beamie runs a 3-step pointing tour — (1) points at the score on Home, (2) points at the Inbox nav item, (3) points at the "Run agent" button on the first recommendation. Each step is skippable (press Escape or click elsewhere). Tour runs once, never again. After the first hour: Beamie is steady-state only — ambient, never chatty, nudges only when a new Inbox item arrives or an agent completes work. This directly addresses Clippy's failure mode of optimizing for first-time users and torturing experienced ones.

Source: https://medium.com/twentybn/5-lessons-from-clippys-failure-efc69297eac1 — "optimize for repeated use, not just first time use."

**Rule 10 — Working vs idle (visually distinct at a glance).**

| State | Pulse period | Tint | Face | Sound |
|---|---|---|---|---|
| Idle | 4s slow breathe | Neutral silver | Eyes open, alert | None |
| Thinking (agent active) | 1.2s fast pulse | 40% blue tint | Eyebrows wave | None |
| Succeeded | One-shot bounce + flash | Green flash 600ms → silver | Small satisfied expression | None |
| Blocked / needs input | 2s gentle bob toward Inbox icon | 30% amber tint | Slightly tilted head | None |
| Error | Face "falls apart" momentarily (Notion pattern) | Brief red flash 300ms → silver | Reforms to neutral | None |

Source: Notion AI state model (https://buck.co/work/notion-ai); ElevenLabs 4-state model (https://ui.elevenlabs.io/docs/components/orb).

**Rule 11 — Silence timeout.**
When Beamie nudges (points at an element) and the user ignores it for 10 seconds, Beamie silently retreats to idle position. No follow-up nudge on that element for the current session. Track dismissed nudges per element per user ID in a lightweight DB table — if dismissed 3 times total, do not nudge that element again for 7 days.

Source: https://medium.com/twentybn/5-lessons-from-clippys-failure-efc69297eac1 — Clippy repeated the same suggestion forever; Beamix rule: 7-day minimum silence after 3 dismissals.

**Rule 12 — Anti-Clippy clauses (5 hard "never"s).**
1. Never auto-speak. Text appears only when the user clicks Beamie.
2. Never repeat the same nudge more than 3 times without 7-day reset.
3. Never block user flow. Beamie cannot open a modal. Cannot steal keyboard focus. Cannot intercept clicks.
4. Always dismissible in one click. Finding "hide" must never require more than a right-click.
5. Never anthropomorphize beyond a face. No arms, no mouth-as-speech, no body gestures that pantomime human communication. Eyes, brows, nose only. The face emotes; it does not perform.

Sources: https://en.wikipedia.org/wiki/Office_Assistant; https://thenewstack.io/humanity-vs-clippy-lessons-from-microsofts-failed-virtual-assistant/ (Alan Cooper: "If people are going to react to computers as though they're humans, the one thing you don't have to do is anthropomorphize them.").

### Interaction Surface

**The inline text field.** Click Beamie → a 320×auto text field expands upward from Beamie's top edge (not a modal, not a drawer). It shows one context-aware message, a single-line text input ("Ask Beamie…"), and a Send button. Pressing Escape collapses it. Pressing Send sends the query to Beamie's text interpretation layer and shows a short response in the same field. Field never exceeds 480px height — if context is longer, it scrolls internally.

**Drag mechanic.** Whole-body drag with 8px threshold. Pointer cursor changes to `grab` on hover, `grabbing` on drag. Smooth follow with 60fps. Position saved to `localStorage`. When released, applies a gentle spring settle (stiffness: 200, damping: 20) to its final position.

**Companion "apps" — what the user can ask Beamie to do:**
- "Run a new scan on my site"
- "Show me what's in my Inbox"
- "What is [term]?" (plain-language explanation of any visible UI concept)
- "What did you work on today?" (summary of agent activity)
These are routed to existing API endpoints. Beamie is a natural-language router to existing product features, not a separate AI stack.

### Where Beamie Lives Per Page

- **Home:** Idle by default. Points at score ring on first visit. Tints blue while the score is loading. When a new recommendation appears in NextSteps, bobs once toward it.
- **Inbox:** Tints blue when new items arrive. Points at the first unreviewed item. Returns to idle when user opens the item.
- **Scans:** When a scan is actively running, enters "thinking" state. Tints blue throughout. On scan completion, performs the "Succeeded" one-shot bounce before returning to idle.
- **Crew (Automation):** Points at any paused schedule. Tints amber when the kill-switch is active. Returns to neutral when all schedules are running.
- **Settings:** Idle only. No nudges — settings are intentional user-initiated navigation, not a place for companion behavior.

---

## THE AGENT FLOW VISUALIZATION ("The Stage")

### Purpose

Turn invisible agent work into a watchable 30-second journey. A non-technical SMB owner types their domain, watches a courier character carry their site to each AI model, watches the models think, watches results arrive, and reads a score. No configuration. No jargon. The experience is the explanation.

### The 7-Engine Scan Storyboard (8 frames, 30 seconds)

Source: `2026-04-24-R2-research-flow-visualization.md` — storyboard section. The metaphor shift from "character walking through the site" to "courier carrying the site to each model" is a deliberate clarification of what actually happens during a scan: Beamix asks each AI model about the site; the site is not being crawled.

**Frame 1 (0–2s): Stage opens.**
Full-page modal slides up from bottom over 300ms with `cubic-bezier(0.32, 0.72, 0, 1)`. Top bar: the domain being scanned in InterDisplay Medium. Center stage: a soft gradient field — `#3370FF` at 8% opacity over white canvas. On the left: a stylized "site card" — a small illustrated representation of the user's domain (favicon + domain name, card form). On the right: 7 model pills arranged in a gentle arc, all dim (20% opacity). Beamie fades in near the site card. No narration yet. Bottom: empty progress strip (7 model position markers, all unlit).

**Frame 2 (2–4s): Courier picks up the site.**
Beamie walks to the site card. Magnifying glass prop appears in hand (Rive state switch). Glass sweeps left-to-right over the card — a 600ms shimmer plays on the card. The scroll prop in Beamie's other hand glows briefly (the site has been "captured"). Side panel narration appears: "Reading yourdomain.com". This frame teaches the courier metaphor without explanation.

**Frame 3 (4–8s): Flight to ChatGPT.**
Beamie lifts off. A dotted path draws behind as the character moves toward the ChatGPT pill (~600ms flight duration). ChatGPT pill brightens to 100% opacity as Beamie approaches. Beamie enters the pill — pill border transitions to solid `#3370FF`. Pill begins a slow inner pulse (2s period). Floating label above pill: "ChatGPT is thinking…" with ellipsis animation. Side panel: "Asking ChatGPT…" item appears with a pulsing indicator. Bottom strip: ChatGPT position marker turns blue.

**Frame 4 (8–12s): Result from ChatGPT.**
After ~3 seconds of thinking, a data packet — a small glowing diamond, `#3370FF`, 12px — pulses outward from the pill toward center stage. Beamie emerges from the pill holding the packet. ChatGPT pill transitions to "done" state: green check overlay, opacity settles to 80%. Bottom strip: ChatGPT marker turns green. Side panel: "ChatGPT: Found 2 mentions · neutral sentiment" appears with a chevron to expand. This entry is already an artifact — the user can tap it now for the raw data.

**Frame 5 (12–20s): Parallel wave — Gemini, Perplexity, Claude.**
Beamie visits Gemini, then Perplexity, then Claude in succession (or with staggered parallel overlap if backend returns multiple results concurrently). Each model performs the same rhythm: approach → enter → think → data packet → done. The visual rhythm is intentionally hypnotic — same choreography, slight timing variation. Bottom strip fills left-to-right. Side panel populates entries in sequence. This is the "heartbeat" of the product — three engines in eight seconds.

**Frame 6 (20–24s): Remaining engines — Grok, You.com, Google AIO.**
Beamie continues around the arc. By this frame, 4–5 pills show green. 2–3 show blue (active) or dim (queued). The side panel is now 4–5 entries deep, visually confirming thoroughness. Narration slows slightly — this is the user's moment to start reading partial results before the full score arrives.

**Frame 7 (24–28s): All engines complete. Score materializes.**
Final engine finishes. Beamie returns to center stage carrying all collected data (scroll is now thick with results — a visual flourish). A score ring forms in the center: thin arc appears, then fills clockwise as the composite AI visibility score calculates. Number counts up inside the ring from 0 to the actual score over 800ms with ease-out. Score color follows the semantic scale (Critical red → Fair amber → Good green → Excellent cyan). Beamie steps to one side, presenting the ring.

**Frame 8 (28–30s): Transition to report.**
Stage fades. Score ring, model pills (now as a compact summary row), and side-panel entries animate down into their final positions on the full scan report page. Transform: `translateY(0)` from `translateY(-20px)` with `cubic-bezier(0.16, 1, 0.3, 1)` over 400ms. Beamie performs a small settled-bow gesture before fading. The user is now on the scan results page with all data visible. A "Re-watch scan" button appears in the top-right of the scan report header.

### The Stage Pattern

- **Triggered by:** User initiating a scan (button click) or agent run.
- **Location:** Full-page modal overlay. The scan IS the experience — the user should not be able to scroll away during the 30-second flow. This is intentional: the flow is the product's proof-of-work.
- **Side panel (desktop only):** A Perplexity-style progressing plan list lives in the right 280px of the stage. Each step appears as it begins, checks off when complete, and is expandable to show raw prompt/response for power users. Collapses on mobile.
- **Bottom strip:** 7 model pills with state color. Always visible — gives impatient users a quick-read of progress without watching the character animation.
- **Exit:** Stage auto-collapses and transitions to the scan report when all engines complete (Frame 8). The "Re-watch scan" button in the scan report header replays the full animation from cached data — no additional API calls.
- **Interrupt:** Cancel button (X) in the top-right with a confirmation dialog. Pause is not offered (a partial scan with 3 of 7 engines is not useful). Cancelling discards partial results.

### Flow Objects (visual vocabulary)

- **Model pill:** Circular pill, 64px diameter (desktop), 48px (mobile). Official AI model logo SVG where legally permissible, otherwise a one-letter stylized mark. Logo color stays brand-accurate. State: queued = 20% opacity, active = 100% opacity + blue border pulse, done = 80% opacity + green check.
- **Data packet:** 12px diamond shape, `#3370FF` fill, soft radial glow. Pulses along the connector path from character to pill (in) and pill to center (out). Speed: 400ms travel time. Visual weight matters — it should feel like it has physical mass, not like a geometric shape sliding.
- **Connector:** A dotted SVG path drawing itself as Beamie moves. 1px stroke, `#3370FF` at 40% opacity. When the data packet travels, the path thickens to 2px solid for 400ms then returns to dotted. Inspired directly by Make/Integromat's animated data-dot-along-connector pattern (https://www.make.com/en/integrations) — the single most emotionally effective flow animation in any automation product.
- **The site card:** 120×80px card on the left of the stage. User's favicon at 24px + domain name in Geist Mono 12px. Subtle drop shadow. The visual starting point of every scan.
- **Progress strip:** 7 pill-shaped markers at the bottom of the stage. Each marker: model logo at 16px + name at 10px Geist Mono. Color transitions: gray → `#3370FF` → `#10B981` as state progresses.

### Full Stage vs Inline Mini-Flow

- **Full Stage (30s):** Scan runs and new-scan agent runs. This is the show.
- **Inline mini-flow in Inbox item:** When an Inbox item represents a completed agent job (e.g., FAQ schema generated), the item's preview pane shows a compact 3-step timeline: "Analyzed page → Generated schema → Ready for review." No character animation. Perplexity-style step list only, in 160px vertical space.
- **Collapsed pill for long-running jobs:** Overnight crawls or batch jobs show as a status pill in the Crew page: "[Agent name] is working" with the Agent Pulse radiating. Click to expand into a mini-stage showing current step. No full-page overlay for background jobs.

---

## MOTION LANGUAGE

### Duration Budget

| Category | Duration | Rule |
|---|---|---|
| Micro-interactions (hover, active, focus) | 100–150ms | Must feel instant. Rauno's cap. |
| UI state transitions (tab switch, dropdown) | 150–200ms | Rauno's 200ms ceiling. |
| Page transitions, modal open/close | 200–300ms | Emil's 300ms ceiling. |
| Character behavior (idle breathing, gaze shift) | 300–800ms | Spring-based. Continuous loops allowed. |
| Flow visualization (scan, agent execution) | 500–2000ms | Educational motion — user is watching, not interacting. Exception to all other rules. |
| Keyboard-triggered actions | 0ms | No animation, ever. |

Sources: Rauno Freiberg (https://interfaces.rauno.me); Emil Kowalski (https://emilkowal.ski/ui/7-practical-animation-tips); `2026-04-24-R2-research-motion-pmf.md`.

### Easing Vocabulary (5 named curves)

| Name | Cubic-bezier | Use for |
|---|---|---|
| `enter` | `cubic-bezier(0.16, 1, 0.3, 1)` | Elements arriving on screen. Fast start, gentle land. Warm arrival. |
| `exit` | `cubic-bezier(0.36, 0, 0.66, 0)` | Elements leaving screen. Accelerates away cleanly. |
| `shift` | `cubic-bezier(0.45, 0, 0.55, 1)` | Elements moving between on-screen positions. Natural shift. |
| `panel` | `cubic-bezier(0.32, 0.72, 0, 1)` | Drawer and panel open/close. iOS-mimicking comfort feel. |
| `snap` | `cubic-bezier(0.25, 0.1, 0.25, 1)` | Hover backgrounds, tooltips, focus rings. Invisible, instant-feeling. |

Cold tech to never use: `linear` easing on UI transitions (robotic); `ease-in` alone on entering elements (sluggish start, abrupt stop).

Sources: Emil Kowalski (https://emilkowal.ski/ui/7-practical-animation-tips); Vaul drawer component (https://emilkowal.ski/ui/building-a-drawer-component).

### The 5 Signature Motions Beamix Owns

These are identity motions — they appear repeatedly and become the product's recognizable kinetic signature. Each corresponds to a PMF moment.

**1. Scan Reveal** — The 30-second full-stage flow visualization. Beamie as courier, 7 engine pills, data packets, score ring fill. This is the product's public aha moment and the proof that invisible agent work is watchable. PMF moment: "Do > Show > Tell" — the user experiences the product before they read about it. Duration: 28–32 seconds total.

**2. Agent Pulse** — When any agent is actively working, Beamie enters the "thinking" state (1.2s pulse, eyebrow wave, 40% blue tint) AND a soft radial pulse emanates from the relevant agent avatar or Inbox item every 2 seconds. The pulse is a spring-based outward ring: scale(1) → scale(1.6), opacity 0.4 → 0. Not a CSS spinner. A living signal. PMF moment: "Absorb complexity into the system" — the user sees work happening without knowing what it is.

**3. Score Gauge Fill** — The circular score ring animates from 0 to its actual value on first display. Duration: 800ms. Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (enter curve). Color transitions through the semantic scale as it fills: gray → red → amber → green → cyan depending on final score. Tabular numeral counter inside the ring counts up in sync. PMF moment: "One number, front and center" — the score is the hero, and it earns its position by arriving with drama.

**4. Recommendation Cascade** — When recommendations appear after a scan or agent run, they cascade down with 40ms stagger per card. Each card: `translateX(12px)` → `translateX(0)`, opacity 0 → 1, duration 300ms with `enter` easing. The first recommendation receives a 1-second border pulse in `#3370FF` at 30% opacity (the "this is your priority" signal). PMF moment: "Progressive disclosure" — the user sees what matters most, in order, not all at once.

**5. Completion Settle** — When an agent finishes work, the result card performs a micro-bounce: scale(1) → scale(1.02) → scale(1) over 200ms with spring physics (stiffness: 400, damping: 15). Simultaneously, the card border flashes `#3370FF` for 300ms then returns to gray. This is the product's "ding" — the moment it says "done, here's what we made." No confetti. No fireworks. A precise, professional acknowledgment. PMF moment: "Celebrate completion, not process" — the finished artifact gets the ceremony, not the progress bar.

Source for all 5: `2026-04-24-R2-research-motion-pmf.md` signature motions section; Emil Kowalski spring physics guidance (https://emilkowal.ski/ui/good-vs-great-animations).

### Choreography Rules

- **Stagger cap: 40ms per element, max 80ms.** When staggering a list of cards or items, 40ms per element, never exceeding 80ms total stagger spread. At 80ms, the last card enters before the first card has finished — maintaining visual cohesion. Source: Rauno's staggered motion (https://rauno.me/craft/depth), refined to 40ms (vs 30-50ms range) for Beamix's card density.
- **Never all at once.** No page section should animate entirely simultaneously. Always stagger or sequence sub-elements.
- **Interruptibility is non-negotiable.** Every animation must be cancellable mid-flight. This is not a performance suggestion — it is a rule. Users click away during animations; the UI must follow immediately, not finish its sequence first. Source: Rauno (https://rauno.me/craft/interaction-design).
- **Maximum 3 animated properties simultaneously.** Animating position (`transform`) + scale + opacity is the ceiling. Adding blur, color, and rotation simultaneously creates chaos and breaks GPU compositing. Only `transform` and `opacity` are GPU-composited — width, height, padding, margin are banned from animation. Source: Emil (https://emilkowal.ski/ui/great-animations); Vercel Web Interface Guidelines (https://interfaces.rauno.me).
- **Blur-first, content-second for overlays.** When a modal or overlay appears, blur the backdrop first (100ms), then animate the overlay content in (150ms). Two discrete steps prevent the "everything moving at once" visual collapse. Source: Rauno depth technique (https://rauno.me/craft/depth).
- **prefers-reduced-motion is mandatory.** Every animation must have a static fallback at `@media (prefers-reduced-motion: reduce)`. The companion's idle breathing becomes a static frame. The Scan Reveal becomes an instant-cut reveal of the final score. No exceptions. Source: Emil + Rauno + Vercel (all three mandate this).

### 7 Anti-Patterns (Banned Motions)

1. **Entrance animations on every page load for returning users.** First visit: animate in. Daily return: content is already there. Animating on every dashboard load creates the feeling that the product is slow. Source: Rauno frequency-aware animation (https://rauno.me/craft/interaction-design).

2. **Scaling from scale(0).** Nothing in reality appears from nothing. Minimum: scale(0.93). Elements starting at scale(0.96) feel like they already existed and just became visible. Source: Emil (https://emilkowal.ski/ui/7-practical-animation-tips).

3. **`transition: all`.** Explicitly list animated properties only. `transition: all` causes unintended layout shifts and applies animation to color, border, and size changes that should be instant. Source: Vercel guidelines (https://interfaces.rauno.me).

4. **Animating width, height, padding, or margin.** These trigger layout + paint + composite — three GPU phases. Only `transform` (for position/scale) and `opacity` are single-phase. Using `max-height` for accordion animation instead of `transform` is a common violation. Source: Emil (https://emilkowal.ski/ui/great-animations).

5. **Pulsing or looping animation on decorative elements.** Pulsing dots, gradient-shift backgrounds, and looping sparkle effects on decorative elements that carry no state information are visual noise. Looping animation is allowed ONLY for: Beamie's idle breathing, the Agent Pulse during active work, and the scan progress indicators. Source: Emil (https://emilkowal.ski/ui/you-dont-need-animations).

6. **Gradient-in-motion or parallax on scroll.** The product is a work tool visited daily. Parallax adds visual complexity without information. Animated gradients are associated with 2023-era AI-purple aesthetic (generic). Source: Frontend Design skill anti-patterns (`2026-04-24-product-ui-audit.md` critique of generic SaaS aesthetic).

7. **Tooltip delay after first show.** Once a tooltip has appeared in an area, subsequent tooltips in that area (same hover session) should show at `transition-duration: 0ms` (use `data-instant` pattern or Radix Tooltip's `disableHoverableContent`). Re-animating already-seen tooltips makes the UI feel laggy. Source: Emil (https://emilkowal.ski/ui/7-practical-animation-tips).

### Motion Tech Stack

**Primary: Motion (Framer Motion) for all UI interactions.** All page transitions, micro-interactions, layout animations, the 5 signature motions, spring physics, stagger choreography. React-native, works with Next.js 16, 30M+ monthly npm downloads. Used by both Rauno Freiberg (Vercel) and Emil Kowalski (Linear) — the two primary motion authorities for this system. Source: https://motion.dev.

**Secondary: Rive for the Beamie character only.** The character has one job: state-machine-driven facial animation. Idle breathing, eyebrow wave, face "falling apart" on error, color tint shift. Rive's binary `.riv` format is 10–15x smaller than equivalent Lottie JSON. State machine takes `agentState` as input and blends between states — this is not achievable in Motion alone. Rive runtime adds ~100KB to the client bundle (acceptable). Source: https://rive.app/blog/rive-as-a-lottie-alternative; Notion AI's Rive implementation confirmed by BUCK case study (https://buck.co/work/notion-ai).

**Skip: Lottie.** Lottie plays a timeline from frame X to Y — it does not respond to state changes mid-animation. The character must respond to real-time agent events. Lottie cannot do this. Source: https://www.rivemasterclass.com/blog/rive-vs-lottie.

**Flag for Adam:** Rive requires a designer who knows the Rive editor. It is not After Effects. Learning curve is ~1–2 weeks from After Effects background. Options: hire a Rive-specialist contractor for the character file, use an AI-first pass in Rive and polish with a contractor, or Adam learns Rive (reasonable given the character scope). Decision needed before Phase 2 begins.

---

# PART 2 — THE STAGE (static design serving the motion)

Motion is the star. Static styling is the frame. Minimal, calm, warm, out of the way.

## COLOR SYSTEM

| Token | Hex | Use |
|---|---|---|
| Canvas | `#FAFAFA` | Page background. Warm off-white (1% warmth over pure white). Not `#F7F7F7` (too gray) — `#FAFAFA` reads clean under motion without fighting the animation layer. |
| Ink | `#0A0A0A` | Primary text. Body copy, numbers, labels. |
| Muted ink | `#6B7280` | Secondary text. Timestamps, subtitles, metadata. |
| Border | `#E5E7EB` | Card edges, dividers. Low visual weight. |
| Brand accent | `#3370FF` | The only blue allowed. CTAs, active states, companion tint, gaze-moment glow, progress fills, active nav. |
| Stage canvas | `#FFFFFF` + `#3370FF` at 8% | The full-page scan stage has a slightly more present brand blue in the canvas — the stage is a special environment, not a regular page. |
| Success | `#10B981` | Agent completion, "done" state on model pills, "Succeeded" flash on Beamie. |
| Warning | `#F59E0B` | Blocked state, paused automation, amber Beamie tint. |
| Error | `#EF4444` | Failed scan, error state, error flash on Beamie. |
| Score: Excellent | `#06B6D4` | Score 80–100. |
| Score: Good | `#10B981` | Score 50–79. |
| Score: Fair | `#F59E0B` | Score 25–49. |
| Score: Critical | `#EF4444` | Score 0–24. |
| Companion body | Silver-warm: `#D1D5DB` base, shifts toward `#3370FF` at 40% mix when active | The character is not white (too stark) and not blue by default (saves the blue for active state meaning). |

**Banned colors (with source):** `#93b4ff` (found in DailySparkline — non-brand periwinkle), `#0EA5E9` (sky blue in KpiStripNew — not in palette), violet/orange/teal agent tints in ItemList/AgentAvatar. Replace all with mapped brand semantics. Source: `2026-04-24-product-ui-audit.md` color usage section.

**Dark mode:** Post-launch. No dark mode at v2 launch. Removes scope, not ambition.

## TYPOGRAPHY

**Critical fix first:** InterDisplay is not loaded in `apps/web/src/app/layout.tsx`. It is referenced via inline style fallback in Sidebar.tsx — every heading currently renders in Inter, not InterDisplay. This must be fixed before any other typography work. Add `Inter_Display` via `next/font/google`, apply via CSS variable `--font-display`, map Tailwind `font-display` class.

| Level | Font | Size | Weight | Line height | Use |
|---|---|---|---|---|---|
| H1 | InterDisplay | 40px | Medium (500) | 1.1 | Page title (hero score, scan result headline) |
| H2 | InterDisplay | 28px | Medium (500) | 1.2 | Section titles (Engine Breakdown, Recent Activity) |
| H3 | Inter | 18px | Semibold (600) | 1.3 | Card titles, subsection heads |
| Body | Inter | 14px | Regular (400) | 1.5 | All body copy |
| Label | Inter | 12px | Medium (500) | 1.4 | Form labels, metadata, category tags |
| Micro | Inter | 11px | Regular (400) | 1.3 | Timestamps, version strings, tertiary info |
| Code / agent logs | Geist Mono | 13px | Regular (400) | 1.6 | Agent output, scan raw data, developer-facing fields |
| Score hero | InterDisplay | 72px | Medium (500) | 1.0 | The one place a massive number appears (Home score hero) |

**Tabular numerals:** Mandatory on ALL numeric data — scores, dates, percentages, counts. CSS: `font-variant-numeric: tabular-nums`. Prevents layout shift as numbers update.

**Fraunces:** Retained for one specific use only — the "Inbox zero" empty state uses a short line in Fraunces 300 italic. This is the only location. Not for headings, not for hero text. Fraunces adds warmth in the one moment where the product acknowledges the user's achievement rather than prompting the next action.

**Retire:** Excalifont (was a v1 compromise for character moments — v2 uses motion in that role instead). Any Google font other than Inter/InterDisplay/Fraunces/Geist Mono.

Source: Linear's InterDisplay + Inter typography pairing (https://linear.app/now/how-we-redesigned-the-linear-ui); audit finding that InterDisplay is absent (https://docs/08-agents_work/2026-04-24-product-ui-audit.md).

## SPACING AND DENSITY

- **Base grid:** 8px. All spacing in multiples of 4px (minimum) or 8px (standard).
- **Card interior:** `p-5` (20px) standard. `p-4` (16px) for compact/secondary cards.
- **Grid gaps:** `gap-4` (16px) between cards, `gap-3` (12px) between list items.
- **Page max width:** `max-w-7xl` (1280px) as specified in Product Design System. Currently inconsistent across pages (1100–1200px). Standardize to 1280px.
- **Page horizontal padding:** `px-6` (24px) desktop, `px-4` (16px) mobile.
- **Row height for list items:** 56px minimum (touch target compliance). Scan rows, Inbox item rows, Crew schedule rows — all 56px.
- **`rounded-lg` cap:** 8px border radius on all product UI components. No exceptions. Pills (border-radius: 9999px) are marketing-only. The "Pause all" button in Automation is currently `rounded-full` — a brand guidelines violation. Fix to `rounded-lg`.
- **Shadow rule:** `shadow-sm` (0 1px 3px rgba(0,0,0,0.08)) for cards in ambient state. `shadow-md` (0 4px 12px rgba(0,0,0,0.10)) on hover or active. No `shadow-xl` or colored shadows in the base product.

**Banned patterns:**
- Tinted-square-with-centered-icon (found in KpiStripNew, Automation agent icons, FilterRail, InboxClient agent avatars). The light-tinted-square-with-icon is the #1 AI-generated SaaS fingerprint in 2024–2025. Retire it everywhere.
- Replace with: left-border accent on KPI tiles, or bare icon with semantic color, or the data itself as the visual focal point.

Source: `2026-04-24-product-ui-audit.md` AI slop signals #2, #4; brand guidelines section 4.

## ICON SYSTEM

- **Source:** Lucide React only. 2px stroke, 24px grid. One stroke weight across the entire product. No mixing with custom inline SVGs (currently violated in KpiStripNew with custom IconVisibility/IconCitation/IconImpressions/IconCredits SVGs that use 1.5px stroke on a 16px grid).
- **Per-agent icons (not all Zap):** The Automation page currently uses the Zap icon for every agent type. Each agent type gets a distinct Lucide icon:
  - Content Optimizer → `FileText`
  - Performance Tracker → `TrendingUp`
  - FAQ Builder → `HelpCircle`
  - Schema Agent → `Code`
  - Competitor Intelligence → `BarChart2`
  - Freshness Monitor → `RefreshCw`
  - Link Builder → `Link2`
- **Engine logos:** Commission or source SVG marks for the 7 AI engines (ChatGPT, Gemini, Perplexity, Claude, Grok, You.com, Google AIO). These replace text initials ("CG", "GM", "PX", "CL") in the engine breakdown grid and model pills. 16×16px, brand-accurate color, SVG format.
- **Explicit ban:** Tinted-square-with-icon backgrounds on any icon inside a card or row. Bare icon + semantic color only.

Source: `2026-04-24-product-ui-audit.md` iconography section and finding #8.

## EMPTY / LOADING / ERROR STATES

**Empty states — 4 distinct personalities (not the current 8 identical boilerplate instances):**

1. **"First scan" (Home, Scans with no scan history):** Large score ring at 0 rendered as an animated outline SVG, slowly rotating. Below it: "We don't have data for you yet." Button: "Run your first scan." Beamie sits beside the ring in idle, head tilted toward it. This is an invitation, not an error.

2. **"Inbox zero" (Inbox with no unreviewed items):** A short line in Fraunces 300 italic: "You're all caught up." Below it, the timestamp of the last completed item. A green checkmark at 40px. No action button — this is a moment of rest, not a prompt. Beamie is in "succeeded" steady state (slow green-to-neutral tint).

3. **"Automation ready" (Crew with no scheduled agents):** An illustration-minimal visual: 3 agent-type icons (FileText, TrendingUp, HelpCircle) arranged in a loose row, all at 40px with connecting dotted lines between them — a suggestion of flow. Copy: "Set up your first agent schedule." Button: "Add schedule." Beamie bobs gently toward the button.

4. **"No content yet" (generic catch-all for less-critical empty states):** Copy: "Nothing here yet." One action button. No icon. No illustration. Brevity as respect — Karri Saarinen's principle.

**Loading states:**
- Skeleton screens match the exact layout of final content. Score hero: circular skeleton ring at 72px. Card skeletons: `bg-gray-100 animate-pulse` at the card's exact width/height. Skeleton pulse uses `#3370FF` at 10% opacity — subtly branded, not generic gray.
- Agent working state: Agent Pulse animation (signature motion #2) radiates from agent avatar in Inbox item. Step-by-step progress list inside the item: "Analyzing... → Writing draft... → Reviewing quality..." Each step checks off as it completes.
- Scan in progress: Full Stage modal (signature motion #1).

**Error states:**
- Scan failed (URL unreachable): Beamie shows confused expression (Rive state: `confused`). Copy: "We couldn't reach that URL. Is yoursite.com correct?" Input field highlighted with `#EF4444` border. One retry button. No error codes visible.
- Agent timed out: Beamie shows "shrug" state. Copy: "This is taking longer than expected. We saved your progress — try again or we'll notify you when it's done." Two buttons: "Try Again" + "Notify Me."
- Network lost: Slim top banner (24px height, not a modal). `#F59E0B` background. Copy: "You're offline. Data will sync when you reconnect." Previously loaded data remains visible.

**How Beamie and motion participate in all 3 state types:** Beamie's Rive state machine has dedicated states for: loading (`thinking`), empty-zero-achieved (`succeeded`), empty-no-data-yet (`tilted-head`), error (`confused` or `error`). The companion's presence makes empty and error states feel less like system failures and more like the product communicating.

## MICRO-COPY VOICE (10 PMF Rules Applied to Beamix)

Source for all 10: `2026-04-24-R2-research-motion-pmf.md` Part B.

1. **No jargon surfaces.**
   - Before: "Configure SERP monitoring parameters."
   - After: "Choose which AI tools to track."
   - Rule: Never show GEO, SERP, schema, or NLP as primary labels. Technical terms live in tooltips and documentation only.

2. **Show working, not configuring.**
   - Before: "Set up your AI monitoring preferences to begin scanning."
   - After: "Type your business URL. We'll scan 7 AI engines and show you where you stand."
   - Rule: The first action the user sees should be the product working, not a form.

3. **Speed as character trait.**
   - Before: "Processing your request..."
   - After: "Scanning ChatGPT... (2 of 7)"
   - Rule: Every loading state names exactly what is happening and how far along it is. Vague progress indicators communicate incompetence.

4. **One number, front and center.**
   - Before: Four KPI tiles with equal visual weight (score, citations, impressions, credits).
   - After: Score ring at 72px InterDisplay dominates the top of /home. All other metrics are subordinate.
   - Rule: The AI visibility score is the product's north star. It gets hero treatment.

5. **Do > Show > Tell.**
   - Before: A tour tooltip walkthrough explaining features.
   - After: The free scan IS the onboarding. The user experiences the product before being asked to commit.
   - Rule: Users learn by seeing the product work, not by reading about it.

6. **Empty states prompt action.**
   - Before: "No scans yet. Run a scan to see your results." (current pattern — informational only)
   - After: "Run your first scan →" (action-forward, with the button as the dominant element)
   - Rule: Every empty state has exactly one action. No empty state is purely informational.

7. **Absorb complexity.**
   - Before: "Select which AI engines to include in your scan."
   - After: Scan runs on all 7 engines by default. No selection required.
   - Rule: If the system can make the decision, the user should never see the choice.

8. **Progressive disclosure.**
   - Before: Engine breakdown table with 8 columns immediately visible.
   - After: Engine breakdown shows score + verdict per engine. Click any engine to expand to raw prompt/response.
   - Rule: Default = summary. User asks for detail, we provide it. Never the reverse.

9. **Celebrate completion.**
   - Before: "Agent run completed. View output in your content library."
   - After: Completion Settle animation fires. Card bounces. Border flashes blue. Copy: "Done. Your FAQ schema is ready to review."
   - Rule: The finished artifact gets the ceremony. The process does not.

10. **Voice, not manual.**
    - Before: "Scan results indicate presence in 1 of 7 monitored engines."
    - After: "We checked 7 AI tools. ChatGPT mentions you — Perplexity and Claude don't. Here's why that matters."
    - Rule: First-person plural, active voice, present tense. The product has a voice and a perspective.

---

# PART 3 — PAGE-BY-PAGE

## /home — Dashboard Home

**Companion:** Beamie is idle on arrival. On first visit, performs 3-step onboarding tour (score → Inbox → first recommendation). On return: idle unless agent is working (thinking state) or new Inbox item has arrived (drifts toward Inbox nav icon).

**Flow visualization:** Not on this page directly — the scan that produced the dashboard data has already completed. /home receives the scan results, it does not run the scan. Exception: if a scan is actively running (user navigated away from the Stage), Beamie enters thinking state and an "Agent working" collapsed pill appears in the top-right of the page header.

**Static styling changes:**
- Score number: 28px → 72px InterDisplay-Medium. Score ring at 64px diameter. This is the hero moment of the page.
- KPI strip: Remove tinted-square icon backgrounds. Left-border accent per tile using semantic color (blue for score, green for citations, amber for impressions).
- Section headings: Fix to `text-xl InterDisplay font-display` for H2-level, not the current uniform `text-sm font-semibold gray-700`.
- Sidebar active state: `bg-[#EFF4FF] text-[#3370FF]` (the full background, not just a 2px sliver).

**Signature moment:** Score ring filling from 0 to the actual score on first page load — the Score Gauge Fill (signature motion #3). This moment earns the hero treatment. The score is not "shown" — it "arrives."

---

## /inbox — Inbox (Review Queue)

**Companion:** Tints blue when unreviewed items exist. Points at the first unreviewed item on arrival if the user has not visited the Inbox in 24+ hours. Returns to idle when user opens any item. On Approve action: Completion Settle fires on the item card, Beamie performs one-shot bounce.

**Flow visualization:** Inline mini-flow in the Preview Pane right panel. Each completed agent job shows a 3-step timeline: step list (Perplexity-style) from agent start to completion. Not a full-page Stage — contextual, compact, within the 3-pane layout.

**Static styling changes:**
- Wire the 4 action handlers (Approve, Reject, Request Changes, Archive) to real API endpoints. This is not optional — the Inbox is currently a non-functional demo. Priority zero before any visual work.
- Agent avatars: Replace violet/orange/teal tints with brand-mapped colors (blue for content agents, green for performance, amber for strategy). Replace text initials with per-agent-type Lucide icons.
- Action bar: Primary action (Accept) → `h-10` (40px) with `bg-[#3370FF]` full background. Not `h-8`. Decision moments need visual weight.
- FilterRail active state: `bg-[#EFF4FF] text-[#3370FF]` (matches sidebar pattern).

**Signature moment:** Recommendation Cascade (signature motion #4) when new items arrive — cards slide in from the right with 40ms stagger, first item gets a brief border pulse.

---

## /scans — Scan History and Results

**Companion:** Enters thinking state when a scan is actively running. Beamie points at the "Run scan now" button if the last scan was more than 7 days ago and the user has not run a scan since arriving. On scan completion: Succeeded state (one-shot bounce, green flash).

**Flow visualization:** The primary consumer of the Stage. Clicking "Run scan now" triggers the full 30-second Stage modal. Completed scans show a "Re-watch scan" button in the scan row, which replays the Stage from cached data.

**Static styling changes:**
- Page H1: `text-xl` → `text-[40px] InterDisplay font-display`.
- Filter chip active state: `bg-gray-900` → `bg-[#3370FF] text-white` (currently using near-black, a brand violation).
- Engine pips: Replace text initials with actual engine SVG logos at 16px. Add a legend row below the scan timeline on first visit.
- Score verdict label: Fix the missing "Good" label for scores 50–74 (currently shows a blank).
- "Run scan now" disabled button for non-eligible plans: Replace with an upgrade moment — "Upgrade to Build plan to run manual scans."

**Signature moment:** Score Gauge Fill (signature motion #3) on each scan row when the detail view expands — the score ring for that individual scan fills from 0 to its value in the 800ms after the row opens.

---

## /crew — Agent Crew (renamed from /automation per v1 direction)

**Companion:** Tints amber when the global kill-switch is active (all automation paused). Points at any schedule in "Failed" status. Bobs toward the "Add schedule" button if no schedules exist. Tints blue when any agent is actively running.

**Flow visualization:** Collapsed "Agent working" pill in the page header for any actively running agent (click to expand into a mini-stage with current step visible). Full Stage is not triggered from this page — it is triggered from /scans. This page is the control room, not the observation window.

**Static styling changes:**
- Page title consistency: "Auto-pilot" in H1 does not match "Automation" in sidebar nav. Align both to "Crew" (per v1 rename) or pick one. Decision needed: see Open Questions.
- "Pause all" kill-switch: `rounded-full` → `rounded-lg` (brand guidelines violation fix).
- Agent icons in schedules table: Replace uniform Zap with per-agent-type Lucide icons (FileText, TrendingUp, HelpCircle, Code, BarChart2, RefreshCw, Link2).
- Column headers: Remove `uppercase tracking-wide` label pattern — replace with `text-xs font-medium text-gray-500` (no uppercase). The all-caps + extreme tracking pattern is the #2 AI-generated "professional" marker.
- Empty state: Replace table-inside-td empty state with a full-page empty state that replaces the table entirely when no schedules exist.

**Signature moment:** Agent Pulse (signature motion #2) radiating from the agent avatar column in the schedule row when that agent is actively working. The pulse makes it immediately visible which agents are running without requiring the user to read a status column.

---

# PART 4 — THE FIRST SCAN REVEAL

The product's single most important moment. Occurs before signup. No gate. No email required. The user types their URL and experiences the full product.

**Entry point:** Public-facing URL entry field (on the marketing/Framer site, or on a dedicated `/scan` route accessible without auth).

**The sequence (8–12 seconds total, designed for actual API response time):**
- 0–1s: User types URL. Input bar animates — the border gains a soft `#3370FF` pulse as the user types (the product is already paying attention).
- 1–2s: User presses Enter or clicks "Scan." Input transforms: the URL shrinks to a styled domain chip, the scan button transitions to a state indicator. The Stage modal slides up from the bottom.
- 2–32s: The 8-frame Scan Storyboard plays (described in Part 1). All 7 engines. Real-time side panel. Beamie as courier. Score ring fill.
- 32–34s: Stage transitions to the scan result view. Score is the hero number. Top 3 recommendations cascade in.
- 34s+: A single bottom bar slides up: "Save your results and let our agents fix this — create a free account." Not a modal. Not a gate. An invitation that appears after the value has been delivered.

**Design mandate for the First Scan Reveal:**
The scan must feel faster than it actually is. While the real API calls complete (up to 60–120s for all 7 engines), the Stage uses streaming updates — each engine result that comes back from the API immediately triggers its Frame 4 sequence. The Stage does not wait for all 7 to complete before showing any results. Engines that finish early show their results. Engines still thinking show the pulse. The visual rhythm creates the perception of speed even when the total duration is longer.

**Mobile adaptation (390px):**
- Stage collapses to a square viewport (480×480px): Beamie at center, current engine pill prominent, surrounding 6 engines dimmed at the arc edge.
- Side panel becomes a bottom sheet (swipe up to view full step list).
- Progress strip at the bottom is horizontally scrollable.
- Character animation simplified: no long flight paths. Beamie fades to near the active engine pill rather than animating the full trajectory.

**Replayability:** "Re-watch scan" button in the top-right of the results view. Runs the full 30-second animation from cached data at any time. Also serves as a shareable moment — a user can show their team or client "how Beamix scanned us."

Source: Superhuman "aha moment" model (https://review.firstround.com/superhuman-onboarding-playbook/); Granola "reveal after minimal input" pattern (https://www.granola.ai); `2026-04-24-R2-research-motion-pmf.md` First Scan Reveal section.

---

# PART 5 — IMPLEMENTATION PLAN

## Phase 0 — Quick Wins (under 1 week, no new design required)

All of these are audit findings from `2026-04-24-product-ui-audit.md`. None requires new component design — only targeted fixes.

1. **Load InterDisplay in `apps/web/src/app/layout.tsx`.** Add `Inter_Display` via `next/font/google`. Apply via `--font-display` CSS variable. Map `font-display` Tailwind class. Every heading across 4 pages will immediately render in the correct font. Estimated: 1 hour.

2. **Load Geist Mono in `apps/web/src/app/layout.tsx`.** Add `Geist_Mono` via `next/font/google`. Apply via `--font-mono` CSS variable. Use for agent output, scan logs, any monospaced display. Estimated: 30 minutes.

3. **Fix sidebar active state.** `Sidebar.tsx:68-73` — Change from `bg-gray-50 text-gray-900` to `bg-[#EFF4FF] text-[#3370FF]`. Add `text-[#3370FF]` to the active icon. The 2px left border sliver stays. Estimated: 30 minutes.

4. **Purge non-brand colors.** Remove `#93b4ff` from DailySparkline, `#0EA5E9` from KpiStripNew, violet/orange/teal agent tints from ItemList and AgentAvatar. Replace with brand semantic colors. Estimated: 2 hours.

5. **Fix filter chip active state on /scans.** `ScansClient.tsx:569-572` — `bg-gray-900` → `bg-[#3370FF] text-white`. Estimated: 30 minutes.

6. **Remove tinted-square-with-icon pattern from KpiStripNew.** Replace the `h-8 w-8 rounded-lg` icon backgrounds with left-border accent treatment on the tile cards. Estimated: 2 hours.

7. **Enforce `rounded-lg` on Pause-all button.** `AutomationClient.tsx:784` — `rounded-full` → `rounded-lg`. Estimated: 5 minutes.

8. **Replace per-agent Zap icons with distinct Lucide icons.** `AutomationClient.tsx:276-280` — Map agent types to the 7 distinct icons listed in Part 2. Estimated: 1 hour.

9. **Make score hero on /home a visual anchor.** `HomeClientV2.tsx:91` — `text-[28px]` → `text-[72px] font-display InterDisplay-Medium`. Remove score from KpiStripNew Tile 1 if duplicated. Estimated: 3 hours (includes layout adjustment).

10. **Wire Inbox action stubs to real API.** `InboxClient.tsx:99-125` — Replace 4 `console.log` stubs with real fetch calls to `/api/content-items/[id]/[action]`. Add optimistic removal, spinner state, error rollback. Estimated: 4–8 hours. This is a prerequisite for shipping — the Inbox is currently non-functional.

**Phase 0 total: approximately 3–4 days of focused engineering.**

---

## Phase 1 — Motion Foundation (1 sprint / 2 weeks)

- Add Motion (Framer Motion, if not already installed as `motion` package) and standardize all UI animation through it.
- Define the 5 easing curves as CSS variables + Motion constants. Replace any ad-hoc `transition-all` or inline duration values with the named curves from Part 1.
- Build the 5 signature motions as reusable React components:
  - `<ScanReveal />` — full-page Stage orchestrator (wires to Rive character + motion choreography)
  - `<AgentPulse />` — radial pulse component, accepts `isActive` prop
  - `<ScoreGaugeFill />` — animated circular ring + counter, accepts `score` and `prevScore` props
  - `<RecommendationCascade />` — list wrapper that staggers children with 40ms delays
  - `<CompletionSettle />` — HOC that wraps any card and fires the bounce + border flash on `isComplete` change
- Add Rive runtime (`@rive-app/react-canvas`) to the project.
- Create Beamie MVP character file in Rive: 4 states — `idle`, `thinking`, `succeeded`, `error`. (Full 8-state character is Phase 3.)
- `prefers-reduced-motion` fallbacks for all 5 signature motions.

---

## Phase 2 — The Stage (2 sprints / 4 weeks)

- Build the full-page Stage modal with all 8 frames.
- Implement the 7-engine flow canvas: site card, model pills in arc arrangement, connector paths, data packet animation, score ring materialization.
- Wire Stage to the real scan API (streaming updates as each engine responds).
- Build the Perplexity-style side panel: progressing step list with real scan data.
- Build the bottom progress strip with model state management.
- Implement the First Scan Reveal flow on the public `/scan` route (no auth required until after score is shown).
- "Re-watch scan" replay functionality on completed scan rows.
- Mobile adaptation: collapsed viewport, bottom-sheet side panel, simplified character fade.

---

## Phase 3 — The Companion (1 sprint / 2 weeks)

- Expand Beamie's Rive file to the full 8+ states: idle, thinking, succeeded, error, confused, blocked (amber), pointing, tilted-head.
- Wire Beamie into the product shell (DashboardShellClient or layout level) — persists across all authenticated routes.
- Implement drag mechanic with `localStorage` position persistence.
- Implement inline text field (click-to-open, 320px, anchored above Beamie).
- Implement gaze-not-glow: gaze rotation toward target element + target halo animation.
- Implement the nudge/point/silence behavior: drift toward target → 10s silence timeout → retreat.
- Implement 3-step onboarding tour (first hour only).
- Implement dismiss mechanic (right-click/long-press → hide → 24h persistence → re-appearance button).
- Wire Beamie state to real agent activity: listen to Supabase realtime events on `agent_jobs` table for state transitions.

---

## Phase 4 — Per-Page Rebuilds (2 sprints / 4 weeks)

Using the Phase 0 fixes as a base, rebuild each of the 4 core pages with the full motion + companion + static styling system:
- /home: Score hero, engine breakdown with SVG logos, NextSteps with cascade animation, empty states (First Scan variant).
- /inbox: 3-pane with wired actions, inline mini-flow in preview pane, proper empty states (Inbox Zero variant), Recommendation Cascade on new items.
- /scans: Full Stage integration, Score Gauge Fill on row expand, scan history with SVG logos, scan replay.
- /crew: Per-agent icons, Agent Pulse in schedule rows, Collapsed pill for running agents, empty state (Automation Ready variant), fixed naming consistency.

---

## Phase 5 — Polish (1 sprint / 2 weeks)

- Quality Wednesdays process: 30-minute weekly sessions fixing craft issues (misaligned elements, wrong duration values, inconsistent border radii, hover fade mismatches). Linear's model — 1,000 small fixes over time — applied to Beamix.
- Onboarding flow with Beamie: refine the 3-step tour based on real user testing.
- `prefers-reduced-motion` audit across all new components.
- WCAG contrast audit on all new colors (brand blue on white backgrounds: check `#3370FF` at 14px regular — may need to confirm AAA or AA compliance).
- Typography consistency pass: verify all headings use `font-display` class, all code elements use `font-mono`.
- Micro-copy pass: apply all 10 PMF rules across all 4 pages, audit every `text-xs text-gray-500` label for voice compliance.

**Total: 6–7 sprints (~12–14 weeks) for full rollout. Phase 0 ships this week. Phase 1 delivers the motion vocabulary that every subsequent phase builds on.**

---

# PART 6 — OPEN QUESTIONS FOR ADAM

1. **Beamie's creator: commission vs AI-first-pass.** The Rive character requires genuine animation design skill. Options: (a) hire a Rive-specialist contractor for 2–4 weeks to produce the character file (estimated $3,000–$8,000 USD for a 4–8 state character); (b) use an AI-generated base (Midjourney for visual, manual Rive rig) and refine with a contractor; (c) Adam learns Rive (the editor is approachable — 1–2 week ramp from After Effects). Which path fits the current budget and timeline?

2. **Character name: "Beamie" or something else?** "Beamie" is the placeholder. It derives from Beamix and has warmth without being playful. Alternative approaches: a shape-based name (no human referent), an abstract name, or leaving it unnamed entirely (just "your companion" in copy). Final name needed before Phase 3 begins.

3. **First Scan Reveal without signup gate: confirmed?** The research strongly supports showing the full scan result (including the score) before asking for an email. This is the "Do > Show > Tell" principle applied to onboarding — deliver value before asking for commitment. The ask appears as a bottom bar after the score reveals. Risk: users see results without converting. Reward: conversion rate on users who experience the aha moment first is likely to be significantly higher. Adam needs to make this call before Phase 2 begins.

4. **Page/section naming: confirm "Crew" for /automation?** v1 direction renamed /automation to /crew. The current code has inconsistency (nav says "Automation," H1 says "Auto-pilot"). This document uses "Crew" as the v1 decision. Confirm or pick a different name before Phase 4 begins.

5. **Rive licensing for commercial product.** Rive offers a free tier and paid plans for commercial use. Before committing Rive as the character runtime, confirm the licensing model fits the Beamix commercial context (white-labeling is one consideration if Beamix SaaS ever packages the product for other companies). Source: https://rive.app/pricing.

---

# WHAT WE ARE EXPLICITLY NOT DOING

- No cast of characters. One Beamie, that's it. Agent identity lives in Inbox badges and per-agent icons, not in separate roaming companions.
- No 3D. Flat Rive state-machine animation only. Three.js / WebGL is overkill for this audience and this use case.
- No auto-speech from Beamie. Text only on user-initiated click. Never.
- No character with a mouth, arms, or body language that pantomimes speech. Eyes, brows, nose. The face emotes; it does not perform.
- No dark mode at launch. Out of scope for v2; post-launch addition.
- No marketing site changes. The Framer site is a separate project. Every decision in this document applies to the Next.js product app only.
- No PostHog-style static mascot. v1 explored a static character defined by color and proportion; v2 replaces that with motion — the character is defined by its states and behaviors, not its static appearance.
- No gradient-in-motion backgrounds. No parallax on scroll. No looping sparkle animations on non-state elements.
- Brand blue `#3370FF` stays locked. No orange accent, no navy, no cyan as the primary UI signal.
- No Excalifont. Fraunces for one specific empty state only. InterDisplay + Inter for everything else.
