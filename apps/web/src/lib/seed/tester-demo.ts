/**
 * Tester demo seed — Beamix.tech narrative
 *
 * Idempotent: checks for existing business before seeding.
 * Non-fatal: caller wraps in try/catch.
 * Uses service client (SUPABASE_SERVICE_ROLE_KEY) to bypass RLS.
 *
 * Tables seeded (total ~60+ rows):
 *   businesses (1), scans (5), scan_engine_results (~45),
 *   suggestions (5), competitors (3), content_items (5),
 *   agent_jobs (5), automation_configs (3), automation_settings (1),
 *   credit_pools (1), citation_sources (5)
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
  // Scores improving: 52 → 58 → 61 → 67 → 71 over ~14 days (oldest first)
  const entries = [
    { score: 52, daysBack: 14, delta: null },
    { score: 58, daysBack: 11, delta: 6 },
    { score: 61, daysBack: 8, delta: 3 },
    { score: 67, daysBack: 5, delta: 6 },
    { score: 71, daysBack: 2, delta: 4 },
  ]

  const engines = ['chatgpt', 'gemini', 'perplexity', 'claude', 'grok', 'aio', 'youcom']

  const scanRows = entries.map(({ score, daysBack, delta }) => ({
    business_id: businessId,
    user_id: userId,
    overall_score: score,
    scan_type: 'scheduled',
    status: 'completed' as const,
    engines_queried: engines,
    engines_scanned: engines,
    queries_count: 4,
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
  const queries = [
    'best GEO platform for SMBs',
    'how to rank in ChatGPT search',
    'Ahrefs Brand Radar alternative',
    'AI search visibility monitoring tool',
  ]

  const engineSets: Array<{ engine: string; mentioned: boolean; pos: number | null; score: number }> = [
    { engine: 'chatgpt', mentioned: true, pos: 2, score: 0.75 },
    { engine: 'perplexity', mentioned: true, pos: 3, score: 0.68 },
    { engine: 'gemini', mentioned: false, pos: null, score: -0.1 },
    { engine: 'claude', mentioned: true, pos: 5, score: 0.55 },
    { engine: 'aio', mentioned: false, pos: null, score: 0.1 },
  ]

  const competitorsSeen = ['Ahrefs Brand Radar', 'Profound']

  const rows: Array<Record<string, unknown>> = []

  for (const scanId of scanIds) {
    for (const query of queries) {
      // Pick 3 engines per (scan, query) combo — keeps total ~60 rows
      const engines = engineSets.slice(0, 3)
      for (const eng of engines) {
        rows.push({
          scan_id: scanId,
          business_id: businessId,
          engine: eng.engine,
          prompt_text: query,
          is_mentioned: eng.mentioned,
          is_cited: eng.mentioned,
          rank_position: eng.pos,
          sentiment_score: eng.score,
          sentiment: eng.score > 0.5 ? 'positive' : eng.score > 0 ? 'neutral' : 'negative',
          competitors_mentioned: competitorsSeen,
          mention_context: eng.mentioned
            ? `Beamix was mentioned as a leading GEO platform for "${query}". It was described as offering autonomous AI agents that close visibility gaps.`
            : null,
          queries_checked: 1,
          queries_mentioned: eng.mentioned ? 1 : 0,
          mention_count: eng.mentioned ? 1 : 0,
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
      latest_score: 78,
      first_seen_score: 78,
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
      first_seen_score: 73,
    },
    {
      business_id: businessId,
      user_id: userId,
      name: 'Otterly.AI',
      website_url: 'https://otterly.ai',
      domain: 'otterly.ai',
      source: 'manual',
      is_active: true,
      latest_score: 65,
      first_seen_score: 65,
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
  const now = new Date().toISOString()

  const jobs = [
    {
      business_id: businessId,
      user_id: userId,
      agent_type: 'content_optimizer' as const,
      status: 'running' as const,
      credits_cost: 5,
      llm_calls_count: 0,
      input_params: { target_url: 'https://beamix.tech/features', optimize_for: ['chatgpt', 'perplexity'] },
      created_at: daysAgo(0),
      started_at: daysAgo(0),
      updated_at: now,
      trigger_source: 'automation',
    },
    {
      business_id: businessId,
      user_id: userId,
      agent_type: 'faq_builder' as const,
      status: 'running' as const,
      credits_cost: 3,
      llm_calls_count: 2,
      input_params: { page_url: 'https://beamix.tech/pricing', faq_count: 8 },
      created_at: daysAgo(0),
      started_at: daysAgo(0),
      updated_at: now,
      trigger_source: 'automation',
    },
    {
      business_id: businessId,
      user_id: userId,
      agent_type: 'freshness_agent' as const,
      status: 'completed' as const,
      credits_cost: 2,
      llm_calls_count: 4,
      qa_score: 87,
      input_params: { page_url: 'https://beamix.tech/about', staleness_threshold_days: 180 },
      output_data: { word_count: 420, freshness_score: 92, changes_made: 6 },
      created_at: daysAgo(4),
      started_at: daysAgo(4),
      completed_at: daysAgo(4),
      updated_at: daysAgo(4),
      trigger_source: 'manual',
    },
    {
      business_id: businessId,
      user_id: userId,
      agent_type: 'content_optimizer' as const,
      status: 'completed' as const,
      credits_cost: 5,
      llm_calls_count: 6,
      qa_score: 91,
      input_params: { target_url: 'https://beamix.tech', optimize_for: ['gemini', 'aio'] },
      output_data: { score_before: 61, score_after: 67, changes: 9 },
      created_at: daysAgo(7),
      started_at: daysAgo(7),
      completed_at: daysAgo(7),
      updated_at: daysAgo(7),
      trigger_source: 'automation',
    },
    {
      business_id: businessId,
      user_id: userId,
      agent_type: 'schema_generator' as const,
      status: 'completed' as const,
      credits_cost: 1,
      llm_calls_count: 2,
      qa_score: 95,
      input_params: { page_url: 'https://beamix.tech', schema_types: ['SoftwareApplication', 'Organization'] },
      output_data: { schema_injected: true, types_added: 2 },
      created_at: daysAgo(10),
      started_at: daysAgo(10),
      completed_at: daysAgo(10),
      updated_at: daysAgo(10),
      trigger_source: 'manual',
    },
  ]

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
): Promise<void> {
  const items = [
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
      content_format: 'markdown' as const,
      status: 'in_review' as const,
      estimated_impact: 'Estimated +4 visibility score across Google AI Overviews and ChatGPT',
      evidence: { pages_analyzed: 1, staleness_days: 240, competitor_mentions_gained: 3 },
      trigger_reason: 'Content freshness rule: page not updated in 180+ days',
      word_count: 210,
    },
    {
      business_id: businessId,
      user_id: userId,
      agent_job_id: jobIds[3] ?? jobIds[0],
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
      content_format: 'markdown' as const,
      status: 'in_review' as const,
      estimated_impact: 'Estimated +8 visibility score across ChatGPT and Gemini',
      evidence: { score_before: 61, projected_score_after: 69, engines_impacted: 4 },
      trigger_reason: 'Content optimization automation triggered weekly sweep',
      word_count: 175,
    },
    {
      business_id: businessId,
      user_id: userId,
      agent_job_id: jobIds[4] ?? jobIds[0],
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
      },
      "featureList": [
        "AI search visibility scanning across 7 engines",
        "Autonomous agent-driven content optimization",
        "Competitive GEO intelligence",
        "Schema.org markup generation",
        "Citation building in AI training sources"
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "47"
      }
    },
    {
      "@type": "Organization",
      "@id": "https://beamix.tech/#organization",
      "name": "Beamix",
      "url": "https://beamix.tech",
      "logo": "https://beamix.tech/logo/beamix_logo_blue_Primary.png",
      "foundingLocation": "Tel Aviv, Israel",
      "sameAs": [
        "https://www.linkedin.com/company/beamix",
        "https://twitter.com/beamixtech"
      ]
    }
  ]
}`,
      content_format: 'json_ld' as const,
      status: 'draft' as const,
      estimated_impact: 'Improved AI engine classification for SaaS tool queries',
      evidence: { schema_types_added: 2, missing_fields_filled: 7 },
      trigger_reason: 'Schema audit found missing SoftwareApplication markup',
      word_count: 0,
    },
    {
      business_id: businessId,
      user_id: userId,
      agent_job_id: jobIds[3] ?? jobIds[0],
      agent_type: 'content_optimizer' as const,
      title: 'Features Page — GEO Terminology Refresh',
      content: `# Beamix Features

## AI Search Visibility Scanning

Query your target keywords across ChatGPT, Gemini, Perplexity, Claude, Grok, Google AI Overviews, and You.com simultaneously. See your exact mention rate, rank position, and sentiment score per engine.

**Why it matters:** Each AI engine has different training data and citation behavior. A unified scan reveals where you're winning — and exactly where you're invisible.

## Autonomous Agent Fixes

When a visibility gap is detected, Beamix suggests the agent that fixes it. Approve with one click. The agent writes, optimizes, or publishes — and logs every action for your review.

**Agents available:**
- FAQ Builder — structures your Q&A for AI snippet extraction
- Content Optimizer — rewrites copy to match AI training data patterns
- Schema Generator — injects correct JSON-LD for every page type
- Offsite Presence Builder — submits profiles to AI-cited directories
- Freshness Agent — refreshes stale copy that AI engines deprioritize

## Competitive GEO Intelligence

Track how often your competitors appear alongside you in AI responses. See which engines mention them, in what context, and what content earns them the mention — then close the gap.`,
      content_format: 'markdown' as const,
      status: 'approved' as const,
      estimated_impact: '+6 visibility score across ChatGPT and Perplexity',
      evidence: { word_count_before: 380, word_count_after: 520, geo_terms_added: 14 },
      trigger_reason: 'Weekly content sweep — GEO terminology density below threshold',
      word_count: 260,
      published_url: 'https://beamix.tech/features',
      published_at: daysAgo(6),
    },
    {
      business_id: businessId,
      user_id: userId,
      agent_job_id: jobIds[4] ?? jobIds[0],
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
        "text": "GEO (Generative Engine Optimization) is the practice of optimizing your online presence to appear in AI-generated answers from ChatGPT, Gemini, Perplexity, and similar engines. As more buyers use AI assistants for product research, being cited in these answers drives direct awareness and trust."
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
    },
    {
      "@type": "Question",
      "name": "Can I cancel at any time?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. All Beamix plans are month-to-month with no lock-in. You can cancel from the Settings page at any time. Annual plan subscribers receive a prorated refund for unused months."
      }
    }
  ]
}`,
      content_format: 'json_ld' as const,
      status: 'approved' as const,
      estimated_impact: '+12% click-through from AI-generated answers featuring FAQ snippets',
      evidence: { faq_count: 4, engines_impacted: ['chatgpt', 'perplexity', 'gemini'] },
      trigger_reason: 'FAQ schema absent on pricing page — high-intent page missing AI snippet potential',
      word_count: 0,
      published_url: 'https://beamix.tech/pricing',
      published_at: daysAgo(3),
    },
  ]

  const { error } = await supabase.from('content_items').insert(items as never)
  if (error) throw new Error(`Seed content_items failed: ${error.message}`)
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
      agent_type: 'freshness_agent',
      cadence: 'monthly',
      is_active: false,
      paused_at: daysAgo(2),
      next_run_at: null,
      runs_this_month: 1,
      max_runs_per_month: 2,
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
    base_allocation: 100,
    rollover_amount: 15,
    topup_amount: 25,
    used_amount: 47,
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

// ── main export ───────────────────────────────────────────────────────────────

export async function seedTesterDemoData(
  userId: string,
): Promise<{ seeded: boolean; businessId?: string }> {
  const supabase = createServiceClient()

  // Idempotency check — return early if Beamix.tech business already exists for this user
  const { data: existing } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', userId)
    .eq('website_url', 'https://beamix.tech')
    .maybeSingle()

  if (existing?.id) {
    return { seeded: false, businessId: existing.id as string }
  }

  // ── Step 1: Insert primary business ────────────────────────────────────────
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

  const businessId = (business as { id: string }).id

  // ── Step 2: Insert scans (sequential — need IDs for downstream) ────────────
  const latestScanId = await seedScans(supabase, businessId, userId)

  // Fetch all scan IDs for this business to populate engine results
  const { data: allScans } = await supabase
    .from('scans')
    .select('id')
    .eq('business_id', businessId)
    .eq('user_id', userId)

  const scanIds = (allScans ?? []).map((s) => (s as { id: string }).id)

  // ── Step 3: Insert agent_jobs first (content_items FK depends on job IDs) ──
  const jobIds = await seedAgentJobs(supabase, businessId, userId)

  // ── Step 4: Insert the rest in parallel ────────────────────────────────────
  await Promise.all([
    seedScanEngineResults(supabase, businessId, scanIds),
    seedSuggestions(supabase, businessId, userId, latestScanId),
    seedCompetitors(supabase, businessId, userId),
    seedContentItems(supabase, businessId, userId, jobIds),
    seedAutomationConfigs(supabase, businessId, userId),
    seedAutomationSettings(supabase, userId),
    seedCreditPool(supabase, userId),
    seedCitationSources(supabase, businessId),
  ])

  return { seeded: true, businessId }
}
