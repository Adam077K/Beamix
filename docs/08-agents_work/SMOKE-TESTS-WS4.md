# WS4 Sub-Phase 0 — Smoke Tests

**Status:** READY — awaiting Adam execution. Scripts and procedures are below.
**Sequencing (Adam-locked 2026-05-08):** A + B run in background as 24h observation jobs — kick off first. C + D run synchronously (~35 min total) before bridge code commits.
**Cost cap:** ~$5 total ($0.50 + $0.50 + $2 + $0.30 + buffer).
**Constraint:** All four tests need Adam's Anthropic Console access + an active per-Routine bearer token. Adam must create one trivial bootstrap Routine in his Console before tests A/B/D can run. Test C (Mem0) needs Adam's `MEM0_API_KEY` (already provisioned per WS1A Phase 1).

**If a test FAILS:** halt the WS4 build, escalate to Adam with the specific mitigation listed below.

---

## Bootstrap — what Adam does first (~10 min, one time)

Before any smoke test runs, Adam creates a single test Routine in Anthropic Console:

1. **Anthropic Console → Routines → Create Routine.**
   - Name: `smoke-test-routine`
   - Model: `claude-haiku-4-5` (cheapest)
   - System prompt: a one-liner: `You are a smoke-test harness. When invoked, write a single line "alive at <timestamp>" to your audit log via the Linear MCP, then terminate. Do not call any other tools. Do not produce more than 50 tokens of output.`
   - MCP grants: only `linear` (or none if you prefer; the Routine doesn't need to actually write — the test only cares about whether `/fire` accepts/rejects the call)
   - Schedule: leave unscheduled (we'll fire ad-hoc for Test B; we'll add a cron schedule manually for Test A).
2. **Generate a per-Routine bearer token** for `smoke-test-routine`. Copy the value to a temp file (e.g., `~/.smoke-test-token`, NOT in any repo, never committed). The token is referenced as `$SMOKE_TOKEN` below.
3. **Identify the `/fire` endpoint URL** for this Routine — it's typically `https://api.anthropic.com/v1/claude_code/routines/{routine_id}/fire` per Anthropic Routines docs. Replace `{routine_id}` with the test Routine's ID. Reference as `$FIRE_URL` below.
4. **Identify the project URL** for the Console (so you can read the Routine's run history). Reference as `$CONSOLE_URL` below.

After bootstrap: tests A/B/D can fire against `smoke-test-routine`. Test C is independent of this bootstrap.

---

## Test A — Cron Routine exemption from 15/day `/fire` cap

**Question:** Do scheduled (cron) Routines count against the 15-fires-per-day cap on Max 5×, or are they exempt?

**If exempt:** war-room budget holds — no Max plan upgrade needed for the 10 standing Routines.
**If NOT exempt:** the 10 standing Routines (3-7 cron fires/day combined) plus ad-hoc fires (~5-8/day) blow through the 15/day cap on busy days. Mitigation: upgrade Max 5× → Max 20× ($200/mo, ~60/day cap).

**Mechanism:**
1. In Anthropic Console, set `smoke-test-routine` to a cron schedule that fires every 90 minutes (16 fires across 24h: 00:00, 01:30, 03:00, ..., 22:30).
2. Let it run for 24 hours. Check the Console's Routine run history every 6 hours.
3. **If all 16 fires succeed:** cron Routines are exempt. PASS.
4. **If the 16th fire (or any fire after the 15th) returns HTTP 429 with `Retry-After`:** cron Routines DO count. FAIL. Mitigation = Max 20× upgrade.

**Result template (Adam fills in after 24h):**

```
Test A — Cron Routine exemption from 15/day cap
Started: <YYYY-MM-DDTHH:MM:SSZ>
Ended: <YYYY-MM-DDTHH:MM:SSZ>
Fires scheduled: 16
Fires successful: <N>
Fires that returned 429: <N>
Verdict: [PASS|FAIL]
If FAIL — first 429 occurred on fire #: <N>
If FAIL — Retry-After value: <seconds>
```

After test: turn off `smoke-test-routine`'s cron schedule (else it keeps consuming budget).

---

## Test B — `/fire` cap behavior on burst (Retry-After granularity)

**Question:** When the 16th `/fire` call hits in 24h, what does the response look like? Specifically, what's the `Retry-After` granularity?

**If short (e.g., 60 seconds):** the bridge will queue via Inngest delayed event and recover seamlessly.
**If long (e.g., until midnight UTC):** bridge needs hard rate-limiting + Adam-ping; document in failure modes.

**Mechanism:** Run this bash script. It fires 16 ad-hoc `/fire` calls in rapid succession (within minutes) to force the cap. Reads the 16th response.

```bash
#!/usr/bin/env bash
# Test B — burst /fire calls
set -euo pipefail

if [[ -z "${SMOKE_TOKEN:-}" || -z "${FIRE_URL:-}" ]]; then
  echo "Set SMOKE_TOKEN and FIRE_URL env vars first."
  exit 1
fi

echo "Test B — firing 16 calls back-to-back, expecting 429 around the 16th"
for i in $(seq 1 16); do
  echo "--- Fire #$i ---"
  HTTP_CODE=$(curl -s -o /tmp/fire_resp_$i.json -w "%{http_code}" \
    -X POST "$FIRE_URL" \
    -H "Authorization: Bearer $SMOKE_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"trust_mode":false,"smoke_test":true,"fire_index":'$i'}')
  echo "HTTP $HTTP_CODE"
  if [[ "$HTTP_CODE" == "429" ]]; then
    echo "Got 429 on fire #$i"
    echo "Headers:"
    curl -s -D - -o /dev/null \
      -X POST "$FIRE_URL" \
      -H "Authorization: Bearer $SMOKE_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"trust_mode":false,"smoke_test":true}' | grep -i "retry-after"
    break
  fi
  sleep 2
done

echo "Done."
```

**Result template:**

```
Test B — /fire cap behavior on burst
Started: <YYYY-MM-DDTHH:MM:SSZ>
Total fires before 429: <N>
Retry-After value (seconds): <N>
Retry-After granularity: [seconds | minutes | hours | midnight UTC]
Verdict: [PASS|FAIL]
Mitigation if FAIL — long Retry-After: bridge implements hard rate-limit logic + Telegram-ping Adam if cap hit twice in same day.
```

**If `Retry-After` is until next midnight (UTC or local):** FAIL. Bridge needs to track day-bucket count and reject fires before they hit `/fire`. Document this in `infra/cloudflare-bridge/src/index.ts` as a rate-limit guard.

---

## Test C — Mem0 MCP under sustained load (issue #3400 reproduction)

**Question:** Does `mcp.mem0.ai/mcp` survive 40 round-trips without the issue #3400 degradation pattern?

**If stable:** Mem0 cloud Phase 1 confirmed; all Routines retain `mem0` MCP grant.
**If unstable:** Routines fall back inline to Anthropic Memory Tool (per `mem0-outage.md` and ORCHESTRATION.md errata 4); §2E MCP grants unchanged but Routine system prompts include the try/catch wrapper.

**Mechanism:** Run this bash script. It exercises 40 write/read cycles against Mem0 cloud. Watches for retrieval quality drop or sustained errors after ~40 iterations.

```bash
#!/usr/bin/env bash
# Test C — Mem0 MCP 40 round-trips
set -euo pipefail

if [[ -z "${MEM0_API_KEY:-}" ]]; then
  echo "Set MEM0_API_KEY env var first."
  exit 1
fi

MEM0_URL="https://mcp.mem0.ai/mcp"
USER_ID="smoke-test-$(date +%s)"
ERRORS=0

echo "Test C — 40 Mem0 write/read round-trips"
for i in $(seq 1 40); do
  WRITE_PAYLOAD='{"messages":[{"role":"user","content":"smoke memory item '$i'"}],"user_id":"'$USER_ID'"}'
  WRITE_RESP=$(curl -s -w "\n%{http_code}" -X POST "$MEM0_URL/v1/memories/" \
    -H "Authorization: Token $MEM0_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$WRITE_PAYLOAD" || echo "ERROR\n0")
  WRITE_CODE=$(echo "$WRITE_RESP" | tail -1)

  if [[ "$WRITE_CODE" != "201" && "$WRITE_CODE" != "200" ]]; then
    echo "Iteration $i — WRITE failed ($WRITE_CODE)"
    ERRORS=$((ERRORS+1))
  fi

  READ_RESP=$(curl -s -w "\n%{http_code}" -X GET "$MEM0_URL/v1/memories/?user_id=$USER_ID" \
    -H "Authorization: Token $MEM0_API_KEY" || echo "ERROR\n0")
  READ_CODE=$(echo "$READ_RESP" | tail -1)

  if [[ "$READ_CODE" != "200" ]]; then
    echo "Iteration $i — READ failed ($READ_CODE)"
    ERRORS=$((ERRORS+1))
  fi

  echo -n "."
  if (( i % 10 == 0 )); then echo " [$i/40]"; fi
done

echo
echo "Total errors over 40 round-trips: $ERRORS"
if (( ERRORS > 5 )); then
  echo "FAIL — exceeded 5-error threshold."
else
  echo "PASS"
fi
```

**Result template:**

```
Test C — Mem0 MCP 40 round-trips
Started: <YYYY-MM-DDTHH:MM:SSZ>
Total iterations: 40
Errors: <N>
Verdict: [PASS|FAIL]
Mitigation if FAIL: Routines fall back to Anthropic Memory Tool inline (per mem0-outage.md). MCP grants unchanged. WS1F Phase 2 OSS migration acceleration considered.
```

**Note:** If Mem0's actual API endpoints differ from `/v1/memories/` shown above, Adam adjusts the script. The Mem0 docs at `https://docs.mem0.ai` are the source of truth.

---

## Test D — Concurrent Routine cap (queue or reject?)

**Question:** When 6 Routines fire simultaneously via `/fire`, does Anthropic queue the 6th or reject it with HTTP 429?

**If queue:** Full-tier fan-outs (CEO + 3-5 C-suite + Synthesizer) work as designed.
**If reject:** Cloudflare bridge needs concurrency-limit logic before `/fire`; max in-flight Routines configured.

**Mechanism:** Fire 6 `/fire` calls in parallel via `xargs -P 6` (or curl `&` background). Observe response codes.

```bash
#!/usr/bin/env bash
# Test D — concurrent Routine cap
set -euo pipefail

if [[ -z "${SMOKE_TOKEN:-}" || -z "${FIRE_URL:-}" ]]; then
  echo "Set SMOKE_TOKEN and FIRE_URL env vars first."
  exit 1
fi

echo "Test D — 6 simultaneous /fire calls"
seq 1 6 | xargs -n 1 -P 6 -I{} bash -c '
  echo "Fire {} starting"
  curl -s -o /tmp/fire_d_{}.json -w "Fire {} HTTP %{http_code}\n" \
    -X POST "$FIRE_URL" \
    -H "Authorization: Bearer $SMOKE_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"trust_mode\":false,\"smoke_test\":true,\"concurrent\":{}}"
'

echo
echo "Inspect /tmp/fire_d_*.json for response details."
```

**Result template:**

```
Test D — Concurrent Routine cap
Started: <YYYY-MM-DDTHH:MM:SSZ>
Total parallel fires: 6
Successful (HTTP 200/202): <N>
Rejected (HTTP 429): <N>
Other (HTTP 5xx, timeout): <N>
Verdict: [PASS — queues | FAIL — rejects above N]
Mitigation if FAIL: Cloudflare bridge implements `max_in_flight_routines` semaphore; rejects beyond limit get queued via Inngest delayed event.
```

---

## Cleanup after all tests

1. Delete the `smoke-test-routine` from Anthropic Console (or leave it disabled — costs nothing if unscheduled).
2. Revoke the `$SMOKE_TOKEN` bearer token from Console.
3. Delete `~/.smoke-test-token` and `/tmp/fire_*.json`.
4. Append all 4 results to this file in the **Results** section below.

---

## Results (filled in by Adam after execution)

```
Test A: <PENDING — kick off cron schedule, observe 24h>
Test B: <PENDING>
Test C: <PENDING>
Test D: <PENDING>
```

---

## What WS4 build does with the results

| Test | If PASS | If FAIL |
|---|---|---|
| **A** | No bridge changes; cron Routines documented as exempt. | Adam upgrades to Max 20× ($200/mo). Bridge unchanged. Update `docs/07-history/runbooks/anthropic-outage.md` decision tree to reflect ~60/day cap. |
| **B** | Bridge implements simple Inngest delayed-event re-fire on 429. | Bridge implements per-day-bucket hard rate-limit guard before any `/fire` call. If projected day-bucket exceeded, queue immediately to Inngest delayed event for next-day fire AND send P1 Telegram system-status alert (NOT cost alert — this is operational saturation). |
| **C** | All 10 Routines retain `mem0` MCP grant unconditionally. | Routine system prompt template (WS6) includes try/catch around Mem0 calls with inline Anthropic Memory Tool fallback. ORCHESTRATION.md errata 4 already documents this fallback as the design. Update `mem0-outage.md` recovery step to clarify that Phase 1 Mem0 cloud is unstable and Phase 2 OSS migration is accelerated. |
| **D** | Bridge has no concurrency-limit logic; Anthropic handles queueing. | Bridge implements `max_in_flight_routines = 5` semaphore via Cloudflare Durable Object counter; rejected fires queue via Inngest delayed event with 60s exponential backoff. |

---

## Adam: shortest path to running these

1. Bootstrap: ~10 min in Anthropic Console (create test Routine, generate token).
2. Test A: kick off the cron schedule; come back in 24h.
3. Test B: 5 min (run script with token).
4. Test C: 30 min (run script with Mem0 API key).
5. Test D: 5 min (run script with token).
6. Tests B + C + D can run in any order. A is the long-tail.

Total Adam time-on-keyboard: ~50 min (mostly script invocations).
Total wall-clock: 24h (gated on Test A).

WS4 build proceeds in parallel with Test A's 24h window per Adam's plan-Q-2 sequencing.
