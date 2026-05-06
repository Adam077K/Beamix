# DECISIONS.md — Architecture & Strategy Log

*Updated by any agent making a decision that affects other agents or future work.*

---

## Format

```
### [YYYY-MM-DD] — [Title]
**Decision:** [What was decided]
**Rationale:** [Why — alternatives considered]
**Decided by:** [Agent]
**Affects:** [Which agents / files]
**Reversible?** [Yes / No / Hard]
```

---

## Log

### [DATE] — System Initialized
**Decision:** 12-agent autonomous startup team configured with 426+ skills from antigravity-awesome-skills
**Rationale:** Solo founder needs agents covering every startup role. Skills sourced from proven open-source repo.
**Decided by:** Iris
**Affects:** All agents
**Reversible?** Yes

---

### [2026-02-27] — GSD → GSA Rebrand
**Decision:** Renamed all identifiers from GSD to GSA across the codebase (commands, paths, file names, /gsa: slash commands, gsa-tools.cjs, ~/.gsa config dir, gsa/ branch templates).
**Rationale:** Align naming with GSA (Green Startup Academy) project identity. Exception: `subagent_type` in mcp_task calls remains `gsa-*` (e.g. gsa-planner, gsa-executor) because Cursor's mcp_task tool requires these exact enum values—changing them would break agent spawning.
**Decided by:** Atlas
**Affects:** .claude/commands/gsa/, gsa-tools.cjs, hooks, workflows, config defaults
**Reversible?** Yes (search/replace + file renames)

---

*Add new entries chronologically — newest at the bottom*

---

### [2026-03-06] — Supabase Auth (not Clerk)
**Decision:** Use Supabase Auth for all authentication flows.
**Rationale:** Supabase handles both auth and DB — fewer vendors. Clerk was in the GSA template but never used.
**Decided by:** Build Lead
**Affects:** All auth routes, middleware, user_profiles table
**Reversible?** Hard

---

### [2026-03-06] — Paddle Only (not Stripe)
**Decision:** Paddle is the sole payment provider. Stripe removed 2026-03-02.
**Rationale:** Merchant of record — simplifies VAT/EU compliance. Webhook: `src/app/api/paddle/webhooks/route.ts`
**Decided by:** CEO
**Affects:** Billing, subscriptions, webhooks
**Reversible?** Hard

---

### [2026-03-06] — Trial = 7 days, Free Scan Retention = 30 days
**Decision:** 7-day free trial starting from first dashboard visit. Free scan data visible for 30 days for all users (including non-paying). After 30 days, scan data expires. After trial, user must subscribe.
**Rationale:** Shorter trial creates urgency. 30-day retention gives users time to decide without pressure.
**Decided by:** CEO
**Affects:** subscriptions table, free_scans table, dashboard redirect logic
**Reversible?** Yes

---

### [2026-03-06] — Pricing (FINAL — do not change without CEO sign-off)
**Decision:** Starter $49/mo ($39 annual), Pro $149/mo ($119 annual), Business $349/mo ($279 annual)
**Rationale:** Validated against competitive pricing analysis.
**Decided by:** CEO
**Affects:** pricing page, Paddle products, plan_tier enum
**Reversible?** Hard

---

### [2026-03-06] — OpenRouter as LLM Gateway
**Decision:** All LLM calls route through OpenRouter (src/lib/openrouter.ts). No direct provider SDKs. Two keys: OPENROUTER_SCAN_KEY (scan engines) and OPENROUTER_AGENT_KEY (agent execution, QA, recommendations).
**Rationale:** Unified billing, per-key spend tracking, easy model switching.
**Decided by:** Build Lead
**Affects:** scan/engine-adapter.ts, agents/llm-runner.ts, agents/qa-gate.ts, recommendations.ts
**Reversible?** Yes

---

### [2026-03-06] — Credit RPC Pattern
**Decision:** hold_credits(p_user_id, p_amount, p_job_id) → confirm_credits(p_job_id) → release_credits(p_job_id). The job_id IS the hold reference.
**Rationale:** Simple atomic pattern. Defined in 20260308_002_billing.sql, fixed in 20260318_reconciliation.sql.
**Decided by:** Build Lead
**Affects:** credit-guard.ts, execute.ts, agent_jobs table
**Reversible?** Hard (DB function signatures)

