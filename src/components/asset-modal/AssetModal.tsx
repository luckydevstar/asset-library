'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Asset } from '@/lib/types';
import { ASSET_TYPE_META, getAssetById } from '@/lib/assets';
import { ASSET_PARAM, closeAsset, getAssetShareUrl, openAsset } from '@/lib/assetLink';
import { copyToClipboard, cx, formatDate } from '@/lib/utils';
import { useFavorites } from '@/hooks/useFavorites';
import { Dialog } from '@/components/ui/Dialog';
import { IconButton } from '@/components/ui/IconButton';
import { AssetTypeIcon, BookmarkIcon, CheckIcon, InfoIcon, LinkIcon, LockIcon, XIcon } from '@/components/ui/Icons';
import { AssetPreview } from './AssetPreview';
import { AssetDetails } from './AssetDetails';

interface AssetModalRouteProps {
  onRequestAccess: (asset: Asset) => void;
}

/**
 * Reads `?asset=<id>` and shows the matching modal.
 *
 * This is the only component that calls `useSearchParams`, which is why it is
 * rendered inside its own <Suspense> boundary: the rest of the page can still
 * be prerendered to static HTML.
 */
export function AssetModalRoute({ onRequestAccess }: AssetModalRouteProps) {
  const id = useSearchParams().get(ASSET_PARAM);
  // Unknown IDs (stale or mistyped links) leave the modal closed.
  const asset = id ? getAssetById(id) : undefined;

  return (
    <Dialog open={asset !== undefined} onClose={closeAsset} labelledBy="asset-modal-title" className="max-w-2xl">
      {/* Keyed by ID so local UI state (pager, chart toggle, scroll) resets when moving between assets. */}
      {asset && <AssetModalContent key={asset.id} asset={asset} onRequestAccess={onRequestAccess} />}
    </Dialog>
  );
}

interface AssetModalContentProps {
  asset: Asset;
  onRequestAccess: (asset: Asset) => void;
}

