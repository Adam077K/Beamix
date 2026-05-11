# CRITIQUE — WS4 Inngest Functions + Zod Schemas

**Date:** 2026-05-08
**Reviewer:** adversarial-critic (QA gate pass)
**Scope:** 11 Inngest functions + embed-corpus.ts + spec.ts + board.ts + events.ts
**Reference spec:** ORCHESTRATION.md §2C, §2D, §2F, Errata 1–4
**Format:** Finding ID | Severity | File | Description

---

## Findings

---

### F1 — Fan-in sibling check queries the wrong table (CRITICAL)

**File:** `fan-in-watcher.ts`, step `check-siblings`
**Severity:** CRITICAL — fan-in barrier never fires correctly

The sibling-completion check queries `audit_log` with `.in('status', ['fired', 'accepted'])` and counts pending rows. The logic is inverted: it counts rows that are NOT yet complete. But `audit_log` is written by the bridge and the Routine at dispatch time; it does NOT mirror per-sub-ticket Linear ticket completion status. Sub-tickets completing in Linear do not automatically update their corresponding `audit_log` rows from `fired`/`accepted` to `complete` — only the Routine itself or an Inngest watcher writes that transition.

In practice, when the second sub-ticket closes in Linear and fires `fan-in-watcher`, the first sub-ticket's `audit_log` row may still have status `accepted` (the Routine wrote `accepted` at session start, and the Routine writes `complete` at finish — but that write is not guaranteed to have happened by the time the second ticket's `issue.updated` event arrives). The result: `pendingCount` will almost always be > 0 even when all sibling Routines have genuinely completed, and the CEO synth will never fire.

ORCHESTRATION.md §2B specifies that fan-in checks session_id binding in the DONE comment. The correct data source for sibling completion is the Linear ticket status (via the Cloudflare bridge or a dedicated sibling-query endpoint), not `audit_log` status rows.

---

### F2 — `inngest.send` inside `step.run` causes double-fire on Inngest retry (HIGH)

**Files:** `fan-in-watcher.ts` (step `emit-synth-event`), `routine-timeout-watcher.ts` (step `fire-auto-unblock`), `parent-ticket-expiry-watcher.ts` (step `fire-auto-unblock`)
**Severity:** HIGH — idempotency violation

`inngest.send(...)` is called inside a `step.run()` wrapper. Inngest guarantees that the result of a completed `step.run` is memoized: on retry the step body is NOT re-executed. However, if `inngest.send` succeeds (the event is enqueued) but the outer Inngest function crashes before writing the step result to its checkpoint, the step will re-execute on retry and the event will be sent again, firing a duplicate Routine.

