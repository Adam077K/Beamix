import type { Outcome } from '@/types/traceability'

/** Display labels for AI engines. */
export const ENGINE_LABEL: Record<Outcome['engine'], string> = {
  chatgpt: 'ChatGPT',
  gemini: 'Gemini',
  perplexity: 'Perplexity',
}

/** Format ISO to "Jun 9" — short, no year noise. */
export function shortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return iso
  }
}

/** Format ISO to "Jun 9, 2026" — full date. */
export function fullDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

/**
 * Split the outcome statement around the engine label so the engine word can be
 * rendered as a single Fraunces italic beat (M5 — one serif beat per screen).
 * Returns [before, engineWord, after]; engineWord is '' if the label is absent.
 */
export function splitOnEngine(
  statement: string,
  engine: Outcome['engine'],
): [string, string, string] {
  const label = ENGINE_LABEL[engine]
  const idx = statement.indexOf(label)
  if (idx === -1) return [statement, '', '']
  return [statement.slice(0, idx), label, statement.slice(idx + label.length)]
}

/** Distinct engines touched across a set of outcomes, in first-seen order. */
export function enginesTouched(outcomes: Outcome[]): Outcome['engine'][] {
  const seen: Outcome['engine'][] = []
  for (const o of outcomes) {
    if (!seen.includes(o.engine)) seen.push(o.engine)
  }
  return seen
}
