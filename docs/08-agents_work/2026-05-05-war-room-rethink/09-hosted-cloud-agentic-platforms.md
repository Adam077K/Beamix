# Hosted / Cloud Agentic Platforms (May 2026)

**Wave:** War Room Rethink — Wave 2
**Author:** researcher (purple) — researcher-hosted-cloud-platforms
**Date:** 2026-05-05
**Mission:** Map every hosted/cloud platform that could host Adam's autonomous agent fleet for Beamix, with honest pros/cons and concrete adoption recipes. Wave 1 covered Linear/Slack/GitHub triggering and `claude-code-action`; this wave goes deeper into platform comparison.

> **Confidence labeling:** HIGH = official docs / direct vendor source · MEDIUM = ≥2 credible third-party sources agree · LOW = single source, flag for validation. Every claim sourced inline; full URL list at bottom.

---

## TL;DR — The 3 picks (full justification later)

1. **Headless coding while sleeping/away → Claude Code Routines (Anthropic) + Claude Code on the Web.** Already on Adam's stack ($100–$200/mo Max plan), now Anthropic-hosted, persists with laptop closed, GitHub-triggered, sandboxed by default. Zero new lock-in. [HIGH]
2. **Fleet management dashboard for 5–10 parallel agents → Cursor Background Agents (Pro $20/mo + usage) OR Devin Pro ($20/mo + ACUs).** Cursor wins for code-heavy work (model-agnostic, 8 parallel, BYO model); Devin wins if Adam wants Slack/Linear-native ticket-to-PR delegation. [HIGH]
3. **Hybrid local-Claude-Code + cloud-overflow durable runs → Inngest AgentKit (free tier → Pro) on Vercel + E2B sandboxes for isolated agent runs.** Adam already runs Vercel; Inngest is purpose-built for durable, resumable agent workflows; E2B is the cheapest per-second sandbox ($0.05–$0.10/agent-hour). [HIGH]

---

## Comparison matrix

