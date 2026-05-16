---
persona: risk-modeler
round: 1
topic_id: agent-rethink-2026-05-16
date: 2026-05-16
status: COMPLETE
---

# Risk Modeler — R1: Failure Mode Catalog for Agent Rethink

## Framing

The question is: "What breaks?" I am most concerned about the class of failures where the 41-file agent system silently degrades — where an agent fires, produces wrong output, and the quality gate does not catch it because the gate itself depends on assumptions that no longer hold after the rethink. Silent corruption in an autonomous system is worse than loud crashes.

---

## Failure mode catalog

### FM-1: QA-Lead tier misclassification allows Full-tier code through Lite gate

**Trigger:** CTO assigns `tier:lite` to a PR that touches `apps/web/src/app/api/` (an API route). The heuristic classification happens in the CTO's prompt — no deterministic enforcement beyond the label. CTO's Sonnet model makes a judgment call; the PR slips through with only a Haiku spot-review and no security-engineer spawn.

**Blast radius:** An API route change with RLS implications ships to production without security review. Customer data exposure possible. If this happens on a payments route (Paddle webhook), financial data at risk.

**Detection:** Post-hoc only. No automated rule currently enforces "file path X requires tier Y." The `qa-lead-pass.yml` checks for `<verdict>PASS</verdict>` — it does not validate that the assigned tier matches the changed file paths.

**Recovery:** Revert PR. RLS audit. Potential disclosure notification if customer data was exposed (GDPR 72h window).

**Probability:** HIGH — the classification is entirely prompt-driven, and the prompt heuristic ("<100 LOC, single-file logic, no API/DB/auth touch") has soft boundaries. A 95-line API route change satisfies the LOC criterion but violates the path criterion.

**Severity:** CRITICAL — customer data exposure, potential regulatory incident.

---

### FM-2: Auto-Unblock 3x cascade floods Telegram + spawns contradictory fixes

**Trigger:** A BLOCKED ticket triggers Auto-Unblock (fires after 10min stall OR routine timeout). Auto-Unblock's first self-resolve attempt creates a sub-ticket. That sub-ticket hits a different blocker. Second Auto-Unblock fires. Third fires. Each creates its own sub-ticket with its own attempted fix. Three competing branches now exist with contradictory patches to the same files.

**Blast radius:** Three parallel PRs touching the same code paths. If QA-Lead passes any one of them before the others are detected, the merge conflicts corrupt the other two branches. Adam receives 3 Telegram binary-pings in rapid succession (the documented "3-cascade carve-out" from WS4 Q5 is supposed to cap this, but the cap is after 3 fires — so 3 is the designed maximum, not the prevented case).

**Detection:** Adam notices 3 pings. But by then, 3 branches and 3 Linear sub-tickets exist. The fan-in-watcher sees 3 different `fan_in_key` values (each Auto-Unblock is independent), so no single watcher aggregates them.

**Recovery:** Manual. Adam must triage which of 3 fixes is correct, close the other 2 sub-tickets, delete the stale branches. 15-30 minutes of Adam's judgment time per incident.

**Probability:** MEDIUM — requires a structurally blocked ticket (e.g., missing DB column referenced by code) where each auto-resolve attempt fails in a new way. Not unlikely during early rethink deployment when schema drift is highest.

**Severity:** HIGH — wastes 3 fires from the daily cap (15 total), wastes Adam's time, risks merge conflicts corrupting good branches.

---

### FM-3: Mem0 outage with fallback to Anthropic Memory Tool causes episodic memory fork

**Trigger:** Mem0 cloud returns 5xx for > 3 retries (D9.4). Agent falls back to Anthropic Memory Tool (file-based `/memories`). Mem0 recovers 20 minutes later. Now two memory stores exist with 20 minutes of divergent writes. Next agent invocation reads Mem0 (primary) — misses the facts written to Anthropic Memory Tool during the outage.

**Blast radius:** Agent decisions based on stale memory. If the missing memory includes a locked decision (e.g., "pricing changed to $189 Build tier"), a subsequent CBO or CMO session could produce output using the old price.

