# Runbook — Cloudflare account / bridge compromise

**When:** Suspected unauthorized access to Cloudflare account, Worker code tampering, or leaked Cloudflare API token.
**Severity:** **P0.** The bridge holds per-Routine bearer tokens, BRIDGE_HMAC_SECRET, Linear webhook secret, KV nonces, and the entire routing layer. Compromise = full war-room control.
**Owner today:** Adam.
**Last reviewed:** 2026-05-17 (Phase 7.5 re-test — structural pass, currency verified against 2026-05-16 agent rethink).

---

## Detection

| Signal | Where | Threshold |
|---|---|---|
| Cloudflare audit log shows unrecognized API token use | https://dash.cloudflare.com/?to=/:account/audit-log | Any |
| Worker route changed without Adam | Cloudflare audit log | Any |
| New API token created without Adam | Cloudflare audit log | Any |
| Worker logs show requests from foreign IPs to admin endpoints | Worker dashboard | Any |
| KV namespace contents changed unexpectedly (nonce TTL anomalies) | KV dashboard | Manual review trigger |
| Bridge HMAC verification rate drops (attacker bypassing HMAC by replacing HMAC secret) | bridge metrics | If rate <100% sustained |
| `audit_log.status = rule_violation` rows clustering near a deploy event | Supabase | ≥3 in 1h |
| Adam-facing Linear comments authored by an unrecognized session_id | Linear | Manual review |
| Cloudflare login from new device/location email | Adam's email | Always investigate |

---

## Immediate (first 5 minutes — race the attacker)

1. **Telegram-ping Adam P0:**
   ```
   [P0 cloudflare-compromise]
   Suspected Cloudflare compromise. Bridge isolated. ACK and stand by for token rotation walk-through.
   ```
2. **Disable the bridge.** Cloudflare dashboard → Workers → `beamix-bridge` → Triggers → disable all routes. This stops the attacker from firing Routines via the bridge.
3. **Create a recovery token FIRST, then revoke others.** Do this in exact order:
   - **(a) Create recovery token:** Dashboard → My Profile → API Tokens → Create Token → name it `recovery-YYYY-MM-DD` → save the token value securely (password manager or written down).
   - **(b) Revoke all other tokens:** Dashboard → My Profile → API Tokens → revoke every token EXCEPT the `recovery-YYYY-MM-DD` token just created.
   - **(c) Force-logout sessions:** Dashboard → My Profile → Sessions → Log out all. Adam re-authenticates with 2FA.

   > ⚠ DO NOT skip ahead — creating the recovery token must happen BEFORE any token revocation OR session logout. If you logout first, you may lose the ability to create the recovery token.
4. **Confirm 2FA is active.** Adam re-authenticates with 2FA after the forced logout in step 3c.
5. **If 2FA was not enabled, enable it now.** This should already be in place — if it was disabled by the attacker, that confirms the compromise.
6. **Disable the linked GitHub Action that deploys to Cloudflare** (`.github/workflows/cloudflare-deploy.yml` or similar) — set workflow to manual-trigger only. Prevents an attacker who also has a leaked GitHub token from re-deploying compromised Worker code.

---

## Mitigation (next hour — full secret rotation)

The bridge held many secrets. Treat ALL of them as compromised. Rotate per `secret-rotation.md` emergency path:

