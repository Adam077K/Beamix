# Beamix — Brand Guidelines v4.0

**March 2026 — Context-engineering document. Read before any design or copy task.**

> **v4.1 update — 2026-06-05.** The product **design vision is canonical at `docs/design/DESIGN-VISION.md`** (warm-minimal soul, locked via founder grill). The palette below is the v4.0 base; it was expanded 2026-06-05 — the **authoritative role-scoped token table is DESIGN-VISION §3**. Key locked laws: `#3370FF` is the **only** primary/CTA color; **blue = you, violet `#6E56F0` = the agents** (violet never a button); added colors (violet, pastel washes `#EAF0FB`/`#ECE7FB`/`#FBEAF0`/`#E6F5EE`, warm off-white `#F7F6F2`, status pills, dark panels `#14140F`/`#0E1424`) are strictly role-scoped punctuation, never identity. Fraunces gains editorial *moments* only (never UI chrome). When this file and DESIGN-VISION disagree on the product, DESIGN-VISION wins.

---

## 1. Brand Identity

**Product:** Beamix — GEO Platform for SMBs

> "Beamix scans your business, shows you where you're invisible in AI search, then its agents do the work to fix it."

**Name:** One word, capital B only. Never "BEAMIX", "beam-ix", or "beamIX".

**Personality:** Authoritative. Direct. Warm.

**Promise:** The agents do the work for you. **Loop:** Scan → Diagnose → Fix → Repeat

**Taglines:** EN: "Stop Being Invisible to AI Search" / HE: "השותף החכם שעושה את השלבים בשבילך"

**Architecture:**
- **Marketing site: Framer** — source of truth for marketing design. Live at average-product-525803.framer.app
- **Product dashboard: Next.js** — shared brand, own component system
- Shared: colors, fonts, voice, logo. Separate: layout patterns, component libraries, animations.

---

## 2. Color Palette

### Core Palette

| Token | Hex | Use |
|---|---|---|
| Background | `#FFFFFF` | Primary page background |
| Surface Alt | `#F7F7F7` | Section backgrounds, alternating panels |
| Primary Text | `#0A0A0A` | All headings and body copy |
| Muted Text | `#6B7280` | Descriptions, captions, secondary labels |
| Card Border | `#E5E7EB` | Card and input borders |
| Primary Accent | `#3370FF` | CTAs, links, logo mark, active states, sparkle icons, progress rings |
| Secondary CTA | `#0A0A0A` | "Scan →" button, secondary action buttons |

### Gradient System (Marketing — Framer only)

| Gradient | Stops | Use |
|---|---|---|
| Hero mesh | `#3370FF` → sky → periwinkle → lavender | Hero bg, primary CTA strips |
| Build plan | Peach → salmon | Build pricing card highlight |
| Dark section | `#0A0A0A` solid | Testimonials, dark full-bleed CTA |

Gradient sections are narrative moments — not decorative filler. Max one per consecutive page area. Never stack. Text on dark sections: white `#FFFFFF`.

### Product gradient rule — the blue→violet beat (locked 2026-06-12)

The product app has exactly **one** sanctioned gradient: the **hero blue→violet**
`#3370FF → #6E56F0` (`--color-accent → --color-agent`). It is allowed **ONLY** on:

- a **hero** surface (the one focal moment on the screen),
- an **AI / agent surface** (where the agents are at work), or
- a **score-reveal** (the free-scan dopamine moment).

It is **forbidden** everywhere else — never on a button, never as a card background filler,
never on dense product chrome, never on a data point. This carries the blue=you / violet=agents
promise into the one gradient and keeps it from becoming decoration. (DESIGN-VISION §3.)

### Score Colors (data visualization only — never buttons or links)

| Level | Hex | Range | Also used as |
|---|---|---|---|
| Excellent | `#06B6D4` | 75–100 | Data viz only (2.8:1 — fails text WCAG) |
| Good | `#10B981` | 50–74 | Success state, pricing checkmarks |
| Fair | `#F59E0B` | 25–49 | Warning state |
| Critical | `#EF4444` | 0–24 | Error / destructive state |

### Data-viz series tokens — DISTINCT from the action accent (locked 2026-06-12)

Charts must never paint data in the **action** accent's role. Reference the data-viz series
tokens (`--color-data-1 … --color-data-6`; utilities `.text-data-N` / `.bg-data-N`), never
`.text-accent` / `.bg-accent`, for any chart stroke, fill, or legend swatch.