**Detection:** `audit_log` row with `status: mem0_fallback` is documented in D9.4. But no reconciliation mechanism exists — the log tells you it happened, not what data diverged.

**Recovery:** Manual diff of Anthropic Memory Tool contents vs Mem0 contents for the fallback window. No automated reconciliation tool is specified in the plan.

**Probability:** MEDIUM — Mem0 is a startup-stage service (issue #3400 referenced in smoke-test C). Outages are not hypothetical.

**Severity:** HIGH — silent wrong-decision production. An agent acting on stale memory produces output that looks correct but is factually wrong.

---

### FM-4: Prompt injection in Linear ticket body bypasses spec sentinel

**Trigger:** An attacker (or a careless paste) places `<beamix-spec>...</beamix-spec>` markers inside a Linear ticket description or comment body. The bridge is documented to parse specs "ONLY from sentinel-bracketed comment, never from ticket body" (R3.2). But the bridge code parses comments — if a malicious actor gains write access to the Linear workspace (or a webhook fires on a comment that happens to contain the markers), the spec is extracted.

**Blast radius:** Arbitrary Routine fire with attacker-controlled parameters. The spec includes `scope`, `out_of_scope`, `budget`, and `routine_id_override`. An attacker could fire an expensive Opus routine with `budget.max_cost_usd: 50`, burning Max quota.

**Detection:** `audit_log` row with `fired` status. The `spec.issued_by.linear_user_id` MUST be in `ALLOWED_ISSUERS` (R3.1). If the attacker's user ID is not in the allowlist, the fire is blocked. But if the attack comes from a compromised allowed issuer (Adam's Linear account, or the agent bot account), the allowlist does not help.

**Recovery:** Revoke Linear API key. Rotate bridge HMAC. Review audit_log for unauthorized fires. Kill any running Routines spawned by the malicious spec.

**Probability:** LOW — requires compromise of an allowed Linear issuer account. Linear's security is decent. But bot accounts with API tokens stored in Cloudflare secrets are a target.

**Severity:** CRITICAL — arbitrary code execution via Routine spawn with attacker-controlled scope.

---

### FM-5: FireCountDO rolling-24h cap edge case on timezone boundary

