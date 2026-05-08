# Runbook — Anthropic API / Routines outage

**When:** Anthropic platform unavailable. Includes API outage, Routine platform outage, daily-cap exhaustion that mimics outage, or account suspension.
**Severity:** **P0** if >30 min OR account suspension. **P1** if <30 min AND platform-wide (not account-specific).
**Owner today:** Adam.
**Last reviewed:** 2026-05-08 (WS3 lock).

---

## Detection

| Signal | Where | Threshold |
|---|---|---|
| Anthropic Status page red/yellow | https://status.anthropic.com | Any active incident |
| `/fire` endpoint returns 5xx | Cloudflare Worker logs | ≥3 in 5 min |
| `cost-watchdog` Inngest reports zero Routine activity | `audit_log` rolling 30-min window has no `accepted` rows | If a Routine should have fired (e.g., Morning Digest at 07:30 IL) and didn't |
| `audit_log.status = anthropic_error` rows | Supabase `audit_log` table | ≥1 |
| Telegram bot ping with `[anthropic-error]` prefix | Telegram | First page sent if ≥3 errors in 5 min |
| Adam reports "Claude Code session crashed" | Adam | Manual signal |

Distinguishing **outage** from **cap-hit**:
- Cap-hit returns HTTP 429 with a `Retry-After` header.
- Platform outage returns 5xx OR connection timeout.
- Account suspension returns HTTP 403 with `{"type":"forbidden_account"}` body. **This is the ban-risk pattern (`feedback_claude_code_oauth_ban_risk.md`)** — escalate immediately.

---

## Immediate (first 5 minutes)

1. **Confirm scope.** Check Anthropic Status page and Twitter/X (`@AnthropicAI`). Note: Status page can lag the actual outage by ~5-15 min.
2. **Telegram-ping Adam** with binary-ping format:
   ```
   [P0 anthropic-outage]
   ETA unknown. /war-room is paused. Reply 'ack' to acknowledge OR 'lift' if you've already mitigated.
   ```
3. **Soft-pause the bridge.** Set Cloudflare KV key `bridge:paused = true`. The bridge checks this on every webhook and returns 503 to Linear (Linear will auto-retry 3× over 7h — this is by design).
   ```bash
   # Pause:
   wrangler kv:key put --namespace-id <BRIDGE_KV_NAMESPACE_ID> bridge:paused true
   # Verify:
   wrangler kv:key get --namespace-id <BRIDGE_KV_NAMESPACE_ID> bridge:paused
   ```
   BRIDGE_KV_NAMESPACE_ID is documented in `infra/cloudflare-bridge/wrangler.toml` (deployed in WS4). For Adam: this is the KV namespace bound as `BRIDGE_STATE_KV` in the bridge.
