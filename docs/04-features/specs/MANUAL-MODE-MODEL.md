# Manual-Mode Model — The Self-Serve Surface Spine

**Date:** 2026-06-11
**Status:** Spec (dispatch-ready); build deferred to a later session
**Parent decision:** `docs/01-foundation/POSITIONING-AMENDMENT-2026-06-11.md`
**Scope note:** Conceptual + UX model only. Pricing / entitlement-money mechanics are OUT OF SCOPE (deferred). Where this doc says "gated" or "limited," it means *which agents/actions are exposed in which mode* — not what a plan costs.

---

## 1. The three operating modes

Every agent in Beamix can be operated in one of three modes. This is the organizing principle of the whole product surface.

| Mode | Who drives | What the user sees | Backed by |
|------|-----------|--------------------|-----------|
| **Manual** | The user | A tool page: inputs → "Run" → live execution → output to review/edit → approve/publish | `POST /api/agents/run` (exists) |
| **Autonomous seat** | Beamix, on a schedule/trigger, within a limited allotment | A toggle "let it run automatically"; runs appear in Run History + feed the digest | `dailyCap` per agent (exists in registry) + a scheduler (new) |
| **Done-for-you** | Beamix, uncapped, with concierge layer | The current product: outcomes dashboard, weekly digest, approval queue, traceability | Existing agency machinery (untouched) |

**The toggle.** Every tool page shows: **[ Run it myself ]  ·  [ Let Beamix handle it ]**. "Run it myself" = manual mode (one job, now). "Let Beamix handle it" = enroll this agent into autonomous/done-for-you operation.

**Core stays the soul.** Done-for-you is the default and premium experience. Manual mode is the "feels full," on-ramp, and control layer. We are surfacing the existing engine, not building a parallel product.

---

## 2. Agent → manual tool surface (the 11 registry agents)

Source of truth: `apps/web/src/lib/agents/config/registry.ts`. Every manual surface calls the existing `POST /api/agents/run` and reads that agent's output.

| Agent (`agentType`) | Display | Manual surface (page) | Gated? (approval) | Notes |
|---|---|---|---|---|
| `query_mapper` | Query Mapper | **Prompt / Query Explorer** (net-new) | No (internal report) | Highest-impact net-new page; every competitor has a prompt explorer |
| `content_optimizer` | Content Optimizer | **Content Editor** (net-new) | **Yes** | `requiresPageLock`; manual = pick page → run → edit diff → approval queue |
| `freshness_agent` | Freshness Agent | Content Editor ("Refresh" action) | **Yes** | `requiresPageLock`; same surface as content_optimizer |
| `faq_builder` | FAQ Builder | **FAQ Manager** (net-new, or Content Editor tab) | **Yes** | `requiresTopicLedger`; free agent, daily-capped |
| `schema_generator` | Schema Generator | **Schema Generator UI** (net-new) | No (auto-publish) | Generate → preview JSON-LD → copy/inject; small fast win |
| `offsite_presence_builder` | Off-Site Presence Builder | **Citation / Off-Site Manager** (net-new) | No (auto-publish) | Free, daily-capped |
| `review_presence_planner` | Review Presence Planner | Reputation Manager (tab of Off-Site Manager) | No (internal report) | Surfaces a plan, not a publish |
| `entity_builder` | Entity Builder | Entity Manager (tab of Off-Site Manager) | No (auto-publish) | |
| `authority_blog_strategist` | Authority Blog Strategist | **Blog Studio** (net-new) | **Yes** | `build`/`scale` only; `ymylRisk: high`; heaviest, build last |
| `performance_tracker` | Performance Tracker | **Dashboard / Outcomes** (exists — wire real data) | No (internal report) | Analytics backbone |
| `reddit_presence_planner` | Reddit Presence Planner | Community Manager (tab of Off-Site Manager) | No (internal report) | |

**v1 manual surface = these 11 agents only.** Competitor-only features surfaced by the teardown (e.g. Profound's prompt-volume dataset, Scrunch-style agent-experience shadow site, Athena's narrative engine) go to a backlog — they are NOT built reactively from the teardown.

---

## 3. Manual-mode interaction contract (per tool page)

Every manual tool page follows the same skeleton so the product feels coherent:

1. **Context header** — which business, current visibility signal relevant to this tool.
2. **Input panel** — the agent's inputs, pre-filled from existing data where possible, fully editable (e.g. target URL, query cluster, custom instructions — these already exist in the `/api/agents/run` request body).
3. **Run control** — "Run it myself" button + the mode toggle. Disabled state when a daily cap (`dailyCap`) is exhausted, with a clear message.
4. **Live execution** — the agent's pipeline stages (`plan → research → do → qa → summarize` or `plan → do → qa`) shown as a live ledger (reuse the scan-ledger visual language).
5. **Output** — review/edit. For gated agents (`requiresApproval: true`), output routes to the **existing** `/approvals` queue — do NOT build a new approval surface. For auto-publish agents, output shows what was published + where.
6. **History link** — every run lands in Run History (`/archive` → real).

**Reuse anchors (do NOT rebuild):** `/approvals`, `/traceability`, `/digests`, `POST /api/agents/run`, the scan-ledger visual components.

---

## 4. Gating rules (unchanged from agency model)

The approval gate is preserved exactly. `resolveArtifactType()` in the registry already encodes it:
- **Gated (1-click approve in `/approvals`):** `content_optimizer`, `freshness_agent`, `faq_builder`, `authority_blog_strategist`. YMYL content always routes through approval, in every mode including manual.
- **Auto-publish (no approval):** `schema_generator`, `offsite_presence_builder`, `entity_builder`.
- **Internal report (nothing published):** `query_mapper`, `review_presence_planner`, `performance_tracker`, `reddit_presence_planner`.

Manual mode does NOT bypass YMYL gating — a user running `authority_blog_strategist` themselves still sends the draft to approval before publish.

---

## 5. Stub routes → real pages

| Route (currently a 5-line redirect) | Becomes | Backed by |
|---|---|---|
| `/automation` | **Automation Center** — the mode hub: per-agent manual/autonomous toggle, schedules, remaining autonomous-seat allotment | the mode model itself |
| `/competitors` | **Competitor Tracker** | `query_mapper` + `performance_tracker` |
| `/archive` | **Run History / Output Archive** — every manual + autonomous run, re-openable | `agent_jobs` |

---

## 6. Build sequencing (priority)

1. Prompt / Query Explorer (`query_mapper`) — biggest "feels empty" fix
2. Content Editor (`content_optimizer` + `freshness_agent` + `faq_builder`) — core "do it yourself" surface
3. Schema Generator UI (`schema_generator`) — small fast win
4. Competitor Tracker (`/competitors` stub → real)
5. Automation Center (`/automation` stub → real; the mode hub)
6. Citation / Off-Site Manager (`offsite` + `entity` + `review` + `reddit`)
7. Blog Studio (`authority_blog_strategist`) — gated, heaviest, last

**QA tiers:** tool pages that only render existing agent output → standard P1/P2 (Lite/Full). Any future autonomous-seat *entitlement* logic → Irreversible tier (deferred with pricing).
