# MAP-D — Features, Business Model & Data Model

> **Scope:** Beamix product as envisioned in docs. Done-for-you GEO agency delivered as software.
> **Authoritative inputs:** PRD v5.0 (2026-05-23 agency pivot), Pricing v2, 2026-05-23 grill session (15 locked decisions), ROADMAP, PERSONAS, North Star, Unit Economics tier model, migrations `apps/web/supabase/migrations/`.
> **Mapped:** 2026-06-06.
> **Note on F-numbers:** the PRD does **not** use F-numbers. Features below are grouped by area and IDed `FA.n` (Feature-Area.number) for this map only — not a canonical PRD scheme.

---

## 1. FEATURE INVENTORY (grouped by area)

### Scan / Visibility
- **SC.1 Free scan** — URL + business name + industry, no email; 60–90s engine animation; visibility score per engine + 3 named opportunities (no blur, no paywall).
- **SC.2 Recurring scans** — `scans` (free/manual/scheduled); cadence managed by Visibility-tracker agent, never customer-set (old scan-cadence setting RETIRED 2026-05-23).
- **SC.3 Per-engine results** — rank, mention, sentiment, citations per engine per scan (`scan_engine_results`).
- **SC.4 Query tracking** — query clusters, tracked queries, historical query positions per scan.
- **SC.5 Citation signals** — per-engine/per-query cited-URL detection feeding the Home leading-indicator panel.

### Discovery / Onboarding
- **DS.1 Discovery booking** — "Book your 20-min discovery call" CTA after free scan (email captured at booking, not scan).
- **DS.2 Discovery agent** (Wave 1, NEW) — runs the agent-led discovery call; loads vertical script variant.
- **DS.3 Brand fingerprint** (Wave 1) — tone/voice/services/ICP/target queries/restricted topics/approval prefs/integrations; all agents read from it. Adam reviews+approves every fingerprint through customer #50.
- **DS.4 Brand-brief manager agent** (Wave 1, NEW) — generates and maintains the fingerprint; versioned via `brief_version_id`.
- **DS.5 Activation** = discovery + property connect + first scan (gates refund eligibility, starts 60-day clock).

### Outcomes Dashboard (customer-facing)
- **OD.1 Outcomes (Home)** — visibility score per engine, weekly wins, top winning queries, score-trajectory chart.
- **OD.2 Traceability ("How we got this")** — per-outcome drill-down: which deliverable moved which score, when, with citations.
- **OD.3 No-go surfaces** (removed): Agent Hub, Agent Chat, standalone Scans page, Automation page, credit counters.

### Approval / Inbox
- **AP.1 Approval Queue** — 1-click approve cards for content / email-as-them / outreach; signed-token links; 7-day expiry / default-decline timer.
- **AP.2 Approval-gate writer agent** (Wave 2, NEW) — drafts the approval cards surfaced in the digest.
- **AP.3 Tiered gates** — Auto: schema, citations (low-effort dirs), GBP/Yelp/Apple, scans. 1-click: content publish, email-as-customer, external outreach. Mandatory human: anything YMYL (legal/health/financial).

### Digest
- **DG.1 Weekly digest** — composed by Digest-writer agent; emailed (Resend); includes the week's approval link.
- **DG.2 Weekly Digest Archive** — searchable, dated narrative record of the relationship.
- **DG.3 Digest-writer agent** (Wave 2, NEW) + digest-builder Inngest cron (Sunday 16:00 UTC).

### Agents / Deliverables
- **AG.1 Deliverable types** — schema deployments, FAQs, citations, content publishing, outreach emails, listing updates.
- **AG.2 Deliverables tracking** (Wave 2) — per-customer-per-month counters with tier-cap enforcement on every agent run.
- **AG.3 Publisher agent** (Wave 3, NEW) — pushes to WP/Shopify/Webflow/GBP/Yelp/Apple/SendGrid/GTM; paste-ready for Wix/Squarespace/custom.
- **AG.4 Strategy agent** (Wave 3, NEW) — monthly strategy briefs (Professional tier); Adam-led through #50 (on Opus 4.7).
- **AG.5 Customer-success agent** (Wave 2, NEW) — proactive churn-risk + support flow.
- **AG.6 Repurposed agents** — Content/FAQ, Schema, Citation, Visibility-tracker. **Kept (de-emphasized):** Competitor-intelligence.
- **AG.7 Internal plumbing** — agent jobs, job outputs, per-call cost logging, page locks, topic-ledger dedup, daily caps, kill switch.

### Settings
- **ST.1 Settings pages** — Profile · Brand fingerprint · Billing · Approval preferences · Publishing integrations · Cancel (one-click).

