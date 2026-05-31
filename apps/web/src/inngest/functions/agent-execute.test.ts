/**
 * Tests for agent-execute Inngest function — gated_publish.requested producer.
 *
 * Test matrix:
 *   1. Gated agent + persisted artifact + valid customerId → gatedPublish non-null
 *      → step.sendEvent called ONCE with payload matching GatedPublishRequestedData.
 *      Asserts customerId = userId (schema-grounded: approval_queue.customer_id
 *      REFERENCES user_profiles(id) = auth.users.id = input.userId).
 *   2. Non-gated agent → gatedPublish null → no emit.
 *   3. Business with no linked customer (empty userId) → runner returns gatedPublish=null
 *      → no emit (skip is audited in runner.ts via console.warn).
 *   4. EXACTLY-ONCE: simulating Inngest retry (step.run replays cached result without
 *      re-invoking the pipeline callback) → step.sendEvent uses the SAME stable step ID
 *      'emit-gated-publish' on both invocations → Inngest platform deduplicates.
 *      pipeline callback is called exactly ONCE across both handler invocations.
 *   5. Function return value does not leak gatedPublish to the caller.
 *
 * customerId identity (schema-grounded):
 *   approval_queue.customer_id REFERENCES user_profiles(id) ON DELETE CASCADE
 *   user_profiles.id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
 *   Therefore: approval_queue.customer_id = user_profiles.id = auth.users.id = input.userId.
 *   Source: migrations 20260525000001_agency_tables.sql (line 124) +
 *           20260520100003_core_tables.sql (line 26).
 *   There is no separate `customers` table. user_profiles IS the customer identity table.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock @supabase/supabase-js before importing the module under test
// ---------------------------------------------------------------------------
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Mock runAgentPipeline — we test the Inngest wiring, not the pipeline internals
// ---------------------------------------------------------------------------
const mockRunAgentPipeline = vi.fn();

vi.mock('../../lib/agents', () => ({
  runAgentPipeline: mockRunAgentPipeline,
}));

// ---------------------------------------------------------------------------
// Capture the Inngest function handler via a createFunction mock
// ---------------------------------------------------------------------------
type StepSendEventArgs = [id: string, event: { name: string; data: unknown }];

type InngestHandler = (ctx: {
  event: { data: Record<string, unknown> };
  step: {
    run: (name: string, fn: () => Promise<unknown>) => Promise<unknown>;
    sendEvent: (id: string, event: { name: string; data: unknown }) => Promise<void>;
  };
}) => Promise<unknown>;

let capturedHandler: InngestHandler | null = null;

vi.mock('../client', () => ({
  inngest: {
    createFunction: vi.fn(
      (
        _config: unknown,
        _trigger: unknown,
        handler: InngestHandler,
      ) => {
        capturedHandler = handler;
        return { id: 'agent-execute' };
      },
    ),
  },
}));

// Import after mocks are in place
await import('./agent-execute');

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/** userId = auth.users.id = user_profiles.id = approval_queue.customer_id */
const USER_ID = 'user-001';

const GATED_EVENT_DATA = {
  jobId: 'job-001',
  agentType: 'authority_blog_strategist', // requiresApproval: true
  userId: USER_ID,
  businessId: 'biz-001',
  planTier: 'build',
  targetUrl: 'https://example.com/blog',
};

const NON_GATED_EVENT_DATA = {
  jobId: 'job-002',
  agentType: 'schema_generator', // requiresApproval: false
  userId: USER_ID,
  businessId: 'biz-001',
  planTier: 'discover',
};

/**
 * AgentPipelineResult for a gated agent with a valid customerId.
 * gatedPublish.customerId = userId — the runner sets this from input.userId,
 * which equals auth.users.id = user_profiles.id = approval_queue.customer_id FK target.
 */
