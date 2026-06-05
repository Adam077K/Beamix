/**
 * Tests for scan-free Inngest function.
 *
 * Test matrix:
 *   (a) Happy path — all stages run in order; persist-results receives a
 *       FreeScanResults object with all 4 required keys; single 'engine-queries' step.
 *   (b) Stage-1 failure (research throws) → mark-failed writes status='failed'
 *       + error_message ≤500 chars; original error is re-thrown.
 *   (c) Engine partial failure (Promise.all short-circuits) → mark-failed.
 *   (d) Idempotency — handler called twice with same scan_id; research mock
 *       call count = 1 (second call replays from step cache).
 *   (e) Kill-switch active → check-budget marks failed with 'scanning_paused',
 *       NO engine calls made.
 *   (f) total_issues always equals sum of issue counts (ground truth, not LLM value).
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
// Mutable: controls whether kill switch reports paused
let mockKillSwitchPaused = false;

const mockEq = vi.fn().mockImplementation(() => ({ error: null }));
const mockMaybeSingle = vi.fn().mockImplementation(() => {
  if (mockKillSwitchPaused) {
    // paused_until set to far future
    return { data: { paused_until: new Date(Date.now() + 1_000_000).toISOString() }, error: null };
  }
  return { data: null, error: null };
});
const mockSelect = vi.fn().mockReturnValue({
  eq: vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle }),
});
const mockUpdate = vi.fn().mockImplementation((payload: Record<string, unknown>) => {
  capturedUpdates.push(payload);
  return { eq: mockEq };
});
const mockFrom = vi.fn().mockReturnValue({
  update: mockUpdate,
  select: mockSelect,
});

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
  resolveOpenRouterKey: vi.fn().mockReturnValue('test-key'),
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

const MOCK_ENGINE_RESULTS: [EngineRawResult, EngineRawResult, EngineRawResult] = [
  { engine: 'chatgpt', is_mentioned: true, rank_position: 2, sentiment: 'positive', raw_response: '{}' },
  { engine: 'gemini', is_mentioned: false, rank_position: null, sentiment: null, raw_response: '{}' },
  { engine: 'perplexity', is_mentioned: false, rank_position: null, sentiment: null, raw_response: '{}' },
];

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
  // LLM returns a wrong total — ground truth must be computed from issues
  total_issues: 99,
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
    mockKillSwitchPaused = false;

    // Re-wire mock chains after clearAllMocks
    mockEq.mockImplementation(() => ({ error: null }));
    mockMaybeSingle.mockImplementation(() => {
      if (mockKillSwitchPaused) {
        return { data: { paused_until: new Date(Date.now() + 1_000_000).toISOString() }, error: null };
      }
      return { data: null, error: null };
    });
    mockSelect.mockReturnValue({
      eq: vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle }),
    });
    mockUpdate.mockImplementation((payload: Record<string, unknown>) => {
      capturedUpdates.push(payload);
      return { eq: mockEq };
    });
    mockFrom.mockReturnValue({
      update: mockUpdate,
      select: mockSelect,
    });
  });

  it('(a) happy path — all stages run in order; single engine-queries step; FreeScanResults has all 4 keys', async () => {
    // 1: research, 2-4: chatgpt+gemini+perplexity (all inside engine-queries), 5: analysis
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

    // Check persist-results step was called with all 4 FreeScanResults keys
    const persistPayload = capturedUpdates.find((p) => p['status'] === 'complete');
    expect(persistPayload).toBeDefined();

    const persisted = persistPayload!['results'] as Record<string, unknown>;
    expect(persisted).toHaveProperty('issues');
    expect(persisted).toHaveProperty('total_issues');
    expect(persisted).toHaveProperty('engines_checked', 3);
    expect(persisted).toHaveProperty('visibility_score');
    expect(Array.isArray(persisted['issues'])).toBe(true);

    // Step IDs — single 'engine-queries' step (not 3 separate steps)
    const stepNames = (step.run.mock.calls as Array<[string]>).map(([name]) => name);
    expect(stepNames).toContain('check-budget');
    expect(stepNames).toContain('mark-running');
    expect(stepNames).toContain('perplexity-research');
    expect(stepNames).toContain('engine-queries');
    expect(stepNames).not.toContain('engine-chatgpt');
    expect(stepNames).not.toContain('engine-gemini');
    expect(stepNames).not.toContain('engine-perplexity');
    expect(stepNames).toContain('gemini-flash-analysis');
    expect(stepNames).toContain('persist-results');
  });

  it('(b) engine-stage failure → mark-failed is called + rethrows; error_message ≤500 chars', async () => {
    // Stage 1 (research) now never throws — it falls back internally on failure.
    // Use an engine-stage failure to exercise the mark-failed path.
    // Research succeeds (1 call), then ALL engine queries fail (3 calls).
    mockCallOpenRouter
      .mockResolvedValueOnce(makeORResponse(RESEARCH_JSON)) // research
      .mockRejectedValueOnce(new Error('OpenRouter 5xx error (openai/gpt-4o)')) // chatgpt
      .mockRejectedValueOnce(new Error('OpenRouter 5xx error (google/gemini-2.0-flash)')) // gemini
      .mockRejectedValueOnce(new Error('OpenRouter 5xx error (perplexity/llama)')) // perplexity

    const step = buildStep();

    await expect(
      capturedHandler!({ event: { data: SCAN_EVENT_DATA }, step }),
    ).rejects.toThrow();

    const stepNames = (step.run.mock.calls as Array<[string]>).map(([name]) => name);
    expect(stepNames).toContain('mark-failed');

    const failedPayload = capturedUpdates.find((p) => p['status'] === 'failed');
    expect(failedPayload).toBeDefined();
    expect(typeof failedPayload!['error_message']).toBe('string');
    // error_message must not exceed 500 chars
    expect((failedPayload!['error_message'] as string).length).toBeLessThanOrEqual(500);
  });

  it('(c) engine partial failure → mark-failed is called', async () => {
    mockCallOpenRouter
      .mockResolvedValueOnce(makeORResponse(RESEARCH_JSON))
      .mockResolvedValueOnce(makeORResponse(ENGINE_MENTIONED_JSON))
      .mockRejectedValueOnce(new Error('gemini timeout'))
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
    mockCallOpenRouter
      .mockResolvedValueOnce(makeORResponse(RESEARCH_JSON))
      .mockResolvedValueOnce(makeORResponse(ENGINE_MENTIONED_JSON))
      .mockResolvedValueOnce(makeORResponse(ENGINE_NOT_MENTIONED_JSON))
      .mockResolvedValueOnce(makeORResponse(ENGINE_NOT_MENTIONED_JSON))
      .mockResolvedValueOnce(makeORResponse(ANALYSIS_JSON));

    const stepFirst = buildStep();
    await capturedHandler!({ event: { data: SCAN_EVENT_DATA }, step: stepFirst });
    const callsAfterFirst = mockCallOpenRouter.mock.calls.length;
    expect(callsAfterFirst).toBe(5);

    // Second invocation: all steps replay from cache — no LLM calls
    const stepSecond = buildStep({
      'check-budget': false,
      'mark-running': undefined,
      'perplexity-research': MOCK_BUSINESS_CONTEXT,
      'engine-queries': MOCK_ENGINE_RESULTS,
      'gemini-flash-analysis': MOCK_FREE_SCAN_RESULTS,
      'persist-results': undefined,
    });

    await capturedHandler!({ event: { data: SCAN_EVENT_DATA }, step: stepSecond });

    // No new LLM calls — all replayed from step cache
    expect(mockCallOpenRouter.mock.calls.length).toBe(5);
  });

  it('(e) kill-switch active → check-budget marks scan failed with scanning_paused; NO engine calls', async () => {
    mockKillSwitchPaused = true;

    const step = buildStep();

    // Should throw NonRetriableError('scanning_paused')
    await expect(
      capturedHandler!({ event: { data: SCAN_EVENT_DATA }, step }),
    ).rejects.toThrow('scanning_paused');

    // check-budget step ran
    const stepNames = (step.run.mock.calls as Array<[string]>).map(([name]) => name);
    expect(stepNames).toContain('check-budget');

    // No engine calls — pipeline was gated before mark-running
    expect(mockCallOpenRouter).not.toHaveBeenCalled();

    // The free_scan row must have been marked failed with scanning_paused
    const failedPayload = capturedUpdates.find(
      (p) => p['status'] === 'failed' && p['error_message'] === 'scanning_paused',
    );
    expect(failedPayload).toBeDefined();
  });

  it('(f) total_issues always equals sum of issue counts — LLM-provided value ignored', async () => {
    // ANALYSIS_JSON has total_issues=99 (wrong), but issues=[{count:2}]
    // The pipeline must compute total_issues=2, not trust 99
    mockCallOpenRouter
      .mockResolvedValueOnce(makeORResponse(RESEARCH_JSON))
      .mockResolvedValueOnce(makeORResponse(ENGINE_MENTIONED_JSON))
      .mockResolvedValueOnce(makeORResponse(ENGINE_NOT_MENTIONED_JSON))
      .mockResolvedValueOnce(makeORResponse(ENGINE_NOT_MENTIONED_JSON))
      .mockResolvedValueOnce(makeORResponse(ANALYSIS_JSON));

    const step = buildStep();
    await capturedHandler!({ event: { data: SCAN_EVENT_DATA }, step });

    const persistPayload = capturedUpdates.find((p) => p['status'] === 'complete');
    expect(persistPayload).toBeDefined();

    const persisted = persistPayload!['results'] as { issues: Array<{ count: number }>; total_issues: number };
    const groundTruth = persisted.issues.reduce((s, i) => s + i.count, 0);

    // Must match ground truth (2), not LLM-provided value (99)
    expect(persisted.total_issues).toBe(groundTruth);
    expect(persisted.total_issues).toBe(2);
    expect(persisted.total_issues).not.toBe(99);
  });
});
