# Reference Hunt 3 — URL/Scan/Onboarding Animation Patterns
Date: 2026-04-25
Goal: References for "user types URL → watches scan → sees results" — hand-drawn aesthetic, 15s+, sequential narrative.
Confidence (overall): MEDIUM-HIGH

---

## TOP 5 ANCHORS for the Beamix First Scan Reveal

### Anchor 1 — Perplexity Pro Search (the 15-second narrative)
- URL: https://www.perplexity.ai/
- WHY: Perplexity solved "users will wait if you show progress." Their philosophy: *"You don't want to overload the user with too much information until they are actually curious. Then, you feed their curiosity."* They display the **plan being executed step-by-step** with expandable per-stage sections.
- WHAT TO COPY: "Show the plan, narrate each step, expand on demand." Beamix's 7-engine query phase mirrors Perplexity's step list — each engine = a step that lights up, completes, offers hover preview.
- Source: https://www.langchain.com/breakoutagents/perplexity

### Anchor 2 — Excalidraw + Rough.js (hand-drawn aesthetic, technical foundation)
- URL: https://roughjs.com/ · https://excalidraw.com
- WHY: Adam's vision is hand-drawn. Rough.js (<9kB gzipped, Canvas + SVG) is the canonical library. Algorithm: randomize line endpoints, add bowing curvature via mid-point displacement.
- WHAT TO COPY: Use Rough.js for every "drawn" element — URL underline, box around captured URL, engine-bubble circles, connection lines, score wedge. Pair with Framer Motion `<motion.path>` + `pathLength` for stroke-drawing animation.
- Sources: https://roughjs.com/ · https://shihn.ca/posts/2020/roughjs-algorithms/ · https://excalidraw.com

### Anchor 3 — Speedtest.net / Ookla (the gauge-builds-then-reveals pattern)
- URL: https://www.speedtest.net
- WHY: Gold standard for "input → watch gauge build → see number land." 5M+ tests/day. Needle-sweep + counting-number reveal is the canonical "results land at the end of a journey" moment.
- WHAT TO COPY: The **counting-up score** at the climax. Beamix's GEO score counts up from 0 to e.g. 67/100, with the dial-arc filling synchronously beneath, hand-drawn.
- Sources: https://www.sfcd.com/work/speedtest/ · https://www.behance.net/gallery/18560233/Ookla-Speedtest