/** The base modal from the flow. Shared by every asset type; type-specific parts are delegated. */
function AssetModalContent({ asset, onRequestAccess }: AssetModalContentProps) {
  const { favorites, toggleFavorite } = useFavorites();
  const isFavorite = favorites.has(asset.id);
  const meta = ASSET_TYPE_META[asset.type];

  return (
    <>
      <div className="flex items-center justify-end gap-1 px-3 pt-3">
        <CopyLinkButton assetId={asset.id} />
        <IconButton label="Close" onClick={closeAsset}>
          <XIcon className="size-4" />
        </IconButton>
      </div>

      <div className="overflow-y-auto px-5 pb-8 sm:px-8">
        <header className="text-center">
          <span className="mx-auto grid size-11 place-items-center rounded-lg border border-slate-200 text-slate-500">
            <AssetTypeIcon type={asset.type} className="size-5" />
          </span>
          <div className="mt-3 flex items-center justify-center gap-2">
            <h2 id="asset-modal-title" className="text-2xl font-bold tracking-tight">
              {asset.name}
            </h2>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
              {meta.label}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">{asset.subtitle}</p>
          <p className="mx-auto mt-4 max-w-lg text-sm text-slate-700">{asset.description}</p>
          <ul className="mt-3 flex flex-wrap justify-center gap-1.5" aria-label="Tags">
            {asset.tags.map((tag) => (
              <li key={tag} className="rounded border border-slate-200 px-1.5 py-0.5 text-[11px] text-slate-500">
                #{tag}
              </li>
            ))}
          </ul>
        </header>

        <StatsRow asset={asset} />

        <div className="mt-6">
          <AssetPreview asset={asset} />
        </div>

        <section className="mt-8">
          <h3 className="text-sm font-semibold text-slate-900">Business Questions</h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {asset.businessQuestions.map((question) => (
              <li key={question.title} className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-900">{question.title}</p>
                <p className="mt-1 text-xs text-slate-500">{question.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <AssetDetails asset={asset} onSelectAsset={openAsset} />
      </div>

      {/* Footer stays pinned while the body scrolls, so the primary action is always reachable. */}
      <footer className="flex gap-2 border-t border-slate-100 bg-white p-4">
        <button
          type="button"
          onClick={() => toggleFavorite(asset.id)}
          className={cx(
            'flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors',
            // With a restricted asset, "Request access" becomes the primary action.
            asset.restricted
              ? 'border border-slate-300 text-slate-900 hover:bg-slate-50'
              : 'bg-slate-900 text-white hover:bg-slate-800',
          )}
        >
          <BookmarkIcon filled={isFavorite} className="size-4" />
          {isFavorite ? 'Remove from favorites' : 'Favorite item'}
        </button>
        {asset.restricted && (
          <button
            type="button"
            onClick={() => onRequestAccess(asset)}
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            <LockIcon className="size-4" />
            Request access
          </button>
        )}
      </footer>
    </>
  );
}

// -------------------------------------------------------------- Stats row

interface Stat {
  label: string;
  value: string | number;
  hint?: string;
}

/** Four headline numbers. The third slot is the one fact that matters most for each type. */
function getStats(asset: Asset): Stat[] {
  const typeStat: Stat = (() => {
    switch (asset.type) {
      case 'kpi':
        return { label: 'Metric IDs', value: asset.metricIds.length, hint: 'Source metrics this KPI is calculated from' };
      case 'layout':
        return { label: 'Pages No.', value: asset.pageCount, hint: 'Number of pages in this layout' };
      case 'dataviz':
        return { label: 'KPIs', value: asset.kpiIds.length, hint: 'KPIs this visual can display' };
      case 'storyboard':
        return { label: 'Slides', value: asset.slideCount, hint: 'Number of slides in this storyboard' };
    }
  })();

  return [
    { label: 'Used', value: asset.usageCount.toLocaleString('en-US'), hint: 'Times added to a layout or storyboard' },
    { label: 'Type', value: asset.scope, hint: 'Universal assets apply to every affiliate' },
    typeStat,
    { label: 'Last Updated', value: formatDate(asset.updatedAt) },
  ];
}

function StatsRow({ asset }: { asset: Asset }) {
  return (
    <dl className="mt-6 grid grid-cols-2 gap-y-4 border-y border-slate-100 py-4 sm:grid-cols-4 sm:divide-x sm:divide-slate-200">
      {getStats(asset).map((stat) => (
        // Value is visually above its label, but <dt> must come first in the DOM, hence flex-col-reverse.
        <div key={stat.label} className="flex flex-col-reverse items-center px-2 text-center">
          <dt className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
            {stat.label}
            {stat.hint && (
              <span title={stat.hint} className="cursor-help">
                <InfoIcon className="size-3" />
                <span className="sr-only">: {stat.hint}</span>
              </span>
            )}
          </dt>
          <dd className="text-sm font-semibold text-slate-900">{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}

// ------------------------------------------------------------- Copy link

function CopyLinkButton({ assetId }: { assetId: string }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  // Reset the confirmation after a moment so the button can be reused.
  useEffect(() => {
    if (status === 'idle') return;
    const timeout = setTimeout(() => setStatus('idle'), 2000);
    return () => clearTimeout(timeout);
  }, [status]);

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    const container = event.currentTarget.closest('dialog') ?? undefined;
    const ok = await copyToClipboard(getAssetShareUrl(assetId), container);
    setStatus(ok ? 'copied' : 'failed');
  }

  return (
    <div className="flex items-center gap-1">
      <span role="status" className="text-xs text-slate-500">
        {status === 'copied' && 'Link copied'}
        {status === 'failed' && 'Couldn’t copy link'}
      </span>
      <IconButton label="Copy link" onClick={handleClick}>
        {status === 'copied' ? <CheckIcon className="size-4 text-emerald-600" /> : <LinkIcon className="size-4" />}
      </IconButton>
    </div>
  );
}
