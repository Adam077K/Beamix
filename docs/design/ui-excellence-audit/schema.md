---
page: /schema (Schema Generator — Console Spine surface #3)
route: /schema
states_audited:
  - populated-desktop.png  (NOTE: file is named "populated" but actually renders the IDLE/empty state — hero shows "17 RUNS LEFT TODAY", input expanded, no JSON-LD output. No empty-only, no mobile, no running, no success/populated, no error captures exist.)
competitor_refs_used:
  - Profound-Screenshot 2026-06-12 at 10.38.57 AM.png  (Nike Answer Engine Insights — Visibility Score hero figure 72.9% +0.7% + trend line + ranked asset table)
  - Profound-Screenshot 2026-06-12 at 10.37.47 AM.png  (Profound onboarding — asymmetric editorial verdict + ranked list panel)
verdict: NEEDS_WORK
---

# schema — UI Excellence Audit

## Screenshots
- [populated-desktop.png](screenshots/schema/populated-desktop.png) — the ONLY capture. It is the idle state, not a populated/success state.

## Verdict
**NEEDS_WORK.** The structural bones are correct and on-system — clean asymmetric Zone 1 (1fr hero + rail), a real two-segment "Run it myself / Let Beamix handle it" pill that honors the violet law (tint+ring, never a solid violet button), tokenized type, blue-only CTA. It does NOT read as broken or as cheap AI slop. But against the Profound bar it reads **unfinished and under-confident**: the hero number is a quota counter ("17 RUNS LEFT TODAY") not a meaningful signal, the signature sparkline is invisible, the same cap is stated twice with conflicting framing, and the bottom 40% of the viewport is dead whitespace because the designed EmptyState is shoved below the fold. There is no Fraunces beat anywhere. This is a polish gap, not a redesign — but it is meaningfully short of the competitor bar.

> Coverage caveat: only ONE state was captured, and it is mislabeled. I could not audit the success (JsonLdPreview hero), running (PipelineLedger), error, or mobile states. A real PASS verdict requires those captures. Findings below are scoped to what is visible plus what the source confirms about the unseen states.

## P1 — must fix (looks AI / broken)

1. **The hero figure is a quota counter, not a signal — and it is duplicated.** The 64px Geist Mono STEP-1 figure renders **"17 / RUNS LEFT TODAY"** (page.tsx:285-289, ContextStat.tsx:35-40). Directly below the input the SAME quota is restated as "3 of 20 schema runs used today · resets at midnight" (page.tsx:374-377). So the one hero number on the screen is (a) about *rate-limit budget*, not about the user's *result/value*, and (b) said twice with two different framings (17-remaining vs 3-used). Profound's hero number is the *outcome* — "72.9% +0.7%" Visibility Score with a real trend. Beamix's most prominent number being "runs left in your quota" is the canonical "told, not felt" hierarchy tell (tell #3 / M10): the eye lands on the least important fact. **Fix (M10/M2):** in the idle state the hero should be the standing validity signal (e.g. "9/9 VALID" from the last run, or the page's structured-data coverage), with the quota demoted to the single cap line under the input. Never let "RUNS LEFT TODAY" be the one STEP-1 figure on the screen, and never state the cap twice. page.tsx:284-289, 374-377.

2. **The signature detail (M4 micro-sparkline) is invisible — the hero rail reads as a bare number floating in space.** ContextStat always renders `EngineMicroSparkline` (ContextStat.tsx:42-47), but in idle `currentValidityScore = null` (page.tsx:282), so the component renders a **flat 1px #E5E7EB line** (EngineMicroSparkline.tsx:40-59). On screen this is indistinguishable from nothing — the "17" sits alone with a sliver of grey. The one piece of signature craft that's supposed to make this surface feel designed (tell #4) is doing no visible work. **Fix (M4):** when validity history exists (`DEMO_SCHEMA.validityHistory` is passed in, page.tsx:281), feed a non-null `currentScore` so the sparkline actually draws in its band color even in idle — the prior runs' validity trend is real data and should show. If genuinely null, the bare number needs a different anchor so the rail doesn't read as a placeholder.

3. **The bottom ~40% of the viewport is dead whitespace; the designed EmptyState is pushed below the fold.** In idle, `effectiveState` resolves to `'empty'` (page.tsx:518-519) and a real, two-tier EmptyState ("Pick a page and a type" + "Generate Dentist Schema" primary + "Browse schema.org types" secondary + the code-bracket glyph, page.tsx:435-504) IS rendered in Zone 5 — but it sits 40px (`mt-10`, ToolPage.tsx:143) below the run control, so at 1440×900 the screen ends on the "Generate Schema" button with a huge empty gap and only a faint pill edge of the empty-state glyph peeking at the very bottom. The result reads as a half-built page. This is the dead-space / unfinished tell. **Fix (M10/M1):** the idle state should not show BOTH a full expanded input+run AND a separate below-fold empty card — that is two competing "start here" zones. Either (a) fold the empty-state guidance into the input panel's resting state so the first screen is one coherent focal, or (b) suppress the standalone EmptyState when the input is already expanded and primed (the input IS the empty state here). Right now the user sees an input, a button, then nothing, then a second CTA they have to scroll to find.