---

### [2026-03-06] — No n8n, URL param scan_id
**Decision:** No n8n orchestration — direct LLM via OpenRouter. URL param is scan_id (not scan_token) everywhere.
**Decided by:** CEO
**Affects:** All scan URLs, DB columns, API params
**Reversible?** Yes (scan_id), Hard (no n8n)

---

### [2026-04-15] — Pricing v2: $79/$189/$499 (Discover/Build/Scale)
**Decision:** Replace $49/$149/$349 pricing. New tiers: Discover $79, Build $189, Scale $499. Annual: $63/$151/$399. Kill 7-day trial. Keep free one-time scan. 14-day money-back guarantee.
**Rationale:** $49 is below "real work" perception. Build at $189 stays under Yael's NIS 700 approval ceiling ($189 = NIS 680). Scale $499 anchors. Research-backed: agencies $1,500-$30,000.
**Decided by:** CEO + Business Lead (board meeting)
**Affects:** Paddle price IDs, pricing page, onboarding, all tier-gated features
**Reversible?** Yes (config change)

---

### [2026-04-15] — Agent Roster v2: 11 agents MVP-1, total rethink
**Decision:** Kill all 7 old agents. Ship 11 new GEO-research-backed agents. Add Video SEO (12th) in MVP-2. Renames: Content Refresher→Freshness Agent, Citation Builder→Off-Site Presence Builder.
**Rationale:** Old agents didn't address GEO research. 85% of AI mentions are off-site. New roster covers all proven GEO levers. Reddit Presence added (Perplexity 46.7%).
**Decided by:** CEO + Research Lead + AI Engineer (board meeting)
**Affects:** All agent code, prompts, credit system, dashboard UI
**Reversible?** Hard (full rewrite)

---

### [2026-04-15] — Proactive Automation Model (not Agent Hub)
**Decision:** Replace manual "Agent Hub" with proactive automation. Scans trigger rules engine → suggestions → user accepts → agents run (scheduled or event-triggered) → output in Inbox → user approves. "Agents" removed from sidebar nav.
**Rationale:** Adam's directive: "not just a case of the customer manually choosing to run an agent." Continuous process, not one-time fix. Higher tiers unlock schedule frequency.
**Decided by:** CEO + Product Lead (board meeting)
**Affects:** Dashboard UI, Inngest jobs, agent execution pipeline, sidebar nav
**Reversible?** Hard

---

### [2026-04-15] — LLM Models: Only Claude/Gemini/GPT/Perplexity
**Decision:** No DeepSeek, Qwen, or other providers. Agents use ONLY: Claude (Sonnet/Haiku/Opus), Gemini (Flash/Pro), GPT (4o/4o-mini/5-mini), Perplexity (Sonar/Pro/Online). All via OpenRouter.
**Rationale:** Adam's directive. Quality control + trust + vendor simplicity.
**Decided by:** CEO (founder directive)
**Affects:** All agent model configs in openrouter.ts
**Reversible?** Yes

---

### [2026-04-15] — YMYL Safety: Hard-refuse medical/legal/financial advice
**Decision:** Topic-risk classifier (Haiku) in Query Mapper. Hard-refuse: clinical diagnosis, legal advice, investment advice. Soft gate: general health/finance education. MVP excludes regulated IL professions.
**Rationale:** AI error rate 18-88% on YMYL. FTC + CA AI Transparency Act + EU AI Act.
**Decided by:** CEO + Research Lead
**Affects:** Query Mapper prompts, content agent QA gates
**Reversible?** Yes (expand cautiously)

---

### [2026-04-15] — Dashboard pages: 7-page restructure
**Decision:** Home · Inbox · Scans · Automation · Archive · Competitors · Settings. "Agents" removed from nav. Inbox = 3-pane Superhuman. Freshness Agent gets inline chat editor.
**Rationale:** Proactive model makes agents invisible. User sees suggestions + review queue + automation status. Agents are backend.
**Decided by:** CEO + Design Lead + Product Lead
**Affects:** All dashboard routes, sidebar, shell
**Reversible?** Hard

---

