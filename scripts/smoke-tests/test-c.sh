#!/usr/bin/env bash
# WS4 Smoke Test C — Mem0 MCP under sustained load (issue #3400 reproduction)
# Cost ~$2 (40 round-trips × Mem0 free tier or $0.05 per write on paid).
# Wall-clock ~30 min.
set -euo pipefail

if [[ -z "${MEM0_API_KEY:-}" ]]; then
  echo "ERROR: Set MEM0_API_KEY env var first."
  echo "  export MEM0_API_KEY=\"<your-mem0-cloud-api-key>\""
  exit 1
fi

MEM0_BASE="${MEM0_BASE:-https://api.mem0.ai}"
USER_ID="smoke-test-$(date +%s)"
ITERS="${MEM0_ITERS:-40}"
ERRORS=0
START_TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)

echo "Test C — Mem0 MCP $ITERS round-trips"
echo "Started: $START_TS"
echo "User ID: $USER_ID"
echo "Base URL: $MEM0_BASE"
echo

for i in $(seq 1 "$ITERS"); do
  WRITE_PAYLOAD='{"messages":[{"role":"user","content":"smoke memory item '"$i"'"}],"user_id":"'"$USER_ID"'"}'
  WRITE_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$MEM0_BASE/v1/memories/" \
    -H "Authorization: Token $MEM0_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$WRITE_PAYLOAD" || echo "000")

  if [[ "$WRITE_CODE" != "201" && "$WRITE_CODE" != "200" ]]; then
    echo
    echo "Iteration $i — WRITE failed (HTTP $WRITE_CODE)"
    ERRORS=$((ERRORS+1))
  fi

  READ_CODE=$(curl -s -o /dev/null -w "%{http_code}" -G "$MEM0_BASE/v1/memories/" \
    --data-urlencode "user_id=$USER_ID" \
    -H "Authorization: Token $MEM0_API_KEY" || echo "000")

  if [[ "$READ_CODE" != "200" ]]; then
    echo
    echo "Iteration $i — READ failed (HTTP $READ_CODE)"
    ERRORS=$((ERRORS+1))
  fi

  echo -n "."
  if (( i % 10 == 0 )); then echo " [$i/$ITERS]"; fi
done

END_TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
echo
echo "============================================="
echo "Test C Result"
echo "============================================="
echo "Started: $START_TS"
echo "Ended: $END_TS"
echo "Iterations: $ITERS"
echo "Errors: $ERRORS"
if (( ERRORS > 5 )); then
  echo "Verdict: FAIL — exceeded 5-error threshold."
  echo "Mitigation: WS6 Routine prompts include Mem0 → Anthropic Memory Tool fallback."
  echo "           Document failure in mem0-outage.md. Phase 2 OSS migration accelerated."
  exit 2
else
  echo "Verdict: PASS"
  echo "Mem0 cloud Phase 1 confirmed stable under sustained load."
fi
