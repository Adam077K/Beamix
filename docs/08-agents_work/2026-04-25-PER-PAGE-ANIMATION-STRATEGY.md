# Beamix Per-Page Animation Strategy
Date: 2026-04-25
Author: Product Manager (joining the planning sync)
Status: PROPOSAL — Adam answers yes/no per page
Quality bar: every motion decision must clear the billion-dollar bar (Stripe / Linear / Anthropic / Mercury level), not the AI-template bar.

Sources synthesized:
- `docs/08-agents_work/2026-04-25-PAGE-LIST-LOCKED.md` — 11 surfaces, frequency-by-persona
- `docs/08-agents_work/2026-04-25-HOME-DESIGN-SPEC.md` — entrance choreography rules, sessionStorage flag, signature motion list
- `docs/08-agents_work/2026-04-25-HOME-PREMIUM-REFS.md` — 12 expensive patterns, 8 anti-patterns
- `docs/08-agents_work/2026-04-25-REFS-01-handdrawn-animation.md` — restraint discipline, Claude/Excalidraw/tldraw/Notion-AI/PostHog patterns
- `docs/08-agents_work/2026-04-25-REFS-03-url-scan-onboarding.md` — 10-frame First Scan Reveal + the locked anti-pattern: "skeleton outlines snap in instantly; content cascades"
- `docs/08-agents_work/2026-04-25-REFERENCES-MASTERLIST.md` — 5 signature motions, design-language locks
- `~/.claude/projects/-Users-adamks-VibeCoding-Beamix/memory/project_quality_bar_billion_dollar.md` — the bar

---

## EXECUTIVE READ

The skeleton-outline-drawing pattern (Rough.js sketches with stroke-dashoffset 0→1) is **the most expensive motion primitive Beamix owns**. It earns its keep on `/scan` and `/onboarding` because both are once-ever surfaces where dramatic narrative IS the value proposition. It is **wrong** on every Tier 3 daily page (`/home`, `/inbox`, `/workspace`, daily `/scans`, daily `/competitors`) — there a 1.5s sketch-in becomes friction the first time and contempt by the fifth visit. It earns its keep on **two Tier 2 first-visit-only states** (`/crew` first visit, `/reports` first time) where the "introducing this surface" job justifies the budget. Everywhere else, the skeleton snaps, the content cascades, and the page proves quality through data treatment, typography, spacing, and per-element micro-motion — not through page-level theater. Rauno's frequency-aware rule is the spine of this whole document.

---

## THE FRAMEWORK — 3 frequency tiers

Adam's locked PAGE-LIST gives us per-persona frequency for every surface. Mapping that to a motion budget:

### Tier 1 — One-time / rare experiences (high motion budget)
**Surfaces:** `/scan` (public, once per visitor — the acquisition wedge) · `/onboarding` (once per account, gated post-Paddle) · empty states across the product (zero or one time per surface) · first-visit-only states on `/crew` and `/reports`.

**Budget:** generous. Full skeleton-outline-drawing is appropriate. 1.5–17s narratives are appropriate. This is where the brand promise is delivered as motion.

