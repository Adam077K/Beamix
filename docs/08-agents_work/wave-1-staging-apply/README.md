# Wave 1 — Staging Apply

PostgreSQL forbids `ALTER TYPE ADD VALUE` and a use of that value in the same transaction. The Wave 1 migration 02 originally had both, which fails when pasted as one block in the Supabase SQL Editor (the entire paste runs as one transaction).

**The fix landed in PR #95** — migration 02 now has only `ALTER TYPE` statements; the seed inserts moved to migration 05.

## Two ways to apply Wave 1 migrations to staging

### Option A — 2-stage paste (works today, no CLI required)

1. Paste `STAGE-1-enum-additions.sql` into Supabase Dashboard → SQL Editor → Run. Wait for "Success".
2. Paste `STAGE-2-everything-else.sql` into a fresh SQL Editor query → Run.

### Option B — apply each migration file individually

Paste these in order, each in its own Run:
1. `apps/web/supabase/migrations/20260525000001_agency_tables.sql`
2. `apps/web/supabase/migrations/20260525000002_plan_tier_rename.sql` (enum ADD VALUE only after PR #95)
3. `apps/web/supabase/migrations/20260525000003_held_revenue_accounting.sql`
4. `apps/web/supabase/migrations/20260525000004_rls_policies_agency.sql`
5. `apps/web/supabase/migrations/20260525000005_plan_tier_seed_and_deprecate.sql`

### Option C — supabase CLI (post-credentials)

Once `SUPABASE_ACCESS_TOKEN` + `SUPABASE_PROJECT_REF` are real (not placeholders) in `.envrc`:

```bash
cd apps/web
supabase link --project-ref <ref>
supabase db push
```

## Rollback

Rollback scripts live in `apps/web/supabase/migrations/rollback/`. Enum value REMOVAL is not safely reversible without DROP TYPE + RECREATE — see CTO before executing in production.

## History

- 2026-05-25 — Wave 1 migrations authored
- 2026-05-27 — staging apply hit `55P04` error; STAGE-1 + STAGE-2 workaround built; PR #95 split migration 02 properly
