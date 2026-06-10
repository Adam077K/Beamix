/**
 * Unit tests for client-detection.ts.
 *
 * Coverage:
 *   detectClient:
 *   (1)  Not mentioned → all nulls, mentioned=false
 *   (2)  Named in numbered list at rank 1 → rank_position=1
 *   (3)  Named in numbered list at rank 3 → rank_position=3
 *   (4)  Named in numbered list at rank 5 → rank_position=5
 *   (5)  Mentioned in prose (no list) → mentioned=true, rank_position=null
 *   (6)  Domain root match (no business_name present) → mentioned=true
 *   (7)  Alias match → mentioned=true, matched_text=alias
 *   (8)  Case-insensitive match
 *   (9)  Short alias (<3 chars) does NOT trigger a match
 *   (10) mention_snippet is ~200 chars centered on first match
 *   (11) mention_snippet is null when not mentioned
 *   (12) rank is null when mentioned in a bulleted list (no rank number)
 *
 *   extractCompetitors:
 *   (13) Extracts numbered-list competitors, excludes client
 *   (14) Deduplicates case-insensitively, preserves lowest rank
 *   (15) Caps at 10 competitors
 *   (16) Returns empty array when no list found and no bullet list
 *   (17) Extracts bold-formatted names correctly
 *   (18) Client is excluded from competitor list (name match)
 *   (19) Extracts bullet-list competitors when no numbered list
 */

import { describe, it, expect } from 'vitest';
import { detectClient, extractCompetitors } from '../client-detection';
import type { ClientIdentity } from '../measurement-types';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const IDENTITY: ClientIdentity = {
  business_name: 'Acme Dental',
  domain: 'https://www.acme-dental.co.il',
  aliases: ['AcmeDental', 'Acme Clinic'],
};

const IDENTITY_SHORT_ALIAS: ClientIdentity = {
  business_name: 'MegaCorp',
  domain: 'https://megacorp.com',
  aliases: ['MC', 'MG', 'MegaCorp Ltd'],
};

// A realistic ranked-listicle response mentioning the client
const RANKED_LIST_CLIENT_AT_1 = `
Here are the top dental clinics in Tel Aviv:

1. Acme Dental — a leading dental practice with modern facilities.
2. Bright Smile Clinic — popular for cosmetic dentistry.
3. Tel Aviv Dental Center — conveniently located downtown.
4. Happy Teeth — budget-friendly option.
5. Premium Dental Group — luxury treatments.
`;

const RANKED_LIST_CLIENT_AT_3 = `
Top 5 dental clinics in Tel Aviv:

1. Bright Smile Clinic — excellent reputation.
2. Tel Aviv Dental Center — centrally located.
3. Acme Dental — great for families.
4. Happy Teeth — affordable pricing.
5. Premium Dental Group — specializes in implants.
`;

const RANKED_LIST_CLIENT_AT_5 = `
Best dental providers:

1. Bright Smile Clinic
2. Tel Aviv Dental Center
3. Happy Teeth
4. Premium Dental Group
5. Acme Dental
`;

const PROSE_MENTION = `
There are many dental clinics in Tel Aviv. Acme Dental has been operating since 2010
and is known for its patient-friendly approach. Other options include Bright Smile and
Tel Aviv Dental Center.
`;

const NO_CLIENT_MENTION = `
There are many dental clinics in Tel Aviv including Bright Smile, Tel Aviv Dental Center,
and Happy Teeth. These are the most popular options in the area.
`;

const DOMAIN_ROOT_MENTION = `
You can learn more at acme-dental.co.il or visit their office in Tel Aviv.
The clinic also maintains a blog with dental health tips.
`;

const ALIAS_MENTION = `
Looking for dental care? Acme Clinic in Tel Aviv is highly rated by patients.
They specialize in cosmetic and restorative dentistry.
`;

const BULLET_LIST = `
Top dental clinics:
- Bright Smile Clinic — great reviews
- Tel Aviv Dental Center — convenient
- Happy Teeth — affordable
`;

const BOLD_FORMAT_LIST = `
1. **Bright Smile Clinic** - top-rated cosmetic dentistry
2. **Tel Aviv Dental Center** - centrally located
3. **Acme Dental** - excellent family practice
4. **Happy Teeth** - budget-friendly
5. **Premium Dental Group** - luxury services
`;

// ---------------------------------------------------------------------------
// detectClient tests
// ---------------------------------------------------------------------------

