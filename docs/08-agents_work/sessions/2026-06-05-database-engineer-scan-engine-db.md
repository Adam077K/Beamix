---
role: database-engineer
task: free_scans table migration + types augmentation
date: 2026-06-05
branch: feat/scan-engine-db
worktree: .worktrees/scan-engine-db
tier: irreversible
qa_verdict: PENDING
linear_ticket: BMX-SCAN-ENGINE-W1
---

## Summary

Created the `free_scans` table migration and TypeScript types augmentation.
The table stores anonymous free-scan requests submitted via `/api/scan/free` and read by `/scan/[scan_id]/page.tsx`.

## Files changed

- `apps/web/supabase/migrations/20260605120000_free_scans.sql` — forward migration
- `apps/web/supabase/migrations/rollback/20260605120000_free_scans.rollback.sql` — rollback
- `apps/web/src/lib/db/database.types.ts` — hand-written `free_scans` type entry (CLI regen pending; see decisions)

## Key decisions

1. **Pattern C (service-role only)** — free scans are anonymous, no auth.uid() to match against. Matches `paddle_webhook_events` / `page_locks` pattern.
2. **status as TEXT + CHECK** — mirrors existing `scans` table; no PG ENUM type to avoid costly ALTER TYPE in future.
3. **Types hand-written** — supabase CLI token-substitution fails from .envrc in worker env; hand-written augmentation is correct and consistent with existing file style. Adam applies `supabase gen types` post-merge.
4. **No IF NOT EXISTS guard** — per brief: remote check confirmed table absent; IF NOT EXISTS would hide drift.
