# Hook library — target spec

Surface: **Hook library** (`.claude/hooks/`). This is where every hard constraint in the rebuilt agent
system must live — a constraint enforced only by a prompt sentence is disqualified by construction.

---

## Current state (measured, with the commands you ran)

All commands run from `/Users/adamks/VibeCoding/Beamix/.worktrees/ceo-1-1786220343`.

### Inventory

```
ls -la .claude/hooks/                     → 7 files (gsa-check-update.js, gsa-context-monitor.js,
                                             gsa-statusline.js, post-edit-typecheck.sh, pre-tool-use.sh,
                                             schema-lint.js, stop.sh)
ls .claude/agents/*.md | wc -l            → 26
ls -d .claude/skills/*/ | wc -l           → 146
ls .claude/commands/*.md | wc -l          → 13
find .claude -iname "*.js" -path "*workflow*" → 6 (design.js, research.js, coding.js,
                                             capability-gap-map-followup.js, qa.js, capability-gap-map.js)
```
All five counts in the prompt's "measured current state" matched exactly. No correction needed there.

### `.claude/settings.json` — how hooks are actually wired

Read directly (not `.proposed` — see below). Registered:

| Event | Command | Matcher |
|---|---|---|
| SessionStart | `node .claude/hooks/gsa-check-update.js` | (none — fires always) |
| PreToolUse | `.claude/hooks/pre-tool-use.sh` | `Bash\|Edit\|Write\|NotebookEdit` |
| PostToolUse | `node .claude/hooks/gsa-context-monitor.js` | (none — fires on every tool) |
| PostToolUse | `.claude/hooks/post-edit-typecheck.sh` | (none — fires on every tool; self-filters internally) |
| Stop | `.claude/hooks/stop.sh` | — |

**`gsa-statusline.js` is not a hook** — it's `statusLine`, a different config key, invoked by the terminal
renderer, not by a tool-use event. It writes the context-percentage bridge file that
`gsa-context-monitor.js` reads. Kept in the same directory by convention; not part of the `hooks{}` block.

**`schema-lint.js` is registered nowhere** — not in `hooks{}`, not in any `.github/workflows/*.yml`
(`grep -rl "schema-lint" .github/` → no hits). CLAUDE.md names it "the Trivial-tier CI gate." It is a
standalone script two `npm`/`node` invocations away from ever running.

**`.claude/settings.json.proposed` is stale, not pending.** Its own `_NOTE` field calls it "Proposed update
... Review and replace settings.json if approved." Diffing it against the live `settings.json` shows the
live file already is a superset: same allow/deny lists plus `Bash(python3 *)` and
`Bash(tmux kill-pane:*)`, plus the `pre-tool-use.sh` / `post-edit-typecheck.sh` / `stop.sh` wiring the
`.proposed` file doesn't have at all. CLAUDE.md's "pending apply" language is describing a state that
already happened. This is a second, independent instance of documentation drifting from reality — same
failure class the rest of this rebuild exists to fix.

**`~/.claude/settings.json` (global, applies to all ~10 projects) also registers hooks:**
```
SessionStart → node "/Users/adamks/.claude/hooks/gsa-check-update.js"
PostToolUse  → node "/Users/adamks/.claude/hooks/gsa-context-monitor.js"
statusLine   → node "/Users/adamks/.claude/hooks/gsa-statusline.js"
```
Because Beamix's project-level `settings.json` registers the **same two hooks again**, both
`gsa-check-update.js` and `gsa-context-monitor.js` fire **twice per applicable event** in this project —
once from the global config, once from the project config. Confirmed by direct comparison of both files;
not previously documented anywhere I could find.

### `pre-tool-use.sh` (226 lines, PreToolUse, `Bash|Edit|Write|NotebookEdit`)

Read in full. Genuinely hard-blocks (all block paths call `block()`, which is `exit 2`), and is correctly
wired — this matches the prompt's "known" description. Confirmed by direct timing:
```
time (cat payload.json | .claude/hooks/pre-tool-use.sh)   → 0.079s total   (< 200ms budget)
```
Blocks (exit 2): `rm -rf` on dangerous paths / bare `rm -rf`; `chmod +x` and any numeric mode with an odd
digit in any position; `npm install -g`; `pip install`; `wget`; `curl` to non-localhost URLs; `git ...
--no-verify`; `git push --force` to main/master; `git reset --hard` except `HEAD`; `git checkout -- <path>`;
edits to `.env*` files; edits to an **existing** Supabase migration file.
Soft-warns (exit 0, stderr only): `git push origin main` (non-force); `gh pr merge`; non-append edits to
`DECISIONS.md`.

**Gap, not a bug in the file itself:** `.claude/qa-tier-floor.yml` marks `.claude/agents/**`,
`.claude/hooks/**`, `.claude/settings.json`, `.claude/qa-tier-floor.yml` itself, and `.github/workflows/**`
as **irreversible** tier — "bad prompt cascades across every spawn" / "PostToolUse / SessionStart hooks
execute on every action." `pre-tool-use.sh` does not consult that file and does not gate any of those paths
at all. Editing `.claude/hooks/pre-tool-use.sh` itself is currently no different, at write time, from editing
a component's `.tsx` file. This is the "self-modification gate" CLAUDE.md and the rebuild plan both name as
decided-but-unbuilt.

### `stop.sh` (138 lines, Stop, no matcher)

Read in full. Its own header is accurate: `"PURPOSE: ... SOFT-WARN ONLY — never blocks."` /
`"EXIT CODE: always 0 — Stop hooks MUST NOT prevent session close."` Confirmed in the code: `trap 'exit 0'
ERR` at the top, and a literal `exit 0` as the last line, with every check writing to stderr via `warn()`/
`info()` and nothing else. Four checks, all advisory: uncommitted `git status`; conventional-commit format
on the latest commit; a `docs/08-agents_work/sessions/{today}-*.md` file exists; that file's frontmatter
contains `qa_verdict`. It correctly points at `docs/08-agents_work/sessions/` — the live directory (142
files) — not `.claude/memory/sessions/` (4 files, abandoned ~10 weeks per Adam's own numbers, confirmed:
`ls .claude/memory/sessions/ | wc -l` → 4; `ls docs/08-agents_work/sessions/*.md | wc -l` → 142).

**`DECISIONS.md` contradicts this file's own header.** Line 781-782:
> **[2026-05-05] — QA Gate Now Hard-Enforced Via Stop-Hook.** "A Stop-hook will block any `git merge` when
> the branch's session file lacks `qa_verdict: PASS`."

This is wrong on two independent axes, not one: (1) `stop.sh`'s exit code is hardcoded `0` on every path —
it structurally cannot block anything, and its own header says so in the first paragraph; (2) a Stop hook
fires at **session close**, not on a specific `Bash` tool call — it has no mechanism to intercept "the
`git merge` command" even if it wanted to block, because that interception is `PreToolUse`'s job, not
`Stop`'s. What actually enforces the QA gate against merges is `.github/workflows/qa-lead-pass.yml`, a
**GitHub Actions CI check** gating the PR merge button — confirmed by reading it (344 lines): it greps the
session file for `qa_verdict:\s*"?PASS"?`, checks for a `qa-lead-bypass` label + an authorized-user comment
containing `BYPASS REASON:`, and separately walks `.claude/qa-tier-floor.yml` to require the
`risk:irreversible` label when any changed file's tier floor is `irreversible`. **DECISIONS.md conflated a
local session-end hook with a CI branch-protection check — a real architecture confusion, not a typo**, and
it is exactly the kind of claim the rest of this rebuild treats as unverified until read.

