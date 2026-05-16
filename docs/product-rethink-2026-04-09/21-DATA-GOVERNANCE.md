# Data Governance — GDPR, Retention, Backups, DR

**Status:** Authoritative. Pre-launch blocker for EU customers.
**Owner:** Wave 2 backend stretch + Wave 2 devops-lead.
**Resolves:** Missing-perspectives audit C5 + I6 + Adam-checklist amendment.
**Date:** 2026-05-13.

EU customers can sign up from Day 1. The plan needs a deletion path (GDPR Article 17), a data-portability export (Article 20), defined retention windows, and a disaster-recovery posture. Without these, EU enforcement is a Day-2 risk and a single corrupted Supabase node is an existential one.

---

## GDPR Article 17 — Right to deletion

### User-initiated deletion flow

1. **Settings → Privacy panel** exposes a "Delete my account" button (Wave 1 FE-3 stretch OR Wave 2).
2. Click → confirmation modal: "This deletes your account in 30 days. You can cancel anytime in the next 30 days by logging back in."
3. Confirm → `POST /api/account/delete` (server route).
4. Server sets `user_profiles.deleted_at = NOW()` + `user_profiles.deletion_scheduled_for = NOW() + INTERVAL '30 days'`.
5. Inngest event `account.deletion_scheduled` fires → triggers cancellation of any active Paddle subscription (refund handled per policy) + pauses all schedules + sends confirmation email.
6. Soft-deleted state: user can still log in for 30 days. Logging in clears `deleted_at` and `deletion_scheduled_for` (un-delete).
7. After 30 days: Inngest cron `account-purge` (daily 4am UTC) finds rows where `deletion_scheduled_for < NOW()` and cascades hard-delete.
8. Audit trail: every step writes to `data_deletion_log` table (PK: user_id, action, timestamp). Retained 7 years per compliance.

### Cascade hard-delete order

Inngest `account-purge` function deletes in this order (FK constraints):
1. `agent_jobs` rows for user's businesses
2. `inbox_items`, `archive_items` for user's businesses
3. `suggestions`, `notifications` for user
4. `query_positions`, `scan_engine_results` linked to user's scans
5. `scans` for user's businesses
6. `competitors`, `tracked_queries`, `url_probes` for user's businesses
7. `businesses` for user
8. `credit_pools`, `daily_cap_usage`, `subscriptions` for user
9. `user_profiles` row itself (last)

**Billing records retained 7 years** per Israeli tax law: copy minimal subscription history (user_id hash + Paddle transaction IDs + amounts + dates) to `billing_archive` table BEFORE cascade. Billing archive is hashed-PII (email hashed, name dropped) — supports audit without retaining personal data.

### Manual / Article 17 request via support

If user emails `support@beamixai.com` requesting deletion (rather than using in-app):
1. Adam manually fires `POST /api/account/delete` from admin dashboard OR via Supabase Studio SQL.
2. Same 30-day soft-delete window applies.
3. Adam confirms via reply email within tier SLA.

---

## GDPR Article 20 — Right to data portability

### `GET /api/account/export`

- Authenticated user-only endpoint. Returns JSON dump of all user-owned data.
- Response is a `application/json` download — 200 OK + `Content-Disposition: attachment; filename="beamix-export-{user_id}-{date}.json"`.
- Rate-limited to 1 export per 24h (otherwise abuse vector — large JSON over and over).

**Export contents:**
- `profile` — `user_profiles` row (excluding sensitive internals like `kill_switch_until`)
- `businesses` — all rows + nested:
  - `scans` (last 90d)
  - `tracked_queries`
  - `competitors`
- `agent_jobs` (last 90d, status + output URLs only — not full content if storage size prohibits)
- `inbox_items` (all, with markdown content)
- `archive_items` (all, with markdown content + publish URLs)
- `suggestions` (last 30d)
- `notifications` (last 30d)
- `subscriptions` (full history)

**Out of scope for export:** audit_log, llm_cost_events, paddle_webhook_events, internal analytics — these are Beamix operational data, not user-owned.

