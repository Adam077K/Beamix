interface UserTurnProps {
  content: string
  /** Quiet relative timestamp, rendered in Geist Mono above the message. */
  timestamp?: string
}

/**
 * UserTurn — the de-AI core of the thread.
 *
 * NOT a chat bubble. A full-width document-annotation block marked by a 2px
 * blue left rule — the blue=you law applied at the element level. No avatar,
 * no bubble, no rounded balloon. The optional timestamp recedes above in Geist
 * Mono (every figure on the surface is mono, M11).
 */
export function UserTurn({ content, timestamp }: UserTurnProps) {
  return (
    <div className="border-l-2 border-[#3370FF] pl-4">
      {timestamp && (
        <p className="mb-1.5 font-[var(--font-mono)] text-[12px] tabular-nums tracking-[0.02em] text-[#9CA3AF]">
          {timestamp}
        </p>
      )}
      <p className="text-[16px] font-medium leading-[1.55] text-[#0A0A0A]">
        {content}
      </p>
    </div>
  )
}
