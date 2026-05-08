# CRITIQUE WS2 — Observability + Transverse Cost (§2G + cost claims)
**Critic:** general-purpose adversarial reviewer, Sonnet 4.6
**Date:** 2026-05-06
**Time spent:** 22 minutes
**Lens:** Platform engineering + cost reality check

---

## Summary (3 sentences)

The §2G observability stack is architecturally coherent but structurally incomplete: disler answers Q1 partially when Bastion is on, and the custom `/war-room` page is the only always-on answer to all three questions — but that dependency is never made explicit. The $5-15/mo Routine cost estimate is optimistic by a factor of 2-4x once realistic first-fire token counts replace the "$0.30 avg per cron Routine" assumption, and the $10/board-meeting cap is only achievable if Opus prompt-caching is warm on every persona invocation. The doc carries four silent single points of failure — disler upstream stagnation, Helicone acquisition trajectory, lack of any alerting layer, and unspecified `linear_ticket` prop drilling — any one of which causes the "answers Adam's 3 questions" claim to silently degrade.

---

## Cost reality check (TABLE)

| Claim | Source line | Honest math | Variance |
|-------|-------------|-------------|----------|
| Routines total $5-15/mo | ORCHESTRATION.md §2E: "assumes 30 days × $0.30 avg per cron Routine" | Morning Digest (Sonnet): ~2K tokens in + ~1K out = $0.021/run × 30 = $0.63/mo. EOD Sync (Haiku): ~1K in + 500 out = $0.004/run × 30 = $0.12/mo. Auto-Unblock (Sonnet, on-demand, est. 4/mo): ~3K in + 1.5K out = $0.031/fire × 4 = $0.12/mo. Monday Standup (Sonnet): ~3K in + 2K out = $0.039/run × 4 = $0.16/mo. Friday Retro (Sonnet): ~5K in + 3K out = $0.060/run × 4 = $0.24/mo. Competitor/Customer/GEO signals (Sonnet, ~4/mo each): ~4K in + 2K out = $0.048/fire × 12 = $0.58/mo. CEO fires (Sonnet, est. 10/mo Lite+Full): ~8K in + 4K out = $0.084/fire × 10 = $0.84/mo. **Conservative total: ~$2.69/mo. Realistic (with cache misses + re-fires): $5-8/mo.** | Claim is directionally right at low end, breaks at high end when QA-Lead fires and Auto-Unblock spikes. Not wrong but LOW confidence on the "avg". |
| Board meeting $10/meeting cap | ORCHESTRATION.md §2F: Round1 $5 + Round2 $2.50 + Round3 $1 = $8.50 claimed | Round 1: 4 Opus + 1 Sonnet subagents. Opus 4.6 = $5/M in + $25/M out. Each persona: ~4K tokens in + 2K out = $0.07/call × 4 Opus = $0.28; 1 Sonnet = $0.021. Round 1 total: ~$0.30. Round 2: same personas + 5×2K input overhead = ~$0.45. Round 3: Synthesizer Opus alone, ~8K in + 3K out = $0.115. **Cold cache total: ~$0.87/meeting. BUT: if prompts are NOT cache-warm (each is a fresh subagent Task spawn), cost jumps ~10x on cache miss.** Cache priming requires the persona .md files to have been seen before; first meeting cold = ~$8.70. Subsequent meetings (cache warm) = ~$1-2. $10 cap is achievable but is the COLD-START ceiling, not the average. The doc presents it as the ceiling, which is backward. | Claim technically holds as a ceiling but the framing implies it is the *expected* cost, not the worst case. |
| Inngest $0/mo | ORCHESTRATION.md §2C: "free until ~5 paying customers (50K function runs/mo)" | fan-in-watcher triggers on EVERY `linear/issue.updated` event — not just Beamix orchestration events, but ALL Linear activity. If Linear fires 20 webhooks/day (comments, status changes, label changes on all tickets), that is 600 events/mo into Inngest. Each fan-in-watcher run = 1 function run. embed-* functions: 5 functions × ~20 git pushes/mo = 100 runs. Total well under 50K. Claim holds. | Claim is correct at solo scale. |
| Cloudflare Workers $0/mo | V4 env map: "100K requests/day free tier" | Linear webhooks at ~20/day = 600/mo. Routine re-fires: ~80/mo. Negligible. | Claim is correct. |
| Supabase Realtime $0 (2M msg/mo limit) | RESEARCH-WS2G §(e): "9 Routines × ~10 events × 30 days = 2,700 messages — negligible" | This calculation only counts standing Routine progress updates. Add: CEO fires (10/mo × ~20 progress rows = 200), CTO/CMO fires (est. 30/mo × ~15 rows = 450), QA-Lead cycles (est. 15/mo × ~10 rows = 150), Auto-Unblock (4/mo × 10 rows = 40). **Realistic: ~3,600-6,000 realtime messages/mo.** Still far under 2M. | Claim is correct for solo-founder scale. Realtime is not a risk until >100 paying customers drive significant product-side subscription loads sharing the same connection pool. |
| Helicone $0 (10K req/mo free) | RESEARCH-WS2G §(f) | 9 standing Routines × ~5 LLM calls × 30 = 1,350. CEO+C-suite ad-hoc: est. 10 fires × 10 calls = 100. Product app LLM calls (scan engine, recommendations): est. 200/mo at 0 customers. **Total: ~1,650/mo — fine.** At 5 customers: add product calls × 5, approaching 2K-3K. Still under 10K. | Claim holds through first 10-15 customers. Breaks if product app LLM calls are heavier than estimated. |
| Observability total $0/mo | §2G conclusion | $0 initial, confirmed. But: see Finding H-4 (Supabase row growth) and Finding H-5 (Bastion always-on dependency). | Correct at launch; not guaranteed at 12 months. |

