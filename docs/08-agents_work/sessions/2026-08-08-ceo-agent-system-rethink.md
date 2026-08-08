---
date: 2026-08-08
role: ceo
session: ceo-gsa-kit-audit
task: Agent-system rethink — Phase 0 repairs + Phase 1 external research (15 OSS agent frameworks, 8 axes)
tier: lite
qa_verdict: N/A
qa_note: Phase 0 fixes are committed on feature branches, unmerged and un-gated — qa.js has NOT been run on them. No merge performed. Research phase is read-only.
pr: none
branch: fix/coding-integration-ref · docs/agents-md-real-roster · feat/agent-audit-workflow
---

# CEO Session — Agent-system rethink (audit → repair → research)

## Outcome
Session began as a GSA-kit location audit and escalated into a full agent-system rethink. Three phases ran: an audit of every kit install on the machine, a set of Phase 0 repairs, and a T5 research run comparing 15 open-source agent frameworks against Beamix's own system.

## Part 1 — Kit audit (artifact: claude.ai/code/artifact/7077187b)
Beamix is not behind; it is the **reference implementation** that `gsa-core` v6.3.0 was seeded from. `ceo.md` differs from core's template by exactly 3 lines (all `{{PROJECT_NAME}}` tokens). Real staleness lives elsewhere: the global `~/.claude` install still ships a retired 12-persona roster that `~/CLAUDE.md` and the Cursor rules describe as current, and three active slash commands (`/daily`, `/debug`, `/ship`) invoke agents that no longer exist. `gsa-core`'s sync tool has never been run with `--apply` anywhere. A second, undocumented lineage (`GSA/GSA_startup_kit`) is kept current by hand-porting Beamix commits.

## Part 2 — Phase 0 repairs (3 branches, unmerged)
1. **`fix/coding-integration-ref`** — `coding.js` only `log()`-warned when the default ref would make `qa.js` review a non-integrated (empty) diff. Because an empty diff yields no findings, the gate returned **PASS on unreviewed code**. Now fails closed with a BLOCKED return listing the slice branches. (`aa6ce1a`)
2. **`docs/agents-md-real-roster`** — `AGENTS.md` documented 12 nonexistent GSD agents in a live-roster table and routed "New project from scratch" to `gsd-roadmapper → gsd-planner → Build Lead`, none of which exist. Regenerated from the real 26-agent roster; verified 1-for-1 against disk. (`5ce8340`)
3. **`feat/agent-audit-workflow`** — new `.claude/workflows/agent-audit.js` (746 lines). (`37924ae`)

## Part 3 — Stall re-classification (the gate finding)
Classified every stall/dropout in session history. **~9 truncation/spend-cap vs 2 true stalls (≈4:1).** In nearly every case the work was **already committed** — recurring evidence: "had actually done the work", "committed work", "salvaged", "re-engaged". This is why the `maxTurns` 20→50 fix didn't work: it was never a turn-budget problem. Two genuine stalls remain with a different signature (a hard 600s timeout; an Opus synthesizer given a 1500-line single-shot target that succeeded only when scope was cut). The QA gate is separately implicated: **twice** a Full-tier run BLOCKed purely because the Opus judge hit a spend limit — the gate cannot distinguish "found a defect" from "ran out of money".

## Part 4 — Research run (artifact: claude.ai/code/artifact/aa092f7a)
`Workflow` run `wf_4d71cfe2-2a4` — 37 agents, 0 errors, 26 min, 2.86M tokens. 5 deep-cloned (BMAD-METHOD, spec-kit, agent-os, superpowers, anthropics/skills), 9 API-surveyed, 1 unresolved (open-gsd; exact-name repo empty, best candidate `rokicool/gsd-opencode`). 112 findings, 10 adversarially verified, 3 rejected.

