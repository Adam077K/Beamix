/**
 * competitor-audit.ts — Top-K competitor selection and L1 factor auditing.
 *
 * DESIGN CONTRACT:
 *   - selectTopCompetitors: aggregates named competitors across all engine observations
 *     by frequency (most-named first) then by best (lowest) rank. Deduplicates by
 *     lowercased name. Excludes any competitor whose name matches the client identity.
 *     Returns top k (default 3).
 *
 *   - auditCompetitors: for each competitor with a resolvable domain/URL, runs
 *     deps.auditSite → deps.detectFactors → CompetitorFactorAudit. Bounded by cap (k).
 *     Per-competitor errors are caught and that competitor is SKIPPED (the whole scan
 *     must not fail because one competitor's site is down). A competitor with no
 *     resolvable domain is skipped (we only audit when we have a URL to fetch).
 *
 * INJECTABLE:
 *   All I/O is injected via a deps object so tests run with stubs and make ZERO
 *   network calls. Worker 2 supplies the real SSRF-safe auditSite and detectFactors.
 *
 * HONESTY SPINE:
 *   - The client's own name is excluded from the competitor list.
 *   - Competitors with no resolvable domain are explicitly skipped (never faked).
 *   - Per-competitor audit failures produce no fabricated data — skip only.
 */

import type { CompetitorMention, EngineProbeObservation, ClientIdentity } from './measurement-types';
import type { CompetitorFactorAudit } from './gap-types';
import type { FactorObservation } from './factor-detection';
import type { SiteAudit } from './types';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Check whether a competitor name overlaps with the client identity.
 *
 * Performs a case-insensitive check: if the competitor name is a substring
 * of any identity token, or any identity token is a substring of the name,
 * we treat it as the client and exclude it from the competitor list.
 *
 * Conservative: a competitor called "Acme Dental Group" would match a client
 * called "Acme Dental" — intentional, to avoid self-auditing.
 */
function isClientCompetitor(name: string, identity: ClientIdentity): boolean {
  const lowerName = name.toLowerCase();
  const identityTokens = [
    identity.business_name,
    ...identity.aliases,
  ].map((t) => t.toLowerCase().trim()).filter((t) => t.length >= 2);

  for (const token of identityTokens) {
    if (lowerName.includes(token) || token.includes(lowerName)) {
      return true;
    }
  }

  return false;
}

// ---------------------------------------------------------------------------
// Public API — selectTopCompetitors
// ---------------------------------------------------------------------------

/**
 * Aggregate competitors mentioned across all engine observations and return
 * the top k by frequency, then by best (lowest) rank.
 *
 * Algorithm:
 *   1. Collect all CompetitorMention entries from every observation.
 *   2. Group by lowercased name — deduplication key is the lowercase form.
 *      The display name preserved is from the first occurrence.
 *   3. Count frequency (appearances across observations).
 *      Rank: track the best (lowest) numeric rank seen. null ranks are treated
 *      as Infinity for comparison purposes (unranked = less prominent).
 *   4. Exclude any entry whose name matches the client identity
 *      (the client appearing in competitor lists is a detection false-positive).
 *   5. Sort: frequency DESC, then best_rank ASC (lower = more prominent),
 *      then name ASC (deterministic tie-break).
 *   6. Return top k entries (default 3).
 *
 * @param observations  All engine probe observations for the scan.
 * @param k             Maximum number of competitors to return (default 3).
 * @param identity      Client identity — used to exclude self-matches.
 */
