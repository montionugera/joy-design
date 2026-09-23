import * as React from 'react';

/**
 * Forward a ref to a component-owned element that also needs an internal ref. A callback ref, so the forwarded
 * ref is attached once per mount (not on every render) and is `null` while the element is not rendered.
 */
export function useMergedRef<T>(forwarded: React.ForwardedRef<T>, internal: React.MutableRefObject<T | null>) {
  return React.useCallback(
    (node: T | null) => {
      internal.current = node;
      if (typeof forwarded === 'function') forwarded(node);
      else if (forwarded) forwarded.current = node;
    },
    [forwarded, internal]
  );
}

/**
 * The element that had focus when `open` flipped to true, captured DURING RENDER. Children with `autoFocus` take
 * focus while React commits, before any effect of the dialog runs, so reading `document.activeElement` in an effect
 * would return an element inside the dialog and focus would be lost on close. The `wasOpen` guard makes it capture
 * only on the closed -> open transition (a re-render or a StrictMode double render keeps the first value).
 * Returns null on the server.
 */
export function useOpener(open: boolean): React.MutableRefObject<HTMLElement | null> {
  const opener = React.useRef<HTMLElement | null>(null);
  const wasOpen = React.useRef(false);
  if (open && !wasOpen.current) {
    opener.current = typeof document === 'undefined' ? null : (document.activeElement as HTMLElement | null);
  }
  wasOpen.current = open;
  return opener;
}
