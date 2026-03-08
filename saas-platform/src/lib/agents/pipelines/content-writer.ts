export const PIPELINE_STEPS = [
  'Research Topic',
  'Generate Outline',
  'Write Draft',
  'Refine & Polish',
  'QA Check',
]

export interface PipelineInput {
  businessId: string
  topic?: string
  keywords?: string[]
  [key: string]: unknown
}

export interface PipelineOutput {
  title: string
  content: string
  contentType: string
  format: string
  wordCount: number
}

export async function run(
  input: PipelineInput,
  _context: { userId: string }
): Promise<PipelineOutput> {
  // TODO: Replace with real LLM pipeline (Perplexity research -> Sonnet draft -> Sonnet refine -> GPT-4o QA)
  const topic = input.topic || 'AI Search Visibility'
  return {
    title: `How to Improve Your ${topic} Strategy`,
    content: `# How to Improve Your ${topic} Strategy

In today's AI-driven search landscape, businesses need to adapt their content strategy to remain visible across ChatGPT, Gemini, Perplexity, and other AI engines.

## Key Strategies

1. **Optimize for citations** -- AI engines prefer authoritative, well-structured content that can be directly quoted in responses.
2. **Use schema markup** -- Structured data helps AI models understand your business context, services, and expertise.
3. **Build FAQ pages** -- Direct question-answer formats are heavily favored by AI search engines when generating responses.
4. **Create topical authority** -- Cluster your content around core topics to signal deep expertise to AI models.
5. **Maintain freshness** -- AI engines prioritize recently updated, accurate information over stale content.

## Implementation Roadmap

Start by auditing your existing content for AI-friendliness. Then prioritize pages that drive the most business value. Focus on clarity, structure, and factual accuracy above all else.

## Conclusion

By implementing these strategies, your business can significantly improve its visibility across AI search engines and capture traffic that competitors are missing.`,
    contentType: 'article',
    format: 'markdown',
    wordCount: 450,
  }
}
