export function HiwTheLoop() {
  const cards = [
    { label: 'Scan', description: 'Fire real prompts across every AI engine' },
    { label: 'Fix', description: 'Agents produce publish-ready content' },
    { label: 'Rescan', description: 'Measure what moved and by how much' },
  ]

  return (
    <section className="pt-[120px] pb-[120px] px-6 xl:px-12">
      <div className="max-w-[1280px] mx-auto text-center">
        <p
          className="text-xs font-semibold uppercase tracking-[0.1em] text-[#78716C] mb-4"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          THE LOOP
        </p>
        <h2
          className="text-4xl md:text-5xl font-semibold text-[#141310] leading-tight mb-12"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          One session doesn&apos;t win AI search. The loop does.
        </h2>

        {/* Loop visual */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-12">
          {cards.map((card, i) => (
            <div key={card.label} className="flex items-center gap-4">
              <div className="rounded-[20px] bg-white border border-[#F9FAFB] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] text-center w-48">
                <p
                  className="text-lg font-semibold text-[#141310] mb-1"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {card.label}
                </p>
                <p
                  className="text-xs text-[#78716C]"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  {card.description}
                </p>
              </div>
              {i < cards.length - 1 && (
                <span className="text-[#78716C] text-xl hidden md:block">→</span>
              )}
            </div>
          ))}
        </div>

        <div className="max-w-xl mx-auto space-y-3 text-left">
          <p
            className="text-[15px] text-[#78716C] leading-relaxed"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            Every scan produces new intelligence. Every agent run produces new signals. Every week, the compound effect grows.
          </p>
          <p
            className="text-[15px] text-[#78716C] leading-relaxed"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            The businesses that start the loop today are building an advantage that gets harder to close every month they run it.
          </p>
        </div>
      </div>
    </section>
  )
}
