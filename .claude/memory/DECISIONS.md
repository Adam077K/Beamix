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

### [2026-04-27] — Inngest tier: Free at MVP, Pro at ~5 paying customers
**Decision:** MVP launches on Inngest free tier (50K steps/month, shorter wall-clock timeouts). Migrate to Pro ($150/mo) when paying customers ≥ 5 OR monthly steps usage hits 75-80% of free-tier ceiling, whichever comes first.
**Rationale:** Cost discipline at pre-revenue stage. Free tier sufficient for first ~100 customers. Pro tier headroom isn't worth paying for until there's revenue to cover it. Revises board synthesis row 13 which had assumed Pro from day 1.
**Decided by:** Adam (CEO)
**Affects:** Tier 0 setup, agent runtime architecture (must fit free-tier wall-clock), DevOps migration runbook, cost model. Some agents (Long-form Authority Builder, Citation Predictor — both deferred past MVP) may need Pro tier on arrival; re-validate which MVP agents fit free-tier limits.
**Reversible?** Yes (upgrade is one-click; downgrade is hard if usage exceeds tier).

---

### [2026-04-28] — Board meeting: 23 product/design/architecture decisions locked
**Decision:** Adam confirmed all board decisions from the 9-seat / 3-round board meeting documented in `docs/08-agents_work/2026-04-27-BOARD-MEETING-SYNTHESIS.md`. The synthesis doc is the canonical record; this entry captures the consolidated lock. The 23 confirmed decisions:

**Strategic (rows 1-15):**
1. Monthly Update permalink default = **PRIVATE** with explicit "Generate share link." Forwarding via PDF email attachment. Hybrid-redaction model rejected.
2. /crew layout = **Stripe-style table.** Yearbook DNA preserved as ceremonial state only (empty/first-load + per-agent profile pages).
3. White-label digest signature = **Both, tier-gated.** Discover/Build = "Beamix" non-removable. Scale = agency-primary with "Powered by Beamix" footer in Geist Mono 9pt at `--color-ink-4`. Cream paper survives white-labeling.
4. Voice canon = **Model B.** Agents named in product (`/home`, `/crew`, `/workspace`). "Beamix" on all external surfaces (emails, PDFs, permalinks, OG cards). Onboarding seal "— your crew" → "— Beamix."
5. Workspace tier-gating = **All tiers** (including Discover).
6. Marketplace install = **Build+ only.** Discover sees catalog read-only with upgrade CTA.
7. Workflow Builder access = **Scale-only** to build/edit. Build can install pre-built workflows.
8. Truth File schema = **Shared base + vertical-extensions** (Zod discriminatedUnion keyed by vertical_id, per-vertical schema versioning). Single Postgres row + JSONB.
9. "Full-auto" semantics = **Conservative.** Even on Full-auto, validator's `uncertain` outcome routes to /inbox.
10. Pre-publication validator binding = **Cryptographic signed-token** (60s TTL, draft-hash bound). First-party agents in same sandbox as future third-party.
11. L2 site-integration = **Manual paste + Git-mode (GitHub PR) at MVP.** WordPress plugin parallel-builds, ships MVP-1.5.
12. Real-time channel = **Supabase Realtime broadcast**, one channel per customer (`agent:runs:{customer_id}`), polling fallback at 10s.
13. Inngest contract = Free tier at MVP; Pro at ~5 paying customers (already locked above).
14. Day 1-6 silence cadence = **4 emails** plain-text Beamix register (D0+10min welcome / D2 first-finding / D4 review-debt nudge / D5 pre-Monday teaser). Skip Saturday/Sunday. Suppress if customer logged in that day.
15. /security public page = **Ship at MVP.** Stripe-style 6-min security doc covering storage region, retention, DSAR flow, encryption, audit logs, no-training-on-customer-content DPA clause, sub-processors.

**Critical corrections (rows 16-21):**
16. White-label config is **PER-CLIENT**, not per-account. Lives inside multi-client switcher.
17. Bulk-approve in /inbox at MVP (within single client). Cross-client bulk = MVP-1.5.
18. Vertical-aware UI from Step 1 (kill plumber DNA in SaaS). SaaS = UTM-first Step 2; e-comm = Twilio-first.
19. Truth File nightly integrity-hash job. Sev-1 alert + auto-pause-all-agents on >50% field loss in 24h.
20. Scale-tier DPA includes mutual indemnification: Beamix indemnifies for content errors that pass pre-pub validation, capped lesser of (3× monthly subscription) or ($25K/incident).
21. Workflow Builder dry-run = real LLM execution with `dry_run: true` flag. No mock-site sandbox needed.

**Tensions resolved (rows 22-23):**
22. Workflow Builder MVP scope = **Hybrid.** Day 1: full React Flow DAG editor + dry-run + 3-6 templates + manual/scheduled triggers + Brief grounding per node. Deferred to MVP-1.5: event triggers (`competitor.published`), workflow PUBLISHING to marketplace.
23. Workflow PUBLISHING = **Defer to MVP-1.5.** Cross-tenant Truth File binding ships and gets 4 weeks of telemetry first. Marketplace at MVP = browse + install Beamix-curated workflows + install counts visible.

**Decided by:** Adam (CEO) confirmed all 23 decisions on 2026-04-28 after the 9-seat board meeting (4 + 3 + 2 agents in 3 rounds).
**Affects:** PRD-wedge-launch (10 features changed), 6 design specs, MARKETPLACE-spec (rewards section removed), DESIGN-SYSTEM (token clarifications), AUDIT-CONSOLIDATED (mark BLOCKERS #1, 2, 3, 4, 16, 17, 18, 19 as resolved), Tier 0 build sprint (19 person-days plumbing).
**Reversible?** Hard. These shape every customer-facing surface and the build plan. Reversal requires re-running board.
