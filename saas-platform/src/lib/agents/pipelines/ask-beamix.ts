export const PIPELINE_STEPS = ['Process Query', 'Generate Response']

export interface PipelineInput { businessId: string; message: string; conversationHistory?: Array<{ role: string; content: string }>; [key: string]: unknown }
export interface PipelineOutput { title: string; content: string; contentType: string; format: string; wordCount: number }

export async function run(_input: PipelineInput, _context: { userId: string }): Promise<PipelineOutput> {
  // TODO: Replace with real Sonnet streaming SSE
  return {
    title: 'Ask Beamix Response',
    content: `Great question! Here are some strategies to improve your AI search visibility:\n\n1. **Create citation-worthy content** — AI engines prefer authoritative, well-researched content with clear facts and data points.\n\n2. **Add structured data** — Schema markup helps AI understand your business context, services, and expertise.\n\n3. **Build FAQ pages** — AI engines frequently pull from Q&A formatted content to answer user queries.\n\n4. **Generate an llms.txt file** — This newer standard helps AI crawlers understand your business at a glance.\n\n5. **Monitor and iterate** — Use Beamix scans regularly to track your progress and identify new opportunities.\n\nWould you like me to dive deeper into any of these strategies?`,
    contentType: 'article',
    format: 'markdown',
    wordCount: 150,
  }
}
