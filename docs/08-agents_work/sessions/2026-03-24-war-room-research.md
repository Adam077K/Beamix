---
session_id: 2026-03-24-war-room-research
date: 2026-03-24
lead: ceo
task: War Room competitive research + improvement proposals
status: complete
outcome: Research complete. 2 features selected for implementation.
---

# War Room Research — Competitive Landscape & Improvement Plan

## What Was Done

Deep research into 12 competing multi-agent orchestration projects. Analyzed what each does differently, what gaps exist in the current Beamix War Room, and what ideas are worth adapting.

---

## Projects Researched

| Project | Language | Key Innovation |
|---------|----------|---------------|
| **AMUX** (Mixpeek) | Python | Web PWA dashboard, REST API, auto-compact, per-session token tracking |
| **Overstory** (Jaymin West) | Node | 4-tier merge resolution, typed message protocol (8 types), file-level guards |
| **Gas Town** (Steve Yegge) | Go | Persistent agent identity, Seance (query predecessor decisions), Bors bisection |
| **CCPM** (Automaze) | Bash | GitHub Issues as task store, `conflicts_with` metadata, zero-token reporting |
| **Claude Squad** | Go | Simple TUI, multi-tool support (Claude+Codex+Aider), Homebrew installable |
| **Ruflo/Claude-Flow** | Node/npm | Self-learning, MCP orchestration tools, circuit breaker, skill-based routing |
| **Parallel Code** | Electron | GUI-first, agent-agnostic, visual diff+merge |
| **Agentrooms** | Web | @mention-based routing, remote agent support |
| **OpenHands** | Python | Sandboxed Docker execution, event-stream architecture |
| **VS Code Multi-Agent** | IDE | Session queuing, fork sessions, browser tools, request queuing |
| **JetBrains Central** | Enterprise | Governance, cost attribution, cloud runtimes, cross-repo context |
| **Native Agent Teams** | Claude Code | TeammateIdle hooks, plan approval mode, file-locking for task claims |

---

## Beamix War Room Strengths (vs. Competitors)

