/**
 * Unit tests for competitor-audit.ts.
 *
 * Coverage:
 *   (1)  selectTopCompetitors — aggregates by frequency DESC, then best rank ASC.
 *   (2)  selectTopCompetitors — deduplicates by lowercased name.
 *   (3)  selectTopCompetitors — excludes competitors matching client identity.
 *   (4)  selectTopCompetitors — respects k cap (default 3).
 *   (5)  selectTopCompetitors — empty observations → empty result.
 *   (6)  auditCompetitors — maps observations to CompetitorFactorAudit[].
 *   (7)  auditCompetitors — skips competitors with no resolvable domain.
 *   (8)  auditCompetitors — per-competitor error → skip that competitor, continue.
 *   (9)  auditCompetitors — respects cap (audits at most cap competitors).
 *   (10) auditCompetitors — empty competitors list → empty result.
 *
 * NO real network calls — all I/O is injected via stubs.
 */

import { describe, it, expect, vi } from 'vitest';
import { selectTopCompetitors, auditCompetitors } from '../competitor-audit';
import type { EngineProbeObservation, ClientIdentity } from '../measurement-types';
import type { AuditCompetitorsDeps } from '../competitor-audit';
import type { SiteAudit } from '../types';
import type { FactorObservation } from '../factor-detection';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const CLIENT_IDENTITY: ClientIdentity = {
  business_name: 'Acme Dental',
  domain: 'acme-dental.co.il',
  aliases: ['Acme', 'Acme Dental Group'],
};

function makeObs(
  engine: 'chatgpt' | 'gemini' | 'perplexity',
  competitors: Array<{ name: string; rank: number | null }> = [],
): EngineProbeObservation {
  return {
    engine,
    retrieval_mode: 'live_web',
    raw_response: 'a raw engine response',
    detection: {
      mentioned: false,
      rank_position: null,
      matched_text: null,
      mention_snippet: null,
    },
    competitors,
    shape: { shape: 'ranked_listicle', outcome: 'loss' },
  };
}

function makeSiteAudit(url: string): SiteAudit {
  return {
    url,
    fetchedAt: '2026-06-11T07:00:00.000Z',
    page: { fetchStatus: 'ok', title: 'Test', wordCount: 500 },
    robotsTxt: { fetchStatus: 'ok', crawlers: { GPTBot: 'allowed' } },
    sitemapXml: { present: true },
    llmsTxt: { present: false },
  };
}

function makeFactorObs(factor_key: string, status: 'present' | 'absent'): FactorObservation {
  return {
    factor_key,
    status,
    truth_class: 'FACT',
    evidence: `test evidence for ${factor_key}`,
    source: 'site_audit',
    detected_at: '2026-06-11T07:00:00.000Z',
  };
}

function makeDeps(opts: {
  resolveDomain?: (name: string) => string | null;
  auditSiteThrowFor?: string[];
  detectFactorsThrowFor?: string[];
  factorObservations?: FactorObservation[];
} = {}): AuditCompetitorsDeps {
  return {
    auditSite: vi.fn(async (url: string) => {
      if (opts.auditSiteThrowFor?.some((u) => url.includes(u))) {
        throw new Error(`auditSite failed for ${url}`);
      }
      return makeSiteAudit(url);
    }),
    detectFactors: vi.fn(async () => {
      return opts.factorObservations ?? [makeFactorObs('review_systems', 'present')];
    }),
    resolveDomain: opts.resolveDomain,
  };
}

// ---------------------------------------------------------------------------
// (1–5) selectTopCompetitors
// ---------------------------------------------------------------------------

