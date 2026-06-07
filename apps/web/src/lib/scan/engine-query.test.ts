/**
 * Unit tests for engine-query.ts — Stage 2 engine querying.
 *
 * Tests cover:
 *   (1) retrieval_mode is set correctly per engine under flag OFF
 *   (2) retrieval_mode is set correctly per engine under flag ON
 *   (3) flag OFF → ENGINE_MODELS used, no plugins key in request body
 *   (4) flag ON + chatgpt → gpt-4o-mini model + plugins:[{id:'web',...}] + provider_note
 *   (5) flag ON + perplexity → perplexity/sonar, retrieval_mode='live_web', citations from native
 *   (6) flag ON + gemini → remains google/gemini-2.5-flash, parametric_memory, no plugins
 *   (7) backward compat: callers that pass no web option get byte-identical body shape
 *
 * Network: mocked at openrouter-client boundary — never hits the real API.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock openrouter-client — capture request args for body shape assertions
// ---------------------------------------------------------------------------

/** The last request passed to callOpenRouter. */
let lastCallArgs: Parameters<typeof import('./openrouter-client').callOpenRouter>[0] | null = null;

const mockCallOpenRouter = vi.fn(async (req: Parameters<typeof import('./openrouter-client').callOpenRouter>[0]) => {
  lastCallArgs = req;
  return {
    text: JSON.stringify({
      recommendations: [],
      is_mentioned: false,
      rank_position: null,
      sentiment: null,
    }),
    prompt_tokens: 10,
    completion_tokens: 5,
    sourceUrls: [] as string[],
  };
});

vi.mock('./openrouter-client', () => ({
  callOpenRouter: mockCallOpenRouter,
  requireEnv: vi.fn().mockReturnValue('test-key'),
  resolveOpenRouterKey: vi.fn().mockReturnValue('test-key'),
}));

// ---------------------------------------------------------------------------
// Import after mocking
// ---------------------------------------------------------------------------

const { queryEngine } = await import('./engine-query');

import type { BusinessContext, ScanInput } from './types';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const CTX: BusinessContext = {
  business_name: 'Acme Dental',
  website_url: 'https://acmedental.com',
  business_summary: 'Local dental practice.',
  key_services: ['cleanings', 'implants'],
  target_audience: 'families',
  category: 'dental clinic',
  location: 'Tel Aviv',
};

const INPUT: ScanInput = {
  scan_id: 'scan-test-001',
  business_name: 'Acme Dental',
  website_url: 'https://acmedental.com',
  domain: 'acmedental.com',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setFlag(value: string | undefined) {
  if (value === undefined) {
    delete process.env['SCAN_LIVE_RETRIEVAL'];
  } else {
    process.env['SCAN_LIVE_RETRIEVAL'] = value;
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('queryEngine() — retrieval_mode under flag OFF (default)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lastCallArgs = null;
    setFlag(undefined); // flag OFF — default
  });

  afterEach(() => {
    setFlag(undefined);
  });

  it('(1a) chatgpt → retrieval_mode=parametric_memory, no provider_note', async () => {
    const result = await queryEngine('chatgpt', CTX, INPUT);
    expect(result.retrieval_mode).toBe('parametric_memory');
    expect(result.provider_note).toBeUndefined();
  });

  it('(1b) gemini → retrieval_mode=parametric_memory', async () => {
    const result = await queryEngine('gemini', CTX, INPUT);
    expect(result.retrieval_mode).toBe('parametric_memory');
  });

  it('(1c) perplexity → retrieval_mode=live_web (sonar is online by nature)', async () => {
    const result = await queryEngine('perplexity', CTX, INPUT);
    expect(result.retrieval_mode).toBe('live_web');
  });

  it('(3a) flag OFF + chatgpt → uses openai/gpt-4o model', async () => {
    await queryEngine('chatgpt', CTX, INPUT);
    expect(lastCallArgs?.model).toBe('openai/gpt-4o');
  });

  it('(3b) flag OFF + gemini → uses google/gemini-2.5-flash model', async () => {
    await queryEngine('gemini', CTX, INPUT);
    expect(lastCallArgs?.model).toBe('google/gemini-2.5-flash');
  });

  it('(3c) flag OFF + perplexity → uses perplexity/sonar model', async () => {
    await queryEngine('perplexity', CTX, INPUT);
    expect(lastCallArgs?.model).toBe('perplexity/sonar');
  });

  it('(3d) flag OFF → request body has NO web/plugins key (byte-identical to prior impl)', async () => {
    await queryEngine('chatgpt', CTX, INPUT);
    // web field must be absent — not false, not undefined-but-present
    expect(lastCallArgs).not.toHaveProperty('web');
    expect(lastCallArgs).not.toHaveProperty('webMaxResults');
  });

  it('(7) backward compat: callers passing no web option get the same model/body as before', async () => {
    await queryEngine('chatgpt', CTX, INPUT);
    // Model must match the historic ENGINE_MODELS map
    expect(lastCallArgs?.model).toBe('openai/gpt-4o');
    // No plugin payload
    expect(lastCallArgs).not.toHaveProperty('web');
  });
});