4. **Do NOT revoke per-Routine bearer tokens.** That makes recovery slower. Soft-pause is enough.
5. **Open a Linear ticket** in `Strategy/Signals` project titled `Anthropic outage YYYY-MM-DD HH:MM` (use the `incident` label) so the post-incident has a home.
6. **If account suspension (403 forbidden_account):** STOP — this is the ban-risk pattern. See [Decision tree](#decision-tree) "Account suspension" branch immediately. Do NOT continue normal mitigation steps; the cause is different.

---

## Mitigation (next hour)

### Platform-wide outage

- **Wait.** Anthropic restores typically within 30-60 min for platform-wide events. Burning Adam's energy on alternative providers is not worth it for solo-stage.
- **Do NOT swap to OpenAI / Anthropic API direct.** Routine config is baked into Anthropic; product code uses Anthropic via Helicone — and OpenAI is also vulnerable to correlated outages (multi-provider AI outages happen).
- **Do continue manual work** that doesn't depend on Routines: Adam can manually answer Linear comments, manually merge low-risk PRs (with explicit "QA Lead bypassed during outage" comment that triggers an `audit_log` `rule_violation` row for post-incident review).
- **Cost-watchdog stops firing** during outage (no `audit_log` writes). This is fine; resume when Anthropic returns.

### Account-specific outage

- **Account suspension** (HTTP 403 forbidden_account): cause is one of (a) ban-risk OAuth-on-VPS pattern (which we explicitly avoid — see `feedback_claude_code_oauth_ban_risk.md`), (b) ToS violation by content posted, (c) billing failure. Adam contacts Anthropic support immediately. Recovery is not in our hands.
- **API key revoked** (HTTP 401): rotate per `secret-rotation.md` emergency path. Probable cause: leaked key in commit history (use `gitleaks` to scan).

### Daily-cap exhaustion (HTTP 429)

- **Read `Retry-After` header.** If <1h, the bridge will queue via Inngest delayed event and recover automatically.
- **If `Retry-After` is until midnight**, see `cost-watchdog` for daily-cliff recommendation. Mitigation: upgrade Adam to Max 20× ($200/mo, ~60/day cap). 1-click in Anthropic Console.
- **DO NOT cut Routine roster** to fit a smaller cap (per `feedback_dont_cut_agent_roster.md`).

---

## Recovery (full restore)

1. **Confirm Anthropic platform green.** Status page; test `/fire` endpoint with a trivial Routine (write `alive` to `claude_progress`). Wait for `audit_log.status = complete` row.
2. **Lift bridge soft-pause.** Set Cloudflare KV `bridge:paused = false`. Linear webhooks resume.
   ```bash
   # Lift:
   wrangler kv:key put --namespace-id <BRIDGE_KV_NAMESPACE_ID> bridge:paused false
   # Verify:
   wrangler kv:key get --namespace-id <BRIDGE_KV_NAMESPACE_ID> bridge:paused
   ```
   BRIDGE_KV_NAMESPACE_ID is documented in `infra/cloudflare-bridge/wrangler.toml` (deployed in WS4). For Adam: this is the KV namespace bound as `BRIDGE_STATE_KV` in the bridge.
3. **Replay orphans manually if recovery happens before Morning Digest's next run.** Run this query on Supabase:
   ```sql
   SELECT spec, linear_ticket
   FROM audit_log
   WHERE status = 'fired'
     AND ts >= ($outage_start - interval '1 hour')
     AND NOT EXISTS (
       SELECT 1 FROM audit_log a2
       WHERE a2.linear_ticket = audit_log.linear_ticket
         AND a2.status = 'accepted'
         AND a2.ts > audit_log.ts
     );
   ```
   For each row returned: open a Linear comment 'manual re-fire required' on the parent ticket. Adam (or Auto-Unblock when Inngest is back) re-fires them. **Note:** Morning Digest will also do this at 07:30 IL, but the manual procedure above is faster if recovery happens off-hours.
4. **Verify cost-watchdog ran during outage window.** It will have flat-lined; that's expected. No alert misfire.
5. **Confirm Telegram bot got `restored` ack** by sending a manual test ping.

---

## Post-incident

- [ ] Postmortem at `docs/07-history/postmortems/YYYY-MM-DD-anthropic-outage.md`. Required if outage caused a missed Routine fire OR a Linear ticket SLA breach.
- [ ] Friday Retro tags this incident in the weekly retro doc.
- [ ] Update this runbook with anything that worked or didn't.
- [ ] If account suspension: file the case ID in DECISIONS.md and update `feedback_claude_code_oauth_ban_risk.md` with the new pattern.

---

## Decision tree

```
Anthropic Status page red?
├─ YES → Platform outage. Telegram-ping Adam. Soft-pause bridge. Wait.
│        Recovery time: typically 30-60 min.
│
└─ NO → Check error type
        ├─ HTTP 5xx but Status page green
        │   → Likely localized incident or stale Status page.
        │   → Wait 10 min. If persists: (a) Telegram-ping Adam P0 with `[anthropic-isolated-error]` prefix
        │     (system-status alert, not cost alert per Q7); (b) manually re-check Anthropic Status;
        │     (c) post a tweet asking @AnthropicAI for incident confirmation; (d) if confirmed isolated
        │     to your account, declare suspected account-issue and proceed to the 403 forbidden_account branch.
        │
        ├─ HTTP 429 with Retry-After <1h
        │   → Bridge auto-queues via Inngest. Watch.
        │
        ├─ HTTP 429 with Retry-After until midnight
        │   → Daily cap exhausted.
        │   → Read cost-watchdog: who burned the budget?
        │   → If runaway: see runaway-watcher logs.
        │   → If legitimate: propose Max 20× upgrade ($200/mo).
        │   → DO NOT cut agent roster.
        │
        ├─ HTTP 403 forbidden_account
        │   → ACCOUNT SUSPENSION. Stop normal mitigation.
        │   → Adam contacts Anthropic support.
        │   → File case ID. Audit recent commits for OAuth-on-VPS pattern.
        │   → Until resolved: war room is offline. Alternative provider swap is multi-day; accept the downtime.
        │
        └─ HTTP 401
            → API key revoked. Rotate per secret-rotation.md emergency path.
```

---

## Related runbooks

- `secret-rotation.md` — when API key revoked or rotation due
- `cloudflare-compromise.md` — bridge can't reach Anthropic if Cloudflare is compromised
- `mem0-outage.md` — independent failure mode; doesn't cascade

## Related signals

- `audit_log.status = anthropic_error` (insert by bridge OR receiving agent)
- `claude_progress` rows stop accumulating across all Routines simultaneously
- Anthropic Status page incident
- Telegram `[anthropic-error]` ping

## Telemetry to verify is wired

- [ ] `audit_log` accepts `status: anthropic_error` enum value (WS4 migration)
- [ ] Cloudflare Worker logs `anthropic_5xx` events to `audit_log`
- [ ] Telegram bot has `[anthropic-error]` template message
- [ ] cost-watchdog has zero-activity detection (NOT JUST high-cost detection)
