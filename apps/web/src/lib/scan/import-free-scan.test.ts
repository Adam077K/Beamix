/**
 * Tests for projectFreeScanToNormalized — pure projection function.
 *
 * Coverage:
 *   1. v2 projection — happy path with full engine_subscores
 *   2. v2 projection — partial subscores (missing one engine → lossy row)
 *   3. v1 lossy fallback — null results
 *   4. v1 lossy fallback — results with no scan_v2 field
 *   5. v1 lossy fallback — scan_v2 present but Zod parse fails
 *   6. Correct scans row shape: status='complete', source_free_scan_id, business_id
 */

import { describe, it, expect } from 'vitest';
import { projectFreeScanToNormalized } from './import-free-scan';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const FREE_SCAN_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const NEW_SCAN_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const BUSINESS_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

const STARTED_AT = '2024-01-01T10:00:00Z';
const COMPLETED_AT = '2024-01-01T10:05:00Z';

/** Minimal valid scan_v2 blob with 3 engines */
function makeScanV2(overrides?: Partial<{
  chatgptMentioned: boolean;
  chatgptRank: number | null;
  chatgptSentiment: 'positive' | 'neutral' | 'negative' | null;
  chatgptCitations: string[];
}>) {
  const o = {
    chatgptMentioned: true,
    chatgptRank: 1,
    chatgptSentiment: 'positive' as const,
    chatgptCitations: ['https://example.com'],
    ...overrides,
  };

  return {
    engine_subscores: [
      {
        engine: 'chatgpt',
        point: 72,
        probes: [
          {
            is_mentioned: o.chatgptMentioned,
            rank_position: o.chatgptRank,
            sentiment: o.chatgptSentiment,
            citations: o.chatgptCitations,
          },
        ],
      },
      {
        engine: 'gemini',
        point: 55,
        probes: [
          {
            is_mentioned: false,
            rank_position: null,
            sentiment: null,
            citations: [],
          },
        ],
      },
      {
        engine: 'perplexity',
        point: 80,
        probes: [
          {
            is_mentioned: true,
            rank_position: 2,
            sentiment: 'neutral',
            citations: ['https://perplexity.ai/source'],
          },
        ],
      },
    ],
    headline_band: { point: 72 },
    gap_list: [],
    playbooks: [],
    competitors: [],
    narration: { short: 'ok' },
    meta: {
      run_kind: 'free',
      generated_at: COMPLETED_AT,
      model_ids: { sentiment: null, narration: null },
      degraded: false,
    },
  };
}

