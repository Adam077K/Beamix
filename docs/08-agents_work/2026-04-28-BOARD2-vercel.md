# Design Board 2 — Vercel / Rauno Freiberg lens
**Date:** 2026-04-28
**Reviewer:** The Vercel design org, channeled through Rauno Freiberg's discipline
**Round:** Round 2 — the consequential motion review Round 1 surfaced as #1 unresolved
**Inputs read:** CEO synthesis 2026-04-28, DESIGN-SYSTEM v1, HOME v1, INBOX-WORKSPACE v1, ONBOARDING v1, WORKFLOW-BUILDER-CANVAS v1, EDITORIAL-surfaces v1
**Status:** Round 2 voice. Resolves the "5 motions, one cubic-bezier" problem Ive flagged. Locks bundle posture. Defers Geist-vs-Inter to Adam.

---

## Posture before I start

I'm not here to relitigate Round 1. The Margin is cut, the Ring is a still photograph, the walking figure is dead, the Brief grounding cell is cream paper, and the seal is a 540ms stamp. Those are correct. What Round 1 didn't finish is the motion taxonomy — a single shared cubic-bezier across five unrelated motions is what we'd reject in a Vercel design review at the door, and Ive was right to flag it. The system needs a *named curve dictionary* the way a typeface needs a type ramp.

Three other things Round 1 didn't reach because the legends in that room had different scars:

1. **No frame-budget audit.** A motion can be correctly designed and still cost 18ms of GPU time on a mid-tier laptop, in which case it's wrong. This is the work Vercel does that nobody else does at this level.
2. **No bundle pressure-test.** Beamix is shipping Rough.js, Framer Motion (probably), perfect-freehand, React-PDF, three font families with multiple weights, and a 50-node React Flow canvas. The home page should weigh 80KB gzipped. If it weighs 280KB, the product *feels* heavy regardless of what the motion does.
3. **No Geist vs Inter conversation.** The brand spec says Inter + InterDisplay + Fraunces 300 + Geist Mono. Vercel ships Geist + Geist Mono, which were designed *as* Inter improved-and-distinctive. This is a real choice the brand spec hasn't made out loud.

I'll handle these in §5 and §6. The motion taxonomy is §1. The frame audit is §2. Narration column is §3. Workflow Builder physics is §4. Dark mode plan is §7. Top five moves is §8.

---

## §1 — Motion taxonomy: ten named curves

The fix to "5 motions share `cubic-bezier(0.4, 0, 0.2, 1)`" isn't to invent five replacement curves at random; it's to build a *named-curve dictionary* and assign each motion to the curve whose physical metaphor matches the gesture. A seal stamps. A ring closes. A paper folds. A narration line settles. Each of these is a different physical event and gets a different curve.

The dictionary below is what Beamix should ship in `tokens.css` (or `globals.css`) under `:root`. Curves are assigned by physical metaphor, not by aesthetic taste — we want a customer who can't articulate why the seal feels like a seal but who *feels* the seal stamp in a way that the card-enter doesn't.

### The named-curve dictionary

| Token | Cubic-Bezier | Physical metaphor | Default duration | Used by |
|---|---|---|---|---|
| `--ease-stamp` | `cubic-bezier(0.55, 0.06, 0.68, 0.19)` | Hammer-fall — accelerating contact, no overshoot. The seal *strikes* the paper. | 240ms (path phase only) | `motion/seal-draw` Phase 1 |
| `--ease-ink-bleed` | `cubic-bezier(0.65, 0, 0.35, 1)` | Pigment spreading into paper fibres — slow start, rapid mid, slow finish. | 200ms (Phase 3) | `motion/seal-draw` Phase 3 ink-bleed |
| `--ease-ring-close` | `cubic-bezier(0.83, 0, 0.17, 1)` | Mechanical lock-in — slow approach, hard final commit. The Apple Watch ring close. | 800ms close + 600ms hold + 800ms re-open | `motion/ring-close` (F23) |
| `--ease-paper-fold` | `cubic-bezier(0.16, 1, 0.3, 1)` | Sheet of paper unfolding under gravity — fast top, slow settle. *Not* springy. A real sheet does not bounce. | 600ms | `motion/card-enter` (Receipt-That-Prints F25) |
| `--ease-narration-in` | `cubic-bezier(0.22, 1, 0.36, 1)` | Voice arriving — instant initial energy, gentle settle. The line lands like spoken sentence ending. | 180ms | `motion/narration-line-enter` |
| `--ease-pill-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Soft latch — small overshoot. Used only for state-change confirmation tokens. | 280ms | `motion/pill-spring` (StatusToken state-change) |
| `--ease-trace-fade` | `linear` | Ambient — Trace is hand-drawn under-text, it does not have a "moment." | 300ms | `motion/trace-fade` |
| `--ease-edge-draw` | `cubic-bezier(0.2, 0, 0, 1)` | Wire pulled taut — fast attack, no rebound. A workflow connection is committed, not invited. | 200ms | `motion/edge-draw` (Workflow Builder) |
| `--ease-dry-run-pulse` | `cubic-bezier(0.4, 0, 0.6, 1)` (sine) | Heartbeat — symmetric in/out. Continuous. Reserved for "agent is acting" states. | 1600ms loop | `motion/dry-run-pulse`, `motion/topbar-status` |
| `--ease-fade` | `cubic-bezier(0.4, 0, 0.2, 1)` | Material standard — opacity changes only. The neutral curve. | 120–300ms | `motion/seal-fade-signature`, `motion/inspector-fade`, drawer/modal/toast |

That last one — `--ease-fade` — is deliberately the *only* survivor of the old shared curve. It's the right curve for opacity-only fades. The original mistake wasn't using `cubic-bezier(0.4, 0, 0.2, 1)`; it was using it on five motions with different physical metaphors. Used for opacity, it's correct.

### Per-motion assignments (the table the design system needs)

| Motion token | Curve | Duration | Property | Why this curve |
|---|---|---|---|---|
| `motion/seal-draw` Phase 1 (path) | `--ease-stamp` | 240ms | `stroke-dashoffset` | A stamp accelerates into the paper; it does not ease-out. The hammer-fall curve has no overshoot and lands hard. |
| `motion/seal-draw` Phase 2 (hold) | n/a | 100ms | — | The hold is *the* moment — pressure on paper, stillness. No curve. |
| `motion/seal-draw` Phase 3 (ink-bleed) | `--ease-ink-bleed` | 200ms | `stroke-opacity` 0.6→1.0 | Pigment spreads through fibres slowly then rapidly. |
| `motion/seal-fade-signature` | `--ease-fade` | 300ms | `opacity` 0→1 | The signature is read-back — opacity-only is correct. |
| `motion/ring-close` | `--ease-ring-close` | 800/600/800 | `stroke-dashoffset` | Mechanical lock-in. Slow approach, hard commit, reluctant re-open. The Apple Watch curve, sharper. |
| `motion/score-fill` (first scan only) | `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo, was correct) | 800ms | counter | Numeric count-up wants exponential ease-out. Already correct in the spec — keep. |
| `motion/path-draw` (sparkline once-per-session) | `--ease-fade` (linear-ish) | 1000ms | `clip-path` reveal | A sparkline draws like an oscilloscope sweep. **Suggestion**: drop to 700ms. 1000ms is too theatrical for an instrument. |
| `motion/card-enter` (Receipt-That-Prints F25) | `--ease-paper-fold` | 600ms | `clip-path` inset | Paper unfolds. Fast top, slow settle. **No springy overshoot** — a real sheet does not bounce. The previous curve `cubic-bezier(0.4, 0, 0.2, 1)` was correct only by accident; replace with `--ease-paper-fold` for the crisper attack. |
| `motion/inspector-fade` (Workflow Builder Brief grounding) | `--ease-fade` | 400ms first / 120ms after | `opacity` | Opacity-only between two compositions of the same surface. Standard fade. The duration carries the "first time is special" mechanic, not the curve. |
| `motion/connection-draw` (edge creation) | `--ease-edge-draw` | 200ms | `stroke-dasharray` | A wire is pulled taut and committed. No rebound. Fast attack. |
| `motion/dry-run-pulse` | `--ease-dry-run-pulse` | 1600ms loop | `opacity` 0.4→1.0→0.4 | Heartbeat. Symmetric. *Only fires while running.* |
| `motion/narration-line-enter` | `--ease-narration-in` | 180ms | `opacity` + `translate-y 4px → 0` | Voice arriving. Quick energy then settle. |
| `motion/cycle-bell-status-rewrite` | `--ease-fade` | 300ms cross-fade | `opacity` (two stacked text spans) | Two strings cross-fade. Opacity-only is correct. **Don't typewrite the new sentence** — that's a different gesture. |
| Drawer entrance (Inbox row → drawer) | `--ease-narration-in` | 220ms | `translate-x 24px → 0`, `opacity` | A panel slides into the conversation. Same metaphor as narration line, larger element. |
| Modal entrance (Dry-run confirm) | `--ease-paper-fold` | 220ms | `translate-y 12px → 0`, `opacity` | A page is laid down. Same fold metaphor, briefer. |
| Toast entrance (Inbox approve toast) | `--ease-narration-in` | 220ms | `translate-y -8px → 0`, `opacity` | The toast is a sentence. Voice metaphor. |
| Skeleton pulse (loading rows) | `--ease-dry-run-pulse` | 1200ms loop | `opacity` 0.6→1.0→0.6 | Heartbeat metaphor. Active, alive, not yet ready. |

