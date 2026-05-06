# Beamix War Room — Environment Map (V4)
**Purpose:** the single "you are here" doc. Every component, where it lives, what it does, what it costs.
**Audience:** Adam (the board). Read this once, hold it in your head, then we build.

---

## The 8 layers of the planned environment

```
┌─────────────────────────────────────────────────────────────────────────┐
│  LAYER 1 — ADAM'S DEVICES (where Adam lives)                            │
│  Phone (Linear/Telegram/claude.ai/GitHub) · Mac (Claude Code, browser)  │
│  Watch (Telegram pings) · Voice (Siri shortcut, iMessage dictation)     │
└─────────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │ Adam types/speaks
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LAYER 2 — COMMUNICATION CHANNELS (how Adam talks to the company)       │
│  Linear (canonical work surface) · Telegram (ad-hoc text/voice)         │
│  iMessage (CarPlay) · GitHub (PR comments) · claude.ai mobile (observe) │
└─────────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │ webhooks + API calls
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LAYER 3 — THE 24/7 CLOUD CRITICAL PATH (always-on, no Mac needed)      │
│  Cloudflare Workers (webhook bridge) → Anthropic Routines (agent runs)  │
│  → GitHub Actions (PR review) → results back to Linear                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │ tools the agents call
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LAYER 4 — DATA & SOURCES OF TRUTH                                      │
│  Linear (tasks/status) · GitHub (code) · Supabase (data + memory)       │
│  Vercel (product hosting + dashboards) · git repos (decisions, sessions)│
└─────────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │ MCPs expose to agents
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LAYER 5 — THE AGENT ORG (in .claude/agents/)                           │
│  CEO → 5 C-suite (CTO/CPO/CMO/CBO/CCO) + QA Lead → leads → workers      │
│  ~5 + ~20 + ~35 = ~60 agents total, role-based names only               │
└─────────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │ load on demand
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LAYER 6 — SKILLS, MEMORY, KNOWLEDGE                                    │
│  Skills (~250 vendored, in .claude/skills/, embedded in pgvector)       │
│  Memory (Anthropic Memory Tool + pgvector + git-tracked .md files)      │
│  Codebase RAG · Brain MOCs · Decision log · Session log                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │ scheduled cron + on-demand
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LAYER 7 — STANDING ROUTINES (the heartbeat, always-on)                 │
│  5 Heartbeat (digest, EOD, auto-unblock, standup, retro)                │
│  3 Signal (competitor, customer voice, GEO algorithm)                   │
│  1 Entry-point (CEO, fired by Linear webhook)                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │ optional acceleration when on
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LAYER 8 — THE BASTION (Adam's 8GB Mac, OPTIONAL)                       │
│  Local Postgres mirror · tmux farm of `claude -p --bare` (fast parallel)│
│  Claude Code Remote Control daemon · MCP servers · disler dashboard     │
│  IF MAC OFF: Layer 3 keeps the company running. Mac is acceleration.    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Layer-by-layer breakdown

### LAYER 1 — Adam's devices

| Device | Use | Cost | Replaceable by |
|--------|-----|------|----------------|
| **iPhone** | Primary control surface (Linear, Telegram, claude.ai mobile, GitHub) | $0 (own it) | Any phone |
| **Mac (8GB)** | Live development sessions, Bastion host (optional) | $0 (own it) | Could be replaced with $5-30/mo VPS if you wanted |
| **Apple Watch** | Telegram pings only (binary-ping escalation L3) | $0 (own it) | Phone vibrate alone is fine |
| **CarPlay** | Voice + iMessage Channel for hands-free dictation | $0 (own it) | Optional |

### LAYER 2 — Communication channels

| Channel | Role | Cost | Notes |
|---------|------|------|-------|
| **Linear** | THE canonical work surface — projects, tickets, status, comments | $0 (free for solo) or $8/mo Standard | The control plane. Every task lives here. |
| **Telegram** | Ad-hoc text/voice → agents | $0 (Telegram bot is free) | For "I'm in a coffee shop, fix this" speed |
| **iMessage Channel** | CarPlay-readable agent comms | $0 (Apple) | For driving. CarPlay reads agent replies aloud |
| **GitHub PR comments** | Code-specific async review with `claude-code-action` | $0 (free tier 2k Action min/mo) | `@claude` mention triggers PR work |
| **claude.ai mobile app** | Live observe + steer running sessions | $0 (in your Max plan) | "What is the agent doing right now?" |

**The rule:** Linear is the **company's source of truth for tasks**. The other channels are inputs/observability that ALL eventually write back to Linear. **You always know where to look — Linear.**

### LAYER 3 — The 24/7 cloud critical path

This is the heart of the always-on company. Every component is managed (no Mac required). Path of a typical task:

```
Adam types in Linear → Linear webhook fires
                                 ↓
                        Cloudflare Worker
                        (HMAC verify + route)
                                 ↓
                       Anthropic Routine fires
                       (CEO agent or specific role)
                                 ↓
                       Agent uses tools:
                       • Linear MCP (write status back)
                       • GitHub MCP (commit code)
                       • Supabase MCP (read/write data)
                       • Bash (run pnpm/git/tests)
                                 ↓
                       (Optional) GitHub Action
                       (claude-code-action runs PR review)
                                 ↓
                       Result posted to Linear ticket
                                 ↓
                       Adam sees notification on phone