---

## Findings (severity-ranked H/M/L · confidence H/M/L)

---

### H-1 — The "3 questions answered" claim is split across two systems with a single-machine dependency
**Severity: H · Confidence: H**

The doc states: "disler answers Q1 ('what is the army doing right now?')." This is only true when the Bastion Mac is on and the Bun server is running. The V4 env map is explicit: "IF MAC OFF: Layer 3 keeps the company running. Mac is acceleration."

Practically: if Adam is traveling, Mac is asleep. Disler is down. Q1 is unanswered by disler. The `/war-room` Next.js page (Vercel, always-on) answers Q1 via `claude_progress` Realtime — but this is never stated as the primary Q1 answer. The doc presents disler and the custom page as complementary without saying "disler is available only when Bastion is up; /war-room is the authoritative always-on Q1 source."

This is a design gap, not just a documentation gap: if Claude Code hooks are what populate disler's SQLite, those hooks fire on the Bastion. But if agents run as Anthropic Routines in the cloud (Layer 3), and hooks are configured in `.claude/settings.json` on the Bastion repo, then cloud Routine runs do NOT trigger Bastion-local hooks. The hooks execute inside the Routine's cloud container, posting to `localhost:4000` — which does not exist in the cloud. **disler receives zero events from cloud Routine runs.** Only Bastion-local `claude -p` sessions would be captured.

This means disler is only useful for Bastion-side development sessions, not for the 24/7 Routine fleet. The war-room page is the ONLY working Q1 answer for cloud Routines.

**The claim "disler answers Q1" is architecturally false for cloud Routines.**

---

### H-2 — disler hooks emit Python subprocesses per every Claude Code event. At Routine scale, this adds non-trivial latency overhead.
**Severity: H · Confidence: M**

The hook config spawns `python3 .claude/hooks/disler-emit.py` for every event. Claude Code fires hooks synchronously before/after each tool call. In a Full-tier CEO run with 5 C-suite subagents, each subagent averaging 30 tool calls, the event volume is:

- 6 SubagentStart + 6 SubagentStop = 12 events
- 5 workers × 30 tool calls × 2 (Pre + Post) = 300 PreToolUse/PostToolUse events
- PostToolUseFailure: variable
- SessionStart/End: 6 more

**~318 Python subprocess invocations per Full-tier task.** Each Python cold-start on macOS is ~80-150ms for a minimal script. Even if the script is pre-warmed (unlikely with multiple concurrent hooks), each call makes a local HTTP POST to the disler Bun server. Total overhead per Full-tier task: potentially 25-50 seconds of pure subprocess latency added to the session.

This is not documented or acknowledged. For the Bastion development sessions where disler is actually useful, this latency adds up during rapid iteration. The hook approach of forking Python on every event is a known anti-pattern; the right approach is a persistent socket listener or a minimal shell one-liner that writes to a FIFO. This is upstream disler's architecture choice — Beamix cannot fix it without forking.

---

### H-3 — disler is a single-developer GitHub project with uncertain maintenance trajectory
**Severity: H · Confidence: M**

