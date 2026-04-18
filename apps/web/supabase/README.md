# Supabase Migrations — Beamix Rethink (2026-04-18)

## Overview

Two-phase migration for the April 2026 product rethink. Covers 13 new tables, 10 ALTERs on existing tables, 7 RPCs, and RLS on all new tables.

**Board decisions source:** `docs/product-rethink-2026-04-09/05-BOARD-DECISIONS-2026-04-15.md`

---

## Migration Order (REQUIRED — do not swap)

| Order | File | What |
|-------|------|------|
| 1st | `20260418_01_rethink_enums.sql` | `ALTER TYPE ... ADD VALUE` only. Cannot run in a transaction with DDL. |
| 2nd | `20260418_02_rethink_schema.sql` | New tables, ALTERs, RPCs, RLS, plan seed data. |

Phase 1 **must commit** before Phase 2 runs. The `apply-staging.sh` script enforces a 2-second pause between them.

---

## How to Apply

### Staging (recommended first)

```bash
export SUPABASE_DB_URL=postgres://postgres:password@db.xxxx.supabase.co:5432/postgres
chmod +x apps/web/supabase/apply-staging.sh
./apps/web/supabase/apply-staging.sh --confirm
```

The script requires `--confirm` and will refuse to run without it.

### Production

Apply the same two files via the Supabase Dashboard SQL Editor:
1. Open `20260418_01_rethink_enums.sql` → paste → Run
2. Wait ~5s for commit
3. Open `20260418_02_rethink_schema.sql` → paste → Run

Do NOT use the `apply-staging.sh` script against production — use the Dashboard for audit trail.

---

## Regenerate TypeScript Types

After applying migrations, regenerate `database.types.ts`:

```bash
supabase gen types typescript \
  --project-id $SUPABASE_PROJECT_ID \
  > apps/web/src/lib/supabase/database.types.ts
```

Commit the regenerated file as `chore(db): regen types after rethink migration`.

---

## RLS Testing

Requires pgTAP extension enabled on the database:

```sql
CREATE EXTENSION IF NOT EXISTS pgtap;
```

Run the tests:

```bash
psql $SUPABASE_DB_URL -f apps/web/supabase/tests/rls.sql
```

Expected output: `1..48` — all 48 tests pass. Any `not ok` line indicates an RLS gap.

Tests verify that User B cannot SELECT, INSERT, UPDATE, or DELETE rows belonging to User A across all 13 new tables.

---

## Rollback Plan

All migration 02 operations are additive (no drops). Rollback commands are at the bottom of `20260418_02_rethink_schema.sql` under `-- ROLLBACK COMMANDS`.

**Note:** PostgreSQL does not support removing enum values. The new `discover`, `build`, `scale`, and new `agent_type` values added in migration 01 cannot be rolled back without recreating the enum type.

For a full rollback: restore from a pre-migration Supabase backup (PITR).
