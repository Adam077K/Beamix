# Beamix Craft System — the "de-AI" rubric

*Synthesized by the T5 design workflow `wf_57c0d5b6-c6a` (2026-06-11) from the locked reference
folders. This is the rubric every screen's craft-elevation polish applies + what design-critic
enforces via Playwright. Stays 100% inside the warm-minimal vision, token system, and
blue=you / violet=agents law. NO new tokens, NO new colors.*

## Why: the gap is uniformity, not the system
The product has the right tokens + structural intent but applies them **uniformly** — every card
the same depth, every heading the same weight, literal N-equal-column grids, no signature detail,
no serif beat, dead-center symmetry. That uniformity is what reads "AI-generated." The fix is
intentional hierarchy, asymmetry, depth-staging, one editorial serif beat, and one signature detail.

## The 8 AI-generated tells (what to kill)
1. **Uniform depth** — every surface `.card-console`; hierarchy is told, not felt.
2. **Literal N-equal grid** (e.g. `sm:grid-cols-3` of identical cards) — the canonical AI layout.
3. **Evenly-weighted typography** — ~2 type registers repeating flatly; nothing commands/recedes.
4. **Zero signature detail** — nothing a template wouldn't have.
5. **Dead-center symmetry** — full-width stacks; bare centered icon-in-circle empties.
6. **Serif beat absent** — Fraunces (the warm-minimal soul) used nowhere.
7. **Flat/absent motion** — near-zero choreography (the generic state), not minimal-with-intent.
8. **Blue/violet as a token detail, not spatial** — the you-vs-agents promise invisible at arm's length.

## The 12 craft moves (apply per screen)
- **M1 Depth staging** — 3 felt tiers: TIER-1 hero `--shadow-card-hero` (one focal/screen); TIER-2 standard `--shadow-card`; TIER-3 recede = new `.card-inset` (transparent/surface-warm, 1px border, NO shadow). Never two hero cards.
- **M2 Type contract (4 enforced steps)** — STEP-1 hero figure 64px Geist Mono -0.03em tabular; STEP-2 verdict 30px InterDisplay-Medium -0.02em (raise from 26px); STEP-3 eyebrow 12px Inter-600 uppercase tracking-[0.08em] #9CA3AF; STEP-4 body 13–15px. Exactly one STEP-1/screen; gaps must be obvious.
- **M3 Intentional asymmetry** — dominant column + narrower rail, or weighted 2-up; real content sets the ratio. Kill N-equal grids.
- **M4 Signature detail** — the engine **micro-sparkline**: 24px-tall ~64px SVG polyline of last ~5 points in the score-band color; flat 1px `#E5E7EB` baseline when null (never fake data). Transfers to any data surface.
- **M5 Serif beat (one/screen)** — Fraunces italic on the **verdict word only** (e.g. the band label "Excellent"), inline in a sans sentence. NEVER in chrome (nav/labels/rows/buttons).
- **M6 Violet Structure** — the agent zone reads different at arm's length: `--color-agent-tint` (#EEEAFD) ground OR a 1px `rgba(110,86,240,0.12)` hairline + violet top-accent. User surfaces stay white/neutral. Violet NEVER on a button.
- **M7 In-cell data shading** — number-over-label extreme hierarchy (big mono figure dominates, `/100`+trend+sparkline recede); row hover ground `#F4F6FA` + left status-color hairline.
- **M8 Designed empty (two-tier recovery)** — titled context + one-line specific next step + TWO-tier CTA (primary blue pill + quiet secondary link) + warm character glyph (moments-only). Never a bare centered icon. Errors always name a real recovery action.
- **M9 Entrance choreography** — first paint: surfaces fade-up 8px in priority order, ~40ms stagger, ≤200ms ease-out, behind `prefers-reduced-motion`. Hover lifts TIER-2 one shadow notch. No looping motion outside the sanctioned free-scan reveal.
- **M10 Progressive disclosure (the spine)** — strict priority order; one focal above the fold; detail/history earned by scrolling. Don't front-load all surfaces at equal weight.
- **M11 Mono for truth** — every real number (scores, counts, deltas, relative times) is Geist Mono tabular-nums; all prose Inter.
- **M12 Hairline editorial rhythm** — vary whitespace by relationship (tight within a cluster, wide between); eyebrow labels sit on hairlines. Not one global `space-y-8`.

## design-critic checklist (per screen, Playwright screenshot → PASS | NEEDS_WORK | CRITICAL_ISSUES)
(a) exactly one TIER-1 focal + one Fraunces beat + one signature detail; (b) the 4-step type contract is visibly stepped; (c) no N-equal grid; (d) violet zone glanceable + violet never on a button; (e) all 4 states designed with two-tier recovery; (f) every number is mono; (g) the 8 tells above are all absent.

## Dashboard exemplar (first application — full spec)
See `wf_57c0d5b6-c6a` Part 4 (or the session). Headlines: FoundingCohort → TIER-3 inset; hero keeps the `[1fr_360px]` split (good asymmetry), 64px mono score, 30px verdict + Fraunces band word; engine breakdown → weighted 2-up (lowest-scoring engine = wider TIER-2 focus card, others TIER-3 insets) each with the micro-sparkline; AgentActivityPanel gets the Violet Structure + Dia live-tool-call ledger rows; M12 rhythm (hero → 40px → engines → 48px → wins); staggered entrance; all 4 states with two-tier empties. New CSS: `.card-inset` + a fade-up keyframe (additive, no new colors).

## ⚠️ Blocker for the design-critic visual loop (route to CTO)
The local dev dashboard screenshot fails: `globals.css --font-family-display` falls back to **Inter Tight**, and Next/**Turbopack** throws `Module not found: @vercel/turbopack-next/internal/font/google/font` for `inter_tight`. The **production build is fine** (verified exit 0 many times; prod dashboard renders) — this is a **turbopack-dev-only** font issue. So: run design-critic screenshots against **prod (app.beamixai.com) logged in as the demo/qa1 account**, OR run local dev with **webpack** (`next dev` without `--turbopack`). Separately worth fixing the font import so turbopack dev works.

## Screens to elevate (priority)
dashboard (anchor/exemplar) → scan results (`/scan/[scan_id]`) → approvals → digests → traceability → settings → auth (login/signup) → discovery/onboarding.
