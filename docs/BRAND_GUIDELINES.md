# Beamix — Brand Guidelines

**Version 3.0 — March 2026**
Source of truth for all design and copy work. Read this before touching any component or writing any copy.

---

## 1. Brand Identity

**Product:** Beamix — GEO Platform for SMBs

> "Beamix scans your business, shows you where you're invisible in AI search, then its agents do the work to fix it."

**Name:** One word, capital B only. Never "BEAMIX", "beam-ix", or "beamIX".

**Brand Personality:** Authoritative. Direct. Warm.

**Brand Promise:** The agents do the work for you.

**Brand Loop:** Scan → Diagnose → Fix → Repeat

**What kind of product this is:** Beamix is a text-output product. Agents write content, recommendations, and copy. Not a charts or dashboard product. All visual and atmospheric choices should feel like the right environment for a product that produces words, clarity, and insight — not graphs.

### Taglines

English: "Stop Being Invisible to AI Search"

Hebrew: "השותף החכם שעושה את השלבים בשבילך" — The smart partner who does the steps for you.

### Three Messaging Pillars

**Pillar 1 — The agents do the work**
Competitors show dashboards. Beamix executes. The headline is always the action, not the insight.
> "Beamix doesn't just tell you what's wrong — its agents fix it."

**Pillar 2 — The loop compounds**
GEO is not a one-time fix. The Beamix loop runs continuously.
> "Scan. Diagnose. Fix. Repeat. Every cycle, you get closer to being the business AI recommends."

**Pillar 3 — AI has an opinion**
AI engines already rank every business. The question is whether that ranking is accurate and positive.
> "ChatGPT already has an opinion about your business. Let's make sure it's the right one."

---

## 2. Target Audience

### Primary: The Israeli SMB Owner
- Runs a local or regional business (insurance, clinic, law firm, contractor, restaurant, etc.)
- Not technical — doesn't know what GEO means and shouldn't need to
- Motivated by: more leads, more visibility, not losing to competitors
- Frustrated by: investing in SEO/Google that no longer works, not showing up in AI searches
- Speaks Hebrew. Thinks in shekels. Wants results, not reports.
- **Key message:** "You're invisible to AI search. We fix that — the agents do it for you."

### Secondary: The Global SMB Owner
- Same profile, English-speaking, global markets
- May be more digitally aware, but still not technical
- **Key message:** Identical — visibility, agents, results.

**Not the audience:** Enterprise, agencies, technical users, developers.

---

## 3. Color Palette

### Core Colors

| Token | Hex | Use |
|---|---|---|
| Page Background | `#FAFAF9` | All page surfaces, sidebar background. Never use pure white or any other off-white as page background. |
| Card Surface | `#FFFFFF` | Cards, modals, popovers, input backgrounds. |
| Primary Text | `#000000` | All headings and body copy on light surfaces. |
| Muted Text | `#78716C` | Secondary text, placeholders, captions, inactive nav labels. Never for primary content or form labels. |
| Card Border | `#F9FAFB` | Subtle card borders — near-invisible. |
| Input Border | `#E7E5E4` | Form field borders only. |

### Navy Accent System

These two values are a paired system — not interchangeable.

| Token | Hex | Use |
|---|---|---|
| Primary Navy | `#023C65` | CTAs, active nav states, links, logo mark, focus rings, tab indicators. The only color for interactive UI elements. |
| Hover Navy | `#013F6C` | Button hover states and second stop in navy gradient pairs only. Never for static text. |

Navy `#023C65` on `#FAFAF9` achieves ~12:1 contrast — AAA compliant.

### Score and Data Colors

These colors exist only for AI visibility scores, chart fills, and data visualizations. Do not use them for buttons, links, focus rings, or any interactive element.

| Score | Hex | Range |
|---|---|---|
| Excellent | Cyan `#06B6D4` | 75–100 |
| Good | Emerald `#10B981` | 50–74 |
| Fair | Amber `#F59E0B` | 25–49 |
| Critical | Red `#EF4444` | 0–24 |

Cyan `#06B6D4` fails WCAG contrast for text (2.8:1). Use only for score icons, badge fills, and chart elements — never as text color.

### Gradient Palette

Three colors form the gradient system for atmospheric section backgrounds.

