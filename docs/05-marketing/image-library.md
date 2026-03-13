# Beamix Image Library — Gradient Background System

**Single source of truth for all background visuals on the website.**
Gradient assets are supplied PNG/JPG files from the brand team — do not generate them via AI tools.

---

## Gradient Palette

Three base colors used across all gradient assets:

| Name | Hex | Tone | Primary use |
|------|-----|------|-------------|
| **Yale Blue** | `#25426A` | Dark, atmospheric | Hero backgrounds, closing CTAs, impact sections |
| **Blue Slate** | `#536D84` | Mid-tone | Transitional sections, feature reveals, supporting panels |
| **Alabaster Grey** | `#E9EBE8` | Light, airy | Soft section breaks, testimonials, pricing areas |

Gradients blend between these colors — darker to lighter or lighter to darker depending on section intent. No warm tones (orange, amber, brown) appear in any gradient file.

---

## Asset Types

Two types of gradient images exist:

**Pure gradient wash** — a clean color gradient with no embedded content. Used as a background layer behind text, cards, or JSX overlays.

**Gradient + embedded UI** — gradient with a UI screenshot, dashboard view, or product element composited inside the file. The gradient provides atmosphere; the UI provides product proof.

---

## File Naming Convention

Format: `[page]-[section]-[color].jpg` or `.png`

Examples:
- `homepage-hero-yale-blue.jpg`
- `pricing-quote-blue-slate.jpg`
- `auth-bg-alabaster.jpg`

Storage path: `public/images/gradients/`

---

## Page / Section Mapping

| Page / Section | Asset type | Color range |
|----------------|-----------|-------------|
| Homepage hero | Pure wash or embedded UI | Yale Blue |
| Homepage quote section | Pure wash | Yale Blue → Blue Slate |
| How It Works | Embedded UI | Blue Slate |
| Why Beamix | Pure wash | Alabaster Grey |
| Pricing | Pure wash | Alabaster Grey → Blue Slate |
| Auth (login / signup) | Pure wash, portrait crop | Yale Blue |
| Dashboard empty states | Gradient + UI hint | Blue Slate |
| Blog headers | Pure wash | Any — match article tone |

---

## Overlay Rules

Two surface elements are applied on top of gradient backgrounds **in code only** — they are never baked into the image file.

**Noise / grain texture:** A subtle CSS film grain layer. Adds premium tactile depth. Apply via a transparent PNG overlay or CSS filter. Opacity: 5–10%.

**Thin grid lines:** Fine geometric line pattern at very low opacity. Adds editorial structure. Apply as an SVG overlay or CSS background pattern.

Both overlays are added in JSX/CSS. Do not request them in any image file.

---

## Text on Gradients

- All text placed over Yale Blue or Blue Slate gradients must use white `#FFFFFF`
- Headlines, subheads, and CTAs on gradient sections: white only
- Do not place dark text (`#000000` or `#FAFAF9`) on Yale Blue or Blue Slate backgrounds
- Alabaster Grey sections may use dark text (`#000000`) — verify contrast before shipping

---

## Rules

- One gradient background per page section maximum
- Do not use gradient backgrounds in sections where inline product content (text, cards, data tables) is the primary element — gradients are atmosphere, not decoration for text-heavy content
- Do not attempt to generate gradient files via AI — the brand team supplies all gradient assets
- Do not use warm tones (orange, amber, brown) in any gradient — blues, slates, and greys only
- Crop modes follow the same conventions as the previous image system: Background 5:2 / 16:9 for full-width heroes, Gallery 4:3 or 1:1 for panels, Portrait 9:16 for auth

---

## What Is Retired

The previous image system — thick impasto oil paintings in Makoto Shinkai style, with Variant A (Manhattan Elevated) and Variant B (Natural Light & Beam) — is no longer part of the Beamix visual system.

The following files are legacy and must not be used on new pages:

| File | Was used for |
|------|-------------|
| `public/homepage/Hero_homepage_city.png` | Homepage hero (Variant A) |
| `public/images/beamix-how-it-works.jpg` | How It Works hero |
| `public/images/beamix-why.jpg` | Why Beamix hero |
| `public/images/beamix-pricing.jpg` | Pricing hero |
| `public/images/beamix-auth.jpg` | Auth right column |
| `public/images/beamix-404.jpg` | 404 page |
| `public/images/beamix-empty.jpg` | Dashboard empty states |
| `public/images/blog/beamix-blog-*.jpg` | All blog hero series |
| `public/images/beamix-feature-*.jpg` | All feature section panels |

Do not reference these files in new components. Replace with the corresponding gradient asset from `public/images/gradients/` when building or updating pages.

---

## File Location Map

```
public/
  images/
    gradients/
      homepage-hero-yale-blue.jpg          — Homepage hero
      homepage-quote-yale-blue-slate.jpg   — Homepage quote section
      how-it-works-blue-slate.jpg          — How It Works (embedded UI)
      why-beamix-alabaster.jpg             — Why Beamix
      pricing-alabaster-slate.jpg          — Pricing
      auth-bg-yale-blue.jpg                — Login / Signup (portrait)
      dashboard-empty-blue-slate.jpg       — Dashboard empty states
      blog-[slug]-[color].jpg              — Blog headers (per article)
```

New files follow the `[page]-[section]-[color]` naming convention. Add entries to this map when the brand team delivers new assets.
