export function HiwGeoVsSeo() {
  const seoPoints = [
    'Keyword rankings on Google page 1',
    'Backlinks and domain authority',
    'Technical site optimization',
  ]

  const geoPoints = [
    'Structured schema markup',
    'Natural language FAQ content',
    'Fresh, authoritative writing',
    'Brand mentions in credible sources',
    'Review volume and sentiment',
  ]

  return (
    <section className="bg-[#141310] py-[80px] px-6 xl:px-12">
      <div className="max-w-[1280px] mx-auto">
        <p
          className="text-xs font-semibold uppercase tracking-[0.1em] text-[#78716C] mb-4"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          THE SHIFT
        </p>
        <h2
          className="text-4xl md:text-5xl font-semibold text-white leading-tight mb-12 max-w-2xl"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          The game changed. Most businesses don&apos;t know it yet.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* SEO column */}
          <div className="pr-8 md:pr-16">
            <p
              className="text-sm font-semibold text-white/40 mb-6 uppercase tracking-[0.08em]"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              SEO — What you invested in
            </p>
            <ul className="space-y-3">
              {seoPoints.map((point) => (
                <li
                  key={point}
                  className="text-[15px] text-white/50 leading-relaxed"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  {point}
                </li>
              ))}
            </ul>
            <p
              className="text-[13px] text-white/30 mt-6 italic"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              Your SEO work doesn&apos;t transfer automatically.
            </p>
          </div>

          {/* GEO column */}
          <div className="pl-0 md:pl-16 border-t md:border-t-0 md:border-l border-white/10 pt-8 md:pt-0">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-[#023c65]" />
              <p
                className="text-sm font-semibold text-white uppercase tracking-[0.08em]"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                GEO — The new game
              </p>
            </div>
            <ul className="space-y-3">
              {geoPoints.map((point) => (
                <li
                  key={point}
                  className="text-[15px] text-white leading-relaxed"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  {point}
                </li>
              ))}
            </ul>
            <p
              className="text-[13px] text-white/50 mt-6"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              This is a separate game with separate rules. Beamix plays it for you.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
