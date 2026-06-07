# Beamix — Full Product Vision Map (Miro)

**Created:** 2026-06-06 · **Owner:** CEO session `ceo-miro-product-viz`
**Board:** https://miro.com/app/board/uXjVG1iySzI=/
**Canon:** PRD v5.0 — done-for-you GEO agency (agency pivot 2026-05-23)

> Visualizes the **finished product as envisioned in the docs**, not the partial `apps/web` code.
> Every node is tagged by **build status** so the board doubles as a vision map and a gap/roadmap map.

---

## Build-status legend (used across every frame)

| Color | Meaning |
|---|---|
| 🟢 Green `#adf0c7` | **Built** — live in code today |
| 🟡 Yellow `#fff6b6` | **Scaffolded** — partial in code |
| 🔴 Red `#ffc6c6` | **Spec-only** — documented, not built yet |
| 🔵 Blue `#c6dcff` | **Decision / approval gate** |
| ⚪ Gray `#e7e7e7` | **External system** (Framer · Paddle · OpenRouter · Resend) |

---

## Frame index (3×5 grid + title)

| Frame | Title | Type | Shows |
|---|---|---|---|
| F00 | Overview & Legend | doc + legend | What Beamix is, the model, how to read, pricing, status legend |
| F01 | Site Map / IA | flowchart (LR tree) | Every page: Public(Framer) · Free Scan · Auth · Funnel · Product nav (5) · Admin |
| F02 | Master User Journey | flowchart | E2E: scan → discovery → subscription → work → approval → outcomes → digest → money-back |
| F03 | Free Scan Flow | flowchart | Anonymous funnel: form → scanning → wound-reveal → discovery-call CTA |
| F04 | Acquisition → Activation | flowchart | Discovery call → brand fingerprint → checkout → Day-1 chain → Outcomes |
| F05 | Tiered Approval Flow | flowchart | Deliverable → auto-publish / 1-click / YMYL human → publish → dashboard |
| F06 | Weekly Digest / Retention | flowchart | Cron → digest writer → preview → send → engage → churn-risk loop |
| F07 | Agent Roster | table | The 12-agent fleet: deliverable, approval tier, build status |
| F08 | Scan Pipeline | flowchart | `/api/scan/free` → Inngest fan-out → 3 engines → Gemini analysis → persist → rules |
| F09 | Agent Execution Pipeline | flowchart | PLAN → RESEARCH → DO → QA → SUMMARIZE, with credit/QA/approval gates |
| F10 | Background Jobs (Inngest) | flowchart | agent-execute · digest-builder · founding-100-metrics + spec-only jobs |
| F11 | Feature Inventory | sticky grid | ~30 features across 9 areas |
| F12 | Pricing Tiers | table | Starter $499 / Growth $999 / Scale $1,499 / Professional $2,499 × features |
| F13 | Launch Verticals | table | B2B SaaS · Solo Lawyer · Single-Location Dental |
| F14 | Data Model (ERD) | entity-relationship | 16 key entities + relationships |

---

## Backing research maps

The board is grounded in four structured maps (docs + code cross-referenced), in this folder:

| File | Covers |
|---|---|
| [MAP-A-pages-IA.md](MAP-A-pages-IA.md) | Full page/screen inventory + nav hierarchy |
| [MAP-B-user-flows.md](MAP-B-user-flows.md) | 6 user journeys, flowchart-ready with decision branches |
| [MAP-C-agents-pipelines.md](MAP-C-agents-pipelines.md) | Agent roster, scan + agent pipelines, Inngest jobs |
| [MAP-D-features-business-data.md](MAP-D-features-business-data.md) | Feature inventory, pricing, verticals, data model |

---

## Doc-vs-code drift surfaced (cleanup candidates — not yet acted on)

1. **Killed-but-coded agents** — `freshness_agent` and `reddit_presence_planner` are marked killed/folded in
   `07-AGENT-ROSTER-V2.md` + PRD but still fully coded (registry, prompts, routing).
2. **Two limiting models in the DB** — credit system (`credit_pools`, `credit_holds`, `daily_cap_usage`,
   `plans.monthly_credits`, `agent_jobs.credit_cost`) is retired in product but still in the schema;
   deliverable caps (`deliverables_per_customer_per_month`) are the real mechanism.
3. **Stale pricing** — old SaaS pricing ($79/$189/$499 Discover/Build/Scale) still lives in root `CLAUDE.md`
   "Project State" and `MEMORY.md` `project_pricing_v2`. Authoritative is $499/$999/$1,499/$2,499.
4. **Approval auto-decline timer** — UX doc says 7 days (§0.1) vs 5 days (§0.3 card copy). Unreconciled.
5. **Spec-only agents/pages/jobs** — approval-gate-writer, publisher, customer-success, strategy agents;
   `/digests`, `/traceability`, `/admin` pages; scan fan-out + `release-stuck-holds` + digest email send.
6. **Mixed FK target** — most agency tables key `customer_id → user_profiles`, but rebuilt
   `weekly_digests.customer_id → businesses(id)`.

---

## Notes / limitations

- Built on the blank **"ריק"** Miro board — a new board could not be created (3-board plan limit). The MCP
  cannot rename a board; the on-canvas title labels it. Rename manually in Miro if desired.
- Verified visually with Playwright (view-only anonymous render). Only fix needed: F14 ERD overflowed its
  frame → frame widened 3,600 → 6,700px, re-confirmed contained.
- Diagrams were generated with the Miro diagram DSL (auto-layout); frame sizes are generous to absorb it.

**Session file:** `docs/08-agents_work/sessions/2026-06-06-ceo-miro-product-viz.md`