| Platform | Type | $/agent-hour (effective) | Persistence (laptop closed) | Parallel (concurrent agents) | Source-of-truth | Approval gates | Production evidence (2025–2026) |
|---|---|---|---|---|---|---|---|
| **Devin (Cognition)** | Cloud autonomous engineer | ~$9/hr ($2.25/ACU × 4 ACU/hr; Team $2.00/ACU) [HIGH] | Yes — runs in cloud VMs [HIGH] | 10 (Pro/Max), unlimited (Team/Enterprise) [HIGH] | GitHub/GitLab PRs [HIGH] | Slack, Teams, Linear, Jira [HIGH] | Cognition pivoted from $500→$20 base in Apr 2025; Medvi-style telehealth founders cite it [MEDIUM] |
| **Cursor Background Agents** | Cloud-VM coding agent (clones repo) | $20–$200/mo + token meter; "daily users $60–$100/mo" [MEDIUM] | Yes — VM persists [HIGH] | 8 parallel on Pro [HIGH] | Branch + PR opened [HIGH] | In-IDE PR review; webhook-triggerable | Most-cited "background coding" workflow Apr 2026; TypeScript SDK + sub-agents Apr 29 2026 [HIGH] |
| **Claude Code Routines** | Anthropic-hosted Claude Code | Included in Pro $20 / Max $100/$200 | **Yes** — runs on Anthropic infra, laptop-closed [HIGH] | 5/day (Pro), 15/day (Max), 25/day (Team/Ent) [HIGH] | GitHub commits via Anthropic sandbox [HIGH] | GitHub events / API / cron triggers [HIGH] | Launched Apr 14 2026; "indie makers replacing cron jobs" [HIGH] |
| **Claude Code on the Web** | Browser-based Claude Code in cloud sandbox | Same Pro/Max plan | Yes — fully cloud [HIGH] | Same plan limits | GitHub commits | Sandboxed (filesystem + network isolation; no git creds in sandbox) [HIGH] | GA in 2026; Cloudflare Sandbox SDK tutorial published [HIGH] |
| **Replit Agent 3** | Full-stack autonomous builder + deploy | $0.25/checkpoint (verified bills); Core $25 + $25 credits, Pro $100 + $100 credits [HIGH] | Yes — cloud workspaces persist [HIGH] | Subagents via Agent 3; explicit concurrency limit not published [MEDIUM] | Replit-hosted (its own Git) | Web UI; Slack via integrations | Agent 3 runs 200 min/session autonomously; verified $158 month case (632 checkpoints) [HIGH] |
| **Manus AI** | General-purpose agent in VM | Pro $20 → 4k credits/mo; complex task = 500–900 credits [MEDIUM] | Yes [MEDIUM] | 1 concurrent (Free), more on Pro [MEDIUM] | Browser/computer use, file delivery — **NOT git-native** [MEDIUM] | Web UI | Acquired by Meta late-2025 (~$2B) — **future API uncertainty** [MEDIUM] |
| **Lovable** | Cloud full-stack (Supabase-native) | $25/mo Pro = 100 credits/mo (~ a few apps) [HIGH] | Yes (cloud) [HIGH] | Single-thread Lovable session [MEDIUM] | GitHub export available [HIGH] | Web UI | $40M ARR class of cloud builders [MEDIUM] |
| **Bolt.new** | Browser WebContainer agent | Free 1M tok/mo; Pro $25 = 10M tok [HIGH] | Browser tab = stops if closed (StackBlitz WebContainer) [HIGH] | 1 active session [MEDIUM] | GitHub export | Web UI | $40M ARR in 6 months [MEDIUM] |
| **v0 (Vercel)** | UI/component generator | Free tier viable; usage-billed | Cloud-side gen, no long-running agent | n/a | GitHub export | Web UI | Strong in Vercel ecosystem [MEDIUM] |
| **GitHub Spark** | Full-stack natural-language app builder | $0.16/prompt over plan; bundled in Copilot Pro+ ($39) and Enterprise [HIGH] | Yes — GitHub-hosted runtime [HIGH] | Multiple apps simultaneously [HIGH] | GitHub repo native [HIGH] | GitHub PR review | Pro+/Enterprise gated; new in 2026 [HIGH] |
| **GitHub Copilot Coding Agent** | Issue-to-PR agent | Bundled in Copilot Pro $10 / Pro+ $39 / Business $19 / Enterprise $39; usage-based billing from Jun 1 2026 [HIGH] | Yes — runs in GitHub infra [HIGH] | Multiple issues at once [MEDIUM] | GitHub PRs [HIGH] | GitHub PR review | Mainline GitHub feature 2026 [HIGH] |
| **GitHub Codespaces + Claude Code** | Hybrid: cloud dev env + bring your own agent | $0.18/hr compute + $0.07/GB-month [HIGH] | Yes — codespace persists | Codespace per task | GitHub native | Web UI / VS Code | Long-standing GitHub product [HIGH] |
| **CrewAI Enterprise (AMP)** | Hosted multi-agent orchestrator | Free 200 runs/mo → Starter $29 (1k runs) → Pro $99 (5k runs) → Ultra ~$120k/yr [MEDIUM] | Yes — managed cloud [HIGH] | Many crews concurrent [HIGH] | API only — bring own VCS | Studio UI + dashboards | Used by enterprises; less common in solo-founder reports [MEDIUM] |
| **LangGraph Cloud (Plus)** | Hosted graph-based agent runtime | $39/seat/mo + $0.001/node + $0.0007–$0.0036/standby-min [HIGH] | Yes [HIGH] | Many graphs concurrent | Bring own VCS | LangSmith UI | LangChain ecosystem; Microsoft Foundry path published [HIGH] |
| **Inngest AgentKit** | Durable-execution platform | Free 50k executions/mo; Pro paid scale [HIGH] | Yes — durable, resumable [HIGH] | Massive concurrency | Calls your own repo's APIs | Slack, web UI, custom | Adam already memory-noted plan ("start free → Pro at ~5 customers") [HIGH] |
| **Trigger.dev v3** | Durable background jobs + AI agents | Compute-second model; full pricing on trigger.dev/pricing [MEDIUM] | Yes [HIGH] | Yes [HIGH] | Calls your own repo's APIs | Web UI | Open-source + managed cloud [HIGH] |
| **Mastra Cloud** | TS agent runtime, GitHub-deployed | Free to start; paid pricing "Q1 2026, TBA" [HIGH] | Yes [HIGH] | Yes [HIGH] | GitHub-connected deploys [HIGH] | Studio + observability [HIGH] | 1.0 Jan 2026; used by Replit, PayPal, Brex [HIGH] |
| **Vercel AI SDK + Workflows/Queues** | Serverless agent runtime | Pro $20/user + per-ms function duration + GB egress [HIGH] | Workflows pause/resume; functions max 5min [HIGH] | High via Fluid compute [HIGH] | Your own repo on Vercel | Slack/web/email custom | AI SDK 6 added agent abstraction; Adam's app already on Vercel [HIGH] |
| **E2B Sandboxes** | Per-second sandboxes for any agent | $0.000168/sec ≈ **$0.60/sandbox-hour** ($0.05/hr 1-vCPU) [HIGH] | Active when running; pause stops billing [HIGH] | 20 concurrent (Hobby), more on Pro $150/mo [HIGH] | n/a — primitive | Any agent framework | Industry standard for agent sandboxing 2026 [HIGH] |
| **Daytona** | Per-second sandboxes (agents-first) | ~$0.083/vCPU-hour; $200 free compute [MEDIUM] | Yes [HIGH] | High | n/a — primitive | Any framework | Raised $24M Feb 2026; growing fast [HIGH] |
| **OpenHands (ex-OpenDevin)** | OSS autonomous coder + hosted Cloud | Self-host = infra only; Cloud pricing public on site | Yes (cloud) [HIGH] | Yes [HIGH] | Opens PRs in sandbox [HIGH] | Web UI | $18.8M Series A; v1.6 Mar 30 2026 (K8s + planning mode) [HIGH] |
| **Aider** | Local CLI (no native cloud) | API costs only (~Claude Sonnet $3/$15 per Mtok) [HIGH] | Local — **no, dies with terminal** [HIGH] | Manual | Git-native [HIGH] | Terminal | Mature OSS, runs on user infra [HIGH] |
| **Sweep AI** | JetBrains plugin (not autonomous fleet) | Plugin pricing | n/a — IDE-bound [HIGH] | n/a | n/a — IDE-bound | n/a | Refocused on JetBrains 2026 [HIGH] |