### Billing
- **BL.1 Paddle checkout** — 4 tiers wired (Starter/Growth/Scale/Professional). Paddle only, NOT Stripe.
- **BL.2 60-day money-back** — plain refund, one-click cancel, customer keeps work product.
- **BL.3 Held-revenue accounting** — first 60 days held; revenue booked day 61 (`refund_events` append-only ledger; revenue-events ledger per CTO).
- **BL.4 Refund guardrails** — activation requirement, domain+business verification, one-per-account rule, Founding-100 cap (refund rate ≥ 25% → tighten next cohort to 30-day).

### Admin / Ops (internal, not customer-visible)
- **AD.1 Founding-100 cohort tracking** — first 100 paying customers, refund-risk flags.
- **AD.2 Global kill switch** + per-user kill switch (`system_kill_switch`, `user_profiles.kill_switch_until`).
- **AD.3 Paddle webhook idempotency** + audit/cost logging; weekly refund-rate tracking.

---

## 2. PRICING TIERS

**4 tiers, month-to-month, 60-day money-back, annual OFF at launch. Confirmed names + prices from PRD v5.0 + Pricing v2 (both identical).**

| | **Starter** | **Growth** | **Scale** | **Professional** |
|---|---|---|---|---|
| **Price** | **$499/mo** | **$999/mo** | **$1,499/mo** | **$2,499/mo** |
| Positioning | Entry, single location | Sweet spot (multi-loc), "Most Popular" | Power users, full engines + outreach | Custom, strategy-led |
| Locations | 1 | 3 | Unlimited | Unlimited |
| AI engines tracked | 3 (ChatGPT, Gemini, Perplexity) | 5 (+ Claude, Google AI Overviews) | 7 (+ Grok, You.com) | 7 + custom |
| Prompts/engine/mo | 25 | 75 | 200 | 500 |
| Schema deploys/mo | 4 | 12 | 24 | Unlimited |
| FAQs published/mo | 2 | 6 | 10 | 16 |
| Citations placed/mo | 5 | 15 | 30 | Unlimited |
| Outreach emails/mo | — | — | 10 | 30 |
| Publishing (auto) | WP, Webflow, Shopify | + Ghost | + GBP, Yelp, Apple Maps, GTM, SendGrid | + Custom CMS |
| Publishing (paste-ready) | — | + Squarespace, Wix | + Squarespace, Wix | + Any CMS |
| Discovery | Self-guided (5-min form) | Self-guided | Discovery call (20 min) | Deep discovery + monthly strategy review |
| SLA | 48h | 24h | 12h | 4h + Slack |
| Approval gates | Tiered | Tiered | Tiered | Tiered + Slack ping |
| Customer success | Reactive | Proactive monthly | Proactive bi-weekly | Proactive weekly |
| Money-back | 60-day | 60-day | 60-day | 60-day |

**Est. gross margins (CBO, to validate):** Starter ~91.6% · Growth ~92.6% · Scale ~91.9% · Professional ~90.0%. Blended ARPC $899 at 50/30/15/5 mix. Break-even refund rate >50% on every tier (12% empirical benchmark = safe).

### ⚠️ CONFLICTS / STALE DATA FLAGGED
- **OLD SaaS pricing (RETIRED 2026-05-23):** Discover $79 / Build $189 / Scale $499 (annual $63/$151/$399). Still referenced in **root `CLAUDE.md` "Project State" + "Pricing v2"** and **MEMORY.md `project_pricing_v2`**. These are STALE vs the agency pivot. No customer migration (pre-revenue).
- **Credit-counter "AI Runs" model RETIRED** — but the **DB still carries the full credit system** (`credit_pools`, `credit_holds`, `credit_transactions`, `daily_cap_usage`, `plans.monthly_credits`, `agent_jobs.credit_cost`). Schema predates the pivot (migrations dated 2026-05-20). Customers never see credits; tier caps are enforced via `deliverables_per_customer_per_month` instead. **Tech debt: two parallel limiting models in the schema.**
- **Old 14-day money-back trial RETIRED** → 60-day no-questions money-back.
- **`plans` table** still has `paddle_price_id_monthly` / `paddle_price_id_annual` and a `plan_tier` enum — annual is NOT offered at launch; the enum may still hold old `starter/pro/business` values (per MEMORY.md schema notes) rather than the new 4-tier names. **Flag for verification at Paddle wire-up.**

---

## 3. VERTICALS (3 launch ICPs)

