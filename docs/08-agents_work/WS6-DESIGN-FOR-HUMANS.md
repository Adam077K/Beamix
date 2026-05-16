---
title: WS6 — Designing Your 21 War-Room Agents (Plain English)
date: 2026-05-11
audience: Adam — pre-6B conversation prep
read_time: 12 minutes
source_doc: WS6-SYNTHESIS-AND-OPTIONS.md
---

# WS6 — Designing Your 21 War-Room Agents

## What this doc is for

Phase 6A is done. All 21 agent scaffolds exist as files with complete configuration headers. The body sections — what each agent actually does, step by step — are intentionally blank. You and the CEO will write those in Phase 6B. This doc gives you 10 decisions to make before that conversation so you walk in ready, not reading dense notes.

---

## Where we are

WS3 built the bridge (Cloudflare Worker that validates and signs every request before any AI fires). WS4 wired the infrastructure end-to-end and verified one live Routine running. WS5 locked the architecture, wrote the master documentation, and left one single gap: none of the actual agent prompts exist yet.

WS6 fills that gap. The job is to write the system prompts, skills lists, and MCP tool grants for all 21 agents. Phase 6A (done) produced 22 files: 21 scaffolds + a roster index. Every scaffold has the right headers — model, schedule, budget, MCP list, skills list — but the body is a placeholder comment waiting for you. Phase 6B is the writing session.

Phase 6C is autonomous again after 6B: split the shared bearer token into one-per-Routine, you click through 10 Routine provisions in claude.ai, set 20 wrangler secrets, run a smoke test, and WS6 is locked.

---

## The 21 agents at a glance

Three groups. Full detail is in `.claude/agents/war-room/INDEX.md`.

### 11 Routines — scheduled agents that fire without you asking

| Agent | What it does | Model | When |
|---|---|---|---|
| Advisor Daily Thinking | Multi-domain brief: news, contrarian angles, one new idea | Opus | Daily 05:30 |
| Morning Digest | 3-5 bullet "here's what needs attention today" to Telegram | Sonnet | Daily 05:35 |
| Competitor Pulse | Checks competitors for material changes; silent on quiet days | Sonnet | Daily 05:40 |
| GEO Algorithm Signal | Weekly deep scan of AI search algorithm shifts | Opus | Sundays 05:45 |
| CTO Daily Plan | Breaks today's work into parallelizable tasks for the agent fleet | Opus | Daily 10:30 |
| Content Idea Generator | 3 ranked content ideas with hooks → Linear tickets | Sonnet | Daily 10:35 |
| Monday Standup | Week-ahead sprint plan → Linear ticket | Sonnet | Mondays 10:40 |
| Friday Retro | What shipped, slipped, learned → Linear ticket | Sonnet | Fridays 15:30 |
| EOD Sync | Day recap + tomorrow's priorities → Linear + Telegram | Sonnet | Daily 20:30 |
| Auto-Unblock | Diagnoses and self-heals stuck Routines; pings you after 3 failures | Sonnet | Event-triggered |
| Synthesizer | Board meeting: reads 4 personas, produces locked decisions | Opus | Adam-invoked |

### 6 Workers — spawned by CTO Daily Plan to do actual build work

All run Sonnet. CTO Daily Plan creates them as isolated subagents for specific tickets. The six roles: **parallel-builder** (implements code in a worktree), **parallel-researcher** (targeted web research), **parallel-critic** (PR review, PASS/FAIL verdict), **parallel-tester** (E2E via Playwright), **parallel-deployer** (migrations + Vercel deploys, intentionally cannot merge), **parallel-watcher** (read-only anomaly monitor on audit logs).

### 4 Personas — board meeting participants

All run Opus. You invoke each with `@visionary`, `@strategist`, `@architect`, or `@aria` during a board meeting session. They read what the Synthesizer provides and each gives a distinct perspective. Visionary takes contrarian horizon-3 angles. Strategist maps execution trade-offs. Architect checks technical feasibility. Aria plays the skeptical vendor-procurement critic — SLA, security, cost challenges.

---

## What the critic found

The adversarial review surfaced 10 findings before you lock 21 agents. Three are worth understanding in plain English before you walk into 6B.

**Finding 1: Synthesizer's $1 budget is too low for what it actually does.**
The Synthesizer runs a 4-round protocol: it reads all 4 persona outputs (each ~500-1000 words), synthesizes them into locked decisions, and writes the result to DECISIONS.md. At Opus pricing, that's realistically $2.50-$4.00 per board meeting. The scaffold currently has a $1.00 cap — which means the synthesis would cut off mid-execution without completing the locked decisions. The fix is simple: raise it to $4.00. That adds roughly $13/month if you run one board meeting per week.

