/**
 * Tests for approval-gate-writer Inngest function.
 *
 * Test matrix:
 *   1. fn id and event binding are correct.
 *   2. emitCostAlert → step.sendEvent called with 'cost.alert' and correct shape.
 *   3. emitApprovalCreated → step.sendEvent called with 'approval.created' and correct shape.
 *   4. Aborted outcome (e.g. missing_brief) → no downstream events emitted.
 *
 * Note: step.sendEvent is called OUTSIDE step.run (accumulated in pendingEvents),
 * so this test validates the flush loop after runApprovalGateWriter resolves.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock @supabase/supabase-js before importing the module under test
// ---------------------------------------------------------------------------
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Mock the approval-gate-writer agent — we test the Inngest wiring, not the agent
// ---------------------------------------------------------------------------
const mockRunApprovalGateWriter = vi.fn();
const mockMapArtifactToKind = vi.fn();

vi.mock('../../lib/agents/approval-gate-writer/index', () => ({
  runApprovalGateWriter: mockRunApprovalGateWriter,
  mapArtifactToKind: mockMapArtifactToKind,
}));

// ---------------------------------------------------------------------------
// Capture the Inngest function handler via a createFunction mock
// ---------------------------------------------------------------------------
type InngestHandler = (ctx: {
  event: { data: Record<string, unknown> };
  step: {
    run: (name: string, fn: () => Promise<unknown>) => Promise<unknown>;
    sendEvent: (id: string, event: { name: string; data: unknown }) => Promise<void>;
  };
}) => Promise<unknown>;

let capturedHandler: InngestHandler | null = null;
let capturedConfig: { id: string; retries?: number; concurrency?: { key: string; limit: number } } | null = null;
let capturedEvent: { event: string } | null = null;

vi.mock('../client', () => ({
  inngest: {
    createFunction: vi.fn(
      (
        config: { id: string; retries?: number; concurrency?: { key: string; limit: number } },
        trigger: { event: string },
        handler: InngestHandler,
      ) => {
        capturedConfig = config;
        capturedEvent = trigger;
        capturedHandler = handler;
        return { id: config.id };
      },
    ),
  },
}));

// Import after mocks are in place
await import('./approval-gate-writer');

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const BASE_EVENT_DATA = {
  customerId: 'cust-001',
  artifactType: 'faq' as const,
  artifactId: 'artifact-001',
  artifactPreview: 'Q: How does shipping work? A: Ships in 24 hours.',
  whyThisMatters: 'Answers top AI search query for this business.',
  publishTarget: 'your blog at /faq',
  riskFlags: [] as string[],
};

const QUEUED_OUTCOME = {
  kind: 'queued' as const,
  approvalQueueId: 'aq-001',
  approvalToken: 'tok-001',
  draft: {
    title: 'FAQ ready to publish',
    value_one_liner: 'Lifts mentions on ChatGPT.',
    preview: 'Q: How does shipping work?...',
    approve_label: 'Publish',
    change_label: 'Edit',
    reject_label: 'Skip',
  },
  costUsd: 0.001,
  late_ymyl_catch: false,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a minimal step mock. `run` executes the callback immediately (simulating
 * a resolved step). `sendEvent` is a spy.
 */
