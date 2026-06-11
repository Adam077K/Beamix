/**
 * Unit tests for approvals/_logic.ts — pure functions only, node-env, no jsdom.
 *
 * Covers:
 *   - isHighRisk: risk detection from resource.risk and resource.mandatory_human
 *   - sortApprovals: risk-first / expiry-soonest / newest-created ordering
 *
 * getResolvedApprovals is a Supabase query — purely async I/O with no testable
 * pure logic. Skipped: integration test territory.
 */

import { describe, it, expect } from 'vitest'
import { isHighRisk, sortApprovals } from './_logic'
import { extractEvidenceUrl } from './_data'
import type { ApprovalQueueItem } from './_data'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeItem(overrides: Partial<ApprovalQueueItem>): ApprovalQueueItem {
  return {
    id: crypto.randomUUID(),
    kind: 'content_publish',
    state: 'pending',
    resource: {},
    evidenceUrl: null,
    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// isHighRisk
// ---------------------------------------------------------------------------

describe('isHighRisk', () => {
  it('returns true when resource.risk is "ymyl"', () => {
    expect(isHighRisk({ risk: 'ymyl' })).toBe(true)
  })

  it('returns true when resource.mandatory_human is true', () => {
    expect(isHighRisk({ mandatory_human: true })).toBe(true)
  })

  it('returns true when both risk and mandatory_human are set', () => {
    expect(isHighRisk({ risk: 'ymyl', mandatory_human: true })).toBe(true)
  })

  it('returns false when resource.risk is a non-ymyl value', () => {
    expect(isHighRisk({ risk: 'low' })).toBe(false)
  })

  it('returns false when mandatory_human is false', () => {
    expect(isHighRisk({ mandatory_human: false })).toBe(false)
  })

  it('returns false for an empty resource', () => {
    expect(isHighRisk({})).toBe(false)
  })

  it('returns false when risk is undefined and mandatory_human is absent', () => {
    expect(isHighRisk({ unrelated: 'data' })).toBe(false)
  })

  it('is case-sensitive — "YMYL" is not a match', () => {
    expect(isHighRisk({ risk: 'YMYL' })).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// sortApprovals
// ---------------------------------------------------------------------------

describe('sortApprovals', () => {
  it('does not mutate the original array', () => {
    const items = [makeItem({}), makeItem({})]
    const original = [...items]
    sortApprovals(items)
    expect(items).toEqual(original)
  })

  it('returns empty array for empty input', () => {
    expect(sortApprovals([])).toEqual([])
  })

  it('returns single item unchanged', () => {
    const item = makeItem({})
    expect(sortApprovals([item])).toEqual([item])
  })

  describe('priority 1 — high-risk first', () => {
    it('places YMYL item before normal item regardless of expiry', () => {
      const soonExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString()
      const laterExpiry = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()

      // Normal item expires sooner, YMYL item expires later
      const normalItem = makeItem({ resource: {}, expiresAt: soonExpiry })
      const ymylItem = makeItem({ resource: { risk: 'ymyl' }, expiresAt: laterExpiry })

      const sorted = sortApprovals([normalItem, ymylItem])
      expect(sorted[0].id).toBe(ymylItem.id)
    })

    it('places mandatory_human item before normal item', () => {
      const normalItem = makeItem({ resource: {} })
      const mandatoryItem = makeItem({ resource: { mandatory_human: true } })

      const sorted = sortApprovals([normalItem, mandatoryItem])
      expect(sorted[0].id).toBe(mandatoryItem.id)
    })

    it('keeps both high-risk items at the top when there are multiple', () => {
      const ymyl1 = makeItem({ resource: { risk: 'ymyl' } })
      const ymyl2 = makeItem({ resource: { mandatory_human: true } })
      const normal = makeItem({ resource: {} })

      const sorted = sortApprovals([normal, ymyl1, ymyl2])
      expect(sorted[0].id === ymyl1.id || sorted[0].id === ymyl2.id).toBe(true)
      expect(sorted[1].id === ymyl1.id || sorted[1].id === ymyl2.id).toBe(true)
      expect(sorted[2].id).toBe(normal.id)
    })
  })

  describe('priority 2 — earliest expiry first (within same risk tier)', () => {
    it('sorts by expiry ascending when risk is equal', () => {
      const expirySoon = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
      const expiryLater = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

      const laterItem = makeItem({ resource: {}, expiresAt: expiryLater })
      const soonItem = makeItem({ resource: {}, expiresAt: expirySoon })

      const sorted = sortApprovals([laterItem, soonItem])
      expect(sorted[0].id).toBe(soonItem.id)
    })

    it('sorts two YMYL items by expiry ascending', () => {
      const ymyl1 = makeItem({
        resource: { risk: 'ymyl' },
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      })
      const ymyl2 = makeItem({
        resource: { risk: 'ymyl' },
        expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
      })

      const sorted = sortApprovals([ymyl1, ymyl2])
      expect(sorted[0].id).toBe(ymyl2.id)
    })
  })

  describe('priority 3 — newest created_at first (within same risk tier and same expiry)', () => {
    it('sorts by createdAt descending when risk and expiry are equal', () => {
      const sameExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      const olderItem = makeItem({
        resource: {},
        expiresAt: sameExpiry,
        createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(), // 2h ago
      })
      const newerItem = makeItem({
        resource: {},
        expiresAt: sameExpiry,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30m ago
      })

      const sorted = sortApprovals([olderItem, newerItem])
      expect(sorted[0].id).toBe(newerItem.id)
    })
  })

  describe('combined multi-criterion sort', () => {
    it('correctly orders: YMYL(soonExpiry), YMYL(laterExpiry), normal(soonExpiry), normal(laterExpiry)', () => {
      const t1 = new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString()
      const t2 = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
      const t3 = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
      const t4 = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

      const normalLater = makeItem({ resource: {}, expiresAt: t4 })
      const ymylSoon = makeItem({ resource: { risk: 'ymyl' }, expiresAt: t1 })
      const normalSoon = makeItem({ resource: {}, expiresAt: t2 })
      const ymylLater = makeItem({ resource: { risk: 'ymyl' }, expiresAt: t3 })

      const sorted = sortApprovals([normalLater, ymylSoon, normalSoon, ymylLater])

      expect(sorted[0].id).toBe(ymylSoon.id)
      expect(sorted[1].id).toBe(ymylLater.id)
      expect(sorted[2].id).toBe(normalSoon.id)
      expect(sorted[3].id).toBe(normalLater.id)
    })
  })
})

// ---------------------------------------------------------------------------
// extractEvidenceUrl — security: scheme allowlist
// ---------------------------------------------------------------------------

describe('extractEvidenceUrl', () => {
  it('returns the URL string for an https URL', () => {
    const result = extractEvidenceUrl({ url: 'https://example.com/evidence.pdf' })
    expect(result).toBe('https://example.com/evidence.pdf')
  })

  it('returns the URL string for an http URL', () => {
    const result = extractEvidenceUrl({ url: 'http://example.com/doc' })
    expect(result).toBe('http://example.com/doc')
  })

  it('returns null for a javascript: URI (XSS vector)', () => {
    expect(extractEvidenceUrl({ url: 'javascript:alert(1)' })).toBeNull()
  })

  it('returns null for a data: URI (XSS vector)', () => {
    expect(extractEvidenceUrl({ url: 'data:text/html,<script>alert(1)</script>' })).toBeNull()
  })

  it('returns null for an empty string', () => {
    expect(extractEvidenceUrl({ url: '' })).toBeNull()
  })

  it('returns null for a malformed URL', () => {
    expect(extractEvidenceUrl({ url: 'not a url at all' })).toBeNull()
  })

  it('returns null when evidence is null', () => {
    expect(extractEvidenceUrl(null)).toBeNull()
  })

  it('returns null when evidence is not an object', () => {
    expect(extractEvidenceUrl('https://example.com')).toBeNull()
    expect(extractEvidenceUrl(42)).toBeNull()
  })

  it('returns null when evidence object has no url key', () => {
    expect(extractEvidenceUrl({ href: 'https://example.com' })).toBeNull()
  })

  it('returns null when url value is not a string', () => {
    expect(extractEvidenceUrl({ url: 123 })).toBeNull()
  })

  it('returns null for an ftp: URI (not in allowlist)', () => {
    expect(extractEvidenceUrl({ url: 'ftp://files.example.com/doc.pdf' })).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// PUBLISH_KINDS approve-label branch (pure logic extracted from ApprovalActions)
// ---------------------------------------------------------------------------

// Import from the real source (ApprovalActions.tsx is a React component; the
// pure constants are re-exported from _logic.ts so the test guards the real values).
import { PUBLISH_KINDS, getApproveLabel } from './_logic'

describe('getApproveLabel — guards real PUBLISH_KINDS from _logic.ts', () => {
  it('returns "Approve & publish" for content_publish', () => {
    expect(getApproveLabel('content_publish')).toBe('Approve & publish')
  })

  it('returns "Approve & publish" for schema_push', () => {
    expect(getApproveLabel('schema_push')).toBe('Approve & publish')
  })

  it('returns "Approve & publish" for listing_update', () => {
    expect(getApproveLabel('listing_update')).toBe('Approve & publish')
  })

  it('returns "Approve & publish" for citation_submit', () => {
    expect(getApproveLabel('citation_submit')).toBe('Approve & publish')
  })

  it('returns "Approve" for email_as_them (not a publish kind)', () => {
    expect(getApproveLabel('email_as_them')).toBe('Approve')
  })

  it('returns "Approve" for outreach (not a publish kind)', () => {
    expect(getApproveLabel('outreach')).toBe('Approve')
  })
})