The research doc notes 1,402 stars and 369 forks but does not check last commit date or Claude Code version compatibility. Key questions not answered:

1. Does disler support the current Claude Code hook schema for `SubagentStart`/`SubagentStop`? These events were added post-v2. If disler was last actively updated 6+ months ago, the event schema may have drifted.
2. Claude Code v2.1+ introduced subagent isolation events with new fields (session isolation IDs). Disler's SQLite schema may not capture them, causing silent data loss on multi-agent events.
3. Bus factor is 1 (the `disler` account). The repo has no active maintainers section. If the author stops responding to issues and Claude Code ships a breaking hook format change, Beamix either forks or loses the dashboard with zero migration path.

The doc mentions disler under "what changes downstream (WS4)" as "the disler exact fork strategy (vendor or use upstream) — WS4 build phase." This means the fork decision is deferred — but the hook config is being designed against upstream disler's current Python script interface. If the fork decision lands on "vendor and maintain," that is an ongoing maintenance tax not in the $0/mo cost claim.

---

### H-4 — Q2 (cost per day/ticket) requires Helicone OR extensive manual instrumentation. Without Helicone, the audit_log gives per-Routine cost, not per-LLM-call cost.
**Severity: H · Confidence: H**

The doc says the `/war-room` page answers Q2 using `audit_log.cost_usd`. This field is populated when a Routine writes its completion row. That means Q2 cost granularity is per-Routine-invocation, not per-LLM-call.

If Adam wants "how much did BMX-101 cost?" he gets the CTO Routine's self-reported total, which is only accurate if the Routine tracked its own token usage across all its LLM calls and summed them. Anthropic does not expose cumulative session cost via API — only per-response `usage` fields. The Routine would need to:
1. Parse `usage.input_tokens` and `usage.output_tokens` from every LLM response
2. Apply the correct per-model rate
3. Write the running sum to `claude_progress` at each step
4. Write the final sum to `audit_log` on completion

None of this instrumentation logic is specified. It is assumed to happen, but the mechanism ("agents write cost to audit_log") is hand-waved. Without this, `cost_usd` in `audit_log` is NULL or 0 for every row, and Q2 collapses entirely.

Helicone solves this automatically via proxy interception — but Helicone is labeled "optional" and deferred ("defer until Q2 question gets noisy"). This is backwards: Helicone should be the foundation of Q2, not an optional add-on.

---

### H-5 — No alerting layer. The dashboard is pull-only. Adam must open the page to know something is wrong.
**Severity: H · Confidence: H**

The §2G observability stack is entirely read-only and pull-based. Adam has to navigate to `/war-room` to see if anything is wrong. The doc has no:

- Telegram alert when daily cost exceeds a threshold (e.g., "today's Routines have spent $8, target is $5")
- Alert when a Routine fails more than N times in a row
- Alert when `audit_log` shows `status = 'over_budget'` or `outcome = 'BLOCKED'`
- Alert when disler stops receiving events (Bastion went offline silently)

The V4 env map §failure modes mentions: "Anthropic API down → Telegram bot pings Adam if outage >10 min" — but this is about Anthropic outages, not about agent logic failures or cost runaways. The hard cap is Anthropic Console at $1,500/mo — that is a catastrophic backstop, not an operational alert.

Without push alerting, the war room answers Adam's questions only when Adam thinks to ask. A 3am cost runaway (a Routine in a retry loop firing CEO repeatedly) is not caught until morning. The doc acknowledges this nowhere.

---

### M-1 — `linear_ticket` prop drilling is unspecified. The "cost by ticket" feature in /war-room will not work without it.
**Severity: M · Confidence: H**

The `/war-room` wireframe shows "Cost by ticket: BMX-99 $4.10 (top) | BMX-98 $2.30." This requires every `audit_log` row to have a non-null `linear_ticket` field.

Workers spawned via `Task` from inside a C-suite Routine do not automatically inherit the parent's `linear_ticket`. The CEO writes BMX-100; CEO fires CTO with sub-ticket BMX-101; CTO spawns backend-engineer as a Task subagent. The backend-engineer's session does not know it is serving BMX-101 unless that context is explicitly passed in the Task prompt.

The doc says: "we'll enforce this via a Zod schema check on every Routine's completion write." But this enforces the Routine level only — not the worker level. Workers do not write to `audit_log` directly (they are subagents, not Routines). The CTO Routine writes a single completion row for the entire CTO session. Worker-level cost attribution within that session is invisible to `audit_log` entirely.

