---
title: WS4 Connection Layer — Critique Synthesis & Revisions
date: 2026-05-08
status: PROPOSED
inputs:
  - docs/08-agents_work/2026-05-08-agent-build/CRITIQUE-WS4-bridge.md (15 findings)
  - docs/08-agents_work/2026-05-08-agent-build/CRITIQUE-WS4-inngest.md (16 findings)
  - docs/08-agents_work/2026-05-08-agent-build/CRITIQUE-WS4-supabase.md (11 findings)
  - docs/08-agents_work/2026-05-08-agent-build/CRITIQUE-WS4-war-room.md (13 findings)
finding_total: 55
severity_rollup: { CRITICAL: 1, HIGH: 19, MEDIUM: 25, LOW: 10 }
revision_count: 12
adam_decisions_required: 5
---

# WS4 Critique Synthesis & Revisions

55 findings across 4 critic files. Bundled into 12 revision clusters (R1-R12). 5 require an Adam decision (Q1-Q5); the rest I apply unilaterally and report.

Coverage gap: the security critic agent failed to write CRITIQUE-WS4-security.md (truncation mid-flow). Bridge + Inngest critics cover the security surface (HMAC, replay, dedup, token blast radius). Decision: do not re-dispatch. The bridge-critic alone produced 5 H-sev security findings; another security pass is unlikely to surface anything not already covered.

---

## Revision clusters

### R1 — Fan-in barrier queries the wrong column [CRITICAL — must-fix before any fan-out runs]

**Source:** Inngest F1
**Files:** `apps/web/src/inngest/functions/fan-in-watcher.ts`

The sibling-completion check queries `audit_log.status IN ('fired','accepted')` and treats non-zero results as "still pending." This is inverted twice over: (a) `accepted` is written at session START not END, so it never transitions to `complete` for sibling tickets that the watcher itself isn't processing; (b) `audit_log` rows for sub-tickets are written by their respective Routines on their own schedule — there is no guarantee that all sibling rows have transitioned to `complete` by the time this watcher fires.

