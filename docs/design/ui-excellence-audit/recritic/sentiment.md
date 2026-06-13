# Re-critic — /sentiment (PASS gate)

**Verdict: NEEDS_WORK** (close to PASS; two concrete remaining issues, neither a tell)

Graded the polished `populated-desktop.png` against the competitor bar (Profound Answer-Engine Insights, Otterly) and the 8 tells / 12 moves in CRAFT-SYSTEM.md.

## What's strong (preserve)
- **One TIER-1 focal, felt depth (M1/M10).** The white "Brand Integrity" hero card with the `86/100` figure clearly commands; the left "Engines/Timeframe/Themes" rail is a recessed `.card-inset`, and the "Tone of Voice" panel recedes inside the hero. Three felt tiers, not uniform — no tell #1.
- **Earned asymmetry (M3).** Dominant content column + narrower left filter rail; quotes column wider than the stacked stat cards. No N-equal grid — no tell #2.
- **Stepped type contract (M2).** 64px-class mono score → 30px display verdict ("Across AI answers your brand reads Trusted —") → 12px uppercase eyebrows (ENGINES / THEMES / TONE OF VOICE / HOW THE ENGINES DESCRIBE YOU) → 13–15px body. Gaps are obvious — no tell #3.
- **One Fraunces beat (M5).** "*Trusted*" set in italic serif inside the sans verdict sentence, on the verdict word only, nowhere in chrome. Exactly one — no tell #6.
- **Mono for truth (M11).** 86, /100, 72/19/9%, mention counts (21/38/11) read tabular mono; prose is Inter.
- **Status discipline.** NEGATIVE/POSITIVE/NEUTRAL pills are tinted-ground + saturated-text, never loud fills. Tone-of-voice bar is a signature data detail. Sits beside Profound/Otterly as one hand.
- **Violet law respected.** Sentiment is a user/data surface → neutral/white is correct; no violet on a button.

## Remaining findings

### remaining_p2
1. **Score-band color mismatch (correctness, M4/score colors).** `86` renders in **green** (`#10B981`, the Good 50–74 band). Per the locked score palette, 75–100 = **Excellent = cyan `#06B6D4`**. The hero figure, its `/100`, and any band-derived accent must switch to cyan so the headline number is truthful. This is the single most concrete fix. File: the sentiment Brand-Integrity hero score component — map score→band via the shared score-color util, don't hardcode green.
2. **Per-engine micro-sparkline (M4) not evident.** The left "Engines" rail lists ChatGPT/Gemini/Perplexity/Claude/AI Overviews as colored dots + labels only. The signature 24px ~64px polyline (last ~5 points in band color, flat hairline baseline when null) is the rubric's signature detail and is absent here. Add the micro-sparkline per engine row (or a justified single trend on the hero) so the screen carries its signature data move, not just dots.

### Capture gaps (not page failures, but block a clean PASS sign-off)
- **No `empty-desktop` capture.** M8 (two-tier designed empty) cannot be verified for /sentiment — re-capture the no-mentions/empty state.
- **No `populated-mobile` capture.** Single-column collapse, 44px targets, no horizontal scroll at 375px unverified. Re-capture mobile.

## Why not PASS
The composition, depth, type contract, serif beat, and status discipline all clear the bar — this is genuinely close. It is held at NEEDS_WORK by (a) the truthfulness bug of an Excellent-range score painted in the Good-range green, (b) the missing signature micro-sparkline, and (c) two un-captured states (empty + mobile) that the gate requires before sign-off. Fix the band color, add the sparkline, capture the two missing states, and this is a PASS.
