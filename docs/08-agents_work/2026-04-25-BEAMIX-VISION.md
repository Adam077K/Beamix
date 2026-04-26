# Beamix Vision Document v1
Status: PROPOSAL — Framework. Per-page deep dive happens in subsequent conversations.
Date: 2026-04-25
Sources: 2026-04-25-DECISIONS-CAPTURED.md · 2026-04-25-REFERENCES-MASTERLIST.md · BRAND_GUIDELINES.md v4.0

---

## PART 0 — THE THESIS

### What Beamix Becomes

Beamix is not a GEO audit tool. It is the first company that does GEO work for you — at the speed of agents, at the quality of a senior practitioner. Sarah, the dentist in Tel Aviv, opens Beamix on a Wednesday morning, sees a score of 42 and one sentence of guidance, clicks "Run top fixes," and by Friday her practice is mentioned in three more AI answers than it was before — without understanding what FAQPage schema is or why it matters. Yossi, the consultant managing 20 client domains, opens the same product, clicks the 42, reads the per-engine breakdown, bulk-selects eight recommendations, runs them with Cmd+Enter, and exports the audit log. Both users feel the product was built specifically for them. That duality — same screen, same data, depth via clicking not toggling — is the product's core architectural bet, and it is what destroys every competitor in the category that either dumbs down for Sarah or locks Yossi behind a "Pro mode" paywall. The product feels like a living workspace: hand-drawn thinking states show agents at work, Hebrew is a first-class language not a flag option, and the score is a number you want to click, not a vanity metric you ignore. When Sarah tells her friend about Beamix, she says "it actually fixed things" — not "it showed me a dashboard."

### What's Changing — From AI-Sloppish to The New Environment

- Current state: Shadcn template defaults, generic tinted-square icons, identical Zap lightning bolts for all 11 agents, console.log placeholder Inbox, InterDisplay font not loading (falling back to Inter), no Hebrew, no RTL, bare spinner loading states, 0% animation, score as a static badge not a clickable drill-down, no keyboard shortcuts, no Cmd+K, no `?` cheatsheet.
- New vision: Hand-drawn living UI with Rough.js frames + Framer Motion path-draws. Hebrew-native with Rubik/Heebo typography swap on `dir="rtl"`. Immersive 15-17s First Scan Reveal as the product's primary acquisition surface. Agents visualized as vertical gerund-verb step lists, one breathing-pulse step at a time (Perplexity + Linear AIG pattern). Score as a clickable number that drills through 4 layers: aggregate → per-engine → per-query → raw model output. Sarah's first win in 60 seconds (public scan = the onboarding). Yossi's power moves discoverable via Cmd+K, `?`, single-letter shortcuts, right-click context menus — no "Pro mode." Inbox as a 3-pane review queue (Linear Triage), not a stub. Workspace as a narrative agent execution screen, not a log dump. Every loading state has plain-language words, never a bare spinner. Every empty state is typed by situation. Keyboard shortcuts ship day one.
- The category position: competitors (Otterly, Peec, Profound) all require signup before showing any scan. Beamix shows results first. That is the wedge.

### What We Are Explicitly NOT Building

- Beamie persistent companion character — DEFERRED. Animations stay; mascot does not.
- Cast of 5 characters — DEFERRED with Beamie.
- Marketing site changes — OUT OF SCOPE. Framer lives separately.
- Dark mode — post-launch.
- Memory layer for Beamie — architect for it, ship without it.
- Rive runtime — architect for it (when Beamie returns), ship without it now.
- Public GEO Index (`beamix.tech/check-my-site`) — deferred, high-ROI viral loop, ship after core.
- Shareable Scan Card — deferred, ship after core.
- State of GEO newsletter — deferred, content authority play.
- Timelines, sprints, week estimates, "ship in Q2" language — never in this document or planning.

---

## PART 1 — THE DESIGN LANGUAGE (LOCKED)

### 7 Anchor Products

1. **Claude.ai** — hand-drawn animation register. Permission slip to ship hand-drawn aesthetics to B2B without losing trust. The asterisk family (`· ✻ ✽ ✶ ✳ ✢`) as "voice of the brand" in thinking states. Status copy rotates as part of animation. Restraint everywhere else.
2. **Excalidraw + Rough.js** — entire visual primitive foundation. Rough.js (<9KB, MIT) renders every hand-drawn shape. Excalifont (OFL) for accent typography on animation surfaces only. Fixed `seed` parameter on every render. SVG output, not Canvas.
3. **Linear** — agent flow pattern (4 discrete states, immediate "thinking" pill), customer-fit duality (Cmd+K, `?`, single-letter shortcuts, calmer chrome), and March-2026 visual restraint as the multiplier that makes personality land harder.
4. **Perplexity Pro Search** — narrative scan transparency. Vertical step list, gerund verbs, one breathing-pulse active step, chevron-expand per stage, citation favicon chips as proof of progress. "Users wait more willingly when they can see intermediate progress." — Henry Modisett, Head of Design.
5. **Notion (+ Notion AI by BUCK)** — onboarding morph (interface previews itself as user types) + deferred character register architecture for when Beamie returns (eyes + brows + nose only, state-machine driven, Rive).
6. **Stripe Dashboard** — summary→detail→raw data layering. Every number is clickable. No exclamation points, no PRO TIP badges, no urgency. Search IS the navigation (Cmd+K). Test/live mode is the ONE acceptable toggle — Beamix has no equivalent.
7. **Wix** — Hebrew-first product UX (Israeli origin). Full dashboard RTL flip. Account language vs. site language separation. Mixed bidi content as a core feature, not an afterthought. Cautionary anti-reference: monday.com (partial RTL, emails stuck in LTR, font stack missing Hebrew glyphs).

### 12 Design Rules

