# Beamix Design Vision

**Status: CANONICAL — single source of truth for all Beamix product design.**
**Locked:** 2026-06-05 (founder grill, 8 decisions). **Supersedes:** the 2026-06-03 `design-audit/DESIGN-DIRECTION.md` (mined, not discarded) and the archived April-2026 design docs (`docs/_archive/design-april-2026/`).
**Scope:** the product app (Next.js dashboard + funnel). The Framer marketing site is out of scope.
**Reader:** every designer agent (`product-designer`, `design-critic`, `design-polisher`) reads this before any work. `DESIGN-WORKFLOW.md` is the *how* (pipeline); this is the *what* (vision + laws).

> One line: **Beamix is a quiet, expensive console that does the work for you — restraint as the frame, warmth as the soul. Blue is you; violet is the agents. One blue, zero apology, calm motion, real numbers.**

---

## 1. Soul — warm-minimal

Restraint is the **frame**; warmth is the **soul**. The structure is disciplined (white canvas, editorial headings, one structural blue, generous whitespace — Linear / Attio / Anthropic-console). The warmth is layered on top (a warm off-white, selective color, a character in the right moments, an editorial serif beat). 

- **Not austere.** Pure dev-tool coldness reads wrong to the customer (dentists, lawyers, founders). 
- **Not maximalist.** Loud color and motion kill the premium calm and the "already on it" confidence.
- **Added color is punctuation, never identity.** The product still reads unmistakably blue-and-white.

When an SMB owner lands here the gut reaction must be *"this thing is already on it"* — never *"what am I supposed to do?"* Every empty screen sells the next moment; it never apologizes for being unfinished.

## 2. The laws (non-negotiable primitives)

These are enforced *exactly* by `design-critic`. A build that breaks one is BLOCKED regardless of how good it looks. (Composition is free — see §8.)

1. **`#3370FF` is the only primary/CTA color.** One primary action or hero metric per surface gets blue. Nothing else competes for it.
2. **Blue = you, violet = the agents.** (§3) Violet never appears on a button.
3. **Type:** product headings are InterDisplay-Medium 30–32px / −0.02em (§4). Headings state, never whisper. Body never below 16px (iOS zoom guard).
4. **8pt grid.** `rounded-lg` (8px) product utility radius. Lucide icons, single strokeWidth.
5. **All four states designed** for every data surface: loading, empty, error, success. Empty sells; error always has a recovery CTA. No stock line-art in a void; no "refresh the page."
6. **Motion is minimal** (§5). `prefers-reduced-motion` fallback always.
7. **No "Coming Wave 1" / roadmap language on any customer-facing surface.** Ever.
8. **`beamix-brand-quality-bar` wins** over any reference's fonts or colors. Steal the move, never the palette.

## 3. Color system — full palette, strictly role-scoped

Base unchanged: white + one blue. Everything added is locked to a role and **forbidden elsewhere**. Full token table lives in `BRAND_GUIDELINES.md`; the laws live here.

**The signature law — blue = you, violet = the agents.**
- **Blue `#3370FF`** = *your* actions: primary CTAs, links, active nav, focus, the hero metric.
- **Violet `#6E56F0`** = *the agents at work*: agent runs, automations, AI chat, the scan-engine diagram, the score-reveal gradient. The reader learns the product's promise every time they see the split. **Violet is never a button.**

| Role | Token(s) | Rule |
|------|----------|------|
| Primary / CTA | `accent #3370FF`, `accent-tint #EEF2FF`, `accent-deep #2454D6` | The only call-to-action color. |
| Agent / AI | `violet #6E56F0`, `violet-tint #EEEAFD` | Agent/automation surfaces + the one gradient `#3370FF→#6E56F0` (hero/AI/score only). Never a button. |
| Surface | `surface #FFFFFF`, `surface-warm #F7F6F2`, `surface-muted #F4F6FA` | Warm off-white for warmth; never grey-on-grey-on-grey wash. |
| Ink | `ink #0A0A0A`, `ink-warm #16140F`, `muted #6B7280`, `border #E5E7EB` | — |
| Washes (bg only) | `wash-sky #EAF0FB`, `wash-lavender #ECE7FB`, `wash-blush #FBEAF0`, `wash-mint #E6F5EE` | Low-opacity hero/empty backgrounds + illustration fills only. Never on text, buttons, or data. |
| Data-viz | `data-1 #3370FF`, `data-2 #6E56F0`, `data-3 #06B6D4`, `data-4 #10B981`, `data-5 #F59E0B`, `data-6 #EF4444`, `data-grid #EAEAEA` | Default to the blue/violet pair + desaturated tints. Pastel multi-band, not loud. |
| Status pills | info `#3370FF`/`#EEF2FF` · agent `#6E56F0`/`#EEEAFD` · positive `#0E9E6E`/`#E6F5EE` · warning `#B8770B`/`#FDF3E0` · critical `#DC2626`/`#FDECEC` · neutral `#6B7280`/`#F3F4F6` | Tinted ground + saturated text. Never loud fills. |
| Dark panels | `panel-dark #14140F`, `panel-navy #0E1424` | Select contrast sections (testimonials, scan-engine diagram, dark hero). Fraunces allowed here. We take the dark-panel *move*, never a reference's maroon/plum. |

