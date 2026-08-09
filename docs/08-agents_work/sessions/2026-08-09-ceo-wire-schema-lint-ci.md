---
date: 2026-08-09
role: ceo
session: ceo-agent-system-rebuild
task: Wire schema-lint.js into CI and correct its stale maxTurns bound
tier: irreversible
qa_verdict: PASS
pr: 197
branch: feat/wire-schema-lint-ci
---

# PR #197 — wire schema-lint into CI

## The defect

`.claude/hooks/schema-lint.js` is a working 361-line agent-file validator that CLAUDE.md names as **the** Trivial-tier
gate. It was registered in zero hooks and zero workflows — it only ran when someone typed the command by hand.

Meanwhile `.claude/agents/**` is the **highest tier in `.claude/qa-tier-floor.yml`** (`irreversible`, rationale:
"bad prompt cascades across every spawn"). The repo classified that path as its most dangerous file class and left
its only purpose-built checker running nowhere.

## Two changes

**1. Corrected the stale `maxTurns` bound, `[5,30]` → `[5,60]`.** Before: 16 pass, 10 fail — all ten failures the
single `maxTurns=50 outside range [5,30]` check. After: 26 pass, 0 fail, exit 0.

The bound was widened rather than clipping ten agent files. The decisive evidence is not doctrinal but recorded:
**`DECISIONS.md` [2026-05-27] documents the 20→50 bump for workers, shipped as PR #92 at irreversible tier.** Eight
agents were deliberately set to 50 by an approved decision and the linter was never updated to match. This is the
linter catching up to a decision already made, not a safety guard being loosened. It also aligns with the locked
principle *constrain outcomes, not methods* — a turn cap constrains method.

Zero `.claude/agents/*.md` files are in the diff.

**2. Wired it into the existing `qa-lead-pass.yml` job**, not a new workflow, per the target-system spec. Step order:
checkout → setup-node → schema-lint → QA-verdict → tier-floor → irreversible enforcement. No `continue-on-error`, so
a lint failure fails the job. No existing step modified, reordered, or weakened.

`actions/setup-node` is **SHA-pinned** (`49933ea5288caeca8642d1e84afbd3f7d6820020 # v4.4.0`, verified against
GitHub's API) per capability gap-map item #2. Pre-existing `uses:` lines were deliberately left untouched —
retro-pinning belongs to that workstream, and widening an irreversible diff makes it harder to review.

## QA — irreversible tier, 3-of-3 coverage

| Reviewer | Verdict | Findings |
|---|---|---|
| QA-Lead | PASS | 1× P2 — the lint is not path-filtered, so a bad agent file landing on main would fail CI on unrelated PRs. Intended per the diff's own comment; fails loudly and attributably |
| security-engineer | PASS | none. `schema-lint.js` requires only `fs`/`path` — no `child_process`, network, or `eval`. Workflow triggers on `pull_request` (not `pull_request_target`) with a read-only token and no secrets |
| code-reviewer | PASS | 1× P3 — the `setup-node` step has no `name:` key |
| adversary-engineer | PASS | 1× P2 — see below. 1× P3: frontmatter `maxTurns` is not autonomously enforced by the harness, so widening the bound is not a security regression |

**The P2 that mattered:** adversary-engineer traced a route to brick the merge pipeline. `.claude/skills/MANIFEST.json`
resolved to a non-blocking tier; removing one entry breaks every agent referencing that skill, this new lint then
fails, and CI goes red on every subsequent unrelated PR — without ever crossing the `.claude/agents/**` irreversible
gate. **Closed by PR #198, which merges before this one.** That ordering is deliberate: it leaves no window in which
the lint is live and the bypass is open.

## Verified by execution

`node .claude/hooks/schema-lint.js` → 26 pass, 0 fail, exit 0 — run independently by the worker, the CEO, and
QA-Lead. QA-Lead additionally inspected live CI run 31302691020 step-by-step and confirmed the new steps executed and
the existing steps ran unmodified afterward.

That run is the first time this repository's CI has executed any code against a diff. No CI job here runs `tsc`,
`eslint`, `pnpm test`, `pnpm build`, or `pnpm audit` — the gate has been a `grep` for a hand-typed string with
nothing behind it. This PR is the first step of component 3's third half.

## Open, unresolved

Two agents disagreed on whether frontmatter `maxTurns` is runtime-enforced: the prose-rule inventory called it a real
SDK-level ceiling; adversary-engineer found the harness only honours what a spawning parent passes to `Task`.
Unverified either way, immaterial to this PR. If adversary is right, every `maxTurns:` line in 26 agent files is
decorative — recorded so it is not lost.
