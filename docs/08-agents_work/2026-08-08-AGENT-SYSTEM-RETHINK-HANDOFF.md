# Agent-System Rethink — Handoff

**Date:** 2026-08-08 · **From:** `ceo-gsa-kit-audit` · **Next task:** capability gap map (harvest phase)

---

## Read this first

Three things will save the next session hours:

1. **Beamix is not behind — it is the reference implementation.** `gsa-core` v6.3.0 was seeded *from* Beamix's 2026-05-16 C-suite rethink. `ceo.md` differs from core's template by exactly 3 lines (`{{PROJECT_NAME}}` tokens). Do not "catch Beamix up" — there is nothing to catch up to.
2. **The architecture is mainstream and does not need restructuring.** Across 14 external projects, one-level controller fan-out + dispatch packets + worktrees-with-gated-merge *is* the normal shape. The nested-Task constraint is the normal condition, not our handicap. No evidence supports a new roster, new tiers, or new taxonomy.
3. **What is actually broken is that quality mechanisms are not wired to anything.** See the table below. This is the finding that explains the entire pain history.

---

## The core finding — 7 quality mechanisms, 1 works

| Mechanism | Believed to do | Actually does | Verified by |
|---|---|---|---|
| CI correctness gate | block bad merges | **does not exist** — no workflow runs tsc/vitest/build | `grep -lniE "tsc\|vitest\|next build" .github/workflows/*.yml` → empty |
| `qa-lead-pass.yml` | binding QA gate | greps for `qa_verdict: PASS` — a string the agent wrote about its own work | line 86 |
| `schema-lint.js` | enforces Trivial tier | **never runs** — 0 refs in `settings.json` or CI | `grep -c schema-lint .claude/settings.json` → 0 |
| `stop.sh` | session-file discipline | `exit 0`, "informational only" | tail of file |
| `MANIFEST.json` | routes skill discovery | 121/121 paths point at `.agent/skills/` — **directory does not exist** | `ls -d .agent/skills` → absent |
| `promptfoo-eval.yml` | catches agent regressions | dead trigger path `.agent/skills/**` — **never fired on a skill change** | lines 14-18 |
| `coding.js` ref check | prevent QA on wrong diff | warned and proceeded → **PASS on empty diff** | **FIXED today**, `aa6ce1a` |

Only `pre-tool-use.sh` (exit 2) genuinely blocks anything.

**Implication:** the QA gate went 0-for-29 sessions not from forgetfulness — passing it required writing one line of YAML about yourself. The field's verdict matches: *"every mechanism that actually survives a dead process lives in infrastructure — leases, alarms, lockfiles, checkpoints — never in agent instructions."* And the project with the most elaborate written reliability taxonomy (`rohitg00`, 136 agent files describing retry/backoff/circuit-breakers) has **zero executable code** behind it. Prose describing a mechanism is the strongest available signal the mechanism does not exist.

---

## Stall diagnosis (corrected)

"Worker stalls" — the #1 logged failure across 9+ sessions — is **~4:1 return-channel truncation, not stalls.** In nearly every case the work was **already committed**; recurring evidence: *"had actually done the work"*, *"committed work"*, *"salvaged"*, *"re-engaged"*. This is why the `maxTurns` 20→50 fix failed: it was never a turn-budget problem.

Two genuine stalls remain with a different signature: a hard 600s timeout, and an Opus synthesizer given a 1500-line single-shot target that only succeeded when scope was cut to 600-800.

Separately, **twice** a Full-tier QA run BLOCKed purely because the Opus judge hit a spend limit. The gate cannot distinguish "found a defect" from "ran out of money."

**Open design question:** the field is genuinely split on the fix. *Resume-the-work* (qm's Postgres leases + reaper, Cloudflare's SQLite-checkpointed fibers) vs *restart-clean* (`rokicool` **explicitly refuses** agent resume — "breaks with parallel tool calls" — always fresh agents with explicit state; `github/awesome-copilot` relaunches fresh). Given our stalls are truncation-where-work-was-committed, restart-clean-reading-the-branch may fit better and avoids the concurrency hazard. Decide deliberately.

---

## Current repo state

`origin/main` = `deabafd` (2026-06-13). **0 commits in 56 days.** Nothing from this session is merged.

**Unmerged branches (all committed, none gated):**
| Branch | Commit | Contents |
|---|---|---|
| `fix/coding-integration-ref` | `aa6ce1a` | coding.js fails closed instead of PASSing an empty diff |
| `docs/agents-md-real-roster` | `5ce8340` | AGENTS.md regenerated from the real 26-agent roster |
| `feat/agent-audit-workflow` | `37924ae`, `d0e7f4c` | `agent-audit.js` + caller-settable verify cap |
| `feat/system-redesign-workflow` | `2afc98b` | `system-redesign.js` |

**Also note:** the main repo working tree has 8 modified + 2 untracked files uncommitted since ~June — untouched by this session, needs a decision.

---

## Research completed (do not redo)

| Run | Scope | Result |
|---|---|---|
| `wf_4d71cfe2-2a4` | 5 deep (BMAD, spec-kit, agent-os, superpowers, anthropics/skills) + 10 survey | 112 findings, 7 verified, 12 recommendations |
| `wf_36e71384-64b` | 7 deep (qm, cloudflare/agents, cloudflare-os, doncheli, rohitg00, awesome-copilot, gsd-opencode) + 3 survey | 80 findings, 20 verified, 5 rejected, 15 recommendations (4 ADOPT) |
| `wf_cd1a92d8-a54` | internal redesign — 242 artifacts | 234 verdicts — **see caveat below** |

