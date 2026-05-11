# WS6 Adversarial Critique

**Reviewer frame:** Procurement-grade vendor auditor. Goal: surface what breaks before Adam locks 21 agents in 6B.
**Date:** 2026-05-11
**Word count:** ≤1200

---

## Summary

The 21-agent scaffold is structurally sound and the MCP least-privilege matrix is the strongest part of the design. However, three issues require attention before 6B lock-in: model references throughout use a non-existent model ID (`claude-opus-4-7`), the Synthesizer's $1.00 budget cannot cover a 4-round multi-persona protocol at Opus pricing, and routing.ts has three phantom entries that will silently route to the wrong target in production.

---

## Findings

### R1 [HIGH] Model `claude-opus-4-7` does not exist

- **Category:** Skill mismatch / broken configuration
- **Evidence:** `advisor-daily-thinking.md` frontmatter `model: claude-opus-4-7`; same in `cto-daily-plan.md`, `geo-algorithm-signal.md`, `synthesizer.md`, `persona-visionary.md`, `persona-strategist.md`, `persona-architect.md`, `persona-aria.md` (8 files). CLAUDE.md §Models shows `claude-opus-4-6` as the latest Opus; `4-7` is not listed anywhere in the project.
- **Risk:** Every Opus-model agent silently fails at fire time with a model-not-found error. The Advisor Brief, CTO Plan, and all board-meeting personas are dead on arrival.
- **Recommended fix:** Replace all `claude-opus-4-7` occurrences with `claude-opus-4-6` (the current Opus tier per CLAUDE.md). Do a grep before 6B: `grep -r "opus-4-7" .claude/agents/war-room/`.

---

### R2 [HIGH] Synthesizer $1.00 budget cannot fund a 4-round Opus protocol

- **Category:** Budget concern
- **Evidence:** `synthesizer.md` `budget.max_cost_usd: 1.00`. ROUTINE-ROSTER.md §Synthesizer: "4-round protocol — synthesize the personas into locked decisions." At Opus-4-6 pricing ($5/M in · $25/M out per CLAUDE.md), a 4-round loop with 4 persona outputs (each ~500-1000 words in-context) plus synthesis output exceeds $1.00 routinely. Input context alone at 4 rounds × ~4000 tokens each = 16K tokens = $0.08 in alone; but synthesized output at 1K tokens = $0.025/round × 4 = $0.10. Soft overhead from MCP calls, DECISIONS.md writes, and board.ts JSON validation puts realistic spend at $2.50–$4.00/fire.
- **Risk:** Budget cap hits mid-synthesis. Locked decisions are partial or missing. DECISIONS.md update never fires. Silent truncation, not an escalation.
- **Recommended fix:** Raise `max_cost_usd` to $4.00 for Synthesizer. Cross-reference monthly projection ($1.00 × ~1/wk → $4.00 × ~1/wk = +$13/mo — acceptable).

---

### R3 [HIGH] routing.ts has three entries for retired agents that will misroute

- **Category:** routing.ts alignment
- **Evidence:** `routing.ts` lines 34-38 still list `agent:cmo`, `agent:cpo`, `agent:cbo`, `agent:cco`, `agent:qa-lead` all mapped to `ROUTINE_CEO_ENTRY_POINT_ID` and `ROUTINE_CEO_ENTRY_POINT_TOKEN` (lines 76-81, 122-127). ROUTINE-ROSTER.md §"What's removed" confirms: "CMO / CTO / CPO / CBO / CCO Routine receivers — Adam routes those Linear tickets through interactive CEO sessions." Also `agent:ceo` (line 22) maps to CEO Entry Point — but CEO Routine is also dropped per ROUTINE-ROSTER.md §"Architecture pivot."
- **Risk:** A Linear ticket labeled `agent:cmo` (easy to create by accident) silently fires the CEO Routine with no context about the intended C-suite agent. No error, no audit log entry flagging the mismatch. Silent misroute.
- **Recommended fix:** Remove `agent:ceo`, `agent:cmo`, `agent:cpo`, `agent:cbo`, `agent:cco`, `agent:qa-lead` from `LINEAR_LABEL_TO_ROUTINE`, `ROUTINE_ID_ENV_KEY`, and `ROUTINE_TOKEN_ENV_KEY` in routing.ts (6C task). Also remove the corresponding `BridgeEnv` fields for tokens that will never be set.

---

### R4 [HIGH] `agent:customer-voice` is a live dead route

