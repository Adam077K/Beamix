/**
 * rules.ts — GEO-driven suggestion rules engine.
 *
 * Pure functions only — no DB writes. Callers use write.ts to persist results.
 *
 * Each rule returns 0 or more Suggestion objects.
 * evaluateScanFindings() runs all rules and deduplicates by triggerRule.
 *
 * Sources:
 *  - docs/product-rethink-2026-04-09/07-AGENT-ROSTER-V2.md — GEO lever data
 *  - 15 hardcoded rules covering the full GEO lever coverage matrix
 */

import type { Suggestion } from '@/lib/types/shared';
import type { ScanResult } from '@/lib/agents/types';

// ─── Helper types ─────────────────────────────────────────────────────────

interface RuleInput {
  scan: ScanResult;
  previousScan?: ScanResult | null;
  /** Business page metadata — provided when available. */
  pages?: Array<{
    url: string;
    lastModifiedDays: number;
    hasJsonLd: boolean;
    externalCitationCount: number;
    wordCount: number;
  }>;
  businessId: string;
  userId: string;
}

type RuleOutput = Omit<
  Suggestion,
  'id' | 'userId' | 'businessId' | 'scanId' | 'createdAt' | 'expiresAt' | 'acceptedAt'
>;

type Rule = (input: RuleInput) => RuleOutput[];

// ─── Expiry helper ────────────────────────────────────────────────────────

/** Suggestions expire in 7 days by default. */
function expiresIn(days = 7): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

// ─── Individual rules ─────────────────────────────────────────────────────

/**
 * Rule 1 — no_faq_on_top_queries
 * If any query cluster lacks a FAQ page answering it, suggest FAQ Builder.
 * GEO stat: AI engines cite FAQ content at above-average rates.
 */
const noFaqOnTopQueries: Rule = ({ scan }) => {
  const queriesWithoutFaq = scan.queryPositions.filter(
    q => !q.isMentioned && q.position === null
  );
  if (queriesWithoutFaq.length < 3) return [];

  const cluster = queriesWithoutFaq.slice(0, 5).map(q => q.queryText);
  return [
    {
      agentType: 'faq_builder',
      title: 'Create FAQ pages for your top unanswered queries',
      description: `${queriesWithoutFaq.length} queries have no FAQ page — AI engines actively cite structured Q&A content.`,
      impact: 'high',
      estimatedRuns: 0,
      status: 'pending',
      triggerRule: 'no_faq_on_top_queries',
      evidence: { missingQueries: queriesWithoutFaq.length, sampleCluster: cluster },
      targetQueryIds: [],
      targetUrl: null,
    },
  ];
};

/**
 * Rule 2 — competitor_gain
 * A competitor gained ≥3 new positions vs last scan → suggest Content Optimizer.
 * GEO stat: Content Optimizer targets +40–115% visibility improvement.
 */
const competitorGain: Rule = ({ scan, previousScan }) => {
  if (!previousScan) return [];

  const gainedCompetitors = scan.queryPositions.filter(current => {
    const prev = previousScan.queryPositions.find(
      p => p.queryText === current.queryText && p.engine === current.engine
    );
    if (!prev) return false;
    // Competitor appeared in current but not in previous — we lost ground
    return (
      current.competitorsMentioned.length > prev.competitorsMentioned.length + 2
    );
  });

  if (gainedCompetitors.length === 0) return [];

  return [
    {
      agentType: 'content_optimizer',
      title: 'Competitors gained visibility — rewrite key pages',
      description: `Competitors gained ≥3 new positions across ${gainedCompetitors.length} queries. Rewriting pages with GEO signals can recover your ranking.`,
      impact: 'high',
      estimatedRuns: 2,
      status: 'pending',
      triggerRule: 'competitor_gain',
      evidence: { affectedQueries: gainedCompetitors.length },
      targetQueryIds: [],
      targetUrl: null,
    },
  ];
};

/**
 * Rule 3 — stale_content
 * Any scanned page not updated in >90 days → suggest Freshness Agent.
 * GEO stat: 76% of ChatGPT's top citations updated within 30 days.
 */
const staleContent: Rule = ({ pages }) => {
  if (!pages) return [];
  const stalePages = pages.filter(p => p.lastModifiedDays > 90);
  if (stalePages.length === 0) return [];

  return stalePages.slice(0, 3).map(page => ({
    agentType: 'freshness_agent' as const,
    title: `Update stale content: ${page.url}`,
    description: `This page was last modified ${page.lastModifiedDays} days ago. Fresh content is cited 3× more by AI engines.`,
    impact: 'medium' as const,
    estimatedRuns: 1,
    status: 'pending' as const,
    triggerRule: 'stale_content',
    evidence: { lastModifiedDays: page.lastModifiedDays, url: page.url },
    targetQueryIds: [],
    targetUrl: page.url,
  }));
};

