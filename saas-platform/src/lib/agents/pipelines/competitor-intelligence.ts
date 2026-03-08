export const PIPELINE_STEPS = [
  'Multi-Engine Scan',
  'Analyze Gaps',
  'Generate Report',
]

export interface PipelineInput {
  businessId: string
  competitors?: string[]
  engines?: string[]
  [key: string]: unknown
}

export interface PipelineOutput {
  report: CompetitorReport
  contentType: string
  format: string
}

interface EnginePresence {
  engine: string
  isMentioned: boolean
  rankPosition: number | null
  sentiment: 'positive' | 'neutral' | 'negative' | null
  citationContext: string | null
}

interface CompetitorProfile {
  name: string
  website: string
  enginePresence: EnginePresence[]
  strengths: string[]
  weaknesses: string[]
  overallScore: number
}

interface CompetitorReport {
  yourBusiness: CompetitorProfile
  competitors: CompetitorProfile[]
  gaps: GapAnalysis[]
  recommendations: string[]
  generatedAt: string
}

interface GapAnalysis {
  area: string
  yourStatus: string
  competitorStatus: string
  priority: 'high' | 'medium' | 'low'
  actionItem: string
}

export async function run(
  input: PipelineInput,
  _context: { userId: string }
): Promise<PipelineOutput> {
  // TODO: Replace with real pipeline (multi-engine scan -> Sonnet gap analysis -> Sonnet report generation)
  const competitors = input.competitors || ['Competitor A', 'Competitor B']
  const engines = input.engines || ['ChatGPT', 'Gemini', 'Perplexity']
  return {
    report: {
      yourBusiness: {
        name: 'Your Business',
        website: 'https://yourbusiness.com',
        enginePresence: engines.map((engine, i) => ({
          engine,
          isMentioned: i < 1,
          rankPosition: i < 1 ? 4 : null,
          sentiment: i < 1 ? ('neutral' as const) : null,
          citationContext: i < 1 ? 'Mentioned in a list of local providers' : null,
        })),
        strengths: ['Strong Google reviews', 'Established local presence'],
        weaknesses: [
          'No schema markup on website',
          'Limited AI engine visibility',
          'No FAQ page',
        ],
        overallScore: 32,
      },
      competitors: competitors.map((name, idx) => ({
        name,
        website: `https://${name.toLowerCase().replace(/\s+/g, '')}.com`,
        enginePresence: engines.map((engine) => ({
          engine,
          isMentioned: idx === 0 || engine === 'ChatGPT',
          rankPosition: idx === 0 ? 2 : 5,
          sentiment: 'positive' as const,
          citationContext: `Recommended as a top ${name.toLowerCase()} provider`,
        })),
        strengths:
          idx === 0
            ? ['Full schema markup', 'Active blog with AI-optimized content', 'Strong FAQ section']
            : ['Good review volume', 'Active social media presence'],
        weaknesses:
          idx === 0
            ? ['Higher pricing', 'Slower response time']
            : ['Outdated website', 'No structured data'],
        overallScore: idx === 0 ? 78 : 45,
      })),
      gaps: [
        {
          area: 'Schema Markup',
          yourStatus: 'Not implemented',
          competitorStatus: `${competitors[0]} has full JSON-LD coverage`,
          priority: 'high',
          actionItem: 'Add LocalBusiness, Service, and FAQPage schema to your website immediately.',
        },
        {
          area: 'FAQ Content',
          yourStatus: 'No FAQ page',
          competitorStatus: `${competitors[0]} has 25+ FAQ entries with schema markup`,
          priority: 'high',
          actionItem: 'Create a comprehensive FAQ page covering your top 15 customer questions.',
        },
        {
          area: 'AI Engine Coverage',
          yourStatus: `Mentioned in 1/${engines.length} engines`,
          competitorStatus: `${competitors[0]} mentioned in ${engines.length}/${engines.length} engines`,
          priority: 'high',
          actionItem: 'Improve content authority and structured data to increase AI engine mentions.',
        },
        {
          area: 'Review Response Rate',
          yourStatus: '40% response rate',
          competitorStatus: `${competitors[0]} has 95% response rate`,
          priority: 'medium',
          actionItem: 'Respond to all reviews within 24 hours to signal active engagement.',
        },
      ],
      recommendations: [
        'Immediately implement schema markup across all pages -- this is your biggest gap.',
        'Create 15-20 FAQ entries targeting common customer questions in your industry.',
        'Publish 2 authoritative blog posts per month focused on your core services.',
        'Respond to every customer review within 24 hours.',
        'Ensure NAP (Name, Address, Phone) consistency across all online directories.',
      ],
      generatedAt: new Date().toISOString(),
    },
    contentType: 'competitor_report',
    format: 'structured_report',
  }
}
