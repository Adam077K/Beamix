/**
 * Wave 5 — Per-engine dimension computation.
 *
 * Computes the six measurement dimensions from a set of EngineProbeObservations
 * for ONE engine. All math is deterministic code — no LLM calls here.
 *
 * SEQUENCING LOCK (SCAN-MEASUREMENT-MODEL.md §1):
 *   Sentiment is received as a parameter (already judged by the LLM in sentiment-judge.ts).
 *   It does NOT affect any numeric dimension — it is an annotation only.
 *
 * PER-ENGINE CONTRACT:
 *   observations is always a slice for ONE engine.
 *   Never pass cross-engine observations to this function.
 *
 * HONESTY SPINE:
 *   - position is null when no ranked mentions exist (not guessed).
 *   - share_of_voice is 0 when nobody (client or competitor) is named.
 *   - breadth is a per-engine proxy using win/partial shape outcomes
 *     (full intent-bucket breadth is deferred to W6 when buckets are threaded through).
 *
 * Domain-root matching:
 *   Reuses extractDomainRoot from client-detection.ts to avoid duplication.
 *   A citation URL "cites" the client if the URL contains the domain root as a substring.
 */

import type { ClientIdentity, DimensionScores, EngineProbeObservation } from './measurement-types';
import { extractDomainRoot } from './client-detection';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compute the six measurement dimensions for one engine's observation set.
 *
 * @param observations  All observations for ONE engine across the query set.
 * @param identity      The client identity (used for domain-root citation matching).
 * @param sentiment     The pre-judged sentiment for this engine (from judgeSentiment).
 *                      Pass 'unknown' when no mentions exist or judge could not decide.
 *
 * Dimensions:
 *   presence          — mentioned count / total obs (0–1).
 *   position          — average rank_position over obs where rank_position != null.
 *                       null when no ranked mentions.
 *   cited_as_source   — fraction of obs where the client domain root appears in any
 *                       citation URL (obs.citations[]).
 *   share_of_voice    — client mention count / (client + total competitor mentions).
 *                       0 when nobody is named.
 *   breadth           — fraction of obs whose shape.outcome is 'win' or 'partial'.
 *                       Per-engine proxy for W5; full intent-bucket breadth in W6.
 *   sentiment         — passed through unchanged (annotation only, not a number).
 */
export function computeDimensions(
  observations: EngineProbeObservation[],
  identity: ClientIdentity,
  sentiment: DimensionScores['sentiment'],
): DimensionScores {
  const n = observations.length;

  if (n === 0) {
    return {
      presence: 0,
      position: null,
      cited_as_source: 0,
      share_of_voice: 0,
      breadth: 0,
      sentiment,
    };
  }

  // 1. Presence: fraction of obs where the client is mentioned.
  const mentionedObs = observations.filter((o) => o.detection.mentioned);
  const presence = mentionedObs.length / n;

  // 2. Position: average rank_position over obs where rank_position is not null.
  //    null when no ranked mentions exist (honest — "mentioned but unranked" is distinct).
  const rankedObs = mentionedObs.filter((o) => o.detection.rank_position !== null);
  const position: number | null =
    rankedObs.length > 0
      ? rankedObs.reduce((sum, o) => sum + (o.detection.rank_position as number), 0) /
        rankedObs.length
      : null;

  // 3. Cited-as-source: fraction of obs where the client domain root appears in a citation URL.
  //    Uses extractDomainRoot from client-detection.ts (same logic, no duplication).
  const domainRoot = extractDomainRoot(identity.domain).toLowerCase();
  const citedCount =
    domainRoot.length >= 3
      ? observations.filter((o) =>
          (o.citations ?? []).some((url) => url.toLowerCase().includes(domainRoot)),
        ).length
      : 0;
  const cited_as_source = citedCount / n;

  // 4. Share-of-voice: client mentions / (client mentions + total competitor mentions).
  //    0 when neither client nor competitors are named in any observation.
  const clientMentions = mentionedObs.length;
  const competitorMentions = observations.reduce(
    (sum, o) => sum + o.competitors.length,
    0,
  );
  const totalMentions = clientMentions + competitorMentions;
  const share_of_voice = totalMentions > 0 ? clientMentions / totalMentions : 0;

  // 5. Breadth: fraction of obs whose shape.outcome is 'win' or 'partial'.
  //    Per-engine proxy for W5. Richer intent-bucket breadth is W6.
  //    Document: win=the client is prominently featured, partial=mentioned but not leading.
  const winOrPartialCount = observations.filter(
    (o) => o.shape.outcome === 'win' || o.shape.outcome === 'partial',
  ).length;
  const breadth = winOrPartialCount / n;

  // 6. Sentiment: passed through as-is (annotation — does NOT affect any number).
  return {
    presence,
    position,
    cited_as_source,
    share_of_voice,
    breadth,
    sentiment,
  };
}
