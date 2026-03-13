import Image from 'next/image'

export function WhyNow() {
  return (
    <section className="pt-[120px] pb-[120px] px-6 xl:px-12">
      <div className="max-w-[1280px] mx-auto">
        <p
          className="text-xs font-semibold uppercase tracking-[0.1em] text-[#78716C] mb-4"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          THE WINDOW
        </p>
        <h2
          className="text-4xl md:text-5xl font-semibold text-[#141310] leading-tight mb-8"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          The window is open. Not forever.
        </h2>

        {/* Full-width image */}
        <div className="relative w-full aspect-[5/2] min-h-[400px] rounded-2xl overflow-hidden">
          <Image
            src="/Pages/nyc-pricing.png"
            alt="High Line panoramic view of Manhattan — impasto oil painting"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

          {/* Glass card */}
          <div className="absolute top-8 left-8 backdrop-blur-xl bg-white/60 border border-white/50 rounded-2xl p-6 w-80 shadow-xl">
            <p
              className="text-[13px] text-[#141310] leading-relaxed"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              GEO is where SEO was in 2004. The businesses that invested in SEO early spent a decade enjoying rankings their competitors are still trying to catch up to.
            </p>
            <p
              className="text-[13px] text-[#141310] leading-relaxed mt-3"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              The same window is open now — for a short time. AI search is still new enough that most businesses haven&apos;t started.
            </p>
            <p
              className="text-[13px] font-semibold text-[#023c65] mt-3"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              Beamix exists to make sure that business is yours.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