- **Session persistence + restore** — only Gas Town comes close
- **3-layer hierarchy** (CEO → Leads → Workers) — most competitors are flat
- **Briefing files** for pre-assignment — unique, no competitor has this
- **Scratchpad per CEO** — unique real-time context panel per agent
- **HQ dashboard** — richer than most (AMUX's web version is the only one better)
- **macOS notifications** on idle transitions
- **Handoff document generation** via `beamix done`
- **Skills library** (426+ on-demand) — no competitor has this depth

---

## Key Gaps Identified

### Gap 1: Context hooks warn but don't act
Current hooks show WARNING at 35% and CRITICAL at 25% remaining but leave the CEO burning tokens. AMUX auto-compacts at 20% with 5-minute cooldown.

### Gap 2: No cost visibility
Zero insight into per-CEO token spend. AMUX tracks tokens and estimated $ per session with vendor billing API integration.

### Gap 3: No automated merge handling
`beamix merge N` is entirely manual. Overstory has a 4-tier system: fast-forward → auto-merge → AI-rebase → human. CCPM uses `conflicts_with` metadata to prevent conflicts before they happen.

### Gap 4: Free-text inter-agent messages
`beamix send N "msg"` has no structure. Overstory uses 8 typed message types. Ruflo uses MCP tools. No programmatic handling possible.

### Gap 5: No persistent agent memory across CEOs
New CEOs have no knowledge of what previous CEOs learned. Gas Town's "Seance" pattern queries predecessor decisions. Beads store structured work state in git.

### Gap 6: No file ownership tracking
Two CEOs can unknowingly work on the same files. CCPM tracks `conflicts_with` per task.

---

## Full Improvement Roadmap (Prioritized)

### Tier 1 — High Impact, Buildable Now

**1. Automated Merge Conflict Resolution**
4-tier pipeline: fast-forward → auto-merge → AI-assisted rebase → human escalation.
Files: `~/bin/beamix` (merge function), new `~/bin/beamix-merge-ai.sh`

**2. Self-Healing Watchdog (Auto-Compact)** ← SELECTED FOR BUILD
Auto-send `/compact` at 20% context remaining. 5-min cooldown. Log to HQ.
Files: `.claude/hooks/gsa-context-monitor.js`

**3. Token/Cost Tracking Per CEO** ← SELECTED FOR BUILD
Parse JSONL session files for token data. `beamix cost [N]`. Cost column in `beamix ls`. HQ aggregate.
Files: `~/bin/beamix`, `~/.tmux/scripts/beamix-hq.sh`

**4. Typed Inter-Agent Messages**
Add message types: task, status, blocker, merge_ready, question, info. HQ groups by type.
Files: `~/bin/beamix`, `~/.tmux/scripts/beamix-hq.sh`

### Tier 2 — Medium Impact, More Effort

**5. Persistent Agent Memory (Seance Pattern)**
On `beamix done`, extract decisions into structured handoff. `beamix history [area]` queries past work.
Files: `~/bin/beamix`, new `~/.beamix/history.db`

**6. Proactive Conflict Prevention**
Track file ownership per CEO from `git diff --stat`. Warn when two CEOs touch the same file.
Files: `~/bin/beamix`, `~/.tmux/scripts/beamix-hq.sh`

**7. Briefing File Improvements**
YAML frontmatter with priority, depends_on, domain, expected_output. Auto-routing by domain.
Files: `~/bin/beamix`, new `~/bin/beamix-brief-gen.sh`

**8. Web Dashboard (Stretch)**
Node.js/Bun server + WebSocket. REST API. Mobile PWA.
Files: new `~/.beamix/dashboard/`

### Tier 3 — Future

- Runtime-agnostic design (mix Claude Code + Codex/Gemini)
- Event stream / audit log for replay
- Native Agent Teams hybrid
- Circuit breaker for repeated API failures

---

## Features Selected for Implementation (2026-03-24)

1. **Auto-compact watchdog** — `.claude/hooks/gsa-context-monitor.js`
   - When context ≤ 20% remaining, auto-send `/compact` to the agent pane via tmux
   - 5-minute cooldown between auto-compacts (prevent rapid-fire compacting)
   - Log each auto-compact with timestamp in HQ dashboard
   - `--no-autocompact` flag support in `beamix` for sensitive work

2. **Token/cost tracking** — `~/bin/beamix` + `~/.tmux/scripts/beamix-hq.sh`
   - Parse Claude JSONL session files for `usage` fields (input_tokens, output_tokens, cache_read, cache_creation)
   - Pricing: Sonnet $3/$15 per M tokens, Opus $5/$25, Haiku $1/$5
   - `beamix cost [N]` — per-CEO breakdown (input/output/cache/total/$)
   - `beamix cost --total` — full war room session aggregate
   - `beamix ls` gains a cost column
   - HQ dashboard gains cost row per CEO

---

## Sources

- [AMUX GitHub](https://github.com/mixpeek/amux)
- [Overstory GitHub](https://github.com/jayminwest/overstory)
- [Gas Town GitHub](https://github.com/steveyegge/gastown)
- [CCPM GitHub](https://github.com/automazeio/ccpm)
- [Claude Squad GitHub](https://github.com/smtg-ai/claude-squad)
- [Ruflo GitHub](https://github.com/ruvnet/ruflo)
- [Anthropic Agent Teams Docs](https://code.claude.com/docs/en/agent-teams)
- [VS Code Multi-Agent Blog](https://code.visualstudio.com/blogs/2026/02/05/multi-agent-development)
- [JetBrains Central](https://blog.jetbrains.com/blog/2026/03/24/introducing-jetbrains-central-an-open-system-for-agentic-software-development/)
