/**
 * Unit tests for playbook-mapping.ts.
 *
 * Coverage:
 *   (1) All 4 AgentPlaybookId enum values get their own group.
 *   (2) Gaps with invalid/null playbook_id are grouped under playbook_id: null.
 *   (3) Group order is by best (lowest) rank of the group's leading gap.
 *   (4) Gaps are in rank order within each group.
 *   (5) Empty ranked list → empty assignments.
 *   (6) A group is only created when there is at least one gap for it.
 *   (7) Unknown playbook_id string (not in 4-value set) → null group.
 */

import { describe, it, expect } from 'vitest';
import { mapGapsToPlaybooks } from '../playbook-mapping';
import type { RankedGap } from '../gap-types';

// ---------------------------------------------------------------------------
// Helper — build a minimal RankedGap
// ---------------------------------------------------------------------------

function makeRanked(
  factor_key: string,
  rank: number,
  playbook_id: string | null,
  opts: {
    promises_lift?: boolean;
    tier?: number;
  } = {},
): RankedGap {
  return {
    factor_key,
    display_name: factor_key,
    tier: opts.tier ?? 1,
    impact_weight: 0.3,
    playbook_id,
    promises_lift: opts.promises_lift !== undefined ? opts.promises_lift : true,
    contrastive_count: 0,
    competitors_with_factor: [],
    contrastive_evidence: 'Ordered by impact (no competitor comparison available this scan)',
    fixability: 'medium',
    effort_score: 2,
    rank,
    ordering_mode: 'impact_fallback',
  };
}

// ---------------------------------------------------------------------------
// (1) All 4 AgentPlaybookId enum values get their own group
// ---------------------------------------------------------------------------

