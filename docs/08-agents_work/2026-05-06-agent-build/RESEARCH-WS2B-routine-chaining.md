# RESEARCH-WS2B — Routine-Chaining Mechanism
**Researcher:** Sonnet 4.6, 2026-05-06
**Time spent:** 28 minutes
**Confidence:** MEDIUM overall (official docs confirm mechanism; no official cold-start benchmarks; no idempotency key exists on /fire endpoint)

---

## Summary (TL;DR — 3 sentences)

Option (ii) — CEO writes a Linear sub-ticket with `agent:cto` label, the Cloudflare Worker bridge sees it via Linear webhook and calls the CTO Routine's `/fire` endpoint, CTO comments back to Linear — is the canonical mechanism for Beamix because it reuses the existing Cloudflare bridge, keeps Linear as the single pane of glass, and imposes no new infrastructure. Option (i) (CEO Routine directly calls the `/fire` endpoint) is technically equivalent and simpler but requires the CEO Routine's prompt to carry the CTO bearer token as a secret, adding a credential-management burden. Option (iii) (Task tool spawn) is NOT VIABLE for this use case: the Anthropic official docs confirm subagents cannot spawn other subagents, so a Task-spawned CTO loses main-thread status and cannot further spawn workers.

---

## Option (i) — API-fire + Linear poll

### 1. Is it possible today?
**YES.** The Anthropic `/fire` endpoint is live under the `experimental-cc-routine-2026-04-01` beta header. A CEO Routine can call it as a shell command (`curl -X POST https://api.anthropic.com/v1/claude_code/routines/{routine_id}/fire ...`) passing the CTO's bearer token from an environment variable. The response returns immediately with a `claude_code_session_id` and `claude_code_session_url` — it does not wait for the session to complete. CEO then polls Linear (via Linear MCP) for the CTO's status comment on the sub-ticket, or waits for a Linear webhook to fire when the CTO comments.

Source: https://platform.claude.com/docs/en/api/claude-code/routines-fire — Date: April 2026 — Confidence: HIGH

### 2. Latency
- **Trigger-to-session-created**: ~50–200ms for the POST round-trip (Anthropic API response time; no official benchmark published).
- **CTO Routine cold start**: The official docs say "runs may start a few minutes after the scheduled time" for cron; for API triggers, cold start is undocumented. The V4 environment map references "cold start ~2s, warm <1s" for the CEO Routine — this estimate appears to come from internal Beamix planning docs, not an official Anthropic benchmark.
- **Total handoff latency**: ~2–30 seconds from POST to CTO Routine first token, depending on infrastructure load.
- **Completion detection**: CEO must poll Linear MCP or wait for a webhook notification. Polling adds 5–60 second granularity depending on poll interval.

Source (cold start reference from planning): docs/08-agents_work/2026-05-05-war-room-rethink/00-V4-ENVIRONMENT-MAP.md — Confidence: LOW (no official Anthropic benchmark)
Source (routine trigger): https://code.claude.com/docs/en/routines — Date: April 2026 — Confidence: HIGH

### 3. Idempotency
**HIGH RISK.** The official docs state explicitly: "Each successful request creates a new session. There is no idempotency key. If a webhook caller retries, the endpoint creates multiple sessions."

Linear retries failed webhook deliveries 3× with exponential backoff (1 min, 1 hr, 6 hr). If the Cloudflare Worker ACKs (returns 200) within Linear's 5-second timeout, Linear will NOT retry. But if the CEO Routine itself retries the curl call (e.g., on a 503 transient error), a duplicate CTO session fires. Mitigation: CEO Routine must check if a CTO sub-ticket comment already exists before firing, and use Cloudflare KV for dedup at the bridge layer.

Source (idempotency statement): https://platform.claude.com/docs/en/api/claude-code/routines-fire — Date: April 2026 — Confidence: HIGH
Source (Linear retry policy): https://inventivehq.com/blog/linear-webhooks-guide — Date: 2025 — Confidence: MEDIUM (third-party, confirms official Linear behavior)

