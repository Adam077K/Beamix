/**
 * Beamix — Inngest Client
 *
 * Single Inngest instance for the product app. Do NOT construct a second `Inngest`
 * anywhere — every function and every event send routes through this client.
 *
 * The agent system's only event is `agent/run.requested`, fired by `/api/agents/run`
 * after a job row is created and (for paid agents) credits are held.
 */

import { Inngest, type EventSchemas } from 'inngest';
import type { AgentType, PlanTier } from '../lib/agents/types';

/** Payload for `agent/run.requested` — mirrors `AgentJobInput`. */
export interface AgentRunRequestedData {
  jobId: string;
  agentType: AgentType;
  userId: string;
  businessId: string;
  planTier: PlanTier;
  targetUrl?: string;
  targetContent?: string;
  queryCluster?: string[];
  customInstructions?: string;
  scanId?: string;
}

/** Typed event map for the Beamix Inngest client. */
export type BeamixEvents = {
  'agent/run.requested': { data: AgentRunRequestedData };
};

/**
 * Resolve the Inngest event key. In production a missing key is a hard configuration
 * error — silently sending with an empty key drops every event. In dev the Inngest
 * dev server does not require a key, so an empty string is allowed there.
 */
function resolveEventKey(): string {
  const key = process.env.INNGEST_EVENT_KEY;
  if (!key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Missing required environment variable: INNGEST_EVENT_KEY');
    }
    return '';
  }
  return key;
}

export const inngest = new Inngest({
  id: 'beamix',
  eventKey: resolveEventKey(),
  schemas: {} as unknown as EventSchemas<BeamixEvents>,
});
