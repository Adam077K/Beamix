---
date: 2026-05-25
author: ceo (session ceo-2-1779270079)
purpose: Self-contained CTO dispatch brief for Wave 1 build
status: READY-TO-USE
target: paste into fresh CTO session
---

# Wave 1 Dispatch Brief — CTO

> **Paste this brief verbatim into a fresh CTO session. The CTO will then spawn engineering workers in parallel worktrees per Beamix's 3-layer org pattern.**

---

## Mission

Build Wave 1 of the **Beamix agency-pivot product**: the customer-facing surface from free scan → discovery booking → 30-min text discovery agent → brand fingerprint capture → outcomes dashboard v1 + approval queue shell. This is the first time customers can experience the done-for-you agency product. Wave 1 ships to staging, gated by QA-Lead Full-tier review before any production cutover.

## Authoritative source documents (read FIRST, all paths from repo root)

| What | Where |
|---|---|
| 15 locked product decisions | `.claude/memory/DECISIONS.md` → 2026-05-23 + 2026-05-24 entries |
| Wave 1 scope (rescoped for agency model) | `docs/product-rethink-2026-04-09/build-prep-2026-05-13/09-WAVE-1-BRIEF.md` |
| Infrastructure prerequisites + vendor picks | `docs/product-rethink-2026-04-09/build-prep-2026-05-13/00-INDEX.md` (Infrastructure prerequisites section) |
| Adam-blocker checklist | `docs/product-rethink-2026-04-09/build-prep-2026-05-13/06-ADAM-CHECKLIST.md` (AB-1, AB-2, AB-3 are Wave 1 blockers) |
| Agent PRDs (Wave 1) | `docs/04-features/specs/agent-discovery.md` + `agent-brand-brief-manager.md` |
| DB schema additions | `docs/03-system-design/DATABASE_SCHEMA.md` (new tables: brand_fingerprints, approval_queue, deliverables_per_customer_per_month, publishing_credentials, weekly_digests, refund_events, founding_100_cohort) |
| API contracts | `docs/03-system-design/API_CONTRACTS.md` (agency endpoints + deprecation of tool endpoints) |
| Engineering principles | `docs/ENGINEERING_PRINCIPLES.md` (no agent names in API responses, publish-action logging, held-revenue enforcement) |
| Prior CTO architectural decisions | `docs/08-agents_work/sessions/2026-05-23-cto-agency-pivot-wave-rescope.md` (10 decisions A1-A10) |
| Prior CTO infra gap scoping | `docs/08-agents_work/sessions/2026-05-24-cto-infra-gap-scoping.md` |
| QA tier matrix | `.claude/qa-tier-floor.yml` |

## Adam-blockers — verify status BEFORE spawning workers

| Blocker | Wave 1 task it blocks | How to verify |
|---|---|---|
| **AB-1 Cal.com** | W1.2 Discovery booking funnel | `echo $NEXT_PUBLIC_CALCOM_DISCOVERY_LINK` returns non-empty; `dig CNAME` resolves; `CALCOM_WEBHOOK_SECRET` in Vercel env |
| **AB-2 Resend DNS** | BE-3 transactional email (welcome, digest, approval pings) | `dig TXT notify.beamixai.com` returns SPF; `dig CNAME resend._domainkey.notify.beamixai.com` resolves; `dig TXT _dmarc.beamixai.com` returns DMARC |
| **AB-3 Paddle products** | BE-2 tier rename | `echo $PADDLE_VENDOR_ID` non-empty; 8 price IDs in env (Starter monthly+annual minimum to unblock; rest parallel) |

**If any of AB-1/2/3 are not done, STOP. Report blockers to Adam. Do not spawn workers on blocked paths. Other paths can proceed in parallel.**

## Wave 1 scope (build these)

### Group A — Database + Auth foundations (database-engineer + backend-engineer parallel)

1. **DB migration** for the 7 new agency tables (brand_fingerprints, approval_queue, deliverables_per_customer_per_month, publishing_credentials, weekly_digests, refund_events, founding_100_cohort) per `docs/03-system-design/DATABASE_SCHEMA.md`. Include RLS policies per Beamix `supabase-rls-beamix` skill (per-user row access; service-role bypass for Inngest jobs). pgcrypto setup for `publishing_credentials.encrypted_token`.
2. **Migration plan** per `05-DB-MIGRATION-PLAN.md`: staging-first, no destructive ops without double-confirm, rollback script written before forward migration. **Irreversible tier** in QA gate per `.claude/qa-tier-floor.yml` — multi-judge + Adam sign-off.
3. **Tier-aware subscription model** — rename existing $79/$189/$499 plan_tier enum values to Starter/Growth/Scale/Professional. Old enum values become deprecated_*. Map via DB migration; staging-only first.
4. **Held-revenue accounting** — `subscriptions.held_until` column + `revenue_events` ledger table (booked_at, received_at). ARR/MRR dashboards read from booked_at. Per CTO decision A4.

