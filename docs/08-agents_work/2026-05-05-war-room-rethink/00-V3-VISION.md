# Beamix War Room — V3 VISION: The Bigger Picture
**Date:** 2026-05-06 · **Author:** CEO synthesis after V3 Board Meeting (6 specialized personas) · **Status:** The vision Adam didn't ask for but needs

---

## What V3 changes about everything

**V1 was tactical** (P0 bugs, Linear MVP, ~40-70% cost cut). **V2 was strategic** (Anthropic-native autonomous-army stack, $295/mo). **V3 is the bigger frame** — the army Adam needs but didn't know to ask for, under hard cost constraints.

Two findings rewrite the prior plans:

1. **The Architect made V2 fit in $33/mo new spend** instead of $295. The 8GB home Mac as a "Bastion" hosting Postgres+pgvector, Redis, the Remote Control daemon, MCP servers, and **a tmux farm of `claude -p --bare` calls = a poor man's Devin** at 1/9th the cost. V2's $295/mo plan is now obsolete.

2. **The Visionary called the army "throughput infrastructure, not a flywheel."** Today, every agent action dies. Zero data accrues to Beamix-the-company. *The army builds the product but isn't building the company.* This is the silent killer at month 9 of every solo-founder-with-army startup the Visionary has watched.

Wave 1 fixes (P0 bugs) still ship. Wave 2 architecture still ships. **V3 adds a new layer above all of it — the company-as-flywheel layer — and a new layer below it — the Adam-as-human layer.**

---

## The 6 personas, the 6 verdicts

| Persona | One-line verdict |
|---------|------------------|
| **Visionary** (Opus) | *"The army is a service factory. Reframe Beamix as Bloomberg Terminal of AI Search funded by SMB subscription. Spawn complete-company org Day 30. Lock data layer Day 1 — that's the Day-1 regret you can't recover from."* |
| **Chief of Staff** (Sonnet) | *"5 Routines = the fleet's heartbeat. ~$5-15/mo. Binary-ping escalation. Weekly 30-min 1:1 is your primary lever — not code reviews."* |
| **Strategist** (Sonnet) | *"You have a backlog, not a strategy engine. Add stop-loss conditions, ANTI-ROADMAP as fleet constraint, 3 signal Routines feeding the roadmap. 4 board meetings/month max."* |
| **Architect** (Opus) | *"$33/mo new spend, total $188/mo all-in. The 8GB Mac is your Bastion. tmux + `claude -p --bare` = poor man's Devin, saves $245/mo. Self-hosted Langfuse impossible at 8GB → disler pattern instead. Local LLMs = embedders + Whisper only."* |
| **Personal Systems** (Sonnet) | *"World-class army, no personal OS. Three interventions: iOS Shortcut idea capture + morning Routine; Apple Watch → Green/Yellow/Red day classifier that throttles the army; voice-erosion audit so the army doesn't atrophy your judgment."* |
| **Risk Modeler** (Opus) | *"Three risks must be mitigated before Wave 2 ships: Memory Tool poisoning (~6h fix), prompt injection via Linear (~8h), cost runaway + irreversible actions (~16h). Total ~42h + $1,700 legal templates."* |

---

## 1. The Visionary's three audacious bets (the bigger frame)

### Bet 1 — Reframe: Bloomberg Terminal of AI Search, funded by SMB subscription

> *Competitors fund the data with VC and sell the data. Beamix funds the data by selling the agency service. Five moats, all collected Day 1, none yielding value until month 6+, become uncatchable by month 18.*

The five compounding datasets, captured starting Day 1:
1. **Engine citation graph** — every scan, every engine, every URL cited, longitudinal
2. **Edit-distance dataset** — every Inbox accept/edit/reject = labeled training data on what content actually wins
3. **Industry vocabulary** — what queries SMBs in each vertical actually use, with engine response variance
4. **Competitor move log** — every detected change to competitor websites + measured AI-search impact
5. **Decision log with 90-day outcome backfill** — every Beamix recommendation paired with measured rank/citation outcome 90 days later

**Profound and AthenaHQ cannot copy this without destroying their unit economics** — they sell the data, so giving it away as a side effect is impossible.

### Bet 2 — Spawn complete-company org by Day 30

The current 32-agent army is an **engineering org**. The Visionary's call: **spawn the rest of the company NOW** so it has 5 months of supervised learning before Adam needs it:

