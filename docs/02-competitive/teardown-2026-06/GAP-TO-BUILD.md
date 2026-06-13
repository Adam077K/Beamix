# Gap-to-Build — Ranked Manual-Surface Backlog

**Date:** 2026-06-11
**Derived from:** `FEATURE-INVENTORY-MATRIX.md` (filtered to `missing` + `partial`, manual-surface-needed = yes)
**Ranking:** table-stakes weight (how universally competitors have it) × inverse build-effort (how much Beamix already has under the hood). High score = build first.

**Effort scale:** S = surface existing agent output in a new page (cheapest) · M = new page + light new read/aggregation · L = needs new capability/infra.

---

## Tier 1 — Build first (high table-stakes, low effort, data already exists)

| # | Surface to build | Closes gap | Backing agent | Effort | Why now |
|---|---|---|---|---|---|
| 1 | **Prompt / Query Explorer** | tracked-prompt list, suggested prompts, fan-out, intent, uncited detection | `query_mapper` | M | EVERY competitor's core screen; Beamix has zero prompt-management UI. Biggest "feels empty" fix. |
| 2 | **Content Editor** (optimize + refresh + FAQ) | manual operation of the 3 content agents → existing `/approvals` | `content_optimizer` `freshness_agent` `faq_builder` | M | Beamix's core "do the work" strength, currently invisible. Reuses approval queue. |
| 3 | **Schema Generator UI** | generate → preview JSON-LD → copy/inject | `schema_generator` | S | Free agent, auto-publishes today; tiny surface, fast credibility win. |
| 4 | **Run History / Output Archive** (`/archive` stub → real) | every manual + autonomous run, re-openable | `agent_jobs` | S | Makes the product feel lived-in; one query over existing jobs table. |
| 5 | **Per-tool Run control + mode toggle** | manual-trigger UI for `/api/agents/run`; "Run it myself" vs "Let Beamix handle it" | all 11 | S | The interaction primitive every tool page shares. Backend exists. |

## Tier 2 — Build second (high table-stakes, medium effort)

| # | Surface to build | Closes gap | Backing agent | Effort | Why |
|---|---|---|---|---|---|
| 6 | **Competitor Tracker** (`/competitors` stub → real) | add/track competitors, share-of-voice, gap analysis, co-citation | `query_mapper`+`performance_tracker` | M | Universal competitor feature; data largely from scan + agents. |
| 7 | **Automation Center** (`/automation` stub → real) | per-agent manual/autonomous toggle, schedules, seat allotment | all 11 (`dailyCap`) | M | The literal embodiment of "do it yourself OR let Beamix do it." The mode hub. |
| 8 | **Citation / Off-Site Manager** | citation tables, source→outreach, click-to-track; tabs for entity/review/reddit planners | `offsite_presence_builder` `entity_builder` `review_presence_planner` `reddit_presence_planner` | M | Surfaces 4 hidden agents; Beamix uniquely *acts* here (vs Otterly monitor-only). |
| 9 | **Visibility / Outcomes detail** (wire real data) | per-engine score, SoV, trend, position — for non-demo users | `performance_tracker` | M | Dashboard exists but stubbed for real users; competitors all have this live. |

## Tier 3 — Build later (gated, heavier, or narrower)

| # | Surface to build | Closes gap | Backing agent | Effort | Why later |
|---|---|---|---|---|---|
| 10 | **Blog Studio** | author long-form authority content → approval → publish | `authority_blog_strategist` | L | `build`/`scale` only, YMYL-high, heaviest editor. |
| 11 | **Sentiment themes view** | verbatim model-quote themes (not just a score) | `performance_tracker` | M | Nice depth; partial today via scan sentiment. |
| 12 | **Region/language measurement config** | per-prompt/region targeting | NEW | L | Real capability gap; competitors have it; not ICP-blocking. |
| 13 | **Export CSV / PDF** | stakeholder/agency reporting | — | S | Easy, but not a "feels full" driver. |

## Deferred to backlog — do NOT build reactively (moats we can't cheaply match)

These appeared in the teardown but are explicitly out of v1 scope (per `MANUAL-MODE-MODEL.md` — v1 = the 11 existing agents only):

- **Prompt-volume / demographic panel data** (Profound's consumer-panel moat; Athena Enterprise) — requires a data-purchase moat we don't have.
- **Visual DAG agent builder + bulk "Sheets" runs** (Profound) — large net-new product; Beamix's agents are pre-composed, not user-assembled.
- **AI-crawler log analytics + AI-referral attribution** (Profound, Athena Ent) — infra-heavy; needs CDN/GA4 integration pipeline.
- **Shopping / ecommerce SKU module** (Profound, Athena) — outside the 3 launch ICPs (B2B SaaS, legal, dental).
- **NL copilot / Ask-X / MCP server** (all three) — net-new surface; revisit post-v1.
- **Hallucination / brand-integrity claim detection** (Athena) — net-new agent; compelling but not core.
- **Team RBAC, custom dashboards, BI connectors, agency pitch workspace** — account/agency-layer; revisit with the (deferred) pricing/packaging work.

---

## The one-sentence strategy

**Surface what we already do (Tier 1: content + schema + run history — all hidden today), then build the monitoring/competitor front-ends the data already supports (Tier 2), and explicitly defer the data-moat and infra-heavy features (backlog).** The product feels full after Tier 1+2 — roughly 9 surfaces, most of which are presentation over existing backend.