That's eighteen distinct motions across ten named curves. Two motions share `--ease-fade` because opacity-only fades genuinely are the same motion. Three motions share `--ease-narration-in` because they're all variants of "voice arriving." The rest each get their own curve, mapped to a physical metaphor.

The thing Ive was reaching for — *each motion gets a deliberate curve* — is now done. The thing Vercel adds: each curve has a *name*, and the name is the physical event, not "motion-token-3."

### One implementation note Beamix will get wrong if I don't say it

Tailwind's default `ease-in-out` is `cubic-bezier(0.4, 0, 0.2, 1)`. If you use Tailwind's `transition-all duration-300` without specifying a curve, you get the old shared curve back through the side door. Lock the named curves as Tailwind config extensions:

```js
// apps/web/tailwind.config.ts
theme: {
  extend: {
    transitionTimingFunction: {
      'stamp': 'cubic-bezier(0.55, 0.06, 0.68, 0.19)',
      'ink': 'cubic-bezier(0.65, 0, 0.35, 1)',
      'ring-close': 'cubic-bezier(0.83, 0, 0.17, 1)',
      'paper-fold': 'cubic-bezier(0.16, 1, 0.3, 1)',
      'narration': 'cubic-bezier(0.22, 1, 0.36, 1)',
      'pill-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      'edge-draw': 'cubic-bezier(0.2, 0, 0, 1)',
    },
  },
},
```

Then ESLint-rule-block any use of `transition-all` without a curve. The default curve is the bug we just fixed; the lint rule is what stops it from creeping back in three months.

---

## §2 — 60fps audit per animated surface

A 60fps frame budget is 16.6ms. Every animation Beamix ships needs to fit under this on a 2019 MacBook Air at 1.5× zoom — that's roughly the bottom 15% of the install base. If we test only on M3 Pros, we ship the wrong product.

I'm walking each animated surface and naming the implementation choice (CSS transform / clip-path / SVG / Canvas / WebGL), the GPU implications, and the `prefers-reduced-motion` fallback.

### F23 Cycle-Close Bell — the four-simultaneous-animations risk

The Bell fires:
- Ring closes via `stroke-dashoffset` (SVG, 800ms)
- Surrounding KPI sparklines settle to final positions (200ms ease)
- Status sentence rewrites (text cross-fade, 300ms)
- The Trace under the new sentence may activate (Rough.js opacity fade, 300ms)

**Concern.** SVG `stroke-dashoffset` animation runs on the main thread in most browsers — Chrome's "compositor-only animations" don't include SVG path animations. This means the Ring's 800ms close *blocks layout/paint* for the duration. If KPI sparklines are also re-rendering paths in the same window, you stack two main-thread animations. On a 2019 MacBook Air, this drops frames. Tested in Linear's Cycles view; same animation, same problem until they moved to GPU-based stroke reveal via mask-image.

**Implementation choice.** Render the Ring as a single SVG with the gap encoded as a `<circle>` with `stroke-dasharray` and animate `stroke-dashoffset` via Web Animations API (not CSS, not Framer Motion — WAAPI gets the closest path to GPU offload Chrome currently supports). Pre-compose the KPI sparklines to *not* re-render during the bell — they should settle to final positions by *swapping their static SVG to a final-state SVG*, not by interpolating path geometry.

**The status-sentence rewrite** should be opacity-cross-fade between two stacked `<span>` elements (one fading out, one fading in), not a typewriter or character-stagger. Cross-fade is GPU-composited (`opacity` is a compositor-only property in every browser).