| Token | Hex | Role |
|---|---|---|
| Yale Blue | `#25426A` | Deep tone — dominant in dark brand-moment sections |
| Blue Slate | `#536D84` | Mid-tone — transitional gradient washes |
| Alabaster Grey | `#E9EBE8` | Light neutral — soft gradient sections |

**Approved combinations:**
- Yale Blue → Blue Slate (dark, confident — key quote sections, primary CTA sections)
- Blue Slate → Alabaster Grey (soft, transitional — supporting sections)
- Alabaster Grey → Background `#FAFAF9` (gentle fade-in sections)

### UI State Colors

| State | Color |
|---|---|
| Error / Destructive | Red `#EF4444` |
| Success | Emerald `#10B981` |
| Warning | Amber `#F59E0B` |
| Info | Navy `#023C65` |

### What Not to Use

Orange `#F97316` is permanently removed. Do not use it anywhere.
No purple, no bright green, no earth tones.
Do not use pure `#000000` or pure `#FFFFFF` as a page background.

---

## 4. Typography

**Single font family:** Montserrat (Google Fonts) — all text, all pages, all components.

**Weights in use:** 400 Regular, 500 Medium, 600 SemiBold, 700 Bold, 800 ExtraBold. No other weights.

**Exception:** Geist Mono for code blocks, scan result data, and JSON output only.

### Type Scale

| Level | Size | Weight | Line Height | Notes |
|---|---|---|---|---|
| Hero / Display | 56–72px (responsive) | 800 ExtraBold | ~1.05 | Tight negative tracking. Scale up to 72px+ on wide viewports. |
| H1 | ~40px | 700 Bold | 1.1 | Title Case. |
| H2 | ~28px | 600 SemiBold | 1.2 | Sentence case. |
| H3 | ~20px | 600 SemiBold | 1.3 | Sentence case. |
| Body | ~16px | 400 Regular | 1.6 | Default reading text. |
| UI Label / Caption | ~13px | 500 Medium | 1.4 | Tags, metadata, card labels. |
| Section Eyebrow | 12px | 600, uppercase | — | Wide tracking. Appears above section headline. Names the category, not the benefit. |

**Capitalization rule:** Title Case for H1 only. Sentence case for all H2–H6.

**Letter spacing:** Display and hero headlines use `letter-spacing: -0.02em`. Body uses default.

### Reading Width

Never let prose span the full container. Cap:
- Body paragraphs: 560px max
- Section headlines: 640px max
- Hero headlines: 800px max
- Content containers: 1280px max

---

## 5. Spacing and Layout

### Core Principle: Extreme Whitespace

Extreme whitespace is a defining characteristic of the Beamix visual style. Sections breathe. Do not compress these values without explicit design approval.

- Section padding: 120px top/bottom at default viewports, 200–220px at large breakpoints
- Hero sections: minimum 140px top padding to clear the fixed nav

### Gap System

| Gap | Value |
|---|---|
| Eyebrow to headline | 16px |
| Headline to body paragraph | 24px |
| Body paragraph to CTA | 48px |
| Section headline to content grid | 64–80px |
| Card grid horizontal spacing | 32px |
| Feature grid rows | 48–64px |
| Stacked text within a card | 8–12px |

### Container

- Landing sections: 1280px max-width, centered, 24px side padding (48px at large viewports)
- Dashboard: full width, 24px side padding
- Sidebar: 240px expanded, 64px collapsed

### Border Radius

| Element | Radius |
|---|---|
| Cards | 20px |
| Landing CTA buttons | 12px |
| Utility buttons and inputs | 8px |
| Badges and pills | Full-round |

Do not mix card-level radius into buttons or vice versa.

### Shadows

Cards use 1–3px base shadow at low opacity. Hover states lift to 8–24px spread. Modals up to 60px spread. Never use heavy drop shadows for page-level elements.

- Card base: `0 2px 8px rgba(0,0,0,0.08)`
- Card hover: `0 12px 32px rgba(0,0,0,0.12)` + `translateY(-2px)` — 200ms ease-out
- Modal: up to `0 24px 60px rgba(0,0,0,0.15)`

### Landing Page Section Order

Hero → Trust bar (logo marquee) → Feature grid → Gradient section or full-width feature → Tabbed product sections → Stats/proof → Testimonials → Pricing preview → Dark full-bleed CTA → Footer.

