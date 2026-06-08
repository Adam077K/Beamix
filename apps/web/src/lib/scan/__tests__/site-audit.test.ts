/**
 * Unit tests for site-audit.ts.
 *
 * safeFetch is mocked at module level via vi.mock — no real HTTP requests.
 *
 * Coverage:
 *   (1)  Parse JSON-LD LocalBusiness @type from fixture HTML
 *   (2)  OMIT crawlers map when robots.txt returns 503 (FM-5 guard)
 *   (3)  GPTBot=disallowed when robots.txt Disallows it
 *   (3b) robots.isAllowed evaluates site root URL, not robots.txt URL
 *   (4)  page.fetchStatus='unavailable' when safeFetch fails — auditSite never throws
 *   (5)  sitemapXml.present=true when sitemap.xml returns 200
 *   (6)  llmsTxt.present=true when llms.txt returns 200
 *   (7)  all crawlers=allowed when robots.txt has Allow: / for *
 *   (8)  fetchStatus='unavailable' on robots.txt timeout/network error (FM-5)
 *   (9)  JSON-LD with @graph array is recursively parsed
 *   (10) malformed JSON-LD does not throw — valid blocks still parsed
 *   (11) word count caps at ~200 KB input to bound memory allocation
 */

import { describe, it, expect, vi } from 'vitest';
import { auditSite } from '../site-audit';

// ---------------------------------------------------------------------------
// Mock safeFetch at module level — auditSite's internal calls are intercepted.
// vi.mock is hoisted before imports.
// ---------------------------------------------------------------------------

vi.mock('../safe-fetch', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../safe-fetch')>();
  return {
    ...actual,
    safeFetch: vi.fn(),
  };
});

import { safeFetch } from '../safe-fetch';
const mockSafeFetch = safeFetch as ReturnType<typeof vi.fn>;

// ---------------------------------------------------------------------------
// HTML fixtures
// ---------------------------------------------------------------------------

const HTML_WITH_LOCAL_BUSINESS = `<!DOCTYPE html>
<html>
<head>
  <title>Acme Dental Clinic</title>
  <meta name="description" content="Expert dental care in Tel Aviv">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Acme Dental",
    "address": { "@type": "PostalAddress", "addressLocality": "Tel Aviv" }
  }
  </script>
</head>
<body>
  <h1>Welcome to Acme Dental</h1>
  <h2>Our Services</h2>
  <h2>Contact Us</h2>
  <h3>Location</h3>
  <p>We provide high quality dental services in Tel Aviv.</p>
</body>
</html>`;

const HTML_WITH_GRAPH = `<!DOCTYPE html>
<html>
<head>
  <title>Graph Test</title>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "name": "Acme Corp" },
      { "@type": "WebSite", "url": "https://acme.com" }
    ]
  }
  </script>
</head>
<body><h1>Graph</h1></body>
</html>`;

const HTML_MALFORMED_JSON_LD = `<!DOCTYPE html>
<html>
<head>
  <title>Malformed JSON-LD</title>
  <script type="application/ld+json">{ not valid json !!!</script>
  <script type="application/ld+json">{ "@type": "Organization" }</script>
</head>
<body><h1>Test</h1></body>
</html>`;

const HTML_SIMPLE = `<!DOCTYPE html>
<html>
<head><title>Simple Page</title></head>
<body>
  <h1>Hello</h1>
  <p>Some content here.</p>
</body>
</html>`;

const ROBOTS_DISALLOW_GPTBOT = `User-agent: GPTBot
Disallow: /

User-agent: *
Allow: /
`;

const ROBOTS_ALLOW_ALL = `User-agent: *
Allow: /
`;

// ---------------------------------------------------------------------------
// Mock result types and helpers
// ---------------------------------------------------------------------------

type OkResult = { ok: true; status: number; headers: Record<string, string>; body: string; finalUrl: string };
type ErrResult = { ok: false; reason: 'bad_scheme' | 'blocked_ip' | 'timeout' | 'too_large' | 'too_many_redirects' | 'network_error'; detail: string };
type FetchResult = OkResult | ErrResult;