**Verified defects found in Beamix while comparing:**
- All **121** pathed `MANIFEST.json` entries point at `.agent/skills/` — a directory absent from this repo. Real library is `.claude/skills/` (150 dirs, 0 manifest entries). 49 truncated descriptions, 54 entries with no tags, 28 with no path.
- `promptfoo-eval.yml` triggers on the same dead `.agent/skills/**` path — **the agent regression suite has never fired on a skill change.**
- `DECISIONS.md` is 130KB / 57 entries against a documented ≤50 cap.

**Field findings that bear on our design:** almost nobody implements true nested delegation — one-level-deep controller fan-out is the norm, and real spawning comes from runtimes (Durable Objects, worker pools), not agent definitions. Worktree-per-worker is a minority pattern; the load-bearing part is the gated merge, not the worktree. Gate prose is inversely correlated with gate enforcement — binding requires a non-agent process that can say no.

**Three changes selected (rubric cap):** fix the promptfoo trigger path; regenerate + schema-lint-gate the manifest; reclaim stalled slices via git-commit heartbeat with an explicit "prior side effects unverified" resume preamble (precedent: Anthropic's `reclaim_older_than_ms`).

## Part 5 — Deepened research + internal redesign (added after initial write-up)
- **Run 2** (`wf_36e71384-64b`, 52 agents, verify cap 10→25): 7 runtime-bearing projects deep-cloned. 80 findings, 20 verified, **5 rejected by adversarial verification**. 15 recommendations, 4 ADOPT.
- **Run 3** (`wf_cd1a92d8-a54`, 28 agents): internal redesign, 242 artifacts, 234 verdicts. **Its 118-skill cut list is unreliable** — the `reference_count` signal under-counted (missed backticked table names + YAML `skills:` entries), which silently defeated the JS guard that should have demoted CUT-on-referenced to FLAGGED_REVIEW (fired 2×, should have been ~95×). Recounted correctly: **12 safe cuts, 95 actively wired**.

## THE CORE FINDING — 7 quality mechanisms, 1 works
No CI runs tsc/vitest/build. `qa-lead-pass.yml` greps for an agent-self-written `qa_verdict: PASS`. `schema-lint.js` has 0 references in settings.json or CI — it never runs, yet CLAUDE.md describes the Trivial tier as enforced by it. `stop.sh` is `exit 0`. `MANIFEST.json`'s 121 paths point at a nonexistent directory. `promptfoo-eval.yml` never fired on a skill change. `coding.js` PASSed empty diffs (fixed today). Only `pre-tool-use.sh` blocks.

This explains the QA gate's 0-for-29 record better than any structural theory: passing it required writing one line of YAML about yourself. Matching field verdict: mechanisms that survive a dead process live in infrastructure, never in agent instructions — and `rohitg00` ships the most elaborate written retry taxonomy in the set with zero executable code behind it.

**Verdict on the rethink: the architecture needs no restructuring. The enforcement layer needs to exist.**

## Handoff
Next phase (capability gap map / inventory harvest) is scoped in `docs/08-agents_work/2026-08-08-AGENT-SYSTEM-RETHINK-HANDOFF.md`. Approved to run in a fresh session.

## Open decisions for Adam
- `.claude/workflows/**` is absent from `qa-tier-floor.yml` and falls through to `lite` — the binding gate's own logic is editable under the lightest review. Fixing it is itself an irreversible-tier edit.
- `CLAUDE.md` says "CCO folded into CPO" but `.claude/agents/cco.md` exists as a complete active agent.
- `CLAUDE.md` implies C-suite runs Sonnet 4.6; `cto.md` and `cpo.md` frontmatter both declare `claude-opus-4-7`.
- Main repo has 8 modified + 2 untracked files uncommitted since ~June, untouched by this session.
- Recommendations 1 and 2 touch irreversible-tier paths and need sign-off.

## Notes
`origin/main` has had 0 commits in 56 days (tip `deabafd`, 2026-06-13). A prior 35KB external-research doc (`03-EXTERNAL-RESEARCH.md`, 2026-05-16) covering similar ground was never executed — the reason this plan capped adoption at 3 changes with mandatory enforcers and tripwires. Phase 0 branches are committed but **unmerged and un-gated**; none has passed `qa.js`.
