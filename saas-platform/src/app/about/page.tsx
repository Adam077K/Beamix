import { BeamixNav } from '@/components/landing/beamix-nav'
import { BeamixFooter } from '@/components/landing/beamix-footer'

export default function AboutPage() {
  return (
    <>
      <BeamixNav />
      <main className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-[family-name:var(--font-outfit)] text-3xl font-bold text-[#141310] mb-6">About Beamix</h1>
          <p className="text-stone-600 leading-relaxed">
            Beamix scans your business for AI search visibility, diagnoses why you rank (or don&apos;t), and uses AI agents to fix it. Competitors show dashboards &mdash; Beamix does the work.
          </p>
          <p className="text-stone-500 text-sm mt-8">Last updated: March 2026</p>
        </div>
      </main>
      <BeamixFooter />
    </>
  )
}
