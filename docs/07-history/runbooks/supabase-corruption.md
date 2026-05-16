# Runbook — Supabase data corruption / loss

**When:** Destructive migration applied incorrectly, schema mismatch causes data loss, RLS bypass deletes rows, or Supabase platform-level corruption (rare).
**Severity:** **P0.** Supabase holds: customer data, war-room `audit_log` + `audit_log_daily` + `claude_progress`, pgvector RAG corpora, Mem0 OSS Phase 2 data, Auth.
**Owner today:** Adam.
**Last reviewed:** 2026-05-08 (WS3 lock).

---

## Detection

| Signal | Where | Threshold |
|---|---|---|
| Supabase advisor flags critical | `mcp__supabase__get_advisors` returns ERROR-level | Any |
| Application 5xx with schema-mismatch error | Vercel function logs | ≥5 in 5 min |
| Missing `audit_log` rows (audit-log-rollup detects gaps) | Inngest function output | Any |
| Sudden row count drop on a table | Supabase dashboard | >5% drop unexpected |
| `claude_progress` shows no entries despite known-running Routine | Supabase | If a Routine should be writing |
| Backup-time anomaly (PITR retention shorter than expected) | Supabase dashboard | Daily check |
| Migration applied without `mcp__supabase__list_migrations` confirmation | Supabase | Audit trail |

---

## Immediate (first 5 minutes)

1. **Telegram-ping Adam P0:**
   ```
   [P0 supabase-corruption]
   Data anomaly detected on table: <table>. Halting writes. ACK and stand by.
   ```
2. **Halt write traffic.** Two paths:
   - **Vercel:** push a deploy that returns 503 from `/api/*` routes (env var `MAINTENANCE_MODE=true`).
   - **Supabase:** flip the project to read-only mode (Project Settings → Pause Project — caveat: this halts ALL traffic including `/war-room` page reads, prefer Vercel approach if `/war-room` access is needed during incident).
2.5. **Verify MAINTENANCE_MODE deploy is live BEFORE applying the deploy lock in step 5.** Run `curl https://beamixai.com/api/health` (replace with actual product URL); confirm returns 503 with maintenance message. Only proceed to step 5 after this is confirmed. If step 2 deploy is still in progress, wait for it to complete; if step 5 lock is applied during deploy, the deploy is cancelled and product continues serving traffic to corrupted DB.
3. **Snapshot current state.** Run a full `pg_dump` via Supabase dashboard → Backups → Manual Backup. Even if corrupted, this is forensic evidence.
4. **Identify scope.** Which table(s)? Which rows? Run:
   ```sql
   SELECT relname, n_live_tup FROM pg_stat_user_tables ORDER BY relname;
   -- Compare counts to last known-good (audit_log_daily archived counts).
   ```
5. **Lock Vercel deploy.** Disable auto-deploy from `main` branch via Vercel project settings → Git → Production branch → set to `paused-during-incident`. Prevents accidental further writes if a teammate deploys.

---

## Mitigation (next hour)

### Path A — Recent corruption (within PITR window, Supabase Pro)

- Supabase Pro includes Point-In-Time Recovery (PITR), default 7 days.
- **Restore to last known-good timestamp:** Supabase dashboard → Database → Backups → Point in Time → select pre-corruption time.
- **CAVEAT:** PITR restores the ENTIRE database. Any legitimate writes between the restore point and now are lost. **Identify writes to preserve via independent sources** (audit_log itself may be corrupted): (a) Inngest dead-letter queue tail — Inngest stores recent failed events including their payloads, queryable via Inngest dashboard. (b) Cloudflare R2 artifact-upload timestamps for any agent-written artifacts during the lost window. (c) Linear ticket comments timestamped during the window. (d) Git commit history for any code changes. Cross-reference these sources to reconstruct what was lost.
- **For partial restore** (one table only): use `pg_dump --table=<table>` from the snapshot in step 3 above, restore to a temp DB, then `INSERT INTO ... SELECT ...` the missing rows.

### Path B — Older corruption (outside PITR window)