function makeInput(resultsOverride?: unknown) {
  return {
    free_scan_id: FREE_SCAN_ID,
    new_scan_id: NEW_SCAN_ID,
    business_id: BUSINESS_ID,
    results: resultsOverride,
    started_at: STARTED_AT,
    completed_at: COMPLETED_AT,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function engineRow(result: ReturnType<typeof projectFreeScanToNormalized>, engine: string) {
  return result.engineResults.find((r) => r.engine === engine);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('projectFreeScanToNormalized', () => {
  // ─── Scans row shape ──────────────────────────────────────────────────────

  it('always emits status=complete with source_free_scan_id', () => {
    const result = projectFreeScanToNormalized(makeInput(null));
    expect(result.scan.status).toBe('complete');
    expect(result.scan.source_free_scan_id).toBe(FREE_SCAN_ID);
    expect(result.scan.scan_type).toBe('free');
    expect(result.scan.business_id).toBe(BUSINESS_ID);
    expect(result.scan.id).toBe(NEW_SCAN_ID);
    expect(result.scan.started_at).toBe(STARTED_AT);
    expect(result.scan.completed_at).toBe(COMPLETED_AT);
  });

  it('always emits exactly 3 engine result rows', () => {
    const result = projectFreeScanToNormalized(makeInput(null));
    expect(result.engineResults).toHaveLength(3);
    const engines = result.engineResults.map((r) => r.engine).sort();
    expect(engines).toEqual(['chatgpt', 'gemini', 'perplexity']);
  });

  // ─── v2 projection — happy path ──────────────────────────────────────────

  it('v2: projects chatgpt is_mentioned=true, rank=1, sentiment=positive, citations', () => {
    const results = {
      issues: [],
      total_issues: 0,
      engines_checked: 3,
      visibility_score: 72,
      scan_v2: makeScanV2(),
    };

    const result = projectFreeScanToNormalized(makeInput(results));

    const chatgpt = engineRow(result, 'chatgpt');
    expect(chatgpt?.is_mentioned).toBe(true);
    expect(chatgpt?.rank_position).toBe(1);
    expect(chatgpt?.sentiment).toBe('positive');
    expect(chatgpt?.citations).toEqual(['https://example.com']);

    const gemini = engineRow(result, 'gemini');
    expect(gemini?.is_mentioned).toBe(false);
    expect(gemini?.rank_position).toBeNull();
    expect(gemini?.sentiment).toBeNull();

    const perplexity = engineRow(result, 'perplexity');
    expect(perplexity?.is_mentioned).toBe(true);
    expect(perplexity?.rank_position).toBe(2);
    expect(perplexity?.sentiment).toBe('neutral');
    expect(perplexity?.citations).toEqual(['https://perplexity.ai/source']);
  });

  it('v2: all rows have correct scan_id and business_id', () => {
    const results = { scan_v2: makeScanV2() };
    const result = projectFreeScanToNormalized(makeInput(results));

    for (const row of result.engineResults) {
      expect(row.scan_id).toBe(NEW_SCAN_ID);
      expect(row.business_id).toBe(BUSINESS_ID);
    }
  });

  it('v2: missing engine in subscores → lossy row for that engine', () => {
    // scan_v2 only has chatgpt + gemini, missing perplexity
    const scan_v2 = makeScanV2();
    scan_v2.engine_subscores = scan_v2.engine_subscores.filter((e) => e.engine !== 'perplexity');

    const result = projectFreeScanToNormalized(makeInput({ scan_v2 }));
    const perplexity = engineRow(result, 'perplexity');
    expect(perplexity?.is_mentioned).toBe(false);
    expect(perplexity?.rank_position).toBeNull();
    expect(perplexity?.citations).toEqual([]);
  });

  it('v2: probe with no citations emits empty array', () => {
    const scan_v2 = makeScanV2({ chatgptCitations: [] });
    const result = projectFreeScanToNormalized(makeInput({ scan_v2 }));
    expect(engineRow(result, 'chatgpt')?.citations).toEqual([]);
  });

  it('v2: subscores entry with no probes → lossy row for that engine', () => {
    const scan_v2 = makeScanV2();
    // Remove probes from chatgpt entry
    const chatgptEntry = scan_v2.engine_subscores.find((e) => e.engine === 'chatgpt');
    if (chatgptEntry) {
      // @ts-expect-error — intentionally stripping probes to test robustness
      delete chatgptEntry.probes;
    }

    const result = projectFreeScanToNormalized(makeInput({ scan_v2 }));
    const chatgpt = engineRow(result, 'chatgpt');
    expect(chatgpt?.is_mentioned).toBe(false);
    expect(chatgpt?.rank_position).toBeNull();
  });

  // ─── v1 lossy fallback ───────────────────────────────────────────────────

  it('v1 fallback: null results → 3 lossy rows (is_mentioned=false)', () => {
    const result = projectFreeScanToNormalized(makeInput(null));

    for (const row of result.engineResults) {
      expect(row.is_mentioned).toBe(false);
      expect(row.rank_position).toBeNull();
      expect(row.sentiment).toBeNull();
      expect(row.citations).toEqual([]);
    }
  });

  it('v1 fallback: results without scan_v2 → 3 lossy rows', () => {
    const results = {
      issues: [{ category: 'Missing', count: 1 }],
      total_issues: 1,
      engines_checked: 3,
      visibility_score: 30,
      // NO scan_v2
    };

    const result = projectFreeScanToNormalized(makeInput(results));

    for (const row of result.engineResults) {
      expect(row.is_mentioned).toBe(false);
    }
  });

  it('v1 fallback: scan_v2 present but Zod parse fails → 3 lossy rows', () => {
    const results = {
      scan_v2: {
        // Missing engine_subscores entirely → parse failure
        headline_band: { point: 50 },
      },
    };

    const result = projectFreeScanToNormalized(makeInput(results));

    for (const row of result.engineResults) {
      expect(row.is_mentioned).toBe(false);
      expect(row.rank_position).toBeNull();
    }
  });

  it('v1 fallback: scan_v2 has engine_subscores but with invalid engine name → parse fails → lossy', () => {
    const results = {
      scan_v2: {
        engine_subscores: [
          { engine: 'unknown_engine', point: 50, probes: [] },
        ],
      },
    };

    const result = projectFreeScanToNormalized(makeInput(results));

    // Zod parse fails on invalid engine enum → lossy fallback
    for (const row of result.engineResults) {
      expect(row.is_mentioned).toBe(false);
    }
  });
});
