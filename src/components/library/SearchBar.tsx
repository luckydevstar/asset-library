'use client';

import { useRef, useState, type FocusEvent, type KeyboardEvent, type RefObject } from 'react';
import { ClockIcon, SearchIcon, XIcon } from '@/components/ui/Icons';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  /** The user committed to a search (Enter, or picked a recent term). Used to record recent searches. */
  onCommit: (value: string) => void;
  recentSearches: string[];
  onClearRecent: () => void;
  inputRef: RefObject<HTMLInputElement | null>;
}

/**
 * Search input with a clear button and a "recent searches" dropdown.
 *
 * Filtering happens as you type (the parent derives results from `value`).
 * Recent searches show only when the input is focused and empty, i.e. at the
 * moment someone is about to start a search.
 */
export function SearchBar({ value, onChange, onCommit, recentSearches, onClearRecent, inputRef }: SearchBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasFocus, setHasFocus] = useState(false);
  const showRecent = hasFocus && value === '' && recentSearches.length > 0;

  function handleBlur(event: FocusEvent) {
    // Focus moving from the input to a recent-search button (or back) should
    // keep the dropdown open. Only close when focus leaves the whole widget.
    if (!containerRef.current?.contains(event.relatedTarget as Node | null)) setHasFocus(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Escape') return;
    // Esc clears the query first, then dismisses the dropdown on a second press.
    if (value) onChange('');
    else setHasFocus(false);
  }

  function clear() {
    onChange('');
    inputRef.current?.focus();
  }

  function pickRecent(term: string) {
    onChange(term);
    onCommit(term);
    inputRef.current?.focus();
  }

  return (
    <div ref={containerRef} className="relative" onFocus={() => setHasFocus(true)} onBlur={handleBlur}>
      <form
        role="search"
        className="relative"
        onSubmit={(event) => {
          event.preventDefault();
          onCommit(value);
        }}
      >
        <label htmlFor="library-search" className="sr-only">
          Search assets
        </label>
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
        <input
          ref={inputRef}
          id="library-search"
          type="search"
          autoComplete="off"
          placeholder="Type to search..."
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-md border border-slate-200 bg-white py-2 pr-9 pl-9 text-sm shadow-xs placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 focus:outline-none [&::-webkit-search-cancel-button]:appearance-none"
        />
        {value && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <XIcon className="size-4" />
          </button>
        )}
      </form>

      {showRecent && (
        <div
          role="region"
          aria-label="Recent searches"
          className="absolute inset-x-0 top-full z-20 mt-1 rounded-md border border-slate-200 bg-white py-1 shadow-lg"
        >
          <div className="flex items-center justify-between px-3 py-1.5">
            <p className="text-[11px] font-medium tracking-wide text-slate-400 uppercase">Recent searches</p>
            <button
              type="button"
              onClick={() => {
                onClearRecent();
                inputRef.current?.focus();
              }}
              className="text-[11px] text-slate-500 hover:text-slate-900"
            >
              Clear
            </button>
          </div>
          <ul>
            {recentSearches.map((term) => (
              <li key={term}>
                <button
                  type="button"
                  onClick={() => pickRecent(term)}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                >
                  <ClockIcon className="size-3.5 shrink-0 text-slate-400" />
                  {term}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
