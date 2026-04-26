# Round 2 Research: Motion Language + PMF-via-Design Playbook
Date: 2026-04-24
Researcher: researcher-motion-pmf (Opus 4.6)

---

## PART A — MOTION LANGUAGE

### Top 3 Motion-as-Design Anchors for Beamix

---

#### Anchor 1: Rauno Freiberg (Staff Design Engineer, Vercel) + His Web Interface Guidelines

**Core motion philosophy:** Motion communicates spatial relationships and physics intuition. Every interaction should feel like it belongs in the physical world — dismissed elements retain the momentum and angle at which they were thrown, gestures leverage real-world metaphors (swiping mirrors page-turning), and animation responds immediately to human intent rather than playing out on a timeline. "Make it fast. Make it beautiful. Make it consistent. Make it carefully. Make it timeless. Make it soulful. Make it." His favorite Disney principle applied to UI: "Follow-Through and Overlapping Action."
Source: https://rauno.me — https://rauno.me/craft/interaction-design — https://spaces.is/loversmagazine/interviews/rauno-freiberg

**7 signature techniques we can adopt:**

1. **Animation duration cap of 200ms** — Rauno's Web Interface Guidelines state animations should max at 200ms for an immediate feel. This is tighter than Emil's 300ms ceiling and creates a snappier product.
   Source: https://interfaces.rauno.me

2. **Scale proportionally, never to extremes** — Scale animations should use values ~0.8-0.96, never scale(0). A popover appearing at scale(0.96) feels like it already existed and just became visible.
   Source: https://interfaces.rauno.me

3. **Staggered motion choreography** — Multiple elements should never animate simultaneously. Inspired by natural flocking (schools of fish), stagger element entry to create perceived depth. The iPhone unlock animation demonstrates this: app icons translate with staggered springs.
   Source: https://rauno.me/craft/depth

4. **Frequency-aware animation** — High-frequency interactions (command menus, context actions, list operations) get minimal or zero animation to avoid cognitive burden. Animation matters when rare enough to feel special. Repeated animations lose novelty and feel slower even at identical durations.
   Source: https://rauno.me/craft/interaction-design

5. **Interruptibility as requirement** — Animations must never force completion. Users should redirect mid-gesture at any point. Visual feedback scales with user input in real-time, not jumping to completion.
   Source: https://rauno.me/craft/interaction-design

6. **"Dirtying the frame" for depth** — Foreground blur elements, dimmed backdrops, and z-axis layering create perceived dimensionality. When an overlay appears, blur the backdrop to signal "only this is actionable now."
   Source: https://rauno.me/craft/depth

7. **Feedback relative to trigger** — Success states appear inline next to the action (checkmark next to copy button, not a toast). Error states highlight the specific input, not a generic banner. Optimistically update UI and roll back on server error.
   Source: https://interfaces.rauno.me

**Projects to study:**
- https://interfaces.rauno.me — The Web Interface Guidelines (23 chapters of concrete rules)
- https://devouringdetails.com — Interactive reference manual, 23 React components demonstrating principles
- https://rauno.me/craft/interaction-design — "Invisible Details of Interaction Design" essay
- https://rauno.me/craft/depth — Depth and layering techniques

**Why it fits Beamix:** Rauno's philosophy is about motion that teaches spatial relationships — exactly what Beamix needs to show agent work progressing through stages, scan results building up layer by layer, and ranking positions moving through a visual space. His frequency-aware rule solves the "dashboard visited daily" problem: repeated actions stay instant, rare moments (first scan reveal, agent completion) get the animation budget.

---

#### Anchor 2: Emil Kowalski (Design Engineer, Linear) + animations.dev

**Core motion philosophy:** Animation is communication, not decoration. The purpose of motion is to enrich information on the page — helping users understand state changes, spatial relationships, and cause-and-effect. "Sometimes the best animation is no animation." Every animation needs a justification; if you cannot articulate one, delete it. The craft is in restraint and specificity, not volume.
Source: https://emilkowal.ski — https://emilkowal.ski/ui/you-dont-need-animations — https://emilkowal.ski/ui/great-animations

**7 signature techniques we can adopt:**

1. **The 300ms ceiling / 180ms sweet spot** — Animations should stay under 300ms. For responsive UI (selects, dropdowns, tab switches), 180ms feels snappy and professional. 400ms+ feels sluggish for daily-use interactions.
   Source: https://emilkowal.ski/ui/7-practical-animation-tips

2. **ease-out for entering, ease-in-out for on-screen** — Elements entering/exiting the viewport use ease-out (accelerates at start, decelerates at end = responsive). Elements already on screen moving between states use ease-in-out to mimic natural acceleration/deceleration. Never use ease-in for UI — it feels slower.
   Source: https://emilkowal.ski/ui/7-practical-animation-tips — https://emilkowal.ski/ui/good-vs-great-animations

3. **Custom curves over built-in CSS easings** — Built-in CSS ease functions feel generic. Custom cubic-bezier curves feel more "energetic." Emil's course includes 18 custom easing curves. Reference: easing.dev and easings.co for curve design.
   Source: https://emilkowal.ski/ui/good-vs-great-animations — https://animations.dev

4. **Origin-aware animations** — Dropdowns from buttons use transform-origin: bottom center. Popovers scale from their trigger point. Radix provides --radix-popover-content-transform-origin. shadcn/ui handles this automatically.
   Source: https://emilkowal.ski/ui/good-vs-great-animations — https://emilkowal.ski/ui/7-practical-animation-tips

