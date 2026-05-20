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

export const inngest = new Inngest({
  id: 'beamix',
  eventKey: process.env.INNGEST_EVENT_KEY ?? '',
  schemas: {} as unknown as EventSchemas<BeamixEvents>,
});
