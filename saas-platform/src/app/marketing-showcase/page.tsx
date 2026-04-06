'use client'
// dev-only showcase — no auth required

import { GroupB } from '@/components/marketing/group-b'
import { GroupC } from '@/components/marketing/group-c'
import { GroupD } from '@/components/marketing/group-d'
import { GroupE } from '@/components/marketing/group-e'

const GROUPS = [
  { id: 'track-your-growth', label: 'Track Your Growth' },
  { id: 'beat-competitors', label: 'Beat Competitors' },
  { id: 'agents-do-the-work', label: 'AI Agents Do the Work' },
  { id: 'hero-visual', label: 'Hero Visual' },
]

export default function MarketingShowcasePage() {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFF] to-[#F5F5F5]">

      {/* Sticky nav */}
      <div className="sticky top-0 z-50 bg-gradient-to-b from-[#F8FAFF]/95 to-[#F8FAFF]/90 backdrop-blur-sm border-b border-border/40">
        <div className="max-w-7xl mx-auto px-8 py-3 flex items-center gap-4 overflow-x-auto">
          <span className="text-sm font-medium text-foreground shrink-0 mr-2">
            Beamix
          </span>
          {GROUPS.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => scrollToSection(group.id)}
              className="shrink-0 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            >
              {group.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-7xl mx-auto px-8 pt-10 pb-24 space-y-10">

        <section id="track-your-growth">
          <SectionHeader title="Track Your Growth" />
          <GroupB />
        </section>

        <section id="beat-competitors">
          <SectionHeader title="Beat Competitors" />
          <GroupC />
        </section>

        <section id="agents-do-the-work">
          <SectionHeader title="AI Agents Do the Work" />
          <GroupD />
        </section>

        <section id="hero-visual">
          <SectionHeader title="Hero Visual & Composites" />
          <GroupE />
        </section>

      </div>
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-medium tracking-[-0.02em] text-foreground">{title}</h2>
    </div>
  )
}
