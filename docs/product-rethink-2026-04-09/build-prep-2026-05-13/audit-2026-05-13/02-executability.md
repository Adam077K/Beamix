# Audit Lens — Build Executability

Auditor lens: can a CEO agent execute these 4 wave briefs without ambiguity, missing deliverables, or unresolvable handoffs?

Scope: `07-WAVE-0-BRIEF.md`, `08-WAVE-0.5-BRIEF.md`, `09-WAVE-1-BRIEF.md`, `10-WAVE-2-BRIEF.md`, cross-checked against `11-EXECUTION-PLAN.md`, `CLAUDE.md` (Layer Contract, worktree protocol, QA gate), `AGENTS.md`.

---

## P0 (briefs are unexecutable without fix)

### P0-1 — Wave 0 Worker 2 imports types that do not yet exist (chicken-and-egg)
Wave 0 Worker 2 (ai-engineer) builds `apps/web/src/lib/agents/types.ts` and is told to "match" `database.types.ts`. But Wave 0 Worker 2 starts in parallel with Worker 1's DB migration. The brief in `07-WAVE-0-BRIEF.md` line 119 says Worker 2 is "Blocked by: Worker 1 (needs database.types.ts)" — fine — but then the merge-order section says Worker 2 and Worker 3 merge after Worker 1, in either order. There is no instruction telling the CEO whether Worker 2 should be **spawned in parallel and paused**, **spawned only after Worker 1 merges**, or **spawned with a stub types.ts and rebased later**. CEO will pick one of three different things on different runs. **Fix:** state explicitly "Worker 2 spawns only after Worker 1's `database.types.ts` is generated and committed to its branch; CEO instructs Worker 2 to base its worktree off `feat/db-foundation`."

### P0-2 — Wave 0.5 re-exports types that Wave 0 Worker 2 may never have defined
`08-WAVE-0.5-BRIEF.md` line 39 requires re-exporting `PlanTier`, `AgentType`, `PipelineStage`, `CreditCost`, `AgentConfig`, `AgentJobInput`, `AgentJobOutput`, `AgentPipelineContext`, `BusinessContext`, `ScanResult`, `EngineResult`, `QueryPosition`, `InboxItem`, `Suggestion`, `NotificationItem`, `DailyCapStatus`, `QAResult`, `CostEntry`, `GEOSignalChecklist` from `src/lib/agents/types.ts`. Wave 0 Worker 2's brief only points at "every interface from `12-AGENT-BUILD-SPEC.md` §TypeScript Types" without explicitly listing which interfaces. If `12-AGENT-BUILD-SPEC.md` doesn't define **all 19 above** (notably `InboxItem`, `Suggestion`, `NotificationItem`, `EngineResult`, `QueryPosition`, `GEOSignalChecklist` are domain-wide, not agent-system-internal), Wave 0.5 will fail typecheck on missing re-exports. **Fix:** the Wave 0 Worker 2 brief must enumerate the 19 interfaces explicitly and tell it to author every type — not just agent-internal ones.

### P0-3 — Wave 1 Backend Worker 3 owns a file that Wave 0 Worker 2 already created
Wave 1 BE Worker 3 brief (line 110): "`apps/web/src/lib/agents/credits/daily-cap.ts` is from Wave 0 — Backend Worker 3 wires it into the agent_pipeline middleware (read pre-run, increment post-DO step)." But Wave 0 Worker 2's brief (line 134) lists `apps/web/src/lib/agents/credits/{guard,daily-cap}.ts` as Worker 2's deliverable, AND tells Worker 2: "Do NOT touch frontend code or DB schema. Stay inside `apps/web/src/lib/agents/`." Wave 1 BE Worker 3 is then asked to modify this file — which lives in Wave 0 Worker 2's owned directory — and to wire it into the pipeline runner that Wave 0 Worker 2 also owns (`pipeline/runner.ts`). **Two workers across two waves co-own the same files.** This is a merge collision. **Fix:** either (a) push daily-cap wiring fully into Wave 0 Worker 2, or (b) tell Wave 1 BE Worker 3 it owns `apps/web/src/lib/agents/middleware/daily-cap-middleware.ts` (a new file) and Wave 0 Worker 2 exposes a hook.

