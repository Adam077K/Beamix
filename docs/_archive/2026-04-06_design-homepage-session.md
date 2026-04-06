# Session Log: Design Lead — Homepage High-Fidelity Design

**Date:** 2026-03-13
**Lead:** design-lead
**Task:** Full homepage high-fidelity design — all 9 sections per homepage-design-spec.md
**Status:** Complete
**Archived:** 2026-04-06 — homepage now lives in Framer; this session log is superseded

---

## What Was Done

- Loaded ui-ux-pro-max skill
- Read homepage-design-spec.md (authoritative source, 589 lines)
- Read all 4 reference photos (Hero+Demo, Scroll-Driven Storytelling, AI Agents+ChatGPT, End/Footer)
- Read existing components: beamix-nav, beamix-hero, hp-nav, hp-hero, hp-feature-section, hp-stats — understood current codebase patterns (Framer Motion, Tailwind, CSS variables)
- Confirmed Pencil MCP not available as a callable tool — proceeded with spec path (equally valid per role instructions)
- Wrote complete high-fidelity design spec into `pencil/BeamixHomepage_Design.pen` (Pencil v2.8 native JSON)
- All 9 sections designed with pixel-accurate coordinates, correct brand colors, typography sizes, animation specs, copy, and WCAG analysis

## Files Changed

| File | Change |
|------|--------|
| `pencil/BeamixHomepage_Design.pen` | Full high-fidelity design: 9 sections, 150+ named elements, brand system, design decisions, WCAG analysis |
| `docs/08-agents_work/sessions/2026-03-13-design-homepage.md` | This session log |

---

## Design Summary by Section

