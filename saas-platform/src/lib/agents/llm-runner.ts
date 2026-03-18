/**
 * Real LLM execution for each agent type.
 * Uses Claude Sonnet via OpenRouter for content agents.
 * Replaces generateMockOutput in execute.ts.
 */

import { getAgentClient, MODELS } from '@/lib/openrouter'
import type { AgentConfig } from './config'
import type { AgentOutput } from './mock-outputs'

interface BusinessContext {
  name: string
  websiteUrl?: string
  industry?: string
  location?: string
}

interface RunInput {
  topic: string
  tone: string
  targetLength: string
  language: string
  targetKeyword?: string
}

const LENGTH_TO_TOKENS: Record<string, number> = {
  short: 800,
  medium: 1600,
  long: 3000,
}

const TONE_LABELS: Record<string, string> = {
  professional: 'professional and authoritative',
  casual: 'conversational and approachable',
  technical: 'technical and detailed',
  friendly: 'warm and friendly',
}

export async function runAgentLLM(
  config: AgentConfig,
  business: BusinessContext,
  input: RunInput,
): Promise<AgentOutput> {
  if (!(process.env.OPENROUTER_AGENT_KEY ?? process.env.OPENROUTER_API_KEY)) throw new Error('OPENROUTER_AGENT_KEY (or OPENROUTER_API_KEY) not configured')

  const client = getAgentClient()
  const maxTokens = LENGTH_TO_TOKENS[input.targetLength] ?? 1600
  const tone = TONE_LABELS[input.tone] ?? 'professional and authoritative'
  const location = business.location ? ` in ${business.location}` : ''
  const industry = business.industry ?? 'their industry'
  const langInstruction = input.language === 'he' ? ' Write in Hebrew.' : ' Write in English.'

  const systemPrompt = buildSystemPrompt(
    config.dbType,
    business.name,
    industry,
    location,
    tone,
    input.targetKeyword,
    langInstruction,
  )
  const userPrompt = buildUserPrompt(config.dbType, input.topic, input.targetLength)

  const response = await Promise.race([
    client.chat.completions.create({
      model: MODELS.agentExecution,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('LLM request timed out after 25s')), 25000)
    ),
  ])

  const text = response.choices[0]?.message?.content ?? ''

  return buildOutput(config.dbType, text, input)
}

// ---------------------------------------------------------------------------
// System prompts per agent type
// ---------------------------------------------------------------------------

function buildSystemPrompt(
  agentType: string,
  bizName: string,
  industry: string,
  location: string,
  tone: string,
  keyword: string | undefined,
  langInstruction: string,
): string {
  const keywordLine = keyword ? `\nFocus keyword: "${keyword}"` : ''

  switch (agentType) {
    case 'content_writer':
      return `You are an expert content writer for ${bizName}, a ${industry} business${location}. Write ${tone} content designed to be cited by AI search engines (ChatGPT, Gemini, Perplexity). Use clear headings, specific details, and demonstrate genuine expertise.${keywordLine}${langInstruction}

Format: Markdown. Start with an H1 title.`

    case 'blog_writer':
      return `You are a professional blog writer for ${bizName}, a ${industry} business${location}. Write ${tone} long-form content that establishes authority and gets cited by AI search engines. Content must be factual, helpful, and thorough.${keywordLine}${langInstruction}

Format: Full blog post in Markdown with H1 title, H2/H3 sections, and a conclusion.`

    case 'faq_agent':
      return `You are creating FAQ content for ${bizName}, a ${industry} business${location}. Generate comprehensive Q&A pairs that answer real customer questions. AI engines prioritize FAQ content that directly answers user queries.${langInstruction}

Format: Markdown. Bold each question (e.g. **Q: How do I...?**), follow with a detailed answer paragraph. Generate 8-12 Q&A pairs.`

    case 'schema_optimizer':
      return `You are a structured data expert for ${bizName}, a ${industry} business${location}. Generate valid JSON-LD schema markup that improves AI engine visibility. Focus on LocalBusiness, FAQPage, and Service schemas relevant to the business.

Return ONLY valid JSON-LD inside a markdown code block. No prose outside the code block.`

    case 'review_analyzer':
      return `You are a reputation analyst for ${bizName}, a ${industry} business${location}. Analyze the provided review topics and generate actionable insights for improving AI visibility and customer perception. Write in a ${tone} style.${langInstruction}

Format: Markdown with sections: Sentiment Summary, Key Strengths, Areas to Improve, and Action Items.`

    case 'social_strategy':
      return `You are a social media strategist for ${bizName}, a ${industry} business${location}. Create a content strategy that builds social proof and increases AI citation signals. Write in a ${tone} style.${langInstruction}

Format: Markdown with sections: Strategy Overview, Content Pillars (3-5), 30-Day Content Calendar, and Platform Recommendations.`

    case 'competitor_intelligence':
      return `You are a competitive intelligence analyst for ${bizName}, a ${industry} business${location}. Analyze competitor positioning in AI search results and identify strategic gaps ${bizName} can exploit. Write in a ${tone} style.${langInstruction}

Format: Markdown with sections: Competitor Landscape, Gap Analysis, AI Visibility Opportunities, and Recommended Actions.`

    default:
      return `You are an AI search optimization expert helping ${bizName} improve their visibility in AI search engines. Write in a ${tone} style.${langInstruction}`
  }
}

