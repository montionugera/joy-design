/**
 * Remembers which element had focus when a dialog opened (Svelte twin of React's `useOpener` in dialog-hooks.ts).
 *
 * Call `sync(open)` from an `$effect.pre`: pre effects run before the DOM for the same update is created, so the
 * dialog's children (including an `autofocus` one) cannot have taken focus yet. Reading `document.activeElement`
 * in a plain `$effect` would return an element inside the dialog and focus would be lost on close. The `wasOpen`
 * guard captures only on the closed -> open transition, so re-runs while open keep the first value.
 * `current` is null on the server (`$effect.pre` never runs there, and `document` is guarded anyway).
 */
export function createOpenerTracker() {
  let opener: HTMLElement | null = null;
  let wasOpen = false;
  return {
    sync(open: boolean) {
      if (open && !wasOpen) {
        opener = typeof document === 'undefined' ? null : (document.activeElement as HTMLElement | null);
      }
      wasOpen = open;
    },
    get current(): HTMLElement | null {
      return opener;
    },
  };
}
