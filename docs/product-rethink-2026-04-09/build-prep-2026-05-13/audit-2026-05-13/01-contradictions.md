# Audit Lens — Contradictions & Drift

Audit date: 2026-05-13
Auditor: Audit subagent (lens = contradictions + drift only)
Scope: 11 build-prep files (`00-INDEX.md`..`11-START-HERE.md`) vs 5 source-of-truth specs in `docs/product-rethink-2026-04-09/`.

Build-prep folder = `docs/product-rethink-2026-04-09/build-prep-2026-05-13/`
Source-of-truth = parent `docs/product-rethink-2026-04-09/` (especially 05-BOARD-DECISIONS-2026-04-15, 07-AGENT-ROSTER-V2, 08-UX-ARCHITECTURE, 12-AGENT-BUILD-SPEC, 10-PRE-BUILD-AUDIT).

Rule applied (per 11-START-HERE.md §"If Something's Wrong"): when build-prep contradicts source-of-truth, source-of-truth wins. Findings below treat the build-prep as the side that must change unless explicitly noted.

---

## P0 (must fix before Wave 0)

### P0-A. Day-1 chain model contradicts the Board decision (auto-run vs auto-prime)
- **Source-of-truth:** `05-BOARD-DECISIONS-2026-04-15.md` lines 348–356 ("Day-1 Auto-Trigger Pipeline") explicitly says: step 4 = "First 2–3 highest-impact agents auto-run (~30–60s each)". User lands on dashboard already containing approved/run output within 5–10 min of payment.
- **Build-prep:** `03-DAY-1-FLOW.md` Step E ("prime_first_suggestions", lines 60–65) only marks the top suggestion as `ready_to_run` and the next two as `delayed_60s`. It surfaces *suggestions* — it does NOT auto-run any agent. The board doc's "highest-impact agents auto-run" requirement is silently dropped.
- **Impact:** Misses the entire dead-dashboard cure mechanic. P0-5 resolution is incomplete.
- **Fix:** Either (a) update `03-DAY-1-FLOW.md` to add a Step E.5 that auto-runs 2–3 agents, or (b) write a board-doc clarification recording the deliberate scope reduction. Don't ship as-is.

### P0-B. Day-1 chain missing the Query Review Gate
- **Source-of-truth:** `05-BOARD-DECISIONS-2026-04-15.md` lines 441–443 ("Query Review Gate (Day-1)" — Decisions Added 2026-04-18): "User reviews top-10 queries before downstream agents fire. Adds one user interaction to day-1 pipeline."
- **Build-prep:** `03-DAY-1-FLOW.md` Steps B → C → D → E run with zero user interaction between Query Mapper and scan/rules. There is no review screen for the 10 queries.
- **Impact:** Removes the only human checkpoint in the post-payment chain. The "/onboarding/post-payment" route is specced as pure polling with no review pause (line 75–94).
- **Fix:** Insert a Step B.5 that surfaces Query Mapper output for confirmation before scan_running. Update UI state machine in §UI states to include `QUERY_REVIEW` state.

### P0-C. LLM architecture inverted — OpenRouter primary vs Anthropic direct primary
- **Source-of-truth:** `05-BOARD-DECISIONS-2026-04-15.md` lines 453–456 (Decisions Added 2026-04-18): "Direct Anthropic SDK for Claude models (80% of calls). Cheaper + resilient. OpenRouter for Gemini/GPT/Perplexity (scan engines). New env: ANTHROPIC_API_KEY."
- **Build-prep:**
  - `12-AGENT-BUILD-SPEC.md` `MODEL_ROUTER` lines 338–350 uses `anthropic/claude-…` strings — i.e., OpenRouter model identifiers — for every Claude call.
  - `01-P0-RESOLUTIONS.md` T1 line 72: "If hit rate < 80% on long system prompts, fall back to direct Anthropic API" (treats Anthropic direct as fallback, not primary).
  - `07-WAVE-0-BRIEF.md` Worker 2 brief line 141: same framing.
  - `06-ADAM-CHECKLIST.md` line 65: "Anthropic: direct API key as fallback in case OpenRouter caching breaks".
