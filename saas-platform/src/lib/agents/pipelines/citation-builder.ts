export const PIPELINE_STEPS = ['Extract Citation Targets', 'Find Contact Information', 'Write Outreach Templates', 'QA Check']

export interface PipelineInput { businessId: string; targetUrls?: string[]; [key: string]: unknown }
export interface PipelineOutput { title: string; content: string; contentType: string; format: string; wordCount: number }

export async function run(_input: PipelineInput, _context: { userId: string }): Promise<PipelineOutput> {
  // TODO: Replace with real pipeline (Haiku extract → Perplexity find contacts → Sonnet outreach)
  return {
    title: 'Citation Outreach Templates',
    content: `# Citation Outreach Templates\n\n## Template 1: Expert Commentary\n\nSubject: Expert insight for your upcoming article\n\nHi [Editor Name],\n\nI noticed your recent article on [Topic] and wanted to offer some expert commentary from our team...\n\n## Template 2: Data Contribution\n\nSubject: Exclusive data for your readers\n\nHi [Editor Name],\n\nWe recently compiled data on [Topic] that your readers might find valuable...\n\n## Template 3: Guest Post Pitch\n\nSubject: Guest post idea: [Topic]\n\nHi [Editor Name],\n\nI'd love to contribute a piece on [Topic] for your publication...`,
    contentType: 'outreach_template',
    format: 'markdown',
    wordCount: 320,
  }
}
