# Beamix Design Direction — 2026-04-24
Status: **SUPERSEDED (Round 1 — wrong category)**. Adam rejected PostHog anchor 2026-04-24 PM. Round 2 targets character-in-UI + agent flow visualization + motion-first language. See `2026-04-24-DESIGN-DIRECTION-v2.md` when it lands. Phase 0 quick fixes (InterDisplay load, non-brand color cleanup, Inbox action wiring) remain valid regardless of aesthetic.

---

Original Round-1 document below, kept for reference only:

---

Status: PROPOSAL — awaiting Adam's approval before implementation

---

## THE NEW THESIS

Beamix is a **working partner dressed like a craftsperson**, not a SaaS dashboard dressed like a tech product. Visually, it is a dense-data analytics tool that happens to feel like it was built by someone with taste — off-white canvas, one warm mark, characters for the agents, and a type system that earns authority without shouting. We are leaving behind the Shadcn clone aesthetic: `rounded-xl border border-gray-100 bg-white p-4 shadow-sm` stamped on every surface, Inter everywhere, and the blue-sliver-active-state that makes our brand accent invisible across the entire navigation.

---

## THE 3 FINAL ANCHORS

### Primary Anchor: PostHog

Both Opus researchers independently named PostHog as their top reference without coordination. This double-blind convergence is the strongest possible signal. PostHog is a product-analytics platform — the closest business-model cousin to Beamix — and it proves that a dashboard product drowning in tables, charts, and event lists can also have a hedgehog mascot, a warm off-white canvas, and a design handbook that bans AI-generated art. (Sources: Research A, Research B, posthog.com/handbook/brand/philosophy, posthog.com/blog/drawing-hedgehogs, productgrowth.blog/p/posthog-branding-playbook)

What we will copy specifically:
1. Off-white canvas `#EEEFE9` (PostHog light) as the product background — not pure `#FFFFFF` (Research B)
2. Near-monochrome palette with ONE saturated accent, expanded through opacity not additional hues (Research B, PostHog handbook)
3. Strict mascot illustration rules: one character per agent persona, monoline black outline, consistent stroke weight, always facing 3 defined directions, no AI generation (Research A, Research B, posthog.com/handbook/company/brand-assets)
4. Empty states as mini-stories with the character present and an action built in — "You've reached Inbox Zero" not "0 items" (Research B)
5. Custom display typeface for character moments; clean sans for data — two-voice type system (Research B, PostHog uses Matter SQ + Squeak)

### Supporting Anchor 1: Linear

Linear is the density-and-calm benchmark. The 2024 redesign writeup is the single best published case study for how to reduce visual noise without losing information. (Sources: Research B, linear.app/now/how-we-redesigned-the-linear-ui, linear.app/now/behind-the-latest-design-refresh)

