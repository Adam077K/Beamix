# RESEARCH-WS2G — Cross-Agent Observability
**Researcher:** Sonnet 4.6, 2026-05-06
**Time spent:** ~28 minutes
**Confidence:** MEDIUM (pricing confirmed from official sources; RAM / real-time caps partially from community reports)

---

## Summary

The disler `claude-code-hooks-multi-agent-observability` repo is the highest-fit option for the Beamix war room: it is the only tool purpose-built for Claude Code multi-agent hooks, self-hosts on Bastion Mac at negligible RAM (~50-150 MB for Bun + SQLite), and reaches a working dashboard in under 2 hours — but it shows NO dollar cost data and has NO Linear integration, covering only Question 1 ("What is the army doing?") and partially Question 3 (errors). Langfuse Cloud free tier covers all three questions with SDK instrumentation but burns its 50K unit/month budget in ~3,000-8,000 agent Routine executions (complex multi-step agents use 15-20 units each), making it tight at 9 standing Routines plus ad-hoc spawns. The recommended combination is disler for live Claude Code activity + a thin custom Supabase page (already in stack) for dollar cost reporting — zero new vendor spend, under 10 hours total build.

---

## Comparison matrix

| Criterion | disler hooks dashboard | Langfuse Cloud free | Langfuse self-host | AgentOps Cloud | Custom Next.js (apps/web) | Helicone |
|-----------|----------------------|--------------------|--------------------|---------------|--------------------------|----------|
| **Cost now** | $0 | $0 | $0 (infra only) | $0 (5K events/mo) | $0 (already in Supabase) | $0 (10K req/mo) |
| **Cost at 5 customers** | $0 | $0 (likely still in 50K) | $0 | $40/mo (pay-as-you-go) | $0 | $79/mo (Pro) |
| **Cost at 50 customers** | $0 | $29/mo (Core) or overage | $0 (own infra) | $40+/mo | $0 | $79/mo |
| **Setup time** | ~1-2 hrs | ~3-4 hrs | ~8-12 hrs | ~3-4 hrs | ~6-10 hrs | ~2-3 hrs |
| **RAM on Bastion Mac** | ~50-150 MB (Bun + SQLite) | N/A (cloud) | ~4-8 GB minimum (kills Bastion Mac) | N/A (cloud) | ~0 MB extra (Supabase already running) | N/A (cloud) |
| **Q1: Live activity** | YES — real-time WebSocket | PARTIAL — traces post-execution | PARTIAL — traces post-execution | PARTIAL — session waterfall | YES — with Supabase Realtime | PARTIAL — request log |
| **Q2: Cost / $ per agent** | NO — zero cost data | YES — token + $ tracking | YES — token + $ tracking | YES — 400+ LLM cost tracking | YES — audit_log already has this | YES — cost per request |
| **Q3: Errors / failures** | YES — PostToolUseFailure events | YES — error spans | YES — error spans | YES — error events | YES — audit_log status field | PARTIAL — error codes |
| **Instrumentation style** | Auto via Claude Code hooks | Manual SDK wrapping | Manual SDK wrapping | Manual `agentops.init()` | Manual (write to audit_log) | Proxy via ANTHROPIC_BASE_URL |
| **Covers Claude Code subagents** | YES — all 12 hook events | PARTIAL — only if SDK is injected | PARTIAL — only if SDK injected | NO specific mention | YES — Bastion scripts write directly | YES — base URL intercepts all calls |
| **Linear integration** | NO | NO | NO | NO | YES — can add ticket_id column to audit_log | NO |
| **Real-time vs batched** | Sub-second (WebSocket) | Batched (post-execution) | Batched (post-execution) | Batched (session-end) | Sub-second (Supabase Realtime) | Near-real-time (proxy) |
| **Lock-in** | None — SQLite, open MIT | Medium — proprietary schema, open source | Low — open source | Medium — proprietary | None — own Supabase | Low — open, acquired by Mintlify Mar 2026 |

---

## Per-option detail

### (a) disler dashboard

**Canonical repo:** https://github.com/disler/claude-code-hooks-multi-agent-observability
Stars: 1,402. Forks: 369. Language: Python (hooks) + TypeScript (server/client).

**Architecture:** Claude Code lifecycle hooks (12 event types) trigger Python scripts that POST JSON to a Bun TypeScript server. Server stores in SQLite (WAL mode) and broadcasts via WebSocket to a Vue 3 + Tailwind dashboard.

**Event types captured:**
- PreToolUse, PostToolUse, PostToolUseFailure (tool execution + errors)
- SubagentStart, SubagentStop (multi-agent coordination)
- SessionStart, SessionEnd, Stop, PreCompact (lifecycle)
- Notification, PermissionRequest, UserPromptSubmit (user interaction)