| New agent | Reason it must exist Day 30 |
|-----------|-----------------------------|
| **Customer Success agent** | First 10 customers will need 24/7 hand-holding. Adam won't sleep otherwise. |
| **Sales agent** | Inbound qualification, demo scheduling, follow-up email sequences. |
| **Brand Voice Guardian** | Every external touch checked against voice canon Model B. |
| **CFO agent** | Burn rate, runway, MRR/ARR tracking, top-up reconciliation, monthly P&L. |
| **Chief of Staff agent** | The 5-Routine heartbeat (see §3 below). |
| **Talent agent** | When Adam hires the first human in month 12, this agent has prepared the JD, sourcing pipeline, and onboarding doc since month 1. |
| **Investor Update agent** | Monthly investor letter draft (Adam will need this in month 6 when fundraising starts). |
| **Aria adversary agent** | Already in V1 (QA Full-tier). Reused here. |

**Failure mode this prevents:** the documented 80% kill mechanism for solo-founder-with-army startups — becoming the bottleneck on every non-engineering function around month 4 and burning out before revenue lets you hire humans.

### Bet 3 — Lock the data layer Day 1, permanent retention on everything

Cost: one day of schema work. Tables: `agent_runs`, `agent_inputs`, `agent_outputs`, `inbox_actions` (accept/edit/reject), `decisions_with_outcomes`, `competitor_observations`, `customer_voice_transcripts`, `engine_citation_snapshots`. All on Supabase pgvector (already paid). All retained forever.

**The Day-1 regret you absolutely cannot recover from is "we didn't capture the data."**

---

## 2. The $33/mo bill of materials (Architect)

**Total new spend: $33/mo.** Total all-in including existing product subs (Vercel/Supabase/Paddle/Resend/Inngest): **$188/mo**. V2 was $295. **89% cut.**

### Topology

```
                   ┌─────────────────────┐
                   │   Adam (anywhere)   │
                   │ phone, mac, browser │
                   └──────────┬──────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
      Linear Mobile    Telegram/iMessage   claude.ai/code
            │                 │                 │
            └─────────────────┼─────────────────┘
                              │
                  ┌───────────▼────────────┐
                  │  Cloudflare Workers    │  (FREE tier)
                  │  HMAC verify, route    │
                  └───────────┬────────────┘
                              │ Tailscale tunnel (FREE)
                              ▼
        ┌──────────────────────────────────────────┐
        │       8GB MAC BASTION (always-on)        │
        │  ┌──────────────────────────────────┐   │
        │  │ Claude Code Remote Control daemon │   │
        │  │ tmux farm of `claude -p --bare`   │   │  ← poor man's Devin
        │  │ Postgres + pgvector (memory L3-5) │   │
        │  │ Redis (queues, locks)             │   │
        │  │ MCP servers (linear, gh, supabase,│   │
        │  │   custom mcp-memory)              │   │
        │  │ Whisper.cpp (local voice STT)     │   │
        │  │ ONNX MiniLM (skill embeddings)    │   │
        │  │ Bun + SQLite + Vue dashboard      │   │  ← disler observability
        │  │   (replaces Langfuse)             │   │
        │  └──────────────────────────────────┘   │
        │  RAM: ~3.2 GB peak / 8 GB total           │
        │  COST: $0 (electricity)                   │
        └─────────────────┬────────────────────────┘
                          │ async writes
                          ▼
        ┌──────────────────────────────────────────┐
        │  SUPABASE (already paid)                 │
        │  • pgvector mirror (cloud availability   │
        │    when Mac is off)                      │
        │  • audit log, decision log               │
        │  • the 5 Visionary datasets              │
        │  • Anthropic Memory Tool overflow        │
        └──────────────────────────────────────────┘

        ┌──────────────────────────────────────────┐
        │  GITHUB (free tier)                      │
        │  • claude-code-action (PR review)        │
        │  • nightly QA / lint / dep audit         │
        │  • Issues as long-tail backlog           │
        └──────────────────────────────────────────┘

        ┌──────────────────────────────────────────┐
        │  ANTHROPIC ROUTINES (paid in Max)        │
        │  Only the 5 cron-critical Routines       │
        │  (morning digest, EOD sync, auto-unblock,│
        │   Monday standup, Friday retro)          │
        └──────────────────────────────────────────┘
```

### The bill

