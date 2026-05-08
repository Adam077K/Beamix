# CRITIQUE — WS4 Bridge, Telegram Bot, iOS Shortcut

**Date:** 2026-05-08
**Critic role:** adversarial reviewer — attacker, procurement officer, on-call incident commander
**Scope:** `infra/cloudflare-bridge/`, `infra/telegram-bot/`, `infra/shortcuts/`, relevant contract sections in `docs/08-agents_work/ORCHESTRATION.md` + `CONNECTIONS.md` + handoff
**Framing:** find problems. Do NOT propose fixes.

---

## Findings

---

### F1 [SEV:H] HMAC scope omits timestamp — replay within spec's validity window

**Location:** `infra/cloudflare-bridge/src/index.ts` lines 201–214, `verifyShortcutSignature`; also `infra/telegram-bot/src/index.ts` lines 43–56, `signForBridge`

**Issue:** The iOS Shortcut HMAC is computed over the raw request body only. The body is the JSON parsed from Haiku's output: title + body fields. There is no timestamp, nonce, or any request-specific ephemeral value mixed into the HMAC input. An attacker who captures one valid `X-Beamix-Signature` + body pair can replay that exact request indefinitely — the signature will remain valid as long as the `SHORTCUT_SECRET` hasn't rotated, which per the runbook is 90 days. The body itself uses the ticket title as the only differentiator; if Adam ever sends the same idea twice, the HMAC is identical. `CONNECTIONS.md §4E` says "iOS Shortcut: HMAC body itself acts as fingerprint; bridge dedups recent body hashes (24h KV TTL)" but the bridge code (`handleIdeaCapture`) does NO body-hash dedup. That KV check is documented but not implemented.

**Evidence:** `index.ts:800–847` — `handleIdeaCapture` verifies HMAC, parses body, calls `createLinearTicket`. No KV dedup lookup. `CONNECTIONS.md §4E` references "24h KV TTL" dedup for Shortcut — absent from code.

**What breaks on a real Tuesday:** Adam captures an idea. Body-with-signature pair is logged by CloudFlare or visible in any TLS-intercepting proxy on his iPhone's network. Attacker replays it 50 times. 50 duplicate Linear tickets created, routing table fires CEO Routine 50 times (if a spec label were added), burning through the 15/day fire cap before Adam wakes up.

---

### F2 [SEV:H] Two-layer dedup Layer 1 (KV nonce check) is completely absent for Issue:created path

**Location:** `infra/cloudflare-bridge/src/index.ts` lines 754–792, `handleIssueCreated`; `ORCHESTRATION.md §2B` Layer 1 spec

**Issue:** The spec (`ORCHESTRATION.md §2B`) defines Layer 1 as "Cloudflare KV — ticket-scoped 24h TTL on `fire:{ticket_id}:{label}`". The `handleCommentCreated` path does perform a nonce check via `checkAndStoreNonce`. However `handleIssueCreated` (the board-meeting fast path) skips Layer 1 entirely — no KV nonce write, no prior-nonce check. It does NOT call `acquireLock` either before calling `fireRoutine`. If Linear retries the `Issue:created` webhook (which Linear does 3 times per their docs), the board-meeting Routine is fired up to 3 times before the first run even completes.

**Evidence:** `index.ts:779–791` — calls `writeAuditLog` then `fireRoutine` with no KV check and no Durable Object lock acquire. Compare to `handleCommentCreated` at lines 657–747 which does both.

**What breaks on a real Tuesday:** Adam files a ticket with `board-meeting` label at 11 PM. Linear's webhook delivery hits a network bump and retries twice. Three CEO Routine fires kick off in parallel. Three separate $3 board meeting sessions run. $9 spent, 3 sets of conflicting results in audit_log, no dedup.

---

### F3 [SEV:H] Durable Object alarm only sets for the FIRST lock — subsequent lock TTLs lost

**Location:** `infra/cloudflare-bridge/src/durable-object.ts` lines 62–66

**Issue:** The alarm auto-release is set only when `currentAlarm === null`. If a Durable Object instance already holds a lock for ticket A (alarm scheduled for T+5min), and a second lock for ticket B is acquired 1 minute later, the second lock's expiry (T+1min+5min = T+6min) is NOT scheduled — the code explicitly skips `setAlarm` if an alarm already exists. When the alarm fires at T+5min, ticket A's lock is deleted but ticket B's lock is correctly found and kept alive (its `expiresAt` is still in the future). However, if the Worker crashes BEFORE the alarm fires for B, and no new alarm is set, B's lock expires silently without the alarm handler ever cleaning it up. Effectively: every lock acquired after the first one within the same DO instance relies entirely on the alarm that was set for the first lock. If that first alarm fires and the DO instance is evicted afterward (Cloudflare evicts idle DOs after ~30s), the second lock's alarm is lost permanently — it becomes a zombie lock that blocks all retries for that (routine_id, ticket_id) for the lifetime of the DO storage entry (no TTL in storage, only in memory).

