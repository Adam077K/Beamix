/**
 * Lightweight website scraper for scan context.
 *
 * Fetches the homepage and extracts key text:
 * - Page title
 * - Meta description
 * - H1/H2 headlines
 * - First paragraph text
 *
 * No API calls — just a fetch + HTML parsing.
 * Timeout: 5 seconds. Graceful fallback on failure.
 */

export interface WebsiteContext {
  title: string | null
  metaDescription: string | null
  headlines: string[]
  bodySnippet: string | null
  success: boolean
}

/**
 * Validate URL is safe to fetch (SSRF protection).
 * Blocks internal IPs, non-HTTP schemes, and metadata endpoints.
 */
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) return false
    const hostname = parsed.hostname.toLowerCase()
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') return false
    if (hostname === '0.0.0.0' || hostname === '[::1]') return false
    if (hostname.startsWith('10.') || hostname.startsWith('192.168.')) return false
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(hostname)) return false
    if (hostname.startsWith('169.254.')) return false // AWS/cloud metadata
    if (hostname.startsWith('fd') || hostname.startsWith('fe80')) return false // IPv6 link-local
    if (hostname.endsWith('.internal') || hostname.endsWith('.local')) return false
    if (hostname.endsWith('.svc.cluster.local')) return false // Kubernetes
    return true
  } catch {
    return false
  }
}

/**
 * Scrape homepage to understand what the business does.
 * Returns extracted text or empty context on failure.
 */
export async function scrapeWebsite(url: string): Promise<WebsiteContext> {
  const empty: WebsiteContext = {
    title: null,
    metaDescription: null,
    headlines: [],
    bodySnippet: null,
    success: false,
  }

  if (!isSafeUrl(url)) {
    console.warn(`[scraper] Blocked unsafe URL: ${url}`)
    return empty
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Beamix-Scanner/1.0 (AI visibility scan)',
        'Accept': 'text/html',
      },
      redirect: 'follow',
    })

    clearTimeout(timeout)

    if (!response.ok) {
      console.warn(`[scraper] HTTP ${response.status} for ${url}`)
      return empty
    }

    const html = await response.text()

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
    const title = titleMatch?.[1]?.trim()?.replace(/\s+/g, ' ')?.slice(0, 200) ?? null

    // Extract meta description
    const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["']/i)
      ?? html.match(/<meta[^>]*content=["']([\s\S]*?)["'][^>]*name=["']description["']/i)
    const metaDescription = metaMatch?.[1]?.trim()?.replace(/\s+/g, ' ')?.slice(0, 500) ?? null

    // Extract H1 and H2 headlines
    const headlinePattern = /<h[12][^>]*>([\s\S]*?)<\/h[12]>/gi
    const headlines: string[] = []
    let hMatch: RegExpExecArray | null
    while ((hMatch = headlinePattern.exec(html)) !== null && headlines.length < 5) {
      const text = hMatch[1].replace(/<[^>]*>/g, '').trim().replace(/\s+/g, ' ')
      if (text.length > 3 && text.length < 200) {
        headlines.push(text)
      }
    }

    // Extract first meaningful paragraph
    const pPattern = /<p[^>]*>([\s\S]*?)<\/p>/gi
    let bodySnippet: string | null = null
    let pMatch: RegExpExecArray | null
    while ((pMatch = pPattern.exec(html)) !== null) {
      const text = pMatch[1].replace(/<[^>]*>/g, '').trim().replace(/\s+/g, ' ')
      if (text.length > 50 && text.length < 1000) {
        bodySnippet = text.slice(0, 500)
        break
      }
    }

    console.log(`[scraper] Scraped ${url} — title: "${title?.slice(0, 60)}", headlines: ${headlines.length}`)

    return {
      title,
      metaDescription,
      headlines,
      bodySnippet,
      success: true,
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn(`[scraper] Timeout fetching ${url}`)
    } else {
      console.warn(`[scraper] Failed to fetch ${url}:`, error instanceof Error ? error.message : error)
    }
    return empty
  }
}

/**
 * Build a text summary of the website content for use as LLM context.
 */
export function summarizeWebsiteContext(ctx: WebsiteContext): string {
  if (!ctx.success) return ''

  const parts: string[] = []
  if (ctx.title) parts.push(`Website title: ${ctx.title}`)
  if (ctx.metaDescription) parts.push(`Description: ${ctx.metaDescription}`)
  if (ctx.headlines.length > 0) parts.push(`Headlines: ${ctx.headlines.join(' | ')}`)
  if (ctx.bodySnippet) parts.push(`Content: ${ctx.bodySnippet}`)

  return parts.join('\n')
}
