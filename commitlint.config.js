// Beamix commit-message convention enforcement (commitlint).
//
// Enforced twice, independently, from the same config:
//   1. Locally — scripts/setup-git-hooks.js installs a worktree-scoped
//      commit-msg hook that runs `commitlint --edit "$1"`.
//   2. In CI — .github/workflows/commit-lint.yml runs `commitlint --from
//      <base> --to <head>` on the PR's commit range, using the exact same
//      binary + config (no wagoid-style separate resolution to drift from).
//
// type-enum — evidence, measured 2026-08-08 via
// `git log --oneline --all --pretty=%s | grep -oE '^[a-zA-Z]+' | sort | uniq -c`
// across 1,579 commits on origin:
//   Base list matches .claude/hooks/stop.sh's own conventional-commit regex
//   (feat|fix|chore|docs|refactor|test|style|ci|perf|build|revert).
//   Four more types are NOT in stop.sh's list but are real, repeated,
//   deliberate conventions in this repo (not typos — all use the
//   `type(scope): description` shape consistently):
//     - `design` (7 occurrences)  — UI/design-craft commits, e.g. `design(dashboard): ...`
//     - `polish` (19 occurrences) — design-craft refinement passes, e.g. `polish(ui/schema): ...`
//     - `audit`  (4 occurrences)  — board/CTO audit synthesis commits, e.g. `audit: consolidated synthesis`
//     - `merge`  (174 occurrences) — manually-authored branch-merge commits, e.g.
//       `merge(uix): Batch F capture-gated ...` / `merge feat/x into y`. NOT the
//       same as git's own auto-generated "Merge pull request #N from ..." commits,
//       which commitlint's default ignore rules already skip regardless of type-enum.
//   Known duplication: this list is hand-synced with stop.sh's regex (~line 82).
//   No automated sync exists — if you add or remove a type here, update stop.sh too.
//
// header-max-length — evidence, measured 2026-08-08 via
// `git log --oneline --all --pretty=%s | awk '{print length}' | sort -rn`:
//   1,579 headers total. 111 exceed 100 chars, 10 exceed 140, 2 exceed 200,
//   0 exceed 220. Longest observed header is 206 chars. 220 leaves headroom
//   above every historical header while still being a real, enforced
//   ceiling (not effectively unbounded). Enforcement is forward-only —
//   commitlint only lints commits made after this hook/CI check exists, so
//   this is a discipline ceiling going forward, not a retroactive one.
//
// subject-case / body-max-line-length — disabled. config-conventional's
// defaults reject subjects starting with an all-caps token (e.g. real
// merged headers like "QA pass — drop business_name PII from progress...",
// "...IRREVERSIBLE" suffixes) and multi-paragraph prose bodies, both of
// which are this team's real, intentional commit style.
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'chore',
        'docs',
        'refactor',
        'test',
        'style',
        'ci',
        'perf',
        'build',
        'revert',
        'design',
        'polish',
        'audit',
        'merge',
      ],
    ],
    'header-max-length': [2, 'always', 220],
    'subject-case': [0],
    'body-max-line-length': [0],
  },
};
