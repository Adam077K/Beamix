---
page: Blog Studio
route: /blog-studio
states_audited:
  - populated-desktop.png  (Build tier, idle state, input panel expanded — the ONLY captured state)
states_missing:
  - empty-desktop (pageState='empty')
  - running/ledger-desktop (pageState='running')
  - success/markdown-editor-desktop (pageState='success')
  - error-desktop (pageState='error')
  - tier-locked-desktop (DEMO_PLAN_TIER='discover')
  - mobile-375 (all states)
competitor_refs_used:
  - Profound-Screenshot 10.37.47 AM (onboarding step: left-aligned headline + content-rich right rail)
  - Profound-Screenshot 10.38.10 AM (form step: region/language, confident left form panel + globe asset)
  - Profound-Screenshot 10.39.25 AM (110-prompts data table — dense, mono numbers, in-cell deltas)
  - otterly-Screenshot 10.44.17 AM (brand-onboarding form: form panel + live preview skeleton rail)
verdict: NEEDS_WORK
---

# blog-studio — UI Excellence Audit

## Screenshots
- [populated-desktop.png](./screenshots/blog-studio/populated-desktop.png) — Build tier, idle state, input panel expanded

> NOTE: Only ONE screenshot was captured for this page (`populated-desktop.png`). The source
> (`BlogEditor.tsx`) ships FIVE distinct surface states (tier-locked, empty, running ledger,
> success markdown editor, error) plus a mobile breakpoint — NONE of which were screenshotted.
> This audit grades only what is visible. The empty/loading/error/success/tier-locked/mobile
> states are UNVERIFIED and must be captured before this page can PASS. See "Per-state notes."

## Verdict
**NEEDS_WORK.** The captured state is on-brand, has the right bones (single-column Console
Spine, 64px mono score, blue=you / violet=agents toggle, designed input panel), and is clearly
NOT a vibe-coded template — it sits in the same family as the #173 dashboard. But against the
competitor bar (Profound / Otterly), the one visible state reads under-confident and slightly
hollow: a massive dead zone to the right of the 880px column, an inverted depth hierarchy
(the supposedly-receding TIER-3 header carries more visual weight than the TIER-2 input card
below it), a stretched/awkward mode-toggle pill, a near-invisible signature sparkline, and a
context header that is the page's de-facto hero yet is built as the recede tier. No brand-law
BLOCK and no clone — so this is craft polish, not a redesign. It is roughly one focused polish
pass away from the bar IF the unscreenshotted states hold up.

---

## P1 — must fix (looks AI / broken)

### P1-1 — Inverted depth hierarchy: the TIER-3 "recede" header is the heaviest surface (tell #1, M1)
The context header (Zone 1) renders with `.card-inset` — a filled warm-grey ground — at
`ToolPage.tsx:82`. The input panel below (Zone 2) is `.card-console` — white with a hairline
border (`ToolPage.tsx:117`). On screen the result is INVERTED from the M1 intent: the
"receding" TIER-3 header is the most filled, most prominent block on the page, while the
TIER-2 input card (which holds the actual work) reads lighter and less important. M1 says
TIER-3 should recede (transparent/surface-warm, NO shadow) and the focal should command. Here
the eye lands on the header ground, not on the task. **Fix (M1):** either (a) make Zone 1 a
truly receding inset — drop the fill to transparent-on-page or a 1px hairline only, no solid
ground — so the white input card becomes the brightest surface; or (b) accept the header as a
deliberate TIER-1 context band and then give the input card real TIER-2 elevation
(`--shadow-card`) so the two read as distinct, stepped tiers. Right now they read as two
same-ish panels with the wrong one winning. `ToolPage.tsx:82` + `ToolPage.tsx:117`.

### P1-2 — Huge right-side dead zone: the 880px column floats in a much wider main area (tell #5, M3)
The content is locked to `max-w-[880px]` (`ToolPage.tsx:79`) but is rendered inside the full
DashboardShell main area, which in the screenshot extends to ~1440px. The result is a ~430px
column of pure empty white to the RIGHT of every card, with no balancing element. The page
does not read "centered and calm" — it reads "left-anchored content with a broken right
half." The competitor form screens (Profound 10.38.10, Otterly 10.44.17) solve exactly this
by putting a content-rich asset/preview in the right space (a globe, a live skeleton preview
of the output). Beamix has the perfect candidate: a live preview of the article being built,
the engine-citation context, or recent runs. **Fix (M3):** either truly center the 880px
column in the available main width (`mx-auto` against the real container, not left-biased), OR
adopt the competitor move — a dominant input column + a narrower right rail showing live
context (last drafts, engine coverage, what AI engines currently cite). The current state is
neither centered nor asymmetric-with-intent; it is a centered column that LOOKS left-dumped.
`ToolPage.tsx:79`.

