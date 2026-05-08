# CRITIQUE WS2 — Durable Execution + Standing Routines (§2C + §2E)
**Critic:** general-purpose adversarial, Sonnet 4.6
**Date:** 2026-05-06
**Time spent:** 22 minutes
**Lens:** A platform reliability engineer who has seen "free tier is fine" and "we'll add a watcher" kill projects six weeks in.

---

## Summary (3 sentences)

The durable execution choice (Inngest) is the correct call — the argument is well-reasoned and the free-tier runway is real. However, §2E contains at least three arithmetic errors that understate true costs by 5-10x, the Vercel function-timeout interaction with Inngest steps is acknowledged as an open question then quietly dropped, and the cron-Routines-don't-count-against-the-cap claim is the single load-bearing assumption in the whole budget that rests on a news article rather than official docs. If that one claim is wrong, the 9 standing Routines immediately swamp the 15/day Max budget.

---

## Findings (numbered, severity-ranked)

### F1 — The $5-15/mo Routines estimate is wrong by ~5x (sev: H · conf: H)
**What's wrong:** The §2E table sums 9 Routines at $0.30 average × 30 days = $81/mo in API spend, not $5-15. The V4 env map and V3 Architect numbers were produced without doing the multiplication. The doc anchors to the V3 estimate without verifying it.

**Evidence:** Routine table shows: Morning Digest $0.30, Monday Standup $0.50, Friday Retro $1.00, EOD Sync $0.10, Auto-Unblock $0.50, Competitor Signal $0.50, Customer Voice $0.50, GEO Algorithm $0.50 (bi-weekly = ~$1.00/mo), CEO Entry-point $1.00. Weighted monthly total at stated fire rates: Morning Digest $9/mo, EOD Sync $3/mo, Monday Standup $2/mo, Friday Retro $4/mo, Auto-Unblock (estimated 10 fires/mo) $5/mo, three signal Routines $4.50/mo, CEO on-demand $15-30/mo at 1-2 Lite/day. That is $42-57/mo before board meetings and fan-in synth re-fires.

**Affects:** Budget planning, the "war room costs nothing" narrative, Adam's decision to stay on Max vs upgrade infra.

**If unfixed:** Actual spend will be 3-5x the stated ceiling inside the first month. Adam will experience sticker shock and lose confidence in the team's cost modeling.

---

### F2 — Vercel function timeout is unresolved and load-bearing (sev: H · conf: H)
**What's wrong:** §2C acknowledges that Vercel Hobby = 10s, Pro = 60s, and that a `step.run()` calling Claude synchronously could exceed this. ORCHESTRATION.md then lists Vercel Pro as the stack (the env map confirms this). The timeout ceiling is 60s on Pro. Inngest steps are designed to chain across invocations — but ONLY if you structure them correctly. The doc says "keep step.run() bodies thin (fire-and-poll)" as a workaround — this is a design constraint, not a solved problem, and no architecture has been drawn for it.

**Evidence:** RESEARCH-WS2C open question #1 ("Vercel function timeout: what is the plan-level timeout?") was explicitly flagged but no answer appears in ORCHESTRATION.md §2C. The "fire-and-poll" pattern for Anthropic Routines from inside an Inngest step requires a separate poll loop — not described anywhere. The research doc says "design decision: does the war-room use async Claude (fire API call → poll) or sync?" — this was never answered.

**Affects:** Every Inngest function that touches an Anthropic API call longer than 60s. This includes fan-in-watcher (which calls `/fire` and may need to poll for completion), routine-timeout-watcher, and any embed job that processes large documents.

**If unfixed:** Silent Vercel 504 timeouts kill Inngest steps mid-execution. Inngest retries the step, but the Anthropic API call already fired — meaning the Routine fires twice. On the third retry, the KV dedup TTL may have expired. You get duplicate Routine sessions on the same ticket with no circuit-breaker.

---

