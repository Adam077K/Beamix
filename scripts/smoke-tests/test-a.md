# Test A — Cron Routine exemption from 15/day cap

**Why this matters:** confirms whether the 10 standing Routines (cron-scheduled) count against your 15/day Max 5× cap. If they don't, you stay on Max 5× ($100/mo). If they do, you upgrade to Max 20× ($200/mo).

**Wall-clock:** 24 hours.
**Cost:** ~$0.50 (16 trivial fires × $0.03).

## Setup (5 min)

1. Open [https://console.anthropic.com](https://console.anthropic.com) → Routines → `smoke-test-routine` (provisioned in Adam-checklist Step 5 Routine B).
2. Edit Routine → add cron schedule.
3. **Schedule:** set to fire every 90 minutes. If Anthropic Console accepts cron syntax: `0 */1 * * *` (hourly) is the closest standard option — adjust to "every 90 min" if their UI supports it. If they only support hourly, use hourly: that's 24 fires/24h, more than enough to hit the 15/day cap.
4. Note the start time. Save.

## Observation (4 check-ins over 24h)

Every 6 hours, open Anthropic Console → `smoke-test-routine` → Run history.

Record:
- Total fires attempted
- Successful (HTTP 200/202)
- Rate-limited (HTTP 429)
- First 429 occurrence (which fire #)

## After 24h — fill in results

Edit `docs/08-agents_work/SMOKE-TESTS-WS4.md` Results section:

```
Test A — Cron Routine exemption from 15/day cap
Started: <YYYY-MM-DDTHH:MM:SSZ>
Ended: <YYYY-MM-DDTHH:MM:SSZ>
Fires scheduled: 16 (or 24 if hourly)
Fires successful: <N>
Fires that returned 429: <N>
Verdict: [PASS|FAIL]
If FAIL — first 429 occurred on fire #: <N>
If FAIL — Retry-After value: <seconds>
```

## Cleanup

In Anthropic Console → `smoke-test-routine` → remove cron schedule (else it keeps consuming budget at $0.03 × 16/day = $0.50/day = $15/mo waste).

## Decision tree

| Verdict | Action |
|---|---|
| PASS — all fires succeeded | Cron Routines are exempt. War room budget holds. Proceed. |
| FAIL — 429 on fire 16 (or whichever) | Cron Routines DO count. Adam decides: upgrade Max 5× → Max 20× ($200/mo) OR cut cron Routine count from 5 (Morning Digest, EOD Sync, Auto-Unblock, Monday Standup, Friday Retro) to 2 (Morning Digest, EOD Sync only). |
