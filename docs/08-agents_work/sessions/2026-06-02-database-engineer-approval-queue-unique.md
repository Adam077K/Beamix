---
date: 2026-06-02
agent: database-engineer
task: approval-queue-agent-job-id-unique
branch: feat/approval-queue-agent-job-id-unique
qa_verdict: PENDING
tier: irreversible
---

Added `agent_job_id uuid` column to `approval_queue` with FK → `agent_jobs(id) ON DELETE SET NULL` and partial UNIQUE index `uq_approval_queue_agent_job_id` (WHERE agent_job_id IS NOT NULL) as DB-layer idempotency backstop for Inngest `gated_publish.requested` retries.
No backfill required — column is net-new; all existing rows are NULL.
Rollback: run `rollback/20260602000001_approval_queue_agent_job_id.rollback.sql` (drops index → constraint → column in reverse order).
