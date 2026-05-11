# CRITIQUE-WS3-dr — DR runbooks (Detection / Mitigation / Recovery / Post-incident)

**Critic role:** Incident commander
**Reviewer:** general-purpose Sonnet, adversarial framing
**Date:** 2026-05-08
**Files reviewed:** 7 runbooks at docs/07-history/runbooks/ (anthropic-outage.md, linear-api-break.md, cloudflare-compromise.md, supabase-corruption.md, secret-rotation.md, github-compromise.md, mem0-outage.md); ORCHESTRATION.md §Failure modes; TECH-STACK.md §3A; HANDOFF-WS3-WS4 line ~189.

---

## Summary

- Total findings: 18
- Critical (H): 7 · High-Medium (M): 8 · Low (L): 3

---

## Findings (ranked by severity)

---

### F1 [SEV:H] — Bridge-resume KV key naming is undocumented; lift mechanism can lock out the system permanently

**Location:** `anthropic-outage.md` §Immediate step 3 and §Recovery step 2

**Issue:** The runbook instructs: "Set Cloudflare KV key `bridge:paused = true`" to soft-pause, then later "Set Cloudflare KV `bridge:paused = false`" to lift. No procedure, CLI command, authentication method, or Wrangler invocation is given for either operation. During a real Anthropic outage — which is likely the exact moment where Cloudflare Worker code is NOT being re-deployed — the only way to flip the KV key is via `wrangler kv:key put` or the Cloudflare dashboard KV UI. Neither is documented. The runbook also does not define which KV namespace (`--namespace-id`) holds `bridge:paused`, and Cloudflare Workers Paid accounts can have multiple namespaces.

**Evidence:** Recovery step 2: "Lift bridge soft-pause. Set Cloudflare KV `bridge:paused = false`. Linear webhooks resume." Zero procedure attached.

**What breaks on a real Tuesday:** Anthropic platform restores at 14:30. Incident commander follows Recovery step 2, tries to lift pause. They have no CLI command. They go to Cloudflare dashboard, can't find the right KV namespace among several, type the key into the wrong namespace. Bridge stays paused. Adam files Linear tickets; nothing processes. The war room appears dead for hours after Anthropic has fully recovered. The commander has no way to verify whether the lift worked because there's no step that says "verify by checking that the next Linear webhook produces an `audit_log` row."

**Source critic:** DR runbook critic

---

### F2 [SEV:H] — `audit_log.status = anthropic_error` enum value is NOT confirmed to exist; every detection signal that relies on it is unverified

**Location:** `anthropic-outage.md` §Detection table, §Telemetry checklist item 1; also `linear-api-break.md` (`linear_api_error`), `mem0-outage.md` (`mem0_error`)

**Issue:** The `audit_log.status` column is defined in ORCHESTRATION.md §2G with this enum: `fired | accepted | complete | blocked | timeout | over_budget | anomaly | rule_violation`. The values `anthropic_error`, `linear_api_error`, and `mem0_error` do NOT appear in this enum definition. The runbooks list them as detection signals (`audit_log.status = anthropic_error`) and the telemetry checklist defers verification with `(WS4 migration)`. This means the primary programmatic detection mechanism for three separate runbooks is based on enum values that do not exist in the schema that has been locked in ORCHESTRATION.md.

**Evidence:** ORCHESTRATION.md §2G schema: `status text NOT NULL, -- fired | accepted | complete | blocked | timeout | over_budget | anomaly | rule_violation`. `anthropic_error` is absent. `anthropic-outage.md` telemetry item 1: `[ ] audit_log accepts status: anthropic_error enum value (WS4 migration)`.

**What breaks on a real Tuesday:** Anthropic goes down. The bridge tries to insert an `audit_log` row with `status: anthropic_error`. If the application enforces the enum at the DB layer (a `CHECK` constraint or a Postgres `ENUM` type), the insert fails silently or throws an error. The telemetry signal never fires. The cost-watchdog's "zero-activity detection" also never fires if it depends on the `anthropic_error` status. The incident commander is watching a dashboard that shows no anomalies because all the anomaly rows are failing to write.