**Dashboard shows:**
- Real-time event timeline with session-based color coding
- Live pulse chart (activity density with tool emojis: Bash, Read, Write, Edit, etc.)
- Multi-criteria filtering by app, session ID, event type
- Chat transcript viewer with syntax highlighting
- PostToolUseFailure events surfaced with error details

**What it does NOT show:** Token usage, dollar cost per agent/Routine, which Linear ticket triggered the run, cost breakdown by Routine type.

**Setup:** Copy `.claude/settings.json` hooks config, install Bun + Python 3.11+ with `uv`. No Docker. ~1-2 hours to working dashboard.

**Memory footprint:** Not formally documented. Bun server with SQLite WAL has no heavy background services. Estimated 50-150 MB at idle — negligible on 3.2 GB available RAM.

**Source:** https://github.com/disler/claude-code-hooks-multi-agent-observability — confirmed May 2026. Confidence: HIGH.

---

### (b) Langfuse Cloud free tier

**Free tier:** 50,000 units/month, 30-day data retention, 2 users, community support, no credit card required.

**Unit definition:** 1 unit = 1 trace OR 1 observation (span/generation/tool call) OR 1 score. A complex multi-step agent Routine (tool calls, LLM calls, sub-observations) consumes 15-20 units per Routine execution. A simpler Routine with 3-5 steps consumes ~6-10 units.

**Practical unit budget:** At 15 units/Routine, 50K units = ~3,333 Routine executions/month. At 9 standing Routines firing daily = 270/day × 30 = 8,100 executions/month minimum. This likely exceeds the free tier for an active war room.

**Dashboard coverage:**
- Q1 (live activity): PARTIAL — Langfuse shows traces after execution, not live streaming mid-execution. Agent Graphs GA (Nov 2025) visualizes execution flow post-hoc.
- Q2 (cost): YES — token + dollar cost tracking with model-specific pricing.
- Q3 (errors): YES — error spans with stack traces.

**Instrumentation:** Manual SDK (`langfuse.trace()`, `langfuse.generation()`) wrapped around LLM calls. Claude Code hooks are NOT auto-captured — requires adding Langfuse SDK calls to each agent's Python/TypeScript code.

**Lock-in:** Open source (MIT). Schema is proprietary but exportable.

**Sources:**
- https://langfuse.com/pricing — May 2026. Confidence: HIGH.
- https://langfuse.com/docs/administration/billable-units — May 2026. Confidence: HIGH.
- https://langfuse.com/changelog/2025-11-05-langfuse-for-agents — Nov 2025. Confidence: HIGH.

---

### (c) Langfuse self-host

**Architecture (v3):** Langfuse Web + Worker containers + PostgreSQL + ClickHouse + Redis/Valkey + S3/MinIO blob storage. ClickHouse was added in v3 as the OLAP analytics layer.

**RAM requirement:**
- Official recommendation: 4 cores, 16 GiB RAM for Docker Compose VM.
- Lower bound: 8 GiB (maintainer-confirmed "really at the lower end").
- Community homelab report: ClickHouse alone idles at ~2 GB+; full stack idles at ~1.5 GB in one report but this was considered very minimal.
- v2 → v3 increase: "double the RAM and CPU" per community thread (v2 ran on 4 GB RAM).

**Verdict for Bastion Mac:** 3.2 GB available RAM is insufficient. Langfuse v3 self-host requires a minimum 8 GB free, recommended 16 GB. Running this on the Bastion Mac would starve OS and agent processes. DISQUALIFIED for Bastion Mac deployment.

**Cost:** $0/mo for the software. Infrastructure cost is Bastion Mac electricity only if run there — but it can't fit.

**Sources:**
- https://github.com/orgs/langfuse/discussions/5785 — community report, 2024-2025. Confidence: MEDIUM.
- Langfuse maintainer quote in that thread. Confidence: HIGH.

---

### (d) AgentOps Cloud

**Pricing:**
- Free: $0/mo, up to 5,000 events/month.
- Pro: starts at $40/mo, pay-as-you-go, unlimited events, unlimited log retention.
- Enterprise: custom.

**Anthropic support:** Yes, "first class support" for Anthropic models including Claude, Haiku, Sonnet. Requires `anthropic>=0.32.0`. Instrumentation is MANUAL — must call `agentops.init()` before any LLM client.

**Dashboard shows:** Session waterfall (timeline of all calls), LLM calls as chat history, tool calls, error events, session overview for meta-analysis across sessions.