- **Impact:** Reverses the board decision. Wrong gateway will route ~80% of calls and break the cost model.
- **Fix:** Update `12-AGENT-BUILD-SPEC.md` model router doc + Wave 0 Worker 2 brief to specify direct Anthropic SDK for `claude-*` models and OpenRouter for `google/gemini-*` + `openai/*` + `perplexity/*` only. Update Adam checklist phrasing so ANTHROPIC_API_KEY is primary, not fallback.

### P0-D. Annual pricing — build-prep ships monthly-only, board flipped to annual day-1
- **Source-of-truth:** `05-BOARD-DECISIONS-2026-04-15.md` lines 333–336 ("Decisions Added 2026-04-17 — Annual Pricing"): "Ship with annual pricing from day 1 (Discover $63/mo, Build $159/mo, Scale $399/mo annual)."
  - Note: this *reversed* `10-PRE-BUILD-AUDIT.md` B2 ("Monthly-only launch. … No annual pricing at launch").
- **Build-prep:** `11-START-HERE.md` line 12 ("Monthly-only at launch (annual deferred 60 days)"), `06-ADAM-CHECKLIST.md` line 110, and `09-WAVE-1-BRIEF.md` line 220 all hard-code monthly-only at launch. They follow the older audit B2, not the newer board minute. They also DO list Discover annual / Build annual / Scale annual Paddle products in `06-ADAM-CHECKLIST.md` lines 26–29 — inconsistent with their own "monthly-only" statements.
- **Impact:** Either no annual at launch (board decision violated) or annual at launch but Wave 1 brief tells frontend "annual deferred per B2" → broken paywall modal.
- **Fix:** Pick one. If annual ships day-1: remove "annual deferred per B2" from `09-WAVE-1-BRIEF.md` line 220, remove "Annual pricing rollout … deferred 60 days" from Adam checklist line 110, update `11-START-HERE.md` summary. If monthly-only: remove the 3 annual Paddle products from Adam checklist and override the board minute with an explicit superseding decision.

### P0-E. Annual pricing math contradicts itself between sources
- **Source-of-truth:** `05-BOARD-DECISIONS-2026-04-15.md` line 334 says annual = "Discover $63/mo, Build $159/mo, Scale $399/mo". `06-PRICING-V2.md` and the v1 board table (line 23) say Build annual = $151/mo.
- **Build-prep:** `06-ADAM-CHECKLIST.md` line 28 uses Build annual = $151/mo ($1,812). Matches the table, NOT the 2026-04-17 minute that quoted $159/mo.
- **Impact:** Either the minute's $159 is wrong or the table's $151 is wrong. Paddle price ID will encode the wrong value.
- **Fix:** Confirm Build annual price with Adam before Wave 0. Single source must be reconciled in `06-PRICING-V2.md` first, then propagated.

### P0-F. Security requirements not enumerated in any worker brief
- **Source-of-truth:** `05-BOARD-DECISIONS-2026-04-15.md` lines 463–464 (Decisions Added 2026-04-18 — "Security: 10 Requirements in All Worker Briefs"): SSRF validator, prompt injection sanitization, Cloudflare Turnstile, credit locking, webhook verification, RLS tests, npm audit, rehype-sanitize, rate limiting, cost circuit breaker.
- **Build-prep:** Zero of the 10 items appear in `07-WAVE-0-BRIEF.md`, `08-WAVE-0.5-BRIEF.md`, `09-WAVE-1-BRIEF.md`, or `10-WAVE-2-BRIEF.md`. RLS tests appear in `05-DB-MIGRATION-PLAN.md` §Staging Gate, but the other 9 items are nowhere.
- **Impact:** Board explicitly mandated these be in ALL worker briefs. Their absence violates a locked decision and creates 10 silent vulnerabilities.
- **Fix:** Add a "Security requirements (all workers)" section to each wave brief enumerating which of the 10 the worker owns: e.g., Wave 1 BE-2 owns SSRF validator (URL inputs), Paddle webhook verification, prompt injection sanitization, Turnstile (free scan), cost circuit breaker; Wave 1 BE-1 owns rate limiting + credit locking; Wave 0 Worker 1 owns RLS tests + npm audit; Wave 1 FE-1 owns rehype-sanitize.

