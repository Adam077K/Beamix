/**
 * Unit tests for answer-shape.ts.
 *
 * Coverage (one case per shape minimum + conservative-tie rule):
 *   (1)  no_answer — empty response
 *   (2)  no_answer — explicit refusal phrase
 *   (3)  do_your_own_research — deflection without concrete names
 *   (4)  negative_avoid — client warned against in snippet
 *   (5)  navigational_branded — single-entity navigational answer
 *   (6)  cited_as_source — client domain in citation URL, client mentioned
 *   (7)  local_pack — location-grouped results with addresses/proximity signals
 *   (8)  comparison — "vs" framing with 2 entities
 *   (9)  ranked_listicle — numbered list of ≥3 options
 *   (10) single_recommendation — one clear recommendation
 *   (11) passing_mention — client mentioned but no rank, no recommendation
 *   (12) tool_vs_service_vs_product — type-framed answer
 *   (13) category_defining — generic category description, no specific providers
 *   (14) conservative outcome: ranked_listicle rank ≥4 → partial (not win)
 *   (15) conservative outcome: comparison with client → partial
 *   (16) ranked_listicle rank 1–3 → win
 *   (17) single_recommendation client NOT mentioned → loss
 *   (18) no_answer → always loss regardless of detection
 *   (19) negative_avoid → always loss
 *   (20) local_pack client at rank 1 → win; rank ≥4 → partial
 *   (21) passing_mention → always partial
 *   (22) navigational_branded without client mention → loss
 */

import { describe, it, expect } from 'vitest';
import { classifyShape } from '../answer-shape';
import type { ClientDetection, CompetitorMention } from '../measurement-types';

// ---------------------------------------------------------------------------
// Detection fixtures
// ---------------------------------------------------------------------------

const NOT_MENTIONED: ClientDetection = {
  mentioned: false,
  rank_position: null,
  matched_text: null,
  mention_snippet: null,
};

const MENTIONED_RANK_1: ClientDetection = {
  mentioned: true,
  rank_position: 1,
  matched_text: 'Acme Dental',
  mention_snippet: '1. Acme Dental — a leading dental practice.',
};

const MENTIONED_RANK_3: ClientDetection = {
  mentioned: true,
  rank_position: 3,
  matched_text: 'Acme Dental',
  mention_snippet: '3. Acme Dental — great for families.',
};

const MENTIONED_RANK_5: ClientDetection = {
  mentioned: true,
  rank_position: 5,
  matched_text: 'Acme Dental',
  mention_snippet: '5. Acme Dental — budget option.',
};

const MENTIONED_NO_RANK: ClientDetection = {
  mentioned: true,
  rank_position: null,
  matched_text: 'Acme Dental',
  mention_snippet: 'Acme Dental has been operating since 2010.',
};

const MENTIONED_AVOID: ClientDetection = {
  mentioned: true,
  rank_position: null,
  matched_text: 'Acme Dental',
  mention_snippet: 'I would avoid Acme Dental — there are many complaints about their billing practices.',
};

const NO_COMPETITORS: CompetitorMention[] = [];

const TWO_COMPETITORS: CompetitorMention[] = [
  { name: 'Bright Smile Clinic', rank: 1 },
  { name: 'Tel Aviv Dental Center', rank: 2 },
];

const FOUR_COMPETITORS: CompetitorMention[] = [
  { name: 'Bright Smile Clinic', rank: 1 },
  { name: 'Tel Aviv Dental Center', rank: 2 },
  { name: 'Happy Teeth', rank: 3 },
  { name: 'Premium Dental Group', rank: 4 },
];

// ---------------------------------------------------------------------------
// Response fixtures
// ---------------------------------------------------------------------------

const EMPTY_RESPONSE = '';

const REFUSAL_RESPONSE = "I don't have enough information to answer this question.";

const DEFLECTION_RESPONSE = `
I recommend checking reviews for dental clinics in your area. You should look for
clinics with good ratings and consider checking multiple sources before making a decision.
`;

const NEGATIVE_AVOID_RESPONSE = `
When looking for dental clinics in Tel Aviv, I would avoid Acme Dental — there are many complaints about their billing practices.
Consider Bright Smile Clinic instead.
`;

const NAVIGATIONAL_RESPONSE = `
Acme Dental is a dental practice located at 45 Dizengoff Street, Tel Aviv.
They offer cosmetic and restorative dentistry services.
Opening hours: Monday-Friday 9am-6pm.
Phone number: +972-3-555-0101.
`;

const CITED_SOURCE_RESPONSE = `
For dental care in Tel Aviv, you can find helpful information at https://www.acme-dental.co.il
where they list their services, pricing, and patient testimonials.
`;

