/**
 * Beamix Agent System — Topic Ledger
 *
 * Prevents Authority Blog Strategist and FAQ Builder from generating duplicate topic
 * coverage for the same business. Backed by the `topic_ledger` DB table (Worker 1).
 * Retention is 365 days (a daily Inngest sweep prunes older rows). The pipeline
 * registers a topic only after a successful job, and checks coverage before the DO step.
 */

import { getAdminClient } from '../db/admin-client';
import type { AgentType } from '../types';

/**
 * Normalize a topic string into a stable comparison key — lowercase, collapse
 * whitespace, strip punctuation. Two phrasings of the same topic collide on this key.
 */
export function topicKey(topic: string): string {
  return topic
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Register a topic as covered after a successful agent job. Idempotent — a repeated
 * registration of the same `(business_id, topic_key)` is silently ignored.
 *
 * @param businessId Owning business.
 * @param topic      Human-readable topic; normalized internally to a `topic_key`.
 * @param agentType  Agent that produced the coverage.
 * @param jobId      `agent_jobs.id` that produced the coverage.
 */
export async function registerTopic(
  businessId: string,
  topic: string,
  agentType: AgentType,
  jobId: string,
): Promise<void> {
  const { error } = await getAdminClient()
    .from('topic_ledger')
    .upsert(
      {
        business_id: businessId,
        topic_key: topicKey(topic),
        agent_type: agentType,
        job_id: jobId,
      },
      { onConflict: 'business_id,topic_key', ignoreDuplicates: true },
    );

  if (error) {
    throw new Error(`registerTopic failed for business ${businessId}: ${error.message}`);
  }
}

/**
 * Check whether a topic is already covered for a business. Call before the DO step of
 * topic-producing agents so the DO prompt can steer away from duplicate coverage.
 */
export async function isTopicCovered(businessId: string, topic: string): Promise<boolean> {
  const { data, error } = await getAdminClient()
    .from('topic_ledger')
    .select('id')
    .eq('business_id', businessId)
    .eq('topic_key', topicKey(topic))
    .maybeSingle();

  if (error) {
    throw new Error(`isTopicCovered failed for business ${businessId}: ${error.message}`);
  }
  return data !== null;
}

/**
 * List every covered topic key for a business. Injected into the PLAN-step context of
 * topic-producing agents so the model knows what ground is already taken.
 */
export async function getCoveredTopics(businessId: string): Promise<string[]> {
  const { data, error } = await getAdminClient()
    .from('topic_ledger')
    .select('topic_key')
    .eq('business_id', businessId);

  if (error) {
    throw new Error(`getCoveredTopics failed for business ${businessId}: ${error.message}`);
  }
  return (data ?? []).map((row) => row.topic_key);
}