### P0-4 — Wave 0 Worker 3 builds API surfaces but cannot validate, because Wave 0.5 hasn't shipped types
Wave 0 Worker 3 brief lists `api/health/route.ts` and `apps/web/src/middleware.ts` and Step 11 success: "`pnpm typecheck && pnpm lint && pnpm build` all pass with empty placeholder pages." Worker 3 imports `@supabase/ssr` and must use types — fine — but the spec also says it bootstraps placeholder pages that the Wave 1 frontend workers will fill in. Wave 1 frontend imports `@/lib/types/api` (Wave 0.5 output). If Wave 0 Worker 3's placeholder pages reference any of the route paths from Wave 1 (which they do — sidebar links to `/inbox`, `/scans`, etc.), there's no problem yet — **but** the merge order in Wave 0 places Worker 3 (app-shell) before Wave 0.5. If a Wave 0.5 type change requires renaming a route, Worker 3 must rebuild. **Fix:** state that Wave 0 Worker 3's placeholder pages must NOT import from `@/lib/types/*` (only stub `EmptyState` rendering), so Wave 0.5 can ship safely without invalidating Worker 3.

### P0-5 — Wave 2 Worker 1 (Hebrew/RTL) is told to edit `src/lib/agents/config/prompts/<agent>.ts`
`10-WAVE-2-BRIEF.md` line 40: "Agent prompts: each of the 11 prompts needs a Hebrew variant in `apps/web/src/lib/agents/config/prompts/<agent>.ts` (export `PROMPT_EN` and `PROMPT_HE`). Router picks per `business.language`." This worker is a **frontend-developer**. The file is in the agent-system directory owned by Wave 0 Worker 2 (ai-engineer). Per AGENTS.md routing, prompt authoring is ai-engineer's domain. Also note Wave 0 Worker 2 exported `PLAN_PROMPT`, `RESEARCH_PROMPT`, etc. — Wave 2 Worker 1 is being asked to rename to `PROMPT_EN` / `PROMPT_HE` which is a different export shape. This breaks every caller in `pipeline/steps/*.ts`. **Fix:** either re-assign this work to an ai-engineer worker, or change the contract to add `PLAN_PROMPT_HE` etc. alongside the existing exports (not rename), and have Wave 2 Worker 1 collaborate with ai-engineer.

### P0-6 — Wave 1 BE Worker 2 owns `paddle-webhook.ts` but BE Worker 1 owns the `day1.onboarding` event it fires
BE Worker 2 brief (line 84): "Trigger Inngest `day1.onboarding` on `subscription_created`." BE Worker 1 owns `apps/web/src/inngest/functions/day1-onboarding.ts` and `apps/web/src/inngest/client.ts` (the event types). If BE Worker 1 has not yet defined the `day1.onboarding` event payload in `client.ts`, BE Worker 2's typecheck fails. Both workers are told to spawn in parallel after design-lead prep (Wave 1 line 35). Merge order says BE Worker 2 merges first. **Order contradicts dependency.** **Fix:** make BE Worker 1's first deliverable `inngest/client.ts` (event registry), and gate BE Worker 2 spawn on that file existing on `feat/be-automation`'s branch; OR move the event registry to a shared `inngest/events.ts` file owned by Wave 0.5.

### P0-7 — Wave 1 success criteria reference `recharts` and `cmdk` but Wave 0 Worker 3 already installed them — duplicated dependency declarations are silent
Wave 0 Worker 3 line 192 declares the entire `package.json` (Next 16, React 19, cmdk, zustand, recharts, etc.). Wave 1 frontend workers will add component code that depends on additional packages (`react-markdown` is listed in Wave 0 — good; but Wave 1 §Inbox needs `react-markdown` for editor diffs — also good). However, Wave 1 frontend will need `@tanstack/react-query` or SWR for `useInboxPolling()`, and neither is in the Wave 0 package list. **Fix:** add the data-fetching library to Wave 0 Worker 3's deps list, or explicitly tell Wave 1 FE Worker 1 it may add data-fetching deps (and which one).