### P0-G. `/onboarding/post-payment` flow contradicts UX Architecture
- **Source-of-truth:** `08-UX-ARCHITECTURE.md` §4 lines 217–221: "Post-payment onboarding (2 steps): Step 1 — Verify business profile (name, location, services — pre-filled from scan). Step 2 — Optional: connect GA4 / GSC. Redirect to /dashboard. 14-day money-back guarantee window starts on first dashboard visit."
- **Build-prep:** `03-DAY-1-FLOW.md` post-payment route is a polling progress page (no business-profile verification, no GA4/GSC step). Final redirect goes to `/home` not `/dashboard`. The UX-arch 2-step flow is gone entirely.
- **Impact:** UX arch + Day-1 flow describe two different post-payment experiences. Workers will build one and miss the other.
- **Fix:** Either combine (Day-1 chain runs in background, user simultaneously fills business-profile step) or pick one. Likely correct shape: Step 1 verify business profile (manual) → start Day-1 chain in background → polling progress → /home. Update `03-DAY-1-FLOW.md` Sequence + UI states accordingly.

### P0-H. notification_type DB enum has values that don't exist in the shared TS type
- **Source-of-truth (build-prep DB):** `05-DB-MIGRATION-PLAN.md` line 76–79: `notification_type AS ENUM ('item_ready','scan_complete','budget_75','budget_100','competitor_alert','suggestion_generated','day1_ready','run_failed')` — 8 values.
- **Source-of-truth (TS):** `12-AGENT-BUILD-SPEC.md` `NotificationItem.type` (line 263): 6 values — missing `'day1_ready'` and `'run_failed'`.
- **Build-prep:** `08-WAVE-0.5-BRIEF.md` re-exports `NotificationItem` from `agents/types` (line 39) and adds no override. Drift is preserved.
- **Impact:** Any code that inserts `day1_ready` or `run_failed` (Day-1 flow Step E line 64; Inbox failure card `04-EMPTY-STATES.md`) will fail TS strict mode against `agents/types.ts`.
- **Fix:** Update `12-AGENT-BUILD-SPEC.md` `NotificationItem.type` union to include both values; or have Wave 0.5 brief explicitly override the type and instruct Worker 2 to widen agents/types accordingly.

### P0-I. `inbox_status` enum has `'failed'` but `InboxItem.status` TS union doesn't
- **Source-of-truth (build-prep DB):** `05-DB-MIGRATION-PLAN.md` line 68–70: `inbox_status AS ENUM ('draft','review','approved','archived','rejected','failed')`.
- **Source-of-truth (TS):** `12-AGENT-BUILD-SPEC.md` line 229: `status: 'draft' | 'review' | 'approved' | 'archived' | 'rejected'` — no `'failed'`.
- **Build-prep:** `04-EMPTY-STATES.md` §Inbox failure card defines a failure-state card and `09-WAVE-1-BRIEF.md` lists "Failed" as a filter rail option. The TS type doesn't carry it.
- **Impact:** Frontend filter for "Failed" + failure-card variant won't typecheck.
- **Fix:** Add `'failed'` to `InboxItem.status` in `12-AGENT-BUILD-SPEC.md`. Wave 0.5 must re-export the widened type.

---

## P1 (should fix before Wave 1)

### P1-J. Resend templates: brief says "6" but lists 7
- `09-WAVE-1-BRIEF.md` line 107: "`apps/web/src/lib/notifications/templates/` — 6 templates" then enumerates 7: `welcome-onboarded, scan-complete, daily-digest, payment-failed, budget-75, budget-100, run-failed`.
- Fix: change "6 templates" → "7 templates", or drop one from the list. Reconciliation must also match notification_type enum (so `run_failed` actually has a delivery surface).

### P1-K. Inngest tier guidance contradicts board
- Board doc 2026-04-18 line 458: "Inngest Pro ($75/mo) — free tier breaks at 10-15 users."
- Build-prep `06-ADAM-CHECKLIST.md` line 77: "Inngest cloud project exists (per memory `project_inngest_tier_strategy.md`, start free tier)".
- Memory file says start free, migrate to Pro at ~5 paying customers; board says break at 10–15 users.
- Fix: align the two. Likely answer: start free, set a watch threshold (5 paying users) per the memory; mention the board's break-point so it's visible.

