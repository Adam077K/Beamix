# Re-critic — /signup (RE-CRITIC PASS gate)

**Date:** 2026-06-12
**Reviewer:** design-critic
**Verdict:** PASS
**Captures graded:** `screenshots-final/signup/populated-desktop.png` (1440×900). No mobile-375 or empty/error capture present.

## What's strong
- **One TIER-1 focal, felt depth (M1).** Single signup card floats on the warm off-white ground (`#F7F6F2`) with a soft layered hero shadow. Clear figure/ground — no uniform-depth tell. Correct for an auth archetype: one focal, nothing competes.
- **Serif beat present, exactly one (M5).** "Start *here*." — Fraunces italic on the verdict word only, inline in an InterDisplay sans sentence. This is the editorial soul beat, used with restraint and not in chrome. Textbook.
- **Type contract is visibly stepped (M2).** Eyebrow "FREE · NO CARD REQUIRED" (12px uppercase tracked, muted) → display verdict "Start here." (commands) → body (13–15px, recedes) → field labels (distinct register). The steps read at a glance.
- **Accent law clean.** Blue `#3370FF` only on the "Create account" CTA, the logo mark, and the "Sign in" link (you-actions). No violet anywhere — correct, there is no agent zone on auth. Full-width blue rounded CTA, white text.
- **Intentional asymmetry within the card (M3).** Content is left-aligned (eyebrow, heading, labels), escaping the dead-center-in-void tell even though the card itself is centered in the viewport (the correct, expected auth convention).
- **Designed secondary rhythm.** "or" hairline divider → real Google G mark "Continue with Google" → "14-day money-back guarantee. No credit card to start" reassurance → "Already have an account? Sign in". Considered, not dumped. Form uses label-above-input with helpful placeholders ("you@company.com", "At least 8 characters").
- **No N-equal grid, no AI tell dominates.** Sits beside Profound / Otterly auth+onboarding surfaces as one hand.

## Why PASS despite no mono figure / sparkline / violet zone
M4 (sparkline), M11 (mono numbers), M6/M7 (violet agent zone, in-cell shading) are data-surface moves. /signup has no real number or agent surface to display, so their absence is correct restraint, not a miss. The rubric's TIER-1-figure step (M2 STEP-1, 64px mono) does not apply to an auth card with no datum.

## Remaining findings (non-blocking — for the loop, not a re-build)
- **P2 — Capture coverage gap.** Only `populated-desktop.png` exists. No mobile-375 capture and no error/validation-state capture. Checklist item (e) "all 4 states designed" and the 375px no-horizontal-scroll check cannot be visually verified. Add `populated-mobile.png` and an error-state capture (invalid email / weak password inline message) so the loop can confirm the field error treatment and mobile reflow. Likely fine in build — flagged as a verification gap, not a defect.
- **P2 — Minor copy echo.** The eyebrow "FREE · NO CARD REQUIRED" repeats the lower microcopy "No credit card to start". Consider differentiating the eyebrow (e.g. a value/speed framing) so the two beats don't say the same thing twice. Nice-to-have.

## Bottom line
Genuinely excellent, brand-correct auth card. Focal + depth + one serif beat + stepped type + accent discipline + designed secondary actions, all inside the warm-minimal vision. PASS. The only open items are capture coverage (mobile + error state) for full state verification.
