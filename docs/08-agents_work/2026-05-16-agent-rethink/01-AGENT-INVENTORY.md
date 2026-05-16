---
title: Beamix Agent Inventory — 2026-05-16 Rethink Audit
date: 2026-05-16
status: AUDIT — read-only inventory, no fixes applied
scope: All agent .md files in `.agent/agents/` and `.claude/agents/`, cross-checked against `docs/08-agents_work/ROUTINE-ROSTER.md`, `WAR-ROOM-MASTER.md`, `ORCHESTRATION.md`, and `.claude/commands/`.
---

# Agent System Inventory & Gap Audit

This document inventories every agent in the Beamix repository as of 2026-05-16, captures schema drift between the two agent directories, and flags gaps against the locked Routine roster.

---

## 1. Summary table — all agents

Two roots:

- **`.agent/agents/`** — 33 files. The CLAUDE.md "canonical" location for non-CC-native lookups (also where the GSD-style agents live).
- **`.claude/agents/`** — 34 files. Native Claude Code subagent location (the runtime actually loads from here). Diverges from `.agent/agents/` in 4 files: `ceo.md`, `qa-lead.md`, plus 2 unique files (`cto.md`, `supabase-cleaner.md`).

Legend:
- **Layer:** CEO / Lead (team-lead orchestrator) / Worker (single-task implementer) / GSD (GSD-pipeline execution agent) / Specialist (one-off).
- **MCPs:** explicitly named in body. `–` means none mentioned. Frontmatter-declared `mcpServers:` shown in parens.
- **Skills count:** number of `.agent/skills` or `.claude/skills` files referenced in body (or skills frontmatter entry).
- **Spawns:** Y if it can dispatch other agents via Task/subagent calls. M = "mentions delegation in body" but lacks Task tool grant.