| Line item | Monthly $ | Why |
|-----------|-----------|-----|
| **Anthropic API spend** (after token-reduction wins) | ~$80-150 | Already in your $100/mo Claude Max — fits |
| **Vercel Hobby** | $0 | Already paid in product stack |
| **Supabase** | $0 | Already paid in product stack |
| **Paddle / Resend / Inngest** | $0 | Already paid in product stack |
| **Cloudflare Workers + R2** | $0 | Free tier covers solo-founder traffic |
| **Tailscale** | $0 | Free for personal use, ≤3 devices |
| **GitHub Actions minutes** | $0 | Free tier 2000 min/mo |
| **Mac mini electricity** | ~$3 | Always-on home Mac |
| **One small VPS (optional, scaling cliff at ~50 customers)** | $5-30 | Hetzner CX22 / Fly.io tiny instance — only if home Mac becomes SPOF |
| **Total NEW SPEND** | **$3-33/mo** | Under $50 ceiling |

### Three sharpest architectural calls

1. **No Cursor Background Agents, no Inngest AgentKit, no E2B sandboxes.** Replaced by tmux + `git worktree` + Redis + Bash. Saves $245/mo. The trade is UX polish, not capability.
2. **Self-hosted Langfuse is impossible at 8GB.** Honest no. Disler pattern (Bun + SQLite + 80MB) gives you 80% of the dashboard at 5% of the RAM.
3. **Local LLMs = embedders + Whisper only.** A 7B model on 8GB is a hobby toy. Haiku 4.5 at $1/M tokens beats it on every axis. Don't fight this.

### Scaling cliffs (when each thing breaks)

- **25 customers:** Mac mini RAM gets tight. Add swap, monitor.
- **50 customers:** Mac mini becomes SPOF. Spin up the $5-30 VPS as Bastion failover. New total: $8-63/mo.
- **100 customers:** Postgres on Mac mini chokes. Move to Supabase as primary, Mac as cache. ~+$25/mo.
- **500 customers:** Need real cloud agent runtime. Re-evaluate Cursor Bg / Inngest AgentKit / E2B at that point. Probably ~$200-400/mo at that scale.

**The Bastion stack is correct for Beamix from solo through ~50 customers. Don't scale early.**

---

## 3. The 5-Routine Heartbeat (Chief of Staff)

The fleet's missing operating system. Combined cost: **~$5-15/month.** No new software.

