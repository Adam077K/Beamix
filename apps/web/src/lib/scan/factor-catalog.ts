/**
 * factor-catalog.ts — Typed reader for the factor_catalog table.
 *
 * The DB is the source of truth for all catalog rows. This module provides:
 *   1. loadFactorCatalog — reads active v1 rows from Supabase.
 *   2. buildGapList — joins FactorObservations against catalog rows to produce
 *      a complete annotated list (present + absent + unknown + pending).
 *
 * Gap ordering (contrastive/impact-weighted) is owned by Wave 6.
 * This module preserves catalog tier order only.
 */

import type { FactorObservation } from './factor-detection';

// ---------------------------------------------------------------------------
// Minimal Supabase client structural type
// Avoids importing the full @supabase/supabase-js type tree from app code.
// ---------------------------------------------------------------------------

export interface SupabaseClientLike {
  from(table: string): {
    select(columns: string): {
      eq(column: string, value: unknown): {
        eq(column: string, value: unknown): Promise<{
          data: unknown[] | null;
          error: { message: string } | null;
        }>;
      };
    };
  };
}

// ---------------------------------------------------------------------------
// FactorCatalogRow — mirrors factor_catalog table columns
// ---------------------------------------------------------------------------

export interface FactorCatalogRow {
  factor_key: string;
  tier: number;
  display_name: string;
  description: string | null;
  impact_weight: number;
  weight_source: string;
  playbook_id: string | null;
  /** Tier-3 rows are always false (enforced by DB constraint). */
  promises_lift: boolean;
  version: number;
  is_active: boolean;
}

// ---------------------------------------------------------------------------
// loadFactorCatalog
// ---------------------------------------------------------------------------

/**
 * Loads active v1 factor catalog rows from Supabase, ordered by tier ascending.
 *
 * @throws if the Supabase query returns an error (caller decides how to handle).
 */
export async function loadFactorCatalog(supabase: SupabaseClientLike): Promise<FactorCatalogRow[]> {
  const { data, error } = await supabase
    .from('factor_catalog')
    .select('factor_key, tier, display_name, description, impact_weight, weight_source, playbook_id, promises_lift, version, is_active')
    .eq('is_active', true)
    .eq('version', 1);

  if (error) {
    throw new Error(`factor-catalog: failed to load from DB — ${error.message}`);
  }

  const rows = (data ?? []) as FactorCatalogRow[];
  // Sort by tier ascending (DB does not guarantee order without ORDER BY; we sort client-side
  // because SupabaseClientLike is minimal and doesn't expose .order()).
  rows.sort((a, b) => a.tier - b.tier);
  return rows;
}

// ---------------------------------------------------------------------------
// GapListItem — observation enriched with catalog metadata
// ---------------------------------------------------------------------------

export interface GapListItem extends FactorObservation {
  tier: number;
  display_name: string;
  impact_weight: number;
  playbook_id: string | null;
  /**
   * Whether the playbook promises a measurable lift.
   * Always false for Tier-3 factors (DB constraint + seed enforced).
   */
  promises_lift: boolean;
}

// ---------------------------------------------------------------------------
// buildGapList
// ---------------------------------------------------------------------------

/**
 * Joins FactorObservations against catalog rows by factor_key.
 *
 * Returns ALL observations (present, absent, unknown, pending) annotated with
 * catalog metadata. A "gap" is status='absent' — callers filter if needed.
 *
 * Order: catalog tier order (Tier 1 first, Tier 3 last).
 * Observations with no matching catalog row are included at the end with
 * tier=-1 and empty metadata — graceful degradation if catalog is stale.
 *
 * Impact-weighted ordering is owned by Wave 6; do NOT reorder here.
 */
export function buildGapList(
  observations: FactorObservation[],
  catalog: FactorCatalogRow[],
): GapListItem[] {
  const catalogMap = new Map<string, FactorCatalogRow>();
  for (const row of catalog) {
    catalogMap.set(row.factor_key, row);
  }

  // Sort observations to match catalog tier order.
  // Build a tier-order index from the catalog for fast lookup.
  const tierOrder = new Map<string, number>();
  catalog.forEach((row, idx) => tierOrder.set(row.factor_key, idx));

  const sorted = [...observations].sort((a, b) => {
    const ai = tierOrder.get(a.factor_key) ?? Number.MAX_SAFE_INTEGER;
    const bi = tierOrder.get(b.factor_key) ?? Number.MAX_SAFE_INTEGER;
    return ai - bi;
  });

  return sorted.map((obs): GapListItem => {
    const row = catalogMap.get(obs.factor_key);
    if (!row) {
      // Graceful degradation: observation exists but catalog row is missing.
      // This can happen during migration if the catalog is temporarily stale.
      return {
        ...obs,
        tier: -1,
        display_name: obs.factor_key,
        impact_weight: 0,
        playbook_id: null,
        promises_lift: false,
      };
    }

    return {
      ...obs,
      tier: row.tier,
      display_name: row.display_name,
      impact_weight: row.impact_weight,
      playbook_id: row.playbook_id,
      promises_lift: row.promises_lift,
    };
  });
}