The correct sibling source is **Linear ticket status** (queried via the bridge's Linear MCP) — not `audit_log` rows. The fan-in barrier should poll Linear for sub-ticket states under the parent, not derive them from local audit rows.

**Fix:** Replace the audit_log sibling check with a Linear MCP query: `linearMcp.searchIssues({ parent_id: parentId })`, count `state.type !== "completed"` rows. When count == 0 AND all completed, fire CEO synth. Apply unilaterally.

**Severity:** CRITICAL. Without this fix the entire fan-out → fan-in pipeline never closes.

---

### R2 — Idempotent send + bridge-only dispatch [HIGH]

**Sources:** Bridge F2 (Issue:created skips dedup), Bridge F4 (KV count guard not atomic), Inngest F2 (`inngest.send` inside `step.run`)
**Files:** `infra/cloudflare-bridge/src/index.ts`, `apps/web/src/inngest/functions/{fan-in-watcher,routine-timeout-watcher,parent-ticket-expiry-watcher}.ts`

Three converging bugs all violate the same contract — every Routine fire must be exactly-once.

1. **Bridge F2:** `handleIssueCreated` (board-meeting fast path) skips both KV nonce check and DO lock. Linear webhook retries (3x default) → 3 board-meeting fires → $9 spent.
2. **Bridge F4:** Fire-count KV guard does `get → check → put` non-atomically; concurrent webhooks all read stale count and bypass the daily cap.
3. **Inngest F2:** `inngest.send()` inside `step.run()` re-fires on retry if the outer function crashes between send-success and step-checkpoint-write.

**Fix:**
- Bridge F2: route `handleIssueCreated` through the same `acquireLock` + `checkAndStoreNonce` path as `handleCommentCreated`. The board-meeting label is a fire just like any other — no fast-path shortcut.
- Bridge F4: replace the KV `get/put` pair with a Durable Object counter (DO storage is strongly consistent, supports atomic `state.storage.transaction()`). Move `checkFireCountGuard` from KV to a `FireCountDO` class.
- Inngest F2: replace `inngest.send(...)` calls inside `step.run()` with `step.sendEvent("name", { ... })` — Inngest's native idempotent primitive.

Apply unilaterally.

---

### R3 — HMAC scope: timestamp + nonce + canonical JSON [HIGH]

**Sources:** Bridge F1 (Shortcut HMAC body-only, replay), Bridge F5 (`/telegram` endpoint no HMAC), Bridge F9 (`signSpec` non-deterministic key order), Supabase F4 (nonce nullable defeats R3.4)
**Files:** `infra/cloudflare-bridge/src/index.ts`, `infra/telegram-bot/src/index.ts`, `infra/shortcuts/Capture-Beamix-Idea.shortcut.json`, `apps/web/supabase/migrations/20260508_war_room_observability.sql`

R3.4 in WS2 spec mandates replay prevention via per-spec nonce. Four implementation gaps make it security theater:

1. **F1:** iOS Shortcut HMAC covers raw body only — no timestamp, no nonce. Captured signature is replayable for the 90-day rotation window.
2. **F5:** `/telegram` endpoint accepts unauthenticated POSTs (chat-ID check only — chat IDs are guessable).
3. **F9:** `signSpec` uses `JSON.stringify(spec, Object.keys(spec).sort())` — the second arg is a top-level *replacer*, not a recursive sort. Nested-key order is non-deterministic; HMAC verification is flaky.
4. **Supabase F4:** `nonce uuid UNIQUE` allows multiple NULL rows (Postgres treats NULL as distinct). Internal-observability rows omit nonce; replay-prevention is unenforced for the rows that would be replayed.

**Fix:**
- Add `X-Beamix-Timestamp` header to every signed request (Shortcut, Telegram bot → bridge). HMAC over `timestamp + "\n" + body`. Bridge rejects requests with `|now - timestamp| > 300s` (5-min skew).
- Embed `nonce: uuid()` inside the Shortcut payload itself (Haiku-generated or Shortcuts UUID action). Bridge dedups via the existing `checkAndStoreNonce` KV path.
- Add HMAC verification to `handleTelegram` — same path as `handleIdeaCapture`. Shared `verifyHmacSignature(req, secret, maxSkewSeconds)` helper.
- Replace `JSON.stringify(spec, sortedKeys)` with a recursive canonical-JSON serializer (sort keys at every nesting level). Use `canonicalize` from `json-canonicalize` package or hand-rolled equivalent (~20 lines).
- Add `row_kind text NOT NULL CHECK (row_kind IN ('routine_dispatch','internal_event'))` to `audit_log`. Make nonce a partial UNIQUE index: `CREATE UNIQUE INDEX audit_log_nonce_dispatch ON audit_log (nonce) WHERE row_kind = 'routine_dispatch';`. Internal rows skip nonce; dispatch rows MUST have one.

Apply unilaterally. Ask Adam **Q3** below to confirm row_kind shape (alternative: keep nonce nullable, add CHECK enforcing nonce presence based on `spec ? 'nonce' : NULL`).

---

### R4 — Durable Object lock lifecycle [HIGH]

**Source:** Bridge F3
**Files:** `infra/cloudflare-bridge/src/durable-object.ts`

Alarm is set only when `currentAlarm === null`. Second-or-later locks acquired before the first alarm fires get no alarm of their own. If the DO instance is evicted after the first alarm fires (Cloudflare evicts idle DOs after ~30s), subsequent locks become zombie locks until manually cleared.

**Fix:** On every `acquireLock` success, run `currentAlarm = await state.storage.getAlarm(); if (currentAlarm == null || expiresAt < currentAlarm) { state.storage.setAlarm(expiresAt) }`. The earliest-expiring lock owns the alarm; when it fires, the alarm handler reschedules for the next-earliest. This is the standard "min-heap by alarm" pattern. Apply unilaterally.

---

### R5 — Hot-path API hardening [HIGH/MEDIUM]

**Sources:** Bridge F7 (Haiku classifier no timeout), Bridge F8 (shared CEO bearer = single revoke kills fleet)
**Files:** `infra/cloudflare-bridge/src/index.ts`, `infra/cloudflare-bridge/src/routing.ts`

1. **F7:** `classifyTierWithHaiku` runs synchronously on every label-less ticket with no `AbortSignal`. Workers have a 30s CPU budget; an Anthropic slow-response burns most of it before the rest of the dispatch pipeline runs. Worse, a tier-classification failure leaves DO lock held + audit_log fired row written.
2. **F8:** All 6 C-suite labels share `ROUTINE_CEO_ENTRY_POINT_TOKEN`. `runaway-watcher` revoking that token kills the entire fleet, not just the runaway agent.

**Fix:**
- F7: Add `AbortSignal.timeout(8000)` to the Haiku fetch (8s ceiling). On timeout/error, default to `tier: "lite"` (the existing fallback). Move the classification call **after** `acquireLock` and `writeAuditLog` so a slow Haiku response doesn't pin the dispatch pipeline. If classification fails, write `audit_log.status = "complete"` with `tier: "lite"` and proceed.
- F8: Provision per-Routine bearer tokens. Update `routing.ts` to use `ROUTINE_${AGENT}_TOKEN` (e.g., `ROUTINE_CTO_TOKEN`, `ROUTINE_CMO_TOKEN`). Document the 11 token env vars in `infra/cloudflare-bridge/README.md` for Adam to provision in Anthropic Console.

Apply F7 unilaterally. F8 requires Adam to create 10 additional Anthropic Routines (one per agent) — flagged in the Adam-action checklist below.

---

### R6 — Routing & contracts drift [HIGH/MEDIUM]

**Sources:** Bridge F6 (@mention prefix collision; `@board` missing), War-room F13 (`risk:irreversible` not enforced), War-room F11 (grep brittle), War-room F10 (slug breaks on multi-segment branches), Bridge F11 (Shortcut shows ✓ regardless of failure)
**Files:** `infra/cloudflare-bridge/src/routing.ts`, `infra/cloudflare-bridge/src/index.ts`, `.github/workflows/qa-lead-pass.yml`, `infra/shortcuts/Capture-Beamix-Idea.shortcut.json`, `docs/08-agents_work/CONNECTIONS.md`

Five drift bugs between spec and implementation:

1. **Bridge F6:** Telegram routing uses `text.toLowerCase().startsWith(mention)` — `@cto` matches `@cto-something`, no word boundary. `@board` is documented in CONNECTIONS.md §C but absent from `TELEGRAM_MENTION_TO_LABEL`.
2. **War-room F13:** `risk:irreversible` label is documented as forcing tier=full, but `qa-lead-pass.yml` doesn't check the label — a `qa_verdict: PASS` on Lite-tier review passes the workflow even with the risk label.
3. **War-room F11:** `grep -q "qa_verdict: PASS"` is case-sensitive, whitespace-sensitive, fails on quoted YAML.
4. **War-room F10:** Branch slug extraction uses single-prefix sed; `feat/scope/slug` produces `scope/slug` which `find -name '*-scope/slug.md'` never matches.
5. **Bridge F11:** Shortcut hardcodes "Idea captured ✓" regardless of bridge response. Failed dictation or 422 from bridge = silent loss.

**Fix:**
- F6: Use word-boundary regex `^(@[a-z-]+)\b` to extract the mention. Add `@board` → `agent:synthesizer` to `TELEGRAM_MENTION_TO_LABEL`.
- F13: Add a step to `qa-lead-pass.yml` — if PR has label `risk:irreversible`, require session frontmatter to also contain `tier: full`. Otherwise BLOCK.
- F11: Replace literal grep with `grep -qiE 'qa_verdict:[[:space:]]+"?PASS"?[[:space:]]*$'`.
- F10: Replace sed with a slug regex that anchors and accepts `[a-z0-9-]+` only: `TASK_SLUG=$(echo "$HEAD_BRANCH" | sed -E 's|^(feat\|fix\|chore)/||' | tr / -)` — collapses internal slashes to dashes so the find pattern matches.
- Bridge F11: Shortcut Step 8 (notification) reads `BridgeResponse.status_code` (Get URL Contents action exposes status). If 200 → "Idea captured ✓ — BMX-XXX"; otherwise → "Capture FAILED: <error>". Add an explicit dictation-empty check between Steps 1 and 3 (`If RawDictation is empty → Show alert "No voice detected" → Exit Shortcut`).

Apply unilaterally.

---

### R7 — Embed pipeline is dead-on-arrival + brittle [HIGH × 4]

**Sources:** Inngest F9 (`changed_files` vs `changed_paths`), Inngest F6 (delete+insert non-atomic), Inngest F7 (no rate-limit handling), Inngest F15 (no per-file try/catch), Inngest F8 (filter misses .d.ts/generated)
**Files:** `apps/web/src/inngest/events.ts`, `apps/web/src/lib/embeddings/embed-corpus.ts`, `apps/web/src/inngest/functions/embed-{decisions,sessions,brain,codebase,skills}.ts`

The entire pgvector RAG-corpus pipeline fails silently because of a field-name typo. The 5 embed functions read `event.data.changed_paths`, but `events.ts` defines the field as `changed_files`. Every push event silently no-ops with `{ skipped: true }`. The pgvector index will be empty in production until this is fixed.

Stacked failures on top:

- **F6:** `embedAndUpsert` does `delete-then-insert` non-transactionally. OpenAI failure mid-flow leaves the corpus with zero chunks for that path.
- **F7:** `embedBatch` sends all chunks in one OpenAI call with no rate-limit handling. Large files hit 429 and the entire batch retries.
- **F15:** 3 of 5 embed functions have no per-file try/catch — one corrupt/deleted file blocks all sibling embeds.
- **F8:** Filter excludes `.test.ts/tsx` but not `.d.ts`, `*.snap`, generated files like `database.types.ts` (500+ lines of pure types pollute the corpus).

**Fix:**
- Standardize on `changed_paths` in `events.ts` (matches all 5 reader functions and all GitHub webhook payload conventions). Update the `GitPushEvent` type accordingly.
- `embedAndUpsert`: wrap delete+insert in a Postgres transaction via `supabase.rpc('embed_corpus_replace', { p_path, p_rows })` — or the cheaper alternative: insert first with a temporary `corpus_version` UUID, then in a single SQL transaction delete the old and update the new version. Document the trade-off in code comment; ship the SQL RPC.
- `embedBatch`: chunk the OpenAI call into batches of 100 inputs max, with `Retry-After` header parsing on 429 → exponential backoff per Inngest retry conventions.
- Add per-file `try/catch` to `embed-sessions`, `embed-brain`, `embed-skills` matching `embed-codebase` pattern. One bad file logs and skips, doesn't crash the batch.
- Filter additions: `!path.endsWith('.d.ts')`, `!path.endsWith('.snap')`, `!path.includes('__snapshots__/')`, `!path.endsWith('.generated.ts')`, `!path.endsWith('database.types.ts')`.

Apply unilaterally.

---

### R8 — Audit-log retention + aggregation [HIGH/MEDIUM]

**Sources:** Inngest F4 (`T24:00:00Z` invalid), Inngest F5 (delete on zero-aggregate result), Supabase F1 (`telegram_send_failed` enum missing), Supabase F2 (`audit_log_aggregate_for_date` RPC missing), Supabase F3 (FK RESTRICT vs CASCADE), Supabase F7 (no IF NOT EXISTS), Supabase F8 (RLS bypass undocumented), Supabase F11 (`failures` nullable)
**Files:** `apps/web/src/inngest/functions/audit-log-rollup.ts`, `apps/web/supabase/migrations/20260508_war_room_observability.sql`

The 90-day → daily rollup pipeline has multiple silent-failure paths. Worst case: a Routine fires at the 90-day boundary, aggregation silently drops yesterday's rows, FK constraint blocks deletion, retention job dead-letters, no alert reaches Adam.

**Fix:**
- F4: Replace `T24:00:00Z` with `toISOString()` of `dayAfterYesterday at 00:00:00Z`. Use `<` comparison to next-day-start, not `<=` end-of-day.
- F5: Add a guard — if `aggregates_written === 0` AND no rows present in `audit_log` for that date, log warning and SKIP the delete step. Only delete after successful aggregate write.
- F1: Add `telegram_send_failed` to the CHECK constraint. (Adam decision Q1 — see below.)
- F2: Create `audit_log_aggregate_for_date(p_date date)` SQL function — same logic as the inline fallback, but server-side and faster. Migration adds the function; Inngest function calls it as primary path. (No more silent-error-on-primary-path noise.)
- F3: Choose FK behavior. (Adam decision Q2 — see below.)
- F7: Add `IF NOT EXISTS` to all CREATE statements. Migration becomes idempotent — safe to re-apply on smoke-test environments. Style-conformant with the retro of `20260420_wave3_foundation.sql` is broken intentionally; document the deviation.
- F8: Add SQL comments to `audit_log_daily` and `claude_progress` policies: `COMMENT ON POLICY ... IS 'Service role bypasses RLS; use createServiceRoleClient (not createServiceClient).'`. Audit `cost-watchdog.ts` to confirm `createServiceClient` resolves to service-role; rename for clarity if not.
- F11: `failures integer NOT NULL DEFAULT 0`.

Apply F4/F5/F2/F7/F8/F11 unilaterally. F1 + F3 require Adam decisions.

---

### R9 — `/war-room` page safety [HIGH × 3 + MEDIUM × 4]

**Sources:** War-room F1 (any-cast on Supabase client), War-room F3 (no depth limit on TraceTree), War-room F4 (useState misused for async load), War-room F5 (no LIMIT on children query), War-room F6 (Realtime full-table scope), War-room F7 (TodaySection polling not Realtime + dead loading state), War-room F2 (missing ADAM_EMAIL = silent lockout)
**Files:** `apps/web/src/app/(internal)/war-room/{layout.tsx,page.tsx,components/*,lib/queries.ts}`

The page has correctness bugs that will surface immediately under load:

1. **F1 + F2:** `(await createClient()) as any` removes type safety on auth boundary. Empty `ADAM_EMAIL` env var locks Adam out silently.
2. **F3 + F5:** `buildTraceNode` recurses with no depth limit and no LIMIT on children query. Cyclic `parent_audit_log_id` (possible from a buggy bridge or compromised agent) → stack overflow during SSR.
3. **F4:** `useState(() => loadTrace(...))` — `useState` initializer is wrong primitive; misfires twice in Strict Mode, races on `setTraceNode`.
4. **F6:** Realtime channel filter `status=eq.running` matches all-time, not today. Across 90 days of accumulated rows, channel becomes a noise source.
5. **F7:** TodaySection polls every 30s instead of Realtime. ORCHESTRATION.md §2G says Realtime. Also dead `loading` state that's never set to `true`.

**Fix:**
- F1: Remove `as any`. Use `const supabase = await createClient()`. Strongly type the user check: `const { data: { user } } = await supabase.auth.getUser()`.
- F2: At module load, throw if `ADAM_EMAIL` missing in production. Allow empty in development with warning. Hard-fail surfaces the misconfiguration immediately.
- F3: Add `MAX_TRACE_DEPTH = 8` constant. `buildTraceNode(row, visited = new Set(), depth = 0)`. Bail with `truncated: true` flag if depth >= MAX or row.id in visited.
- F5: Add `.limit(50)` to children query. Add `truncated: childrenData.length === 50` flag in returned node.
- F4: Replace with `useEffect(() => { if (roots.length > 0) loadTrace(roots[0].id) }, [roots])`.
- F6: Document the limitation. Realtime postgres_changes does not support range filters. Acceptable — `claude_progress` rows with status=running are short-lived (TTL is the runtime of the Routine, max 60 min). Volume is bounded.
- F7: Add a `audit_log` Realtime subscription to TodaySection (matches spec) on top of the 30s polling for safety. Remove dead `loading` state OR wire it correctly to `setLoading(true)` before fetch.

Apply unilaterally.

---

### R10 — Workflow permissions + brand drift [MEDIUM × 3]

**Sources:** War-room F12 (`pull-requests: read` doesn't cover issue comments), War-room F8 (inline style vs Tailwind), War-room F9 (no dark-mode hex variants)
**Files:** `.github/workflows/qa-lead-pass.yml`, `apps/web/src/app/(internal)/war-room/components/*.tsx`

- F12: Add `issues: read` to permissions block. Without it, `gh api repos/$REPO/issues/$PR_NUMBER/comments` returns 403 — bypass mechanism is silently broken.
- F8: Replace inline `style={{ gridTemplateColumns: '14px 1fr 1fr auto auto' }}` with Tailwind arbitrary value `className="grid [grid-template-columns:14px_1fr_1fr_auto_auto]"`. Same for `maxHeight: '380px'`.
- F9: Add `dark:` variants. Memory says dark mode primary is `#5A8FFF`. Pattern: `bg-[#3370FF] dark:bg-[#5A8FFF]`. Apply to all status hexes (Excellent #06B6D4, Good #10B981, Fair #F59E0B, Critical #EF4444 — bump saturation 10% for dark variants).

Apply unilaterally.

---

### R11 — Cost-watchdog + numeric type safety [MEDIUM/LOW]

**Sources:** Inngest F10 (`runaway-watcher` $1 single-row threshold kills Synth/FridayRetro), Inngest F16 (numeric returned as string causes string-concat NaN), Inngest F13 (Auto-Unblock recursive cascade), Inngest F14 (`complete` row from fan-in masks unfinished synth), Inngest F12 (validateChildScope trusts caller), Inngest F11 (`source_persona_round` not regex-enforced in Zod), Inngest F3 (supabase client init inconsistency)

**Fix:**
- F10: Change `runaway-watcher` trigger from "single-row > $1" to "session accrued cost > spec.budget.max_cost_usd × 1.2". Sum cost across all `audit_log` rows with the same `nonce` or `parent_audit_log_id` chain. Single-row threshold drops; budget-relative threshold enforces the WS2 spec contract.
- F16: Wrap all `cost_usd` reads in `Number(row.cost_usd ?? 0)`. Audit `cost-watchdog.ts` and `runaway-watcher.ts` for similar patterns. Add a unit test for the rollup with a stringified numeric input.
- F13: Add cascade depth guard. Auto-Unblock fires only if `parent_audit_log_id` chain depth ≤ 3. Beyond 3 → write `audit_log.status = 'over_budget'` with reason "auto_unblock_max_attempts" and stop. Telegram-ping Adam (this is one of the rare alert paths Adam approved per Q7 — silent kills, but escalation after 3 cascades is incident-level).
- F14: Distinguish "fan-in fired the synth" (an event row) from "synth completed" (a result row). Add `event_kind text` column to internal rows: `'synth_dispatched'` vs `'synth_complete'`. parent-ticket-expiry-watcher checks for `event_kind = 'synth_complete'`.
- F12: Add `if (remaining_parent_budget_usd < 0) throw new Error(...)` guard at top of `validateChildScope`. Update callers to compute remaining budget via a single helper `computeRemainingBudget(parentSpec, supabase)`.
- F11: Update `LockedDecision.source_persona_round` Zod schema to `z.string().regex(/^(visionary|strategist|architect|risk-modeler|customer-voice|aria|broad-adversary)-r[12]$/)`.
- F3: Standardize on `createServiceRoleClient()` (rename `createServiceClient` → `createServiceRoleClient` if not already aliased). Document at the top of every Inngest function: `// Service role required — bypasses RLS for internal observability writes.`

Apply unilaterally.

---

### R12 — Misc P3 hardening [LOW]

**Sources:** Bridge F10 (Shortcut API key in iCloud), Bridge F12 (queueDelayedFire sends expired specs), Bridge F13 (/health leaks state), Bridge F14 (rotation script prints secret), Bridge F15 (Telegram chat ID stored as linear_user_id), Supabase F5 (`killed` phantom enum), Supabase F6 (no agent index), Supabase F9 (`runtime_s` allows negative), Supabase F10 (no row_kind discriminator)

Bundle of lower-priority items, applied as a single hardening pass:

- Bridge F10: Shortcut README adds an explicit warning + recommends Keychain-stored `ANTHROPIC_API_KEY` via Shortcuts "Get Password" action. Provide both options; recommend Keychain for non-disposable keys.
- Bridge F12: `queueDelayedFire` checks `spec.expires_at` before queueing. If `expires_at < now() + delay_seconds`, write audit_log entry `status='expired_pre_dispatch'` and skip the queue. Drop the SUPABASE_SERVICE_ROLE_KEY misuse — use Inngest's actual ingest endpoint (`inngest.send` from a server route, not an HTTP POST to Supabase Edge Function).
- Bridge F13: `/health` returns minimal `{ ok: true }` for unauthenticated requests. Detailed `bridge_paused` / `linear_paused` / binding state requires `Authorization: Bearer ${BRIDGE_HMAC_SECRET}` (or a separate health bearer). Adam can curl it locally for diagnostics.
- Bridge F14: Rotation script writes the new secret to a temp file, prints only the file path. Adam reads with `cat $TMPFILE` then immediately deletes. Removes the secret from terminal scrollback.
- Bridge F15: Add `issued_by.telegram_chat_id` field to the trust spec. Telegram-sourced fires populate that field; `linear_user_id` stays null. Update Zod schema `IssuedBy = { kind: 'adam', linear_user_id: z.string().nullable(), telegram_chat_id: z.string().nullable() }` with `.refine` requiring at least one to be non-null.
- Supabase F5: Either remove `killed` from `claude_progress.status` enum (no writer) OR add a writer in `runaway-watcher`. **Add the writer** — when runaway-watcher kills a session, write `claude_progress.status = 'killed'` for all running rows under that nonce. Cleaner audit trail than over_budget alone.
- Supabase F6: Add `CREATE INDEX idx_audit_log_agent_ts ON audit_log (agent, ts DESC);`. Per-agent historical queries become indexed.
- Supabase F9: Add `CHECK (runtime_s >= 0)` constraint.
- Supabase F10: Already covered in R3 (row_kind discriminator).

Apply unilaterally.

---

## Anti-revisions (findings rejected)

- **Bridge F11 second paragraph (Shortcut "Idea captured ✓"):** First paragraph (failure feedback) is in R6. The dictation-empty check is also in R6.
- **War-room F7 spec gap (polling vs Realtime):** Hybrid (polling + Realtime) approach in R9 is sufficient; do not strip polling — it provides a safety net if Realtime channel reconnect fails.
- **Inngest F8 second item (`node_modules/**` filter):** GitHub webhook never delivers node_modules paths in `changed_paths`. Defensive but unnecessary.

---

## Adam decisions required (Q1–Q5)

### Q1 — `telegram_send_failed` enum value: add to migration?

**Conflict:** Errata 1 of ORCHESTRATION.md lists 14 audit_log status values without `telegram_send_failed`. The telegram-failure runbook explicitly mandates this value as a "WS4 migration deliverable." The current migration follows errata 1.

**Recommend:** Add it. Bridge expects to write it on Telegram outage; without it, INSERT silently fails and the diagnostic signal the runbook depends on is lost.

**Cost of wrong choice:** Telegram outage = silent data loss. Adam's mitigation runbook references a status that doesn't exist in the DB.

### Q2 — `parent_audit_log_id` ON DELETE behavior

Three options for the FK on `audit_log.parent_audit_log_id`:

| Option | Behavior at 90-day retention |
|---|---|
| RESTRICT (current default) | Delete fails when old parent has recent children. Retention job dead-letters. |
| CASCADE | Old parent + all descendants deleted together. Children younger than 90d lost. |
| SET NULL | Children survive; parent lineage is severed (orphan rows). |

**Recommend:** SET NULL. Children younger than 90d should survive retention. Lineage loss is recoverable from the `nonce`/`fan_in_key` columns. CASCADE risks losing recent work; RESTRICT breaks retention permanently.

### Q3 — Nonce enforcement model

Two options for enforcing R3.4 (replay prevention) at the DB layer:

| Option | DDL |
|---|---|
| **A: row_kind discriminator + partial unique** | `row_kind text NOT NULL CHECK (row_kind IN ('routine_dispatch','internal_event'))`; partial UNIQUE on nonce only for `routine_dispatch`. |
| **B: nonce NOT NULL with sentinel for internals** | Internal rows write `nonce = gen_random_uuid()` (throwaway). Simpler schema; double-purposes the column. |

**Recommend:** A. Cleaner separation — internal events don't carry security guarantees, dispatch events do. row_kind also enables future analytics ("how many internal vs dispatch rows"). One extra column, well worth it.

### Q4 — Per-Routine bearer tokens (R5 F8)

The fix requires Adam to provision 10 additional Anthropic Routines (one per agent) and 10 separate bearer tokens, replacing the shared `ROUTINE_CEO_ENTRY_POINT_TOKEN`.

**Recommend:** Yes — but as a follow-up in WS6 (agent definitions phase). For WS4 LOCKED, keep the shared token model with a documented FOLLOW-UP: WS6 must split tokens before Routine A/B smoke tests run in production. Adversarial revoke-blast-radius is real but the fleet is in build phase, not production. Acceptable risk for now.

**Alternative:** Adam provisions 10 tokens during WS4 — adds ~20 minutes of Anthropic Console clicks. Bridge code is already structured to support per-agent tokens (one-line change in routing.ts).

### Q5 — Auto-Unblock cascade depth limit

R11 F13 fix: cap Auto-Unblock cascades at depth 3. After 3 attempts, write `over_budget` and Telegram-ping Adam.

This Telegram-ping is the **first time** in WS3+WS4 we propose breaking the Q7 "no real-time cost alerts" rule. Justification: Auto-Unblock failing 3× indicates a structural problem (not a transient cost spike). Adam's intervention is the only resolution.

**Recommend:** Allow this single Telegram-ping path. Tag it as "incident escalation, not cost alert" in code comments. If Adam disagrees, swap to writing only the `audit_log` row + relying on the daily burn-down to surface it (next-morning-delivery latency).

---

## Adam-action checklist (post-LOCK)

These cannot be done by agents — Adam must execute on his accounts:

1. **(Q1 dependent)** — re-run migration after enum decision is locked.
2. **(Q4 dependent)** — provision 10 Anthropic Routines + bearer tokens IF Adam chooses split-now.
3. **Cloudflare Workers Paid plan** ($5/mo) — required for Durable Objects.
4. **KV namespace + DO class binding** — wrangler deploy after Paid is active.
5. **Helicone proxy** for product API (NOT Routines) — Adam's Helicone account.
6. **Linear webhook secret** + bot user accounts — Adam's Linear workspace.
7. **Telegram bot via BotFather** — Adam's Telegram.
8. **Apply the migration on staging first**, then production after validation.

---

## Summary by severity

| Cluster | Severity | Auto-fix | Adam decision |
|---|---|---|---|
| R1 | CRITICAL | ✓ | — |
| R2 | HIGH | ✓ | — |
| R3 | HIGH | ✓ (most) | Q3 |
| R4 | HIGH | ✓ | — |
| R5 | HIGH/MED | ✓ (F7) | Q4 (F8) |
| R6 | HIGH/MED | ✓ | — |
| R7 | HIGH | ✓ | — |
| R8 | HIGH/MED | ✓ (most) | Q1, Q2 |
| R9 | HIGH/MED | ✓ | — |
| R10 | MED | ✓ | — |
| R11 | MED/LOW | ✓ | Q5 |
| R12 | LOW | ✓ | — |

55 findings → 12 clusters → 5 Adam decisions, ~50 unilateral fixes.

**Next step:** Adam answers Q1–Q5. I apply revisions, re-run smoke tests against fixes, lock WS4 in DECISIONS.md, write session file.
