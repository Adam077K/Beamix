'use client'

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type KeyboardEvent,
} from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import { cn } from '@/lib/utils'

// ─── Types ─────────────────────────────────────────────────────────────────

interface WorkspaceEditorProps {
  contentItemId: string
  title: string
  content: string
  isLocked?: boolean
}

interface FloatingButtonPosition {
  top: number
  left: number
}

type StreamState = 'idle' | 'streaming' | 'complete' | 'error'

// ─── Sections derived from markdown content ────────────────────────────────

const SECTION_TITLES = [
  'What we found',
  'What we changed',
  'Why it matters for GEO',
] as const

// ─── Component ─────────────────────────────────────────────────────────────

export default function WorkspaceEditor({
  contentItemId,
  title,
  content,
  isLocked = false,
}: WorkspaceEditorProps) {
  // Selection + floating button
  const [selectedText, setSelectedText] = useState<string | null>(null)
  const [floatPos, setFloatPos] = useState<FloatingButtonPosition | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Popover (Cmd+K or float button click)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [promptValue, setPromptValue] = useState('')
  const promptInputRef = useRef<HTMLInputElement>(null)

  // Streaming state
  const [streamState, setStreamState] = useState<StreamState>('idle')
  const [streamedTokens, setStreamedTokens] = useState('')
  const [pendingEditId, setPendingEditId] = useState<string | null>(null)

  // Current displayed content (mutable after edits)
  const [displayContent, setDisplayContent] = useState(content)

  // Update if prop changes
  useEffect(() => {
    setDisplayContent(content)
  }, [content])

  // ── Selection detection ─────────────────────────────────────────────────

  const handleMouseUp = useCallback(() => {
    if (isLocked) return
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      setSelectedText(null)
      setFloatPos(null)
      return
    }
    const text = sel.toString().trim()
    const range = sel.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return

    setSelectedText(text)
    setFloatPos({
      top: rect.top - containerRect.top - 40,
      left: Math.max(0, rect.left - containerRect.left + rect.width / 2 - 60),
    })
  }, [isLocked])

  // ── Cmd+K handler ───────────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        if (isLocked) return
        e.preventDefault()
        const sel = window.getSelection()
        const text = sel && !sel.isCollapsed ? sel.toString().trim() : null
        if (text) setSelectedText(text)
        setPopoverOpen(true)
        setTimeout(() => promptInputRef.current?.focus(), 50)
      }
      if (e.key === 'Escape') {
        setPopoverOpen(false)
        setStreamState('idle')
        setStreamedTokens('')
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isLocked])

  // ── Open popover from float button ─────────────────────────────────────

  const openPopover = useCallback(() => {
    setPopoverOpen(true)
    setFloatPos(null)
    setTimeout(() => promptInputRef.current?.focus(), 50)
  }, [])

  // ── Submit edit to streaming API ────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    if (!promptValue.trim() || streamState === 'streaming') return
    if (!selectedText) {
      // No selection — remind user to select text first
      promptInputRef.current?.setCustomValidity('Select some text first')
      return
    }

    setStreamState('streaming')
    setStreamedTokens('')

    try {
      const response = await fetch(`/api/inbox/${contentItemId}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selection: selectedText, prompt: promptValue }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        console.error('[WorkspaceEditor] edit API error:', err)
        setStreamState('error')
        return
      }

      if (!response.body) {
        setStreamState('error')
        return
      }

      // Parse edit ID from header if present
      const editId = response.headers.get('x-edit-id')
      if (editId) setPendingEditId(editId)

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        accumulated += chunk
        setStreamedTokens(accumulated)
      }

      setStreamState('complete')
    } catch (err) {
      console.error('[WorkspaceEditor] streaming error:', err)
      setStreamState('error')
    }
  }, [contentItemId, promptValue, selectedText, streamState])

  // ── Accept / reject the streamed rewrite ───────────────────────────────

  const handleAcceptRewrite = useCallback(async () => {
    if (!selectedText || !streamedTokens) return

    // Replace the selected text in displayContent
    const updated = displayContent.replace(selectedText, streamedTokens)
    setDisplayContent(updated)

    // Persist via PATCH (fire-and-forget, best effort)
    fetch(`/api/inbox/${contentItemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userEditedContent: updated,
        editId: pendingEditId,
        accepted: true,
      }),
    }).catch((e) => console.error('[WorkspaceEditor] PATCH error:', e))

    // Reset
    setPopoverOpen(false)
    setStreamState('idle')
    setStreamedTokens('')
    setSelectedText(null)
    setFloatPos(null)
    setPromptValue('')
    setPendingEditId(null)
    window.getSelection()?.removeAllRanges()
  }, [contentItemId, displayContent, pendingEditId, selectedText, streamedTokens])

  const handleRejectRewrite = useCallback(() => {
    // Mark edit as rejected
    if (pendingEditId) {
      fetch(`/api/inbox/${contentItemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editId: pendingEditId, accepted: false }),
      }).catch(() => {})
    }
    setStreamState('idle')
    setStreamedTokens('')
    setPendingEditId(null)
  }, [contentItemId, pendingEditId])

  const handlePromptKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit],
  )

  // ── Determine what to show in content area ──────────────────────────────

  const activeContent =
    streamState !== 'idle' && selectedText
      ? displayContent.replace(
          selectedText,
          streamState === 'complete'
            ? streamedTokens
            : `**[rewriting...]** ${streamedTokens}`,
        )
      : displayContent

  return (
    <div ref={containerRef} className="relative flex flex-1 flex-col overflow-hidden">
      {/* Content scroll area */}
      <div
        className="flex-1 overflow-y-auto px-6 py-6 md:px-10 lg:px-12"
        onMouseUp={handleMouseUp}
      >
        {/* Title */}
        <h1 className="mb-6 text-[22px] font-semibold leading-tight tracking-[-0.015em] text-gray-900">
          {title}
        </h1>

        {/* Markdown content with selection hint */}
        {!isLocked && (
          <p className="mb-4 text-[11px] text-gray-400">
            Select text and click "Ask AI to rewrite" or press{' '}
            <kbd className="rounded border border-gray-200 bg-gray-100 px-1 font-mono text-[10px] text-gray-500">
              Cmd+K
            </kbd>{' '}
            to rewrite a section.
          </p>
        )}

        <article
          className={cn(
            'prose prose-sm max-w-[720px]',
            'prose-headings:font-semibold prose-headings:text-gray-900 prose-headings:tracking-tight',
            'prose-p:text-gray-700 prose-li:text-gray-700',
            'prose-strong:text-gray-900',
            'prose-a:text-[#3370FF] prose-a:no-underline hover:prose-a:underline',
            // Highlight streamed diff
            streamState === 'streaming' || streamState === 'complete'
              ? '[&_.diff-new]:rounded [&_.diff-new]:bg-emerald-50 [&_.diff-new]:px-0.5 [&_.diff-new]:text-emerald-800'
              : '',
          )}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
            {activeContent}
          </ReactMarkdown>
        </article>

        {/* Accept/Reject rewrite buttons — shown after stream completes */}
        {streamState === 'complete' && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2.5 7l3 3 6-6" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="flex-1 text-[12px] text-emerald-700">Rewrite ready</p>
            <button
              type="button"
              onClick={handleAcceptRewrite}
              className="flex h-7 items-center rounded-md bg-emerald-600 px-3 text-[12px] font-medium text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 active:scale-[0.98]"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={handleRejectRewrite}
              className="flex h-7 items-center rounded-md border border-emerald-200 px-3 text-[12px] font-medium text-emerald-700 transition-colors hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 active:scale-[0.98]"
            >
              Reject
            </button>
          </div>
        )}

        {/* Error state */}
        {streamState === 'error' && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3">
            <p className="flex-1 text-[12px] text-red-600">
              Rewrite failed. Please try again.
            </p>
            <button
              type="button"
              onClick={() => setStreamState('idle')}
              className="text-[12px] text-red-500 underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* ── Floating "Ask AI" button on selection ───────────────────────── */}
      {floatPos && selectedText && !popoverOpen && !isLocked && (
        <button
          type="button"
          onClick={openPopover}
          className="absolute z-20 flex h-8 items-center gap-1.5 rounded-full border border-[#3370FF]/30 bg-white px-3 text-[12px] font-medium text-[#3370FF] shadow-md transition-all hover:bg-[#3370FF] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1"
          style={{ top: floatPos.top, left: floatPos.left }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Ask AI to rewrite
        </button>
      )}

      {/* ── Cmd+K Popover ──────────────────────────────────────────────── */}
      {popoverOpen && !isLocked && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30 bg-black/10"
            onClick={() => {
              setPopoverOpen(false)
              if (streamState !== 'streaming') {
                setStreamState('idle')
                setStreamedTokens('')
              }
            }}
          />

          {/* Popover panel */}
          <div className="absolute inset-x-6 top-6 z-40 rounded-xl border border-gray-200 bg-white shadow-xl md:inset-x-auto md:left-1/2 md:w-[480px] md:-translate-x-1/2">
            <div className="p-4">
              {/* Selected text preview */}
              {selectedText && (
                <div className="mb-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                  <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Selected
                  </p>
                  <p className="line-clamp-2 text-[12px] text-gray-600">{selectedText}</p>
                </div>
              )}

              {/* Prompt input */}
              <div className="flex gap-2">
                <input
                  ref={promptInputRef}
                  type="text"
                  placeholder={
                    selectedText
                      ? 'How should this be rewritten?'
                      : 'Select text first, then describe the rewrite'
                  }
                  value={promptValue}
                  onChange={(e) => setPromptValue(e.target.value)}
                  onKeyDown={handlePromptKeyDown}
                  disabled={streamState === 'streaming'}
                  className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[13px] text-gray-800 placeholder:text-gray-400 focus:border-[#3370FF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3370FF]/20 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!promptValue.trim() || !selectedText || streamState === 'streaming'}
                  className="flex h-9 items-center rounded-lg bg-[#3370FF] px-3 text-[13px] font-medium text-white transition-colors hover:bg-[#2860e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-1 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {streamState === 'streaming' ? (
                    <svg
                      className="animate-spin"
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                      <path d="M7 1.5a5.5 5.5 0 0 1 5.5 5.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ) : (
                    'Rewrite'
                  )}
                </button>
              </div>

              {/* Streaming tokens preview */}
              {streamState === 'streaming' && streamedTokens && (
                <div className="mt-3 max-h-32 overflow-y-auto rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2">
                  <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-500">
                    Writing...
                  </p>
                  <p className="text-[12px] leading-relaxed text-emerald-800">
                    {streamedTokens}
                    <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-emerald-600" />
                  </p>
                </div>
              )}

              {/* Hint */}
              <p className="mt-2 text-[11px] text-gray-400">
                Press{' '}
                <kbd className="rounded border border-gray-200 bg-gray-100 px-1 font-mono text-[10px]">
                  Enter
                </kbd>{' '}
                to send,{' '}
                <kbd className="rounded border border-gray-200 bg-gray-100 px-1 font-mono text-[10px]">
                  Esc
                </kbd>{' '}
                to close
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