---

## 6. Gradient and Background System

### No Photography

Beamix does not use lifestyle photography, photorealistic images, oil paintings, or city landscape images on the main site. The oil painting image system (Variant A/B) is retired.

Backgrounds are brand gradients — either CSS gradients or gradient image files (PNG/JPG) supplied by the design team built from the gradient palette.

### How Gradients Are Used

Gradient sections are deliberate narrative moments — not decorative filler. White `#FAFAF9` sections are the default. Gradient sections mark emphasis: a key quote, a value statement, a brand moment.

**Rule:** Maximum one gradient section per consecutive page area. Do not stack gradient sections.

**Text on gradients:** Always white `#FFFFFF`. Never place dark text on a gradient background.

### Surface Treatments on Gradients

- **Film grain:** Very subtle noise texture (3–5% opacity) on gradient sections only. Adds tactile depth — should not read as a visible texture effect.
- **Thin grid lines:** Fine, low-opacity geometric lines on select gradient sections. Editorial feel. Maximum one section per page. Only where the layout benefits from visual scaffolding.

### Visual Atmosphere

Minimalist-tech with premium atmosphere. Think: a high-tech office loft — organized, precise, with interesting design details. Blues, whites, and greys throughout. No warm tones, no orange, no earth tones.

References: **oriol.design** (layout intelligence, scroll-driven interactions), **wittl** (visual atmosphere, gradient treatment, surface textures).

---

## 7. Logo

The Beamix logo is a stylized B visually connected with a beam of light — the B-beam mark. Always the B-beam, never a plain letter B.

**Logo files in `saas-platform/public/logo/`:**
- `beamix_logo_blue_Primary.svg` — navy `#023C65`. Default for all light surfaces: landing nav, dashboard sidebar, light cards, email headers.
- `beamix_logo_black.svg` — pure black `#000000`. For print, monochrome, and document contexts only.

### Placement Rules

| Surface | Logo to use |
|---|---|
| Light background (`#FAFAF9` / `#FFFFFF`) | Blue primary logo |
| Print or monochrome on white | Black logo |
| Dark background / gradient section | Create white version (set all fills to `#FFFFFF`), or place blue logo inside a white pill container |

**Never:** recolor outside approved palette, stretch, reduce opacity below 80%, or place the black logo on colored or dark backgrounds.

**Clear space:** Maintain at least one logo height on all sides.

**Minimum size:** 100px wide (wordmark). Do not render below this.

---

## 8. Iconography

**Library: Lucide React only.** No mixing icon libraries.

### Sizing

| Context | Size |
|---|---|
| Inline with caption text | 12px |
| Button inline icon | 14–16px |
| Sidebar nav icons | 16px |
| Card / feature icons | 20px |
| Section feature icons | 24px |
| Large illustrative icons | 28–32px |

Do not use icons larger than 32px outside illustrative contexts.

### Color Rules

- Interactive icons: inherit from button or link text
- Primary feature icons: navy `#023C65`
- Muted / inactive: `#78716C`
- Status icons: semantic colors (emerald success, red error, amber warning)
- Score-excellent icon: cyan `#06B6D4` — score context only
- Icon-only buttons must have an accessible label

---

## 9. Motion and Animation

### Philosophy

Animations reveal hierarchy and guide attention — never decorative. Every animated element earns its animation. Quick, intentional, purposeful. Always respect `prefers-reduced-motion`.

### Timing Reference

| Animation | Duration | Easing |
|---|---|---|
| Micro-interactions (hover, toggle, focus) | 150ms | ease-out |
| Component transitions (tab, accordion, dropdown) | 200ms | ease-in-out |
| Interactive card hover | 200ms | ease-out |
| Page/section entry (scroll-triggered) | 500–600ms | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Hero stagger (children in sequence) | 120ms delay per child | — |
| Nav scroll transition (transparent → frosted glass) | 300ms | ease-in-out |
| Blog card image scale on hover | 500ms | ease-out |
| Blur-to-sharp | 600–800ms | ease-out |

### Standard Entry Pattern

Elements fade in and rise 24px upward. In staggered groups, each child delays 120ms after the previous. Scroll-triggered sections fire at 20% viewport threshold.

