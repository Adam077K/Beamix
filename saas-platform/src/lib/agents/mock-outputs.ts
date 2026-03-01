/**
 * Mock output generators for each agent type.
 * These produce realistic content for MVP demo purposes.
 * Phase 7+ will replace with actual LLM calls.
 */

interface AgentContext {
  businessName: string
  businessUrl?: string
  industry?: string
  location?: string
  userPrompt: string
}

interface ContentOutput {
  type: 'content'
  contentType:
    | 'blog_post'
    | 'article'
    | 'faq'
    | 'product_description'
    | 'landing_page'
    | 'schema_markup'
    | 'social_post'
    | 'review_response'
  title: string
  content: string
  format: 'markdown' | 'html' | 'json' | 'json-ld'
  wordCount: number
}

interface StructuredOutput {
  type: 'structured'
  outputType:
    | 'competitor_report'
    | 'query_suggestions'
    | 'review_analysis'
    | 'social_strategy'
    | 'schema_recommendations'
  title: string
  summary: string
  data: Record<string, unknown>
}

export type AgentOutput = ContentOutput | StructuredOutput

function generateBlogPost(ctx: AgentContext): ContentOutput {
  const title = `How ${ctx.businessName} Can Dominate AI Search in ${ctx.industry ?? 'Your Industry'}`
  const content = `# ${title}

## Introduction

AI search engines are fundamentally changing how customers discover businesses like ${ctx.businessName}. Unlike traditional search, AI platforms like ChatGPT, Gemini, and Perplexity synthesize information from across the web to provide direct answers. If your business isn't part of those answers, you're invisible to a growing segment of potential customers.

## Why AI Search Visibility Matters for ${ctx.industry ?? 'Your Industry'}

The shift from traditional search to AI-powered discovery is accelerating. Here's what the data tells us:

- **62% of consumers** now use AI assistants for purchase research at least once a week
- **AI-first discovery** is projected to capture 30% of all commercial search queries by 2027
- Businesses that appear in AI answers see **3.2x higher conversion rates** than those relying on traditional SEO alone

For ${ctx.businessName}${ctx.location ? ` in ${ctx.location}` : ''}, this represents both a challenge and an opportunity.

## 5 Strategies to Improve Your AI Search Presence

### 1. Structured Data Markup

AI engines heavily rely on structured data to understand your business. Implementing comprehensive JSON-LD schema markup for your website helps AI systems accurately categorize and reference your services.

**Action item:** Add LocalBusiness, Product, and FAQ schema to every key page on your website.

### 2. Authority Content Creation

AI models favor content that demonstrates expertise, authority, and trustworthiness. Creating in-depth guides, case studies, and comparison content positions ${ctx.businessName} as a credible source.

**Action item:** Publish 2-3 long-form articles per month targeting the exact questions your customers ask AI engines.

### 3. Review and Reputation Management

AI engines aggregate sentiment from review platforms to assess business quality. A strong, consistent review profile across Google, Yelp, and industry-specific platforms directly influences AI recommendations.

**Action item:** Implement a systematic review collection process and respond to all reviews within 24 hours.

### 4. Technical SEO for AI Crawlers

Many AI engines use web crawlers similar to (but distinct from) Google's. Ensuring your site is accessible, fast, and well-organized helps these crawlers index your content effectively.

**Action item:** Audit your robots.txt, sitemap.xml, and page load times. Ensure your content is rendered server-side, not hidden behind JavaScript.

### 5. Multi-Platform Presence

AI models aggregate information from diverse sources. Having consistent, detailed business information across directories, social platforms, and industry databases increases your chances of being cited.

**Action item:** Audit your NAP (Name, Address, Phone) consistency across all platforms and fill in any gaps.

## Building a Citation-Worthy Brand

The businesses that win in AI search are those that become the definitive source for their niche. For ${ctx.businessName}, this means:

1. **Being the answer** to industry-specific questions
2. **Earning mentions** from authoritative third-party sources
3. **Maintaining freshness** with regularly updated content and data
4. **Building social proof** through reviews, testimonials, and case studies

## Measuring Your AI Search Performance

Track these key metrics monthly:

| Metric | Target |
|--------|--------|
| AI engine mentions | +20% per quarter |
| Average citation position | Top 3 |
| Brand sentiment in AI responses | Positive |
| Organic traffic from AI referrals | +15% per month |

## Next Steps

${ctx.businessName} is uniquely positioned to capitalize on the AI search revolution in ${ctx.industry ?? 'your industry'}${ctx.location ? ` in ${ctx.location}` : ''}. The businesses that act now will establish dominant positions before their competitors catch up.

Start by running a comprehensive AI visibility scan to benchmark your current position, then implement the strategies above systematically.

---

*This article was generated by Beamix AI based on your business profile and industry analysis. Edit and customize to match your brand voice before publishing.*`

  return {
    type: 'content',
    contentType: 'blog_post',
    title,
    content,
    format: 'markdown',
    wordCount: content.split(/\s+/).length,
  }
}

