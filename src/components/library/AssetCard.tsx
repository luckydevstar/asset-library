import type { ReactNode } from 'react';
import type { Asset } from '@/lib/types';
import { ASSET_TYPE_META } from '@/lib/assets';
import { cx, formatDate } from '@/lib/utils';
import { AssetTypeIcon, BookmarkIcon, LockIcon } from '@/components/ui/Icons';

interface AssetCardProps {
  asset: Asset;
  onSelect: (asset: Asset) => void;
  /** `outlined` = Featured cards (bordered); `plain` = Trending cards (borderless until hover). */
  variant?: 'outlined' | 'plain';
  isFavorite?: boolean;
}

export function AssetCard({ asset, onSelect, variant = 'outlined', isFavorite = false }: AssetCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(asset)}
      className={cx(
        'group flex w-full items-start gap-3 rounded-lg p-3 text-left transition',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900',
        variant === 'outlined'
          ? 'border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
          : 'border border-transparent hover:border-slate-200 hover:bg-white',
      )}
    >
      <span className="grid size-14 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-400 transition-colors group-hover:text-slate-600">
        <AssetTypeIcon type={asset.type} className="size-6" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold text-slate-900">{asset.name}</span>
          {asset.restricted && (
            <>
              <LockIcon className="size-3.5 shrink-0 text-slate-400" />
              <span className="sr-only">(requires access)</span>
            </>
          )}
          {isFavorite && (
            <>
              <BookmarkIcon filled className="ml-auto size-3.5 shrink-0 text-slate-700" />
              <span className="sr-only">(favorited)</span>
            </>
          )}
        </span>
        <span className="mt-0.5 line-clamp-2 text-xs text-slate-500">{asset.description}</span>
        <span className="mt-1 block text-[11px] text-slate-400">
          {ASSET_TYPE_META[asset.type].label} · {formatDate(asset.updatedAt)}
        </span>
      </span>
    </button>
  );
}

interface AssetGridProps extends Omit<AssetCardProps, 'asset' | 'isFavorite'> {
  assets: Asset[];
  favorites: Set<string>;
}

export function AssetGrid({ assets, favorites, ...cardProps }: AssetGridProps) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {assets.map((asset) => (
        <li key={asset.id}>
          <AssetCard asset={asset} isFavorite={favorites.has(asset.id)} {...cardProps} />
        </li>
      ))}
    </ul>
  );
}

interface AssetSectionProps {
  id: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
}

/** Heading + subheading + content, matching the "Featured" / "Trending" blocks in the wireframe. */
export function AssetSection({ id, title, description, children }: AssetSectionProps) {
  return (
    <section aria-labelledby={id} className="mt-8">
      <h2 id={id} className="text-xl font-semibold tracking-tight text-slate-900">
        {title}
      </h2>
      {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}
