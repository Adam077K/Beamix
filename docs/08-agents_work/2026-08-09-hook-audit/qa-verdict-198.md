---
qa_verdict: PASS
tier: irreversible
pr: 198
branch: fix/qa-tier-floor-pattern-gaps
base: main
reviewed_by: qa-lead
date: 2026-08-09
---

# QA Verdict — PR #198 `.claude/qa-tier-floor.yml`

**Verdict: PASS.** Tier: Irreversible. Scope: single file, three commits
(0d2bdfa, 83bbea1, cb961a4), +49/-8 lines, no other files touched.

## Method

This is the deterministic risk classifier the merge gate itself reads, so I
did not trust the worker's self-report and did not wait on reviewer replies
before independently reproducing the CI resolver's exact logic. Reviewer
dispatch (code-reviewer, security-engineer, adversary-engineer) was sent to
team-lead in parallel; see "Reviewer coverage" below for status.

## 1. Comment-parsing hazard (the highest-risk item) — CLEARED, exhaustively

`.github/workflows/qa-lead-pass.yml` lines 198-227 (F15 step) is bash
`case`/`sed` substring matching over every line of the map file, per
changed file — not a YAML parser. Any line containing the literal
substring `- pattern:` or `tier:` is treated as a real rule field,
including inside a `#` comment.

I ran `grep -n -- "- pattern:"` and `grep -n "tier:"` against the full PR
HEAD file content (not a sample — every line): 34 hits each, and every
single hit is a real `- pattern: "..."` / `tier: ...` rule line under
`rules:`. Zero comment lines contain either substring.

**`comment_lines_parsed_as_rules: 0`** — confirmed by exhaustive grep, cross-
checked against the actual bash `case` logic (reproduced verbatim in a
local script and run against the file).

Cross-check against `main`: exactly **one** such hazard existed pre-PR —
line 18, `# Require: tier:full review + 2-of-3 multi-judge + Adam sign-off.`
— confirmed inert today only because no prior line sets `current_pattern`
to a non-empty value before that comment is reached in the per-file scan
(current_pattern="" at that point → the case pattern degenerates to
matching only the empty string). The PR reworded it to "Require: full
review..." removing the colon. Independently reproduced and confirmed.

**Correction to the brief:** the claim that a "second pre-existing
[parser-hazard] instance dating to 2026-05-16" was neutralized does not
hold up — I found exactly one hazard line in `main`, not two, and the
diff introduces no second fix of that kind. Re-reading commit cb961a4's
message, "Close the second verified hole" refers to the *unrelated*
MANIFEST.json blast-radius gap (a substantive, correct fix — see §3), not
a second parser-hazard line. This looks like the brief conflating "second
hole" with "second hazard instance." Doesn't change the verdict — the
hazard count in the actual file is 0, which is what matters — but flagging
per the instruction to verify every premise independently.

## 2. Regression sweep — 34/34 rules exercised, exact match to worker's claim

I built a 37-path test set covering every one of the 34 rules in the file
(one representative path per rule, including the two catch-alls) and ran
the actual F15 bash logic (reproduced verbatim) against `main` and PR HEAD.
Result: **exactly 3 paths change tier**, all upward, all intentional:

| path | before | after |
|---|---|---|
| `.claude/settings.json.proposed` | lite | irreversible |
| `.claude/skills/MANIFEST.json` | lite | irreversible |
| `.claude/qa-tier-floor.yml.proposed` | lite | irreversible |

No other path in the 37 moved. This matches the worker's claim in commit
cb961a4 (worker said "34-path sweep" — my count differs slightly at the
path-list level (37) but is a superset and reaches the identical
conclusion; not a discrepancy worth blocking on).

I additionally went further than a sampled sweep: since the diff only
touches three pattern lines (`.claude/settings.json*`,
`.claude/qa-tier-floor.yml*`, and the new `.claude/skills/MANIFEST.json`
rule), any tier change can only come from a file matching one of those
three. I enumerated every one of the ~6,000 tracked files against those
three literal-prefix patterns directly (`git ls-tree -r --name-only main |
grep ...`) rather than relying on the slow per-file bash simulation:

- `.claude/settings.json*` matches exactly `.claude/settings.json` (already
  irreversible pre-PR) and `.claude/settings.json.proposed` (the intended
  change) — no other file in the repo starts with that prefix.
- `.claude/qa-tier-floor.yml*` matches only `.claude/qa-tier-floor.yml`
  itself; `.claude/qa-tier-floor.yml.proposed` does not yet exist in the
  tree (the rule is preemptive, as the commit message states).
- `.claude/skills/MANIFEST.json` matches exactly one tracked file at that
  path (the `.archive/**/MANIFEST.json` copies are different paths and are
  unaffected).

This is exhaustive, not statistical, for the three changed rules — which is
the entire attack surface of this diff. (I also kicked off a brute-force
per-file simulation across all ~6,000 tracked files against both file
versions as a belt-and-suspenders check; it was still running past the
~10 minute mark due to the O(files × maplines) shape of the actual CI
script and I did not block on it — the prefix-enumeration above already
closes the question with certainty.)

No duplicate pattern definitions were introduced (checked: all 34
`pattern:` values are unique).

## 3. Substantive changes — verified correct

- `.claude/skills/MANIFEST.json` floored at irreversible: correct call.
  `schema-lint.js` (wired into CI by #197) validates every agent's
  `skills:` list against this file; a low-tier PR pruning one entry would
  fail schema-lint on every subsequent unrelated PR without ever crossing
  `.claude/agents/**`'s irreversible gate. Same blast-radius class as
  `.github/workflows/**`, which the file already floors at irreversible.
- `.claude/settings.json*` / `.claude/qa-tier-floor.yml*` glob widening:
  correct and minimal — confirmed both still match their own base file
  (no coverage lost) and now also cover `.proposed` siblings.
- Header correction (highest-tier-wins, not first-match-wins): verified
  directly against the F15 step's actual code (lines 210-221) — `if
  [ "$this_rank" -gt "$REQUIRED_RANK" ]` with no `break`, scanning every
  rule for every file. The old header claim was wrong; the new one is
  right.
- `trivial` unreachable via F15 (catch-all `**` sits at lite, and
  lite(1) > trivial(0) under max-rank semantics): confirmed via the sweep
  above (`docs/**`, `.claude/memory/**`, `README.md` all resolve to `lite`,
  not `trivial`, on both before and after). Correctly left unfixed here —
  it's a resolver-algorithm question, not a data question, and is noted in
  the file's own comment as filed separately. Not a blocker for this PR.

## 4. YAML validity

`python3 -c "import yaml; yaml.safe_load(open('.claude/qa-tier-floor.yml'))"`
→ parses clean, 34 rules loaded.

## 5. Coordination note (not a defect in this PR)

Unmerged branch `feat/spec-conformance-and-qa-lead-accuracy` (commit
09b81ee) independently inserts a `.claude/workflows/**` → irreversible
rule at the same location in this file (right after `.claude/hooks/**`).
Confirmed via `git show 09b81ee -- .claude/qa-tier-floor.yml`: it's a
textual insertion conflict on merge, not a semantic contradiction — the
two PRs add different, non-overlapping patterns. Whoever merges second
will need a trivial rebase. Not a reason to block #198.

## 6. Gate state

PR already carries the `risk:irreversible` label (confirmed via `gh pr
view 198 --json labels`), satisfying F15's hard-block requirement. No
session file yet exists on the branch at
`docs/08-agents_work/sessions/*-qa-tier-floor-pattern-gaps.md` — the
separate "Check QA Lead PASS" step (F1-F7) that gates actual merge needs
one with `qa_verdict: PASS` before this can merge; that's on
CTO/whoever lands this, not a QA finding against the diff itself.

## Reviewer coverage

Dispatch packet sent to team-lead for code-reviewer, security-engineer,
and adversary-engineer at session start. None had reported back by the
time this verdict was written. Per team-lead's explicit instruction to
avoid repeating the prior stalled run, this verdict is issued on my own
direct, exhaustive evidence above rather than waiting further. If any
reviewer later reports a finding, treat this verdict as re-openable on
that basis; nothing in my own review found any P0/P1.

## Findings

None P0/P1. No P2/P3 either — this is a data-only, well-scoped fix that
closes real gaps and gets the resolver documentation right.
