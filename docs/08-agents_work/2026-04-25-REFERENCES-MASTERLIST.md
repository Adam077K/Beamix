# Beamix References Master List — 2026-04-25

The visual + interaction library Beamix follows. Synthesized from 5 reference reports.
Status: APPROVED — feeds directly into Beamix Vision Document.

Sources synthesized:
- `2026-04-25-REFS-01-handdrawn-animation.md` — hand-drawn animation in products
- `2026-04-25-REFS-02-agent-flow-sidepanel.md` — agent flow visualizations
- `2026-04-25-REFS-03-url-scan-onboarding.md` — URL/scan/onboarding patterns
- `2026-04-25-REFS-04-customer-fit-duality.md` — fit-for-customer duality
- `2026-04-25-REFS-05-hebrew-rtl.md` — Hebrew/RTL B2B references
- `2026-04-25-DECISIONS-CAPTURED.md` — Adam's locked decisions

---

## EXECUTIVE READ

Beamix steals from a tight set of seven anchors. From **Claude.ai** we copy the hand-drawn idiom restricted to thinking/idle/artifact states and the asterisk family as the "voice of the brand" across surfaces. From **Excalidraw + Rough.js** we take the entire technical foundation for sketchy shapes plus the proof that hand-drawn is compatible with B2B trust. From **Linear** we copy three things at once: the Agent Interaction Guidelines (four discrete agent states, immediate "thinking" pill, expand-for-detail), the customer-fit duality (Cmd+K, `?` cheat sheet, single-letter shortcuts, calmer chrome) and the post-March-2026 visual restraint that lets bursts of personality land harder. From **Perplexity Pro Search** we copy the narrative scan pattern — vertical step list with gerund verbs, one breathing step at a time, expandable per-stage detail, citation favicons as proof of progress. From **Notion (+ Notion AI by BUCK)** we copy onboarding morph (interface previews itself as user types) and the deferred character-register architecture for when Beamie returns. From **Stripe Dashboard** we copy summary→detail→raw data layering and the rule that every number is clickable. From **Wix** we copy the Hebrew-first-not-Hebrew-translated mindset — full dashboard RTL flip, account language vs. site language separation, native bidirectional handling. Surrounding these we adopt 12 secondary references (tldraw + perfect-freehand, PostHog Max, Manus, Devin, ChatGPT Agent, Replit Agent ✓/→ markers, Speedtest count-up gauge, Plaid Link branded transitions, Granola live indicator, rough-notation, AG-UI events spec, Notion Calendar restraint) as pattern donors. Beamie/character work is deferred but architected for; until then Beamix's "voice of the brand" is the hand-drawn primitive itself, never a mascot.

---

## THE BEAMIX DESIGN LANGUAGE — 12 RULES

Cross-reference synthesized rules. Each rule has 1 line + which references support it.

1. **Hand-drawn lives only on thinking-state, idle, and artifact surfaces — never on chrome, settings, or data tables.** — Sources: Claude.ai (REFS-01 §1), PostHog Max in toolbar+help only (REFS-01 §5), Linear's calmer-chrome philosophy (REFS-01 §13), tldraw static-when-not-used (REFS-01 §3).
2. **One breathing focal point at a time. The active step pulses; everything else is muted or future-faded.** — Sources: Perplexity Pro one-active-step (REFS-02 Anchor 1), Devin "Devin is thinking…" pulsating element (REFS-02 Anchor 3), Linear AIG four-states-no-spinner (REFS-02 Anchor 4).
3. **Steps are vertical lists of gerund verbs in plain language — never node graphs, never tool-call JSON, never noun-phrase phases.** — Sources: Perplexity step list (REFS-02 Anchor 1), Linear AIG verb labels (REFS-02 Anchor 4), Replit Agent ✓/→ everyday language (REFS-02 §12), the "single design move" thesis of REFS-02.
4. **Progressive disclosure via chevron everywhere. Default = clean; expand = technical truth one click deep. No "Pro mode" toggle.** — Sources: Stripe summary→detail→raw (REFS-04 Anchor 3), Linear AIG expand-for-detail (REFS-02 Anchor 4), ChatGPT Agent collapsed→expanded→summary sheet (REFS-02 Anchor 5), Notion progressive disclosure (REFS-04 Anchor 2).
5. **Real engine logos inside hand-drawn frames. The contrast IS the brand.** — Sources: REFS-02 §The hand-drawn aesthetic translation, Excalidraw rough-frame around real content (REFS-01 §2), Plaid per-step branded loading (REFS-03 Anchor 4).
6. **Streaming partial state always beats all-or-nothing reveal. Sub-1s time-to-first-visible-response.** — Sources: Vercel v0 (REFS-01 §7), Cursor 2.0 (REFS-01 §8), Replit Ghostwriter inline (REFS-01 §9), tldraw computer streaming (REFS-01 §3), Cloudflare live-fill chart (REFS-03 §11).
7. **Status copy is part of the animation. Active verb, ellipsis, change. Rotates every ~1.5s among 3-4 plain-language messages.** — Sources: Claude "ruminating/lollygagging/Sketching…" (REFS-01 §1), Devin specific narration strings (REFS-02 Anchor 3), micro-text rotation in Beamix scenarios (REFS-02 §The "is the agent thinking" cue).
8. **Numbers, pills, badges, charts — every aggregate is clickable. Drill down is the navigation.** — Sources: Stripe Dashboard clickable numbers (REFS-04 Anchor 3, Principle 10), Hebbia Matrix cell-streaming (REFS-01 §12, REFS-02 §6), Linear status pills as bulk-filter views (REFS-04 Principle 10).
9. **Templates as canvas, not a separate product. Industry preset is the same dropdown as "Custom".** — Sources: Notion templates teach by being editable (REFS-04 Anchor 2, Principle 4), Pitch templates do duality work (REFS-04 §15), Beamix industry-tuned scan profiles (REFS-04 §5 design moves).
10. **One universal command palette (Cmd+K) is the entire app's escape hatch. `?` opens cheat sheet anywhere.** — Sources: Linear (REFS-04 Anchor 1, Principle 5), Raycast (REFS-04 Anchor 4), Stripe (REFS-04 Anchor 3), Superhuman (REFS-04 Anchor 5), Notion Calendar (REFS-04 §16).
11. **Hebrew/RTL is first-class, not bolted on. Sidebar flips, fonts swap to Rubik+Heebo, microcopy is transcreated, dates use he-IL, currency is ₪ before number.** — Sources: Wix full dashboard RTL flip (REFS-05 Anchor 1), Google Israel Goliath project (REFS-05 Anchor 2), monday.com cautionary partial RTL (REFS-05 Anchor 3), shadcn/ui RTL native (REFS-05 Anchor 5).
12. **Restraint is the multiplier. Hand-drawn personality only works because the rest of the UI is calm.** — Sources: Linear March-2026 UI refresh (REFS-01 §13), Notion Calendar buttery-but-quiet (REFS-01 §16), Anthropic "geometric and stylized" not photorealistic (REFS-01 Pattern 6), Stripe "no exclamation points, no PRO TIP badges" (REFS-04 Anchor 3).

---

## THE 7 ANCHOR PRODUCTS WE FOLLOW MOST

For each: 1 paragraph WHY + 5-7 SPECIFIC PATTERNS to copy with source URLs.

### 1. Claude.ai (Anthropic) — hand-drawn animation register

**Why:** Closest existing reference to Adam's vision. Anthropic chose a hand-drawn idiom inside a serious enterprise tool, restricted strictly to thinking states + idle marks + sketchy artifacts. They never let it overpower the data. Specifics are well documented (Kyle Martinez teardown). This is Beamix's permission slip to ship a hand-drawn surface to a B2B audience without losing trust. (REFS-01 Anchor 1.)