describe('queryEngine() — retrieval_mode under flag ON (SCAN_LIVE_RETRIEVAL=true)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lastCallArgs = null;
    setFlag('true');
  });

  afterEach(() => {
    setFlag(undefined);
  });

  it('(2a) flag ON + chatgpt → retrieval_mode=live_web', async () => {
    const result = await queryEngine('chatgpt', CTX, INPUT);
    expect(result.retrieval_mode).toBe('live_web');
  });

  it('(2b) flag ON + gemini → retrieval_mode=parametric_memory (gemini stays parametric this wave)', async () => {
    const result = await queryEngine('gemini', CTX, INPUT);
    expect(result.retrieval_mode).toBe('parametric_memory');
  });

  it('(2c) flag ON + perplexity → retrieval_mode=live_web', async () => {
    const result = await queryEngine('perplexity', CTX, INPUT);
    expect(result.retrieval_mode).toBe('live_web');
  });

  it('(4a) flag ON + chatgpt → uses openai/gpt-4o-mini model', async () => {
    await queryEngine('chatgpt', CTX, INPUT);
    expect(lastCallArgs?.model).toBe('openai/gpt-4o-mini');
  });

  it('(4b) flag ON + chatgpt → request includes web:true (web_search plugin enabled)', async () => {
    await queryEngine('chatgpt', CTX, INPUT);
    expect(lastCallArgs?.web).toBe(true);
  });

  it('(4c) flag ON + chatgpt → webMaxResults is set', async () => {
    await queryEngine('chatgpt', CTX, INPUT);
    expect(typeof lastCallArgs?.webMaxResults).toBe('number');
    expect(lastCallArgs?.webMaxResults).toBeGreaterThan(0);
  });

  it('(4d) flag ON + chatgpt → provider_note encodes the proxy label (NOT production ChatGPT)', async () => {
    const result = await queryEngine('chatgpt', CTX, INPUT);
    expect(result.provider_note).toBe('proxy:gpt-4o-mini+web');
  });

  it('(5a) flag ON + perplexity → uses perplexity/sonar model', async () => {
    await queryEngine('perplexity', CTX, INPUT);
    expect(lastCallArgs?.model).toBe('perplexity/sonar');
  });

  it('(5b) flag ON + perplexity → does NOT get the web plugin (native grounding)', async () => {
    await queryEngine('perplexity', CTX, INPUT);
    expect(lastCallArgs?.web).toBeUndefined();
  });

  it('(5c) flag ON + perplexity → citations populated when sourceUrls present', async () => {
    // Override mock for this test to return citation URLs
    mockCallOpenRouter.mockResolvedValueOnce({
      text: JSON.stringify({ recommendations: [], is_mentioned: false, rank_position: null, sentiment: null }),
      prompt_tokens: 10,
      completion_tokens: 5,
      sourceUrls: ['https://example.com/source-1', 'https://example.com/source-2'],
    });

    const result = await queryEngine('perplexity', CTX, INPUT);
    expect(result.citations).toEqual(['https://example.com/source-1', 'https://example.com/source-2']);
  });

  it('(5d) flag ON + perplexity → citations absent when sourceUrls empty', async () => {
    const result = await queryEngine('perplexity', CTX, INPUT);
    // citations field should be absent (not set) when sourceUrls is empty
    expect(result.citations).toBeUndefined();
  });

  it('(6a) flag ON + gemini → still uses google/gemini-2.5-flash (parametric, no plugin)', async () => {
    await queryEngine('gemini', CTX, INPUT);
    expect(lastCallArgs?.model).toBe('google/gemini-2.5-flash');
    expect(lastCallArgs?.web).toBeUndefined();
  });

  it('(6b) flag ON + gemini → no provider_note (not a proxy this wave)', async () => {
    const result = await queryEngine('gemini', CTX, INPUT);
    expect(result.provider_note).toBeUndefined();
  });
});

describe('queryEngine() — flag set to non-"true" values', () => {
  afterEach(() => {
    setFlag(undefined);
  });

  it('flag=false → behaves as flag OFF (uses original models)', async () => {
    vi.clearAllMocks();
    lastCallArgs = null;
    setFlag('false');
    await queryEngine('chatgpt', CTX, INPUT);
    expect(lastCallArgs?.model).toBe('openai/gpt-4o');
    expect(lastCallArgs?.web).toBeUndefined();
  });

  it('flag=1 → behaves as flag OFF (strict "true" string match only)', async () => {
    vi.clearAllMocks();
    lastCallArgs = null;
    setFlag('1');
    await queryEngine('chatgpt', CTX, INPUT);
    expect(lastCallArgs?.model).toBe('openai/gpt-4o');
    expect(lastCallArgs?.web).toBeUndefined();
  });
});
