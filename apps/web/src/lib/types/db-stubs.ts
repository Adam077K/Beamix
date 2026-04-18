/**
 * db-stubs.ts — Temporary types for tables/RPCs not yet in database.types.ts.
 *
 * TODO(worker-1): Generate real types via `supabase gen types typescript` once
 * the rethink migration (page_locks, topic_ledger, daily_cap_usage, AgentType v2
 * enum values, page_locks / topic_ledger / daily_cap_usage RPCs) is applied.
 *
 * When the real types land:
 *   1. Delete this file.
 *   2. Replace imports of '@/lib/types/db-stubs' with imports from
 *      '@/lib/types/database.types'.
 */

import type { AgentType } from '@/lib/agents/types';

/** Row shape for page_locks table. */
export interface PageLockRow {
  url: string;
  job_id: string;
  agent_type: AgentType;
  locked_at: string;
  expires_at: string;
}

/** Row shape for topic_ledger table. */
export interface TopicLedgerRow {
  business_id: string;
  topic: string;
  topic_normalized: string;
  agent_type: AgentType;
  job_id: string;
  content_item_id: string | null;
  created_at: string;
}

/** Row shape for daily_cap_usage table. */
export interface DailyCapUsageRow {
  user_id: string;
  agent_type: AgentType;
  usage_date: string; // YYYY-MM-DD (UTC)
  count: number;
}

/** Stub for acquire_page_lock RPC. */
export interface AcquirePageLockArgs {
  p_url: string;
  p_job_id: string;
  p_agent_type: AgentType;
  p_ttl_minutes?: number;
}

/** Stub for release_page_lock RPC. */
export interface ReleasePageLockArgs {
  p_url: string;
  p_job_id: string;
}

/** Stub for check_topic_duplicate RPC. */
export interface CheckTopicDuplicateArgs {
  p_business_id: string;
  p_topic: string;
}

/** Stub for register_topic RPC. */
export interface RegisterTopicArgs {
  p_business_id: string;
  p_topic: string;
  p_agent_type: AgentType;
  p_job_id: string;
  p_content_item_id?: string | null;
}
