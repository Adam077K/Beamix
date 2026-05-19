#!/usr/bin/env bash
# apply-staging.sh — Apply the 2026-04-18 rethink migrations to a staging DB.
# Usage: SUPABASE_DB_URL=postgres://... ./apply-staging.sh --confirm
#
# SAFETY: This script requires --confirm to prevent accidental runs.
# DO NOT run against production without first testing on staging.

set -euo pipefail

MIGRATIONS_DIR="$(dirname "$0")/migrations"
MIGRATION_01="${MIGRATIONS_DIR}/20260418_01_rethink_enums.sql"
MIGRATION_02="${MIGRATIONS_DIR}/20260418_02_rethink_schema.sql"

# ─── Require --confirm flag ───────────────────────────────────
CONFIRMED=false
for arg in "$@"; do
  if [[ "$arg" == "--confirm" ]]; then
    CONFIRMED=true
  fi
done

if [[ "$CONFIRMED" != "true" ]]; then
  echo ""
  echo "ERROR: You must pass --confirm to apply migrations."
  echo ""
  echo "  Usage: SUPABASE_DB_URL=postgres://... ./apply-staging.sh --confirm"
  echo ""
  echo "  This script applies:"
  echo "    1. 20260418_01_rethink_enums.sql   (enum additions — no transaction)"
  echo "    2. 20260418_02_rethink_schema.sql  (new tables, ALTERs, RPCs)"
  echo ""
  echo "  Review both files before running. Rollback commands are in PART F of migration 02."
  echo ""
  exit 1
fi

# ─── Require SUPABASE_DB_URL ──────────────────────────────────
if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
  echo ""
  echo "ERROR: SUPABASE_DB_URL environment variable is not set."
  echo ""
  echo "  Export it before running:"
  echo "    export SUPABASE_DB_URL=postgres://postgres:password@db.xxxx.supabase.co:5432/postgres"
  echo ""
  exit 1
fi

# ─── Verify psql is available ────────────────────────────────
if ! command -v psql &>/dev/null; then
  echo "ERROR: psql not found. Install postgresql-client before running this script."
  exit 1
fi

# ─── Verify migration files exist ────────────────────────────
if [[ ! -f "$MIGRATION_01" ]]; then
  echo "ERROR: Migration file not found: $MIGRATION_01"
  exit 1
fi

if [[ ! -f "$MIGRATION_02" ]]; then
  echo "ERROR: Migration file not found: $MIGRATION_02"
  exit 1
fi

echo ""
echo "Applying Beamix rethink migrations to staging..."
echo "DB: ${SUPABASE_DB_URL%@*}@[REDACTED]"
echo ""

# ─── Phase 1: Enum additions (no transaction wrapper) ────────
echo "Applying Migration 01: rethink enums..."
echo "  → Adding new agent_type values (11 MVP-1 + 1 MVP-2)"
echo "  → Adding new plan_tier values (discover, build, scale)"

if psql "$SUPABASE_DB_URL" -f "$MIGRATION_01" --no-psqlrc -v ON_ERROR_STOP=1 2>&1; then
  echo "  ✓ Migration 01 applied"
else
  echo ""
  echo "ERROR: Migration 01 failed. Check the output above."
  echo "  File: $MIGRATION_01"
  echo "  Common cause: enum values already exist (safe to ignore IF NOT EXISTS is used)"
  exit 2
fi

# ─── Wait for enum values to commit ─────────────────────────
echo ""
echo "Waiting 2s for enum values to commit before running Phase 2..."
sleep 2

# ─── Phase 2: Schema changes ────────────────────────────────
echo ""
echo "Applying Migration 02: rethink schema (new tables, ALTERs, RPCs, RLS)..."

if psql "$SUPABASE_DB_URL" -f "$MIGRATION_02" --no-psqlrc -v ON_ERROR_STOP=1 2>&1; then
  echo "  ✓ Migration 02 applied"
else
  echo ""
  echo "ERROR: Migration 02 failed. Check the output above."
  echo "  File: $MIGRATION_02"
  echo ""
  echo "  Troubleshooting:"
  echo "    1. Check if referenced tables exist (businesses, scans, agent_jobs, content_items, etc.)"
  echo "    2. Check if update_updated_at_column() trigger function exists"
  echo "    3. Verify Supabase project has required extensions (uuid-ossp, pgcrypto)"
  echo ""
  echo "  To rollback new tables, run the ROLLBACK COMMANDS section at the bottom of migration 02."
  exit 3
fi

echo ""
echo "All migrations applied successfully."
echo ""
echo "Next steps:"
echo "  1. Regenerate TypeScript types:"
echo "     supabase gen types typescript --project-id \$SUPABASE_PROJECT_ID \\"
echo "       > apps/web/src/lib/supabase/database.types.ts"
echo "  2. Run RLS tests:"
echo "     psql \$SUPABASE_DB_URL -f apps/web/supabase/tests/rls.sql"
echo "  3. Verify plan seed data:"
echo "     psql \$SUPABASE_DB_URL -c \"SELECT id, name, tier, is_active FROM public.plans ORDER BY created_at;\""
echo ""
