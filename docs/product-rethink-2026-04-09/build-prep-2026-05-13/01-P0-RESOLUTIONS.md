# P0 / P1 Resolutions — 2026-05-13

Every gap from `../10-PRE-BUILD-AUDIT.md` closed or formally deferred. Source for `00-INDEX.md` summary table.

---

## P0 — Launch Blockers

### P0-1. UX paywall — old prices/trial refs → **RESOLVED in `08-UX-ARCHITECTURE.md`**
Verified `../08-UX-ARCHITECTURE.md` §4 (lines 207–212):
- "Discover $79/mo · Build $189/mo · Scale $499/mo · Annual toggle (saves ~20%)"
- "All paid plans include 14-day money-back guarantee"

No 7-day trial references remain in §4. Settings tab (line 161) reads "14-day money-back guarantee status". No code action needed; spec is canon.

### P0-2. Agent naming — "Freshness Agent" canonical → **RESOLVED**
Verified `../05-BOARD-DECISIONS-2026-04-15.md` line 53: "Canonical name is Freshness Agent. Early proposal used 'Content Refresher' — that name is retired." `../12-AGENT-BUILD-SPEC.md` agent registry, prompt file (`freshness-agent.ts`), and DB enum value (`freshness_agent`) all use the canonical name. Wave 0 ai-engineer must reject any "content_refresher" string at PR review.

### P0-3. 15 automation rules not enumerated → **RESOLVED → `02-AUTOMATION-RULES.md`**
Full enumeration of 15 trigger-condition-action-priority tuples produced. Ready to encode 1:1 as `RULES: AutomationRule[]` in `apps/web/src/lib/suggestions/rules.ts` (Wave 1 Backend Worker 1).

### P0-4. `plan_tier` enum migration → **RESOLVED → `05-DB-MIGRATION-PLAN.md`**
Hard reset simplifies this. The fresh DB ships a single `plan_tier` enum: `('discover','build','scale')`. No `starter/pro/business` values are ever created. Legacy Supabase project receives a one-time data drop + schema swap (`05-DB-MIGRATION-PLAN.md` §Cutover).

### P0-5. Day-1 dead dashboard → **RESOLVED → `03-DAY-1-FLOW.md`**
Complete post-payment chain specced: Paddle webhook → user_profiles update → seed business → Inngest `day1.onboarding` event → Query Mapper job → free scan job → rules engine evaluation → first 3 suggestions populated on Home. UI shows progress states ("Setting up your workspace…") with concrete timing.

### P0-6. Staging-first migration → **RESOLVED → `05-DB-MIGRATION-PLAN.md` §Staging Gate**
Process: apply migration to staging Supabase project → run `mcp__supabase__get_advisors` → verify RLS on all new tables via `mcp__supabase__execute_sql` smoke pack → regenerate `database.types.ts` → commit → only then promote to production. Production migration runs in Wave 2 (devops-lead).

### P0-7. Zero customer validation → **DEFERRED (not a code blocker)**
5 problem interviews run in parallel with Wave 0/0.5 by Adam — outside the agent build pipeline. Findings feed Wave 1 copy adjustments (Inbox empty state, Home headline, paywall messaging). Build does not gate on validation; if interviews surface a fundamental disconnect, the affected copy strings are updated mid-Wave 1.

---

## P1 — Degrades Experience

### P1-8. Empty states not spec'd → **RESOLVED → `04-EMPTY-STATES.md`**
Empty state defined for: Home, Inbox, Scans, Automation, Archive, Competitors, Settings tabs. Includes Day-1 workspace-setup state, error states, and tier-locked overlays.

### P1-9. High-score celebration state → **RESOLVED → `04-EMPTY-STATES.md` §Free-scan high-score**
Score ≥80 result page shows "You're already visible" headline, top-3 engines where user appears, "Stay ahead" CTA (vs "Fix this now"). Suggested next actions: Freshness Agent + Competitor tracking + Performance Tracker schedule.

### P1-10. Agent failure mid-pipeline UX → **RESOLVED → `04-EMPTY-STATES.md` §Inbox failure card**
Pipeline failure shows in Inbox as a failure card (not a draft). Credits auto-refunded via `releaseCredits()` (already in `12-AGENT-BUILD-SPEC.md`). Card shows: which stage failed, retry button (single retry), dismiss action. Persistent toast: "Run failed — credits refunded".

