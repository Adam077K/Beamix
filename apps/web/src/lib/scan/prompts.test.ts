/**
 * Unit tests for prompts.ts — parseEngineResult + competitor parsing.
 *
 * Coverage:
 *   (A) Well-formed recommendations[] → competitors parsed correctly
 *   (B) Malformed outer JSON → competitors undefined; is_mentioned / rank / sentiment still parse
 *   (C) 50-entry array capped at 10
 *   (D) Duplicate names deduplicated (lowest rank kept)
 *   (E) Non-integer rank dropped; valid sibling entries kept
 *   (F) REGRESSION: existing is_mentioned / rank_position / sentiment fixtures byte-identical
 */

import { describe, it, expect } from 'vitest';
import { parseEngineResult } from './prompts';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRec(rank: number, name: string, why?: string) {
  return why !== undefined ? { rank, name, why } : { rank, name };
}

function makeEngineJson(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    recommendations: [],
    is_mentioned: false,
    rank_position: null,
    sentiment: null,
    ...overrides,
  });
}

// ---------------------------------------------------------------------------
// (A) Well-formed recommendations[] → competitors parsed correctly
// ---------------------------------------------------------------------------

describe('parseEngineResult — competitors parsing', () => {
  it('(A1) well-formed recommendations[] produces correct competitors[]', () => {
    const raw = makeEngineJson({
      recommendations: [
        { rank: 1, name: 'Alpha Dental', why: 'Top rated' },
        { rank: 2, name: 'Beta Clinic', why: 'Great reviews' },
        { rank: 3, name: 'Gamma Health' },
      ],
      is_mentioned: true,
      rank_position: 2,
      sentiment: 'positive',
    });

    const result = parseEngineResult(raw, 'chatgpt');
    expect(result.competitors).toEqual([
      { rank: 1, name: 'Alpha Dental', why: 'Top rated' },
      { rank: 2, name: 'Beta Clinic', why: 'Great reviews' },
      { rank: 3, name: 'Gamma Health' },
    ]);
  });

  it('(A2) entry with no why → no why field on output (not undefined key)', () => {
    const raw = makeEngineJson({
      recommendations: [{ rank: 1, name: 'Only Inc' }],
    });
    const result = parseEngineResult(raw, 'gemini');
    expect(result.competitors).toHaveLength(1);
    expect(result.competitors![0]).not.toHaveProperty('why');
    expect(result.competitors![0]!.name).toBe('Only Inc');
  });

  it('(A3) empty recommendations[] → competitors is []', () => {
    const raw = makeEngineJson({ recommendations: [] });
    const result = parseEngineResult(raw, 'perplexity');
    expect(result.competitors).toEqual([]);
  });

  it('(A4) recommendations absent from JSON → competitors is undefined', () => {
    const raw = JSON.stringify({ is_mentioned: false, rank_position: null, sentiment: null });
    const result = parseEngineResult(raw, 'chatgpt');
    expect(result.competitors).toBeUndefined();
  });

  it('(A5) recommendations is null → competitors is undefined', () => {
    const raw = makeEngineJson({ recommendations: null });
    const result = parseEngineResult(raw, 'chatgpt');
    expect(result.competitors).toBeUndefined();
  });

  it('(A6) why longer than 500 chars is truncated to 500', () => {
    const longWhy = 'x'.repeat(600);
    const raw = makeEngineJson({
      recommendations: [{ rank: 1, name: 'Trunc Corp', why: longWhy }],
    });
    const result = parseEngineResult(raw, 'gemini');
    expect(result.competitors![0]!.why).toHaveLength(500);
  });

  it('(A7) name longer than 200 chars → entry dropped', () => {
    const longName = 'A'.repeat(201);
    const raw = makeEngineJson({
      recommendations: [
        { rank: 1, name: longName, why: 'Dropped' },
        { rank: 2, name: 'Valid Corp', why: 'Kept' },
      ],
    });
    const result = parseEngineResult(raw, 'chatgpt');
    expect(result.competitors).toHaveLength(1);
    expect(result.competitors![0]!.name).toBe('Valid Corp');
  });

  it('(A8) name that is empty string → entry dropped', () => {
    const raw = makeEngineJson({
      recommendations: [
        { rank: 1, name: '', why: 'Dropped' },
        { rank: 2, name: '  ', why: 'Also dropped (whitespace only)' },
        { rank: 3, name: 'Good Corp' },
      ],
    });
    const result = parseEngineResult(raw, 'chatgpt');
    expect(result.competitors).toHaveLength(1);
    expect(result.competitors![0]!.name).toBe('Good Corp');
  });
});