The "cost by ticket" display in the wireframe is achievable only at Routine granularity (one `audit_log` row per Routine fire), not at worker granularity. The wireframe implies finer granularity than the architecture supports.

---

### M-2 — The $10/board-meeting cap assumes prompt cache is warm on all Opus persona invocations. First meeting on any new topic is ~10x more expensive.
**Severity: M · Confidence: M**

The Round 1 cost breakdown ($5 total, 5 × $1) is based on Opus invocations with warm cache. Anthropic's prompt caching requires the cached prefix to appear at the start of the message and to have been seen in a prior request within the cache window (default 5 minutes, extendable to 1 hour with `cache_control`).

Board meeting personas are spawned as parallel Task subagents. Each subagent is an isolated process. If this is the first board meeting this week, the persona system prompts are not cached. At cold-start Opus rates ($5/M in), a 4K-token persona prompt + 4K topic context = 8K tokens = $0.04 input alone. With output of 2K tokens at $25/M output = $0.05. Per persona: $0.09. For 4 Opus personas in Round 1: $0.36. Round 1 total with Sonnet Strategist: ~$0.38.

Wait — these numbers are lower than $1/persona cap, not higher. Let me re-examine the doc's claim of "Round 1: 5 × $1 = $5." That cap is a budget ceiling, not an expected cost. The concern is the opposite of what I initially assumed: the $10 cap is very generous for a single meeting. The risk is that 4 board meetings/mo × $10 = $40 is a significant chunk of the $100 Max budget if board meetings become the preferred decision mechanism and Routine token costs compound.

**Revised finding:** The $10 cap will not be breached in practice (realistic cost is $1-3/meeting). The risk is instead that 4 meetings/month at even $3 each = $12/mo, which combined with $8-15 in Routines = $20-27/mo, leaving only $73-80 for actual product work and C-suite chains. This is tighter than the doc implies with its "$5-15/mo new spend" framing.

---

### M-3 — Helicone "no longer actively developed" for Claude Code integration. The cost-tracking story depends on a deprecated integration path.
**Severity: M · Confidence: M**

The research doc explicitly flags: "The Claude Code integration page notes 'This integration method is maintained but no longer actively developed.'" Helicone was acquired by Mintlify in March 2026. The ANTHROPIC_BASE_URL proxy approach works today, but:

1. If Helicone deprecates the Claude Code proxy endpoint post-acquisition, Beamix loses automatic cost tracking overnight with no warning other than a changelog entry.
2. The Mintlify acquisition context suggests Helicone's roadmap will shift toward Mintlify's documentation tooling use cases, not agent observability.
3. The doc presents Helicone as the Q2 safety net ("defer until Q2 question gets noisy"). If that moment arrives and Helicone is broken, there is no fallback specified.

The doc's fallback plan for broken Helicone is: "AgentOps cloud (free 5K/mo) or just rely on /war-room page without Helicone." Relying on `/war-room` without Helicone means reverting to Finding H-4 — unspecified manual instrumentation to populate `cost_usd` in `audit_log`.

---

### M-4 — Supabase audit_log row growth is unplanned. At 12 months of active use, table size becomes a compute/query concern.
**Severity: M · Confidence: M**

At current projected volume: ~30 Routine fires/mo (Routines + CEO ad-hoc) = 360 rows/year in `audit_log`. `claude_progress` is more aggressive: each Routine writes ~5-10 rows per fire = 150-300 rows/mo = 1,800-3,600 rows/year.

At 3,600 rows/year, no concern. But the `nightly audit-log-rollup Inngest job` is listed in §2C to "compress yesterday's audit_log into daily summary table." The compressed table is never defined — no schema, no retention policy, no rollup SQL. Without the rollup job implemented, raw `audit_log` grows unbounded. The doc lists the job as "NEW (built WS2G)" but WS2G is an architecture doc — it has not been built.

The practical issue: Supabase Pro ($25/mo) includes 8GB database. Row count is not the limit; storage is. 3,600 rows/year with JSONB `spec` column (each row ~2-5KB) = ~10-18MB/year. Storage is not a problem. The concern is query performance: the `/war-room` page does `SELECT ... WHERE ts > now() - interval '7 days'` on `audit_log`. With the `ts DESC` index, this is fine at 1K-10K rows. Not a 12-month risk.

**Revised finding:** Row growth is not a material risk at solo-founder scale. The `nightly rollup` job is unnecessary for the stated storage/query reasons. Its absence does not matter. Downgrade to L.

