/**
 * EngineBand — compact horizontal band showing per-engine scores.
 *
 * One cell per engine (ChatGPT / Gemini / Perplexity) with engine name,
 * its score or mention state, hairline dividers between cells, and Geist
 * Mono numerals. Data-only score colors (never blue). Calm.
 *
 * Accepts either a numeric score (0–100) or a mention state string
 * ("Mentioned" | "Not mentioned"). Real engine results from free_scans
 * may contain either — the component handles both gracefully.
 */

interface EngineScore {
  id: 'chatgpt' | 'gemini' | 'perplexity'
  label: string
  /** Numeric score 0–100 if available */
  score?: number | null
  /** Boolean mention state if numeric score unavailable */
  mentioned?: boolean | null
  /** Raw verdict string — shown if both score + mentioned are absent */
  verdict?: string | null
}

interface EngineBandProps {
  engines: EngineScore[]
}

function scoreColor(score: number): string {
  if (score >= 75) return 'var(--color-data-3)'
  if (score >= 50) return 'var(--color-data-4)'
  if (score >= 25) return 'var(--color-data-5)'
  return 'var(--color-data-6)'
}

function engineValue(engine: EngineScore): {
  display: string
  color: string
} {
  if (engine.score != null) {
    return {
      display: engine.score.toString(),
      color: scoreColor(engine.score),
    }
  }
  if (engine.mentioned === true) {
    return { display: 'Mentioned', color: 'var(--color-data-4)' }
  }
  if (engine.mentioned === false) {
    return { display: 'Not found', color: 'var(--color-data-6)' }
  }
  if (engine.verdict) {
    return { display: engine.verdict, color: 'var(--color-text-muted)' }
  }
  return { display: '—', color: 'var(--color-text-disabled)' }
}

export function EngineBand({ engines }: EngineBandProps) {
  return (
    <div className="card-console overflow-hidden">
      <p className="border-b border-[var(--color-border)] px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-disabled)]">
        By engine
      </p>
      <div className="flex divide-x divide-[var(--color-border)]">
        {engines.map((engine) => {
          const { display, color } = engineValue(engine)
          const isNumeric = engine.score != null
          return (
            <div
              key={engine.id}
              className="flex flex-1 flex-col items-center gap-1 px-4 py-5"
            >
              <span className="text-[13px] font-medium text-[var(--color-text-secondary)]">
                {engine.label}
              </span>
              <span
                className={
                  isNumeric
                    ? 'font-mono text-[22px] font-medium tabular-nums leading-none'
                    : 'text-[13px] font-medium leading-none text-center'
                }
                style={{ color }}
              >
                {display}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
