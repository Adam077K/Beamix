export function WhyGap() {
  const tiers = [
    {
      price: '$295–$495/mo',
      title: 'Enterprise dashboards',
      description: 'Powerful. Designed for analyst teams. Not built for a restaurant owner or an insurance broker.',
      verdict: 'Wrong audience.',
    },
    {
      price: '$24–29/mo',
      title: 'Monitoring tools',
      description: 'They tell you you&apos;re invisible. Then they wish you good luck.',
      verdict: 'No action.',
    },
    {
      price: '$2,000–5,000/mo',
      title: 'Agencies',
      description: 'They do the work — if you can afford them. And you&apos;re dependent on them forever.',
      verdict: 'Out of reach.',
    },
  ]

  return (
    <section className="pt-[120px] pb-[120px] px-6 xl:px-12">
      <div className="max-w-[1280px] mx-auto">
        <p
          className="text-xs font-semibold uppercase tracking-[0.1em] text-[#78716C] mb-4"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          THE MARKET
        </p>
        <h2
          className="text-4xl md:text-5xl font-semibold text-[#141310] leading-tight mb-12"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          We looked at everything that existed.
        </h2>

        <div className="space-y-0">
          {tiers.map((tier) => (
            <div
              key={tier.title}
              className="py-8 border-b border-[#F9FAFB] grid grid-cols-1 md:grid-cols-[160px_1fr_auto] gap-4 md:gap-8 items-start"
            >
              <p
                className="font-mono text-sm text-[#023c65] pt-1"
              >
                {tier.price}
              </p>
              <div>
                <p
                  className="text-[15px] font-semibold text-[#141310] mb-1"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  {tier.title}
                </p>
                <p
                  className="text-[15px] text-[#78716C] leading-relaxed"
                  style={{ fontFamily: 'var(--font-inter)' }}
                  dangerouslySetInnerHTML={{ __html: tier.description }}
                />
              </div>
              <p
                className="text-[13px] text-[#78716C] italic whitespace-nowrap"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                {tier.verdict}
              </p>
            </div>
          ))}
        </div>

        <p
          className="text-3xl md:text-4xl font-semibold text-[#141310] text-center mt-16"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Nobody built the middle option. So we did.
        </p>
      </div>
    </section>
  )
}