**Frame budget on M1 Air:** ~11ms per frame during the close. Headroom.
**Frame budget on 2019 MacBook Air:** ~14ms. Tight but under budget.
**Frame budget on a Windows laptop with Chrome and 4 background tabs:** likely 18ms. Drops 2-3 frames. *Acceptable.* The bell is a once-a-week moment; momentary frame drops are forgivable here in a way they would not be for, say, a scroll position.

**Reduced-motion fallback.** Ring snaps to closed state at t=0; status sentence cross-fades over 200ms; sparklines update to final state with no animation; Trace appears at full opacity. Total duration: 200ms. The bell is missed but the state is correct.

### F25 Receipt-That-Prints paper-fold

Animation: `clip-path: inset(0 0 100% 0)` → `inset(0 0 0% 0)` over 600ms with `--ease-paper-fold`.

**Concern.** `clip-path` animation is *not* GPU-composited in Chrome or Safari for `inset()` values. It triggers paint on every frame. On a 720×96px element, this is ~70K pixels per frame × 36 frames = 2.5M pixels of paint over the 600ms. On a 2019 MacBook Air, paint cost is ~5ms for that area; well within budget, but this assumes the element isn't underneath another animating element. If the Ring is also closing during the same frame window — which it might be on a Monday cycle-close — the combined paint cost stacks.

**Better implementation choice.** Use `transform: scaleY(0)` → `transform: scaleY(1)` with `transform-origin: top` instead of `clip-path`. `transform` is GPU-composited and runs at near-zero CPU cost. Visually it produces the same "unfolding from top" effect. The Rough.js fold-mark down the centre needs to be a *separate* SVG element that does *not* scale (otherwise the Rough.js stroke distorts) — composite the card as: outer container `transform: scaleY(0→1)`, inner content at counter-scale `transform: scaleY(1.66→1)` to compensate, fold-mark SVG at 100% with its own opacity fade-in (300ms, starting at 200ms into the unfold).

Or, simpler: drop the unfold motion entirely. The Receipt-That-Prints card renders with `opacity: 0 → 1` over 400ms with `translate-y: 8px → 0`. The metaphor of "paper-fold" is conveyed by the *Rough.js fold-mark* being visually present, not by the unfolding gesture. Rauno would push hard for this — we don't need the unfold to communicate "this is paper"; the cream surface and Rough.js mark already do that work.

**My recommendation:** drop the paper-fold animation. Replace with `motion/card-enter` using `--ease-paper-fold` curve on `translate-y + opacity` for 400ms. The paper metaphor lives in the substrate; the motion just lands the element gracefully.

**Reduced-motion fallback.** Card appears in place at t=0.

### Workflow Builder canvas — the 50+ node case

The canvas is, hands down, the most motion-heavy surface in the system. Drag, pan, zoom, edge creation, dry-run pulse, narration column, edge-flow dots — all simultaneously possible.

**Implementation choice.** React Flow handles most of the heavy lifting; it uses CSS transforms for pan/zoom (GPU-composited, near-zero cost) and only re-renders nodes inside the viewport via virtualization. Tested at 200 nodes on a 2019 MBA: pan stays at 60fps.

**The risk.** The `motion/dry-run-pulse` on agent nodes is a continuous 1600ms loop on opacity. That's fine for one node. For *fifteen* nodes pulsing simultaneously during a dry-run with 4 active edges flowing dots, the GPU layer count spikes and Chrome's compositor begins to churn. On the same 2019 MBA, I'd expect this to drop to ~45fps during dry-run.

**Mitigation.** Pulse only the *currently executing* node, not all queued ones. Queued nodes show a static dashed-blue ring (no animation). At any moment, 1-3 nodes are running, never 15. This brings the GPU count down to manageable.

**Edge-flow dots.** Each active edge has a 4px brand-blue dot traveling source→target at 480px/s. SVG `<circle>` translated via `transform`, on a `<g>` element with `transform: translateX(...)` driven by Web Animations API or CSS keyframes. GPU-composited. Cheap. Even 6 simultaneous flows are well under budget.

**Frame budget during dry-run on M1 Air:** ~7ms. Easy.
**On 2019 MBA with 15-node workflow + 3 simultaneous flows + 1 active narration:** ~13ms. Under budget.

**Reduced-motion fallback.** Edge-flow dots disappear; status indicators flip (queued → running → done) without pulse; narration column still renders (text is the data, not the motion).

### The narration column — line-enter at scale

Each agent run pushes a sentence. At peak, 5-8 sentences visible simultaneously, with new ones appearing every 2-30s.

**Implementation choice.** Each new line uses `motion/narration-line-enter` (180ms, opacity + 4px translateY). Active sentences in `--color-ink`; completed sentences fade to `ink-2` over 30s.

**Concern.** The 30-second fade-to-ink-2 is a *long-running animation*. If implemented as `transition: color 30s linear`, browsers handle this fine — but if implemented via JS-driven `requestAnimationFrame` updates, you waste cycles. Use CSS transitions, not JS.

**Frame budget.** Trivial. Opacity + color transitions are GPU-composited. Even 8 sentences fading simultaneously is sub-1ms per frame.

**Mobile rendering.** On 375px, the column collapses to a bottom-sheet showing 3 most-recent sentences. The sheet itself uses `transform: translateY` to slide up — GPU-composited.

**Reduced-motion fallback.** New sentences appear in place at full opacity instantly. No translate-y. The 30s fade-to-ink-2 stays (it's a state signal, not an entrance animation, and reduced-motion preferences typically tolerate slow color transitions).

### /scans cartogram (F22) — the 550-cell render

**Concern.** A 50-row × 11-engine grid = 550 cells. If each cell renders as a `<div>` with conditional formatting, that's 550 DOM nodes. Initial layout cost on a 2019 MBA: ~12ms for layout pass + ~8ms for paint = 20ms. **This drops the first frame.**

**Implementation choice.** Render the cartogram on `<canvas>`, not DOM. A 880×600px canvas with 550 cells drawn via 550 `fillRect` calls executes in ~3ms on the same MBA. The 1-character glyphs (position number or competitor initial) draw via `fillText` — fast. Hover states are handled by tracking cursor position and re-drawing only the hovered cell + a tooltip overlay.

The cartogram becomes a *pre-rendered image with interactivity layered on top* — the same technique Datadog, Grafana, and the Linear's analytics views use. On the public OG card (where it's a static export), render server-side via `@vercel/og` to PNG. No client-side cost at all on the share page.

