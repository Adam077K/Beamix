#!/usr/bin/env bash
# Beamix — 3-Agent Claude Code Team in TMux
# Uses the official Agent Teams feature (Claude Code v2.1.32+)
#
# Layout:
#   Pane 1 (left):  LEAD — plans and delegates to the team
#   Pane 2 (top-right):  WORKER 1 — spawned by lead
#   Pane 3 (bottom-right): WORKER 2 — spawned by lead
#
# Usage:
#   bash launch-team.sh
#   bash launch-team.sh "your task here"
#
# Controls inside session:
#   Ctrl+T     — toggle shared task board
#   Shift+Tab  — cycle lead into delegate mode
#   Escape     — interrupt a teammate's turn

set -euo pipefail

SESSION="beamix-team"
WORK_DIR="/Users/adamks/VibeCoding/Beamix/saas-platform"
TASK="${1:-}"

# Kill any existing session with same name
tmux kill-session -t "$SESSION" 2>/dev/null || true

# Create a new detached session in the saas-platform directory
tmux new-session -d -s "$SESSION" -c "$WORK_DIR"

# Set layout: main pane on left (70%), split right side vertically
tmux split-window -h -t "$SESSION" -c "$WORK_DIR" -p 35
tmux split-window -v -t "$SESSION:0.1" -c "$WORK_DIR"

# Label each pane
tmux select-pane -t "$SESSION:0.0" -T "LEAD"
tmux select-pane -t "$SESSION:0.1" -T "WORKER-1"
tmux select-pane -t "$SESSION:0.2" -T "WORKER-2"

# Enable pane borders and titles
tmux set-option -t "$SESSION" pane-border-status top
tmux set-option -t "$SESSION" pane-border-format "#{pane_title}"

# Launch Claude Code with Agent Teams + tmux mode in the LEAD pane
# Workers are spawned automatically by the lead agent when it delegates
tmux send-keys -t "$SESSION:0.0" \
  "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 claude --teammate-mode tmux" Enter

# Brief pause then launch worker stubs in other panes
# (The lead will take over these or they can be used for manual monitoring)
sleep 1
tmux send-keys -t "$SESSION:0.1" \
  "echo '🤖 WORKER-1: Waiting for lead to delegate tasks...' && CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 claude --teammate-mode tmux" Enter

sleep 0.5
tmux send-keys -t "$SESSION:0.2" \
  "echo '🤖 WORKER-2: Waiting for lead to delegate tasks...' && CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 claude --teammate-mode tmux" Enter

# Focus back on lead pane
tmux select-pane -t "$SESSION:0.0"

echo ""
echo "✅  Beamix Agent Team launched!"
echo ""
echo "Session: $SESSION"
echo "Panes:   LEAD (left) | WORKER-1 (top-right) | WORKER-2 (bottom-right)"
echo ""
echo "Controls:"
echo "  Ctrl+T     — shared task board"
echo "  Shift+Tab  — lead enters delegate mode"
echo "  Escape     — interrupt a teammate"
echo ""
echo "Attaching to session... (Ctrl+B then D to detach)"
echo ""

# Attach
tmux attach -t "$SESSION"
