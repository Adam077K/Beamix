'use client'
// dev-only showcase — no auth required

import { GroupB } from '@/components/marketing/group-b'
import { GroupC } from '@/components/marketing/group-c'
import { GroupD } from '@/components/marketing/group-d'
import { GroupE } from '@/components/marketing/group-e'
import { GroupNew } from '@/components/marketing/group-new'
import { GroupGlossy } from '@/components/marketing/group-glossy'
import { GroupPremium } from '@/components/marketing/group-premium'
import { GroupDarkKPI } from '@/components/marketing/group-dark-kpi'
import { GroupQuadrant } from '@/components/marketing/group-quadrant'
import { GroupAgentHero } from '@/components/marketing/group-agent-hero'
import { GroupScanLive } from '@/components/marketing/group-scan-live'
import { GroupDarkAnalytics } from '@/components/marketing/group-dark-analytics'
import { GroupAgentMarketing } from '@/components/marketing/group-agent-marketing'
import { GroupAgentLight } from '@/components/marketing/group-agent-light'

const GROUPS = [
  { id: 'agent-light', label: 'Agents (Light)' },
  { id: 'agent-dark', label: 'Agents (Dark)' },
  { id: 'command-center', label: 'Command Center' },
  { id: 'agent-hero', label: 'Agent Hero' },
  { id: 'scan-demo', label: 'Scan Demo' },
  { id: 'track-your-growth', label: 'Track Growth' },
  { id: 'beat-competitors', label: 'Competitors' },
  { id: 'landscape', label: 'Landscape' },
  { id: 'feature-cards', label: 'Features' },
  { id: 'hero-visual', label: 'Hero' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'premium-charts', label: 'Premium' },
  { id: 'glossy-variants', label: 'Glossy' },
]

export default function MarketingShowcasePage() {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-dvh bg-[#F9FAFB] relative">
      {/* Subtle noise texture overlay — premium background treatment */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      {/* Sticky nav */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/[0.04]">
        <div className="max-w-7xl mx-auto px-8 py-3 flex items-center gap-5 overflow-x-auto">
          <span className="text-sm font-semibold text-gray-900 shrink-0 mr-3 tracking-tight">
            Beamix
          </span>
          {GROUPS.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => scrollToSection(group.id)}
              className="shrink-0 text-[11px] font-medium text-gray-400 hover:text-gray-900 transition-colors duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3370FF]/30 rounded-sm px-0.5"
            >
              {group.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 pt-12 pb-24 space-y-20">

        {/* Page intro — establishes context */}
        <div className="text-center max-w-2xl mx-auto pt-4 pb-4">
          <p className="text-xs font-medium text-[#3370FF] mb-3">Marketing Visual Assets</p>
          <h1 className="text-2xl font-semibold text-gray-900 text-balance">
            Beamix Product Components
          </h1>
          <p className="text-sm text-gray-500 mt-3 text-pretty leading-relaxed">
            Screenshot-ready dashboard components for the Framer marketing website. Each section is a self-contained visual asset.
          </p>
        </div>

        {/* Light agent canvas — clean, business-friendly */}
        <section id="agent-light">
          <SectionHeader title="AI Agents — Light" subtitle="Clean white version for business users. Friendly language, task cards with progress." />
          <GroupAgentLight />
        </section>

        {/* Dark agent canvas — multiplayer cursor style */}
        <section id="agent-dark">
          <SectionHeader title="AI Agents — Dark" subtitle="Multiplayer cursor canvas with work outputs appearing in real-time." />
          <GroupAgentMarketing />
        </section>

        <section id="command-center">
          <SectionHeader title="Command Center" subtitle="Dark mission-control dashboard with live metrics" />
          <GroupDarkKPI />
        </section>

        <section id="agent-hero">
          <SectionHeader title="Agent Showcase" subtitle="Promotional hero with AI agent positioning" />
          <GroupAgentHero />
        </section>

        <section id="scan-demo">
          <SectionHeader title="Live Scan Demo" subtitle="Animated scan sequence with score reveal" />
          <GroupScanLive />
        </section>

        <section id="track-your-growth">
          <SectionHeader title="Track Your Growth" />
          <GroupB />
        </section>

        <section id="beat-competitors">
          <SectionHeader title="Beat Competitors" />
          <GroupC />
        </section>

        <section id="landscape">
          <SectionHeader title="Competitive Landscape" subtitle="Brand positioning on Visibility vs Sentiment" />
          <GroupQuadrant />
        </section>

        <section id="feature-cards">
          <SectionHeader title="Feature Cards" />
          <div className="flex flex-col gap-4">
            <GroupNew />
            <GroupD />
          </div>
        </section>

        <section id="hero-visual">
          <SectionHeader title="Hero Composites" />
          <GroupE />
        </section>

        <section id="analytics">
          <SectionHeader title="Audience Analytics" subtitle="Dark multi-line persona tracking" />
          <GroupDarkAnalytics />
        </section>

        <section id="premium-charts">
          <SectionHeader title="Premium Charts" />
          <GroupPremium />
        </section>

        <section id="glossy-variants">
          <SectionHeader title="Glossy Variants" />
          <GroupGlossy />
        </section>

      </div>
    </div>
  )
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 text-balance">{title}</h2>
      {subtitle && <p className="text-xs text-gray-400 mt-1 text-pretty">{subtitle}</p>}
    </div>
  )
}