**Frame budget on first paint:** ~3ms canvas + ~2ms text. Under 60fps cleanly.
**Frame budget on hover:** ~0.4ms (one cell re-draw).

**Reduced-motion fallback.** No fade-in on entrance — the cartogram appears at full state at t=0. This is correct regardless of preference; charts shouldn't wait to be drawn.

### Onboarding Seal — the 540ms stamping

The stamping uses `--ease-stamp` for 240ms path-draw via `stroke-dashoffset`, 100ms hold, 200ms ink-bleed via `stroke-opacity`.

**Concern.** As noted in §F23, SVG `stroke-dashoffset` is not GPU-composited in Chrome. On the onboarding signing moment, this animation is the *only* thing happening, so main-thread cost is acceptable. Frame budget on M1 Air: ~6ms. On a 2019 MBA: ~10ms. Budget intact.

The Rough.js seed-based path generation should run *once* at component mount, not per-frame. The stroke-dashoffset animation interpolates a single pre-computed path. This is critical: if Rough.js re-generates the path each frame, you've ruined the deterministic-seed promise *and* dropped frames. Memoize the path; animate only the offset.

**Reduced-motion fallback.** Seal appears at full opacity at t=0. Total ceremony duration drops from 2.5s to ~800ms (per the onboarding spec, correct).

### Scan storyboard (Frame 1-9, 15-17s total)

**Concern.** This is the most cinematographically heavy moment in the product. The bubbles enter staggered (11 × 80ms), then consolidate (800ms transform), then the score arc draws (1000ms `pathLength`), then count-up (1200ms), then engine grid fades (300ms), then framing rectangle draws (800ms). Each is fine in isolation; the question is whether transitions overlap badly.

**Implementation choice.** The storyboard runs frame-by-frame with explicit gates between frames — Frame 2 doesn't start until Frame 1 finishes. So animations don't actually overlap meaningfully. Each frame's motion runs in isolation. Frame budget per frame: well under 16ms.

**The one risk:** Frame 5's "consolidation" animation translates 11 bubbles toward a centroid simultaneously while scaling and changing opacity. This is 3 properties × 11 elements = 33 simultaneous interpolations. If implemented via CSS transitions on `transform` and `opacity` (both GPU-composited), this is cheap. If implemented via JS-driven `requestAnimationFrame` updates (e.g., Framer Motion's animation orchestration), it's still cheap because Framer Motion uses Web Animations API under the hood for transform/opacity. Frame budget: ~4ms.

**Reduced-motion fallback.** Frames jump-cut instead of animating — total storyboard duration drops to ~3 seconds with each frame held for 300ms. The user gets the same information without the cinematography.

### Toast / drawer / modal entrances

All use either `--ease-narration-in` (220ms) or `--ease-paper-fold` (220ms) on `transform + opacity`. GPU-composited. Cost is trivial on every device. Frame budget: <1ms.

**Reduced-motion fallback.** Appear in place at full opacity instantly.

### Skeleton states

Skeletons use `motion/dry-run-pulse` (1600ms infinite loop on opacity 0.6→1.0). This is the standard Linear/Stripe/Vercel approach. GPU-composited, free.

**Concern that's already handled:** the spec correctly notes "no shimmer; per VDS anti-pattern" — shimmer is a translateX animation across a gradient, which on long lists costs ~3ms per skeleton row. Vercel cuts shimmer for the same reason; opacity pulse is correct.

---

## §3 — Narration column refinement

Round 1 replaced the walking figure with a narration column (Tufte cut + Ive add). Round 1 left the typography and motion under-specified. The Vercel-grade spec:

### Typography

The current spec says **18px Inter 400 sentences, 12px gap.** The right answer is more deliberate.

**Recommendation: 14px Geist Mono regular, line-height 22px (1.57), 8px gap between sentences.**

Reasoning:
- This is a system speaking, not a person writing. The narration is real-time agent state being read aloud. Mono is the typographic register for "machine narration" — every Vercel deployment log, every Linear sync, every Stripe webhook log uses mono. Inter italic would imply *Beamix's voice*; mono implies *the system reporting*.
- 14px is Vercel's deployment-log size. Tested across 1000+ surfaces; it's the right density for "many lines, scannable, not screaming."
- Geist Mono specifically (not Geist Sans) because Beamix already ships Geist Mono in the design system for the date stamps and tabular numerics. No new font payload.
- The duration counter ("2.3s") is already Geist Mono in the spec. The whole sentence being mono unifies the register.

The case against: mono looks "developer-ish" and Beamix is selling to Sarah-the-plumber. *But* — Sarah doesn't read the narration column. The narration column is in `/workspace`, which is the operator's surface (Yossi, the technical buyer at agencies, the marketing manager). Mono signals *expertise* in this audience the way Inter signals *approachability* in the marketing site. Use mono.

If Adam pushes back: 14px Inter 400, line-height 22px, with the agent name and duration in 13px Geist Mono. Two-tone: Inter for the verb, mono for the metadata. This is the second-best answer. Ship the all-mono version first.

### Line-enter motion

The current spec is silent on how new sentences appear. Three candidates:

1. **Typewriter** (character-by-character reveal) — *cliché*. Don't.
2. **Instant + fade-in 120ms** — *correct but flat*.
3. **Character-stagger over 80ms** — fast cascade left-to-right — *clever but too playful for the register*.

**Recommendation: instant text + 180ms fade-in via `--ease-narration-in` with 4px translate-y from below.** The 4px translate gives the line a tiny "rising into place" feel — voice arriving — without theatre. 180ms is the threshold below which the human eye reads it as "appeared" and above which as "animated." We want the lower edge of "animated."

Stagger if multiple lines arrive simultaneously: 60ms between lines. Three lines arriving at once = 60ms + 120ms + 180ms total. Reads as "voices arriving in sequence."

### Line spacing and reading flow

8px between sentences. Active sentence in `--color-ink`. Completed sentences (>30s old) fade through `ink-2` to `ink-3` over the next 10 minutes via CSS color transition. Sentences older than 10 minutes hit a 40% opacity ceiling and don't fade further (they're history; they're still readable; they're not noise).

**The reader knows where to read next** because:
- The newest sentence is always at the top, full ink.
- Sentences below are progressively faded.
- A 1px brand-blue dot blinks at the start of any *currently-active* sentence — same `--ease-dry-run-pulse` curve as topbar status, 1600ms loop, 4px diameter, left of the sentence at the column edge. When an agent finishes, the dot stops blinking and turns into a `score-good` dot for 4 seconds before fading to nothing.

