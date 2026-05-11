# Beamix War Room — Orchestration Architecture (WS2)

**Status:** **LOCKED** (was PROPOSED) — Adam approved 2026-05-07 with 7 decisions integrated
**Workstream:** WS2 — Orchestration Architecture
**Supersedes:** the v1 PROPOSED draft from 2026-05-06 + all 6 critique findings
**Smoke tests:** DEFERRED to WS4 — the 4 tests in §Smoke Tests (Deferred) must run inside WS4 before WS4 commits implementation
**Cost reality:** war-room incremental new spend = **$0-5/mo** on top of existing stack ($100/mo Claude Max + $155/mo product stack)

---

## Adam's 7 decisions (locked 2026-05-07)

| Q | Decision |
|---|---|
| Q1 | Cost: war-room incremental = $0-5/mo (Cloudflare Paid). Cost not a limitation. |
| Q2 | $5/mo Cloudflare Workers Paid plan APPROVED — buys Durable Objects for the race-fix |
| Q3 | Model rule: **Haiku** for simple/lookup, **Sonnet** default, **Opus** for orchestration / planning / synthesis / design |
| Q4 | Customer Voice persona ADDED to board meetings (6th voice) |
| Q5 | Smoke tests DEFERRED to WS4 (not run inside WS2) |
| Q6 | `audit_log` retention = 90 days hot + 1 year cold |
| Q7 | Aria = vendor-decisions only; new "broad Adversary" persona for general/strategic board meetings |

## Adam's 3 hard rules (from MEMORY.md, applied throughout)

| Rule | Source |
|---|---|
| **No local Bastion. War room is cloud-only.** *(Updated 2026-05-08 — supersedes V3/V4 Bastion design.)* All runtime, memory, observability, and routing live in cloud services (Anthropic Routines, Cloudflare Workers, Vercel, Supabase, Inngest). Adam's home PC is a normal dev workstation, no special role. | `project_cloud_only_architecture.md` |
| **Don't cut agent roster for resource constraints.** Agent count is sized for value (10 standing + 6 personas + workers per WS6), not for any local hardware ceiling. | `feedback_dont_cut_agent_roster.md` |
| **No timelines, weeks, or sprints.** Plan by scope, dependencies, and quality bar. | `feedback_no_timeline_planning.md` |
| **No subscription OAuth on cloud VPS.** Routines fired via Anthropic's official `/fire` endpoint with per-Routine tokens are sanctioned. Running `claude -p` on a cloud VPS using your Max-plan OAuth is the Jan-2026 ban-risk pattern. Cloud agents = Anthropic Routines (official) + ANTHROPIC_API_KEY (Console billing) for any non-Routine code paths. | `feedback_claude_code_oauth_ban_risk.md` |

### Compliance check on this design
- ✓ Cloudflare Worker calls `/fire` endpoint with per-Routine tokens — Anthropic's sanctioned external-trigger surface
- ✓ Routine execution happens inside Anthropic's infrastructure on your Max subscription (not on a VPS)
- ✓ No local "Bastion" runtime — everything that needs uptime runs on a cloud service we already pay for
- ✓ Inngest jobs that touch Anthropic API directly use ANTHROPIC_API_KEY (Console billing), not subscription OAuth
- ✓ Adam's home PC is just a dev workstation; the war room runs whether it's on or off

## The thesis (one paragraph)

Routines are *triggers*, not durable execution. Inngest owns durability. Linear is the control plane. Workers run as in-session subagents under main-thread Routines (chained via Linear sub-tickets through a Cloudflare Worker that owns idempotency via two-layer dedup: KV ticket-scoped + Durable Object lock per `routine_id:linear_ticket`). Trust specs are HMAC-bridged at the Worker, never extracted from raw ticket bodies, and have nonces + expiry. The audit log is written by three parties (bridge, agent, watcher) so no single point of erasure. **Observability is cloud-only:** live production view = `/war-room` Next.js page on Vercel reading Supabase Realtime; optional dev observability = disler installed on whichever machine Adam is working from at the time. Board meetings run in 4 rounds (de-anchored framings → independent → cross-critique → fresh-context Synthesizer with mechanical traceability). Routine costs run on the Max subscription, not API billing — incremental new spend is bounded at $5/mo (Cloudflare Workers Paid).

---

## Table of contents

