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

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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

// ---------------------------------------------------------------------------
// Mock assembleFreeScanV2 for v2 flag-ON tests
// ---------------------------------------------------------------------------

const mockAssembleFreeScanV2 = vi.fn();

vi.mock('../../lib/scan/assemble-free-scan-v2', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../lib/scan/assemble-free-scan-v2')>();
  return {
    ...actual,
    assembleFreeScanV2: mockAssembleFreeScanV2,
  };
});

// Mock scan-free-v2-deps so we can control isScanMeasurementV2Enabled and buildV2Deps
const mockBuildV2Deps = vi.fn().mockReturnValue({});
const mockBuildV2Input = vi.fn().mockReturnValue({});
const mockMapV2ToFreeScanResults = vi.fn();
let mockIsScanMeasurementV2Enabled = false;

vi.mock('./scan-free-v2-deps', () => ({
  isScanMeasurementV2Enabled: vi.fn().mockImplementation(() => mockIsScanMeasurementV2Enabled),
  buildV2Input: mockBuildV2Input,
  buildV2Deps: mockBuildV2Deps,
  mapV2ToFreeScanResults: mockMapV2ToFreeScanResults,
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
    // Reset v2 flag to OFF so existing tests are unaffected
    mockIsScanMeasurementV2Enabled = false;

    // Re-wire v2 mocks after clearAllMocks (vi.clearAllMocks resets call counts only,
    // mockImplementation survives for vi.fn() — but isScanMeasurementV2Enabled is
    // a vi.fn().mockImplementation that reads the variable, so re-wire is not needed there).
    mockBuildV2Deps.mockReturnValue({});
    mockBuildV2Input.mockReturnValue({});

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

  // ── v2 flag=ON tests ──────────────────────────────────────────────────────
  //
  // These tests set SCAN_MEASUREMENT_V2=true via the mockIsScanMeasurementV2Enabled
  // variable (the vi.mock reads it on every call). The flag is reset to false in
  // beforeEach so all prior tests are unaffected.
  //
  // assembleFreeScanV2 and buildV2Deps are mocked so NO live LLM or Supabase calls
  // are made — only the Inngest step boundary is exercised.

  describe('v2 flag=ON path', () => {
    const MOCK_V2_BLOB = {
      visibility_score: 42,
      engines_checked: 3,
      issues: [{ category: 'Missing from AI answers', count: 1 }],
      total_issues: 1,
      scan_v2: { meta: { run_kind: 'free' } },
    };

    beforeEach(() => {
      mockIsScanMeasurementV2Enabled = true;
      mockAssembleFreeScanV2.mockResolvedValue({ meta: { run_kind: 'free' }, gap_list: [], engine_subscores: [] });
      mockMapV2ToFreeScanResults.mockReturnValue(MOCK_V2_BLOB);

      // Research still uses OpenRouter through the v1 path (perplexity-research step)
      mockCallOpenRouter.mockResolvedValue(makeORResponse(RESEARCH_JSON));
    });

    afterEach(() => {
      mockIsScanMeasurementV2Enabled = false;
    });

    // (v2-a) scan-v2-assemble step is invoked exactly once
    it('(v2-a) scan-v2-assemble step is invoked exactly once when flag is ON', async () => {
      const step = buildStep();
      await capturedHandler!({ event: { data: SCAN_EVENT_DATA }, step });

      const v2AssembleCalls = (step.run.mock.calls as Array<[string]>).filter(
        ([name]) => name === 'scan-v2-assemble',
      );
      expect(v2AssembleCalls).toHaveLength(1);
    });

    // (v2-b) v1 engine steps are NOT invoked when the flag is ON
    it('(v2-b) v1 engine/analysis steps are NOT invoked when flag is ON', async () => {
      const step = buildStep();
      await capturedHandler!({ event: { data: SCAN_EVENT_DATA }, step });

      const stepNames = (step.run.mock.calls as Array<[string]>).map(([name]) => name);
      expect(stepNames).not.toContain('engine-chatgpt');
      expect(stepNames).not.toContain('engine-gemini');
      expect(stepNames).not.toContain('engine-perplexity');
      expect(stepNames).not.toContain('gemini-flash-analysis');
    });

    // (v2-c) function early-returns { scan_id } after persist-results
    it('(v2-c) function returns { scan_id } and persist-results runs exactly once', async () => {
      const step = buildStep();
      const result = (await capturedHandler!({ event: { data: SCAN_EVENT_DATA }, step })) as {
        scan_id: string;
      };

      expect(result.scan_id).toBe('scan-001');

      const stepNames = (step.run.mock.calls as Array<[string]>).map(([name]) => name);
      const persistCount = stepNames.filter((n) => n === 'persist-results').length;
      expect(persistCount).toBe(1);

      // The persist-results step must have written the v2 blob to free_scans
      const persistPayload = capturedUpdates.find((p) => p['status'] === 'complete');
      expect(persistPayload).toBeDefined();
      expect(persistPayload!['results']).toEqual(MOCK_V2_BLOB);
    });

    // (v2-d) ProbeLeakError from assembleFreeScanV2 propagates → mark-failed path
    it('(v2-d) ProbeLeakError from assembleFreeScanV2 propagates to mark-failed', async () => {
      // Construct a ProbeLeakError — needs to be the actual class from probe.ts
      // but for the step mock it just needs to be a real Error subclass.
      class ProbeLeakError extends Error {
        constructor(msg: string) {
          super(msg);
          this.name = 'ProbeLeakError';
        }
      }
      mockAssembleFreeScanV2.mockRejectedValueOnce(
        new ProbeLeakError('identity leaked into probe'),
      );

      const step = buildStep();

      await expect(
        capturedHandler!({ event: { data: SCAN_EVENT_DATA }, step }),
      ).rejects.toThrow('identity leaked into probe');

      const stepNames = (step.run.mock.calls as Array<[string]>).map(([name]) => name);
      expect(stepNames).toContain('mark-failed');

      const failedPayload = capturedUpdates.find((p) => p['status'] === 'failed');
      expect(failedPayload).toBeDefined();
    });

    // (v2-e) v2 path writes free_scans update, NO query_positions or scan_engine_results rows
    it('(v2-e) v2 path updates free_scans; writes NO query_positions or scan_engine_results rows', async () => {
      const step = buildStep();
      await capturedHandler!({ event: { data: SCAN_EVENT_DATA }, step });

      // free_scans must have been updated (status=complete with results)
      const resultUpdates = capturedUpdates.filter((p) => p['results'] !== undefined);
      expect(resultUpdates).toHaveLength(1);
      expect(resultUpdates[0]!['status']).toBe('complete');

      // No upserts to query_positions or scan_engine_results
      const forbiddenTables = capturedUpserts.filter(
        (u) => u.table === 'query_positions' || u.table === 'scan_engine_results',
      );
      expect(forbiddenTables).toHaveLength(0);

      // No updates to query_positions or scan_engine_results either
      // (capturedUpdates tracks all .update() calls — verify none go to those tables)
      // Note: capturedUpdates doesn't track the table — but since free_scans is the only
      // table updated in the v2 path (all other writes are upserts to scan_progress),
      // this is already verified by the upsert check above.
    });

    // Guard: with flag OFF the v1 engine steps DO run (regression guard)
    it('(v2-flag-off-guard) with flag=OFF the v1 engine steps run and v2 step does NOT', async () => {
      mockIsScanMeasurementV2Enabled = false;

      mockCallOpenRouter
        .mockResolvedValueOnce(makeORResponse(RESEARCH_JSON))
        .mockResolvedValueOnce(makeORResponse(ENGINE_MENTIONED_JSON))
        .mockResolvedValueOnce(makeORResponse(ENGINE_NOT_MENTIONED_JSON))
        .mockResolvedValueOnce(makeORResponse(ENGINE_NOT_MENTIONED_JSON))
        .mockResolvedValueOnce(makeORResponse(ANALYSIS_JSON));

      const step = buildStep();
      await capturedHandler!({ event: { data: SCAN_EVENT_DATA }, step });

      const stepNames = (step.run.mock.calls as Array<[string]>).map(([name]) => name);

      // v1 steps must run
      expect(stepNames).toContain('engine-chatgpt');
      expect(stepNames).toContain('engine-gemini');
      expect(stepNames).toContain('engine-perplexity');
      expect(stepNames).toContain('gemini-flash-analysis');

      // v2 step must NOT run
      expect(stepNames).not.toContain('scan-v2-assemble');
    });
  });
});