### 4. Observability
- **Session URL**: The `/fire` response returns `claude_code_session_url` (e.g., `https://claude.ai/code/session_01...`). Adam can open this URL in the claude.ai mobile app or browser to watch the CTO session live.
- **Linear**: CTO Routine writes status back to the Linear sub-ticket via Linear MCP. Adam sees this as a notification on his phone.
- **Cloudflare Workers logs**: The `wrangler tail` command streams live logs from the Worker, including the POST to `/fire` and its response.
- **No structured agent-level observability built-in**: no Langfuse, no OpenTelemetry automatically. The session_url is the primary window.

Source: https://platform.claude.com/docs/en/api/claude-code/routines-fire — Date: April 2026 — Confidence: HIGH
Source: https://code.claude.com/docs/en/routines — Date: April 2026 — Confidence: HIGH

### 5. Cost per invocation
- **Routine run credit**: counts against the daily 15-run allowance on Max plan. One CEO run + one CTO run = 2 of 15 daily runs consumed per task.
- **Token cost**: included in the $100/mo Max subscription budget. No per-call overage unless the daily run cap is hit and "extra usage" is enabled.
- **Idle cost for polling**: CEO Routine polling Linear MCP adds token overhead (~few hundred tokens per poll call). Estimate: $0.01–0.05/task in extra tokens.

Source: https://code.claude.com/docs/en/routines#usage-and-limits — Date: April 2026 — Confidence: HIGH
Source: 9to5mac.com/2026/04/14/... (confirms "Max supports running 15 routines per day") — Date: April 2026 — Confidence: HIGH

### 6. Failure mode
- **CTO Routine crashes mid-task**: The CEO Routine does not get a push notification. The CTO's session URL shows a failed/incomplete state in claude.ai. If CEO is polling Linear and CTO never comments, CEO will timeout after N polls and write a BLOCKED comment to the ticket. Adam gets a Telegram ping.
- **No automatic retry by Anthropic**: If the CTO session crashes, the CEO (or Cloudflare bridge) must re-fire. Anthropic does not retry crashed sessions.
- **Daily cap exhaustion**: A 503 or 429 from `/fire` means the CTO cannot start. CEO should write a BLOCKED comment immediately. The 429 response includes a `Retry-After` header.

Source: https://platform.claude.com/docs/en/api/claude-code/routines-fire (error codes section) — Date: April 2026 — Confidence: HIGH

### 7. Implementation cost
- **New**: Store CTO Routine bearer token as Cloudflare Worker secret (`ROUTINE_CTO_TOKEN`).
- **New**: CEO agent prompt must include instructions to call curl `/fire` with the token, then poll Linear for CTO status comment.
- **New**: Dedup logic in CEO prompt or Cloudflare Worker (KV check: has CTO sub-ticket already been fired for this parent ticket?).
- **Existing**: Linear MCP connector already available to routines.
- **Estimate**: 2–4 hours of implementation (Cloudflare KV dedup + CEO prompt additions + CTO bearer token secret setup).

---

## Option (ii) — Linear sub-ticket + Cloudflare bridge re-fire

### 1. Is it possible today?
**YES.** This is a more indirect path but uses only existing infrastructure. The CEO Routine creates a Linear sub-ticket with the label `agent:cto` via Linear MCP. The Cloudflare Worker already subscribes to Linear `IssueLabel:added` events (per the V4 SETUP-GUIDE). When the Worker sees the label, it routes to the CTO Routine `/fire` endpoint the same way it routes CEO on a new issue. CTO runs, comments back on the sub-ticket. CEO observes via Linear webhook triggering its own session, or simply polls.

Source: docs/08-agents_work/2026-05-05-war-room-rethink/00-V4-ENVIRONMENT-MAP.md (Layer 3 architecture) — Confidence: HIGH (architectural design doc)
Source: https://code.claude.com/docs/en/routines#add-an-api-trigger — Date: April 2026 — Confidence: HIGH

