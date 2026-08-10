# HANDOFF — Beamix scan rebuild, Wave 5 (paste into a fresh CEO session)

*Self-contained. Set `/name ceo-scan-w5`, `/color gold`. Date: 2026-06-10. main tip at handoff: `55cc771`.*

---

## STATE — Waves 1–4 merged to main; Wave 3 APPLIED + VERIFIED in the live DB
- **W1 (#159):** live web retrieval, flag-gated behind `SCAN_LIVE_RETRIEVAL` (OFF in prod).
- **W2 (#160):** evidence capture + SSRF-safe `site-audit.ts` / `safe-fetch.ts` (the security spine).
- **W3 (#162):** scan measurement v2 migration (version `20260608000002`) — **APPLIED to prod (project `zhjxdwcqxhwletkpuwyl`) and verified**: `business_contexts` / `telemetry_events` / `factor_catalog` tables, `factor_catalog` seeded (16 rows, Tier-3 `promises_lift=false`), the `tracked_queries` scoring-immutability trigger, RLS, and the new columns on `query_positions` / `scan_engine_results` / `tracked_queries`. **Do NOT re-migrate these.**
- **W4 (#163):** `factor-detection.ts` (16 FACT-class observations — 7 real detectors + 9 honest `pending`), `factor-catalog.ts` (`loadFactorCatalog` + `buildGapList`), `site-audit` `dateModified`. Pure library, not yet wired into the scan flow.

## READ FIRST (source of truth, in order)
1. `docs/04-features/SCAN-MEASUREMENT-MODEL.md` — authoritative v2 spec. Build from §1 (6 dimensions), §2 (honesty spine), §4 (cadence), §5 (orchestration), §11 (build order).
2. `docs/04-features/SCAN-ORCHESTRATION.md` — the no-leak probe contract, structural firewall, model routing.
3. `.claude/memory/DECISIONS.md` — top entries (2026-06-07/08 measurement v2 + orchestration).
4. Current scan code: `apps/web/src/lib/scan/` (engine-query, openrouter-client, prompts, site-audit, safe-fetch, factor-detection, factor-catalog, types, analysis) + `apps/web/src/inngest/functions/scan-free.ts`.

## YOUR WAVE — W5: L2 probe v2 + code scoring
Build the measurement core:
- **NEUTRAL no-leak probe:** send each engine ONLY the real-user query ("best {category} in {location}"). NO business name, NO "is X mentioned", NO JSON envelope. The current `buildEnginePrompt()` in `prompts.ts` is the exact contamination to remove. Detect the client in CODE after, against the raw response. Add a **lint-gate that FAILS the scan** if the probe prompt contains the business name/domain.
- **CODE extraction + CODE scoring** (no LLM picks mention/rank/score): the 6 dimensions (Presence, Position, Context/Sentiment [the one allowed LLM-judge call over a preserved snippet], Cited-as-source, Share-of-Voice, Breadth). Compute a **Band + Wilson CI** (N≥5 on weekly-deep). **Per-engine subscores** — never one cross-engine "truth".
- **12-shape answer classifier** (ranked_listicle … no_answer) + `shape_outcome` (win/partial/loss) — these ANNOTATE the profile/gap-list; they do **NOT** move the headline band yet (sequencing lock §1). Headline = presence/position band only.
- **Structural firewall:** the probe runs on `OPENROUTER_SCAN_KEY` as its own job, RLS-blocked from the business-identity row. Narration (later) uses the separate agent key over stored evidence only.
- Reuse the W3 tables (`query_positions` = observation ledger w/ evidence_id/sample_n/ci_low/ci_high/model_id/run_kind; `scan_engine_results` w/ shape/shape_outcome/sentiment). **NO new migration expected.**

## HARD RULES (these ARE the product — non-negotiable)
1. No-leak probe (lint-gated). 2. Code computes every number; LLM only narrates. 3. Honesty spine FACT / OBSERVATION (N+CI+date+model_id) / HYPOTHESIS — banned: "invisible BECAUSE X", "X WILL raise score Y%". 4. Always show a fresh number (reuse cached context+queries for cost, never a stale displayed score). 5. "Why they beat you" = OUR verified evidence, never the engine's confabulated reason. 6. Per-engine subscores; rerun-variance gate (SD≤5) measured cache-OFF. 7. `pending` ≠ fabricated (keep W4's honesty: never invent a detection).

## HOW TO WORK
- **Worktree from origin/main**, verified: `gh api repos/Adam077K/Beamix/branches/main --jq .commit.sha` BEFORE branching (local refs go stale — a stale worktree showed an old tree last session). Conventional atomic commits + stall failsafe (commit-what-you-have near token limit).
- **VERIFY IN THE WORKTREE before any QA verdict** — run ALL THREE, never trust a worker summary:
  ```
  SKIP_ENV_VALIDATION=1 INNGEST_EVENT_KEY=dummy INNGEST_SIGNING_KEY=dummy APPROVAL_TOKEN_SECRET=dummy \
  NEXT_PUBLIC_SUPABASE_URL=https://dummy.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy \
  pnpm -F @beamix/web typecheck && pnpm -F @beamix/web test -- src/lib/scan && pnpm -F @beamix/web build
  ```
  The **`build` step is MANDATORY** — `next build` runs ESLint (unused-vars etc.) that `tsc`+`vitest` miss and Vercel enforces (it red-blocked a W4 PR). Tests run from `apps/web`, so the path is `src/lib/scan`.
- **Binding QA gate (Full tier):** `Workflow qa { ref:"origin/main...feat/<branch>", tier:"full", context:"..." }`. ALWAYS pass args explicitly — a bare resume defaults to `tier:full` + `ref:origin/main...HEAD` (empty diff) and yields a meaningless false PASS; verify the returned JSON shows the right ref+tier. A BLOCK stops the merge; CEO cannot override.
- **PR:** add a session file `docs/08-agents_work/sessions/2026-06-XX-ceo-w5-*.md` with frontmatter `qa_verdict: PASS` + `tier: full` (the `qa-lead-pass.yml` CI check requires it). Add the `risk:full` label. Adam confirms every merge → squash-merge → clean up worktree+branch.

## INFRA NOTES (from the prior session)
- The **qa.js Workflow runner WEDGED** late in the prior session (the gate was reproduced via direct subagents — works but heavier). A FRESH session restores the real Workflow runner — use it.
- The **Supabase MCP is now write-capable** in `.mcp.json` (no `--read-only` flag); a session restart loads it, so you can apply/verify DB work directly via `mcp__supabase__apply_migration` / `execute_sql`. (MCP config edits do NOT apply mid-session.) The `ADAM_GITHUB_USER` secret is empty and the qa-lead CI step can throw a transient `gh` 401 — a re-run clears it.

## REMAINING ORDER AFTER W5
W6 gap-list contrastive ordering + evidence-bound narration (Haiku free / Sonnet paid) → W7 UI (competitor-matrix hero, band, profile, gap-list, honest confidence caption) → W8 L4 telemetry + calibration/validation gate + switchback-experiment harness → **W2b budget/abuse guard (GATES flipping `SCAN_LIVE_RETRIEVAL` ON in prod — do not enable live retrieval until W2b ships)**. The two score go-live gates (variance SD≤5 cache-OFF; external validation Spearman ρ≥0.4) apply to the SCORE, not the gap-list checklist — the checklist ships ahead of the calibrated score.

Start by reading the spec + current scan code, then plan W5 and dispatch workers in a worktree from origin/main.