### P1-11. Haiku QA misses hallucinated citations → **ALREADY IN SCOPE**
`../12-AGENT-BUILD-SPEC.md` §QA stage commits Perplexity Sonar citation verification for Content Optimizer, Authority Blog Strategist, FAQ Builder. Wave 0 Worker 2 (ai-engineer) implements. Cost ~$0.02/run. Already in budget.

### P1-12. Score drop empathy missing → **TRACKED in Wave 1 frontend**
Frontend Worker 2 (`Scans` page) renders score-drop with "Here's why" panel: top 3 drivers (from `query_positions` deltas) + suggested actions. Wording per Performance Tracker rule B5 (directional language only).

### P1-13. Paddle checkout return route not built → **TRACKED in Wave 1 backend**
Backend Worker 2 implements `/onboarding/post-payment` with webhook polling (`subscriptions.status === 'active'`). Frontend Worker 3 implements the page UI. Day-1 trigger (`03-DAY-1-FLOW.md`) fires from this route.

### P1-14. Kill switch — no global banner → **TRACKED in Wave 1 frontend**
Frontend Worker 1 adds `<KillSwitchBanner>` to `DashboardShell` layout. Reads from a single hook (`useGlobalKillSwitch()` against `automation_kill_switch` row). Renders top-of-page amber banner when active.

### P1-15. $19 top-up pack → **ALREADY IN BOARD DECISIONS**
`../06-PRICING-V2.md` and board decisions confirm $19/10-runs top-up at launch. Wave 1 Backend Worker 2 adds the Paddle product + webhook handler; Frontend Worker 3 adds the modal trigger inside Settings → Billing and Home → credit-bar 100% state.

### P1-16. Competitor alerts must ship MVP-1 → **TRACKED in Wave 1**
Backend Worker 1 adds competitor-movement detection to the suggestion generator (Rule R09 in `02-AUTOMATION-RULES.md`). Frontend Worker 3 (Competitors page) renders the alert banner. In-app notification via the notification center (Backend Worker 3).

### P1-17. Hebrew prompts untested → **TRACKED in Wave 2**
Wave 2 Worker 1 runs 5-golden-case eval for each agent in Hebrew mode (per `../07-AGENT-ROSTER-V2.md` Pre-Launch Evaluation Criteria). Failing cases trigger prompt patches before launch.

---

## Resolutions outside audit (added 2026-05-13)

- **Direct Anthropic SDK is primary** (T1) — Wave 0 Worker 2 uses the direct Anthropic SDK for all `claude-*` calls (board April-18 decision). OpenRouter handles only non-Anthropic providers (Gemini, GPT, Perplexity). Day-1 prompt-caching telemetry verifies Anthropic SDK cache-hit rate on long system prompts (target ≥80%), NOT OpenRouter caching. Anthropic SDK is primary, not a fallback.
- **Supabase Realtime polling fallback** (T2) — Wave 1 Frontend Worker 1 implements `useInboxPolling()` at 5-second interval as default; Realtime is opt-in via env flag until 100+ concurrent users verified.
- **Inngest concurrency keys** (T3) — Wave 0 Worker 2 sets `concurrencyKey: businessId` on agent-pipeline function. Fan-out staggers 2s between dispatched steps.
- **Freshness chat editor is cuttable** (T4) — Wave 1 Frontend Worker 1 ships textarea-diff version first. Floating-capsule chat is upgrade if time permits before Wave 2 freeze.
- **Pipeline-stage progress indicator** (T5) — Frontend Worker 1 renders `<PipelineProgress stages={5} current={stage}>` on Inbox card while job is in flight. Stages: PLAN / RESEARCH / DO / QA / SUMMARIZE.

---

## Customer Validation Plan (P0-7, runs in parallel)

Adam books 5 problem interviews during Wave 0 (no code dependency):

- Profile: SMB owners or marketing leads, $50k–$2M revenue, currently using SEO or content tools
- Mix: 3 Israeli (HE-first market), 2 English-speaking
- Questions: (1) Do you know AI search engines cite businesses? (2) How would you know if you're cited? (3) Would you pay $189/mo for a tool that fixes this? (4) Is "AI search visibility" the right framing?
- Findings written to `docs/.claude/memory/USER-INSIGHTS.md` (research-lead-owned)
- If a fundamental disconnect surfaces (e.g., users don't understand "AI search visibility"), Wave 1 copy strings update before merge — but the build does not pause.
