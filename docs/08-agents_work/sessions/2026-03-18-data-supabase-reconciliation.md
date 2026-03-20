---
date: 2026-03-18
lead: data-lead
task: supabase-reconciliation
status: PARTIAL
---

# Supabase DB Reconciliation — Session Summary

## Task
Write and prepare a reconciliation migration to fix all issues found in the Supabase audit (2026-03-18).

## Migration File
`saas-platform/supabase/migrations/20260318_reconciliation.sql`

## Changes in Migration

### P1 Critical (enum + RPC fixes)
- **credit_transaction_type**: Added `hold`, `confirm`, `release`, `expire`, `system_grant`
- **credit_pool_type**: Added `monthly`, `topup`, `trial`
- **agent_type**: Added 8 missing types (recommendations, citation_builder, etc.)
- **allocate_monthly_credits**: Dropped 2-param overload, kept 4-param version with text plan_id
- **hold_credits / confirm_credits / release_credits**: Recreated with correct function bodies

### P2 Important
- Dropped orphan tables: `scan_engine_responses`, `competitor_scan_results`
- Added RLS to: `email_log`, `scan_queries`, `scan_mentions`, `competitor_content_snapshots`
- Added `plan_id text` column to `subscriptions`
- Cleaned test data: Writesonic/Localhost businesses, null-scan_id free_scans, orphan tracked queries
- Added `content_item_status` enum values: `in_review`, `approved`
- Added `recommendation_status` enum values: `new`, `completed`
- Documented `email_log` table with CREATE IF NOT EXISTS
- Set placeholder Paddle product IDs on plans table

### P3 Nice-to-have
- Added index `idx_free_scans_scan_id`

## Execution Status: NOT YET APPLIED
No Supabase access token or MCP tools were available in this session.

## How to Apply

### Option A: Supabase SQL Editor (recommended)
1. Go to Supabase Dashboard > SQL Editor
2. Paste the entire contents of `20260318_reconciliation.sql`
3. Run it (enum ADD VALUE runs outside transactions automatically in SQL Editor)

### Option B: Supabase CLI
```bash
supabase login
cd saas-platform
supabase link --project-ref zhjxdwcqxhwletkpuwyl
supabase db query --linked -f supabase/migrations/20260318_reconciliation.sql
```

### Post-Apply Verification Queries
```sql
-- 1. Verify enum values
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'credit_transaction_type'::regtype ORDER BY enumsortorder;
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'credit_pool_type'::regtype ORDER BY enumsortorder;
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'agent_type'::regtype ORDER BY enumsortorder;

-- 2. Verify no overload on allocate_monthly_credits
SELECT proname, pronargs, proargtypes::text FROM pg_proc WHERE proname = 'allocate_monthly_credits';

-- 3. Verify RLS on previously unprotected tables
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('email_log', 'scan_queries', 'scan_mentions', 'competitor_content_snapshots');

-- 4. Verify orphan tables dropped
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('scan_engine_responses', 'competitor_scan_results');

-- 5. Verify test data cleaned
SELECT count(*) FROM businesses WHERE name ILIKE '%writesonic%' OR website_url ILIKE '%localhost%';
SELECT count(*) FROM free_scans WHERE scan_id IS NULL;

-- 6. Test credit RPCs (dry run)
SELECT hold_credits('e7d8cdaa-a161-4072-a057-2f487a4d05c2'::uuid, 1, gen_random_uuid());

-- 7. Verify plan_id column and paddle IDs
SELECT id, paddle_product_id FROM plans;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'plan_id';
```

## Data Quality Concerns
- The hold_credits test (verification query 6) will return `insufficient_credits` unless a credit pool exists for the user -- this is expected and confirms the function runs without enum errors
- The user's trial ends 2026-03-24 -- Paddle integration must be configured before then
