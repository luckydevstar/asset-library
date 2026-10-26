'use client';

import { useState } from 'react';
import type { Asset } from '@/lib/types';
import { AssetGrid, AssetSection } from './AssetCard';

/** Cards shown before "Show more" (two rows, matching the wireframe). */
const COLLAPSED_COUNT = 4;

interface TrendingSectionProps {
  assets: Asset[];
  favorites: Set<string>;
  onSelect: (asset: Asset) => void;
  /** "Not seeing… try search": sends the user back to the search box. */
  onTrySearch: () => void;
}

/**
 * Trending shelf with the "Show more → expanded section" step from the flow.
 *
 * The toggle stays in place (Show more ↔ Show less) instead of disappearing,
 * so keyboard focus is never dropped to <body> after expanding.
 */
export function TrendingSection({ assets, favorites, onSelect, onTrySearch }: TrendingSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? assets : assets.slice(0, COLLAPSED_COUNT);
  const canExpand = assets.length > COLLAPSED_COUNT;

  return (
    <AssetSection id="trending-heading" title="Trending" description="Most popular by community">
      <div id="trending-list">
        <AssetGrid assets={visible} favorites={favorites} onSelect={onSelect} variant="plain" />
      </div>

      <div className="mt-4 flex flex-col items-center gap-3">
        {canExpand && (
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls="trending-list"
            onClick={() => setExpanded((value) => !value)}
            className="rounded-md border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50"
          >
            {expanded ? 'Show less' : `Show more (${assets.length - COLLAPSED_COUNT})`}
          </button>
        )}

        {(expanded || !canExpand) && (
          <p className="text-sm text-slate-500">
            Not seeing what you need?{' '}
            <button
              type="button"
              onClick={onTrySearch}
              className="font-medium text-slate-900 underline underline-offset-2 hover:no-underline"
            >
              Try a search
            </button>
          </p>
        )}
      </div>
    </AssetSection>
  );
}