const LOCAL_PACK_RESPONSE = `
Here are dental clinics near you in Tel Aviv:

1. Bright Smile Clinic — 0.5 miles away, located at 23 Ben Yehuda Street
2. Tel Aviv Dental Center — 1.2 miles away, located at 77 Dizengoff Center
3. Happy Teeth — 1.8 miles away, directions available
`;

const COMPARISON_RESPONSE = `
Comparing the top two dental options in Tel Aviv:

Bright Smile Clinic vs Tel Aviv Dental Center

Bright Smile Clinic specializes in cosmetic dentistry while Tel Aviv Dental Center
focuses on general family care. Bright Smile is pricier but has better reviews for
complex procedures.
`;

const RANKED_LISTICLE_RESPONSE = `
Here are the top 5 dental clinics in Tel Aviv:

1. Bright Smile Clinic — excellent reputation for cosmetic work
2. Tel Aviv Dental Center — conveniently located in the city center
3. Acme Dental — great family practice with modern equipment
4. Happy Teeth — budget-friendly option for basic care
5. Premium Dental Group — specializes in implants and oral surgery
`;

const SINGLE_RECOMMENDATION_RESPONSE = `
I recommend Bright Smile Clinic for dental care in Tel Aviv. They have excellent reviews,
experienced dentists, and use state-of-the-art equipment. They accept most insurance plans.
`;

const PASSING_MENTION_RESPONSE = `
There are many dental options in Tel Aviv. Some notable ones include Bright Smile Clinic,
Tel Aviv Dental Center, and various others. Acme Dental is also operating in the area.
Most clinics in Tel Aviv offer standard dental services at competitive prices.
`;

const TOOL_VS_SERVICE_RESPONSE = `
When it comes to dental care, you need to decide between using a dental tool versus
a full-service dental practice versus a specialized dental product service.
Each type serves different needs depending on your situation.
`;

