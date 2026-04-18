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

### [2026-04-15] — Pricing v2: $79/$199/$499 (Discover/Build/Scale)
**Decision:** Replace $49/$149/$349 pricing. New tiers: Discover $79, Build $199, Scale $499. Annual: $63/$159/$399. Kill 7-day trial. Keep free one-time scan. 14-day money-back guarantee.
**Rationale:** $49 is below "real work" perception. Build at $199 stays under Yael's $200 self-approval ceiling. Scale $499 anchors. Research-backed: agencies $1,500-$30,000.
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