describe('mapGapsToPlaybooks — 4 enum grouping', () => {
  it('creates separate groups for each of the 4 valid playbook_id values', () => {
    const ranked = [
      makeRanked('gap_co', 1, 'content_optimizer'),
      makeRanked('gap_sg', 2, 'schema_generator'),
      makeRanked('gap_rp', 3, 'review_presence_planner'),
      makeRanked('gap_rr', 4, 'reddit_presence_planner'),
    ];

    const assignments = mapGapsToPlaybooks(ranked);

    expect(assignments).toHaveLength(4);
    const ids = assignments.map((a) => a.playbook_id);
    expect(ids).toContain('content_optimizer');
    expect(ids).toContain('schema_generator');
    expect(ids).toContain('review_presence_planner');
    expect(ids).toContain('reddit_presence_planner');
  });

  it('each group has exactly the gaps with that playbook_id', () => {
    const ranked = [
      makeRanked('co_gap_1', 1, 'content_optimizer'),
      makeRanked('co_gap_2', 2, 'content_optimizer'),
      makeRanked('sg_gap_1', 3, 'schema_generator'),
    ];

    const assignments = mapGapsToPlaybooks(ranked);
    const coGroup = assignments.find((a) => a.playbook_id === 'content_optimizer');
    const sgGroup = assignments.find((a) => a.playbook_id === 'schema_generator');

    expect(coGroup?.gaps).toHaveLength(2);
    expect(sgGroup?.gaps).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// (2) Null/invalid playbook_id → null group
// ---------------------------------------------------------------------------

describe('mapGapsToPlaybooks — null/invalid playbook_id', () => {
  it('null playbook_id is grouped under playbook_id: null', () => {
    const ranked = [
      makeRanked('earned_media_pr', 1, null),
      makeRanked('listicle_inclusion', 2, null),
    ];

    const assignments = mapGapsToPlaybooks(ranked);
    expect(assignments).toHaveLength(1);
    expect(assignments[0].playbook_id).toBeNull();
    expect(assignments[0].gaps).toHaveLength(2);
  });

  it('unknown string playbook_id (not in 4-value set) → null group', () => {
    const ranked = [
      makeRanked('future_gap', 1, 'future_agent_type_not_in_mvp_set'),
    ];

    const assignments = mapGapsToPlaybooks(ranked);
    expect(assignments).toHaveLength(1);
    expect(assignments[0].playbook_id).toBeNull();
  });

  it('mix of valid and null playbook_ids creates separate groups', () => {
    const ranked = [
      makeRanked('earned_media_pr', 1, null),          // null group
      makeRanked('review_systems', 2, 'review_presence_planner'),
      makeRanked('listicle_inclusion', 3, null),       // null group
    ];

    const assignments = mapGapsToPlaybooks(ranked);
    expect(assignments).toHaveLength(2);

    const nullGroup = assignments.find((a) => a.playbook_id === null);
    const reviewGroup = assignments.find((a) => a.playbook_id === 'review_presence_planner');

    expect(nullGroup?.gaps).toHaveLength(2);
    expect(reviewGroup?.gaps).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// (3) Group order is by best (lowest) rank of group's leading gap
// ---------------------------------------------------------------------------

describe('mapGapsToPlaybooks — group ordering', () => {
  it('group with rank-1 gap comes first', () => {
    const ranked = [
      makeRanked('schema_gap', 1, 'schema_generator'),  // rank 1 = best
      makeRanked('reddit_gap', 2, 'reddit_presence_planner'),
      makeRanked('content_gap', 3, 'content_optimizer'),
    ];

    const assignments = mapGapsToPlaybooks(ranked);

    expect(assignments[0].playbook_id).toBe('schema_generator');
    expect(assignments[1].playbook_id).toBe('reddit_presence_planner');
    expect(assignments[2].playbook_id).toBe('content_optimizer');
  });

  it('null group sorts by its best rank, not always at tail', () => {
    // null group has rank 1 — it should lead
    const ranked = [
      makeRanked('earned_media_pr', 1, null),         // rank 1
      makeRanked('review_gap', 2, 'review_presence_planner'),
      makeRanked('reddit_gap', 3, 'reddit_presence_planner'),
    ];

    const assignments = mapGapsToPlaybooks(ranked);
    // null group has rank 1 = best → should be first
    expect(assignments[0].playbook_id).toBeNull();
  });

  it('group with multiple gaps orders by the first (best) gap rank', () => {
    const ranked = [
      makeRanked('co_gap_1', 1, 'content_optimizer'),
      makeRanked('co_gap_2', 2, 'content_optimizer'),
      makeRanked('sg_gap_1', 3, 'schema_generator'),
    ];

    const assignments = mapGapsToPlaybooks(ranked);
    expect(assignments[0].playbook_id).toBe('content_optimizer');
    expect(assignments[1].playbook_id).toBe('schema_generator');
  });
});

// ---------------------------------------------------------------------------
// (4) Gaps within each group are in rank order
// ---------------------------------------------------------------------------

describe('mapGapsToPlaybooks — intra-group ordering', () => {
  it('gaps within a group preserve ascending rank order', () => {
    const ranked = [
      makeRanked('co_gap_a', 1, 'content_optimizer'),
      makeRanked('sg_gap_1', 2, 'schema_generator'),
      makeRanked('co_gap_b', 3, 'content_optimizer'),
      makeRanked('co_gap_c', 5, 'content_optimizer'),
    ];

    const assignments = mapGapsToPlaybooks(ranked);
    const coGroup = assignments.find((a) => a.playbook_id === 'content_optimizer')!;

    expect(coGroup.gaps[0].rank).toBeLessThan(coGroup.gaps[1].rank);
    expect(coGroup.gaps[1].rank).toBeLessThan(coGroup.gaps[2].rank);
  });
});

// ---------------------------------------------------------------------------
// (5) Empty ranked list
// ---------------------------------------------------------------------------

describe('mapGapsToPlaybooks — empty input', () => {
  it('empty ranked list → empty assignments', () => {
    expect(mapGapsToPlaybooks([])).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// (6) A group is only created when there is at least one gap for it
// ---------------------------------------------------------------------------

describe('mapGapsToPlaybooks — no empty groups', () => {
  it('only creates groups for playbook_ids that appear in the input', () => {
    const ranked = [
      makeRanked('gap_1', 1, 'content_optimizer'),
      // No schema_generator or review/reddit gaps
    ];

    const assignments = mapGapsToPlaybooks(ranked);
    expect(assignments).toHaveLength(1);
    expect(assignments[0].playbook_id).toBe('content_optimizer');
  });
});

// ---------------------------------------------------------------------------
// (7) ~80% coverage expectation documented via test
// ---------------------------------------------------------------------------

describe('mapGapsToPlaybooks — coverage expectations', () => {
  it('gaps with valid playbook_ids are correctly classified (~80% coverage scenario)', () => {
    // Simulate a realistic gap list: 8 gaps, 2 null-playbook (manual/earned)
    const ranked = [
      makeRanked('ai_bot_allowlist', 1, 'content_optimizer'),
      makeRanked('extractable_structure', 2, 'content_optimizer'),
      makeRanked('review_systems', 3, 'review_presence_planner'),
      makeRanked('reddit_quora_presence', 4, 'reddit_presence_planner'),
      makeRanked('basic_schema', 5, 'schema_generator'),
      makeRanked('topical_authority_cluster', 6, 'content_optimizer'),
      makeRanked('earned_media_pr', 7, null),       // no agent
      makeRanked('listicle_inclusion', 8, null),    // no agent
    ];

    const assignments = mapGapsToPlaybooks(ranked);

    // 5 distinct groups: 4 valid playbooks + 1 null
    expect(assignments).toHaveLength(5);

    const totalGaps = assignments.reduce((sum, a) => sum + a.gaps.length, 0);
    expect(totalGaps).toBe(8);

    // Non-null groups have 6 of 8 gaps = 75% coverage (close to the ~80% target)
    const coveredGaps = assignments
      .filter((a) => a.playbook_id !== null)
      .reduce((sum, a) => sum + a.gaps.length, 0);
    expect(coveredGaps).toBe(6);
  });
});
