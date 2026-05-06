# Triggering Claude Agents from Linear / Slack / GitHub

**Author:** researcher (purple) · **Date:** 2026-05-05 · **For:** CEO war-room rethink
**Question:** What working patterns exist today (May 2026) to make Adam file a task in Linear (or Slack, or a GitHub issue) and have a named Claude Code agent pick it up, do work, and report back — like assigning to a human?

---

## TL;DR — The Three Real Choices

| Path | What it is | Time to "Linear ticket → PR" | $/run | Best for |
|---|---|---|---|---|
| **A. Claude Code Routines (Anthropic-hosted)** | Anthropic-managed cloud sessions with API/GitHub/schedule triggers, MCP connectors for Linear/Slack | **Hours** | API rates + $0.08/runtime hr | Fastest MVP; one user; lock-in |
| **B. Linear Agent + Vercel webhook + headless `claude -p`** | You implement Linear's official Agent protocol; webhook hits Vercel; spawns `claude -p` in a sandbox; agent appears as a real Linear assignee | **Days** | API only (~$0.01–$0.50/task) | Production multi-user, branded "BuildLead" / "ResearchLead" agents in Linear UI |
| **C. `claude-code-action` on GitHub (already free)** | `@claude` mention on GitHub issue/PR triggers official Anthropic Action; opens PR | **Minutes** | API only + GH Actions minutes | Developer-only flows; no Linear |

The 11-agent Beamix roster maps best to **B** (each agent = a separate Linear App user). **A** is the cheapest stepping stone. **C** should ship in week 1 regardless — it's a 30-line YAML.

---

## 1. Reference Architectures (5 working patterns)

### Pattern 1 — Claude Code Routines (Anthropic-managed cloud)

**Diagram:**
```
Linear/Sentry/Cron ──HTTP POST──▶ api.anthropic.com/v1/claude_code/routines/{id}/fire
                                  ├─ runs in Anthropic cloud sandbox
                                  ├─ clones GH repo, executes prompt
                                  ├─ uses MCP connectors (Linear, Slack, GH)
                                  └─ opens PR on claude/* branch, Slack ping, Linear comment
```

**Components:** Per-routine bearer token, claude.ai account, GH App install, MCP connectors (Linear/Slack are first-party connectors).

**Triggers supported:** Schedule (≥1hr min), API (`POST /fire` with `{"text": "..."}` body), GitHub events (`pull_request.*`, `release.*`).

**Who uses it:** Solo devs, indie hackers (the "shareuhack" patterns); Anthropic positions it as cron-killer for AI tasks. Launched April 14, 2026, research preview.

