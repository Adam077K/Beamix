# Beamix — Claude Code Agent Teams Guide

> A practical setup guide for running multi-agent Claude Code sessions on the Beamix GEO Platform.

---

## Prerequisites

- Claude Code installed (`npm install -g @anthropic-ai/claude-code`)
- Authenticated with a **Team or Enterprise** Claude plan
- tmux installed (optional, for split-pane view): `brew install tmux`

---

## Step 1 — Enable Agent Teams

Add this flag to `~/.claude/settings.json` on your machine (run the included `setup-claude-agent-teams.sh` script to do it automatically):

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

Restart your terminal after saving.

---

## Step 2 — Launch Claude Code in the Beamix Repo

```bash
cd ~/path/to/Beamix
claude
```

Claude Code will automatically pick up `CLAUDE.md` as the project context for all agents and teammates.

---

## Step 3 — Start a Team Session (tmux recommended)

```bash
tmux new-session -s beamix
claude
```

In tmux you can see each teammate in its own pane. Use `Shift+Down` to cycle between teammates in standard terminal mode.

---

## The Beamix Agent Roster

These are the three agents already defined for this project. Each maps naturally to a teammate role in a team session:

| Agent | Role | Memory Location |
|-------|------|-----------------|
| **Rex** | GEO Research — competitive analysis, LLM signals, content strategy | `agent-memory/rex/MEMORY.md` |
| **Morgan** | Content Writer — GEO-optimized content, structured formatting | `agent-memory/morgan/` |
| **Atlas** | Query Researcher — tracks AI search queries, monitors citations | `agent-memory/atlas/` |

---

## Step 4 — Starting Your First Team

Paste this prompt into Claude Code to spin up a three-agent team:

```
Create an agent team for the Beamix GEO Platform project.

Team composition:
- Rex (Researcher): Audit saas-platform/src/app/api/ for GEO signal gaps —
  check for missing structured data, schema markup, and answer-first formatting.
  Reference agent-memory/rex/MEMORY.md for existing research context.

- Morgan (Content Writer): Review the landing page and scan flow
  (saas-platform/src/app/page.tsx and saas-platform/src/app/scan/) for
  GEO content optimization opportunities.

- Atlas (Query Researcher): Identify which user queries the platform
  currently handles and flag gaps vs. common SMB GEO queries.

Each teammate should share findings with the others before the final report.
Produce a combined action plan with prioritized recommendations.
```

---

## Common Team Patterns for Beamix

### Pattern A — Parallel Feature Development
Use when building cross-layer features (e.g. a new dashboard widget + its API route + DB migration):

```
Create a team:
- Teammate 1: Build the frontend component in saas-platform/src/components/
- Teammate 2: Build the API route in saas-platform/src/app/api/
- Teammate 3: Write the Supabase migration in saas-platform/supabase/
Share interfaces before implementation begins.
```

### Pattern B — GEO Audit + Fix Loop
Use for weekly GEO health checks:

```
Create a team:
- Researcher: Run a GEO audit against the 5 signals in agent-memory/rex/MEMORY.md
- Writer: Draft fixes for the top 3 gaps found
- Reviewer: Validate fixes against GEO best practices and check for regressions
```

### Pattern C — Competitive Research Sprint
Use when tracking competitor updates (HiGoodie, SEMrush, etc.):

```
Create a team:
- Teammate 1: Research HiGoodie feature updates
- Teammate 2: Research SEMrush AI visibility features
- Teammate 3: Update .planning/ with a comparative gap analysis
Save findings to agent-memory/rex/MEMORY.md.
```

---

## Key Files for Agent Context

Always make sure your agents reference these files for project context:

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Global project rules — auto-loaded by all agents |
| `agent-memory/rex/MEMORY.md` | GEO research, signals, competitive context |
| `.planning/` | PRD, architecture specs, source of truth |
| `saas-platform/src/` | Main codebase — Next.js app, API, components |

---

## Cost Tip

Each teammate uses ~5× more tokens than a single agent. Reserve teams for tasks that genuinely benefit from parallelism:

✅ **Good for teams:** Cross-layer features, research sprints, multi-file audits
❌ **Stick to single agent:** Small bug fixes, single-file edits, quick queries

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `TeamCreate` tool not available | Check `settings.json` has the env flag and restart terminal |
| Agent ignores project context | Make sure you launched `claude` from inside the Beamix repo |
| Teammates not sharing findings | Explicitly instruct them: *"share findings with other teammates before reporting"* |
| Token costs too high | Use subagents instead of a full team for smaller tasks |