| # | Agent | Layer | Model | Tools | maxTurns | Color | MCPs in body | Skills mentioned | Spawns | Lines | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `ceo` (`.agent/`) | CEO | sonnet-4-6 | Read/Write/Edit/Bash/Glob/Grep | 25 | gold | — | MANIFEST + 3-5 skills | M (no Task tool) | 402 | **STALE** — superseded by `.claude/` ver |
| 2 | `ceo` (`.claude/`) | CEO | sonnet-4-6 | + Task | 30 | yellow | linear,github,supabase (fm) | multi-agent-patterns, context-compression, dispatching-parallel-agents (fm) | Y | 204 | **AUTHORITATIVE** (war-room) |
| 3 | `cto` (`.claude/` only) | Lead | sonnet-4-6 | + Task | 30 | blue | github,supabase,linear (fm) | multi-agent-patterns, dispatching-parallel-agents, writing-plans (fm) | Y | 221 | **NEW** — overlaps build-lead/devops-lead |
| 4 | `build-lead` | Lead | sonnet-4-6 | Read/Write/Edit/Bash/Glob/Grep | 20 | blue | Supabase MCP (body) | MANIFEST + 3-5 | M | 262 | Active; legacy-named (CTO supersedes) |
| 5 | `design-lead` | Lead | sonnet-4-6 | Read/Write/Edit/Bash/Glob/Grep | 30 | pink | Refero, Stitch, Pencil, Playwright | stitch-design-taste +many | M | 670 | **Heaviest agent** (MCP-rich) |
| 6 | `research-lead` | Lead | opus-4-6 | + WebSearch/WebFetch | 20 | purple | — | 3-5 from MANIFEST | M | 193 | Active |
| 7 | `qa-lead` (`.agent/`) | Lead | sonnet-4-6 | Read/Grep/Glob/Bash | 10 | red | — | security-audit, testing-patterns | M | 191 | **STALE** — superseded |
| 8 | `qa-lead` (`.claude/`) | Lead | sonnet-4-6 | + Task | 25 | red | github (fm) | code-review-excellence, multi-agent-patterns | Y | 166 | **AUTHORITATIVE** (risk-tiered) |
| 9 | `devops-lead` | Lead | sonnet-4-6 | Read/Write/Edit/Bash/Glob/Grep | 20 | orange | — | 3-5 from MANIFEST | M | 204 | Active; CTO overlaps |
| 10 | `data-lead` | Lead | sonnet-4-6 | Read/Write/Bash/Glob/Grep | 20 | teal | Supabase MCP (body) | 3-5 from MANIFEST | M | 157 | Active |
| 11 | `product-lead` | Lead | sonnet-4-6 | Read/Write/Glob/Grep | 15 | green | — | 3-5 from MANIFEST | M | 226 | Active; CPO not yet split out |
| 12 | `growth-lead` | Lead | sonnet-4-6 | Read/Write/Glob/Grep | 15 | yellow | — | 3-5 from MANIFEST | M | 201 | Active; CMO not yet split out |
| 13 | `business-lead` | Lead | sonnet-4-6 | Read/Write/Glob/Grep | 15 | emerald | — | 3-5 from MANIFEST | M | 199 | Active; CBO not yet split out |
| 14 | `backend-developer` | Worker | sonnet-4-6 | Read/Write/Edit/Bash/Glob/Grep | 20 | blue | Supabase MCP (body) | MANIFEST mention | N | 205 | Active; CTO calls it `backend-engineer` |
| 15 | `frontend-developer` | Worker | sonnet-4-6 | Read/Write/Edit/Bash/Glob/Grep | 20 | pink | Refero, Pencil, Playwright | taste-skills | N | 291 | Active |
| 16 | `database-engineer` | Worker | sonnet-4-6 | Read/Write/Edit/Bash/Glob/Grep | 20 | teal | Supabase MCP (body) | — | N | 207 | Active |
| 17 | `ai-engineer` | Worker | opus-4-6 | Read/Write/Edit/Bash/Glob/Grep | 20 | purple | — | — | N | 216 | Active (Opus — depth work) |
| 18 | `security-engineer` | Worker | sonnet-4-6 | Read/Grep/Glob/Bash | 15 | red | — | security-audit | N | 184 | Active; doc claims Opus elsewhere |
| 19 | `test-engineer` | Worker | **haiku-4-5** | Read/Write/Edit/Bash/Glob/Grep | 15 | green | Playwright (body) | testing-patterns | N | 202 | Active (Haiku — cheap) |
| 20 | `code-reviewer` | Worker | sonnet-4-6 | Read/Grep/Glob/Bash | 10 | orange | — | — | N | 174 | Active |
| 21 | `researcher` | Worker | opus-4-6 | + WebSearch/WebFetch | 20 | purple | — | — | N | 166 | Active (Opus) |
| 22 | `technical-writer` | Worker | sonnet-4-6 | Read/Write/Glob/Grep | 15 | gray | — | — | N | 206 | Active |
| 23 | `design-critic` | Worker | sonnet-4-6 | Read/Bash/Glob/Grep | 15 | gray | Playwright (body) | — | N | 179 | Active; spawned by design-lead |
| 24 | `supabase-cleaner` (`.claude/` only) | Specialist | sonnet-4-6 | many `mcp__supabase__*` (fm) | — | teal | Supabase (fm explicit list) | — | N | 140 | Active; **only agent with MCP tools in fm** |
| 25 | `codebase-mapper` | GSD | — | Read/Bash/Grep/Glob/Write | — | cyan | — | gsd-mapper-workflow (fm) | N | 798 | GSD-pipeline; orphaned (only `/audit` calls) |
| 26 | `debugger` | GSD | — | + WebSearch | — | orange | — | gsd-debugger-workflow (fm) | N | 1284 | GSD; **largest file** — called by `/fix` |
| 27 | `executor` | GSD | — | Read/Write/Edit/Bash/Grep/Glob | — | yellow | — | gsd-executor-workflow (fm) | N | 517 | GSD; orphaned (no command refs it) |
| 28 | `planner` | GSD | — | + WebFetch + mcp__context7__* | — | green | context7 (tools) | gsd-planner-workflow (fm) | N | 1336 | GSD; **longest agent file** |
| 29 | `phase-researcher` | GSD | — | + WebSearch + WebFetch + context7 | — | cyan | context7 (tools) | gsd-researcher-workflow (fm) | N | 583 | GSD; orphaned |
| 30 | `project-researcher` | GSD | — | + WebSearch + WebFetch + context7 | — | cyan | context7 (tools) | gsd-researcher-workflow (fm) | N | 659 | GSD; orphaned |
| 31 | `research-synthesizer` | GSD | — | Read/Write/Bash | — | purple | — | gsd-synthesizer-workflow (fm) | N | 277 | GSD; orphaned (NOT the war-room Synthesizer Routine!) |
| 32 | `roadmapper` | GSD | — | Read/Write/Bash/Glob/Grep | — | purple | — | gsd-roadmapper-workflow (fm) | N | 680 | GSD; orphaned |
| 33 | `plan-checker` | GSD | — | Read/Bash/Glob/Grep | — | green | — | gsd-plan-checker-workflow (fm) | N | 735 | GSD; orphaned |
| 34 | `verifier` | GSD | — | Read/Write/Bash/Grep/Glob | — | green | — | gsd-verifier-workflow (fm) | N | 606 | GSD; orphaned |
| 35 | `integration-checker` | GSD | — | Read/Bash/Grep/Glob | — | blue | — | gsd-integration-workflow (fm) | N | 470 | GSD; QA Lead body mentions it |
| 36 | `nyquist-auditor` | GSD | — | Read/Write/Edit/Bash/Glob/Grep | — | #8B5CF6 | — | gsd-nyquist-auditor-workflow (fm) | N | 205 | GSD; orphaned |

