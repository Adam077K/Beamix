/**
 * Real LLM execution for each agent type.
 * Uses Claude Sonnet via OpenRouter for content agents.
 * Replaces generateMockOutput in execute.ts.
 */

import { getAgentClient, getScanClient, MODELS } from '@/lib/openrouter'
import type { AgentConfig } from './config'
import type { AgentOutput } from './mock-outputs'
import type { ScanContext } from './execute'

interface BusinessContext {
  name: string
  websiteUrl?: string
  industry?: string
  location?: string
  scanData?: ScanContext
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

/** Agent types that benefit from Perplexity pre-research with live web data */
const RESEARCH_AGENTS = new Set([
  'content_writer',
  'blog_writer',
  'competitor_intelligence',
  'review_analyzer',
])

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

  // Pre-research: query Perplexity for live web context (content/research agents only)
  let preResearch = ''
  if (RESEARCH_AGENTS.has(config.dbType) && (process.env.OPENROUTER_SCAN_KEY ?? process.env.OPENROUTER_API_KEY)) {
    try {
      preResearch = await runPreResearch(config.dbType, business, input.topic)
    } catch (err) {
      console.warn('[llm-runner] Pre-research failed (non-blocking):', err)
    }
  }

  const systemPrompt = buildSystemPrompt(
    config.dbType,
    business.name,
    industry,
    location,
    tone,
    input.targetKeyword,
    langInstruction,
    business.scanData,
  )
  const userPrompt = buildUserPrompt(config.dbType, input.topic, input.targetLength, preResearch)

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

  if (!text || text.trim().length < 20) {
    throw new Error('LLM returned empty or unusable response')
  }

  return buildOutput(config.dbType, text, input)
}

/**
 * Perplexity pre-research: fetches live web context before main agent execution.
 * Gives agents current, real-world data instead of relying only on training data.
 * Cost: ~$0.01-0.02 per call.
 */