### [2026-04-17] — Content Output Policy: No AI Labels
**Decision:** Agent-generated content contains no AI disclosure markers. Content reads as human-written. User handles disclosure on their own site.
**Rationale:** Adam's directive. "Assisted not autopilot" means user is the author. EU AI Act Article 50 falls on publisher, not tool.
**Decided by:** CEO (founder directive)
**Affects:** All agent prompts, Blog Strategist output, content export
**Reversible?** Yes

---

### [2026-04-17] — Day-1 Auto-Trigger Pipeline
**Decision:** Paddle payment webhook triggers Inngest chain: Query Mapper → paid scan → rules engine → first 2-3 agents auto-run. No empty dashboard on day 1.
**Rationale:** UX audit found "dead dashboard" problem — user pays and sees empty pages. Auto-trigger ensures populated dashboard within 5-10 minutes.
**Decided by:** CEO + UX Lead
**Affects:** Paddle webhook handler, Inngest functions, Home page loading states
**Reversible?** Yes

---

### [2026-04-17] — Assisted vs Autopilot Validated
**Decision:** "Assisted not autopilot" confirmed as correct positioning. 93-97% of marketers review AI content before publishing (Ahrefs, HubSpot). Optional auto-approve for Scale tier post-MVP.
**Rationale:** Research validation. Zero sources recommend full autopilot for SMBs.
**Decided by:** CEO + Research Lead
**Affects:** Product positioning, all agent interaction models
**Reversible?** Yes (can add autopilot mode later)

---

### [2026-04-17] — $19 Top-Up Pack + Annual Pricing at Launch
**Decision:** Ship $19/10 AI Runs top-up pack at launch. Ship annual pricing from day 1 (20% discount).
**Rationale:** Top-up prevents mid-month churn. Annual per Adam's preference despite Business Lead recommending 60-day delay.
**Decided by:** CEO
**Affects:** Paddle products, pricing page, billing UI
**Reversible?** Yes

---

### [2026-04-17] — Sonar Citation Verification in QA Pipeline
**Decision:** Add Perplexity Sonar verification step to catch hallucinated citations. $0.02/run extra.
**Rationale:** Haiku QA misses ~25% of hallucinated sources. Sonar cross-checks cited URLs/stats against live web.
**Decided by:** CEO + Research Lead
**Affects:** Agent QA pipeline, cost model (+$0.02/run)
**Reversible?** Yes

---

### [2026-04-17] — Email Domain: notify.beamix.tech
**Decision:** Transactional email via notify.beamix.tech (Resend). Cold outreach on separate subdomain. Main domain beamix.tech for website only.
**Rationale:** Protect transactional deliverability from cold email reputation damage.
**Decided by:** CEO
**Affects:** DNS config, Resend setup, EMAIL_FROM_ADDRESS env var
**Reversible?** Yes

---

### [2026-05-05] — War Room Rethink: 4-Wave Plan, Awaiting Sign-off
**Decision:** Execute a 4-wave rebuild of the agent infrastructure based on synthesis of 7 parallel audit + research streams. Wave 0 fixes 7 P0 bugs. Wave 1 moves `.agent/` → `.claude/`, adds permissions block, OTEL telemetry, hard model routing, risk-tiered QA. Wave 2 wires Linear → Claude via Routine + Vercel Edge bridge. Wave 3 adopts plugin bundling, vector memory MCP, Agent Teams. Full plan: `docs/08-agents_work/2026-05-05-war-room-rethink/00-SYNTHESIS.md`.
**Rationale:** Today's setup (a) silently breaks (workers point at archived saas-platform/ path, 12 GSD execution agents reference missing binary), (b) leaks 32 GB across 72 worktrees, (c) costs ~$0.14/session before any work via 42K-token MANIFEST.json read, (d) treats QA as theater (0 invocations across 29 sessions despite shipping Paddle webhooks), (e) misses the entire Anthropic May-2026 production stack (Plugins, Agent Teams, Routines, OTEL, headless `claude -p`, GitHub Action), and (f) is coupled to upstream `gsa-startup-kit` npm package that could overwrite our customizations.
**Decided by:** CEO (synthesis of 3 internal auditors + 4 external researchers, all sourced)
**Affects:** All agents, all skills, settings.json, hooks, memory files, worktree hygiene, future Linear/GitHub integration
**Reversible?** Wave 0 + Wave 1 yes (git revert). Wave 2 + 3 architectural — partial reversal only.

