'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';

/**
 * Listeners for writes made in *this* tab. The native `storage` event only
 * fires in other tabs, so without this, two components reading the same key
 * (e.g. a card's favorite badge and the modal's Favorite button) would drift
 * apart after a local write.
 */
const localListeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  localListeners.add(onChange);
  window.addEventListener('storage', onChange);
  return () => {
    localListeners.delete(onChange);
    window.removeEventListener('storage', onChange);
  };
}

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    // Access can throw when storage is disabled by browser settings.
    return null;
  }
}

function parse<T>(raw: string | null, fallback: T): T {
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Persist a JSON-serialisable value in localStorage and keep every reader of
 * the same key in sync, in this tab and across tabs.
 *
 * Built on `useSyncExternalStore`: the server render and the hydration pass
 * both see `fallback`, then the stored value is applied on the client. That
 * avoids hydration mismatches without a `useEffect` + `useState` dance.
 *
 * `fallback` must be referentially stable (define it at module scope).
 */
export function useLocalStorage<T>(key: string, fallback: T) {
  // Snapshot is the raw string: strings compare by value, so React only
  // re-renders when the stored data actually changes.
  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(key),
    () => null,
  );
  const value = useMemo(() => parse(raw, fallback), [raw, fallback]);

  const update = useCallback(
    (updater: (previous: T) => T) => {
      const next = updater(parse(readRaw(key), fallback));
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Quota or permission error. Persistence is best effort in this prototype.
      }
      localListeners.forEach((listener) => listener());
    },
    [key, fallback],
  );

  return [value, update] as const;
}
