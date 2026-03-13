import Link from 'next/link'

interface HiwFinalCtaProps {
  headline: string
  caption: string
  ctaLabel: string
}

export function HiwFinalCta({ headline, caption, ctaLabel }: HiwFinalCtaProps) {
  return (
    <section className="bg-[#141310] py-[80px] px-6 xl:px-12">
      <div className="max-w-[1280px] mx-auto text-center">
        <h2
          className="text-4xl md:text-5xl font-semibold text-white leading-tight mb-4"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {headline}
        </h2>
        <p
          className="text-white/60 text-[15px] mb-8"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          {caption}
        </p>
        <Link
          href="/scan"
          className="inline-block bg-gradient-to-br from-[#023c65] to-[#013f6c] text-white px-6 py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  )
}