**Coverage gaps:**
- Q1 (live): PARTIAL — session waterfall is post-session, not mid-execution streaming.
- Q2 (cost): YES — "400+ LLM cost tracking" claimed.
- Q3 (errors): YES — error events captured.

**Free tier limit concern:** 5,000 events/month is extremely tight. 9 Routines × ~10 events each × 30 days = 2,700 events minimum from standing Routines alone. Ad-hoc Routines from Linear tickets will consume the remaining 2,300 quickly.

**Claude Code subagent support:** Not documented. AgentOps requires manual SDK injection; Claude Code subagents run in isolated processes without SDK injection by default.

**Lock-in:** Proprietary SaaS. No open-source self-host option on free/pro tiers.

**Sources:**
- https://www.agentops.ai (pricing page) — May 2026. Confidence: HIGH.
- https://docs.agentops.ai/v1/integrations/anthropic — May 2026. Confidence: HIGH.

---

### (e) Custom Next.js page in apps/web/

**What exists today:**
- `claude-progress.txt` shared state file on Bastion (append-only log per V4 env map)
- Supabase `audit_log` table (per V4 Layer 4 requirement — already planned, may need schema implementation)
- Supabase already paid and running
- apps/web/ already deployed on Vercel
- Supabase Realtime available for live updates

**What to build:**
1. `/app/(dashboard)/war-room/page.tsx` — protected page in existing Next.js app.
2. Supabase Realtime subscription on `audit_log` INSERT — pushes new rows to UI instantly.
3. Three panels:
   - Active Routines: filter `audit_log` WHERE `status = 'running'` — answers Q1.
   - Cost today: aggregate `token_cost_usd` by `agent_name` and `routine_name` — answers Q2.
   - Failures: filter `audit_log` WHERE `status IN ('failed', 'blocked')` — answers Q3.

**Linear integration:** YES — add `linear_ticket_id` column to `audit_log`. Agent Routines write their triggering ticket ID on start. Dashboard can link directly to Linear ticket.

**Build time estimate:**
- Supabase `audit_log` schema migration: 1 hour
- Bastion-side write scripts (append to audit_log on each Routine step): 2-3 hours
- Next.js page with Supabase Realtime + 3 panels: 3-4 hours
- Total: ~6-8 hours to working version

**Cost:** $0 — all infrastructure already paid. Supabase free tier includes 2M realtime messages/month; 9 standing Routines at ~10 events each × 30 days = 2,700 realtime messages — negligible.

**Coverage:**
- Q1: YES — Supabase Realtime makes it sub-second.
- Q2: YES — `token_cost_usd` field populated by Anthropic API response metadata.
- Q3: YES — status field captures BLOCKED, failed, retry_exhausted.
- Linear: YES — can link to ticket.

**Gaps:** No automatic LLM call capture — every agent script must explicitly write to audit_log. If a Routine crashes before writing, that event is lost. Requires discipline across all agent code.

---

### (f) Helicone

**Pricing:**
- Hobby (free): 10,000 requests/month, 1 GB storage, 7-day retention, single seat.
- Pro: $79/mo, unlimited seats, usage-based beyond 10K requests, 1-month retention.
- Team: $799/mo.

**Anthropic / Claude Code integration:** YES via single env var:
`ANTHROPIC_BASE_URL=https://anthropic.helicone.ai/<your-helicone-api-key>`
All Claude Code calls route through Helicone's proxy and are automatically captured — including subagents that share the same base URL.

**Important caveat:** The Claude Code integration page notes "This integration method is maintained but no longer actively developed." Helicone recommends their AI Gateway instead. Helicone was acquired by Mintlify in March 2026; long-term trajectory uncertain.

**Dashboard shows:**
- Per-request cost (token usage + $ automatically calculated)
- Request logs with latency
- Error codes and failure rates
- Filtering by model, user, custom headers

**Coverage:**
- Q1 (live): PARTIAL — shows request log in near-real-time but not "which Routine is currently executing step 3 of 7."
- Q2 (cost): YES — best automatic cost tracking of all options; no manual instrumentation needed.
- Q3 (errors): PARTIAL — HTTP error codes only; doesn't know about BLOCKED agent returns or Routine-level logic failures.
- Linear: NO — no ticket linking.

**Lock-in:** Low — proxy approach means switching is one env var change. But acquisition by Mintlify adds uncertainty.

**Free tier vs war room volume:** 10K requests/month at 9 standing Routines × ~5 LLM calls each × 30 days = 1,350 requests minimum. Ad-hoc Routines will consume more. Likely stays within 10K free tier for solo Adam usage. At 5 customers the product app's LLM calls may eat into this budget.

