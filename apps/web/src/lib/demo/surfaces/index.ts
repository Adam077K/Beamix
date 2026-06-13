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
} from './types'
export { DEMO_BUSINESS } from './types'
