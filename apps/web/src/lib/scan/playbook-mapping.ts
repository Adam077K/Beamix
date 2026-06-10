/**
 * playbook-mapping.ts — Groups ranked gaps by agent playbook for Wave 6.
 *
 * The four AgentPlaybookId values (content_optimizer | schema_generator |
 * review_presence_planner | reddit_presence_planner) cover ~80% of agentable
 * gaps via the playbook_id discriminator (SCAN-MEASUREMENT-MODEL.md §3).
 *
 * Gaps with playbook_id === null (or any unexpected string not in the enum set)
 * are grouped under playbook_id: null — these represent manual/earned work
 * that no agent playbook covers (the ~20% remainder).
 *
 * Group order: the group whose lowest-rank (best) gap has the lowest rank number
 * comes first. This surfaces the most urgent playbook at the top of the dispatch list.
 *
 * NOTE: No enum migration for MVP. The 4 enum values are the MVP set. Any playbook_id
 * in the catalog that is not in the 4-value set (including future additions) maps to
 * the null/manual group until an enum extension is landed.
 */

import type { AgentPlaybookId, PlaybookAssignment, RankedGap } from './gap-types';

// ---------------------------------------------------------------------------
// The canonical AgentPlaybookId set (4 values per MVP spec)
// ---------------------------------------------------------------------------

const VALID_PLAYBOOK_IDS = new Set<AgentPlaybookId>([
  'content_optimizer',
  'schema_generator',
  'review_presence_planner',
  'reddit_presence_planner',
]);

/**
 * Type guard: returns true if s is a valid AgentPlaybookId enum value.
 * Anything outside the 4-value MVP set (including null, undefined, or future
 * enum additions) returns false and routes to the manual/null group.
 */
function isValidPlaybookId(s: string | null | undefined): s is AgentPlaybookId {
  return typeof s === 'string' && VALID_PLAYBOOK_IDS.has(s as AgentPlaybookId);
}

// ---------------------------------------------------------------------------
// mapGapsToPlaybooks
// ---------------------------------------------------------------------------

/**
 * Groups ranked gaps into PlaybookAssignment buckets by playbook_id.
 *
 * Algorithm:
 *   1. For each gap, validate playbook_id against the 4 AgentPlaybookId enum values.
 *      Anything outside the set (including null) → null bucket (manual/earned).
 *   2. Maintain a Map<AgentPlaybookId | null, RankedGap[]> preserving insertion order.
 *   3. Within each group, gaps are in rank order (lowest rank first) — the sort from
 *      buildContrastiveGapList is preserved; no re-sorting within groups.
 *   4. Order groups by their best (lowest-rank) gap number ascending, so the most
 *      urgent playbook appears first in the returned array.
 *   5. The null/manual group sorts with the same rule — it does NOT always tail.
 *      If the highest-priority gap happens to have no playbook, it leads.
 *      (This is intentional: earned media / listicle work often ranks very high.)
 *
 * Coverage expectation: ~80% of gaps have a non-null playbook_id (§3).
 * The null group represents manual/earned work where no agent playbook exists today.
 *
 * @param ranked - Output of buildContrastiveGapList(). Order is significant.
 */
export function mapGapsToPlaybooks(ranked: RankedGap[]): PlaybookAssignment[] {
  // Map from playbook_id key → gaps array.
  // null is a valid map key in JavaScript.
  const groups = new Map<AgentPlaybookId | null, RankedGap[]>();

  for (const gap of ranked) {
    // Normalise: any playbook_id not in the 4-value enum → null (manual group).
    const key: AgentPlaybookId | null = isValidPlaybookId(gap.playbook_id)
      ? gap.playbook_id
      : null;

    const existing = groups.get(key);
    if (existing) {
      existing.push(gap);
    } else {
      groups.set(key, [gap]);
    }
  }

  // Build assignments array, then sort groups by their best (min rank) gap.
  // Since `ranked` is already in ascending rank order, the first element of each
  // group is the group's best gap — no inner sort needed.
  const assignments: PlaybookAssignment[] = Array.from(groups.entries()).map(
    ([playbook_id, gaps]) => ({ playbook_id, gaps }),
  );

  // Sort groups by the rank of their best gap (first element, smallest rank = best).
  assignments.sort((a, b) => {
    // Safety: both arrays are non-empty by construction (we only create a group
    // when we push the first gap into it).
    const bestA = a.gaps[0]?.rank ?? Infinity;
    const bestB = b.gaps[0]?.rank ?? Infinity;
    return bestA - bestB;
  });

  return assignments;
}