### P1-3 — Stretched, lopsided mode-toggle pill (M3, tell #5)
The "Run it myself / Let Beamix handle it" toggle is an inline pill (`ModeToggle.tsx:43`) but
it sits in a full-width Zone 3 column (`ToolPage.tsx:126`), and the two segments are unequal
widths (active blue segment is short, inactive "Let Beamix handle it" segment is wide). On
screen it reads as a half-empty stretched bar with the blue chip jammed left — the
category-defining you-vs-agents control looks accidental, not designed. The promise (blue=you
/ violet=agents) is the single most important brand idea and its primary control looks
unbalanced. **Fix:** give the two segments equal width (or size both to content and center the
pill), so the blue/violet split is symmetric and legible as a real toggle. Don't let it span
the full 880px as a thin lopsided bar. `ModeToggle.tsx:52-84` + `RunControl.tsx:48`.

### P1-4 — Signature sparkline is invisible / reads as a stray mark (tell #4, M4)
The M4 micro-sparkline under the "71" renders as a faint, thin green diagonal hairline
(`EngineMicroSparkline.tsx`, 1.5px stroke, 64×24px) and at the score-band green on white it is
barely perceptible — it looks like a stray pen mark, not the signature data detail the rubric
calls for. The rubric (M4) wants this to be a recognizable, repeatable signature. Right now it
adds zero confidence. **Fix (M4):** raise contrast/legibility — slightly thicker stroke, add
end-point dot on the latest value, and/or a faint baseline so the upward trend [44→71] is
legible at arm's length. It must read as "this score is climbing," not as a smudge.
`EngineMicroSparkline.tsx:85-92`.

---

## P2 — substantive

### P2-1 — No serif beat in the audited state (tell #6, M5)
The Fraunces verdict beat (`SerifVerdict`) exists in the page — but only in the populated
MarkdownEditor ("ready", `BlogEditor.tsx:371`) and the TierLockBanner ("cite",
`BlogEditor.tsx:107`). The idle/input state that was actually captured has NO serif beat
anywhere, so the warm-minimal soul is absent from the default landing view of this page. The
"Research, draft, and publish authority articles that AI engines cite" subhead at
`BlogEditor.tsx:723` / `ToolPage.tsx:97` is the natural home for it — "cite" or "authority"
could carry the one Fraunces italic. **Fix (M5):** put the single serif beat on a verdict word
in the whatThisDoes subhead so the default state has the soul, not just the deep states.

### P2-2 — Custom-instructions placeholder: low-contrast, overlong, looks like filled content (M2, a11y)
The custom-instructions textarea placeholder ("e.g. Focus on post-procedure care…") is set in
`#D1D5DB` (`BlogEditor.tsx:230`) and wraps to two long lines. On screen it is so faint it
fails as readable guidance and so long it reads like pre-filled disabled text rather than a
hint. **Fix:** shorten the example to one line, and either lift placeholder contrast toward
`#9CA3AF` (matches the hint text already used at `BlogEditor.tsx:176`) or move the long example
into helper text below the label. `BlogEditor.tsx:230`.

### P2-3 — "Page lock active" band competes with the input it sits inside (M12)
Inside the input card, the "Page lock active" notice (`BlogEditor.tsx:195`) is a full-width
bordered grey panel that visually rivals the topic input above it — two boxed rows of similar
weight stacked tight. It reads as a second input, not a passive status note. M12 wants
whitespace varied by relationship: this passive note should recede (lighter, borderless, more
space above it) so the topic field stays the focal of the panel. **Fix (M12):** make the lock
note a quiet hairline row (icon + muted text, no full border box) and add breathing room so the
topic field clearly leads. `BlogEditor.tsx:195-212`.

### P2-4 — Two near-identical primary actions stacked (M10, hierarchy)
Zone 3 shows the blue mode toggle's active chip AND a full-width solid blue "Run Authority
Blog Strategist" button directly below it. Two blue elements stacked tight with no gap rhythm
makes the actual GO button compete with the toggle chip for "the blue thing to press." **Fix
(M12/M10):** increase separation and weight contrast — the toggle is a quiet selector, the Run
button is the commanding action. Right now they're near-equal blue blocks. `RunControl.tsx:48`
(toggle gap) + `RunControl.tsx:90`.

### P2-5 — Top search bar is a bare floating pill in the chrome (consistency)
The "Search" control top-left of the main area renders as an unbacked floating rounded pill
with no container or alignment to the content column — it reads unfinished against the polished
card below it. (Shared shell chrome, outside this page's files, but visible in this page's
capture and worth routing to the shell owner.) Confirm it is intentional and aligned to the
880px column, or give it a proper field treatment.

