export const PIPELINE_STEPS = [
  'Research Topic',
  'Generate Outline',
  'Expand Sections',
  'Polish Prose',
  'SEO Optimize',
  'QA Check',
]

export interface PipelineInput {
  businessId: string
  topic?: string
  keywords?: string[]
  targetLength?: number
  [key: string]: unknown
}

export interface PipelineOutput {
  title: string
  content: string
  contentType: string
  format: string
  wordCount: number
  metaDescription: string
  suggestedSlug: string
}

export async function run(
  input: PipelineInput,
  _context: { userId: string }
): Promise<PipelineOutput> {
  // TODO: Replace with real LLM pipeline (Perplexity research -> Sonnet outline -> Sonnet expand -> GPT-4o QA)
  const topic = input.topic || 'GEO for Small Businesses'
  const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return {
    title: `The Complete Guide to ${topic} in 2026`,
    content: `# The Complete Guide to ${topic} in 2026

AI search engines are reshaping how customers discover businesses. If your company isn't optimized for Generative Engine Optimization (GEO), you're invisible to a growing segment of searchers.

## What is GEO?

Generative Engine Optimization is the practice of structuring your online presence so that AI-powered search engines -- ChatGPT, Gemini, Perplexity, and others -- cite, recommend, and surface your business in their responses.

Unlike traditional SEO, GEO focuses on:
- **Citation-worthiness** -- Is your content authoritative enough to be quoted?
- **Structured clarity** -- Can an AI model parse and understand your offerings?
- **Entity recognition** -- Does your business exist as a distinct entity in AI knowledge?

## Why Small Businesses Should Care

While enterprise companies invest millions in AI visibility, small businesses have a unique advantage: agility. You can implement GEO strategies faster than any Fortune 500 competitor.

### The Numbers

- 40% of Gen Z prefers AI search over Google
- AI-cited businesses see 3x higher conversion rates
- 65% of AI recommendations go to businesses with structured data

## 5 Steps to Get Started

### 1. Audit Your Current AI Visibility
Run a scan across major AI engines to see where you currently appear (and where you don't).

### 2. Fix Your Schema Markup
Add JSON-LD structured data for your business type, services, reviews, and FAQs.

### 3. Create Citation-Worthy Content
Write authoritative, fact-based content that AI engines want to quote directly.

### 4. Build Your FAQ Foundation
AI engines love well-structured Q&A content. Create comprehensive FAQ pages.

### 5. Monitor and Iterate
Track your AI visibility weekly and adjust your strategy based on results.

## Conclusion

GEO isn't optional anymore -- it's the next frontier of digital marketing. Start today, and you'll be ahead of 90% of your competitors.`,
    contentType: 'blog_post',
    format: 'markdown',
    wordCount: 1200,
    metaDescription: `Learn how ${topic} can transform your online visibility in AI search engines like ChatGPT, Gemini, and Perplexity.`,
    suggestedSlug: slug,
  }
}