function makeOkResult(body: string, status = 200, url = 'http://example.com/'): OkResult {
  return { ok: true, status, headers: {}, body, finalUrl: url };
}

function makeErrorResult(
  reason: ErrResult['reason'] = 'network_error',
): ErrResult {
  return { ok: false, reason, detail: 'mock error' };
}

/** Sets up mockSafeFetch to dispatch by URL suffix. */
function setupMocks(configs: {
  target?: FetchResult;
  robots?: FetchResult;
  sitemap?: FetchResult;
  llms?: FetchResult;
}) {
  mockSafeFetch.mockImplementation(async (url: string) => {
    if (url.endsWith('/robots.txt')) return configs.robots ?? makeErrorResult();
    if (url.endsWith('/sitemap.xml')) return configs.sitemap ?? makeErrorResult();
    if (url.endsWith('/llms.txt')) return configs.llms ?? makeErrorResult();
    return configs.target ?? makeErrorResult();
  });
}

// ---------------------------------------------------------------------------
// JSON-LD parsing
// ---------------------------------------------------------------------------

describe('auditSite() — JSON-LD parsing', () => {
  it('(1) parses JSON-LD LocalBusiness @type from HTML fixture', async () => {
    setupMocks({
      target: makeOkResult(HTML_WITH_LOCAL_BUSINESS),
      robots: makeOkResult(ROBOTS_ALLOW_ALL, 200, 'http://example.com/robots.txt'),
      sitemap: makeErrorResult(),
      llms: makeErrorResult(),
    });

    const result = await auditSite('http://example.com/');

    expect(result.page.fetchStatus).toBe('ok');
    expect(result.page.title).toBe('Acme Dental Clinic');
    expect(result.page.metaDescription).toBe('Expert dental care in Tel Aviv');
    expect(result.page.h1Count).toBe(1);
    expect(result.page.h2Count).toBe(2);
    expect(result.page.h3Count).toBe(1);
    expect(result.page.jsonLdTypes).toContain('LocalBusiness');
    expect(typeof result.page.wordCount).toBe('number');
    expect(result.page.wordCount).toBeGreaterThan(0);
  });

  it('(9) JSON-LD with @graph array is recursively parsed', async () => {
    setupMocks({
      target: makeOkResult(HTML_WITH_GRAPH),
      robots: makeErrorResult(),
      sitemap: makeErrorResult(),
      llms: makeErrorResult(),
    });

    const result = await auditSite('http://example.com/');
    expect(result.page.fetchStatus).toBe('ok');
    expect(result.page.jsonLdTypes).toContain('Organization');
    expect(result.page.jsonLdTypes).toContain('WebSite');
  });

  it('(10) malformed JSON-LD does not throw — valid blocks still parsed', async () => {
    setupMocks({
      target: makeOkResult(HTML_MALFORMED_JSON_LD),
      robots: makeErrorResult(),
      sitemap: makeErrorResult(),
      llms: makeErrorResult(),
    });

    const result = await auditSite('http://example.com/');
    // auditSite must never throw
    expect(result.page.fetchStatus).toBe('ok');
    // The valid JSON-LD block (Organization) must still be parsed
    expect(result.page.jsonLdTypes).toContain('Organization');
  });
});

// ---------------------------------------------------------------------------
// robots.txt — FM-5 guard
// ---------------------------------------------------------------------------

