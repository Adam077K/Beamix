/**
 * Test fixtures for load-gaps.test.ts.
 *
 * Three scan_v2 JSONB blobs:
 *   happy              — valid scan_v2.gap_list with 3 ranked gaps
 *   missing_scan_v2    — results blob without scan_v2 key
 *   corrupted          — scan_v2.gap_list with a Zod-invalid gap row
 */

// ---------------------------------------------------------------------------
// happy — valid gap_list with 3 ranked gaps in deliberate rank order
// ---------------------------------------------------------------------------

export const HAPPY_FREE_SCAN_RESULTS = {
  scan_v2: {
    engine_subscores: [],
    headline_band: { point: 55, ci_low: 48, ci_high: 62, sample_n: 18, low_confidence: false },
    gap_list: [
      {
        factor_key: 'review_systems',
        display_name: 'Review Systems',
        tier: 1,
        impact_weight: 0.85,
        playbook_id: 'review_presence_planner',
        promises_lift: true,
        contrastive_count: 3,
        competitors_with_factor: ['Competitor A', 'Competitor B', 'Competitor C'],
        contrastive_evidence: '3 of 3 named competitors have Review Systems; you don\'t',
        fixability: 'medium',
        effort_score: 2,
        rank: 1,
        ordering_mode: 'contrastive',
      },
      {
        factor_key: 'faq_coverage',
        display_name: 'FAQ Coverage',
        tier: 1,
        impact_weight: 0.78,
        playbook_id: 'content_optimizer',
        promises_lift: true,
        contrastive_count: 2,
        competitors_with_factor: ['Competitor A', 'Competitor B'],
        contrastive_evidence: '2 of 3 named competitors have FAQ Coverage; you don\'t',
        fixability: 'fast',
        effort_score: 1,
        rank: 2,
        ordering_mode: 'contrastive',
      },
      {
        factor_key: 'llms_txt',
        display_name: 'llms.txt File',
        tier: 3,
        impact_weight: 0.2,
        playbook_id: null,
        promises_lift: false,
        contrastive_count: 0,
        competitors_with_factor: [],
        contrastive_evidence: 'No audited competitor has llms.txt File either — lower priority',
        fixability: 'fast',
        effort_score: 1,
        rank: 3,
        ordering_mode: 'contrastive',
      },
    ],
    competitors: [],
    narration: { summary: 'Test summary', gap_explanations: [], degraded: false },
    meta: { degraded: false },
  },
}

// ---------------------------------------------------------------------------
// missing_scan_v2 — results blob that lacks the scan_v2 key
// ---------------------------------------------------------------------------

export const MISSING_SCAN_V2_RESULTS = {
  visibility_score: 42,
  engines_checked: 3,
  // No scan_v2 key at all — legacy v1 shape
  engine_results: [
    { id: 'chatgpt', label: 'ChatGPT', score: 42, mentioned: false },
  ],
}

// ---------------------------------------------------------------------------
// corrupted — scan_v2 present but gap_list has an invalid row (missing rank)
// ---------------------------------------------------------------------------

export const CORRUPTED_SCAN_V2_RESULTS = {
  scan_v2: {
    gap_list: [
      {
        // Missing required 'rank' field — Zod should reject this
        factor_key: 'review_systems',
        display_name: 'Review Systems',
        tier: 1,
        impact_weight: 0.85,
        playbook_id: null,
        promises_lift: true,
        contrastive_count: 1,
        competitors_with_factor: ['X'],
        contrastive_evidence: '1 of 1 named competitors have Review Systems; you don\'t',
        fixability: 'medium',
        effort_score: 2,
        // rank: deliberately omitted
        ordering_mode: 'contrastive',
      },
    ],
  },
}