/**
 * Rule 4 — missing_schema
 * Top-10 pages have no JSON-LD → suggest Schema Generator.
 * GEO stat: Google + Microsoft confirmed schema helps AI systems.
 */
const missingSchema: Rule = ({ pages }) => {
  if (!pages) return [];
  const noSchemaPages = pages.filter(p => !p.hasJsonLd);
  if (noSchemaPages.length === 0) return [];

  return [
    {
      agentType: 'schema_generator',
      title: 'Add JSON-LD schema to key pages',
      description: `${noSchemaPages.length} pages lack structured data. JSON-LD markup helps AI systems correctly understand your business.`,
      impact: 'medium',
      estimatedRuns: 0,
      status: 'pending',
      triggerRule: 'missing_schema',
      evidence: { pagesWithoutSchema: noSchemaPages.length },
      targetQueryIds: [],
      targetUrl: noSchemaPages[0]?.url ?? null,
    },
  ];
};

/**
 * Rule 5 — low_citation_count
 * Pages with <2 external citations → suggest Content Optimizer.
 * GEO stat: Statistics + citations = #1 proven GEO lever (KDD 2024).
 */
const lowCitationCount: Rule = ({ pages }) => {
  if (!pages) return [];
  const thinPages = pages.filter(p => p.externalCitationCount < 2);
  if (thinPages.length < 2) return [];

  return [
    {
      agentType: 'content_optimizer',
      title: 'Add citations and statistics to your pages',
      description: `${thinPages.length} pages have fewer than 2 external citations. Adding statistics and citations is the #1 GEO lever.`,
      impact: 'high',
      estimatedRuns: 2,
      status: 'pending',
      triggerRule: 'low_citation_count',
      evidence: { thinPages: thinPages.length },
      targetQueryIds: [],
      targetUrl: thinPages[0]?.url ?? null,
    },
  ];
};

/**
 * Rule 6 — low_overall_score
 * Overall visibility score below 40 → suggest Query Mapper as first step.
 */
const lowOverallScore: Rule = ({ scan }) => {
  if (scan.overallScore >= 40) return [];

  return [
    {
      agentType: 'query_mapper',
      title: 'Map your AI search opportunity — start here',
      description: `Your visibility score is ${scan.overallScore}/100. Run Query Mapper to identify the highest-opportunity queries for your business.`,
      impact: 'high',
      estimatedRuns: 1,
      status: 'pending',
      triggerRule: 'low_overall_score',
      evidence: { overallScore: scan.overallScore },
      targetQueryIds: [],
      targetUrl: null,
    },
  ];
};

/**
 * Rule 7 — not_mentioned_on_perplexity
 * Business not mentioned on Perplexity across multiple queries → suggest Off-Site Presence Builder.
 * GEO stat: Niche directories = 24% of Perplexity citations.
 */
const notMentionedOnPerplexity: Rule = ({ scan }) => {
  const perplexityResults = scan.engineResults.filter(
    e => e.engine === 'perplexity'
  );
  if (perplexityResults.length === 0) return [];

  const mentionedOnPerplexity = perplexityResults.some(e => e.isMentioned);
  if (mentionedOnPerplexity) return [];

  return [
    {
      agentType: 'offsite_presence_builder',
      title: 'You\'re invisible on Perplexity — build off-site presence',
      description:
        'Your business isn\'t cited on Perplexity. 24% of Perplexity citations come from niche directories. Get listed where AI trusts.',
      impact: 'high',
      estimatedRuns: 0,
      status: 'pending',
      triggerRule: 'not_mentioned_on_perplexity',
      evidence: { engine: 'perplexity' },
      targetQueryIds: [],
      targetUrl: null,
    },
  ];
};

/**
 * Rule 8 — missing_review_presence
 * Business not cited on ChatGPT → suggest Review Presence Planner.
 * GEO stat: 48.7% of ChatGPT citations come from Yelp, TripAdvisor, review sites.
 */
