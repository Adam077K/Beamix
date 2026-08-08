// Beamix commit message convention enforcement.
// Extends conventional-commit base ruleset with Beamix-specific overrides.
//
// type-enum: matches the convention in .claude/hooks/stop.sh:82, plus `design`
// which is in active repo use but absent from stop.sh's own list. This enum
// is NOT derived from the branch-prefix regex in qa-lead-pass.yml — that regex
// (^(feat|fix|chore)/) governs branch NAMING for session-file lookup and is a
// separate, unrelated convention. The two live independently.
//
// header-max-length: raised to 140 because real Beamix commit headers routinely
// exceed the config-conventional default of 100 (e.g. craft-elevation headers).
//
// subject-case / body-max-line-length: disabled — config-conventional's defaults
// would reject headers that start with uppercase tokens (e.g. "CEO", "PR") and
// multi-line bodies that follow Beamix's natural prose style.
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'chore', 'docs', 'refactor',
      'test', 'style', 'ci', 'perf', 'build', 'revert', 'design',
    ]],
    'header-max-length': [2, 'always', 140],
    'subject-case': [0],
    'body-max-line-length': [0],
  },
};