**Reasoning:** users will only experience this once. Investment per impression is acceptable because the impression is foundational. The 10-frame First Scan Reveal converts skeptics into trial users; the onboarding flourishes turn paid signups into engaged users. Linear lesson (REFS-01 #13): chrome should be calm so bursts of personality land harder — Tier 1 is where the bursts happen.

### Tier 2 — Weekly-monthly visits (moderate motion budget)
**Surfaces:** `/crew` (Sarah 1-2x/month, Yossi weekly) · `/schedules` (Yossi weekly, Sarah never) · `/competitors` (Sarah monthly) · `/reports` (Yossi weekly, Scale-tier only) · `/settings` (Yossi monthly).

**Budget:** moderate. Signature motions on key elements only. NO full-page skeleton-draw on load. Typography and spacing carry the quality bar; motion is reserved for the elements that genuinely change (data updates, new agent runs, schedule edits).

**Reasoning:** users return often enough that page-level theater becomes friction, but rarely enough that they don't have muscle memory for instant-render. Calm chrome, motion only where data moves.

### Tier 3 — Daily / multi-daily visits (minimal motion budget)
**Surfaces:** `/home` (both personas, multiple times/day) · `/inbox` (Yossi 2-3x/day, 10-15min sessions) · `/workspace` (Yossi active sessions) · `/scans` (Yossi daily) · `/competitors` (Yossi daily).

**Budget:** minimal. Instant render on repeat visits. First-of-session entrance ≤1.8s, sessionStorage-flagged. Only data-driven motion (count-up on actual updates, path-draw on new sparkline data, hover transitions, optimistic UI on user actions). NO skeleton-outline-drawing. NO entrance theater on visit #2+ in same session.

**Reasoning:** Yossi opens `/home` for the third time today. He will not tolerate a 1.5s sketch-in animation as a re-greeting. Quality on Tier 3 comes from craft of the *static* surface (typography, spacing, color discipline, click-to-drill) plus per-element micro-motion (Stripe slide-with-spring on cards, Linear keystroke-shown-next-to-action). The page is a tool. Tools don't perform.

---

## THE PER-PAGE TABLE

| # | Page | Tier | Skeleton-draw on load? | Signature animations (1-3) | Explicit NO-animations | Entrance behavior | Repeat-visit |
|---|---|---|---|---|---|---|---|
| 1 | `/home` | 3 | **NO** | Score count-up · Sparkline path-draw · Top-3 cards stagger | Page skeleton-draw · Greeting · Background gradient · Confetti | 1.85s staggered cascade, sessionStorage-flagged | Instant render, no fade |
| 2 | `/inbox` | 3 | **NO** | Item-card-collapse on Approve · Right-pane preview cross-fade · Bulk-select count-up | Page skeleton-draw · Toast confetti · Auto-scroll celebration | Instant render of 3-pane shell · 200ms staggered fade of list rows on first paint | Instant render |
| 3 | `/workspace` | 3 | **NO** (the courier flow IS the animation) | Vertical step-list cascade · Per-step status-flip · Streaming text in current step | Page skeleton-draw · Step-list ALSO skeleton-drawing · Mascot character | Instant shell · Step-list cascades 80-120ms stagger as it loads | Instant render of completed steps; current step continues streaming |
| 4 | `/scans` | 3 | **NO** | Score-pill count-up on row hover · Tab-content fade on tab change · Per-engine bar-chart path-draw on detail | Page skeleton-draw · Row-by-row entrance theater · "New scan!" celebration | Instant render of table shell · 150ms fade of rows | Instant render |
| 5 | `/competitors` | 3 | **NO** | Side-by-side bar-chart fill (your bars vs competitor bars) · Delta count-up on hover · Citation-context cross-fade | Page skeleton-draw · Competitor logo theater · Trash-talk celebration | Instant render · 200ms fade of comparison cards | Instant render |
| 6 | `/crew` | 2 | **YES, FIRST VISIT ONLY** (then never again) | Agent-card grid sketch-in (first visit) · Per-card hover lift · Per-agent activity sparkline | Page skeleton-draw on revisits · Agent mascot per card · Lottie celebration | First visit: 2.0-2.5s staggered Rough.js sketch-in of 11 agent cards. Repeat: instant. | Instant render forever after |
| 7 | `/schedules` | 2 | **NO** | Calendar-cell hover · Schedule-edit save micro-pulse · Next-run countdown breath | Page skeleton-draw · Hand-drawn calendar grid · Confetti on save | Instant render · 150ms staggered fade of schedule rows | Instant render |
| 8 | `/settings` | 2 | **NO** | Tab cross-fade · Save-button success state · Profile-photo hover | Page skeleton-draw · Section-by-section sketch · Any animation longer than 250ms | Instant render | Instant render |
| 9 | `/scan` (public) | 1 | **YES — the dramatic one** | Full 10-frame First Scan Reveal (REFS-03) · Hand-drawn URL frame · Score arc count-up | Skeleton-shimmer (Stripe pattern) · Generic spinners · Email-gated reveal | 15-17s narrative as locked in REFS-03 | First-time-only by definition (public) |
| 10 | `/onboarding` | 1 | **YES — light flourishes** | Sketch-underline on first heading per step · Step-progress path-draw · Workspace-preview morph (Notion-style) | Full /scan-grade theater (would over-deliver) · Mascot · Lottie celebration on every step | 600-800ms light Rough.js flourish per step | Once-ever by definition |
| 11 | `/reports` | 2 (3 for power-Yossi) | **YES, FIRST VISIT ONLY** | Cover-page sketch-in on first visit · Brand-customization preview · PDF-export progress | Page skeleton-draw on revisits · Confetti on export · Mascot | First visit: 1.5s sketch flourish on cover preview. Repeat: instant. | Instant render |

---

## PER-PAGE DEEP CALLS

### 1. `/home` — daily, both personas, MOST-VISITED SURFACE

**Skeleton-draw on load? NO.**

Sarah opens this daily for 30s glances. Yossi opens it many times per day. A 1.5s page-skeleton sketch animation becomes a measurable friction tax on every visit, and by visit #5 it is contempt. The HOME-DESIGN-SPEC §3 already locked sessionStorage-flagged entrance: 1.85s on first session paint, instant on every subsequent visit. That decision stays.

**Signature animations (3, named):**
1. **Score Gauge Fill (count-up)** — score number animates 0 → final over 600ms ease-out-quint, tabular nums, no jitter. This IS the page's signature moment per HOME-DESIGN-SPEC §1.4.
2. **Sparkline Path-Draw** — 12-week line draws left-to-right over 800ms, lagging score by 150ms so eye moves score → sparkline.
3. **Top-3 Cards Stagger** — three RecommendationCards enter 30ms apart with 8px slide-up + 200ms fade. The "Run all 3 — 14 credits" pill enters with spring overshoot at t=480ms.

**NOT (3, named):**
- Page-level skeleton-outline-drawing (anti-pattern N9 from REFS-03: would compete with the score for attention; the score IS the hero, nothing animates around it).
- "Welcome back, {name}" greeting fade-in (anti-pattern N3 from HOME-DESIGN-SPEC §1.10).
- Confetti / Lottie celebration on score increase (anti-pattern from REFS-01 #17 boundary).

**Entrance behavior (first session, t=0 to t=1.85s):** staggered cascade of 8 sections per HOME-DESIGN-SPEC §3 timeline. Score counts, sparkline draws, diagnosis fades, fix cards stagger, KPI cards enter, score trend chart draws (1.2s), per-engine pills stagger, activity feed appears, footer appears. Total 1.85s.

**Repeat-visit (sessionStorage `beamix.home.entranceShown=true`):** instant render. No fade. Content visible at 0ms. This is the Rauno frequency-aware rule made literal.

**Why this call:** /home is the brand promise on every visit. Quality lives in the *static* treatment — typography (InterDisplay 64-72px score), tabular numerals, Fraunces italic diagnosis line, color discipline (#0A0A0A score not blue), 32-160px breathing room. Theater on a daily page is anti-quality. Stripe Dashboard does not animate its KPI hero on every visit. Linear Dashboards do not animate. Mercury does not animate. Beamix /home does not animate on revisit.

**Rauno citation:** "Frequency-aware motion: the higher the visit count, the lower the motion budget."

---

### 2. `/inbox` — Yossi's most-used surface (2-3x/day, 10-15min sessions)

**Skeleton-draw on load? NO.**

Yossi LIVES in this page. It is his work surface. A skeleton-draw entrance animation here is the equivalent of forcing a power user through a tutorial every time they open the app. Linear Triage does not animate; that's why it works for power users.

**Signature animations:**
1. **Item-card collapse on Approve** — when Yossi hits ⌘↵ on a queue item, the item collapses with strikethrough + 200ms ease-in height-to-zero. Optimistic UI; toast confirms. This is the page's primary "I did something" feedback loop.
2. **Right-pane preview cross-fade** — when Yossi navigates list with J/K, the right-pane preview cross-fades over 120ms (sub-150ms per HOME-DESIGN-SPEC governing rule). NO slide-in — slide is too heavy at 2-3 items/second nav speed.
3. **Bulk-select count-up** — when Yossi Cmd+A's 17 items, the "17 selected" count tabular-nums-counts-up 50ms. Tiny, but it sells the keyboard-velocity feel.

**NOT:**
- Page-level skeleton-draw (Yossi opens this every 20 minutes; theater is anti-power-user).
- Toast confetti or sound on Approve (REFS-03 anti-pattern: "scan complete" celebration becomes annoying when Yossi approves 50 items in a session).
- Auto-scroll-into-view animation on next-item (jumps the eye; let Yossi navigate).

**Entrance:** instant render of 3-pane shell. List rows fade in over 200ms staggered 30ms (only on first paint of session). Right-pane preview renders instant on first selection.

**Repeat-visit:** instant. Always.

**Why:** /inbox is the work surface, not a presentation surface. Linear's Triage refresh ships with sub-150ms transitions and zero entrance theater. The score chip in top-right is passive reference (locked in PAGE-LIST-LOCKED). Power-user keyboard velocity is the quality signal here, not motion choreography.

---

### 3. `/workspace` — agent execution viewer

**Skeleton-draw on load? NO. The courier flow IS the animation.**

This is the most contentious call in the document and I want to be explicit about why. /workspace is where the agent runs. The vertical step-list IS a continuously animating surface — steps flip status (queued → running → done), streaming text fills the active step, the courier line moves down the list. There is already plenty of motion. Adding a skeleton-outline-drawing entrance on top of that is double-animation. The eye doesn't know where to land. This is the REFS-03 anti-pattern made literal: "Animating skeleton outlines drawing in is conflict — outlines AND content animating = eye doesn't know where to land."

**Signature animations:**
1. **Vertical step-list cascade** — 7-10 step cards enter top-to-bottom with 80-120ms stagger, each 200ms fade + 8px slide-up. This is the courier flow's entrance — modeled on Perplexity's plan-execution UI (REFS-03 Anchor 1) and Vercel deploy stages (REFS-03 #24).
2. **Per-step status-flip** — when a step transitions queued → running, a 200ms color-and-icon flip (custom ease, first-and-last-frame-hold per REFS-01 Pattern 3). When running → done, a perfect-freehand checkmark draws over 250ms (REFS-01 Anchor 3).
3. **Streaming text in current step** — token-by-token reveal in the active step, sub-1s time-to-first-token (Cursor/Replit bar from REFS-01 #8-9). Persistent across page changes — Yossi can navigate away and come back to find streaming continuing.

**NOT:**
- Page-level skeleton-draw (the step-list IS the animation; another animation on top is conflict).
- Skeleton-outline-drawing on individual step cards (cards snap in; text streams).
- Mascot/character (REFS-01 anti-pattern #2: no full-page mascots inside dashboards; the asterisk in topbar is enough).

**Entrance:** instant shell render. Step-list cascades 80-120ms stagger as data loads. If user arrives mid-run, completed steps render instant; current step picks up streaming.

**Repeat-visit:** instant render of completed steps; current step continues streaming.

**Why:** The action IS the animation. /workspace is the closest Beamix gets to Claude.ai's "the system is thinking" moment, and Anthropic's discipline is the model: thinking-state motion is generous, surrounding chrome is calm. Don't compete with yourself.

---

### 4. `/scans` — scan history + per-scan deep dive

**Skeleton-draw on load? NO.**

Yossi opens this daily. Sarah opens it rarely (when she's curious about a specific scan). Both want to see the table fast. A skeleton-draw on the table grid is anti-power-user.

**Signature animations:**
1. **Score-pill count-up on row hover** — when Yossi hovers a scan row, the score pill (e.g., 73) micro-animates to highlight (50ms scale 1.0 → 1.04 → 1.0 with subtle weight shift). Sells the "this is interactive."
2. **Tab-content cross-fade** — when switching All / Completed Items / Per-Engine tabs, content cross-fades over 120ms (sub-150ms governing rule). NO slide; the tab content is the only thing that should change.
3. **Per-engine bar-chart path-draw on per-scan detail page** — when Yossi drills into a specific scan's detail, the per-engine bar chart fills with 600ms staggered path-draw (50ms between bars). Mercury's live-fill chart pattern (REFS-01 #10 Granola, REFS-03 #12 Cloudflare).

**NOT:**
- Page skeleton-draw (Yossi's primary daily destination).
- Row-by-row entrance theater (table loads, rows render).
- "New scan!" celebration on completed scan (Yossi runs 20+ scans/day; celebration becomes noise).

**Entrance:** instant table shell. Rows fade in with 150ms total stagger on first paint. Tabs render instant on switch.

**Repeat-visit:** instant.

**Why:** /scans is /scans is /scans — same surface every day. Yossi's quality signal is column alignment, tabular numerals, sortable headers, fast filters, click-to-drill on every row. Treating it as a presentation surface would be insulting to power users. Anthropic Console's drill-down pattern (REFS-01 reference set): the surface is calm; the drill IS the experience.

---

### 5. `/competitors` — competitor intelligence (Build/Scale gated)

**Skeleton-draw on load? NO.**

Sarah opens monthly (Tier 2). Yossi opens daily (Tier 3). I'm calling Tier 3 because Yossi sets the motion budget for paid tiers (Sarah is Discover; competitors is Build/Scale-gated). Daily users dictate the budget for the page.

**Signature animations:**
1. **Side-by-side bar-chart fill** — your bars vs competitor bars draw simultaneously left-to-right, 800ms with 100ms offset between your bars and theirs (so the eye reads "here's me, here's them"). Anthropic Console drill-bar pattern.
2. **Delta count-up on hover** — hover any competitor row, the "+/- N citations" delta counts up tabular-nums style.
3. **Citation-context cross-fade** — when expanding a competitor's citation context inline (the snippet of how ChatGPT mentioned them), 200ms ease-out height + cross-fade.

**NOT:**
- Page skeleton-draw (Yossi opens daily).
- Competitor logo Lottie / animation theater (anti-pattern N1 from HOME spec: icons-in-tinted-circles).
- "You're losing!" celebration / red-alert pulse (alarmist; data tells the story).

**Entrance:** instant render · 200ms fade of comparison cards on first paint.

**Repeat-visit:** instant.

**Why:** Competitor data is emotionally loaded. Quality here is *restraint* — let Yossi see the truth without the page editorializing through motion. The comparison bars are the editorial. Wix anchor (REFS-MASTERLIST): clean Hebrew-first comparison charts, not theater.

---

### 6. `/crew` — 11-agent roster + per-agent settings

**Skeleton-draw on load? YES, FIRST VISIT ONLY.**

This is the one Tier 2 page where I'm calling YES on skeleton-draw, and it's narrow: first visit only, sessionStorage flag, never again.

**Why YES on first visit:** /crew introduces the 11-agent roster. This is the moment Beamix says "we are not a dashboard with one chatbot — we are 11 specialized agents." That deserves a Notion-AI-character-introduction-grade reveal: 11 agent cards sketch-in over 2.0-2.5s with a 150ms stagger between cards. Each card's outline draws (Rough.js, low roughness 1.2, fixed seed) before content fills. This is exactly the moment REFS-01 Anchor 4 (Notion AI character) describes: "constrained location — hand-drawn personality lives where the agents live."

**Why NO on repeat visit:** Yossi visits /crew weekly to tweak agent settings. After visit 1, he knows the 11 agents. The introduction reveal is now a tax. Sessionstorage-or-localStorage-flagged: `beamix.crew.firstVisit=false` after first paint. Every subsequent visit is instant render.

**Sarah-mode vs Yossi-mode:** Sarah visits 1-2x/month out of curiosity. She might experience the first-visit reveal more than once if her sessionStorage clears (browser, device switch). I recommend localStorage (per-user, per-browser), persistent across sessions, so she sees it ONCE EVER. Adam: confirm or override.

**Signature animations:**
1. **Agent-card grid sketch-in (FIRST VISIT ONLY)** — 11 cards staggered 150ms, each card's outline draws over 600ms then content fills 200ms after outline lands. Rough.js, fixed seed per card (so card #3 looks the same on every render).
2. **Per-card hover lift** — hover any card, 150ms ease-out translateY(-2px) + shadow. Same as /home Top-3 cards. Repeats across product (signature primitive).
3. **Per-agent activity sparkline** — each card has a tiny 12-period activity sparkline that animates path-draw (400ms) ONCE per card on first visit, then static.

**NOT:**
- Page skeleton-draw on revisits (the introduction is over).
- Agent mascot per card (REFS-01 anti-pattern: no per-card mascots; the card layout IS the personality).
- Lottie celebration on agent run (Yossi runs agents constantly; celebration becomes noise).

**Entrance:** First visit: 2.0-2.5s staggered Rough.js sketch-in. Repeat: instant.

**Repeat-visit:** instant render forever after first paint.

**Why this is the right Tier 2 call:** REFS-01 Anchor 5 (PostHog Max): "constrained location — strict visual rules — fund it properly or don't do it." /crew is the constrained location for agent personality. The first-visit reveal is the funded moment. Every other surface in the product gets calm chrome.

---

### 7. `/schedules` — recurring scans + auto-fix configs (Yossi-only weekly)

**Skeleton-draw on load? NO.**

Yossi visits weekly. Sarah never. Tier 2-bordering-3. The page is a configuration surface — calendar grid, schedule rows, edit forms. Configuration surfaces never animate on entrance.

**Signature animations:**
1. **Calendar-cell hover** — hover a cell, 100ms ease-out background shift + outline. Standard calendar interaction.
2. **Schedule-edit save micro-pulse** — when Yossi saves a schedule edit, the row pulses 200ms (border-color #3370FF → transparent) confirming write. NO toast — the row IS the confirmation.
3. **Next-run countdown breath** — the "Next run: 3h 12m" timer has a 1200ms breath-pulse opacity 0.95 ↔ 1.0, indicating the timer is live. REFS-01 Pattern 5 (idle micro-loop, 800-1200ms cycle).

**NOT:**
- Page skeleton-draw (configuration surface; never).
- Hand-drawn calendar grid (would feel like Excalidraw masquerading as a calendar; wrong register — calendars need exactness).
- Confetti on schedule save (anti-pattern N8 from HOME spec).

**Entrance:** instant render · 150ms staggered fade of schedule rows (only on first paint of session).

**Repeat-visit:** instant.

**Why:** Schedules is the calmest page in the product. Notion Calendar (REFS-01 #16) is the model: every micro-interaction buttery, but nothing screams "look at me." The breath on the next-run countdown is the one personality moment.

---

### 8. `/settings` — 5 tabs, mostly forms

**Skeleton-draw on load? NO.**

Sarah visits 2x/year. Yossi visits monthly. Settings is a config surface. Animation here is anti-quality — Stripe Settings does not animate; Linear Settings does not animate.

**Signature animations:**
1. **Tab cross-fade** — switching between Profile / Billing / Language / Domains / Notifications cross-fades content over 120ms. Sub-150ms governing rule.
2. **Save-button success state** — clicking Save: button text "Save" → checkmark → "Saved" over 600ms (with first-and-last-frame-hold easing per REFS-01 Pattern 3), then back to "Save" after 1.5s. Tiny, satisfying.
3. **Profile-photo hover** — hover the photo upload area, 100ms ease-out outline + "Upload" overlay fade.

**NOT:**
- Page skeleton-draw (config surface).
- Section-by-section sketch-in animation (Settings has 5 tabs and ~20 fields per tab; sketch-in becomes form-filling friction).
- Any animation longer than 250ms on Settings (it's a config page; stay out of the way).

**Entrance:** instant render.

**Repeat-visit:** instant.

**Why:** Settings is where the product proves it respects the user's time. Anthropic Console's settings: zero theater. Stripe Dashboard's settings: zero theater. Beamix Settings follows the same discipline.

---

### 9. `/scan` (public, pre-signup) — THE acquisition wedge

**Skeleton-draw on load? YES — the dramatic one.** Already locked.

This is THE skeleton-draw moment for the entire product. The full 10-frame First Scan Reveal from REFS-03 lives here and only here. 15-17s total. Hand-drawn URL frame, company-name reveal, 7 engine bubbles materialize in scribbled arc, parallel queries with sample-prompt-typing, results gather, score arc draws and counts up, skeleton blocks reveal with content cascade.

**Signature animations:**
1. **First Scan Reveal (10 frames)** — the full REFS-03 storyboard. 15-17s. This is the brand promise.
2. **Hand-drawn URL frame** — Rough.js rectangle sketches around captured URL, 4 sides sequential 600ms each.
3. **Score arc count-up** — final 1s climax, score 0 → final, arc fills synchronously beneath. Speedtest pattern.

**NOT:**
- Skeleton-shimmer (Stripe pattern of nothing-then-real — wrong here; we want narrative).
- Generic spinner with "Loading…" (anti-pattern from REFS-03).
- Email-gated async reveal (anti-pattern: Ahrefs pattern; breaks first-impression).

**Entrance:** the 17-second narrative.

**Repeat-visit:** N/A — public, once-per-visitor by definition. (If a returning visitor hits /scan with a different URL, the narrative replays — they're scanning a different business, the narrative IS the value.)

**Why:** Already locked by Adam. Cited here for completeness.

---

### 10. `/onboarding` — light skeleton-draw flourishes

**Skeleton-draw on load? YES — light flourishes per step. Not full /scan-grade theater.**

Onboarding has 4 steps (per existing flow). Each step gets ONE small Rough.js flourish — not the full /scan reveal. Examples: a sketch-underline on the step heading drawing in over 600ms; a hand-drawn arrow pointing to the primary CTA on step 1; a Rough.js bracket framing the workspace preview on step 4. This is the Notion onboarding morph (REFS-03 Anchor 5) translated to Beamix's hand-drawn idiom.

**Why NOT full /scan-grade theater:** The user has already paid. They've already experienced the public scan. Re-running the 17-second narrative would over-deliver and waste budget. Onboarding's job is "get the user to first value FAST" — flourishes that take 400-800ms each are the ceiling.

**Signature animations:**
1. **Sketch-underline on first heading per step** — Rough.js underline draws over 600ms as step appears. Rough-notation pattern (REFS-01 #14).
2. **Step-progress path-draw** — top progress indicator (1/4 → 2/4) draws a hand-drawn line filling between dots, 400ms.
3. **Workspace-preview morph (Notion-style)** — on the final step, as user confirms business profile, the preview of /home morphs in real-time (their score block populating with their actual data). REFS-03 Anchor 5.

**NOT:**
- Full 15-17s reveal narrative (over-delivery; wastes budget; user is already paid).
- Mascot character (REFS-01 anti-pattern; Notion AI character is the upper bound and we deferred Beamie).
- Lottie celebration on every step complete (becomes noise across 4 steps).

**Entrance:** 600-800ms light Rough.js flourish per step transition. Step content renders instantly; flourishes are accents, not gating.

**Repeat-visit:** once-ever by definition (gated post-Paddle, completes onboarding).

**Why:** Onboarding is Tier 1 (once-ever) but the user's mood has shifted from "evaluating" (public /scan) to "configuring" (post-paid). Lighter motion respects that mood shift. Stripe Atlas onboarding (REFS-03 #16) is the model: persistent progress affordance, one custom transition per step, no theater.

---

### 11. `/reports` — Yossi-only, weekly, Scale-tier ($499)

**Skeleton-draw on load? YES, FIRST VISIT ONLY.**

This is the second narrow YES. Same logic as /crew: introducing a new surface to a paying-Scale user deserves one moment of "look what you unlocked." After that, it's a weekly tool.

**Signature animations:**
1. **Cover-page sketch-in (FIRST VISIT ONLY)** — when Yossi first opens /reports, the white-label PDF cover preview sketches in over 1.5s with Rough.js outline. Subsequent visits: instant.
2. **Brand-customization preview** — as Yossi tweaks logo / colors / company name, the preview updates with 200ms cross-fade. Notion morphing pattern (REFS-03 Anchor 5).
3. **PDF-export progress** — when Yossi exports, a path-draw progress bar (Rough.js, hand-drawn) fills left-to-right with realistic timing (typically 4-8s). NOT a generic spinner.

**NOT:**
- Page skeleton-draw on revisits (it's a weekly tool; theater becomes noise).
- Confetti on export (Yossi exports for clients all day).
- Mascot (REFS-01 anti-pattern).

**Entrance:** First visit: 1.5s sketch flourish on cover preview only (NOT full page). Repeat: instant.

**Repeat-visit:** instant.

**Why:** Scale tier ($499) deserves a hint of "you unlocked something special." But Scale tier is also professional — Yossi is a power user using this for client deliverables. The motion budget is moderate, not Tier-1-grade.

---

## CROSS-PAGE MOTION VOCABULARY

These are the motion primitives that REPEAT across the product, becoming Beamix's signature motion vocabulary. Each appears on multiple surfaces, in identical form (same easing, same duration, same color treatment), so users build muscle memory.

### Vocabulary 1 — Score Gauge Fill (count-up)
**Where it lives:** /home (hero score), /scans (per-scan detail), /scan public reveal (climax frame 7), /reports (cover preview).

**Spec:** Tabular numerals counting 0 → final value over 600ms, ease-out-quint `cubic-bezier(0.22, 1, 0.36, 1)`. NO color animation on the digit (color is reserved for chip/state). Reduced-motion: snap to final value.

**Why it repeats:** the score IS Beamix's primary metric. Wherever the score appears, it animates the same way. Speedtest count-up is the anchor (REFS-03 Anchor 3).

### Vocabulary 2 — Sparkline / line-chart Path-Draw
**Where it lives:** /home (hero sparkline + trend chart), /scans (per-scan trend), /competitors (comparison bars), /scan public reveal (frame 7), /crew (per-agent activity sparkline first visit), /reports (chart fills in PDF preview).

**Spec:** SVG `pathLength` 0→1 over 600-1200ms (varies by length). Ease-out. Single 1px stroke #3370FF for primary lines. Stagger 50ms between multiple lines. Reduced-motion: render fully drawn at 0ms.

**Why it repeats:** every chart in the product draws the same way. This is Beamix's chart entrance signature. Mercury's live charts + Stripe's chart-on-load + Anthropic Console drill-bars (REFS-01).

### Vocabulary 3 — Card Hover Lift
**Where it lives:** /home (Top-3 fixes cards, KPI cards), /inbox (item cards), /scans (row hover), /crew (agent cards), /workspace (step cards), /competitors (comparison cards).

**Spec:** Hover state, 150ms ease-out, `translateY(-1px to -2px)` + shadow `0 1px 4px rgba(10,10,10,0.06)` appears + background lightens to #FAFAF7. Stripe slide-with-spring restrained (REFS-01 #15, HOME spec §2.4).

**Why it repeats:** every clickable card in the product lifts the same way. Click-to-drill (HOME spec governing rule 3) is the Beamix interaction signature; the lift is its visual cue.

### Vocabulary 4 — Pill button hover (spring-overshoot)
**Where it lives:** every primary CTA pill in the product. /home "Run all 3", /inbox bulk-Approve, /workspace "Approve" inline, /scan "Save these results", /onboarding step CTAs, /reports "Export".

**Spec:** Hover state, spring (stiff) ~400ms total with 4-6% scale overshoot then settle. Background #3370FF stays solid (NO gradient hover).

**Why it repeats:** the pill is Beamix's brand-distinctive primitive (Things 3 Magic Plus pattern, BRAND_GUIDELINES marketing button shape). Wherever the pill appears, it springs the same way.

### Vocabulary 5 — Hand-drawn empty-state illustrations
**Where it lives:** /home empty state (magnifying-glass-over-square sketch), /inbox empty queue (sketch of clear page), /scans first-ever-scan empty (CTA card with sketch), /crew empty (an agent never run; sketch silhouette), /competitors empty (sketch of two boxes side by side).

**Spec:** ONE Rough.js illustration max 96×96px, fixed seed per illustration (consistent across renders), low roughness (1.0), color #6B7280, never animated to draw — appears static. Empty state copy in Fraunces 17-19px italic.

**Why it repeats:** empty states are where Beamix's hand-drawn personality lives in the product (NOT on the populated dashboards). Each page has its own illustration but they share the same Rough.js style. REFS-01 Pattern 12 (Rough.js as the visual primitive everywhere).

### Vocabulary 6 — Optimistic UI on Approve
**Where it lives:** /home (Top-3 card Approve), /inbox (item Approve ⌘↵), /workspace (step Approve), /onboarding (step Confirm).

**Spec:** Card collapses with 200ms ease-in (height 0, opacity 0), strikethrough fade applied to action label. Toast confirms within 300ms. State persists on refresh.

**Why it repeats:** Approve is Beamix's primary user verb. The collapse signals "you did something, the agent runs now." Linear's keystroke-shown + collapse pattern (REFS-01 #13).

### Vocabulary 7 — Topbar asterisk (idle / thinking / running)
**Where it lives:** chrome — every page in the product. Sticky topbar at 56px tall.

**Spec:** Three states: idle (solid mark), running (mark with subtle 1200ms breath), error (mark with red corner indicator). REFS-01 Pattern 5 (idle micro-loop). The asterisk family Claude uses (REFS-01 Anchor 1).

**Why it repeats:** persistent indicator across all pages. Granola's "across-OS" indicator pattern (REFS-01 #10) translated to in-app chrome. When ANY agent is running, every page shows it.

---

## ANIMATION ANTI-PATTERNS (cross-page)

These are banned everywhere. Code reviewers reject any PR that introduces them.

1. **No looping animations on dashboards** — except the topbar asterisk breath and active-run indicator dots. Static UI = trust.
2. **No skeleton-shimmer (Stripe pattern of gray-bars-pulsing)** — Beamix uses skeleton-outline-drawing on Tier 1 only, snap-then-cascade on Tier 2/3. Shimmer is the AI-template fingerprint.
3. **No gradient backgrounds on cards** — anti-pattern N2 from HOME-PREMIUM-REFS. Solid white card surface, single 1px border.
4. **No confetti / celebration sounds** — anti-pattern N8 from HOME-PREMIUM-REFS. Score increases are real; confetti makes them feel fake.
5. **No animations on Tier 3 pages on repeat visit in same session** — sessionStorage-flagged across all daily pages. Render at 0ms on visit #2+.
6. **No skeleton-outline animations on Tier 3 pages** — skeleton outlines snap, content cascades. Tier 1 (/scan, /onboarding) and first-visit-only states (/crew, /reports) are the ONLY exceptions.
7. **No mascots inside dashboards** — REFS-01 anti-pattern: PostHog Max works because he's in the toolbar/help menu, not on the analytics page. Beamie is deferred (per DECISIONS-CAPTURED).
8. **No greeting fade-ins** — "Welcome back, {name}" is anti-pattern N3. The data IS the welcome.
9. **No randomized roughness per render** — Rough.js + perfect-freehand both expose `seed`. Use it. Otherwise the same shape redraws differently every render = glitch, not hand-drawn (REFS-01 anti-pattern #7).
10. **No motion below 250ms or above 2500ms for entry** — sub-250ms invisible, above 2500ms blocking. Sweet spot 500-1200ms one-shots, 15-17s only for /scan public reveal (REFS-01 anti-pattern #8).
11. **No emoji-heavy status copy** — "Sketching… ✏️" reads as early-Slack-bot. Plain status text (Claude's "ruminating") is sharper.
12. **No animated brand mark on every page** — only on the topbar, only when active. REFS-01 anti-pattern #6.
13. **No tech-jargon status messages** — "Querying GPT-4o…" alienates SMBs. Outcome-focused: "Asking ChatGPT what it knows about you…" REFS-03 anti-pattern.
14. **No hand-drawn typography on data tables** — numbers stay in Inter / InterDisplay. Hand-drawn font is for callouts, status copy, illustration captions only. REFS-01 anti-pattern #10.

---

## THE 11 YES/NO DECISIONS FOR ADAM

Single-shot table for fast review. Each row is independent — Adam can approve some, reject others, override calls.

| # | Page | Skeleton-draw on load? | PM recommendation | Confidence |
|---|---|---|---|---|
| 1 | `/home` | NO | **Confirm** — Tier 3 daily; HOME-DESIGN-SPEC §3 already locks staggered cascade with sessionStorage flag, not skeleton-draw | HIGH |
| 2 | `/inbox` | NO | **Confirm** — Yossi 2-3x/day; theater is anti-power-user | HIGH |
| 3 | `/workspace` | NO (the courier flow IS the animation) | **Confirm** — double-animation conflict per REFS-03 anti-pattern | HIGH |
| 4 | `/scans` | NO | **Confirm** — Yossi daily destination | HIGH |
| 5 | `/competitors` | NO | **Confirm** — Yossi daily; bars draw, page doesn't | HIGH |
| 6 | `/crew` | YES, first visit only | **Confirm or override** — narrow YES on introducing the 11-agent roster (the "you unlocked agents" moment); localStorage-flagged for once-ever | MEDIUM |
| 7 | `/schedules` | NO | **Confirm** — config surface; weekly Yossi visits | HIGH |
| 8 | `/settings` | NO | **Confirm** — config surface; never animate Settings | HIGH |
| 9 | `/scan` (public) | YES (15-17s narrative) | **Already locked** — the dramatic one | LOCKED |
| 10 | `/onboarding` | YES (light flourishes per step, NOT full theater) | **Confirm** — once-ever, but lighter than /scan | HIGH |
| 11 | `/reports` | YES, first visit only | **Confirm or override** — Scale-tier "you unlocked this" moment, then weekly tool | MEDIUM |

**The 9 high-confidence calls are NO on Tier 3 daily pages and NO on config pages, plus 2 already-locked YES on /scan and /onboarding (light).**

**The 2 medium-confidence calls (Adam decides):**
- /crew first-visit YES — narrow, localStorage-flagged
- /reports first-visit YES — narrow, Scale-tier-only

---

## OPEN QUESTIONS FOR ADAM

1. **/crew first-visit reveal — sessionStorage or localStorage?** SessionStorage means Sarah might re-experience the reveal on next browser session (probably fine, she's not in /crew often). LocalStorage means once-ever per browser per user (cleaner story, but flag persists if she switches devices). My recommendation: **localStorage**, once-ever per device. Adam: confirm.

2. **/reports first-visit reveal — does Yossi see this on EVERY new domain he configures?** Yossi has 20 domains. If localStorage-flagged once-per-account, he sees the reveal once. If once-per-domain, he sees it 20 times — which would feel like padding. My recommendation: **once per account, ever**. Adam: confirm.

3. **Empty-state illustrations — one per page or one shared library?** Vocabulary 5 says "one per page, different illustrations, same style." That means we commission 5 sketches (one each for /home, /inbox, /scans, /crew, /competitors). Alternative: one shared sketch reused everywhere. My recommendation: **5 distinct sketches, same Rough.js style + fixed seed each.** PostHog hires two full-time illustrators because hand-drawn at scale is real production. Adam: how many sketches are we willing to commission?

4. **Topbar asterisk — does it pulse on EVERY page when ANY agent is running, or only on /workspace and /home?** "Persistent across all surfaces" is the REFS-01 #10 Granola pattern. But on /settings or /reports, a pulsing asterisk could feel out of context. My recommendation: **persistent across all surfaces**. The user's mental model is "the agent is alive somewhere" and that lives in the topbar regardless of current surface. Adam: confirm.

5. **Hebrew/RTL — do the path-draw animations flip direction in RTL?** Sparklines and trend charts read left-to-right; in RTL the "newest data is on the leading edge" rule means right-to-left. HOME-DESIGN-SPEC §1.7 says yes for the hero sparkline. Apply globally — every chart, every progress bar — in RTL? My recommendation: **yes, globally**. Adam: confirm.

---

## THE ONE MOST CONTENTIOUS PAGE-LEVEL CALL

**`/workspace` — NO skeleton-draw because "the courier flow IS the animation."**

I predict Adam will push back on this one. His instinct (consistent with the /scan vision) is "agents are doing real work; the user wants to see them work; sketch-drawing makes that work feel hand-crafted." That instinct is RIGHT for /scan, where the user has 15-17 seconds of attention budget and the scan IS the product demo. It is WRONG for /workspace, where Yossi opens the page mid-run, has been watching the same agent for 3 minutes, and just wants to see the next step status flip.

The argument I'd make to Adam:
- /scan is the *introduction* to agent work (one-time, dramatic, narrative).
- /workspace is the *continuous* viewing of agent work (repeated, calm, status-driven).
- Adding skeleton-draw on top of the continuously-animating step list creates the REFS-03 anti-pattern conflict literally: outlines AND content animating = eye doesn't know where to land.
- The vertical step-list cascade IS the entrance animation. The per-step status-flip + streaming text IS the work animation. That's already two motion layers. A third (skeleton-draw) is conflict, not richness.

If Adam overrides: I propose the compromise of **YES-on-first-visit-only** (same pattern as /crew), so the very first time Yossi opens /workspace he sees a "this is your agent workspace" reveal, then never again. That preserves the introductory drama without taxing daily power-user sessions. My ranking: NO-always > YES-first-visit-only > YES-always.

---

## SUMMARY — the spine of the strategy

Skeleton-outline-drawing is Beamix's most expensive motion primitive. It earns its keep on three contexts and three only:
1. **/scan public reveal** (the acquisition wedge, 15-17s, locked).
2. **/onboarding step flourishes** (light, 600-800ms each, post-paid).
3. **First-visit-only on /crew and /reports** (introducing-the-surface moments, 1.5-2.5s, localStorage-flagged once-ever).

Every other surface earns quality through static craft (typography, spacing, color, click-to-drill) plus per-element micro-motion (count-ups, path-draws on charts, hover lifts, optimistic UI). Tier 3 daily pages render instant on repeat visits. The cross-page vocabulary (7 motion primitives) becomes Beamix's signature, repeated with discipline so users build muscle memory.

The product's animation language is what would happen if Stripe Dashboard (restraint), Linear (calm chrome), Anthropic Console (drill-down discipline), and Excalidraw (hand-drawn primitive) had a child raised by Rauno Freiberg (frequency-aware motion). That child opens /home in 50ms on visit #5 and watches /scan for 17 seconds on visit #1.

That's the bar.
