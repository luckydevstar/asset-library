'use client';

import { useState, type FormEvent } from 'react';
import type { AssetType } from '@/lib/types';
import { ASSETS, ASSET_TYPE_META } from '@/lib/assets';
import { cx } from '@/lib/utils';
import { Dialog } from '@/components/ui/Dialog';
import { IconButton } from '@/components/ui/IconButton';
import { CheckIcon, XIcon } from '@/components/ui/Icons';

/**
 * What the request form should start with. Each entry point pre-fills it:
 *  - "Request access" in a restricted asset's modal → `{ kind: 'access', assetId }`
 *  - an empty search → `{ kind: 'new', name: <query> }`
 *  - the header "Request" button → `{ kind: 'new' }`
 */
export type RequestDraft = { kind: 'access'; assetId: string } | { kind: 'new'; name?: string };

interface RequestModalProps {
  draft: RequestDraft | null;
  onClose: () => void;
}

export function RequestModal({ draft, onClose }: RequestModalProps) {
  return (
    <Dialog open={draft !== null} onClose={onClose} labelledBy="request-modal-title" className="max-w-lg">
      {/* Remount on each open so the form never shows a previous request's state. */}
      {draft && <RequestForm key={JSON.stringify(draft)} draft={draft} onClose={onClose} />}
    </Dialog>
  );
}

const ASSET_TYPES = Object.keys(ASSET_TYPE_META) as AssetType[];

function RequestForm({ draft, onClose }: { draft: RequestDraft; onClose: () => void }) {
  const [kind, setKind] = useState(draft.kind);
  const [status, setStatus] = useState<'editing' | 'submitting' | 'sent'>('editing');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    // No backend here. Simulate the round trip so the loading and success
    // states can be reviewed. In production this would POST the FormData.
    await new Promise((resolve) => setTimeout(resolve, 700));
    setStatus('sent');
  }

  const header = (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
      <div>
        <h2 id="request-modal-title" className="text-base font-semibold">
          {kind === 'access' ? 'Request access' : 'Request an asset'}
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          {kind === 'access'
            ? 'Ask the owner for access so you can add this asset to your layouts.'
            : 'Can’t find what you need? Tell the library team what to build.'}
        </p>
      </div>
      <IconButton label="Close" onClick={onClose} className="-mt-1 -mr-2">
        <XIcon className="size-4" />
      </IconButton>
    </div>
  );

  if (status === 'sent') {
    return (
      <>
        {header}
        <div role="status" className="px-5 py-10 text-center">
          <span className="mx-auto grid size-10 place-items-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckIcon className="size-5" />
          </span>
          <p className="mt-3 text-sm font-semibold">Request sent</p>
          <p className="mt-1 text-sm text-slate-500">We’ll let you know as soon as the owner responds.</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Done
          </button>
        </div>
      </>
    );
  }

  const fieldClass =
    'mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-200 focus:outline-none';

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-col">
      {header}

      <div className="space-y-4 overflow-y-auto px-5 py-4">
        <fieldset>
          <legend className="text-xs font-medium text-slate-700">I need…</legend>
          <div className="mt-1 grid grid-cols-2 gap-2">
            {(
              [
                ['access', 'Access to an existing asset'],
                ['new', 'A new asset'],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className={cx(
                  'flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm',
                  kind === value ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-300',
                )}
              >
                <input
                  type="radio"
                  name="kind"
                  value={value}
                  checked={kind === value}
                  onChange={() => setKind(value)}
                  className="accent-slate-900"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        {kind === 'access' ? (
          <label className="block">
            <span className="text-xs font-medium text-slate-700">Asset</span>
            <select
              name="assetId"
              required
              defaultValue={draft.kind === 'access' ? draft.assetId : ''}
              className={fieldClass}
            >
              <option value="" disabled>
                Choose an asset
              </option>
              {ASSET_TYPES.map((type) => (
                <optgroup key={type} label={ASSET_TYPE_META[type].plural}>
                  {ASSETS.filter((asset) => asset.type === type).map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
        ) : (
          <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
            <label className="block">
              <span className="text-xs font-medium text-slate-700">What should it be called?</span>
              <input
                name="name"
                required
                defaultValue={draft.kind === 'new' ? draft.name : ''}
                placeholder="e.g. Distributor churn by market"
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-700">Type</span>
              <select name="type" defaultValue="kpi" className={fieldClass}>
                {ASSET_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {ASSET_TYPE_META[type].label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <label className="block">
          <span className="text-xs font-medium text-slate-700">Why do you need it?</span>
          <textarea
            name="reason"
            required
            minLength={10}
            rows={4}
            placeholder="e.g. I’m building the Q3 EMEA distributor layout and need this to show local-market reach."
            aria-describedby="reason-hint"
            className={cx(fieldClass, 'resize-y')}
          />
          <span id="reason-hint" className="mt-1 block text-[11px] text-slate-500">
            Shared with the asset owner. A clear reason gets a faster answer.
          </span>
        </label>
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {status === 'submitting' ? 'Sending…' : 'Send request'}
        </button>
      </div>
    </form>
  );
}