### F3 — Cron-Routines-don't-count-against-/fire-cap is unverified and load-bearing (sev: H · conf: H)
**What's wrong:** §2E and §2B both assert "Cron Routines do NOT count against the 15-runs/day cap on Max (per Anthropic docs — scheduled runs are excluded)." This is the single assumption that makes 9 standing Routines coexist with the 15/day budget. The ONLY source cited for this claim is a 9to5Mac news article (April 2026), explicitly flagged in the research doc as "MEDIUM confidence (news article, not official docs)." The official Anthropic Routines docs are cited separately but do not contain this statement.

**Evidence:** RESEARCH-WS2C source list: "9to5Mac: Anthropic adds Routines to Claude Code — Pro: 5 daily runs, Max: 15 daily runs — Confidence: MEDIUM (news article, not official docs)." ORCHESTRATION.md §2B open question #6 itself says "Smoke-test in WS4 — if this turns out to be wrong, the 9 standing Routines collide with the 15/day budget." The doc acknowledges the risk, then uses the unverified assumption as settled in every subsequent table.

**Affects:** If cron fires DO count against 15/day, all 9 standing Routines consume the entire daily budget before any Linear-webhook or on-demand work can run.

**If unfixed:** The entire Routine architecture breaks silently on Day 1 of WS4 smoke-test. The recovery path (stay on Max 20× at ~$200/mo, or cut 5+ Routines) is expensive and architecturally disruptive.

---

### F4 — `step.waitForEvent` timeout is undocumented and the fan-in-watcher will hang (sev: H · conf: M)
**What's wrong:** `step.waitForEvent("linear/issue.updated", ...)` is the fan-in barrier for CEO → multi-C-suite fan-out. Inngest's `waitForEvent` has a mandatory timeout parameter. The doc does not specify what timeout value is used. More importantly: CTO doing a hard task can be "In Progress" for hours. The default Inngest waitForEvent timeout (if not set) appears to be function-level (configurable but often 1-7 days in practice) — but if it's set too short (e.g., 30 min to match the Lite task budget), a hard task that runs 90 minutes silently fails the fan-in and CEO never synthesizes.

**Evidence:** §2C lists `step.waitForEvent("linear/issue.updated", { match: "data.fan_in_key" })` with no timeout parameter shown. The research doc notes Inngest's "15-min serverless cap per step" but conflates this with the waitForEvent timeout. These are different mechanisms. The failure mode table in §2B says "Sub-ticket sits 'In Progress' forever" for mid-execution crashes, but doesn't specify what happens to the waiting Inngest function — it eventually times out and writes what?

**Affects:** All Full-tier fan-out tasks. If CTO or CMO is slow, CEO never re-fires for synthesis. The ticket stays open with no resolution. There is no escalation path specified for "fan-in timed out."

**If unfixed:** Completed work by CTO/CMO is orphaned. No synthesis. No Linear comment closure. Adam sees an open ticket with "DONE" comments on sub-tickets but the parent ticket never closes.

---

### F5 — The 9 Routines are functionally 5 with day-of-week branching (sev: M · conf: H)
**What's wrong:** Morning Digest (daily) and Monday Standup (Mon 08:00, 30 minutes after Morning Digest at 07:30) overlap substantially. Both read yesterday's session logs and Linear status. Monday's Standup is essentially "Morning Digest plus weekly rollup" — they could be one Routine with a day-of-week branch. EOD Sync (daily 20:00) and Friday Retro (Fri 18:00) also overlap: Friday Retro reads the week, proposes agent edits, and opens a PR — but EOD Sync on Friday already appends to log.md and detects abandoned worktrees. Two Routines firing within 2 hours on Friday doing overlapping reads.

**Evidence:** Morning Digest MCP grants: `linear, github, mem0, pgvector`. Monday Standup MCP grants: `linear, github, supabase, mem0`. The inputs overlap; the outputs are "digest markdown" vs "1:1 doc" — structurally the same artifact with different framing. Competitor Signal, Customer Voice Signal, and GEO Algorithm Signal all write "3-5 sourced signals to Linear comment on Strategy/Signals" — identical output format, different data sources. Could be one Signal Routine with a source-config payload.