Per ORCHESTRATION.md §2B R2.2, fire calls must be fire-and-forget but must NOT produce duplicate fires. The correct pattern is to use `step.sendEvent()` (Inngest's native idempotent send primitive) instead of `inngest.send()` inside a step, or to use the Cloudflare bridge as the single `/fire` path rather than Inngest directly. Using `inngest.send` inside `step.run` bypasses the checkpoint-backed dedup that `step.sendEvent` provides.

---

### F3 — `routine-timeout-watcher` creates a new `supabase` client inside each `step.run` but initializes with no shared state (MEDIUM)

**File:** `routine-timeout-watcher.ts`
**Severity:** MEDIUM — correctness + resource waste

`createServiceClient()` is called twice across two separate `step.run` closures. On Inngest retry, each step runs in a fresh V8 context. This is expected but means the first step's `supabase` instance is discarded and re-created in the second step. More critically: `audit-log-rollup.ts` uses `createServiceRoleClient()` (line 2) at the function body level — outside any `step.run`. This client is created once and then referenced across all steps. If Inngest retries a step in a new execution context, the outer `supabase` reference may be uninitialized. Inconsistency between functions creates a latent crash path in `audit-log-rollup.ts`.

---

### F4 — `audit-log-rollup` time-range boundary uses invalid timestamp `T24:00:00Z` (HIGH)

**File:** `audit-log-rollup.ts`, step `aggregate-yesterday`, fallback inline query
**Severity:** HIGH — data correctness / silent data loss

The fallback inline query uses `.lt('ts', '${yesterday}T24:00:00Z')` as the upper bound. ISO 8601 does not define `T24:00:00` as a valid time component in all parsers; PostgreSQL normalizes it to the start of the *next* day, but this behavior is implementation-dependent and should not be relied upon. The correct upper bound is `${dayAfterYesterday}T00:00:00Z`. A subtler consequence: if PostgreSQL rejects the literal, the query returns an error that the code catches and silently treats as "use the RPC" — but the RPC path runs first (line 27), so the fallback block is only reached when the RPC fails. On double-failure, no rows are aggregated and the function returns `aggregates_written: 0` with no error thrown. The 90-day detail rows are still deleted in the next step, permanently losing yesterday's data.

---

### F5 — `audit-log-rollup` deletes 90-day-old detail rows even when aggregation produced zero rows (HIGH)

**File:** `audit-log-rollup.ts`, step `drop-old-details`
**Severity:** HIGH — permanent data loss on aggregation failure

Steps 1 and 2 (aggregate + upsert) run independently of step 3 (delete). If step 2 throws (upsert error), Inngest will retry. But if step 2 completes with `aggregates_written: 0` (silent failure path from F4 above), step 3 still executes and deletes rows older than 90 days. The `audit_log_daily` archive will have gaps. There is no guard that prevents deletion when aggregation produced no rows.

---

### F6 — `embed-corpus.ts`: delete-then-insert is not atomic; partial failure leaves orphan chunks (HIGH)

**File:** `embed-corpus.ts`, `embedAndUpsert` function
**Severity:** HIGH — data integrity / RAG retrieval corruption

The re-embed flow is: (1) delete all prior chunks for `path`, then (2) insert new chunks. If the OpenAI `embedBatch` call succeeds but the Supabase `insert` throws (network error, RLS issue, constraint violation), the delete from step 1 has already executed. The RAG corpus now has zero chunks for that path. There is no transaction wrapping the delete + insert. On Inngest retry, the embed step re-runs from inside the `step.run` wrapper (correct), but only because the calling embed functions each wrap one file per step. `embed-codebase.ts` batches 10 files into a single `step.run`; if any file's `embedAndUpsert` fails mid-batch (after some prior files already deleted + inserted), the step throws and retries the entire batch — re-embedding files that succeeded, but also re-attempting the failed file. The delete on a file that was already cleanly embedded will delete its new chunks before re-inserting. This is functionally correct for the retry but means 9 files' worth of work is duplicated on each retry.

---

### F7 — `embed-corpus.ts`: `embedBatch` sends all chunks in a single OpenAI request with no rate-limit handling (HIGH)

**File:** `embed-corpus.ts`, `embedBatch` function
**Severity:** HIGH — no OpenAI rate-limit resilience

The entire `chunks` array is sent as a single request to OpenAI `text-embedding-3-large`. OpenAI imposes per-minute token limits (TPM) and per-minute request limits (RPM). A large file (e.g., a full session document or codebase file) chunked into dozens of 8000-character segments may hit the 300K TPM free-tier limit. The `embedBatch` function throws on `!resp.ok`, which surfaces as a step error and triggers Inngest retry — but Inngest's default exponential backoff is not tuned to OpenAI rate-limit windows. There is no `Retry-After` header parsing, no sub-batching, and no per-chunk fallback. On `embed-codebase.ts` which batches 10 files per step, a rate-limit error on file 7 of 10 retries the entire 10-file batch.

---

### F8 — `embed-codebase.ts` filter does not exclude `.d.ts`, generated type files, or snapshot files (MEDIUM)

**File:** `embed-codebase.ts`
**Severity:** MEDIUM — RAG corpus pollution + unnecessary embedding cost

The file filter excludes `.test.ts` and `.test.tsx` but does not exclude:
- `*.d.ts` (TypeScript declaration files — contain no implementation logic)
- `*.snap` or `__snapshots__/**` (Jest/Vitest snapshot files)
- Generated files (e.g., `database.types.ts` from Supabase type generation, `*.generated.ts`)
- `node_modules/**` paths that might appear in `changed_paths` payloads from some GitHub webhook configurations

Embedding TypeScript declaration files adds noise to the RAG corpus: they contain only type signatures with no semantic implementation content. `database.types.ts` in particular is a 500+ line generated file that would produce many chunks with no value.

---

### F9 — `events.ts` field name mismatch: `changed_files` vs `changed_paths` used in embed functions (HIGH)

**File:** `events.ts` (`GitPushEvent`) vs `embed-decisions.ts`, `embed-sessions.ts`, `embed-brain.ts`, `embed-skills.ts`
**Severity:** HIGH — silent skip on every real push; embed functions never run

`events.ts` defines `GitPushEvent.data.changed_files` (line 195). All four embed functions read `event.data.changed_paths` (e.g., `embed-decisions.ts` line 15: `const paths: string[] = event.data.changed_paths ?? []`). The property name is inconsistent. Because all embed functions default to `?? []` on undefined, they will silently treat every real push as having no changed files and return `{ skipped: true }`. The embed functions will never actually run in production.

Note: `embed-codebase.ts` uses `event.data.changed_paths` for the same reason — but it listens to `github/pr.merged` (a different event), which does not have a typed definition in `events.ts` at all, so that function has no compile-time type safety on its event payload.

---

### F10 — `runaway-watcher` cost guard triggers on single-row cost, not accrued session cost, creating false-positive kills (MEDIUM)

**File:** `runaway-watcher.ts`
**Severity:** MEDIUM — incorrect kill semantics

The trigger condition is `cost_usd > 1.0` for a **single audit_log row** (line 42). This means: any one Routine execution that costs more than $1 triggers the watcher. The spec budget for the Synthesizer Routine is $1.00 per run (§2E). A legitimate Friday Retro Routine has a cap of $1.50. These will trigger `runaway-watcher` on every single normal run.

The runaway watcher is supposed to kill sessions that exceed their *session budget* (`max_cost_usd × 1.2`), not sessions where a single row costs more than a hardcoded $1 threshold. The correct trigger is either: (a) no single-row filter — always check accrued cost against spec budget; or (b) the threshold should be set to the maximum single-run cap across all Routines (e.g., $2.00), not $1.00. Under the current implementation, Friday Retro and the Synthesizer will be killed by runaway-watcher on legitimate runs.

---

### F11 — `board.ts`: `source_persona_round` is typed as `z.string()` with no regex enforcement; validator is decoupled from Zod schema (MEDIUM)

**File:** `board.ts`, `LockedDecision` schema + `validateSynthesizerTraceability`
**Severity:** MEDIUM — partial R6.3 anti-hallucination enforcement

The `source_persona_round` field is typed as `z.string()` (line 80). The validator function `validateSynthesizerTraceability` correctly checks the string against the set of valid inputs, but this check is a runtime helper function — it is NOT enforced by the Zod schema itself. Any code path that parses a `SynthesizerOutput` via Zod without also calling `validateSynthesizerTraceability` will accept arbitrary strings (e.g., `"all-personas"`, `"consensus"`, invented persona names) in `source_persona_round`.

Additionally, `validateSynthesizerTraceability` is not exported alongside a type guard; callers must know to call it explicitly. The schema should encode the constraint via `z.string().regex(/^(visionary|strategist|architect|risk-modeler|customer-voice|aria|broad-adversary)-r[12]$/)` to enforce the format at parse time regardless of which code path uses the schema.

---

### F12 — `spec.ts` `validateChildScope` does not validate that child spec's `budget.max_cost_usd` is drawn from a *remaining* budget, not the total parent budget (MEDIUM)

**File:** `spec.ts`, `validateChildScope`
**Severity:** MEDIUM — budget overconsumption in fan-out scenarios

The function signature passes `remaining_parent_budget_usd` as a caller-supplied number. The function correctly compares `childSpec.budget.max_cost_usd > remaining_parent_budget_usd`. However, the function does not validate that `remaining_parent_budget_usd` is computed correctly — it trusts the caller to subtract already-accrued cost from the parent's total budget. There is no guard against `remaining_parent_budget_usd < 0` (which could happen if accrued cost already exceeds the parent budget before the child spec is validated). A negative remaining budget would make `childSpec.budget.max_cost_usd > remaining_parent_budget_usd` true for any positive child budget, correctly rejecting — but it would pass a budget of $0.00 as valid since `0 > -X` is true. This is a correctness edge case but not a complete failure; the real issue is that this function has no connection to the Supabase query that computes accrued cost — callers may compute it incorrectly.

---

### F13 — `routine-timeout-watcher` fires a new `war-room/routine.fired` for Auto-Unblock, which recursively triggers another `routine-timeout-watcher` instance (MEDIUM)

**File:** `routine-timeout-watcher.ts`, step `fire-auto-unblock`
**Severity:** MEDIUM — recursive watcher cascade

`routine-timeout-watcher` listens on `war-room/routine.fired`. When a Routine times out, it fires a new `war-room/routine.fired` event for the `auto-unblock` Routine with `max_runtime_minutes: 15`. This event will trigger a new instance of `routine-timeout-watcher`, which will sleep for 15 minutes and then check if Auto-Unblock completed. If Auto-Unblock itself times out, the watcher fires another `auto-unblock`, which fires another watcher — potentially cascading indefinitely if Auto-Unblock repeatedly fails.

There is no cascade depth counter, no guard against re-triggering Auto-Unblock more than N times, and no escalation path when Auto-Unblock itself times out repeatedly. ORCHESTRATION.md §2A specifies that Auto-Unblock self-resolves or Telegram-pings Adam after 3 attempts — this limit is not enforced in the watcher logic.

---

### F14 — `parent-ticket-expiry-watcher` checks only for `status = 'complete'` rows in `audit_log`, missing the `ceo-synthesizer` Routine's `fan_in_key` completion signal (MEDIUM)

**File:** `parent-ticket-expiry-watcher.ts`, step `check-synth-completion`
**Severity:** MEDIUM — expiry watcher fires Auto-Unblock for completed flows

The completion check queries `audit_log` for rows with `fan_in_key = data.fan_in_key` and `status = 'complete'`. However, per ORCHESTRATION.md §2B, when the CEO synth fires, `fan-in-watcher` writes a `status: 'complete'` audit row with `fan_in_key` set — this is the correct signal. But the query uses `.limit(1)` which is fine. The actual problem: if the CEO synth Routine was fired by `fan-in-watcher` (step `fire-ceo-synth` + `emit-synth-event`) but the CEO synth Routine itself hasn't finished yet (it was fired asynchronously), the `audit_log` may only have the `fan-in-watcher`'s own `complete` row (written in step `fire-ceo-synth`). The check would return `synthCompleted: true` and correctly skip Auto-Unblock. But this is also the row written when the fan-in *started the synth*, not when the synth completed. A crashed synth Routine leaves that `complete` row in place, causing the expiry watcher to conclude synthesis is done when it isn't.

---

### F15 — `embed-sessions.ts`, `embed-brain.ts`, `embed-skills.ts` have no per-file error handling; one bad file crashes the whole step (HIGH)

**Files:** `embed-sessions.ts`, `embed-brain.ts`, `embed-skills.ts`
**Severity:** HIGH — single corrupt file blocks all other file embeds on retry

`embed-codebase.ts` correctly wraps each file read/embed in a `try/catch` (lines 38–51), collecting errors per file without aborting the batch. The other three embed functions (`embed-sessions`, `embed-brain`, `embed-skills`) do NOT have this protection. Each file's `readFile` + `embedAndUpsert` is the entire body of a `step.run`. If `readFile` throws (file deleted between the push event and the step execution), the step throws and Inngest retries. After 3 retries the function fails permanently, blocking re-embed of all other changed files in the same push event. A deleted session file (which is a valid operation — Adam deletes old session files) will permanently fail the embed job for that push.

---

### F16 — `cost-watchdog` computes today's aggregates from `audit_log.ts` column but the column is named `ts` in the schema; no `cost_usd` column type guard causes silent zeros (LOW)

**File:** `cost-watchdog.ts`
**Severity:** LOW — silent cost undercount

In step `aggregate-today`, `cost_usd` is read as `(row.cost_usd as number) ?? 0`. Supabase returns `numeric(8,4)` columns as strings in its JavaScript client (not native numbers), depending on the PostgREST version and Supabase client configuration. If `cost_usd` arrives as `"0.4200"` (string), `(row.cost_usd as number) ?? 0` evaluates to `"0.4200" ?? 0` = `"0.4200"` (truthy string, not null/undefined). The addition `existing.total_cost += "0.4200"` produces string concatenation, not numeric addition. The aggregate will silently produce `NaN` or corrupted string values. The same pattern appears in `runaway-watcher.ts` step `sum-accrued-cost`. Correct handling requires `Number(row.cost_usd ?? 0)`.

---

## Summary Table

| ID | Severity | File | Category |
|----|----------|------|----------|
| F1 | CRITICAL | fan-in-watcher.ts | Fan-in semantics — wrong data source for sibling check |
| F2 | HIGH | fan-in-watcher.ts, routine-timeout-watcher.ts, parent-ticket-expiry-watcher.ts | Idempotency — `inngest.send` inside `step.run` |
| F3 | MEDIUM | routine-timeout-watcher.ts, audit-log-rollup.ts | Supabase client initialization inconsistency |
| F4 | HIGH | audit-log-rollup.ts | Invalid ISO timestamp `T24:00:00Z` in fallback query |
| F5 | HIGH | audit-log-rollup.ts | Delete executes even on zero-aggregate result |
| F6 | HIGH | embed-corpus.ts | Non-atomic delete+insert leaves orphan-free path on failure |
| F7 | HIGH | embed-corpus.ts | No OpenAI rate-limit handling in embedBatch |
| F8 | MEDIUM | embed-codebase.ts | Missing exclusions for `.d.ts`, generated, snapshot files |
| F9 | HIGH | events.ts + all embed functions | `changed_files` vs `changed_paths` name mismatch — embeds never fire |
| F10 | MEDIUM | runaway-watcher.ts | Single-row $1 threshold kills legitimate Routines (Synth, Friday Retro) |
| F11 | MEDIUM | board.ts | `source_persona_round` not regex-validated in Zod; R6.3 only enforced out-of-band |
| F12 | MEDIUM | spec.ts | `validateChildScope` trusts caller to compute remaining budget correctly |
| F13 | MEDIUM | routine-timeout-watcher.ts | Recursive watcher cascade with no depth limit |
| F14 | MEDIUM | parent-ticket-expiry-watcher.ts | `complete` row from fan-in-watcher masks unfinished synth Routine |
| F15 | HIGH | embed-sessions.ts, embed-brain.ts, embed-skills.ts | No per-file try/catch; one deleted file blocks all embeds permanently |
| F16 | LOW | cost-watchdog.ts, runaway-watcher.ts | Supabase numeric columns returned as strings; `as number` cast silently corrupts totals |

**CRITICAL: 1 | HIGH: 7 | MEDIUM: 6 | LOW: 1**

---

*No fixes proposed. All findings are observations for the build agent to resolve.*
