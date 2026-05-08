#!/usr/bin/env bash
# WS4 Smoke Test D — Concurrent Routine cap (queue or reject?)
# Cost ~$0.30, wall-clock ~5 min.
set -euo pipefail

if [[ -z "${SMOKE_TOKEN:-}" || -z "${FIRE_URL:-}" ]]; then
  echo "ERROR: Set SMOKE_TOKEN and FIRE_URL env vars first."
  echo "  export SMOKE_TOKEN=\"\$(cat ~/.smoke-test-token)\""
  echo "  export FIRE_URL=\"https://api.anthropic.com/v1/claude_code/routines/<id>/fire\""
  exit 1
fi

START_TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
TMPDIR=$(mktemp -d /tmp/smoke-d-XXXXXX)
echo "Test D — 6 simultaneous /fire calls"
echo "Started: $START_TS"
echo "Working dir: $TMPDIR"
echo

# Export so subshells see the values
export SMOKE_TOKEN FIRE_URL TMPDIR

seq 1 6 | xargs -n 1 -P 6 -I{} bash -c '
  i={}
  HTTP_CODE=$(curl -s -o "$TMPDIR/fire_$i.json" -w "%{http_code}" \
    -X POST "$FIRE_URL" \
    -H "Authorization: Bearer $SMOKE_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"trust_mode\":false,\"smoke_test\":true,\"concurrent\":$i}" || echo "000")
  echo "Fire $i — HTTP $HTTP_CODE"
  echo "$HTTP_CODE" > "$TMPDIR/code_$i.txt"
'

# Tally results
SUCCESS=0
RATE_LIMITED=0
OTHER=0
for i in $(seq 1 6); do
  CODE=$(cat "$TMPDIR/code_$i.txt" 2>/dev/null || echo "000")
  case "$CODE" in
    200|202) SUCCESS=$((SUCCESS+1)) ;;
    429) RATE_LIMITED=$((RATE_LIMITED+1)) ;;
    *) OTHER=$((OTHER+1)) ;;
  esac
done

END_TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
echo
echo "============================================="
echo "Test D Result"
echo "============================================="
echo "Started: $START_TS"
echo "Ended: $END_TS"
echo "Total parallel fires: 6"
echo "Successful (HTTP 200/202): $SUCCESS"
echo "Rate-limited (HTTP 429): $RATE_LIMITED"
echo "Other (HTTP 5xx, timeout): $OTHER"

if (( SUCCESS == 6 )); then
  echo "Verdict: PASS — Anthropic queues all 6. No bridge concurrency-limit needed."
elif (( RATE_LIMITED > 0 )); then
  echo "Verdict: FAIL — Anthropic rejects beyond N concurrent."
  echo "Mitigation: Bridge implements max_in_flight_routines=5 semaphore via Durable Object."
  echo "           Rejected fires queue via Inngest delayed event with 60s exponential backoff."
  exit 2
else
  echo "Verdict: WARN — investigate $OTHER 'other' responses (timeouts, 5xx)."
fi

echo
echo "Response files in $TMPDIR (delete after review)."