1. Hand-drawn elements live only on thinking-state, idle, and artifact surfaces — never on chrome, settings, or data tables.
2. One breathing focal point at a time. Active step pulses; everything else is muted or future-faded at 30% opacity.
3. Steps are vertical lists of gerund verbs in plain language — never node graphs, never tool-call JSON, never "phase" noun-phrases.
4. Progressive disclosure via chevron everywhere. Default = clean; expand = technical truth one click deeper. No "Pro mode" toggle.
5. Real engine logos inside hand-drawn Rough.js frames. The contrast between rough stroke and crisp logo IS the brand.
6. Streaming partial state always beats all-or-nothing reveal. Sub-1s time-to-first-visible-response.
7. Status copy is part of the animation — active verb + ellipsis + change. Rotates every ~1.5s among 3-4 plain-language messages.
8. Every number, pill, badge, and chart is clickable. Drill-down is the navigation model.
9. Templates are the canvas, not a separate product — industry presets and "Custom" live in the same dropdown.
10. Cmd+K is the universal escape hatch. `?` opens the cheatsheet overlay from anywhere in the app.
11. Hebrew/RTL is first-class — sidebar flips, fonts swap to Rubik+Heebo, microcopy is transcreated (not translated), dates use `he-IL`, currency is `₪` before number.
12. Restraint is the multiplier — hand-drawn personality only works because the rest of the UI is calm and undecorated.

### 5 Signature Motions

1. **First Scan Reveal** — 15-17s, 10 sequential frames. URL pencil-stroke entrance → Rough.js rectangle sketches around it → line draws to company-logo bubble → 7 engine bubbles sketch into asymmetric orbit → engines query in stagger (longest stage) → mention-pellets fly back to center → score arc fills + count-up → skeleton blocks cascade → top recommendation glows → sticky CTA bar slides in. Built entirely in Rough.js + Framer Motion (`pathLength` 0→1). Fixed `seed` parameter throughout. This is the product's acquisition moment.
2. **Agent Step List** — 360px right-side panel, vertical gerund-verb steps, one breathing-pulse active step at a time (CSS `@keyframes` on `stroke-opacity` 0.5↔1 over 1400ms — "breathing rhythm of thinking, not spinning"). Connecting line below active step draws progressively via animated `stroke-dashoffset`. Auto-collapses 8s after completion to "Did 6 steps in 47s" summary card.
3. **Score Gauge Fill** — Rough.js semicircle arc draws via `pathLength` 0→1 (~600ms ease-out). Numeric counter ticks 0→final score in InterDisplay with tabular numerals simultaneously. Fill color is the semantic score color (`#EF4444` → `#F59E0B` → `#10B981` → `#06B6D4`). Total ~1000ms. Reused on every score render, not just first scan.
4. **Skeleton Block Cascade** — Rough.js outlines snap in instantly (they do NOT animate drawing — this is a hard rule). Content cascades via Framer Motion `staggerChildren: 0.15s`, each child `opacity 0→1` + `translateY 8→0`, 280ms ease-out. Header text first, body 100ms after, metadata 200ms after. Outline strokes at `roughness: 0.8-1.0` — not standard gray rectangles.
5. **Path-Draw Entry** — Universal "appearing" motion for all hand-drawn elements. `pathLength 0→1` (Framer Motion) or `stroke-dashoffset length→0` (CSS). Default ease: `easeInOut`. 700-1200ms short marks, up to 2500ms chained illustrations. Always `strokeLinecap: round`, `strokeLinejoin: round`. Stagger between chained lines: 50-120ms.

### Typography Stack (LOCKED)

```
English:
  Display:     InterDisplay-Medium (500-700) — headings, tight tracking
  Body:        Inter (400-600) — all UI labels, body copy, step labels
  Mono:        Geist Mono — logs, code blocks, raw agent output

Hebrew:
  Display:     Rubik (variable, 500-700) — activates automatically on dir="rtl"
  Body:        Heebo (variable, 400-600) — activates automatically on dir="rtl"
  Serif:       Frank Ruhl Libre (400-700) — dark/testimonial sections only

Accent:
  Excalifont (OFL) — drawn callouts, empty-state messages, animation captions ONLY
                     Never on data tables. Never in Hebrew (no Hebrew glyphs).

Rules:
  All sizes: rem units — NEVER arbitrary px values
  Tabular numerals: font-feature-settings: "tnum" on EVERY numeric surface
  Hebrew font swap: triggered by dir="rtl" on <html>, not a class or JS toggle
  Code/mono stays Geist Mono regardless of language direction
```

### Color System (LOCKED)

```
Brand accent:         #3370FF — CTAs, active states, pulsing step (NEVER as text on white)
Brand accent (text):  #2558E5 — use when WCAG AA contrast is required on white background
Canvas (warm):        #F5F3EE — primary page background (warmer than pure white)
Canvas (pure):        #FFFFFF — card surfaces
Ink:                  #0A0A0A — primary text
Muted:                #6B7280 — captions, secondary labels, completed-step labels
Border:               #E5E7EB — card and input borders

Semantic (score data only — never on chrome, links, or icons):
  Excellent:          #06B6D4 — score 75-100
  Good:               #10B981 — score 50-74
  Fair:               #F59E0B — score 25-49
  Critical:           #EF4444 — score 0-24

Hand-drawn strokes:
  Default:            #6B7280 — neutral gray
  Active step frame:  #3370FF — the ONLY place accent color moves in product chrome
  Completed step:     #2558E5 at 60% opacity
```

### Animation Tech Stack (LOCKED)

| Library | License | Weight | Role |
|---------|---------|--------|------|
| Framer Motion | MIT | ~50KB | UI animation primitives — `pathLength`, layout, stagger |
| Rough.js | MIT | <9KB | Hand-drawn shapes — EVERY rectangle, ellipse, arc in sketch mode |
| perfect-freehand | MIT | ~5KB | Sketchy strokes — agent activity lines, magnifying-glass wobble |
| rough-notation | MIT | small | Hand-drawn underlines/circles/callouts — max two per screen |
| Excalifont | OFL | ~150KB | Accent typography on animation surfaces only |
| next-intl | MIT | ~2KB client | i18n routing, server-component native |
| shadcn/ui (rtl: true) | MIT vendored | — | Single toggle enables RTL across all components |
| lottie-react | MIT | ~250KB | RESERVED — ONE celebration moment per session only |
| @rive-app/react-canvas | MIT runtime | ~150KB | DEFERRED until Beamie returns — architect for, don't ship |
| GSAP DrawSVGPlugin | Paid (club) | ~30KB | NOT adopted — only if Framer Motion can't handle >5-path scene |