const GATED_PIPELINE_RESULT = {
  output: {
    jobId: 'job-001',
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
    // Runner sets customerId = input.userId.
    // Schema proof: approval_queue.customer_id → user_profiles.id → auth.users.id.
    customerId: USER_ID,
    artifactType: 'blog_post' as const,
    artifactId: 'job-001',
    artifactPreview: 'Blog post content here…',
    whyThisMatters: 'Lifts AI search mentions for the target keyword cluster.',
    publishTarget: 'your blog at https://example.com/blog',
    riskFlags: [] as string[],
  },
};

/** AgentPipelineResult for a non-gated agent — gatedPublish is always null. */
const NON_GATED_PIPELINE_RESULT = {
  output: {
    jobId: 'job-002',
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
// Step mock builder
// ---------------------------------------------------------------------------

/**
 * Build a step mock. `run` executes the callback immediately (non-retry path).
 * `sendEvent` is a spy.
 *
 * @param replayResult - When provided, `run` returns this value without executing
 *   the callback. This simulates Inngest's replay on retry: the step result was
 *   already recorded in the event log, so the callback is not re-invoked.
 *   Only the surrounding handler code re-runs.
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

describe('agent-execute Inngest function — gated_publish.requested producer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. gated agent + valid customerId → step.sendEvent called once; customerId equals userId (schema-grounded)', async () => {
    // Schema: approval_queue.customer_id REFERENCES user_profiles(id) = auth.users.id = userId.
    // The runner sets gatedPublish.customerId = input.userId — this IS the correct FK target.
    mockRunAgentPipeline.mockResolvedValue(GATED_PIPELINE_RESULT);

    const step = buildStep();
    await capturedHandler!({ event: { data: GATED_EVENT_DATA }, step });

    const gatedCalls = (step.sendEvent.mock.calls as StepSendEventArgs[]).filter(
      ([_id, evt]) => evt.name === 'gated_publish.requested',
    );
    expect(gatedCalls).toHaveLength(1);

    const [sendId, sentEvent] = gatedCalls[0] as StepSendEventArgs;
    expect(sendId).toBe('emit-gated-publish');
    expect(sentEvent.name).toBe('gated_publish.requested');

    const payload = sentEvent.data as Record<string, unknown>;

    // CRITICAL assertion: customerId must equal userId.
    // Schema chain: approval_queue.customer_id → user_profiles.id → auth.users.id.
    // There is no separate customers table; user_profiles IS the customer identity.
    expect(payload['customerId']).toBe(USER_ID);
    expect(payload['customerId']).toBe(GATED_EVENT_DATA.userId);

    // Other payload fields
    expect(payload['artifactType']).toBe('blog_post');
    expect(payload['artifactId']).toBe('job-001');
    expect(typeof payload['artifactPreview']).toBe('string');
    expect(typeof payload['whyThisMatters']).toBe('string');
    expect(typeof payload['publishTarget']).toBe('string');
    expect(Array.isArray(payload['riskFlags'])).toBe(true);
  });

  it('2. non-gated agent → no step.sendEvent for gated_publish.requested', async () => {
    mockRunAgentPipeline.mockResolvedValue(NON_GATED_PIPELINE_RESULT);

    const step = buildStep();
    await capturedHandler!({ event: { data: NON_GATED_EVENT_DATA }, step });

    const gatedCalls = (step.sendEvent.mock.calls as StepSendEventArgs[]).filter(
      ([_id, evt]) => evt.name === 'gated_publish.requested',
    );
    expect(gatedCalls).toHaveLength(0);
  });

  it('3. business with no linked customer (empty userId) → runner returns gatedPublish=null → no emit', async () => {
    // In this schema there is no separate customers table.
    // "No linked customer" means the job's userId is empty/missing — the runner's
    // buildGatedPublishIntent guard catches this and returns gatedPublish=null,
    // logging the skip via console.warn for ops visibility.
    //
    // We simulate the runner's null result here (the runner's own guard is tested
    // separately; here we validate agent-execute correctly handles null gatedPublish).
    const resultWithNullGatedPublish = {
      ...GATED_PIPELINE_RESULT,
      gatedPublish: null,
    };
    mockRunAgentPipeline.mockResolvedValue(resultWithNullGatedPublish);

    const eventWithEmptyUserId = { ...GATED_EVENT_DATA, userId: '' };
    const step = buildStep();
    await capturedHandler!({ event: { data: eventWithEmptyUserId }, step });

    const gatedCalls = (step.sendEvent.mock.calls as StepSendEventArgs[]).filter(
      ([_id, evt]) => evt.name === 'gated_publish.requested',
    );
    // No emit — approval_queue requires a non-empty customer_id FK.
    expect(gatedCalls).toHaveLength(0);
  });

  it('4. EXACTLY-ONCE: on retry, pipeline callback runs once; step.sendEvent uses stable step ID', async () => {
    // This test proves the exactly-once mechanism.
    //
    // Inngest's step.sendEvent is deduped by step ID within a function run.
    // When agent-execute retries, Inngest replays completed steps from its event log
    // (step.run returns the cached result without re-invoking the callback).
    // The handler's outer code re-runs, and step.sendEvent is called again — but
    // with the SAME stable step ID, so the Inngest platform deduplicates it.
    //
    // What this test validates:
    //   - The pipeline callback (mockRunAgentPipeline) runs exactly ONCE across
    //     both handler invocations (the retry replays from cache, not re-executes).
    //   - step.sendEvent is called with the SAME stable step ID 'emit-gated-publish'
    //     on both the original run and the retry → Inngest can deduplicate by ID.

    mockRunAgentPipeline.mockResolvedValue(GATED_PIPELINE_RESULT);

    // ── First invocation (original run) ──────────────────────────────────────
    const stepFirst = buildStep();
    await capturedHandler!({ event: { data: GATED_EVENT_DATA }, step: stepFirst });

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
      jobId: 'job-001',
      status: 'succeeded' as const,
      totalCostUsd: 0.05,
      durationMs: 12000,
      gatedPublish: GATED_PIPELINE_RESULT.gatedPublish,
    };
    const stepRetry = buildStep(cachedPipelineReturn);
    await capturedHandler!({ event: { data: GATED_EVENT_DATA }, step: stepRetry });

    // Pipeline MUST NOT be called again (replayed from step cache)
    expect(mockRunAgentPipeline).toHaveBeenCalledTimes(1);

    const gatedCallsRetry = (stepRetry.sendEvent.mock.calls as StepSendEventArgs[]).filter(
      ([_id, evt]) => evt.name === 'gated_publish.requested',
    );
    expect(gatedCallsRetry).toHaveLength(1);
    const retryStepId = gatedCallsRetry[0]![0];

    // CRITICAL: same step ID → Inngest platform deduplicates the send.
    expect(retryStepId).toBe(firstStepId);
    expect(retryStepId).toBe('emit-gated-publish');

    // Payload is stable across runs (same gatedPublish from cache)
    const retryPayload = (gatedCallsRetry[0] as StepSendEventArgs)[1].data as Record<string, unknown>;
    expect(retryPayload['customerId']).toBe(USER_ID);
  });

  it('5. function return value does not expose gatedPublish to the caller', async () => {
    mockRunAgentPipeline.mockResolvedValue(GATED_PIPELINE_RESULT);

    const step = buildStep();
    const result = (await capturedHandler!({ event: { data: GATED_EVENT_DATA }, step })) as Record<
      string,
      unknown
    >;

    // The returned value must only contain summary fields — gatedPublish has already
    // been sent via step.sendEvent and must not leak to the caller.
    expect(result['jobId']).toBe('job-001');
    expect(result['status']).toBe('succeeded');
    expect(result['totalCostUsd']).toBeDefined();
    expect(result['durationMs']).toBeDefined();
    expect(result['gatedPublish']).toBeUndefined();
  });
});