| Vertical | Persona | Best-fit tier | Approval style | Discovery / deliverable mix differences |
|---|---|---|---|---|
| **B2B SaaS** (<$5M ARR) | Sam, founder / VP marketing | Growth $999 | Approve content + outreach; auto on schema/citations/listings | Multi-page sites (product/pricing/docs/blog/changelog); marketing-voice content matters most. Landing `/saas`. Likely English-first. |
| **Solo / Small-firm Lawyer** | Dana, solo attorney / managing partner | Scale $1,499 | **Mandatory human-approve on every content/email/outreach** (YMYL, ethics rules) — overrides preferences | Practice-area pages tracked separately; legal directories (Avvo/Justia/FindLaw) are key citation sources. Landing `/legal`. English-first. |
| **Single-Location Dental** | Eli, owner-dentist | Starter $499 → Growth at 2nd location | Weekly digest by email, mobile 1-click; no phone calls; auto on schema/citations/listings + 1-click FAQ | Local-SEO overlay (GBP + listings + reviews already understood); incremental not new behavior. Landing `/dental`. HE for Israeli, EN for US. |

**Shared:** 3 vertical landing pages, 3 discovery script variants (loaded by vertical-tagged signup), separate case-study tracks per vertical. **Deferred to MVP+90:** HVAC/plumbing (dropped entirely), real estate, DTC e-commerce, non-dental healthcare. Pre-pivot personas Yael + Avi retired.

---

## 4. DATA MODEL (key tables — ERD-ready)

### Core / Identity (`100003_core_tables`)
- **plans** — tier catalog; `tier` (plan_tier enum), Paddle price IDs, `monthly_credits` (legacy). Seed table.
- **user_profiles** — extends `auth.users`; onboarding/day1 state, timezone, kill-switch, GDPR soft-delete. PK = auth.users(id).
- **businesses** — one per user (MVP); name, website, industry, language, services[]. → `user_id` FK.
- **subscriptions** — Paddle subscription state, period/trial dates, `cancelled_at`. → `user_id`, `plan_id`. North-star source (month-3 retention).
- **paddle_webhook_events** — idempotency by Paddle `event_id` (PK).

### Scans (`100006_scans`)
- **scans** — top-level scan run per business (free/manual/scheduled). → `business_id`.
- **scan_engine_results** — one row per engine per scan; rank/mention/sentiment/citations. → `scan_id`, `business_id`.
- **query_clusters** → `business_id`. **tracked_queries** → `business_id`, `cluster_id`. **query_positions** — historical position per query per scan → `scan_id`, `business_id`, `query_id`.

### Agents / Jobs (`100007_agents`)
- **agent_jobs** — one per agent run; type/status/stage/plan_tier, `scan_id`, `credit_cost` (legacy), `inngest_run_id`. → `user_id`, `business_id`.
- **agent_job_outputs** — deliverable content; format, geo_signals, `ymyl_flagged`, estimated_impact. → `job_id`.
- **agent_costs** — one row per LLM call; model/provider/tokens/cost_usd. → `job_id`, `user_id`.
- **page_locks** — concurrency guard, unique (business_id, url), 2h TTL.
- **topic_ledger** + **topic_ledger_archive** — dedup, unique (business_id, topic_key), 365-day retention.

### Credits (`100005_credits`) — LEGACY (pre-pivot; superseded by deliverable caps)
- **credit_pools** — monthly allocation per user/plan/period (base/rollover/topup/used). **credit_transactions** — audit trail. **credit_holds** — TOCTOU-safe hold-per-job (PK=job_id, 30-min expiry). **daily_cap_usage** — per-user/agent/day run cap.

### Inbox / Approvals (`100008_inbox` + `agency_tables`)
- **content_items** — canonical body store (shared by inbox + archive). → `business_id`, `job_id`.
- **inbox_items** — items awaiting review (inbox_status). → `content_item_id`, `job_id`.
- **archive_items** — approved/archived content. → `content_item_id`, `inbox_item_id`.
- **approval_queue** (agency) — human gate for all agency actions; `kind` (approval_kind), `state` (approval_state), signed `approval_token`, `digest_id` FK, 7-day expiry. → `customer_id` (user_profiles).

### Automation (`100009_automation`)
- **automation_schedules** — recurring agent runs (cron). **suggestions** — proactive agent suggestions, Day-1 staggered `visible_at`, → `converted_job_id`. **system_kill_switch** — singleton global pause (id=1).

### Signals (`100010_signals`)
- **notifications** — user alerts. **url_probes** — cross-tenant-locked PK (business_id, url, queued_at). **competitors** + **competitor_results** (→ scan_id). **citation_signals** — per-engine/query cited-URL for Home panel.

