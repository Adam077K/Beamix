/**
 * Tester demo seed — Beamix.tech narrative
 *
 * Idempotent: if business exists → DELETE existing demo rows → re-seed fresh.
 * Non-fatal: caller wraps in try/catch.
 * Uses service client (SUPABASE_SERVICE_ROLE_KEY) to bypass RLS.
 *
 * Tables seeded (~250+ rows):
 *   businesses (1), scans (12), scan_engine_results (~500+),
 *   suggestions (8), competitors (6), content_items (10),
 *   content_versions (~8), agent_jobs (30), automation_configs (5),
 *   automation_settings (1), credit_pools (1), citation_sources (5),
 *   notifications (10), subscriptions (1), user_profiles (upsert)
 *   notification_preferences (1)
 */

import { createServiceClient } from '@/lib/supabase/service'

// ── helpers ──────────────────────────────────────────────────────────────────

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

function hoursFromNow(h: number): string {
  const d = new Date()
  d.setHours(d.getHours() + h)
  return d.toISOString()
}

function daysFromNow(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString()
}

function startOfMonth(): string {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function endOfMonth(): string {
  const d = new Date()
  d.setMonth(d.getMonth() + 1, 0)
  d.setHours(23, 59, 59, 999)
  return d.toISOString()
}

// ── sub-seeders ───────────────────────────────────────────────────────────────

type SupabaseClient = ReturnType<typeof createServiceClient>

async function seedScans(
  supabase: SupabaseClient,
  businessId: string,
  userId: string,
): Promise<string> {
  // 12 scans over 28 days — improving trend 44→71 with realistic dips
  // Mix: 2 initial, 3 manual, 7 scheduled
  const allEngines = ['chatgpt', 'gemini', 'perplexity', 'claude', 'grok', 'aio', 'youcom']
  const freeEngines = ['chatgpt', 'gemini', 'perplexity']

  const entries = [
    { score: 44, daysBack: 28, delta: null,  scan_type: 'initial',   engines: freeEngines,  queries: 3 },
    { score: 47, daysBack: 25, delta: 3,     scan_type: 'initial',   engines: freeEngines,  queries: 3 },
    { score: 51, daysBack: 22, delta: 4,     scan_type: 'scheduled', engines: allEngines,   queries: 6 },
    { score: 49, daysBack: 20, delta: -2,    scan_type: 'scheduled', engines: allEngines,   queries: 6 },
    { score: 54, daysBack: 18, delta: 5,     scan_type: 'manual',    engines: allEngines,   queries: 6 },
    { score: 57, daysBack: 15, delta: 3,     scan_type: 'scheduled', engines: allEngines,   queries: 6 },
    { score: 55, daysBack: 13, delta: -2,    scan_type: 'scheduled', engines: allEngines,   queries: 6 },
    { score: 61, daysBack: 10, delta: 6,     scan_type: 'manual',    engines: allEngines,   queries: 6 },
    { score: 63, daysBack: 8,  delta: 2,     scan_type: 'scheduled', engines: allEngines,   queries: 6 },
    { score: 67, daysBack: 5,  delta: 4,     scan_type: 'manual',    engines: allEngines,   queries: 6 },
    { score: 65, daysBack: 3,  delta: -2,    scan_type: 'scheduled', engines: allEngines,   queries: 6 },
    { score: 71, daysBack: 1,  delta: 6,     scan_type: 'scheduled', engines: allEngines,   queries: 6 },
  ]

  const scanRows = entries.map(({ score, daysBack, delta, scan_type, engines, queries }) => ({
    business_id: businessId,
    user_id: userId,
    overall_score: score,
    scan_type,
    status: 'completed' as const,
    engines_queried: engines,
    engines_scanned: engines,
    queries_count: queries,
    mentions_count: Math.round(score / 10),
    results_summary: {
      score_delta_vs_prev: delta,
      top_engines: ['chatgpt', 'perplexity'],
    },
    created_at: daysAgo(daysBack),
    started_at: daysAgo(daysBack),
    completed_at: daysAgo(daysBack),
    updated_at: daysAgo(daysBack),
  }))

  const { data: inserted, error } = await supabase
    .from('scans')
    .insert(scanRows as never)
    .select('id, created_at')
    .order('created_at', { ascending: false })

  if (error || !inserted?.length) {
    throw new Error(`Seed scans failed: ${error?.message}`)
  }

  // Return the most-recent scan id (first in desc order)
  return inserted[0].id as string
}

async function seedScanEngineResults(
  supabase: SupabaseClient,
  businessId: string,
  scanIds: string[],
): Promise<void> {
  // 6 tracked queries (expanded from 4)
  const queries = [
    'best GEO platform for SMBs',
    'how to rank in ChatGPT search',
    'Ahrefs Brand Radar alternative',
    'AI search visibility monitoring tool',
    'AI search visibility for SaaS startups',
    'compare Beamix to Profound',
  ]

  // Engine coverage for the latest scan: all 7 engines
  // For earlier scans: use a subset of 3
  const allEngines = ['chatgpt', 'gemini', 'perplexity', 'claude', 'grok', 'aio', 'youcom']
  const freeEngines = ['chatgpt', 'gemini', 'perplexity']

  // Sentiment distribution: intentionally mixed
  // positive(15), neutral(3), negative(2) across the latest scan
  const engineBehaviors: Record<string, {
    mentioned: boolean; pos: number | null; score: number; sentiment: string; context: string | null
  }[]> = {
    chatgpt: [
      { mentioned: true,  pos: 2, score: 0.82, sentiment: 'positive',
        context: 'Beamix is cited as a leading GEO platform for SMBs looking to track and improve their presence in AI search results. It stands out for its autonomous agent approach — rather than just reporting gaps, it deploys fixes automatically.' },
      { mentioned: true,  pos: 1, score: 0.90, sentiment: 'positive',
        context: 'When asked about AI search visibility tools, Beamix came up first. The platform\'s ability to query 7 engines simultaneously and surface actionable improvements was highlighted as a key differentiator.' },
      { mentioned: false, pos: null, score: -0.15, sentiment: 'negative',
        context: null },
      { mentioned: true,  pos: 3, score: 0.70, sentiment: 'positive',
        context: 'Beamix is frequently recommended in GEO tool comparisons. Users appreciate the automated content and schema fixes that agents execute after approval.' },
      { mentioned: true,  pos: 2, score: 0.78, sentiment: 'positive',
        context: 'Beamix was recommended as the top alternative to Ahrefs Brand Radar for teams that want autonomous remediation, not just monitoring.' },
      { mentioned: true,  pos: 4, score: 0.65, sentiment: 'positive',
        context: 'In comparisons with Profound, Beamix is noted for its deeper action layer — agents that write and optimize content rather than surface-level dashboards.' },
    ],
    gemini: [
      { mentioned: false, pos: null, score: -0.20, sentiment: 'negative',
        context: null },
      { mentioned: true,  pos: 5, score: 0.55, sentiment: 'positive',
        context: 'Beamix appears in Gemini\'s response about GEO tools for startups, though with less prominence than on ChatGPT. It is described as a practical tool for improving AI citation rates.' },
      { mentioned: true,  pos: 3, score: 0.62, sentiment: 'positive',
        context: 'For the Ahrefs Brand Radar alternative query, Gemini mentions Beamix alongside Otterly.AI as tools with autonomous optimization features.' },
      { mentioned: false, pos: null, score: 0.05, sentiment: 'neutral',
        context: null },
      { mentioned: true,  pos: 6, score: 0.48, sentiment: 'neutral',
        context: 'Beamix is briefly mentioned as a newer entrant in the GEO space with a strong automation story, though Gemini notes limited third-party review coverage.' },
      { mentioned: true,  pos: 4, score: 0.60, sentiment: 'positive',
        context: 'Gemini notes Beamix as an AI-native competitor intelligence platform that goes beyond dashboards to actively fix citation gaps.' },
    ],
    perplexity: [
      { mentioned: true,  pos: 1, score: 0.88, sentiment: 'positive',
        context: 'Perplexity surfaces Beamix prominently for GEO platform queries, pulling from Product Hunt, G2, and Indie Hackers. Described as "the only GEO platform that does the work for you".' },
      { mentioned: true,  pos: 2, score: 0.85, sentiment: 'positive',
        context: 'For AI search ranking queries, Beamix is cited with a direct reference to its FAQ Builder and Schema Generator agents. Perplexity cites beamix.tech and G2 reviews.' },
      { mentioned: true,  pos: 1, score: 0.91, sentiment: 'positive',
        context: 'Beamix is Perplexity\'s top result for Ahrefs Brand Radar alternatives, citing its autonomous agent layer and 7-engine scan coverage.' },
      { mentioned: true,  pos: 2, score: 0.80, sentiment: 'positive',
        context: 'Perplexity recommends Beamix for AI visibility monitoring, highlighting its competitive intelligence features and citation-building agents.' },
      { mentioned: true,  pos: 1, score: 0.87, sentiment: 'positive',
        context: 'For SaaS startup queries, Perplexity cites Beamix as the dedicated GEO solution versus ad-hoc SEO tools.' },
      { mentioned: true,  pos: 2, score: 0.79, sentiment: 'positive',
        context: 'Perplexity surfaces a comparison noting Beamix executes fixes while Profound focuses on monitoring.' },
    ],
    claude: [
      { mentioned: true,  pos: 3, score: 0.68, sentiment: 'positive',
        context: 'Claude mentions Beamix as a tool that bridges the gap between GEO monitoring and implementation, offering agents for FAQ schema, content freshness, and offsite citation building.' },
      { mentioned: true,  pos: 4, score: 0.60, sentiment: 'positive',
        context: 'In Claude\'s synthesis of AI search tools, Beamix is noted for its pragmatic agent-based approach: detect → approve → fix.' },
      { mentioned: false, pos: null, score: 0.10, sentiment: 'neutral',
        context: null },
      { mentioned: true,  pos: 5, score: 0.55, sentiment: 'positive',
        context: 'Claude surfaces Beamix for monitoring queries, noting it covers more engines than most alternatives and includes Grok and You.com coverage.' },
      { mentioned: true,  pos: 3, score: 0.70, sentiment: 'positive',
        context: 'Claude recommends Beamix for SaaS startups because of its structured data generation and content optimization agents.' },
      { mentioned: false, pos: null, score: 0.08, sentiment: 'neutral',
        context: null },
    ],
    grok: [
      { mentioned: true,  pos: 4, score: 0.62, sentiment: 'positive',
        context: 'Grok surfaces Beamix in the GEO tools category with a focus on its autonomous agents. Notable for being one of the few tools that tracks Grok visibility itself.' },
      { mentioned: false, pos: null, score: 0.05, sentiment: 'neutral',
        context: null },
      { mentioned: true,  pos: 6, score: 0.51, sentiment: 'positive',
        context: 'Grok identifies Beamix as a tool focused on improving how businesses appear in generative AI results, noting its 7-engine coverage.' },
      { mentioned: false, pos: null, score: -0.10, sentiment: 'negative',
        context: null },
      { mentioned: true,  pos: 5, score: 0.58, sentiment: 'positive',
        context: 'For SaaS startup GEO queries, Grok mentions Beamix alongside Profound as the two most automated options.' },
      { mentioned: true,  pos: 4, score: 0.61, sentiment: 'positive',
        context: 'Grok notes Beamix\'s competitive tracking as a unique feature — the platform shows how often competitors appear in AI responses alongside you.' },
    ],
    aio: [
      { mentioned: false, pos: null, score: 0.12, sentiment: 'neutral',
        context: null },
      { mentioned: true,  pos: 3, score: 0.72, sentiment: 'positive',
        context: 'Google AI Overviews surfaces Beamix for "how to improve AI search rankings" queries, pulling from blog posts and G2 reviews. The FAQ Builder agent is specifically mentioned.' },
      { mentioned: false, pos: null, score: 0.08, sentiment: 'neutral',
        context: null },
      { mentioned: true,  pos: 5, score: 0.55, sentiment: 'positive',
        context: 'AI Overviews includes Beamix in a roundup of visibility monitoring tools, though with less prominence than in ChatGPT or Perplexity.' },
      { mentioned: true,  pos: 2, score: 0.80, sentiment: 'positive',
        context: 'For SaaS GEO queries, Google AI Overviews prominently features Beamix after detecting its structured SoftwareApplication schema.' },
      { mentioned: true,  pos: 3, score: 0.74, sentiment: 'positive',
        context: 'AI Overviews compares Beamix and Profound, noting Beamix\'s action layer as the key differentiator for teams that want automated fixes.' },
    ],
    youcom: [
      { mentioned: true,  pos: 2, score: 0.75, sentiment: 'positive',
        context: 'You.com features Beamix prominently in its AI tools category, particularly for its multi-engine scan capability and the speed of its diagnostic reports.' },
      { mentioned: true,  pos: 3, score: 0.68, sentiment: 'positive',
        context: 'You.com recommends Beamix for businesses wanting to improve ChatGPT and Perplexity visibility simultaneously.' },
      { mentioned: true,  pos: 4, score: 0.61, sentiment: 'positive',
        context: 'You.com highlights Beamix as a strong Ahrefs Brand Radar alternative that adds an execution layer on top of monitoring.' },
      { mentioned: true,  pos: 2, score: 0.77, sentiment: 'positive',
        context: 'You.com cites Beamix for AI monitoring queries with references to its weekly digest feature and proactive agent suggestions.' },
      { mentioned: true,  pos: 1, score: 0.83, sentiment: 'positive',
        context: 'You.com places Beamix first for SaaS GEO queries, noting its comprehensive approach from scanning to automated remediation.' },
      { mentioned: true,  pos: 3, score: 0.70, sentiment: 'positive',
        context: 'In comparison content, You.com notes Beamix provides deeper automation than Profound while being more focused than broad-spectrum SEO tools.' },
    ],
  }

  const competitorsSeen = ['Ahrefs Brand Radar', 'Profound', 'Otterly.AI', 'SparkToro', 'Mentio']

  const rows: Array<Record<string, unknown>> = []

  for (let scanIdx = 0; scanIdx < scanIds.length; scanIdx++) {
    const scanId = scanIds[scanIdx]
    // Latest scan (index 0, sorted desc): all 7 engines; older scans: 3 engines
    const isLatest = scanIdx === 0
    const engines = isLatest ? allEngines : freeEngines
    const querySubset = isLatest ? queries : queries.slice(0, 3)

    for (let qi = 0; qi < querySubset.length; qi++) {
      const query = querySubset[qi]
      for (const engine of engines) {
        const behaviors = engineBehaviors[engine]
        const behavior = behaviors[qi % behaviors.length]
        rows.push({
          scan_id: scanId,
          business_id: businessId,
          engine,
          prompt_text: query,
          is_mentioned: behavior.mentioned,
          is_cited: behavior.mentioned,
          rank_position: behavior.pos,
          sentiment_score: behavior.score,
          sentiment: behavior.sentiment,
          competitors_mentioned: isLatest ? competitorsSeen.slice(0, 3) : competitorsSeen.slice(0, 2),
          mention_context: behavior.context,
          queries_checked: 1,
          queries_mentioned: behavior.mentioned ? 1 : 0,
          mention_count: behavior.mentioned ? 1 : 0,
        })
      }
    }
  }

  const { error } = await supabase.from('scan_engine_results').insert(rows as never)
  if (error) throw new Error(`Seed scan_engine_results failed: ${error.message}`)
}

async function seedSuggestions(
  supabase: SupabaseClient,
  businessId: string,
  userId: string,
  latestScanId: string,
): Promise<void> {
  const suggestions = [
    {
      business_id: businessId,
      user_id: userId,
      scan_id: latestScanId,
      agent_type: 'faq_builder',
      title: 'Add FAQ schema to pricing page',
      description:
        'Your pricing page lacks structured FAQ markup. ChatGPT and Perplexity extract FAQ content for featured answers — adding schema.org FAQPage markup will increase your chances of being cited directly in AI responses by ~35%.',
      impact: 'high',
      estimated_runs: 2,
      status: 'pending',
      trigger_rule: 'rule_faq_missing',
    },
    {
      business_id: businessId,
      user_id: userId,
      scan_id: latestScanId,
      agent_type: 'freshness_agent',
      title: "Refresh 'About Beamix' copy for AI Overviews",
      description:
        "Google AI Overviews pulls from your About page when forming brand summaries. Your current copy is 8 months old and doesn't mention your newest agent types. A refresh targeting 'GEO automation platform' and 'autonomous AI agent fixes' will improve AI Overview pickup.",
      impact: 'medium',
      estimated_runs: 1,
      status: 'pending',
      trigger_rule: 'rule_content_stale',
    },
    {
      business_id: businessId,
      user_id: userId,
      scan_id: latestScanId,
      agent_type: 'content_optimizer',
      title: 'Publish comparison page vs Ahrefs Brand Radar',
      description:
        "Ahrefs Brand Radar is the most frequently co-mentioned competitor in AI engine responses. Users querying 'Ahrefs Brand Radar alternative' represent high-intent traffic. A dedicated comparison page converts this query into direct Beamix mentions.",
      impact: 'high',
      estimated_runs: 3,
      status: 'pending',
      trigger_rule: 'rule_competitor_gap',
    },
    {
      business_id: businessId,
      user_id: userId,
      scan_id: latestScanId,
      agent_type: 'offsite_presence_builder',
      title: 'Build offsite citation in SaaS directories',
      description:
        'Beamix has zero citations from G2, Capterra, or SaaSHub. These directories are heavily cited by Perplexity and ChatGPT for SaaS tool queries. Submitting a profile and collecting 5+ reviews adds persistent citation weight across all engines.',
      impact: 'medium',
      estimated_runs: 2,
      status: 'pending',
      trigger_rule: 'rule_offsite_missing',
    },
    {
      business_id: businessId,
      user_id: userId,
      scan_id: latestScanId,
      agent_type: 'schema_generator',
      title: 'Optimize schema.org JSON-LD on homepage',
      description:
        "Your homepage JSON-LD is missing SoftwareApplication markup with 'applicationCategory' and 'offers' properties. Adding these lets AI engines correctly classify Beamix and include it in pricing-aware queries.",
      impact: 'low',
      estimated_runs: 1,
      status: 'pending',
      trigger_rule: 'rule_schema_incomplete',
    },
    {
      business_id: businessId,
      user_id: userId,
      scan_id: latestScanId,
      agent_type: 'competitor_intelligence',
      title: 'Analyze Profound's recent content push',
      description:
        "Profound published 4 new blog posts in the past 2 weeks on GEO topics you own. Two of those posts now rank in Perplexity responses for 'AI search visibility monitoring tool'. A competitive content gap analysis will identify which queries to counter first.",
      impact: 'high',
      estimated_runs: 1,
      status: 'pending',
      trigger_rule: 'rule_competitor_content_surge',
    },
    {
      business_id: businessId,
      user_id: userId,
      scan_id: latestScanId,
      agent_type: 'citation_builder',
      title: 'Get cited on HackerNews + Reddit r/SaaS',
      description:
        'Perplexity and Claude heavily weight HackerNews and Reddit citations. Beamix currently has 5 Reddit mentions but no structured profile posts. A targeted citation build on these platforms adds persistent AI training signal.',
      impact: 'medium',
      estimated_runs: 2,
      status: 'pending',
      trigger_rule: 'rule_citation_gaps',
    },
    {
      business_id: businessId,
      user_id: userId,
      scan_id: latestScanId,
      agent_type: 'entity_builder',
      title: 'Establish Beamix entity on Wikipedia-adjacent sources',
      description:
        "AI engines prefer entities with cross-source corroboration. Beamix lacks entries on Crunchbase and AngelList — two sources Claude and Gemini pull from frequently. Adding these establishes an authoritative entity graph for 'Beamix' as a SaaS company.",
      impact: 'medium',
      estimated_runs: 1,
      status: 'pending',
      trigger_rule: 'rule_entity_weak',
    },
  ]

  const { error } = await supabase.from('suggestions').insert(suggestions as never)
  if (error) throw new Error(`Seed suggestions failed: ${error.message}`)
}

async function seedCompetitors(
  supabase: SupabaseClient,
  businessId: string,
  userId: string,
): Promise<void> {
  const competitors = [
    {
      business_id: businessId,
      user_id: userId,
      name: 'Ahrefs Brand Radar',
      website_url: 'https://ahrefs.com/brand-radar',
      domain: 'ahrefs.com',
      source: 'manual',
      is_active: true,
      latest_score: 82,
      first_seen_score: 79,
    },
    {
      business_id: businessId,
      user_id: userId,
      name: 'Profound',
      website_url: 'https://tryprofound.com',
      domain: 'tryprofound.com',
      source: 'manual',
      is_active: true,
      latest_score: 73,
      first_seen_score: 68,
    },
    {
      business_id: businessId,
      user_id: userId,
      name: 'Otterly.AI',
      website_url: 'https://otterly.ai',
      domain: 'otterly.ai',
      source: 'manual',
      is_active: true,
      latest_score: 61,
      first_seen_score: 61,
    },
    {
      business_id: businessId,
      user_id: userId,
      name: 'SparkToro',
      website_url: 'https://sparktoro.com',
      domain: 'sparktoro.com',
      source: 'auto_detected',
      is_active: true,
      latest_score: 55,
      first_seen_score: 55,
    },
    {
      business_id: businessId,
      user_id: userId,
      name: 'Buzzworthy',
      website_url: 'https://buzzworthy.ai',
      domain: 'buzzworthy.ai',
      source: 'auto_detected',
      is_active: true,
      latest_score: 47,
      first_seen_score: 47,
    },
    {
      business_id: businessId,
      user_id: userId,
      name: 'Mentio',
      website_url: 'https://mentio.ai',
      domain: 'mentio.ai',
      source: 'auto_detected',
      is_active: false,
      latest_score: 35,
      first_seen_score: 38,
    },
  ]

  const { error } = await supabase.from('competitors').insert(competitors as never)
  if (error) throw new Error(`Seed competitors failed: ${error.message}`)
}

async function seedAgentJobs(
  supabase: SupabaseClient,
  businessId: string,
  userId: string,
): Promise<string[]> {
  // 30 jobs spread over 30 days across 5 agent types
  // Mix: completed, failed, running — powers automation sparklines
  type AgentJobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  type AgentType = 'content_optimizer' | 'faq_builder' | 'freshness_agent' | 'schema_generator' | 'competitor_intelligence'

  interface JobEntry {
    agent_type: AgentType
    status: AgentJobStatus
    daysBack: number
    credits_cost: number
    llm_calls: number
    qa_score?: number
    input_params: Record<string, unknown>
    output_data?: Record<string, unknown>
    error_message?: string
    trigger_source: string
  }

  const jobEntries: JobEntry[] = [
    // Day 0-2: running/recent
    {
      agent_type: 'content_optimizer',
      status: 'running',
      daysBack: 0,
      credits_cost: 5,
      llm_calls: 0,
      input_params: { target_url: 'https://beamix.tech/features', optimize_for: ['chatgpt', 'perplexity'] },
      trigger_source: 'automation',
    },
    {
      agent_type: 'faq_builder',
      status: 'running',
      daysBack: 0,
      credits_cost: 3,
      llm_calls: 2,
      input_params: { page_url: 'https://beamix.tech/pricing', faq_count: 8 },
      trigger_source: 'automation',
    },
    // Day 1
    {
      agent_type: 'competitor_intelligence',
      status: 'completed',
      daysBack: 1,
      credits_cost: 4,
      llm_calls: 6,
      qa_score: 89,
      input_params: { competitors: ['Profound', 'Ahrefs Brand Radar'], depth: 'full' },
      output_data: { competitors_analyzed: 2, new_insights: 7, threat_level: 'medium' },
      trigger_source: 'automation',
    },
    // Day 2
    {
      agent_type: 'freshness_agent',
      status: 'completed',
      daysBack: 2,
      credits_cost: 2,
      llm_calls: 4,
      qa_score: 87,
      input_params: { page_url: 'https://beamix.tech/about', staleness_threshold_days: 180 },
      output_data: { word_count: 420, freshness_score: 92, changes_made: 6 },
      trigger_source: 'manual',
    },
    // Day 3
    {
      agent_type: 'schema_generator',
      status: 'completed',
      daysBack: 3,
      credits_cost: 1,
      llm_calls: 2,
      qa_score: 95,
      input_params: { page_url: 'https://beamix.tech', schema_types: ['SoftwareApplication', 'Organization'] },
      output_data: { schema_injected: true, types_added: 2 },
      trigger_source: 'manual',
    },
    // Day 4
    {
      agent_type: 'faq_builder',
      status: 'completed',
      daysBack: 4,
      credits_cost: 3,
      llm_calls: 5,
      qa_score: 91,
      input_params: { page_url: 'https://beamix.tech/blog/what-is-geo', faq_count: 6 },
      output_data: { faqs_generated: 6, schema_added: true },
      trigger_source: 'automation',
    },
    // Day 5
    {
      agent_type: 'content_optimizer',
      status: 'failed',
      daysBack: 5,
      credits_cost: 0,
      llm_calls: 1,
      input_params: { target_url: 'https://beamix.tech/changelog', optimize_for: ['gemini'] },
      error_message: 'Page returned 404 during content fetch',
      trigger_source: 'automation',
    },
    // Day 6
    {
      agent_type: 'competitor_intelligence',
      status: 'completed',
      daysBack: 6,
      credits_cost: 4,
      llm_calls: 8,
      qa_score: 83,
      input_params: { competitors: ['Otterly.AI', 'SparkToro'], depth: 'standard' },
      output_data: { competitors_analyzed: 2, new_insights: 4, threat_level: 'low' },
      trigger_source: 'automation',
    },
    // Day 7
    {
      agent_type: 'content_optimizer',
      status: 'completed',
      daysBack: 7,
      credits_cost: 5,
      llm_calls: 6,
      qa_score: 91,
      input_params: { target_url: 'https://beamix.tech', optimize_for: ['gemini', 'aio'] },
      output_data: { score_before: 61, score_after: 67, changes: 9 },
      trigger_source: 'automation',
    },
    // Day 8
    {
      agent_type: 'freshness_agent',
      status: 'completed',
      daysBack: 8,
      credits_cost: 2,
      llm_calls: 3,
      qa_score: 88,
      input_params: { page_url: 'https://beamix.tech/features', staleness_threshold_days: 90 },
      output_data: { word_count_before: 620, word_count_after: 710, freshness_score: 85 },
      trigger_source: 'automation',
    },
    // Day 9
    {
      agent_type: 'schema_generator',
      status: 'completed',
      daysBack: 9,
      credits_cost: 1,
      llm_calls: 2,
      qa_score: 97,
      input_params: { page_url: 'https://beamix.tech/pricing', schema_types: ['FAQPage', 'PriceSpecification'] },
      output_data: { schema_injected: true, faq_items: 4 },
      trigger_source: 'manual',
    },
    // Day 10
    {
      agent_type: 'content_optimizer',
      status: 'completed',
      daysBack: 10,
      credits_cost: 5,
      llm_calls: 7,
      qa_score: 85,
      input_params: { target_url: 'https://beamix.tech/blog/geo-vs-seo', optimize_for: ['chatgpt', 'claude'] },
      output_data: { geo_terms_added: 12, score_before: 57, score_after: 63 },
      trigger_source: 'automation',
    },
    // Day 11
    {
      agent_type: 'faq_builder',
      status: 'failed',
      daysBack: 11,
      credits_cost: 0,
      llm_calls: 1,
      input_params: { page_url: 'https://beamix.tech/integrations', faq_count: 5 },
      error_message: 'LLM rate limit exceeded after 1 retry',
      trigger_source: 'automation',
    },
    // Day 12
    {
      agent_type: 'competitor_intelligence',
      status: 'completed',
      daysBack: 12,
      credits_cost: 4,
      llm_calls: 9,
      qa_score: 92,
      input_params: { competitors: ['Profound'], depth: 'deep' },
      output_data: { competitors_analyzed: 1, new_insights: 11, content_gaps_found: 5 },
      trigger_source: 'manual',
    },
    // Day 13
    {
      agent_type: 'freshness_agent',
      status: 'completed',
      daysBack: 13,
      credits_cost: 2,
      llm_calls: 4,
      qa_score: 90,
      input_params: { page_url: 'https://beamix.tech/blog/ai-search-optimization', staleness_threshold_days: 60 },
      output_data: { freshness_score: 88, changes_made: 4 },
      trigger_source: 'automation',
    },
    // Day 14
    {
      agent_type: 'schema_generator',
      status: 'completed',
      daysBack: 14,
      credits_cost: 1,
      llm_calls: 2,
      qa_score: 94,
      input_params: { page_url: 'https://beamix.tech/about', schema_types: ['Organization', 'WebSite'] },
      output_data: { schema_injected: true, breadcrumbs_added: true },
      trigger_source: 'automation',
    },
    // Day 15
    {
      agent_type: 'content_optimizer',
      status: 'completed',
      daysBack: 15,
      credits_cost: 5,
      llm_calls: 6,
      qa_score: 87,
      input_params: { target_url: 'https://beamix.tech/pricing', optimize_for: ['perplexity', 'aio'] },
      output_data: { score_before: 54, score_after: 59, cta_clarity_improved: true },
      trigger_source: 'automation',
    },
    // Day 17
    {
      agent_type: 'faq_builder',
      status: 'completed',
      daysBack: 17,
      credits_cost: 3,
      llm_calls: 4,
      qa_score: 88,
      input_params: { page_url: 'https://beamix.tech/blog/perplexity-optimization', faq_count: 5 },
      output_data: { faqs_generated: 5, schema_added: true },
      trigger_source: 'automation',
    },
    // Day 18
    {
      agent_type: 'competitor_intelligence',
      status: 'completed',
      daysBack: 18,
      credits_cost: 4,
      llm_calls: 7,
      qa_score: 86,
      input_params: { competitors: ['Ahrefs Brand Radar', 'Mentio'], depth: 'standard' },
      output_data: { competitors_analyzed: 2, new_insights: 6 },
      trigger_source: 'automation',
    },
    // Day 19
    {
      agent_type: 'freshness_agent',
      status: 'completed',
      daysBack: 19,
      credits_cost: 2,
      llm_calls: 3,
      qa_score: 82,
      input_params: { page_url: 'https://beamix.tech/blog/chatgpt-citations', staleness_threshold_days: 90 },
      output_data: { freshness_score: 79, changes_made: 3 },
      trigger_source: 'automation',
    },
    // Day 20
    {
      agent_type: 'schema_generator',
      status: 'failed',
      daysBack: 20,
      credits_cost: 0,
      llm_calls: 0,
      input_params: { page_url: 'https://beamix.tech/demo', schema_types: ['Product'] },
      error_message: 'Page content insufficient for schema generation (< 200 words)',
      trigger_source: 'automation',
    },
    // Day 21
    {
      agent_type: 'content_optimizer',
      status: 'completed',
      daysBack: 21,
      credits_cost: 5,
      llm_calls: 5,
      qa_score: 83,
      input_params: { target_url: 'https://beamix.tech/blog/geo-for-smbs', optimize_for: ['chatgpt'] },
      output_data: { score_before: 49, score_after: 54, geo_terms_added: 8 },
      trigger_source: 'automation',
    },
    // Day 22
    {
      agent_type: 'faq_builder',
      status: 'completed',
      daysBack: 22,
      credits_cost: 3,
      llm_calls: 4,
      qa_score: 85,
      input_params: { page_url: 'https://beamix.tech', faq_count: 4 },
      output_data: { faqs_generated: 4, schema_added: true },
      trigger_source: 'manual',
    },
    // Day 23
    {
      agent_type: 'competitor_intelligence',
      status: 'completed',
      daysBack: 23,
      credits_cost: 4,
      llm_calls: 6,
      qa_score: 80,
      input_params: { competitors: ['Buzzworthy', 'SparkToro'], depth: 'standard' },
      output_data: { competitors_analyzed: 2, new_insights: 3 },
      trigger_source: 'automation',
    },
    // Day 24
    {
      agent_type: 'freshness_agent',
      status: 'completed',
      daysBack: 24,
      credits_cost: 2,
      llm_calls: 3,
      qa_score: 86,
      input_params: { page_url: 'https://beamix.tech/blog/google-ai-overviews', staleness_threshold_days: 45 },
      output_data: { freshness_score: 91, changes_made: 5 },
      trigger_source: 'automation',
    },
    // Day 25
    {
      agent_type: 'schema_generator',
      status: 'completed',
      daysBack: 25,
      credits_cost: 1,
      llm_calls: 2,
      qa_score: 93,
      input_params: { page_url: 'https://beamix.tech/blog', schema_types: ['Blog', 'BreadcrumbList'] },
      output_data: { schema_injected: true, breadcrumb_items: 3 },
      trigger_source: 'automation',
    },
    // Day 26
    {
      agent_type: 'content_optimizer',
      status: 'completed',
      daysBack: 26,
      credits_cost: 5,
      llm_calls: 6,
      qa_score: 81,
      input_params: { target_url: 'https://beamix.tech/blog/ahrefs-alternative', optimize_for: ['perplexity', 'youcom'] },
      output_data: { score_before: 44, score_after: 49, cta_clarity_improved: false },
      trigger_source: 'automation',
    },
    // Day 27
    {
      agent_type: 'faq_builder',
      status: 'completed',
      daysBack: 27,
      credits_cost: 3,
      llm_calls: 4,
      qa_score: 84,
      input_params: { page_url: 'https://beamix.tech/blog/what-is-geo', faq_count: 5 },
      output_data: { faqs_generated: 5, schema_added: true },
      trigger_source: 'automation',
    },
    // Day 28
    {
      agent_type: 'competitor_intelligence',
      status: 'completed',
      daysBack: 28,
      credits_cost: 4,
      llm_calls: 5,
      qa_score: 78,
      input_params: { competitors: ['Profound', 'Otterly.AI'], depth: 'standard' },
      output_data: { competitors_analyzed: 2, new_insights: 5 },
      trigger_source: 'automation',
    },
    // Day 29
    {
      agent_type: 'freshness_agent',
      status: 'completed',
      daysBack: 29,
      credits_cost: 2,
      llm_calls: 3,
      qa_score: 79,
      input_params: { page_url: 'https://beamix.tech/blog/ai-citations-guide', staleness_threshold_days: 90 },
      output_data: { freshness_score: 82, changes_made: 2 },
      trigger_source: 'automation',
    },
    // Day 30
    {
      agent_type: 'schema_generator',
      status: 'completed',
      daysBack: 30,
      credits_cost: 1,
      llm_calls: 2,
      qa_score: 90,
      input_params: { page_url: 'https://beamix.tech/blog/first-post', schema_types: ['Article', 'BreadcrumbList'] },
      output_data: { schema_injected: true, article_schema_complete: true },
      trigger_source: 'manual',
    },
  ]

  const jobs = jobEntries.map((entry) => {
    const isRunning = entry.status === 'running'
    const isFailed = entry.status === 'failed'
    return {
      business_id: businessId,
      user_id: userId,
      agent_type: entry.agent_type,
      status: entry.status,
      credits_cost: entry.credits_cost,
      llm_calls_count: entry.llm_calls,
      qa_score: entry.qa_score ?? null,
      input_params: entry.input_params,
      output_data: entry.output_data ?? null,
      error_message: entry.error_message ?? null,
      created_at: daysAgo(entry.daysBack),
      started_at: daysAgo(entry.daysBack),
      completed_at: !isRunning && !isFailed ? daysAgo(entry.daysBack) : null,
      updated_at: daysAgo(entry.daysBack),
      trigger_source: entry.trigger_source,
    }
  })

  const { data: inserted, error } = await supabase
    .from('agent_jobs')
    .insert(jobs as never)
    .select('id')

  if (error || !inserted?.length) {
    throw new Error(`Seed agent_jobs failed: ${error?.message}`)
  }

  return inserted.map((r) => (r as { id: string }).id)
}

async function seedContentItems(
  supabase: SupabaseClient,
  businessId: string,
  userId: string,
  jobIds: string[],
): Promise<string[]> {
  // 10 items: 4 in_review, 2 draft, 3 approved (1 published), 1 rejected
  // jobIds[2] = freshness_agent completed (day 2)
  // jobIds[3] = schema_generator completed (day 3)
  // jobIds[4] = faq_builder completed (day 4)
  // jobIds[8] = content_optimizer completed (day 7)
  // jobIds[9] = freshness_agent completed (day 8)
  // jobIds[10] = schema_generator completed (day 9)

  const items = [
    // in_review (4)
    {
      business_id: businessId,
      user_id: userId,
      agent_job_id: jobIds[2] ?? jobIds[0],
      agent_type: 'freshness_agent' as const,
      title: 'Refreshed About Page — GEO Platform Positioning',
      content: `# About Beamix

Beamix is the GEO (Generative Engine Optimization) platform built for SMBs who want to rank in AI search engines — not just Google.

## What We Do

When someone asks ChatGPT, Gemini, or Perplexity "what's the best tool for X," they get an AI-generated answer, not a list of links. Beamix makes sure your business is in that answer.

## How It Works

1. **Scan** — We query 7 AI engines with your target keywords and measure exactly how often and how favorably your business is described.
2. **Diagnose** — Our analysis identifies every gap: missing schema, stale copy, absent citations, weak offsite presence.
3. **Fix** — Autonomous agents execute the fixes. You approve before anything goes live.

## Why It Matters

73% of consumers now use AI assistants for product research. Businesses not visible in AI responses are invisible to a growing share of their market.

## Our Team

Founded in Tel Aviv, Beamix combines SEO expertise with AI engineering to deliver the first fully autonomous GEO platform for growing businesses.`,
      content_body: `# About Beamix

Beamix is the GEO (Generative Engine Optimization) platform built for SMBs who want to rank in AI search engines — not just Google.`,
      content_format: 'markdown' as const,
      status: 'in_review' as const,
      estimated_impact: 'Add 2 citations on Perplexity, +4 points on ChatGPT',
      evidence: {
        targetQueries: ['best GEO platform for SMBs', 'AI search visibility monitoring tool'],
        triggerSource: 'Weekly scan delta',
        impactEstimate: '+4% query coverage',
        citations: [
          { source: 'G2', url: 'https://www.g2.com/products/beamix/reviews' },
          { source: 'Product Hunt', url: 'https://www.producthunt.com/products/beamix' },
        ],
        pages_analyzed: 1,
        staleness_days: 240,
        competitor_mentions_gained: 3,
      },
      target_queries: ['best GEO platform for SMBs', 'AI search visibility monitoring tool'],
      trigger_reason: 'Content freshness rule: page not updated in 180+ days',
      word_count: 210,
    },
    {
      business_id: businessId,
      user_id: userId,
      agent_job_id: jobIds[8] ?? jobIds[0],
      agent_type: 'content_optimizer' as const,
      title: 'Homepage Copy — AI Search Visibility Focus',
      content: `# Rank in AI Search. Automatically.

Beamix scans how ChatGPT, Gemini, Perplexity, and 6 other AI engines describe your business — then deploys agents that close every visibility gap automatically.

## The Problem

AI engines don't crawl links. They synthesize answers from structured data, citations, and authoritative sources. Traditional SEO doesn't move the needle here.

## The Solution

**Scan** your current AI visibility across 7 engines.
**Identify** every gap: missing schema, stale copy, absent citations.
**Fix** with one click — agents handle the work, you approve the result.

## Results

Customers using Beamix for 30 days see an average +18 point improvement in AI visibility score and 2.3× more mentions across ChatGPT and Perplexity.

---

*Join 340+ SMBs using Beamix to own their AI search presence.*`,
      content_body: `# Rank in AI Search. Automatically.

Beamix scans how ChatGPT, Gemini, Perplexity, and 6 other AI engines describe your business — then deploys agents that close every visibility gap automatically.`,
      content_format: 'markdown' as const,
      status: 'in_review' as const,
      estimated_impact: '+8 visibility score across ChatGPT and Gemini',
      evidence: {
        targetQueries: ['how to rank in ChatGPT search', 'best GEO platform for SMBs'],
        triggerSource: 'Weekly scan delta',
        impactEstimate: '+15% query coverage',
        citations: [
          { source: 'Indie Hackers', url: 'https://www.indiehackers.com/product/beamix' },
        ],
        score_before: 61,
        projected_score_after: 69,
        engines_impacted: 4,
      },
      target_queries: ['how to rank in ChatGPT search', 'best GEO platform for SMBs', 'AI search visibility for SaaS startups'],
      trigger_reason: 'Content optimization automation triggered weekly sweep',
      word_count: 175,
    },
    {
      business_id: businessId,
      user_id: userId,
      agent_job_id: jobIds[14] ?? jobIds[0],
      agent_type: 'competitor_intelligence' as const,
      title: "Competitor Gap Report — Profound's Content Push",
      content: `# Competitor Intelligence Report: Profound

## Executive Summary

Profound published 4 blog posts in the past 14 days targeting queries where Beamix currently ranks. Two posts are already appearing in Perplexity responses.

## New Content Detected

1. **"How to improve your Perplexity citations in 7 days"** — ranking #2 on Perplexity for 'perplexity optimization'
2. **"GEO monitoring vs GEO optimization: what's the difference"** — targeting query cluster Beamix owns
3. **"The complete guide to AI search visibility for B2B SaaS"** — high-intent SaaS buyer query
4. **"Schema markup for AI engines: a practical guide"** — directly competes with Schema Generator agent

## Recommended Response

- Publish rebuttal post: "GEO monitoring isn't enough — here's why you need automation"
- Accelerate Schema Generator blog content
- Add citation pull from Profound's weak G2 review coverage`,
      content_body: `# Competitor Intelligence Report: Profound

Profound published 4 blog posts in the past 14 days targeting queries where Beamix currently ranks.`,
      content_format: 'structured_report' as const,
      status: 'in_review' as const,
      estimated_impact: 'Recover 2 query positions from Profound on Perplexity',
      evidence: {
        targetQueries: ['compare Beamix to Profound', 'AI search visibility monitoring tool'],
        triggerSource: 'Weekly scan delta',
        impactEstimate: '+10% query coverage vs Profound',
        citations: [
          { source: 'tryprofound.com', url: 'https://tryprofound.com/blog' },
        ],
        competitors_tracked: ['Profound'],
        new_posts_detected: 4,
      },
      target_queries: ['compare Beamix to Profound', 'GEO platform comparison', 'AI search visibility monitoring tool'],
      trigger_reason: 'Competitor content surge detected: 4 new posts in 14 days targeting owned queries',
      word_count: 280,
    },
    {
      business_id: businessId,
      user_id: userId,
      agent_job_id: jobIds[4] ?? jobIds[0],
      agent_type: 'faq_builder' as const,
      title: 'Blog Post FAQ Schema — "What is GEO?"',
      content: `{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What does GEO stand for?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "GEO stands for Generative Engine Optimization. It is the practice of optimizing your content, schema, and online presence so that AI engines like ChatGPT, Gemini, and Perplexity include your business in their generated answers."
      }
    },
    {
      "@type": "Question",
      "name": "How is GEO different from SEO?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Traditional SEO optimizes for Google's link-ranking algorithm. GEO optimizes for AI engines, which synthesize answers from structured data, citation patterns, and entity clarity rather than link graphs. A site can rank well on Google but be invisible in ChatGPT responses."
      }
    },
    {
      "@type": "Question",
      "name": "Which businesses benefit most from GEO?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "SMBs, SaaS companies, local service providers, and any business where AI assistants influence purchase decisions. As AI search usage grows, GEO visibility directly impacts brand awareness and lead generation."
      }
    }
  ]
}`,
      content_body: `FAQ schema for blog post "What is GEO?" — 3 structured Q&A pairs targeting informational queries.`,
      content_format: 'json_ld' as const,
      status: 'in_review' as const,
      estimated_impact: '+12% click-through on Perplexity featured snippets for "what is GEO"',
      evidence: {
        targetQueries: ['what is GEO optimization', 'how to rank in ChatGPT search'],
        triggerSource: 'Weekly scan delta',
        impactEstimate: '+12% query coverage on informational queries',
        citations: [
          { source: 'schema.org', url: 'https://schema.org/FAQPage' },
        ],
        faq_count: 3,
      },
      target_queries: ['what is GEO optimization', 'how to rank in ChatGPT search'],
      trigger_reason: 'FAQ schema absent on blog post — 800+ monthly search volume informational query',
      word_count: 0,
    },
    // draft (2)
    {
      business_id: businessId,
      user_id: userId,
      agent_job_id: jobIds[3] ?? jobIds[0],
      agent_type: 'schema_generator' as const,
      title: 'Homepage JSON-LD — SoftwareApplication + Organization Schema',
      content: `{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://beamix.tech/#software",
      "name": "Beamix",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "description": "GEO platform that scans AI search visibility and deploys autonomous agents to close visibility gaps for SMBs.",
      "url": "https://beamix.tech",
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "USD",
        "lowPrice": "79",
        "highPrice": "499",
        "offerCount": "3"
      }
    },
    {
      "@type": "Organization",
      "@id": "https://beamix.tech/#organization",
      "name": "Beamix",
      "url": "https://beamix.tech",
      "logo": "https://beamix.tech/logo/beamix_logo_blue_Primary.png",
      "foundingLocation": "Tel Aviv, Israel"
    }
  ]
}`,
      content_body: `SoftwareApplication and Organization JSON-LD schema for the homepage.`,
      content_format: 'json_ld' as const,
      status: 'draft' as const,
      estimated_impact: 'Improved AI engine classification for SaaS tool queries',
      evidence: {
        targetQueries: ['best GEO platform for SMBs', 'Ahrefs Brand Radar alternative'],
        triggerSource: 'Weekly scan delta',
        impactEstimate: '+8% query coverage after schema indexing',
        citations: [{ source: 'schema.org', url: 'https://schema.org/SoftwareApplication' }],
        schema_types_added: 2,
        missing_fields_filled: 7,
      },
      target_queries: ['best GEO platform for SMBs', 'AI search visibility monitoring tool'],
      trigger_reason: 'Schema audit found missing SoftwareApplication markup on homepage',
      word_count: 0,
    },
    {
      business_id: businessId,
      user_id: userId,
      agent_job_id: jobIds[9] ?? jobIds[0],
      agent_type: 'freshness_agent' as const,
      title: 'Features Page — Agent Descriptions Refresh',
      content: `# Beamix Features

## AI Search Visibility Scanning

Query your target keywords across ChatGPT, Gemini, Perplexity, Claude, Grok, Google AI Overviews, and You.com simultaneously. See your exact mention rate, rank position, and sentiment score per engine — updated daily.

**Why it matters:** Each AI engine uses different training data and citation behavior. A unified scan reveals where you're winning and exactly where you're invisible.

## Autonomous Agent Fixes

When a visibility gap is detected, Beamix deploys the right agent automatically. Review the output, approve with one click, and the fix is live. Every action is logged.

**Available agents:**
- FAQ Builder — structures Q&A content for AI snippet extraction
- Content Optimizer — rewrites copy to match current AI training patterns
- Schema Generator — injects correct JSON-LD for every page type
- Freshness Agent — refreshes stale content that AI engines deprioritize
- Competitor Intelligence — maps competitor moves and identifies content gaps

## Proactive Suggestions

Beamix monitors your visibility score 24/7 and surfaces improvement suggestions before you notice a drop. Each suggestion includes estimated impact, effort, and a one-click approval flow.`,
      content_body: `# Beamix Features

Updated features page with current agent descriptions and proactive suggestion system.`,
      content_format: 'markdown' as const,
      status: 'draft' as const,
      estimated_impact: '+3 visibility score on ChatGPT from improved entity clarity',
      evidence: {
        targetQueries: ['best GEO platform for SMBs', 'AI search visibility for SaaS startups'],
        triggerSource: 'Weekly scan delta',
        impactEstimate: '+6% query coverage from updated feature language',
        citations: [],
        word_count_before: 380,
        word_count_after: 490,
        geo_terms_added: 11,
      },
      target_queries: ['best GEO platform for SMBs', 'AI search visibility for SaaS startups'],
      trigger_reason: 'Weekly content sweep — features page last updated 3 months ago',
      word_count: 240,
    },
    // approved (3 — 1 published, 2 approved only)
    {
      business_id: businessId,
      user_id: userId,
      agent_job_id: jobIds[10] ?? jobIds[0],
      agent_type: 'schema_generator' as const,
      title: 'Pricing Page — FAQPage Schema',
      content: `{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is GEO and why does it matter for my business?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "GEO (Generative Engine Optimization) is the practice of optimizing your online presence to appear in AI-generated answers from ChatGPT, Gemini, Perplexity, and similar engines. As more buyers use AI assistants for product research, being cited drives direct awareness and trust."
      }
    },
    {
      "@type": "Question",
      "name": "How is Beamix different from traditional SEO tools?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Traditional SEO tools optimize for Google's link-based ranking algorithm. Beamix optimizes for AI engines, which use different signals: structured data, citation patterns, content freshness, and entity clarity. Beamix also deploys autonomous agents to implement fixes — not just report on them."
      }
    },
    {
      "@type": "Question",
      "name": "Which AI engines does Beamix track?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Beamix tracks ChatGPT, Google Gemini, Perplexity, Claude, Grok, Google AI Overviews, and You.com. The Build and Scale plans include all 7 engines."
      }
    }
  ]
}`,
      content_body: `FAQPage JSON-LD for the pricing page — 3 high-intent Q&A pairs.`,
      content_format: 'json_ld' as const,
      status: 'approved' as const,
      estimated_impact: '+12% click-through from AI-generated answers featuring FAQ snippets',
      evidence: {
        targetQueries: ['best GEO platform for SMBs', 'how to rank in ChatGPT search'],
        triggerSource: 'Weekly scan delta',
        impactEstimate: '+12% query coverage via FAQ featured snippets',
        citations: [{ source: 'schema.org', url: 'https://schema.org/FAQPage' }],
        faq_count: 3,
        engines_impacted: ['chatgpt', 'perplexity', 'gemini'],
      },
      target_queries: ['best GEO platform for SMBs', 'what is GEO optimization'],
      trigger_reason: 'FAQ schema absent on pricing page — high-intent page missing AI snippet potential',
      word_count: 0,
      published_url: 'https://beamix.tech/pricing',
      published_at: daysAgo(3),
      reviewed_at: daysAgo(4),
    },
    {
      business_id: businessId,
      user_id: userId,
      agent_job_id: jobIds[16] ?? jobIds[0],
      agent_type: 'content_optimizer' as const,
      title: 'Features Page — GEO Terminology Refresh',
      content: `# Beamix Features

## AI Search Visibility Scanning

Query your target keywords across ChatGPT, Gemini, Perplexity, Claude, Grok, Google AI Overviews, and You.com simultaneously. See your exact mention rate, rank position, and sentiment score per engine.

**Why it matters:** Each AI engine has different training data and citation behavior. A unified scan reveals where you're winning — and exactly where you're invisible.

## Autonomous Agent Fixes

When a visibility gap is detected, Beamix suggests the agent that fixes it. Approve with one click. The agent writes, optimizes, or publishes — and logs every action for your review.

## Competitive GEO Intelligence

Track how often your competitors appear alongside you in AI responses. See which engines mention them, in what context, and what content earns them the mention — then close the gap.`,
      content_body: `# Beamix Features — GEO Terminology Refresh

Updated copy targeting high-density GEO terminology for AI engine training signal.`,
      content_format: 'markdown' as const,
      status: 'approved' as const,
      estimated_impact: '+6 visibility score across ChatGPT and Perplexity',
      evidence: {
        targetQueries: ['AI search visibility monitoring tool', 'best GEO platform for SMBs'],
        triggerSource: 'Weekly scan delta',
        impactEstimate: '+6% query coverage',
        citations: [],
        word_count_before: 380,
        word_count_after: 520,
        geo_terms_added: 14,
      },
      target_queries: ['AI search visibility monitoring tool', 'best GEO platform for SMBs', 'AI search visibility for SaaS startups'],
      trigger_reason: 'Weekly content sweep — GEO terminology density below threshold',
      word_count: 260,
      published_url: 'https://beamix.tech/features',
      published_at: daysAgo(6),
      reviewed_at: daysAgo(7),
    },
    {
      business_id: businessId,
      user_id: userId,
      agent_job_id: jobIds[21] ?? jobIds[0],
      agent_type: 'content_optimizer' as const,
      title: 'Blog Post — "GEO vs SEO: Why AI Search Needs a Different Playbook"',
      content: `# GEO vs SEO: Why AI Search Needs a Different Playbook

The rules that made businesses visible on Google don't transfer to ChatGPT, Gemini, or Perplexity. Understanding why is the first step to fixing it.

## How Google ranks pages

Google's algorithm ranks pages based on links, content relevance, and user signals. It returns a list of URLs for users to click. You optimize for ranking position.

## How AI engines generate answers

AI engines don't return URL lists. They synthesize an answer. They pull from their training data, web citations, and structured signals to produce a paragraph — and either include your business in that paragraph or don't.

No algorithm rank. No click. Binary: you're cited or you're not.

## What signals AI engines actually respond to

1. **Schema markup** — structured data that communicates clearly what your business does
2. **Citation weight** — being mentioned by sources AI engines trust (Product Hunt, G2, HackerNews, Reddit)
3. **Content freshness** — AI engines deprioritize content older than 6 months on fast-moving topics
4. **Entity clarity** — consistent name, description, and category across all sources

## Why traditional SEO tools miss this

SEO tools measure keywords, backlinks, and page speed. None of those signals matter for AI engine citation. You need tools that measure AI mention rate, sentiment, and rank position directly.

Beamix scans 7 AI engines simultaneously and shows you exactly where you stand — then deploys agents that fix it.`,
      content_body: `# GEO vs SEO: Why AI Search Needs a Different Playbook

SEO and GEO use fundamentally different signals. This post explains why and what to do about it.`,
      content_format: 'markdown' as const,
      status: 'approved' as const,
      estimated_impact: 'Establish Beamix as authoritative source on GEO education queries',
      evidence: {
        targetQueries: ['how to rank in ChatGPT search', 'AI search visibility for SaaS startups'],
        triggerSource: 'Weekly scan delta',
        impactEstimate: '+18% query coverage on educational GEO queries',
        citations: [
          { source: 'indiehackers.com', url: 'https://www.indiehackers.com/product/beamix' },
          { source: 'producthunt.com', url: 'https://www.producthunt.com/products/beamix' },
        ],
        word_count: 410,
        target_engines: ['chatgpt', 'perplexity', 'claude'],
      },
      target_queries: ['how to rank in ChatGPT search', 'AI search visibility for SaaS startups', 'compare Beamix to Profound'],
      trigger_reason: 'Content gap: no authoritative GEO education article on site',
      word_count: 410,
      published_url: 'https://beamix.tech/blog/geo-vs-seo',
      published_at: daysAgo(10),
      reviewed_at: daysAgo(11),
    },
    // rejected (1)
    {
      business_id: businessId,
      user_id: userId,
      agent_job_id: jobIds[6] ?? jobIds[0],
      agent_type: 'content_optimizer' as const,
      title: 'Changelog Page — GEO Visibility Copy',
      content: `# Beamix Changelog

## April 2026

### New: 7-Engine Scan Coverage
Added Grok and You.com to the scan suite. All Build and Scale customers now get full 7-engine visibility reports.

### Improved: Agent Approval Flow
Streamlined the review-and-approve flow for agent outputs. You can now preview changes inline before approving.

### Fixed: Schema injection on dynamic pages
Schema Generator now handles Next.js dynamic routes correctly.`,
      content_body: `# Beamix Changelog — updated for AI engine optimization.`,
      content_format: 'markdown' as const,
      status: 'rejected' as const,
      estimated_impact: 'Minor — changelog pages have low AI citation weight',
      evidence: {
        targetQueries: [],
        triggerSource: 'Weekly scan delta',
        impactEstimate: '+1% query coverage (low confidence)',
        citations: [],
      },
      target_queries: [],
      trigger_reason: 'Low-priority content sweep — changelog page below freshness threshold',
      word_count: 120,
      user_feedback: 'Not worth publishing. Focus agents on higher-impact pages first.',
      reviewed_at: daysAgo(5),
    },
  ]

  const { data: inserted, error } = await supabase
    .from('content_items')
    .insert(items as never)
    .select('id')

  if (error || !inserted?.length) {
    throw new Error(`Seed content_items failed: ${error?.message}`)
  }

  return inserted.map((r) => (r as { id: string }).id)
}

async function seedContentVersions(
  supabase: SupabaseClient,
  contentItemIds: string[],
  userId: string,
): Promise<void> {
  // Insert 2-3 versions for the first 3 in_review items (indices 0, 1, 2)
  const versions = [
    // Item 0 (About page refresh) — 3 versions
    {
      content_item_id: contentItemIds[0],
      version_number: 1,
      content_body: `# About Beamix

Beamix is a GEO platform for SMBs. We scan AI engines and help you rank.`,
      change_summary: 'Initial draft from freshness agent',
      edited_by: userId,
      created_at: daysAgo(3),
    },
    {
      content_item_id: contentItemIds[0],
      version_number: 2,
      content_body: `# About Beamix

Beamix is the GEO (Generative Engine Optimization) platform for SMBs. We scan 7 AI engines and deploy autonomous agents to fix visibility gaps.

## What We Do

When someone asks ChatGPT "what's the best tool for X," they get an AI answer, not links. Beamix makes sure your business is in that answer.`,
      change_summary: 'Expanded intro and added "What We Do" section',
      edited_by: userId,
      created_at: daysAgo(2),
    },
    {
      content_item_id: contentItemIds[0],
      version_number: 3,
      content_body: `# About Beamix

Beamix is the GEO (Generative Engine Optimization) platform built for SMBs who want to rank in AI search engines — not just Google.

## What We Do

When someone asks ChatGPT, Gemini, or Perplexity "what's the best tool for X," they get an AI-generated answer, not a list of links. Beamix makes sure your business is in that answer.

## How It Works

1. **Scan** — We query 7 AI engines with your target keywords.
2. **Diagnose** — We identify every gap: missing schema, stale copy, absent citations.
3. **Fix** — Autonomous agents execute the fixes. You approve before anything goes live.

## Why It Matters

73% of consumers now use AI assistants for product research.`,
      change_summary: 'Added How It Works steps and Why It Matters stat. Ready for review.',
      edited_by: userId,
      created_at: daysAgo(1),
    },
    // Item 1 (Homepage copy) — 2 versions
    {
      content_item_id: contentItemIds[1],
      version_number: 1,
      content_body: `# Rank in AI Search.

Beamix tracks your visibility across ChatGPT, Gemini, and Perplexity and helps you improve it.`,
      change_summary: 'Initial agent output — thin copy',
      edited_by: userId,
      created_at: daysAgo(4),
    },
    {
      content_item_id: contentItemIds[1],
      version_number: 2,
      content_body: `# Rank in AI Search. Automatically.

Beamix scans how ChatGPT, Gemini, Perplexity, and 6 other AI engines describe your business — then deploys agents that close every visibility gap automatically.

## The Problem

AI engines don't crawl links. They synthesize answers from structured data, citations, and authoritative sources.

## The Solution

**Scan** → **Identify** → **Fix** — one click, agents handle the work.`,
      change_summary: 'Rewrote hero and added problem/solution structure',
      edited_by: userId,
      created_at: daysAgo(3),
    },
    // Item 2 (Competitor intelligence report) — 2 versions
    {
      content_item_id: contentItemIds[2],
      version_number: 1,
      content_body: `# Competitor Report: Profound

Profound published 4 new posts this week targeting your queries.

- Post 1: Perplexity citations guide
- Post 2: GEO monitoring vs optimization
- Post 3: B2B SaaS AI visibility
- Post 4: Schema markup guide`,
      change_summary: 'Initial raw competitor analysis',
      edited_by: userId,
      created_at: daysAgo(5),
    },
    {
      content_item_id: contentItemIds[2],
      version_number: 2,
      content_body: `# Competitor Intelligence Report: Profound

## Executive Summary

Profound published 4 blog posts in the past 14 days targeting queries where Beamix currently ranks. Two posts are already appearing in Perplexity responses.

## New Content Detected

1. **"How to improve your Perplexity citations in 7 days"** — ranking #2
2. **"GEO monitoring vs GEO optimization"** — competing for owned query cluster
3. **"Complete guide to AI visibility for B2B SaaS"** — high-intent SaaS query
4. **"Schema markup for AI engines"** — competes with Schema Generator positioning

## Recommended Response

Counter with authority post: "GEO monitoring isn't enough — here's why you need automation."`,
      change_summary: 'Added structured executive summary and ranked recommendations',
      edited_by: userId,
      created_at: daysAgo(4),
    },
  ]

  const { error } = await supabase.from('content_versions').insert(versions as never)
  if (error) throw new Error(`Seed content_versions failed: ${error.message}`)
}

async function seedAutomationConfigs(
  supabase: SupabaseClient,
  businessId: string,
  userId: string,
): Promise<void> {
  const configs = [
    {
      business_id: businessId,
      user_id: userId,
      agent_type: 'faq_builder',
      cadence: 'daily',
      is_active: true,
      next_run_at: hoursFromNow(18),
      runs_this_month: 12,
      max_runs_per_month: 30,
    },
    {
      business_id: businessId,
      user_id: userId,
      agent_type: 'content_optimizer',
      cadence: 'weekly',
      is_active: true,
      next_run_at: daysFromNow(5),
      runs_this_month: 3,
      max_runs_per_month: 8,
    },
    {
      business_id: businessId,
      user_id: userId,
      agent_type: 'freshness_agent',
      cadence: 'monthly',
      is_active: false,
      paused_at: daysAgo(2),
      next_run_at: null,
      runs_this_month: 1,
      max_runs_per_month: 2,
    },
    {
      business_id: businessId,
      user_id: userId,
      agent_type: 'schema_generator',
      cadence: 'weekly',
      is_active: true,
      next_run_at: daysFromNow(3),
      runs_this_month: 4,
      max_runs_per_month: 8,
    },
    {
      business_id: businessId,
      user_id: userId,
      agent_type: 'competitor_intelligence',
      cadence: 'daily',
      is_active: true,
      next_run_at: hoursFromNow(6),
      runs_this_month: 8,
      max_runs_per_month: 30,
    },
  ]

  const { error } = await supabase.from('automation_configs').insert(configs as never)
  if (error) throw new Error(`Seed automation_configs failed: ${error.message}`)
}

async function seedAutomationSettings(supabase: SupabaseClient, userId: string): Promise<void> {
  const { error } = await supabase
    .from('automation_settings')
    .insert({ user_id: userId, automation_paused: false, credit_cap: 200 } as never)
  if (error) throw new Error(`Seed automation_settings failed: ${error.message}`)
}

async function seedCreditPool(supabase: SupabaseClient, userId: string): Promise<void> {
  const { error } = await supabase.from('credit_pools').insert({
    user_id: userId,
    pool_type: 'monthly',
    base_allocation: 200,
    rollover_amount: 20,
    topup_amount: 25,
    used_amount: 83,
    period_start: startOfMonth(),
    period_end: endOfMonth(),
  } as never)
  if (error) throw new Error(`Seed credit_pools failed: ${error.message}`)
}

async function seedCitationSources(supabase: SupabaseClient, businessId: string): Promise<void> {
  const sources = [
    { business_id: businessId, source_domain: 'producthunt.com', mention_count: 12, engines: ['chatgpt', 'perplexity'] },
    { business_id: businessId, source_domain: 'indiehackers.com', mention_count: 8, engines: ['chatgpt', 'claude'] },
    { business_id: businessId, source_domain: 'g2.com', mention_count: 6, engines: ['perplexity', 'aio'] },
    { business_id: businessId, source_domain: 'news.ycombinator.com', mention_count: 5, engines: ['gemini'] },
    { business_id: businessId, source_domain: 'reddit.com/r/saas', mention_count: 3, engines: ['chatgpt'] },
  ]

  const { error } = await supabase.from('citation_sources').insert(sources as never)
  if (error) throw new Error(`Seed citation_sources failed: ${error.message}`)
}

async function seedNotifications(supabase: SupabaseClient, userId: string): Promise<void> {
  const notifications = [
    {
      user_id: userId,
      title: 'FAQ Builder completed',
      body: 'FAQ schema for your pricing page is ready for review. Estimated impact: +12% click-through from AI featured snippets.',
      type: 'agent_complete',
      severity: 'info',
      is_read: false,
      action_url: '/dashboard/inbox',
      created_at: daysAgo(0),
    },
    {
      user_id: userId,
      title: 'Score up 4 points',
      body: 'Your AI visibility score increased from 67 to 71 in the latest scan. Perplexity and ChatGPT both show improvement.',
      type: 'score_change',
      severity: 'success',
      is_read: false,
      action_url: '/dashboard/scans',
      created_at: daysAgo(1),
    },
    {
      user_id: userId,
      title: 'New suggestion: Add FAQ schema to pricing page',
      body: 'Beamix detected a high-impact improvement opportunity. Adding FAQ schema to your pricing page could increase AI citation rate by 35%.',
      type: 'suggestion',
      severity: 'info',
      is_read: true,
      action_url: '/dashboard',
      created_at: daysAgo(1),
    },
    {
      user_id: userId,
      title: 'Competitor Profound published new blog post',
      body: 'Profound published "GEO monitoring vs GEO optimization" — targeting a query cluster you currently own. Review competitor activity.',
      type: 'competitor_alert',
      severity: 'warning',
      is_read: false,
      action_url: '/dashboard/competitors',
      created_at: daysAgo(2),
    },
    {
      user_id: userId,
      title: 'Content item approved',
      body: '"Features Page — GEO Terminology Refresh" was approved and published to beamix.tech/features.',
      type: 'content_approved',
      severity: 'success',
      is_read: true,
      action_url: '/dashboard/inbox',
      created_at: daysAgo(6),
    },
    {
      user_id: userId,
      title: 'Weekly digest: 4 improvements completed',
      body: 'This week: 4 agent jobs completed, +6 visibility score improvement, 2 new competitor alerts, 3 new suggestions queued.',
      type: 'weekly_digest',
      severity: 'info',
      is_read: true,
      action_url: '/dashboard',
      created_at: daysAgo(7),
    },
    {
      user_id: userId,
      title: 'Agent job failed: Content Optimizer',
      body: 'Content Optimizer could not process beamix.tech/changelog — page returned a 404 during content fetch. No credits were charged.',
      type: 'agent_failed',
      severity: 'error',
      is_read: true,
      action_url: '/dashboard/automation',
      created_at: daysAgo(5),
    },
    {
      user_id: userId,
      title: 'New competitor detected: Buzzworthy',
      body: 'Buzzworthy appeared in 3 AI engine responses alongside Beamix this week. Added to your competitor tracking list.',
      type: 'competitor_detected',
      severity: 'info',
      is_read: false,
      action_url: '/dashboard/competitors',
      created_at: daysAgo(3),
    },
    {
      user_id: userId,
      title: 'Score dip: down 2 points',
      body: 'Your visibility score dropped from 63 to 61. Gemini and Grok coverage declined slightly. Running Content Optimizer to recover.',
      type: 'score_change',
      severity: 'warning',
      is_read: true,
      action_url: '/dashboard/scans',
      created_at: daysAgo(13),
    },
    {
      user_id: userId,
      title: 'Suggestion: Establish Beamix entity on Crunchbase',
      body: 'AI engines prefer entities with cross-source corroboration. Adding Crunchbase and AngelList profiles could add persistent AI training signal for Claude and Gemini.',
      type: 'suggestion',
      severity: 'info',
      is_read: false,
      action_url: '/dashboard',
      created_at: daysAgo(4),
    },
  ]

  const { error } = await supabase.from('notifications').insert(notifications as never)
  if (error) throw new Error(`Seed notifications failed: ${error.message}`)
}

async function seedSubscription(supabase: SupabaseClient, userId: string): Promise<void> {
  // Upsert subscription — look up 'build' plan_id if plans table has it, fallback to null
  const { data: buildPlan } = await supabase
    .from('plans')
    .select('id')
    .eq('tier', 'build')
    .maybeSingle()

  const planId = (buildPlan as { id: string } | null)?.id ?? null

  const { error } = await supabase.from('subscriptions').insert({
    user_id: userId,
    plan_tier: 'build',
    plan_id: planId,
    status: 'active',
    billing_interval: 'monthly',
    current_period_start: daysAgo(30),
    current_period_end: daysFromNow(0),
    cancel_at_period_end: false,
    autonomous_cap_pct: 80,
  } as never)

  // Ignore duplicate key errors — subscription may already exist from trigger
  if (error && !error.message.includes('duplicate') && !error.message.includes('unique')) {
    throw new Error(`Seed subscriptions failed: ${error.message}`)
  }
}

async function seedUserProfile(supabase: SupabaseClient, userId: string): Promise<void> {
  const { error } = await supabase
    .from('user_profiles')
    .update({
      full_name: 'Beamix Team',
      locale: 'en',
      timezone: 'Asia/Jerusalem',
      onboarding_completed_at: daysAgo(30),
      onboarding_step: 4,
      interface_lang: 'en',
      content_lang: 'en',
    } as never)
    .eq('id', userId)

  if (error) throw new Error(`Seed user_profiles failed: ${error.message}`)
}

async function seedNotificationPreferences(supabase: SupabaseClient, userId: string): Promise<void> {
  const { error } = await supabase.from('notification_preferences').insert({
    user_id: userId,
    scan_complete_emails: true,
    weekly_digest: true,
    agent_completion: true,
    competitor_alerts: false,
    ranking_change_alerts: true,
    daily_digest: false,
    marketing_tips: false,
    product_updates: true,
    integration_launch_notify: true,
    email_enabled: true,
    inapp_enabled: true,
    slack_enabled: false,
    email_digest: 'weekly',
  } as never)

  // Ignore duplicate — trigger may have created a row already
  if (error && !error.message.includes('duplicate') && !error.message.includes('unique')) {
    throw new Error(`Seed notification_preferences failed: ${error.message}`)
  }
}

async function deleteDemoData(supabase: SupabaseClient, businessId: string, userId: string): Promise<void> {
  // Delete all demo rows for this business + user, preserving auth row and user_profiles row.
  // Order matters due to FKs: child tables first.
  await supabase.from('content_versions')
    .delete()
    .in(
      'content_item_id',
      (await supabase.from('content_items').select('id').eq('business_id', businessId)).data?.map((r) => (r as { id: string }).id) ?? [],
    )

  await supabase.from('content_items').delete().eq('business_id', businessId)
  await supabase.from('agent_jobs').delete().eq('business_id', businessId)
  await supabase.from('scan_engine_results').delete().eq('business_id', businessId)
  await supabase.from('scans').delete().eq('business_id', businessId)
  await supabase.from('suggestions').delete().eq('business_id', businessId)
  await supabase.from('competitors').delete().eq('business_id', businessId)
  await supabase.from('automation_configs').delete().eq('business_id', businessId)
  await supabase.from('citation_sources').delete().eq('business_id', businessId)
  await supabase.from('automation_settings').delete().eq('user_id', userId)
  await supabase.from('credit_pools').delete().eq('user_id', userId)
  await supabase.from('notifications').delete().eq('user_id', userId)
  await supabase.from('subscriptions').delete().eq('user_id', userId)
  await supabase.from('notification_preferences').delete().eq('user_id', userId)
}

// ── main export ───────────────────────────────────────────────────────────────

export async function seedTesterDemoData(
  userId: string,
): Promise<{ seeded: boolean; businessId?: string }> {
  const supabase = createServiceClient()

  // Idempotency: if business exists → wipe demo rows and re-seed fresh
  const { data: existing } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', userId)
    .eq('website_url', 'https://beamix.tech')
    .maybeSingle()

  let businessId: string

  if (existing?.id) {
    // Existing business — delete all demo data then re-seed
    businessId = existing.id as string
    await deleteDemoData(supabase, businessId, userId)
  } else {
    // ── Step 1: Insert primary business ──────────────────────────────────────
    const { data: business, error: bizErr } = await supabase
      .from('businesses')
      .insert({
        user_id: userId,
        name: 'Beamix.tech',
        website_url: 'https://beamix.tech',
        industry: 'SaaS / AI Search (GEO)',
        location: 'Tel Aviv, Israel',
        services: [
          'AI search visibility scans',
          'Autonomous agent fixes',
          'Competitive GEO intelligence',
        ],
        description:
          'Beamix scans how ChatGPT, Gemini, Perplexity and 6 other AI engines describe your business — then deploys agents that close every visibility gap automatically.',
        is_primary: true,
        language: 'en',
      } as never)
      .select('id')
      .single()

    if (bizErr || !business) {
      throw new Error(`Seed business failed: ${bizErr?.message}`)
    }

    businessId = (business as { id: string }).id
  }

  // ── Step 2: Scans (sequential — need IDs for engine results) ─────────────
  const latestScanId = await seedScans(supabase, businessId, userId)

  // Fetch all scan IDs sorted desc for engine results
  const { data: allScans } = await supabase
    .from('scans')
    .select('id')
    .eq('business_id', businessId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  const scanIds = (allScans ?? []).map((s) => (s as { id: string }).id)

  // ── Step 3: Agent jobs first (content_items FK depends on job IDs) ────────
  const jobIds = await seedAgentJobs(supabase, businessId, userId)

  // ── Step 4: Content items (need job IDs) ─────────────────────────────────
  const contentItemIds = await seedContentItems(supabase, businessId, userId, jobIds)

  // ── Step 5: Rest in parallel ──────────────────────────────────────────────
  await Promise.all([
    seedScanEngineResults(supabase, businessId, scanIds),
    seedSuggestions(supabase, businessId, userId, latestScanId),
    seedCompetitors(supabase, businessId, userId),
    seedContentVersions(supabase, contentItemIds, userId),
    seedAutomationConfigs(supabase, businessId, userId),
    seedAutomationSettings(supabase, userId),
    seedCreditPool(supabase, userId),
    seedCitationSources(supabase, businessId),
    seedNotifications(supabase, userId),
    seedSubscription(supabase, userId),
    seedUserProfile(supabase, userId),
    seedNotificationPreferences(supabase, userId),
  ])

  return { seeded: true, businessId }
}
