const TESTIMONIALS = [
  {
    quote: 'Within 2 weeks of using Beamix, ChatGPT started recommending my insurance agency by name. I had no idea this was even possible.',
    name: 'David L.',
    company: 'DL Insurance Group',
    initials: 'DL',
  },
  {
    quote: 'The scan showed me exactly why my competitors were beating me on Perplexity. The FAQ agent fixed it in an afternoon.',
    name: 'Sarah M.',
    company: 'Meridian Law Partners',
    initials: 'SM',
  },
  {
    quote: 'My restaurant went from invisible to #2 on Gemini for "best sushi in the city" in under a month. Worth every shekel.',
    name: 'Oren K.',
    company: 'Sakura Tel Aviv',
    initials: 'OK',
  },
]

export function BeamixTestimonials() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-center font-[family-name:var(--font-outfit)] font-bold text-4xl text-[#141310] mb-16">
          Businesses already winning on AI
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="bg-[#FAFAF8] border border-stone-200 rounded-[20px] p-8">
              <p className="text-stone-600 leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#06B6D4]/10 text-[#06B6D4] flex items-center justify-center font-[family-name:var(--font-outfit)] font-bold text-sm">
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#141310]">{t.name}</p>
                  <p className="text-xs text-stone-400">{t.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
