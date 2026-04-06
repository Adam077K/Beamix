# Beamix War Room — Complete Guide

## What This Is

The Beamix War Room is a system for running multiple Claude Code CEO agents in parallel. Each CEO gets its own isolated git worktree, its own tmux window (or grid pane), and its own Claude Code session. You dispatch tasks to them, monitor their progress from a live HQ dashboard, and merge their work when done.

The stack: **Ghostty** (terminal) → **tmux** (session manager) → **Claude Code** (AI agents)

---

## Quick Start

```bash
beamix 3                                    # Start 3 CEO agents
beamix 3 --grid                             # Start 3 agents in a side-by-side grid
beamix 3 --brief tasks.md                   # Start 3 agents with pre-assigned tasks
beamix brief generate "build auth" 3        # Auto-generate a briefing, then use it
beamix 3 --bare                             # Start 3 blank Claude sessions (no CEO preamble)
```

When the war room opens:
- Each CEO window has Claude Code running with `@"ceo (agent)"` and the CEO preamble pre-typed
- The model is set to Opus in plan mode (`/model opusplan`)
- **You press Enter** in each CEO window to activate — the message is typed but not sent
- The HQ dashboard is the last window tab showing all CEO statuses

---

## Terminal Setup

### Ghostty

| Setting | What it does |
|---------|-------------|
| `Ctrl+Cmd+C` | Global dropdown terminal — use this to run `beamix` commands without leaving your current window |
| `Shift+Enter` | Newline inside Claude Code (sends literal `\n`) |
| `Option` key | Acts as Alt (needed for Claude Code's `Alt+P` model picker) |

### tmux

| Shortcut | What it does |
|----------|-------------|
| `Ctrl+B 1-N` | Switch to CEO-1 through CEO-N |
| `Ctrl+B $` | Jump to last window (HQ) |
| `Ctrl+B d` | Detach from session (war room keeps running) |
| `Ctrl+B z` | Zoom current pane to full screen (press again to un-zoom) |
| `Ctrl+B ←→↑↓` | Navigate between panes (in grid mode) |
| `Ctrl+B \|` | Split window vertically |
| `Ctrl+B -` | Split window horizontally |
| `Ctrl+B s` | Session picker |
| `Ctrl+B w` | Window picker |
| `Ctrl+B r` | Reload tmux config |

---

## All Commands

### Starting & Stopping

| Command | What it does |
|---------|-------------|
| `beamix [N]` | Start war room with N CEOs (default 3, max 8) |
| `beamix [N] --grid` | Start in grid mode — all CEOs in one window as side-by-side panes |
| `beamix [N] --brief file.md` | Start with a briefing file that auto-assigns tasks per CEO |
| `beamix [N] --bare` | Start N blank Claude sessions with no CEO agent or preamble |
| `beamix add` | Add a new CEO to a running war room |
| `beamix done N` | Handoff CEO-N — commits work, writes history record, removes worktree, closes window |
| `beamix kill` | Destroy the entire war room. Saves a snapshot first so you can restore later |
| `beamix restore` | Restore the last killed session — recreates worktrees, relaunches Claude |

### Monitoring

| Command | What it does |
|---------|-------------|
| `beamix ls` | List all active CEOs with task label, branch, commits, time alive, active/idle status |
| `beamix diff N` | Show what CEO-N has changed vs main (`git diff --stat`) |
| `beamix files` | Show which files each CEO has touched — flags overlap warnings between CEOs |
| `beamix log` | Show handoff documents from `docs/08-agents_work/ceo-*.md` |
| `beamix history [query]` | Show past CEO work sessions from `~/.beamix/history/`. Searchable by keyword |
| `beamix cost [N]` | Show token cost breakdown for CEO-N (model, input/output/cache tokens, $) |
| `beamix cost --total` | Show aggregate token cost for the entire running session |
| `beamix events [type] [N]` | Show last N events, optionally filtered by type |
| `beamix events clear` | Clear the event log |

### Communication

| Command | What it does |
|---------|-------------|
| `beamix send N "message"` | Type a message into CEO-N's Claude and press Enter — without switching windows |
| `beamix send N --type TYPE "message"` | Same, with a message type badge (task, blocker, merge, question) |
| `beamix broadcast "message"` | Send the same message to ALL active CEOs at once |
| `beamix broadcast --type TYPE "message"` | Broadcast with a message type badge |
| `beamix inbox [N]` | Show message inbox for CEO-N (or all CEOs if N omitted) |
| `beamix task N "label"` | Set a task label for CEO-N — visible in HQ, `ls`, and the scratchpad |

### Briefings

| Command | What it does |
|---------|-------------|
| `beamix brief generate "task" [N]` | Auto-generate a briefing file for N CEOs from a task description |

Run `beamix 3 --brief output.md` to use the generated file immediately.

### Git & Cleanup

| Command | What it does |
|---------|-------------|
| `beamix merge N` | Merge CEO-N's branch into main (use after `beamix done N`) |
| `beamix grid` | Switch a running multi-window session to a grid view |
| `beamix clear-sessions` | Delete the saved session snapshot (`~/.beamix/last.json`) |
| `beamix prune-branches` | Delete old `ceo-*` branches that are no longer needed |
| `beamix migrate-sessions` | Move orphaned CEO sessions into the main project |

---

## Window Layout

### Normal Mode (`beamix 3`)

```
┌──────────────────────────────────────────┐
│  Claude Code TUI (pane .1)               │
│  ❯ @"ceo (agent)" [preamble]            │
│                                          │
│  [Claude's responses appear here]        │
│                                          │
├──────────────────────────────────────────┤  ← 9-line scratchpad
│  ▸ CEO-1  ceo-1-174xxx  auth  +3  23m   │
│  feat(auth): fix session expiry          │
│  src/middleware.ts | 14 ++++            │
└──────────────────────────────────────────┘

Windows: CEO-1 | CEO-2 | CEO-3 | HQ
```

Each CEO gets its own tmux **window** with a 9-line **scratchpad** at the bottom. The scratchpad shows branch, task label, commit count, time alive, and last commit. It refreshes every 15 seconds.

### Grid Mode (`beamix 3 --grid`)

```
┌──────────────┬──────────────┬──────────────┐
│              │              │              │
│   CEO-1      │   CEO-2      │   CEO-3      │
│   (purple)   │   (green)    │   (blue)     │
│              │              │              │
│   ❯          │   ❯          │   ❯          │
│              │              │              │
└──────────────┴──────────────┴──────────────┘

Windows: GRID | HQ
```

All CEOs in one window. No scratchpads (too small). Each pane has a colored border. Navigate with `Ctrl+B ←→`. Zoom one pane with `Ctrl+B z`.

- 2-3 CEOs: equal vertical columns
- 4+ CEOs: tiled grid

### HQ Dashboard

The last window in every session. Shows a live dashboard refreshing every 5 seconds:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  BEAMIX HQ  ·  3 CEOs  ·  20:14:32
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ● CEO-1 ████  auth-fixes       +3  23m
    task:  fix session expiry on mobile
    last:  feat(auth): fix session expiry

  ○ CEO-3 ████  billing          +0  41m
    task:  add rate limiting
    last:  (no commits yet)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  RECENT COMMITS
  20:11  CEO-2  feat(scan): add Perplexity adapter
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

- `●` = Claude is actively working
- `○` = Claude is idle (waiting for input)
- Dead CEOs are hidden automatically
- macOS notification triggers when a CEO goes from active → idle

### Status Bar

Bottom-right of tmux shows: `[3 CEOs] Beamix · 20:14`

Updates every 10 seconds. Works in both normal and grid mode.

---

## Briefing Files

Create a markdown file with `## CEO-N` sections to auto-assign tasks on startup:

```markdown
## CEO-1
Build the auth system with Supabase. Include login, signup,
forgot-password flows.

## CEO-2
Create the dashboard page with sidebar navigation.

## CEO-3
Set up the database schema and migrations.
```

Run: `beamix 3 --brief briefing.md`

Each CEO receives its task automatically after Claude starts. First 5 lines of each section are used.

---

## Session Lifecycle

### Starting a Session

```
beamix 3
  → Creates 3 git worktrees (.worktrees/ceo-1-xxx, ceo-2-xxx, ceo-3-xxx)
  → Creates tmux session "beamix" with 3 CEO windows + HQ
  → Launches Claude Code in each window
  → Sets model to Opus plan mode (/model opusplan)
  → Types @"ceo (agent)" + preamble (you press Enter to start)
  → Adds 9-line scratchpad to each window
  → Sets status bar
```

### Working

- Switch between CEOs: `Ctrl+B 1`, `Ctrl+B 2`, `Ctrl+B 3`
- Check HQ: `Ctrl+B $` (last window)
- Send tasks without switching: `beamix send 2 "refactor the scan engine"`
- Label CEOs: `beamix task 1 "auth fixes"`
- Check progress: `beamix ls` or `beamix diff 2`

### Closing a CEO

```
beamix done 2
  → Commits all uncommitted changes in CEO-2's worktree
  → Writes a history record to ~/.beamix/history/
  → Writes a handoff document to docs/08-agents_work/
  → Removes the worktree directory
  → Closes the tmux window
  → Branch is kept — use beamix merge 2 to merge it, or beamix prune-branches to clean up
```

### Killing the War Room

```
beamix kill
  → Warns if any CEO has uncommitted changes
  → Saves session snapshot to ~/.beamix/last.json
  → Removes all worktree directories (branches are kept)
  → Destroys the tmux session
```

### Restoring

```
beamix restore
  → Reads ~/.beamix/last.json
  → For each CEO: checks if the branch still exists
  → Recreates missing worktrees from their branches
  → Launches Claude with --resume <session_id> (conversation history restored)
  → Sets up scratchpads, HQ, status bar
  → Types the CEO preamble (you press Enter)
```

---

## CEO Agent System

Every CEO session starts with `/model opusplan` (Opus model in plan mode) and this preamble:

> You are the CEO and Orchestrator — the entry point for every task in a 3-layer agent system. Layer 1 (you): Understand, plan, and delegate. Layer 2: Team Leads (build, design, QA, research, data, product, growth, devops, business). Layer 3: Workers called by Leads. Before every task: read CLAUDE.md, ceo.md, load matching skills from MANIFEST.json. Skills are not optional.

The CEO plans with Opus (high quality), then executes with Sonnet (cost-efficient) when you approve the plan.

---

## Creating New Projects

```bash
newproject mystartup                  # Public repo, 3 CEOs
newproject mystartup --ceos 5         # 5 CEOs
newproject mystartup --private        # Private GitHub repo
newproject mystartup --no-github      # Skip GitHub
```

This:
1. Creates `~/VibeCoding/mystartup/`
2. Clones the GSA Startup Kit
3. Re-initializes git (clean history)
4. Creates a GitHub repo (optional)
5. Generates `~/bin/mystartup` — a project-specific war room script (copy of beamix with different session/project names)
6. Offers to launch the war room immediately

After setup, `mystartup 3` works exactly like `beamix 3` but for the new project.

---

## File Locations

| File | Purpose |
|------|---------|
| `~/bin/beamix` | Main war room script |
| `~/bin/newproject` | Project scaffolder |
| `~/.tmux/scripts/beamix-hq.sh` | HQ dashboard renderer |
| `~/.tmux/scripts/beamix-scratchpad.sh` | Per-CEO scratchpad renderer |
| `~/.tmux/scripts/beamix-status.sh` | Status bar script |
| `~/.tmux/scripts/beamix-colors.sh` | Shared Catppuccin color definitions |
| `~/.beamix/last.json` | Session snapshot (for restore) |
| `~/.zsh/completions/_beamix` | Zsh tab completion |
| `~/.config/ghostty/config` | Ghostty terminal config |
| `~/.tmux.conf` | tmux config |

### Per-Session Files (inside project)

| File | Purpose |
|------|---------|
| `.worktrees/ceo-N-TIMESTAMP/` | Git worktree directory for CEO-N |
| `.worktrees/.registry` | CEO spawn timestamps (for time-alive tracking) |
| `.worktrees/ceo-N.task` | Task label for CEO-N |
| `.worktrees/ceo-N.session` | Claude session ID (for restore) |
| `docs/08-agents_work/ceo-N-DATE.md` | Handoff documents (written by `beamix done`) |

---

## tmux Complete Reference

### Sessions

| Command | What it does |
|---------|-------------|
| `tmux new -s name` | Create a new named session |
| `tmux ls` | List all sessions |
| `tmux attach -t name` | Attach to a session |
| `tmux kill-session -t name` | Kill a session |
| `tmux kill-server` | Kill ALL sessions (nuclear option) |
| `tmux switch -t name` | Switch to another session (from inside tmux) |
| `Ctrl+B d` | Detach from current session |
| `Ctrl+B s` | Session picker (interactive) |
| `Ctrl+B $` | Rename current session |
| `Ctrl+B (` | Switch to previous session |
| `Ctrl+B )` | Switch to next session |

### Windows (tabs)

| Command | What it does |
|---------|-------------|
| `Ctrl+B c` | Create new window |
| `Ctrl+B ,` | Rename current window |
| `Ctrl+B &` | Close current window (with confirmation) |
| `Ctrl+B w` | Window picker (interactive list of all windows) |
| `Ctrl+B 0-9` | Jump to window by number |
| `Ctrl+B n` | Next window |
| `Ctrl+B p` | Previous window |
| `Ctrl+B l` | Last used window (toggle) |
| `Ctrl+B f` | Find window by name |
| `tmux move-window -t N` | Move current window to position N |
| `tmux swap-window -t N` | Swap current window with window N |

### Panes (splits)

| Command | What it does |
|---------|-------------|
| `Ctrl+B \|` | Split vertically (side by side) — custom binding |
| `Ctrl+B -` | Split horizontally (top/bottom) — custom binding |
| `Ctrl+B %` | Split vertically (default tmux) |
| `Ctrl+B "` | Split horizontally (default tmux) |
| `Ctrl+B ←→↑↓` | Navigate between panes |
| `Ctrl+B z` | Zoom pane to full screen / un-zoom back |
| `Ctrl+B x` | Close current pane (with confirmation) |
| `Ctrl+B q` | Show pane numbers (press a number to jump) |
| `Ctrl+B o` | Cycle to next pane |
| `Ctrl+B ;` | Toggle between last two active panes |
| `Ctrl+B {` | Move current pane left/up |
| `Ctrl+B }` | Move current pane right/down |
| `Ctrl+B !` | Break pane out into its own window |
| `Ctrl+B Space` | Cycle through pane layouts (even-horizontal, even-vertical, tiled, etc.) |
| `Ctrl+B Alt+1` | Even horizontal layout |
| `Ctrl+B Alt+2` | Even vertical layout |
| `Ctrl+B Alt+3` | Main horizontal (one large, rest small) |
| `Ctrl+B Alt+4` | Main vertical (one large, rest small) |
| `Ctrl+B Alt+5` | Tiled layout |

### Pane Resizing

| Command | What it does |
|---------|-------------|
| `Ctrl+B Alt+←→↑↓` | Resize pane by 5 cells in that direction |
| Hold `Ctrl+B`, then `←→↑↓` | Resize pane by 1 cell (repeat) |
| Mouse drag on pane border | Resize by dragging (mouse mode is ON) |

### Copy Mode (scrollback)

| Command | What it does |
|---------|-------------|
| `Ctrl+B [` | Enter copy mode (scroll through history) |
| `q` or `Esc` | Exit copy mode |
| `↑↓` or `PgUp/PgDn` | Scroll in copy mode |
| Mouse scroll | Scroll through pane history (mouse mode ON) |
| `Ctrl+B ]` | Paste from tmux buffer |

### Synchronized Panes (broadcast)

| Command | What it does |
|---------|-------------|
| `tmux setw synchronize-panes on` | Turn on — every keystroke goes to ALL panes in the window |
| `tmux setw synchronize-panes off` | Turn off |

Useful for running the same command in all grid panes simultaneously.

### Nuclear Reset — Delete All tmux Sessions + Saved State

If tmux-resurrect/continuum keeps restoring old sessions and you want a completely clean slate:

```bash
tmux kill-server && rm -rf ~/.local/share/tmux/resurrect
```

This kills every tmux session AND deletes all saved session snapshots so nothing comes back on restart. The save files live in `~/.local/share/tmux/resurrect/` (NOT `~/.tmux/resurrect/`).

### From the Command Line (outside tmux)

```bash
# Session management
tmux ls                                    # List sessions
tmux new -s mysession                      # New session
tmux attach -t mysession                   # Attach
tmux kill-session -t mysession             # Kill one
tmux kill-server                           # Kill everything

# Send keys to a specific pane (how beamix works internally)
tmux send-keys -t session:window.pane "command" Enter

# Capture pane content
tmux capture-pane -t session:window.pane -p    # Print to stdout

# List windows/panes
tmux list-windows -t session
tmux list-panes -t session:window

# Resize a pane
tmux resize-pane -t session:window.pane -D 10   # Down 10 rows
tmux resize-pane -t session:window.pane -R 20   # Right 20 cols
```

---

## Ghostty Complete Reference

### Keyboard Shortcuts

| Shortcut | What it does |
|----------|-------------|
| `Ctrl+Cmd+C` | Toggle quick terminal (global — works from any app) |
| `Shift+Enter` | Newline in Claude Code (sends `\n`) |
| `Cmd+T` | New tab |
| `Cmd+W` | Close tab |
| `Cmd+N` | New window |
| `Cmd+Shift+D` | Split pane (Ghostty native split, not tmux) |
| `Cmd+D` | Split pane horizontally |
| `Cmd+[` / `Cmd+]` | Switch between Ghostty splits |
| `Cmd+1-9` | Switch to Ghostty tab by number |
| `Cmd++` / `Cmd+-` | Increase / decrease font size |
| `Cmd+0` | Reset font size |
| `Cmd+K` | Clear terminal |
| `Cmd+F` | Find in terminal output |

### Quick Terminal (Dropdown)

The quick terminal is a Quake-style dropdown overlay:
- **Toggle:** `Ctrl+Cmd+C` (works even when Ghostty isn't focused)
- **Position:** Top of screen
- **Size:** 40% of screen height
- **Auto-hide:** Yes — clicking outside closes it
- **Animation:** 0.2 seconds

Use it for all `beamix` commands — you don't need to leave your current window.

### Current Configuration

```
Terminal:     Ghostty
Font:         JetBrains Mono, size 14, thickened
Theme:        Catppuccin Mocha (dark) / Catppuccin Latte (light)
Transparency: 95% with blur
Padding:      8px all sides
Tab style:    macOS native tabs
Mouse:        Hide while typing
Shell:        Auto-detect (zsh)
```

### Ghostty vs tmux Splits

Ghostty has its own split panes (`Cmd+D`), separate from tmux splits (`Ctrl+B |`). In the war room:
- **Use tmux splits** — the war room is built on tmux
- **Ghostty splits** are useful for quick side-by-side work outside tmux
- Don't mix them — it gets confusing

---

## Claude Code Reference

### Key Commands Inside Claude

| Command | What it does |
|---------|-------------|
| `/model` | Change model (toggle between Sonnet/Opus) |
| `/model opusplan` | Switch to Opus in plan mode |
| `/plan` | Enter plan mode (Claude proposes, you approve) |
| `/compact` | Compress conversation context (saves tokens) |
| `/clear` | Clear conversation and start fresh |
| `/help` | Show Claude Code help |
| `@"agent (agent)"` | Invoke a named agent (e.g., `@"ceo (agent)"`) |
| `Shift+Enter` | Newline in your message |
| `Escape` | Cancel current generation |
| `Alt+P` | Quick model picker |
| `↑` | Recall previous message |

### Agent Teams

The war room uses `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`. This enables:
- Spawning subagents (Claude Code spawns its own child agents)
- Agent-to-agent messaging
- Isolated worktrees per agent
- The 3-layer CEO → Lead → Worker hierarchy

### Session Management

```bash
claude                           # Start new session
claude --resume <session-id>     # Resume a specific conversation
claude --continue                # Continue most recent conversation
claude --name "my-session"       # Name this session for easy resume
```

---

## Tips

- **Use the Ghostty dropdown** (`Ctrl+Cmd+C`) for all beamix commands — faster than switching windows
- **Label your CEOs early** — `beamix task 1 "auth"` so you know who's doing what
- **Check HQ regularly** — it shows active/idle status and recent commits across all CEOs
- **Use `beamix send`** to dispatch tasks without context-switching
- **Use `beamix broadcast`** for architectural decisions that affect all CEOs
- **Use `beamix brief generate "task" 3`** to auto-generate a briefing — then `beamix 3 --brief output.md`
- **Use `beamix files`** when multiple CEOs are working — it flags overlapping file edits before conflicts happen
- **Use `beamix cost`** to see how much a session has cost — keeps you honest about Opus usage
- **Use `beamix history`** (not `beamix log`) to search past sessions by keyword
- **Grid mode** is great for monitoring but harder to interact with — use normal mode for active work
- **`beamix kill` always saves** — you can always `beamix restore` the next day
- **Tab completion** works — type `beamix ` + Tab to see all commands
- **macOS notifications** fire when a CEO finishes working — you'll hear the ding

---

## Agent Teams Mode (launch-team.sh)

A lighter-weight alternative to the full war room. Uses Claude Code's official **Agent Teams** feature (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`) and `--teammate-mode tmux` to run a LEAD + 2 WORKERS in a single tmux session.

```bash
bash launch-team.sh                    # Start with no pre-assigned task
bash launch-team.sh "your task here"   # Start with a task for the LEAD
```

### Layout

```
┌────────────────────────┬─────────────────┐
│                        │   WORKER-1      │
│   LEAD (70%)           ├─────────────────┤
│                        │   WORKER-2      │
└────────────────────────┴─────────────────┘
```

- **LEAD** (left pane, 70%) — runs Claude Code with `--teammate-mode tmux`, plans and delegates
- **WORKER-1** (top-right) — spawned/used by the LEAD for delegated tasks
- **WORKER-2** (bottom-right) — second worker pane

### How it differs from `beamix`

| | `beamix` | `launch-team.sh` |
|--|----------|------------------|
| Architecture | Multiple independent CEO agents | 1 LEAD + 2 WORKER panes |
| Worktrees | Yes — each CEO gets its own | No — all share `saas-platform/` |
| HQ dashboard | Yes | No |
| Scratchpad | Yes | No |
| Use case | Parallel independent tasks | Single task with delegation |
| Session name | `beamix` | `beamix-team` |

### Controls (inside the tmux session)

| Shortcut | What it does |
|----------|-------------|
| `Ctrl+T` | Toggle shared task board |
| `Shift+Tab` | Lead enters delegate mode |
| `Escape` | Interrupt a teammate's turn |
| `Ctrl+B ←→` | Navigate between panes |
| `Ctrl+B z` | Zoom pane to full screen |
| `Ctrl+B d` | Detach from session |

The session name is `beamix-team`. Attach with `tmux attach -t beamix-team`.

---

## Context Monitor & Auto-Compact

The **`gsa-context-monitor.js`** PostToolUse hook watches context usage after every tool call and injects warnings into the agent's conversation when context runs low.

### Thresholds

| Level | Remaining context | What happens |
|-------|------------------|-------------|
| **WARNING** | ≤ 35% | Agent is told to wrap up — don't start new complex work |
| **CRITICAL** | ≤ 25% | Agent is told to stop immediately, save state, inform user |
| **AUTO-COMPACT** | ≤ 20% | `/compact` is automatically sent to the agent's tmux pane |

### Auto-compact behavior

- Fires when remaining context ≤ 20%
- Sends `/compact` to the pane via `tmux send-keys` (reads `TMUX_PANE` env var)
- **5-minute cooldown** — won't auto-compact more than once per 5 minutes
- Cooldown is tracked in `/tmp/claude-autocompact-{session_id}.json`
- Appends a note to the warning message so the agent knows `/compact` was triggered

### Opt-out

```bash
BEAMIX_NO_AUTOCOMPACT=1 claude   # Disable auto-compact for this session
```

Or set it in your shell config to disable permanently.

### Debounce

Warnings are debounced: minimum 5 tool uses between repeated warnings at the same severity level. Severity escalation (WARNING → CRITICAL) bypasses the debounce and fires immediately.

### How the hook system works

| Hook | File | When it runs |
|------|------|-------------|
| `SessionStart` | `gsa-check-update.js` | Once, when Claude Code starts |
| `PostToolUse` | `gsa-context-monitor.js` | After every tool call |
| Status bar | `gsa-statusline.js` | Continuously (status bar refresh) |

The statusline writes context metrics to `/tmp/claude-ctx-{session_id}.json`. The context monitor reads that file — this is how the hook knows current usage without calling any API.

---

## Skills Library

The project ships with 426+ expert skills at `.agent/skills/[name]/SKILL.md`. Skills are loaded on-demand — never preloaded.

**Discovery:**
```bash
# Step 1: Read .agent/skills/MANIFEST.json — filter by tags matching your task
# Step 2: Load 1-2 matching SKILL.md files only
```

### Humanizer Skill (new)

**Location:** `.claude/skills/humanizer/SKILL.md`

Removes AI writing patterns from text to make it sound more natural. Based on Wikipedia's "Signs of AI writing" guide. Detects and fixes 25 categories of patterns including:

- Significance inflation ("pivotal moment", "vital role", "testament to")
- Promotional language ("breathtaking", "groundbreaking", "nestled")
- Superficial -ing phrases ("highlighting", "underscoring", "reflecting")
- AI vocabulary words ("additionally", "delve", "landscape", "tapestry")
- Em dash overuse, boldface overuse, rule-of-three patterns
- Vague attributions ("experts argue", "industry observers")
- Generic positive conclusions ("exciting times lie ahead")
- Collaborative chatbot artifacts ("I hope this helps!", "Let me know if...")

**Use it when:** editing docs, blog posts, marketing copy, or any text that needs to sound human.

```bash
# Load the skill in Claude Code:
@humanizer humanize this text: [paste text]

# Or reference it explicitly:
Read .claude/skills/humanizer/SKILL.md
```