### P1-L. Free preview's "Content Optimizer teaser" missing entirely
- Board 2026-04-18 lines 437–439: "Free: FAQ Builder runs ($0.04), produces copy-pasteable FAQ + JSON-LD. Teaser: Content Optimizer shows first 3 sentences of homepage rewrite, rest blurred. Zero cost."
- Build-prep mentions only the FAQ Builder free run (`05-BOARD-DECISIONS-2026-04-15.md` para is repeated in build-prep `09-WAVE-1-BRIEF.md` line 218 + FE-3 brief). No Content Optimizer teaser anywhere in `09-WAVE-1-BRIEF.md`, scan UX flow, or empty states.
- Fix: add Content Optimizer 3-sentence teaser as a Wave 1 FE-2 deliverable (it belongs on the free-scan result page), reference the zero-cost prompt design.

### P1-M. PDF Report Export not in any wave brief
- Board 2026-04-18 lines 449–451: "Professional one-page PDF: score, competitors, action plan. Emailable to boss. React-pdf or puppeteer."
- Build-prep: nowhere. Wave 1 has no PDF generator; Wave 2 polish brief doesn't mention it either.
- Fix: assign to Wave 1 FE-3 (paywall-conversion territory) or Wave 2 Worker 4. Spec the API endpoint + the rendering library decision.

### P1-N. Guided Step-by-Step path not built
- Board 2026-04-18 lines 445–447: "Guided Step-by-Step Path — Home suggestions as numbered sequential steps with progress bar. Not unordered suggestion cards."
- Build-prep `09-WAVE-1-BRIEF.md` FE-1 brief line 131: "Top-3 suggestions list (fetches `GET /api/suggestions` — paginated, sorted by ranker)" + "`SuggestionCard`". Unordered card grid, no numbered progress bar.
- Fix: redesign Home suggestion block as a numbered 1-2-3 progress bar (per `02-AUTOMATION-RULES.md` §Day-1 special case → top-1 first, next 2 delayed — works as Step 1 / Step 2 / Step 3).

### P1-O. 3-phase enum migration vs single consolidated migration set
- Board 2026-04-18 line 460: "3-phase enum migration (not single file)" (referring to legacy plan_tier rename).
- Build-prep `05-DB-MIGRATION-PLAN.md` argues the hard reset eliminates the migration; ships one consolidated 12-file set on a new project.
- Reasoning is defensible (`05-DB-MIGRATION-PLAN.md` §Why not in-place), but the board-mandated 3-phase isn't acknowledged anywhere. The board minute was written assuming in-place migration; hard reset (2026-05-13) supersedes it.
- Fix: add a one-line note to `05-DB-MIGRATION-PLAN.md` referencing the board's 3-phase mandate and explaining the supersession (hard reset = clean schema, no in-place needed). Otherwise QA Lead will flag it.

### P1-P. `/api/health` env-var validation not specced
- Board 2026-04-18 line 459: "Health endpoint: /api/health validates all env vars".
- Build-prep `07-WAVE-0-BRIEF.md` Worker 3 line 184: `api/health/route.ts` listed but no spec of what it should do.
- Fix: add to Wave 0 Worker 3 brief: "implement /api/health that asserts every entry in `06-ADAM-CHECKLIST.md` env-var list is set; returns 503 with missing keys array if any are absent."

### P1-Q. Query Mapper has dedicated route in UX arch but not in build-prep
- `08-UX-ARCHITECTURE.md` §5 line 232: "Intelligence agents (Query Mapper, Competitor Tracker) — Populates Signals feed on Home; Query Mapper has dedicated route `/dashboard/queries`."
- Build-prep `07-WAVE-0-BRIEF.md` Worker 3 lines 170–183: route list explicitly omits `/queries` ("No `(protected)/dashboard/*` route" line 184 — actually says nothing about /queries either way). No worker owns this route.
- Fix: either add `/queries` route to Wave 0 routes + assign to Wave 1 FE-2 (sits next to /scans), or update UX arch to remove the route and inline Query Mapper output into /scans drilldown.

