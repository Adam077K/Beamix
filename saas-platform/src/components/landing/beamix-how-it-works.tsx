import Image from 'next/image'

const STEPS = [
  {
    number: '01',
    title: 'Scan',
    description: 'Enter your URL. We check every major AI engine — ChatGPT, Gemini, Perplexity, Claude — in 60 seconds.',
    accent: 'from-cyan-500/10 to-transparent',
  },
  {
    number: '02',
    title: 'Diagnose',
    description: 'See exactly where you rank, who ranks above you, and why. No guesswork — specific, actionable data.',
    accent: 'from-orange-500/10 to-transparent',
  },
  {
    number: '03',
    title: 'Fix',
    description: 'AI agents write the content, schema markup, and strategy that gets you ranked. You review and publish.',
    accent: 'from-green-500/10 to-transparent',
  },
]

export function BeamixHowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 px-6 overflow-hidden">
      {/* Background image */}
      <Image
        src="/home_page/How It Works .png"
        alt=""
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#141310]/80 via-[#141310]/85 to-[#141310]/95" />

      <div className="max-w-6xl mx-auto relative z-10">
        <p className="section-label text-cyan-400 text-center mb-4">How It Works</p>
        <h2 className="text-center font-[family-name:var(--font-outfit)] font-bold text-4xl md:text-5xl text-white mb-16">
          Scan. Diagnose. Fix.<br />In that order.
        </h2>

        {/* Bento grid: large left + two stacked right */}
        <div className="grid md:grid-cols-5 gap-6">
          {/* Step 01 — large card spanning 3 cols */}
          <div className="md:col-span-3 glass-card-dark p-10 relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${STEPS[0].accent} pointer-events-none`} />
            <span className="absolute top-4 right-6 text-[120px] font-[family-name:var(--font-outfit)] font-bold text-white/[0.04] leading-none select-none">
              01
            </span>
            <div className="relative z-10">
              <span className="text-cyan-400 text-sm font-semibold uppercase tracking-wider">Step 01</span>
              <h3 className="font-[family-name:var(--font-outfit)] font-bold text-3xl text-white mt-3 mb-4">{STEPS[0].title}</h3>
              <p className="text-white/60 text-lg leading-relaxed max-w-md">{STEPS[0].description}</p>
            </div>
          </div>

          {/* Steps 02 + 03 stacked right, 2 cols */}
          <div className="md:col-span-2 flex flex-col gap-6">
            {STEPS.slice(1).map(step => (
              <div key={step.number} className="glass-card-dark p-8 relative overflow-hidden flex-1">
                <div className={`absolute inset-0 bg-gradient-to-br ${step.accent} pointer-events-none`} />
                <span className="absolute top-2 right-4 text-[80px] font-[family-name:var(--font-outfit)] font-bold text-white/[0.04] leading-none select-none">
                  {step.number}
                </span>
                <div className="relative z-10">
                  <span className="text-cyan-400 text-sm font-semibold uppercase tracking-wider">Step {step.number}</span>
                  <h3 className="font-[family-name:var(--font-outfit)] font-bold text-xl text-white mt-2 mb-2">{step.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
