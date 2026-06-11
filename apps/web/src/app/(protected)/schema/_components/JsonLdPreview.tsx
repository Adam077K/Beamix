'use client'

import { useState, useCallback } from 'react'
import { Check, Copy, Download, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SerifVerdict } from '@/components/console/SerifVerdict'

// ---------------------------------------------------------------------------
// Token coloring for JSON-LD syntax highlighting
// ---------------------------------------------------------------------------

type TokenType = 'key' | 'string' | 'number' | 'boolean' | 'null' | 'punctuation'

interface Token {
  type: TokenType
  value: string
}

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = []

  // Indent — punctuation
  const indentMatch = line.match(/^(\s*)/)
  if (indentMatch && indentMatch[1]) {
    tokens.push({ type: 'punctuation', value: indentMatch[1] })
  }
  const rest = line.trimStart()

  // Key: "someKey":
  const keyMatch = rest.match(/^("(?:[^"\\]|\\.)*")(\s*:)/)
  if (keyMatch) {
    tokens.push({ type: 'key', value: keyMatch[1] })
    tokens.push({ type: 'punctuation', value: keyMatch[2] })
    const afterKey = rest.slice(keyMatch[0].length)
    tokens.push(...tokenizeValue(afterKey.trim()))
    return tokens
  }

  // Array/object value without key
  tokens.push(...tokenizeValue(rest))
  return tokens
}

function tokenizeValue(s: string): Token[] {
  if (!s) return []
  const tokens: Token[] = []

  // Leading space
  const spaceMatch = s.match(/^(\s+)/)
  if (spaceMatch) tokens.push({ type: 'punctuation', value: spaceMatch[1] })
  const v = s.trimStart()

  if (v === '') return tokens

  // String
  if (v.startsWith('"')) {
    const strMatch = v.match(/^("(?:[^"\\]|\\.)*")(.*)/)
    if (strMatch) {
      tokens.push({ type: 'string', value: strMatch[1] })
      const tail = strMatch[2].trim()
      if (tail) tokens.push({ type: 'punctuation', value: ' ' + tail })
    } else {
      tokens.push({ type: 'string', value: v })
    }
    return tokens
  }

  // Numbers
  const numMatch = v.match(/^(-?\d+(?:\.\d+)?)(.*)/)
  if (numMatch) {
    tokens.push({ type: 'number', value: numMatch[1] })
    const tail = numMatch[2].trim()
    if (tail) tokens.push({ type: 'punctuation', value: ' ' + tail })
    return tokens
  }

  // true / false / null
  if (v.startsWith('true') || v.startsWith('false')) {
    const boolMatch = v.match(/^(true|false)(.*)/)
    if (boolMatch) {
      tokens.push({ type: 'boolean', value: boolMatch[1] })
      const tail = boolMatch[2].trim()
      if (tail) tokens.push({ type: 'punctuation', value: ' ' + tail })
    }
    return tokens
  }
  if (v.startsWith('null')) {
    tokens.push({ type: 'null', value: 'null' })
    const tail = v.slice(4).trim()
    if (tail) tokens.push({ type: 'punctuation', value: ' ' + tail })
    return tokens
  }

  // Structural punctuation (braces, brackets, commas)
  tokens.push({ type: 'punctuation', value: v })
  return tokens
}

const TOKEN_COLORS: Record<TokenType, string> = {
  key: '#6E56F0',          // violet — schema field names (agent territory)
  string: '#0E6E3E',       // dark emerald — string values
  number: '#C2410C',       // amber-700 — numeric values
  boolean: '#2563EB',      // blue-600 — booleans
  null: '#9CA3AF',         // muted
  punctuation: '#6B7280',  // muted structure
}

interface SyntaxLineProps {
  line: string
  lineNumber: number
}

