/**
 * Shared pure helpers for the approvals feature.
 * Extracted from ApprovalRow.tsx + ApprovalsList.tsx to avoid duplication.
 * Node-env testable — no browser APIs.
 */

import type { ApprovalQueueItem } from './_data'

// ---------------------------------------------------------------------------
// PUBLISH_KINDS — single source of truth for "publish-type" approval kinds
// Re-exported here so the logic is testable without importing the React component.
// ---------------------------------------------------------------------------

export const PUBLISH_KINDS: ApprovalQueueItem['kind'][] = [
  'content_publish',
  'schema_push',
  'listing_update',
  'citation_submit',
]

/**
 * Returns the label for the approve button.
 * Publish-type kinds get "Approve & publish"; others get "Approve".
 */
export function getApproveLabel(kind: ApprovalQueueItem['kind']): string {
  return PUBLISH_KINDS.includes(kind) ? 'Approve & publish' : 'Approve'
}

// ---------------------------------------------------------------------------
// isHighRisk — single source of truth
// ---------------------------------------------------------------------------

/**
 * Returns true when the resource signals YMYL or mandatory human review.
 * Checks `resource.risk === 'ymyl'` OR `resource.mandatory_human === true`.
 */
export function isHighRisk(resource: Record<string, unknown>): boolean {
  return resource['risk'] === 'ymyl' || resource['mandatory_human'] === true
}

// ---------------------------------------------------------------------------
// sortApprovals — risk-first, expiry-soonest, newest-created
// ---------------------------------------------------------------------------

/**
 * Sorts approval queue items:
 *   1. High-risk (YMYL / mandatory_human) first
 *   2. Earliest expiry first
 *   3. Newest created_at first (desc)
 */
export function sortApprovals(items: ApprovalQueueItem[]): ApprovalQueueItem[] {
  return [...items].sort((a, b) => {
    // 1. High-risk first
    const aRisk = isHighRisk(a.resource) ? 0 : 1
    const bRisk = isHighRisk(b.resource) ? 0 : 1
    if (aRisk !== bRisk) return aRisk - bRisk

    // 2. Earliest expiry first
    const aExp = new Date(a.expiresAt).getTime()
    const bExp = new Date(b.expiresAt).getTime()
    if (aExp !== bExp) return aExp - bExp

    // 3. Newest created first
    const aCreated = new Date(a.createdAt).getTime()
    const bCreated = new Date(b.createdAt).getTime()
    return bCreated - aCreated
  })
}
