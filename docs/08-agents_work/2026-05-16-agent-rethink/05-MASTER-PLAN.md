---
title: Beamix Agent Rethink — Master Plan
date: 2026-05-16
status: PLAN (no files edited; execution deferred to follow-up sessions)
inputs:
  - 01-AGENT-INVENTORY.md (current state of 36 agent .md files)
  - 02-SKILLS-AUDIT.md (430 skills → ~110 keep, 305 cut)
  - 03-EXTERNAL-RESEARCH.md (Anthropic cookbook, disler hooks, Agent Teams, ComposioHQ, Promptfoo)
  - 04-QA-QUALITY-RESEARCH.md (4-tier risk matrix, evaluator-optimizer, multi-judge)
  - docs/08-agents_work/WAR-ROOM-MASTER.md (locked architecture)
  - docs/08-agents_work/ROUTINE-ROSTER.md (11 standing Routines)
locked_decisions:
  identity_model: C-suite (CEO → CTO/CPO/CMO/CBO/CCO + QA-Lead + Research-Lead)
  reuse_scope: Beamix-specific now; generalize later
  session_scope: Deep plan only — no file edits
  qa_model: 4-tier risk gating (Trivial / Lite / Full / Irreversible)
audience: future Adam, future CEO/CTO/lead agents, the eventual executor of this plan
read_time: 45-60 minutes
---

# Beamix Agent Rethink — Master Plan

> **One-line summary:** Reorganize Beamix's 36-file agent system into a focused 19-agent C-suite company with 11 scheduled Routines, a 4-tier QA gate, deterministic hooks, evaluator-optimizer loops, and a 110-skill curated library — production-grade, billion-dollar-feel, billion-dollar-quality.

This document is the single read-once source of truth for the rebuild. It folds 4 research streams into a concrete, file-by-file plan: every agent's prompt structure, tools, MCPs, skills, QA gate, return contract, and integration with Linear/GitHub/Mem0/Supabase. Execution happens in separate sessions; this is the spec.

---

## Table of contents

