# Reference contract — Dashboard

- **Route:** `/dashboard`
- **Status:** **awaiting founder north-stars** → Refero-expanded → LOCKED _(build starts only at LOCKED — founder checkpoint #1)_
- **Owner:** design-lead
- **Note:** First application of the design operating system, alongside `home`.

## The feeling in one line

> _Founder: one sentence for the whole dashboard. What should it feel like the moment it loads? E.g. "A calm command center where the user's AI-search score is unmistakably the hero and every fix is one confident click away." — replace with your own._

---

## References

Drop 2-3 north-star screenshots into this folder (`north-star-1.png` … `north-star-3.png`) and fill the rows. design-lead adds the `refero-*.png` rows after Refero expansion. **Steal the move, not the layout.**

| File | Source | What we steal — the FEELING / the move | What NOT to copy |
|------|--------|----------------------------------------|------------------|
| `north-star-1.png` | _Founder: where it's from_ | _Founder: the specific dashboard move — "the way one big score/metric anchors the page and supporting cards have real layered depth, not flat boxes"_ | _The layout, fonts, colors, brand_ |
| `north-star-2.png` | _Founder: product / page_ | _Founder: the move — e.g. how the data table stays dense yet calm, or how status reads at a glance_ | _The literal pixels_ |
| `north-star-3.png` | _Founder: product / page_ | _Founder: the move — e.g. the empty/first-run state that still feels premium_ | _The literal pixels_ |
| `refero-1.png` | _design-lead: Refero real screen_ | _Adjacent craft move worth absorbing_ | _The literal pixels_ |
| `refero-2.png` | _design-lead: Refero real screen_ | _The move_ | _The literal pixels_ |

---

## Craft moves to absorb

_design-lead fills this after the founder locks north-stars. Candidate moves the dashboard must land:_

- **Depth:** layered metric/score cards with considered shadow ramps — never flat, never harsh `shadow-md`.
- **Hierarchy:** the AI-search score (or primary KPI) is the loudest element; recommendations and recent scans recede beneath it.
- **Motion:** one signature moment — the score counting up / settling on first paint (Tier 1). Table and list transitions stay subtle. `prefers-reduced-motion` fallback.
- **Density:** scan results and rankings read dense but calm — Geist Mono for scan data, generous 8pt rhythm so nothing crowds.
- **States:** first-run empty state ("No scans yet" with a resolving CTA) is designed, not blank white space.

---

## Beamix translation

- **Fonts:** InterDisplay headings · Inter UI/body · Geist Mono for scan data / scores / JSON · Fraunces reserved for dark panels only.
- **Color:** accent `#3370FF` (run-scan CTA, links, active nav) · surface `#FFFFFF` / `#F7F7F7` · text `#0A0A0A` · muted `#6B7280` · border `#E5E7EB` · score colors `#06B6D4` / `#10B981` / `#F59E0B` / `#EF4444` for the score ring and rank deltas (data-viz only, never buttons).
- **System:** 8pt grid · `rounded-lg` cards · Lucide icons, single strokeWidth · all four states designed.

`beamix-brand-quality-bar` wins over any reference's brand. Steal the move, not the palette.

---

## PASS bar for this screen

PASS = "indistinguishable in craft-level from the references, expressed as Beamix" — not pixel-match. The critic scores the richness gap and returns a specific list of what's missing to reach the references' craft bar.
