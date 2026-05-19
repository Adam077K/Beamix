# Runbook — Vercel outage

**When:** Vercel platform unavailable. Includes full platform outage, regional degradation, or deployment failures that take down the Beamix product, the `/war-room` observability page, or the Inngest function host.
**Severity:** **P1.** A full Vercel outage simultaneously takes down: (a) the Beamix customer product — customer-facing concern, and (b) the `/war-room` page — war-room observability is gone. Routines themselves continue running on Anthropic Routines, which are independent of Vercel. Inngest functions are hosted on Vercel; they will fail during a Vercel outage.
**Owner today:** Adam.
**Last reviewed:** 2026-05-17 (Phase 7.5 re-test — structural pass, currency verified against 2026-05-16 agent rethink).

> **WAR ROOM SCOPE:** This runbook covers both the war room (Adam's internal startup-OS) AND the Beamix customer product because they share a Vercel project. Sections are labeled [WAR ROOM] or [PRODUCT] where they diverge.

---

## Cost-alert philosophy

**Per Adam Q7 (2026-05-08):** the war room does NOT push real-time cost alerts to Telegram. System-status alerts (this runbook's category) are still pushed; cost-rate alerts are not. The runaway-watcher's silent-kill action is preserved as a SAFETY fence. A Vercel outage also takes down the Inngest function host, meaning runaway-watcher is OFFLINE — see §Mitigation.

---

## Detection

| Signal | Where | Threshold |
|---|---|---|
| Vercel Status page red/degraded | https://vercel-status.com | Any active incident |
| Beamix product 5xx rate spike | Vercel Analytics / external uptime monitor (UptimeRobot free tier on `https://app.beamixai.com`) | ≥3 consecutive 5xx responses |
| `/war-room` page returns 5xx or times out | UptimeRobot free tier monitor on `https://app.beamixai.com/war-room` | ≥1 failure (page is auth-gated but a 200→500 state change is distinguishable from 200→401) |
| Inngest function executions begin failing | Inngest dashboard — function run history shows `Error: fetch to Vercel function failed` | ≥3 in 5 min |
| `claude_progress` heartbeat from `cost-watchdog` stops | Supabase `claude_progress` table | No new row from `cost-watchdog` in 90 min (same signal as `inngest-outage.md`) |
| Vercel deploy webhook stops | GitHub Actions — `qa-lead-pass` check stops posting status | Any PR > 10 min without a check update |

**Distinguishing full Vercel outage from deployment failure:**
- Full outage: Vercel Status page has an active incident AND all functions fail.
- Bad deployment: Vercel Status page green but specific functions 5xx after a recent deploy. Treat as a code/deploy issue, not this runbook.

**Note:** UptimeRobot free tier pings every 5 minutes. This gives 5-10 min detection lag. First-time setup: configure two monitors (Beamix product home page + `/war-room`) to send Telegram alerts via webhook. This is the uptime monitor referenced in §Telemetry.

---

## Immediate (first 5 minutes)

1. **Confirm scope.** Check Vercel Status page (https://vercel-status.com) and Vercel Twitter (`@vercel`). Identify if it's a full platform outage, a regional failure (check which region the Beamix Vercel project is in — document at WS4), or a specific function failure.
2. **Telegram-ping Adam** with system-status format (NOT cost-alert):
   ```
   [P1 vercel-outage]
   Vercel platform down. Product impacted. /war-room observability impacted.
   Routines still running (Anthropic Routines are independent of Vercel).
   Inngest functions down — runaway-watcher OFFLINE.
   Reply 'ack' to acknowledge.
   ```
3. **Open a tracking Linear ticket** in `Strategy/Signals` titled `Vercel outage YYYY-MM-DD HH:MM` with `incident` label.
4. **Do NOT pause Routines.** They run on Anthropic's infrastructure and are unaffected by Vercel.
5. **Note: Inngest functions are OFFLINE.** This is a compound failure with `inngest-outage.md` — see §Mitigation for the combined impact.

---

## Mitigation (duration of outage)

### [WAR ROOM] Observability gap: `/war-room` page is down

The `/war-room` Next.js page is the production observability surface for war-room activity. It reads `audit_log` and `claude_progress` via Supabase Realtime. When Vercel is down, Adam works without the UI.

**Fallback observability path — Supabase direct:**

Adam queries `claude_progress` and `audit_log` directly via one of:
1. **Supabase MCP** from an active Claude Code session:
   ```
   mcp__supabase__execute_sql: SELECT routine, session_id, step, status, cost_usd, ts
   FROM claude_progress
   WHERE ts > NOW() - INTERVAL '2 hours'
   ORDER BY ts DESC LIMIT 50;
   ```
2. **Supabase dashboard** (https://supabase.com/dashboard) → Table Editor → `claude_progress` and `audit_log` tables. Available independently of Vercel.
3. **Linear board** — Routine activity still writes to Linear tickets (sub-tickets, synth comments). The Linear board remains functional and is a secondary observability surface.

### [WAR ROOM] Inngest functions are OFFLINE

A Vercel outage takes down the Inngest function host. This creates the same compound failure as `inngest-outage.md`. See that runbook's §Mitigation for:
- Manual fan-in synth procedure
- runaway-watcher OFFLINE: manual cost monitoring via `claude_progress`
- If outage >2h: consider pausing Full-tier dispatches

Apply those procedures in parallel with this runbook. The tracking Linear ticket for this runbook should cross-reference the Inngest procedures.

### [WAR ROOM] runaway-watcher OFFLINE: manual cost monitoring

With Inngest down, the runaway-watcher silent-kill action is gone. Query Supabase directly every 30 minutes:
```sql
SELECT routine, session_id, SUM(cost_usd) as session_cost, MAX(ts) as last_seen
FROM claude_progress
WHERE ts > NOW() - INTERVAL '2 hours'
GROUP BY routine, session_id
ORDER BY session_cost DESC;
```
If any session shows `session_cost > 2.0`, inspect and pause manually via Anthropic Console if runaway. The Anthropic Console hard cap ($1,500/mo) is the absolute backstop.

### [PRODUCT] Beamix customer product is down

This is a product concern, not a war-room concern, but document the cross-impact here for completeness.

- Customer-facing product (`app.beamixai.com`) is unavailable for the duration.
- No customer actions are possible: scans don't run (Inngest also down), agent execution queued, dashboard inaccessible.
- **Status page:** Post a status update to the Beamix product status page. Status page setup: **TBD — flag as a pre-MVP deliverable.** If no status page exists at time of incident, post manually to the Beamix support email and any active customer Slack channels (if any exist at the time).
- **Data integrity:** No data loss. Pending Inngest jobs replay on recovery (Inngest dead-letter queue). Supabase is independent of Vercel.
- No Vercel-specific data is stored — all persistence is in Supabase or Cloudflare R2.

### [PRODUCT] Helicone proxy may fail

Helicone proxies Anthropic API calls from product code via a base URL set in Vercel env. With Vercel down, new product code API calls can't be made anyway. No special action needed; note for post-incident that Helicone logs during the window will have a gap.

---

## Recovery (Vercel platform returns)

1. **Confirm Vercel green.** Status page clears. Verify via `curl -I https://app.beamixai.com` returning a 2xx or auth redirect (not 5xx).
2. **Verify `/war-room` page renders.** Open `https://app.beamixai.com/war-room` — confirm page loads with live `claude_progress` rows appearing.
3. **Verify Inngest functions resume.** Check Inngest dashboard for function executions. Confirm `cost-watchdog` writes a new `claude_progress` row within 90 min of Vercel recovery.
4. **Replay Inngest dead-letter queue.** See `inngest-outage.md` §Recovery for the replay procedure. Apply now.
5. **Verify product is functional.** Run a smoke-test scan via Beamix product to confirm the full stack is healthy. Check Helicone dashboard for resumed request logging.
6. **If Vercel required a redeployment** (new deployment needed, not auto-recovery):
   - Verify the latest deployment in Vercel dashboard is for the correct branch (`main`).
   - Check for any failed environment variable migrations (env vars set during the incident window may not have applied).
   - Re-run GitHub Actions `qa-lead-pass` check on the recovery deploy if the deploy hash changed.
7. **Lift any manually set flags** (e.g., `bridge:full_tier_paused` if set during the outage per `inngest-outage.md` procedure).
8. **Telegram-ping Adam** `[vercel-outage resolved]`.

---

## Post-incident

- [ ] Close the tracking Linear ticket with a summary: duration, observability gap handled how, manual synth fires if any, product downtime duration.
- [ ] Postmortem at `docs/07-history/postmortems/YYYY-MM-DD-vercel-outage.md` if outage >30 min AND product was customer-impacted.
- [ ] If the `/war-room` page had a gap: confirm no missed Routine sessions during the window by querying `audit_log` for any `status: fired` rows with no paired `complete` from the outage window.
- [ ] Friday Retro tags this incident.
- [ ] Update this runbook with anything that worked or didn't.
- [ ] If status page did not exist: flag as P0 pre-launch blocker for next sprint. A product status page is a hard requirement before first paying customer.

---

## Decision tree

```
Vercel outage confirmed (Status page red OR product 5xx)?
│
├─ Full platform outage
│   → Telegram-ping Adam P1 (system-status)
│   → Open tracking Linear ticket
│   → Do NOT pause Routines (Anthropic Routines are independent)
│   → Note: Inngest functions are OFFLINE
│   │   → Apply inngest-outage.md §Mitigation in parallel
│   │   → Manual fan-in synth if needed
│   │   → Manual claude_progress cost monitoring every 30 min
│   │
│   → Observability gap: use Supabase MCP / dashboard directly
│   → Product is down: post to status page (TBD) if >30 min
│   → Recovery: confirm Vercel green, war-room page renders, Inngest resumes
│
├─ Regional degradation (partial outage — some functions work, some don't)
│   → Treat as full outage if `/war-room` page is affected
│   → Treat as product-only if only product functions are affected
│   → Monitor Vercel Status for region-specific incident resolution
│
└─ Post-recovery: Vercel returned but `/war-room` shows stale data?
    → Supabase Realtime subscription dropped on reconnect
    → Hard-refresh the `/war-room` page; Realtime re-subscribes
    → If still stale: check Supabase Realtime channel health in Supabase dashboard
    → If stale >5 min after hard-refresh: treat as Supabase Realtime bug; file Supabase support ticket

War-room observability gap: Vercel down for duration, Adam works without /war-room
└─ Primary fallback: Supabase MCP queries (Claude Code session)
   └─ Secondary fallback: Supabase dashboard (https://supabase.com/dashboard)
      └─ Tertiary fallback: Linear board (Routine activity still writes here)
```

---

## Related runbooks

- `inngest-outage.md` — compound failure mode; Vercel outage also takes down Inngest function host. Apply that runbook's mitigation procedures in parallel.
- `anthropic-outage.md` — independent failure mode; Routines continue during Vercel outage
- `supabase-corruption.md` — Supabase is the source of truth; remains independent of Vercel
- `secret-rotation.md` — Vercel holds many secrets as env vars (secrets 6-8, 11-15 per `secret-rotation.md` inventory); verify no env vars were lost during a Vercel outage that required account recovery

## Related signals

- UptimeRobot alert on `app.beamixai.com` and `app.beamixai.com/war-room` (Telegram channel: system-status)
- Vercel Status page incident
- Inngest dashboard `Error: fetch to Vercel function failed`
- `claude_progress` heartbeat from `cost-watchdog` stops (90-min silence)
- GitHub Actions `qa-lead-pass` check stops posting status on open PRs

## Telemetry to verify is wired

- [ ] UptimeRobot free tier monitors configured for `https://app.beamixai.com` AND `https://app.beamixai.com/war-room` with Telegram webhook alerts (WS4 deliverable)
- [ ] Telegram webhook for UptimeRobot alerts routes to the system-status channel (NOT the cost-alert channel — per Adam Q7)
- [ ] `/war-room` page has a "Last updated" timestamp showing the age of its latest data — makes the observability gap visible at a glance (WS4 deliverable)
- [ ] Beamix product status page exists at `status.beamixai.com` (pre-MVP deliverable — flag if missing)
- [ ] Supabase dashboard access confirmed not dependent on Vercel (it is not — native Supabase domain)
- [ ] `cost-watchdog` heartbeat detection in `/war-room` page (shows "Inngest: OFFLINE" badge when heartbeat stale >90 min — same as inngest-outage.md telemetry)