### Anchor 4 — Plaid Link (per-step branded loading)
- URL: https://plaid.com/plaid-link/
- WHY: Plaid sets the standard for "this connection feels safe and familiar." Reduced per-pane load time ~30% by foregrounding **per-step branded animations** — loading screen uses chosen brand color so transitions feel intentional, not generic.
- WHAT TO COPY: Each scan stage gets its own brief, custom transition. Beamix Blue (#3370FF) anchors all motion. Familiarity = trust.
- Source: https://plaid.com/blog/inside-link-design/

### Anchor 5 — Notion Onboarding (real-time interface morphing)
- URL: https://www.notion.com (onboarding)
- WHY: *"As users define their intended use case during onboarding, the interface preview morphs in real-time, offering a tangible glimpse into what their workspace will look like."* Closest analog to "user types URL → outline of their dashboard sketches itself in."
- WHAT TO COPY: As URL is being typed, start sketching the result frame in the background — let users see *their* future dashboard taking shape before scan finishes.
- Sources: https://www.candu.ai/blog/how-notion-crafts-a-personalized-onboarding-experience-6-lessons-to-guide-new-users · https://goodux.appcues.com/blog/notions-lightweight-onboarding

---

## FULL REFERENCE LIBRARY (25 products)

### High Relevance — Free URL Scanner Tools

| # | Product | Sequence | Style | Duration | Verdict for Beamix |
|---|---|---|---|---|---|
| 1 | **Google PageSpeed Insights** (pagespeed.web.dev) | URL → Analyze → ~5-25s wait → score-rings draw → metric cards reveal | Subtle, score-arc fills 0→N with count-up. No personality. | ~5-25s | Steal score-arc count-up. Skip cold spinner. |
| 2 | **WebPageTest** (webpagetest.org) | URL+config → queue position → live waterfall → multi-tab results | Utility-grade. Real-time progress with **queue position** | 30s-5min | Steal transparent queue/stage status ("Querying GPT-4o…"). Filmstrip-style "before/after of your visibility" = future feature. |
| 3 | **GTmetrix** (gtmetrix.com) | URL → "Test" → loading screen with rotating tips → results dashboard | Educational waiting | ~30-60s | Steal **rotating tips during wait**, but Beamix narrates *what's happening*, not generic SEO trivia. |
| 4 | **SEOptimer** (seoptimer.com) | URL → 100-data-point analysis → grade A-F per category → PDF export | "Generate PDF Audits in 20 seconds" | ~20s | **Letter-grade-per-category cascade** = clean reveal pattern for 7-engine breakdown. |
| 5 | **Ahrefs Free Site Audit** (ahrefs.com/site-audit) | URL → email gate → background crawl → email when complete → dashboard reveal | Async, email-triggered | minutes-hours | Async pattern is wrong for first-impression. **Beamix MUST stay synchronous (15s).** Steal only the issue-grouping (errors/warnings/notices). |
| 6 | **Semrush Free Site Audit** (semrush.com/siteaudit/) | URL → loading overlay → health score (0-100) + thematic groups | Cascading category cards. Recently added "AI Search Issues" | varies | **Direct competitor.** Their "AI Search Issues" framing IS what Beamix is building. Differentiate via hand-drawn aesthetic + animated narrative. |
| 7 | **Similarweb** (similarweb.com/website/) | Domain → submit → instant results (data is precomputed) | Dashboard, no real wait | instant | **Anti-pattern.** Don't copy. Beamix's scan is real-time per-URL. |
| 8 | **Sitechecker Pro** (sitechecker.pro) | URL → loading → health-score + categories | Generic SEO tool aesthetic | varies | Pattern repetition. Beamix avoids by going hand-drawn. |
| 9 | **Backlinko Free SEO Checker** (backlinko.com/tools/seo-checker) | "Drop in a URL. Get a real-time on-site SEO report. No setup, no signup, no waiting." | Marketing copy promise | instant | **Steal the "no setup, no signup" promise wording** for public landing page. |
| 10 | **Speedtest.net (Ookla)** | (See Anchor 3) | Count-up gauge | ~10s | Gold-standard count-up gauge reveal. |
| 11 | **Fast.com (Netflix)** | Page loads → speed test starts **automatically, no input** → big number ticks up | Maximally minimalist white-on-black, single number | ~5-10s | **The minimalism master.** Score number is the hero — everything else can shrink during climax. Frame 7 borrows from Fast.com. |
| 12 | **Cloudflare Speed Test** (speed.cloudflare.com) | Auto-runs → live updating ms/Mbps → animated chart fills as test progresses | Live-fill chart | varies | The **live-emerging-results** pattern (chart fills WHILE testing) — Beamix could let engine-result chips fill in live as each engine completes. |

### Medium Relevance — AI Search Visibility (Direct Competitors)

| # | Product | Pricing | Status |
|---|---|---|---|
| 13 | **Otterly.ai** | $29/mo, monitoring-focused | Direct competitor. **Beamix's free public scan is the differentiator** — Otterly requires signup before any value. |
| 14 | **Peec AI** | €89/mo, mid-market | No public free scan = Beamix wins acquisition funnel. |
| 15 | **Profound** | $499+/mo enterprise | Different segment. No public scan — Beamix uncontested in SMB. |

### Medium Relevance — Multi-Step Onboarding & Reveal Patterns

| # | Product | Pattern | What to copy |
|---|---|---|---|
| 16 | **Stripe Connect / Atlas Onboarding** | Multi-step embedded forms, persistent progress bar, OnboardingView component | Persistent progress affordance during 15s wait — user knows where in journey |
| 17 | **Plaid Link** | (See Anchor 4) | Per-step branded transitions |
| 18 | **DocuSign Signing** | Step-by-step field highlight, auto-advance, completion reveal | **Completion celebration** at the end (large checkmark, color shift) |
| 19 | **Linear Onboarding** | Welcome → light/dark → keyboard shortcut → join team → integrations. *"Isn't trying to be impressive or clever and doesn't rely on animations."* | **Inverse lesson.** Linear restraint works for power tools. Beamix sells to SMBs needing magic in 15s. Bigger animation than Linear, smaller than Speedtest drama. |
| 20 | **Notion Onboarding** | (See Anchor 5) | Interface morphs in real-time |
| 21 | **Granola First Meeting** | Calendar sync → upcoming meetings appear → live transcript streams during call → AI structures notes | Steal **streaming-text-during-wait** pattern. While 7 engines query, Beamix shows scrolling sample queries. User feels something real is happening. |
| 22 | **Perplexity Pro Search** | (See Anchor 1) | Step-by-step plan execution |
| 23 | **Cursor "Index Your Codebase"** | Indexing starts automatically, progress visible only in Settings | **Anti-pattern.** Cursor hides indexing — wrong for Beamix where wait IS the show. Inverse: surface every detail. |
| 24 | **Vercel Deploy Preview** | Push → Build → Deploy → live preview URL. Stages emit log lines, color-coded | Steal **stage-checkmark-flips-as-each-engine-completes** pattern. 7 engine cards, each progresses queued → querying → done with satisfying checkmark animation. |
| 25 | Mozbar/Moz/Woorank/HOTH | "Enter URL → instant grade" cluster | **Commodity baseline.** Hand-drawn 15s narrative is what differentiates Beamix from this entire category. |

---

## THE BEAMIX FIRST SCAN REVEAL — 10-Frame Storyboard

Total target: **~15 seconds**, sequential, hand-drawn via Rough.js + Framer Motion.

### Frame 1 — "User typing the URL" (0s → 1.5s)
- Characters appear with **pencil-stroke entrance** (~80ms per char). Input field has Rough.js underline that extends as URL grows. Cursor blink = micro-pen flick.
- Closest reference: Notion (real-time morphing on input).

### Frame 2 — "URL captured & framed" (1.5s → 2.8s)
- User hits Enter. **Hand-drawn rectangle sketches itself** around URL (4 sides sequential, SVG `pathLength` 0→1, ~600ms each, slightly overlapping). URL text shifts up to center stage, rest of landing fades to 5% opacity.
- Closest: Excalidraw selection-rectangle aesthetic. Rough.js rectangle, Beamix Blue stroke #3370FF, ~3px sketchy stroke.

### Frame 3 — "Company logo + name inferred" (2.8s → 4.5s)
- Line draws from URL down-left to circular bubble. Inside bubble, favicon pings in (or sketched generic globe), then inferred company name **types itself out** below in InterDisplay-Medium.
- Closest: Stripe Connect onboarding (per-step branded reveal); Granola (data populating live).
- Hand-drawn line + circle bubble; favicon from `/favicon.ico` or Clearbit Logo API; name extracted from `<title>` or OpenGraph.

### Frame 4 — "7 AI engines materialize" (4.5s → 6.5s)
- Around central URL/logo bubble, **7 smaller engine bubbles** sketch themselves in hand-drawn arc/orbit. Each draws sequentially (~200ms each, total 1.4s), labeled in handwritten font, faint dashed connector back to center.
- Closest: Vercel deploy stages (each stage flips on); Speedtest needle prep.
- Bubbles arrange in **asymmetric scribbled orbit, NOT a perfect circle** (intentional roughness). Each engine has actual brand-color tint inside its bubble outline.

### Frame 5 — "Engines queried in parallel" (6.5s → 11s) ← longest stage
- Each engine bubble pulses in slight stagger (waves of 0/200/400ms offsets). **Scribbled arrow** flies from center URL bubble out to each engine, then return arrow flies back. **Above each engine**, a single sample query line types-then-erases (e.g., "best dentist in Tel Aviv?", "top SEO agencies?") — real Beamix prompts pulled from user's industry. Each engine's bubble fills with thin progress arc as query completes.
- Closest: Perplexity (step-by-step plan execution); Granola (streaming text during wait); Cloudflare speed test (live-fill).
- **This is the heart of the 15s** — must feel alive. Parallel staggered animation, not sequential. ~4.5s total covers all 7 in parallel.

### Frame 6 — "Results gather at center" (11s → 12.5s)
- Each completed engine bubble emits **small icon/pellet** (mention found = filled dot; not mentioned = empty dot) flying along connector back to center URL bubble. Center grows to absorb. Counter beneath: "Mentions found: 3 / 7" ticks up live.
- Closest: Speedtest gauge gathering speed (count up).

### Frame 7 — "Score forms + counts up" (12.5s → 13.5s)
- Below central bubble, **hand-drawn score arc** (semi-circle dial) sketches in. Then **large numeric counter** ticks rapidly from 0 to final score (e.g., 67/100). Arc fills synchronously beneath. Color gradient based on score: red→amber→green using #EF4444 → #F59E0B → #10B981.
- Closest: Speedtest.net (canonical count-up); Fast.com (number-as-hero); PageSpeed Insights (score arc).
- Hand-drawn arc (Rough.js), numeric counter in InterDisplay (NOT handwritten — readability is critical for the climax).

### Frame 8 — "Result blocks reveal with skeleton-fill" (13.5s → 15s)
- Below score, rest of page **slides up** revealing **outline-only skeleton blocks** for: per-engine breakdown card, top recommendations card, competitor benchmark card. Each block's outline is hand-drawn (Rough.js). Then content **fills in** each block in **staggered cascade** — header text writes first, body content fades in 100ms after, last 200ms for small metadata. Stagger ~150ms between blocks.
- Closest: NN/G skeleton screens; Stripe dashboard's "minimal, elegant" skeleton-shimmer; Motion.dev React skeleton-shimmer example.
- **Skeleton outlines are Rough.js sketches, NOT standard gray rounded rectangles. This is the visual signature.**

### Frame 9 — "First recommendation highlights" (15s → 16s)
- Top recommendation card pulses once with Beamix-Blue glow. Hand-drawn **arrow/circle** scribbles around its CTA ("Add a FAQ section about pricing"). 1s emphasis, then fade.
- Closest: Excalidraw (post-it annotation feel); Notion (interactive learning).
- Single, small flourish — don't over-emphasize.

### Frame 10 — "CTA appears" (16s → 17s)
- Sticky bottom bar slides in: *"Save these results & let Beamix fix them →"* Button is Framer-style pill (border-radius 999px), Beamix Blue background. Arrow micro-bounces every 4s thereafter.
- Closest: DocuSign completion; Linear's clear-single-next-action.
- Two CTAs — primary (signup/Paddle), secondary text-only (email me a copy). "No dead ends, one clear next action."

**Total target: 15-17s.** First 4 frames build context (4.5s). Frame 5 is heart-rate climber (4.5s). Frames 6-7 are climax (3s). Frames 8-10 are payoff (3s). **Sweet spot is 14-16s** based on Speedtest/Plaid attention-budget research.

---

## RESULTS REVEAL PATTERNS — 5 Cleanest Hand-Drawn Skeleton-Fill Implementations

1. **Notion Real-Time Workspace Morph** — best overall match. Interface preview morphs as user defines use case. Beamix adapts: as engines complete, dashboard outline blocks fill with that engine's data live.
2. **Motion.dev React Skeleton Shimmer** — production-ready React + Motion.dev with shimmer-fill. Direct lift candidate, restyled with Rough.js outlines.
3. **Cloudflare Speed Test Live-Fill Chart** — chart fills DURING the test. Per-engine cards fill live during Frame 5.
4. **Stripe Dashboard Skeleton** — industry "gold standard" of restraint. Subtle gradient sweep, low-contrast gray placeholders matching layout exactly. Beamix inverts the aesthetic, keeps the discipline.
5. **Excalidraw + GSAP Staggered Reveal** — outlines themselves; staggered cinematic cadence.

**Implementation pattern (Beamix-specific):**
```
1. Render Rough.js skeleton outlines for each result block (header bar, body bar x N, meta bar).
2. Framer Motion staggerChildren=0.15s on parent.
3. Each child: opacity 0→1 + translateY 8→0, 280ms ease-out.
4. Inside each block: text-content fades in via sub-stagger AFTER outline lands (delay 100ms per child).
5. Outline strokes are NOT animated to draw — they appear instantly so skeleton feels solid.
```

---

## ONBOARDING POST-SIGNUP — Maintaining Animation Language

**Beamix's continuity rule:** Hand-drawn aesthetic from Frame 1-10 appears in **micro-doses** post-signup — one Rough.js underline on first dashboard heading, one sketched arrow pointing to first agent CTA — but rest of dashboard is clean Beamix product UI. **The animation language is a brand signature, not a UI mode.**

- **Linear lesson (restraint):** wrong post-scan. User just experienced 15s magic. Drop them into a calm-but-still-warm environment, not utility-grade.
- **Notion lesson (interactive preview):** Show dashboard with scan results pre-loaded. First dashboard view IS the result blocks the user just saw, persistent and slightly enhanced.
- **Granola lesson (continuity):** Each post-signup step unlocks one specific feature with tiny hand-drawn flourish (≤500ms).
- **Stripe Connect lesson (persistent progress):** Step indicator (e.g., 1/4) at top reassures how short remaining setup is.

---

## ANTI-PATTERNS for Scan Reveals

| Anti-pattern | Why it fails |
|---|---|
| **Generic spinner with "Loading…"** | No narrative; abandonment <5s on cold spinners |
| **Progress bar 0→100% with no narrative** | Bar without context measures wait, doesn't reduce it |
| **All-at-once results dump after wait** | Wastes the climax. Skeleton-stagger always outperforms. |
| **Long static "wait" with no movement** | Dead pixels = perceived freeze = abandoned page |
| **Tech-jargon status messages** | "Querying API endpoint…", "Hitting GPT-4o…" — alienates SMBs. Outcome-focused: "Asking ChatGPT what it knows about you…" |
| **Cursor-style hidden indexing** | Forum complaints: users don't know when done. Beamix MUST surface every step. |
| **Email-gated async reveal** (Ahrefs) | Breaks first-impression flow. Free public scan is acquisition wedge. |
| **Over-animation — distracting parallax/loops** | Adds 2.1s load, +28% bounce, -7.8% revenue. Hand-drawn risks looking childish if everything wiggles. |
| **Animating skeleton outlines drawing in** | Conflict: outlines AND content animating = eye doesn't know where to land. **Rule: outlines snap in instantly; content cascades in.** |
| **Forgetting the result is the hero** | Fast.com's lesson: at climax, score dominates. Don't keep engine bubbles + score arc + result blocks all competing in Frame 7. |

---

## Key Sources
- https://www.langchain.com/breakoutagents/perplexity
- https://roughjs.com/
- https://shihn.ca/posts/2020/roughjs-algorithms/
- https://excalidraw.com
- https://www.sfcd.com/work/speedtest/
- https://plaid.com/blog/inside-link-design/
- https://www.candu.ai/blog/how-notion-crafts-a-personalized-onboarding-experience-6-lessons-to-guide-new-users
- https://www.nngroup.com/articles/skeleton-screens/
- https://blog.logrocket.com/ux-design/skeleton-loading-screen-design/
- https://motion.dev/examples/react-skeleton-shimmer
- http://techblog.netflix.com/2016/08/building-fastcom.html
- https://docs.stripe.com/connect/onboarding
- https://docs.granola.ai/help-center/taking-notes/transcription
- https://forum.cursor.com/t/codebase-indexing-indicator/56627
- https://vercel.com/docs/deployments/logs
