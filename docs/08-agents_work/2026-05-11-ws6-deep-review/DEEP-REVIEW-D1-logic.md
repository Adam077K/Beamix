# Deep Review D1 — Logic Critic

## Frame

This review focuses on internal logical coherence of each agent's frontmatter: does what the agent claims to do match what it is actually equipped to do, given model, budget, maxTurns, MCP grants, and trigger plumbing? This is distinct from what CRITIQUE-WS6.md (R1–R10) already covered. R1 (wrong model ID), R2 (Synthesizer budget), R3/R4 (routing.ts phantom entries), R5 (Sunday W1 quota collision), R7 (EOD Sync Mem0 skill/grant mismatch), and R8 (Auto-Unblock missing GitHub) are already on record — none are repeated here.

---

## Findings (D1.R1–D1.R9)

### D1.R1 [H] Competitor Pulse `trigger_label` mismatches its routing key

- **Agent:** `competitor-pulse.md`
- **Category:** Description mismatch
- **Evidence:** Frontmatter has `trigger_label: agent:competitor-signal` but the agent is named `competitor-pulse` everywhere else (INDEX.md, ROUTINE-ROSTER.md, env key `ROUTINE_COMPETITOR_SIGNAL_ID`). The label is a legacy name from the old "Competitor Signal" design. The routing entry that exists in routing.ts (per R3 context) uses `agent:competitor-signal` — which only accidentally works because no one renamed it. If routing.ts ever gets cleaned up with a consistent naming pass, this silently breaks.
- **Risk:** Label drift between name and trigger creates a landmine during any routing.ts rename or audit.
- **Fix:** Rename `trigger_label` to `agent:competitor-pulse` in both the scaffold and routing.ts simultaneously.

---

### D1.R2 [H] CTO Daily Plan maxTurns=30 but spawns unbounded child agents

- **Agent:** `cto-daily-plan.md`
- **Category:** maxTurns vs work scope
- **Evidence:** `maxTurns: 30` for an Opus agent that reads 5 data sources (Linear, Supabase RAG, audit_log, EOD Sync, runaway-watcher reports) AND spawns parallel-builder, parallel-critic, parallel-tester, parallel-researcher, and parallel-watcher. Reading 5 sources = ~10 turns. Spawning each child agent and collecting its structured return = ~3–4 turns per child. With 5 worker types × 3 turns = 15 turns just for delegation. Total: ~25 turns before any actual synthesis. On a complex day with 3+ parallel builders spawned, 30 turns is a hard ceiling that truncates the plan mid-execution.
- **Risk:** The "day's plan" gets cut off after allocating builders but before assigning testers or critics — partially-planned workday with no QA gate on remaining items.
- **Fix:** Raise maxTurns to 50, or define an explicit "plan-only" phase (turns 1–15) that does not spawn — spawn happens in a separate event.

---

### D1.R3 [H] Synthesizer trigger is `@board` command but no routing entry handles `@board`

- **Agent:** `synthesizer.md`
- **Category:** Trigger logic broken
- **Evidence:** `schedule: "event-triggered"` + `trigger_label: agent:synthesizer`. ROUTINE-ROSTER.md §Synthesizer: "Trigger: Adam invokes `@board` command." The `@board` command is a Linear comment mention — a completely different event type from `agent:synthesizer` label. The bridge's routing.ts fires on Linear label events (`LINEAR_LABEL_TO_ROUTINE`). A Linear comment with `@board` does not set a label — it fires a webhook of type `IssueCommentEvent`, not `IssueLabeledEvent`. There is no bridge handler for comment events in the current architecture. `trigger_label: agent:synthesizer` means the Synthesizer only fires if someone manually adds the label `agent:synthesizer` to a ticket — which is not the `@board` command Adam expects to use.
- **Risk:** Adam types `@board` in a Linear comment expecting the Synthesizer to fire. Nothing happens. No error. The board meeting deadlocks silently.
- **Fix:** Either (a) wire a comment-event handler in the bridge that detects `@board` text and fires `ROUTINE_SYNTHESIZER_ID`, or (b) document that `@board` is shorthand for "add label `agent:synthesizer` to the ticket" and update the UX description accordingly. Option (a) is the correct intent.

---

### D1.R4 [M] Auto-Unblock `schedule: "event-triggered"` — the Inngest `routine.timeout` event is not defined anywhere in WS6

