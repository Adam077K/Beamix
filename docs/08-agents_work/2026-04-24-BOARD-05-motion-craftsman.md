# Board Seat 5 — The Motion Craftsman Critique
Reviewer persona: Rauno Freiberg / Emil Kowalski / Paco Coursey–school motion designer
Date: 2026-04-24
Scope: `docs/08-agents_work/2026-04-24-DESIGN-DIRECTION-v2.md` Part 1 (Motion + Stage + Companion)
Reviewing against: `docs/08-agents_work/2026-04-24-R2-research-motion-pmf.md`

---

## 0. TL;DR — THREE SENTENCES

v2 has the right references on the wall and the wrong numbers under the references. The motion specs look rigorous (five curves, five signatures, five character states) but when you look closely almost every duration is a round number ("400ms", "800ms", "1200ms", "30 seconds") with no second-derivative justification — those are vibes pretending to be values. The five "signature motions" as specified collapse to three real motions and two children of them; the Stage is 11–14s of real content padded to 30s of theater; and the character's idle-breathe violates Rauno's own frequency rule that v2 quotes on the same page.

**This document fixes that.**

---

## 1. WHAT V2 GETS RIGHT (motion-specific)

Before the beating, credit.

1. **Two-layer tech split (Motion for UI, Rive for character).** Correct in principle. Motion is the right primitive for declarative React animation and layout transitions. Rive is the only runtime that accepts `agentState` as a state-machine input and blends between character states. v2 correctly rejects Lottie for the character because Lottie is a timeline, not a state machine.
   - Source: https://rive.app/blog/rive-as-a-lottie-alternative — state-machine vs timeline distinction.
   - Source: https://motion.dev — React-native, Next.js-compatible.

2. **Five named easing curves, not infinite ad-hoc bezier values.** Rauno and Emil both mandate a named vocabulary. Emil's Vaul uses `cubic-bezier(0.32, 0.72, 0, 1)` as a single memorable curve; Beamix mirroring that pattern is correct craft.
   - Source: https://emilkowal.ski/ui/building-a-drawer-component

3. **40ms stagger cap.** Correct order of magnitude. Rauno's `depth` essay works with roughly 30–50ms. 40ms sits at the center and is defensible for a dense dashboard.
   - Source: https://rauno.me/craft/depth

4. **Maximum 3 simultaneously animated properties (transform + opacity ONLY at the ceiling).** Correct — this is Vercel Web Interface Guidelines verbatim. No deviation needed.
   - Source: https://interfaces.rauno.me

5. **Ban on animating `width`/`height`/`padding`/`margin`.** Correct. These trigger layout+paint+composite; `transform` + `opacity` are single-phase GPU.
   - Source: https://emilkowal.ski/ui/great-animations

6. **Anti-Pattern #7: tooltip delays after first show.** Directly lifted from Emil's 7-practical-tips; correctly applied. Beamix should hook this into Radix `Tooltip` with `delayDuration={0}` after the first show via a provider-level "recently hovered" set.
   - Source: https://emilkowal.ski/ui/7-practical-animation-tips

7. **`prefers-reduced-motion` is mandatory.** Stated. The problem is v2 names the rule but does not specify what the fallback IS for each signature motion (fixed in §9 below).

8. **Never animate keyboard-triggered actions (0ms).** Exactly right. Users hit Enter hundreds of times per session; animation on keyboard triggers feels like lag.
   - Source: https://emilkowal.ski/ui/you-dont-need-animations

**Everything else below is where v2 hand-waves or contradicts itself.**

---

## 2. EVERY HANDWAVE CALLED OUT

For each hand-wave: the quote, the diagnosis, the replacement.

### Hand-wave #1 — "4-second period, spring physics, low stiffness"

> "Slow breathing animation: scale 1.0 → 1.03 → 1.0 at 4-second period, spring physics, low stiffness." (Rule 1)

**Diagnosis:** "Low stiffness" is a vibe, not a number. Motion's spring API takes `stiffness`, `damping`, `mass`. You cannot ship "low stiffness." Also: a 4-second period for a 3% scale delta (1.00 → 1.03) means peak velocity is ~0.03/2s = 1.5% per second. That is below human motion-detection threshold at typical screen distance — the animation is effectively invisible, which is worse than no animation because the GPU is still compositing it. Either make it visible or delete it.

**Replacement:** See §6 (argue for NO idle motion). If Adam insists on an idle signal, spec is: `scale: [1, 1.02, 1]`, `transition: { duration: 3.2, ease: [0.45, 0, 0.55, 1], repeat: Infinity }`. Non-spring (spring on infinite loops is wasteful — no rebound needed). 3.2s period because at 3% peak displacement, 3.2s gives a ~1%/s peak velocity that is at the edge of perceptible without being distracting. But I still argue for zero idle motion — §6.

---

### Hand-wave #2 — "Pulse period drops from 4s (idle) to 1.2s (active)"

> "Pulse period drops from 4s (idle) to 1.2s (active)." (Rule 3)

**Diagnosis:** Where does 1.2s come from? It is a round number halfway between "1 second" and "1.5 seconds." 1.2s = 50 BPM = slow resting heartbeat. Agent work should feel like active intelligence, not Xanax. Human comfortable attention pulse (used in breathing apps, Headspace, Calm): 4s in, 4s out. Human alert-state pulse (Apple Watch breathe reminders): 2s in, 2s out. Nothing ships at 1.2s except CSS tutorials from 2015.

**Replacement:** `1.4s` active pulse period, ease `[0.45, 0, 0.55, 1]` (symmetric sine-like). Justification: 1.4s = ~43 BPM = slightly-elevated-but-calm. Enough contrast vs the idle state (if kept). Matches ElevenLabs Orb's active pulse (≈1.3–1.5s observed in their shipping component).
   - Source: https://ui.elevenlabs.io/docs/components/orb

---

### Hand-wave #3 — "cubic-bezier(0.16, 1, 0.3, 1) for Beamie entrance"

> "fades in from scale(0.8) → scale(1.0) over 400ms with `cubic-bezier(0.16, 1, 0.3, 1)`" (Rule 2)

**Diagnosis:** This curve is the "expo-out" family — extreme overshoot-free deceleration. It is correct for UI panels. It is WRONG for a living character arriving on stage. For a character, you want a tiny overshoot (Disney "anticipation" / "follow-through" — which Rauno explicitly names as his favorite Disney principle). `(0.16, 1, 0.3, 1)` is glass sliding into place. Beamie is a companion, not glass.

Also: `scale(0.8) → 1.0` over 400ms. Emil says minimum scale start is 0.93–0.96. Anything below 0.93 reads as "popped into existence from nothing," which is exactly what v2 bans in Anti-Pattern #2 (banned: `scale(0)`; start: 0.93 min). v2 contradicts itself.

**Replacement:**
- Scale: `0.92 → 1.04 → 1.00` (overshoot to 1.04, settle to 1.0).
- Opacity: `0 → 1`.
- Duration: 520ms total, with scale using spring (`stiffness: 220, damping: 18, mass: 1`) and opacity using a linear 220ms `ease: [0.22, 1, 0.36, 1]` that finishes at ~42% of total duration so Beamie is visually present before the overshoot resolves.
- Rendered in: Rive (the whole entrance is a state-machine transition from `null → idle`), NOT Motion. Motion should not animate Rive's container scale — fight for what's Rive's and what's Motion's (see §7).
   - Source for overshoot: https://emilkowal.ski/ui/good-vs-great-animations — "reserve spring for personality animations."
   - Source for 0.92 floor: https://emilkowal.ski/ui/7-practical-animation-tips

