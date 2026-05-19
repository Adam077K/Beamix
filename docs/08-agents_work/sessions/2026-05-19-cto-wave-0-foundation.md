---
session: cto-wave-0-foundation
date: 2026-05-19
agent: cto
session_name: ceo-1-1779204138 (worktree-launched CTO routine)
linear_ticket: null
trigger: CEO direct handoff per docs/product-rethink-2026-04-09/build-prep-2026-05-13/13-CEO-HANDOFF-PROMPT.md
risk_tier: full
qa_verdict: PENDING
status: PARTIAL — Step 0 archive PR opened, worker spawn blocked on missing Task tool
archive_pr: https://github.com/Adam077K/Beamix/pull/78
---

# Wave 0 Foundation — Orchestration Log

## Mission
Execute Wave 0 of the Beamix MVP build end-to-end:
1. Archive existing pre-rethink `apps/web/` to `_archive/saas-platform-2026-05-13-reset/` via a chore PR.
2. Spawn Worker 1 (database-engineer, Sonnet) on `feat/db-foundation`.
3. Spawn Worker 3 (frontend-engineer, Sonnet) on `feat/app-shell` in parallel with Worker 1.
4. After Worker 1 commits `database.types.ts`, spawn Worker 2 (ai-engineer, Opus) on `feat/agent-system` branched off `feat/db-foundation`.
5. Spawn Full-tier QA Lead before each merge.
6. Merge order: db-foundation → agent-system + app-shell (parallel after db).

## Worktree state (entry)
- Main repo: `/Users/adamks/VibeCoding/Beamix`
- This routine is launched inside `.claude/worktrees/agent-ae9a6a8cab0bf8fb6` (CTO agent worktree)
- Parent CEO worktree: `.worktrees/ceo-1-1779204138`
- Pre-existing uncommitted edits on main (not mine):
  - modified: `docs/00-brain/MOC-Codebase.md`, `skills-lock.json`
  - untracked: `.agents/`, `.claude/skills/pitch-deck-visuals/`, `docs/08-agents_work/2026-04-27-BOARD-ai-engineer-truth-file.md`, `docs/08-agents_work/2026-04-27-BOARD-designer.md`
- Plan: stash these before Step 0 archive PR; pop after PR merges to main.

## Step 0 — Archive PR (COMPLETE)
- Branch: `chore/archive-apps-web-pre-reset` (off main)
- PR: https://github.com/Adam077K/Beamix/pull/78
- Tier: Trivial (268 file renames, 1 new `.gitkeep`, no code change)
- Commit: `9da2dd0` — `chore: archive apps/web/ prior to hard reset (2026-05-13)`
- Stash preserved: `stash@{0}` "ceo-wave-0-archive-prep: preserve pending Adam edits" — must be popped on main after PR merges
- Build artifacts relocated to `/tmp/beamix-archive-*-tomove` before commit (lean archive)
- Status: OPEN — awaiting Adam review + merge

## CRITICAL: Tool-grant gap blocks worker spawn
The CTO routine launched in this session was granted only `Read, Write, Edit, Bash, mcp__supabase__*`. It does NOT have the `Task` tool. Therefore the CTO routine CANNOT spawn subagents (database-engineer, ai-engineer, frontend-engineer, qa-lead) — every spawn requires Task.

Per the user's "make the reasonable call and continue" instruction:
- Step 0 (which I CAN do without spawning) is DONE.
- Workers 1/2/3 + 4 QA-Lead gates are handed back to CEO as PARTIAL with ready-to-paste briefs below.

The CEO routine (which has Task per its own frontmatter) must perform the actual worker spawning.

## Workers (planned — CEO must spawn)

