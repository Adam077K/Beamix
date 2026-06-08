# HANDOFF — Build the Beamix Scan & Diagnosis Engine (v2 measurement model)

*Paste this into a fresh CEO session (`/name ceo-scan-build`, `/color gold`). It is self-contained. Date of handoff: 2026-06-08. Main tip at handoff: `b593930`.*

---

## Who you are / mission
You are the CEO/orchestrator for the Beamix scan rebuild. The measurement model has been fully rethought and **locked**. Your job is to BUILD it, wave by wave, through the binding QA gate, with Adam confirming each merge. You plan and delegate; you never write source code yourself.

**The product in one line:** the scan's deliverable is a prioritized "what you're missing vs the competitors the AI names" checklist that the Beamix agency executes; the visibility score is the hook; the moat is running before/after experiments no measurement-only tool can.

## READ FIRST (source of truth, in this order)
1. `docs/04-features/SCAN-MEASUREMENT-MODEL.md` — **authoritative v2 spec. Build from this.** Supersedes the two below as the build reference.
2. `.claude/memory/DECISIONS.md` — top 3 entries (2026-06-08 measurement v2, 2026-06-08 orchestration, 2026-06-07 diagnosis). The locked decisions + rationale.
3. `docs/04-features/SCAN-ORCHESTRATION.md` — the pipeline/flow/model-routing lock (no-leak probe, structural firewall, code scoring).
4. `docs/04-features/DIAGNOSIS-REDESIGN.md` — Phase-0 measurement spec + the board grill + the two go-live gates.
5. `docs/04-features/research/2026-06-08-scan-rethink-synthesis.md` and `.../2026-06-07-diagnosis-research-brief.md` — the research backing (engine costs, causal factors, answer-type taxonomy, SOTA).
6. The current scan code on main: `apps/web/src/lib/scan/` (engine-query, openrouter-client, prompts, safe-fetch, site-audit, types, analysis) and `apps/web/src/inngest/functions/scan-free.ts`.

