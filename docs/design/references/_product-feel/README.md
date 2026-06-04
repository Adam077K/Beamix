# `_product-feel/` — the global product soul

This folder holds the references that define what **all of Beamix** feels like — the single point of view that makes the product read as one coherent thing rather than a pile of screens built by different hands. It is loaded on **every** screen build, alongside that screen's own folder, before any code is written.

Set this once. It changes rarely — only when the whole-product direction shifts, and only at a founder checkpoint.

References here are **vibe, not blueprint.** They transfer the soul — the craft level, the aesthetic confidence, the density of considered detail — not a layout to clone. The `product-designer` absorbs them; the `design-critic` grades whether the screen carries the same soul, expressed as Beamix. See `../README.md` for the two-folder model.

---

## What belongs here

A small, curated set — **4 to 6 images, never more.** This is the soul of the product, not a mood board. Each one earns its slot by answering: "does this capture how Beamix as a whole should *feel*?"

Belongs:

- Whole-product hero/dashboard shots from products with the soul Beamix is chasing — the considered, inevitable, billion-dollar feel of Stripe, Linear, Apple, Anthropic.
- References that show **cross-screen coherence**: how a real product holds one voice across dense data, empty states, and marketing surfaces alike.
- The "richness" exemplars — depth, signature moments, motion restraint, typographic confidence — that the whole product should breathe.

Does **not** belong:

- Single-component crops or one-off micro-interactions — those go in the relevant `[screen]/` folder.
- Anything chosen for its layout. The global folder transfers feeling, never structure.
- More than 6 images. If a seventh feels essential, replace a weaker one. Discipline here is the point.

---

## Drop instructions

1. Drop 4-6 full-resolution, real-pixel screenshots into this folder. Name them `feel-1.png` … `feel-6.png`.
2. Add a one-line note for each in this README (the table below) — the single soul-quality it carries.
3. This set is loaded by `product-designer` and `design-critic` on **every** screen, so it is held to the highest bar. When in doubt, leave it out.
4. Changes to this folder are a whole-product direction decision — route them through `design-lead` and a founder checkpoint, never edit silently.

---

## The current set

| File | The soul-quality it carries |
|------|-----------------------------|
| `feel-1.png` | _Founder: drop the screenshot, then name the one whole-product feeling it carries (e.g. "Linear's quiet confidence — nothing shouts, everything is intentional")._ |
| `feel-2.png` | _Founder: the depth/richness exemplar — where considered detail makes the surface feel inevitable._ |
| `feel-3.png` | _Founder: the cross-screen-coherence exemplar — one voice across dense and sparse views._ |
| `feel-4.png` | _Founder: the typographic / hierarchy confidence exemplar._ |

Add `feel-5` / `feel-6` rows only if a fifth or sixth image genuinely sharpens the soul. Four strong references beat six diluted ones.

---

## Beamix translation (always wins)

Whatever soul these references carry lands in Beamix's **locked** brand, never in the references' own fonts or colors:

- Fonts: InterDisplay (headings) · Inter (body/UI) · Fraunces (dark sections + testimonials only) · Geist Mono (scan data / code).
- Accent `#3370FF` (CTAs, links, active only). Surface `#FFFFFF` / `#F7F7F7`, text `#0A0A0A`, muted `#6B7280`, border `#E5E7EB`.
- 8pt grid. `rounded-lg` product utility. Score colors (`#06B6D4` / `#10B981` / `#F59E0B` / `#EF4444`) for data-viz only.

Steal the soul. Never the palette. `beamix-brand-quality-bar` is authoritative over any reference's brand.
