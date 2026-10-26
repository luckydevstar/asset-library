/** Join class names, skipping falsy values. Keeps conditional Tailwind classes readable. */
export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

/**
 * `2024-06-27` → `06/27/2024` (the format used in the wireframe).
 * Done with string slicing rather than `Date` so the output never shifts a
 * day depending on the viewer's timezone.
 */
export function formatDate(isoDate: string) {
  const [year, month, day] = isoDate.split('-');
  return `${month}/${day}/${year}`;
}

/** Format a number with thousands separators and an optional unit suffix. */
export function formatValue(value: number, unit = '') {
  return `${value.toLocaleString('en-US')}${unit}`;
}

/**
 * Copy text to the clipboard.
 *
 * The async Clipboard API is blocked in some sandboxed iframes (embedded
 * previews like StackBlitz/CodeSandbox), so fall back to the legacy
 * `execCommand('copy')` approach. The temporary textarea is attached to
 * `container` because content outside an open modal `<dialog>` is inert and
 * can't be selected.
 */
export async function copyToClipboard(text: string, container: HTMLElement = document.body) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    container.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    textarea.remove();
    return ok;
  }
}
