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
