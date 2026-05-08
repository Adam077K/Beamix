# Adversarial Review — WS4 Supabase Migration
**File:** `apps/web/supabase/migrations/20260508_war_room_observability.sql`
**Spec reference:** `ORCHESTRATION.md §2G + errata 1`
**Reviewer scope:** Schema correctness, enum completeness, RLS, indexes, FK behavior, nonce constraints, idempotency, plpgsql compliance, Inngest function compatibility
**Date:** 2026-05-08
**Verdict framing:** "I'm running this on Adam's prod DB. What goes wrong?"

---

## F1 — `telegram_send_failed` enum value is missing (runbook contract broken)

**Severity: HIGH**

`telegram-failure.md` (lines 201, 208) explicitly states: `audit_log` MUST accept `status: telegram_send_failed`. That runbook calls this out as a "WS4 migration per R1 extension." The migration's `CHECK` constraint contains only the 14 values from errata 1:

```
fired | accepted | complete | blocked | timeout | over_budget | anomaly |
rule_violation | anthropic_error | linear_api_error | mem0_error |
rate_limited | lock_lost | webhook_storm
```

`telegram_send_failed` is NOT in errata 1's list of 14 — but the runbook mandates it, tags it as a WS4 migration deliverable, and the Cloudflare bridge is expected to write it. When the bridge tries to insert `status: 'telegram_send_failed'`, Postgres will reject it with a CHECK violation, silently dropping the diagnostic signal the runbook depends on.

The migration implements exactly errata 1's 14 values. Errata 1 and the telegram-failure runbook are out of sync. The migration chose errata 1 as authoritative; the runbook says otherwise. Either errata 1 is incomplete or the telegram runbook is wrong — but as-written, the migration will cause silent insert failures from the bridge on Telegram outage events.

---

## F2 — No `audit_log_aggregate_for_date` RPC created

**Severity: HIGH**

`audit-log-rollup.ts` (line 27) calls:
```typescript
supabase.rpc('audit_log_aggregate_for_date', { p_date: yesterday })
```

The migration creates no such function. The fallback in the Inngest function (inline aggregate query) will run instead — but only because the code defensively catches the RPC error. This means:

1. The "preferred" path (RPC) will always error on first run post-migration
2. Every nightly rollup generates a caught error log that looks like a bug
3. If someone removes the inline fallback in a future refactor, the rollup silently fails

The spec (ORCHESTRATION.md §2G) doesn't list this RPC as a required migration deliverable, but the Inngest function treats it as the primary path. Either the migration is incomplete or the Inngest function is wrong.

---

## F3 — `parent_audit_log_id` FK has no `ON DELETE` clause — silent NULL behavior

**Severity: MEDIUM**

```sql
parent_audit_log_id uuid REFERENCES public.audit_log (id)
```

No `ON DELETE` specified. PostgreSQL defaults to `RESTRICT`. This means: if you try to delete a parent `audit_log` row (e.g., during the 90-day hot-retention drop in `audit-log-rollup.ts`), the delete will **fail with a foreign key violation** if any child row still has that `parent_audit_log_id`.

The rollup's retention delete (step `drop-old-details`) deletes all rows older than 90 days via:
```typescript
.delete().lt('ts', cutoff.toISOString())
```

This will fail silently (Inngest step throws) whenever an old parent row has children that are younger than 90 days — a valid scenario when a parent Routine fires near the 90-day boundary and its children (workers, re-fires) are logged just after. The step retries, fails, eventually moves to Inngest dead-letter. The retention job breaks permanently for that date window until manually cleared.

Neither `ON DELETE CASCADE` nor `ON DELETE SET NULL` was chosen. The spec does not specify cascade behavior; the migration leaves this as an implicit RESTRICT, which will cause real operational failures at month 3.

---

## F4 — `nonce` column: UNIQUE constraint, not a partial index — allows one null per table

**Severity: MEDIUM**

The migration creates:
```sql
nonce uuid UNIQUE
```

PostgreSQL's UNIQUE constraint treats `NULL` as distinct from every other value, including other `NULL`s. So multiple rows with `nonce IS NULL` are allowed — the constraint does not reject them. The spec (R3.4) says nonce is REQUIRED for replay prevention, but the column is nullable (`nonce uuid UNIQUE`, no `NOT NULL`). Rows written without a nonce (e.g., internal observability writes from `fan-in-watcher.ts` and `runaway-watcher.ts` — which insert rows with no nonce field) accumulate silently without constraint violation.

