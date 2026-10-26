'use client';

import { useRef, type KeyboardEvent } from 'react';
import { cx } from '@/lib/utils';

export interface TabItem<T extends string> {
  id: T;
  label: string;
}

interface TabsProps<T extends string> {
  tabs: readonly TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  /** Prefix for generated tab IDs; the panel uses `${idPrefix}-panel`. */
  idPrefix: string;
  label: string;
}

/**
 * Segmented tab list following the WAI-ARIA tabs pattern: one tab stop
 * (roving tabindex), arrow keys / Home / End to move, selection follows focus.
 */
export function Tabs<T extends string>({ tabs, value, onChange, idPrefix, label }: TabsProps<T>) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleKeyDown(event: KeyboardEvent, index: number) {
    const last = tabs.length - 1;
    const keyToIndex: Record<string, number> = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    };
    const nextIndex = keyToIndex[event.key];
    if (nextIndex === undefined) return;

    event.preventDefault();
    onChange(tabs[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <div role="tablist" aria-label={label} className="grid grid-cols-4 gap-1 rounded-lg bg-slate-100 p-1">
      {tabs.map((tab, index) => {
        const selected = tab.id === value;
        return (
          <button
            key={tab.id}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cx(
              'rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-slate-900',
              selected ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
