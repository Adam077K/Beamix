'use client'

import { ENGINES } from './scan-mock'
import type { EngineProgress } from './use-scan-simulation'

interface ScanningMomentProps {
  /** The domain being scanned, shown as the subject line. */
  domain: string
  engines: EngineProgress[]
  /** 0–100 overall progress for the top bar. */
  progress: number
}

const ENGINE_META = Object.fromEntries(
  ENGINES.map((e) => [e.id, e]),
) as Record<string, (typeof ENGINES)[number]>

/**
 * StatusGlyph — the queued ○ → querying ◐ → done ✓ indicator per row.
 * Color carries meaning but is never the *only* signal — the glyph shape
 * and the status label both change too (a11y: not color-alone).
 */
function StatusGlyph({ status }: { status: EngineProgress['status'] }) {
  if (status === 'done') {
    return (
      <span
        className="flex h-5 w-5 items-center justify-center rounded-full bg-[#10B981]"
        aria-hidden="true"
      >
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path
            d="M2.5 6.2 4.8 8.5 9.5 3.5"
            stroke="#fff"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    )
  }
  if (status === 'querying') {
    return (
      <span
        className="flex h-5 w-5 items-center justify-center"
        aria-hidden="true"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className="motion-safe:animate-spin"
          style={{ animationDuration: '900ms' }}
        >
          <circle cx="10" cy="10" r="7" stroke="#E5E7EB" strokeWidth="2" />
          <path
            d="M10 3a7 7 0 0 1 7 7"
            stroke="#3370FF"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </span>
    )
  }
  return (
    <span
      className="flex h-5 w-5 items-center justify-center"
      aria-hidden="true"
    >
      <span className="h-3 w-3 rounded-full border-2 border-[#D1D5DB]" />
    </span>
  )
}

const STATUS_LABEL: Record<EngineProgress['status'], string> = {
  queued: 'Queued',
  querying: 'Querying',
  done: 'Done',
}

/**
 * ScanningMoment — Act B. The Vercel-deploy-log "work is happening" feed.
 * Reused verbatim by the free scan and the post-payment baseline scan.
 */
export function ScanningMoment({ domain, engines, progress }: ScanningMomentProps) {
  const allDone = engines.every((e) => e.status === 'done')

  return (
    <div className="w-full">
      <p className="text-xs font-semibold uppercase leading-none tracking-[0.08em] text-[#9CA3AF]">
        Scanning
      </p>
      <h2 className="mt-2 text-[22px] font-medium leading-[1.15] tracking-[-0.02em] text-[#0A0A0A]">
        {allDone ? 'Scan complete.' : 'Asking AI search about you…'}
      </h2>
      <p className="mt-2 break-all font-mono text-[13px] text-[#6B7280]">
        {domain}
      </p>

      {/* Progress bar — 3px blue. */}
      <div className="mt-6 h-[3px] w-full overflow-hidden rounded-full bg-[#EFF1F5]">
        <div
          className="h-full rounded-full bg-[#3370FF] transition-[width] duration-300 ease-out motion-reduce:transition-none"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Scan progress"
        />
      </div>

      {/* Engine checklist. */}
      <ul className="mt-6 space-y-px" aria-live="polite">
        {engines.map((engine) => {
          const meta = ENGINE_META[engine.id]
          const active = engine.status === 'querying'
          return (
            <li
              key={engine.id}
              className={[
                'flex items-center gap-3 rounded-xl px-3 py-3 transition-colors duration-200 motion-reduce:transition-none',
                active ? 'bg-[#F7F9FF]' : 'bg-transparent',
              ].join(' ')}
            >
              <StatusGlyph status={engine.status} />

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium text-[#0A0A0A]">
                    {meta?.name}
                  </span>
                  <span
                    className={[
                      'shrink-0 font-mono text-xs tabular-nums',
                      engine.status === 'done'
                        ? 'text-[#10B981]'
                        : active
                          ? 'text-[#3370FF]'
                          : 'text-[#9CA3AF]',
                    ].join(' ')}
                  >
                    {engine.ticks}/{engine.total}
                  </span>
                </div>
                <p className="mt-0.5 truncate font-mono text-[11px] leading-relaxed text-[#9CA3AF]">
                  {engine.status === 'queued'
                    ? STATUS_LABEL.queued
                    : engine.status === 'done'
                      ? `${STATUS_LABEL.done} — ${engine.total} queries`
                      : `"${meta?.sampleQuery}"`}
                </p>
              </div>
            </li>
          )
        })}
      </ul>

      <p className="mt-6 text-center text-xs text-[#9CA3AF]">
        {allDone
          ? 'Compiling your score…'
          : 'Running real prompts the way your customers would.'}
      </p>
    </div>
  )
}
