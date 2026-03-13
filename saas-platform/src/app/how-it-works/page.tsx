import { HpNav } from '@/components/landing/hp-nav'
import { HpFooter } from '@/components/landing/hp-footer'
import { HiwHero } from '@/components/landing/hiw-hero'
import { HiwStep } from '@/components/landing/hiw-step'
import { HiwGeoVsSeo } from '@/components/landing/hiw-geo-vs-seo'
import { HiwTheLoop } from '@/components/landing/hiw-the-loop'
import { HiwFinalCta } from '@/components/landing/hiw-final-cta'

// Glass badge for Step 01
function ScanningBadge() {
  return (
    <div className="text-xs text-[#141310]" style={{ fontFamily: 'var(--font-inter)' }}>
      <p className="font-semibold mb-2">Scanning 7 engines…</p>
      <div className="flex flex-wrap gap-1">
        {['ChatGPT', 'Gemini', 'Perplexity'].map((engine) => (
          <span
            key={engine}
            className="px-2 py-0.5 rounded-full bg-[#141310]/10 text-[#141310] text-[11px]"
          >
            {engine}
          </span>
        ))}
      </div>
    </div>
  )
}

// Score card for Step 02
function ScoreCard() {
  return (
    <div className="text-center">
      <p
        className="text-8xl font-bold text-[#141310] mb-2 leading-none"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        87
      </p>
      <p className="text-xs text-[#78716C] mb-6" style={{ fontFamily: 'var(--font-inter)' }}>
        Visibility Score — composite
      </p>
      <div className="space-y-2 text-left">
        {[
          'Missing schema markup',
          'Low FAQ coverage',
          'No recent brand citations',
        ].map((gap) => (
          <div
            key={gap}
            className="flex items-center gap-2 text-xs text-[#78716C]"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#023c65]" />
            {gap}
          </div>
        ))}
      </div>
    </div>
  )
}

// Agent chips for Step 03
function AgentsBadge() {
  return (
    <div className="text-xs text-[#141310]" style={{ fontFamily: 'var(--font-inter)' }}>
      <p className="font-semibold mb-2">Active agents</p>
      <div className="flex flex-col gap-1">
        {['Content Writer', 'Schema Optimizer', 'FAQ Agent', 'Competitor Intel'].map((agent) => (
          <span
            key={agent}
            className="px-2 py-1 rounded-lg bg-[#023c65] text-white text-[11px] font-medium"
          >
            {agent}
          </span>
        ))}
      </div>
    </div>
  )
}

// Rankings badge for Step 04
function RankingsBadge() {
  return (
    <div className="text-xs text-[#141310]" style={{ fontFamily: 'var(--font-inter)' }}>
      <p className="font-semibold mb-2">Visibility Score</p>
      <div className="flex flex-col gap-1">
        {[
          { week: 'Week 1', score: 42 },
          { week: 'Week 3', score: 61 },
          { week: 'Week 6', score: 78 },
          { week: 'Week 8', score: 91 },
        ].map(({ week, score }) => (
          <div key={week} className="flex items-center justify-between gap-4">
            <span className="text-[#78716C]">{week}</span>
            <span className="font-semibold text-[#023c65]">{score}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HowItWorksPage() {
  return (
    <main className="bg-[#FAFAF9]">
      <HpNav />
      <HiwHero />

      <HiwStep
        stepNumber="01"
        label="STEP 01"
        headline="We ask AI the same questions your customers do."
        imageSrc="/Pages/nyc-feature-scanning.png"
        imageAlt="Manhattan skyscraper canyon worm's-eye view — impasto oil painting"
        imagePosition="right"
        glassBadge={<ScanningBadge />}
        body={
          <>
            <p>Not simulated. Not estimated. We fire real prompts across every major AI engine simultaneously.</p>
            <p>&ldquo;What&apos;s the best [your category] in [your city]?&rdquo;</p>
            <p>ChatGPT answers. Gemini answers. Perplexity answers. Claude answers. And so do the 6 others on your plan.</p>
            <p>We record: Are you mentioned? Where do you rank? What do they say about you? Who are your competitors in the answer — and where do they sit?</p>
            <p>Results come back in 60 seconds.</p>
          </>
        }
      />

      <HiwStep
        stepNumber="02"
        label="STEP 02"
        headline="Not a report. A diagnosis."
        imageSrc=""
        imageAlt=""
        imagePosition="none"
        scoreCard={<ScoreCard />}
        body={
          <>
            <p>Your Visibility Score — per engine, and composite.</p>
            <p>Who&apos;s outranking you. The specific reasons why. What&apos;s missing: schema, content, FAQ coverage, citations.</p>
            <p>Every gap is ranked by impact. You see exactly what to fix first — not a list of 40 things. The three that move the needle most.</p>
          </>
        }
      />

      <HiwStep
        stepNumber="03"
        label="STEP 03"
        headline="Work, not recommendations."
        imageSrc="/Pages/nyc-feature-agents.png"
        imageAlt="Brooklyn Bridge low-angle at sunset — impasto oil painting"
        imagePosition="right"
        glassBadge={<AgentsBadge />}
        body={
          <>
            <p>Most platforms end here. A dashboard. A list of things you should do. Good luck.</p>
            <p>Beamix runs agents that produce the deliverable.</p>
            <ul className="space-y-1 list-none">
              <li>Content Writer → a publish-ready page</li>
              <li>Schema Optimizer → a JSON-LD file, ready to install</li>
              <li>FAQ Agent → Q&amp;A pairs in the exact format AI searches</li>
              <li>Competitor Intelligence → specific gaps and how to close them</li>
            </ul>
            <p>You review it. You edit it. You publish it. Nothing goes live without your approval.</p>
          </>
        }
      />

      <HiwStep
        stepNumber="04"
        label="STEP 04"
        headline="The advantage compounds."
        imageSrc="/Pages/nyc-feature-rankings.png"
        imageAlt="Central Park aerial view — impasto oil painting"
        imagePosition="left"
        glassBadge={<RankingsBadge />}
        body={
          <>
            <p>48 hours after you publish — we rescan. Your Visibility Score updates. You see exactly what moved, and by how much.</p>
            <p>Week by week, the trend climbs. Not because we guessed — because the signals AI reads are being built, systematically, by your Beamix agents.</p>
            <p>The businesses winning AI search right now started this loop months ago.</p>
          </>
        }
      />

      <HiwGeoVsSeo />
      <HiwTheLoop />
      <HiwFinalCta
        headline="See your Visibility Score in 60 seconds."
        caption="No account. No credit card."
        ctaLabel="Scan My Business — Free"
      />
      <HpFooter />
    </main>
  )
}