**Source critic:** DR runbook critic

---

### F3 [SEV:H] — Cloudflare compromise §Immediate step 3 says "Revoke ALL Cloudflare API tokens" BEFORE creating the replacement — causing a self-lockout window

**Location:** `cloudflare-compromise.md` §Immediate steps 3-4

**Issue:** Step 3 revokes ALL Cloudflare API tokens. Step 3 also says "Create one new token Adam will use to manage the recovery, named `recovery-YYYY-MM-DD`." The problem is: to create a new token via the Cloudflare API or dashboard, you must already be authenticated with a valid token or an active session. If step 4 ("Force logout all Cloudflare sessions") immediately follows step 3, there is a window between token revocation and session logout where re-authentication is possible. But if an attacker has also revoked tokens AND stolen Adam's session cookie, Adam's only remaining authentication path is password + 2FA via the browser. The runbook does not specify that the "create new token" action is part of step 3 (before logout), nor does it describe what Adam should do if he is locked out of his own account before the new token is created.

**Evidence:** Step 3: "Revoke ALL Cloudflare API tokens. Dashboard → My Profile → API Tokens → revoke everything. Create one new token Adam will use to manage the recovery." Step 4: "Force logout all Cloudflare sessions." No order-of-operations guard between creating the recovery token and doing the logout.

**What breaks on a real Tuesday:** Incident commander revokes all tokens at 09:05. At 09:07 — before creating the recovery token — they execute step 4 and force-logout all sessions, including the current one. They are now logged out with no valid token. They must re-authenticate from scratch via password+2FA. If 2FA device is on a different machine, this adds 10-20 minutes during which the attacker can still operate via a session that wasn't fully invalidated. The "recovery-YYYY-MM-DD" token creation never happened, and the commander is now locked out of the recovery tooling they need.

**Source critic:** DR runbook critic

---

### F4 [SEV:H] — GitHub compromise recovery procedure requires force-resetting `main`, but branch protection must be lifted first — with no documented safe way to do that while the account is partially compromised

**Location:** `github-compromise.md` §Mitigation "Restore from clean state" step 2

