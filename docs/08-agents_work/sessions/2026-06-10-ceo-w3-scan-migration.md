---
date: 2026-06-10
role: ceo
task: wave-3-scan-measurement-migration
tier: irreversible
qa_verdict: PASS
branch: feat/w3-scan-measurement-migration
workers_spawned: [database-engineer]
---

# Wave 3 — Scan Measurement v2 DB Migration (Irreversible)

Additive Supabase migration backing the v2 scan/measurement model (`docs/04-features/SCAN-MEASUREMENT-MODEL.md`).

- ALTERs `query_positions` (evidence_id/sample_n/ci_low/ci_high/model_id/run_kind), `scan_engine_results` (shape/shape_outcome), `tracked_queries` (weight/intent_bucket/is_branded).
- New tables: `business_contexts` (L1 cache, 30d TTL), `telemetry_events` (L4), `factor_catalog` (16-row seed; Tier-3 `promises_lift=false` enforced by CHECK).
- Hardening: lock-safe `evidence_id` add + row-count guard; idempotent constraints/policies; RLS Pattern B (tenant) + Pattern P (config); `business_contexts` writes service-role-only; `tracked_queries` scoring columns locked to service_role via a BEFORE INSERT/UPDATE immutability trigger.
- Tests: smoke-tests (TEST 1–7), rollback-symmetry (5 checks), and a shadow-DB behavioral test (INSERT-clamp / UPDATE-reject 42501 / allowed-edit / service_role + owner bypass), all `\set ON_ERROR_STOP on`.
- QA: binding gate run to PASS (irreversible) — 5 dimensions clean + 3-way adversarial verification on the contested service_role test. Workflow runner wedged late, so the final gate was reproduced via subagents (same protocol). Bumped to version `20260608000002` to avoid a collision with `handle_new_user_trigger`.
- NOT yet applied. Apply on a Supabase shadow branch first (forward + 3 test files + forward/rollback symmetry), Adam sign-off, then prod.
