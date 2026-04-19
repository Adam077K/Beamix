/**
 * agent-pipeline.ts — Inngest function for agent.run.requested events.
 *
 * Handles the full queued job lifecycle:
 *   1. Load job + business context from DB
 *   2. Build AgentPipelineContext
 *   3. Call runPipeline(ctx)
 *   4. Update agent_jobs status + insert notification
 */

import { inngest } from '../client';
import { createServiceClient } from '@/lib/supabase/service';
import { runPipeline } from '@/lib/agents/pipeline';
import { AGENT_REGISTRY } from '@/lib/agents/config';
import { insertNotification } from '@/lib/notifications/insert';
import type {
  AgentPipelineContext,
  AgentJobInput,
  BusinessContext,
  UserContext,
  BudgetContext,
  PlanTier,
  AgentType,
  PageLocks,
  TopicLedger,
  DailyCapGuardApi,
} from '@/lib/agents/types';
import { checkDailyCap, incrementDailyCap } from '@/lib/agents/daily-cap';

// ─── Plan → monthly price mapping ────────────────────────────────────────────

const PLAN_PRICE_USD: Record<PlanTier, number> = {
  discover: 79,
  build: 189,
  scale: 499,
};

// ─── Adapter implementations for context interfaces ───────────────────────────
// These are thin adapters that route to the real implementations. They are
// constructed per-job so the supabase client is fresh for each run.

function buildPageLocks(): PageLocks {
  return {
    async acquire(url, jobId, agentType) {
      const supabase = createServiceClient() as any;
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      const { error } = await supabase.from('page_locks').insert({
        url,
        job_id: jobId,
        agent_type: agentType,
        expires_at: expiresAt,
      });
      return !error;
    },
    async release(url) {
      const supabase = createServiceClient() as any;
      await supabase.from('page_locks').delete().eq('url', url);
    },
    async isLocked(url) {
      const supabase = createServiceClient() as any;
      const { data } = await supabase
        .from('page_locks')
        .select('url')
        .eq('url', url)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();
      return !!data;
    },
  };
}

function buildTopicLedger(): TopicLedger {
  return {
    async check(businessId, topic) {
      const supabase = createServiceClient() as any;
      const { data } = await supabase
        .from('topic_ledger')
        .select('id')
        .eq('business_id', businessId)
        .eq('topic', topic)
        .maybeSingle();
      return !!data;
    },
    async register(businessId, topic, agentType, jobId, contentItemId) {
      const supabase = createServiceClient() as any;
      await supabase.from('topic_ledger').insert({
        business_id: businessId,
        topic,
        agent_type: agentType,
        job_id: jobId,
        content_item_id: contentItemId ?? null,
      });
    },
    async list(businessId) {
      const supabase = createServiceClient() as any;
      const { data } = await supabase
        .from('topic_ledger')
        .select('topic')
        .eq('business_id', businessId);
      return (data ?? []).map((row: { topic: string }) => row.topic);
    },
  };
}

function buildDailyCapGuard(): DailyCapGuardApi {
  return {
    async check(userId, agentType, tier) {
      return checkDailyCap(userId, agentType, tier);
    },
    async increment(userId, agentType) {
      return incrementDailyCap(userId, agentType);
    },
  };
}

// ─── Inngest function ─────────────────────────────────────────────────────────

