import type { RunRow, RunTrace } from './types'

/**
 * DEMO_RUNS — Run History fixture data
 * Business: Bright Smile Dental, Ramat Gan
 *
 * 12 runs spread across all 11 agents, realistic timestamps, mixed modes/statuses.
 */
export const DEMO_RUNS: { rows: RunRow[]; traces: Record<string, RunTrace> } = {
  rows: [
    {
      id: 'r1',
      agentLabel: 'Content Optimizer',
      mode: 'myself',
      status: 'success',
      timestamp: '2026-06-11T14:22:00.000Z',
      costUsd: 0.04,
      snippet: 'Rewrote whitening page — added Ramat Gan pricing context, 3 local competitor gaps closed.',
    },
    {
      id: 'r2',
      agentLabel: 'Schema Generator',
      mode: 'beamix',
      status: 'success',
      timestamp: '2026-06-10T09:15:00.000Z',
      costUsd: 0.01,
      snippet: 'Dentist schema published with 11 fields. Validity 94/100. Missing: acceptsInsurance.',
    },
    {
      id: 'r3',
      agentLabel: 'Query Mapper',
      mode: 'myself',
      status: 'success',
      timestamp: '2026-06-09T11:00:00.000Z',
      costUsd: 0.06,
      snippet: '5 high-frequency queries identified where ChatGPT cites Tel Aviv competitors instead.',
    },
    {
      id: 'r4',
      agentLabel: 'FAQ Builder',
      mode: 'beamix',
      status: 'failed',
      timestamp: '2026-06-08T16:45:00.000Z',
      costUsd: 0.00,
      snippet: 'Pipeline stopped at QA — content failed YMYL dental advice review (3 unverified claims).',
    },
    {
      id: 'r5',
      agentLabel: 'Freshness Agent',
      mode: 'beamix',
      status: 'success',
      timestamp: '2026-06-08T08:30:00.000Z',
      costUsd: 0.03,
      snippet: 'Refreshed implants page with 2026 pricing data and updated post-procedure care guidelines.',
    },
    {
      id: 'r6',
      agentLabel: 'Off-Site Presence Builder',
      mode: 'myself',
      status: 'success',
      timestamp: '2026-06-07T13:20:00.000Z',
      costUsd: 0.00,
      snippet: 'Submitted to 4 dental directories (Zap-Doctors, Waze Places, Google Business, Yelp IL).',
    },
    {
      id: 'r7',
      agentLabel: 'Performance Tracker',
      mode: 'beamix',
      status: 'success',
      timestamp: '2026-06-06T10:00:00.000Z',
      costUsd: 0.00,
      snippet: 'Visibility score up 4 points week-over-week. ChatGPT mentions increased from 31 → 38%.',
    },
    {
      id: 'r8',
      agentLabel: 'Entity Builder',
      mode: 'myself',
      status: 'success',
      timestamp: '2026-06-05T15:40:00.000Z',
      costUsd: 0.04,
      snippet: 'Entity graph enriched: 6 co-citation anchors added, dentist → endodontist relationship mapped.',
    },
    {
      id: 'r9',
      agentLabel: 'Review Presence Planner',
      mode: 'beamix',
      status: 'success',
      timestamp: '2026-06-04T09:05:00.000Z',
      costUsd: 0.04,
      snippet: 'Identified 3 review request templates for post-whitening patients. Highest-impact: Google.',
    },
    {
      id: 'r10',
      agentLabel: 'Authority Blog Strategist',
      mode: 'myself',
      status: 'running',
      timestamp: '2026-06-03T17:30:00.000Z',
      costUsd: 0.00,
      snippet: 'Planning "Is teeth whitening safe for sensitive teeth?" — estimated 2 min remaining.',
    },
    {
      id: 'r11',
      agentLabel: 'Reddit Presence Planner',
      mode: 'myself',
      status: 'success',
      timestamp: '2026-06-02T12:15:00.000Z',
      costUsd: 0.02,
      snippet: '4 r/Israel and r/dentistry threads identified where positioning as local expert adds value.',
    },
    {
      id: 'r12',
      agentLabel: 'Content Optimizer',
      mode: 'beamix',
      status: 'failed',
      timestamp: '2026-06-01T14:50:00.000Z',
      costUsd: 0.00,
      snippet: 'Run timed out during Research stage — Perplexity API unavailable for 9 minutes.',
    },
  ] as RunRow[],

  traces: {
    r1: {
      runId: 'r1',
      stages: [
        { id: 'plan', label: 'Plan', status: 'done', substep: 'Analyzed whitening page, 847 words', durationMs: 1200 },
        { id: 'research', label: 'Research', status: 'done', substep: 'Pulled 3 competitor rankings on ChatGPT', durationMs: 3400 },
        { id: 'do', label: 'Do', status: 'done', substep: 'Rewrote 3 sections, 218 words added', durationMs: 8100 },
        { id: 'qa', label: 'QA', status: 'done', substep: 'Verified citations via Perplexity Sonar', durationMs: 2200 },
        { id: 'summarize', label: 'Summarize', status: 'done', substep: 'Generated inbox card for approvals', durationMs: 900 },
      ],
      outputSnippet: 'Rewrote whitening page — added Ramat Gan pricing context, 3 local competitor gaps closed.',
    } as RunTrace,
    r2: {
      runId: 'r2',
      stages: [
        { id: 'plan', label: 'Plan', status: 'done', substep: 'Detected missing DentalService schema', durationMs: 800 },
        { id: 'do', label: 'Do', status: 'done', substep: 'Generated JSON-LD with 11 required fields', durationMs: 2100 },
        { id: 'qa', label: 'QA', status: 'done', substep: 'Schema.org validation passed 94/100', durationMs: 600 },
      ],
      outputSnippet: 'Dentist schema published with 11 fields. Validity 94/100. Missing: acceptsInsurance.',
    } as RunTrace,
    r3: {
      runId: 'r3',
      stages: [
        { id: 'plan', label: 'Plan', status: 'done', substep: 'Loaded last 3 scan results for context', durationMs: 900 },
        { id: 'research', label: 'Research', status: 'done', substep: 'Queried ChatGPT, Gemini, Perplexity for 12 queries', durationMs: 5200 },
        { id: 'do', label: 'Do', status: 'done', substep: 'Clustered queries by intent, scored gaps', durationMs: 4400 },
        { id: 'qa', label: 'QA', status: 'done', substep: 'Cross-referenced with existing content', durationMs: 1800 },
        { id: 'summarize', label: 'Summarize', status: 'done', substep: 'Ranked 5 high-opportunity queries', durationMs: 700 },
      ],
      outputSnippet: '5 high-frequency queries identified where ChatGPT cites Tel Aviv competitors instead.',
    } as RunTrace,
    r4: {
      runId: 'r4',
      stages: [
        { id: 'plan', label: 'Plan', status: 'done', substep: 'Mapped FAQ topics from query clusters', durationMs: 1100 },
        { id: 'do', label: 'Do', status: 'done', substep: 'Drafted 6 FAQ items with structured answers', durationMs: 6800 },
        { id: 'qa', label: 'QA', status: 'error', substep: '3 dental advice claims unverifiable by Sonar', durationMs: 3200 },
      ],
      outputSnippet: 'Pipeline stopped at QA — content failed YMYL dental advice review (3 unverified claims).',
    } as RunTrace,
    r5: {
      runId: 'r5',
      stages: [
        { id: 'plan', label: 'Plan', status: 'done', substep: 'Detected implants page 94 days stale', durationMs: 700 },
        { id: 'research', label: 'Research', status: 'done', substep: 'Fetched 2026 implant cost data from 4 sources', durationMs: 4100 },
        { id: 'do', label: 'Do', status: 'done', substep: 'Updated pricing section and recovery timeline', durationMs: 5600 },
        { id: 'qa', label: 'QA', status: 'done', substep: 'All claims verified via Perplexity', durationMs: 2000 },
        { id: 'summarize', label: 'Summarize', status: 'done', substep: 'Sent to approvals queue', durationMs: 500 },
      ],
      outputSnippet: 'Refreshed implants page with 2026 pricing data and updated post-procedure care guidelines.',
    } as RunTrace,
    r6: {
      runId: 'r6',
      stages: [
        { id: 'plan', label: 'Plan', status: 'done', substep: 'Audited existing directory presence', durationMs: 900 },
        { id: 'research', label: 'Research', status: 'done', substep: 'Found 4 high-authority Israeli dental directories', durationMs: 3800 },
        { id: 'do', label: 'Do', status: 'done', substep: 'Submitted consistent NAP to all 4 directories', durationMs: 2200 },
        { id: 'qa', label: 'QA', status: 'done', substep: 'NAP consistency verified across submissions', durationMs: 1100 },
        { id: 'summarize', label: 'Summarize', status: 'done', substep: 'Logged 4 new citations', durationMs: 400 },
      ],
      outputSnippet: 'Submitted to 4 dental directories (Zap-Doctors, Waze Places, Google Business, Yelp IL).',
    } as RunTrace,
    r7: {
      runId: 'r7',
      stages: [
        { id: 'plan', label: 'Plan', status: 'done', substep: 'Loaded this week vs last week scan delta', durationMs: 600 },
        { id: 'do', label: 'Do', status: 'done', substep: 'Computed per-engine mention rates and rank shifts', durationMs: 1800 },
        { id: 'qa', label: 'QA', status: 'done', substep: 'Sanity-checked against raw scan results', durationMs: 900 },
      ],
      outputSnippet: 'Visibility score up 4 points week-over-week. ChatGPT mentions increased from 31 → 38%.',
    } as RunTrace,
    r8: {
      runId: 'r8',
      stages: [
        { id: 'plan', label: 'Plan', status: 'done', substep: 'Analyzed co-citation patterns across 3 engines', durationMs: 1400 },
        { id: 'research', label: 'Research', status: 'done', substep: 'Mapped entity relationships in dental taxonomy', durationMs: 4900 },
        { id: 'do', label: 'Do', status: 'done', substep: 'Added 6 co-citation anchors to entity graph', durationMs: 3300 },
        { id: 'qa', label: 'QA', status: 'done', substep: 'Entity consistency validated', durationMs: 1700 },
        { id: 'summarize', label: 'Summarize', status: 'done', substep: 'Updated entity knowledge file', durationMs: 600 },
      ],
      outputSnippet: 'Entity graph enriched: 6 co-citation anchors added, dentist → endodontist relationship mapped.',
    } as RunTrace,
    r9: {
      runId: 'r9',
      stages: [
        { id: 'plan', label: 'Plan', status: 'done', substep: 'Identified post-treatment patient touchpoints', durationMs: 800 },
        { id: 'research', label: 'Research', status: 'done', substep: 'Analyzed review volume on Google, Zap-Doctors', durationMs: 3600 },
        { id: 'do', label: 'Do', status: 'done', substep: 'Drafted 3 segmented review request templates', durationMs: 4200 },
        { id: 'qa', label: 'QA', status: 'done', substep: 'Reviewed for YMYL compliance', durationMs: 1300 },
        { id: 'summarize', label: 'Summarize', status: 'done', substep: 'Ranked templates by conversion estimate', durationMs: 500 },
      ],
      outputSnippet: 'Identified 3 review request templates for post-whitening patients. Highest-impact: Google.',
    } as RunTrace,
    r10: {
      runId: 'r10',
      stages: [
        { id: 'plan', label: 'Plan', status: 'done', substep: 'Outlined article structure and key claims', durationMs: 2100 },
        { id: 'research', label: 'Research', status: 'done', substep: 'Searched PubMed + dental blogs for citations', durationMs: 7800 },
        { id: 'do', label: 'Do', status: 'error', substep: 'Drafting in progress — 1,240 words so far', durationMs: 0 },
        { id: 'qa', label: 'QA', status: 'error', substep: '', durationMs: 0 },
        { id: 'summarize', label: 'Summarize', status: 'error', substep: '', durationMs: 0 },
      ],
      outputSnippet: 'Planning "Is teeth whitening safe for sensitive teeth?" — estimated 2 min remaining.',
    } as RunTrace,
    r11: {
      runId: 'r11',
      stages: [
        { id: 'plan', label: 'Plan', status: 'done', substep: 'Identified 8 subreddits with dental discussion', durationMs: 900 },
        { id: 'research', label: 'Research', status: 'done', substep: 'Scanned 34 threads for positioning opportunities', durationMs: 4400 },
        { id: 'do', label: 'Do', status: 'done', substep: 'Drafted 4 expert reply templates', durationMs: 3100 },
        { id: 'qa', label: 'QA', status: 'done', substep: 'Verified non-promotional tone', durationMs: 1200 },
        { id: 'summarize', label: 'Summarize', status: 'done', substep: 'Delivered thread list with reply drafts', durationMs: 400 },
      ],
      outputSnippet: '4 r/Israel and r/dentistry threads identified where positioning as local expert adds value.',
    } as RunTrace,
    r12: {
      runId: 'r12',
      stages: [
        { id: 'plan', label: 'Plan', status: 'done', substep: 'Selected orthodontics page for optimization', durationMs: 1100 },
        { id: 'research', label: 'Research', status: 'error', substep: 'Perplexity API timeout after 9 min', durationMs: 540000 },
        { id: 'do', label: 'Do', status: 'error', substep: '', durationMs: 0 },
        { id: 'qa', label: 'QA', status: 'error', substep: '', durationMs: 0 },
        { id: 'summarize', label: 'Summarize', status: 'error', substep: '', durationMs: 0 },
      ],
      outputSnippet: 'Run timed out during Research stage — Perplexity API unavailable for 9 minutes.',
    } as RunTrace,
  },
}