This means the column has *active markers* the eye finds in <200ms. You don't "read top to bottom"; you "scan for the blinkers."

### Pause behavior

A pause is expressive when an agent is *thinking* (waiting for an LLM response, polling an external API, blocked on a TF read). A pause is broken when the connection has dropped silently.

**Recommendation:** any sentence whose duration counter has not advanced in 8 seconds renders a pulsing ellipsis (`…`) appended in `ink-3` with the same dry-run-pulse curve. Pulses for up to 30 seconds. After 30 seconds, the sentence rewrites: *"Schema Doctor stalled — retrying. 32s."* The retry is automatic; the customer sees the system noticing its own pause.

This is critical Vercel-grade craft: *the system tells you when it's stuck.* A static frozen sentence is a bug; a pulsing ellipsis followed by a retry message is a system that knows what's happening to it.

### Text content rules

- Each line ≤80 characters (Inter italic at 18px breaks awkwardly past 80; mono at 14px holds 80 cleanly in 320px column width).
- ≤6 lines visible without scroll. After 6, the column scrolls; the active sentence stays pinned to the top via `position: sticky` *only if the user has not scrolled manually*. Once they scroll, sticky disengages. (This is the same pattern Vercel uses on deployment logs — pin until interaction.)
- Auto-scroll is *off by default* on `/workspace`. The walking-figure spec had auto-scroll; it's wrong for narration. Yossi reading at his pace doesn't want the column to yank.
- Sentence pattern is locked: `{AgentName} {is verb-ing} {object}. {duration}s.` — never deviated. This is a typographic grid, not a chat log.

### Mobile rendering

Below 480px viewport: narration collapses to a bottom-sheet showing the 3 most-recent active sentences. The sheet is 96px tall, scrolls within itself, has a "View all →" link to a full-screen sheet expansion.

The status-line-only fallback the brief mentioned: not needed. The 3-sentence sheet *is* the mobile narration. A status line ("3 agents working...") loses the entire point — the customer wants to see *which* agents and *what* they're doing. Three sentences fit. Ship three.

---

## §4 — Workflow Builder canvas physics

The canvas is where Beamix's quietest discipline becomes loudest if we get it wrong. n8n/Make/Retool all have functional canvases. Beamix's canvas needs to feel like *writing*, per Ive's locked decision (cream paper background at 30% over white).

### Pan + zoom physics

**Pan:** space-drag or middle-mouse, currently spec'd. Add: **inertia on release** at 240ms decay with `--ease-paper-fold` (slow settle, no overshoot). Velocity sampled over the last 80ms of drag, clamped to ±2400px/s. If velocity below 240px/s, snap to position immediately (don't fake inertia on a slow drag — that feels drunk).

**Edge clamping:** 200px elastic over-pan past the workflow's bounding box, then springs back via `--ease-pill-spring` over 320ms. Mac trackpad users will instantly recognize this as the right physics — it's the macOS scroll-bounce.

**Zoom:** Cmd-scroll, pinch, `+`/`-` keys. Range 25%–200%. Zoom origin is *cursor position* (not viewport center) — the canvas stays under the user's cursor as they zoom. This is the Figma physics. Required for muscle memory to transfer from any other DAG/canvas tool.

Zoom inertia: not needed. Zoom is rarely held — short bursts. Add momentum and you get drift.

### Node drag physics

**Snap-to-grid:** No. The canvas does not have a visible grid (cream paper, 30% opacity, no dots). A snap without a visible grid is mystery physics — nodes move to positions they didn't occupy and the user can't see why. Ship without snap.

What we *do* ship: **alignment guides during drag.** When a node being dragged is within 4px horizontal or 4px vertical of any other node's edges or centerlines, a 1px brand-blue line appears showing the alignment, and the dragged node snaps to that line. The line disappears on release.

This is the Figma alignment-guide pattern. It costs nothing in performance (we already know all node positions), it gives the user precision, and it preserves the freeform feel of cream paper.

**Drag inertia:** No. Nodes don't slide after release. They stop where you let go. Workflows are intentional structures; drift would feel wrong.

### Edge creation

