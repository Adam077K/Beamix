'use client'

/**
 * CustomerNoteBlock — the emotional close of every digest.
 *
 * The ONLY Fraunces moment on the screen. Warm inset on bg-surface-warm.
 * Body is rendered verbatim (no re-summarization).
 * No quotes, no attribution, no avatar — just the note.
 */
export function CustomerNoteBlock({ note }: { note: string }) {
  return (
    <div className="px-5 py-5">
      <div
        className="rounded-[var(--radius-card)] bg-surface-warm p-6"
        aria-label="A note for you"
      >
        <p
          className="font-[var(--font-serif)] text-[17px] italic leading-[1.65] text-[#374151]"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {note}
        </p>
      </div>
    </div>
  )
}