| Worker | Agent | Model | Branch | Worktree | Base | Status |
|--------|-------|-------|--------|----------|------|--------|
| 1 | database-engineer | Sonnet | feat/db-foundation | .worktrees/db-foundation | main (post-#78-merge) | PENDING — CEO spawns |
| 3 | frontend-engineer | Sonnet | feat/app-shell | .worktrees/app-shell | main (post-#78-merge) | PENDING — CEO spawns in parallel with W1 |
| 2 | ai-engineer | Opus | feat/agent-system | .worktrees/agent-system | feat/db-foundation | BLOCKED until W1 commits database.types.ts |

## Decisions
- Risk tier for all three Wave 0 PRs: **Full** (core infrastructure: DB schema, agent system, app shell).
- `frontend-developer` name in legacy wave brief → use `frontend-engineer` (renamed 2026-05-16 rethink).
- Step 0 uses `git stash` to preserve Adam's pending edits — do NOT use `git add -A`.
- Step 0 PR opened — Adam (not CTO) merges per project rule "QA gate is sacred; no merge without QA Lead PASS + user confirmation". Trivial-tier QA still required.

## Milestones
- [x] Step 0 archive PR opened (#78)
- [ ] Step 0 QA Trivial-tier PASS (CEO must spawn qa-lead)
- [ ] Step 0 merged by Adam
- [ ] Main pulled, stash popped (CEO does this after merge)
- [ ] Worker 1 (db) spawned (CEO must spawn — see brief below)
- [ ] Worker 3 (frontend) spawned in parallel (CEO must spawn — see brief below)
- [ ] Worker 1 commits database.types.ts
- [ ] Worker 2 (ai-engineer) spawned, branched off W1 (CEO must spawn — see brief below)
- [ ] QA Full-tier PASS for each PR (CEO must spawn 3x qa-lead)
- [ ] All 3 PRs merged
- [ ] Session file finalized with qa_verdict: PASS

## Update log
- 2026-05-19 — CTO routine launched. Plan committed.
- 2026-05-19 — Stashed Adam's pending edits.
- 2026-05-19 — Step 0: `git mv apps/web _archive/saas-platform-2026-05-13-reset` (268 files), build artifacts relocated, `.gitkeep` added.
- 2026-05-19 — Committed `9da2dd0`, pushed branch, opened PR #78.
- 2026-05-19 — Discovered CTO routine has no Task tool. Cannot spawn workers from here.
- 2026-05-19 — Restored session file from stash to update orchestration record. Returning PARTIAL to CEO.

---

## Ready-to-paste worker briefs (for CEO to spawn)

### Worker 1 — database-engineer (Sonnet)
```
agent: database-engineer
goal: Build the full DB foundation for the new Beamix product (hard-reset, fresh schema). Deliver 12 migration files + RPCs + RLS + database.types.ts + smoke tests. Apply to beamix-v2-staging via mcp__supabase__apply_migration; resolve every mcp__supabase__get_advisors finding.
branch: feat/db-foundation
worktree: .worktrees/db-foundation (auto via isolation:worktree)
base: main (post-#78-merge)
context_files:
  - docs/product-rethink-2026-04-09/build-prep-2026-05-13/05-DB-MIGRATION-PLAN.md
  - docs/product-rethink-2026-04-09/build-prep-2026-05-13/07-WAVE-0-BRIEF.md (§Worker 1 + §Security: Worker 1)
  - docs/product-rethink-2026-04-09/12-AGENT-BUILD-SPEC.md (TypeScript types section — your tables must match)
constraints:
  - LANGUAGE sql + CTEs only for ALL RPCs (project memory feedback_supabase_plpgsql.md). plpgsql is acceptable ONLY in trigger functions (audit_log_immutable).
  - user_profiles MUST include `timezone text NOT NULL DEFAULT 'UTC'` (W10 fix referenced by Wave 1 BE-3 daily-cap logic). Default `'Asia/Jerusalem'` if signup referrer host ends `.il` OR business.language === 'he'.
  - Every table in §Tables must ENABLE RLS with proper Pattern A/B/C/D policy. Smoke test enumerates all public tables and fails PR if any missing.
  - hold_credits MUST use single CTE with SELECT … FOR UPDATE against credit_pools AND daily_cap_usage (TOCTOU H1 fix). Returns {held: bool, reason: text}.
  - paddle_webhook_events idempotency (B1) + allocate_monthly_credits idempotent on (user_id, plan_id, billing_period_start).
  - kill_switch design: per-user `user_profiles.kill_switch_until`; global `system_kill_switch` table (NOT singleton enum).
  - url_probes PK = (business_id, url, queued_at); business_id RLS.
  - audit_log: append-only via DENY UPDATE/DELETE trigger; includes prev_hash column.
  - page_locks 2h TTL via cleanup_page_locks(); topic_ledger 365-day retention with topic_ledger_archive table.
  - Do NOT touch any code outside apps/web/supabase/ and apps/web/src/lib/db/.
success_criteria:
  - 12 migration files in apps/web/supabase/migrations/ per the plan (20260520_01 through 20260520_12).
  - Applied to beamix-v2-staging via MCP. All advisor findings resolved.
  - apps/web/src/lib/db/database.types.ts generated via mcp__supabase__generate_typescript_types.
  - apps/web/supabase/smoke-tests.sql passes cross-user RLS denial.
  - PR opened against main.
skills_to_load: [postgresql, supabase-rls-beamix, sql-optimization-patterns]
return_format: structured JSON {branch, worktree, files_created, migrations_applied_staging, advisor_findings_resolved, database_types_path, smoke_test_passed}.
documentation: docs/08-agents_work/sessions/2026-05-19-database-engineer-db-foundation.md
```

### Worker 3 — frontend-engineer (Sonnet) — spawn in parallel with Worker 1
```
agent: frontend-engineer
goal: Scaffold fresh Next.js 16 + React 19 + TS strict + Tailwind 4 + Shadcn/UI app shell — 7 protected routes (NO dashboard route), DashboardShell with 3 empty slot props, command palette, 27 Shadcn primitives extended with Beamix tokens, middleware, design tokens, /api/health env-validation endpoint.
branch: feat/app-shell
worktree: .worktrees/app-shell (auto via isolation:worktree)
base: main (post-#78-merge)
context_files:
  - docs/product-rethink-2026-04-09/build-prep-2026-05-13/07-WAVE-0-BRIEF.md (§Worker 3 + §Security: Worker 3)
  - docs/product-rethink-2026-04-09/08-UX-ARCHITECTURE.md (§2 sidebar + §3 per-page intent)
  - docs/product-rethink-2026-04-09/13-DESIGN-SYSTEM-SPEC.md (full)
  - docs/product-rethink-2026-04-09/build-prep-2026-05-13/04-EMPTY-STATES.md
  - docs/product-rethink-2026-04-09/build-prep-2026-05-13/06-ADAM-CHECKLIST.md (for env var list)
constraints:
  - Sidebar = 7 routes (home, inbox, scans, automation, archive, competitors, settings) — NO "dashboard" route.
  - DashboardShell with EMPTY SLOT PROPS for notificationBell, previewBanner, killSwitchBanner. Wave 1 FE workers inject via props — they will NOT edit dashboard-shell.tsx.
  - (protected)/layout.tsx ships with 3 commented-out slot imports (P0-F) — each Wave 1 FE worker un-comments their assigned line.
  - Service-role import boundary via eslint-plugin-import (H4) — forbid @/lib/db/admin imports from (public)/** and components/**.
  - SSRF stub at apps/web/src/lib/security/url-guard.ts with full JSDoc spec (Wave 1 BE implements body).
  - CSP header in next.config.ts headers() per spec (default-src 'self'; script-src 'self' 'nonce-{nonce}' https://*.paddle.com; …).
  - api/health/route.ts validates ALL env vars from 06-ADAM-CHECKLIST.md — returns 503 {missing: [...]} if any missing.
  - Empty placeholder pages render ONLY <EmptyState> with inline strings — no @/lib/types/* imports yet (isolates from Wave 0.5).
  - NO craft-reviewer this wave (P0-A applies Wave 1+).
  - pnpm typecheck && pnpm lint && pnpm build all clean with empty placeholder pages.
  - Run scripts/spec-gate.sh — must pass.
  - devDeps include madge (Wave 0.5 verifies no circular imports).
success_criteria:
  - All 12 deliverables in §Worker 3 of wave brief shipped.
  - Three builds clean (typecheck/lint/build).
  - Sidebar renders 7 routes, ⌘K opens, all routes registered.
  - PR opened against main.
skills_to_load: [react-patterns, nextjs-app-router-patterns, tailwind-design-system, beamix-brand-quality-bar]
return_format: structured JSON same shape as Worker 1.
documentation: docs/08-agents_work/sessions/2026-05-19-frontend-engineer-app-shell.md
```

### Worker 2 — ai-engineer (Opus) — spawn AFTER Worker 1 commits database.types.ts
```
agent: ai-engineer
goal: Build the entire agent system from scratch — 11 agents, 5-step pipeline (plan/research/do/qa/summarize), model router, credit guard, cross-agent coordination (page-locks, topic-ledger), daily cap enforcement, input-guard prompt-injection layer.
branch: feat/agent-system
worktree: .worktrees/agent-system (auto via isolation:worktree)
base: feat/db-foundation (NOT main — needs database.types.ts)
context_files:
  - docs/product-rethink-2026-04-09/12-AGENT-BUILD-SPEC.md (end-to-end)
  - docs/product-rethink-2026-04-09/07-AGENT-ROSTER-V2.md (per-agent business logic + prompts)
  - docs/product-rethink-2026-04-09/build-prep-2026-05-13/07-WAVE-0-BRIEF.md (§Worker 2 + §Security: Worker 2)
  - apps/web/src/lib/db/database.types.ts (committed by Worker 1)
constraints:
  - Direct Anthropic SDK for ALL claude-* calls (board April-18). OpenRouter ONLY for non-Anthropic (Gemini, GPT, Perplexity). Day-1 test: Anthropic-native prompt caching MUST hit >=80% on long system prompts — document in PR if not, restructure prompts (stable system first, business context after).
  - QA stage MUST include Perplexity Sonar citation verification for Content Optimizer, Authority Blog Strategist, FAQ Builder.
  - NO AI disclosure language anywhere in prompts (hard rule — feedback_no_ai_labels.md, 10-PRE-BUILD-AUDIT.md §Content Output Policy).
  - Inngest concurrencyKey = businessId on every agent pipeline function (T3 mitigation).
  - Worker 2 is sole author of 19 interfaces in types.ts (incl. InboxItem, Suggestion, NotificationItem — Wave 0.5 only re-exports).
  - All user-controlled spans wrapped in <USER_DATA> tags via wrapUserData(); every PLAN/RESEARCH/DO prompt includes the verbatim system-rule line about USER_DATA being untrusted.
  - Input-guard layer at apps/web/src/lib/agents/security/input-guard.ts with sanitizeBusinessName, sanitizeScanUrl, sanitizeCustomInstructions, wrapUserData.
  - Daily-cap middleware fully Worker 2 scope (Wave 1 BE-3 triggers it, never edits it).
  - Do NOT touch frontend or DB schema. Stay inside apps/web/src/lib/agents/.
success_criteria:
  - File structure exactly mirrors 12-AGENT-BUILD-SPEC.md §File Structure.
  - All 19 interfaces in types.ts.
  - 11 prompt files, each with required exports (PLAN_PROMPT, RESEARCH_PROMPT where applicable, DO_PROMPT, QA_PROMPT, SUMMARIZE_PROMPT where applicable).
  - runAgentPipeline with try/finally lock release.
  - Error classes per spec.
  - pnpm typecheck clean on the agent-system worktree.
  - No TODO or stub anywhere.
  - PR opened against main (NOT against feat/db-foundation — base off it, but target main; merge sequencing handled by CEO).
skills_to_load: [prompt-engineering-patterns, llm-app-patterns, beamix-scan-architecture]
model: opus
return_format: structured JSON same shape as Worker 1.
documentation: docs/08-agents_work/sessions/2026-05-19-ai-engineer-agent-system.md
```

### QA-Lead briefs (4× — Trivial for #78, Full for each Wave 0 PR)

#### For PR #78 (archive — Trivial):
```
agent: qa-lead
tier_hint: trivial
branch: chore/archive-apps-web-pre-reset
pr: https://github.com/Adam077K/Beamix/pull/78
scope: file rename only — 268 files moved from apps/web/ to _archive/saas-platform-2026-05-13-reset/. No code change. apps/web/ has only .gitkeep (Wave 0 workers scaffold inside).
expected_checks:
  - git rename detection ratio == 100% (no content drift in any of the 268 renamed files)
  - apps/web/.gitkeep present
  - No build artifacts (node_modules/.next/.turbo/.tsbuildinfo) in _archive/
  - main is unchanged from origin/main on file content
```

#### For each Wave 0 worker PR (Full-tier):
```
agent: qa-lead
tier_hint: full
branch: feat/<task-slug>
pr: <opened by worker>
scope: core infrastructure — apply Full-tier matrix (qa-engineer + code-reviewer + semgrep + security-engineer + adversary-engineer).

extra_checks_for_db-foundation:
  - All RPCs LANGUAGE sql (project memory feedback_supabase_plpgsql.md) — fail if any RPC uses LANGUAGE plpgsql with DECLARE blocks (triggers exempt)
  - user_profiles.timezone column present (W10)
  - paddle_webhook_events idempotency + record_webhook_event RPC
  - hold_credits TOCTOU fix (SELECT … FOR UPDATE in single CTE)
  - allocate_monthly_credits idempotent on (user_id, plan_id, billing_period_start)
  - RLS enabled on EVERY public table (smoke-tests.sql enumerates)
  - audit_log append-only trigger
  - kill_switch is table-based not enum
  - Staging advisors all resolved (mcp__supabase__get_advisors)

extra_checks_for_agent-system:
  - Anthropic SDK direct for claude-*; OpenRouter only for non-Anthropic providers
  - NO AI disclosure language in any prompt (grep all prompt files)
  - <USER_DATA> wrapping on all user-controlled spans
  - Inngest concurrencyKey = businessId
  - No TODO/stub/FIXME remaining anywhere in apps/web/src/lib/agents/
  - All 19 interfaces present in types.ts
  - 11 prompt files (one per agent)

extra_checks_for_app-shell:
  - Sidebar has exactly 7 routes (no "dashboard")
  - DashboardShell uses slot props (3) commented out in (protected)/layout.tsx
  - eslint-plugin-import service-role boundary enforced (test by adding bad import — must error)
  - SSRF stub with JSDoc spec at url-guard.ts (throws "not yet implemented")
  - CSP header in next.config.ts per spec (includes nonce-{nonce}, paddle.com, supabase.co, openrouter.ai, anthropic.com, perplexity.ai, resend.com)
  - /api/health env validation returns 503 with missing[] if any env var absent
  - pnpm typecheck && pnpm lint && pnpm build all clean
  - scripts/spec-gate.sh passes
```

## Handoff to CEO
CEO must:
1. Spawn qa-lead Trivial-tier on PR #78 (archive).
2. After Adam merges #78, run on main: `cd /Users/adamks/VibeCoding/Beamix && git checkout main && git pull --ff-only && git stash pop` to restore Adam's pending edits.
3. Spawn Worker 1 (database-engineer) and Worker 3 (frontend-engineer) in parallel (single message, two Task calls).
4. Monitor Worker 1; when it commits database.types.ts to feat/db-foundation, spawn Worker 2 (ai-engineer) with `base: feat/db-foundation` (NOT main).
5. Spawn qa-lead Full-tier on each Wave 0 PR before merge.
6. Verify success criteria from §Success Criteria of the wave brief:
   - apps/web/ archived ✓ (already done by CTO)
   - Three PRs open, all Full-tier QA passed
   - Staging Supabase project has all migrations applied, advisors clean
   - database.types.ts generated and matches agents/types.ts
   - pnpm typecheck && pnpm lint && pnpm build clean on each worktree
   - No TODO or stub remaining in agent-system worktree
   - Sidebar renders 7 routes, all clickable, ⌘K works
   - Worker JSON returns capture all required fields
7. After all 3 merged, finalize this session file with qa_verdict: PASS and signal Adam "Wave 0 complete — ready for Wave 0.5. Proceed?"
