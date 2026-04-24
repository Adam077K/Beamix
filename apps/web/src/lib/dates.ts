/**
 * Date grouping utilities for scan timelines and activity feeds.
 *
 * Key invariant: items with different calendar dates that fall in the
 * same named bucket ("EARLIER THIS WEEK") are collected into ONE group,
 * not separate groups per calendar day.
 */

// ─── Bucket logic ─────────────────────────────────────────────────────────────

/** Returns a stable bucket key for grouping. Items in the same named bucket
 *  get the same key, even if their calendar dates differ. */
export function getRelativeDateBucketKey(date: Date, now: Date = new Date()): string {
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const startOfWeek = new Date(today)
  // Monday-anchored week: go back to the nearest past Monday
  const dayOfWeek = today.getDay() // 0=Sun,1=Mon,...,6=Sat
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  startOfWeek.setDate(today.getDate() - daysToMonday)
  startOfWeek.setHours(0, 0, 0, 0)

  const d = new Date(date)
  d.setHours(0, 0, 0, 0)

  if (d.getTime() === today.getTime()) return '__TODAY__'
  if (d.getTime() === yesterday.getTime()) return '__YESTERDAY__'
  if (d >= startOfWeek) return '__EARLIER_THIS_WEEK__'

  // Older: group by exact calendar date so each past day is its own group
  return d.toISOString().slice(0, 10) // YYYY-MM-DD
}

/** Human-readable label for a bucket key. */
export function bucketKeyToLabel(key: string, representativeDate: Date): string {
  if (key === '__TODAY__') return 'TODAY'
  if (key === '__YESTERDAY__') return 'YESTERDAY'
  if (key === '__EARLIER_THIS_WEEK__') return 'EARLIER THIS WEEK'

  // Absolute date for older items: "12 Apr" style, uppercased
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })
    .format(representativeDate)
    .toUpperCase()
}

// ─── Generic grouping helper ──────────────────────────────────────────────────

export interface DateGroup<T> {
  /** Stable bucket key (for React key prop). */
  key: string
  /** Display label: "TODAY" / "YESTERDAY" / "EARLIER THIS WEEK" / "12 APR" */
  label: string
  items: T[]
}

/**
 * Groups an array of items into relative-date buckets.
 *
 * @param items   Array of items to group. Must be pre-sorted newest→oldest.
 * @param getDate Accessor that returns a Date (or ISO string) for each item.
 * @param now     Override current time (useful for tests). Defaults to new Date().
 *
 * @example
 * const groups = groupByRelativeDate(scans, (s) => s.startedAt)
 * // → [{ key: '__TODAY__', label: 'TODAY', items: [...] }, ...]
 */
export function groupByRelativeDate<T>(
  items: T[],
  getDate: (item: T) => Date | string,
  now: Date = new Date(),
): DateGroup<T>[] {
  const groupMap = new Map<string, DateGroup<T>>()
  // Use an ordered array to preserve insertion order (newest bucket first)
  const groupOrder: string[] = []

  for (const item of items) {
    const raw = getDate(item)
    const date = raw instanceof Date ? raw : new Date(raw)
    const bucketKey = getRelativeDateBucketKey(date, now)

    if (!groupMap.has(bucketKey)) {
      const label = bucketKeyToLabel(bucketKey, date)
      groupMap.set(bucketKey, { key: bucketKey, label, items: [] })
      groupOrder.push(bucketKey)
    }

    groupMap.get(bucketKey)!.items.push(item)
  }

  return groupOrder.map((k) => groupMap.get(k)!)
}
