'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FieldRow, SectionHeader, SaveFeedback, type SaveState } from './ProfileTab'

// ── Chip / tag input ─────────────────────────────────────────────────────────

interface ChipInputProps {
  id: string
  label: string
  helper?: string
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  maxItems?: number
}

function ChipInput({ id, label, helper, values, onChange, placeholder, maxItems = 20 }: ChipInputProps) {
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
      <Label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-[#0A0A0A]">
        {label}
      </Label>
      {helper && <p className="mb-2 text-[13px] leading-relaxed text-[#6B7280]">{helper}</p>}
      <div
        className={cn(
          'flex min-h-[42px] flex-wrap gap-1.5 rounded-lg border border-[#E5E7EB] bg-white p-2',
          'focus-within:ring-2 focus-within:ring-[#3370FF] focus-within:border-[#3370FF]',
          'cursor-text'
        )}
        onClick={() => inputRef.current?.focus()}
        role="group"
        aria-label={`${label} chips`}
      >
        {values.map((chip) => (
          <span
            key={chip}
            className="inline-flex items-center gap-1 rounded-md bg-[#EEF2FF] px-2 py-0.5 text-[13px] font-medium text-[#3370FF]"
          >
            {chip}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeChip(chip) }}
              aria-label={`Remove ${chip}`}
              className="rounded hover:text-[#1f5ce8] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3370FF]"
            >
              <X className="h-3 w-3" />
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
          className="min-w-[120px] flex-1 bg-transparent text-sm text-[#0A0A0A] placeholder:text-[#9CA3AF] outline-none"
          aria-label={`Add ${label.toLowerCase()}`}
        />
      </div>
      <p className="mt-1 text-[12px] text-[#9CA3AF]">Press Enter or comma to add</p>
    </div>
  )
}

// ── Textarea ─────────────────────────────────────────────────────────────────

interface BrandState {
  services: string[]
  tone: string
  restrictedTopics: string[]
  targetQueries: string[]
  locations: string[]
}

export function BrandFingerprintTab() {
  const [brand, setBrand] = useState<BrandState>({
    services: ['Legal consultation', 'Contract review', 'Real estate law'],
    tone: 'Professional, approachable, and trustworthy. We explain legal concepts in plain language without being condescending. We avoid jargon unless the client specifically asks for technical depth.',
    restrictedTopics: ['Criminal defense', 'Immigration'],
    targetQueries: [
      'best real estate lawyer Tel Aviv',
      'contract review service Israel',
      'business lawyer for startups',
    ],
    locations: ['Tel Aviv', 'Haifa', 'Jerusalem'],
  })
  const [saveState, setSaveState] = useState<SaveState>('idle')

  async function handleSave() {
    setSaveState('saving')
    await new Promise((r) => setTimeout(r, 900))
    setSaveState('success')
    setTimeout(() => setSaveState('idle'), 3000)
  }

  function update<K extends keyof BrandState>(key: K, value: BrandState[K]) {
    setBrand((b) => ({ ...b, [key]: value }))
  }

  return (
    <div className="card-console overflow-hidden">
      <SectionHeader title="Brand fingerprint" />
      <p className="px-6 pb-4 text-[13px] leading-relaxed text-[#6B7280]">
        This is how Beamix understands and represents your business. Your agents use this data when crafting content, answers, and schema — keep it accurate.
      </p>

      <div className="divide-y divide-[#F3F4F6] px-6">
        {/* Services */}
        <div className="py-5">
          <ChipInput
            id="brand-services"
            label="Services"
            helper="The specific services you offer. Used by agents to generate accurate, service-specific content."
            values={brand.services}
            onChange={(v) => update('services', v)}
            placeholder="Add a service…"
          />
        </div>

        {/* Tone */}
        <FieldRow
          label="Brand tone"
          helper="How you want to sound in AI-generated content. Be specific — 'professional but not stuffy' is better than 'professional'."
          htmlFor="brand-tone"
        >
          <textarea
            id="brand-tone"
            rows={4}
            value={brand.tone}
            onChange={(e) => update('tone', e.target.value)}
            placeholder="Describe your brand voice and writing style…"
            className={cn(
              'w-full resize-none rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#0A0A0A] placeholder:text-[#9CA3AF]',
              'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-0 focus-visible:border-[#3370FF]'
            )}
          />
        </FieldRow>

        {/* Restricted topics */}
        <div className="py-5">
          <ChipInput
            id="brand-restricted"
            label="Restricted topics"
            helper="Topics your agents should never write about or recommend. Agents will flag any content that brushes against these."
            values={brand.restrictedTopics}
            onChange={(v) => update('restrictedTopics', v)}
            placeholder="Add a restricted topic…"
          />
        </div>

        {/* Target queries */}
        <div className="py-5">
          <ChipInput
            id="brand-queries"
            label="Target AI search queries"
            helper="The specific questions you want AI search engines to answer with your business. These drive your ranking strategy."
            values={brand.targetQueries}
            onChange={(v) => update('targetQueries', v)}
            placeholder="Add a query…"
            maxItems={30}
          />
        </div>

        {/* Locations */}
        <div className="py-5">
          <ChipInput
            id="brand-locations"
            label="Service locations"
            helper="Cities or regions you serve. Used for geo-targeted AI mentions and local schema."
            values={brand.locations}
            onChange={(v) => update('locations', v)}
            placeholder="Add a location…"
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#F3F4F6] px-6 py-4">
        <SaveFeedback state={saveState} />
        <Button onClick={handleSave} disabled={saveState === 'saving'} className="min-w-[120px]">
          {saveState === 'saving' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            'Save fingerprint'
          )}
        </Button>
      </div>
    </div>
  )
}
