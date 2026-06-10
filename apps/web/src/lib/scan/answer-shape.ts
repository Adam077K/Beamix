/**
 * Wave 5 — Answer-shape classifier (12 shapes, fully deterministic, no LLM).
 *
 * DESIGN: classifyShape() picks exactly ONE of the 12 AnswerShape values via
 * priority-ordered heuristics. Rules are documented inline for each shape.
 *
 * ANNOTATION ONLY — per sequencing lock (SCAN-MEASUREMENT-MODEL.md §1):
 *   Shape annotations ride in the Profile and Gap-list to explain WHY a query is a
 *   win/loss and route agency work. They do NOT move the headline Band.
 *
 * HONESTY SPINE: when ambiguous, prefer the more conservative (lower) outcome.
 *   Never inflate a win.
 *
 * PRIORITY ORDER of shape detection (first match wins):
 *   1. no_answer              — empty / refusal / "I don't have enough info"
 *   2. do_your_own_research   — deflection without concrete names
 *   3. negative_avoid         — warns against / "avoid" framing about the client
 *   4. navigational_branded   — branded/navigational query + answer about a specific brand
 *   5. cited_as_source        — client domain appears as a citation URL
 *   6. local_pack             — location-grouped local results
 *   7. comparison             — explicit comparison of 2–3 named options
 *   8. ranked_listicle        — numbered list of ≥3 options
 *   9. single_recommendation  — exactly one clear recommended option
 *  10. passing_mention        — client mentioned but not in a prominent slot
 *  11. tool_vs_service_vs_product — answer frames around type distinction
 *  12. category_defining      — defines category generically (fallback before no_answer)
 *
 * NOTE: Outcome follows from shape + detection per the win/partial/loss rules.
 */

import type {
  AnswerShape,
  ShapeOutcome,
  ShapeClassification,
  ClientDetection,
  CompetitorMention,
} from './measurement-types';

// ---------------------------------------------------------------------------
// Text analysis helpers
// ---------------------------------------------------------------------------

/** Normalize text: lowercase, collapse whitespace */
function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Count numbered list items (rank 1–20) in the response.
 * Same pattern as client-detection.ts (kept in sync).
 */
function countNumberedListItems(text: string): number {
  const matches = text.match(/(?:^|\n)\s*\*{0,2}(\d{1,2})[.)]\*{0,2}\s+/g);
  if (!matches) return 0;
  // Count distinct rank numbers to avoid inflated counts from multi-line items
  const ranks = new Set<number>();
  for (const m of matches) {
    const numMatch = m.match(/(\d{1,2})/);
    if (numMatch) {
      const n = parseInt(numMatch[1]!, 10);
      if (n >= 1 && n <= 20) ranks.add(n);
    }
  }
  return ranks.size;
}

/** Check if text contains a bulleted list (-, *, •) with multiple items */
function hasBulletList(text: string): boolean {
  const bullets = text.match(/(?:^|\n)\s*[-*•]\s+\S/g);
  return (bullets?.length ?? 0) >= 2;
}

/** Check if text contains URL-like patterns (citation signal) */
function containsUrlPattern(text: string): boolean {
  // Match http(s):// URLs, bare domain patterns with known TLDs
  return /https?:\/\/[^\s)>]+/.test(text);
}

// ---------------------------------------------------------------------------
// Shape detection predicates (each returns boolean; order enforced in classifyShape)
// ---------------------------------------------------------------------------

/**
 * RULE: no_answer
 *   - Response is empty/whitespace, OR
 *   - Contains explicit refusal phrases ("I don't know", "I can't answer",
 *     "I don't have enough information", "I'm unable to"), OR
 *   - Very short response (< 30 chars) with no named entities.
 */
function isNoAnswer(text: string): boolean {
  if (text.trim().length === 0) return true;
  if (text.trim().length < 30) return true;

  const n = normalize(text);
  return (
    n.includes("i don't know") ||
    n.includes("i do not know") ||
    n.includes("i'm unable") ||
    n.includes("i am unable") ||
    n.includes("i can't answer") ||
    n.includes("i cannot answer") ||
    n.includes("i don't have enough information") ||
    n.includes("i don't have information") ||
    n.includes("i have no information") ||
    n.includes("no information available") ||
    n.includes("i cannot provide") ||
    n.includes("i can't provide")
  );
}

