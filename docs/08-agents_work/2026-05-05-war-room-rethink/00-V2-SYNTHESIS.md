# Beamix War Room — V2 Synthesis: The Autonomous Army Blueprint
**Date:** 2026-05-05 · **Author:** CEO (synthesis of Wave 2: 6 parallel agents) · **Status:** Builds on V1 SYNTHESIS

---

## The headline shift

**Wave 1 was tactical** — bug fixes, cost cuts, Linear MVP. **Wave 2 is strategic** — what does the actual autonomous-army look like, run from anywhere, scaled to a real company.

The single most important finding across 6 streams: **Anthropic shipped the entire stack between October 2025 and April 2026**. Solo founders were duct-taping Telegram bots, Vercel dashboards, custom memory layers, observability bridges. Most of that is now **native**: Remote Control (Feb), Channels for Telegram/iMessage (Mar), Routines for cloud-headless (Apr 14), Memory Tool (beta), context editing, tool_search cookbook, isolation:worktree flag, output styles, plugins, GitHub Action, Slack integration, OTEL export.

**Beamix's job is no longer to build the army. It's to wire into what's already shipped, plus add the few pieces that aren't.**

The other shock from this wave: the OpenAI Frontier team runs an internal product at **0% human-written code, 1M+ LOC, ~1B tokens/day, ~$2-3K/day spend**, with **Symphony (open-sourced Dec 2025) turning Linear into the control plane**. This is not aspirational. This is what works in production right now at frontier labs.

Reports this synthesizes: `08-internal-logic-layers-worktree-philosophy.md` · `09-hosted-cloud-agentic-platforms.md` · `10-autonomous-org-frameworks.md` · `11-solo-founder-remote-control-surfaces.md` · `12-ai-native-companies-internal-practices.md` · `13-memory-context-token-economy.md`

---

## 1. The verdict on our current architecture (Report 08)

> *"Partially correct in one dimension (filesystem isolation for parallel LLM work) and wrong in three others (hierarchy modeled on human org charts rather than information-flow graphs, worktree lifecycle unmanaged at scale, quality caught at the most expensive possible moment). Not broken enough to rebuild; miscalibrated enough to keep burning money and shipping bugs."*

The five architectural changes that matter most:

1. **Dissolve the lead layer for non-QA tasks.** CEO → Lead → Workers adds 2 overhead steps before any code is written. For Medium tasks, collapse leads into a lightweight task-scoped coordinator with a 5-turn budget. Keep QA Lead independent — its value IS independence, not hierarchy.
2. **Adopt Anthropic's `isolation: worktree` flag** in agent frontmatter. Worktrees auto-create and auto-destroy. Eliminates the 32 GB accumulation problem in one move.
3. **Physically enforced pre-merge evidence gate.** Stop-hook + semgrep zero-Critical + QA-Lead PASS. (Carries forward V1's P0-3.)
4. **Correct the model gradient.** Researcher to Sonnet (currently Opus for commodity retrieval). Test-engineer/code-reviewer P3/technical-writer to Haiku. AI-engineer to Opus (currently undersized).
5. **Async-spec-trust mode for the CEO.** The current "ask questions until zero ambiguity" loop is synchronous and blocking — incompatible with managing the fleet from Linear/Slack/phone. Trust a well-formed spec, skip the loop.

**Verdict on the 3-layer hierarchy:** keep the shape, dissolve the formality. CEO stays as orchestrator. QA Lead stays as independent gate. The other 8 leads become **roles inside briefs**, not always-spawned agents. Workers stay as today.

**Verdict on the worktree method:** keep worktrees, switch to native `isolation: worktree`, add a daily cleanup hook. Don't move to containers (Sculptor pattern) — adds Docker complexity without payoff at our scale.

---

## 2. The remote-control stack (Report 11) — the unlock

This is the most actionable finding of Wave 2.

**The canonical 2026 stack for solo founders converges on four official Anthropic surfaces. Total cost delta: $0/month** (everything already in Pro/Max).

| Surface | What it does | When Adam uses it |
|---------|--------------|-------------------|
| **Claude Code Remote Control** (Feb 2026) | `claude remote-control --spawn worktree` on a daemon machine; steer from claude.ai/code or iOS/Android Claude app | Same session, any device. Resume work from phone. |
| **Claude Code Channels** — Telegram + iMessage plugins (Mar 2026) | `/plugin install telegram@claude-plugins-official` | Dictate from CarPlay, Claude responds, CarPlay reads it aloud. iMessage Channel = zero new services. |
| **Claude Code Routines** (Apr 14, 2026) | Cloud-headless agents on cron, $0.08/runtime hr + tokens | 07:30 morning digest, overnight QA, weekly competitor scan |
| **Linear Mobile + GitHub Mobile + 50-line iOS Shortcut** | Voice-in-the-shower idea capture; one-tap PR approval | Siri → Anthropic API → Linear ticket → next-day agent picks up |

**The three Adam-tests, each solved with the canonical stack:**

1. **"In the car for 3 hours"** — iMessage Channel + CarPlay. Adam dictates "Have research-lead do a competitor scan on Profound's pricing changes." CarPlay reads the response. Agent executes via the cloud Routine. Output lands in Linear.
2. **"Asleep"** — Routines run overnight. Permission-relay sends a single Telegram ping ONLY when an agent needs Adam's decision; iOS Focus mode batches non-critical until morning.
3. **"In a meeting, approve a PR"** — GitHub Mobile + claude-code-action's auto-summary. One-tap approve.

**Hard skip list:** custom Vercel agent dashboards (built then abandoned per surveyed indie founders), 3D agent canvases, Pushover/ntfy.sh layers (Claude's mobile push handles it), Twilio+Realtime SIP (CarPlay solves the same), Cursor mobile (doesn't exist).

---

## 3. The autonomous-org architecture (Report 10) — handle with care

The space has three architectural camps with **directly opposed advice from credible voices**:

- **Cognition (Devin, $73M ARR, $25B valuation talks):** *"Don't build multi-agents — single coherent context wins."*
- **Anthropic:** *"Multi-agent works (90.2% over single-agent Opus 4) but burns 15× more tokens. 80% of perf variance is from token usage."*
- **CrewAI (claimed 60% of F500):** *"Only gradual autonomy — every output through human review, then loosen per-branch as accuracy proves out — survives 2 billion executions."*

**The reconciled pattern for Beamix:**

1. **Anthropic orchestrator-worker as the spine** — we already have it. Keep it. Add explicit task specs to every spawn. Apply scaling rules: 1 agent for fact-finding, 10+ only for genuinely complex multi-stream research.
2. **Cognition's "share full traces, not summaries" rule for tight pairs** — apply to lead↔worker handoffs to avoid the documented context-fragmentation failure. Cheapest, highest-ROI rule change.
3. **CrewAI gradual-autonomy operational discipline** — every new agent action class starts at human-in-the-loop. Demote to human-on-the-loop only after measured accuracy hits a threshold.

### The Board Meeting Pattern (worked example for Beamix)

This is what Adam asked for — agents that think on their own, debate, return a recommendation:

**Setup:** 5 personas (Marcus + Aria + Yossi + Business Lead + Research Lead) get a strategic question. Example: *"Should Beamix add a free tier under Discover $79?"*

**Round 1 — independent draft.** Each persona writes their position in parallel, **without cross-talk**, to prevent anchoring bias. Each writes to a separate file.

**Round 2 — full-trace debate.** Each reads all 5 Round-1 drafts, then writes a rebuttal/refinement. (Cognition's "share full traces, not summaries" rule applies — they read each other's actual reasoning, not summaries.)

**Synthesis.** A separate fresh-context Synthesis Agent (Sonnet, no participation in debate) reads all 10 documents and produces a 3-bullet consensus → lands in Adam's Inbox card.

**Hard caps:** 2 rounds maximum (kills ping-pong loops architecturally). Per-meeting token budget: 50K. Cost: ~$0.15-0.50 per meeting. Adam time: 3 minutes to read the consensus.

**Worked example outcome (free-tier question):** unanimous "don't add free tier; reframe to free-scan→$79 conversion." Adam approves with one tap from Linear mobile.

### The Team Pattern (durable agent groups)

**Example: Growth Team** — growth-lead + content-writer + SEO-analyst + designer. Runs week-to-week. Has its own Linear project, its own shared memory file, its own weekly standup Routine. Adam reads weekly summary every Monday morning.

The same pattern produces a **Strategy Team** (research-lead + business-lead + competitive-analyst), an **Engineering Team** (build-lead + workers + qa-lead), an **Ops Team** (data-lead + devops-lead + security-engineer).

---

## 4. The hosted cloud layer (Report 09) — three picks at $295/mo

For when Adam needs agents to work without his laptop:

| Pick | Tool | Cost | Use case |
|------|------|------|----------|
| **1 — Headless coding while sleeping** | **Claude Code Routines** (Anthropic-hosted) | ~$100/mo (Max 5x) | Overnight QA, morning digest, scheduled competitor scans, autonomous research. Zero new lock-in (already on stack). |
| **2 — Fleet dashboard for 5-10 parallel agents** | **Cursor Background Agents** | $60-120/mo | Adam fires 8 parallel agents on different Beamix branches. New TypeScript SDK (Apr 29 2026) for programmatic orchestration. |
| **3 — Hybrid local + durable cloud overflow** | **Inngest AgentKit + E2B sandboxes** | ~$100/mo | Inngest already on Beamix stack. AgentKit maps CEO→Lead→Worker onto durable steps with E2B sandboxes for execution. |

**Total at Beamix scale: $120 (Pick 1 only) → $295/mo (all three combined).** Inside the $300-500 solo-founder benchmark.

**Anti-recommendations:** Devin (overkill at our scale), Manus (Meta acquisition uncertainty), Bolt.new (no persistence), Lovable (deferred per memory), Replit Agent (forks the stack), v0 (frontend-only), CrewAI Enterprise (overpriced for solo), AutoGen Studio (Microsoft maintenance mode), Sweep AI (refocused).

---

## 5. The memory architecture (Report 13) — native-first, no third-party rental

**Don't rent Letta, Mem0, Zep, or Cognee. Anthropic ships natively now.**

Six-layer memory stack for Beamix:

| Layer | What | Where | Status |
|-------|------|-------|--------|
| **L0 — Boot** | Project conventions, stack, rules | `CLAUDE.md` ≤ 200 lines (current 266 overflows the cap and fragments cache) | **FIX NOW** |
| **L1 — Session** | Active conversation context | Claude Code session + `/compact` at >70% | Native |
| **L2 — Cross-session episodic** | "What happened last time?" | **Anthropic Memory Tool** (`memory_20250818`, beta) — file-based `/memories`, ZDR-eligible | **ADOPT** — replaces ad-hoc LONG-TERM.md writes |
| **L3 — Project facts** | PRD, decisions, MOCs | `docs/00-brain/` MOC files indexed into **pgvector on Supabase** (already in stack — zero new vendor) | **WIRE UP** |
| **L4 — Skills/tools** | Skill discovery | pgvector + Anthropic's `tool_search` cookbook with `all-MiniLM-L6-v2` (local, $0 inference) | **WIRE UP** — kills the $0.14/session MANIFEST.json burn |
| **L5 — Temporal supersession** | Decisions that override prior decisions (e.g., $49→$79 pricing) | **Defer Graphiti** until contradiction-management is measured pain (post-50 customers) | Defer |

**Why this stack:** Mem0 Pro is $249/mo for what Supabase pgvector covers natively. Letta and Cognee are great products but rent capabilities Anthropic now ships. Stay native, control evolution.

### Top 5 token-reduction wins (from Report 13, projected $200-500/mo savings)

| # | Win | $ saved/mo | Effort |
|---|-----|------------|--------|
| 1 | **Fix prompt caching on system prompt** — cache reads cost 0.1× input | $50-200 | 1-2 hrs |
| 2 | **MANIFEST.json → pgvector skill_search** — 42K tokens → ~200 tokens per session | ~$120 | 1 day |
| 3 | **Batch API for non-urgent work** — 50% off, stacks with caching | $30+ | 2 hrs/workflow |
| 4 | **Adopt Memory Tool + context editing** — cuts tool-result accumulation | $60-210 | half-day |
| 5 | **Model gradient discipline (Haiku for triage)** | $30-50 | 2 hrs |

**Combined: 55-75% input-token reduction, $200-500/mo savings.**

---

## 6. The benchmarks — what AI-native companies achieve (Report 12)

The five most credible benchmarks Beamix should aim for:

| # | Benchmark | Source | What it means for Beamix |
|---|-----------|--------|--------------------------|
| **1** | **Anthropic's 27%** of Claude-assisted work that *"would not have been done otherwise"* | Anthropic 2025-08 | This is the real KPI. Agents expand surface area, not just speed. Track work-that-would-not-exist as a metric. |
| **2** | **Block: 95% engineer adoption + 69% AI-authored code in 3 months** via AGENTS.md per repo + Champions program | Block engineering blog 2026-01 | Adam = solo, but the AGENTS.md-per-package pattern translates: one per `apps/web`, one per `packages/*` |
| **3** | **Cursor Bugbot: 52% → 80% resolution rate** via live PR-signal-driven rule learning | Cursor blog 2026-04 | Beamix recommendation accept/reject signals can train the same loop |
| **4** | **Vercel: removed 80% of agent tools → 3.5× faster, 100% success (vs 80%), 37% fewer tokens** | Vercel blog 2025-12 | **Tool minimalism beats scaffolding.** Audit our 32 agent tool grants — most are over-broad. |
| **5** | **Cognition Devin: 67% PR merge rate, 14× faster on migrations, ⅓ of internal commits** | Cognition annual review 2025-12 | The model for "agent-driven engineering at small-team scale" |

**Bonus signal directly relevant to Beamix:** Anthropic's multi-agent research paper documents that **agents preferred SEO-bait content over authoritative sources** — proving the GEO ranking gap is real even at frontier-lab quality. This is exactly what Beamix sells.

**The OpenAI Frontier benchmark (extreme):** 0% human-written code, 1M+ LOC, ~1B tokens/day, ~$2-3K/day, Symphony orchestrator open-sourced Dec 2025 with **Linear as the control plane**. Per-engineer PR throughput went from 3.5/day to 5-10/day.

---

## 7. The combined cost picture

**Today (Wave 0 baseline, no instrumentation but estimated):**
- ~$200-400/mo Claude API (no caching discipline, Opus where Sonnet would do, MANIFEST.json burn)
- $0/mo for remote control (because there is no remote control)
- $0/mo for hosted overflow (because there is none)
- 32 GB worktree leak (no $ but slows everything down)
- **Real cost:** ~$300/mo + every session blocked when Adam isn't at terminal

**After V2 plan (full):**
- ~$80-150/mo Claude API (after the 5 token-reduction wins land — 55-75% reduction)
- $0/mo for remote control (canonical native stack — already paid for in Max plan)
- $295/mo for hosted overflow (Routines + Cursor Background + Inngest+E2B)
- $25/mo Supabase pgvector additions (already on stack)
- **Real cost:** ~$400-470/mo for **24/7 fleet, fully remote-controllable, with 8x parallel cloud agents**

The $$ doesn't go down — it shifts. We pay roughly the same and get **an actual autonomous company** instead of a single-laptop terminal session.

---

## 8. The revised wave plan (V2 supersedes V1's Wave 2-3)

Wave 0 from V1 stands (P0 fixes). V1's Wave 1 stands. Below is what changes for Waves 2 & 3:

### Wave 2 — Remote control + cloud overflow (revised)

| Step | What | Source |
|------|------|--------|
| W2.1 | Wire Claude Code Remote Control daemon on Adam's Mac mini (or always-on machine) | Report 11 |
| W2.2 | Install Telegram + iMessage Channel plugins (`/plugin install telegram@claude-plugins-official`, `iMessage@claude-plugins-official`) | Report 11 |
| W2.3 | Stand up first 3 Routines: morning digest (07:30), overnight QA, weekly competitor scan | Report 09 + 11 |
| W2.4 | iOS Shortcut: voice → Anthropic Messages API → Linear ticket | Report 11 |
| W2.5 | `claude-code-action@v1` in `.github/workflows/claude.yml` + `/install-github-app` | Wave 1 carryover |
| W2.6 | Linear → Routine bridge: 30-line Vercel Edge function with HMAC verify | Wave 1 carryover |

### Wave 3 — The autonomous patterns (revised)

| Step | What | Source |
|------|------|--------|
| W3.1 | **Async-spec-trust mode** for CEO — when triggered from Linear/Slack/Telegram with structured spec, skip the question loop | Report 08 |
| W3.2 | **Dissolve leads layer** for Medium tasks — implement task-scoped coordinator pattern with 5-turn budget | Report 08 |
| W3.3 | **Wire Anthropic Memory Tool** — replace ad-hoc LONG-TERM.md writes with `/memories` | Report 13 |
| W3.4 | **MANIFEST.json → pgvector** — embed all 350 (post-purge) skills, replace discovery dance | Report 13 |
| W3.5 | **Adopt `isolation: worktree`** in all agent frontmatter; deprecate manual worktree dance | Report 08 |
| W3.6 | **Audit tool grants** — apply Vercel "remove 80% of tools" rule; tool-search MCP for the rest | Report 12 |
| W3.7 | **Stand up Cursor Background Agents** for 8x parallel cloud work | Report 09 |
| W3.8 | **Deploy Inngest AgentKit + E2B** for durable-step CEO→Lead→Worker pattern | Report 09 |

### Wave 4 — The autonomous-org patterns (new)

| Step | What | Source |
|------|------|--------|
| W4.1 | Implement **Board Meeting Pattern** — 5 personas, 2 rounds, fresh-context synthesizer | Report 10 |
| W4.2 | Stand up first **durable Team** — Growth Team (growth-lead + content-writer + SEO-analyst + designer) running weekly cycles | Report 10 |
| W4.3 | Apply **gradual-autonomy discipline** — every new action class starts HITL, demotes to HOTL when accuracy threshold hit | Report 10 |
| W4.4 | **Symphony-style Linear control plane** — file Linear ticket → Beamix orchestrator routes → reports back as comments | Report 12 (OpenAI pattern) |
| W4.5 | (Optional) **Multi-agent observability dashboard** (disler pattern, hooks → Bun + SQLite + Vue) | Wave 1 carryover |

---

## 9. New decisions for Adam (D8-D14, builds on V1's D1-D7)

| # | Decision | Default if no input |
|---|----------|---------------------|
| **D8** | The remote-control stack — adopt all 4 (Remote Control + Channels + Routines + Linear/GH Mobile) at $0/mo? | **YES** |
| **D9** | The hosted cloud overflow at $295/mo (Routines + Cursor Background + Inngest+E2B) — adopt all 3, only Routines, or skip? | **Routines only first** ($100/mo), add others if needed |
| **D10** | Memory architecture — adopt Anthropic Memory Tool + Supabase pgvector (no third-party rental)? | **YES** |
| **D11** | Architecture restructure — dissolve leads for Medium tasks + add async-spec-trust mode? | **YES** (necessary for remote control) |
| **D12** | The Board Meeting Pattern — implement as a new `/board-meeting [question]` slash command? | **YES** (cheap, high-leverage) |
| **D13** | Gradual-autonomy enforcement — every new agent action class starts HITL by default? | **YES** (safety + Crowley pattern) |
| **D14** | Symphony-style Linear-as-control-plane (V2's biggest bet) — wire Linear so it IS the dashboard, not just an inbox? | **YES** but staged (W4.4 after W2/W3 prove out) |

---

## 10. The headline numbers (memorize these)

- **AI-native benchmark to aim for (year 1):** 27% of work agents enable that wouldn't exist otherwise (Anthropic's KPI), 50%+ AI-authored code (Block hit 69% in 3 months)
- **Token reduction available right now:** 55-75% via 5 wins, $200-500/mo recurring savings
- **Remote-control adoption cost:** $0/month (all native to Pro/Max)
- **Hosted overflow cost:** $100-295/month (1 to 3 cloud-overflow tools)
- **Realistic year-1 spend for the full autonomous-army setup:** $400-470/month
- **Industry benchmark for solo-founder agent spend:** $300-500/month (Wave 1 case-study research)
- **The big "don't":** rent Letta, Mem0, Zep, Cognee, Devin, custom dashboards. Native is winning, native is enough.

---

## 11. Out of scope (intentional gaps for Adam to redirect)

- **Voice phone calls** (Twilio + Realtime API) — flagged as overrated; Adam can override if "set calls" meant literal AI phone calls
- **Multi-agent debate beyond board-meetings** — research-only for now (cost/benefit unclear in production)
- **Self-modifying agents (Voyager skill growth)** — defer until Wave 5; not yet production-validated for code work
- **Replacing Inngest** with Trigger.dev — neutral; Beamix has Inngest commitment, no reason to switch
- **Self-hosting OpenHands** — Anthropic-native is cheaper and better-supported at our scale
- **Building a custom 3D agent canvas** — every solo founder surveyed built one and abandoned it

---

## What this changes about V1

- **Wave 1 Memory architecture** (V1 P4) — supersede with **Anthropic Memory Tool** (Report 13) — file-based `/memories` is better than ad-hoc markdown
- **Wave 1 worktree handling** (V1 P0/P1) — supersede with **`isolation: worktree`** flag (Report 08) — auto-lifecycle beats our manual cleanup
- **Wave 1 QA tiering** (V1 P1.5) — keep as is, but add **the gradual-autonomy discipline** (Report 10) layered on top
- **Wave 1 Linear MVP** (V1 P2) — keep as is, position as the **first step toward Symphony-style Linear-as-control-plane** (Report 12)
- **Wave 1 cost projection** (V1 ~40-70%) — refined with Report 13's specific numbers (55-75% input-token reduction, $200-500/mo savings)

---

**End of V2 synthesis. D8-D14 are the new decisions on top of D1-D7. Ready for Adam sign-off.**
