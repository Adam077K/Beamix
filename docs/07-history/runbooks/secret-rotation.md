# Runbook — Secret rotation (routine 90-day OR emergency)

**When:** **Routine** = 90-day rotation cycle (P2). **Emergency** = suspected leak, compromise, or after another runbook fires (P0).
**Severity:** **P2** routine, **P0** emergency.
**Owner today:** Adam.
**Last reviewed:** 2026-05-08 (WS3 lock).

---

## The full secret inventory

Every secret used by the war room. Each row: where stored, how to rotate, grace window for overlap, rollback procedure.

| # | Secret | Stored in | Rotation procedure | Grace window | Rollback |
|---|---|---|---|---|---|
| 1 | Per-Routine bearer tokens (10×) | Cloudflare Worker env vars (one per Routine: `ROUTINE_CEO_TOKEN`, `ROUTINE_MORNING_DIGEST_TOKEN`, etc.) + Anthropic Console | Anthropic Console → Routines → each Routine → Bearer tokens → "Generate new"; copy; `wrangler secret put ROUTINE_<NAME>_TOKEN`; deploy | Until last in-flight Routine fire completes (~30 min) | Re-issue old token from Anthropic if not yet revoked |
| 2 | `BRIDGE_HMAC_SECRET` | Cloudflare Worker env var; receiving agents verify against this | 1. Generate new value: `openssl rand -hex 32`. 2. Run batch-update script: `infra/cloudflare-bridge/scripts/rotate-bridge-hmac.ts` (Loops over all 10 Routines via Anthropic API, updates each Routine's BRIDGE_HMAC_SECRET env var simultaneously.) 3. Wait 30 seconds for Anthropic Console to propagate. 4. Deploy bridge with new secret: `wrangler secret put BRIDGE_HMAC_SECRET; wrangler publish`. 5. Verify: tail bridge logs for first 5 minutes; HMAC verification rate should return to 100%. **Note:** Expected transition-window failure rate: <30s of bridge HMAC failures while Routines are propagating. Specs received during this window will be rejected and Linear will retry; this is acceptable. | None — atomic swap | Roll back deploy via Cloudflare Worker version pin |
| 3 | Linear webhook secret | Linear → Settings → API → Webhooks; also stored in Cloudflare Worker env `LINEAR_WEBHOOK_SECRET` | Linear → regenerate; copy; `wrangler secret put LINEAR_WEBHOOK_SECRET`; deploy. Linear allows old + new for 24h transition. | 24h | Linear UI shows previous secret history |
| 4 | Telegram bot token | BotFather (Telegram); Cloudflare env `TELEGRAM_BOT_TOKEN` | `/revoke` in BotFather chat; receive new token; `wrangler secret put TELEGRAM_BOT_TOKEN`; deploy | None | Old token is dead immediately on revoke; no rollback — re-rotate if issues |
| 5 | `SHORTCUT_SECRET` (iOS Shortcut HMAC) | Adam's iCloud (Shortcut export); Cloudflare env `SHORTCUT_SECRET` | Generate `openssl rand -hex 32`; `wrangler secret put SHORTCUT_SECRET`; deploy; export new Shortcut to Adam's iPhone | None — atomic swap | Rebuild Shortcut from Adam's iPhone backup |
| 6 | Helicone API key | Vercel env `HELICONE_API_KEY` (product code); NOT in Cloudflare bridge | Helicone dashboard → API Keys → revoke + create new; Vercel env update; redeploy product | Helicone allows ~5 min overlap on key revoke | Helicone dashboard shows recent key activity |
| 7 | Mem0 cloud API key | Vercel env `MEM0_API_KEY`; per-Routine MCP config in `.mcp.json` | Mem0 dashboard → API Keys → revoke + create new; update Vercel env; update `.mcp.json` for Routines that use it; redeploy + restart Routines | None — atomic | Mem0 dashboard shows last-known-good |
| 8 | OpenAI embeddings key | Vercel env `OPENAI_API_KEY` (only used by Inngest embed-* jobs) | OpenAI dashboard → API Keys → revoke + create new; update Vercel env | None | OpenAI dashboard shows recent activity |
| 9 | Cloudflare API tokens (deploy + management) | Adam's password manager; GitHub Actions secrets | Cloudflare → My Profile → API Tokens → revoke + create with same scopes; update password manager; update GitHub Actions secret | Until next deploy | Re-issue from Cloudflare |
| 10 | GitHub Actions secrets (`ANTHROPIC_API_KEY`, `LINEAR_API_KEY`, etc.) | GitHub repo → Settings → Secrets and variables → Actions | Repo settings → update each secret. No file commit. | None — atomic | GitHub does NOT show secret history; rotate again if value lost |
| 11 | `ANTHROPIC_API_KEY` (Console-billed, separate from Max OAuth) | Vercel env `ANTHROPIC_API_KEY` (product code via Helicone); GitHub Actions secret | Anthropic Console → API Keys → revoke + create new; update Vercel + GitHub; redeploy | None | Anthropic Console shows recent activity |
| 12 | Supabase service role key | Vercel env `SUPABASE_SERVICE_ROLE_KEY` (server-side only); Inngest function env | 1. Inngest dashboard → Functions → click 'Pause all' to stop new invocations. 2. Wait 5 minutes for in-flight jobs to drain. Verify by Inngest dashboard 'In-progress' count = 0. 3. Supabase → Project Settings → API → Reset service role key. 4. Update Vercel env SUPABASE_SERVICE_ROLE_KEY; trigger Vercel redeploy. 5. Verify Vercel deploy is live by checking /api/health returns 200. 6. Inngest dashboard → 'Resume all'. 7. Smoke-test: file one Linear ticket; verify the bridge → Routine → Inngest fan-in cycle works end-to-end. | None — atomic | Supabase shows old key has been reset |
| 13 | Supabase anon key | Vercel env `NEXT_PUBLIC_SUPABASE_ANON_KEY` (client-safe); embedded in client bundle | Reset in Supabase; update Vercel; full redeploy required (anon key is in client bundle) | None — atomic | Same as service role |
| 14 | Paddle API key | Vercel env (product) | Paddle dashboard → API Keys → revoke + create; update Vercel; redeploy | None | Paddle shows recent activity |
| 15 | Resend API key | Vercel env | Resend dashboard → revoke + create | None | Resend shows recent activity |

---

## Routine rotation cycle (P2 — every 90 days)

A reminder runbook fires automatically (Inngest cron, written WS4) to remind Adam every 90 days. The rotation is staggered to avoid all-at-once risk:

- **Day 0** — secrets 1-3 (bearer tokens, BRIDGE_HMAC_SECRET, Linear webhook)
- **Day 1** — secrets 4-7 (Telegram, SHORTCUT_SECRET, Helicone, Mem0)
- **Day 2** — secrets 8-11 (OpenAI, Cloudflare, GitHub Actions, Anthropic)
- **Day 3** — secrets 12-15 (Supabase keys, Paddle, Resend)

After each day's rotation: smoke-test the affected paths. Don't proceed to the next day until green.

**Per-day smoke-test checklist:**

After Day 0 rotation (secrets 1-3):
- Smoke-test bridge: file one Linear ticket; verify HMAC succeeds, Routine fires, audit_log captures it.
- Smoke-test Linear webhook: file Linear comment, watch bridge logs for HMAC verify success.

After Day 1 (secrets 4-7):
- Smoke-test Telegram: send test message via bot.
- Smoke-test iOS Shortcut: invoke "Capture Beamix idea" on Adam's iPhone, verify Linear ticket appears.
- Smoke-test Helicone: trigger one product API call; verify it appears in Helicone dashboard.
- Smoke-test Mem0: trigger one Routine, verify memory write/read works.

After Day 2 (secrets 8-11):
- Smoke-test embedding: trigger one embed Inngest function manually; verify pgvector receives new entries.
- Smoke-test Cloudflare deploy: trigger a no-op `wrangler publish`; verify success.
- Smoke-test GitHub Actions: open a draft PR; verify qa-lead-pass workflow runs.
- Smoke-test Anthropic API direct: trigger one product API call; verify cost lands in Helicone with new key.

After Day 3 (secrets 12-15):
- Smoke-test Supabase: file one Linear ticket end-to-end; verify all DB writes land.
- Smoke-test Paddle webhook (if any test paths): trigger test webhook.
- Smoke-test Resend: send a test transactional email.

---

## Emergency rotation (P0)

When a runbook fires (`cloudflare-compromise.md`, `github-compromise.md`, leaked-secret detection by `gitleaks`/`trufflehog`):

1. **Identify the blast radius.** Which secrets were on the affected surface?
2. **Rotate everything in the blast radius simultaneously** (skip grace windows).
3. **Smoke-test end-to-end** with one trivial Linear ticket.
4. **Audit `audit_log` during the leak window** for any anomalous activity.
5. **Postmortem within 48h.**

### Common blast radii

- **Cloudflare compromise:** secrets 1-5, 9 (Cloudflare bridge holds all of these).
- **GitHub compromise:** secrets 9-11 (GitHub Actions secrets), and any committed-by-mistake key.
- **Supabase compromise:** secrets 12-13.
- **Vercel compromise:** secrets 6-8, 11-15 (anything in Vercel env).
- **Adam's password manager compromise:** secret 9 (Cloudflare master tokens) → cascade everything.

---

## Verification checklist (after any rotation)

- [ ] Smoke-test: file one Linear ticket with `agent:ceo, tier:quick`. End-to-end pipe works.
- [ ] Smoke-test: cost-watchdog Inngest function fires next hour with new credentials.
- [ ] Smoke-test: Telegram bot delivers a test message.
- [ ] Smoke-test: iOS Shortcut creates a Linear ticket.
- [ ] Smoke-test: GitHub Action `qa-lead-pass` runs successfully on next PR.
- [ ] Smoke-test: Mem0 MCP read/write cycle from one Routine.
- [ ] Smoke-test: pgvector RAG retrieval from one Routine.
- [ ] Smoke-test: Helicone proxy logs a request with new key.
- [ ] Verify no `audit_log.status = anthropic_error | linear_api_error | rule_violation` rows in last 30 min.
- [ ] Telegram-ping Adam `[secret-rotation complete: <which>]`.

---

## Decision tree

```
Need to rotate?
├─ Routine 90-day → schedule via Inngest cron reminder. Stagger across 4 days.
│
└─ Emergency
    ├─ Identify blast radius (which secrets exposed?)
    ├─ Rotate ALL of them simultaneously (skip grace)
    ├─ Smoke-test
    └─ Postmortem + update detection runbook
```

---

## Related runbooks

- `cloudflare-compromise.md` — fires emergency path for secrets 1-5, 9
- `github-compromise.md` — fires emergency path for secrets 9-11
- `supabase-corruption.md` — fires emergency path for secrets 12-13
- `anthropic-outage.md` — fires emergency path for secrets 1, 11 if HTTP 401

## Related signals

- `gitleaks` / `trufflehog` detection in CI
- Anthropic Console anomalous API key usage email
- Cloudflare audit log unrecognized API token
- Manual Adam report

## Telemetry to verify is wired

- [ ] `gitleaks` runs as pre-commit hook on Adam's machines
- [ ] `gitleaks` GitHub Action runs on every push to `main`
- [ ] Inngest 90-day rotation reminder cron exists (post-WS4)
- [ ] Vercel deploy webhooks → `audit_log` `status: deploy_with_new_secret` rows so we can correlate
- [ ] Lint rule blocks `console.log(env.ROUTINE_*)` and similar (per WS2 R3.12)