/** Sanitize a string for safe inclusion in an LLM prompt (strip control chars, newlines, role markers) */
function sanitizeForPrompt(input: string, maxLength = 200): string {
  return input
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '') // control chars
    .replace(/\r?\n/g, ' ') // newlines → spaces
    .replace(/```/g, '') // code fences
    .replace(/<\|[^|]*\|>/g, '') // model role markers like <|system|>
    .replace(/^(system|user|assistant|human):/gim, '') // role prefixes
    .trim()
    .slice(0, maxLength)
}

async function runPreResearch(
  agentType: string,
  business: BusinessContext,
  topic: string,
): Promise<string> {
  const scanClient = getScanClient()
  const safeName = sanitizeForPrompt(business.name, 100)
  const safeUrl = sanitizeForPrompt(business.websiteUrl ?? '', 100)
  const safeTopic = sanitizeForPrompt(topic, 200)
  const loc = business.location ? ` in ${sanitizeForPrompt(business.location, 100)}` : ''
  const industry = sanitizeForPrompt(business.industry ?? 'their industry', 100)

  const researchQueries: Record<string, string> = {
    content_writer: `What content does the website ${safeUrl || safeName} currently have? What topics are trending in ${industry}${loc} that ${safeName} should cover?`,
    blog_writer: `What are the latest trends, news, and expert insights in ${industry}${loc}? What topics would establish ${safeName} as an authority? Topic focus: ${safeTopic}`,
    competitor_intelligence: `Who are the top competitors to ${safeName} in ${industry}${loc}? What are their content strategies and strengths in AI search visibility?`,
    review_analyzer: `What are customers saying about ${safeName} online? What are the key review themes and sentiment patterns in ${industry}${loc}?`,
  }

  const query = researchQueries[agentType]
  if (!query) return ''

  const response = await Promise.race([
    scanClient.chat.completions.create({
      model: MODELS.perplexity,
      messages: [{ role: 'user', content: query }],
      max_tokens: 1000,
    }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Pre-research timed out')), 10000)
    ),
  ])

  return response.choices[0]?.message?.content ?? ''
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
  scanData?: ScanContext,
): string {
  const keywordLine = keyword ? `\nFocus keyword: "${keyword}"` : ''

  // Build scan context block for scan-aware agents
  let scanBlock = ''
  if (scanData) {
    const parts: string[] = []
    if (scanData.visibilityScore != null) {
      parts.push(`- Overall AI Visibility Score: ${scanData.visibilityScore}/100`)
    }
    if (scanData.engineMentions?.length) {
      const mentioned = scanData.engineMentions.filter((e) => e.mentioned).map((e) => `${e.engine} (#${e.position ?? '?'})`).join(', ')
      const notMentioned = scanData.engineMentions.filter((e) => !e.mentioned).map((e) => e.engine).join(', ')
      if (mentioned) parts.push(`- Mentioned in: ${mentioned}`)
      if (notMentioned) parts.push(`- NOT mentioned in: ${notMentioned} ← PRIORITY TARGETS`)
    }
    if (scanData.topCompetitors?.length) {
      const compList = scanData.topCompetitors.slice(0, 3).map((c) => `${c.name} (score: ${c.score})`).join(', ')
      parts.push(`- Top competitors: ${compList}`)
    }
    if (scanData.brandAttributes?.associated_qualities?.length) {
      parts.push(`- Brand strengths: ${scanData.brandAttributes.associated_qualities.join(', ')}`)
    }
    if (scanData.brandAttributes?.missing_qualities?.length) {
      parts.push(`- Missing qualities (gaps to address): ${scanData.brandAttributes.missing_qualities.join(', ')}`)
    }
    if (parts.length > 0) {
      scanBlock = `\n\nBUSINESS AI VISIBILITY DATA (from latest scan — use as context for your work):\n${parts.join('\n')}`
    }
  }

  switch (agentType) {
    case 'content_writer':
      return `You are an expert content writer for ${bizName}, a ${industry} business${location}. Write ${tone} content designed to be cited by AI search engines (ChatGPT, Gemini, Perplexity). Use clear headings, specific details, and demonstrate genuine expertise. Address any visibility gaps found in the business's scan data.${keywordLine}${langInstruction}${scanBlock}

Format: Markdown. Start with an H1 title.`

    case 'blog_writer':
      return `You are a professional blog writer for ${bizName}, a ${industry} business${location}. Write ${tone} long-form content that establishes authority and gets cited by AI search engines. Content must be factual, helpful, and thorough. Leverage scan insights to target engines where the business is not yet mentioned.${keywordLine}${langInstruction}${scanBlock}

Format: Full blog post in Markdown with H1 title, H2/H3 sections, and a conclusion.`

    case 'faq_agent':
      return `You are creating FAQ content for ${bizName}, a ${industry} business${location}. Generate comprehensive Q&A pairs that answer real customer questions. AI engines prioritize FAQ content that directly answers user queries. Use scan data to understand what qualities and topics to emphasize.${langInstruction}${scanBlock}

Format: Markdown. Bold each question (e.g. **Q: How do I...?**), follow with a detailed answer paragraph. Generate 8-12 Q&A pairs.`

    case 'schema_optimizer':
      return `You are a structured data expert for ${bizName}, a ${industry} business${location}. Generate valid JSON-LD schema markup that improves AI engine visibility. Focus on LocalBusiness, FAQPage, and Service schemas relevant to the business. Use scan insights to prioritize schema types that address visibility gaps.${scanBlock}

Return ONLY valid JSON-LD inside a markdown code block. No prose outside the code block.`

    case 'review_analyzer':
      return `You are a reputation analyst for ${bizName}, a ${industry} business${location}. Analyze the provided review topics and generate actionable insights for improving AI visibility and customer perception. Write in a ${tone} style. Reference scan data to understand competitive positioning.${langInstruction}${scanBlock}

Format: Markdown with sections: Sentiment Summary, Key Strengths, Areas to Improve, and Action Items.`

    case 'social_strategy':
      return `You are a social media strategist for ${bizName}, a ${industry} business${location}. Create a content strategy that builds social proof and increases AI citation signals. Write in a ${tone} style. Use scan data to identify which engines to target and what competitors are doing.${langInstruction}${scanBlock}

Format: Markdown with sections: Strategy Overview, Content Pillars (3-5), 30-Day Content Calendar, and Platform Recommendations.`

    case 'competitor_intelligence':
      return `You are a competitive intelligence analyst for ${bizName}, a ${industry} business${location}. Analyze competitor positioning in AI search results and identify strategic gaps ${bizName} can exploit. Write in a ${tone} style. Use scan data showing real competitor rankings and brand attributes.${langInstruction}${scanBlock}

Format: Markdown with sections: Competitor Landscape, Gap Analysis, AI Visibility Opportunities, and Recommended Actions.`

    default:
      return `You are an AI search optimization expert helping ${bizName} improve their visibility in AI search engines. Write in a ${tone} style.${langInstruction}${scanBlock}`
  }
}

// ---------------------------------------------------------------------------
// User prompts per agent type
// ---------------------------------------------------------------------------

function buildUserPrompt(agentType: string, topic: string, targetLength: string, preResearch?: string): string {
  const lengthLabel =
    targetLength === 'short' ? 'concise' : targetLength === 'long' ? 'comprehensive' : 'well-rounded'

  const researchBlock = preResearch
    ? `\n\nCURRENT WEB RESEARCH (use as factual context — do not copy verbatim):\n${preResearch}`
    : ''

  switch (agentType) {
    case 'content_writer':
      return `Write a ${lengthLabel} piece of content about: ${topic}${researchBlock}`
    case 'blog_writer':
      return `Write a ${lengthLabel} blog post about: ${topic}${researchBlock}`
    case 'faq_agent':
      return `Generate FAQ content for customers asking about: ${topic}${researchBlock}`
    case 'schema_optimizer':
      return `Generate JSON-LD schema markup for this context: ${topic}`
    case 'review_analyzer':
      return `Analyze and provide reputation insights for: ${topic}${researchBlock}`
    case 'social_strategy':
      return `Create a social media strategy for: ${topic}${researchBlock}`
    case 'competitor_intelligence':
      return `Research and analyze competitor positioning for: ${topic}${researchBlock}`
    default:
      return `${topic}${researchBlock}`
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
