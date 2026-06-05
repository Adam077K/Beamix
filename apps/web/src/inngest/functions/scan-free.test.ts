/**
 * Tests for scan-free Inngest function.
 *
 * Test matrix:
 *   (a) Happy path — all stages called in order; persist-results receives
 *       a FreeScanResults object with all 4 required keys.
 *   (b) Stage 1 failure (research throws) → mark-failed writes status='failed'
 *       + error_message; original error is re-thrown.
 *   (c) Engine partial failure (Promise.all short-circuits) → mark-failed.
 *   (d) Idempotency — handler called twice with same scan_id; research mock
 *       call count = 1 (second call replays from step cache).
 *
 * Mocks:
 *   - @supabase/supabase-js — captured update payload via mock
 *   - openrouter-client — mocked at module boundary
 *   - inngest client — captures the handler via createFunction mock
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock @supabase/supabase-js
// ---------------------------------------------------------------------------

// Mutable refs to capture what gets passed to .update()
const capturedUpdates: Array<Record<string, unknown>> = [];

const mockEq = vi.fn().mockImplementation(() => ({ error: null }));
const mockUpdate = vi.fn().mockImplementation((payload: Record<string, unknown>) => {
  capturedUpdates.push(payload);
  return { eq: mockEq };
});
const mockFrom = vi.fn().mockReturnValue({ update: mockUpdate });

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({ from: mockFrom }),
}));

// ---------------------------------------------------------------------------
// Mock the OpenRouter client — this makes research/engine/analysis use mocks
// ---------------------------------------------------------------------------
const mockCallOpenRouter = vi.fn();

vi.mock('../../lib/scan/openrouter-client', () => ({
  callOpenRouter: mockCallOpenRouter,
  requireEnv: vi.fn().mockReturnValue('test-key'),
}));

// ---------------------------------------------------------------------------
// Capture the Inngest function handler via createFunction mock
// ---------------------------------------------------------------------------
interface StepMock {
  run: ReturnType<typeof vi.fn>;
}

type HandlerFn = (ctx: {
  event: { data: Record<string, unknown> };
  step: StepMock;
}) => Promise<unknown>;

let capturedHandler: HandlerFn | null = null;

vi.mock('../client', () => ({
  inngest: {
    createFunction: vi.fn(
      (_config: unknown, _trigger: unknown, handler: HandlerFn) => {
        capturedHandler = handler;
        return { id: 'scan-free' };
      },
    ),
  },
}));

// Import AFTER mocks so the module initialises with mocked dependencies
await import('./scan-free');

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

import type { BusinessContext, EngineRawResult } from '../../lib/scan/types';

const SCAN_EVENT_DATA = {
  scan_id: 'scan-001',
  business_name: 'Acme Dental',
  website_url: 'https://acmedental.com',
  email: 'test@acmedental.com',
  domain: 'acmedental.com',
  ip: '1.2.3.4',
};

const MOCK_BUSINESS_CONTEXT: BusinessContext = {
  business_name: 'Acme Dental',
  website_url: 'https://acmedental.com',
  business_summary: 'General dentistry practice.',
  key_services: ['cleanings', 'implants'],
  target_audience: 'local families',
  category: 'dental clinic',
  location: 'Tel Aviv',
};

const MOCK_ENGINE_RESULT_MENTIONED: EngineRawResult = {
  engine: 'chatgpt',
  is_mentioned: true,
  rank_position: 2,
  sentiment: 'positive',
  raw_response: '{}',
};

const MOCK_ENGINE_RESULT_NOT_MENTIONED: EngineRawResult = {
  engine: 'gemini',
  is_mentioned: false,
  rank_position: null,
  sentiment: null,
  raw_response: '{}',
};

const MOCK_PERPLEXITY_RESULT: EngineRawResult = {
  engine: 'perplexity',
  is_mentioned: false,
  rank_position: null,
  sentiment: null,
  raw_response: '{}',
};

const MOCK_FREE_SCAN_RESULTS = {
  issues: [{ category: 'Missing from AI answers', count: 2 }],
  total_issues: 2,
  engines_checked: 3,
  visibility_score: 33,
};

// ---------------------------------------------------------------------------
// OpenRouter response factory
// ---------------------------------------------------------------------------

function makeORResponse(text: string) {
  return { text, prompt_tokens: 10, completion_tokens: 10 };
}

const RESEARCH_JSON = JSON.stringify({
  business_name: 'Acme Dental',
  website_url: 'https://acmedental.com',
  business_summary: 'General dentistry practice.',
  key_services: ['cleanings', 'implants'],
  target_audience: 'local families',
  category: 'dental clinic',
  location: 'Tel Aviv',
});

const ENGINE_MENTIONED_JSON = JSON.stringify({
  recommendations: [],
  is_mentioned: true,
  rank_position: 2,
  sentiment: 'positive',
});

const ENGINE_NOT_MENTIONED_JSON = JSON.stringify({
  recommendations: [],
  is_mentioned: false,
  rank_position: null,
  sentiment: null,
});

const ANALYSIS_JSON = JSON.stringify({
  overall_score: 33,
  issues: [{ category: 'Missing from AI answers', count: 2 }],
  total_issues: 2,
});

// ---------------------------------------------------------------------------
// Step mock builder
// ---------------------------------------------------------------------------

/**
 * Build a step mock where .run() executes callbacks immediately.
 * When replayResults is provided, named steps replay those values without
 * executing the callback (simulates Inngest memoisation on retry).
 */