function generateLandingPage(ctx: AgentContext): ContentOutput {
  const title = `${ctx.businessName} — ${ctx.industry ?? 'Professional Services'}${ctx.location ? ` in ${ctx.location}` : ''}`
  const content = `# ${ctx.businessName}

## Your Trusted ${ctx.industry ?? 'Business'} Partner${ctx.location ? ` in ${ctx.location}` : ''}

We help businesses like yours achieve exceptional results through proven expertise and personalized service.

---

### Why Choose ${ctx.businessName}?

**Experience That Matters**
With deep expertise in ${ctx.industry ?? 'our field'}, we understand the unique challenges and opportunities your business faces.

**Results-Driven Approach**
Every strategy we implement is measured, refined, and optimized for maximum impact on your bottom line.

**Local Expertise${ctx.location ? `, ${ctx.location} Focus` : ''}**
We know your market inside and out. Our solutions are tailored to the specific dynamics of your area and customer base.

---

### Our Services

#### Service 1: Core Offering
Describe your primary service or product offering here. Focus on the transformation you provide, not just the features.

#### Service 2: Supporting Service
Detail your secondary offering that complements the core service and provides additional value to clients.

#### Service 3: Specialized Expertise
Highlight any niche or specialized capabilities that set ${ctx.businessName} apart from competitors.

---

### What Our Clients Say

> "${ctx.businessName} transformed our approach to [specific area]. The results speak for themselves."
> — Happy Client, ${ctx.location ?? 'Local Business Owner'}

> "Professional, responsive, and genuinely invested in our success. Highly recommended."
> — Satisfied Customer

---

### Frequently Asked Questions

**What areas do you serve?**
We serve ${ctx.location ?? 'clients locally and nationally'}, with a focus on delivering exceptional results to every client regardless of location.

**How do I get started?**
Contact us for a free consultation. We'll assess your needs and create a customized plan to help you achieve your goals.

**What makes you different from competitors?**
Our combination of ${ctx.industry ?? 'industry'} expertise, data-driven approach, and genuine commitment to client success sets us apart.

---

### Ready to Get Started?

**Contact ${ctx.businessName} today** for a free consultation.

${ctx.businessUrl ? `Visit us at ${ctx.businessUrl}` : 'Contact us to learn more.'}

---

*Content optimized for AI search visibility by Beamix. Edit to match your brand voice and specific offerings.*`

  return {
    type: 'content',
    contentType: 'landing_page',
    title,
    content,
    format: 'markdown',
    wordCount: content.split(/\s+/).length,
  }
}

