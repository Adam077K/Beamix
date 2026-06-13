# Spec — Run History / Output Archive

**Priority:** Tier 1 #4 (cheapest "feels lived-in" win) · **Route:** `/archive` (stub → real) · **Backing:** `agent_jobs` table
**Parent:** `MANUAL-MODE-MODEL.md` · **Competitor parity:** Profound Agents history, Athena Action Center log, Otterly report history

## Why
`/archive` currently 5-line redirects to `/approvals`. A real run-history page — every manual + autonomous agent run, re-openable — makes the product feel used and gives the self-serve user a sense of accumulated work. It is essentially one query over the existing `agent_jobs` table.

## What the user can DO
- Browse all past agent runs (manual + autonomous) — agent, trigger (manual/auto), status, started/finished, output summary.
- Filter by agent, status, mode, date.
- Re-open a run → see its full output (route to the originating tool page's output view or a read-only drawer).
- Re-run from history ("Run again").

## Panels
1. Run table: agent (display name) · mode (Manual / Autonomous) · status (queued/running/done/failed) · timestamp · cost (if surfaced) · output snippet.
2. Filters.
3. Run drawer: full pipeline trace + output + link to the artifact (approval item / published URL / report).

## Wiring
- Reads `agent_jobs` (existing: `id, agent_type, status, created_at, completed_at`). No migration for v1 (mode/trigger can be inferred or added as a nullable column later).
- Re-run: `POST /api/agents/run` with the stored params.

## States
Empty (no runs) · Loading · Populated · Error.

## QA tier
Lite (read-mostly; re-run reuses existing endpoint).
