export function BeamixHowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Scan',
      description: 'Enter your URL. We check every major AI engine \u2014 ChatGPT, Gemini, Perplexity, Claude \u2014 in 60 seconds.',
      color: 'bg-cyan-50 text-cyan-600',
    },
    {
      number: '02',
      title: 'Diagnose',
      description: 'See exactly where you rank, who ranks above you, and why. No guesswork \u2014 specific, actionable data.',
      color: 'bg-orange-50 text-orange-600',
    },
    {
      number: '03',
      title: 'Fix',
      description: 'AI agents write the content, schema markup, and strategy that gets you ranked. You review and publish.',
      color: 'bg-green-50 text-green-600',
    },
  ]

  return (
    <section id="how-it-works" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <p className="text-center text-xs font-semibold text-stone-400 uppercase tracking-widest mb-4">How It Works</p>
        <h2 className="text-center font-[family-name:var(--font-outfit)] font-bold text-4xl md:text-5xl text-[#141310] mb-16">
          Scan. Diagnose. Fix.<br />In that order.
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map(step => (
            <div key={step.number} className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl text-2xl font-[family-name:var(--font-outfit)] font-bold mb-6 ${step.color}`}>
                {step.number}
              </div>
              <h3 className="font-[family-name:var(--font-outfit)] font-bold text-2xl text-[#141310] mb-3">{step.title}</h3>
              <p className="text-stone-500 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
