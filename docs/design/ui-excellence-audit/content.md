---
page: /content (Content Editor)
route: /content
states_audited:
  - populated-desktop.png   # the idle/populated state — page selected list shown, run controls visible
states_missing:
  - empty-desktop (NOT captured)
  - running/ledger (NOT captured)
  - success/diff-output (NOT captured)
  - error (NOT captured)
  - mobile-375 (NOT captured)
competitor_refs_used:
  - Profound-Screenshot 2026-06-12 at 10.38.02 AM.png  (onboarding split: form left / rich data-tile right)
  - Profound-Screenshot 2026-06-12 at 10.38.16 AM.png  (verdict headline + ranked leaderboard tile)
  - Profound-Screenshot 2026-06-12 at 10.37.47 AM.png  (split screen, dotted ground, leaderboard rail)
  - Profound-Screenshot 2026-06-12 at 10.39.25 AM.png  (dense prompts table, mono numbers, deltas)
  - otterly-Screenshot 2026-06-12 at 10.44.17 AM.png   (form left / skeleton-data preview right)
verdict: NEEDS_WORK
---

# content — UI Excellence Audit

## Screenshots

- [populated-desktop.png](screenshots/content/populated-desktop.png) — the only captured state

> AUDIT COVERAGE WARNING: only ONE state (idle/populated desktop) was captured. The empty,
> running (pipeline ledger), success (DiffEditor / FAQ output), error, and mobile-375 states
> were NOT screenshotted. The richest and highest-risk surfaces of this page — the live
> pipeline ledger and the diff/FAQ output — are unaudited visually. Findings below for those
> states are derived from source (`ContentTabs.tsx`, `ToolPage.tsx`, `empty-state.tsx`) and are
> flagged as code-only. They MUST be re-screenshotted before this page ships.

## Verdict

**NEEDS_WORK.** The console-spine structure is genuinely good — it has real asymmetry (dominant
doc / narrow stat rail), a single TIER-1 → TIER-3 depth intent, a 64px mono hero figure, the
signature micro-sparkline, mono-for-truth numbers, and the blue=you / violet=agents law is
correctly executed (the ModeToggle and page-lock box are textbook). This is not vibe-coded chrome;
someone applied the rubric. But against the competitor bar it is **visually under-finished and
has two real bugs**: (1) the picker shows two byte-identical "Teeth Whitening" rows — same title,
same URL, same score — which reads as a data/dedup bug, not a design; (2) the full-width slab
"Run Content Optimizer" button is a heavy, unbranded rectangle that collides with the brand's
button language and visually outweighs everything above it. The page also reads flatter and emptier
than Profound/Otterly: a vast dead white gutter below the fold, no entrance life visible, a serif
beat that is absent from this idle state, and a hero figure ("31") whose meaning is ambiguous
(avg visibility of *what* — it equals the score of the only real page). It is one focused polish
pass and two bug fixes away from the bar, not a redesign.

## P1 — must fix (looks AI / broken)

### P1-1 — Duplicate, byte-identical "Teeth Whitening" rows in the picker (REAL BUG)
The TARGET PAGE list shows two rows that are visually indistinguishable: both "Teeth Whitening",
both `https://brightsmile-dental.co.il/services/whitening`, both score `31`. The only difference
is a `LOCKED` pill on the second. Confirmed in source: `content.ts:21-28` (id c1) and
`content.ts:51-58` (id c4) are the same `title` + `url` + `visibilityScore: 31`, `tab: 'optimize'`.
Two identical options with no disambiguation is the textbook "AI generated placeholder data" tell
and a usability bug — a user cannot tell why there are two of the same page or which to pick.
- **Why it reads broken vs ref:** Profound's prompt list (`10.39.25 AM`) and Otterly's data rows
  are each distinct, meaningful rows. Duplicated identical rows look like a seed-data mistake.
- **Fix (data + M7):** Make the locked row a *state of the same page*, not a second page —
  collapse to ONE "Teeth Whitening" entry that shows an inline "Locked — run in progress" status
  hairline (M7 left status-color hairline) instead of a duplicate row. If two genuinely different
  pages are intended, give them different URLs/titles/scores. `ContentTabs.tsx:534-540` renders the
  list; the dedup belongs in `content.ts:18-60`.