- **Per-Routine bearer tokens** (×10 — one per standing Routine). Rotate in Anthropic Console. Update Cloudflare Worker env vars.
- **BRIDGE_HMAC_SECRET.** Generate new. Update bridge env. Update receiving-agent verification keys (if any cached).
- **Linear webhook secret.** Rotate in Linear → Settings → API → Webhooks. Update bridge env.
- **Telegram bot token.** Rotate via BotFather (`/revoke`). Update bridge env.
- **SHORTCUT_SECRET** (iOS Shortcut HMAC bearer). Generate new. Update Shortcut export and re-deploy to Adam's iPhone.
- **Helicone API key** (only if bridge held it — it shouldn't, but check).
- **Mem0 API key** (if held by bridge — typically held by Routines, not bridge; verify).
- **Cloudflare API token** for bridge deploy (already done in immediate step).

After rotation: redeploy bridge from a known-good git SHA (use the most recent merge to `main` that you trust). **DO NOT redeploy from a branch that the attacker may have modified.** If GitHub is also compromised, see `github-compromise.md` first.

**If GitHub Actions is disabled** (e.g., because `github-compromise.md` is running in parallel and hit Immediate step 6), use direct Wrangler deploy from Adam's local machine: `cd infra/cloudflare-bridge && wrangler publish` against the verified clean SHA. The known-good SHA is found from Adam's local git clone — DO NOT trust GitHub's main branch state if GitHub may also be compromised.

### Replay queued events through new bridge

- Inngest dead-letter queue has events that failed during bridge isolation. Once bridge is up with new tokens, Inngest replays them. Verify by `audit_log` insertion rate.

---

## Recovery (full restore)

1. **Confirm new bridge live** with a single test Linear ticket (`agent:ceo, tier:quick`). Verify end-to-end pipe works.
2. **Re-enable Cloudflare routes** one by one (`/linear`, `/idea-capture`, `/health`). Watch logs after each.
3. **Re-enable GitHub Actions deploy workflow** AFTER GitHub-side audit (`github-compromise.md` if needed).
4. **Forensic audit** on `audit_log`:

   **Step 3.5 — Determine the compromise window from Cloudflare audit log:** Cloudflare dashboard → Audit log → filter by 'API token created/used' and identify the timestamp of the first unrecognized action. Set `$compromise_start = <that timestamp>`. Set `$compromise_end = NOW()`. Substitute these literal values into the SQL query below.

   ```sql
   SELECT * FROM audit_log
   WHERE ts >= ($compromise_start - interval '1 hour')
     AND ts <= ($compromise_end + interval '1 hour')
   ORDER BY ts;
   ```
   Identify any `rule_violation`, `over_budget`, or `anomaly` rows. Identify any `accepted` rows that don't match a known Adam-issued ticket.
5. **Replay any legitimate work** the attacker disrupted (rare — the bridge isolation prevents most damage).
6. **Telegram-ping Adam** `[cloudflare-compromise resolved]` with a 1-line summary.

---

## Post-incident

- [ ] Postmortem REQUIRED. `docs/07-history/postmortems/YYYY-MM-DD-cloudflare-compromise.md`.
- [ ] Identify entry vector: leaked token? phished credentials? supply-chain (compromised wrangler)? Use a `kaizen`-style 5-whys.
- [ ] Update bridge code to add detection signals that would've caught this earlier.
- [ ] Tune `audit_log` schema to capture more context if needed.
- [ ] Friday Retro tags this incident.
- [ ] If a sub-processor (Cloudflare-side) was responsible: notify customers per GDPR DPA breach-notification clause (post-MVP, when there are paying customers).

---

## Decision tree

```
Suspected Cloudflare compromise?
├─ Disable bridge routes IMMEDIATELY (don't wait for confirmation)
├─ Revoke all Cloudflare API tokens
├─ Telegram-ping Adam P0
│
├─ Was a token leaked from public source (commit, screenshot, etc.)?
│   ├─ YES → likely automated abuse. Rotate everything. Audit for any successful operations during leak window.
│   └─ NO → suspected targeted attack. Treat as serious. Lock down GitHub too (`github-compromise.md` runbook fires in parallel).
│
├─ Was 2FA enabled?
│   ├─ YES → either bypassed (Anthropic-grade attacker — escalate severity) or social engineering (Adam's session token stolen)
│   └─ NO → enable now, but the past is past. Treat all secrets as compromised.
│
└─ Did the attacker reach the bridge code?
    ├─ Worker version unchanged → secrets-only compromise. Rotate, redeploy from known-good SHA, recover.
    └─ Worker version changed → CODE COMPROMISE. Do NOT redeploy from any branch the attacker touched.
                                 Redeploy from a verified clean SHA (Adam's local clone is the gold copy).
                                 Audit ALL recent commits for hidden backdoors.
```

---

## Related runbooks

- `secret-rotation.md` — emergency rotation procedures for every bridge secret
- `github-compromise.md` — often co-attacked; if the attacker has Cloudflare, they may have GitHub
- `anthropic-outage.md` — bridge compromise can mimic Anthropic outage (calls fail) but the runbook is different

## Related signals

- Cloudflare audit log entries
- `audit_log.status = rule_violation`
- Unrecognized `session_id` in Linear comments
- Bridge HMAC verification failures

## Telemetry to verify is wired

- [ ] Cloudflare audit log entries trigger Telegram alert (Cloudflare Email-to-Webhook OR Cloudflare R2 bucket monitored by Inngest)
- [ ] `audit_log.status = rule_violation` triggers immediate Telegram alert
- [ ] HMAC verification rate metric exposed in Worker dashboard
- [ ] Per-Routine bearer tokens are rotatable in <10 min (smoke-tested annually)