---

## P1 (executable but ambiguous — workers will ask back)

### P1-1 — "Stay inside" file scopes don't include test directories
Every Wave 1 backend worker brief says "Stay inside `src/lib/...` and the API routes listed." None of them say where Vitest test files live. BE Worker 1's brief says "Vitest suite covering: each of 15 rules (one test per rule, fixtures in `__fixtures__/`)" — `__fixtures__/` relative to what? `apps/web/src/lib/suggestions/__fixtures__/`? `apps/web/__tests__/`? Workers will guess differently. **Fix:** add explicit test paths per worker.

### P1-2 — Inngest event names not enumerated centrally
Wave 1 BE Worker 1 implements `day1.onboarding`, `scan.completed`, `url-probe`. BE Worker 2 fires `day1.onboarding`. BE Worker 3 listens for `agent_jobs` completion. There is no single registry brief that says: "these are the canonical event names." Workers will diverge on `scan.completed` vs `scan.complete` vs `scan_completed`. **Fix:** include event name table in Wave 0.5 or as appendix to Wave 1 brief.

### P1-3 — Wave 0 Worker 3 owns `eslint.config.mjs` — Wave 1 workers may add ESLint rules
Wave 0 Worker 3 configures eslint. Wave 1 workers writing tests may need to add `vitest/globals` or `playwright` plugin configs. Brief is silent on whether they're allowed to modify `eslint.config.mjs`. **Fix:** state that any worker may extend ESLint config additively (rules: add only, never remove).

### P1-4 — Wave 1 FE Worker 1 must use `useInboxPolling()` — not specified where it lives
"Inbox polling (`useInboxPolling()` at 5s) by default; Supabase Realtime as env-flag-opt-in." No file path. Is this `src/hooks/use-inbox-polling.ts`? Owned by FE Worker 1? **Fix:** declare file path and ownership.

### P1-5 — Wave 2 Worker 3 (devops-lead) creates a final migration file mid-build
Wave 2 Worker 3 line 107: "wire OpenRouter usage events to a `llm_cost_events` table (added via a final migration in this worker)." But Wave 0 Worker 1 owns ALL migrations and follows a strict numbering convention (`20260520_01` through `20260520_12`). devops-lead adding `_13` or `20260601_01` requires a clear naming rule. Also, who generates the updated `database.types.ts`? **Fix:** declare numbering + types regeneration step in Wave 2 Worker 3 brief.

### P1-6 — QA gate verdict format not specified
CLAUDE.md says "No merge without QA Lead PASS." Briefs say "Full-tier QA passed" — but no brief tells the CEO what artifact QA Lead returns. Is it a JSON `{verdict: "PASS"|"BLOCK", findings: []}`? Where does QA Lead write the verdict? **Fix:** add QA return contract to a shared section in each wave brief.

### P1-7 — Wave 1 FE Worker 1 includes notification-bell which lives in `DashboardShell` (Wave 0 Worker 3's owned component)
"Notification bell (in `DashboardShell`)" — Wave 0 Worker 3 already built `dashboard-shell.tsx` and was told "kill-switch banner slot, content area." Bell is not in the Wave 0 spec. So Wave 1 FE Worker 1 must edit Wave 0 Worker 3's file. **Fix:** either (a) add bell slot to Wave 0 Worker 3's brief as an empty slot, or (b) explicitly state Wave 1 FE Worker 1 may edit `dashboard-shell.tsx` to add the bell.

### P1-8 — Wave 1 FE Worker 3 also edits `DashboardShell` (preview banner, kill-switch banner)
Same conflict — three different Wave 1 frontend workers (FE 1 for bell, FE 3 for preview banner + kill-switch banner) all edit the shared layout. Merge conflicts guaranteed. **Fix:** consolidate `DashboardShell` ownership: either Wave 0 Worker 3 builds all slots empty, and Wave 1 workers fill them via composition (insert their child component into a slot prop) — OR designate one Wave 1 worker as `DashboardShell` final-owner.