5. **Active state scale(0.97)** — Buttons compress slightly on press (:active pseudo-class) to give tactile feedback. Not 0.9 (too dramatic), not 1.0 (no feedback). 0.97 is the sweet spot.
   Source: https://emilkowal.ski/ui/7-practical-animation-tips

6. **Never animate keyboard-initiated actions** — Actions triggered by keyboard (submitting forms, navigating lists, Enter key) must be instant. Users performing keyboard actions repeat them hundreds of times daily; animation would feel like lag.
   Source: https://emilkowal.ski/ui/great-animations — https://emilkowal.ski/ui/you-dont-need-animations

7. **Blur as transition polish** — When easing and duration adjustments do not resolve an awkward transition, adding filter: blur(2px) during the state change smooths the visual gap between states. Subtle, effective.
   Source: https://emilkowal.ski/ui/7-practical-animation-tips

**Projects to study:**
- https://animations.dev — Full interactive course (45+ lessons, 18 custom easings)
- https://emilkowal.ski/ui/7-practical-animation-tips — The essential quick reference
- https://emilkowal.ski/ui/good-vs-great-animations — Origin-aware, spring, clip-path
- https://emilkowal.ski/ui/building-a-drawer-component — Vaul: cubic-bezier(0.32, 0.72, 0, 1), 500ms iOS-mimicking drawer
- https://emilkowal.ski/ui/you-dont-need-animations — When NOT to animate (critical)

**Why it fits Beamix:** Emil's philosophy prevents the biggest risk for Beamix: over-animating a dashboard that people visit daily. His "never animate keyboard actions" and "frequency fatigue" rules are essential guardrails. His Vaul drawer component (open-source) could directly power Beamix's mobile agent panel. His origin-aware technique makes every scan result card, agent action, and notification feel spatially grounded.

---

#### Anchor 3: Linear (Product) — The Living Reference for Craft-as-Competitive-Advantage

**Core motion philosophy:** "Most of these fixes are small on their own, but together they completely change how the product feels." Linear treats quality as a team sport: their "Quality Wednesdays" initiative has shipped 1,000+ micro-improvements over two years. Karri Saarinen (CEO): "The spec is the baseline, not the finish line." The product's competitive moat is not features — it is the cumulative feeling of hundreds of invisible details, including consistent 150ms hover fade-outs, LCH color space for perceptually uniform colors, and Inter Display for headings with Inter for body.
Source: https://linear.app/now/quality-wednesdays — https://linear.app/now/how-we-redesigned-the-linear-ui — https://www.figma.com/blog/karri-saarinens-10-rules-for-crafting-products-that-stand-out/

**6 signature techniques we can adopt:**

1. **Quality Wednesdays — a process, not just rules** — Every Wednesday the Linear team fixes craft issues: a button that darkens instantly instead of fading over 150ms, adjacent buttons with mismatched sizes, issue composers that shift height when adding a line. Fixes take 30 minutes max.
   Source: https://linear.app/now/quality-wednesdays

2. **LCH color space** — Linear switched from HSL to LCH because "a red and a yellow color with lightness 50 will appear roughly equally light." This matters for status indicators, score displays, and data visualization — all core to Beamix.
   Source: https://linear.app/now/how-we-redesigned-the-linear-ui

3. **Reduction through subtraction** — "Adjusted sidebar, tabs, headers, and panels to reduce visual noise, maintain visual alignment, and increase hierarchy." The redesign darkened text/icons in light mode, lightened them in dark mode.
   Source: https://linear.app/now/how-we-redesigned-the-linear-ui

4. **Inter Display headings + Inter body** — Typography layering using the Display variant for expression in headings while keeping readability in body. Beamix already uses Inter; adding InterDisplay is a one-line font change.
   Source: https://linear.app/now/how-we-redesigned-the-linear-ui

5. **Opinionated defaults** — "You can only create a great product if you design for someone in particular." Linear does not expose 50 settings; it makes the decision for you. "Flexible software lets everyone invent their own workflows, which eventually creates chaos as teams scale."
   Source: https://linear.app/method/introduction — https://www.figma.com/blog/karri-saarinens-10-rules-for-crafting-products-that-stand-out/

6. **Spec as baseline, craft as finish** — "It's harder to do the craft. For quality, you need a team that views the spec as the baseline, not the finish line." Every interaction has a 150ms minimum expected fade. Every alignment is pixel-checked.
   Source: https://www.figma.com/blog/karri-saarinens-10-rules-for-crafting-products-that-stand-out/

**Projects to study:**
- https://linear.app/now/quality-wednesdays — The Quality Wednesdays process
- https://linear.app/now/how-we-redesigned-the-linear-ui — Full redesign writeup
- https://linear.app/method — The Linear Method (product philosophy)
- https://linear.app/now/design-is-more-than-code — Design process at Linear
- https://karrisaarinen.com/posts/soul/ — "Your Product Needs a Soul"

**Why it fits Beamix:** Linear proves that cumulative micro-craft is a viable moat for a B2B product. Beamix serves SMB owners who may not be able to articulate why a product feels good — but they feel it. Linear's approach of 1,000+ small quality fixes, systematized into a weekly ritual, is directly implementable. Their typography choices (Inter + InterDisplay) align with Beamix's existing font stack. Their LCH color insight is critical for Beamix's score displays (Excellent/Good/Fair/Critical).

