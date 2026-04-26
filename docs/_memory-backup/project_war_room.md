---
name: War Room System
description: Beamix War Room — multi-CEO parallel agent orchestration system using tmux + Claude Code
type: project
---

# War Room System

The Beamix War Room is a parallel multi-agent orchestration system. Key components:

## Scripts
- `~/bin/beamix` — main CLI. Starts N CEO agents (1-8), each in its own git worktree + tmux window
- `~/bin/newproject` — scaffolds new projects from the GSA Startup Kit template
- `launch-team.sh` (in repo root) — lighter-weight alternative: 1 LEAD + 2 WORKERs in one tmux session using official Agent Teams feature (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 claude --teammate-mode tmux`)

## tmux Scripts (all at ~/.tmux/scripts/)
- `beamix-hq.sh` — HQ dashboard (last tmux window, refreshes every 5s, shows CEO status/commits/costs)
- `beamix-scratchpad.sh` — per-CEO 9-line scratchpad at bottom of each window
- `beamix-status.sh` — status bar
- `beamix-colors.sh` — shared Catppuccin Mocha color definitions

## War Room Dashboard (`war-room-dashboard/`)
A web-based real-time HQ. Stack: Bun + SQLite WAL (server) + React 19 + Vite + TypeScript + Zustand (client).
- **Server:** `war-room-dashboard/server/` — WebSocket server, collectors (hooks + JSONL + tmux), SQLite WAL
- **Client:** `war-room-dashboard/client/src/`
  - `App.tsx` — root, connects WebSocket
  - `components/Layout.tsx` — header + main + sidebar layout
  - `components/CeoCardGrid.tsx` — CEO status cards
  - `components/EventTimeline.tsx`, `RecentCommits.tsx`, `CostSummary.tsx`, `FileConflicts.tsx`, `MessageInbox.tsx`
  - `office/OfficeCanvas.tsx` — 2D animated office canvas (15fps, Canvas 2D API)
  - `office/AgentSprite.ts` — sprite class: CEO uses pixel art sprites from `/public/sprites/ceo-a-*.png`; workers use fallback circles. Layers: 1=CEO (largest, on top), 2=Lead, 3=Worker
  - `office/zones.ts` / `office/map.ts` — office tile map + zone routing
  - `office/pathfinder.ts` — A* pathfinding on tile grid (percentage-based coordinates)
  - `store.ts` — Zustand store (CEOs, costs, events, commits, conflicts)
  - `ws.ts` — WebSocket connection

## Data Pipeline
Claude Code Hooks → HTTP POST → Bun server → SQLite WAL → WebSocket → Zustand → React canvas

## Session State Files
- `~/.beamix/last.json` — session snapshot (for restore)
- `~/.beamix/history/` — per-CEO work records
- `.worktrees/ceo-N-TIMESTAMP/` — git worktrees per CEO
- `.worktrees/.registry` — CEO spawn timestamps
- `docs/08-agents_work/ceo-N-DATE.md` — handoff documents written by `beamix done`

**Why:** Enables parallel independent tasks across multiple AI agents, with monitoring, cost tracking, and conflict detection.
**How to apply:** When user asks about running multiple agents, managing parallel work, or the war room dashboard — reference this system.
