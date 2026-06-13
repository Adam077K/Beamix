# Spec — Competitor Tracker

**Priority:** Tier 2 #6 · **Route:** `/competitors` (stub → real) · **Backing agents:** `query_mapper` + `performance_tracker`
**Parent:** `MANUAL-MODE-MODEL.md` · **Competitor parity:** universal — Profound Share of Voice, Athena Competitors, Otterly Brand Reports

## Why
`/competitors` currently 5-line redirects to `/dashboard`. Competitor tracking is a universal table-stakes screen and the data largely exists (scan results + W6 contrastive gap-list already compute competitor presence).

## What the user can DO
- Add / remove competitors (manual + auto-suggest from scan co-citation data).
- See **Share of Voice** (you vs each competitor, per engine).
- See **gap analysis** — prompts/topics where a competitor is cited and you're not (reuse W6 contrastive gap-list).
- See **co-citation map** — who appears alongside you.
- Click a gap → dispatch the relevant agent (e.g. content_optimizer / faq_builder) — links into Content Editor.

## Panels
1. Competitor list (add/remove, auto-suggested chips).
2. Share-of-Voice chart (per-engine, over time).
3. Gap table (prompt/topic · competitor-cited · you-cited · suggested action → tool page).
4. Co-citation view.

## Wiring
- Reads: `scan_engine_results`, W6 gap-list, `query_mapper` output for prompt-level competitor presence.
- Competitor config: stored on the business (existing `businesses` record / brand settings).
- "Dispatch action" deep-links to `/content` or `/prompts` with prefilled inputs.

## States
Empty (no competitors) · Loading · Populated · Error.

## QA tier
Full (aggregates measurement data; may add a competitors column to business config — confirm if migration needed).