**Also confirmed, reading `qa-lead-pass.yml` closely:** the tier-floor enforcement is asymmetric today. If
the computed floor is `irreversible`, the workflow hard-fails (`exit 1`) without the `risk:irreversible`
label. If the computed floor is `full`, the workflow only prints `"ℹ️ Floor is 'full' ... Phase 6+ work"` —
**it does not fail the build.** A PR touching `apps/web/src/lib/auth/**` (tier: full) with a forged
`qa_verdict: PASS` / `tier: lite` session file passes CI today. This is a second, distinct forgery surface
from the "grep on a hand-typed string" issue named in the rebuild plan for `qa.js`.

### `schema-lint.js` (361 lines, standalone Node script, wired into nothing)

Ran it directly:
```
node .claude/hooks/schema-lint.js
→ Summary: 16 pass · 10 fail · 5 warnings
```
All 10 failures are the **same single rule**: `maxTurns=50 outside range [5, 30]`. Confirmed via full
output — not 10 different problems, one stale range. Separately confirmed the model IDs the linter accepts
(`VALID_MODELS = ['claude-opus-4-7', 'claude-sonnet-4-6', 'claude-haiku-4-5']`) are exactly what all 26
agent files declare (`grep -h "^model:" .claude/agents/*.md | sort | uniq -c` → 8 opus-4-7 / 16 sonnet-4-6 /
2 haiku-4-5, zero stragglers) — so the "agents are 2 generations stale" observation is about the *models
actually running this session* (this transcript's own co-author line reads `Claude Opus 5 (1M context)`,
and the system prompt names this model `Sonnet 5` — a naming scheme with no relation to `-4-7`/`-4-6` at
all), not about internal disagreement inside the repo. The repo is internally consistent and consistently
behind the model family actually in use.

It already does the right thing for one axis — `skills:` in frontmatter is cross-checked against
`.claude/skills/MANIFEST.json` — which is the exact pattern the target state extends to `mcpServers:`.

### `gsa-context-monitor.js` (182 lines, PostToolUse, fires on every tool call, registered twice — see above)

Read in full. Genuinely useful mechanism (debounced context-window warning/critical, auto-`/compact` via
`tmux send-keys` at ≤20% remaining, 5-minute cooldown) with one confirmed defect: the CRITICAL message tells
the agent to run `/gsa:pause-work`.
```
grep -rl "pause-work" .claude/    → .claude/gsa-file-manifest.json, .claude/memory/AUDIT_LOG.md,
                                     .claude/hooks/gsa-context-monitor.js
ls .claude/commands/*.md          → audit, board-meeting, build, color, daily, debug, design, fix, name,
                                     plan, research, review, ship   (no pause-work)
```
No such command has ever existed in `.claude/commands/`. **This exact defect was already flagged three
months ago** — `.claude/memory/AUDIT_LOG.md`, entry `[2026-05-05 21:30]`: *"gsa-context-monitor hook
references non-existent /gsa:pause-work command"* — filed as a P0, never fixed. It is not a new finding;
it's a 96-day-old known bug, which is itself evidence for why "the agent should remember to fix it" doesn't
work as a mechanism.

### `gsa-check-update.js` (63 lines, SessionStart, registered twice — see above)

Spawns a detached background process running `npm view gsa-startup-kit version` on every session start,
against a package name (`gsa-startup-kit`) that is the *parent* GSA kit's upstream, not anything
Beamix-specific. Whether this check is still relevant depends entirely on where component 9 of the rebuild
plan (`gsa-sync` → canonical own-repo distribution) lands — flagged as a dependency below, not resolved here.

### `post-edit-typecheck.sh` (66 lines, PostToolUse, self-filters to `apps/web/**/*.ts(x)`)

Read in full. Narrow, fast, advisory-only (`exit 0` always), correctly scoped. No defect found. Timed at
~20-30ms for Node-script cold starts in this environment; the `tsc --noEmit` cost is the dominant factor and
is already accepted as advisory-not-blocking by design (`FM-13 mitigation`, per its own comment).

### `.claude/qa-tier-floor.yml` (143 lines) and `.github/workflows/qa-lead-pass.yml` (344 lines)

Both read in full — see the `stop.sh` section above for the merge-enforcement finding. `qa-tier-floor.yml`
is a real, working, first-match-wins deterministic classifier, but it is **CI-only**: nothing in
`.claude/hooks/` reads it. A file lands in "irreversible" territory only at PR time, after the edit already
happened — there is no local, pre-edit gate keyed off this file today.

### Capability/grant resolution — measured directly, not inferred

Three independent config layers exist and disagree:
```
cat .mcp.json                              → mcpServers: { supabase }              (project-level; 1 entry)
python3 -c "...json.load(open('~/.claude.json'))['mcpServers'].keys()"
                                            → stitch, refero, miro, runpod,
                                              playwright, higgsfield, mem0, pencil   (global; 8 entries)
grep mcpServers: across .claude/agents/*.md → linear(9), github(8), context7(5),
                                              pgvector(3), segment-cdp(2), supabase(10),
                                              playwright(6), pencil(3), stitch(2),
                                              refero(5), framer-mcp(2), ide(5)       (declared; 12 names)
```
Cross-referencing all three: **`supabase`, `playwright`, `pencil`, `stitch`, `refero` resolve** (present in
project or global config). **`linear`, `github`, `context7`, `pgvector`, `segment-cdp`, `framer-mcp`, `ide`
resolve in neither config layer** — 7 of 12 declared names, not merely "referenced," are dead grants today.
`pgvector` and `segment-cdp` additionally aren't MCP servers at all (they're a Postgres extension and a CDP
product respectively) — declaring them under `mcpServers:` is a category error independent of whether a
server named that exists. This is the exact gap "capability/grant resolution" in the target state closes.

### Bash version — the compatibility hazard is real and reproduced firsthand, not assumed

```
/bin/bash --version   → GNU bash, version 3.2.57(1)-release (arm64-apple-darwin25)   (macOS stock)
bash --version        → GNU bash, version 5.3.9(1)-release (aarch64-apple-darwin25.1.0)  (Homebrew, first
                                                                                            on this PATH)
```
All 7 current hook `.sh` files use `#!/usr/bin/env bash` — which resolves to whichever `bash` is first on
`PATH` at hook-execution time, not necessarily the same one a developer's interactive shell uses. Grepped
all `.sh` hooks for bash-4+-only syntax (`declare -A`, `mapfile`, `readarray`, case-conversion expansion) —
**zero hits**; the 5 files on `main` today are already 3.2-safe. The hazard is real but not currently live
in what's shipped — it showed up the moment someone *added* a feature that needed it, which is exactly what
happened next.

