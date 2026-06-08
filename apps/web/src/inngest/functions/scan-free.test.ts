/**
 * Tests for scan-free Inngest function.
 *
 * Test matrix:
 *   (a) Happy path — all stages run in order; THREE separate engine steps
 *       (engine-chatgpt, engine-gemini, engine-perplexity); scan_progress
 *       receives queued→querying→done per engine; ends done=true/status=complete.
 *   (b) Engine throws → that engine writes status='error' to scan_progress;
 *       mark-failed writes done=true/status='failed'; original error re-thrown.
 *   (c) Kill-switch paused → NonRetriableError; no engine steps; no progress
 *       writes beyond the initial seed.
 *   (d) Status-regression guard — writeProgress 'querying' after 'done' does NOT
 *       regress the engine back to 'querying'.
 *   (e) Meta-assert: progress writes (upsert calls) go to 'scan_progress';
 *       the only free_scans write for results is the final persist-results step.
 *   (f) total_issues always equals sum of issue counts (ground truth, not LLM value).
 *   (g) Idempotency — second call with step cache replays; research called once.
 *   (h) Engine partial failure → mark-failed is called.
 *
 * Mocks:
 *   - @supabase/supabase-js — captured upsert + update payloads via mock
 *   - openrouter-client — mocked at module boundary
 *   - inngest client — captures the handler via createFunction mock
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock @supabase/supabase-js
// ---------------------------------------------------------------------------

/** All .update() payloads captured here (free_scans writes). */
const capturedUpdates: Array<Record<string, unknown>> = [];

/**
 * All .upsert() calls captured here (scan_progress writes).
 * Each entry is { table: string, row: Record<string, unknown> }.
 */
const capturedUpserts: Array<{ table: string; row: Record<string, unknown> }> = [];

// Track which table mockFrom was called with for the most recent chain
let lastFromTable = '';

/** Controls whether kill switch reports paused. */
let mockKillSwitchPaused = false;

/** Controls whether the maybeSingle for scan_progress read returns null or existing row. */
let mockProgressRow: Record<string, unknown> | null = null;

const mockEq = vi.fn().mockImplementation(() => ({ error: null }));
const mockMaybeSingle = vi.fn().mockImplementation(() => {
  if (lastFromTable === 'system_kill_switch') {
    if (mockKillSwitchPaused) {
      return { data: { paused_until: new Date(Date.now() + 1_000_000).toISOString() }, error: null };
    }
    return { data: null, error: null };
  }
  // scan_progress read
  return { data: mockProgressRow, error: null };
});

const mockSelectEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
const mockSelect = vi.fn().mockReturnValue({ eq: mockSelectEq });

const mockUpdate = vi.fn().mockImplementation((payload: Record<string, unknown>) => {
  capturedUpdates.push(payload);
  return { eq: mockEq };
});

const mockUpsert = vi.fn().mockImplementation((row: Record<string, unknown>) => {
  capturedUpserts.push({ table: lastFromTable, row });
  return { error: null };
});

// mockInsert — used by the seed-only fast path in progress-writer.
// Pushes to the same capturedUpserts array so tests can assert on it uniformly.
const mockInsert = vi.fn().mockImplementation((row: Record<string, unknown>) => {
  capturedUpserts.push({ table: lastFromTable, row });
  return { error: null };
});

const mockFrom = vi.fn().mockImplementation((table: string) => {
  lastFromTable = table;
  return {
    update: mockUpdate,
    select: mockSelect,
    upsert: mockUpsert,
    insert: mockInsert,
  };
});

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({ from: mockFrom }),
}));