Outputs are on disk under the session's `tasks/` dir; both audit runs use the identical 8-axis schema so their matrices compose.

### ⚠️ Caveat on the redesign run — a real methodology failure worth learning from

The redesign proposed cutting **118 skills (149→14)**. That number is **wrong**. Its `reference_count` signal under-counted — it missed backticked names in markdown tables and YAML `skills:` list entries. Verified counter-examples: `brainstorming` reported 0, actually 9-11 refs; `writing-plans` 0 → 8; `multi-agent-patterns` 0 → 7.

**The dangerous part:** the workflow's deterministic guard ("any CUT on an artifact with `reference_count > 0` → demote to FLAGGED_REVIEW, cutting something wired requires a human") fired only **2 times** — because every count came back 0. *The safety net was defeated by a bad input, which is precisely the failure it existed to prevent.* Any future workflow with a JS guard keyed on a computed signal must validate that signal independently.

Recount script: `scratchpad/recount.py`. Corrected result: **12 safe cuts, 95 actively wired.**

---

## Verified, actionable now

**12 skills safe to cut** (zero references, verified):
```
stripe-integration    clerk-auth    payment-integration
nextjs-best-practices frontend-dev-guidelines
create-pr  git-pr-workflows-git-workflow  finishing-a-development-branch
parallel-agents  ai-agents-architect  tool-design  vector-database-engineer
```
Two are **wrong-stack landmines inherited from the GSA kit**: `stripe-integration` is 456 lines (vs `paddle-integration` at 173) against `CLAUDE.md`'s *"Payments: Paddle (NOT Stripe)"*; `clerk-auth` contradicts our Supabase auth. Both would actively misdirect an agent. Cut these first.

**The other 95 proposed cuts need agent-rewiring, not deletion** — `commit` is named by 28 files, `code-reviewer` by 17.

**Top 3 changes by rubric:**
1. **`check` script + required PR job** (lint→typecheck→vitest→build, same script run in-worktree by workers) — turns merge safety from self-attestation into a machine fact. `effort: S`. Source: cloudflare/agents + cloudflare-os, both verified.
2. **Wire `schema-lint.js` or delete it** — a declared enforcer that doesn't run is worse than none, because it's relied upon.
3. **The two dead-path one-liners** — `.agent/skills/**` → `.claude/skills/**` in `promptfoo-eval.yml` and `MANIFEST.json`.

---

## NEXT SESSION'S TASK — capability gap map

**What has NOT been done:** an inventory harvest. The research answered *how these systems work* (8 architecture axes). It never asked *what do they actually ship, and what should we take?*

Not yet inventoried: agent rosters (awesome-copilot ~224, rohitg00 136), skill corpora (anthropics ~501, VoltAgent 1,000+, OpenClaw 5,400+, doncheli 51), command sets (rohitg00 42, doncheli 88), hook libraries (rohitg00 15-20), and sandbox/permission models as a distinct question.

**Approved shape — capability gap map, NOT a raw harvest:**
1. **Inventory** what each project ships, by type
2. **Collapse into capabilities** (not file lists) — "what can this system do?"
3. **Diff against ours** — which capabilities are we missing?
4. **Only then** find the best implementation of each missing capability

Rationale: importing 200 skills recreates the bloat that's been cleaned 3× already. The question is *what should the best startup-building system be able to do*, not *what files exist out there*. Budget ~60-100 agents across phases.

**Reusable:** `agent-audit.js` (on `feat/agent-audit-workflow`) already does resolve → clone → blind-extract → adversarial-verify → deterministic-matrix → evidence-gated-adopt. The harvest is a different extraction schema on the same skeleton. **Do not** reuse `research.js` (claim→URL shaped, and its pinned `researcher` agentType has no Bash).

**Binding constraints for any recommendation:**
- Net agent and skill counts must **not rise** — prefer deletion
- No new prose rules — name the CI job, hook exit code, or data file that enforces it
- Subagents cannot spawn subagents
- T1-T5 and C-suite names are frozen — propose behavior changes, not vocabulary
- Defend the keeps: "it's fine" is not a rationale

---

## Open decisions for Adam

1. `.claude/workflows/**` is absent from `qa-tier-floor.yml` → falls through to `lite`. The binding gate's own logic is editable under the lightest review. Fixing it is itself an irreversible-tier edit.
2. `CLAUDE.md` says "CCO folded into CPO"; `.claude/agents/cco.md` exists as a complete active agent.
3. `CLAUDE.md` implies C-suite runs Sonnet 4.6; `cto.md`/`cpo.md` frontmatter declares `claude-opus-4-7`.
4. Recommendations 1-3 touch irreversible-tier paths (`.github/workflows/`, `.claude/hooks/`) → need sign-off.
5. The 8 modified + 2 untracked files in the main repo working tree.

## Tripwire (from the approved plan)

**No customer-facing commit on `main` by 2026-08-15** → all agent-system work pauses until one lands. `main` has been static 56 days. The prior rethink's dissent — *"Plan #5 in a project with 0% plan completion rate"* — is on record and was not wrong.
