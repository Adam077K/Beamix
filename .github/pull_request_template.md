## What changed

<!-- One-paragraph summary of the change. Why this PR exists. -->

## Type

<!-- One of: feat / fix / chore / docs / refactor -->

## Linear ticket

<!-- Link the corresponding Linear ticket: BMX-... -->

## Session file

<!-- Path to the session file at docs/08-agents_work/sessions/YYYY-MM-DD-<lead>-<slug>.md.
     The qa-lead-pass workflow checks this file's frontmatter for `qa_verdict: PASS`.
     If missing, the workflow fails and merge is blocked. -->

## QA verdict

- [ ] QA Lead PASS recorded in session file frontmatter
- [ ] OR `qa-lead-bypass` label applied AND comment from Adam containing `BYPASS REASON: ...`

## Risk tier

<!-- Trivial / Lite / Full per WS2 §QA tiering -->

## Test plan

- [ ] Local typecheck (`pnpm -F @beamix/web typecheck`)
- [ ] Local build (`pnpm -F @beamix/web build`)
- [ ] Unit tests pass (if applicable)
- [ ] Smoke-tested in dev environment (if applicable)

## Notes

<!-- Anything reviewers should know. -->