| Series | Token | Hex |
|---|---|---|
| data-1 | `--color-data-1` | `#3370FF` |
| data-2 | `--color-data-2` | `#6E56F0` |
| data-3 | `--color-data-3` | `#06B6D4` |
| data-4 | `--color-data-4` | `#10B981` |
| data-5 | `--color-data-5` | `#F59E0B` |
| data-6 | `--color-data-6` | `#EF4444` |
| grid | `--color-data-grid` | `#EAEAEA` |

`data-1` deliberately shares the blue **hue** with the accent (it is the canonical first
series), but it is a **separate token with a separate role**. The rule is about *intent*:
chart code references the `data-*` role so a data point is never mistaken for — or styled
as — a clickable action. Default to the blue/violet pair plus desaturated tints; pastel
multi-band, never loud. (Authoritative table: DESIGN-VISION §3.)

### Status-pill TEXT vs swatch — WCAG AA (locked 2026-06-12)

Status pills use a tinted ground + saturated hue. The small 12–13px pill **label** must use
the AA-passing (≥4.5:1 on its own ground) `--color-status-*-text` token (utility
`.text-status-*`). The saturated base `--color-status-*` token (utility `.swatch-status-*`)
is for **dots, icons, ticks, and large figures only** — on the tinted grounds it clears only
AA-large (3:1), so it must not carry small text. Both tracks share the same hue family.

### Retired Colors — Do Not Use

Navy `#023C65`, Yale Blue `#25426A`, Blue Slate `#536D84`, Old orange `#F97316`, Old indigo `#6366F1`, Old orange accent `#FF3C00`, Old background `#FAFAF9`.

---

## 3. Typography

| Font | Use |
|---|---|
| **InterDisplay-Medium** | All headings — tight tracking (-2px), 48–72px |
| **Inter** | Body copy, UI labels, captions — 16–20px |
| **Fraunces** | Dark sections and testimonial carousel only — white text |
| **Geist Mono** | Code blocks, scan result data, JSON output only |

**Retired (never use):** Montserrat, Outfit, Source Serif, DM Serif, PT Sans, Plus Jakarta Sans, Figtree.

### Type Scale

| Level | Size | Weight | Line Height |
|---|---|---|---|
| Hero / Display | 56–72px | InterDisplay-Medium | ~1.05 |
| H1 | ~40px | InterDisplay-Medium | 1.1 |
| H2 | ~28px | Inter 600 | 1.2 |
| H3 | ~20px | Inter 600 | 1.3 |
| Body | ~16px | Inter 400 | 1.6 |
| UI Label / Caption | ~13px | Inter 500 | 1.4 |
| Section Eyebrow | 12px | Inter 600 uppercase | — |

**Capitalization:** H1 Title Case. H2–H6 Sentence case. **Reading width:** Body 560px max. Headlines 640px max.

---

## 4. Buttons

| Type | Shape | Background | Text |
|---|---|---|---|
| Primary marketing | Pill (999px) | `#3370FF` | White |
| Secondary marketing | Pill (999px) | `#0A0A0A` | White |
| Product utility | Rounded-lg (8px) | Context | Context |
| Ghost / outline | Rounded-lg (8px) | Transparent | `#0A0A0A` hover:bg-muted |

Pill shape for marketing only. Never apply pill to product utility buttons.

---

## 5. Spacing and Layout

| Token | Value |
|---|---|
| Section padding | 120px top/bottom (140px min for hero) |
| Container | 1280px max, centered, 24px padding (48px at lg) |
| Card border-radius | 20px |
| Button border-radius (product) | 8px |
| Base gap unit | 8px |
| Eyebrow → headline | 16px · Headline → body: 24px · Body → CTA: 48px |
| Card grid gap | 32px · Section headline → content grid: 64–80px |
| Dashboard sidebar | 240px expanded, 64px collapsed |

**Shadows:** Card base `0 2px 8px rgba(0,0,0,0.08)` · Card hover `0 12px 32px rgba(0,0,0,0.12)` + `translateY(-2px)` 200ms · Modal `0 24px 60px rgba(0,0,0,0.15)`

---

## 6. Logo

**Mark:** Blue star/cross `#3370FF` + "Beamix" wordmark in black Inter.

Light bg: blue mark + black wordmark. Dark bg: blue mark + white wordmark.

