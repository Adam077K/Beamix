const ENGINES = [
  { name: 'ChatGPT', color: '#10B981' },
  { name: 'Gemini', color: '#4285F4' },
  { name: 'Perplexity', color: '#8B5CF6' },
  { name: 'Claude', color: '#F97316' },
  { name: 'Bing Copilot', color: '#0EA5E9' },
  { name: 'Google AI Overviews', color: '#EF4444' },
  { name: 'Grok', color: '#FFFFFF' },
  { name: 'You.com', color: '#06B6D4' },
  { name: 'Brave AI', color: '#F59E0B' },
  { name: 'Meta AI', color: '#3B82F6' },
]

export function BeamixTrustBar() {
  const doubled = [...ENGINES, ...ENGINES]

  return (
    <section className="py-5 bg-white border-y border-stone-100 overflow-hidden">
      <p className="text-center text-xs font-semibold text-stone-400 uppercase tracking-widest mb-4">
        Scanning across 10+ AI engines
      </p>
      <div className="relative">
        <div
          className="flex gap-6 w-max"
          style={{ animation: 'marquee 30s linear infinite' }}
        >
          {doubled.map((engine, i) => (
            <div
              key={`${engine.name}-${i}`}
              className="flex items-center gap-2 bg-stone-50 border border-stone-100 rounded-full px-4 py-2 text-sm font-medium text-stone-600 whitespace-nowrap"
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: engine.color }}
              />
              {engine.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