### Agency (`20260525000001_agency_tables`) — pivot delta
- **brand_fingerprints** — 1 per customer; voice/icp/offerings/owner_identity (jsonb), do/dont lists, `adam_reviewed_at` gate (#1–50), confidence/evidence/approval_style/hard_nos, `brief_version_id`. PK = `customer_id` (user_profiles).
- **deliverables_per_customer_per_month** — tier-cap counters (schema/faq/citation/content/outreach + locations/engines/prompts). PK (customer_id, month_anchor).
- **publishing_credentials** — encrypted OAuth tokens per platform (publishing_platform enum); never returned in API. Unique (customer_id, platform, external_account_id).
- **refund_events** — append-only Paddle refund ledger (UPDATE/DELETE blocked by trigger); `founding_100_cohort` flag.
- **founding_100_cohort** — first 100 paying customers, `cohort_number` 1–100 unique, refund-risk flag.
- *(approval_queue defined here too — see Inbox/Approvals.)*

### Digests (`20260529000006_weekly_digests` — REBUILT from Wave 1 version)
- **weekly_digests** — one per **business** per week; `week_of`, `payload_json` (DigestPayload), `rendered_html`, `status` (draft/sent/failed). → `customer_id` references **businesses(id)** (note: Wave 1 version referenced user_profiles; rebuilt 2026-05-29 to be per-business). RLS read-own; service-role sole writer.

### Key relationship spine
```
auth.users ─1:1─ user_profiles ─1:N─ businesses ─1:N─ scans ─1:N─ scan_engine_results
                       │                    │
                       │                    ├─1:N─ tracked_queries / query_clusters / query_positions
                       │                    ├─1:N─ agent_jobs ─1:N─ agent_job_outputs / agent_costs
                       │                    ├─1:N─ content_items ─ inbox_items ─ archive_items
                       │                    └─1:1(per week)─ weekly_digests   (per-business)
                       │
                       ├─1:1─ brand_fingerprints
                       ├─1:N─ approval_queue ──FK── weekly_digests.digest_id
                       ├─1:N─ subscriptions / credit_pools (legacy) / refund_events
                       ├─1:N─ publishing_credentials
                       ├─1:1(per month)─ deliverables_per_customer_per_month
                       └─1:1─ founding_100_cohort
```
**⚠️ Mixed FK target:** most agency tables reference `user_profiles(id)` as `customer_id`, but rebuilt `weekly_digests.customer_id` references `businesses(id)`. Naming collision on `customer_id` — flag for ERD clarity.

---

## 5. ROADMAP WAVES

| Wave | Name | Ships |
|---|---|---|
| **Wave 0** | Foundation (unchanged) | Hard reset of `apps/web/`; Next.js 16 / React 19 / TS strict / Tailwind / Shadcn scaffold; Supabase + RLS + base schema; Supabase Auth (magic links); Paddle subs + webhooks (HMAC); Inngest registered; Resend transactional infra. |
| **Wave 0.5** | Quality bar (unchanged) | ESLint + Prettier + strict TS; pre-commit hooks; GitHub Actions CI; Sentry/observability; Vitest + Playwright scaffolding. |
| **Wave 1** | Acquisition → Activation (rescoped) | Brand fingerprint schema + UI; Discovery agent; Brand-brief manager agent; free-scan → discovery-booking; Outcomes dashboard v1; Approval Queue UI; 3 vertical landing pages; Paddle checkout wired to 4 tiers. |
| **Wave 2** | Recurring Delivery (rescoped) | Deliverables tracking + tier-cap enforcement; Approval-gate writer agent; Digest-writer agent + Weekly Digest Archive; Customer-success agent; held-revenue accounting; Traceability page; one-click cancel + auto-refund in 60-day window. |
| **Wave 3** | Publishing Integrations Matrix (NEW) | Publisher agent; auto-push integrations (WP/Shopify/Webflow/GBP/Yelp/Apple Maps/SendGrid sub-account/GTM); paste-ready generator (Wix/Squarespace/custom); Strategy agent (monthly briefs, Professional). |
| **Post-MVP+90** | Deferred | Annual billing; premium uptime SLA; additional verticals; Video/YouTube SEO; "State of AI Search" annual report; white-label per-client. |

**Sequencing (decision #14 / A10):** Wave 3 runs AFTER Wave 2 ships to a paying customer (NOT parallel). Customer #1 onboards on Wave 1+2 only. Flips to parallel if customer #1 books before Wave 2 completes.

**North star:** Month-3 retention rate (old free-scan-completion rate RETIRED). Target 80%, watch-trigger <70% for 2 cohorts.
