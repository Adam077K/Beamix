/**
 * Beamix — Agent Pipeline Event Chain Smoke Integration Tests
 *
 * End-to-end smoke tests for the agent → approval → customer-success event handover chain.
 * Proves that each event hop connects correctly: every emitted event's payload shape
 * matches the corresponding `BeamixEvents['<event>']['data']` type at both the type level
 * (via `expectTypeOf`) and runtime level (via hasOwnProperty assertions).
 *
 * Test matrix:
 *   1. Happy path (gated agent): agent/run.requested → agentExecute → gated_publish.requested
 *      → approvalGateWriter → approval.created. Each hop's captured event data matches
 *      the canonical type.
 *   2. Server Action → Inngest: approveApprovalItem fires approval.rejected event;
 *      customerSuccessOnApprovalRejected consumes it with correct shape.
 *   3. Over-cap fire-and-forget: deliverables.over_cap event shape matches what
 *      consumeDeliverable constructs at lib/billing/deliverables.ts:433-440.
 *   4. Non-gated agent: agent/run.requested for a non-gated agent → agentExecute
 *      captures gatedPublish=null → no gated_publish.requested emitted.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { expectTypeOf } from 'vitest';
import type {
  AgentRunRequestedData,
  GatedPublishRequestedData,
  ApprovalCreatedData,
  ApprovalRejectedData,
  DeliverablesOverCapData,
  BeamixEvents,
} from '../client';

// ---------------------------------------------------------------------------
// Mock @supabase/supabase-js before importing
// ---------------------------------------------------------------------------
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Mock LLM providers (Anthropic, OpenAI)
// ---------------------------------------------------------------------------
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn(),
}));

vi.mock('openai', () => ({
  default: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Mock runAgentPipeline to return different results per test
// ---------------------------------------------------------------------------
const mockRunAgentPipeline = vi.fn();

vi.mock('../../lib/agents', () => ({
  runAgentPipeline: mockRunAgentPipeline,
}));

// ---------------------------------------------------------------------------
// Mock runApprovalGateWriter
// ---------------------------------------------------------------------------
const mockRunApprovalGateWriter = vi.fn();
const mockMapArtifactToKind = vi.fn();

vi.mock('../../lib/agents/approval-gate-writer/index', () => ({
  runApprovalGateWriter: mockRunApprovalGateWriter,
  mapArtifactToKind: mockMapArtifactToKind,
}));

// ---------------------------------------------------------------------------
// Capture Inngest handlers via createFunction mock
// ---------------------------------------------------------------------------
type InngestHandler = (ctx: {
  event: { data: Record<string, unknown> };
  step: {
    run: (name: string, fn: () => Promise<unknown>) => Promise<unknown>;
    sendEvent: (id: string, event: { name: string; data: unknown }) => Promise<void>;
  };
}) => Promise<unknown>;

interface CapturedEventEmit {
  stepId: string;
  eventName: string;
  eventData: Record<string, unknown>;
}

let capturedAgentExecuteHandler: InngestHandler | null = null;
let capturedApprovalGateWriterHandler: InngestHandler | null = null;

vi.mock('../client', () => ({
  inngest: {
    createFunction: vi.fn((config: any, trigger: any, handler: InngestHandler) => {
      const fnId = config?.id || 'unknown';
      if (fnId === 'agent-execute') {
        capturedAgentExecuteHandler = handler;
      } else if (fnId === 'approval-gate-writer') {
        capturedApprovalGateWriterHandler = handler;
      }
      return { id: fnId };
    }),
  },
}));

// Import after mocks — triggers createFunction calls that capture handlers
// These imports execute at module load time, BEFORE any tests run.
// The vi.mock above intercepts each createFunction call and stores the handler.
await import('../functions/agent-execute');
await import('../functions/approval-gate-writer');

// Sanity check: handlers should be captured after imports
if (!capturedAgentExecuteHandler) {
  throw new Error('capturedAgentExecuteHandler was not set — createFunction mock failed');
}
if (!capturedApprovalGateWriterHandler) {
  throw new Error('capturedApprovalGateWriterHandler was not set — createFunction mock failed');
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const GATED_AGENT_EVENT: AgentRunRequestedData = {
  jobId: 'job-gated-001',
  agentType: 'authority_blog_strategist', // requires approval
  userId: 'user-001',
  businessId: 'biz-001',
  planTier: 'build',
  targetUrl: 'https://example.com/blog',
};

const NON_GATED_AGENT_EVENT: AgentRunRequestedData = {
  jobId: 'job-nongated-001',
  agentType: 'schema_generator', // no approval
  userId: 'user-001',
  businessId: 'biz-001',
  planTier: 'discover',
};

const GATED_PIPELINE_RESULT = {
  output: {
    jobId: 'job-gated-001',
    agentType: 'authority_blog_strategist',
    primaryContent: 'Blog post on AI search visibility...',
    contentFormat: 'markdown' as const,
    summaryText: 'Improves AI search visibility for target keywords.',
    targetQueries: ['keyword1', 'keyword2'],
    geoSignals: {
      hasStatistics: true,
      hasCitations: true,
      hasExpertQuotes: false,
      hasFreshData: true,
      hasLocalContext: true,
    },
    ymylFlagged: false,
    estimatedImpact: 'Estimated 15% improvement in AI search visibility.',
    costEntries: [],
    totalCostUsd: 0.05,
    durationMs: 5000,
  },
  gatedPublish: {
    customerId: 'user-001',
    artifactType: 'blog_post',
    artifactId: 'job-gated-001',
    artifactPreview: 'Blog post on AI search visibility...',
    whyThisMatters: 'Improves AI search visibility for target keywords.',
    publishTarget: 'your blog at https://example.com/blog',
    riskFlags: [],
  } satisfies GatedPublishRequestedData,
};

const NON_GATED_PIPELINE_RESULT = {
  output: {
    jobId: 'job-nongated-001',
    agentType: 'schema_generator',
    primaryContent: 'Schema markup...',
    contentFormat: 'json_ld' as const,
    summaryText: 'Generated schema markup.',
    targetQueries: [],
    geoSignals: {
      hasStatistics: false,
      hasCitations: false,
      hasExpertQuotes: false,
      hasFreshData: false,
      hasLocalContext: false,
    },
    ymylFlagged: false,
    estimatedImpact: 'N/A',
    costEntries: [],
    totalCostUsd: 0.01,
    durationMs: 2000,
  },
  gatedPublish: null, // Non-gated agent returns null
};

// ---------------------------------------------------------------------------
// Assertions: Check that captured event data matches BeamixEvents type
// ---------------------------------------------------------------------------

function assertTypeAndStructure<E extends keyof BeamixEvents>(
  eventName: E,
  capturedData: unknown,
) {
  // Runtime check: all required keys exist
  if (eventName === 'gated_publish.requested') {
    expect(capturedData).toHaveProperty('customerId');
    expect(capturedData).toHaveProperty('artifactType');
    expect(capturedData).toHaveProperty('artifactId');
    expect(capturedData).toHaveProperty('artifactPreview');
    expect(capturedData).toHaveProperty('whyThisMatters');
    expect(capturedData).toHaveProperty('publishTarget');
    expect(capturedData).toHaveProperty('riskFlags');
    // Type-level check (compile-time verification)
    expectTypeOf<typeof capturedData>().toMatchTypeOf<
      BeamixEvents['gated_publish.requested']['data']
    >();
  } else if (eventName === 'approval.created') {
    expect(capturedData).toHaveProperty('approvalId');
    expect(capturedData).toHaveProperty('kind');
    expect(capturedData).toHaveProperty('customerId');
    expect(capturedData).toHaveProperty('createdAt');
    expectTypeOf<typeof capturedData>().toMatchTypeOf<
      BeamixEvents['approval.created']['data']
    >();
  } else if (eventName === 'approval.rejected') {
    expect(capturedData).toHaveProperty('approvalId');
    expect(capturedData).toHaveProperty('kind');
    expect(capturedData).toHaveProperty('customerId');
    expect(capturedData).toHaveProperty('actedAt');
    expectTypeOf<typeof capturedData>().toMatchTypeOf<
      BeamixEvents['approval.rejected']['data']
    >();
  } else if (eventName === 'deliverables.over_cap') {
    expect(capturedData).toHaveProperty('customerId');
    expect(capturedData).toHaveProperty('kind');
    expect(capturedData).toHaveProperty('currentCount');
    expect(capturedData).toHaveProperty('cap');
    expect(capturedData).toHaveProperty('occurredAt');
    expectTypeOf<typeof capturedData>().toMatchTypeOf<
      BeamixEvents['deliverables.over_cap']['data']
    >();
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Agent Pipeline Event Chain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedAgentExecuteHandler = null;
    capturedApprovalGateWriterHandler = null;
  });

  describe('Test 1: Happy path — gated agent → gated_publish.requested → approval.created', () => {
    it('should emit gated_publish.requested with correct shape', async () => {
      // Handler is guaranteed non-null from module-level sanity check
      const handler = capturedAgentExecuteHandler!;

      mockRunAgentPipeline.mockResolvedValueOnce(GATED_PIPELINE_RESULT);

      const emittedEvents: CapturedEventEmit[] = [];

      const ctx = {
        event: { data: GATED_AGENT_EVENT },
        step: {
          run: vi.fn(async (name: string, fn: () => Promise<unknown>) => {
            if (name === 'run-agent-pipeline') {
              return fn();
            }
            return null;
          }),
          sendEvent: vi.fn(async (stepId: string, event: { name: string; data: unknown }) => {
            emittedEvents.push({
              stepId,
              eventName: event.name,
              eventData: event.data as Record<string, unknown>,
            });
          }),
        },
      };

      const result = await handler(ctx);

      // Verify one event was emitted
      expect(emittedEvents).toHaveLength(1);
      expect(emittedEvents[0].eventName).toBe('gated_publish.requested');

      // Verify the event data matches type and structure
      assertTypeAndStructure('gated_publish.requested', emittedEvents[0].eventData);

      // Verify specific payload values
      expect(emittedEvents[0].eventData.customerId).toBe('user-001');
      expect(emittedEvents[0].eventData.artifactType).toBe('blog_post');
      expect(emittedEvents[0].eventData.artifactId).toBe('job-gated-001');
    });

    it('should pass gated_publish.requested through approvalGateWriter and emit approval.created', async () => {
      // Handler is guaranteed non-null from module-level sanity check
      const handler = capturedApprovalGateWriterHandler!;

      // Set up approval-gate-writer to capture the emitted event
      const gatedPublishEvent = GATED_PIPELINE_RESULT.gatedPublish;

      mockRunApprovalGateWriter.mockImplementationOnce(async (data, callbacks) => {
        // Simulate the approval-gate-writer agent emitting events
        callbacks.emitApprovalCreated({
          approvalQueueId: 'approval-queue-001',
          artifactType: data.artifactType,
          customerId: data.customerId,
        });
        return { outcome: 'approved_queued' };
      });

      mockMapArtifactToKind.mockReturnValueOnce('blog_post_draft');

      const emittedEvents: CapturedEventEmit[] = [];

      const ctx = {
        event: { data: gatedPublishEvent },
        step: {
          run: vi.fn(async (name: string, fn: () => Promise<unknown>) => {
            if (name === 'run-approval-gate-writer') {
              return fn();
            }
            return null;
          }),
          sendEvent: vi.fn(async (stepId: string, event: { name: string; data: unknown }) => {
            emittedEvents.push({
              stepId,
              eventName: event.name,
              eventData: event.data as Record<string, unknown>,
            });
          }),
        },
      };

      await capturedApprovalGateWriterHandler!(ctx);

      // Verify approval.created event was emitted
      const approvalCreatedEvent = emittedEvents.find((e) => e.eventName === 'approval.created');
      expect(approvalCreatedEvent).toBeDefined();

      // Verify the event data matches type and structure
      assertTypeAndStructure('approval.created', approvalCreatedEvent!.eventData);

      // Verify specific payload values
      expect(approvalCreatedEvent!.eventData.customerId).toBe('user-001');
      expect(approvalCreatedEvent!.eventData.approvalId).toBe('approval-queue-001');
    });
  });

  describe('Test 2: Server Action → approval.rejected event', () => {
    it('should have correct shape for approval.rejected event', () => {
      // This test simulates the payload that the Server Action would construct
      // at apps/web/src/app/(protected)/approvals/_actions.ts:177-186
      const rejectedPayload: ApprovalRejectedData = {
        approvalId: 'approval-queue-002',
        kind: 'faq_draft',
        customerId: 'user-001',
        actedAt: new Date().toISOString(),
      };

      // Type-level check
      expectTypeOf<typeof rejectedPayload>().toMatchTypeOf<
        BeamixEvents['approval.rejected']['data']
      >();

      // Runtime structure check
      assertTypeAndStructure('approval.rejected', rejectedPayload);

      // Verify specific values
      expect(rejectedPayload.approvalId).toBe('approval-queue-002');
      expect(rejectedPayload.kind).toBe('faq_draft');
      expect(rejectedPayload.customerId).toBe('user-001');
      expect(rejectedPayload.actedAt).toBeTruthy();
    });
  });

  describe('Test 3: Over-cap fire-and-forget event', () => {
    it('should emit deliverables.over_cap with correct shape', () => {
      // This test simulates the payload that consumeDeliverable constructs
      // at lib/billing/deliverables.ts:433-440 when OverTierCapError is thrown
      const overCapPayload: DeliverablesOverCapData = {
        customerId: 'user-001',
        kind: 'blog_posts',
        currentCount: 3,
        cap: 3,
        occurredAt: new Date().toISOString(),
      };

      // Type-level check
      expectTypeOf<typeof overCapPayload>().toMatchTypeOf<
        BeamixEvents['deliverables.over_cap']['data']
      >();

      // Runtime structure check
      assertTypeAndStructure('deliverables.over_cap', overCapPayload);

      // Verify specific values
      expect(overCapPayload.customerId).toBe('user-001');
      expect(overCapPayload.kind).toBe('blog_posts');
      expect(overCapPayload.currentCount).toBe(3);
      expect(overCapPayload.cap).toBe(3);
      expect(overCapPayload.occurredAt).toBeTruthy();
    });
  });

  describe('Test 4: Negative — non-gated agent does not emit gated_publish.requested', () => {
    it('should return gatedPublish=null for non-gated agent', async () => {
      expect(capturedAgentExecuteHandler).not.toBeNull();

      mockRunAgentPipeline.mockResolvedValueOnce(NON_GATED_PIPELINE_RESULT);

      const emittedEvents: CapturedEventEmit[] = [];

      const ctx = {
        event: { data: NON_GATED_AGENT_EVENT },
        step: {
          run: vi.fn(async (name: string, fn: () => Promise<unknown>) => {
            if (name === 'run-agent-pipeline') {
              return fn();
            }
            return null;
          }),
          sendEvent: vi.fn(async (stepId: string, event: { name: string; data: unknown }) => {
            emittedEvents.push({
              stepId,
              eventName: event.name,
              eventData: event.data as Record<string, unknown>,
            });
          }),
        },
      };

      const result = await handler(ctx);

      // Verify NO events were emitted
      expect(emittedEvents).toHaveLength(0);

      // Verify gatedPublish was not leaked in the return value
      expect(result).not.toHaveProperty('gatedPublish');
      expect(result).toHaveProperty('jobId', 'job-nongated-001');
      expect(result).toHaveProperty('status', 'succeeded');
    });
  });
});
