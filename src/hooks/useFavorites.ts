'use client';

import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';

const NO_FAVORITES: string[] = [];

/**
 * The user's favorited asset IDs.
 *
 * Stored locally for now. In production this would be a per-user API resource,
 * but the hook's interface wouldn't need to change.
 */
export function useFavorites() {
  const [ids, update] = useLocalStorage('library:favorites', NO_FAVORITES);

  // A Set gives O(1) `has()` for the many cards that check membership.
  const favorites = useMemo(() => new Set(ids), [ids]);

  const toggleFavorite = useCallback(
    (id: string) =>
      update((previous) =>
        previous.includes(id) ? previous.filter((existing) => existing !== id) : [...previous, id],
      ),
    [update],
  );

  return { favorites, toggleFavorite };
}