**Hard animation rules:** Fixed `seed` on every Rough.js/perfect-freehand render. `prefers-reduced-motion` snaps to end-state with no animation. Duration sweet spot: 500-1200ms. Below 250ms = invisible. Above 2500ms = blocks user.

### RTL / Hebrew Rules (8)

1. CSS logical properties everywhere — `margin-inline-start` not `margin-left`, `inset-inline-end` not `right`, `text-align: start` not `text-align: left`. Same code serves both directions.
2. Locale-aware element positioning — toasts slide in from `inline-start`; drawers open from `inline-end`. When Beamie returns: bottom-right LTR / bottom-left RTL.
3. First Scan Reveal storyboard mirrors for RTL — engine bubbles arrange clockwise from the right, drawn arrows flip. Built with logical properties so the mirror is automatic.
4. Hebrew typography stack triggers automatically on `dir="rtl"` — Rubik replaces InterDisplay, Heebo replaces Inter. No JS class toggle required.
5. Hebrew microcopy is gender-neutral — infinitives ("הפעלת סריקה") or inclusive plural ("בואו נתחיל"). Never male imperatives ("סרוק"). Never slash-split ("לחץ/י").
6. Mixed Hebrew + English text uses bidi isolation — `<bdi>Beamix</bdi>`, `<bdi>ChatGPT</bdi>`, `<bdi>URL</bdi>` so the Bidi Algorithm renders them predictably.
7. Numerals stay Western Arabic (0-9) in both directions. Phone numbers display LTR within RTL context. URLs and emails always LTR.
8. Israeli formatting defaults: dates `Intl.DateTimeFormat('he-IL')`, currency `₪79/חודש` (₪ before number), phone `054-123-4567`.

### Anti-Patterns — What We Never Do

