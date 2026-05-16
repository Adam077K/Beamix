---
title: Adam Checklist — WS6 Provisioning
date: 2026-05-13
status: ready — execute when you say "go provision"
owner: Adam (the only person who can click in claude.ai + run wrangler)
estimated_clock: 2-4 hours of click-throughs + token pastes
---

# WS6 Provisioning Checklist — 11 New Routines + Bridge Re-deploy

Everything in this list is **Adam-action** (click-throughs in claude.ai, terminal `wrangler` commands, cron config in Anthropic Console). All code work is already done on `feat/ws6-routine-mds` and pushed to GitHub PR #72.

**Cost projection after provisioning:** ~$170/mo Max-quota Routine spend (per `ROUTINE-ROSTER.md`). No incremental API billing unless Max 5× quota fills up.

---

## Step 0 — Pre-flight (5 min)

```bash
cd /Users/adamks/VibeCoding/Beamix/.worktrees/ws6-1-1778515143
# Confirm you're on the WS6 branch
git status   # → on branch feat/ws6-routine-mds, clean
git log --oneline -3   # latest commits visible

# Confirm bridge env is reachable
cd infra/cloudflare-bridge
wrangler secret list | wc -l   # should be at least 12 (legacy + WS4 secrets)
```

## Step 1 — Provision 11 new Anthropic Routines in claude.ai (60-90 min)

Each new Routine = ~5 minutes of clicks. Provision in this order (priority for daily fires first):

### 1.1 Daily fire Routines (9 total)

For each Routine below: go to **claude.ai → Settings → Claude Code → Routines → New Routine**. Fill in:
- **Name:** as shown
- **Description:** copy first paragraph from the .md file (`.claude/agents/war-room/<filename>`)
- **Trigger:** API (not scheduled — bridge fires via `/fire` endpoint)
- **System prompt:** paste the body of the .md file from `## Role` through `## Fire signal`
- **Model:** as shown
- **Beta header reminder:** all fires require `anthropic-beta: experimental-cc-routine-2026-04-01` (bridge already sets this)

After creating each, you'll see two values on the Routine details page:
- **Routine ID** (starts with `trig_...`)
- **Token** (sk-ant-oat01-...)

Capture both in a temp file (`/tmp/ws6-tokens.txt`) — you'll need them in Step 2.

| # | Routine | Filename | Model | Schedule |
|---|---|---|---|---|
| 1.1.1 | Advisor Daily Thinking | `advisor-daily-thinking.md` | claude-opus-4-7 | daily 05:30 |
| 1.1.2 | Morning Digest | `morning-digest.md` | claude-sonnet-4-6 | Tue-Fri 05:35 |
| 1.1.3 | Competitor Pulse | `competitor-pulse.md` | claude-sonnet-4-6 | daily 05:40 |
| 1.1.4 | GEO Algorithm Signal | `geo-algorithm-signal.md` | claude-opus-4-7 | Sun 10:30 |
| 1.1.5 | CTO Daily Plan | `cto-daily-plan.md` | claude-opus-4-7 | daily 10:30 |
| 1.1.6 | Content Idea Generator | `content-idea-generator.md` | claude-sonnet-4-6 | daily 10:35 |
| 1.1.7 | Monday Standup | `monday-standup.md` | claude-sonnet-4-6 | Mon 10:40 |
| 1.1.8 | Friday Retro | `friday-retro.md` | claude-sonnet-4-6 | Fri 15:30 |
| 1.1.9 | EOD Sync | `eod-sync.md` | claude-sonnet-4-6 | daily 20:30 |
| 1.1.10 | Security Watcher | `security-watcher.md` | claude-sonnet-4-6 | daily 20:45 |

### 1.2 Event-triggered Routines (2 total — no cron in Console)

| # | Routine | Filename | Model | Trigger |
|---|---|---|---|---|
| 1.2.1 | Auto-Unblock | `auto-unblock.md` | claude-sonnet-4-6 | Inngest `routine.timeout` / `worker.stuck` (bridge fires) |
| 1.2.2 | Synthesizer | `synthesizer.md` | claude-opus-4-7 | `@board` Linear comment OR `agent:synthesizer` label (bridge fires) |

**Pacing rule:** create at most 1 Routine per 2 minutes. claude.ai rate-limits new Routine creation.

After all 11 provisioned: you should see **12 total Routines** in your claude.ai dashboard (CEO Entry Point from WS4 + 11 new).

## Step 2 — Set 22 wrangler secrets (30-45 min)

For each of the 11 new Routines, set BOTH the ID and the TOKEN as wrangler secrets on the bridge worker. The bridge reads these env-driven (no hardcoding).