---

### The Beamix Motion Vocabulary (Consolidated)

#### Easing Curves — Warm Professional vs Cold Tech

| Use Case | Curve | Feel | Source |
|----------|-------|------|--------|
| **Elements entering screen** | `cubic-bezier(0.16, 1, 0.3, 1)` | Fast start, gentle landing — "warm arrival" | Emil: ease-out family, https://emilkowal.ski/ui/7-practical-animation-tips |
| **Elements moving on-screen** | `cubic-bezier(0.45, 0, 0.55, 1)` | Symmetric acceleration — "natural shift" | Emil: ease-in-out, https://emilkowal.ski/ui/good-vs-great-animations |
| **Drawer/panel opening** | `cubic-bezier(0.32, 0.72, 0, 1)` | iOS-mimicking — "familiar comfort" | Emil: Vaul component, https://emilkowal.ski/ui/building-a-drawer-component |
| **Micro-feedback (hover)** | `cubic-bezier(0.25, 0.1, 0.25, 1)` (CSS ease) | Standard, unnoticeable — "invisible" | Emil: hover backgrounds, https://emilkowal.ski/ui/good-vs-great-animations |
| **COLD TECH (avoid)** | `linear` or `ease-in` alone | Robotic, sluggish | Emil explicitly warns against ease-in for UI |

Spring physics: Use spring interpolation for decorative/ambient elements (agent character idle, score gauge fill) but NOT for functional UI (buttons, navigation). Reserve for "personality" animations. Source: https://emilkowal.ski/ui/good-vs-great-animations

#### Timing — Specific ms Ranges

| Category | Duration | Rule | Source |
|----------|----------|------|--------|
| **Micro-interactions** (hover, active, focus) | 100-150ms | Must feel instant | Rauno: https://interfaces.rauno.me |
| **State transitions** (tab switch, dropdown) | 150-200ms | Rauno's 200ms cap | Rauno: https://interfaces.rauno.me |
| **Page-level transitions** | 200-300ms | Emil's 300ms ceiling | Emil: https://emilkowal.ski/ui/great-animations |
| **Character behavior** (agent working, idle) | 300-800ms | Spring-based, continuous | Exception: ambient motion can be longer |
| **Flow visualization** (scan progress, data building) | 500-2000ms | Educational motion — user is watching, not interacting | Custom: this is Beamix-specific |
| **Keyboard-triggered actions** | 0ms | No animation, ever | Emil: https://emilkowal.ski/ui/you-dont-need-animations |

#### Choreography — Multiple Elements Without Chaos

- **Stagger delay: 30-50ms per element** — When showing a list of scan results or agent recommendations, each card enters 30-50ms after the previous. Source: Rauno's staggered motion, https://rauno.me/craft/depth
- **Blur-first, content-second** — When overlays appear, blur the backdrop first (100ms), then animate the overlay content in (150ms). Two discrete steps prevent "everything moving at once." Source: Rauno, https://rauno.me/craft/depth
- **Orchestrate from trigger point outward** — Animations radiate from the user's click/tap point. A card expanding into detail view animates from the card's position, not from center-screen. Source: Emil, origin-aware technique, https://emilkowal.ski/ui/good-vs-great-animations
- **Never animate more than 3 properties simultaneously** — Animating position + scale + opacity is the maximum. Adding color, blur, and rotation creates chaos. Source: Vercel guidelines: only transform + opacity are GPU-composited, https://interfaces.rauno.me

#### Physics — When Yes, When No

**Yes (spring physics appropriate):**
- Agent character idle animation (gentle bob, breathe)
- Score gauge filling up after scan completes
- Drag-and-drop reordering of recommendations
- Scan results "landing" into position

**No (spring physics too playful):**
- Navigation transitions
- Modal open/close
- Button interactions
- Tab switching
- Data table rendering

Rule: If the user is trying to get something done (task mode), use deterministic easing. If the user is watching something happen (spectator mode), spring physics add warmth. Source: Emil — reserve springs for decorative animations, not functional ones, https://emilkowal.ski/ui/good-vs-great-animations

#### Anti-Patterns — 7 Motion Mistakes Beamix Will Not Make

1. **Entrance animations on page load for returning users.** First visit: yes. Daily dashboard return: the content should already be there. Source: Rauno, frequency-aware animation, https://rauno.me/craft/interaction-design

2. **Animating from scale(0).** Nothing in reality disappears and reappears. Start at scale(0.9) minimum, ideally 0.93-0.96. Source: Emil, https://emilkowal.ski/ui/7-practical-animation-tips, https://emilkowal.ski/ui/css-transforms

3. **Transition: all.** Explicitly list animated properties. `transition: all` causes unintended layout shifts and visual jank. Source: Vercel guidelines, https://interfaces.rauno.me (via Vercel Web Interface Guidelines)

4. **Tooltip delays after the first one.** Once a tooltip has appeared, subsequent tooltips in the same area should show instantly (transition-duration: 0ms on data-instant). Source: Emil, https://emilkowal.ski/ui/7-practical-animation-tips

5. **Animating width/height/padding/margin.** These trigger layout+paint+composite — three phases instead of one. Only animate transform and opacity. Source: Emil, https://emilkowal.ski/ui/great-animations + Vercel guidelines

6. **Motion without prefers-reduced-motion support.** Always check @media (prefers-reduced-motion: reduce) and provide static alternatives. Source: Emil + Rauno + Vercel guidelines (all three mandate this)