1. [Locked decisions & guiding principles](#1-locked-decisions)
2. [Target organization chart](#2-target-org)
3. [Per-agent specifications](#3-per-agent-specs)
4. [4-tier QA gate system](#4-qa-tiers)
5. [Memory & shared-state architecture](#5-memory)
6. [Integration patterns (Linear, GitHub, Mem0, Supabase, MCPs)](#6-integrations)
7. [Skills library — final list](#7-skills)
8. [Cleanup workstream](#8-cleanup)
9. [Implementation phases](#9-phases)
10. [Production-readiness checklist](#10-prod-ready)
11. [Open questions & future decisions](#11-open)

---

<a id="1-locked-decisions"></a>
## 1. Locked decisions & guiding principles

### 1.1 Adam's 4 locked decisions (2026-05-16)

| # | Decision | Implication |
|---|---|---|
| **D1** | **C-suite identity** — CEO → CTO/CPO/CMO/CBO/CCO + QA-Lead + Research-Lead | The runtime CEO already routes to this vocabulary; the legacy 9-lead model is retired. Need to author 4 new C-suite files (CPO/CMO/CBO/CCO) and either rename or repurpose 5 existing leads (product/growth/business/devops/data). |
| **D2** | **Beamix-specific now, generalize later** | Agent prompts hardcode Beamix stack (Next.js 16, Supabase, Paddle, Mem0, beamixai.com, Israeli-first dual HE+EN). When onboarding the next project, refactor into a `PROJECT.md` overlay. |
| **D3** | **Deep plan only this session** | Zero file edits during this CEO session. The plan is committed as a doc; execution is delegated to future Build Lead / CTO sessions in phases. |
| **D4** | **4-tier risk gating** — Trivial / Lite / Full / Irreversible | Auto-assigned by a Haiku classifier at the bridge OR by Linear label `tier:*`. Each tier has a concrete checklist; Irreversible requires multi-judge + human sign-off. |

### 1.2 Guiding principles (these override individual choices below)

| # | Principle | Source |
|---|---|---|
| **P1** | **Orchestrator = Ledger.** The CEO and C-suite track state, spawn agents, synthesize returns. They never implement. Workers implement. | Anthropic multi-agent research system (worker-orchestrator pattern, 90%+ improvement vs single-agent) |
| **P2** | **Tokens = quality.** Token consumption explains 80% of task success variance. Budget tokens, not turns. Don't compress prompts that drive thinking. | Anthropic engineering blog |
| **P3** | **98.4% infrastructure / 1.6% AI.** Invest most engineering effort in deterministic gates, recovery, routing — not bigger prompts. | VILA-Lab Dive-into-Claude-Code |
| **P4** | **Different model for judge vs generator.** Never let an agent grade its own output. Cross-provider (or cross-family) judge eliminates self-preference bias. | arXiv 2410.21819 |
| **P5** | **Goal-backward verification.** Verify "did it achieve the intent" not just "did tests pass." Every QA pass infers intent → checks state change → checks tests. | Anthropic Cookbook evaluator pattern |
| **P6** | **Decision immutability.** DECISIONS.md is append-only with explicit `supersedes` markers. Agents read decisions before acting; they never silently overwrite. | War-room MEMORY-DECISION-MATRIX.md |
| **P7** | **Workers spawn nothing.** Anti-bureaucracy. If a worker thinks it needs to delegate, it returns `PARTIAL` with `needs_followup`. The parent decides. | ORCHESTRATION.md §2A (platform-enforced — Claude Code subagents can't spawn subagents) |
| **P8** | **Typed handoff, not conversation forwarding.** Agents exchange 200-500 token JSON specs. Receiving agent reads files for context. Saves 70-90% of handoff token cost. | Anthropic Cookbook + disler observability |
| **P9** | **Worktree isolation by default.** Every code worker spawns in `isolation: worktree`. No shared mutable state during execution. | ORCHESTRATION.md §2B |
| **P10** | **Billion-dollar quality bar.** Stripe/Linear/Apple/Anthropic-grade craft. Every space, button, comma intentional. The agents' outputs must read as if written by a senior IC, not "AI assistance." | MEMORY.md `project_quality_bar_billion_dollar.md` |
| **P11** | **No human-in-the-loop for trivial.** Quality gates auto-approve Trivial-tier work. Humans are reserved for Full and Irreversible decisions. | 04-QA-QUALITY-RESEARCH |
| **P12** | **Skills load on demand.** No agent preloads more than 3-5 skills. Workers load 2-3. Manifest filtering by tag is the discovery path. | CLAUDE.md context discipline rules |

### 1.3 What we explicitly REJECT

- **n8n / Zapier / Make.com orchestration.** Direct LLM API + Inngest + Anthropic Routines. No middleware.
- **Stripe.** Paddle only.
- **LangChain / LangGraph.** Direct Anthropic SDK + Inngest for durability. (Skills referencing these are cut.)
- **CrewAI / AutoGen-the-product.** Too heavy for our runtime; we adopt patterns, not the framework.
- **Self-evaluation.** No agent grades its own work.
- **Subagent recursion.** Workers don't spawn workers. CEO doesn't spawn CEO.
- **24/7 cloud OAuth on subscription.** Routines use sanctioned Anthropic `/fire` with per-Routine bearer tokens; non-Routine cloud code uses `ANTHROPIC_API_KEY` (Console billing).

---

<a id="2-target-org"></a>
## 2. Target organization chart

### 2.1 Final roster (19 agents + 11 Routines)

```
┌────────────────────────────────────────────────────────────────────────┐
│                          LAYER 1 — ENTRY                                │
│                                                                         │
│  CEO  (interactive, Adam-driven Claude Code session OR Linear webhook)  │
│        model: opus-4-7  ·  tools: +Task  ·  color: gold                 │
└────────────────────────────────────────────────────────────────────────┘
                                    │
              ┌────────────┬────────┼────────┬────────────┬─────────────┐
              ▼            ▼        ▼        ▼            ▼             ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       LAYER 2 — C-SUITE                                 │
│                                                                         │
│  CTO          CPO         CMO        CBO          CCO        QA-Lead   │
│  (engineer)   (product)   (growth)   (business)   (customer)  (quality)│
│  Research-Lead  ·  Design-Lead  (also Layer-2)                          │
│  model: sonnet-4-6 default · QA-Lead may upgrade to opus on Full tier  │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       LAYER 3 — WORKERS                                 │
│                                                                         │
│  backend-engineer   frontend-engineer   database-engineer               │
│  devops-engineer    data-engineer       ai-engineer                     │
│  security-engineer  test-engineer       qa-engineer (test author)       │
│  code-reviewer      researcher          technical-writer                │
│  product-designer   design-critic       adversary-engineer              │
│  supabase-cleaner (specialist, retained as-is)                          │
│                                                                         │
│  Workers spawn NOTHING. Single-file edits. Worktree isolation.          │
│  Default Sonnet · Haiku for test-engineer/qa-engineer · Opus for       │
│  security-engineer (Full tier), researcher, ai-engineer                │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                LAYER 4 — STANDING ROUTINES (war room, scheduled)        │
│                                                                         │
│  Daily 05:30 (W1)                                                       │
│   - Advisor Daily Thinking  (Opus)                                      │
│   - Morning Digest          (Sonnet)                                    │
│   - Competitor Pulse        (Sonnet)                                    │
│   - GEO Algorithm Signal    (Opus, Sundays)                             │
│  Daily 10:30 (W2)                                                       │
│   - CTO Daily Plan          (Opus)                                      │
│   - Content Idea Generator  (Sonnet)                                    │
│   - Monday Standup          (Sonnet, Mondays)                           │
│  Daily 15:30 (W3)                                                       │
│   - Friday Retro            (Sonnet, Fridays)                           │
│  Daily 20:30 (W4)                                                       │
│   - EOD Sync                (Sonnet)                                    │
│  Event-triggered                                                        │
│   - Auto-Unblock            (Sonnet, fires on Routine timeout)          │
│   - Synthesizer             (Opus, fires on board-meeting Round 3)      │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                LAYER 5 — BOARD PERSONAS (on-demand, board meetings)     │
│                                                                         │
│  Visionary · Strategist · Architect · Risk-Modeler                      │
│  Customer-Voice · Adversary (branched: Aria for vendor, broad for       │
│  strategic) · Synthesizer                                               │
│                                                                         │
│  These are persona .md files, not standing agents. Spawned by `/board-  │
│  meeting <topic>` command. Round 0/1/2/3 protocol.                      │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.2 What this replaces

| Was | Will be | Action |
|---|---|---|
| `.agent/agents/ceo.md` (402 lines, 9-lead model) | `.claude/agents/ceo.md` (the existing 204-line C-suite version, refined) | **Delete `.agent/agents/ceo.md`** — keep only `.claude/agents/ceo.md` as canonical |
| `.agent/agents/qa-lead.md` (191 lines, traditional QA) | `.claude/agents/qa-lead.md` (166 lines, risk-tiered) | **Delete `.agent/agents/qa-lead.md`** |
| `build-lead`, `devops-lead`, `data-lead` | All three merge under **CTO**. build-lead is retired; devops-lead and data-lead are demoted to workers (`devops-engineer`, `data-engineer`) | **Author** `cpo.md`, `cmo.md`, `cbo.md`, `cco.md`; **rename** `devops-lead.md` → `devops-engineer.md` worker; **rename** `data-lead.md` → `data-engineer.md` worker; **archive** `build-lead.md` (its content folds into CTO) |
| `product-lead`, `growth-lead`, `business-lead` | Folded under **CPO**, **CMO**, **CBO** respectively | **Author** the C-suite versions; **archive** the lead versions to `.archive/agents/` for reference |
| `design-lead` (670 lines, MCP-rich) | **Kept** as design-lead — already excellent. Reports to CPO. | Keep, refine to follow new schema (frontmatter, return contract) |
| `research-lead` | **Kept** as Research-Lead reporting directly to CEO (cross-cutting) | Keep, schema cleanup only |
| 12 GSD agents (planner, executor, debugger, verifier, roadmapper, etc.) | **Archived** to `.archive/agents/gsd-pipeline/` | The only retained-in-place is `debugger` (referenced by `/fix` command) and `codebase-mapper` (referenced by `/audit`). All other 10 → archive. |
| `backend-developer`, `frontend-developer` | Renamed to `backend-engineer`, `frontend-engineer` | Match CTO's vocabulary; update all references |
| 11 missing Routines | **Author** all 11 .md files at `.claude/agents/_routines/` | New work (WS6) |
| 4 missing C-suite | **Author** all 4 .md files at `.claude/agents/` | New work |
| 6 board personas | **Author** all 6 .md files at `.claude/agents/_personas/` | New work |
| `supabase-cleaner` | **Keep** — only correctly-modeled specialist in the repo | No changes |

### 2.3 Final inventory at the end of the rebuild

| Category | Count | Files |
|---|---|---|
| Interactive C-suite | 7 | ceo, cto, cpo, cmo, cbo, cco, qa-lead |
| Cross-cutting leads | 2 | research-lead, design-lead |
| Workers | 15 | backend-engineer, frontend-engineer, database-engineer, devops-engineer, data-engineer, ai-engineer, security-engineer, test-engineer, qa-engineer, code-reviewer, adversary-engineer, researcher, technical-writer, product-designer, design-critic |
| Specialists | 1 | supabase-cleaner |
| Standing Routines | 11 | advisor-daily-thinking, morning-digest, competitor-pulse, geo-algorithm-signal, cto-daily-plan, content-idea-generator, monday-standup, friday-retro, eod-sync, auto-unblock, synthesizer |
| Board personas | 7 | visionary, strategist, architect, risk-modeler, customer-voice, aria, broad-adversary |
| Legacy retained for commands | 2 | debugger (referenced by /fix), codebase-mapper (referenced by /audit) |
| **Total** | **45 files** | (vs current 36, +9 net; but with 305 skills cut, repo bytes go DOWN by ~75%) |

---

<a id="3-per-agent-specs"></a>
## 3. Per-agent specifications

This section specifies every agent in the new roster: identity, mission, model, tools, MCPs, skills, flow, QA gate, return contract, escalation, anti-patterns. Each spec is the complete brief for whoever writes the .md file in the execution phase.

### 3.1 Shared schema (apply to every agent .md)

All 45 files use this **identical frontmatter schema** (this is the standardization fix from the inventory):

```yaml
---
name: <kebab-case>
description: <one-sentence — when to use this agent>
when_to_use: |
  Bullet list of triggers. Be specific.
  Avoid: <when NOT to use this agent>
model: claude-opus-4-7 | claude-sonnet-4-6 | claude-haiku-4-5
tools: [Read, Write, Edit, Bash, Glob, Grep, Task, WebSearch, WebFetch]  # explicit list, not comma-string
maxTurns: 15 | 20 | 25 | 30
color: <named color from CLAUDE.md table>
isolation: worktree | none
mcpServers:                # MCPs the agent is allowed to call
  - linear
  - github
  - supabase
  - mem0
  - pgvector
  - playwright
  - context7
skills:                    # 2-3 for workers, 3-5 for leads/CEO
  - <skill-name>
  - <skill-name>
risk_tier_default: trivial | lite | full | irreversible    # default tier for this agent's outputs
escalates_to: <agent-name> | adam
escalates_when: |
  - condition 1
  - condition 2
return_contract:           # JSON shape this agent always returns
  required_fields: [status, summary, ...]
  optional_fields: [...]
---
```

All bodies follow this **standardized 8-section structure**:

```
# <Agent Name> — <Tagline>

## Identity & mission       (who you are, one paragraph)
## Workflow position        (table: After / Complements / Enables)
## Key distinctions         (vs adjacent agents — bullet list)
## Pre-flight reads         (numbered list of files; cache as single block)
## Operating procedure      (numbered steps for a typical task)
## QA gate hand-off         (when/how to spawn QA Lead)
## Memory updates           (what to write to which file)
## Return contract          (JSON shape with example)
## Anti-patterns            (do-not-do list)
## Failure budget           (max retries, max turns, escalation triggers)
```

This structure is enforced by `qa-lead-pass.yml` — any new agent file failing schema lint is rejected at PR time.

---

### 3.2 CEO (Layer 1)

| Field | Value |
|---|---|
| **File** | `.claude/agents/ceo.md` |
| **Identity** | The orchestrator-ledger. Entry point for every Linear ticket, Telegram DM to bot, and any Adam request not routed to a specific C-suite. |
| **Mission** | Understand the request → assemble the right team → delegate via structured briefs → synthesize returns → post one Linear comment. **Never implements.** |
| **Model** | `claude-opus-4-7` (upgraded from Sonnet — Anthropic data shows orchestrators benefit most from Opus; this is the only Layer-1 agent so cost is bounded) |
| **Tools** | `Read, Write, Edit, Bash, Glob, Grep, Task` |
| **maxTurns** | 30 |
| **MCPs** | `linear, github, supabase, mem0, pgvector` |
| **Skills (3-5)** | `multi-agent-patterns, dispatching-parallel-agents, context-compression, brainstorming, architecture-decision-records` |
| **Default risk tier** | Routes; doesn't classify (CTO classifies for code work) |
| **Pre-flight** | 1. `CLAUDE.md`<br>2. `.claude/memory/LONG-TERM.md`<br>3. `.claude/memory/DECISIONS.md` (last 10 entries; search if a prior decision is referenced)<br>4. `docs/00-brain/_INDEX.md`<br>5. The Linear ticket via `mcp__linear__get_issue`<br>**Cache all 5 as one block** for prompt caching. |
| **Routing matrix** | See §3.2.1 below |
| **QA gate** | CEO never merges. After C-suite returns COMPLETE, CEO verifies `qa_verdict: PASS` is in the return JSON. If missing, re-brief once; if still missing, escalate. |
| **Memory writes** | Linear comment (synthesis only), session file at `docs/08-agents_work/sessions/YYYY-MM-DD-ceo-<slug>.md`, DECISIONS.md (architectural only), `docs/00-brain/log.md` one-liner, AUDIT_LOG.md after merges. |
| **Return contract** | `status, agent, linear_ticket, branches[], files_changed[], agents_spawned[], qa_verdict, summary, decisions_made[], blockers[], session_file, tokens_used_approx, cost_usd_approx` |
| **Escalates to** | Adam (Telegram L3 binary-ping) |
| **Escalates when** | C-suite BLOCKED 3× after re-brief · `risk:irreversible` label · cost >$10 on single ticket · 3 self-resolution attempts |
| **Anti-patterns** | Spawning workers directly (always go through C-suite) · writing code · re-reading files in context · pasting raw agent output to Adam · spawning another CEO |
| **Failure budget** | Max 3 retries per BLOCKED C-suite return · max 30 turns total · binary escalation format only |

#### 3.2.1 CEO routing matrix (locked)

| Ticket signal / label | Route to | Tier hint |
|---|---|---|
| `agent:cto` OR code/infra/migrations/`apps/web/src/` | CTO | CTO classifies |
| `agent:cpo` OR PRD / spec / roadmap / prioritization | CPO | Lite by default |
| `agent:cmo` OR content / SEO / GEO / copy / campaigns | CMO | Lite by default |
| `agent:cbo` OR pricing / finance / legal / compliance / hiring | CBO | Full (touches business decisions) |
| `agent:cco` OR support / onboarding / retention | CCO | Lite |
| `agent:qa-lead` OR security audit / red-team / pre-deploy | QA-Lead directly | Full minimum |
| `agent:research-lead` OR competitive / market / tech eval | Research-Lead | Lite |
| `board-meeting` label OR strategic question | `/board-meeting` 4-round protocol | Irreversible (Adam-veto required) |
| Cross-functional (e.g., "ship a paywall change") | Multiple parallel — spawn CTO + CPO + CBO in single message | Each tier-classifies own piece |
| Bug fix / debugging (any) | CTO (CTO spawns `debugger` worker via Task) | Lite or Full per CTO classification |

---

### 3.3 CTO (Layer 2)

| Field | Value |
|---|---|
| **File** | `.claude/agents/cto.md` |
| **Identity** | Engineering chief. Owns all code, infrastructure, technical-architecture work. **Orchestrates engineering workers; never implements.** |
| **Mission** | Receive feature/bug brief → decompose into the smallest set of independently-mergeable worker tasks → assign workers (parallel by default) → classify risk tier → spawn QA-Lead → return synthesized result. |
| **Model** | `claude-sonnet-4-6` (Opus for Daily Plan Routine, Sonnet for interactive) |
| **Tools** | `Read, Write, Edit, Bash, Glob, Grep, Task` |
| **maxTurns** | 30 |
| **MCPs** | `github, supabase, linear, context7` (for library docs lookup) |
| **Skills (3-5)** | `multi-agent-patterns, dispatching-parallel-agents, writing-plans, architecture-patterns, context-compression` |
| **Default risk tier** | Classifies on entry — see §4 |
| **Pre-flight** | 1. `CLAUDE.md` · 2. `docs/00-brain/MOC-Architecture.md` + `MOC-Codebase.md` · 3. `docs/ENGINEERING_PRINCIPLES.md` · 4. `.claude/memory/DECISIONS.md` (last 10) · 5. Linear ticket (`mcp__linear__get_issue`) · 6. **Glob + Grep** the relevant code area (do NOT read full files unless necessary) |
| **Worker matrix** | See §3.3.1 |
| **QA gate** | Hard gate. CTO MUST spawn QA-Lead after workers return. CTO returns `qa_verdict: PASS` to CEO; can never return COMPLETE without it. |
| **Memory writes** | Linear sub-ticket comments · session file at `sessions/YYYY-MM-DD-cto-<slug>.md` · DECISIONS.md (architectural stack changes only) · `docs/00-brain/MOC-Codebase.md` append (new patterns discovered) · AUDIT_LOG.md after every merge |
| **Return contract** | Same as CEO + `workers_spawned[], qa_verdict: PASS|BLOCK|PENDING, risk_tier_assigned: trivial|lite|full|irreversible` |
| **Escalates to** | CEO |
| **Escalates when** | Spec ambiguous + no MCP query resolves · worker BLOCKED 3× · required MCP unavailable · scope expands beyond engineering |
| **Anti-patterns** | Writing code · spawning workers sequentially when parallel works · skipping QA-Lead because diff "looks small" · merging before PASS · spawning without `isolation: worktree` · reading full source files in pre-flight |

#### 3.3.1 CTO worker dispatch table

| Need | Worker | Default model | Worktree isolation |
|---|---|---|---|
| API route, server logic, server actions | `backend-engineer` | Sonnet | Yes |
| React component, page, client UI | `frontend-engineer` | Sonnet | Yes |
| Schema migration, RLS policy, indexes | `database-engineer` | Sonnet | Yes |
| LLM integration, RAG, eval, prompt | `ai-engineer` | Opus | Yes |
| Vercel/CI/env/cron config | `devops-engineer` | Sonnet | Yes |
| Auth, secrets, OWASP review (Full tier) | `security-engineer` | Opus | Yes |
| Tests (authoring) | `qa-engineer` | Haiku | Yes |
| Visual design implementation | `product-designer` | Sonnet | Yes |
| Docs / README / PR description | `technical-writer` | Sonnet | No |
| Bug investigation (root-cause) | `debugger` (legacy retained) | Sonnet | Yes |

---

### 3.4 CPO (Layer 2, NEW — to author)

| Field | Value |
|---|---|
| **File** | `.claude/agents/cpo.md` |
| **Identity** | Product chief. Owns PRDs, user stories, roadmap, RICE prioritization, acceptance criteria, feature specs. |
| **Mission** | Receive product brief → research user needs (delegates to Research-Lead) → write PRD with acceptance criteria → hand spec to CTO with explicit DoD → review delivered features for spec compliance. |
| **Model** | `claude-sonnet-4-6` |
| **Tools** | `Read, Write, Edit, Bash, Glob, Grep, Task` |
| **maxTurns** | 25 |
| **MCPs** | `linear, github` (for issue refs) |
| **Skills (3-5)** | `product-manager-toolkit, marketing-psychology, brainstorming, architecture-decision-records, writing-plans` |
| **Default risk tier** | Lite (specs aren't irreversible until implemented) |
| **Pre-flight** | 1. `CLAUDE.md` · 2. `docs/00-brain/MOC-Product.md` · 3. `docs/PRD.md` (master index) · 4. `.claude/memory/USER-INSIGHTS.md` · 5. Linear ticket |
| **Operating procedure** | (a) Read user-insights memory for jobs-to-be-done. (b) Spawn Research-Lead if competitive/market info needed. (c) Draft PRD as `docs/04-features/specs/<feature-slug>.md`. (d) Define DoD checklist (specific, measurable). (e) Hand to CTO with structured brief. (f) After CTO returns, verify deliverable matches spec. |
| **QA gate** | Spawn QA-Lead in "spec compliance" mode after CTO ships. Goal-backward: did the build satisfy the DoD? |
| **Memory writes** | Linear comment · session file · `docs/04-features/specs/<slug>.md` (the artifact) · `docs/BACKLOG.md` (prioritization) · USER-INSIGHTS.md updates if new JTBD discovered |
| **Return contract** | Standard + `spec_file_path, dod_checklist[], priority_score (RICE)` |
| **Escalates to** | CEO |
| **Escalates when** | User signal unclear · spec conflicts with locked decision · CTO returns "spec impractical" |
| **Anti-patterns** | Writing code · over-speccing (paralysis) · skipping DoD (let CTO interpret) · ignoring USER-INSIGHTS.md (#1 cause of misaligned features) |

---

### 3.5 CMO (Layer 2, NEW — to author)

| Field | Value |
|---|---|
| **File** | `.claude/agents/cmo.md` |
| **Identity** | Growth & marketing chief. Owns copy, SEO/GEO, email campaigns, GTM launches, conversion optimization. |
| **Mission** | Receive growth brief → read USER-INSIGHTS.md (mandatory — no exceptions) → draft messaging that uses customer language → ship to Framer (marketing site) or to product copy with brand alignment. |
| **Model** | `claude-sonnet-4-6` |
| **Tools** | `Read, Write, Edit, Bash, Glob, Grep, Task, WebSearch, WebFetch` |
| **maxTurns** | 25 |
| **MCPs** | `linear, framer-mcp` (for marketing site), `mem0` (customer language memory) |
| **Skills (3-5)** | `copywriting, marketing-psychology, seo-content-writer, page-cro, email-systems` |
| **Default risk tier** | Lite (copy changes are reversible) |
| **Pre-flight** | 1. `CLAUDE.md` · 2. `docs/00-brain/MOC-Marketing.md` · 3. **`.claude/memory/USER-INSIGHTS.md` (HARD GATE — if missing, BLOCK)** · 4. `docs/BRAND_GUIDELINES.md` · 5. Linear ticket |
| **Operating procedure** | (a) Read USER-INSIGHTS.md before any drafting. (b) Use customer language verbatim where possible. (c) For Framer changes, use Framer MCP. (d) For product copy, spawn frontend-engineer with copy locked. (e) No emojis unless explicitly requested. (f) No "AI labels" on content per locked decision. |
| **QA gate** | Spawn QA-Lead in "brand+voice compliance" mode. Verify: tone (authoritative/direct/warm), voice canon (Model B), no AI disclosure, HE+EN parity if both required. |
| **Memory writes** | Linear comment · session file · `docs/05-marketing/<asset>.md` · USER-INSIGHTS.md updates if new customer phrases captured |
| **Return contract** | Standard + `assets_produced[], channel_targets[], brand_voice_check: PASS|FAIL` |
| **Anti-patterns** | Writing without reading USER-INSIGHTS · adding AI labels · using buzzwords · violating no-emoji rule · using deprecated color palette / typography |

---

### 3.6 CBO (Layer 2, NEW — to author)

| Field | Value |
|---|---|
| **File** | `.claude/agents/cbo.md` |
| **Identity** | Business chief. Owns pricing, financials, OKRs, RICE, unit economics, business cases, legal/compliance, hiring/HR. |
| **Mission** | Receive business brief → compute numbers first → write actionable recommendation with sensitivity table → flag irreversible decisions to CEO. |
| **Model** | `claude-sonnet-4-6` |
| **Tools** | `Read, Write, Edit, Bash, Glob, Grep, Task` |
| **maxTurns** | 25 |
| **MCPs** | `linear, supabase` (for pulling live metrics) |
| **Skills (3-5)** | `startup-financial-modeling, pricing-strategy, market-sizing-analysis, startup-metrics-framework, cost-optimization` |
| **Default risk tier** | Full (touches money/legal) — escalates to Irreversible when DECISIONS.md change required |
| **Pre-flight** | 1. `CLAUDE.md` · 2. `docs/00-brain/MOC-Business.md` + `MOC-Metrics.md` · 3. `docs/09-metrics/` (latest cost-burn, unit econ) · 4. `.claude/memory/DECISIONS.md` (pricing/business decisions search) · 5. Linear ticket |
| **Operating procedure** | (a) Pull live numbers from Supabase via MCP (not LLM-estimated). (b) Validate against real pricing pages (OpenAI, Anthropic, Supabase, Inngest — never trust memory for cost). (c) Run sensitivity analysis with explicit assumptions. (d) Write recommendation with `if X → do Y` decision tree. (e) For pricing/legal changes, mandatory CEO route to Adam for sign-off. |
| **QA gate** | Spawn QA-Lead in "numbers + reversibility" mode. Verify: pricing matches PROJECT.md locked pricing · costs sourced from actual API docs/pricing pages · sensitivity ranges explicit · reversibility flagged |
| **Memory writes** | Linear comment · session file · `docs/01-foundation/business-model.md` updates · DECISIONS.md (pricing, vendor, legal — REQUIRED for these) · `docs/09-metrics/cost-burn-YYYY-MM.md` |
| **Return contract** | Standard + `numbers_table, assumptions[], sensitivity_range, reversibility: easy|medium|hard|irreversible` |
| **Anti-patterns** | Memorized cost numbers (always re-verify) · single-point projections (always show range) · skipping reversibility flag · skipping CEO route for pricing/legal |

---

### 3.7 CCO (Layer 2, NEW — to author)

| Field | Value |
|---|---|
| **File** | `.claude/agents/cco.md` |
| **Identity** | Customer chief. Owns support, onboarding, retention, churn analysis, success playbooks, customer voice. |
| **Mission** | Receive customer brief → analyze customer signals (support tickets, churn cohort, NPS) → propose intervention → loop with CMO for messaging, CPO for product fix. |
| **Model** | `claude-sonnet-4-6` |
| **Tools** | `Read, Write, Edit, Bash, Glob, Grep, Task` |
| **maxTurns** | 25 |
| **MCPs** | `linear, supabase, mem0` (customer history) |
| **Skills (3-5)** | `customer-support, onboarding-cro, marketing-psychology, error-handling-patterns, segment-cdp` |
| **Default risk tier** | Lite (customer comms reversible; product changes route to CPO) |
| **Pre-flight** | 1. `CLAUDE.md` · 2. `docs/00-brain/MOC-Product.md` (onboarding flow) · 3. `.claude/memory/USER-INSIGHTS.md` · 4. Supabase live churn cohort · 5. Linear ticket |
| **Operating procedure** | (a) Quantify the signal (how many customers, what cohort, $ at risk). (b) Diagnose: product gap vs onboarding gap vs messaging gap. (c) Route appropriately — CPO for product, CMO for messaging, direct intervention for support copy. (d) Track outcomes back into USER-INSIGHTS.md. |
| **QA gate** | Spawn QA-Lead in "customer empathy" mode — verify tone matches voice canon, response time SLA, no template smell |
| **Memory writes** | Linear comment · session file · USER-INSIGHTS.md (CRITICAL — this is the agent that updates customer truth) · `docs/04-features/onboarding-iterations.md` |
| **Return contract** | Standard + `customer_signal_quantified, route_decision: cpo|cmo|self|escalate, expected_impact` |
| **Anti-patterns** | Generic empathy without quantification · routing to CPO/CMO without a specific brief · failing to update USER-INSIGHTS.md (this is the single biggest CCO failure mode) |

---

### 3.8 QA-Lead (Layer 2, EXISTING — refine)

| Field | Value |
|---|---|
| **File** | `.claude/agents/qa-lead.md` (existing 166-line risk-tiered version — refine, don't rewrite) |
| **Identity** | Independent quality gate. The only path to merge. CEO and CTO cannot override. |
| **Mission** | Receive PR/diff → assign risk tier (or accept CTO's classification, may upgrade never downgrade) → spawn appropriate reviewers in parallel → produce PASS or BLOCK verdict with structured findings. |
| **Model** | `claude-sonnet-4-6` for Trivial/Lite; **upgrade to `claude-opus-4-7` for Full/Irreversible** (cross-family judge for evaluator-optimizer bias prevention is desirable but Anthropic-only is acceptable for v1) |
| **Tools** | `Read, Grep, Glob, Bash, Task` |
| **maxTurns** | 25 |
| **MCPs** | `github` (PR diff fetch), `supabase` (audit_log writes) |
| **Skills (3-5)** | `code-review-excellence, security-audit, llm-evaluation, e2e-testing, web-security-testing` |
| **Default risk tier** | Inherits from CTO, may upgrade |
| **Pre-flight** | 1. `CLAUDE.md` · 2. `docs/ENGINEERING_PRINCIPLES.md` · 3. The PR diff (via GitHub MCP) · 4. The session file from the CTO/lead that submitted · 5. **DECISIONS.md** (search for any decision the diff might violate) |
| **Operating procedure** | See §4 (4-tier QA gate) |
| **Return contract** | `verdict: PASS | BLOCK | NEEDS_REVISION, tier_assigned, reviewers_spawned[], findings[]: [{severity: critical|important|suggestion, file, line, description, fix}], evidence_log` — **plus** an explicit `<verdict>PASS</verdict>` XML tag for hook parsing |
| **Escalates to** | CTO (returns NEEDS_REVISION) or CEO (returns BLOCK with structural issue) |
| **Bypass** | Only CEO can bypass Trivial/Lite, requires `BYPASS REASON:` in PR comment. Full/Irreversible **can never be bypassed.** |
| **Anti-patterns** | Self-evaluation (never review own writes) · downgrading tier without evidence · verbose verdicts (binary + findings only) · accepting a CTO return without re-checking critical-path files |

---

### 3.9 Research-Lead (Layer 2, EXISTING — refine)

| Field | Value |
|---|---|
| **File** | `.claude/agents/research-lead.md` |
| **Identity** | Cross-cutting research orchestrator. Reports directly to CEO; serves any C-suite that needs depth. |
| **Mission** | Decompose research question into parallel researcher briefs → spawn `researcher` workers (parallel by default) → synthesize structured sourced report. |
| **Model** | `claude-opus-4-7` (research synthesis benefits from depth) |
| **Tools** | `Read, Write, Bash, Glob, Grep, WebSearch, WebFetch, Task` |
| **maxTurns** | 25 |
| **MCPs** | `context7` (library docs), `pgvector` (RAG over our own corpus) |
| **Skills (3-5)** | `deep-research, competitive-landscape, market-sizing-analysis, search-specialist, dispatching-parallel-agents` |
| **Operating procedure** | (a) Refine research question with the requesting agent (one short clarification cycle, max). (b) Spawn 3-7 researcher workers in parallel — each owns one sub-question. (c) Aggregate, deduplicate, flag conflicts. (d) Synthesize into `docs/02-competitive/<topic>.md` or `docs/02-competitive/research/<topic>-<date>.md`. (e) Return structured summary with confidence levels per claim. |
| **QA gate** | Self-check: every claim has a source. Spawn QA-Lead "research integrity" mode only for `risk:irreversible` topics (vendor choice, pricing study). |
| **Return contract** | Standard + `report_path, sub_questions[], confidence_map (claim → high/med/low), sources[]` |
| **Anti-patterns** | Synthesizing without parallel research · skipping sources · single researcher for multi-domain · trusting LLM memory over WebSearch on time-sensitive questions |

---

### 3.10 Design-Lead (Layer 2, EXISTING — keep)

The existing 670-line `design-lead.md` is the **gold standard** of the repo. Keep it largely as-is. Only changes:
- Standardize frontmatter to the unified schema (§3.1)
- Confirm MCPs (Refero, Stitch, Pencil, Playwright) are declared in frontmatter `mcpServers:` block, not only in body prose
- Verify return contract matches the standardized JSON shape
- Add `risk_tier_default: lite` (designs are reversible)
- Add `qa_gate` reference: spawns `design-critic` (already does this; formalize the brief)

Reports to CPO for product-side design, CMO for marketing design. CEO can route directly for cross-cutting design system work.

---

### 3.11 Workers (Layer 3 — 15 files)

All 15 workers follow the same template. Below is one full spec (`backend-engineer`) and a deltas table for the rest.

#### 3.11.1 backend-engineer (full spec — template for others)

| Field | Value |
|---|---|
| **File** | `.claude/agents/backend-engineer.md` (rename from `backend-developer.md`) |
| **Identity** | Implements one focused API/server task in an isolated worktree. |
| **Mission** | Receive structured brief from CTO → create worktree → implement → commit → return JSON. **Spawns nothing.** |
| **Model** | `claude-sonnet-4-6` |
| **Tools** | `Read, Write, Edit, Bash, Glob, Grep` (NO Task) |
| **maxTurns** | 20 |
| **isolation** | `worktree` (auto-create + auto-clean) |
| **MCPs** | `supabase` (DB introspection), `ide` (TypeScript diagnostics — MANDATORY before final commit) |
| **Skills (2-3)** | `nodejs-backend-patterns, nextjs-app-router-patterns, error-handling-patterns` |
| **Pre-flight** | 1. The brief from CTO (passed via Task) · 2. `docs/ENGINEERING_PRINCIPLES.md` · 3. Glob the area · 4. Read only the specific files the brief lists |
| **Operating procedure** | (a) Create worktree: `git -C $MAIN_REPO worktree add $MAIN_REPO/.worktrees/<slug> -b feat/<slug>` · (b) Implement · (c) `pnpm typecheck` + `pnpm lint` MUST pass before commit · (d) Run `mcp__ide__getDiagnostics` on edited files · (e) Atomic conventional commits (`feat(api): add scan-rate-limit`) · (f) Return JSON |
| **Auto-fix Rules (Deviation 1-3)** | (1) Type errors — fix immediately, don't return BLOCKED. (2) Missing imports — auto-add. (3) Unused imports — auto-remove. Anything else → return PARTIAL with `needs_followup`. |
| **QA gate** | None directly. CTO spawns QA-Lead after worker returns. |
| **Return contract** | `status: COMPLETE|BLOCKED|PARTIAL, agent: backend-engineer, branch, worktree, files_changed[], commits[], summary (2 sentences), decisions_made[], blockers[], needs_followup[]` |
| **Escalates to** | CTO (returns BLOCKED or PARTIAL) |
| **Escalates when** | Architectural decision required (don't decide, escalate) · spec ambiguous after one re-read · required file/table missing |
| **Anti-patterns** | Touching files outside scope · making architectural decisions · committing without typecheck · committing to main or to CTO's branch · spawning workers (you can't anyway — no Task tool) |

#### 3.11.2 Worker deltas table (the other 14 workers)

| Worker | File | Model | Tools delta | MCPs | Skills (2-3) | Distinctive procedure |
|---|---|---|---|---|---|---|
| `frontend-engineer` | (rename from frontend-developer) | Sonnet | + Playwright tool | `playwright, ide, refero, pencil` (when available) | `react-patterns, nextjs-app-router-patterns, tailwind-patterns` | (a) Read brand guide. (b) MUST run dev server + check in browser before commit. (c) Run `getDiagnostics` before final commit. (d) Visual screenshot via Playwright if UI-visible. |
| `database-engineer` | unchanged | Sonnet | — | `supabase` (MANDATORY) | `postgresql, database-design, sql-optimization-patterns` | (a) `mcp__supabase__list_tables` BEFORE schema changes. (b) NEVER drop columns without double confirmation. (c) Plpgsql functions: ALWAYS prefer `LANGUAGE sql + CTE` over plpgsql DECLARE (Supabase SQL Editor bug per MEMORY.md). |
| `devops-engineer` | NEW (formerly devops-lead) | Sonnet | — | `github, vercel` (via API), `supabase` | `vercel-deployment, github-actions-templates, deployment-procedures` | (a) Staging first, production only on confirmation. (b) Migration rollback plan written before forward migration. (c) Update `.claude/memory/AUDIT_LOG.md` on every deploy. |
| `data-engineer` | NEW (formerly data-lead) | Sonnet | — | `supabase` (MANDATORY), `segment-cdp` | `sql-optimization-patterns, postgresql, data-engineering-data-pipeline` | (a) All metric queries via Supabase MCP, never inline LLM calc. (b) Display second, numbers first. (c) Write metric defs to `docs/09-metrics/`. |
| `ai-engineer` | unchanged | **Opus** | + WebSearch | `context7` (for SDK docs) | `ai-engineer, llm-app-patterns, prompt-engineering-patterns` | (a) Every LLM feature ships with **eval + cost logging.** (b) Use Anthropic prompt caching for stable system prompts. (c) For Beamix scan: respect `gpt-4o-mini:online`, `gemini-2.0-flash-001:online`, `sonar-pro`, `claude-haiku-4.5` model IDs per MEMORY.md. |
| `security-engineer` | unchanged | **Opus** for Full tier, Sonnet for Lite | + WebSearch | `github` (SAST), `supabase` (RLS audit) | `security-audit, web-security-testing, api-security-testing` | (a) OWASP Top 10 checklist for any auth/payment touch. (b) Output: `findings[]: [{severity: critical|high|med|low, file, line, vuln_type, description, fix}]`. (c) Always re-check RLS on Supabase changes. |
| `test-engineer` | unchanged | **Haiku** | + Playwright | `playwright` | `e2e-testing-patterns, testing-patterns, unit-testing-test-generate` | (a) TDD when given spec (red → green → refactor). (b) Playwright for browser tests. (c) Mock at boundary, NOT inside. |
| `qa-engineer` | NEW (test authoring, distinct from QA-Lead) | **Haiku** | — | `playwright` | `unit-testing-test-generate, testing-patterns, e2e-testing-patterns` | Spawned by QA-Lead in Lite+ tiers to author/extend the test suite for the diff being reviewed. Separate from QA-Lead's gate role. |
| `code-reviewer` | unchanged | Sonnet | — | `github` (PR comments) | `code-review-excellence, find-bugs, code-review-checklist` | (a) Risk tiers map to review depth (Trivial: lint only · Lite: spot-review · Full: 5-dim rubric · Irreversible: 3-judge median). (b) Output P1/P2/P3 findings. (c) Scope: changed files only. |
| `adversary-engineer` | NEW | Opus | + WebSearch | — | `security-audit, threat-mitigation-mapping, find-bugs` | Spawned by QA-Lead on Full/Irreversible tiers. "Pretend to be a malicious user / hostile reviewer. What's the worst case here?" Output: 1-3 attack scenarios with reproduction steps. |
| `researcher` | unchanged | **Opus** | + WebSearch + WebFetch | `context7` (libraries) | `deep-research, search-specialist, competitive-landscape` | One specific question, deeply sourced. Returns to Research-Lead. |
| `technical-writer` | unchanged | Sonnet | — | `github` (PR descriptions) | `documentation, api-documentation, readme` | Single-doc focus. Reads code, writes docs. Returns to whichever lead/C-suite spawned. |
| `product-designer` | NEW (visual implementation worker, distinct from design-lead) | Sonnet | + Playwright | `pencil, stitch, refero, playwright` | `frontend-design, web-design-guidelines, core-components` | Implements specific visual screens. Spawned by design-lead. Different from `frontend-engineer` — focuses on pixels, Figma-style fidelity. |
| `design-critic` | unchanged | Sonnet | + Playwright | `playwright` (screenshot) | `web-design-guidelines, frontend-design, ui-skills` | Reviews delivered UI from user + professional designer POV. Returns prioritized P1/P2/P3 findings. Spawned by design-lead. |
| `supabase-cleaner` | unchanged (already best-in-class) | Sonnet | many `mcp__supabase__*` | `supabase` (deeply integrated) | — | Specialist. Audits + cleans Supabase against post-rethink schema. NEVER runs destructive SQL — emits review SQL for Adam. |

#### 3.11.3 Universal worker rules

These apply to ALL 15 workers:

1. **Worktree creation pattern** (from CLAUDE.md, enforced):
   ```bash
   MAIN_REPO=$(git worktree list | head -1 | awk '{print $1}')
   git -C "$MAIN_REPO" worktree add "$MAIN_REPO/.worktrees/<slug>" -b feat/<slug>
   ```
2. **Commit format:** `feat(scope): description` / `fix(scope): description` / `chore(scope): description` (conventional commits)
3. **Atomic commits:** one logical change per commit
4. **No `Bash(*)` allowlist:** only `Bash(git *)`, `Bash(pnpm *)`, `Bash(gh *)` (enforced by `.claude/settings.json`)
5. **`mcp__ide__getDiagnostics` before final commit** — mandatory for any TypeScript change
6. **No Task tool** — workers don't spawn workers (anti-bureaucracy)
7. **Return JSON only, max 200 tokens of summary** — verbose tool output stays in worker context, doesn't bubble up
8. **Sharp edges:** never `--no-verify`, never force-push without explicit instruction, never `git reset --hard` without confirmation

---

### 3.12 Standing Routines (Layer 4 — 11 files at `.claude/agents/_routines/`)

Each Routine is a **scheduled Anthropic Routine** invoked via Cloudflare bridge `/fire`. They are main-thread agents that can spawn workers via Task. Their .md files live in `.claude/agents/_routines/` and are loaded by the Cloudflare bridge when constructing the trust spec.

For each Routine, the same template applies:

```yaml
---
name: <routine-name>
description: <when_to_use — Adam reads this in Telegram>
schedule: cron OR event-triggered
model: claude-sonnet-4-6 | claude-opus-4-7
tools: [Read, Write, Bash, Glob, Grep, Task, WebSearch, WebFetch]
maxTurns: 25
budget_usd: <hard cap per fire>
mcpServers: [linear, supabase, mem0, pgvector, ...]
delivery: telegram | linear-comment | both | github-pr-comment
schedule_window: W1 | W2 | W3 | W4 | event
---
```

| Routine | Schedule | Model | $-cap | Body skeleton |
|---|---|---|---|---|
| **advisor-daily-thinking** | Daily 05:30 | Opus | $2.00 | Read HN top 10, AI news, Beamix Mem0, last 7d audit_log. Multi-domain synthesis: business + tech + GTM + contrarian. Output 500-1000 word "Advisor Brief" → Telegram + Linear Advisor project. |
| **morning-digest** | Daily 05:35 | Sonnet | $0.30 | Read open Linear tickets + last EOD Sync + Mem0. Output 3-5 bullet day-ahead briefing → Telegram. |
| **competitor-pulse** | Daily 05:40 | Sonnet | $0.40 | WebFetch competitor pricing pages + blog posts + AI-search rankings. Diff vs yesterday. Telegram message ONLY if material change. |
| **geo-algorithm-signal** | Sunday 05:45 | Opus | $1.50 | Read Beamix scan results + AI-search SERP shifts. Weekly trend report → Telegram + Linear. |
| **cto-daily-plan** | Daily 10:30 | Opus | $1.50 | Read open Linear tickets + last EOD + runaway-watcher + last 24h audit_log + pgvector RAG on codebase. Daily engineering plan → Telegram + Linear comment. |
| **content-idea-generator** | Daily 10:35 | Sonnet | $0.50 | Read GEO signal + customer language (USER-INSIGHTS) + competitor pulse. Generate 3-5 content ideas → Linear "Content" project. |
| **monday-standup** | Monday 10:40 | Sonnet | $0.50 | Read last week's EOD syncs + open tickets + sprint goals. Output week plan + risks → Telegram + Linear. |
| **friday-retro** | Friday 15:30 | Sonnet | $0.75 | Read week's audit_log + sessions/ + DECISIONS.md additions. Identify what worked / what didn't / 1 system improvement. → Telegram + Linear retro ticket. |
| **eod-sync** | Daily 20:30 | Sonnet | $0.30 | Summarize today's audit_log + committed PRs + open blockers. → Telegram for Adam to read before sleep. |
| **auto-unblock** | Event-trigger (Inngest routine-timeout-watcher) | Sonnet | $0.50 | Read the timed-out session file + parent ticket. Diagnose: re-brief the failed agent? Adjust spec? Escalate? Max 3 cascades, then Telegram Adam. |
| **synthesizer** | Event-trigger (`/board-meeting` Round 3) | Opus | $1.00 | Read all 6 personas' R1 + R2 JSON. Output locked_decisions with `source_persona_round` field (mechanical anti-hallucination). Posts to Linear; awaits Adam veto. |

**Production-readiness note:** Each Routine file MUST also include:
- `kill_switch` mechanism: revoke per-Routine bearer token (`scripts/rotate-bridge-hmac.ts` is the helper)
- `runaway_threshold`: cost cap × 1.2; runaway-watcher Inngest function enforces
- `pre_flight_skip` flag for trust-spec mode (don't re-read CLAUDE.md on every fire — cached)

---

### 3.13 Board personas (Layer 5 — 7 files at `.claude/agents/_personas/`)

Each persona is a single-purpose agent file invoked only during `/board-meeting <topic>` runs. They:
- Have **no `Task` tool** (don't spawn anyone)
- Are stateless between meetings
- Return Zod-validated JSON only

| Persona | Lens | Model | "Voice" |
|---|---|---|---|
| `visionary` | 18-month flywheel | Opus | "What does this enable in 18 months?" |
| `strategist` | Anti-roadmap | Sonnet | "What we DON'T do" |
| `architect` | BOM, complexity, rollback cost | Opus | "HOW" |
| `risk-modeler` | Failure modes, attack surface | Opus | "What breaks" |
| `customer-voice` | Churn, friction, acquisition | Sonnet | "Will users care or churn?" |
| `aria` | B2B procurement-grade vendor review | Opus | Marcus's hidden CTO co-founder; Adam's contrarian on vendor/SOC2/SLA decisions |
| `broad-adversary` | Strongest critic of the thesis | Opus | Fail the proposal |

The 4-round protocol (R0 framings → R1 independent → R2 cross-critique → R3 synthesizer) is unchanged from ORCHESTRATION.md §2F.

---

<a id="4-qa-tiers"></a>
## 4. 4-tier QA gate system

This is the **structural enforcement layer** that distinguishes Beamix from a 30-agent toy. Every output is gated. Every gate is appropriate to the risk.

### 4.1 The matrix (locked)

| Tier | Trigger (auto-classified by CTO/CMO or Linear label `tier:*`) | Reviewers spawned | Approvers | Max time | Bypass |
|---|---|---|---|---|---|
| **Trivial** | Docs only · comments · <10 LOC · no logic change · no env/config touch | None (just lint+typecheck via hook) | Auto-approve | <30s | N/A (already auto) |
| **Lite** | <100 LOC · single-file logic · no API/DB/auth touch · no migration | `code-reviewer` (spot-review) + lint + types + existing tests | QA-Lead auto-verdict | <2min | CEO `BYPASS REASON:` comment + audit |
| **Full** | Multi-file · API/DB changes · 100-500 LOC · new features · touches `apps/web/src/api/` or `lib/` | `code-reviewer` + `qa-engineer` (new tests) + `security-engineer` (if auth/secrets touched) + `design-critic` (if UI) | QA-Lead verdict + human confirmation (Adam Telegram OR `qa-lead-pass.yml` approval) | <5min | **Never** — CEO cannot bypass Full |
| **Irreversible** | Migrations · auth · payments · `> 500 LOC` · deletes · production deploy · vendor switch | Full + `adversary-engineer` + multi-judge (3 independent reviewers, median verdict) + rollback plan + staging sign-off | QA-Lead + CEO + human sign-off (Adam) + audit_log row | Manual | **Never** |

### 4.2 Per-tier checklists (concrete)

#### Trivial
- [ ] `pnpm lint` passes
- [ ] `pnpm format:check` passes  
- [ ] No TODO/FIXME added without ticket reference
- [ ] Commit message follows convention
- [ ] **Enforced by:** PostToolUse hook (deterministic, no LLM call)

#### Lite (Trivial + ...)
- [ ] `pnpm typecheck` passes (zero errors)
- [ ] Existing test suite passes (`pnpm test`)
- [ ] `mcp__ide__getDiagnostics` returns no errors on edited files
- [ ] LLM spot-review (Haiku, single-pass): "Any obvious bugs in this diff?"
- [ ] No new `any` types introduced
- [ ] No `console.log` in production code
- [ ] **Enforced by:** code-reviewer worker + PostToolUse hooks

#### Full (Lite + ...)
- [ ] Security: dependency audit clean, no secrets in code, input validation present
- [ ] Performance: no N+1 queries, no unbounded loops, no synchronous heavy work in API routes (Vercel 60s)
- [ ] Accessibility: ARIA labels on interactive UI elements (frontend changes only)
- [ ] Brand: correct color tokens, fonts, spacing per `docs/BRAND_GUIDELINES.md`
- [ ] LLM deep-review with 5-dimension rubric (correctness, security, performance, style, completeness; weighted score)
- [ ] New tests written for new code paths (coverage delta ≥ 0)
- [ ] API contract unchanged OR migration plan documented
- [ ] **Enforced by:** QA-Lead spawning code-reviewer + qa-engineer + security-engineer + design-critic in parallel; aggregating verdict

#### Irreversible (Full + ...)
- [ ] Multi-judge review: 3 independent code-reviewer + adversary-engineer evaluations; median verdict wins (no single judge can BLOCK alone)
- [ ] Rollback plan documented and tested (CI runs the rollback in staging)
- [ ] Data backup verified (for DB migrations)
- [ ] Staging deployment tested before production
- [ ] Human sign-off recorded with timestamp + Linear ticket
- [ ] DECISIONS.md updated if architectural choice involved
- [ ] AUDIT_LOG.md row written
- [ ] **Enforced by:** QA-Lead + `qa-lead-pass.yml` GitHub Action checking for `tier: full` (label-driven) + Adam veto via Telegram binary-ping

### 4.3 Evaluator-optimizer pattern (the core QA primitive)

Every Full+ review uses this loop (extracted from `04-QA-QUALITY-RESEARCH.md`):

```
1. Generator (the worker) outputs code/content
2. Evaluator (different model family from generator) outputs:
   <evaluation>
     <verdict>PASS | NEEDS_IMPROVEMENT | FAIL</verdict>
     <score>0.0 to 1.0</score>
     <scores>
       <correctness>0.0-1.0</correctness>
       <security>0.0-1.0</security>
       <performance>0.0-1.0</performance>
       <style>0.0-1.0</style>
       <completeness>0.0-1.0</completeness>
     </scores>
     <feedback>One paragraph summary</feedback>
     <issues>
       <issue severity="critical|important|suggestion" file="..." line="..." fix="..." />
     </issues>
   </evaluation>
3. If PASS → merge gate opens
4. If NEEDS_IMPROVEMENT → return to generator with structured feedback, max 3 iterations
5. If FAIL → BLOCK; escalate
```

**XML-tag verdict is required for hook parsing.** The `qa-lead-pass.yml` GitHub Action greps for `<verdict>PASS</verdict>` in the session file. No exceptions.

### 4.4 Cross-family judge (anti-self-preference)

To minimize self-preference bias (arXiv 2410.21819):
- **Trivial:** No LLM judge (deterministic only)
- **Lite:** Generator on Sonnet → Judge on **Haiku** (cheaper, different reasoning depth)
- **Full:** Generator on Sonnet → Judge on **Opus** (more capable judge)
- **Irreversible:** 3 judges → median verdict (one Sonnet, one Opus, one Haiku for diversity)

When we eventually wire in OpenAI/Gemini for cross-provider judges (future workstream), the same rubric applies; this is recorded in DECISIONS.md as a future enhancement.

### 4.5 Bypass mechanism (safe design)

```yaml
bypass_rules:
  allowed_tiers: [TRIVIAL, LITE]      # Full and Irreversible can never be bypassed
  allowed_roles: [CEO]                # Only CEO; no automation
  requires_reason: true               # CEO comment must include "BYPASS REASON: <text>"
  audit_logged: true                  # Every bypass writes an audit_log row
  github_action_check: qa-lead-pass.yml enforces this
```

### 4.6 PostToolUse hooks as deterministic QA (steal from disler)

Each worker .md frontmatter declares a `post_tool_use` hook script. The hook:
- Runs after every `Edit` / `Write` tool call by the worker
- Executes `pnpm lint` + `pnpm typecheck` on the edited file
- If errors → returns exit code 2 with errors in `additionalContext`
- The worker receives the feedback in its NEXT action and auto-fixes
- **No human in the loop for syntax/type errors.** Saves QA-Lead from getting trivial findings.

This is the "98.4% infrastructure" principle in action.

---

<a id="5-memory"></a>
## 5. Memory & shared-state architecture

### 5.1 The 5-layer memory stack

| Layer | Storage | Scope | Lifetime | Who writes | Who reads |
|---|---|---|---|---|---|
| **L1: System prompt** | The agent .md file itself | Per-agent identity, role, contracts | Stable (versioned in git) | Adam / executor session | Every agent invocation (prompt-cached) |
| **L2: Episodic (Mem0)** | Mem0 cloud (Hobby → Starter at 50 paying) | Per-user, per-agent, per-session | 30/90/never (auto-expire) | Any agent post-task | Pre-flight of any agent |
| **L3: Semantic RAG (pgvector)** | Supabase `rag_corpus` table | DECISIONS, sessions, codebase, brain, skills (embeddings) | Permanent (re-embedded on git push) | Inngest `embed-*` functions | Research-Lead, CEO, CTO during pre-flight |
| **L4: Canonical decisions** | `.claude/memory/DECISIONS.md` (append-only) + `DECISIONS_ARCHIVE.md` | Cross-session, cross-agent truth | Permanent (50-entry hot, older archived) | CEO + C-suite (any agent that made an architectural choice) | Every agent pre-flight |
| **L5: Audit + observability** | Supabase `audit_log` + `claude_progress` | Every agent fire | 90-day hot + 1-year cold rollup | Cloudflare bridge + Routine + Inngest watcher | `/war-room` page + Adam manually |

### 5.2 Memory decision matrix (which layer to write to)

| What kind of info | Where to write | Why |
|---|---|---|
| "The user prefers X" | LONG-TERM.md (curated) + Mem0 (raw) | LONG-TERM is the canonical agent context; Mem0 is the granular log |
| "We chose vendor Y because Z" | DECISIONS.md | Append-only with supersedes |
| "This file does X" | CODEBASE-MAP.md (curated, updated by code-reviewer) | Doesn't belong in Mem0 (code can change; description goes stale) |
| "Customer Yossi said this" | USER-INSIGHTS.md + Mem0 | USER-INSIGHTS for curated quotes; Mem0 for raw |
| "Agent CTO spawned backend-engineer for BMX-101" | audit_log (automatic via bridge) | Observability, not memory |
| "On 2026-05-16 we did X" | session file + `docs/00-brain/log.md` one-liner | Session = full context; log = navigation |

### 5.3 Mem0 patterns (the "right way")

From external research + Mem0 best practices:

```typescript
// Write episodic memory (any agent post-task)
await mem0.add({
  user_id: 'adam',
  agent_id: 'cto',
  session_id: 'session-...',
  app_id: 'beamix',
  messages: [{
    role: 'system',
    content: 'CTO decided to use Inngest over Trigger.dev for war-room durability. Reason: already in stack, free 50K runs/mo.'
  }],
  metadata: {
    source: 'cto+session-...+input-hash',
    confidence: 'high',
    expires_at: '2027-05-16'  // never-expire decisions use null
  }
});

// Read in pre-flight (any agent)
const memories = await mem0.search({
  user_id: 'adam',
  agent_id: 'cto',
  query: 'inngest vs trigger.dev',
  limit: 5
});
```

**Anti-patterns** (from research):
- ❌ Writing every tool call to Mem0 (use audit_log)
- ❌ Reading all memories pre-flight (use semantic search with limit)
- ❌ Putting code snippets in Mem0 (use pgvector RAG)
- ❌ No expiry on low-confidence facts (auto-expire 30d default)

### 5.4 Decision immutability (P6 in action)

DECISIONS.md is append-only with explicit supersession:

```markdown
### [2026-05-16] — C-suite identity model
**Decision:** Adopt CEO → CTO/CPO/CMO/CBO/CCO + QA-Lead + Research-Lead.
**Rationale:** Feels like a real company; matches existing `.claude/agents/ceo.md`.
**Supersedes:** [2026-04-15] — 9-lead model (build-lead, product-lead, etc.)
**Affects:** All future agent spawns; CLAUDE.md must be rewritten.
**Reversibility:** Medium — once C-suite files are authored and referenced, switching back requires renaming 7+ files.
```

Every agent's pre-flight searches DECISIONS.md for relevant keywords before acting. If a fresh decision contradicts the planned action, the agent BLOCKs and escalates.

---

<a id="6-integrations"></a>
## 6. Integration patterns (Linear, GitHub, Mem0, Supabase, MCPs)

### 6.1 Linear — the company control plane

**Pattern:** Linear is the single source of truth for tasks. Every CEO/C-suite fire is bound to a Linear ticket. Workers reference the parent ticket. Sub-tickets are used for fan-out.

**Labels (locked):**
- `agent:ceo | agent:cto | agent:cpo | agent:cmo | agent:cbo | agent:cco | agent:qa-lead | agent:research-lead`
- `tier:trivial | tier:lite | tier:full | tier:irreversible`
- `risk:irreversible` (override flag for any tier-1 promotion)
- `board-meeting` (triggers `/board-meeting` protocol)
- `proposed-by-agent` (Adam can quickly filter agent-suggested work)
- `decision_type:vendor | decision_type:strategic` (board-meeting branches Aria vs broad-adversary)

**Per-agent Linear behavior:**

| Agent | Linear interaction |
|---|---|
| CEO | Reads parent ticket, posts ONE synthesis comment, sets status Done OR escalates with comment |
| CTO | Creates sub-tickets per worker, posts QA-Lead verdict, sets each sub-ticket Done |
| CPO | Creates spec ticket, attaches `docs/04-features/specs/<slug>.md` link |
| CMO | Creates content ticket with brand-voice check verdict |
| CBO | Creates business-decision ticket with numbers table |
| CCO | Updates customer-signal tickets, links to USER-INSIGHTS.md commit |
| Workers | NEVER write to Linear directly. Returns JSON to parent who writes. (Single comment author = synthesis quality.) |
| Routines | Read open tickets, post comments to dedicated projects (Advisor, Strategy, Content), NEVER touch the main project unless event-routed |

**Anti-patterns:**
- ❌ Multiple comments per agent per ticket (single synthesis only)
- ❌ Workers writing to Linear (parent synthesizes)
- ❌ Ticket bodies as trust-spec source (always sentinel-bracketed comments only — per R3.2)

### 6.2 GitHub — the engineering substrate

**Branch pattern:** `feat/<task-slug>` per worker. `fix/<slug>` for bug fixes. `chore/<slug>` for cleanup.

**PR pattern:**
- One PR per logical change. Workers can produce stack of PRs if CTO designed it that way.
- PR title: matches first commit. `feat(api): rate-limit free scans (BEAMIX-104)`
- PR body template (technical-writer worker drafts):
  ```markdown
  ## Summary
  <2-3 bullets, what changed>
  
  ## Testing
  - [ ] Unit tests pass
  - [ ] Manual: <how to verify>
  
  ## Linear
  Closes BEAMIX-104
  
  🤖 Generated with Beamix Agents
  Risk-tier: lite | full | irreversible
  ```

**qa-lead-pass.yml branch protection:**
- Required check on main
- Looks for `qa_verdict: PASS` in session file matching branch slug
- For `risk:irreversible` label, also requires `tier: full` in frontmatter
- Bypass: `qa-lead-bypass` label + Adam comment with `BYPASS REASON:`

**Per-agent GitHub interaction:**
| Agent | Interaction |
|---|---|
| CTO | Reviews PRs at high level; spawns code-reviewer worker for detail |
| QA-Lead | Posts PR comment with `<verdict>PASS</verdict>` (XML tag for hook parsing) |
| code-reviewer | Posts P1/P2/P3 findings as PR comments (line-anchored where possible) |
| technical-writer | Drafts PR description |
| Workers | Push commits, never merge |
| Routines | Read PR state for `morning-digest` + `cto-daily-plan` context |

### 6.3 Mem0 — episodic shared memory

See §5.3 above. Key integration points:
- Pre-flight in every C-suite: `mem0.search({user_id:'adam', agent_id:<self>, query:<task_summary>, limit:5})`
- Post-task in every agent: `mem0.add(...)` with structured metadata (source, confidence, expires_at)
- Cross-agent leak: `agent_id` is included in writes; reads filter by `agent_id:<self>` by default, can opt-in cross-agent for board meetings

### 6.4 Supabase — the persistence layer

**Tables agents touch:**
- `audit_log` / `audit_log_daily` — observability (only Cloudflare bridge + Inngest writes; agents read)
- `claude_progress` — live step indicators (Routines write; `/war-room` reads via Realtime)
- `rag_corpus` (pgvector) — semantic memory (Inngest re-embeds; agents query via custom MCP)
- `businesses`, `scans`, `scan_engine_results`, `agent_jobs` — product tables (only product code touches; agents query for analytics via data-engineer)
- `user_profiles`, `subscriptions`, `credit_pools` — auth/billing (only product code; agents read via service role for support)

**MCP grants:**
- All Lead+ agents get `mcp__supabase__list_tables` + `mcp__supabase__execute_sql` (read-only roles)
- Only `database-engineer` + `supabase-cleaner` get migration MCP tools (`apply_migration`)
- Only `devops-engineer` gets deploy MCP tools

**RLS for war room tables:**
- All war-room tables have `RLS deny-all` policy
- Service role bypass for bridge + Routine + Inngest watcher writes
- Adam reads via authenticated `/war-room` page (server-side route checks `session.user.email = ADAM_EMAIL`)

### 6.5 MCP grant matrix (final)

| MCP | CEO | CTO | CPO | CMO | CBO | CCO | QA | Research | Design | Workers |
|---|---|---|---|---|---|---|---|---|---|---|
| linear | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (parent writes) |
| github (read) | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ |
| github merge | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | **✓ (only QA)** | ✗ | ✗ | ✗ |
| supabase (read) | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ (some) |
| supabase (migrate) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | **✓ (database-eng + supabase-cleaner only)** |
| mem0 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (read only via parent) |
| pgvector | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| context7 | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ (ai-eng, backend-eng) |
| pencil | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ (product-designer, frontend-eng) |
| stitch | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ (product-designer) |
| refero | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ (product-designer, frontend-eng) |
| playwright | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ (test-eng, qa-eng, frontend-eng, design-critic) |
| ide | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ (backend-eng, frontend-eng — MANDATORY before commit) |
| framer-mcp | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| webfetch/websearch | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ (researcher, ai-eng, security-eng) |

**Principle:** MCPs are declared in **frontmatter `mcpServers:` block** (declarative), not only in body prose. The runtime can then enforce the grant matrix.

---

<a id="7-skills"></a>
## 7. Skills library — final list

### 7.1 Action: cut 305, keep 110, add 14 → final ~120 skills

From `02-SKILLS-AUDIT.md`:
- **DELETE 305 orphans** — zero references, ~680K dormant tokens
- **KEEP 110 referenced** — explicitly named in agent/command/doc
- **REVIEW 10 category-match** — keep 2 (`e2e-testing`, `agent-memory-systems`), cut 8
- **ADD 14 Beamix-specific skills** the war room needs but doesn't have

### 7.2 The 14 NEW skills to author

These don't exist; they need to be written. Each ~100-200 lines.

| Skill | Purpose | Used by |
|---|---|---|
| `war-room-orchestration` | How CEO/C-suite dispatch into the war-room trust-spec system | CEO, all C-suite |
| `linear-mvp-recipe` | Beamix's specific Linear label vocabulary + sub-ticket pattern + comment style | All Lead+ |
| `mem0-patterns` | Mem0 write/read patterns + anti-patterns (expires_at, confidence, agent_id) | All Lead+ |
| `pgvector-rag-beamix` | Querying Beamix's specific RAG corpora (DECISIONS, sessions, codebase, brain, skills) | CEO, CTO, Research-Lead |
| `anthropic-routines` | How to write a Routine .md (cron, model, MCP grants, budget, trust-spec parsing) | Whoever authors Routine files |
| `board-meeting-protocol` | The 4-round protocol with Zod-validated persona JSON outputs | CEO, Synthesizer, all personas |
| `trust-spec-contracts` | The R3.x security model (HMAC, nonces, sentinel-bracketed specs, allowlist issuers) | Bridge maintainers + CEO when writing specs |
| `qa-gate-protocol` | The 4-tier matrix, evaluator-optimizer, multi-judge, bypass rules | QA-Lead, CTO (classification) |
| `paddle-integration` | Beamix billing patterns (checkout, webhooks, customer portal, no Stripe) | backend-engineer (billing), CBO |
| `supabase-rls-beamix` | Beamix RLS conventions, service-role bypass patterns, war-room table policies | database-engineer, security-engineer |
| `beamix-scan-architecture` | The 2026-03-24 redesigned scan pipeline (Perplexity research → 3 engines → Gemini Flash analysis) | ai-engineer, backend-engineer |
| `beamix-voice-canon` | Model B voice canon (agents named in product; "Beamix" on emails/PDFs); HE+EN dual language | CMO, technical-writer, product-designer |
| `beamix-brand-quality-bar` | The billion-dollar-feel rules (Stripe/Linear/Apple-grade), color palette v2 (blue #3370FF), typography | design-lead, product-designer, frontend-engineer, design-critic |
| `worktree-isolation-pattern` | The exact worktree create/clean/awareness pattern (main-repo-root reference, child worktree commands) | All workers + CTO |

### 7.3 Skills cleanup execution (deferred to execution phase)

```bash
# Step 1 (zero-risk): archive all 305 orphans
mkdir -p .archive/skills-orphans-2026-05-16
for skill in <list-from-02-SKILLS-AUDIT>; do
  mv .agent/skills/$skill .archive/skills-orphans-2026-05-16/
done

# Step 2: prune MANIFEST.json — re-generate from remaining skills
node scripts/regenerate-skills-manifest.mjs

# Step 3: validate by running CEO + 1 lead — confirm pre-flight loads correctly
```

Token savings: ~30K cached input tokens per session (MANIFEST shrink), ~680K dormant SKILL.md content out of grep scope.

### 7.4 Skills directory final structure

```
.agent/skills/
  MANIFEST.json                     (~36KB, ~115 entries)
  <skill-name>/
    SKILL.md                        (the canonical skill)
    references/                     (optional)
    examples/                       (optional)

.archive/skills-orphans-2026-05-16/   (305 cut skills — restore if regretted within 90d)
```

---

<a id="8-cleanup"></a>
## 8. Cleanup workstream (deferred to execution session)

This is the "before any new authoring" hygiene pass. Execute as **Phase 0** in §9.

### 8.1 File-level cleanup

| Action | Files affected | Risk | Reversibility |
|---|---|---|---|
| Delete `.agent/agents/ceo.md` | 1 (stale) | Low — `.claude/agents/ceo.md` is authoritative | Easy (git revert) |
| Delete `.agent/agents/qa-lead.md` | 1 (stale) | Low — `.claude/agents/qa-lead.md` authoritative | Easy |
| Mirror `.claude/agents/` content into `.agent/agents/` (or delete `.agent/agents/`) | 33+ files | Decision needed: do we keep both dirs as mirrors, or canonical-one-only? See §11 open questions | Medium |
| Move 10 GSD orphan files (executor, planner, phase-researcher, project-researcher, research-synthesizer, roadmapper, plan-checker, verifier, integration-checker, nyquist-auditor) to `.archive/agents/gsd-pipeline/` | 10 files | Low — no callers | Easy |
| Keep `debugger.md` + `codebase-mapper.md` in place (referenced by `/fix` + `/audit` commands) | 2 files | None | N/A |
| Rename `backend-developer.md` → `backend-engineer.md`, `frontend-developer.md` → `frontend-engineer.md` | 2 renames | Medium — update all references | Easy (script the rename) |
| Rename `devops-lead.md` → `devops-engineer.md`, `data-lead.md` → `data-engineer.md` | 2 renames + role change | Medium — these become workers, not leads | Easy |
| Archive `build-lead.md`, `product-lead.md`, `growth-lead.md`, `business-lead.md` to `.archive/agents/legacy-leads-2026-05-16/` (CTO/CPO/CMO/CBO supersede) | 4 files | Medium — must author replacements first | Hard if no replacements |
| Delete `.archive/agents/skills-orphans-2026-05-16/` content (305 skill dirs) → archived for 90d, then deleted | 305 dirs | Low — zero references | Easy (90d window) |

### 8.2 Configuration cleanup

| Action | File | Why |
|---|---|---|
| Update `CLAUDE.md` 9-lead model to C-suite model | `CLAUDE.md`, `/Users/adamks/CLAUDE.md` | Source of every confused agent today |
| Update `AGENTS.md` if exists | `AGENTS.md` | Same |
| Add `risk_tier` field to settings.json defaults | `.claude/settings.json` | Hook integration |
| Add allowed Bash patterns (`Bash(git *)`, `Bash(pnpm *)`, `Bash(gh *)`) | `.claude/settings.json` | Already mentioned in agent prompts but not enforced |
| Add PostToolUse hooks for lint/typecheck auto-feedback | `.claude/hooks/` (NEW) | Steal from disler |
| Add `qa-lead-pass.yml` improvements (XML tag check, tier check) | `.github/workflows/qa-lead-pass.yml` | Already exists; refine for new schema |

### 8.3 Skills cleanup

See §7.3 above.

### 8.4 Documentation cleanup

| Action | File |
|---|---|
| Rewrite `CLAUDE.md` "The Team" section to match C-suite | `CLAUDE.md` |
| Update `docs/00-brain/MOC-Agents.md` with new roster | `docs/00-brain/MOC-Agents.md` |
| Add `docs/00-brain/MOC-Quality.md` (NEW) — the 4-tier QA gate system | `docs/00-brain/MOC-Quality.md` |
| Update `docs/08-agents_work/INDEX.md` | `docs/08-agents_work/INDEX.md` |
| Append rethink summary to `docs/00-brain/log.md` | `docs/00-brain/log.md` |
| Add DECISIONS.md entry for this rethink | `.claude/memory/DECISIONS.md` |

---

<a id="9-phases"></a>
## 9. Implementation phases

Adam's "no timelines" rule (`feedback_no_timeline_planning.md`) applies — phases are by scope + dependency, not by time.

### Phase 0 — Hygiene & Cleanup (BLOCKING)
**Goal:** Repo state is clean and consistent before any new authoring.

| Task | Owner | Depends on |
|---|---|---|
| 0.1 — Audit-driven file moves (§8.1) | CTO (script the renames; double-check references) | — |
| 0.2 — Skills orphan archive (§7.3) | CTO (run the archive script) | — |
| 0.3 — CLAUDE.md rewrite to C-suite model (§8.2) | technical-writer (CTO supervises) | — |
| 0.4 — Settings.json hook integration (PostToolUse) | devops-engineer | — |
| 0.5 — Update `qa-lead-pass.yml` for new schema | devops-engineer | — |
| 0.6 — DECISIONS.md entry for the rethink | CEO | — |

**Definition of Done:** Repo passes a "ghost session" — start a fresh CEO session, no broken references, no agent name resolves to a missing file.

### Phase 1 — New schema, refine existing C-suite (BLOCKING for Phase 2)
**Goal:** Standardize all existing agents to the unified schema (§3.1).

| Task | Owner | Depends on |
|---|---|---|
| 1.1 — Refine `ceo.md`, `cto.md`, `qa-lead.md`, `research-lead.md`, `design-lead.md` to new schema (frontmatter + 8-section body) | technical-writer + each owner Lead | Phase 0 |
| 1.2 — Refine all 15 workers to new schema | technical-writer | Phase 0 |
| 1.3 — Schema-lint check via `qa-lead-pass.yml` | devops-engineer | 1.1, 1.2 |

### Phase 2 — Author 4 new C-suite files
**Goal:** Author the missing CPO, CMO, CBO, CCO agents.

| Task | Owner | Depends on |
|---|---|---|
| 2.1 — Author `cpo.md` per §3.4 spec | technical-writer + product-lead (refining into CPO) | Phase 1 |
| 2.2 — Author `cmo.md` per §3.5 spec | technical-writer + growth-lead (refining into CMO) | Phase 1 |
| 2.3 — Author `cbo.md` per §3.6 spec | technical-writer + business-lead | Phase 1 |
| 2.4 — Author `cco.md` per §3.7 spec | technical-writer + CCO (NEW — no predecessor) | Phase 1 |
| 2.5 — Author 3 new workers: `qa-engineer.md`, `adversary-engineer.md`, `product-designer.md` | technical-writer | Phase 1 |
| 2.6 — End-to-end test: fire CEO with a Lite-tier ticket, verify full C-suite → worker → QA → merge cycle | qa-lead | 2.1-2.5 |

### Phase 3 — Author 14 new skills
**Goal:** Beamix-specific skills the war room needs.

| Task | Owner | Depends on |
|---|---|---|
| 3.1 — Author 14 SKILL.md files per §7.2 list | researcher + technical-writer (parallel) | Phase 0 |
| 3.2 — Regenerate MANIFEST.json | devops-engineer | 3.1 |
| 3.3 — Wire each new skill into ≥1 agent prompt | technical-writer | 3.1 + Phase 1 |

### Phase 4 — Author 11 standing Routine files
**Goal:** WS6 — the long-deferred Routine .md authoring.

| Task | Owner | Depends on |
|---|---|---|
| 4.1 — Author all 11 .md files at `.claude/agents/_routines/` per §3.12 specs | technical-writer (CTO + CMO supervise relevant ones) | Phase 1, Phase 3 |
| 4.2 — Provision the 10 missing Routines in claude.ai Console | Adam (manual UI work — bridge dependency) | 4.1 |
| 4.3 — Set wrangler secrets per Routine (`ROUTINE_<NAME>_ID`, `ROUTINE_<NAME>_TOKEN`) | devops-engineer | 4.2 |
| 4.4 — Wire 4-window cron schedules | devops-engineer | 4.3 |
| 4.5 — Smoke-test each Routine end-to-end | qa-lead | 4.4 |

### Phase 5 — Author 7 board personas
**Goal:** Board-meeting protocol fully alive.

| Task | Owner | Depends on |
|---|---|---|
| 5.1 — Author 7 .md files at `.claude/agents/_personas/` per §3.13 | technical-writer | Phase 1, Phase 3 |
| 5.2 — Test `/board-meeting` command end-to-end with synthetic topic | qa-lead | 5.1 |
| 5.3 — Persona-distinction eval: ≥40% uniqueness in locked_decisions per persona | researcher | 5.2 |

### Phase 6 — Hooks & deterministic quality
**Goal:** Implement disler-style hooks for automatic QA.

| Task | Owner | Depends on |
|---|---|---|
| 6.1 — Author `.claude/hooks/pre_tool_use.py` (block `rm -rf`, validate critical inputs) | devops-engineer | Phase 0 |
| 6.2 — Author `.claude/hooks/post_tool_use.py` (lint + typecheck → feedback) | devops-engineer | Phase 0 |
| 6.3 — Author `.claude/hooks/stop.py` (validate plan files, session file existence) | devops-engineer | Phase 1 |
| 6.4 — Wire to `.claude/settings.json` hook block | devops-engineer | 6.1-6.3 |

### Phase 7 — Production readiness
**Goal:** Pass the production-readiness checklist (§10).

| Task | Owner | Depends on |
|---|---|---|
| 7.1 — Promptfoo regression test suite (5-test scenarios per critical agent) | ai-engineer + qa-lead | Phase 2 |
| 7.2 — Add Promptfoo CI run on PRs touching `.claude/agents/` | devops-engineer | 7.1 |
| 7.3 — End-to-end smoke test: fire a real Linear ticket, full flow → PR → merge | qa-lead | All phases above |
| 7.4 — Cost validation: 7 days of war-room running, sum costs, verify <$200/mo | CBO | 7.3 |
| 7.5 — DR runbook re-test (cycle through all 10 runbooks at `docs/07-history/runbooks/`) | qa-lead + devops-engineer | 7.3 |

### Phase 8 — Reusability prep (deferred — Adam said "later")
**Goal:** When Adam wants the agents to be project-agnostic, this is the path.

| Task | Owner | Depends on |
|---|---|---|
| 8.1 — Extract Beamix-specific content into `PROJECT.md` overlays | technical-writer | All phases |
| 8.2 — Refactor agent prompts to read `PROJECT.md` at runtime | CTO | 8.1 |
| 8.3 — Spin up second project repo to validate reuse | CTO + product-lead | 8.2 |

---

<a id="10-prod-ready"></a>
## 10. Production-readiness checklist

Before the war room can be declared "production" (i.e., Adam can step away and trust outputs without daily review):

### Infrastructure
- [ ] All 11 Routines provisioned in claude.ai Console with per-Routine bearer tokens
- [ ] Cloudflare bridge passing all 10 DR runbook scenarios
- [ ] `audit_log` retention working (90d hot + 1y daily rollup)
- [ ] `runaway-watcher` Inngest function tested (kills sessions over 1.2× spec budget)
- [ ] `qa-lead-pass.yml` enforcing on every PR to main; bypass mechanism audited

### Agents
- [ ] All 45 agent files conform to unified schema (frontmatter + 8-section body)
- [ ] No agent .md file >300 lines (depth comes from skills, not bloat)
- [ ] Every agent declares MCPs in frontmatter `mcpServers:` block (not body prose only)
- [ ] Every agent declares skills in frontmatter `skills:` array (max 5 for leads, 3 for workers)
- [ ] Every agent has a `risk_tier_default` + `escalates_to` + `escalates_when` field
- [ ] Every agent has a structured return contract with required fields documented

### Quality gates
- [ ] 4-tier matrix encoded in QA-Lead's prompt as the operating procedure
- [ ] Evaluator-optimizer XML-tag pattern enforced (`<verdict>PASS</verdict>` required for hook parsing)
- [ ] Cross-family judge wired (Sonnet generator → Opus judge on Full)
- [ ] Multi-judge median verdict logic for Irreversible tier
- [ ] Bypass mechanism: only CEO can bypass Trivial/Lite, with audit-logged reason
- [ ] PostToolUse hook running lint + typecheck after every file write

### Evals & regression
- [ ] Promptfoo CI gate on every `.claude/agents/` change
- [ ] 5 test scenarios per critical agent (CEO, CTO, QA-Lead, code-reviewer, security-engineer)
- [ ] Persona-distinction eval ≥40% uniqueness (board meetings)
- [ ] Quarterly review: scan all DECISIONS.md entries for ones >90 days, archive

### Memory hygiene
- [ ] DECISIONS.md ≤50 entries (older → DECISIONS_ARCHIVE.md)
- [ ] LONG-TERM.md ≤100 lines (compress quarterly)
- [ ] MANIFEST.json ≤40KB
- [ ] Mem0 low-confidence entries auto-expire 30d
- [ ] Session files: YAML schema enforced (max 10 lines per session)

### Observability
- [ ] `/war-room` page production-stable (Realtime + 30s polling fallback)
- [ ] Telegram bot fires escalations (binary-ping format only — no cost alerts per Q7)
- [ ] iOS Shortcut for voice idea-capture working (DEFERRED until Adam needs it)
- [ ] Monthly cost burn-down report at `docs/09-metrics/cost-burn-YYYY-MM.md`

### Reversibility
- [ ] Every "HARD" reversibility item has a documented migration path
- [ ] Git tags at every Phase completion (`v0.1-cleanup-done`, `v0.2-csuite-done`, etc.)
- [ ] `.archive/` directory preserved 90d minimum

---

<a id="11-open"></a>
## 11. Open questions & future decisions

These are NOT blocking for the plan above, but need future Adam-decisions:

### Q1 — Directory canonical choice
Should we keep both `.agent/agents/` and `.claude/agents/` as mirrors (one declarative copy, one runtime copy), or canonical-one-only?
- **Mirror:** Easier for tooling that reads from `.agent/`
- **Canonical:** Simpler; one source of truth. Recommend canonical = `.claude/agents/` and delete `.agent/agents/`.
- **Recommend:** Canonical `.claude/agents/`. Phase 0 deletes `.agent/agents/`. `.agent/skills/` stays since it's the skills root.

### Q2 — Promptfoo vs custom eval framework
Promptfoo is the de-facto standard but adds a npm dep + GitHub Action overhead. Custom YAML evals are lighter but more work to maintain.
- **Recommend:** Promptfoo for v1 (steal from external research). Migrate to custom if it becomes a bottleneck.

### Q3 — Agent Teams TeammateTool adoption
The experimental Agent Teams API offers `spawnTeam`, shared task board, file inboxes. Our current Task-based subagent pattern works without it.
- **Recommend:** Keep current Task-based pattern for v1. Re-evaluate after Anthropic stabilizes the API.

### Q4 — Cross-provider judge (OpenAI/Gemini)
Currently all judges are Anthropic. True cross-provider judges would maximize bias elimination.
- **Recommend:** Phase 2 work. Wire OpenAI as a judge option in QA-Lead; A/B test verdict agreement on a corpus of 50 historical PRs.

### Q5 — Routine consolidation
11 standing Routines is at the upper end of what `MAX_FIRES_PER_24H=15` allows. If we want to add more (e.g., per-customer Routines for white-label tier), we need Max 20× upgrade.
- **Recommend:** Stay at 11 until first paying customer adds pressure.

### Q6 — Per-Routine bearer tokens
WS4 Q4 follow-up: today all Routines share the CEO token. Per-Routine tokens minimize blast radius if one is compromised.
- **Recommend:** Phase 4.3 implements this as part of provisioning.

### Q7 — Mem0 cloud → OSS migration
Mem0 Hobby tier suffices today. If we hit 10K writes/mo, $19 Starter; if we want vendor independence, self-host Mem0 OSS.
- **Recommend:** Watch Mem0 write volume; decide at 5K writes/mo.

### Q8 — Quality bar enforcement for design
The "billion-dollar feel" is hard to encode in an LLM judge. design-critic's prompts need ongoing tuning against actual Stripe/Linear/Apple screenshots.
- **Recommend:** Build a "design reference corpus" via Refero MCP — 50 screens we'd be proud to ship; embed them in pgvector; design-critic compares delivered UI against the corpus.

### Q9 — Hebrew/English duality
Today the prompts assume EN primary + HE optional. As Israeli market grows, this may flip.
- **Recommend:** Defer until first 100 Israeli customers; then audit prompts for HE-first patterns.

### Q10 — Cost ceiling escalation
Today the ceiling is $200/mo ($100 Max + $5 Cloudflare + ~$95 stack). If war room budget grows: Max 20× upgrade is $200 (bringing total to ~$300).
- **Recommend:** Trigger upgrade conversation when monthly burn >$180.

---

## Final word

This plan turns Beamix's agent system from "3 coexisting models with 6,800 lines of orphan prompts" into "1 C-suite, 1 worker layer, 11 scheduled Routines, 7 board personas — 45 focused files, 120 curated skills, every agent gated by a 4-tier QA system."

The execution unfolds across **8 phases**, each with specific owners and DoD criteria. Phase 0 (hygiene) is blocking for everything; Phase 7 (production readiness) is the finish line; Phase 8 (reusability) waits until Adam's next project.

**Hard rules locked into the design:**
- P1 Orchestrator = Ledger · P2 Tokens = quality · P3 98.4% infrastructure / 1.6% AI · P4 Cross-family judge · P5 Goal-backward verification · P6 Decision immutability · P7 Workers spawn nothing · P8 Typed handoff · P9 Worktree isolation · P10 Billion-dollar quality bar · P11 Auto-approve trivial · P12 Skills on demand

**Hard anti-rules:**
- No n8n. No Stripe. No LangChain runtime. No CrewAI. No self-evaluation. No subagent recursion. No cloud OAuth on subscription.

**Next action for the user:** Approve this plan as the source of truth. Either review and request edits, OR direct the executor session to begin Phase 0 (hygiene & cleanup).

— CEO (Opus 4.7 session, 2026-05-16)