---

## Retention windows

Locked retention table — DB cron jobs enforce these:

| Table | Retention | Trigger | Justification |
|-------|-----------|---------|---------------|
| `scans`, `scan_engine_results`, `query_positions` | 90 days post-subscription-cancellation | Inngest weekly cron | User-owned content; 90d window covers re-onboarding |
| `free_scans` | 90 days from `created_at` | Inngest weekly cron | Anonymous scans; conversion window expired |
| `agent_jobs` | 90 days post-cancellation | Inngest weekly cron | Operational; outputs preserved in inbox_items/archive_items |
| `inbox_items`, `archive_items` | Indefinite (user assets) until account deletion | N/A | User content; only purged on account deletion |
| `suggestions` | 30 days from `created_at` regardless of status | Inngest daily cron | Suggestions are transient; rules will re-fire |
| `notifications` | 90 days from `created_at` | Inngest daily cron | In-app notification volume control |
| `audit_log` | 7 years | N/A (no auto-delete) | Compliance + dispute resolution |
| `llm_cost_events` | 13 months | Inngest monthly cron | Rolling 12-month cost analysis + 1mo buffer |
| `paddle_webhook_events` | 7 years | N/A (compliance) | Tax + dispute evidence |
| `billing_archive` (post-deletion) | 7 years | N/A | Israeli tax law |
| `data_deletion_log` | 7 years | N/A | Compliance proof |
| `topic_ledger` | 365 days from last `cluster_used_at` | Inngest monthly cron | Per `05-DB-MIGRATION-PLAN.md` Fix Agent 4 F8 |
| `page_locks` | Auto-expire 2 hours from creation | Inngest hourly cron | Per `05-DB-MIGRATION-PLAN.md` Fix Agent 4 F8 |
| `url_probes` | 180 days from queued_at | Inngest weekly cron | Probe history is operational |

**Per-table retention jobs live in:** `apps/web/src/inngest/functions/retention/<table>.ts` (Wave 2 backend stretch).

---

## Backups + Point-in-Time Recovery

### Supabase Pro plan upgrade (mandatory)

