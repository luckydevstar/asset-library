/**
 * The open asset lives in the URL (`?asset=<id>`) rather than React state so
 * that:
 *  - "Copy link" produces a URL that opens the same modal for a colleague,
 *  - the browser Back button closes the modal, as users expect.
 *
 * Next.js syncs `useSearchParams()` with native `history.pushState` /
 * `replaceState`, so we can update the URL without a navigation or re-fetch.
 */

export const ASSET_PARAM = 'asset';

/**
 * True when *we* pushed the current `?asset=` history entry. In that case
 * closing should pop it (history.back) so Back doesn't reopen the modal.
 * If the page was loaded from a shared link there is nothing of ours to pop,
 * so we replace the entry instead of navigating away from the app.
 */
let pushedByApp = false;

function currentUrl() {
  return new URL(window.location.href);
}

function toRelative(url: URL) {
  return `${url.pathname}${url.search}${url.hash}`;
}

export function openAsset(id: string) {
  const url = currentUrl();
  const alreadyOpen = url.searchParams.has(ASSET_PARAM);
  url.searchParams.set(ASSET_PARAM, id);

  if (alreadyOpen) {
    // Jumping between related assets inside the modal: swap in place so a
    // single Back/close still returns to the library.
    window.history.replaceState(null, '', toRelative(url));
  } else {
    window.history.pushState(null, '', toRelative(url));
    pushedByApp = true;
  }
}

export function closeAsset() {
  const url = currentUrl();
  // Already closed, e.g. this is the dialog's `close` event firing after the
  // user pressed Back. Nothing left to do.
  if (!url.searchParams.has(ASSET_PARAM)) return;

  if (pushedByApp) {
    pushedByApp = false;
    window.history.back();
    return;
  }
  url.searchParams.delete(ASSET_PARAM);
  window.history.replaceState(null, '', toRelative(url));
}

/** Absolute, shareable URL for an asset. Drops any other params on purpose. */
export function getAssetShareUrl(id: string) {
  const url = new URL(window.location.pathname, window.location.origin);
  url.searchParams.set(ASSET_PARAM, id);
  return url.toString();
}
