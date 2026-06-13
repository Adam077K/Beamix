'use client'

/**
 * EngineMicroSparkline — M4 signature detail (CRAFT-SYSTEM tell #4).
 *
 * A ~64×24 SVG sparkline of the last ~5 score points in the score-band color.
 * The contract that makes it read as intentional, not a glitch:
 *  - It ALWAYS renders a visible 1px #E5E7EB baseline under the series — so a
 *    single-point or null series is a deliberate flat line, not a stranded stroke.
 *  - It enforces a minimum 64×24 footprint, so it never collapses to an invisible
 *    hairline in a cramped row.
 *  - The latest value carries an endpoint dot, so the eye lands on "now".
 *  - An optional trend delta sits to the right when `showDelta` is set.
 *  - It NEVER fabricates data (M4 "never fake data"): null/empty/one-point series
 *    show the baseline + (when a current score exists) the endpoint dot only.
 *
 * Score-band colors match the rest of the dashboard data-viz series.
 */

interface EngineMicroSparklineProps {
  /** Last ~5 score points (0–100). Pass null/empty for the baseline-only state. */
  points: number[] | null | undefined
  /** Current score — used to pick the color band and place the endpoint dot. */
  currentScore: number | null
  /** Show a small trend-delta pill to the right of the line. Default false. */
  showDelta?: boolean
  /** Override the drawn width (clamped to a 64px minimum). */
  width?: number
  /** Override the drawn height (clamped to a 24px minimum). */
  height?: number
  className?: string
}

function scoreColor(score: number): string {
  if (score >= 75) return 'var(--color-data-3)' // cyan — excellent
  if (score >= 50) return 'var(--color-data-4)' // green — good
  if (score >= 25) return 'var(--color-data-5)' // amber — fair
  return 'var(--color-data-6)' //                 red — critical
}

const MIN_WIDTH = 64
const MIN_HEIGHT = 24
const PADDING_X = 1.5
const PADDING_Y = 4 // headroom for the 1.5px endpoint dot at the top/bottom

export function EngineMicroSparkline({
  points,
  currentScore,
  showDelta = false,
  width,
  height,
  className,
}: EngineMicroSparklineProps) {
  const w = Math.max(width ?? MIN_WIDTH, MIN_WIDTH)
  const h = Math.max(height ?? MIN_HEIGHT, MIN_HEIGHT)
  const baselineY = h / 2

  const series = points ?? []
  const hasLine = series.length >= 2 && currentScore !== null
  const hasPoint = series.length >= 1 && currentScore !== null
  const color = currentScore !== null ? scoreColor(currentScore) : '#9CA3AF'

  // ---- geometry (only computed when we have a real ≥2-point line) ----
  let polylinePoints = ''
  let endX = w - PADDING_X
  let endY = baselineY

  if (hasLine) {
    const pts = series.slice(-5)
    const min = Math.min(...pts)
    const max = Math.max(...pts)
    const range = max - min || 1 // avoid ÷0 on a flat real series

    const innerH = h - PADDING_Y * 2
    const toY = (v: number) => h - PADDING_Y - ((v - min) / range) * innerH
    const innerW = w - PADDING_X * 2
    const step = innerW / (pts.length - 1)

    polylinePoints = pts.map((v, i) => `${PADDING_X + i * step},${toY(v)}`).join(' ')
    endX = PADDING_X + (pts.length - 1) * step
    endY = toY(pts[pts.length - 1])
  } else if (hasPoint) {
    // single real point — sit the dot on the baseline at the right edge
    endX = w - PADDING_X
    endY = baselineY
  }

  // ---- optional trend delta (latest − first of the drawn window) ----
  let delta: number | null = null
  if (showDelta && hasLine) {
    const pts = series.slice(-5)
    delta = pts[pts.length - 1] - pts[0]
  }

  const svg = (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden="true"
      className={className}
      style={{ overflow: 'visible' }}
    >
      {/* Always-present baseline — the line is intentional, never absent */}
      <line
        x1={0}
        y1={baselineY}
        x2={w}
        y2={baselineY}
        stroke="#E5E7EB"
        strokeWidth={1}
      />

      {hasLine && (
        <polyline
          points={polylinePoints}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Endpoint dot anchors the eye on "now" whenever a current score exists */}
      {hasPoint && <circle cx={endX} cy={endY} r={1.75} fill={color} />}
    </svg>
  )

  if (!showDelta || delta === null) {
    return svg
  }

  const up = delta > 0
  const flat = delta === 0
  const deltaColor = flat ? '#9CA3AF' : up ? 'var(--color-status-positive)' : 'var(--color-status-critical)'

  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      {svg}
      <span
        className="font-mono text-[11px] tabular-nums"
        style={{ color: deltaColor }}
      >
        {flat ? '±0' : `${up ? '+' : ''}${Math.round(delta)}`}
      </span>
    </span>
  )
}