**Affects:** Inngest run count (marginal), cost (marginal), and — more importantly — prompt complexity. Each redundant Routine is another .md file to maintain, another cron to monitor, another failure surface.

**If unfixed:** Over 6 months, the overlapping Routines produce redundant state in `claude_progress` and `audit_log`, making the §2G war-room dashboard noisy and ambiguous about what ran and why.

---

### F6 — CEO re-fire for synthesis has no original context and re-read cost is uncounted (sev: M · conf: H)
**What's wrong:** When the fan-in-watcher re-fires CEO for synthesis, CEO is a fresh Routine session. It receives the synth payload (fan_in_key, sub_ticket IDs, parent ticket ID) and then must read: (a) the parent ticket, (b) each sub-ticket's DONE comment, (c) relevant DECISIONS.md entries, (d) the original trust-mode spec. This re-read cost is not counted in the $-cap per run. The CEO $-cap is listed as $1.00 for the entry-point Routine — but the synthesis re-fire is a separate `/fire`, meaning it also burns from the cap. Two CEO fires per Full-tier task = $2.00 minimum, not $1.00.

**Evidence:** §2E table shows CEO Entry-point cap at $1.00. §2B describes the synth re-fire as a separate `POST /v1/claude_code/routines/{ceo_routine_id}/fire`. The `memory_pre_loads` in the trust-mode spec lists DECISIONS.md sections and MOC files — but for synth, CEO also needs to read all N sub-ticket DONE comments (each could be 500-2000 tokens). At 5 sub-tickets × 1500 tokens = 7500 tokens of sub-ticket content, plus parent context. Sonnet at $3/M input: 7500 tokens = $0.022 just for sub-ticket reads. That's within the $1 cap — but this math was never done.

**Affects:** Full-tier task actual cost and the claim that CEO entry-point costs $1.00/run.

**If unfixed:** Cost modeling understates Full-tier task cost. At 2 Full-tier tasks/day × $2 CEO cost (not $1), monthly CEO Routine cost doubles the stated estimate.

---

### F7 — Embed jobs fire on every git push, incremental vs full-corpus strategy undefined (sev: M · conf: H)
**What's wrong:** Five embed Inngest functions fire on git push: `embed-decisions`, `embed-sessions`, `embed-brain`, `embed-codebase`, `embed-skills`. Adam pushes ~10x/day = 50 Inngest runs/day from embeds alone = 1,500/mo. The doc is silent on whether each embed job re-embeds the full corpus or only the changed files. If full corpus: as the corpus grows (decisions.md → 50 entries × ~500 tokens each = 25K tokens; sessions → 100+ files), each embed run costs more. If incremental: the diff detection logic needs to be built and is not mentioned.

**Evidence:** §2C lists `embed-decisions` triggered by "git push to `.claude/memory/DECISIONS.md`" — this implies watching a specific file, not the whole repo. But `embed-sessions` is triggered by "git push to `docs/08-agents_work/sessions/**`" — a wildcard path. Every push to the repo that touches any session file fires this. Adam's 10 pushes/day touch session files regularly.

**Affects:** Inngest run count (1,500/mo from embeds vs the 270/mo estimated for standing Routines alone), corpus embedding costs (pgvector writes, OpenAI embedding API if used), and Vercel function timeout (embedding a large corpus in a 60s window).

**If unfixed:** Embedding cost scales with corpus size without warning. At 6 months, the `embed-sessions` job may be processing 200+ files per push. This is a silent cost escalation, not a hard failure.

---

### F8 — Sunday morning Routine burst with no jitter and no failure isolation (sev: M · conf: H)
**What's wrong:** Three signal Routines fire within 2 hours: Competitor Signal (06:00), Customer Voice Signal (07:00), GEO Algorithm Signal (08:00). All three use `webfetch` and Sonnet. If Anthropic API is degraded Sunday morning (not uncommon — maintenance windows), all three fail simultaneously. The failure mode table in §2B does not include "standing Routine cron fails." No retry mechanism is specified for cron-triggered Routines (Anthropic Routines have no documented retry on cron fires). If the Routine session fails, it simply doesn't run until the next scheduled window — one week later for bi-weekly GEO.