**Directly reproduced the "prior implementation blew the 200ms budget" claim**, using git history, not the
number as given:
```
git log --all --oneline -- .claude/hooks/
  39aa2c8 fix(hooks): compound-command decomposition rework [UNREVIEWED SALVAGE]   ← fix/hook-decomposition-v2
  18e637a fix(hooks): close cross-candidate negation-masking in compound-command decomposition
  272fb31 fix(hooks): decompose compound commands in pre-tool-use.sh block rules   ← fix/hook-compound-command-decomposition
```
Extracted `18e637a`'s `pre-tool-use.sh` (399 lines) to scratch and ran it directly:
```
echo '{"tool_name":"Bash","tool_input":{"command":"ls -la"}}' | /bin/bash pre-tool-use.sh
→ pre-tool-use.sh: line 198: _candidates[@]: unbound variable      (EXIT 1 — a crash, not a verdict)
```
Confirmed live under macOS stock `/bin/bash` — a `set -u` unbound-variable crash on empty-array expansion,
the exact class bash's own changelog fixed in 4.4 and stock macOS never received. Then ran the documented
22KB-heredoc perf case (same methodology the salvaged test file uses, see below): **the process did not
return within a 120-second hard timeout** on this same commit — i.e., not "49x over budget," worse: no
measurable upper bound was found in two minutes on a payload the eventual fix handles in 74ms. Whatever the
"49x" figure's original source was, it undersold the failure if anything.

