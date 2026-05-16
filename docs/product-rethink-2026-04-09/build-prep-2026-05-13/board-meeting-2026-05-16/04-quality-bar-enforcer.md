# Board Member 4 — Quality Bar Enforcer

## Verdict: WILL HIT 60–70%

The spec is unusually concrete for a SaaS rebuild — `13-DESIGN-SYSTEM-SPEC.md` ships named spring presets, `14-SCAN-UX-SPEC.md` choreographs the wound-reveal millisecond-by-millisecond — but several billion-dollar-feel surfaces still ship on workers' instincts, not on falsifiable spec. Linear/Stripe-grade requires the spec itself to be the bar; right now there are 5–6 craft gaps wide enough to drop us into PostHog territory.

---

## Top 5 quality risks (where the build will be "good" not "billion-dollar")

### 1. Empty-state illustrations die in the gap between Wave 0 and Wave 2
- Wave 0 Worker 3 ships "simple inline SVGs as placeholders" for 9 illustrations.
- Wave 2 Worker 4 does an "empty-state audit" — but the brief says *audit*, not *craft*. There is NO worker, anywhere, whose deliverable is "design 9 billion-dollar line-art illustrations" with concrete style references, line-weight specs, motion treatment, or QA criteria.
- `04-EMPTY-STATES.md` line 5 says "line-art (single stroke `#0A0A0A`, accent strokes `#3370FF`)" — that's one sentence for 9 different scenes (workspace, inbox, scans, automation, archive, competitors, celebration, failure, tier-locked). No reference image. No style sheet. No "look like Things 3 / Mercury, NOT like Heroicons stock."
- Outcome: workers will paste Lucide icons or a generic Heroicons illustration set. Empty states become the most visible "AI slop" surface in the product.

### 2. Free scan animation is over-specced technically but under-specced emotionally
- `14-SCAN-UX-SPEC.md` specs the sonar CSS, progress-ring math, and 80px sizes — but the engine-pill light-up sequence is described as "pill background fades from dark → engine brand color → settles to `#3370FF` with checkmark" with NO easing curve, NO duration, NO stagger choreography between engines.
- The query ticker is "2.5s per query, loop" — one sentence. No fade curve. No font-weight transition. No glyph-rendering treatment. A Linear engineer would spec the letter-spacing shift on hover.
- Wound-reveal sequence (0ms → 3800ms) is specced — but ONLY the entry choreography. There's no spec for what happens after `revealed` while the user reads. No micro-animations on hover, no scroll-driven reveals on the blurred fix cards, no "8 more issues" lockup motion. This is exactly where Stripe Press / Vision Pro spend 60% of their craft budget.

### 3. `apps/web/src/lib/motion.ts` springs are correct but generic — and there's no spec for WHEN to use which
- The 4 presets (snappy/standard/gentle/bouncy) are well-defined values. Good.
- But the spec lists ONE assignment per preset ("snappy = badge counts; bouncy = success states") with no enumeration of all surfaces. The ScoreHero spec says "Framer Motion `useSpring`" but doesn't say which preset, what stiffness on the digit-roll, or how the delta pill transitions in.
- Three workers will each pick their own spring for the same logical animation (e.g., card-enter on Home vs card-enter on Inbox vs card-enter on Archive). Wave 2 Worker 4 is asked to "tune any spring that feels off" — but reconciliation in Wave 2 after divergence in Wave 1 IS the failure mode. It should be tuned BEFORE Wave 1 spawns.
- Linear-grade products have spring assignments documented per component class. We have presets but no assignment table.

