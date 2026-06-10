---
date: 2026-06-10
role: ceo
task: wave-4-factor-detection
tier: full
qa_verdict: PASS
branch: feat/w4-factor-detection
workers_spawned: [backend-engineer]
---

# Wave 4 — L1 Factor Detection (the FACT layer / gap-list)

Pure detection library feeding the post-scan gap checklist (`docs/04-features/SCAN-MEASUREMENT-MODEL.md` §3). No DB write, no UI, no migration — consumed by later waves.

- `factor-detection.ts` — `detectFactors()` returns exactly 16 FACT-class `FactorObservation`s (one per `factor_catalog` key, canonical tier order). 7 detectors implemented deterministically (ai_bot_allowlist w/ FM-5 guard, basic_schema, schema_beyond_basics, extractable_structure, content_freshness, llms_txt, wikidata_entity via public API); 9 honestly marked `pending` (status='pending', source='external_api_pending') — never fabricated.
- `site-audit.ts` — extended to extract `dateModified` (JSON-LD dateModified preferred over datePublished; meta fallback; depth-guarded walkers).
- `factor-catalog.ts` — `loadFactorCatalog()` + `buildGapList()` join observations to catalog metadata (tier/weight/playbook_id/promises_lift carried through; Tier-3 never implies lift).
- Honesty spine enforced: every observation FACT-class with concrete evidence; pending ≠ guessed.
- QA: Full-tier binding gate (reproduced via subagents — Workflow runner wedged this session). security CLEAN; one correctness P1 (future-dated `dateModified` → always 'present') fixed + mutation-verified; correctness/test P2 false-passes fixed. typecheck clean, 185 tests pass (verified in-worktree).
- Deferred fast-follows: the 9 `pending` detectors need search/3rd-party APIs (budget-gated sub-wave); wiring into the scan flow + persisted shape is a later wave.