**Evidence:** §2E table shows cron schedules with no jitter (Sun 06:00, Sun 07:00, Sun 08:00 exact). Anthropic Routines docs contain "zero language about retry semantics, crash recovery, or durable state" (verbatim from RESEARCH-WS2C). No Inngest fallback is specified for standing Routine failures — Inngest only owns fan-out/fan-in for CEO-dispatched work.

**Affects:** All three signal Routines. A single Anthropic API degradation event on Sunday morning silently drops a week of competitive intelligence.

**If unfixed:** Adam learns about competitive moves 1-2 weeks late if signal Routines miss their Sunday window. No alert is generated because the Routine simply didn't start — there is no "Routine didn't fire" detection mechanism.

---

### F9 — `claude_progress` table has no cleanup story (sev: M · conf: M)
**What's wrong:** Every Routine writes per-step rows to `claude_progress`. The schema has no TTL, no partition, no archival plan. At 9 Routines × ~10 steps × 30 days = 2,700 rows/mo from standing Routines alone. Add CEO entry-point fires (30/mo at 2 Lite/day), C-suite fires downstream, Auto-Unblock fires — realistically 10,000+ rows/month. The schema has a `bigserial PRIMARY KEY` suggesting unbounded growth.

**Evidence:** §2E creates `claude_progress` with `bigserial PRIMARY KEY` and `CREATE INDEX ON claude_progress (routine, ts DESC)`. No `DELETE FROM claude_progress WHERE ts < now() - interval '30 days'` or equivalent is mentioned. The `audit-log-rollup` Inngest job (03:00 UTC nightly) targets `audit_log`, not `claude_progress`. The two tables are maintained separately with no noted cleanup for `claude_progress`.

**Affects:** Supabase storage (minor at 1M rows — ~100MB), but more critically: the `/war-room` Next.js page queries `claude_progress` for live status. A `SELECT ... ORDER BY ts DESC LIMIT 10` on a 1M-row unpartitioned table is a sequential scan if the index is bloated. This degrades the war-room page over time.

**If unfixed:** Six months of operation, `claude_progress` is at ~60K-120K rows. Query performance is still fine. Twelve months, 120K-240K rows, still fine. This is a slow-burn issue, not an immediate failure — but the cleanup mechanism should exist before the table is created, not retrofitted later.

---

### F10 — Routine crash detection relies on the crashed Routine writing its own failure (sev: M · conf: M)
**What's wrong:** The `routine-timeout-watcher` Inngest function detects Routine crashes by waiting for a "DONE" signal within `max_runtime_minutes`. But the entire premise assumes the Routine writes `claude_progress` steps consistently enough that a gap is detectable. If the Routine dies at step 1 (before writing anything to `claude_progress`), the watcher can detect the timeout. But if it dies at step 4 of 8 (after writing step 3 "running"), the watcher still detects it — but only by timeout expiry. The gap between step 3 and the timeout could be `max_runtime_minutes` = 30 minutes of silent nothing before Auto-Unblock fires.

**Evidence:** §2C: "If a fired Routine never writes 'DONE' within `max_runtime_minutes`, Inngest's timeout triggers Auto-Unblock." This is correct for the happy path. But `max_runtime_minutes` for Full-tier tasks is 120 minutes. A crashed Routine running a Full-tier task sits "crashed but appearing In Progress" for 2 hours before anyone notices. The `claude_progress` table shows the last step as "running" — there is no automated query that notices a running step older than X minutes.

**Affects:** Full-tier tasks (max_runtime 120 min) — worst case 2-hour silent crash before detection.

**If unfixed:** Adam has a 2-hour window where a task appears to be running but is actually dead. During this window, subsequent tasks that depend on the crashed task's output queue up or proceed with stale state.

---