- **Category:** routing.ts alignment
- **Evidence:** `routing.ts` line 29: `"agent:customer-voice": PLACEHOLDER_ROUTINE_ID`; line 72: maps to `ROUTINE_CUSTOMER_VOICE_SIGNAL_ID`; line 118: maps to `ROUTINE_CUSTOMER_VOICE_SIGNAL_TOKEN`. `ROUTINE_CUSTOMER_VOICE_SIGNAL_ID` declared in `BridgeEnv` (line 206). No scaffold file `customer-voice.md` exists under `.claude/agents/war-room/`. Not in ROUTINE-ROSTER.md.
- **Risk:** If any Linear ticket gets labeled `agent:customer-voice`, bridge attempts to resolve `ROUTINE_CUSTOMER_VOICE_SIGNAL_ID` env var, which is unset → returns `ignored:true` with a log line. Harmless operationally but causes audit confusion and wastes Adam's debugging time. The `BridgeEnv` type declaration leaks a phantom secret slot into every deployment checklist.
- **Recommended fix:** Remove `customer-voice` from all three routing maps and from `BridgeEnv` in routing.ts. This is a 4-line delete for 6C.

---

### R5 [MEDIUM] W1 fires 4 Routines in 15 minutes — 5h quota window collision

- **Category:** Schedule conflict
- **Evidence:** ROUTINE-ROSTER.md §"4-window daily fire schedule": W1 = 05:30–10:29. Cron strings: Advisor 05:30, Morning Digest 05:35, Competitor Pulse 05:40, GEO Signal (Sundays) 05:45. On Sundays all four fire within 15 minutes. ROUTINE-ROSTER.md §"Schedule constraints": "Firing two Routines within the same 5h block shares the window's quota." Advisor uses Opus ($2.00 budget); GEO Signal uses Opus ($1.50 budget). Two Opus sessions competing for the same 5h Max window on Sunday mornings.
- **Risk:** Sunday W1 fires 3-4 Routines in 15 minutes. If Advisor and GEO Signal both run long (Opus, WebFetch calls), they share Max quota and can starve each other, causing one to hit the session ceiling and produce truncated output — with no cascade alert.
- **Recommended fix:** Shift GEO Algorithm Signal to Sunday 10:30 (W2), giving it a fresh 5h window. Leaves W1 Sunday with 3 Routines: two Sonnet (cheap) + one Opus (Advisor).

---

### R6 [MEDIUM] Advisor `trigger_label: agent:advisor` — no routing.ts entry

- **Category:** routing.ts alignment / roster gap
- **Evidence:** `advisor-daily-thinking.md` frontmatter: `trigger_label: agent:advisor`. routing.ts `LINEAR_LABEL_TO_ROUTINE`, `ROUTINE_ID_ENV_KEY`, `ROUTINE_TOKEN_ENV_KEY`: no `agent:advisor` entry in any map. `BridgeEnv` has no `ROUTINE_ADVISOR_DAILY_THINKING_ID` or `ROUTINE_ADVISOR_DAILY_THINKING_TOKEN` field.
- **Risk:** Manual Linear-label fire of `agent:advisor` silently returns `ignored:true`. The Advisor is cron-only until the label is wired. Fine operationally, but inconsistent with the template spec (`trigger_label` implies Linear can also fire it) and creates confusion when Adam tries to manually trigger an Advisor Brief mid-day.
- **Recommended fix:** Add `agent:advisor → ROUTINE_ADVISOR_DAILY_THINKING_ID/TOKEN` to routing.ts in 6C, and add the two fields to `BridgeEnv`. Also add `agent:cto-daily-plan` and `agent:content-idea` (same gap exists for those labels).

---

### R7 [MEDIUM] EOD Sync has Mem0 skill loaded but no Mem0 MCP grant

- **Category:** Skill mismatch
- **Evidence:** `eod-sync.md` frontmatter `skills: [team-collaboration-standup-notes, agent-memory-mcp, concise-planning]`. `mcpServers: [linear, supabase, github]` — no `mem0`. WS6-RESEARCH-mcps.md R2 grant matrix: EOD Sync row has `Mem0: ×`. WS6-RESEARCH-template.md INDEX note: "EOD Sync MCPs: Mem0 was flagged ambiguous — scaffold implements option B (no Mem0)."
- **Risk:** `agent-memory-mcp` skill instructs the agent to call `mcp__mem0__*` tools. With no Mem0 MCP granted, those calls fail. The skill and the grant are misaligned. At worst the agent retries Mem0 calls until maxTurns is spent; at best it gracefully falls back but wastes turns.
- **Recommended fix:** Either remove `agent-memory-mcp` from EOD Sync skills and replace with a skill appropriate to its actual tool set (e.g., `workflow-orchestration-patterns`), OR grant Mem0 MCP (option A from R2 ambiguity). Pick one before 6B.

---

### R8 [MEDIUM] Auto-Unblock has no GitHub MCP — but CI failures are its primary trigger

- **Category:** MCP under-grant
- **Evidence:** `auto-unblock.md` `mcpServers: [linear, supabase, mem0]`. ROUTINE-ROSTER.md §Auto-Unblock: "Trigger: `routine.timeout` event from Inngest watcher." Auto-Unblock's job is to diagnose stuck Routines. Routines fail for multiple reasons: CI failures in GitHub Actions block parallel-builder; Vercel deploy failures block parallel-deployer. Without GitHub MCP, Auto-Unblock cannot read failed workflow run logs.
- **Risk:** Auto-Unblock escalates to Adam (Telegram ping) for failures it could self-resolve if it could read GitHub Actions logs — burns Adam's attention unnecessarily.
- **Recommended fix:** Add `github` to Auto-Unblock `mcpServers` with read-only scope (read workflow runs, read check runs). Align with parallel-builder's existing GitHub grant pattern.