### 4. Typography hierarchy + spacing rhythm are NOT specified in falsifiable terms
- `13-DESIGN-SYSTEM-SPEC.md` says: "h1 size on Home, card title size, etc." — and defers this to the design-lead Wave 1 prep deliverable doc. That's a 2-hour prep, no PR, no QA gate.
- The design system spec mentions Tailwind defaults for spacing. "Key spacings: 4/6/8/12." No rhythm rules. No "card padding always 24px, never 20." No "section gap is always 48 on desktop, 32 on tablet, 24 on mobile." → Padding WILL drift across the 7 pages.
- Letter-spacing, line-height, and weight pairings (which the quality bar explicitly calls out: "letter-spacing, line-height, weight pairings, corner radii ratios") are not anywhere in the spec. Default Tailwind tracking on Inter at 32px headings is NOT billion-dollar — it's good-SaaS.

### 5. The Full-tier QA gate has NO craft criteria
- Wave 1 QA gate output is frontmatter: `verdict: PASS | BLOCK, risk_tier, findings: []`. The brief lists security checks, type-safety, idempotency, rate limits — zero entries about visual craft.
- Wave 2 Worker 4 "audits empty states" via Playwright SCREENSHOT TESTS — captures images as canonical reference. But screenshot tests detect regression, not quality. They don't fail when the design is mediocre; they only fail when the design changes.
- There is no human-review checkpoint where Adam (or a design-lead with the Linear/Stripe taste filter) signs off on visual craft BEFORE merge. By the time Adam sees Wave 1 PRs, 6 frontend workers have already shipped divergent UI.

---

## Surfaces with strong specs (will hit the bar)