**Issue:** The runbook says: "Force-reset `main` to the clean SHA. This requires lifting branch protection temporarily. Document the action with a postmortem hook." Lifting branch protection on a compromised GitHub account requires a GitHub API call or UI action with an authenticated admin token. But steps 1-6 of Immediate have already revoked ALL PATs and disabled all GitHub Apps. The only remaining authentication path is password+2FA on the GitHub web UI, which requires a usable session. The runbook does not provide the specific GitHub API call, the sequence of re-creating a minimal PAT just for this operation, or a verification step that confirms the force-reset happened to the correct SHA (not to an attacker's SHA).

**Evidence:** §Mitigation step 2: "Force-reset main to the clean SHA. This requires lifting branch protection temporarily." No procedure for doing this with no valid tokens.

**What breaks on a real Tuesday:** Incident commander revokes all PATs in Immediate step 3. Now in Mitigation, they try to force-reset `main` to the clean SHA. They need a token with `repo` scope to push with `--force` or to use the GitHub REST API to update the branch. They have no valid token. They create a new PAT, but this takes time. If they are unfamiliar with re-creating PATs under stress, they may create one with insufficient scope, the push fails, and `main` stays at the attacker's SHA for longer than necessary.

**Source critic:** DR runbook critic

---

### F5 [SEV:H] — `secret-rotation.md` emergency path says "Rotate ALL of them simultaneously (skip grace windows)" but `BRIDGE_HMAC_SECRET` has "None — atomic swap" and requires updating receiving-agent verification keys simultaneously — with no procedure for doing that atomically

**Location:** `secret-rotation.md` §The full secret inventory row #2 (BRIDGE_HMAC_SECRET) and §Emergency rotation step 2

**Issue:** `BRIDGE_HMAC_SECRET` rotation requires an atomic swap: "Receiving agent verification key MUST update simultaneously (no grace)." The emergency rotation instructions say rotate ALL simultaneously. But the "receiving agent" that verifies `BRIDGE_HMAC_SECRET` is an Anthropic Routine — which cannot be hot-patched. Updating a Routine's configuration requires going to the Anthropic Console, finding the Routine, updating its env vars or system prompt references, and re-saving. This is a multi-step UI operation, NOT a `wrangler secret put` that deploys in <1s. During the window between the bridge deploying the new `BRIDGE_HMAC_SECRET` and the Routine being updated in the Anthropic Console, every HMAC verification will FAIL. All legitimate trust-spec deliveries during this window will be rejected.

**Evidence:** Secret row #2 note: "Receiving agent verification key MUST update simultaneously (no grace)." `secret-rotation.md` does not define how to update Routine-side verification keys, how long the Anthropic Console update takes, or what the bridge should do with HMAC failures during the transition window.

**What breaks on a real Tuesday:** Compromise detected. Emergency rotation begins. Bridge deploys new `BRIDGE_HMAC_SECRET` in 30s via `wrangler secret put`. Incident commander then goes to Anthropic Console to update receiving Routines — but there are 10 Routines and no script to batch-update them. 5 minutes pass. During that window, the CEO Routine fires from a Linear ticket, receives a trust spec, HMAC-verifies it against the OLD key (not yet updated), verification fails, Routine drops the spec and returns BLOCKED. The incident commander has no log of what was dropped and why.

**Source critic:** DR runbook critic

---

### F6 [SEV:H] — `supabase-corruption.md` Path A PITR caveat ("document legitimate writes before restoring") has no mechanism — and the mechanism needed (audit_log) is itself the corrupted table

**Location:** `supabase-corruption.md` §Mitigation Path A

**Issue:** Path A says: "CAVEAT: PITR restores the ENTIRE database. Any legitimate writes between the restore point and now are lost. Document those writes BEFORE restoring." The source of truth for what was written between the restore point and now IS the `audit_log` table. But `audit_log` is listed in the runbook's own §Detection signals as a target of corruption detection: "Missing `audit_log` rows (audit-log-rollup detects gaps)." If `audit_log` is part of the corruption (or is unavailable because Supabase is in an error state), the "document those writes" instruction has no reliable source. The runbook does not define an alternative mechanism for recovering the write log.

**Evidence:** §Severity: "Supabase holds: customer data, war-room `audit_log` + `audit_log_daily`..." Path A caveat: "Document those writes BEFORE restoring (audit_log rows, customer data inserts)." No alternative source identified if audit_log itself is corrupted.

**What breaks on a real Tuesday:** Agent runs a destructive migration at 13:00. Tables partially corrupted. Incident commander halts writes, snapshots, confirms PITR window. "Document those writes" — they open audit_log to find it has rows missing from 13:00-13:45. The thing they need to document what was lost IS what was lost. They restore to 12:55 PITR snapshot and lose all legitimate customer writes from 12:55-13:45 with no record of what those were.

**Source critic:** DR runbook critic

---

### F7 [SEV:H] — Memory write side-buffer for Mem0 fallback is listed as a runbook step but is explicitly unimplemented

**Location:** `mem0-outage.md` §Mitigation (cloud platform outage) and §Recovery step 3; telemetry checklist item 4

**Issue:** The fallback mitigation says: "Memory writes during fallback are queued in a Cloudflare KV side-buffer. When Mem0 returns, a replay job migrates them in." Recovery step 3 says: "Replay buffered memory writes. Inngest job reads Cloudflare KV side-buffer and POSTs to Mem0 MCP." The telemetry checklist explicitly says `[ ] Memory write side-buffer exists in Cloudflare KV with replay job in Inngest`. This is not yet built. The runbook is written as if the side-buffer is operational, but the checklist item is unchecked. The runbook is describing a system that does not exist as if it can be relied on.

**Evidence:** Telemetry item 4: `[ ] Memory write side-buffer exists in Cloudflare KV with replay job in Inngest`. Recovery step 3 depends on this side-buffer existing.

**What breaks on a real Tuesday:** Mem0 goes down. Bridge flips `mem0:fallback_active = true`. Routines switch to Anthropic Memory Tool. Memory writes that should be buffered for later replay are not buffered — there is no KV side-buffer. When Mem0 recovers, Recovery step 3 says to replay the buffer. There is no buffer. The incident commander runs the Inngest replay job; it finds nothing to replay. Cross-session memory written during the outage window is permanently lost. The commander assumes this is correct behavior; it is not. Post-incident audit will show a memory gap but there's no way to recover it.

**Source critic:** DR runbook critic

---

### F8 [SEV:M] — `cloudflare-compromise.md` Decision tree branch "No targeted attack → lock down GitHub too" fires `github-compromise.md` in parallel, but `github-compromise.md` Immediate step 6 disables GitHub Actions — which includes the Cloudflare deploy workflow needed for cloudflare-compromise.md recovery

**Location:** `cloudflare-compromise.md` §Decision tree "NO (not leaked from public source) → suspected targeted attack. Lock down GitHub too (`github-compromise.md` runbook fires in parallel)"; `github-compromise.md` §Immediate step 6

**Issue:** When cloudflare-compromise.md and github-compromise.md run in parallel (the decision tree's recommended path for a suspected targeted attack), `github-compromise.md` step 6 disables GitHub Actions globally. But the redeployment of the clean bridge code (cloudflare-compromise.md §Mitigation "Redeploy bridge from a known-good git SHA") depends on the `.github/workflows/cloudflare-deploy.yml` Action. With GitHub Actions disabled, the only bridge redeployment path is manual `wrangler publish` from Adam's machine — which is not documented in cloudflare-compromise.md as the fallback.

**Evidence:** `github-compromise.md` step 6: "Disable GitHub Actions globally." `cloudflare-compromise.md` §Mitigation: "Redeploy bridge from a known-good git SHA (use the most recent merge to `main` that you trust)." No explicit "use wrangler directly if Actions is disabled" instruction in cloudflare-compromise.md.

**What breaks on a real Tuesday:** Parallel runbooks in progress. Incident commander A (cloudflare-compromise) gets to "Redeploy bridge from known-good SHA" — triggers the cloudflare-deploy GitHub Action workflow. Fails: Actions are disabled by incident commander B (github-compromise) who ran step 6 20 minutes earlier. Commander A doesn't know why the deploy failed, starts debugging the CI configuration, loses 30+ minutes.

**Source critic:** DR runbook critic

---

### F9 [SEV:M] — `anthropic-outage.md` "Replay orphans" in Recovery step 3 depends on Morning Digest Routine running — but Morning Digest is exactly what can't run during an Anthropic outage

**Location:** `anthropic-outage.md` §Recovery step 3

**Issue:** Recovery step 3 says: "Replay orphans. Morning Digest Routine reads `audit_log` for `status: fired` rows that have no matching `accepted` row, and opens a 'manual re-fire required' Linear ticket per orphan." Morning Digest is an Anthropic Routine. If the outage lasted through 07:30 Israel time (the Morning Digest schedule), Morning Digest did not fire. Recovery step 3 therefore depends on Morning Digest having run after recovery — but recovery might happen at 03:00 Israel, before the next scheduled Morning Digest at 07:30. The orphan detection is a scheduled Routine, not a one-shot replay job. There is no alternative "trigger orphan detection now" procedure documented.

**Evidence:** §Recovery step 3: "Morning Digest Routine reads audit_log for status: fired rows..." Morning Digest schedule from ORCHESTRATION.md §2E: `daily 07:30 IL (04:30 UTC)`. If Anthropic recovers at 03:00 IL, Morning Digest will not run for another ~4.5 hours.

**What breaks on a real Tuesday:** Anthropic outage ends at 03:00 IL. Recovery steps are followed. Step 3 says "Morning Digest handles orphans." Commander lifts bridge pause, verifies status page green, writes "Resolved" in the Linear ticket. But Morning Digest won't run for 4.5 hours. During those 4.5 hours, Adam files new Linear tickets, some of which reference work that depends on the orphaned pre-outage tickets. The orphans are invisible until 07:30 IL.

**Source critic:** DR runbook critic

---

### F10 [SEV:M] — `linear-api-break.md` "Drain holding queue" in Recovery step 3 references a "Telegram + iOS Shortcut holding queue in Cloudflare KV" but no KV key name, TTL, or queue structure is defined anywhere

**Location:** `linear-api-break.md` §Recovery step 3

**Issue:** Recovery step 3 says: "Drain holding queue. Telegram + iOS Shortcut captured tickets queue in Cloudflare KV during outage; bridge replays them now." The holding queue is referenced as a fait accompli but is not defined: what KV key prefix? What TTL? What schema does each queued item use? What triggers the drain — manual `wrangler` command, a Cloudflare cron, an Inngest function? When does it drain automatically vs. require operator action? The recovery step provides no actionable procedure.

**Evidence:** Recovery step 3: "bridge replays them now." No mechanism, trigger, or KV structure defined in any referenced document. The telemetry checklist includes `[ ] Holding queue (Cloudflare KV) drained after recovery — verified by kv_replay_count log` but `kv_replay_count` is not defined anywhere in TECH-STACK.md or ORCHESTRATION.md.

**What breaks on a real Tuesday:** Linear recovers. Commander lifts `bridge:linear_paused`. Commander reads Recovery step 3: "drain holding queue." How? `wrangler kv:list`? `kv:get`? Which namespace? There is no documented procedure. The commander guesses; tries to iterate KV manually; doesn't know what format the queued items use; gives up. All ideas captured via Telegram or iOS Shortcut during the Linear outage are silently dropped.

**Source critic:** DR runbook critic

---

### F11 [SEV:M] — `secret-rotation.md` Supabase service-role key rotation requires "all Inngest function deployments must redeploy with new key — no overlap" but provides no mechanism for how to coordinate a simultaneous Inngest + Vercel redeployment without dropping in-flight jobs

**Location:** `secret-rotation.md` §The full secret inventory row #12 (Supabase service role key)

**Issue:** The rotation note says: "Supabase → Project Settings → API → reset; update Vercel env; redeploy. Caveat: all Inngest function deployments must redeploy with new key — no overlap." In practice, Inngest jobs are long-running (embed jobs can take minutes). If an Inngest job is mid-execution when the Supabase key is rotated and Vercel redeployed, the in-flight job still holds the old key in its process memory and will fail on the next Supabase call with a 401. Inngest will retry it — but the retry will run against the new deployment with the new key. The runbook does not address how to drain in-flight Inngest jobs before rotating, or how to verify that all in-flight jobs have completed before the key swap.

**Evidence:** Row #12 Caveat: "all Inngest function deployments must redeploy with new key — no overlap." No drain procedure, no in-flight job check, no reference to Inngest's pause/drain capability.

**What breaks on a real Tuesday:** Rotation triggered due to RLS bypass. Commander resets Supabase key, updates Vercel env, triggers redeploy. Three Inngest embed jobs are mid-execution using the old key. They fail. Inngest retries them with exponential backoff. The retry eventually succeeds with new key. BUT: if the embed job was writing a large pgvector corpus mid-write, the failed write leaves a partial state. The re-run embeds the entire corpus again, creating duplicate vectors in pgvector. RAG retrieval now returns duplicate results for some queries.

**Source critic:** DR runbook critic

---

### F12 [SEV:M] — `github-compromise.md` Archiving repos as the lock mechanism is a destructive-adjacent operation — and the "reversible" claim is misleading

**Location:** `github-compromise.md` §Immediate step 2

**Issue:** Step 2 says: "Lock all repos to read-only. GitHub → Organization Settings → Member privileges → temporarily disable repo creation + restrict pushes. For each affected repo: Settings → General → Archive (reversible)." Archiving a GitHub repo does make it read-only, but it also: (1) removes the repo from GitHub Actions scheduled triggers, (2) removes it from GitHub Pages if enabled, (3) may affect any third-party integrations polling the repo. More critically, archiving is NOT instant — it requires UI confirmation. If there are multiple repos, this is a multi-step, multi-click operation under time pressure. The runbook presents this as equivalent to flipping a flag, when it is actually a potentially disruptive operation with side-effects on the CI/CD pipeline that is critical for bridge redeployment.

**Evidence:** Step 2: "For each affected repo: Settings → General → Archive (reversible)." No side-effect warning about GitHub Actions being disabled on archive. TECH-STACK.md §3A: GitHub Actions runs `qa-lead-pass` — which depends on the repo NOT being archived.

**What breaks on a real Tuesday:** Compromise detected. Commander archives the main repo per step 2. This disables all GitHub Actions on the repo, including `qa-lead-pass`. The commander then follows `cloudflare-compromise.md` in parallel. When they try to redeploy the bridge via GitHub Actions (cloudflare-deploy.yml), it won't run — the repo is archived. Now the commander needs to un-archive before redeploying, adding confusion to an already chaotic sequence.

**Source critic:** DR runbook critic

---

### F13 [SEV:M] — `cloudflare-compromise.md` forensic SQL query uses `$compromise_start` and `$compromise_end` placeholder variables with no instruction on how to determine these values

**Location:** `cloudflare-compromise.md` §Recovery step 4

**Issue:** The recovery forensic query uses `$compromise_start` and `$compromise_end` as bind variables. No instruction is given for how to determine the compromise window. The Cloudflare audit log timestamps are the most likely source, but the runbook does not say to read them and capture the timestamps before running the query. In a time-pressured incident, this leaves the commander staring at a SQL snippet that can't run.

**Evidence:** §Recovery step 4:
```sql
SELECT * FROM audit_log
WHERE ts >= ($compromise_start - interval '1 hour')
  AND ts <= ($compromise_end + interval '1 hour')
```
No definition of `$compromise_start` or `$compromise_end`. No instruction to read the Cloudflare audit log first.

**What breaks on a real Tuesday:** Commander reaches Recovery step 4, opens Supabase SQL editor, pastes the query. `$compromise_start` is a literal string, not a timestamp. The query fails with a type error. Commander guesses the start time, may choose the wrong window, and misses the audit row showing the attacker's first action.

**Source critic:** DR runbook critic

---

### F14 [SEV:M] — `mem0-outage.md` §Immediate step 3 "flip Mem0 fallback flag" depends on the bridge actively reading the KV flag — but no Cloudflare Worker code is documented that checks `mem0:fallback_active` on each request

**Location:** `mem0-outage.md` §Immediate step 3 and §Mitigation

**Issue:** Step 3 says: "Flip Mem0 fallback flag. Cloudflare KV `mem0:fallback_active = true`. The bridge sets a `memory_provider: anthropic-memory-tool` field on every spec it forwards to Routines during outage." This assumes the Cloudflare Worker bridge reads `mem0:fallback_active` on every request and injects `memory_provider` into specs accordingly. ORCHESTRATION.md §2B describes the bridge's responsibilities (HMAC verify, Durable Object lock, spec injection, audit_log write) but does NOT mention a `mem0:fallback_active` check. Similarly, the spec schema in ORCHESTRATION.md §2D has no `memory_provider` field. This behavior appears to be undesigned.

**Evidence:** ORCHESTRATION.md §2D spec schema fields: `spec_version`, `trust_mode`, `nonce`, `issued_at`, `expires_at`, `issued_by`, `linear_ticket`, `parent_ticket`, `fan_in_key`, `scope`, `memory_pre_loads`, `budget`, `escalation`, `audit`, `_signature`. No `memory_provider` field. ORCHESTRATION.md §2B bridge responsibilities do not include KV flag reads.

**What breaks on a real Tuesday:** Mem0 goes down. Commander sets `mem0:fallback_active = true` in the KV dashboard. Bridge ignores it because the Worker code has no logic to read this flag. Specs continue to be forwarded without `memory_provider: anthropic-memory-tool`. Routines try to reach Mem0 MCP, fail, log `memory_write_failed`. The fallback the commander activated has no effect.

**Source critic:** DR runbook critic

---

### F15 [SEV:M] — `anthropic-outage.md` Decision tree branch "HTTP 5xx but Status page green" ends with "Wait 10 min. If persists, escalate" — "escalate" has no defined target, action, or wake-up condition

**Location:** `anthropic-outage.md` §Decision tree, second branch

**Issue:** The branch says "If persists, escalate." No escalation target is named: escalate to whom? Via what channel? What action does the escalatee take? This is a dead-end branch. In the context of a solo-operator project, "escalate" means Adam, but the mechanism (Telegram, Linear ticket, waiting) and the observability condition that terminates the wait are both undefined.

**Evidence:** Decision tree: `HTTP 5xx but Status page green → Likely localized incident or stale Status page. → Wait 10 min. If persists, escalate.` No further specification.

**What breaks on a real Tuesday:** `/fire` keeps returning 5xx. Status page green. Commander waits 10 min. Persists. "Escalate." To whom? The system is Adam-only. They send a Telegram to Adam but don't know if it's formatted as a P0 binary-ping or a freeform message. Adam doesn't respond immediately. Commander waits indefinitely with no documented next step.

**Source critic:** DR runbook critic

---

### F16 [SEV:M] — `supabase-corruption.md` §Immediate step 5 locks Vercel deploy but conflicts with step 2's recommendation to push a deploy to enable maintenance mode

**Location:** `supabase-corruption.md` §Immediate steps 2 and 5

**Issue:** Step 2 says: "Vercel: push a deploy that returns 503 from `/api/*` routes (env var `MAINTENANCE_MODE=true`)." Step 5 says: "Lock Vercel deploy. Disable auto-deploy from `main` branch via Vercel project settings → Git → Production branch → set to `paused-during-incident`." If you execute step 5 after step 2, you lock Vercel deploy AFTER you've already deployed the maintenance-mode version — that's fine sequentially. But if the auto-deploy lock is applied BEFORE the MAINTENANCE_MODE push goes through (e.g., Adam reads and executes steps 2-5 quickly, applies the lock mid-deploy), the maintenance mode deploy itself could be blocked. The steps don't warn about this race.

**Evidence:** Step 2: "push a deploy that returns 503." Step 5: "Disable auto-deploy." No explicit ordering guard between "confirm MAINTENANCE_MODE deploy went live" and "lock further deploys."

**What breaks on a real Tuesday:** Commander reads steps 2-5 quickly and executes them in rapid succession. Applies Vercel deploy lock before the MAINTENANCE_MODE deploy finishes (or queues). Deploy is cancelled by the lock. The product continues accepting writes to the corrupted database. Commander doesn't notice because Vercel shows "locked" and assumes maintenance mode is active.

**Source critic:** DR runbook critic

---

### F17 [SEV:L] — `secret-rotation.md` routine rotation stagger ("Day 0 secrets 1-3, Day 1 secrets 4-7...") has no defined smoke-test checkpoint between days — creating a 4-day window where earlier rotations could silently break downstream consumers

**Location:** `secret-rotation.md` §Routine rotation cycle (P2)

**Issue:** The stagger says "After each day's rotation: smoke-test the affected paths." But the verification checklist at the bottom tests ALL paths (bearer tokens, cost-watchdog, Telegram, iOS Shortcut, GitHub Action, Mem0, pgvector, Helicone) as a single bundle. A Day 0 rotation of `BRIDGE_HMAC_SECRET` will break Telegram bot delivery if the bot also verifies HMAC (which is not documented as to whether it does or not). On Day 1 when `TELEGRAM_BOT_TOKEN` rotates, the commander won't necessarily know that a Telegram failure they observe is from the Day 0 `BRIDGE_HMAC_SECRET` rotation, not the Day 1 `TELEGRAM_BOT_TOKEN` rotation. The per-day scoped smoke-test list is missing.

**Evidence:** §Routine rotation: "After each day's rotation: smoke-test the affected paths. Don't proceed to the next day until green." No per-day smoke-test list provided.

**Source critic:** DR runbook critic

---

### F18 [SEV:L] — "Friday Retro tags this incident" post-incident action across all 7 runbooks — but Friday Retro Routine has no documented logic for reading incident tags from Linear or runbook files

**Location:** All 7 runbooks §Post-incident: `anthropic-outage.md`, `linear-api-break.md`, `cloudflare-compromise.md`, `supabase-corruption.md`, `mem0-outage.md`, `github-compromise.md`, and implied in `secret-rotation.md`

**Issue:** Every runbook includes the post-incident action "Friday Retro tags this incident in the weekly retro doc." The Friday Retro Routine specification in ORCHESTRATION.md §2E grants it access to `linear, github, mem0, pgvector` MCPs and describes it as "complex synthesis + PR drafting." No documented logic defines how Friday Retro discovers which incidents happened in the week: it has no `supabase` MCP grant and therefore cannot query `audit_log` for `rule_violation` or similar rows. The Routine would need either a Linear query (for the incident tickets opened during incidents) or a direct `audit_log` read. The Friday Retro Routine's MCP grants do not include `supabase`, so `audit_log` is not directly readable by it.

**Evidence:** ORCHESTRATION.md §2E Friday Retro MCP grants: `linear, github, mem0, pgvector`. No `supabase` grant. All 7 runbooks: "Friday Retro tags this incident." No bridge between the runbook post-incident action and the Routine's actual capability to discover it.

**Source critic:** DR runbook critic

---

## Coverage gaps (scenarios without runbooks)

1. **Inngest platform outage.** ORCHESTRATION.md §Failure modes notes "Inngest outage → parent-ticket-expiry-watcher (24h backstop) → EOD Sync detects → Auto-Unblock fires." But there is no runbook for Inngest being down. The fan-in barrier silently never fires, embed jobs never run, orphan detection never fires. The "NOT silent" claim in ORCHESTRATION.md is only true if the Auto-Unblock itself can fire — but Auto-Unblock is also triggered via Inngest. If Inngest is down, Auto-Unblock cannot fire via Inngest. The 24h parent-ticket-expiry-watcher is itself an Inngest function. A full Inngest outage leaves the war room with no runbook and no automatic recovery path.

2. **Vercel outage / product deployment failure.** The `/war-room` page lives on Vercel. If Vercel is down, the only production observability (per ORCHESTRATION.md §2G) is gone. No runbook. Routines may still be running; Adam has no visibility.

3. **Telegram bot blocked / account suspension.** Every single runbook's first action is "Telegram-ping Adam." If Telegram is unavailable (bot blocked, account flagged, service outage), all incident notifications fail simultaneously. No runbook covers the primary notification channel itself failing.

---

## Cross-runbook inconsistencies

- `cloudflare-compromise.md` §Mitigation mentions "Inngest dead-letter queue" — but ORCHESTRATION.md does not define a dead-letter queue for bridge events, only for Routine completion. The dead-letter mechanism for bridge-sourced events is not specified.
- `cloudflare-compromise.md` lists `secret-rotation.md` for "emergency path for secrets 1-5, 9." But `secret-rotation.md` §Common blast radii lists Cloudflare compromise as covering "secrets 1-5, 9." These match — but the runbook lists only 7 secrets in the bridge scope; it omits `SHORTCUT_SECRET` (#5) from the numeric list in the blast radius table even though the Secret inventory row #5 says it's in Cloudflare env.
- `anthropic-outage.md` §Related runbooks lists `mem0-outage.md` as "independent failure mode; doesn't cascade." This is correct for the cloud path. BUT after WS1F Phase 2 (Mem0 OSS on Supabase), Anthropic outage + Supabase outage = complete memory loss with no fallback. No runbook captures this future compound risk.