This means: the replay-prevention contract (R3.4) is unenforced at the DB layer for any writer that omits the nonce. A replayed spec with a nonce can be blocked; a replayed spec written without a nonce is not blocked. The nonce column should be `NOT NULL` for trust-mode rows, or the constraint is security theater for the rows that matter most.

---

## F5 — `claude_progress.status` enum is smaller than spec implies; `killed` value undocumented

**Severity: MEDIUM**

The spec in ORCHESTRATION.md §2E defines `claude_progress.status` as:
```
running | done | error
```
(3 values, from the inline SQL schema block)

The migration adds a fourth value:
```sql
status text NOT NULL CHECK (status IN ('running', 'done', 'error', 'killed'))
```

`killed` is not in the §2E spec. It was presumably added for the runaway-watcher kill path. However:

1. No Inngest function in the codebase currently writes `status: 'killed'` to `claude_progress` (runaway-watcher writes `status: 'over_budget'` to `audit_log`, not to `claude_progress`)
2. The `killed` value is undocumented in ORCHESTRATION.md §2E — the spec is silent on it
3. Adding it isn't wrong, but it's a phantom value with no writer in the current codebase, and a future developer reading the spec will not know it exists

Minor but surfaced here because the spec was used as the compliance baseline.

---

## F6 — Missing `agent` index on `audit_log` — agent-filtered queries scan the full table

**Severity: MEDIUM**

The migration creates five indexes on `audit_log`:

```sql
idx_audit_log_linear_ticket  ON (linear_ticket)
idx_audit_log_fan_in_key     ON (fan_in_key)
idx_audit_log_ts             ON (ts DESC)
idx_audit_log_parent         ON (parent_audit_log_id)
idx_audit_log_status_ts      ON (status, ts DESC)
```

No index on `agent`. The `/war-room` page wireframe (§2G) renders per-agent breakdowns and cost totals. `cost-watchdog.ts` does a full `audit_log` read filtered to today (`gte('ts', todayStart)`) and groups by agent in application code — that's a sequential scan over every row since midnight. `audit-log-rollup.ts`'s inline fallback also reads by date and groups by agent in code.

For today's data the table will be small. But the query pattern for historical analysis (e.g., "last 30 days for agent cto") requires either a composite `(agent, ts DESC)` index or an `(agent)` index. The existing `(status, ts DESC)` helps for incident queries but not for per-agent trace views. As the hot retention window fills (90 days × 12+ agents × multiple fires/day = potentially millions of rows), agent-scoped queries will degrade.

---

## F7 — Not idempotent: no `IF NOT EXISTS` — will blow up on re-run

**Severity: MEDIUM**

Every `CREATE TABLE` statement is bare — no `IF NOT EXISTS`. Every `CREATE INDEX` is bare. Every `CREATE POLICY` is bare.