## P2 — substantive

4. **No Fraunces serif beat anywhere (tell #6 / M5).** The screen is 100% Inter/InterDisplay/Geist Mono. The rubric mandates exactly one Fraunces italic beat per screen on a verdict word. The natural home here is the success-state validity verdict (e.g. "9/9 valid" → the word "valid" in Fraunces italic) inside JsonLdPreview, or a verdict word in the empty-state copy. Confirm it lands in the unseen success state; it is absent from everything visible. (JsonLdPreview.tsx not yet using Fraunces — verify.)

5. **Run control reads as two disconnected rows, not one "who runs this → go" unit.** Visually there is the mode pill ("Run it myself / Let Beamix handle it") and then, separated by a gap, a full-width blue "Generate Schema" button (RunControl.tsx:48-98). The intent (CONSOLE-SPINE §A Zone 3) is one spatial unit, but on screen the pill looks like an orphaned segmented control floating above an unrelated full-width CTA — there's no enclosure, shared ground, or connective tissue tying "I will run it myself" to the button. **Fix (M1/M12):** give Zone 3 a faint shared ground or tighten the rhythm (the 16px `gap-4` between toggle and button is the same as unrelated spacing elsewhere, violating M12's "tight within a cluster"). The Profound refs group the control + its consequence visibly.

6. **The empty-state glyph is a centered icon-in-a-rounded-square (tell #5 risk).** page.tsx:441-478 renders a 56px `#EFF4FF` rounded square with a centered code-bracket SVG, and the EmptyState centers title/description/actions under it. This is exactly the "bare centered icon-in-circle empty" pattern the rubric flags (tell #5), softened only by the two-tier CTA. Since this empty card is also redundant with the input (finding #3), the cleanest fix is to remove it; if kept, it needs left-alignment / asymmetry to escape the dead-center template look.

7. **Quota framing is inconsistent across the surface.** Hero says "17 RUNS LEFT TODAY", input cap line says "3 of 20 used", RunControl allotment says "17 runs left today" (page.tsx:388, 289, 376). Three phrasings of the same fact in three places. Pick one canonical phrasing and one location (M12 — say each true thing once).

## P3 — nice-to-have

8. **Input panel field hierarchy is flat.** "Page URL" (1fr) and "Schema type" (200px) are correctly asymmetric (page.tsx:305), but both labels are identical 13px medium ink (page.tsx:308-312, 329-333) and the two inputs read at equal weight — there's no sense that the URL is the primary input. Minor weight/size differentiation would help the eye land on the URL first.

9. **"Generate Schema" button is full-bleed across the 880px column.** A full-width primary CTA on a document-width form is a slightly template-y move; a left-anchored intrinsic-width button (matching the asymmetry of the rest of the page) would feel more intentional and less "form builder default."

10. **Entrance choreography unverifiable from a static shot.** `craft-enter` stagger classes are present (ToolPage.tsx:82,111,126,143,158) — confirm via a running capture that they fire ≤200ms with `prefers-reduced-motion` fallback (M9). Cannot validate from one still.

## Per-state notes
- **Populated/desktop (the only capture):** Actually the **idle** state. Reads clean and on-brand but under-confident and bottom-heavy with dead space (findings #1, #2, #3). Violet law respected (ModeToggle.tsx:75-80 — tint+inset-ring, never solid). Blue is the only CTA color. Type tokens correct.
- **Empty:** Rendered but shoved below fold (finding #3) — effectively invisible at first paint. The standalone empty card is also redundant with the expanded input.
- **Success / populated (JsonLdPreview):** NOT CAPTURED. This is the TIER-1 hero zone (`card-console-hero`, ToolPage.tsx:146) and the most important state to audit — it is the actual "result." Verdict cannot be PASS without it. Verify the Fraunces beat (M5) and that the validity score + sparkline come alive here.
- **Running (PipelineLedger):** NOT CAPTURED. The 3-stage plan→generate→validate live ledger (page.tsx:403-411) is unseen.
- **Error (cap-exhausted + run-fail):** NOT CAPTURED. Source has named, recoverable errors (page.tsx:97-114) which is correct per M8 — but unverified visually.
- **Mobile (375px):** NOT CAPTURED. The `sm:grid-cols-[1fr_200px]` input (page.tsx:305) and the Zone 1 `flex justify-between` hero+rail (ToolPage.tsx:83) need a mobile check — the 64px hero figure beside a flexed title could crowd or wrap badly under 640px.
