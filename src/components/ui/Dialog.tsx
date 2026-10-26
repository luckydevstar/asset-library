'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cx } from '@/lib/utils';

interface DialogProps {
  open: boolean;
  /** Called for Esc, backdrop clicks and programmatic closes. Must be idempotent. */
  onClose: () => void;
  /** ID of the element that names the dialog (usually its heading). */
  labelledBy: string;
  /** Width constraint, e.g. `max-w-2xl`. */
  className?: string;
  children: ReactNode;
}

/**
 * Modal built on the native `<dialog>` element.
 *
 * `showModal()` gives us, for free: rendering in the top layer (no z-index or
 * portal juggling), focus moved into the dialog and returned on close, the
 * rest of the page made inert, and Esc to close. That covers most of what a
 * modal library would provide, without adding one.
 */
export function Dialog({ open, onClose, labelledBy, className, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  // Keep the element's imperative open state in sync with the `open` prop.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      // Fires for Esc *and* for `dialog.close()`, so `onClose` must tolerate
      // being called after the parent has already closed it.
      onClose={onClose}
      onClick={(event) => {
        // The content wrapper covers the whole dialog box, so a click whose
        // target is the <dialog> itself can only be on the backdrop.
        if (event.target === event.currentTarget) onClose();
      }}
      className={cx(
        'm-auto max-h-[90dvh] w-[calc(100%-2rem)] overflow-hidden rounded-xl bg-white p-0 text-slate-900 shadow-2xl',
        'backdrop:bg-slate-900/40 backdrop:backdrop-blur-[2px]',
        className,
      )}
    >
      <div className="flex max-h-[90dvh] flex-col">{children}</div>
    </dialog>
  );
}
