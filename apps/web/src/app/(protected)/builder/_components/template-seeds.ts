/**
 * template-seeds — per-template workflow shapes for the design-only Builder.
 *
 * Each template id maps to a distinct Workflow so selecting a non-hero template
 * produces a graph that matches the template's description and node count.
 *
 * The hero template ('tpl-content-refresh', 'Most used') keeps the existing
 * fixture graph from DEMO_BUILDER.workflow — this module only defines alternates.
 *
 * DO NOT import from this file in the shared fixture types; it lives entirely
 * within the builder _components scope.
 */

import type { Workflow } from '@/lib/demo/surfaces'

/** Competitive Research — 4 nodes: scan → map → diff → summarize */
const competitiveResearch: Workflow = {
  name: 'Competitive Research',
  nodes: [
    {
      id: 'cr1',
      type: 'research',
      label: 'Research: scan competitor pages',
      config: {
        domains: 'top_4_competitors',
        depth: 2,
        includeStructuredData: true,
      },
    },
    {
      id: 'cr2',
      type: 'do',
      label: 'Do: map citation patterns',
      config: {
        model: 'claude-sonnet-4-6',
        outputFormat: 'citation_matrix',
      },
    },
    {
      id: 'cr3',
      type: 'qa',
      label: 'QA: diff against your pages',
      config: {
        compareTarget: 'your_pages',
        flagGaps: true,
      },
    },
    {
      id: 'cr4',
      type: 'summarize',
      label: 'Summarise: competitive gap report',
      config: {
        format: 'markdown',
        maxPages: 2,
      },
    },
  ],
  edges: [
    { from: 'cr1', to: 'cr2' },
    { from: 'cr2', to: 'cr3' },
    { from: 'cr3', to: 'cr4' },
  ],
}

/** Net-New Content — 7 nodes: find gap → brief → draft → schema → qa → review → publish */
const netNewContent: Workflow = {
  name: 'Net-New Content',
  nodes: [
    {
      id: 'nc1',
      type: 'plan',
      label: 'Plan: identify uncited prompt gap',
      config: {
        minVolume: 800,
        maxCompetitors: 0,
        intent: 'informational',
      },
    },
    {
      id: 'nc2',
      type: 'research',
      label: 'Research: audience intent + angle',
      config: {
        sources: 'tracked_prompts + serp',
        depth: 1,
      },
    },
    {
      id: 'nc3',
      type: 'do',
      label: 'Do: draft page copy',
      config: {
        model: 'claude-opus-4-8',
        wordCount: 900,
        tone: 'authoritative',
      },
    },
    {
      id: 'nc4',
      type: 'do',
      label: 'Do: inject FAQ schema',
      config: {
        schemaType: 'FAQPage',
        questionsPerPage: 5,
      },
    },
    {
      id: 'nc5',
      type: 'do',
      label: 'Do: write meta + title',
      config: {
        includeOpenGraph: true,
      },
    },
    {
      id: 'nc6',
      type: 'qa',
      label: 'QA: accuracy + readability check',
      config: {
        accuracyThreshold: 0.95,
        readingLevel: 'grade_8',
      },
    },
    {
      id: 'nc7',
      type: 'summarize',
      label: 'Summarise: content brief for approval',
      config: {
        format: 'markdown',
        includeBeforeAfter: false,
      },
    },
  ],
  edges: [
    { from: 'nc1', to: 'nc2' },
    { from: 'nc2', to: 'nc3' },
    { from: 'nc3', to: 'nc4' },
    { from: 'nc4', to: 'nc5' },
    { from: 'nc5', to: 'nc6' },
    { from: 'nc6', to: 'nc7' },
  ],
}

/** FAQ Generation — 5 nodes: fetch prompts → group → draft → schema → QA */
const faqGeneration: Workflow = {
  name: 'FAQ Generation',
  nodes: [
    {
      id: 'fq1',
      type: 'research',
      label: 'Research: fetch top unanswered prompts',
      config: {
        promptSource: 'tracked',
        limit: 25,
        intent: 'informational',
      },
    },
    {
      id: 'fq2',
      type: 'plan',
      label: 'Plan: group by target page',
      config: {
        strategy: 'cluster_by_topic',
        minClusterSize: 3,
      },
    },
    {
      id: 'fq3',
      type: 'do',
      label: 'Do: draft Q&A pairs',
      config: {
        model: 'claude-sonnet-4-6',
        answersPerQuestion: 1,
        maxWords: 80,
      },
    },
    {
      id: 'fq4',
      type: 'do',
      label: 'Do: generate FAQPage schema',
      config: {
        schemaType: 'FAQPage',
        validate: true,
      },
    },
    {
      id: 'fq5',
      type: 'qa',
      label: 'QA: factual accuracy check',
      config: {
        accuracyThreshold: 0.92,
        requireHumanApproval: true,
      },
    },
  ],
  edges: [
    { from: 'fq1', to: 'fq2' },
    { from: 'fq2', to: 'fq3' },
    { from: 'fq3', to: 'fq4' },
    { from: 'fq4', to: 'fq5' },
  ],
}

/**
 * Lookup map from template id → distinct Workflow.
 * Falls back to `null` for any id not explicitly listed here — the caller
 * should use DEMO_BUILDER.workflow as the default in that case.
 */
export const TEMPLATE_WORKFLOWS: Record<string, Workflow> = {
  'tpl-competitive-research': competitiveResearch,
  'tpl-net-new-content': netNewContent,
  'tpl-faq-generation': faqGeneration,
}