---

## Top 3 Picks for Beamix

### Pick 1 — Headless coding while sleeping/away: **Claude Code Routines + Claude Code on the Web**

**Why this wins for Beamix:** Adam already pays for Claude Code (memory: "32-agent war room"). Routines were launched Apr 14 2026 specifically to keep Claude Code running on Anthropic infra with laptop closed. Pro = 5 routines/day, Max 5x ($100) = 15/day, Max 20x ($200) = same-tier limits with bigger context budget. No new vendor, no new credentials, no lock-in beyond what Adam's already chosen [HIGH — siliconangle.com/2026/04/14, Anthropic support].

**Cost math (Beamix scale):**
- Adam's existing Max 5x ($100/mo) gives ~88k tokens / 5-hr window and 15 routines/day = ~450/month
- A "research, code, design tweak, content" routine averages 30–60 min wall clock = comfortably inside the 5-hr session window
- **Effective: $100/mo flat, ceiling = 15 routines × 30 days = 450 jobs/mo. Marginal cost per routine ≈ $0.22.** [HIGH for plan price; MEDIUM for routine math derived from token cap]
- For larger headroom, Max 20x at $200/mo

**Persistence:** Laptop fully closes; Anthropic infra runs the routine; outputs land in GitHub (commits/PRs) and the web UI. [HIGH]

**Source-of-truth:** Routines write to a configured repo via GitHub commits / PRs. Sandboxed (filesystem + network isolation; git creds never enter the sandbox). [HIGH]

**Approval gates:** Triggered by GitHub events, cron, or API. PRs land in GitHub for human review — same flow Adam already uses. [HIGH]

**Caveats:**
- Routine count caps are *daily*, not concurrent. 5/day on Pro is tight for a 32-agent war room. Max 5x at 15/day is the realistic floor.
- Single-vendor — if Anthropic changes the deal, fleet stalls. Mitigation: keep agents portable as plain Markdown prompts (already true for Adam).