Logo files: `saas-platform/public/logo/beamix_logo_blue_Primary.svg` (primary), `beamix_logo_black.svg` (monochrome).

Never recolor the mark. No stretching. No opacity below 80%. Clear space = 1× logo height all sides. Min width: 100px. Files: `saas-platform/public/logo/` (new files pending).

---

## 7. Iconography

**Library: Lucide React only.** Accent icons: `#3370FF`. Muted/inactive: `#6B7280`. Score-excellent: `#06B6D4` (data only). Icon-only buttons must have `aria-label`.

Sizes: Inline 12px · Button 14–16px · Sidebar nav 16px · Card/feature 20px · Section 24px · Illustrative 28–32px.

---

## 8. Motion

| Animation | Duration | Easing |
|---|---|---|
| Micro-interactions | 150ms | ease-out |
| Component transitions | 200ms | ease-in-out |
| Page / section entry | 500–600ms | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Hero stagger | 120ms/child delay | — |
| Nav scroll transparent → frosted | 300ms | ease-in-out |
| Typewriter (AI agent demo only) | 60ms/char | linear |

Always respect `prefers-reduced-motion`. Animation reveals hierarchy — never decorative.

---

## 9. Voice and Tone

| Attribute | Do | Don't |
|---|---|---|
| Direct | "Your business isn't showing up in ChatGPT. We fix that." | "We help businesses improve their AI search visibility." |
| Authoritative | "Ranked in 48 hours." | "We aim to help you rank faster." |
| Warm | "you" and "your business" always | Passive voice or "users" |
| Sharp | Lead with outcome, not process | List features before the benefit |

**By context:** Hero — bold, slightly provocative. Onboarding — warm, action-focused. Dashboard UI — instructive, zero marketing language. Error messages — honest, no blame. Pricing — "Everything included. No hidden limits."

**Headlines:** 6–10 words, outcome-first. No exclamation points. No questions. Present tense or imperative.

**CTAs:** Action verb first. "Start free scan" beats "Get Started". Never "Click here". Primary: "Scan your site →". Secondary: "See the plans →".

---

## 10. Grammar and Mechanics

**Oxford comma** always. **Em dashes** for pauses — preferred over colons in headlines. **Exclamation points** max one per piece.

**Numbers:** Spell out one–nine in prose. Numerals for 10+. Always numerals for metrics/prices: 3 AI Engines, $79/mo.

**Words we use:** scan, diagnose, fix, agents, visibility, rank, show up, done for you, AI search, GEO.

**Words we avoid:** leverage (verb), synergy, platform → use "product". "Cutting-edge", "revolutionary", "game-changing" → SaaS filler, cut. Very/really/just/maybe → cut.

---

## 11. Dual-Language

Hebrew and English built simultaneously — not sequential translation. Hebrew voice: direct, authoritative, warm. RTL layout supported in product UI. All components must support RTL. Language toggle site-wide.

---

## 12. Pricing Reference

| Plan | Monthly | Annual |
|---|---|---|
| Discover | $79/mo | $63/mo |
| Build | $189/mo | $151/mo |
| Scale | $499/mo | $399/mo |

---

## 13. Pre-Ship Checklist

**Colors**
- [ ] Background is `#FFFFFF` or `#F7F7F7` — not old `#FAFAF9`
- [ ] Primary CTA is `#3370FF` pill (marketing) or `#0A0A0A` (secondary)
- [ ] Navy `#023C65` is absent — retired
- [ ] Cyan `#06B6D4` only in score data/charts — never button or link
- [ ] Text on dark sections is white `#FFFFFF`

**Typography**
- [ ] Headings use InterDisplay-Medium — no retired fonts
- [ ] Body uses Inter (not Montserrat)
- [ ] Fraunces only in dark/testimonial sections
- [ ] Hero headings have -2px letter-spacing
- [ ] Body paragraphs max 560px wide

**Buttons + Layout**
- [ ] Marketing CTAs are pill (999px). Product buttons are rounded-lg (8px)
- [ ] Section padding min 120px. Card radius 20px. Container max 1280px

**Copy**
- [ ] Headlines 6–10 words, outcome-first, no exclamation points
- [ ] Oxford comma in lists of 3+. No retired vocabulary

**Accessibility**
- [ ] All interactive elements have keyboard focus styles
- [ ] Icon-only buttons have `aria-label`
- [ ] `prefers-reduced-motion` respected
- [ ] Contrast verified for all text/bg pairs