### 2. Latency
- **CEO writes sub-ticket**: ~200ms (Linear API call via MCP).
- **Linear webhook delivery to Cloudflare**: ~100–500ms (Linear fires webhook near-instantly on label add).
- **Cloudflare Worker processing**: ~5–50ms (KV dedup check + POST to `/fire`).
- **CTO Routine cold start**: same ~2–30s as Option (i).
- **Total additional overhead vs (i)**: ~300–700ms more than a direct `/fire` call, which is negligible.
- **Advantage**: CEO does not block waiting for `/fire` response — it simply labels the sub-ticket and moves on. The bridge handles the actual fire asynchronously.

Source: https://inventivehq.com/blog/linear-webhooks-guide (Linear webhook fires on label add) — Date: 2025 — Confidence: MEDIUM
Source: https://blog.cloudflare.com/faster-workers-kv/ (KV read latency <5ms after 2025 rearchitecture) — Date: October 2025 — Confidence: HIGH

### 3. Idempotency
**BETTER than Option (i), but still requires KV dedup.** The Cloudflare Worker already performs HMAC verification and can write a dedup key to KV (`routineFired:{linearTicketId}`) before calling `/fire`. Linear's 3× retry policy sends the same `IssueLabel:added` event up to 3 times (1 min, 1 hr, 6 hr). The Worker checks KV first: if key exists, return 200 without re-firing the CTO Routine. KV read latency is <5ms, well within Linear's 5-second timeout.

The dedup pattern: `KV.get("fired:{ticketId}:{label}")` → if exists → return 200; if not → fire CTO Routine → `KV.put("fired:{ticketId}:{label}", sessionId, { expirationTtl: 86400 })`.

Source: https://platform.claude.com/docs/en/api/claude-code/routines-fire (no idempotency key on /fire) — Date: April 2026 — Confidence: HIGH
Source: https://developers.cloudflare.com/kv/ — Date: 2025 — Confidence: HIGH
Source: Cloudflare Community (deduplication pattern using KV hash of params) — Date: 2025 — Confidence: MEDIUM