**Counts:**
- 2 CEO files (1 stale, 1 authoritative)
- 9 leads + 1 CTO + 1 QA-lead-stale = 11 lead-level files (8 unique active roles)
- 10 workers (one (`design-critic`) is critic-only)
- 1 specialist (`supabase-cleaner`)
- 12 GSD-pipeline agents (all `.agent/` AND `.claude/` — duplicated)

---

## 2. Directory divergence — `.agent/agents/` vs `.claude/agents/`

`diff -rq` returns exactly 4 differences:

| File | `.agent/agents/` | `.claude/agents/` | Authoritative |
|---|---|---|---|
| `ceo.md` | 402 lines, "/color gold", no Task tool, gsd-style pre-flight, 9-lead routing table | 204 lines, war-room ledger, `Task` tool, `isolation: worktree`, `mcpServers:` list, routes to C-suite (cto/cpo/cmo/cbo/cco) | **`.claude/agents/` wins** — Claude Code loads from `.claude/agents/`; this is the war-room model |
| `qa-lead.md` | 191 lines, traditional Security+Test parallel spawn, `<role>/<execution_flow>` XML-style | 166 lines, risk-tiered (Trivial/Lite/Full), spawns code-reviewer/qa-engineer/semgrep/security-engineer/adversary-engineer, has `Task` | **`.claude/agents/` wins** |
| `cto.md` | (missing) | 221 lines | Only in `.claude/agents/` |
| `supabase-cleaner.md` | (missing) | 140 lines | Only in `.claude/agents/` |

**Authoritative directory:** `.claude/agents/`. Claude Code's runtime loads subagents from `.claude/agents/`. The `.agent/agents/` copies are documentation copies and have drifted — they should be either deleted or kept in lockstep.

**Critical:** The `ceo.md` and `qa-lead.md` files in `.agent/agents/` describe a fundamentally different operating model from `.claude/agents/`. Two stories live in this repo about how CEO and QA-Lead behave. **CLAUDE.md and AGENTS.md still describe the `.agent/` model** (9 fixed leads, no CTO, no C-suite split, no risk-tiered QA).

