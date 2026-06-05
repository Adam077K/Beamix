/**
 * Unit tests for the analysis stage (Stage 3).
 *
 * Pure unit — mocks OpenRouter at the openrouter-client boundary.
 * Tests:
 *   (1) 3 EngineRawResults with multiple is_mentioned=false → issues.length > 0
 *   (2) overall_score is always in range [0, 100]
 *   (3) all FreeScanResults keys present
 *   (4) engines_checked is always 3
 *   (5) LLM parse failure → returns fallback with non-empty issues
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock the OpenRouter client
// ---------------------------------------------------------------------------
const mockCallOpenRouter = vi.fn();

vi.mock('./openrouter-client', () => ({
  callOpenRouter: mockCallOpenRouter,
  requireEnv: vi.fn().mockReturnValue('test-key'),
  resolveOpenRouterKey: vi.fn().mockReturnValue('test-key'),
}));

// Import after mocking
const { analyse } = await import('./analysis');

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

import type { BusinessContext, EngineRawResult } from './types';

const BUSINESS_CONTEXT: BusinessContext = {
  business_name: 'Acme Dental',
  website_url: 'https://acmedental.com',
  business_summary: 'A local dental practice.',
  key_services: ['cleanings', 'implants'],
  target_audience: 'families',
  category: 'dental clinic',
  location: 'Tel Aviv',
};

/** 3 results — all NOT mentioned */
const ALL_NOT_MENTIONED: EngineRawResult[] = [
  { engine: 'chatgpt', is_mentioned: false, rank_position: null, sentiment: null, raw_response: '' },
  { engine: 'gemini', is_mentioned: false, rank_position: null, sentiment: null, raw_response: '' },
  { engine: 'perplexity', is_mentioned: false, rank_position: null, sentiment: null, raw_response: '' },
];

/** 3 results — one mentioned at rank 1 */
const ONE_MENTIONED: EngineRawResult[] = [
  { engine: 'chatgpt', is_mentioned: true, rank_position: 1, sentiment: 'positive', raw_response: '' },
  { engine: 'gemini', is_mentioned: false, rank_position: null, sentiment: null, raw_response: '' },
  { engine: 'perplexity', is_mentioned: false, rank_position: null, sentiment: null, raw_response: '' },
];

function makeORResponse(text: string) {
  return { text, prompt_tokens: 10, completion_tokens: 5 };
}

function makeAnalysisJson(score: number, issues: Array<{ category: string; count: number }>) {
  return JSON.stringify({
    overall_score: score,
    issues,
    total_issues: issues.reduce((s, i) => s + i.count, 0),
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('analyse() — Stage 3 Gemini Flash analysis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('(1) 3 results with multiple is_mentioned=false → issues.length > 0', async () => {
    mockCallOpenRouter.mockResolvedValueOnce(
      makeORResponse(
        makeAnalysisJson(10, [
          { category: 'Missing from AI answers', count: 3 },
          { category: 'No citation sources', count: 1 },
        ]),
      ),
    );

    const result = await analyse(ALL_NOT_MENTIONED, BUSINESS_CONTEXT, 'scan-test-1');

    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.total_issues).toBeGreaterThan(0);
  });

  it('(2) overall_score (visibility_score) is in range [0, 100]', async () => {
    // Test with a high score
    mockCallOpenRouter.mockResolvedValueOnce(
      makeORResponse(makeAnalysisJson(85, [{ category: 'Weak authority signals', count: 1 }])),
    );

    const result = await analyse(ONE_MENTIONED, BUSINESS_CONTEXT, 'scan-test-2');
    expect(result.visibility_score).toBeGreaterThanOrEqual(0);
    expect(result.visibility_score).toBeLessThanOrEqual(100);
  });

  it('(3) all FreeScanResults keys present', async () => {
    mockCallOpenRouter.mockResolvedValueOnce(
      makeORResponse(makeAnalysisJson(50, [{ category: 'Missing from AI answers', count: 2 }])),
    );

    const result = await analyse(ALL_NOT_MENTIONED, BUSINESS_CONTEXT, 'scan-test-3');

    expect(result).toHaveProperty('issues');
    expect(result).toHaveProperty('total_issues');
    expect(result).toHaveProperty('engines_checked');
    expect(result).toHaveProperty('visibility_score');
  });

  it('(4) engines_checked is always 3', async () => {
    mockCallOpenRouter.mockResolvedValueOnce(
      makeORResponse(makeAnalysisJson(33, [{ category: 'Missing from AI answers', count: 2 }])),
    );

    const result = await analyse(ALL_NOT_MENTIONED, BUSINESS_CONTEXT, 'scan-test-4');
    expect(result.engines_checked).toBe(3);
  });

  it('(5) LLM parse failure (invalid JSON) → fallback with non-empty issues', async () => {
    mockCallOpenRouter.mockResolvedValueOnce(makeORResponse('not valid json at all'));

    const result = await analyse(ALL_NOT_MENTIONED, BUSINESS_CONTEXT, 'scan-test-5');

    // Should return a fallback FreeScanResults — never throw
    expect(result).toHaveProperty('issues');
    expect(Array.isArray(result.issues)).toBe(true);
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result).toHaveProperty('engines_checked', 3);
    expect(typeof result.visibility_score).toBe('number');
    expect(typeof result.total_issues).toBe('number');
  });

  it('(6) score is clamped to [0, 100] even if LLM returns out-of-range', async () => {
    // LLM returns score = 150 (invalid)
    mockCallOpenRouter.mockResolvedValueOnce(
      makeORResponse(makeAnalysisJson(150, [{ category: 'Too high score', count: 1 }])),
    );

    const result = await analyse(ALL_NOT_MENTIONED, BUSINESS_CONTEXT, 'scan-test-6');
    expect(result.visibility_score).toBeLessThanOrEqual(100);
  });

  it('(7) total_issues equals sum of issue counts — LLM-provided total ignored', async () => {
    // LLM returns total_issues=99 but issues sum to 5 — ground truth must win
    const badTotal = JSON.stringify({
      overall_score: 40,
      issues: [
        { category: 'Missing from AI answers', count: 3 },
        { category: 'No citation sources', count: 2 },
      ],
      total_issues: 99, // wrong — LLM hallucinated
    });
    mockCallOpenRouter.mockResolvedValueOnce(makeORResponse(badTotal));

    const result = await analyse(ALL_NOT_MENTIONED, BUSINESS_CONTEXT, 'scan-test-7');

    // Must compute from issues, not trust LLM value
    expect(result.total_issues).toBe(5);
    expect(result.total_issues).not.toBe(99);
    // Verify it equals the actual sum
    const groundTruth = result.issues.reduce((s, i) => s + i.count, 0);
    expect(result.total_issues).toBe(groundTruth);
  });
});