### P1-R. `/dashboard` vs `/home` URL inconsistency between UX-arch and build-prep
- UX arch uses `/dashboard` everywhere (§4 line 194, 220).
- Build-prep routes use `/home`. No `/dashboard` route exists.
- Build-prep wins (it's newer and more specific), but UX arch references will read wrong forever.
- Fix: leave routing as `/home` (sidebar nav says "Home"). Note the supersession in the build-prep index so reviewers know UX-arch's `/dashboard` mentions are stale.

### P1-S. `verificationStatus` value drift between InboxItem and ArchiveItem
- `12-AGENT-BUILD-SPEC.md` `InboxItem.verificationStatus`: `'none' | 'pending_probe' | 'verified' | 'unverified'` (4 values).
- `08-WAVE-0.5-BRIEF.md` `ArchiveItem.verificationStatus`: `'pending_probe' | 'verified' | 'unverified'` (3 values, missing `'none'`).
- Fix: align. ArchiveItem should inherit InboxItem's 4-value union or explicitly justify the narrowing.

### P1-T. `suggestion_status` enum has `'converted'`, Suggestion TS type doesn't
- `05-DB-MIGRATION-PLAN.md` line 72: `suggestion_status AS ENUM ('pending','running','dismissed','converted')`.
- `12-AGENT-BUILD-SPEC.md` `Suggestion.status` (line 254): `'pending' | 'running' | 'dismissed'` — no `'converted'`.
- Fix: add `'converted'` to the TS union. `02-AUTOMATION-RULES.md` mentions "suggestion → run" workflow which corresponds to the converted state.

### P1-U. `QueryIntelligenceData` referenced but never defined
- `12-AGENT-BUILD-SPEC.md` line 141: `queryIntelligence?: QueryIntelligenceData` on `AgentPipelineContext`. Type not defined anywhere in the file.
- Wave 0.5 shared-types brief doesn't add it either.
- Fix: define the interface in `12-AGENT-BUILD-SPEC.md` types section OR add to Wave 0.5 deliverables.

### P1-V. `CompetitorData` defined twice with potentially different shapes
- `02-AUTOMATION-RULES.md` line 28 RuleContext uses `CompetitorData` (shape implied: scan-derived per-engine).
- `12-AGENT-BUILD-SPEC.md` line 139 AgentPipelineContext uses `CompetitorData[]` but never defines it.
- `08-WAVE-0.5-BRIEF.md` lines 95–103 *does* define `CompetitorData` (with `appearanceRateByEngine`, `queriesWhereTheyWin`, etc.).
- Risk: Worker 1 backend imports a shape that doesn't match what the agent registry expects.
- Fix: Wave 0.5's definition becomes canonical. Add a cross-reference in `02-AUTOMATION-RULES.md` and `12-AGENT-BUILD-SPEC.md` so it's the single source.

### P1-W. Adam checklist Inngest blocking state ambiguous
- `06-ADAM-CHECKLIST.md` separates `[BLOCKING]` items (Supabase, Paddle) from non-blocking (Inngest, Resend, OpenRouter…). But `07-WAVE-0-BRIEF.md` Worker 2 requires OpenRouter and Perplexity keys to run. They are flagged non-blocking but are de-facto required by Wave 0.
- Fix: re-tag OpenRouter and Perplexity as `[BLOCKING]` for Wave 0 spawn, since Worker 2 can't progress without them. Anthropic key also needed (per P0-C reclassification as primary).

### P1-X. Wave 2 devops adds a migration after Wave 0 owns the schema
- `10-WAVE-2-BRIEF.md` line 107: "LLM cost logging: wire OpenRouter usage events to a `llm_cost_events` table (added via a final migration in this worker)."
- But Wave 0 Worker 1 owns "all SQL migration files for the fresh schema" (`07-WAVE-0-BRIEF.md` line 76).
- Fix: either pull the `llm_cost_events` table forward into Wave 0's migration set (cleaner — it's logged from Day 1), or explicitly call out the Wave-2 migration as a documented addition with a sequenced filename (e.g., `20260620_13_llm_cost_events.sql`).

