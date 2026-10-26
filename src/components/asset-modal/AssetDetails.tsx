'use client';

import type { ReactNode } from 'react';
import type { Asset, DataVizAsset, KpiAsset, LayoutAsset, StoryboardAsset } from '@/lib/types';
import { AFFILIATES, getAssetsByIds, getKpisByIds } from '@/lib/assets';
import { cx } from '@/lib/utils';
import { useFavorites } from '@/hooks/useFavorites';
import { AssetTypeIcon, BookmarkIcon, CheckIcon, ChevronRightIcon, XIcon } from '@/components/ui/Icons';

interface DetailsProps<T extends Asset> {
  asset: T;
  /** Open a related asset in the modal (e.g. a KPI used by a layout). */
  onSelectAsset: (id: string) => void;
}

/**
 * Type-specific sections rendered below the shared modal content.
 * These map one-to-one to the yellow/blue boxes under each modal in the flow.
 */
export function AssetDetails({ asset, onSelectAsset }: DetailsProps<Asset>) {
  switch (asset.type) {
    case 'kpi':
      return <KpiDetails asset={asset} onSelectAsset={onSelectAsset} />;
    case 'layout':
      return <LayoutDetails asset={asset} onSelectAsset={onSelectAsset} />;
    case 'dataviz':
      return <DataVizDetails asset={asset} onSelectAsset={onSelectAsset} />;
    case 'storyboard':
      return <StoryboardDetails asset={asset} onSelectAsset={onSelectAsset} />;
  }
}

// ------------------------------------------------------------------ KPI

function KpiDetails({ asset, onSelectAsset }: DetailsProps<KpiAsset>) {
  return (
    <>
      <DetailSection title="Metric IDs">
        <ul className="flex flex-wrap gap-1.5">
          {asset.metricIds.map((id) => (
            <li key={id}>
              <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-700">{id}</code>
            </li>
          ))}
        </ul>
      </DetailSection>

      <DetailSection title="Calculation">
        <pre className="overflow-x-auto rounded-md bg-slate-900 p-3 font-mono text-xs text-slate-100">
          <code>{asset.calculation}</code>
        </pre>
      </DetailSection>

      <DetailSection title="Visuals available" hint="Data viz assets that can display this KPI.">
        <RelatedAssetList assets={getAssetsByIds(asset.visualIds)} onSelect={onSelectAsset} />
      </DetailSection>

      <DetailSection title="Affiliate applicability">
        <AffiliateList applicable={asset.affiliates} />
      </DetailSection>
    </>
  );
}

// --------------------------------------------------------------- Layout

function LayoutDetails({ asset, onSelectAsset }: DetailsProps<LayoutAsset>) {
  // Page count is shown in the stats row and the preview pager, so only the KPIs need a section.
  return (
    <DetailSection title="KPIs being used" hint={`Across all ${asset.pageCount} pages.`}>
      <RelatedAssetList assets={getKpisByIds(asset.kpiIds)} onSelect={onSelectAsset} />
    </DetailSection>
  );
}

// ------------------------------------------------------------- Data viz

function DataVizDetails({ asset, onSelectAsset }: DetailsProps<DataVizAsset>) {
  const { favorites } = useFavorites();

  // The user's favorited KPIs come first: they're the ones being tracked
  // right now, so they're the likeliest to be paired with this visual.
  const kpis = getKpisByIds(asset.kpiIds).sort(
    (a, b) => Number(favorites.has(b.id)) - Number(favorites.has(a.id)),
  );
  const hasFavorite = kpis.some((kpi) => favorites.has(kpi.id));

  return (
    <>
      <DetailSection
        title="Applicable KPI favorites"
        hint={hasFavorite ? 'Your favorited KPIs are listed first.' : 'Favorite a KPI to pin it to the top of this list.'}
      >
        <RelatedAssetList
          assets={kpis}
          onSelect={onSelectAsset}
          renderBadge={(kpi) =>
            favorites.has(kpi.id) && (
              <>
                <BookmarkIcon filled className="size-3.5 text-slate-700" />
                <span className="sr-only">(favorited)</span>
              </>
            )
          }
        />
      </DetailSection>

      <DetailSection title="Asset info">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <InfoItem term="Chart type" value={asset.chartType === 'bar' ? 'Bar chart' : 'Line chart'} />
          <InfoItem term="Data source" value={asset.dataSource} />
          <InfoItem term="Refresh cadence" value={asset.refreshCadence} />
          <InfoItem term="Scope" value={asset.scope} />
        </dl>
      </DetailSection>
    </>
  );
}

// ----------------------------------------------------------- Storyboard

function StoryboardDetails({ asset, onSelectAsset }: DetailsProps<StoryboardAsset>) {
  return (
    <>
      <DetailSection title="Coupled KPIs & filters" hint="These KPIs ship with the filters below already applied.">
        <RelatedAssetList assets={getKpisByIds(asset.kpiIds)} onSelect={onSelectAsset} />
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {asset.filters.map((filter) => (
            <li key={filter} className="rounded-full border border-slate-200 px-2.5 py-0.5 text-xs text-slate-600">
              {filter}
            </li>
          ))}
        </ul>
      </DetailSection>

      <DetailSection title="Applicable affiliates">
        <AffiliateList applicable={asset.affiliates} />
      </DetailSection>
    </>
  );
}

// ---------------------------------------------------------- Primitives

function DetailSection({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function InfoItem({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{term}</dt>
      <dd className="font-medium text-slate-900">{value}</dd>
    </div>
  );
}

interface RelatedAssetListProps<T extends Asset> {
  assets: T[];
  onSelect: (id: string) => void;
  renderBadge?: (asset: T) => ReactNode;
}

/** Clickable rows that open another asset. This is how users move between related assets. */
function RelatedAssetList<T extends Asset>({ assets, onSelect, renderBadge }: RelatedAssetListProps<T>) {
  if (assets.length === 0) return <p className="text-sm text-slate-500">None linked yet.</p>;

  return (
    <ul className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200">
      {assets.map((asset) => (
        <li key={asset.id}>
          <button
            type="button"
            onClick={() => onSelect(asset.id)}
            className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
          >
            <AssetTypeIcon type={asset.type} className="size-4 shrink-0 text-slate-400" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-slate-900">{asset.name}</span>
              <span className="block truncate text-xs text-slate-500">{asset.subtitle}</span>
            </span>
            {renderBadge?.(asset)}
            <ChevronRightIcon className="size-4 shrink-0 text-slate-400" />
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Every affiliate with a check or cross, so gaps are as visible as coverage. */
function AffiliateList({ applicable }: { applicable: string[] }) {
  return (
    <ul className="grid grid-cols-2 gap-2">
      {AFFILIATES.map((name) => {
        const isApplicable = applicable.includes(name);
        return (
          <li
            key={name}
            className={cx('flex items-center gap-2 text-sm', isApplicable ? 'text-slate-900' : 'text-slate-400')}
          >
            {isApplicable ? (
              <CheckIcon className="size-4 text-emerald-600" />
            ) : (
              <XIcon className="size-4" />
            )}
            {name}
            <span className="sr-only">{isApplicable ? '(applicable)' : '(not applicable)'}</span>
          </li>
        );
      })}
    </ul>
  );
}
