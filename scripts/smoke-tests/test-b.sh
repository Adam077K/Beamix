#!/usr/bin/env bash
# WS4 Smoke Test B — /fire cap behavior on burst (Retry-After granularity)
# Cost ~$0.50, wall-clock ~5 min.
set -euo pipefail

if [[ -z "${SMOKE_TOKEN:-}" || -z "${FIRE_URL:-}" ]]; then
  echo "ERROR: Set SMOKE_TOKEN and FIRE_URL env vars first."
  echo "  export SMOKE_TOKEN=\"\$(cat ~/.smoke-test-token)\""
  echo "  export FIRE_URL=\"https://api.anthropic.com/v1/claude_code/routines/<id>/fire\""
  exit 1
fi

START_TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
TMPDIR=$(mktemp -d /tmp/smoke-b-XXXXXX)
echo "Test B — burst /fire calls, expecting 429 around the 16th"
echo "Started: $START_TS"
echo "Working dir: $TMPDIR"
echo

FIRST_429=""
RETRY_AFTER=""

for i in $(seq 1 16); do
  echo "--- Fire #$i ---"
  HTTP_CODE=$(curl -s -o "$TMPDIR/fire_$i.json" -w "%{http_code}" \
    -X POST "$FIRE_URL" \
    -H "Authorization: Bearer $SMOKE_TOKEN" \
    -H "anthropic-version: 2023-06-01" \
    -H "anthropic-beta: experimental-cc-routine-2026-04-01" \
    -H "Content-Type: application/json" \
    -d '{"text":"smoke test fire #'"$i"'"}' || echo "000")
  echo "HTTP $HTTP_CODE"
  if [[ "$HTTP_CODE" == "429" && -z "$FIRST_429" ]]; then
    FIRST_429="$i"
    # Re-fire to capture headers cleanly
    RETRY_AFTER=$(curl -s -D - -o /dev/null \
      -X POST "$FIRE_URL" \
      -H "Authorization: Bearer $SMOKE_TOKEN" \
      -H "anthropic-version: 2023-06-01" \
      -H "anthropic-beta: experimental-cc-routine-2026-04-01" \
      -H "Content-Type: application/json" \
      -d '{"text":"smoke test header probe"}' \
      | grep -i "retry-after" | awk '{print $2}' | tr -d '\r' || echo "missing")
    echo "Retry-After header value: $RETRY_AFTER"
    break
  fi
  sleep 2
done

END_TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
echo
echo "============================================="
echo "Test B Result"
echo "============================================="
echo "Started: $START_TS"
echo "Ended: $END_TS"
if [[ -n "$FIRST_429" ]]; then
  echo "First 429 on fire #$FIRST_429"
  echo "Retry-After: $RETRY_AFTER"
  if [[ "$FIRST_429" -ge "16" ]]; then
    echo "Verdict: PASS — cap behavior matches expected (15/day limit hit at fire 16)."
  else
    echo "Verdict: WARN — cap hit earlier than expected at fire #$FIRST_429. Investigate."
  fi
  if [[ "$RETRY_AFTER" =~ ^[0-9]+$ ]]; then
    if (( RETRY_AFTER < 3600 )); then
      echo "Granularity: SHORT (< 1h). Bridge can recover via Inngest delayed event. PASS."
    elif (( RETRY_AFTER < 86400 )); then
      echo "Granularity: MEDIUM (< 1d). Bridge may need hard rate-limit guard."
    else
      echo "Granularity: LONG (≥ 1d / next midnight). Bridge MUST implement hard rate-limit + Telegram-ping. FAIL — escalate to CEO."
    fi
  else
    echo "Could not parse Retry-After value '$RETRY_AFTER'. Investigate manually."
  fi
else
  echo "All 16 fires succeeded. No 429 hit. Either cap is higher than 15/day OR test was queued."
  echo "Verdict: WARN — re-run test, possibly increment fire count to 20."
fi
echo
echo "Response files in $TMPDIR (delete after review)."
