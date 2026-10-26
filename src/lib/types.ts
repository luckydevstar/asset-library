/**
 * Domain model for the Library.
 *
 * "Asset" is the umbrella term for everything a user can browse. Each asset
 * type shares a common base (what the base modal renders) and adds its own
 * fields (what the type-specific modal sections render). Modelling this as a
 * discriminated union on `type` lets TypeScript narrow to the right shape in
 * a `switch (asset.type)` without casts.
 */

export type AssetType = 'kpi' | 'layout' | 'dataviz' | 'storyboard';

/** A single labelled value, used by chart previews. */
export interface DataPoint {
  label: string;
  value: number;
}

export interface BusinessQuestion {
  title: string;
  description: string;
}

interface AssetBase {
  id: string;
  type: AssetType;
  name: string;
  /** Longer, descriptive name shown under the title in the modal. */
  subtitle: string;
  description: string;
  /** Stored without the leading `#`; the UI adds it when rendering. */
  tags: string[];
  /** Whether the asset applies company-wide or only to specific affiliates. */
  scope: 'Universal' | 'Affiliate';
  /** How many times the asset has been added to a layout/storyboard. */
  usageCount: number;
  /** ISO date (YYYY-MM-DD). Kept as a string to avoid timezone drift. */
  updatedAt: string;
  /** Hand-picked for the "Featured" shelf. */
  featured?: boolean;
  /** Relative popularity used to rank the "Trending" shelf. */
  trendingScore: number;
  /** The current user can see the asset exists but must request access to use it. */
  restricted?: boolean;
  businessQuestions: BusinessQuestion[];
}

export interface KpiAsset extends AssetBase {
  type: 'kpi';
  metricIds: string[];
  /** Human-readable formula. */
  calculation: string;
  /** Suffix appended to values, e.g. `%` or ` pts`. */
  unit: string;
  trend: DataPoint[];
  /** Data viz assets that can render this KPI. */
  visualIds: string[];
  /** Affiliates this KPI is valid for. */
  affiliates: string[];
}

export interface LayoutAsset extends AssetBase {
  type: 'layout';
  pageCount: number;
  /** KPIs surfaced somewhere in the layout. */
  kpiIds: string[];
}

export interface DataVizAsset extends AssetBase {
  type: 'dataviz';
  chartType: 'bar' | 'line';
  unit: string;
  data: DataPoint[];
  /** KPIs this visual can be bound to. */
  kpiIds: string[];
  dataSource: string;
  refreshCadence: string;
}

export interface StoryboardAsset extends AssetBase {
  type: 'storyboard';
  slideCount: number;
  /** KPIs the storyboard is built on; filters are applied to them as a set. */
  kpiIds: string[];
  filters: string[];
  affiliates: string[];
}

export type Asset = KpiAsset | LayoutAsset | DataVizAsset | StoryboardAsset;