- [§ 2A — Spawning relationship matrix](#2a)
- [§ 2B — Routine-chaining contract (Linear + Cloudflare bridge, two-layer dedup)](#2b)
- [§ 2C — Durable execution layer (Inngest)](#2c)
- [§ 2D — Async-spec-trust mode contract (security-hardened)](#2d)
- [§ 2E — Standing Routines specification (10 Routines)](#2e)
- [§ 2F — Board-meeting protocol (4 rounds, 6 personas)](#2f)
- [§ 2G — Cross-agent observability (split: production + dev)](#2g)
- [§ Failure modes & recovery](#failure-modes)
- [§ Smoke tests (deferred to WS4)](#smoke-tests)
- [§ What survives unchanged](#survives)
- [§ Honest reversibility table](#reversibility)
- [§ Cost summary (war-room incremental)](#cost)
- [§ What changes downstream (WS3 / WS4 / WS6)](#downstream)

---

<a id="2a"></a>
## 2A — Spawning relationship matrix

### Platform constraint
Anthropic Claude Code (May 2026): **subagents cannot spawn subagents.** Each main thread is its own Routine. Workers are leaves.

### Three classes of agent

| Class | Examples | Spawn capability | Trigger mechanism |
|-------|----------|------------------|-------------------|
| **Main-thread Routine** | CEO, CTO, CPO, CMO, CBO, CCO, QA-Lead, 9 standing Routines, Synthesizer | Spawns subagent workers via Task | Anthropic `/fire` endpoint; Linear webhook → Cloudflare bridge; or cron |
| **Subagent worker** | backend-engineer, frontend-engineer, code-reviewer, security-engineer, etc. | **Spawns nothing** (no `Agent`/`Task` tool grant in frontmatter) | Spawned via Task by parent main-thread Routine |
| **Specialist persona** (board meetings only) | Visionary, Strategist, Architect, Risk Modeler, broad-Adversary, Aria, Customer Voice | Spawns nothing | Spawned in parallel during a `/board-meeting` |

### Allowlist matrix

```
Spawns →         CEO   C-suite   QA-Lead   Workers   Personas   Std Routines
Adam (Linear)     ✓       ✓         ✓         —         —              —
CEO Routine       —    ✓ (2B)     ✓ (gate)  ✓ (Quick)  ✓ (board)      —
C-suite Routine   —       —      ✓ (gate)   ✓ (Task)    —             —
QA-Lead           —       —         —     ✓ (reviewers only) — —
Workers           —       —         —         —         —              —
Std Routines    ✓ (re-fire CEO) — — ✓ (Task) — —
Cloudflare bridge ✓       ✓         ✓         —         —              ✓ (cron)
Inngest job       ✓ (synth re-fire, fan-in) — — — — —
```

### CEO short-circuits (tier-based)

| Tier | Trigger | Path | Burns from `/fire` cap |
|------|---------|------|----------------------|
| **Quick** | typo, single-line fix, log line | CEO spawns the worker via Task in same session | 1 fire (CEO only) |
| **Lite** | one-domain feature (~100 LOC, single C-suite owns it) | CEO fires the relevant C-suite via 2B; that C-suite spawns its workers | 2 fires |
| **Full** | cross-domain (auth + billing), risky migrations, board-grade | CEO fans out to N C-suite via 2B; Inngest manages fan-in; CEO re-fires for synthesis | 3-5 fires |

**Tier classifier (R7.1-R7.3):** Linear label `tier:quick | tier:lite | tier:full`. Set by Adam (manual) OR by a 50-line **Haiku classifier at the Cloudflare bridge** (~$0.001/ticket) that reads the ticket title + first comment. Adam can override by pre-tagging.

### QA-Lead enforcement is structural (R3.8)

Three layers:
1. **MCP grants:** C-suite Routines do NOT have `mcp__github__merge_pull_request` in their grants. Only QA-Lead does.
2. **GitHub branch protection on `main`:** requires `qa-lead-pass` GitHub Action check. Even if a Routine could call merge, GitHub blocks it.
3. **Audit:** Any merge bypassing QA-Lead emits an `audit_log` row with `status: rule_violation` and Telegram-pings Adam.

### Worker timeout (NEW — was missing)

A Task subagent that hangs is killed by the parent Routine after **5 minutes of no progress** (no tool call, no message). Parent returns `BLOCKED` with `reason: worker_timeout` and the worker's last `claude_progress` row.

### Sequential-worker state passing (R2.4)

When parent Routine spawns workers sequentially (e.g., backend-engineer → code-reviewer), parent is responsible for thread-state. Workers return JSON with `worktree_path`, `branch`, `files_changed`. Parent passes the previous worker's output as part of the next worker's brief. WS6 enforces this in worker .md files.

### Anti-bureaucracy hard rule (unchanged)

Workers spawn nothing. If a worker thinks it needs to delegate, it returns `PARTIAL` with `needs_followup`. Parent decides.

---

<a id="2b"></a>
## 2B — Routine-chaining contract (Linear + Cloudflare bridge, two-layer dedup)

### Locked: **Linear sub-ticket + Cloudflare bridge re-fire** (Option ii)

**Why it won:** keeps Linear as persistent audit, idempotency at the bridge (not in agent prompts), survives Linear's 3× webhook retries, and the bridge is also the natural home for HMAC verification + tier classification.

**Why other options lost:**
- Option (i) direct API `/fire`: bypasses Linear audit, no per-call dedup, fallback only.
- Option (iii) Task subagent: NOT VIABLE — spawned C-suite is a subagent, can't spawn workers.

### End-to-end flow (UPDATED with security + race-fix)

```
CEO Routine running → decides Full-tier (CTO + CMO needed)
        ↓
CEO writes 2 sub-tickets via Linear MCP:
    BMX-101 → label: agent:cto, tier:lite
    BMX-102 → label: agent:cmo, tier:lite
(parent BMX-100 gets a comment with synth_routine_id + fan_in_key UUID + nonce)
        ↓
Linear fires Issue:created webhook → Cloudflare Worker
        ↓
Worker:
  1. HMAC-verify webhook
  2. Verify comment.user.id ∈ ALLOWED_ISSUERS (Adam + agent bot accounts only)
  3. Parse spec ONLY from sentinel-bracketed comment, never from ticket body
  4. Validate spec via Zod (schema + nonce uniqueness + expires_at)
  5. Acquire Durable Object lock keyed (routine_id, ticket_id) — strongly consistent
  6. KV-write nonce (24h TTL) for replay prevention
  7. Bridge writes audit_log row (status: fired) — first writer
  8. HMAC-sign spec body, POST /v1/claude_code/routines/{cto_routine_id}/fire
        ↓
CTO Routine starts (fresh main thread)
   - validates HMAC of inbound spec
   - writes audit_log status: accepted
   - writes session_id to BMX-101 first comment
   - executes via Task workers
   - writes audit_log status: complete (or BLOCKED) on finish
   - sets BMX-101 status = Done
        ↓
CMO Routine starts (parallel, same flow)
        ↓
Both sub-tickets transition to Done with structured DONE comment containing fan_in_key + session_id
        ↓
Inngest fan-in-watcher:
  - listens for linear/issue.updated where data.fan_in_key matches
  - validates session_id matches the bridge's KV-stored expected session
  - if reopened/deleted/manual-close → emits BLOCKED, escalates (does NOT trigger synth)
  - if all done with valid session_ids → fires CEO synth via /fire with trust_mode:true synth-only spec
        ↓
CEO synth runs, writes consolidated comment to BMX-100, sets status = Done
Inngest watcher updates audit_log status: complete on the original spec rows
```

### Two-layer idempotency (R2.1)

- **Layer 1: Cloudflare KV** — ticket-scoped dedup (24h TTL on `fire:{ticket_id}:{label}`). Catches Linear webhook retries that hit the same edge.
- **Layer 2: Cloudflare Durable Object** — strongly-consistent lock keyed `(routine_id, ticket_id)`. Catches cross-region races where KV propagation hasn't completed.

**Cost:** Durable Objects require Cloudflare Workers Paid plan ($5/mo). **APPROVED by Adam Q2.**

### Fire-and-forget rule (R2.2)

Every `step.run` that calls `/fire` is **fire-and-forget**. No inline await on Routine completion. Routine completion is detected via Linear webhook → Inngest event. This avoids Vercel 60s timeout × Inngest retry double-fires.

### Fan-in barrier validation (R2.3)

Inngest fan-in-watcher requires all of:
- sub-ticket `status == Done`
- final comment contains `fan_in_key` matching parent's expected key
- `session_id` in comment matches the bridge's KV-stored expected session for that sub-ticket

If reopened/deleted/manual-close: watcher emits `audit_log` row with `status: anomaly` and escalates to Adam via Linear comment instead of synthesizing.

### `/fire` daily cap

Max plan = 15 ad-hoc `/fire` calls per day. Cron Routines: assumed exempt — **DEFERRED to WS4 smoke-test A.** If smoke-test fails, mitigation is: (a) upgrade Adam's plan to Max 20× ($200/mo, ~60 cap), or (b) consolidate Routines (NOT preferred per Adam's "don't cut agents" rule).

### Latency budget (LOW confidence on cold-start)

| Hop | Estimate | Confidence |
|-----|----------|----|
| Linear webhook delivery | ~200-500ms | HIGH |
| Cloudflare Worker (HMAC + KV + Durable Object + /fire call) | <200ms | MEDIUM |
| Routine cold start | ~2s estimate | LOW — Anthropic doesn't publish; smoke-test deferred |
| Routine warm start | <1s | LOW — same |

**If actual cold-start is >10s:** Quick-tier short-circuit becomes the only acceptable path for Adam-facing latency. Smoke-test will tell us.

---

<a id="2c"></a>
## 2C — Durable execution layer (Inngest)

### Locked: Inngest stays.

Anthropic Routines have **zero documented durability semantics** (verified in research). They are triggers, period. Inngest owns: fan-out/fan-in barriers, cross-Routine wait state, crash recovery, memory re-embed, audit-log rollup.

Replacing Inngest with Trigger.dev v3 buys nothing material at solo scale. Inngest is already in stack, free until 50K function runs/month (~5 paying customers per locked decision).

### What Inngest owns

| Function | Trigger | Purpose |
|---|---|---|
| `fan-in-watcher` | `linear/issue.updated` matching `fan_in_key` | Validate sub-ticket completion (session_id binding), re-fire CEO synth |
| `routine-timeout-watcher` | scheduled per Routine fire | If Routine doesn't write `complete` to audit_log within `max_runtime_minutes`, fire Auto-Unblock |
| `cost-watchdog` (NEW R5.3) | hourly cron | Sums `audit_log.cost_usd` rolling 1h. If >$5/h (8x normal), Telegram alert |
| `runaway-watcher` (NEW R5.3) | on `audit_log` insert with `cost_usd > $1` | Triple-checks against spec's `max_cost_usd`. Kills session if over via per-Routine token revocation |
| `embed-decisions` | git push to `.claude/memory/DECISIONS.md` | Re-embed corpus into pgvector |
| `embed-sessions` | git push to `docs/08-agents_work/sessions/**` | Re-embed (incremental — only changed files) |
| `embed-brain` | git push to `docs/00-brain/**` | Re-embed |
| `embed-codebase` | PR merge to `main` filtered by `apps/web/src/**` | Re-embed |
| `embed-skills` | git push to `.claude/skills/**` | Re-embed |
| `audit-log-rollup` | nightly 03:00 UTC | Compress yesterday's rows into `audit_log_daily` summary table (for retention rollover) |
| `parent-ticket-expiry-watcher` (NEW Cluster 8) | per parent ticket on dispatch | If parent ticket still open at `expires_at = +24h` with no synth comment, fire Auto-Unblock |

### Vercel 60s timeout — fire-and-forget enforcement

Per R2.2: any `step.run` that calls `/fire` returns immediately. Completion comes via Linear webhook → separate Inngest event. No inline awaits on Anthropic API. Embed jobs use OpenAI embeddings or self-hosted MiniLM (sub-second per chunk, batched).

### Free-tier headroom (HIGH confidence)

| Function | Runs/month |
|---|---|
| Standing Routine progress writes | ~2,160 |
| Embed jobs | ~1,500 |
| fan-in-watcher | ~1,500 |
| routine-timeout-watcher | ~270 |
| cost-watchdog (hourly) | 720 |
| runaway-watcher | ~300 |
| audit-log-rollup | 30 |
| **Total** | **~6,500/mo** vs 50K free tier |

Comfortable through ~5 paying customers per locked Inngest tier strategy.

---

<a id="2d"></a>
## 2D — Async-spec-trust mode contract (security-hardened)

### Why this exists
Default CEO flow is synchronous. Async mode says: *"The trigger payload encodes constraints. Trust it. Don't ask. Act."* But **trust without verification = compromise.** Every R3.x security fix from the critique is integrated below.

### Trigger payload schema (UPDATED — required: nonce, expires_at; restricted: skip_pre_flight; signed: HMAC by bridge)

```json
{
  "spec_version": "1.0",
  "trust_mode": true,
  "nonce": "uuid-v4 — REQUIRED, single-use, KV-tracked",
  "issued_at": "2026-05-07T14:33:00Z",
  "expires_at": "2026-05-07T15:03:00Z",
  "issued_by": {
    "kind": "adam | ceo | c_suite | standing_routine",
    "linear_user_id": "VERIFIED at bridge against ALLOWED_ISSUERS env",
    "agent_session_id": "ceo-2-1778091835",
    "session_file": "docs/08-agents_work/sessions/2026-05-07-ceo-ws2.md"
  },
  "linear_ticket": "BMX-101",
  "parent_ticket": "BMX-100",
  "fan_in_key": "uuid-v4",
  "scope": {
    "intent": "ship | research | design | fix | refactor | review | board",
    "domain": "backend | frontend | infra | data | ai | growth | brand | research",
    "constraints": ["no breaking changes to public API", "must use Mem0 wrapper"],
    "definition_of_done": "PR merged AND staging deployed AND smoke test pass",
    "out_of_scope": ["billing changes", "auth flow"]
  },
  "memory_pre_loads": ["DECISIONS.md#mem0-l2", "MOC-Architecture.md"],
  "budget": {
    "max_cost_usd": 5.0,
    "max_runtime_minutes": 30,
    "max_tool_calls": 200
  },
  "escalation": {
    "channel": "telegram | linear-comment | github-pr-comment",
    "format": "binary-ping | freeform",
    "blocker_threshold_minutes": 10
  },
  "audit": {
    "session_file_required": true,
    "decisions_md_entry_required": false,
    "audit_log_table": "audit_log"
  },
  "_signature": "HMAC-SHA256 by bridge (env BRIDGE_HMAC_SECRET) — REQUIRED"
}
```

### Issuer authority (R3.1)

Bridge verifies `issued_by.linear_user_id` against `ALLOWED_ISSUERS` env var (Adam's Linear user ID + per-Routine bot account IDs). Reject if not in allowlist. Bridge HMAC-signs the spec before injecting into `/fire` body using `BRIDGE_HMAC_SECRET`. Receiving agent verifies HMAC before trusting any field.

### Spec source restriction (R3.2)

Trust specs are accepted ONLY from comments authored by allowlisted users, wrapped in sentinels:

```
---BEAMIX-SPEC-V1-START---
{ ...JSON... }
---BEAMIX-SPEC-V1-END---
```

Ticket bodies are NEVER parsed as spec sources. Customer email pasted into a ticket body cannot become a trust spec.

### `skip_pre_flight` removed (R3.3)

The field is removed entirely from the schema. CLAUDE.md and AGENTS.md are constitution documents. The "efficiency win" of skipping them isn't worth the attack surface.

### Replay prevention (R3.4)

- `nonce: uuid-v4` is REQUIRED. Bridge stores processed nonces in KV with TTL = `expires_at - issued_at`. Duplicate nonce → reject.
- `expires_at` defaults: 30 minutes (Quick), 4 hours (Lite), 24 hours (Full). Receiving agent rejects any spec where `now() > expires_at`.

### Scope guards mandatory (R3.5)

- `out_of_scope` must have ≥1 entry. Empty array rejected by Zod.
- Bridge enforces (arithmetic, NOT LLM-judged) that child spec's `out_of_scope ⊇ parent's` and `child.max_cost_usd ≤ remaining_parent_budget`.

### Audit log written by 3 parties (R3.6)

| Writer | When | Status field |
|---|---|---|
| **Cloudflare bridge** | At dispatch, before `/fire` | `fired` |
| **Receiving agent** | At session start | `accepted` |
| **Inngest watcher** | On completion or timeout | `complete | blocked | timeout | over_budget | anomaly | rule_violation` |

No single point of erasure. Crash mid-task = `fired` row exists, watcher times it out to `timeout`. Compromised agent can't erase its dispatch.

### Mandatory cost enforcement (R3.7)

- `max_cost_usd` enforced platform-side via `runaway-watcher` Inngest function (see §2C). Polls `claude_progress.cost_usd`; kills session if accrued > spec's `max_cost_usd × 1.2` via Anthropic API token revocation.
- For product code (not Routines), Helicone proxy with hard per-request token caps. Helicone is **mandatory for product** code (was "optional" — corrected).
- Note: Helicone does NOT sit in front of Anthropic Routines (those run on Max subscription). For Routines, the audit-log + runaway-watcher is the cost ceiling.

### Fan-in session binding (R8 / Cluster 2)

Fan-in watcher requires the sub-ticket's DONE comment to contain `session_id` matching the bridge's KV-stored expected session. Anyone closing a ticket without this binding does NOT trigger synth.

### Audit log RLS (R3.11)

Migration creating `audit_log` MUST include:
```sql
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_log_deny_all" ON audit_log USING (false);
-- Service role bypasses RLS for agent writes
-- Adam reads via server-side route checking session.user.email = adam's email
```

### Bearer token rotation (R3.12)

90-day rotation cadence for all per-Routine bearer tokens. Rotation runbook in `docs/07-history/runbooks/secret-rotation.md` (created in WS4). Lint rule blocks `console.log(env.ROUTINE_*)`.

---

<a id="2e"></a>
## 2E — Standing Routines specification (10 Routines)

### Roster

| # | Routine | Schedule (Israel TZ → UTC) | Model | $-cap/run | MCP grants | Escalation |
|---|---------|---------|-------|----|---|---|
| 1 | **CEO Entry-point** | on-demand (Linear webhook) | sonnet | $1.00 | linear, github, supabase, mem0, pgvector, ide | linear-comment OR telegram (binary-ping for L3) |
| 2 | **Morning Digest** | daily 07:30 IL (04:30 UTC) | sonnet | $0.30 | linear, github, mem0, pgvector | telegram if blocker |
| 3 | **EOD Sync** | daily 20:00 IL (17:00 UTC) | **haiku** | $0.10 | linear, github, supabase | linear-comment (silent unless action) |
| 4 | **Auto-Unblock** | on-demand (Inngest fires when ticket BLOCKED >10 min OR Routine timeout) | sonnet | $0.50 | linear, github, mem0, pgvector | telegram binary-ping after 3 self-resolve |
| 5 | **Monday Standup** | Mon 08:00 IL (05:00 UTC) | sonnet | $0.50 | linear, github, supabase, mem0 | linear-comment |
| 6 | **Friday Retro** | Fri 18:00 IL (15:00 UTC) | **opus** *(complex synthesis + PR drafting per Q3 rule)* | $1.50 | linear, github, mem0, pgvector | github-pr-comment + telegram |
| 7 | **Competitor Signal** | Sun 06:00 IL (03:00 UTC) | sonnet | $0.50 | linear, webfetch, mem0 | linear-comment Strategy/Signals |
| 8 | **Customer Voice Signal** | Sun 07:00 IL (04:00 UTC) | sonnet | $0.50 | linear, supabase, mem0 | linear-comment Strategy/Signals |
| 9 | **GEO Algorithm Signal** | bi-weekly Sun 08:00 IL (05:00 UTC, weeks 1+3) | sonnet | $0.50 | linear, webfetch, mem0 | linear-comment Strategy/Signals |
| 10 | **Synthesizer Routine** *(NEW — was undocumented; called by board meetings)* | on-demand (board meeting Round 3) | **opus** | $1.00 | mem0, pgvector | linear-comment + adam-veto checkpoint |

### Cost reality (corrected)

**Routines run on Max subscription, NOT API billing.** All token costs above are *budget caps*, not net new dollars on top of Max. The Max plan absorbs them. The $-cap fields are used by the runaway-watcher to enforce per-session ceilings.

**Net new dollar cost of standing Routines** = **$0/mo** (all inside the $100/mo Max). Smoke-test A defers verifying cron exemption.

### MCP grants explained

- `linear` — Linear API
- `github` — GitHub API (note: NO `mcp__github__merge_pull_request` for any C-suite — only QA-Lead)
- `supabase` — DB + audit_log + claude_progress
- `mem0` — L2 episodic (assumes WS1B Phase 1 succeeds; fallback = Anthropic Memory Tool if smoke-test C fails)
- `pgvector` — L3-L5 RAG corpora (custom MCP, built WS1C)
- `webfetch` — built-in
- `ide` — TypeScript diagnostics

### `claude_progress` shared state (Supabase)

```sql
CREATE TABLE claude_progress (
  id          bigserial PRIMARY KEY,
  ts          timestamptz NOT NULL DEFAULT now(),
  routine     text NOT NULL,
  session_id  text,
  step        text NOT NULL,
  status      text NOT NULL,           -- running | done | error
  note        text,
  cost_usd    numeric(8,4),
  linear_ticket text
);
CREATE INDEX ON claude_progress (routine, ts DESC);
CREATE INDEX ON claude_progress (session_id);
ALTER TABLE claude_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "claude_progress_deny_all" ON claude_progress USING (false);
```

Cleanup: nightly Inngest job deletes rows older than 90 days (matches audit_log retention).

### CTO → CEO completion callback

Resolved via Inngest fan-in-watcher (see §2B + §2C). CEO terminates after dispatch. Inngest re-fires CEO via `/fire` with trust_mode synth-only spec when all sub-tickets close with valid session_id binding.

### Routine .md files

WS6 deliverable. Files at `.claude/agents/_routines/<name>.md`.

```
.claude/agents/_routines/
├── ceo-entry-point.md
├── morning-digest.md
├── eod-sync.md
├── auto-unblock.md
├── monday-standup.md
├── friday-retro.md
├── competitor-signal.md
├── customer-voice-signal.md
├── geo-algorithm-signal.md
└── synthesizer.md          ← was undocumented; now Routine #10
```

---

<a id="2f"></a>
## 2F — Board-meeting protocol (4 rounds, 6 personas)

### Why 4 rounds (was 3)

Critic 4 found that anti-anchoring at the spawn level (parallel Tasks) is real but doesn't fix anchoring at the topic-prompt level. Round 0 adds **5 framings** of the topic, one per persona, to de-anchor at the framing level.

### When to invoke

| Trigger | Examples |
|---|---|
| Architectural decision >$1M reversible cost | "Migrate from Mem0 to custom MCP" |
| Strategic pivot or new initiative | "Launch B2C tier" |
| Risk-tier shift on irreversible change | "Auto-merge >100-line PRs" |
| Competitor signal threshold | "Profound launches X — respond?" |

### The 6 personas (locked roster, Q4 + Q7)

| Persona | Model | Lens | Distinction |
|---|---|---|---|
| **Visionary** | opus | 18-month flywheel | "What does this enable?" |
| **Strategist** | sonnet | ANTI-ROADMAP | "What we DON'T do" |
| **Architect** | opus | BOM, complexity, rollback | "HOW" |
| **Risk Modeler** | opus | Failure modes, attack surface | "What breaks" |
| **Customer Voice** *(NEW Q4)* | sonnet | Churn, friction, acquisition | "Will users care / churn?" |
| **Adversary** *(branched per Q7)* | opus | Fail the proposal | Two flavors: |

**Adversary branch (Q7):**
- For **vendor decisions** (Stripe vs Paddle, contract reviews, SLA evaluation): **Aria persona** — procurement-grade reviewer.
- For **strategic decisions** (B2C tier, brand pivot, hiring strategy): **broad-Adversary persona** (new file in WS6) — strongest critic of the thesis regardless of domain.

The dispatcher (CEO) picks the right Adversary based on `decision_type` field in the topic statement.

### 4 rounds

#### Round 0 — De-anchored framings (NEW R6.1)

Each persona receives the topic phrased differently:
- Visionary: "What could this enable in 18 months that doesn't exist today?"
- Strategist: "What does this preclude us from doing?"
- Architect: "What's the BOM and rollback cost?"
- Risk Modeler: "What's the failure mode?"
- Customer Voice: "How does this affect churn and acquisition?"
- Adversary: "What's the strongest argument against?"

Cost: ~5 short prompts × $0.001 = $0.005 trivial.

#### Round 1 — Independent (parallel Task spawn)

Each persona returns Zod-validated JSON (validator at `apps/web/src/lib/orchestration/board.ts`):

```json
{
  "persona": "visionary | strategist | architect | risk-modeler | customer-voice | aria | broad-adversary",
  "round": 1,
  "topic_id": "sha256 of topic",
  "verdict": "ship | hold | reframe | kill",
  "rationale": "1-2 paragraphs",
  "risks": ["specific 1", "specific 2"],
  "alternatives_considered": ["alt 1 rejected because X"],
  "recommendation": "1-2 sentences",
  "confidence": "high | med | low"
}
```

#### Round 2 — Cross-critique

Each persona reads the OTHER 5 outputs. Returns `changed_mind_on`, `doubled_down_on`, `peer_critiques`, `remaining_dissent`, `updated_recommendation`.

#### Round 3 — Synthesizer (Opus, separate Routine, mechanical traceability per R6.3)

Synthesizer receives all 12 JSON outputs (6 R1 + 6 R2). Returns:

```json
{
  "topic_id": "...",
  "locked_decisions": [
    {
      "key": "...",
      "value": "...",
      "reason": "...",
      "source_persona_round": "visionary-r1 | strategist-r2 | ...",  // REQUIRED — mechanical anti-hallucination
      "reversibility": "easy | medium | hard"
    }
  ],
  "open_questions": [...],
  "preserved_dissents": [{"persona": "...", "dissent": "...", "why_overruled": "..."}],
  "next_action": {"owner": "...", "action": "...", "deadline": "no-timelines per Adam rule"}
}
```

Zod validator rejects any `locked_decision` with `source_persona_round` not matching one of the 12 inputs. Mechanical anti-hallucination — Synthesizer cannot fabricate decisions no persona stated.

### Adam-veto checkpoint (R6.4)

Between Round 3 output and "decisions are locked," Synthesizer posts to a Linear ticket and Telegram-pings Adam: "Board meeting [topic] complete. Reply on Linear: `accept | reject | revise`."

Decisions do NOT propagate to DECISIONS.md until Adam responds. Friday Retro reads only Adam-accepted board-meeting artifacts.

### Cost reality (R6.5)

Real per-meeting cost (token-honest): ~$0.45-1.50. The earlier "$10 cap" was 22x over reality. Updated:

- $-cap per persona per round: $0.30 (Sonnet) / $0.50 (Opus)
- Round 0 + 1 + 2 + Synth total cap: **$3/meeting**
- Frequency cap: **8 meetings/month** (was 4)
- Monthly board-meeting budget: **$24/month**

### Output artifact

`docs/08-agents_work/board-meetings/YYYY-MM-DD-<topic-slug>-r<NN>.md` — `r<NN>` suffix prevents same-day collision.

### Triggers

| Path | Mechanism |
|---|---|
| Slash command | `/board-meeting <topic-slug>` (file at `.claude/commands/board-meeting.md` — created this session) |
| Linear ticket | label `board-meeting` + `agent:strategist` triggers Cloudflare bridge to fire CEO with synth-only spec |
| Idempotency | KV dedup key `board-meeting:{topic_slug_hash}:{date}`. Both paths share dedup. |

### Persona-distinction validation (R6.6)

Persona roster locked, but WS6A produces an eval baseline: 1 board meeting on a synthetic topic, measure % of `locked_decisions` sourced from each persona uniquely. If <40% per-persona uniqueness, revisit roster.

---

<a id="2g"></a>
## 2G — Cross-agent observability (split: production + dev)

### Locked: cloud-only production observability + optional local dev observability

**Production observability (always-on, captures cloud Routines — the only path that matters):**
- `/war-room` Next.js page on Vercel (auth-gated to Adam)
- Reads from Supabase `audit_log` + `claude_progress` (Realtime subscription for live updates)
- Mandatory: Helicone proxy for **product code** API calls (NOT Routines — Routines use Max subscription, Helicone doesn't sit in that path)
- Cost watchdog + runaway-watcher Inngest functions (see §2C)

**Optional dev observability (only if Adam wants it):**
- disler hooks dashboard installed on whichever machine Adam is doing interactive dev work from at the time (laptop, home PC, etc.)
- Captures only **Adam's interactive Claude Code sessions** when he runs `claude` in a terminal — does NOT capture cloud Routine activity
- Useful for debugging local agent behavior during development
- Memory footprint: ~50-150MB; runs on any modern machine
- Hooks fire against `localhost:4000` on the same machine — no networking required

### Why disler doesn't replace `/war-room`
Hooks fire to `localhost:4000`. Anthropic's cloud Routine containers run on Anthropic's infrastructure and cannot reach `localhost:4000` on any machine you own. So disler captures only the Claude Code sessions running on the same machine where it's installed. For the 24/7 cloud war room (the 10 Routines + Linear-webhook fires), `/war-room` is the only observability — full stop.

### `/war-room` page wireframe

Three sections (top to bottom):

**1. Live (Realtime subscription on `claude_progress`):**
```
NOW RUNNING (3)
  ▶ ceo                BMX-100 — dispatching                 $0.34   2m
  ▶ cto                BMX-101 — code-lead spawned (worker)  $0.12   30s
  ▶ friday-retro       cron    — analyzing week              $0.55   8m
```

**2. Today (audit_log filtered by today):**
```
TODAY  total $4.32  routines fired 12  failures 1
  ✓ 09:30  cto        BMX-99   merged PR #234         $0.62  18m
  ✓ 10:14  cmo        BMX-98   draft posted           $0.41   9m
  ✗ 11:02  qa-lead    PR#234   BLOCK (security)       $0.18   3m
  ✓ 14:30  cto        BMX-99   security fix → merge   $0.55  12m
```

**3. Trace view (NEW R5 + Cluster 5):**

Each `audit_log` row gets a `parent_audit_log_id` column. The page renders cross-Routine flows as a tree:
```
BMX-100 (ceo, $4.10, 35m)
├── BMX-101 (cto, $1.80, 18m)
│   ├── backend-engineer (worker, $0.40, 10m)
│   └── code-reviewer (worker, $0.20, 4m)
├── BMX-102 (cmo, $1.20, 12m)
└── synth (ceo re-fire, $0.30, 3m)
```

### Schemas (final)

```sql
CREATE TABLE audit_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_audit_log_id uuid REFERENCES audit_log(id),  -- for trace view
  ts          timestamptz NOT NULL DEFAULT now(),
  spec        jsonb NOT NULL,
  agent       text NOT NULL,
  status      text NOT NULL,           -- fired | accepted | complete | blocked | timeout | over_budget | anomaly | rule_violation
  outcome     text,
  cost_usd    numeric(8,4),
  runtime_s   integer,
  session_file text,
  linear_ticket text,
  fan_in_key  uuid,
  nonce       uuid UNIQUE              -- replay prevention
);
CREATE INDEX ON audit_log (linear_ticket);
CREATE INDEX ON audit_log (fan_in_key);
CREATE INDEX ON audit_log (ts DESC);
CREATE INDEX ON audit_log (parent_audit_log_id);
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_log_deny_all" ON audit_log USING (false);

CREATE TABLE audit_log_daily (         -- 1y cold archive (rolled up nightly)
  date        date NOT NULL,
  agent       text NOT NULL,
  fires       integer NOT NULL,
  total_cost_usd numeric(10,4),
  failures    integer,
  PRIMARY KEY (date, agent)
);
ALTER TABLE audit_log_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_log_daily_deny_all" ON audit_log_daily USING (false);
```

### Data retention (Q6 — locked: 90 days hot + 1 year cold)

- `audit_log` rows: kept hot for **90 days** (queryable in Supabase, fully detailed).
- After 90 days: nightly `audit-log-rollup` Inngest job aggregates to `audit_log_daily` (one row per day per agent), original detail dropped.
- `audit_log_daily` retained **1 year**, then dropped.
- `claude_progress` rows: 90-day hot; older deleted entirely (no aggregation — they're step-level noise).
- GDPR: DSAR endpoint queries by `linear_ticket` joined to customer ID via Supabase product tables. Right-to-erasure path: delete `audit_log` rows for the customer's tickets on request (use service role, bypass RLS).

### Data flow

```
   Production path (24/7, cloud-only)

        Anthropic Routine (cloud) ─── writes ───▶ Supabase audit_log + claude_progress
                                                        │
                                                        ▼ Realtime subscription
                                                  /war-room Next.js (Vercel)
                                                        │
                                                        ▼ tree view via parent_audit_log_id
                                                  Adam's phone or laptop

        Beamix product code (apps/web/src) ──▶ Helicone proxy ──▶ Anthropic API
                                                        │
                                                        ▼
                                              Helicone dashboard (cost / latency / errors for product code)

   Optional dev path (Adam's machine, when he's working interactively)

        Claude Code (`claude` in a terminal) ── disler hook ──▶ localhost:4000
                                                                  │
                                                                  ▼
                                                       Local Bun server + SQLite + Vue3 dashboard
```

### Implementation order (deferred to WS4 build)
1. Schemas: audit_log + audit_log_daily + claude_progress (~30 min)
2. `/war-room` page (~6-8 hours)
3. cost-watchdog + runaway-watcher Inngest functions (~2 hours)
4. Helicone for product API code (~30 min)
5. nightly audit-log-rollup job (~1 hour)
6. *(Optional)* disler install on Adam's dev machine + hook scripts (~2 hours)

**Total to working production observability: ~10 hours, $0/mo new spend.** disler is optional — install only if interactive dev debugging would benefit.

---

<a id="failure-modes"></a>
## Failure modes & recovery

| Failure | What happens | Recovery |
|---|---|---|
| Routine `/fire` returns 5xx | Bridge does NOT inline-retry. Inngest delayed event re-fires with backoff. | Inngest exponential retry (4 default) |
| Routine session crashes mid-execution | Bridge wrote `fired` row; agent never wrote `accepted` | routine-timeout-watcher fires Auto-Unblock at `max_runtime_minutes` |
| 15 runs/day cap hit | `/fire` returns 429 with `Retry-After` | Cloudflare Worker schedules Inngest delayed event to re-fire after `Retry-After` window. Telegram-pings Adam if cap hit twice in same day. |
| KV dedup miss (eventual consistency race) | Durable Object lock catches it — strongly consistent. Second worker sees lock, drops. | Architectural — by design |
| Cloudflare Worker outage | Linear retries 3× over 7h; Routines that can't be fired sit as orphans | Morning Digest opens a Linear "manual re-fire required" ticket for orphans. NOT silent. |
| Anthropic API outage | All Routines pause | Telegram-pings Adam if outage >10 min |
| Inngest outage | CEO terminated, fan-in synth never fires | parent-ticket-expiry-watcher (24h backstop) → EOD Sync detects → Auto-Unblock fires. NOT silent. |
| Linear API outage | Cloudflare Worker queues spec to Inngest delayed event; retry every 5 min for 1 hour | If still down, Telegram-ping Adam |
| Supabase outage | Memory writes queue in agent context; data work blocks | When back, queue flushes via Inngest |
| A Routine bug loops | runaway-watcher kills session at `max_cost_usd × 1.2` | $1500/mo Anthropic Console hard cap is absolute backstop |
| QA-Lead BLOCK bypassed via direct merge attempt | GitHub branch protection blocks merge; audit_log row `status: rule_violation` written; Telegram alerts Adam | Structural, not prompt-based |
| Worker subagent hangs | Parent Routine kills after 5 min of no progress; returns BLOCKED | per §2A worker-timeout subsection |
| Concurrent Routine cap hit | Unknown — DEFERRED to smoke-test D | Smoke-test answer feeds the recovery path design in WS4 |

---

<a id="smoke-tests"></a>
## Smoke tests (DEFERRED to WS4 — Q5 decision)

The 4 tests below run **inside WS4 before WS4 commits implementation.** Total ~$3-5 cost, ~1-2 days wall-clock (most is just observation).

### Test A — Cron exemption from 15/day cap
- **Question:** do scheduled Routines count against the 15-fires-per-day cap?
- **Mechanism:** schedule 16 trivial Routines (each writes "alive" to `claude_progress`) over 24h. Watch if 16th gets HTTP 429.
- **If exempt (expected):** war-room budget holds.
- **If NOT exempt:** mitigation = upgrade Adam to Max 20× ($200/mo, ~60/day cap). Cost is $1,200/year — within "cost not a limitation" rule.

### Test B — `/fire` cap behavior on burst
- **Question:** when 16th call hits in 24h, `Retry-After` granularity?
- **Mechanism:** fire 16 ad-hoc `/fire` calls, read `Retry-After` on the 16th.
- **Outcomes:**
  - Short `Retry-After` (e.g., 60s) → Cloudflare Worker queues to Inngest delayed event, recovers seamlessly.
  - Long `Retry-After` (e.g., 86400s = next day) → fan-out plans need rate-limiting at the bridge; Adam pings approving plan upgrade.

### Test C — Mem0 MCP under sustained load
- **Question:** does `mcp.mem0.ai/mcp` survive 40 round-trips without issue #3400 biting?
- **Mechanism:** wire Mem0 MCP to one Claude Code subagent, exercise 40 write/read cycles.
- **Outcomes:**
  - Stable → WS1B Phase 1 confirmed; all Routines retain `mem0` MCP grant.
  - Unstable → fall back to Anthropic Memory Tool (file-based `/memories`), update §2E MCP grants accordingly.

### Test D — Concurrent Routine cap
- **Question:** when 6 Routines fire simultaneously, does Anthropic queue or reject the 6th?
- **Mechanism:** fire 6 trivial Routines via `/fire` in parallel (Promise.all). Observe.
- **Outcomes:**
  - Queue → Full-tier fan-outs work as designed.
  - Reject → bridge needs concurrency-limit logic before `/fire`; max in-flight Routines configured.

### What WS4 must do with the results
- Update `audit_log.status` valid values if new failure modes surface
- Update Cloudflare Worker logic if `Retry-After` is long
- Update `.claude/agents/_routines/<name>.md` MCP grants if Mem0 fallback needed
- Update concurrent-fan-out logic if reject behavior

---

<a id="survives"></a>
## What survives unchanged from v1

About 40% of the v1 design held up under critique without revision:

- §2A spawning hierarchy (workers spawn nothing, main-thread Routines spawn workers) — platform-enforced
- §2A anti-bureaucracy hard rule (workers don't delegate)
- §2B rejection of Option (iii) Task-spawn — correct and well-sourced
- §2B Linear-as-control-plane abstraction
- §2C Inngest stays as durable layer
- §2C Routines = triggers, not durable state
- §2C the 4 primitives (step.run, waitForEvent, sleep, Promise.all)
- §2D schema *fields* (the structure was right; enforcement needed hardening)
- §2E roster of standing Routines (9 + Synthesizer = 10, not consolidated per Adam's "don't cut agents" rule)
- §2F 3-round structure (now 4 rounds with Round 0 added; original 3 stay)
- §2G custom `/war-room` page approach

---

<a id="reversibility"></a>
## Honest reversibility table (R10.1 — replaces v1's overstated claims)

| Decision | v1 claim | Honest |
|---|---|---|
| 2A spawning hierarchy | platform-tied, non-negotiable | **CORRECT** — Anthropic enforces |
| 2B Linear+Cloudflare bridge | reversible (easy) | **MEDIUM** — once `audit_log` references bridge-set fields, schema migration cost |
| 2C Inngest as durable layer | reversible | **MEDIUM** — fan-in-watcher logic non-trivial; Trigger.dev v3 swap = 2-3 days |
| 2D Trust-mode JSON schema | config-only | **HARD at scale** — once 100s of `audit_log` rows reference a schema version, migrations are forever |
| Linear label vocabulary (`agent:cto`, `tier:quick`, etc.) | not assessed | **HARD** — ripples through CEO prompts, bridge config, every C-suite, future agents |
| 2E `claude_progress` schema | not assessed | **MEDIUM** — once populated, table migrations needed |
| 2F board-meeting protocol | config-only | **EASY** — agree |
| 2G observability (disler) | OSS replaceable | **EASY** — agree |
| 2G `audit_log` schema | not assessed | **MEDIUM** — once rows depend on column shape, migrations are coordinated |

---

<a id="cost"></a>
## Cost summary (war-room incremental)

| Item | $/mo new | Notes |
|---|---|---|
| Anthropic Claude Max 5× | $0 incremental | Already paying $100/mo; war room consumes Max quota, not API |
| Cloudflare Workers Paid | $5/mo | **Approved Q2** — buys Durable Objects for race-fix |
| Cloudflare KV / R2 | $0 | Free tier far above solo volume |
| Mem0 cloud Hobby | $0 | Until 10K writes/mo (likely hit at 5+ paying customers; bumps to $19 Starter then) |
| OpenAI embeddings (or self-hosted MiniLM) | ~$0.10 | Trivial at corpus size |
| Inngest | $0 | Free 50K runs/mo; war-room burns ~6.5K |
| GitHub Actions | $0 | Free 2K min/mo |
| Telegram bot | $0 | Free |
| Supabase / Vercel | $0 incremental | Already in product stack ($45/mo) |
| Linear | $0 | Free for solo |
| Helicone (product API only) | $0 | Free 10K req/mo |
| Tailscale | $0 | Free 3 devices |
| **Total war-room incremental new spend** | **$5/mo** | Inside the V4 "$0-11/mo" envelope |

If smoke-test A fails (cron Routines DO count against cap) and Adam upgrades to Max 20×, add $100/mo. Within cost-not-a-limitation rule.

---

<a id="downstream"></a>
## What changes downstream

### WS3 (tech stack BOM, parallel)
- §2G observability decision is locked — WS3 §3C is now redundant on observability and skips that sub-phase
- Cloudflare Workers Paid plan is in the BOM ($5/mo)
- No local Bastion — war room is cloud-only (Adam's home PC has no special role)
- Helicone is mandatory for product API (was optional)

### WS4 (connection layer, blocked on this approval)
- Cloudflare Worker logic in §2B (KV dedup + Durable Object lock + tier classifier + HMAC + spec sentinel parser)
- 4 smoke tests run inside WS4 before implementation commits
- Linear label vocabulary: `agent:ceo|cto|cpo|cmo|cbo|cco|qa-lead`, `tier:quick|lite|full`, `risk:irreversible`, `board-meeting`, `proposed-by-agent`, `decision_type:vendor|strategic` (last one new for Aria/broad-Adversary routing)
- `audit_log` + `audit_log_daily` + `claude_progress` Supabase schemas (per §2D and §2G)
- `.github/workflows/qa-lead-pass.yml` (branch protection check)
- `.claude/commands/board-meeting.md` (created in this session — see §missing-deliverable)
- `infra/cloudflare-bridge/` directory (Worker code)
- 8 Inngest functions in `apps/web/src/inngest/functions/` (per §2C)
- Telegram bot setup
- `docs/07-history/runbooks/secret-rotation.md`

### WS6 (agents, last)
- 10 standing Routine .md files at `.claude/agents/_routines/` (added: synthesizer.md)
- Per-persona files at `.claude/agents/_personas/`: visionary, strategist, architect, risk-modeler, customer-voice, aria, broad-adversary
- Worker frontmatter excludes `Agent`/`Task` tool grants
- Memory access pattern per agent reads `memory_pre_loads` from trust-mode spec
- Return contract per worker: structured JSON with `worktree_path`, `branch`, `files_changed`, `decisions_made`, `blockers`
- Model assignment per Q3 rule

---

## Open questions for the future (not blockers — items to revisit)

1. Multi-tenancy: when Adam hires (post-MVP), the `issued_by.kind: "adam"` becomes role-based. Defer to that hire's onboarding sprint.
2. Concurrent Routine cap: smoke-test D answers; concurrency-limit logic in bridge is conditional on result.
3. Mem0 Phase 2 OSS migration: locked to WS1F (after WS6A validates real Mem0 usage).
4. Persona-distinction empirical baseline: WS6A runs 1 synthetic board meeting and measures uniqueness; if <40%, revisit roster.

---

**End of WS2 deliverable.** WS3 (BOM) and WS4 (connection layer) are unblocked. WS6 has its agent-design template inputs.

---

## ERRATA — applied 2026-05-08 during WS3 lock

Surgical corrections to this WS2-LOCKED document, surfaced by the WS3 critique pass. The architectural decisions remain unchanged; these are mechanical fixes.

### Errata 1 — `audit_log.status` enum extension (R1 of WS3 revisions)
The §2G schema enum (`fired | accepted | complete | blocked | timeout | over_budget | anomaly | rule_violation`) is extended to include three additional values: **`anthropic_error | linear_api_error | mem0_error | rate_limited | lock_lost | webhook_storm`**. The DR runbooks reference these values as detection signals; the WS4 migration (`<date>_war_room_observability.sql`) MUST include them in the enum or `CHECK` constraint. Without these values, runbook detection signals fail silently when bridge tries to insert the row.

### Errata 2 — Board-meeting per-meeting cost (corrects §2F R6.5)
The "$3/meeting cap × 8/month = $24/mo" math omitted Round 2 (cross-critique). True per-meeting cap including Round 0 (de-anchored framings, ~$0.03), Round 1 (6 personas writing JSON, ~$2.40), Round 2 (each persona reads 5 others + writes, ~$2.40), Round 3 (Synthesizer Opus, ~$1.00) is approximately **$5.83/meeting**, and the monthly cap at 8 meetings is approximately **$46.64/mo**. The board-meeting frequency cap (8/month) is unchanged. Revised cost line for the war-room cost summary: board-meeting Max-subscription token consumption = ~$46/mo (absorbed by the $100/mo Max budget — reduces Routine capacity by $46/mo when the board-meeting budget is fully consumed in a month, NOT new dollar spend).

### Errata 3 — Friday Retro Routine MCP grants (corrects §2E Routine #6, R4-F18)
Friday Retro Routine's MCP grants in §2E are listed as `linear, github, mem0, pgvector`. The runbooks rely on Friday Retro to query `audit_log` for incidents the week's runbook tags. That requires `supabase` MCP. **Updated grants for Routine #6:** `linear, github, mem0, pgvector, supabase`. WS6 Routine .md file for friday-retro must reflect this addition.

### Errata 4 — Cost-watchdog Telegram pings stripped (Adam Q7 2026-05-08)
The §2C Inngest function table includes `cost-watchdog` and `runaway-watcher`. **Adam locked on 2026-05-08:** the war room does NOT push real-time cost alerts to Telegram. The `cost-watchdog` function is REPURPOSED: it still runs hourly to update the monthly burn-down report, but it does NOT send Telegram alerts on threshold breach. The `runaway-watcher` keeps its silent kill action (revoke per-Routine bearer token if `cost_usd > 1.2 × spec.max_cost_usd`) but does NOT send Telegram alerts on kill. System-status alerts (Anthropic outage, Cloudflare compromise, QA Lead bypass attempt) still ping Telegram — those are infrastructure failures, not cost rate. Cost is observed passively via `/war-room` page and the monthly burn-down report at `docs/09-metrics/cost-burn-YYYY-MM.md`.

### Errata 5 — Inngest Pro pricing (corrects ORCHESTRATION.md cost summary, also DECISIONS.md 2026-04-27)
Inngest Pro is **$75/mo** (1M executions, 100+ concurrent steps), not $150/mo as cited in the locked DECISIONS.md 2026-04-27 entry. Verified via inngest.com/pricing on 2026-05-08. The §cost summary's note about Inngest is unchanged ("$0 — Free 50K runs/mo; war-room burns ~6.5K"); the Pro upgrade trigger is at 5 paying customers (per the locked decision).

### Errata 6 — War-room scope note (course correction 2026-05-08)
The §procurement section in TECH-STACK.md and the cross-cutting GDPR / multi-tenancy / sub-processor / DPA framing throughout V4 + V3 docs implied that war-room operations needed customer-facing compliance artifacts. **Adam corrected this on 2026-05-08:** the war room is internal infra (Adam's AI agent army that builds Beamix-the-product). It has no paying customers. Customer-facing compliance (sub-processor lists, ZDR claims, IR SLAs, cyber liability insurance, deputy operators, EU SCCs) applies to Beamix-the-product. WS3 deferred those 12 items to a product-side workstream tracked at `docs/security/PRODUCT-COMPLIANCE-BACKLOG.md`. The war-room itself maintains operational hygiene (HMAC-bridged trust spec, 90-day secret rotation, DR runbooks for war-room dependencies, audit log of every agent action, Cloudflare Workers Paid Durable Object idempotency) — but does NOT publish a `/security` page.

---

**End of errata.** No WS2 architectural decision is reversed; these corrections are mechanical. The full WS3 revision rationale is at `docs/08-agents_work/WS3-CRITIQUE-AND-REVISIONS.md`.