7. **Looping animations that play when offscreen.** Looping animations (loading spinners, agent activity indicators) must pause when not visible. Source: Rauno, https://interfaces.rauno.me

#### The 5 "Signature Motions" Beamix Should Own

These are the motions that appear repeatedly across the product and become recognizable as Beamix:

1. **The Scan Reveal** — After a scan completes, results build up layer by layer with staggered 40ms delays, from left to right across AI engines. Each engine result "lands" with a subtle spring settle (like cards being dealt). This is the first thing users see and the moment they feel the product working. Technique: stagger + spring settle + scale(0.96) to scale(1).

2. **The Agent Pulse** — When an AI agent is actively working, a soft radial pulse emanates from the agent's avatar/icon. Not a spinner. A living pulse that suggests intelligence at work. Uses spring physics with low stiffness for organic feel. Pairs with a subtle progress bar that fills deterministically.

3. **The Score Gauge Fill** — Ranking scores animate from 0 to their value with an ease-out curve over 800ms. The color transitions through the score spectrum (Critical red -> Fair amber -> Good green -> Excellent cyan) as it fills. This is educational motion: it teaches users what the numbers mean by showing the journey.

4. **The Recommendation Cascade** — When recommendations appear after a scan, they cascade down from the top with 50ms stagger, each sliding in from the right (translateX(12px) to translateX(0)) with opacity. The first recommendation gets a subtle highlight glow. This communicates priority ordering.

5. **The Completion Settle** — When an agent finishes work, the result card does a micro-bounce (scale 1 -> 1.02 -> 1, 200ms total with spring) and a brief border-color flash of #3370FF (Beamix blue). This is the "ding" moment — the product saying "done, here's what I made for you."

---

### Motion Tech Stack Recommendation

#### Framer Motion (now "Motion" — motion.dev)

The production standard for React animation. 30M+ monthly npm downloads. Provides declarative animation API, spring physics, layout animations, AnimatePresence for exit animations, gesture support (hover, press, drag), and scroll-driven animations with hardware acceleration. The independent transforms feature allows animating x, y, rotateZ without wrapper elements. Downside: bundle size adds ~30-40KB to client. Spring physics feel natural but need tuning to avoid "bouncy toy" feel. Strong ecosystem: used by Vercel, Linear (Emil works there), and most modern React products.
Source: https://motion.dev

#### Lottie (lottiefiles.com / airbnb open source)

After Effects animations exported as JSON and played in the browser. Best for pre-rendered vector animations (illustrations, icons, loading states) created by a designer in After Effects. Not interactive — plays a timeline. JSON format is verbose: a 240KB Lottie file can be 16KB in Rive. Runtime is lightweight but the animation files themselves add up. Good for: marketing illustrations, simple icon animations, branded loading screens. Bad for: interactive UI motion, physics-based animation, runtime state changes. Karri Saarinen (Linear/Airbnb) built the original Lottie library at Airbnb.
Source: https://karrisaarinen.com/posts/lottie-animation/ — https://rive.app/blog/rive-as-a-lottie-alternative

#### Rive (rive.app)

Purpose-built GPU-rendered animation runtime. Binary .riv format is 10-15x smaller than equivalent Lottie JSON. Supports state machines (interactive branching), mesh deformation (character rigging), and runtime interactivity. Used by Duolingo (character animations), Spotify, Disney. Design+animate+code in one tool. Downside: requires learning Rive's editor (not After Effects), smaller community than Lottie, and the runtime adds its own weight. Best for: character animation (Beamix's agent characters), complex interactive illustrations, game-like UI elements.
Source: https://rive.app — https://rive.app/blog/rive-as-a-lottie-alternative

#### Recommendation for Beamix

**Primary: Motion (Framer Motion)** for all UI interactions — page transitions, micro-interactions, layout animations, the 5 signature motions, and spring physics. This is the React standard, works with Next.js, and both Rauno and Emil build with it.

**Secondary: Rive** for agent character animations specifically. If Beamix's agents have visual characters/avatars with personality (idle, working, celebrating, error states), Rive's state machine and mesh deformation are purpose-built for this. File sizes stay tiny. Evaluate during design phase — if the characters are simple enough (icon + pulse), Motion alone suffices. If they need rigged facial expressions or body movement, Rive is the tool.

**Skip Lottie** unless a designer has already created After Effects animations. It has no advantage over Motion for interactive UI and no advantage over Rive for character work.

---

## PART B — PMF-VIA-DESIGN PLAYBOOK

### The 10 Rules That Make B2B Tools Feel Built-for-Me

**Rule 1: No jargon surfaces.**
Every technical term has a plain-language equivalent chosen before the technical term appears anywhere. The technical term exists only in tooltips or docs, never as the primary label.

- Stripe pattern: "your customers" not "payees"; "revenue" not "MRR."  Source: https://stripe.com
- Tailscale pattern: "Easy, secure, identity-based access to anything" — never says "Zero Trust architecture" on the homepage. Source: https://tailscale.com
- Beamix pattern: "your ranking" not "your SERP position"; "AI search visibility" not "GEO score."

**Rule 2: Show the product doing the work, not settings to configure.**
The first thing a user sees should be the product working, not a configuration panel. Defaults should be opinionated enough that the product functions without any setup.