---

## P2 (nice to fix, not blocking)

### P2-Y. Pricing typo in board doc — "$199" residual
- `05-BOARD-DECISIONS-2026-04-15.md` line 315: "Updated to $79/$199/$499" in the "Open Questions — Resolved" Q9 row. The 2026-04-18 minute (line 429) reduced Build to $189. Build-prep correctly uses $189 everywhere, but source-of-truth has a stale $199.
- Fix: not in build-prep's scope — flag to the doc owner to patch the board doc itself.

### P2-Z. Competitor tier count discrepancy in source-of-truth
- `10-PRE-BUILD-AUDIT.md` C3 line 69: "Discover gets full Competitors page with 3 tracked competitors. Build gets 5, Scale gets 20."
- `08-UX-ARCHITECTURE.md` §Competitors line 144: "Discover — full Competitors page with 3 tracked competitors. Build — up to 3 competitors, weekly refresh. Scale — unlimited, daily refresh."
- Build-prep follows UX arch (3/3/unlimited). Both are source-of-truth and disagree.
- Fix: not strictly build-prep's problem, but `04-EMPTY-STATES.md` template `{{tierLimit}}` will populate from feature gate code — the value must be picked.

### P2-AA. `availableOnTiers` in AutomationRule never used by the ranker
- `02-AUTOMATION-RULES.md` `AutomationRule` interface (line 17) includes `availableOnTiers: PlanTier[]`. Ranker (line 196) uses `tierAvailability` (1.0 or 0.0). Two rules (R13, R15) restrict to `['build', 'scale']`.
- Discover-tier modifier (line 207) says "Discover users see only 1 suggestion fully (rest blurred behind paywall). The ranker still scores all 15." Slight ambiguity: are R13/R15 hidden entirely on Discover, or visible but blurred? Operationally these conflict.
- Fix: clarify in `02-AUTOMATION-RULES.md` §Discover-tier modifier: tier-locked rules are dropped from the queue (not blurred), so a Discover user sees 1 of the 13 universal rules.

### P2-BB. R09 "competitor_alert" notification type already in enum — OK, but flow loops on itself
- R09 emits a `NotificationItem` of type `competitor_alert` AND a Suggestion chaining into Content Optimizer (lines 117–119).
- The chained Content Optimizer suggestion will be evaluated by R04 (Competitor Gap) on the same scan with overlapping data → potential duplicate suggestions.
- Fix: add a dedup clause in `evaluator.ts` requirement — if R09 fires for competitor X, suppress R04 for the same competitor X this evaluation cycle.

### P2-CC. Wave 1 brief instructs creating `apps/web/src/inngest/functions/scan-free.ts` AND `scan-manual.ts` in Backend Worker 1, but BE-2's brief also covers scan
- `09-WAVE-1-BRIEF.md` BE-1 lines 54–55: owns `scan-free.ts` + `scan-manual.ts`.
- BE-2 lines 78–82: owns `src/lib/scan/runner.ts` + per-engine adapters + `query-mapper-integration.ts` + `scoring.ts` (the actual scan logic).
- Inngest functions in BE-1 wrap BE-2's runner. This is fine if briefs explicitly state the seam — they don't.
- Fix: add one line in each: BE-1 owns the Inngest functions; BE-2 owns the scan runner library which BE-1 imports. Otherwise both workers may implement scan logic.

### P2-DD. `automation_kill_switch` table named ambiguously
- `05-DB-MIGRATION-PLAN.md` line 103: "`automation_kill_switch` (singleton or per-user)".
- Not decided. Per-agent + per-user kill switches both required by UX arch §7 (line 287–289).
- Fix: pick a shape. Likely correct: `automation_kill_switch (user_id, agent_type NULL = global)` rows. Specify in Wave 0 brief so Worker 1 doesn't guess.