**Trigger:** `FireCountDO` uses a rolling 24h window of timestamps. At the exact 24h rollover boundary, a burst of fires arrives. The atomic transaction in `state.storage.transaction()` handles one request at a time, but if 3 fires arrive within the same Durable Object alarm cycle, the count may be stale by 1-2 entries (depending on DO's exactly-once guarantees under high concurrency).

**Blast radius:** 1-2 extra fires beyond the 15/day cap. Each extra fire burns Max quota (not dollars, but time-window tokens that could throttle other Routines).

**Detection:** `FireCountDO` logs the count. If count exceeds 15, Anthropic returns 429 on the 16th anyway — so the real blast radius is limited to the bridge thinking it has budget when it doesn't.

**Recovery:** Self-healing — Anthropic's 429 is the backstop. The bridge queues to Inngest delayed event per existing design.

**Probability:** LOW — requires exact timing at the 24h boundary with concurrent requests.

**Severity:** LOW — Anthropic's server-side cap is the true enforcement. Bridge over-counting is cosmetic.

---

### FM-6: Schema drift between new agent files and 07b template — QA-Lead approves non-conformant file

**Trigger:** A worker authors a new `.claude/agents/*.md` file. The file omits `return_contract.required_fields` or uses `tools: "Read, Write, Edit"` (comma-string instead of YAML list). The `qa-lead-pass.yml` schema lint is a Phase 6 deliverable — it does not exist yet. During Phases 1-5, schema conformance is enforced only by reviewer attention.

**Blast radius:** A non-conformant agent file causes runtime failures when CEO tries to parse the return contract, or when the agent is invoked with wrong tool grants. Silent degradation of one agent's outputs.

**Detection:** Manual review. No automated enforcement until Phase 6 ships.

**Recovery:** Fix the file. But if the agent already ran and produced outputs that were synthesized upstream, those outputs may need to be re-done.

**Probability:** HIGH — 41 files, manual authoring across multiple sessions, no automated lint until Phase 6. At least one file will drift.

**Severity:** MEDIUM — contained to the one agent; no data loss, but wasted cycles and potentially wrong outputs.

---

### FM-7: Codex CLI auth expires during QA-Lead Full-tier review

**Trigger:** D4.3 locks Codex to Adam's $20/mo ChatGPT Plus subscription. Codex CLI requires an active login session. The session token has a TTL (typically 7-14 days). If Adam hasn't refreshed the session, `codex review --diff <patch>` returns auth error. QA-Lead's Full-tier review depends on Codex as the "second perspective" (D3.2).

**Blast radius:** QA-Lead cannot complete Full-tier review. Returns BLOCKED. CTO cannot merge. Pipeline stalls until Adam re-authenticates Codex.

**Detection:** Immediate — the Bash call to `codex review` returns non-zero exit with auth error message. QA-Lead escalates.

**Recovery:** Adam re-logs into Codex CLI. ~2 minutes. But the stall blocks all Full/Irreversible merges in the interim.

**Probability:** HIGH — auth tokens expire. Adam may not be at his machine when the token lapses. Routines cannot invoke Codex (D9.1 constraint), but interactive sessions can. If Adam is AFK for >14 days, all Full-tier work stalls.

**Severity:** MEDIUM — no data loss, no wrong output. Pure availability degradation of the merge pipeline.

---

### FM-8: Inngest fan-in-watcher fires Synthesizer on partial completion due to Linear webhook race

**Trigger:** CEO creates 2 sub-tickets (BMX-101 CTO, BMX-102 CMO). CTO finishes, marks BMX-101 Done. Linear fires `issue.updated` webhook. Fan-in-watcher checks: are all sub-tickets with this `fan_in_key` Done? If the watcher's query of Linear API returns stale data (webhook arrived before Linear's read-replica is consistent), watcher sees BMX-101=Done and BMX-102=Done (stale cache shows old Done from a previous ticket lifecycle).

**Blast radius:** Synthesizer fires with only CTO's output. CMO's output is missing from the synthesis. CEO posts an incomplete Linear comment. The partial synthesis becomes the "locked" decision if Synthesizer writes to DECISIONS.md.

**Detection:** The documented validation (§2B R2.3) requires "session_id in comment matches the bridge's KV-stored expected session." If CMO hasn't written its session_id comment yet, the fan-in watcher should NOT fire. This is the mitigation. But the spec says the watcher checks "sub-ticket status == Done" AND "session_id matches" — if the status check passes due to stale data, the session_id check should fail (no session_id comment yet). The failure mode exists only if the session_id binding is not enforced strictly.

**Recovery:** Re-fire Synthesizer with both outputs once CMO finishes. Overwrite the partial DECISIONS.md entry.

**Probability:** LOW — the session_id binding is documented as a hard gate. But implementation bugs in the Inngest watcher could skip this check.

**Severity:** HIGH — a wrong synthesis entering DECISIONS.md propagates to every downstream agent that reads decisions.

---

### FM-9: DECISIONS.md 50-entry cap hit mid-session causes archive race

**Trigger:** D10.2 locks DECISIONS.md at 50 entries. CEO + CTO both write a decision in the same session (parallel C-suite returns). The file goes from 49 to 51 entries. The archival logic ("older ones to DECISIONS_ARCHIVE.md") is not specified as atomic. Two agents attempting to archive simultaneously could produce a corrupted file (duplicate entries, or lost entries if both read the 51-entry file and write different subsets to the archive).

**Blast radius:** Lost decisions. An entry moves to archive but also stays in hot file (duplicate) — or moves to archive and is deleted from hot file by the other writer, while the other writer's new entry is also deleted (lost).

**Detection:** Git conflict on commit. If worktree isolation is enforced, both write to their own branch and the conflict appears at merge time.

**Recovery:** Manual merge conflict resolution. The entries exist in git history regardless, so no permanent data loss. But the 50-entry cap enforcement breaks until resolved.