---

### Hand-wave #4 — "Side panel narration appears: 'Reading yourdomain.com'"

> Frame 2: "Side panel narration appears"

**Diagnosis:** How does it appear? Fade? Type-on? Slide-up? Stagger? Not specified. This is the side panel v2 calls "Perplexity-style" — Perplexity's plan list has a very specific fade-in-from-translateY(8px) pattern with 200ms per item. v2 did not specify, which means the first engineer to implement it will pick something at random and it will look wrong.

**Replacement:** Each side-panel step: `opacity 0 → 1` over 180ms, `translateY 6px → 0` over 200ms, ease `[0.16, 1, 0.3, 1]`. Staggered 40ms after the previous step. When step completes: checkmark SVG draws in via `pathLength: 0 → 1` over 240ms (Motion has built-in support for this on SVG paths).

---

### Hand-wave #5 — "800ms ease-in-out tint shift"

> "Color tint: body shifts toward `#3370FF` at 40% opacity. The shift is gradual (800ms ease-in-out), not a snap." (Rule 3)

**Diagnosis:** "ease-in-out" is CSS's built-in `cubic-bezier(0.42, 0, 0.58, 1)`, which v2 explicitly bans in the next section ("Cold tech to never use: `linear` easing on UI transitions (robotic); `ease-in` alone on entering elements"). v2 just recommended a named curve and then used a generic keyword for the character work.

Also: 800ms for a tint shift is a FULL second of "something is changing." Compare: React Aria's color transition is 200ms. Linear's state-change tint is 180ms. 800ms reads as "the computer is slow," not "the character is thinking."

**Replacement:**
- Idle → Thinking tint: 320ms, ease `[0.45, 0, 0.55, 1]` (the `shift` curve v2 already defined — use it).
- Thinking → Succeeded tint flash: 180ms up (to green), 600ms hold, 240ms down (back to silver). Asymmetric on purpose — success claims attention, then releases it.
- Thinking → Error flash: 120ms up (to red — urgent), 180ms hold, 360ms down. Faster up, slower down — error cognition model from ElevenLabs Orb error state.
- Rendered in: Rive mesh blend. NOT Motion. Tint is a character-visual property and belongs to the state machine.

---

### Hand-wave #6 — "One wavelength every 2 seconds" (eyebrow wave)

> "Face: eyebrows perform a slow wave motion (the Notion AI 'thinking' micro-expression). Not frantic — one wavelength every 2 seconds." (Rule 3)

**Diagnosis:** What wave? Sine? Triangle? What amplitude? Both eyebrows in phase or 180° out of phase? Rotation or translation?

**Replacement (Rive state-machine graph):**
- Both eyebrows, translated on Y axis only (not rotated — rotation makes it angry).
- Amplitude: 4% of face height (i.e., ~1.1px at 56px Beamie size — visible but not cartoonish).
- Period: 1.8s. Sine wave.
- Phase offset: 180° between left and right eyebrow (one up while the other is down). This is the Notion AI signature — without the phase offset it just looks like surprised.
- Rendered in: Rive. This is a state-machine input value `thinking_intensity` (0.0 → 1.0) controlling a mesh deformation.
   - Source: BUCK on Notion AI eyebrow micro-expression, https://buck.co/work/notion-ai.

---

### Hand-wave #7 — "Bobs once toward it"

> Home: "When a new recommendation appears in NextSteps, bobs once toward it." (Where Beamie Lives Per Page)

**Diagnosis:** What is "once"? How far? How fast? Does it return?

**Replacement:**
- Translate `translateX(6px)` toward target element (positive or negative depending on relative position).
- Duration: 420ms out, 560ms back.
- Ease out: `[0.22, 1, 0.36, 1]`. Ease back: spring `stiffness: 180, damping: 22` (gentle return, no overshoot).
- Total bob motion: 980ms. One cycle only. No repeat. If user moves cursor or types during the bob — ABORT immediately, cancel Motion animation, return to rest position over 180ms.
- Rendered in: Motion (wraps the Rive container).

---

### Hand-wave #8 — "2-second breathing period" (gaze halo)

> "The TARGET element receives a soft breathing halo — 2px outer shadow, `#3370FF` at 20% opacity, 2-second breathing period." (Rule 4)

**Diagnosis:** 2s period on a persistent halo means it loops forever until the user acts. v2's own Rule 11 says "silence timeout" after 10 seconds. So the halo loops 5 times and then...?

**Replacement:**
- Halo pulse: 1.6s period, 3 cycles total (4.8s), then stop and hold at 40% opacity steady state until either (a) user clicks the target (halo dissolves over 200ms), or (b) 10s total elapsed from Beamie pointing (halo fades over 300ms, Beamie retreats).
- Shadow: `0 0 0 2px rgba(51,112,255,0.30)` at peak, `0 0 0 0 rgba(51,112,255,0)` at trough. Spread animation is cheaper than opacity animation for outer shadow (GPU composites it as a single layer).
- Rendered in: CSS (keyframes) — this does not need Motion. Simplicity wins.

---

### Hand-wave #9 — "Side panel collapses on mobile"

> "Side panel (desktop only): A Perplexity-style progressing plan list..." "Collapses on mobile."

**Diagnosis:** Collapses HOW? Into a drawer? A bottom sheet? A single current-step ticker? Not specified.

