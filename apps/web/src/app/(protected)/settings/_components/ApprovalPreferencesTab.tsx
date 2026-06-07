'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Loader2, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SaveFeedback, type SaveState } from './ProfileTab'

// ── Types ────────────────────────────────────────────────────────────────────

type ApprovalMode = 'auto' | '1-click'

interface AgentClass {
  id: string
  label: string
  description: string
  mode: ApprovalMode
  locked?: boolean
  lockedReason?: string
}

// ── Breathing violet dot (copied from AgentActivityPanel motif) ──────────────

function VioletDot({ pulse = true }: { pulse?: boolean }) {
  return (
    <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
      {pulse && (
        <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-[#6E56F0] opacity-40" />
      )}
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#6E56F0]" />
    </span>
  )
}

// ── Agent approval row ───────────────────────────────────────────────────────

interface AgentRowProps {
  agentClass: AgentClass
  onChange: (id: string, mode: ApprovalMode) => void
}

function AgentApprovalRow({ agentClass, onChange }: AgentRowProps) {
  const isAuto = agentClass.mode === 'auto'
  const isLocked = agentClass.locked

  return (
    <div
      className={cn(
        'flex items-center gap-4 px-5 py-4',
        isLocked && 'bg-[#EEEAFD]/40',
        !isLocked && 'bg-[#EEEAFD]/20 hover:bg-[#EEEAFD]/40 transition-colors'
      )}
    >
      <VioletDot pulse={!isLocked} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-[#0A0A0A]">{agentClass.label}</span>
          {isLocked && (
            <span
              className="inline-flex items-center gap-1 rounded-md bg-[#EEEAFD] px-2 py-0.5 text-[12px] font-medium text-[#6E56F0]"
              aria-label="Beamix reviews this with you"
            >
              <Lock className="h-3 w-3" />
              Beamix reviews this with you
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[13px] leading-relaxed text-[#6B7280]">
          {agentClass.description}
        </p>
        {isLocked && agentClass.lockedReason && (
          <p className="mt-1 text-[12px] italic text-[#9CA3AF]">{agentClass.lockedReason}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {!isLocked ? (
          <>
            <span
              className={cn(
                'text-[13px] transition-colors',
                isAuto ? 'font-medium text-[#0A0A0A]' : 'text-[#9CA3AF]'
              )}
            >
              Auto
            </span>
            <Switch
              checked={!isAuto}
              onCheckedChange={(checked) =>
                onChange(agentClass.id, checked ? '1-click' : 'auto')
              }
              aria-label={`${agentClass.label} approval mode: ${agentClass.mode}`}
              // Violet checked state — agent surface
              className="data-[state=checked]:bg-[#6E56F0]"
            />
            <span
              className={cn(
                'text-[13px] transition-colors',
                !isAuto ? 'font-medium text-[#0A0A0A]' : 'text-[#9CA3AF]'
              )}
            >
              1-click
            </span>
          </>
        ) : (
          <span className="text-[13px] font-medium text-[#6E56F0]">Always reviewed</span>
        )}
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

const INITIAL_CLASSES: AgentClass[] = [
  {
    id: 'content',
    label: 'Content',
    description: 'Blog posts, FAQ entries, and service descriptions generated or updated by your agents.',
    mode: '1-click',
  },
  {
    id: 'email',
    label: 'Email & outreach',
    description: 'Follow-up sequences, review requests, and client nurture emails drafted by the outreach agent.',
    mode: '1-click',
  },
  {
    id: 'schema',
    label: 'Schema & structured data',
    description: 'JSON-LD markup, business hours, and FAQ schema updates that affect your Knowledge Panel.',
    mode: 'auto',
  },
  {
    id: 'social',
    label: 'Social & listings',
    description: 'Posts drafted for Google Business Profile, Yelp, and Apple Maps by the local presence agent.',
    mode: 'auto',
  },
  {
    id: 'ymyl',
    label: 'Health, legal & financial claims',
    description: 'Any content that makes direct health, legal, or financial claims on your behalf.',
    mode: '1-click',
    locked: true,
    lockedReason: 'Health, legal, and financial claims always get a human approval — yours.',
  },
]

export function ApprovalPreferencesTab() {
  const [classes, setClasses] = useState<AgentClass[]>(INITIAL_CLASSES)
  const [saveState, setSaveState] = useState<SaveState>('idle')

  function handleChange(id: string, mode: ApprovalMode) {
    setClasses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, mode } : c))
    )
  }

  async function handleSave() {
    setSaveState('saving')
    await new Promise((r) => setTimeout(r, 900))
    setSaveState('success')
    setTimeout(() => setSaveState('idle'), 3000)
  }

  return (
    <div className="card-console overflow-hidden">
      <div className="px-5 pt-6 pb-1">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Approval preferences
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-[#6B7280]">
          Control which agent actions go live automatically and which wait for your one-click sign-off.
          <span className="ml-1 font-medium text-[#6E56F0]">Auto</span> means your crew publishes without interrupting you.
          <span className="ml-1 font-medium text-[#0A0A0A]">1-click</span> sends it to your inbox first.
        </p>
      </div>

      {/* Violet identity zone */}
      <div className="mt-4 divide-y divide-[#EEEAFD]/60 border-t border-[#EEEAFD]">
        {classes.map((agentClass) => (
          <AgentApprovalRow
            key={agentClass.id}
            agentClass={agentClass}
            onChange={handleChange}
          />
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-[#F3F4F6] px-5 py-4">
        <div className="flex items-center gap-2 text-[13px] text-[#6E56F0]">
          <VioletDot pulse={false} />
          <span>Your crew keeps working while you review</span>
        </div>
        <div className="flex items-center gap-4">
          <SaveFeedback state={saveState} />
          <Button onClick={handleSave} disabled={saveState === 'saving'} className="min-w-[144px]">
            {saveState === 'saving' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              'Save preferences'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