function generateSchemaMarkup(ctx: AgentContext): ContentOutput {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: ctx.businessName,
    url: ctx.businessUrl ?? `https://${ctx.businessName.toLowerCase().replace(/\s+/g, '')}.com`,
    ...(ctx.location && {
      address: {
        '@type': 'PostalAddress',
        addressLocality: ctx.location,
      },
    }),
    ...(ctx.industry && {
      description: `${ctx.businessName} provides professional ${ctx.industry.toLowerCase()} services${ctx.location ? ` in ${ctx.location}` : ''}.`,
    }),
    priceRange: '$$',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    sameAs: [],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '127',
      bestRating: '5',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${ctx.businessName} Services`,
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: `${ctx.industry ?? 'Professional'} Consultation`,
            description: `Expert ${ctx.industry?.toLowerCase() ?? 'professional'} consultation tailored to your needs.`,
          },
        },
      ],
    },
  }

  const title = `JSON-LD Schema for ${ctx.businessName}`
  const content = JSON.stringify(schema, null, 2)

  return {
    type: 'content',
    contentType: 'schema_markup',
    title,
    content,
    format: 'json-ld',
    wordCount: content.split(/\s+/).length,
  }
}

function generateReviewAnalysis(ctx: AgentContext): StructuredOutput {
  const data = {
    businessName: ctx.businessName,
    analysisDate: new Date().toISOString().split('T')[0],
    platforms: [
      {
        name: 'Google Business Profile',
        totalReviews: 127,
        averageRating: 4.6,
        sentiment: { positive: 78, neutral: 14, negative: 8 },
        topThemes: ['professional service', 'quick response', 'fair pricing', 'knowledgeable staff'],
        recentTrend: 'improving',
      },
      {
        name: 'Yelp',
        totalReviews: 43,
        averageRating: 4.3,
        sentiment: { positive: 65, neutral: 20, negative: 15 },
        topThemes: ['quality work', 'good communication', 'wait times'],
        recentTrend: 'stable',
      },
      {
        name: 'Facebook',
        totalReviews: 31,
        averageRating: 4.8,
        sentiment: { positive: 85, neutral: 10, negative: 5 },
        topThemes: ['friendly staff', 'recommend to others', 'great experience'],
        recentTrend: 'improving',
      },
    ],
    overallSentiment: {
      score: 82,
      label: 'Very Positive',
      aiImpact: 'Strong positive signal for AI search engines. Your review profile is a competitive advantage.',
    },
    recommendations: [
      {
        priority: 'high',
        action: 'Respond to all negative reviews within 24 hours',
        reason: 'AI engines analyze response patterns. Active engagement signals business credibility.',
      },
      {
        priority: 'high',
        action: 'Increase review volume on Yelp',
        reason: 'Yelp reviews are weighted heavily by AI engines for local business recommendations.',
      },
      {
        priority: 'medium',
        action: 'Encourage reviews mentioning specific services',
        reason: 'Service-specific mentions help AI engines match you to relevant queries.',
      },
      {
        priority: 'medium',
        action: 'Add review schema markup to your website',
        reason: 'AggregateRating schema helps AI crawlers surface your review data.',
      },
    ],
    responseTemplates: {
      positive: `Thank you for your wonderful review! At ${ctx.businessName}, we pride ourselves on [specific aspect mentioned]. We're thrilled to hear about your positive experience and look forward to serving you again.`,
      negative: `We sincerely apologize for your experience. At ${ctx.businessName}, we take all feedback seriously. We'd love the opportunity to make this right. Please reach out to us directly at [contact] so we can address your concerns personally.`,
      neutral: `Thank you for taking the time to share your feedback. We appreciate your honest assessment and are always looking for ways to improve. If there's anything specific we can do better, please don't hesitate to let us know.`,
    },
  }

  return {
    type: 'structured',
    outputType: 'review_analysis',
    title: `Review Analysis for ${ctx.businessName}`,
    summary: `Analyzed 201 reviews across 3 platforms. Overall sentiment score: 82/100 (Very Positive). ${ctx.businessName} has a strong review profile that positively impacts AI search visibility. Key action: increase Yelp review volume and respond to all negative reviews within 24 hours.`,
    data,
  }
}

