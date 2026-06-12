/**
 * IssueLedger — dense bordered ledger of issues/opportunities found.
 *
 * Each row: issue name left + severity badge right (tinted ground + saturated
 * text, using status token vars). Divider between rows. "What we found" eyebrow.
 *
 * Status mapping by count:
 *   count >= 3  → critical
 *   count == 2  → warning
 *   count == 1  → neutral (informational)
 *   count == 0  → positive (nothing broken here)
 *
 * This is a read-only display — no interactivity. Designed to communicate
 * evidence density before the CTA, not to overwhelm.
 */

interface IssueRow {
  category: string
  count: number
}

interface IssueLedgerProps {
  issues: IssueRow[]
  totalIssues: number
}

type SeverityLevel = 'critical' | 'warning' | 'neutral' | 'positive'

function severityForCount(count: number): SeverityLevel {
  if (count >= 3) return 'critical'
  if (count === 2) return 'warning'
  if (count === 1) return 'neutral'
  return 'positive'
}

const SEVERITY_STYLES: Record<
  SeverityLevel,
  { text: string; bg: string; bar: string; label: string }
> = {
  critical: {
    text: 'text-[var(--color-status-critical)]',
    bg: 'bg-[var(--color-status-critical-bg)]',
    bar: 'var(--color-status-critical)',
    label: 'Critical',
  },
  warning: {
    text: 'text-[var(--color-status-warning)]',
    bg: 'bg-[var(--color-status-warning-bg)]',
    bar: 'var(--color-status-warning)',
    label: 'Important',
  },
  neutral: {
    text: 'text-[var(--color-status-neutral)]',
    bg: 'bg-[var(--color-status-neutral-bg)]',
    bar: 'var(--color-status-neutral)',
    label: 'Minor',
  },
  positive: {
    text: 'text-[var(--color-status-positive)]',
    bg: 'bg-[var(--color-status-positive-bg)]',
    bar: 'var(--color-status-positive)',
    label: 'OK',
  },
}

const SEVERITY_NOUN: Record<SeverityLevel, string> = {
  critical: 'fixes needed',
  warning: 'to improve',
  neutral: 'to review',
  positive: 'looks good',
}

export function IssueLedger({ issues, totalIssues }: IssueLedgerProps) {
  return (
    <div className="card-console overflow-hidden">
      {/* Eyebrow header */}
      <div className="flex items-baseline justify-between border-b border-[var(--color-border)] px-6 py-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-disabled)]">
          What we found
        </p>
        <span className="font-mono text-[12px] text-[var(--color-text-muted)] tabular-nums">
          {totalIssues} issue{totalIssues !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Issue rows */}
      <ul className="divide-y divide-[var(--color-border)]">
        {issues.map((issue) => {
          const severity = severityForCount(issue.count)
          const styles = SEVERITY_STYLES[severity]
          return (
            <li
              key={issue.category}
              className="group relative flex items-center justify-between gap-4 px-6 py-4 transition-colors duration-150 hover:bg-[#F4F6FA]"
            >
              {/* Left severity hairline (M7) */}
              <span
                aria-hidden="true"
                className="absolute inset-y-3 left-0 w-[2px] rounded-full"
                style={{ backgroundColor: styles.bar }}
              />

              <div className="min-w-0">
                <span className="block text-[15px] font-medium text-[var(--color-text-primary)]">
                  {issue.category}
                </span>
                <span
                  className={`mt-0.5 block text-[12px] font-medium ${styles.text}`}
                >
                  {styles.label}
                </span>
              </div>

              {/* Dominant mono count (M7) */}
              <div className="flex shrink-0 items-baseline gap-1.5">
                <span
                  className="font-mono text-[24px] font-medium leading-none tabular-nums"
                  style={{ color: styles.bar }}
                >
                  {issue.count}
                </span>
                <span className="text-[11px] font-medium text-[var(--color-text-muted)]">
                  {SEVERITY_NOUN[severity]}
                </span>
              </div>
            </li>
          )
        })}
      </ul>

      {issues.length === 0 && (
        <div className="px-6 py-10 text-center">
          <div
            aria-hidden="true"
            className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full"
            style={{
              color: 'var(--color-status-positive)',
              backgroundColor: 'var(--color-status-positive-bg)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M4 10.5L8 14.5L16 5.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-[15px] font-medium text-[var(--color-text-primary)]">
            Nothing broken in this scan.
          </p>
          <p className="mx-auto mt-1 max-w-[320px] text-[13px] leading-[1.5] text-[var(--color-text-muted)]">
            The fundamentals look healthy. We&apos;ll make sure it stays that
            way as AI engines change.
          </p>
        </div>
      )}
    </div>
  )
}
