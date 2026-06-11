# Reference contract — Traceability detail

- **Route:** `/traceability/[outcomeId]`
- **Status:** WRITTEN-CONTRACT (craft baseline = dashboard exemplar + _product-feel; Refero images deferred)
- **Owner:** design-lead

## The feeling in one line

> Forensic, earned trust — a single outcome at the top, then the exact dated trail of work that produced it, reading like a verifiable receipt, not a dashboard.

---

## References

No images in this folder yet — Wave 0 scope is the written contract only. Refero expansion is deferred to Wave 1 (the traceability screen build). The craft bar is grounded in the shipped dashboard exemplar and the `_product-feel/` set.

| File | Source | What we steal — the FEELING / the move | What NOT to copy |
|------|--------|----------------------------------------|------------------|
| _(dashboard exemplar)_ | `apps/web/src/app/(protected)/dashboard/` — the shipped, graded screen | The depth-staging (TIER-1 focal → TIER-2 standard → TIER-3 inset), the type contract (64px Geist Mono hero figure, 30px InterDisplay verdict, 12px eyebrow), the micro-sparkline as signature detail — _Beamix: the outcome's `deltaPoints` is the 64px hero number; the deliverable timeline is the TIER-3 inset ledger._ | Dashboard's layout, its score-ring focus, the engine-breakdown 2-up grid |
| _(feel-linear.png)_ | `_product-feel/` — Linear's quiet confidence | Nothing shouts; information is revealed by importance, not by proximity to the top. The timeline reads as a sequence of true facts. | Linear's purple, its compact row density, its issue-tracker layout |
| _(feel-anthropic-editorial.png)_ | `_product-feel/` — Anthropic editorial restraint | Evidence is presented with authority — dates and sources are visually foregrounded as the verifiable layer, not footnoted away. | Anthropic's color palette, its centered content column |

---

## Craft moves to absorb

The concrete techniques translated for Beamix. design-critic grades against each one.

- **Depth:** One TIER-1 focal element — the outcome statement + `deltaPoints` hero figure in Geist Mono 64px. The deliverable ledger rows are TIER-3 `.card-inset` (warm surface, 1px border, no shadow). The outcome header card is TIER-2 `.card-console`. Never two focal elements on the same screen.
- **Hierarchy:** The outcome statement is the loudest typographic object. Beneath it: the engine badge (blue `#3370FF` for customer-verified data) then the achievement date. The deliverable trail is a secondary reading layer — accessed by scrolling, not forced above the fold.
- **Timeline rail:** A `.timeline-rail` vertical hairline (`#E5E7EB`, 1px) runs left of the deliverable cards. Each deliverable node is a `.timeline-node` dot in `--color-agent` (#6E56F0) — the work is the agents' work, rendered in violet. The dot is 8px, circle, centered on the hairline.
- **Motion:** TIER-1 card fade-up on first paint via `.craft-enter`. Deliverable rows stagger `.craft-enter-1` through `.craft-enter-4`. No looping motion. `prefers-reduced-motion` fallback: static.
- **Density:** Dates in Geist Mono tabular-nums (`text-xs font-mono`). Labels in Inter. The deliverable kind pill (schema / citation / article) uses the status-pill system: `--color-status-agent-bg` ground + `--color-status-agent` text for agent-produced work.
- **Type:** STEP-1 hero: `deltaPoints` in Geist Mono 64px `-0.03em` tracking. STEP-2 verdict: outcome statement in InterDisplay 30px `-0.02em`. STEP-3 eyebrow: "Outcome" / "Work trail" in Inter-600 12px uppercase `tracking-[0.08em]` `#9CA3AF`. STEP-4 body: deliverable labels 14px Inter. The Fraunces beat is earned: the outcome's qualitative verdict word (e.g. the engine name in "Now ranked on **Perplexity**") renders italic Fraunces inline in the InterDisplay sentence — one beat per screen.
- **Signature detail:** The engine name in the outcome statement carries a subtle `--color-agent-tint` (#EEEAFD) inline pill — a glanceable signal that the agent work targeted this engine specifically.

---

## Beamix translation

How the forensic-receipt feeling lands in Beamix's locked brand.

- **Fonts:** InterDisplay for the outcome verdict (STEP-2), one Fraunces italic beat on the engine name, Geist Mono for `deltaPoints` and all dates, Inter for labels and body.
- **Color:** `deltaPoints` in `--color-score-good` (#10B981) for positive movement; `--color-score-critical` (#EF4444) for regression. Deliverable kind pills use the status-pill system. Timeline node dots in `--color-agent` (#6E56F0) — they are the agents' trace, not the customer's. The outcome header accent is blue `#3370FF` (the customer's verified result). Border `#E5E7EB` throughout.
- **System:** 8pt grid. TIER-1 → TIER-2 → TIER-3 depth staging (M1). All four states designed: loading (skeleton rail), empty (no outcomes yet — two-tier CTA: run a scan + quiet "view history" link), error (named recovery action), success (the trail). `.timeline-rail` + `.timeline-node` from `globals.css` additive utilities.

`beamix-brand-quality-bar` is authoritative. The receipt feeling lives in the typography hierarchy and the timeline detail — not in layout cloning from any reference.

---

## PASS bar for this screen

PASS = the traceability detail reads like a verifiable, dated receipt. Grader checks:

1. Exactly one TIER-1 focal (`deltaPoints` hero figure) — nothing else on screen competes with it.
2. The type contract visibly steps in four registers (64px mono → 30px InterDisplay → 12px eyebrow → 14px body).
3. The timeline rail + agent-violet node dots make the "work trail" glanceable from a meter away.
4. One and only one Fraunces italic beat (the engine name).
5. All dates in Geist Mono tabular-nums — no date or delta is in a proportional font.
6. No N-equal grid. The deliverable ledger is a vertical sequence, not a card grid.
7. All four states designed with two-tier recovery (M8).
8. The 8 AI-tells from CRAFT-SYSTEM.md are absent.
