/**
 * functions/index.ts — Barrel export for all Inngest functions.
 *
 * Import this barrel in the /api/inngest route handler so all functions
 * are registered with the Inngest serve() call.
 */

export { agentPipeline } from './agent-pipeline';