If this migration is re-applied (e.g., Adam tries to apply it twice via `mcp__supabase__apply_migration`, or it's run in a branch that already had it applied), every statement will fail:

```
ERROR:  relation "audit_log" already exists
```

The reference migration `20260420_wave3_foundation.sql` also lacks `IF NOT EXISTS`, so this is consistent with project style — but for a migration this large (3 tables + 7 indexes + 6 policies), a partial re-run failure is harder to diagnose. The Supabase `apply_migration` MCP tool tracks applied migrations by filename so this is only a risk for manual re-runs or branch resets, but it will surface in WS4 smoke testing if migrations are re-applied to reset a test environment.

---

## F8 — `audit_log_daily` RLS policy denies `audit-log-rollup` UPSERT writes

**Severity: MEDIUM**

`audit_log_daily` has `deny-all` RLS with no service-role bypass documented. The `audit-log-rollup.ts` and `cost-watchdog.ts` Inngest functions write to this table via `createServiceRoleClient()` / `createServiceClient()`. Service role bypasses RLS — so the writes will succeed **only if** the Supabase clients in those functions are actually initialized with the service role key.

The functions use two different client constructors:
- `audit-log-rollup.ts` uses `createServiceRoleClient()` — matches the bypass assumption
- `cost-watchdog.ts` uses `createServiceClient()` — ambiguous name; if this resolves to an anon-key client, all upserts to `audit_log_daily` will silently fail with `{}` (Supabase postgrest returns empty error on RLS rejection, not a thrown error, unless `.throwOnError()` is chained)

The migration itself is correct (deny-all is the right policy). The finding is that the migration comment says "Service role bypasses RLS for agent writes" but it only documents this for `audit_log`, not for `audit_log_daily` or `claude_progress`. There is no policy comment or `GRANT` statement on those two tables documenting the expected access model.

---

## F9 — `runtime_s integer` should be `numeric` or `integer` — low precision for long-running Routines

**Severity: LOW**

`runtime_s integer` stores runtime in whole seconds. The spec shows Routine runtimes up to 35 minutes (`BMX-100` example in §2G wireframe). Integer seconds is adequate for this range. However, the spec's `/war-room` page wireframe shows display in minutes + seconds (e.g., `35m`, `18m`, `4m`). Sub-second resolution isn't needed.

The real issue: there is no CHECK constraint bounding `runtime_s` above zero, and `integer` allows negative values. A mis-computed runtime (e.g., a clock skew where `completed_at < started_at`) would write a negative integer silently. Not a hard bug but worth flagging.

---

## F10 — `spec jsonb NOT NULL` on `audit_log` — internal observability writers violate this immediately

**Severity: LOW**

`spec jsonb NOT NULL` is the correct constraint for trust-mode Routine rows. But internal writers in the Inngest functions (`fan-in-watcher.ts`, `runaway-watcher.ts`) write synthetic `spec` blobs (e.g., `spec: { event: 'fan_in_complete', fan_in_key: ... }`). These satisfy `NOT NULL`, so no immediate violation.

The issue is that the `spec` column is meant to hold the trust-mode payload schema (§2D). Internal rows carry a fake spec blob that looks structurally similar but doesn't conform to the §2D schema (no `nonce`, `expires_at`, `issued_by`, `budget`, etc.). Any query or tool that parses `spec.budget.max_cost_usd` on an internal-writer row will receive `undefined`/null silently. The `runaway-watcher` itself handles this — it checks for `budget` presence. But future code that assumes all `audit_log.spec` rows conform to §2D will silently produce wrong results for internal rows.

No separate column or discriminator distinguishes internal observability rows from agent-dispatched rows. A `row_kind text CHECK (row_kind IN ('routine_dispatch', 'internal_event'))` column was not added.

---

## F11 — `audit_log_daily.failures integer` is nullable — rollup function may write `null`

**Severity: LOW**

```sql
failures integer,
```

No `NOT NULL` and no `DEFAULT 0`. The `audit-log-rollup.ts` inline fallback correctly computes `failures` from a reduce and always produces an integer. But if the RPC path (`audit_log_aggregate_for_date`) is ever implemented and returns rows without a `failures` field, the upsert will write `null` for that column. The `cost-watchdog.ts` upsert also computes `failures` correctly, but a future RPC that forgets the field would silently insert null.

Minor — a `DEFAULT 0` and `NOT NULL` would make this column self-documenting and safe from future RPC omissions.

---

## Summary table

| # | Finding | Severity | Impact |
|---|---------|----------|--------|
| F1 | `telegram_send_failed` missing from CHECK constraint | HIGH | Bridge INSERT fails on Telegram outage; runbook detection signal lost |
| F2 | `audit_log_aggregate_for_date` RPC not created | HIGH | Rollup always errors on primary path; inline fallback runs instead |
| F3 | `parent_audit_log_id` FK defaults to RESTRICT | MEDIUM | 90-day retention DELETE fails when old parent has recent children |
| F4 | `nonce` nullable despite R3.4 replay-prevention contract | MEDIUM | Rows without nonce bypass replay protection at DB layer |
| F5 | `killed` in `claude_progress.status` is phantom value, absent from spec | MEDIUM | Schema/spec divergence; no writer in codebase |
| F6 | No `agent` index on `audit_log` | MEDIUM | Per-agent war-room queries and rollup fallback degrade at scale |
| F7 | No `IF NOT EXISTS` — not idempotent | MEDIUM | Re-run blows up; smoke test environment resets break |
| F8 | `audit_log_daily` / `claude_progress` service-role bypass undocumented | MEDIUM | Ambiguous client name (`createServiceClient`) may use anon key; silent RLS failures |
| F9 | `runtime_s integer` allows negative values | LOW | Clock skew produces negative runtime with no constraint rejection |
| F10 | No discriminator column for internal vs dispatch rows in `audit_log` | LOW | Future `spec` parsers assume §2D schema; internal rows will produce silent nulls |
| F11 | `audit_log_daily.failures` nullable — should be `NOT NULL DEFAULT 0` | LOW | RPC path omitting the field would write null silently |