```

| Component | Role | Cost | Limit |
|-----------|------|------|-------|
| **Cloudflare Workers** | Webhook bridge, HMAC verify, routing | $0 (free tier: 100K requests/day) | Far above solo founder volume |
| **Cloudflare R2** | Artifact storage (agent outputs, screenshots) | $0 (free tier: 10GB) | Plenty for solo |
| **Cloudflare KV** | Ephemeral state (rate limiting, dedup) | $0 (free tier: 100K reads/day) | Fine |
| **Anthropic Routines** | Cron + on-demand agent runs in cloud | Included in $100/mo Max (15 routines/day on Max) | Generous for a fleet |
| **Anthropic API** | LLM inference for all agents | Included in your $100/mo Max budget | After token-reduction wins from V3, ~$80-150/mo of usage fits |
| **GitHub Actions** | PR review, nightly QA, claude-code-action | $0 (free 2,000 min/mo on private repos, unlimited on public) | More than enough |
| **`anthropics/claude-code-action`** | The official PR-review GitHub Action | $0 (Anthropic-published) | Uses your API tokens |

### LAYER 4 — Data & sources of truth

**The hard rule: anything written by an agent must end up in git OR Supabase. Never agent-only-knows state.**

| Data | Source of truth | Backup | Cost |
|------|-----------------|--------|------|
| **Tasks + status + comments** | **Linear** | Weekly export to Supabase via Routine | $0 |
| **Code** | **GitHub** | GitHub multi-replica + monthly local clone | $0 |
| **Customer data** (users, scans, agent jobs) | **Supabase Postgres** | Supabase Point-In-Time-Recovery (PITR) | Already paid |
| **Decisions** | `.claude/memory/DECISIONS.md` (in git) | git is the backup | $0 |
| **Session logs** | `docs/08-agents_work/sessions/*.md` (in git) | git is the backup | $0 |
| **Long-term agent memory** | **Supabase pgvector** (Anthropic Memory Tool overflow) + `.claude/memory/LONG-TERM.md` (in git) | Supabase PITR + git | Already paid |
| **Skill embeddings** | **Supabase pgvector** | Re-embed from `.claude/skills/` source files | Already paid |
| **Audit log** (every agent action) | **Supabase `audit_log` table** | Supabase PITR | Already paid |
| **The 5 Visionary moats** (engine_citation_graph etc.) | **Supabase tables, permanent retention** | Supabase PITR + monthly snapshot to R2 | Already paid |

### LAYER 5 — The agent org

Lives entirely in `.claude/agents/` (after Wave A move from `.agent/`).

```
ceo.md
qa-lead.md         (independent — sits beside CTO, blocks merges)

C-suite:
  cto.md
  cpo.md
  cmo.md
  cbo.md
  cco.md

CTO's leads:
  code-lead.md
  design-lead.md
  security-lead.md
  devops-lead.md
  ai-lead.md
  data-lead.md

CTO's workers:
  backend-engineer.md
  frontend-engineer.md
  mobile-engineer.md
  devops-engineer.md
  ai-engineer.md
  data-engineer.md
  ml-engineer.md
  security-engineer.md
  qa-engineer.md
  performance-engineer.md
  product-designer.md
  ux-designer.md
  brand-designer.md
  motion-designer.md
  technical-writer.md

CPO's leads + workers:
  pm.md, ux-researcher.md, analyst.md
  market-researcher.md, user-researcher.md, competitive-analyst.md

CMO's leads + workers:
  content-lead.md, seo-geo-lead.md, growth-lead.md
  content-writer.md, copywriter.md, seo-specialist.md, geo-specialist.md,
  growth-marketer.md, paid-ads.md, email-specialist.md, social-specialist.md

CBO's leads + workers:
  cfo.md, legal-counsel.md, talent.md
  finance-analyst.md, compliance-analyst.md, pricing-analyst.md, recruiter.md

CCO's leads + workers:
  support-lead.md, onboarding-lead.md, investor-relations.md
  customer-success.md, sdr.md, account-executive.md, support-engineer.md, onboarding-specialist.md
```

**Total: ~60 role-based agent definitions.** Most vendored from wshobson/agents + spec-kit + BMAD with Beamix-specific customization.

**Each agent file contains:**
- Frontmatter: name, model (haiku/sonnet/opus), tool grants (minimal), `isolation: worktree` flag (for code workers)
- Role definition (1-2 paragraphs)
- Skills to load (2-3 from `.claude/skills/` index)
- Pre-flight checklist (what to read, what to verify)
- Structured return format (JSON for parseable handoff)
- VENDORED_FROM header noting source + commit SHA + date

### LAYER 6 — Skills, memory, knowledge

#### Skills

- **Location:** `.claude/skills/` (after Wave A move from `.agent/skills/`)
- **Count:** ~250 (after V1 cleanup — drop ~80 dupes/wrong-stack from current 430)
- **Sources:** wshobson/agents, BMAD, agent-os, SuperClaude, claude-flow, anthropics/claude-cookbook (vendored at pinned SHAs)
- **Discovery:** pgvector embedding search via `tool_search` MCP. Replaces 42K-token MANIFEST.json scan. Cost per discovery: ~$0.001 (vs current ~$0.14)
- **Loading:** Agent reads MANIFEST → loads 2-3 specific SKILL.md files

#### Memory (6 layers, V3 spec)

| Layer | Content | Storage | Cost |
|-------|---------|---------|------|
| L0 — Boot | Conventions, stack, rules | `CLAUDE.md` ≤ 200 lines | $0 |
| L1 — Session | Active conversation | Claude Code session, auto `/compact` at 70% | included |
| L2 — Episodic cross-session | "What happened last time?" | **Anthropic Memory Tool** (`memory_20250818` beta) with provenance/confidence/expiry (R1 hardening) | included |
| L3 — Project facts | PRD, MOCs, decisions | `docs/00-brain/` + Supabase pgvector | $0 |
| L4 — Skills | Skill embeddings | Supabase pgvector | $0 |
| L5 — Codebase | Code RAG ("where is X defined?") | Supabase pgvector | $0 |

#### Knowledge artifacts (the brain)

| Artifact | Purpose | Updated by |
|----------|---------|-----------|
| `CLAUDE.md` | Project boot context (≤200 lines) | Adam + CEO |
| `docs/00-brain/_INDEX.md` | Knowledge navigation hub | CEO |
| `docs/00-brain/MOC-*.md` | Domain maps (Product, Architecture, Business, Marketing, Codebase, History, Metrics, Agents) | each domain lead |
| `docs/00-brain/log.md` | Append-only activity log | every lead after significant work |
| `.claude/memory/DECISIONS.md` | Decision log (≤50 entries, then archive) | any agent making a decision |
| `.claude/memory/LONG-TERM.md` | User prefs, project patterns (≤100 lines) | CEO after each session |
| `.claude/memory/AUDIT_LOG.md` | Merges, deploys, schema changes, security audits | build/devops/db engineers |
| `docs/08-agents_work/sessions/` | One per session, YAML frontmatter | each lead at task end |
| `ANTI-ROADMAP.md` | What we are NOT building (fleet enforcement) | Strategist |
| `ROADMAP-90.md` | Active 90-day initiatives with stop-loss conditions | Strategist + CEO |

### LAYER 7 — Standing Routines (the heartbeat)

All run on Anthropic Routines (cloud, paid in Max). Combined cost: ~$5-15/mo of API tokens.

| # | Routine | Cron | Model | What | Output |
|---|---------|------|-------|------|--------|
| 1 | **CEO Entry-point** | On-demand (fired by Linear webhook) | Sonnet | The always-on entry. Reads ticket, picks team, dispatches | Linear sub-tickets + comments |
| 2 | **Morning Digest** | Daily 07:30 | Sonnet | Reads yesterday's session logs + signals | One markdown, Adam reads in 2 min |
| 3 | **EOD Sync** | Daily 20:00 | Haiku | Append to brain/log, detect abandoned worktrees | Silent unless action needed |
| 4 | **Auto-Unblock** | On any BLOCKED ticket | Sonnet | 3 self-resolution attempts before pinging Adam | Resolved OR L3 Telegram with A/B options |
| 5 | **Monday Standup** | Mon 08:00 | Sonnet | Weekly fleet status: cost, deps, "decisions you'll regret" | Adam's weekly 1:1 doc |
| 6 | **Friday Retro** | Fri 18:00 | Sonnet | Reads week, **PRs edits to agent .md files** | One PR Adam reviews Saturday |
| 7 | **Competitor Signal** | Sun 06:00 | Sonnet | Profound, AthenaHQ, AI engine algo changes | Linear comments on Strategy/Signals |
| 8 | **Customer Voice Signal** | Sun 07:00 | Sonnet | Inbox patterns, support tickets, NPS | Linear comments on Strategy/Signals |
| 9 | **GEO Algorithm Signal** | Bi-weekly | Sonnet | SEO subreddits, GEO papers, AI engine update logs | Linear comments on Strategy/Signals |

### LAYER 8 — The Bastion (optional, Adam's 8GB Mac)

**Status: Acceleration, not availability.** The 24/7 critical path (Layer 3) does NOT depend on this Mac. The Bastion is for when Adam wants:
- Faster local iteration (no API round-trip)
- Live observability
- Direct development sessions

| Component | Role | RAM | Cost |
|-----------|------|-----|------|
| **Postgres + pgvector** | Local mirror of Supabase for fast queries | ~500 MB | $0 |
| **Redis** | Local queue / lock state | ~100 MB | $0 |
| **Claude Code Remote Control daemon** | Steer this Mac from any device | ~200 MB | $0 (in Max) |
| **tmux farm of `claude -p --bare`** | Poor man's Devin — N parallel agents | ~150 MB × N agents (cap at 6) | $0 (in Max) |
| **MCP servers** (linear, github, supabase, custom mcp-memory, mcp-skills) | Tools the agents call | ~300 MB total | $0 |
| **Whisper.cpp** | Local voice transcription | ~200 MB | $0 |
| **ONNX MiniLM** | Skill/text embeddings | ~100 MB | $0 |
| **Disler observability dashboard** (Bun + SQLite + Vue) | Real-time agent activity | ~80 MB | $0 |
| **Tailscale** | Secure tunnel to Bastion from phone/laptop | ~50 MB | $0 (3 devices free) |
| **Total RAM peak** | | **~3.2 GB / 8 GB available** | $0 (electricity ~$3/mo) |

**Local LLMs are not used.** 8GB cannot run Sonnet-quality models. Embedders (MiniLM 23MB) and Whisper (200MB) only.

---

## The complete cost picture (final)

### Already-paid (in your existing budget)

| Item | $/mo | Note |
|------|------|------|
| Anthropic Claude Max | $100 | Includes Routines + Remote Control + Channels + API budget |
| Vercel Pro | ~$20 | Beamix product hosting |
| Supabase Pro | ~$25 | Beamix product DB + agent memory + 5 moat tables |
| Paddle | $0 | Revenue share, no fixed |
| Resend | ~$10 | Transactional email |
| Inngest | $0 | Free tier (50K steps/mo) |
| GitHub | $0 | Free for private repos |
| **Subtotal already paid** | **~$155/mo** | |

### Net new for the war room

| Item | $/mo | Note |
|------|------|------|
| Cloudflare Workers + R2 + KV | $0 | Free tiers cover solo founder traffic |
| GitHub Actions | $0 | Free 2,000 min/mo |
| Tailscale | $0 | Free 3 devices |
| Linear | $0 (free for solo) or $8 if Standard | Recommended start free |
| Mac mini electricity | ~$3 | Always-on home Mac (optional) |
| **Total NEW SPEND** | **$0-11/mo** | Under your $50 ceiling by ~$40 |

**Comparison:**
- V2 plan: $295/mo new spend
- V3 plan: $33/mo new spend
- V4 plan: **$0-11/mo new spend**

---

## How information flows in this environment

### Inbound flow (Adam → Company)

```
Adam files Linear ticket
    ↓
Linear webhook → Cloudflare Worker (HMAC verify, ~50ms)
    ↓
Worker calls Anthropic Routine endpoint with ticket payload
    ↓
CEO Routine wakes (cold start ~2s, warm <1s)
    ↓
CEO reads ticket via Linear MCP, decides team(s)
    ↓
CEO files sub-tickets, assigns to team leads (writes Linear comment)
    ↓
Each lead's Routine fires (parallel)
    ↓
Lead spawns workers (via Task tool, parallel worktrees)
    ↓
Workers execute (each in isolated worktree, runs git/tests/pnpm)
    ↓
Workers post status to their sub-ticket via Linear MCP
    ↓
Lead synthesizes, posts roll-up to parent ticket
    ↓
QA Lead Routine triggered on PR open → review → PASS or BLOCK
    ↓
CEO Routine closes parent ticket, posts final status
    ↓
Adam gets Linear notification on phone (typically <30 min for Lite tasks)
```

### Outbound flow (Company → Adam)

```
Friday Retro Routine fires 18:00
    ↓
Reads all session logs from week
    ↓
Identifies patterns, drafts agent .md edits
    ↓
Opens GitHub PR with proposed changes
    ↓
Posts to Linear "Strategy" project as a ticket
    ↓
Telegram bot pings Adam on Saturday morning: "Friday retro PR ready, 4 proposed changes"
    ↓
Adam reads PR on phone, taps approve/reject per change
    ↓
PR merges → next week's army runs with the new instructions
```

### Status flow (always)

```
EVERY agent action writes to:
  • The Linear ticket it's working on (visible status)
  • Supabase audit_log table (compliance + analytics)
  • Its session file in docs/08-agents_work/sessions/ (next session can read)
  • Optional: brain/log.md (if significant)

EVERY decision writes to:
  • DECISIONS.md (architecture/strategy)
  • The relevant ticket comment (operational)
```

**You always know:**
1. **What's running right now?** → claude.ai mobile app, or `git worktree list` on Bastion
2. **What's done today?** → Linear "Done" filter, or `docs/08-agents_work/sessions/YYYY-MM-DD-*.md`
3. **Why was X decided?** → DECISIONS.md (search) or the ticket comments
4. **What's the army thinking about?** → Strategy/Signals project in Linear (the 3 signal Routines feed it)

---

## Failure modes & what happens

| Failure | Impact | Recovery |
|---------|--------|----------|
| Adam's Mac off | None — Layer 3 keeps running | Mac comes back, agents catch up via Linear |
| Adam's home power out | None — same as above | Same |
| Cloudflare Worker errors | Webhook retries 3x with exponential backoff (Linear behavior) | Worker fixed, retries succeed |
| Anthropic API down | All Routines pause | Wait. Telegram bot pings Adam if outage >10 min |
| GitHub down | PR work pauses; agents continue with local commits | GitHub returns, push catches up |
| Supabase down | Memory writes queued in agent context; data work blocked | Supabase returns, queued writes flush |
| A Routine bug loops | Anthropic Console hard cap kicks in at $1500/mo | Adam pauses Routine via web console |
| An agent ships a bug | QA Lead PASS was wrong → Friday Retro identifies → updates qa-lead.md | Self-improving |
| Linear API key leaked | Rotate key in Linear settings + Cloudflare env var | <5 min |
| Adam can't make a decision | Auto-unblock Routine asks 3 ways before pinging | Eventually pings Telegram |

---

## What is NOT in this environment (intentional cuts)

These were considered and dropped:

- **Devin / Manus / Bolt / Lovable / Replit Agent** — overkill at solo scale, $100s/mo, lock-in
- **Cursor Background Agents** — useful but tmux farm of `claude -p` covers same use case for $0
- **Inngest AgentKit + E2B sandboxes** — useful at scale, premature for solo
- **Self-hosted Langfuse / Helicone** — 8GB Mac too small; disler dashboard covers 80%
- **Letta / Mem0 / Zep / Cognee paid tiers** — Anthropic Memory Tool + pgvector replace them
- **Local LLMs (Llama, Mistral, etc.)** — 8GB can't run useful sizes; Haiku at $1/M is cheaper
- **Custom Vercel agent dashboard** — surveyed indie founders build then abandon; claude.ai mobile + Linear cover the use case
- **Twilio + Realtime API for AI phone calls** — CarPlay reads iMessage Channel for free
- **Pushover / ntfy.sh / Pushcut** — Telegram bot covers it for free
- **Adam-OS personal life automation** — Adam wants company automation, not personal

---

## The 5 mental shortcuts (memorize these)

1. **"Where do I look?"** → Linear (always)
2. **"How do I trigger work?"** → File a Linear ticket OR DM `@cto` in Telegram
3. **"How do I observe?"** → claude.ai mobile app OR Linear notifications
4. **"How do I approve?"** → Linear button on phone OR GitHub mobile for PRs
5. **"What runs without me?"** → 9 Routines (5 heartbeat + 3 signal + 1 CEO entry-point)

---

## You-are-here checklist

- [ ] Adam understands Layer 1-2 (his devices + channels)
- [ ] Adam understands Layer 3 (24/7 cloud critical path) — the part that runs without him
- [ ] Adam understands Layer 4 (data sources of truth) — where things live
- [ ] Adam understands Layer 5-6 (the agent org + skills/memory)
- [ ] Adam understands Layer 7 (the 9 Routines that keep the company breathing)
- [ ] Adam understands Layer 8 (Bastion is acceleration, NOT availability)
- [ ] Adam understands the 5 mental shortcuts above
- [ ] Adam has read `WAVE-D-LINEAR-SYSTEM-BUILD.md` for the concrete first build

**End of environment map. The next doc is the build plan for Wave D — Linear-as-the-Company.**
