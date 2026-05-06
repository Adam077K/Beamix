# Beamix War Room — V4: The Corporate OS
**Author:** CEO, after Adam's V4 corrections · **Status:** The internal AI company that runs Beamix · **Supersedes:** V3 economics + V3 §5 Adam-OS (dropped per Adam)

---

## The vision in one sentence

**Adam is the board. Linear is the company. Agents in role-based teams (Engineering, Product, Marketing, Business, Customer Success) build, ship, propose, and improve Beamix 24/7. Adam supervises from anywhere — text the CEO, text the CTO, file a Linear ticket, get status back.**

This document is the corporate OS. It is NOT the Beamix product (AI search visibility for SMBs — unchanged). It is the AI company that runs Beamix.

---

## What V4 fixes from V3

| V3 had | V4 has | Why |
|--------|--------|-----|
| Adam-OS (energy/sleep/voice-erosion) | **Dropped entirely** | You want company automation, not personal automation |
| Dates and waves with timelines | **Sequenced by dependency only** | Everything can be done in 1 day; calendar planning is fiction |
| Persona names (Marcus, Aria, Yossi) | **Role-based names only** (CTO, AI Engineer, Product Designer) | Personas belong to the **product**; the **war room** is a generic company |
| Linear "as one option" | **Linear IS the company** | One canonical interface. Telegram for ad-hoc. claude.ai mobile for observe. |
| Workers can delegate to other workers | **Workers use TOOLS, not other workers** | Anti-bureaucracy. A coder runs git/tests/writes files. Done. |
| 32 hand-rolled agent definitions | **Vendor-copy from BMAD + wshobson + agent-os + SuperClaude + claude-flow + spec-kit** | Open-source has 12+ months of refinement. Stealing is faster + better than writing. |
| Bastion Mac as critical path | **Cloudflare + Routines + GitHub Actions = critical path. Mac is dev/observability only** | True 24/7 even if home power is out |
| 22 decisions across V1+V2+V3 | **8 sharp decisions D23-D30** | Most prior decisions either still apply or got resolved by Adam's V4 corrections |

---

## 1. The org chart (the actual company)

```
                          ADAM (Board)
                              │
                  texts/files via Linear
                              │
                              ▼
                ┌───────────────────────────┐
                │   CEO Agent                │  ← orchestration, routes work,
                │   (always Sonnet)          │     synthesizes weekly digest
                └─────────────┬─────────────┘
                              │ delegates
        ┌────────────┬────────┼────────┬────────────┐
        ▼            ▼        ▼        ▼            ▼
  ┌──────────┐ ┌─────────┐ ┌──────┐ ┌──────────┐ ┌──────────┐
  │   CTO    │ │ Product │ │ CMO  │ │ Business │ │   CCO    │
  │ (eng+infra)│Lead    │ │ Lead │ │   Lead   │ │ (Customer)│
  │  Sonnet  │ │ Sonnet  │ │Sonnet│ │  Sonnet  │ │  Sonnet  │
  └────┬─────┘ └────┬────┘ └──┬───┘ └────┬─────┘ └────┬─────┘
       │            │         │          │            │
       │ ENG TEAMS  │ PROD    │ MARKETING│ BUSINESS   │ CS TEAMS
       │            │ TEAMS   │ TEAMS    │ TEAMS      │
       ▼            ▼         ▼          ▼            ▼
  Workers       Workers   Workers   Workers      Workers

  CTO's reports:           Product Lead's:    CMO's:
  ├── Code Lead            ├── PM             ├── Content Lead
  ├── Design Lead          ├── UX Researcher  ├── SEO/GEO Lead
  ├── QA Lead              └── Analyst        └── Growth Lead
  ├── Security Lead
  ├── DevOps Lead          Business Lead's:   CCO's:
  ├── AI/ML Lead           ├── CFO            ├── Support Lead
  └── Data Lead            ├── Legal          ├── Onboarding Lead
                           └── Talent         └── Investor Relations
                           
                          QA TEAM is CROSS-FUNCTIONAL — sits beside CTO
                          but reports independently to CEO, can BLOCK any merge
```

