# Re-critic — /login (PASS gate)

**Date:** 2026-06-12
**Verdict:** PASS
**States captured:** populated-desktop only (mobile + empty/error not captured this round)

## Render graded
`docs/design/ui-excellence-audit/screenshots-final/login/populated-desktop.png`

## What's strong (preserve)
- **One TIER-1 focal, felt depth (M1).** Single elevated card on warm `#F7F6F2` field. No competing hero. Depth is felt, not told — the card reads as the focal at arm's length.
- **Fraunces beat present and tasteful (M5).** "Sign *in.*" — Fraunces italic on the one verdict word, inline in a sans sentence, never in chrome. Exactly one serif beat. This is the soul move done right.
- **Type contract stepped (M2).** Eyebrow "WELCOME BACK" (12px tracked muted) → 30px InterDisplay display headline → 13–15px body/labels. Steps are obvious. The 64px mono hero figure is correctly N/A for auth (no hero number).
- **Accent discipline (signature law).** `#3370FF` only on the primary "Sign in" button and the "Create an account" link. No violet anywhere on a button or link. Blue=you is honored.
- **Designed, not bare (M8-adjacent).** Two-tier path (primary Sign in → Google → create account), trust microcopy ("Encrypted connection. We never post or email on your behalf."), warm footer tagline. The card is considered in every corner — no dead zones.
- **Warm surface, not grey-on-grey.** `#F7F6F2` ground avoids the AI grey-wash.

## Against the 8 tells
1. Uniform depth — ABSENT (one clear focal card vs warm field).
2. N-equal grid — N/A / ABSENT (single-column auth form, correct).
3. Evenly-weighted type — ABSENT (eyebrow/headline/body/label clearly stepped).
4. Zero signature detail — ABSENT (Fraunces "in" beat + sparkle wordmark).
5. Dead-center-in-void — NOT a tell here. Centered card is the *conventional, premium* auth pattern (Linear/Vercel/Stripe). Acceptable for this screen type.
6. Serif beat absent — ABSENT (present on "in").
7. Flat motion — cannot confirm choreography from a still; transitions-only is the spec and nothing looks broken.
8. Blue/violet not spatial — N/A for auth (no agent zone); accent used correctly.

## Remaining findings (P2 — non-blocking)
- **Verify the bottom-left "N" circle is not in the production render.** It appears to be a Next.js dev-mode / build-activity indicator, not a designed element. If it shows in prod it's a CRITICAL bug; in dev it's harmless. Flag for the prod capture.
- **Coverage gap:** only populated-desktop was captured. Mobile-375 and the error state (bad credentials) were not screenshotted this round. PASS is granted on the desktop render; recommend a mobile + error capture before final sign-off so the designed-states requirement is fully evidenced.
- **Optional polish:** a faint dotted/grid texture behind the card (cf. Profound's welcome screen) or a slight upward vertical bias would add intentionality to the large void above/below — nice-to-have, not required.

## Bottom line
This sits beside Profound/Otterly as one confident hand. It reads designed, not AI-generated. No AI tell dominates, no brand-law violation, one focal, one serif beat, accent discipline intact. **PASS.**
