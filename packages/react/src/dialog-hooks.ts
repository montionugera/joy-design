import * as React from 'react';
import { lockBodyScroll, registerDialog, trapFocus } from './overlay-utils.js';

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

/**
 * The lifecycle every modal dialog shares (Modal, Drawer, ImagePreview): while `open`, lock body scroll, trap focus,
 * join the dialog stack, and hand focus back to the opener on the way out. `onKeyDown` runs for window keydowns that
 * no inner popover claimed (`defaultPrevented`) and only while this dialog is the topmost; the caller calls
 * `preventDefault()` for the keys it handles. The handler (and `onTeardown`) are read through refs, so the
 * effect is keyed on `open` alone. Must be called before the component's early `return null`.
 */
export function useDialog(
  open: boolean,
  dialogRef: React.MutableRefObject<HTMLElement | null>,
  onKeyDown: (e: KeyboardEvent) => void,
  onTeardown?: () => void
) {
  const openerRef = useOpener(open);
  const keyRef = React.useRef(onKeyDown);
  keyRef.current = onKeyDown;
  const teardownRef = React.useRef(onTeardown);
  teardownRef.current = onTeardown;

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    const previouslyFocused = openerRef.current;
    const unlock = lockBodyScroll();
    const handle = registerDialog();
    const cleanupTrap = trapFocus(dialog);
    const onKey = (e: KeyboardEvent) => {
      if (!e.defaultPrevented && handle.isTopmost()) keyRef.current(e);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      teardownRef.current?.();
      cleanupTrap();
      handle.unregister();
      unlock();
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [open]);
}
