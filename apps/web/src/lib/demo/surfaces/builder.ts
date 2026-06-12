import type {
  DemoBuilder,
  WorkflowTemplate,
  WorkflowNode,
  WorkflowEdge,
  Workflow,
  DryRunStep,
  SavedWorkflow,
} from './types'

/**
 * DEMO_BUILDER — Workflow / Agent Builder fixture
 * Business: Bright Smile Dental, Ramat Gan
 *
 * Story arc: the clinic owner has saved a monthly FAQ refresh workflow,
 * a competitor research workflow, and a net-new content workflow.
 * The sample workflow shown is the Monthly FAQ Refresh — 5 nodes, dry-run preview,
 * est. $0.09 per run.
 */

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

const templates: WorkflowTemplate[] = [
  {
    id: 'tpl-content-refresh',
    name: 'Content Refresh',
    description:
      'Audits existing pages for AI citation gaps, rewrites weak sections, and re-submits for indexing.',
    nodeCount: 6,
  },
  {
    id: 'tpl-faq-generation',
    name: 'FAQ Generation',
    description:
      'Generates structured FAQ schema from top unanswered prompts and injects it into target pages.',
    nodeCount: 5,
  },
  {
    id: 'tpl-competitive-research',
    name: 'Competitive Research',
    description:
      'Scans competitor pages for citation patterns, pricing evidence, and structural advantages.',
    nodeCount: 4,
  },
  {
    id: 'tpl-net-new-content',
    name: 'Net-New Content',
    description:
      'Drafts a new page targeting a high-volume uncited prompt, including schema and meta.',
    nodeCount: 7,
  },
]

// ---------------------------------------------------------------------------
// Sample workflow — Monthly FAQ Refresh
// ---------------------------------------------------------------------------

const workflowNodes: WorkflowNode[] = [
  {
    id: 'n1',
    type: 'plan',
    label: 'Plan: select target pages',
    config: {
      strategy: 'lowest_visibility',
      maxPages: 5,
      minVolume: 1000,
    },
  },
  {
    id: 'n2',
    type: 'research',
    label: 'Research: fetch top unanswered prompts',
    config: {
      promptSource: 'tracked',
      limit: 20,
      intent: 'informational',
    },
  },
  {
    id: 'n3',
    type: 'do',
    label: 'Do: generate FAQ schema blocks',
    config: {
      model: 'claude-sonnet-4-6',
      schemaType: 'FAQPage',
      questionsPerPage: 6,
    },
  },
  {
    id: 'n4',
    type: 'qa',
    label: 'QA: validate schema + accuracy check',
    config: {
      accuracyThreshold: 0.92,
      requireHumanApproval: false,
    },
  },
  {
    id: 'n5',
    type: 'summarize',
    label: 'Summarise: create digest for approval queue',
    config: {
      format: 'markdown',
      includeBeforeAfter: true,
    },
  },
]

const workflowEdges: WorkflowEdge[] = [
  { from: 'n1', to: 'n2' },
  { from: 'n2', to: 'n3' },
  { from: 'n3', to: 'n4' },
  { from: 'n4', to: 'n5' },
]

const workflow: Workflow = {
  name: 'Monthly FAQ Refresh',
  nodes: workflowNodes,
  edges: workflowEdges,
}

// ---------------------------------------------------------------------------
// Dry-run preview
// ---------------------------------------------------------------------------

const dryRunSteps: DryRunStep[] = [
  {
    label: 'Plan: select target pages',
    status: 'done',
    figure: '5 pages queued',
  },
  {
    label: 'Research: fetch unanswered prompts',
    status: 'done',
    figure: '18 prompts matched',
  },
  {
    label: 'Do: generate FAQ schema blocks',
    status: 'done',
    figure: '30 FAQ pairs generated',
  },
  {
    label: 'QA: validate schema',
    status: 'done',
    figure: '28 / 30 passed',
  },
  {
    label: 'Summarise: create digest',
    status: 'pending',
    figure: '—',
  },
]

// ---------------------------------------------------------------------------
// Saved workflows
// ---------------------------------------------------------------------------

const savedWorkflows: SavedWorkflow[] = [
  {
    name: 'Monthly FAQ Refresh',
    lastRun: '2026-06-02T09:14:00Z',
    schedule: 'Monthly · 1st Monday 9am',
  },
  {
    name: 'Weekly Competitor Research',
    lastRun: '2026-06-09T08:00:00Z',
    schedule: 'Weekly · Mondays 8am',
  },
  {
    name: 'Net-New Content — Whitening',
    lastRun: '2026-05-26T11:30:00Z',
    schedule: null,
  },
  {
    name: 'Emergency Page Content Refresh',
    lastRun: '2026-05-12T14:00:00Z',
    schedule: null,
  },
]

// ---------------------------------------------------------------------------
// Top-level export
// ---------------------------------------------------------------------------

export const DEMO_BUILDER: DemoBuilder = {
  templates,
  workflow,
  dryRun: {
    steps: dryRunSteps,
    estCost: '$0.09',
  },
  savedWorkflows,
}
