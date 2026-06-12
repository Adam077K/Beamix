'use client'

import { useState } from 'react'
import { Check, Copy, Download, Globe, AlertTriangle, Info } from 'lucide-react'
import { SerifVerdict } from '@/components/console/SerifVerdict'
import { EngineMicroSparkline } from '@/components/dashboard/EngineMicroSparkline'
import { AgentRoute } from './AgentRoute'
import type { ProspectAudit, AuditFinding, WhiteLabelConfig } from '@/lib/demo/surfaces/types'

// ---------------------------------------------------------------------------
// Score band — matches the dashboard 4-tier system
// ---------------------------------------------------------------------------

function band(score: number): { word: string; color: string } {
  if (score >= 75) return { word: 'Excellent', color: 'var(--color-data-3)' }
  if (score >= 50) return { word: 'Good', color: 'var(--color-data-4)' }
  if (score >= 25) return { word: 'Fair', color: 'var(--color-data-5)' }
  return { word: 'Critical', color: 'var(--color-data-6)' }
}

// Per-engine demo breakdown — weighted asymmetry (lowest engine gets focus).
// Derived deterministically around the overall score so the story stays coherent.
function engineBreakdown(overall: number) {
  return [
    { engine: 'ChatGPT', score: Math.max(0, overall - 22), points: [12, 10, 9, 11, 9] },
    { engine: 'Gemini', score: overall, points: [28, 31, 30, 33, 31] },
    { engine: 'Perplexity', score: Math.min(100, overall + 16), points: [40, 44, 46, 45, 47] },
  ].sort((a, b) => a.score - b.score)
}

const severityMeta: Record<
  AuditFinding['severity'],
  { Icon: typeof AlertTriangle; ring: string; text: string; bg: string; label: string }
> = {
  critical: {
    Icon: AlertTriangle,
    ring: 'rgba(220,38,38,0.25)',
    text: 'var(--color-status-critical)',
    bg: 'var(--color-status-critical-bg)',
    label: 'Critical',
  },
  warning: {
    Icon: AlertTriangle,
    ring: 'rgba(184,119,11,0.25)',
    text: 'var(--color-status-warning)',
    bg: 'var(--color-status-warning-bg)',
    label: 'Warning',
  },
  info: {
    Icon: Info,
    ring: 'rgba(107,114,128,0.25)',
    text: 'var(--color-status-neutral)',
    bg: 'var(--color-status-neutral-bg)',
    label: 'Note',
  },
}

interface AuditReportProps {
  audit: ProspectAudit
  /** Active client white-label config — the audit cover is branded live. */
  whiteLabel?: WhiteLabelConfig | null
  onShare: () => void
  onRerun: () => void
}

/**
 * AuditReport — Zone 5 output. The shareable, white-labeled audit card.
 *
 * Depth staging inside the TIER-1 hero container provided by ToolPage:
 *   - Cover: branded header + the ONE TIER-1 figure (64px Geist Mono score)
 *     + the ONE Fraunces beat (band word, inline in the verdict sentence).
 *   - Engine breakdown: weighted 2-up (lowest engine = wider focus card with
 *     sparkline, the rest are receding TIER-3 insets). NEVER an N-equal grid.
 *   - Findings: severity-tinted rows, hairline dividers, no per-row boxes.
 *   - Footer: blue "Copy share link" (you) + quiet "Download PDF".
 */
