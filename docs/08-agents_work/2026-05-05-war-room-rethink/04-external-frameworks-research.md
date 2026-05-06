# External Research: Agentic Dev Frameworks (2025–2026)

**Researcher:** researcher-war-room-frameworks
**Date:** 2026-05-05
**Mission:** Rank leading open-source agentic-coding frameworks shipped in 2025–2026 and identify what Beamix's 32-agent war room is missing.

> All claims sourced. Star counts, dates, and feature claims pulled live from GitHub READMEs and Anthropic's official docs (May 5, 2026). Confidence assigned per claim.

---

## Top 12 Frameworks Ranked

Ranked by a composite of **production evidence + recency + architectural novelty**, not raw star count. Star and date snapshots are May 5, 2026.

### 1. `github/spec-kit` — Spec-Driven Development
| Field | Value |
|---|---|
| URL | https://github.com/github/spec-kit |
| Stars | 92.6k |
| Last release | v0.8.5 — May 4, 2026 |
| Core pattern | Constitution → Spec → Plan → Tasks → Implement (gated phases) |
| Killer feature | Project-wide constitution every spec inherits; phase gates between intent and code |
| Production evidence | Backed by GitHub itself; 30+ AI agent integrations including Claude Code, Copilot, Gemini, Cursor, Codex |
| What Beamix can steal | The **constitution.md** pattern — one canonical doc every agent inherits before any spec, replacing scattered CLAUDE.md guidance with a versioned governance file |

Confidence: HIGH (official GitHub project, fresh release, multiple independent comparisons cite it).