**Finding 2: Sunday mornings have a quota collision.**
Window 1 on Sundays fires 4 Routines within 15 minutes: Advisor (05:30), Morning Digest (05:35), Competitor Pulse (05:40), GEO Signal (05:45). Advisor and GEO Signal both run on Opus and share the same 5-hour quota window. On a busy quota week, they can starve each other — one gets truncated with no alert. The fix: move GEO Algorithm Signal to Sunday 10:30, giving it a fresh window. Sunday W1 then has two Sonnet Routines and one Opus, which is fine.

**Finding 3: routing.ts has 6 stale entries from the old C-suite roster.**
Labels like `agent:cmo`, `agent:cpo`, `agent:cbo`, `agent:cco`, `agent:ceo`, and `agent:qa-lead` are still wired in routing.ts, each pointing at the CEO entry point token. The C-suite Routines were dropped — you run CEO interactively. A Linear ticket that accidentally gets one of those labels would silently fire the wrong thing, log nothing useful, and give you no signal that anything went wrong. The fix is a 6C cleanup: delete 6 entries from 3 maps in routing.ts.

**One critic finding that was just wrong:** The critic flagged `claude-opus-4-7` as a non-existent model ID because CLAUDE.md shows `claude-opus-4-6`. CLAUDE.md is stale. The runtime injects current model IDs every session — Opus 4.7 is the live model. The scaffolds are correct. CLAUDE.md gets updated in 6C as a minor cleanup.

---

## The 10 decisions you need to make

These are the unlocks for Phase 6B. Answer them here and the body-writing session moves fast.

---

### Q1 — Where do the 21 agent files live?

The 21 scaffolds currently sit at `.claude/agents/war-room/`. That same `.claude/agents/` directory is where product subagents live — the ones that fire when you run a Task in Claude Code. There's a risk that a war-room Routine gets auto-picked-up as a Task subagent in a product session.

**Options:**
- **A (recommended):** Keep them at `.claude/agents/war-room/` AND add a settings guard so Claude Code's Task runner ignores that subdirectory. One mental model for all agents, zero accidental-fire risk.
- **B:** Move them to `docs/08-agents_work/agents/` — cleaner separation, less discoverable.
- **C:** Keep them where they are and accept the accidental-fire risk (not recommended).

**CEO recommends A.** Same location, guard added in 6C. No migration work.

---

### Q2 — The 6 worker names: keep generic or rename?

The 6 worker roles are named parallel-builder, parallel-researcher, parallel-critic, parallel-tester, parallel-deployer, parallel-watcher. These are generic by design — CTO Daily Plan dispatches them with the ticket's context to tell them what specifically to build, research, or test.

**Options:**
- **A (recommended):** Keep the 6 generic names. CTO Daily Plan specifies the task at dispatch time. Clean, flexible.
- **B:** Drop the 6 generics and define 12 specialized workers (e.g., nextjs-builder, supabase-migrator, e2e-tester). More precise, more files, more maintenance.
- **C:** Keep 6 generics and add 2-3 specialized variants for common patterns.

**CEO recommends A.** Expanding the worker roster is a separate workstream. WS6 scope is writing the prompts for the 6 that exist.

---

### Q3 — Keep all 4 board-meeting personas or trim?

The 4 personas (Visionary, Strategist, Architect, Aria) fire only when you explicitly invoke them in a board meeting. They're not scheduled — they only run when you want them. Board meetings happen roughly weekly at most.

**Options:**
- **A (recommended):** Keep all 4. The 4-round protocol was designed around getting 4 different perspectives; dropping one degrades the synthesis.
- **B:** Trim to 2 (Strategist + Aria). Cuts coverage but halves persona cost per board meeting (~$2/board meeting saved).
- **C:** Drop all 4 personas and let the Synthesizer run solo. Loses the multi-voice property entirely.

**CEO recommends A.** Each persona costs ~$0.50 per invocation at Opus pricing, only fires when you explicitly ask. The diversity of views is worth it.

---

### Q4 — Fix the Sunday morning quota collision?

As described in the critic findings above: GEO Algorithm Signal sharing a quota window with Advisor on Sundays creates a real risk of truncated output.

