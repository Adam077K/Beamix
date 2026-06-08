/**
 * Unit tests for openrouter-client.ts — web_search plugin + citation parsing.
 *
 * Tests cover:
 *   (1) web:true → request body includes plugins:[{id:'web',max_results:N}]
 *   (2) web:false / absent → request body has NO plugins key (backward-compat)
 *   (3) webMaxResults overrides the default (5) when provided
 *   (4) annotations[].url_citation.url extracted into sourceUrls
 *   (5) top-level citations array (Perplexity Sonar native) used as fallback
 *   (6) annotations take precedence over top-level citations when both present
 *   (7) empty sourceUrls when neither annotations nor citations present
 *
 * Network: fetch is mocked via globalThis.fetch — never hits the real API.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NonRetriableError } from 'inngest';

// ---------------------------------------------------------------------------
// Mock inngest (required by openrouter-client import)
// ---------------------------------------------------------------------------
vi.mock('inngest', () => ({
  NonRetriableError: class extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'NonRetriableError';
    }
  },
}));

// ---------------------------------------------------------------------------
// Capture fetch calls
// ---------------------------------------------------------------------------

/** The parsed body of the last fetch call. */
let lastFetchBody: Record<string, unknown> | null = null;

/** Factory for a minimal successful OpenRouter JSON response. */
function makeResponseBody(overrides: Partial<{
  text: string;
  annotations: Array<{ type: string; url_citation?: { url: string } }>;
  citations: string[];
}> = {}): string {
  const text = overrides.text ?? 'response text';
  const message: Record<string, unknown> = { content: text };
  if (overrides.annotations !== undefined) {
    message['annotations'] = overrides.annotations;
  }
  const body: Record<string, unknown> = {
    choices: [{ message }],
    usage: { prompt_tokens: 10, completion_tokens: 5 },
  };
  if (overrides.citations !== undefined) {
    body['citations'] = overrides.citations;
  }
  return JSON.stringify(body);
}

function mockFetch(responseBody: string, status = 200) {
  vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => {
    lastFetchBody = JSON.parse(init.body as string) as Record<string, unknown>;
    return {
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      json: async () => JSON.parse(responseBody),
      text: async () => responseBody,
    };
  }));
}

// ---------------------------------------------------------------------------
// Import after setup
// ---------------------------------------------------------------------------

// Set env vars before import so resolveOpenRouterKey() doesn't throw
process.env['OPENROUTER_API_KEY'] = 'test-key';

const { callOpenRouter } = await import('./openrouter-client');

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('callOpenRouter() — web_search plugin body shape', () => {
  beforeEach(() => {
    lastFetchBody = null;
  });

  it('(1) web:true → request body includes plugins array with id:web', async () => {
    mockFetch(makeResponseBody());
    await callOpenRouter({
      model: 'openai/gpt-4o-mini',
      systemPrompt: 'system',
      userPrompt: 'user',
      web: true,
    });
    expect(lastFetchBody).toHaveProperty('plugins');
    const plugins = lastFetchBody!['plugins'] as Array<{ id: string; max_results: number }>;
    expect(Array.isArray(plugins)).toBe(true);
    expect(plugins[0]?.id).toBe('web');
  });

  it('(1b) web:true + default webMaxResults → max_results=5', async () => {
    mockFetch(makeResponseBody());
    await callOpenRouter({
      model: 'openai/gpt-4o-mini',
      systemPrompt: 'system',
      userPrompt: 'user',
      web: true,
    });
    const plugins = lastFetchBody!['plugins'] as Array<{ id: string; max_results: number }>;
    expect(plugins[0]?.max_results).toBe(5);
  });

  it('(2a) web absent → NO plugins key in request body', async () => {
    mockFetch(makeResponseBody());
    await callOpenRouter({
      model: 'openai/gpt-4o',
      systemPrompt: 'system',
      userPrompt: 'user',
    });
    expect(lastFetchBody).not.toHaveProperty('plugins');
  });

  it('(2b) web:false → NO plugins key in request body', async () => {
    mockFetch(makeResponseBody());
    await callOpenRouter({
      model: 'openai/gpt-4o',
      systemPrompt: 'system',
      userPrompt: 'user',
      web: false,
    });
    expect(lastFetchBody).not.toHaveProperty('plugins');
  });

  it('(3) webMaxResults overrides default', async () => {
    mockFetch(makeResponseBody());
    await callOpenRouter({
      model: 'openai/gpt-4o-mini',
      systemPrompt: 'system',
      userPrompt: 'user',
      web: true,
      webMaxResults: 10,
    });
    const plugins = lastFetchBody!['plugins'] as Array<{ id: string; max_results: number }>;
    expect(plugins[0]?.max_results).toBe(10);
  });
});

