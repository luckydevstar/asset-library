'use client';

import { useState } from 'react';
import type { Asset, DataVizAsset } from '@/lib/types';
import { cx } from '@/lib/utils';
import { ChevronLeftIcon, ChevronRightIcon, LockIcon } from '@/components/ui/Icons';
import { IconButton } from '@/components/ui/IconButton';
import { Chart } from './Chart';

/**
 * The large preview area under the stats row. What goes in it depends on the
 * asset type:
 *  - KPI        → its six-month trend
 *  - Data viz   → the chart itself (ApexCharts), interactive, with a bar/line toggle
 *  - Layout     → a paged wireframe preview ("Preview layout" in the flow)
 *  - Storyboard → a paged slide preview, locked if the user lacks access
 */
export function AssetPreview({ asset }: { asset: Asset }) {
  switch (asset.type) {
    case 'kpi':
      return (
        <Chart
          data={asset.trend}
          kind="line"
          name={asset.name}
          unit={asset.unit}
          label={`${asset.name}, last six months`}
        />
      );
    case 'dataviz':
      return <DataVizPreview asset={asset} />;
    case 'layout':
      return <PagedPreview count={asset.pageCount} noun="Page" />;
    case 'storyboard':
      return <PagedPreview count={asset.slideCount} noun="Slide" locked={asset.restricted} />;
  }
}

function DataVizPreview({ asset }: { asset: DataVizAsset }) {
  const [kind, setKind] = useState(asset.chartType);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <p className="text-xs text-slate-500">Hover, or focus the chart and use the arrow keys, to inspect values.</p>
        <div role="group" aria-label="Chart style" className="flex shrink-0 rounded-md bg-slate-100 p-0.5">
          {(['bar', 'line'] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={kind === option}
              onClick={() => setKind(option)}
              className={cx(
                'rounded px-2 py-0.5 text-xs font-medium capitalize',
                kind === option ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900',
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <Chart
        data={asset.data}
        kind={kind}
        name={asset.name}
        unit={asset.unit}
        label={`${asset.name} (${kind} chart)`}
      />
    </div>
  );
}

/**
 * Placeholder page arrangements on a 4×3 grid. Each one fills all 12 cells
 * exactly. Kept as literal class strings so Tailwind can detect them.
 */
const PAGE_PATTERNS = [
  ['col-span-4', 'col-span-2 row-span-2', 'col-span-2', 'col-span-2'],
  ['row-span-3', 'col-span-3 row-span-2', 'col-span-3'],
  ['col-span-2', 'col-span-2', 'col-span-4 row-span-2'],
  ['col-span-3 row-span-3', '', '', ''],
];

interface PagedPreviewProps {
  count: number;
  noun: 'Page' | 'Slide';
  locked?: boolean;
}

/** Skeleton preview of a multi-page asset with previous/next paging. */
function PagedPreview({ count, noun, locked = false }: PagedPreviewProps) {
  const [page, setPage] = useState(0);
  const blocks = PAGE_PATTERNS[page % PAGE_PATTERNS.length];

  return (
    <div>
      <div className="relative overflow-hidden rounded-lg bg-slate-100">
        <div
          aria-hidden="true"
          className={cx('grid aspect-[2/1] grid-cols-4 grid-rows-3 gap-2 p-3', locked && 'blur-sm')}
        >
          {blocks.map((span, i) => (
            <div key={i} className={cx('rounded-md bg-white p-2 shadow-xs', span)}>
              <div className="h-1.5 w-1/3 rounded bg-slate-200" />
              <div className="mt-1.5 h-1.5 w-1/5 rounded bg-slate-100" />
            </div>
          ))}
        </div>

        {locked && (
          <div className="absolute inset-0 grid place-items-center bg-white/50">
            <p className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow">
              <LockIcon className="size-4" />
              Request access to preview this {noun.toLowerCase()} deck
            </p>
          </div>
        )}
      </div>

      {!locked && (
        <div className="mt-2 flex items-center justify-center gap-2">
          <IconButton label={`Previous ${noun.toLowerCase()}`} disabled={page === 0} onClick={() => setPage(page - 1)} className="disabled:opacity-30">
            <ChevronLeftIcon className="size-4" />
          </IconButton>
          <span aria-live="polite" className="min-w-24 text-center text-xs text-slate-500 tabular-nums">
            {noun} {page + 1} of {count}
          </span>
          <IconButton label={`Next ${noun.toLowerCase()}`} disabled={page === count - 1} onClick={() => setPage(page + 1)} className="disabled:opacity-30">
            <ChevronRightIcon className="size-4" />
          </IconButton>
        </div>
      )}
    </div>
  );
}
