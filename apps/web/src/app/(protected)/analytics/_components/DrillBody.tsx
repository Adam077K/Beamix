'use client'

import { Sparkles } from 'lucide-react'
import { DrillSubRow } from '@/components/console/AnalyticsDrillDrawer'
import type { AnalyticsDrillData } from '@/lib/demo/surfaces/types'

/**
 * DrillBody — the contents of the AnalyticsDrillDrawer for a topic × engine cell.
 *
 * Sections: prompts tested · your snippet · competitor snippet · agent note.
 * The agent note is violet-tinted (agent territory) — the one violet beat here.
 */

interface DrillBodyProps {
  data: AnalyticsDrillData | null
  topic: string
  engine: string
}

export function DrillBody({ data, topic, engine }: DrillBodyProps) {
  if (!data) {
    // Graceful fallback when no pre-built drill dataset exists for this pair.
    return (
      <DrillSubRow label={`${engine} × ${topic}`}>
        <p>
          We don&apos;t have a detailed breakdown for this pairing yet. Run a fresh scan to
          capture the prompts and snippets behind this rank.
        </p>
      </DrillSubRow>
    )
  }

  return (
    <>
      <DrillSubRow label="Prompts tested">
        <ul className="space-y-1.5">
          {data.promptsTested.map((p) => (
            <li key={p} className="flex gap-2">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[#9CA3AF]" aria-hidden="true" />
              <span className="font-mono text-[13px] leading-relaxed text-[#374151]">{p}</span>
            </li>
          ))}
        </ul>
      </DrillSubRow>

      <DrillSubRow label="Your snippet">
        <p className="leading-relaxed">{data.ourSnippet}</p>
      </DrillSubRow>

      <DrillSubRow label={`${data.competitorName} · their snippet`}>
        <p className="leading-relaxed text-[#6B7280]">{data.competitorSnippet}</p>
      </DrillSubRow>

      {data.agentNote && (
        <div className="rounded-lg bg-agent-tint px-4 py-3 ring-1 ring-inset ring-[rgba(110,86,240,0.16)]">
          <div className="mb-1.5 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#6E56F0]" aria-hidden="true" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6E56F0]">
              Agent acted here
            </p>
          </div>
          <p className="text-[13px] leading-relaxed text-[#4B3FA8]">{data.agentNote}</p>
        </div>
      )}
    </>
  )
}
