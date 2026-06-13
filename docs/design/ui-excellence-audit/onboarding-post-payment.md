---
page: /onboarding/post-payment
component: apps/web/src/app/(protected)/onboarding/post-payment/_post-payment-scan.tsx
states_audited:
  - populated-desktop.png (in_progress phase, ~60%, no drafts revealed yet)
states_NOT_captured:
  - empty / waiting phase
  - complete phase (Fraunces "ready." beat + CTA)
  - error phase
  - mobile 375px
  - in_progress WITH drafts revealed (the right-rail / draft cards)
competitor_refs:
  - Profound-Screenshot 2026-06-12 at 10.37.47 AM.png (welcome/onboarding — asymmetric split, left content + right ranked data panel)
  - Profound-Screenshot 2026-06-12 at 10.38.57 AM.png (dashboard — confident left-aligned figure hierarchy, mono numbers)
  - Profound-Screenshot 2026-06-12 at 10.39.25 AM.png (prompts table — dense in-cell data shading)
  - otterly-Screenshot 2026-06-12 at 10.44.17 AM.png (onboarding form — left form column + right product-preview panel fills the viewport)
verdict: NEEDS_WORK
---

# onboarding-post-payment — UI Excellence Audit

## Screenshots

- [populated-desktop.png](screenshots/onboarding-post-payment/populated-desktop.png) — the only captured state; shows the `in_progress` phase at ~60%, before any draft cards have surfaced.

> Coverage gap: of the four phases this component renders (waiting / in_progress / complete / error) plus mobile and the drafts-revealed sub-state, only ONE was captured. The complete beat (the Fraunces "ready." serif moment + the only blue CTA) and the drafts rail (the entire violet-structure payoff and the M3 asymmetry argument) were never rendered. This audit grades what is visible and flags the rest from source.

## Verdict

**NEEDS_WORK.** The page is on-brand and bug-free at the token level — correct violet eyebrow, correct blue progress fill, mono percentage, clean InterDisplay headline — but at the composition level it is the canonical AI tell #5: one small card dead-center in a vast empty white field. Against the competitor bar (Profound's and Otterly's onboarding both fill the viewport with a confident left content column + a right product-preview/data panel), this render reads like an unfinished modal floating in a void, not a $189/mo product's first paid moment. The hierarchy, color, and type are right; the *spatial confidence and density* are roughly half the competitor bar. It is not broken and not a clone — it just doesn't yet command the screen.

---

## P1 — must fix (looks AI / broken)