- **Free-scan wound-reveal entrance choreography** (0ms → 3800ms timeline, `@number-flow/react` for digit roll, cubic-bezier overshoot on engine bars) — this is the one piece of the spec where craft is concrete and falsifiable.
- **3-pane Inbox layout** (280 / flex / 300 widths, J/K/A/R shortcuts named) — structurally tight.
- **Spring preset *values*** (stiffness/damping/mass numbers given) — workers can't invent these.
- **Empty-state content** (every page's title + body copy is written in `04-EMPTY-STATES.md` with brand voice) — copy will be consistent.
- **Color tokens** (single accent `#3370FF` mandated, retired colors enumerated) — no drift here.

---

## Surfaces with weak specs (will fall short)

| Surface | What's missing | Predicted failure mode |
|---|---|---|
| 9 empty-state illustrations | Reference style sheet, line weights, motion treatment | Generic Heroicons-feel SVGs |
| Skeleton loaders | NO per-page skeleton spec — `Skeleton` exists in Shadcn list but no design | Each FE worker invents shape; skeletons feel inconsistent |
| Score hero digit-roll | Spring preset assignment missing | Generic Framer Motion spring; feels SaaS-template |
| Delta pill on Score hero | "Animates in 300ms after counter settles" — no exit curve, no hover, no number-flip if score changes mid-session | Static-feeling |
| Inbox auto-advance focus management | "Auto-advance to next" mentioned; no scroll-into-view, no focus-ring transition, no list virtualization spec | Janky at 200+ items |
| Hover states (universal) | Only `cardHover` specced; no button hover, no link hover, no icon hover | Defaults to Shadcn = bland |
| Focus rings | Not specced anywhere | Tailwind default `ring-2 ring-blue-500` = mediocre |
| Typography scale | Deferred to design-lead prep doc | Workers use `text-3xl` etc; no intentional pairing |
| Spacing rhythm | "Key spacings 4/6/8/12" — no rules | Padding drifts page-to-page |
| Mobile touch targets | Free-scan form says "min 48px" — nothing else specs touch targets | iOS HIG (44pt) not enforced elsewhere |
| Loading transitions between scan states | State machine specced; transitions between states are not | Jumpy; feels like a 2-week MVP |
| Page transitions | "`AnimatePresence` + `fadeInUp`" — no exit choreography | Routes flash |
| Microcopy on errors | Error toast styles unspecified | Generic Shadcn toast = looks like every SaaS |
| Day-1 "drafts surfacing live" panel | Concept specified; visual treatment not | Could ship as a boring list |
| WCAG AAA contrast | Not mentioned anywhere. Quality bar implies accessibility but spec is silent | Color choices ship at AA at best |

---

## What needs to be added to Wave 1 design-lead prep BEFORE frontend workers spawn

The Wave 1 design-lead "2-hour prep" is too thin for the load it carries. Expand it to include:

1. **Empty-state illustration asset set** — commission or source 9 finished SVGs (or specify a reference set like Glyph / Untitled UI / streamline) with line weights, motion treatments per state. Don't ship Wave 1 with "simple inline SVG placeholders."
2. **Spring assignment table** — one row per component class (modal-enter, card-enter, badge-update, hover-lift, focus-ring-appear, page-transition, dropdown-open, drawer-slide, toast-enter, skeleton-pulse). Bind each to a preset OR to an explicit `useSpring` config.
3. **Skeleton design spec** — one design for each shape class (text-line, card, list-row, score-hero-loading, sparkline-loading). Use shimmer, not pulse. Specify shimmer gradient direction + speed.
4. **Typography scale** — exact px/rem + line-height + tracking for h1/h2/h3/h4/body-lg/body/caption/code. Per-page overrides (e.g., Home score is 96px InterDisplay 500 with -0.04em tracking).
5. **Spacing rhythm rules** — section gap, card padding, button padding, modal padding, sidebar item padding. Locked across all pages.
6. **Hover/focus/active state library** — for buttons, links, cards, list-rows, nav items, badges. Specify the transition timing AND the visual diff.
7. **Loading transition map** — for every state-machine transition (`scanning → revealing`, `form → scanning`, modal open/close, inbox-item select), specify the choreography.
8. **WCAG checklist** — minimum AA, target AAA on body text. Focus rings 3:1 against adjacent colors. Test in QA.
9. **Craft QA criteria** — a checklist QA Lead applies BEFORE the PASS verdict. ~20 items. Forces a human-review gate against the quality bar.

The current 2-hour prep produces a markdown reference doc; this should be a half-day deliverable that produces both a reference doc AND a Figma/Framer pin-board with reference shots from Linear/Stripe/Mercury/Things3 for every component class.

---

## The one quality moment that will most likely embarrass Adam at launch

**The Home page Day-1 empty state.**

This is the user's first authenticated impression. The spec says: spinning indicator → "Connecting your workspace" → "Running first scan" → data appears. Driven by polling. Cards surface as drafts complete.

What the spec doesn't say:
- Visual treatment of the `workspace` illustration (a stub SVG)
- Choreography of card-surfacing-live (no entrance animation specified)
- The transition from empty-state-with-illustration → populated-with-3-suggestions (specced as "auto-redirect" — no morph, no fade-out)
- Microcopy timing (does "1–3 minutes" decay if it takes 2:30?)
- What happens between states (3-second gap of nothing? Skeleton? Pulse?)

Per Adam's locked bar (`project_quality_bar_billion_dollar.md` line 44): "/home is the most important surface." This is exactly the page where the brand promise either lands or fails. The current spec ships it as a polling progress UI with placeholder SVG. A Tel Aviv lawyer who just paid $189 hits this for 2–3 minutes, sees a spinner-with-text, and the experience reads "1-person SaaS, not $1B company."

Add to Wave 1 design-lead prep: a **Day-1 experience storyboard** — every frame from post-payment redirect to first draft appearing, with hold times, transitions, microcopy timing, and ambient motion. This is the single highest-leverage craft surface in the entire MVP.

---

## Bottom line

**Will this feel billion-dollar?** Right now: NO. It will feel like a *well-engineered* SaaS — secure, fast, correct — but visually it will read as "expensive Shadcn template" not "Linear/Stripe-grade." The gap is closeable, but only if Wave 1 design-lead prep is upgraded from 2 hours of markdown to a half-day deliverable that locks: illustration set, spring assignments, skeleton designs, typography scale, spacing rhythm, hover/focus library, and craft QA criteria — BEFORE the 3 frontend workers spawn. Otherwise Wave 2 polish becomes an impossible reconciliation pass across 3 divergent codebases, and the result ships at PostHog tier, not Linear tier.