### P2-EE. `agent_jobs` field set differs between docs
- `12-AGENT-BUILD-SPEC.md` doesn't define an `agent_jobs` row schema explicitly — types section covers `AgentJobInput` and `AgentJobOutput`, which are runtime shapes, not DB shapes.
- MEMORY file says `agent_jobs columns: id, agent_type, status, created_at, completed_at` (legacy schema).
- Build-prep `05-DB-MIGRATION-PLAN.md` line 101 lists `agent_jobs, agent_job_outputs, agent_costs` but doesn't specify columns.
- Fix: add a § to `12-AGENT-BUILD-SPEC.md` mapping `AgentJobInput`/`Output` → DB columns, OR have Worker 1 design the DB shape and Worker 2 follow it. Currently both workers will guess differently.

### P2-FF. `(protected)/dashboard/*` parenthetical contradicts route list
- `07-WAVE-0-BRIEF.md` line 184: "No `(protected)/dashboard/*` route." But the route list above shows `(protected)/home`, `(protected)/inbox`, etc., not `dashboard`. This negative is fine but confusing.
- Fix: rephrase to "Note: do not nest pages under `(protected)/dashboard/` — flat structure under `(protected)/<page>`."

---

## Verified consistent (sanity check)

These were specifically cross-checked and confirmed aligned across build-prep + source-of-truth:

1. **Pricing $79 / $189 / $499** — consistent across `06-ADAM-CHECKLIST.md`, `11-START-HERE.md`, `04-EMPTY-STATES.md` paywall references, `01-P0-RESOLUTIONS.md`. Matches board decision line 22 + 2026-04-18 minute.

2. **Trial model — 14-day money-back, no 7-day trial** — `01-P0-RESOLUTIONS.md` line 12–14, `11-START-HERE.md` line 12, `04-EMPTY-STATES.md` Settings tab. Matches board decision lines 36–39.

3. **Freshness Agent (not Content Refresher)** — `01-P0-RESOLUTIONS.md` line 16–17, `05-DB-MIGRATION-PLAN.md` enum line 52, `02-AUTOMATION-RULES.md` R01 trigger. Matches board canonical naming (line 53 + 391).

4. **11 agent count + identifiers** — `05-DB-MIGRATION-PLAN.md` agent_type enum (lines 48–60) lists exactly 11 agents matching `07-AGENT-ROSTER-V2.md` roster and `12-AGENT-BUILD-SPEC.md` AgentType union. No drift.

5. **Daily caps** — `02-AUTOMATION-RULES.md`, `05-DB-MIGRATION-PLAN.md`, and `12-AGENT-BUILD-SPEC.md` all carry Schema 20/20/20, FAQ 3/5/10, Off-Site 3/5/10, Perf Tracker unlimited. Matches `07-AGENT-ROSTER-V2.md` Cost Classification (line 255) and `10-PRE-BUILD-AUDIT.md` C5.

6. **Sidebar = 7 routes (no Agents)** — `07-WAVE-0-BRIEF.md` line 167–183 enumerates `home / inbox / scans / automation / archive / competitors / settings`. Matches `08-UX-ARCHITECTURE.md` §2 line 22–34.

7. **Tier credit allocations 25 / 90 / 250** — `03-DAY-1-FLOW.md` line 31, `09-WAVE-1-BRIEF.md` BE-2 line 89. Matches board line 95.

8. **Engine counts per tier (3 / 7 / 9+)** — `03-DAY-1-FLOW.md` line 52, `09-WAVE-1-BRIEF.md` BE-2 line 81 enumerates 7 for Build. Matches board line 110–113.

9. **Blog Strategist gated to Build+** — `02-AUTOMATION-RULES.md` R15 line 182 ("Tiers: Build, Scale"), `05-DB-MIGRATION-PLAN.md` agent registry. Matches board line 74 + C2.

10. **OpenRouter prohibition list (DeepSeek, Qwen)** — explicitly excluded in `12-AGENT-BUILD-SPEC.md` line 352 + `07-AGENT-ROSTER-V2.md` line 235. Build-prep doesn't re-allow them.

---

## Summary count

- **P0:** 9 findings (A–I)
- **P1:** 15 findings (J–X)
- **P2:** 8 findings (Y–FF)

Total: 32 distinct contradictions or drift items requiring action before launch.