**Probability:** MEDIUM — parallel C-suite returns writing decisions concurrently is a designed pattern (Full-tier fan-out). The race window is small but real.

**Severity:** MEDIUM — no customer impact, but a corrupted decision file can mislead agents in subsequent sessions.

---

### FM-10: Worker spawns into stale worktree from a previous aborted session

**Trigger:** A previous worker session was killed (5-min timeout) mid-execution. Its worktree at `.worktrees/<slug>` remains on disk with partially-written files. A new session for the same task re-uses the same slug (e.g., `feat/add-paddle-webhook`). The worker's Step 1 runs `git worktree add .worktrees/<slug> -b feat/<slug>` — this fails because the branch already exists.

**Blast radius:** Worker returns BLOCKED immediately. Entire pipeline stalls until the stale worktree is cleaned.

**Detection:** Immediate — `git worktree add` returns error. Worker reports BLOCKED to CTO.

**Recovery:** CTO must detect the stale state, run `git worktree remove .worktrees/<slug>` and `git branch -D feat/<slug>`, then re-spawn. Adds 2-3 turns to the pipeline. If the branch was partially pushed to origin, deletion requires a force-push (risk:irreversible territory).

**Probability:** MEDIUM — worker timeouts are documented (5min no-progress kill). Every timeout leaves a stale worktree. The slug collision requires the same task to be retried (which Auto-Unblock does).

**Severity:** LOW — pipeline delay only, no data corruption. But cascades into Auto-Unblock territory if not handled in the first re-try.

---

### FM-11: effort:max applied too eagerly by CEO burns 5h context window on trivial routing

**Trigger:** CEO is configured with `effort: max` in frontmatter. On Max 5x subscription, each "max effort" invocation uses the most expensive compute window. If CEO receives a batch of 5 trivial tickets (all `tier:quick`), each gets full `effort:max` treatment — deep pre-flight reads, thorough analysis — when a simple route-and-dispatch would suffice. The 5h window fills with trivial work, leaving no budget for the one Full-tier task that arrives later.

**Blast radius:** Daily throughput halved. The Full-tier task queues until the next 5h window opens (could be hours). Adam's Max 5x plan gives 5 concurrent 5h windows — but if multiple CEOs run (parallel worktrees per CLAUDE.md color table), each burns a window.

**Detection:** Adam notices slow throughput. No automated detection of "effort vs tier mismatch."

**Recovery:** Adjust CEO to `effort: high` with explicit `effort: max` only for Full/Irreversible tickets. Requires a prompt change.

**Probability:** MEDIUM — the plan explicitly sets `effort: max` on CEO. Quick-tier tickets arrive frequently.

**Severity:** MEDIUM — availability degradation, not correctness. But throughput is the constraint for a solo operator.

---

## Ranked by severity x probability

| Rank | FM | Severity | Probability | Product |
|------|-----|----------|-------------|---------|
| 1 | FM-1 | CRITICAL | HIGH | **Critical x High** |
| 2 | FM-2 | HIGH | MEDIUM | High x Medium |
| 3 | FM-3 | HIGH | MEDIUM | High x Medium |
| 4 | FM-6 | MEDIUM | HIGH | Medium x High |
| 5 | FM-7 | MEDIUM | HIGH | Medium x High |
| 6 | FM-8 | HIGH | LOW | High x Low |
| 7 | FM-4 | CRITICAL | LOW | Critical x Low |
| 8 | FM-9 | MEDIUM | MEDIUM | Medium x Medium |
| 9 | FM-11 | MEDIUM | MEDIUM | Medium x Medium |
| 10 | FM-10 | LOW | MEDIUM | Low x Medium |
| 11 | FM-5 | LOW | LOW | Low x Low |

---

## Top-3 mitigations

### Mitigation 1 — Deterministic file-path tier enforcement (addresses FM-1)

Add a PostToolUse hook or a `qa-lead-pass.yml` step that pattern-matches changed file paths against a tier-floor map:

```yaml
tier_floor_map:
  "apps/web/src/app/api/**": full
  "apps/web/supabase/migrations/**": irreversible
  "apps/web/src/lib/agents/**": full
  "apps/web/src/middleware.ts": full
  ".claude/agents/**": lite
```

