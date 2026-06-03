---
date: 2026-06-03
role: backend-engineer
task: typegen-cleanup
tier: lite
qa_verdict: PENDING
branch: chore/approval-queue-types-cleanup
---

Copied regenerated Supabase types (post approval_queue migration) into worktree; agent_job_id column is now typed as `string | null` in database.types.ts.
Removed 2 `as any` casts and 2 stale TODO comment blocks in approval-gate-writer/index.ts.
TSC=0 (full regen clean, no unrelated drift errors), VITEST=0 (34/34 passed).