### Blur-to-Sharp

High-impact entry reserved for maximum 4 moments on the entire homepage. Pattern: element starts blurred (`filter: blur(8px)`) + reduced opacity, then sharpens to full clarity as it enters. Signals something important.

**Not for:** Section 5.1 (Agents Hub intro) — uses standard upward fade only.

### Other Animations

- **Scroll-driven narrative:** Sections reveal progressively as the user scrolls, building the product story.
- **Typewriter:** Used only for AI simulation demonstrations — text appearing character-by-character to represent an agent writing or thinking. 60ms per character, linear.
- **Logo trust bar:** Continuous horizontal marquee, looping.

---

## 10. Voice and Tone

### Core Attributes

| Attribute | Do | Don't |
|---|---|---|
| Direct | "Your business isn't showing up in ChatGPT. We fix that." | "We help businesses improve their AI search visibility." |
| Authoritative | "Ranked in 48 hours." | "We aim to help you rank faster." |
| Warm | Use "you" and "your business" always | Use passive voice or "users" |
| Sharp | Lead with outcome, not process | List features before the benefit |
| Bilingual-native | Equal quality in English and Hebrew | Machine-translated copy |

### Tone by Context

| Context | Tone | Example |
|---|---|---|
| Hero / landing | Bold, direct, slightly provocative | "Be the business that AI recommends." |
| Problem framing | Empathetic, direct | "AI has an opinion about your business. It might not be the one you want." |
| Feature descriptions | Clear, benefit-first, specific | "16 agents that fix your content, citations, and schema — automatically." |
| Onboarding | Warm, encouraging, action-focused | "You're set up. Let's run your first scan." |
| Dashboard UI | Clear and instructive — no marketing language | "Select an agent to start." |
| Emails | Warmer than the website, still direct | Never cheerful for its own sake. |
| Error messages | Honest, helpful, no blame | "Something went wrong. Let's try that again." |
| Blog | Educational but punchy — no padding | |
| Pricing | Honest, no tricks | "Everything included. No hidden limits." |

### Headlines

- Benefit-focused, 6–10 words maximum
- Lead with the outcome, not the feature
- Title Case for H1 only — Sentence case for H2–H6
- No exclamation points in headlines
- Present tense or imperative: "Be the business..." / "Scan your site"
- No questions — statements are stronger

**Good:** "Be the business that AI recommends."
**Avoid:** "Introducing Our New AI-Powered GEO Optimization Dashboard!"

### CTAs

| Type | Examples |
|---|---|
| Primary (high intent) | "Scan your site →" / "Start free scan" / "Request a Demo" |
| Secondary | "Learn More →" / "See the plans →" |

Rules: Action verb first. Specific outcome over vague label. "Start free scan" beats "Get Started". Never use "Click here".

### Body Copy

- 2–3 sentences per paragraph maximum
- One idea per paragraph
- No throat-clearing — start with the point
- Lead with the benefit, then the feature
- Short words over long words when both work
- Do not explain the technology. Explain the outcome.

### Email Copy

- Subject lines: 30–50 characters, direct, no clickbait
- Preview text: Add information — don't repeat the subject line
- Body: Scannable, one main message per email
- Sign-off: First name, no corporate footer language

### Blog Copy

- Title: Primary keyword included, under 60 characters
- Hook: Relevant within the first 50 words
- Sections: 200–300 words each with clear subheadings
- Lists: 3–7 items — use prose if fewer than 3
- End with a single CTA

---

## 11. Grammar and Mechanics

**Oxford comma:** Always — "scan, diagnose, and fix."

**Em dashes:** For dramatic pauses and emphasis. Preferred over colons in headlines. Do not use as a comma replacement.

**Exclamation points:** Maximum one per piece. Usually zero.

**Numbers:**
- Spell out one–nine when standalone in prose
- Use numerals for 10 and above
- Always numerals for metrics: 7 AI Engines, 16 Agents, $49/mo
- Always numerals for prices and percentages

**Capitalization:**
- H1: Title Case
- H2–H6: Sentence case
- Product names: Beamix (capital B), ChatGPT, Perplexity, Gemini, Claude, Grok — as trademarked

### Words We Use

scan, diagnose, fix, agents, visibility, recommend, automatic, rank, show up, done for you, results, recommendation, first position, AI search, GEO