export const agentPipeline = inngest.createFunction(
  { id: 'agent-pipeline', retries: 3 },
  { event: 'agent.run.requested' },
  async ({ event, step }) => {
    const { jobId, userId, businessId, agentType, planTier, targetUrl, customInstructions } =
      event.data;

    const result = await step.run('execute-pipeline', async () => {
      const supabase = createServiceClient() as any;

      // 1. Load job record to confirm it exists and is still queued
      const { data: job, error: jobError } = await supabase
        .from('agent_jobs')
        .select('id, status, agent_type, user_id, business_id')
        .eq('id', jobId)
        .maybeSingle();

      if (jobError || !job) {
        throw new Error(`[agent-pipeline] Job not found: ${jobId}`);
      }

      // Mark job as running
      await supabase
        .from('agent_jobs')
        .update({ status: 'running', started_at: new Date().toISOString() })
        .eq('id', jobId);

      // 2. Load business context
      const { data: biz } = await supabase
        .from('businesses')
        .select('id, name, industry, location, services, scan_url, language')
        .eq('id', businessId)
        .maybeSingle();

      // 3. Load subscription / plan tier
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('plan_tier')
        .eq('user_id', userId)
        .maybeSingle();

      const resolvedTier = (sub?.plan_tier ?? planTier ?? 'discover') as PlanTier;

      // 4. Load user profile for email
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('email, first_name')
        .eq('id', userId)
        .maybeSingle();

      const userEmail: string = profile?.email ?? '';

      // 5. Load current credit spend for budget context
      const { data: pool } = await supabase
        .from('credit_pools')
        .select('used_amount, base_allocation, rollover_amount, topup_amount')
        .eq('user_id', userId)
        .maybeSingle();

      const monthlyPriceUsd = PLAN_PRICE_USD[resolvedTier];
      const allowedMaxCostUsd = monthlyPriceUsd * 0.15;
      const spentSoFarUsd = (pool?.used_amount ?? 0) * 0.05; // rough $/credit estimate

      // 6. Build typed context
      const agentConfig = AGENT_REGISTRY[agentType as AgentType];
      if (!agentConfig) {
        throw new Error(`[agent-pipeline] Unknown agent type: ${agentType}`);
      }

      const businessCtx: BusinessContext = {
        businessId,
        name: biz?.name ?? 'Unknown Business',
        industry: biz?.industry ?? 'general',
        location: biz?.location ?? '',
        services: Array.isArray(biz?.services) ? biz.services : [],
        scanUrl: biz?.scan_url ?? '',
        ymylCategory: false,
        language: (biz?.language ?? 'en') as 'he' | 'en',
      };

      const userCtx: UserContext = {
        userId,
        email: userEmail,
      };

      const budgetCtx: BudgetContext = {
        monthlyPriceUsd,
        allowedMaxCostUsd,
        spentSoFarUsd,
      };

      const input: AgentJobInput = {
        jobId,
        agentType: agentType as AgentType,
        userId,
        businessId,
        planTier: resolvedTier,
        targetUrl,
        customInstructions,
      };

      const ctx: AgentPipelineContext = {
        input,
        config: agentConfig,
        user: userCtx,
        business: businessCtx,
        plan: resolvedTier,
        budget: budgetCtx,
        locks: {
          pageLocks: buildPageLocks(),
          topicLedger: buildTopicLedger(),
          dailyCapGuard: buildDailyCapGuard(),
        },
      };

      // 7. Run the pipeline
      let pipelineOutput;
      try {
        pipelineOutput = await runPipeline(ctx);
      } catch (err) {
        // Pipeline threw — mark as failed
        await supabase
          .from('agent_jobs')
          .update({ status: 'failed', completed_at: new Date().toISOString() })
          .eq('id', jobId);

        await insertNotification({
          userId,
          type: 'item_ready',
          title: 'Agent run failed',
          body: `The ${agentConfig.displayName} agent encountered an error and could not complete.`,
          actionUrl: '/dashboard',
          payload: { jobId, agentType, error: String(err) },
        });

        throw err; // re-throw so Inngest retries
      }

      // 8. Persist output to content_items / inbox
      const { data: contentItem } = await supabase
        .from('content_items')
        .insert({
          user_id: userId,
          business_id: businessId,
          agent_type: agentType,
          job_id: jobId,
          content: pipelineOutput.primaryContent,
          content_format: pipelineOutput.contentFormat,
          summary: pipelineOutput.summaryText,
          status: 'pending_review',
          geo_signals: pipelineOutput.geoSignals,
          estimated_impact: pipelineOutput.estimatedImpact,
        })
        .select('id')
        .maybeSingle();

      const contentItemId: string | null = contentItem?.id ?? null;

      // 9. Mark job completed
      await supabase
        .from('agent_jobs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          output: {
            contentItemId,
            totalCostUsd: pipelineOutput.totalCostUsd,
            durationMs: pipelineOutput.durationMs,
          },
        })
        .eq('id', jobId);

      // 10. Insert success notification
      await insertNotification({
        userId,
        type: 'item_ready',
        title: `${agentConfig.actionLabel} — ready to review`,
        body: pipelineOutput.summaryText.slice(0, 120) || 'Your agent output is ready.',
        actionUrl: contentItemId ? `/dashboard/inbox/${contentItemId}` : '/dashboard/inbox',
        payload: { jobId, agentType, contentItemId, totalCostUsd: pipelineOutput.totalCostUsd },
      });

      return {
        jobId,
        status: 'completed',
        contentItemId,
        totalCostUsd: pipelineOutput.totalCostUsd,
        durationMs: pipelineOutput.durationMs,
      };
    });

    return result;
  },
);
