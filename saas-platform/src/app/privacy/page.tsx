import { BeamixNav } from '@/components/landing/beamix-nav'
import { BeamixFooter } from '@/components/landing/beamix-footer'

export default function PrivacyPage() {
  return (
    <>
      <BeamixNav />
      <main className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-[family-name:var(--font-outfit)] text-3xl font-bold text-[#141310] mb-6">Privacy Policy</h1>
          <p className="text-stone-600 leading-relaxed">
            This page is under construction. Our privacy policy will be available here soon.
          </p>
          <p className="text-stone-500 text-sm mt-8">Last updated: March 2026</p>
        </div>
      </main>
      <BeamixFooter />
    </>
  )
}
