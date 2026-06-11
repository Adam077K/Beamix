# Reference contract — Weekly digest detail

- **Route:** `/digests/[digestId]`
- **Status:** WRITTEN-CONTRACT (craft baseline = dashboard exemplar + _product-feel; Refero images deferred)
- **Owner:** design-lead

## The feeling in one line

> A confident weekly briefing — the score movement is the headline, the work shipped reads like a curator's notes, calm and editorial.

---

## References

No images in this folder yet — Wave 0 scope is the written contract only. Refero expansion is deferred to Wave 1 (the digests screen build). The craft bar is grounded in the shipped dashboard exemplar and the `_product-feel/` set.

| File | Source | What we steal — the FEELING / the move | What NOT to copy |
|------|--------|----------------------------------------|------------------|
| _(dashboard exemplar)_ | `apps/web/src/app/(protected)/dashboard/` — the shipped, graded screen | The depth-staging trinity (TIER-1 hero score → TIER-2 standard cards → TIER-3 insets), the M11 mono-for-truth rule (every score delta is Geist Mono), the M12 editorial rhythm (tight within clusters, wide between sections). _Beamix: the digest's `engineDeltas` headline strip replaces the dashboard score ring as the focal element._ | Dashboard's score-ring layout, its agent-activity violet panel, its engine 2-up breakdown |
| _(feel-attio-whitespace.png)_ | `_product-feel/` — Attio's confident editorial whitespace | A briefing screen that breathes. Section breaks are wide and intentional; the content reads in deliberate clusters rather than a continuous scroll. The "curator" feeling comes from giving each section room to stand alone. | Attio's table-based product chrome, its specific row density |
| _(feel-dia-blue-hero.png)_ | `_product-feel/` — Dia's blue hero number | A primary metric that owns its region with no apology — generous type, no competing sub-labels at the same weight, the number anchors the scan before any reading begins. | Dia's dark-panel aesthetic, its AI-chat layout |

---

## Craft moves to absorb

The concrete techniques translated for Beamix. design-critic grades against each one.

- **Depth:** One TIER-1 focal — the score-movement headline strip (the three engine deltas with the dominant engine's `delta` in 64px Geist Mono, the other two receding to TIER-3 insets). TIER-2 for the wins list card. TIER-3 for the resolved approvals and customer note. Never two TIER-1 elements on the same screen.
- **Hierarchy:** The biggest movement this week is the loudest typographic object. The `digest.headline` in InterDisplay 30px is the verdict. The `engineDeltas` strip anchors beneath it with the dominant delta as the hero number. The wins list and approvals are earned by scrolling — M10 progressive disclosure.
- **Editorial rhythm (M12):** Sections are separated by deliberate whitespace (`48px` between the hero strip and the wins; `40px` between wins and approvals). Within the wins list, items are tight (`16px` gap). The `customerNote` is a typographically distinct closing voice — Inter 15px, muted, `--color-text-secondary`, inset with a left `2px solid --color-accent` hairline to signal it is a direct observation from the team.
- **Motion:** Wins rows stagger `.craft-enter-1` through `.craft-enter-4` on first paint. The hero strip fades up as `.craft-enter`. No looping motion. `prefers-reduced-motion` fallback: static.
- **Density:** Engine deltas in Geist Mono tabular-nums. Win dates in Geist Mono 12px. Labels in Inter. The win kind pill (schema / citation / content / faq) uses the status-pill system with `--color-status-agent-bg` ground — the wins are the agents' work, rendered in violet.
- **Type:** STEP-1 hero: dominant engine `delta` in Geist Mono 64px `-0.03em` (e.g. "+8 pts"). STEP-2 verdict: `digest.headline` in InterDisplay 30px `-0.02em`. STEP-3 eyebrow: "Week of Jun 8" in Inter-600 12px uppercase `tracking-[0.08em]` `#9CA3AF`. STEP-4 body: wins descriptions 14px Inter. The Fraunces beat: the week's dominant engine name in the `narrativeLine` renders italic Fraunces inline (e.g. "_Perplexity_ is responding faster than expected…") — one beat per screen.
- **Signature detail:** The micro-sparkline appears on each engine delta card — a 24px-tall SVG polyline of the four-week score progression (`fourWeeksAgo → lastWeek → thisWeek`) in the engine's score-band color. Flat `1px #E5E7EB` baseline when `fourWeeksAgo` is null (Week 1).

---

## Beamix translation

How the confident-briefing feeling lands in Beamix's locked brand.

- **Fonts:** InterDisplay for the headline verdict (STEP-2), Geist Mono for all score deltas and dates, Inter for the wins list and customer note, one Fraunces italic beat on the dominant engine name in the `narrativeLine`.
- **Color:** Positive `delta` in `--color-score-good` (#10B981). Flat/negative in `--color-text-muted`. Win kind pills in `--color-status-agent-bg` / `--color-status-agent` (agent work, violet tint). The customer note left hairline in `--color-accent` (#3370FF) — it is a note for the customer, so it carries the blue signal. All borders `#E5E7EB`.
- **System:** 8pt grid. TIER-1 → TIER-2 → TIER-3 depth staging (M1). `.craft-enter` stagger entrance for wins rows (M9). All four states designed: loading (skeleton hero strip + skeleton rows), empty (no digests yet — two-tier CTA: "Digests publish every Sunday" + quiet "view previous week" link when available), error (named recovery action), success (the full digest).

`beamix-brand-quality-bar` is authoritative. The editorial confidence lives in the typographic hierarchy, the score-delta hero, and the curator-voice customer note — not in layout cloning.

---

## PASS bar for this screen

PASS = the weekly digest reads like a confident editorial briefing. Grader checks:

1. Exactly one TIER-1 focal (dominant engine `delta` hero figure) — the number owns the screen before any reading begins.
2. The type contract visibly steps in four registers (64px mono delta → 30px InterDisplay headline → 12px eyebrow week label → 14px wins body).
3. The micro-sparkline appears on each engine delta — the four-week arc is visible at a glance, with a flat baseline when data is absent.
4. One and only one Fraunces italic beat (the dominant engine name in the `narrativeLine`).
5. All score numbers and dates in Geist Mono tabular-nums — no delta or date in a proportional font.
6. The `customerNote` is typographically distinct from the wins list — left blue hairline, muted Inter body.
7. No N-equal grid. Engine deltas are a weighted strip (dominant wider / others recede), not three equal columns.
8. All four states designed with two-tier recovery (M8).
9. The 8 AI-tells from CRAFT-SYSTEM.md are absent.