- Linear: open the app, see issues you can act on. No onboarding wizard, no setup flow. Source: https://linear.app/method/introduction — "A tool should work for you, not the other way around."
- Granola: "Minimal, fast, with no setup. It. just. works." Templates guide first use, not settings. Source: https://www.granola.ai
- Beamix: scan runs immediately on URL input. Results appear. No "configure your engines" step.

**Rule 3: Speed as character trait.**
The product should feel faster than the user expects. This communicates competence. Sub-50ms UI response. Instant transitions. Optimistic updates.

- Superhuman: entire brand built around speed. CEO spent 6 months on typography to optimize reading speed. Positioned around a single attribute: speed. Source: https://www.lennysnewsletter.com/p/superhumans-secret-to-success-rahul-vohra
- Raycast: "Think in milliseconds." "It's not about saving time. It's about feeling like you're never wasting it." Source: https://www.raycast.com
- Beamix: dashboard loads skeleton-to-content in under 200ms. Agent results stream in real-time, never batch-delayed.

**Rule 4: One number, front and center.**
Non-technical users need a single metric they can understand, track, and talk about. Everything else is detail beneath it.

- Mercury: "one snapshot" for total financial visibility. Source: https://mercury.com
- Beamix: the overall AI visibility score (0-100) is the hero metric. Everything else (per-engine rankings, recommendations, content) supports this number.

**Rule 5: Do > Show > Tell.**
Interactive experience beats tutorial beats documentation. Users learn by doing, not by reading.

- Superhuman: onboarding specialists had users achieve inbox zero during the call — not explained, experienced. "Do > show > tell" was their explicit principle. Source: https://review.firstround.com/superhuman-onboarding-playbook/
- Ramp: "An employee swipes their Ramp card at dinner; the receipt is captured automatically, coded to the correct GL account, and auto-approved because it's within policy — no expense report filed." Source: https://www.ramp.com
- Beamix: the free scan IS the onboarding. User enters URL, sees results, understands the product.

**Rule 6: Empty states prompt action, not explanation.**
An empty dashboard is a failure. Every empty state should contain one clear action and optionally a template.

- Rauno's guideline: "Empty states should prompt to create a new item, with optional templates." Source: https://interfaces.rauno.me
- Linear: empty project view immediately shows "Create an issue" with keyboard shortcut.
- Beamix: empty agent history shows "Run your first agent" with the top recommendation pre-selected.

**Rule 7: Absorb complexity into the system, not the UI.**
If the system can make the decision, the user should not see the choice.

- Ramp: AI reads bills, populates GL codes automatically, auto-approves within-policy expenses. Source: https://www.ramp.com
- Mercury: "Apply online in 10 minutes" — no in-person visits, no paperwork. Source: https://mercury.com
- Fin AI: "Set up in under an hour" — train on existing procedures, not configure AI models. Source: https://fin.ai/
- Beamix: agents choose their own strategy based on the scan. Users approve the output, not the approach.

**Rule 8: Progressive disclosure, not progressive complexity.**
Show the minimum by default. Reveal detail on demand. Never force users to see the full complexity.

- Linear: "Start simple, grow powerful as teams scale." Progressive complexity as a core method principle. Source: https://linear.app/method/introduction
- Tailscale: tabs for different personas (IT, Security, DevOps, Engineering) — each sees only their value prop. Source: https://tailscale.com
- Beamix: scan results show score + top 3 recommendations. Expand to see per-engine breakdown. Expand further for raw data.

**Rule 9: Celebrate completion, not process.**
The product should mark moments of achievement, not display ongoing process metrics. Completion is the dopamine hit.

- Superhuman: achieving inbox zero triggers a celebratory visual. The goal state is celebrated.
- Beamix: when an agent completes work, the Completion Settle animation fires (scale micro-bounce + blue border flash). The user sees a finished artifact, not a progress bar.

**Rule 10: The product has a voice, not a manual.**
Micro-copy should read as a knowledgeable colleague, not a help doc. First person plural ("we found..." not "results indicate..."). Active voice. Present tense.

- Granola: "The addiction is real — at this point I can't imagine life without it." Product testimonials reflect personal attachment. Source: https://www.granola.ai
- Arc: "shapes itself to how you use the internet" — the product has agency and adapts. Source: https://arc.net
- Beamix: "We scanned 9 AI engines. ChatGPT mentions you, but Perplexity doesn't — here's why." Not: "Scan results indicate presence in 1/9 monitored engines."

---

### Signature Welcome Moments

**Superhuman's moment:** The 30-minute 1-on-1 video call with an Onboarding Specialist. Specialist configures Superhuman to match the user's workflow, imports email, trains on shortcuts, and achieves inbox zero during the call. At peak: 20 full-time specialists onboarding tens of thousands of users/year. Users who completed onboarding achieved 2x retention vs self-serve. Three principles: Opinionated ("there is a best way to use the product"), Interruptive ("if tucked away, it will be ignored"), Interactive ("do > show > tell").
Source: https://review.firstround.com/superhuman-onboarding-playbook/ — https://www.lennysnewsletter.com/p/superhumans-secret-to-success-rahul-vohra

**Linear's moment:** There is no onboarding wizard. You open the app and see a clean, empty workspace ready for work. The product communicates its philosophy through absence: no clutter, no tour, no tooltips. The empty state itself says "we respect your time." The craft is so self-evident that the interface teaches by being.
Source: https://linear.app/method/introduction — https://www.figma.com/blog/karri-saarinens-10-rules-for-crafting-products-that-stand-out/