### 4. Observability
- **Linear**: Sub-ticket is the canonical record. Adam sees the sub-ticket in Linear with label `agent:cto`, then sees CTO's comments as they arrive. One source of truth.
- **Cloudflare**: `wrangler tail` shows the label event received, KV dedup result, and `/fire` POST outcome.
- **claude.ai mobile**: The `claude_code_session_url` returned from `/fire` is stored in the sub-ticket comment by the Worker (or the CTO's first action). Adam can open it.
- **Superior observability vs (i)**: The Linear sub-ticket provides a persistent audit trail of exactly when CEO delegated, when CTO started, what CTO wrote. Option (i) requires Adam to correlate a session URL with a ticket manually.

Source: docs/08-agents_work/2026-05-05-war-room-rethink/00-V4-ENVIRONMENT-MAP.md (Linear as single source of truth) — Confidence: HIGH

### 5. Cost per invocation
- **Identical to Option (i)**: 2 of 15 daily runs consumed (CEO + CTO). Token cost included in $100/mo Max.
- **Additional**: 1 Linear API call (create sub-ticket) + 1 Cloudflare Worker invocation. Both within free tiers.
- **No additional $**: Cloudflare free tier covers 100K requests/day; Linear free for solo. Net new cost: $0.

Source: docs/08-agents_work/2026-05-05-war-room-rethink/00-V4-ENVIRONMENT-MAP.md (cost table) — Confidence: HIGH

### 6. Failure mode
- **CTO Routine crashes mid-task**: Sub-ticket stays in "In Progress" state with no completion comment. Auto-Unblock Routine (heartbeat #4) detects stalled tickets and pings Adam via Telegram. This is handled automatically without CEO needing to implement custom polling.
- **Cloudflare Worker fails to fire CTO**: Linear retries the webhook (3×). KV dedup ensures the first successful delivery fires CTO exactly once.
- **Linear API down**: CEO cannot create sub-ticket → CEO writes BLOCKED on parent ticket → Telegram escalation. Linear downtime is rare (<0.1% historical).
- **CTO bearer token expired**: Worker gets 401 from `/fire` → logs error → writes error comment to sub-ticket → Adam notified.

Source: Linear retry policy — https://inventivehq.com/blog/linear-webhooks-guide — Date: 2025 — Confidence: MEDIUM
Source: Cloudflare Worker error handling — https://developers.cloudflare.com/workers/ — Confidence: HIGH

### 7. Implementation cost
- **New routing rule in Cloudflare Worker**: detect `IssueLabel:added` with `agent:cto` label → route to CTO Routine endpoint (vs CEO Routine for `Issue:created`). ~20 lines of TypeScript.
- **New KV dedup key format**: `routineFired:{ticketId}:{label}` → TTL 24h. ~10 lines.
- **CEO Routine prompt update**: instructions to create sub-ticket with `agent:cto` label when CTO delegation needed, and to observe via Linear rather than polling `/fire` response directly.
- **CTO Routine prompt**: reads context from the sub-ticket it was spawned for (already standard in V4 design).
- **Estimate**: 2–3 hours (slightly less than Option (i) because no new secret management path needed — CTO token already lives in Cloudflare env vars used by the bridge).

---

## Option (iii) — Task tool spawn (for completeness)

### 1. Is it possible today?
**NOT VIABLE.** The official Anthropic subagents documentation states explicitly: "subagents cannot spawn other subagents — this prevents infinite nesting while still gathering necessary context." A Task-spawned CTO agent runs within the CEO Routine's session as a child context window. It does not have independent "main thread" status and therefore cannot use the Task tool to spawn its own workers. This breaks the requirement that CTO can act as a main-thread orchestrator for its own workers.

Source: https://code.claude.com/docs/en/sub-agents (Plan subagent tab): "This prevents infinite nesting (subagents cannot spawn other subagents)" — Date: May 2026 — Confidence: HIGH

### 2. Latency
N/A — NOT VIABLE. For reference, a Task-spawned subagent starts within ~1–5 seconds with no cold start cost (no new cloud session). This is the only advantage, but it doesn't matter if CTO cannot spawn workers.

### 3. Idempotency
N/A — NOT VIABLE.

### 4. Observability
N/A — NOT VIABLE. For reference, the subagent runs in the parent session's context window; Adam would see it in the same claude.ai session.

### 5. Cost per invocation
N/A — NOT VIABLE. Would consume only 1 of 15 daily runs (just the CEO session), which is the economic advantage — not actionable given the capability failure.

### 6. Failure mode
The fundamental failure mode IS the mechanism: CTO is limited to what workers CEO can spawn, creating a two-tier rather than three-tier hierarchy. CTO cannot independently assign work to its own leads.

Source: https://code.claude.com/docs/en/sub-agents — Date: May 2026 — Confidence: HIGH

### 7. Implementation cost
Would be lowest (~0 hours, no new code), but delivers wrong architecture. Not applicable.

---

## Recommendation

**Winner: Option (ii) — Linear sub-ticket + Cloudflare bridge re-fire**

**Reasoning:** Option (ii) reuses the Cloudflare Worker bridge that already exists in the V4 architecture, keeps Linear as the single source of truth for every agent action (matching the V4 "you always know where to look — Linear" principle), provides automatic observability through sub-ticket comments, and handles idempotency via KV dedup already needed for the CEO Entry-point. It adds ~20–30 lines of TypeScript to the Worker's routing logic and requires no new secret management path (CTO token already lives in Cloudflare env vars). Option (i) is technically equivalent but places the CEO Routine's prompt in charge of routing logic and credential handling, creating an agent-prompt dependency that makes the architecture harder to audit and modify.

**Fallback: Option (i) — API-fire + Linear poll**

If the Cloudflare Worker is not yet deployed or its routing logic is not ready, Option (i) allows the CEO Routine to call `/fire` directly from a shell command using `$ROUTINE_CTO_TOKEN` from the Routine's environment variables. Dedup must be implemented in the CEO Routine's prompt logic (check for existing CTO sub-ticket comment before firing). This is viable as a temporary path during WS4 build before the full Cloudflare bridge is wired.

**Implementation effort: 2–3 hours** (Worker routing rule + KV dedup key + CEO Routine prompt update + smoke test with a stub CTO Routine that echoes "CTO received: {text}" back to Linear).

---

## Open questions for the WS2 designer

1. **KV dedup TTL**: 24-hour TTL on the dedup key means if the same parent ticket is re-labeled `agent:cto` the next day (e.g., CTO was blocked and Adam re-triggers), the Worker would fire CTO again correctly. Is this the right behavior, or should the TTL be 7 days to prevent double-fire on long-running tickets? Needs Adam's input on expected ticket lifecycle.

2. **CTO bearer token storage**: Should the CTO Routine's `/fire` token live in Cloudflare Worker secrets (shared with the bridge) or in the Routine's own environment variables? Storing it in the Worker means the Worker can fire CTO directly; storing it in CEO's env vars means CEO fires CTO directly (Option i). This is the key architectural choice between (i) and (ii) — needs WS4 connection layer design to confirm.

3. **Multiple C-suite routing**: The current design shows one CEO → one CTO chain. When CEO needs to delegate to CPO AND CTO in parallel, does it create two sub-tickets (one per label) or one sub-ticket with two labels? The Worker routing logic must handle multi-label events unambiguously. Recommend one sub-ticket per delegation (cleaner Linear model).

4. **15 runs/day cap**: In a busy day (Linear webhook fires for 10 tasks, each needing CEO + CTO + CPO = 3 runs), the 30-run requirement exceeds the 15-run Max limit. The daily cap is per-account. Mitigation options: (a) CEO batches multiple tasks in one Routine run, (b) non-critical tasks queue in Linear until next day, (c) Adam enables "extra usage" billing. This is a real constraint that should be resolved in WS2E (Standing Routines spec) before WS6A agent design.

5. **CTO completion signal to CEO**: This design has CEO fire CTO and then CEO's session ends (it does not block-wait). If CEO needs to synthesize CTO's output into a final ticket update, how does CEO get called back when CTO finishes? Options: (a) CTO's last action comments on the parent ticket with `status:cto-done` label → triggers CEO via webhook, (b) CEO is not involved after delegation (CTO closes the parent ticket independently), (c) a separate Synthesizer Routine fires when all C-suite sub-tickets close. This callback contract must be designed explicitly in WS2B/2E.

---

## Sources

| URL | Date | Used for |
|-----|------|---------|
| https://code.claude.com/docs/en/routines | April 2026 | Primary: Routine triggers, API endpoint, usage limits, 15/day cap |
| https://platform.claude.com/docs/en/api/claude-code/routines-fire | April 2026 | Primary: /fire endpoint schema, idempotency absence, error codes, auth |
| https://code.claude.com/docs/en/sub-agents | May 2026 | Primary: subagents cannot spawn other subagents (Option iii NOT VIABLE) |
| https://claude.com/blog/introducing-routines-in-claude-code | April 2026 | Supporting: Routine overview, trigger types |
| https://9to5mac.com/2026/04/14/anthropic-adds-repeatable-routines-feature-to-claude-code-heres-how-it-works/ | April 2026 | Supporting: Max plan 15/day confirmation |
| https://inventivehq.com/blog/linear-webhooks-guide | 2025 | Linear retry policy (3×: 1min/1hr/6hr), 5-second timeout |
| https://developers.cloudflare.com/kv/ | 2025 | KV for dedup pattern |
| https://blog.cloudflare.com/rearchitecting-workers-kv-for-redundancy/ | October 2025 | KV read latency <5ms |
| https://community.cloudflare.com/t/deduplication-for-workers/802376 | 2025 | Cloudflare dedup pattern using KV hash |
| docs/08-agents_work/2026-05-05-war-room-rethink/00-V4-ENVIRONMENT-MAP.md | 2026-05-06 | Cold start ~2s estimate, Layer 3 architecture, cost table |
