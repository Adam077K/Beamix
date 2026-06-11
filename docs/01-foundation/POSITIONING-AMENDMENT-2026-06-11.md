# Positioning Amendment — Full Product, Agents + Done-For-You Core

**Date:** 2026-06-11
**Author:** CEO session (ceo-surface-full-product)
**Status:** Active — amends, does not replace, the 2026-05-23 agency-pivot positioning
**Scope note:** This is a *positioning* amendment only. Pricing, packaging, tiers, and credit/entitlement economics are explicitly OUT OF SCOPE and unchanged by this document (Adam, 2026-06-11: "don't talk about this now").

---

## What changed

Beamix is repositioned from a **hidden** done-for-you agency into a **full product that can be used self-serve**, whose **core remains the agents and the all-done-for-you experience**.

The 2026-05-23 agency pivot (`docs/08-agents_work/sessions/2026-05-23-ceo-agency-pivot-grill.md`, `docs/01-foundation/VISION.md`) locked the product as: *"NOT a tool. Tooling is hidden. No agent names, no credit counters. Customers don't manage agents."* That framing solved a real problem (time-poor buyers want outcomes, not tools) but produced a side effect: the product **feels empty**, because all the work happens in the background with no visible surface.

This amendment **softens** that framing. It does not reverse the agency core.

### Before (2026-05-23, still partly true)
- The product is the outcome; tooling is hidden.
- Customer sees only: outcomes dashboard, weekly digest, approval queue.
- No agent names surfaced. No manual operation.

### After (2026-06-11)
- The product is a **full, feature-rich self-serve tool** AND a done-for-you service. Both, layered.
- Every agent gets a **visible, manually-operable surface** — the customer can open a tool page, supply inputs, run the work themselves, and review/edit output.
- The **agents and the all-done-for-you experience remain the core/soul** — the premium, default, and most-loved way to use Beamix. The self-serve surface sits *on top of* the same machinery; it does not replace it.
- **Agent names become user-facing** on the self-serve surface (this relaxes the 2026-05-23 "no agent names" rule for the in-product tool layer; the digest/concierge voice canon is unaffected).

---

## The three operating modes (conceptual spine)

This is the mental model the whole product now organizes around. (Mechanics/entitlement/pricing deferred.)

1. **Manual mode** — the customer opens a tool page, supplies/edits inputs, clicks "Run," watches it execute, reviews/edits the output, and approves/publishes. This is the layer that makes the product feel full and real. The customer does the labor.
2. **Autonomous seat (included)** — a limited number of agent runs that fire automatically on a schedule/trigger without the customer driving them. Scaffolding already exists in code (`dailyCap` per agent in `apps/web/src/lib/agents/config/registry.ts`).
3. **Done-for-you (core/premium)** — uncapped autonomous operation across all agents plus the existing approval / weekly-digest / traceability concierge layer. This is today's locked product, kept as the soul of Beamix.

Every tool page carries a mode toggle: **"Run it myself"** vs **"Let Beamix handle it."**

---

## Why this is additive, not a reversal

- The agency machinery (11-agent registry, `POST /api/agents/run`, approval gate, digests, traceability) is **untouched and remains the engine**.
- The self-serve surface is **new front-end views over the same backend** — it exposes what already exists rather than building a parallel product.
- The done-for-you experience stays the **default and the premium**. Self-serve is the on-ramp and the "feels full" layer, not the destination.
- Code already leans self-serve: the registry uses `discover`/`build`/`scale` tier names with per-agent daily caps — i.e. a metered, operable model. This amendment aligns the *positioning* with what the *code* already assumes.

---

## What this does NOT change
- The done-for-you agency as the core value proposition and premium experience.
- The approval-gate mechanic (YMYL content stays gated; auto-publish stays auto).
- Pricing, tiers, credits, entitlement economics — all deferred, unchanged.
- The 60-day money-back guarantee, ICP, or GTM motion.

---

## Downstream artifacts
- Competitor teardown → `docs/02-competitive/teardown-2026-06/`
- Manual-tool surface specs → `docs/04-features/specs/` (incl. `MANUAL-MODE-MODEL.md`)
- Build dispatched separately (not this session).
