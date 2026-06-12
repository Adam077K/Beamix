'use client'

import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import type { AgencyLead } from '@/lib/demo/surfaces/types'

// The three real funnel stages — this is the ONE justified multi-column layout.
const COLUMNS: { stage: AgencyLead['stage']; label: string; rail: string }[] = [
  { stage: 'audit', label: 'Audited', rail: 'var(--color-status-neutral)' },
  { stage: 'pitch', label: 'Pitched', rail: 'var(--color-status-info)' },
  { stage: 'client', label: 'Won', rail: 'var(--color-status-positive)' },
]

// Deterministic demo enrichment keyed by prospect name so cards read real.
const leadMeta: Record<string, { score: number; age: string }> = {
  'Golden Dental Tel Aviv': { score: 31, age: '4h' },
  'HaifaSmile Clinic': { score: 47, age: '1d' },
  'Rehovot Family Dental': { score: 52, age: '6d' },
}

function scoreColor(score: number): string {
  if (score >= 75) return 'var(--color-data-3)'
  if (score >= 50) return 'var(--color-data-4)'
  if (score >= 25) return 'var(--color-data-5)'
  return 'var(--color-data-6)'
}

interface LeadsTabProps {
  leads: AgencyLead[]
  onGenerate: () => void
}

/**
 * LeadsTab — the audit → pitch → won pipeline. A calm 3-column board; the ONE
 * allowed multi-column layout in this surface, justified by real funnel stages
 * (not decorative). Moving a lead to "Won" promotes it into Clients.
 */
export function LeadsTab({ leads, onGenerate }: LeadsTabProps) {
  if (leads.length === 0) {
    return (
      <EmptyState
        illustration="workspace"
        title="No leads in the pipeline"
        description="Every prospect audit you generate enters here as a lead. Move them from audited to pitched to won."
        action={
          <Button variant="default" size="default" onClick={onGenerate}>
            Generate audit
          </Button>
        }
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {COLUMNS.map((col) => {
        const colLeads = leads.filter((l) => l.stage === col.stage)
        return (
          <section key={col.stage} className="flex flex-col gap-3">
            <header className="flex items-center justify-between px-1">
              <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
                {col.label}
              </span>
              <span className="font-[var(--font-mono)] text-[12px] tabular-nums text-[#9CA3AF]">
                {colLeads.length}
              </span>
            </header>

            <div className="flex flex-col gap-3">
              {colLeads.length === 0 ? (
                <div className="rounded-[var(--radius-card)] border border-dashed border-[#E5E7EB] px-3 py-6 text-center text-[12px] text-[#9CA3AF]">
                  Nothing here yet
                </div>
              ) : (
                colLeads.map((lead) => {
                  const meta = leadMeta[lead.prospect] ?? { score: 0, age: '—' }
                  return (
                    <article
                      key={lead.prospect}
                      className="card-console p-3.5"
                      style={{ boxShadow: `inset 3px 0 0 0 ${col.rail}` }}
                    >
                      <p className="text-[14px] font-medium text-[#0A0A0A]">{lead.prospect}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-[var(--font-mono)] text-[12px] font-medium tabular-nums"
                          style={{
                            backgroundColor: 'var(--color-surface-warm)',
                            color: scoreColor(meta.score),
                          }}
                        >
                          {meta.score}
                          <span className="text-[#9CA3AF]">/100</span>
                        </span>
                        <span className="font-[var(--font-mono)] text-[12px] tabular-nums text-[#9CA3AF]">
                          {meta.age} old
                        </span>
                      </div>
                    </article>
                  )
                })
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
