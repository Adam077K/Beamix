/**
 * Unit tests for dimensions.ts.
 *
 * Coverage:
 *   (1)  presence = mentionedCount / n.
 *   (2)  position = average rank_position over ranked obs; null when none ranked.
 *   (3)  position null when client mentioned but never in a ranked list.
 *   (4)  cited_as_source = fraction of obs with domain root in a citation URL.
 *   (5)  cited_as_source = 0 when no citations exist.
 *   (6)  share_of_voice = client / (client + competitors).
 *   (7)  share_of_voice = 0 when nobody named.
 *   (8)  breadth = fraction of obs with win or partial outcome.
 *   (9)  sentiment is passed through unchanged (including 'unknown').
 *  (10)  empty observations → all zeros, position null.
 *  (11)  all-miss observations → presence=0, position=null.
 *  (12)  domain root < 3 chars → cited_as_source = 0 (false-positive guard).
 */

import { describe, it, expect } from 'vitest';
import { computeDimensions } from '../dimensions';
import type { ClientIdentity, EngineProbeObservation } from '../measurement-types';

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

const IDENTITY: ClientIdentity = {
  business_name: 'Acme Dental',
  domain: 'https://www.acme-dental.co.il',
  aliases: ['Acme'],
};

/** Build a minimal EngineProbeObservation with overridable fields. */
function makeObs(overrides: {
  mentioned?: boolean;
  rank?: number | null;
  citations?: string[];
  competitorCount?: number;
  outcome?: 'win' | 'partial' | 'loss';
}): EngineProbeObservation {
  const { mentioned = false, rank = null, citations = [], competitorCount = 0, outcome = 'loss' } =
    overrides;

  const competitors = Array.from({ length: competitorCount }, (_, i) => ({
    name: `Competitor ${i + 1}`,
    rank: i + 1,
  }));

  return {
    engine: 'chatgpt',
    retrieval_mode: 'live_web',
    raw_response: 'raw response text',
    detection: {
      mentioned,
      rank_position: rank ?? null,
      matched_text: mentioned ? 'Acme Dental' : null,
      mention_snippet: mentioned ? 'Acme Dental is great' : null,
    },
    competitors,
    shape: {
      shape: 'ranked_listicle',
      outcome,
    },
    citations,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('computeDimensions — presence', () => {
  it('(1) presence = mentionedCount / n', () => {
    const obs = [
      makeObs({ mentioned: true }),
      makeObs({ mentioned: true }),
      makeObs({ mentioned: false }),
      makeObs({ mentioned: false }),
    ];
    const dims = computeDimensions(obs, IDENTITY, 'unknown');
    expect(dims.presence).toBeCloseTo(0.5);
  });

  it('(11) all-miss → presence=0', () => {
    const obs = [makeObs({}), makeObs({}), makeObs({})];
    const dims = computeDimensions(obs, IDENTITY, 'unknown');
    expect(dims.presence).toBe(0);
  });
});

describe('computeDimensions — position', () => {
  it('(2) position = average rank_position over ranked obs', () => {
    const obs = [
      makeObs({ mentioned: true, rank: 1 }),
      makeObs({ mentioned: true, rank: 3 }),
      makeObs({ mentioned: false }),
    ];
    const dims = computeDimensions(obs, IDENTITY, 'unknown');
    // Average of 1 and 3 = 2
    expect(dims.position).toBeCloseTo(2);
  });

  it('(3) position null when mentioned but never ranked', () => {
    const obs = [
      makeObs({ mentioned: true, rank: null }),
      makeObs({ mentioned: true, rank: null }),
    ];
    const dims = computeDimensions(obs, IDENTITY, 'unknown');
    expect(dims.position).toBeNull();
  });

  it('(11) position null when all-miss', () => {
    const obs = [makeObs({}), makeObs({})];
    const dims = computeDimensions(obs, IDENTITY, 'unknown');
    expect(dims.position).toBeNull();
  });
});

describe('computeDimensions — cited_as_source', () => {
  it('(4) cited_as_source = fraction of obs with domain root in citation URL', () => {
    const obs = [
      makeObs({ citations: ['https://acme-dental.co.il/about', 'https://other.com'] }),
      makeObs({ citations: ['https://acme-dental.co.il/services'] }),
      makeObs({ citations: ['https://totally-different.com'] }),
      makeObs({ citations: [] }),
    ];
    const dims = computeDimensions(obs, IDENTITY, 'unknown');
    // 2 of 4 obs have the domain root 'acme-dental' in a citation
    expect(dims.cited_as_source).toBeCloseTo(0.5);
  });

  it('(5) cited_as_source = 0 when no citations exist', () => {
    const obs = [makeObs({}), makeObs({}), makeObs({})];
    const dims = computeDimensions(obs, IDENTITY, 'unknown');
    expect(dims.cited_as_source).toBe(0);
  });

  it('(12) domain root < 3 chars → cited_as_source = 0 (false-positive guard)', () => {
    const shortIdentity: ClientIdentity = {
      business_name: 'XY Corp',
      domain: 'https://xy.com',
      aliases: [],
    };
    const obs = [
      makeObs({ citations: ['https://xy.com/page'] }),
      makeObs({ citations: ['https://xy.com/contact'] }),
    ];
    const dims = computeDimensions(obs, shortIdentity, 'unknown');
    // 'xy' is only 2 chars → extractDomainRoot returns 'xy' → skipped (< 3)
    expect(dims.cited_as_source).toBe(0);
  });
});

describe('computeDimensions — share_of_voice', () => {
  it('(6) share_of_voice = client / (client + competitors)', () => {
    const obs = [
      // client + 2 competitors
      makeObs({ mentioned: true, competitorCount: 2 }),
      // not mentioned + 3 competitors
      makeObs({ mentioned: false, competitorCount: 3 }),
    ];
    const dims = computeDimensions(obs, IDENTITY, 'unknown');
    // clientMentions = 1, competitorMentions = 2 + 3 = 5, total = 6
    expect(dims.share_of_voice).toBeCloseTo(1 / 6);
  });

  it('(7) share_of_voice = 0 when nobody named', () => {
    const obs = [makeObs({}), makeObs({})];
    const dims = computeDimensions(obs, IDENTITY, 'unknown');
    expect(dims.share_of_voice).toBe(0);
  });

  it('share_of_voice = 1 when client mentioned and no competitors', () => {
    const obs = [makeObs({ mentioned: true }), makeObs({ mentioned: true })];
    const dims = computeDimensions(obs, IDENTITY, 'unknown');
    expect(dims.share_of_voice).toBe(1);
  });
});

describe('computeDimensions — breadth', () => {
  it('(8) breadth = fraction of obs with win or partial outcome', () => {
    const obs = [
      makeObs({ outcome: 'win' }),
      makeObs({ outcome: 'partial' }),
      makeObs({ outcome: 'loss' }),
      makeObs({ outcome: 'loss' }),
    ];
    const dims = computeDimensions(obs, IDENTITY, 'unknown');
    expect(dims.breadth).toBeCloseTo(0.5);
  });

  it('breadth = 0 when all loss', () => {
    const obs = [makeObs({ outcome: 'loss' }), makeObs({ outcome: 'loss' })];
    const dims = computeDimensions(obs, IDENTITY, 'unknown');
    expect(dims.breadth).toBe(0);
  });

  it('breadth = 1 when all win', () => {
    const obs = [makeObs({ outcome: 'win' }), makeObs({ outcome: 'win' })];
    const dims = computeDimensions(obs, IDENTITY, 'unknown');
    expect(dims.breadth).toBe(1);
  });
});

describe('computeDimensions — sentiment passthrough', () => {
  it('(9) sentiment is passed through unchanged', () => {
    const obs = [makeObs({ mentioned: true })];
    expect(computeDimensions(obs, IDENTITY, 'positive').sentiment).toBe('positive');
    expect(computeDimensions(obs, IDENTITY, 'neutral').sentiment).toBe('neutral');
    expect(computeDimensions(obs, IDENTITY, 'negative').sentiment).toBe('negative');
    expect(computeDimensions(obs, IDENTITY, 'unknown').sentiment).toBe('unknown');
  });

  it('(9) unknown sentiment is preserved (never defaulted to neutral)', () => {
    const obs: EngineProbeObservation[] = [];
    const dims = computeDimensions(obs, IDENTITY, 'unknown');
    expect(dims.sentiment).toBe('unknown');
  });
});

describe('computeDimensions — empty observations', () => {
  it('(10) empty observations → all zeros, position null, sentiment passed through', () => {
    const dims = computeDimensions([], IDENTITY, 'unknown');
    expect(dims.presence).toBe(0);
    expect(dims.position).toBeNull();
    expect(dims.cited_as_source).toBe(0);
    expect(dims.share_of_voice).toBe(0);
    expect(dims.breadth).toBe(0);
    expect(dims.sentiment).toBe('unknown');
  });
});
