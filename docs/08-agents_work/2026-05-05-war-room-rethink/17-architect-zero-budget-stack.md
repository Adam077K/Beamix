# THE ARCHITECT — Round 1 (no cross-talk)

**Author:** The Architect (principal engineer persona, 3 AI-native startups)
**Date:** 2026-05-06
**Brief:** Design Beamix's autonomous-army runtime under hard constraints — Claude Max ($100/mo, already paid), one 8GB Mac, $20–50/mo cloud headroom, free tiers everywhere else.
**Posture:** Brutally honest. If something doesn't fit, I say so.

---

## Headline (one sentence)

**Yes — we can run the autonomous army for $34/mo of new spend by treating the 8GB Mac as a "Bastion" (Postgres + Redis + Remote Control daemon + tiny observability) and pushing every "elastic" workload to free tiers (Vercel/Supabase/Cloudflare/GH Actions) with Anthropic's hosted Routines as the only paid escape hatch — but we have to give up Cursor Background Agents, Inngest AgentKit, E2B, Langfuse, and any local LLM larger than an embedder.**

---

## The Topology (ASCII diagram — what runs where)

```
                             ┌──────────────────────────────────────┐
                             │  ADAM (phone / car / desk / asleep)  │
                             └────────────────┬─────────────────────┘
                                              │
                 ┌────────────────────────────┼────────────────────────────┐
                 │                            │                            │
       Claude iOS / iMessage         Linear Mobile / GH Mobile        Voice → iOS
       Channel (push)                (one-tap approve)                 Shortcut
                 │                            │                            │
                 ▼                            ▼                            ▼
       ┌──────────────────────────────────────────────────────────────────────┐
       │            CLOUDFLARE WORKERS (free, 100K req/day) — the "phone line"│
       │   /linear-webhook  /github-webhook  /ios-shortcut  /voice→linear      │
       │   HMAC verify · rate limit · enqueue → Bastion (mTLS over Tailscale)  │
       └──────────────────────┬───────────────────────────────────────────────┘
                              │  (Tailscale tunnel — free, 3 users, 100 nodes)
                              ▼
   ┌──────────────────────────────────────────────────────────────────────────┐
   │             THE BASTION — 8GB Mac mini (always-on, home network)          │
   │                                                                           │
   │   ┌─────────────────────────┐    ┌─────────────────────────────────────┐  │
   │   │ Claude Code Remote      │    │  Postgres 16 + pgvector  (1.2 GB)   │  │
   │   │ Control daemon (200 MB) │    │   - skill_index (HNSW)              │  │
   │   │   spawns worktrees      │◄──►│   - decision_log / audit_log        │  │
   │   │   isolation:worktree    │    │   - agent_memory (L3 facts)         │  │
   │   └────────────┬────────────┘    └─────────────────────────────────────┘  │
   │                │                                                          │
   │                ▼                                                          │
   │   ┌─────────────────────────┐    ┌─────────────────────────────────────┐  │
   │   │ tmux session farm:      │    │  Redis 7 (queue + pub/sub) (200 MB) │  │
   │   │  N×  claude -p --bare   │    │   - task queue (BLPOP)              │  │
   │   │  per worktree (poor     │    │   - hook event bus                  │  │
   │   │  man's parallel)        │    │   - dedupe / idempotency keys       │  │
   │   └─────────────────────────┘    └─────────────────────────────────────┘  │
   │                                                                           │
   │   ┌─────────────────────────┐    ┌─────────────────────────────────────┐  │
   │   │ MCP servers (stdio):    │    │  Bun + SQLite + tiny dashboard      │  │
   │   │  github-mcp, linear-mcp │    │   (disler pattern, 80 MB)           │  │
   │   │  supabase-mcp, mem-mcp  │    │   /events stream from PostHooks     │  │
   │   │  ~150 MB combined       │    │   served on :7777 via Tailscale     │  │
   │   └─────────────────────────┘    └─────────────────────────────────────┘  │
   │                                                                           │
   │   ┌─────────────────────────┐    ┌─────────────────────────────────────┐  │
   │   │ whisper.cpp tiny.en     │    │  ONNX runtime (all-MiniLM-L6-v2)    │  │
   │   │   on-demand (75 MB RAM  │    │   for skill embeddings (90 MB)      │  │
   │   │   when running)         │    │   on-demand only                    │  │
   │   └─────────────────────────┘    └─────────────────────────────────────┘  │
   │                                                                           │
   │   System overhead: macOS (~3.5 GB) + Docker (NO — bare processes)         │
   │   Headroom: ~2 GB for spike loads + macOS Spotlight/Time Machine          │
   └──────────────────────┬────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
  ┌───────────┐   ┌─────────────┐   ┌─────────────────┐
  │ ANTHROPIC │   │  SUPABASE   │   │  GITHUB         │
  │ Routines  │   │  (paid)     │   │  Actions (free) │
  │ overflow  │   │  pgvector   │   │  claude-code    │
  │ when      │   │  archival   │   │  -action,       │
  │ Mac off / │   │  audit log  │   │  nightly QA,    │
  │ for cron  │   │  prod data  │   │  semgrep        │
  │ jobs      │   │             │   │                 │
  └───────────┘   └─────────────┘   └─────────────────┘
        │
        ▼
  ┌─────────────────────────────────────────────┐
  │ VERCEL (free hobby) — read-only fleet UI    │
  │ /status  /changelog  /dashboard (RSC reads  │
  │ from Supabase; never writes)                │
  └─────────────────────────────────────────────┘
```

