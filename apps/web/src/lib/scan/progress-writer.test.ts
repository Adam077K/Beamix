/**
 * Tests for progress-writer.ts
 *
 * Test matrix:
 *   (a) Deep-merge by engine id — incoming engine state overwrites matching id;
 *       other engines are left unchanged.
 *   (b) Regression guard — engine already in 'done' must not revert to
 *       'querying' or 'queued'.
 *   (c) Seed default — when no row exists, all three engines are seeded to queued.
 *       Uses INSERT (seed-only fast path, no engine updates supplied).
 *   (d) Never throws — even if supabase upsert errors, writeProgress returns void.
 *   (e) Meta-test — source text must not reference 'email', 'ip', or 'domain'
 *       (PII exclusion by construction).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// ---------------------------------------------------------------------------
// Mock @supabase/supabase-js
// ---------------------------------------------------------------------------

let mockProgressRowToReturn: Record<string, unknown> | null = null;
let upsertError: { message: string } | null = null;
let capturedUpsertRow: Record<string, unknown> | null = null;
// Captures the row passed to the seed-only INSERT path.
let capturedInsertRow: Record<string, unknown> | null = null;

const mockMaybeSingle = vi.fn().mockImplementation(() => ({
  data: mockProgressRowToReturn,
  error: null,
}));
const mockSelectEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
const mockSelect = vi.fn().mockReturnValue({ eq: mockSelectEq });

const mockUpsert = vi.fn().mockImplementation((row: Record<string, unknown>) => {
  capturedUpsertRow = row;
  return { error: upsertError };
});

// mockInsert — used by the seed-only fast path (no engine updates).
const mockInsert = vi.fn().mockImplementation((row: Record<string, unknown>) => {
  capturedInsertRow = row;
  return { error: null }; // null = INSERT succeeded (no conflict)
});

const mockUpdate = vi.fn().mockImplementation(() => ({
  eq: vi.fn().mockReturnValue({ error: null }),
}));

const mockFrom = vi.fn().mockReturnValue({
  select: mockSelect,
  upsert: mockUpsert,
  insert: mockInsert,
  update: mockUpdate,
});

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({ from: mockFrom }),
}));

// ---------------------------------------------------------------------------
// Import the module under test (after mocks)
// ---------------------------------------------------------------------------

const { writeProgress } = await import('./progress-writer');

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const THREE_ENGINES_DONE = [
  { id: 'chatgpt',    status: 'done',   queryCount: 1, totalQueries: 1 },
  { id: 'gemini',     status: 'done',   queryCount: 1, totalQueries: 1 },
  { id: 'perplexity', status: 'queued', queryCount: 0, totalQueries: 0 },
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('progress-writer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProgressRowToReturn = null;
    upsertError = null;
    capturedUpsertRow = null;
    capturedInsertRow = null;

    // Re-wire after clearAllMocks
    mockMaybeSingle.mockImplementation(() => ({
      data: mockProgressRowToReturn,
      error: null,
    }));
    mockSelectEq.mockReturnValue({ maybeSingle: mockMaybeSingle });
    mockSelect.mockReturnValue({ eq: mockSelectEq });
    mockUpsert.mockImplementation((row: Record<string, unknown>) => {
      capturedUpsertRow = row;
      return { error: upsertError };
    });
    mockInsert.mockImplementation((row: Record<string, unknown>) => {
      capturedInsertRow = row;
      return { error: null };
    });
    mockUpdate.mockImplementation(() => ({
      eq: vi.fn().mockReturnValue({ error: null }),
    }));
    mockFrom.mockReturnValue({
      select: mockSelect,
      upsert: mockUpsert,
      insert: mockInsert,
      update: mockUpdate,
    });
  });

  // ── (a) Deep-merge by engine id ──────────────────────────────────────────

  it('(a) deep-merge by engine id — incoming overwrites matching id; others unchanged', async () => {
    // Existing row: chatgpt=querying, gemini=queued, perplexity=queued
    mockProgressRowToReturn = {
      engines: [
        { id: 'chatgpt',    status: 'querying', queryCount: 0, totalQueries: 1 },
        { id: 'gemini',     status: 'queued',   queryCount: 0, totalQueries: 0 },
        { id: 'perplexity', status: 'queued',   queryCount: 0, totalQueries: 0 },
      ],
      progress: 0.1,
      current_query: 'some query',
      done: false,
      status: 'running',
    };

    // Update only chatgpt → done
    await writeProgress('scan-001', {
      engines: [{ id: 'chatgpt', status: 'done', queryCount: 1, totalQueries: 1 }],
      progress: 0.35,
    });

    expect(capturedUpsertRow).toBeDefined();
    const engines = capturedUpsertRow!['engines'] as Array<Record<string, unknown>>;

    const chatgpt = engines.find((e) => e['id'] === 'chatgpt');
    const gemini  = engines.find((e) => e['id'] === 'gemini');
    const perplexity = engines.find((e) => e['id'] === 'perplexity');

    // ChatGPT updated
    expect(chatgpt!['status']).toBe('done');
    expect(chatgpt!['queryCount']).toBe(1);

    // Gemini unchanged
    expect(gemini!['status']).toBe('queued');

    // Perplexity unchanged
    expect(perplexity!['status']).toBe('queued');

    // Progress updated
    expect(capturedUpsertRow!['progress']).toBe(0.35);
  });

  // ── (b) Regression guard ─────────────────────────────────────────────────

  it('(b) regression guard — engine in done/error must NOT revert to querying/queued', async () => {
    // Existing row: chatgpt=done, gemini=done
    mockProgressRowToReturn = {
      engines: THREE_ENGINES_DONE,
      progress: 0.35,
      current_query: null,
      done: false,
      status: 'running',
    };

    // Attempt to set chatgpt back to 'querying'
    await writeProgress('scan-001', {
      engines: [
        { id: 'chatgpt', status: 'querying', queryCount: 0, totalQueries: 1 },
        { id: 'gemini',  status: 'querying', queryCount: 0, totalQueries: 1 },
      ],
    });

    expect(capturedUpsertRow).toBeDefined();
    const engines = capturedUpsertRow!['engines'] as Array<Record<string, unknown>>;

    const chatgpt = engines.find((e) => e['id'] === 'chatgpt');
    const gemini  = engines.find((e) => e['id'] === 'gemini');

    // Both must retain terminal state
    expect(chatgpt!['status']).toBe('done');
    expect(gemini!['status']).toBe('done');
  });

  it('(b2) regression guard — engine in error must NOT revert to queuing', async () => {
    mockProgressRowToReturn = {
      engines: [
        { id: 'chatgpt',    status: 'error',  queryCount: 0, totalQueries: 1 },
        { id: 'gemini',     status: 'queued', queryCount: 0, totalQueries: 0 },
        { id: 'perplexity', status: 'queued', queryCount: 0, totalQueries: 0 },
      ],
      progress: 0.1,
      current_query: null,
      done: false,
      status: 'running',
    };

    // Attempt to set chatgpt back to 'querying' (e.g. from an Inngest step replay)
    await writeProgress('scan-001', {
      engines: [{ id: 'chatgpt', status: 'querying', queryCount: 0, totalQueries: 1 }],
    });

    const engines = capturedUpsertRow!['engines'] as Array<Record<string, unknown>>;
    const chatgpt = engines.find((e) => e['id'] === 'chatgpt');
    expect(chatgpt!['status']).toBe('error');
  });

  // ── (c) Seed default ─────────────────────────────────────────────────────
  // The seed-only path (no engines provided) uses INSERT, not upsert.
  // capturedInsertRow is what we assert on here.

  it('(c) seed default — when no row exists, all three engines seeded to queued via INSERT', async () => {
    mockProgressRowToReturn = null; // no existing row

    await writeProgress('scan-001', { status: 'running', progress: 0 });

    // Seed-only path uses INSERT — check capturedInsertRow, not capturedUpsertRow
    expect(capturedInsertRow).toBeDefined();
    const engines = capturedInsertRow!['engines'] as Array<Record<string, unknown>>;
    expect(engines).toHaveLength(3);

    const ids = engines.map((e) => e['id']);
    expect(ids).toContain('chatgpt');
    expect(ids).toContain('gemini');
    expect(ids).toContain('perplexity');

    for (const e of engines) {
      expect(e['status']).toBe('queued');
    }

    // Defaults set for missing fields
    expect(capturedInsertRow!['done']).toBe(false);
    expect(capturedInsertRow!['current_query']).toBe(null);
    expect(capturedInsertRow!['progress']).toBe(0);
    expect(capturedInsertRow!['status']).toBe('running');
  });

  // ── (d) Never throws ─────────────────────────────────────────────────────

  it('(d) never throws — even if supabase upsert errors, writeProgress returns void', async () => {
    upsertError = { message: 'DB connection refused' };

    // Should not throw
    await expect(writeProgress('scan-001', { status: 'running' })).resolves.toBeUndefined();
  });

  it('(d2) never throws — even if supabase entirely unavailable (createClient throws)', async () => {
    // Make createClient throw
    const { createClient } = await import('@supabase/supabase-js');
    (createClient as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
      throw new Error('Cannot reach Supabase');
    });

    await expect(writeProgress('scan-001', { status: 'running' })).resolves.toBeUndefined();
  });

  // ── (e) Meta-test: PII exclusion by source text ──────────────────────────

  it('(e) meta-test — source text references no email/ip/domain (PII-free by construction)', () => {
    const sourcePath = join(
      import.meta.dirname,
      'progress-writer.ts',
    );
    const source = readFileSync(sourcePath, 'utf-8');

    // These words must not appear in the source as column names or field accesses
    // (comments explaining what's NOT there are acceptable, so we check for
    //  assignment patterns rather than bare words)
    const piiPatterns = [
      /['"`]email['"`]/,    // 'email' as a string key
      /\.email\b/,           // .email property access
      /['"`]ip['"`]/,        // 'ip' as a string key (only scan_id allowed)
      /\.ip\b/,              // .ip property access
      /['"`]domain['"`]/,    // 'domain' as a string key
      /\.domain\b/,          // .domain property access
    ];

    for (const pattern of piiPatterns) {
      expect(
        source,
        `progress-writer.ts must not reference PII field matching ${pattern}`,
      ).not.toMatch(pattern);
    }
  });
});