**Evidence:** `durable-object.ts:63–66` — `if (currentAlarm === null) { await this.state.storage.setAlarm(expiresAt); }` — the condition prevents scheduling an alarm for any lock acquired when another alarm is already pending. The `alarm()` handler at lines 82–103 does reschedule for surviving locks, but only if the DO instance is still alive when the alarm fires.

**What breaks on a real Tuesday:** Two tickets fire nearly simultaneously. Ticket A gets a lock. Ticket B gets a lock 200ms later — no alarm set. A crash/eviction happens before either 5-min TTL expires. Ticket B is locked permanently. Any retry for ticket B is silently dropped (returns `acquired: false`) forever, until Adam manually clears the DO storage — which has no documented runbook step.

---

### F4 [SEV:H] KV fire-count guard is not atomic — concurrent bursts double-count under race

**Location:** `infra/cloudflare-bridge/src/index.ts` lines 274–288, `checkFireCountGuard`

**Issue:** The guard reads the current count, checks against the limit, then writes the incremented value. These are two separate KV operations with no atomicity. Cloudflare KV is eventually consistent and has no compare-and-swap primitive. Under concurrent webhook delivery — which is normal when Adam fires multiple Linear tickets within seconds — two Worker invocations can both read `count=14`, both pass the `current < maxPerDay` check, both write `count=15`. Both fires proceed. The counter is now 15 instead of 16. The 16th fire also reads 15, passes, writes 16. All three fires go through despite the cap being 15. The cap is effectively not a hard cap under concurrent load; it's a soft suggestion. With a burst of N concurrent requests, up to N extra fires can slip through.

**Evidence:** `index.ts:278–287` — `const raw = await kv.get(key); const current = ...; if (current >= maxPerDay) return false; await kv.put(key, String(current + 1), ...)` — no atomic increment, no transaction.

**What breaks on a real Tuesday:** Adam has a backlog and creates 20 tickets in 30 seconds. Linear delivers all 20 webhooks nearly simultaneously across Cloudflare edge nodes. All 20 requests read `count=0` (KV propagation lag). All 20 pass the guard. All 20 fire. 20 Routines start. Max 5x plan allows 15/day. Extra 5 may hit 429s on Anthropic side, and the error recovery path (releaseLock + write anthropic_error) is reached for those — but the KV counter still reads lower than actual, so tomorrow's guard is also corrupt.

---

### F5 [SEV:H] Telegram /telegram endpoint lacks HMAC verification — accepts unauthenticated POSTs

**Location:** `infra/cloudflare-bridge/src/index.ts` lines 863–947, `handleTelegram`

**Issue:** The Telegram bot forwards messages to the bridge's `/telegram` endpoint, adding `X-Beamix-Signature` (the body HMAC-signed with `BRIDGE_HMAC_SECRET`). The bridge's `handleTelegram` function checks that the message came from `ADAM_TELEGRAM_CHAT_ID` (line 884) — but it does NOT verify the `X-Beamix-Signature` header at all. There is no call to `verifyShortcutSignature` or any HMAC check in `handleTelegram`. Any HTTP client that knows the bridge URL can POST a crafted Telegram-shaped JSON body claiming any `from.id` or `chat.id` and the bridge will process it. The Telegram chat ID check is a weak guard: chat IDs are numeric and discoverable (Telegram group chat IDs are public; personal IDs can be brute-forced or socially engineered).

**Evidence:** `index.ts:863–947` — `handleTelegram` parses JSON, checks `fromId !== env.ADAM_TELEGRAM_CHAT_ID`, then proceeds. No `request.headers.get("X-Beamix-Signature")` call anywhere in the function.

**What breaks on a real Tuesday:** Attacker discovers the bridge URL (any Cloudflare Workers URL is guessable from the worker name). Posts a JSON body claiming `from.id = ADAM_TELEGRAM_CHAT_ID`. Bridge fires CEO Routine with a crafted message that starts with `@cto Fix the billing module — reset all Paddle subscription records`. HMAC-signed spec gets fired with domain=backend, intent=fix. CTO Routine starts.