The Bastion is the brain. Cloudflare Workers are the receptionist. Vercel is the lobby TV. Anthropic Routines is the night-shift contractor. Supabase is the filing cabinet. GitHub Actions is the security guard with the clipboard.

---

## The Home-Mac Bastion (component list, RAM/CPU/disk budget per service)

**Hardware reality check:** 8 GB on macOS = ~4.5 GB free for our stuff after the OS, Spotlight, menubar apps, and a browser tab Adam forgot to close. Not 8 GB. Plan for 4 GB.

| Service | Why it's local | RAM (steady) | RAM (peak) | Disk | CPU |
|---|---|---|---|---|---|
| **Postgres 16 + pgvector** | Memory L3/L4, audit log, queue dedupe. Free tier of Supabase is fine for prod data, but vector search on 426 skills + decision log + agent memory wants <5ms latency from the loop. Local Postgres on a Unix socket = sub-ms. Also: zero cost on writes (Supabase free tier has row caps that we'd blow through with hook events). | 400 MB (`shared_buffers=256MB`, `work_mem=4MB`, max_connections=20) | 700 MB under load | 2-5 GB (skills + logs + 6mo retention) | 1-3% idle, 15% on vector query |
| **Redis 7** | Queue between Cloudflare Workers → Bastion, hook event bus, idempotency keys, pub/sub for the dashboard. tmux+Bash can poll a queue, but Redis BLPOP gives us proper backpressure. | 80 MB (`maxmemory 256mb`, allkeys-lru) | 256 MB hard cap | 100 MB AOF | <1% |
| **Claude Code Remote Control daemon** | The whole point of the Bastion. `claude remote-control --spawn worktree` running under launchd. | 150 MB | 250 MB | n/a | 1% idle |
| **tmux session farm** | N parallel `claude -p --bare` calls, one per worktree. This is our "poor man's Cursor Background Agents". | 50 MB tmux + ~300 MB per active claude session | At N=4 parallel = ~1.4 GB | n/a | spike per session |
| **MCP servers (stdio)** | github-mcp, linear-mcp, supabase-mcp, mcp-memory (custom). Spawned per-session by Claude Code; not always-on. | 0 MB idle, ~40 MB each when invoked | 200 MB if 4 active | n/a | low |
| **Whisper.cpp tiny.en** | Local voice transcription (80MB model). Runs on-demand only when Adam dictates. | 0 MB idle, 80 MB during transcription | 150 MB | 80 MB model | spike |
| **ONNX `all-MiniLM-L6-v2`** | Local embedder for skill_search and pgvector queries. 90 MB model. On-demand. | 0 MB idle, 90 MB during embed | 200 MB | 90 MB model | spike |
| **Bun + SQLite + Vue dashboard (disler pattern)** | Tiny observability: PostToolUse hook → Bun HTTP → SQLite → SSE → dashboard tab. Replaces $50-100/mo Langfuse. | 80 MB | 120 MB | 500 MB events (90d) | 1% |
| **Tailscale daemon** | Zero-config tunnel from Cloudflare Workers and Adam's phone into the Bastion. No port forwarding. Free for personal use (3 users / 100 nodes). | 30 MB | 50 MB | n/a | <1% |
| **launchd / monit (process supervision)** | Restart services if they die. Native to macOS. | 5 MB | 5 MB | n/a | <1% |
| **Total steady-state** | | **~795 MB** | | | |
| **Total at full load (4 parallel claude + 2 MCP active + embed running)** | | **~3.2 GB** | | | |

**Headroom under macOS overhead:** 8 GB - 3.5 GB (macOS + browser) - 3.2 GB (us at peak) = **~1.3 GB safety margin**. Tight but workable. If Adam runs Chrome with 30 tabs we will swap. Mitigation: kill the GUI side of macOS as much as practical, run headless, SSH in.

### What MUST be cloud (cannot run on the Mac)

1. **Anthropic API itself** — no local LLM is plausible at 8 GB for real coding work. Settled.
2. **Public webhook endpoints** — exposing port 80/443 from a home network is a security and reliability nightmare. Cloudflare Workers in front, Tailscale to the Bastion behind.
3. **Email send (Resend)** — already on stack, transactional infra.
4. **Production database** — Supabase. The Bastion Postgres is for the *agent fleet*, NOT customer data. Two different DBs.
5. **Routines that must run when the Mac is off** — Anthropic Routines (Mac mini will be on 99.5% of the time, but ISP outage / breaker trip happens; cron-critical work needs cloud).
6. **CI** — GitHub Actions, free 2000 minutes/mo for public repos.

### What MUST be local (cannot reasonably go to cloud at $0)

1. **The Remote Control daemon** — it IS the local interactive terminal Adam is steering remotely. By definition not cloud.
2. **The tmux farm of `claude -p --bare`** — billed against Adam's Max plan; running it on a cloud VM would just add VM compute cost on top.
3. **Postgres for fleet state** — Supabase free tier has 500 MB DB and 50K monthly active users (irrelevant) but row egress and connection caps are tight; fleet hook events would burn it. Local = free + faster.
4. **MCP stdio servers** — they're stdio child processes by design.
5. **The disler observability dashboard** — needs a hot subscription to hook events; running it on free Vercel means every PostToolUse hook becomes a serverless invocation. Local SQLite + SSE = $0.

### Self-hosted Langfuse / Helicone — HONEST NO

Langfuse requires Postgres + ClickHouse + Redis + Node + (in newer versions) MinIO. Even the "minimal" docker-compose footprint is ~3.5 GB RAM. **Will not fit on the 8GB Mac alongside everything else.** Don't even try.

The disler pattern (Bun + SQLite + ~500 LOC) gives us 80% of Langfuse's local value (trace timeline, cost rollup, error grouping) at 80 MB instead of 3.5 GB. Phase Langfuse to Phase 2 (paid, cloud) when we have $0.5/customer/mo to spare.

---

## The Cloud Free Tiers (Vercel + Supabase + Cloudflare + GitHub Actions — exact usage)

### Vercel (Hobby, free)

**Limits:** 100 GB-hours function execution / 100 GB bandwidth / 6000 build minutes / 1 user. No commercial use, but the *fleet dashboard* is internal-only — fine.

**What we put on it:**

1. **Read-only fleet dashboard** (`/status`, `/changelog`, `/dashboard`) — Next.js RSC, reads from Supabase, zero writes. ~50 MB RAM per request, 200ms p95. Hits Hobby limits at ~10K req/day; we'll see ~50/day.
2. **Public agent endpoints** — `/changelog` (auto-generated from agent commits), `/status` (Bastion health checked via Cloudflare KV ping), `/embed/agent-card` (eventual Marketing site widget).
3. **Voice → ticket iOS Shortcut endpoint** — actually goes to Cloudflare Workers (lower latency, no cold start). Not Vercel.
4. **Linear webhook bridge** — also Cloudflare Workers (HMAC at the edge is cheaper).

**What we DO NOT put on Vercel:** anything stateful, anything calling the LLM at scale (each invocation = function-seconds), the Bastion proxy.

### Supabase (Free, $25 Pro if we ever need it)

**Free tier:** 500 MB DB / 1 GB file storage / 5 GB egress / 2 active projects / pauses after 1 week inactivity.

**The 1-week pause is the killer for free tier.** The fleet writes to it daily — this saves us. A *fully* idle dashboard would die.

**What we put on it:**

1. **pgvector for skill embeddings (read replica of Bastion)** — embeddings sync nightly from Bastion. Why also on Supabase? So Anthropic Routines (cloud) can search skills when the Bastion is unreachable. ~650 KB. Trivial.
2. **Memory Tool overflow / archival** — old `/memories` files get gzip'd and archived to Supabase Storage after 30 days. Bastion keeps hot, Supabase keeps cold.
3. **Decision log / audit log as a real table** — every agent action that affects shared state (merge, env var change, customer-data read) writes a row. RLS-protected. Queryable from the dashboard. Backup of the Bastion's local copy.
4. **Beamix product DB itself** — already on Supabase Pro ($25/mo, already paid). Same Supabase project, separate `agent_*` schema namespace.

### Cloudflare (Free)

**Workers Free:** 100K requests/day, 10ms CPU per req, 128 MB RAM. **Generous enough that we'll probably never see paid.**
**KV Free:** 100K reads/day, 1K writes/day, 1 GB.
**R2 Free:** 10 GB storage, 1M Class A ops/mo, 10M Class B ops/mo, **zero egress**.

**What we put on it:**

1. **Workers — the receptionist for every webhook**
   - `linear-webhook` — HMAC verify, parse, push to Bastion via Tailscale or Supabase queue
   - `github-webhook` — same pattern
   - `ios-shortcut-endpoint` — Adam's voice → Anthropic Messages API → enqueue Linear ticket
   - `voice-relay` — Whisper API call + Linear push (when Bastion is offline)
   - `bastion-health` — pings Bastion every 60s via Tailscale, writes to KV; fleet dashboard reads from KV (so the dashboard works even if Bastion is asleep)
2. **R2 — artifact storage**
   - Agent screenshots, generated reports, intermediate diffs
   - Zero egress means the dashboard can render images for free
   - 10 GB is a LOT of agent outputs (a 90-day rolling window covers it easily)
3. **KV — ephemeral state**
   - Bastion health pings
   - One-time idempotency keys for webhook dedup
   - Feature flags for the fleet (Adam toggles "auto-merge enabled" from his phone)

### GitHub (Free for public repo, $4/user/mo Team for private — Adam already pays Pro $4)

**Actions Free for private:** 2000 minutes/mo. Sufficient for our use case if we're disciplined.

**What we put on it:**

1. **`claude-code-action@v1`** — PR review on every PR. Average ~2 min per run × ~30 PRs/mo = 60 minutes. Fine.
2. **Nightly QA workflow** — runs `tsc`, `eslint`, `semgrep`, `pnpm test --bail`. ~6 min × 30 days = 180 minutes/mo.
3. **Dependency audit** — weekly `pnpm audit` + `dependabot`. ~2 min × 4 weeks = 8 minutes/mo.
4. **Skill embedding refresh** — when `MANIFEST.json` changes, re-embed and push to both Bastion (via webhook) and Supabase (via SQL). ~3 min per trigger × ~10/mo = 30 minutes/mo.
5. **Issues** — long-tail task tracker alongside Linear. Linear = current work; Issues = backlog graveyard, public-facing changelog source.
6. **Total Actions burn:** ~280 minutes/mo. **14% of free quota.** Plenty of headroom.

---

## The $20-50 Spend (line items with rationale, must total ≤$50)

I deliberately **kept this under $50** and prioritized things that have no free alternative.

| Line item | $/mo | Why this and not free | Cancel order |
|---|---|---|---|
| **Anthropic Routines pad on existing Max** | $0 | Max plan covers 15 routines/day. Adam already pays Max. **Genuinely $0 incremental.** | n/a |
| **Domain (control plane)** | $1 | `beamix-fleet.dev` or use existing `beamix.tech` subdomain. Effectively $0 if we reuse. | n/a |
| **Cloudflare Tunnel (alternate Tailscale)** | $0 | Free tier covers Adam's case. | n/a |
| **Supabase Pro** | already paid | Adam is already on Pro for product. Agent uses same project. | n/a |
| **OpenRouter top-up (fallback model gateway)** | $20 | When Claude API has incidents (happens), OpenRouter routes to Gemini/Grok/etc. without code change. $20 is ~6M Sonnet-equivalent tokens at OpenRouter spot. Pure insurance. | **first to cut** |
| **Anthropic API on top of Max (overage)** | $10 | Max plan rate-limits during peak. Direct API spend overflow during long Routines or research bursts. Hard cap at $10. | second to cut |
| **Cloudflare Workers Paid (only if we exceed free)** | $0 ($5 if exceeded) | Pre-budgeted. We won't hit it in year 1. | conditional |
| **Backblaze B2 (cold backup of Bastion Postgres)** | $1 | $0.005/GB/mo × ~50 GB rolling backups = $0.25. Round to $1 for tiny ops fees. Disaster recovery for the fleet brain. | last to cut |
| **GitHub Pro (Adam already pays $4)** | $0 incremental | Already paid. | n/a |
| **PowerSchedule UPS for the Mac mini (one-time amortized)** | $2/mo | $50 UPS amortized over 24 months. Home power blip = fleet down for hours otherwise. Hardware not subscription, but I'm honest in the budget. | n/a |
| **TOTAL NEW SPEND** | **$34/mo** | **$16 of headroom inside the $50 ceiling** | |

**Notes on what I refused to add:**

- **Cursor Pro $20** — not needed; Adam codes in Claude Code and the tmux farm replicates Background Agents at $0. Reconsider only if Adam personally prefers the Cursor IDE.
- **Inngest Pro $50** — over budget, and we don't need durable execution at solo scale. Bash retry loops + Redis dedupe = poor man's durable execution. Adopt at 50+ paying customers.
- **E2B sandboxes $45** — `git worktree` + `isolation: worktree` flag gives us isolation. Don't pay for VM-grade isolation until we're running untrusted code (we're not).
- **Langfuse Cloud $29 minimum** — disler dashboard covers it.
- **Linear paid seat $8/seat** — Adam is solo; free tier (250 issues) is plenty. Reconsider only at hire #1.

---

## The "Poor Man's Devin" — parallel agents on a home Mac (recipe)

This is the section I want to defend most aggressively. Cursor Background Agents and Devin are *useful*, but at solo-founder scale, **a tmux session running N×`claude -p --bare` is functionally equivalent and free.**

### The recipe

```bash
# /usr/local/bin/army-launch — Bash launcher, ~80 LOC
#
# Usage:  army-launch task-spec.json
# Effect: parses task spec, creates worktree, opens tmux pane,
#         runs claude -p --bare with the spec, streams output to
#         Redis pub/sub channel, returns when worker exits.

set -euo pipefail
TASK_SPEC="$1"
TASK_ID=$(jq -r .id "$TASK_SPEC")
PROMPT=$(jq -r .prompt "$TASK_SPEC")
MODEL=$(jq -r '.model // "claude-sonnet-4-6"' "$TASK_SPEC")
TIMEOUT_MIN=$(jq -r '.timeout_min // 30' "$TASK_SPEC")

# 1) Create the worktree from the main repo root (worktree-aware)
MAIN_REPO=$(git worktree list | head -1 | awk '{print $1}')
git -C "$MAIN_REPO" worktree add ".worktrees/$TASK_ID" -b "feat/$TASK_ID"

# 2) Open a tmux window for it (named, not detached — visible from `tmux a`)
tmux new-window -t army -n "$TASK_ID" -c "$MAIN_REPO/.worktrees/$TASK_ID"

# 3) Run claude headless in that window, with timeout
tmux send-keys -t "army:$TASK_ID" \
  "timeout ${TIMEOUT_MIN}m claude -p --bare --model $MODEL '$PROMPT' \
     --output-format stream-json \
     | tee >(redis-cli -x publish army.events.$TASK_ID) \
     | jq -c . >> /var/log/army/$TASK_ID.jsonl ; \
   redis-cli rpush army.completed $TASK_ID" Enter
```

### What this gives us

- **N parallel agents.** One tmux window per task. `tmux a -t army` shows them all live.
- **Live event stream.** Every agent's stream-json events go to a Redis pub/sub channel; the disler dashboard subscribes and renders timelines.
- **Crash recovery.** Bash launcher writes JSONL log per task; if Mac reboots, we read the log and resume. `claude --resume <session-id>` exists.
- **Isolation.** Each worktree is its own filesystem; native `isolation: worktree` flag in agent frontmatter handles git safety.
- **Cost.** $0 on top of Adam's existing Max plan. Each `claude -p` call counts against Max usage limits, not API billing.

### What it doesn't give us (vs. Cursor/Devin)

- No cloud VM = if Mac is off, no progress. **Mitigation: Anthropic Routines for cron-critical work.**
- No managed dashboard = the disler dashboard is what we get. Less polished than Cursor's UI. Acceptable trade.
- No browser/computer-use sandbox = Beamix work is git+content driven, not browser driven. Genuine non-issue.
- Concurrency capped by Mac RAM = realistically 4 parallel claude sessions at 8 GB. Cursor Pro = 8. **Mitigation: queue overflow into Redis; Bastion drains as RAM frees.**

### Sizing the parallel-agent ceiling

- Each `claude -p --bare` session: ~300 MB resident
- Bastion baseline reserved: ~800 MB
- macOS + spotlight + 1 browser tab: ~3.5 GB
- 8 GB total → **(8 - 3.5 - 0.8) / 0.3 = ~12 max sessions, but we should plan for 4 to leave swap headroom.**
- 4 parallel = 4× faster than sequential. Cursor's 8 doesn't help much when Adam is solo and reviewing serially.

### When this breaks: see "Scaling Cliffs" section below.

---

## What Will Break First — Honest Scaling Cliffs

| Customer count | What breaks | Why | Fix (when it breaks, not before) |
|---|---|---|---|
| **0-10 customers (today)** | Nothing. The stack is over-spec'd for solo. | | |
| **10-25 customers** | Email send rate (Resend free 100/day). | Customer transactional emails compete with agent notifications. | Resend Pro $20/mo — 50K/mo. Already in budget if needed. |
| **25-50 customers** | **Bastion RAM under sustained 4-agent parallel + customer-facing scan jobs.** Inngest customer-facing jobs land on Vercel and call Bastion APIs over Tailscale; if Bastion is also running 4 agents the Mac swaps and everything slows. | Customer scan and agent fleet contend for the same 8 GB. | **Move Beamix product Inngest jobs to Inngest Pro ($50/mo cloud).** Bastion becomes agent-fleet-only. **Cliff: $50/mo.** |
| **50-100 customers** | **Cloudflare Workers free tier** (100K req/day) on bot-heavy traffic. Vercel Hobby's commercial-use clause becomes legally relevant. | Public endpoints scale with customers. | Vercel Pro $20/mo (already on Pro for product). Cloudflare Workers Paid $5/mo. **Cliff: $25/mo.** |
| **100-200 customers** | **Mac mini's home ISP becomes the bottleneck** (residential bandwidth cap; ISP outage = fleet downtime). | Home reliability is not 99.9%. | **Migrate Bastion to a $20/mo Hetzner CX22 (4 vCPU, 8 GB).** Tailscale tunnel patterns are identical. **Cliff: $20/mo.** |
| **200-500 customers** | **Fleet observability** — disler dashboard's SQLite hits ~5GB and queries slow. Agent failures are no longer easy to root-cause. | At this scale we have agent SLOs to defend. | **Langfuse Cloud Free tier** (50K observations/mo) or self-hosted on the Hetzner box. **Cliff: $0-29/mo.** |
| **500+ customers** | **Anthropic rate limits per-organization.** Routines + tmux farm + customer-facing inference all share one API quota. | We become an enterprise Anthropic customer. | Anthropic Scale plan / Workload pricing. Negotiate. **Cliff: 4-figure/mo, but margin is there.** |

**Sequence of paid additions as Beamix grows:**

```
Today    → $34/mo  (this plan)
@25 cust → $84/mo  (+ Inngest Pro)
@50 cust → $109/mo (+ Cloudflare Workers Paid + Vercel Pro confirmed needed)
@100 cust → $129/mo (+ Hetzner box, Mac retired or repurposed)
@500 cust → $300+/mo (+ Langfuse + Anthropic Scale negotiations)
```

**The point of starting at $34 isn't penny-pinching. It's that every dollar added past customer #25 is a dollar Adam can confidently commit because revenue covers it.** Anything we pay for *now* before revenue is theology, not engineering.

---

## Local LLM Reality Check

I will not lie to Adam about this.

### What an 8 GB Mac CAN run locally — usefully

1. **`all-MiniLM-L6-v2` (90 MB ONNX)** — embedder for skill_search, query rewriting. Runs in ~10ms on CPU. **Use it.** This kills the $0.14/session MANIFEST.json burn cited in Report 13.
2. **Whisper.cpp tiny.en (75 MB)** — voice transcription. ~3× realtime on M-series Mac. Good enough for Adam's "voice in the shower → ticket" workflow. **Use it.**
3. **Whisper.cpp small.en (250 MB)** — better transcription for accent edge cases or noisy environments. Optional.
4. **Reranker models** like `bge-reranker-base` (~280 MB) for second-stage retrieval. Optional, modest gain.

### What an 8 GB Mac CANNOT usefully run

1. **Llama 3 8B** — needs 5-6 GB just for the model in q4. Leaves ~2.5 GB for everything else. Will swap, will be slow, will produce mediocre output vs. Sonnet. **Don't bother.**
2. **Qwen 7B / Mistral 7B** — same story.
3. **Phi-3-mini (3.8B)** — fits at q4 (~2.3 GB), runs at ~15 tok/s on M2. **Quality is below GPT-3.5.** For triage/classification it's defensible, but Haiku 4.5 at $1/M tokens already does this better and faster. The marginal saving doesn't justify the operational complexity.
4. **Anything that does real coding work locally.** Not at this RAM budget. Not in 2026. Not even close.

### The honest bottom line on local LLMs

**The 8 GB Mac runs embedders and Whisper. Period.** Real LLM work (anything with reasoning, tool use, codegen) goes to the Anthropic API, which we already pay for. Trying to run a 7B model locally is a hobby, not engineering.

If Adam upgrades to a 32 GB Mac mini in the future ($800-ish), THEN we can host Qwen-Coder-32B locally for free triage and have a real local-first story. **Today, with 8 GB, no.**

---

## Bill of Materials (final $/mo — show the math)

### What Adam already pays (for context, not in the new spend)

| Existing | $/mo | Notes |
|---|---|---|
| Claude Max | $100 | Covers tmux farm + Routines |
| Vercel Pro (for Beamix product) | $20 | Reused for fleet dashboard at $0 incremental |
| Supabase Pro (for Beamix product) | $25 | Reused for `agent_*` schema at $0 incremental |
| Paddle | usage % | Customer payments |
| Resend (free tier today) | $0 | 100/day fine for now |
| Inngest (free tier today) | $0 | Free 50K steps/mo fine for now |
| OpenRouter | usage | Already configured, ~$5-10 organic |
| GitHub Pro | $4 | Already paid |
| **Subtotal already paid** | **~$155/mo** | |

### What this plan ADDS (the $50 ceiling)

| New line | $/mo | Hard or estimate |
|---|---|---|
| OpenRouter pre-pay (insurance) | $20 | Hard cap |
| Anthropic API overage above Max (insurance) | $10 | Hard cap |
| Backblaze B2 cold backup (Bastion) | $1 | Estimate |
| UPS amortized (one-time $50 over 24mo) | $2 | Hardware |
| Domain (already owned `beamix.tech`) | $0 | Reused |
| Tailscale | $0 | Free tier |
| Cloudflare Workers/KV/R2 | $0 | Free tier |
| Vercel Hobby (fleet dashboard) | $0 | Reusing Pro plan Adam already has |
| Supabase Free (separate project for fleet) | $0 | OR reuse Pro project, also $0 incremental |
| GitHub Actions (private repo) | $0 | Within free 2000 min |
| Self-hosted on 8GB Mac | $0 | Hardware Adam owns; ~$10/mo electricity ignored as sunk |
| **TOTAL NEW SPEND** | **$33/mo** | **Under the $50 ceiling by $17** |

### Total all-in agent + product infra

**$155 (existing, would be paid anyway) + $33 (new for the army) = $188/mo for the entire Beamix operation including a fully autonomous agent fleet.**

For comparison: V2's proposal was **$295/mo of *new* spend** (Cursor + Inngest + E2B). We're delivering equivalent fleet capability — minus some polish — for **11% of that figure.**

The trade is brutally explicit: we lose Cursor's UX, Inngest's durable execution UI, and E2B's true sandbox isolation. We keep the autonomous fleet, the remote control, the cloud overflow (Routines), the observability, the parallel agents, and the memory architecture.

---

## Bottom Line (what the board must decide)

The board must decide three things, each a yes/no:

### 1. Are we OK trading polished UX for $260/mo of preserved runway?
**Yes** = adopt this plan. Cursor's IDE polish and Inngest's pretty workflow UI are nice; they aren't load-bearing. The disler dashboard + tmux farm covers the same use cases at $0. **No** = adopt V2's $295/mo plan.

**The architect's recommendation: YES.** At pre-revenue solo scale, every dollar saved is runway. We can buy Cursor at customer #25 if Adam genuinely misses it. We cannot un-spend money.

### 2. Are we OK with the Bastion being a single point of failure (one home Mac, one ISP)?
**Yes** = adopt as-is. Routines + Cloudflare Workers cover the time-critical work when Mac is down. Reliability target: 99% (about 7 hours downtime/month — fine for an internal agent fleet). **No** = move directly to Hetzner $20/mo from day 1.

**The architect's recommendation: YES, with a $20/mo Hetzner trigger at customer #50** (or sooner if Mac downtime burns Adam more than once). Pre-revenue, the Mac is fine.

### 3. Are we OK living without local LLMs entirely?
**Yes** = adopt as-is. Embeddings local, reasoning cloud. **No** = upgrade to a 32GB Mac mini ($800 capex) and we can host Qwen-Coder-32B for free triage.

**The architect's recommendation: YES, for now.** A 32 GB Mac mini upgrade is a 2026 Q4 conversation, not a today conversation. The marginal value of a local 7B is below the engineering cost of operating it.

---

**One more honest thing for the board:** This stack works *because* the team is one person. The lack of polish (no managed dashboard, no SaaS monitoring, no failover for the Bastion) is acceptable when one human is also the operator. The day Adam hires engineer #2, the calculus changes — multi-user observability and managed durable execution become real requirements. **This plan is correct for solo-founder Beamix today. Plan to revisit it the week after the first hire.**
