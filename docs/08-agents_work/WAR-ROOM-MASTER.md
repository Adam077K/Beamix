---
title: Beamix War Room — Master Architecture & Operations
date: 2026-05-11
status: WS5 — synthesis lock
inputs:
  - docs/08-agents_work/ORCHESTRATION.md (WS2)
  - docs/08-agents_work/TECH-STACK.md (WS3)
  - docs/08-agents_work/CONNECTIONS.md (WS4)
  - docs/08-agents_work/ROUTINE-ROSTER.md (WS4 lock)
  - docs/08-agents_work/sessions/2026-05-{07,08,11}-ceo-*.md
  - docs/07-history/runbooks/*.md (10 runbooks)
  - .claude/memory/DECISIONS.md
read_time: 25 minutes
audience: future Adam, future agents, contributors who need to understand the entire system
---

# Beamix War Room — Master Document

> **One-line summary:** The war room is Adam's autonomous AI startup-operations stack — Linear is the company, the Cloudflare bridge is the front door, Anthropic Routines are the workforce, Supabase is the long-term memory.

This document is the **single read-once source of truth** for the war room. It folds 4 workstreams (WS2 orchestration architecture, WS3 tech stack + BOM, WS4 connection layer code, WS4 production deploy) into one master overview. If you only have time to read one war-room document, read this one.

---

## Table of contents

1. [What the war room is](#1-what-the-war-room-is)
2. [Architecture at a glance](#2-architecture-at-a-glance)
3. [Components in detail](#3-components-in-detail)
4. [The 11-Routine roster + 4-window daily schedule](#4-the-11-routine-roster--4-window-daily-schedule)
5. [Trust spec contract (R3.x security model)](#5-trust-spec-contract-r3x-security-model)
6. [Audit + observability](#6-audit--observability)
7. [Cost model](#7-cost-model)
8. [Failure modes + DR runbooks](#8-failure-modes--dr-runbooks)
9. [Adam's locked decisions (all Q-decisions from WS2-WS4)](#9-adams-locked-decisions)
10. [Operational state + what's next](#10-operational-state--whats-next)
11. [How to operate the war room day-to-day](#11-how-to-operate-the-war-room-day-to-day)
12. [Reversibility map](#12-reversibility-map)

---

## 1. What the war room is

The war room is the **internal infrastructure Adam uses to build Beamix-the-product**. It is NOT a customer-facing product. Its job is:

- **Off-load scheduled autonomous work** to AI agents so Adam can focus on judgment-bound decisions
- **Capture every agent action** in an auditable trail so failures are diagnosable and behavior is verifiable
- **Run inside the cloud** with no special role for Adam's home machine (the "Bastion" concept was dropped 2026-05-08)
- **Stay within a $200/mo cost ceiling** combining Cloudflare Workers Paid + Anthropic Max-quota Routine tokens

It is NOT trying to be ChatGPT or Claude.ai for Adam — Adam runs CEO interactively in his own Claude Code sessions. The war room handles the work that benefits from being unattended, scheduled, or fan-out parallel.

**Source-of-truth file:** `.claude/memory/MEMORY.md` → "Project Vision" section.

## 2. Architecture at a glance

```
                  ┌──────────────────────────────────────────────────────┐
                  │                  EXTERNAL TRIGGERS                    │
                  └──────────────────────────────────────────────────────┘
                            │             │             │
                  Linear webhook    Telegram bot    iOS Shortcut
                  (board-meeting     (@cto etc.,     (voice idea
                   on Issue:create   chat-ID         capture →
                   OR sentinel-      restricted)     Linear ticket)
                   bracketed spec
                   in Comment:create)
                            │             │             │
                            ▼             ▼             ▼
                  ┌──────────────────────────────────────────────────────┐
                  │           CLOUDFLARE BRIDGE WORKER                    │
                  │  (HMAC verify · KV nonce dedup · DO RoutineLock ·     │
                  │   FireCountDO rolling-24h cap · canonical-JSON HMAC · │
                  │   spec sentinel-wrapping · Haiku tier classifier ·    │
                  │   audit_log writes [fired, anthropic_error, etc.])    │
                  │                                                       │
                  │  Routes (POST):                                       │
                  │    /linear or /linear-webhook  Linear webhook         │
                  │    /idea-capture              iOS Shortcut            │
                  │    /telegram                  Telegram bot relay      │
                  │    /health (GET, minimal unauth)                      │
                  └──────────────────────────────────────────────────────┘
                            │
                            │  POST /v1/claude_code/routines/{trig_id}/fire
                            │  Headers: Authorization Bearer <token>,
                            │           anthropic-beta:
                            │             experimental-cc-routine-2026-04-01
                            │  Body: {"text": "<beamix-spec>{...signed spec...}</beamix-spec>"}
                            ▼
                  ┌──────────────────────────────────────────────────────┐
                  │          ANTHROPIC ROUTINES                           │
                  │  (10 standing + 1 synthesizer per ROUTINE-ROSTER)     │
                  │  Each = 1 Routine config in claude.ai Console:        │
                  │    - cron schedule OR API trigger                     │
                  │    - system prompt extracts <beamix-spec>...</> +     │
                  │      validates HMAC + executes within spec.budget     │
                  │    - writes status:accepted, status:complete to       │
                  │      audit_log via Supabase MCP grant                 │
                  │    - all token cost on Max subscription quota         │
                  │      (no API billing unless overage)                  │
                  └──────────────────────────────────────────────────────┘
                            │
                            ▼
                  ┌──────────────────────────────────────────────────────┐
                  │   SUPABASE OBSERVABILITY (audit_log, audit_log_daily, │
                  │   claude_progress)                                    │
                  │  RLS deny-all + service-role writes (bridge, Routine, │
                  │   Inngest watchers). 90-day hot + 1y daily archive.   │
                  └──────────────────────────────────────────────────────┘
                            │
                            ▼
                  ┌──────────────────────────────────────────────────────┐
                  │     /war-room internal page (apps/web)                │
                  │  Authenticated to Adam's email. Live trace via        │
                  │   Supabase Realtime + 30s polling fallback.           │
                  │  Sections: NOW RUNNING · TODAY · TRACE VIEW.          │
                  └──────────────────────────────────────────────────────┘

  Side-band: Inngest functions watch audit_log (fan-in, runaway, embed pipeline)
           : Mem0 cloud (Phase 1) for persistent memory across Routine sessions
           : pgvector (Supabase) for RAG corpus of decisions/sessions/brain/codebase/skills
```

**Reading this diagram top-to-bottom = the fire path.** A Linear ticket arrives → bridge validates + routes + writes a `fired` audit row + POSTs to Anthropic → Routine runs → writes `accepted` → does work → writes `complete`. War-room page renders the trace via Supabase Realtime.

## 3. Components in detail

### 3.1 Cloudflare bridge (`infra/cloudflare-bridge/`)

The single front door for all external triggers. Stateless worker + 2 Durable Objects (RoutineLock, FireCountDO).

**Security stack (R3.x from WS2):**
- **R3.1 — Issuer allowlist.** Bridge verifies `spec.issued_by.linear_user_id` (or `telegram_chat_id`) is in `ALLOWED_ISSUERS` env. Rejects with `rule_violation` audit row otherwise.
- **R3.2 — Sentinel-bracketed specs.** Trust specs accepted ONLY from `<beamix-spec>...</beamix-spec>` comment markers, never from ticket bodies.
- **R3.3 — No `skip_pre_flight`.** Field removed entirely from schema (was a backdoor).
- **R3.4 — Mandatory nonce.** Spec carries UUID nonce; KV partial UNIQUE on dispatch rows enforces no-replay.
- **R3.5 — Non-empty `out_of_scope`.** Spec rejected if scope.out_of_scope array is empty.
- **R3.6 — Three-party audit_log.** Bridge writes `fired` BEFORE Anthropic call. Routine writes `accepted` on session start. Inngest watcher writes the terminal status (`complete`, `over_budget`, `timeout`, etc.). No single point of erasure.
- **R3.7 — Platform-side budget cap.** `runaway-watcher` Inngest function sums session cost via `nonce` chain; kills sessions over `spec.budget.max_cost_usd × 1.2`. Does NOT trust the Routine to self-enforce.
- **R3.8 — Webhook HMAC.** `linear-signature` header (Linear's actual name; bridge also accepts `X-Hub-Signature` defensively).
- **R3.9 — Timestamp skew window.** `X-Beamix-Timestamp` header on every signed request (iOS Shortcut, Telegram). Bridge rejects requests with `|now - timestamp| > 300s`.
- **R3.10 — Canonical-JSON HMAC.** Hand-rolled recursive serializer sorts keys at every depth. Eliminates flaky verification when nested object key order varies.
- **R3.11 — RLS deny-all on observability tables.** Service role bypasses for agent writes only.
- **R3.12 — No secret in logs.** Bridge never `console.log`s the bearer token or HMAC secret values.

**Idempotency / dedup (R2):**
- Layer 1: Cloudflare KV nonce check, 24h TTL (`fire:{ticket_id}:{label}`). Fast, eventually consistent.
- Layer 2: `RoutineLock` Durable Object (strongly consistent per `routine_id:ticket_id`). Catches edge-region races. 5-min auto-release via DO alarm (min-heap pattern).
- Counter: `FireCountDO` rolling-24h timestamps. Atomic via `state.storage.transaction()`. Constant `MAX_FIRES_PER_24H = 15`. Bump to 60 when Adam upgrades to Max 20×.

**Routing:**
- `findRoutingLabel(labels)` returns first label matching `agent:*`, `decision_type:*`, or `board-meeting`.
- `parseTierLabel(labels)` returns `quick|lite|full` or null. If null, bridge invokes Haiku tier classifier with `AbortSignal.timeout(8000)` ceiling.
- `resolveRoutineId(label, env)` reads `ROUTINE_<NAME>_ID` from env at request time (no hardcoded IDs in source).
- `ROUTINE_TOKEN_ENV_KEY[label]` resolves the bearer token to use.

**Files:**
- `src/index.ts` — entry point + all handlers (~1300 lines)
- `src/durable-object.ts` — RoutineLock min-heap alarm
- `src/audit.ts` — audit_log writer (Q3 schema-aware, auto-detects row_kind)
- `src/routing.ts` — label → routine mapping + BridgeEnv interface
- `scripts/rotate-bridge-hmac.ts` — secret rotation helper

### 3.2 Anthropic Routines (claude.ai → Claude Code → Routines)

11 Routines per `ROUTINE-ROSTER.md`. Provisioned in claude.ai UI; bearer tokens + routine IDs stored as wrangler secrets on bridge.

**Provisioned (1 of 11 active):**
- `ceo-entry-point` — Opus 4.7, API trigger, used for board-meeting + C-suite shared

**Pending WS6 provisioning (10):**
- `morning-digest` (Sonnet, daily 05:35)
- `eod-sync` (Sonnet, daily 20:30)
- `monday-standup` (Sonnet, weekly Mon)
- `friday-retro` (Sonnet, weekly Fri 15:30)
- `geo-algorithm-signal` (Opus, weekly Sun 05:45)
- `auto-unblock` (Sonnet, event-triggered)
- `synthesizer` (Opus, event-triggered, board meetings)
- `competitor-pulse` (Sonnet, daily 05:40)
- `content-idea-generator` (Sonnet, daily 10:35)
- `cto-daily-plan` (Opus, daily 10:30)
- `advisor-daily-thinking` (Opus, daily 05:30) ⭐ new

**Anti-Pattern: CEO is NOT a Routine.** Adam runs CEO interactively. The original plan had a `ceo-entry-point` Routine receiving Linear-ticket fires; in practice this slot is reused as the fire target for `board-meeting` + C-suite labels (which share the CEO token until WS6 per-Routine split).

### 3.3 Supabase observability (Phase 1 stack)

3 tables created by `apps/web/supabase/migrations/20260508_war_room_observability.sql`:

**audit_log** — 90-day hot, append-only event log. Schema:
- `id`, `parent_audit_log_id` (FK ON DELETE SET NULL), `ts`, `spec` (jsonb NOT NULL), `agent`, `status` (15-value CHECK), `outcome`, `cost_usd`, `runtime_s` (CHECK >= 0), `session_file`, `linear_ticket`, `fan_in_key`, `nonce`, `row_kind` (CHECK in `routine_dispatch|internal_event`), `event_kind`
- Partial UNIQUE on `nonce` only for `row_kind='routine_dispatch'` (Q3)
- 6 indexes (linear_ticket, fan_in_key, ts DESC, parent, status+ts, agent+ts)
- RLS deny-all; service role bypasses

**audit_log_daily** — 1-year cold archive. Rolled up nightly by `audit-log-rollup` Inngest function. PK `(date, agent)`. `failures integer NOT NULL DEFAULT 0`.

**claude_progress** — 90-day hot, live step-by-step progress from running Routines. Status enum: `running|done|error|killed`. Used by /war-room Realtime subscription.

**audit_log_aggregate_for_date(p_date)** — SQL function for nightly rollup. Server-side aggregation, faster than client-side group-by.

### 3.4 Inngest functions (`apps/web/src/inngest/functions/`)

11 functions, all server-side via Inngest cloud:

| Function | Trigger | Purpose |
|---|---|---|
| `fan-in-watcher` | `Issue:updated` event | Queries Linear GraphQL for sibling state when sub-ticket completes; fires CEO synth when all done. **R1 fix: queries Linear directly, not audit_log.** |
| `routine-timeout-watcher` | `war-room/routine.fired` | Sleeps for `spec.budget.max_runtime_minutes`; if no `accepted` row found, fires Auto-Unblock. Q5 cap: max 3 cascades, then Telegram-pings Adam (only Q7 carve-out). |
| `parent-ticket-expiry-watcher` | `war-room/parent.fired` | Watches for `event_kind='synth_complete'` after a fan-out. Fires Auto-Unblock if synth doesn't appear. |
| `audit-log-rollup` | Cron (nightly) | Calls `audit_log_aggregate_for_date(yesterday)`; upserts to `audit_log_daily`; deletes detail rows >90d old (guarded: skip delete if aggregation produced 0 rows AND rows exist). |
| `cost-watchdog` | Cron (hourly) | Aggregates today's audit_log per-agent into `audit_log_daily` rolling. **No Telegram alerts (Q7).** Just writes to DB. |
| `runaway-watcher` | `audit_log.cost_usd` updates | Sums session cost via `nonce` chain; kills via `claude_progress.status='killed'` + `audit_log.status='over_budget'` if session > `spec.budget.max_cost_usd × 1.2`. R11 fix: session-relative, not single-row $1 threshold. |
| `embed-decisions` | `git/push` (DECISIONS.md changed) | Re-embeds DECISIONS.md into pgvector `rag_corpus` table. |
| `embed-sessions` | `git/push` (sessions/* changed) | Same for session files. |
| `embed-brain` | `git/push` (00-brain/* changed) | Same for brain MOCs. |
| `embed-codebase` | `git/push` (.ts/.tsx changed) | Same for code files. Filters out .d.ts, .snap, .generated.ts. |
| `embed-skills` | `git/push` (.claude/skills/* changed) | Same for skills, replaces 42K-token MANIFEST.json scan. |

### 3.5 `/war-room` page (`apps/web/src/app/(internal)/war-room/`)

Adam-only internal Next.js page. Auth: `ADAM_EMAIL` env var matched against `session.user.email` at request time.

Layout: 3 sections (NOW RUNNING / TODAY / TRACE VIEW) per WS2 §2G wireframe.
- **NOW RUNNING:** Realtime subscription on `claude_progress` where `status=eq.running`. Live dots + step text.
- **TODAY:** Hybrid 30s polling + `audit_log` Realtime INSERT subscription. Today's audit rows.
- **TRACE VIEW:** Recursive trace tree via `parent_audit_log_id`. Depth-limited to 8, cycle-detected, `.limit(50)` on children. Click to expand.

Q7 compliance: no threshold-config UI, no alert-subscribe toggles. Passive observability only.

### 3.6 qa-lead-pass GitHub workflow (`.github/workflows/qa-lead-pass.yml`)

The structural QA gate. Runs on every PR to main. Must PASS before merge.

Behavior:
1. Extract task-slug from branch name (handles multi-segment paths via `tr / -`)
2. Look for session file `docs/08-agents_work/sessions/*-{slug}.md`
3. If found: grep for `qa_verdict: PASS` (case+whitespace-tolerant + handles quoted YAML)
4. If not found: fall back to PR diff — find session files added/modified in this PR, require ALL of them to have `qa_verdict: PASS`
5. If `risk:irreversible` label present: require session frontmatter to also contain `tier: full`
6. Otherwise: check for `qa-lead-bypass` label + Adam-authored comment containing `BYPASS REASON:`

`issues: read` permission required for the bypass-comment lookup (corrected from `pull-requests: read` only).

### 3.7 iOS Shortcut (`infra/shortcuts/`)

Voice idea-capture flow:
1. Adam taps Shortcut → dictates idea → Apple Speech transcribes
2. Shortcut sends transcription to Anthropic Haiku via API → returns `{title, body, nonce}` JSON
3. Shortcut POSTs to bridge `/idea-capture` with HMAC over `timestamp + body`
4. Bridge dedups via KV (nonce), creates Linear ticket, returns BMX-XXX ticket identifier
5. Shortcut shows "Idea captured ✓ — BMX-XXX" on success OR "Capture FAILED: <error>" on non-2xx

R6 hardening: empty-dictation guard between Steps 1 and 3 (alerts "No voice detected" + exits).

Status: code in repo, **NOT yet imported on Adam's iPhone** (deferred 2026-05-11).

### 3.8 Telegram bot worker (`infra/telegram-bot/`)

Cloudflare Worker that relays Telegram updates to bridge `/telegram` endpoint. Only forwards from `ADAM_TELEGRAM_CHAT_ID`. Signs outbound calls with shared `BRIDGE_HMAC_SECRET`.

Status: worker exists, **3 of 4 secrets unset + KV namespace placeholder unfilled** (deferred 2026-05-11).

## 4. The 11-Routine roster + 4-window daily schedule

Adam's 5h Max-session quota window discovery (2026-05-08): each Routine fire opens a fresh Max-quota window. Spacing fires 5h apart maximizes total quota across the day.

```
W1 — 05:30 — Advisor (Opus, ~$2)
              + Morning Digest (Sonnet, ~$0.30)
              + Competitor Pulse (Sonnet, ~$0.40)
              + GEO Signal (Opus, ~$1.50, Sundays only)
W2 — 10:30 — CTO Daily Plan (Opus, ~$1.50)
              + Content Idea Generator (Sonnet, ~$0.50)
              + Monday Standup (Sonnet, ~$0.50, Mondays only)
W3 — 15:30 — Friday Retro (Sonnet, ~$0.75, Fridays only)
              + reserve for ad-hoc Linear fires
W4 — 20:30 — EOD Sync (Sonnet, ~$0.30)
W5 — sleeping (20:30 → 05:30 next day, no fires)
```

Daily scheduled load: ~7.4 fires/day. Headroom: ~7 fires/day for ad-hoc work. Hard cap: 15 fires per rolling 24h.

Full details in `docs/08-agents_work/ROUTINE-ROSTER.md`.

## 5. Trust spec contract (R3.x security model)

Every Routine fire carries a JSON spec. Bridge signs it via HMAC-SHA256 over canonical-JSON. Spec is wrapped in `<beamix-spec>...</beamix-spec>` sentinels inside the `text` body field of the `/fire` API call.

Spec shape (per WS2 §2D):

```jsonc
{
  "spec_version": "1.0",
  "trust_mode": true,
  "nonce": "<uuid>",
  "issued_at": "<ISO8601>",
  "expires_at": "<ISO8601, +24h>",
  "issued_by": {
    "kind": "adam | ceo | c_suite | standing_routine",
    "linear_user_id": "<uuid> | null",
    "telegram_chat_id": "<chat_id> | null",
    "agent_session_id": "<optional>",
    "session_file": "<optional path>"
  },
  "linear_ticket": "ADA-20",
  "parent_ticket": "<optional, for fan-out>",
  "fan_in_key": "<uuid, for fan-in barrier>",
  "scope": {
    "intent": "ship | research | design | fix | refactor | review | board",
    "domain": "backend | frontend | infra | data | ai | growth | brand | research",
    "constraints": ["..."],
    "definition_of_done": "<plain English>",
    "out_of_scope": ["non-empty array of explicit boundaries"]
  },
  "memory_pre_loads": ["<optional file paths>"],
  "budget": {
    "max_cost_usd": 3.00,
    "max_runtime_minutes": 45,
    "max_tool_calls": 100
  },
  "escalation": {
    "channel": "telegram | linear-comment | github-pr-comment",
    "format": "binary-ping | freeform",
    "blocker_threshold_minutes": 15
  },
  "audit": {
    "session_file_required": true
  },
  "_signature": "<HMAC-SHA256 hex of canonical-JSON over all preceding fields>"
}
```

Anti-hallucination: when CEO fires a child Routine (via Linear sub-ticket), the bridge enforces `validateChildScope()` — child spec's intent/domain/budget must narrow from parent's. Out-of-scope items inherited.

## 6. Audit + observability

**Three writers, no single point of erasure (R3.6):**
1. Bridge writes `status: fired` before calling `/fire`
2. Routine writes `status: accepted` on session start (via Supabase MCP grant)
3. Inngest watcher writes terminal `status: complete | timeout | over_budget | error`
4. **NEW (Agent A finding 2026-05-11):** Bridge writes `status: anthropic_error` (row_kind: internal_event) on non-2xx Anthropic response, joining via nonce

**Read paths:**
- `/war-room` page reads via authenticated server-side queries (`createServiceRoleClient`).
- Realtime subscription on `claude_progress` for live step indicators (range filters not supported by Supabase Realtime; subscription is cross-table, volume-bounded by 90-day retention).
- Daily rollup: `audit_log_aggregate_for_date(yesterday)` → upserts to `audit_log_daily`.
- 90-day retention: nightly delete of `audit_log` rows older than 90 days. Daily rows kept 1 year.

## 7. Cost model

**Recurring monthly (locked):**
| Item | $/mo |
|---|---|
| Cloudflare Workers Paid (Durable Objects) | $5 |
| Mem0 Hobby tier (free) | $0 |
| Helicone Free tier (10K events) | $0 |
| Inngest Free tier (50K steps) | $0 |
| Supabase Free tier (500MB DB) | $0 |
| Vercel Hobby (Next.js hosting) | $0 |
| Anthropic Max 5× subscription (200 messages / 5h × 16 hours / day) | $100 (covers Adam's Claude Code use + Routine fires) |
| **Subtotal** | **$105/mo** |

**Variable (Max-quota-absorbed, but real if Adam upgrades):**
- 11 Routines × ~7.4 fires/day × ~$0.70 avg cost = **~$155-170/mo** in Routine spend (consumed from Max quota; not API-billed until cap hit)
- If Max 5× quota runs out before end of day: overage routes to Console-billed `ANTHROPIC_API_KEY` at API rates. Bridge `FireCountDO` prevents this by hard-capping at 15/day.
- If Max 5× cap is too tight: upgrade to Max 20× ($200/mo, 800 messages / 5h). Bridge constant bump to `MAX_FIRES_PER_24H = 60`.

**Scaling cliffs (per TECH-STACK.md):**
| Customer count | Cliff | Action |
|---|---|---|
| 5 paying | Inngest Free → Pro | Pay $75/mo |
| 10 paying | Vercel Hobby → Pro | Pay $20/mo |
| 25 paying | Supabase Free → Pro | Pay $25/mo + $0.0125/GB |
| 50 paying | Mem0 Hobby → Starter | Pay $19/mo on-demand |
| 100 paying | Helicone Free → Pro | Pay $25/mo |
| 200 paying | Sentry Free → Team | Pay $26/mo |
| 500 paying | Worst-case all tiers | **~$824/mo total** (still <0.5% revenue assuming $79/mo Discover tier) |

## 8. Failure modes + DR runbooks

10 runbooks at `docs/07-history/runbooks/`. Each follows the same template: Detection / Immediate / Mitigation / Recovery / Post-incident / Decision tree / Related signals / Telemetry checklist.

| Runbook | P-tier | Scenario |
|---|---|---|
| `anthropic-outage.md` | P0 if >30min | Anthropic Routines API unreachable |
| `linear-api-break.md` | P1 | Linear API breaking change or webhook silence |
| `cloudflare-compromise.md` | P0 | Bridge worker compromised, secrets rotated |
| `supabase-corruption.md` | P0 | DB corruption or schema drift |
| `secret-rotation.md` | P2 routine / P0 emergency | 90-day rotation of all 11+ secrets |
| `github-compromise.md` | P0 | Force-push to main, branch protection bypass |
| `mem0-outage.md` | P1 | Mem0 cloud unreachable; Routines fall back to Anthropic Memory Tool inline |
| `inngest-outage.md` | P1 | Inngest cloud down; watcher functions can't fire |
| `vercel-outage.md` | P2 | /war-room page unreachable (war room agents still run; only the dashboard is down) |
| `telegram-failure.md` | P2 | Telegram → bridge route broken |

All runbooks were stress-tested via 16 procedural fixes (R4 batch) during WS3 critique. Decision trees are operational, not aspirational.

## 9. Adam's locked decisions

All Q-decisions from WS2 through WS4 deploy:

### WS2 (orchestration architecture) — locked 2026-05-07
- **Q1:** Spec model = async-spec-trust (single-fire bridge + audit_log). NOT delegate-token nor command-tunnel.
- **Q2:** Quick tier = CEO spawns worker via Task in-session (1 fire). Lite = CEO + relevant C-suite (2 fires). Full = CEO + 3-5 C-suite + Synthesizer (3-5 fires).
- **Q3:** Model rule. Haiku for simple/lookup. Sonnet default. Opus for orchestration / planning / synthesis / design.
- **Q4:** 4-round board protocol with Customer Voice (new) persona. Synthesizer mandatory `source_persona_round` field (anti-hallucination).
- **Q5:** 4 smoke tests in WS4 sub-phase 0. Test A cron exemption. Test B Retry-After. Test C Mem0 stability. Test D concurrent fire.
- **Q6:** 90-day hot + 1-year cold daily-rollup retention.
- **Q7:** Adversary branched per task: Aria (vendor-decisions) + broad-Adversary (strategic).
- **Q8:** Friday Retro fires Auto-Unblock if rollups indicate weekly cost > $20.

### WS3 (tech stack + DR) — locked 2026-05-08
- **Q1:** Mem0 stays Hobby (free); upgrade to Starter $19/mo on-demand.
- **Q2-Q5:** DROPPED — procurement compliance moved to `docs/security/PRODUCT-COMPLIANCE-BACKLOG.md` (12 items, product workstream).
- **Q6:** Write all 3 missing runbooks (Inngest, Vercel, Telegram).
- **Q7:** NO real-time cost alerts to Telegram. Passive observation only via /war-room page + monthly burn-down. Runaway-watcher silent kill stays. Anthropic Console hard cap is backstop.
- **Q8:** Inngest Pro $75/mo (was $150/mo in stale DECISIONS entry; verified via inngest.com/pricing).

### WS4 (connection layer code) — locked 2026-05-08
- **Q1:** ADD `telegram_send_failed` to `audit_log.status` enum (15 values total).
- **Q2:** `parent_audit_log_id` FK = ON DELETE SET NULL. Children survive 90-day retention; lineage recoverable from nonce/fan_in_key.
- **Q3:** `row_kind` discriminator + partial UNIQUE on nonce only for `routine_dispatch` rows.
- **Q4:** Per-Routine bearer tokens deferred to WS6. Shared CEO token ships in WS4 (documented FOLLOW-UP).
- **Q5:** ALLOW Auto-Unblock 3-cascade Telegram-ping. Tagged as "incident escalation, NOT cost alert" (the only Q7 carve-out).

### WS4 deploy + strategic pivot — 2026-05-08 → 2026-05-11
- **CEO interactive, not a Routine.** Adam runs CEO in his own Claude Code sessions; the war room handles specialized scheduled work.
- **15/day cap stays** (Max 5× subscription). Bump to 60/day when Adam upgrades to Max 20×.
- **Rolling-24h window**, not calendar UTC day. Prevents midnight burst.
- **4-window daily fire schedule** (05:30 / 10:30 / 15:30 / 20:30) maximizes Max-quota.
- **11-Routine roster**: 5 from WS2 + 2 new ⭐ (CTO Daily Plan, Advisor Daily Thinking) + 2 from brainstorm B/G (Competitor Pulse, Content Idea Generator) + 2 event-triggered (Auto-Unblock, Synthesizer).
- **Telegram bot + iOS Shortcut deferred** (Adam 2026-05-11: "not need").

## 10. Operational state + what's next

### Live as of 2026-05-11
- ✅ Cloudflare bridge deployed (Version `c948a2e6-...` + `41fd708` commit pending deploy)
- ✅ Supabase observability schema in production (3 tables, 6 RLS policies, 9 indexes, 1 RPC)
- ✅ Linear webhook firing into bridge with HMAC verification
- ✅ 1 of 11 Routines provisioned + verified working end-to-end (ceo-entry-point)
- ✅ /war-room page builds + auth-gates correctly
- ✅ qa-lead-pass workflow operational
- ✅ pgvector embed pipeline wired (functions exist; will fire on next git push event)

### Deferred (Adam-skipped 2026-05-11)
- ⏸️ Telegram bot worker deploy
- ⏸️ iOS Shortcut iPhone import

### Next workstream: WS6
- Write 11 Routine .md files (system prompts + frontmatter for cron, model, MCP grants, budget)
- Provision the other 10 Anthropic Routines in claude.ai Console
- Set `ROUTINE_<NAME>_ID` + `ROUTINE_<NAME>_TOKEN` wrangler secrets for each
- Wire 4-window cron schedules in Console
- Write 6 worker .md files
- Write 4 persona .md files (Visionary, Strategist, Architect, Aria)
- Per-Routine bearer token split (Q4 follow-up — kill shared-CEO-token blast radius)

### Future workstream: WS1F (Mem0 OSS Phase 2 migration)
- Triggered when Mem0 cloud Hobby exhausts OR Adam wants vendor independence
- Self-host Mem0 OSS on Cloudflare Workers / Railway / Fly.io ($0-5/mo container)
- Migrate user data via Mem0 export → OSS import
- Update Routine MCP grants to point at OSS endpoint

## 11. How to operate the war room day-to-day

### Adam's normal day
1. **05:30** — wake. Telegram has Morning Digest + Advisor Brief from W1 fires. Read on the 06:30-07:45 commute.
2. **08:00** — at desk. Open Claude Code, run CEO interactively for ad-hoc decisions, sub-ticket triage, design discussions.
3. **10:30** — W2 fires (CTO Daily Plan + Content Idea Generator). Pings in Telegram if urgent.
4. **15:30** — W3 fires (Friday Retro on Fridays, reserve otherwise). Ad-hoc Linear tickets can fire any time during W3.
5. **20:30** — EOD Sync fires. Captures the day's progress. Adam reads before sleep.
6. **Overnight** — no fires. Runaway-watcher + cost-watchdog cron jobs run on Inngest, not Routines.

### When something goes wrong
- **Routine fires but no audit_log row:** check `wrangler tail` on the bridge. If `[bridge] webhook ignored` → routing label wrong. If `[bridge] HMAC verification failed` → secret mismatch.
- **Routine fires + audit_log written but Anthropic returns 4xx:** look for `anthropic_error` row with `event_kind=anthropic_fire_<status>`. 401 = bad token. 404 = bad routine ID. 429 = cap exceeded (shouldn't happen — FireCountDO guards).
- **Daily budget feels off:** query `audit_log_daily` for the past 7 days, sum `total_cost_usd`. If high: check `runaway-watcher` killed sessions OR Routine prompts are looping.
- **Routine looks stuck (5+ min in `running` state):** `parent-ticket-expiry-watcher` will fire Auto-Unblock within 5min of session-budget runtime. If 3 Auto-Unblocks cascade: Telegram ping fires.

### Where to find what
- **What did this Routine do?** `/war-room` TRACE VIEW → click the row → see parent_audit_log_id chain.
- **What did we decide?** `.claude/memory/DECISIONS.md` (last 50 entries; older in `DECISIONS_ARCHIVE.md`).
- **What's running now?** `/war-room` NOW RUNNING section (Supabase Realtime on `claude_progress`).
- **What ran today?** `/war-room` TODAY section (last 24h audit_log).
- **What's the spec for X?** Search `audit_log.spec` jsonb for `nonce` or `linear_ticket`.
- **Cost rollup?** `audit_log_daily` for any date.

## 12. Reversibility map

| Decision / artifact | Reversible? | Cost to reverse |
|---|---|---|
| Bridge code (any of 1300+ LOC) | EASY | git revert + redeploy |
| `audit_log.row_kind` discriminator | HARD | Schema migration on populated table; hours of zero-downtime work |
| 15-value status CHECK | MEDIUM | Add/remove enum value via migration; existing rows must conform |
| 4-window daily schedule | EASY | Anthropic Console UI lets you change cron per Routine |
| CEO interactive vs. Routine | EASY | Re-create CEO Routine in claude.ai; populate token + ID via wrangler |
| Workers Paid → Free tier | HARD | Lose Durable Objects (FireCountDO, RoutineLock). Pipeline breaks. |
| Mem0 cloud Phase 1 → OSS Phase 2 | MEDIUM | Self-host Mem0 OSS; export/import user data; update MCP grants |
| Q7 cost-alert policy | EASY | Re-add Telegram ping in `cost-watchdog` Inngest function |
| Adam's email = ADAM_EMAIL | EASY | Update wrangler secret + Vercel env |
| Q5 Auto-Unblock cascade-3 Telegram | EASY | Remove the 1 Telegram-ping line in `routine-timeout-watcher` |
| Removing a Routine from roster | EASY | Delete .md file + Routine config in Console; remove from routing.ts |
| 90-day audit_log retention | EASY | Change cutoff date in `audit-log-rollup` Inngest function |
| Anthropic Routines product itself | NOT REVERSIBLE | Platform decision by Anthropic; if they kill Routines, war room migrates to Inngest cron firing direct Claude API calls (~2 weeks rework) |

## Final word

This document is the single read-once source of truth for the war room. If you spent 25 minutes reading it, you now know how Beamix's autonomous AI startup-operations infrastructure works in detail — every layer, every Adam-decision, every failure mode, every cost line.

Future-you's questions answered here:
- "Why does X Routine fire at 05:30 instead of midnight?" → §4 4-window schedule, §9 WS4-deploy decisions.
- "Why isn't there a CEO Routine?" → §3.2 Anti-Pattern + §9 WS4-deploy decisions.
- "Why does the audit_log have `row_kind` column?" → §3.3 Supabase + §9 WS4 Q3.
- "Why don't we get Telegram pings on cost overruns?" → §9 WS3 Q7.
- "What happens when Adam upgrades to Max 20×?" → §7 cost model + §1 reversibility.

If you find a gap in this document that future-you would have wanted answered: edit it inline OR ask Adam to. This is meant to live and breathe.

— CEO (Opus 4.7 session, 2026-05-11)
