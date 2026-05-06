# Wave D — Linear System Build Plan
**Goal:** Wire Linear as the company's control plane. Adam files a ticket from his phone → CEO Routine picks it up → agents execute → status flows back to the same ticket.

**Target end state:** Adam types "build a public scan widget page" in Linear from his phone in a coffee shop. Within 30 minutes, a PR is open in GitHub, the QA Lead has reviewed it, and the Linear ticket has a comment with the PR link. Adam taps approve in GitHub mobile. Done.

**Sequenced by dependency. No dates. Each step has prerequisites, what to do, and verification.**

---

## What Adam personally must do (vs. what agents do)

| You do | Agents do |
|--------|-----------|
| Create accounts (Linear, Cloudflare) — needs your email | Configuration files, code |
| Generate API keys + webhook secrets | Store them in env vars |
| Approve permission scopes on OAuth screens | n/a |
| Approve the first test PR | n/a |
| Decide cost caps in Anthropic Console | n/a |

**Total Adam time: ~30-45 minutes of clicks across the build.** Rest is automated.

---

## Prerequisites (one-time, before Step 1)

- [ ] You have an Anthropic Console account with Max plan active ($100/mo)
- [ ] You have a GitHub account with the Beamix repo accessible
- [ ] You have an Apple ID (for Telegram/iMessage on phone)
- [ ] Wave A P0 fixes are done (or being done in parallel — they don't block this)

If any missing, flag now and we pause Wave D.

---

## STEP 1 — Linear setup

**Adam time: ~10 minutes**

### 1.1 — Create Linear workspace (if you don't already use one)

- Go to linear.app, sign up with adam419067@gmail.com
- Workspace name: `Beamix`
- Workspace URL: `beamix` (or whatever's available)
- Free tier is fine for solo

### 1.2 — Create the 8 projects

Linear → New Project. Create these EXACT names (the CEO routes by project name):

| Project name | Description | Color |
|--------------|-------------|-------|
| `Engineering` | Code work (features, bugs, refactors, infra) | Blue |
| `Product` | PRDs, specs, roadmap, user research | Green |
| `Marketing` | Content, SEO/GEO, campaigns, launch | Yellow |
| `Business` | Pricing, finance, legal, hiring | Emerald |
| `Customer Success` | Support, onboarding, retention, comms | Teal |
| `QA` | Cross-cutting quality work, security audits | Red |
| `Strategy` | Initiatives, board meetings, signal scans | Purple |
| `Inbox` | Adam's voice notes + ad-hoc captures (CEO triages from here) | Orange |

### 1.3 — Create the standard labels

Settings → Labels → New Label. Create these:

- `agent:ceo`, `agent:cto`, `agent:cpo`, `agent:cmo`, `agent:cbo`, `agent:cco`, `agent:qa-lead` (one per C-suite + QA, for routing)
- `tier:trivial`, `tier:lite`, `tier:full` (QA risk tier)
- `proposed-by-agent` (for autonomous proposals — you approve weekly)
- `do-not-build` (manual ANTI-ROADMAP marker)
- `risk:irreversible` (R3 control — needs explicit approval)

### 1.4 — Get Linear API key

- Linear → Settings → API → Personal API keys → "Create key"
- Name: `beamix-cloudflare-bridge`
- Scopes: All (you're the workspace owner)
- **Copy the key. Paste it into a notes app temporarily.** You'll add it to Cloudflare in Step 2.
- ⚠️ Treat like a password.

### 1.5 — Set up Linear webhook

- Linear → Settings → API → Webhooks → "New webhook"
- URL: `https://beamix-bridge.YOUR-CF-SUBDOMAIN.workers.dev/linear` *(you'll get this URL after Step 2 — leave webhook in DRAFT for now)*
- Resource types: ✅ Issue, ✅ Comment, ✅ Project
- All teams: ✅
- **Copy the webhook signing secret. Paste it into your notes app.**

### Verify Step 1
- [ ] 8 projects exist in Linear
- [ ] Labels created
- [ ] You have the API key + webhook secret saved (not in git)

---

## STEP 2 — Cloudflare Worker (the bridge)

**Adam time: ~10 minutes**

### 2.1 — Create Cloudflare account (if you don't have one)

- cloudflare.com → Sign up free
- No credit card needed for what we'll use

### 2.2 — Install Wrangler CLI on the Bastion Mac (or your laptop)

```bash
# In Beamix repo (not in worktree — main repo root)
cd /Users/adamks/VibeCoding/Beamix
pnpm add -D -w wrangler
npx wrangler login
```

Browser opens, you click "Allow." Wrangler is now authenticated to your Cloudflare account.

### 2.3 — Agent will create the Worker code

I'll give you the directory structure and code. You don't write it.

```
Beamix/
└── infra/
    └── cloudflare-bridge/
        ├── wrangler.toml          ← config
        ├── src/
        │   └── index.ts           ← the Worker (verify HMAC, route to Routine)
        └── README.md              ← deploy instructions
```

Once an agent creates these files (Wave D deliverable), you run:

```bash
cd infra/cloudflare-bridge
# Set secrets (one-time, interactive — wrangler will prompt)
npx wrangler secret put LINEAR_WEBHOOK_SECRET    # paste from Step 1.5
npx wrangler secret put LINEAR_API_KEY            # paste from Step 1.4
npx wrangler secret put ANTHROPIC_API_KEY         # from console.anthropic.com
npx wrangler secret put ROUTINE_CEO_ENDPOINT      # paste after Step 3
npx wrangler secret put ROUTINE_CEO_BEARER        # paste after Step 3

# Deploy
npx wrangler deploy
# → outputs: https://beamix-bridge.adam-419067.workers.dev/
```

### 2.4 — Update the Linear webhook URL

- Go back to Linear webhook from Step 1.5
- Update URL to: `https://beamix-bridge.adam-419067.workers.dev/linear` (use your real subdomain)
- Toggle to ACTIVE

### Verify Step 2

- [ ] Worker deployed (URL responds with 200 on `/health`)
- [ ] Linear webhook configured + active
- [ ] Test: create a dummy ticket in Linear → check Cloudflare dashboard logs → see request arrive

---

## STEP 3 — Anthropic Routine setup (the CEO)

**Adam time: ~10 minutes (mostly clicks in the console)**

### 3.1 — Set per-Routine cost cap in Anthropic Console

- console.anthropic.com → Settings → Usage limits
- Set **monthly hard cap: $200/mo** (well below your $100/mo Max + buffer)
- Set **per-Routine cap: $20/run** (kill-switch for runaway loops)

### 3.2 — Create the CEO Routine

In Claude Code (terminal):

```bash
cd /Users/adamks/VibeCoding/Beamix
claude --create-routine ceo
# → opens an interactive flow
```

Configure:
- **Name:** `beamix-ceo`
- **Schedule:** On-demand only (no cron)
- **System prompt:** loads `.claude/agents/ceo.md` (the V4 CEO definition — agent will write this in Wave C)
- **Tools:** `Read, Write, Edit, Bash, Task` + MCP tools (linear, github, supabase)
- **MCPs to enable:** `linear-mcp`, `github-mcp`, `supabase-mcp` (configured in Step 4)
- **Model:** `claude-sonnet-4-6`
- **Max turns per invocation:** 30
- **Hard $ cap per invocation:** $20 (matches Step 3.1)
- **Worktree isolation:** YES (`isolation: worktree` in agent frontmatter)

### 3.3 — Get the Routine endpoint

After creation, Anthropic Console gives you:
- Endpoint: `https://api.anthropic.com/v1/routines/<routine-id>/fire`
- Bearer token: `sk-ant-routine-...`

**Add both to Cloudflare Worker secrets** (Step 2.3 — if you didn't do it then, now's the time):

```bash
cd infra/cloudflare-bridge
npx wrangler secret put ROUTINE_CEO_ENDPOINT   # paste endpoint
npx wrangler secret put ROUTINE_CEO_BEARER     # paste bearer token
npx wrangler deploy
```

### Verify Step 3

- [ ] CEO Routine exists in Anthropic Console
- [ ] You have its endpoint URL + bearer token
- [ ] Both are stored in Cloudflare Worker secrets
- [ ] Worker has been re-deployed with the new secrets

---

## STEP 4 — Linear MCP (so agents can write back)

**Adam time: ~5 minutes**

### 4.1 — Install Linear MCP server

Linear MCP is official. Anthropic's directory: `https://github.com/anthropics/mcp-servers/tree/main/src/linear` *(or use the upstream Linear-published one)*.

In your Claude Code config (`~/.claude/settings.json` or project's `.claude/settings.json`):

```json
{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["-y", "@linear/mcp-server"],
      "env": {
        "LINEAR_API_KEY": "${LINEAR_API_KEY}"
      }
    }
  }
}
```

### 4.2 — Set the env var

```bash
# Add to ~/.zshrc or .env
export LINEAR_API_KEY=lin_api_...   # from Step 1.4
```

### 4.3 — Verify MCP works locally

```bash
# In Claude Code (interactive)
claude
> /mcp
# Should show: linear (connected) — N tools available
```

If "linear (failed)" — check the API key, make sure `npx @linear/mcp-server` runs cleanly.

### 4.4 — Add Linear MCP to the CEO Routine config

In Anthropic Console → Routines → `beamix-ceo` → MCPs → Add `linear` with the same env config.

### Verify Step 4

- [ ] Linear MCP connected locally (`/mcp` shows it green)
- [ ] Linear MCP added to the CEO Routine config
- [ ] Test: `claude` → "list my Linear projects" → should return 8 projects

---

## STEP 5 — End-to-end test loop

**Adam time: ~5 minutes (mostly waiting + clicking)**

### 5.1 — Create a test ticket in Linear

- Project: `Engineering`
- Title: `Update README with Wave D status`
- Description: `Add a single line to README.md saying "Wave D Linear bridge online — YYYY-MM-DD"`
- Labels: `tier:trivial`
- Assignee: leave blank (CEO will pick)

### 5.2 — Watch the loop fire

Within ~30-60 seconds:
1. Linear webhook fires
2. Cloudflare Worker logs show: `received Linear issue created event, routing to ceo Routine`
3. Anthropic Console → Routines → `beamix-ceo` shows: `running (started Xs ago)`
4. Within ~2-5 minutes, the Linear ticket should have a comment from `beamix-ceo`:
   ```
   Picked up by CEO. Routing to CTO → Code Lead → backend-engineer.
   Worktree: feat/wave-d-readme. PR will follow.
   ```

### 5.3 — Approve the PR

If everything worked:
1. GitHub repo gets a new branch + PR (titled `feat: wave d readme update`)
2. The PR has the README change
3. The Linear ticket has a comment: `PR opened: github.com/Adam077K/Beamix/pull/N`
4. You approve in GitHub mobile → merges → ticket auto-closes

### 5.4 — If something fails

Common failures + fixes:

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Webhook doesn't fire | Linear webhook URL wrong / inactive | Recheck Step 1.5 |
| Worker logs show 401 | HMAC verification failing | Re-paste `LINEAR_WEBHOOK_SECRET` in Step 2.3 |
| Routine doesn't fire | Worker secrets missing/wrong | Re-paste `ROUTINE_CEO_ENDPOINT` + `ROUTINE_CEO_BEARER` |
| Routine fires but no Linear comment | Linear MCP not connected | Re-do Step 4 |
| Routine errors out with "no agent file" | `.claude/agents/ceo.md` missing — Wave C not done | Run Wave C first OR use a temporary inline system prompt |

### Verify Step 5

- [ ] Test ticket fires → Worker → Routine → Linear comment → GitHub PR
- [ ] You approved the PR and it merged
- [ ] You can repeat this with a real ticket and it works

**🎉 Linear-as-the-Company is now live. From this moment, you can file a Linear ticket from your phone and the company picks it up.**

---

## STEP 6 — Add Telegram bot (DM the CEO from anywhere)

**Adam time: ~10 minutes**

### 6.1 — Create Telegram bot via BotFather

- Open Telegram → search for `@BotFather` → start chat
- Send `/newbot`
- Bot name: `BeamixCEO`
- Username: `BeamixCEOBot` (must end in Bot)
- BotFather replies with a token like `123456789:ABC-DEF...`
- **Copy the token.**

### 6.2 — Install official Anthropic Telegram Channel plugin

In Claude Code:

```bash
claude
> /plugin install telegram@claude-plugins-official
# Follow the prompts:
#   - Paste the bot token from Step 6.1
#   - Bot will be linked to your Anthropic account
```

### 6.3 — Configure routing

In Anthropic Console → Channels → `telegram` → Routing:
- Default: `beamix-ceo` Routine
- Mention `@cto`: `beamix-cto` Routine (when Wave D2 adds it — for now, route all to CEO)
- Mention `@qa`: `beamix-qa-lead` Routine (later)

### 6.4 — Test

- Open Telegram → search `@BeamixCEOBot` → start chat
- Send: `Status of Engineering project`
- Within 10s, bot replies with summary

### Verify Step 6

- [ ] Telegram bot exists and you can DM it
- [ ] DMs route to CEO Routine
- [ ] CEO can read Linear and reply via Telegram

---

## STEP 7 — Add `claude-code-action` for PR review

**Adam time: ~5 minutes**

### 7.1 — Install GitHub App

In Claude Code:

```bash
claude
> /install-github-app
# Browser opens → install Claude Code GitHub App on Adam077K/Beamix
# Approve permissions (read/write code, PR comments, etc.)
```

### 7.2 — Add the workflow file

Agent creates `.github/workflows/claude.yml` (Wave D deliverable):

```yaml
name: Claude Code Review
on:
  pull_request:
    types: [opened, synchronize]
  issue_comment:
    types: [created]
jobs:
  claude:
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          # Triggers: PR open OR `@claude` mention in comment
```

### 7.3 — Add ANTHROPIC_API_KEY to GitHub repo secrets

- GitHub repo → Settings → Secrets → Actions → New
- Name: `ANTHROPIC_API_KEY`
- Value: paste from console.anthropic.com

### 7.4 — Test

- Open any PR → bot comments with review within ~2 min
- Comment `@claude please look at the auth check` → bot responds in ~30s

### Verify Step 7

- [ ] GitHub App installed
- [ ] Workflow file in `.github/workflows/claude.yml`
- [ ] Secret set
- [ ] Bot comments on PRs

---

## STEP 8 — iOS Shortcut (voice → Linear ticket)

**Adam time: ~10 minutes (one-time)**

### 8.1 — Create the Shortcut

Open Shortcuts app on iPhone:

1. New Shortcut → name it `Capture Idea`
2. Add action: `Dictate Text` (Stop on tap)
3. Add action: `Get Contents of URL`
   - URL: `https://beamix-bridge.YOUR-SUBDOMAIN.workers.dev/idea-capture`
   - Method: POST
   - Headers: `Authorization: Bearer YOUR_SHORTCUT_SECRET` (you set this in Step 8.2)
   - Body: `{"text": "[Dictated Text]"}`
4. Add action: `Speak Text` saying "Captured"

### 8.2 — Add /idea-capture endpoint to Cloudflare Worker

Agent extends the Worker with a new route:
- `POST /idea-capture` → verify bearer → call Anthropic API (Haiku, $0.001) to triage → file Linear ticket in `Inbox` project

### 8.3 — Add to Siri

Long-press Shortcut → "Add to Siri" → record "Capture idea for Beamix"

Now: hold the side button on iPhone, say "Capture idea for Beamix," speak the idea, Siri confirms "Captured." Linear ticket appears in Inbox.

### Verify Step 8

- [ ] "Hey Siri, capture idea for Beamix" works
- [ ] Linear ticket appears in Inbox project within 5s
- [ ] Ticket has the dictated text

---

## STEP 9 — Wire the C-suite (CTO, CPO, CMO, CBO, CCO)

**Adam time: ~5 minutes per Routine × 5 = ~25 minutes**

After CEO works end-to-end, repeat Step 3 for each C-suite Routine:
- `beamix-cto` (loads `.claude/agents/cto.md`)
- `beamix-cpo` (loads `.claude/agents/cpo.md`)
- `beamix-cmo` (loads `.claude/agents/cmo.md`)
- `beamix-cbo` (loads `.claude/agents/cbo.md`)
- `beamix-cco` (loads `.claude/agents/cco.md`)
- `beamix-qa-lead` (loads `.claude/agents/qa-lead.md`)

For each, add the endpoint+bearer to the Cloudflare Worker secrets:
```
ROUTINE_CTO_ENDPOINT, ROUTINE_CTO_BEARER
ROUTINE_CPO_ENDPOINT, ROUTINE_CPO_BEARER
... etc
```

Worker code routes by Linear label or Telegram mention:
- Ticket has `agent:cto` label → fire CTO Routine
- Telegram DM contains `@cto` → fire CTO Routine
- Default → CEO

### Verify Step 9

- [ ] All 6 Routines exist in Anthropic Console
- [ ] Worker can route to each one
- [ ] Test: file ticket with `agent:cto` label → CTO Routine handles it

---

## STEP 10 — Standing Routines (the heartbeat)

**Adam time: ~10 minutes total (5 Routines × 2 min each in Console)**

For each of the 5 heartbeat Routines (V3 §3), create in Anthropic Console:

| Routine | Schedule | Loads |
|---------|----------|-------|
| `beamix-morning-digest` | Daily 07:30 Asia/Jerusalem | `.claude/agents/_routines/morning-digest.md` |
| `beamix-eod-sync` | Daily 20:00 Asia/Jerusalem | `.claude/agents/_routines/eod-sync.md` |
| `beamix-auto-unblock` | On-demand (fired by webhook on BLOCKED tickets) | `.claude/agents/_routines/auto-unblock.md` |
| `beamix-monday-standup` | Mon 08:00 Asia/Jerusalem | `.claude/agents/_routines/monday-standup.md` |
| `beamix-friday-retro` | Fri 18:00 Asia/Jerusalem | `.claude/agents/_routines/friday-retro.md` |

Each needs the Linear MCP, GitHub MCP, and Supabase MCP.

(The 3 signal Routines come in Wave G when we add the data layer.)

### Verify Step 10

- [ ] 5 heartbeat Routines visible in Console
- [ ] Tomorrow morning at 07:30 you get a Telegram digest
- [ ] Friday at 18:00 you get a PR with proposed agent .md edits

---

## STEP 11 — Lock down the kill switches (R3 risk hardening)

**Adam time: ~5 minutes**

Before this is "live for real," make sure you can stop it.

### 11.1 — Anthropic Console hard cap

Already done in Step 3.1 — verify $200/mo cap is set.

### 11.2 — Pause-all command

Agent will create a script in repo: `scripts/halt-all.sh`. Running it:
- Pauses all Routines (via Anthropic API)
- Disables Cloudflare Worker (via wrangler)
- Posts to Telegram + Linear: "Fleet paused by Adam at YYYY-MM-DD HH:MM"

You can run it from any device with Claude Code installed:
```bash
claude --bare "halt all Beamix Routines"
```

### 11.3 — UptimeRobot watchdog (free tier)

- uptimerobot.com → free account
- Add HTTP monitor on Cloudflare Worker `/health` endpoint
- Alert via SMS or Telegram if down >5 min

### 11.4 — Permission allowlist on agent tool grants

Already done in Wave B (V1) — verify `.claude/settings.json` has the deny list.

### Verify Step 11

- [ ] $200/mo cap visible in Anthropic Console
- [ ] `halt-all.sh` script tested (briefly halt and restart)
- [ ] UptimeRobot monitoring the Worker
- [ ] Permission deny list in settings.json

---

## What "done" looks like

After all 11 steps:

✅ You can file a Linear ticket from your phone in any city in any timezone
✅ Within ~30 minutes, the company picks it up, executes, and replies
✅ You can DM `@cto` in Telegram and skip the CEO routing
✅ You can dictate ideas to Siri and they land in Linear
✅ Every PR gets reviewed by Claude before you approve
✅ Every morning at 07:30 you get a digest. Every Friday at 18:00 you get a retro PR
✅ Cost is $0-11/mo new spend on top of your existing $155/mo
✅ If anything goes wrong, you can stop it from any device
✅ Mac is OFF, you're on a flight, the company keeps running

---

## What this build does NOT include (intentional, for later waves)

- Defining all 60 agent .md files (Wave C — coming next or in parallel)
- Skill embeddings in pgvector (Wave E)
- Day-1 data lock for the 5 moats (Wave G)
- Async-spec-trust mode (Wave G)
- The 7 new company-org agents (Wave G)
- Symphony-style full lifecycle Linear events (Wave H)

This is the **minimum viable Linear control plane**. Build it, use it, then layer the rest.

---

## Decisions you make during this build

| At step | Decision | Recommended |
|---------|----------|-------------|
| 1.1 | Linear free tier or Standard ($8/mo)? | Free for now |
| 3.1 | Monthly $ hard cap | $200/mo |
| 3.2 | Per-Routine model (Sonnet vs Haiku for the CEO) | Sonnet for CEO |
| 6.3 | Telegram routing rules | Default to CEO, mention-based for C-suite |
| 11.1 | UptimeRobot or skip? | Yes, free tier |

---

## What I (CEO agent) need from you to actually start building

I cannot create the Linear workspace, Cloudflare account, or click through OAuth flows for you. **Adam-only steps:**
- Step 1.1, 1.2, 1.3, 1.4, 1.5 (Linear)
- Step 2.1 (Cloudflare account)
- Step 3.1, 3.2 (Anthropic Console + Routine creation)
- Step 6.1 (Telegram BotFather)
- Step 7.1 (GitHub App install — opens browser)
- Step 8 (iOS Shortcut on your phone)

**Agent-doable steps** (I can do these once you greenlight):
- Step 2.2-2.4 (Worker code)
- Step 3.3 (after you give me the endpoint/bearer)
- Step 4 (MCP config files)
- Step 7.2-7.3 (workflow file + repo secrets — you paste the secret value but I can write the file)
- Step 8.2 (Worker /idea-capture endpoint)
- Step 9 (after you create each Routine)
- Step 10 (Routine config + agent .md files)
- Step 11.2 (halt-all script)

**Approximate order of execution:**

1. You do Steps 1.1-1.5 (Linear setup, ~10 min)
2. I write the Cloudflare Worker code (Step 2.2 deliverable)
3. You do Steps 2.1, 2.3, 2.4 (CF account, deploy Worker)
4. You do Steps 3.1-3.3 (Anthropic Routine)
5. We do Step 4 together (MCP — I write config, you set env var)
6. We do Step 5 (test loop together)
7. You do Steps 6.1, 7.1 (Telegram + GitHub App)
8. I write Steps 7.2, 8.2, 11.2 (workflow file, idea-capture endpoint, halt script)
9. You do Step 8 (iOS Shortcut on phone — I can't touch your phone)
10. You do Step 9 (5 more Routines, ~25 min)
11. We do Step 10 (Routines + agent .md files for the heartbeat)
12. You do Step 11 (kill switches verified)

**Total Adam time across the build: ~60-90 minutes spread across the steps.** Most of it is paste-token-here clicks, not thinking.

---

**End of Wave D build plan. When you're ready, say the word and I'll start writing the Cloudflare Worker code (Step 2.2 — first agent-doable deliverable).**
