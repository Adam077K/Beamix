# Spec — Automation Center (the mode hub)

**Priority:** Tier 2 #7 · **Route:** `/automation` (stub → real) · **Backing:** all 11 agents (`dailyCap` scaffold)
**Parent:** `MANUAL-MODE-MODEL.md` · **Competitor parity:** Profound Background Agents, Athena self-improving workflows

## Why
`/automation` currently 5-line redirects to `/dashboard`. This page is the literal embodiment of the new positioning: **"do the labor yourself OR let Beamix do it."** It is where the three modes (Manual / Autonomous-seat / Done-for-you) become a control surface.

## What the user can DO
- See every agent as a row with its current mode: **Manual** (off — user runs it) / **Autonomous** (auto-runs within allotment) / **Done-for-you** (uncapped, concierge).
- Toggle an agent between Manual and Autonomous.
- See remaining autonomous-seat allotment per agent (from `dailyCap`).
- Configure schedule/trigger for autonomous agents (basic: cadence; advanced DAG triggers are deferred).
- Jump to any agent's manual tool page ("Run it myself now").

## Panels
1. Agent grid: display name · current mode · remaining allotment · last auto-run · [Manual ⇄ Autonomous] toggle · [Open tool] link.
2. Mode explainer (the 3-mode model, inline).
3. Schedule config drawer (per autonomous agent).
4. Upsell affordance: agents/runs beyond the user's allotment show "Let Beamix handle it" → done-for-you (entitlement/pricing mechanics DEFERRED — render as a non-functional affordance or feature-flag in v1).

## Wiring
- Reads registry (`AGENT_REGISTRY`) for agent list, caps, tiers.
- Mode/schedule state: needs a new lightweight `agent_automation_settings` store (per business × agent). **This is the one place a small migration is likely** — flag for database-engineer; keep it additive.
- Autonomous runs: a scheduler fires `POST /api/agents/run`. v1 can stub the scheduler and ship the control UI first.

## States
Empty (no agents enrolled) · Loading · Populated · Error.

## QA tier
Full → Irreversible IF the migration + any allotment-gating lands (entitlement-adjacent). Ship the read-only control UI at Full first; gate the persistence migration separately.

## Deferred (with pricing)
Actual autonomous-seat *entitlement enforcement* and the done-for-you upsell mechanics — deferred with the pricing workstream. v1 = the control surface + mode concept.
