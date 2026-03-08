export const PIPELINE_STEPS = [
  'Research Trends',
  'Plan Content Calendar',
  'Write Posts',
  'QA Check',
]

export interface PipelineInput {
  businessId: string
  platforms?: string[]
  industry?: string
  postsPerWeek?: number
  [key: string]: unknown
}

export interface PipelineOutput {
  calendar: CalendarWeek[]
  contentType: string
  format: string
  summary: string
}

interface SocialPost {
  day: string
  platform: string
  postType: string
  caption: string
  hashtags: string[]
  bestTimeToPost: string
}

interface CalendarWeek {
  weekNumber: number
  theme: string
  posts: SocialPost[]
}

export async function run(
  input: PipelineInput,
  _context: { userId: string }
): Promise<PipelineOutput> {
  // TODO: Replace with real pipeline (Perplexity trend research -> Sonnet calendar planning -> Sonnet copywriting -> QA)
  const platforms = input.platforms || ['LinkedIn', 'Instagram']
  const industry = input.industry || 'professional services'
  return {
    calendar: [
      {
        weekNumber: 1,
        theme: 'Establish Authority',
        posts: [
          {
            day: 'Monday',
            platform: platforms[0] || 'LinkedIn',
            postType: 'thought_leadership',
            caption: `Most ${industry} businesses are invisible to AI search engines.\n\nHere's the thing: 40% of your potential customers now discover businesses through ChatGPT, Gemini, and Perplexity -- not Google.\n\nIf AI doesn't know you exist, neither do they.\n\n3 things you can do today:\n1. Add schema markup to your website\n2. Create an FAQ page with real customer questions\n3. Ensure your business info is consistent across all platforms\n\nWhich one will you tackle first?`,
            hashtags: ['#AISearch', '#GEO', '#SmallBusiness', '#DigitalMarketing'],
            bestTimeToPost: '8:00 AM',
          },
          {
            day: 'Thursday',
            platform: platforms[1] || 'Instagram',
            postType: 'educational_carousel',
            caption: `AI search is changing everything for ${industry} businesses. Swipe to learn the 5 signals AI engines use to recommend businesses like yours.\n\nSave this post -- you'll want to reference it later.`,
            hashtags: ['#AIVisibility', '#BusinessTips', '#MarketingStrategy'],
            bestTimeToPost: '12:00 PM',
          },
        ],
      },
      {
        weekNumber: 2,
        theme: 'Social Proof & Results',
        posts: [
          {
            day: 'Tuesday',
            platform: platforms[0] || 'LinkedIn',
            postType: 'case_study',
            caption: `A ${industry} business went from 0 AI mentions to being recommended by 3 major AI engines in just 6 weeks.\n\nHere's exactly what changed:\n\n- Added structured data to every service page\n- Created 15 targeted FAQ entries\n- Optimized their Google Business Profile\n- Published 4 authoritative blog posts\n\nThe result? 23% more qualified leads from AI-driven discovery.\n\nAI visibility isn't a nice-to-have anymore. It's the new SEO.`,
            hashtags: ['#CaseStudy', '#AIMarketing', '#Results'],
            bestTimeToPost: '9:00 AM',
          },
          {
            day: 'Friday',
            platform: platforms[1] || 'Instagram',
            postType: 'behind_the_scenes',
            caption: `Behind the scenes: how we analyze AI search results for our clients.\n\nWe scan 7+ AI engines weekly to track mentions, sentiment, and ranking position. Then our AI agents generate the content fixes automatically.\n\nThe future of marketing is here.`,
            hashtags: ['#BehindTheScenes', '#AITools', '#MarTech'],
            bestTimeToPost: '11:00 AM',
          },
        ],
      },
    ],
    contentType: 'social_calendar',
    format: 'structured_report',
    summary: `Generated a 2-week social media calendar for ${platforms.join(' and ')} targeting the ${industry} sector. Includes ${4} posts optimized for engagement and AI visibility awareness.`,
  }
}