- PITR is gone. Fall back to:
  - Last `audit_log_daily` rollup (preserves daily aggregate but loses per-row detail).
  - `docs/08-agents_work/sessions/*.md` files (preserve agent-decision narrative; can replay decisions).
  - DECISIONS.md (architecture decisions).
  - git commits (codebase truth).
- For customer data: this is "best effort" recovery. Communicate to affected customers (post-MVP).
- **Lesson learned:** in post-incident, extend PITR retention to 30 days (Pro tier addon).

### Path C — RLS bypass / accidental destructive query

- Was a service-role key used outside an Inngest job or Vercel server function? If yes, audit who has it. Rotate immediately.
- Was the destructive query in a migration? Check `mcp__supabase__list_migrations`. Revert the migration, restore data via PITR.
- **Add safeguard:** future migrations require dry-run via `mcp__supabase__create_branch` + `apply_migration` on branch first. Never apply destructive SQL to production directly.

---

## Recovery (full restore)

1. **Verify schema integrity.** `mcp__supabase__list_tables` returns expected schema.
2. **Verify row counts** against last `audit_log_daily` rollup. Acceptable variance: <2%.
3. **Replay missed `audit_log` writes from Inngest dead-letter.** Inngest captures failed events; replay them once writes are unlocked. Verify in `audit_log`:
   ```sql
   SELECT MIN(ts), MAX(ts), COUNT(*) FROM audit_log
   WHERE ts >= ($incident_start - interval '1 hour');
   ```
4. **Re-embed RAG corpora if pgvector tables affected.** Run `embed-decisions`, `embed-sessions`, `embed-brain`, `embed-codebase`, `embed-skills` Inngest jobs.
5. **Re-enable Vercel writes.** Remove `MAINTENANCE_MODE=true`, redeploy.
6. **Lift Vercel deploy lock.**
7. **Telegram-ping Adam** `[supabase-corruption resolved]`.

---

## Post-incident

- [ ] Postmortem REQUIRED. `docs/07-history/postmortems/YYYY-MM-DD-supabase-corruption.md`.
- [ ] If migration caused: add lint rule rejecting `DROP TABLE` and `TRUNCATE` without explicit comment justification.
- [ ] If RLS bypass caused: rotate service-role key (per `secret-rotation.md`), audit all service-role usage paths.
- [ ] Consider extending PITR retention to 30 days (Supabase Pro add-on, ~$25-50/mo).
- [ ] Friday Retro tags this incident.
- [ ] Update this runbook.

---

## Decision tree

```
Supabase data anomaly detected?
├─ Halt write traffic (Vercel MAINTENANCE_MODE=true)
├─ Telegram-ping Adam P0
├─ Snapshot current state via pg_dump
│
├─ Within PITR window (≤7 days)?
│   ├─ YES → Path A: PITR restore.
│   │       Caveat: lose writes between restore point and now.
│   │       Document those before restoring.
│   │
│   └─ NO → Path B: best-effort from rollups + git + sessions.
│           Communicate to affected customers (post-MVP).
│           Extend PITR retention as post-incident action.
│
├─ Cause = destructive migration?
│   └─ Add migration safety harness (branch-first, dry-run).
│
├─ Cause = RLS bypass?
│   └─ Rotate service-role key. Audit all usage paths.
│
└─ Cause = Supabase platform issue?
    └─ Open Supabase support ticket. Document case ID. Wait for vendor.
```

---

## Related runbooks

- `secret-rotation.md` — service-role key rotation if RLS bypass caused
- `cloudflare-compromise.md` — independent; not a typical cascade

## Related signals

- Supabase advisor warnings
- Schema-mismatch errors in Vercel logs
- `audit_log` row count anomalies
- pgvector query failures (RAG retrieval breaks)

## Telemetry to verify is wired

- [ ] `mcp__supabase__get_advisors` runs weekly via Inngest cron, posts findings to Linear `Strategy/Signals` project
- [ ] `audit_log` row count daily snapshot stored in `audit_log_daily` (the rollup IS the canary)
- [ ] Vercel function errors with `42P01` (table doesn't exist) or `42703` (column doesn't exist) trigger Telegram
- [ ] Supabase backups are automated AND PITR is enabled (Project Settings → Database → Backups)
