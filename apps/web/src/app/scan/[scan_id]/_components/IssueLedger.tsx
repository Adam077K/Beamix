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
  { text: string; bg: string; label: string }
> = {
  critical: {
    text: 'text-[var(--color-status-critical)]',
    bg: 'bg-[var(--color-status-critical-bg)]',
    label: 'Critical',
  },
  warning: {
    text: 'text-[var(--color-status-warning)]',
    bg: 'bg-[var(--color-status-warning-bg)]',
    label: 'Important',
  },
  neutral: {
    text: 'text-[var(--color-status-neutral)]',
    bg: 'bg-[var(--color-status-neutral-bg)]',
    label: 'Minor',
  },
  positive: {
    text: 'text-[var(--color-status-positive)]',
    bg: 'bg-[var(--color-status-positive-bg)]',
    label: 'OK',
  },
}

export function IssueLedger({ issues, totalIssues }: IssueLedgerProps) {
  return (
    <div className="card-console overflow-hidden">
      {/* Eyebrow header */}
      <div className="flex items-baseline justify-between border-b border-[var(--color-border)] px-6 py-3">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-disabled)]">
          What we found
        </p>
        <span className="font-mono text-[12px] text-[var(--color-text-muted)]">
          {totalIssues} issue{totalIssues !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Issue rows */}
      <div className="divide-y divide-[var(--color-border)]">
        {issues.map((issue) => {
          const severity = severityForCount(issue.count)
          const styles = SEVERITY_STYLES[severity]
          return (
            <div
              key={issue.category}
              className="flex items-center justify-between gap-4 px-6 py-4"
            >
              <span className="text-[15px] font-medium text-[var(--color-text-primary)]">
                {issue.category}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                {/* Count badge */}
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[12px] font-semibold ${styles.bg} ${styles.text}`}
                >
                  {issue.count > 0 ? issue.count : styles.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {issues.length === 0 && (
        <div className="px-6 py-8 text-center">
          <p className="text-[15px] text-[var(--color-text-muted)]">
            No specific issues detected in this scan.
          </p>
        </div>
      )}
    </div>
  )
}