### P1-2 — Full-width slab primary button breaks the brand button language and over-weights Zone 3
The "Run Content Optimizer" button is a ~810px-wide solid `#3370FF` slab spanning the entire
column. It is the single heaviest object on the page and pulls the eye to the very bottom, below
even the (more important) hero. Product buttons in this system are `rounded-lg` *sized to content*,
not full-bleed bars (BRAND: "Product utility — Rounded-lg, sized to context"; pill full-width is a
marketing pattern). Rendered via `RunControl.tsx:90-97` → `Button variant="default"` which is
evidently stretching to container width.
- **Why it reads AI/template vs ref:** Profound's primary action ("Continue", `10.38.02 AM`) is a
  contained pill, not a wall-to-wall slab. A full-width filled rectangle is the canonical "I let the
  button default to w-full" tell.
- **Fix (M2/M3 weight + brand button):** Constrain the run button to content width (e.g.
  `inline-flex` / `w-auto`, ~`h-10 px-5`), left-aligned under the ModeToggle so the toggle and the
  button read as ONE left-anchored unit (the spine intends "who runs this → go" as one cluster,
  `RunControl.tsx:26`). The slab currently visually divorces them. Verify `Button variant="default"`
  isn't `w-full` in `ui/button.tsx`.

### P1-3 — Ambiguous / mis-labeled hero figure "31 — AVG VISIBILITY"
The TIER-1 hero number is "31" labelled "AVG VISIBILITY," but in the optimize tab there is exactly
one real page (the second is a dup, see P1-1), whose score is also 31. So the "average" is an average
of one — the hero figure is mathematically the same as the row below it and reads as a coincidence,
not a signal. Computed at `ContentTabs.tsx:360-363`.
- **Why it reads off vs ref:** Profound's hero metric ("Brand Visibility 65% +5%", `10.38.02 AM`)
  is a portfolio-level truth with a delta. A bare "31" with no delta and no band color, that happens
  to equal the only row, looks like filler.
- **Fix (M2/M4/M7):** Either (a) make the hero figure a portfolio-level number that is genuinely
  distinct from any single row and attach a delta + band color (`#EF4444` critical band at 31), or
  (b) re-label it to what it actually is for this tab ("This page" not "Avg"). Color the figure to
  its band and give the sparkline a real trend so it isn't a flat decorative squiggle.

### P1-4 — Vast dead white gutter below the fold (idle state under-composed)
Below the run button the entire lower ~30% of the viewport is empty white. The page stops abruptly;
there is no Zone 5 content, no run-history affordance visible, no "what you'll get" preview. The
competitor refs fill the right/lower canvas with a data tile, skeleton preview, or leaderboard
(Otterly `10.44.17` skeleton preview; Profound `10.38.16` leaderboard tile) so the screen never
reads half-finished.
- **Why it reads AI/unfinished vs ref:** Big bottom dead-space under a single centered column is
  tell #5 (dead-center stack) + an "unfinished page" signal. The 880px column floats in a wide
  neutral field with nothing balancing it.
- **Fix (M3/M8/M10):** Show a ghosted preview of the diff/FAQ output the run will produce
  (the EmptyState already supports a `preview` scrim, `empty-state.tsx:169-175`, but the idle
  OutputZone path doesn't use it — `ContentTabs.tsx:810-846` only previews in `empty`, and the
  idle state renders NO Zone 5 at all per `ToolPage.tsx:76`). Add a quiet "Here's what a run
  produces" ghosted diff card or a run-history strip below Zone 3 so the lower canvas earns its space.

## P2 — substantive

### P2-1 — No serif beat present in this state (tell #6)
M5 requires exactly one Fraunces italic verdict beat per screen. In the captured idle state there
is none — Fraunces only appears in the FAQ *success* output ("Ready", `ContentTabs.tsx:919` via
`SerifVerdict`). The primary, most-seen state of the page therefore has zero serif soul and reads
as pure sans chrome.
- **Fix (M5):** Add one Fraunces italic beat to the idle hero — e.g. the what-this-does line could
  carry a single italic verdict word, or the band label on the hero figure. One beat, on a verdict
  word only, never in the eyebrow/labels.

### P2-2 — The two picker rows are visually identical cards (tell #2, near-N-equal)
Even setting aside the duplicate-data bug, the two `DocSelectRow`s (`ContentTabs.tsx:581-651`) are
the same height, same border, same radius, same internal layout — a 2-equal stack. There is no
weighting between a high-value target and a low one; the score "31" sits in the same recessive grey
mono as the URL.
- **Why it reads AI vs ref:** Profound/Otterly rows carry in-row deltas, rank chips, and color so
  rows differ by data. Identical rows are the equal-card tell at small scale.
- **Fix (M7):** In-cell data shading — make the visibility score the dominant in-row figure
  (larger mono, band-colored), add a left status hairline keyed to the score band, and let row
  height/emphasis follow the data (lowest-scoring / highest-opportunity page reads heavier).

