# Deep Review D3 — Cross-Agent Flow Critic

**Date:** 2026-05-11
**Reviewer:** D3 (Sonnet 4.6, code-reviewer)

---

## Frame

D1 reviewed internal agent logic. D3 asks: does data travel from one agent to the next? A flow is healthy when the producer writes to a channel the consumer reads with a matching predicate. Most seam failures are not in agents themselves — they are label mismatches, missing query predicates, or a medium the downstream agent never reads.

---

## Flow traces

### D3.F1 — EOD Sync → Morning Digest (next day)

- **Path:** EOD Sync fires 20:30, writes Linear ticket. Morning Digest fires 05:35, documented as reading "last EOD Sync."
- **Status:** BROKEN
- **Evidence:** INDEX.md line 65: `"EOD Sync: option B — no Mem0 grant. Morning Digest reads Linear ticket."` Both scaffold bodies are `<!-- WS6-6B: placeholder -->`. No query predicate is defined.
- **Gap:** No Linear label/project/date filter. Morning Digest cannot distinguish the EOD ticket from any other open ticket.
- **Fix:** EOD Sync creates ticket with `label: agent:eod-sync`. Morning Digest queries `issues(filter:{labels:{name:{eq:"agent:eod-sync"}}, createdAt:{gt:yesterday}}) orderBy:createdAt desc limit 1`.

---

### D3.F2 — CTO Daily Plan dispatches 6 workers

- **Path:** CTO Plan fires 10:30, posts Linear ticket. INDEX.md line 34: `"All workers are spawned by cto-daily-plan by default."`
- **Status:** BROKEN
- **Evidence:** CTO Plan is a Routine — it fires and terminates. Workers have no `schedule` or `trigger_label` in INDEX.md. routing.ts has no entries for any `agent:parallel-*` label. ROUTINE-ROSTER §What's removed: `"CTO/CMO/CPO Routine receivers — Adam routes those tickets through interactive CEO sessions."` Workers only run inside Adam-initiated CEO sessions.
- **Gap:** No dispatch path from CTO Plan Routine to worker fires exists. INDEX.md claim is aspirational, not operational.
- **Fix (design):** Rename CTO Plan output to "work proposal for Adam to approve." Update INDEX.md to remove the "spawned by default" claim.

---

### D3.F3 — Auto-Unblock observes stuck workers

- **Path:** Auto-Unblock triggers on `routine.timeout` from Inngest. Workers are Task subagents inside CEO sessions, not Routines.
- **Status:** UNCLEAR — silent gap
- **Evidence:** Auto-Unblock reads "stuck Routine's spec + audit_log trail." Workers are not Routines; `routine.timeout` never fires for them. parallel-watcher monitors `audit_log + claude_progress` but has no documented escalation path to Auto-Unblock.
- **Gap:** Worker failures are invisible to the Routine safety net.
- **Fix:** parallel-watcher writes a `worker.stuck` Inngest event. Auto-Unblock adds `worker.stuck` to its trigger list.

---

### D3.F4 — Synthesizer writes locked decisions → Advisor/CTO reads next day

- **Path:** Synthesizer outputs locked decision JSON + updates DECISIONS.md. CTO reads "pgvector RAG on decisions." Advisor reads "Beamix Mem0."
- **Status:** WORKS for CTO / UNCLEAR for Advisor
- **Evidence:** Synthesizer has `mcpServers: [linear, supabase, mem0]` — can write Mem0 and DECISIONS.md. If DECISIONS.md is indexed in pgvector, CTO's loop closes. Advisor reads Mem0 daily, so tagged entries are picked up.
- **Gap:** No Mem0 tag namespace for board decisions is defined in any scaffold. Untagged entries degrade into noise.
- **Fix:** Synthesizer frontmatter adds `mem0_tags: [board-decision]`. Advisor and CTO filter Mem0 reads by `tag:board-decision`.

---

### D3.F5 — Friday Retro → Monday Standup

- **Path:** Friday Retro fires 15:30, writes "Linear Retro project ticket." Monday Standup fires 10:40 Monday, reads "last Friday Retro."
- **Status:** BROKEN — same predicate problem as F1
- **Evidence:** Both scaffold bodies are WS6-6B placeholders. No project name, label, or query is specified.
- **Gap:** Search predicate is nowhere written.
- **Fix:** Retro creates ticket with `label: agent:friday-retro`. Standup queries same label pattern as F1, scoped to past 7 days.