| Section | Elements | Key Visual Treatment |
|---------|----------|----------------------|
| S1 Nav | 10 | Logo navy left, 4 links center, ghost Log In + navy filled CTA right. IntersectionObserver sticky-CTA swap behavior. |
| S2 Hero | 25 | Two-column. 75px ExtraBold ALL CAPS headline. AI logo slot-machine square (navy #023c65, 68px, 12px radius). URL input 460px (border #E7E5E4). Right trust strip 5 logos grayscale opacity:0.6. Blur-to-sharp on page load. |
| S3 Demo Video | 8 | Full-bleed #D9D9D9 atmospheric bg + dark overlay. 16:9 video player 1224×689px, 85% width, 12px radius. Autoplay muted loop. Fallback play button. |
| S4 Scroll Story | 30+ | GSAP + ScrollTrigger. ChatGPT mock #1E1E1E. Typewriter prompt. 5-item response list. Position 5 highlighted in navy rgba. Problem sentences (2 upward-fade + 1 blur-to-sharp). Logo transition animation. 3 alternating dashboard placeholders. |
| S5 Agents | 40+ | Agents hub two-col. Section header 52px. 3×3 parallax grid (left/right cols 0.4x counter-scroll, center stationary). 3 stat cards navy gradient (16 Agents, 7 AI Engines, +340% Visibility). Center card expands to full viewport over 800px. 16 agent completion cards scroll feed over 1200px. Transition header blur-to-sharp. ChatGPT result with stack-reorder to position 1. |
| S5 Closing | 4 | 52px closing headline blur-to-sharp. Support line muted. Navy CTA. |
| S6 Quote | 6 | Full-bleed navy gradient #023c65→#013f6c. Grain texture overlay 4% opacity. Eyebrow "What we believe". 52px white quote. Ghost CTA anchors to S7. |
| S7 Pricing | 45 | Header + monthly/annual toggle pill. 3 cards: Starter $49/$39, Pro $149/$119 (navy border + Most Popular badge), Business $349/$279. Feature lists. 5 FAQ items with dividers. |
| S8 Integrations | 18 | Two-row infinite marquee opposite directions (30s linear). 8 cards per row visible. 20 companies total. White cards rounded shadow. |
| S9 Footer | 14 | Clouds photo placeholder (fallback Yale Blue→Slate gradient). Logo + tagline + nav + social + legal white. BEAMIX display wordmark 280px rgba 12% — intentionally cropped at footer bottom (cinematic editorial frame). |

---

## Critical Design Decisions

1. **No cyan on CTAs.** Cyan #06B6D4 used in EXACTLY ONE place: position-1 result highlight in S5.7 (score/data context). All CTAs, buttons, active states: navy #023c65. This corrects the prior `beamix-hero.tsx` + `beamix-nav.tsx` which misused cyan for CTAs.

2. **4 blur-to-sharp moments only.** Per spec §4: S4.1 section header, S4.2 Step3 sentence 3 ("They never see your name."), S5.6 transition header, S5.8 closing tagline. NO other elements use blur-to-sharp.

3. **GSAP + ScrollTrigger required** for S4+S5 scroll-pinned sequences. Framer Motion insufficient per spec. Install: `npm install gsap`.

4. **ChatGPT mock is #1E1E1E** (dark surface, not pure black). Coded component, not screenshot.

5. **Font:** var(--font-outfit) weight:800 already loaded in layout.tsx. No additional font import needed for display text.

6. **Pricing LOCKED:** Starter $49/$39, Pro $149/$119, Business $349/$279 annual.

7. **Footer wordmark crop:** BEAMIX at 280px, rgba white 12%, y=580 on 840px footer. ~65% of letterforms visible. Use overflow-hidden on footer container.

---

## WCAG Analysis

| Pair | Ratio | Level |
|------|-------|-------|
| #023c65 on #FAFAF9 | ~12:1 | AAA |
| White on #023c65 | ~12:1 | AAA |
| #141310 on #FFFFFF | ~20:1 | AAA |
| #78716C on #FFFFFF | ~4.6:1 | AA |
| White on #1E1E1E | ~16:1 | AAA |
| White on #25426A | ~8:1 | AAA |

Additional requirements for code:
- All interactive elements: min 44px height
- Focus rings: focus-visible:ring-2 ring-[#023c65]
- Icon-only buttons: aria-label attribute required
- Marquee: aria-label="Partner and integration logos"
- Video: aria-label="Product demo video"

**Status: PASS (design layer)**

---

## Assets Still Needed

- Product demo video
- 3 dashboard screenshot images (overview, rankings by AI engine, agent recommendations)
- Agents hub illustration
- 9 agent type images for 3×3 grid (S5.3)
- Section 6 gradient background image
- Clouds photograph (footer)
- 5+ trust logo wordmarks (right column hero)
- 16 agent names + icons (S5.5 feed) — currently using placeholder names
- Final copy for all TBD sections

---

## Components to Build / Update

| File | Action | Notes |
|------|--------|-------|
| `src/components/landing/hp-nav.tsx` | Update | Add IntersectionObserver sticky-CTA swap. Correct links. Remove all cyan. |
| `src/components/landing/hp-hero.tsx` | Rewrite | 2-col layout. 75px ExtraBold ALL CAPS. AI logo slot machine. URL input + Scan Now. Trust strip. |
| `src/components/landing/hp-demo-video.tsx` | Create NEW | Atmospheric bg + centered 16:9 video. Autoplay muted loop. Fallback. |
| `src/components/landing/hp-scroll-story.tsx` | Create NEW | GSAP + ScrollTrigger. ChatGPT mock component. Problem/solution scroll narrative. 3 dashboard screens. |
| `src/components/landing/hp-agents.tsx` | Create NEW | 3×3 parallax grid. Center card expansion. 16-card feed. ChatGPT result with stack reorder. |
| `src/components/landing/hp-quote.tsx` | Create NEW | Navy gradient bg. Grain texture. White quote. Ghost CTA. |
| `src/components/landing/hp-pricing.tsx` | Create NEW | Toggle pill. 3 correct-price cards. FAQ accordion. |
| `src/components/landing/hp-integrations.tsx` | Create NEW | Dual-row opposite-direction infinite marquee. 20 logo cards. |
| `src/components/landing/hp-footer.tsx` | Update | Clouds bg. White text. Nav. Legal. Oversized cropped BEAMIX wordmark. |
| `src/app/page.tsx` | Update | Wire S1-S9 in order. Remove old hp-* components that are replaced. |

---

_Session by: design-lead | Date: 2026-03-13_
_Archived: 2026-04-06 — homepage now in Framer, landing components deprecated_