const missingReviewPresence: Rule = ({ scan }) => {
  const chatgptResults = scan.engineResults.filter(
    e => e.engine === 'chatgpt'
  );
  if (chatgptResults.length === 0) return [];

  const mentionedOnChatgpt = chatgptResults.some(e => e.isMentioned);
  if (mentionedOnChatgpt) return [];

  return [
    {
      agentType: 'review_presence_planner',
      title: 'Build review presence on ChatGPT-trusted platforms',
      description:
        '48.7% of ChatGPT citations come from review sites. A review strategy targeting Yelp, TripAdvisor and similar platforms can dramatically increase your ChatGPT visibility.',
      impact: 'high',
      estimatedRuns: 2,
      status: 'pending',
      triggerRule: 'missing_review_presence',
      evidence: { engine: 'chatgpt' },
      targetQueryIds: [],
      targetUrl: null,
    },
  ];
};

/**
 * Rule 9 — score_drop
 * Score dropped ≥10 points vs previous scan → urgent Content Optimizer.
 */
const scoreDrop: Rule = ({ scan, previousScan }) => {
  if (!previousScan) return [];
  const delta = scan.overallScore - previousScan.overallScore;
  if (delta >= -10) return [];

  return [
    {
      agentType: 'content_optimizer',
      title: `Score dropped ${Math.abs(delta)} points — take action`,
      description: `Your AI visibility score fell from ${previousScan.overallScore} to ${scan.overallScore}. Immediate content optimization is recommended.`,
      impact: 'high',
      estimatedRuns: 2,
      status: 'pending',
      triggerRule: 'score_drop',
      evidence: {
        previousScore: previousScan.overallScore,
        currentScore: scan.overallScore,
        delta,
      },
      targetQueryIds: [],
      targetUrl: null,
    },
  ];
};

/**
 * Rule 10 — entity_gap
 * Business not found on ChatGPT AND Gemini → suggest Entity Builder.
 * GEO stat: Wikipedia = 16.3% of ChatGPT citations; entity recognition is foundational.
 */
const entityGap: Rule = ({ scan }) => {
  const mentionedEngines = scan.engineResults
    .filter(e => e.isMentioned)
    .map(e => e.engine);

  const hasChatGpt = mentionedEngines.includes('chatgpt');
  const hasGemini = mentionedEngines.includes('gemini');

  if (hasChatGpt || hasGemini) return [];

  return [
    {
      agentType: 'entity_builder',
      title: 'Build your knowledge graph presence',
      description:
        'You\'re invisible on both ChatGPT and Gemini. Building entity signals (Wikidata, Google Business Profile) is foundational for LLM recognition.',
      impact: 'medium',
      estimatedRuns: 2,
      status: 'pending',
      triggerRule: 'entity_gap',
      evidence: { visibleOnEngines: mentionedEngines },
      targetQueryIds: [],
      targetUrl: null,
    },
  ];
};

/**
 * Rule 11 — reddit_gap
 * Not mentioned on Perplexity and business is in a consumer category → suggest Reddit Presence Planner.
 * GEO stat: Reddit = 46.7% of Perplexity's top-10 sources.
 */
const redditGap: Rule = ({ scan }) => {
  const perplexityResult = scan.engineResults.find(e => e.engine === 'perplexity');
  if (!perplexityResult) return [];
  if (perplexityResult.isMentioned) return [];

  // Only suggest if we have a meaningful number of queries
  if (scan.queryPositions.length < 5) return [];

  return [
    {
      agentType: 'reddit_presence_planner',
      title: 'Reddit strategy to boost Perplexity visibility',
      description:
        'Reddit is 46.7% of Perplexity\'s top-10 sources. A targeted Reddit presence strategy can significantly increase your Perplexity citations.',
      impact: 'medium',
      estimatedRuns: 1,
      status: 'pending',
      triggerRule: 'reddit_gap',
      evidence: { perplexityMentioned: false },
      targetQueryIds: [],
      targetUrl: null,
    },
  ];
};

/**
 * Rule 12 — short_content
 * Pages with <500 words → suggest Content Optimizer.
 * GEO stat: Long-form content with stats + citations is cited more.
 */
const shortContent: Rule = ({ pages }) => {
  if (!pages) return [];
  const shortPages = pages.filter(p => p.wordCount < 500);
  if (shortPages.length === 0) return [];

  return [
    {
      agentType: 'content_optimizer',
      title: 'Expand thin content to improve AI citation rates',
      description: `${shortPages.length} pages have fewer than 500 words. AI engines preferentially cite detailed, statistics-rich content.`,
      impact: 'medium',
      estimatedRuns: 2,
      status: 'pending',
      triggerRule: 'short_content',
      evidence: { thinPageCount: shortPages.length },
      targetQueryIds: [],
      targetUrl: shortPages[0]?.url ?? null,
    },
  ];
};

