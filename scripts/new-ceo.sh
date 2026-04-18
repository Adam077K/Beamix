#!/usr/bin/env bash
# Spawn a fresh CEO worktree + launch Claude in it.
# Usage: ./scripts/new-ceo.sh [N]   (N optional; auto-picks next free slot)
set -euo pipefail

MAIN="/Users/adamks/VibeCoding/Beamix"
cd "$MAIN"

if [ -n "${1:-}" ]; then
  N="$1"
else
  # Find highest existing ceo-N-* and add 1
  N=$(ls .worktrees 2>/dev/null \
      | grep -Eo '^ceo-[0-9]+' \
      | grep -Eo '[0-9]+$' \
      | sort -n | tail -1)
  N=$(( ${N:-0} + 1 ))
fi

TS=$(date +%s)
NAME="ceo-${N}-${TS}"
PATH_WT="$MAIN/.worktrees/$NAME"

git worktree add "$PATH_WT" -b "$NAME" >/dev/null
echo "✅ Created worktree: $PATH_WT"
echo "🚀 Launching Claude..."
cd "$PATH_WT"
exec claude --dangerously-skip-permissions
