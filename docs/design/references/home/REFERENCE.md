# Reference contract — Home

- **Route:** `/` (product home / app landing after auth — not the Framer marketing site)
- **Status:** **awaiting founder north-stars** → Refero-expanded → LOCKED _(build starts only at LOCKED — founder checkpoint #1)_
- **Owner:** design-lead
- **Note:** First application of the design operating system, alongside `dashboard`. This is the in-product home surface; the public marketing homepage lives in Framer and is out of scope here.

## The feeling in one line

> _Founder: one sentence for the home surface. What should it feel like on first load? E.g. "An immediate sense that Beamix is already working — the next action is obvious and the surface feels considered down to the last detail." — replace with your own._

---

## References

Drop 2-3 north-star screenshots into this folder (`north-star-1.png` … `north-star-3.png`) and fill the rows. design-lead adds the `refero-*.png` rows after Refero expansion. **Steal the move, not the layout.**

| File | Source | What we steal — the FEELING / the move | What NOT to copy |
|------|--------|----------------------------------------|------------------|
| `north-star-1.png` | _Founder: where it's from_ | _Founder: the specific home move — "the confident, uncluttered first impression where one primary action dominates and the rest breathes"_ | _The layout, fonts, colors, brand_ |
| `north-star-2.png` | _Founder: product / page_ | _Founder: the move — e.g. how it surfaces status/progress without clutter_ | _The literal pixels_ |
| `north-star-3.png` | _Founder: product / page_ | _Founder: the move — e.g. the signature entrance moment that sets the tone_ | _The literal pixels_ |
| `refero-1.png` | _design-lead: Refero real screen_ | _Adjacent craft move worth absorbing_ | _The literal pixels_ |
| `refero-2.png` | _design-lead: Refero real screen_ | _The move_ | _The literal pixels_ |

---

## Craft moves to absorb

_design-lead fills this after the founder locks north-stars. Candidate moves the home surface must land:_

- **Depth:** primary cards / panels carry real layered depth — considered shadow ramps, never flat, never harsh `shadow-md`.
- **Hierarchy:** one primary action owns the surface (run a scan / continue setup); secondary surfaces recede.
- **Motion:** one signature entrance sequence on first paint (Tier 1) — heavy fade-up, `ease-out`, 600-1200ms; nothing else animates on every load. `prefers-reduced-motion` fallback.
- **Density:** generous macro-whitespace so the surface breathes; considered detail, not decoration.
- **States:** the empty / first-run home (no scans yet, setup incomplete) is fully designed with a resolving CTA and voice-canon copy — never blank.

---

## Beamix translation

- **Fonts:** InterDisplay headings · Inter UI/body · Geist Mono for any scan data / scores · Fraunces reserved for dark panels only.
- **Color:** accent `#3370FF` (primary CTA, links, active) · surface `#FFFFFF` / `#F7F7F7` · text `#0A0A0A` · muted `#6B7280` · border `#E5E7EB` · score colors `#06B6D4` / `#10B981` / `#F59E0B` / `#EF4444` (data-viz only).
- **System:** 8pt grid · `rounded-lg` product utility · Lucide icons, single strokeWidth · all four states designed · copy passes `humanizer` (no buzzwords, sentence-case headings, straight quotes).

`beamix-brand-quality-bar` wins over any reference's brand. Steal the move, not the palette.

---

## PASS bar for this screen

PASS = "indistinguishable in craft-level from the references, expressed as Beamix" — not pixel-match. The critic scores the richness gap and returns a specific list of what's missing to reach the references' craft bar.
