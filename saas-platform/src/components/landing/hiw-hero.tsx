import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function HiwHero() {
  return (
    <section className="pt-[140px] pb-[80px] px-6 xl:px-12">
      <div className="max-w-[1280px] mx-auto text-center">
        <p
          className="text-xs font-semibold uppercase tracking-[0.1em] text-[#78716C] mb-6"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          HOW IT WORKS
        </p>
        <h1
          className="text-5xl md:text-6xl xl:text-7xl leading-[1.05] tracking-[-0.02em] text-[#141310] mb-6"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          How we make you the business AI recommends.
        </h1>
        <p
          className="text-[15px] text-[#78716C] max-w-xl mx-auto mb-10 leading-relaxed"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          Not a black box. Here&apos;s exactly what happens — from your first scan to your first ranking improvement.
        </p>
        <Link
          href="/scan"
          className="inline-flex items-center gap-2 bg-[#141310] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#023c65] transition-colors"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          Start Free — No Account Needed
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}