---

### [2026-05-05] — QA Gate Now Hard-Enforced Via Stop-Hook
**Decision:** QA gate transitions from documented-but-ignored to enforced. A Stop-hook will block any `git merge` when the branch's session file lacks `qa_verdict: PASS`.
**Rationale:** Across 29 sessions to date, qa-lead was invoked **zero times**. We shipped Paddle webhook + HMAC + 17 API routes with no security audit. This is not sustainable.
**Decided by:** CEO (rethink synthesis P0-3)
**Affects:** All build leads, all merges, `.claude/settings.json` hooks block
**Reversible?** Yes (remove the hook), but will not be reversed without explicit Adam sign-off.

---

### [2026-05-05] — Wave 2 Synthesis: Autonomous Army Blueprint (V2)
**Decision:** 6-stream Wave 2 research produces the full autonomous-army blueprint. Net effect: shift from "build the army" to "wire into Anthropic's native stack + add a few thin pieces." Plan file: `docs/08-agents_work/2026-05-05-war-room-rethink/00-V2-SYNTHESIS.md`. Adds Waves 2-4 on top of V1's Wave 0-1.
**Rationale:** Anthropic shipped Remote Control (Feb), Channels for Telegram/iMessage (Mar), Routines for cloud-headless (Apr), Memory Tool, context editing, tool_search, isolation:worktree, plugins, output styles between Oct 2025 and Apr 2026 — most of what solo founders were building custom is now native. Three picks at $295/mo for hosted overflow. Memory: don't rent Letta/Mem0/Zep — Anthropic Memory Tool + Supabase pgvector is enough. Architecture: dissolve leads for Medium tasks (CEO is a glorified router), keep QA Lead independent, add async-spec-trust mode for remote control. Board Meeting Pattern from Report 10 = cheap multi-persona strategic debate at ~$0.50/meeting.
**Decided by:** CEO (synthesis of architecture critique + 5 external researchers, all sourced)
**Affects:** Memory architecture (replace flat markdown with Memory Tool + pgvector), agent layer (dissolve leads for non-QA), worktree method (`isolation: worktree`), remote-control surfaces (Anthropic native), hosted overflow ($295/mo), Symphony-style Linear-as-control-plane
**Reversible?** Wave 2 yes. Wave 3 architectural changes (dissolve leads, async-spec-trust) partial reversal only.

---

### [2026-05-05] — Memory Architecture: Anthropic Memory Tool + Supabase pgvector (NOT third-party)
**Decision:** Adopt Anthropic Memory Tool (`memory_20250818`, beta) for cross-session episodic memory. Use Supabase pgvector (already in stack) for L3 project facts and L4 skills/tools. Decline Letta, Mem0 ($249/mo Pro), Zep, Cognee, OpenAI Memory.
**Rationale:** Anthropic Memory Tool is file-based `/memories`, ZDR-eligible, replaces ad-hoc LONG-TERM.md writes. pgvector on Supabase = zero new vendor. Mem0 Pro at $249/mo rents capabilities Anthropic now ships. Defer Graphiti (temporal supersession) until contradiction-management is measured pain post-50 customers.
**Decided by:** CEO (Wave 2 synthesis, Report 13)
**Affects:** `.claude/memory/` workflow, all CEO post-session memory updates, skill discovery (replaces 42K-token MANIFEST.json with embedding search)
**Reversible?** Yes (revert to flat markdown)

---

### [2026-05-05] — Remote Control Stack: Anthropic Native (4 surfaces, $0/mo delta)
**Decision:** Adopt all 4 official Anthropic surfaces as the canonical remote-control stack: Claude Code Remote Control (daemon on always-on Mac mini, steered from claude.ai/code or mobile app), Claude Code Channels (Telegram + iMessage plugins), Claude Code Routines (cloud cron jobs), Linear Mobile + GitHub Mobile + 50-line iOS Shortcut for voice idea-capture.
**Rationale:** All shipped Feb-Apr 2026 by Anthropic. Total cost delta: $0/mo (everything in existing Pro/Max). Replaces every Q4-2025 OSS bot wrapper (claude-code-telegram, agent-reachout, custom Vercel dashboards) — those are now legacy. Solves the three Adam-tests: in-the-car, asleep, in-meeting-approve-PR.
**Decided by:** CEO (Wave 2 synthesis, Report 11)
**Affects:** Daily Adam workflow, Linear setup, iOS Shortcuts, Mac mini daemon configuration
**Reversible?** Yes