function generateSocialStrategy(ctx: AgentContext): StructuredOutput {
  const data = {
    businessName: ctx.businessName,
    industry: ctx.industry ?? 'General',
    strategyPeriod: '30-day content calendar',
    platforms: ['LinkedIn', 'Instagram', 'X (Twitter)', 'Facebook'],
    contentPillars: [
      {
        name: 'Expertise Showcase',
        percentage: 40,
        description: 'Demonstrate deep knowledge in your field to build authority signals',
        examples: ['Industry insights', 'How-to guides', 'Myth-busting posts'],
      },
      {
        name: 'Social Proof',
        percentage: 25,
        description: 'Leverage customer success to build trust and credibility',
        examples: ['Case studies', 'Testimonials', 'Before/after results'],
      },
      {
        name: 'Community Engagement',
        percentage: 20,
        description: 'Build relationships and increase brand mentions',
        examples: ['Polls and questions', 'Industry news commentary', 'Local community involvement'],
      },
      {
        name: 'Behind the Scenes',
        percentage: 15,
        description: 'Humanize your brand and build authentic connections',
        examples: ['Team spotlights', 'Process reveals', 'Company culture'],
      },
    ],
    weeklyCalendar: [
      { day: 'Monday', platform: 'LinkedIn', type: 'Expertise', topic: `Weekly ${ctx.industry ?? 'industry'} insight or trend analysis` },
      { day: 'Tuesday', platform: 'Instagram', type: 'Social Proof', topic: 'Customer success story or testimonial' },
      { day: 'Wednesday', platform: 'X', type: 'Engagement', topic: 'Industry question or poll for followers' },
      { day: 'Thursday', platform: 'LinkedIn', type: 'Expertise', topic: 'How-to guide or best practices post' },
      { day: 'Friday', platform: 'Instagram', type: 'Behind the Scenes', topic: 'Team or process spotlight' },
    ],
    samplePosts: [
      {
        platform: 'LinkedIn',
        content: `Many ${ctx.industry?.toLowerCase() ?? 'business'} owners don't realize that AI search engines are now recommending businesses based on their social media authority signals.\n\nHere are 3 things we've learned at ${ctx.businessName}:\n\n1. Consistent expertise content > viral posts\n2. Engagement quality matters more than follower count\n3. Cross-platform presence amplifies AI visibility\n\nWhat's your strategy for AI-era discovery? Share below.`,
      },
      {
        platform: 'Instagram',
        content: `Another day, another happy client at ${ctx.businessName}.\n\nSwipe to see the transformation we delivered for [Client Name].\n\nWhen AI engines look for recommendations in ${ctx.industry?.toLowerCase() ?? 'our field'}, they analyze social proof from real customer experiences.\n\nThat's why we document every success story.\n\n#${ctx.businessName.replace(/\s+/g, '')} #AISearch #${ctx.industry?.replace(/\s+/g, '') ?? 'Business'}`,
      },
    ],
    aiVisibilityTips: [
      'Use your exact business name consistently across all platforms',
      'Include location mentions in posts to strengthen local AI associations',
      'Link back to your website from social posts to build crawlable connections',
      'Engage with industry conversations to increase brand mention frequency',
    ],
  }

  return {
    type: 'structured',
    outputType: 'social_strategy',
    title: `30-Day Social Media Strategy for ${ctx.businessName}`,
    summary: `Created a 30-day social media strategy across 4 platforms with 4 content pillars. Focus on building authority signals that AI search engines value: expertise content (40%), social proof (25%), community engagement (20%), and brand authenticity (15%). Includes weekly calendar and 2 ready-to-post sample content pieces.`,
    data,
  }
}

