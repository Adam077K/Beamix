export function BeamixCostSection() {
  const cards = [
    {
      icon: '\u{1F4C9}',
      title: 'Lost Leads',
      body: 'AI search converts at 5x the rate of traditional search. Every query where you\'re absent is a customer who found your competitor first.',
    },
    {
      icon: '\u{1F91D}',
      title: 'Eroded Trust',
      body: 'AI engines are the new word of mouth. When you\'re missing, customers assume you\'re not trustworthy \u2014 even if you\'re the best in the market.',
    },
    {
      icon: '\u{1F4C8}',
      title: 'Growing Gap',
      body: 'Your competitors are using AI to fix their visibility right now. Every day you wait, the gap between you and #1 grows wider.',
    },
  ]

  return (
    <section className="py-24 px-6 bg-[#FAFAF8]">
      <div className="max-w-6xl mx-auto">
        <p className="text-center text-xs font-semibold text-stone-400 uppercase tracking-widest mb-4">The Cost of Being Invisible</p>
        <h2 className="text-center font-[family-name:var(--font-outfit)] font-bold text-4xl md:text-5xl text-[#141310] mb-16">
          Invisible in AI search means invisible<br />to your next customer.
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {cards.map(card => (
            <div key={card.title} className="bg-white rounded-[20px] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] border border-stone-100">
              <div className="text-4xl mb-4">{card.icon}</div>
              <h3 className="font-[family-name:var(--font-outfit)] font-bold text-xl text-[#141310] mb-3">{card.title}</h3>
              <p className="text-stone-500 leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
