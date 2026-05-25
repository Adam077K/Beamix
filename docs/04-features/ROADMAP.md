# Roadmap *(Updated 2026-05-23 — agency pivot)*

> **Source of truth:** `.claude/memory/DECISIONS.md` 2026-05-23 entry, decision #14.
> Prioritized backlog: [docs/BACKLOG.md](../BACKLOG.md).
> Full session synthesis: `docs/08-agents_work/sessions/2026-05-23-ceo-agency-pivot-grill.md`.

---

## Wave Plan (Post-Agency-Pivot)

### Wave 0 — Foundation (unchanged from pre-pivot)
- Hard reset of `apps/web/`
- Next.js 16, React 19, TypeScript strict, Tailwind, Shadcn/UI scaffold
- Supabase project provisioning, RLS, base schema
- Auth (Supabase Auth + magic links)
- Paddle integration (subscriptions + webhooks, HMAC verified)
- Inngest functions registered
- Resend transactional email infrastructure

### Wave 0.5 — Quality bar (unchanged)
- ESLint + Prettier + strict TypeScript
- Pre-commit hooks, GitHub Actions CI
- Sentry / observability baseline
- Test scaffolding (Vitest + Playwright)

### Wave 1 — *Rescoped 2026-05-23 — agency pivot*
**Goal:** Build the customer-facing surfaces that take a visitor from the vertical landing page through discovery to first activation.

- **Brand fingerprint** schema in Supabase + management UI (Adam-facing through customer #50)
- **Discovery agent** (PRD: `docs/04-features/specs/agent-discovery.md`)
- **Brand-brief manager agent** (PRD: `docs/04-features/specs/agent-brand-brief-manager.md`)
- **Free scan → discovery booking** flow (no email required for scan; email captured at booking)
- **Outcomes dashboard v1** — score per engine, weekly wins, top winning queries
- **Approval Queue UI** — 1-click approve cards, default-decline timer
- **3 vertical landing pages** (B2B SaaS / Legal / Dental) — copy from CMO
- **Paddle checkout** wired to 4 tiers (Starter $499 / Growth $999 / Scale $1,499 / Professional $2,499)

### Wave 2 — *Rescoped 2026-05-23 — agency pivot*
**Goal:** Recurring delivery — deliverables tracking + tier gates + digest + held-revenue accounting.

- **Deliverables tracking** — schema deployments / FAQs / citations / outreach emails / publishes per customer per month, with tier-cap enforcement
- **Tier gates** — enforce per-tier caps on every agent execution
- **Approval-gate writer agent** (PRD: `docs/04-features/specs/agent-approval-gate-writer.md`)
- **Digest writer agent** + Weekly Digest Archive UI (PRD: `docs/04-features/specs/agent-digest-writer.md`)
- **Customer success agent** (PRD: `docs/04-features/specs/agent-customer-success.md`) — proactive churn-risk + support flow
- **Held-revenue accounting** — first 60 days held separately; revenue booked day 61
- **Traceability page** — drill-down per outcome
- **One-click cancel** in Settings + auto-refund inside 60-day window

### Wave 3 — **NEW** — Publishing Integrations Matrix
**Goal:** The Publisher agent + integrations to push work live.

- **Publisher agent** (PRD: `docs/04-features/specs/agent-publisher.md`)
- **Auto-push integrations:**
  - WordPress (REST API via app password)
  - Shopify (Admin GraphQL)
  - Webflow (CMS API)
  - Google Business Profile (Business Profile API)
  - Yelp (Yelp Fusion)
  - Apple Maps Connect (Maps Connect API)
  - SendGrid sub-account provisioning (for email-as-customer)
  - Schema via Google Tag Manager (Tag Manager API)
- **Paste-ready package generator** — Wix, Squarespace, custom CMS
- **Strategy agent** (PRD: `docs/04-features/specs/agent-strategy.md`) — monthly strategy briefs (Professional tier; Adam-led through customer #50, then handed off)

### Post-MVP+90 (deferred)
- Annual billing (reintroduce after customer #100 refund-rate data)
- Premium uptime SLA (with first enterprise upsell)
- Additional verticals (HVAC/plumbing, real estate, DTC, non-dental healthcare)
- Video / YouTube SEO (Scale-only)
- "State of AI Search" annual editorial report (MVP+90 ship window per project memory)
- White-label per-CLIENT (per project memory; defer until enterprise tier exists)

---

## Engineering Sequencing (Decision #14)

| Wave | Status | Owner (CEO dispatches) |
|---|---|---|
| Wave 0 | Unchanged from pre-pivot plan | CTO |
| Wave 0.5 | Unchanged from pre-pivot plan | CTO |
| Wave 1 | **Rescoped 2026-05-23** | CTO + CPO + ai-engineer |
| Wave 2 | **Rescoped 2026-05-23** | CTO + CPO + ai-engineer |
| Wave 3 | **NEW 2026-05-23** | CTO + ai-engineer + backend-engineer |

CTO + Build-Lead coordinate Wave 1/2 rescope and Wave 3 brief from session file decisions #14 and #15.

---

## Old Automated Scheduled Scanning section — RETIRED 2026-05-23

The previous Discover/Build/Scale weekly-vs-daily scan cadence is retired with the old pricing. Scans now run inside tier-cap deliverable schedules managed by the Visibility tracker agent (repurposed). Customer never sees a "scan cadence" setting — the agent decides cadence.