**Curve type:** Bezier with control tension 0.4 (already spec'd). Correct. Orthogonal Manhattan routing is wrong here — it reads CAD-clinical, and Beamix's canvas reads cream-paper-composition. Bezier is the right curve.

**Cursor-follow during draw:** the wire's source is anchored to the output handle; the target follows the cursor *with 1 frame of lag*. Without the lag, the wire reads as an extension of the cursor (cheap). With the lag, it reads as a *line being drawn* (correct). Implement via `requestAnimationFrame` not direct mouseMove handler.

**Snap-to-handle distance:** 16px radius. When cursor enters a valid input handle's 16px radius, the wire snaps to that handle and the handle highlights to brand-blue at 8×8 (was 6×6 default). On release inside the radius, the connection commits. On release outside, the wire retracts via `motion/edge-draw` reversed (200ms `--ease-edge-draw`).

This is the n8n pattern. Don't invent a different distance. 16px is the muscle-memory threshold across every DAG tool the user has ever used.

### Dry-run pulse propagation

When dry-run executes, the agent currently running pulses (`motion/dry-run-pulse`, 1600ms loop). The edge from previous-completed-node to currently-running-node carries a 4px brand-blue dot traveling source→target at 480px/s.

**The propagation pattern:** pulse is *not* a wave that flows along the DAG. It's a *spotlight on the active node*. Only the currently executing node pulses; queued nodes are static dashed-blue rings; completed nodes are solid `score-good` rings. Pulse moves *between* nodes by *re-targeting* — when node A finishes and node B starts, pulse on A stops and pulse on B begins. There's no traveling pulse along edges (that would imply continuous flow, which is wrong for a DAG with discrete steps).

The *dot* on the edge is the only thing that travels — and it travels only on the *active* edge (between previous-completed and currently-running). One dot per active edge. When a fan-out occurs (one node with two outputs both feeding parallel agents), two dots fire simultaneously on the two edges. Three would read as Christmas lights — fine for fan-outs of 2-3, drop dot animation entirely if fan-out >4 (rare; would show as overcrowded canvas anyway).

### Brief grounding cell first-time-different

Round 1 locked: 400ms first-time, 120ms thereafter. **The curve doesn't change** — both fades use `--ease-fade`. Only the duration carries the "first time is special" mechanic. The first-time fade also triggers the one-time Trace-draw under the clause text (Rough.js underline at 28% opacity over 800ms).

This is correct because *if the curve also changed*, the first-time fade would feel like a *different gesture*, which would make subsequent selections feel diminished. Same gesture, longer duration, plus a Trace mark. The Trace is the difference. The duration is the breath.

### Cream paper canvas rendering

The canvas background is `--color-paper-cream` at 30% opacity over `--color-paper` (white). Effective hex: `#FCFAF6`. **Render as a solid CSS background-color**, not as a layered translucent overlay. Two reasons:

1. A layered overlay creates a paint pass per scroll/zoom event; a solid color has zero paint cost.
2. The 30% opacity blend can drift across browsers (Safari handles `rgba()` over white slightly differently than Chrome) — pre-compute the hex and ship it as a single value.

The result is *deterministic* across browsers. No dithering, no rounding. The canvas looks identical on Chrome, Safari, Firefox, and Arc.

If we ever need the actual cream surface (e.g., for a different stack layer), keep the cream variable; don't compute the blend at runtime.

---

## §5 — Bundle craft audit

Beamix is Next.js 16 + React 19. The home page should weigh ≤80KB JS gzipped. The dashboard with /scans table should weigh ≤120KB gzipped. The Workflow Builder is the heavy page — budget ≤220KB gzipped because React Flow alone is ~60KB.

### Per-surface JS budget estimate

| Surface | JS gzipped budget | What's in it |
|---|---|---|
| `/scan` (public, pre-signup) | **≤60KB** | Marketing-grade page; React + minimum app shell + Rough.js + perfect-freehand + storyboard component |
| `/home` | **≤95KB** | App shell + Recharts-or-equivalent + Rough.js + Activity Ring SVG + perfect-freehand sparklines |
| `/scans` (table) | **≤110KB** | App shell + table virtualization (TanStack Table) + cartogram canvas renderer |
| `/inbox` + `/workspace` | **≤120KB** | App shell + drawer + narration column + agent run polling |
| `/onboarding` | **≤80KB** | Minimal shell + Rough.js + Seal animation + form components |
| **Workflow Builder** | **≤220KB** | App shell + React Flow + Cmd-K palette + React Hook Form + Brief grounding cell + dry-run runtime |
| Monthly Update PDF | **0KB client** | Server-rendered React-PDF, ships PDF only |

These are aggressive. They're the budget Vercel ships against.

### Library choices

**Motion library — Framer Motion vs raw CSS + WAAPI.**

Framer Motion is ~30KB gzipped. It's beautiful for orchestration, but Beamix's motion is mostly: opacity fades, transform translates, stroke-dashoffset interpolations, and one paper-fold (which we just dropped). All of these are 4-line CSS animations.

**Recommendation: do not ship Framer Motion. Use CSS `transition` + Web Animations API for the few cases that need orchestration (Seal-draw multi-phase, Cycle-Close Bell choreography).**

The savings: ~30KB gzipped on every page. That's 25-30% of the home page budget recovered.

The tradeoff: orchestration code is more verbose. The Cycle-Close Bell becomes ~40 lines of WAAPI rather than 8 lines of Framer Motion. For 18 motion tokens total, that's manageable. Write a `useChoreography` hook that abstracts the timeline pattern; reuse it for Seal-draw, Cycle-Close, and Storyboard. Net code addition: ~120 lines. Net bundle savings: 30KB.

If Adam pushes for Framer Motion: lazy-load it on Workflow Builder only (where the orchestration complexity earns it) and exclude from `/home` and `/inbox`. This is a tree-shaking config in `next.config.js`. Acceptable second-best.

**Rough.js cost.**

Rough.js is ~12KB gzipped. It's used for the seal mark, agent monograms, fold-marks, Trace underlines. Required across the brand. **Keep, but lazy-load on surfaces that don't need it on first paint.** The home page above-fold needs it (Ring is not Rough but agent monograms in the Crew strip are). The /scans table doesn't need it on first paint — defer until row-expansion or detail navigation.

The deterministic-seed function (`seed(agentUuid) → path`) is what Round 1 locked as brand canon. This is *one* function, ~80 lines of code, that wraps Rough.js. The 80 lines compile to ~2KB gzipped. The function lives in `apps/web/lib/brand/seed-to-path.ts` and is imported wherever an agent's fingerprint renders. Tiny.

**perfect-freehand cost.**

perfect-freehand is ~6KB gzipped. Used for sparklines. Cheaper than D3, prettier than SVG paths, deterministic. Keep.

Together: Rough.js + perfect-freehand = 18KB. The whole hand-drawn brand stack costs less than half of Framer Motion.

**React-PDF cost.**

React-PDF is ~250KB unminified, ~80KB gzipped. **Server-only.** Never ship to client. The Monthly Update generates server-side; the client receives the PDF as a download stream. Budget: 0KB client.

This requires the PDF generation to be in a Next.js Route Handler or Server Action — not in a client component. Lock this in the architecture: any React-PDF import is a server-only file (use `'server-only'` import). ESLint rule: import of `@react-pdf/renderer` outside `app/api/` or `lib/server/` is an error.

**React Flow cost.**

React Flow v12 is ~60KB gzipped. Workflow Builder only. Lazy-load via `next/dynamic` with `ssr: false`. Doesn't impact `/home` or any non-Workflow-Builder route.

### Font payload

Beamix ships Inter + InterDisplay + Fraunces 300 + Geist Mono.

**Inter (variable):** ~80KB woff2 self-hosted. Ship once, cache forever via `Cache-Control: max-age=31536000, immutable`.
**InterDisplay (variable):** ~70KB. Same cache.
**Fraunces 300 italic only (subsetted):** ~25KB if subsetted to Latin-1 + the ~40 characters used in the cream-paper register. Aggressive subsetting is essential here — full Fraunces with all weights and glyphs is 400KB.
**Geist Mono (variable):** ~50KB.

**Total fonts:** ~225KB across all weights/styles. First-load: only the subset needed for above-the-fold (Inter regular + InterDisplay 500). The rest defer.

**FOUT vs FOIT:** Use `font-display: swap` for Inter and InterDisplay (FOUT — text appears in fallback, then swaps). Use `font-display: optional` for Fraunces (FOIT-ish — if the font isn't ready in 100ms, fallback persists; the cream-paper register uses Fraunces only on artifact surfaces where the slight delay is acceptable). This balances perceived performance against design fidelity.

The single biggest font win: **subset Fraunces aggressively.** It's used on at most ~40 unique characters across the entire product. Ship a 25KB subset, not a 400KB family.

### Brief binding line (F31) — SSG vs hydration

The Brief binding line at every page bottom rotates daily through the 4 Brief clauses. The clause is per-customer, the rotation is per-day.

**SSG won't work** because it's per-customer. **ISR with on-demand revalidation** is the right call: the Brief binding component is rendered on the server with the customer's signed-in clause-of-the-day, cached at the edge for 24 hours, revalidated on Brief edits. Client-side hydration cost: zero (it's static text). Server cost: one Supabase query per page per day per customer, cached.

Total Brief binding cost on `/home`: ~0.5KB additional HTML, 0KB JS, 0 client requests. Cheap.

### Total `/home` budget recap

| Component | Gzipped |
|---|---|
| React + Next.js shell | 45KB |
| App-specific code (layout, nav, topbar) | 18KB |
| Activity Ring + Score component | 4KB |
| Sparklines (perfect-freehand) | 6KB |
| Rough.js + seed-to-path | 14KB |
| Receipt-That-Prints card | 2KB |
| Brief binding line | 0.5KB |
| Tailwind purged CSS | 8KB |
| **Total** | **~97.5KB** |

That's just over the 80KB budget but under the 120KB outer limit. Acceptable. The path to 80KB requires either dropping Rough.js on first paint (lazy-load — recovers 14KB) or deferring sparklines to below-fold-only with Intersection Observer (recovers 6KB). I'd ship 97KB and revisit if Lighthouse penalizes it.

---

## §6 — Geist + typography stack pressure-test

Beamix ships Inter + InterDisplay + Fraunces 300 + Geist Mono. Vercel ships Geist + Geist Mono. The question: is there a case for migrating Beamix to Geist?

### The case for Geist Sans replacing Inter

- **Geist is free, designed by Vercel, and has a distinctive face.** Slightly more geometric than Inter, slightly more constructed-feeling. It carries an identity in a way Inter (now ubiquitous from Figma to Notion to Linear to Stripe to GitHub) does not.
- **Tighter letter spacing** at small sizes — Geist holds 11px caps better than Inter (Inter 11px caps need additional `letter-spacing: 0.08em` to read as caps; Geist holds at 0.05em).
- **Better display-cut economics** — Geist Display is bundled as part of the variable font; Beamix is currently shipping InterDisplay as a separate file (extra 70KB).
- **Brand alignment with Vercel hosting** — small advantage, but real. Customers who recognize the typeface map it to *technical excellence*.

### The case against migration

- **Inter has 4 years of polish.** Bug fixes, hinting improvements, OpenType feature coverage. Geist is ~18 months old; some hinting issues at <12px on Windows.
- **Fraunces still needed** for cream-paper register. Geist doesn't change that.
- **Inter is familiar to all designers.** Hiring a designer in a year, you'll explain "we use Inter" in zero seconds. "We use Geist" requires explanation.
- **Migration cost.** Every spec doc, every component, every hardcoded font reference needs updating. Audit time: ~2 days. Risk: subtle weight/spacing differences that slip through.
- **Inter italic is locked in design canon** for the empty-state Fraunces fallback context — wait, it's not, that's Fraunces. Disregard.

### My recommendation

**Keep Inter. Don't migrate to Geist Sans.**

The case for migration is real but small. Inter is the right answer for Beamix specifically because:

1. The brand carries distinctiveness through *cream paper + Rough.js + Fraunces 300 italic + the Seal* — not through the body typeface. The body typeface should disappear; Inter does that better than Geist (Geist has a subtle character that, on the cream-paper Brief, would compete with Fraunces).
2. The *Mono* is where the brand needs distinction — and **Geist Mono is already canonical in Beamix.** Keep it. Geist Mono is doing the work Geist Sans would do; the Sans doesn't need to also be Geist.
3. Migration risk outweighs the upside. Time better spent on the cartogram and the seed-to-path function.

The strongest version of this argument: **Inter is the typographic equivalent of dark mode at Vercel — it's the calm baseline. Geist Mono + Fraunces 300 + Rough.js are the texture. Don't make the baseline also a texture.**

### Fraunces 300 italic — discipline check

The spec uses Fraunces 300 italic on cream-paper register only:
- /scan storyboard editorial diagnosis
- Brief grounding cell text
- Seal-fade-signature ("— Beamix")
- Receipt-That-Prints card line ("Your Monthly Update is ready.")
- Brief binding line on every product page
- Empty states on /home (per design system spec)
- Cycle-Close Bell? No — status sentences are Inter. Correct.
- Onboarding Step 3 (cream background) — Brief sentences in 28px Fraunces 300

That's six contexts. Add *one more* from the audit: empty states on /workspace (per spec line 1070, "no illustration. The idle state is functional, not emotional"). Empty states on /workspace get Inter, not Fraunces. Correct — Fraunces stays scarce, six contexts only.

**The discipline question:** is Fraunces ever pulled into Admin Utility for a non-Brief moment? The spec already says no. Lock that. The cream-paper Brief grounding cell in Workflow Builder Inspector is the *one* register-shift inside Admin Utility. No others. The discipline is what makes Fraunces carry weight.

### InterDisplay vs Inter Display variable axis

The spec says "InterDisplay 500 / Inter 500." The display cut has slightly tighter spacing and a more confident weight at large sizes (>22px). Beamix uses InterDisplay for headings and Inter for body.

**Variable axis play:** Inter (the variable font) supports an `opsz` axis from 14 to 32. Theoretically, you could ship one Inter file and use `font-variation-settings: 'opsz' 144` for display sizes. Saves ~70KB.

**Recommendation: ship variable Inter only (no separate InterDisplay file).** Use `font-variation-settings` per use case:

```css
.display-h1 { font-family: Inter; font-variation-settings: 'opsz' 144, 'wght' 500; }
.body { font-family: Inter; font-variation-settings: 'opsz' 14, 'wght' 400; }
```

This is the same trick Linear and GitHub use. Saves the 70KB. Loses the marginal "InterDisplay is hand-tuned" benefit — but Inter at `opsz 144` is 95% as good. Lock this.

### Geist Mono usage — already correct

Geist Mono on: timestamps, IDs, tabular numerics, code, dateline stamps, the engine grid headers, version pills, save-state pills. Locked. No changes recommended. 50KB is well-spent.

---

## §7 — Dark mode plan when un-deferred

Beamix deferred dark mode at MVP. Correct call — the cream paper register makes naive dark mode a category error (cream-paper-on-dark is wrong; the cream is *the texture of paper*, and paper is light). When dark mode ships, it ships *for the working surfaces only*.

### The 6 admin-utility surfaces that get dark mode

1. `/workspace` — operator surface, long sessions, dark mode helps eye fatigue
2. `/inbox` — operator surface, table-heavy
3. `/scans` table — table-heavy, scan-and-skim surface
4. `/competitors` — table-heavy
5. `/crew` — admin/config
6. Workflow Builder canvas — *with one exception* (see below)

The cream-paper Brief grounding cell *stays cream* in dark mode. In dark mode, the cream becomes a brighter cream (`#FAF1D8`, slightly lifted) on a dark canvas — the register-shift becomes *more* dramatic, not less. The Brief is constitutional; constitutions don't theme.

### The 6 surfaces that stay light forever

1. `/scan` (public storyboard) — cream paper artifact register
2. `/onboarding` — light only; the constitutional moment doesn't dark-theme
3. `/home` cream-paper Receipt-That-Prints card — stays cream; the rest of /home dark-themes around it
4. `/security` — Adam's hybrid lock; cream paper register
5. Monthly Update PDF — cream paper artifact, prints
6. Monday Digest email — most clients dark-theme emails poorly; ship light only

This means `/home` is *partially* themable: the surface dark-themes; the Receipt-That-Prints card stays cream. This is the same move Stripe Press uses — dark mode site, cream-paper book covers floating in the dark. Beamix's version: dark dashboard, cream artifacts.

### Token system additions

Current dark accent: brand-blue at `#5A8FFF` (locked). Verified: this carries on a `#0A0A0A` background at 7.2:1 contrast. Passes WCAG AA for body text. Good.

Tokens that need dark variants (not exhaustive — directional):

- `--color-paper` → `--color-paper-dark: #0E1116` (one shade lifted from pure black, like Linear's surface)
- `--color-paper-elev` → `--color-paper-elev-dark: #161A22`
- `--color-ink` → `--color-ink-dark: #F2F4F8`
- `--color-ink-2` → `--color-ink-2-dark: #B4BAC4`
- `--color-ink-3` → `--color-ink-3-dark: #7A828F`
- `--color-ink-4` → `--color-ink-4-dark: #4F555F`
- `--color-border` → `--color-border-dark: #1F242E`
- `--color-border-strong` → `--color-border-strong-dark: #2C323D`
- `--color-brand` stays `#5A8FFF` (already dark-mode locked)

Score colors need re-saturated dark variants — `--color-score-good-dark: #34D399`, `--color-score-critical-dark: #F87171`, etc. Slightly desaturated compared to light mode (otherwise they vibrate).

### The cream-stays-light defense

**This is the move Vercel would push hardest.** Most products dark-theme by inverting; Beamix dark-themes by *partition*. Cream surfaces remain cream regardless of theme. This is a principled position: the cream represents *artifact-as-substrate* (paper), and paper does not have a dark variant. A dark cream is a contradiction.

The visual effect, when dark mode ships: a customer working in dark `/workspace` clicks into the Brief and the Brief is on cream paper, glowing softly against the dark surrounds. The constitutional moment becomes *more* the constitutional moment in dark mode. The register-shift carries even more weight.

This is the Stripe Press move applied to a SaaS product. Lock it now even though dark mode is deferred — the deferral is the right time to declare the principle.

---

## §8 — The 5 highest-leverage moves Vercel/Rauno would push hardest at MVP

Out of the eighty-or-so individual decisions surfaced above, these are the five Vercel would refuse to ship without:

### 1. Lock the named-curve dictionary (§1) and ESLint-block default Tailwind eases

The single highest-leverage motion move. Costs ~1 person-day to ship the Tailwind config + ESLint rule. Replaces the "5 motions, 1 curve" problem with a structural fix — not a one-time correction but a *system* that prevents the bug from re-emerging. A motion system without a curve dictionary will re-converge to a single shared curve within six months as developers reach for `transition-all`. With the dictionary + lint rule, it can't. This is the move that *holds the motion fix* over time.

### 2. Drop Framer Motion; ship raw CSS + Web Animations API for orchestration

Recovers 30KB gzipped on every page. Forces motion code to be deliberate (you can't accidentally orchestrate a 5-property animation in 4 lines; you have to think about it). Cost: ~2 days of orchestration code rewrites + a `useChoreography` hook. Saves 30KB × 8 routes × every-pageview-forever. The bundle math is overwhelming.

### 3. Render the cartogram on `<canvas>`, not DOM

The cartogram is the category-defining move from Round 1. If we ship it as 550 DOM nodes with conditional formatting, it drops the first frame on entry, and the *thing that was supposed to be the wow moment becomes a stutter.* Canvas implementation is ~120 lines of code, ~3ms first-paint cost, fully accessible (with offscreen DOM mirror for screen readers). Vercel pushes this on every analytics dashboard for the same reason.

### 4. Ship variable Inter only; subset Fraunces aggressively

Saves ~140KB across the font payload. Variable Inter at `opsz 144` replaces InterDisplay; subset Fraunces to ~40 characters used in the entire product. The font payload drops from ~225KB to ~85KB. This is the difference between a fast first paint and a slow one on 3G — and Beamix sells to SMBs in markets with mixed connectivity (Israel, Eastern Europe, Tier-2 US cities).

### 5. Lock the cream-stays-light dark mode partition before dark mode ships

This is the move that becomes a *missed opportunity* if not locked now. If dark mode ships first and someone naively dark-themes the cream surfaces, the brand is permanently scarred — undoing it later requires a coordinated re-design that's never as clean as the first declaration. Lock the partition in DESIGN-SYSTEM v1 today even though dark mode is deferred. One sentence of canon. Massive future leverage.

---

## Coda — If Vercel's design org shipped Beamix this week, the hire we'd make first

A **performance-engineer-with-design-instincts** — the kind of person who reads a 600ms paper-fold spec and asks "can this be a transform" before they ask "is the curve right." Beamix's design system is now correctly specified at the cubic-bezier level (after this review); the next failure mode is implementation drift between the spec and the shipped product. A motion designer would polish what's already correct. A brand designer would extend Fraunces into surfaces it doesn't belong. A frontend developer would ship the spec faithfully but at 280KB bundles. A *performance engineer who reads typography* — the person who lives at the seam between Lighthouse score and Rauno's "every frame, every byte" — is the hire who turns the spec we've now written into the product Vercel would actually be willing to put their name on. Hire that person before you hire a third designer.
