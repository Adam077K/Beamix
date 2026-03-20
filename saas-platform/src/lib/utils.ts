import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns a hex color string for a visibility score (0-100).
 * Thresholds: >= 75 Excellent (cyan), >= 50 Good (green), >= 25 Fair (amber), < 25 Critical (red).
 * Returns a neutral gray for null scores.
 */
export function getScoreColor(score: number | null): string {
  if (score === null) return '#E5E7EB'
  if (score >= 75) return '#06B6D4'
  if (score >= 50) return '#10B981'
  if (score >= 25) return '#F59E0B'
  return '#EF4444'
}