### Group B — Free scan → discovery booking funnel (backend-engineer + frontend-engineer parallel)

5. **Free scan endpoint** rate limiting per CTO B6 spec: per-IP 3/day + per-email 1/day + per-domain 2/week + Turnstile + honeypot + WHOIS <30-day domain reject + CIDR allowlist via `RATE_LIMIT_ALLOWLIST` env + signed-token allowlist (`?adamkey=...` 24h tokens via `ADAMKEY_SALT` env) for warm-network DMs.
6. **Scan results page** — agency-framing copy ("Here are 47 issues we found. We'll fix them all for you. Book a 30-min discovery →"). NO agent names. CTA → embedded Cal.com booking widget.
7. **Discovery booking page** at `/discovery` — embeds Cal.com Individual event type (NEXT_PUBLIC_CALCOM_DISCOVERY_LINK). Captures email + scan_id at booking. Webhook handler (`/api/webhooks/calcom`) validates `CALCOM_WEBHOOK_SECRET`, creates `discovery_sessions` row, fires Inngest event `discovery.booked`.
8. **Rate limit /api/discovery/book** per-IP 5/day + per-email 1/day.

### Group C — Discovery agent + brand fingerprint (ai-engineer + backend-engineer parallel)

9. **Discovery agent** per `docs/04-features/specs/agent-discovery.md`. Text-only Sonnet streaming via SSE (voice deferred to MVP+90 per CTO B2). VoiceSession adapter stub interface in place. 15–25 adaptive questions. Pulls live site (via fetch + Cheerio) + GBP scrape during call. Output: structured brand brief JSON.
10. **Brand-brief manager agent** per `docs/04-features/specs/agent-brand-brief-manager.md`. Maintains + evolves the brief over time. YMYL always-human gate per CEO sub-decision #4 (when YMYL content detected → force human approval regardless of tier default).
11. **`/api/discovery/chat`** endpoint — SSE stream, signed session token, persists messages to `discovery_sessions.messages` JSONB.
12. **Brand brief generator** — at end of discovery, agent calls a structured-output Claude tool to produce `brand_fingerprints` row. Customer reviews + corrects in UI. **brief_version_id** required on every downstream artifact (per CPO decision).

### Group D — Outcomes dashboard v1 shell (frontend-engineer)

13. **Customer dashboard** at `/dashboard` — outcomes-only per decision #7. Three panels: (a) AI visibility score per engine (placeholder cards, real data flows from Wave 2), (b) "This week we got you..." narrative (empty state with "Setup in progress" until first scan delivers), (c) approval queue counter + link. NO agent names ANYWHERE in DOM. Use outcome-shaped DTOs from API.
14. **Approval queue UI shell** at `/approvals` — table of pending items with approve/reject buttons. Real items flow in Wave 2; for Wave 1 ships with empty state + UX validated.

### Group E — Transactional email scaffolding (backend-engineer)