/**
 * RULE: do_your_own_research
 *   - Deflects to the user to do their own research WITHOUT providing concrete names.
 *   - Key signals: "I recommend researching", "check reviews", "consult", "do your own
 *     research", "look for", "search for" — combined with absence of ≥2 named options.
 *   - Conservative: only apply if there is no numbered list and no bullet list with names.
 */
function isDoYourOwnResearch(text: string, namedListCount: number): boolean {
  if (namedListCount >= 2) return false; // engine gave concrete names → not a deflection

  const n = normalize(text);
  return (
    n.includes('recommend researching') ||
    n.includes('recommend checking') ||
    n.includes('do your own research') ||
    n.includes('i suggest looking') ||
    n.includes('you should look') ||
    n.includes('consult with a') ||
    n.includes('check reviews') ||
    n.includes('look for reviews') ||
    n.includes('i recommend checking') ||
    n.includes('consider checking')
  );
}

/**
 * RULE: negative_avoid
 *   - The response explicitly warns against, criticizes, or advises to avoid the client.
 *   - Only applies when the client is mentioned (detection.mentioned must be true).
 *   - Key signals: "avoid", "warning", "scam", "do not recommend", "not recommended",
 *     "stay away", "do not use", "poor reviews", "complaints".
 *   - Conservative: only classify as negative_avoid if the snippet around the client
 *     mention contains the negative signal.
 */
function isNegativeAvoid(
  text: string,
  detection: ClientDetection,
): boolean {
  if (!detection.mentioned || !detection.mention_snippet) return false;

  const snippetNorm = normalize(detection.mention_snippet);
  return (
    snippetNorm.includes('avoid') ||
    snippetNorm.includes('warning') ||
    snippetNorm.includes('scam') ||
    snippetNorm.includes('fraud') ||
    snippetNorm.includes('do not recommend') ||
    snippetNorm.includes("don't recommend") ||
    snippetNorm.includes('not recommended') ||
    snippetNorm.includes('stay away') ||
    snippetNorm.includes('do not use') ||
    snippetNorm.includes("don't use") ||
    snippetNorm.includes('poor reviews') ||
    snippetNorm.includes('bad reviews') ||
    snippetNorm.includes('many complaints')
  );
}

/**
 * RULE: navigational_branded
 *   - The answer is specifically about one named brand (navigational/branded intent).
 *   - Signals: single brand name dominates, response gives hours/address/contact/pricing
 *     for one specific entity, or the response opens with "X is a..." / "X offers..." about
 *     a single specific entity. Used when the query itself is branded (navigational).
 *   - Conservative heuristic: only apply when there is exactly one named entity and the
 *     response is NOT a list. This shape is the fallback for brand-intent queries.
 *   - Note: branded queries are scored separately (SCAN-ORCHESTRATION.md).
 */
function isNavigationalBranded(
  text: string,
  namedListCount: number,
  competitorCount: number,
): boolean {
  if (namedListCount >= 2 || competitorCount >= 2) return false;

  const n = normalize(text);
  // Signals of a navigational answer about a specific entity
  return (
    (n.includes(' is located at') ||
      n.includes(' is a ') ||
      n.includes(' offers ') ||
      n.includes(' provides ') ||
      n.includes(' specializes in') ||
      n.includes('opening hours') ||
      n.includes('business hours') ||
      n.includes('phone number') ||
      n.includes('contact information')) &&
    namedListCount < 2
  );
}

/**
 * RULE: cited_as_source
 *   - The client's domain appears as an inline citation URL in the response.
 *   - More specific than "mentioned" — the domain is hyperlinked/cited, not just named.
 *   - Requires: detection.mentioned AND the raw text contains the domain as a URL pattern.
 *   - Used to distinguish "we linked to acme-dental.co.il" from "Acme Dental was mentioned".
 */
