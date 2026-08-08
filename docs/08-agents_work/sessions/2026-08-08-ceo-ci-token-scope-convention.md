---
date: 2026-08-08
role: ceo
session: docs-ci-token-scope-convention
task: Wave 2 item #5 (CI-half) — document least-privilege GitHub Actions permissions convention
tier: trivial
qa_verdict: PASS
qa_note: Docs-only change (ENGINEERING_PRINCIPLES.md). Audited both existing workflow files (qa-lead-pass.yml, promptfoo-eval.yml) — both already declare correctly-scoped permissions: blocks, so this codifies existing good practice rather than changing behavior. No code risk.
pr: TBD
branch: docs/ci-token-scope-convention
---

# CEO Session — CI token-scope convention

## Outcome
Added a "CI token scope" bullet to `docs/ENGINEERING_PRINCIPLES.md`'s Security Standards section, requiring every GitHub Actions workflow to declare an explicit, minimal `permissions:` block. Audited the repo's 2 existing workflow files first — both already comply, so this is documentation of an existing convention, not a behavior change.

## Decisions made
- Local-credential-scoping half of capability-gap-map item #5 (Adam's ambient gh/MCP credentials inherited by local Claude Code sessions) was explicitly out of scope — it needs Adam to provision separately-scoped credentials outside any repo file, not an agent-buildable change.

## Blockers
None.

## Session file
docs/08-agents_work/sessions/2026-08-08-ceo-ci-token-scope-convention.md
