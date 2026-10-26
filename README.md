# Library

Browse, search and inspect the assets (KPIs, layouts, data viz and storyboards) needed to report and present analysis.

```bash
npm install
npm run dev   # http://localhost:3000
```

**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, ApexCharts (charts only). No UI component or icon libraries. Modals, tabs, search and forms are hand-built.

---

## What's implemented

| Flow step | Where |
| --- | --- |
| **Library**: header, Request, search, tabs, Featured, Trending | `components/library/Library.tsx` |
| **Search to filter → Filtered view**: live results, scoped to the active tab | `SearchResults.tsx`, `lib/assets.ts#searchAssets` |
| Recent searches (focus an empty search box) | `SearchBar.tsx`, `hooks/useRecentSearches.ts` |
| Clear search (× button or Esc) | `SearchBar.tsx` |
| **Show more → Expanded section → "Not seeing… try search"** | `TrendingSection.tsx` |
| **Asset modal (base)**: description, tags, stats, preview, business questions, Favorite, Copy link | `components/asset-modal/AssetModal.tsx` |
| **KPI modal**: metric IDs, calculation, visuals available, affiliate applicability | `AssetDetails.tsx#KpiDetails` |
| **Data viz modal**: interactive chart, applicable KPI favorites, asset info | `AssetPreview.tsx`, `Chart.tsx`, `AssetDetails.tsx#DataVizDetails` |
| **Layout modal**: page count, KPIs being used, preview layout (paged) | `AssetPreview.tsx#PagedPreview`, `AssetDetails.tsx#LayoutDetails` |
| **Storyboard modal**: coupled KPIs & filters, applicable affiliates, request access | `AssetDetails.tsx#StoryboardDetails` |
| **Request…**: request access to an asset, or request a new one, with a reason | `components/RequestModal.tsx` |

## Project structure

```
src/
  app/                    page + root layout (server components)
  components/
    library/              page-level UI: search, tabs, cards, sections
    asset-modal/          base modal + type-specific sections, previews, chart
    RequestModal.tsx
    ui/                   Dialog, IconButton, Icons
  hooks/                  useLocalStorage, useFavorites, useRecentSearches
  lib/
    types.ts              Asset discriminated union
    assets.ts             mock catalogue, selectors, search
    assetLink.ts          ?asset= URL helpers (open / close / share)
    utils.ts
```

## Key decisions

- **The open asset lives in the URL (`?asset=<id>`), not in React state.** This is what makes *Copy link* meaningful. It also means the browser Back button closes the modal, and a shared link opens straight to the asset. See `lib/assetLink.ts` for how history is pushed/popped so Back never reopens a closed modal.
- **Native `<dialog>` for modals.** `showModal()` gives focus management, Esc handling, an inert background and top-layer stacking (the Request modal can open on top of an asset modal) without a modal library.
- **Static prerender.** The page is prerendered as static HTML. Only the modal reads search params, so it sits in its own `<Suspense>` boundary and doesn't opt the whole page into client rendering.
- **One modal shell, type-specific sections.** `Asset` is a discriminated union, so `switch (asset.type)` narrows to the right fields with no casts, and adding a type is a compile-time checklist.
- **Results are derived, not stored.** Search results are computed during render from `query` + `tab`, and `useDeferredValue` keeps typing responsive if filtering gets heavier.
- **Data access behind functions.** Components call `searchAssets`, `getAssetById` and friends, never the array directly, so swapping in an API is contained to `lib/assets.ts`.
- **Favorites and recent searches in localStorage** via `useSyncExternalStore`. There's no hydration mismatch, and every reader stays in sync across components and tabs.
- **ApexCharts for charts, behind one wrapper.** I read "no UI libraries" as no *component kits* (MUI, Chakra, shadcn), and treated a charting engine as a different category. Axes, tooltips and keyboard navigation are a lot to rebuild well by hand. Details in `Chart.tsx`:
  - It's loaded with `next/dynamic` (`ssr: false`) only when a KPI or data viz modal opens, so it adds nothing to the initial page load.
  - It uses the tree-shaken `/core` build with just the bar and line chart types plus keyboard navigation.
  - Callers pass plain `DataPoint[]` and never see Apex options, so the library could be swapped by changing one file.
- **Accessibility:** WAI-ARIA tabs pattern with arrow keys, labelled controls, and live regions for result counts and copy feedback. In the charts, focus the chart and step through points with the arrow keys; each value is announced.

## Assumptions

- **"Featured" is the default landing view**, and searching from it searches every asset type. The other tabs scope search to their type.
- **Data viz has no tab** because the wireframe shows only four. Data viz assets are reachable through Featured/Trending, search, and the "Visuals available" links in KPI modals.
- **"Type: Universal" in the stats row means scope**: Universal (all affiliates) vs Affiliate-specific.
- **Trending excludes Featured items**, so the landing view never shows the same card twice.
- **Restricted assets are visible but gated.** Users can see that they exist, read the details and favorite them, but the preview is locked and the primary action becomes *Request access*.
- **A search is saved as "recent"** when the user presses Enter, picks a recent term, or opens a result, not on every keystroke.
- **"Scroll to asset"** is ordinary page scrolling. The search bar and tabs are sticky so search stays one click away.
- **Requests have no backend.** Submission is simulated so the loading and success states can be reviewed.
- **Business questions are informational** and are not links or filters.

## Open questions

1. Should Data viz get its own tab, or is it intentionally secondary?
2. What exactly does "Used" count: adds to layouts, views, or unique users?
3. Where should favorites surface beyond the modal? A "My favorites" tab or filter seems likely.
4. Does a user have a home affiliate that should pre-filter the library?
5. Request flow: who approves, what's the expected turnaround, and where is the user notified?
6. Should business questions be actionable, e.g. open the asset with the matching filters applied?
7. The second job story mentions *capturing and annotating insights*. That isn't in the flow, so is it a later phase?
8. **ApexCharts licensing.** It's free only for organisations under $2M in annual revenue, and larger ones need a commercial licence. Is there an existing licence or an approved charting library? `Chart.tsx` is the only file that would change.

## Beyond the wireframe

- Related assets link to each other inside the modal (KPI → visuals, layout → KPIs, viz → KPIs).
- Tab-scoped searches offer "See N more in all assets" when other tabs have matches.
- Search terms match on name, description, tags, type and metric IDs, with all words required. `#comms` matches the tag.
- Data viz charts toggle between bar and line.
- A lock icon on cards flags restricted assets, and a bookmark flags favorites.
- The Request form is pre-filled from context: the restricted asset, or the query that returned nothing.
- *Copy link* falls back to `execCommand` when the Clipboard API is blocked (e.g. inside embedded preview iframes).

## Next steps (outside the timebox)

- **Tests:** unit tests for `searchAssets` and `useLocalStorage`, and Playwright for the modal / URL / Back-button flows.
- Full combobox pattern for search: arrow-key navigation through recent searches and `aria-activedescendant`.
- Sync `query` and `tab` to the URL so filtered views are shareable too.
- Real API with server-side (fuzzy, typo-tolerant) search, plus loading, error and empty-catalogue states.
- Modal enter/exit transitions (`@starting-style` + `transition-behavior: allow-discrete`).
- Dark mode (the chart wrapper would pass ApexCharts a dark theme).