---

### R9 [LOW] Morning Digest + Advisor Daily Thinking — overlap risk on Mondays

- **Category:** Roster bloat
- **Evidence:** Both fire W1 (Advisor 05:30, Morning Digest 05:35). ROUTINE-ROSTER.md §Morning Digest reads: "Open Linear tickets, last EOD Sync, current sprint goals, Mem0." ROUTINE-ROSTER.md §Advisor reads: "HackerNews, AI/SEO news... Beamix Mem0, last 7d audit_log." On Mondays, Monday Standup (10:40) also reads "last week's EOD Syncs, last Friday Retro, current sprint backlog" — same Linear data as Morning Digest, five hours later.
- **Risk:** Monday generates three overlapping briefing agents (Advisor 05:30 + Morning Digest 05:35 + Monday Standup 10:40). Not a data-loss issue, but creates briefing fatigue and wastes ~$3.00 on Monday mornings. Adam may stop reading one.
- **Recommended fix:** Suppress Morning Digest on Mondays (add `0 5 * * 2-5` cron to Morning Digest instead of `* * 1-5`) — Monday Standup covers the weekly context at 10:40 with more depth.

---

### R10 [LOW] Competitor Pulse skill set has 3 skills — ambiguity flag unresolved

- **Category:** Skill mismatch
- **Evidence:** `competitor-pulse.md` skills: `[competitive-landscape, search-specialist, deep-research]`. WS6-RESEARCH-skills.md §Ambiguity Flags: "Competitor Pulse — prefer `search-specialist` at $0.40/fire. Use `deep-research` only if synthesis depth matters more than cost." Scaffold kept both. Three skills at $0.40/fire budget means each skill's system prompt adds tokens to every call.
- **Risk:** Loading 3 skills on a $0.40/fire budget amplifies token overhead. At Sonnet pricing, 3 loaded skills (~6K tokens each = 18K tokens) = ~$0.05 input overhead per fire × 7/week = $0.35/week in dead overhead — nearly one full Competitor Pulse fire wasted per week.
- **Recommended fix:** Drop `deep-research` from Competitor Pulse. Keep `competitive-landscape` + `search-specialist`. Add `deep-research` back only in a quarterly deep-dive variant.

---

## Cross-cutting observations

1. **Model ID discipline is the single highest-leverage fix.** All 8 Opus agents use a nonexistent model ID. This would cause every Routine marked `claude-opus-4-7` to fail at runtime with zero user-visible signal until the first fire attempt. A pre-6B `grep -r "4-7" .claude/` takes 5 seconds and prevents a production-down event.

2. **routing.ts is the system's single point of silent failure.** When a label has no map entry or an env var is unset, the bridge logs and returns `ignored:true` — no error, no Telegram ping. Three phantom entries (customer-voice, C-suite labels, advisor label) means up to 9 label combinations can be silently dropped in production without any alert. 6C must be treated as a production-safety task, not a cleanup task.

3. **Budget estimates assume happy-path token counts.** All budgets in ROUTINE-ROSTER.md were set before MCP grant counts were finalized. Each MCP tool call adds ~500-1000 tokens of tool-call overhead. An agent with 4 MCP grants (Advisor: linear + supabase + mem0 + web) making 10 calls each = 40K tokens of tool overhead alone at $0.20 input cost — eating 10% of its $2.00 budget. Not blocking, but 6B spec writers should add a 20% overhead multiplier to all budget estimates.

---

## Counter-claims (anti-revisions)

1. **Synthesizer having Supabase MCP is correct.** It must write to DECISIONS.md via pgvector and produce locked decision JSON conforming to board.ts. The grant is not over-provisioned — it's structurally required by the WS2 §2F spec.

2. **Aria having WebFetch-only is correct, not under-provisioned.** Aria is a board-meeting persona that receives all context in-prompt from the Synthesizer. It needs only live vendor pricing lookups, which WebFetch covers. Adding Linear or Supabase would expand blast radius with zero benefit for a read-only critic role.

3. **parallel-deployer having no `merge_pull_request` GitHub grant is correct.** This is a structural QA gate — parallel-deployer intentionally cannot merge. The grant omission is a safety control, not a gap.

4. **4-window schedule design is sound.** W4 (20:30-05:29) being fire-free while Adam sleeps is correct — no wasted Opus context outside Adam's reading windows. The W1 concentration issue (R5) is a real edge case but only affects Sunday mornings.

5. **parallel-researcher having no Linear MCP is the right default.** Passing ticket context via the spawning CTO Daily Plan brief keeps the researcher isolated. Granting Linear read would expand the researcher's footprint for convenience, not necessity. Option B from R2 is the safer default; revisit if parent verbosity becomes a real problem.
