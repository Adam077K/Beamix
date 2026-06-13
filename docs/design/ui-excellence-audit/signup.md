---
page: /signup
route: /signup  (file: apps/web/src/app/(auth)/signup/page.tsx → components/auth/SignupForm.tsx + AuthCard.tsx + app/(auth)/layout.tsx)
states_audited:
  - populated-desktop.png  (the only state captured)
states_missing:
  - empty-desktop (idle form before any state — effectively same as populated here)
  - field-error (validateEmail/validatePassword inline errors)
  - card-error (cardError alert block)
  - submitting (Dots loader in the CTA)
  - success ("You're in." check-circle state — SignupForm.tsx:70-105)
  - mobile-375
competitor_refs_used:
  - competitor/Profound-Screenshot 2026-06-12 at 10.36.25 AM.png  (Profound "Checking growth" loading — dotted-grid canvas, centered logo + bold sans)
  - competitor/Profound-Screenshot 2026-06-12 at 10.36.28 AM.png  (Profound "Evaluating potential" loading — same system)
verdict: NEEDS_WORK
---

# signup — UI Excellence Audit

## Screenshots
- [populated-desktop.png](./screenshots/signup/populated-desktop.png)

Only ONE state screenshot exists for this page (`populated-desktop.png`). No empty, field-error,
card-error, submitting, success, or mobile capture was provided. The success state, error block,
inline field errors, and the `Dots` submitting loader are all implemented in source
(`SignupForm.tsx:70-105`, `:130-138`, `:156-160`, `:193`) but were NOT rendered for this audit, so
their craft cannot be visually verified. This is a coverage gap, not necessarily a defect — flagged
in Per-state notes.