- **Project:** `beamix-v2-prod` upgraded to Supabase Pro.
- **Cost:** $25/mo.
- **What it ships:**
  - Daily PITR (point-in-time recovery)
  - 7-day backup retention window
  - Read replicas (deferred — Pro tier has them; we don't use yet)
  - $10 in compute included
- **Adam checklist:** [BLOCKING for Wave 2] item in `06-ADAM-CHECKLIST.md`.

### RTO / RPO targets

- **RPO (Recovery Point Objective):** 24 hours. We can lose at most 24h of writes in a worst-case scenario.
- **RTO (Recovery Time Objective):** 4 hours. From P0 incident detection to service restored.
- These are MVP targets. Re-evaluate at 100 paying customers.

### Restore drill

- **One full restore drill** before launch — devops-lead walks through: trigger PITR restore to a staging branch, verify data integrity via sample queries, document the procedure in `docs/RUNBOOKS/disaster-recovery.md`.
- **Quarterly drill thereafter** — re-run, update runbook with any process changes.
- Drill checklist (in the runbook):
  1. Identify the target restore time
  2. Trigger Supabase PITR via dashboard or API
  3. Wait for clone to complete (~10–30 min)
  4. Sample-query: `SELECT count(*) FROM user_profiles`, `SELECT count(*) FROM subscriptions`, etc.
  5. Verify auth still works on the cloned project
  6. Document elapsed time, blockers, fixes
  7. Tear down clone (cost control)

### Off-Supabase backup (P2 — defer post-MVP)

Daily logical pg_dump to S3 / Backblaze. Provides protection if Supabase itself has a catastrophic platform incident. Not required for MVP but added once first 50 paying customers exist.

---

## Disaster recovery runbook

Path: `docs/RUNBOOKS/disaster-recovery.md` — Wave 2 devops-lead writes during Wave 2.

**Scenarios covered:**
1. **Supabase outage** (whole region down) — wait for Supabase status page green; document past-incident steps Adam takes (notify customers via status page + email, post-incident postmortem)
2. **Data corruption** (bad migration, app bug deleting rows) — PITR to pre-incident timestamp, manual data verify, communicate downtime to affected users
3. **Vercel outage** — point `app.beamixai.com` DNS at a static "we're aware, working on it" page hosted on Cloudflare Pages or similar
4. **LLM provider outage** (Anthropic down) — kill switch all schedules, send email to customers ("agents temporarily paused, your subscription is paused as well"), resume + auto-credit when restored
5. **Paddle outage** — checkout fails open with user-facing "payment issue — try again in a few minutes"
6. **Catastrophic platform failure** (loss of all data) — restore from Supabase backup; if Supabase backup unavailable, restore from off-Supabase backup (P2); communicate honestly, refund affected customers

---

## Subprocessors (DPA-grade list)

Synchronized with `18-LEGAL-PUBLISHING-PLAN.md` §Privacy Policy:

| Subprocessor | Purpose | Data | Location |
|--------------|---------|------|----------|
| Supabase | DB, auth, storage | All user data | Frankfurt (EU) |
| Paddle | Payment processing | Billing data | EU/US (merchant-of-record) |
| Inngest | Job orchestration | Job metadata (no content) | US |
| OpenRouter | LLM routing (Gemini, GPT, Perplexity) | Scan prompts (anonymized) | US |
| Anthropic | LLM (primary Claude API) | Agent prompts + outputs | US |
| Perplexity | Sonar API (citation verification) | Verification prompts | US |
| Resend | Transactional email | Email content + recipient | EU |
| PostHog | Product analytics | Event data | EU (Frankfurt) |
| Sentry | Error monitoring | Sanitized error traces | EU |
| Vercel | Hosting + CDN | Request logs + static assets | US/EU edge |

US transfers covered by Standard Contractual Clauses (SCCs) per each vendor's DPA.

---

## Implementation — Wave 2 split

| Task | Owner | Deliverable |
|------|-------|-------------|
| `POST /api/account/delete` + Inngest `account-purge` | Wave 2 backend stretch | API + job + Vitest |
| Settings → Privacy panel UI | Wave 1 FE-3 stretch OR Wave 2 frontend | Component + button + confirmation modal |
| `GET /api/account/export` | Wave 2 backend stretch | API + JSON shape + rate limit |
| Retention cron jobs (per table) | Wave 2 backend stretch | One Inngest function per table from the retention table above |
| Supabase Pro upgrade | Adam manual | Listed in `06-ADAM-CHECKLIST.md` |
| `docs/RUNBOOKS/disaster-recovery.md` | Wave 2 devops-lead | Markdown runbook |
| `docs/RUNBOOKS/admin-manual-ops.md` | Wave 2 devops-lead | Markdown runbook |
| One full restore drill | Wave 2 devops-lead + Adam | Document in runbook |

---

## Adam manual checklist

- [ ] **Upgrade `beamix-v2-prod` to Supabase Pro plan** ($25/mo) — [BLOCKING for Wave 2]. Done from Supabase dashboard.
- [ ] Run the restore drill with devops-lead before launch.
- [ ] Confirm Israeli tax law 7-year billing retention with accountant.
- [ ] Schedule quarterly restore drills on personal calendar.

---

## Status

- [x] GDPR Article 17 deletion flow specced (soft-delete 30d + cascade)
- [x] GDPR Article 20 portability export specced
- [x] Retention windows locked per table (13 tables)
- [x] Backup posture: Supabase Pro + PITR + 7-day window
- [x] RTO 4h / RPO 24h locked
- [x] Restore drill cadence: pre-launch + quarterly
- [x] Subprocessor list locked
- [x] DR runbook scoped (Wave 2 devops-lead writes)
- [ ] Adam: Supabase Pro upgrade
- [ ] Wave 2: backend stretch + devops-lead deliver