---

### F6 [SEV:H] Telegram @mention prefix matching has collision — `@cto-something` matches `@cto`

**Location:** `infra/cloudflare-bridge/src/routing.ts` lines 153–164, `TELEGRAM_MENTION_TO_LABEL`; `index.ts` lines 890–895

**Issue:** The routing loop uses `text.toLowerCase().startsWith(mention)` to match Telegram messages. The table includes `@cto` and `@cco` as separate entries. A message beginning with `@cto-suggest please do X` would match `@cto` before the loop could reach any more specific label. More critically, `@cco` (Chief Content/Compliance Officer) and `@ceo` are both in the table. A message starting with `@ceo...` would match `@ceo` correctly, but since JavaScript `for...of` over an object's entries has no guaranteed insertion-order specification (though V8 respects it in practice), this relies on V8's implementation detail rather than a spec guarantee.

Additionally, `CONNECTIONS.md §C` documents `@board` as a valid prefix routing to the Synthesizer, but `@board` is **absent** from `TELEGRAM_MENTION_TO_LABEL` in `routing.ts`. Messages starting with `@board` will fall through to the default `agent:ceo` routing.

**Evidence:** `routing.ts:153–164` — no `@board` entry. `index.ts:891–895` — `text.toLowerCase().startsWith(mention)` with no word-boundary check.

**What breaks on a real Tuesday:** Adam sends `@board Should we switch hosting?` intending to trigger the board-meeting Synthesizer. It silently routes to CEO instead (default fallback). Adam sees no error; the CEO fires and produces a different kind of output than expected. Adam has no visibility that `@board` was unrecognized.

---

### F7 [SEV:M] Haiku tier classifier is a HARD synchronous dependency — bridge hangs on Anthropic API timeout

**Location:** `infra/cloudflare-bridge/src/index.ts` lines 295–338, `classifyTierWithHaiku`; lines 673–680

**Issue:** The `classifyTierWithHaiku` function is called synchronously in the webhook-processing path when no tier label is present on the ticket. Cloudflare Workers have a 30-second CPU timeout for paid plans. The Anthropic API call inside `classifyTierWithHaiku` has no explicit timeout set. If the Anthropic API is slow (cold start, rate limit, partial outage), the Worker will block waiting for the API response. The fallback `return "lite"` is only reached via the `catch` block — it does NOT trigger on a slow/hanging response that hasn't failed yet. If the API takes 25 seconds to respond, the Worker eats 25 seconds of the 30-second CPU budget, leaving only 5 seconds for the DO lock, KV writes, audit_log write, and the `/fire` call.

Furthermore: when the tier classifier IS called, it means the ticket author didn't apply a `tier:*` label. This is the expected default case for most tickets — meaning this expensive API call is on the hot path for the majority of webhooks.

**Evidence:** `index.ts:313–326` — `const resp = await fetch(...)` with no `AbortSignal` or timeout. `index.ts:674–680` — classifier called in the Comment:created handler on every label-less ticket.

**What breaks on a real Tuesday:** Adam creates 5 tickets quickly, none with tier labels. All 5 webhook deliveries arrive nearly simultaneously. All 5 Workers make concurrent Anthropic API calls for tier classification. If Anthropic is under load, all 5 block. Some hit the 30-second Worker timeout, throwing unhandled errors, leaving partial state (audit_log fired row written, but DO lock never released because the error happened before `releaseLock`).

---

### F8 [SEV:M] C-suite Routines all share CEO's bearer token — token revocation kills CEO not just CTO

**Location:** `infra/cloudflare-bridge/src/routing.ts` lines 66–74

**Issue:** All 6 C-suite labels (`agent:cto`, `agent:cmo`, `agent:cpo`, `agent:cbo`, `agent:cco`, `agent:qa-lead`) map to `ROUTINE_CEO_ENTRY_POINT_TOKEN` with a `// TODO: add per-C-suite tokens when provisioned` comment. This means currently there is exactly ONE bearer token for all 7 routing paths (CEO + 6 C-suite). If the `runaway-watcher` revokes this token because one C-suite run goes over budget, it revokes the ability to fire ALL C-suite Routines AND the CEO Routine simultaneously. The token revocation is designed as a per-Routine kill switch; here it is a single point of failure for the entire agent fleet.

**Evidence:** `routing.ts:66–74` — all C-suite `ROUTINE_TOKEN_ENV_KEY` values set to `"ROUTINE_CEO_ENTRY_POINT_TOKEN"`.