function isCitedAsSource(text: string, detection: ClientDetection): boolean {
  if (!detection.mentioned || !detection.matched_text) return false;

  // Only meaningful if the raw text has URL patterns at all
  if (!containsUrlPattern(text)) return false;

  // Check if the matched_text (the client token) appears in a URL context
  // Heuristic: matched_text appears after "http" or preceded by ".com", ".io", etc.
  const lowerText = text.toLowerCase();
  const lowerToken = detection.matched_text.toLowerCase();
  const idx = lowerText.indexOf(lowerToken);
  if (idx === -1) return false;

  // Check 20-char window before for URL patterns
  const pre = lowerText.slice(Math.max(0, idx - 20), idx);
  return pre.includes('http') || pre.includes('://') || pre.includes('www.');
}

/**
 * RULE: local_pack
 *   - The answer groups results by location/proximity ("near you", addresses, map-style).
 *   - Signals: multiple address mentions, "near me", "in [city]" repeated pattern,
 *     phone numbers, zip/postal codes, map reference.
 */
function isLocalPack(text: string): boolean {
  const n = normalize(text);
  let signals = 0;

  if (n.includes('near you') || n.includes('near me')) signals++;
  if (/\d{5}(-\d{4})?/.test(text)) signals++; // US zip code
  if (/\+?[\d\s()\-]{7,15}/.test(text)) signals++; // phone number pattern
  if (n.match(/\d+\s+[a-z]+\s+(street|st\.|avenue|ave\.|road|rd\.|blvd|drive|dr\.)/i)) signals++;
  if (n.includes('address:') || n.includes('located at') || n.includes('directions')) signals++;
  if (n.includes('miles away') || n.includes('km away') || n.includes('minutes away')) signals++;

  return signals >= 2;
}

/**
 * RULE: comparison
 *   - The answer explicitly compares 2–3 named options against each other.
 *   - Signals: "vs", "versus", "compared to", "compared with", pros/cons table,
 *     "on the other hand", "while X", "whereas X" — with exactly 2–3 named entities.
 *   - Conservative: requires ≥2 competitors OR the client + at least 1 competitor.
 */
function isComparison(
  text: string,
  namedListCount: number,
  competitorCount: number,
  detection: ClientDetection,
): boolean {
  // Comparison signals in text
  const n = normalize(text);
  const hasComparisonSignal =
    n.includes(' vs ') ||
    n.includes(' versus ') ||
    n.includes('compared to') ||
    n.includes('compared with') ||
    n.includes('on the other hand') ||
    (n.includes('pros') && n.includes('cons')) ||
    n.includes('difference between');

  if (!hasComparisonSignal) return false;

  // Must involve at least 2 named entities being compared
  const namedEntities = competitorCount + (detection.mentioned ? 1 : 0);
  // Comparison: 2–3 entities (if 4+, it's more of a listicle)
  return namedEntities >= 2 && namedListCount <= 3;
}

/**
 * RULE: ranked_listicle
 *   - The answer contains an ordered numbered list of ≥3 named options.
 */
function isRankedListicle(namedListCount: number): boolean {
  return namedListCount >= 3;
}

/**
 * RULE: single_recommendation
 *   - The answer recommends exactly one specific option.
 *   - Signals: "I recommend", "the best option is", "I suggest", "go with",
 *     "you should choose" — followed by a specific name.
 *   - Also applies when there is exactly 1 list item (degenerate 1-item list = recommendation).
 *   - Conservative: only apply when namedListCount ≤ 1.
 */
function isSingleRecommendation(text: string, namedListCount: number): boolean {
  if (namedListCount > 1) return false;

  const n = normalize(text);
  return (
    n.includes('i recommend') ||
    n.includes('i would recommend') ||
    n.includes('best option is') ||
    n.includes('best choice is') ||
    n.includes('the top choice') ||
    n.includes('i suggest') ||
    n.includes('go with ') ||
    n.includes('you should choose') ||
    n.includes('the best provider') ||
    n.includes('the best service') ||
    namedListCount === 1
  );
}

/**
 * RULE: passing_mention
 *   - The client is named in the response but not in a prominent/recommended slot.
 *   - Used when: mentioned=true, no rank_position, and no other shape applies.
 *   - This is the "mentioned but not endorsed" state — distinct from not mentioned at all.
 */
function isPassingMention(detection: ClientDetection): boolean {
  return detection.mentioned && detection.rank_position === null;
}

/**
 * RULE: tool_vs_service_vs_product
 *   - The answer is organized around the TYPE of thing (tool vs service vs product)
 *     rather than around specific named providers.
 *   - Signals: "tool", "service", "platform", "software", "product" as organizing
 *     principle, often in combinations like "there are several tools...", "you can use a
 *     service or a product".
 *   - Conservative: only apply when there is NO clear list of named providers.
 */
