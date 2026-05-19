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

/**
 * Returns Tailwind color class names for score display in DOM elements.
 * Use getScoreColor() for SVG stroke/fill values.
 */
export function getScoreColorClass(score: number): {
  text: string
  bg: string
  border: string
} {
  if (score >= 75) return {
    text: 'text-[var(--color-score-excellent)]',
    bg: 'bg-[var(--color-score-excellent)]/10',
    border: 'border-[var(--color-score-excellent)]/20',
  }
  if (score >= 50) return {
    text: 'text-[var(--color-score-good)]',
    bg: 'bg-[var(--color-score-good)]/10',
    border: 'border-[var(--color-score-good)]/20',
  }
  if (score >= 25) return {
    text: 'text-[var(--color-score-fair)]',
    bg: 'bg-[var(--color-score-fair)]/10',
    border: 'border-[var(--color-score-fair)]/20',
  }
  return {
    text: 'text-[var(--color-score-critical)]',
    bg: 'bg-[var(--color-score-critical)]/10',
    border: 'border-[var(--color-score-critical)]/20',
  }
}