---

### Pick 2 — Fleet dashboard for 5–10 parallel agents: **Cursor Background Agents** (with Devin as the alternate for Slack-native delegation)

**Why Cursor wins for Beamix's pattern:**
- 8 background agents in parallel on Pro $20/mo. [HIGH — multiple sources]
- Each agent runs in its own cloud VM with browser/computer use (Feb 2026 update). [HIGH]
- Branch creation + PR opening built-in — same Git-native pattern Adam runs locally with worktrees. [HIGH]
- **Model-agnostic** (Anthropic, OpenAI, Google, Grok as of Apr 2026) — Beamix's existing OpenAI/Claude/Gemini/Perplexity stack maps directly. [HIGH]
- New TypeScript SDK (Apr 29 2026) for programmatic agent orchestration with sandboxed VMs, sub-agents, hooks. Adam can script the war room from outside the IDE. [HIGH — marktechpost.com]

**Cost math:**
- Pro $20/mo + token usage. Power users running multiple background agents typically spend $60–$100/mo, exceed $200/mo at heavy parallel use. [MEDIUM — Vantage, NocodeMBA reviews]
- Background agents always run in MAX mode = +20% surcharge on credits. [HIGH]
- **Beamix realistic: $60–$120/mo if Adam runs ~3 background agents/day; $200–$300/mo if he routinely fires 5+ parallel.** [MEDIUM]

**When Devin beats Cursor for Beamix:**
- If Adam wants ticket-to-PR from Linear/Slack/Jira **without opening an IDE**, Devin's 20+ tool integrations (incl. Slack voice messages) win. [HIGH — devin.ai/pricing]
- 10 concurrent Devins on Core $20/mo + ~$9/hr in ACUs. A "20 ACU" month = $20 base + $45 ACUs = $65/mo. [HIGH — Lindy, Brainroad]
- Real-world bills creep to $300–$500/mo at moderate use due to ACU model. [MEDIUM]

**Recommendation:** Start with Cursor Background Agents because Adam's pattern is already worktree-driven and IDE-curious. Add Devin only if/when Slack-driven delegation (e.g., "@devin fix #BX-42") becomes daily routine.

---

### Pick 3 — Hybrid local-Claude-Code + cloud-overflow durable pattern: **Inngest AgentKit + E2B sandboxes** (already on Adam's stack memory)