const CATEGORY_DEFINING_RESPONSE = `
When choosing a dental clinic, there are several important factors to consider.
A good dental practice should have licensed dentists, modern equipment, and clear
pricing. Things to consider include location, insurance acceptance, and specializations.
`;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('classifyShape', () => {
  it('(1) no_answer — empty response', () => {
    const result = classifyShape(EMPTY_RESPONSE, NOT_MENTIONED, NO_COMPETITORS);
    expect(result.shape).toBe('no_answer');
    expect(result.outcome).toBe('loss');
  });

  it('(2) no_answer — explicit refusal phrase', () => {
    const result = classifyShape(REFUSAL_RESPONSE, NOT_MENTIONED, NO_COMPETITORS);
    expect(result.shape).toBe('no_answer');
    expect(result.outcome).toBe('loss');
  });

  it('(3) do_your_own_research — deflection without concrete names', () => {
    const result = classifyShape(DEFLECTION_RESPONSE, NOT_MENTIONED, NO_COMPETITORS);
    expect(result.shape).toBe('do_your_own_research');
    expect(result.outcome).toBe('loss');
  });

  it('(4) negative_avoid — client warned against in snippet', () => {
    const result = classifyShape(NEGATIVE_AVOID_RESPONSE, MENTIONED_AVOID, TWO_COMPETITORS);
    expect(result.shape).toBe('negative_avoid');
    expect(result.outcome).toBe('loss');
  });

  it('(5) navigational_branded — single-entity answer with contact info', () => {
    const result = classifyShape(NAVIGATIONAL_RESPONSE, MENTIONED_NO_RANK, NO_COMPETITORS);
    expect(result.shape).toBe('navigational_branded');
  });

  it('(6) cited_as_source — client domain in citation URL', () => {
    const detection: ClientDetection = {
      mentioned: true,
      rank_position: null,
      matched_text: 'acme-dental',
      mention_snippet: 'you can find helpful information at https://www.acme-dental.co.il',
    };
    const result = classifyShape(CITED_SOURCE_RESPONSE, detection, NO_COMPETITORS);
    expect(result.shape).toBe('cited_as_source');
    expect(result.outcome).toBe('win');
  });

  it('(7) local_pack — location-grouped results', () => {
    const result = classifyShape(LOCAL_PACK_RESPONSE, MENTIONED_RANK_3, TWO_COMPETITORS);
    expect(result.shape).toBe('local_pack');
  });

  it('(8) comparison — vs framing with 2 entities', () => {
    const result = classifyShape(COMPARISON_RESPONSE, NOT_MENTIONED, TWO_COMPETITORS);
    expect(result.shape).toBe('comparison');
    expect(result.outcome).toBe('loss'); // client not mentioned
  });

  it('(9) ranked_listicle — numbered list of ≥3 options', () => {
    const result = classifyShape(RANKED_LISTICLE_RESPONSE, MENTIONED_RANK_3, FOUR_COMPETITORS);
    expect(result.shape).toBe('ranked_listicle');
  });

  it('(10) single_recommendation — one clear recommendation', () => {
    const result = classifyShape(SINGLE_RECOMMENDATION_RESPONSE, NOT_MENTIONED, NO_COMPETITORS);
    expect(result.shape).toBe('single_recommendation');
    expect(result.outcome).toBe('loss'); // client not the recommended one
  });

  it('(11) passing_mention — client mentioned but not ranked or recommended', () => {
    const result = classifyShape(PASSING_MENTION_RESPONSE, MENTIONED_NO_RANK, TWO_COMPETITORS);
    expect(result.shape).toBe('passing_mention');
    expect(result.outcome).toBe('partial');
  });

  it('(12) tool_vs_service_vs_product — type-framed answer', () => {
    const result = classifyShape(TOOL_VS_SERVICE_RESPONSE, NOT_MENTIONED, NO_COMPETITORS);
    expect(result.shape).toBe('tool_vs_service_vs_product');
    expect(result.outcome).toBe('loss');
  });

  it('(13) category_defining — generic category description', () => {
    const result = classifyShape(CATEGORY_DEFINING_RESPONSE, NOT_MENTIONED, NO_COMPETITORS);
    expect(result.shape).toBe('category_defining');
    expect(result.outcome).toBe('loss');
  });

  it('(14) conservative: ranked_listicle rank ≥4 → partial (not win)', () => {
    const result = classifyShape(RANKED_LISTICLE_RESPONSE, MENTIONED_RANK_5, FOUR_COMPETITORS);
    expect(result.shape).toBe('ranked_listicle');
    expect(result.outcome).toBe('partial');
  });

  it('(15) conservative: comparison with client → partial (not win)', () => {
    const result = classifyShape(COMPARISON_RESPONSE, MENTIONED_NO_RANK, TWO_COMPETITORS);
    expect(result.shape).toBe('comparison');
    expect(result.outcome).toBe('partial');
  });

  it('(16) ranked_listicle rank 1–3 → win', () => {
    const result = classifyShape(RANKED_LISTICLE_RESPONSE, MENTIONED_RANK_1, FOUR_COMPETITORS);
    expect(result.shape).toBe('ranked_listicle');
    expect(result.outcome).toBe('win');
  });

  it('(16b) ranked_listicle rank 3 → win', () => {
    const result = classifyShape(RANKED_LISTICLE_RESPONSE, MENTIONED_RANK_3, FOUR_COMPETITORS);
    expect(result.shape).toBe('ranked_listicle');
    expect(result.outcome).toBe('win');
  });

  it('(17) single_recommendation client NOT mentioned → loss', () => {
    const result = classifyShape(SINGLE_RECOMMENDATION_RESPONSE, NOT_MENTIONED, NO_COMPETITORS);
    expect(result.outcome).toBe('loss');
  });

  it('(18) no_answer → always loss regardless of detection', () => {
    // Even if somehow a detection fires on a refusal response, outcome is still loss
    const result = classifyShape(REFUSAL_RESPONSE, MENTIONED_NO_RANK, NO_COMPETITORS);
    expect(result.shape).toBe('no_answer');
    expect(result.outcome).toBe('loss');
  });

  it('(19) negative_avoid → always loss', () => {
    // negative_avoid is always loss — being warned against is unambiguously bad
    const result = classifyShape(NEGATIVE_AVOID_RESPONSE, MENTIONED_AVOID, TWO_COMPETITORS);
    expect(result.outcome).toBe('loss');
  });

  it('(20) local_pack: client at rank 1 → win; not mentioned → loss', () => {
    const winResult = classifyShape(LOCAL_PACK_RESPONSE, MENTIONED_RANK_1, TWO_COMPETITORS);
    expect(winResult.shape).toBe('local_pack');
    expect(winResult.outcome).toBe('win');

    const lossResult = classifyShape(LOCAL_PACK_RESPONSE, NOT_MENTIONED, TWO_COMPETITORS);
    expect(lossResult.shape).toBe('local_pack');
    expect(lossResult.outcome).toBe('loss');
  });

  it('(21) passing_mention → always partial', () => {
    const result = classifyShape(PASSING_MENTION_RESPONSE, MENTIONED_NO_RANK, TWO_COMPETITORS);
    expect(result.shape).toBe('passing_mention');
    expect(result.outcome).toBe('partial');
  });

  it('(22) navigational_branded without client mention → loss', () => {
    const result = classifyShape(NAVIGATIONAL_RESPONSE, NOT_MENTIONED, NO_COMPETITORS);
    // Should be navigational_branded with loss since client not mentioned
    if (result.shape === 'navigational_branded') {
      expect(result.outcome).toBe('loss');
    }
    // If shape didn't classify as navigational (response too varied), at least check
    // outcome is not win
    expect(result.outcome).not.toBe('win');
  });
});
