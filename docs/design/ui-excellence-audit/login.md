---
page: /login
route: /login
states_audited:
  - populated-desktop.png   # the ONLY state captured
states_missing:
  - empty-desktop (idle / no input)
  - error (invalid creds card-level alert)
  - submitting (Dots loader on CTA)
  - mobile-375
competitor_refs:
  - Profound-Screenshot 2026-06-12 at 10.36.25 AM.png  (loading state, dotted-grid texture bg)
  - Profound-Screenshot 2026-06-12 at 10.36.28 AM.png  (loading state, dotted-grid texture bg)
  - otterly-Screenshot 2026-06-12 at 10.42.49 AM.png    (onboarding form, left-aligned)
verdict: NEEDS_WORK
---

# login — UI Excellence Audit

## Screenshots
- [populated-desktop.png](screenshots/login/populated-desktop.png)

> Only ONE state was captured (`populated-desktop.png`). No empty, error, submitting, or
> mobile screenshots exist for this route. The auth surface has four functional states in
> `LoginForm.tsx` (idle / submitting / error + the field-error sub-states) and a responsive
> layout — **none of which were rendered**. This audit is therefore partial; see finding P1-1.

## Verdict
**NEEDS_WORK.** This is one of the stronger surfaces in the product — it correctly lands the
warm-minimal soul: the single Fraunces italic beat ("Sign *in.*"), a real depth-staged hero card
(`card-console-hero`, three-layer shadow over a 135° white→warm gradient), the 12px uppercase
eyebrow, the blue-only CTA, and a properly designed Google fallback. It is NOT AI-slop and it is
NOT a template clone. But against the Profound bar it is missing the *signature texture* the
competitor uses to make a near-empty auth/loading canvas feel intentional rather than blank, the
serif beat has a punctuation bug, the wordmark is bare text where the competitor carries a mark,
and — most importantly — three of its four states were never verified visually. It is a polish
pass and a screenshot pass away from PASS, not a redesign.

---

## P1 — must fix (looks AI / broken)

### P1-1 — Three of four states are unverified; only `populated-desktop` exists
**Problem.** The capture set contains a single PNG. The error alert (`LoginForm.tsx:91-99`,
`#FDECEC` ground / `#DC2626` text), the submitting state (the `<Dots/>` mono loader,
`LoginForm.tsx:162` + `auth-ui.tsx`), the field-level validation errors
(`LoginForm.tsx:117-121, 147-151`), and the entire 375px mobile layout were never rendered.
**Why it reads broken vs the ref.** Profound's whole reference set is *states* — its two
captured shots ARE loading states, treated as first-class designed moments. We graded a form
without seeing it do anything. The rubric's design-critic checklist item (e) ("all 4 states
designed with two-tier recovery") cannot be passed on this evidence.
**Fix.** Re-run the capture harness for: idle/empty, a forced card-level error, the submitting
`<Dots/>` state, a field-error state, and `375px` mobile. Then re-audit. This is the gating fix.

### P1-2 — Verify the rendered "Sign in" button radius isn't violating the product button law
**Problem.** In the render the primary CTA reads as a near-pill, noticeably more rounded than the
8px `rounded-lg` the product law mandates (pill is marketing-only per BRAND_GUIDELINES). The
`Button` default is `rounded-lg` (`button.tsx:7`), so either the screenshot is misleading at this
scale or a `className` override is pill-ing it.
**Why it matters vs the ref.** Stripe/Linear product auth uses a tight product radius; a pill here
would silently import the marketing button shape into the app and break "one hand" with the #173
dashboard exemplar (M-consistency). BRAND_GUIDELINES: pill is marketing-only; any deviation is a
design-critic BLOCK.
**Fix.** Confirm the rendered radius is 8px. If a pill override exists on the CTA, remove it; the
`Sign in`, `Continue with Google`, and both `Input`s must all share the `rounded-lg` token so the
corner language is uniform (it is not, visually, in this render — the inputs read tighter than the
button). File: `LoginForm.tsx:156-163` + `button.tsx:7`.

---

## P2 — substantive

### P2-1 — The Fraunces beat includes the period inside the italic — punctuation bug
**Problem.** `LoginForm.tsx:74` renders `Sign <em ...italic>in.</em>` — the trailing period is
*inside* the `<em>`, so the full stop is set in italic Fraunces. In the render the period sits at
an italic slant, detached, reading like a typo rather than a deliberate editorial beat.
**Why it reads off vs the ref/rubric.** M5 says the serif beat is "Fraunces italic on the verdict
**word** only." The word is "in"; the period is chrome and should stay upright in the sans. An
italic period is exactly the kind of small imprecision that separates "crafted" from "almost."
**Fix.** Move the period outside the em: `Sign <em ...>in</em>.` (matching the AuthCard JSDoc
example at `AuthCard.tsx:9`, which already shows the period outside). One-character change.

