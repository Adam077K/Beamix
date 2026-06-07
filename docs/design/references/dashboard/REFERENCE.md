# Reference contract — Dashboard

- **Route:** `/dashboard`
- **Status:** **LOCKED 2026-06-05 (founder checkpoint #1).** First build in progress (`feat/dashboard-redesign-v2`).
- **Owner:** design-lead
- **Note:** First application of the design operating system, alongside `home`.

## The feeling in one line

> **A calm command center where your AI-search score is unmistakably the hero, the agents' work is visibly underway in violet, and the next fix is one confident blue click away.**

---

## References

Drop 2-3 north-star screenshots into this folder (`north-star-1.png` … `north-star-3.png`) and fill the rows. design-lead adds the `refero-*.png` rows after Refero expansion. **Steal the move, not the layout.**

| File | Source | What we steal — the FEELING / the move | What NOT to copy |
|------|--------|----------------------------------------|------------------|
| `north-star-plausible.png` | Plausible live demo (real dashboard) | KPI tile-strip → one dominant chart → dense-calm tables; the primary KPI is the hero. _Beamix: the AI-search score ring replaces the visitors number as the loudest element._ | Plausible's indigo palette, its flat card edges (Beamix wants layered shadow), its fonts |
| `posthog-empty-dashboard.png` | PostHog (empty state) | A real dashboard in its EMPTY state still feels premium — titled bordered cards with skeleton glyphs + selling copy, not blank white. | Keep light; tints → blue ramp |
| `dense-kpi-ribbon.webp` | Plausible/Coda-style analytics | A black KPI ribbon of oversized numbers over tiny captions (extreme number-over-label hierarchy); in-cell horizontal bar shading on tables. | Indigo fills → #3370FF + pale-blue tint |

_Full contracts + swatches in `../CATALOG.md` (dashboard section). Refero rows pending Refero reactivation._

---

## Craft moves to absorb

_design-lead fills this after the founder locks north-stars. Candidate moves the dashboard must land:_

- **Depth:** layered metric/score cards with considered shadow ramps — never flat, never harsh `shadow-md`.
- **Hierarchy:** the AI-search score (or primary KPI) is the loudest element; recommendations and recent scans recede beneath it.
- **Motion:** MINIMAL / transitions-only (DESIGN-VISION lock). The score settles via a quiet ease-out transition — **NO count-up, no signature animation** (the free-scan reveal is the only sanctioned animated moment, and it lives on the front door, not here). `prefers-reduced-motion` fallback.
- **Agents = violet:** the agents' work reads in `--color-agent` (#6E56F0) — "your crew is on N fixes," recent runs, automation status. Blue (#3370FF) is reserved for YOUR actions (the one CTA, links, active nav). Violet is never a button.
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