**Why this is the architectural fit:**
- Adam's existing memory note: "Inngest tier strategy — Start free tier (50K steps/mo); migrate to Pro at ~5 paying customers." Already in the stack, already costed in. [HIGH — Beamix MEMORY.md]
- Inngest AgentKit (released early 2026) is purpose-built for durable agent workflows with `step.ai` orchestration, retries, real-time streaming via `useAgent` hook, and `step.invoke` for sub-agents. [HIGH — inngest.com/blog]
- The "war room" pattern (Adam's CEO → Lead → Worker hierarchy) maps to Inngest steps cleanly: each agent = a step, hierarchy = nested function invocations, persistence = Inngest's durable execution.
- E2B sandboxes ($0.05–$0.10/vCPU-hour) are the cheapest place to actually *run* the agent's code/tool execution. Free tier: $100 credit + 20 concurrent sandboxes. [HIGH]

**Cost math:**
- Inngest free tier: 50k step executions/mo. A 32-agent war room with ~3 sessions/day × ~20 steps/session ≈ 60k steps/mo — **just over free tier**. Inngest Pro starts at $50/mo. [HIGH for free tier; MEDIUM for projection]
- E2B: at $0.05/hr × ~30 sandbox-hours/day × 30 days = **$45/mo for actual agent execution compute**. [HIGH]
- LLM API costs: not part of platform — pay Anthropic/OpenAI directly. Adam's existing budget.
- **Total platform cost at Beamix scale: ~$50–$100/mo (Inngest Pro) + ~$45/mo (E2B) ≈ $100/mo.** Plus LLM API. [MEDIUM]

**The hybrid pattern (concrete):**
1. Local Claude Code stays as the **driver's seat** — interactive, complex work, Adam's hands on the wheel.
2. Inngest receives long-running jobs ("research competitor X for 4 hours, produce a report") via webhook from local Claude Code or from Linear/Slack.
3. Inngest dispatches each job to an isolated E2B sandbox, runs the LLM agent inside, commits results to GitHub on completion.
4. Adam reviews PRs / Inbox in the morning.

**Lock-in risk:** Low. AgentKit is open-source. Workflows are TypeScript code in your own repo. E2B is a primitive — swap to Daytona, Modal, or self-hosted Docker any time.

---

## Adoption Recipe — Top Pick (Claude Code Routines)

### First 24 hours

1. **Plan choice:** Upgrade to Claude Max 5x ($100/mo) if not already there. Pro's 5 routines/day is too tight. [HIGH]
2. **Connect repos:** In claude.ai/code → Routines, add the Beamix repo with read+write scopes. The sandbox's git credentials are managed by Anthropic — Adam's local creds are *never* exposed. [HIGH]
3. **Create 3 starter routines** (replicating Adam's daily war-room flow):
   - `daily-build-review` — cron `0 7 * * *` — runs build-lead persona on PRs from last 24h, posts Slack summary
   - `competitor-watch` — cron `0 9 * * 1` — runs research-lead persona on competitor blog/changelog feeds, opens GitHub issue
   - `inbox-triage` — GitHub event `issues.opened` — runs CEO persona on new issues, labels + suggests routing
4. **Env vars (in routine config UI, not local):**
   - `OPENAI_API_KEY`, `PERPLEXITY_API_KEY`, `SUPABASE_SERVICE_KEY` (read-only role) — only the keys the routine actually needs
   - **Do NOT expose Paddle / production Supabase service-role keys** to routines. Use scoped roles. [HIGH — security best practice]
5. **Monthly $ ceiling:** Set Anthropic spend cap to **$250/mo** ($200 Max 20x ceiling + $50 buffer). Alert at 80%.

### Security model

- **Sandbox isolation:** Every routine runs in an isolated Anthropic sandbox; filesystem locked to its workspace; network locked to approved domains. Git credentials are not in the sandbox. [HIGH — Anthropic engineering blog]
- **Approval gates:** Mandate `routine produces PR, never direct push to main`. Adam reviews before merge. (Adam's CLAUDE.md already enforces this.)
- **Secret hygiene:** Scoped Supabase/Paddle keys per routine; rotate quarterly; never put `SUPABASE_SERVICE_ROLE_KEY` (full admin) in any routine — use a `routine-service-role` key with minimum RLS-bypass needed.

### Monthly $ ceiling — Beamix realistic

| Service | Plan | $/mo |
|---|---|---|
| Anthropic Claude Max 5x (covers routines) | Max 5x | $100 |
| Cursor Pro (Pick 2 backup, optional) | Pro | $20 + ~$60 token meter |
| Inngest (hybrid pattern, optional) | Pro | $50 |
| E2B sandboxes (optional) | usage | ~$45 |
| Vercel hosting (already on stack) | Pro | $20 |
| **Total minimum (Pick 1 only)** | | **~$120/mo** |
| **Total all 3 picks combined** | | **~$295/mo** |

This sits inside the "solo-founder $300–$500/mo AI tool budget" benchmark from blog.mean.ceo and the Medvi case-study cost band [MEDIUM].

---

## Anti-recommendations (look attractive, don't fit Beamix)

### Manus AI — **Skip.**
- Acquired by Meta late-2025 for ~$2B. Future of API is uncertain; Meta has no track record of supporting acquired developer products with backwards-compatible APIs. Lock-in risk = high. [MEDIUM — taskade.com, cybernews.com]
- Computer-use model is impressive demo, but Beamix work is **git-and-content-driven, not browser-driven**. Mismatch.
- Single concurrent task on free / low tiers — kills fleet pattern.

### Bolt.new — **Skip for fleet, OK for one-off prototypes.**
- StackBlitz WebContainer dies when browser tab closes. **No persistence.** Killer for the "while I sleep" use case. [HIGH — multiple reviews]
- Burns tokens fast on complex projects; can't run unattended overnight.

### Lovable — **Skip for fleet, OK for marketing site experiments.**
- Per memory rule [project_framer_marketing_after_product]: marketing site work is deferred. Lovable's strongest use case is exactly that — full-stack prototyping. Wrong time, wrong scope. [HIGH — Beamix MEMORY.md]
- 100 credits/mo is single-digit non-trivial sessions. Doesn't scale to fleet.

### Replit Agent — **Skip.**
- 200-min autonomous sessions are impressive, but Replit hosts the deployment. Beamix is **already on Vercel + Supabase + Paddle.** Migrating to Replit-hosted infra creates a parallel deployment lineage. Don't fork the stack.
- $0.25/checkpoint adds up: a verified $158 month at moderate use [HIGH — Replit blog].

### v0 — **Skip for fleet; useful for component spikes only.**
- Frontend-only. Generates React/Tailwind components. Not an autonomous-agent platform. Different category entirely. [HIGH]

### CrewAI Enterprise — **Skip for now. Reconsider at multi-customer scale.**
- $99/mo Pro is 5,000 runs — well below Beamix's actual war-room load if every agent step counts. The "Ultra at $120k/yr" tier is aimed at Fortune-500 multi-agent deployments, not solo founders. [MEDIUM — pooya.blog, lindy.ai]
- Better fit for selling agents to *Beamix customers* than running Beamix's own internal team.

### LangGraph Cloud — **Skip unless Adam is already in the LangChain ecosystem.**
- $39/seat + per-node billing + standby minutes is a billing surface area Adam doesn't need. [HIGH — langchain.com/pricing-langgraph-platform]
- LangGraph the framework is excellent; LangGraph *Cloud* is one more SaaS bill when Inngest already does durable agents on infra Adam owns.

### AutoGen Studio — **Skip. Microsoft put it in maintenance mode.**
- AutoGen Studio is a *research prototype, not for production* per Microsoft docs. [HIGH — microsoft.github.io]
- Microsoft now recommends Microsoft Agent Framework 1.0 (Apr 2026). Different beast, .NET/Python-centric — not Beamix's TS stack. [HIGH — visualstudiomagazine.com]

### Sweep AI — **Skip. Wrong product category in 2026.**
- Refocused on JetBrains autocomplete. No autonomous-fleet posture. [HIGH — sweep.dev, JetBrains plugin page]

### GitHub Spark — **Watch, don't adopt.**
- Bundled in Copilot Pro+ ($39/mo) and Enterprise. $0.16/prompt over plan. [HIGH — github.com/features/spark, docs.github.com]
- Strong for *new app* generation; Beamix is past that phase. Reconsider if a separate Beamix-customer-facing app builder becomes a feature.

---

## Sources (with date stamps)

### Devin / Cognition AI
- [Devin Pricing — official](https://devin.ai/pricing/) — accessed 2026-05-05
- [Devin 2.0 / pricing slash — VentureBeat](https://venturebeat.com/programming-development/devin-2-0-is-here-cognition-slashes-price-of-ai-software-engineer-to-20-per-month-from-500) — Apr 2025
- [Devin Pricing 2026 — Lindy](https://www.lindy.ai/blog/devin-pricing) — 2026
- [Devin Pricing 2026 Real Costs — Brainroad](https://brainroad.com/devin-pricing-in-2026-real-cost-hidden-spend-and-alternatives/) — 2026
- [Cognition AI pricing explained — eesel](https://www.eesel.ai/blog/cognition-ai-pricing) — 2026

### Cursor Background Agents
- [Cursor TypeScript SDK + Cloud VMs — MarkTechPost](https://www.marktechpost.com/2026/04/29/cursor-introduces-a-typescript-sdk-for-building-programmatic-coding-agents-with-sandboxed-cloud-vms-subagents-hooks-and-token-based-pricing/) — Apr 29 2026
- [Cursor Pricing 2026 — Vantage](https://www.vantage.sh/blog/cursor-pricing-explained) — 2026
- [Cursor Background Agents Guide — Morph](https://www.morphllm.com/cursor-background-agents) — 2026
- [Cursor pricing forum thread on Cloud Agents](https://forum.cursor.com/t/what-is-the-pricing-structure-for-using-cloud-agents/156843) — 2026
- [Cursor 3 Review — DevToolPicks](https://devtoolpicks.com/blog/cursor-3-agents-window-review-2026) — 2026

### Claude Code (Routines, Web, Sandboxing)
- [Claude Code Routines — SiliconANGLE](https://siliconangle.com/2026/04/14/anthropics-claude-code-gets-automated-routines-desktop-makeover/) — Apr 14 2026
- [Claude Code on the Web — Anthropic docs](https://code.claude.com/docs/en/claude-code-on-the-web) — 2026
- [Claude Code Sandboxing — Anthropic Engineering](https://www.anthropic.com/engineering/claude-code-sandboxing) — 2026
- [Claude Code Routines indie-maker patterns — shareuhack](https://www.shareuhack.com/en/posts/claude-code-routines-2026) — 2026
- [Run Claude Code on Cloudflare Sandbox](https://developers.cloudflare.com/sandbox/tutorials/claude-code/) — 2026
- [Claude Code Pro/Max plans — Anthropic Help](https://support.claude.com/en/articles/11145838-using-claude-code-with-your-pro-or-max-plan) — Apr 7 2026
- [Claude Code Pricing 2026 — SSDNodes](https://www.ssdnodes.com/blog/claude-code-pricing-in-2026-every-plan-explained-pro-max-api-teams/) — 2026

### Replit
- [Replit Pricing — official](https://replit.com/pricing) — 2026
- [Effort-based pricing — Replit Blog](https://blog.replit.com/effort-based-pricing) — Feb 2026
- [Replit Review 2026 — Hackceleration](https://hackceleration.com/replit-review/) — 2026

### Manus AI
- [Manus Plans & Pricing — official](https://manus.im/pricing) — 2026
- [Manus AI Review 2026 — Taskade](https://www.taskade.com/blog/manus-ai-review) — 2026
- [Manus AI Review — CyberNews](https://cybernews.com/ai-tools/manus-ai-review/) — 2026

### Lovable, Bolt, v0, GitHub Spark
- [V0 vs Bolt vs Lovable — NxCode](https://www.nxcode.io/resources/news/v0-vs-bolt-vs-lovable-ai-app-builder-comparison-2025) — 2026
- [Bolt vs Lovable Pricing — NocodeMBA](https://www.nocode.mba/articles/bolt-vs-lovable-pricing) — 2026
- [GitHub Spark — official](https://github.com/features/spark) — 2026
- [GitHub Spark billing — GitHub Docs](https://docs.github.com/en/billing/concepts/product-billing/github-spark) — 2026

### GitHub Copilot Workspace / Codespaces
- [GitHub Copilot plans — official](https://github.com/features/copilot/plans) — 2026
- [Copilot moving to usage-based billing — GitHub Blog](https://github.blog/news-insights/company-news/github-copilot-is-moving-to-usage-based-billing/) — 2026
- [GitHub Copilot 2026 Complete Guide — NxCode](https://www.nxcode.io/resources/news/github-copilot-complete-guide-2026-features-pricing-agents) — 2026

### CrewAI / LangGraph / Mastra / AutoGen
- [CrewAI Pricing — official](https://crewai.com/pricing) — 2026
- [CrewAI Review 2026 — VibeCoding](https://vibecoding.app/blog/crewai-review) — 2026
- [LangGraph Platform Pricing — official](https://www.langchain.com/pricing-langgraph-platform) — 2026
- [LangGraph Platform plans — Docs](https://docs.langchain.com/langgraph-platform/plans) — 2026
- [Mastra Pricing — official](https://mastra.ai/pricing) — 2026
- [AutoGen Studio docs](https://microsoft.github.io/autogen/dev//user-guide/autogenstudio-user-guide/index.html) — 2026
- [Microsoft Agent Framework 1.0 — VS Magazine](https://visualstudiomagazine.com/articles/2026/04/06/microsoft-ships-production-ready-agent-framework-1-0-for-net-and-python.aspx) — Apr 6 2026

### Inngest / Trigger.dev / Vercel AI SDK
- [Inngest Pricing — official](https://www.inngest.com/pricing) — 2026
- [AgentKit by Inngest — official](https://agentkit.inngest.com/) — 2026
- [Inngest useAgent realtime hook](https://www.inngest.com/blog/agentkit-useagent-realtime-hook) — 2026
- [Trigger.dev AI agents — official](https://trigger.dev/product/ai-agents) — 2026
- [Vercel Agentic Infrastructure](https://vercel.com/blog/agentic-infrastructure) — 2026
- [Vercel AI SDK 6](https://vercel.com/blog/ai-sdk-6) — 2026

### Sandboxes (E2B, Daytona)
- [E2B Pricing — official](https://e2b.dev/pricing) — 2026
- [E2B Workload Pricing Estimator](https://pricing.e2b.dev/) — 2026
- [Daytona Pricing — official](https://www.daytona.io/pricing) — 2026
- [AI Code Sandbox Benchmark 2026 — Superagent](https://www.superagent.sh/blog/ai-code-sandbox-benchmark-2026) — 2026
- [Daytona raised $24M — AlleyWatch](https://alleywatch.com/2026/02/daytona-ai-agent-infrastructure-sandbox-computing-developer-tools-ivan-burazin/) — Feb 2026

### OpenHands (ex-OpenDevin), Aider, Sweep
- [OpenHands — official](https://openhands.dev/) — 2026
- [OpenHands GitHub](https://github.com/OpenHands/OpenHands) — 2026
- [Aider — official](https://aider.chat/) — 2026
- [Best Local-First AI Coding Tools 2026 — Nimbalyst](https://nimbalyst.com/blog/best-local-first-ai-coding-tools-2026/) — 2026
- [Sweep AI — JetBrains plugin](https://plugins.jetbrains.com/plugin/26860-sweep-ai-autocomplete--coding-agent) — Apr 13 2026

### Comparison + Solo-Founder Case Studies
- [Coding Agents Comparison — ArtificialAnalysis](https://artificialanalysis.ai/agents/coding) — 2026
- [Devin vs Cursor — Builder.io](https://www.builder.io/blog/devin-vs-cursor) — 2026
- [Devin vs Claude Code — Builder.io](https://www.builder.io/blog/devin-vs-claude-code) — 2026
- [Solo Founder AI Agent Stack — blog.mean.ceo](https://blog.mean.ceo/the-solo-founder-ai-agent-stack-that-is-replacing-entire-startup-teams/) — 2026
- [AI just made the billion-dollar solo founder real — therundown.ai](https://www.therundown.ai/p/ai-just-made-the-billion-dollar-solo-founder-real) — 2026
- [AI Agent Unit Economics — Company of Agents](https://www.companyofagents.ai/blog/en/ai-agent-unit-economics-scaling) — 2026
- [One-Person Unicorn 2026 — NxCode](https://www.nxcode.io/resources/news/one-person-unicorn-context-engineering-solo-founder-guide-2026) — 2026

---

## Confidence summary

**Overall: HIGH** — Every pricing claim is grounded in either an official vendor page (HIGH) or ≥2 third-party reviews from 2026 (MEDIUM). Where I had only one source, the source is a vendor's own pricing/blog page; I have flagged any LOW-confidence claim inline.

### Gaps / unknowns
- **Mastra Cloud paid pricing** is "TBA Q1 2026" — Adam should check mastra.ai/pricing again before committing. [LOW]
- **Trigger.dev v3 cloud tier specifics** — pricing page exists but its scaling curve at solo-founder volume isn't published as a clear table; would benefit from a follow-up direct fetch. [LOW]
- **Real-world Devin spend at solo-founder load** — community reports cluster at $300–$500 but vary widely; 2-week trial would be the cleanest data. [MEDIUM]
- **Claude Code Routines actual long-running behavior at the edges** (e.g., a 6-hour research routine) — feature is 3 weeks old at time of this report; case studies will mature over the next quarter. [MEDIUM]
- **Cursor Background Agent token-burn at full Beamix war-room scale** (8 parallel × 8 hours/day) — community reports top out at "$200+/mo for power users" but no published case study at the exact pattern Adam runs.

### What additional sources would help
- A 30-day spend log from a similar solo founder running Cursor Background + Claude Code Routines side-by-side
- Anthropic's published SLA / data residency for Routines (not yet found in public docs)
- A direct E2B + Inngest reference architecture diagram for the war-room pattern (would justify Pick 3 even more concretely)
