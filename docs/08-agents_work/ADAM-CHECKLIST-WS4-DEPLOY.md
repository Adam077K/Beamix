# Adam-Action Checklist — WS4 Connection Layer Deploy

**Date:** 2026-05-08
**Status:** Ready for execution
**Estimated total time on keyboard:** 90-120 minutes (split over 2 sessions, gated by Test A's 24h window)
**Prerequisites:** None — start with Step 1.

---

## 0. Mental model — what you're doing and why

You are bringing the WS4 Connection Layer from "code committed and typecheck-clean" to "live in production." This means provisioning 3rd-party services (Cloudflare, Anthropic, Linear, Telegram), wiring secrets, and running 4 smoke tests to validate assumptions about Anthropic's rate limits and Mem0's stability.

**Order matters.** Step 5 (Anthropic Routines) depends on step 3 (Cloudflare bridge live) for the bridge URL. Step 9 (smoke tests) depends on steps 1-7 being complete. Don't skip ahead.

**If anything goes wrong:** every step has a "verify" sub-step and a "troubleshooting" callout. If a step fails twice, stop and ping me — don't grind through.

---

## 1. Cloudflare Workers Paid plan upgrade ($5/mo) — 5 min

**What this enables:** Durable Objects (the `RoutineLock` and `FireCountDO` classes that prevent dedup races). Without this, the bridge cannot deploy.

**Steps:**

1. Open browser → [https://dash.cloudflare.com](https://dash.cloudflare.com) → log in.
2. Top nav → **Workers & Pages**.
3. Left sidebar → **Plans** (or click the "Upgrade" banner if visible at top).
4. Find **Workers Paid** ($5/mo). Click **Upgrade**.
5. Confirm payment method. Submit.

**Verify:** Top of Workers & Pages dashboard now shows "Workers Paid" badge, not "Workers Free."

**Troubleshooting:** If the upgrade button is missing, you may already be on Paid. Click **Plans** to confirm. If the page shows "Workers Bundled" or "Workers Standard," that's also fine — both include Durable Objects.

---

## 2. Install wrangler CLI + login — 3 min

**What this enables:** local CLI to deploy the Cloudflare bridge.

**Steps:**

```bash
# Install globally (one-time)
npm install -g wrangler

# OR if you prefer pnpm without global install
# you'll prefix every wrangler command with `pnpm dlx wrangler`

# Verify install
wrangler --version
# Expected: 3.x.x or 4.x.x

# Login (opens browser)
wrangler login
# Browser opens → click "Allow" → wrangler prints "Successfully logged in."
```

**Verify:** `wrangler whoami` prints your Cloudflare account email + account ID.

**Troubleshooting:**
- If `wrangler --version` fails with "command not found," your `npm` global path isn't in `$PATH`. Add `$(npm config get prefix)/bin` to your shell `$PATH`.
- If `wrangler login` fails to open the browser, it prints a URL you copy manually.

---

## 3. Create KV namespace + deploy bridge — 8 min

**What this enables:** the bridge is live at a public URL. Linear, Telegram, and the iOS Shortcut can reach it.

**Steps:**

```bash
# From repo root
cd infra/cloudflare-bridge

# Step 3a — Create KV namespace (production)
wrangler kv:namespace create BRIDGE_STATE_KV
# Expected output:
#   🌀 Creating namespace with title "beamix-bridge-BRIDGE_STATE_KV"
#   ✨ Success!
#   Add the following to your configuration file in your kv_namespaces array:
#   { binding = "BRIDGE_STATE_KV", id = "abc123..." }
#
# COPY the `id` value.

# Step 3b — Create preview namespace (for `wrangler dev`)
wrangler kv:namespace create BRIDGE_STATE_KV --preview
# Expected output: similar, with preview_id
# COPY the `preview_id` value.
```

**Step 3c — Edit `infra/cloudflare-bridge/wrangler.toml`** and replace:

```toml
id = "PLACEHOLDER_KV_NAMESPACE_ID"
preview_id = "PLACEHOLDER_KV_NAMESPACE_PREVIEW_ID"
```

with the actual values from steps 3a + 3b.

```bash
# Step 3d — Deploy
wrangler deploy
# Expected output:
#   ⛅️ wrangler 3.x.x
#   ─────────────────
#   Total Upload: ~50 KiB
#   Uploaded beamix-bridge (X.XX sec)
#   Deployed beamix-bridge (X.XX sec)
#     https://beamix-bridge.<your-account>.workers.dev
#   Current Version ID: ...
#
# COPY the deployed URL — this is your `$BRIDGE_URL`.
```

**Verify:**

```bash
# Health check (unauth response should be minimal per R12)
curl -s "https://beamix-bridge.<your-account>.workers.dev/health"
# Expected: {"ok":true}
```

```bash
# Verify Durable Object classes are registered
wrangler tail
# In another terminal, hit /health again. The tail should show no errors.
# Press Ctrl+C to exit tail.
```

In Cloudflare dashboard → Workers → beamix-bridge → **Settings → Bindings**: confirm 2 Durable Object bindings exist (`ROUTINE_LOCK` and `FIRE_COUNT_DO`) and one KV binding (`BRIDGE_STATE_KV`).

**Troubleshooting:**
- "Cannot create new Durable Object class" → you're not on Workers Paid. Go back to Step 1.
- "Migration v2 missing new_classes" → check `wrangler.toml` has both `[[migrations]]` blocks (v1 = RoutineLock, v2 = FireCountDO).
- 500 on `/health` → `wrangler tail` and look for env-var errors. Likely you haven't set secrets yet (Step 4).

---

## 4. Set bridge secrets via wrangler — 15 min

**What this enables:** the bridge has the keys it needs to verify HMAC signatures, call Anthropic, write to Supabase, and route to Linear.

**You'll generate or fetch each secret, then paste it when wrangler prompts.**

```bash
# Still inside infra/cloudflare-bridge/

# Step 4a — Generate BRIDGE_HMAC_SECRET (used by bridge to sign outbound trust specs)
openssl rand -hex 32
# Copy the output. You'll paste it into the next command AND save it for the Telegram bot (step 7).
wrangler secret put BRIDGE_HMAC_SECRET
# Paste the hex string when prompted.

# Step 4b — Generate LINEAR_WEBHOOK_SECRET (Linear will sign webhooks with this)
openssl rand -hex 32
# Save this — you'll paste it into Linear's webhook config in Step 6.
wrangler secret put LINEAR_WEBHOOK_SECRET

# Step 4c — Generate SHORTCUT_SECRET (iOS Shortcut signs ideas with this)
openssl rand -hex 32
# Save this — you'll paste it into the iOS Shortcut in step 8.
wrangler secret put SHORTCUT_SECRET

# Step 4d — ANTHROPIC_API_KEY (Console-billed, NOT subscription OAuth)
# Get from: https://console.anthropic.com/settings/keys
# Use a NEW key dedicated to the bridge (not your dev key).
wrangler secret put ANTHROPIC_API_KEY

# Step 4e — Per-Routine bearer tokens (Q4 LOCKED: shared CEO token for all 6 C-suite + standing Routines)
# You'll get these in Step 5. Until then, set placeholders.
# After Step 5, run:
wrangler secret put ROUTINE_CEO_ENTRY_POINT_TOKEN
# (paste the CEO Routine bearer from Anthropic Console)

# Step 4f — Supabase
# Get from: https://supabase.com/dashboard/project/<your-project>/settings/api
wrangler secret put SUPABASE_URL
# Paste e.g. https://xyzabc.supabase.co
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
# Paste the service_role key (NOT anon key)

# Step 4g — Linear
# Get from: https://linear.app/<your-workspace>/settings/api
wrangler secret put LINEAR_API_KEY
# Paste a Personal API key OR an OAuth client secret with full read/write scopes

# Step 4h — Telegram (set after Step 7)
wrangler secret put TELEGRAM_BOT_TOKEN
# (paste BotFather token)
wrangler secret put ADAM_TELEGRAM_CHAT_ID
# (your personal Telegram chat ID — get from @userinfobot)

# Step 4i — ALLOWED_ISSUERS (comma-separated Linear user IDs allowed to issue trust specs)
# Find your Linear user ID:
#   linear.app → Settings → Account → "Show user IDs" or use Linear API
wrangler secret put ALLOWED_ISSUERS
# Paste e.g. "user_abc,user_def" (your Linear ID + bot account IDs)
```

**Verify:**

```bash
wrangler secret list
# Expected: 13+ secrets listed, no values shown (good).
```

Re-deploy to ensure secrets are picked up:

```bash
wrangler deploy
```

**Troubleshooting:**
- If `wrangler secret put` errors with "Missing entrypoint," you're not in `infra/cloudflare-bridge/`. `cd` there first.
- If you accidentally set the wrong value, re-run `wrangler secret put SECRET_NAME` — it overwrites.

---

## 5. Provision Anthropic Routines — 30 min

**What this enables:** the actual agents you'll fire. WS4 ships with Q4 deferred per-Routine token split (one shared CEO token), so for now you provision **at minimum one CEO Routine** + **one trivial smoke-test Routine**. Other 9 Routines come in WS6 alongside their system prompts.

**Why minimal now:** WS6 writes the system prompts for the full 10-Routine roster. Provisioning them now without prompts is wasted setup. The smoke tests only need 1 Routine.

**Steps:**

1. Open browser → [https://console.anthropic.com](https://console.anthropic.com) → log in.
2. Left nav → **Routines** (if not visible: it may be under "Claude Code" or in a Beta Features tab — look for "Standing Routines" or "Scheduled Routines").
3. Click **Create Routine**.

**Routine A — CEO Entry Point (production):**
- Name: `ceo-entry-point`
- Model: `claude-opus-4-7` (per WS6 model rule for orchestration)
- System prompt: leave as a placeholder one-liner for now: `You are the Beamix CEO. WS6 will populate this prompt.` (you replace this in WS6)
- MCP grants: `linear`, `github`, `mem0`, `supabase` (these are the CEO's standing grants per ORCHESTRATION.md §2E)
- Schedule: unscheduled (fired ad-hoc via bridge)
- Max budget per fire: $3.00
- Click **Create**. Copy the generated bearer token.
- Run: `wrangler secret put ROUTINE_CEO_ENTRY_POINT_TOKEN` from `infra/cloudflare-bridge/` and paste the token.

**Routine B — smoke-test-routine (temporary, for smoke tests A/B/D):**
- Name: `smoke-test-routine`
- Model: `claude-haiku-4-5` (cheapest)
- System prompt: `You are a smoke-test harness. When invoked, write a single line "alive at <timestamp>" and terminate. Do not call any tools. Do not produce more than 50 tokens of output.`
- MCP grants: NONE
- Schedule: leave unscheduled — you'll add a cron schedule manually for Test A in Step 9
- Max budget per fire: $0.05
- Click **Create**. Copy the bearer token. Save it to a local file (not in repo): `~/.smoke-test-token` (chmod 600 it).
- Note the **fire URL** for this Routine — typically `https://api.anthropic.com/v1/claude_code/routines/<routine_id>/fire`. Save the routine_id.

**Verify:**

```bash
# Test the CEO token works (just a 401 vs 200 sanity check)
curl -s -o /dev/null -w "%{http_code}\n" \
  -X POST "https://api.anthropic.com/v1/claude_code/routines/<ceo_routine_id>/fire" \
  -H "Authorization: Bearer <CEO_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{}'
# Expected: 400 (bad payload — that's fine, means auth worked) or 202 (fired).
# 401 = token wrong. 404 = routine_id wrong.
```

**Troubleshooting:**
- "Routines" section not visible: Anthropic Routines may be in private beta. Check console.anthropic.com for "Request access" or contact Anthropic support.
- If only "Claude Code" subscription is visible (no Routines): Routines is a separate product. You may need to upgrade or sign up at the API tier.
- If you're unsure of the fire URL format, click into the Routine in Console — there's usually a "How to fire" or "API endpoint" section.

---

## 6. Linear webhook + bot user setup — 10 min

**What this enables:** Linear ticket events (Issue:created, Comment:created) reach the bridge.

**Steps:**

1. Open [https://linear.app/<your-workspace>/settings/api/webhooks](https://linear.app/) → Settings → API → **Webhooks**.
2. Click **Create webhook**.
3. **URL:** `https://beamix-bridge.<your-account>.workers.dev/linear-webhook`
4. **Events:** check `Issue:created` and `Comment:created`.
5. **Resource types:** select Issues and Comments.
6. **Signing secret:** paste the `LINEAR_WEBHOOK_SECRET` value from Step 4b.
7. Click **Create**.

**Bot user accounts (one per agent — WS6 creates them; for now just one bot):**

1. Linear → Settings → Members → **Invite member**.
2. Email: `bot+ceo@beamixai.com` (or any unique email — use `+ceo` suffix on your existing email if your provider supports it).
3. Role: Member (full read/write).
4. Send invite. Open the invite email → set password → log in → note the user ID (Settings → Account → Show user ID).
5. Add this user ID to `ALLOWED_ISSUERS` (Step 4i).

**Verify:**

In Linear, create a test issue. In Cloudflare dashboard → Workers → beamix-bridge → **Logs** (or `wrangler tail` from terminal): you should see a POST to `/linear-webhook` within 5 seconds.

**Troubleshooting:**
- Webhook didn't arrive: check the URL is exactly `https://beamix-bridge.<your-account>.workers.dev/linear-webhook` (note the `-webhook` suffix).
- Bridge returns 401 on webhook: `LINEAR_WEBHOOK_SECRET` mismatch. Re-set via `wrangler secret put` and re-deploy.

---

## 7. Telegram bot via BotFather — 10 min

**What this enables:** `@cto Fix billing` style commands from Telegram fire Routines via the bridge.

**Steps:**

1. Open Telegram → search **@BotFather** → start chat.
2. Send `/newbot`.
3. Follow prompts:
   - Name: `Beamix War Room` (visible name)
   - Username: `beamix_war_room_bot` (or any unique `*_bot` handle)
4. BotFather replies with a token. **Copy the token**.
5. Run: `wrangler secret put TELEGRAM_BOT_TOKEN` from `infra/cloudflare-bridge/` and paste.
6. Get your personal chat ID: open Telegram → search **@userinfobot** → start chat → it replies with your numeric ID.
7. Run: `wrangler secret put ADAM_TELEGRAM_CHAT_ID` and paste your numeric ID.
8. Open chat with your bot → send `/start`.

**Deploy the Telegram bot relay (separate Cloudflare Worker):**

```bash
cd ../telegram-bot
# Set secrets
wrangler secret put TELEGRAM_BOT_TOKEN  # same value as above
wrangler secret put BRIDGE_HMAC_SECRET  # same value from Step 4a
wrangler secret put BRIDGE_URL  # https://beamix-bridge.<your-account>.workers.dev
# Deploy
wrangler deploy
# COPY the Telegram bot worker URL.
```

**Set Telegram webhook to point to the bot worker:**

```bash
TELEGRAM_BOT_TOKEN="<your-bot-token>"
TELEGRAM_BOT_WORKER_URL="<from-deploy-output>"
curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook?url=${TELEGRAM_BOT_WORKER_URL}/webhook"
# Expected: {"ok":true,"result":true,"description":"Webhook was set"}
```

**Verify:**

Send a test message to your bot in Telegram: `@ceo hello` (don't worry — it'll fail because the CEO Routine isn't fully wired yet, but the bridge should log it).

In `wrangler tail` (from `infra/cloudflare-bridge`): you should see a POST to `/telegram` within 5 seconds.

**Troubleshooting:**
- `setWebhook` returns `{"ok":false}`: check the worker URL is HTTPS and reachable.
- Bot replies "this server cannot reach Telegram": you're missing `TELEGRAM_BOT_TOKEN` env var on the bot worker.

---

## 8. iOS Shortcut install — 5 min

**What this enables:** voice-capture an idea on iPhone → bridge creates Linear ticket.

**Steps:**

1. AirDrop or email yourself the file: `infra/shortcuts/Capture-Beamix-Idea.shortcut.json` from the repo.
2. Open it on iPhone — Shortcuts app prompts to import.
3. Before saving, edit two values inside the shortcut:
   - Replace `YOUR_ANTHROPIC_API_KEY_HERE` with your `ANTHROPIC_API_KEY` value (from Step 4d). **Or** use Option B from `infra/shortcuts/README.md`: store the key in iOS Keychain via the "Get Password" action — this is more secure (recommended; takes 5 extra minutes).
   - Replace `YOUR_BRIDGE_URL_HERE` with your `$BRIDGE_URL` (from Step 3).
   - Replace `YOUR_SHORTCUT_SECRET_HERE` with your `SHORTCUT_SECRET` value (from Step 4c).
4. Save the shortcut.
5. (Optional but recommended) Add it to the iOS share sheet or as a Lock Screen action via Settings → Shortcuts.

**Verify:**

Tap the shortcut → speak an idea ("Test capture from iPhone") → wait. You should see "Idea captured ✓ — BMX-XXX" notification with the Linear ticket ID.

In Linear: a new issue should appear within 10 seconds.

**Troubleshooting:**
- "Capture FAILED: 401" → `SHORTCUT_SECRET` or HMAC computation mismatch. Re-check the shortcut's HMAC step uses timestamp + body (per R3).
- "Capture FAILED: 422" → Haiku didn't return valid JSON. Check the Anthropic API key works.
- Notification never arrives → iOS Shortcuts often silent-fail. Run shortcut from Shortcuts app directly to see error.

---

## 9. Apply Supabase migration — 10 min

**What this enables:** `audit_log`, `audit_log_daily`, `claude_progress` tables exist in Supabase. Bridge + Inngest can write to them.

**STAGING FIRST — DO NOT GO STRAIGHT TO PRODUCTION.**

**Step 9a — Apply on staging:**

If you don't have a staging branch in Supabase, create one:
- Supabase dashboard → your project → **Branches** → Create branch → name `staging`.

```bash
# From repo root
cd apps/web

# Use the Supabase MCP via this Claude Code session (recommended):
# I'll apply via mcp__supabase__apply_migration when you say "apply staging migration"

# OR manually:
supabase login  # if not logged in
supabase link --project-ref <your-staging-branch-ref>
supabase db push
# Expected: applies 20260508_war_room_observability.sql + any prior migrations.
```

**Verify on staging:**

```bash
# Check the new tables exist
supabase db dump --schema public --data-only=false | grep -E "audit_log|claude_progress"
# Should list audit_log, audit_log_daily, claude_progress.

# Check the enum has 15 values including telegram_send_failed
supabase db psql -c "SELECT consrc FROM pg_constraint WHERE conname LIKE '%audit_log_status%';"
# Should include: ARRAY['fired', 'accepted', ..., 'telegram_send_failed']
```

**Step 9b — If staging looks good, apply to production:**

```bash
supabase link --project-ref <your-production-ref>
supabase db push
```

**Troubleshooting:**
- "relation already exists" → previous migration partially applied. Migration is idempotent (`IF NOT EXISTS`), so re-running should be safe. If it errors anyway, manually `DROP TABLE IF EXISTS audit_log_daily CASCADE; DROP TABLE IF EXISTS audit_log CASCADE; DROP TABLE IF EXISTS claude_progress CASCADE;` on staging only, then retry.
- "function audit_log_aggregate_for_date already exists" → use `CREATE OR REPLACE FUNCTION` (already in migration).

---

## 10. Helicone proxy setup — 5 min (OPTIONAL — defer if you want)

**What this enables:** product-API LLM calls (NOT Routine calls) get logged in Helicone for cost tracking.

**Note:** Routines run on Anthropic Max and don't go through Helicone — only `apps/web/src/lib/agents/llm-runner.ts` and similar product-side code use Helicone.

**Steps:**

1. [https://www.helicone.ai](https://www.helicone.ai) → Sign up.
2. Get API key from dashboard.
3. In your `apps/web/.env.local`:
   ```
   HELICONE_API_KEY=<key>
   ```
4. Wrap product-side LLM calls to use the Helicone proxy URL. Already configured in repo if memory `project_helicone.md` exists; otherwise WS6 will wire it.

**Skip if:** you're not running Beamix-product LLM calls in this WS4 phase. Helicone is for product cost-tracking, not war-room.

---

## 11. Run smoke tests — see SMOKE-TESTS-WS4.md + scripts/smoke-tests/ — 50 min on keyboard + 24h wall-clock

After steps 1-9 complete, run:

```bash
# From repo root
cd scripts/smoke-tests
chmod +x test-b.sh test-c.sh test-d.sh

# Test C runs first (independent — only needs MEM0_API_KEY) — ~30 min wall-clock
export MEM0_API_KEY="<your-mem0-key>"
./test-c.sh > test-c-results.log 2>&1
# Or run in background: ./test-c.sh > test-c-results.log 2>&1 &
```

```bash
# Then Tests B + D (need bootstrap from Step 5):
export SMOKE_TOKEN="$(cat ~/.smoke-test-token)"
export FIRE_URL="https://api.anthropic.com/v1/claude_code/routines/<smoke-routine-id>/fire"

./test-b.sh > test-b-results.log 2>&1
./test-d.sh > test-d-results.log 2>&1
```

```bash
# Test A is a 24h cron observation. Schedule the smoke routine in Anthropic Console:
# Set schedule = "every 90 minutes" (e.g., cron: "0 */1.5 * * *" — Anthropic uses simpler "every X" UI)
# Note start time. Come back in 24h. Read run history.
```

**Result delivery:** paste results into chat or write to `docs/08-agents_work/SMOKE-TESTS-WS4.md` Results section.

---

## Sanity-check after all 11 steps

Run this end-to-end:

1. Create a Linear issue with title "Smoke test full pipeline" and label `agent:ceo` + `tier:lite`.
2. Within 30 seconds, the bridge logs the webhook.
3. Within 60 seconds, the CEO Routine fires (visible in Anthropic Console run history).
4. The Routine runs a placeholder pass.
5. Audit log row appears in Supabase: `SELECT * FROM audit_log ORDER BY ts DESC LIMIT 5;`
6. CLOSE the issue manually for now (CEO Routine can't actually do work until WS6).

If all 6 checkpoints pass: **WS4 deploy is verified.** WS5 + WS6 can begin.

---

## What to ping me about

- Anything that fails twice. Don't grind.
- A wrangler error you can't decode.
- A 401/403 you can't trace.
- A migration error that's not "already exists."
- Any Anthropic Console UX surprises (the Routines product is new and may have shifted since this checklist was written).

I will wait — no autonomous WS5 work until you confirm steps 1-10 done + smoke results landed.
