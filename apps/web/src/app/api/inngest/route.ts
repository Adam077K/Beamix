/**
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
