/**
 * Beamix — Agent Pipeline Cross-Function Chain Integration Tests
 *
 * Load-bearing integration tests that PROVE the 11-agent content pipeline's
 * event handover works end-to-end. Tests handler-to-handler wiring, not
 * implementation details.
 *
 * Test matrix:
 *   1. Cross-function chain — gated agent: agentExecute emits gated_publish.requested
 *      → approvalGateWriter consumes it and emits approval.created. Asserts full
 *      payload shape and customerId propagation across the chain.
 *   2. Cross-function chain — non-gated agent: agentExecute returns null gatedPublish
 *      → no event emitted.
 *   3. Retry idempotency: handler invoked twice with same event; pipeline callback
 *      runs exactly ONCE (Inngest replay memoization). step.sendEvent uses stable ID.
 *   4. approval.rejected wiring: server action shape → customerSuccessOnApprovalRejected
 *      consumes it with correct trigger and customerId.
 *   5. deliverables.over_cap wiring: consumeDeliverable shape → customerSuccessOnOverCap
 *      consumes it with correct trigger and customerId.
 */

import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import type {
  AgentRunRequestedData,
  GatedPublishRequestedData,
  ApprovalCreatedData,
  ApprovalRejectedData,
  DeliverablesOverCapData,
} from '../client';

// ---------------------------------------------------------------------------
// Env vars — must be set BEFORE module import so getRawAdminClient doesn't throw
// ---------------------------------------------------------------------------
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

// ---------------------------------------------------------------------------
// Mock server-only and @supabase/supabase-js before importing modules
// ---------------------------------------------------------------------------
vi.mock('server-only', () => ({}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      maybeSingle: vi.fn().mockResolvedValue({
        data: {
          email: 'owner@acme.com',
          full_name: 'Alex Smith',
        },
        error: null,
      }),
    }),
  }),
}));

// ---------------------------------------------------------------------------
// Mock LLM providers (only Anthropic needed for this test suite)
// ---------------------------------------------------------------------------
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Mock runAgentPipeline — we test the Inngest wiring, not the pipeline internals
// ---------------------------------------------------------------------------
const mockRunAgentPipeline = vi.fn();
vi.mock('../../lib/agents', () => ({
  runAgentPipeline: mockRunAgentPipeline,
}));

// ---------------------------------------------------------------------------
// Mock approval-gate-writer utilities
// ---------------------------------------------------------------------------
const mockRunApprovalGateWriter = vi.fn();
const mockMapArtifactToKind = vi.fn();
vi.mock('../../lib/agents/approval-gate-writer/index', () => ({
  runApprovalGateWriter: mockRunApprovalGateWriter,
  mapArtifactToKind: mockMapArtifactToKind,
}));

// ---------------------------------------------------------------------------
// Mock customer-success-on-approval-rejected utilities
// ---------------------------------------------------------------------------
const mockRunCustomerSuccessNudge = vi.fn();
vi.mock('../../lib/agents/customer-success/index', () => ({
  runCustomerSuccessNudge: mockRunCustomerSuccessNudge,
}));

vi.mock('../../lib/agents/customer-success/weekly-context', () => ({
  buildWeeklyContext: vi.fn().mockResolvedValue({
    week: '2026-06-01 to 2026-06-07',
    concerns: [],
    opportunities: [],
  }),
}));

// ---------------------------------------------------------------------------
// Mock customer-success-on-over-cap utilities (shares runCustomerSuccessNudge)
// ---------------------------------------------------------------------------
// reused from above

// ---------------------------------------------------------------------------
// Capture Inngest handlers via createFunction mock
// ---------------------------------------------------------------------------
type StepSendEventArgs = [id: string, event: { name: string; data: unknown }];

type InngestHandler = (ctx: {
  event: { data: Record<string, unknown> };
  step: {
    run: (name: string, fn: () => Promise<unknown>) => Promise<unknown>;
    sendEvent: (id: string, event: { name: string; data: unknown }) => Promise<void>;
  };
}) => Promise<unknown>;