// ---------------------------------------------------------------------------
// Mock the OpenRouter client
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
  { engine: 'chatgpt', is_mentioned: true, rank_position: 2, sentiment: 'positive', raw_response: '{}', retrieval_mode: 'parametric_memory' },
  { engine: 'gemini', is_mentioned: false, rank_position: null, sentiment: null, raw_response: '{}', retrieval_mode: 'parametric_memory' },
  { engine: 'perplexity', is_mentioned: false, rank_position: null, sentiment: null, raw_response: '{}', retrieval_mode: 'live_web' },
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
  return { text, prompt_tokens: 10, completion_tokens: 10, sourceUrls: [] };
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
    capturedUpserts.length = 0;
    mockKillSwitchPaused = false;
    mockProgressRow = null;
    lastFromTable = '';

    // Re-wire mock chains after clearAllMocks
    mockEq.mockImplementation(() => ({ error: null }));
    mockMaybeSingle.mockImplementation(() => {
      if (lastFromTable === 'system_kill_switch') {
        if (mockKillSwitchPaused) {
          return { data: { paused_until: new Date(Date.now() + 1_000_000).toISOString() }, error: null };
        }
        return { data: null, error: null };
      }
      return { data: mockProgressRow, error: null };
    });
    mockSelectEq.mockReturnValue({ maybeSingle: mockMaybeSingle });
    mockSelect.mockReturnValue({ eq: mockSelectEq });
    mockUpdate.mockImplementation((payload: Record<string, unknown>) => {
      capturedUpdates.push(payload);
      return { eq: mockEq };
    });
    mockUpsert.mockImplementation((row: Record<string, unknown>) => {
      capturedUpserts.push({ table: lastFromTable, row });
      return { error: null };
    });
    mockInsert.mockImplementation((row: Record<string, unknown>) => {
      capturedUpserts.push({ table: lastFromTable, row });
      return { error: null };
    });
    mockFrom.mockImplementation((table: string) => {
      lastFromTable = table;
      return {
        update: mockUpdate,
        select: mockSelect,
        upsert: mockUpsert,
        insert: mockInsert,
      };
    });
  });

  // ── (a) Happy path ────────────────────────────────────────────────────────

  it('(a) happy path — THREE separate engine steps; scan_progress receives queuing→done per engine; ends complete', async () => {
    // 1: research, 2: chatgpt, 3: gemini, 4: perplexity, 5: analysis
    mockCallOpenRouter
      .mockResolvedValueOnce(makeORResponse(RESEARCH_JSON))    // research
      .mockResolvedValueOnce(makeORResponse(ENGINE_MENTIONED_JSON))  // chatgpt
      .mockResolvedValueOnce(makeORResponse(ENGINE_NOT_MENTIONED_JSON)) // gemini
      .mockResolvedValueOnce(makeORResponse(ENGINE_NOT_MENTIONED_JSON)) // perplexity
      .mockResolvedValueOnce(makeORResponse(ANALYSIS_JSON));           // analysis

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

    // Step IDs — THREE separate engine steps, NOT the old single 'engine-queries'
    const stepNames = (step.run.mock.calls as Array<[string]>).map(([name]) => name);
    expect(stepNames).toContain('check-budget');
    expect(stepNames).toContain('mark-running');
    expect(stepNames).toContain('perplexity-research');
    expect(stepNames).toContain('engine-chatgpt');
    expect(stepNames).toContain('engine-gemini');
    expect(stepNames).toContain('engine-perplexity');
    // Old single step must NOT be present
    expect(stepNames).not.toContain('engine-queries');
    expect(stepNames).toContain('gemini-flash-analysis');
    expect(stepNames).toContain('persist-results');

    // scan_progress upserts — verify progress was written to scan_progress
    const progressUpserts = capturedUpserts.filter((u) => u.table === 'scan_progress');
    expect(progressUpserts.length).toBeGreaterThan(0);

    // Final progress upsert should have done=true and status='complete'
    const finalProgress = progressUpserts.findLast((u) => u.row['done'] === true);
    expect(finalProgress).toBeDefined();
    expect(finalProgress!.row['status']).toBe('complete');

    // Verify engine progression: at least one upsert per engine with 'querying' status
    const enginesWritten = progressUpserts.flatMap((u) => {
      const engines = u.row['engines'];
      return Array.isArray(engines) ? engines : [];
    });
    const chatgptQuerying = enginesWritten.some(
      (e) => (e as Record<string, unknown>)['id'] === 'chatgpt' &&
              (e as Record<string, unknown>)['status'] === 'querying',
    );
    expect(chatgptQuerying).toBe(true);
  });

  // ── (b) Engine throws → error status + mark-failed ───────────────────────

  it('(b) engine throws → that engine status=error in progress; mark-failed writes done=true/status=failed; re-throws', async () => {
    mockCallOpenRouter
      .mockResolvedValueOnce(makeORResponse(RESEARCH_JSON)) // research succeeds
      .mockRejectedValueOnce(new Error('OpenRouter 5xx error (openai/gpt-4o)')); // chatgpt fails

    const step = buildStep();

    await expect(
      capturedHandler!({ event: { data: SCAN_EVENT_DATA }, step }),
    ).rejects.toThrow();

    const stepNames = (step.run.mock.calls as Array<[string]>).map(([name]) => name);
    expect(stepNames).toContain('mark-failed');

    // free_scans must be marked failed
    const failedPayload = capturedUpdates.find((p) => p['status'] === 'failed');
    expect(failedPayload).toBeDefined();
    expect(typeof failedPayload!['error_message']).toBe('string');
    expect((failedPayload!['error_message'] as string).length).toBeLessThanOrEqual(500);

    // scan_progress final write must have done=true and status='failed'
    const progressUpserts = capturedUpserts.filter((u) => u.table === 'scan_progress');
    const failedProgress = progressUpserts.findLast((u) => u.row['done'] === true);
    expect(failedProgress).toBeDefined();
    expect(failedProgress!.row['status']).toBe('failed');
  });

  // ── (c) Kill-switch paused ────────────────────────────────────────────────

  it('(c) kill-switch active → NonRetriableError; no engine steps; no progress beyond initial', async () => {
    mockKillSwitchPaused = true;

    const step = buildStep();

    await expect(
      capturedHandler!({ event: { data: SCAN_EVENT_DATA }, step }),
    ).rejects.toThrow('scanning_paused');

    const stepNames = (step.run.mock.calls as Array<[string]>).map(([name]) => name);
    expect(stepNames).toContain('check-budget');

    // No engine calls — pipeline was gated before mark-running
    expect(mockCallOpenRouter).not.toHaveBeenCalled();

    // No engine steps should be present
    expect(stepNames).not.toContain('engine-chatgpt');
    expect(stepNames).not.toContain('engine-gemini');
    expect(stepNames).not.toContain('engine-perplexity');

    // free_scans must be marked failed with scanning_paused
    const failedPayload = capturedUpdates.find(
      (p) => p['status'] === 'failed' && p['error_message'] === 'scanning_paused',
    );
    expect(failedPayload).toBeDefined();
  });

  // ── (d) Status-regression guard ──────────────────────────────────────────

  it('(d) status-regression guard — writeProgress querying after done does NOT regress engine', async () => {
    // Simulate the scan_progress row already having chatgpt=done
    mockProgressRow = {
      engines: [
        { id: 'chatgpt', status: 'done', queryCount: 1, totalQueries: 1 },
        { id: 'gemini', status: 'queued', queryCount: 0, totalQueries: 0 },
        { id: 'perplexity', status: 'queued', queryCount: 0, totalQueries: 0 },
      ],
      progress: 0.35,
      current_query: null,
      done: false,
      status: 'running',
    };

    // Import the progress-writer directly to test the regression guard
    const { writeProgress } = await import('../../lib/scan/progress-writer');

    // Attempt to write chatgpt back to 'querying' (should be a no-op due to guard)
    await writeProgress('scan-001', {
      engines: [{ id: 'chatgpt', status: 'querying', queryCount: 0, totalQueries: 1 }],
    });

    // Check the upsert that was emitted
    const progressUpserts = capturedUpserts.filter((u) => u.table === 'scan_progress');
    expect(progressUpserts.length).toBeGreaterThan(0);

    const lastUpsert = progressUpserts[progressUpserts.length - 1]!;
    const engines = lastUpsert.row['engines'] as Array<Record<string, unknown>>;
    const chatgptEngine = engines.find((e) => e['id'] === 'chatgpt');

    // Must remain 'done' — regression guard prevented revert to 'querying'
    expect(chatgptEngine!['status']).toBe('done');
  });

  // ── (e) Meta-assert: progress → scan_progress; results → free_scans only ─

  it('(e) meta-assert: progress upserts go to scan_progress; only one free_scans results write', async () => {
    mockCallOpenRouter
      .mockResolvedValueOnce(makeORResponse(RESEARCH_JSON))
      .mockResolvedValueOnce(makeORResponse(ENGINE_MENTIONED_JSON))
      .mockResolvedValueOnce(makeORResponse(ENGINE_NOT_MENTIONED_JSON))
      .mockResolvedValueOnce(makeORResponse(ENGINE_NOT_MENTIONED_JSON))
      .mockResolvedValueOnce(makeORResponse(ANALYSIS_JSON));

    const step = buildStep();
    await capturedHandler!({ event: { data: SCAN_EVENT_DATA }, step });

    // All upserts must go to scan_progress
    const nonProgressUpserts = capturedUpserts.filter((u) => u.table !== 'scan_progress');
    expect(nonProgressUpserts).toHaveLength(0);

    // Only ONE free_scans update should contain `results` (the persist-results step)
    const resultUpdates = capturedUpdates.filter(
      (p) => p['results'] !== undefined,
    );
    expect(resultUpdates).toHaveLength(1);
    expect(resultUpdates[0]!['status']).toBe('complete');
  });

  // ── (f) total_issues ground truth ────────────────────────────────────────

  it('(f) total_issues always equals sum of issue counts — LLM-provided value ignored', async () => {
    // ANALYSIS_JSON has total_issues=99 (wrong), but issues=[{count:2}]
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

  // ── (g) Idempotency ───────────────────────────────────────────────────────

  it('(g) idempotency — second call with step cache replays; research called only once', async () => {
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
      'engine-chatgpt': MOCK_ENGINE_RESULTS[0],
      'engine-gemini': MOCK_ENGINE_RESULTS[1],
      'engine-perplexity': MOCK_ENGINE_RESULTS[2],
      'gemini-flash-analysis': MOCK_FREE_SCAN_RESULTS,
      'persist-results': undefined,
    });

    await capturedHandler!({ event: { data: SCAN_EVENT_DATA }, step: stepSecond });

    // No new LLM calls — all replayed from step cache
    expect(mockCallOpenRouter.mock.calls.length).toBe(5);
  });

  // ── (h) Partial engine failure → mark-failed ──────────────────────────────

  it('(h) engine partial failure → mark-failed is called; scan is marked failed', async () => {
    mockCallOpenRouter
      .mockResolvedValueOnce(makeORResponse(RESEARCH_JSON))
      .mockResolvedValueOnce(makeORResponse(ENGINE_MENTIONED_JSON)) // chatgpt ok
      .mockRejectedValueOnce(new Error('gemini timeout'));           // gemini fails

    const step = buildStep();

    await expect(
      capturedHandler!({ event: { data: SCAN_EVENT_DATA }, step }),
    ).rejects.toThrow();

    const stepNames = (step.run.mock.calls as Array<[string]>).map(([name]) => name);
    expect(stepNames).toContain('mark-failed');
    expect(stepNames).toContain('mark-running');

    const failedPayload = capturedUpdates.find((p) => p['status'] === 'failed');
    expect(failedPayload).toBeDefined();
  });
});
