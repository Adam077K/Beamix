---
session: ceo-surface-full-product
date: 2026-06-11
role: ceo
task: Surface the Full Product — competitor teardown + self-serve reframe strategy
branch: docs/surface-full-product-2026-06-11
tier: n/a (docs + strategy; no code)
qa_verdict: n/a (no code shipped this session)
workers_spawned: 3 (researcher ×3, parallel background)
---

# CEO Session — Surface the Full Product

## Request (Adam)
Two threads: (1) "update the GitHub to the recent one"; (2) research top competitors (Profound + others), inventory every page/feature, and plan to add them so Beamix becomes a FULL product usable self-serve — manually operable features with autonomous seats — while the agents + all-done-for-you stays the core (the expensive ~$1000+ experience). Reason: the product "feels empty because everything happens in the back." Pricing explicitly out of scope this session.

## Decisions locked (via AskUserQuestion)
1. Git: sync workspace to latest main; preserve the local MCP commit separately.
2. Strategy: full self-serve product, agents + done-for-you stays the CORE. Not a pricing exercise.
3. Scope: research + strategy plan (no code built).
4. Competitors: Profound + AthenaHQ + Otterly.

## What shipped this session (all docs, no code)

### Workstream 0 — GitHub sync
- Synced worktree to `origin/main` (`679656d`); cut new branch `docs/surface-full-product-2026-06-11`.
- Local commit `850cb85` (drops Supabase MCP `--read-only` → agents can write to DB) preserved on branch `ceo-2-1781190242`. **OPEN for Adam: deliberate yes/no — security-relevant.**

### Positioning + breadcrumbs
- `docs/01-foundation/POSITIONING-AMENDMENT-2026-06-11.md` — full self-serve product, agents + DFY core; softens (not reverses) the 2026-05-23 "NOT a tool" lock; 3 operating modes; no pricing.
- `DECISIONS.md` + `docs/00-brain/log.md` entries appended.

### Workstream A — competitor teardown (`docs/02-competitive/teardown-2026-06/`)
- `PROFOUND-TEARDOWN.md` — 5 products, ~47 manually-operable tools, 15 distinctive features.
- `ATHENAHQ-TEARDOWN.md` — Olympus + Action Center + Content Agents + ACE; 28 operable tools.
- `OTTERLY-TEARDOWN.md` — monitoring-heavy; the "I see it, now what?" gap quantified (~95% monitor / 5% act).
- `FEATURE-INVENTORY-MATRIX.md` — master cross-tab (every feature × 3 competitors × Beamix-has × backing agent × gap).
- `GAP-TO-BUILD.md` — ranked backlog (Tier 1/2/3 + explicit defer list).

### Workstream B — reframe specs (`docs/04-features/specs/`)
- `MANUAL-MODE-MODEL.md` (spine) + 8 page specs: prompt-explorer, content-editor, schema-generator-ui, run-history, competitor-tracker, automation-center, citation-offsite-manager, blog-studio.

## Key strategic finding
Beamix's content/action layer (optimize, FAQ, schema, blog, citations) — which competitors charge enterprise prices for — Beamix **already has and ships, but hidden**. The reframe is mostly PRESENTATION over existing backend (`/api/agents/run` + 11-agent registry + approval queue + digests + traceability all exist). The genuinely net-new work is the monitoring/intelligence front-ends (prompt explorer, competitor tracker) whose *data* mostly exists from scan + query_mapper + performance_tracker. Beamix is already past Otterly's "now what?" gap — the job is to make that visible without losing it.

## Out of scope (deferred)
Pricing/packaging/credits/entitlement (Adam); board meeting; data-moat features (Profound prompt-volume panel, DAG builder, Shopping, crawler analytics, MCP copilot); the actual page builds.

## Open items for Adam
1. **Decide on `850cb85`** (MCP write access) — keep, push, or drop.
2. **Next session = build dispatch.** Tier 1 specs (prompt-explorer, content-editor, schema-ui, run-history) are dispatch-ready to CTO. Recommend running an Otterly + Profound free-trial screenshot pass to fill the LOW-confidence in-app IA gaps before the competitor-tracker build.
3. Pricing/packaging is the eventual unlock for the autonomous-seat/done-for-you entitlement mechanics (Automation Center v1 ships the control surface without it).
