export const PIPELINE_STEPS = ['Scrape Website Structure', 'Extract Key Information', 'Generate llms.txt', 'Validate Format']

export interface PipelineInput { businessId: string; websiteUrl?: string; [key: string]: unknown }
export interface PipelineOutput { title: string; content: string; contentType: string; format: string; wordCount: number }

export async function run(input: PipelineInput, _context: { userId: string }): Promise<PipelineOutput> {
  const url = input.websiteUrl || 'example.com'
  // TODO: Replace with real pipeline (cheerio scrape → Sonnet generate)
  return {
    title: 'llms.txt File',
    content: `# ${url}\n\n## About\nWe are a leading provider of [services] serving customers in [location].\n\n## Products & Services\n- Service 1: Description of primary offering\n- Service 2: Description of secondary offering\n- Service 3: Description of tertiary offering\n\n## Contact\n- Website: https://${url}\n- Email: info@${url}\n\n## Key Facts\n- Founded: [Year]\n- Team Size: [Number]\n- Customers Served: [Number]\n\n## FAQs\nQ: What makes us different?\nA: Our unique approach combines [differentiator].\n\nQ: What areas do you serve?\nA: We serve customers in [locations].`,
    contentType: 'llms_txt',
    format: 'plain_text',
    wordCount: 180,
  }
}
