'use client'

import { motion } from 'framer-motion'
import { spring } from '@/lib/motion'

interface ProgressRingProps {
  value: number
  max: number
  size?: number
}

export default function ProgressRing({ value, max, size = 80 }: ProgressRingProps) {
  const strokeWidth = size * 0.075
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  const offset = circumference - (pct / 100) * circumference
  const center = size / 2
  const fontSize = size * 0.225

  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${pct}% complete — ${value} of ${max}`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#3370FF"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${center} ${center})`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ ...spring.subtle, duration: 1.0 }}
        />
      </svg>
      <span
        className="absolute font-semibold tabular-nums text-gray-900"
        style={{ fontSize }}
      >
        {pct}%
      </span>
    </div>
  )
}