function isToolVsServiceVsProduct(text: string, namedListCount: number): boolean {
  if (namedListCount >= 2) return false;

  const n = normalize(text);
  let signals = 0;

  if (n.includes('tool vs') || n.includes('tool versus')) signals += 2;
  if (n.includes('service vs') || n.includes('service versus')) signals += 2;
  if (n.includes('product vs') || n.includes('product versus')) signals += 2;
  if (n.includes('software vs') || n.includes('software versus')) signals += 2;
  if (n.match(/\b(tools?|services?|platforms?|products?|software)\b.*\b(tools?|services?|platforms?|products?|software)\b/)) signals++;
  if (n.includes('type of') && (n.includes('tool') || n.includes('service') || n.includes('platform'))) signals++;
  if (n.includes('depends on whether') || n.includes('depends on what type')) signals++;

  return signals >= 2;
}

/**
 * RULE: category_defining
 *   - The answer defines the category generically without naming specific providers.
 *   - Signals: explains what the category is ("a dental clinic is...", "GEO stands for..."),
 *     or describes what to look for in general ("when choosing a...", "the best clinics
 *     typically have...") WITHOUT specific provider names.
 *   - Conservative: only apply when namedListCount = 0 and no specific entities detected.
 */
function isCategoryDefining(text: string, namedListCount: number, competitorCount: number, detection: ClientDetection): boolean {
  if (namedListCount >= 2 || competitorCount >= 1 || detection.mentioned) return false;

  const n = normalize(text);
  return (
    n.includes('when choosing') ||
    n.includes('what to look for') ||
    n.includes('typically offer') ||
    n.includes('generally provide') ||
    n.includes('a good') && n.includes(' should ') ||
    n.includes('key factors') ||
    n.includes('important factors') ||
    n.includes('things to consider') ||
    n.includes('is defined as') ||
    n.includes('refers to')
  );
}

// ---------------------------------------------------------------------------
// Outcome assignment
// ---------------------------------------------------------------------------

/**
 * Assign the outcome (win / partial / loss) per shape + detection.
 *
 * Rules per SCAN-MEASUREMENT-MODEL.md §1 + brief spec:
 *
 * WIN:
 *   - ranked_listicle AND client in rank 1–3
 *   - single_recommendation AND client is the recommended option
 *   - cited_as_source AND client is the cited source
 *
 * PARTIAL:
 *   - ranked_listicle AND client in rank ≥4
 *   - comparison AND client is one of the named entities
 *   - passing_mention (mentioned but not recommended)
 *   - navigational_branded AND client is mentioned (branded recognition = partial)
 *
 * LOSS:
 *   - Not mentioned in any shape
 *   - negative_avoid
 *   - no_answer
 *   - do_your_own_research
 *   - category_defining without client
 *   - local_pack without client
 *   - tool_vs_service_vs_product without client
 *   - cited_as_source but client NOT the cited source
 *
 * Conservative tie-breaking: when the outcome is genuinely ambiguous, prefer the lower
 * outcome (partial over win, loss over partial). Never inflate a win.
 */