### P1-9 — "Adam reviews each PR before merge" but Adam is async — no SLA
Wave 0 says CEO collects Adam's review feedback. If Adam takes 12 hours, what does CEO do? The brief doesn't say "CEO parks the lead and returns to user when Adam is ready" vs "CEO continues to next wave." **Fix:** state CEO behavior when Adam-review is pending.

### P1-10 — "OpenRouter prompt-caching pass-through" test (Wave 0 Worker 2 line 141)
Worker is told "If cache hit rate <80% on long system prompts, document in PR and configure direct Anthropic API as fallback for the affected agents." But the worker is asked to make an architectural decision (Anthropic direct vs OpenRouter) which Layer Contract forbids workers from. **Fix:** worker returns BLOCKED with evidence; CEO escalates.

### P1-11 — `04-EMPTY-STATES.md` referenced 9 times but ownership of illustrations unclear
Wave 0 Worker 3 builds "9 illustration variants (use simple inline SVGs for now; design-lead can refine later)." Wave 2 Worker 4 audits empty states. Neither says: are illustrations final by Wave 2? Is there a design-lead refinement task? **Fix:** add explicit refinement task in Wave 2 Worker 4 or Wave 1 design-lead prep.

### P1-12 — "Discover-tier paywall blur (rest blurred behind `<PaywallGate>`)" — `<PaywallGate>` owned by FE Worker 3, used by FE Worker 1
FE Worker 1 (Home + Inbox) uses `<PaywallGate>` (FE Worker 3's deliverable). If Worker 3 ships later or with a different prop signature, Worker 1 breaks. **Fix:** put `<PaywallGate>` component contract in Wave 0.5 shared types, or have FE Worker 3 ship its component skeleton first.

### P1-13 — Wave 2 Worker 2 (qa-lead orchestrator) is told to deliver code (E2E tests, error boundaries, unit tests)
Per Layer Contract, leads do NOT write source files — workers do. The brief says "qa-lead delegates to test-engineer" — good — but lists test-engineer as the only worker. Error boundaries are React component wrappers (frontend-developer scope), not test-engineer scope. **Fix:** split error-boundary work to a frontend-developer or include test-engineer doing React component code (against current AGENTS.md scope).

### P1-14 — `apps/web/src/components/_patterns.md` is referenced by Wave 0 and Wave 1
Wave 0 Worker 3 line 159 says design-lead writes `_patterns.md` as Step 0 prep. Wave 1 line 30–33 also has a design-lead prep producing `_patterns.md`. Same file, two waves. Is this an update? A rewrite? Or a duplicate brief that should be removed from Wave 1? **Fix:** clarify — Wave 0 prep is the canonical writer, Wave 1 prep is "extend the existing file with X."

---

## P2 (small clarifications, not blocking)

- **P2-1** Wave 0 Worker 1 must run `mcp__supabase__generate_typescript_types` — confirm worker has access to Supabase MCP (mentioned in CLAUDE.md as MANDATORY but not explicitly tied to this worker's mcp scope).
- **P2-2** Wave 1 success criteria "8 of 11 agents" but Wave 2 says "9 of 11 agents" — mild bar drift between waves. Acceptable but worth noting.
- **P2-3** Wave 0 Worker 2 estimated 40-60 turns — Opus, complex. Worth budgeting an explicit `maxTurns: 80` ceiling per CLAUDE.md turn discipline.
- **P2-4** Wave 0.5 "verify with `madge --circular`" — madge is not in deps list. Add to Wave 0 Worker 3 package.json or note as `npx madge`.
- **P2-5** Wave 1 FE Worker 2 free scan brief says "polling" for engine logos light up, but no API endpoint listed for polling sub-engine status. Likely `GET /api/scan/free/[scanId]` but should be explicit.
- **P2-6** Wave 2 Worker 3 deliverable 8: `/status` route — should this be `(public)/status` or under `(protected)`? Unclear.
- **P2-7** Day-1 state list in Wave 0.5 shared.ts has 7 states; `10-WAVE-1` FE Worker 3 brief says "5 states" — inconsistency.
- **P2-8** "14-day money-back guarantee logic" (Wave 1 BE Worker 2 line 90) — refund handler updates `subscriptions.status='cancelled'`. The enum literal is `'cancelled'` per project memory; verify Worker 1's enum schema uses UK spelling (it should — memory enforces this).
- **P2-9** Wave 1 FE Worker 3 builds `/onboarding/post-payment` page but Wave 0 Worker 3 also has this route in its placeholder list. Confirm Worker 3 leaves it as a stub and FE Worker 3 fills it.
- **P2-10** No mention of CI pipeline (GitHub Actions) — is `pnpm typecheck && lint && build` run locally only? Worker QA gate vs CI gate unclear.
- **P2-11** Wave 0 archive step uses `_archive/saas-platform-2026-05-13-reset` — CLAUDE.md memory references `_archive/saas-platform-2026-04-legacy/`. Two archive locations exist after Wave 0; consider cleanup note.

---

## File-Ownership Matrix (derived view across all 4 waves)

Format: `path → owner (wave)` | additional editors flagged with `+`.

### Migrations / DB
| Path | Owner | Notes |
|------|-------|-------|
| `apps/web/supabase/migrations/20260520_01..12.sql` | W0/Worker1 db-engineer | 12 files |
| `apps/web/supabase/migrations/2026XX_llm_cost_events.sql` | W2/Worker3 devops-lead | **Conflict P1-5** — naming not specified |
| `apps/web/supabase/smoke-tests.sql` | W0/Worker1 | |
| `apps/web/src/lib/db/database.types.ts` | W0/Worker1 | Regenerated by W2/Worker3 (P1-5) |

### Agent system
| Path | Owner | Notes |
|------|-------|-------|
| `apps/web/src/lib/agents/types.ts` | W0/Worker2 ai-engineer | |
| `apps/web/src/lib/agents/config/registry.ts` | W0/Worker2 | |
| `apps/web/src/lib/agents/config/models.ts` | W0/Worker2 | |
| `apps/web/src/lib/agents/config/prompts/<agent>.ts` | W0/Worker2 | **+ W2/Worker1** edits to add Hebrew (P0-5) |
| `apps/web/src/lib/agents/pipeline/runner.ts` | W0/Worker2 | |
| `apps/web/src/lib/agents/pipeline/steps/*.ts` | W0/Worker2 | |
| `apps/web/src/lib/agents/coordination/*.ts` | W0/Worker2 | |
| `apps/web/src/lib/agents/credits/guard.ts` | W0/Worker2 | |
| `apps/web/src/lib/agents/credits/daily-cap.ts` | W0/Worker2 | **+ W1/BE3** wires it (P0-3) |
| `apps/web/src/lib/agents/errors.ts` | W0/Worker2 | |
| `apps/web/src/lib/agents/__evals__/` | W2/Worker2 test-engineer | |

### Shared types
| Path | Owner | Notes |
|------|-------|-------|
| `apps/web/src/lib/types/shared.ts` | W0.5 backend-dev | |
| `apps/web/src/lib/types/api.ts` | W0.5 backend-dev | 33 endpoints |
| `apps/web/src/lib/types/index.ts` | W0.5 backend-dev | barrel |

### App shell / UI primitives
| Path | Owner | Notes |
|------|-------|-------|
| `apps/web/package.json` | W0/Worker3 frontend-dev | **+ W1 FE workers** may add deps (P1-3) |
| `apps/web/eslint.config.mjs` `tsconfig.json` `next.config.ts` | W0/Worker3 | |
| `apps/web/src/middleware.ts` | W0/Worker3 | |
| `apps/web/src/app/globals.css` | W0/Worker3 | |
| `apps/web/src/components/dashboard-shell.tsx` | W0/Worker3 | **+ W1 FE1 bell, + W1 FE3 banners** (P1-7, P1-8) |
| `apps/web/src/components/sidebar.tsx` | W0/Worker3 | |
| `apps/web/src/components/command-palette.tsx` | W0/Worker3 | |
| `apps/web/src/components/empty-state.tsx` | W0/Worker3 | refined W2/Worker4 (P1-11) |
| `apps/web/src/components/ui/*` | W0/Worker3 | 27 Shadcn primitives |
| `apps/web/src/components/_patterns.md` | W0/design-lead + W1/design-lead (P1-14) | |
| `apps/web/src/lib/motion.ts` | W2/Worker4 polish | |

### Routes — placeholders (W0/Worker3) → filled (W1)
| Route | Placeholder | Implementer |
|-------|-------------|-------------|
| `(public)/scan/page.tsx` | W0/Worker3 | W1/FE2 |
| `(auth)/login,signup` | W0/Worker3 | — (Supabase auth handles) |
| `(protected)/home` | W0/Worker3 stub | W1/FE1 |
| `(protected)/inbox` | W0/Worker3 stub | W1/FE1 |
| `(protected)/scans` | W0/Worker3 stub | W1/FE2 |
| `(protected)/automation` | W0/Worker3 stub | W1/FE2 |
| `(protected)/archive` | W0/Worker3 stub | W1/FE3 |
| `(protected)/competitors` | W0/Worker3 stub | W1/FE3 |
| `(protected)/settings` | W0/Worker3 stub | W1/FE3 |
| `(protected)/onboarding/post-payment` | W0/Worker3 stub | W1/FE3 (P2-9) |
| `api/health/route.ts` | W0/Worker3 | |

### Backend (Wave 1)
| Path | Owner | Notes |
|------|-------|-------|
| `apps/web/src/inngest/client.ts` | W1/BE1 | event registry — **depended on by BE2** (P0-6) |
| `apps/web/src/inngest/functions/automation-dispatcher.ts` | W1/BE1 | |
| `apps/web/src/inngest/functions/agent-pipeline.ts` | W1/BE1 | |
| `apps/web/src/inngest/functions/scan-free.ts` | W1/BE1 | |
| `apps/web/src/inngest/functions/scan-manual.ts` | W1/BE1 | |
| `apps/web/src/inngest/functions/day1-onboarding.ts` | W1/BE1 | |
| `apps/web/src/inngest/functions/rules-evaluator.ts` | W1/BE1 | |
| `apps/web/src/inngest/functions/url-probe.ts` | W1/BE1 | |
| `apps/web/src/inngest/functions/daily-digest.ts` | W1/BE3 | |
| `apps/web/src/inngest/functions/budget-watcher.ts` | W1/BE3 | |
| `apps/web/src/lib/suggestions/*` | W1/BE1 | |
| `apps/web/src/lib/automation/kill-switch.ts` | W1/BE1 | |
| `apps/web/src/lib/scan/*` | W1/BE2 | |
| `apps/web/src/lib/billing/*` | W1/BE2 | |
| `apps/web/src/lib/feature-gate/*` | W1/BE2 | |
| `apps/web/src/lib/notifications/*` | W1/BE3 | |

### API routes (Wave 1) — owned by single backend worker each
| Route | Owner |
|-------|-------|
| `/api/agents/run`, `/cancel`, `/[type]` | W1/BE1 |
| `/api/suggestions/*` | W1/BE1 |
| `/api/automation/*` | W1/BE1 |
| `/api/scan/*`, `/api/scans` | W1/BE2 |
| `/api/billing/*`, `/api/webhooks/paddle` | W1/BE2 |
| `/api/plan/features` | W1/BE2 |
| `/api/onboarding/day1-status` | W1/BE2 |
| `/api/notifications/*` | W1/BE3 |
| `/api/credits/balance` | W1/BE3 |
| `/api/archive/[itemId]/publish` | W1/BE3 |
| `/api/inbox/*` | **MISSING — no Wave 1 worker is told to build these** ← see P0 list addendum below |
| `/api/competitors/*` | **MISSING — Wave 0.5 schemas exist; no backend implementer** ← addendum |
| `/api/billing/topup` | W1/BE2 (implicit — listed in W0.5 + W1/BE2 brief) |

### Wave 2 polish + launch
| Path | Owner |
|-------|-------|
| `apps/web/src/locales/{en,he}/*` | W2/Worker1 frontend-dev |
| `apps/web/src/lib/agents/config/prompts/*` (Hebrew variants) | **W2/Worker1 (P0-5 conflict)** |
| Playwright `apps/web/tests/e2e/*.spec.ts` | W2/Worker2 test-engineer |
| `apps/web/scripts/run-agent-evals.ts` | W2/Worker2 |
| `apps/web/src/lib/agents/__evals__/` | W2/Worker2 |
| Error boundaries on `(protected)/*` | **W2/Worker2 test-engineer (P1-13 scope conflict)** |
| `apps/web/src/lib/motion.ts` | W2/Worker4 |
| Sentry wiring (client + server) | W2/Worker3 |
| `/status` route | W2/Worker3 |
| `docs/RUNBOOKS/production-rollback.md` | W2/Worker3 |

---

## Addendum — Missing API Implementations (additional P0)

### P0-8 — Inbox API routes have no implementer
Wave 0.5 declares schemas for: `GET /api/inbox`, `GET /api/inbox/[itemId]`, `POST /api/inbox/[itemId]/approve`, `/reject`, `/edit`. **No Wave 1 backend worker brief lists these routes in their "Owner of" or "API routes owned by" sections.** Wave 1 FE Worker 1 will hit a 404. **Fix:** assign to BE Worker 1 (closest fit — pipeline/jobs) or BE Worker 3 (notifications adjacency). Add explicitly to that worker's brief.

### P0-9 — Competitors API routes have no implementer
Wave 0.5 declares schemas for: `GET /api/competitors`, `POST /api/competitors`, `DELETE /api/competitors/[id]`. **No Wave 1 backend worker is assigned.** Wave 1 FE Worker 3 Competitors page will not function. **Fix:** assign to BE Worker 2 (scan-adjacency, competitor data emerges from scans) or BE Worker 1.

### P0-10 — `GET /api/agents/[type]` (agent config) has no implementer
Schema defined in Wave 0.5. No backend worker brief mentions it. **Fix:** assign to BE Worker 1.

---

## Worktree Protocol Compliance

Checked against CLAUDE.md "Worktree Awareness." All 4 wave briefs include the `MAIN_REPO=$(git worktree list | head -1 ...)` pattern (Wave 0 lines 41-49 explicitly; Waves 0.5/1/2 inherit via continuation). **PASS.** No violations found.

## QA Gate Compliance

CLAUDE.md: "No merge without QA Lead PASS + user confirmation."
- Wave 0: all 3 PRs Full-tier QA, Adam reviews. **PASS.**
- Wave 0.5: Lite-tier QA + Adam review. **PASS.**
- Wave 1: each PR Full-tier QA, Adam reviews. **PASS.**
- Wave 2: QA Lead runs soak after merges. **AMBIGUOUS — P1-6** (verdict format not specified). Otherwise PASS.

## Layer Contract Compliance

- **P0-5** Wave 2 Worker 1 (frontend-developer) editing prompt files = workers doing out-of-domain work.
- **P1-10** Wave 0 Worker 2 asked to choose Anthropic-direct vs OpenRouter = worker architectural decision (forbidden).
- **P1-13** Wave 2 Worker 2 (qa-lead) writing source code (error boundaries) = lead doing worker work.
- Otherwise: leads brief workers, workers implement, CEO synthesizes. **PASS overall** with the 3 flagged.

---

## Token-Level Ambiguity Summary

Top instructions that need a file path / signature / behavior spec:
- "wires it into the agent_pipeline middleware" (W1/BE3 line 110) → which file, what export
- "implement the entire file structure" (W0/Worker2) → enumerated, but `12-AGENT-BUILD-SPEC.md` is the source — auditor cannot verify without that file
- "useInboxPolling()" (W1/FE1) → no path declared
- "PaywallGate" (W1/FE1 references; W1/FE3 owns) → no prop contract
- "design-lead can refine later" (W0/Worker3 line 188) → no follow-up task scheduled
- "5 states" vs the 7-state `Day1State` union — number mismatch
- "stub components" — banned per CLAUDE.md rule 6 "No placeholder UI" but Wave 0 Worker 3 explicitly ships placeholder pages. **Tension between hard rule and Wave 0 plan.** Worth a clarifying note: placeholders are acceptable in Wave 0 because they will be replaced in Wave 1, and they render a real `<EmptyState>` (not a TODO comment), which satisfies the spirit of the rule.
