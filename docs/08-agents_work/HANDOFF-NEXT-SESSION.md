# HANDOFF — Next CEO session

Copy everything between the two `---` lines below and paste it as your first message to the next CEO session. It's self-contained and reboots the context cleanly.

---

You are CEO of the Beamix build. Prior sessions shipped Wave 0 (foundation — DB migration, agent system, app shell) and Wave 1 (full UI + 17 API routes + 7 Inngest functions + paywall + free-scan funnel). Everything is on `origin/main` at commit `8b77c2e` or later. Typecheck + `next build` pass clean.

**My two priorities for this session, in order:**

### Priority 1 — Supabase MCP + legacy cleanup

The Supabase MCP is wired but not yet connecting (401 unauthorized on `mcp__supabase__*` tools). Full context in `docs/08-agents_work/sessions/2026-04-19-ceo-wave0-wave1-complete.md` under "BLOCKER 1".

Steps to unblock, in order:

1. **Rotate the leaked Supabase PAT.** The previous token was exposed via a `Read` call on `.envrc`. Adam revokes the current token at https://supabase.com/dashboard/account/tokens, generates a new one named `beamix-mcp-cleaner`, pastes it into `/Users/adamks/VibeCoding/Beamix/.envrc` (replacing the old value).
2. **Full Claude Code restart from a direnv-loaded terminal.** Quit with ⌘Q. Open fresh Terminal, `cd /Users/adamks/VibeCoding/Beamix` (should see `direnv: loading .envrc`), launch Claude Code with `claude`. Launching from Spotlight won't work — GUI launches don't inherit shell env.
3. **Smoke-test the MCP** from CEO context: call `mcp__supabase__list_tables({"schemas":["public"], "verbose":false})`. If it returns real tables, proceed. If still 401, verify `$SUPABASE_ACCESS_TOKEN` is loaded in the shell Claude Code was launched from (`echo ${SUPABASE_ACCESS_TOKEN:0:8}` should print the first 8 chars of the new token).
4. **Apply the rethink migration to staging** (if not already applied):
   ```bash
   bash apps/web/supabase/apply-staging.sh --confirm
   supabase gen types typescript --project-id $SUPABASE_PROJECT_REF > apps/web/src/lib/types/database.ts
   git add apps/web/src/lib/types/database.ts && git commit -m "chore(types): regenerate database types post-migration"
   ```
5. **Spawn the supabase-cleaner agent** for its first audit. The agent lives at `.claude/agents/supabase-cleaner.md`. Its job: read the runbook at `.claude/memory/supabase-cleanup-plan.md`, survey the live DB via `mcp__supabase__list_tables` + `execute_sql` (read-only), cross-reference against `apps/web/supabase/migrations/*.sql`, and identify legacy junk from the pre-rethink product (stripe_* columns, trial_* columns, retired agent_type enum values, dead tables like `social_strategy_plans`, `llms_txt_documents`, stale `free_scans` rows).
6. **Agent asks Adam yes/no per cleanup candidate.** One question at a time, no batching. For each yes, the agent writes a numbered SQL file to `apps/web/supabase/cleanup/NNNN-<slug>.sql` with 4 sections: pre-flight SELECT → archive → destructive step → rollback note. Adam runs the SQL manually in the Supabase SQL Editor.
7. **Hard rules for the cleaner (enforce in chat):** no DROP / DELETE / TRUNCATE without Adam's per-item yes; always archive to `_archive.<table>_YYYY_MM_DD` before destruction; production requires separate explicit confirmation; RLS stays enabled on every `public.*` table.

### Priority 2 — Continue Wave 2 (polish + Hebrew + launch readiness)

After Supabase cleanup is underway (doesn't have to be finished — just in Adam's applied-staging loop), resume Wave 2. The execution plan lives at `docs/product-rethink-2026-04-09/11-EXECUTION-PLAN.md` (Wave 2 section).

**Same protocol as Wave 1 that worked:** micro-workers, ≤12 turns each, single-surface briefs, pattern is salvage-and-merge if a worker dies mid-work (`git add apps/web/src && git commit -m "feat(...): partial — <what>"` from CEO context preserves code even when the worker doesn't commit).

Wave 2 outstanding items (from `docs/08-agents_work/sessions/2026-04-19-ceo-wave0-wave1-complete.md` "Wave 2 — queued but not started" section):

- Hebrew UI + RTL on 5 core screens (Home, Scans, Inbox, paywall modal, scan results)
- E2E Playwright tests (5 flows)
- Agent-content eval suite (20+ golden cases per Deep-6 agent, 5+ per Lighter-5)
- Inngest `agent-pipeline` real body (currently stub)
- Email send wiring (connect 6 templates to events)
- Daily cap enforcement middleware wire-up on `/api/agents/run`
- Turnstile on `/scan` public form
- Lint fix (ESLint 9 + Next 16 flat-config compat)
- Sentry wiring (`sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`)
- Empty states pass (some pages still placeholder)
- Mobile QA pass on all 7 dashboard pages
- Command palette (⌘K) component

### Pre-flight reading (do this before delegating anything)

Agents MUST read CLAUDE.md first. Then for this session specifically:

- `docs/08-agents_work/sessions/2026-04-19-ceo-wave0-wave1-complete.md` — where we left off, with 3 blockers detailed
- `.claude/memory/supabase-cleanup-plan.md` — starting hypothesis list for Supabase cleanup
- `docs/product-rethink-2026-04-09/05-BOARD-DECISIONS-2026-04-15.md` — product decisions including retired agents/columns (cleanup targets)
- `docs/product-rethink-2026-04-09/11-EXECUTION-PLAN.md` — Wave 2 brief
- `apps/web/supabase/migrations/` — authoritative schema

### What NOT to do

- Don't re-run Wave 1 workers on branches that are already merged. Every `feat/m-*` branch from Wave 1 is merged + deleted.
- Don't read `.envrc` directly. The token leaks into agent context. If you need to verify env vars are set, use `echo ${VAR:0:8}...` via Bash (truncated output only reaches context if you echo it).
- Don't push anything destructive to Supabase without Adam's explicit "yes, apply this specific SQL file on staging/prod." The cleaner agent is the only one that touches Supabase; everything else queries through API routes.
- Don't dispatch more than 6 parallel workers at once — observed pattern is that ~half die mid-work at ~30 tool uses. Tight 10-12 turn briefs + CEO salvage pattern is the working workflow.

### Budget guidance

- Use Sonnet 4.6 as default for all code workers and the cleaner agent.
- Opus only for deep synthesis or the initial Wave 2 plan review.
- Haiku for log parsing / test runs.

When you're ready, start by reading the three pre-flight docs above and then running the Blocker 1 smoke test.

---

(Handoff ends here — everything above the `---` is what you paste.)

## Note for Adam (don't paste this part)

- The `ceo-1-1776528998` worktree can stay for continuity, or you can prune it and let the next session create its own CEO worktree. Either works.
- There are ~15 stale worktrees under `.worktrees/` eating ~5 GB disk. The cleaner session can prune them as a warm-up task if you want.
- The Supabase PAT in `.envrc` right now should be considered compromised. Rotate it before the next session does anything with Supabase.
