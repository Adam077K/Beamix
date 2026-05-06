# Beamix War Room — Setup Guide (Linear · Cloudflare · GitHub · Anthropic)
**Audience:** Adam · **Goal:** Click-by-click setup for Wave D (Linear-as-the-Company) tailored to what's already configured in this repo. Read this end-to-end first, then start at Step 1.

---

## What's already set up (audit results)

| Component | Status | Notes |
|-----------|--------|-------|
| **GitHub CLI auth** | ✅ Logged in | `Adam077K` account, scopes: `gist, read:org, repo, workflow` — sufficient for everything |
| **Git remote** | ✅ Configured | `https://github.com/Adam077K/Beamix.git` |
| **`pnpm`** | ✅ Installed | v9.12.3, monorepo via turbo |
| **`.claude/settings.json`** | ⚠️ Exists, but no `permissions` or `mcpServers` blocks | Has 3 `gsa-*` hooks (V1 P0-5: gsa-context-monitor references dead `/gsa:pause-work` cmd — needs cleanup) |
| **`.github/workflows/`** | ❌ Does not exist | Will be created in Step 5 |
| **`infra/cloudflare-bridge/`** | ❌ Does not exist | Will be created in Step 3 |
| **CTO agent** | ❌ Does not exist | Wave C deliverable, parallel to this |
| **CEO agent** | ⚠️ Exists, 402 lines | Will be rewritten as part of Wave C blended agents |
| **Linear API key** | ❌ Not yet | You'll create in Step 1.4 |
| **Wrangler CLI** | ❌ Not installed | Will install in Step 3.1 |
| **Anthropic Console** | (you check) | You're on Max $100/mo |

**Bottom line:** GitHub side is mostly ready. Linear, Cloudflare, Wrangler need to be set up from scratch. The agent files come from Wave C in parallel.

---

## Total time: ~60-90 minutes (mostly clicks)

You can do steps 1-2 anywhere, then 3-9 with me at the keyboard.

---

## STEP 1 — Linear workspace (~10 min, Adam-only)

### 1.1 — Sign up for Linear (if you don't already use it)

Go to **linear.app** → Get Started.

- Email: `adam419067@gmail.com`
- Workspace name: `Beamix`
- Workspace URL: `beamix` (or pick what's available — write it down, you'll need it)
- Plan: **Free** for now (solo). Standard ($8/mo) when you add a human teammate.

### 1.2 — Create the 8 projects

In Linear left sidebar → **Projects** → **+ New project**. Create these EXACT names (the CEO routes by project name — typos matter):

| Project name | Description (paste this) | Lead |
|--------------|--------------------------|------|
| `Engineering` | Code work — features, bugs, refactors, infra | leave blank |
| `Product` | PRDs, specs, roadmap, user research | leave blank |
| `Marketing` | Content, SEO/GEO, campaigns, launch | leave blank |
| `Business` | Pricing, finance, legal, hiring | leave blank |
| `Customer Success` | Support, onboarding, retention, comms | leave blank |
| `QA` | Cross-cutting quality work, security audits | leave blank |
| `Strategy` | Initiatives, board meetings, signal scans | leave blank |
| `Inbox` | Voice notes + ad-hoc captures (CEO triages from here) | leave blank |

### 1.3 — Create labels

Settings (cog top-left) → **Labels** → **New label**. Create each:

**Routing labels** (one per C-suite for skip-CEO express routing):
- `agent:ceo` (color: yellow)
- `agent:cto` (color: blue)
- `agent:cpo` (color: green)
- `agent:cmo` (color: orange)
- `agent:cbo` (color: emerald)
- `agent:cco` (color: teal)
- `agent:qa-lead` (color: red)

**QA tier labels:**
- `tier:trivial` (color: gray)
- `tier:lite` (color: blue)
- `tier:full` (color: red)

**Special labels:**
- `proposed-by-agent` (color: purple) — autonomous proposals you approve weekly
- `do-not-build` (color: black) — manual ANTI-ROADMAP marker
- `risk:irreversible` (color: red) — needs explicit approval before agent acts