// ---------------------------------------------------------------------------
// User prompts per agent type
// ---------------------------------------------------------------------------

function buildUserPrompt(agentType: string, topic: string, targetLength: string): string {
  const lengthLabel =
    targetLength === 'short' ? 'concise' : targetLength === 'long' ? 'comprehensive' : 'well-rounded'

  switch (agentType) {
    case 'content_writer':
      return `Write a ${lengthLabel} piece of content about: ${topic}`
    case 'blog_writer':
      return `Write a ${lengthLabel} blog post about: ${topic}`
    case 'faq_agent':
      return `Generate FAQ content for customers asking about: ${topic}`
    case 'schema_optimizer':
      return `Generate JSON-LD schema markup for this context: ${topic}`
    case 'review_analyzer':
      return `Analyze and provide reputation insights for: ${topic}`
    case 'social_strategy':
      return `Create a social media strategy for: ${topic}`
    case 'competitor_intelligence':
      return `Research and analyze competitor positioning for: ${topic}`
    default:
      return topic
  }
}

// ---------------------------------------------------------------------------
// Parse LLM response into AgentOutput shape
// ---------------------------------------------------------------------------

function buildOutput(agentType: string, text: string, input: RunInput): AgentOutput {
  const wordCount = text.split(/\s+/).filter(Boolean).length
  const titleLine = text.split('\n').find((l) => l.startsWith('# '))
  const title = titleLine ? titleLine.replace(/^#+\s+/, '').trim() : input.topic

  // Structured output agents
  if (agentType === 'competitor_intelligence') {
    return {
      type: 'structured',
      outputType: 'competitor_report',
      title: `Competitor Intelligence: ${input.topic}`,
      summary: text.split('\n').filter(Boolean)[1] ?? '',
      data: { content: text, wordCount },
    }
  }

  if (agentType === 'review_analyzer') {
    return {
      type: 'structured',
      outputType: 'review_analysis',
      title: `Review Analysis: ${input.topic}`,
      summary: text.split('\n').filter(Boolean)[1] ?? '',
      data: { content: text, wordCount },
    }
  }

  if (agentType === 'social_strategy') {
    return {
      type: 'structured',
      outputType: 'social_strategy',
      title: `Social Strategy: ${input.topic}`,
      summary: text.split('\n').filter(Boolean)[1] ?? '',
      data: { content: text, wordCount },
    }
  }

  // Content output agents
  const contentTypeMap: Record<string, 'blog_post' | 'article' | 'faq' | 'schema_markup' | 'social_post' | 'review_response'> = {
    content_writer: 'article',
    blog_writer: 'blog_post',
    faq_agent: 'faq',
    schema_optimizer: 'schema_markup',
  }

  const formatMap: Record<string, 'markdown' | 'json_ld'> = {
    content_writer: 'markdown',
    blog_writer: 'markdown',
    faq_agent: 'markdown',
    schema_optimizer: 'json_ld',
  }

  return {
    type: 'content',
    contentType: contentTypeMap[agentType] ?? 'article',
    title,
    content: text,
    format: formatMap[agentType] ?? 'markdown',
    wordCount,
  }
}
