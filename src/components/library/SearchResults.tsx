import type { Asset } from '@/lib/types';
import { SearchIcon } from '@/components/ui/Icons';
import { AssetGrid, AssetSection } from './AssetCard';

interface SearchResultsProps {
  query: string;
  results: Asset[];
  /** Human-readable scope, e.g. "KPIs" or "all assets". */
  scopeLabel: string;
  /** Matches across every tab. Lets us suggest widening a tab-scoped search. */
  totalAcrossTabs: number;
  favorites: Set<string>;
  onSelect: (asset: Asset) => void;
  onSearchAllTabs?: () => void;
  onRequest: () => void;
}

/** The "Filtered view" from the flow: results for the current query, or a helpful empty state. */
export function SearchResults({
  query,
  results,
  scopeLabel,
  totalAcrossTabs,
  favorites,
  onSelect,
  onSearchAllTabs,
  onRequest,
}: SearchResultsProps) {
  const hiddenInOtherTabs = totalAcrossTabs - results.length;

  const widenSearch = onSearchAllTabs && hiddenInOtherTabs > 0 && (
    <button
      type="button"
      onClick={onSearchAllTabs}
      className="font-medium text-slate-900 underline underline-offset-2 hover:no-underline"
    >
      See {hiddenInOtherTabs} more in all assets
    </button>
  );

  if (results.length === 0) {
    return (
      <div className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
        <SearchIcon className="mx-auto size-6 text-slate-300" />
        {/* role=status so the "no results" outcome is announced as the user types. */}
        <p role="status" className="mt-3 text-sm font-medium text-slate-900">
          No matches for “{query}” in {scopeLabel}
        </p>
        <p className="mt-1 text-sm text-slate-500">Check the spelling or try a broader term.</p>
        <div className="mt-4 flex flex-col items-center gap-2 text-sm">
          {widenSearch}
          <button
            type="button"
            onClick={onRequest}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
          >
            Request this asset
          </button>
        </div>
      </div>
    );
  }

  return (
    <AssetSection
      id="results-heading"
      title="Results"
      description={
        <span role="status">
          {results.length} {results.length === 1 ? 'result' : 'results'} for “{query}” in {scopeLabel}
        </span>
      }
    >
      <AssetGrid assets={results} favorites={favorites} onSelect={onSelect} />
      <p className="mt-6 text-center text-sm text-slate-500">
        {widenSearch ? <>{widenSearch} · </> : 'Not seeing it? '}
        <button
          type="button"
          onClick={onRequest}
          className="font-medium text-slate-900 underline underline-offset-2 hover:no-underline"
        >
          Request an asset
        </button>
      </p>
    </AssetSection>
  );
}