```bash
cd /Users/adamks/VibeCoding/Beamix/.worktrees/ws6-1-1778515143/infra/cloudflare-bridge

# Pattern (do this 22 times — once per ID, once per TOKEN):
echo -n "<paste trig_id here>" > /tmp/secret-value.txt
wrangler secret put ROUTINE_<NAME>_ID < /tmp/secret-value.txt
rm /tmp/secret-value.txt    # always clean up

# Repeat for token:
echo -n "<paste sk-ant-oat01-...>" > /tmp/secret-value.txt
wrangler secret put ROUTINE_<NAME>_TOKEN < /tmp/secret-value.txt
rm /tmp/secret-value.txt
```

### Exact env var names (22 total — case-sensitive)

| Routine | ID env var | TOKEN env var |
|---|---|---|
| Advisor Daily Thinking | `ROUTINE_ADVISOR_DAILY_THINKING_ID` | `ROUTINE_ADVISOR_DAILY_THINKING_TOKEN` |
| Morning Digest | `ROUTINE_MORNING_DIGEST_ID` | `ROUTINE_MORNING_DIGEST_TOKEN` |
| Competitor Pulse | `ROUTINE_COMPETITOR_PULSE_ID` | `ROUTINE_COMPETITOR_PULSE_TOKEN` |
| GEO Algorithm Signal | `ROUTINE_GEO_ALGORITHM_SIGNAL_ID` | `ROUTINE_GEO_ALGORITHM_SIGNAL_TOKEN` |
| CTO Daily Plan | `ROUTINE_CTO_DAILY_PLAN_ID` | `ROUTINE_CTO_DAILY_PLAN_TOKEN` |
| Content Idea Generator | `ROUTINE_CONTENT_IDEA_GENERATOR_ID` | `ROUTINE_CONTENT_IDEA_GENERATOR_TOKEN` |
| Monday Standup | `ROUTINE_MONDAY_STANDUP_ID` | `ROUTINE_MONDAY_STANDUP_TOKEN` |
| Friday Retro | `ROUTINE_FRIDAY_RETRO_ID` | `ROUTINE_FRIDAY_RETRO_TOKEN` |
| EOD Sync | `ROUTINE_EOD_SYNC_ID` | `ROUTINE_EOD_SYNC_TOKEN` |
| Security Watcher | `ROUTINE_SECURITY_WATCHER_ID` | `ROUTINE_SECURITY_WATCHER_TOKEN` |
| Auto-Unblock | `ROUTINE_AUTO_UNBLOCK_ID` | `ROUTINE_AUTO_UNBLOCK_TOKEN` |
| Synthesizer | `ROUTINE_SYNTHESIZER_ID` | `ROUTINE_SYNTHESIZER_TOKEN` |

**Verify:**
```bash
wrangler secret list | grep ROUTINE_ | wc -l
# Expected: 22 (the 11 × 2) — plus 2 legacy CEO_ENTRY_POINT secrets from WS4 = up to 24 total
```

## Step 3 — Deploy bridge (2 min)

```bash
cd /Users/adamks/VibeCoding/Beamix/.worktrees/ws6-1-1778515143/infra/cloudflare-bridge
wrangler deploy
# Confirm: deployed to https://beamix-bridge.<YOUR_CF_ACCOUNT>.workers.dev
# Note the new Version ID — write it down
```

## Step 4 — Configure cron schedules in Anthropic Console (15 min)

For each daily/weekly Routine (the 10 in Step 1.1), open the Routine in claude.ai and set the cron trigger to the time listed in Step 1.1. claude.ai schedules in UTC by default — Adam's local IL time is UTC+3 (UTC+2 in winter).

**Important:** make sure schedules are set to UTC times. Roster 05:30 IL means **02:30 UTC** in summer, **03:30 UTC** in winter. Adjust each cron individually.

**Tip:** for Routines that should only fire on certain days (Monday Standup, Friday Retro, GEO Sunday), set the cron in Anthropic Console accordingly. The .md `schedule` field is the source-of-truth for what the cron string should be.

## Step 5 — Smoke fire test (15 min)

Verify each of the 11 new Routines fires successfully end-to-end. For each Routine:

1. Open Linear → create a new test ticket
2. Add ONE of the agent labels: `agent:advisor`, `agent:morning-digest`, `agent:competitor-pulse`, etc. (use the label that matches the Routine you're testing)
3. Save the ticket
4. Within 10 seconds: check `audit_log` in Supabase via the dashboard SQL editor:
   ```sql
   SELECT created_at, agent, status, row_kind, linear_ticket, nonce
   FROM audit_log
   WHERE created_at > NOW() - INTERVAL '5 minutes'
   ORDER BY created_at DESC
   LIMIT 10;
   ```
5. You should see:
   - `status='fired'` (bridge wrote on dispatch)
   - `status='accepted'` (Routine acknowledged)
   - terminal status within ~10 min (`linear_comment_posted`, `completed`, etc.)

If any Routine fails at any of these steps, capture the bridge logs:
```bash
wrangler tail beamix-bridge
```
And let CEO know which Routine + the error.

## Step 6 — Test the @board flow (5 min)

The Synthesizer Routine fires when you mention `@board` in a Linear comment. To test:

1. Create a Linear ticket "Test board meeting — should we add feature X?"
2. Post a comment: `@board — let's discuss this`
3. Within 10 seconds the bridge should fire Synthesizer (check audit_log for `agent:synthesizer` row)
4. Synthesizer should spawn 4 personas via Task tool in `round_sequence` order (visionary → architect → strategist → aria) over 5-15 min
5. Final output: Linear comment with locked decision JSON + DECISIONS.md update via Supabase

If Synthesizer fires but personas don't spawn: that's expected on first run — the personas exist as .md scaffolds but Synthesizer needs to actually invoke them via Task. The system prompt is correct but the Task spawning requires Synthesizer to be running in a Claude session with Task tool access (not pure Routine fire). **Discuss with CEO if behavior is unexpected.**

## Step 7 — Verify routing.ts cleanup is live (2 min)

After deploy, the bridge no longer routes these stale labels:
- `agent:ceo` / `agent:cto` / `agent:cmo` / `agent:cpo` / `agent:cbo` / `agent:cco` / `agent:qa-lead` / `agent:customer-voice`

To verify:
1. Create a Linear ticket with `agent:cmo` label
2. Check `audit_log` — should see NO new row (label is silently dropped)
3. Check bridge logs: `wrangler tail beamix-bridge` → should see `[bridge] no routine ID configured for label=agent:cmo` (per the new console.log)

## Step 8 — Enable audit-log canary (auto)

When you deploy `apps/web/` (the Next.js app, which hosts Inngest functions), the audit-log canary will start firing every 15 min automatically. To verify:

```sql
-- Run in Supabase SQL editor 30 min after Vercel deploy
SELECT * FROM audit_log
WHERE agent = 'audit-log-canary'
ORDER BY created_at DESC
LIMIT 10;
-- Expected: 2 rows in the last 30 min, both with status='canary_pass'
```

If you see no canary rows: check `https://app.vercel.com/<org>/beamix/inngest` dashboard for the function status.

## Step 9 — Update DECISIONS.md (1 min, automated)

CEO will write the `WS6 LOCKED` entry on PR merge.

## Step 10 — Merge PR #72 to main (after QA Lead PASS)

After all smoke fires green:
1. Comment on PR #72: "All 11 Routines provisioned + smoke fires green. Ready for QA Lead PASS."
2. QA Lead automated workflow runs (`.github/workflows/qa-lead-pass.yml`)
3. After PASS verdict: merge PR #72 to main via GitHub UI

## Troubleshooting

| Symptom | Diagnostic |
|---|---|
| Bridge fire returns 401 | Wrong token for Routine. Re-run Step 2 for that Routine. |
| Bridge fire returns 422 "no Routine configured" | Env var `ROUTINE_<NAME>_ID` missing. Re-run Step 2. |
| Routine fires but produces no Linear ticket | Check claude.ai Runs page — system prompt may have errored. Check the Routine body in .md file. |
| `@board` doesn't fire | Verify Linear webhook is configured for Comment:created events at `https://beamix-bridge.YOUR_CF_ACCOUNT.workers.dev/linear-webhook` |
| Telegram P0 alert didn't fire on canary failure | Telegram bot is deferred (not deployed). Q15 carve-outs log to `audit_log` with `status='telegram_p0_pending'` for now. Action when bot is deployed. |
| Cron fires don't happen at expected IL time | Anthropic Console uses UTC. Re-check Step 4 timezone conversion. |

## What's NOT in WS6 (deferred)

- **Telegram bot deploy** — Adam locked defer 2026-05-11. All Routines deliver via Linear only.
- **iOS Shortcut deploy** — Adam locked defer.
- **ai-search-rank-tracker** Routine — Beamix product itself will track this in future.
- **post-mortem-builder** — defer to 50-customer milestone.
- **`worker.stuck` Inngest event producer** — needs the parallel-watcher implementation (interactive subagent only — not a Routine). Add in WS7 when worker dispatch flow lands.
