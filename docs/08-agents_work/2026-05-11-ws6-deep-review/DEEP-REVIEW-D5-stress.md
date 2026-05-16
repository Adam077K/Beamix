# Deep Review D5 — Stress-Test Critic

**Date:** 2026-05-11

## Frame

Six failure scenarios, 21 agents. The core question each time: **silent** (data loss, wrong output, no signal to Adam) vs **noisy** (Telegram ping, `audit_log` error row, Linear comment)? Silent failures are the threat — broken state propagates until Adam manually checks /war-room. Each scenario maps affected agents by name, characterises the failure mode, identifies what the scaffolded runbooks cover vs. what they miss, and proposes the minimum fix.

---

## S1 — Anthropic outage 2h (14:00–16:00)

- **Affects:** All 11 Routines and all 6 Workers that fire or are active during the window. Specifically: if any scheduled Routine lands in the gap (`cto-daily-plan` at 10:30 would have passed; `eod-sync` at 20:30 is after), the primary risk is event-triggered agents — `auto-unblock` (triggered by `routine.timeout` events) and `synthesizer` (triggered by `@board` command). The 4 Personas are invoked inside a Synthesizer session, so they go down with it. Workers spawned by `cto-daily-plan` before 14:00 that are mid-run when the API goes down lose their execution.
- **Silent vs noisy per group:**
  - Scheduled Routines that missed their cron: **silent** — no cron fire means no `audit_log` row, no error, no Telegram. Adam sees nothing unless he checks /war-room and notices a missing row. The runbook calls for Adam to replay orphans after recovery, but detection depends on Adam knowing which Routines *should* have fired.
  - `auto-unblock` mid-run: **noisy** — bridge writes `anthropic_error` to `audit_log`, Telegram threshold is ≥3 in 5 min across all agents; a single stuck-Routine cascade may hit this. However, `routine.timeout` events that arrive *during* the outage and go un-processed by `auto-unblock` have no re-queue guarantee in the scaffold. If Inngest drops rather than retains them past the outage window, stuck Routines stay stuck **silently** post-recovery.
  - Workers mid-run (`parallel-builder`, `parallel-tester`, `parallel-deployer`): **silent** — worktrees are left in an uncommitted state, no cleanup step, no Linear comment. Adam discovers the half-built state on the next `cto-daily-plan` cycle.
  - Personas (all 4): called inside Synthesizer, fail with Synthesizer. **Silent unless Synthesizer itself is noisy.**
- **Blast radius:** Any Routine missing its fire is a gap in the daily narrative (no morning digest, no CTO plan). Workers leave dirty worktrees. If `auto-unblock` timeout events are dropped, any pre-outage stuck Routine stays stuck indefinitely.
- **Gap in current scaffolds:** Runbook (anthropic-outage.md §Recovery) specifies a manual SQL query to replay orphans but relies on Adam knowing to run it. There is no automated post-recovery replay trigger. The `cost-watchdog` flat-line detection described in the telemetry checklist item is listed as `[ ]` — not yet wired.
- **Fix:** (a) After bridge soft-pause is lifted, have `auto-unblock` query for `audit_log` rows with `status = fired` and no follow-on `accepted` row within a configurable window (e.g., 3h), and re-fire them automatically. (b) Add worker teardown step: on `anthropic_error`, commit any staged work with a `[partial]` prefix and push a draft PR so state is not lost.

---

## S2 — Mem0 outage 4h

- **Affects (Mem0 grant per WS6-RESEARCH-mcps.md):** 9 of 11 Routines — `advisor-daily-thinking`, `morning-digest`, `competitor-pulse`, `geo-algorithm-signal`, `cto-daily-plan`, `content-idea-generator`, `monday-standup`, `friday-retro`, `auto-unblock`, `synthesizer`. Workers `parallel-researcher` also has Mem0. EOD Sync and all Workers except `parallel-researcher` do not have Mem0 — they are unaffected.
- **Silent vs noisy per group:**
  - All 9 affected Routines: runbook (mem0-outage.md §Immediate) specifies self-detecting fallback to Anthropic Memory Tool in each Routine's system prompt. Failure is **noisy** if 3+ `mem0_error` rows appear in 5 min (Telegram P1 ping). However, the telemetry checklist item confirming this is wired (`[ ]`) — it may not be. If the try/catch fallback template is not yet present in WS6 bodies (which INDEX.md confirms are `<!-- WS6-6B pending -->`), the fallback is **unimplemented** and failures are **silent**.
  - `friday-retro` specifically: reads prior week's sessions from Mem0 for the retro synthesis. During a 4h outage, it falls back to Anthropic Memory Tool (file-based, no semantic retrieval). The retro output will be shallower. This is documented in the runbook as acceptable degradation. **Noisy in audit_log, degraded output but not broken.**
  - `synthesizer`: if called during the outage, its pgvector RAG lookup (via Supabase, not Mem0) is unaffected. The Mem0 episodic context read is degraded but not fatal. Decision JSON output is still valid.