export function AuditReport({ audit, whiteLabel, onShare, onRerun }: AuditReportProps) {
  const [copied, setCopied] = useState(false)
  const { word, color } = band(audit.score)
  const engines = engineBreakdown(audit.score)
  const [focusEngine, ...restEngines] = engines

  const accent = whiteLabel?.accent ?? '#3370FF'
  const brandDomain = whiteLabel?.customDomain ?? 'beamix.audit'

  const handleCopy = () => {
    setCopied(true)
    onShare()
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <article>
      {/* ── Cover ── branded header with white-label preview */}
      <header
        className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFF0F2] px-6 py-4 sm:px-8"
        style={{ backgroundColor: 'var(--color-surface-warm)' }}
      >
        <div className="flex items-center gap-2.5">
          {/* White-label logo slot (live preview) */}
          <span
            className="flex h-7 w-7 items-center justify-center rounded-md text-[12px] font-semibold text-white"
            style={{ backgroundColor: accent }}
            aria-hidden="true"
          >
            {(whiteLabel?.clientId ?? 'BX').slice(0, 1).toUpperCase()}
          </span>
          <div className="leading-tight">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
              GEO Audit
            </p>
            <p className="font-[var(--font-mono)] text-[13px] tabular-nums text-[#374151]">
              {brandDomain}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF2FF] px-2.5 py-1 text-[12px] font-medium text-[#3370FF]">
          <Globe className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
          {audit.prospectDomain}
        </span>
      </header>

      {/* ── Hero figure + verdict ── the one TIER-1 focal + one Fraunces beat */}
      <div className="px-6 pb-6 pt-7 sm:px-8">
        <div className="flex items-start gap-6">
          <div className="shrink-0">
            <span
              className="block font-[var(--font-mono)] text-[64px] font-medium leading-none tracking-[-0.03em] tabular-nums"
              style={{ color }}
            >
              {audit.score}
            </span>
            <span className="mt-1 block text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
              GEO visibility · /100
            </span>
          </div>

          <p className="max-w-[520px] pt-1 text-[18px] leading-snug text-[#0A0A0A]">
            Their AI visibility is <SerifVerdict>{word}</SerifVerdict>.{' '}
            <span className="text-[#6B7280]">{audit.headline}</span>
          </p>
        </div>
      </div>

      {/* ── Per-engine breakdown ── weighted 2-up, not equal cards */}
      <section className="px-6 pb-6 sm:px-8">
        <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          By engine
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.4fr_1fr]">
          {/* Focus card — the weakest engine gets the room */}
          <div className="card-console flex flex-col justify-between p-4">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium text-[#0A0A0A]">{focusEngine.engine}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FDECEC] px-2 py-0.5 text-[11px] font-medium text-[var(--color-status-critical)]">
                Weakest
              </span>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <span className="font-[var(--font-mono)] text-[28px] font-medium leading-none tabular-nums text-[#0A0A0A]">
                {focusEngine.score}
                <span className="text-[14px] text-[#9CA3AF]">/100</span>
              </span>
              <EngineMicroSparkline points={focusEngine.points} currentScore={focusEngine.score} />
            </div>
          </div>

          {/* The remaining engines recede — TIER-3 insets */}
          <div className="flex flex-col gap-3">
            {restEngines.map((e) => (
              <div
                key={e.engine}
                className="card-inset flex items-center justify-between px-4 py-3"
              >
                <span className="text-[13px] text-[#374151]">{e.engine}</span>
                <span className="font-[var(--font-mono)] text-[15px] tabular-nums text-[#0A0A0A]">
                  {e.score}
                  <span className="text-[12px] text-[#9CA3AF]">/100</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Findings ── severity-tinted rows */}
      <section className="px-6 pb-6 sm:px-8">
        <h3 className="mb-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Top gaps
        </h3>
        <ul className="divide-y divide-[#EFF0F2]">
          {audit.findings.map((finding) => {
            const meta = severityMeta[finding.severity]
            const { Icon } = meta
            return (
              <li key={finding.label} className="flex gap-3 py-3.5">
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: meta.bg }}
                  aria-hidden="true"
                >
                  <Icon className="h-3.5 w-3.5" style={{ color: meta.text }} strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] font-medium text-[#0A0A0A]">{finding.label}</span>
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[11px] font-medium"
                      style={{ backgroundColor: meta.bg, color: meta.text }}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-[#6B7280]">
                    {finding.detail}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      {/* ── Footer ── blue share (you) + quiet download + violet re-run (agents) */}
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EFF0F2] px-6 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-lg bg-[#3370FF] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#2454D6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
          >
            {copied ? (
              <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            )}
            {copied ? 'Link copied' : 'Copy share link'}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-[13px] text-[#6B7280] underline-offset-2 transition-colors hover:text-[#0A0A0A] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
          >
            <Download className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            Download PDF
          </button>
        </div>
        <AgentRoute onClick={onRerun} aria-label="Have your crew re-run this audit">
          Re-run audit
        </AgentRoute>
      </footer>
    </article>
  )
}