describe('auditSite() — robots.txt FM-5 guard', () => {
  it('(2) OMITS crawlers map when robots.txt returns 503 (FM-5 guard)', async () => {
    setupMocks({
      target: makeOkResult(HTML_SIMPLE),
      // 503 — must NOT produce a crawlers map. Never infer blocked from server error.
      robots: makeOkResult('', 503, 'http://example.com/robots.txt'),
      sitemap: makeErrorResult(),
      llms: makeErrorResult(),
    });

    const result = await auditSite('http://example.com/');
    expect(result.robotsTxt.fetchStatus).toBe('unavailable');
    // Crawlers field must be absent when unavailable
    expect('crawlers' in result.robotsTxt).toBe(false);
  });

  it('(8) OMITS crawlers map on robots.txt network error (FM-5)', async () => {
    setupMocks({
      target: makeOkResult(HTML_SIMPLE),
      robots: makeErrorResult('network_error'),
      sitemap: makeErrorResult(),
      llms: makeErrorResult(),
    });

    const result = await auditSite('http://example.com/');
    expect(result.robotsTxt.fetchStatus).toBe('unavailable');
    expect('crawlers' in result.robotsTxt).toBe(false);
  });

  it('(8b) OMITS crawlers map on robots.txt timeout (FM-5)', async () => {
    setupMocks({
      target: makeOkResult(HTML_SIMPLE),
      robots: makeErrorResult('timeout'),
      sitemap: makeErrorResult(),
      llms: makeErrorResult(),
    });

    const result = await auditSite('http://example.com/');
    expect(result.robotsTxt.fetchStatus).toBe('unavailable');
    expect('crawlers' in result.robotsTxt).toBe(false);
  });

  it('(8c) OMITS crawlers map on robots.txt 404 (FM-5 — 404 ≠ disallowed)', async () => {
    setupMocks({
      target: makeOkResult(HTML_SIMPLE),
      // HTTP 404 → non-200 → unavailable. Never infer blocked from absence.
      robots: makeOkResult('Not Found', 404, 'http://example.com/robots.txt'),
      sitemap: makeErrorResult(),
      llms: makeErrorResult(),
    });

    const result = await auditSite('http://example.com/');
    expect(result.robotsTxt.fetchStatus).toBe('unavailable');
    expect('crawlers' in result.robotsTxt).toBe(false);
  });

  it('(3) GPTBot=disallowed when robots.txt Disallows GPTBot', async () => {
    setupMocks({
      target: makeOkResult(HTML_SIMPLE),
      robots: makeOkResult(ROBOTS_DISALLOW_GPTBOT, 200, 'http://example.com/robots.txt'),
      sitemap: makeErrorResult(),
      llms: makeErrorResult(),
    });

    const result = await auditSite('http://example.com/');
    expect(result.robotsTxt.fetchStatus).toBe('ok');
    if (result.robotsTxt.fetchStatus === 'ok') {
      expect(result.robotsTxt.crawlers['GPTBot']).toBe('disallowed');
      // Other crawlers not restricted should be allowed
      expect(result.robotsTxt.crawlers['PerplexityBot']).toBe('allowed');
    }
  });

  it('(7) all crawlers=allowed when robots.txt has Allow: / for *', async () => {
    setupMocks({
      target: makeOkResult(HTML_SIMPLE),
      robots: makeOkResult(ROBOTS_ALLOW_ALL, 200, 'http://example.com/robots.txt'),
      sitemap: makeErrorResult(),
      llms: makeErrorResult(),
    });

    const result = await auditSite('http://example.com/');
    expect(result.robotsTxt.fetchStatus).toBe('ok');
    if (result.robotsTxt.fetchStatus === 'ok') {
      const values = Object.values(result.robotsTxt.crawlers);
      expect(values.every((v) => v === 'allowed')).toBe(true);
      // All 7 AI crawlers must be present
      expect(Object.keys(result.robotsTxt.crawlers).length).toBe(7);
      expect(result.robotsTxt.crawlers).toHaveProperty('GPTBot');
      expect(result.robotsTxt.crawlers).toHaveProperty('Google-Extended');
      expect(result.robotsTxt.crawlers).toHaveProperty('PerplexityBot');
      expect(result.robotsTxt.crawlers).toHaveProperty('ChatGPT-User');
      expect(result.robotsTxt.crawlers).toHaveProperty('CCBot');
      expect(result.robotsTxt.crawlers).toHaveProperty('Claude-Web');
      expect(result.robotsTxt.crawlers).toHaveProperty('anthropic-ai');
    }
  });

  it('(3b) robots.isAllowed evaluates site root URL — Disallow: / blocks all crawlers on site root', async () => {
    // This fixture disallows GPTBot on everything (Disallow: /)
    // and allows everyone else. We verify GPTBot is disallowed
    // and that the fix (passing siteRoot, not robotsUrl) correctly evaluates "/" rules.
    const ROBOTS_DISALLOW_GPTBOT_ROOT = `User-agent: GPTBot\nDisallow: /\n\nUser-agent: *\nAllow: /\n`;
    setupMocks({
      target: makeOkResult(HTML_SIMPLE),
      robots: makeOkResult(ROBOTS_DISALLOW_GPTBOT_ROOT, 200, 'http://example.com/robots.txt'),
      sitemap: makeErrorResult(),
      llms: makeErrorResult(),
    });

    const result = await auditSite('http://example.com/');
    expect(result.robotsTxt.fetchStatus).toBe('ok');
    if (result.robotsTxt.fetchStatus === 'ok') {
      // GPTBot disallowed — the rule "Disallow: /" applies to the site root "/"
      // If we had incorrectly passed robotsUrl (/robots.txt), the rule for "/" would
      // still fire because /robots.txt starts with /, but that's coincidental.
      // The explicit test is that a Disallow for a subpath only blocks that subpath.
      expect(result.robotsTxt.crawlers['GPTBot']).toBe('disallowed');
      // PerplexityBot has no specific rule → uses wildcard Allow: / → allowed
      expect(result.robotsTxt.crawlers['PerplexityBot']).toBe('allowed');
    }
  });

  it('(3c) robots.isAllowed evaluates site root — Disallow: /private does NOT block site root access', async () => {
    // Disallow: /private should NOT block crawling of "/" (site root).
    // This verifies that the URL passed to isAllowed is the site root (not /robots.txt or /private).
    const ROBOTS_DISALLOW_PRIVATE = `User-agent: GPTBot\nDisallow: /private\n`;
    setupMocks({
      target: makeOkResult(HTML_SIMPLE),
      robots: makeOkResult(ROBOTS_DISALLOW_PRIVATE, 200, 'http://example.com/robots.txt'),
      sitemap: makeErrorResult(),
      llms: makeErrorResult(),
    });

    const result = await auditSite('http://example.com/');
    expect(result.robotsTxt.fetchStatus).toBe('ok');
    if (result.robotsTxt.fetchStatus === 'ok') {
      // /private is disallowed, but site root "/" is allowed — GPTBot should be 'allowed'
      expect(result.robotsTxt.crawlers['GPTBot']).toBe('allowed');
    }
  });
});

