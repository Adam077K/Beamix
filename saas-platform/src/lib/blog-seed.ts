// Seed data for demo blog posts
// Run via: npx tsx src/lib/blog-seed.ts (requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY env vars)

import type { InsertTables } from '@/lib/types/database.types'

export const SEED_POSTS: InsertTables<'blog_posts'>[] = [
  {
    slug: 'what-is-geo-and-why-it-matters',
    title: 'What is GEO and Why It Matters for Your Business in 2026',
    excerpt:
      'Generative Engine Optimization (GEO) is the new frontier of digital visibility. Learn why traditional SEO alone is no longer enough.',
    content: `# What is GEO and Why It Matters for Your Business in 2026

Search is changing. When your potential customers ask ChatGPT, Gemini, or Perplexity for recommendations, they get direct answers — not a list of blue links. This shift is called **Generative Engine Optimization (GEO)**, and it's redefining how businesses get found online.

## The Shift from SEO to GEO

Traditional SEO optimized for Google's algorithm: keywords, backlinks, page speed. GEO optimizes for **AI comprehension**: structured data, authoritative content, and the signals that make language models recommend your business by name.

## Why This Matters Now

- **40% of local business queries** now go through AI assistants
- AI search converts at **5x the rate** of traditional search
- Early movers are locking in positions that will be hard to displace

## What You Can Do Today

1. **Scan your visibility** across AI engines to understand your baseline
2. **Add structured data** (FAQ schema, LocalBusiness schema) to your site
3. **Create authoritative content** that directly answers questions in your industry
4. **Monitor regularly** — AI rankings shift faster than Google rankings

The businesses that act now will own the AI search landscape. The ones that wait will wonder why their phone stopped ringing.

---

*Ready to see where you stand? [Run a free scan](/scan) across all major AI engines in 60 seconds.*`,
    category: 'geo-strategy',
    tags: ['GEO', 'AI search', 'strategy', 'beginner'],
    author_name: 'Beamix Team',
    is_featured: true,
    is_published: true,
    published_at: '2026-02-28T10:00:00Z',
    reading_time_minutes: 4,
    seo_title: 'What is GEO? Generative Engine Optimization Explained | Beamix',
    seo_description:
      'Learn what Generative Engine Optimization (GEO) is and why it matters for businesses in 2026. Understand the shift from SEO to AI search visibility.',
  },
  {
    slug: 'chatgpt-vs-gemini-vs-perplexity-which-ai-search-matters',
    title: 'ChatGPT vs Gemini vs Perplexity: Which AI Search Engine Matters Most?',
    excerpt:
      'Not all AI engines are created equal. We break down which ones drive the most business referrals and where you should focus.',
    content: `# ChatGPT vs Gemini vs Perplexity: Which AI Search Engine Matters Most?

With multiple AI search engines now competing for user attention, businesses need to know where to focus their optimization efforts. Here's our data-driven breakdown.

## ChatGPT (OpenAI)

The dominant player with over 200 million weekly active users. ChatGPT is the most likely place your customers are asking for recommendations. It tends to favor businesses with strong web presence, reviews, and structured data.

**Best for:** Consumer-facing businesses, restaurants, professional services

## Gemini (Google)

Google's AI is deeply integrated into Search and Maps. Google AI Overviews appear directly in search results, making this critical for any business that relies on Google traffic.

**Best for:** Local businesses, e-commerce, any business with Google Business Profile

## Perplexity

The "answer engine" that cites sources. Perplexity users tend to be more research-oriented and higher-intent. Getting cited here means getting a direct link to your content.

**Best for:** B2B companies, content-heavy businesses, professional services

## Claude (Anthropic)

Growing rapidly in the professional and enterprise space. Claude tends to give more nuanced, detailed recommendations.

**Best for:** Technical services, consulting, enterprise B2B

## The Bottom Line

You need visibility across **all of them**. Each engine has different ranking signals, and your competitors may be strong on one but weak on another. The winning strategy is comprehensive coverage.

---

*Beamix scans all major AI engines in a single scan. [Try it free](/scan).*`,
    category: 'ai-search',
    tags: ['ChatGPT', 'Gemini', 'Perplexity', 'Claude', 'comparison'],
    author_name: 'Beamix Team',
    is_featured: false,
    is_published: true,
    published_at: '2026-02-25T10:00:00Z',
    reading_time_minutes: 5,
    seo_title: 'ChatGPT vs Gemini vs Perplexity for Business | Beamix',
    seo_description:
      'Compare ChatGPT, Gemini, Perplexity, and Claude for business visibility. Learn which AI search engines matter most for your industry.',
  },
  {
    slug: 'how-local-restaurant-increased-ai-visibility-300-percent',
    title: 'How a Local Restaurant Increased AI Visibility by 300% in 30 Days',
    excerpt:
      'Sakura Tel Aviv went from invisible to #2 on Gemini for "best sushi in the city." Here\'s exactly how they did it.',
    content: `# How a Local Restaurant Increased AI Visibility by 300% in 30 Days

When Oren K., owner of Sakura Tel Aviv, first ran a Beamix scan, his restaurant wasn't mentioned by any AI engine for "best sushi in Tel Aviv." Thirty days later, he was #2 on Gemini and mentioned by ChatGPT.

## The Starting Point

- **Visibility score:** 12/100
- **Mentioned by:** 0 out of 4 AI engines
- **Top competitors showing up:** 5 other sushi restaurants

## What Changed

### Week 1: Foundation
- Added FAQ schema markup answering the top 10 questions customers ask
- Created a detailed "About" page with the chef's story and sourcing philosophy
- Updated Google Business Profile with complete, keyword-rich descriptions

### Week 2: Content
- Published 3 blog posts about sushi culture, sourcing, and dining experience
- Added structured menu data with JSON-LD markup
- Responded to every Google review with detailed, helpful responses

### Week 3-4: Amplification
- Local food bloggers mentioned the restaurant in roundup articles
- Added customer testimonials with specific, detailed experiences
- Created a "Why Sakura" comparison page (tastefully done, not aggressive)

## The Results

- **Visibility score:** 78/100 (up from 12)
- **Mentioned by:** 3 out of 4 AI engines
- **Gemini ranking:** #2 for "best sushi Tel Aviv"
- **Estimated additional monthly customers:** 40-60

## Key Takeaway

AI engines reward businesses that make it **easy to understand and recommend** them. Structured data, genuine reviews, and authoritative content are the three pillars.

---

*Want results like this? [Start with a free scan](/scan) to see your baseline.*`,
    category: 'case-studies',
    tags: ['case study', 'restaurant', 'local business', 'results'],
    author_name: 'Beamix Team',
    is_featured: false,
    is_published: true,
    published_at: '2026-02-20T10:00:00Z',
    reading_time_minutes: 6,
    seo_title: 'Restaurant AI Visibility Case Study: 300% Increase | Beamix',
    seo_description:
      'Learn how a Tel Aviv restaurant went from invisible to #2 on Gemini in 30 days using GEO strategies. Real results, actionable steps.',
  },
  {
    slug: '5-schema-markup-types-every-business-needs',
    title: '5 Schema Markup Types Every Business Needs for AI Search',
    excerpt:
      'Schema markup is the language AI engines understand best. Here are the 5 types that have the biggest impact on your visibility.',
    content: `# 5 Schema Markup Types Every Business Needs for AI Search

Schema markup (structured data) is one of the strongest signals you can send to AI engines. It tells them exactly what your business does, where you are, and why you're credible. Here are the five types with the highest impact.

## 1. LocalBusiness Schema

The foundation. This tells AI engines your business name, address, phone number, hours, and services. Without this, you're invisible to location-based queries.

\`\`\`json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Your Business Name",
  "address": { ... },
  "telephone": "+1-555-0123"
}
\`\`\`

## 2. FAQ Schema

AI engines love FAQ content because it directly matches how users ask questions. Add FAQ schema to your most important pages.

## 3. Review/AggregateRating Schema

Social proof matters to AI. Structured review data tells engines that real customers trust your business.

## 4. Service Schema

Explicitly list what you offer. AI engines can't recommend services they don't know about.

## 5. Article/BlogPosting Schema

For content-heavy pages, this helps AI engines understand the topic, author, and publication date of your content.

## How to Implement

You can add schema markup manually (JSON-LD in your page head), use a CMS plugin, or use Beamix's Schema Optimizer agent to generate it automatically.

---

*Not sure what schema you're missing? [Run a free scan](/scan) and we'll tell you.*`,
    category: 'guides',
    tags: ['schema markup', 'structured data', 'technical', 'guide'],
    author_name: 'Beamix Team',
    is_featured: false,
    is_published: true,
    published_at: '2026-02-15T10:00:00Z',
    reading_time_minutes: 7,
    seo_title: '5 Essential Schema Markup Types for AI Search | Beamix',
    seo_description:
      'Learn the 5 schema markup types that boost your AI search visibility: LocalBusiness, FAQ, Review, Service, and Article schemas explained.',
  },
  {
    slug: 'beamix-launch-introducing-ai-visibility-platform',
    title: 'Introducing Beamix: The AI Visibility Platform for SMBs',
    excerpt:
      'We built Beamix because every business deserves to be found on AI search. Here\'s our story and what we\'re building.',
    content: `# Introducing Beamix: The AI Visibility Platform for SMBs

Today we're launching Beamix, a platform that helps small and medium businesses get found on AI search engines like ChatGPT, Gemini, Perplexity, and Claude.

## The Problem

AI search is growing at an explosive rate. Millions of people now ask AI assistants for business recommendations instead of searching Google. But most businesses have no idea whether they're being recommended — or why they're being ignored.

## Our Solution

Beamix does three things:

1. **Scans** your business across every major AI engine
2. **Diagnoses** exactly why you rank (or don't)
3. **Fixes** it with AI agents that write the content and structured data you need

We don't just show you dashboards. We do the work.

## What's Included

- **Free scan:** Check your AI visibility in 60 seconds, no account needed
- **Dashboard:** Track your visibility score, query rankings, and competitor movements
- **AI agents:** Content Writer, Schema Optimizer, FAQ Generator, and more
- **Automated monitoring:** Know immediately when your rankings change

## Our Pricing Philosophy

Start free. See results. Then decide. Every plan comes with a 14-day free trial, no credit card required.

## What's Next

We're just getting started. In the coming weeks, we'll be adding more AI engines, deeper analytics, and industry-specific playbooks.

---

*Be one of the first to try Beamix. [Start your free scan](/scan).*`,
    category: 'product-updates',
    tags: ['launch', 'announcement', 'product'],
    author_name: 'Beamix Team',
    is_featured: false,
    is_published: true,
    published_at: '2026-02-10T10:00:00Z',
    reading_time_minutes: 4,
    seo_title: 'Beamix Launch: AI Visibility Platform for SMBs',
    seo_description:
      'Introducing Beamix — the platform that scans, diagnoses, and fixes your AI search visibility. Built for small and medium businesses.',
  },
]