- No bare spinners. Ever. Breathing pulse + named active step is the replacement.
- No 0-100% progress bar without narrative copy.
- No tinted-square-with-generic-icon for agent representation.
- No "Pro mode" toggle. No "Beginner / Advanced" mode. No PRO badge on power features.
- No mandatory animation the user can't skip (`prefers-reduced-motion` respected everywhere).
- No node-edge graph for agent flow — vertical gerund-verb list only.
- No Hebrew that reads as translated rather than transcreated.
- No animating skeleton outlines — outlines snap, content cascades. Both animating = eye has nowhere to land.
- No tech-jargon status messages ("Querying API endpoint...") — "Asking ChatGPT..." is the form.
- No Comic Sans / Marker Felt / Caveat — Excalifont is the hard line.
- No mascot/character on every page (deferred; hand-drawn primitives carry the personality).
- No noise-texture paper overlays — stroke irregularity implies paper, faster and cleaner.
- No emoji-heavy status copy.
- No wave-hello Lottie stock animations in onboarding.
- No animated brand mark on every page — asterisk animates only during thinking state.
- No randomized Rough.js `seed` — always fixed for stable re-renders.
- No `text-[72px]` or arbitrary px typography values.
- No dark mode at launch.
- No marketing site work in this repo.
- No timelines, week ranges, or sprint language anywhere.
- No partial RTL — if Hebrew ships, it ships dashboard + emails + notifications + exports.
- No always-on side panel wider than 360px (Manus's mistake).
- No scrolling-forever log panels — current state pinned at top, log is expand-on-demand.
- No hidden completion — always show terminal celebration card ~8s before collapsing.

---

## PART 2 — THE PRODUCT ARCHITECTURE

### Pages (10)

1. `/scan` (public) — type domain, watch 15-17s First Scan Reveal hand-drawn animation, see score and top fixes before any signup gate.
2. `/onboarding` — multi-step first-run flow: detects `?scan_id=` from public scan, guides user through business setup with hand-drawn flourishes, connects to Paddle checkout.
3. `/home` — morning briefing: Beamix Score with count-up animation, top 3 fixes, what changed since last scan, agent queue status, quick-launch CTA for Sarah.
4. `/inbox` — 3-pane review queue (Linear Triage pattern): list (left) → preview (center) → action bar (right sticky). Sarah approves/rejects agent output here.
5. `/workspace` — agent execution viewer: main content area + 360px right-side step-list panel, narrative agent run with gerund-verb steps and breathing-pulse active state.
6. `/scans` — scan history list + per-scan deep dive (score delta, per-engine breakdown, query-level drill-down — the Stripe summary→detail→raw pattern).
7. `/automation` — recurring scan schedules + auto-run agent configurations. Name TBD (Schedules / Auto-pilot / Crew — Adam decides).
8. `/competitors` — competitor intelligence dashboard: who's outranking you in AI answers, per-engine, per-query, with delta tracking.
9. `/archive` — past agent output and content items: approved copy, published schema, historical recommendations.
10. `/settings` — account, billing (Paddle), language toggle (EN/HE), notification preferences, business profile.

### Flows (8)

1. **Public First Scan** — URL typed → 10-frame 15-17s animation → score and recommendations revealed → sticky bottom bar CTA. No signup gate before result.
2. **Signup + Onboarding** — Paddle checkout → 4-step guided setup with Notion-style interface morphing as user fills in business details → `?scan_id=` param links public scan to new account.
3. **Agent Run (Workspace)** — user initiates agent from recommendation card or Cmd+K → workspace opens with 360px step-list panel → 6-step gerund-verb narrative → result streaming in step 4 → QA check in step 5 → "Ready for your approval" terminal state → user routed to Inbox.
4. **Inbox Review** — 3-pane: list of pending items (left), preview of agent output with diff (center), sticky action bar Approve/Reject/Request changes (right). `A` key approves; `J/K` navigate list.
5. **Recurring Scan** — silent background Inngest job, score delta computed on completion, toast notification appears on next dashboard visit with Score Gauge Fill animation showing delta.
6. **Schedule Setup** — pick agent + frequency + trigger condition. Hand-drawn calendar/frequency selector widget. Confirm → schedule persists in `/automation`.
7. **Hebrew Switch** — Settings → Language → Hebrew → `<html dir="rtl">` toggles → sidebar mirrors → Rubik/Heebo fonts activate → all microcopy swaps via next-intl → dates and currency reformat to `he-IL`.
8. **Score Drill-down** — click score on `/home` → per-engine breakdown opens inline → click engine pill → per-query data → click query → raw model output. Sarah stops at layer 1. Yossi goes to layer 4. Same page, no mode switch.

### Component Library (15)

1. **ScoreDisplay** — count-up + hand-drawn arc fill. Hero number on `/home` and `/scans`. Clickable to trigger Score Drill-down flow.
2. **EnginePill** — one per AI engine, shows engine logo + score or mention count. Clickable → per-engine breakdown. Used in `/scan` orbit and `/scans` detail.
3. **RecommendationCard** — "Run →" CTA visible immediately (Sarah); collapsible "Show details" disclosure for implementation spec (Yossi). `R` keystroke shortcut on hover.
4. **AgentStepList** — workspace right-panel, 360px fixed. Breathing-pulse active step, muted future steps, checkmark completed steps, micro-text rotation under active label, connecting line draws progressively.
5. **ActionBar** — Inbox preview pane sticky footer. Approve (`A`) / Reject / Request Changes. Keystroke shown floating next to each label.
6. **SkeletonBlock** — Rough.js outline (snaps in instantly, roughness 0.8-1.0) + staggered content cascade via Framer Motion. The visual signature that replaces every shimmer skeleton.
7. **EmptyState** — typed by situation with specific copy and a relevant action CTA. Zero generic "No data" instances.
8. **LoadingState** — gerund-verb rotating micro-text + breathing pulse. Never a bare spinner. Plain-language messages specific to what is happening.
9. **ErrorState** — warm in apology ("Something went wrong — we're on it"), specific in remedy ("Try again" or "Contact support" depending on recoverability).
10. **CommandPalette** — Cmd+K universal action palette. Covers: run agent, find scan, go to page, approve top N, search competitors. Available from every page.
11. **CheatSheet** — `?` overlay showing all single-letter shortcuts and Cmd+K commands. Dismisses on `Escape` or second `?`.
12. **Toast** — agent complete, scan done, approval saved, error. Slides in from `inline-start`. Celebration variant uses Lottie for ONE moment per session.
13. **Sidebar** — locale-aware (right in RTL, left in LTR). Navigation hub with muted chrome so main content dominates. Collapsible to icon-rail.
14. **ScanReveal** — full 10-frame Stage component for `/scan`. Rough.js + Framer Motion. Accepts `seed` prop for stable renders. Respects `prefers-reduced-motion` (snaps to results state). Has "skip" affordance.
15. **DataList** — tabular numerals (`font-feature-settings: "tnum"`), hand-drawn dividers at `roughness: 0.5`, sortable columns with `J/K` keyboard navigation.

### The Duality Principle (Sarah/Yossi)

Sarah is a 52-year-old dentist in Tel Aviv. She has a 2-chair practice, she is not technical, and she has about 90 seconds on a Tuesday morning before her first patient. She opens Beamix, sees a score of 42, sees one button — "Run top fixes — 14 credits" — and clicks it. Two hours later she gets a toast notification: "Done. Your homepage copy was updated and FAQ schema was added." She goes to `/inbox`, clicks Approve on both, and her day is complete. She never saw a step list. She never saw the raw model output. She didn't need to. Yossi is an SEO consultant in Herzliya managing 20 client domains. He opens the same `/home` page, clicks the 42, reads all 9 engine scores side-by-side, selects 8 recommendations with checkboxes, presses Cmd+Enter, watches the workspace step list fill in for the next 40 seconds, then exports the audit log for his client report. Same product. Same screen. No mode switch. The product's entire architecture is built on this principle: Sarah's path is the default path, and Yossi's path is always one click deeper than wherever Sarah stopped. The score is a number Sarah trusts and Yossi interrogates. The recommendation card has one button Sarah clicks and one "Show details" Yossi expands. The Inbox has one "Approve" button Sarah presses and a diff view Yossi reads line by line. Depth lives in the click hierarchy, never in a settings flag.

---

## PART 3 — PAGES

### `/scan` (public, pre-signup)

The product's front door and the category differentiator. User arrives from any channel, types or pastes their domain URL, and watches the 15-17s First Scan Reveal animation unfold without an email gate. The animation is the maximum expression of the Beamix design language: Rough.js URL frame, hand-drawn company-logo bubble, 7 engine orbits in an asymmetric scribbled arc, parallel query lines typing-and-erasing above each engine, mention-pellets flying back to center, score arc filling with count-up, skeleton blocks cascading into real recommendations. On completion, a sticky bottom bar slides in: "Save these results and let Beamix fix them — $79/mo, 14-day money-back →" with a secondary "Email me a copy" option. Sarah's moment: she sees a 42, sees "Your FAQs aren't indexed by AI" and wants someone to fix it. Yossi's moment: he clicks the Gemini pill immediately to see per-engine data. For RTL users, the engine orbit reverses direction, the URL underline reads right-to-left, and the CTA bar mirrors. The `skip` affordance (keyboard `S` or a small "skip" text link) snaps to the results state for `prefers-reduced-motion` users and impatient experts. The animation is the proof of work; the score is the hook; the bottom CTA bar is the conversion moment. Result is persisted for 30 days at `?scan_id=` and carried through into onboarding.

### `/onboarding`

Four-step first-run flow triggered immediately after Paddle checkout. The `?scan_id=` query parameter is detected and the public scan is silently linked to the new account — no re-scan required. Step 1: business profile (name, industry, location — Notion-style morphing preview of the dashboard fills in as the user types). Step 2: language and locale preference (EN or HE, surfaced here so the product feels native from first minute). Step 3: first agent selection (which of the 11 agents to run first — Sarah gets a "We recommend starting with Content Optimizer" default; Yossi sees all 11 selectable). Step 4: credit allocation confirmation ("You have 20 credits — your first fix is ready"). Hand-drawn flourishes appear between steps: path-draw arrows connecting each step indicator, the Excalifont caption "Let's go →" under the CTA on step 4. For Hebrew users, each step mirrors to RTL and all copy is the transcreated Hebrew voice. The progress indicator shows 4 dots, consistent with the product's existing 4-dot convention. Completion routes to `/home` with the first scan score already rendered and the recommended agent pre-queued.

### `/home`

The morning briefing surface. Primary hero element: ScoreDisplay with Score Gauge Fill animation on first load after a new scan completes (delta is shown: "↑ +6 since Monday"). Three recommendation cards below the score — these are the three highest-estimated-impact items from the latest scan, each with a "Run →" CTA. A compact agent status row shows what is running or recently completed. A "Last scan: Tuesday" timestamp with a "Scan now →" link for Yossi who wants fresh data. Empty state (no scan yet): a hand-drawn illustration of the URL bar + Excalifont "Run your first scan →" CTA that routes to `/scan`. For Sarah: she sees the number, reads one sentence, clicks one button, returns tomorrow. For Yossi: the score is clickable (drill-down), the "Run →" button has an `R` keystroke hint on hover, Cmd+K is available. Animation on this page: Score Gauge Fill on score load, Path-Draw Entry for the three recommendation card borders on first render. RTL: sidebar on right, score on left (start side), recommendation cards flow right-to-left, date formatting via `he-IL`.

### `/inbox`

The 3-pane review queue, directly inspired by Linear's triage pattern. Left pane (280px): list of pending agent outputs, each with an agent-type icon, first line of content, and a timestamp. `J/K` keys navigate the list. Center pane (flexible): preview of the selected agent output — for content items, this is the proposed copy with a diff view showing what changed. For schema items, it is the generated JSON-LD with syntax highlighting in Geist Mono. Right pane (fixed, sticky footer): ActionBar with Approve (`A`), Reject, and Request Changes buttons. The Approve button is primary (#3370FF). Keystroke hints float beside each label. An empty Inbox shows a hand-drawn empty-state illustration with the Excalifont caption "Nothing to review" and a "Run an agent →" CTA. For multi-item approval, a "Approve all →" header action with `Cmd+A` shortcut. RTL: the 3-pane order reverses — action bar on left, preview center, list on right. All Inbox animations are minimal: items slide in from inline-start when new, fade out when approved.

### `/workspace`

The agent execution narrative. The main content area shows the agent's current output streaming in real time — for a Content Optimizer run, this is the new homepage copy appearing character by character in step 4 of 6. The 360px right-side AgentStepList panel is the companion: each of the 6 steps is a node on a vertical hand-drawn line, with the active step breathing and the completed steps showing muted checkmarks. When the agent completes, the step list shows a terminal "Done in 47s" card for 8 seconds, then auto-collapses to a 48px rail. The main content area then shows the full output for review, with an "Approve →" CTA routing to `/inbox`. For a user who launched from `/home`, a breadcrumb shows "Home → Content Optimizer." For Yossi, each step in the panel is expandable (chevron) to reveal the raw queries run, engine responses received, and the QA gate verdict. On mobile (<768px), the step panel becomes a bottom drawer with peek state showing the current active step name. RTL: step panel moves to left side; all logical properties apply; step labels are in Hebrew when locale is HE.

### `/scans`

Scan history in two views: a list of past scans (date, score, delta-from-previous, trigger type: manual/scheduled/agent-triggered), and a per-scan detail view. The list uses DataList with hand-drawn dividers and tabular numerals for scores. Clicking any scan opens the detail view: top-level score with Score Gauge Fill (no animation this time, it's historical — fill is instant), per-engine breakdown using EnginePill components, and a recommendations list showing what was suggested, what was run, and what the impact estimate was. The Stripe summary→detail→raw pattern applies: top level is "How did I do?", detail level is "Why?", and expanding any engine shows the per-query raw log in Geist Mono. For Yossi, `G then S` navigates here from anywhere. Empty state: "No scans yet — run your first scan →" with a path-draw arrow. RTL: all date formats via `he-IL`, scores read right-to-left in the per-engine list.

### `/automation`

Recurring scan and agent scheduling. A list of active schedules: each entry shows the agent or scan type, frequency, last-run time, next-run time, and an enabled/disabled toggle. Creating a new schedule opens a form: select agent (from the 11-agent roster), select frequency (daily/weekly/monthly or custom cron), select trigger condition (score drops below X, new competitor appears, etc.). The frequency selector uses a minimal hand-drawn calendar widget for date picking. The page name ("Automation" vs. "Schedules" vs. "Auto-pilot" vs. "Crew") is TBD — Adam decides. Empty state: "No automations yet — let Beamix run in the background →" with a Path-Draw entry illustration of a clock and an arrow. RTL: all date and frequency labels via `he-IL`, toggle positions mirror.

### `/competitors`

Competitor intelligence: who is outranking you in AI answers, on which engines, for which queries. Primary view: a table (DataList) of competitors with their AI Visibility Scores side-by-side with yours, per-engine. Clicking a competitor name opens a competitor profile: their per-engine scores, their top-ranking queries, the gap between their mentions and yours, and a "Run Competitor Intelligence agent →" CTA pre-filled with their domain. The gap chips from AgentStepList step 3 ("Reading your competitor's strategy") link directly here. For Yossi: `G then C` navigates here from anywhere; he can add competitor domains manually; he can run the Competitor Intelligence agent across all 20 of his client domains via Cmd+K. For Sarah: the top of the page shows one sentence — "Here's who's beating you in AI search and why." RTL: competitor names use `<bdi>` isolation where needed.

### `/archive`

Past agent output and historical content: approved copy items, published JSON-LD schema, old recommendations. Organized by date and agent type with a search/filter bar at top. Each item shows agent type, date, status (approved / published / discarded), and a preview snippet. Clicking opens the full item in a read-only view with a "Re-run this agent →" CTA if the content might be stale. The archive is the product's audit trail — Yossi exports it for client reports; Sarah never visits it but it reassures her that "the work is saved." Empty state: "Nothing archived yet — approved agent outputs will appear here." Minimal animation: items load with the SkeletonBlock cascade. No hand-drawn accents — this is a data-dense reference surface.

### `/settings`

Account, billing, language, and preferences. Four tabs: Business Profile (name, industry, location, logo — loaded from DB), Billing (Paddle integration: current plan, next invoice date, manage subscription CTA), Language (EN/HE toggle with live preview of the language change), Notifications (email digest frequency, agent-complete alerts, score-drop alerts). The Language tab is the most important non-obvious feature: toggling to Hebrew immediately changes `<html dir="rtl">` and re-renders the settings page in RTL as a live preview before the user saves. This is the "moment of delight" for Israeli users who didn't expect it to work. Billing tab uses Paddle's portal link — no custom billing UI needed. No hand-drawn animations on settings — Restrained chrome, Linear-style. Keyboard: `G then comma` navigates to settings from anywhere.

---

## PART 4 — KEY FLOWS

### Flow: Public First Scan

User arrives on `/scan` cold — no account, no context. The page shows a centered domain input with a Rough.js drawn border that animates on focus (magnifying glass wobble via perfect-freehand). User types or pastes their domain. Hitting Enter or clicking "Scan →" triggers the ScanReveal component. For the next 15-17 seconds the 10-frame storyboard plays: Rough.js shapes draw in sequence, each engine bubble pulses and queries, mention-pellets fly back to center, the score arc fills with count-up, skeleton blocks cascade into real data. A rotating status message below the animation tells Sarah "Asking Gemini what it knows about your practice..." and tells Yossi the same thing, because there is no split. On frame 10, the sticky bottom bar slides in with the primary CTA. The result is stored at `?scan_id=UUID` and expires in 30 days. If user dismisses without signing up, they receive the "Email me a copy" result at their email address with a unique link to return. The entire flow works in Hebrew RTL with mirrored storyboard and transcreated copy.

### Flow: Signup + Onboarding

User clicks the primary CTA on `/scan` (or navigates directly to `/onboarding`). The Paddle checkout opens (hosted modal or redirect — Paddle's decision). On successful payment, Beamix receives the webhook, creates the user account, and redirects to `/onboarding?scan_id=UUID` if a public scan was in progress. The onboarding 4-step flow plays: step 1 business profile (with Notion-style interface morphing — dashboard skeleton sketches itself in Rough.js as the user fills in their business name), step 2 language/locale, step 3 agent selection (Content Optimizer pre-recommended), step 4 credit confirmation. Hand-drawn path-draw arrows connect the step indicators. Progress dots are always 4 (the step-0 business-profile detail is hidden from the dot count). On completion, the user is redirected to `/home` with the public scan already linked — Score Gauge Fill animation plays on the pre-populated score. First-win feeling achieved in ~90 seconds from the end of the signup flow.

### Flow: Agent Run (Workspace)

User clicks "Run →" on a RecommendationCard from `/home` or `/inbox`. Alternatively, Cmd+K → "Run Content Optimizer." The workspace opens: center area shows a loading state ("Reading your website...") while the right-side AgentStepList panel populates step 1 as the active node. The 6-step Content Optimizer sequence runs: (1) "Reading your website" with page favicon in a Rough.js frame — (2) "Asking each AI what they say about you" with 4 engine logos blinking in stagger — (3) "Comparing what each AI said" with gap chips appearing inline — (4) "Writing better content for your homepage" — NEW CONTENT STREAMS CHARACTER BY CHARACTER in the center area — (5) "Checking it sounds right" with three green check chips — (6) "Ready for your approval" with terminal CTA. Each step is visible in the right panel, expanding via chevron for Yossi who wants to see raw engine responses. The step panel collapses 8s after completion. User is invited to go to `/inbox` to Approve or Reject. The center area stays visible so Sarah can read the new copy before deciding.

### Flow: Inbox Review

User arrives in `/inbox` (from toast notification, from workspace CTA, or from sidebar nav). Left pane shows 3 pending items. User sees item 1 highlighted (or presses `J` to navigate). Center pane shows the proposed homepage copy with a word-diff view: removed text in light red strike-through, added text in light green. The ActionBar sticky footer shows Approve (`A`), Reject, and Request Changes. User presses `A` — item 1 is approved, a subtle toast "Approved — publishing now" appears from inline-start, the item fades from the left list, and item 2 is auto-focused. User reads item 2, disagrees with one sentence, clicks "Request Changes," types "Make this sound less formal," and submits — the item returns to the agent queue for revision. User approves item 3. Inbox is empty. Empty state: "Nothing to review — " with the path-draw illustrated Excalifont caption. The entire flow works in RTL with the 3-pane order reversed.

### Flow: Recurring Scan

A scheduled Inngest job runs the scan engine in the background on the configured frequency (e.g., every Monday at 8am). No user action required. On completion, the score delta is computed against the previous scan. If the score improved: a toast on next `/home` load — "Your score went up 4 points since last week →" — and the ScoreDisplay shows the new score with delta badge. If the score dropped: a more urgent toast — "Your visibility dropped — here's what to fix →" — with a direct link to the top 3 new recommendations. Score Gauge Fill animation plays when the new score renders. The silent background nature of this flow is the "Beamix does the work for you" promise made tangible — Sarah opens the app once a week and sees progress, without having initiated anything.

### Flow: Schedule Setup

User navigates to `/automation` and clicks "Add schedule →." A form drawer opens from inline-end (locale-aware): select agent from a searchable list of the 11 agents (icons, plain-language names, one-line descriptions — no technical jargon). Select frequency: daily / weekly / monthly / custom. For weekly, a minimal hand-drawn calendar widget lets user pick the day. For custom, a cron-expression input with Geist Mono and live plain-language preview ("Every Monday and Thursday at 9am"). Optional: trigger condition ("only run if score dropped more than 5 points"). Confirm → schedule appears in the `/automation` list. The drawer closes with a path-draw entry. No more setup required — the agent runs on its own from here.

### Flow: Hebrew Switch

User opens `/settings` → Language tab. Two options: English (EN), Hebrew (עברית). User selects Hebrew. The Settings page immediately re-renders in RTL: sidebar moves to right, all labels swap to Hebrew (Rubik/Heebo fonts activate, replacing InterDisplay/Inter), the Language option now shows "עברית" selected with a blue indicator. The live preview shows the change before the user saves. The save button (now "שמור") confirms. From this point: all pages render in RTL, dates use `Intl.DateTimeFormat('he-IL')`, currency shows `₪` before the number, the First Scan Reveal storyboard mirrors when the user next runs a scan. Agent output content (the actual generated copy) is now produced in Hebrew by the LLM — not a UI translation, but Hebrew-native content generation. The language setting is stored in the user's profile and respected on every subsequent session.

### Flow: Score Drill-down

User on `/home` sees their Beamix Score: 42. They click the number. The ScoreDisplay expands inline — no navigation, no new page — to reveal the per-engine breakdown: 9 EnginePill rows (ChatGPT 38, Gemini 45, Perplexity 40, Claude 51, AI Overviews 39, Grok 42, You.com 44, and two more per plan). Each row shows a simple bar chart in the semantic score color. Sarah sees this, reads "Claude scores highest — " and feels informed. Yossi clicks "Gemini 45" — the Gemini row expands to show the 25 queries Beamix ran on Gemini, each with a mentioned/not-mentioned indicator and the mention text excerpt. Yossi clicks one query row — raw model output from Gemini for that query appears in a Geist Mono code block with the exact text that mentioned or did not mention the business. He's now 4 layers deep from the original "42" — and he got there by clicking, not by navigating to a separate page or toggling a mode. Sarah never saw layers 2-4. Both users got exactly what they needed.

---

## PART 5 — VOICE + MICROCOPY

### English Voice — 8 Principles

1. No jargon on surfaces Sarah will touch. Technical terms live one click deeper — Yossi finds them there.
2. Outcome before mechanism. "Your homepage was updated" not "Content Optimizer agent completed run #4821."
3. Second-person singular ("Your score," "You have 3 fixes ready").
4. Warm in apology, serious in success. "Something went wrong — we're looking into it" not "Error 500."
5. Plain noun over clever metaphor, unless the metaphor adds genuine clarity without requiring explanation.
6. Numbers always as numerals — "3 fixes" not "three fixes," "42" not "forty-two."
7. Verbs are specific — Approve not Submit, Run not Execute, Fix not Optimize.
8. CTAs that lead to a next state end with `→` — "Save these results →", "Run top fixes →", "See what's broken →".

### Hebrew Voice — 8 Principles

1. Gender-neutral always — infinitives ("הפעלת סריקה") or inclusive plural ("בואו נתחיל", "שפרו את הדירוג שלכם"). Never male imperatives ("סרוק", "לחץ").
2. Keep "AI" in English — "ציון נראות ב-AI" not "ציון נראות בבינה מלאכותית" (too formal, too long).
3. Mixed bidi text uses `<bdi>` isolation — "Beamix", "ChatGPT", "Gemini", any brand name embedded in Hebrew prose.
4. Western numerals (0-9) always, even in RTL flow — "80% מהלקוחות" not "שמונים אחוז".
5. Israeli formatting: `₪79/חודש`, `DD/MM/YYYY` or `Intl.DateTimeFormat('he-IL')`, phone `054-123-4567`.
6. Hebrew text expands 1.3-1.8× relative to English — UI buttons and labels must accommodate the longer strings without truncation.
7. Avoid male-default copy — Google Israel's Goliath project is the canonical reference.
8. SaaS jargon that has no natural Hebrew equivalent stays English-transliterated — "Dashboard" → "לוח בקרה" (established) but "GEO" stays "GEO".

### Phrase Pair Table (20 locked + 8 extended)

| # | English | Hebrew | Notes |
|---|---------|--------|-------|
| 1 | AI Visibility Score | ציון נראות ב-AI | Keep "AI" in English |
| 2 | Run a Scan | הפעלת סריקה | Infinitive, gender-neutral |
| 3 | Inbox | לבדיקה שלך | Warmer than literal "תיבת דואר" |
| 4 | Recommendations | המלצות | Standard, works perfectly |
| 5 | Your Crew / Agents | הצוות שלך | "Team" is warmer than "Agents" |
| 6 | Connect Your Business | חיבור העסק שלך | Infinitive |
| 7 | Dashboard | לוח בקרה | Established Hebrew tech term |
| 8 | Settings | הגדרות | Standard |
| 9 | Scan Results | תוצאות הסריקה | Direct |
| 10 | Content Optimizer | אופטימיזציית תוכן | Mix is natural |
| 11 | Competitor Analysis | ניתוח מתחרים | Standard business Hebrew |
| 12 | Your AI Search Visibility | הנראות שלך בחיפוש AI | Possessive + "נראות" |
| 13 | Get Started | בואו נתחיל | Inclusive plural |
| 14 | Upgrade Plan | שדרוג מסלול | "מסלול" for pricing tier |
| 15 | Trial Period | תקופת ניסיון | Standard |
| 16 | Monthly / Annually | חודשי / שנתי | Format: ₪79/חודש |
| 17 | Notifications | התראות | Standard |
| 18 | Search Engines / AI Engines | מנועי חיפוש / מנועי AI | |
| 19 | Mentioned / Not Mentioned | מוזכר / לא מוזכר | Scan results |
| 20 | Improve Your Ranking | שפרו את הדירוג שלכם | Plural imperative, gender-neutral |
| 21 | Approve | אישור | Action verb in inbox |
| 22 | Reject | דחייה | |
| 23 | Run Agent | הפעלת סוכן | Infinitive |
| 24 | Score Drill-down | פירוט הניקוד | "ניקוד" = scoring |
| 25 | Automation / Schedule | אוטומציה / לוח זמנים | Pick one when page name is decided |
| 26 | Archive | ארכיון | Direct |
| 27 | Ready for your approval | מוכן לאישורך | Terminal agent state |
| 28 | Something went wrong | משהו השתבש | Error state, warm entry |

GEO-specific terms (English-retained):
- GEO → GEO (ג'יאו transliterated)
- AI Overview → AI Overview (Google product name)
- Entity Authority → סמכות יישות (Israeli GEO practitioners' established term — Nati Elimelech)
- Structured Data → מידע מובנה
- Citations → ציטוטים

---

## PART 6 — DEPENDENCY ORDER (NO TIMELINES)

### What ships before what

**Foundation (nothing else works without this):**
- Typography load: fix InterDisplay (currently broken/falling back to Inter); add Rubik (variable) + Heebo (variable) + Excalifont to font stack
- Color tokens: establish CSS custom properties with `#2558E5` as the text-safe accent variant alongside `#3370FF`
- RTL plumbing: CSS logical properties across all components; `next-intl` configured for EN/HE routing; `shadcn/ui` with `rtl: true` in `components.json`; `dir="rtl"` on `<html>` triggered by locale
- Animation primitives: Framer Motion (already in stack — confirm usage patterns), Rough.js installed + `seed`-parameter discipline established, perfect-freehand installed
- Primitive components replacing Shadcn defaults: PrimitiveCard (with Rough.js border variant), ScoreDisplay, EmptyState (typed variants), LoadingState (gerund-verb rotating), ActionBar, CommandPalette skeleton

**Then in dependency order (each depends on the one above being complete):**

1. `/scan` (public) — proves the full design language under real acquisition pressure. ScanReveal (10-frame animation), ScoreDisplay, SkeletonBlock Cascade, EnginePill, RecommendationCard read-only, sticky CTA bottom bar.
2. Signup + `/onboarding` — converts the public scan. Paddle checkout integration, `?scan_id=` linkage, 4-step flow with Notion-style morphing preview, Hebrew locale selection in step 2.
3. `/home` — the daily anchor surface. ScoreDisplay with delta badge, top 3 RecommendationCards with Run CTA, agent status row, empty state if no scan.
4. `/workspace` — agent execution narrative. AgentStepList (the right-panel 360px component), main content streaming area, 6-step Content Optimizer template, mobile bottom-drawer variant.
5. `/inbox` — review queue. 3-pane DataList + preview + ActionBar, `J/K` navigation, `A` approve shortcut, diff view for content items, JSON display for schema items.
6. `/scans` — scan history + detail. DataList of past scans, per-scan detail with per-engine breakdown, query-level drill-down, Stripe-style summary→detail→raw layering.
7. `/automation` — schedules. Schedule list, new-schedule drawer, frequency selector with hand-drawn calendar widget, cron-expression input with plain-language preview.
8. `/competitors` — competitor intelligence. Competitor table with side-by-side scores, competitor profile view, "Run Competitor Intelligence →" CTA, domain-input for adding competitors.
9. `/archive` — content history. Past output list with filter/search, read-only item view, "Re-run →" CTA.
10. `/settings` — last (least frequently visited). 4 tabs: Business Profile, Billing (Paddle portal), Language (live RTL preview toggle), Notifications.

### What is deferred (architect for, ship without)

- Beamie persistent companion — Rive runtime scaffolded, state machine designed, ships when base product is complete
- Memory layer — depends on Beamie; architect DB schema for conversation history now
- Shareable Scan Card — viral loop; high-ROI when shipped; deferred until core is right
- Public GEO Index (`beamix.tech/check-my-site`) — content authority play; deferred
- State of GEO newsletter — content marketing; deferred
- Marketing site unification — Adam decides when product is right; Framer is separate
- Dark mode — post-launch; design tokens structured for it from the start (use CSS custom properties)

### Anti-pattern recap (never build these)

No bare spinners. No progress bars without narrative. No tinted-square agent icons. No Pro mode toggle. No Beginner/Advanced mode. No mascot/character before base product is right. No node-edge graphs for agent flow. No bolted-on Hebrew. No animating skeleton outlines. No tech-jargon status messages. No arbitrary px font sizes. No Comic Sans / Marker Felt fonts. No emoji-heavy status copy. No randomized Rough.js seed values. No always-on side panel wider than 360px. No scrolling-forever log panels. No dark mode at launch. No Framer marketing site work in this repo. No timelines, sprints, or week estimates. No partial RTL rollout (if Hebrew ships, it ships everywhere).

---

## NEXT STEPS

1. Adam reviews this Vision Framework and confirms or adjusts any section.
2. Per-page deep dive: one conversation per page, starting with `/scan` (the highest-stakes surface). Adam reacts; the spec grows.
3. Per-flow deep dive same way.
4. Per-component spec same way: start with ScanReveal and AgentStepList (the two most complex components).
5. Build Lead spawns frontend-developers per page in the dependency order above, with no timeline pressure — quality bar drives completion.

---

## OPEN QUESTIONS FOR ADAM

1. **Page name for `/automation`** — "Automation," "Schedules," "Auto-pilot," or "Crew"? Each has a different positioning implication. "Crew" connects to the 11-agent team framing; "Schedules" is the most literal; "Auto-pilot" is the most benefit-forward.
2. **11th agent** — The MVP-1 roster lists 10 named agents (Query Mapper, Content Optimizer, FAQ Builder, Schema Agent, Freshness Agent, Competitor Intelligence, Performance Tracker, Off-Site Presence Builder, Reddit Presence, Link Builder) and references one more. What is the 11th agent's name and purpose?
