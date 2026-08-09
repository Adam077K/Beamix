# Hook audit — synthesis

**Date:** 2026-08-09 · **Session:** ceo-agent-system-rebuild · **Status:** planning only, nothing built
**Inputs:** `gsd-core-hooks.md` (31 files), `get-shit-done-hooks.md` (16 files), `beamix-prose-rules.md` (63 rules)
**Commissioned to answer:** "GSD has 78 hooks and we have 7 — is that a gap we should close?"

---

## The answer: no, and the question was wrong

**The hook-count gap does not exist.** Read rather than grepped:

| | Hook files | Wired | Can block | **Live blocking, Claude Code** |
|---|---|---|---|---|
| `open-gsd/gsd-core` | 31 | 11 | 8 | **3** — 3 of the 8 target Cursor/Windsurf, 2 more are shipped-but-unregistered |
| `gsd-build/get-shit-done` | 16 | — | 2 | **~1** — one is build-time only; the runtime one self-gates on a config flag |
| **Beamix** | 7 | 6 | 1 | **1** — `pre-tool-use.sh`, `exit 2` at line 38 |

Three published figures during this session — 78 vs 7, then 23 vs 3, then Beamix's 3 — were all produced by matching
filenames and strings instead of reading code. The real difference is **two hooks**. Any plan step built on the
original number should be discarded.

## What the real gap is

**Beamix states 63 rules and enforces 9.**

| Bucket | Count | Meaning |
|---|---|---|
| ENFORCED | 9 | A hook, CI job, or data file actually implements it |
| UNENFORCED — MECHANIZABLE | **40** | A hook or CI job could plausibly check it; none does |
| UNENFORCED — INHERENTLY-JUDGMENT | 14 | No mechanical check exists; these should stop being written as rules |

**14% of stated rules are enforced.** The bottleneck was never missing prior art — porting all four viable GSD hooks
addresses roughly 4 of the 40. The unbuilt mechanisms are ours.

This is the rebuild plan's own diagnosis, now measured: *"the rebuild is not an architecture problem, it is a
compilation problem."* 40 is the size of that problem.

## Five new verified findings

Each confirmed by a worker reading the implementing file, not inferred.

1. **`.claude/settings.json.proposed` would unwire the entire enforcement surface.** It contains **zero
   `PreToolUse` and zero `Stop` registrations**. CLAUDE.md documents it as the Bash allowlist, *"pending apply."*
   Applying it as written removes `pre-tool-use.sh` — the only blocking hook in the system, and component 2's
   single depth-invariant enforcement point — and removes `stop.sh`, component 5's run-log append path. The one
   config change the project documents as pending deletes enforcement and observability in a single apply. It
   touches a settings file, so the tier map already classifies it Irreversible; nothing checks it.

2. **No CI job anywhere runs `tsc`, `eslint`, `pnpm test`, `pnpm build`, or `pnpm audit`.** The plan recorded that
   the QA verdict is forgeable. It is worse than that: **no code is ever executed against the diff by CI at all.**
   The gate is a `grep` for a hand-typed string in a markdown file, and nothing behind it compiles, tests, or
   builds anything. Strengthens component 3 — the SHA-bound verdict is necessary and not sufficient.

3. **A second forgery path in `qa-lead-pass.yml`.** Its file-path tier-floor hard-fails only at `irreversible`. A
   `full`-tier floor — e.g. touching `apps/web/src/lib/auth/**` — prints an info line and lets a session file
   declaring `tier: lite` merge. The plan recorded one forgery path; there are two.

4. **A sixth fabricated mechanism, live in the decisions store.** `DECISIONS.md` contains an entry claiming
   `stop.sh` hard-blocks merges without a QA PASS. `stop.sh` is hardcoded `exit 0` on every path, and a Stop hook
   cannot intercept a `git merge` Bash call in principle. The prior audit found five fabrications; this is the
   sixth, and it is *in the file that records what we decided*. Decision 8's implemented-claim resolver is aimed
   at exactly this.

5. **The tier-floor map does not classify `settings.json.proposed` at all** — found by QA-Lead reviewing the fix for
   finding 1, and confirmed directly: `.claude/qa-tier-floor.yml:31` matches `.claude/settings.json` as an **exact
   string with no glob**, and no other pattern covers `.proposed`. `.claude/hooks/**` and `.github/workflows/**` *are*
   globbed, so PR #197 auto-tiered correctly while PR #196 did not — its `risk:irreversible` label was applied by a
   human, not derived by the map.
   **Why this is the sharpest finding of the session:** the file whose application would unwire the entire enforcement
   surface (finding 1) is not classified as irreversible by the classifier that decisions 9 and 15-17 and components
   1, 2, 3 and 8 all read. The deterministic layer everything else is built on has a hole in it, and the hole is
   exactly under the most dangerous file. Fix belongs in `qa-tier-floor.yml`, not in either PR — filed as follow-up.
   **Generalize before fixing:** the bug class is exact-string patterns where a glob was intended. Audit every
   pattern in the file for the same defect rather than patching this one filename.

