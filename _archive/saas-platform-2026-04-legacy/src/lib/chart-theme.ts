/**
 * chart-theme.ts
 * Central configuration for all Recharts instances in the Beamix dashboard.
 * Import from this file — never hardcode chart colors or axis props inline.
 */

// ─── Color palette ─────────────────────────────────────────────────────────────

export const CHART_COLORS = {
  primary: 'var(--chart-1)',
  secondary: 'var(--chart-2)',
  tertiary: 'var(--chart-3)',
  quaternary: 'var(--chart-4)',
  quinary: 'var(--chart-5)',
  senary: 'var(--chart-6)',
} as const

export const CHART_COLOR_LIST = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
] as const

// ─── Fill variants (semi-transparent for area/bar fills) ──────────────────────

export const CHART_FILL_COLORS = {
  primary: 'var(--chart-fill-1)',
  secondary: 'var(--chart-fill-2)',
  tertiary: 'var(--chart-fill-3)',
  quaternary: 'var(--chart-fill-4)',
  quinary: 'var(--chart-fill-5)',
  senary: 'var(--chart-fill-6)',
} as const

// ─── Axis props ────────────────────────────────────────────────────────────────

export const DEFAULT_AXIS_PROPS = {
  axisLine: false,
  tickLine: false,
  tick: { fontSize: 12, fill: 'var(--muted-foreground)' },
  tickMargin: 8,
} as const

export const DEFAULT_XAXIS_PROPS = {
  ...DEFAULT_AXIS_PROPS,
  dy: 4,
} as const

export const DEFAULT_YAXIS_PROPS = {
  ...DEFAULT_AXIS_PROPS,
  width: 40,
} as const

// ─── Grid props ────────────────────────────────────────────────────────────────

export const DEFAULT_GRID_PROPS = {
  vertical: false,
  stroke: 'var(--border)',
  strokeDasharray: '3 3',
  strokeOpacity: 0.6,
} as const

// ─── Animation ─────────────────────────────────────────────────────────────────

export const CHART_ANIMATION = {
  duration: 800,
  easing: 'ease-out' as const,
} as const

// ─── Margin presets ────────────────────────────────────────────────────────────

export const CHART_MARGINS = {
  default: { top: 10, right: 10, left: -10, bottom: 0 },
  compact: { top: 4, right: 4, left: -20, bottom: 0 },
  spacious: { top: 16, right: 16, left: 0, bottom: 8 },
} as const

// ─── Tooltip cursor style ──────────────────────────────────────────────────────

export const CHART_CURSOR_PROPS = {
  stroke: 'var(--chart-1)',
  strokeWidth: 1,
  strokeDasharray: '3 3',
} as const
