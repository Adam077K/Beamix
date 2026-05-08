# WS4 Smoke Tests — Runner

**Reference:** `docs/08-agents_work/SMOKE-TESTS-WS4.md` for full context.
**Sequence locked:** A + B = background 24h. C + D = synchronous (~35 min). Then proceed.

## Prerequisites

Before running ANY test, complete steps 1-9 of `docs/08-agents_work/ADAM-CHECKLIST-WS4-DEPLOY.md`. At minimum:

- Anthropic Console smoke-test-routine provisioned (Step 5 Routine B).
- `~/.smoke-test-token` exists with bearer.
- `MEM0_API_KEY` in env.

## Quick start

```bash
# One-time: make scripts executable
cd scripts/smoke-tests
chmod +x test-b.sh test-c.sh test-d.sh

# Set env vars (paste from your secrets store)
export SMOKE_TOKEN="$(cat ~/.smoke-test-token)"
export FIRE_URL="https://api.anthropic.com/v1/claude_code/routines/<smoke-routine-id>/fire"
export MEM0_API_KEY="<your-mem0-key>"

# Test C — runs first (independent of Anthropic; ~30 min)
./test-c.sh > results-c.log 2>&1

# Test B — needs SMOKE_TOKEN + FIRE_URL (~5 min)
./test-b.sh > results-b.log 2>&1

# Test D — needs SMOKE_TOKEN + FIRE_URL (~5 min)
./test-d.sh > results-d.log 2>&1

# Test A — 24h observation. Set the smoke-test-routine to fire every 90 min in Anthropic Console.
# Come back in 24h. See test-a.md.
```

## Reading results

After each script: open the corresponding `results-<x>.log`. Last lines show PASS/FAIL.

Append final results to `docs/08-agents_work/SMOKE-TESTS-WS4.md` "Results" section + ping CEO chat.

## What CEO does with results

| Result | CEO action |
|---|---|
| All 4 PASS | Confirm in chat, proceed to WS5. |
| Test A FAIL | Recommend Max 20× upgrade ($200/mo). Wait for Adam decision. |
| Test B FAIL | Add hard rate-limit guard to bridge before commits. ~$3 work. |
| Test C FAIL | WS6 Routine prompts include Mem0 → Memory Tool fallback. Document in mem0-outage.md. |
| Test D FAIL | Bridge gets `max_in_flight_routines=5` semaphore via Durable Object. ~$5 work. |