- **Blast radius:** Memory gap of 4h — writes during the window go to Anthropic Memory Tool and are not retroactively indexed in Mem0 after recovery. Cross-session retrieval quality for the following day is lower (Morning Digest the next morning may miss yesterday's context).
- **Gap in current scaffolds:** Agent bodies are `<!-- WS6-6B pending -->`. The inline try/catch fallback specified in the runbook has not been written into any Routine yet. Until 6B delivers the bodies, all 9 agents fail **silently** on Mem0 error — no fallback, no Telegram, the agent just aborts with no audit_log entry depending on where in execution the error occurs.
- **Fix:** 6B must implement the try/catch Mem0 wrapper in every Routine system prompt template before WS6 goes live. A smoke-test (WS4 smoke-test C) should validate the fallback path explicitly.

---

## S3 — Supabase RLS misconfig (blocks service-role writes)

- **Affects:** Every agent with a Supabase write path — `advisor-daily-thinking`, `geo-algorithm-signal`, `cto-daily-plan`, `friday-retro`, `eod-sync`, `auto-unblock`, `synthesizer`, `parallel-builder`, `parallel-tester`, `parallel-deployer`, `parallel-watcher`. This is 11 of 21 agents.
- **Silent vs noisy per group:**
  - `runaway-watcher` and `cost-watchdog`: both use `createServiceRoleClient` and write to `audit_log`. If service-role writes are blocked, their Step 4 (`write-over-budget`, `upsert-daily-rows`) throws. Both functions have `retries: 2`. After 3 failures, Inngest marks the run failed — visible in Inngest dashboard but **no Telegram alert**. The kill verdict (`revoked` token) is already executed before the audit_log write, so the token is revoked but the event is unlogged. **Silent from Adam's perspective.**
  - `auto-unblock`: reads `audit_log` (service-role) to diagnose stuck Routines, then writes a resolution row. If the write is blocked, auto-unblock throws on the write step, logs an Inngest failure, but does not send a Telegram ping. The stuck Routine stays stuck. **Silent.**
  - `synthesizer`: writes DECISIONS.md update to `audit_log` (pgvector). Blocked write causes the synthesis to complete without persisting. Adam gets a Linear comment but DECISIONS.md is not updated. Partially silent — the output comment is visible but the memory write is lost without indication.
  - `parallel-deployer`: runs migrations. If the migration itself uses service-role and is blocked, the deployment fails at the migration step. The PR is left un-deployed. **Partially noisy** — Vercel deploy will fail visibly, but the root cause (RLS misconfig vs. migration error) requires investigation.
  - `parallel-watcher`: read-only Supabase grant. If RLS blocks reads on `audit_log` for service-role (unusual — RLS typically bypasses for service-role), it fails silently. More likely: a table-level policy blocking the `anon` role is mislabeled as service-role by accident. Risk is low but non-zero.
- **Blast radius:** observability collapses — `runaway-watcher` cannot log kills, `cost-watchdog` cannot aggregate, `auto-unblock` cannot heal. The war room continues running but with no self-monitoring.
- **Gap:** Supabase runbook (supabase-corruption.md) covers RLS bypass as a *cause of corruption* but not RLS misconfiguration as a *blocker of legitimate service-role writes*. This is a distinct failure mode not in the decision tree.
- **Fix:** Add a synthetic canary row: an Inngest heartbeat (every 15 min) writes a single `row_kind = canary` row to `audit_log` via service-role. If the write fails for 2 consecutive cycles, Telegram P0 alert fires. This tests the write path independently of any Routine activity.

---

## S4 — GitHub Actions compromise

- **Affects directly:** `parallel-builder` (PR creation, branch pushes), `parallel-deployer` (DB migrations + Vercel deploy trigger), `friday-retro` (GitHub read-only commits), `eod-sync` (GitHub read-only commits). `parallel-critic` has GitHub diff-read only.
- **Silent vs noisy per group:**
  - `parallel-builder`: if the GitHub token is compromised and an attacker uses it to push malicious code, the agent's own PR creation flow still succeeds — no error visible. The compromise is **silent** until `parallel-critic` reviews the PR. But `parallel-critic` reviews agent-authored PRs, not external actors; if the attacker creates a separate PR or branch, `parallel-critic` is never invoked.
  - `parallel-deployer`: has GitHub + Supabase + no `merge_pull_request` (structural QA gate). A compromise that pushes directly to `main` bypasses this entirely. The QA gate structural rule prevents the *agent* from merging but does not protect against a compromised token being used outside the agent.
  - `friday-retro` and `eod-sync`: read-only commit access. Compromise of a read-only token has limited blast radius — exfiltration of commit history but no write path.
  - `parallel-critic`: read-only diff access. Same as above.
- **Blast radius:** A compromised `parallel-builder` or `parallel-deployer` token gives an attacker write access to the repo and (if the same token scope overlaps) the ability to trigger Vercel deployments. In the worst case, malicious code reaches production before `parallel-critic` reviews it.
- **Gap:** No runbook exists for GitHub Actions compromise. The scaffold has no secret-rotation procedure specific to GitHub tokens (only `secret-rotation.md` for Anthropic + Mem0 keys). There is no anomaly detection for unexpected branch pushes or PR creation from the agent GitHub identity.
- **Fix:** (a) Add a GitHub audit log alert (GitHub → Security → Audit log → webhook) that fires to Telegram on any push to `main` or tag creation from the agent service account. (b) Add the GitHub compromise scenario to `secret-rotation.md` with token rotation steps. (c) Scope `parallel-deployer`'s GitHub token to the minimum (deploy hook trigger only, not full repo write).

---

## S5 — Bridge bug fires beyond 15/24h cap → silent overage to Console

- **The scenario:** The Cloudflare Worker bridge misfires — either a looping webhook or a stale KV entry — causing a Routine to be invoked far beyond its 15-fires/24h cap. Does `runaway-watcher.ts` or `cost-watchdog.ts` catch this?
- **runaway-watcher.ts analysis:** Triggered by `war-room/audit-log.inserted` event — meaning it only fires if an `audit_log` row exists. If the bridge bug fires the Routine but the Routine itself fails before writing to `audit_log` (e.g., it hits Anthropic immediately and gets an error *before* the bridge writes the accepted row), `runaway-watcher` is never invoked. Furthermore, `runaway-watcher` checks session cost against `spec.budget.max_cost_usd × 1.2`. It does **not** check fire frequency. A cheap Routine (e.g., `morning-digest` at ~$0.02/fire) misfiring 500 times would accrue $10 total — above its spec budget — but only triggers the kill after the session cost threshold is crossed, which may take many fires. **No frequency check exists.**
- **cost-watchdog.ts analysis:** Runs hourly via cron. Aggregates `audit_log.cost_usd` by agent for the rolling 1h window and the daily window. It writes the burn-down to `audit_log_daily` and the `/war-room` page. However, per Adam Q7 (2026-05-08), there are **NO TELEGRAM ALERTS** — cost observation is passive. Adam must read the /war-room page to notice an anomaly. If the overage happens at 03:00 IL, Adam will not see it until morning. **Silent until Adam checks.**
- **Blast radius:** A runaway cheap Routine could exhaust the daily Anthropic cap (429 until midnight) before Adam notices. This triggers the anthropic-outage runbook cap-hit branch, but by then the overage has already happened and Anthropic Console has been billed.
- **Gap:** There is no fire-frequency guard. `runaway-watcher` guards on cost per session; `cost-watchdog` guards on passive observation. Neither fires a proactive alert on rate anomaly.
- **Fix:** Add a fire-count check to `runaway-watcher`: when a new `audit_log` row is inserted, count fires for that agent in the last 24h. If count > `spec.max_fires_per_day × 1.5`, revoke the token and write an `anomaly` row. This check is one additional Supabase query per insert and fits within the existing step structure. Separately, reconsider the no-alert rule for cost-watchdog: a single Telegram ping when rolling 1h cost exceeds $X is defensible even under Q7 (which was targeting chatty micro-alerts, not genuine anomaly detection).

---

## S6 — audit_log table corruption

- **Affects:** `auto-unblock` (reads `audit_log` to diagnose stuck Routines), `friday-retro` (reads `audit_log` for incident history via WS2 Errata 3), `synthesizer` (writes decisions to `audit_log` pgvector), `advisor-daily-thinking` (reads `audit_log` for first-party signals), `parallel-watcher` (reads `audit_log` for anomaly monitoring), `runaway-watcher` (reads and writes `audit_log`), `cost-watchdog` (reads and writes `audit_log`).
- **Silent vs noisy per group:**
  - `auto-unblock`: its diagnostic query returns corrupt or missing rows. It either concludes there are no stuck Routines (false negative — **silent**) or misidentifies healthy Routines as stuck (false positive — noisy but damaging). Neither is safe.
  - `friday-retro`: incident history query returns partial or wrong data. The retro silently omits the week's incidents. **Silent degradation** — output looks complete but is wrong.
  - `synthesizer`: pgvector write fails or inserts into a corrupt index. DECISIONS.md update is lost. Linear comment shows success but memory is broken. **Partially silent.**
  - `parallel-watcher`: its entire purpose is reading `audit_log`. If the table is corrupt, watcher either throws (noisy — Inngest failure) or returns empty results and concludes "no anomalies" (false negative — **silent**).
  - `runaway-watcher` and `cost-watchdog`: both use service-role and will throw on schema mismatch. Inngest retries 2×, then marks failed. **Noisy in Inngest dashboard but no Telegram.**
- **Blast radius:** The self-healing layer (`auto-unblock`, `parallel-watcher`, `runaway-watcher`) fails simultaneously because all three depend on `audit_log`. The war room loses its nerve system — stuck Routines accumulate, cost overages go undetected, anomalies go unlogged. This compounds silently.
- **Gap:** Supabase runbook covers `audit_log` row-count anomaly detection via `audit_log_daily` rollup, but `audit_log_daily` is *written by* `cost-watchdog` which has also failed. The canary becomes the corrupted table itself.
- **Fix:** Adopt the canary-write approach from S3 Fix, but for reads: a separate Inngest heartbeat reads the last N rows of `audit_log` and validates the schema (spot-check column presence). If the read returns unexpected shape, send Telegram P0. This is independent of all 7 affected agents and does not rely on the table being healthy to detect corruption.

---

## Cross-cutting findings

1. **"No Telegram alerts" (Q7) creates silent failure modes at exactly the wrong tier.** Q7 was a reasonable decision to suppress chatty micro-alerts from `cost-watchdog`. But it has been applied broadly enough that several genuine anomalies (S5 rate runaway, S3 RLS misconfig, S6 self-healer failure) have no proactive signal. The right scope for Q7 is *routine cost reporting*, not *anomaly detection*. One Telegram alert for genuine anomalies (fire-count spike, write path failure, canary miss) does not violate Q7's intent.

2. **Agent bodies are all `<!-- WS6-6B pending -->`** (INDEX.md line 62). Every resilience behaviour that depends on a system prompt — the Mem0 try/catch fallback (S2), worker teardown on anthropic_error (S1), self-healing logic in `auto-unblock` — is unimplemented. The scaffolds describe the intent, but WS6-6B is a mandatory gate before any of these resilience properties are real.

3. **No fire-frequency guard exists at any layer.** `runaway-watcher` guards session *cost*, `cost-watchdog` passively observes *daily cost*. Neither counts fires per agent per 24h against a spec cap. A cheap, fast-misfiring Routine drains the daily Console cap before either guard triggers.

**Single highest-leverage hardening:** Implement the canary write heartbeat (S3 Fix) — a 15-min Inngest cron that writes one `row_kind = canary` row via service-role and reads it back. This single function simultaneously validates: service-role write path, RLS config, `audit_log` table health, and `createServiceRoleClient` initialization. A failure triggers Telegram P0. It is the load-bearing canary for S3, S6, and partially S1 (if bridge is up but audit writes are broken).

---

## Anti-claims

**A1 — Cost overruns from runaway agents are not an unbounded risk.** `runaway-watcher` does correctly sum session cost via nonce (not single-row), uses the spec's own `max_cost_usd` as the threshold (not an arbitrary $1 cutoff), and silently revokes the per-Routine token before writing to `audit_log`. For any Routine that writes `audit_log` rows and has `spec.budget.max_cost_usd` defined, the kill is deterministic. The gap (S5) is only for cheap-but-frequent misfires that stay below the cost threshold per session — not for genuinely expensive runaway sessions.

**A2 — Mem0 outage is not a data-loss event.** The runbook correctly distinguishes memory gap (episodic writes during the outage window are lost) from data loss (customer data, scans, agent job records). Mem0 holds only cross-session episodic memory for the war room. Session files (`docs/08-agents_work/sessions/`) and `audit_log` are written in parallel and are unaffected. The degradation is in retrieval quality for the following day's Routines, not in any customer-facing or billing-critical data.

**A3 — Supabase PITR provides a credible recovery path for corruption scenarios.** The runbook's PITR-first approach (Path A) is sound: 7-day PITR on Pro tier covers the vast majority of realistic corruption scenarios (accidental migration, RLS bypass, schema drift). The independent evidence sources for preserving legitimate writes (Inngest dead-letter queue, Cloudflare R2 artifacts, Linear ticket timestamps, git history) are comprehensive and do not rely on the corrupted table itself. This is well-designed.
