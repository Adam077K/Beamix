'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X, Fingerprint } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionCard, FieldRow, SaveBar, type SaveState } from './ProfileTab'

// ── Geist Mono Chip / tag input ──────────────────────────────────────────────

interface ChipInputProps {
  id: string
  label: string
  helper?: string
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  maxItems?: number
  /** When true, chips render in accent-tint (blue) — default */
  variant?: 'blue' | 'default'
}

function ChipInput({
  id,
  label,
  helper,
  values,
  onChange,
  placeholder,
  maxItems = 20,
  variant = 'blue',
}: ChipInputProps) {
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function addChip(value: string) {
    const trimmed = value.trim()
    if (!trimmed || values.includes(trimmed) || values.length >= maxItems) return
    onChange([...values, trimmed])
    setDraft('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addChip(draft)
    }
    if (e.key === 'Backspace' && !draft && values.length > 0) {
      onChange(values.slice(0, -1))
    }
  }

  function removeChip(chip: string) {
    onChange(values.filter((v) => v !== chip))
  }

  return (
    <div>
      <Label
        htmlFor={id}
        className="mb-1.5 block text-[13px] font-medium text-[var(--color-text-secondary)]"
      >
        {label}
      </Label>
      {helper && (
        <p className="mb-2 text-[12px] leading-relaxed text-[var(--color-text-muted)]">{helper}</p>
      )}
      <div
        className={cn(
          'flex min-h-[42px] flex-wrap gap-1.5 rounded-lg border border-[var(--color-border)] bg-white p-2',
          'cursor-text transition-colors',
          'focus-within:border-[var(--color-accent)] focus-within:ring-2 focus-within:ring-[var(--color-accent)] focus-within:ring-offset-0',
        )}
        onClick={() => inputRef.current?.focus()}
        role="group"
        aria-label={`${label} — tag list`}
      >
        {values.map((chip) => (
          <span
            key={chip}
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[12px] font-medium',
              variant === 'blue'
                ? 'bg-[var(--color-accent-tint)] text-[var(--color-accent-deep)]'
                : 'bg-[#F3F4F6] text-[var(--color-text-secondary)]',
            )}
          >
            {chip}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeChip(chip)
              }}
              aria-label={`Remove ${chip}`}
              className={cn(
                'rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]',
                variant === 'blue'
                  ? 'text-[var(--color-accent)] hover:text-[var(--color-accent-deep)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]',
              )}
            >
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addChip(draft)}
          placeholder={values.length === 0 ? placeholder : undefined}
          className="min-w-[120px] flex-1 bg-transparent text-[13px] text-[var(--color-text-primary)] placeholder:text-[#9CA3AF] outline-none"
          aria-label={`Add to ${label}`}
        />
      </div>
      <p className="mt-1 text-[11px] text-[#9CA3AF]">Press Enter or comma to add</p>
    </div>
  )
}

// ── Tone segmented control ───────────────────────────────────────────────────

const TONE_OPTIONS = [
  { value: 'warm', label: 'Warm' },
  { value: 'professional', label: 'Professional' },
  { value: 'bold', label: 'Bold' },
  { value: 'plainspoken', label: 'Plainspoken' },
] as const

type ToneValue = typeof TONE_OPTIONS[number]['value']

