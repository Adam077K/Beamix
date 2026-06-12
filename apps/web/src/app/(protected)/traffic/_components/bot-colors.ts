/**
 * Bot/crawler swatch colors — the /traffic mirror of /analytics' engine-colors.ts.
 *
 * /traffic re-frames the inherited Analytics "engine" filter dimension as the
 * BOT/crawler dimension. Bot ids are stored in the SAME `engines` record on
 * AnalyticsFilterContext, so the rail's checkbox-chip + swatch + engineOpacity()
 * machinery works unchanged on the bot id set (no shared-file edits).
 *
 * Law (DESIGN-VISION §3 + brief): data-viz uses the desaturated data-1..6 band.
 * #3370FF (data-1) = GPTBot, the brand/aggregate series. Violet #6E56F0 is
 * reserved for agent annotations ONLY — never a bot fill.
 */
export const BOT_COLORS: Record<string, string> = {
  GPTBot: '#3370FF', // data-1 — brand blue (aggregate / dominant series)
  ClaudeBot: '#F59E0B', // data-5 — amber
  PerplexityBot: '#10B981', // data-4 — green
  'Google-Extended': '#06B6D4', // data-3 — cyan
  Bingbot: '#EF4444', // data-6 — red
  CCBot: '#9CA3AF', // neutral grey — the common crawler
}

export const BOT_ORDER = [
  'GPTBot',
  'ClaudeBot',
  'PerplexityBot',
  'Google-Extended',
  'Bingbot',
  'CCBot',
] as const

/** The bot whose series renders as the dominant 2px brand line. */
export const BRAND_BOT = 'GPTBot'

/** Violet agent-annotation color — ReferenceLine + dot only. Never a fill. */
export const AGENT_VIOLET = '#6E56F0'

/**
 * Referral attribution is keyed by ENGINE (the surface AI product), while the
 * scope rail toggles BOTS (the crawler). This map lets the referral bars dim in
 * unison with the bot that feeds them — so the linked-bot gesture ripples across
 * every instrument, not just the ones literally keyed by bot id.
 *
 * AI Overviews has no dedicated crawler in our set; it rides Google-Extended.
 */
export const ENGINE_TO_BOT: Record<string, string> = {
  ChatGPT: 'GPTBot',
  Perplexity: 'PerplexityBot',
  Gemini: 'Google-Extended',
  Claude: 'ClaudeBot',
  'AI Overviews': 'Google-Extended',
}

/** Engine swatch colors for the referral panel (the AI products, not the bots). */
export const ENGINE_COLORS: Record<string, string> = {
  ChatGPT: '#3370FF',
  Perplexity: '#10B981',
  Gemini: '#06B6D4',
  Claude: '#F59E0B',
  'AI Overviews': '#EF4444',
}

/** Format a weekly ISO date as a short axis tick: "May 12". */
export function shortDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