- **Agent:** `auto-unblock.md`
- **Category:** Trigger logic broken
- **Evidence:** `schedule: "event-triggered"`. ROUTINE-ROSTER.md §Auto-Unblock: "Trigger: `routine.timeout` event from Inngest watcher." There is no Inngest function in the codebase that emits a `routine.timeout` event (the Inngest functions in `apps/web/` handle scan and agent jobs — not Routine monitoring). The "Inngest watcher" is a presumed future component that doesn't exist in the WS6 scope. Without a defined producer of `routine.timeout`, Auto-Unblock has no valid trigger at all.
- **Risk:** Auto-Unblock never fires. Stuck Routines accumulate without remediation. The 3-cascade cap is never tested.
- **Fix:** Define in 6C what produces `routine.timeout` — either Cloudflare Bridge Durable Object timeout logic, or a separate Inngest cron that polls `audit_log` for stalled entries. Without this the agent is decorative.

---

### D1.R5 [M] Parallel Watcher `spawned_by: cto-daily-plan` but also spawnable by `auto-unblock` — no description of how auto-unblock knows to spawn it

- **Agent:** `parallel-watcher.md`
- **Category:** Description mismatch
- **Evidence:** `spawned_by: cto-daily-plan` in frontmatter. Description says "Spawned by cto-daily-plan or auto-unblock." The `spawned_by` field only lists one parent. Auto-Unblock's frontmatter never mentions parallel-watcher as a tool it uses. The spawning protocol (what brief format, what context is passed, what return is expected) is fully undefined for the auto-unblock → watcher path.
- **Risk:** Auto-Unblock tries to resolve a stuck Routine by spawning parallel-watcher, but has no spec for how to do so. Either it fails silently or it guesses at a brief format.
- **Fix:** Update `spawned_by` to `[cto-daily-plan, auto-unblock]` and add a note in both parent scaffolds specifying the brief format.

---

### D1.R6 [M] Persona agents claim `round_protocol` but Synthesizer has no field to consume it

- **Agents:** `persona-architect.md`, `persona-strategist.md`, `persona-visionary.md`, `persona-aria.md`
- **Category:** Description mismatch
- **Evidence:** Each persona has e.g. `round_protocol: "round-1-feasibility"`, `round_protocol: "round-2-critic"`. Synthesizer frontmatter has no corresponding field (no `consumes_protocols`, no `round_map`). The 4-round protocol logic is entirely in the body sections — which are all `<!-- WS6-6B: Adam + CEO will write this -->` stubs. There is no defined contract for how Synthesizer knows which persona covers which round, or how it sequences them.
- **Risk:** When 6B writes the Synthesizer body, the author must infer the round protocol from persona filenames alone. If a persona is added or renamed, the ordering breaks with no validation.
- **Fix:** Add a `round_sequence` field to Synthesizer frontmatter listing persona names in order: `[persona-visionary, persona-architect, persona-strategist, persona-aria]`. This is the machine-readable contract.

---

### D1.R7 [M] Friday Retro reads "runaway-watcher reports" but parallel-watcher delivers to spawning agent, not Linear

- **Agent:** `friday-retro.md`
- **Category:** Description mismatch
- **Evidence:** ROUTINE-ROSTER.md §Friday Retro reads: "Reads last week's commits, audit_log, runaway-watcher reports." `parallel-watcher.md` delivery: "structured report to spawning agent" — not a Linear ticket. Friday Retro has no MCP grant for wherever watcher reports land (not Supabase audit_log — those are raw logs, not watcher summaries). Watcher report data is ephemeral context passed back to cto-daily-plan at spawn-time; it is never persisted to a queryable location.
- **Risk:** Friday Retro attempts to read "runaway-watcher reports" that don't exist in any store it can access. It silently produces a retro with a missing data section (no watcher anomaly history for the week).
- **Fix:** Either (a) have parallel-watcher write anomaly summaries to a Supabase `watcher_log` table (making them queryable), or (b) remove "runaway-watcher reports" from Friday Retro's reads and replace with "audit_log anomaly entries."

---

### D1.R8 [M] Parallel Builder has no budget field — "scoped per task" is unenforceable