function generateCompetitorReport(ctx: AgentContext): StructuredOutput {
  const data = {
    businessName: ctx.businessName,
    analysisDate: new Date().toISOString().split('T')[0],
    industry: ctx.industry ?? 'General',
    location: ctx.location ?? 'N/A',
    competitors: [
      {
        name: `${ctx.industry ?? 'Top'} Pro Services`,
        website: `www.${(ctx.industry ?? 'top').toLowerCase().replace(/\s+/g, '')}proservices.com`,
        aiVisibilityScore: 72,
        strengths: [
          'Strong blog with 200+ articles',
          'Comprehensive JSON-LD schema',
          'High review volume (400+ Google reviews)',
          'Active LinkedIn presence with 15K followers',
        ],
        weaknesses: [
          'Inconsistent NAP across directories',
          'No FAQ schema markup',
          'Low social media engagement rate',
        ],
        aiMentionRate: '34% of relevant queries',
      },
      {
        name: `${ctx.location ?? 'City'} ${ctx.industry ?? 'Business'} Group`,
        website: `www.${(ctx.location ?? 'city').toLowerCase().replace(/\s+/g, '')}${(ctx.industry ?? 'biz').toLowerCase().replace(/\s+/g, '')}.com`,
        aiVisibilityScore: 58,
        strengths: [
          'Strong local directory presence',
          'Good Google Business Profile optimization',
          'Regular blog posts (2-3 per month)',
        ],
        weaknesses: [
          'Weak schema markup',
          'No competitor content strategy',
          'Limited social proof on website',
          'Slow website load times',
        ],
        aiMentionRate: '18% of relevant queries',
      },
      {
        name: `Elite ${ctx.industry ?? 'Service'} Solutions`,
        website: `www.elite${(ctx.industry ?? 'service').toLowerCase().replace(/\s+/g, '')}solutions.com`,
        aiVisibilityScore: 65,
        strengths: [
          'Professional website with fast load times',
          'Video content on YouTube (50+ videos)',
          'Strong brand mentions in industry publications',
        ],
        weaknesses: [
          'Low review count (45 reviews)',
          'No structured data markup',
          'Blog posts are thin (under 500 words)',
          'No social media strategy',
        ],
        aiMentionRate: '22% of relevant queries',
      },
    ],
    yourPosition: {
      currentScore: 45,
      ranking: '4th of 4 analyzed',
      biggestGaps: [
        'Content volume and depth',
        'Structured data implementation',
        'Review volume and diversity',
      ],
      quickWins: [
        'Add comprehensive JSON-LD schema (can leapfrog 2 competitors)',
        'Publish 4 in-depth blog posts this month',
        'Start a review acquisition campaign',
      ],
    },
    marketInsights: {
      totalAIQueryVolume: 'Estimated 2,400 AI queries/month for your niche',
      currentCapture: '~3% mention rate',
      opportunitySize: 'Potential to capture 15-20% within 90 days with focused effort',
      trendDirection: 'Growing — AI query volume up 45% vs. 6 months ago',
    },
  }

  return {
    type: 'structured',
    outputType: 'competitor_report',
    title: `Competitive Intelligence Report for ${ctx.businessName}`,
    summary: `Analyzed 3 key competitors in ${ctx.industry ?? 'your industry'}${ctx.location ? ` in ${ctx.location}` : ''}. ${ctx.businessName} currently ranks 4th with a score of 45/100. Biggest opportunity: implementing JSON-LD schema and content strategy can help overtake 2 competitors within 90 days. The AI search query market in your niche is growing at 45% and represents ~2,400 queries/month.`,
    data,
  }
}

