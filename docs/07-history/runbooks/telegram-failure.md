# Runbook — Telegram bot failure

**When:** Telegram notification delivery stops. Includes Telegram service-wide outage, bot account flagged or suspended, bot token revoked, or Adam personally blocking the bot. Every other runbook's first action ("Telegram-ping Adam") depends on this channel. If it fails, all incident notifications fail simultaneously unless the fallback path fires correctly.
**Severity:** **P1.** The war room is not directly impaired — Routines continue running, Inngest continues running, the product continues serving. But Adam is flying blind on all P1+ incidents for the duration.
**Owner today:** Adam.
**Last reviewed:** 2026-05-17 (Phase 7.5 re-test — structural pass, currency verified against 2026-05-16 agent rethink).

> **WAR ROOM SCOPE:** This runbook covers the war room (Adam's internal startup-OS), not the Beamix customer product. Telegram is the war room's primary escalation channel. The Beamix product does not depend on Telegram.

---

## Cost-alert philosophy

**Per Adam Q7 (2026-05-08):** the war room does NOT push real-time cost alerts to Telegram. System-status alerts (this runbook's category) are still pushed; cost-rate alerts are not. The runaway-watcher's silent-kill action is preserved as a SAFETY fence.

A Telegram failure does NOT affect the runaway-watcher's kill action (it revokes Anthropic bearer tokens directly — no Telegram involved). What is lost during a Telegram failure: Adam's notification that the kill action fired. Linear-comment fallback catches this.

---

## Detection

| Signal | Where | Threshold |
|---|---|---|
| Cloudflare Worker logs `telegram_send_failed` | Cloudflare Worker logs (infra/telegram-bot/) | ≥1 event |
| Telegram Bot API returns 4xx / 5xx | Cloudflare Worker response capture on `/send-telegram` calls | ≥1 non-200 response |
| Adam reports "no notifications" | Adam (manual) | Any time a known event (e.g., Routine BLOCKED) should have pinged but didn't |
| Telegram service issue chatter | https://downforeveryoneorjustme.com/telegram OR Twitter #TelegramDown | Qualitative signal; use to distinguish service-wide from account-specific |

**Telegram has no official public Status page.** Use `downforeveryoneorjustme.com/telegram` and Twitter/X #TelegramDown hashtag as the fastest proxy for service-wide detection.

**Note on self-detecting failure:** A Telegram failure cannot self-notify via Telegram. The detection path is:
- Cloudflare Worker logs (active) → Adam checks Worker logs manually, OR
- Adam notices silence during a period when a ping was expected, OR
- Linear-comment fallback fires (the bridge already falls back to Linear comments for P1+ alerts when Telegram send fails — see §Mitigation).

---

## Immediate (first 5 minutes)

1. **Confirm scope via Cloudflare Worker logs.** Open Cloudflare dashboard → Workers → `beamix-bridge` → Logs. Filter for `telegram_send_failed` events. Note the HTTP status code:
   - `400 Bad Request` → bot token invalid or request malformed
   - `401 Unauthorized` → bot token revoked
   - `403 Forbidden` → bot blocked by Adam, OR bot account suspended
   - `429 Too Many Requests` → rate limit (unlikely at war-room volume — see §Decision tree)
   - `5xx` or connection error → Telegram service-wide issue
2. **Determine if service-wide or account-specific:**
   - Service-wide: `5xx` or connection timeouts; Twitter #TelegramDown chatter; affects all bots (Adam can try sending a message to another Telegram bot to confirm).
   - Account-specific: `4xx` codes; Twitter shows no broad outage.
3. **Check Linear `Strategy/Signals` project** for any incidents that should have generated a Telegram ping. If missed pings exist, the Linear-comment fallback should have caught them. Verify by checking the relevant Linear tickets for auto-comments from the bridge.
4. **Open a tracking Linear ticket** titled `Telegram failure YYYY-MM-DD HH:MM` with `incident` label. All war-room notifications go to Linear comments for the duration.

---

## Mitigation (duration of failure)

### Primary fallback: Linear comment escalation

The Cloudflare bridge already implements a Linear-comment fallback for unsent P1+ alerts (WS2 §Auto-Unblock spec). When `telegram_send_failed` is logged:
1. Bridge logs the failed payload to `audit_log` with `status: telegram_send_failed` (WS4 deliverable — verify this is wired per §Telemetry).
2. Bridge posts a comment to the relevant Linear ticket (the `linear_ticket` field on the alert payload) with the full alert message prefixed `[TELEGRAM FALLBACK]`.
3. For alerts not tied to a specific Linear ticket (e.g., cost-watchdog P2 alerts), bridge posts to the `Strategy/Signals` catch-all ticket created at step 4 of §Immediate.

Adam monitors the Linear `Strategy/Signals` board and the tracking ticket for the duration. This is the complete fallback — no war-room capability is lost, only notification convenience.

### Secondary fallback: email via Resend

**Status:** The Resend email fallback for P0 incidents is a stretch goal — flag as a WS4 deliverable if not yet implemented (see §Telemetry checklist). If implemented:
- Bridge sends an email to Adam's address (`adam419067@gmail.com`) via Resend for any P0 incident that Telegram failed to deliver.
- Use the `[P0 WAR ROOM INCIDENT]` subject prefix so Adam can filter.

If NOT yet implemented: Linear comments are sufficient for P1 and below. For a genuine P0 (Anthropic account suspension, data breach), Adam would see it in Linear within minutes.

### Cause-specific actions

#### Service-wide Telegram outage

- Wait. Telegram service-wide outages are rare and typically resolve within 2 hours.
- No action needed on the bot or token. The bot is functional; the service is not.
- When Telegram returns, the bridge automatically retries sends on the next event (no backlog replay — individual missed pings are already captured in Linear).
- Verify recovery by sending a test message to Adam's Telegram from any Telegram account (not the bot).

#### Bot token revoked (HTTP 401)

- **Rotate the bot token immediately.** See `secret-rotation.md` row #4.
- Open BotFather in Telegram: start chat → `/revoke` → confirm → receive new token.
- Deploy new token: `wrangler secret put TELEGRAM_BOT_TOKEN` → paste new token → deploy.
- Verify by sending a test message via the bridge `/send-telegram` endpoint.

#### Bot account flagged / suspended (HTTP 403)

- If Adam has NOT blocked the bot: Telegram has suspended the bot account. This typically happens due to spam reports (unlikely for a private bot) or Terms of Service violations.
- Open BotFather in Telegram to check account status. Contact @BotFather with `/mybots` to see if the bot appears.
- If bot is suspended by Telegram: create a new bot via BotFather (`/newbot` → give it a new name → receive new token). Update `TELEGRAM_BOT_TOKEN` via Wrangler. Update any Adam-side saved contacts.
- Rotate token per `secret-rotation.md` row #4 regardless.

#### Bot blocked by Adam (HTTP 403 with Adam's account)

- Adam has accidentally blocked the bot in the Telegram client.
- Fix: Adam opens Telegram → search for the bot name → tap the bot → "Unblock" button.
- Test by sending a message from a different Telegram account to confirm the bot is not globally suspended (only blocked by Adam).

#### Persistent 403 without clear cause

- Rotate bot token (BotFather `/revoke`) even if the issue seems unrelated to the token.
- Test the new token with a direct `curl` to the Telegram Bot API before deploying:
  ```
  curl "https://api.telegram.org/bot<NEW_TOKEN>/sendMessage" \
    -d "chat_id=<ADAM_CHAT_ID>&text=test"
  ```
  Adam's chat ID is stored in Cloudflare env `TELEGRAM_CHAT_ID`. Retrieve via Wrangler if needed.

#### iMessage Channel escalation (persistent failure >2h)

If Telegram remains down or unrecoverable for >2 hours AND the Linear-comment fallback is insufficient for any active P0 incident:

- **iMessage Channel** (Apple-published, CarPlay-compatible) is the designated alternative per V4 environment map (TECH-STACK.md §3A.3 notes).
- Setup: create an Apple Messages for Business or a personal iMessage group; share with Adam's iPhone number.
- This is a manual setup step — if not pre-configured, configure during the outage.
- iMessage Channel works across Apple Watch (Telegram pings) and CarPlay (driving scenarios) — same coverage as Telegram for Adam's device ecosystem.

---

## Recovery (Telegram returns or bot restored)

1. **Verify delivery.** Send a test ping via bridge `/send-telegram` endpoint (or manually via Cloudflare Worker invoke). Confirm Adam receives it on his phone.
2. **Replay queued P1+ alerts.** Review the tracking Linear ticket for all `[TELEGRAM FALLBACK]` comments logged during the outage. For any that require Adam's explicit acknowledgement (e.g., Routine BLOCKED pings awaiting `ack`), re-send a summary ping:
   ```
   [telegram-restored]
   Missed alerts during outage: <count> P1 alerts. Review Linear Strategy/Signals tracking ticket.
   ```
3. **Close the tracking Linear ticket.** Add a summary: duration, cause, number of missed pings, whether Linear fallback caught them all.
4. **Confirm Linear-comment fallback is CLEARED.** If the bridge was posting to a catch-all Strategy/Signals ticket, confirm that ticket is reviewed and any actions taken.

---

## Post-incident

- [ ] Postmortem if outage >2h OR any P0 alert missed (not caught by Linear fallback).
- [ ] If cause was bot token revocation: run full secret rotation check — was the token leaking? Check `gitleaks` history for committed `TELEGRAM_BOT_TOKEN` values.
- [ ] Update `secret-rotation.md` if a new rotation path was discovered during the incident.
- [ ] Friday Retro tags this incident.
- [ ] If iMessage Channel was configured as fallback: document the configuration in TECH-STACK.md §3A.3 for future incidents.
- [ ] Update this runbook with anything that worked or didn't.

---

## Decision tree

```
Telegram notifications stopped?
│
├─ Check Cloudflare Worker logs for telegram_send_failed
│
├─ HTTP 5xx OR connection error
│   → Check Twitter #TelegramDown / downforeveryoneorjustme.com/telegram
│   ├─ Service-wide outage confirmed
│   │   → Wait (typical resolution <2h)
│   │   → Linear-comment fallback is active (verify via bridge logs)
│   │   → Check Linear Strategy/Signals for missed alerts
│   │   → If >2h AND active P0 incident: configure iMessage Channel fallback
│   │   → Recovery: test ping when Telegram returns; replay missed alerts
│   │
│   └─ Not service-wide (5xx on our bot only)
│       → Possible Telegram API regression or bot-specific rate limit
│       → Wait 15 min. If persists: rotate bot token (BotFather /revoke)
│
├─ HTTP 401 Unauthorized
│   → Bot token revoked
│   → Rotate immediately: BotFather /revoke → new token → wrangler secret put → deploy
│   → Test via curl before deploying
│   → Post-incident: audit for token leak (gitleaks)
│
├─ HTTP 403 Forbidden
│   ├─ Adam blocked the bot? → Unblock in Telegram client → test
│   ├─ Bot account suspended? → Check BotFather → if suspended, create new bot
│   └─ Unclear cause → Rotate token regardless → test with curl
│
├─ HTTP 429 Too Many Requests
│   → Rate limit (30 msg/sec per bot — very unlikely at war-room volume)
│   → Check if a buggy function is spamming messages
│   → Identify and stop the source; Telegram auto-lifts rate limit within minutes
│
└─ No Worker logs at all (bridge not even trying)
    → Bridge itself may be down → check Cloudflare Workers dashboard
    → If bridge is down: see cloudflare-compromise.md or check deploy status
```

---

## Related runbooks

- `secret-rotation.md` — row #4: Telegram bot token rotation procedure (BotFather `/revoke`)
- `cloudflare-compromise.md` — if the bridge itself is compromised, Telegram sends may be manipulated before they reach Adam
- `anthropic-outage.md` — Telegram is the PRIMARY notification for Anthropic outages; if BOTH fail simultaneously, Adam is blind. Check Linear for Anthropic outage signals directly.
- `inngest-outage.md` — Telegram is the notification channel for Inngest outage detection; Linear-comment fallback covers this if Telegram is down
- `vercel-outage.md` — UptimeRobot monitors (Telegram-alerting) also fail if Telegram is down; use direct Vercel Status page checks instead

## Related signals

- Cloudflare Worker logs `telegram_send_failed`
- `audit_log` rows with `status: telegram_send_failed` (WS4 deliverable)
- Linear `Strategy/Signals` board — unexpected accumulation of `[TELEGRAM FALLBACK]` comments means the bridge is working but Telegram is not
- Adam's device (phone, watch) shows no new messages from war-room bot during a period when activity was expected

## Telemetry to verify is wired

- [ ] Cloudflare Worker logs `telegram_send_failed` event on every failed Telegram API call (WS4 deliverable)
- [ ] `audit_log` accepts `status: telegram_send_failed` enum value — write on every failed send (WS4 migration per R1 extension)
- [ ] Bridge Linear-comment fallback is implemented: when `telegram_send_failed`, bridge posts `[TELEGRAM FALLBACK] <alert body>` to the associated Linear ticket OR to a catch-all `Strategy/Signals` ticket (WS4 deliverable)
- [ ] Adam's Telegram chat ID (`TELEGRAM_CHAT_ID`) is stored in Cloudflare env as a named constant — never hardcoded in Worker script (per R3.12 pattern)
- [ ] Email fallback via Resend for P0 incidents is implemented OR explicitly flagged as a WS4 backlog item (stretch goal)
- [ ] `/war-room` page shows a "Telegram: OFFLINE" badge when `audit_log` shows ≥3 `telegram_send_failed` in last 10 min (WS4 deliverable)
- [ ] iMessage Channel configuration documented in TECH-STACK.md §3A.3 if Adam has configured it as a fallback
