/**
 * Discovery Agent — Tool Definitions
 *
 * Three tools passed to the Anthropic Messages API:
 *   1. fetch_site_content — crawls URL with Cheerio, extracts text content
 *   2. fetch_gbp          — stub returning {error: 'not_implemented'}
 *   3. emit_brand_fingerprint — validates + returns the BrandFingerprint
 *
 * emit_brand_fingerprint schema matches brand_fingerprints table columns 1:1.
 */

import * as cheerio from 'cheerio';
import { randomUUID } from 'crypto';
import { BrandFingerprintSchema } from './types';
import type { BrandFingerprint, GBPResult, SiteCrawlResult } from './types';
import type Anthropic from '@anthropic-ai/sdk';

// ---------------------------------------------------------------------------
// Anthropic tool definitions (passed to messages.create)
// ---------------------------------------------------------------------------

export const DISCOVERY_TOOLS: Anthropic.Tool[] = [
  {
    name: 'fetch_site_content',
    description:
      'Fetches and extracts readable text content from a customer website URL. Returns headlines, description, and up to 3000 characters of body text. Call this at the start of the discovery session before asking questions.',
    input_schema: {
      type: 'object' as const,
      properties: {
        url: {
          type: 'string',
          description: 'The full URL to crawl (e.g. https://acme.com)',
        },
      },
      required: ['url'],
    },
  },
  {
    name: 'fetch_gbp',
    description:
      'Fetches Google Business Profile data for local-vertical businesses (dental, legal, etc). Currently returns a stub — will be implemented in Wave 2 with the Google Places API integration.',
    input_schema: {
      type: 'object' as const,
      properties: {
        business_name: {
          type: 'string',
          description: 'The canonical business name to look up',
        },
      },
      required: ['business_name'],
    },
  },
  {
    name: 'emit_brand_fingerprint',
    description:
      'Call ONCE at the end of the discovery conversation when you have gathered enough information. Validates the brand fingerprint schema and writes it to the database. Do NOT call mid-conversation.',
    input_schema: {
      type: 'object' as const,
      properties: {
        voice: {
          type: 'object',
          description: 'Brand voice parameters',
          properties: {
            tone_descriptors: { type: 'array', items: { type: 'string' } },
            reading_level: { type: 'string', enum: ['8', '10', '12', 'college'] },
            person: { type: 'string', enum: ['first', 'third'] },
            humor: { type: 'string', enum: ['none', 'dry', 'warm'] },
            forbidden_phrases: { type: 'array', items: { type: 'string' } },
            preferred_phrases: { type: 'array', items: { type: 'string' } },
            voice_samples: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  source: { type: 'string' },
                  text: { type: 'string' },
                },
                required: ['source', 'text'],
              },
            },
          },
          required: [
            'tone_descriptors',
            'reading_level',
            'person',
            'humor',
            'forbidden_phrases',
            'preferred_phrases',
            'voice_samples',
          ],
        },
        icp: {
          type: 'object',
          description: 'Ideal customer profile',
          properties: {
            primary_segment: { type: 'string' },
            secondary_segments: { type: 'array', items: { type: 'string' } },
            buyer_jtbd: { type: 'string' },
            decision_triggers: { type: 'array', items: { type: 'string' } },
          },
          required: ['primary_segment', 'secondary_segments', 'buyer_jtbd', 'decision_triggers'],
        },
        offerings: {
          type: 'array',
          description: 'Products/services with positioning',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              is_primary: { type: 'boolean' },
              geo_constraints: { type: 'array', items: { type: 'string' } },
              service_area_km: { type: ['number', 'null'] },
            },
            required: ['name', 'is_primary', 'geo_constraints', 'service_area_km'],
          },
        },
        authoritative_citations: {
          type: 'array',
          items: { type: 'string' },
          description: 'External sources the customer trusts',
        },
        do_list: {
          type: 'array',
          items: { type: 'string' },
          description: 'Things the brand should always do in content',
        },
        dont_list: {
          type: 'array',
          items: { type: 'string' },
          description: 'Things the brand should never do in content',
        },
        owner_identity: {
          type: 'object',
          description: 'Business owner identity for email-as-them workflows',
          properties: {
            name: { type: 'string' },
            title: { type: 'string' },
            linkedin_url: { type: ['string', 'null'] },
            photo_url: { type: ['string', 'null'] },
          },
          required: ['name', 'title', 'linkedin_url', 'photo_url'],
        },
        discovery_transcript_url: {
          type: ['string', 'null'],
          description: 'URL to the stored transcript, if recorded',
        },
        confidence_score: {
          type: 'number',
          minimum: 0,
          maximum: 1,
          description: 'Overall confidence in the fingerprint quality (0.0–1.0)',
        },
        evidence_links: {
          type: 'object',
          description:
            'Per-field evidence map. Keys are field paths; values are source references like "transcript:turn_3" or "site_crawl:about" or "not_captured"',
          additionalProperties: { type: 'string' },
        },
        requires_human_approval: {
          type: 'boolean',
          description: 'Set to true when YMYL content detected',
        },
        competitor_set: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              url: { type: ['string', 'null'] },
              relationship: { type: 'string', enum: ['direct', 'adjacent', 'aspirational'] },
            },
            required: ['name', 'url', 'relationship'],
          },
        },
        approval_style: {
          type: 'object',
          properties: {
            default_mode: { type: 'string', enum: ['auto', 'digest_one_click', 'always_human'] },
            ymyl_override: { type: 'string', enum: ['always_human'] },
            preferred_review_cadence: { type: 'string', enum: ['weekly', 'biweekly'] },
          },
          required: ['default_mode', 'ymyl_override', 'preferred_review_cadence'],
        },
        hard_nos: {
          type: 'object',
          properties: {
            topics: { type: 'array', items: { type: 'string' } },
            claims: { type: 'array', items: { type: 'string' } },
            competitors_to_never_compare: { type: 'array', items: { type: 'string' } },
          },
          required: ['topics', 'claims', 'competitors_to_never_compare'],
        },
      },
      required: [
        'voice',
        'icp',
        'offerings',
        'authoritative_citations',
        'do_list',
        'dont_list',
        'owner_identity',
        'discovery_transcript_url',
        'confidence_score',
        'evidence_links',
        'requires_human_approval',
        'competitor_set',
        'approval_style',
        'hard_nos',
      ],
    },
  },
];