describe('selectTopCompetitors', () => {
  it('(1) aggregates by frequency DESC', () => {
    const observations = [
      makeObs('chatgpt', [
        { name: 'Alpha Dental', rank: 1 },
        { name: 'Beta Clinic', rank: 2 },
      ]),
      makeObs('gemini', [
        { name: 'Alpha Dental', rank: 1 },
        { name: 'Gamma Spa', rank: 3 },
      ]),
      makeObs('perplexity', [
        { name: 'Alpha Dental', rank: 2 },
      ]),
    ];

    const result = selectTopCompetitors(observations, CLIENT_IDENTITY, 3);

    // Alpha Dental appears 3 times → rank 1
    expect(result[0].name).toBe('Alpha Dental');
    // Beta and Gamma each appear once → tied on frequency, rank by best_rank
    expect(result.map((r) => r.name)).toContain('Beta Clinic');
    expect(result.map((r) => r.name)).toContain('Gamma Spa');
  });

  it('(1) when frequency ties, sorts by best rank ASC', () => {
    const observations = [
      makeObs('chatgpt', [
        { name: 'High Rank Clinic', rank: 5 }, // freq=1, rank=5
        { name: 'Low Rank Clinic', rank: 1 },  // freq=1, rank=1
      ]),
    ];

    const result = selectTopCompetitors(observations, CLIENT_IDENTITY, 2);

    // Same frequency; Low Rank Clinic has better (lower) rank → comes first
    expect(result[0].name).toBe('Low Rank Clinic');
    expect(result[1].name).toBe('High Rank Clinic');
  });

  it('(2) deduplicates by lowercased name', () => {
    // Same competitor named with different casing across engines
    const observations = [
      makeObs('chatgpt', [{ name: 'Beta Dental', rank: 1 }]),
      makeObs('gemini', [{ name: 'beta dental', rank: 2 }]),
      makeObs('perplexity', [{ name: 'BETA DENTAL', rank: 3 }]),
    ];

    const result = selectTopCompetitors(observations, CLIENT_IDENTITY, 3);

    // All three are the same competitor — should appear once
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Beta Dental'); // first occurrence wins
    // The frequency should be 3 (appears 3 times)
  });

  it('(3) excludes competitors matching client identity — business name match', () => {
    const observations = [
      makeObs('chatgpt', [
        { name: 'Acme Dental', rank: 1 }, // matches client business_name
        { name: 'Beta Clinic', rank: 2 },
      ]),
    ];

    const result = selectTopCompetitors(observations, CLIENT_IDENTITY, 3);

    // "Acme Dental" must be excluded — it is the client
    expect(result.map((r) => r.name)).not.toContain('Acme Dental');
    expect(result.map((r) => r.name)).toContain('Beta Clinic');
  });

  it('(3) excludes competitors matching client identity — alias match', () => {
    const observations = [
      makeObs('chatgpt', [
        { name: 'Acme', rank: 1 },  // matches alias
        { name: 'Gamma Corp', rank: 2 },
      ]),
    ];

    const result = selectTopCompetitors(observations, CLIENT_IDENTITY, 3);

    expect(result.map((r) => r.name)).not.toContain('Acme');
    expect(result.map((r) => r.name)).toContain('Gamma Corp');
  });

  it('(4) respects k cap', () => {
    const observations = [
      makeObs('chatgpt', [
        { name: 'Competitor A', rank: 1 },
        { name: 'Competitor B', rank: 2 },
        { name: 'Competitor C', rank: 3 },
        { name: 'Competitor D', rank: 4 },
        { name: 'Competitor E', rank: 5 },
      ]),
    ];

    const result = selectTopCompetitors(observations, CLIENT_IDENTITY, 2);

    expect(result).toHaveLength(2);
  });

  it('(4) default k is 3', () => {
    const observations = [
      makeObs('chatgpt', [
        { name: 'Alpha Clinic', rank: 1 },
        { name: 'Beta Dental', rank: 2 },
        { name: 'Gamma Health', rank: 3 },
        { name: 'Delta Spa', rank: 4 },
      ]),
    ];

    const result = selectTopCompetitors(observations, CLIENT_IDENTITY);

    expect(result).toHaveLength(3);
  });

  it('(5) empty observations → empty result', () => {
    const result = selectTopCompetitors([], CLIENT_IDENTITY);
    expect(result).toHaveLength(0);
  });

  it('(5) observations with no competitors → empty result', () => {
    const observations = [
      makeObs('chatgpt', []),
      makeObs('gemini', []),
    ];

    const result = selectTopCompetitors(observations, CLIENT_IDENTITY);
    expect(result).toHaveLength(0);
  });

  it('null ranks are treated as Infinity (unranked competitors sort after ranked)', () => {
    const observations = [
      makeObs('chatgpt', [
        { name: 'Unranked Clinic', rank: null }, // freq=1, no rank
        { name: 'Ranked Clinic', rank: 3 },      // freq=1, rank=3
      ]),
    ];

    const result = selectTopCompetitors(observations, CLIENT_IDENTITY, 2);

    // Same frequency, but Ranked Clinic has a real rank → should come first
    expect(result[0].name).toBe('Ranked Clinic');
    expect(result[1].name).toBe('Unranked Clinic');
    expect(result[1].rank).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// (6–10) auditCompetitors
// ---------------------------------------------------------------------------

describe('auditCompetitors', () => {
  it('(6) maps observations to CompetitorFactorAudit[] when domain is resolvable', async () => {
    const competitors = [
      { name: 'Beta Clinic', rank: 1 },
      { name: 'Gamma Corp', rank: 2 },
    ];

    const deps = makeDeps({
      resolveDomain: (name) => `https://${name.toLowerCase().replace(/\s+/g, '-')}.com`,
      factorObservations: [makeFactorObs('review_systems', 'present')],
    });

    const results = await auditCompetitors(competitors, deps, 3);

    expect(results).toHaveLength(2);
    expect(results[0].competitor_name).toBe('Beta Clinic');
    expect(results[0].observations).toHaveLength(1);
    expect(results[0].observations[0].factor_key).toBe('review_systems');
    expect(results[1].competitor_name).toBe('Gamma Corp');
  });

  it('(7) skips competitors with no resolvable domain', async () => {
    const competitors = [
      { name: 'Beta Clinic', rank: 1 },  // will get a domain
      { name: 'No Domain Corp', rank: 2 }, // no domain
    ];

    const deps = makeDeps({
      resolveDomain: (name) => {
        if (name === 'Beta Clinic') return 'https://beta-clinic.com';
        return null; // No Domain Corp has no domain
      },
    });

    const results = await auditCompetitors(competitors, deps, 3);

    // Only Beta Clinic should be in results
    expect(results).toHaveLength(1);
    expect(results[0].competitor_name).toBe('Beta Clinic');
  });

  it('(7) no resolveDomain provided → all competitors skipped', async () => {
    const competitors = [
      { name: 'Beta Clinic', rank: 1 },
    ];

    const deps = makeDeps({ resolveDomain: undefined });

    const results = await auditCompetitors(competitors, deps, 3);

    expect(results).toHaveLength(0);
  });

  it('(8) per-competitor auditSite error → skip that competitor, continue with others', async () => {
    const competitors = [
      { name: 'Failing Clinic', rank: 1 },
      { name: 'Healthy Clinic', rank: 2 },
    ];

    const deps = makeDeps({
      resolveDomain: (name) => `https://${name.toLowerCase().replace(/\s+/g, '-')}.com`,
      auditSiteThrowFor: ['failing-clinic'],
      factorObservations: [makeFactorObs('review_systems', 'present')],
    });

    const results = await auditCompetitors(competitors, deps, 3);

    // Failing Clinic is skipped; Healthy Clinic is audited successfully
    expect(results).toHaveLength(1);
    expect(results[0].competitor_name).toBe('Healthy Clinic');
  });

  it('(9) respects cap (audits at most cap competitors)', async () => {
    const competitors = [
      { name: 'Alpha Dental', rank: 1 },
      { name: 'Beta Clinic', rank: 2 },
      { name: 'Gamma Health', rank: 3 },
      { name: 'Delta Spa', rank: 4 }, // should be excluded by cap=3
    ];

    const auditSiteCallCount = { count: 0 };
    const deps: AuditCompetitorsDeps = {
      auditSite: vi.fn(async (url: string) => {
        auditSiteCallCount.count++;
        return makeSiteAudit(url);
      }),
      detectFactors: vi.fn(async () => []),
      resolveDomain: (name) => `https://${name.toLowerCase().replace(/\s+/g, '-')}.com`,
    };

    const results = await auditCompetitors(competitors, deps, 3);

    // Only 3 competitors should be audited
    expect(results).toHaveLength(3);
    expect(auditSiteCallCount.count).toBe(3);
  });

  it('(10) empty competitors list → empty result', async () => {
    const deps = makeDeps({
      resolveDomain: () => 'https://some-domain.com',
    });

    const results = await auditCompetitors([], deps, 3);

    expect(results).toHaveLength(0);
  });

  it('domain from resolveDomain is passed to auditSite and stored in result', async () => {
    const competitors = [{ name: 'Alpha Corp', rank: 1 }];

    const capturedUrls: string[] = [];
    const deps: AuditCompetitorsDeps = {
      auditSite: vi.fn(async (url) => {
        capturedUrls.push(url);
        return makeSiteAudit(url);
      }),
      detectFactors: vi.fn(async () => []),
      resolveDomain: () => 'https://alpha-corp.com',
    };

    const results = await auditCompetitors(competitors, deps, 3);

    expect(capturedUrls[0]).toBe('https://alpha-corp.com');
    expect(results[0].domain).toBe('https://alpha-corp.com');
    expect(results[0].competitor_name).toBe('Alpha Corp');
  });
});