**Replacement:** Mobile uses a bottom-sheet peek (64px visible, swipe up to 40% viewport height, swipe again to 85%). Use Vaul (Emil's open-source drawer). Default state: 64px peek showing current step + engine name only. Drawer animation curve: `cubic-bezier(0.32, 0.72, 0, 1)` (the `panel` curve Beamix already defined).
   - Source: https://emilkowal.ski/ui/building-a-drawer-component

---

### Hand-wave #10 — "Replays the full animation from cached data"

> "The 'Re-watch scan' button in the scan report header replays the full animation from cached data — no additional API calls."

**Diagnosis:** If the original Stage runs 11–14s of real work padded to 30s of theater (see §3), does the replay also stretch to 30s? Or replay at real data speed (nearly instant)? Or replay at user-adjustable speed like a video?

**Replacement:** Replay runs at a fixed 22s duration (shortened from 30s because on replay the user already knows the story and pacing can compress). Provide a `1×` / `2×` / `skip` control in top-right of the replay overlay. Skip jumps to Frame 8 immediately with a `translateY(16px) → 0` reveal of the final state over 240ms. This matches Rauno's frequency-aware rule: the FIRST time is a performance; subsequent views should compress or skip entirely.
   - Source: https://rauno.me/craft/interaction-design — frequency-aware animation.

---

### Hand-wave #11 — "Flow visualization: 500–2000ms — Educational motion"

> "Flow visualization (scan, agent execution): 500–2000ms. Educational motion — user is watching, not interacting. Exception to all other rules."

**Diagnosis:** 2000ms for any single UI element is a LOT. This is the category that will spawn 90% of the future animation sins ("it's educational motion so 1.8s is fine"). Needs a harder ceiling or a sub-taxonomy.

**Replacement:** Split into two tiers:
- **Narrative beat** (single atomic story event, e.g., packet traveling from pill to center): 600–900ms. Hard ceiling.
- **Narrative arc** (multi-beat sequence, e.g., Frame 3 = fly + enter + pulse-start): composed of 3–4 narrative beats of 300–700ms each, totaling 2400ms max for a single frame.
- Never a single animation > 900ms. Long arcs are composed.

---

### Hand-wave #12 — "`prefers-reduced-motion` becomes a static frame"

> "The companion's idle breathing becomes a static frame. The Scan Reveal becomes an instant-cut reveal of the final score."

**Diagnosis:** "Instant-cut reveal" from what to what? Still need to preserve information delivery. The Scan Reveal TEACHES the user what happens ("we asked 7 AI engines"). Removing it entirely for reduced-motion users removes understanding, not just polish.

**Replacement:** See §9 for full reduced-motion spec. Short version: instead of removing the animation, collapse the 30s temporal reveal into a 3-step non-animated sequence with explicit text: (1) "Asking 7 AI engines…" (show all 7 pills dim), (2) "Results in…" (replace pills with results one per 300ms with opacity-only transition, NO scale/translate), (3) "Score: 62" (reveal score with opacity only). The EDUCATION survives; the SPECTACLE is removed.

---

## 3. THE 30-SECOND STAGE, TIMED FRAME BY FRAME

### v2's spec (reconstructed from Frame 1–8 timings):

| Frame | v2 duration | v2 content |
|---|---|---|
| 1 | 2s | Stage opens, pills visible, Beamie fades in |
| 2 | 2s | Beamie walks to site card, magnifying glass sweep |
| 3 | 4s | Flight to ChatGPT, pill enters pulse state |
| 4 | 4s | ChatGPT result, data packet travels, side panel entry |
| 5 | 8s | Gemini, Perplexity, Claude (parallel or staggered) |
| 6 | 4s | Grok, You.com, Google AIO |
| 7 | 4s | Score ring materializes |
| 8 | 2s | Transition to report |
| **Total** | **30s** | |

### Problems:

1. **The 30s total is a story goal, not a data-driven number.** The research says "Scan completes 8–12 seconds" for PMF (R2 research). Real backend takes 60–120s across 7 engines. v2 picks 30s as the middle ground. Fine as a target, but the math breaks: if ChatGPT takes 4s (Frame 3 + 4), the other 6 engines have 16s total (Frame 5 + 6) = 2.67s per engine. That's faster than a real API round-trip for most engines.

2. **Frame 5 packs 3 engines into 8s = 2.67s each.** Can the user READ "Gemini: Found 2 mentions · neutral sentiment" in 2.67s while the next engine starts pulsing? Probably not. Human reading rate for a 7-word English phrase is ~2.1s. You are leaving 0.5s of cognitive buffer. Tight.

3. **The 7 × 5s = 35s "math doesn't add up" concern Adam flagged is valid.** At 5s per engine, you're at 35s just for engines, before the score ring, transitions, or the site-card intro. 30s is impossible unless you parallelize or compress.

4. **Parallelism is hand-waved ("or with staggered parallel overlap").** Engineers will choose one or the other and the storyboard won't match reality. Pick one and commit.

### My revised Stage timing — 26s total with hard numbers:

| Frame | Duration | Content | Rendering | Interrupt rule |
|---|---|---|---|---|
| 0 (NEW — implicit) | 0.3s | User presses Enter. URL input compresses to domain chip, scan button transforms to state indicator. | Motion | Abort: rare — usually the user pressed Enter already |
| 1 | 1.6s | Stage modal slides up from bottom. Pills appear in arc, ALL dim at 20%. Beamie fades in near site card. Bottom progress strip appears. NO courier behavior yet. | Motion (modal) + Rive (Beamie entrance) | Abort → slides back down in 220ms |
| 2 | 1.8s | Beamie walks to site card (420ms travel), magnifying glass prop appears in hand (Rive state switch, 180ms), 600ms shimmer sweep over card, side panel entry #1: "Reading yourdomain.com" fades in. | Motion (translation) + Rive (prop switch + eye tracking to card) | Abort → site card returns to dim, skip to cleanup |
| 3 | 2.4s | Flight to ChatGPT (800ms — NOT 600ms, feel physics). ChatGPT pill brightens (320ms). Beamie enters pill (240ms). Pill solid border transition (180ms). Side panel entry: "Asking ChatGPT…" (220ms). Pulse starts (1.4s period, first peak visible within this frame). | Motion (flight path) + Rive (Beamie enters pill, becomes invisible inside it) + CSS keyframes (pulse) | Abort mid-flight → Beamie snaps to rest, pill returns to dim |
| 4a (NEW) | 1.2s | ChatGPT "thinking" — pulse visible, side panel shows indeterminate spinner next to "Asking ChatGPT…". This is INTENTIONAL empty time — it communicates that real work is happening. | CSS (pulse) | Abort → dissolve pill to dim |
| 4b | 1.6s | Data packet emerges (pulse outward from pill, 220ms), travels to center stage (560ms travel with slight arc — NOT straight line; Disney's "arcs not straights"), Beamie emerges from pill holding packet (320ms). ChatGPT pill transitions to "done" (green check draw-on: 340ms pathLength animation). Side panel updates: "ChatGPT: Found 2 mentions · neutral sentiment" + chevron. | Motion (packet translation) + Rive (Beamie emerge state) + Motion (SVG draw-on for check) | Abort → packet vanishes, pill stays at done state |
| 5 | 7.2s | Parallel burst across Gemini + Perplexity + Claude. Each engine: 200ms flight start offset, 2.0s thinking, 1.6s result. Because staggered, overlap is ~600ms. Total wall-clock 7.2s. Side panel gets 3 entries, one every ~2.4s. | Motion + Rive | Abort → all three pills instantly snap to whatever state they have cached |
| 6 | 5.4s | Remaining 3 engines (Grok, You.com, Google AIO). Same rhythm as Frame 5. This is where impatient users scan the bottom progress strip. Beamie's courier pattern now feels established — he flies faster (spec: 520ms flight per engine, not 800ms — rhythm tightens as user adapts). | Motion + Rive | Same as Frame 5 |
| 7 | 3.2s | All engines green. Beamie returns to center (320ms). Score ring forms: arc draws in clockwise (360°) over 1400ms with `[0.16, 1, 0.3, 1]`. Tabular-num counter counts up from 0 simultaneously (1400ms, matched). Color mid-animation shifts through semantic scale (gray at 0% progress → red at score-critical range → amber → green → cyan) via a timed color interpolation synced to counter value, NOT to time. | Motion (arc + counter) + Rive (Beamie "presenting" pose) | Abort → snap to final score + color |
| 8 | 2.2s | Stage backdrop fades (400ms), model pills compact into summary row (translateY 0 → -120px + scale 1 → 0.72, 520ms, stagger 40ms), side panel entries slide into scan-report layout positions (staggered 60ms, 400ms each). Beamie performs small bow (Rive state: `satisfied_bow`, 640ms), fades. | Motion (all position transitions) + Rive (Beamie bow + fade) | Abort = instant-cut to report |
| **Total** | **25.9s** | | | |

**Buffer:** Plus 0.3s (Frame 0) implicit = 26.2s wall-clock.

### Why 26s not 30s:
- Rauno: "animations must never force completion." A 30s mandatory show is HOSTILE when the user already knows what's happening after scan #2. 26s leaves time for a subtle "skip to results" affordance to appear at second 8 (after the 2nd engine) for returning users. First-time users never see the skip.
- The R2 research says PMF-feel is 8–12s. 26s is already 2× the PMF-ideal. 30s pushes it to 2.5×. Don't.

### Why NOT 20s:
- You cannot fit 7 engines × (flight + thinking + result) into 20s without making each engine's beat too fast to read. At 1.8s per engine for Frames 5+6 (6 engines × 1.8s = 10.8s + 3s setup + 3s resolution = 16.8s) it technically works but each engine's result flashes too fast to register. The whole point is to show thoroughness.

### Interrupt rule per frame (answering Adam's question #8):
- Frames 1–2: User clicks X → stage slides down in 240ms, cancel all pending animations via Motion's imperative `stop()`.
- Frames 3–6: User clicks X → current engine's "done" state snaps immediately, ALL remaining engines snap to "skipped" gray, stage transitions to Frame 8 in 400ms.
- Frames 7–8: Not interruptible. These frames ARE the payoff — interrupting them removes the reward. The X button disables at Frame 7 start and re-enables after Frame 8 completes.

---

## 4. BEAMIE'S 5 STATES — EXACT SPECS

Every state below is a Rive state-machine node. Rive blends between nodes when the input `agentState` changes. Motion does NOT animate the character — Motion only animates the Rive container's position (drag, bob, point).

| State | Pulse period | Pulse scale Δ | Tint | Tint shift dur + easing | Face (Rive inputs) | Entry transition | Exit transition |
|---|---|---|---|---|---|---|---|
| **Idle** | **None** (see §6 argument) — or 3.2s if forced | 0 (or 2%) | `#D1D5DB` (silver-warm) | n/a | `eyes_open: 1.0`, `brow_wave: 0`, `expression: neutral` | Rive: instant if from `null`; 240ms blend if from another state | Rive blend, 240ms |
| **Thinking** (agent active) | **1.4s** | 2.6% | `#3370FF` at 40% mix | 320ms `[0.45, 0, 0.55, 1]` | `brow_wave: 1.0` (drives 1.8s sine, 4% Y amplitude, 180° out-of-phase) | Rive blend from idle: 320ms | Rive blend to idle: 480ms (longer — don't snap out of thinking) |
| **Succeeded** | One-shot bounce (200ms: scale 1 → 1.035 → 1) | 3.5% | Green flash `#10B981` to 50% mix, hold 600ms, decay to silver 240ms | Up: 180ms `[0.22, 1, 0.36, 1]`. Down: 240ms `[0.45, 0, 0.55, 1]` | `expression: satisfied` (mouth-less — eyebrows raise 3%, eyes squint 8%). Duration 840ms then back to neutral. | Rive blend: 180ms | Rive blend to idle: 400ms |
| **Blocked / needs input** | **2.0s gentle bob** toward Inbox icon (NOT a pulse — a translation) | Translation 4px Y | Amber `#F59E0B` at 30% mix | 420ms `[0.45, 0, 0.55, 1]` | `expression: inquisitive` (head tilt 6° via Rive rotation input), `eyes_open: 0.9` | Rive blend: 320ms | Rive blend: 320ms |
| **Error** | Face fracture: Rive `expression: fractured` (eyes separate 12% on X axis, eyebrows drop 8% on Y, all properties return to zero over 380ms). Fires ONCE. | Fracture motion, not pulse | Red flash `#EF4444` to 60% mix for 300ms then decay | Up: 120ms `ease-out`. Down: 360ms `[0.45, 0, 0.55, 1]` | `expression: fractured` for 380ms, then reforms to neutral over 320ms | Rive blend: 80ms (fast — error demands attention) | Rive blend to idle: 520ms (slow — reassurance) |

### Rive state-machine graph (informal):

```
        ┌─────────┐
        │  null   │
        └────┬────┘
             │ entry
             ▼
       ┌──────────┐  agentState='thinking'  ┌────────────┐
       │   idle   │◄────────────────────────│  thinking  │
       │          │────────────────────────▶│            │
       └────┬─────┘  agentState='idle'      └─────┬──────┘
            │                                     │
            │ agentState='blocked'                │ jobComplete=true
            │                                     ▼
       ┌────▼──────┐                       ┌──────────────┐
       │  blocked  │                       │  succeeded   │
       └───────────┘                       │ (one-shot)   │
                                           └──────┬───────┘
                                                  │ auto-return 840ms
                                                  ▼
                                               idle
                                                  ▲
                                                  │ auto-return after error reform
                                           ┌──────┴───────┐
                                           │    error     │
                                           │  (one-shot)  │
                                           └──────────────┘
```

**Transition rules:**
- All transitions respect an `interruptible: true` flag on the Rive state machine. If `agentState` changes mid-blend, Rive re-blends from current interpolated pose — does NOT finish the current transition first. This is non-negotiable (Rauno: interruptibility as requirement).
- Entry animations shorter than exits on ACTIVE states; longer on CALM states. Fast IN = attention; slow OUT = reassurance.

---

## 5. THE 5 SIGNATURE MOTIONS — EACH AUDITED

### Are they actually 5 distinct motions?

**My verdict: No. They collapse to 3 signatures + 2 variants.**

| v2 name | Actual distinct motion? | Verdict |
|---|---|---|
| 1. Scan Reveal | Yes — unique, 26s composite, irreplaceable | KEEP — the product's signature |
| 2. Agent Pulse | Yes — a living indicator primitive | KEEP — reusable across product |
| 3. Score Gauge Fill | Yes — count-up + arc-fill + color-interp | KEEP — the score is the hero |
| 4. Recommendation Cascade | **No — this is a standard staggered list reveal.** Not a Beamix signature; every well-designed React product has this. | DEMOTE to choreography rule (§6 in v2) |
| 5. Completion Settle | Partially — the scale 1→1.02→1 is distinct but 95% of the signature is the BORDER FLASH, which is a variant of Agent Pulse | MERGE into Agent Pulse as `AgentPulse.variant = "completion"` |

**Real Beamix signature motions: 3.**
1. **Scan Reveal** (the Stage)
2. **Agent Pulse** (with variants: active, completion)
3. **Score Gauge Fill**

v2's "5 signatures" dilutes the identity. 3 is sharper. Less is more.

### Detailed audits:

---

#### Signature 1: Scan Reveal

Already covered in §3. Key deltas from v2:
- Duration: 26s (not 30s).
- Frames: 9 (added Frame 0 and Frame 4a "thinking space"). Not 8.
- Rendering: Motion for UI/modal/pills/connector/packet; Rive for Beamie character states ONLY; CSS keyframes for pill pulse; SVG stroke draw-on for connectors and checkmarks.

**Interruption:** Per-frame above.
**Reduced-motion fallback:** 3-step text-based reveal, no animation. See §9.

---

#### Signature 2: Agent Pulse

v2: "a soft radial pulse emanates from the relevant agent avatar or Inbox item every 2 seconds… scale(1) → scale(1.6), opacity 0.4 → 0. Not a CSS spinner."

**Critique:** scale(1) → scale(1.6) is a 60% scale increase. On a 40px avatar that's a 24px ripple — very visible, potentially distracting on a page with 10 agents running in parallel. 2-second period is too slow to feel "alive"; it feels like a lazy heartbeat.

**Revised spec (v2-precise):**

```ts
// AgentPulse primitive
{
  variant: "active" | "completion" | "subtle",
  active: {
    period: 1600,          // ms
    scale: [1, 1.45, 1.45], // ring expands and holds the final frame briefly
    opacity: [0.36, 0, 0],
    ease: [0.22, 1, 0.36, 1],
    count: "infinite",
    pauseWhen: ["offscreen", "documentHidden"], // R2 research anti-pattern #7
  },
  completion: {
    // Replaces v2's Completion Settle entirely.
    // ONE pulse ring (not infinite), larger, with card scale micro-bounce underneath.
    ring: {
      scale: [1, 1.6, 1.6],
      opacity: [0.5, 0, 0],
      duration: 720,
      ease: [0.22, 1, 0.36, 1],
    },
    card: {
      scale: [1, 1.022, 1],
      duration: 240,
      ease: [0.22, 1, 0.36, 1],
    },
    borderFlash: {
      // NOT a color transition on border-color. That triggers paint.
      // Instead: an absolutely-positioned overlay div with border-color #3370FF, opacity animated.
      opacity: [0, 0.7, 0],
      duration: 420,
      ease: [0.45, 0, 0.55, 1],
    },
  },
  subtle: {
    // For "running" state in Crew schedule rows where 10 agents might show at once.
    // Dot-only, no ring. 2px glow.
    boxShadow: ["0 0 0 0 rgba(51,112,255,0.4)", "0 0 0 4px rgba(51,112,255,0)"],
    period: 2000,
    count: "infinite",
  }
}
```

Rendering: CSS keyframes for the ring (GPU-composited, no JS cost). Motion only for the card scale micro-bounce because it needs to fire once in response to a state change.

**Interruption:** Infinite loops cancel on unmount. If the component scrolls offscreen, use `IntersectionObserver` to pause the animation (Rauno's rule about offscreen loops).
**Reduced-motion:** Replace ring with a static 4px dot at `#3370FF`, no animation. Border flash on completion becomes an instant 2px border that fades over 600ms (opacity only — no scale).

---

#### Signature 3: Score Gauge Fill

v2: "Duration: 800ms. Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (enter curve). Color transitions through the semantic scale…"

**Critique:**
- 800ms is TOO FAST for the product's hero moment. The score is the one thing the user is waiting to see. Under-selling the big reveal.
- Color transitioning THROUGH gray→red→amber→green→cyan as the gauge fills creates a disorienting moment where a score of 85 momentarily displays in red (while passing through 0–24) before settling to cyan. This is technically clever and cognitively misleading.

**Revised spec:**
- Duration: 1400ms (not 800ms). Long enough to feel ceremonial.
- Ease: `[0.16, 1, 0.3, 1]` (correct curve — keep).
- Color approach: the gauge arc is NEUTRAL gray #9CA3AF throughout the fill. The color change happens ONCE at the end — over 280ms after the arc completes, the arc color interpolates from gray to the final semantic color (cyan/green/amber/red). This is the "reveal after completion" pattern. The user watches the NUMBER climb, then the COLOR resolves.
- Counter: tabular-num, counts 0 → final in 1400ms matched to arc. Counter uses same `[0.16, 1, 0.3, 1]` curve (important — a linear counter with eased arc feels decoupled).
- On score ≥ 80: add a 320ms white-flash on the ring background (opacity 0 → 0.4 → 0) as a micro-celebration. Not fireworks — a single flash.

**Rendering:** Motion (SVG `pathLength` for the arc, `animate` for counter via `useMotionValue` + `useTransform`). NOT Rive — this is a data visualization, not a character.

**Interruption:** User clicks away → stop the fill mid-animation, snap to final value with 200ms opacity fade-in. Do NOT restart or rewind.

**Reduced-motion:** Instant-display of final score + color. No fill. No count-up.

---

#### Recommendation Cascade (demoted to choreography rule)

v2: 40ms stagger, translateX(12px) → 0, opacity 0 → 1, 300ms with enter easing.

**Critique:** This is fine. It's ALSO a standard pattern — every Radix + Framer combo does this. Calling it a Beamix signature inflates the roster.

**Action:** Delete from "signature motions" list. Move to choreography section as the default list-reveal rule. Document once. Used everywhere. Not hero-marketed.

---

#### Completion Settle (merged into Agent Pulse variant)

v2: scale 1 → 1.02 → 1, 200ms, spring (stiffness 400, damping 15), border flash `#3370FF` 300ms.

**Critique:**
- Stiffness 400 / damping 15 = very stiff, minimal overshoot — good for UI feedback, but the 300ms border flash next to it is a different rhythm entirely. Two motions, two pacings, competing.
- The border flash on `border-color` triggers paint. Use an overlay div instead.

**Action:** Merged into `AgentPulse.variant = "completion"` in §2. Single coordinated choreography. See spec above.

---

## 6. STAGGER + CHOREOGRAPHY RULES

### Stagger per list size:

| List size | Stagger per item | Total stagger window | Max item enter duration | Total reveal time |
|---|---|---|---|---|
| 1 | — | 0ms | 300ms | 300ms |
| 2–3 | 60ms | 120ms | 300ms | 420ms |
| 4–5 | 40ms | 160ms | 280ms | 440ms |
| 6–10 | 30ms | 270ms | 260ms | 530ms |
| 11–20 | 20ms | 380ms | 240ms | 620ms |
| 21+ | 0ms (fade whole container) | 0ms | 280ms | 280ms |

**Rule:** Total reveal time ≤ 650ms regardless of list size. If you can't fit a list reveal in 650ms, fade the container instead — individual-item choreography becomes noise at high item counts. This matches Rauno's flocking metaphor: a flock of 500 fish doesn't look like 500 individuals, it looks like one organism. Same for dense UI lists.

Source: https://rauno.me/craft/depth — flocking motion as the source for staggered entry.

### When to stagger vs not:

| Context | Stagger? |
|---|---|
| New list items arriving (e.g., new Inbox items) | YES — stagger from most-recent at top |
| Initial page load for returning user | NO — content is already there (frequency-aware rule) |
| Initial page load for first-time user | YES — but ONCE per page per session |
| Filter applied → list re-renders | NO — fade the whole container (120ms out, 120ms in), content appears settled |
| Sort applied → list re-orders | YES — use Motion's `layout` prop, 320ms `[0.45, 0, 0.55, 1]` |
| User presses Enter/keyboard action | NO — 0ms, see Emil's keyboard rule |
| Score Gauge + KPI tiles on /home | SEQUENCE (not stagger): score first (1400ms), tiles after (staggered 40ms for 3 tiles). Score claims attention; tiles follow. |

### Choreography between DIFFERENT motion types on same screen:

**Rule:** At most ONE "hero" motion and TWO "supporting" motions on screen simultaneously. More than that = visual chaos.

Example (scan report first view):
- Hero: Score Gauge Fill (1400ms)
- Supporting 1: Recommendation Cascade (440ms, starts at t=800ms when score is ~90% filled)
- Supporting 2: Beamie "succeeded" one-shot (200ms at t=1600ms)
- Total scene: 2240ms
- NOT happening simultaneously: KPI strip entry (defer to t=1800ms with 0-delay fade), page-title fade-in (instant, part of initial render).

---

## 7. RIVE VS MOTION — THE CLEAN SPLIT

v2 says "Motion for UI, Rive for character." That's almost right but too simple. Let me classify every animated element from v2:

| Element | Rive | Motion | CSS | SVG/Canvas | v2 ambiguity |
|---|---|---|---|---|---|
| Beamie body breathe/pulse | ✅ | | | | Clear |
| Beamie face expressions (eyes, brows) | ✅ | | | | Clear |
| Beamie color tint shift | ✅ | | | | Clear |
| Beamie entrance (scale + fade in) | ✅ (part of `null → idle` transition) | | | | **AMBIGUOUS in v2** — v2 implies Motion. Rive is correct — the whole character blend belongs to the state machine. |
| Beamie drag position (user pointer) | | ✅ | | | Clear |
| Beamie "bob" toward Inbox icon | | ✅ (wraps Rive container) | | | **AMBIGUOUS in v2** — v2 doesn't specify. Motion for the translation; Rive's `expression` doesn't change during a bob. |
| Beamie "point" drift | | ✅ | | | Same as bob |
| Gaze halo on target element | | | ✅ (keyframes) | | **AMBIGUOUS** — v2 implies Motion. CSS is fine and cheaper. |
| Stage modal slide-up | | ✅ (Motion/Vaul) | | | Clear |
| Model pill brighten/dim | | | ✅ (opacity + transform) | | Could be Motion OR CSS. Use CSS for simple property transitions; Motion for complex state. |
| Model pill active border pulse | | | ✅ (keyframes) | | CSS is correct — indefinite loop. |
| Model pill "done" check draw-on | | ✅ (`pathLength` via SVG) | | ✅ | Motion + SVG. v2 did not spec. |
| Connector path draw-on | | ✅ (`pathLength`) | | ✅ | Motion + SVG. |
| **Data packet** (the diamond) | **This is the hard question.** | | | | v2 doesn't say. My answer: **Motion + SVG**. The packet is a reused 12px diamond SVG, animated via Motion's `motion.svg` with a path offset along the connector. Rive is overkill for a shape traveling along a path. BUT if the packet needs internal detail (glowing pulse, inner animation), Rive. Current spec is simple = Motion. |
| Data packet travel path | | ✅ | | ✅ | Motion animates `offsetDistance` along an SVG `offset-path`. |
| Score ring arc fill | | ✅ (pathLength) | | ✅ | Motion + SVG. Clear. |
| Score counter count-up | | ✅ (`useMotionValue` + `useTransform`) | | | Motion. Clear. |
| Score color transition | | ✅ (color interpolation) | | | Motion. Clear. |
| Recommendation card stagger | | ✅ | | | Motion. Clear. |
| Card border flash on completion | | | ✅ (overlay div, opacity) | | CSS is correct (cheaper). v2 ambiguity. |
| Agent Pulse ring | | | ✅ (keyframes with will-change) | | CSS is correct — loop. v2 said "spring-based" which implies Motion; CSS keyframes on scale+opacity is cheaper and indistinguishable in result. |
| Inbox item cascade entry | | ✅ | | | Motion. Clear. |
| Side panel step draw-on | | ✅ | | | Motion (per-step opacity/translate). |
| Mobile bottom sheet (Vaul) | | ✅ | | | Motion (Vaul is Emil's Motion-based lib). |

**Clean split principle:**
- **Rive = character interior** (body, face, tint, pose, expression). Nothing else.
- **Motion = UI layout choreography** (entering, exiting, re-ordering, position animation that responds to React state).
- **CSS keyframes = infinite loops + simple state-less transitions** (hover, active, focus, breathing pulses).
- **SVG `pathLength` = draw-on effects** (checkmarks, connectors, arc fills). Driven BY Motion.

**Rule:** Never animate the same property of the same element with two systems. If Rive owns Beamie's scale during the entrance, Motion must NOT also animate Beamie's scale at the same time. Pick one owner per property per element.

---

## 8. INTERRUPTIBILITY RULES

Rauno: "Animations must never force completion. Users should redirect mid-gesture at any point."
Source: https://rauno.me/craft/interaction-design

Per-animation rule set:

| Animation | User action during play | Behavior |
|---|---|---|
| **Stage modal open (Frame 1)** | Click X or Escape | Modal slides back down in 240ms. No state committed. |
| **Stage Frames 2–6** | Click X | Dialog: "Cancel scan? Partial results will be lost." Confirm → modal slides down in 240ms, backend scan is cancelled via abort controller. |
| **Stage Frame 7 (score materializes)** | Any click | **Non-interruptible.** X button disabled. User gets the reveal. |
| **Stage Frame 8 (transition)** | Any click | Fast-forward to Frame 8 end state in 200ms, skipping remaining transition. |
| **Score Gauge Fill on /home** | User scrolls or clicks anything | Snap to final value with opacity fade-in over 200ms. Do not resume. |
| **Recommendation Cascade** | User clicks a card mid-cascade | Clicked card snaps to opacity 1 + final position instantly; remaining cards continue cascading. |
| **Beamie idle breathe (if kept)** | — | Never interrupted by user action; paused when Beamie enters any active state. |
| **Beamie thinking pulse (1.4s)** | Agent completes | State transitions to `succeeded`; Rive blend replaces pulse in 400ms. |
| **Beamie point-and-halo** | User clicks target element | Beamie retreats to rest over 320ms. Halo dissolves over 200ms. |
| **Beamie point-and-halo** | User clicks elsewhere (not target, not Beamie) | After 3s of no target interaction: Beamie retreats. (This replaces v2's 10s rule; 3s is more respectful.) |
| **Agent Pulse (infinite loop)** | Component unmounts or scrolls offscreen | Paused via `IntersectionObserver`; no CPU cost when invisible. |
| **Completion Settle** | — | Non-interruptible — it's 720ms total; aborting looks like a bug. Don't even try. |
| **Page transition (modal, drawer)** | User triggers navigation before animation completes | Cancel current transition, start new transition from current interpolated position (Motion supports this natively via `layout` + `AnimatePresence`). |

**Global rule:** `prefers-reduced-motion` replaces ALL of the above with instant state changes. No interrupt behavior needed because there's nothing to interrupt.

**Implementation:** Use Motion's imperative `useAnimationControls()` + `stop()`. For CSS keyframes on loops, toggle `animation-play-state: paused` via `IntersectionObserver`. For Rive, the `@rive-app/react-canvas` runtime supports state-machine `fire(event)` to force transitions.

---

## 9. REDUCED-MOTION FALLBACKS

v2 says "prefers-reduced-motion is mandatory" but does not specify what each motion becomes. Here is the full table.

| Motion | Reduced-motion replacement |
|---|---|
| **Beamie idle breathe** | No animation. Static Rive frame at `idle` neutral pose. |
| **Beamie thinking pulse** | Tint shift stays (color change is informational, not decorative). No pulse, no brow wave. A static "thinking" frame in Rive. |
| **Beamie succeeded bounce** | No bounce. Instant tint flash (green, 600ms, opacity only). Then instant return. |
| **Beamie error fracture** | No fracture. Red tint flash (300ms, opacity only), then back to neutral. Accessibility says: error states should not cause rapid motion. |
| **Beamie point-and-halo** | Beamie stays in position. Target element gets a steady 2px `#3370FF` border (no pulse). Border persists until user clicks or 10s timeout. |
| **Stage Scan Reveal** | NOT instant cut. Replaced with a 3-step static reveal: (1) "Asking 7 AI engines…" with all 7 pills visible at 100% opacity (no dim-to-active transition — no motion); (2) as each engine completes, its pill shows the result inline with opacity-only 180ms transition (0 → 1); (3) final score displays inline with opacity-only fade (180ms). Total: same wall-clock as real scan (gated on API). Education preserved, spectacle removed. |
| **Score Gauge Fill** | No count-up, no arc fill. Full final score appears with opacity-only 180ms fade-in. Ring is pre-rendered at final color + full arc length. |
| **Recommendation Cascade** | All cards appear simultaneously via opacity-only fade (240ms). No stagger. |
| **Agent Pulse (infinite)** | Static 4px dot `#3370FF` on agent avatar. Dot pulses ONLY via color (solid blue → 60% opacity → solid blue) at a 3s period — this is the minimum-motion signal that something is active. Color-only animation is allowed in reduced-motion; transform-based animation is not. |
| **Completion Settle** | No bounce. Card border flashes blue via opacity (0 → 1 → 0) over 600ms. No scale. |
| **Stage modal slide-up** | Instant modal appearance via opacity (240ms). No slide. |
| **Drawer / Vaul** | Same — opacity only. Vaul provides this out-of-box if you set `disableVelocityAnimation` + use Motion's `shouldReduceMotion` hook. |

**Meta-rule for reduced-motion:** Opacity transitions (color, alpha) are permitted. Transform transitions (translate, scale, rotate) are NOT. Duration may still exist; magnitude of motion must not.
Source: WCAG 2.3.3 Animation from Interactions + https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html

---

## 10. THE BEAMIX MOTION SPEC (v2-precise, reference table)

This is what an engineer would build from. Every value deliberate.

### 10A. Easing curves (named)

| Name | Value | Use |
|---|---|---|
| `enter` | `cubic-bezier(0.22, 1, 0.36, 1)` | Elements arriving. Replaces v2's (0.16, 1, 0.3, 1) — slightly less extreme deceleration, more natural. |
| `exit` | `cubic-bezier(0.64, 0, 0.78, 0)` | Elements leaving. Replaces v2's (0.36, 0, 0.66, 0) — sharper finish, clears screen faster. |
| `shift` | `cubic-bezier(0.45, 0, 0.55, 1)` | On-screen reposition. KEEP v2. |
| `panel` | `cubic-bezier(0.32, 0.72, 0, 1)` | Drawers, sheets, modal slides. KEEP v2 — this is Vaul. |
| `snap` | `cubic-bezier(0.4, 0, 0.2, 1)` | Micro-interactions (hover, focus). Replaces v2's (0.25, 0.1, 0.25, 1) which is generic CSS `ease` — use Material's `standard` curve instead for better imperceptible snap. |

### 10B. Durations (named)

| Name | ms | Use |
|---|---|---|
| `instant` | 0 | Keyboard actions |
| `flick` | 120 | Active state, tap feedback |
| `quick` | 180 | Hover, focus, tooltip show |
| `brisk` | 240 | Tab switch, dropdown open |
| `smooth` | 320 | Tint shift, panel internal state |
| `panel-in` | 420 | Drawer/modal open |
| `panel-out` | 320 | Drawer/modal close (shorter than open — leave faster than you arrive) |
| `narrative-beat` | 600–900 | Stage frames, educational motion |
| `hero-reveal` | 1400 | Score Gauge Fill — the one long duration allowed |

### 10C. Complete component spec

| Component | Trigger | Properties | Duration | Ease | Render | Interrupt |
|---|---|---|---|---|---|---|
| `Button:hover` | mouse enter | `bg-color` | 180 | snap | CSS | instant |
| `Button:active` | mousedown | `scale 0.97` | 120 | snap | CSS | instant |
| `Tooltip (first)` | delay 250ms then show | `opacity 0→1, y 4→0` | 180 | enter | Motion | on blur: 120ms exit |
| `Tooltip (subsequent, same area)` | delay 0ms | `opacity 0→1` | 0 | — | CSS | instant |
| `Modal open` | state | `opacity 0→1, y 16→0` (backdrop opacity 0→0.4) | 420 | panel | Motion + CSS | on Escape: 320ms exit |
| `Drawer (mobile bottom sheet)` | state/drag | Vaul spring | — | panel | Motion/Vaul | drag-aware |
| `Dropdown` | state | `opacity 0→1, scale 0.96→1, origin=trigger` | 240 | enter | Radix + Motion | on blur: instant close |
| `Sidebar active state` | route change | `bg-color, text-color` | 180 | snap | CSS | n/a |
| `KPI tile hover` | mouse enter | `shadow-sm → shadow-md` | 240 | snap | CSS | instant |
| `Card cascade reveal (list)` | mount | `opacity 0→1, x 12→0`, stagger per §6 table | 280 | enter | Motion | user click → clicked card instant |
| `Agent Pulse — active` | `isActive=true` | ring: `scale 1→1.45, opacity 0.36→0` | 1600 loop | enter | CSS keyframes | pause when offscreen |
| `Agent Pulse — completion` | `onComplete` | ring + card bounce + border flash (composite) | 720 | enter | Motion + CSS | non-interruptible |
| `Score Gauge Fill` | first paint + score ready | `pathLength 0→1, counter 0→score` | 1400 | enter | Motion + SVG | click → snap to final |
| `Score color resolve` | after fill | `stroke-color gray→semantic` | 280 | shift | Motion | non-interruptible |
| `Beamie entrance (first load)` | mount | Rive state `null → idle` | 520 | spring(220, 18, 1) | Rive | non-interruptible |
| `Beamie idle` | `agentState=idle` | see §4 — argue NO motion | 3200 loop (if kept) | shift | Rive | pause in active state |
| `Beamie thinking` | `agentState=thinking` | tint + brow wave + pulse | 1400 pulse | shift | Rive | blend to next state 400ms |
| `Beamie succeeded` | `jobComplete` | bounce + green flash + satisfied face | 840 total | enter | Rive | non-interruptible |
| `Beamie bob (toward element)` | prop change | `x: 0→6→0` | 980 | enter + spring | Motion | abort → rest 180ms |
| `Beamie drag` | pointer drag | `x, y = pointer` | — (follow) | — | Motion | drag-aware |
| `Beamie drag release` | pointer up | snap to nearest safe position if edge | 400 | panel | Motion | n/a |
| `Stage Frame 1` | scan trigger | modal slide + pills fade + Beamie entrance | 1600 total | panel | Motion + Rive | X → 240ms dismiss |
| `Stage Frame 3` | next frame | Beamie flies to pill (800ms) | 800 | enter | Motion | abort allowed |
| `Stage Frame 4b packet` | engine complete | packet emerges + travels + Beamie emerges | 1600 total | enter | Motion + SVG + Rive | abort: vanish packet |
| `Stage Frame 7` | all engines complete | score ring arc + counter + color resolve | 3200 total | enter | Motion + SVG | non-interruptible |
| `Stage Frame 8` | score done | pills compact to summary + panel slide + Beamie bow + stage fade | 2200 | panel | Motion + Rive | any click → skip to end 200ms |
| `Inbox item new arrival` | realtime event | cascade from top, 40ms stagger, opacity+x | 280/item | enter | Motion | click card → snap |
| `Inbox item approve` | action | Completion Settle (Agent Pulse.completion) | 720 | enter | Motion + CSS | non-interruptible |
| `Recommendation first-priority pulse` | first render on /home | border opacity 0→0.6→0, 1 cycle | 1200 | shift | CSS | any click → stop |

### 10D. Tokens (CSS variables)

```css
:root {
  --ease-enter: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-exit: cubic-bezier(0.64, 0, 0.78, 0);
  --ease-shift: cubic-bezier(0.45, 0, 0.55, 1);
  --ease-panel: cubic-bezier(0.32, 0.72, 0, 1);
  --ease-snap: cubic-bezier(0.4, 0, 0.2, 1);

  --duration-instant: 0ms;
  --duration-flick: 120ms;
  --duration-quick: 180ms;
  --duration-brisk: 240ms;
  --duration-smooth: 320ms;
  --duration-panel-in: 420ms;
  --duration-panel-out: 320ms;
  --duration-beat: 720ms;
  --duration-hero: 1400ms;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-flick: 0ms;
    --duration-brisk: 180ms;      /* kept as short opacity */
    --duration-smooth: 180ms;
    --duration-panel-in: 180ms;
    --duration-panel-out: 120ms;
    --duration-beat: 0ms;
    --duration-hero: 180ms;
  }
}
```

---

## 11. CONCESSIONS — WHERE V2 IS ACTUALLY RIGHT

1. **The Stage metaphor as courier-carrying-site-to-models is correct.** This is not "a character walking through a site being crawled" (which would be semantically wrong — Beamix doesn't crawl, it queries models ABOUT the site). v2's metaphor switch is craft-correct. Keep.

2. **The bottom progress strip as a "quick read for impatient users."** Allowing impatient users to bail on the character performance and just watch the strip is brilliant. This is the inverse of hostile animation — it gives users the content without the show. Most 30-second onboarding animations don't.

3. **Gaze-not-glow rule.** The separation of "character routes attention, target IS the attention" is original and correct. Copilot's failure mode (trembling icon on every cell) is exactly what this prevents.

4. **Rive over Lottie for the character.** Non-negotiable correctness. v2 got this right.

5. **"Scale(0) is banned."** Correct. The 0.92 floor I propose is a refinement, not a rejection.

6. **"No auto-speech from Beamie."** This is the single most important anti-Clippy decision. The entire quality of the character hinges on this being absolute.

7. **Frequency-aware animation philosophy.** v2 names it and cites Rauno. The application is incomplete (see §6 below) but the principle is correctly invoked.

8. **Skeleton screens using `#3370FF` at 10% opacity.** Subtle branding of loading states. Correct — generic gray skeletons feel like default framework behavior.

---

## 12. THE SINGLE HARDEST QUESTION FOR ADAM

**Is Beamie motion-on-state-change ONLY, or does it also have idle motion?**

v2 says both: "Beamie lives in the bottom-right corner… Slow breathing animation: scale 1.0 → 1.03 → 1.0 at 4-second period." AND it cites Rauno's frequency-aware rule which says "Repeated animations lose novelty and feel slower even at identical durations."

These two positions are in direct contradiction.

Rauno's rule, applied literally, says a persistent companion visited daily should have **zero idle motion**. Motion should exist only when state changes. The argument for idle breathing is "it signals Beamie is alive." The argument against is "after day 3 the breathing becomes visual noise that the user learns to filter out — at which point it's doing nothing but burning GPU cycles."

**My position: kill the idle breathe. Beamie is motionless until something happens. State changes (agent starts, agent completes, new Inbox item arrives) get motion. Everything else is stillness.**

This is the hard call because:
- If you're right, Beamie feels calm and professional — like a senior colleague who sits still until you need them.
- If you're wrong, Beamie feels DEAD — like a dismissible UI element the user forgets about, which is worse than Clippy because Clippy was at least present.

The research doesn't answer this. ElevenLabs Orb breathes (always). Notion AI doesn't (static when idle). Granola doesn't (static indicator). Two-to-one against breathing, but the one — Orb — is the closest visual analogue.

**Decision required before Phase 3 begins: does Beamie breathe when idle, or is Beamie motionless until state changes? No half-measures, no "a little bit of both." Pick one and commit.**

The correct answer is probably "motionless" but I am not 100% confident — call it 70/30 against breathing. I would ship a motionless Beamie to 50% of users and a breathing Beamie to the other 50%, measure day-7 engagement with the companion, and pick the winner. That is the only way to resolve this without guessing.

---

## APPENDIX: QUICK REFERENCE — SOURCES CITED

**Motion authorities:**
- Rauno Freiberg — https://rauno.me, https://interfaces.rauno.me, https://rauno.me/craft/interaction-design, https://rauno.me/craft/depth, https://devouringdetails.com
- Emil Kowalski — https://emilkowal.ski/ui/7-practical-animation-tips, https://emilkowal.ski/ui/good-vs-great-animations, https://emilkowal.ski/ui/you-dont-need-animations, https://emilkowal.ski/ui/building-a-drawer-component, https://emilkowal.ski/ui/great-animations, https://animations.dev
- Paco Coursey — https://paco.me (philosophy referenced, specific posts limited)
- Linear / Karri Saarinen — https://linear.app/now/quality-wednesdays, https://linear.app/now/how-we-redesigned-the-linear-ui, https://www.figma.com/blog/karri-saarinens-10-rules-for-crafting-products-that-stand-out/

**Runtime + libs:**
- Motion — https://motion.dev
- Rive — https://rive.app, https://rive.app/blog/rive-as-a-lottie-alternative
- Vaul drawer — https://emilkowal.ski/ui/building-a-drawer-component

**Character / companion references:**
- Notion AI via BUCK — https://buck.co/work/notion-ai
- ElevenLabs Orb — https://ui.elevenlabs.io/docs/components/orb
- Clippy post-mortem — https://en.wikipedia.org/wiki/Office_Assistant, https://medium.com/twentybn/5-lessons-from-clippys-failure-efc69297eac1
- Microsoft Copilot anti-pattern — https://techcommunity.microsoft.com/discussions/microsoft365copilot/i-want-to-turn-off-or-hide-the-draft-with-copilot-dingbat-that-follows-my-cursor/4288889

**Accessibility:**
- WCAG Animation from Interactions — https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html

---

**End critique. Every number deliberate. Every handwave called. Your move.**
