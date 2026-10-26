'use client';

import { Suspense, useDeferredValue, useMemo, useRef, useState } from 'react';
import type { Asset, AssetType } from '@/lib/types';
import { ASSET_TYPE_META, FEATURED_ASSETS, TRENDING_ASSETS, getAssetsByType, searchAssets } from '@/lib/assets';
import { openAsset } from '@/lib/assetLink';
import { useFavorites } from '@/hooks/useFavorites';
import { useRecentSearches } from '@/hooks/useRecentSearches';
import { InboxIcon } from '@/components/ui/Icons';
import { AssetModalRoute } from '@/components/asset-modal/AssetModal';
import { RequestModal, type RequestDraft } from '@/components/RequestModal';
import { AssetGrid, AssetSection } from './AssetCard';
import { SearchBar } from './SearchBar';
import { SearchResults } from './SearchResults';
import { Tabs } from './Tabs';
import { TrendingSection } from './TrendingSection';

type TabId = 'featured' | 'kpi' | 'layout' | 'storyboard';

/**
 * Tabs from the wireframe. "Featured" is the curated landing view, and
 * searching from it searches every asset type. Data viz has no tab in the
 * wireframe, so it is reachable through Featured/Trending, search and the
 * links inside KPI modals (see README: open questions).
 */
const TABS: readonly { id: TabId; label: string; type?: AssetType }[] = [
  { id: 'featured', label: 'Featured' },
  { id: 'kpi', label: 'KPI', type: 'kpi' },
  { id: 'layout', label: 'Layouts', type: 'layout' },
  { id: 'storyboard', label: 'Storyboards', type: 'storyboard' },
];

/**
 * The Library page. Owns the page-level UI state: query, active tab and the
 * request form. The open asset is deliberately *not* state here. It lives in
 * the URL (see `lib/assetLink.ts`) so links are shareable.
 */
export function Library() {
  const [query, setQuery] = useState('');
  const [tabId, setTabId] = useState<TabId>('featured');
  const [requestDraft, setRequestDraft] = useState<RequestDraft | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { recent, addRecent, clearRecent } = useRecentSearches();
  const { favorites } = useFavorites();

  const activeType = TABS.find((tab) => tab.id === tabId)?.type;

  // Results are derived during render, not stored in state. Deferring the
  // query keeps typing responsive if filtering ever gets expensive (bigger
  // catalogue, fuzzy matching) without adding a manual debounce.
  const deferredQuery = useDeferredValue(query.trim());
  const isSearching = deferredQuery !== '';
  const results = useMemo(() => searchAssets(deferredQuery, activeType), [deferredQuery, activeType]);
  const totalAcrossTabs = useMemo(
    () => (activeType ? searchAssets(deferredQuery).length : results.length),
    [deferredQuery, activeType, results],
  );

  function selectAsset(asset: Asset) {
    // Opening a result means the search was useful, so it's worth remembering.
    if (query.trim()) addRecent(query);
    openAsset(asset.id);
  }

  function focusSearch() {
    // The search bar is sticky, so it's already on screen. Focus is enough.
    searchInputRef.current?.focus();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex justify-end px-4 pt-4 sm:px-6">
        <button
          type="button"
          onClick={() => setRequestDraft({ kind: 'new' })}
          className="inline-flex items-center gap-1.5 rounded-md bg-slate-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-slate-700"
        >
          <InboxIcon className="size-3.5" />
          Request
        </button>
      </div>

      <header className="mx-auto max-w-2xl px-4 pt-2 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Library</h1>
        <p className="mt-3 text-sm text-slate-600">Browse for assets needed to report and present analysis.</p>
      </header>

      {/* Sticky so search and tabs stay reachable while scrolling long lists ("scroll to asset" in the flow). */}
      <div className="sticky top-0 z-10 mt-6 bg-slate-50/90 backdrop-blur">
        <div className="mx-auto max-w-2xl space-y-3 px-4 py-3">
          <SearchBar
            value={query}
            onChange={setQuery}
            onCommit={addRecent}
            recentSearches={recent}
            onClearRecent={clearRecent}
            inputRef={searchInputRef}
          />
          <Tabs tabs={TABS} value={tabId} onChange={setTabId} idPrefix="library" label="Asset type" />
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 pb-20">
        <div id="library-panel" role="tabpanel" aria-labelledby={`library-tab-${tabId}`}>
          {isSearching ? (
            <SearchResults
              query={deferredQuery}
              results={results}
              scopeLabel={activeType ? ASSET_TYPE_META[activeType].plural : 'all assets'}
              totalAcrossTabs={totalAcrossTabs}
              favorites={favorites}
              onSelect={selectAsset}
              onSearchAllTabs={activeType ? () => setTabId('featured') : undefined}
              onRequest={() => setRequestDraft({ kind: 'new', name: deferredQuery })}
            />
          ) : activeType ? (
            <AssetSection
              id="type-heading"
              title={ASSET_TYPE_META[activeType].plural}
              description={ASSET_TYPE_META[activeType].blurb}
            >
              <AssetGrid assets={getAssetsByType(activeType)} favorites={favorites} onSelect={selectAsset} />
            </AssetSection>
          ) : (
            <>
              <AssetSection id="featured-heading" title="Featured" description="Curated top picks from this week">
                <AssetGrid assets={FEATURED_ASSETS} favorites={favorites} onSelect={selectAsset} />
              </AssetSection>
              <TrendingSection
                assets={TRENDING_ASSETS}
                favorites={favorites}
                onSelect={selectAsset}
                onTrySearch={focusSearch}
              />
            </>
          )}
        </div>
      </main>

      {/* Isolated Suspense boundary: only the modal depends on search params. */}
      <Suspense fallback={null}>
        <AssetModalRoute onRequestAccess={(asset) => setRequestDraft({ kind: 'access', assetId: asset.id })} />
      </Suspense>

      <RequestModal draft={requestDraft} onClose={() => setRequestDraft(null)} />
    </div>
  );
}
