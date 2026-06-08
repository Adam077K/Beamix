---
date: 2026-06-07
role: ceo
task: diagnosis-engine-rebuild
phase: 0 (spec + research + grill) — COMPLETE; rebuild waves awaiting Adam go
tier: planning/spec (no code merged this session)
qa_verdict: N/A (Phase 0 is docs-only; code waves gated Full/Irreversible per plan)
---

# CEO — Diagnosis Engine Rebuild (Phase 0)

**Ask:** Rebuild the scan/diagnosis so it truthfully measures AI-search visibility and explains why a customer can trust it. Audit → redesign → rebuild.

**Audit (3 Explore + 1 Plan agent):** confirmed all 5 defects in code — 2/3 engines parametric not live; single-query score; analyst fabricates issues from a label list with no site/schema/citation evidence; top-5 competitors discarded. Good bones (sanitization, JSON-parse fallbacks, ground-truth guard, Inngest, kill-switch) kept.

**Phase 0 deliverables (this session):**
- Spec: `docs/04-features/DIAGNOSIS-REDESIGN.md` (CPO) — query-set, code-computed scoring formula, evidence contract, free/paid scope.
- Research: `docs/04-features/research/2026-06-07-diagnosis-research-brief.md` (Research-Lead) — OpenRouter web_search costs, AI-Overviews path, SSRF mitigations.
- Grill (4 reviewers): broad-adversary HOLD→gates, customer-voice SHIP-with-fixes, risk-modeler HOLD (9-FM blocking set), CBO GO-with-conditions. None KILL → PROCEED with hard gates.

**Locked decisions:** see DECISIONS.md [2026-06-07] (9 items). Headlines: Option A engines (Sonar + GPT-4o-mini web; dual-Sonar killed), score-as-band, two pre-go-live gates (reproducibility SD≤5; external validation ρ≥0.4 else letter-grade), competitor-matrix-led UI, SSRF+budget blocking, $500/mo kill-switch ceiling.

**Next:** Adam go → CTO dispatch packets per wave (free-scan vertical slice first). Wave 3 (DB migration) = Irreversible/Adam sign-off; all pipeline waves = Full QA.