function SyntaxLine({ line, lineNumber }: SyntaxLineProps) {
  const tokens = tokenizeLine(line)
  return (
    <div className="flex min-h-[22px] items-start gap-4">
      {/* Gutter */}
      <span
        className="w-[28px] shrink-0 select-none text-right font-[var(--font-mono)] text-[11px] leading-[22px] text-[#D1D5DB]"
        aria-hidden="true"
      >
        {lineNumber}
      </span>
      {/* Code line */}
      <span className="flex-1 font-[var(--font-mono)] text-[12.5px] leading-[22px] whitespace-pre">
        {tokens.map((tok, i) => (
          <span key={i} style={{ color: TOKEN_COLORS[tok.type] }}>
            {tok.value}
          </span>
        ))}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Validity check row
// ---------------------------------------------------------------------------

interface ValidityRowProps {
  label: string
  pass: boolean
  value?: string
}

function ValidityRow({ label, pass, value }: ValidityRowProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      {/* Status glyph */}
      <span
        className={cn(
          'flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px]',
          pass
            ? 'bg-[#E6F5EE] text-[#0E9E6E]'
            : 'bg-[#FDECEC] text-[#DC2626]',
        )}
        aria-label={pass ? 'Pass' : 'Fail'}
      >
        {pass ? '✓' : '✗'}
      </span>
      {/* Field label */}
      <span className="font-[var(--font-mono)] text-[12px] tabular-nums text-[#0A0A0A]">
        {label}
      </span>
      {/* Value if present */}
      {value && (
        <span className="ml-auto font-[var(--font-mono)] text-[12px] tabular-nums text-[#6B7280]">
          {value}
        </span>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Action button
// ---------------------------------------------------------------------------

interface ActionButtonProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
  variant?: 'primary' | 'outline'
}

function ActionButton({ icon, label, onClick, variant = 'outline' }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-9 items-center gap-2 rounded-lg px-4 text-[13px] font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2',
        variant === 'primary'
          ? 'bg-[#3370FF] text-white hover:bg-[#1f5ce8] active:bg-[#1a52d6]'
          : 'border border-[#E5E7EB] bg-white text-[#0A0A0A] hover:bg-[#F7F6F2] active:bg-[#F0EEE8]',
      )}
    >
      {icon}
      {label}
    </button>
  )
}

// ---------------------------------------------------------------------------
// JsonLdPreview — the Zone 5 output (TIER-1)
// ---------------------------------------------------------------------------

export interface JsonLdPreviewProps {
  jsonLd: string
  schemaType: string
  /** Validity percentage 0-100 */
  validityScore: number
  /** Fields that are missing (empty = 9/9 valid) */
  missingFields: string[]
  /** true = auto-published, false = pending inject */
  published: boolean
  publishedAt: string | null
  /** Where it was injected (for the "what + where published" line) */
  publishTarget?: string
  /** URL this schema was generated for */
  url: string
  onInject?: () => void
}

export function JsonLdPreview({
  jsonLd,
  schemaType,
  validityScore,
  missingFields,
  published,
  publishedAt,
  publishTarget,
  url,
  onInject,
}: JsonLdPreviewProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(jsonLd)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: select all in a textarea
    }
  }, [jsonLd])

  const handleDownload = useCallback(() => {
    const blob = new Blob([jsonLd], { type: 'application/ld+json' })
    const href = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = href
    a.download = `schema-${schemaType.toLowerCase()}.jsonld`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(href)
  }, [jsonLd, schemaType])

  const lines = jsonLd.split('\n')

  // Build validity check rows from the parsed JSON
  let parsed: Record<string, unknown> = {}
  try {
    parsed = JSON.parse(jsonLd) as Record<string, unknown>
  } catch {
    // malformed — show all as missing
  }

  // The fields we care about for a Dentist schema
  const KEY_FIELDS: { key: string; label: string }[] = [
    { key: '@type', label: '@type' },
    { key: 'name', label: 'name' },
    { key: 'telephone', label: 'telephone' },
    { key: 'address', label: 'address' },
    { key: 'geo', label: 'geo' },
    { key: 'openingHoursSpecification', label: 'openingHoursSpecification' },
    { key: 'acceptsInsurance', label: 'acceptsInsurance' },
    { key: 'priceRange', label: 'priceRange' },
    { key: 'areaServed', label: 'areaServed' },
  ]

  const totalFields = KEY_FIELDS.length
  const validCount = KEY_FIELDS.filter(
    ({ key }) => key in parsed && !missingFields.includes(key),
  ).length

  // Publish timestamp formatted
  const publishedFormatted = publishedAt
    ? new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(publishedAt))
    : null

  return (
    <div className="overflow-hidden">
      {/* Header row — validity signal + actions */}
      <div className="flex flex-col gap-4 px-6 pt-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {/* Schema type label */}
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
            {schemaType} Schema
          </p>
          {/* M5 Serif beat — one per screen, on the verdict word */}
          <p className="mt-1 text-[15px] leading-relaxed text-[#0A0A0A]">
            Schema is{' '}
            <SerifVerdict>
              {validityScore === 100 ? 'complete' : validityScore >= 75 ? 'strong' : 'partial'}
            </SerifVerdict>
            {' '}— {validCount}/{totalFields} required fields valid
          </p>
          {/* URL context */}
          <p className="mt-0.5 font-[var(--font-mono)] text-[12px] text-[#9CA3AF] truncate">
            {url}
          </p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-wrap gap-2">
          <ActionButton
            icon={
              copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )
            }
            label={copied ? 'Copied' : 'Copy'}
            onClick={handleCopy}
          />
          <ActionButton
            icon={<Download className="h-3.5 w-3.5" />}
            label="Download"
            onClick={handleDownload}
          />
          {!published && onInject && (
            <ActionButton
              icon={<Upload className="h-3.5 w-3.5" />}
              label="Inject"
              onClick={onInject}
              variant="primary"
            />
          )}
        </div>
      </div>

      {/* Auto-publish confirmation line */}
      {published && publishedFormatted && publishTarget && (
        <div className="mx-6 mt-4 flex items-center gap-2 rounded-lg bg-[#E6F5EE] px-4 py-2.5">
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#0E9E6E] text-[10px] text-white">
            ✓
          </span>
          <p className="text-[13px] text-[#0E6E3E]">
            <span className="font-medium">Auto-published</span>
            {' '}to{' '}
            <span className="font-[var(--font-mono)] tabular-nums">{publishTarget}</span>
            {' '}on {publishedFormatted}
          </p>
        </div>
      )}

      {/* M12 editorial divider */}
      <div className="mx-6 my-5 h-px bg-[#E5E7EB]" aria-hidden="true" />

      {/* Two-column layout: code left, validity right */}
      <div className="grid grid-cols-1 gap-6 px-6 pb-6 lg:grid-cols-[1fr_280px]">
        {/* Syntax-highlighted JSON-LD */}
        <div
          className="overflow-auto rounded-lg bg-[#FAFAFA] p-4"
          style={{ border: '1px solid #F0F0F0', maxHeight: '480px' }}
          role="region"
          aria-label={`${schemaType} JSON-LD markup`}
        >
          <div aria-hidden="true">
            {lines.map((line, i) => (
              <SyntaxLine key={i} line={line} lineNumber={i + 1} />
            ))}
          </div>
          {/* Screen-reader accessible raw content */}
          <pre className="sr-only">{jsonLd}</pre>
        </div>

        {/* Validity check panel */}
        <div>
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
            Field validity
          </p>
          <div
            className="divide-y divide-[#F3F4F6] rounded-lg bg-[#FAFAFA]"
            style={{ border: '1px solid #F0F0F0' }}
            role="list"
            aria-label="Schema field validity checks"
          >
            {KEY_FIELDS.map(({ key, label }) => {
              const present = key in parsed && !missingFields.includes(key)
              const rawValue = parsed[key]
              let displayValue: string | undefined
              if (present && rawValue !== undefined) {
                if (typeof rawValue === 'boolean') displayValue = rawValue ? 'true' : 'false'
                else if (typeof rawValue === 'string') displayValue = rawValue.slice(0, 18)
                else if (Array.isArray(rawValue)) displayValue = `${rawValue.length} items`
                else if (typeof rawValue === 'object') displayValue = '{…}'
                else displayValue = String(rawValue)
              }
              return (
                <div key={key} className="px-3" role="listitem">
                  <ValidityRow label={label} pass={present} value={displayValue} />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
