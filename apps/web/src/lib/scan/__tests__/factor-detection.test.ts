/**
 * Unit tests for factor-detection.ts.
 *
 * Coverage:
 *   (1)  Returns exactly 16 observations in canonical order
 *   (2)  All observations have truth_class='FACT'
 *   (3)  Pending factors have status='pending' and source='external_api_pending'
 *   (4)  ai_bot_allowlist: robots unavailable → 'unknown'
 *   (5)  ai_bot_allowlist: GPTBot disallowed → 'absent'
 *   (6)  ai_bot_allowlist: all allowed → 'present'
 *   (7)  basic_schema: Organization present → 'present'
 *   (8)  basic_schema: no schema types → 'absent'
 *   (9)  basic_schema: page unavailable → 'unknown'
 *   (10) schema_beyond_basics: advanced types present → 'present'
 *   (11) schema_beyond_basics: only basic types → 'absent'
 *   (12) extractable_structure: good structure → 'present'
 *   (13) extractable_structure: poor structure → 'absent'
 *   (14) content_freshness: fresh dateModified → 'present'
 *   (15) content_freshness: stale dateModified → 'absent'
 *   (16) content_freshness: no dateModified → 'unknown'
 *   (17) llms_txt: present → 'present'
 *   (18) llms_txt: absent → 'absent'
 *   (19) wikidata_entity: entity found → 'present' (fetch mocked)
 *   (20) wikidata_entity: no results → 'absent' (fetch mocked)
 *   (21) wikidata_entity: timeout → 'unknown' (fetch mocked to reject)
 *   (22) wikidata_entity: no businessContext → 'unknown'
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { detectFactors } from '../factor-detection';
import type { DetectionInput } from '../factor-detection';
import type { SiteAudit } from '../types';

// ---------------------------------------------------------------------------
// SiteAudit fixture builders
// ---------------------------------------------------------------------------

function makeRobotsOk(disallowed: string[] = []): SiteAudit['robotsTxt'] {
  const crawlers: Record<string, 'allowed' | 'disallowed'> = {
    GPTBot: 'allowed',
    'Google-Extended': 'allowed',
    PerplexityBot: 'allowed',
    'ChatGPT-User': 'allowed',
    CCBot: 'allowed',
    'Claude-Web': 'allowed',
    'anthropic-ai': 'allowed',
  };
  for (const ua of disallowed) {
    crawlers[ua] = 'disallowed';
  }
  return { fetchStatus: 'ok', crawlers };
}

function makeSiteAudit(overrides: Partial<SiteAudit> & { pageOverrides?: Partial<SiteAudit['page']> } = {}): SiteAudit {
  const { pageOverrides, ...rest } = overrides;
  return {
    url: 'https://example.com',
    fetchedAt: new Date().toISOString(),
    page: {
      fetchStatus: 'ok',
      h1Count: 1,
      h2Count: 3,
      wordCount: 500,
      jsonLdTypes: ['Organization'],
      ...pageOverrides,
    },
    robotsTxt: makeRobotsOk(),
    sitemapXml: { present: true },
    llmsTxt: { present: false },
    ...rest,
  };
}

// ---------------------------------------------------------------------------
// Canonical 16 factor keys (must match CANONICAL_FACTOR_KEYS in factor-detection.ts)
// ---------------------------------------------------------------------------

const ALL_FACTOR_KEYS = [
  'on_page_princeton_tactics',
  'extractable_structure',
  'content_freshness',
  'listicle_inclusion',
  'reddit_quora_presence',
  'review_systems',
  'earned_media_pr',
  'wikidata_entity',
  'ai_bot_allowlist',
  'topical_authority_cluster',
  'linkedin_presence',
  'youtube_presence',
  'basic_schema',
  'llms_txt',
  'schema_beyond_basics',
  'backlinks_dr',
];

// ---------------------------------------------------------------------------
// (1-3) Invariants: count, truth_class, pending status
// ---------------------------------------------------------------------------

describe('detectFactors() — invariants', () => {
  it('(1) returns exactly 16 observations covering all factor keys', async () => {
    const audit = makeSiteAudit();
    // Mock fetch for Wikidata to avoid real HTTP
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ search: [{ id: 'Q1', label: 'Test Entity' }] }),
    });
    vi.stubGlobal('fetch', mockFetch);
    try {
      const obs = await detectFactors({ siteAudit: audit, businessContext: { business_name: 'Test', website_url: '', business_summary: '', key_services: [], target_audience: '', category: '', location: '' } });
      expect(obs).toHaveLength(16);
      const keys = obs.map((o) => o.factor_key);
      for (const k of ALL_FACTOR_KEYS) {
        expect(keys).toContain(k);
      }
      // Order check: keys should be in canonical order
      expect(keys).toEqual(ALL_FACTOR_KEYS);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('(2) all observations have truth_class="FACT" — including wikidata network path', async () => {
    const audit = makeSiteAudit();
    // Provide businessContext so the wikidata detector actually calls fetch (network path covered).
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ search: [{ id: 'Q1', label: 'X' }] }),
    }));
    try {
      const obs = await detectFactors({
        siteAudit: audit,
        businessContext: {
          business_name: 'X Corp',
          website_url: '',
          business_summary: '',
          key_services: [],
          target_audience: '',
          category: '',
          location: '',
        },
      });
      for (const o of obs) {
        expect(o.truth_class).toBe('FACT');
      }
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('(3) pending factors have status="pending" and source="external_api_pending"', async () => {
    const pendingKeys = [
      'on_page_princeton_tactics',
      'listicle_inclusion',
      'reddit_quora_presence',
      'review_systems',
      'earned_media_pr',
      'topical_authority_cluster',
      'linkedin_presence',
      'youtube_presence',
      'backlinks_dr',
    ];
    const audit = makeSiteAudit();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ search: [] }),
    }));
    try {
      const obs = await detectFactors({ siteAudit: audit });
      for (const key of pendingKeys) {
        const o = obs.find((x) => x.factor_key === key);
        expect(o, `Missing observation for ${key}`).toBeDefined();
        expect(o!.status).toBe('pending');
        expect(o!.source).toBe('external_api_pending');
      }
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

// ---------------------------------------------------------------------------
// (4-6) ai_bot_allowlist
// ---------------------------------------------------------------------------

describe('detectFactors() — ai_bot_allowlist', () => {
  it('(4) robots unavailable → unknown', async () => {
    const audit = makeSiteAudit({ robotsTxt: { fetchStatus: 'unavailable' } });
    const obs = await detectFactors({ siteAudit: audit });
    const o = obs.find((x) => x.factor_key === 'ai_bot_allowlist')!;
    expect(o.status).toBe('unknown');
    expect(o.evidence).toContain('FM-5');
  });

  it('(5) GPTBot disallowed → absent', async () => {
    const audit = makeSiteAudit({ robotsTxt: makeRobotsOk(['GPTBot']) });
    const obs = await detectFactors({ siteAudit: audit });
    const o = obs.find((x) => x.factor_key === 'ai_bot_allowlist')!;
    expect(o.status).toBe('absent');
    expect(o.evidence).toContain('GPTBot');
  });

  it('(6) all AI crawlers allowed → present', async () => {
    const audit = makeSiteAudit({ robotsTxt: makeRobotsOk([]) });
    const obs = await detectFactors({ siteAudit: audit });
    const o = obs.find((x) => x.factor_key === 'ai_bot_allowlist')!;
    expect(o.status).toBe('present');
  });
});

// ---------------------------------------------------------------------------
// (7-9) basic_schema
// ---------------------------------------------------------------------------

describe('detectFactors() — basic_schema', () => {
  it('(7) Organization JSON-LD → present', async () => {
    const audit = makeSiteAudit({ pageOverrides: { jsonLdTypes: ['Organization'] } });
    const obs = await detectFactors({ siteAudit: audit });
    const o = obs.find((x) => x.factor_key === 'basic_schema')!;
    expect(o.status).toBe('present');
    expect(o.evidence).toContain('Organization');
  });

  it('(8) no schema types → absent', async () => {
    const audit = makeSiteAudit({ pageOverrides: { jsonLdTypes: [] } });
    const obs = await detectFactors({ siteAudit: audit });
    const o = obs.find((x) => x.factor_key === 'basic_schema')!;
    expect(o.status).toBe('absent');
  });

  it('(8b) case-insensitive: "organization" matches', async () => {
    const audit = makeSiteAudit({ pageOverrides: { jsonLdTypes: ['organization'] } });
    const obs = await detectFactors({ siteAudit: audit });
    const o = obs.find((x) => x.factor_key === 'basic_schema')!;
    expect(o.status).toBe('present');
  });

  it('(9) page unavailable → unknown', async () => {
    const audit = makeSiteAudit({ pageOverrides: { fetchStatus: 'unavailable' } });
    const obs = await detectFactors({ siteAudit: audit });
    const o = obs.find((x) => x.factor_key === 'basic_schema')!;
    expect(o.status).toBe('unknown');
  });
});

// ---------------------------------------------------------------------------
// (10-11) schema_beyond_basics
// ---------------------------------------------------------------------------

describe('detectFactors() — schema_beyond_basics', () => {
  it('(10) advanced type (WebSite) present → present', async () => {
    const audit = makeSiteAudit({ pageOverrides: { jsonLdTypes: ['Organization', 'WebSite'] } });
    const obs = await detectFactors({ siteAudit: audit });
    const o = obs.find((x) => x.factor_key === 'schema_beyond_basics')!;
    expect(o.status).toBe('present');
    expect(o.evidence).toContain('WebSite');
  });

  it('(11) only basic types → absent', async () => {
    const audit = makeSiteAudit({ pageOverrides: { jsonLdTypes: ['Organization', 'FAQPage'] } });
    const obs = await detectFactors({ siteAudit: audit });
    const o = obs.find((x) => x.factor_key === 'schema_beyond_basics')!;
    expect(o.status).toBe('absent');
  });

  it('schema_beyond_basics evidence always mentions hygiene', async () => {
    const audit = makeSiteAudit({ pageOverrides: { jsonLdTypes: ['BreadcrumbList'] } });
    const obs = await detectFactors({ siteAudit: audit });
    const o = obs.find((x) => x.factor_key === 'schema_beyond_basics')!;
    expect(o.evidence.toLowerCase()).toContain('hygiene');
  });
});

// ---------------------------------------------------------------------------
// (12-13) extractable_structure
// ---------------------------------------------------------------------------

describe('detectFactors() — extractable_structure', () => {
  it('(12) h1=1, h2=3, words=500 → present', async () => {
    const audit = makeSiteAudit({ pageOverrides: { h1Count: 1, h2Count: 3, wordCount: 500 } });
    const obs = await detectFactors({ siteAudit: audit });
    const o = obs.find((x) => x.factor_key === 'extractable_structure')!;
    expect(o.status).toBe('present');
  });

  it('(13) h1=2 → absent', async () => {
    const audit = makeSiteAudit({ pageOverrides: { h1Count: 2, h2Count: 3, wordCount: 500 } });
    const obs = await detectFactors({ siteAudit: audit });
    const o = obs.find((x) => x.factor_key === 'extractable_structure')!;
    expect(o.status).toBe('absent');
  });

  it('h2 < 2 → absent', async () => {
    const audit = makeSiteAudit({ pageOverrides: { h1Count: 1, h2Count: 1, wordCount: 500 } });
    const obs = await detectFactors({ siteAudit: audit });
    const o = obs.find((x) => x.factor_key === 'extractable_structure')!;
    expect(o.status).toBe('absent');
  });

  it('wordCount < 300 → absent', async () => {
    const audit = makeSiteAudit({ pageOverrides: { h1Count: 1, h2Count: 3, wordCount: 200 } });
    const obs = await detectFactors({ siteAudit: audit });
    const o = obs.find((x) => x.factor_key === 'extractable_structure')!;
    expect(o.status).toBe('absent');
  });

  it('page unavailable → unknown', async () => {
    const audit = makeSiteAudit({ pageOverrides: { fetchStatus: 'unavailable' } });
    const obs = await detectFactors({ siteAudit: audit });
    const o = obs.find((x) => x.factor_key === 'extractable_structure')!;
    expect(o.status).toBe('unknown');
  });
});

// ---------------------------------------------------------------------------
// (14-16) content_freshness
// ---------------------------------------------------------------------------

describe('detectFactors() — content_freshness', () => {
  it('(14) fresh dateModified (30 days ago) → present', async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const audit = makeSiteAudit({ pageOverrides: { dateModified: thirtyDaysAgo } });
    const obs = await detectFactors({ siteAudit: audit });
    const o = obs.find((x) => x.factor_key === 'content_freshness')!;
    expect(o.status).toBe('present');
    expect(o.evidence).toContain(thirtyDaysAgo);
  });

  it('(15) stale dateModified (200 days ago) → absent', async () => {
    const oldDate = new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString();
    const audit = makeSiteAudit({ pageOverrides: { dateModified: oldDate } });
    const obs = await detectFactors({ siteAudit: audit });
    const o = obs.find((x) => x.factor_key === 'content_freshness')!;
    expect(o.status).toBe('absent');
    expect(o.evidence.toLowerCase()).toContain('half-life');
  });

  it('(16) no dateModified → unknown', async () => {
    const audit = makeSiteAudit({ pageOverrides: { dateModified: undefined } });
    const obs = await detectFactors({ siteAudit: audit });
    const o = obs.find((x) => x.factor_key === 'content_freshness')!;
    expect(o.status).toBe('unknown');
  });

  it('page unavailable → unknown', async () => {
    const audit = makeSiteAudit({ pageOverrides: { fetchStatus: 'unavailable' } });
    const obs = await detectFactors({ siteAudit: audit });
    const o = obs.find((x) => x.factor_key === 'content_freshness')!;
    expect(o.status).toBe('unknown');
  });

  it('future dateModified → unknown (CMS scheduling / bad data)', async () => {
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const audit = makeSiteAudit({ pageOverrides: { dateModified: futureDate } });
    const obs = await detectFactors({ siteAudit: audit });
    const o = obs.find((x) => x.factor_key === 'content_freshness')!;
    expect(o.status).toBe('unknown');
    expect(o.evidence).toContain('future');
  });

  it('invalid/unparseable dateModified string → unknown', async () => {
    const audit = makeSiteAudit({ pageOverrides: { dateModified: 'not-a-date' } });
    const obs = await detectFactors({ siteAudit: audit });
    const o = obs.find((x) => x.factor_key === 'content_freshness')!;
    expect(o.status).toBe('unknown');
    expect(o.evidence).toContain('not a parseable date');
  });
});

// ---------------------------------------------------------------------------
// (17-18) llms_txt
// ---------------------------------------------------------------------------

describe('detectFactors() — llms_txt', () => {
  it('(17) llms.txt present → present', async () => {
    const audit = makeSiteAudit({ llmsTxt: { present: true } });
    const obs = await detectFactors({ siteAudit: audit });
    const o = obs.find((x) => x.factor_key === 'llms_txt')!;
    expect(o.status).toBe('present');
    expect(o.evidence).toContain('/llms.txt present');
  });

  it('(18) llms.txt absent → absent', async () => {
    const audit = makeSiteAudit({ llmsTxt: { present: false } });
    const obs = await detectFactors({ siteAudit: audit });
    const o = obs.find((x) => x.factor_key === 'llms_txt')!;
    expect(o.status).toBe('absent');
    expect(o.evidence).toContain('/llms.txt absent');
  });

  it('llms_txt evidence always mentions hygiene', async () => {
    const audit = makeSiteAudit({ llmsTxt: { present: true } });
    const obs = await detectFactors({ siteAudit: audit });
    const o = obs.find((x) => x.factor_key === 'llms_txt')!;
    expect(o.evidence.toLowerCase()).toContain('hygiene');
  });
});

// ---------------------------------------------------------------------------
// (19-22) wikidata_entity — global fetch is mocked per test
// ---------------------------------------------------------------------------

describe('detectFactors() — wikidata_entity', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('(19) entity found → present', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        search: [{ id: 'Q12345', label: 'Acme Corp', description: 'A technology company' }],
      }),
    }));

    const audit = makeSiteAudit();
    const obs = await detectFactors({
      siteAudit: audit,
      businessContext: {
        business_name: 'Acme Corp',
        website_url: 'https://acme.com',
        business_summary: '',
        key_services: [],
        target_audience: '',
        category: '',
        location: '',
      },
    });
    const o = obs.find((x) => x.factor_key === 'wikidata_entity')!;
    expect(o.status).toBe('present');
    expect(o.evidence).toContain('Q12345');
    expect(o.evidence).toContain('Acme Corp');
    expect(o.source).toBe('wikidata');
  });

  it('(20) no results → absent', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ search: [] }),
    }));

    const audit = makeSiteAudit();
    const obs = await detectFactors({
      siteAudit: audit,
      businessContext: {
        business_name: 'NoSuchCompanyXYZ',
        website_url: '',
        business_summary: '',
        key_services: [],
        target_audience: '',
        category: '',
        location: '',
      },
    });
    const o = obs.find((x) => x.factor_key === 'wikidata_entity')!;
    expect(o.status).toBe('absent');
    expect(o.evidence).toContain("NoSuchCompanyXYZ");
  });

  it('(21) AbortController.abort() is called within WIKIDATA_TIMEOUT_MS (8000ms) — verifies timeout wiring', async () => {
    // This test verifies the AbortController/setTimeout wiring is actually present.
    // It would fail if the setTimeout or controller.abort() call were removed.
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort');

    // Make fetch hang until the signal aborts, so the abort spy is the observable proof.
    vi.stubGlobal('fetch', vi.fn().mockImplementation((_url: string, opts: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        // Reject when the signal fires
        const signal = opts?.signal as AbortSignal | undefined;
        if (signal) {
          signal.addEventListener('abort', () => {
            reject(new DOMException('signal aborted', 'AbortError'));
          });
        }
      });
    }));

    vi.useFakeTimers();

    const detectPromise = detectFactors({
      siteAudit: makeSiteAudit(),
      businessContext: {
        business_name: 'TimeoutCo',
        website_url: '',
        business_summary: '',
        key_services: [],
        target_audience: '',
        category: '',
        location: '',
      },
    });

    // Advance past the 8000ms WIKIDATA_TIMEOUT_MS threshold
    await vi.advanceTimersByTimeAsync(8_001);
    vi.useRealTimers();

    const obs = await detectPromise;
    const o = obs.find((x) => x.factor_key === 'wikidata_entity')!;

    // The abort must have been called (timeout wiring is verified)
    expect(abortSpy).toHaveBeenCalled();
    // Result must be 'unknown' (network path caught gracefully)
    expect(o.status).toBe('unknown');
    expect(o.source).toBe('wikidata');

    abortSpy.mockRestore();
  });

  it('(22) no businessContext → unknown', async () => {
    const audit = makeSiteAudit();
    const input: DetectionInput = { siteAudit: audit };
    const obs = await detectFactors(input);
    const o = obs.find((x) => x.factor_key === 'wikidata_entity')!;
    expect(o.status).toBe('unknown');
  });

  it('fetch network error → unknown (never throws)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    const audit = makeSiteAudit();
    const obs = await detectFactors({
      siteAudit: audit,
      businessContext: {
        business_name: 'ErrorCo',
        website_url: '',
        business_summary: '',
        key_services: [],
        target_audience: '',
        category: '',
        location: '',
      },
    });
    const o = obs.find((x) => x.factor_key === 'wikidata_entity')!;
    expect(o.status).toBe('unknown');
    // detectFactors must never throw
  });
});
