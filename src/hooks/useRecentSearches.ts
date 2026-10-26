'use client';

import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

const MAX_RECENT = 5;
const NO_RECENT: string[] = [];

/** Most recent searches first, de-duplicated case-insensitively and capped at {@link MAX_RECENT}. */
export function useRecentSearches() {
  const [recent, update] = useLocalStorage('library:recent-searches', NO_RECENT);

  const addRecent = useCallback(
    (term: string) => {
      const trimmed = term.trim();
      if (!trimmed) return;
      update((previous) =>
        [trimmed, ...previous.filter((t) => t.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_RECENT),
      );
    },
    [update],
  );

  const clearRecent = useCallback(() => update(() => NO_RECENT), [update]);

  return { recent, addRecent, clearRecent };
}
