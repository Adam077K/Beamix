# Beamix Homepage Design Audit
*File: pencil/pencil-new.pen — audited 2026-03-13*

## Status
Design exists but has 50 issues. Critical + Major must be fixed before handoff.

## Critical (fix first)
1. Missing Beamix logo icon inside "Scan Now" button (hero + transition input)
2. Missing "Scan in Progress" state (Section 4.4 Step 1 — entirely absent)
3. "They never see your name." fill = #023C65 (wrong — should be #000000/#141310)
4. Marquee row scroll directions swapped (Row 1 should be right→left, Row 2 left→right)
5. MS Copilot card in integrations marquee — must be removed (deferred, no API)

## Major (fix next)
6. AI logo square fill = #9E9E9E gray (should be #023c65 navy, represents cycling AI logos)
7. URL input too wide — 520px (spec: ~60-65% of 720px headline = ~450px)
8. Right trust column only 200px wide (spec: ~30% of 1440 = ~432px)
9. Video section bg is plain gray — needs label "Background Image — atmospheric (supplied)"
10. Quote section (S6) bg is flat color — needs gradient label or proper gradient fill
11. Grain texture overlay missing from Section 6
12. Integrations marquee only 16 cards — spec requires ~20

## Minor / Polish
- Nav links slightly left of center; gaps too tight (24px → 32-40px)
- "Log In" has no ghost button styling
- Sub-headline → URL input gap 18px (spec: 24-32px)
- Transition header missing lineHeight:57
- FAQ only 80px below pricing cards (needs 120-160px)
- Footer "BEAMIX" display text x=-40 (should be x=0)
- No scroll-pin annotations anywhere
- No mobile artboards
- No hover state annotations

## What's Working
- All 9 sections exist and are positioned
- Nav structure correct (logo, links, CTA)
- Hero headline 3-line structure correct
- ChatGPT mock UI (S4.2 and S5.7) — dark bg, responses, highlight row
- Problem sentences below ChatGPT
- 3 alternating dashboard panels
- 3×3 agent grid with navy stat cards (16 Agents, 7 AI Engines, +340%)
- 16 agent cards feed
- Pricing 3-card layout with Most Popular badge and navy border on Pro
- Correct prices: $49/$39, $149/$119, $349/$279
- FAQ accordion structure
- Quote section navy bg + white quote text
- Footer with BEAMIX display type cropped at bottom

## Next Session Instructions
1. Open `pencil/pencil-new.pen` in Pencil MCP
2. Deploy design-lead agent to fix Critical issues first (5 fixes)
3. Then fix Major issues (7 fixes)
4. Take section screenshots after each fix batch to verify
5. Final full-page screenshot when all done