describe('detectClient', () => {
  it('(1) not mentioned → all nulls, mentioned=false', () => {
    const result = detectClient(NO_CLIENT_MENTION, IDENTITY);
    expect(result.mentioned).toBe(false);
    expect(result.rank_position).toBeNull();
    expect(result.matched_text).toBeNull();
    expect(result.mention_snippet).toBeNull();
  });

  it('(2) named in numbered list at rank 1 → rank_position=1', () => {
    const result = detectClient(RANKED_LIST_CLIENT_AT_1, IDENTITY);
    expect(result.mentioned).toBe(true);
    expect(result.rank_position).toBe(1);
    expect(result.matched_text).toBe('Acme Dental');
  });

  it('(3) named in numbered list at rank 3 → rank_position=3', () => {
    const result = detectClient(RANKED_LIST_CLIENT_AT_3, IDENTITY);
    expect(result.mentioned).toBe(true);
    expect(result.rank_position).toBe(3);
  });

  it('(4) named in numbered list at rank 5 → rank_position=5', () => {
    const result = detectClient(RANKED_LIST_CLIENT_AT_5, IDENTITY);
    expect(result.mentioned).toBe(true);
    expect(result.rank_position).toBe(5);
  });

  it('(5) mentioned in prose (no list) → mentioned=true, rank_position=null', () => {
    const result = detectClient(PROSE_MENTION, IDENTITY);
    expect(result.mentioned).toBe(true);
    expect(result.rank_position).toBeNull();
    expect(result.mention_snippet).not.toBeNull();
  });

  it('(6) domain root match (no business name present) → mentioned=true', () => {
    const result = detectClient(DOMAIN_ROOT_MENTION, IDENTITY);
    expect(result.mentioned).toBe(true);
    // matched_text should be the domain root token
    expect(result.matched_text).toBeTruthy();
  });

  it('(7) alias match → mentioned=true', () => {
    const result = detectClient(ALIAS_MENTION, IDENTITY);
    expect(result.mentioned).toBe(true);
    expect(result.matched_text).toBe('Acme Clinic');
  });

  it('(8) case-insensitive match', () => {
    const response = 'ACME DENTAL is the best clinic in Tel Aviv.';
    const result = detectClient(response, IDENTITY);
    expect(result.mentioned).toBe(true);
  });

  it('(9) short alias (<3 chars) does NOT trigger a match', () => {
    const response = 'MC is not mentioned here but other things might be.';
    const result = detectClient(response, IDENTITY_SHORT_ALIAS);
    // 'MC' should be skipped; 'MegaCorp Ltd' and 'megacorp' are not in the response
    expect(result.mentioned).toBe(false);
  });

  it('(10) mention_snippet is ~200 chars centered on first match', () => {
    const result = detectClient(RANKED_LIST_CLIENT_AT_1, IDENTITY);
    expect(result.mention_snippet).not.toBeNull();
    expect(result.mention_snippet!.length).toBeLessThanOrEqual(230); // some slack for boundaries
    expect(result.mention_snippet!.length).toBeGreaterThan(0);
    // Snippet should contain the match
    expect(result.mention_snippet!.toLowerCase()).toContain('acme dental');
  });

  it('(11) mention_snippet is null when not mentioned', () => {
    const result = detectClient(NO_CLIENT_MENTION, IDENTITY);
    expect(result.mention_snippet).toBeNull();
  });

  it('(12) rank is null when mentioned in a bulleted list (no rank number)', () => {
    const bulletWithClient = `
Recommended clinics:
- Bright Smile Clinic
- Acme Dental
- Happy Teeth
`;
    const result = detectClient(bulletWithClient, IDENTITY);
    expect(result.mentioned).toBe(true);
    expect(result.rank_position).toBeNull(); // bullet lists don't give rank numbers
  });
});

// ---------------------------------------------------------------------------
// extractCompetitors tests
// ---------------------------------------------------------------------------

describe('extractCompetitors', () => {
  it('(13) extracts numbered-list competitors, excludes client', () => {
    const competitors = extractCompetitors(RANKED_LIST_CLIENT_AT_1, IDENTITY);
    const names = competitors.map((c) => c.name);
    // Client should be excluded
    expect(names.every((n) => !n.toLowerCase().includes('acme dental'))).toBe(true);
    // Competitors should be present
    expect(names.length).toBeGreaterThan(0);
    expect(names.some((n) => n.toLowerCase().includes('bright smile'))).toBe(true);
  });

  it('(14) deduplicates case-insensitively, preserves lowest rank', () => {
    const dupeResponse = `
1. Bright Smile Clinic — great
2. bright smile clinic — different entry
3. Another Clinic — good
`;
    const competitors = extractCompetitors(dupeResponse, IDENTITY);
    const brightSmileEntries = competitors.filter((c) =>
      c.name.toLowerCase().includes('bright smile'),
    );
    expect(brightSmileEntries).toHaveLength(1);
    // Should have rank 1 (lowest/first rank wins)
    expect(brightSmileEntries[0]!.rank).toBe(1);
  });

  it('(15) caps at 10 competitors', () => {
    let response = '';
    for (let i = 1; i <= 15; i++) {
      response += `${i}. Clinic ${i} — good practice\n`;
    }
    const competitors = extractCompetitors(response, IDENTITY);
    expect(competitors.length).toBeLessThanOrEqual(10);
  });

  it('(16) returns empty array when no list found', () => {
    const noList = 'There are many dental clinics in Tel Aviv but I cannot name them all.';
    const competitors = extractCompetitors(noList, IDENTITY);
    expect(competitors).toEqual([]);
  });

  it('(17) extracts bold-formatted names correctly', () => {
    const competitors = extractCompetitors(BOLD_FORMAT_LIST, IDENTITY);
    const names = competitors.map((c) => c.name);
    expect(names.some((n) => n.includes('Bright Smile'))).toBe(true);
    // Acme Dental (client) should be excluded
    expect(names.every((n) => !n.toLowerCase().includes('acme dental'))).toBe(true);
  });

  it('(18) client is excluded from competitor list (name match)', () => {
    const competitors = extractCompetitors(RANKED_LIST_CLIENT_AT_3, IDENTITY);
    const hasClient = competitors.some((c) =>
      c.name.toLowerCase().includes('acme dental'),
    );
    expect(hasClient).toBe(false);
  });

  it('(19) extracts bullet-list competitors when no numbered list', () => {
    const competitors = extractCompetitors(BULLET_LIST, IDENTITY);
    expect(competitors.length).toBeGreaterThan(0);
    const names = competitors.map((c) => c.name);
    expect(names.some((n) => n.toLowerCase().includes('bright smile'))).toBe(true);
    // Bullet list entries have no rank
    expect(competitors.every((c) => c.rank === null)).toBe(true);
  });
});
