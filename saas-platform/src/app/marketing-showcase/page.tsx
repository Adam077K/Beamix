'use client'
// dev-only showcase — no auth required

import { GroupA } from '@/components/marketing/group-a'
import { GroupB } from '@/components/marketing/group-b'
import { GroupC } from '@/components/marketing/group-c'
import { GroupD } from '@/components/marketing/group-d'
import { GroupE } from '@/components/marketing/group-e'

const GROUPS = [
  { id: 'see-your-score', label: 'See Your Score' },
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
    <div className="min-h-screen bg-background">

      {/* Sticky nav */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-8 py-3 flex items-center gap-3 overflow-x-auto">
          <span className="text-sm font-semibold text-foreground shrink-0 mr-2">
            Beamix
          </span>
          {GROUPS.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => scrollToSection(group.id)}
              className="shrink-0 rounded-full px-4 py-1.5 text-xs font-medium bg-muted hover:bg-[#3370FF] hover:text-white text-muted-foreground transition-colors duration-150"
            >
              {group.label}
            </button>
          ))}
        </div>
      </div>

      {/* Page header */}
      <div className="max-w-7xl mx-auto px-8 pt-12 pb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-1.5">
          Component Showcase
        </h1>
        <p className="text-sm text-muted-foreground">
          Dashboard components with polished demo data — for marketing screenshots.
        </p>
      </div>

      {/* Sections */}
      <div className="max-w-7xl mx-auto px-8 pb-24 space-y-16">

        <section id="see-your-score">
          <SectionHeader
            title="See Your Score"
            subtitle="Score ring, AI readiness audit, and engine scan results."
          />
          <GroupA />
        </section>

        <section id="track-your-growth">
          <SectionHeader
            title="Track Your Growth"
            subtitle="Visibility trend chart, engine mentions, sparkline metrics, and scan heatmap."
          />
          <GroupB />
        </section>

        <section id="beat-competitors">
          <SectionHeader
            title="Beat Competitors"
            subtitle="Competitor bar chart and industry ranking leaderboard."
          />
          <GroupC />
        </section>

        <section id="agents-do-the-work">
          <SectionHeader
            title="AI Agents Do the Work"
            subtitle="Agent activity feed and AI readiness audit report."
          />
          <GroupD />
        </section>

        <section id="hero-visual">
          <SectionHeader
            title="Hero Visual & Composites"
            subtitle="Performance overview, before/after comparison, engine coverage, and growth timeline."
          />
          <GroupE />
        </section>

      </div>
    </div>
  )
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
    </div>
  )
}
