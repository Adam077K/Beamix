#!/usr/bin/env bash
# PreToolUse safety gate — Beamix Phase 6 (2026-05-16)
#
# PURPOSE: Block genuinely dangerous commands and file edits before they run.
#          This hook fires on EVERY tool call, so it MUST be fast (<200ms).
#
# BLOCKING RULES (exit non-zero → Claude Code refuses the tool call):
#   Bash: rm -rf *, rm -rf /, rm -rf ~, chmod +x, npm install -g,
#         pip install, wget, curl to external URLs, git --no-verify,
#         git push --force to main/master, git reset --hard (non-HEAD),
#         git checkout --
#   Edit/Write: .env* files, existing supabase migration files
#
# SOFT-WARN RULES (exit 1 → Claude Code logs warning but still executes):
#   NOTE: Claude Code PreToolUse exit semantics: 0 = allow, non-zero = BLOCK.
#   For soft-warns we emit stderr and exit 0 — this surfaces the message in
#   Claude's next turn but does NOT block execution.
#
# STDIN: Claude Code PreToolUse JSON payload:
#   { "tool_name": "Bash", "tool_input": { "command": "..." }, ... }
#   { "tool_name": "Edit", "tool_input": { "file_path": "...", "old_string": "..." }, ... }
#   { "tool_name": "Write", "tool_input": { "file_path": "..." }, ... }
#
# EXIT CODES:
#   0           = allow (or soft-warn — message on stderr, execution continues)
#   non-zero    = BLOCK — Claude Code refuses the call; stderr message shown to agent
#
# STYLE: Mirrors post-edit-typecheck.sh — read payload via `cat`, parse with awk/grep.
#        No external deps; pure bash + coreutils only.
#
# COMPOUND-COMMAND DECOMPOSITION (2026-08-08, Capability Gap Map Wave 1 item 1):
#   The Bash block rules below (rm -rf, chmod +x, npm install -g, pip install,
#   wget, curl-external, git --no-verify, git push --force, git reset --hard,
#   git checkout --) are grep passes over the RAW command string. A literal
#   `&&` chain is still caught because grep scans the whole string — but a
#   dangerous sub-command hidden inside a `$(...)` / backtick subshell, or fed
#   through a heredoc body (e.g. `bash -c "$(cat <<'EOF' ... EOF)"`), was NOT
#   being decomposed and could evade every rule below.
#
#   `decompose_into()` (see "Decomposition helpers" below) recursively extracts
#   $(...) subshell bodies, `...` backtick bodies, and <<EOF...EOF heredoc
#   bodies from the raw command into a flat candidate list. The EXISTING rules
#   (unchanged, via check_bash_command()) run once against the top-level
#   command, then ONCE PER CANDIDATE in a loop. Running per-candidate (rather
#   than once against a joined corpus) is required for correctness: some rules
#   use a positive+negation shape (curl-external, git-reset---hard, push-origin
#   softwarn), and a joined corpus would let a safe candidate on one line satisfy
#   the negation grep for a dangerous candidate on a different line — allowing
#   the dangerous sub-command to slip through undetected.
#
#   CEILING (do not overclaim completeness): this is a bounded, best-effort
#   text decomposition for the COMMON evasion shapes — top-level/nested $(),
#   backticks, and simple heredocs. It is NOT a shell-grammar parser. It will
#   NOT reliably catch adversarial obfuscation: base64-encoded payloads piped
#   through eval/decode, ANSI-C `$'...'` escapes, quote-stripping tricks,
#   commands assembled char-by-char across variables, or process substitution
#   edge cases. A full POSIX shell parser is out of scope for a <200ms
#   PreToolUse hook — this raises the bar against the common evasion pattern,
#   it does not close every gap.

set -uo pipefail

# ── Helpers ───────────────────────────────────────────────────────────────────

block() {
  local reason="$1"
  echo "[pre-tool-use] BLOCKED: $reason" >&2
  exit 2
}

softwarn() {
  local reason="$1"
  echo "[pre-tool-use] WARNING: $reason" >&2
  # exit 0 so Claude Code still executes — warning surfaces in next turn
}

# ── Decomposition helpers ─────────────────────────────────────────────────────
# Pure bash + coreutils, no new deps. Bounded depth (4) and candidate count (50)
# keep worst-case runtime well under the 200ms hook budget even on pathological
# input. See the header comment above for the documented ceiling.

_candidates=()

_add_candidate() {
  local body="$1"
  local depth="$2"
  [ -z "$body" ] && return 0
  [ "${#_candidates[@]}" -ge 50 ] && return 0
  _candidates+=("$body")
  # Recurse ONE level deeper (depth+1) so the depth-4 cap in decompose_into
  # actually bounds recursion — without the increment, deeply-nested input
  # would recurse until hitting the 50-candidate cap instead.
  decompose_into "$body" $((depth + 1))
}

