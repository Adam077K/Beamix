/**
 * brand-extractor.ts — Extract brand/business mentions from LLM response text.
 *
 * Combines exact string matching with fuzzy word-boundary matching.
 * Normalises names before comparing to handle casing and punctuation.
 */

// ─── Normalise helper ──────────────────────────────────────────────────────

function normalise(s: string): string {
  return s
    .toLowerCase()
    .replace(/[''`]/g, '')
    .replace(/[^a-z0-9\u0080-\uFFFF\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Build a loose word-boundary pattern that tolerates:
 * - different casing
 * - optional dots between words
 * - surrounding punctuation
 */
function buildPattern(name: string): RegExp {
  const escaped = normalise(name)
    .split(/\s+/)
    .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('[\\s\\-_.]*');
  // Use word boundaries if ASCII, lookahead/behind for Unicode names
  return new RegExp(`(?<![\\w])${escaped}(?![\\w])`, 'gi');
}

/**
 * Extract brand mentions from an LLM response.
 *
 * @param responseText  Raw LLM output text.
 * @param knownBrands   Candidate brand names to detect (can include own business + competitors).
 * @returns Deduplicated list of brand names that appear in the text.
 */
export function extractBrands(responseText: string, knownBrands: string[]): string[] {
  if (!responseText || knownBrands.length === 0) return [];

  const found = new Set<string>();

  for (const brand of knownBrands) {
    if (!brand.trim()) continue;
    try {
      const pattern = buildPattern(brand);
      if (pattern.test(responseText)) {
        found.add(brand);
      }
    } catch {
      // Malformed pattern — fallback to normalised includes check
      if (responseText.toLowerCase().includes(normalise(brand))) {
        found.add(brand);
      }
    }
  }

  return [...found];
}

/**
 * Estimate rank position of a brand mention.
 *
 * Scans the response for numbered list indicators near the brand name.
 * Returns null when rank cannot be determined.
 */
export function estimateRankPosition(
  responseText: string,
  brandName: string,
): number | null {
  if (!responseText || !brandName.trim()) return null;

  // Look for patterns like "1. BrandName", "1) BrandName", "#1 BrandName",
  // or "BrandName" appearing as first recommendation.
  const numberedPattern = /(\d+)[.)]\s{0,5}/g;
  const lines = responseText.split('\n');

  for (const line of lines) {
    const normLine = normalise(line);
    const normBrand = normalise(brandName);
    if (!normLine.includes(normBrand)) continue;

    const match = numberedPattern.exec(line);
    if (match) {
      const rank = parseInt(match[1], 10);
      if (rank >= 1 && rank <= 20) return rank;
    }

    // Reset lastIndex for global regex
    numberedPattern.lastIndex = 0;

    // Try to infer position from "first" / "top" / "best" language
    if (/\b(first|top|best|#1|number one|number 1)\b/i.test(line)) return 1;
    if (/\b(second|#2|number two|number 2)\b/i.test(line)) return 2;
    if (/\b(third|#3|number three|number 3)\b/i.test(line)) return 3;
  }

  return null;
}