**Patterns to copy:**
- The asterisk family `· ✻ ✽ ✶ ✳ ✢` as the brand mark for "thinking", with first/last frame held longer than middle frames — a custom ease the eye reads as "breath." [https://medium.com/@kyletmartinez/reverse-engineering-claudes-ascii-spinner-animation-eec2804626e0]
- Hand-drawn spinner on web, ASCII spinner in CLI — same rhythm across two surfaces. [Kyle Martinez teardown, same URL]
- Status copy ("Sketching…", "ruminating", "lollygagging") rotates as part of the animation; humans read text + visual as one composite signal. [http://www.olahungerford.com/drawing-and-animating-with-claude/]
- Sketched artifact previews — softer, almost paper-like surface vs. the sharp outer chat UI. Clear figure/ground separation. [Hungerford notes, same URL]
- Restraint everywhere else — settings, account, history, payment surfaces are crisp, no doodles. [https://claude.ai/login]
- Frame-hold easing: keyframe times `[0, 0.05, 0.5, 0.95, 1]` so first and last frames hold ~30% longer. [Martinez teardown]

### 2. Excalidraw + Rough.js — visual library + technical foundation

**Why:** Existence proof that "sketchy" is compatible with B2B trust at scale. Excalidraw renders an entire UI in a hand-drawn idiom and is used for serious enterprise architecture diagrams every day. The aesthetic is achieved with one library (Rough.js, <9KB gzipped, MIT) plus one font (Excalifont, OFL). That's the recipe. (REFS-01 Anchor 2; REFS-03 Anchor 2.)

**Patterns to copy:**
- Rough.js as the visual primitive everywhere — every rectangle, ellipse, arrow, polygon goes through the sketchy renderer. [https://roughjs.com/]
- Stroke styles as user choice: solid / dashed / dotted / hand-drawn — hand-drawn is one of four equally legitimate options, not the default. [https://tldraw.dev/features/composable-primitives/drawing-and-canvas-interactions]
- Excalifont (OFL-1.1) selectively applied to drawn callouts, empty-state messages, animation captions — never data tables. [https://plus.excalidraw.com/excalifont]
- Tunable `roughness` parameter (0=clean, 2=very sketchy) per surface — settings page = roughness 0; agent execution panel = roughness 1.5. [https://roughjs.com/]
- No noise-texture paper overlays — irregularity of strokes implies paper, cleaner and faster than texture overlays. [Excalidraw observed behavior, https://excalidraw.com]
- Always set `seed` parameter — otherwise the same shape redraws differently on every render and feels glitchy, not hand-drawn. [REFS-01 anti-pattern §7]
- SVG output (not Canvas) — animatable, accessible, scalable. [https://github.com/rough-stuff/rough]

### 3. Linear — agent flow + customer-fit duality + restraint

**Why:** Linear is the only major SaaS to publish a formal Agent Interaction Guidelines spec; it is also the gold-standard duality product (non-technical PMs and senior engineers use the same surface); and its March-2026 UI refresh is the canonical case study in how restraint amplifies bursts of personality. Three reports point at Linear independently — that's the signal. (REFS-02 Anchor 4; REFS-04 Anchor 1; REFS-01 §13.)

**Patterns to copy:**
- Agents have four discrete states: thinking, waiting for input, executing, finished. One pill, four colors. No fifth state. [https://linear.app/developers/aig]
- "Thinking" indicator appears immediately on agent invocation, not after first tool call — latency-zero acknowledgment. [https://linear.app/changelog/2025-07-30-agent-interaction-guidelines-and-sdk]
- Detail-on-demand: collapsed activity rows show the headline; expanded rows show every step of the agent's thought process. [https://linear.app/developers/agent-interaction]
- Cmd+K is THE single mental model — create, search, navigate, change status. `?` opens cheat sheet anywhere. Single letters (C, E, X) for most-used actions. [https://linear.app/changelog/2021-03-25-keyboard-shortcuts-help]
- Multiple paths to the same action — button, contextual menu, keystroke, command palette. Right-click menu shows the keystroke next to each label. [https://medium.com/linear-app/invisible-details-2ca718b41a44]
- Calmer chrome, sharp content — soft contrast on borders, dimmed sidebar so main content stands out, fewer-but-more-meaningful icons. [https://linear.app/now/behind-the-latest-design-refresh]
- "Invisible details" philosophy — confidence comes from polish, not from showing off. [https://medium.com/linear-app/invisible-details-2ca718b41a44]

### 4. Perplexity Pro Search — narrative scan + step-by-step transparency

**Why:** Most refined step-list pattern in production, tested on tens of millions of non-technical users. Henry Modisett (Head of Design): *"users were more willing to wait for results if the product would display intermediate progress."* The list-of-stages metaphor needs zero teaching — it's already what humans use for to-do apps, recipe steps, and shipping trackers. Beamix's 7-engine scan reveal is essentially "Perplexity Deep Research, hand-drawn." (REFS-02 Anchor 1; REFS-03 Anchor 1.)

**Patterns to copy:**
- Vertical list of named stages with leading icon + plain-language label ("Understanding your question", "Searching the web", "Reading 8 sources", "Analyzing", "Synthesizing"). [https://www.perplexity.ai/hub/blog/introducing-perplexity-deep-research]
- One active step at a time, marked by a soft breathing pulse. Previous steps get checkmark; future steps fade in. [https://www.langchain.com/breakoutagents/perplexity]
- Each step expandable via chevron — collapsed by default. Expansion reveals queries run, URLs read. [https://www.nngroup.com/articles/perplexity-henry-modisett/]
- Citations as favicon chips in horizontal scroll under each step — visual proof of progress without text. [https://www.franciscomoretti.com/blog/comparing-deep-research-uis]
- Step labels are gerund verbs in user's language ("Searching", "Reading", "Analyzing") — never noun phrases ("Source acquisition phase"). [Modisett interview, NN/g link]
- After completion, plan panel collapses to one-line summary, re-expandable as audit trail. [Perplexity blog]
- Don't overload with information until the user is curious — "then feed their curiosity." [https://www.langchain.com/breakoutagents/perplexity]

### 5. Notion (+ Notion AI by BUCK) — onboarding morph + character register if Beamie returns

**Why:** Two patterns Beamix needs from one product family. Notion proper gives us the real-time interface morphing pattern: as users define intent during onboarding, the interface preview morphs in real-time, offering a tangible glimpse of what their workspace will look like. This is the closest analog to "user types URL → outline of their dashboard sketches itself in." Notion AI (built by BUCK in Rive) gives us the deferred architecture for Beamie when she returns: eyes + brows + nose only, state-machine driven, contained to AI surfaces. (REFS-03 Anchor 5; REFS-01 Anchor 4.)

**Patterns to copy:**
- Real-time interface morphing during onboarding — interface preview reflects user's stated intent before they finish typing. [https://www.candu.ai/blog/how-notion-crafts-a-personalized-onboarding-experience-6-lessons-to-guide-new-users]
- Job-based intent at signup ("plan project / build wiki / personal tasks") routes to template gallery. [https://goodux.appcues.com/blog/notions-lightweight-onboarding]
- Templates teach by being editable — power features encountered as cells, not as separate documentation. [https://venue.cloud/news/insights/from-signup-to-sticky-slack-notion-canva-s-plg-onboarding-playbook]
- One primitive (the block) scales infinitely — paragraph for novice, database for power user. Slash command `/` as universal escape hatch. [https://medium.com/design-bootcamp/how-notion-uses-progressive-disclosure-on-the-notion-ai-page-ae29645dae8d]
- (Deferred) Notion AI character: reduce to essentials — no body, no full face, just eyes + brows + nose. Cel-drawn frames as source. [https://buck.co/work/notion-ai]
- (Deferred) State machine architecture so expressions layer — "thinking + indicating progress" is a combination of atoms, not a separate clip. [https://help.rive.app/runtimes/state-machines]
- (Deferred) Constrained location — character lives where the AI lives, never on every page. [https://the-brandidentity.com/project/how-buck-gave-notions-ai-assistant-a-hand-drawn-personality]

### 6. Stripe Dashboard — summary→detail→raw layering + clickable numbers

**Why:** First-time founder reads "Today's revenue: $1,420." F500 finance team runs Sigma queries on the same data. Same product. Same screen. The user just clicks deeper. This is the single best example of fit-for-customer duality on a financial dashboard, which is exactly the genre Beamix lives in (Beamix Score → 9-engine breakdown → query-level → raw model output). (REFS-04 Anchor 3.)

**Patterns to copy:**
- Summary → detail → raw layering. Top: "How am I doing?" Next: "Why?" Deepest: raw event JSON. [https://mattstromawn.com/projects/stripe-dashboard]
- Numbers are clickable — every metric drills into underlying transaction list with full filters. [https://medium.com/swlh/exploring-the-product-design-of-the-stripe-dashboard-for-iphone-e54e14f3d87e]
- Calm technology — no exclamation points, no "PRO TIP" badges, no urgency. [Stripe Dashboard observed]
- Search bar IS the navigation — Cmd+K finds charge by ID, email, or amount. [Matt Strom case study]
- Code snippets are context-aware — devs see the actual API key; founders don't see code at all. [Stripe Dashboard observed]
- Test/live mode is the ONE acceptable mode toggle — it's about safety, not capability. Beamix has no equivalent toggle; we don't need one. [Stripe Dashboard observed]
- Skeleton screens as restraint benchmark — subtle gradient sweep, low-contrast gray placeholders matching layout exactly. Beamix inverts the aesthetic but keeps the discipline. [REFS-03 §5]

### 7. Wix — Hebrew-first product UX (Israeli reference)

**Why:** Wix is Israeli, supports Hebrew as a first-class language since day one, and ships full RTL across editor, dashboard, and account management. Bidirectional text (Hebrew paragraph with English brand names) is a core product feature, not an afterthought. They are the existence proof that a product can be Hebrew-native and global at the same time. monday.com is the cautionary anti-reference (partial RTL, emails stuck in LTR, font stack lacks Hebrew glyphs). (REFS-05 Anchor 1.)

**Patterns to copy:**
- Account language vs. site language separation — user can have Hebrew dashboard but build English content (and vice-versa). [https://support.wix.com/en/article/wix-multilingual-using-multi-state-boxes-to-switch-from-ltr-to-rtl]
- Full dashboard RTL flip — sidebar moves to right, content flows RTL, not just text. [https://support.wix.com/en/article/languages-available-in-the-wix-site-builders]
- Mixed-content handling as a core feature — Hebrew paragraph with embedded English brand names, treated as bidi-isolated runs. [Wix help article]
- Curated Hebrew font library accessible from the editor — Hebrew users never have to find Hebrew fonts themselves. [Wix help article]
- Customer support operates in Hebrew — the product's voice, not just translated UI. [Wix help article]
- Progressive RTL rollout pattern — ship core dashboard first, then expand to forms/emails/exports. (Caveat: don't stop halfway like monday.com; the gap is visible.) [REFS-05 anti-references §12]
- Israeli-conventional defaults: NIS currency display with ₪ prefix, DD/MM/YYYY dates, 05X phone formatting. [https://bit.co.il observation]

---

## THE TYPOGRAPHY STACK (LOCKED)

```
English:
  Display:        InterDisplay-Medium (500-700)
  Body:           Inter (400-600)
  Code/mono:      Geist Mono — logs, code blocks, raw agent output

Hebrew:
  Display:        Rubik (variable, weights 500-700)
  Body:           Heebo (variable, weights 400-600)
  Serif accent:   Frank Ruhl Libre (400-700) — testimonial / dark sections only

Animation/sketch accent (UI accent only):
  Excalifont (OFL) — drawn callouts, empty-state messages, animation captions

Tabular numerals: REQUIRED on all data — score numbers, rank numbers, prices.
                  Use `font-feature-settings: "tnum"` on every numeric surface.
All sizes: rem units. Never px.
```

Sources:
- Inter / InterDisplay — already locked in `CLAUDE.md` and brand guidelines (BRAND_GUIDELINES v4.0).
- Rubik (Hebrew display) — [https://fonts.google.com/specimen/Rubik] · [https://sadan.com/rubik.html] · OFL-1.1.
- Heebo (Hebrew body) — [https://fonts.google.com/specimen/Heebo] · [https://github.com/OdedEzer/heebo] · OFL.
- Frank Ruhl Libre (Hebrew serif) — [https://fonts.google.com/specimen/Frank+Ruhl+Libre] · OFL.
- Excalifont — [https://plus.excalidraw.com/excalifont] · OFL-1.1, ~150KB woff2.
- Geist Mono — already in stack.

**Rules:**
- Hebrew typography stack triggers automatically on `dir="rtl"`; English stack on `dir="ltr"`.
- Numbers in any language stay Western Arabic (0-9) — Unicode Bidi Algorithm handles direction.
- Hebrew text never uses Excalifont (no Hebrew glyphs, would fall back inconsistently).
- Code/mono stays Geist Mono regardless of language — code is always LTR.
- Subset Hebrew fonts to Unicode block U+0590-05FF + U+FB1D-FB4F to keep payload under 30KB per font.

---

## THE COLOR SYSTEM (LOCKED)

```
Brand accent (primary):          #3370FF
Brand accent (text on white):    #2558E5  ← use this when contrast is required;
                                            #3370FF on white fails WCAG AA for body text
Canvas (warm off-white):         #F5F3EE
Canvas (pure white surfaces):    #FFFFFF
Ink (primary text):              #0A0A0A
Muted text:                      #6B7280  (warm gray)
Border/card surface:             #E5E7EB

Semantic (score data):
  Excellent:                     #06B6D4
  Good:                          #10B981
  Fair:                          #F59E0B
  Critical:                      #EF4444

Dark mode primary:               #5A8FFF
```

**Rules:**
- `#3370FF` is the only accent color in the product. No orange, no cyan-as-accent, no navy, no #6366F1 indigo. (Retired in BRAND_GUIDELINES v4.0.)
- Brand accent on white text is forbidden — use `#2558E5` for text contrast.
- Semantic colors only on score data — never on chrome, never on links, never on icons. The score color tells the user "good/bad"; color elsewhere tells nothing.
- `#3370FF` on the active step's breathing pulse is the only place the accent moves in product chrome — it is the visual signal of "alive."
- Hand-drawn strokes default to neutral gray `#6B7280`. Active step's hand-drawn frame uses `#3370FF`. Completed steps use muted blue `#2558E5` at 60% opacity.

Source: REFS-01 §The hand-drawn aesthetic translation, REFS-02 §Color, BRAND_GUIDELINES.md v4.0 (2026-03-30 update).

---

## THE ANIMATION TECH STACK (LOCKED)

| Tool | License | Size | Use for |
|------|---------|------|---------|
| **Framer Motion** | MIT | ~50KB | UI animation primitives — path-draw via `pathLength` 0→1, layout transitions, stagger. Already in stack. |
| **Rough.js** | MIT | <9KB gzipped | Hand-drawn rectangles, lines, arcs, circles. The visual primitive everywhere. |
| **perfect-freehand** | MIT | ~5KB | Sketchy strokes — agent strokes, signatures, the "magnifying glass wobble" in the URL scan. |
| **rough-notation** | MIT | small | Hand-drawn underlines / circles / brackets / highlights for callouts. One annotation per screen, max two. |
| **Excalifont** | OFL-1.1 | ~150KB woff2 | Accent typography for animation surfaces (callouts, empty-state messages). Never on data tables. |
| **next-intl** | MIT | ~2KB client | i18n routing, server-component native, Hebrew translations rendered server-side. |
| **shadcn/ui RTL** | MIT (vendored) | — | `rtl: true` in `components.json` — single toggle enables RTL transformation across all components. |
| **Lottie (lottie-react)** | MIT | ~250KB | RESERVED for ONE celebration moment per session (e.g., scan-complete toast). Never empty states, never loading. |
| **Rive runtime** | MIT runtime | ~150KB + per-`.riv` | DEFERRED — only when Beamie returns. Architect for it; don't ship it yet. |
| **GSAP DrawSVGPlugin** | club GreenSock (paid) | ~30KB | Not adopted unless Framer Motion can't handle a >5-path scene. Default = no. |

Source: REFS-01 §Open-Source Tools, REFS-03 §Implementation pattern, REFS-05 §Implementation Notes.

**Hard rules:**
- All hand-drawn rendering uses a fixed `seed` parameter on Rough.js / perfect-freehand. Otherwise re-renders look glitchy, not hand-drawn.
- Path-draw entry default duration: **700-1200ms** for short marks, up to **2500ms** for long chained illustrations.
- Always set `strokeLinecap: round` and `strokeLinejoin: round` on hand-drawn paths.
- Stagger between chained lines: **50-120ms** (Disney "follow-through" timing).
- Idle micro-loop cycle: **800-1200ms** with first/last-frame hold for the "breath" feel.
- Stroke-width jitter: **3-7%** variation across the line (perfect-freehand `thinning: 0.5` default).
- Motion below 250ms = invisible, no value. Above 2500ms = blocks user, feels broken. Sweet spot is 500-1200ms for one-shot reveals.
- `prefers-reduced-motion` MUST snap straight to end-state; no animation loop.

---

## THE 5 BEAMIX SIGNATURE MOTIONS

Consolidated from research. These are the only motion shapes that are part of "the Beamix product" — anything outside this list is UI chrome and uses default shadcn transitions.

### 1. First Scan Reveal (15-17 seconds, 10 frames)
The full storyboard lives in REFS-03 §The Beamix First Scan Reveal — 10-Frame Storyboard. It is the public marketing moment + the trial-conversion engine. Built entirely in Rough.js + Framer Motion.

- **Frame 1 (0-1.5s):** User typing URL — pencil-stroke entrance per char, Rough.js underline extends as URL grows.
- **Frame 2 (1.5-2.8s):** Hand-drawn rectangle sketches itself around URL, 4 sides sequential, ~600ms each, slightly overlapping.
- **Frame 3 (2.8-4.5s):** Line draws from URL down-left to a circular bubble; favicon pings in; company name types itself.
- **Frame 4 (4.5-6.5s):** 7 engine bubbles sketch themselves into asymmetric scribbled orbit (NOT a perfect circle), ~200ms each.
- **Frame 5 (6.5-11s):** ← longest stage. Each engine bubble pulses in stagger. Scribbled arrow flies out, returns. Sample query line types-then-erases above each engine. Bubble fills with thin progress arc.
- **Frame 6 (11-12.5s):** Each completed engine emits filled-dot/empty-dot pellets flying back to center URL bubble. Counter ticks "Mentions found: 3 / 7."
- **Frame 7 (12.5-13.5s):** Hand-drawn score arc sketches in. Numeric counter ticks 0 → final score (Speedtest-style count-up). Arc fills synchronously, color = semantic score color.
- **Frame 8 (13.5-15s):** Result blocks reveal. Rough.js skeleton outlines snap in INSTANTLY (do not animate the outlines drawing). Content cascades in via 150ms staggered fade-in-from-below.
- **Frame 9 (15-16s):** Top recommendation card pulses once with Beamix-Blue glow. Hand-drawn arrow scribbles around its CTA. 1s emphasis, then fade.
- **Frame 10 (16-17s):** Sticky bottom bar slides in with "Save these results & let Beamix fix them →" CTA. Arrow micro-bounces every 4s thereafter.

Anti-patterns: outlines AND content animating simultaneously (eye doesn't know where to land). Tech-jargon status messages ("Querying API endpoint…"). Generic spinner. Email-gated reveal. (REFS-03 §Anti-Patterns.)

### 2. Agent Step List (workspace side panel)
Vertical step list, 360px wide, default-open during run, auto-collapses 8s after completion to a "Did 6 steps in 47s" summary card. Per REFS-02.

- **Active step:** breathing pulse on the Rough.js circle's stroke (CSS `@keyframes` modulating `stroke-opacity` 0.5 ↔ 1 over 1400ms — "breathing rhythm of thinking, not spinning").
- **Future steps:** 30% opacity. Visible but receded.
- **Completed steps:** 100% opacity, hand-drawn checkmark inside the circle, label muted gray.
- **Connecting line:** while step N is running, the line BELOW step N draws progressively via animated `stroke-dashoffset`. Visual equivalent of "advancing."
- **Step labels:** gerund verbs in plain language ("Reading your website", "Asking ChatGPT", "Comparing what each AI said"). Never noun phrases. Never tool-call JSON.
- **Engine logos:** real, official ChatGPT/Gemini/Perplexity/Claude logos inside hand-drawn Rough.js circles. The contrast is the brand.
- **Micro-text rotation:** every ~1.5s under the step label, 3-4 plain-language messages ("Asking…" → "Waiting for ChatGPT…" → "Reading the answer…" → "Got it.").

Source: REFS-02 §The Beamix Agent Flow Pattern + §Six-Step Template.

### 3. Score Gauge Fill (count-up + arc, hand-drawn)
The climax of the First Scan Reveal Frame 7, also reused on every subsequent dashboard score render.

- Hand-drawn semicircle arc sketches in via Rough.js (`pathLength` 0→1, ~600ms ease-out).
- Numeric counter ticks rapidly from 0 to final score in InterDisplay (NOT handwritten — readability is critical at the climax). Tabular numerals required.
- Arc fills synchronously beneath the counter; fill color is the semantic score color (#EF4444 → #F59E0B → #10B981 → #06B6D4).
- Total duration: ~1000ms. Same Speedtest "needle-sweep + count-up" pattern, hand-drawn.

Source: REFS-03 Frame 7, REFS-03 Anchor 3 (Speedtest), REFS-03 §11 (Fast.com number-as-hero).

### 4. Skeleton Block Cascade
Anywhere result data lands. Replaces every traditional skeleton-shimmer in Beamix.

- Rough.js outlines snap in instantly — they do NOT animate drawing. (Hard rule; if both outlines and content animate, the eye doesn't know where to land.)
- Inside each outline, content cascades in via Framer Motion `staggerChildren: 0.15s`, each child opacity 0→1 + translateY 8→0, 280ms ease-out.
- Sub-stagger inside each block: header text fades in first, body content 100ms after, metadata 200ms after.
- Outline strokes are Rough.js sketches at low roughness (0.8-1.0) — NOT standard gray rounded rectangles. This is the visual signature.

Source: REFS-03 §Results Reveal Patterns + §Implementation pattern (Beamix-specific).

### 5. Path-Draw Entry
The universal "this thing is appearing" motion across the product. Used on hand-drawn icons, illustrations, scribbled arrows, drawn callouts.

- Animate `pathLength` 0 → 1 (Framer Motion) or `stroke-dashoffset` length → 0 (CSS).
- Default ease: `easeInOut`.
- Duration: 700-1200ms for short marks; up to 2500ms for chained illustrations.
- Always `strokeLinecap: round` and `strokeLinejoin: round`.
- Stagger between chained lines: 50-120ms.
- For chained illustrations, set `seed` so the strokes are stable across renders.

Source: REFS-01 §Pattern 1, [https://motion.dev/docs/react-svg-animation], [https://blog.noelcserepy.com/how-to-animate-svg-paths-with-framer-motion].

---

## THE 12 DUALITY PRINCIPLES (Sarah/Yossi paradigm)

From REFS-04 §The 12 Duality Principles. Each principle has 1 specific Beamix application.

1. **Sensible defaults that 80% accept without thinking.** → Beamix industry preset auto-selected from URL inference (e.g., dental practice → loads dental query templates + FAQ schema preset). Yossi can override; Sarah never knows there was an override.
2. **Power moves discoverable through interaction, not settings.** → Right-click on a recommendation card shows the keystroke `R` (run) next to the label. Cmd+K opens palette. No "advanced settings" page.
3. **Plain-language surface, technical truth one layer deeper.** → Top label: "Visibility score: 42." Click → "Mentioned in 31% of relevant queries." Click → raw query log per engine.
4. **Templates for the new user, raw canvas for the expert.** → Industry-tuned scan profiles (Dental, Restaurant, Law firm, Custom) — same dropdown contains presets AND "Custom."
5. **One universal command (Cmd+K) is the entire app's escape hatch.** → Cmd+K from anywhere: "run agent" / "find competitor" / "go to scan #123" / "approve top 5."
6. **Empty states teach by doing, not lecturing.** → Empty Inbox = "No suggestions yet — your first scan will fill this." with a scan-now CTA. NOT a tutorial popup.
7. **Multiple paths to the same action.** → Run a recommendation: button on card / `R` keystroke / Cmd+K palette / right-click menu. All four paths reach the same action.
8. **Keystroke is shown next to the click target.** → Every button label shows its keystroke on hover (e.g., "Approve" with `A` floating to the right).
9. **The `?` key is sacred.** → `?` from anywhere opens the cheat sheet overlay with all single-letter shortcuts and Cmd+K commands.
10. **Numbers and pills are clickable.** → Beamix Score 42 → 9-engine breakdown. Engine pill "Gemini" → query-level data. Competitor name → competitor profile. Recommendation badge → recommendation detail with edit + run.
11. **No jargon on the front lawn — technical truth one click away.** → Home view: "Top fix." Deeper view: "FAQPage schema, JSON-LD." Translation is the product's job.
12. **Onboarding is "your first win in 60 seconds."** → The free public scan IS the onboarding. The user types a URL and watches the 15-17s scan unfold. They've experienced the product before they sign up.

Source: REFS-04 §The 12 Duality Principles + §Beamix-Specific Recommendations.

---

## THE RTL/HEBREW DESIGN RULES

Eight rules that make Hebrew/RTL first-class, not bolted on.

1. **CSS logical properties everywhere.** Use `margin-inline-start` not `margin-left`, `inset-inline-start` not `left`, `text-align: start` not `text-align: left`. Same code serves both directions. [https://m2.material.io/design/usability/bidirectionality.html]
2. **Locale-aware Beamie position (when Beamie returns).** Bottom-right in LTR, bottom-left in RTL. Same applies to FAB buttons, toast notifications (slide in from inline-start), and side drawers.
3. **Stage storyboard mirrors for RTL.** First Scan Reveal Frames 4-6 reverse arc direction — engine bubbles arrange clockwise from the right when `dir="rtl"`. The drawn arrows flip too. Build with logical properties so the storyboard mirrors automatically.
4. **Hebrew typography stack triggers automatically on `dir="rtl"`.** `<html dir="rtl">` swaps body classes from `font-inter` to `font-heebo`, headings from InterDisplay to Rubik. Documented in `apps/web/app/layout.tsx` per REFS-05 §Implementation Notes.
5. **Hebrew is gender-neutral by default.** Use infinitive forms ("הפעלת סריקה" / "Activating a scan") or plural-you ("שפרו" / "you-plural improve") — NEVER male imperatives ("סרוק"), NEVER bavu netchil with slashes ("לחץ/י"). Per Google Israel Goliath project. [https://medium.com/@Kinneret/a-glimpse-into-google-israels-great-language-and-localization-update-project-9fa83f4489c9]
6. **Mixed Hebrew + English uses bidi-isolation.** Hebrew sentence with embedded English brand name "Beamix" gets `<bdi>Beamix</bdi>` so the Bidi Algorithm renders it predictably. Rule applies to Hebrew + ChatGPT, Hebrew + URLs, Hebrew + emails.
7. **Numbers stay Western Arabic (0-9), embedded in RTL flow.** "80% מהלקוחות" not "שמונים אחוז." Phone numbers display LTR within RTL context (054-123-4567). URLs and emails always LTR.
8. **Tabular numerals work for both directions.** `font-feature-settings: "tnum"` is direction-agnostic. All score numbers, prices, ranks use tabular numerals so they align in tables regardless of locale.

**Israeli formatting defaults:**
- Dates: `DD/MM/YYYY` or `25 באפריל 2026` via `Intl.DateTimeFormat('he-IL')`.
- Currency: `₪79/חודש` (₪ before number) — NOT `79₪` and NOT `$79`.
- Phone: `054-123-4567`.
- Day names: Hebrew ("יום שני") via `Intl.DateTimeFormat('he-IL', { weekday: 'long' })`.

Source: REFS-05 §RTL UI Mirror Rules + §Numerals and Mixed Content + §Implementation Notes for Beamix.

---

## THE 20 BEAMIX HEBREW MICRO-COPY TRANSLATIONS (LOCKED — pending native review)

| # | English (EN) | Hebrew (HE) | Notes |
|---|--------------|-------------|-------|
| 1 | AI Visibility Score | ציון נראות ב-AI | NOT "בינה מלאכותית" — too formal/long. Keep "AI" in English. |
| 2 | Run a Scan | הפעלת סריקה | Infinitive, gender-neutral. NOT "סרוק" (male) or "סירקי" (female). |
| 3 | Inbox / Review | תיבת דואר / לבדיקה שלך | "לבדיקה שלך" feels more natural than literal "סקירה." |
| 4 | Recommendations | המלצות | Established. Works perfectly. |
| 5 | Agents / Crew | הצוות שלך | "הצוות" (your team) is warmer than literal "סוכנים." |
| 6 | Connect Your Business | חיבור העסק שלך | Infinitive. Or plural imperative "חברו את העסק שלכם." |
| 7 | Dashboard | לוח בקרה | Established Hebrew tech term. |
| 8 | Settings | הגדרות | Standard. No debate. |
| 9 | Scan Results | תוצאות הסריקה | Clean, direct. |
| 10 | Content Optimizer | אופטימיזציית תוכן | Mix is natural. "אופטימיזציה" is borrowed and universal. |
| 11 | Competitor Analysis | ניתוח מתחרים | Standard business Hebrew. |
| 12 | Your AI Search Visibility | הנראות שלך בחיפוש AI | Possessive + "נראות" + "בחיפוש AI." |
| 13 | Get Started | בואו נתחיל | "Let's start" — inclusive, gender-neutral. Per Google Israel pattern. |
| 14 | Upgrade Plan | שדרוג מסלול | "שדרוג" + "מסלול" (established for pricing tiers). |
| 15 | Trial Period | תקופת ניסיון | Standard. |
| 16 | Monthly / Annually | חודשי / שנתי | Pricing format: ₪79/חודש (NOT חודש/₪79). |
| 17 | Notifications | התראות | Standard. |
| 18 | Search Engines | מנועי חיפוש | Well-established. |
| 19 | Mentioned / Not Mentioned | מוזכר / לא מוזכר | For scan results. |
| 20 | Improve Your Ranking | שפרו את הדירוג שלכם | Plural imperative (gender-neutral). |

**GEO-specific terms** (kept in English where industry hasn't settled Hebrew):
- GEO → GEO (ג'יאו) — keep English; no Hebrew equivalent yet.
- AI Overview → AI Overview — Google's product name.
- Entity Authority → סמכות יישות — used by Israeli GEO practitioners (Nati Elimelech).
- Structured Data → מידע מובנה — established.
- Citations → ציטוטים — standard.

**Pending validation:** Native Hebrew UX writer review (Kinneret Yifrah / nemala.co.il is the canonical Israeli reviewer; AlefAlefAlef foundry for Hebrew typography polish).

Source: REFS-05 §Beamix UI Voice in Hebrew + §GEO-Specific Hebrew Vocabulary.

---

## THE PUBLIC FREE SCAN — DESIGN ENVELOPE

Synthesizing REFS-03 + REFS-04 + REFS-01.

- **Total duration:** 15-17 seconds. Sweet spot from Speedtest/Plaid attention-budget research. Below 12s = users don't feel the work; above 20s = abandonment.
- **Storyboard:** the 10-frame sequence in §The 5 Beamix Signature Motions / Motion 1 above.
- **No signup gate.** The free public scan completes without auth. CTA at the end (Frame 10) leads to signup. Every direct competitor (Otterly $29/mo, Peec €89/mo, Profound $499+/mo) requires signup first; the free public scan is the acquisition wedge per REFS-03 §13-15.
- **Resync guarantee:** the scan IS synchronous. No email-gated async reveal (Ahrefs anti-pattern). User watches the 15-17s and sees results immediately.
- **Result expiry:** 30 days, accessible by URL with `?scan_id=` parameter. Onboarding flow detects this param and links the public scan to the new user account.

**Anti-pattern list (from REFS-03):**
- Generic spinner with "Loading…" — abandonment <5s on cold spinners.
- Progress bar 0→100% with no narrative — measures wait, doesn't reduce it.
- All-at-once results dump after wait — wastes the climax.
- Long static "wait" with no movement — dead pixels = perceived freeze.
- Tech-jargon status messages ("Querying API endpoint…") — alienates SMBs.
- Cursor-style hidden indexing — users don't know when done.
- Email-gated async reveal — breaks first-impression flow.
- Over-animation, distracting parallax/loops — adds 2.1s load, +28% bounce, -7.8% revenue.
- Animating skeleton outlines drawing in — outlines AND content competing for the eye.
- Forgetting the result is the hero — at climax, score dominates; everything else shrinks.

Source: REFS-03 §The Beamix First Scan Reveal + §Anti-Patterns for Scan Reveals.

---

## THE WORKSPACE / AGENT EXECUTION VISUALIZATION

Synthesizing REFS-02 + REFS-01.

- **Side panel position and geometry:** right side, fixed width 360px (NOT 50% — Manus's mistake), collapsible to a 48px rail with vertical "Agent" label.
- **Why right, not left:** Beamix product navigation is on the left; main content is in the center. The runtime panel doesn't compete with primary content for the left edge.
- **Mobile (<768px):** bottom drawer, peek state shows the current step pill, swipe up reveals full step list. Critical: NOT full-screen.
- **Always-on?** No. Default = open during run, auto-collapse 8 seconds after run completes to a compact "Did 6 steps in 47s" summary card. User can re-pin.
- **Collapsed state (rail):** breathing pulse + step name in vertical rotated label. Click to expand. Even at 48px the user knows the agent is alive.
- **Step nodes:** Rough.js circles with slightly imperfect SVG paths, 56px diameter.
- **Connecting lines:** vertical hand-drawn lines between steps, slightly wavy. Drawn with Rough.js at 2px stroke.
- **Icons inside circles:** simple 1.5-stroke icons (Lucide or Tabler with `stroke-linejoin: round`), or real engine logos (ChatGPT/Gemini/Perplexity/Claude).
- **Color:** neutral gray hand-drawn lines + Beamix Blue (#3370FF) for the active step's pulse. Completed steps get muted blue checkmark.
- **Font:** Inter for labels — NOT a hand-drawn font for step labels. The sketch quality lives in the strokes, not the type. Real type keeps it professional.
- **Three layered "thinking" cues:** (1) breathing pulse on the active circle's stroke (1400ms cycle), (2) micro-text rotation under step label (~1.5s swap among 3-4 messages), (3) engine logo "blink" — when sending request, logo briefly inverts background to blue for 200ms.
- **What we DO NOT show:** spinners (signal "stuck"), percent (lies), ETA (wrong-and-betrayed). Only breathing pulse + named active step.

**Six-step template — Beamix Content Optimizer agent example (from REFS-02 §Six-Step Template):**
1. "Reading your website" — page favicon, hand-drawn rectangle + magnifying glass icon, no engine logo.
2. "Asking each AI what they say about you" — 4 mini engine logos in a constellation, sequential blink (200ms each), per-engine answer cards on expand.
3. "Comparing what each AI said" — Venn-diagram icon, three "gap chips" appear inline, side-by-side table on expand.
4. "Writing better content for your homepage" — pencil icon with sparkle, streaming text box shows new copy character-by-character. THE moment of value.
5. "Checking it sounds right" — glasses icon, three green check chips ("Sounds natural ✓ / Facts match your site ✓ / No competitor names ✓"). QA gate is visible.
6. "Ready for your approval" — hand-drawn checkbox icon, primary "Review the new copy →" CTA + secondary "Discard."

Total user-watch time: ~30-60 seconds. Long enough to feel substantial; short enough not to lose attention.

Source: REFS-02 §The Beamix Agent Flow Pattern + §Six-Step Template for the Beamix Agent Workflow.

---

## THE PRODUCT-FIT DUALITY

Synthesizing REFS-04. Sarah-mode (Sarah, 52, dentist, 2-chair practice in Tel Aviv) and Yossi-mode (Yossi, SEO consultant, 20 client domains) share one screen.

**Sarah's view:**
```
Beamix Score: 42 / 100  ↑ +6 vs last week
[Run top 3 fixes — 14 credits]   [See what's broken]
```
One number, one button, one outcome. Done. Inbox shows results when fixes complete.

**Yossi's view (clicks the 42):**
```
Per engine:
  ChatGPT      38 ████░░░░░░  72/180 mentions
  Gemini       45 ████░░░░░░  85/188
  Perplexity   40 ████░░░░░░  76/190
  Claude       51 █████░░░░░  98/192
  AI Overviews 39 ████░░░░░░  74/191
  Grok         42 ████░░░░░░  79/188
  You.com      44 ████░░░░░░  82/186
  [click any engine → query-level data]

Top 23 recommendations [select all] [run selected]
  ☐ Add FAQ schema to /services       ✦ +8 score est.   [Run] [Edit]
  ☐ Improve location data             ✦ +5              [Run] [Edit]
```
**Same product. Same screen. Yossi just clicks deeper.**

**5 specific Beamix design moves:**
1. Beamix Score is a clickable number → 9-engine breakdown → query-level → raw model output. No "Pro mode" toggle.
2. Cmd+K is the universal action palette. Sarah discoverable via onboarding hint; Yossi lives in it.
3. Recommendation cards = "Run" CTA + collapsible "Show details" disclosure.
4. Industry-tuned scan profiles as templates ("Dental" preset / "Custom" raw canvas — same dropdown).
5. Numbers, pills, charts are all clickable. No "Advanced settings" page anywhere.

**Keyboard shortcuts Beamix ships day 1** (from REFS-04 §Keyboard shortcuts Beamix should ship from day 1):
- `Cmd+K` — universal palette
- `?` — shortcut cheatsheet overlay
- `R` — run a recommendation (when focused)
- `A` — approve (selection)
- `S` — start scan
- `G then S` — go to Scans page
- `G then I` — go to Inbox
- `G then C` — go to Competitors
- `/` — focus search
- `J` / `K` — next / previous in list
- `Cmd+Enter` — run/approve focused action

**No "Pro mode" toggle anywhere. No "Beamix Lite + Beamix Pro" split. No "Beginner / Advanced" mode.** Depth lives in the click hierarchy, not in modes.

Source: REFS-04 §Beamix-Specific Recommendations + §The 12 Duality Principles + §Anti-Patterns.

---

## THE OPEN-SOURCE STACK WE'RE ADOPTING

Locked. License + risk verified.

| Tool | License | Risk | Status |
|------|---------|------|--------|
| Rough.js | MIT | Low | Adopt — visual primitive everywhere. |
| perfect-freehand | MIT | Low | Adopt — every drawn line. |
| rough-notation | MIT | Low | Adopt — hand-drawn callouts. |
| Excalifont | OFL-1.1 | Low | Adopt — accent typography for animation surfaces. |
| Rubik (Google Fonts) | OFL-1.1 | Low | Adopt — Hebrew display. |
| Heebo (Google Fonts) | OFL | Low | Adopt — Hebrew body. |
| Frank Ruhl Libre | OFL | Low | Adopt — Hebrew serif accent. |
| next-intl | MIT | Low | Adopt — i18n routing for App Router. |
| shadcn/ui (with `rtl: true`) | MIT (vendored) | Low | Already in stack — enable RTL toggle. |
| Framer Motion | MIT | Low | Already in stack. |
| react-mt-svg-lines | MIT | Low | Optional — plug-and-play wrapper for stroke-dashoffset on SVG paths. |
| @rive-app/react-canvas | MIT runtime | Medium | Architect for it; defer until Beamie returns. |
| lottie-react / dotlottie-react | MIT | Low | Reserved for ONE celebration moment per session. |
| GSAP DrawSVGPlugin | club GreenSock (paid) | Medium | NOT adopted unless Framer Motion can't handle a >5-path scene. |

Source: REFS-01 §Open-Source Tools, REFS-05 §Implementation Notes.

---

## ANTI-PATTERNS — what we explicitly don't do

Cross-referenced from all 5 reports. 18-item canonical list. These are not preferences — they are forbidden moves.

1. **No spinners.** Spinners signal "stuck." Replace with breathing pulse + named active step. (REFS-02 §Anti-Patterns; REFS-03 §Anti-Patterns.)
2. **No 0-100% progress bars without narrative.** A bar without context measures the wait, doesn't reduce it. (REFS-03.)
3. **No tinted-square-with-icon.** Generic SaaS aesthetic. Use Rough.js sketchy frames around real engine logos. (REFS-02 §The hand-drawn aesthetic translation.)
4. **No "Pro mode" toggle.** Depth is one click deep, not a setting. (REFS-04 §Anti-Patterns.)
5. **No mandatory animation the user can't skip.** `prefers-reduced-motion` snaps to end-state; First Scan Reveal has a "skip" affordance. (REFS-01 §Pattern 9 + general motion best practice.)
6. **No node-edge graph for agent flow.** LangGraph Studio is the engineer surface; Beamix uses a top-down vertical list. (REFS-02 §The single design move + §LangGraph Studio.)
7. **No Hebrew translation that feels translated.** Transcreate, not translate. No literal "Get Started" → "קבלו התחלה." (REFS-05 §Anti-Patterns + Goliath project.)
8. **No animations that draw skeleton outlines.** Outlines snap in instantly; content cascades. Both animating = eye doesn't know where to land. (REFS-03 §Anti-Patterns.)
9. **No tech-jargon status messages.** "Querying API endpoint…" is forbidden. "Asking ChatGPT…" is the form. (REFS-02 §Plain-language step labels; REFS-03 §Anti-Patterns.)
10. **No literal Comic Sans / Marker Felt / Caveat fonts.** Excalifont is the line. (REFS-01 §What We Will Not Do.)
11. **No googly eyes / cartoon mascots inside dashboards.** Hand-drawn personality lives in the asterisk family + drawn primitives, not on a face on every page. PostHog Max works because he's contained. (REFS-01 §What We Will Not Do.)
12. **No noise-texture paper overlays.** Stroke irregularity implies paper. Texture overlays kill performance and look fake on retina. (REFS-01 §What We Will Not Do.)
13. **No emoji-heavy status copy.** "Sketching… ✏️" looks like an early Slack bot. Plain status text. (REFS-01.)
14. **No "wave hello" stock Lottie doodles in onboarding.** LottieFiles cliché. Lottie reserved for ONE celebration moment per session. (REFS-01.)
15. **No animated brand mark on every page.** Asterisk only animates when the system is thinking; otherwise static logo. (REFS-01.)
16. **No randomized roughness per render.** Always set `seed` parameter on Rough.js / perfect-freehand. (REFS-01 §What We Will Not Do.)
17. **No motion below 250ms or above 2500ms for entry animations.** Below = invisible, above = blocks user. (REFS-01.)
18. **No "AI is thinking" robot/CPU/gear iconography.** Asterisks, breath marks, eyes, abstract pulses — yes. Spinning gears — no. (REFS-01.)
19. **No hand-drawn typography on data tables.** Numbers stay in Inter with tabular numerals. (REFS-01.)
20. **No "Beamix Lite + Beamix Pro" two-product split.** No "Beginner / Advanced" mode toggle. No "PRO" badges on power features. (REFS-04 §Anti-Patterns.)
21. **No tooltip-driven UI.** If the label needs a tooltip, the label is wrong. (REFS-04 §Anti-Patterns.)
22. **No always-on side panel >360px.** Manus's 50% panel forces user to choose between watching and using. (REFS-02.)
23. **No logs that scroll endlessly.** Current state pinned at top; log is expand-on-demand. (REFS-02 §Anti-Patterns.)
24. **No hidden completion.** Always show a terminal celebration card for ~8 seconds before collapsing. (REFS-02 §Anti-Patterns.)
25. **No Hebrew with male imperatives.** Use infinitives or plural-you. Bavu netchil with slashes ("לחץ/י") is ugly. (REFS-05 §Anti-Patterns.)
26. **No US date / dollar formatting in Hebrew mode.** `Intl.DateTimeFormat('he-IL')` and `Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' })`. (REFS-05.)
27. **No partial RTL.** If we ship Hebrew, we ship it across dashboard, emails, exports, notifications. monday.com is the cautionary anti-reference. (REFS-05 §monday.com cautionary.)
28. **No Framer marketing site work in this repo.** Marketing lives in the separate Framer project; this repo is product only. (CLAUDE.md + 2026-04-25-DECISIONS-CAPTURED.md "Framer marketing site — DEFERRED.")

---

## SOURCES INDEX

Every URL cited across the 5 reference reports + decisions, organized by domain. ~80 entries.

### anthropic.com / claude.ai / claude.com
- [https://claude.ai/login](https://claude.ai/login)
- [https://www.anthropic.com/news/claude-design-anthropic-labs](https://www.anthropic.com/news/claude-design-anthropic-labs)
- [https://code.claude.com/docs/en/vs-code](https://code.claude.com/docs/en/vs-code)
- [https://docs.claude.com/en/docs/agents-and-tools/tool-use/computer-use-tool](https://docs.claude.com/en/docs/agents-and-tools/tool-use/computer-use-tool)
- [https://github.com/anthropics/anthropic-quickstarts/tree/main/computer-use-demo](https://github.com/anthropics/anthropic-quickstarts/tree/main/computer-use-demo)

### medium.com / linear-app / kinneret / kyletmartinez
- [https://medium.com/@kyletmartinez/reverse-engineering-claudes-ascii-spinner-animation-eec2804626e0](https://medium.com/@kyletmartinez/reverse-engineering-claudes-ascii-spinner-animation-eec2804626e0)
- [https://medium.com/@Kinneret/a-glimpse-into-google-israels-great-language-and-localization-update-project-9fa83f4489c9](https://medium.com/@Kinneret/a-glimpse-into-google-israels-great-language-and-localization-update-project-9fa83f4489c9)
- [https://medium.com/linear-app/invisible-details-2ca718b41a44](https://medium.com/linear-app/invisible-details-2ca718b41a44)
- [https://medium.com/swlh/exploring-the-product-design-of-the-stripe-dashboard-for-iphone-e54e14f3d87e](https://medium.com/swlh/exploring-the-product-design-of-the-stripe-dashboard-for-iphone-e54e14f3d87e)
- [https://medium.com/design-bootcamp/how-notion-uses-progressive-disclosure-on-the-notion-ai-page-ae29645dae8d](https://medium.com/design-bootcamp/how-notion-uses-progressive-disclosure-on-the-notion-ai-page-ae29645dae8d)
- [https://medium.com/@joycebirkins/claude-artifacts-chatgpt-canvas-ai-text-based-visualization-svg-image-generation-1fc51d27c0a6](https://medium.com/@joycebirkins/claude-artifacts-chatgpt-canvas-ai-text-based-visualization-svg-image-generation-1fc51d27c0a6)

### excalidraw / roughjs / freehand / shihn / hongkiat
- [https://excalidraw.com](https://excalidraw.com)
- [https://github.com/excalidraw/excalidraw](https://github.com/excalidraw/excalidraw)
- [https://plus.excalidraw.com/excalifont](https://plus.excalidraw.com/excalifont)
- [https://roughjs.com/](https://roughjs.com/)
- [https://news.ycombinator.com/item?id=22141526](https://news.ycombinator.com/item?id=22141526)
- [https://shihn.ca/posts/2020/roughjs-algorithms/](https://shihn.ca/posts/2020/roughjs-algorithms/)
- [https://www.hongkiat.com/blog/roughjs-handdrawn-svg-library/](https://www.hongkiat.com/blog/roughjs-handdrawn-svg-library/)
- [https://github.com/rough-stuff/rough-notation](https://github.com/rough-stuff/rough-notation)
- [https://roughnotation.com/](https://roughnotation.com/)
- [https://www.npmjs.com/package/react-rough-notation](https://www.npmjs.com/package/react-rough-notation)
- [https://css-tricks.com/rough-notation/](https://css-tricks.com/rough-notation/)
- [https://www.freecodecamp.org/news/how-to-add-animation-to-your-site-with-rough-notation/](https://www.freecodecamp.org/news/how-to-add-animation-to-your-site-with-rough-notation/)

### tldraw / perfect-freehand / latent.space
- [https://tldraw.dev/features/composable-primitives/drawing-and-canvas-interactions](https://tldraw.dev/features/composable-primitives/drawing-and-canvas-interactions)
- [https://tldraw.dev/starter-kits/agent](https://tldraw.dev/starter-kits/agent)
- [https://github.com/steveruizok/perfect-freehand](https://github.com/steveruizok/perfect-freehand)
- [https://github.com/steveruizok/perfect-freehand/discussions/38](https://github.com/steveruizok/perfect-freehand/discussions/38)
- [https://computer.tldraw.com/](https://computer.tldraw.com/)
- [https://www.latent.space/p/tldraw](https://www.latent.space/p/tldraw)
- [https://www.youtube.com/watch?v=Kn1De5uwrlY](https://www.youtube.com/watch?v=Kn1De5uwrlY)
- [https://www.youtube.com/watch?v=xda03Lin5cY](https://www.youtube.com/watch?v=xda03Lin5cY)
- [https://www.hackscience.education/the-computer-you-draw-inside-tldraws-natural-language-os/](https://www.hackscience.education/the-computer-you-draw-inside-tldraws-natural-language-os/)

### notion / buck / brandidentity / candu / appcues / venue
- [https://buck.co/work/notion-ai](https://buck.co/work/notion-ai)
- [https://the-brandidentity.com/project/how-buck-gave-notions-ai-assistant-a-hand-drawn-personality](https://the-brandidentity.com/project/how-buck-gave-notions-ai-assistant-a-hand-drawn-personality)
- [https://www.schoolofmotion.com/blog/motion-mondays-may-12-2025](https://www.schoolofmotion.com/blog/motion-mondays-may-12-2025)
- [https://www.candu.ai/blog/how-notion-crafts-a-personalized-onboarding-experience-6-lessons-to-guide-new-users](https://www.candu.ai/blog/how-notion-crafts-a-personalized-onboarding-experience-6-lessons-to-guide-new-users)
- [https://goodux.appcues.com/blog/notions-lightweight-onboarding](https://goodux.appcues.com/blog/notions-lightweight-onboarding)
- [https://venue.cloud/news/insights/from-signup-to-sticky-slack-notion-canva-s-plg-onboarding-playbook](https://venue.cloud/news/insights/from-signup-to-sticky-slack-notion-canva-s-plg-onboarding-playbook)
- [https://www.notion.com/blog/introducing-notion-calendar](https://www.notion.com/blog/introducing-notion-calendar)
- [https://cronhq.notion.site/Cron-Calendar-5625be54feac4e13a75b10271b65ddb7](https://cronhq.notion.site/Cron-Calendar-5625be54feac4e13a75b10271b65ddb7)

### rive / marmelab
- [https://github.com/rive-app/rive-react](https://github.com/rive-app/rive-react)
- [https://help.rive.app/runtimes/state-machines](https://help.rive.app/runtimes/state-machines)
- [https://help.rive.app/runtimes/overview/react](https://help.rive.app/runtimes/overview/react)
- [https://marmelab.com/blog/2023/01/30/rive-animation-state-machine.html](https://marmelab.com/blog/2023/01/30/rive-animation-state-machine.html)

### posthog / productgrowth
- [https://posthog.com/handbook/company/brand-assets](https://posthog.com/handbook/company/brand-assets)
- [https://posthog.com/blog/drawing-hedgehogs](https://posthog.com/blog/drawing-hedgehogs)
- [https://posthog.com/blog/aruba-hackathon](https://posthog.com/blog/aruba-hackathon)
- [https://www.productgrowth.blog/p/posthog-branding-playbook](https://www.productgrowth.blog/p/posthog-branding-playbook)

### linear / cursor / replit / vercel / cognition / openai
- [https://linear.app/developers/aig](https://linear.app/developers/aig)
- [https://linear.app/changelog/2025-07-30-agent-interaction-guidelines-and-sdk](https://linear.app/changelog/2025-07-30-agent-interaction-guidelines-and-sdk)
- [https://linear.app/developers/agent-interaction](https://linear.app/developers/agent-interaction)
- [https://linear.app/docs/agents-in-linear](https://linear.app/docs/agents-in-linear)
- [https://linear.app/changelog/2026-03-12-ui-refresh](https://linear.app/changelog/2026-03-12-ui-refresh)
- [https://linear.app/now/behind-the-latest-design-refresh](https://linear.app/now/behind-the-latest-design-refresh)
- [https://linear.app/now/how-we-redesigned-the-linear-ui](https://linear.app/now/how-we-redesigned-the-linear-ui)
- [https://linear.app/changelog/2021-03-25-keyboard-shortcuts-help](https://linear.app/changelog/2021-03-25-keyboard-shortcuts-help)
- [https://linear.app/docs/conceptual-model](https://linear.app/docs/conceptual-model)
- [https://cursor.com/blog/2-0](https://cursor.com/blog/2-0)
- [https://cursor.com/changelog/0-46-x](https://cursor.com/changelog/0-46-x)
- [https://cursor.com/product](https://cursor.com/product)
- [https://forum.cursor.com/t/codebase-indexing-indicator/56627](https://forum.cursor.com/t/codebase-indexing-indicator/56627)
- [https://blog.replit.com/ghostwriter-inline](https://blog.replit.com/ghostwriter-inline)
- [https://blog.replit.com/ghostwriter-building](https://blog.replit.com/ghostwriter-building)
- [https://blog.replit.com/introducing-agent-4-built-for-creativity](https://blog.replit.com/introducing-agent-4-built-for-creativity)
- [https://replit.com/agent4](https://replit.com/agent4)
- [https://v0.app/](https://v0.app/)
- [https://v0.dev/](https://v0.dev/)
- [https://vercel.com/blog/maximizing-outputs-with-v0-from-ui-generation-to-code-creation](https://vercel.com/blog/maximizing-outputs-with-v0-from-ui-generation-to-code-creation)
- [https://vercel.com/blog/announcing-v0-generative-ui](https://vercel.com/blog/announcing-v0-generative-ui)
- [https://vercel.com/docs/deployments/logs](https://vercel.com/docs/deployments/logs)
- [https://markaicode.com/generative-ui-vercel-v0-sketches/](https://markaicode.com/generative-ui-vercel-v0-sketches/)
- [https://cognition.ai/blog/introducing-devin](https://cognition.ai/blog/introducing-devin)
- [https://docs.devin.ai/get-started/devin-intro](https://docs.devin.ai/get-started/devin-intro)
- [https://ppaolo.substack.com/p/in-depth-product-analysis-devin-cognition-labs](https://ppaolo.substack.com/p/in-depth-product-analysis-devin-cognition-labs)
- [https://openai.com/index/introducing-chatgpt-agent/](https://openai.com/index/introducing-chatgpt-agent/)
- [https://help.openai.com/en/articles/11752874-chatgpt-agent](https://help.openai.com/en/articles/11752874-chatgpt-agent)
- [https://openai.com/index/computer-using-agent/](https://openai.com/index/computer-using-agent/)
- [https://techcrunch.com/2025/01/23/openai-launches-operator-an-ai-agent-that-performs-tasks-autonomously/](https://techcrunch.com/2025/01/23/openai-launches-operator-an-ai-agent-that-performs-tasks-autonomously/)
- [https://openai.com/index/hebbia/](https://openai.com/index/hebbia/)

### perplexity / langchain / nngroup / franciscomoretti
- [https://www.perplexity.ai/](https://www.perplexity.ai/)
- [https://www.perplexity.ai/hub/blog/introducing-perplexity-deep-research](https://www.perplexity.ai/hub/blog/introducing-perplexity-deep-research)
- [https://www.langchain.com/breakoutagents/perplexity](https://www.langchain.com/breakoutagents/perplexity)
- [https://www.nngroup.com/articles/perplexity-henry-modisett/](https://www.nngroup.com/articles/perplexity-henry-modisett/)
- [https://www.nngroup.com/articles/skeleton-screens/](https://www.nngroup.com/articles/skeleton-screens/)
- [https://www.nngroup.com/articles/modes/](https://www.nngroup.com/articles/modes/)
- [https://www.nngroup.com/articles/progressive-disclosure/](https://www.nngroup.com/articles/progressive-disclosure/)
- [https://www.franciscomoretti.com/blog/comparing-deep-research-uis](https://www.franciscomoretti.com/blog/comparing-deep-research-uis)
- [https://www.storylane.io/tutorials/how-to-use-perplexity-deep-research](https://www.storylane.io/tutorials/how-to-use-perplexity-deep-research)

### manus / hebbia / browserbase / smashing / logiciel
- [https://manus.im/](https://manus.im/)
- [https://workos.com/blog/introducing-manus-the-general-ai-agent](https://workos.com/blog/introducing-manus-the-general-ai-agent)
- [https://geekchamp.com/how-to-use-manus-ai-agent-a-complete-walkthrough/](https://geekchamp.com/how-to-use-manus-ai-agent-a-complete-walkthrough/)
- [https://www.hebbia.com/product](https://www.hebbia.com/product)
- [https://www.hebbia.com/blog/inside-hebbias-deeper-research-agent](https://www.hebbia.com/blog/inside-hebbias-deeper-research-agent)
- [https://www.hebbia.com/blog/divide-and-conquer-hebbias-multi-agent-redesign](https://www.hebbia.com/blog/divide-and-conquer-hebbias-multi-agent-redesign)
- [https://www.hebbia.com/blog/introducing-matrix-the-interface-to-agi](https://www.hebbia.com/blog/introducing-matrix-the-interface-to-agi)
- [https://www.browserbase.com/solutions/browser-agents](https://www.browserbase.com/solutions/browser-agents)
- [https://agent-browser.dev/dashboard](https://agent-browser.dev/dashboard)
- [https://www.smashingmagazine.com/2026/02/designing-agentic-ai-practical-ux-patterns/](https://www.smashingmagazine.com/2026/02/designing-agentic-ai-practical-ux-patterns/)
- [https://logiciel.io/blog/agentic-ux-oversight-confidence-control](https://logiciel.io/blog/agentic-ux-oversight-confidence-control)
- [https://docs.ag-ui.com/concepts/events](https://docs.ag-ui.com/concepts/events)
- [https://techcommunity.microsoft.com/blog/azuredevcommunityblog/building-interactive-agent-uis-with-ag-ui-and-microsoft-agent-framework/4488249](https://techcommunity.microsoft.com/blog/azuredevcommunityblog/building-interactive-agent-uis-with-ag-ui-and-microsoft-agent-framework/4488249)
- [https://blog.langchain.com/langgraph-studio-the-first-agent-ide/](https://blog.langchain.com/langgraph-studio-the-first-agent-ide/)
- [https://www.datacamp.com/tutorial/langgraph-studio](https://www.datacamp.com/tutorial/langgraph-studio)
- [https://crewai.com/](https://crewai.com/)
- [https://devblogs.microsoft.com/agent-framework/ag-ui-multi-agent-workflow-demo/](https://devblogs.microsoft.com/agent-framework/ag-ui-multi-agent-workflow-demo/)
- [https://www.genspark.ai/agents?type=super_agent](https://www.genspark.ai/agents?type=super_agent)
- [https://www.toolpromptly.com/openai-operator-from-chatting-to-doing-the-complete-2026-guide/](https://www.toolpromptly.com/openai-operator-from-chatting-to-doing-the-complete-2026-guide/)

### speedtest / plaid / fast.com / cloudflare / ookla
- [https://www.speedtest.net](https://www.speedtest.net)
- [https://www.sfcd.com/work/speedtest/](https://www.sfcd.com/work/speedtest/)
- [https://www.behance.net/gallery/18560233/Ookla-Speedtest](https://www.behance.net/gallery/18560233/Ookla-Speedtest)
- [https://plaid.com/plaid-link/](https://plaid.com/plaid-link/)
- [https://plaid.com/blog/inside-link-design/](https://plaid.com/blog/inside-link-design/)
- [http://techblog.netflix.com/2016/08/building-fastcom.html](http://techblog.netflix.com/2016/08/building-fastcom.html)
- [https://speed.cloudflare.com](https://speed.cloudflare.com)

### stripe / mercury / mattstromawn / docs.stripe
- [https://dashboard.stripe.com](https://dashboard.stripe.com)
- [https://mattstromawn.com/projects/stripe-dashboard](https://mattstromawn.com/projects/stripe-dashboard)
- [https://docs.stripe.com/connect/onboarding](https://docs.stripe.com/connect/onboarding)

### raycast / superhuman / pixelmatters
- [https://raycast.com](https://raycast.com)
- [https://raycast.com/blog](https://raycast.com/blog)
- [https://raycast.com/blog/how-raycast-api-extensions-work](https://raycast.com/blog/how-raycast-api-extensions-work)
- [https://pixelmatters.com/insights/raycast-for-software-engineers](https://pixelmatters.com/insights/raycast-for-software-engineers)
- [https://download.superhuman.com/Superhuman%20Keyboard%20Shortcuts.pdf](https://download.superhuman.com/Superhuman%20Keyboard%20Shortcuts.pdf)
- [https://blog.superhuman.com/the-fastest-way-to-inbox-zero-a-single-coaching-session](https://blog.superhuman.com/the-fastest-way-to-inbox-zero-a-single-coaching-session)
- [https://useronboard.com/onboarding-ux-patterns/sensible-defaults](https://useronboard.com/onboarding-ux-patterns/sensible-defaults)

### granola / intelligentinterfaces
- [https://docs.granola.ai/help-center/taking-notes/transcription](https://docs.granola.ai/help-center/taking-notes/transcription)
- [https://www.granola.ai/docs/changelog](https://www.granola.ai/docs/changelog)
- [https://intelligentinterfaces.substack.com/p/how-granola-enhances-note-taking](https://intelligentinterfaces.substack.com/p/how-granola-enhances-note-taking)

### wix / monday / fonts / sadan / odedezer / google israel / nemala
- [https://support.wix.com/en/article/languages-available-in-the-wix-site-builders](https://support.wix.com/en/article/languages-available-in-the-wix-site-builders)
- [https://support.wix.com/en/article/wix-multilingual-using-multi-state-boxes-to-switch-from-ltr-to-rtl](https://support.wix.com/en/article/wix-multilingual-using-multi-state-boxes-to-switch-from-ltr-to-rtl)
- [https://support.monday.com/hc/en-us/articles/360003503760-Available-languages-for-monday-com](https://support.monday.com/hc/en-us/articles/360003503760-Available-languages-for-monday-com)
- [https://community.monday.com/t/feature-support-language-from-righ-to-left-hebrew/24732](https://community.monday.com/t/feature-support-language-from-righ-to-left-hebrew/24732)
- [https://www.brand-monday.com/typography](https://www.brand-monday.com/typography)
- [https://vibe.monday.com/?path=/docs/foundations-typography--docs](https://vibe.monday.com/?path=/docs/foundations-typography--docs)
- [https://fonts.google.com/specimen/Rubik](https://fonts.google.com/specimen/Rubik)
- [https://sadan.com/rubik.html](https://sadan.com/rubik.html)
- [https://github.com/googlefonts/rubik](https://github.com/googlefonts/rubik)
- [https://fonts.google.com/specimen/Heebo](https://fonts.google.com/specimen/Heebo)
- [https://github.com/OdedEzer/heebo](https://github.com/OdedEzer/heebo)
- [https://fonts.adobe.com/fonts/heebo](https://fonts.adobe.com/fonts/heebo)
- [https://fonts.google.com/specimen/Frank+Ruhl+Libre](https://fonts.google.com/specimen/Frank+Ruhl+Libre)
- [https://en.natielimelech.com/geo](https://en.natielimelech.com/geo)
- [https://aiisrael.org.il/](https://aiisrael.org.il/)
- [https://m2.material.io/design/usability/bidirectionality.html](https://m2.material.io/design/usability/bidirectionality.html)
- [https://ui.shadcn.com/docs/rtl](https://ui.shadcn.com/docs/rtl)
- [https://next-intl.dev/docs/getting-started/app-router](https://next-intl.dev/docs/getting-started/app-router)
- [https://workspace.google.com](https://workspace.google.com)

### motion.dev / gsap / css-tricks / logrocket
- [https://motion.dev/docs/react-svg-animation](https://motion.dev/docs/react-svg-animation)
- [https://motion.dev/examples/react-skeleton-shimmer](https://motion.dev/examples/react-skeleton-shimmer)
- [https://blog.noelcserepy.com/how-to-animate-svg-paths-with-framer-motion](https://blog.noelcserepy.com/how-to-animate-svg-paths-with-framer-motion)
- [https://gsap.com/docs/v3/Plugins/DrawSVGPlugin/](https://gsap.com/docs/v3/Plugins/DrawSVGPlugin/)
- [https://gsap.com/resources/getting-started/Staggers/](https://gsap.com/resources/getting-started/Staggers/)
- [https://css-tricks.com/repeatable-staggered-animation-three-ways-sass-gsap-web-animations-api/](https://css-tricks.com/repeatable-staggered-animation-three-ways-sass-gsap-web-animations-api/)
- [https://css-tricks.com/libraries-for-svg-drawing-animations/](https://css-tricks.com/libraries-for-svg-drawing-animations/)
- [https://blog.logrocket.com/ux-design/skeleton-loading-screen-design/](https://blog.logrocket.com/ux-design/skeleton-loading-screen-design/)
- [https://github.com/moarwick/react-mt-svg-lines](https://github.com/moarwick/react-mt-svg-lines)
- [https://dev.to/paulryan7/simple-svg-drawing-effect-with-stroke-dasharray-stroke-dashoffset-3m8e](https://dev.to/paulryan7/simple-svg-drawing-effect-with-stroke-dasharray-stroke-dashoffset-3m8e)
- [https://dev.blog.icons8.com/articles/lottie-animations/](https://dev.blog.icons8.com/articles/lottie-animations/)
- [https://www.protopie.io/blog/5-ways-to-use-lottie-animations-in-high-fidelity-prototypes](https://www.protopie.io/blog/5-ways-to-use-lottie-animations-in-high-fidelity-prototypes)

### misc references (ahrefs / semrush / similarweb / pagespeed / etc.)
- [https://pagespeed.web.dev](https://pagespeed.web.dev)
- [https://webpagetest.org](https://webpagetest.org)
- [https://gtmetrix.com](https://gtmetrix.com)
- [https://seoptimer.com](https://seoptimer.com)
- [https://ahrefs.com/site-audit](https://ahrefs.com/site-audit)
- [https://semrush.com/siteaudit/](https://semrush.com/siteaudit/)
- [https://similarweb.com/website/](https://similarweb.com/website/)
- [https://sitechecker.pro](https://sitechecker.pro)
- [https://backlinko.com/tools/seo-checker](https://backlinko.com/tools/seo-checker)
- [https://albato.com/blog/publications/how-to-use-claude-artifacts-guide](https://albato.com/blog/publications/how-to-use-claude-artifacts-guide)
- [https://www.svggenie.com/blog/create-svg-with-claude-ai](https://www.svggenie.com/blog/create-svg-with-claude-ai)
- [http://www.olahungerford.com/drawing-and-animating-with-claude/](http://www.olahungerford.com/drawing-and-animating-with-claude/)

---

*End of Beamix References Master List. Length: ~880 lines. Status: APPROVED — feeds directly into Beamix Vision Document.*
