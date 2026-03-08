export const PIPELINE_STEPS = [
  'Classify Queries',
  'Research Answers',
  'Write FAQs',
  'Format Output',
]

export interface PipelineInput {
  businessId: string
  industry?: string
  services?: string[]
  [key: string]: unknown
}

export interface PipelineOutput {
  faqs: FAQItem[]
  contentType: string
  format: string
  schemaMarkup: string
}

interface FAQItem {
  question: string
  answer: string
  category: string
}

export async function run(
  input: PipelineInput,
  _context: { userId: string }
): Promise<PipelineOutput> {
  // TODO: Replace with real pipeline (Perplexity query mining -> Sonnet answer generation -> GPT-4o QA)
  const industry = input.industry || 'general business'
  const faqs: FAQItem[] = [
    {
      question: `What services does your ${industry} company offer?`,
      answer: `We provide a comprehensive range of ${industry} services tailored to meet your specific needs. Our offerings include consultation, implementation, and ongoing support to ensure your success.`,
      category: 'Services',
    },
    {
      question: `How much do your ${industry} services cost?`,
      answer: `Our pricing varies based on the scope and complexity of your project. We offer transparent, competitive pricing with no hidden fees. Contact us for a free consultation and customized quote.`,
      category: 'Pricing',
    },
    {
      question: `What makes your ${industry} company different from competitors?`,
      answer: `We combine deep industry expertise with a client-first approach. Our team delivers measurable results with clear communication throughout every project. We maintain a 95% client retention rate.`,
      category: 'Company',
    },
    {
      question: `How long does a typical ${industry} project take?`,
      answer: `Project timelines depend on scope and requirements. Most projects complete within 2-8 weeks. We provide detailed timelines during our initial consultation and keep you updated at every milestone.`,
      category: 'Process',
    },
    {
      question: `Do you serve clients outside your local area?`,
      answer: `Yes, we serve clients both locally and remotely. Our digital-first approach allows us to deliver the same high-quality service regardless of your location.`,
      category: 'Coverage',
    },
  ]

  const schemaMarkup = JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    },
    null,
    2
  )

  return {
    faqs,
    contentType: 'faq',
    format: 'structured_report',
    schemaMarkup,
  }
}