---

### [2026-05-05] — Hosted Cloud Overflow: Phased Adoption (Routines first, $100/mo)
**Decision:** Phase 1 — Claude Code Routines only (~$100/mo Max 5x tier) for headless-coding-while-sleeping. Phase 2 — add Cursor Background Agents ($60-120/mo) when fleet pattern proves out. Phase 3 — add Inngest AgentKit + E2B sandboxes ($100/mo) for hybrid-durable execution. Total at full adoption: ~$295/mo.
**Rationale:** Don't pay for capacity until needed. Routines is on stack already (Pro/Max). Cursor Background Agents is the canonical dashboard for 5-10 parallel cloud agents. Inngest already in Beamix stack — AgentKit composes naturally. Skip Devin (overkill at our scale), Manus (acquisition uncertainty), Bolt/Lovable (no persistence), Replit (forks stack), v0 (frontend-only), AutoGen Studio (Microsoft maintenance mode).
**Decided by:** CEO (Wave 2 synthesis, Report 09)
**Affects:** Cloud agent budget, multi-agent orchestration, parallel-execution scaling
**Reversible?** Yes

---

### [2026-05-06] — V4 Corporate OS: Linear-as-Company, 24/7 Outside Laptop
**Decision:** V4 supersedes V3 with Adam's clarifying corrections. Drops Adam-OS (personal life — not what Adam wants). Drops dates/timelines (sequence by dependency only). Role-based agent names ONLY (CTO, AI Engineer, Product Designer) — NO personality names (Marcus/Aria/Yossi belong to the product, not the war room). Linear IS the canonical interface (not "an option"). Workers use TOOLS, never delegate to other workers (anti-bureaucracy hard rule). 24/7 architecture runs outside Adam's laptop entirely (Cloudflare Workers + Anthropic Routines + GitHub Actions = critical path; Mac is dev acceleration only). New spend: **$0-8/mo** (down from V3's $33). Vendor-copy aggressively from open-source: wshobson/agents (workers), spec-kit (constitution + spec flow), BMAD-METHOD (story templates), agent-os (standards extractor), SuperClaude (slash commands), claude-flow (orchestration), anthropics/claude-plugins-official (packaging). Org chart: Adam → CEO → 5 C-suite (CTO, CPO, CMO, CBO, CCO) + independent QA Lead → team leads → workers. Plan: `docs/08-agents_work/2026-05-05-war-room-rethink/00-V4-CORPORATE-OS.md`. New decisions D23-D30.
**Rationale:** Adam clarified the V3 vision: he wants the AI company that RUNS Beamix, not personal-life automation. He wants Linear as the company OS — file projects, get sub-tickets, agents pick up, status flows back. He wants 24/7 even when his laptop is off. He wants role-based generic agent names. He wants workers that use tools (not endless delegation chains). He wants to text the CTO directly (skip CEO express lane) for bounded scope. He wants agents that propose work autonomously (Friday Retro + worker "I noticed" reflections). He wants quality enforced by team leads + QA gate. He wants to steal proven prompts from open-source projects rather than write everything custom.
**Decided by:** CEO (V4 synthesis after Adam's correction)
**Affects:** All agent definitions (rewrite to role-based names), Linear setup (becomes canonical), Cloudflare Workers + Routines wiring, GitHub Actions, vendoring strategy from 6 OSS projects, the Bastion Mac becomes optional acceleration not critical path
**Reversible?** Mostly yes. Personality names removal: hard but worth it (clarity > attachment). 24/7 architecture: yes (just turn off the Routines).
**Decision:** V3 supersedes V2's economics. Adopt the Architect's $33/mo Bastion stack (8GB home Mac running Postgres+pgvector + Redis + Remote Control daemon + tmux farm of `claude -p --bare` = poor man's Devin) instead of V2's $295/mo cloud-overflow plan. Spawn 7 new "complete-company" agents by Day 30 (Customer Success, Sales, Brand Voice Guardian, CFO, Chief of Staff, Talent, Investor Update). Lock Day-1 data layer (8 tables, permanent retention) before MVP launches. Ship 5-Routine heartbeat ($5-15/mo). Implement Strategy Machinery (stop-loss + ANTI-ROADMAP fleet enforcement + 3 signal Routines). Risk-harden R1-R3 (Memory poisoning, prompt injection, cost runaway) BEFORE Wave 3. Adopt Adam-OS (energy-adaptive army via HealthKit, voice-erosion guardrail). Internal positioning reframe: "Bloomberg Terminal of AI Search funded by SMB subscription" (5 compounding datasets, uncatchable in 18 months). External messaging unchanged. Plan: `docs/08-agents_work/2026-05-05-war-room-rethink/00-V3-VISION.md`. New decisions D15-D22.
**Rationale:** Visionary identified that current army is "throughput infrastructure, not flywheel" — every action dies, zero data accrues. Architect proved the $295/mo V2 plan was 9× over-budget — same capability fits in $33/mo with 8GB home Mac as Bastion. Chief of Staff identified missing "fleet heartbeat" (5 Routines) as the single biggest operating gap. Strategist identified missing "strategy machinery" (currently a backlog, not a strategy engine). Personal Systems identified Adam-as-human is unsupported (army builds product, nothing builds Adam). Risk Modeler identified 3 existential threats that block safe Wave 2 ship.
**Decided by:** CEO (V3 board meeting synthesis: 6 specialized personas — Visionary, CoS, Strategist, Architect, Personal Systems, Risk Modeler)
**Affects:** All Wave 2-5 plans, hardware (8GB home Mac as Bastion), agent roster (+7), data schema (8 new tables), iOS Shortcut + HealthKit integration, existing $100/mo Claude Max budget (unchanged), new spend cap ($33/mo)
**Reversible?** Bastion stack: yes (move to cloud overflow). Day-1 data layer: hard (cannot recover lost retention). Company-as-org: yes (kill agents). Adam-OS: yes (behavioral).

---

### [2026-05-05] — Architecture: Dissolve Leads for Medium Tasks + Async-Spec-Trust Mode
**Decision:** Keep CEO as orchestrator, keep QA Lead as independent gate. Other 8 leads become **roles inside briefs** for Medium tasks rather than always-spawned agents (with a 5-turn task-scoped coordinator). Add **async-spec-trust mode** to CEO: when triggered from Linear/Slack/Telegram with a structured spec, skip the question-loop and act on the spec directly.
**Rationale:** Architecture critique found CEO is a glorified router (10 management steps before dispatch); leads add 2 overhead steps for non-QA work. The synchronous question-loop is incompatible with remote/async control (Adam answers in 6 hours, not 6 seconds). QA Lead retains independence because that IS its value, not hierarchy.
**Decided by:** CEO (Wave 2 synthesis, Report 08)
**Affects:** ceo.md execution_flow, all lead .md files (downgrade to brief-roles), all worker dispatches (CEO can spawn workers directly with role-typed briefs)
**Reversible?** Partial — re-spawning all leads as agents possible but loses async-control benefit

---

### [2026-05-05] — Risk-Tiered QA (Cloudflare Pattern)
**Decision:** QA Lead routes diffs through three tiers: **Trivial** (≤10 lines, no critical files → 1 reviewer Haiku), **Lite** (≤100 lines → 3 reviewers: tsc + semgrep + Sonnet), **Full** (>100 lines OR auth/billing/migrations/webhooks → 7 reviewers including Opus security-engineer + Opus adversary-engineer "Aria" + judge pass).
**Rationale:** Cloudflare runs this exact stack at $0.98/median review across 48,095 MRs with 0.6% break-glass. Anthropic Code Review reports <1% false-positive. Beamix today over-reviews trivial CSS and under-reviews critical paths.
**Decided by:** CEO + Research Lead (synthesis of QA + economics research)
**Affects:** qa-lead.md, security-engineer.md, code-reviewer.md, new adversary-engineer agent
**Reversible?** Yes (config-only)