### P2-3 — Hero sparkline reads as decorative, not truth (M4/M11)
The micro-sparkline under "31" is fed `[28, 31, 30, 34, avgScore]` (`ContentTabs.tsx:365-366`) —
synthetic points, not real run history. The rubric (M4) is explicit: flat 1px baseline when null,
**never fake data**. A wiggle that isn't real history is exactly the "signature detail faked"
problem.
- **Fix (M4):** Drive the sparkline from real per-page score history, or render the flat
  null-baseline. Do not hand it a hardcoded 5-point array.

### P2-4 — Tab bar is quiet to the point of invisibility; the FAQ count chip is the only differentiator
The Optimize/Refresh/FAQ tabs (`ContentTabs.tsx:396-417`) are 13px text with a thin underline.
Against the competitor bar (Profound's sub-nav is similarly quiet but sits on a denser canvas),
on this sparse page the tabs read as small and easy to miss — the entire "three agents" story is
carried by three tiny words. There's no indication that switching tabs changes the agent/behavior.
- **Fix (M2/M12):** Give the active tab slightly more presence (weight + a hairline-anchored
  eyebrow like "AGENT" above the tab row), and consider a one-line agent descriptor that updates
  with the tab so the user feels they're switching tools, not just filtering.

### P2-5 — Two violet "info circle" treatments compete (M6 consistency)
The page-lock box (`ContentTabs.tsx:547-566`) uses a violet `#EEEAFD` ground + violet glyph, and
the FAQ gate bar (`ContentTabs.tsx:958-971`) uses another violet circle glyph. Both are correct
per the violet=agents law, but they are slightly different shapes/sizes of the same idea. On a
page this sparse the single violet box is good; ensure the violet structure reads as ONE consistent
agent-zone language, not two near-identical-but-different chips.
- **Fix (M6):** Standardize the agent-info affordance (one component, one size/shape) so the violet
  structure is glanceably consistent.

## P3 — nice-to-have

### P3-1 — Entrance choreography not verifiable; ensure it actually fires
`ToolPage` applies `craft-enter craft-enter-1..6` classes (`ToolPage.tsx:82,111,126`) but the
static screenshot can't confirm the fade-up runs (and the audit captured no running state). Verify
the stagger fires on first paint and respects `prefers-reduced-motion`.

### P3-2 — "Custom instructions (optional)" placeholder is good but the field is visually weightless
The textarea (`ContentTabs.tsx:777-784`) blends into the card. A faint hairline label-to-field
relationship (M12) would make the optional nature clearer without adding chrome.

### P3-3 — Empty state glyph risks the bare-centered-icon tell (M8) — code only
`OutputZone` empty (`ContentTabs.tsx:810-846`) is `align="top"` with a centered blue icon chip +
title + two-tier CTA — structurally compliant with M8. But it does NOT pass a `preview` scrim, so
it's a centered glyph in space rather than the "ghosted preview of the real feature" the
EmptyState was built for (`empty-state.tsx:169-175`). Add a ghosted diff preview to convert the
empty state from apology to sales surface. (Re-screenshot the empty state to confirm.)

## Per-state notes

### Populated / idle (captured — populated-desktop.png)
- Structure is sound: real asymmetry, depth intent, mono hero, sparkline, correct blue/violet law.
- Worst offenders are the duplicate picker rows (P1-1), the full-width slab button (P1-2), the
  ambiguous "31" (P1-3), and the dead lower gutter (P1-4).
- No serif beat in this state (P2-1). Sparkline is faked (P2-3).

### Empty (NOT captured — code review only)
- M8-shaped (titled, two-tier CTA, top-aligned) but no `preview` scrim used → risks the bare
  centered-glyph tell. Must be screenshotted.

### Running / pipeline ledger (NOT captured — code review only)
- `PipelineLedger` with substep cycling is the richest moment on the page and is entirely
  unaudited visually. Must be screenshotted.

### Success — DiffEditor / FAQOutput (NOT captured — code review only)
- FAQOutput carries the only serif beat ("Ready") and the TIER-1 hero card. DiffEditor is
  unseen. Both must be screenshotted — this is where the page either earns or loses the bar.

### Error (NOT captured — code review only)
- `ErrorState` with named recovery actions exists (`ContentTabs.tsx:864-871`) — copy is on-brand
  ("Select another page" / "Try again"). Visual finish unverified.

### Mobile-375 (NOT captured)
- The 880px column + full-width slab button + right-rail hero figure all need a 375px check.
  Not audited. Likely the hero figure (64px mono in a right rail) and the picker rows' stats rail
  are the responsive risks. Must be screenshotted.