function buildStep() {
  const sendEvent = vi.fn().mockResolvedValue(undefined);
  const run = vi.fn().mockImplementation(async (_name: string, fn: () => Promise<unknown>) => fn());
  return { run, sendEvent };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('approval-gate-writer Inngest function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: agent returns a queued outcome without triggering cost alert
    mockRunApprovalGateWriter.mockResolvedValue(QUEUED_OUTCOME);
    mockMapArtifactToKind.mockReturnValue('content_publish');
  });

  it('1. fn id and event binding are correct', () => {
    expect(capturedConfig?.id).toBe('approval-gate-writer');
    expect(capturedEvent?.event).toBe('gated_publish.requested');
  });

  it('2. concurrency is keyed on customerId with limit 1', () => {
    expect(capturedConfig?.concurrency).toEqual({ key: 'event.data.customerId', limit: 1 });
  });

  it('3. retries is 2', () => {
    expect(capturedConfig?.retries).toBe(2);
  });

  it('4. emitApprovalCreated → step.sendEvent with approval.created and correct shape', async () => {
    // Arrange: agent calls emitApprovalCreated during its run
    mockRunApprovalGateWriter.mockImplementation(
      async (_input: unknown, deps: { emitApprovalCreated?: (p: Record<string, unknown>) => void }) => {
        if (deps.emitApprovalCreated) {
          deps.emitApprovalCreated({
            approvalQueueId: 'aq-001',
            approvalToken: 'tok-001',
            customerId: 'cust-001',
            artifactType: 'faq',
            artifactId: 'artifact-001',
            ymyl: false,
            expiresAt: '2026-06-07T00:00:00.000Z',
          });
        }
        return QUEUED_OUTCOME;
      },
    );
    mockMapArtifactToKind.mockReturnValue('content_publish');

    const step = buildStep();
    await capturedHandler!({ event: { data: BASE_EVENT_DATA }, step });

    // Find the step.sendEvent call for approval.created
    const approvalCall = step.sendEvent.mock.calls.find(
      ([_id, evt]: [string, { name: string }]) => evt.name === 'approval.created',
    );
    expect(approvalCall).toBeDefined();
    const [sendId, sentEvent] = approvalCall as [string, { name: string; data: Record<string, unknown> }];
    expect(sendId).toBe('emit-approval-created');
    expect(sentEvent.data).toMatchObject({
      approvalId: 'aq-001',
      kind: 'content_publish',
      customerId: 'cust-001',
    });
    expect(typeof sentEvent.data['createdAt']).toBe('string');
  });

  it('5. emitCostAlert → step.sendEvent with cost.alert and { customerId, feature, costUsd }', async () => {
    // Arrange: agent calls emitCostAlert during its run
    mockRunApprovalGateWriter.mockImplementation(
      async (_input: unknown, deps: { emitCostAlert?: (p: Record<string, unknown>) => void }) => {
        if (deps.emitCostAlert) {
          deps.emitCostAlert({
            customerId: 'cust-001',
            feature: 'approval_gate_writer',
            costUsd: 0.75,
          });
        }
        return QUEUED_OUTCOME;
      },
    );

    const step = buildStep();
    await capturedHandler!({ event: { data: BASE_EVENT_DATA }, step });

    const alertCall = step.sendEvent.mock.calls.find(
      ([_id, evt]: [string, { name: string }]) => evt.name === 'cost.alert',
    );
    expect(alertCall).toBeDefined();
    const [sendId, sentEvent] = alertCall as [string, { name: string; data: Record<string, unknown> }];
    expect(sendId).toBe('emit-cost-alert');
    expect(sentEvent.data).toEqual({
      customerId: 'cust-001',
      feature: 'approval_gate_writer',
      costUsd: 0.75,
    });
  });

  it('6. aborted outcome → no downstream events emitted', async () => {
    mockRunApprovalGateWriter.mockResolvedValue({
      kind: 'aborted',
      reason: 'missing_brief',
      costUsd: 0,
    });

    const step = buildStep();
    const result = await capturedHandler!({ event: { data: BASE_EVENT_DATA }, step }) as { outcome: { kind: string } };

    expect(step.sendEvent).not.toHaveBeenCalled();
    expect(result.outcome.kind).toBe('aborted');
  });

  it('7. result includes customerId and artifactId from the event', async () => {
    const step = buildStep();
    const result = await capturedHandler!({ event: { data: BASE_EVENT_DATA }, step }) as {
      customerId: string;
      artifactId: string;
    };

    expect(result.customerId).toBe('cust-001');
    expect(result.artifactId).toBe('artifact-001');
  });
});
