# Strategic Decisions Log

_A permanent record of every non-trivial decision made about the product, architecture, or business._

<!-- Agent: ceo + any lead | When: any time a non-trivial decision is made — technology choices, product direction, pricing, hiring, architecture, process | Instructions: Add entries newest-first (newest at the top, below this comment). Include WHY, not just WHAT. A future team member should be able to read this and understand the full reasoning, what alternatives were considered, and who was accountable. Status values: Active (in effect), Superseded (replaced by a newer decision — link to it), Reversed (undone — explain why). -->

---

## How to Use

Each entry answers three questions: **What** was decided, **why** this over alternatives, and **who** is accountable. Entries are permanent — never delete them. Mark old decisions as Superseded or Reversed with a reference to the newer entry.

---

### [2026-04-17] Board Meeting Day 3: Final Decisions + Pre-Build Audit
**Decision:** Locked remaining open items: no AI labels in content output, day-1 auto-trigger pipeline, $19 top-up pack, annual pricing at launch, Sonar citation verification, email domain (notify.beamix.tech). Assisted-vs-autopilot validated by research (97% prefer review). Pre-build audit completed by 5 agents.
**Context:** Third day of board meeting. 5-agent stress test (product, tech, business, UX, research) found 7 P0 blockers + 5 spec contradictions — all resolved. Documentation cleanup complete (30+ docs updated, 14+ archived).
**Made by:** CEO (Adam) with full agent board
**Status:** Active

---

### [2026-04-15] — Board Meeting: Full Product Rethink Approved
**Decision:** Complete product overhaul approved. New pricing ($79/$189/$499), new agent roster (11+1), proactive automation model, dashboard restructure, YMYL safety policy.
**Context:** 2-day board meeting (Apr 14-15) with Adam. Full agent board participated: Business Lead, Product Lead, Design Lead, AI Engineer, Research Lead, Growth Lead, Build Lead. Research-backed from GEO paper + 680M citations study + competitive landscape.
**Made by:** CEO (Adam) with full agent board
**Status:** Active — supersedes all prior pricing, agent, and UX decisions

---

### [2026-04-15] — Pricing v2: Discover $79 / Build $189 / Scale $499
**Context:** $49 Starter priced below "real work" perception. Agencies charge $1,500-$30K for equivalent work. Yael persona (primary buyer) has $200 self-approval ceiling.
**Decision:** New tiers Discover/Build/Scale at $79/$189/$499. Annual: $63/$151/$399. Kill 7-day trial. Free scan stays. 14-day money-back guarantee replaces trial.
**Made by:** CEO + Business Lead
**Status:** Active — supersedes [2026-03-06] pricing

---

### [2026-04-15] — Agent Roster v2: 11+1 Research-Backed Agents
**Context:** Old 7 agents were generic content tools, not GEO-specialized. Research proved 85% of AI mentions come from off-site sources (citations study, 680M citations). Reddit is Perplexity's #1 source (46.7%).
**Decision:** Total rethink. 11 MVP-1 agents covering on-site + off-site + structural moats: Freshness Agent, Query Intelligence, Schema Optimizer, Off-Site Presence Builder, Review Velocity, Entity Authority, Reddit Presence, Blog Strategist (Build+ only), FAQ Engine, Competitor Gap, Local GEO. Video SEO in MVP-2.
**Made by:** CEO + Research Lead + AI Engineer
**Status:** Active — supersedes all prior agent definitions

---

### [YYYY-MM-DD] — Example: Chose Supabase over PlanetScale for database

**Decision:** Use Supabase (PostgreSQL) as the primary database for all structured data storage.

**Context:** We needed a hosted database solution before the first sprint. The team evaluated PlanetScale (MySQL-compatible, branching model), Neon (serverless Postgres), and Supabase (Postgres + realtime + storage + auth).

**Rationale:** Supabase bundles Postgres, row-level security, storage, and realtime in one platform — reducing the number of vendor integrations at early stage. The team has existing Postgres expertise. RLS handles multi-tenant data isolation at the DB layer, which simplifies backend code. PlanetScale's branching is valuable at scale but adds workflow complexity we don't need yet.

**Made by:** _build-lead_

**Status:** Active

---

### [2026-03-06] Supabase Auth over Clerk
**Context:** Needed auth solution. Initially considered Clerk (referenced in template).
**Decision:** Use Supabase Auth. Supabase handles both auth and database, reducing vendor count.
**Made by:** Build Lead
**Status:** Active

---

### [2026-03-06] Paddle over Stripe
**Context:** Needed payment processor for SaaS subscriptions.
**Decision:** Paddle only. Merchant of record model simplifies EU VAT compliance. Stripe was removed 2026-03-02.
**Made by:** CEO
**Status:** Active. Webhook: `src/app/api/paddle/webhooks/route.ts`

---

### [2026-03-06] Trial = 7 days, Free Scan Retention = 30 days
**Context:** D1 from backlog — trial duration was 14 days in archived build plan.
**Decision:** Trial = 7 days (starts on first dashboard visit). Free scan data visible for 30 days from scan date for all users including non-paying.
**Made by:** CEO
**Status:** Superseded — [2026-04-15] kills the trial entirely. Replaced by 14-day money-back guarantee. Free scan retention (30 days) remains active.

---

### [2026-03-06] Pricing (FINAL)
- Starter: $49/mo (annual: $39/mo)
- Pro: $149/mo (annual: $119/mo)
- Business: $349/mo (annual: $279/mo)
**Made by:** CEO. **Status:** Superseded — see [2026-04-15] Pricing v2

---

### [2026-03-06] OpenRouter as LLM Gateway
**Context:** Needed unified LLM billing and spend tracking per scan/agent.
**Decision:** All LLM calls go through OpenRouter (not direct provider SDKs). Two keys: OPENROUTER_SCAN_KEY + OPENROUTER_AGENT_KEY.
**Made by:** Build Lead. **Status:** Active

---

### [2026-03-06] 4-step Onboarding (not 3-step)
**Context:** D4 from backlog — 3-step vs 4-step MVP.
**Decision:** 4-step full product onboarding (per system design product layer §2.7). Not MVP.
**Made by:** Product Lead. **Status:** Active

---

## Open Questions
See [docs/BACKLOG.md](../BACKLOG.md) for unresolved product decisions and prioritized tasks.

---

_Last updated: 2026-04-17 | Updated by: technical-writer_