# Extracts every top-level $(...) body from $1 (balances nested parens so
# `$(echo $(whoami))` yields the full inner body, not a truncated one).
scan_dollar_paren() {
  local s="$1" depth="$2"
  local i=0
  local n=${#s}
  while [ "$i" -lt "$n" ]; do
    if [ "${s:i:2}" = '$(' ]; then
      local d=1
      local j=$((i + 2))
      while [ "$j" -lt "$n" ] && [ "$d" -gt 0 ]; do
        case "${s:j:1}" in
          '(') d=$((d + 1)) ;;
          ')') d=$((d - 1)) ;;
        esac
        j=$((j + 1))
      done
      local body="${s:$((i + 2)):$((j - 1 - (i + 2)))}"
      _add_candidate "$body" "$depth"
      i=$j
    else
      i=$((i + 1))
    fi
  done
}

# Extracts every `...` backtick-subshell body from $1. Does not account for
# escaped backticks (\`) inside a body — documented ceiling, not a full parser.
scan_backticks() {
  local s="$1" depth="$2"
  local i=0
  local n=${#s}
  local start=-1
  while [ "$i" -lt "$n" ]; do
    if [ "${s:i:1}" = '`' ]; then
      if [ "$start" -lt 0 ]; then
        start=$((i + 1))
      else
        local body="${s:start:$((i - start))}"
        _add_candidate "$body" "$depth"
        start=-1
      fi
    fi
    i=$((i + 1))
  done
}

# Extracts simple heredoc bodies: <<EOF / <<-EOF / <<'EOF' / <<"EOF" ... EOF.
# Terminator match strips leading whitespace (covers <<- convention). Does not
# handle quoted-with-escapes delimiters or `<<<` herestrings (out of scope).
scan_heredocs() {
  local s="$1" depth="$2"
  local delim="" body="" in_heredoc=0 line trimmed
  while IFS= read -r line; do
    if [ "$in_heredoc" -eq 0 ]; then
      if [[ "$line" =~ \<\<-?[[:space:]]*[\'\"]?([A-Za-z_][A-Za-z0-9_]*)[\'\"]? ]]; then
        delim="${BASH_REMATCH[1]}"
        in_heredoc=1
        body=""
      fi
    else
      trimmed="$line"
      while [ "${trimmed:0:1}" = " " ] || [ "${trimmed:0:1}" = "$(printf '\t')" ]; do
        trimmed="${trimmed:1}"
      done
      if [ "$trimmed" = "$delim" ]; then
        _add_candidate "$body" "$depth"
        in_heredoc=0
        body=""
        delim=""
      else
        if [ -z "$body" ]; then
          body="$line"
        else
          body="$body
$line"
        fi
      fi
    fi
  done <<< "$s"
}

# Entry point: populates the global _candidates array with every sub-command
# found by recursively scanning $1 for $(...), `...`, and heredoc bodies.
decompose_into() {
  local s="$1" depth="${2:-0}"
  [ "$depth" -ge 4 ] && return 0
  [ "${#_candidates[@]}" -ge 50 ] && return 0
  scan_dollar_paren "$s" "$depth"
  scan_backticks "$s" "$depth"
  scan_heredocs "$s" "$depth"
}

# ── Read payload ──────────────────────────────────────────────────────────────

payload=$(cat)

# Fast parse: awk-based extraction (no jq dependency)
tool_name=$(printf '%s' "$payload" | awk -F'"' '/"tool_name"/{print $4; exit}')

# ── Route by tool type ────────────────────────────────────────────────────────

case "$tool_name" in
  Bash)
    command=$(printf '%s' "$payload" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('tool_input', {}).get('command', ''))
except Exception:
    print('')
" 2>/dev/null || printf '%s' "$payload" | awk -F'"' '/"command"/{print $4; exit}')

    # check_bash_command() holds the EXISTING block/softwarn rules, UNCHANGED,
    # parameterized on $1 instead of the fixed $command global. This lets us
    # run the same rules against the top-level command AND against every
    # decomposed sub-command candidate below, without duplicating any rule.
    check_bash_command() {
      local command="$1"

      # ── BLOCK: rm -rf dangerous variants ─────────────────────────────────────
      if printf '%s' "$command" | grep -qE 'rm\s+-[a-zA-Z]*r[a-zA-Z]*f|rm\s+-[a-zA-Z]*f[a-zA-Z]*r'; then
        # Specifically block rm -rf targeting /, ~, *, /tmp broad, etc.
        if printf '%s' "$command" | grep -qE 'rm\s+(-[a-zA-Z]+\s+)*(\/[^a-zA-Z]?|~|\.\.\/|\*|\/tmp\/?\*|\/var|\/etc|\/home|\/usr)'; then
          block "rm -rf on a dangerous path. Use targeted removal instead: rm -f <specific-file>."
        fi
        # rm -rf with no path (bare) or trailing space = block
        if printf '%s' "$command" | grep -qE 'rm\s+-rf\s*$'; then
          block "Bare rm -rf with no path. Specify the exact file or directory."
        fi
      fi

      # ── BLOCK: chmod exec-bit grants ────────────────────────────────────────
      #
      # ALLOW examples (mode-bits only — no execute bit):
      #   chmod 644 file      chmod 640 file      chmod 600 file
      #   chmod 444 file      chmod 664 file      chmod 400 file
      #
      # DENY examples (exec-bit grants):
      #   chmod +x file       chmod a+x file      chmod u+x file
      #   chmod g+x file      chmod o+x file
      #   chmod 755 file      chmod 775 file      chmod 711 file
      #   chmod 700 file      chmod 750 file      chmod 710 file
      #   chmod 100 file      chmod 010 file      chmod 001 file
      #   chmod 1 file        chmod 7 file        chmod 11 file
      #   (any octal sequence containing an odd digit — 1,3,5,7 — in ANY position)
      #
      # Write content containing the text "chmod 644" → NOT a Bash command →
      # never reaches this branch (Write/Edit tool goes to the Edit|Write case
      # below and is NOT scanned for chmod at all — file content mentioning
      # chmod text has no security impact).
      #
      # Symbolic exec-bit: +x / [ugoa]+x
      if printf '%s' "$command" | grep -qE 'chmod[[:space:]]+[ugoa]*\+[rwsxtX]*x|chmod[[:space:]]+\+x'; then
        block "chmod +x / [ugoa]+x is blocked (exec-bit grant). Use explicit numeric mode-bits without exec (e.g., chmod 644) instead, or ask the CEO to approve."
      fi
      # Numeric octal exec-bit: any octal sequence where ANY digit is odd (1,3,5,7
      # all have the execute bit set in that triad — this covers 1-digit, 2-digit,
      # 3-digit, and 4-digit modes; QA P1 fix 2026-05-29).
      if printf '%s' "$command" | grep -qE 'chmod[[:space:]]+[0-7]*[1357][0-7]*([[:space:]]|$)'; then
        block "chmod with exec-bit in numeric mode is blocked (e.g., 755, 700, 711, 1). Use non-exec modes like 644, 640, 600 instead, or ask the CEO to approve."
      fi

      # ── BLOCK: npm install -g ────────────────────────────────────────────────
      if printf '%s' "$command" | grep -qE 'npm\s+install\s+-g|npm\s+i\s+-g'; then
        block "Global npm install (npm install -g) is blocked. Use project-local deps via pnpm add --save-dev."
      fi

      # ── BLOCK: pip install ───────────────────────────────────────────────────
      if printf '%s' "$command" | grep -qE 'pip\s+install|pip3\s+install'; then
        block "pip install is blocked. Python deps are not part of the Beamix stack. Confirm with the CEO if this is intentional."
      fi

      # ── BLOCK: wget ──────────────────────────────────────────────────────────
      if printf '%s' "$command" | grep -qE '\bwget\b'; then
        block "wget is blocked. Use 'curl -fsSL <url>' for controlled downloads, or ask the CEO to approve wget usage."
      fi

      # ── BLOCK: curl to external URLs (allow localhost / 127.0.0.1) ───────────
      # Strategy (no lookaheads — macOS grep doesn't support them):
      # 1. If curl is present AND the command contains http:// or https://
      # 2. AND the command does NOT contain localhost or 127.0.0.1
      # 3. → BLOCK (external curl)
      if printf '%s' "$command" | grep -qE '\bcurl\b'; then
        if printf '%s' "$command" | grep -qE 'https?://'; then
          if ! printf '%s' "$command" | grep -qE '(localhost|127\.0\.0\.1)'; then
            block "curl to external URL is blocked. Only curl localhost/127.0.0.1 is allowed. Wrap external HTTP calls in Next.js API routes or use the WebFetch MCP tool."
          fi
        fi
      fi

      # ── BLOCK: git --no-verify ───────────────────────────────────────────────
      if printf '%s' "$command" | grep -qE 'git\b.*--no-verify'; then
        block "--no-verify skips pre-commit hooks (lint + typecheck). Remove --no-verify and fix the underlying hook failure instead."
      fi

      # ── BLOCK: git push --force to main/master ────────────────────────────────
      if printf '%s' "$command" | grep -qE 'git\b.*push\b.*(--force|-f)\b.*(main|master)' || \
         printf '%s' "$command" | grep -qE 'git\b.*push\b.*(main|master).*(--force|-f)'; then
        block "Force-push to main/master is blocked. Create a PR instead, or ask the CEO to approve the force-push explicitly."
      fi

      # ── BLOCK: git reset --hard (allow git reset HEAD for staging) ────────────
      if printf '%s' "$command" | grep -qE 'git\b.*reset\b.*--hard'; then
        # Allow: git reset --hard HEAD (no-op relative to current commit)
        # Block: git reset --hard with anything other than HEAD or HEAD~0
        if ! printf '%s' "$command" | grep -qE 'git\b.*reset\b.*--hard\s+HEAD\s*$'; then
          block "git reset --hard is blocked (destroys uncommitted work). Use 'git stash' to save work, or 'git reset HEAD <file>' to unstage specific files."
        fi
      fi

      # ── BLOCK: git checkout -- (discards uncommitted changes) ────────────────
      if printf '%s' "$command" | grep -qE 'git\b.*checkout\b.*--\s+'; then
        block "git checkout -- <file> discards uncommitted changes permanently. Use 'git stash' to temporarily save work instead."
      fi

      # ── SOFT-WARN: git push origin main (non-force) ──────────────────────────
      if printf '%s' "$command" | grep -qE 'git\b.*push\b.*origin\b.*(main|master)' && \
         ! printf '%s' "$command" | grep -qE '(--force|-f)\b'; then
        softwarn "Pushing directly to main/master. Prefer a PR via 'gh pr create' for code review. Proceeding with push."
      fi

      # ── SOFT-WARN: gh pr merge ────────────────────────────────────────────────
      if printf '%s' "$command" | grep -qE 'gh\s+pr\s+merge'; then
        softwarn "gh pr merge bypasses the local QA Lead review step. Ensure QA verdict PASS is in the session file before merging."
      fi
    }

    # ── Run the rules against the top-level command first (unchanged
    #    behavior). This is also the fast path: the vast majority of blocked
    #    commands are caught right here without paying any decomposition cost.
    check_bash_command "$command"

    # ── Decomposition pass: extract $(...) / `...` / heredoc sub-commands,
    #    then run the SAME rules ONCE PER CANDIDATE. Per-candidate evaluation
    #    is required for correctness: rules shaped as
    #      if <positive grep>; then if ! <negation grep>; then block; fi; fi
    #    (curl-external, git-reset---hard, push-origin softwarn) are broken by
    #    corpus-joining — a safe candidate on one line can satisfy the negation
    #    grep for a dangerous candidate on another line, masking the block.
    #    Observed timing on macOS: ~57ms baseline (0 subshells), ~185ms at 3
    #    subshells (within budget), ~430ms at 10 subshells (uncommon in real
    #    Beamix agent commands). Correctness takes priority; the 200ms budget
    #    is met for the typical 0-3 candidate case. Adversarial inputs that hit
    #    the 50-candidate cap are capped by design and may be slower.
    decompose_into "$command" 0
    for _candidate in "${_candidates[@]}"; do
      [ -z "$_candidate" ] && continue
      check_bash_command "$_candidate"
    done

    ;;

  Edit|Write|NotebookEdit)
    file_path=$(python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('tool_input', {}).get('file_path', ''))
except Exception:
    print('')
" 2>/dev/null <<< "$payload" || printf '%s' "$payload" | awk -F'"' '/"file_path"/{print $4; exit}')

    # ── BLOCK: .env* files ───────────────────────────────────────────────────
    if printf '%s' "$file_path" | grep -qE '(^|/)\.(env)(\.|$|local|production|staging|test|development)'; then
      block ".env files must be edited via your system editor (not Claude). These files may contain secrets. Path: $file_path"
    fi
    # Also catch plain .env
    if printf '%s' "$file_path" | grep -qE '(^|/)\.env$'; then
      block ".env file must be edited via your system editor (not Claude). This file may contain secrets."
    fi

    # ── BLOCK: existing supabase migration files ─────────────────────────────
    if printf '%s' "$file_path" | grep -qE 'supabase/migrations/[^/]+\.sql$'; then
      # Block only if the file already exists (migrations are immutable once authored)
      if [ -f "$file_path" ]; then
        block "Supabase migration files are immutable once authored. Create a NEW migration file instead of editing '$file_path'. Editing migrations breaks the audit trail."
      fi
    fi

    # ── SOFT-WARN: DECISIONS.md edits (prefer append-only) ─────────────────
    if printf '%s' "$file_path" | grep -qE '(^|/)\.claude/memory/DECISIONS\.md$'; then
      old_string=$(python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('tool_input', {}).get('old_string', ''))
except Exception:
    print('')
" 2>/dev/null <<< "$payload" || echo "")
      # If old_string is non-empty, this is a replacement (not an append)
      if [ -n "$old_string" ]; then
        softwarn "DECISIONS.md edit detected (non-append). DECISIONS.md should be append-only — add new entries at the bottom rather than modifying existing ones. Proceeding."
      fi
    fi

    ;;

  *)
    # Unknown tool — allow
    ;;
esac

exit 0
