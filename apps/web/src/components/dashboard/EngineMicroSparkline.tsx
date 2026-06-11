'use client'

/**
 * EngineMicroSparkline — M4 Signature detail
 *
 * ~24px tall, ~64px wide SVG polyline of the last ~5 score points
 * in the score-band color. When data is null, renders a flat 1px
 * #E5E7EB baseline. NEVER renders fake data — null = baseline.
 *
 * Score band colors match the rest of the dashboard data-viz series.
 */

interface EngineMicroSparklineProps {
  /** Last ~5 score points (0–100). Pass null/empty for baseline. */
  points: number[] | null | undefined
  /** Current score — used to pick the color band */
  currentScore: number | null
  className?: string
}

function scoreColor(score: number): string {
  if (score >= 75) return 'var(--color-data-3)' // cyan — excellent
  if (score >= 50) return 'var(--color-data-4)' // green — good
  if (score >= 25) return 'var(--color-data-5)' // amber — fair
  return 'var(--color-data-6)'                   // red — critical
}

const WIDTH = 64
const HEIGHT = 24
const PADDING_Y = 3

export function EngineMicroSparkline({
  points,
  currentScore,
  className,
}: EngineMicroSparklineProps) {
  const hasData =
    points && points.length >= 2 && currentScore !== null

  if (!hasData) {
    // flat 1px baseline — data absent, never fake
    return (
      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        aria-hidden="true"
        className={className}
      >
        <line
          x1={0}
          y1={HEIGHT / 2}
          x2={WIDTH}
          y2={HEIGHT / 2}
          stroke="#E5E7EB"
          strokeWidth={1}
        />
      </svg>
    )
  }

  const color = scoreColor(currentScore!)
  const pts = points!.slice(-5)
  const min = Math.min(...pts)
  const max = Math.max(...pts)
  const range = max - min || 1 // avoid ÷0

  // map score value → y coordinate (invert: higher = up)
  const toY = (v: number) =>
    HEIGHT - PADDING_Y - ((v - min) / range) * (HEIGHT - PADDING_Y * 2)

  const step = WIDTH / (pts.length - 1)
  const polylinePoints = pts
    .map((v, i) => `${i * step},${toY(v)}`)
    .join(' ')

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      aria-hidden="true"
      className={className}
    >
      <polyline
        points={polylinePoints}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
