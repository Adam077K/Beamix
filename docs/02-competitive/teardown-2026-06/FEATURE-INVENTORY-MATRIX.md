# Feature Inventory Matrix — Profound · AthenaHQ · Otterly vs Beamix

**Date:** 2026-06-11
**Sources:** `PROFOUND-TEARDOWN.md`, `ATHENAHQ-TEARDOWN.md`, `OTTERLY-TEARDOWN.md` (this folder)
**Purpose:** The bridge artifact. Every distinct feature/page/tool the three competitors expose, cross-tabbed against what Beamix has today and which of the 11 registry agents could back a Beamix version. Feeds `GAP-TO-BUILD.md`.

**Legend**
- Competitor columns: ● = full / first-class · ◐ = partial / gated / integration-dependent · ○ = absent
- **Beamix now:** `none` (we don't have it) · `partial` (exists but hidden, stubbed, or demo-only) · `has` (shipped + real)
- **Backing agent:** the existing registry agent (`apps/web/src/lib/agents/config/registry.ts`) that produces the underlying data/output, or `—` (no agent / infra) / `NEW` (needs new capability)
- **Manual surface?** does the reframe need a user-operable page for this

---

## A. Monitoring & Measurement (the table-stakes layer)

| Feature | Profound | Athena | Otterly | Beamix now | Backing agent | Gap | Manual surface? |
|---|:--:|:--:|:--:|---|---|---|---|
| Visibility score (aggregate, per-engine) | ● | ● | ● | **has** (dashboard, scan) | `performance_tracker` | none | yes (dashboard) |
| Share of Voice vs competitors | ● | ● | ● | **none** | `performance_tracker`+`query_mapper` | missing | yes |
| Average position / rank within answers | ● | ● | ● | partial (scan v2 has position) | `performance_tracker` | partial | yes |
| Mention rate / brand coverage % | ● | ● | ● | partial (scan) | `performance_tracker` | partial | yes |
| Rankings-by-topic leaderboard | ● | ◐ | ◐ | **none** | `query_mapper`+`performance_tracker` | missing | yes |
| Per-engine comparison (same prompt across engines) | ● | ● | ◐ | partial (scan shows per-engine) | `performance_tracker` | partial | yes |
| Score-over-time / trend charts | ● | ● | ● | partial (digests show deltas) | `performance_tracker` | partial | yes |
| Region / language targeting of measurement | ● (150+/30+) | ◐ (Ent) | ● (per-prompt country) | **none** | NEW | missing | yes (config) |
| Screenshot/answer archive (forensic) | ● | ○ | ○ | **none** | NEW (capture in scan) | missing | maybe |

## B. Prompt / Query Intelligence

| Feature | Profound | Athena | Otterly | Beamix now | Backing agent | Gap | Manual surface? |
|---|:--:|:--:|:--:|---|---|---|---|
| Tracked-prompt list (add/edit/delete/tag) | ● | ● | ● | **none** | `query_mapper` | missing | **yes (Prompt Explorer)** |
| Suggested/auto-discovered prompts → add to tracking | ● | ● | ● | partial (query_mapper produces internally) | `query_mapper` | partial | yes |
| Prompt research from seed/keyword/URL | ● | ● | ● | partial (query_mapper) | `query_mapper` | partial | yes |
| Query fan-out (sub-queries an engine expands to) | ● | ◐ | ● | **none** | `query_mapper` (NEW view) | missing | yes |
| Intent classification of prompts | ● | ◐ | ◐ | **none** | `query_mapper` | missing | yes |
| Uncited-prompt detection (competitor ranks, you don't) | ● | ● | ◐ | partial (scan gap-list W6) | `query_mapper` | partial | yes |
| Prompt volume / demographic data (real-user panel) | ● (proprietary) | ● (Ent) | ○ | **none** | — (data moat, not ours) | missing (defer) | no |

## C. Citations & Sources

| Feature | Profound | Athena | Otterly | Beamix now | Backing agent | Gap | Manual surface? |
|---|:--:|:--:|:--:|---|---|---|---|
| Citation share / rank / top domains / top pages | ● | ● | ● | partial (scan captures evidence) | `offsite_presence_builder` | partial | yes |
| Earned/owned/social source categorization | ● | ◐ | ○ | **none** | `offsite_presence_builder` | missing | yes |
| Source intelligence → outreach brief | ◐ | ● | ○ | **none** | `offsite_presence_builder` | missing | yes |
| Click-to-track a URL/domain | ● | ● | ◐ | **none** | `offsite_presence_builder` | missing | yes |
| Build off-site presence / citations (do the work) | ◐ (via agents) | ◐ | ○ | **has (auto)** | `offsite_presence_builder`+`entity_builder` | none (hidden) | **yes (Off-Site Mgr)** |
| Reddit / community presence | ○ | ◐ (suggest only) | ○ | **has (auto)** | `reddit_presence_planner` | none (hidden) | yes |
| Review / reputation presence | ○ | ○ | ○ | **has (auto)** | `review_presence_planner` | none (hidden) | yes |

## D. Competitors

| Feature | Profound | Athena | Otterly | Beamix now | Backing agent | Gap | Manual surface? |
|---|:--:|:--:|:--:|---|---|---|---|
| Add/track competitors (manual + auto-suggest) | ● | ● | ● | **none** (`/competitors` stub) | `query_mapper`+`performance_tracker` | missing | **yes (Competitor Tracker)** |
| Competitor gap analysis → action | ● | ● | ◐ | partial (scan gap-list) | `query_mapper` | partial | yes |
| Co-citation mapping (who appears with you) | ● | ◐ | ◐ | **none** | `query_mapper` | missing | yes |
| Impersonation / brand-confusion tracking | ○ | ● | ○ | **none** | NEW | missing (defer) | no |
| Sentiment & visibility 2-axis competitive map | ● | ◐ | ● (Visibility Index) | **none** | `performance_tracker` | missing | maybe |

## E. Sentiment & Brand Integrity

| Feature | Profound | Athena | Otterly | Beamix now | Backing agent | Gap | Manual surface? |
|---|:--:|:--:|:--:|---|---|---|---|
| Sentiment score (per-prompt + aggregate) | ● | ● | ● | partial (scan W5 sentiment-judge) | `performance_tracker` | partial | yes |
| Sentiment themes w/ verbatim model quotes | ● | ◐ | ○ | **none** | `performance_tracker` | missing | yes |
| Hallucination / claim-accuracy detection | ○ | ● | ○ | **none** | NEW | missing (defer) | no |
| Before/after recovery tracking | ◐ | ● | ○ | partial (traceability) | `performance_tracker` | partial | yes |

## F. Content Creation & Action (the "do the work" layer — Beamix's core strength)

| Feature | Profound | Athena | Otterly | Beamix now | Backing agent | Gap | Manual surface? |
|---|:--:|:--:|:--:|---|---|---|---|
| Optimize an existing page for AI pickup | ● | ● | ◐ (suggest) | **has (auto+gated)** | `content_optimizer` | none (hidden) | **yes (Content Editor)** |
| Refresh stale content | ● | ● | ○ | **has (auto+gated)** | `freshness_agent` | none (hidden) | yes |
| Generate FAQ content | ● | ● | ○ | **has (auto+gated)** | `faq_builder` | none (hidden) | **yes (FAQ Mgr)** |
| Generate JSON-LD schema | ● | ● | ◐ | **has (auto)** | `schema_generator` | none (hidden) | **yes (Schema UI)** |
| Author authority/long-form blog content | ● | ● | ◐ (free tool) | **has (gated)** | `authority_blog_strategist` | none (hidden) | yes (Blog Studio) |
| Brand voice / brand-kit configuration | ● | ● | ○ | partial (brand fingerprint stub) | — (settings) | partial | yes (settings) |
| Publish to CMS (WP/Shopify/Webflow/etc.) | ● | ● | ○ | partial (publishing integrations tab) | — (infra) | partial | yes |
| Paste-ready output for manual CMS | ◐ | ◐ | ◐ | partial | — | partial | yes |
| Action Center (assignable, status-tracked fix tasks) | ◐ (Opportunities) | ● | ◐ (Recommendations) | partial (`/approvals` queue) | all gated agents | partial | yes |
| GEO on-page audit (25+ factors, pass/fail) | ◐ | ◐ | ● | **has (scan factor audit W5)** | `performance_tracker` | none | yes (scan) |

## G. Agent / Automation Builder

| Feature | Profound | Athena | Otterly | Beamix now | Backing agent | Gap | Manual surface? |
|---|:--:|:--:|:--:|---|---|---|---|
| Run an agent on demand (manual trigger) | ● | ● | ○ | partial (`/api/agents/run` exists, no UI) | all 11 | partial | **yes (every tool page)** |
| Schedule / background (autonomous) agents | ● | ● (self-improving loops) | ○ | partial (`dailyCap` scaffold) | all 11 | partial | **yes (Automation Center)** |
| Visual DAG agent builder (Zapier-style) | ● | ○ | ○ | **none** | NEW | missing (defer) | no |
| Bulk agent runs (Sheets-style) | ● | ○ | ○ | **none** | NEW | missing (defer) | no |
| Run history / output archive | ● | ◐ | ◐ | **none** (`/archive` stub) | `agent_jobs` | missing | **yes (Run History)** |
| NL copilot over your data (Ask X / MCP) | ● | ● | ● (MCP) | **none** | NEW | missing (defer) | no |

## H. Traffic / Crawler Analytics

| Feature | Profound | Athena | Otterly | Beamix now | Backing agent | Gap | Manual surface? |
|---|:--:|:--:|:--:|---|---|---|---|
| AI-crawler visibility (GPTBot/ClaudeBot hits) | ● | ◐ (integration) | ◐ (beta) | **none** | NEW (infra) | missing (defer) | no |
| AI-referral human-traffic attribution (GA4 join) | ● | ● (Ent) | ◐ | **none** | NEW (infra) | missing (defer) | no |
| Submit-to-AI-search (proactive crawl invite) | ● | ○ | ○ | **none** | NEW | missing (defer) | no |

## I. Ecommerce / Shopping

| Feature | Profound | Athena | Otterly | Beamix now | Backing agent | Gap | Manual surface? |
|---|:--:|:--:|:--:|---|---|---|---|
| Shopping/product visibility, SKU analysis, attribute accuracy | ● | ● | ○ | **none** | NEW | missing (defer — not in ICP) | no |
| Revenue attribution to AI citations | ◐ | ● | ○ | **none** | NEW | missing (defer) | no |

## J. Collaboration, Account & Agency

| Feature | Profound | Athena | Otterly | Beamix now | Backing agent | Gap | Manual surface? |
|---|:--:|:--:|:--:|---|---|---|---|
| Team seats + RBAC | ● | ● | ● | partial (auth, single-user) | — | partial (defer) | no |
| Custom / shareable dashboards | ● | ● | ◐ | **none** | — | missing (defer) | no |
| Export CSV / PDF | ● | ● | ● | **none** | — | missing | maybe |
| Looker Studio / BI connector | ◐ | ● | ● | **none** | — | missing (defer) | no |
| Public API + MCP server | ● (Ent) | ● (Ent) | ● (Std+) | **none** | NEW | missing (defer) | no |
| Agency pitch workspace / white-label reports | ◐ | ● | ● | partial (white-label per-client decided) | — | partial (defer) | no |
| Weekly digest / narrative report | ◐ | ◐ | ◐ | **has (real)** | `performance_tracker` | none | yes (digests) |
| Traceability / evidence ledger | ◐ | ◐ | ○ | **has (real)** | all agents | none | yes (traceability) |

---

## Headline reads

1. **Beamix's gap is almost entirely PRESENTATION, not capability, in the content/action layer.** Every competitor's "do the work" features (optimize page, FAQ, schema, blog, citations) — Beamix already *has and ships*, but **hidden** (auto/background). The reframe surfaces them. This is the cheapest, highest-leverage work.

2. **Beamix's real missing capability is the MONITORING/INTELLIGENCE front-end** — tracked-prompt management, share-of-voice, competitor tracking, citation tables. The *data* largely exists (scan + `query_mapper` + `performance_tracker`); the **user-facing surfaces to explore/operate it don't.** These are the net-new pages.

3. **Beamix is already past the "I see it, now what?" gap that defines Otterly** (and partially Profound/Athena's lower tiers). Beamix *acts*. The reframe must make that visible without losing it — exactly the positioning amendment's point.

4. **Defer the moats we can't cheaply match:** prompt-volume panel data (Profound's consumer-panel moat), DAG agent builder, Shopping module, crawler-log analytics, MCP/Ask-X copilot. These go to backlog, not v1.

5. **One competitor pattern worth stealing for GTM (not product v1):** Otterly's free-tool funnel (12+ free GEO utilities, public use-counters). Beamix already has the free scan — the strongest single version of this. Note for CMO, out of scope here.