**Five direct reports to CEO** = clean span of control.
**Each lead has 2-7 workers.** Total: ~35 role-based agents (matches Wave 1's recommendation to drop dead lineages and reorganize).

### Naming convention (locked)

- C-suite: `ceo`, `cto`, `cpo`, `cmo`, `cbo`, `cco` (chief X officer)
- Team leads: `code-lead`, `design-lead`, `qa-lead`, `security-lead`, `devops-lead`, `ai-lead`, `data-lead`, `pm`, `ux-researcher`, `analyst`, `cfo`, `legal-counsel`, `talent`, `content-lead`, `seo-geo-lead`, `growth-lead`, `support-lead`, `onboarding-lead`, `investor-relations`
- Workers: `backend-engineer`, `frontend-engineer`, `mobile-engineer`, `devops-engineer`, `ai-engineer`, `data-engineer`, `ml-engineer`, `security-engineer`, `qa-engineer`, `performance-engineer`, `product-designer`, `ux-designer`, `brand-designer`, `motion-designer`, `technical-writer`, `content-writer`, `copywriter`, `seo-specialist`, `geo-specialist`, `growth-marketer`, `paid-ads`, `email-specialist`, `social-specialist`, `customer-success`, `sdr`, `account-executive`, `support-engineer`, `onboarding-specialist`, `recruiter`, `finance-analyst`, `compliance-analyst`, `pricing-analyst`, `competitive-analyst`, `market-researcher`, `user-researcher`

**No "Marcus" / "Aria" / "Yossi" anywhere in the war room.** Those names are reserved for Beamix's customer-facing product personas.

---

## 2. The control plane (Linear is the company)

### Linear projects = company functions

| Linear Project | Maps to | Owner agent |
|----------------|---------|-------------|
| **Engineering** | All code work | CTO |
| **Product** | PRDs, specs, roadmap | Product Lead |
| **Marketing** | Content, SEO/GEO, campaigns | CMO |
| **Business** | Pricing, finance, legal, hiring | Business Lead |
| **Customer Success** | Support, onboarding, retention | CCO |
| **QA** | Cross-cutting quality work | QA Lead (independent) |
| **Strategy** | Initiatives, board meetings, signal scans | CEO |
| **Inbox** | Adam's voice notes + ad-hoc captures | CEO triage |

### How a task flows

**Pattern A — Adam files a Linear ticket:**
```
1. Adam types in Linear (mobile or desktop): "Build a public /scan/widget page"
2. Linear webhook fires → Cloudflare Worker (free tier, 24/7) verifies HMAC
3. Worker spawns Anthropic Routine with the ticket payload
4. Routine = CEO Agent. Reads the ticket, picks the team(s):
   - Engineering (build the page) + Design (visuals) + Product (spec)
5. CEO files sub-tickets in each team's project, assigns to that lead
6. CTO splits Engineering work into worker tasks: backend-engineer, frontend-engineer, qa-engineer
7. Workers execute IN PARALLEL via tmux farm of `claude -p --bare` on Bastion
   OR via parallel Anthropic Routines (cloud, no Mac needed)
8. Each worker completes → posts comment to its sub-ticket → marks DONE
9. Team lead reviews → posts summary to parent ticket
10. QA Lead picks up → runs risk-tiered review → PASS/BLOCK
11. CEO closes parent ticket, posts to Adam: "Done. Here's the PR. Approve to ship."
12. Adam taps "approve" in GitHub mobile → claude-code-action merges
```

**Pattern B — Adam DMs the CTO directly:**
```
1. Adam in Telegram: "@cto fix the bug in /api/onboarding/complete"
2. Telegram Bot Channel routes to CTO agent (skips CEO)
3. CTO assigns code-lead → backend-engineer → tests → PR
4. CTO posts PR link back via Telegram
5. Adam approves
```

**Pattern C — A worker proposes new work:**
```
1. Friday Retro Routine reads the week's session logs
2. Identifies: "the SEO Specialist found 3 keyword gaps not in BACKLOG"
3. Files Linear tickets in Marketing project as PROPOSED state
4. Adam sees them in Monday digest with RICE scores attached
5. Adam taps approve/reject
```

**Pattern D — Routine fires scheduled work:**
```
1. Sunday 06:00 — Competitor Signal Routine wakes
2. Scans Profound, AthenaHQ, official AI engine blogs
3. Files findings as Linear comments on Strategy/Signals project
4. Monday digest summarizes for Adam
```

**Pattern E — Cross-functional feature:**
```
1. Adam: "Ship a freemium top-up flow"
2. CEO recognizes cross-functional → spawns coordinated brief:
   - Product Lead: write spec
   - CTO: implementation plan
   - CMO: launch copy + email sequence
   - Business Lead: pricing review
   - CS Lead: support docs
3. Each team works in parallel, posts to shared parent ticket
4. CEO synthesizes → asks Adam for approval
5. CTO triggers ship; CMO triggers launch; CS Lead triggers comm to existing customers
```

---

## 3. The 24/7 architecture (no Mac in critical path)

```
┌──────────────────────────────────────────────────────────────┐
│                      ALWAYS-ON LAYER                          │
│  (runs even if Adam's Mac is off and home power is out)      │
│                                                                │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐ │
│  │   Linear    │───▶│ Cloudflare   │───▶│   Anthropic     │ │
│  │  webhooks   │    │  Workers     │    │   Routines      │ │
│  │  (Adam +    │    │  (FREE tier, │    │  (paid in Max,  │ │
│  │   agents)   │    │   HMAC verify│    │   $0.08/hr +    │ │
│  └─────────────┘    │   + route)   │    │   tokens)       │ │
│         ▲           └──────────────┘    └────────┬────────┘ │
│         │                                         │           │
│         │           ┌──────────────┐              │           │
│         │           │   GitHub     │◀─────────────┤           │
│         │           │  Actions     │   (PR review,│           │
│         │           │  (FREE tier  │    nightly QA,│          │
│         │           │   2k min/mo) │    /install-  │           │
│         │           └──────┬───────┘    github-app)│          │
│         │                  │                       │           │
│         │           ┌──────▼───────┐               │           │
│         │           │  GitHub repo │◀──────────────┘           │
│         │           │  (source of  │   (commits, PRs)         │
│         │           │   truth for  │                          │
│         │           │   code)      │                          │
│         │           └──────────────┘                          │
│         │                                                     │
│         └─────────── status comments back to Linear ──────────│
│                                                                │
│  ┌─────────────┐    ┌──────────────┐                         │
│  │  Supabase   │◀───│ All agents   │                         │
│  │  Postgres   │    │ write data   │                         │
│  │  + pgvector │    │ here for     │                         │
│  │  (existing) │    │ retention    │                         │
│  └─────────────┘    └──────────────┘                         │
│                                                                │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                  DEVELOPMENT LAYER (optional)                 │
│  (Adam's 8GB Mac when he wants to work directly)             │
│                                                                │
│  • Claude Code Remote Control daemon                          │
│  • tmux farm of `claude -p --bare` (faster than Routines for │
│    interactive work, free since you're paying Max anyway)    │
│  • Local Postgres mirror of Supabase (fast queries)          │
│  • disler-pattern observability dashboard                    │
│  • MCP servers (linear, github, supabase, custom)            │
│                                                                │
│  IF MAC IS OFF: 24/7 layer keeps running. No degradation.    │
│  IF ADAM IS DEV: Mac is faster + no per-call cost.           │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                       ADAM'S DEVICES                          │
│                                                                │
│  Phone:    Linear + Telegram + claude.ai mobile + GitHub mobile│
│  Mac:      Claude Code (when developing) + Linear web         │
│  Watch:    Telegram pings (binary-ping escalation only)       │
└──────────────────────────────────────────────────────────────┘
```

### The hard 24/7 rule

**The critical path is Cloudflare → Routine → GitHub → Linear comment.** All four are managed services. None require Adam's Mac. None require Adam's home internet. None require Adam to be awake.

The Mac is **acceleration**, not **availability**. Use it when developing live. The army runs without it.

### Cost (final)

| Component | $/mo |
|-----------|------|
| Anthropic API (after token-reduction wins) | included in your $100 Max |
| Cloudflare Workers + R2 + KV | $0 (free tier) |
| GitHub Actions | $0 (free 2000 min/mo) |
| Vercel | $0 (already paid for product) |
| Supabase | $0 (already paid for product) |
| Linear | $0 (free for solo) or $8 if you want Standard |
| Tailscale (Mac access if traveling) | $0 (3 devices free) |
| **Total NEW SPEND** | **$0-8/mo** |

V3 was $33/mo. V4 is **$0-8/mo** because we cut the Mac out of the critical path. **You can shut your laptop and the company keeps running.**

---

## 4. The work patterns (how the company gets things done)

### Pattern: "Build a feature" (Pattern E above, expanded)

The CEO recognizes cross-functional work and spawns a **Feature Build Squad**:

```yaml
squad: feature-build-{feature-slug}
linear_project: parent ticket in Engineering, sub-tickets in each team
members:
  - product-lead         # writes spec, owns acceptance criteria
  - cto                  # writes implementation plan
    - design-lead        # owns visual design + brand fit
      - product-designer # designs screens
      - brand-designer   # checks against brand guide
    - code-lead          # owns code quality
      - backend-engineer # writes API
      - frontend-engineer# writes UI
    - qa-lead            # owns quality gate (independent)
      - qa-engineer      # writes tests
      - security-engineer# audits if Full-tier (auth/billing/db)
  - cmo                  # if customer-visible: launch comms
  - business-lead        # if pricing-affecting: review
flow:
  1. CEO files parent ticket
  2. Each lead spawns workers in parallel
  3. Workers commit to one shared feat/{slug} branch in worktree
  4. QA Lead gates the merge
  5. CTO ships once QA PASS
  6. CMO ships launch comm
status_updates:
  - Each worker posts to its own sub-ticket
  - Each lead posts roll-up to parent
  - CEO posts daily summary to Adam
```

### Pattern: "Worker proposes new work" (autonomous initiative)

This is what Adam asked for — agents that **think on their own** and propose work.

```yaml
mechanism: Friday Retro Routine + Strategist
schedule: Friday 18:00 via Anthropic Routine
agent: strategist (Sonnet)
input:
  - all session files written this week
  - Linear tickets closed this week
  - any signal-scan findings
  - the ANTI-ROADMAP
output:
  - Linear tickets in PROPOSED state, scored with RICE
  - one summary comment in #ceo-digest with the top 5 proposals
adam_decision:
  - tap APPROVE → ticket enters BACKLOG, eligible for next sprint
  - tap REJECT → ticket goes to ARCHIVE with reason
  - no action in 7 days → auto-archived
guardrails:
  - max 10 proposals per Friday (anti-noise)
  - any proposal hitting ANTI-ROADMAP is auto-rejected with revisit condition
  - any proposal proposing changes to billing/auth/legal is escalated for explicit Adam review
```

### Pattern: "Routine fires standing work"

The 5-Routine heartbeat from V3 (kept):

| Routine | When | What |
|---------|------|------|
| Morning Digest | 07:30 | What happened overnight, what needs Adam, what to read first |
| EOD Sync | 20:00 | Append day's events to brain/log, detect abandoned worktrees, ping if action needed |
| Auto-Unblock | On-fire | Any BLOCKED ticket → 3 self-resolution attempts before escalating to Adam |
| Monday Standup | 08:00 Mon | Weekly fleet status: cost, dependencies, decisions-you'll-regret, ANTI-ROADMAP breaches |
| Friday Retro | 18:00 Fri | **Writes lessons back into agent .md files** = the compounding flywheel |

Plus 3 signal Routines (competitor, customer voice, GEO algorithm) feeding the Monday Standup.

### Pattern: "Adam DMs the CTO" (skip-CEO express lane)

Sometimes you don't want the CEO routing. You want to talk directly to a function head.

```yaml
trigger: Telegram or Linear @cto / @cmo / @cco / @business / @product
behavior:
  - Skips CEO routing
  - Lead immediately picks up
  - Lead may still call CEO for cross-functional questions but doesn't have to
  - Status flows back via the same channel
when_to_use:
  - You know exactly which team should own it
  - It's bounded scope (one team, one outcome)
  - You don't want CEO synthesis overhead
when_NOT_to_use:
  - Cross-functional ("ship a feature")
  - Strategic ("should we add a free tier")
  - Risky ("change the auth model")
```

---

## 5. The quality model

### Three lines of defense

1. **Worker self-check.** Every worker runs `tsc + eslint + tests` before completing. If any fail, the worker fixes (per existing deviation rules) OR returns BLOCKED.
2. **Team lead review.** Lead reads the worker's output for craft quality, brand fit, scope adherence. Lead can request rework (max 2 cycles) before escalating.
3. **QA Lead gate (independent).** QA Lead is the only path to merge. Risk-tiered:

| Tier | Trigger | Reviewers |
|------|---------|-----------|
| **Trivial** | ≤10 lines, no critical files | qa-engineer (Haiku) + tsc + eslint |
| **Lite** | ≤100 lines, no auth/billing/db/migrations | qa-engineer + semgrep + code review (Sonnet) |
| **Full** | >100 lines OR auth/billing/db/webhooks/migrations | qa-engineer + semgrep + code review + security-engineer (Opus) + adversary review (Opus, "principal-skeptic" prompt) |

### Stop-hook enforcement

`PreToolUse` on `Bash(git merge*)` checks: does this branch's session file contain `qa_verdict: PASS`? If not → block. **This makes QA real, not theater.**

### "Billion-dollar feel" enforcement (from your locked memory)

Design Lead has a hard checklist for any UI work:
- Spacing intentional (4px grid)
- Typography from approved scale
- Brand color usage matches `docs/BRAND_GUIDELINES.md`
- Motion respects reduced-motion media query
- Hebrew RTL works correctly
- Mobile responsive at 375 / 768 / 1280

A worker that fails any item gets returned. Three failures → escalate to Adam for review of the worker's prompt.

---

## 6. Memory & context (data integrity, no loss)

### The 6-layer memory stack (from V2 Report 13, kept)

| Layer | What | Where |
|-------|------|-------|
| L0 — Boot | Project conventions | `CLAUDE.md` ≤ 200 lines |
| L1 — Session | Active conversation | Claude Code session + auto `/compact` at 70% |
| L2 — Cross-session episodic | "What happened last time?" | **Anthropic Memory Tool** with provenance/confidence/expiry (V3 R1 hardening) |
| L3 — Project facts | PRD, decisions, MOCs | `docs/00-brain/` + indexed into Supabase pgvector |
| L4 — Skills/tools | Skill discovery | pgvector + `tool_search` MCP (replaces 42K-token MANIFEST.json) |
| L5 — Code knowledge | The codebase itself as RAG | pgvector index of `apps/web/src/**` for fast "where is this defined" queries |

### Source-of-truth contracts (no data loss)

| Data | Source of truth | Backup |
|------|-----------------|--------|
| Tasks + status | **Linear** | Weekly export to Supabase via Routine |
| Code | **GitHub** | GitHub does it (multiple replicas) |
| Customer data | **Supabase** | Supabase PITR (point-in-time recovery) |
| Agent memory | **Supabase pgvector** | Replicated to Mac via Tailscale (when Mac on) |
| Decision log | **`docs/.claude/memory/DECISIONS.md` in git** | git is the backup |
| Session files | **`docs/08-agents_work/sessions/` in git** | git is the backup |

**Rule:** Anything written by an agent must end up in a git-tracked file OR a Supabase row. **No agent-only-knows-this state.**

---

## 7. Open-source skill integration (steal aggressively)

You're right that writing all skills/prompts ourselves produces mediocre output. Here's the vendor map:

| Source project | Steal which | Map to which Beamix team |
|----------------|-------------|--------------------------|
| **wshobson/agents** (80+ specialized agents, 10K+ stars) | Worker prompts: `python-pro.md`, `frontend-developer.md`, `security-auditor.md`, `database-optimizer.md`, etc. | All worker definitions — replace ours with theirs, customize the project context |
| **github/spec-kit** (92K stars) | The constitution.md pattern; the spec → plan → tasks → implementation flow | Product Lead's PRD pipeline |
| **bmadcode/BMAD-METHOD** (46K stars) | Story-shape templates; Scrum Master agent prompt; Architect agent | Product + CTO + Engineering team's planning patterns |
| **buildermethods/agent-os** | The standards-extractor pattern (auto-derives ENGINEERING_PRINCIPLES.md from codebase) | DevOps Lead (keeps standards alive automatically) |
| **ruvnet/claude-flow** (43K stars) | SPARC patterns; swarm coordination prompts | Cross-team coordination |
| **SuperClaude_Framework** | Slash commands library | `.claude/commands/` directory — replace ours |
| **anthropics/claude-plugins-official** (Oct 2025) | Plugin packaging format + 80 official plugins | Repackage each Beamix team as installable plugin |
| **disler/claude-code-hooks-multi-agent-observability** | The Bun + SQLite + Vue dashboard | Observability layer on Bastion Mac |
| **claude-did-this/claude-hub** | Self-hosted Claude triggering pattern (alternative to Routines if needed) | Backup to Anthropic Routines |
| **anthropics/claude-cookbook** | The `tool_search` recipe; Memory Tool examples | L4 + L2 of memory stack |

### Vendoring rule

**Copy in, don't depend.** Pull the markdown files INTO our `.claude/` directory at a known git SHA. Add `VENDORED_FROM:` header noting source + commit + date. Never `npm install` an upstream package that could overwrite our customizations (the `gsa-startup-kit` mistake from V1).

### Naming conflicts

When two projects ship a `code-reviewer.md`, we pick the better one and add `# VENDORED_FROM: wshobson/agents@a1b2c3d` at the top. No silent dupes.

---

## 8. The autonomy model (agents that think on their own)

This is the hardest part of what you asked for. Three concrete mechanisms:

### Mechanism 1 — Standing Routines do scheduled thinking

The 5-Routine heartbeat + 3 signal Routines run on cron. Each thinks about its domain weekly without being asked. Output: Linear tickets in PROPOSED state.

### Mechanism 2 — Friday Retro writes back to agent .md files

The Strategist reads the week's outcomes and proposes specific edits to specific agent .md files (e.g., "the backend-engineer should add a check for Paddle webhook idempotency — they missed it twice this week"). PR opened automatically. Adam reviews Saturday morning. **Agents literally improve their own definitions over time.**

### Mechanism 3 — Worker-initiated tickets via "I noticed" patterns

Every worker, after completing a task, runs a 30-second "did I notice anything worth surfacing" reflection. Output: optional Linear ticket in PROPOSED state with `proposer: <agent-name>`. Examples:
- backend-engineer: "I noticed our migrations don't have rollback scripts — proposing we add them"
- content-writer: "I noticed the Hebrew copy doesn't use Israeli date format — proposing fix"
- qa-engineer: "I noticed test coverage on `/api/onboarding` is 12% — proposing test backfill"

Capped at 1 proposal per worker per day to prevent spam. ANTI-ROADMAP filter applies.

### The check on autonomy: Adam's Monday digest

Every Monday morning, Adam sees:
- N tickets proposed by agents this week
- N approved / N rejected last Monday
- The 5 most-proposed-by-agents themes (signal of where the army thinks the gaps are)
- The 3 highest-RICE proposals awaiting your call

You can approve all, reject all, or pick. **Adam stays the board. The army stays the staff.**

---

## 9. The wave plan (sequenced by dependency only — no dates)

Each wave depends on the prior. Each wave is "do this to do the next." Anything inside a wave can run in parallel.

### Wave A — Stop the bleeding

(All P0 fixes from V1)

- Kill 12 dead GSD execution agents (move to `_archive/`)
- sed `saas-platform/` → `apps/web/` across all `.agent/agents/*.md`
- Compact CLAUDE.md to ≤200 lines
- Vendor-fork (or pin) the upstream `gsa-startup-kit` package
- Run worktree cleanup (~28 GB recovery)
- Downgrade phantom MCP mandates

### Wave B — Make Claude Code see us

- `git mv .agent/agents .claude/agents`
- `git mv .agent/skills .claude/skills`
- Update CLAUDE.md path references
- Add `permissions:` block to `.claude/settings.json` (deny destructive, allow safe, ask risky)
- Wire OpenTelemetry → Grafana Cloud free tier
- Hard-route models per agent

### Wave C — Re-org to the V4 company

- Rewrite all agent .md files to role-based names per §1 (steal heavily from wshobson/agents per §7)
- Remove personality names (Marcus, Aria, Yossi) from war room — those stay in product land
- Define the 5 C-suite agents (CEO, CTO, CPO, CMO, CBO, CCO)
- Define team leads under each C-suite
- Define workers under each lead
- For each agent: model, tool grants (minimal), 2-3 vendored skills, structured return format

### Wave D — Linear-as-the-Company

- Create Linear projects per §2 (Engineering, Product, Marketing, Business, CS, QA, Strategy, Inbox)
- Stand up Cloudflare Worker (HMAC verify) → Anthropic Routine bridge
- Create the CEO Routine (the always-on entry point)
- Wire Telegram Channel + iMessage Channel plugins for ad-hoc text
- Drop `claude-code-action@v1` into `.github/workflows/`
- Run `claude /install-github-app` for PR review automation
- iOS Shortcut for voice → Linear ticket

### Wave E — The Heartbeat

- Stand up the 5 Routines (morning digest, EOD sync, auto-unblock, Monday standup, Friday retro)
- Stand up the 3 signal Routines (competitor, customer voice, GEO algorithm)
- Wire the Friday Retro to PR-edit agent .md files
- Wire the worker "I noticed" reflection step

### Wave F — The Quality + Risk Hardening

- Stop-hook on `Bash(git merge*)` enforcing `qa_verdict: PASS`
- Risk-tiered QA model (Trivial / Lite / Full)
- Memory Tool provenance + confidence + expiry (V3 R1)
- Prompt-injection webhook layer + XML wrapping (V3 R2)
- 3-tier kill switch + irreversibility taxonomy (V3 R3)
- Persona contracts (each agent's tool grants enforce its scope)
- Anthropic Console hard cap

### Wave G — The Flywheel

- Lock the Day-1 data layer (8 tables in Supabase, permanent retention)
- Spawn the 7 new agents per Visionary's bet 2 (CFO, Talent, Investor Relations, etc.)
- ANTI-ROADMAP fleet enforcement
- Stop-loss conditions on every initiative
- Standing teams (Feature Build Squad pattern, Strategy team, Growth team)
- Board Meeting Pattern as `/board-meeting [question]` slash command

### Wave H — Optional / scaling

- VPS Bastion failover when home Mac becomes SPOF (~50 customers)
- Move Postgres to Supabase as primary (~100 customers)
- Re-evaluate hosted overflow platforms (~500 customers)
- Plugin packaging per team for marketplace distribution
- Symphony-style Linear webhook with full lifecycle events

---

## 10. Decisions (D23-D30 — sharp and few)

The prior 22 decisions stand or got resolved by your V4 corrections. These are the V4-specific ones:

| # | Decision | Default |
|---|----------|---------|
| **D23** | Linear is THE control plane (not "an option")? | **YES — Linear is the company** |
| **D24** | Drop personality names (Marcus, Aria, Yossi) from the war room — keep them only as Beamix product personas? | **YES** |
| **D25** | The 24/7 architecture is Cloudflare + Routines + GitHub Actions (Mac out of critical path)? | **YES — $0-8/mo new spend** |
| **D26** | Adopt the C-suite + Lead + Worker org chart per §1 (5 reports under CEO)? | **YES** |
| **D27** | Vendor-copy from wshobson/agents + spec-kit + BMAD + agent-os + SuperClaude + claude-flow? | **YES — copy in at pinned SHAs, don't depend** |
| **D28** | Workers use TOOLS, never delegate to other workers (anti-bureaucracy rule)? | **YES — hard rule** |
| **D29** | Friday Retro PR-edits agent .md files automatically (the compounding flywheel)? | **YES** |
| **D30** | Worker "I noticed" proposal mechanism (1 per worker per day, Adam approves Monday)? | **YES** |

---

## 11. The ten-line summary (what to remember)

1. **Adam = board. Linear = company. Agents = staff.** Five C-suite reports. Workers under leads. Workers use tools, not workers.
2. **24/7 runs without your laptop:** Cloudflare → Routines → GitHub → Linear. Mac is dev acceleration only.
3. **Costs $0-8/mo new spend** because Anthropic Max is paid, Cloudflare/GitHub/Vercel/Supabase free tiers cover the rest.
4. **Role-based names everywhere** (CTO, AI Engineer, Product Designer). No personality names — those belong to the product.
5. **Steal aggressively** from wshobson/agents + spec-kit + BMAD + agent-os + SuperClaude. Vendor-copy at pinned SHAs.
6. **5 Routines + 3 signal Routines** = the heartbeat. ~$5-15/mo of API spend.
7. **Friday Retro PRs agent .md files** = the army gets smarter every week without Adam writing prompts.
8. **Workers propose new work** via "I noticed" reflections + ANTI-ROADMAP filter + Adam's Monday approval.
9. **QA Lead is the only path to merge.** Risk-tiered. Stop-hook enforces. No more theater.
10. **Day-1 data lock** (8 Supabase tables, permanent retention) is the moat. Don't ship MVP without it.

---

**End of V4. The company is defined. The control plane is Linear. The army runs 24/7 outside your laptop. The flywheel is the Friday Retro.**

**Ready when you are.**