## CURRENT STATE
- **Merged to main:** Wave 1 (`#159`, live retrieval behind `SCAN_LIVE_RETRIEVAL`, `retrieval_mode`, citation passthrough) + Wave 2 (`#160`, competitor capture + SSRF-safe `safe-fetch.ts` + `site-audit.ts`, hardened). Both flag-gated OFF in prod.
- **Locked, not yet built:** the entire v2 measurement model (band+profile+gap-list, 4 cadence layers, 6 dimensions, answer-shape classifier, fact/observation/hypothesis, the gap checklist, switchback experiments).
- **⚠ FIRST ACTION — land the spec docs to main.** The locked specs + DECISIONS entries are currently UNCOMMITTED on worktree `.worktrees/ceo-3-1780847609`. Bring them to main before building so workers branch from a tree that contains them. The files:
  - `docs/04-features/SCAN-MEASUREMENT-MODEL.md`, `SCAN-ORCHESTRATION.md`, `DIAGNOSIS-REDESIGN.md`
  - `docs/04-features/research/` (2 briefs + synthesis)
  - `docs/08-agents_work/sessions/2026-06-07-ceo-diagnosis-rebuild.md`
  - modified: `.claude/memory/DECISIONS.md`, `docs/00-brain/log.md`
  Land them as a docs-only branch → PR → merge (Lite/Trivial QA; they're docs). Verify they're on main, then start Wave 3.

## BUILD ORDER (then "build with workflows" — use the coding workflow per wave)
- **W3 — DB migration (Irreversible).** Schema in §10 of the spec: reuse `query_positions` (add `evidence_id` PK + `sample_n`,`ci_low`,`ci_high`,`model_id`,`run_kind`) and `scan_engine_results` (add `shape`,`shape_outcome`,`sentiment`); new tables `business_contexts` (L1 cache, 30d TTL, invalidate-on-edit, `built_from_scan_id`), `telemetry_events` (L4), `factor_catalog` (versioned impact weights, config not code); wire `tracked_queries`. Free scan stays JSONB blob. Ship a rollback file. **Irreversible tier → full qa.js at irreversible + Adam sign-off before applying.** Do NOT create new `scan_observations`/`scan_result_cache` tables — reuse the above.
- **W4 — L1 base audit + factor detection** (the FACT layer: schema/robots/reviews/Wikidata/Reddit/listicle presence → the gap-list detectors).
- **W5 — L2 probe v2:** 6 dimensions + the 12-shape answer classifier + code scoring (band + Wilson CI). Headline = presence/position band only; shape+sentiment annotate, don't move the headline yet.
- **W6 — Gap-list** (ordered by contrastive observed fact + fixability + effort) → map to the 4 agent playbooks via `playbook_id`; narration v2 (evidence-bound, Haiku free / Sonnet paid).
- **W7 — UI:** competitor-matrix hero, band, profile, gap-list, shape annotations, honest confidence caption.
- **W8 — L4 telemetry + the calibration/validation gate + the switchback-experiment harness.**
- **W2b — budget/abuse guard** (atomic pre-call counter on Upstash + per-/24 rate-limit + single-use Turnstile). **This GATES flipping `SCAN_LIVE_RETRIEVAL` ON in prod** — do not enable live retrieval in prod until W2b ships.

## HARD RULES (non-negotiable — these are the product)
1. **No-leak probe.** The engine gets ONLY the neutral real-user query — never the business name, never "is X mentioned", no JSON envelope. Detect the client in code AFTER. A lint-gate must fail the scan if the probe prompt contains the business name/domain. (This is now a marketable moat — most competitors violate it.)
2. **Code computes every number; the LLM only narrates** code-derived findings and cannot invent issues or numbers.
3. **Honesty spine, schema-enforced:** every signal is FACT / OBSERVATION (with N + CI + date + model_id) / HYPOTHESIS (must cite a FACT + sourced correlation + confidence). Banned phrasings: "invisible BECAUSE X", "X WILL raise score Y%".
4. **Gap-list ordered by contrastive observed fact** (competitors the AI names have it, you don't) + fixability + effort — NOT by borrowed vendor correlations. Impact weights live in `factor_catalog` (config), never hardcoded.
5. **Ship the gap-checklist now; the headline score is "early signal, calibrating"** until validated against L4 real traffic. Tier-3 factors (llms.txt, schema-beyond-basics, backlinks) are hygiene — NEVER promise lift.
6. **Always show a fresh number** — reuse cached context+queries for cost, never display a stale score as current.
7. **"Why they beat you" = evidence we verified** (their schema/reviews/citations) — never the engine's confabulated stated reason (that's at most a labeled "AI's guess").
8. **Structural firewall:** probe runs as its own job on `OPENROUTER_SCAN_KEY`, RLS-blocked from the identity row; narration on the separate agent key over stored evidence only.
9. **Switchback experiments from client #1** (founder lock) — one factor changed, rest held, re-probe with N≥5 + held-out controls → per-client causal lift.
10. **Rerun-variance gate (SD≤5) measured with caching OFF.** Per-engine subscores, never one cross-engine "truth".

## HOW TO WORK
- **Worktrees from origin/main**, verified via `gh api repos/Adam077K/Beamix/branches/main --jq .commit.sha` BEFORE branching (local refs go stale). Conventional commits, atomic, with the stall-failsafe (commit-what-you-have if a worker nears its token limit).
- **Verify IN the worktree** before any QA verdict: `SKIP_ENV_VALIDATION=1 INNGEST_EVENT_KEY=dummy INNGEST_SIGNING_KEY=dummy APPROVAL_TOKEN_SECRET=dummy pnpm -F @beamix/web typecheck` + `pnpm -F @beamix/web test -- src/lib/scan`. Re-run yourself; never trust a worker's summary. Tests run from `apps/web` so the path is `src/lib/scan`, not `apps/web/src/lib/scan`.
- **QA gate is binding.** Full/Irreversible waves → run the `qa.js` workflow (`Workflow({name:'qa', args:{ref:'origin/main...<branch>', tier:'full'|'irreversible', context:'...'}})`). A BLOCK stops the merge; CEO cannot override (only Adam, via a logged false-positive appeal). For security-critical code (anything touching `safe-fetch`/probes) point qa.js hard at it.
- **Adam confirms every merge.** Irreversible (the W3 migration) also needs his explicit sign-off + you apply the migration only after. Push branch → open PR with the QA verdict in the body → Adam merges/says go → you squash-merge → clean up the worktree.
- **Build with workflows** (founder instruction): use the coding workflow for substantive waves; qa.js as the gate.

## OPEN ITEMS / WATCH-OUTS
- Cost is a unit-economics gate, not a detail: naive cadence ≈ $300/mo/business; daily-light + weekly-deep + prompt cache + shared-query amortization is mandatory. Free-scan kill-switch ceiling = **$500/mo**. Free engines = Perplexity Sonar + GPT-4o-mini(+web); label GPT slot a "proxy for ChatGPT", never production ChatGPT.
- OpenRouter web plugin billing (per-call vs per-invocation) — validate against the first live invoice.
- `SCAN_LIVE_RETRIEVAL` stays OFF in prod until W2b. `OPENROUTER_SCAN_KEY` isolation must be confirmed live before any prod enable.
- The two go-live gates from Phase 0 still apply to the SCORE (not the checklist): rerun-variance SD≤5; external validation Spearman ρ≥0.4 vs a ground-truth signal — else the score ships as a letter grade / "calibrating".
- Defer (later, with triggers): 14-day engine-result cache, site-audit ETag cache, narration cache, shadow-recompute, the separate LLM extractor, the LLM verifier. Keep the cheap CODE substring check that a quoted engine line really appears in raw_response.

## KEY FACTS
- Repo `Adam077K/Beamix`; product app `apps/web/` (Next.js 16, Supabase ref `zhjxdwcqxhwletkpuwyl`, Paddle, Inngest, Vercel). DB work via Supabase CLI (MCP token-substitution fails from .envrc).
- Models: Opus 4.8 CEO/synthesis; Sonnet 4.6 default; Haiku 4.5 cheap. Build needs `SKIP_ENV_VALIDATION=1` + dummy Inngest/approval envs.
- 4 agent playbooks already in the enum: content_optimizer, schema_generator, review_presence_planner, reddit_presence_planner (cover ~80% of gaps via `playbook_id` — no enum migration for MVP).
