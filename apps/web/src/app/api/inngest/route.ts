/**
<<<<<<< HEAD
 * route.ts — Inngest HTTP serve handler.
 *
 * Registers all Beamix Inngest functions and exposes the
 * GET / POST / PUT endpoints that the Inngest platform uses
 * to invoke and inspect functions.
 */

import { serve } from 'inngest/next'
import { inngest } from '@/inngest/client'
import { scanRun } from '@/inngest/functions'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [scanRun],
})
=======
 * /api/inngest — Inngest serve endpoint.
 *
 * Registers all Beamix Inngest functions with the Inngest platform.
 * This route handles all Inngest lifecycle requests (step execution, etc.).
 */

import { serve } from 'inngest/next';
import { inngest } from '@/inngest/client';
import { agentPipeline } from '@/inngest/functions';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [agentPipeline],
});
>>>>>>> feat/m-agents-api
