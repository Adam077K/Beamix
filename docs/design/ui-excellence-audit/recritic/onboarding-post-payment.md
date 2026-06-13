# Re-critic — /onboarding-post-payment

**Verdict: PASS** (richness gap ~1, only capture-hygiene findings)
**Date:** 2026-06-12 · Graded against competitor refs (Profound, Otterly) + CRAFT-SYSTEM 8 tells / 12 moves
**Captured states:** populated-desktop (60% "scanning"), populated-mobile (85% "analyzing")

## What's strong
- **TIER-1 focal is unambiguous (M1/M2/M10):** the 60% / 85% Geist Mono figure dominates in blue, one focal per screen, gaps between the 4 type steps are obvious (12px violet eyebrow → 64px mono figure → InterDisplay verdict → 13–15px body). No evenly-weighted-type tell.
- **Earned asymmetry (M3):** dominant white progress card + narrower violet agent rail on desktop — not an N-equal grid. Sits like the Profound/Otterly split-pane onboarding bar as one hand.
- **The signature law is spatial (M6, tell #8 killed):** progress/score side is blue (you); the "THE CREW, ALREADY AT WORK" panel is violet-tint ground + 1px violet hairline + violet eyebrow (agents). Glanceable at arm's length. Violet never on a button (correct — this is an auto-updating page with no CTA).
- **Felt depth (M1, tell #1 killed):** white hero card recedes to the tinted agent panel and the engine pills; not uniform `.card-console`.
- **Mono truth (M11):** 60%, 85%, 0/3, 2/3 all Geist Mono tabular.
- **Designed processing state (M8):** real two-tier content (progress + live agent preview with skeleton → real FAQ "drafted by the crew" card) + reassurance line "This page updates automatically — you don't need to do anything. Your payment is confirmed." Not a bare spinner.
- **Mobile:** clean stack, no horizontal scroll, hierarchy preserved, agent FAQ pill in violet tint.

## Remaining findings (P2 — capture hygiene, not craft failures)
1. **Stray Next.js dev "N" badge in frame.** A dark circular "N" sits bottom-left on desktop and overlaps the agent card on mobile. This is the `next dev` dev-tools indicator, not part of the page — it will not appear in prod, but it pollutes the audit frame and overlaps content on mobile. Re-capture against prod or with the dev indicator disabled (`devIndicators` off) so the final frame is clean.
2. **Fraunces beat (M5) not visible in the two captured frames.** The serif beat IS implemented — `_post-payment-scan.tsx` L23/L371-380 puts one Fraunces italic word ("Ready.") on the *complete* state. The two captured mid-flow frames (60%/85%) are pre-complete, so the one-serif-beat move doesn't show. Add a capture of the 100%/complete state (and the empty/error state if reachable) so the audit set proves the beat + the full state matrix. Not a build defect.

## Net
Genuinely excellent. No AI tell dominates; one TIER-1 focal, earned asymmetry, felt depth, mono numbers, spatial blue/violet, designed loading state. The only gaps are capture-side (dev badge in frame, complete-state frame missing) — the build itself meets the bar. PASS.
