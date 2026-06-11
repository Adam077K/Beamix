/**
 * Tests for scan-free-v2-deps.ts helpers.
 *
 * These tests exercise the extracted helpers in isolation, with NO real network
 * calls, NO real Supabase writes, and NO Inngest harness.
 *
 * Test matrix:
 *   (1) isScanMeasurementV2Enabled — true only when env var is exactly 'true'.
 *   (2) buildV2Input — query_text formatting (global vs specific location);
 *       intent_bucket; identity shape; engines array.
 *   (3) mapV2ToFreeScanResults — visibility_score from headline_band.point;
 *       scan_v2 is attached; legacy fields are populated; issues mapping by tier.
 *   (4) buildV2Deps — probe dep resolves correct engine→model and retrieval_mode;
 *       resolveCompetitorDomain returns null (conservative);
 *       loadCatalog/auditSite/detectFactors reference the real implementations.
 *   (5) Flag-gated integration: with flag ON and stubbed deps, assembleFreeScanV2
 *       returns a blob with scan_v2 present (no network/Supabase calls).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isScanMeasurementV2Enabled,
  buildV2Input,
  mapV2ToFreeScanResults,
  buildV2Deps,
} from '../scan-free-v2-deps';
import type { BusinessContext, ScanInput } from '../../../lib/scan/types';
import type { ScanV2Result } from '../../../lib/scan/scan-v2-types';
import type { AssembleFreeScanV2Deps } from '../../../lib/scan/assemble-free-scan-v2';
import type { RankedGap } from '../../../lib/scan/gap-types';

// ---------------------------------------------------------------------------
// Mock dependencies for buildV2Deps spot-check
// ---------------------------------------------------------------------------

vi.mock('../../../lib/scan/openrouter-client', () => ({
  callOpenRouter: vi.fn().mockResolvedValue({
    text: '{"mentioned":false}',
    prompt_tokens: 5,
    completion_tokens: 5,
    sourceUrls: ['https://example.com'],
  }),
  resolveOpenRouterKey: vi.fn().mockReturnValue('test-key'),
  requireEnv: vi.fn().mockReturnValue('test-key'),
}));

vi.mock('../../../lib/scan/site-audit', () => ({
  auditSite: vi.fn().mockResolvedValue({
    url: 'https://test.com',
    fetchedAt: '2026-06-11T00:00:00.000Z',
    page: { fetchStatus: 'ok', title: 'Test', wordCount: 100 },
    robotsTxt: { fetchStatus: 'unavailable' },
    sitemapXml: { present: false },
    llmsTxt: { present: false },
  }),
}));

vi.mock('../../../lib/scan/factor-detection', () => ({
  detectFactors: vi.fn().mockResolvedValue([]),
}));

vi.mock('../../../lib/scan/factor-catalog', () => ({
  loadFactorCatalog: vi.fn().mockResolvedValue([]),
  buildGapList: vi.fn().mockReturnValue([]),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_CTX_WITH_LOCATION: BusinessContext = {
  business_name: 'Acme Dental',
  website_url: 'https://acmedental.co.il',
  business_summary: 'General dentistry practice.',
  key_services: ['cleanings', 'implants'],
  target_audience: 'local families',
  category: 'dental clinic',
  location: 'Tel Aviv',
};

const MOCK_CTX_GLOBAL: BusinessContext = {
  ...MOCK_CTX_WITH_LOCATION,
  location: 'global',
};

const MOCK_CTX_EMPTY_LOCATION: BusinessContext = {
  ...MOCK_CTX_WITH_LOCATION,
  location: '',
};

const MOCK_SCAN_INPUT: ScanInput = {
  scan_id: 'scan-001',
  business_name: 'Acme Dental',
  website_url: 'https://acmedental.co.il',
  domain: 'acmedental.co.il',
};

// ---------------------------------------------------------------------------
// Minimal ScanV2Result factory for mapV2ToFreeScanResults tests
// ---------------------------------------------------------------------------

function makeScanV2Result(overrides: Partial<ScanV2Result> = {}): ScanV2Result {
  return {
    engine_subscores: [
      {
        engine: 'chatgpt',
        band: { point: 42, ci_low: 35, ci_high: 49, sample_n: 1, low_confidence: true },
        dimensions: {
          presence: 0.4,
          position: null,
          cited_as_source: 0,
          share_of_voice: 0.2,
          breadth: 0.3,
          sentiment: 'unknown',
        },
        sample_n: 1,
      },
      {
        engine: 'gemini',
        band: { point: 30, ci_low: 22, ci_high: 38, sample_n: 1, low_confidence: true },
        dimensions: {
          presence: 0.3,
          position: null,
          cited_as_source: 0,
          share_of_voice: 0.1,
          breadth: 0.2,
          sentiment: 'unknown',
        },
        sample_n: 1,
      },
      {
        engine: 'perplexity',
        band: { point: 35, ci_low: 28, ci_high: 42, sample_n: 1, low_confidence: true },
        dimensions: {
          presence: 0.35,
          position: null,
          cited_as_source: 0,
          share_of_voice: 0.15,
          breadth: 0.25,
          sentiment: 'unknown',
        },
        sample_n: 1,
      },
    ],
    headline_band: {
      point: 35,
      ci_low: 28,
      ci_high: 42,
      sample_n: 1,
      low_confidence: true,
    },
    gap_list: [],
    playbooks: [],
    competitors: [],
    narration: {
      text: 'Your business has limited AI search visibility.',
      degraded: false,
      evidence_tokens_used: 3,
    },
    meta: {
      run_kind: 'free',
      generated_at: '2026-06-11T00:00:00.000Z',
      model_ids: {
        sentiment: 'google/gemini-flash-1.5',
        narration: 'google/gemini-2.5-flash',
      },
      degraded: false,
    },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// RankedGap factory for tests
// ---------------------------------------------------------------------------

function makeRankedGap(overrides: Partial<RankedGap> & { factor_key: string }): RankedGap {
  return {
    factor_key: overrides.factor_key,
    display_name: overrides.display_name ?? overrides.factor_key,
    tier: overrides.tier ?? 1,
    impact_weight: overrides.impact_weight ?? 0.8,
    playbook_id: overrides.playbook_id ?? null,
    promises_lift: overrides.promises_lift ?? true,
    contrastive_count: overrides.contrastive_count ?? 0,
    competitors_with_factor: overrides.competitors_with_factor ?? [],
    contrastive_evidence: overrides.contrastive_evidence ?? 'Ordered by impact (no competitor comparison available this scan)',
    fixability: overrides.fixability ?? 'medium',
    effort_score: overrides.effort_score ?? 2,
    rank: overrides.rank ?? 1,
    ordering_mode: overrides.ordering_mode ?? 'impact_fallback',
  };
}

// ---------------------------------------------------------------------------
// (1) isScanMeasurementV2Enabled
// ---------------------------------------------------------------------------

describe('isScanMeasurementV2Enabled', () => {
  const originalEnv = process.env['SCAN_MEASUREMENT_V2'];

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env['SCAN_MEASUREMENT_V2'];
    } else {
      process.env['SCAN_MEASUREMENT_V2'] = originalEnv;
    }
  });

  it('returns true when SCAN_MEASUREMENT_V2 is exactly "true"', () => {
    process.env['SCAN_MEASUREMENT_V2'] = 'true';
    expect(isScanMeasurementV2Enabled()).toBe(true);
  });

  it('returns false when SCAN_MEASUREMENT_V2 is unset', () => {
    delete process.env['SCAN_MEASUREMENT_V2'];
    expect(isScanMeasurementV2Enabled()).toBe(false);
  });

  it('returns false when SCAN_MEASUREMENT_V2 is "false"', () => {
    process.env['SCAN_MEASUREMENT_V2'] = 'false';
    expect(isScanMeasurementV2Enabled()).toBe(false);
  });

  it('returns false when SCAN_MEASUREMENT_V2 is "True" (case-sensitive)', () => {
    process.env['SCAN_MEASUREMENT_V2'] = 'True';
    expect(isScanMeasurementV2Enabled()).toBe(false);
  });

  it('returns false when SCAN_MEASUREMENT_V2 is "1"', () => {
    process.env['SCAN_MEASUREMENT_V2'] = '1';
    expect(isScanMeasurementV2Enabled()).toBe(false);
  });

  it('returns false when SCAN_MEASUREMENT_V2 is empty string', () => {
    process.env['SCAN_MEASUREMENT_V2'] = '';
    expect(isScanMeasurementV2Enabled()).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// (2) buildV2Input
// ---------------------------------------------------------------------------

describe('buildV2Input', () => {
  it('produces query_text with location suffix when location is specific', () => {
    const input = buildV2Input(MOCK_CTX_WITH_LOCATION, MOCK_SCAN_INPUT);
    expect(input.queries).toHaveLength(1);
    expect(input.queries[0]!.query_text).toBe('best dental clinic in Tel Aviv');
  });

  it('produces query_text WITHOUT location suffix when location is "global"', () => {
    const input = buildV2Input(MOCK_CTX_GLOBAL, MOCK_SCAN_INPUT);
    expect(input.queries[0]!.query_text).toBe('best dental clinic');
  });

  it('produces query_text WITHOUT location suffix when location is empty string', () => {
    const input = buildV2Input(MOCK_CTX_EMPTY_LOCATION, MOCK_SCAN_INPUT);
    expect(input.queries[0]!.query_text).toBe('best dental clinic');
  });

  it('sets intent_bucket to "category_geo"', () => {
    const input = buildV2Input(MOCK_CTX_WITH_LOCATION, MOCK_SCAN_INPUT);
    expect(input.queries[0]!.intent_bucket).toBe('category_geo');
  });

  it('sets engines to all three free-scan engines', () => {
    const input = buildV2Input(MOCK_CTX_WITH_LOCATION, MOCK_SCAN_INPUT);
    expect(input.engines).toEqual(['chatgpt', 'gemini', 'perplexity']);
  });

  it('sets identity with business_name and domain from ctx', () => {
    const input = buildV2Input(MOCK_CTX_WITH_LOCATION, MOCK_SCAN_INPUT);
    expect(input.identity.business_name).toBe('Acme Dental');
    expect(input.identity.domain).toBe('https://acmedental.co.il');
    expect(input.identity.aliases).toEqual([]);
  });

  it('sets query category and location from ctx', () => {
    const input = buildV2Input(MOCK_CTX_WITH_LOCATION, MOCK_SCAN_INPUT);
    expect(input.queries[0]!.category).toBe('dental clinic');
    expect(input.queries[0]!.location).toBe('Tel Aviv');
  });
});

// ---------------------------------------------------------------------------
// (3) mapV2ToFreeScanResults
// ---------------------------------------------------------------------------

describe('mapV2ToFreeScanResults', () => {
  it('sets visibility_score from headline_band.point (rounded)', () => {
    const result = mapV2ToFreeScanResults(makeScanV2Result({
      headline_band: { point: 42.7, ci_low: 35, ci_high: 50, sample_n: 1, low_confidence: true },
    }));
    expect(result.visibility_score).toBe(43);
  });

  it('sets visibility_score to 0 when headline_band.point is 0', () => {
    const result = mapV2ToFreeScanResults(makeScanV2Result({
      headline_band: { point: 0, ci_low: 0, ci_high: 100, sample_n: 0, low_confidence: true },
    }));
    expect(result.visibility_score).toBe(0);
  });

  it('attaches scan_v2 to the blob', () => {
    const v2 = makeScanV2Result();
    const result = mapV2ToFreeScanResults(v2);
    expect(result.scan_v2).toBeDefined();
    expect(result.scan_v2).toBe(v2);
  });

  it('sets engines_checked to the number of engine subscores', () => {
    const result = mapV2ToFreeScanResults(makeScanV2Result());
    expect(result.engines_checked).toBe(3);
  });

  it('sets engines_checked to 3 when no subscores are present (fallback)', () => {
    const result = mapV2ToFreeScanResults(makeScanV2Result({ engine_subscores: [] }));
    expect(result.engines_checked).toBe(3);
  });

  it('produces empty issues and total_issues=0 when gap_list is empty', () => {
    // RankedGap entries are always absent gaps; an empty gap_list means no absent gaps.
    const result = mapV2ToFreeScanResults(makeScanV2Result({ gap_list: [] }));
    expect(result.issues).toHaveLength(0);
    expect(result.total_issues).toBe(0);
  });

  it('maps tier-1 gaps to "Missing from AI answers" category', () => {
    const result = mapV2ToFreeScanResults(makeScanV2Result({
      gap_list: [makeRankedGap({ factor_key: 'citations', tier: 1, impact_weight: 0.9 })],
    }));
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]!.category).toBe('Missing from AI answers');
    expect(result.issues[0]!.count).toBe(1);
    expect(result.total_issues).toBe(1);
  });

  it('maps tier-2 gaps to "AI citation gaps" category', () => {
    const result = mapV2ToFreeScanResults(makeScanV2Result({
      gap_list: [makeRankedGap({ factor_key: 'schema', tier: 2, impact_weight: 0.5 })],
    }));
    expect(result.issues[0]!.category).toBe('AI citation gaps');
  });

  it('maps tier-3 gaps to "Site hygiene gaps" category', () => {
    const result = mapV2ToFreeScanResults(makeScanV2Result({
      gap_list: [makeRankedGap({ factor_key: 'llms_txt', tier: 3, impact_weight: 0.1, promises_lift: false })],
    }));
    expect(result.issues[0]!.category).toBe('Site hygiene gaps');
  });

  it('total_issues equals sum of all issue group counts', () => {
    const result = mapV2ToFreeScanResults(makeScanV2Result({
      gap_list: [
        makeRankedGap({ factor_key: 'g1', tier: 1, impact_weight: 0.8 }),
        makeRankedGap({ factor_key: 'g2', tier: 1, impact_weight: 0.9 }),
        makeRankedGap({ factor_key: 'g3', tier: 2, impact_weight: 0.5 }),
      ],
    }));

    expect(result.total_issues).toBe(3);
    // Two tier-1 gaps grouped together
    const tier1Group = result.issues.find((i) => i.category === 'Missing from AI answers');
    expect(tier1Group?.count).toBe(2);
    const tier2Group = result.issues.find((i) => i.category === 'AI citation gaps');
    expect(tier2Group?.count).toBe(1);
  });

  it('maps gaps with tier outside 1-3 to "Other gaps" category', () => {
    const result = mapV2ToFreeScanResults(makeScanV2Result({
      gap_list: [makeRankedGap({ factor_key: 'oddtier', tier: 99, impact_weight: 0.5 })],
    }));
    expect(result.issues[0]!.category).toBe('Other gaps');
  });
});

// ---------------------------------------------------------------------------
// (4) buildV2Deps
// ---------------------------------------------------------------------------

describe('buildV2Deps', () => {
  const mockSupabase = {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('probe dep maps chatgpt → openai/gpt-4o (flag OFF default)', async () => {
    delete process.env['SCAN_LIVE_RETRIEVAL'];
    const { callOpenRouter } = await import('../../../lib/scan/openrouter-client');
    vi.mocked(callOpenRouter).mockResolvedValue({
      text: 'response',
      prompt_tokens: 5,
      completion_tokens: 5,
      sourceUrls: ['https://cite.com'],
    });

    const deps = buildV2Deps(mockSupabase as Parameters<typeof buildV2Deps>[0]);
    await deps.probe('chatgpt', 'unused-model-arg', { system: 'sys', user: 'usr' });

    expect(vi.mocked(callOpenRouter)).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'openai/gpt-4o' }),
    );
  });

  it('probe dep maps gemini → google/gemini-2.5-flash (flag OFF)', async () => {
    delete process.env['SCAN_LIVE_RETRIEVAL'];
    const { callOpenRouter } = await import('../../../lib/scan/openrouter-client');

    const deps = buildV2Deps(mockSupabase as Parameters<typeof buildV2Deps>[0]);
    await deps.probe('gemini', 'unused', { system: 'sys', user: 'usr' });

    expect(vi.mocked(callOpenRouter)).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'google/gemini-2.5-flash' }),
    );
  });

  it('probe dep maps perplexity → perplexity/sonar (flag OFF)', async () => {
    delete process.env['SCAN_LIVE_RETRIEVAL'];
    const { callOpenRouter } = await import('../../../lib/scan/openrouter-client');

    const deps = buildV2Deps(mockSupabase as Parameters<typeof buildV2Deps>[0]);
    await deps.probe('perplexity', 'unused', { system: 'sys', user: 'usr' });

    expect(vi.mocked(callOpenRouter)).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'perplexity/sonar' }),
    );
  });

  it('probe dep returns live_web for perplexity (flag OFF)', async () => {
    delete process.env['SCAN_LIVE_RETRIEVAL'];
    const { callOpenRouter } = await import('../../../lib/scan/openrouter-client');
    vi.mocked(callOpenRouter).mockResolvedValue({
      text: 'r', prompt_tokens: 1, completion_tokens: 1, sourceUrls: [],
    });

    const deps = buildV2Deps(mockSupabase as Parameters<typeof buildV2Deps>[0]);
    const result = await deps.probe('perplexity', 'unused', { system: 'sys', user: 'usr' });

    expect(result.retrieval_mode).toBe('live_web');
  });

  it('probe dep returns parametric_memory for chatgpt and gemini (flag OFF)', async () => {
    delete process.env['SCAN_LIVE_RETRIEVAL'];
    const { callOpenRouter } = await import('../../../lib/scan/openrouter-client');
    vi.mocked(callOpenRouter).mockResolvedValue({
      text: 'r', prompt_tokens: 1, completion_tokens: 1, sourceUrls: [],
    });

    const deps = buildV2Deps(mockSupabase as Parameters<typeof buildV2Deps>[0]);

    const chatgptResult = await deps.probe('chatgpt', 'unused', { system: 'sys', user: 'usr' });
    expect(chatgptResult.retrieval_mode).toBe('parametric_memory');

    const geminiResult = await deps.probe('gemini', 'unused', { system: 'sys', user: 'usr' });
    expect(geminiResult.retrieval_mode).toBe('parametric_memory');
  });

  it('probe dep plumbs citations from sourceUrls', async () => {
    delete process.env['SCAN_LIVE_RETRIEVAL'];
    const { callOpenRouter } = await import('../../../lib/scan/openrouter-client');
    vi.mocked(callOpenRouter).mockResolvedValue({
      text: 'r', prompt_tokens: 1, completion_tokens: 1,
      sourceUrls: ['https://a.com', 'https://b.com'],
    });

    const deps = buildV2Deps(mockSupabase as Parameters<typeof buildV2Deps>[0]);
    const result = await deps.probe('chatgpt', 'unused', { system: 'sys', user: 'usr' });

    expect(result.citations).toEqual(['https://a.com', 'https://b.com']);
  });

  it('probe dep returns undefined citations when sourceUrls is empty', async () => {
    delete process.env['SCAN_LIVE_RETRIEVAL'];
    const { callOpenRouter } = await import('../../../lib/scan/openrouter-client');
    vi.mocked(callOpenRouter).mockResolvedValue({
      text: 'r', prompt_tokens: 1, completion_tokens: 1, sourceUrls: [],
    });

    const deps = buildV2Deps(mockSupabase as Parameters<typeof buildV2Deps>[0]);
    const result = await deps.probe('chatgpt', 'unused', { system: 'sys', user: 'usr' });

    expect(result.citations).toBeUndefined();
  });

  it('resolveCompetitorDomain always returns null (conservative)', () => {
    const deps = buildV2Deps(mockSupabase as Parameters<typeof buildV2Deps>[0]);
    expect(deps.resolveCompetitorDomain?.('Any Competitor Name')).toBeNull();
    expect(deps.resolveCompetitorDomain?.('Competitor.com')).toBeNull();
    expect(deps.resolveCompetitorDomain?.('')).toBeNull();
  });

  it('loadCatalog calls loadFactorCatalog with the provided supabase client', async () => {
    const { loadFactorCatalog } = await import('../../../lib/scan/factor-catalog');

    const deps = buildV2Deps(mockSupabase as Parameters<typeof buildV2Deps>[0]);
    await deps.loadCatalog();

    expect(vi.mocked(loadFactorCatalog)).toHaveBeenCalledTimes(1);
  });

  it('auditSite dep references the real auditSite function', async () => {
    const { auditSite } = await import('../../../lib/scan/site-audit');

    const deps = buildV2Deps(mockSupabase as Parameters<typeof buildV2Deps>[0]);
    await deps.auditSite('https://test.com');

    expect(vi.mocked(auditSite)).toHaveBeenCalledWith('https://test.com');
  });

  it('detectFactors dep references the real detectFactors function', async () => {
    const { detectFactors } = await import('../../../lib/scan/factor-detection');

    const deps = buildV2Deps(mockSupabase as Parameters<typeof buildV2Deps>[0]);
    await deps.detectFactors({
      siteAudit: {
        url: 'https://test.com',
        fetchedAt: '2026-06-11T00:00:00.000Z',
        page: { fetchStatus: 'unavailable' },
        robotsTxt: { fetchStatus: 'unavailable' },
        sitemapXml: { present: false },
        llmsTxt: { present: false },
      },
    });

    expect(vi.mocked(detectFactors)).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// (5) Flag-gated integration: assembleFreeScanV2 returns blob with scan_v2
// ---------------------------------------------------------------------------

describe('flag-gated integration (assembleFreeScanV2 with stubbed deps)', () => {
  afterEach(() => {
    delete process.env['SCAN_MEASUREMENT_V2'];
  });

  it('with flag OFF, isScanMeasurementV2Enabled returns false (no assemble path runs)', () => {
    delete process.env['SCAN_MEASUREMENT_V2'];
    expect(isScanMeasurementV2Enabled()).toBe(false);
  });

  it('with flag ON and fully-stubbed deps, assembleFreeScanV2 returns a result with scan_v2', async () => {
    process.env['SCAN_MEASUREMENT_V2'] = 'true';
    expect(isScanMeasurementV2Enabled()).toBe(true);

    // Import assembleFreeScanV2 directly to test the full pipeline with stubbed deps.
    // This verifies that buildV2Input + stubbed deps produce a valid ScanV2Result.
    const { assembleFreeScanV2 } = await import('../../../lib/scan/assemble-free-scan-v2');

    const input = buildV2Input(MOCK_CTX_WITH_LOCATION, MOCK_SCAN_INPUT);

    // Fully-stubbed deps — zero network calls
    const stubbedDeps: AssembleFreeScanV2Deps = {
      probe: vi.fn().mockResolvedValue({
        text: JSON.stringify({ mentioned: false }),
        citations: undefined,
        retrieval_mode: 'parametric_memory' as const,
      }),
      sentimentCall: vi.fn().mockResolvedValue({
        text: JSON.stringify({ sentiment: 'unknown' }),
        prompt_tokens: 5,
        completion_tokens: 5,
        sourceUrls: [],
      }),
      narrationCall: vi.fn().mockResolvedValue({
        text: JSON.stringify({ narration: 'Your business has limited visibility.' }),
        prompt_tokens: 10,
        completion_tokens: 10,
        sourceUrls: [],
      }),
      auditSite: vi.fn().mockResolvedValue({
        url: 'https://acmedental.co.il',
        fetchedAt: '2026-06-11T00:00:00.000Z',
        page: { fetchStatus: 'ok', title: 'Acme Dental', wordCount: 500 },
        robotsTxt: { fetchStatus: 'unavailable' },
        sitemapXml: { present: false },
        llmsTxt: { present: false },
      }),
      detectFactors: vi.fn().mockResolvedValue([]),
      loadCatalog: vi.fn().mockResolvedValue([]),
      resolveCompetitorDomain: () => null,
      now: () => '2026-06-11T00:00:00.000Z',
    };

    const v2Result = await assembleFreeScanV2(input, stubbedDeps);

    // Verify the result has the expected shape
    expect(v2Result).toBeDefined();
    expect(v2Result.meta.run_kind).toBe('free');
    expect(v2Result.engine_subscores).toHaveLength(3);
    expect(v2Result.headline_band).toBeDefined();
    expect(typeof v2Result.headline_band.point).toBe('number');

    // Map to FreeScanResults and verify scan_v2 is present
    const blob = mapV2ToFreeScanResults(v2Result);
    expect(blob.scan_v2).toBeDefined();
    expect(blob.scan_v2).toBe(v2Result);
    expect(typeof blob.visibility_score).toBe('number');
    expect(blob.engines_checked).toBe(3);
    expect(Array.isArray(blob.issues)).toBe(true);
    expect(typeof blob.total_issues).toBe('number');
  });
});
