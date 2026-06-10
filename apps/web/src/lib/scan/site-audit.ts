/**
 * site-audit.ts — Structured site-audit observer for the Beamix diagnosis pipeline.
 *
 * Performs up to 4 parallel safe fetches:
 *   1. Target URL       — parse HTML for title, meta description, headings, word count, JSON-LD
 *   2. /robots.txt      — detect AI crawler permissions
 *   3. /sitemap.xml     — presence only
 *   4. /llms.txt        — presence only
 *
 * FM-5 GUARD (CRITICAL): If robots.txt fetch is NOT a clean 200 (i.e. 5xx,
 * timeout, network error, or any non-200 status), we set fetchStatus='unavailable'
 * and OMIT the crawlers map entirely. We NEVER default any crawler to "blocked".
 * Failing to fetch robots.txt does NOT mean crawlers are disallowed — it means
 * we have no data. Defaulting to "blocked" would be a false-positive that harms
 * the diagnosis (FM-5).
 *
 * This module is additive and log-only — it does not write to the DB or affect
 * scoring. It is the SECURITY SPINE for the diagnosis rebuild.
 */

import * as cheerio from 'cheerio';
import robotsParser from 'robots-parser';
import { safeFetch } from './safe-fetch';
import type { SiteAudit } from './types';

// ---------------------------------------------------------------------------
// AI crawler user-agent strings to check against robots.txt
// ---------------------------------------------------------------------------

const AI_CRAWLERS: Record<string, string> = {
  GPTBot: 'GPTBot',
  'Google-Extended': 'Google-Extended',
  PerplexityBot: 'PerplexityBot',
  'ChatGPT-User': 'ChatGPT-User',
  CCBot: 'CCBot',
  'Claude-Web': 'Claude-Web',
  'anthropic-ai': 'anthropic-ai',
};

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

/**
 * Audits a target URL and returns a structured SiteAudit.
 * Never throws — all errors are captured in the result shape.
 *
 * @param url - The target URL to audit (must be http/https).
 */
export async function auditSite(url: string): Promise<SiteAudit> {
  const fetchedAt = new Date().toISOString();

  // Derive base URL for /robots.txt, /sitemap.xml, /llms.txt
  let baseUrl: string;
  try {
    const parsed = new URL(url);
    baseUrl = `${parsed.protocol}//${parsed.host}`;
  } catch {
    // If we can't even parse the URL, return a fully-unavailable audit
    return {
      url,
      fetchedAt,
      page: { fetchStatus: 'unavailable' },
      robotsTxt: { fetchStatus: 'unavailable' },
      sitemapXml: { present: false },
      llmsTxt: { present: false },
    };
  }

  // Run all 4 fetches in parallel.
  const [targetResult, robotsResult, sitemapResult, llmsResult] = await Promise.all([
    safeFetch(url),
    safeFetch(`${baseUrl}/robots.txt`),
    safeFetch(`${baseUrl}/sitemap.xml`),
    safeFetch(`${baseUrl}/llms.txt`),
  ]);

  // ---------------------------------------------------------------------------
  // Parse target page
  // ---------------------------------------------------------------------------
  const page = parseTargetPage(targetResult.ok ? { status: targetResult.status, body: targetResult.body } : null);

  // ---------------------------------------------------------------------------
  // Parse robots.txt — FM-5 GUARD enforced here
  // ---------------------------------------------------------------------------
  //
  // FM-5 GUARD: ONLY report crawler status when robots.txt fetched cleanly (HTTP 200).
  // On ANY non-200 (5xx, 4xx, timeout, network error, blocked): set fetchStatus='unavailable'
  // and OMIT crawlers map. Do NOT default to blocked. Never infer disallowed from absence.
  //
  const robotsTxt = parseRobotsTxt(
    robotsResult,
    `${baseUrl}/robots.txt`,
  );

  // ---------------------------------------------------------------------------
  // sitemap.xml + llms.txt — presence only
  // ---------------------------------------------------------------------------
  const sitemapXml = { present: sitemapResult.ok && sitemapResult.status === 200 };
  const llmsTxt = { present: llmsResult.ok && llmsResult.status === 200 };

  return {
    url,
    fetchedAt,
    page,
    robotsTxt,
    sitemapXml,
    llmsTxt,
  };
}

// ---------------------------------------------------------------------------
// HTML parsing
// ---------------------------------------------------------------------------