// ---------------------------------------------------------------------------
// (B) Malformed outer JSON → competitors undefined; core fields still parse
// ---------------------------------------------------------------------------

describe('parseEngineResult — malformed JSON fallback', () => {
  it('(B1) completely invalid JSON → competitors undefined and is_mentioned false', () => {
    const result = parseEngineResult('not-json-at-all', 'gemini');
    expect(result.competitors).toBeUndefined();
    expect(result.is_mentioned).toBe(false);
    expect(result.rank_position).toBeNull();
    expect(result.sentiment).toBeNull();
  });

  it('(B2) truncated JSON → competitors undefined, core fields still parse', () => {
    // Valid outer JSON but recommendations is a non-array primitive
    const raw = JSON.stringify({
      recommendations: 'oops',
      is_mentioned: true,
      rank_position: 1,
      sentiment: 'positive',
    });
    const result = parseEngineResult(raw, 'chatgpt');
    expect(result.competitors).toBeUndefined();
    // Core fields parsed from the valid JSON envelope
    expect(result.is_mentioned).toBe(true);
    expect(result.rank_position).toBe(1);
    expect(result.sentiment).toBe('positive');
  });
});

// ---------------------------------------------------------------------------
// (C) 50-entry array capped at 10
// ---------------------------------------------------------------------------