What we will copy specifically:
1. 3-variable theming: base color, accent, contrast — everything derived, nothing arbitrary (Research B)
2. LCH color space for Excellent/Good/Fair/Critical status colors — perceptually uniform lightness so contrast reads consistent across green, amber, red (Research B, also Stripe's accessible color system)
3. Warm grays not cool grays — mid-tones shifted 3-5 degrees toward warm, killing the "cold tech" feeling (Research B)
4. Split view for Inbox: queue list on the left, full item on the right — 3-pane is already implemented but the chrome and density need the Linear audit treatment (Research B)
5. Agent-as-teammate presence: "[Agent name] is thinking..." with avatar during active operations, not a spinner (Research B, linear.app agent presence model)

### Supporting Anchor 2: Basecamp / HEY (37signals family)

HEY and Basecamp prove that inventing product nouns is a design decision, not a copywriting afterthought. Cover art, shape metaphors, and "weirdness as moat" are the warmth strategies that survive at business scale. (Sources: Research B, jonas.do/projects/hey, hey.com/features/cover-art, world.hey.com/igormarcossi/basecamp-s-design-a-cheap-analysis-d15cf983)

What we will copy specifically:
1. Invented product nouns — features are named like concepts, not UI categories (Research B)
2. Visual shape metaphors — one atomic shape per entity type that becomes a recognition mark across the UI (Research B)
3. Theme packs as a power-user delight feature — 2-3 themes beyond light/dark (Research B)
4. Hand-drawn illustrations in transitional and empty moments — character lives in negative space, not in data zones (Research B)
5. Micro-copy that names emotional states: "You're all caught up" not "0 pending items" (Research B)

---

## AESTHETIC RULES

These are enforceable rules. The design system derives from them. Any component that violates a rule ships back for revision.

1. Background canvas is `#F5F3EE` (warm off-white, splitting PostHog `#EEEFE9` and brand `#F7F7F7`). Pure white `#FFFFFF` is reserved for data tables, active inputs, and high-density list zones only.
2. One brand accent: `#3370FF`. No secondary blue, no "light blue" variants like `#93b4ff` or `#0EA5E9` — these are palette contaminations per the audit. Blue expands through opacity: `#3370FF` at 100% / 12% / 6% for backgrounds.
3. One warm illustrative accent: `#C96B3E` (burnt sienna — adjacent to Claude's terracotta `#DA7756`, works against our warm canvas). Used only for: agent character illustrations, annotation marks, and the animated Beamix mark. Never for buttons or interactive states.
4. Headings render in InterDisplay-Medium with `-0.02em` letter-spacing. This is currently broken in `apps/web/src/app/layout.tsx` — `Inter_Display` is never loaded. Fixing this is the first code action before any visual work.
5. One signature motion per page: the Beamix star-mark pulses gently (scale 1.0 → 1.08, opacity 1 → 0.85, 800ms ease-in-out, looping) when an agent is running. No other looping animation anywhere in the product.
6. No tinted-square-with-centered-icon. This pattern (the `h-8 w-8 rounded-lg bg-blue-50` container) is explicitly banned. KPI tiles show large numbers as the focal point. Icons are secondary, inline, and unsquared.
7. Border radius cap: `8px` (`rounded-lg`) for cards and components, `4px` for pills/chips, `50%` for avatars. `rounded-xl` (12px) and `rounded-2xl` (16px) are banned in the product. Brand guidelines already specify `rounded-lg` for product utility — we are enforcing it.
8. Empty states are typed by situation: "First scan" / "Inbox zero" / "Automation ready" / "All caught up." Each is visually distinct and includes an agent character in a relevant pose. The generic centered-icon boilerplate used across 8 components is replaced entirely.
9. Typography hierarchy uses a 4:1 ratio minimum between page H1 and section label. Current ratio is roughly 1.4:1 (`text-xl` page heading vs `text-sm` section heading). H1 should be `48px InterDisplay-Medium`, section labels `12px Inter 500 uppercase tracking-[0.06em]` — moderate tracking, not `tracking-widest`.
10. Non-brand colors are a deployment blocker. Violet (`bg-violet-50`), orange-tint (`bg-orange-50`), sky-blue (`#0EA5E9`), and periwinkle (`#93b4ff`) have been found in the audit. Before any design work ships, these are removed and mapped to the brand palette.

---

## CHARACTER SYSTEM

**Recommendation: One meta-character with 11 specialist costumes.**

Do not commission 11 independent characters. That is the PostHog level of investment (two full-time illustrators), which is not feasible as a bootstrapped first system. Instead: one foundational Beamix character — "the Beamix star-mark given anthropomorphic expression" — with 11 costume/context variants. The base anatomy is fixed (body proportions, facial expression register, line weight, color palette). The variant is the role: a Researcher variant carries a magnifying glass, a Content Optimizer holds a pen, a Schema Agent has structured brackets behind it.

Rules of the system (derived from PostHog's documented approach, posthog.com/handbook/company/brand-assets and posthog.com/blog/drawing-hedgehogs):
- Medium: hand-drawn digital on tablet (Procreate or Fresco). NOT AI-generated. NOT 3D. NOT vector-perfect.
- Line rule: monoline black outline, consistent stroke weight across all variants. This is the single most codifiable illustration rule.
- Facing directions: left-facing (default), straight-on (for empty states), three-quarter left (for agent detail views). Never shown from behind.
- Color: character body uses `#F5F3EE` with warm sienna `#C96B3E` and black `#0A0A0A` only. No rainbow agent colors.
- AI generation is banned for the character system. This is a brand rule, not a budget rule.
- Scope for MVP: 4 characters cover launch — a general "working" pose, an Inbox Zero pose, a First Scan pose, and an Error/Concerned pose. 11 agent variants are Phase 2.

The rationale for one-meta-character-with-costumes: recognition compounds faster with a single face seen in 50 places than 11 faces seen 5 places each. PostHog's Max is everywhere; users recognize it instantly. One character taught well beats eleven characters taught poorly.

---

## TYPOGRAPHY SYSTEM

**Heading font: InterDisplay-Medium**
Already in the brand guidelines. Currently broken (not loaded in `layout.tsx`). InterDisplay is a purpose-designed companion to Inter for display sizes — it has subtly adjusted metrics for large text that regular Inter lacks, making headings tighter and more authoritative at 40px+. This is the fix with the highest ROI-per-hour: one font load makes every page heading look 40% more premium.

**Body font: Inter 400**
Correct and stays. Inter at 16px / 1.6 line-height is legible and familiar. The problem was never Inter for body — it was Inter masquerading as a display font in heading slots.

**Character / illustrative moment font: Excalifont or Virgil**
OFL-licensed, free for commercial use. (Source: Research A, plus.excalidraw.com/excalifont, github.com/excalidraw/virgil) Used for: agent stamps on output cards, scan result annotations ("Not found on ChatGPT"), empty state callouts, and agent character speech bubbles. This is not a body or heading font — it is a narrow-purpose accent, visible in roughly 10-15% of the product surface. It carries the "hand-drawn" signal without requiring an entire custom illustration system from day one.

**Monospace (agent logs, scan output, JSON): Geist Mono**
Already in the brand guidelines. Currently not loaded in `layout.tsx`. Geist Mono is already used for code in the brand system — apply it to agent logs, raw scan output, and any machine-readable data. Stays in the Vercel/terminal register without going cold.

**Tabular numerals: Required.**
All numeric data in tables, KPI tiles, scan scores, credit counts, and sparkline labels must use `font-variant-numeric: tabular-nums`. Without tabular numerals, numbers shift width as values change, creating visual jitter in live-updating dashboards. This is a one-line CSS addition per table cell.

**Scale:**

| Level | Size | Font | Weight | Tracking | Line-height |
|---|---|---|---|---|---|
| Hero / page score | 64px | InterDisplay | Medium (500) | -0.02em | 1.0 |
| H1 (page heading) | 40px | InterDisplay | Medium (500) | -0.015em | 1.1 |
| H2 (section heading) | 24px | InterDisplay | Medium (500) | -0.01em | 1.2 |
| H3 (card heading) | 16px | Inter | SemiBold (600) | 0 | 1.3 |
| Body | 15px | Inter | Regular (400) | 0 | 1.6 |
| Label / metadata | 13px | Inter | Medium (500) | 0 | 1.4 |
| Micro / eyebrow | 11px | Inter | SemiBold (600) | 0.06em (uppercase only) | 1.4 |

**Why this beats Inter everywhere:** The current audit found `text-xl font-semibold` (20px) for page H1s and `text-sm font-semibold` (14px) for section headings — a 1.4:1 ratio. The new scale runs 3.6:1 from H1 to eyebrow (40px → 11px). This ratio is what makes dashboards feel like designed products rather than admin panels.

---

## COLOR SYSTEM

**Canvas: `#F5F3EE`**
Warm off-white. Splitting PostHog's `#EEEFE9` and our existing `#F7F7F7`. Provides warmth without beige excess. Pure white `#FFFFFF` is reserved for data zones only (tables, inputs, active cards when they need to lift from the canvas).

**Text primary: `#0A0A0A`**
Already correct in the brand guidelines. Stays.

**Text secondary: `#5C5C5C`**
Warmed up from the current `#6B7280` (which has a cool-gray undertone). `#5C5C5C` reads slightly warmer on the `#F5F3EE` canvas. This is the Linear "warm grays" move — a 3-5 degree hue shift toward warm in the neutral system. (Research B)

**Brand accent (locked): `#3370FF`**
Non-negotiable per CLAUDE.md and all brand guidelines. This is the product's single saturated voice. Expanded via opacity:
- Active/pressed states: `#3370FF` at 100%
- Hover backgrounds / selected rows: `#3370FF` at 8% (`rgba(51,112,255,0.08)`)
- Tinted background accent zones: `#3370FF` at 5%

**Warm illustrative accent: `#C96B3E`**
Burnt sienna. Used exclusively for: the animated Beamix mark, agent character illustrations, and annotation marks on scan output (never interactive elements, never buttons, never links). This gives the product the warmth signal that Claude's terracotta `#DA7756` provides, while sitting closer to the orange-red end that reads as energetic vs. the salmon-pink that reads as soft. (Source: Research A decoded the Claude terracotta strategy)

**Semantic palette (LCH-derived, per Research B citing Stripe's approach):**
These stay consistent with the existing brand guidelines but the mid-gray range between Critical and Good is filled in:
- Excellent: `#06B6D4` (data viz, score 75-100) — existing, stays
- Good: `#10B981` (score 50-74) — existing, stays
- Fair: `#F59E0B` (score 25-49) — existing, stays
- Critical: `#EF4444` (score 0-24) — existing, stays
- The LCH mandate: when rendering these colors on the `#F5F3EE` canvas, verify perceived lightness is uniform. Use `oklch()` equivalents in CSS where browser support allows; fall back to hex with manual contrast verification.

**Dark mode: Post-launch, not launch.**
Dark mode is a significant investment in a dual-canvas token system. The product is early, RTL support is already required (Hebrew), and adding dark mode at launch triples QA burden for no proven user demand. Shipping light mode beautifully is worth more than shipping both modes adequately. Revisit after first paying cohort.

**Retired colors (from audit — delete from codebase):**
`#93b4ff` (DailySparkline, AutomationClient), `#0EA5E9` (KpiStripNew impressions tint), `bg-violet-50` / `text-violet-600` / `bg-orange-50` / `bg-teal-50` (ItemList agent tints). None of these are in the brand palette.

---

## ICON SYSTEM

**Source: Lucide React.** The brand guidelines already specify this. The audit found custom inline SVGs in `KpiStripNew.tsx` using `strokeWidth="1.5"` on a 16px viewBox — different from Lucide's 2px stroke on 24px grid. Replace `IconVisibility`, `IconCitation`, `IconImpressions`, `IconCredits` with Lucide equivalents (`Eye`, `FileText`, `TrendingUp`, `Zap`) normalized to the same stroke weight.

**Treatment: Monoline outline.** Single consistent stroke weight across all icons. No filled icons mixed with outline icons on the same screen. No icons with drop shadows.

**Explicit ban: No tinted-square backgrounds behind icons.** The pattern `h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center` with a centered icon is the #1 AI-slop marker (Research A anti-patterns, prg.sh). This pattern exists in: `KpiStripNew.tsx:86-93`, `AutomationClient.tsx:276-280`, `ScansClient.tsx:612-615`, `EngineBreakdownGrid.tsx:131`. All four replaced in Phase 0.

**Agent differentiation:** Automation table currently uses the identical Zap icon for all 7 agent types (`AutomationClient.tsx:276-280`). The audit recommends per-type Lucide icons — `FileText` for content agents, `TrendingUp` for performance, `HelpCircle` for FAQ, `BarChart2` for competitor intelligence, `Code` for schema, `RefreshCw` for freshness. This is the minimum before the character system ships.

**Icon-only button rule:** `aria-label` required on every icon-only button. Already in brand guidelines. Audit confirms compliance in core nav — enforce on new components.

---

## SPACING / DENSITY RULES

**Row height, primary lists (Inbox item, Scan row, Automation schedule):** 52px. Dense enough to show 12-15 items in a viewport without scrolling; tall enough to breathe. PostHog's dashboard rows and Linear's issue list both land in the 48-56px range.

**Row height, secondary metadata (sub-rows, nested items):** 36px.

**Section vs. row spacing ratio: 5:1 minimum.** If rows are 52px with 8px gap (60px per row), section-to-section spacing is at minimum 40px. The current product uses `gap-3`/`gap-4` (12-16px) within sections and the same `gap-3`/`gap-4` between sections — zero hierarchy in space. (Research B: "Section spacing > row spacing: gap between unrelated areas must be 4-6x gap between related rows.")

**Chrome vs. content density:** Sidebar and header are tight. Sidebar nav items: `py-1.5` (6px top/bottom) with `text-sm`. Header: 48px tall. Content area has room to breathe — cards within content use `p-5` (20px) min, section padding `py-8` (32px) min.

**Container width:** `max-w-[1280px]` across all pages, centered. Current pages are inconsistent (`max-w-[1100px]` vs `max-w-[1200px]` — audit line 214). The Product Design System specifies `max-w-7xl` (1280px). Enforce consistently.

**Border radius policy:** `rounded-lg` (8px) for all product cards and inputs. `rounded-md` (6px) for chips, badges, filter pills. `rounded-full` for avatars and score-ring shapes only. `rounded-xl` (12px) and above are banned in product — they are marketing-site values.

**Card shadow:** `0 1px 3px rgba(0,0,0,0.08)` at rest. `0 4px 12px rgba(0,0,0,0.10)` on hover with `translateY(-1px)`. The current `shadow-sm` is too light for the off-white canvas — it disappears. The reduced hover shadow (from the brand's `0 12px 32px`) is intentional: on `#F5F3EE` background, subtle lift reads clearly without theatrics.

---

## MOTION / ANIMATION POLICY

**Signature motion: The Beamix mark pulse.**
One looping animation allowed in the product. When any agent is actively running, the Beamix star-mark in the sidebar header pulses: `scale(1.0) → scale(1.06)`, `opacity(1.0) → opacity(0.80)`, `800ms ease-in-out`, infinite loop. Stops when all agents are idle. This is borrowed from Claude's spark mark behavior — "still when listening, flutters gently when responding" (Research A, Kinfolk). One mark, one motion, one meaning.

**LLM outputs: Stream, never pop.**
Every agent output card must use streaming text reveal — character by character or chunk by chunk — not a flash-to-full render. This is the functional expression of "we're doing real work in real time." The current typewriter animation in brand guidelines (60ms/char, linear) is the implementation.

**Loading: Personified, not spinner.**
Replace `animate-pulse` skeleton bars with copy-forward loading states: "[Agent name] is working..." with the agent's icon at rest and a subtle ellipsis animation. The three-dot ellipsis (`…` animating: 1 dot → 2 dots → 3 dots → 1 dot) at 400ms per step. No spinner, no skeleton grid, no `animate-pulse` gray bars except within data tables where skeletons are appropriate because the layout is known.

**Page entry animations:** `fadeInUp` + `spring.subtle` per the existing Framer Motion library in `apps/web/src/lib/motion.ts`. Stagger delay cap: 80ms max per child. Current implementation goes to 180ms (too wide — audit line 235).

**Banned animations:**
- Gradient-in-motion (animated gradient backgrounds)
- Parallax scroll effects
- Pulse animations on decorative elements (only allowed on status indicators like the "scan running" dot)
- Framer Motion stagger on every list item (use only for page entry, not repeat renders)
- Fade-on-scroll (scroll-triggered entrance for dashboard content)

**Hover states:** `translateY(-1px)` + shadow increase for cards. Color shift on text links. Scale is banned on large elements (scale on a card during hover creates layout reflow jitter).

---

## EMPTY / LOADING / ERROR STATES

**Empty states — typed by situation, not generic:**

"First scan" state (used on /home and /scans when user has no scan data): The Beamix character in its "curious, looking at a blank canvas" pose. Copy: "Your GEO score is waiting to be found." Sub-copy: "Takes 90 seconds — we check 7 AI engines simultaneously." CTA button: "Run your first scan →". Visual: the score ring outlined but empty (0% filled), rendered in `#C96B3E` sienna. Not gray. The empty ring IS the illustration.

"Inbox zero" state (used on /inbox when no items await review): The Beamix character in its "satisfied, arms at sides" pose. Copy: "You're caught up." Sub-copy: "Agents will surface new work when it's ready." No CTA needed — this is a rest state, not a conversion moment. Render the character slightly larger than standard (96px illustration height), centered.

"Automation ready" state (used on /automation when no schedules exist): The Beamix character holding a schedule / calendar. Copy: "No agents scheduled yet." Sub-copy: "Set a schedule and Beamix runs the work — you review the results." CTA: "Add your first schedule →".

"All caught up" state (used on /home NextSteps when no suggestions pending): Copy: "Nothing to act on right now." Sub-copy: "Your next suggestions will appear after the next scan." No character needed here — this is a mid-page sub-state, not a full-page empty. Render as a dashed border row with copy only.

Micro-copy examples in Beamix voice:
- Do not say "No data available." Say "Your score will appear after the first scan."
- Do not say "0 pending items." Say "You're caught up."
- Do not say "Error loading data." Say "We couldn't load this. Try refreshing — if it persists, we're looking into it."

**Loading states:**
Table skeleton: gray bars at 40% / 60% / 30% width in alternating rows, `animate-pulse`, 200ms delay between rows to feel natural rather than mechanical. No loading state spans the full page — use section-level loaders only.
Agent operation: "[Agent name] is analyzing your content..." with the agent's icon (not a spinner). Copy updates at random intervals from a pool of 3-4 "still going" lines to feel alive.

**Error states:**
Design principle: warmth in apology, specificity in remedy. "That didn't work — we're on it" is rejected because it offers nothing actionable. Instead:
- Supabase query failure: "We couldn't load your scans. Check your connection, then refresh. If it keeps happening, email us at hello@beamix.tech."
- Agent execution failure: "[Agent name] ran into a problem and stopped. Your credits were not used. Run it again or contact support."
- Scan failure: "This scan didn't complete. We'll retry automatically in 5 minutes — or you can start a fresh one."
All error states include the Beamix character in its "concerned but not alarmed" pose (three-quarter view, slight lean forward).

---

## MICRO-COPY VOICE

**Invented product nouns (recommended list):**
- Inbox → keep "Inbox" (already distinctive enough, matches HEY tradition)
- Automation → rename to **"Crew"** — connotes delegation to a team, not configuration of a cron job. "Your Crew" / "Schedule Crew" / "Crew is running." This also eliminates the current "Automation" vs "Auto-pilot" naming inconsistency found in the audit.
- Scans → keep "Scans" (clear, action-oriented)
- Agent output cards in Inbox → **"Deliverables"** (not "Content Items", not "Drafts")
- Filter states in Inbox → keep "Ready for review / Draft / Approved / Archived"
- Agent credit units → **"runs"** (not "credits" — "you have 12 runs left this month" is more concrete)
- The score → keep "GEO Score" (already branded, no change)

**Voice rules (8 rules):**
1. Lead with outcome: "Ranked in 48 hours" not "We help you rank faster."
2. Second person singular: "You're caught up" not "All items reviewed."
3. Warm error messages, serious success messages — never the reverse.
4. Status states name emotions: "Inbox zero" not "0 items." "Crew is resting" not "No automations running."
5. Agent names are lowercase in product UI: "content optimizer ran 3 times this week." Capital when standalone: "Content Optimizer" in settings.
6. Numbers: always numerals in product UI. "12 runs left" not "twelve runs left."
7. Avoid: "leverage", "synergy", "optimize" (as marketing filler — it is fine in agent context). Cut: "just", "very", "really".
8. CTA verbs are specific: "Approve this →" not "Submit". "Review now →" not "Open". "Schedule Crew →" not "Set up automation."

**Before/after examples:**

| Current (generic SaaS) | Beamix voice |
|---|---|
| "No scan results found." | "Your GEO score is waiting. Run your first scan — takes 90 seconds." |
| "Action completed successfully." | "Done. Your content is approved and queued for publishing." |
| "Error: Request failed." | "Something went wrong loading this. Refresh to try again." |
| "Usage: 45 / 100 credits" | "45 of 100 runs used this month." |
| "Automation paused." | "Crew paused. Nothing is running until you resume." |

---

## PAGE-BY-PAGE RETHINK

---

### /home

**Primary reference:** PostHog product analytics dashboard (https://posthog.com/product/product-analytics) for the dense analytics grid; Linear /home for the compact chrome and "today's work" framing. (Research A, Research B)

**What it should BE:** The morning brief. When a user opens Beamix at 9am, /home tells them their GEO health in 3 seconds (the score number), surfaces the one or two things that need their action (Crew suggestions and Inbox items), and shows agent activity as a team status board. It is not a metrics grid — it is an operational briefing.

**What changes vs. current (referencing audit):**
- The GEO score (`HomeClientV2.tsx:91`) rises from 28px to 64px InterDisplay-Medium, becomes the unambiguous hero of the left column. The score ring (`ProgressRing`) animates 0→score on mount. This is the visual anchor of the page.
- `KpiStripNew.tsx` KPI tiles (audit issue #1, #2): Remove the tinted-square-with-icon pattern. Each tile shows a large number as the primary element with a one-line label below. No icon boxes.
- `EngineBreakdownGrid.tsx` engine initials (audit issue #7): Replace text initials with 16×16px SVG engine logos (ChatGPT, Gemini, Perplexity, Claude, Grok). If SVG logos are not immediately available, use colored monogram circles as interim — but commission SVGs in Phase 1.
- Section headings (`HomeClientV2.tsx:231, 248, 272, 285, 315`): Apply H2 scale (24px InterDisplay-Medium) to page-level section headings. `text-sm font-semibold text-gray-700` is a list-item label, not a section heading.
- Right sidebar cards (audit issue #6): The three stacked white boxes (Activity, Inbox preview, Automation status) get visual differentiation — Inbox preview gets a `#3370FF` 2px left border accent, Automation gets the Crew character icon. They are not identical containers.
- The "NoScanYet" empty state (audit issue #9): Replace with the "First scan" empty state defined above. Remove the generic radar SVG concentric circles.

**Hero moment:** The animated score ring — a circular progress indicator, dark `#0A0A0A` track, `#3370FF` fill, animating from 0 to the user's score over 1.2 seconds on first mount. At the top of the ring, the score number counts up (`0 → 73`) in InterDisplay-Medium 64px. Below the ring, the verdict label in a colored chip (`Good`, `Critical`, etc.). This single animation makes the product feel alive in a way that 8 static KPI tiles cannot.

**Wireframe intent:**
Top section: Score ring (left, 180px diameter) + "Your GEO Score" label above + verdict chip below + one-line context ("Up 4 points since last scan") to the right of the ring. Below the ring, the score ring's supporting metrics in a 3-column inline strip (not boxed tiles): Scans run / Citations found / Engines monitored.

Second section: "What to do this week" — the NextSteps suggestion cards (already the best-designed component on the page per audit). Retain the design, fix the section heading size.

Third section: Engine breakdown grid — 3-column on desktop, 2-column on mobile. Each engine card: engine logo (not initials) + mention rate as the big number + sparkline.

Right aside (240px): Inbox preview showing count of items awaiting review + the top 1-2 item titles. Below that: Crew status (active/idle) with agent names. Below that: Activity feed showing last 5 events as a tight timeline.

**Signature element:** The score ring counting up on load. If the logo is removed from a screenshot, the animated score ring at 64px InterDisplay is the single element that says "this is Beamix."

---

### /inbox

**Primary reference:** Linear Triage split view (https://linear.app/now/behind-the-latest-design-refresh) for the list+focused-item layout. Superhuman 3-pane for keyboard-first interaction. FigJam stamps/emotes (https://help.figma.com/hc/en-us/articles/1500004290981) for one-tap approval reactions. (Research B)

**What it should BE:** A review queue that feels like delegating to a teammate, not approving a form. The user reads a Deliverable, reacts to it (approve/reject/request changes), and moves on. Each action should feel decisive and clean, not administrative.

**What changes vs. current (referencing audit):**
- `InboxClient.tsx:99-125` Inbox actions are `console.log` stubs (audit issue #3, CRITICAL). This is a prerequisite for any visual work — the actions must be wired to real API endpoints before the design ships.
- `FilterRail.tsx` sidebar (audit issue #1): The left rail needs the brand active state: `bg-[#3370FF]/08 text-[#3370FF] font-medium` for the active filter, not the current `bg-blue-50 font-medium`. The "Inbox / [count]" header in the rail gets the Beamix character in its Inbox-zero pose when count = 0.
- `ItemList.tsx` agent tints (audit issue #2): Replace all non-brand colors (`bg-violet-50`, `bg-orange-50`, `bg-teal-50`) with the per-agent icon system defined in the Icon System section. Agent avatars show the distinct Lucide icon in the brand blue tint, not tinted squares with initials.
- `PreviewPane.tsx` action bar (audit issue #3): The Accept button rises from 32px to 40px height, gets `bg-[#3370FF] text-white rounded-lg px-5 font-medium` as the dominant visual. Reject and Request Changes are secondary (ghost buttons). The action bar sits at the bottom of the preview pane in a sticky footer that remains visible as the user scrolls the content.
- The `EmptySelection` state (audit issue #6): The entire preview pane when nothing is selected shows the Inbox Zero character if inbox IS empty, or a keyboard shortcut cheat sheet if there are items but none are selected. "Press j to select the first item."
- `ItemList.tsx` bulk-select checkbox (audit issue #7): Remove the fake `opacity-0` checkbox until bulk actions are implemented. False affordances break trust more than missing features.

**Signature warmth move:** One-tap reaction on each delivered item in the list. On hover over an Inbox item, three emoji-stamp options appear at the right edge of the row: ✓ (approve), ✗ (reject), ← (request changes). Tap lands with a spring-scale animation (scale 1.0 → 1.3 → 1.0, 200ms). Stored for agent tuning. Inspired by FigJam stamps (Research B). This makes approvals feel human, not administrative.

---

### /scans

**Primary reference:** PostHog analytics dashboard for dense data with warmth. Stripe's accessible LCH color system for the semantic palette. Attio multi-view for same-data-multiple-perspectives. (Research B)

**What it should BE:** A health history. The user should be able to see at a glance: did my score improve over time, which engines are citing me, when did I last scan. The page is data-dense but readable because typography and spacing do the hierarchy work that color currently fails to do.

**What changes vs. current (referencing audit):**
- Page H1 "Scans" (`ScansClient.tsx:404`): From `text-xl font-semibold` (20px) to `text-[40px] font-display font-medium` InterDisplay. The page has an identity.
- KPI strip (`ScansClient.tsx:470-534`): The `grid grid-cols-3 divide-x divide-gray-100` pattern stays (it's structurally correct) but the label treatment changes: from `text-[10px] font-semibold uppercase tracking-[0.1em]` (aggressive) to `text-[11px] font-medium uppercase tracking-[0.06em] text-secondary` (moderate).
- Filter chips active state (`ScansClient.tsx:569-572`): `bg-gray-900 text-white` → `bg-[#3370FF] text-white`. (Audit issue #10, 30-minute fix)
- `scoreVerdict()` missing "Good" label (`ScansClient.tsx:108`): Add `label: 'Good'` for scores 50-74. (Audit issue #4)
- Engine pips (`ScansClient.tsx:207-239`): Pips get a Tooltip component on desktop (title attribute is not sufficient — audit issue #6). Tooltip shows the engine name + cited/not cited verdict.
- "Run scan now" locked button (`ScansClient.tsx:442-453`): Disabled button becomes an upgrade moment — `cursor-pointer` with a lock icon and on-click opens the upgrade modal. "Unlock continuous scanning →" as the label.
- Empty state ("Run your first check"): Replaced with the typed "First scan" empty state defined above.
- Gradient ID bug (`ScansClient.tsx:187-190`): The hardcoded `id="sot-grad"` becomes a unique ID per instance using `useId()` from React 18. (Audit issue #7, a bug fix, not design)

**Signature warmth move:** The Beamix character reacts to the scan score verdict. Rendered at 48px to the right of the score number in the top KPI strip: a "proud" pose for Excellent (75+), a "neutral working" pose for Good (50-74), a "focused concern" pose for Fair (25-49), a "serious" pose for Critical (0-24). Not mocking, not cheerful — the character registers the situation. This is the moment where illustrations earn their place in a data-dense product.

---

### /automation — Renamed: "Crew"

**Naming decision:** The sidebar says "Automation" and the page title says "Auto-pilot" (audit issue #1, CRITICAL naming inconsistency). Both are wrong. The new name is **Crew**. In the sidebar nav: "Crew". On the page: "Your Crew". Sidebar icon: a group icon (Lucide `Users`). This resolves the inconsistency and introduces an invented product noun that connotes human delegation. (Source: Research B, Basecamp/HEY naming pattern)

**Primary reference:** Linear's agent presence model ("[Agent] is thinking..." with avatar) for showing active agent operations. Basecamp Campfire for the team-chat texture of approved deliverables. (Research B)

**What it should BE:** A team status board. "Which agents are scheduled, what are they running right now, what did they produce last week." Not a cron scheduler, not a workflow builder. The user delegated — now they're checking in on the team.

**What changes vs. current (referencing audit):**
- Page H1: "Auto-pilot" → "Your Crew" in InterDisplay-Medium 40px.
- Sidebar nav: "Automation" → "Crew" with `Users` Lucide icon.
- Schedules table agent icons (`AutomationClient.tsx:276-280`): Every agent gets its distinct Lucide icon, not the same Zap. (Defined in Icon System section)
- "Pause all" kill-switch button (`AutomationClient.tsx:784-803`): `rounded-full` → `rounded-lg`. (Brand guidelines violation, 5-minute fix)
- `OutputFunnelCard` chevron (`AutomationClient.tsx:562-565`): The `ChevronDown` between funnel steps is replaced with a thin vertical line + dot connector (custom SVG, 2px stroke, `#3370FF` fill for completed steps, `#E5E7EB` for future steps). This makes the funnel read as a pipeline, not an accordion.
- Empty schedules state (`AutomationClient.tsx:394-412`): The empty state replaces the entire table component (not lives inside a `<td>`). Uses the "Automation ready" character pose defined above.
- `DailySparkline` non-brand color (`AutomationClient.tsx:172`): `#93b4ff` → `rgba(51,112,255,0.35)` (brand blue at 35% opacity for past bars, 100% for current). (Audit issue)
- "Add automation schedule" dashed-border button (`AutomationClient.tsx:896-904`): Replace the dashed-border ghost with a solid secondary button: `border border-[#E5E7EB] bg-white hover:bg-[#3370FF]/05 rounded-lg px-4 py-2 text-sm text-[#0A0A0A]`. Dashed borders signal drop zones, not actions.

**Signature warmth move:** Active agent operations show a live status line: "[Content Optimizer] is scanning your competitors' pages..." with the agent's icon and a subtle streaming ellipsis. This appears in the schedules table row as a sub-line under the schedule name, visible only when that agent is running. Borrowed from Linear's agent-presence model. (Research B)

---

## IMPLEMENTATION PLAN

This plan assumes approval of this document before any code changes. No implementation begins until Adam approves.

**Phase 0 — Foundation (1 sprint, ~2 weeks):**
- Load `Inter_Display` via `next/font/google` in `apps/web/src/app/layout.tsx`. Apply to `h1`-`h3` via Tailwind `font-display` class. (1 hour)
- Load `Geist_Mono` in the same file for agent logs and scan output. (30 minutes)
- Add `Excalifont` or `Virgil` via `@font-face` from CDN or self-hosted for illustrative moments. (1 hour)
- Replace canvas background from `#FFFFFF` / `#F7F7F7` to `#F5F3EE` via CSS variable `--color-canvas`. (30 minutes)
- Fix sidebar active state: `bg-gray-50 text-gray-900` → `bg-[#3370FF]/08 text-[#3370FF]`. (30 minutes — audit issue #2)
- Remove all non-brand colors from codebase: `#93b4ff`, `#0EA5E9`, violet/orange/teal tints. (2 hours)
- Build 8-10 primitive components replacing Shadcn defaults: `PrimitiveCard` (no tinted-square slots), `PrimitiveKPITile` (number-first, no icon box), `EmptyState` (typed variants), `AgentBadge` (icon-based, not initials), `ScoreRing` (animated SVG), `ActionBar` (proper 40px height buttons), `FilterChip` (brand blue active state).
- Wire Inbox actions to API endpoints. (4-8 hours — prerequisite for shipping)
- Enforce `rounded-lg` everywhere, replace all `rounded-xl` / `rounded-2xl` / `rounded-full` on product buttons.

**Phase 1 — Per-page rebuilds (2 sprints, ~4 weeks):**
- /home: Score ring hero, engine logos, fixed section heading scale. Ships behind `?preview=new-home` flag.
- /inbox: Wired actions, fixed active state, one-tap reactions. Ships behind `?preview=new-inbox` flag.
- /scans: H1 scale, filter chip fix, score verdict label fix, score character reactions. Ships behind `?preview=new-scans` flag.
- /crew (renamed from /automation): Page rename, per-agent icons, pipeline funnel, live status lines. Ships behind `?preview=new-crew` flag.

**Phase 2 — Character system (1 sprint, ~2 weeks after illustrator contract):**
- Commission illustrator for 4 MVP character poses: working / inbox-zero / first-scan / error.
- 11 agent costume variants are Phase 2B (post-launch).
- Excalifont annotation layer for scan output cards.

**Phase 3 — Polish (1 sprint):**
- Signature motion: Beamix mark pulse during active agent operations.
- LLM output streaming in all agent output cards.
- Theme pack experiment: "Blueprint" dark variant for power users.
- Tabular numerals enforcement across all numeric data.

**Total rough estimate:** 4-6 sprints for complete rethink. Phase 0 (highest ROI, lowest risk) can ship within 1 week and already makes the product look materially more premium.

---

## OPEN QUESTIONS FOR ADAM

1. **Illustrator: commission or AI-generate?** PostHog explicitly bans AI art for their mascot and treats it as a brand rule (posthog.com/handbook/company/brand-assets). The research recommends commissioning a human illustrator. What is the budget for illustration work, and do you want to commit to the "no AI character art" rule as a public brand stance?

2. **Product noun invention — how far do we go?** This document recommends renaming "Automation" to "Crew." The pattern could extend: should we rename anything else? The research shows HEY and Basecamp invented almost every major noun (Imbox, Screener, Campfire, Hill Charts). Beamix currently uses industry-standard names throughout. How opinionated do we want to be with naming at this stage?

3. **Dark mode: launch-day or post-launch?** This document recommends post-launch, prioritizing RTL + quality of light mode. If there is a specific user segment (developers, heavy night users) that Adam knows needs dark mode at launch, this decision reverses.

4. **Character system scope for launch:** This document recommends 4 MVP poses (working / inbox-zero / first-scan / error) at launch, with 11 agent variants in Phase 2. Is Adam comfortable launching with a single character in 4 poses, or does he want the full 11 agent variant set before ship?

5. **"Crew" rename: acceptable or too clever?** The "Automation" → "Crew" rename is the most opinionated product noun in this document. It solves the naming inconsistency, introduces brand voice, and shifts the mental model from "configure a cron job" to "delegate to a team." But it is also a departure from industry-standard naming that could confuse users coming from tools like Zapier or Make. Adam's call.

---

## WHAT WE ARE EXPLICITLY NOT DOING

- Not changing brand blue `#3370FF`. Locked.
- Not changing the 7-page product structure. Locked per April 15, 2026 product rethink.
- Not touching the marketing site. That is Framer, separate project, separate team.
- Not adding dark mode at launch. Post-launch decision.
- Not commissioning 11 agent characters at launch. 4 MVP poses, then 11 variants.
- Not shipping any code before Adam approves this document.
- Not replacing Framer Motion (already in the codebase with a good motion library at `apps/web/src/lib/motion.ts`).
- Not replacing Supabase, Paddle, or any backend infrastructure — this is a visual/UX rethink only.
- Not changing the auth flow or onboarding — those are separate concerns.
