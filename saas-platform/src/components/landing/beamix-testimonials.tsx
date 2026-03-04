import Image from 'next/image'

const TESTIMONIALS = [
  {
    quote: 'Beamix showed us we were completely invisible to ChatGPT. Within 2 weeks of using the agents, we started appearing in responses.',
    name: 'Sarah M.',
    company: 'Marketing Director, TechFlow',
    color: 'bg-[#06B6D4]',
    initials: 'SM',
  },
  {
    quote: 'The AI agents literally rewrote our FAQ page and optimized our schema markup. Our mentions in Gemini went from 0 to 12 in a month.',
    name: 'David K.',
    company: 'CEO, GreenLeaf Solutions',
    color: 'bg-[#F97316]',
    initials: 'DK',
  },
  {
    quote: 'We tried doing GEO manually — it was impossible to keep up. Beamix automates everything and the results speak for themselves.',
    name: 'Maya L.',
    company: 'Founder, StyleHouse Boutique',
    color: 'bg-[#10B981]',
    initials: 'ML',
  },
]

export function BeamixTestimonials() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Background image */}
      <Image
        src="/home_page/Backgrond_ Testimonials.png"
        alt=""
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#141310]/70 via-[#141310]/80 to-[#141310]/95" />

      <div className="max-w-6xl mx-auto relative z-10">
        <p className="section-label text-cyan-400 text-center mb-4">Testimonials</p>
        <h2 className="text-center font-[family-name:var(--font-outfit)] font-bold text-4xl md:text-5xl text-white mb-4">
          Trusted by businesses who want to be found
        </h2>
        <p className="text-center text-white/60 mb-16">
          See what our customers say about their AI search visibility transformation
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="glass-card-dark p-8 card-hover-lift relative">
              {/* Decorative quote mark */}
              <span className="absolute top-4 right-6 text-6xl text-[#06B6D4]/20 font-serif leading-none select-none">&ldquo;</span>

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-amber-400 text-lg">&#9733;</span>
                ))}
              </div>

              <p className="text-white/80 leading-relaxed mb-6 relative z-10">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white text-sm font-bold`}>
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">{t.name}</p>
                  <p className="text-xs text-white/50">{t.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