If CTO labels `tier:lite` but changed files include `apps/web/src/app/api/`, the GitHub Action auto-upgrades the tier label to `full` and blocks merge until QA-Lead re-reviews at the correct tier. Zero LLM cost. Deterministic. Ships in Phase 6 alongside the schema lint.

### Mitigation 2 — Auto-Unblock idempotency key per original ticket (addresses FM-2)

Auto-Unblock must carry the original blocked ticket's ID as an idempotency scope. If a second Auto-Unblock fires for the same original ticket while the first is still in-flight (or within a 30-minute cooldown), the bridge rejects the second fire with `status: dedup_auto_unblock` in audit_log. The 3-cascade carve-out (WS4 Q5) becomes a hard ceiling enforced at the bridge layer — not just a Telegram notification count.

Implementation: extend `FireCountDO` with a per-ticket-ID sub-counter. If `auto_unblock:{ticket_id}` count >= 1 within 30 minutes, reject. Cost: zero additional infra (already have the DO).

### Mitigation 3 — Mem0 write-ahead queue with reconciliation (addresses FM-3)

During Mem0 fallback, instead of writing directly to Anthropic Memory Tool, write to a Supabase `mem0_pending_writes` table (append-only, timestamped, with the full memory payload as JSONB). When Mem0 recovers (detected by next successful health check in any agent session), an Inngest function replays `mem0_pending_writes` rows to Mem0 and marks them `synced`. Anthropic Memory Tool is never used as a divergent store — only the pending-writes table captures fallback data.

This eliminates the fork. Single source of truth (Mem0) is always eventually consistent. Detection is automatic (next agent's pre-flight health check triggers replay). Cost: one Supabase table + one Inngest function.

---

## Structured Round 1 JSON

```json
{
  "persona": "risk-modeler",
  "round": 1,
  "topic_id": "agent-rethink-2026-05-16",
  "verdict": "ship",
  "rationale": "The dominant failure mode is FM-1: tier misclassification allowing API/auth changes through a Lite gate with no security review. This is entirely prompt-driven with no deterministic backstop until Phase 6 ships the schema lint and file-path tier enforcement. The system is architecturally sound — the 4-tier QA matrix, the two-layer dedup, and the three-party audit log are well-designed. But the gap between 'designed' and 'enforced' is where incidents live. During Phases 1-5, the system runs without its own safety net. Ship, but with the top-3 mitigations committed as Phase 6 P0 deliverables, and with file-path tier enforcement pulled forward into Phase 1 as a PostToolUse hook (10 lines of config, zero LLM cost).",
  "risks": [
    "FM-1: CTO misclassifies tier on API route change — Lite gate passes code that should require Full security review. CRITICAL severity, HIGH probability.",
    "FM-2: Auto-Unblock 3x cascade creates 3 competing branches + 3 Telegram pings + burns 20% of daily fire cap. HIGH severity, MEDIUM probability.",
    "FM-3: Mem0 outage + fallback creates divergent memory stores with no reconciliation — agents make decisions on stale facts. HIGH severity, MEDIUM probability.",
    "FM-6: Schema drift across 41 files with no automated lint until Phase 6 — at least one file will be non-conformant. MEDIUM severity, HIGH probability.",
    "FM-7: Codex CLI auth expires, blocking all Full/Irreversible merges until Adam re-authenticates. MEDIUM severity, HIGH probability."
  ],
  "alternatives_considered": [
    "Pull file-path tier enforcement into Phase 0 as a simple shell script in qa-lead-pass.yml — rejected only because Phase 0 scope is locked to hygiene (no new logic). Recommend Phase 1 inclusion instead."
  ],
  "recommendation": "Ship the rethink. Pull file-path tier enforcement forward to Phase 1 (not Phase 6). Add Auto-Unblock per-ticket idempotency to the bridge in Phase 4. Add Mem0 write-ahead queue to Phase 3 (memory architecture). These three mitigations address the top-3 ranked failure modes at near-zero incremental cost.",
  "confidence": "high"
}
```