---

### D3.F6 — Competitor Pulse → Content Idea Generator

- **Path:** Competitor Pulse fires 05:40, posts Linear comment "only on material changes." Content Idea fires 10:35, reads "Competitor content."
- **Status:** UNCLEAR — probably independently decoupled
- **Evidence:** Content reads "competitor content" — not "Pulse output." Pulse writes a comment (no routable label). Content likely re-queries the web. No scaffold body defines a Pulse→Content handoff.
- **Gap:** If independent web reads are acceptable, the decoupling should be documented explicitly so future maintainers do not try to wire a non-existent pipe.
- **Fix:** Document in golden path: each agent independently queries the web. If coupling is ever desired, Pulse writes `label: agent:competitor-pulse` ticket; Content checks for it first.

---

### D3.F7 — Board meeting: Synthesizer invokes 4 personas

- **Path:** `@board` → bridge → Synthesizer fires. Synthesizer runs "4-round synthesis protocol" consuming "all persona Round 1+2 outputs." Personas listed as separate Routines in INDEX.md table, invoked via `@visionary`, `@strategist`, `@architect`, `@aria`.
- **Status:** BROKEN — circular invocation architecture
- **Evidence:** Synthesizer is fire-and-forget ($1.00 / 15 min). It cannot post comments and wait for 4 other Routines to complete within its session. INDEX.md: `"Invoked via @<name> comment in a Synthesizer session"` is ambiguous — Task subagents or separate Routine fires? Personas have no `routine_id_env_key` entries in routing.ts, suggesting they were never intended as standalone Routines.
- **Gap:** Persona invocation mechanism is undefined. Independent Routine fires makes board meetings uncoordinated. Task subagents is architecturally correct but undocumented.
- **Fix (WS6-6B):** Personas are `Task` subagents inside the Synthesizer session, not independent Routines. Remove them from the Routine provisioning checklist; they need no `trigger_label` or separate bearer token.

---

### D3.F8 — Advisor → all other Routines

- **Path:** Advisor fires 05:30, posts Advisor Brief to private Linear project. No other Routine lists Advisor output as input.
- **Status:** DELIBERATE — terminal output for Adam only
- **Evidence:** Morning Digest reads EOD Sync. CTO reads EOD Sync + pgvector. ROUTINE-ROSTER describes Advisor output as for Adam's commute reading, not as machine-readable intermediate.
- **Gap:** None. Correct by design.

---

## Cross-cutting findings

**F-CC1 — Missing Linear query predicates block at least 4 flows.** F1, F2, F5, and partially F6 break because `## Golden path` sections are unwritten. When WS6-6B authors system prompts, specifying exact Linear queries (label filter, project slug, date window) per agent is the single highest-leverage correctness task.

**F-CC2 — Workers are invisible to the Routine safety net.** CTO Plan cannot dispatch workers. Auto-Unblock cannot observe them. parallel-watcher has no escalation path to Auto-Unblock. The worker layer is present in the spec but operationally unreachable from Routine supervision.

**F-CC3 — routing.ts is stale vs. current 11-Routine roster.** Table contains entries for dropped agents: `agent:ceo`, `agent:cto`, `agent:cmo`, `agent:cpo`, `agent:cbo`, `agent:cco`, `agent:qa-lead`, `agent:customer-voice`. New agents `agent:cto-daily-plan`, `agent:advisor-daily-thinking`, `agent:competitor-pulse`, `agent:content-idea-generator` have no routing entries. Manual label fires for these return `ignored:true` silently.

---

## Anti-claims

**AC1 — EOD Sync denied Mem0 is not a break.** Option B (INDEX.md line 65) is correct. Morning Digest reads Linear. The missing predicate is the bug, not the Mem0 denial.

**AC2 — Advisor firing 5 min before Morning Digest is not a race.** No data dependency exists between them. Morning Digest does not read Advisor output.

**AC3 — Synthesizer not dispatching workers is not a bug.** Workers are not part of the board meeting flow. The broken aspect of F7 is the persona invocation mechanism only.