### F11 — Inngest free tier math includes embed runs but the researcher's 1,350/mo figure is too low (sev: L · conf: H)
**What's wrong:** RESEARCH-WS2C claims "9 Routines × 30 days × ~5 steps = ~1,350 steps/mo, leaving 97% of the free tier unused." This math counts only standing Routine steps, not embed jobs, fan-in-watcher fires, routine-timeout-watcher fires, audit-log-rollup, or CEO synthesis re-fires. The actual monthly Inngest run count is substantially higher.

**Evidence:** Correct accounting: Standing Routines: 9 × ~8 steps × 30 days = 2,160 runs. Embed jobs: 50 runs/day × 30 = 1,500 runs. fan-in-watcher: fires on every Linear webhook update. At 10 Linear tickets/day × ~5 status updates each = 50 webhook events/day = 1,500/mo. routine-timeout-watcher: fires per Routine fire = ~270/mo (matching standing Routines). audit-log-rollup: 30/mo. CEO synth re-fires: ~60/mo (2 Full/day). Subtotal: ~5,520 runs/mo. This is still comfortably below 50K. The "97% unused" figure is wrong — it's closer to 89% unused — but the free tier ceiling is not at risk. The issue is the researcher's math is sloppy, which undermines confidence in other cost figures.

**Affects:** Trust in the cost modeling exercise more broadly. The sloppiness in this number should make Adam suspicious of the $5-15/mo Routines total claim.

**If unfixed:** No functional harm. This is an accounting error, not a reliability issue.

---

### F12 — Auto-Unblock is on-demand but has no rate-limit, creating a potential cost runaway (sev: L · conf: M)
**What's wrong:** Auto-Unblock fires "on any BLOCKED ticket." If a systematic issue causes 20 tickets to block simultaneously (e.g., a dependency service is down, all tasks waiting on it), 20 Auto-Unblock fires at $0.50 each = $10 in a single event. Auto-Unblock's 3 self-resolution attempts × 20 fires = 60 Routine sessions. If the blocking condition persists, each Auto-Unblock resolves nothing and escalates — but the next cron cycle could re-trigger them. No rate-limit or circuit-breaker is specified for Auto-Unblock.

**Evidence:** §2E: "Auto-Unblock: On-demand (Inngest fires when ticket BLOCKED >10 min OR Routine timeout)." No maximum concurrent Auto-Unblock sessions. No "don't re-fire if already running for this ticket" dedup. The Cloudflare KV dedup covers Linear webhook re-fires but the Auto-Unblock trigger comes from Inngest (not the webhook path) — so KV dedup doesn't apply.

**Affects:** Cost ceiling for any systematic failure event. Also affects the 15/day `/fire` budget if Auto-Unblock counts against it.

**If unfixed:** A 30-minute Supabase outage that blocks 10 tickets results in 10 Auto-Unblock fires, each of which retries 3 times over ~30 min, all failing. When Supabase comes back, all 10 re-queue. This is 20+ Routine sessions for one infrastructure incident.

---

## Cost reality check

The claimed $5-15/mo total for standing Routines is wrong. Honest math:

| Routine | Fires/mo | $/fire (cap) | $/mo ceiling |
|---------|----------|--------------|--------------|
| Morning Digest | 30 | $0.30 | $9.00 |
| EOD Sync | 30 | $0.10 | $3.00 |
| Auto-Unblock | ~10 | $0.50 | $5.00 |
| Monday Standup | 4 | $0.50 | $2.00 |
| Friday Retro | 4 | $1.00 | $4.00 |
| Competitor Signal | 4 | $0.50 | $2.00 |
| Customer Voice Signal | 4 | $0.50 | $2.00 |
| GEO Algorithm Signal | 2 | $0.50 | $1.00 |
| CEO Entry-point (Lite, 2/day) | 60 | $1.00 | $60.00 |
| CEO Synth re-fire (Full, 2/wk) | 8 | $1.00 | $8.00 |
| **Total standing Routine ceiling** | | | **~$96/mo** |

