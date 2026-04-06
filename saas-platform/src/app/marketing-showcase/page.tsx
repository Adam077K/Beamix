'use client'
// dev-only showcase — no auth required

import { useRef } from 'react'
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
    <div className="min-h-screen bg-gray-50">
      {/* Sticky nav */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-3 flex items-center gap-3 overflow-x-auto">
          <span className="text-sm font-semibold text-gray-900 shrink-0 mr-2">
            Beamix Showcase
          </span>
          {GROUPS.map((group) => (
            <button
              key={group.id}
              onClick={() => scrollToSection(group.id)}
              className="shrink-0 rounded-full px-4 py-1.5 text-xs font-medium bg-gray-100 hover:bg-[#3370FF] hover:text-white text-gray-700 transition-colors duration-150"
            >
              {group.label}
            </button>
          ))}
        </div>
      </div>

      {/* Page header */}
      <div className="max-w-7xl mx-auto px-8 pt-16 pb-10">
        <p className="text-xs font-medium tracking-widest text-gray-400 uppercase mb-3">
          Developer Tool — Marketing Asset Showcase
        </p>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Beamix Component Showcase
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl">
          All dashboard visual components rendered with polished demo data for marketing screenshots.
          Light mode only. Screenshot each section for use in the Framer marketing site.
        </p>
      </div>

      {/* Sections */}
      <div className="max-w-7xl mx-auto px-8 pb-24 space-y-20">
        <section id="see-your-score">
          <SectionHeader
            label="Group A"
            title="See Your Score"
            description="Score ring, breakdown bar, and engine results cards."
          />
          <GroupA />
        </section>

        <section id="track-your-growth">
          <SectionHeader
            label="Group B"
            title="Track Your Growth"
            description="Visibility trend chart, engine donut, sparkline metrics, and scan heatmap."
          />
          <GroupB />
        </section>

        <section id="beat-competitors">
          <SectionHeader
            label="Group C"
            title="Beat Competitors"
            description="Competitor bar chart and industry leaderboard."
          />
          <GroupC />
        </section>

        <section id="agents-do-the-work">
          <SectionHeader
            label="Group D"
            title="AI Agents Do the Work"
            description="Recent agent runs and AI readiness category cards."
          />
          <GroupD />
        </section>

        <section id="hero-visual">
          <SectionHeader
            label="Group E + Composites"
            title="Hero Visual & Composite Cards"
            description="Before/after comparison, engine coverage grid, growth timeline, and performance overview."
          />
          <GroupE />
        </section>
      </div>
    </div>
  )
}

function SectionHeader({
  label,
  title,
  description,
}: {
  label: string
  title: string
  description: string
}) {
  return (
    <div className="mb-8">
      <p className="text-xs font-medium tracking-widest text-gray-400 uppercase mb-2">
        {label}
      </p>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">{title}</h2>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  )
}
