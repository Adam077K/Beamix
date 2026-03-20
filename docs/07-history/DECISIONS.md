# Strategic Decisions Log

_A permanent record of every non-trivial decision made about the product, architecture, or business._

<!-- Agent: ceo + any lead | When: any time a non-trivial decision is made — technology choices, product direction, pricing, hiring, architecture, process | Instructions: Add entries newest-first (newest at the top, below this comment). Include WHY, not just WHAT. A future team member should be able to read this and understand the full reasoning, what alternatives were considered, and who was accountable. Status values: Active (in effect), Superseded (replaced by a newer decision — link to it), Reversed (undone — explain why). -->

---

## How to Use

Each entry answers three questions: **What** was decided, **why** this over alternatives, and **who** is accountable. Entries are permanent — never delete them. Mark old decisions as Superseded or Reversed with a reference to the newer entry.

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
**Status:** Active (FINAL)

---

### [2026-03-06] Pricing (FINAL)
- Starter: $49/mo (annual: $39/mo)
- Pro: $149/mo (annual: $119/mo)
- Business: $349/mo (annual: $279/mo)
**Made by:** CEO. **Status:** Active (FINAL — do not change without CEO sign-off)

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

_Last updated: 2026-03-19 | Updated by: technical-writer_
