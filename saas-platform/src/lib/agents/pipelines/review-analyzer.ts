export const PIPELINE_STEPS = [
  'Fetch Reviews',
  'Analyze Sentiment',
  'Generate Response Templates',
  'QA Check',
]

export interface PipelineInput {
  businessId: string
  reviewSources?: string[]
  [key: string]: unknown
}

export interface PipelineOutput {
  analysis: ReviewAnalysis
  responseTemplates: ResponseTemplate[]
  contentType: string
  format: string
}

interface ReviewAnalysis {
  totalReviewed: number
  averageSentiment: number
  topStrengths: string[]
  topWeaknesses: string[]
  sentimentBreakdown: { positive: number; neutral: number; negative: number }
  keyThemes: { theme: string; count: number; sentiment: 'positive' | 'neutral' | 'negative' }[]
}

interface ResponseTemplate {
  reviewType: 'positive' | 'neutral' | 'negative'
  template: string
  personalizationHints: string[]
}

export async function run(
  input: PipelineInput,
  _context: { userId: string }
): Promise<PipelineOutput> {
  // TODO: Replace with real pipeline (scrape reviews -> Sonnet sentiment analysis -> Sonnet template generation -> QA)
  const sources = input.reviewSources || ['Google', 'Yelp']
  return {
    analysis: {
      totalReviewed: 47,
      averageSentiment: 0.72,
      topStrengths: [
        'Responsive customer service',
        'High quality work',
        'Professional team',
      ],
      topWeaknesses: [
        'Longer wait times during peak seasons',
        'Pricing could be more transparent',
      ],
      sentimentBreakdown: { positive: 34, neutral: 8, negative: 5 },
      keyThemes: [
        { theme: 'Customer Service', count: 23, sentiment: 'positive' },
        { theme: 'Quality', count: 18, sentiment: 'positive' },
        { theme: 'Pricing', count: 12, sentiment: 'neutral' },
        { theme: 'Wait Time', count: 8, sentiment: 'negative' },
        { theme: 'Professionalism', count: 15, sentiment: 'positive' },
      ],
    },
    responseTemplates: [
      {
        reviewType: 'positive',
        template: `Thank you so much for your kind words, [CUSTOMER_NAME]! We're thrilled to hear about your experience with [SPECIFIC_SERVICE]. Our team takes great pride in delivering quality results, and feedback like yours motivates us to keep raising the bar. We look forward to working with you again!`,
        personalizationHints: [
          'Reference the specific service mentioned',
          'Mention the team member if named',
          'Invite them back for a related service',
        ],
      },
      {
        reviewType: 'neutral',
        template: `Hi [CUSTOMER_NAME], thank you for taking the time to share your experience. We appreciate your honest feedback about [TOPIC]. We're always looking to improve, and your insights help us do that. We'd love the chance to exceed your expectations next time -- please don't hesitate to reach out directly if there's anything we can do better.`,
        personalizationHints: [
          'Acknowledge the specific concern raised',
          'Offer a concrete improvement step',
          'Provide direct contact for follow-up',
        ],
      },
      {
        reviewType: 'negative',
        template: `Hi [CUSTOMER_NAME], we sincerely apologize for the experience you described. This doesn't reflect the standard we hold ourselves to. We'd like to make this right -- could you contact us at [EMAIL/PHONE] so we can discuss how to resolve this? Your satisfaction is our top priority.`,
        personalizationHints: [
          'Acknowledge the specific issue without being defensive',
          'Take ownership of the problem',
          'Move the conversation to a private channel',
        ],
      },
    ],
    contentType: 'review_analysis',
    format: 'structured_report',
  }
}
