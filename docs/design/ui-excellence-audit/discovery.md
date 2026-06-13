---
page: /discovery
route: /discovery
states_audited:
  - populated-desktop.png  (NOTE: this is NOT the populated happy path — it is the EnvMissingFallback error state, because NEXT_PUBLIC_CALCOM_DISCOVERY_LINK was unset in the capture environment)
states_missing:
  - happy-path desktop (branded header + Cal.com embed) — NEVER CAPTURED
  - loading state (three-dot mono pulse + "Loading calendar…") — NEVER CAPTURED
  - mobile 375px — NEVER CAPTURED
  - tablet — NEVER CAPTURED
competitor_refs_used:
  - Profound-Screenshot 2026-06-12 at 10.36.25 AM.png (loading/scan splash)
  - Profound-Screenshot 2026-06-12 at 10.38.57 AM.png (dashboard, layered depth + mono figures)
  - otterly-Screenshot 2026-06-12 at 10.42.49 AM.png (onboarding form, considered density)
verdict: CRITICAL_ISSUES
source_files:
  - apps/web/src/app/discovery/page.tsx
  - apps/web/src/app/discovery/_components/CalEmbed.tsx
---

# discovery — UI Excellence Audit

## Screenshots

- [populated-desktop.png](./screenshots/discovery/populated-desktop.png) — **mislabeled**: this is the env-missing FALLBACK (error) state, not the happy path.

## Verdict

**CRITICAL_ISSUES.**

Two compounding problems. (1) The only screenshot that exists for this page is the **degraded `EnvMissingFallback` error state** (page.tsx:82-109) — the booking calendar env var was unset at capture time, so what rendered is the "Our booking calendar isn't loading right now" recovery card. The page's actual happy path (branded header + Cal.com embed), the branded loading state, and every responsive breakpoint were **never captured**, so the intended surface is entirely unaudited. (2) The one state we CAN see is itself a textbook AI tell: a single dead-center symmetric card floating in a vast empty warm field — exactly the "bare centered card / dead-center symmetry" pattern (tell #5) the rubric exists to kill, with no depth staging, no serif beat, no signature detail, no editorial rhythm. Against the Profound/Otterly bar (layered surfaces, monospace truth, dense considered detail), this reads thin and templated. The page cannot be passed: most of it is invisible, and the visible part is below bar.

## P1 — must fix (looks AI / broken)

1. **The audited state is the wrong state entirely — the happy path was never rendered.**
   The screenshot is `EnvMissingFallback` (page.tsx:39-41, 82-109), which only renders when `NEXT_PUBLIC_CALCOM_DISCOVERY_LINK` is missing. The real page (page.tsx:45-75) is a branded header (28/32px InterDisplay headline "Let's talk about your AI search visibility", eyebrow "Discovery call", subtitle) above a full-width Cal.com iframe. **None of that is in any screenshot.** This is a broken audit input, not just a craft gap — you cannot grade a conversion page on its error fallback. *Fix: re-capture with the env var set (happy path + loading state), at desktop AND 375px mobile, before any craft sign-off.* `apps/web/src/app/discovery/page.tsx:39`