### 2. `bmadcode/BMAD-METHOD` — Multi-Agent Agile
| Field | Value |
|---|---|
| URL | https://github.com/bmadcode/BMAD-METHOD |
| Stars | 46.4k |
| Last release | v6.6.0 — April 29, 2026 |
| Core pattern | 12+ persona agents (PM, Architect, Developer, QA, UX, Scrum Master) running an agile lifecycle |
| Killer feature | "Party Mode" — multiple personas collaborating in one session; scale-adaptive planning depth |
| Production evidence | 46.4k stars, ranked among the deepest planning artifact producers in independent 2026 evaluations |
| What Beamix can steal | "Party Mode" multi-persona discussion; scale-adaptive planning depth (don't run full PRD → architecture → story flow on a 2-line bug) |

Confidence: HIGH (independent comparison reviews + active release).

### 3. `ruvnet/claude-flow` (now Ruflo) — Swarm Orchestration
| Field | Value |
|---|---|
| URL | https://github.com/ruvnet/claude-flow |
| Stars | 43.2k |
| Last release | v3.6.30 — May 5, 2026 (1,478 releases total) |
| Core pattern | Hierarchical, mesh, and adaptive swarm topologies with consensus (Raft, Byzantine, Gossip) |
| Killer feature | SONA self-optimizing neural memory + AgentDB with HNSW vector index ("150x–12,500x faster search"); 27 hooks; 12 background workers |
| Production evidence | Active multi-release-per-day cadence; registers as MCP server; 5-provider LLM routing with failover |
| What Beamix can steal | (a) MCP-server-as-orchestrator pattern — let agents call `swarm_init`, `agent_spawn`, `memory_store` as MCP tools; (b) vector-indexed cross-session memory beyond flat markdown |

Confidence: HIGH for stars/release cadence; MEDIUM for performance claims (vendor self-reported).

### 4. `wshobson/agents` — Subagent + Skills Library
| Field | Value |
|---|---|
| URL | https://github.com/wshobson/agents |
| Stars | 34.8k |
| Last commit | Active May 2026 (per repo activity tracking) |
| Core pattern | 80 plugins × 185 agents × 153 skills × 100 commands × 16 orchestrators |
| Killer feature | Four-tier model routing (Opus 4.7 critical / Inherit / Sonnet 4.6 support / Haiku 4.5 ops); progressive-disclosure skills (3-tier metadata→instructions→resources) |
| Production evidence | Largest community subagent repo; reference for awesome-claude-code lists |
| What Beamix can steal | The **4-tier model routing matrix** — Beamix has 3 tiers but doesn't formalize Tier-2 "inherit." Also: the plugin packaging pattern (commands+agents+skills shipped together) |

Confidence: HIGH.

### 5. `SuperClaude-Org/SuperClaude_Framework`
| Field | Value |
|---|---|
| URL | https://github.com/SuperClaude-Org/SuperClaude_Framework |
| Stars | 22.6k |
| Last release | v4.3.0 — March 22, 2026 |
| Core pattern | 30 commands + 20 agents + 7 behavioral modes + 8 MCP servers |
| Killer feature | "Behavioral Modes" — Brainstorming / Deep Research / Token-Efficiency / Introspection — modal personality switching |
| Production evidence | 22.6k stars, third release in 2026 |
| What Beamix can steal | **Token-Efficiency Mode** as a first-class behavioral mode (not a passive guideline); explicit Introspection mode for self-critique |

Confidence: HIGH.

### 6. `getAsterisk/claudia` / `winfunc/opcode` — GUI + Checkpoints
| Field | Value |
|---|---|
| URL | https://github.com/winfunc/opcode |
| Stars | 21.7k |
| Last release | v0.2.0 — August 31, 2025 (note: stale by 8 months) |
| Core pattern | Desktop GUI with sandboxed agent processes |
| Killer feature | **Timeline & Checkpoints** — Git-like version snapshots of conversation/session state with branching and instant restore |
| Production evidence | 21.7k stars but slow release cadence — community is moving on |
| What Beamix can steal | Session checkpointing as a primitive — checkpoint before a worker dispatch, restore on QA fail. Beamix has worktrees but no conversation/state checkpoints |

Confidence: HIGH for features; MEDIUM for production-readiness (stale releases).

### 7. `anthropics/claude-plugins-official` — Anthropic's Direction
| Field | Value |
|---|---|
| URL | https://github.com/anthropics/claude-plugins-official |
| Stars | 18.6k |
| Last commit | Active May 2026 (330 commits) |
| Core pattern | Official plugin marketplace bundling commands + agents + skills + MCP + hooks + plugin.json |
| Killer feature | One-line install (`/plugin install foo@claude-plugins-official`); enterprise-hosted internal marketplaces (announced Feb 25, 2026) |
| Production evidence | Anthropic-maintained; 36 official plugins at launch (Dec 2025) |
| What Beamix can steal | **Plugin-as-bundle convention** — Beamix should package each lead-team (e.g. `build-lead-bundle`) as a plugin (commands + agents + skills + MCP) rather than scattered files |

Confidence: HIGH (Anthropic-official).

### 8. `humanlayer/humanlayer` (CodeLayer / MULTI CLAUDE)
| Field | Value |
|---|---|
| URL | https://github.com/humanlayer/humanlayer |
| Stars | 10.7k |
| Last release | codelayer-0.20.0 — Dec 23, 2025 |
| Core pattern | "Superhuman for Claude Code" — parallel sessions + worktrees + remote cloud workers + keyboard-first |
| Killer feature | Remote cloud workers — run Claude sessions off the local machine for long-running tasks |
| Production evidence | 10.7k stars; active throughout 2025 |
| What Beamix can steal | **Remote/cloud worker pattern** — Beamix workers all run locally; an offload pattern would unblock long autonomous tasks |

Confidence: HIGH for capability; MEDIUM for current activity (last release Dec 2025 — needs revalidation).

### 9. `smtg-ai/claude-squad`
| Field | Value |
|---|---|
| URL | https://github.com/smtg-ai/claude-squad |
| Stars | 7.3k |
| Last release | v1.0.17 — March 12, 2026 |
| Core pattern | tmux + git worktrees per session; supports Claude Code, Codex, Aider, Gemini |
| Killer feature | Auto-accept mode for background task completion + change-review-before-push |
| Production evidence | Active, multi-tool support, 7.3k stars |
| What Beamix can steal | **Auto-accept with change-review gate** — Beamix QA gate is sacred but synchronous; auto-accept-then-review is the right async pattern for low-risk work |

Confidence: HIGH.

### 10. `Pimzino/spec-workflow-mcp`
| Field | Value |
|---|---|
| URL | https://github.com/Pimzino/spec-workflow-mcp |
| Stars | 4.2k |
| Last commit | Active 2026 (424 commits) |
| Core pattern | Requirements → Design → Tasks workflow exposed via MCP server |
| Killer feature | Real-time web dashboard (port 5000) + VSCode extension + **approval workflow with revision tracking** |
| Production evidence | 4.2k stars, 11-language localization, separate `Pimzino/claude-code-spec-workflow` (3.7k stars) for slash-command flavor |
| What Beamix can steal | **Approval-with-revision dashboard** — Beamix QA gate is binary PASS/FAIL; first-class revision tracking lets QA → fix → re-review without losing state |

Confidence: HIGH.

### 11. `buildermethods/agent-os` — Standards Discovery
| Field | Value |
|---|---|
| URL | https://github.com/buildermethods/agent-os |
| Stars | 4.5k |
| Last commit | Active 2026 |
| Core pattern | Discover Standards → Deploy Standards → Shape Spec → Index Standards |
| Killer feature | Auto-extracts unwritten conventions FROM your existing codebase rather than asking you to write them |
| Production evidence | 4.5k stars; active community |
| What Beamix can steal | **Standards-discovery-from-codebase** — Beamix has ENGINEERING_PRINCIPLES.md but humans wrote it; an extractor-agent that scans the codebase and updates principles is a force multiplier |

Confidence: HIGH.

### 12. `disler/claude-code-hooks-multi-agent-observability`
| Field | Value |
|---|---|
| URL | https://github.com/disler/claude-code-hooks-multi-agent-observability |
| Stars | 1.4k |
| Last commit | Recent (16 commits, active) |
| Core pattern | Bun server + SQLite + WebSocket + Vue client receiving 12 hook event types |
| Killer feature | **Real-time agent swim-lane visualization** — every tool call across every parallel agent live, with filters and pulse charts |
| Production evidence | Smaller but referenced as the canonical multi-agent observability pattern |
| What Beamix can steal | **The whole stack.** Beamix runs 50+ worktrees with zero observability. This is the missing dashboard |

Confidence: HIGH.

### Honorable mentions (not ranked)
- `stravu/crystal` — 3k stars but **deprecated** Feb 2026 (succeeded by Nimbalyst). Cite as historical pattern, not adoption target.
- `imbue-ai/sculptor` — 149 stars; container-isolation alternative to worktrees. Niche; not a leader.
- `disler/infinite-agentic-loop` — 577 stars; pattern (infinite waves until context limit) more valuable than the repo.
- `centminmod/my-claude-code-setup` — 2.3k stars; personal setup with notable Z.AI cost-routing and `.worktreeinclude` patterns worth borrowing.
- `Bhartendu-Kumar/rules_template` — 1.1k stars; cross-IDE rules template — last release Apr 2025 (older).

---

## 2026 Meta-Trends

These are the patterns that have crystallized between mid-2025 and May 2026 across the leading frameworks.

### Trend 1 — Spec-driven is the default; "vibe coding" lost
Spec-kit (92.6k), BMAD (46.4k), agent-os (4.5k), and OpenSpec all converged on the same gated workflow: Constitution / Standards → Spec → Plan → Tasks → Implement. Independent 2026 evaluations explicitly frame this as "Why Spec-Driven AI Development Wins in 2026." (Source: trigidigital.com Mar 2026, dev.to "Spec Kit vs BMAD vs OpenSpec" 2026.)

### Trend 2 — Plugin bundles replace scattered config
Anthropic shipped the official plugin marketplace Oct 9, 2025 (Claude Code 2.0.13). Plugins now bundle commands + agents + skills + MCP + hooks under a single `plugin.json` with one-line install. Enterprise marketplaces followed Feb 25, 2026. Wshobson reorganized 185 agents into 80 plugins to ride this wave. (Sources: Anthropic plugins announcement; ghacks.net Feb 25, 2026.)

### Trend 3 — Skills (model-invoked, progressive disclosure) eat Slash Commands
Anthropic announced Agent Skills Oct 16, 2025 (and as an open standard Dec 18, 2025). Within weeks, OpenAI Codex CLI, ChatGPT, Gemini CLI, and GitHub Copilot all adopted the SKILL.md format. Three-tier progressive disclosure (metadata ~100 tokens → SKILL.md <5k tokens → bundled resources on demand) is now the standard. Slash commands still exist but skills are the model-invoked default. (Sources: anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills; swirlai progressive-disclosure analysis.)

### Trend 4 — Agent Teams (peer-to-peer) joins Subagents (hierarchical)
Anthropic shipped experimental Agent Teams alongside Opus 4.6 (Feb 2026) — separate Claude Code instances that **message each other directly** via a shared task list and mailbox, rather than reporting only to a parent. The C-compiler-in-Rust project (Feb 5, 2026) used 16 agents over ~2,000 sessions to ship 100k LOC compiling Linux on x86/ARM/RISC-V, using file-locking via `current_tasks/` directory. The dual pattern (subagents for focused report-back, teams for adversarial debate) is now formalized. (Sources: code.claude.com/docs/en/agent-teams; anthropic.com/engineering/building-c-compiler.)

### Trend 5 — Hooks become deterministic safety net
Hook events grew from a few in early 2025 to **12 lifecycle events** by 2026: PreToolUse, PostToolUse, PostToolUseFailure, PermissionRequest, Notification, UserPromptSubmit, Stop, SubagentStart, SubagentStop, PreCompact, SessionStart, SessionEnd. Plus team-specific TeammateIdle / TaskCreated / TaskCompleted. Async hooks (Jan 2026) and HTTP hooks (remote validation services) extend this further. Community framing: "without hooks every safeguard depends on the model understanding instructions, but with hooks, rules enforce at the system level." (Sources: code.claude.com/docs/en/hooks; pixelmojo.io 2026 hooks guide.)

### Trend 6 — Token economy is a first-class concern
Multiple frameworks call this out explicitly:
- wshobson: 4-tier model routing (Opus/Inherit/Sonnet/Haiku) by criticality
- SuperClaude: "Token-Efficiency Mode" as a behavioral mode
- centminmod: Chain-of-Draft mode with "~80% token reduction" + Z.AI routing for cost-effective GLM-4.7
- claude-flow: per-step model selection in its 27 hooks
- progressive-disclosure SKILL.md: load only when needed
This is no longer a guideline — it's an architectural primitive.

### Trend 7 — Observability + checkpoints are the next frontier
The ecosystem realized that 16 parallel Claudes generating ~100k LOC is unauditable without infrastructure. Three patterns:
- Hooks-driven event streaming → SQLite/WebSocket dashboards (disler observability)
- Timeline & Checkpoints with branching restore (opcode/claudia)
- Real-time approval dashboards with revision tracking (spec-workflow-mcp)

---

## Anthropic Official Direction (May 2026)

What Anthropic itself is pushing hardest, in priority order based on recent docs and announcements:

1. **Skills (SKILL.md + progressive disclosure)** — announced Oct 16, 2025; open standard Dec 18, 2025; cross-vendor adoption (OpenAI, Google, GitHub) within weeks. **This is the #1 official priority.** (anthropic.com Oct 2025; platform.claude.com docs)
2. **Plugins (one-install bundles)** — Oct 9, 2025 marketplace launch; enterprise version Feb 25, 2026. Bundling skills + agents + commands + MCP + hooks. (claude-plugins-official repo)
3. **Subagents** — official, stable. `.claude/agents/` directory; per-agent system prompts, tool allowlists, model selection. The `description` field is what Claude uses to decide delegation. (code.claude.com/docs/en/sub-agents)
4. **Agent Teams** — experimental, opt-in via `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`. Shipped with Opus 4.6 (Feb 2026). Lead/teammate model with shared task list and mailbox. v2.1.32+. (code.claude.com/docs/en/agent-teams)
5. **Hooks** — 12 lifecycle events; async + HTTP variants in 2026; team-specific TeammateIdle/TaskCreated/TaskCompleted. Quality gates as deterministic code, not LLM interpretation.
6. **Output styles** — markdown + frontmatter; **fixed at session start** in 2026 specifically for prompt caching gains (a deliberate caching optimization, not a UX simplification).
7. **Production evidence:** Stripe deployed Claude Code to 1,370 engineers; one team did a 10,000-line Scala→Java migration in 4 days. Ramp cut incident investigation by 80%. At Anthropic itself, "the majority of code is now written by Claude Code." (Sources: anthropic.com Stripe case study; April 23 postmortem; 2026 Agentic Coding Trends Report.)

**Direction signal:** Anthropic is pushing **skills > plugins > subagents > agent teams** as the canonical extension layers, with **hooks as the deterministic safety net**. They are NOT pushing custom orchestrators (claude-flow, SuperClaude) — they're competing with them via Agent Teams.

---

## Patterns Beamix Lacks (Top 7)

Cross-referenced against the Beamix war room (CEO + 9 leads + 9 workers + 12 gsd-* + 426 skills + worktrees + QA gate). For each: what's missing, who has it, concrete adoption recipe.

### Lack 1 — Constitution / governance file with phase gates
**What's missing:** Beamix has CLAUDE.md (long, scattered guidance) and DECISIONS.md (50-entry archive) but no single versioned **constitution** that every spec inherits and every agent must reconcile against.
**Who has it:** spec-kit, BMAD (PRD), agent-os (standards index).
**Adoption recipe:** Create `docs/CONSTITUTION.md` (≤200 lines) with the 10–15 inviolable principles (e.g. "no Stripe; Paddle only", "no n8n; direct LLM", "Hebrew + English in docs", "QA gate is sacred"). Have CEO + every lead read it on first turn before any spec. Version it. Conflicts with constitution = automatic BLOCKED.

### Lack 2 — Multi-agent observability dashboard
**What's missing:** Beamix runs 50+ active worktrees right now (`git worktree list` showed 60+) with zero real-time visibility into which agent is doing what, which is blocked, which crashed.
**Who has it:** disler/claude-code-hooks-multi-agent-observability (1.4k stars, swim-lane Vue dashboard).
**Adoption recipe:** Wire SessionStart / SubagentStart / PreToolUse / Stop / SessionEnd hooks to POST to a local Bun+SQLite server. Vue client renders one swim-lane per active worktree. Use `/audit-board` slash command to open it.

### Lack 3 — Agent Teams (peer-to-peer messaging)
**What's missing:** Beamix is purely hierarchical (CEO → Lead → Worker). Workers cannot challenge each other or debate. Adversarial debate (the C-compiler pattern) is impossible.
**Who has it:** Anthropic Agent Teams (official, experimental); BMAD Party Mode; claude-flow swarm consensus.
**Adoption recipe:** For research-heavy or hypothesis-debugging tasks, set `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` and let CEO spawn a 3–5-member team for "competing hypothesis" investigations (e.g. "why is the Inbox slow"). Keep the existing hierarchy for build/ship work.

### Lack 4 — Vector-indexed cross-session memory
**What's missing:** Beamix memory is flat markdown (DECISIONS.md, LONG-TERM.md, USER-INSIGHTS.md, sessions/). No semantic search; agents must grep or read whole files. The 200-line MEMORY.md limit (already exceeded — see system reminder) proves flat doesn't scale.
**Who has it:** claude-flow's AgentDB with HNSW vector index; SuperClaude's Serena MCP server for memory.
**Adoption recipe:** Stand up a `mcp-memory` MCP server backed by pgvector (already in stack via Supabase). Index every session summary, decision, and skill on commit. Replace `Read DECISIONS.md` with `mcp__memory__search("auth flow decisions")`. Keep markdown as canonical source; vector as index.

### Lack 5 — Plugin packaging
**What's missing:** Beamix has 11 leads, 9 workers, 12 gsd-* agents, 426 skills, multiple slash commands — all scattered across `.claude/agents/`, `.agent/skills/`, `.claude/commands/`, `.mcp.json`. Cannot be shared, versioned, or installed atomically.
**Who has it:** anthropics/claude-plugins-official, wshobson/agents (185 agents → 80 plugins).
**Adoption recipe:** Bundle each lead's domain as a plugin: `build-lead-plugin/` containing the lead + its workers + its commands + the skills they reference + their MCP. `plugin.json` declares the bundle. Now Beamix is forkable / publishable / installable.

### Lack 6 — Session checkpoints (state, not just code)
**What's missing:** Beamix worktrees give code isolation but not **conversation/state checkpoints**. If a worker hallucinates and corrupts a 4-hour planning session, there's no rewind.
**Who has it:** opcode/claudia (Timeline & Checkpoints — Git-like snapshots with branching restore).
**Adoption recipe:** Use the Claude Code `/rewind` command (now standard) more aggressively. Checkpoint via SessionStart hook before every dispatch. Document a "rewind on QA fail" pattern in CLAUDE.md.

### Lack 7 — Standards extraction agent (auto-discover conventions)
**What's missing:** Beamix's ENGINEERING_PRINCIPLES.md, BRAND_GUIDELINES.md, and design system docs were all written by humans. They drift. Nothing scans the actual code and updates them.
**Who has it:** buildermethods/agent-os (Discover Standards → Deploy Standards loop).
**Adoption recipe:** Add a `standards-extractor` worker scheduled weekly (or on PR merge). It reads N recent PRs, extracts patterns ("80% of new components use `cn()` utility", "all API routes use Zod"), and proposes diffs to ENGINEERING_PRINCIPLES.md. Code Reviewer reviews. Drift handled.

### Bonus Lack 8 — Behavioral modes
**What's missing:** Beamix CEO has a fixed personality. Switching from "deep planning" to "ship fast" requires re-prompting.
**Who has it:** SuperClaude (7 behavioral modes — Brainstorming, Deep Research, Token-Efficiency, Introspection, etc.).
**Adoption recipe:** Add 4 modes as `/mode <name>` slash commands that swap the CEO's system prompt prelude: `brainstorm`, `ship`, `lean` (token-efficient), `introspect` (self-critique).

---

## Sources

Every claim above is sourced. Listed in citation order.

- [github/spec-kit](https://github.com/github/spec-kit) — fetched May 5, 2026 — stars/release/phases
- [bmadcode/BMAD-METHOD](https://github.com/bmadcode/BMAD-METHOD) — fetched May 5, 2026 — stars/v6.6.0/12+ personas/Party Mode
- [ruvnet/claude-flow (Ruflo)](https://github.com/ruvnet/claude-flow) — fetched May 5, 2026 — 43.2k stars/v3.6.30/SONA/AgentDB/27 hooks
- [wshobson/agents](https://github.com/wshobson/agents) — fetched May 5, 2026 — 34.8k stars/80 plugins/4-tier model routing
- [SuperClaude-Org/SuperClaude_Framework](https://github.com/SuperClaude-Org/SuperClaude_Framework) — fetched May 5, 2026 — 22.6k stars/7 modes/8 MCP
- [winfunc/opcode](https://github.com/winfunc/opcode) — fetched May 5, 2026 — 21.7k stars/Timeline & Checkpoints/v0.2.0 Aug 31 2025
- [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) — fetched May 5, 2026 — 18.6k stars/marketplace structure
- [humanlayer/humanlayer](https://github.com/humanlayer/humanlayer) — fetched May 5, 2026 — 10.7k stars/codelayer-0.20.0 Dec 23 2025
- [smtg-ai/claude-squad](https://github.com/smtg-ai/claude-squad) — fetched May 5, 2026 — 7.3k stars/v1.0.17 Mar 12 2026/tmux+worktrees
- [Pimzino/spec-workflow-mcp](https://github.com/Pimzino/spec-workflow-mcp) — fetched May 5, 2026 — 4.2k stars/approval workflow
- [buildermethods/agent-os](https://github.com/buildermethods/agent-os) — fetched May 5, 2026 — 4.5k stars/Discover Standards
- [disler/claude-code-hooks-multi-agent-observability](https://github.com/disler/claude-code-hooks-multi-agent-observability) — fetched May 5, 2026 — 1.4k stars/Bun+SQLite+Vue/12 hooks
- [stravu/crystal](https://github.com/stravu/crystal) — fetched May 5, 2026 — 3k stars/deprecated Feb 2026/successor Nimbalyst
- [imbue-ai/sculptor](https://github.com/imbue-ai/sculptor) — fetched May 5, 2026 — 149 stars/container isolation
- [disler/infinite-agentic-loop](https://github.com/disler/infinite-agentic-loop) — fetched May 5, 2026 — 577 stars/two-prompt infinite mode
- [centminmod/my-claude-code-setup](https://github.com/centminmod/my-claude-code-setup) — fetched May 5, 2026 — 2.3k stars/CoD/Z.AI/.worktreeinclude
- [Bhartendu-Kumar/rules_template](https://github.com/Bhartendu-Kumar/rules_template) — fetched May 5, 2026 — 1.1k stars/v2.0 Apr 16 2025
- [Pimzino/claude-code-spec-workflow](https://github.com/Pimzino/claude-code-spec-workflow) — fetched May 5, 2026 — 3.7k stars/4-phase/dashboard tunnel
- [Anthropic — Equipping agents with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) — Oct 16, 2025 announcement; SKILL.md/3-tier progressive disclosure
- [Anthropic — Building a C compiler with parallel Claudes](https://www.anthropic.com/engineering/building-c-compiler) — Feb 5, 2026; 16 agents/2,000 sessions/100k LOC
- [Claude Code docs — Sub-agents](https://code.claude.com/docs/en/sub-agents) — fetched May 5, 2026 — official subagent definition
- [Claude Code docs — Agent Teams](https://code.claude.com/docs/en/agent-teams) — fetched May 5, 2026 — experimental, v2.1.32+, lead/teammate/mailbox
- [Claude Code docs — Hooks](https://code.claude.com/docs/en/hooks) — fetched May 5, 2026 — 12 lifecycle events
- [ghacks.net — Anthropic enterprise plugins](https://www.ghacks.net/2026/02/25/anthropic-expands-claude-with-enterprise-plugins-and-marketplace/) — Feb 25, 2026
- [Pete Gypps — 36 official plugins guide](https://www.petegypps.uk/blog/claude-code-official-plugin-marketplace-complete-guide-36-plugins-december-2025) — Dec 2025
- [Anthropic — April 23 postmortem](https://www.anthropic.com/engineering/april-23-postmortem) — quality reports/v2.1.116
- [Anthropic 2026 Agentic Coding Trends Report](https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf) — Stripe 1,370 engineers, Ramp 80% incident reduction
- [dev.to — Spec Kit vs BMAD vs OpenSpec 2026](https://dev.to/willtorber/spec-kit-vs-bmad-vs-openspec-choosing-an-sdd-framework-in-2026-d3j) — independent comparison
- [Medium — Tim Wang Spec-driven AI coding comparison](https://medium.com/@tim_wang/spec-kit-bmad-and-agent-os-e8536f6bf8a4) — independent evaluation
- [trigidigital — BMAD vs Standard Prompting 2026](https://trigidigital.com/blog/bmad-vs-standard-prompting/) — Mar 2026
- [SwirlAI — Agent Skills Progressive Disclosure](https://www.newsletter.swirlai.com/p/agent-skills-progressive-disclosure) — design pattern analysis
- [code.claude.com/docs/en/best-practices](https://code.claude.com/docs/en/best-practices) — official Claude Code best practices
- [pixelmojo.io — 12 hooks events guide](https://www.pixelmojo.io/blogs/claude-code-hooks-production-quality-ci-cd-patterns) — 2026 hook patterns
- [claudefa.st — Claude Code 2026 changelog](https://claudefa.st/blog/guide/changelog) — release tracking
- [code.visualstudio.com — Multi-Agent Development blog](https://code.visualstudio.com/blogs/2026/02/05/multi-agent-development) — Feb 5, 2026

## Confidence Summary

**Overall: HIGH.** Every framework's stars/dates/features pulled directly from its README on May 5, 2026. Anthropic's direction sourced from their own engineering blog and docs site. Cross-referenced with three independent 2026 comparison reports (dev.to, Medium/Tim Wang, trigidigital). The only MEDIUM-confidence claims are: (a) claude-flow's specific performance multipliers ("150x–12,500x") which are vendor self-reported, and (b) humanlayer's current activity level (last release Dec 2025 — capability is real but momentum needs revalidation).

**Gaps:**
- Did not deep-fetch BMAD's full agent role definitions (have summary only).
- Did not benchmark token costs across frameworks (none publish reproducible numbers).
- Did not read each framework's most recent issues to assess production user pain points.
