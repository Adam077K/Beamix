import { BarChart2, Users, ShieldCheck } from 'lucide-react'

const beliefs = [
  {
    icon: BarChart2,
    title: 'Results, not reports.',
    body: 'The measure of Beamix is not your Visibility Score. It\'s whether you get recommended more often. Everything in the platform exists to produce that outcome — not to produce a beautiful dashboard.',
  },
  {
    icon: Users,
    title: 'SMB-first, always.',
    body: 'Enterprise tools don\'t work for a business owner with 20 minutes between client meetings. Beamix is built for that person. Non-technical. Time-pressured. Results-focused.',
  },
  {
    icon: ShieldCheck,
    title: 'You own the work.',
    body: 'Nothing gets published without your approval. No agent runs without you triggering it. You review every deliverable before it goes live. Beamix is your AI team — not your autopilot.',
  },
]

export function WhyBeliefs() {
  return (
    <section className="pt-[120px] pb-[120px] px-6 xl:px-12">
      <div className="max-w-[1280px] mx-auto">
        <p
          className="text-xs font-semibold uppercase tracking-[0.1em] text-[#78716C] mb-4"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          OUR BELIEFS
        </p>
        <h2
          className="text-4xl md:text-5xl font-semibold text-[#141310] leading-tight mb-12"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Three things we believe that shaped everything.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {beliefs.map((belief) => {
            const Icon = belief.icon
            return (
              <div
                key={belief.title}
                className="rounded-2xl bg-[#f0f5fa] border border-[#e4e4e7] p-8"
              >
                <div className="w-10 h-10 rounded-xl bg-[#023c65]/10 flex items-center justify-center mb-5">
                  <Icon className="h-5 w-5 text-[#023c65]" />
                </div>
                <p
                  className="text-lg font-semibold text-[#141310] mb-3"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  {belief.title}
                </p>
                <p
                  className="text-[15px] text-[#78716C] leading-relaxed"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  {belief.body}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
