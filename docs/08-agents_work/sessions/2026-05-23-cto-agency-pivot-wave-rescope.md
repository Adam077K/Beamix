---
date: 2026-05-23
agent: cto
session_slug: agency-pivot-wave-rescope
status: COMPLETE
qa_verdict: n/a (planning session, no code shipped)
tier: planning
linear_ticket: (none — CEO agency-pivot dispatch 2026-05-23)
files_edited: 10
files_created: 2
---

# CTO — Agency Pivot Wave Rescope (2026-05-23)

## Mission

CEO dispatched 15-decision agency pivot (see `docs/08-agents_work/sessions/2026-05-23-ceo-agency-pivot-grill.md` + `.claude/memory/DECISIONS.md` 2026-05-23 entry). Engineering scope: rescope existing Wave 0/0.5/1/2 plans, write a NEW Wave 3 brief for publishing integrations, update all 5 system-design docs + engineering principles + DB migration plan + execution plan to reflect agency surface.

## Decisions made (architectural)

| # | Decision | Reversibility |
|---|---|---|
| A1 | **Brand-fingerprint storage:** new `brand_fingerprints` table — discovery-call output captured as structured JSONB (voice, ICP, offerings, citations, do/don't list, owner identity). One per customer. Updated by Brand-brief manager agent. | HARD — touches identity contract for every customer-facing agent |
| A2 | **Approval queue model:** new `approval_queue` table — every gated action (content publish, email-as-them, outreach) writes a row with `state ∈ ('pending','approved','rejected','expired','published')`. Customer 1-click via signed token in weekly digest email. 7-day expiry default; auto-publish on expiry only if customer opted in during onboarding (default off). | LITE — table can be dropped + recreated; no external state |
| A3 | **Auto vs gated rule (locked from decision #2):** auto = citations, listings (GBP/Yelp/Apple), schema (via GTM or platform API), scan runs. Gated = content publish, email-as-them, external outreach. Encoded as a `gating_rules` static config (`apps/web/src/lib/approval/rules.ts`), not a DB table — these change with product policy, not customer policy. | LITE |
| A4 | **Held-revenue accounting:** Paddle webhook writes to `subscriptions.held_until` (day +60); `revenue_events` ledger has `booked_at` (day 61) vs `received_at` (day 0). Refund event flips `held_until → refunded_at` and writes `refund_events` row. ARR/MRR dashboards read from `booked_at`, not `received_at`. | FULL — touches money flow |
| A5 | **Publishing credentials table:** `publishing_credentials` per (customer_id, platform) with `encrypted_token` (pgcrypto sym key, server-only), `scopes`, `expires_at`, `last_refreshed_at`, `last_health_check`. Every OAuth integration uses the same shape. | IRREVERSIBLE — schema deletion would orphan customer integrations |
| A6 | **Deliverables tracking:** new `deliverables_per_customer_per_month` table tracks tier-gate consumption (schema_pushed_count, faq_published_count, citation_submitted_count, outreach_email_count). Reset monthly on subscription anniversary. Read by tier-gate middleware to throttle agent runs. | LITE |
| A7 | **Weekly digest worker:** new Inngest cron `digest-builder` runs Sundays 16:00 customer-local time, assembles weekly_digest row from approval_queue + visibility deltas + win highlights, sends via Resend. | LITE |
| A8 | **Customer-facing API never returns agent names.** All endpoints return outcome-shaped DTOs (`{ resource, status, evidence_url, approval_required }`). Internal `apps/web/src/lib/agents/` keeps agent identities. Enforced in API contract review. | EASY (code review pattern) |
| A9 | **Publishing actions are Irreversible tier** in the QA gate matrix. Every PR touching `apps/web/src/lib/publishing/<platform>/` triggers Full + multi-judge + Adam sign-off. Reversed-by-default if QA-Lead spawns a rollback plan in the same PR. | EASY (qa-tier-floor.yml entry) |
| A10 | **Wave 3 is sequenced AFTER Wave 2 ships** to a paying customer, not in parallel. Rationale: publishing integrations against real customer properties require approval-queue + held-revenue accounting + audit trail to be live first. Decision can flip to parallel if customer #1 books before Wave 2 completes. | EASY (sequencing call, not code) |

## Files edited (10)

1. `docs/product-rethink-2026-04-09/build-prep-2026-05-13/00-INDEX.md` — index updated for agency-pivot, Wave 3 added, Wave 1/2 rescope flagged
2. `docs/product-rethink-2026-04-09/build-prep-2026-05-13/09-WAVE-1-BRIEF.md` — agency-pivot delta section at top; legacy content marked superseded
3. `docs/product-rethink-2026-04-09/build-prep-2026-05-13/10-WAVE-2-BRIEF.md` — agency-pivot delta section at top; deliverables/digest/held-revenue scope added
4. `docs/03-system-design/ARCHITECTURE.md` — agency-pivot architecture delta prepended
5. `docs/03-system-design/DATABASE_SCHEMA.md` — new tables for agency pivot prepended; legacy table flags
6. `docs/03-system-design/API_CONTRACTS.md` — new agency endpoints + deprecation flags for tool-product endpoints
7. `docs/03-system-design/AI_AGENTS.md` — 7 new + 4 repurposed customer-facing agents + orchestration pattern
8. `docs/03-system-design/TECH_STACK.md` — publishing integration libraries added
9. `docs/ENGINEERING_PRINCIPLES.md` — 4 new principles (no agent names in API, publish-action logging, held-revenue enforcement, refund-events append-only)
10. `docs/product-rethink-2026-04-09/build-prep-2026-05-13/05-DB-MIGRATION-PLAN.md` — agency-pivot schema additions in fresh-schema migration
11. `docs/product-rethink-2026-04-09/11-EXECUTION-PLAN.md` — engineering delta (kept/rescoped/killed table)

## Files created (1)

- `docs/product-rethink-2026-04-09/build-prep-2026-05-13/11-WAVE-3-BRIEF.md` — publishing integrations matrix

## Wave 3 summary

**MVP integrations (Wave 3 — ship before paying customer #1 actually publishes):**
- WordPress REST API + Beamix WP plugin (M, Irreversible)
- Schema injection via Google Tag Manager (M, Full)
- SendGrid sub-account-as-them (L, Irreversible — touches customer DNS)
- Paste-ready content generator for Wix/Squarespace/custom CMS (S, Lite)

**Wave 3 stretch (ship if time allows before #1):**
- Google My Business API (M, Irreversible)
- Shopify Admin API + OAuth flow (L, Irreversible)

**Deferred to Wave 4 (MVP+30 or first-customer-on-platform):**
- Webflow API (M, Irreversible)
- Ghost Admin API (S, Full)
- Yelp Fusion API — research current API status; **flag: Yelp restricted business API access in 2024**, fallback to paste-ready
- Apple Business Connect API (M, Irreversible)

**Total Wave 3 MVP effort estimate:** L (3 of 4 are M+; SendGrid sub-account-as-them is the highest-risk piece due to DNS / DMARC alignment per customer).

## Consistency findings (contradictions flagged)

1. **Credit-pool UI:** `docs/04-features/specs/credits-spec.md` (if it exists) and references in `09-WAVE-1-BRIEF.md` to "AI Runs" credit counters contradict decision #7 (no credit counters in dashboard). Marked for migration in DB plan and flagged in Wave 1 rescope.
2. **Free-scan → dashboard import flow** (described in old `MEMORY.md`, `09-WAVE-1-BRIEF.md` FE-2 references, and `auth-onboarding-spec.md`) contradicts decision #6 (free scan → discovery → tiered subscription). Wave 1 rescoped to: free scan → discovery-booking funnel. Old flow flagged for deprecation.
3. **`plan_tier` enum** in `05-DB-MIGRATION-PLAN.md` is `('discover','build','scale')` — contradicts decision #9 new tiers (`starter`, `growth`, `scale`, `professional`). Enum needs to flip before any Paddle product is provisioned.
4. **Agent names exposed in API** (`/api/agents/run` in current spec) contradicts decision #7 (no agent names). Endpoint rename to outcome-shaped path (`/api/approval/:id/approve`, `/api/publish/:platform/:resource`) flagged in API contracts.
5. **Old pricing tiers** ($79/$189/$499) still referenced in `06-ADAM-CHECKLIST.md` Paddle setup section. Adam must reconfigure Paddle products for new tiers ($499/$999/$1,499/$2,499) before Wave 0 BE work touches billing.
6. **Inngest tier strategy** (`MEMORY.md project_inngest_tier_strategy`): free tier → Pro at ~5 paying customers. Agency pivot adds digest builder + publishing-action workers, which doubles Inngest step count. Trigger to upgrade may now be ~3 paying customers. Flagged in TECH_STACK update.

## Blockers

None at engineering layer. All blockers are upstream (CPO writing 7 agent PRDs, CBO procuring liability insurance, CMO writing landing pages). CTO work is independent of these.

## Next steps

1. CTO + CPO sync on agent PRD paths so `AI_AGENTS.md` can reference them precisely
2. CTO briefs database-engineer to draft new tables as additive migrations (not into fresh-schema yet — wait for QA-Lead approval of the schema delta)
3. CTO briefs backend-engineer to scaffold `apps/web/src/lib/publishing/<platform>/` directory tree with stub interfaces
4. CTO briefs security-engineer to threat-model the `publishing_credentials` encrypted-token storage + SendGrid sub-account DNS verification flow
5. Wave 3 brief ready to paste once Wave 2 ships