Extracted `39aa2c8` (`fix/hook-decomposition-v2`, commit message: *"Salvaged from failed workflow run
wf_50fc94dd-a19: the build agent completed its work but never returned structured output, so this was left
uncommitted. NOT reviewed, NOT gated, NOT merge-ready."*) and its companion
`.claude/hooks/tests/pre-tool-use.test.sh` (297 lines — a real, runnable harness, not a claim) to scratch and
ran the harness under explicit `/bin/bash`:
```
/bin/bash tests/pre-tool-use.test.sh
→ PASS: 44   FAIL: 0
→ 22KB heredoc payload (22025 bytes), 5 runs: avg 67.9ms, max 74.0ms  (PASS, < 200ms budget)
→ 10-subshell payload, 5 runs: max 68.0ms  (PASS, < 200ms budget)
```
So a *working* fix for both defects already exists in git history, on an unmerged branch, explicitly marked
not-reviewed and not-gated. It is not what the target state adopts (see Cut, below) — but its **test
harness shape and perf-measurement methodology are exactly right** and are adopted as the mechanism for
"how hooks are tested," independent of what happens to the compound-command code itself.

### DECISIONS.md entry count

```
grep -c "^### \[" .claude/memory/DECISIONS.md   → 58
```
Confirms the prompt's number against the documented ≤50 cap. Not a hooks-surface fact by itself, but the
run-log's rotation design (below) is deliberately built to not repeat this failure.

---

## Target state (the complete enumeration)

Six Claude-Code event-triggered hooks, registered exactly once each (project-level, except where noted),
two library modules invoked by the PreToolUse hook (not separately registered, independently testable), one
CI-only lint (not a runtime hook — kept in `.claude/hooks/` by existing convention, wired into CI for the
first time), and one unchanged statusline script. `UserPromptSubmit` is deliberately **not** used — see
Cut, below.

### Directory layout

```
.claude/hooks/
  session-start.js              SessionStart
  pre-tool-use.sh                PreToolUse   (Bash|Edit|Write|NotebookEdit|Task)
  post-tool-use-provenance.js    PostToolUse  (WebFetch|WebSearch|mcp__playwright__browser_navigate|
                                                mcp__playwright__browser_network_request)
  post-tool-use-context.js       PostToolUse  (all tools — global registration only, see Merged)
  post-edit-typecheck.sh         PostToolUse  (all tools — self-filters to apps/web/**/*.ts(x))
  stop.sh                        Stop
  schema-lint.js                 (CI-only; also invoked synchronously by pre-tool-use.sh)
  gsa-statusline.js               statusLine (unchanged)
  lib/
    capability-resolve.js         invoked by pre-tool-use.sh on tool_name == "Task"
    provenance-gate.js             invoked by pre-tool-use.sh on Edit|Write to memory/skill/agent globs
    generate-mcp-manifest.js       CI script; not invoked at runtime
  tests/
    pre-tool-use.test.sh
    capability-resolve.test.sh
    provenance-gate.test.sh
    post-tool-use-provenance.test.sh
    post-tool-use-context.test.sh
    stop.test.sh
    schema-lint.test.js
    fixtures/
      agents-good/*.md            known-good agent frontmatter fixtures
      agents-bad/*.md              known-bad agent frontmatter fixtures (one per lint rule)
```

### 1 · `session-start.js` — SessionStart

**Replaces** `gsa-check-update.js` (renamed, not just extended — see Merged). Fires once per session, before
any tool call.

**Enforces / does:**
1. **Mandatory-invocation injection** (adopts Superpowers' SessionStart pattern). Emits
   `hookSpecificOutput.additionalContext` instructing the agent: *"Before your first non-trivial action,
   read `.claude/skills/MANIFEST.json`, filter by `tags` matching the task domain, and load the matching
   `SKILL.md` files per the CLAUDE.md discovery protocol. This is not optional — treat it as you would treat
   `pre_flight_reads`."* This targets the same failure Superpowers' hook targets: skills that exist but are
   never checked. Text-only injection — cannot itself force compliance (no hook can force what an LLM reads
   next), which is exactly why item 4 below (schema-lint's `pre_flight_reads` requirement, already enforced)
   and the run log's `mechanism` field (item 5) are the actual honesty check on whether this fires in
   practice — see "The mechanism that keeps this honest."
2. **Update check**, kept but rescoped: spawns a detached background check against whatever the canonical
   distribution mechanism ends up being once rebuild-plan component 9 (`gsa-sync` → canonical own repo)
   lands — **not** `npm view gsa-startup-kit version`, which checks the wrong package for a Beamix-specific
   system. Concretely blocked on that surface's design; see Open questions.
3. **Run-log session init.** Writes `{run_id, session_id, started_ts}` to a per-session scratch file
   (`os.tmpdir()/claude-run-{session_id}.json`) that `stop.sh` reads at session close to emit the paired
   run-log line (component 5).

**Exit codes:** always `0`. SessionStart cannot block — nothing has started yet. Any failure in steps 2 or 3
degrades silently (caught, logged to stderr, never thrown).

**Performance budget:** the synchronous part (step 1's `additionalContext` emission, step 3's file write)
must complete in **< 100ms** — nothing else is running yet, so there's no shared 200ms ceiling to protect,
but a slow SessionStart hook delays the first prompt of every single session, which is a worse user-facing
cost than a slow PreToolUse hook buried mid-task. Step 2 is fully async (`spawn(..., {detached: true})` +
`child.unref()`, exactly as the current implementation already does correctly) and does not count against
this budget.

**Registration:** project-level only in `.claude/settings.json`. Removed from `~/.claude/settings.json` (see
Merged) — the global copy currently duplicates this per-project registration for every one of the ~10
projects that have their own copy, firing the update-check and the injection twice with no benefit.

### 2 · `pre-tool-use.sh` — PreToolUse, matcher `Bash|Edit|Write|NotebookEdit|Task`

The single depth-invariant enforcement point (rebuild-plan component 2: nested spawning is confirmed alive
at depth 2, so this hook — which fires identically regardless of which layer of the org chart triggered the
tool call — is what replaces the dead "only the CEO spawns" convention, not a better convention). Kept as
one bash router; new logic that needs real JSON/YAML parsing delegates to the two Node modules in `lib/`
rather than growing the bash file into something unmaintainable. Extends the current file in place — nothing
in the existing block/soft-warn table (rm -rf, chmod, npm -g, pip, wget, curl-external, --no-verify,
force-push, reset --hard, checkout --, .env, migration-immutability, the 3 soft-warns) changes.

**New logic, in dispatch order:**

**(a) Self-modification gate — flag-gated hard block.** For `Edit|Write|NotebookEdit`, if `file_path`
matches any of `.claude/agents/**`, `.claude/hooks/**`, `.claude/settings.json`,
`.claude/qa-tier-floor.yml`, `.mcp.json`, `.github/workflows/**` — check the session environment for
`BEAMIX_ALLOW_SELF_MOD=1`. If unset: `block()` with a message naming the exact path and instructing the
agent to ask Adam to set the flag for this session, or to route the change through a normal PR instead of a
direct edit if that's viable. If set: allow, but tag the write with `provenance: self-mod-flagged` for the
run log (item 5) — the flag is a hard block on the *default* path, not a silent bypass; every flagged edit
still leaves a trail. This is Locked Decision 3 verbatim: *"flag-gated hard block on agent-system paths ...
Not a review queue."*

**(b) Provenance gate delegation.** For `Edit|Write|NotebookEdit` targeting `.claude/memory/**`,
`.claude/skills/**/SKILL.md`, `.claude/agents/**`, or `docs/**` paths that read as decision/record files —
exec `node .claude/hooks/lib/provenance-gate.js` with the same stdin payload, propagate its exit code. See
item 6 below for the module itself.

**(c) Capability-resolve delegation.** For `tool_name == "Task"` — exec
`node .claude/hooks/lib/capability-resolve.js` with the same stdin payload, propagate its exit code and
surface any `hookSpecificOutput.additionalContext` it emits. See item 7 below.

**(d) Self-mod schema-lint delegation.** For `Edit|Write` where `file_path` matches `.claude/agents/*.md`
**and** step (a) allowed the write (flag was set) — synchronously run
`node .claude/hooks/schema-lint.js "$file_path"` (already supports single-file mode) and `block()` if it
exits non-zero, surfacing the linter's own issue list verbatim in the block message. Ties the self-mod gate
and the schema lint together: an agent-file edit that gets past the flag check still cannot land in a
broken state. Measured cost of this addition: `time node .claude/hooks/schema-lint.js --json` on the full
26-file set today is ~30ms; single-file mode is strictly cheaper. Comfortably inside budget even stacked
with the other checks below.

**What's unchanged:** the existing bash-native blocks and soft-warns from the current file, verbatim.

**Exit-code convention, made explicit (see Format & schema for why):** every hard-block code path — bash-
native or delegated — must exit **exactly `2`**, never any other non-zero value. `0` = allow (optionally
with a soft-warn on stderr). No third value is meaningful to Claude Code's PreToolUse contract; a `1` from
a hard-block branch is a silent no-op, not a weaker block.

**Performance budget:** **200ms**, unchanged from the current documented budget — this hook still fires on
every applicable tool call at every spawn depth, so it is the hottest path in the whole hook library. The
budget is measured, not assumed: the test harness (item 9 below) asserts `max_ms < 200` over 5 runs on a
22KB adversarial heredoc payload and a 10-subshell payload, using the exact methodology recovered from
`fix/hook-decomposition-v2`'s test file. The delegated Node calls in (b)/(c)/(d) each need their own
sub-budget headroom — target **< 40ms each** (Node cold-start dominates; confirmed empirically at ~20-30ms
for comparable scripts in this environment) so that even a worst-case stack of self-mod + provenance +
capability-resolve on a single Task-tool call spawning inside `.claude/agents/` stays under 200ms with
margin.

### 3 · `lib/provenance-gate.js` — invoked by pre-tool-use.sh, not separately registered

**Enforces the provenance axis.** Reads the per-session provenance ledger written by
`post-tool-use-provenance.js` (item 4) at `os.tmpdir()/claude-provenance-{session_id}.json`. If
`tainted: true` and not expired, and the target `file_path` is one of the record-file globs listed in
`pre-tool-use.sh`'s dispatch (2b) — `block()` naming the specific external source (URL, tool, how many tool
calls ago) and requiring explicit human confirmation before the write proceeds, **regardless of the file's
own tier** — a `docs/**` file is normally advisory-tier, but a `docs/**` file that just absorbed a
competitor's scraped pricing page as if it were a verified fact is not, and this check runs before the tier
system ever sees the file. This is exactly the locked requirement: *"writes traceable to external/untrusted
content ... are hard-gated regardless of file type."*

Also reads `.claude/qa-tier-floor.yml`'s new `provenance_sensitive: true` flag (item 10, Format & schema) —
paths not flagged there skip the ledger check entirely, so e.g. a scan target's raw HTML being written to a
scratch file under `/tmp` never touches this gate; only paths that become durable instructions to future
agents (memory, skills, agent definitions, decision docs) do.

**Exit codes:** `2` = block (tainted + sensitive path). `0` = allow. Never a third value.

**Performance budget:** < 40ms (single JSON file read + a YAML-lite parse of the tier-floor rules already
loaded once per pre-tool-use.sh invocation by the parent process — cacheable within a single hook call, not
across calls).

### 4 · `post-tool-use-provenance.js` — PostToolUse, matcher `WebFetch|WebSearch|mcp__playwright__browser_navigate|mcp__playwright__browser_network_request`

**New.** Pure bookkeeping — writes/updates the provenance ledger that item 3 reads. Never blocks anything
itself; it exists so that blocking (which only `PreToolUse` can do) has something to check.

**Ledger schema** (see Format & schema for the full JSON shape): `tainted: true`, a `sources[]` array
(tool, URL/query, timestamp), `last_taint_ts`, and a TTL-derived `taint_expires_ts`. TTL is dual-bounded —
whichever comes first of **30 minutes** or **15 subsequent tool calls with no further external fetch** —
reusing the debounce-counter pattern already proven in `gsa-context-monitor.js`
(`DEBOUNCE_CALLS = 5` there; a longer window here because provenance risk should decay slower than a context
warning does). This prevents a single early-session `WebFetch` from silently gating every memory/skill write
for the rest of a long session.

**Exit codes:** always `0`. This hook cannot fail loudly by design — a broken provenance write should never
be the reason a legitimate tool call gets blocked; the worst case of this hook failing is under-tagging
(fails open on the *ledger*, while the *gate* in item 3 fails closed on ambiguous/missing ledger state — see
Format & schema).

**Performance budget:** < 50ms (single JSON read-modify-write).

### 5 · `post-tool-use-context.js` — PostToolUse, no matcher (all tools)

**Replaces** `gsa-context-monitor.js` (renamed — see Merged). Same warning/critical/auto-compact mechanism,
unchanged thresholds (35% / 25% / 20%) and unchanged debounce (5 calls). Two fixes:

1. **Dead-command fix.** The CRITICAL message currently says *"If using GSA, run `/gsa:pause-work`"* — a
   command that has never existed (confirmed above, and flagged as a P0 in `AUDIT_LOG.md` on 2026-05-05,
   unfixed for 96 days). Replaced with: *"Hand off now — invoke the `handoff` skill to compact this
   conversation into a document the next agent can pick up."* The `handoff` skill already exists and does
   exactly this job; the fix is pointing an existing message at a mechanism that's actually real, not
   inventing a new one.
2. **Registration de-dup.** Registered **globally only** (`~/.claude/settings.json`), removed from every
   per-project `.claude/settings.json` — since context-window management is identical logic across all ~10
   projects and the cross-project reach is the whole point of a shared kit, one global registration is
   strictly better than N project-level duplicates that currently double-fire in this project specifically.

**Exit codes:** always `0` (unchanged — this hook has never blocked and shouldn't; it injects
`additionalContext`, nothing more).

**Performance budget:** < 100ms typical (measured today at ~23ms for a representative payload; unchanged
logic keeps this number).

### 6 · `post-edit-typecheck.sh` — PostToolUse, no matcher, self-filters to `apps/web/**/*.ts(x)`

**Kept as-is, unchanged.** No defect found on inspection. Advisory-only (`exit 0` always), narrow, fast.
Listed here for completeness of the enumeration, not because anything about it changes.

**Performance budget:** < 1s (unchanged — documented in the file's own header as the target; the dominant
cost is `tsc`, already isolated to a single file, not the full project graph).

### 7 · `stop.sh` — Stop, no matcher

Kept — **never** becomes a blocking hook; the "SOFT-WARN ONLY" contract in its own header stays exactly as
documented, and `DECISIONS.md`'s "blocks git merge" claim gets corrected (see Format & schema) rather than
the hook being changed to match a wrong claim. The four existing checks (uncommitted changes, commit format,
session file present, `qa_verdict` in frontmatter) are unchanged.

**New: run-log append with a STALLED envelope (rebuild-plan component 5).**

On every fire:
1. Resolve `MAIN_REPO=$(git worktree list | head -1 | awk '{print $1}')` — the existing convention already
   used elsewhere in this codebase (CLAUDE.md's Git Worktree Protocol) — so the run log lands in one shared
   file regardless of which of the (potentially many, ephemeral, gitignored) `.worktrees/*` subdirectories
   the session actually ran in. Appending inside a worktree that later gets deleted on merge would silently
   lose the entry; appending at `$MAIN_REPO` avoids that.
2. Read the `os.tmpdir()/claude-run-{session_id}.json` file `session-start.js` wrote at session start for
   `run_id` and `started_ts`.
3. Determine `structured_output_emitted`: read the Stop payload's `transcript_path`; scan the final ~20
   messages for a `tool_use` block whose name is in a small configured "terminal-output" tool list
   (`StructuredOutput`, or — for a top-level session, not a subagent — a final assistant message with no
   further tool calls after a `Task` return). If none found, `structured_output_emitted: false` and
   `status: STALLED`; otherwise `status: completed`. This is a heuristic, not a guarantee — flagged
   explicitly in Open questions.
4. Append one JSON line (schema in Format & schema below) to `$MAIN_REPO/.claude/memory/run-log.jsonl`.
5. **Rotation**, mirroring the existing `DECISIONS.md` → `DECISIONS_ARCHIVE.md` precedent (that precedent
   already exists in this repo — `.claude/memory/DECISIONS_ARCHIVE.md` is a real file today): when
   `run-log.jsonl` exceeds **5,000 lines or 90 days** since the oldest retained entry, move the excess to
   `docs/09-metrics/run-log-archive/run-log-{YYYY}-Q{n}.jsonl` and truncate. Committed to git (not
   `.gitignore`d) — unlike the ephemeral `/tmp` ledgers, this is exactly the kind of small, structured,
   append-only operational record CLAUDE.md's own memory-file convention already treats as source-of-truth
   material.

**Exit codes:** unchanged — always `0`. The run-log append is wrapped in the same `trap 'exit 0' ERR`
pattern already used for the four existing checks; a failure to append (disk full, malformed transcript,
whatever) degrades to a stderr warning, never blocks session close.

**Performance budget:** the existing four checks are git-status/git-log-bound and already fast in practice.
The new steps add one JSON read, a bounded transcript tail-scan (last ~20 messages, not the full
transcript), and one file append. Budget: **< 2s** total — Stop hooks are not in the hot per-tool-call path
like PreToolUse, so the ceiling is generous, but a session that hangs on close for multiple seconds is still
a real, user-facing cost worth bounding explicitly rather than leaving open-ended.

### 8 · `schema-lint.js` — CI-only lint, plus synchronous local invocation from `pre-tool-use.sh` (2d)

Not a Claude Code runtime hook event by itself (no `PreToolUse`/`PostToolUse`/`Stop`/`SessionStart`/
`UserPromptSubmit` — it's a standalone script two other mechanisms call into). Kept in `.claude/hooks/` by
existing convention since it's colloquially "the hook library's" compilation step, per the rebuild plan's
own framing: *"the lint IS the compilation step. A declared capability that doesn't resolve fails the
build."*

**Extended checks, added to the existing frontmatter/body/worker/c-suite checks (all kept as-is):**

1. **`mcpServers:` resolution**, mirroring the existing `skills:` → `MANIFEST.json` check exactly. Reads a
   generated `.claude/mcp-manifest.json` (item 11 below) and fails any agent file declaring an
   `mcpServers:` entry not present in it. Confirmed today this would fail on `linear`, `github`, `context7`,
   `pgvector`, `segment-cdp`, `framer-mcp`, `ide` — 7 dead names across the 12 declared, exactly as measured
   above.
2. **Description-truncation lint.** Flags any `description:` frontmatter field that doesn't end on a word
   boundary followed by terminal punctuation (a regex check, not a length cap — several current
   descriptions are cut mid-word at an arbitrary byte count, and since progressive-disclosure selection
   keys on this field, a truncated description is a **silent matching failure**, not a cosmetic one, per
   the rebuild plan).
3. **Data-driven `VALID_MODELS` and `maxTurns` ranges**, replacing both hardcoded constants. `VALID_MODELS`
   reads from a new single-source-of-truth `.claude/models.json` (item 12) instead of a literal array in the
   script — this is the direct fix for why the linter and the agent files can currently only ever be
   *mutually* consistent (both hardcode the same stale list) rather than *externally* correct against
   whatever model family is actually running. `maxTurns` range becomes per-role-class instead of one
   `[5, 30]` band for everyone: `worker: [5, 50]`, `c-suite: [15, 30]`, `ceo: [15, 30]` — derived directly
   from the measured failure (all 10 current failures are workers legitimately using `maxTurns: 50`; the
   linter's range was wrong, not the agents).

**Wiring — the actual fix for "wired into nothing":**
- **CI**: a `schema-lint` job added to `.github/workflows/qa-lead-pass.yml` (or a new lightweight sibling
  workflow), running on any PR touching `.claude/agents/**`, gating the same way the existing QA-verdict
  check does. This is what CLAUDE.md already claims exists for the Trivial/advisory tier.
- **Local, synchronous**: `pre-tool-use.sh` dispatch (2d) above, single-file mode, on every agent-file edit
  that clears the self-mod flag gate — catches the problem at write time, not just at PR time.

**Exit codes (script-level, unchanged):** `0` = all pass, `1` = any fail (CI-blocking), `2` = script error.
Note this is a **different** exit-code convention than the PreToolUse hooks (where `2` means "hard block")
— `schema-lint.js` is a standalone CLI tool with its own long-standing contract (`0`/`1`/`2` = pass/fail/
error), and `pre-tool-use.sh`'s delegation in (2d) translates `schema-lint.js`'s non-zero into its own
`block()` (always PreToolUse-exit-`2`) rather than forwarding the raw code. Called out explicitly in Format
& schema so a future editor doesn't assume the two conventions are the same because they share a directory.

**Performance budget:** single-file mode, called synchronously from (2d) — target **< 40ms**, consistent
with the other delegated calls' sub-budget above. Full-corpus mode (CI path) has no hard budget — it runs
once per PR, off the interactive path.

### 9 · Test harness — `tests/*.test.sh`, `tests/*.test.js`

**Formalizes the pattern recovered from `fix/hook-decomposition-v2`'s `tests/pre-tool-use.test.sh`** (297
lines, 44 real assertions, reproduced passing above) as the mandatory shape for every hook in the library,
not just `pre-tool-use.sh`.

**Required properties of every test file:**
1. **Explicit interpreter pin.** Every `.test.sh` file's own header states, and its harness enforces, that
   it runs under `/bin/bash` specifically — `BASH_BIN="/bin/bash"` as a variable, every subprocess call
   routed through it, never trusting `env bash` to resolve consistently between a developer's Homebrew shell
   and CI/production's stock interpreter. This is not theoretical: the exact mismatch this guards against
   is what let the `_candidates[@]: unbound variable` crash ship on an unreviewed branch and go undetected
   until directly reproduced during this spec's own research.
2. **Five finding categories**, adopted verbatim from the recovered file's own header convention because
   it's a genuinely good taxonomy: **CRASH** (interpreter-version incompatibility), **INCOMPLETE**
   (a case the hook should catch but doesn't), **FALSE POSITIVE** (a case the hook wrongly blocks),
   **PERF** (budget-blowing input), **HARNESS-ITSELF** (a real runnable file exists at all — "a claim" is
   not evidence).
3. **Perf assertions measure `max`, not `avg`, over 5 runs, on adversarial input sized to the hook's actual
   attack surface** — for `pre-tool-use.sh`, the recovered 22KB-heredoc-payload generator and the
   10-subshell generator are adopted directly (both reproduced above at 74ms and 68ms max respectively,
   comfortably under 200ms). Every hook's test file defines its own adversarial-input generator sized to
   what that specific hook parses — `stop.sh`'s test file uses a synthetic large transcript file for its
   STALLED-detection scan, not the heredoc generator, which is meaningless for that hook.
4. **`schema-lint.test.js` uses fixture files, not inline strings** — `tests/fixtures/agents-good/*.md` and
   `tests/fixtures/agents-bad/*.md`, one bad fixture per lint rule added (mcpServers resolution, description
   truncation, maxTurns range per role) so each rule has a standing regression case.

**Wiring:** a `hook-tests` job, triggered on any PR touching `.claude/hooks/**` — which
`.claude/qa-tier-floor.yml` already marks `irreversible` today, so this rides the existing tier rather than
inventing a new one — running every `tests/*.test.sh` under explicit `/bin/bash` and every `tests/*.test.js`
under `node`. **This is the mechanism that would have caught the crash and the 120-second-plus timeout
before the salvage-and-abandon cycle happened** — neither defect required a human to spot manually; both are
exactly what an automated perf/compat assertion catches on the first CI run.

### 10 · `lib/generate-mcp-manifest.js` — CI script, not a runtime hook

Reads `.mcp.json` (project) and `~/.claude.json`'s `mcpServers` key (global — the layer that actually holds
`stitch`/`refero`/`playwright`/`pencil`/`miro`/`runpod`/`higgsfield`/`mem0` today, confirmed above) and
writes the union to `.claude/mcp-manifest.json`, the file `schema-lint.js` extension 8.1 reads. Run in CI
before the `schema-lint` job, and available to run locally (`node .claude/hooks/lib/generate-mcp-manifest.js
> .claude/mcp-manifest.json`) so a developer can regenerate it after connecting a new MCP server without
waiting for a CI round-trip.

### 11 · `.claude/models.json` — new data file, not a script

Single source of truth for valid model identifiers, read by `schema-lint.js` (replacing its hardcoded
`VALID_MODELS` array) and by any future doc-generation step for CLAUDE.md's model table (not itself part of
the hooks surface, flagged as a dependency below). Schema in Format & schema.

### Explicitly not built: a `UserPromptSubmit` hook

Gap-map item #4 (prompt-injection scanning) was reconciled in the rebuild plan as *"Folded into the
provenance axis. Becomes a `provenance: untrusted` tag checked in the existing PreToolUse hook, not a new
UserPromptSubmit hook."* Honored as-is: everything that a `UserPromptSubmit` scanner would have caught
(untrusted content trying to steer a subsequent write) is instead caught downstream, at the point the tainted
content actually attempts to become a durable write, by items 3-4 above. Listed here explicitly so it reads
as a considered-and-rejected option, not an oversight in this enumeration.

---

## Changes: kept / cut / merged / added

**Kept, unchanged:**
- `post-edit-typecheck.sh` — no defect found; narrow, fast, correctly advisory.
- `pre-tool-use.sh`'s existing bash-native block/soft-warn rules (rm -rf, chmod, npm -g, pip, wget,
  curl-external, --no-verify, force-push, reset --hard, checkout --, .env, migration-immutability, the 3
  soft-warns) — all still needed; the sandbox (see Cut) replaces evasion-hardening, not the policy rules
  themselves. A sandbox can stop a subshell from reaching a forbidden filesystem path or network host; it
  has no opinion on "don't force-push to main" or "don't skip pre-commit hooks," which are Beamix-specific
  business rules, not security boundaries.
- `stop.sh`'s four existing checks and its "always exit 0" contract — extended with a fifth (run-log
  append), not replaced.
- `schema-lint.js`'s frontmatter/body/worker/c-suite checks and its existing `skills:` → `MANIFEST.json`
  cross-check — extended, not replaced.
- `gsa-statusline.js` — unchanged; still the source of the context-percentage bridge file.
- `.claude/qa-tier-floor.yml` as the deterministic classifier mechanism — extended with two new fields
  (Format & schema), first-match-wins logic unchanged.

**Cut:**
- **The entire compound-command-decomposition line of work** — both the broken version (`272fb31`/`18e637a`,
  confirmed crashing under bash 3.2 and confirmed hanging past 120s on an adversarial payload) *and* the
  working rework that fixes both (`39aa2c8`, 44/44 tests passing, 74ms max — genuinely good work, still
  cut). Rationale, from the rebuild plan's own reconciliation: *"The native filesystem/network sandbox
  replaces the substring blacklist entirely, including the `node -e` bypass class. Three QA rounds were
  spent hardening a mechanism the platform now obsoletes."* A sandbox boundary at the filesystem/network
  syscall level cannot be evaded by string obfuscation — subshells, heredocs, base64, whatever — the way a
  regex-based decomposition pass always remains a step behind adversarial input. This is a strictly stronger
  guarantee for zero ongoing maintenance, which is the actual reason it wins even though a working
  implementation already exists: the maintenance-avoided is the point, not the existence of the fix. **The
  test-harness *shape* from `39aa2c8`'s companion test file is kept** (item 9) — the code it was testing is
  what's cut, not the testing discipline.
- `gsa-context-monitor.js` and `gsa-check-update.js`'s **duplicate project-level registration** — cut in
  favor of global-only registration (see Merged).
- The `npm view gsa-startup-kit version` update-check target — cut as pointed at the wrong package; blocked
  on component 9's design for what replaces it (Open questions).

**Merged / renamed:**
- `gsa-check-update.js` → `session-start.js`, gaining the mandatory-skill-read injection and the run-log
  session-init write. Renamed (not just extended) because "check-update" no longer describes its primary
  job — the update check becomes one of three things it does, not the reason it exists.
- `gsa-context-monitor.js` → `post-tool-use-context.js`. Renamed for the same reason as above (dropping the
  `gsa-` prefix is a naming choice tied to whether the whole system rebrands away from the GSA-kit lineage as
  part of component 9's canonical-repo work — flagged explicitly as a cross-surface dependency below, not
  decided unilaterally here) and to fix the dead `/gsa:pause-work` reference and the duplicate-registration
  defect in the same change.

**Added:**
- `post-tool-use-provenance.js` — new PostToolUse hook; no prior equivalent existed. Closes gap-map item #7
  ("hooks that redact tool output... no prior art found. Genuinely unbuilt") only partially — it tags
  provenance, it does not redact; full output-redaction stays open (Open questions).
- `lib/provenance-gate.js` — new; enforces the provenance axis at write time, not just at CI/PR time.
- `lib/capability-resolve.js` — new; closes the "grants that nothing resolves" gap dynamically, at spawn
  time, complementing schema-lint's static check.
- `lib/generate-mcp-manifest.js` — new CI script; makes the capability-resolve check possible by giving it
  a ground-truth manifest to check against.
- `.claude/models.json` — new data file; removes the last hardcoded model list (schema-lint's) so model-name
  drift can only happen in one place instead of two staying accidentally in sync.
- The self-modification gate itself ((2a) in `pre-tool-use.sh`) — genuinely new; today, editing
  `.claude/hooks/pre-tool-use.sh` is ungated at write time despite `qa-tier-floor.yml` calling it
  irreversible.
- The `tests/` directory as a first-class, CI-wired part of the hook library, not an unmerged branch's
  artifact.

---

## Format & schema

### PreToolUse / PostToolUse / Stop / SessionStart I/O contract (unchanged from current, made explicit)

- **stdin**: Claude Code's JSON payload for the event (`tool_name` + `tool_input` for PreToolUse/PostToolUse;
  `session_id` + `transcript_path` + `stop_reason` for Stop; `session_id` for SessionStart).
- **stdout**: empty on the common path; for hooks that inject context (`session-start.js`,
  `post-tool-use-context.js`, `capability-resolve.js` on a soft-warn path), a single JSON object shaped
  `{"hookSpecificOutput": {"hookEventName": "<Event>", "additionalContext": "<string>"}}`.
- **stderr**: human-readable message shown to the agent on the next turn — used for every `block()` reason
  and every soft-warn.
- **Exit codes — the one convention every hook in this library must follow without exception:**
  - `0` = allow / success. May carry a soft-warn on stderr; execution continues either way.
  - `2` = **the only exit code that means "block."** Every hard-block code path, bash or Node, must exit
    precisely `2`. This is called out explicitly because the *current* `pre-tool-use.sh` header comment says
    "non-zero = BLOCK," which is imprecise in a way that matters: per Claude Code's actual hook contract,
    only exit `2` is a blocking error fed back to the agent; any other non-zero is a **non-blocking** error
    shown only to the user. A future edit that adds a hard-block branch using `exit 1` — trusting the
    existing comment — would silently fail to block anything. The target-state comment in every hook file
    states the precise rule, not the looser one.
  - Any other non-zero = hook-implementation error (e.g. `schema-lint.js`'s own `2` = "script error," a
    *different*, CLI-tool-scoped convention — see item 8's callout on why the two conventions coexist
    without conflict, since `pre-tool-use.sh` always translates `schema-lint.js`'s raw exit code into its own
    `2`-or-`0` before returning).
- **Stop-hook-specific:** exit code is *always* `0` regardless of any check's outcome — enforced structurally
  via `trap 'exit 0' ERR` plus a final literal `exit 0`, exactly as today.

### `.claude/qa-tier-floor.yml` — extended schema

Two new fields, additive to the existing `pattern` / `tier` / `reason` / (optional `added`) shape:

```yaml
rules:
  - pattern: "docs/**"
    tier: advisory                 # renamed from `trivial` — see rationale below
    provenance_sensitive: true     # NEW — if the provenance ledger shows `tainted: true` for a write
                                    #   touching this path, ESCALATE the effective tier to `full`
                                    #   regardless of what's declared here. Absent/false = no escalation.
    reason: "Documentation — human-readable review, no hard CI block, UNLESS provenance-tainted."
```

**`trivial` → `advisory` rename, applied consistently across `qa-tier-floor.yml`, `qa-lead-pass.yml`'s
`RANK[]` array, and CLAUDE.md's 4-tier table.** `trivial` implies "doesn't matter"; a docs typo genuinely
doesn't matter, but a docs *decision record* absorbing unverified external content and never getting
human-read does. "Advisory" is the accurate word for "reviewed by a human, not hard-blocked by CI" — which
is what the tier's *behavior* already is today (`Haiku schema-lint hook only (auto-pass)`), just not what
its *name* says. Mechanical rename, zero logic change beyond the new `provenance_sensitive` escalation path.
`provenance_sensitive: true` is set on `docs/**`, `.claude/memory/**`, and `.claude/skills/**` — the three
globs where a write becoming a trusted instruction to a future agent is the actual risk being guarded
against.

### Provenance ledger — `os.tmpdir()/claude-provenance-{session_id}.json`

```json
{
  "session_id": "abc123",
  "tainted": true,
  "sources": [
    { "tool": "WebFetch", "target": "https://competitor.example.com/pricing", "ts": 1786220400 }
  ],
  "last_taint_ts": 1786220400,
  "taint_expires_ts": 1786222200,
  "calls_since_taint": 3
}
```
`provenance-gate.js` treats a **missing or unparseable** ledger file as `tainted: false` (fails open on
absence — a session that never fetched anything external has nothing to gate), but a ledger that exists and
fails to parse as valid JSON as `tainted: true` (fails closed on corruption — an unreadable ledger is treated
as "we don't know, so assume worst case" rather than silently skipped).

### Run-log line — `.claude/memory/run-log.jsonl` (one JSON object per line, newline-delimited)

```json
{"run_id":"...", "session_id":"...", "ts":"2026-08-09T14:32:10Z", "agent":"backend-engineer",
 "mechanism":"worker-direct", "model":"claude-sonnet-4-6", "tokens_in":42000, "tokens_out":3100,
 "cost_usd":0.31, "tier":"full", "thinking_layer_invoked":false, "qa_verdict":"PASS",
 "duration_s":184, "structured_output_emitted":true, "status":"completed"}
```
`status` is one of `completed` / `STALLED` / `error`. `mechanism` names which of the (post-component-6) one
parametrized fan-out engine's configs produced this run (`worker-direct`, `thinking-layer`, `qa-gate`) — not
a hooks-surface field to design in depth here, listed only so the schema is self-describing; owned by
whichever surface spec covers the fan-out engine.

### `.claude/mcp-manifest.json` — generated, not hand-authored

```json
{
  "generated_at": "2026-08-09T14:00:00Z",
  "servers": {
    "supabase":   { "layer": "project", "source": ".mcp.json" },
    "playwright": { "layer": "global",  "source": "~/.claude.json" },
    "pencil":     { "layer": "global",  "source": "~/.claude.json" },
    "stitch":     { "layer": "global",  "source": "~/.claude.json" },
    "refero":     { "layer": "global",  "source": "~/.claude.json" }
  }
}
```
Anything an agent file declares under `mcpServers:` that isn't a key here fails `schema-lint.js` extension
8.1. Regenerated by `lib/generate-mcp-manifest.js`, never hand-edited (a stale hand-edit would silently
reintroduce the exact drift this file exists to catch).

### `.claude/models.json` — single source of truth for model identifiers

```json
{
  "valid": ["claude-opus-4-7", "claude-sonnet-4-6", "claude-haiku-4-5"],
  "updated": "2026-08-09",
  "note": "Update this file, not schema-lint.js's source, when the model roster changes."
}
```

---

## The mechanism that keeps this honest

Per the locked rule: a component without a named hook, CI job, resolver, or data file is disqualified. Every
item below names one.

- **Self-modification gate** → `pre-tool-use.sh` dispatch (2a), a hard `block()` unless
  `BEAMIX_ALLOW_SELF_MOD=1` is set for the session. Not a sentence in CLAUDE.md; a live `exit 2` path.
- **Blast-radius + provenance gate** → `.claude/qa-tier-floor.yml`'s extended schema (advisory/lite/full/
  irreversible + `provenance_sensitive`), read at two independent points: locally by `lib/provenance-gate.js`
  at write time, and in CI by `qa-lead-pass.yml`'s existing auto-tier step at PR time — two chances to catch
  the same class of problem, not one.
