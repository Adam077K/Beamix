/**
 * Beamix Agent System — Pipeline Context Builder
 *
 * Assembles the `AgentPipelineContext` consumed by every pipeline step. The context is
 * built once, before the PLAN step, by loading the business profile and (optionally)
 * the linked scan from the DB. Steps read it; they never re-query.
 *
 * Per `12-AGENT-BUILD-SPEC.md` §Pipeline Architecture — `context.ts`.
 */

import { getAdminClient } from '../db/admin-client';
import { getAgentConfig } from '../config/registry';
import { AgentError } from '../errors';
import type {
  AgentJobInput,
  AgentPipelineContext,
  BusinessContext,
  EngineResult,
  QueryPosition,
  ScanResult,
} from '../types';

/** Coerce a free-form DB `language` column to the strict `'he' | 'en'` union. */
function normalizeLanguage(raw: string | null | undefined): 'he' | 'en' {
  return raw === 'he' ? 'he' : 'en';
}

/** Coerce a free-form DB `sentiment` column to the strict scan sentiment union. */
function normalizeSentiment(
  raw: string | null | undefined,
): 'positive' | 'neutral' | 'negative' | null {
  if (raw === 'positive' || raw === 'neutral' || raw === 'negative') return raw;
  return null;
}

/**
 * Load the `BusinessContext` for a job. Throws `AgentError` (PLAN stage) if the
 * business row is missing — the pipeline cannot run without it.
 */
async function loadBusinessContext(input: AgentJobInput): Promise<BusinessContext> {
  const { data, error } = await getAdminClient()
    .from('businesses')
    .select('id, name, industry, location, services, website_url, language')
    .eq('id', input.businessId)
    .maybeSingle();

  if (error) {
    throw new AgentError(
      input.agentType,
      'plan',
      input.jobId,
      `Failed to load business ${input.businessId}: ${error.message}`,
      true,
    );
  }
  if (!data) {
    throw new AgentError(
      input.agentType,
      'plan',
      input.jobId,
      `Business ${input.businessId} not found`,
      false,
    );
  }

  const industry = data.industry ?? '';
  // YMYL inference: a business in a health / finance / legal industry carries
  // elevated review risk. The QA stage flags claims regardless; this only drives
  // the PLAN-stage YMYL notice block.
  const ymylCategory = /health|medical|clinic|finance|financial|legal|law|insurance|tax/i.test(
    industry,
  );

  return {
    businessId: data.id,
    name: data.name,
    industry,
    location: data.location ?? '',
    services: data.services ?? [],
    scanUrl: data.website_url,
    ymylCategory,
    language: normalizeLanguage(data.language),
  };
}

/**
 * Load the `ScanResult` linked to a job, if `scanId` is present. Returns `undefined`
 * when no scan is linked or the scan row cannot be read — scan context is optional
 * input to the pipeline, not a hard requirement.
 */
async function loadScanResult(input: AgentJobInput): Promise<ScanResult | undefined> {
  if (!input.scanId) return undefined;
  const client = getAdminClient();

  const { data: scan, error: scanError } = await client
    .from('scans')
    .select('id, completed_at, metadata, business_id')
    .eq('id', input.scanId)
    .maybeSingle();

  if (scanError || !scan) return undefined;

  const { data: engineRows } = await client
    .from('scan_engine_results')
    .select('engine, is_mentioned, rank_position, sentiment')
    .eq('scan_id', input.scanId);

  const { data: positionRows } = await client
    .from('query_positions')
    .select('query_text, engine, position, is_mentioned')
    .eq('scan_id', input.scanId);

  const engineResults: EngineResult[] = (engineRows ?? []).map((row) => ({
    engine: row.engine,
    isMentioned: row.is_mentioned ?? false,
    rankPosition: row.rank_position ?? null,
    sentiment: normalizeSentiment(row.sentiment),
    brandsMentioned: [],
  }));

  const queryPositions: QueryPosition[] = (positionRows ?? []).map((row) => ({
    queryText: row.query_text,
    engine: row.engine,
    position: row.position ?? null,
    isMentioned: row.is_mentioned ?? false,
    competitorsMentioned: [],
  }));

  // `metadata` is a JSONB blob; `overall_score` lives inside it when present.
  const metadata = (scan.metadata ?? {}) as { overall_score?: number };
  const overallScore = typeof metadata.overall_score === 'number' ? metadata.overall_score : 0;

  return {
    scanId: scan.id,
    completedAt: scan.completed_at ?? '',
    overallScore,
    engineResults,
    queryPositions,
  };
}

/**
 * Build the full `AgentPipelineContext` for a job. Loads the business profile (required)
 * and the linked scan (optional). `holdId` is set later by the runner after credits are
 * held; `competitorData` / `queryIntelligence` are populated by the RESEARCH step.
 */
export async function buildPipelineContext(
  input: AgentJobInput,
): Promise<AgentPipelineContext> {
  const config = getAgentConfig(input.agentType);
  const [business, scanData] = await Promise.all([
    loadBusinessContext(input),
    loadScanResult(input),
  ]);

  return {
    input,
    config,
    business,
    scanData,
  };
}