// ---------------------------------------------------------------------------
// Target page errors
// ---------------------------------------------------------------------------

describe('auditSite() — target page errors', () => {
  it('(4) page.fetchStatus=unavailable when safeFetch fails — auditSite never throws', async () => {
    setupMocks({
      target: makeErrorResult('network_error'),
      robots: makeErrorResult(),
      sitemap: makeErrorResult(),
      llms: makeErrorResult(),
    });

    // Must not throw
    const result = await auditSite('http://example.com/');
    expect(result.page.fetchStatus).toBe('unavailable');
  });

  it('page.fetchStatus=unavailable when target returns 500', async () => {
    setupMocks({
      target: makeOkResult('Internal Error', 500),
      robots: makeErrorResult(),
      sitemap: makeErrorResult(),
      llms: makeErrorResult(),
    });

    const result = await auditSite('http://example.com/');
    expect(result.page.fetchStatus).toBe('unavailable');
  });
});

// ---------------------------------------------------------------------------
// sitemap.xml + llms.txt presence
// ---------------------------------------------------------------------------

describe('auditSite() — sitemap + llms.txt presence', () => {
  it('(5) sitemapXml.present=true when /sitemap.xml returns 200', async () => {
    setupMocks({
      target: makeOkResult(HTML_SIMPLE),
      robots: makeErrorResult(),
      sitemap: makeOkResult('<?xml version="1.0"?><sitemapindex/>', 200),
      llms: makeErrorResult(),
    });

    const result = await auditSite('http://example.com/');
    expect(result.sitemapXml.present).toBe(true);
  });

  it('sitemapXml.present=false when /sitemap.xml returns 404', async () => {
    setupMocks({
      target: makeOkResult(HTML_SIMPLE),
      robots: makeErrorResult(),
      sitemap: makeOkResult('Not Found', 404),
      llms: makeErrorResult(),
    });

    const result = await auditSite('http://example.com/');
    expect(result.sitemapXml.present).toBe(false);
  });

  it('(6) llmsTxt.present=true when /llms.txt returns 200', async () => {
    setupMocks({
      target: makeOkResult(HTML_SIMPLE),
      robots: makeErrorResult(),
      sitemap: makeErrorResult(),
      llms: makeOkResult('# LLMs.txt content', 200),
    });

    const result = await auditSite('http://example.com/');
    expect(result.llmsTxt.present).toBe(true);
  });

  it('llmsTxt.present=false when /llms.txt returns network error', async () => {
    setupMocks({
      target: makeOkResult(HTML_SIMPLE),
      robots: makeErrorResult(),
      sitemap: makeErrorResult(),
      llms: makeErrorResult('network_error'),
    });

    const result = await auditSite('http://example.com/');
    expect(result.llmsTxt.present).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Word count memory cap
// ---------------------------------------------------------------------------

describe('auditSite() — word count cap', () => {
  it('(11) word count is still non-zero when page body text exceeds 200 KB', async () => {
    // Build a page with >200 KB of body text to exercise the cap path.
    // The word count should be meaningful (non-zero) but bounded — it will NOT
    // count all words in the full body, just those in the first ~200 KB.
    const manyWords = 'word '.repeat(50_000); // ~250 KB
    const bigHtml = `<!DOCTYPE html><html><head><title>Big Page</title></head><body><p>${manyWords}</p></body></html>`;

    setupMocks({
      target: makeOkResult(bigHtml),
      robots: makeErrorResult(),
      sitemap: makeErrorResult(),
      llms: makeErrorResult(),
    });

    const result = await auditSite('http://example.com/');
    expect(result.page.fetchStatus).toBe('ok');
    // wordCount should be non-zero (text was present)
    expect(result.page.wordCount).toBeGreaterThan(0);
    // wordCount should be capped — 250 KB of "word " → cap at 200 KB → ~40 000 words
    // not the full 50 000. Allow some slack for the cap boundary.
    expect(result.page.wordCount).toBeLessThan(50_000);
  });
});

// ---------------------------------------------------------------------------
// Result shape invariants
// ---------------------------------------------------------------------------

describe('auditSite() — result shape invariants', () => {
  it('always includes url, fetchedAt, page, robotsTxt, sitemapXml, llmsTxt', async () => {
    setupMocks({
      target: makeErrorResult(),
      robots: makeErrorResult(),
      sitemap: makeErrorResult(),
      llms: makeErrorResult(),
    });

    const result = await auditSite('http://example.com/');
    expect(result).toHaveProperty('url', 'http://example.com/');
    expect(result).toHaveProperty('fetchedAt');
    expect(result).toHaveProperty('page');
    expect(result).toHaveProperty('robotsTxt');
    expect(result).toHaveProperty('sitemapXml');
    expect(result).toHaveProperty('llmsTxt');
    // fetchedAt must be a valid ISO 8601 string
    expect(typeof result.fetchedAt).toBe('string');
    expect(new Date(result.fetchedAt).toISOString()).toBe(result.fetchedAt);
  });

  it('handles an invalid URL without throwing', async () => {
    // auditSite must never throw — invalid URL returns unavailable for all fields
    const result = await auditSite('not-a-valid-url');
    expect(result.page.fetchStatus).toBe('unavailable');
    expect(result.robotsTxt.fetchStatus).toBe('unavailable');
    expect(result.sitemapXml.present).toBe(false);
    expect(result.llmsTxt.present).toBe(false);
  });
});
