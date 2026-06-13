'use client'

import { ArrowUpRight } from 'lucide-react'

interface StarterQuestionsProps {
  questions: string[]
  onPick: (question: string) => void
}

/**
 * StarterQuestions — the empty-state's grounded prompts.
 *
 * Quiet card-inset tap-rows (TIER-3 recede), NOT a blinking cursor in a void.
 * Picking one loads it into the composer + runs the grounding ledger. Each row
 * is a real button (keyboard + screen-reader reachable).
 */
export function StarterQuestions({ questions, onPick }: StarterQuestionsProps) {
  return (
    <div className="space-y-2">
      {questions.map((q) => (
        <button
          key={q}
          type="button"
          onClick={() => onPick(q)}
          className="card-inset group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#F1F0FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF] focus-visible:ring-offset-2"
        >
          <span className="flex-1 text-[15px] leading-[1.45] text-[#1A1A1A]">
            {q}
          </span>
          <ArrowUpRight
            className="h-4 w-4 shrink-0 text-[#9CA3AF] transition-colors group-hover:text-[#3370FF]"
            aria-hidden="true"
          />
        </button>
      ))}
    </div>
  )
}
