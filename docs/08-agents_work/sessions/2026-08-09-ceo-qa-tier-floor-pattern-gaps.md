---
date: 2026-08-09
role: ceo
session: ceo-agent-system-rebuild
task: Close verified pattern gaps in .claude/qa-tier-floor.yml — the deterministic risk classifier the merge gate reads
tier: irreversible
qa_verdict: PASS
pr: 198
branch: fix/qa-tier-floor-pattern-gaps
---

# PR #198 — qa-tier-floor pattern gaps

## What changed

One file, `.claude/qa-tier-floor.yml`, data-only.

- `.claude/skills/MANIFEST.json` → `irreversible`. Closes an attack chain found by adversary-engineer while
  reviewing PR #197: a low-tier PR removing one MANIFEST entry breaks every agent referencing that skill, the
  newly-wired `schema-lint` then fails, and CI goes red on every subsequent unrelated PR — bricking merges via a
  route that never crosses the `.claude/agents/**` irreversible gate. Set to `irreversible` rather than the
  originally-specified `lite` because **only `irreversible` hard-blocks**; `full` and `lite` print an info line and
  let the merge proceed. Confirmed by Adam.
- `.claude/settings.json` pattern globbed to cover `.claude/settings.json.proposed`, which previously resolved to
  `lite` despite being the file whose application would unwire the only blocking hook and the run-log append path.
- `.claude/qa-tier-floor.yml` given the same `.proposed` coverage, preemptively.
- Header comment corrected, and one latent parser hazard removed.

## Two corrections established during this work

1. **The resolver is HIGHEST-TIER-WINS, not first-match-wins.** `qa-lead-pass.yml:215-217` keeps MAX rank across all
   matching rules with no `break`; rule order has no effect. The file's own header comment claimed otherwise and was
   wrong — as did the CEO's brief to the worker and the rebuild-plan doc, both of which inherited it. A 2026-05-29
   session had already found this and the comment was never fixed. Consequence: one of the two bug classes the
   worker was asked to hunt (specific rule shadowed by a broader earlier one) **cannot occur** under real semantics.
2. **`MANIFEST.json` was never `trivial`** — it resolved to `lite` via the `**` catch-all. The adversarial finding
   that named it "trivial" was inaccurate about the tier, though the attack chain it described is real.

## Parser hazard (recorded for the record)

The CI resolver **substring-matches; it does not parse YAML**. Any line containing `- pattern:` or `tier:` is read as
a rule, including comments. The worker's own first draft of the corrected header comment tripped this and silently
promoted every file in the repo to tier `full` — caught by before/after repro testing, not inspection. `main` carried
exactly one latent instance (old line 18), inert only because it sits above the first rule line; removed here. The
new PARSER HAZARD warning is deliberately phrased "the full tier" rather than the trigger substring, so the comment
documenting the trap does not spring it.

## QA — irreversible tier, 3-of-3 coverage

| Reviewer | Verdict | Findings |
|---|---|---|
| QA-Lead | PASS | none. 37-path sweep + all ~6000 tracked files enumerated against the 3 changed patterns |
| code-reviewer | PASS | 1× P3 — header documents an append-only protocol; this PR edits two patterns in place (tier values unchanged) |
| security-engineer | PASS | none. Reproduced the F15 state machine; 34 rules extracted, 0 from the 49-line prose block. Verified byte-identity to PR HEAD three ways |
| adversary-engineer | PASS | 778 paths tested, 0 downgrades, 0 phantom rules |

adversary-engineer supplied an **analytic proof** covering all paths rather than a sample: every rule from main is
preserved; the two widened patterns only add matches while already at max rank; the one new rule is additive. Under
max-rank semantics, widening a max-rank rule or adding a candidate to a max computation can only raise or hold a
resolved tier, never lower it.

## Follow-ups filed, not fixed here

- `.claude/workflows/**` (the QA gate's own scripts, 10 tracked files) still resolves to `lite`. Fix exists on
  unmerged branch `feat/spec-conformance-and-qa-lead-accuracy` (`09b81ee`) and will conflict textually here.
- **`.mcp.json` resolves to `lite`** — it grants tool and API access to every agent, a blast radius comparable to
  `.claude/hooks/**` which is already `irreversible`. Found by adversary-engineer. Open.
- `.claude/commands/**` resolves to `lite`. Lower blast radius. Open.
- `trivial` is structurally unreachable: the `**` catch-all sits at `lite` and max rank wins, so no path resolves to
  `trivial`. Fixing needs a resolver algorithm change, not a data change — deliberately kept out of this data-only
  PR so its regression evidence stays valid. Filed against rebuild-plan component 3.
- Component 3 gains a requirement: **replace the substring scan with real YAML parsing**, or the data file is not
  trustworthy however correct its content.

Five holes were found in this one classifier by five separate passes in a single day, none of them by reading the
file. The discovery rate is itself the argument for a resolver.
