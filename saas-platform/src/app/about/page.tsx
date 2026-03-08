import { BeamixNav } from '@/components/landing/beamix-nav'
import { BeamixFooter } from '@/components/landing/beamix-footer'

export const metadata = {
  title: 'About Beamix | AI Search Visibility Platform',
  description: 'Beamix scans your business for AI search visibility, diagnoses ranking gaps, and uses AI agents to fix them.',
}

export default function AboutPage() {
  return (
    <>
      <BeamixNav />
      <main className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-[family-name:var(--font-outfit)] text-4xl font-bold text-[#141310] mb-4">
            About Beamix
          </h1>
          <p className="text-xl text-stone-600 leading-relaxed mb-12">
            The AI search visibility platform that doesn&apos;t just show you the problem &mdash; it fixes it.
          </p>

          <div className="space-y-12">
            <section>
              <h2 className="font-[family-name:var(--font-outfit)] text-2xl font-semibold text-[#141310] mb-3">
                The Problem
              </h2>
              <p className="text-stone-600 leading-relaxed mb-4">
                AI search is replacing traditional search. ChatGPT, Gemini, Perplexity, and Claude now answer the questions your customers used to Google. When someone asks &quot;best coffee shop in Tel Aviv&quot; or &quot;top CRM for small businesses,&quot; AI gives a direct answer &mdash; and if your business isn&apos;t in it, you&apos;re invisible.
              </p>
              <p className="text-stone-600 leading-relaxed">
                Most businesses don&apos;t even know they have a problem. They&apos;re optimizing for Google while their customers are moving to AI. By the time they notice, competitors have already taken their spot.
              </p>
            </section>

            <section>
              <h2 className="font-[family-name:var(--font-outfit)] text-2xl font-semibold text-[#141310] mb-3">
                What Beamix Does
              </h2>
              <p className="text-stone-600 leading-relaxed mb-4">
                Beamix scans multiple AI search engines to show exactly how they see your business: whether you&apos;re mentioned, where you rank, what sentiment they associate with you, and who they recommend instead.
              </p>
              <p className="text-stone-600 leading-relaxed">
                Then our AI agents go to work. They write citation-worthy content, optimize your schema markup, build your FAQ presence, craft outreach strategies, and generate the technical assets that AI engines need to recommend you. Other platforms show dashboards. Beamix does the work.
              </p>
            </section>

            <section>
              <h2 className="font-[family-name:var(--font-outfit)] text-2xl font-semibold text-[#141310] mb-3">
                GEO: Generative Engine Optimization
              </h2>
              <p className="text-stone-600 leading-relaxed">
                SEO optimized for Google. GEO optimizes for AI. It&apos;s the same idea &mdash; making your business discoverable where people search &mdash; but the rules are completely different. AI engines don&apos;t care about backlinks or keyword density. They care about authoritative content, structured data, and citation-worthy sources. Beamix is built from the ground up for this new reality.
              </p>
            </section>

            <section>
              <h2 className="font-[family-name:var(--font-outfit)] text-2xl font-semibold text-[#141310] mb-3">
                Built for SMBs
              </h2>
              <p className="text-stone-600 leading-relaxed">
                Enterprise companies have SEO teams that can adapt. Small and medium businesses don&apos;t. Beamix levels the playing field by giving every business access to the same AI-powered optimization that would otherwise require a dedicated team. Start with a free scan in 30 seconds, no credit card required.
              </p>
            </section>

            <section className="bg-stone-50 rounded-2xl p-8">
              <h2 className="font-[family-name:var(--font-outfit)] text-2xl font-semibold text-[#141310] mb-3">
                Our Mission
              </h2>
              <p className="text-stone-600 leading-relaxed text-lg">
                Make every business discoverable in the AI search era. Not by gaming algorithms, but by making businesses genuinely worth recommending.
              </p>
            </section>
          </div>
        </div>
      </main>
      <BeamixFooter />
    </>
  )
}