## Verdict
**NEEDS_WORK.** This is one of the stronger surfaces in the product: it is genuinely warm-minimal,
the single Fraunces beat ("Start *here.*") is correctly placed on the verdict word, the eyebrow →
heading → subheading → form rhythm is intentional, accent discipline is clean (one blue CTA, one
blue link), and there is no N-equal grid or violet-on-a-button violation. It does NOT read as
template-grade slop. But against the competitor bar it is too quiet and flat to feel finished: the
card is a single nearly-shadowless white plane floating in a near-identical warm-white field (almost
no figure/ground separation, tell #1), the page is dead-center symmetric with a huge cold empty
canvas above and below (tell #5), there is zero texture or signature detail where Profound carries a
full dotted-grid canvas (tell #4), the input fields render as faint hairline boxes that read as
disabled, and the two stacked full-width buttons (blue + outline) read as equal-weight (the primary
CTA does not command). It is ~1-2 craft rounds from PASS. No brand-law BLOCK.

## P1 — must fix (looks AI / broken)

### P1-1 — Card has no figure/ground separation: white card on warm-white page, near-invisible edge (tell #1, M1)
The card background is `linear-gradient(135deg, #FFFFFF → --color-surface-warm)` (AuthCard.tsx:46-48)
sitting on a `bg-surface-warm` page (layout.tsx:5). Card and page are nearly the same value, so the
card edge is barely perceptible and the whole composition reads flat — the opposite of M1 depth
staging ("one TIER-1 focal that clearly sits above the ground"). The class is `card-console-hero`
(AuthCard.tsx:45) which is supposed to carry the three-layer hero shadow, but in the render the
elevation is so faint the card looks painted onto the background rather than lifted off it. Profound's
loading screens get depth almost for free from the textured dotted canvas behind a crisp centered
mark; here there is no such contrast.
- **Why it reads AI/flat:** uniform depth — the one hero surface on the screen does not feel like a
  hero. A user at arm's length sees a grey rectangle on a grey page.
- **Fix (M1):** make the page ground and the card visibly different. Either (a) keep the card warm and
  cool the page to plain `#FFFFFF`/`#F7F7F7` so the warm card lifts, or (b) strengthen
  `card-console-hero`'s shadow on this surface and add a crisp `1px` border in `#E5E7EB` (the render
  shows the border is too light to register). The card must read as TIER-1 elevated.
- **Where:** `apps/web/src/components/auth/AuthCard.tsx:44-49` (card bg + class) and
  `apps/web/src/app/(auth)/layout.tsx:5` (page bg).

### P1-2 — Input fields read as disabled / placeholder-only (M1, contrast)
In the render both inputs are pale `#E5E7EB`-hairline boxes (input.tsx:12) on the near-white card,
filled only with `#9CA3AF` placeholder text. They sit so quietly that "Email" and "Password" look
pre-filled-and-locked rather than ready-to-type. There is no visible affordance (no inner shadow, no
fill contrast) telling the eye "this is an input." The competitor bar (and the shipped dashboard
exemplar) gives data-entry surfaces a clear, slightly-recessed material.
- **Why it reads unfinished:** the primary action of a signup page is typing into these two fields,
  and they are the lowest-contrast elements on the screen.
- **Fix (M1/M7-adjacent):** give inputs a faint inset/recede — e.g. background `#FFFFFF` on a card
  that is itself warm (so the field reads as a cut-in white well), or a `1px` slightly darker border
  (`#D1D5DB`) plus `shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]`. Verify the focus ring
  (`focus-visible:ring-[#3370FF]`, input.tsx:14) renders — it could not be confirmed (no focus
  screenshot).
- **Where:** `apps/web/src/components/ui/input.tsx:11-17`.

### P1-3 — Primary CTA and Google button render equal-weight; CTA does not command (tell #3, M2/M1)
`Create account` (blue, SignupForm.tsx:187-194) and `Continue with Google` (outline,
SignupForm.tsx:204-247) are both full-width, both the same height, stacked with only an "or" divider
between. In the render the eye does not land on the blue button first — the two read as a pair of
equal options. M2's type/weight contract wants ONE element to clearly command. Also the rendered
button height looks taller (~h-11) than the `h-9` default the code specifies (button.tsx:28) with no
`size` override passed — worth verifying the rendered proportion matches intent.
- **Why it reads AI/flat:** evenly-weighted hierarchy — "nothing commands, nothing recedes."
- **Fix (M1/M2):** make the primary CTA dominant — it can stay full-width but the Google option
  should recede (smaller, or a quieter ghost/text treatment, or de-emphasized below a clearer gap).
  Establish a clear primary→secondary step so the blue CTA is unambiguously the main path.
- **Where:** `apps/web/src/components/auth/SignupForm.tsx:187-247`.

## P2 — substantive

### P2-1 — Dead-center symmetry with vast cold empty canvas (tell #5)
The entire composition is a single centered `max-w-[400px]` column (layout.tsx:6) floating in the
exact middle of a 1440-wide viewport, with enormous empty warm-white margins left, right, above, and
below, and nothing in them. This is the canonical "AI auth screen." Profound's equivalent full-screen
moments fill the void with a textured dotted-grid canvas so the screen never reads as bare. Beamix's
auth canvas is inert.
- **Fix (tell #5 / signature):** add ONE restrained signature treatment to the page ground so the
  empty field is intentional, not abandoned — e.g. a very subtle dotted/grid wash or a single
  soft blue→violet radial bloom anchored off-center (the sanctioned `#3370FF → #6E56F0` gradient,
  background-only per brand law, washes never on text/buttons). Keep it whisper-quiet. This also
  doubles as the "blue=you / violet=agents" spatial cue (tell #8) at the front door.
- **Where:** `apps/web/src/app/(auth)/layout.tsx:5`.

### P2-2 — No signature detail anywhere (tell #4)
Nothing on this screen is something a generic Tailwind auth template wouldn't have: centered
wordmark, eyebrow, heading, two inputs, two buttons, a footer line. The lone bit of character is the
Fraunces "*here.*" — good, but it is the only thing carrying the brand. The dashboard exemplar earns
its soul from the engine micro-sparkline + violet structure; auth has no equivalent moment.
- **Fix (M4/signature):** the gradient bloom in P2-1 can be the signature, OR treat the wordmark with
  the actual Beamix logo mark (the blue pinwheel seen in the Profound-comparison refs is THEIR mark —
  do not copy it; use Beamix's own) so the front door has one memorable, branded element instead of a
  plain text wordmark.
- **Where:** `apps/web/src/app/(auth)/layout.tsx:8-15` (wordmark), page ground.

### P2-3 — Motion almost certainly absent (tell #7, M9)
No entrance choreography is present in source for the card (AuthCard.tsx has no fade-up;
SignupForm uses only the `scan-dot` keyframe on the submitting `Dots`, auth-ui.tsx:9). The card
appears instantly with no priority fade-up. M9 wants a single ≤200ms ease-up on first paint behind
`prefers-reduced-motion`. Cannot be verified from a static screenshot — flagged for confirmation.
- **Fix (M9):** one subtle fade-up-8px on the card at mount, reduced-motion-safe. Nothing looping.
- **Where:** `apps/web/src/components/auth/AuthCard.tsx:44`.

### P2-4 — Subheading line break reads awkwardly ("— in minutes." orphaned on line 2)
In the render the subheading wraps to "See exactly where AI search ranks your business / — in
minutes." leaving the em-dash fragment dangling on its own line. It reads slightly broken inside the
400px column.
- **Fix (M12):** tighten copy or apply `text-wrap: balance` / a non-breaking join so the dash clause
  doesn't orphan, or shorten to a single clean line.
- **Where:** `apps/web/src/components/auth/SignupForm.tsx:116`, rendered via AuthCard.tsx:65-69.

## P3 — nice-to-have

### P3-1 — Eyebrow "GET STARTED" + subheading slightly redundant
The eyebrow "Get started" (rendered uppercase) and the heading "Start here." both say the same thing
("start"). Minor copy doubling. Consider an eyebrow that adds info (e.g. "FREE — NO CARD") to earn
its line. (SignupForm.tsx:110, AuthCard.tsx:52-54.)

### P3-2 — "or" divider spacing is generous relative to field rhythm (M12)
`my-5` on the divider (SignupForm.tsx:197) vs `gap-5` field stack (SignupForm.tsx:140) vs `mt-6` CTA
(SignupForm.tsx:189) — the vertical rhythm is close but not deliberately stepped. A tighter
relationship-based rhythm (tight within the form cluster, wider between cluster and OAuth) would read
more composed. Currently it's near-uniform spacing.

### P3-3 — Footer wordmark line "Beamix — done-for-you AI search visibility." duplicates the top wordmark
The page shows "Beamix" at top (layout.tsx:9-14) and "Beamix — done-for-you…" at bottom
(layout.tsx:21-23). Two Beamix wordmarks bracketing a 400px card on a near-empty page slightly
over-states the brand for a utility screen. Consider dropping or de-duplicating.

## Per-state notes

**populated-desktop (only state captured):** Clean, warm-minimal, on-brand. The Fraunces beat,
eyebrow, accent discipline, and single-CTA intent are all correct. The gaps are depth (P1-1), input
affordance (P1-2), CTA dominance (P1-3), empty-canvas/signature (P2-1/P2-2), and the orphaned
subheading line (P2-4). Note the rendered button height appears taller than the `h-9` source default
(button.tsx:28) — verify intended proportion.

**empty/error/submitting/success — NOT captured.** All exist in source:
- Card-level error: red `#FDECEC` alert block (SignupForm.tsx:130-138) — on-brand status colors,
  good. Verify the doubled `border-[#FDECEC] bg-[#FDECEC]` (border same as fill) actually shows an
  edge; per brand the status pill wants tinted ground + saturated text, which it has.
- Inline field errors: `#DC2626` 13px (SignupForm.tsx:156-160, 178-182) — correct status color.
- Submitting: `Dots` mono loader in the CTA (SignupForm.tsx:193, auth-ui.tsx) — confirm it doesn't
  collapse the button height.
- Success: "You're *in.*" with a green check in `#E6F5EE` circle (SignupForm.tsx:70-105). This is a
  bare-centered-icon-in-circle pattern (tell #5 / M8 warns against bare centered glyph empties).
  It does have a context line + a "Continue to dashboard" link, so it is a two-tier-ish recovery, but
  it should be screenshotted and checked it doesn't read as a generic centered checkmark.

**mobile-375 — NOT captured.** The `max-w-[400px]` column with `px-6` (layout.tsx) should collapse
cleanly, but mobile must be captured to confirm no overflow and ≥44px tap targets on the two
full-width buttons.

## Note on competitor refs
Profound/Otterly are GEO competitors; their captured screens are loading/analytics moments, not a
signup page, so they set the *craft/texture/depth bar* (textured canvas, crisp centered mark, bold
confident sans) rather than a layout to match. Beamix's signup must reach that finished, intentional
feeling in its own warm-minimal language — do NOT copy Profound's dotted canvas or pinwheel mark
verbatim (that would be a derivative-clone failure).
