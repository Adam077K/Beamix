# Spec — Schema Generator UI

**Priority:** Tier 1 #3 (fast credibility win) · **Route:** `/schema` (new) · **Backing agent:** `schema_generator`
**Parent:** `MANUAL-MODE-MODEL.md` · **Competitor parity:** Profound/Athena schema via Action Center; Otterly audit-only

## Why
`schema_generator` is free, auto-publishes, and is one of the smallest surfaces to expose — a fast win that makes the product feel concrete. Generate JSON-LD, preview it, copy/inject.

## What the user can DO
- Pick a page/entity type → **Run Schema Generator** → preview generated JSON-LD → copy, download, or inject via publishing integration.
- Re-run with edits. Daily cap 20/tier.

## Panels
1. Input: URL + schema type (Organization, LocalBusiness, FAQ, Product, Article…), `customInstructions`.
2. Run control + mode toggle.
3. Live 3-step ledger.
4. Output: syntax-highlighted JSON-LD + validity check + "Copy" / "Download" / "Inject via integration" (reuse Publishing Integrations).

## Wiring
- Trigger: `POST /api/agents/run` `{ agentType: 'schema_generator', businessId, targetUrl }`.
- `requiresApproval: false` (auto-publish) — render output directly; "Inject" uses existing publishing-integration config.
- Cap: 20/day all tiers — show counter.

## States
Empty · Loading · Populated (JSON + actions) · Error (cap / run fail).

## QA tier
Lite (read + free agent; no gate, no migration).