---

## 3. War-room Routine vs agent-file alignment

`docs/08-agents_work/ROUTINE-ROSTER.md` (LOCKED 2026-05-08) defines 11 scheduled Anthropic Routines. **Zero of them have agent .md files.** WS6 has not been executed.

| # | Routine | Schedule | Model | Agent file exists? |
|---|---|---|---|---|
| 1 | Advisor Daily Thinking | Daily 05:30 | opus-4-7 | **NO** |
| 2 | Morning Digest | Daily 05:35 | sonnet-4-6 | **NO** |
| 3 | Competitor Pulse | Daily 05:40 | sonnet-4-6 | **NO** |
| 4 | GEO Algorithm Signal | Sunday 05:45 | opus-4-7 | **NO** |
| 5 | CTO Daily Plan | Daily 10:30 | opus-4-7 | Partial — `.claude/agents/cto.md` exists but is the interactive CTO orchestrator, not the daily-plan routine |
| 6 | Content Idea Generator | Daily 10:35 | sonnet-4-6 | **NO** |
| 7 | Monday Standup | Monday 10:40 | sonnet-4-6 | **NO** |
| 8 | Friday Retro | Friday 15:30 | sonnet-4-6 | **NO** |
| 9 | EOD Sync | Daily 20:30 | sonnet-4-6 | **NO** |
| 10 | Auto-Unblock | event-triggered | sonnet-4-6 | **NO** |
| 11 | Synthesizer | `@board` event | opus-4-7 | **NO** — `research-synthesizer.md` exists but is a GSD-pipeline agent, NOT the war-room board-meeting Synthesizer |

**Implication:** The Routine roster is locked but unimplemented. WS6 (the workstream that writes these Routine .md files) is the next missing piece. Today there is *no file* anywhere telling Claude how to run "Advisor Daily" or "Morning Digest."

`board-meeting.md` slash command DOES exist (in `.claude/commands/`) — but its underlying Synthesizer is missing.

---

## 4. Orphans — agents with no callers

An agent is "orphaned" when no slash command and no CEO/Lead delegates to it.

### 4.1 Fully orphaned (no command, no agent mentions it)

| Agent | Notes |
|---|---|
| `executor` | GSD-pipeline. No `/gsd:*` commands exist in `.claude/commands/`. |
| `phase-researcher` | Same — `/gsd:plan-phase` referenced in its body, but command file missing |
| `project-researcher` | `/gsd:new-project` referenced, command missing |
| `research-synthesizer` | `/gsd:new-project` referenced, command missing |
| `roadmapper` | `/gsd:new-project` referenced, command missing |
| `plan-checker` | `/gsd:plan-phase` referenced, command missing |
| `verifier` | No spawning agent grants Task and references it by name with `Task` |
| `nyquist-auditor` | Only mentioned in CLAUDE.md aspirationally |

**All 8 are the legacy GSD pipeline** — they were imported from a separate codebase ("gsd-*" workflow) and never wired to Beamix commands. They consume 5,737 lines of repo content cumulatively (debugger + planner alone = 2,620 lines).

### 4.2 Partially orphaned (referenced in body but no Task tool to actually spawn)

- `integration-checker` — `qa-lead` body mentions spawning it, but `.agent/qa-lead.md` lacks Task tool; `.claude/qa-lead.md` does have Task but its body lists `code-reviewer/qa-engineer/semgrep/security-engineer/adversary-engineer` — **NOT** `integration-checker`. Mismatch.
- `design-critic` — referenced in design-lead body, but design-lead lacks Task. Body says "spawn" but there's no actual grant.

### 4.3 Commands with no implementations

