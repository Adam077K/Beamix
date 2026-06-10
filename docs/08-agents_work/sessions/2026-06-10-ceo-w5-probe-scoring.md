---
date: 2026-06-10
role: ceo
task: wave-5-probe-scoring
tier: full
qa_verdict: PASS
branch: feat/w5-probe-scoring
workers_spawned: [backend-engineer, backend-engineer, backend-engineer]
---

# Wave 5 — L2 Probe v2 + Code Scoring (the measurement core)

Pure additive TypeScript library under `apps/web/src/lib/scan/` — 7 source modules + 6 test files, +3,991 LOC, 322 passing tests. NO migration, NO change to the live scan flow (`prompts.ts`/`engine-query.ts`/`scan-free.ts` deliberately untouched). Builds the measurement core per `docs/04-features/SCAN-MEASUREMENT-MODEL.md` §1/§5 + `SCAN-ORCHESTRATION.md`. Ready to wire; wiring is the next wave.

## What shipped
- `measurement-types.ts` — single source of truth for W5 types; the `AnswerShape`/`IntentBucket`/`RunKind`/`ShapeOutcome` literals mirror the W3 migration `20260608000002` CHECK constraints exactly.
- `probe.ts` — `buildNeutralProbe(NeutralQuery)`: the no-leak probe. Input type carries ZERO business identity (the structural firewall as a type boundary). `checkProbeLeak`/`assertProbeClean(...,{branded?})`: fail-closed lint-gate that catches business_name/domain/domain_root/alias leaks; **branded probes bypass by design** (identity-bearing, scored separately, must never feed the visibility band).
- `client-detection.ts` — CODE extraction (no LLM): `detectClient` (mention/rank/snippet) + `extractCompetitors` (conservative list parsing); exports `extractDomainRoot` (single source).
- `answer-shape.ts` — the 12-shape classifier + conservative win/partial/loss. Annotation only.
- `sentiment-judge.ts` — the ONE allowed LLM call (Gemini Flash default, injectable). Quote is code-verified against the sanitized snippet the model saw; unverifiable → `'unknown'` (never `'neutral'`). Quote length-capped.
- `dimensions.ts` — the 6 dimensions per engine (presence, position, cited-as-source, share-of-voice, breadth, sentiment).
- `scoring.ts` — `wilsonInterval` + `computeBand` (headline = presence/position ONLY; `low_confidence` at n<5) + `scoreEngine`/`scoreAllEngines` (per-engine subscores, never averaged) + `rerunVariance` (SD≤5 gate, cache-OFF).

## Hard rules verified (these ARE the product)
1. No-leak probe — probe input has no identity field; leak-gate strict for non-branded, branded bypass documented.
2. Code computes every number; LLM only judges sentiment, with a code substring-check on its quote.
3. Headline Band = presence/position only — **sequencing-lock invariant test** asserts varying shape.outcome/sentiment leaves band.point + CI identical.
4. Per-engine subscores, never one cross-engine truth.
5. Wilson CI widens honestly at small N; honesty spine (sentiment `unknown` not `neutral`; no HYPOTHESIS language).

## QA — binding gate ran TWICE (Full tier), both PASS
- Built via 2 sequential workers (extraction layer `d44fc44` → scoring layer `f0ea9e7`); branch tip verified against GitHub truth between each, gates re-run by CEO in-worktree (typecheck 0 / tests / `next build` 0 — never from worker summary).
- Gate #1 (`f0ea9e7`): PASS, 0 block-eligible, 16 advisories → cleared in `681250b` (branded leak-gate, 2-item-list outcome, quote cap+plane, position-bonus guard, domain-root dedup, dead-code, perf, +6 tests incl. the sequencing-lock invariant). 302→322 tests.
- Gate #2 (`681250b`, the merge candidate): PASS, 0 block-eligible, no coverage gap. 14 new finer advisories recorded as fast-follows (below) — polish loop stopped intentionally (each pass finds the next layer; remaining items don't touch a core invariant or security boundary).

## Deferred fast-follows (for the wiring / W6 wave)
- **Wiring (next wave):** replace the contaminated `buildEnginePrompt` in `prompts.ts` with `buildNeutralProbe`; call `assertProbeClean` to fail-closed; split the probe into its own Inngest job on `OPENROUTER_SCAN_KEY`; persist observations into `query_positions`/`scan_engine_results` (W3 columns).
- **Irreversible follow-up:** the DB role-grant REVOKE making the scan service-role physically unable to read the `businesses` identity row (the firewall's DB half; at W5 it's a type boundary + runtime gate). Needs migration + Adam sign-off.
- **Gate-2 advisories (14, non-blocking):** shape-classifier false-positive edges (`isNegativeAvoid` on positively-used "avoid"; cited-as-source name-priority) — safe to defer because shape is annotation-only and does not headline yet (W6 calibration); `isClientName` competitor-exclusion edge; 2 log-hygiene items in `sentiment-judge`; a dead param + stale JSDoc; 4 untested branches (tool_vs_service partial, rerunVariance single-element, 2-item-unmentioned, whitespace quote); 3 micro-perf (regex backtracking, double mentioned-scan, un-hoisted regex).
- **Score go-live gates (unchanged):** rerun variance SD≤5 cache-OFF + external validation Spearman ρ≥0.4 gate the SCORE, not the gap-list checklist.