---

## P3 — nice-to-have

### P3-1 — "71 / BLOG CONTENT SCORE" lacks a band word (M5/M11)
The score is a bare number. The dashboard exemplar pairs the mono figure with a verdict band
word (e.g. "Good") — optionally the one Fraunces beat. Consider a small band label so "71"
reads as "Good" at a glance, consistent with the dashboard. `ContextStat.tsx:35-52`.

### P3-2 — Entrance choreography unverifiable from a static shot (M9)
`craft-enter` stagger classes are wired (`ToolPage.tsx:82,111,126`). Confirm via a recording
that the fade-up + 40ms priority stagger fires and respects `prefers-reduced-motion`. Not
gradable from one PNG.

### P3-3 — Score-band trend direction not surfaced (M7)
The 71 is up from 44 over 5 runs (`BlogEditor.tsx:44`) — a strong positive story that the UI
hides entirely except in the faint sparkline. A small "+27 over 5 runs" mono delta beside the
sparkline would make the climb felt (M7 in-cell shading). `ContextStat.tsx`.

---

## Per-state notes

### Populated-desktop (the ONLY captured state — Build tier, idle, input expanded)
Graded above. Bones are right; the issues are depth inversion (P1-1), right-side dead zone
(P1-2), lopsided toggle (P1-3), invisible sparkline (P1-4). No brand-law violation, no clone.

### Empty (pageState='empty') — NOT CAPTURED
Source looks strong on paper: bespoke `BlogGlyph` (not a bare centered icon-in-circle),
titled context, two-tier CTA (primary "Use suggested topic" + quiet "Enter my own topic" text
link), `align="top"` (`BlogEditor.tsx:618-648`). This satisfies M8 in code but is UNVERIFIED —
must be screenshotted. Note: the empty state is unreachable in the current demo because
`DEMO_PLAN_TIER='build'` initializes `pageState='idle'`, never `'empty'`.

### Running / ledger (pageState='running') — NOT CAPTURED
PipelineLedger with 5 stages + live substep cycling + skeleton hand-off (`BlogEditor.tsx:593`,
`MarkdownEditorSkeleton:242`). Skeleton matches layout sizes (good, not a spinner). UNVERIFIED —
the live ledger + violet agent-territory treatment is the highest-risk unscreenshotted state.

### Success / markdown editor (pageState='success') — NOT CAPTURED
The richest surface: word-count mono + progress bar, YMYL notice band (`#FDF9EE`), status chip
(violet `#EEEAFD`/`#6E56F0` for pending — correct agent color), Fraunces "ready" beat, approvals
CTA footer (`BlogEditor.tsx:282-392`). This is where the page earns its keep and it was NOT
captured. Must be screenshotted — the 520px mono textarea + multiple stacked bordered bands
(header / YMYL / verdict / footer) is exactly the kind of uniform-band stack that can read AI
if depth isn't staged.

### Error (pageState='error') — NOT CAPTURED
ErrorState names a real recovery ("research step can't reach external sources… Try again") with
an onRetry — satisfies M8's "errors name a real recovery action" in code. UNVERIFIED.

### Tier-locked (Discover) — NOT CAPTURED
TierLockBanner is a strong, designed upsell (eyebrow + 22px display head + value bullets +
two-tier CTA + Fraunces "cite", `BlogEditor.tsx:80-144`). Requires flipping `DEMO_PLAN_TIER`
to `'discover'` (`page.tsx:25`) to capture. UNVERIFIED.

### Mobile-375 — NOT CAPTURED
The TierLockBanner uses `sm:flex-row` (stacks on mobile — good), the input panel is a single
column. But the Zone 1 header uses `flex items-start justify-between` with the 64px score in a
`shrink-0` rail (`ToolPage.tsx:83`) — at 375px the 64px mono figure beside a wrapping title
risks crowding/overlap. UNVERIFIED and a real risk. Must be screenshotted at 375px.

---

## Summary for the polisher (worklist, in priority order)
1. Fix the depth inversion — make the TIER-3 header recede or the input card command (P1-1).
2. Kill the right-side dead zone — center the column for real, or add a live-context right rail (P1-2).
3. Balance the mode-toggle pill — equal segments, centered, not a stretched lopsided bar (P1-3).
4. Make the signature sparkline legible — thicker + endpoint dot + trend delta (P1-4, P3-3).
5. Add the one Fraunces beat to the idle subhead so the default state has soul (P2-1).
6. Capture the 5 missing states + mobile and re-audit — success/running/mobile are the real risks.