- **Capability/grant resolution** → static half: `schema-lint.js` extension 8.1 against
  `.claude/mcp-manifest.json` (generated by `lib/generate-mcp-manifest.js`, not hand-maintained). Dynamic
  half: `lib/capability-resolve.js` at every `Task`-tool spawn.
- **Run-log honesty** → `stop.sh`'s new append step writes the `STALLED` envelope mechanically (a
  transcript-derived boolean, not a self-report); the **weekly cron reader** is the second half of this
  mechanism and is non-negotiable per the rebuild plan's own stop condition #2 (*"The run log exists 4 weeks
  with no reader ... is a stop condition"*) — built via the `schedule` skill / `CronCreate` tool already
  available in this environment, running `jq` queries against `run-log.jsonl` for zero-invocation
  mechanisms, STALLED counts, and cost totals. A write-only log is `DECISIONS.md`'s 58-vs-50 problem
  repeating at higher stakes; the reader is what makes the log different from that.
- **Hook correctness itself** → the `hook-tests` CI job (item 9), triggered on any PR touching
  `.claude/hooks/**` — a path `qa-tier-floor.yml` already marks `irreversible`, so this rides an existing
  tier rather than needing a new one. This is the literal mechanism that would have caught both the bash-3.2
  crash and the 120-second-plus perf hang before they ever reached an unmerged, abandoned branch — reproduced
  directly in this research, not asserted.
