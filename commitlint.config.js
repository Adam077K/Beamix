// Beamix commit message convention enforcement.
// Extends the conventional-commit base ruleset, but narrows the allowed
// `type` values to Beamix's actual branch-prefix convention (feat/fix/chore —
// see CLAUDE.md + .github/workflows/qa-lead-pass.yml branch regex
// ^(feat|fix|chore)/). Commitlint's default type-enum is broader
// (feat/fix/docs/style/refactor/perf/test/build/ci/revert/chore); a commit
// using a type outside {feat, fix, chore} would pass commitlint but still
// not match the branch-prefix regex the QA gate relies on, so we scope the
// enum down here to keep the two conventions aligned.
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'chore']],
  },
};