let capturedAgentExecuteHandler: InngestHandler | null = null;
let capturedApprovalGateWriterHandler: InngestHandler | null = null;
let capturedCustomerSuccessOnApprovalRejectedHandler: InngestHandler | null = null;
let capturedCustomerSuccessOnOverCapHandler: InngestHandler | null = null;

vi.mock('../client', () => ({
  inngest: {
    createFunction: vi.fn((config: unknown, _trigger: unknown, handler: InngestHandler) => {
      const fnConfig = config as { id?: string };
      const fnId = fnConfig?.id;
      if (fnId === 'agent-execute') {
        capturedAgentExecuteHandler = handler;
      } else if (fnId === 'approval-gate-writer') {
        capturedApprovalGateWriterHandler = handler;
      } else if (fnId === 'customer-success-on-approval-rejected') {
        capturedCustomerSuccessOnApprovalRejectedHandler = handler;
      } else if (fnId === 'customer-success-on-over-cap') {
        capturedCustomerSuccessOnOverCapHandler = handler;
      }
      return { id: fnId };
    }),
  },
}));

// Import AFTER all mocks are in place — triggers createFunction calls
await import('../functions/agent-execute');
await import('../functions/approval-gate-writer');
await import('../functions/customer-success-on-approval-rejected');
await import('../functions/customer-success-on-over-cap');

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const USER_ID = 'user-001';

const GATED_EVENT_DATA: AgentRunRequestedData = {
  jobId: 'job-gated-001',
  agentType: 'authority_blog_strategist', // requiresApproval: true
  userId: USER_ID,
  businessId: 'biz-001',
  planTier: 'build',
  targetUrl: 'https://example.com/blog',
};

const NON_GATED_EVENT_DATA: AgentRunRequestedData = {
  jobId: 'job-nongated-001',
  agentType: 'schema_generator', // requiresApproval: false
  userId: USER_ID,
  businessId: 'biz-001',
  planTier: 'discover',
};

const GATED_PIPELINE_RESULT = {
  output: {
    jobId: 'job-gated-001',
    agentType: 'authority_blog_strategist',
    primaryContent: 'Blog post content here…',
    contentFormat: 'markdown' as const,
    summaryText: 'Lifts AI search mentions for the target keyword cluster.',
    targetQueries: ['best dental clinic', 'dental implants near me'],
    geoSignals: {
      hasStatistics: true,
      hasCitations: true,
      hasExpertQuotes: false,
      hasFreshData: true,
      hasLocalContext: true,
    },
    ymylFlagged: false,
    estimatedImpact: 'high' as const,
    costEntries: [],
    totalCostUsd: 0.05,
    durationMs: 12000,
  },
  gatedPublish: {
    customerId: USER_ID,
    artifactType: 'blog_post' as const,
    artifactId: 'job-gated-001',
    artifactPreview: 'Blog post content here…',
    whyThisMatters: 'Lifts AI search mentions for the target keyword cluster.',
    publishTarget: 'your blog at https://example.com/blog',
    riskFlags: [] as string[],
  } satisfies GatedPublishRequestedData,
};

const NON_GATED_PIPELINE_RESULT = {
  output: {
    jobId: 'job-nongated-001',
    agentType: 'schema_generator',
    primaryContent: '{"@context":"https://schema.org","@type":"LocalBusiness"}',
    contentFormat: 'json_ld' as const,
    summaryText: 'Schema markup generated for the business.',
    targetQueries: [],
    geoSignals: {
      hasStatistics: false,
      hasCitations: false,
      hasExpertQuotes: false,
      hasFreshData: false,
      hasLocalContext: true,
    },
    ymylFlagged: false,
    estimatedImpact: 'low' as const,
    costEntries: [],
    totalCostUsd: 0.01,
    durationMs: 3000,
  },
  gatedPublish: null,
};