Plus two hygiene items: `promptfoo-eval.yml` targets `apps/web/promptfoo/promptfoo.config.yaml`, which exists only
in the archive — it fails the moment its API key secret is set. And `schema-lint.js` is a correct, already-passing
361-line validator registered in zero hooks and zero workflows.

## What GSD is actually good at, and it is not gating

**31 of the 47 hooks across both libraries are advisory** — they inject `additionalContext`/`systemMessage`, cache
state, scan output, or drive a statusline. They shape what the agent *knows*, not what it *may do*. Beamix has one
hook in that family (`gsa-context-monitor.js`).

This fits the locked principle better than gating does. *Constrain outcomes, not methods* argues for hooks that
widen what a worker knows without narrowing what it may try. **This is a hook class the rebuild plan does not
currently contain**, and it is the one genuinely new idea the audit surfaced.

## Declared-never-wired is not a Beamix pathology

**5 of gsd-core's 31 hooks are shipped to disk, config-gated, documented, and registered nowhere** — no code path
puts them in `hooks.json`. An externally-built system, by a different team, with a larger hook library, has the
same disease.

That is the strongest available external evidence for decision 8 and for wiring `schema-lint.js` at step 1. It is
not a discipline problem that better habits would fix. It is what happens to any system with no resolver.

## The four ports that survive

Each maps to a Beamix rule that is prose today. None is a straight copy; all need the receiving-project
re-classification that decision 20 requires.

| Port | From | Enforces the Beamix rule | Note |
|---|---|---|---|
| `worktree-path-guard` | gsd-core | The entire Git Worktree Protocol — currently enforced by nothing | Compares git toplevel of the edit target vs. active worktree. Swap the branch regex. |
| `write-guard` | gsd-core | Append-only memory files and the entry caps | Blocks a whole-file Write shrinking a curated file below ~40% of its lines. `DECISIONS.md` is append-only by convention only, now 61 entries past a cap nobody enforces. |
| `agent-isolation-guard` | gsd-core | Layer Contract: chiefs never edit `.ts`/`.tsx`/`.sql` | Detects edits outside a subagent context. |
| `read-injection-scanner` | both | Gap-map #4 / the provenance axis | PostToolUse scan of Read/WebFetch output for injection phrasing and invisible unicode. Immediately relevant: 24 untrusted repos were cloned to this machine today. |

**Explicitly not ported:** the commit-format validator. It enforces a real Beamix rule, but commitlint was already
cut from the gap map for causing an incident that broke 50+ worktrees. "Near drop-in" gets verified, not trusted.

## What this changes in the plan

- **Step 1 (wire `schema-lint.js`) gets stronger, not weaker.** 40 unenforced-mechanizable rules and an external
  system with the same disease both argue it is the right first move. The sharpest form of the argument:
  **`.claude/agents/**` is the single highest tier in our own `qa-tier-floor.yml` — `irreversible`, rationale "bad
  prompt cascades across every spawn" — and the one automated check purpose-built for that exact file class runs
  nowhere.** We classified it as the most dangerous thing in the repo and then left its only checker unwired.
  Corollary found the same way: CLAUDE.md calls the Trivial tier a "Haiku schema-lint hook," but `schema-lint.js`
  is a deterministic Node script with no LLM in it at all — a seventh documentation inaccuracy. And every
  Trivial-tier path (`docs/**`, `.claude/memory/**`, `.claude/skills/**`, `**/*.md`) receives **zero automated
  review of any kind** today.
- **Component 3 needs a third half.** SHA-bound verdict + enabled ruleset + *something that actually executes code
  against the diff*. A forgery-proof verdict on a gate that compiles nothing is still theater.
- **Component 3 must also close the `full`-tier forgery path**, not only the `irreversible` one.
- **A new candidate component: advisory context hooks.** Not in the plan today. Fits the principle better than any
  gate in it.
- **No hook-porting workstream.** Four targeted ports, sequenced with the components they serve — not a library.
- **`settings.json.proposed` needs defusing before anyone applies it.** Highest-urgency item found.

## Method note

Four numbers were wrong before this audit and were corrected by reading the implementing file: two from a prior
audit (`8 gsa-core sync PRs` → 1; `4+ QA-reviewed branches` → 0) and two from this session (`78 vs 7`, `23 vs 3`).
Every correction moved in the same direction — the grepped number overstated the real one.

The operational rule this supports: **a count produced by pattern-matching is a hypothesis, not a finding.** It is
the same failure the run log's STALLED heuristic is already flagged for, and the same reason decision 19 splits
`verified_by: command` from `verified_by: judge`.