### Words We Avoid

| Avoid | Use instead |
|---|---|
| Leverage (as verb) | Use, apply |
| Synergy | Cut it |
| Bandwidth (for availability) | Capacity, time |
| "Cutting-edge", "innovative", "disruptive" | Only when earned — otherwise cut |
| Very, really, just, maybe, hopefully | Cut them |
| "Revolutionary", "game-changing" | Overused SaaS filler — cut |
| Platform | Product |
| Problem | Challenge — or name exactly what's wrong |

---

## 12. Dual-Language Notes

- Product is built for Hebrew and English simultaneously — not sequential translation
- Hebrew brand voice: "השותף החכם שעושה את השלבים בשבילך" (the smart partner who does the steps for you)
- Hebrew tone should match: direct, authoritative, warm — no translation awkwardness
- RTL layout is supported in the product UI. All components must support RTL.
- Language toggle is available site-wide. Each page has a canonical language per market.

---

## 13. Pricing (Reference for Copy)

| Plan | Monthly | Annual |
|---|---|---|
| Starter | $49/month | $39/month |
| Pro | $149/month | $119/month |
| Business | $349/month | $279/month |

Copy rule: "Everything included. No hidden limits." Honest framing, no asterisks.

---

## 14. Quick Reference Checklist

Use this before shipping any page, component, or piece of copy.

**Colors**
- [ ] Page background uses `#FAFAF9` — not pure white, not any other off-white
- [ ] All interactive elements (buttons, links, focus rings, active states) use navy `#023C65`
- [ ] Cyan `#06B6D4` appears only in score displays and chart data — never as text
- [ ] Orange is not present anywhere
- [ ] Text on gradient backgrounds is white `#FFFFFF`
- [ ] Primary text on light backgrounds is `#000000`

**Typography**
- [ ] All text uses Montserrat — no other font families (except Geist Mono for code)
- [ ] Hero/display text uses ExtraBold (800), tight line-height ~1.05
- [ ] H1 uses Bold (700), H2–H3 use SemiBold (600)
- [ ] Body copy uses Regular (400), ~16px, line-height 1.6
- [ ] Section headlines are preceded by an eyebrow label
- [ ] Body paragraphs are constrained to max-width (560px)
- [ ] Headlines are 6–10 words, outcome-first, no exclamation points

**Spacing and Layout**
- [ ] Section padding follows extreme whitespace values (120px minimum)
- [ ] Paragraphs do not span the full container width
- [ ] Card border radius is 20px — not mixed with button radius

**Gradients and Images**
- [ ] Gradient sections are deliberate narrative moments — not decorative
- [ ] Maximum one gradient section per page area (no stacked gradients)
- [ ] No lifestyle photography, no oil paintings, no city landscape images
- [ ] Film grain and grid lines used sparingly

**Motion**
- [ ] Animations are purposeful — not decorative
- [ ] Blur-to-sharp used no more than 4 times on the homepage
- [ ] `prefers-reduced-motion` is respected

**Logo**
- [ ] Blue primary logo on all light surfaces
- [ ] White version or pill container on dark/gradient backgrounds
- [ ] No recoloring, stretching, or opacity reduction below 80%
- [ ] Clear space maintained on all sides
- [ ] Minimum 100px wide

**Copy and Voice**
- [ ] Starts with the useful information — no preamble
- [ ] Active voice throughout
- [ ] "You" appears more than "we"
- [ ] No weak modifiers (very, really, just)
- [ ] No avoided words (synergy, leverage, revolutionary, platform, etc.)
- [ ] CTA is specific and action-verb-first
- [ ] Oxford comma used in all lists
- [ ] Correct capitalization (Title Case H1, Sentence case H2–H6)
- [ ] Numbers follow the rules (numerals for metrics, prices, 10+)
- [ ] No more than one exclamation point in the entire piece

**Accessibility**
- [ ] Icon-only buttons have accessible labels
- [ ] Focus states are visible — navy `#023C65` ring
- [ ] Heading hierarchy is not skipped
- [ ] Cyan is never used as text color

---

*Owner: Design Lead*
*Version 3.0 — March 2026*
*Supersedes: Brand Guidelines v2.0 and all pre-March 2026 versions*