function buildStep(replayResults?: Record<string, unknown>) {
  const run = vi.fn().mockImplementation(async (name: string, fn: () => Promise<unknown>) => {
    if (replayResults && name in replayResults) {
      return replayResults[name];
    }
    return fn();
  });
  return { run };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('scan-free Inngest function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedUpdates.length = 0;
    // Re-wire mock chains after clearAllMocks
    mockEq.mockImplementation(() => ({ error: null }));
    mockUpdate.mockImplementation((payload: Record<string, unknown>) => {
      capturedUpdates.push(payload);
      return { eq: mockEq };
    });
    mockFrom.mockReturnValue({ update: mockUpdate });
  });

  it('(a) happy path — all stages run in order; persist-results writes FreeScanResults with all 4 keys', async () => {
    mockCallOpenRouter
      .mockResolvedValueOnce(makeORResponse(RESEARCH_JSON))
      .mockResolvedValueOnce(makeORResponse(ENGINE_MENTIONED_JSON))
      .mockResolvedValueOnce(makeORResponse(ENGINE_NOT_MENTIONED_JSON))
      .mockResolvedValueOnce(makeORResponse(ENGINE_NOT_MENTIONED_JSON))
      .mockResolvedValueOnce(makeORResponse(ANALYSIS_JSON));

    const step = buildStep();
    const result = (await capturedHandler!({ event: { data: SCAN_EVENT_DATA }, step })) as {
      scan_id: string;
    };

    // Return value
    expect(result.scan_id).toBe('scan-001');

    // Check that persist-results step was called with all 4 FreeScanResults keys
    const persistPayload = capturedUpdates.find((p) => p['status'] === 'complete');
    expect(persistPayload).toBeDefined();

    const persisted = persistPayload!['results'] as Record<string, unknown>;
    expect(persisted).toHaveProperty('issues');
    expect(persisted).toHaveProperty('total_issues');
    expect(persisted).toHaveProperty('engines_checked', 3);
    expect(persisted).toHaveProperty('visibility_score');
    expect(Array.isArray(persisted['issues'])).toBe(true);

    // Step IDs — verify named steps were called
    const stepNames = (step.run.mock.calls as Array<[string]>).map(([name]) => name);
    expect(stepNames).toContain('mark-running');
    expect(stepNames).toContain('perplexity-research');
    expect(stepNames).toContain('engine-chatgpt');
    expect(stepNames).toContain('engine-gemini');
    expect(stepNames).toContain('engine-perplexity');
    expect(stepNames).toContain('gemini-flash-analysis');
    expect(stepNames).toContain('persist-results');
  });

  it('(b) stage-1 failure → mark-failed is called + rethrows', async () => {
    // Research (first OpenRouter call) throws
    mockCallOpenRouter.mockRejectedValueOnce(new Error('Perplexity timeout'));

    const step = buildStep();

    await expect(
      capturedHandler!({ event: { data: SCAN_EVENT_DATA }, step }),
    ).rejects.toThrow('Perplexity timeout');

    // mark-failed step must have been called
    const stepNames = (step.run.mock.calls as Array<[string]>).map(([name]) => name);
    expect(stepNames).toContain('mark-failed');

    // mark-failed should have written status='failed'
    const failedPayload = capturedUpdates.find((p) => p['status'] === 'failed');
    expect(failedPayload).toBeDefined();
    expect(typeof failedPayload!['error_message']).toBe('string');
    // error_message must not exceed 500 chars
    expect((failedPayload!['error_message'] as string).length).toBeLessThanOrEqual(500);
  });

  it('(c) engine partial failure (gemini throws) → mark-failed is called', async () => {
    // Research succeeds
    mockCallOpenRouter
      .mockResolvedValueOnce(makeORResponse(RESEARCH_JSON))
      // chatgpt succeeds
      .mockResolvedValueOnce(makeORResponse(ENGINE_MENTIONED_JSON))
      // gemini fails
      .mockRejectedValueOnce(new Error('gemini timeout'))
      // perplexity may or may not be called (Promise.all rejects on first failure)
      .mockResolvedValueOnce(makeORResponse(ENGINE_NOT_MENTIONED_JSON));

    const step = buildStep();

    await expect(
      capturedHandler!({ event: { data: SCAN_EVENT_DATA }, step }),
    ).rejects.toThrow();

    const stepNames = (step.run.mock.calls as Array<[string]>).map(([name]) => name);
    expect(stepNames).toContain('mark-failed');
    expect(stepNames).toContain('mark-running');
  });

  it('(d) idempotency — second call with step cache replays; research called only once', async () => {
    // Set up 5 responses for the first full run
    mockCallOpenRouter
      .mockResolvedValueOnce(makeORResponse(RESEARCH_JSON))
      .mockResolvedValueOnce(makeORResponse(ENGINE_MENTIONED_JSON))
      .mockResolvedValueOnce(makeORResponse(ENGINE_NOT_MENTIONED_JSON))
      .mockResolvedValueOnce(makeORResponse(ENGINE_NOT_MENTIONED_JSON))
      .mockResolvedValueOnce(makeORResponse(ANALYSIS_JSON));

    // ── First invocation (full run) ──────────────────────────────────────
    const stepFirst = buildStep();
    await capturedHandler!({ event: { data: SCAN_EVENT_DATA }, step: stepFirst });

    const callsAfterFirst = mockCallOpenRouter.mock.calls.length;
    expect(callsAfterFirst).toBe(5);

    // ── Second invocation (replay — all steps return cached values) ───────
    const stepSecond = buildStep({
      'mark-running': undefined,
      'perplexity-research': MOCK_BUSINESS_CONTEXT,
      'engine-chatgpt': MOCK_ENGINE_RESULT_MENTIONED,
      'engine-gemini': MOCK_ENGINE_RESULT_NOT_MENTIONED,
      'engine-perplexity': MOCK_PERPLEXITY_RESULT,
      'gemini-flash-analysis': MOCK_FREE_SCAN_RESULTS,
      'persist-results': undefined,
    });

    await capturedHandler!({ event: { data: SCAN_EVENT_DATA }, step: stepSecond });

    // Research must NOT have been called again (replayed from cache)
    expect(mockCallOpenRouter.mock.calls.length).toBe(5);
  });
});
