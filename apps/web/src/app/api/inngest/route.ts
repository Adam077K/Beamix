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
 *
 * Wave 1 functions:
 *   - agentExecute           — agent/run.requested
 *   - foundingHundredMetrics — founding-100 cohort tracking
 *   - onDiscoveryCompleted   — discovery/completed (sends welcome email)
 *
 * Wave 2 additions:
 *   - digestBuilder          — cron: Sunday 16:00 UTC (W2.2 weekly digest)
 *   - revenueBookingSweep    — cron: day-61 held→booked revenue flip (W2.3 held-revenue)
 */

import { serve } from 'inngest/next';
import { inngest } from '../../../inngest/client';
import { agentExecute } from '../../../inngest/functions/agent-execute';
import { foundingHundredMetrics } from '../../../inngest/functions/founding-100-metrics';
import { onDiscoveryCompleted } from '../../../lib/email/send-welcome';
import { digestBuilder } from '../../../inngest/functions/digest-builder';
import { revenueBookingSweep } from '../../../inngest/functions/revenue-booking-sweep';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    agentExecute,
    foundingHundredMetrics,
    onDiscoveryCompleted,
    digestBuilder,
    revenueBookingSweep,
  ],
});
