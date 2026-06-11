# Spec — Prompt / Query Explorer

**Priority:** Tier 1 #1 (highest-impact net-new) · **Route:** `/prompts` (new) · **Backing agent:** `query_mapper`
**Parent:** `MANUAL-MODE-MODEL.md` · **Competitor parity:** Profound Prompt Volumes, Athena Answer Engine Insights, Otterly Prompts page

## Why
Every competitor's core screen is prompt management; Beamix has zero prompt UI today. This is the single biggest "feels empty" fix. `query_mapper` already produces the prompt/query intelligence internally — this surfaces and makes it operable.

## What the user can DO (manual surface)
- See the list of tracked prompts/queries for their business (text, target engines, last result, mention/citation status).
- **Run Query Mapper themselves** ("Run it myself") to discover/expand prompts from a seed keyword, URL, or topic.
- Add / edit / remove / tag tracked prompts (Branded / Non-branded / funnel stage).
- View **query fan-out** (sub-queries an engine expands a prompt into) and **intent classification** per prompt.
- See **uncited prompts** (competitor ranks, you don't) — reuse the W6 contrastive gap-list data.
- Promote a discovered prompt into the tracked set with one click.

## Panels
1. Tracked-prompt table (text · engines · mention · position · sentiment · tag · last-run) — sortable/filterable.
2. Run control (mode toggle: Run it myself / Let Beamix handle it) + inputs (seed/URL/topic, `customInstructions`).
3. Live pipeline ledger (`query_mapper` is 5-step: plan→research→do→qa→summarize) — reuse scan-ledger visuals.
4. Per-prompt drawer: fan-out tree, intent, the engines' raw answers (reuse scan evidence capture), competitor co-citation.

## Wiring
- Trigger: `POST /api/agents/run` with `{ agentType: 'query_mapper', businessId, queryCluster?, customInstructions?, targetUrl? }` (already supported).
- Output: `query_mapper` is an internal report (`requiresApproval: false`) — render directly, no approval queue.
- Reads: scan results (`scan_engine_results`), W6 gap-list, `agent_jobs` for run status.

## States (all 4 required)
- Empty: no prompts yet → "Discover your prompts" CTA running query_mapper.
- Loading: skeleton table + live ledger.
- Populated: full table + drawers.
- Error: run failed (surface job error), daily-cap exhausted (query_mapper cap is unlimited, so cap state rarely fires).

## QA tier
Lite/Full (read + agent-trigger; no DB migration). Standard P1/P2 review.