**Sources:**
- https://www.helicone.ai/pricing — May 2026. Confidence: HIGH.
- https://docs.helicone.ai/integrations/anthropic/claude-code — May 2026. Confidence: HIGH.
- Mintlify acquisition: search result mention, March 2026. Confidence: MEDIUM (not verified from primary source).

---

## Recommendation

**Winner: (a) disler + (e) Custom audit_log page — combined**

**Reasoning:** Disler gives live Claude Code hook events (Q1 + Q3) in ~2 hours with zero RAM overhead and zero new vendor spend; a thin `/war-room` page in apps/web wired to the existing Supabase `audit_log` table adds the cost breakdown (Q2) and Linear ticket linking that disler lacks, for ~6-8 hours of additional work. The two together answer all three questions at $0/mo now and $0/mo at scale, using infrastructure already paid for, with no lock-in risk.

**Fallback: (b) Langfuse Cloud free tier**

If the custom page build is deprioritized, Langfuse Cloud covers Q2 and Q3 well and adds structured trace visualization — but requires manual SDK instrumentation across every agent script, does not give live mid-execution visibility, and will likely hit the 50K unit ceiling within a few weeks of active war room use with 9+ standing Routines firing daily.

**What the chosen stack still does NOT cover:**
- Automatic cost capture without explicit `audit_log` writes: if an agent crashes before writing its token cost, that data is lost. Mitigation: Helicone as a lightweight proxy layer on top (free tier is sufficient for solo Adam), adding automatic per-call cost capture as a safety net.
- Agent graph visualization (which Routine spawned which sub-task): not in disler or the custom page. Langfuse Agent Graphs would provide this if SDK is added later.
- Historical trend analysis beyond Supabase table queries: no pre-built charts; would need to build or use Supabase Studio.

---

## Open questions

1. **Is the `audit_log` table already created in Supabase, or is it still planned?** If not yet created, the schema migration is the critical first step for option (e).
2. **Do Bastion agent scripts (Routines) have a standard logging wrapper today?** If not, the 6-8 hour build estimate assumes adding `write_to_audit_log()` calls across all Routine scripts — higher if agents are scattered.
3. **Helicone as proxy layer on top of disler + custom page:** worth adding as a third layer for automatic cost safety net? Single env var change, zero instrumentation effort, free tier sufficient for solo use.
4. **Langfuse v2 (not v3):** Could Langfuse v2's lower RAM footprint (4 GB) fit on Bastion Mac with 3.2 GB free? Technically borderline — not recommended, and v2 is no longer maintained.
5. **disler dashboard persistence:** SQLite on Bastion Mac — does this survive Mac sleep/restart? Need to confirm Bun server auto-starts on boot (launchd plist).

---

## Sources

| Source | URL | Date | Confidence |
|--------|-----|------|------------|
| disler repo (canonical) | https://github.com/disler/claude-code-hooks-multi-agent-observability | May 2026 (active) | HIGH |
| disler README — architecture, events, setup | https://github.com/disler/claude-code-hooks-multi-agent-observability/blob/main/README.md | May 2026 | HIGH |
| Langfuse pricing page | https://langfuse.com/pricing | May 2026 | HIGH |
| Langfuse billable units definition | https://langfuse.com/docs/administration/billable-units | May 2026 | HIGH |
| Langfuse agent features (Nov 2025 changelog) | https://langfuse.com/changelog/2025-11-05-langfuse-for-agents | Nov 2025 | HIGH |
| Langfuse v3 RAM requirement — community discussion | https://github.com/orgs/langfuse/discussions/5785 | 2024-2025 | MEDIUM |
| Langfuse self-host overview | https://langfuse.com/self-hosting | May 2026 | HIGH |
| Langfuse Docker Compose guide | https://langfuse.com/self-hosting/deployment/docker-compose | May 2026 | HIGH |
| AgentOps pricing | https://www.agentops.ai | May 2026 | HIGH |
| AgentOps Anthropic integration docs | https://docs.agentops.ai/v1/integrations/anthropic | May 2026 | HIGH |
| AgentOps introduction docs | https://docs.agentops.ai/v1/introduction | May 2026 | HIGH |
| Helicone pricing | https://www.helicone.ai/pricing | May 2026 | HIGH |
| Helicone Claude Code integration | https://docs.helicone.ai/integrations/anthropic/claude-code | May 2026 | HIGH |
| Langfuse unit consumption analysis | https://coverge.ai/blog/langfuse-pricing | 2026 | MEDIUM |
| Supabase Realtime with Next.js | https://supabase.com/docs/guides/realtime/realtime-with-nextjs | 2025 | HIGH |