/**
 * Rule 13 — first_scan_complete
 * First scan completed (no previous scan) → suggest Performance Tracker as baseline.
 */
const firstScanComplete: Rule = ({ previousScan }) => {
  if (previousScan) return [];

  return [
    {
      agentType: 'performance_tracker',
      title: 'Track your baseline AI visibility',
      description:
        'This is your first scan. Run Performance Tracker to establish a baseline — you\'ll measure improvement against it after every agent action.',
      impact: 'low',
      estimatedRuns: 0,
      status: 'pending',
      triggerRule: 'first_scan_complete',
      evidence: {},
      targetQueryIds: [],
      targetUrl: null,
    },
  ];
};

/**
 * Rule 14 — high_engine_variance
 * Visibility differs greatly across engines (gap ≥40%) → run query mapper to understand why.
 */
const highEngineVariance: Rule = ({ scan }) => {
  const mentioned = scan.engineResults.filter(e => e.isMentioned);
  const total = scan.engineResults.length;

  if (total < 2) return [];

  const mentionRate = mentioned.length / total;
  // High variance: mentioned on some but not others by a wide margin
  if (mentionRate > 0.25 && mentionRate < 0.75) {
    return [
      {
        agentType: 'query_mapper',
        title: 'Large visibility gaps between AI engines — run Query Mapper',
        description: `You appear on ${mentioned.length}/${total} engines. Query Mapper identifies engine-specific query patterns to close these gaps.`,
        impact: 'medium',
        estimatedRuns: 1,
        status: 'pending',
        triggerRule: 'high_engine_variance',
        evidence: { mentionedEngines: mentioned.length, totalEngines: total, mentionRate },
        targetQueryIds: [],
        targetUrl: null,
      },
    ];
  }
  return [];
};

/**
 * Rule 15 — multiple_competitors_outranking
 * ≥2 competitors appear in results where business doesn't → Blog Strategist (Build/Scale only).
 * GEO stat: Listicle/comparison content cited 2–5× more.
 */
const multipleCompetitorsOutranking: Rule = ({ scan }) => {
  const outrankedQueries = scan.queryPositions.filter(
    q => !q.isMentioned && q.competitorsMentioned.length >= 2
  );

  if (outrankedQueries.length < 3) return [];

  return [
    {
      agentType: 'authority_blog_strategist',
      title: 'Competitors dominate — publish authoritative content',
      description: `${outrankedQueries.length} queries show 2+ competitors ahead of you. Long-form, statistics-rich articles are cited 2–5× more than short content.`,
      impact: 'high',
      estimatedRuns: 3,
      status: 'pending',
      triggerRule: 'multiple_competitors_outranking',
      evidence: {
        outrankedQueryCount: outrankedQueries.length,
        sampleQuery: outrankedQueries[0]?.queryText ?? null,
      },
      targetQueryIds: [],
      targetUrl: null,
    },
  ];
};

// ─── Rule registry ────────────────────────────────────────────────────────

const ALL_RULES: Rule[] = [
  noFaqOnTopQueries,
  competitorGain,
  staleContent,
  missingSchema,
  lowCitationCount,
  lowOverallScore,
  notMentionedOnPerplexity,
  missingReviewPresence,
  scoreDrop,
  entityGap,
  redditGap,
  shortContent,
  firstScanComplete,
  highEngineVariance,
  multipleCompetitorsOutranking,
];

// ─── Public API ───────────────────────────────────────────────────────────

/**
 * Evaluate all 15 rules against scan findings.
 * Returns deduplicated Suggestion[] (at most 1 per triggerRule).
 * Pure function — no side effects.
 */
export function evaluateScanFindings(
  scan: ScanResult,
  options: {
    previousScan?: ScanResult | null;
    pages?: RuleInput['pages'];
    businessId: string;
    userId: string;
  }
): Omit<Suggestion, 'id' | 'createdAt' | 'expiresAt' | 'acceptedAt' | 'scanId'>[] {
  const input: RuleInput = {
    scan,
    previousScan: options.previousScan ?? null,
    pages: options.pages,
    businessId: options.businessId,
    userId: options.userId,
  };

  const seen = new Set<string>();
  const results: RuleOutput[] = [];

  for (const rule of ALL_RULES) {
    const outputs = rule(input);
    for (const output of outputs) {
      const key = output.triggerRule ?? output.agentType;
      if (!seen.has(key)) {
        seen.add(key);
        results.push(output);
      }
    }
  }

  return results.map(r => ({
    ...r,
    userId: options.userId,
    businessId: options.businessId,
  }));
}