| Routine | When | Model | What it does | Output |
|---------|------|-------|--------------|--------|
| **Morning Digest** | 07:30 daily | Sonnet | Reads 6 files (yesterday's session logs, brain/log, AUDIT_LOG, BACKLOG, customer voice, competitor signals). | One parseable markdown digest Adam reads in 2 min. |
| **EOD Sync** | 20:00 daily | Haiku | Appends to `brain/log.md`. Detects abandoned worktrees. Pings only if action required. | Zero noise unless something's wrong. |
| **Auto-Unblock** | Fires on any session file marked BLOCKED | Sonnet | Attempts 3 self-resolution strategies before pinging Adam. | Either resolved-and-resumed OR a single Telegram with strict "Reply A or B" format. |
| **Monday Standup** | 08:00 Monday | Sonnet | Reads the week. Produces fleet status: cost allocation, dependency map, "decisions you'll regret," initiative health, ANTI-ROADMAP breaches. | The 30-minute Adam 1:1 input doc. |
| **Friday Retro** | 18:00 Friday | Sonnet | Reads the week. Identifies patterns. **Writes rules back into agent `.md` files** = compounding flywheel. | One PR with proposed agent-file edits, Adam reviews Saturday morning. |

### The binary-ping escalation

L1 (agent self-resolves via docs) → L2 (Auto-Unblock Routine attempts resolution) → L3 (one Telegram message: agent / blocker / option A / option B / recommendation / "Reply A or B") → L4 (live session, rare). **Maximum agent downtime: 4 hours. Adam's time per escalation: 30 seconds.**

### The weekly 1:1

30 minutes Monday. Adam reads the digest, spot-checks 2 session files for reasoning quality, reads "decisions you'll regret," writes one concrete instruction to an agent file or DECISIONS.md. **Over 12 weeks, this is the primary driver of fleet quality improvement.** Not code reviews. Not sprints.

---

## 4. The Strategy Machinery (Strategist)

### Stop-loss conditions written before launch

Every initiative gets a **specific measurable kill condition** in `ROADMAP-90.md` before any code. Monday Roadmap Routine reads every stop-loss weekly and flags breaches automatically. Adam gets one override per initiative — never two.

> *Catches bad bets at week 2 instead of week 8, when sunk cost has already distorted judgment.*

### ANTI-ROADMAP as fleet enforcement

`docs/ANTI-ROADMAP.md` is not a list for Adam — **it is a constraint the fleet checks before any initiative proposal reaches Adam.** When an agent's Mini-PR/FAQ hits an anti-roadmap item, it's auto-returned with the revisit condition.

Currently 8 NOT-doing items: white-label per-account, free tier, social strategy, n8n integration, voice phone calls, Beamie companion, custom 3D dashboards, Devin/Manus/Bolt cloud agents.

### Three signal Routines

| Routine | When | Watches | Feeds |
|---------|------|---------|-------|
| **Competitor + Engine Algorithm** | Sun 06:00 | Profound, AthenaHQ, OpenAI/Anthropic/Google blog | Monday Roadmap |
| **Customer Voice + Inbox Patterns** | Sun 07:00 | Inbox accept/edit/reject patterns, support tickets, NPS | Monday Roadmap |
| **GEO Algorithm Signals** | Bi-weekly | SEO subreddits, GEO research papers, AI engine update logs | Monday Roadmap |

All three feed the **Monday Roadmap Routine** which produces a 5-min digest of proposed roadmap changes.

### Initiative pipeline + RICE scoring

Every proposal is a 1-page Mini-PR/FAQ (Amazon pattern). RICE score auto-computed. RICE < 50 → auto-killed. Worked example: free GEO scoring widget → Reach 5K, Impact 1.5, Confidence 0.7, Effort 2 weeks → RICE 133 → in.

### Discovery 20% / Delivery 80% hard split

Enforced as a fleet constraint. Discovery work has its own budget — Adam can't accidentally spend 100% on delivery and never re-think.

### Board Meeting budget: 4/month

The V2 Board Meeting Pattern can become noise if overused. Triggers: pricing changes, new agent class, killing an initiative, market-signal pivot, major architectural change. Anything else uses lighter mechanisms.

---

## 5. Adam-OS (Personal Systems)

### Idea Capture → Triage Loop

50-line iOS Shortcut: Voice → Anthropic Messages API (Haiku, $0.001/idea) → Linear Inbox. 07:30 morning Routine reviews the night's captures, batches into 1-3 actionable Linear tickets. **Adam never loses an idea, never spends cognitive energy routing.** Total Adam time: 3 minutes per morning. Zero new tooling.

### Energy-Adaptive Army (this is novel)

07:00 daily HealthKit read → classify Adam's state:
- **Green** (sleep ≥7h, HRV normal): Army runs at full throughput, all decisions surface as normal.
- **Yellow** (sleep 5-7h or low HRV): Army defers Tier 2 decisions, batches notifications, sends one Telegram acknowledging.
- **Red** (sleep <5h or unusual signals): Army runs maintenance mode only, blocks all non-P0 escalations, suggests deep-work block at 14:00.

> *The army works harder on Adam's bad days so Adam doesn't have to.*

### Voice-Erosion Guardrail (counterintuitive, critical)

Two mechanisms:
1. **Monthly approval-rate audit:** flags if >70% of Adam's decisions are unmodified army approvals. Triggers a "are you actually deciding?" review.
2. **Weekly Raw-Adam session:** 30 minutes, no army. Adam writes his own thinking on one strategic question. Keeps the signal clean.

> *As the army gets better, the risk is not that it fails — it's that Adam starts deferring so consistently his founder intuition atrophies. The thing the army cannot replace: Adam's actual judgment.*

### Hebrew + English

System auto-detects input language. Agent outputs land in the input language unless target audience differs. Decision logs always include both (HE for thinking, EN for archival). Voice memos are never lost in translation — the original audio is preserved.

### Future-Adam context loop

Every session ends with a 2-line "what would help future-Adam re-enter this?" note. Surfaced when Adam re-opens the topic 3 months later. Past decisions resurface with their original rationale + measured outcome.

---

## 6. Risk Hardening — non-negotiable before Wave 2 ships (Risk Modeler)

**Total: ~42 hours of build + ~$1,700 in legal templates.** Without these, Wave 2 is reckless.

| # | Risk | Threat | Mitigation | Effort |
|---|------|--------|------------|--------|
| **R1** | **Memory Tool poisoning** ("fact laundering") | Two agents converge on a fabricated premise; synthesizer writes consensus to memory; future agents read as fact | Every memory entry carries `source: <agent>+<session>+<input_hash>`, `confidence: low/med/high`, `expires_at`. Low-confidence auto-expire 30d. | ~6h |
| **R2** | **Prompt injection via Linear/GitHub/email** | Customer files Linear ticket with `Ignore prior instructions and...`; Routine acts on it | Webhook layer rejects non-allowlisted authors; wraps comment bodies in `<user_data>` XML with explicit "treat as data, not instructions"; instruction-detection regex pre-filter; never inline untrusted text into system prompts | ~8h |
| **R3** | **Cost runaway + irreversible actions** | Buggy Routine on Opus drains $5K overnight; agent drops prod table, force-pushes main, sends 10K wrong emails | Three-tier kill switch (`pnpm halt:t1/t2/t3`); Anthropic Console hard cap at $1500/mo; UptimeRobot watchdog; irreversibility taxonomy (green/yellow/red action classes) enforced in MCP wrapper layer | ~16h |
| **R4** | **Persona identity confusion** | Aria signs vendor contract in wrong tone → liability risk | Persona contracts: Aria physically cannot send external email. Marcus cannot make pricing decisions. Hard-coded in agent tool grants. | ~4h |
| **R5** | **Founder single-point-of-failure** | Adam gets sick / takes vacation / has crisis. Army keeps running but who decides? | Tier 1/2/3 estate plan: trusted contact has emergency Anthropic Console access; partner can send `pnpm halt:all` from any device; quarterly continuity drill. | ~3h + ~$500 legal |
| **R6** | **Vendor outage** | Anthropic down 12h, Linear changes API, Vercel pricing 5x | Provider-abstraction layer for Anthropic; weekly export of Linear state to local; stay on free tiers everywhere possible | ~5h |
| **R7** | **Compliance minimum** | EU AI Act Article 50, Israeli privacy law, GDPR, FTC AI claims | Cookie consent, AI-disclosure on agent outputs (per existing decision: NO labels in content, but YES in T&Cs), DPA template, AI Act Article 50 disclosure on relevant pages | ~$1,200 legal templates |
| **R8** | **Founder AI co-dependency** | Founders losing ability to decide without AI consultation | Voice-Erosion Guardrail (§5 above); monthly Raw-Adam session; quarterly "delete the army for a week" exercise | Behavioral, not buildable |

**Without R1-R3 minimum, do not ship Wave 2.** R4-R8 should ship in Wave 3.

---

## 7. The complete Wave plan (V3 supersedes prior)

### Wave 0 — Stop the bleeding (V1, ~half day)
- Carry over from V1: kill 12 dead agents, sed `saas-platform`→`apps/web`, downgrade phantom MCPs, vendor `gsa-startup-kit`, compact CLAUDE.md, run worktree cleanup script

### Wave 1 — Make Claude Code see us + cut cost (V1)
- Carry over: move `.agent/` → `.claude/`, permissions block, OTEL telemetry, model routing, risk-tiered QA, skill purge to ≤350, memory repair

### Wave 2 — The Bastion + Remote Control (V3 revised)
1. Set up the 8GB Mac as Bastion (Postgres+pgvector, Redis, Tailscale)
2. Install Claude Remote Control daemon on Bastion
3. Install Telegram + iMessage Channel plugins
4. Stand up the 5 Routines (morning digest, EOD sync, auto-unblock, Monday standup, Friday retro)
5. iOS Shortcut: voice → Anthropic API → Linear ticket
6. Cloudflare Workers + Tailscale tunnel for webhook routing
7. `claude-code-action@v1` in `.github/workflows/claude.yml`
8. tmux farm runner for parallel `claude -p --bare` execution
9. **R1, R2, R3 risk hardening (mandatory before Wave 3)**

### Wave 3 — The Company-as-Org (V3 new — Visionary's bet 2)
10. Spawn 7 new agents: Customer Success, Sales, Brand Voice Guardian, CFO, Chief of Staff, Talent, Investor Update
11. Async-spec-trust mode for CEO when triggered from Linear
12. Anthropic Memory Tool wired with provenance + confidence + expiry (R1)
13. MANIFEST.json → pgvector skill_search
14. `isolation: worktree` flag adoption
15. Audit tool grants (Vercel "remove 80%" rule)

### Wave 4 — The Flywheel (V3 new — Visionary's bet 1 & 3)
16. **Lock the data layer Day 1** — schema + ingestion for 8 datasets (engine citation graph, edit-distance, industry vocabulary, competitor moves, decision log w/ outcome backfill, agent runs, inbox actions, voice transcripts)
17. Symphony-style Linear-as-control-plane
18. Stop-loss conditions enforcement on every initiative
19. ANTI-ROADMAP fleet constraint
20. 3 signal Routines (competitor, customer voice, GEO algorithm)
21. Discovery 20% / Delivery 80% budget enforcement
22. Board Meeting Pattern as `/board-meeting [question]` slash command
23. Persona contracts (R4)

### Wave 5 — Adam-OS + Continuity (V3 new — Personal Systems + R5-R8)
24. Energy-Adaptive Army (HealthKit → Green/Yellow/Red)
25. Voice-Erosion Guardrail (monthly audit + weekly Raw-Adam session)
26. Future-Adam context loop
27. Founder continuity (R5) + vendor resilience (R6) + compliance minimum (R7)

### Wave 6 — Optional / future
- Multi-agent observability dashboard (disler pattern, if disler-Bun-SQLite isn't sufficient by then)
- Move Postgres to Supabase as primary at ~100 customers
- VPS Bastion failover at ~50 customers

---

## 8. New decisions (D15-D22, builds on V1's D1-D7 and V2's D8-D14)

| # | Decision | Default if no input |
|---|----------|---------------------|
| **D15** | Adopt the **$33/mo Bastion stack** instead of V2's $295/mo plan? | **YES** (89% cost cut, same capability at our scale) |
| **D16** | Spawn the **7 new "complete-company" agents** (CS, Sales, Brand Voice, CFO, Chief of Staff, Talent, Investor Update) by Day 30? | **YES — Day 30 hard deadline** (5 months of supervised learning before they're load-bearing) |
| **D17** | Lock the **Day-1 data layer** (8 tables, permanent retention) — even before MVP launch? | **YES** (the one regret you can't recover from) |
| **D18** | The **5-Routine heartbeat** — ship in Wave 2 as $5-15/mo cron jobs? | **YES** (gives the fleet its missing operating rhythm) |
| **D19** | The **Strategy machinery** (stop-loss + ANTI-ROADMAP fleet enforcement + 3 signal Routines)? | **YES** in Wave 4 |
| **D20** | **Risk hardening R1-R3** as Wave 2 blocker — non-negotiable before Linear-as-control-plane? | **YES** (~30h of build, ships before Wave 3) |
| **D21** | **Adam-OS** (energy-adaptive army + voice-erosion guardrail + idea capture)? | **YES** in Wave 5 (build energy-adaptive first, it's free) |
| **D22** | The **Visionary's reframe** ("Bloomberg Terminal of AI Search funded by SMB subscription") — adopt as Beamix internal positioning? | **YES** for internal strategy. External messaging stays "AI search visibility for SMBs" until evidence accrues. |

---

## 9. The headline numbers (memorize these)

- **New software cost: $3-33/month** (vs. V2's $295/mo proposal — 89% cut)
- **Total all-in including existing product subs: $188/month**
- **Token reduction available: 55-75%** via the V2 wins
- **5-Routine heartbeat cost: ~$5-15/month**
- **Risk hardening R1-R3: ~30 hours build, blocks Wave 3**
- **Wave 3 deadline for complete-company agents: Day 30** (so they have 5 months to learn before load-bearing)
- **Day-1 data lock: 8 tables, permanent retention, ~1 day of schema work**
- **Personal Systems delta: $0** (everything is iOS Shortcuts + HealthKit + iMessage Channel + existing Routines)
- **Maximum agent downtime under Binary-Ping Escalation: 4 hours**
- **Adam time per escalation: 30 seconds**

---

## 10. The bigger picture in one paragraph

> Beamix today is a **product-building army**. Beamix in 24 months is a **company-building flywheel** — five datasets compounding into an uncatchable moat, seven non-engineering agents handling everything that isn't code, a 5-Routine heartbeat keeping the fleet awake while Adam sleeps, a strategy engine that proposes new bets and kills bad ones at week 2, an Adam-OS that protects the founder's judgment from his own army, and a $33/mo Bastion that does the work nine hosted platforms wanted $295/mo for. The army doesn't just build the product — it builds the company, captures the data, runs the operations, defends Adam's intuition, and gets ruthlessly pruned every Friday by a retro that writes new rules back into its own .md files. **That's the flywheel.**

---

**End of V3 vision. D15-D22 are the new decisions. D1-D14 from V1+V2 still open. Total: 22 decisions across 3 vision waves. Recommended sequence: greenlight D1, D3, D6, D8, D10, D11, D15, D17, D18, D20 today — those ten unlock everything else and are all reversible.**
