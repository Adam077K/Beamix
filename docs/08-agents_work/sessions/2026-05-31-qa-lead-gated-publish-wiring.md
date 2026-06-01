---
date: 2026-05-31
role: qa-lead
task: gated-publish-wiring
branch: feat/gated-publish-wiring
tip: 740b5f9
tier: irreversible
qa_verdict: PASS
codex_status: codex_unavailable
---

# QA Session — feat/gated-publish-wiring

## Scope
End-to-end wiring of the approval-gate-writer agent: gated_publish.requested event producer (agent-execute.ts + runner.ts) and consumer (approval-gate-writer Inngest fn). 11 agents with requiresApproval flags. Two new event types in BeamixEvents.

## Files reviewed (10)
- apps/web/src/app/api/inngest/route.ts — approvalGateWriter registration
- apps/web/src/inngest/client.ts — GatedPublishRequestedData + BeamixEvents extensions
- apps/web/src/inngest/functions/agent-execute.ts — producer wiring
- apps/web/src/inngest/functions/agent-execute.test.ts — 5 tests incl. exactly-once
- apps/web/src/inngest/functions/approval-gate-writer.ts — consumer function
- apps/web/src/inngest/functions/approval-gate-writer.test.ts — 7 tests
- apps/web/src/lib/agents/config/registry.ts — requiresApproval flags + resolveArtifactType
- apps/web/src/lib/agents/index.ts — export AgentPipelineResult + resolveArtifactType
- apps/web/src/lib/agents/pipeline/runner.ts — AgentPipelineResult + buildGatedPublishIntent
- apps/web/src/lib/agents/types.ts — requiresApproval field on AgentConfig

## Build evidence
- TYPECHECK_EXIT: 0
- TEST_EXIT: 0 (3 test files, 17 tests)
- BUILD_EXIT: 0

## Verification findings

### 1. Exactly-once emit — CONFIRMED CLEAN
step.sendEvent('emit-gated-publish', ...) is at line 106 of agent-execute.ts, outside step.run. The pipeline itself runs inside step.run('run-agent-pipeline') and its result (including gatedPublish) is memoized by Inngest across retries. No bare inngest.send of gated_publish.requested anywhere in runner.ts or retryable pipeline code. Test 4 in agent-execute.test.ts explicitly validates that mockRunAgentPipeline is called exactly once across two handler invocations (original + replay). Would fail if exactly-once regressed.

### 2. customerId correctness — CONFIRMED CLEAN
No CREATE TABLE customers in any migration. approval_queue.customer_id REFERENCES user_profiles(id) ON DELETE CASCADE confirmed at migration 20260525000001_agency_tables.sql line 124. user_profiles.id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE confirmed at 20260520100003_core_tables.sql line 26. Therefore customerId = input.userId = auth.users.id is correct. IDOR guard: userId is server-set in Phase A (not from request body).

### 3. Gated agent set — CONFIRMED CORRECT
11 agents. Gated (requiresApproval=true): content_optimizer, freshness_agent, faq_builder, authority_blog_strategist — all are content-publish agents per ARCHITECTURE.md §A3. Auto (requiresApproval=false): query_mapper, schema_generator, offsite_presence_builder, review_presence_planner, entity_builder, performance_tracker, reddit_presence_planner. No outreach/email agent type exists in the 11-agent registry. ARCHITECTURE.md §A3 categories (citations, listings, schema, scans = auto; content publish = gated) match implementation.

### 4. Gating tightness — CONFIRMED CLEAN
buildGatedPublishIntent in runner.ts is called AFTER persistOutput succeeds (line 1065 in diff, inside the success path). Any persistOutput failure throws and the catch block re-throws without reaching buildGatedPublishIntent. Guards: requiresApproval=false → null; empty customerId → null (with console.warn); unresolvable artifactType → null (with console.warn). All three guards are covered by tests 2 and 3 in agent-execute.test.ts.

### 5. Scope check — CONFIRMED CLEAN
Exactly 10 files changed. No DB migration in the diff. The UNIQUE constraint on approval_queue is absent from this diff (correctly deferred ticket).

### 6. No new DB migrations — CONFIRMED
git diff origin/main...HEAD --name-only produces no .sql or migration files.

## P2/P3 findings
- P3: approval-gate-writer.ts flush loop uses static step IDs ('emit-cost-alert', 'emit-approval-created'). Safe in current agent contract (each callback called at most once per run), but would silently emit duplicate events if agent contract changes to allow multiple calls. Recommend documentation comment. Filed as follow-up.

## Verdict
PASS — all P0/P1 blockers from prior rounds resolved. Build clean. Tests green. Exactly-once mechanism verified. FK chain verified. Gated agent set correct. No migrations in scope.