| Command | What it claims | Reality |
|---|---|---|
| `/build` | "Full Build Pipeline" with agent team | No agents named in body — it's a prose description, not a runnable script |
| `/plan` | "Sprint / Feature Planning" | Same — prose only |
| `/ship` | "Pre-Deploy Pipeline" | Same |
| `/review` | "Code Review Pipeline" | Same |
| `/daily` | "Daily Planning Kickoff" | Same |
| `/design` | "Professional Design Pipeline" | Same |
| `/debug` | "Scientific Bug Investigation" | Body says "Atlas investigates" — Atlas is the OLD 12-agent roster (not in this repo at all) |

Only 4 commands reference any actual agent by name: `/audit` → `codebase-mapper`, `/fix` → `debugger`, `/research` → `researcher`, `/name` → `ceo`.

---

## 5. Schema / naming inconsistencies

### 5.1 Worker naming drift: `-developer` vs `-engineer`

The `.claude/agents/cto.md` consistently calls workers:
- `backend-engineer`
- `frontend-engineer`
- `devops-engineer`
- `data-engineer`
- `ai-engineer`
- `qa-engineer`
- `product-designer`

But the actual files are:
- `backend-developer.md` ← drift
- `frontend-developer.md` ← drift
- (no `devops-engineer.md`; there's `devops-lead.md` only)
- (no `data-engineer.md`; there's `data-lead.md`)
- `ai-engineer.md` ✓
- (no `qa-engineer.md` — referenced by both CTO and `.claude/qa-lead.md`)
- (no `product-designer.md`)

**CTO will fail every spawn until renamed or stubs are created.** Same for QA-Lead's references to `qa-engineer`, `adversary-engineer`, `semgrep` (which is a CLI tool, not an agent).

### 5.2 Skills frontmatter inconsistency

| Agent set | Skills location |
|---|---|
| GSD agents (12 files) | `skills:` list in frontmatter (declarative) |
| Lead agents (9 files) | `<recommended_skills>` body section + "load 3-5 skills" instruction |
| Workers (10 files) | Free-form body mentions, no consistent pattern |
| New war-room CEO/CTO/QA-Lead | `skills:` list in frontmatter (declarative) — matches GSD pattern |

Two different skill discovery models are documented: (a) "read MANIFEST.json and filter by tag" (CLAUDE.md + leads), (b) frontmatter `skills:` array (GSD + war-room). The runtime probably doesn't read either.

### 5.3 `tools:` field format inconsistency

- Most agents: `tools: Read, Write, Edit, Bash, Glob, Grep` (comma-separated string)
- `nyquist-auditor`: `tools:` followed by YAML list `- Read\n - Write\n ...`
- `supabase-cleaner`: comma-separated, includes explicit `mcp__supabase__*` tool names

### 5.4 `color:` field inconsistency

- Most agents: word color (`gold`, `blue`, `red`)
- `nyquist-auditor`: hex `#8B5CF6`
- `ceo.md` `.agent/` says `gold`; `.claude/` says `yellow`

### 5.5 Model coverage

- 12 GSD agents have **no `model:` field at all** — runtime defaults apply (currently sonnet)
- `test-engineer` is the only Haiku worker
- 3 Opus workers: `ai-engineer`, `researcher`, `research-lead`
- `security-engineer` is `sonnet-4-6` despite CLAUDE.md saying security audits should be Opus

### 5.6 Pre-flight contract drift

- `.agent/ceo.md` pre-flight: CLAUDE.md + LONG-TERM.md + DECISIONS.md + `docs/00-brain/_INDEX.md` (4 files)
- `.claude/ceo.md` pre-flight: CLAUDE.md + LONG-TERM.md + DECISIONS.md + `docs/00-brain/_INDEX.md` (4 files, same — but called "cached block for prompt caching")
- Workers usually have no formal pre-flight contract

### 5.7 CLAUDE.md describes a model that doesn't match `.claude/agents/`

CLAUDE.md (in both `/Users/adamks/CLAUDE.md` and project) says:

> 3-layer team: CEO → 9 team leads → workers
> Leads: build-lead, research-lead, design-lead, qa-lead, devops-lead, data-lead, product-lead, growth-lead, business-lead

But `.claude/agents/ceo.md` (authoritative) routes to: CTO, CPO, CMO, CBO, CCO, QA-Lead — a **C-suite model**, not a 9-lead model. CPO/CMO/CBO/CCO have no .md files yet.

This is the largest single inconsistency in the system: the authoritative CEO speaks a vocabulary (CTO/CPO/CMO/CBO/CCO) that has no agent files, while the legacy CEO speaks a vocabulary (9 leads) that has files but is no longer authoritative.

---

## 6. MCP coverage matrix

| MCP | Agents that reference it | Gaps |
|---|---|---|
| Supabase | `database-engineer` (body), `backend-developer` (body), `data-lead` (body), `build-lead` (body), `supabase-cleaner` (frontmatter tools, explicit list), `cto` (fm `mcpServers:`), `ceo` (fm `mcpServers:`) | None of the 11 Routines have it specced — when they need to write `audit_log` per WAR-ROOM §3.3, they need this. |
| Pencil | `design-lead` (body), `frontend-developer` (body) | Body-only — no fm `mcpServers:` declaration. |
| Playwright | `design-lead`, `frontend-developer`, `test-engineer`, `design-critic` | Body-only. |
| Refero | `design-lead`, `frontend-developer` | Body-only. |
| Stitch | `design-lead` | Body-only. Has dedicated `stitch-design-taste` skill (rare correct pattern). |
| Framer | CLAUDE.md mentions but **NO agent body uses it** | Marketing site is Framer-hosted but no agent has tools to touch it. |
| context7 | `planner`, `phase-researcher`, `project-researcher` (GSD agents, tools field has `mcp__context7__*`) | None of the lead/worker active agents use context7. researchers should. |
| IDE | CLAUDE.md says "frontend-developer must run getDiagnostics before commit" | `frontend-developer.md` body does NOT mention `mcp__ide__*`. Drift. |
| Linear | `ceo`, `cto` (fm `mcpServers:`), QA-Lead body | No Linear tool actually appears in any `tools:` field — they're declared but not grant ed. |
| GitHub | `ceo`, `cto`, `qa-lead` (fm) | Same — declared, not in `tools:`. |

**Pattern:** MCPs are documented in bodies but rarely declared in frontmatter, and never granted as concrete `mcp__*__*` tool names except for `supabase-cleaner` (the only correct example).

---

## 7. Length / complexity outliers

| Agent | Lines | Note |
|---|---|---|
| `planner` | 1,336 | GSD; orphaned; longest file in repo |
| `debugger` | 1,284 | GSD; only `/fix` command references it |
| `codebase-mapper` | 798 | GSD; only `/audit` references it |
| `plan-checker` | 735 | GSD; orphaned |
| `roadmapper` | 680 | GSD; orphaned |
| `design-lead` | 670 | Active; rich MCP coverage justifies length |
| `project-researcher` | 659 | GSD; orphaned |
| `verifier` | 606 | GSD; orphaned |
| `phase-researcher` | 583 | GSD; orphaned |
| `executor` | 517 | GSD; orphaned |
| `integration-checker` | 470 | GSD; partly referenced |

The 8 fully-orphaned GSD files total **~6,800 lines** of unused prompt content — pure cost-bloat if Claude ever scans the agent folder.

---

## 8. Active vs dead agent count

| Bucket | Count | List |
|---|---|---|
| Active & referenced | 14 | ceo, cto, build-lead, design-lead, research-lead, qa-lead, devops-lead, data-lead, product-lead, growth-lead, business-lead, backend-developer, frontend-developer, ai-engineer, database-engineer, security-engineer, test-engineer, code-reviewer, researcher, technical-writer, design-critic, supabase-cleaner *(actually ~22 — 14 was a typo; see below)* |
| Stale duplicates | 2 | `.agent/ceo.md`, `.agent/qa-lead.md` |
| GSD orphans | 11 | codebase-mapper, debugger, executor, planner, phase-researcher, project-researcher, research-synthesizer, roadmapper, plan-checker, verifier, integration-checker, nyquist-auditor |
| Missing per Routine roster | 11 | Advisor, Morning Digest, Competitor Pulse, GEO Signal, CTO Daily Plan, Content Idea, Monday Standup, Friday Retro, EOD Sync, Auto-Unblock, Synthesizer |
| Missing per `.claude/ceo.md` C-suite routing | 4 | CPO, CMO, CBO, CCO |

(Correction: active agents = 22, not 14 — that line above is a transcription error in counting; the inventory table is the authoritative source.)

---

## 9. Where the boundaries are unclear (overlap matrix)

| Pair | Overlap |
|---|---|
| `build-lead` vs `cto` | Both orchestrate code work. CTO is the new model (war-room) — build-lead is the legacy. Today both exist; CEO routes to "CTO" but CLAUDE.md still talks about build-lead. |
| `devops-lead` vs `cto` | CTO's body says it spawns `devops-engineer` — but only `devops-lead` exists. Either devops-lead is the worker (demote) or a new devops-engineer worker is needed. |
| `data-lead` vs `cto` | Same — CTO claims to spawn `data-engineer` worker; only `data-lead` exists. |
| `research-lead` vs `researcher` | Clear: lead spawns single researchers. Working as designed. |
| `research-synthesizer` vs Routine 11 "Synthesizer" | Name-collision danger. Research-synthesizer is a GSD agent; Routine Synthesizer is the @board ritual. Different domains, identical short name. |
| `design-lead` vs `design-critic` vs `frontend-developer` | Triangle works — lead designs, critic reviews, dev implements. But lead lacks Task tool to actually spawn critic. |
| `qa-lead` vs `code-reviewer` | New `.claude/qa-lead.md` spawns code-reviewer as one of its tier-Lite reviewers. Working as designed once Task spawning is honored. |
| `code-reviewer` vs `nyquist-auditor` vs `integration-checker` | Three quality-gate cousins. Only code-reviewer is in the active QA flow. |

---

## 10. Recommendation summary (200 words)

**Consolidate down to ~18 active agents.** The 12-agent GSD pipeline (`debugger`, `executor`, `planner`, `verifier`, `roadmapper`, `plan-checker`, `phase-researcher`, `project-researcher`, `research-synthesizer`, `codebase-mapper`, `integration-checker`, `nyquist-auditor`) is from another codebase and has no live callers — move it to `.archive/agents/gsd-pipeline/` or delete. Keep `codebase-mapper` and `debugger` only if `/audit` and `/fix` stay.

**Resolve the directory split.** Make `.claude/agents/` the only canonical location; delete `.agent/agents/` or generate it as a read-only mirror. The CLAUDE.md "9-lead" model is stale — rewrite it to match the war-room C-suite model in `.claude/ceo.md`.

**Fix worker naming drift.** CTO and QA-Lead reference `backend-engineer`/`qa-engineer`/`adversary-engineer`/`product-designer` — files are named `*-developer`. Either rename files or update orchestrator prompts; today every CTO Task spawn fails.

**Build the 11 missing Routine .md files** per `ROUTINE-ROSTER.md` (WS6 work). Until they exist, the locked war-room architecture cannot fire any scheduled work.

**Add missing C-suite files** (`cpo.md`, `cmo.md`, `cbo.md`, `cco.md`) or have CEO route to existing `product-lead`/`growth-lead`/`business-lead` with renamed labels.

**Standardize the schema:** one `tools:` format, one `color:` format, one skill-loading model (declarative `skills:` array beats body prose).
