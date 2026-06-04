---
date: 2026-06-03
role: qa-lead
task: dual-branch-review-pipeline-chain-and-approval-queue-unique
qa_verdict: PASS
tier_branch1: Lite
tier_branch2: Irreversible
branches:
  - test/agent-pipeline-chain-e2e @ 5590acb — PASS (Lite)
  - feat/approval-queue-agent-job-id-unique @ ca18f8b — PASS (Irreversible, Adam sign-off required)
---

## Round 1 (34fbdf8) — BLOCK

P1 confirmed by both validators independently: `ON CONFLICT (agent_job_id)` against a PARTIAL unique index raises SQLSTATE 42P10 on every call (first delivery + retries). Agent approvals could never reach the queue. Both validators prescribed the same fix: plain unique index.

P2 confirmed by code-reviewer: FK `ADD CONSTRAINT` without `DROP CONSTRAINT IF EXISTS` is non-idempotent.

## Round 2 (ca18f8b) — PASS

Fix verified by direct read of the migration at ca18f8b:

- P1 RESOLVED: `CREATE UNIQUE INDEX IF NOT EXISTS uq_approval_queue_agent_job_id ON public.approval_queue (agent_job_id)` — plain unique index, no WHERE predicate. NULLS DISTINCT by default so multi-NULL non-agent rows still allowed. ON CONFLICT (agent_job_id) inference now valid against a plain unique index per Postgres spec.
- P2 RESOLVED: `DROP CONSTRAINT IF EXISTS fk_approval_queue_agent_job; ADD CONSTRAINT fk_approval_queue_agent_job ...` — idempotent drop-then-add pattern, plain SQL, no plpgsql DO-block.
- No plpgsql/DECLARE/DO-blocks (grep-confirmed by CEO).
- tsc --noEmit exit 0; vitest 34/34 pass (CEO-verified).
- No index.ts changes needed — code was correct once the index was inference-compatible.
- Remaining as-any casts are scoped to new column only, cleanup deferred to post-merge types regen (P3, not a blocker).

## Branch 1 — PASS (Lite, no validators required)

2 unique commits: E2E integration test (498 lines) + session file. No production code. 41/41 tests pass.

## Post-merge actions (not merge-blockers)

- Adam runs `supabase db push` to apply migration to production.
- Regen database.types.ts to remove 2 scoped `as any` casts in approval-gate-writer/index.ts.