**What breaks on a real Tuesday:** CTO Routine runs a heavy refactor, hits 1.2× the budget cap. `runaway-watcher` revokes `ROUTINE_CEO_ENTRY_POINT_TOKEN`. CEO, CMO, CPO, CBO, CCO, QA Lead are all now unfireable. Adam wakes up to a dead fleet. No alert is sent (per cost-alert philosophy: no Telegram for budget kills). He discovers it only when the next Linear webhook returns 401 from Anthropic.

---

### F9 [SEV:M] `signSpec` uses `JSON.stringify` with sorted keys — signature breaks on nested objects with non-string keys

**Location:** `infra/cloudflare-bridge/src/index.ts` lines 344–349, `signSpec`

**Issue:** `signSpec` calls `JSON.stringify(spec, Object.keys(spec).sort())`. The second argument to `JSON.stringify` as an array is a **replacer** — it specifies which top-level keys to include, not a key-sorting mechanism. It does NOT recursively sort nested object keys. The resulting JSON string can have different orderings for nested objects (`scope`, `budget`, `escalation`, `audit`, `issued_by`) depending on how they were constructed. Two specs with identical logical content but different nested-key insertion order will produce different HMAC signatures. The receiving Routine attempting to verify the signature will fail intermittently depending on how its JSON serializer orders keys. Additionally, the replacer array only includes top-level keys of the spec object at signing time — if the receiving agent adds or reorders nested keys before verification, the signature fails.

**Evidence:** `index.ts:347` — `const body = JSON.stringify(spec, Object.keys(spec).sort())` — `Object.keys(spec)` returns only top-level keys; nested keys in `scope`, `budget`, etc. are not sorted.

**What breaks on a real Tuesday:** A spec with `scope.constraints = ["a", "b"]` is signed. The receiving Routine reconstructs the spec from the parsed JSON payload and the `constraints` array comes back in a different order (e.g., if an intermediate layer re-serializes it). HMAC verification fails. Routine rejects the spec. A legitimate CEO-dispatched task is dropped with `rule_violation` in audit_log and no human-readable explanation.

---

### F10 [SEV:M] iOS Shortcut sends ANTHROPIC_API_KEY in plaintext JSON header — no HMAC on API key at rest in Shortcuts

**Location:** `infra/shortcuts/Capture-Beamix-Idea.shortcut.json` lines 56–63; `infra/shortcuts/README.md` lines 26–27

**Issue:** The Shortcut stores `YOUR_ANTHROPIC_API_KEY_HERE` as a hardcoded string inside the Shortcuts workflow file. The README instructs Adam to "replace `YOUR_ANTHROPIC_API_KEY_HERE` in the `x-api-key` header with your actual `ANTHROPIC_API_KEY`". Apple Shortcuts workflows are stored in iCloud and backed up to iCloud Drive by default. Any iCloud backup — personal iCloud, work MDM iCloud, or family sharing — contains the Shortcut with the API key embedded in plaintext. The `.shortcut.json` exported file also contains the key if exported and shared. Unlike Keychain (which Option B in the README suggests), the direct embedding is Option A's "Haiku-computed HMAC" approach but the current JSON has the key hardcoded as a literal string, not computed.

**Evidence:** `Capture-Beamix-Idea.shortcut.json:56–63` — `"string": "YOUR_ANTHROPIC_API_KEY_HERE"` — plaintext substitution target in the workflow's `x-api-key` header field. README says "replace ... with your actual ANTHROPIC_API_KEY".

**What breaks on a real Tuesday:** Adam exports the Shortcut to share it (or it syncs to his iCloud). The key is extracted from the iCloud backup. Attacker uses Adam's ANTHROPIC_API_KEY (Console-billed) to run API calls, burning through Adam's monthly budget. Since this is Console-billed (not subscription OAuth), costs accrue in Adam's account with no automatic revocation until Adam notices the spend.

---

### F11 [SEV:M] iOS Shortcut voice transcription failure produces zero user feedback before hitting the bridge

**Location:** `infra/shortcuts/Capture-Beamix-Idea.shortcut.json` steps 1–2 (dictation), steps 3–6 (Haiku parsing)