### P1-1. Dead-center single card in a vast white void — the canonical AI tell #5 + missing M3 asymmetry
**Problem.** The entire surface is one ~560px card centered both horizontally and vertically in a 1440px viewport (`max-w-[640px] ... justify-center`, `_post-payment-scan.tsx:573`). ~70% of the screen is empty white. The card itself is small relative to the canvas, with enormous dead space above (the card starts ~310px down) and below.
**Why it reads AI/broken vs the ref.** Both competitor onboarding refs (Profound 10.37.47, Otterly 10.44.17) use a **confident asymmetric split**: a focused left column (content/form) paired with a right-side panel that *previews the product value* (a ranked list, a chart skeleton, the dashboard you're about to get). They fill the viewport and feel like a product. Beamix's centered-card-in-void is exactly tell #5 ("dead-center symmetry; full-width stacks") and tell #2-adjacent (one floating container, no compositional intent). At arm's length it looks like a loading modal, not a designed onboarding act.
**Fix (M3 + M10).** Break the dead-center. Use the `[1fr_360px]`-style split that the dashboard exemplar already ships: a dominant left column carrying the live ritual (eyebrow → step label → progress → engines) and a narrower right rail that surfaces the draft cards as they land — so the *value preview* (what the crew is producing for you) fills the right half the way Profound's ranked panel does. On desktop the work and its output should sit side-by-side and fill the frame; collapse to a single column < 768px.
**File:line.** `_post-payment-scan.tsx:573` (the `max-w-[640px] ... justify-center` single column) and `:611–616` (the drafts panel is stacked *below* at `mt-10` instead of being the right rail).

### P1-2. No TIER-1 focal — the 64% figure is demoted to a 13px muted caption (M1 + M2 violation)
**Problem.** The component's own header comment claims "STEP-1 pct 64px Geist Mono," but the actual `ProgressTrack` renders the percentage at `text-[13px] text-[var(--color-text-muted)]` in a 40px-wide right-aligned slot (`:304`). In the render the "60%" is a tiny grey number tucked at the end of the bar. There is no TIER-1 hero figure anywhere on the screen.
**Why it reads AI/broken vs the ref.** Profound's dashboard (10.38.57) leads with a commanding "72.9%" figure that dominates its panel — the eye lands on the number first. Beamix's only number is a recessive afterthought. This is tell #3 (evenly-weighted typography; nothing commands) and a direct break of M2's "exactly one STEP-1 64px Geist Mono focal per screen." The headline (30px) and the percentage (13px) have inverted the intended hierarchy.
**Fix (M2).** Promote the progress percentage to the STEP-1 focal the comment promises: `~64px var(--font-mono)`, `tabular-nums`, `-0.03em`, primary-text weight, sitting *above or beside* the thin bar — not crammed into a 40px caption slot. The "Scanning 3 engines" label becomes STEP-2 (30px verdict) and the figure becomes the thing the eye catches.
**File:line.** `_post-payment-scan.tsx:303–309` (the 13px muted pct that should be the 64px hero) and `:324–330` (the 30px label currently mis-cast as the top of the hierarchy).

### P1-3. Card depth is invisible — no felt elevation tier (tell #1 uniform/flat depth)
**Problem.** The card uses `.card-console` (`--shadow-card`: a three-layer but very faint `rgba(10,10,10,0.04–0.06)` shadow, globals.css:77/199). On a pure-white page background the card border is visible but the shadow is essentially imperceptible in the render — the card reads as a flat hairline rectangle, not a TIER-2 elevated instrument panel.
**Why it reads AI/broken vs the ref.** The rubric's M1 demands "3 felt tiers." Here there is exactly one surface and it doesn't even feel elevated — it's flat-on-flat. Tell #1. The competitor panels (Otterly, Profound) sit on tinted/contrasting grounds so their elevation is legible.
**Fix (M1).** Either (a) put the card on a warm/wash ground (`--color-surface-warm` page bg with a white card) so the elevation reads, or (b) bump this single focal to `.card-console-hero` (`--shadow-card-hero`) since it is the one focal of the screen. Right now the only TIER-2 element doesn't look like it has a tier.
**File:line.** `_post-payment-scan.tsx:594` (`card-console` — consider `card-console-hero`); `:568` page bg is `--color-surface` (pure white) — switch to `--color-surface-warm` to let the card lift.

---

## P2 — substantive

### P2-1. Top dead-space pushes the focal below optical center (M12 rhythm / M10)
**Problem.** In the render the violet "BRIGHT SMILE DENTAL" eyebrow starts ~270px down and the card ~310px down, leaving a large unintentional gap at the very top of the viewport before any content. The `justify-center` on a `min-h-full` column produces this float.
**Why.** Reads as "content fell to the middle by accident," not designed. M12 asks for varied, intentional whitespace; this is one accidental global gap.
**Fix.** With the P1-1 split layout, anchor content with intentional top padding rather than vertical centering; let the right-rail value preview give the page a reason to fill top-to-bottom.
**File:line.** `_post-payment-scan.tsx:573` (`justify-center`).

### P2-2. Serif beat and the only blue CTA are invisible in this state (unverifiable M5 / brand promise)
**Problem.** The captured `in_progress` state has no Fraunces beat and no blue button — both live only in the `complete` phase (`CompleteBlock`, `:361–417`). The progress-bar fill is the only blue on screen, and it is thin. So in the most-seen state, the "blue = you" half of the signature law is barely present and the warm-minimal serif soul (M5) is absent.
**Why.** Tell #6 (serif beat absent) and tell #8 (blue not spatial) both apply to the state a user actually stares at for the duration of the scan. The payoff is real but deferred to a state that may flash by.
**Fix.** Acceptable for the serif to live in `complete`, but consider a single restrained editorial beat in the running state too (the source already proves the team can do it well). At minimum verify the `complete` state renders the Fraunces "ready." correctly — capture it.
**File:line.** `_post-payment-scan.tsx:371–386` (complete-only serif), `:294–299` (the only blue in-progress, a thin bar).

### P2-3. Engine pills are violet-on-violet floating with no spatial anchor (M6 partial)
**Problem.** The three engine pills (ChatGPT / Gemini / Perplexity) render as violet-tinted pills correctly attributing the agents — good color law — but they float in the card body between the sub-line and the bar with no grouping hairline or "engines" label. They read as decorative tags, not a live instrument.
**Why.** M6 wants the agent zone glanceable as *structure*; here violet is a per-pill token detail (tell #8) rather than a structured zone. Profound/Otterly anchor such elements in a labeled module.
**Fix.** Give the engine row a quiet eyebrow ("Scanning" / a violet-hairline top) or fold it into the right-rail crew zone so the violet reads as a spatial region, not three loose chips.
**File:line.** `_post-payment-scan.tsx:340–349` + `EnginePills` `:156–187`.

### P2-4. Reassurance footer floats far below with a large unexplained gap
**Problem.** "This page updates automatically…" sits at `mt-10` below an empty drafts region in this state (drafts not yet revealed), leaving the line stranded in white space mid-page.
**Why.** Reads unfinished — a caption orphaned far from its card. M12 (relationship-based rhythm) violated.
**Fix.** Tie the footer to the card cluster (tighter gap) until drafts exist; in the split layout it belongs under the left ritual column.
**File:line.** `_post-payment-scan.tsx:619–623`.

---

## P3 — nice-to-have

### P3-1. Progress bar is a thin generic track
The 1.5px bar (`:294`) is the minimum-viable progress UI. Against the instrument-grade ambition in the file's own comments, consider a touch more presence (height, a subtle violet→blue tip, or a step-segmented track tied to the engine count) — without crossing into looping motion.
**File:line.** `_post-payment-scan.tsx:290–312`.

### P3-2. Eyebrow uses a tiny dot glyph; no warm character anywhere
This is a first-run / loading moment — one of the four sanctioned places for a warm character glyph (M8, brand law). The violet dot at `:580` is the only ornament. A small on-brand crew glyph would lift the human warmth the warm-minimal soul asks for.
**File:line.** `_post-payment-scan.tsx:576–591`.

### P3-3. No signature M4 detail (micro-sparkline) present
The rubric's signature detail (engine micro-sparkline) doesn't appear here. Defensible — there's no historical data mid-first-scan — but the screen currently has zero signature detail (tell #4). The progress/engine ritual is the closest thing; make it feel proprietary so this isn't "any SaaS loading screen."

---

## Per-state notes

**populated-desktop (the one captured — actually the `in_progress` phase, ~60%):**
- Correct: violet eyebrow color/law, blue progress fill, mono `60%`, clean InterDisplay headline, violet engine pills (color law respected — violet on agents, not on a button).
- Wrong: dead-center single card in ~70% empty white (P1-1); the figure is recessive not TIER-1 (P1-2); flat card depth (P1-3); top dead-space (P2-1); orphaned footer (P2-4). This is the dominant state by dwell time and it is the weakest composition.

**empty / waiting (NOT captured):** `WaitingBlock` (:467) — "Confirming payment…" with pulse dots. Inherits the same centered-void layout problem. Capture it.

**complete (NOT captured) — HIGH PRIORITY to capture:** `CompleteBlock` (:361) carries the Fraunces "ready." serif beat (M5) and the only blue CTA "Go to your workspace." This is the page's actual craft payoff and its hierarchy/serif could not be visually verified. Must be screenshotted before any PASS.

**error (NOT captured):** `ErrorBlock` (:423) — two-tier recovery (blue CTA + "Contact support" link), copy reassures payment went through. Source looks correct (M8 compliant) but unverified visually.

**drafts-revealed (NOT captured):** `DraftsPanel` (:500) renders TIER-3 `card-inset` draft cards with violet hairline + "Drafted by the crew" label — the entire M6 violet-structure argument and the content that would justify a right-rail. Currently stacked *below* the card (P1-1); never seen populated. Capture an in_progress state with drafts visible.

**mobile 375px (NOT captured):** unverified. The single-column `max-w-[640px]` will likely be fine vertically but the same void problem applies; the proposed split must collapse cleanly.
