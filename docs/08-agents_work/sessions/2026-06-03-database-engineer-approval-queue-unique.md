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
making the partial unique index (`uq_approval_queue_agent_job_id WHERE agent_job_id IS NOT NULL`)
an active DB-layer duplicate-approval backstop for Inngest retries.

## Migration

`apps/web/supabase/migrations/20260602000001_approval_queue_agent_job_id.sql`

- `ADD COLUMN IF NOT EXISTS agent_job_id uuid` (nullable)
- FK → `agent_jobs(id) ON DELETE SET NULL`
- `CREATE UNIQUE INDEX IF NOT EXISTS uq_approval_queue_agent_job_id ON approval_queue (agent_job_id) WHERE agent_job_id IS NOT NULL`
- Rollback: `apps/web/supabase/migrations/rollback/20260602000001_approval_queue_agent_job_id.rollback.sql`
- No plpgsql — pure SQL only

## Column wiring

`apps/web/src/lib/agents/approval-gate-writer/index.ts`

- `agent_job_id` populated from `input.artifactId` (validated as UUID — matches `agent_jobs.id` per `buildGatedPublishIntent` in pipeline/runner.ts)
- Insert changed to `.upsert(row, { onConflict: 'agent_job_id', ignoreDuplicates: true })` — idempotency strategy
- On conflict (null data returned), falls back to `SELECT` by `agent_job_id` to retrieve existing row id
- Non-UUID `artifactId` values → `agent_job_id = null` (non-agent approvals not affected)
- `TODO(approval-queue-unique)` comments mark the `as any` casts pending types regen

## Test results

- `pnpm -F @beamix/web typecheck`: exit 0
- `vitest run src/lib/agents/approval-gate-writer src/inngest/functions/approval-gate-writer.test.ts`: 34 passed (2 test files)

## Post-merge actions required

1. `supabase db push` — Adam runs after merge (per Supabase CLI DB workflow)
2. Regenerate `database.types.ts` — `supabase gen types typescript` after push
3. Remove `as any` casts in `index.ts` after types regen (search `TODO(approval-queue-unique)`)