- **Exit-code discipline** → a `grep`-based static check (cheap enough to run as part of `hook-tests`):
  no `.sh` file under `.claude/hooks/` may contain a bare `exit 1` on a code path reachable from a
  block-reason `echo ... BLOCKED` line — every hard-block path must route through a single `block()` helper
  that is the only place `exit 2` appears. Enforces the Format & schema convention mechanically instead of
  relying on every future editor reading the comment correctly.
- **Model-ID / maxTurns drift** → `.claude/models.json` and the per-role-class `maxTurns` ranges are the
  single sources `schema-lint.js` reads; CLAUDE.md's own model table becomes generated-from or CI-diffed-
  against `models.json` (owned by whichever surface spec covers CLAUDE.md/doc generation — flagged as a
  dependency below, not solved here).
- **`DECISIONS.md`'s wrong claim about `stop.sh`** → corrected in this document (Current state, `stop.sh`
  section) and should be corrected at the source — a follow-up append to `DECISIONS.md` itself (append-only,
  per its own convention) noting the 2026-05-05 entry's claim was wrong and pointing at
  `qa-lead-pass.yml` as the actual mechanism. Not a hooks-surface artifact to build, but the accurate
  record this spec's own research produced.

---

## Open questions

- **Native filesystem/network sandbox's exact `settings.json` syntax.** Adopted as already-locked context
  per this task's brief, but no working example of the actual config block exists anywhere in this repo
  today — I could not find one to copy or verify against. Needs to be written and tested against the real
  Claude Code schema at build time, not inferred from this spec.