- **Agent:** `parallel-builder.md`, `parallel-tester.md`, `parallel-deployer.md`, `parallel-researcher.md`
- **Category:** Budget unrealistic
- **Evidence:** All four parallel workers have `Max cost per fire: scoped per task. Max runtime: cto-daily-plan sets per-task budget.` There is no `budget.max_cost_usd` frontmatter field — the standard budget block is absent. The Anthropic Routines infrastructure enforces budget via the frontmatter `max_cost_usd` field. "CTO sets budget" implies a runtime injection mechanism that does not exist in the Anthropic Routines model — you cannot pass a budget cap as a runtime parameter to a spawned agent.
- **Risk:** Parallel workers run with no enforced cost ceiling. A parallel-builder assigned a complex feature task could run to the platform's default max cost with no guardrail.
- **Fix:** Set a conservative static `max_cost_usd` in each parallel worker's frontmatter (e.g., builder $2.00, tester $1.00, deployer $0.50, researcher $0.75). These become floor ceilings; CTO's per-task allocation is advisory context in the brief, not a technical cap.

---

### D1.R9 [L] Morning Digest `agent-memory-mcp` skill — same Mem0 grant gap as EOD Sync (R7 in CRITIQUE-WS6)

- **Agent:** `morning-digest.md`
- **Category:** Skill mismatch
- **Evidence:** `skills: [team-collaboration-standup-notes, agent-memory-mcp, concise-planning]`. `mcpServers: [linear, mem0]`. Unlike EOD Sync (no Mem0 grant), Morning Digest does have `mem0` in mcpServers. The skill is correctly paired here. However, the Mem0 memory store it reads at 05:35 is the same store the Advisor Brief (05:30) writes to — with only a 5-minute gap. If Advisor writes new Mem0 entries at 05:30 and Morning Digest reads Mem0 at 05:35, there is a race: Mem0 writes from Advisor may not be indexed/queryable within 5 minutes depending on the Mem0 implementation.
- **Risk:** Morning Digest reads stale Mem0 data on the day it matters most — when Advisor just added a new context insight.
- **Fix:** Shift Morning Digest to 05:45 (10-minute gap after Advisor fires), giving Mem0 writes time to propagate. Low-effort schedule change.

---

## Cross-agent logic patterns

**Pattern 1 — Body stubs create false confidence.** All 21 scaffolds have `<!-- WS6-6B: Adam + CEO will write this -->` for every operational section. The frontmatter looks complete, but the entire agent behavior is deferred. This means the logic flaws above are all invisible until 6B — and 6B has no checklist enforcing that each gap gets resolved. Risk: 6B ships with 3-4 body sections still stub, producing agents that fire but do nothing useful.

**Pattern 2 — Delivery channel vs actual persistence are conflated.** Multiple Routines claim to "read" outputs from other Routines (Friday Retro reads watcher reports; Monday Standup reads EOD Syncs; CTO reads audit_log). But Linear tickets are not structured queryable stores — they are human-readable text tickets. An agent reading "last EOD Sync" from Linear is doing unstructured text parsing, not a typed query. No agent scaffold acknowledges this parsing step or accounts for turns/tokens spent on it.

**Pattern 3 — Spawned agents assume parent context is complete.** Parallel-builder, critic, tester, deployer, and researcher all say they "read inputs" and "return structured JSON" — but the handoff protocol from cto-daily-plan is fully undefined (all stub). If the parent's brief is malformed or missing a required field, the child has no fallback behavior specified. This creates a fragile spawn chain where one bad brief silently degrades all downstream workers.

---

## Anti-claims

**Parallel Watcher being read-only Supabase is correct.** The description "Read-only Supabase access only" is enforced via the single `supabase` MCP grant with no write tools specified in the (deferred) body. This is the right safety posture for a monitoring agent — it should never mutate the data it is watching.

**Synthesizer having `mem0` grant alongside Linear and Supabase is correct.** Post-decision memory writes via Mem0 are a legitimate output channel for board decisions, separate from DECISIONS.md. The three-destination write (Linear + Supabase + Mem0) is intentional per WS2 §2F and is not over-grant.

**Persona Strategist and Visionary having empty `mcpServers: []` is correct.** These personas receive all context in-prompt from the board meeting comment thread. Giving them live data access would break the deterministic re-replay property of board meeting protocols — you want Round 1 responses to be reproducible from the same in-context data, not variable based on live fetches.