### 1.4 — Get the Linear API key

Settings → **API** → **Personal API keys** → **+ Create key**.
- Label: `beamix-cloudflare-bridge`
- **Copy the key** (looks like `lin_api_AbCdEf123...`). Paste into a notes app temporarily.
- ⚠️ Treat it like a password.

### 1.5 — Set up the webhook (LEAVE IT IN DRAFT for now)

Settings → **API** → **Webhooks** → **+ New webhook**.
- URL: leave as `https://example.com/placeholder` for now (you'll update after Step 3)
- Resource types: ✅ Issue · ✅ Comment · ✅ Project · ✅ IssueLabel
- All teams: ✅
- Click **Create webhook**
- After creation, **copy the signing secret** (format: `lin_wh_...`). Paste into your notes.
- **Toggle the webhook OFF for now** — we'll turn it on in Step 6.

### Verify Step 1
- [ ] 8 projects in Linear
- [ ] 12 labels created (7 routing + 3 tier + 3 special)
- [ ] API key saved
- [ ] Webhook signing secret saved (webhook itself is OFF)

---

## STEP 2 — Anthropic Console setup (~5 min, Adam-only)

### 2.1 — Verify Max plan + billing

Go to **console.anthropic.com** → Settings → Billing.
- Confirm Claude Max ($100/mo) is active.
- Note your default API key under Settings → API Keys (you may already have one). If not, create one named `beamix-default`.

### 2.2 — Set hard cost cap

Console → Settings → **Usage limits** → **Workspace limit**.
- Set monthly hard cap: **$200/mo** (your Max is $100, this is the hard ceiling — kicks in if a Routine loops).
- Set monthly soft alert at **$150/mo** (email you when approaching).

### 2.3 — Create a separate API key for Routines

Console → Settings → **API Keys** → **Create Key**.
- Name: `beamix-routines`
- **Copy the key** (`sk-ant-api03-...`). Save it.

This separation lets you rotate the Routine key without breaking your local Claude Code.

### Verify Step 2
- [ ] Max plan confirmed
- [ ] $200/mo hard cap set
- [ ] `beamix-routines` API key saved

---

## STEP 3 — Cloudflare Worker bridge (~10 min, joint)

### 3.1 — Create Cloudflare account (if you don't have one)

cloudflare.com → Sign up → Free plan. No credit card needed.

### 3.2 — Install Wrangler CLI

In your terminal (anywhere — not in a worktree):

```bash
cd /Users/adamks/VibeCoding/Beamix
pnpm add -D -w wrangler
npx wrangler --version    # confirm install
npx wrangler login         # browser opens, click Allow
```

### 3.3 — Tell me to write the Cloudflare Worker code

When you're ready, say "**write the bridge**" and I'll create:
- `infra/cloudflare-bridge/wrangler.toml` (CF config)
- `infra/cloudflare-bridge/src/index.ts` (the Worker — HMAC verify Linear webhook, route to Anthropic Routine, return acknowledgment)
- `infra/cloudflare-bridge/package.json` (deps: `@cloudflare/workers-types`)
- `infra/cloudflare-bridge/README.md` (deploy instructions)

I'll commit these to a `feat/wave-d-bridge` branch, you review on GitHub mobile, approve.

### 3.4 — Set Cloudflare secrets

After the Worker code is in place:

```bash
cd infra/cloudflare-bridge
npx wrangler secret put LINEAR_WEBHOOK_SECRET    # paste from Step 1.5
npx wrangler secret put LINEAR_API_KEY            # paste from Step 1.4
npx wrangler secret put ANTHROPIC_API_KEY         # paste beamix-routines key from Step 2.3
# (More secrets added later for ROUTINE endpoints — Step 4)
```

### 3.5 — Deploy

```bash
npx wrangler deploy
```

Expected output:
```
Published beamix-bridge
  https://beamix-bridge.YOUR-CF-SUBDOMAIN.workers.dev
```

**Copy that URL.** Save it.

### 3.6 — Update Linear webhook with the real URL

Back in Linear → Settings → API → Webhooks → edit `beamix-cloudflare-bridge`:
- URL: `https://beamix-bridge.YOUR-CF-SUBDOMAIN.workers.dev/linear`
- **Keep webhook OFF** until Step 6 (we'll test before turning on)

### Verify Step 3
- [ ] Wrangler installed + logged in
- [ ] Worker deployed, URL saved
- [ ] Secrets set (LINEAR_WEBHOOK_SECRET, LINEAR_API_KEY, ANTHROPIC_API_KEY)
- [ ] Linear webhook URL updated, still OFF

---

## STEP 4 — Anthropic Routine (the CEO entry-point) (~10 min, joint)

### 4.1 — Verify the CEO agent file exists

Once Wave C ships the blended CEO agent at `.claude/agents/ceo.md` (parallel work), you can proceed. If not yet shipped, pause here.

### 4.2 — Create the Routine

In your terminal (in Beamix repo root, not in worktree):

```bash
claude
> /routine create
```

Interactive prompts — answer:
- **Name:** `beamix-ceo`
- **Description:** `Beamix war-room CEO — orchestrates Linear tickets, dispatches teams, synthesizes results`
- **Schedule:** `on-demand` (no cron)
- **System prompt source:** `.claude/agents/ceo.md` (file path)
- **Tools:** `Read, Write, Edit, Bash, Task` + MCP tools (`linear`, `github`, `supabase`)
- **Model:** `claude-sonnet-4-6`
- **Max turns:** `30`
- **Hard $ cap per run:** `$20`
- **Isolation:** `worktree`

### 4.3 — Get the Routine endpoint + bearer

After creation, the Routine page shows:
- Endpoint: `https://api.anthropic.com/v1/routines/<routine-id>/fire`
- Bearer token: `sk-ant-routine-...`

Copy both. Save.

### 4.4 — Add to Cloudflare Worker secrets

```bash
cd infra/cloudflare-bridge
npx wrangler secret put ROUTINE_CEO_ENDPOINT   # paste endpoint URL
npx wrangler secret put ROUTINE_CEO_BEARER     # paste bearer token
npx wrangler deploy                             # re-deploy with new secrets
```

### Verify Step 4
- [ ] CEO Routine exists in Anthropic Console
- [ ] Endpoint + bearer added to Cloudflare Worker secrets
- [ ] Worker re-deployed

---

## STEP 5 — GitHub setup (~5 min, joint)

You already have `gh` CLI auth done with `repo` + `workflow` scopes ✓ — most of this step is about adding the workflow file.

### 5.1 — Add ANTHROPIC_API_KEY as a repo secret

In your terminal:

```bash
cd /Users/adamks/VibeCoding/Beamix
gh secret set ANTHROPIC_API_KEY --body "sk-ant-api03-..."  # use your beamix-routines key from Step 2.3
gh secret list   # verify it's there
```

Or via web: github.com/Adam077K/Beamix → Settings → Secrets and variables → Actions → New repository secret.

### 5.2 — Tell me to write the workflow file

Say "**write the github workflow**" and I'll create `.github/workflows/claude.yml` based on `anthropics/claude-code-action@v1` for:
- Auto-review on PR open
- Respond to `@claude` mentions in PR comments
- Optional: nightly QA workflow (lint + tsc + test on `main`)

### 5.3 — Install Claude Code GitHub App

In Claude Code:

```bash
claude
> /install-github-app
```

Browser opens → install Claude Code app on `Adam077K/Beamix` → approve permissions (read/write code, PR comments).

### Verify Step 5
- [ ] `ANTHROPIC_API_KEY` in GitHub repo secrets
- [ ] `.github/workflows/claude.yml` committed (after I write it)
- [ ] Claude Code GitHub App installed

---

## STEP 6 — End-to-end test (~5 min, joint)

### 6.1 — Turn on the Linear webhook

Linear → Settings → API → Webhooks → `beamix-cloudflare-bridge` → toggle **ON**.

### 6.2 — Create a test ticket

Linear → `Engineering` project → **+ New issue**:
- Title: `Test: Update README with Wave D status`
- Description: `Add a single line to README.md saying "Wave D Linear bridge online — YYYY-MM-DD"`
- Labels: `tier:trivial`
- Status: `Todo`
- Assignee: leave blank

### 6.3 — Watch the loop

Within ~30-60 seconds:
1. Linear webhook fires
2. Cloudflare Worker logs (`wrangler tail`) show: `received Linear issue created event, routing to ceo Routine`
3. Anthropic Console → Routines → `beamix-ceo` shows: `running`
4. Within ~2-5 minutes, the Linear ticket should have a comment from the bot:
   ```
   Picked up by CEO. Trivial-tier work, dispatching directly to backend-engineer.
   Branch: feat/wave-d-readme. PR will follow.
   ```

### 6.4 — If something fails

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Webhook doesn't fire | Webhook OFF | Recheck Step 6.1 |
| Worker logs show 401 | HMAC verification failing | Re-paste `LINEAR_WEBHOOK_SECRET` (Step 3.4) |
| Routine doesn't fire | Worker secrets missing | Re-paste `ROUTINE_CEO_ENDPOINT/BEARER` (Step 4.4) |
| Routine errors out | `.claude/agents/ceo.md` missing or malformed | Wave C must complete first |

### 6.5 — Approve the PR

If everything worked:
1. GitHub creates branch + PR (`feat: wave d readme update`)
2. PR has README change
3. Linear ticket comments: `PR opened: github.com/Adam077K/Beamix/pull/N`
4. claude-code-action auto-reviews the PR
5. You approve in GitHub mobile → merges → ticket auto-closes

🎉 **Linear-as-the-Company is now live.**

---

## STEP 7 — Telegram bot (~10 min, joint)

### 7.1 — Create the bot via BotFather

Open Telegram → search `@BotFather` → start chat. Send these in order:

```
/newbot
BeamixCEO
BeamixCEOBot
```

BotFather replies with a token like `123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`. **Copy it.**

Optional polish:
```
/setdescription
BeamixCEOBot
The Beamix war-room CEO. Send me a task or status request.
```

### 7.2 — Install Anthropic Telegram Channel plugin

In Claude Code:

```bash
claude
> /plugin install telegram@claude-plugins-official
```

Follow prompts:
- Paste the bot token from 7.1
- Default routing: `beamix-ceo` Routine
- Mention routing: `@cto` → `beamix-cto`, `@qa` → `beamix-qa-lead` (these don't exist yet — set up when you create those Routines in Step 9)

### 7.3 — Test

Open Telegram → search `@BeamixCEOBot` → start chat. Send:

```
status of Engineering project
```

Within ~10 seconds, bot replies with the current Engineering project status from Linear.

### Verify Step 7
- [ ] Bot exists, you can DM it
- [ ] DMs route to CEO Routine
- [ ] CEO can read Linear and reply

---

## STEP 8 — iOS Shortcut (voice → Linear ticket) (~10 min, your phone)

### 8.1 — Create the Shortcut

Open **Shortcuts** app on iPhone → **+** (top right).

Name: `Capture Beamix Idea`

Add actions in this order:
1. **Dictate Text** (Stop on tap)
2. **Get Contents of URL**
   - URL: `https://beamix-bridge.YOUR-CF-SUBDOMAIN.workers.dev/idea-capture`
   - Method: POST
   - Headers (add):
     - `Authorization`: `Bearer YOUR_SHORTCUT_SECRET` (you'll generate this in 8.2)
     - `Content-Type`: `application/json`
   - Request Body: JSON
     - `text`: (Magic Variable: Dictated Text)
3. **Speak Text**: `Captured`

Save.

### 8.2 — Generate a shortcut secret + tell me to write the endpoint

Generate a random secret:
```bash
openssl rand -hex 32   # copy the 64-char hex
```

Add to Cloudflare Worker:
```bash
cd infra/cloudflare-bridge
npx wrangler secret put SHORTCUT_SECRET   # paste the hex
npx wrangler deploy
```

Then update the Shortcut header with the same secret.

Tell me "**write the idea-capture endpoint**" and I'll add the `POST /idea-capture` route to the Cloudflare Worker (verifies bearer → Haiku triages → files Linear ticket in `Inbox` project).

### 8.3 — Add to Siri

Long-press the Shortcut → **Add to Siri** → record phrase: `Capture idea for Beamix`.

### 8.4 — Test

Hold side button on iPhone → say `Capture idea for Beamix` → speak the idea → Siri confirms `Captured`.

Linear ticket should appear in `Inbox` project within 5 seconds.

---

## STEP 9 — Wire the C-suite (CTO, CPO, CMO, CBO, CCO, QA Lead) (~25 min, Adam-mostly)

After CEO works end-to-end (Steps 1-7), repeat **Step 4** for each C-suite Routine:

| Routine name | Loads file | Model | Max turns | $ cap |
|--------------|-----------|-------|-----------|-------|
| `beamix-cto` | `.claude/agents/cto.md` | sonnet | 30 | $20 |
| `beamix-cpo` | `.claude/agents/cpo.md` | sonnet | 20 | $10 |
| `beamix-cmo` | `.claude/agents/cmo.md` | sonnet | 20 | $10 |
| `beamix-cbo` | `.claude/agents/cbo.md` | sonnet | 20 | $10 |
| `beamix-cco` | `.claude/agents/cco.md` | sonnet | 20 | $10 |
| `beamix-qa-lead` | `.claude/agents/qa-lead.md` | sonnet (Opus on Full-tier) | 30 | $30 |

For each, after creation:

```bash
cd infra/cloudflare-bridge
npx wrangler secret put ROUTINE_CTO_ENDPOINT
npx wrangler secret put ROUTINE_CTO_BEARER
# ... repeat for cpo, cmo, cbo, cco, qa-lead
npx wrangler deploy
```

The Worker code (which I write in Step 3) routes by Linear label `agent:cto` → CTO Routine, etc.

### Verify Step 9
- [ ] 6 Routines exist (CTO + CPO + CMO + CBO + CCO + QA Lead)
- [ ] All 12 secrets in Worker (endpoint+bearer × 6)
- [ ] Test: file ticket in `Engineering` with label `agent:cto` → CTO Routine handles it (not CEO)

---

## STEP 10 — Standing Routines (the heartbeat) (~10 min, joint)

After the C-suite is wired, create the 5 heartbeat Routines (V3 §3):

| Routine | Cron (Asia/Jerusalem) | Model |
|---------|-----------------------|-------|
| `beamix-morning-digest` | `30 7 * * *` | sonnet |
| `beamix-eod-sync` | `0 20 * * *` | haiku |
| `beamix-auto-unblock` | webhook on BLOCKED ticket label | sonnet |
| `beamix-monday-standup` | `0 8 * * 1` | sonnet |
| `beamix-friday-retro` | `0 18 * * 5` | sonnet |

Each loads `.claude/agents/_routines/<name>.md` (I'll write these in Wave E — say "**write the heartbeat routines**" when you're ready).

Auto-unblock requires extending the Worker to listen for label additions (`status:blocked` → fires the auto-unblock Routine). I add this when you say "**write auto-unblock trigger**".

---

## STEP 11 — Kill switches (~5 min, joint)

### 11.1 — Verify Anthropic hard cap

Console → Settings → Usage limits — confirm $200/mo cap from Step 2.2 is set.

### 11.2 — Halt-all script

Tell me "**write halt-all script**" and I'll create `scripts/halt-all.sh`:
- Pauses all Routines via Anthropic API
- Disables Cloudflare Worker (`npx wrangler deployments rollback` to no-op version)
- Posts to Linear `Strategy` project: `Fleet halted by Adam at YYYY-MM-DD HH:MM`
- Posts to Telegram

You run it from any machine with the repo:
```bash
pnpm halt:all
```

### 11.3 — UptimeRobot watchdog

Free at uptimerobot.com. Add HTTP monitor:
- URL: `https://beamix-bridge.YOUR-SUBDOMAIN.workers.dev/health`
- Interval: 5 min
- Alert via Telegram (use the same bot from Step 7 — UptimeRobot supports Telegram alerts directly)

### 11.4 — Permission allowlist in settings.json

Tell me "**add permissions block**" and I'll update `.claude/settings.json` with:
- Deny: `rm -rf`, `git push --force`, reading `.env*`, dropping prod tables
- Allow: `pnpm *`, `gh *`, `git status/diff/log/branch/worktree`
- Ask: `git push`, `supabase db push`

This applies to LOCAL Claude Code sessions (the Routines have their own permission scoping via Anthropic Console).

### Verify Step 11
- [ ] $200/mo cap visible
- [ ] `pnpm halt:all` script tested (briefly halt + restart)
- [ ] UptimeRobot monitoring the Worker
- [ ] Permission deny list in settings.json

---

## What "done" looks like

After Steps 1-11:

✅ You file a Linear ticket from your phone in any city in any timezone
✅ Within ~30 minutes, the company picks it up, executes, replies
✅ DM `@cto` in Telegram — skip CEO routing
✅ Dictate ideas to Siri — they land in Linear
✅ Every PR auto-reviewed by Claude before you approve
✅ Every morning at 07:30 you get a digest. Every Friday at 18:00 you get a retro PR
✅ Total NEW spend: $0/mo (everything else is in your existing Max + free tiers)
✅ If anything goes wrong: `pnpm halt:all` from any device
✅ Mac is OFF, you're on a flight, the company keeps running

---

## What I'm doing in parallel (Wave C — agent files)

While you do clicks for Steps 1-2, I'm writing in parallel:
- `.claude/agents/ceo.md` (rewritten, blended from OSS + R3 best practices)
- `.claude/agents/cto.md` (new, blended)
- `.claude/agents/qa-lead.md` (rewritten, blended)
- `.claude/agents/code-lead.md` (new, blended)

These are needed before Step 4 (CEO Routine creation). I'll have them ready by the time you finish Step 2.

---

## What you say to me to proceed at each step

| When you reach... | Say... | I deliver |
|-------------------|--------|-----------|
| End of Step 2 | "write the bridge" | Cloudflare Worker code (`infra/cloudflare-bridge/`) |
| Mid-Step 5 | "write the github workflow" | `.github/workflows/claude.yml` |
| Mid-Step 8 | "write the idea-capture endpoint" | New route in Worker |
| End of Step 9 | "write the heartbeat routines" | 5 `.claude/agents/_routines/*.md` files |
| Step 10 detail | "write auto-unblock trigger" | Worker extension to listen for BLOCKED label |
| Step 11.2 | "write halt-all script" | `scripts/halt-all.sh` |
| Step 11.4 | "add permissions block" | `.claude/settings.json` update |

Or: say "**start everything**" and I'll write **all** the code parts in one batch — bridge + workflow + endpoints + routines + scripts + permissions — and you do all the click parts in parallel.

---

## Pre-flight checklist before you start

- [ ] You're at a desk with phone + Mac (some steps need both)
- [ ] You have ~60-90 min uninterrupted (or you can spread across the week)
- [ ] You have your Anthropic Console password
- [ ] You have your GitHub password (for Linear webhook approval flow if Linear asks)
- [ ] You've read this guide once end-to-end

When ready, say one of:
- "**Start Step 1**" — you do Linear setup, I wait
- "**Write the agent files first**" — I do Wave C now, you do Step 1 in parallel
- "**Start everything**" — I write all the code, you do all the clicks, we converge on Step 6 test

**End of setup guide.**
