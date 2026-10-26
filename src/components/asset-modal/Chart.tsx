'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';
import type { DataPoint } from '@/lib/types';
import { formatValue } from '@/lib/utils';

const HEIGHT = 220;

/**
 * ApexCharts, loaded lazily and on the client only.
 *
 * - `ssr: false`: ApexCharts measures and draws into the DOM, so there's
 *   nothing useful to prerender, and it touches `window` on import.
 * - Lazy: charts only appear inside the asset modal, so the library stays out
 *   of the initial page bundle until someone opens a KPI or data viz.
 * - `/core` + explicit registrations: tree-shakes away every chart type and
 *   feature we don't use (the full build is several times larger).
 */
const ReactApexChart = dynamic(
  async () => {
    await Promise.all([
      import('apexcharts/bar'),
      import('apexcharts/line'),
      import('apexcharts/features/keyboard'),
    ]);
    return import('react-apexcharts/core');
  },
  {
    ssr: false,
    // Same height as the chart so the modal doesn't jump when it loads.
    loading: () => <div className="animate-pulse rounded-md bg-slate-100" style={{ height: HEIGHT }} />,
  },
);

// Tailwind's slate palette, so the chart matches the rest of the UI.
const SLATE_700 = '#334155';
const SLATE_500 = '#64748b';
const SLATE_300 = '#cbd5e1';
const SLATE_200 = '#e2e8f0';

interface ChartProps {
  data: DataPoint[];
  kind: 'bar' | 'line';
  /** Series name, shown in the tooltip. */
  name: string;
  unit?: string;
  /** Accessible description of what the chart shows. */
  label: string;
}

/**
 * Thin wrapper that maps our `DataPoint[]` onto ApexCharts and applies the
 * app's look. Callers never touch Apex options, so swapping the library later
 * only means changing this file.
 */
export function Chart({ data, kind, name, unit = '', label }: ChartProps) {
  // Memoised because react-apexcharts deep-compares props on every render, and
  // the formatter functions below would otherwise look "changed" each time and
  // trigger a redraw.
  const series = useMemo(() => [{ name, data: data.map((point) => point.value) }], [name, data]);
  const options = useMemo<ApexOptions>(() => {
    // Round axis ticks to one decimal so we never show values like 2.3333%.
    const format = (value: number) => formatValue(Math.round(value * 10) / 10, unit);

    return {
      chart: {
        fontFamily: 'inherit',
        toolbar: { show: false },
        zoom: { enabled: false },
        parentHeightOffset: 0,
        animations: { enabled: true, speed: 300 },
        // Focus the chart, then use arrow keys to step through points. Each one
        // shows its tooltip and is announced to screen readers.
        accessibility: {
          enabled: true,
          description: label,
          keyboard: { enabled: true, navigation: { enabled: true, wrapAround: true } },
        },
      },
      colors: [SLATE_700],
      dataLabels: { enabled: false },
      // Right padding stops the last line marker being clipped at the edge.
      grid: { borderColor: SLATE_200, strokeDashArray: 4, padding: { right: 12 } },
      xaxis: {
        categories: data.map((point) => point.label),
        axisBorder: { color: SLATE_300 },
        axisTicks: { show: false },
        labels: { style: { colors: SLATE_500, fontSize: '11px' } },
        tooltip: { enabled: false },
      },
      yaxis: {
        tickAmount: 4,
        labels: { style: { colors: SLATE_500, fontSize: '11px' }, formatter: format },
      },
      plotOptions: { bar: { borderRadius: 3, columnWidth: '50%' } },
      // monotoneCubic stays smooth while keeping overshoot between points much smaller than 'smooth' does.
      stroke: kind === 'line' ? { curve: 'monotoneCubic', width: 2 } : { width: 0 },
      markers: {
        size: kind === 'line' ? 4 : 0,
        colors: ['#fff'],
        strokeColors: SLATE_700,
        strokeWidth: 2,
        hover: { size: 6 },
      },
      states: { hover: { filter: { type: 'darken', value: 0.15 } } },
      tooltip: { theme: 'dark', marker: { show: false }, y: { formatter: format } },
    };
  }, [data, kind, unit, label]);

  return (
    <figure className="rounded-lg bg-slate-50 p-3">
      {/* Keyed by kind so switching bar ↔ line remounts cleanly instead of morphing between types. */}
      <ReactApexChart key={kind} type={kind} series={series} options={options} height={HEIGHT} width="100%" />
      <figcaption className="sr-only">{label}</figcaption>
    </figure>
  );
}
