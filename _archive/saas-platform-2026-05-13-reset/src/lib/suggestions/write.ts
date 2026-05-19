/**
 * write.ts — Persists evaluated suggestions to the DB.
 *
 * Calls evaluateScanFindings() then batch-inserts into the `suggestions` table.
 * Uses the Supabase service role client (Inngest context — no user cookie).
 * Skips suggestions that already exist for the same (businessId, triggerRule, scanId)
 * to avoid duplicates on retry.
 */

import { createServiceClient } from '@/lib/supabase/service';
import { evaluateScanFindings } from './rules';
import type { ScanResult } from '@/lib/agents/types';

interface WriteSuggestionsOptions {
  scan: ScanResult;
  previousScan?: ScanResult | null;
  businessId: string;
  userId: string;
  pages?: Array<{
    url: string;
    lastModifiedDays: number;
    hasJsonLd: boolean;
    externalCitationCount: number;
    wordCount: number;
  }>;
}

export interface WriteSuggestionsResult {
  inserted: number;
  skipped: number;
  errors: string[];
}

/**
 * Evaluate rules and persist suggestions to DB.
 * Safe to call multiple times — deduplicates by (businessId, triggerRule).
 */
export async function writeSuggestions(
  options: WriteSuggestionsOptions
): Promise<WriteSuggestionsResult> {
  const { scan, previousScan, businessId, userId, pages } = options;

  const evaluated = evaluateScanFindings(scan, {
    previousScan,
    pages,
    businessId,
    userId,
  });

  if (evaluated.length === 0) {
    return { inserted: 0, skipped: 0, errors: [] };
  }

  const supabase = createServiceClient();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const rows = evaluated.map(s => ({
    user_id: s.userId,
    business_id: s.businessId,
    scan_id: scan.scanId,
    agent_type: s.agentType,
    title: s.title,
    description: s.description,
    impact: s.impact,
    estimated_runs: s.estimatedRuns,
    status: 'pending' as const,
    trigger_rule: s.triggerRule,
    evidence: s.evidence,
    target_query_ids: s.targetQueryIds,
    target_url: s.targetUrl,
    expires_at: expiresAt.toISOString(),
  }));

  const errors: string[] = [];
  let inserted = 0;
  let skipped = 0;

  // Insert individually to allow partial success and track skips
  for (const row of rows) {
    const { error } = await supabase
      .from('suggestions')
      .insert(row)
      .select('id')
      .single();

    if (error) {
      // Duplicate key = already exists for this scan/rule combination
      if (error.code === '23505') {
        skipped++;
      } else {
        errors.push(`${row.trigger_rule ?? row.agent_type}: ${error.message}`);
      }
    } else {
      inserted++;
    }
  }

  return { inserted, skipped, errors };
}
