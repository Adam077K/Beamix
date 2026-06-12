'use client'

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ComposerProps {
  /** Controlled value (so starter questions can prefill it). */
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  /** True while a grounding/answer is streaming — composer is locked. */
  busy?: boolean
}

/**
 * Composer — the one CTA on the surface.
 *
 * Sticky to the bottom of the column, card-console finish, single auto-grow
 * textarea at 16px (iOS zoom guard) with a blue focus ring. Send is the blue
 * pill — the only primary action. Enter submits, Shift+Enter newlines. No
 * toolbar clutter; a quiet "/" hint nods to starter questions.
 */
export function Composer({
  value,
  onChange,
  onSubmit,
  busy = false,
}: ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [focused, setFocused] = useState(false)

  // Auto-grow up to a sensible cap.
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`
  }, [value])

  const canSend = value.trim().length > 0 && !busy

  const submit = () => {
    if (!canSend) return
    onSubmit(value.trim())
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    submit()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'card-console flex items-end gap-2 p-2 pl-4 transition-shadow',
        focused && 'ring-2 ring-[#3370FF] ring-offset-0',
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          rows={1}
          disabled={busy}
          placeholder="Ask about your visibility, competitors, or what to fix first…"
          aria-label="Ask Beamix a question"
          className="max-h-[180px] w-full resize-none bg-transparent py-2.5 text-[16px] leading-[1.5] text-[#0A0A0A] placeholder:text-[#9CA3AF] focus:outline-none disabled:opacity-60"
        />
        <span className="select-none pb-1 text-[11px] text-[#9CA3AF]">
          <kbd className="font-[var(--font-mono)] text-[#6B7280]">Enter</kbd> to
          send ·{' '}
          <kbd className="font-[var(--font-mono)] text-[#6B7280]">Shift</kbd>+
          <kbd className="font-[var(--font-mono)] text-[#6B7280]">Enter</kbd> for
          a new line
        </span>
      </div>

      <button
        type="submit"
        disabled={!canSend}
        aria-label="Send question"
        className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3370FF] text-white transition-colors hover:bg-[#1f5ce8] active:bg-[#1a52d6] disabled:cursor-not-allowed disabled:bg-[#C9D8FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
      >
        <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
      </button>
    </form>
  )
}