### P2-2 — Bare text wordmark where the competitor carries a brand mark
**Problem.** The layout header is plain text "Beamix" in InterDisplay (`layout.tsx:9-14`). The
Profound refs anchor every canvas — even the empty loading screen — with their pinwheel logo
**mark**, which is what makes a sparse page feel branded rather than unfinished.
**Why it reads thinner vs the ref.** On a near-empty auth canvas the wordmark is the only brand
signal above the card; flat text alone reads like a placeholder. This is tell #4 (zero signature
detail) at the page-chrome level.
**Fix.** Add the Beamix logo mark beside or above the wordmark (the same mark used in the
nav/favicon), sized ~24-28px, blue `#3370FF`. Keep it quiet and centered — this is the one
signature touch the chrome is missing. File: `layout.tsx:8-15`.

### P2-3 — Flat warm canvas vs the competitor's intentional texture
**Problem.** The page background is a single flat `bg-surface-warm` fill (`layout.tsx:5`). Both
Profound refs put a subtle dotted-grid texture across the entire canvas, which makes the large
empty margins read as a *designed surface* rather than dead space.
**Why it reads thinner vs the ref.** The Beamix render has very large empty top/bottom margins
(the card occupies the vertical center band only); flat-fill empty space is precisely what reads
"unfinished." Profound solves the identical layout problem with texture.
**Fix.** Add a very low-contrast background treatment behind the card — a faint dot/grid or a
single soft `--color-wash-sky` radial bloom behind the card (washes are background-only, which is
legal). Keep it under ~4% contrast so it never competes with the form. Do NOT add violet here —
this is a you-surface (auth), so any wash stays blue/neutral per the blue=you law. File:
`layout.tsx:5`.

### P2-4 — Entrance choreography (M9) appears absent
**Problem.** No fade-up entrance is wired on the card/wordmark/footer (no animation classes in
`layout.tsx` or `AuthCard.tsx`; only the in-button `scan-dot` loop exists). The page hard-cuts in.
**Why it matters vs the rubric.** M9 calls for surfaces to fade-up 8px in priority order (~40ms
stagger, ≤200ms ease-out) behind `prefers-reduced-motion`. Tell #7 is flat/absent motion. The
shipped dashboard exemplar has this; the auth screen should match for "one hand."
**Fix.** Add the shared fade-up keyframe to the card (and a 40ms-later wordmark/footer) gated on
`prefers-reduced-motion`. Single, restrained, transitions-only — consistent with the minimal-motion
law. (Could not be *confirmed* from a static screenshot — verify during the P1-1 re-capture.)

---

## P3 — nice-to-have

### P3-1 — "or" divider sits slightly low / mono-vs-sans is fine but tighten rhythm
The `my-5` divider (`LoginForm.tsx:166`) and the `mt-6`/`mt-8` rhythm are on-grid but the divider
crowds the CTA. Consider `my-6` to let the primary action breathe before the secondary path (M12
hairline rhythm — wider gap between *relationship-different* clusters).

### P3-2 — Google button icon is the only color besides blue
The multi-color Google "G" (`LoginForm.tsx:198-213`) is the single non-palette color on the page.
It's the sanctioned exception (brand requirement), so leave it — just confirm it doesn't visually
out-weigh the blue CTA at a glance. It currently reads fine.

### P3-3 — Subheading copy "Your AI search crew is standing by" — confirm voice canon
"crew" is warm and on-voice (Model B allows agents named in product). No change needed; flagged only
so the copy owner confirms it matches the seeded "— Beamix" voice and isn't drifting toward the
retired "your crew" sign-off.

### P3-4 — Footer wordmark line is very low-contrast
`#9CA3AF` on `surface-warm` at 12px (`layout.tsx:21-23`) is legible but near the AA floor for
small text. Confirm contrast ≥ 4.5:1; if it fails, nudge to `#6B7280`.

---

## Per-state notes

**populated-desktop (the only captured state).** Strong. Correct depth-staging (single TIER-1
hero card, three-layer shadow, white→warm gradient), correct eyebrow type contract, Fraunces beat
present (with the P2-1 period bug), blue-only CTA, designed Google fallback, on-grid spacing. The
centered single card is the *correct* composition for an auth screen — the rubric's "dead-center
symmetry" tell (#5) and the M3 asymmetry move are intentionally relaxed for auth, where a centered
card is the Stripe/Linear/Anthropic convention. So do NOT force asymmetry here. Gaps are: bare
wordmark (P2-2), flat untextured canvas with large dead margins (P2-3), unverified motion (P2-4),
and the period bug (P2-1).

**empty / idle — NOT CAPTURED.** Need the no-input resting state to confirm placeholder contrast
and that the form doesn't show premature errors.

**error — NOT CAPTURED.** The card-level alert (`#FDECEC`/`#DC2626`) and field errors exist in
code (`LoginForm.tsx:91-99, 117-121`) and the copy names a recovery, but neither was rendered. M8
requires errors to "name a real recovery action" — verify visually.

**submitting — NOT CAPTURED.** The `<Dots/>` mono loader on the CTA (`auth-ui.tsx`) is unverified;
confirm it doesn't shift button height or color, and that disabled inputs read correctly.

**mobile-375 — NOT CAPTURED.** The card is `max-w-[400px]` with `px-6` page padding
(`layout.tsx:5-6`), so it should collapse cleanly, but the `justify-between` Password/Forgot row
(`LoginForm.tsx:126`) and the OAuth button text need a 375px check for wrap/overflow.