describe('parseEngineResult — array cap', () => {
  it('(C1) 50-entry recommendations → competitors capped at 10', () => {
    const recs = Array.from({ length: 50 }, (_, i) => makeRec(i + 1, `Company ${i + 1}`, 'why'));
    const raw = makeEngineJson({ recommendations: recs });
    const result = parseEngineResult(raw, 'perplexity');
    expect(result.competitors).toHaveLength(10);
    // First 10 by rank (1–10)
    expect(result.competitors![0]!.rank).toBe(1);
    expect(result.competitors![9]!.rank).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// (D) Duplicate names deduplicated (lowest rank kept)
// ---------------------------------------------------------------------------

describe('parseEngineResult — deduplication', () => {
  it('(D1) same name at different ranks → lowest rank wins', () => {
    const raw = makeEngineJson({
      recommendations: [
        { rank: 3, name: 'Acme Corp', why: 'rank 3 entry' },
        { rank: 1, name: 'Acme Corp', why: 'rank 1 entry — wins' },
        { rank: 5, name: 'Acme Corp', why: 'rank 5 entry' },
      ],
    });
    const result = parseEngineResult(raw, 'chatgpt');
    expect(result.competitors).toHaveLength(1);
    expect(result.competitors![0]!.rank).toBe(1);
    expect(result.competitors![0]!.why).toBe('rank 1 entry — wins');
  });

  it('(D2) case-insensitive dedup — "ACME" and "acme" are the same', () => {
    const raw = makeEngineJson({
      recommendations: [
        { rank: 2, name: 'ACME', why: 'uppercase' },
        { rank: 1, name: 'acme', why: 'lowercase — wins (rank 1)' },
      ],
    });
    const result = parseEngineResult(raw, 'gemini');
    expect(result.competitors).toHaveLength(1);
    expect(result.competitors![0]!.rank).toBe(1);
  });

  it('(D3) two distinct names → both kept', () => {
    const raw = makeEngineJson({
      recommendations: [
        { rank: 1, name: 'Alpha', why: 'first' },
        { rank: 2, name: 'Beta', why: 'second' },
      ],
    });
    const result = parseEngineResult(raw, 'perplexity');
    expect(result.competitors).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// (E) Non-integer rank dropped; valid sibling entries kept
// ---------------------------------------------------------------------------

describe('parseEngineResult — rank validation', () => {
  it('(E1) float rank → entry dropped', () => {
    const raw = makeEngineJson({
      recommendations: [
        { rank: 1.5, name: 'Float Corp', why: 'dropped' },
        { rank: 2, name: 'Valid Corp', why: 'kept' },
      ],
    });
    const result = parseEngineResult(raw, 'chatgpt');
    expect(result.competitors).toHaveLength(1);
    expect(result.competitors![0]!.name).toBe('Valid Corp');
  });

  it('(E2) string rank → entry dropped', () => {
    const raw = makeEngineJson({
      recommendations: [
        { rank: '1', name: 'String Rank Corp' },
        { rank: 1, name: 'Integer Corp' },
      ],
    });
    const result = parseEngineResult(raw, 'gemini');
    expect(result.competitors).toHaveLength(1);
    expect(result.competitors![0]!.name).toBe('Integer Corp');
  });

  it('(E3) rank = 0 → dropped (out of [1, 10] range)', () => {
    const raw = makeEngineJson({
      recommendations: [{ rank: 0, name: 'Zero Corp' }],
    });
    const result = parseEngineResult(raw, 'chatgpt');
    expect(result.competitors).toEqual([]);
  });

  it('(E4) rank = 11 → dropped (out of [1, 10] range)', () => {
    const raw = makeEngineJson({
      recommendations: [{ rank: 11, name: 'Eleven Corp' }],
    });
    const result = parseEngineResult(raw, 'chatgpt');
    expect(result.competitors).toEqual([]);
  });

  it('(E5) rank = 10 → kept (boundary)', () => {
    const raw = makeEngineJson({
      recommendations: [{ rank: 10, name: 'Ten Corp' }],
    });
    const result = parseEngineResult(raw, 'chatgpt');
    expect(result.competitors).toHaveLength(1);
    expect(result.competitors![0]!.rank).toBe(10);
  });

  it('(E6) rank = 1 → kept (boundary)', () => {
    const raw = makeEngineJson({
      recommendations: [{ rank: 1, name: 'One Corp' }],
    });
    const result = parseEngineResult(raw, 'chatgpt');
    expect(result.competitors).toHaveLength(1);
    expect(result.competitors![0]!.rank).toBe(1);
  });

  it('(E7) missing rank → entry dropped', () => {
    const raw = makeEngineJson({
      recommendations: [
        { name: 'No Rank Corp', why: 'dropped' },
        { rank: 1, name: 'Has Rank Corp', why: 'kept' },
      ],
    });
    const result = parseEngineResult(raw, 'perplexity');
    expect(result.competitors).toHaveLength(1);
    expect(result.competitors![0]!.name).toBe('Has Rank Corp');
  });
});

// ---------------------------------------------------------------------------
// (F) REGRESSION — existing is_mentioned / rank_position / sentiment fixtures
// ---------------------------------------------------------------------------

describe('parseEngineResult — REGRESSION: core fields byte-identical', () => {
  it('(F1) is_mentioned=true, rank_position=3, sentiment=positive → parsed correctly', () => {
    const raw = makeEngineJson({
      is_mentioned: true,
      rank_position: 3,
      sentiment: 'positive',
    });
    const result = parseEngineResult(raw, 'chatgpt');
    expect(result.is_mentioned).toBe(true);
    expect(result.rank_position).toBe(3);
    expect(result.sentiment).toBe('positive');
    expect(result.engine).toBe('chatgpt');
    expect(result.retrieval_mode).toBe('parametric_memory');
  });

  it('(F2) is_mentioned=false → rank_position null, sentiment null', () => {
    const raw = makeEngineJson({
      is_mentioned: false,
      rank_position: 2,
      sentiment: 'neutral',
    });
    const result = parseEngineResult(raw, 'gemini');
    expect(result.is_mentioned).toBe(false);
    expect(result.rank_position).toBeNull();
    expect(result.sentiment).toBeNull();
  });

  it('(F3) invalid sentiment → null', () => {
    const raw = makeEngineJson({
      is_mentioned: true,
      rank_position: 1,
      sentiment: 'amazing', // not a valid enum value
    });
    const result = parseEngineResult(raw, 'perplexity');
    expect(result.sentiment).toBeNull();
  });

  it('(F4) completely bad JSON → full fallback shape', () => {
    const result = parseEngineResult('{bad json', 'chatgpt');
    expect(result).toEqual({
      engine: 'chatgpt',
      is_mentioned: false,
      rank_position: null,
      sentiment: null,
      raw_response: '{bad json',
      retrieval_mode: 'parametric_memory',
    });
  });

  it('(F5) markdown code fence stripped before parse', () => {
    const inner = JSON.stringify({
      recommendations: [],
      is_mentioned: true,
      rank_position: 1,
      sentiment: 'positive',
    });
    const raw = `\`\`\`json\n${inner}\n\`\`\``;
    const result = parseEngineResult(raw, 'gemini');
    expect(result.is_mentioned).toBe(true);
    expect(result.rank_position).toBe(1);
  });

  it('(F6) raw_response is always the original raw string (no modification)', () => {
    const raw = makeEngineJson();
    const result = parseEngineResult(raw, 'perplexity');
    expect(result.raw_response).toBe(raw);
  });
});