export function selectTopCompetitors(
  observations: EngineProbeObservation[],
  identity: ClientIdentity,
  k = 3,
): CompetitorMention[] {
  // frequency map: lowercased name → { displayName, frequency, bestRank }
  const frequencyMap = new Map<
    string,
    { displayName: string; frequency: number; bestRank: number }
  >();

  for (const obs of observations) {
    for (const competitor of obs.competitors) {
      const key = competitor.name.toLowerCase();

      // Skip if this matches the client identity
      if (isClientCompetitor(competitor.name, identity)) continue;

      const existing = frequencyMap.get(key);
      const rankValue = competitor.rank ?? Infinity;

      if (existing) {
        existing.frequency++;
        if (rankValue < existing.bestRank) {
          existing.bestRank = rankValue;
        }
      } else {
        frequencyMap.set(key, {
          displayName: competitor.name,
          frequency: 1,
          bestRank: rankValue,
        });
      }
    }
  }

  // Sort by frequency DESC, bestRank ASC, displayName ASC
  const sorted = Array.from(frequencyMap.values()).sort((a, b) => {
    if (b.frequency !== a.frequency) return b.frequency - a.frequency;
    if (a.bestRank !== b.bestRank) return a.bestRank - b.bestRank;
    return a.displayName.localeCompare(b.displayName);
  });

  // Return top k as CompetitorMention (use bestRank, or null if Infinity)
  return sorted.slice(0, k).map((entry) => ({
    name: entry.displayName,
    rank: entry.bestRank === Infinity ? null : entry.bestRank,
  }));
}

// ---------------------------------------------------------------------------
// Deps type for auditCompetitors
// ---------------------------------------------------------------------------

/**
 * Injectable deps for auditCompetitors.
 *
 * Worker 2 supplies:
 *   auditSite:       the SSRF-safe auditSite (from site-audit.ts) — NEVER real fetch in tests.
 *   detectFactors:   factor detector (from factor-detection.ts).
 *   resolveDomain:   optional domain resolver — given a competitor name, returns a URL or null.
 *                    When null, the competitor is skipped (no domain → no audit).
 *                    When not provided, competitors without a pre-resolved domain are skipped.
 */
export interface AuditCompetitorsDeps {
  auditSite: (url: string) => Promise<SiteAudit>;
  detectFactors: (input: {
    siteAudit: SiteAudit;
    businessContext?: import('./types').BusinessContext;
    engineResults?: import('./types').EngineRawResult[];
  }) => Promise<FactorObservation[]>;
  resolveDomain?: (name: string) => string | null;
}

// ---------------------------------------------------------------------------
// Public API — auditCompetitors
// ---------------------------------------------------------------------------

/**
 * Audit each competitor in the provided list by fetching their site and
 * running factor detection against the result.
 *
 * SKIPPING RULES:
 *   - A competitor with no resolvable domain is skipped silently.
 *     (We only audit when we have a URL to fetch — no fake data.)
 *   - A competitor that throws during auditSite or detectFactors is skipped silently
 *     with a structured console.error log. The remaining competitors are still audited.
 *   - At most `cap` competitors are audited (default 3 — matches selectTopCompetitors).
 *
 * NEVER throws: all errors are caught per-competitor.
 *
 * @param competitors  Output of selectTopCompetitors().
 * @param deps         Injectable I/O — use stubs in tests.
 * @param cap          Maximum number of competitors to audit (default 3).
 */
export async function auditCompetitors(
  competitors: CompetitorMention[],
  deps: AuditCompetitorsDeps,
  cap = 3,
): Promise<CompetitorFactorAudit[]> {
  const results: CompetitorFactorAudit[] = [];
  const toAudit = competitors.slice(0, cap);

  for (const competitor of toAudit) {
    // Resolve the domain for this competitor.
    // If no resolver is provided or the resolver returns null, skip.
    const domain =
      typeof deps.resolveDomain === 'function'
        ? deps.resolveDomain(competitor.name)
        : null;

    if (!domain) {
      // No resolvable domain — skip with a structured log (not an error; expected).
      console.error('[scan/competitor-audit] No resolvable domain for competitor — skipping', {
        competitor_name: competitor.name,
      });
      continue;
    }

    try {
      const siteAudit = await deps.auditSite(domain);
      const observations = await deps.detectFactors({ siteAudit });

      results.push({
        competitor_name: competitor.name,
        domain,
        observations,
      });
    } catch (err) {
      // Per-competitor failure: log + skip. Never propagate.
      console.error('[scan/competitor-audit] Audit failed for competitor — skipping', {
        competitor_name: competitor.name,
        domain,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return results;
}