**Options:**
- **A (recommended):** Move GEO Algorithm Signal to Sunday 10:30. Fresh 5-hour window, no collision. Sunday W1 becomes 3 fires, Sunday W2 gets GEO as a standalone.
- **B:** Leave the schedule as-is. Accept that on a heavy quota week, one of the two Opus Routines may produce degraded output. GEO Signal is weekly, so an occasional bad run is tolerable.
- **C:** Move GEO Signal to bi-weekly to reduce frequency entirely.

**CEO recommends A.** Moving one cron string is trivial and prevents a hard-to-diagnose truncation bug.

---

### Q5 — EOD Sync: grant Mem0 or drop the memory skill?

EOD Sync's scaffold currently lists a memory skill (`agent-memory-mcp`) but has no Mem0 MCP grant. That mismatch means the skill instructs the agent to call Mem0 tools that it can't actually reach. At best it wastes turns trying; at worst it errors mid-execution.

**Options:**
- **A:** Grant Mem0 to EOD Sync. EOD writes a clean episodic memory that Morning Digest reads the next morning. Adds ~$0.05/fire overhead.
- **B (recommended):** Drop the `agent-memory-mcp` skill from EOD Sync. Replace with `workflow-orchestration-patterns`. EOD writes its recap to a Linear ticket — Morning Digest reads that ticket directly, no Mem0 needed.

**CEO recommends B.** EOD's job is writing a day summary to Linear. That's enough. Mem0 is over-provision for what it actually does.

---

### Q6 — Give Auto-Unblock access to GitHub CI logs?

Auto-Unblock diagnoses stuck Routines. A lot of stuck situations are caused by CI failures in GitHub Actions or Vercel deploy errors. Without GitHub MCP read access, Auto-Unblock can see that something is stuck but can't read the actual error log — so it escalates to you instead of self-resolving.

**Options:**
- **A (recommended):** Add GitHub MCP with read-only scope (workflow runs + check runs). Auto-Unblock can read what failed and attempt to fix it before pinging you.
- **B:** Leave it without GitHub access. Auto-Unblock pings you on every CI failure. More interrupts, more decisions pushed to you.

**CEO recommends A.** The point of Auto-Unblock is to reduce your interruptions. Without GitHub read access, half of its most common failure modes require your intervention anyway.

---

### Q7 — Monday triple-briefing: suppress Morning Digest on Mondays?

Monday currently fires three overlapping briefings: Advisor at 05:30, Morning Digest at 05:35, and Monday Standup at 10:40. All three read overlapping data from Linear. Monday Standup goes deeper than Morning Digest — it produces a full week-ahead plan, not just today's bullets. The Morning Digest on Mondays is largely redundant.

**Options:**
- **A (recommended):** Suppress Morning Digest on Mondays. Change its cron from `* * 1-5` (Mon-Fri) to `* * 2-5` (Tue-Fri). Monday Standup at 10:40 has better depth.
- **B:** Suppress Monday Standup instead. Keep Morning Digest as the single daily brief. Lose the weekly-planning ritual.
- **C:** Keep all 3 fires on Mondays. Accept the redundancy.

**CEO recommends A.** One cron string change. Monday Standup gives you more than Morning Digest would on that day.

---

### Q8 — Clean out the stale C-suite routing entries?

As described in the critic findings above: routing.ts has 6 label entries pointing at Routines that were dropped from the roster (agent:ceo, agent:cmo, agent:cpo, agent:cbo, agent:cco, agent:qa-lead). These are silent-failure surface area.

**Options:**
- **A (recommended):** Delete all 6 stale entries from routing.ts in 6C. 6 fewer wrangler secrets to manage, zero silent misroute risk.
- **B:** Keep them mapped to the CEO entry point as legacy fallbacks (old Linear tickets that still carry those labels route somewhere).
- **C:** Keep them but map explicitly to `PLACEHOLDER_ROUTINE_ID` (silently ignored with a log line).

**CEO recommends A.** Stale routes are bugs waiting to happen. Clean slate in 6C.

---

### Q9 — How much Supabase access does Synthesizer need?

Synthesizer writes locked decisions to DECISIONS.md via Supabase and pgvector after every board meeting. It needs to write to the `decisions` table and insert `audit_log` rows.

**Options:**
- **A:** Grant full service-role access (bypasses all RLS). Synthesizer can write anything, anywhere. Simple to configure.
- **B (recommended):** Grant Supabase with an explicit RLS allowlist — only the `decisions` table and `audit_log` rows with `row_kind='decision'` can be written. Everything else is blocked.