**Issue:** Step 1 (dictation) produces `RawDictation`. Step 2 stores it. Step 3 sends it to Haiku. There is no check between Steps 1 and 3 for whether dictation actually produced non-empty text. If Adam taps the Shortcut and says nothing, or if Siri dictation fails silently (returns empty string or an iOS error), `RawDictation` is empty or an error object. The Haiku prompt at Step 3 then sends `"Raw note: "` with nothing after it. Haiku may still return a JSON object with a blank title, or may produce an error response. If Haiku errors, Step 4 (`getvalueforkey content[0].text`) will attempt to extract from a non-200 response body (which is the Anthropic error JSON, not a message object). `TicketJSON` will be an error string, not the expected `{ "title": ..., "body": ... }` JSON. Step 6 assigns this directly to `RequestBody`. Step 7 POSTs it to the bridge. The bridge's `IdeaCaptureSchema` Zod validation will return 422, but the Shortcut still shows "Idea captured ✓" (Step 8 always shows success regardless of `BridgeResponse` content).

**Evidence:** `Capture-Beamix-Idea.shortcut.json:241–258` — Step 8 notification body is hardcoded `"Idea captured ✓"` regardless of `BridgeResponse` content. No conditional check. Steps 3–6 have no error branching.

**What breaks on a real Tuesday:** Adam uses the Shortcut while driving. Ambient noise causes dictation to fail. Shortcut shows "Idea captured ✓". Adam drives on, thinking the idea was saved. No ticket was created. Idea is lost. Adam discovers it hours later when checking Linear.

---

### F12 [SEV:M] `queueDelayedFire` sends the full trust spec (including `_signature`) to Inngest via Supabase Edge Functions — spec leaves the bridge security boundary

**Location:** `infra/cloudflare-bridge/src/index.ts` lines 984–1007, `queueDelayedFire`

**Issue:** When the daily fire cap is reached, the full `TrustSpec` object — including `_signature`, `budget`, `scope`, and `issued_by.linear_user_id` — is POSTed to Supabase Edge Functions (`/functions/v1/inngest`) with the `SUPABASE_SERVICE_ROLE_KEY` in the Authorization header. The Inngest event payload is stored by Inngest's cloud infrastructure for replay. This means: (1) the signed spec with all authorization fields is stored in a third-party service (Inngest) beyond the bridge's control, (2) the SUPABASE_SERVICE_ROLE_KEY is sent as an HTTP header to a Supabase Edge Function rather than an Inngest ingest key — this is an abuse of the service role key as a Supabase-to-Inngest auth mechanism, and (3) no TTL is set on this queued event beyond Inngest's own retention. The spec's `expires_at` may be 30 minutes, but the Inngest queue delay is `86400` seconds (1 day) — the spec will be delivered after it has expired, causing the receiving Routine to reject it as expired on replay.

**Evidence:** `index.ts:991–1006` — `body: JSON.stringify({ name: "bridge/delayed-fire", data: { spec, routing_label: routingLabel }, delay: 86400 })` — 1-day delay, spec's expires_at is 30 min (Quick tier). `index.ts:993` — `"Authorization": \`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}\`` — service role key used as Inngest ingest auth.

**What breaks on a real Tuesday:** Fire cap is hit at 11 AM. Queued spec has `expires_at` of 11:30 AM. Inngest replays it at 11 AM the NEXT day. Bridge fires the Routine. Routine validates `expires_at < now()` and rejects. `audit_log` gets an `anthropic_error` row. The queued task is silently lost with no retry. Adam sees nothing in Telegram. Ticket in Linear remains unprocessed.

---

### F13 [SEV:L] `/health` endpoint leaks operational state without authentication

**Location:** `infra/cloudflare-bridge/src/index.ts` lines 469–500, `handleHealth`; lines 424–427 (health bypass before pause check)

**Issue:** The `/health` endpoint returns `bridge_paused`, `linear_paused`, `kv_connected`, `do_connected` — operational state that reveals whether the bridge is currently soft-paused (i.e., experiencing an Anthropic outage) and whether KV/DO bindings are functional. This information is available without any authentication. Combined with an attacker knowing the bridge is paused, they can time attacks to coincide with the outage window (when the bridge will accept requests but not fire Routines). The health endpoint also bypasses the `bridge:paused` guard entirely (it runs before the pause check at line 429). This is correct for liveness monitoring, but the response exposes more state than a pure liveness check needs.

**Evidence:** `index.ts:424–427` — health check returned before pause guard. `index.ts:493–499` — response includes `bridge_paused` and `linear_paused` flags.

**What breaks on a real Tuesday:** An attacker polls `/health` every 30 seconds. Sees `bridge_paused: true`. Knows the Anthropic API is down. Times a social-engineering attempt on Adam during the outage window, knowing agents can't respond to validate requests. Low practical impact but information leakage is zero-cost to fix and the spec doesn't require unauthenticated health to return operational flags.