**Pros:** Zero infra. Linear/Slack MCP connectors are pre-wired. Per-routine API URL = trivial Linear webhook bridge. Sessions visible at claude.ai/code.
**Cons:** Tied to one claude.ai user account (everything appears as Adam). Daily caps (Pro 5/day, Max 15, Team 25 — webhook/API don't count toward cap, schedules do). Beta header `experimental-cc-routine-2026-04-01` may break. **No native Linear "agent" identity** — replies come from Adam.

---

### Pattern 2 — Linear Agent (official) + Cloudflare Worker + headless `claude -p`

**Diagram:**
```
Linear "@build-lead" mention ──webhook──▶ Cloudflare Worker / Vercel Edge
                                          ├─ verify HMAC-SHA256 (Linear-Signature header)
                                          ├─ within 10s: POST AgentActivity {type:"thought"}
                                          ├─ spawn `claude -p --bare` in container/Modal
                                          ├─ stream events back as AgentActivity {type:"action"}
                                          └─ final: AgentActivity {type:"response"} + GH PR link
```

**Components:**
- Linear OAuth app with `actor=app` flag, scopes: `app:assignable`, `app:mentionable`, `issues:write`, `comments:write`
- Webhook subscribed to **Agent session events**
- Token store (Cloudflare KV in the official `linear/linear-agent-demo`)
- Container/serverless to run `claude -p` (10s ack window, but full work can run async)
- Linear `agentActivityCreate` GraphQL mutation to post thoughts/actions/responses

**Who uses it:** Reflag (blog post: "Building the Reflag Linear Agent"). Linear's own demo (`linear/linear-agent-demo`, archived but reference). The pattern is officially documented at linear.app/developers/agents.

**Pros:** Each agent = separate Linear App = real assignee, real @-mention, shows in mention menu, has its own avatar. Survives across comments via `prompted` webhook delivering follow-up text in `agentActivity.body`. State managed by Linear (lifecycle: `pending` → `active` → `awaitingInput` → `complete`).
**Cons:** Requires admin install. Build effort ~1–2 weeks per polished agent. You manage compute cost for `claude -p` runs.

---

### Pattern 3 — `claude-code-action` on GitHub (Anthropic official)

**Diagram:**
```
GitHub issue/PR comment "@claude fix X" ──issue_comment──▶ GitHub Actions runner
                                                            ├─ checks trigger_phrase
                                                            ├─ runs Claude Code with allowedTools
                                                            ├─ creates branch claude/<slug>
                                                            └─ opens PR via GH API (signed commits opt-in)
```

**Components:** `anthropics/claude-code-action@v1`, `ANTHROPIC_API_KEY` secret, ~30-line YAML.

**Inputs that matter:** `trigger_phrase` (default `@claude`), `claude_args` (`--max-turns`, `--model`, `--allowedTools`), `branch_prefix` (default `claude/`), `use_commit_signing`, `allowed_bots` (whitelist Linear-bot if you want chained workflows), `additional_permissions`, `plugin_marketplaces` + `plugins` for shared agent personas.

**Who uses it:** Hundreds of public repos; this is the standard. `claude-did-this/claude-hub` is a self-hosted variant (TypeScript + Docker, container-per-event isolation).

**Pros:** 5-minute setup. Official. Free aside from API + GH Actions minutes. Two modes auto-detected: **tag mode** (responds to `@claude`) and **agent mode** (runs from prompt input, no mention needed — perfect for Linear→GH bridges).
**Cons:** GitHub-only. No Linear/Slack identity. One repo per workflow file.

---

### Pattern 4 — Slack-native via Anthropic's Claude app + Claude Code on the web

**Diagram:**
```
Slack channel "@Claude fix the auth bug" ──Slack app──▶ Anthropic-hosted router
                                                        ├─ classifies "Code only" vs "Code + Chat"
                                                        ├─ creates session at claude.ai/code
                                                        ├─ posts thread updates back to Slack
                                                        └─ "Create PR" button → GitHub PR
```

**Components:** Slack App Marketplace install (App ID `A08SF47R6P4`), GitHub repo connected via Claude Code on the web, individual user connection in App Home. Each user runs sessions under their own plan.

**Who uses it:** GA across Pro/Max/Team/Enterprise plans (announced Dec 8, 2025). Block, Stripe, and Coinbase publicly built variants of this pattern internally before Anthropic shipped first-party (DevOps.com piece on "Open SWE captures the architecture Stripe/Coinbase/Ramp built independently").

**Pros:** Zero code. Channel-membership ACL. Threads carry context.
**Cons:** Channel-only (no DMs). One PR per session. No custom agent personas — always "Claude". User-scoped, not workspace-scoped agents.

---

### Pattern 5 — DIY Slack Bot wrapping `claude -p` (the Hive Ix / dotdc pattern)

**Diagram:**
```
Slack Events API ──▶ Go/TS service on GKE/Vercel
                     ├─ on app_mention or message.channels
                     ├─ shell out: exec.Command("claude", "-p", prompt)
                     ├─ stream Slack chat.postMessage updates
                     └─ persist thread_ts → session_id mapping for --resume
```

**Components:** Slack Bolt SDK, subprocess to `claude -p --output-format stream-json --include-partial-messages`, KV/Redis for thread→session mapping (use `claude -p ... --resume <session_id>`).

**Who uses it:** David Calvert's "Building an agentic Slackbot with Claude Code" (Medium); WorkOS's blog bot; `mpociot/claude-code-slack-bot`; jeremylongshore's `claude-code-slack-channel`.

**Pros:** Total control over prompt, model, allowedTools, agent identity (one Slack bot per agent persona).
**Cons:** You own auth, secrets, retries, observability. Without HumanLayer-style approvals, can run wild.

---

## 2. Recommended Stack for Beamix

Given the 11 named agents (build-lead, research-lead, design-lead, qa-lead, devops-lead, data-lead, product-lead, growth-lead, business-lead + workers) and the requirement that each agent feels like a separate teammate:

### Phase 1 (week 1, MVP — "make it work today")

- **GitHub:** `claude-code-action@v1` on the Beamix repo. `trigger_phrase: @claude`. `branch_prefix: claude/`. Lets Adam open a GH issue and `@claude fix` from anywhere.
- **Linear (cheap path):** One Claude Code Routine per *frequent flow* (e.g., "Linear bug triage", "PR review checklist"), API trigger. A Vercel Edge function (`/api/linear-webhook`) verifies Linear HMAC, parses the comment, and POSTs to the matching routine's `/fire` endpoint with `{"text": <issue + comment>}`. Routine uses MCP-Linear to comment back.
- **Slack:** Install official Anthropic Claude app. `Code only` routing mode. Use for "kick off a coding task while I'm in Slack."

Time to first "Linear ticket → PR": **same day**. Cost: API + $0.08/hr runtime.

### Phase 2 (weeks 2–4 — "make it ours")

- **Linear Agent per persona.** Register **3 agents first**: `beamix-build` (handles `@build`), `beamix-research` (handles `@research`), `beamix-qa` (handles `@qa`). Each is a separate Linear OAuth app, separate avatar. Webhook bridge (one Cloudflare Worker, fork of `linear/linear-agent-demo`) routes by mention name → spawns the right system prompt → runs `claude -p --bare --append-system-prompt-file ./agents/build-lead.md`.
- **Identity mapping:** Slack channels mirror Linear agents — `#beamix-build`, `#beamix-research`. Slack bot per persona (Pattern 5) reuses the same prompt files.
- **Approvals:** Wrap dangerous tools (Bash unrestricted, file writes outside `/tmp`) with **HumanLayer** (`@hl.require_approval()` decorator, sends Slack DM to Adam, returns approve/deny synchronously). Free tier: 1,000 ops/month.

### Phase 3 (when usage grows — "make it cheap and observable")

- Move webhook bridge to **Hookdeck** in front of Vercel for retry/replay/inspection.
- Move agent runs to **Modal** or **Trigger.dev** durable jobs (so you don't pay Cloudflare for a 4-minute Claude run; durable retries on transient API failures; per-job logs).
- Per-agent budgets: hard daily $ cap via API key per agent in Anthropic Console.
- Move state from KV to Postgres (Supabase already in stack): table `agent_sessions(linear_session_id, claude_session_id, agent_persona, started_at, last_activity_at, cost_usd)`.

### Why this stack (vs. alternatives considered)

- **Routines alone:** caps out at 25/day on Team plan; everything looks like Adam in Linear; no per-persona branding.
- **`claude-code-action` alone:** GitHub-only; Linear is Adam's primary task tool.
- **n8n/Zapier:** adds a vendor in the path; Linear and Anthropic both expose first-class webhooks/APIs — direct is simpler.
- **`humanlayer/codelayer` IDE:** designed for IDE orchestration of parallel sessions, not webhook-driven external triggers. Use HumanLayer's *approval SDK* but not their IDE.

---

## 3. Implementation Recipe — "Linear ticket → PR" (cheapest MVP path)

### Step 0 — Prereqs (one-time, ~30 min)

- Anthropic API key with usage cap set per-agent.
- GitHub App: install the **Claude GitHub App** on `Adam077K/Beamix`.
- Linear: workspace admin role.
- claude.ai paid plan (Pro $20 minimum) with Claude Code on the web enabled.

### Step 1 — Phase 1 GitHub `@claude` (5 min)

`.github/workflows/claude.yml`:
```yaml
name: Claude
on:
  issue_comment: { types: [created] }
  pull_request_review_comment: { types: [created] }
  issues: { types: [opened, assigned, labeled] }
jobs:
  claude:
    runs-on: ubuntu-latest
    permissions: { contents: write, pull-requests: write, issues: write }
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          trigger_phrase: "@claude"
          branch_prefix: "claude/"
          claude_args: |
            --model claude-sonnet-4-6
            --max-turns 30
            --allowedTools Edit,Read,Write,Bash(git *),Bash(pnpm *),Bash(gh *)
```
Commit. Done. Open any issue, type `@claude implement X`, get a PR.

### Step 2 — Phase 1 Linear (afternoon)

1. Create one Routine in claude.ai/code/routines named "Linear ticket handler". Prompt:
   ```
   You are receiving a Linear issue. The issue body is in the {text} input.
   Parse it, clone the relevant repo (Adam077K/Beamix), implement the change
   on a claude/<slug> branch, open a PR, and comment back on the Linear issue
   with the PR URL using the Linear MCP connector.
   ```
   Repo: `Adam077K/Beamix`. Connectors: enable **Linear** + **GitHub**. Trigger: **API**. Generate token.

2. Vercel function `apps/web/app/api/linear-webhook/route.ts`:
   ```ts
   import crypto from "node:crypto";
   export const runtime = "edge";
   export async function POST(req: Request) {
     const raw = await req.text();
     const sig = req.headers.get("linear-signature")!;
     const expected = crypto.createHmac("sha256", process.env.LINEAR_WEBHOOK_SECRET!)
       .update(raw).digest("hex");
     if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
       return new Response("bad sig", { status: 401 });
     }
     const evt = JSON.parse(raw);
     if (evt.type === "Comment" && evt.data.body?.includes("@claude")) {
       await fetch(process.env.ROUTINE_FIRE_URL!, {
         method: "POST",
         headers: {
           "Authorization": `Bearer ${process.env.ROUTINE_TOKEN}`,
           "anthropic-beta": "experimental-cc-routine-2026-04-01",
           "anthropic-version": "2023-06-01",
           "Content-Type": "application/json",
         },
         body: JSON.stringify({ text: `Linear ${evt.url}\n\n${evt.data.body}` }),
       });
     }
     return new Response("ok");
   }
   ```

3. Linear → Settings → API → Webhooks → add `https://<your-vercel>/api/linear-webhook`, subscribe to Comment events, copy signing secret to `LINEAR_WEBHOOK_SECRET`.

4. Adam files a Linear ticket, comments `@claude please implement`, ~2–6 minutes later the routine opens a PR and comments the link back. **Done.**

### Step 3 — Env vars summary

```
ANTHROPIC_API_KEY        # API key, $-capped per agent in Console
LINEAR_WEBHOOK_SECRET    # from Linear webhook setup
LINEAR_OAUTH_TOKEN       # for Phase 2 (per-agent OAuth app)
ROUTINE_FIRE_URL         # https://api.anthropic.com/v1/claude_code/routines/<id>/fire
ROUTINE_TOKEN            # bearer, generated once, store in Vercel
GH_APP_ID / GH_APP_KEY   # if going beyond claude-code-action defaults
HUMANLAYER_API_KEY       # phase 2 approvals
```

### Step 4 — Security model

- Linear HMAC verification on raw body, timing-safe compare, 60s replay window.
- Anthropic API keys: one per agent persona, per-agent monthly $ cap in Console (e.g., $50/agent/mo).
- Routine bearer tokens: stored in Vercel env vars, never echoed to logs, rotatable.
- GitHub: `claude-code-action` uses ephemeral `GITHUB_TOKEN` per run; no long-lived PAT.
- `claude -p` in Phase 2: always run with `--bare --allowedTools <explicit list>` and `--permission-mode dontAsk`. No `Bash(*)`.
- Secrets never in prompts (HumanLayer enforces this; or use git-secret pre-commit hook).

### Step 5 — MVP cost estimate

| Item | Cost |
|---|---|
| claude.ai Pro (1 user, hosts routines) | $20/mo |
| Routine runtime: 50 runs/mo × 5min avg × $0.08/hr | ~$0.33/mo |
| Anthropic API tokens (Sonnet-heavy, ~50 PRs/mo, 200K tokens each) | ~$30/mo |
| Vercel Edge function (free tier suffices) | $0 |
| GitHub Actions (Phase 1): 50 runs × 4min × free 2000min/mo | $0 |
| Linear (existing) | $0 incremental |
| **Total Phase 1** | **~$50/mo** |

Phase 2 adds Cloudflare Workers (~$5/mo), HumanLayer free tier ($0 up to 1K ops), still under $100/mo.

---

## 4. Failure Modes & Mitigations

| Failure | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Cost runaway**: agent loops on `Bash` reading huge logs | High | $100s/day | Per-agent monthly $ cap in Anthropic Console; `--max-turns 30`; never allow `Bash(*)` — always `Bash(git *)`-style allowlists |
| **Infinite loop**: agent comments on Linear → webhook fires → agent comments again | High | Cost runaway + ticket spam | Filter webhook by `actor.id != AGENT_APP_ID`; ignore comments from agent users; use Linear's `OauthClient` actor field |
| **Leaked secrets in logs/prompts** | Medium | Critical | `--bare` mode (no auto memory load); `pre-commit` secret scan (claude-hub does this); HumanLayer for any `Bash` writing to public locations; never echo `process.env` |
| **Webhook misses HMAC verification** → spoofed task | Low/Critical | RCE on your sandbox | Always verify `Linear-Signature` (HMAC-SHA256, raw body, timing-safe compare); reject if `webhookTimestamp` >60s old |
| **Linear 5s/10s response window missed** → session marked unresponsive | Medium | UX broken | Always respond webhook 200 within 5s; queue work to a separate worker; emit `thought` activity within 10s |
| **Anthropic API rate limit / 529** | Medium | Tasks queue up | Listen for `system/api_retry` events in `stream-json`; build exponential backoff; for routines, the platform handles it |
| **Routine beta header changes** | Medium | Production breakage | Pin `anthropic-beta: experimental-cc-routine-2026-04-01`; Anthropic keeps 2 prior versions live; subscribe to changelog |
| **Wrong repo / wrong branch pushed** | Medium | Lost work | Default `claude/` branch prefix; never enable `Allow unrestricted branch pushes` for `main`; require PR review (not direct push) |
| **GH Actions runner exhaustion** | Low | $$ | `claude-code-action` runs on your runners — set concurrency caps; use `actions/runner-images` cache |
| **Multi-agent identity collision in Slack/Linear** | Low | Confusion | One OAuth app per agent (distinct `app_id`); names like `Beamix Build`, `Beamix QA`; document in `docs/00-brain/MOC-Agents.md` |
| **Adam's claude.ai account becomes single point of failure for routines** | High (Phase 1 only) | Whole pipeline down | Phase 2 migrates to per-agent OAuth apps; routines are stepping-stone only |
| **Linear webhook disabled after 3 retries** | Low | Silent breakage | Monitor delivery in Linear admin; alert on `failed_at` field; ping Slack on consecutive failures |

---

## 5. Sources (URL + date for every claim)

### Linear (Agents, Webhooks, MCP)
- [Linear Agent — Getting Started (linear.app/developers/agents)](https://linear.app/developers/agents) — registration, OAuth scopes (`app:assignable`, `app:mentionable`), `actor=app` flag, 10s ack window. Verified 2026-05-05.
- [Developing Agent Interaction (linear.app/developers/agent-interaction)](https://linear.app/developers/agent-interaction) — AgentSession lifecycle (`pending`/`active`/`awaitingInput`/`error`/`complete`/`stale`), AgentActivity types, GraphQL `agentActivityCreate` mutation, `prompted` follow-ups. Verified 2026-05-05.
- [Linear Webhooks (linear.app/developers/webhooks)](https://linear.app/developers/webhooks) — HMAC-SHA256 signature, `Linear-Signature` header, raw-body verification, 60s replay window, retry policy (1min / 1hr / 6hr). Verified 2026-05-05.
- [Linear MCP Server (linear.app/docs/mcp)](https://linear.app/docs/mcp) — `mcp.linear.app/mcp`, OAuth 2.1 + dynamic client registration, 25+ tools, built with Cloudflare and Anthropic. Verified 2026-05-05.
- [Linear MCP for product management — changelog Feb 5, 2026](https://linear.app/changelog/2026-02-05-linear-mcp-for-product-management) — initiatives, project milestones, project updates added.
- [Introducing Linear Agent — changelog March 24, 2026](https://linear.app/changelog/2026-03-24-introducing-linear-agent) — agent feature announcement.
- [linear/linear-agent-demo (GitHub, archived 2025-10-10)](https://github.com/linear/linear-agent-demo) — TypeScript on Cloudflare Workers, KV namespace `LINEAR_TOKENS`, endpoints `/oauth/authorize`, `/oauth/revoke`, `/webhook`. Reference architecture.
- [Building the Reflag Linear Agent (reflag.com)](https://reflag.com/blog/building-the-bucket-linear-agent) — production case study.
- [Linear adopts agentic AI — The Register, 2026-03-26](https://www.theregister.com/2026/03/26/linear_agent/) — independent confirmation of agent feature.

### Claude Code (headless, Slack, GitHub Action, Routines, Channels)
- [Run Claude Code programmatically (code.claude.com/docs/en/headless)](https://code.claude.com/docs/en/headless) — `-p` flag, `--bare`, `--output-format json|stream-json`, `--allowedTools`, `--permission-mode`, `--continue`, `--resume <session_id>`, `--json-schema`, 10MB stdin cap as of v2.1.128, `system/api_retry` events. Verified 2026-05-05.
- [Claude Code in Slack (code.claude.com/docs/en/slack)](https://code.claude.com/docs/en/slack) — Slack App Marketplace `A08SF47R6P4`, Code/Code+Chat routing, channel-only (no DMs), one PR per session, user-scoped sessions, GA Dec 8 2025. Verified 2026-05-05.
- [Automate work with routines (code.claude.com/docs/en/routines)](https://code.claude.com/docs/en/routines) — Schedule/API/GitHub triggers, `/fire` endpoint, bearer token, `experimental-cc-routine-2026-04-01` beta header, MCP connectors, daily caps, 1hr min schedule interval, only PR/Release GitHub events supported. Verified 2026-05-05.
- [Introducing routines in Claude Code — Anthropic blog](https://claude.com/blog/introducing-routines-in-claude-code) — launch April 14, 2026.
- [Claude Code Routines — The Register, 2026-04-14](https://www.theregister.com/2026/04/14/claude_code_routines/) — independent reporting.
- [Claude Code Routines pricing — claudefa.st guide](https://claudefa.st/blog/guide/development/routines-guide) — $0.08/runtime hr; Pro 5/Max 15/Team 25 daily; webhook/API exempt from cap.
- [anthropics/claude-code-action (GitHub)](https://github.com/anthropics/claude-code-action) — official action, tag/agent mode auto-detection, multi-provider auth (Anthropic, Bedrock, Vertex, Foundry).
- [claude-code-action usage docs](https://github.com/anthropics/claude-code-action/blob/main/docs/usage.md) — full input list (`trigger_phrase`, `branch_prefix`, `claude_args`, `use_commit_signing`, `allowed_bots`, `plugin_marketplaces`), supported events (`issue_comment`, `pull_request_review_comment`, `issues`, `pull_request_review`).
- [Claude Code GitHub Actions (code.claude.com/docs/en/github-actions)](https://code.claude.com/docs/en/github-actions) — official setup guide.
- [Claude Code Channels (code.claude.com)](https://code.claude.com/docs/en/channels) referenced via [Hookdeck blog](https://hookdeck.com/webhooks/platforms/claude-code-channels-webhooks-hookdeck) — Channels are MCP servers with `claude/channel` capability, requires v2.1.80+, March 20, 2026 launch.

### Self-hosted bridges & DIY patterns
- [claude-did-this/claude-hub (GitHub)](https://github.com/claude-did-this/claude-hub) — TypeScript/Node 20+, container-per-event, HMAC-SHA256, fine-grained PATs, pre-commit secret scan.
- [mpociot/claude-code-slack-bot (GitHub)](https://github.com/mpociot/claude-code-slack-bot) — local Claude Code → Slack.
- [jeremylongshore/claude-code-slack-channel](https://github.com/jeremylongshore/claude-code-slack-channel) — Slack channel pattern.
- [Building an agentic Slackbot with Claude Code — David Calvert, Medium](https://medium.com/@dotdc/building-an-agentic-slackbot-with-claude-code-eba0e472d8f4) — `exec.Command("claude", "-p", prompt)` pattern, GKE Workload Identity, Vertex AI backend, <2K LOC Go.
- [GitHub agent automation: Hookdeck + Trigger.dev + Claude (Hookdeck blog)](https://hookdeck.com/webhooks/platforms/github-trigger-dev-claude-automation) — production-grade webhook→durable-job→Claude pattern.

### HumanLayer
- [humanlayer/humanlayer (GitHub)](https://github.com/humanlayer/humanlayer) — Apache 2.0; `@hl.require_approval()` decorator; 12 Factor Agents; multi-channel (Slack, email, Discord, web); Python + TypeScript SDKs.
- [HumanLayer overview (everydev.ai)](https://www.everydev.ai/tools/humanlayer) — pricing: Starter free 1K ops/mo; Premium tier $18 for 2K ops/mo + add'l metered.

### Stripe / Block / industry patterns
- [Minions: Stripe's one-shot, end-to-end coding agents (stripe.dev)](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents) — 1000+ PRs/week merged via internal agent; Leverage team.
- [Open SWE captures the architecture Stripe/Coinbase/Ramp built (DevOps.com)](https://devops.com/open-swe-captures-the-architecture-that-stripe-coinbase-and-ramp-built-independently-for-internal-coding-agents/) — common pattern: cloud sandboxes + curated tools (~500 at Stripe) + subagent orchestration + Slack/Linear/GitHub integration.
- [Slack agents announcement (slack.com/blog)](https://slack.com/blog/news/slack-is-where-agents-work) — Slack as agent-host platform.

### Spec Kit
- [github/spec-kit workflows](https://github.github.io/spec-kit/reference/workflows.html) — `/speckit.issue` → `/speckit.specify` → `/speckit.pullrequest` flow, branch naming `spec/<issue#>-<slug>`, auto "Closes #N" linking, YAML pipelines with human review gates.
- [Tighter integration between GitHub Issues and Spec Kit branches — issue #1088](https://github.com/github/spec-kit/issues/1088) — current limitations.

---

## Confidence Summary

**Overall: HIGH.**
All architectures verified against official Anthropic, Linear, GitHub, and Slack documentation. Pricing/limits cross-checked against multiple sources (Anthropic docs + claudefa.st + The Register). One LOW-confidence claim: the exact $/run for Routines beyond runtime fee depends on token usage and is hard to predict — flagged as "varies."

**Gaps:**
- Stripe Minions blog post is intro-only — full architecture is in a Part 2 not yet read; treat scale claim ("1000+ PRs/week") as confirmed but pattern details inferred.
- HumanLayer's exact wrapping mechanism for `claude -p` is undocumented; may require a small adapter.
- Linear webhook rate limits not published — assume "reasonable" but monitor.

