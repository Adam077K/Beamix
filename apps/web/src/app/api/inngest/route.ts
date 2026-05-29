/**
 * Beamix — Inngest Serve Route
 *
 * Standard Inngest v3 Next.js App Router integration. All Inngest functions must be
 * registered here. Inngest calls this endpoint to discover functions, trigger runs,
 * and deliver step results.
 *
 * Add new functions to the `functions` array as they are created.
 *
 * Per https://www.inngest.com/docs/sdk/serve — Next.js App Router pattern.
 */

import { serve } from 'inngest/next';
import { inngest } from '../../../inngest/client';
import { agentExecute } from '../../../inngest/functions/agent-execute';
import { foundingHundredMetrics } from '../../../inngest/functions/founding-100-metrics';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    agentExecute,
    foundingHundredMetrics,
  ],
});