---

### F14 [SEV:L] Rotation script prints the new secret value to stdout in the terminal session

**Location:** `infra/cloudflare-bridge/scripts/rotate-bridge-hmac.ts` lines 114–116

**Issue:** The rotation script generates a new BRIDGE_HMAC_SECRET, then immediately prints: `"[rotate-bridge-hmac] Generated new BRIDGE_HMAC_SECRET (64 hex chars)."` followed by `"DO NOT log or share this value."` The script then instructs Adam (lines 156–164) to "paste the new secret value when prompted — it's in your terminal session above this script output." This means the secret value was just printed to stdout before the warning not to share it. Any terminal session logger, macOS Console, or screen-recording tool active at the time captures the value. The README (`README.md` lines 166–169) also references this workflow: the secret appears in the terminal before wrangler reads it.

**Evidence:** `rotate-bridge-hmac.ts:114` — `console.log(...)` on the line BEFORE the warning. `README.md:169` — instructs Adam to paste from terminal output.

**What breaks on a real Tuesday:** Adam runs the rotation script while sharing his screen during a call, or while using a terminal with logging enabled. The new BRIDGE_HMAC_SECRET appears in the shared view. Any agent-signed spec from the moment of rotation until the compromise is detected is forgeable.

---

### F15 [SEV:L] `buildTelegramSpec` hardcodes `issued_by.linear_user_id = chatId` — a Telegram chat ID used as a Linear user ID

**Location:** `infra/cloudflare-bridge/src/index.ts` lines 1040–1064, `buildTelegramSpec`

**Issue:** Telegram-sourced fires build a synthetic spec where `issued_by.linear_user_id` is set to the Telegram `chatId` (a numeric string like `"123456789"`). This value is then written to `audit_log.spec` and stored. The `issued_by.linear_user_id` field is supposed to be a Linear user ID for ALLOWED_ISSUERS validation. The Telegram path bypasses the ALLOWED_ISSUERS check entirely because `handleTelegram` does not perform an issuer validation — it only checks ADAM_TELEGRAM_CHAT_ID. In the audit trail, all Telegram-sourced fires appear with a Linear user ID that is actually a Telegram chat ID. Any downstream code or audit query that tries to look up this "linear_user_id" in Linear's API will get no results, making the audit trail misleading and breaking any Linear-based provenance chain.

**Evidence:** `index.ts:1049–1052` — `issued_by: { kind: "adam", linear_user_id: chatId }` — `chatId` is `String(msg.chat.id)` from the Telegram payload.

**What breaks on a real Tuesday:** Adam's /war-room dashboard tries to show "issued by Adam (BMX-101)" by looking up `linear_user_id` in Linear. The Telegram-sourced entries show a numeric string that Linear returns 404 for. War-room shows broken attribution. If a compliance audit asks "who authorized this Routine fire?", the answer is a Telegram chat ID, not a Linear user identity.

---

## Summary matrix

| # | Sev | Title |
|---|-----|-------|
| F1 | H | Shortcut HMAC over body-only — no timestamp/nonce — replay with no expiry |
| F2 | H | Issue:created (board-meeting) path skips both KV Layer 1 and DO Layer 2 dedup |
| F3 | H | DO alarm only scheduled for first lock — subsequent locks lose auto-release on crash |
| F4 | H | Fire-count KV guard non-atomic — concurrent bursts bypass the daily cap |
| F5 | H | `/telegram` endpoint has NO HMAC verification — unauthenticated fire via chat ID spoof |
| F6 | H | `@mention` prefix matching collides; `@board` missing from routing table |
| F7 | M | Haiku classifier has no timeout — hangs on hot path, eats Worker CPU budget |
| F8 | M | All C-suite routes share CEO bearer token — single revocation kills entire fleet |
| F9 | M | `signSpec` key-sort is top-level only — nested key order non-deterministic, HMAC flaky |
| F10 | M | API key hardcoded in Shortcut JSON — exposed in iCloud backups |
| F11 | M | Shortcut always shows "Idea captured ✓" regardless of transcription or bridge failure |
| F12 | M | `queueDelayedFire` sends expired spec to Inngest with 1-day delay; service role key misused |
| F13 | L | `/health` leaks pause/operational state without auth |
| F14 | L | Rotation script prints secret to stdout before the "don't share" warning |
| F15 | L | Telegram spec uses chat ID as `linear_user_id` — misleading audit trail |