2. **Dead-center symmetric card in a sea of empty space (tell #5) — the fallback is bare and unconsidered.**
   The rendered card sits perfectly centered both axes with ~280px of dead vertical space above and ~300px below it on a 1440×900 frame. There is no depth tier, no warm character glyph, no anchoring rhythm — just a wordmark, a card, and void. The rubric explicitly forbids "full-width stacks; bare centered icon-in-circle empties" and M8 requires a designed empty/error with a warm character glyph and titled context. *Fix (M8 + M1): give the recovery card real presence — TIER-2 `--shadow-card` (it currently looks like the faint default), a warm character glyph or a small inline calendar/mail illustration (moments-only character is sanctioned here), and constrain the dead space with an anchored layout rather than absolute centering.* `apps/web/src/app/discovery/page.tsx:84-107`

3. **No serif beat anywhere (tell #6) and no signature detail (tell #4) on the one conversion moment of the funnel.**
   This is the bottom-of-funnel booking page — the highest-intent surface in the product — yet it carries zero Fraunces editorial beat and nothing a generic template wouldn't have. M5 wants exactly one Fraunces italic on a verdict/emotional word. The happy-path headline "Let's *talk* about your AI search visibility" is the natural home for the one serif beat; the fallback headline "Book a Discovery Call" could carry it on "*talk*"/"*time*". *Fix (M5): one Fraunces italic word in the headline, inline in the sans sentence, dark/light-safe per the rubric (light bg is fine for a single inline word per DESIGN-VISION editorial-moment rule — confirm with design-lead, else move the beat to the subtitle).* `apps/web/src/app/discovery/page.tsx:59-61, 90-92`

4. **Type contract is not stepped — the four registers collapse to two (tell #3 / M2).**
   In the fallback: headline 22px semibold (page.tsx:90), body 15px (line 93), helper 13px (line 103). There is no STEP-1 hero figure and no clear command/recede ladder — everything sits in a narrow 13-22px band so nothing dominates. The happy path is better (28/32px headline + 12px eyebrow) but the fallback regresses to a flat two-register stack. *Fix (M2): raise the fallback headline to the 30px InterDisplay-Medium -0.02em verdict step and add the 12px uppercase eyebrow ("Discovery call") that the happy path has, so the fallback shares the happy path's contract instead of being a thinner sibling.* `apps/web/src/app/discovery/page.tsx:90, 93, 103`

5. **Mobile is completely unverified on a page whose core is a fixed-height 700/800px iframe.**
   `CalEmbed.tsx:50` hardcodes `h-[700px] w-full ... sm:h-[800px]`. A Cal.com embed at 375px width frequently overflows, horizontally scrolls, or clips the month grid; the loading overlay is `absolute inset-0` over that fixed box. No mobile screenshot exists to confirm it doesn't break. For an SMB owner booking from a phone after a free scan, this is the make-or-break flow. *Fix: capture 375px, verify no horizontal scroll and that the iframe + loading overlay reflow; if the embed clips, switch to a responsive aspect or min-height strategy.* `apps/web/src/app/discovery/_components/CalEmbed.tsx:50`

## P2 — substantive

1. **Loading state is a generic three-dot pulse, not the brand's signature reveal (tell #7 / M4).**
   `CalEmbed.tsx:28-44` renders three accent dots + "Loading calendar…". Compare the Profound loading splash (branded mark + "Checking growth for beamixai.com" on a subtle dotted field) — it feels like the product. Three bouncing dots is the canonical AI-default loader. *Fix (M4/M9): reuse the brand scan/loading treatment (the mark + a contextual line like "Loading your calendar…") so the loading moment carries a signature detail instead of a template spinner.* `apps/web/src/app/discovery/_components/CalEmbed.tsx:28-44`

2. **No entrance choreography (tell #7 / M9).**
   The fallback card and the happy-path header appear with no fade-up/stagger. The rubric wants first-paint surfaces to fade-up 8px in priority order (≤200ms, behind `prefers-reduced-motion`). *Fix (M9): fade-up the header cluster, then the embed/card, ~40ms stagger.* `apps/web/src/app/discovery/page.tsx:48-73, 84-107`

3. **Blue/violet promise is invisible (tell #8 / M6).**
   The only blue is the CTA fill — correct usage, but the page does nothing to express the you=blue / agents=violet language even subtly (e.g., the subtitle promises "what *we'll* fix" — the agent work — with no violet structural cue anywhere). Not a violation, but a missed chance to make the brand legible at arm's length on a high-intent page. *Fix (M6, optional): a quiet violet structural hairline or agent-tinted micro-element where agent work is referenced — never a button.* `apps/web/src/app/discovery/page.tsx:64-65`

4. **Editorial whitespace rhythm is one global gap, not relationship-driven (M12).**
   Header cluster uses `mt-4 / mt-2 / mt-2` and the fallback uses `mt-8 / mt-3 / mt-6 / mt-4` — serviceable but not deliberately tight-within-cluster / wide-between-clusters. The header's `py-5` is also light for a branded marquee above a tall embed. *Fix (M12): tighten eyebrow→headline, widen headline-block→embed; lift header vertical padding to anchor the marquee.* `apps/web/src/app/discovery/page.tsx:49, 55-66`

## P3 — nice-to-have

1. **CTA copy "Email hello@beamixai.com" exposes the raw mailto target as the button label.** Reads slightly utilitarian/templated. *Fix: "Email us to book" with the address in the helper line below.* `apps/web/src/app/discovery/page.tsx:101`

2. **"No credit card. No commitment." trust line is muted-disabled grey (`--color-text-disabled` #9CA3AF) — borderline low-contrast (~2.5:1 on warm surface).** *Fix: bump to `--color-text-muted` for WCAG AA on this reassurance line.* `apps/web/src/app/discovery/page.tsx:103`

3. **Wordmark is plain text "Beamix" (18px) — no logo mark.** Profound/Otterly both lead with their mark. *Fix: pair the Beamix glyph with the wordmark in the header/fallback.* `apps/web/src/app/discovery/page.tsx:51, 86`

## Per-state notes

- **"populated-desktop" (actually the error fallback):** dead-center card, faint shadow, two-register type, no serif, no character glyph, vast dead space. Below bar (tells #3, #4, #5, #6, #7 all present). This is the only thing we can see.
- **Happy path (header + Cal.com embed):** NOT CAPTURED. Source suggests it is stronger (28/32px headline, eyebrow, subtitle) but it is unaudited; the embed itself is a third-party iframe whose styling Beamix does not control, which is its own craft risk worth noting once visible.
- **Loading state:** NOT CAPTURED. Source shows a generic three-dot pulse (see P2.1).
- **Mobile / tablet:** NOT CAPTURED. Fixed 700/800px iframe is a concrete overflow risk (see P1.5).