function ToneSelector({
  value,
  onChange,
}: {
  value: ToneValue
  onChange: (v: ToneValue) => void
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Brand tone"
      className="flex flex-wrap gap-2"
    >
      {TONE_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'h-9 rounded-lg border px-4 text-[13px] font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1',
            value === opt.value
              ? 'border-[var(--color-accent)] bg-[var(--color-accent-tint)] text-[var(--color-accent-deep)]'
              : 'border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:bg-[#F9FAFB]',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ── Voice preview panel ──────────────────────────────────────────────────────

function VoicePreviewPanel({ brandName, tone, voiceNotes }: {
  brandName: string
  tone: ToneValue
  voiceNotes: string
}) {
  const nameDisplay = brandName || 'Your business'
  const toneDescriptions: Record<ToneValue, string> = {
    warm: 'friendly, approachable, and personal',
    professional: 'precise, confident, and expert',
    bold: 'direct, assertive, and memorable',
    plainspoken: 'clear, honest, and jargon-free',
  }
  const preview = `${nameDisplay} helps clients get ${toneDescriptions[tone]} answers when they need them most. When people search for a trusted local expert, ${nameDisplay} shows up — with the right information, the right way.`

  return (
    <div className="card-console overflow-hidden">
      <div className="flex items-start gap-3 px-5 py-4">
        {/* Violet glyph — justified: previews AGENT output */}
        <Fingerprint
          className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-agent)]"
          aria-hidden="true"
          strokeWidth={1.5}
        />
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
            How the crew will sound
          </p>
          <p className="mt-2 text-[14px] leading-relaxed text-[var(--color-text-secondary)] italic">
            &ldquo;{preview}&rdquo;
          </p>
          {voiceNotes && (
            <p className="mt-2 text-[12px] text-[var(--color-text-muted)]">
              <span className="font-medium text-[var(--color-text-secondary)]">Voice notes applied:</span>{' '}
              {voiceNotes.slice(0, 80)}{voiceNotes.length > 80 ? '…' : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── First-run empty state ────────────────────────────────────────────────────

function BrandFingerprintEmpty({ onStart }: { onStart: () => void }) {
  return (
    <div className="card-console overflow-hidden bg-[var(--color-surface-warm)]">
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        {/* 11×11 circle with accent Fingerprint */}
        <div className="mb-5 flex h-[88px] w-[88px] items-center justify-center rounded-full bg-[var(--color-accent-tint)]">
          <Fingerprint
            className="h-9 w-9 text-[var(--color-accent)]"
            aria-hidden="true"
            strokeWidth={1.5}
          />
        </div>
        <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)]">
          Give the agents your fingerprint
        </h3>
        <p className="mt-2 max-w-[380px] text-[14px] leading-relaxed text-[var(--color-text-muted)]">
          Everything the crew writes — FAQs, service pages, GBP posts — is shaped by what you set here.
          The more you give them, the more it sounds like you.
        </p>
        <Button type="button" className="mt-6" onClick={onStart}>
          Start
        </Button>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface BrandState {
  brandName: string
  description: string
  tone: ToneValue
  voiceNotes: string
  wordsWeUse: string[]
  wordsToAvoid: string[]
  differentiators: string
}

// Default populated stub — realistic data, not "John Doe"
// Wave 2: replace with Supabase brand_settings read
const DEFAULT_BRAND: BrandState = {
  brandName: 'Cohen & Associates Legal',
  description: 'Real estate and business law for Tel Aviv professionals and growing companies.',
  tone: 'professional',
  voiceNotes: 'We explain legal concepts in plain language. We never use jargon unless the client asks for technical depth. Avoid vague reassurances.',
  wordsWeUse: ['expert guidance', 'transparent fees', 'responsive team'],
  wordsToAvoid: ['cheap', 'fast', 'guaranteed results'],
  differentiators: 'We are the only full-service real estate law firm in central Tel Aviv that offers flat-fee contract reviews for startup founders. Unlike large firms, every client gets direct access to a senior partner.',
}

export function BrandFingerprintTab() {
  const [hasData] = useState(true) // Wave 2: set to false until Supabase read resolves
  const [showForm, setShowForm] = useState(hasData)
  const [brand, setBrand] = useState<BrandState>(DEFAULT_BRAND)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [isDirty, setIsDirty] = useState(false)

  // item #10: guard the auto-fade timeout with a ref to clearTimeout on unmount
  const fadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    return () => {
      if (fadTimerRef.current) clearTimeout(fadTimerRef.current)
    }
  }, [])

  function update<K extends keyof BrandState>(key: K, value: BrandState[K]) {
    setBrand((b) => ({ ...b, [key]: value }))
    setIsDirty(true)
    if (saveState === 'saved' || saveState === 'error') setSaveState('idle')
  }

  async function handleSave() {
    setSaveState('saving')
    // Wave 2: wire to Supabase brand_settings upsert
    await new Promise((r) => setTimeout(r, 900))
    setSaveState('saved')
    setIsDirty(false)
    // item #10: store timer id so it can be cleared on unmount
    if (fadTimerRef.current) clearTimeout(fadTimerRef.current)
    fadTimerRef.current = setTimeout(() => setSaveState('idle'), 2500)
  }

  function handleDiscard() {
    setBrand(DEFAULT_BRAND)
    setIsDirty(false)
    setSaveState('idle')
  }

  if (!showForm) {
    return <BrandFingerprintEmpty onStart={() => setShowForm(true)} />
  }

  return (
    <div className="space-y-6">
      {/* ── Voice & tone ── */}
      <SectionCard
        eyebrow="Brand fingerprint"
        heading="Voice and tone"
        helper="How you want your brand to sound in everything the crew creates."
        className="bg-[var(--color-surface-warm)]"
        footer={
          <SaveBar
            state={saveState}
            isDirty={isDirty}
            onSave={handleSave}
            onDiscard={handleDiscard}
            saveLabel="Save fingerprint"
          />
        }
      >
        {/* item #14: raw <input> replaced with project ui/Input component */}
        <FieldRow label="Brand name" htmlFor="brand-name">
          <Input
            id="brand-name"
            type="text"
            value={brand.brandName}
            onChange={(e) => update('brandName', e.target.value)}
            placeholder="Your business name"
            autoComplete="organization"
          />
        </FieldRow>

        <FieldRow
          label="One-line description"
          helper="Used as the opening sentence in AI-generated about sections."
          htmlFor="brand-description"
        >
          <Input
            id="brand-description"
            type="text"
            value={brand.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="What you do and who you serve."
          />
        </FieldRow>

        <FieldRow label="Tone" helper="Pick the primary register — one voice, consistent.">
          <ToneSelector value={brand.tone} onChange={(v) => update('tone', v)} />
        </FieldRow>

        <FieldRow
          label="Voice notes"
          helper="Anything specific about how you write or speak. The crew follows these literally."
          htmlFor="brand-voice-notes"
        >
          <textarea
            id="brand-voice-notes"
            rows={3}
            value={brand.voiceNotes}
            onChange={(e) => update('voiceNotes', e.target.value)}
            placeholder="e.g. Use short sentences. No buzzwords. Avoid 'leverage' and 'synergy'…"
            className={cn(
              'w-full resize-none rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-[14px] text-[var(--color-text-primary)] placeholder:text-[#9CA3AF]',
              'transition-colors focus-visible:border-[var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-0',
            )}
          />
        </FieldRow>
      </SectionCard>

      {/* ── Vocabulary ── */}
      <SectionCard
        eyebrow="Vocabulary"
        heading="Words to use and avoid"
        helper="The crew learns from both lists. Be specific — single words or short phrases work best."
      >
        <div className="px-5 py-4 space-y-6">
          <ChipInput
            id="brand-use"
            label="Words we use"
            helper="Phrases that should appear naturally in your content."
            values={brand.wordsWeUse}
            onChange={(v) => update('wordsWeUse', v)}
            placeholder="Add a word or phrase…"
            variant="blue"
          />
          <ChipInput
            id="brand-avoid"
            label="Words to avoid"
            helper="Terms, jargon, or phrases the crew should never write."
            values={brand.wordsToAvoid}
            onChange={(v) => update('wordsToAvoid', v)}
            placeholder="Add a word or phrase…"
            variant="default"
          />
        </div>
      </SectionCard>

      {/* ── Proof & differentiators ── */}
      <SectionCard
        eyebrow="Differentiation"
        heading="Proof and differentiators"
        helper="What makes you the right choice? The crew cites this when writing comparison content."
      >
        <FieldRow
          label="Your edge"
          helper="Be concrete — specific claims outperform vague ones."
          htmlFor="brand-diff"
        >
          <textarea
            id="brand-diff"
            rows={4}
            value={brand.differentiators}
            onChange={(e) => update('differentiators', e.target.value)}
            placeholder="e.g. Only firm in the city offering flat-fee startup contracts. Rated #1 on Google for 3 years…"
            className={cn(
              'w-full resize-none rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-[14px] text-[var(--color-text-primary)] placeholder:text-[#9CA3AF]',
              'transition-colors focus-visible:border-[var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-0',
            )}
          />
        </FieldRow>
      </SectionCard>

      {/* ── Voice preview (read-only) ── */}
      <VoicePreviewPanel
        brandName={brand.brandName}
        tone={brand.tone}
        voiceNotes={brand.voiceNotes}
      />
    </div>
  )
}
