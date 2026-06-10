/**
 * Wave 5 — Code-only client detection and competitor extraction.
 *
 * DESIGN: ALL extraction is deterministic code — no LLM calls in this module.
 * Per SCAN-ORCHESTRATION.md §"Code extraction + code scoring":
 *   "Our code (not an LLM) detects whether the business appeared, its rank,
 *    sentiment, and which competitors emerged — and computes the score."
 *
 * HONESTY SPINE: when a value cannot be determined, it is null — never guessed.
 * "Mentioned but not in a list" and "not mentioned at all" are distinct states.
 */

import type { ClientIdentity, ClientDetection, CompetitorMention } from './measurement-types';

// ---------------------------------------------------------------------------
// Internal helpers — shared by detection and competitor extraction
// ---------------------------------------------------------------------------

/**
 * Extract the bare registrable root from a domain string.
 * Same logic as in probe.ts — duplicated here to keep modules independently
 * importable without circular deps. Keep in sync if the algorithm changes.
 *
 * Exported so dimensions.ts can reuse the same domain-root logic without
 * duplicating the implementation (brief §dimensions.ts "prefer reuse").
 *
 * Returns the first DNS label (e.g. "acme-dental" from "https://www.acme-dental.co.il").
 */
export function extractDomainRoot(domain: string): string {
  let d = domain.replace(/^https?:\/\//i, '');
  d = d.split('/')[0]!;
  d = d.split(':')[0]!;
  d = d.replace(/^www\./i, '');
  const firstLabel = d.split('.')[0] ?? '';
  return firstLabel.toLowerCase();
}

/**
 * Build the normalized set of identity tokens to search for in a raw response.
 *
 * Includes: business_name, full domain, domain root (if ≥3 chars), each alias ≥3 chars.
 * Short aliases (<3 chars) are skipped to avoid false positives — intentional and documented.
 *
 * Returns lowercase tokens for case-insensitive matching.
 */
function buildSearchTokens(identity: ClientIdentity): string[] {
  const tokens: string[] = [];

  const name = identity.business_name.trim();
  if (name.length > 0) tokens.push(name.toLowerCase());

  const domain = identity.domain.trim();
  if (domain.length > 0) {
    tokens.push(domain.toLowerCase());
    const root = extractDomainRoot(domain);
    if (root.length >= 3) tokens.push(root.toLowerCase());
  }

  for (const alias of identity.aliases) {
    const a = alias.trim();
    if (a.length >= 3) tokens.push(a.toLowerCase());
  }

  // Deduplicate
  return [...new Set(tokens)];
}

/**
 * Find the first case-insensitive match of any identity token in the text.
 *
 * Returns { tokenMatched, matchIndex } or null when no match.
 * Tries tokens in order: business_name first, then domain, domain_root, then aliases.
 * The first token that matches wins (so business_name has precedence over domain root).
 */
function findFirstMatch(
  text: string,
  identity: ClientIdentity,
): { tokenMatched: string; matchIndex: number } | null {
  // Build ordered token list (same order as buildSearchTokens but we need the original-case label)
  const orderedTokens: string[] = [];

  const name = identity.business_name.trim();
  if (name.length > 0) orderedTokens.push(name);

  const domain = identity.domain.trim();
  if (domain.length > 0) {
    orderedTokens.push(domain);
    const root = extractDomainRoot(domain);
    if (root.length >= 3) orderedTokens.push(root);
  }

  for (const alias of identity.aliases) {
    const a = alias.trim();
    if (a.length >= 3) orderedTokens.push(a);
  }

  const lowerText = text.toLowerCase();
  for (const token of orderedTokens) {
    const idx = lowerText.indexOf(token.toLowerCase());
    if (idx !== -1) {
      return { tokenMatched: token, matchIndex: idx };
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Ordered-list rank parser
// ---------------------------------------------------------------------------

/**
 * Regex for numbered list items in the various formats AI engines produce:
 *   "1. "   "1) "   "**1.**"   "\n1."
 *
 * Captures the rank number and the rest of the line.
 */
const NUMBERED_ITEM_RE =
  /(?:^|\n)\s*\*{0,2}(\d{1,2})[.)]\*{0,2}\s+(.+)/g;

interface ListItem {
  rank: number;
  text: string;
  /** character offset of this item's text start in the original response */
  textOffset: number;
}

/**
 * Parse all numbered list items from the raw response.
 *
 * Heuristic:
 *   - Matches "1. ", "1) ", "**1.**" style prefixes (common AI engine formats).
 *   - Rank must be in [1, 20] — beyond 20 is likely page-number or footnote noise.
 *   - Text is the remainder of the line; trimmed.
 *   - Items are deduplicated by rank — first occurrence wins (handles repeated numbering
 *     in poorly formatted responses).
 *
 * Returns items sorted by rank ascending.
 */
function parseNumberedListItems(rawResponse: string): ListItem[] {
  const items: Map<number, ListItem> = new Map();
  let match: RegExpExecArray | null;

  NUMBERED_ITEM_RE.lastIndex = 0;
  while ((match = NUMBERED_ITEM_RE.exec(rawResponse)) !== null) {
    const rank = parseInt(match[1]!, 10);
    if (rank < 1 || rank > 20) continue; // outside plausible list range

    const text = match[2]!.trim();
    if (text.length === 0) continue;

    // textOffset: where the captured text starts. match.index is where the full
    // match starts (possibly including a leading \n); the text group is at
    // match.index + (match[0].length - match[2].length).
    const textOffset = match.index + match[0].length - match[2].length;

    if (!items.has(rank)) {
      items.set(rank, { rank, text, textOffset });
    }
  }

  return Array.from(items.values()).sort((a, b) => a.rank - b.rank);
}

/**
 * Find the rank of the client in the ordered list, if present.
 * Returns the 1-based rank or null if the client is not found in any list item.
 *
 * Matching: case-insensitive substring match of any identity token against the item text.
 */
function findRankInList(items: ListItem[], identity: ClientIdentity): number | null {
  const tokens = buildSearchTokens(identity);

  for (const item of items) {
    const lowerText = item.text.toLowerCase();
    for (const token of tokens) {
      if (lowerText.includes(token)) {
        return item.rank;
      }
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Public API — detectClient
// ---------------------------------------------------------------------------

/**
 * Detect whether and how the client appears in the engine's raw response.
 *
 * Algorithm:
 *   1. Scan for any identity token (name, domain, alias) — case-insensitive.
 *   2. If found, parse numbered list items and check if the client is in one.
 *      - In list → rank_position = the list rank.
 *      - Not in list → rank_position = null (mentioned-but-unranked is honest and distinct
 *        from "not mentioned").
 *   3. Extract a ~200-char mention_snippet centered on the first match (for sentiment evidence).
 *
 * HONESTY SPINE: not mentioned → all fields null. Never fabricate a rank.
 */
export function detectClient(rawResponse: string, identity: ClientIdentity): ClientDetection {
  const match = findFirstMatch(rawResponse, identity);

  if (match === null) {
    return {
      mentioned: false,
      rank_position: null,
      matched_text: null,
      mention_snippet: null,
    };
  }

  // Extract snippet: ~200 chars centered on the match
  const SNIPPET_HALF = 100;
  const start = Math.max(0, match.matchIndex - SNIPPET_HALF);
  const end = Math.min(rawResponse.length, match.matchIndex + match.tokenMatched.length + SNIPPET_HALF);
  const mention_snippet = rawResponse.slice(start, end);

  // Parse numbered list and find rank
  const listItems = parseNumberedListItems(rawResponse);
  const rank_position = listItems.length > 0 ? findRankInList(listItems, identity) : null;

  return {
    mentioned: true,
    rank_position,
    matched_text: match.tokenMatched,
    mention_snippet,
  };
}

// ---------------------------------------------------------------------------
// Public API — extractCompetitors
// ---------------------------------------------------------------------------

/**
 * Extract named competitor businesses from the engine's raw response.
 *
 * HEURISTIC DESIGN PRINCIPLES (conservative — a wrong competitor is worse than a missed one):
 *   - Primary signal: numbered/bulleted list items. List position signals prominence.
 *   - Entity extraction: bold "**Name**", or text up to the first dash/colon/comma/period
 *     after any bold markup (common AI formatting: "**Acme Dental** - great for families").
 *   - Exclude the client itself (any identity token match).
 *   - Deduplicate case-insensitively; preserve lowest rank (= most prominent).
 *   - Cap at 10 competitors (defense against over-extraction).
 *   - Outside-list mentions: NOT extracted — too noisy, too ambiguous, too likely to be
 *     the client or a non-competitor reference. Only list items are trusted.
 *
 * This is intentionally conservative: we will miss some competitors mentioned only in
 * prose, but we will not fabricate rankings or misattribute paragraphs as competitor entries.
 */
export function extractCompetitors(
  rawResponse: string,
  identity: ClientIdentity,
): CompetitorMention[] {
  const listItems = parseNumberedListItems(rawResponse);

  if (listItems.length === 0) {
    // Also try bulleted lists when no numbered list found
    return extractFromBulletList(rawResponse, identity);
  }

  return extractFromNumberedList(listItems, identity);
}

// ---------------------------------------------------------------------------
// Competitor extraction helpers
// ---------------------------------------------------------------------------

/** Regex to strip markdown bold markers for entity name extraction */
const BOLD_RE = /\*\*([^*]+)\*\*/;

/**
 * Extract the leading entity name from a list item's text.
 *
 * Strategy (conservative):
 *   1. If the text starts with **bold** → the bold content is the name.
 *   2. Otherwise → take text up to the first separator (dash, colon, comma, period, pipe, parenthesis).
 *   3. Trim whitespace.
 *
 * Returns null if the extracted name is empty or implausibly short (<2 chars).
 */
function extractEntityName(text: string): string | null {
  // Try bold match first (most reliable AI format)
  const boldMatch = BOLD_RE.exec(text);
  if (boldMatch) {
    const name = boldMatch[1]!.trim();
    return name.length >= 2 ? name : null;
  }

  // Fallback: text up to first separator.
  // NOTE: includes em dash (—, U+2014) and en dash (–, U+2013) which AI engines
  // commonly use in list items like "**Bright Smile** — excellent clinic".
  const separatorIdx = text.search(/[-–—:,.(|]/);
  const candidate = separatorIdx > 0 ? text.slice(0, separatorIdx).trim() : text.trim();

  // Sanity check: reject names that look like sentence fragments (contain newlines) or
  // are unreasonably long (>100 chars). Conservative heuristic.
  if (candidate.length < 2 || candidate.length > 100 || candidate.includes('\n')) {
    return null;
  }

  return candidate;
}

/**
 * Check whether a name matches any client identity token (case-insensitive).
 * Used to exclude the client from the competitor list.
 */
function isClientName(name: string, identity: ClientIdentity): boolean {
  const tokens = buildSearchTokens(identity);
  const lowerName = name.toLowerCase();
  return tokens.some((t) => lowerName.includes(t) || t.includes(lowerName));
}

function extractFromNumberedList(
  listItems: ListItem[],
  identity: ClientIdentity,
): CompetitorMention[] {
  const seen = new Map<string, CompetitorMention>();

  for (const item of listItems) {
    const entityName = extractEntityName(item.text);
    if (entityName === null) continue;
    if (isClientName(entityName, identity)) continue;

    const key = entityName.toLowerCase();
    if (!seen.has(key)) {
      seen.set(key, { name: entityName, rank: item.rank });
    }
    // If duplicate, keep the lowest rank (already in map = skip — items are rank-sorted)
  }

  return Array.from(seen.values()).slice(0, 10);
}

/** Regex for bulleted list items: "- ", "* ", "• " */
const BULLET_ITEM_RE = /(?:^|\n)\s*[-*•]\s+(.+)/g;

function extractFromBulletList(
  rawResponse: string,
  identity: ClientIdentity,
): CompetitorMention[] {
  const seen = new Map<string, CompetitorMention>();

  let match: RegExpExecArray | null;
  BULLET_ITEM_RE.lastIndex = 0;

  while ((match = BULLET_ITEM_RE.exec(rawResponse)) !== null && seen.size < 10) {
    const text = match[1]!.trim();
    const entityName = extractEntityName(text);
    if (entityName === null) continue;
    if (isClientName(entityName, identity)) continue;

    const key = entityName.toLowerCase();
    if (!seen.has(key)) {
      // Bullet lists don't carry a rank number
      seen.set(key, { name: entityName, rank: null });
    }
  }

  return Array.from(seen.values()).slice(0, 10);
}
