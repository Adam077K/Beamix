---
date: 2026-06-03
role: database-engineer
task: approval-queue-agent-job-id-unique
branch: feat/approval-queue-agent-job-id-unique
tier: full
qa_verdict: PENDING
needs_supabase_db_push: true
needs_types_regen: true
---

## Summary

Landed the stranded `approval_queue.agent_job_id` migration and wired the column
so the approval-gate-writer populates it on every `gated_publish.requested` event,
making the plain unique index (`uq_approval_queue_agent_job_id`, NULLS DISTINCT)
an active DB-layer duplicate-approval backstop for Inngest retries.

## QA P1/P2 hot-fixes (2026-06-03, validated by security-engineer + code-reviewer)

**P1 — Partial → plain unique index (CRITICAL runtime fix)**
The original migration used `CREATE UNIQUE INDEX ... WHERE agent_job_id IS NOT NULL`
(partial index). Postgres SQLSTATE 42P10 fires on every call to
`ON CONFLICT (agent_job_id) DO NOTHING` against a partial index — ON CONFLICT
inference requires a plain unique index as arbiter. Removed the `WHERE` predicate.
A plain unique index with NULLS DISTINCT allows multiple NULL rows (non-agent
approvals) unchanged, while being a valid ON CONFLICT arbiter.
No change to `index.ts` — the `.upsert({ onConflict: 'agent_job_id', ignoreDuplicates: true })` now resolves correctly.

**P2 — Idempotent FK via drop-then-add (plain SQL)**
`ADD CONSTRAINT` with no `IF NOT EXISTS` would error on full re-apply (CI resets,
staging refresh). Replaced with `DROP CONSTRAINT IF EXISTS fk_approval_queue_agent_job`
followed by `ADD CONSTRAINT fk_approval_queue_agent_job`. Pure SQL — no plpgsql
DO-block per the Supabase SQL Editor $$ bug rule.

## Migration

`apps/web/supabase/migrations/20260602000001_approval_queue_agent_job_id.sql`

- `ADD COLUMN IF NOT EXISTS agent_job_id uuid` (nullable)
- FK → `agent_jobs(id) ON DELETE SET NULL` (idempotent: drop-then-add)
- `CREATE UNIQUE INDEX IF NOT EXISTS uq_approval_queue_agent_job_id ON approval_queue (agent_job_id)` (plain, NULLS DISTINCT — no WHERE predicate)
- Rollback: `apps/web/supabase/migrations/rollback/20260602000001_approval_queue_agent_job_id.rollback.sql` (unchanged — drops by name)
- No plpgsql — pure SQL only

## Column wiring

`apps/web/src/lib/agents/approval-gate-writer/index.ts`

- `agent_job_id` populated from `input.artifactId` (validated as UUID — matches `agent_jobs.id` per `buildGatedPublishIntent` in pipeline/runner.ts)
- Insert changed to `.upsert(row, { onConflict: 'agent_job_id', ignoreDuplicates: true })` — idempotency strategy
- On conflict (null data returned), falls back to `SELECT` by `agent_job_id` to retrieve existing row id
- Non-UUID `artifactId` values → `agent_job_id = null` (non-agent approvals not affected)
- `TODO(approval-queue-unique)` comments mark the `as any` casts pending types regen

## Test results (post P1/P2 fix)

- `pnpm -F @beamix/web exec tsc --noEmit`: TSC=0
- `vitest run src/lib/agents/approval-gate-writer src/inngest/functions/approval-gate-writer.test.ts`: VITEST=0, 34 passed (2 test files)

## Post-merge actions required

1. `supabase db push` — Adam runs after merge (per Supabase CLI DB workflow)
2. Regenerate `database.types.ts` — `supabase gen types typescript` after push
3. Remove `as any` casts in `index.ts` after types regen (search `TODO(approval-queue-unique)`)
