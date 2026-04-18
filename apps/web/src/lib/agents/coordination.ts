/**
 * coordination.ts — Page locks + topic-ledger duplicate check.
 *
 * Page locks prevent two agents from rewriting the same URL at the same time.
 * Topic ledger prevents duplicate content creation for the same topic cluster.
 */

import type { AgentType } from './types';
import { createClient } from '@/lib/supabase/server';

/**
 * Attempt to acquire an exclusive page lock for the given URL.
 * Returns true if the lock was acquired, false if the page is already locked.
 */
export async function acquirePageLock(
  url: string,
  agentType: AgentType,
  jobId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('acquire_page_lock', {
    p_url: url,
    p_agent_type: agentType,
    p_job_id: jobId,
  });
  if (error) return false;
  return Boolean(data);
}

/**
 * Release a previously acquired page lock.
 */
export async function releasePageLock(url: string): Promise<void> {
  const supabase = await createClient();
  await supabase.rpc('release_page_lock', { p_url: url });
}

/**
 * Check whether a topic (by hash) has already been covered for this business.
 * Returns true if a duplicate exists.
 */
export async function checkTopicDuplicate(
  businessId: string,
  topicHash: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.rpc('check_topic_duplicate', {
    p_business_id: businessId,
    p_topic_hash: topicHash,
  });
  return Boolean(data);
}
