/**
 * Beamix — Inngest Client
 *
 * Single Inngest instance for the product app. Do NOT construct a second `Inngest`
 * anywhere — every function and every event send routes through this client.
 *
 * The agent system's only event is `agent/run.requested`, fired by `/api/agents/run`
 * after a job row is created and (for paid agents) credits are held.
 */

import { Inngest, EventSchemas } from 'inngest';
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

/** Payload for `discovery.booked` — fired by the Cal.com webhook handler. */
export interface DiscoveryBookedData {
  email: string;
  scan_id: string | null;
  booked_at: string;
  cal_booking_id: string;
}

/** Payload for `discovery/completed` — fired when the discovery agent session finishes
 *  and the brand_fingerprint is emitted. Consumed by the welcome-email handler. */
export interface DiscoveryCompletedData {
  userId: string;
  userEmail: string;
  firstName: string;
  businessId: string;
  scanId: string;
}

/** Payload for `scan/free.requested` — fired by POST /api/scan/free after inserting
 *  the free_scan row. Consumed by the free-scan Inngest worker. */
export interface ScanFreeRequestedData {
  scan_id: string;
  business_name: string;
  website_url: string;
  email: string;
  domain: string;
  ip: string;
}

/** Payload for `approval.created` — fired when a new approval_queue row is inserted. */
export interface ApprovalCreatedData {
  approvalId: string;
  kind: string;
  customerId: string;
  createdAt: string;
}

/** Payload for `approval.approved` — fired by approveApprovalItem Server Action. */
export interface ApprovalApprovedData {
  approvalId: string;
  kind: string;
  customerId: string;
  actedAt: string;
}

/** Payload for `approval.rejected` — fired by rejectApprovalItem Server Action. */
export interface ApprovalRejectedData {
  approvalId: string;
  kind: string;
  customerId: string;
  actedAt: string;
}

/** Typed event map for the Beamix Inngest client. */
export type BeamixEvents = {
  'agent/run.requested': { data: AgentRunRequestedData };
  'discovery.booked': { data: DiscoveryBookedData };
  'discovery/completed': { data: DiscoveryCompletedData };
  'scan/free.requested': { data: ScanFreeRequestedData };
  'approval.created': { data: ApprovalCreatedData };
  'approval.approved': { data: ApprovalApprovedData };
  'approval.rejected': { data: ApprovalRejectedData };
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
  schemas: new EventSchemas().fromRecord<BeamixEvents>(),
});