Score ring + rank deltas keep cyan→green→amber→red. Contrast: any text on `surface-warm` or a wash must still clear WCAG AA against `ink`.

## 4. Typography

InterDisplay (display/headings) · Inter (body/UI) · **Fraunces (editorial moments — see below)** · Geist Mono (scan data, scores, JSON, IDs).

| Element | Spec |
|---|---|
| Page H1 | InterDisplay-Medium · **30–32px** (console register, not 40px marketing) · `-0.02em` · `leading-[1.1]` · `#0A0A0A` |
| Subtitle | Inter 400 · **15px** · `#6B7280` · `leading-[1.5]` · `max-w-[480px]` |
| Eyebrow | Inter 600 · **12px** · uppercase · `tracking-[0.08em]` · `#9CA3AF` |
| Gaps | H1→subtitle 8px · subtitle→content 32px |
| Mobile | Hero 40→30 · H1 32→28 · H2 28→22 · **body stays 16px** |
| Scan data | Geist Mono — makes numbers feel *true* |

**Serif — disciplined expansion.** InterDisplay does all product headings. Fraunces gains editorial *moments* only: hero display, report covers, the score-reveal verdict, and a single mixed sans+italic-serif headline device (the Dia move). **Never** in product UI chrome (nav, cards, tables, forms).

## 5. Motion — minimal, transitions only

Calm product. Quiet `ease-out` transitions and hovers everywhere; no choreographed set-pieces; `prefers-reduced-motion` fallback always.

**The one sanctioned exception: the free-scan score reveal** (animated ring count-up + engine-by-engine scanning ledger) on the acquisition front door — it is the dopamine moment and is already shipped (PR #130). Nowhere else in the product animates beyond transitions.

## 6. Character — in moments only

A character personality appears **only** at empty states, first-run, loading, and 404 — animated, warm, on-brand (near-black line + accent fills). **No persistent on-screen companion.** This honors the locked `project_beamie_deferred` decision (animations yes, companion later). Designer agents may use character in these moments and nowhere else.

## 7. Density & surfaces

Generous macro-whitespace; calm density. Scan data and tables read dense yet calm (Geist Mono, 8pt rhythm). Cards sit on the page with a tight two-layer tinted shadow (the Stripe move) — never flat, never harsh `shadow-md`. One focal point per screen (the hero metric or the primary action); everything else recedes.

## 8. Designer-agent operating model — tight system, free composition

- **Enforced exactly (the critic BLOCKS on these):** every primitive in §2, the color roles in §3, the type scale in §4, 8pt spacing, four-states, reduced-motion. These are non-negotiable.
- **Free, graded on craft-parity (the critic guides, doesn't block on rule-compliance):** *composition* — how a given screen arranges the primitives toward the warm-minimal soul. Agents synthesize **original** Beamix-language layouts (vibe, not blueprint; steal the move, never the layout) and may never break a primitive to do it.
- **`product-designer`** builds first-paint from references + this vision. **`design-critic`** grades craft-parity & feeling vs the references AND hard-checks the §2 laws; verdict `PASS | NEEDS_WORK | CRITICAL_ISSUES`; copy-fidelity grading is forbidden. **`design-polisher`** adds craft density inside the loop.

## 9. Reference system

- **Soul:** `references/_product-feel/` — LOCKED at 6 (PostHog, Anthropic, Dia, Attio, Raycast, Linear). Loaded on every screen build.
- **Per-screen + components:** `references/dashboard/`, `home/`, `onboarding/`, `_components/[type]/`, all contracted in `references/CATALOG.md`. The 2026-06-03 board's specific craft-takes (Stripe card-finish, Vercel deploy-log, Credit Karma score-reveal, Superhuman first-run, Linear heading register) are **absorbed** into those per-surface contracts — nothing lost.
- **The law that travels with every reference:** color, fonts, brand are never copied — only the named move. Dark references become white-and-blue Beamix. See `references/_components/README.md`.

## 10. Doc canon

- **This file is the single source of truth.** `BRAND_GUIDELINES.md` holds the full token table + voice; `DESIGN-WORKFLOW.md` holds the pipeline; `references/` holds the visual contracts; `PALETTE-PROPOSAL.md` is now ratified into §3.
- **Superseded (mined, not discarded):** `docs/08-agents_work/design-audit-2026-06-03/DESIGN-DIRECTION.md` — its P1 diagnoses + type specs are folded in here.
- **Archived:** the April-2026 design working docs → `docs/_archive/design-april-2026/`.

## 11. Provenance

Locked via founder grill 2026-06-05. The 8 decisions: (1) warm-minimal soul · (2) full role-scoped palette · (3) blue=you/violet=agents · (4) character-in-moments · (5) disciplined serif · (6) minimal motion + free-scan exception · (7) tight-system/free-composition · (8) consolidate-supersede-archive. See `.claude/memory/DECISIONS.md` (2026-06-05 entry) and the session file.
