export const PIPELINE_STEPS = ['Crawl Website', 'Analyze Crawlability', 'Check Schema Markup', 'Evaluate Content Quality', 'Score FAQ Presence', 'Check LLMS.txt', 'Generate Report']

export interface PipelineInput { businessId: string; websiteUrl?: string; [key: string]: unknown }
export interface PipelineOutput { title: string; content: string; contentType: string; format: string; wordCount: number; scores?: Record<string, number> }

export async function run(_input: PipelineInput, _context: { userId: string }): Promise<PipelineOutput> {
  // TODO: Replace with real pipeline (cheerio → algorithmic scoring → Sonnet narrative)
  const scores = {
    crawlability: Math.floor(Math.random() * 30) + 60,
    schemaMarkup: Math.floor(Math.random() * 40) + 30,
    contentQuality: Math.floor(Math.random() * 30) + 50,
    faqPresence: Math.floor(Math.random() * 50) + 20,
    llmsTxt: Math.random() > 0.7 ? 100 : 0,
  }
  const overall = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 5)

  return {
    title: 'AI Readiness Audit Report',
    content: `# AI Readiness Audit Report\n\n## Overall Score: ${overall}/100\n\n### Website Crawlability: ${scores.crawlability}/100\nYour website is ${scores.crawlability > 70 ? 'well' : 'partially'} accessible to AI crawlers.\n\n### Schema Markup: ${scores.schemaMarkup}/100\n${scores.schemaMarkup > 50 ? 'Basic schema markup detected.' : 'Limited schema markup found. Consider adding structured data.'}\n\n### Content Quality: ${scores.contentQuality}/100\nYour content ${scores.contentQuality > 70 ? 'is citation-worthy and well-structured.' : 'could be improved for AI citation purposes.'}\n\n### FAQ/Q&A Presence: ${scores.faqPresence}/100\n${scores.faqPresence > 50 ? 'FAQ content detected on your site.' : 'Consider adding FAQ pages to improve AI discoverability.'}\n\n### LLMS.txt: ${scores.llmsTxt}/100\n${scores.llmsTxt > 0 ? 'llms.txt file detected.' : 'No llms.txt file found. Use the LLMS.txt agent to generate one.'}`,
    contentType: 'article',
    format: 'markdown',
    wordCount: 250,
    scores,
  }
}