// ---------------------------------------------------------------------------
// Step mock builder — simulates Inngest's step memoization on retry
// ---------------------------------------------------------------------------

/**
 * Build a step mock. `run` executes the callback immediately (non-retry path).
 * `sendEvent` is a spy.
 *
 * @param replayResult - When provided, `run` returns this value without executing
 *   the callback. This simulates Inngest's replay on retry: the step result was
 *   already recorded in the event log, so the callback is not re-invoked.
 */
function buildStep(replayResult?: unknown) {
  const sendEvent = vi.fn().mockResolvedValue(undefined);
  const run = vi.fn().mockImplementation(async (_name: string, fn: () => Promise<unknown>) => {
    if (replayResult !== undefined) {
      // Replay path: return the cached result without executing the callback.
      return replayResult;
    }
    return fn();
  });
  return { run, sendEvent };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Agent Pipeline Cross-Function Chain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  beforeAll(() => {
    // Sanity check: all handlers were captured
    if (!capturedAgentExecuteHandler) {
      throw new Error('capturedAgentExecuteHandler was not set — createFunction mock failed');
    }
    if (!capturedApprovalGateWriterHandler) {
      throw new Error(
        'capturedApprovalGateWriterHandler was not set — createFunction mock failed',
      );
    }
    if (!capturedCustomerSuccessOnApprovalRejectedHandler) {
      throw new Error(
        'capturedCustomerSuccessOnApprovalRejectedHandler was not set — createFunction mock failed',
      );
    }
    if (!capturedCustomerSuccessOnOverCapHandler) {
      throw new Error(
        'capturedCustomerSuccessOnOverCapHandler was not set — createFunction mock failed',
      );
    }
  });

  describe('Test 1: Cross-function chain — gated agent', () => {
    it('agentExecute → gated_publish.requested → approvalGateWriter → approval.created', async () => {
      // Arrange: set up mocks for the full chain
      mockRunAgentPipeline.mockResolvedValue(GATED_PIPELINE_RESULT);
      mockMapArtifactToKind.mockReturnValue('blog_post_draft');

      // ── Phase 1: agentExecute emits gated_publish.requested ──────────────────
      const agentStep = buildStep();
      let capturedGatedPublishPayload: GatedPublishRequestedData | null = null;

      // Spy on step.sendEvent to capture the emitted event
      agentStep.sendEvent.mockImplementation(async (id: string, event: any) => {
        if (event.name === 'gated_publish.requested') {
          capturedGatedPublishPayload = event.data;
        }
      });

      await capturedAgentExecuteHandler!({ event: { data: GATED_EVENT_DATA }, step: agentStep });

      // Assert: agentExecute emitted exactly ONE gated_publish.requested event
      const agentGatedCalls = (agentStep.sendEvent.mock.calls as StepSendEventArgs[]).filter(
        ([_id, evt]) => evt.name === 'gated_publish.requested',
      );
      expect(agentGatedCalls).toHaveLength(1);
      expect(capturedGatedPublishPayload).not.toBeNull();

      // Assert: payload shape is complete
      expect(capturedGatedPublishPayload).toHaveProperty('customerId');
      expect(capturedGatedPublishPayload).toHaveProperty('artifactType');
      expect(capturedGatedPublishPayload).toHaveProperty('artifactId');
      expect(capturedGatedPublishPayload).toHaveProperty('artifactPreview');
      expect(capturedGatedPublishPayload).toHaveProperty('whyThisMatters');
      expect(capturedGatedPublishPayload).toHaveProperty('publishTarget');
      expect(capturedGatedPublishPayload).toHaveProperty('riskFlags');

      // CRITICAL: customerId equals userId (schema: approval_queue.customer_id → user_profiles.id)
      expect(capturedGatedPublishPayload!.customerId).toBe(USER_ID);
      expect(capturedGatedPublishPayload!.artifactId).toBe('job-gated-001');

      // ── Phase 2: approvalGateWriter consumes gated_publish.requested ────────
      const approvalStep = buildStep();
      let capturedApprovalCreatedPayload: ApprovalCreatedData | null = null;

      // Mock runApprovalGateWriter to emit approval.created
      mockRunApprovalGateWriter.mockImplementation(
        async (data: GatedPublishRequestedData, callbacks: any) => {
          callbacks.emitApprovalCreated({
            approvalQueueId: 'approval-queue-001',
            artifactType: data.artifactType,
            customerId: data.customerId,
          });
          return { outcome: 'approval_queued' };
        },
      );

      // Spy on step.sendEvent to capture the emitted event
      approvalStep.sendEvent.mockImplementation(async (id: string, event: any) => {
        if (event.name === 'approval.created') {
          capturedApprovalCreatedPayload = event.data;
        }
      });

      await capturedApprovalGateWriterHandler!(
        { event: { data: capturedGatedPublishPayload! }, step: approvalStep },
      );

      // Assert: approvalGateWriter emitted exactly ONE approval.created event
      const approvalCreatedCalls = (
        approvalStep.sendEvent.mock.calls as StepSendEventArgs[]
      ).filter(([_id, evt]) => evt.name === 'approval.created');
      expect(approvalCreatedCalls).toHaveLength(1);
      expect(capturedApprovalCreatedPayload).not.toBeNull();

      // Assert: payload shape is complete
      expect(capturedApprovalCreatedPayload).toHaveProperty('approvalId');
      expect(capturedApprovalCreatedPayload).toHaveProperty('kind');
      expect(capturedApprovalCreatedPayload).toHaveProperty('customerId');
      expect(capturedApprovalCreatedPayload).toHaveProperty('createdAt');

      // CRITICAL: customerId propagates through the chain
      expect(capturedApprovalCreatedPayload!.customerId).toBe(USER_ID);
      expect(capturedApprovalCreatedPayload!.customerId).toBe(
        capturedGatedPublishPayload!.customerId,
      );
    });
  });

  describe('Test 2: Cross-function chain — non-gated agent', () => {
    it('agentExecute returns null gatedPublish → no event emitted', async () => {
      mockRunAgentPipeline.mockResolvedValue(NON_GATED_PIPELINE_RESULT);

      const step = buildStep();
      await capturedAgentExecuteHandler!({ event: { data: NON_GATED_EVENT_DATA }, step });

      // Assert: no gated_publish.requested event emitted
      const gatedCalls = (step.sendEvent.mock.calls as StepSendEventArgs[]).filter(
        ([_id, evt]) => evt.name === 'gated_publish.requested',
      );
      expect(gatedCalls).toHaveLength(0);
    });
  });

  describe('Test 3: Retry idempotency', () => {
    it('pipeline callback runs exactly ONCE; step.sendEvent uses stable step ID', async () => {
      mockRunAgentPipeline.mockResolvedValue(GATED_PIPELINE_RESULT);

      // ── First invocation (original run) ──────────────────────────────────────
      const stepFirst = buildStep();
      await capturedAgentExecuteHandler!({ event: { data: GATED_EVENT_DATA }, step: stepFirst });

      // Pipeline was called once on the first run
      expect(mockRunAgentPipeline).toHaveBeenCalledTimes(1);

      const gatedCallsFirst = (stepFirst.sendEvent.mock.calls as StepSendEventArgs[]).filter(
        ([_id, evt]) => evt.name === 'gated_publish.requested',
      );
      expect(gatedCallsFirst).toHaveLength(1);
      const firstStepId = gatedCallsFirst[0]![0];

      // ── Second invocation (retry — step.run replays cached result) ────────────
      // Simulate Inngest replay: step.run returns the cached value without invoking
      // the callback. The pipeline step result is replayed from the event log.
      const cachedPipelineReturn = {
        jobId: 'job-gated-001',
        status: 'succeeded' as const,
        totalCostUsd: 0.05,
        durationMs: 12000,
        gatedPublish: GATED_PIPELINE_RESULT.gatedPublish,
      };
      const stepRetry = buildStep(cachedPipelineReturn);
      await capturedAgentExecuteHandler!({ event: { data: GATED_EVENT_DATA }, step: stepRetry });

      // Pipeline MUST NOT be called again (replayed from step cache)
      expect(mockRunAgentPipeline).toHaveBeenCalledTimes(1);

      const gatedCallsRetry = (stepRetry.sendEvent.mock.calls as StepSendEventArgs[]).filter(
        ([_id, evt]) => evt.name === 'gated_publish.requested',
      );
      expect(gatedCallsRetry).toHaveLength(1);
      const retryStepId = gatedCallsRetry[0]![0];

      // CRITICAL: same step ID → Inngest platform deduplicates the send.
      // This test validates that our code USES the memoized step API correctly.
      // The Inngest platform enforces the actual deduplication — we are testing
      // that our handlers call step.sendEvent with a stable, deterministic ID
      // so that deduplication can work.
      expect(retryStepId).toBe(firstStepId);
      expect(retryStepId).toBe('emit-gated-publish');
    });
  });

  describe('Test 4: approval.rejected wiring', () => {
    it('customerSuccessOnApprovalRejected consumes approval.rejected with correct trigger', async () => {
      // Construct ApprovalRejectedData exactly as approvals/_actions.ts does
      const rejectedData: ApprovalRejectedData = {
        approvalId: 'approval-queue-001',
        kind: 'blog_post_draft',
        customerId: USER_ID,
        actedAt: new Date().toISOString(),
      };

      // Mock runCustomerSuccessNudge to verify it was called with correct trigger
      mockRunCustomerSuccessNudge.mockResolvedValue({
        kind: 'nudge_sent',
        messageId: 'msg-001',
      });

      const step = buildStep();
      await capturedCustomerSuccessOnApprovalRejectedHandler!(
        { event: { data: rejectedData }, step },
      );

      // Assert: runCustomerSuccessNudge was called with trigger='approval_rejected'
      const nudgeCalls = mockRunCustomerSuccessNudge.mock.calls;
      expect(nudgeCalls).toHaveLength(1);

      const nudgeConfig = nudgeCalls[0]?.[0] as any;
      expect(nudgeConfig).toHaveProperty('trigger', 'approval_rejected');
      expect(nudgeConfig).toHaveProperty('customerId', USER_ID);
    });
  });

  describe('Test 5: deliverables.over_cap wiring', () => {
    it('customerSuccessOnOverCap consumes deliverables.over_cap with correct trigger', async () => {
      // Construct DeliverablesOverCapData exactly as consumeDeliverable does
      const overCapData: DeliverablesOverCapData = {
        customerId: USER_ID,
        kind: 'blog_posts',
        currentCount: 3,
        cap: 3,
        occurredAt: new Date().toISOString(),
      };

      // Mock runCustomerSuccessNudge to verify it was called with correct trigger
      mockRunCustomerSuccessNudge.mockResolvedValue({
        kind: 'nudge_sent',
        messageId: 'msg-002',
      });

      const step = buildStep();
      await capturedCustomerSuccessOnOverCapHandler!(
        { event: { data: overCapData }, step },
      );

      // Assert: runCustomerSuccessNudge was called with trigger='deliverables_over_cap'
      const nudgeCalls = mockRunCustomerSuccessNudge.mock.calls;
      expect(nudgeCalls).toHaveLength(1);

      const nudgeConfig = nudgeCalls[0]?.[0] as any;
      expect(nudgeConfig).toHaveProperty('trigger', 'deliverables_over_cap');
      expect(nudgeConfig).toHaveProperty('customerId', USER_ID);
      expect(nudgeConfig.weeklyContext).toHaveProperty('concerns');
    });
  });
});