**Granola's moment:** The first-meeting reveal. You take rough notes during a meeting, and when it ends, Granola merges your notes with the AI-enhanced transcript — decisions, action items, key quotes appear. The "aha" is the gap between what you wrote and what appeared. "It. just. works."
Source: https://www.granola.ai — https://wondertools.substack.com/p/granolaguide

**Raycast's moment:** The blank command palette with one suggestion. You press the hotkey, a clean input appears, and you type. The first result appears instantly. Speed IS the welcome moment. No tour — the product's responsiveness communicates everything.
Source: https://www.raycast.com

#### Recommended Beamix Signature Welcome Moment: "The First Scan Reveal"

The user enters their business URL. For 8-12 seconds, a living visualization shows 9 AI engines being queried — each engine icon lights up as it's checked, with the Scan Reveal stagger animation. Then results build up: the overall score fills with the Score Gauge animation. Per-engine results cascade down. The first recommendation highlights with the Recommendation Cascade.

This IS the product. No explanation needed. The user watches their business being analyzed across AI in real-time. The gap between "I typed my URL" and "I can see exactly where I stand in AI search" is the aha moment. It combines Granola's "reveal after minimal input" with Raycast's "speed as welcome" — but made visual and educational.

The scan is free. No signup required. The user feels ownership of their data before they're asked to pay.

---

### Onboarding Flow Blueprint

**Minute 1: The Scan.**
User arrives (from ad, referral, or direct). One input field: "Enter your business website." User types URL. Scan begins immediately. The Scan Reveal visualization plays. No signup, no email, no name. The product is working before the user has committed to anything.

**Minute 3: The Results.**
Scan completes. Score appears. Per-engine breakdown shows which AI tools mention the business and which don't. Top 3 recommendations appear via Recommendation Cascade. The user now understands:
- What their AI visibility score is
- Which engines they appear in
- What they should do about it

At the bottom: "Save your results and let our agents fix this — create your account." (Not "Sign up for a free trial.") The frame is: save what you already own + get help.

**Minute 10: The First Agent Preview.**
After signup (email + password, nothing more), the user lands on their dashboard with scan data pre-loaded (free scan import flow). The top recommendation has a "Run Agent" button. The user clicks it. The Agent Pulse animation begins. Within 60 seconds, the agent produces a first draft (content optimization, FAQ schema, or whatever the recommendation was). The Completion Settle fires. The user sees the output.

At this point the user has: (1) seen their problem, (2) been told what to fix, (3) watched an AI fix it. Elapsed: ~10 minutes. No jargon. No settings. No configuration.

---

### Empty States, Loading States, Error States

#### Empty States (3 examples)

1. **Empty Dashboard (new user, post-scan):**
   The overall score is displayed from the free scan. Below it, a card: "Your agents haven't started yet." A single button: "Run your first recommendation" with the top recommendation pre-selected. The agent character sits in a relaxed idle pose (gentle spring-based bob). Copy: "I'm ready when you are. Pick a recommendation and I'll get to work."

2. **Empty Agent History:**
   Character in a "waiting" pose. Copy: "No completed work yet. When agents finish tasks, their output appears here." One button: "See recommendations." No lorem ipsum, no "coming soon," no placeholder charts.

3. **Empty Content Library:**
   Character holding a blank page. Copy: "Your optimized content will live here. Run an agent to create your first piece." Single action button. The empty state IS the onboarding for that feature.

#### Loading States (3 examples)

1. **Scan in Progress:**
   The Scan Reveal visualization. Each engine icon pulses as it's being queried. A determinate progress bar fills across the bottom. Copy below: "Checking ChatGPT... Checking Perplexity... Checking Claude..." (updating as each completes). Not a generic spinner — the user knows exactly what's happening.

2. **Agent Working:**
   The Agent Pulse radiates from the agent avatar. A step-by-step progress indicator shows: "Analyzing your content... Generating recommendations... Writing draft..." Each step checks off as it completes. The character's pose shifts from "thinking" to "writing" to "reviewing." Copy: "Working on your FAQ schema — usually takes about 30 seconds."

