---
session_id: 2026-03-25-war-room-dashboard-research
date: 2026-03-25
lead: ceo
task: Research for web-based war room dashboard with animated 2D agent office
status: complete
outcome: Full research complete. Architecture decided. Ready for build.
---

# War Room Web Dashboard — Research & Architecture

## Goal

Build a web-based dashboard for the Beamix war room that includes:
1. Real-time agent status monitoring (all CEOs + spawned workers)
2. A 2D animated "office" where agent characters move based on their current activity
3. Cost tracking, message inbox, event log — all the data the CLI shows, but in a browser

---

## Directly Relevant Projects Found (All 2026)

### Pixel Agents (VS Code Extension)
- **What:** Animated pixel characters in VS Code representing Claude Code agents
- **Tech:** TypeScript, React 19, Vite, **Canvas 2D**, 32x32px sprites, BFS pathfinding
- **Data:** Reads JSONL transcript files passively — no Claude Code modification needed
- **Repo:** [github.com/pablodelucca/pixel-agents](https://github.com/pablodelucca/pixel-agents)

### Pixel Agent Desk (Electron)
- **What:** Standalone Electron app with pixel office, activity heatmaps, token analytics
- **Tech:** JavaScript, CSS, HTML, Node.js 20+, Electron, hooks via `settings.json`
- **Features:** Click avatars to focus terminals, PiP mode, sub-agent + team support
- **Repo:** [github.com/Mgpixelart/pixel-agent-desk](https://github.com/Mgpixelart/pixel-agent-desk)

### AgentRoom (Tauri Desktop)
- **What:** Pixel art office with Work Rooms and Break Rooms
- **Tech:** Tauri v2 (Rust + web), React 18, TypeScript, Canvas 2D, 32x32px tiles (SkyOffice tileset)
- **Data:** Rust file watcher for JSONL monitoring via Tauri events
- **States:** typing (writing code), reading (file search), idle (awaiting input), BFS pathfinding
- **Repo:** [github.com/liuyixin-louis/agentroom](https://github.com/liuyixin-louis/agentroom)

### Claw Empire (React + PixiJS)
- **What:** AI agent office simulator — you're the CEO managing departments
- **Tech:** React 19, Vite 7, Tailwind 4, **PixiJS 8**, Express 5, SQLite, WebSocket, Zod 4
- **Visual:** Pixel office with 6 departments, agents walk between them
- **Features:** XP ranking, department assignments, real-time WebSocket sync
- **Repo:** [github.com/GreenSheep01201/claw-empire](https://github.com/GreenSheep01201/claw-empire)

### OpenClaw Office (React + SVG/3D)
- **What:** Visual monitoring for multi-agent system with dual 2D/3D mode
- **Tech:** React 19, Vite 6, SVG for 2D, React Three Fiber for 3D, Zustand 5, WebSocket
- **Visual:** Isometric SVG floor plan + optional 3D mode with hologram effects
- **States:** idle, working, speaking, tool_calling, error
- **Features:** Collaboration links between agents, speech bubbles, token charts, cost pies
- **Repo:** [github.com/WW-AI-Lab/openclaw-office](https://github.com/WW-AI-Lab/openclaw-office)

### Mission Control (Full Dashboard)
- **What:** Self-hosted dashboard for AI agent fleets, 31+ panels
- **Tech:** React 19, Next.js 16, Tailwind, Zustand, SQLite WAL, WebSocket + SSE, Recharts
- **Features:** Kanban, memory knowledge graph, live session monitoring, 101 REST endpoints
- **Repo:** [github.com/builderz-labs/mission-control](https://github.com/builderz-labs/mission-control)

---

## Agent Monitoring Dashboards (Non-Office)

### AgentDock
- **Tech:** Bun + Hono (backend), React + Vite + xterm.js (frontend), WebSocket
- **Data:** Polls `tmux capture-pane` at 200ms, keystrokes forwarded via `tmux send-keys`
- **Repo:** [github.com/vishalnarkhede/agentdock](https://github.com/vishalnarkhede/agentdock)

### AMUX
- **Tech:** Single 23K-line Python file with embedded HTML dashboard, SQLite, PWA
- **Data:** Parses ANSI-stripped tmux output directly (non-invasive)
- **Features:** Session cards, live terminal peek, kanban, mobile PWA, Background Sync
- **Repo:** [github.com/mixpeek/amux](https://github.com/mixpeek/amux)

### Agent-Flow
- **Tech:** VS Code extension + React web UI, interactive node graph
- **Data:** Claude Code Hooks (HTTP hook server) + JSONL replay
- **Repo:** [github.com/patoles/agent-flow](https://github.com/patoles/agent-flow)

### Claude Code Hooks Observability (disler)
- **Tech:** Bun + SQLite WAL + Vue 3 + Canvas charting, WebSocket
- **Data:** Claude Code lifecycle hooks fire Python → HTTP POST → Bun → SQLite → WebSocket → Vue
- **Events:** 12 types (PreToolUse, PostToolUse, SessionStart/End, SubagentStart/Stop, etc.)
- **Repo:** [github.com/disler/claude-code-hooks-multi-agent-observability](https://github.com/disler/claude-code-hooks-multi-agent-observability)

### Recon (tmux-native with Tamagotchi view)
- **Tech:** Rust (TUI), reads `~/.claude/sessions/*.json` + JSONL files
- **Features:** Pixel-art creatures using Unicode half-blocks, state-driven animations
- **States:** Working (green), Input (orange), Idle (blue-grey), New
- **Repo:** [github.com/gavraz/recon](https://github.com/gavraz/recon)

---

## Virtual Office Inspiration

| Platform | Style | Tech | Key Insight |
|----------|-------|------|-------------|
| **Gather.Town** | 90s pixel RPG, 32x32 tiles | Browser, WebRTC | Pioneer of "walk up to talk" metaphor |
| **WorkAdventure** | 16-bit RPG pixel art | TypeScript, Svelte, Docker, Tiled editor | Open source, proximity chat |
| **SoWork** | 2.5D isometric (Sims/Animal Crossing) | Browser | AI assistant "Sophia" observes office |
| **Stanford Generative Agents** | Top-down 2D sprite sandbox | Python, Django, Tiled editor | 25 agents with memory + emergent behavior |
| **a16z AI Town** | Pixel art tile-based | **PixiJS**, Convex, Ollama | Best JS/TS starter kit, MIT licensed |

---

## Data Pipeline Architecture (Recommended)

```
Claude Code CEO sessions (tmux)
    │
    ├── Claude Code Hooks (official API, 12 event types)
    │   └── HTTP POST → Bun/Node.js server
    │
    ├── Session JSONL files (~/.claude/projects/)
    │   └── File watcher → parse token/context/model data
    │
    ├── beamix state files (~/.beamix/)
    │   ├── events.jsonl (audit log)
    │   ├── messages/ceo-N.jsonl (typed messages)
    │   ├── history/ceo-N-*.json (seance records)
    │   └── last.json (snapshot)
    │
    └── tmux capture-pane (fallback for terminal content)
        └── Poll every 1-2s for idle/active detection

All → SQLite WAL (persistent storage)
   → WebSocket (real-time push to browser)
      → Zustand (client state)
         → React + Canvas/PixiJS (rendering)
```

---

## Rendering Technology Decision

| Technology | Performance | Best For | Our Choice |
|-----------|-------------|----------|------------|
| **PixiJS 8** | Best (WebGL) | Complex pixel office, many sprites | **YES — primary renderer** |
| Canvas 2D | Good | Simple scenes, < 50 objects | Fallback |
| SVG + CSS | Good for few elements | Clean isometric layouts | Optional overlay |
| React Three Fiber | GPU accelerated | 3D mode | Future stretch |

**Decision: PixiJS 8** — proven by Claw Empire and a16z AI Town for exactly this use case.

---

## Office Layout Zones (Proposed)

| Zone | What happens here | Agent states shown |
|------|-------------------|-------------------|
| **Desks** | Active coding work | writing code, editing files |
| **Whiteboard area** | Planning, architecture discussion | reading docs, planning |
| **Meeting room** | Agent-to-agent collaboration | subagent communication |
| **Coffee area / lounge** | Idle, waiting for input | idle, awaiting prompt |
| **Server room** | Running tests, deployments | executing tools |
| **Filing cabinet** | Searching files, reading code | Grep, Glob, Read tool use |
| **Exit door** | Agent completed and done | completed state |

---

## Key Technical Decisions

1. **Data source:** Claude Code Hooks (primary) + beamix state files + JSONL session files
2. **Transport:** WebSocket for real-time
3. **Storage:** SQLite WAL for persistence
4. **Rendering:** PixiJS 8 for the 2D office, React for dashboard panels
5. **Sprite style:** 32x32 pixel art (industry standard — Gather, Pixel Agents, AgentRoom all use this)
6. **Pathfinding:** BFS on tile grid (proven by Pixel Agents and AgentRoom)
7. **Map editor:** Tiled-compatible JSON format (industry standard)
8. **Framework:** React 19 + Vite + TypeScript

---

## Novel Aspect

No web-based game-like agent dashboard exists yet (confirmed by exhaustive search). Recon's tamagotchi view is terminal-only. This would be the first browser-based animated 2D office for AI coding agent monitoring.

---

## Sources

- [Pixel Agents](https://github.com/pablodelucca/pixel-agents)
- [Pixel Agent Desk](https://github.com/Mgpixelart/pixel-agent-desk)
- [AgentRoom](https://github.com/liuyixin-louis/agentroom)
- [Claw Empire](https://github.com/GreenSheep01201/claw-empire)
- [OpenClaw Office](https://github.com/WW-AI-Lab/openclaw-office)
- [Mission Control](https://github.com/builderz-labs/mission-control)
- [AgentDock](https://github.com/vishalnarkhede/agentdock)
- [AMUX](https://github.com/mixpeek/amux)
- [Agent-Flow](https://github.com/patoles/agent-flow)
- [Claude Code Hooks Observability](https://github.com/disler/claude-code-hooks-multi-agent-observability)
- [Recon](https://github.com/gavraz/recon)
- [WorkAdventure](https://github.com/workadventure/workadventure)
- [a16z AI Town](https://github.com/a16z-infra/ai-town)
- [Stanford Generative Agents](https://github.com/joonspk-research/generative_agents)
- [WebMux](https://github.com/nooesc/webmux)
- [Claude Code Hooks Docs](https://code.claude.com/docs/en/hooks)