function parseTargetPage(
  result: { status: number; body: string } | null,
): SiteAudit['page'] {
  if (!result || result.status !== 200) {
    return { fetchStatus: 'unavailable' };
  }

  const $ = cheerio.load(result.body);

  const title = $('title').first().text().trim() || undefined;
  const metaDescription =
    $('meta[name="description"]').attr('content')?.trim() ||
    $('meta[name="Description"]').attr('content')?.trim() ||
    undefined;

  const h1Count = $('h1').length;
  const h2Count = $('h2').length;
  const h3Count = $('h3').length;

  // Word count: strip tags, split on whitespace.
  // Cap raw text at 200 KB before tokenizing to avoid allocating a full word array
  // from a potentially 2 MiB response body (safe-fetch body cap).
  const WORD_COUNT_TEXT_CAP = 200_000; // ~200 KB of text
  const rawBodyText = $('body').text().replace(/\s+/g, ' ').trim();
  const bodyText = rawBodyText.length > WORD_COUNT_TEXT_CAP
    ? rawBodyText.slice(0, WORD_COUNT_TEXT_CAP)
    : rawBodyText;
  const wordCount = bodyText ? bodyText.split(' ').filter(Boolean).length : 0;

  // JSON-LD: collect all @type values, especially LocalBusiness / Organization
  // Also collect dateModified / datePublished values for freshness detection.
  const jsonLdTypes: string[] = [];
  const jsonLdDates: string[] = [];
  $('script[type="application/ld+json"]').each((_i, el) => {
    try {
      const raw = $(el).html();
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      collectJsonLdTypes(parsed, jsonLdTypes);
      collectJsonLdDates(parsed, jsonLdDates);
    } catch {
      // Malformed JSON-LD — skip, never throw
    }
  });

  // dateModified: prefer JSON-LD dates, then fall back to meta tags.
  // Take the most recent valid date found across all sources.
  const metaDates: string[] = [];
  const articleModified = $('meta[property="article:modified_time"]').attr('content');
  if (articleModified) metaDates.push(articleModified);
  const itempropModified = $('meta[itemprop="dateModified"]').attr('content');
  if (itempropModified) metaDates.push(itempropModified);

  const dateModified = pickMostRecentDate([...jsonLdDates, ...metaDates]);

  return {
    fetchStatus: 'ok',
    ...(title !== undefined && { title }),
    ...(metaDescription !== undefined && { metaDescription }),
    h1Count,
    h2Count,
    h3Count,
    wordCount,
    ...(jsonLdTypes.length > 0 && { jsonLdTypes }),
    ...(dateModified !== undefined && { dateModified }),
  };
}

/** Recursively collects @type values from a JSON-LD node (handles arrays and nested graphs). */
function collectJsonLdTypes(node: unknown, out: string[]): void {
  if (Array.isArray(node)) {
    for (const item of node) collectJsonLdTypes(item, out);
    return;
  }
  if (typeof node !== 'object' || node === null) return;

  const obj = node as Record<string, unknown>;
  const typeVal = obj['@type'];
  if (typeof typeVal === 'string') {
    out.push(typeVal);
  } else if (Array.isArray(typeVal)) {
    for (const t of typeVal) {
      if (typeof t === 'string') out.push(t);
    }
  }

  // Recurse into @graph array
  if (Array.isArray(obj['@graph'])) {
    for (const item of obj['@graph']) collectJsonLdTypes(item, out);
  }
}

/** Recursively collects dateModified (preferred) and datePublished values from JSON-LD nodes. */
function collectJsonLdDates(node: unknown, out: string[]): void {
  if (Array.isArray(node)) {
    for (const item of node) collectJsonLdDates(item, out);
    return;
  }
  if (typeof node !== 'object' || node === null) return;

  const obj = node as Record<string, unknown>;

  // dateModified preferred over datePublished — push both and pickMostRecentDate will sort them.
  const dm = obj['dateModified'];
  if (typeof dm === 'string' && dm) out.push(dm);
  const dp = obj['datePublished'];
  if (typeof dp === 'string' && dp) out.push(dp);

  // Recurse into @graph array
  if (Array.isArray(obj['@graph'])) {
    for (const item of obj['@graph']) collectJsonLdDates(item, out);
  }
}

/**
 * From a list of candidate date strings, return the most recent valid ISO date string,
 * or undefined if no valid date is found. Never throws.
 */
function pickMostRecentDate(candidates: string[]): string | undefined {
  let best: Date | undefined;
  let bestIso: string | undefined;

  for (const raw of candidates) {
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) continue;
      if (best === undefined || d > best) {
        best = d;
        bestIso = d.toISOString();
      }
    } catch {
      // Unparseable — skip silently
    }
  }

  return bestIso;
}

// ---------------------------------------------------------------------------
// robots.txt parsing — FM-5 guard
// ---------------------------------------------------------------------------

function parseRobotsTxt(
  fetchResult: Awaited<ReturnType<typeof safeFetch>>,
  robotsUrl: string,
): SiteAudit['robotsTxt'] {
  // FM-5 GUARD: only parse when we got a clean HTTP 200.
  // Non-200, fetch error, timeout, network error → 'unavailable', no crawlers map.
  // NEVER default any crawler to "blocked" on unavailability.
  if (!fetchResult.ok || fetchResult.status !== 200) {
    return { fetchStatus: 'unavailable' };
  }

  const robot = robotsParser(robotsUrl, fetchResult.body);

  // Derive site root (origin) from robotsUrl for isAllowed evaluation.
  // robots-parser.isAllowed(url, ua) evaluates allow/disallow rules against the URL
  // being requested — passing the robots.txt URL itself would evaluate rules for
  // "/robots.txt" only. We pass the site root so wildcard rules (e.g. "Disallow: /")
  // are evaluated correctly. FM-5 guard is unaffected (it fires before this code runs).
  let siteRoot: string;
  try {
    const parsed = new URL(robotsUrl);
    siteRoot = `${parsed.protocol}//${parsed.host}/`;
  } catch {
    siteRoot = robotsUrl;
  }

  const crawlers: Record<string, 'allowed' | 'disallowed'> = {};
  for (const [agentKey, agentString] of Object.entries(AI_CRAWLERS)) {
    // isAllowed returns boolean|undefined; treat undefined as allowed (no rule = not blocked)
    const allowed = robot.isAllowed(siteRoot, agentString);
    // isAllowed returns undefined when there's no matching rule — treat as allowed
    crawlers[agentKey] = allowed === false ? 'disallowed' : 'allowed';
  }

  return { fetchStatus: 'ok', crawlers };
}