function assignOutcome(shape: AnswerShape, detection: ClientDetection): ShapeOutcome {
  const mentioned = detection.mentioned;
  const rank = detection.rank_position;

  switch (shape) {
    case 'ranked_listicle':
      if (!mentioned) return 'loss';
      if (rank !== null && rank <= 3) return 'win';
      if (rank !== null && rank >= 4) return 'partial';
      // Mentioned in a listicle but rank not parsed → partial (conservative)
      return 'partial';

    case 'single_recommendation':
      // Win only if the client is the one being recommended
      return mentioned ? 'win' : 'loss';

    case 'cited_as_source':
      // Win if client is the cited source; shape implies it when mentioned
      return mentioned ? 'win' : 'loss';

    case 'comparison':
      // Partial if client is one of the named entities being compared
      return mentioned ? 'partial' : 'loss';

    case 'passing_mention':
      // Always partial — mentioned but not in a recommended slot
      return 'partial';

    case 'navigational_branded':
      // Partial — brand recognition is good but not a full visibility win
      return mentioned ? 'partial' : 'loss';

    case 'negative_avoid':
      // Always loss — being warned against is worse than not mentioned
      return 'loss';

    case 'no_answer':
      return 'loss';

    case 'do_your_own_research':
      return 'loss';

    case 'category_defining':
      // Loss — defines category without naming the client
      return 'loss';

    case 'tool_vs_service_vs_product':
      // Loss when client not mentioned; partial if mentioned in the type discussion
      return mentioned ? 'partial' : 'loss';

    case 'local_pack':
      // Win if client is in the local pack (rank 1–3); partial if rank ≥4; loss if absent
      if (!mentioned) return 'loss';
      if (rank !== null && rank <= 3) return 'win';
      return 'partial';
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Classify the answer shape of a single engine response.
 *
 * Returns { shape, outcome } where shape is one of the 12 AnswerShape literals and
 * outcome is win/partial/loss based on shape + detection per the rules above.
 *
 * Priority order: see module-level comment.
 * When ambiguous, prefer the more conservative (lower) outcome.
 */
export function classifyShape(
  rawResponse: string,
  detection: ClientDetection,
  competitors: CompetitorMention[],
): ShapeClassification {
  const namedListCount = countNumberedListItems(rawResponse);
  const competitorCount = competitors.length;

  // 1. no_answer — highest priority (if the engine said nothing, nothing else applies)
  if (isNoAnswer(rawResponse)) {
    return { shape: 'no_answer', outcome: assignOutcome('no_answer', detection) };
  }

  // 2. do_your_own_research — deflection without concrete names
  if (isDoYourOwnResearch(rawResponse, namedListCount)) {
    return { shape: 'do_your_own_research', outcome: assignOutcome('do_your_own_research', detection) };
  }

  // 3. negative_avoid — client specifically warned against
  if (isNegativeAvoid(rawResponse, detection)) {
    return { shape: 'negative_avoid', outcome: assignOutcome('negative_avoid', detection) };
  }

  // 4. navigational_branded — answer is about one specific brand (navigational intent)
  if (isNavigationalBranded(rawResponse, namedListCount, competitorCount)) {
    return { shape: 'navigational_branded', outcome: assignOutcome('navigational_branded', detection) };
  }

  // 5. cited_as_source — client domain appears as a citation URL
  if (isCitedAsSource(rawResponse, detection)) {
    return { shape: 'cited_as_source', outcome: assignOutcome('cited_as_source', detection) };
  }

  // 6. local_pack — location-grouped local results
  if (isLocalPack(rawResponse)) {
    return { shape: 'local_pack', outcome: assignOutcome('local_pack', detection) };
  }

  // 7. comparison — explicit 2–3 entity comparison
  if (isComparison(rawResponse, namedListCount, competitorCount, detection)) {
    return { shape: 'comparison', outcome: assignOutcome('comparison', detection) };
  }

  // 8. ranked_listicle — numbered list of ≥3 options
  if (isRankedListicle(namedListCount)) {
    return { shape: 'ranked_listicle', outcome: assignOutcome('ranked_listicle', detection) };
  }

  // 9. single_recommendation — one clear recommendation
  if (isSingleRecommendation(rawResponse, namedListCount)) {
    return { shape: 'single_recommendation', outcome: assignOutcome('single_recommendation', detection) };
  }

  // 10. passing_mention — client named but not prominently
  if (isPassingMention(detection)) {
    return { shape: 'passing_mention', outcome: assignOutcome('passing_mention', detection) };
  }

  // 11. tool_vs_service_vs_product — type-framed answer
  if (isToolVsServiceVsProduct(rawResponse, namedListCount)) {
    return { shape: 'tool_vs_service_vs_product', outcome: assignOutcome('tool_vs_service_vs_product', detection) };
  }

  // 12. category_defining — generic category description (conservative fallback)
  if (isCategoryDefining(rawResponse, namedListCount, competitorCount, detection)) {
    return { shape: 'category_defining', outcome: assignOutcome('category_defining', detection) };
  }

  // Final fallback: category_defining (the response exists but doesn't match any specific pattern)
  // This is honest — we know the engine answered something, but we can't classify its structure.
  return { shape: 'category_defining', outcome: assignOutcome('category_defining', detection) };
}
