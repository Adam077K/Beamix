'use client'

import { useState, useRef, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { Lock, ShieldCheck, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionCard, SaveBar, type SaveState } from './ProfileTab'

// ── Types ────────────────────────────────────────────────────────────────────

type ApprovalMode = 'auto' | '1-click'

interface AgentClass {
  id: string
  label: string
  description: string
  consequence: string
  mode: ApprovalMode
  canAutomate: boolean
  locked?: boolean
  lockedReason?: string
}

// ── Breathing violet dot ─────────────────────────────────────────────────────

function VioletDot({ pulse = true }: { pulse?: boolean }) {
  return (
    <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
      {pulse && (
        <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-agent)] opacity-40 motion-safe:animate-ping" />
      )}
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-agent)]" />
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
  const canAutomate = agentClass.canAutomate

  return (
    <div
      className={cn(
        'flex items-start gap-4 px-5 py-4 transition-colors',
        isLocked
          ? 'bg-[var(--color-agent-tint)] opacity-80'
          : 'hover:bg-[#FAFAF9]',
      )}
    >
      {/* Violet dot / Sparkles glyph */}
      <div className="mt-1">
        {isLocked ? (
          <Sparkles
            className="h-4 w-4 text-[var(--color-agent)]"
            aria-hidden="true"
            strokeWidth={1.5}
          />
        ) : (
          <VioletDot pulse={!isLocked} />
        )}
      </div>

      {/* Label + description + consequence */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[14px] font-semibold text-[var(--color-text-primary)]">
            {agentClass.label}
          </span>
          {isLocked && (
            <span
              className="inline-flex items-center gap-1 rounded-md bg-[var(--color-agent-tint)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-agent)]"
              aria-label="Always requires your approval"
            >
              <Lock className="h-3 w-3" aria-hidden="true" />
              Always reviewed
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[13px] leading-relaxed text-[var(--color-text-muted)]">
          {agentClass.description}
        </p>
        {/* Consequence caption */}
        <p className="mt-1 text-[12px] italic text-[#9CA3AF]">
          {isLocked ? agentClass.lockedReason : agentClass.consequence}
        </p>
      </div>

      {/* Toggle control */}
      <div className="mt-0.5 flex shrink-0 items-center gap-2.5">
        {isLocked ? (
          <>
            {/* Static locked switch */}
            <span className="text-[13px] text-[#9CA3AF]">Auto</span>
            <Switch
              checked={false}
              disabled
              aria-label={`${agentClass.label}: auto-publish disabled — always reviewed`}
              className="opacity-40"
            />
            <span className="text-[13px] font-medium text-[var(--color-agent)]">1-click</span>
          </>
        ) : !canAutomate ? (
          /* Can't fully automate — Auto disabled with tooltip */
          <>
            <span
              title="This class can't be auto-published — requires at least 1-click approval"
              className="cursor-not-allowed text-[13px] text-[#9CA3AF]"
            >
              Auto
            </span>
            <Switch
              checked={!isAuto}
              disabled
              aria-label={`${agentClass.label}: auto-publish not available for this class`}
              className="opacity-40"
            />
            <span
              className={cn(
                'text-[13px]',
                !isAuto ? 'font-medium text-[var(--color-text-primary)]' : 'text-[#9CA3AF]',
              )}
            >
              1-click
            </span>
          </>
        ) : (
          /* Full toggle */
          <>
            <span
              className={cn(
                'text-[13px] transition-colors',
                isAuto ? 'font-medium text-[var(--color-text-primary)]' : 'text-[#9CA3AF]',
              )}
            >
              Auto
            </span>
            <Switch
              checked={!isAuto}
              onCheckedChange={(checked) =>
                onChange(agentClass.id, checked ? '1-click' : 'auto')
              }
              aria-label={`${agentClass.label}: ${agentClass.mode === 'auto' ? 'currently auto-publish' : 'currently requires 1-click approval'}`}
              // Violet on-state — agent surface, NOT a button
              className="data-[state=checked]:bg-[var(--color-agent)]"
            />
            <span
              className={cn(
                'text-[13px] transition-colors',
                !isAuto ? 'font-medium text-[var(--color-text-primary)]' : 'text-[#9CA3AF]',
              )}
            >
              1-click
            </span>
          </>
        )}
      </div>
    </div>
  )
}

// ── Stub data ────────────────────────────────────────────────────────────────
// Wave 2: wire to Supabase approval_preferences read

const INITIAL_CLASSES: AgentClass[] = [
  {
    id: 'faq',
    label: 'FAQ blocks',
    description: 'Frequently asked question entries generated or updated by the FAQ agent.',
    consequence: 'Auto: publishes within minutes of agent run. 1-click: lands in your approval inbox.',
    mode: '1-click',
    canAutomate: true,
  },
  {
    id: 'service-pages',
    label: 'Service-page copy',
    description: 'New or edited copy for your services, features, and about-us sections.',
    consequence: 'Auto: replaces existing copy without interrupting you. 1-click: you preview first.',
    mode: '1-click',
    canAutomate: true,
  },
  {
    id: 'gbp',
    label: 'GBP posts',
    description: 'Google Business Profile updates: posts, hours, attributes, and Q&A.',
    consequence: 'Auto: keeps your listing fresh daily. 1-click: review before publishing.',
    mode: 'auto',
    canAutomate: true,
  },
  {
    id: 'meta',
    label: 'Meta descriptions',
    description: 'Title tags and meta descriptions for your web pages.',
    consequence: 'Auto: SEO changes apply immediately. 1-click: confirm before deployment.',
    mode: 'auto',
    canAutomate: true,
  },
  {
    id: 'schema',
    label: 'Schema / structured data',
    description: 'JSON-LD markup updates that affect your Knowledge Panel.',
    consequence: 'Applied via your CMS. 1-click approval required — schema errors are hard to undo.',
    mode: '1-click',
    canAutomate: false,
  },
  {
    id: 'ymyl',
    label: 'Health, legal & financial claims',
    description: 'Any content making direct health, legal, or financial claims on your behalf.',
    consequence: '',
    mode: '1-click',
    canAutomate: false,
    locked: true,
    lockedReason: 'Legal, health, and financial content always needs your sign-off — for your protection and your customers\'.',
  },
]

// ── Main component ────────────────────────────────────────────────────────────

export function ApprovalPreferencesTab() {
  const [classes, setClasses] = useState<AgentClass[]>(INITIAL_CLASSES)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [isDirty, setIsDirty] = useState(false)

  // item #10: guard the auto-fade timeout with a ref
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    }
  }, [])

  function handleChange(id: string, mode: ApprovalMode) {
    setClasses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, mode } : c)),
    )
    setIsDirty(true)
    if (saveState === 'saved' || saveState === 'error') setSaveState('idle')
  }

  async function handleSave() {
    setSaveState('saving')
    // Wave 2: wire to Supabase approval_preferences upsert
    await new Promise((r) => setTimeout(r, 900))
    setSaveState('saved')
    setIsDirty(false)
    // item #10: store timer id so it can be cleared on unmount
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    fadeTimerRef.current = setTimeout(() => setSaveState('idle'), 2500)
  }

  function handleDiscard() {
    setClasses(INITIAL_CLASSES)
    setIsDirty(false)
    setSaveState('idle')
  }

  const adjustableClasses = classes.filter((c) => !c.locked)
  const lockedClasses = classes.filter((c) => c.locked)

  return (
    <div className="space-y-6">
      {/* ── Adjustable classes ── */}
      <SectionCard
        eyebrow="Approval preferences"
        heading="Automation controls"
        helper="Decide how much the crew does on its own. Move work between automatic and your one-click approval — within safe bounds."
        footer={
          <SaveBar
            state={saveState}
            isDirty={isDirty}
            onSave={handleSave}
            onDiscard={handleDiscard}
            saveLabel="Save preferences"
          />
        }
      >
        <div className="divide-y divide-[#EEEAFD]/60">
          {adjustableClasses.map((agentClass) => (
            <AgentApprovalRow
              key={agentClass.id}
              agentClass={agentClass}
              onChange={handleChange}
            />
          ))}
        </div>
      </SectionCard>

      {/* ── YMYL Guardrail lockbox ── */}
      <div className="card-console overflow-hidden bg-[var(--color-surface-warm)]">
        <div className="flex items-start gap-3 px-5 py-4 border-b border-[#EEEAFD]">
          <ShieldCheck
            className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-agent)]"
            aria-hidden="true"
            strokeWidth={1.5}
          />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">
              Always requires your approval
            </p>
            <p className="mt-0.5 text-[13px] leading-relaxed text-[var(--color-text-muted)]">
              Legal, health, and financial content (YMYL) is never auto-published — for your protection and your customers&apos; trust.
            </p>
          </div>
        </div>
        <div className="divide-y divide-[#EEEAFD]/60">
          {lockedClasses.map((agentClass) => (
            <AgentApprovalRow
              key={agentClass.id}
              agentClass={agentClass}
              onChange={() => {}}
            />
          ))}
        </div>
        {/* Footer — crew context, no save bar */}
        <div className="flex items-center gap-2 border-t border-[#EEEAFD] px-5 py-3">
          <VioletDot pulse={false} />
          <p className="text-[13px] text-[var(--color-agent)]">
            Your crew keeps working while you review
          </p>
        </div>
      </div>
    </div>
  )
}