- **Whether `Task` is a valid PreToolUse matcher string, or whether the capability-resolve delegation needs
  to inspect `tool_input.subagent_type` instead of matching on `tool_name` alone.** Not verified against
  live Claude Code hook-matcher documentation in this research pass — flagged for the build phase.
- **STALLED-detection reliability.** The transcript-tail-scan heuristic in `stop.sh` is exactly that — a
  heuristic. Worth checking, before building it, whether a future Claude Code version exposes a structured
  `terminal_output_emitted` boolean natively in the Stop payload, which would make this exact and remove an
  entire class of false-positive/false-negative STALLED classification.
- **Run-log location's write-concurrency.** `$MAIN_REPO/.claude/memory/run-log.jsonl` as a single shared
  append target across every worktree assumes append-only JSONL writes never interleave badly under
  concurrent sessions (multiple worktrees' `stop.sh` firing near-simultaneously). A single-line `>>`-style
  append is atomic on POSIX filesystems for writes under `PIPE_BUF` (a JSONL line comfortably qualifies), so
  this is likely fine in practice — not independently stress-tested here.
- **`gsa-` prefix rename.** This spec renames `gsa-check-update.js` → `session-start.js` and
  `gsa-context-monitor.js` → `post-tool-use-context.js`, dropping the legacy prefix on the two files being
  substantially rewritten anyway. Whether the *rest* of the system (the "GSA Startup Kit" branding
  throughout `~/CLAUDE.md`, the `gsa-sync` mechanism name itself, `.claude/gsa-file-manifest.json`) rebrands
  alongside this is **owned by rebuild-plan component 9** (canonical repo), not decided here — this spec
  only renames what it's already touching for other reasons, and flags the dependency rather than
  pre-empting that surface's decision.
- **What replaces `npm view gsa-startup-kit version`** in `session-start.js`'s update check. Directly
  blocked on component 9's canonical-repo design (what "the latest version" even means once this isn't an
  npm package) — this spec cannot resolve it in isolation.
- **Output-redaction hooks (gap-map item #7) stay genuinely unbuilt.** `post-tool-use-provenance.js` tags
  where content came from; it does not redact anything from a tool's output before the agent sees it. No
  prior art was found for this anywhere in the 12-source skill harvest either. Left open, not silently
  dropped.
- **Whether the run-log's `cost_usd` field duplicates or should merge with the existing `runaway-watcher` /
  `audit_log.cost_usd` cost-tracking system** already documented in `DECISIONS.md` (the `nonce`/
  `parent_audit_log_id` chain, `MAX_UNBLOCK_CASCADE_DEPTH`, the $1500/mo Anthropic Console hard cap as
  backstop). Two parallel cost ledgers that can silently drift apart is a worse outcome than one — this
  needs a decision at build time about whether `stop.sh` reads from the same source `runaway-watcher` does
  or maintains an independent estimate, not resolved in this spec.
- **Cross-project fit of the new `BEAMIX_ALLOW_SELF_MOD` flag name and the tier-floor's `provenance_sensitive`
  globs.** Both are Beamix-path-specific in this draft (`.claude/agents/**` etc. happen to be identical
  path shapes across the ~10 projects this kit targets, but the env-var name and the exact glob list were
  not checked against any sibling project's actual layout).