The CEO Entry-point is the dominant cost driver at $60/mo if used at 2 Lite tasks/day. The $5-15/mo figure is accurate ONLY if CEO fires are excluded (treating CEO as not a "standing Routine" by the V3 Architect's definition), AND if the caps are never approached. If caps are hit daily: $96/mo.

Realistic: CEO fires at 1 Lite/day (not 2), caps hit at 60%: ~$40-55/mo on API tokens for Routines alone. Still 3-4x the stated estimate.

The Anthropic Max plan at $100/mo includes an API credit budget. The $40-55/mo Routine API spend eats 40-55% of that budget before any product-facing AI features (scan engine, agent jobs, recommendations) run. This is a budget-allocation conflict that is not addressed anywhere in the architecture.

---

## Things that are correct (briefly)

- Inngest over Trigger.dev / custom Postgres is the right call. The reasoning is sound and the free tier runway is genuinely long for embed jobs + fan-in watcher at solo scale.
- The four Inngest primitives chosen (`step.run`, `step.waitForEvent`, `step.sleep`, `Promise.all`) are the correct ones for fan-out/fan-in + timeout patterns.
- The Linear-as-persistent-state + Inngest-as-execution-layer split is architecturally clean. CTO writing a DONE comment to a sub-ticket and Inngest detecting it is correct — no callback API is needed.
- The Cloudflare KV dedup story (24h TTL, sha256 of ticket+label) correctly handles Linear's 3-retry webhook behavior.
- The Claude_progress table schema is fit for purpose as an observability tool. The index choices (`routine, ts DESC` and `session_id`) are correct for the queries the war-room page will run.
- The 8 concrete Inngest functions are the right list — no obvious gaps in the stated scope.
- Separating disler (live) from audit_log (persistent) from claude_progress (per-step state) is the right three-layer observability design.

---

## Open questions for the synthesizer

1. **Is cron exemption from the 15/day cap confirmed in official Anthropic Routines docs, or only in 9to5Mac?** This is the single highest-stakes unverified assumption. Needs a live smoke-test or official doc reference before WS4 design finalizes.

2. **What is the Vercel function timeout strategy for Inngest steps that call Anthropic?** The architecture needs to commit to fire-and-poll vs synchronous step execution. This decision gates the fan-in-watcher design and the routine-timeout-watcher design.

3. **Does the $100/mo Anthropic Max budget cover both API inference AND Routine runs, or are they separate billing buckets?** If the same $100 covers everything, the Routine API costs (estimated $40-55/mo realistic) leave only $45-60 for product AI features — which is likely insufficient for a production GEO scan SaaS.

4. **What is the `step.waitForEvent` timeout value in the fan-in-watcher, and what action does Inngest take when it expires?** This needs to be specified before the fan-in-watcher is built, not discovered during a production incident.

5. **Is Auto-Unblock deduped per-ticket?** Without a per-ticket dedup on Auto-Unblock fires, systematic failures generate Routine fire storms.

6. **Monday Standup vs Morning Digest consolidation decision.** Is 9 Routines the right number, or is this 5 core + 4 variants that could be parameterized?

---

## Sources

- ORCHESTRATION.md §2C and §2E — primary subject of this critique
- RESEARCH-WS2C-durable-execution.md — the research backing (Inngest pricing, Vercel timeouts, Anthropic Routines docs)
- 00-V4-ENVIRONMENT-MAP.md — Layer 7 (Standing Routines table) and Layer 4 (data sources)
- Inngest Pricing (official): https://www.inngest.com/pricing — 50K function runs/mo free, $75/mo Pro
- Inngest Retries (official): https://www.inngest.com/docs/features/inngest-functions/error-retries/retries — 5 total attempts default
- Anthropic Claude Code Routines (official): https://code.claude.com/docs/en/routines — zero retry/durability semantics documented
- 9to5Mac (MEDIUM confidence): https://9to5mac.com/2026/04/14/anthropic-adds-repeatable-routines-feature-to-claude-code-heres-how-it-works/ — Pro: 5/day, Max: 15/day; cron exemption claim originates here, not in official docs
- Vercel Function Limits: Hobby 10s, Pro 60s — standard Vercel documentation
- Sonnet 4.6 pricing: $3/M input, $15/M output — Anthropic pricing page
