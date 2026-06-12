/**
 * Console Surface Fixtures — Barrel Export
 *
 * FROZEN: surface workers MUST NOT edit this file.
 * Add data to the individual fixture files; this barrel is the integration seam.
 *
 * Surface workers own ONLY:
 *   their route dir (apps/web/src/app/(protected)/<surface>/)
 *   their fixture file (apps/web/src/lib/demo/surfaces/<surface>.ts)
 *
 * DO NOT TOUCH: sidebar.tsx, console/*, globals.css, surfaces/index.ts,
 * surfaces/types.ts, other surfaces' fixture files, any shipped component.
 */

export { DEMO_PROMPTS } from './prompts'
export { DEMO_CONTENT } from './content'
export { DEMO_SCHEMA } from './schema'
export { DEMO_RUNS } from './archive'
export { DEMO_COMPETITORS } from './competitors'
export { DEMO_AUTOMATION } from './automation'
export { DEMO_OFFSITE } from './offsite'
export { DEMO_BLOG } from './blog-studio'
export { DEMO_ANALYTICS } from './analytics'
export { DEMO_SENTIMENT } from './sentiment'
// Batch 2-5 fixture exports
export { DEMO_TRAFFIC } from './traffic'
export { DEMO_MARKET } from './market'
export { DEMO_ASK } from './ask'
export { DEMO_BUILDER } from './builder'
export { DEMO_REPORTS } from './reports'
export { DEMO_TEAM } from './team'
export { DEMO_AGENCY } from './agency'
export { DEMO_SHOPPING } from './shopping'

// Shared types — re-exported for surface worker convenience
export type {
  PromptRow,
  PromptDrawerData,
  ContentDoc,
  ContentDiff,
  SchemaResult,
  RunRow,
  RunTrace,
  CompetitorRow,
  ShareOfVoicePoint,
  AutomationRow,
  OffsiteRow,
  BlogDraft,
  // Analytics surface
  EngineVisibilityPoint,
  SovTrendPoint,
  AvgPositionStat,
  TopicRankCell,
  AnalyticsDrillData,
  DemoAnalytics,
  // Sentiment surface
  VerbatimQuote,
  SentimentSplit,
  SentimentTheme,
  ClaimAccuracyRow,
  RecoveryEvent,
  DemoSentiment,
  // Traffic surface
  CrawlerBotPoint,
  CrawlerTrend,
  ReferralAttribution,
  ContentPerformance,
  TrafficDrillRow,
  DemoTraffic,
  // Market surface
  MarketPromptRow,
  TrendingPrompt,
  AgeBand,
  IncomeBand,
  MarketDemographics,
  MarketPromptDrill,
  DemoMarket,
  // Ask surface
  AskCitation,
  AskMessage,
  GroundingStep,
  DemoAsk,
  // Builder surface
  WorkflowTemplate,
  WorkflowNode,
  WorkflowEdge,
  Workflow,
  DryRunStep,
  SavedWorkflow,
  DemoBuilder,
  // Reports surface
  ReportBlock,
  SavedReport,
  ActiveReport,
  ReportConnector,
  DemoReports,
  // Team surface
  TeamMember,
  PendingInvite,
  SeatUsage,
  DemoTeam,
  // Agency surface
  AuditFinding,
  ProspectAudit,
  AgencyDryRunStep,
  AgencyClient,
  WhiteLabelConfig,
  AgencyLead,
  DemoAgency,
  // Shopping surface
  AttributeCheck,
  AttributeMatrix,
  SkuSentiment,
  ShoppingSku,
  ShoppingDrillRow,
  DemoShopping,
} from './types'
export { DEMO_BUSINESS } from './types'