describe('callOpenRouter() — citation parsing', () => {
  beforeEach(() => {
    lastFetchBody = null;
  });

  it('(4) annotations[].url_citation.url extracted into sourceUrls', async () => {
    mockFetch(makeResponseBody({
      annotations: [
        { type: 'url_citation', url_citation: { url: 'https://example.com/a' } },
        { type: 'url_citation', url_citation: { url: 'https://example.com/b' } },
      ],
    }));
    const result = await callOpenRouter({
      model: 'openai/gpt-4o-mini',
      systemPrompt: 's',
      userPrompt: 'u',
      web: true,
    });
    expect(result.sourceUrls).toEqual(['https://example.com/a', 'https://example.com/b']);
  });

  it('(4b) annotations with non-url_citation type are ignored', async () => {
    mockFetch(makeResponseBody({
      annotations: [
        { type: 'other_type' },
        { type: 'url_citation', url_citation: { url: 'https://example.com/c' } },
      ],
    }));
    const result = await callOpenRouter({
      model: 'openai/gpt-4o-mini',
      systemPrompt: 's',
      userPrompt: 'u',
      web: true,
    });
    expect(result.sourceUrls).toEqual(['https://example.com/c']);
  });

  it('(5) top-level citations array used as fallback when annotations absent', async () => {
    mockFetch(makeResponseBody({
      citations: ['https://perplexity.com/source-1', 'https://perplexity.com/source-2'],
    }));
    const result = await callOpenRouter({
      model: 'perplexity/sonar',
      systemPrompt: 's',
      userPrompt: 'u',
    });
    expect(result.sourceUrls).toEqual(['https://perplexity.com/source-1', 'https://perplexity.com/source-2']);
  });

  it('(6) annotations take precedence over top-level citations when both present', async () => {
    mockFetch(makeResponseBody({
      annotations: [
        { type: 'url_citation', url_citation: { url: 'https://annotation-source.com' } },
      ],
      citations: ['https://top-level-citation.com'],
    }));
    const result = await callOpenRouter({
      model: 'openai/gpt-4o-mini',
      systemPrompt: 's',
      userPrompt: 'u',
      web: true,
    });
    // Annotations path takes priority
    expect(result.sourceUrls).toEqual(['https://annotation-source.com']);
    expect(result.sourceUrls).not.toContain('https://top-level-citation.com');
  });

  it('(7) empty sourceUrls when neither annotations nor citations present', async () => {
    mockFetch(makeResponseBody()); // no annotations, no citations
    const result = await callOpenRouter({
      model: 'openai/gpt-4o',
      systemPrompt: 's',
      userPrompt: 'u',
    });
    expect(result.sourceUrls).toEqual([]);
  });

  it('(7b) sourceUrls is always present (never undefined)', async () => {
    mockFetch(makeResponseBody());
    const result = await callOpenRouter({
      model: 'openai/gpt-4o',
      systemPrompt: 's',
      userPrompt: 'u',
    });
    expect(Array.isArray(result.sourceUrls)).toBe(true);
  });
});

describe('callOpenRouter() — core response fields', () => {
  it('text, prompt_tokens, completion_tokens are returned correctly', async () => {
    mockFetch(makeResponseBody({ text: 'hello world' }));
    const result = await callOpenRouter({
      model: 'openai/gpt-4o',
      systemPrompt: 's',
      userPrompt: 'u',
    });
    expect(result.text).toBe('hello world');
    expect(typeof result.prompt_tokens).toBe('number');
    expect(typeof result.completion_tokens).toBe('number');
  });
});

describe('callOpenRouter() — NonRetriableError on missing env', () => {
  it('throws NonRetriableError when no API key configured', async () => {
    const originalScan = process.env['OPENROUTER_SCAN_KEY'];
    const originalShared = process.env['OPENROUTER_API_KEY'];
    delete process.env['OPENROUTER_SCAN_KEY'];
    delete process.env['OPENROUTER_API_KEY'];

    // Need a fresh import to bypass module-level env resolution
    // resolveOpenRouterKey() is called at callOpenRouter() invocation time
    const { resolveOpenRouterKey } = await import('./openrouter-client');
    expect(() => resolveOpenRouterKey()).toThrow(NonRetriableError);

    // Restore
    if (originalScan) process.env['OPENROUTER_SCAN_KEY'] = originalScan;
    if (originalShared) process.env['OPENROUTER_API_KEY'] = originalShared;
  });
});