3. **Dashboard Data Loading:**
   Skeleton screens matching the exact layout of the final content. Score gauge skeleton pulses. Chart area shows axis lines with pulsing bars. No blank white space, no spinners. The skeleton uses Beamix blue (#3370FF) at 10% opacity for the pulse.

#### Error States (3 examples)

1. **Scan Failed (URL unreachable):**
   Character with a confused expression (not sad — confused is actionable, sad is blaming). Copy: "We couldn't reach that website. Can you double-check the URL?" Input field is highlighted with the error state. Suggestion: "Try adding www. or checking for typos." One retry button.

2. **Agent Timed Out:**
   Character in a "shrug" pose. Copy: "This is taking longer than expected. We've saved your progress — try again or we'll notify you when it's done." Two buttons: "Try Again" and "Notify Me." No error code, no stack trace, no "Error 504."

3. **Network Connection Lost:**
   Subtle top banner (not modal — modals are disruptive). Copy: "You're offline. We'll sync when you're back." All previously loaded data remains visible. No blank screen, no "you must be connected" gate.

---

### Micro-Copy Principles (8 Rules)

**1. Active voice, present tense, first person plural.**
Before: "Your scan results have been generated."
After: "We scanned 9 AI engines. Here's where you stand."
Source: derived from Granola's "It. just. works." and Arc's "shapes itself" — products with voice use present tense and active verbs.

**2. Name the thing, not the category.**
Before: "View your analytics dashboard."
After: "See your AI visibility score."
"Dashboard" is a container; "AI visibility score" is the thing the user wants.

**3. Plain language over the technical term.**
Before: "Configure SERP monitoring parameters."
After: "Choose which AI tools to track."
Rule: if a 14-year-old wouldn't understand the term, rewrite it. Source: Tailscale's homepage avoids "Zero Trust" in favor of "easy, secure access." https://tailscale.com

**4. Outcomes over features.**
Before: "AI-powered content optimization agent."
After: "Rewrite your page so ChatGPT recommends you."
Source: Superhuman positioned around speed (outcome), not "keyboard-shortcut-based email client" (feature). https://www.lennysnewsletter.com/p/superhumans-secret-to-success-rahul-vohra

**5. Questions over statements for error states.**
Before: "Invalid URL format."
After: "Is that the right URL? We're looking for something like yoursite.com."
Questions feel like a conversation. Statements feel like a computer error.

**6. Specific numbers over vague quantities.**
Before: "We check multiple AI search engines."
After: "We check 9 AI engines including ChatGPT, Perplexity, and Claude."
Source: Mercury's "Apply online in 10 minutes" and Ramp's "ERP connection in 5 minutes, policy upload in 2 minutes, first card issued in 1 minute." https://mercury.com — https://www.ramp.com

**7. Encouragement, not congratulation.**
Before: "Congratulations! Your scan is complete!"
After: "Done. You're visible on 4 of 9 engines — let's improve that."
Congratulations feels condescending for a business tool. Encouragement with direction respects the user's intelligence.

**8. Brevity as respect.**
Before: "Welcome to your Beamix dashboard! Here you'll find all of your scan results, agent outputs, and recommendations organized for easy access."
After: "Your dashboard."
The product should be self-evident. If it needs a sentence to explain, the design failed — not the copy.
Source: Karri Saarinen: "Don't invent terms if possible, as these can confuse and have different meanings." https://linear.app/method/introduction

---

### What to CUT to Feel Designed-for-the-User

Non-technical SMB owners are overwhelmed by settings panels, nested menus, and dashboards with 12 widgets. The path to "feels built for me" is through removal.

**Cut on first visit:**

1. **Settings page.** New users do not need settings. The product should work with opinionated defaults. Settings appear after 7 days or when the user seeks them. Source: Linear ships opinionated defaults, not configuration surfaces. https://www.figma.com/blog/karri-saarinens-10-rules-for-crafting-products-that-stand-out/

2. **Feature tours / tooltip walkthroughs.** These teach the UI, not the value. If the UI needs a tour, simplify the UI. The free scan IS the tour. Source: Superhuman's principle — "Interruptive" beats "tucked away," but the interruption is the product working, not a tooltip. https://review.firstround.com/superhuman-onboarding-playbook/

3. **Multiple navigation levels.** First-time users should see: Score, Recommendations, Agents, Content. Four items maximum in primary nav. Everything else (billing, integrations, preferences) lives under a profile menu that is not prominent.

4. **Raw data tables.** The per-engine breakdown should default to a visual view (cards with icons), not a sortable data table. Tables are an engineer's comfort zone, not an SMB owner's. Data tables available under an "Advanced" toggle for users who want them.

5. **Plan comparison matrix on dashboard.** The dashboard should never show plan limitations. If an action requires an upgrade, show it at the moment of attempt ("This agent requires Build plan — upgrade to unlock") not as a persistent reminder. Source: derived from Mercury's approach of framing banking as growth, not compliance. https://mercury.com

6. **Notification settings during onboarding.** Default to sensible notifications (weekly digest + agent completion). Let users adjust later. Do not ask during signup.

7. **API keys, webhooks, integrations panels.** These are power-user features. They should not appear in the main navigation for at least 30 days of usage. Source: Tailscale hides networking complexity behind "Get started in minutes." https://tailscale.com

---

## COMBINED RECOMMENDATION — HOW MOTION + PMF FEEL FUSE IN BEAMIX

Motion and PMF-via-design are not separate concerns — they are the same concern expressed through different channels. When Beamix's scan results build up with staggered springs and the score gauge fills with warm easing, it is simultaneously (a) beautiful motion and (b) teaching the user what their data means without requiring them to read a manual. When the Agent Pulse radiates softly while work happens, it is both (a) a signature animation and (b) the "show the product doing the work" PMF rule in action. The 5 signature motions are not decorative; each one corresponds to a PMF moment — Scan Reveal is the welcome moment, Agent Pulse is "absorb complexity into the system," Score Gauge Fill is "one number front and center," Recommendation Cascade is "do > show > tell," and Completion Settle is "celebrate completion." Motion IS the medium through which Beamix communicates competence, warmth, and "this was built for you" to non-technical users who cannot articulate why they trust a product — they just feel it. The craft of Rauno, the restraint of Emil, and the systematic quality of Linear converge into a product that treats every 150ms transition as both an aesthetic choice and a communication choice.

---

## SCREENSHOT / VIDEO / DEMO BOARD

### Motion Craft References (13 URLs)
1. https://interfaces.rauno.me — Web Interface Guidelines (the single most useful reference)
2. https://devouringdetails.com — Rauno's interactive reference manual
3. https://rauno.me/craft/interaction-design — "Invisible Details" essay
4. https://rauno.me/craft/depth — Depth and layering
5. https://emilkowal.ski/ui/7-practical-animation-tips — 7 production tips
6. https://emilkowal.ski/ui/good-vs-great-animations — Origin-aware, spring, easing
7. https://emilkowal.ski/ui/you-dont-need-animations — When NOT to animate
8. https://emilkowal.ski/ui/building-a-drawer-component — Vaul drawer (open source)
9. https://emilkowal.ski/ui/great-animations — Duration, performance, purpose
10. https://animations.dev — Full animation course (paid, $249)
11. https://linear.app/now/quality-wednesdays — Quality process
12. https://linear.app/now/how-we-redesigned-the-linear-ui — Redesign writeup
13. https://motion.dev — Motion (Framer Motion) library

### PMF-via-Design References (12 URLs)
14. https://review.firstround.com/how-superhuman-built-an-engine-to-find-product-market-fit/ — PMF Engine
15. https://review.firstround.com/superhuman-onboarding-playbook/ — Onboarding playbook
16. https://www.lennysnewsletter.com/p/superhumans-secret-to-success-rahul-vohra — Rahul Vohra on speed
17. https://www.figma.com/blog/karri-saarinens-10-rules-for-crafting-products-that-stand-out/ — Karri's 10 rules
18. https://karrisaarinen.com/posts/soul/ — "Your Product Needs a Soul"
19. https://linear.app/method/introduction — The Linear Method
20. https://www.granola.ai — Granola positioning + "it just works"
21. https://www.raycast.com — Raycast speed + command palette
22. https://arc.net — Arc positioning + ownership feel
23. https://mercury.com — Banking for non-bankers
24. https://tailscale.com — Networking for non-networking-people
25. https://fin.ai/ — Fin AI agent for non-technical support

---

## CONFIDENCE + SOURCES

### Per-Section Confidence

| Section | Confidence | Reason |
|---------|-----------|--------|
| Anchor 1: Rauno | **HIGH** | Direct from rauno.me, interfaces.rauno.me, interview. Primary sources, recent. |
| Anchor 2: Emil | **HIGH** | Direct from emilkowal.ski blog posts, animations.dev. Primary author sources. |
| Anchor 3: Linear | **HIGH** | Direct from linear.app/now blog, Figma interview with Karri. Primary sources. |
| Beamix Motion Vocabulary | **MEDIUM-HIGH** | Synthesized from the 3 anchors above. Easing values from Emil's posts. Timing from Rauno's guidelines. Beamix-specific signature motions are recommendations, not sourced precedent. |
| Motion Tech Stack | **HIGH** | Direct from motion.dev, rive.app, Rive vs Lottie comparison. Market data verified. |
| 10 PMF Rules | **MEDIUM-HIGH** | Rules 1-3, 5-8 sourced from specific products. Rules 4, 9, 10 synthesized from multiple case studies with thinner direct sourcing. |
| Superhuman Onboarding | **HIGH** | First Round Review + Lenny's Newsletter. Extensively documented. |
| Linear Philosophy | **HIGH** | Direct from method page, Figma interview, blog posts. |
| Granola | **MEDIUM** | Homepage copy only. No deep technical/design writeups found publicly. |
| Raycast | **MEDIUM** | Homepage copy. Motion specifics inferred from product use reports, not official docs. |
| Arc | **MEDIUM** | Homepage + testimonials. Design philosophy inferred, not officially documented. |
| Notion Calendar / Cron | **LOW** | Acquisition details from Engadget + blog. No deep design craft writeups found. |
| Mercury, Ramp, Stripe | **MEDIUM** | Homepage positioning only. Onboarding specifics from marketing copy, not design docs. |
| Intercom Fin | **MEDIUM** | Fin.ai homepage. Positioning clear, design internals not public. |
| Beamix Recommendations | **MEDIUM** | Synthesis from researched sources. Opinionated — requires design validation. |

### Gaps / What I Could Not Verify
- Paco Coursey's specific motion philosophy — no published writeups found beyond his general craft ethos. Source: https://paco.me
- Matt Wagerfield, Jhey Tompkins — not researched in depth due to time constraints. Lower priority for product (vs portfolio) motion.
- Family.co — turned out to be a crypto wallet, not a design studio. Beautiful micro-animations but not the "studio" expected.
- Ueno, Dept, Instrument, Resn — could not access or extract deep motion philosophy from homepages. Enterprise studios with less public documentation.
- Basement Studio — confirmed 3D/motion capability but no published philosophy or case studies extracted.
- Tonik (tonik.com) — not researched.
- Dia browser — positioned as AI browser, motion details thin from homepage. Source: https://diabrowser.com
- Notion Calendar — design craft details thin; primarily an acquisition story. Source: https://www.engadget.com/notion-turns-its-cron-acquisition-into-an-integrated-calendar-app-215644220.html
- Specific Geist Design System motion guidelines from Vercel — the motion page did not render content; Rauno's interfaces.rauno.me serves as the closest proxy (he works at Vercel).

### Overall Confidence: MEDIUM-HIGH
Strong primary sources for the 3 anchors (Rauno, Emil, Linear) and Superhuman's PMF framework. Thinner data on several secondary products (Granola, Arc, Notion Calendar, studios). Beamix-specific recommendations are opinionated synthesis, not sourced precedent — they need design team validation.