**CEO recommends B.** Synthesizer fires when you explicitly run a board meeting — tight RLS is completely fine for this use case. Service-role is unnecessary blast radius.

---

### Q10 — Should every Telegram send write an audit log entry?

Most Routines deliver output via Telegram (through `notify.beamixai.com`). The question is whether to record each send attempt in the audit log.

**Options:**
- **A (recommended):** Every Telegram send writes an `audit_log` row: status goes from `telegram_send_attempt` to `telegram_send_succeeded` or `telegram_send_failed`. Full traceability — you can see which messages were delivered and which dropped.
- **B:** Fire-and-forget. Only log on failure.

**CEO recommends A.** The audit_log schema already supports these status values — no schema change needed. The write cost is negligible. When a Telegram message doesn't arrive, you want to know whether it was a Routine failure or a delivery failure — those are different problems.

---

## What we're NOT going to re-debate

These are locked. Don't relitigate them in 6B.

1. **The 11-Routine roster is final.** No additions or removals in WS6. Locked per ROUTINE-ROSTER 2026-05-08.
2. **The 4-window daily schedule is final.** 05:30 / 10:30 / 15:30 / 20:30. The 5-hour spacing is structural — it's how the Max quota windows work.
3. **CEO is not a Routine.** You run CEO interactively. There is no scheduled CEO Routine and WS6 will not create one.
4. **Per-Routine token split happens in 6C, not 6B.** Phase 6B writes .md body content only. Routing.ts and wrangler secrets are touched in 6C.
5. **parallel-deployer cannot merge pull requests.** This is intentional — it's the structural QA gate. The GitHub grant omission is a safety control, not a missing feature.
6. **All Mem0-granted Routines fall back to Anthropic Memory Tool if Mem0 goes down.** This fallback pattern is locked per the mem0-outage runbook. Don't add Mem0 grants and then debate the fallback.

---

## What happens in Phase 6B

You and the CEO sit together. Suggested order:

1. **Walk through Q1-Q10** (~45 minutes). Most answers are fast once you know the framing. Q4, Q7, and Q8 are the easiest. Q6 and Q9 need a quick gut check from you.
2. **Write the 21 agent bodies in 5 groups** (~60-90 minutes):
   - Group 1: Morning Digest + EOD Sync + Monday Standup + Friday Retro + Auto-Unblock — 5 Sonnet Routines with similar structure, vary inputs/outputs per agent
   - Group 2: Advisor + CTO Daily Plan + Synthesizer — 3 Opus Routines, heavier system prompts
   - Group 3: Competitor Pulse + GEO Signal + Content Idea Generator — 3 web-reading Routines
   - Group 4: 6 Workers — similar shape, each varies by tool grants and worktree isolation
   - Group 5: 4 Personas — short, each is a character definition

Total wall clock: 2-2.5 hours of focused conversation. CEO token cost: ~$8-12 of Opus.

---

## What happens after 6B

Phase 6C is mostly your clicks, with CEO running autonomously in the background:

- CEO refactors routing.ts to give each Routine its own entry point token (kills the shared-token blast radius that's been a known gap since WS4)
- CEO does the Q8 stale-entry cleanup and Q4 cron string change
- **Your clicks:** provision 10 Routines in the claude.ai console (copy/paste the system prompts CEO wrote in 6B)
- **Your terminal commands:** `wrangler secret put` for each new token (~20 commands, 5-10 minutes)
- CEO runs a smoke fire test on each Routine
- WS6 LOCKED

Estimated cost: ~$15-20 in CEO Opus tokens for the 6C autonomous work. Time for your clicks and provisioning: 2-4 hours, most of it waiting for claude.ai UI to respond.

---

## TL;DR

- Phase 6A swarm is done: 21 agent scaffolds + 4 research files + adversarial critique + synthesis. All bodies are empty placeholders waiting for 6B.
- Answer 10 decisions in 6B (45 min), then write 21 agent bodies in 5 groups (90 min). Total: ~2.5 hours with the CEO.
- After 6B: ~$15-20 in 6C autonomous work + 2-4 hours of your provisioning clicks → all 11 Routines live, per-Routine tokens split, war room fully autonomous.

---

*Source: `WS6-SYNTHESIS-AND-OPTIONS.md` + `CRITIQUE-WS6.md` + `.claude/agents/war-room/INDEX.md`. If this doc and the synthesis conflict, the synthesis wins.*