function generateQuerySuggestions(ctx: AgentContext): StructuredOutput {
  const industry = ctx.industry?.toLowerCase() ?? 'business'
  const location = ctx.location ?? 'your area'

  const data = {
    businessName: ctx.businessName,
    industry: ctx.industry ?? 'General',
    location: ctx.location ?? 'N/A',
    discoveredQueries: [
      {
        query: `best ${industry} near me`,
        estimatedVolume: 'high',
        currentVisibility: 'not mentioned',
        difficulty: 'medium',
        priority: 'high',
      },
      {
        query: `${industry} recommendations ${location}`,
        estimatedVolume: 'medium',
        currentVisibility: 'not mentioned',
        difficulty: 'low',
        priority: 'high',
      },
      {
        query: `how to choose a ${industry} provider`,
        estimatedVolume: 'high',
        currentVisibility: 'not mentioned',
        difficulty: 'medium',
        priority: 'high',
      },
      {
        query: `${industry} pricing comparison`,
        estimatedVolume: 'medium',
        currentVisibility: 'not mentioned',
        difficulty: 'high',
        priority: 'medium',
      },
      {
        query: `is ${industry} worth it`,
        estimatedVolume: 'medium',
        currentVisibility: 'not mentioned',
        difficulty: 'low',
        priority: 'medium',
      },
      {
        query: `top rated ${industry} ${location}`,
        estimatedVolume: 'high',
        currentVisibility: 'not mentioned',
        difficulty: 'medium',
        priority: 'high',
      },
      {
        query: `${industry} vs DIY`,
        estimatedVolume: 'low',
        currentVisibility: 'not mentioned',
        difficulty: 'low',
        priority: 'low',
      },
      {
        query: `${industry} reviews and complaints`,
        estimatedVolume: 'medium',
        currentVisibility: 'not mentioned',
        difficulty: 'medium',
        priority: 'medium',
      },
      {
        query: `what to look for in a ${industry}`,
        estimatedVolume: 'high',
        currentVisibility: 'not mentioned',
        difficulty: 'low',
        priority: 'high',
      },
      {
        query: `${industry} cost in ${location}`,
        estimatedVolume: 'medium',
        currentVisibility: 'not mentioned',
        difficulty: 'medium',
        priority: 'medium',
      },
    ],
    categories: [
      { name: 'Purchase Intent', count: 4, description: 'Queries from people ready to buy' },
      { name: 'Research Phase', count: 3, description: 'Queries from people comparing options' },
      { name: 'Awareness', count: 3, description: 'Queries from people learning about the space' },
    ],
    strategy: {
      quickWins: [
        `Create an FAQ page answering "how to choose a ${industry} provider"`,
        `Write a comprehensive pricing guide for ${industry} in ${location}`,
        `Publish a comparison guide: professional ${industry} vs DIY`,
      ],
      longTerm: [
        'Build topical authority by publishing content for each discovered query',
        'Add FAQ schema markup for common questions',
        'Create location-specific landing pages',
      ],
    },
  }

  return {
    type: 'structured',
    outputType: 'query_suggestions',
    title: `AI Query Research for ${ctx.businessName}`,
    summary: `Discovered 10 high-value queries that potential customers ask AI engines about ${industry} in ${location}. ${ctx.businessName} is currently not mentioned in any of them. 4 queries show purchase intent and are high priority. Quick win: create FAQ and pricing content to capture low-difficulty, high-volume queries.`,
    data,
  }
}

export function generateMockOutput(agentType: string, ctx: AgentContext): AgentOutput {
  switch (agentType) {
    case 'content_writer':
      return generateLandingPage(ctx)
    case 'blog_writer':
      return generateBlogPost(ctx)
    case 'review_analyzer':
      return generateReviewAnalysis(ctx)
    case 'schema_optimizer':
      return generateSchemaMarkup(ctx)
    case 'social_strategy':
      return generateSocialStrategy(ctx)
    case 'competitor_research':
      return generateCompetitorReport(ctx)
    case 'query_researcher':
      return generateQuerySuggestions(ctx)
    default:
      return generateBlogPost(ctx)
  }
}

export const AGENT_CREDIT_COSTS: Record<string, number> = {
  content_writer: 3,
  blog_writer: 5,
  review_analyzer: 2,
  schema_optimizer: 2,
  social_strategy: 3,
  competitor_research: 4,
  query_researcher: 2,
}
