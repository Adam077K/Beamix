/**
 * Shared formatting utilities for dashboard number, percent, relative time,
 * and compact number display.
 */

import { formatDistanceToNow, format as formatDate } from 'date-fns'

/**
 * Format a number with thousand separators.
 * @example formatNumber(14022) → "14,022"
 */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n)
}

/**
 * Format a number as a percentage with 1 decimal place.
 * @example formatPercent(12.5) → "12.5%"
 */
export function formatPercent(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(n / 100)
}

/**
 * Format a date string as a relative time string.
 * @example formatRelativeTime("2024-01-01T00:00:00Z") → "2 hours ago"
 */
export function formatRelativeTime(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) return '—'
    return formatDistanceToNow(d, { addSuffix: true })
  } catch {
    return '—'
  }
}

/**
 * Format a date string as a short absolute date.
 * @example formatShortDate("2024-01-15") → "Jan 15, 2024"
 */
export function formatShortDate(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) return '—'
    return formatDate(d, 'MMM d, yyyy')
  } catch {
    return '—'
  }
}

/**
 * Format a large number in compact notation.
 * @example formatCompactNumber(14022) → "14K"
 * @example formatCompactNumber(1500000) → "1.5M"
 */
export function formatCompactNumber(n: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n)
}
