/**
 * Unit tests for factor-catalog.ts.
 *
 * Coverage:
 *   (1)  buildGapList joins observations against catalog rows correctly
 *   (2)  buildGapList carries tier, promises_lift, display_name, impact_weight, playbook_id
 *   (3)  Tier-3 rows always have promises_lift=false
 *   (4)  Missing catalog row → graceful degradation (tier=-1, promises_lift=false)
 *   (5)  loadFactorCatalog throws on Supabase error
 *   (6)  buildGapList preserves all statuses (present, absent, unknown, pending)
 *   (7)  buildGapList returns items in catalog tier order
 */

import { describe, it, expect } from 'vitest';
import { buildGapList, loadFactorCatalog } from '../factor-catalog';
import type { FactorCatalogRow } from '../factor-catalog';
import type { FactorObservation } from '../factor-detection';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const CATALOG_ROWS: FactorCatalogRow[] = [
  {
    factor_key: 'ai_bot_allowlist',
    tier: 1,
    display_name: 'AI Bot Allowlist',
    description: 'robots.txt AI crawler permissions',
    impact_weight: 0.40,
    weight_source: 'vendor_estimated',
    playbook_id: 'content_optimizer',
    promises_lift: true,
    version: 1,
    is_active: true,
  },
  {
    factor_key: 'basic_schema',
    tier: 2,
    display_name: 'Basic Schema Markup',
    description: 'Organization/FAQ schema',
    impact_weight: 0.19,
    weight_source: 'vendor_estimated',
    playbook_id: 'schema_generator',
    promises_lift: true,
    version: 1,
    is_active: true,
  },
  {
    factor_key: 'llms_txt',
    tier: 3,
    display_name: 'llms.txt File',
    description: 'Hygiene only — no measurable lift',
    impact_weight: 0.02,
    weight_source: 'vendor_estimated',
    playbook_id: null,
    promises_lift: false,   // Tier-3 constraint
    version: 1,
    is_active: true,
  },
];

function makeObs(factor_key: string, status: FactorObservation['status'] = 'absent'): FactorObservation {
  return {
    factor_key,
    status,
    truth_class: 'FACT',
    evidence: `test evidence for ${factor_key}`,
    source: status === 'pending' ? 'external_api_pending' : 'site_audit',
    detected_at: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// buildGapList
// ---------------------------------------------------------------------------

describe('buildGapList()', () => {
  it('(1) joins observations against catalog rows by factor_key', () => {
    const obs = [
      makeObs('ai_bot_allowlist', 'present'),
      makeObs('basic_schema', 'absent'),
      makeObs('llms_txt', 'absent'),
    ];
    const result = buildGapList(obs, CATALOG_ROWS);
    expect(result).toHaveLength(3);

    const botItem = result.find((x) => x.factor_key === 'ai_bot_allowlist')!;
    expect(botItem.status).toBe('present');
    expect(botItem.tier).toBe(1);
    expect(botItem.display_name).toBe('AI Bot Allowlist');
  });

  it('(2) carries tier, promises_lift, impact_weight, playbook_id from catalog', () => {
    const obs = [makeObs('basic_schema', 'absent')];
    const result = buildGapList(obs, CATALOG_ROWS);
    const item = result[0];
    expect(item.tier).toBe(2);
    expect(item.display_name).toBe('Basic Schema Markup');
    expect(item.impact_weight).toBe(0.19);
    expect(item.playbook_id).toBe('schema_generator');
    expect(item.promises_lift).toBe(true);
  });

  it('(3) Tier-3 rows have promises_lift=false', () => {
    const obs = [makeObs('llms_txt', 'absent')];
    const result = buildGapList(obs, CATALOG_ROWS);
    const item = result.find((x) => x.factor_key === 'llms_txt')!;
    expect(item.promises_lift).toBe(false);
    expect(item.tier).toBe(3);
  });

  it('(4) missing catalog row → graceful degradation (tier=-1, promises_lift=false)', () => {
    const obs = [makeObs('unknown_future_factor', 'absent')];
    const result = buildGapList(obs, CATALOG_ROWS);
    expect(result).toHaveLength(1);
    const item = result[0];
    expect(item.tier).toBe(-1);
    expect(item.promises_lift).toBe(false);
    expect(item.display_name).toBe('unknown_future_factor');
    expect(item.impact_weight).toBe(0);
    expect(item.playbook_id).toBeNull();
    // Status and evidence are preserved
    expect(item.status).toBe('absent');
    expect(item.evidence).toContain('unknown_future_factor');
  });

  it('(6) preserves all statuses: present, absent, unknown, pending', () => {
    const obs = [
      makeObs('ai_bot_allowlist', 'present'),
      makeObs('basic_schema', 'absent'),
      makeObs('llms_txt', 'unknown'),
    ];
    const result = buildGapList(obs, CATALOG_ROWS);
    expect(result.find((x) => x.factor_key === 'ai_bot_allowlist')!.status).toBe('present');
    expect(result.find((x) => x.factor_key === 'basic_schema')!.status).toBe('absent');
    expect(result.find((x) => x.factor_key === 'llms_txt')!.status).toBe('unknown');
  });

  it('(7) returns items in catalog tier order (tier 1 before tier 2 before tier 3)', () => {
    // Provide observations in reverse order — result should be sorted by tier
    const obs = [
      makeObs('llms_txt', 'absent'),       // tier 3
      makeObs('basic_schema', 'absent'),    // tier 2
      makeObs('ai_bot_allowlist', 'present'), // tier 1
    ];
    const result = buildGapList(obs, CATALOG_ROWS);
    expect(result[0].tier).toBe(1);
    expect(result[1].tier).toBe(2);
    expect(result[2].tier).toBe(3);
  });

  it('empty observations → empty result', () => {
    expect(buildGapList([], CATALOG_ROWS)).toHaveLength(0);
  });

  it('empty catalog → all items get graceful degradation', () => {
    const obs = [makeObs('ai_bot_allowlist', 'present')];
    const result = buildGapList(obs, []);
    expect(result).toHaveLength(1);
    expect(result[0].tier).toBe(-1);
    expect(result[0].promises_lift).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// loadFactorCatalog — mock Supabase client
// ---------------------------------------------------------------------------

describe('loadFactorCatalog()', () => {
  it('(5) throws on Supabase error', async () => {
    const mockSupabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => Promise.resolve({ data: null, error: { message: 'DB connection failed' } }),
          }),
        }),
      }),
    };

    await expect(loadFactorCatalog(mockSupabase)).rejects.toThrow('DB connection failed');
  });

  it('returns sorted rows from Supabase', async () => {
    // Return rows in reverse tier order — loadFactorCatalog must sort them
    const rawRows: FactorCatalogRow[] = [
      { ...CATALOG_ROWS[2] }, // tier 3
      { ...CATALOG_ROWS[1] }, // tier 2
      { ...CATALOG_ROWS[0] }, // tier 1
    ];

    const mockSupabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => Promise.resolve({ data: rawRows, error: null }),
          }),
        }),
      }),
    };

    const result = await loadFactorCatalog(mockSupabase);
    expect(result).toHaveLength(3);
    expect(result[0].tier).toBe(1);
    expect(result[1].tier).toBe(2);
    expect(result[2].tier).toBe(3);
  });

  it('returns empty array when Supabase returns null data', async () => {
    const mockSupabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
      }),
    };

    const result = await loadFactorCatalog(mockSupabase);
    expect(result).toEqual([]);
  });
});