---

### M-5 — No trace ID propagation. Cross-Routine flows appear as flat rows, not trees. The /war-room wireframe implies tracing it cannot deliver.
**Severity: M · Confidence: H**

The §2G wireframe shows a flat list of Routine invocations. There is no parent-child relationship visible in the `audit_log` schema — it has `fan_in_key` and `linear_ticket` but no `parent_audit_log_id` or `trace_id`.

A Full-tier flow (CEO → CTO → 3 workers → QA-Lead) generates 5 `audit_log` rows: one per Routine fire plus one for QA-Lead. They are linked only by `linear_ticket` (if prop drilling works — see M-1) and `fan_in_key` (which exists only if the CEO wrote it into the CTO's spec). Workers (subagents) produce no `audit_log` rows at all.

The wireframe UI implies: "Cost by ticket: BMX-99 $4.10" — this is achievable only as the SUM of all Routine rows sharing that ticket, not as a tree view. There is no way to see "CEO spawned CTO → CTO spawned backend-engineer" without adding a `parent_routine_id` column to `audit_log`. The doc does not have this column.

A user looking at the war-room page for a Full-tier task sees 5 rows in temporal order, not a causality tree. This is sufficient for "what happened" but not for "why did this cost $4.10 and where did it come from."

---

### L-1 — /war-room auth mechanism is unspecified
**Severity: L · Confidence: H**

The doc says the page is "auth-gated to Adam." Beamix uses Supabase Auth. The mechanism is not stated: Is this a middleware check on Adam's Supabase user ID? An email allowlist? An IP restriction? Relevant because:

1. The `audit_log` table contains internal agent operational data, not customer PII — low regulatory risk.
2. The `claude_progress` table contains cost data — commercially sensitive but not secret.
3. If the RLS policy on these tables is not set to `authenticated + email = adam's email`, any authenticated Beamix customer with a valid JWT could query these tables directly via Supabase client.

The doc defines the Supabase schema but does not specify RLS. This is a WS4 implementation detail but should be noted in WS2 as a requirement.

---

### L-2 — The "cron Routines don't count against 15/day cap" assumption is flagged as unverified in the doc's own open questions, but the Routine cost math in §2E depends on it.
**Severity: L · Confidence: H**

Open question #6 in the doc: "Researchers report cron Routines don't count against /fire cap (per Anthropic docs). Smoke-test in WS4 — if this turns out to be wrong, the 9 standing Routines collide with the 15/day budget."

If the assumption is wrong, the daily cap math collapses: 9 standing + 15 on-demand = 24 fires/day needed, vs 15 cap. Five Routines would fail to fire daily. The Morning Digest alone (07:30) + EOD Sync (20:00) + three weekly Routines firing the same day (Monday Standup) = 3 cap burns on a Monday, leaving 12 for product work. This is manageable IF the cap exemption holds. If it doesn't, the Monday Standup is deprioritized and the Competitor/Customer/GEO signals on Sunday consume 3 more cap burns.

This is flagged correctly in the doc. It is not a missed finding — it is an acknowledged uncertainty. Noted here for completeness.

---

## Things that are right

1. **Langfuse self-host disqualification is correct.** 3.2GB available RAM vs 8GB minimum for Langfuse v3 + ClickHouse — this is well-researched and the math holds.

2. **AgentOps free tier burn estimate is correct.** 5K events/mo burned in first week of 9 standing Routines at 10 events each × 30 days = 2,700 minimum, leaving only 2,300 for ad-hoc. Correct and properly disqualifying.

3. **Supabase Realtime math for standing Routines is correct.** 2,700 messages vs 2M limit is correct. Not a concern at this scale.

4. **The audit_log schema is well-designed.** The JSONB `spec` field capturing the full trust-mode payload, plus indexed `linear_ticket`, `fan_in_key`, and `ts DESC` columns, is the right structure. No issues here.

5. **Helicone free tier headroom is correctly estimated.** 1,350 standing Routine LLM calls vs 10K limit — accurate calculation with appropriate buffer noted.

6. **The Inngest fan-in and embed-* function designs are coherent.** The `step.waitForEvent` pattern for fan-in is appropriate and Inngest's free tier is not at risk at solo scale.

7. **Board meeting anti-anchoring guard is sound.** Parallel Task spawning for Round 1 personas, fresh context for the Synthesizer — these are correct isolation patterns for preventing groupthink in a multi-agent deliberation.

8. **The $0-11/mo new spend total for V4 is correct** given the free tiers cited. The ONLY new cost is electricity (~$3) and optionally Linear Standard ($8). No vendor lock-in.

---

## Open questions

1. **Do cloud Routine sessions trigger `.claude/settings.json` hooks at all?** If Anthropic Routines run in isolated cloud containers with their own Claude Code process, the hook config in the Beamix repo's `.claude/settings.json` is either (a) read by the cloud container from the repo checkout, or (b) ignored because cloud Routines don't use local `.claude/settings.json`. If (b), disler receives zero events from cloud Routines. This is the most critical architectural uncertainty in §2G and is not addressed anywhere in WS2.

2. **What is the token budget for a typical Morning Digest Routine?** The $0.30/run estimate implies ~2K input + 1K output tokens for Sonnet. But a Morning Digest reading yesterday's session logs (`docs/08-agents_work/sessions/YYYY-MM-DD-*.md`) could easily pull 10K-20K tokens of context before generating anything. If session files are verbose (they have YAML frontmatter + multi-section body), the Morning Digest alone could cost $0.09-0.18/run = $2.70-5.40/mo, not $0.63/mo.

3. **How does a Routine self-report its `cost_usd` to audit_log?** Anthropic's Claude Code API does not expose cumulative token cost as a session-level metric. Each LLM response has `usage.input_tokens` and `usage.output_tokens`. The Routine prompt must instruct the agent to track these manually and compute cost using known per-model rates — which requires the agent to know its own model (it does, from frontmatter) and apply the correct rate formula. This is a non-trivial instrumentation requirement that is assumed but not specified. Without it, Q2 has no data.

4. **Is disler's SQLite on Bastion backed up?** If Bastion reboots, SQLite survives (it is file-based). But if the Bastion disk is corrupted or if Adam replaces the Mac, historical disler data is lost. The Bastion's SQLite is explicitly NOT in the "sources of truth" Layer 4 table. This is acceptable only if disler data is understood to be ephemeral/temporary — but the doc implies it is the live Q1 answer, suggesting some expectation of persistence.

5. **Does the nightly `audit-log-rollup` Inngest job have a defined schema for its output table?** The job is listed in §2C as "built WS2G" but §2G does not define the daily summary table schema. If this job is not built, there is no long-term cost trend view beyond 7 days (the `/war-room` "this week" panel). Monthly burn visibility requires it.

---

## Sources

| Claim | Source | Date | Confidence |
|-------|--------|------|------------|
| Anthropic Claude Sonnet 4.6 pricing: $3/M input, $15/M output, $0.30/M cache reads | https://anthropic.com/pricing (API pricing page) | May 2026 | HIGH |
| Anthropic Claude Opus 4.6 pricing: $5/M input, $25/M output | https://anthropic.com/pricing (API pricing page) | May 2026 | HIGH |
| Anthropic Claude Haiku 4.5 pricing: $0.80/M input, $4/M output | https://anthropic.com/pricing (API pricing page) | May 2026 | HIGH |
| Helicone free tier: 10K requests/mo | https://www.helicone.ai/pricing | May 2026 (per research doc) | HIGH |
| Helicone Claude Code integration "no longer actively developed" | https://docs.helicone.ai/integrations/anthropic/claude-code | May 2026 (per research doc) | HIGH |
| Helicone acquired by Mintlify March 2026 | Research doc RESEARCH-WS2G-observability.md, source: search result | March 2026 | MEDIUM (not verified from primary) |
| Langfuse self-host min 8GB RAM | https://github.com/orgs/langfuse/discussions/5785 | 2024-2025 (per research doc) | MEDIUM |
| Supabase Realtime free tier: 2M messages/mo | Supabase pricing page (via research doc) | May 2026 | HIGH |
| Inngest free tier: 50K function runs/mo | https://www.inngest.com/pricing (via ORCHESTRATION.md) | May 2026 | HIGH |
| disler repo: 1,402 stars, Python hooks + Bun server | https://github.com/disler/claude-code-hooks-multi-agent-observability | May 2026 (per research doc) | HIGH |
| Python subprocess cold-start on macOS: 80-150ms | General platform engineering knowledge; no primary source cited | Ongoing | MEDIUM |
| Anthropic Routines cron exemption from 15/day cap | Per Anthropic docs cited in ORCHESTRATION.md §2E — flagged as unverified in open question #6 | May 2026 | LOW (unverified per doc's own admission) |