// ---------------------------------------------------------------------------
// Tool executor functions
// ---------------------------------------------------------------------------

/**
 * Fetch and parse site content using Cheerio.
 * Gracefully returns an empty result if the site blocks crawlers.
 */
export async function executeFetchSiteContent(url: string): Promise<SiteCrawlResult> {
  const fetchedAt = new Date().toISOString();

  let html: string;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Beamix-Discovery-Bot/1.0 (business intelligence crawler)',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      return {
        url,
        title: '',
        description: '',
        headlines: [],
        bodyText: `Fetch failed: HTTP ${res.status}`,
        isEmpty: true,
        fetchedAt,
      };
    }

    html = await res.text();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown fetch error';
    return {
      url,
      title: '',
      description: '',
      headlines: [],
      bodyText: `Fetch error: ${message}`,
      isEmpty: true,
      fetchedAt,
    };
  }

  const $ = cheerio.load(html);

  // Remove script, style, nav, footer noise
  $('script, style, nav, footer, header, iframe, noscript').remove();

  const title = $('title').first().text().trim();
  const description =
    $('meta[name="description"]').attr('content')?.trim() ??
    $('meta[property="og:description"]').attr('content')?.trim() ??
    '';

  // Extract headings
  const headlines: string[] = [];
  $('h1, h2, h3').each((_, el) => {
    const text = $(el).text().trim();
    if (text && headlines.length < 20) {
      headlines.push(text);
    }
  });

  // Extract body text from meaningful content areas
  const bodyText = $('main, article, .content, #content, body')
    .first()
    .text()
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 3_000);

  const isEmpty = !title && !description && headlines.length === 0 && !bodyText;

  return {
    url,
    title,
    description,
    headlines,
    bodyText,
    isEmpty,
    fetchedAt,
  };
}

/**
 * GBP fetch stub — Wave 2 will integrate Google Places API.
 */
export function executeFetchGBP(_businessName: string): GBPResult {
  return { error: 'not_implemented' };
}

// ---------------------------------------------------------------------------
// Session context — server-side values that must NOT come from LLM tool input
// ---------------------------------------------------------------------------

export interface SessionContext {
  /** The authenticated customer's Supabase user ID. Set by the API route, never trusted from LLM. */
  customerId: string;
}

/**
 * Validates and returns the BrandFingerprint, injecting a fresh brief_version_id.
 * customer_id is always taken from sessionContext — never from LLM tool input.
 * Throws if sessionContext.customerId is missing or if the schema is invalid.
 */
export function executeEmitBrandFingerprint(
  rawInput: Record<string, unknown>,
  sessionContext: SessionContext,
): BrandFingerprint {
  // SECURITY: customer_id must come from the server-side session, never from LLM tool input.
  // If the LLM somehow included customer_id in its tool call, it is silently overridden here.
  if (!sessionContext.customerId) {
    throw new Error(
      'executeEmitBrandFingerprint: sessionContext.customerId is missing — cannot persist fingerprint without a verified customer ID',
    );
  }

  // Strip any LLM-provided customer_id to prevent injection
  const { customer_id: _stripped, ...safeInput } = rawInput;
  void _stripped; // intentionally discarded

  // Inject brief_version_id — always a fresh UUID v4 on every emit
  const inputWithVersion = {
    ...safeInput,
    customer_id: sessionContext.customerId, // Server-pinned — authoritative
    brief_version_id: randomUUID(),
    adam_reviewed_at: null, // Always null at creation — Adam reviews manually
  };

  const result = BrandFingerprintSchema.safeParse(inputWithVersion);

  if (!result.success) {
    throw new Error(
      `Brand fingerprint schema validation failed: ${result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`,
    );
  }

  return result.data;
}