15. **Welcome email** after discovery completion. Resend template, sends from `notify.beamixai.com`.
16. **Approval-pending email** template (used Wave 2; ship scaffolding now).
17. **Domain + business verification** at signup (per refund guardrail #2). Email verification + WHOIS check + LinkedIn business-domain match where available.

## Out of scope for Wave 1 (push to Wave 2)

- Deliverables tracking + tier-gate enforcement → Wave 2
- Weekly digest cron job → Wave 2
- Held-revenue automation (table exists in Wave 1; cron + Paddle integration in Wave 2)
- Founding-100 cohort tracking → Wave 2
- Publishing integrations matrix → Wave 3 (after Wave 2 ships customer #1)
- Voice for Discovery agent → MVP+90
- Customer success agent → Wave 2
- Strategy agent → Wave 3
- Approval-gate writer agent → Wave 2

## Worker dispatch pattern

Per CLAUDE.md: every code worker creates its own isolated git worktree off main. Worker tree convention:

```
$MAIN_REPO/.worktrees/[worker-slug]-[task]
branch: feat/[task-slug]
```

**Parallel dispatch — spawn in ONE message:**
- `database-engineer-w1-migrations` (Group A)
- `backend-engineer-w1-funnel` (Group B)
- `backend-engineer-w1-discovery-api` (Group C #11)
- `ai-engineer-w1-discovery-agent` (Group C #9 + 10)
- `frontend-engineer-w1-dashboard` (Group D)
- `backend-engineer-w1-email-scaffolding` (Group E)

Spawn at most 6 workers in parallel. Use the `worktree-isolation-pattern` skill. Each worker returns structured JSON (status, branch, worktree, files_changed, summary).

## Agent identity (per CLAUDE.md naming rules)

- CTO session: `/name cto-wave1` `/color blue`
- Workers: `/name [role]-w1-[task-slug]`, color per role

## QA gate

**Wave 1 ships at the Full tier** (touches API + DB + auth + paying-customer surface). DB migration sub-tasks are **Irreversible** (multi-judge + Adam sign-off, no exceptions per CTO decision A9).

QA-Lead spawns:
- Lite: code-reviewer + qa-engineer + semgrep
- Full: + security-engineer + craft-reviewer + Codex CLI second opinion
- Irreversible: + 2-of-3 multi-judge + Adam sign-off

**No merge without QA-Lead PASS.** CEO and CTO cannot override.

## Definition of Done — Wave 1

1. ✅ All 7 new DB tables migrated to staging + RLS policies verified
2. ✅ `/discovery` page live, Cal.com embed works, webhook fires Inngest event
3. ✅ Discovery agent text chat fully working end-to-end with one Adam test session
4. ✅ Brand fingerprint generated, customer can review + correct, saved to `brand_fingerprints` table
5. ✅ `/dashboard` outcomes shell loads with empty states for net-new customer
6. ✅ `/approvals` queue shell loads with empty state
7. ✅ Welcome email delivered + arrives in Adam's inbox (not spam) — proves Resend DNS works
8. ✅ Free scan rate limits enforced + verified (manually trigger 4 scans from same IP, 4th rejected)
9. ✅ Domain + business verification flow tested with 1 real customer signup
10. ✅ QA-Lead PASS on every PR. Irreversible PRs have Adam sign-off comment.
11. ✅ E2E Playwright test: free-scan → discovery-booking → text-chat → brand-brief-saved → dashboard-loads
12. ✅ Staging deploy + smoke test green
13. ✅ Each worker writes a session file at `docs/08-agents_work/sessions/2026-05-XX-[role]-w1-[task].md`
14. ✅ CTO writes Wave 1 closeout session file with all PRs + QA verdicts + remaining tech debt
15. ✅ DECISIONS.md updated with any new architectural decisions made during build

## Stop conditions (escalate to CEO / Adam, do not push through)

- Any DB migration that would drop a column with customer data without double Adam confirm
- Any external publishing action attempted before Wave 3 is ready (Wave 1 is read-only on customer external systems)
- Any customer-facing API response leaking agent names (CTO decision A8 — hard rule)
- Any cost-per-discovery-call exceeding $2 (current estimate ~$0.40 with Sonnet text-only)
- 3-retry-exhausted blocked workers → CEO escalation per the operating procedure

## Return contract (CTO synthesis back to CEO)

```yaml
status: COMPLETE
agent: cto-wave1
linear_ticket: (optional)
branches_merged: [...]
prs_merged: [...]
files_changed: <total>
agents_spawned: [database-engineer-w1-..., backend-engineer-w1-..., ...]
qa_verdicts: {pr_N: PASS, ...}
summary: <5-10 lines>
decisions_made: [<any sub-decisions with reversibility>]
adam_blockers_newly_surfaced: [...]
blockers: [...]
staging_url: <Vercel preview URL>
e2e_test_results: PASS|FAIL
session_file: docs/08-agents_work/sessions/2026-05-XX-cto-wave1-closeout.md
ready_for_customer_1: true|false (with reasoning)
```

## After Wave 1 ships

Triggers Wave 2 dispatch (deliverables tracking + tier gates + digest cron + held-revenue cron + founding-100 cohort). CTO writes a new dispatch brief for Wave 2 using this same format. Wave 3 (publishing integrations) sequenced AFTER Wave 2 ships customer #1 per CTO decision A10.

---

**Brief ends. CTO begins by reading the 11 source docs above + verifying AB-1/2/3 status, then spawns 6 workers in parallel.**
